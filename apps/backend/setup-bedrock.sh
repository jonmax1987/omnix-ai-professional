#!/bin/bash

# OMNIX AI - AWS Bedrock Setup Script
# Sets up AWS Bedrock access for AI-powered customer analytics

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-eu-central-1}"
BEDROCK_REGION="${BEDROCK_REGION:-us-east-1}"
LAMBDA_FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-omnix-ai-backend-dev}"
LAMBDA_ROLE_NAME="${LAMBDA_ROLE_NAME:-omnix-ai-lambda-execution-role-dev}"

echo -e "${BLUE}🚀 OMNIX AI - AWS Bedrock Setup${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo -e "  AWS Region: ${AWS_REGION}"
echo -e "  Bedrock Region: ${BEDROCK_REGION}"
echo -e "  Lambda Function: ${LAMBDA_FUNCTION_NAME}"
echo -e "  Lambda Role: ${LAMBDA_ROLE_NAME}"
echo ""

# Function to check if AWS CLI is configured
check_aws_cli() {
    echo -e "${BLUE}🔧 Checking AWS CLI configuration...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not found. Please install AWS CLI first.${NC}"
        echo -e "${YELLOW}   Installation: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html${NC}"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not configured or no valid credentials.${NC}"
        echo -e "${YELLOW}   Run: aws configure${NC}"
        exit 1
    fi
    
    local aws_account=$(aws sts get-caller-identity --query Account --output text)
    local aws_user=$(aws sts get-caller-identity --query Arn --output text)
    
    echo -e "${GREEN}✅ AWS CLI configured${NC}"
    echo -e "   Account: ${aws_account}"
    echo -e "   User: ${aws_user}"
}

# Function to check Bedrock model access
check_bedrock_access() {
    echo -e "\n${BLUE}🤖 Checking AWS Bedrock access...${NC}"
    
    # Check if Bedrock service is available in the region
    if ! aws bedrock list-foundation-models --region ${BEDROCK_REGION} &> /dev/null; then
        echo -e "${RED}❌ Cannot access Bedrock in region ${BEDROCK_REGION}${NC}"
        echo -e "${YELLOW}   Please ensure:${NC}"
        echo -e "${YELLOW}   1. Bedrock is available in your region${NC}"
        echo -e "${YELLOW}   2. Your AWS account has Bedrock access${NC}"
        echo -e "${YELLOW}   3. You have proper IAM permissions${NC}"
        exit 1
    fi
    
    # Check if Claude model is available
    local claude_model="anthropic.claude-3-haiku-20240307-v1:0"
    if aws bedrock list-foundation-models --region ${BEDROCK_REGION} --query "modelSummaries[?modelId=='${claude_model}']" --output text | grep -q "${claude_model}"; then
        echo -e "${GREEN}✅ Bedrock accessible, Claude model available${NC}"
    else
        echo -e "${YELLOW}⚠️  Claude model not found or access not granted${NC}"
        echo -e "${YELLOW}   You may need to request model access in AWS Bedrock console${NC}"
        echo -e "${YELLOW}   Model: ${claude_model}${NC}"
    fi
    
    # Try to check model access (this might fail if not enabled)
    echo -e "\n${BLUE}🧪 Testing Bedrock model access...${NC}"
    local test_result=$(aws bedrock get-foundation-model --region ${BEDROCK_REGION} --model-identifier ${claude_model} 2>/dev/null || echo "ACCESS_DENIED")
    
    if [[ "$test_result" == "ACCESS_DENIED" ]]; then
        echo -e "${YELLOW}⚠️  Model access needs to be enabled${NC}"
        echo -e "${YELLOW}   Go to AWS Bedrock Console > Model access > Request model access${NC}"
        echo -e "${YELLOW}   Enable: Anthropic Claude 3 Haiku${NC}"
        
        read -p "Have you enabled model access? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Please enable model access and run this script again${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Model access confirmed${NC}"
    fi
}

