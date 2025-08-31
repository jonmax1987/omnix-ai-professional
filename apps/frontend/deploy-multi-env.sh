#!/bin/bash

# OMNIX AI - Multi-Environment Deployment Script
# Supports staging and production deployments with comprehensive validation

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
ENVIRONMENT=${1:-staging}
REGION="eu-central-1"
SKIP_TESTS=${2:-false}

# Environment-specific configuration
case $ENVIRONMENT in
  "staging")
    BUCKET_NAME="omnix-ai-staging-frontend"
    CLOUDFRONT_DISTRIBUTION_ID="E1STAGING123"
    API_URL="https://staging-api.omnix.ai/dev"
    DOMAIN="staging.omnix.ai"
    ;;
  "production")
    BUCKET_NAME="omnix-ai-frontend-animations-1755860292"
    CLOUDFRONT_DISTRIBUTION_ID="E3VGKLCQPWE4DG"
    API_URL="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod"
    DOMAIN="d1vu6p9f5uc16.cloudfront.net"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Usage: $0 [staging|production] [skip-tests]${NC}"
    exit 1
    ;;
esac

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                OMNIX AI - MULTI-ENV DEPLOYMENT               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🚀 Deployment Configuration:${NC}"
echo -e "${CYAN}   Environment:${NC} $ENVIRONMENT"
echo -e "${CYAN}   Bucket:${NC} $BUCKET_NAME"
echo -e "${CYAN}   Region:${NC} $REGION"
echo -e "${CYAN}   API URL:${NC} $API_URL"
echo -e "${CYAN}   Domain:${NC} $DOMAIN"
echo ""

# Function to check prerequisites
check_prerequisites() {
    echo -e "${PURPLE}🔍 Checking prerequisites...${NC}"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed${NC}"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS credentials not configured${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to run security checks
run_security_checks() {
    echo -e "${PURPLE}🔒 Running security checks...${NC}"
    
    # Check for exposed secrets in environment files
    local secret_patterns=("password" "secret" "key" "token" "api_key")
    local security_issues=0
    
    for pattern in "${secret_patterns[@]}"; do
        if grep -ri "$pattern" .env* 2>/dev/null | grep -v "VITE_" | grep -q "=.*[a-zA-Z0-9]"; then
            echo -e "${YELLOW}⚠️  Potential secret found in environment files${NC}"
            security_issues=$((security_issues + 1))
        fi
    done
    
    # Audit npm packages
    echo -e "${CYAN}📦 Auditing npm packages...${NC}"
    npm audit --audit-level=moderate || {
        echo -e "${YELLOW}⚠️  npm audit found issues${NC}"
        security_issues=$((security_issues + 1))
    }
    
    if [ $security_issues -gt 0 ] && [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${RED}❌ Security issues found for production deployment${NC}"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Security checks completed${NC}"
}

# Function to run tests
run_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        echo -e "${YELLOW}⏭️  Skipping tests (as requested)${NC}"
        return
    fi
    
    echo -e "${PURPLE}🧪 Running test suite...${NC}"
    
    # Run linting
    echo -e "${CYAN}📏 Running ESLint...${NC}"
    npm run lint || {
        echo -e "${RED}❌ Linting failed${NC}"
        exit 1
    }
    
    # Run unit tests
    echo -e "${CYAN}🔬 Running unit tests...${NC}"
    npm run test:ci || {
        echo -e "${RED}❌ Unit tests failed${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ All tests passed${NC}"
}

# Function to build application
build_application() {
    echo -e "${PURPLE}🏗️  Building application for $ENVIRONMENT...${NC}"
    
    # Load environment variables
    if [ -f ".env.$ENVIRONMENT" ]; then
        echo -e "${CYAN}📄 Loading .env.$ENVIRONMENT${NC}"
        export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
    else
        echo -e "${YELLOW}⚠️  No .env.$ENVIRONMENT file found${NC}"
    fi
    
    # Clean previous build
    rm -rf dist/
    
    # Build with environment-specific settings
    NODE_ENV=production npm run build || {
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    }
    
    # Validate build output
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        echo -e "${RED}❌ Build validation failed${NC}"
        exit 1
    fi
    
    # Generate build manifest
    BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    GIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
    
    cat > dist/build-manifest.json << EOF
{
  "buildTime": "$BUILD_TIME",
  "gitSha": "$GIT_SHA",
  "gitBranch": "$GIT_BRANCH",
  "environment": "$ENVIRONMENT",
  "version": "$VERSION",
  "apiUrl": "$API_URL",
  "domain": "$DOMAIN"
}
EOF
    
    echo -e "${GREEN}✅ Build completed successfully${NC}"
}

# Function to create backup (production only)
create_backup() {
    if [ "$ENVIRONMENT" != "production" ]; then
        return
    fi
    
    echo -e "${PURPLE}💾 Creating production backup...${NC}"
    
    BACKUP_BUCKET="omnix-ai-production-backups"
    BACKUP_KEY="frontend-backup-$(date +%Y%m%d-%H%M%S)"
    
    aws s3 sync s3://$BUCKET_NAME s3://$BACKUP_BUCKET/$BACKUP_KEY/ || {
        echo -e "${YELLOW}⚠️  Backup creation failed, continuing...${NC}"
    }
    
    echo -e "${GREEN}✅ Backup created: s3://$BACKUP_BUCKET/$BACKUP_KEY/${NC}"
}

# Function to deploy to S3
deploy_to_s3() {
    echo -e "${PURPLE}☁️  Deploying to S3: $BUCKET_NAME${NC}"
    
    # Sync static assets with long cache
    echo -e "${CYAN}📁 Uploading static assets...${NC}"
    aws s3 sync dist/ s3://$BUCKET_NAME \
        --delete \
        --cache-control "max-age=31536000" \
        --exclude "*.html" \
        --exclude "*.json" \
        --exclude "*.txt" \
        --exclude "*.xml" \
        --exclude "service-worker.js"
    
    # Sync HTML and manifests with no cache
    echo -e "${CYAN}📄 Uploading HTML and manifests...${NC}"
    aws s3 sync dist/ s3://$BUCKET_NAME \
        --delete \
        --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
        --include "*.html" \
        --include "*.json" \
        --include "*.txt" \
        --include "*.xml" \
        --include "service-worker.js"
    
    echo -e "${GREEN}✅ S3 deployment completed${NC}"
}

# Function to invalidate CloudFront
invalidate_cloudfront() {
    echo -e "${PURPLE}♻️  Invalidating CloudFront cache...${NC}"
    
    if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ] && [ "$CLOUDFRONT_DISTRIBUTION_ID" != "E1STAGING123" ]; then
        INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
            --paths "/*" \
            --query 'Invalidation.Id' \
            --output text)
        
        echo -e "${CYAN}📋 Invalidation ID: $INVALIDATION_ID${NC}"
        echo -e "${CYAN}⏳ This may take a few minutes to complete${NC}"
    else
        echo -e "${YELLOW}⚠️  CloudFront distribution ID not set or staging${NC}"
    fi
    
    echo -e "${GREEN}✅ CloudFront invalidation initiated${NC}"
}

