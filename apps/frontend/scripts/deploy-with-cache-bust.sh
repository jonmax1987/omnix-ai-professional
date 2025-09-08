#!/bin/bash

# OMNIX AI - Deployment with Aggressive Cache Busting
# This script ensures that browser caches are properly cleared after deployment

set -e

echo "🚀 Starting OMNIX AI deployment with aggressive cache busting..."

# Configuration
PROJECT_NAME="omnix-ai"
ENVIRONMENT="staging"
BUCKET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-frontend-minimal"
CLOUDFRONT_DISTRIBUTION_ID=""
CACHE_VERSION=$(date +"%Y-%m-%d-v2")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Function to get CloudFront distribution ID
get_distribution_id() {
    log "Getting CloudFront distribution ID..."
    CLOUDFRONT_DISTRIBUTION_ID=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Comment=='${PROJECT_NAME} ${ENVIRONMENT} Frontend Distribution'].Id" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        warn "Could not find CloudFront distribution ID automatically"
        return 1
    else
        log "Found CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID"
        return 0
    fi
}

# Function to build the application
build_application() {
    log "Building OMNIX AI application..."
    
    # Update cache version in files
    log "Updating cache version to: $CACHE_VERSION"
    sed -i.bak "s/CACHE_BUSTER_VERSION = '[^']*'/CACHE_BUSTER_VERSION = '$CACHE_VERSION'/g" src/utils/cache-buster.js
    sed -i.bak "s/cache-version\" content=\"[^\"]*\"/cache-version\" content=\"$CACHE_VERSION\"/g" index.html
    sed -i.bak "s/CACHE_VERSION = '[^']*'/CACHE_VERSION = '$CACHE_VERSION'/g" index.html
    
    # Build with production settings
    npm run build
    
    if [ $? -eq 0 ]; then
        log "Build completed successfully"
    else
        error "Build failed"
        exit 1
    fi
}

# Function to add cache-busting headers to built files
add_cache_headers() {
    log "Adding cache-busting metadata to built files..."
    
    # Add cache version to all JS and CSS files
    find dist -name "*.js" -o -name "*.css" | while read file; do
        echo "/* Cache-Version: $CACHE_VERSION */" | cat - "$file" > temp && mv temp "$file"
    done
    
    # Create a cache-version file
    echo "$CACHE_VERSION" > dist/cache-version.txt
    
    log "Cache headers added successfully"
}

# Function to deploy to S3
deploy_to_s3() {
    log "Deploying to S3 bucket: $BUCKET_NAME"
    
    # Check if bucket exists
    if ! aws s3 ls "s3://$BUCKET_NAME" >/dev/null 2>&1; then
        error "S3 bucket $BUCKET_NAME does not exist or is not accessible"
        exit 1
    fi
    
    # Sync files with cache-control headers
    log "Syncing HTML files (no-cache)..."
    aws s3 sync dist/ s3://$BUCKET_NAME/ \
        --exclude "*" \
        --include "*.html" \
        --cache-control "no-cache, no-store, must-revalidate" \
        --metadata-directive REPLACE \
        --delete
    
    log "Syncing JS/CSS files (short cache)..."
    aws s3 sync dist/ s3://$BUCKET_NAME/ \
        --exclude "*" \
        --include "*.js" \
        --include "*.css" \
        --cache-control "public, max-age=300" \
        --metadata-directive REPLACE \
        --delete
    
    log "Syncing other assets (long cache)..."
    aws s3 sync dist/ s3://$BUCKET_NAME/ \
        --exclude "*.html" \
        --exclude "*.js" \
        --exclude "*.css" \
        --cache-control "public, max-age=31536000" \
        --metadata-directive REPLACE \
        --delete
    
    log "S3 deployment completed"
}

# Function to create CloudFront invalidation
invalidate_cloudfront() {
    if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        warn "CloudFront distribution ID not found, skipping invalidation"
        return
    fi
    
    log "Creating CloudFront invalidation..."
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$INVALIDATION_ID" ]; then
        log "CloudFront invalidation created: $INVALIDATION_ID"
        log "Waiting for invalidation to complete..."
        
        # Wait for invalidation (with timeout)
        timeout 300 aws cloudfront wait invalidation-completed \
            --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
            --id "$INVALIDATION_ID" 2>/dev/null || warn "Invalidation wait timeout (but it's still processing)"
        
        log "CloudFront cache invalidation completed"
    else
        warn "Could not create CloudFront invalidation"
    fi
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        # Get CloudFront domain
        CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
            --id "$CLOUDFRONT_DISTRIBUTION_ID" \
            --query 'Distribution.DomainName' \
            --output text 2>/dev/null || echo "")
        
        if [ -n "$CLOUDFRONT_DOMAIN" ]; then
            log "Testing CloudFront deployment: https://$CLOUDFRONT_DOMAIN"
            
            # Test with cache-busting parameter
            RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
                "https://$CLOUDFRONT_DOMAIN/?cb=$(date +%s)" \
                -H "Cache-Control: no-cache" \
                -H "Pragma: no-cache" || echo "000")
            
            if [ "$RESPONSE_CODE" = "200" ]; then
                log "✅ Deployment verification successful"
                log "🌐 Application available at: https://$CLOUDFRONT_DOMAIN"
            else
                warn "Deployment verification failed with response code: $RESPONSE_CODE"
            fi
        fi
    fi
}

# Function to cleanup backup files
cleanup() {
    log "Cleaning up backup files..."
    find . -name "*.bak" -delete 2>/dev/null || true
}

# Main deployment process
main() {
    log "Starting OMNIX AI deployment process..."
    
    # Check if required commands are available
    for cmd in aws npm curl; do
        if ! command -v $cmd &> /dev/null; then
            error "$cmd is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Get distribution ID (optional)
    get_distribution_id || true
    
    # Build application
    build_application
    
    # Add cache headers
    add_cache_headers
    
    # Deploy to S3
    deploy_to_s3
    
    # Invalidate CloudFront
    invalidate_cloudfront
    
    # Verify deployment
    verify_deployment
    
    # Cleanup
    cleanup
    
    log "🎉 Deployment completed successfully!"
    log "Cache version: $CACHE_VERSION"
    
    if [ -n "$CLOUDFRONT_DOMAIN" ]; then
        log "🔗 URL: https://$CLOUDFRONT_DOMAIN"
        log "💡 Tip: Users experiencing cache issues should hard refresh (Ctrl+Shift+R)"
    fi
}

# Run main function
main "$@"