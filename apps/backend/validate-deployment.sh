#!/bin/bash

# OMNIX AI - Deployment Validation Script
# Validates that all AI components are properly deployed and functional

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
TEST_CUSTOMER_ID="ai-test-customer-001"

echo -e "${BLUE}🔍 OMNIX AI - Deployment Validation${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""
echo -e "${YELLOW}Validating AI-powered customer analytics deployment...${NC}"
echo -e "API Base URL: ${API_BASE_URL}"
echo ""

# Function to check if service is running
check_service_health() {
    echo -e "${BLUE}🏥 Checking service health...${NC}"
    
    if curl -s "${API_BASE_URL}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Service is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Service is not accessible${NC}"
        echo -e "${YELLOW}   Make sure the backend is running on ${API_BASE_URL}${NC}"
        return 1
    fi
}

# Function to validate build artifacts
validate_build() {
    echo -e "\n${BLUE}🔨 Validating build artifacts...${NC}"
    
    local errors=0
    
    # Check if dist directory exists
    if [[ -d "dist" ]]; then
        echo -e "${GREEN}✅ Build directory exists${NC}"
    else
        echo -e "${RED}❌ Build directory missing${NC}"
        ((errors++))
    fi
    
    # Check for AI service files
    if [[ -f "dist/src/services/bedrock.service.js" ]]; then
        echo -e "${GREEN}✅ Bedrock service compiled${NC}"
    else
        echo -e "${RED}❌ Bedrock service missing${NC}"
        ((errors++))
    fi
    
    if [[ -f "dist/src/customers/ai-analysis.service.js" ]]; then
        echo -e "${GREEN}✅ AI Analysis service compiled${NC}"
    else
        echo -e "${RED}❌ AI Analysis service missing${NC}"
        ((errors++))
    fi
    
    if [[ -f "dist/src/interfaces/ai-analysis.interface.js" ]]; then
        echo -e "${GREEN}✅ AI interfaces compiled${NC}"
    else
        echo -e "${RED}❌ AI interfaces missing${NC}"
        ((errors++))
    fi
    
    # Check node_modules for Bedrock SDK
    if npm list @aws-sdk/client-bedrock-runtime > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Bedrock SDK installed${NC}"
    else
        echo -e "${RED}❌ Bedrock SDK missing${NC}"
        ((errors++))
    fi
    
    return $errors
}

# Function to validate DynamoDB tables
validate_dynamodb_tables() {
    echo -e "\n${BLUE}🗃️  Validating DynamoDB tables...${NC}"
    
    local tables=(
        "omnix-ai-customer-profiles-dev"
        "omnix-ai-purchase-history-dev"
        "omnix-ai-product-interactions-dev"
        "omnix-ai-recommendations-dev"
    )
    
    local errors=0
    
    for table in "${tables[@]}"; do
        if aws dynamodb describe-table --table-name "$table" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Table exists: $table${NC}"
        else
            echo -e "${RED}❌ Table missing: $table${NC}"
            ((errors++))
        fi
    done
    
    return $errors
}

# Function to validate test data
validate_test_data() {
    echo -e "\n${BLUE}📊 Validating test data...${NC}"
    
    local errors=0
    
    # Check if test customer exists
    local customer_check=$(aws dynamodb get-item \
        --table-name "omnix-ai-customer-profiles-dev" \
        --key '{"customerId":{"S":"'$TEST_CUSTOMER_ID'"}}' \
        --query 'Item.customerId.S' \
        --output text 2>/dev/null || echo "None")
    
    if [[ "$customer_check" == "$TEST_CUSTOMER_ID" ]]; then
        echo -e "${GREEN}✅ Test customer exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Test customer not found${NC}"
        echo -e "${YELLOW}   Run: node seed-ai-test-data.js${NC}"
        ((errors++))
    fi
    
    # Check purchase history count
    local purchase_count=$(aws dynamodb query \
        --table-name "omnix-ai-purchase-history-dev" \
        --index-name "customerId-purchaseDate-index" \
        --key-condition-expression "customerId = :cid" \
        --expression-attribute-values '{":cid":{"S":"'$TEST_CUSTOMER_ID'"}}' \
        --select COUNT \
        --query 'Count' \
        --output text 2>/dev/null || echo "0")
    
    if [[ $purchase_count -gt 10 ]]; then
        echo -e "${GREEN}✅ Sufficient purchase history ($purchase_count purchases)${NC}"
    else
        echo -e "${YELLOW}⚠️  Insufficient purchase history ($purchase_count purchases)${NC}"
        echo -e "${YELLOW}   Need at least 10 purchases for reliable AI analysis${NC}"
        ((errors++))
    fi
    
    return $errors
}

# Function to validate environment configuration
validate_environment() {
    echo -e "\n${BLUE}⚙️  Validating environment configuration...${NC}"
    
    local warnings=0
    
    # Check for .env file or environment variables
    if [[ -f ".env" ]] && grep -q "BEDROCK" .env; then
        echo -e "${GREEN}✅ Bedrock configuration found in .env${NC}"
    elif [[ -n "$AWS_BEDROCK_REGION" ]] || [[ -n "$BEDROCK_MODEL_ID" ]]; then
        echo -e "${GREEN}✅ Bedrock configuration found in environment${NC}"
    else
        echo -e "${YELLOW}⚠️  Bedrock configuration missing${NC}"
        echo -e "${YELLOW}   Required: AWS_BEDROCK_REGION, BEDROCK_MODEL_ID${NC}"
        ((warnings++))
    fi
    
    # Check AWS CLI configuration
    if aws sts get-caller-identity > /dev/null 2>&1; then
        echo -e "${GREEN}✅ AWS CLI configured${NC}"
    else
        echo -e "${YELLOW}⚠️  AWS CLI not configured${NC}"
        echo -e "${YELLOW}   Bedrock access will not work${NC}"
        ((warnings++))
    fi
    
    return $warnings
}