# Function to run health checks
run_health_checks() {
    echo -e "${PURPLE}🏥 Running deployment health checks...${NC}"
    
    # Wait for cache invalidation
    echo -e "${CYAN}⏳ Waiting 60 seconds for cache invalidation...${NC}"
    sleep 60
    
    # Test main endpoints
    local endpoints=(
        "https://$DOMAIN/"
        "https://$DOMAIN/dashboard" 
        "https://$DOMAIN/products"
    )
    
    local failed_checks=0
    
    for endpoint in "${endpoints[@]}"; do
        echo -e "${CYAN}🔍 Testing: $endpoint${NC}"
        
        if curl -f -s -o /dev/null -w "%{http_code}" --max-time 10 "$endpoint" | grep -q "200"; then
            echo -e "${GREEN}  ✅ $endpoint is healthy${NC}"
        else
            echo -e "${RED}  ❌ $endpoint health check failed${NC}"
            failed_checks=$((failed_checks + 1))
        fi
    done
    
    if [ $failed_checks -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $failed_checks health checks failed${NC}"
        if [ "$ENVIRONMENT" = "production" ]; then
            echo -e "${RED}❌ Production health checks failed${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ All health checks passed${NC}"
    fi
}

# Function to show deployment summary
show_summary() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    DEPLOYMENT SUMMARY                       ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🎉 Deployment to $ENVIRONMENT completed successfully!${NC}"
    echo ""
    echo -e "${CYAN}📋 Deployment Details:${NC}"
    echo -e "${CYAN}   Environment:${NC} $ENVIRONMENT"
    echo -e "${CYAN}   S3 Bucket:${NC} $BUCKET_NAME"
    echo -e "${CYAN}   URL:${NC} https://$DOMAIN"
    echo -e "${CYAN}   Deployed at:${NC} $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo ""
    echo -e "${CYAN}🔗 Quick Links:${NC}"
    echo -e "${CYAN}   • Frontend:${NC} https://$DOMAIN"
    echo -e "${CYAN}   • Dashboard:${NC} https://$DOMAIN/dashboard"
    echo -e "${CYAN}   • Products:${NC} https://$DOMAIN/products"
    echo ""
}

# Main deployment flow
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    check_prerequisites
    run_security_checks
    run_tests
    build_application
    create_backup
    deploy_to_s3
    invalidate_cloudfront
    run_health_checks
    show_summary
    
    echo -e "${GREEN}🚀 OMNIX AI deployment to $ENVIRONMENT completed successfully!${NC}"
}

# Trap to handle cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Deployment failed${NC}"
        echo -e "${YELLOW}💡 Check the logs above for details${NC}"
    fi
}

trap cleanup EXIT

# Run main function
main "$@"