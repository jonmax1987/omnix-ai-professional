#!/bin/bash
# OMNIX AI - Protected Staging Deployment Script
# This script ensures consistent staging environment settings

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 OMNIX AI - Staging Deployment${NC}"
echo "======================================="

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}📍 Working directory: $FRONTEND_DIR${NC}"

# Validate we're in the right directory
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo -e "${RED}❌ Error: Not in frontend directory. Expected package.json to exist.${NC}"
    exit 1
fi

# Check if staging template exists
if [ ! -f "$FRONTEND_DIR/.env.staging.template" ]; then
    echo -e "${RED}❌ Error: .env.staging.template not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment templates found${NC}"

# Load staging configuration
echo -e "${YELLOW}📋 Loading staging configuration...${NC}"
source "$FRONTEND_DIR/.env.staging.template"

# Validate required environment variables
required_vars=("VITE_API_BASE_URL" "VITE_ENVIRONMENT" "VITE_API_KEY" "VITE_WEBSOCKET_URL" "S3_BUCKET_NAME" "CLOUDFRONT_DISTRIBUTION_ID")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Error: Required variable $var is not set in .env.staging.template${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ All required environment variables validated${NC}"

# Display configuration (mask sensitive data)
echo -e "${BLUE}🔧 Staging Configuration:${NC}"
echo "  API URL: $VITE_API_BASE_URL"
echo "  Environment: $VITE_ENVIRONMENT"
echo "  API Key: ${VITE_API_KEY:0:20}..."
echo "  WebSocket: $VITE_WEBSOCKET_URL"
echo "  S3 Bucket: $S3_BUCKET_NAME"
echo "  CloudFront: $CLOUDFRONT_DISTRIBUTION_ID"

# Confirmation prompt
read -p "🤔 Deploy to staging with above configuration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Deployment cancelled${NC}"
    exit 1
fi

echo -e "${BLUE}🔨 Building frontend...${NC}"

# Build with staging environment variables
cd "$FRONTEND_DIR"

env VITE_API_BASE_URL="$VITE_API_BASE_URL" \
    VITE_ENVIRONMENT="$VITE_ENVIRONMENT" \
    VITE_API_KEY="$VITE_API_KEY" \
    VITE_WEBSOCKET_URL="$VITE_WEBSOCKET_URL" \
    npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${BLUE}☁️  Deploying to S3...${NC}"

# Deploy to S3
aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ S3 deployment successful${NC}"
else
    echo -e "${RED}❌ S3 deployment failed${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"

# Invalidate CloudFront cache
INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*" --output text --query 'Invalidation.Id')

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CloudFront invalidation created: $INVALIDATION_ID${NC}"
else
    echo -e "${RED}❌ CloudFront invalidation failed${NC}"
    exit 1
fi

# Record deployment
echo -e "${BLUE}📝 Recording deployment...${NC}"
echo "$(date '+%Y-%m-%d %H:%M:%S') - Staging deployment successful - CloudFront: $INVALIDATION_ID" >> "$FRONTEND_DIR/deployment.log"

echo ""
echo -e "${GREEN}🎉 Staging Deployment Complete!${NC}"
echo "======================================="
echo -e "🌐 Frontend URL: ${BLUE}https://dtdnwq4annvk2.cloudfront.net${NC}"
echo -e "🔗 API Base URL: ${BLUE}$VITE_API_BASE_URL${NC}"
echo -e "📋 Invalidation ID: ${BLUE}$INVALIDATION_ID${NC}"
echo ""
echo -e "${YELLOW}⏱️  CloudFront cache invalidation may take 5-15 minutes to complete${NC}"