# Function to run deployment scripts dry run
validate_deployment_scripts() {
    echo -e "\n${BLUE}📜 Validating deployment scripts...${NC}"
    
    local errors=0
    
    # Check if scripts exist and are executable
    local scripts=(
        "setup-bedrock.sh"
        "deploy-lambda.sh"
        "seed-ai-test-data.js"
        "test-ai-analysis.js"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            if [[ -x "$script" ]] || [[ "$script" == *.js ]]; then
                echo -e "${GREEN}✅ Script ready: $script${NC}"
            else
                echo -e "${YELLOW}⚠️  Script not executable: $script${NC}"
                echo -e "${YELLOW}   Run: chmod +x $script${NC}"
                ((errors++))
            fi
        else
            echo -e "${RED}❌ Script missing: $script${NC}"
            ((errors++))
        fi
    done
    
    return $errors
}

# Function to display deployment readiness summary
show_deployment_summary() {
    echo -e "\n${BLUE}📋 Deployment Readiness Summary${NC}"
    echo -e "${BLUE}================================${NC}"
    
    local total_errors=$1
    local total_warnings=$2
    
    if [[ $total_errors -eq 0 ]] && [[ $total_warnings -eq 0 ]]; then
        echo -e "\n${GREEN}🎉 Deployment is ready!${NC}"
        echo -e "${GREEN}All validation checks passed.${NC}"
        echo ""
        echo -e "${BLUE}Next Steps:${NC}"
        echo -e "1. ${YELLOW}Set up Bedrock access:${NC} ./setup-bedrock.sh"
        echo -e "2. ${YELLOW}Deploy to Lambda:${NC} ./deploy-lambda.sh"
        echo -e "3. ${YELLOW}Seed test data:${NC} node seed-ai-test-data.js"
        echo -e "4. ${YELLOW}Run tests:${NC} node test-ai-analysis.js"
        
    elif [[ $total_errors -eq 0 ]] && [[ $total_warnings -gt 0 ]]; then
        echo -e "\n${YELLOW}⚠️  Deployment ready with warnings${NC}"
        echo -e "${YELLOW}Found $total_warnings warning(s). Deployment will work but may have limitations.${NC}"
        echo ""
        echo -e "${BLUE}Recommended Actions:${NC}"
        echo -e "• Review warnings above"
        echo -e "• Configure missing environment variables"
        echo -e "• Set up AWS CLI if needed"
        
    else
        echo -e "\n${RED}❌ Deployment not ready${NC}"
        echo -e "${RED}Found $total_errors error(s) and $total_warnings warning(s).${NC}"
        echo ""
        echo -e "${BLUE}Required Actions:${NC}"
        echo -e "• Fix all errors listed above"
        echo -e "• Run build process: npm run build"
        echo -e "• Install missing dependencies"
        echo -e "• Set up required infrastructure"
    fi
}

# Main validation process
main() {
    local total_errors=0
    local total_warnings=0
    
    # Run validation checks
    validate_build
    total_errors=$((total_errors + $?))
    
    validate_deployment_scripts
    total_errors=$((total_errors + $?))
    
    validate_environment
    total_warnings=$((total_warnings + $?))
    
    # Only check infrastructure if AWS CLI is available
    if command -v aws &> /dev/null && aws sts get-caller-identity &> /dev/null; then
        validate_dynamodb_tables
        total_errors=$((total_errors + $?))
        
        validate_test_data
        total_warnings=$((total_warnings + $?))
    else
        echo -e "\n${YELLOW}⚠️  Skipping infrastructure checks (AWS CLI not configured)${NC}"
    fi
    
    # Check service health if URL provided
    if [[ "$API_BASE_URL" != "http://localhost:3001" ]] || nc -z localhost 3001 2>/dev/null; then
        check_service_health
        total_errors=$((total_errors + $?))
    else
        echo -e "\n${YELLOW}⚠️  Skipping service health check (service not running)${NC}"
    fi
    
    show_deployment_summary $total_errors $total_warnings
    
    if [[ $total_errors -gt 0 ]]; then
        exit 1
    else
        exit 0
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "OMNIX AI - Deployment Validation Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h          Show this help message"
        echo "  --build-only        Validate only build artifacts"
        echo "  --infrastructure    Validate only AWS infrastructure"
        echo "  --environment       Validate only environment configuration"
        echo ""
        echo "Environment Variables:"
        echo "  API_BASE_URL        Base URL for API testing (default: http://localhost:3001)"
        exit 0
        ;;
    --build-only)
        echo -e "${BLUE}🔨 Validating build artifacts only...${NC}"
        validate_build
        exit $?
        ;;
    --infrastructure)
        echo -e "${BLUE}🏗️ Validating AWS infrastructure only...${NC}"
        validate_dynamodb_tables
        validate_test_data
        exit $?
        ;;
    --environment)
        echo -e "${BLUE}⚙️ Validating environment only...${NC}"
        validate_environment
        exit $?
        ;;
    "")
        # Default execution
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        echo -e "Use --help for usage information"
        exit 1
        ;;
esac

# Run main function
main