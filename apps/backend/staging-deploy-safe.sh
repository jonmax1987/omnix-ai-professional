#!/bin/bash

# OMNIX AI Staging Lambda Safe Deployment Script
# This script ensures safe deployment with automatic backup and validation

set -e  # Exit on any error

echo "==========================================="
echo "   OMNIX AI STAGING SAFE DEPLOYMENT"
echo "==========================================="
echo ""

# Configuration
FUNCTION_NAME="omnix-ai-backend-staging"
LAMBDA_FILE="lambda-staging-simple.js"
BACKUP_DIR="lambda-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/lambda-staging-backup-${TIMESTAMP}.zip"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to check if required files exist
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    if [ ! -f "$LAMBDA_FILE" ]; then
        echo -e "${RED}❌ ERROR: $LAMBDA_FILE not found${NC}"
        echo "Make sure you're in the correct directory with the staging Lambda file"
        exit 1
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ ERROR: AWS CLI not found${NC}"
        exit 1
    fi
    
    # Check if we can access the Lambda function
    if ! aws lambda get-function --function-name "$FUNCTION_NAME" &> /dev/null; then
        echo -e "${RED}❌ ERROR: Cannot access Lambda function $FUNCTION_NAME${NC}"
        echo "Check your AWS credentials and permissions"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to create backup
create_backup() {
    echo -e "${BLUE}💾 Creating backup...${NC}"
    
    # Get current Lambda code
    DOWNLOAD_URL=$(aws lambda get-function --function-name "$FUNCTION_NAME" --query 'Code.Location' --output text)
    
    if [ "$DOWNLOAD_URL" != "null" ] && [ -n "$DOWNLOAD_URL" ]; then
        curl -s "$DOWNLOAD_URL" -o "$BACKUP_FILE"
        echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Could not create backup${NC}"
    fi
}

# Function to validate Lambda file
validate_lambda() {
    echo -e "${BLUE}🔍 Validating Lambda file...${NC}"
    
    # Check if file contains critical endpoints
    local required_endpoints=(
        "/health"
        "/dashboard/summary"
        "/auth/login"
        "/orders/statistics"
        "/alerts"
        "/recommendations/orders"
        "/customer/profile"
        "/ai/insights/consumption-predictions"
    )
    
    local missing_endpoints=()
    
    for endpoint in "${required_endpoints[@]}"; do
        if ! grep -q "$endpoint" "$LAMBDA_FILE"; then
            missing_endpoints+=("$endpoint")
        fi
    done
    
    if [ ${#missing_endpoints[@]} -gt 0 ]; then
        echo -e "${RED}❌ ERROR: Missing critical endpoints:${NC}"
        for endpoint in "${missing_endpoints[@]}"; do
            echo -e "${RED}  - $endpoint${NC}"
        done
        exit 1
    fi
    
    # Check for critical authentication
    if ! grep -q "staging@omnix.ai" "$LAMBDA_FILE"; then
        echo -e "${RED}❌ ERROR: Missing staging manager authentication${NC}"
        exit 1
    fi
    
    if ! grep -q "customer@staging.omnix.ai" "$LAMBDA_FILE"; then
        echo -e "${RED}❌ ERROR: Missing staging customer authentication${NC}"
        exit 1
    fi
    
    # Check for handler export
    if ! grep -q "exports.handler" "$LAMBDA_FILE"; then
        echo -e "${RED}❌ ERROR: Missing exports.handler${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Lambda file validation passed${NC}"
}

# Function to deploy Lambda
deploy_lambda() {
    echo -e "${BLUE}🚀 Deploying Lambda...${NC}"
    
    # Create deployment package
    local deploy_zip="lambda-staging-deploy-${TIMESTAMP}.zip"
    zip -q "$deploy_zip" "$LAMBDA_FILE"
    
    # Deploy to AWS Lambda
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://$deploy_zip"
    
    # Verify handler is correct
    local current_handler=$(aws lambda get-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --query 'Handler' --output text)
    
    if [ "$current_handler" != "lambda-staging-simple.handler" ]; then
        echo -e "${YELLOW}⚠️  Fixing handler configuration...${NC}"
        aws lambda update-function-configuration \
            --function-name "$FUNCTION_NAME" \
            --handler "lambda-staging-simple.handler"
    fi
    
    # Clean up deployment package
    rm "$deploy_zip"
    
    echo -e "${GREEN}✅ Lambda deployment completed${NC}"
}

# Function to test endpoints
test_deployment() {
    echo -e "${BLUE}🧪 Testing deployment...${NC}"
    
    # Wait a moment for Lambda to be ready
    sleep 5
    
    local base_url="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1"
    local failed_tests=0
    
    # Test critical endpoints
    local endpoints=(
        "health:200"
        "dashboard/summary:200"
        "products:200"
        "orders:200"
    )
    
    for endpoint_test in "${endpoints[@]}"; do
        local endpoint="${endpoint_test%:*}"
        local expected_code="${endpoint_test#*:}"
        
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Origin: https://dtdnwq4annvk2.cloudfront.net" \
            "$base_url/$endpoint")
        
        if [ "$response_code" = "$expected_code" ]; then
            echo -e "${GREEN}✅ $endpoint (HTTP $response_code)${NC}"
        else
            echo -e "${RED}❌ $endpoint (Expected: $expected_code, Got: $response_code)${NC}"
            ((failed_tests++))
        fi
    done
    
    # Test authentication
    local auth_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Origin: https://dtdnwq4annvk2.cloudfront.net" \
        -d '{"email":"staging@omnix.ai","password":"staging123"}' \
        -w "%{http_code}" \
        "$base_url/auth/login")
    
    if echo "$auth_response" | tail -c 4 | grep -q "200"; then
        echo -e "${GREEN}✅ Manager authentication${NC}"
    else
        echo -e "${RED}❌ Manager authentication failed${NC}"
        ((failed_tests++))
    fi
    
    if [ $failed_tests -gt 0 ]; then
        echo -e "${RED}❌ $failed_tests test(s) failed${NC}"
        echo -e "${YELLOW}💡 Consider rolling back using: $BACKUP_FILE${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All tests passed${NC}"
}

# Function to show rollback instructions
show_rollback_instructions() {
    echo ""
    echo -e "${BLUE}📋 ROLLBACK INSTRUCTIONS${NC}"
    echo "----------------------------------------"
    echo "If you need to rollback this deployment:"
    echo ""
    echo "1. Unzip the backup:"
    echo "   unzip $BACKUP_FILE"
    echo ""
    echo "2. Redeploy the backup:"
    echo "   aws lambda update-function-code \\"
    echo "     --function-name $FUNCTION_NAME \\"
    echo "     --zip-file fileb://lambda-staging-backup-${TIMESTAMP}.zip"
    echo ""
    echo "3. Test the rollback:"
    echo "   curl https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1/health"
    echo ""
}

# Main execution
main() {
    echo "Starting safe deployment process..."
    echo ""
    
    check_prerequisites
    create_backup
    validate_lambda
    deploy_lambda
    test_deployment
    
    echo ""
    echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
    echo "Staging Lambda has been safely updated."
    
    show_rollback_instructions
    
    echo ""
    echo -e "${BLUE}📊 Deployment Summary:${NC}"
    echo "  • Function: $FUNCTION_NAME"
    echo "  • Source: $LAMBDA_FILE"
    echo "  • Backup: $BACKUP_FILE"
    echo "  • Timestamp: $TIMESTAMP"
    echo ""
    echo "Staging environment is ready for use!"
}

# Run main function
main "$@"