# Function to create/update IAM policy for Bedrock
setup_iam_policy() {
    echo -e "\n${BLUE}🔐 Setting up IAM policy for Bedrock access...${NC}"
    
    local policy_name="omnix-ai-bedrock-policy"
    local policy_document='{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "bedrock:InvokeModel",
                    "bedrock:InvokeModelWithResponseStream"
                ],
                "Resource": [
                    "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
                    "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "bedrock:ListFoundationModels",
                    "bedrock:GetFoundationModel"
                ],
                "Resource": "*"
            }
        ]
    }'
    
    # Check if policy exists
    if aws iam get-policy --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/${policy_name}" &> /dev/null; then
        echo -e "${YELLOW}📝 Updating existing IAM policy: ${policy_name}${NC}"
        
        # Create new policy version
        aws iam create-policy-version \
            --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/${policy_name}" \
            --policy-document "$policy_document" \
            --set-as-default
    else
        echo -e "${YELLOW}📝 Creating new IAM policy: ${policy_name}${NC}"
        
        aws iam create-policy \
            --policy-name "${policy_name}" \
            --policy-document "$policy_document" \
            --description "OMNIX AI - AWS Bedrock access policy for customer analytics"
    fi
    
    echo -e "${GREEN}✅ Bedrock IAM policy ready${NC}"
    echo -e "   Policy: ${policy_name}"
}

# Function to attach policy to Lambda role
attach_policy_to_lambda_role() {
    echo -e "\n${BLUE}🔗 Attaching Bedrock policy to Lambda role...${NC}"
    
    local policy_name="omnix-ai-bedrock-policy"
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local policy_arn="arn:aws:iam::${account_id}:policy/${policy_name}"
    
    # Check if Lambda role exists
    if ! aws iam get-role --role-name "${LAMBDA_ROLE_NAME}" &> /dev/null; then
        echo -e "${RED}❌ Lambda role not found: ${LAMBDA_ROLE_NAME}${NC}"
        echo -e "${YELLOW}   Please ensure the Lambda function is deployed first${NC}"
        exit 1
    fi
    
    # Attach the policy to the role
    if aws iam attach-role-policy \
        --role-name "${LAMBDA_ROLE_NAME}" \
        --policy-arn "${policy_arn}"; then
        echo -e "${GREEN}✅ Bedrock policy attached to Lambda role${NC}"
    else
        echo -e "${YELLOW}⚠️  Policy might already be attached${NC}"
    fi
    
    # List attached policies for verification
    echo -e "\n${BLUE}📋 Current policies attached to Lambda role:${NC}"
    aws iam list-attached-role-policies --role-name "${LAMBDA_ROLE_NAME}" --query 'AttachedPolicies[].PolicyName' --output table
}

# Function to update Lambda environment variables
update_lambda_environment() {
    echo -e "\n${BLUE}⚙️  Updating Lambda environment variables...${NC}"
    
    # Check if Lambda function exists
    if ! aws lambda get-function --function-name "${LAMBDA_FUNCTION_NAME}" --region "${AWS_REGION}" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Lambda function not found: ${LAMBDA_FUNCTION_NAME}${NC}"
        echo -e "${YELLOW}   Skipping environment variable update${NC}"
        return 0
    fi
    
    # Get current environment variables
    local current_env=$(aws lambda get-function-configuration --function-name "${LAMBDA_FUNCTION_NAME}" --region "${AWS_REGION}" --query 'Environment.Variables' --output json)
    
    # Merge with new Bedrock variables
    local updated_env=$(echo "$current_env" | jq --arg bedrock_region "$BEDROCK_REGION" '. + {
        "AWS_BEDROCK_REGION": $bedrock_region,
        "BEDROCK_MODEL_ID": "anthropic.claude-3-haiku-20240307-v1:0",
        "AI_ANALYSIS_ENABLED": "true"
    }')
    
    # Update Lambda environment
    if aws lambda update-function-configuration \
        --function-name "${LAMBDA_FUNCTION_NAME}" \
        --region "${AWS_REGION}" \
        --environment "Variables=${updated_env}" > /dev/null; then
        echo -e "${GREEN}✅ Lambda environment variables updated${NC}"
        echo -e "   AWS_BEDROCK_REGION: ${BEDROCK_REGION}"
        echo -e "   BEDROCK_MODEL_ID: anthropic.claude-3-haiku-20240307-v1:0"
        echo -e "   AI_ANALYSIS_ENABLED: true"
    else
        echo -e "${RED}❌ Failed to update Lambda environment variables${NC}"
    fi
}

