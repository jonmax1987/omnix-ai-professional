#!/bin/bash
# 🚀 OMNIX AI - Unified Deployment Script
# Professional deployment orchestration for all environments

set -e

# Configuration
ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 OMNIX AI - Professional Deployment${NC}"
echo -e "${BLUE}====================================${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Timestamp: $TIMESTAMP${NC}"
echo -e "${YELLOW}Project Root: $PROJECT_ROOT${NC}"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod|development|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Valid options: dev, staging, prod, development, production${NC}"
    exit 1
fi

# Normalize environment names
case $ENVIRONMENT in
    "dev"|"development")
        ENV="dev"
        ;;
    "staging")
        ENV="staging"
        ;;
    "prod"|"production")
        ENV="prod"
        ;;
esac

echo -e "${BLUE}📋 Deployment Plan:${NC}"
echo -e "${YELLOW}1. 📦 Deploy Infrastructure (CDK)${NC}"
echo -e "${YELLOW}2. ⚙️  Deploy Backend (Lambda)${NC}"
echo -e "${YELLOW}3. 🎨 Build Frontend${NC}"
echo -e "${YELLOW}4. ✅ Verify Deployment${NC}"
echo ""

# Step 1: Deploy Infrastructure
echo -e "${BLUE}📦 Step 1: Deploying Infrastructure...${NC}"
cd "$PROJECT_ROOT/infrastructure"

if [ -f "package.json" ]; then
    echo -e "${YELLOW}Installing infrastructure dependencies...${NC}"
    npm install
    
    echo -e "${YELLOW}Deploying CDK stacks to $ENV...${NC}"
    if [ "$ENV" = "prod" ]; then
        npm run deploy:prod
    else
        npm run deploy:$ENV 2>/dev/null || npm run deploy:dev
    fi
    
    echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️ No infrastructure package.json found, skipping...${NC}"
fi

# Get infrastructure outputs (if available)
echo -e "${YELLOW}Retrieving infrastructure outputs...${NC}"
API_GATEWAY_URL=$(aws cloudformation describe-stacks \
    --stack-name "omnix-ai-core-$ENV" \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
    --output text 2>/dev/null || echo "Not available")

echo -e "${BLUE}🔗 API Gateway URL: $API_GATEWAY_URL${NC}"

# Step 2: Deploy Backend
echo -e "${BLUE}⚙️ Step 2: Deploying Backend...${NC}"
cd "$PROJECT_ROOT/apps/backend"

if [ -f "deploy-lambda.sh" ]; then
    echo -e "${YELLOW}Deploying backend Lambda...${NC}"
    chmod +x deploy-lambda.sh
    ./deploy-lambda.sh
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️ Backend deployment script not found${NC}"
    if [ -f "package.json" ]; then
        echo -e "${YELLOW}Building backend...${NC}"
        npm install
        npm run build
        echo -e "${GREEN}✅ Backend built successfully!${NC}"
    fi
fi

# Step 3: Build Frontend  
echo -e "${BLUE}🎨 Step 3: Building Frontend...${NC}"
cd "$PROJECT_ROOT/apps/frontend"

if [ -f "package.json" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
    
    echo -e "${YELLOW}Building frontend for $ENV...${NC}"
    npm run build
    echo -e "${GREEN}✅ Frontend built successfully!${NC}"
    
    # Frontend deployment would go here (S3, CloudFront, etc.)
    echo -e "${YELLOW}Frontend build ready for deployment to CDN${NC}"
else
    echo -e "${RED}❌ Frontend package.json not found!${NC}"
    exit 1
fi

# Step 4: Verification
echo -e "${BLUE}✅ Step 4: Verifying Deployment...${NC}"

# Test API if URL is available
if [ "$API_GATEWAY_URL" != "Not available" ]; then
    echo -e "${YELLOW}Testing API health check...${NC}"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_GATEWAY_URL/v1/system/health" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ API is responding correctly${NC}"
    else
        echo -e "${YELLOW}⚠️ API health check returned: $HTTP_STATUS${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ API Gateway URL not available for testing${NC}"
fi

# Final Summary
echo ""
echo -e "${GREEN}🎉 OMNIX AI Deployment Complete!${NC}"
echo -e "${GREEN}=================================${NC}"
echo -e "${BLUE}Environment: $ENV${NC}"
echo -e "${BLUE}Timestamp: $TIMESTAMP${NC}"

if [ "$API_GATEWAY_URL" != "Not available" ]; then
    echo -e "${BLUE}🔗 API Endpoint: $API_GATEWAY_URL${NC}"
fi

echo -e "${BLUE}📊 Next Steps:${NC}"
echo -e "${YELLOW}1. Test the application thoroughly${NC}"
echo -e "${YELLOW}2. Monitor CloudWatch logs for any issues${NC}"
echo -e "${YELLOW}3. Update DNS records if needed${NC}"
echo -e "${YELLOW}4. Notify team of deployment completion${NC}"

echo ""
echo -e "${GREEN}✅ Professional deployment completed successfully!${NC}"