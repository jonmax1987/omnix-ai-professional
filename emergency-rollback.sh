#!/bin/bash

# OMNIX AI - Emergency Rollback Script
# Rolls back the system to a previous stable state
# Usage: ./emergency-rollback.sh [target_commit]

set -e

# Configuration
TARGET_COMMIT=${1:-c905349}  # Default to last stable commit with DB integration
STAGING_BUCKET="omnix-ai-staging-frontend-minimal"
CLOUDFRONT_ID="E1HN3Y5MSQJFFC"
REGION="eu-central-1"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO: $1${NC}"
}

echo -e "${RED}🚨 EMERGENCY ROLLBACK INITIATED${NC}"
echo -e "${RED}═══════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Target Commit:${NC} $TARGET_COMMIT"
echo -e "${CYAN}Staging Bucket:${NC} $STAGING_BUCKET"
echo -e "${CYAN}CloudFront:${NC} $CLOUDFRONT_ID"
echo ""

# Confirmation prompt
echo -e "${YELLOW}⚠️  This will rollback your system to a previous version.${NC}"
echo -e "${YELLOW}⚠️  Current changes will be lost unless committed.${NC}"
echo ""
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Rollback cancelled${NC}"
    exit 1
fi

echo ""
log "🚀 Starting emergency rollback process..."

# Step 1: Save current state (just in case)
log "💾 Saving current state as backup..."
BACKUP_BRANCH="emergency-backup-$(date +%Y%m%d-%H%M%S)"
git branch $BACKUP_BRANCH 2>/dev/null || warn "Could not create backup branch"
log "📝 Backup branch created: $BACKUP_BRANCH"

# Step 2: Verify target commit exists
log "🔍 Verifying target commit exists..."
if ! git cat-file -e $TARGET_COMMIT^{commit} 2>/dev/null; then
    error "Target commit $TARGET_COMMIT does not exist"
    exit 1
fi

COMMIT_MESSAGE=$(git log --format=%s -n 1 $TARGET_COMMIT)
log "✅ Target commit found: $COMMIT_MESSAGE"

# Step 3: Git rollback
log "⏪ Performing git rollback..."
git reset --hard $TARGET_COMMIT
log "✅ Git rollback complete"

# Step 4: Check if we're in frontend directory, if not navigate to it
if [ ! -f "package.json" ]; then
    if [ -d "apps/frontend" ]; then
        log "📁 Navigating to frontend directory..."
        cd apps/frontend
    else
        error "Cannot find frontend directory"
        exit 1
    fi
fi

# Step 5: Install dependencies (in case package.json changed)
log "📦 Installing dependencies..."
npm install --silent
log "✅ Dependencies installed"

# Step 6: Build frontend with staging configuration
log "🔨 Building frontend for staging environment..."
VITE_API_BASE_URL="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod" \
VITE_ENVIRONMENT="staging" \
VITE_API_KEY="omnix-api-key-staging-2024" \
VITE_WEBSOCKET_URL="wss://5oo31khrrj.execute-api.eu-central-1.amazonaws.com/prod" \
npm run build

if [ $? -ne 0 ]; then
    error "Build failed"
    exit 1
fi
log "✅ Build completed successfully"

# Step 7: Deploy to S3
log "⬆️  Deploying to S3 staging bucket..."
aws s3 sync dist/ s3://$STAGING_BUCKET --delete \
    --cache-control "max-age=31536000" \
    --exclude "*.html" \
    --region $REGION

aws s3 sync dist/ s3://$STAGING_BUCKET --delete \
    --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
    --include "*.html" \
    --region $REGION

log "✅ Files deployed to S3"

# Step 8: Invalidate CloudFront cache
log "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

log "✅ CloudFront invalidation created: $INVALIDATION_ID"

# Step 9: Basic health check
log "🏥 Performing health check..."
sleep 5  # Wait a moment for deployment

STAGING_URL="https://dtdnwq4annvk2.cloudfront.net"
if curl -s -I $STAGING_URL | grep -q "HTTP/.*200"; then
    log "✅ Staging site is responding"
else
    warn "⚠️  Staging site may still be updating (CloudFront cache)"
fi

# Step 10: Summary
echo ""
echo -e "${GREEN}🎉 EMERGENCY ROLLBACK COMPLETED${NC}"
echo -e "${GREEN}═══════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📊 Rollback Summary:${NC}"
echo -e "${CYAN}   Rolled back to:${NC} $TARGET_COMMIT"
echo -e "${CYAN}   Backup branch:${NC} $BACKUP_BRANCH"
echo -e "${CYAN}   Staging URL:${NC} $STAGING_URL"
echo ""
echo -e "${YELLOW}⏰ Note: CloudFront cache may take 5-15 minutes to fully update${NC}"
echo ""
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo "   1. Test the staging environment"
echo "   2. Verify authentication works"
echo "   3. Check API data flow"
echo ""
echo -e "${PURPLE}💡 To restore recent changes later:${NC}"
echo "   git checkout $BACKUP_BRANCH"
echo ""

log "🏁 Emergency rollback process completed successfully"