# Function to test the setup
test_bedrock_setup() {
    echo -e "\n${BLUE}🧪 Testing Bedrock setup...${NC}"
    
    # Create a simple test payload
    local test_payload='{
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 100,
        "messages": [
            {
                "role": "user", 
                "content": "Hello! Please respond with exactly: BEDROCK_TEST_SUCCESS"
            }
        ]
    }'
    
    echo -e "${YELLOW}   Testing direct Bedrock access...${NC}"
    
    local test_result=$(aws bedrock-runtime invoke-model \
        --region "${BEDROCK_REGION}" \
        --model-id "anthropic.claude-3-haiku-20240307-v1:0" \
        --body "$test_payload" \
        --content-type "application/json" \
        /tmp/bedrock-test-output.json 2>/dev/null && \
        cat /tmp/bedrock-test-output.json | jq -r '.content[0].text' 2>/dev/null || echo "FAILED")
    
    if [[ "$test_result" == *"BEDROCK_TEST_SUCCESS"* ]]; then
        echo -e "${GREEN}✅ Bedrock test successful!${NC}"
        echo -e "   Response: ${test_result}"
        rm -f /tmp/bedrock-test-output.json
    else
        echo -e "${RED}❌ Bedrock test failed${NC}"
        echo -e "${YELLOW}   This might be due to:${NC}"
        echo -e "${YELLOW}   1. Model access not enabled${NC}"
        echo -e "${YELLOW}   2. Insufficient IAM permissions${NC}"
        echo -e "${YELLOW}   3. Bedrock service issues${NC}"
        
        if [[ -f /tmp/bedrock-test-output.json ]]; then
            echo -e "\n${YELLOW}Raw response:${NC}"
            cat /tmp/bedrock-test-output.json
            rm -f /tmp/bedrock-test-output.json
        fi
    fi
}

# Function to display next steps
show_next_steps() {
    echo -e "\n${GREEN}🎉 AWS Bedrock Setup Complete!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "1. ${YELLOW}Deploy your Lambda function with updated dependencies${NC}"
    echo -e "   npm run build && ./deploy-lambda.sh"
    echo ""
    echo -e "2. ${YELLOW}Seed test data for AI analysis${NC}"
    echo -e "   node seed-ai-test-data.js"
    echo ""
    echo -e "3. ${YELLOW}Run the AI analysis test suite${NC}"
    echo -e "   node test-ai-analysis.js"
    echo ""
    echo -e "4. ${YELLOW}Test individual endpoints${NC}"
    echo -e "   curl -H \"Authorization: Bearer \$TOKEN\" \\"
    echo -e "        \"\$API_URL/v1/customers/ai-test-customer-001/ai-analysis\""
    echo ""
    echo -e "${BLUE}Configuration Summary:${NC}"
    echo -e "  ✅ Bedrock Region: ${BEDROCK_REGION}"
    echo -e "  ✅ Claude Model: anthropic.claude-3-haiku-20240307-v1:0"
    echo -e "  ✅ IAM Policy: omnix-ai-bedrock-policy"
    echo -e "  ✅ Lambda Role: ${LAMBDA_ROLE_NAME}"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo -e "  • Monitor costs in AWS Bedrock console"
    echo -e "  • Claude Haiku is cost-effective for most use cases"
    echo -e "  • Upgrade to Sonnet for higher accuracy if needed"
    echo -e "  • AI analysis results are cached for 24 hours"
}

# Main execution
main() {
    echo -e "${BLUE}Starting AWS Bedrock setup process...${NC}"
    
    check_aws_cli
    check_bedrock_access
    setup_iam_policy
    attach_policy_to_lambda_role
    update_lambda_environment
    test_bedrock_setup
    show_next_steps
    
    echo -e "\n${GREEN}✅ Setup completed successfully!${NC}"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "OMNIX AI - AWS Bedrock Setup Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h          Show this help message"
        echo "  --test-only         Run only the Bedrock test"
        echo "  --skip-test         Skip the Bedrock test"
        echo ""
        echo "Environment Variables:"
        echo "  AWS_REGION          AWS region for Lambda (default: eu-central-1)"
        echo "  BEDROCK_REGION      AWS region for Bedrock (default: us-east-1)"
        echo "  LAMBDA_FUNCTION_NAME Lambda function name (default: omnix-ai-backend-dev)"
        echo "  LAMBDA_ROLE_NAME    Lambda execution role (default: omnix-ai-lambda-execution-role-dev)"
        exit 0
        ;;
    --test-only)
        echo -e "${BLUE}Running Bedrock test only...${NC}"
        check_aws_cli
        test_bedrock_setup
        exit 0
        ;;
    --skip-test)
        echo -e "${BLUE}Skipping Bedrock test...${NC}"
        SKIP_TEST=true
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