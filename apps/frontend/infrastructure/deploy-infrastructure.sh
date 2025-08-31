#!/bin/bash

# OMNIX AI - Infrastructure Deployment Script
# Deploys CloudFormation stacks for staging and production environments

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
REGION=${AWS_REGION:-eu-central-1}
PROJECT_NAME="omnix-ai"
STACK_PREFIX="${PROJECT_NAME}-${ENVIRONMENT}"

# Stack names
INFRASTRUCTURE_STACK="${STACK_PREFIX}-infrastructure"
MONITORING_STACK="${STACK_PREFIX}-monitoring"

# Parameters
DOMAIN_NAME=""
CERTIFICATE_ARN=""
ALERT_EMAIL="alerts@omnix.ai"
SLACK_WEBHOOK_URL=""

case $ENVIRONMENT in
  "staging")
    DOMAIN_NAME="staging.omnix.ai"
    CERTIFICATE_ARN="arn:aws:acm:us-east-1:123456789012:certificate/staging-cert-id"
    ;;
  "production")
    DOMAIN_NAME="omnix.ai"
    CERTIFICATE_ARN="arn:aws:acm:us-east-1:123456789012:certificate/prod-cert-id"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Usage: $0 [staging|production]${NC}"
    exit 1
    ;;
esac

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                OMNIX AI - INFRASTRUCTURE DEPLOYMENT          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🚀 Deployment Configuration:${NC}"
echo -e "${CYAN}   Environment:${NC} $ENVIRONMENT"
echo -e "${CYAN}   Region:${NC} $REGION"
echo -e "${CYAN}   Domain:${NC} $DOMAIN_NAME"
echo -e "${CYAN}   Project:${NC} $PROJECT_NAME"
echo ""

# Function to check prerequisites
check_prerequisites() {
    echo -e "${PURPLE}🔍 Checking prerequisites...${NC}"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed${NC}"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS credentials not configured${NC}"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "infrastructure/cloudformation/staging-infrastructure.yml" ]; then
        echo -e "${RED}❌ CloudFormation templates not found${NC}"
        echo -e "${YELLOW}Make sure you're running this from the frontend directory${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to validate CloudFormation templates
validate_templates() {
    echo -e "${PURPLE}📋 Validating CloudFormation templates...${NC}"
    
    local templates=(
        "infrastructure/cloudformation/staging-infrastructure.yml"
        "infrastructure/cloudformation/monitoring-stack.yml"
    )
    
    for template in "${templates[@]}"; do
        echo -e "${CYAN}📄 Validating $template...${NC}"
        
        if aws cloudformation validate-template \
           --template-body file://$template \
           --region $REGION > /dev/null; then
            echo -e "${GREEN}✅ $template is valid${NC}"
        else
            echo -e "${RED}❌ $template validation failed${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}✅ All templates validated successfully${NC}"
}

# Function to deploy infrastructure stack
deploy_infrastructure_stack() {
    echo -e "${PURPLE}🏗️  Deploying infrastructure stack...${NC}"
    
    local stack_status
    stack_status=$(aws cloudformation describe-stacks \
                   --stack-name $INFRASTRUCTURE_STACK \
                   --region $REGION \
                   --query 'Stacks[0].StackStatus' \
                   --output text 2>/dev/null || echo "DOES_NOT_EXIST")
    
    local operation="create-stack"
    local operation_text="Creating"
    
    if [ "$stack_status" != "DOES_NOT_EXIST" ]; then
        operation="update-stack"
        operation_text="Updating"
    fi
    
    echo -e "${CYAN}📦 ${operation_text} infrastructure stack: $INFRASTRUCTURE_STACK${NC}"
    
    local change_set_name="${INFRASTRUCTURE_STACK}-changeset-$(date +%Y%m%d-%H%M%S)"
    
    # Create change set
    aws cloudformation create-change-set \
        --stack-name $INFRASTRUCTURE_STACK \
        --change-set-name $change_set_name \
        --template-body file://infrastructure/cloudformation/staging-infrastructure.yml \
        --parameters \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
            ParameterKey=ProjectName,ParameterValue=$PROJECT_NAME \
            ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
            ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION
    
    echo -e "${CYAN}⏳ Waiting for change set to be created...${NC}"
    aws cloudformation wait change-set-create-complete \
        --stack-name $INFRASTRUCTURE_STACK \
        --change-set-name $change_set_name \
        --region $REGION
    
    # Show change set details
    echo -e "${CYAN}📋 Change set details:${NC}"
    aws cloudformation describe-change-set \
        --stack-name $INFRASTRUCTURE_STACK \
        --change-set-name $change_set_name \
        --region $REGION \
        --query 'Changes[].{Action:Action,ResourceType:ResourceChange.ResourceType,LogicalResourceId:ResourceChange.LogicalResourceId}' \
        --output table
    
    # Confirm deployment
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION${NC}"
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo -e "${YELLOW}🛑 Deployment cancelled${NC}"
            exit 0
        fi
    fi
    
    # Execute change set
    aws cloudformation execute-change-set \
        --stack-name $INFRASTRUCTURE_STACK \
        --change-set-name $change_set_name \
        --region $REGION
    
    echo -e "${CYAN}⏳ Waiting for stack deployment to complete...${NC}"
    if aws cloudformation wait stack-${operation%-*}-complete \
       --stack-name $INFRASTRUCTURE_STACK \
       --region $REGION; then
        echo -e "${GREEN}✅ Infrastructure stack deployed successfully${NC}"
    else
        echo -e "${RED}❌ Infrastructure stack deployment failed${NC}"
        exit 1
    fi
}

# Function to get stack outputs
get_stack_outputs() {
    echo -e "${PURPLE}📤 Retrieving stack outputs...${NC}"
    
    local outputs
    outputs=$(aws cloudformation describe-stacks \
              --stack-name $INFRASTRUCTURE_STACK \
              --region $REGION \
              --query 'Stacks[0].Outputs' \
              --output json)
    
    # Extract key values
    BUCKET_NAME=$(echo $outputs | jq -r '.[] | select(.OutputKey=="BucketName") | .OutputValue')
    CLOUDFRONT_DISTRIBUTION_ID=$(echo $outputs | jq -r '.[] | select(.OutputKey=="CloudFrontDistributionId") | .OutputValue')
    CLOUDFRONT_DOMAIN_NAME=$(echo $outputs | jq -r '.[] | select(.OutputKey=="CloudFrontDomainName") | .OutputValue')
    
    echo -e "${CYAN}📦 S3 Bucket:${NC} $BUCKET_NAME"
    echo -e "${CYAN}🌐 CloudFront Distribution:${NC} $CLOUDFRONT_DISTRIBUTION_ID"
    echo -e "${CYAN}🔗 CloudFront Domain:${NC} $CLOUDFRONT_DOMAIN_NAME"
    
    # Export for monitoring stack
    export CLOUDFRONT_DISTRIBUTION_ID
    export S3_BUCKET_NAME=$BUCKET_NAME
}

# Function to deploy monitoring stack
deploy_monitoring_stack() {
    echo -e "${PURPLE}📊 Deploying monitoring stack...${NC}"
    
    local stack_status
    stack_status=$(aws cloudformation describe-stacks \
                   --stack-name $MONITORING_STACK \
                   --region $REGION \
                   --query 'Stacks[0].StackStatus' \
                   --output text 2>/dev/null || echo "DOES_NOT_EXIST")
    
    local operation="create-stack"
    local operation_text="Creating"
    
    if [ "$stack_status" != "DOES_NOT_EXIST" ]; then
        operation="update-stack"
        operation_text="Updating"
    fi
    
    echo -e "${CYAN}📦 ${operation_text} monitoring stack: $MONITORING_STACK${NC}"
    
    aws cloudformation $operation \
        --stack-name $MONITORING_STACK \
        --template-body file://infrastructure/cloudformation/monitoring-stack.yml \
        --parameters \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
            ParameterKey=ProjectName,ParameterValue=$PROJECT_NAME \
            ParameterKey=AlertEmail,ParameterValue=$ALERT_EMAIL \
            ParameterKey=SlackWebhookUrl,ParameterValue=$SLACK_WEBHOOK_URL \
            ParameterKey=CloudFrontDistributionId,ParameterValue=$CLOUDFRONT_DISTRIBUTION_ID \
            ParameterKey=S3BucketName,ParameterValue=$S3_BUCKET_NAME \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION
    
    echo -e "${CYAN}⏳ Waiting for monitoring stack deployment to complete...${NC}"
    if aws cloudformation wait stack-${operation%-*}-complete \
       --stack-name $MONITORING_STACK \
       --region $REGION; then
        echo -e "${GREEN}✅ Monitoring stack deployed successfully${NC}"
    else
        echo -e "${RED}❌ Monitoring stack deployment failed${NC}"
        exit 1
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    DEPLOYMENT SUMMARY                       ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🎉 Infrastructure deployment completed successfully!${NC}"
    echo ""
    echo -e "${CYAN}📋 Deployed Stacks:${NC}"
    echo -e "${CYAN}   • Infrastructure:${NC} $INFRASTRUCTURE_STACK"
    echo -e "${CYAN}   • Monitoring:${NC} $MONITORING_STACK"
    echo ""
    echo -e "${CYAN}🌐 Resources Created:${NC}"
    echo -e "${CYAN}   • S3 Bucket:${NC} $BUCKET_NAME"
    echo -e "${CYAN}   • CloudFront:${NC} $CLOUDFRONT_DISTRIBUTION_ID"
    echo -e "${CYAN}   • Domain:${NC} $DOMAIN_NAME"
    echo ""
    echo -e "${CYAN}🔗 Useful Links:${NC}"
    echo -e "${CYAN}   • Application:${NC} https://$DOMAIN_NAME"
    echo -e "${CYAN}   • CloudFront:${NC} https://$CLOUDFRONT_DOMAIN_NAME"
    echo -e "${CYAN}   • Dashboard:${NC} https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=${PROJECT_NAME}-${ENVIRONMENT}-monitoring"
    echo ""
    echo -e "${CYAN}📊 Next Steps:${NC}"
    echo -e "${CYAN}   1. Update DNS records to point to CloudFront${NC}"
    echo -e "${CYAN}   2. Configure SSL certificate${NC}"
    echo -e "${CYAN}   3. Test deployment with: npm run deploy:${ENVIRONMENT}${NC}"
    echo -e "${CYAN}   4. Monitor alerts and metrics${NC}"
    echo ""
}

# Function to cleanup on failure
cleanup() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Infrastructure deployment failed${NC}"
        echo -e "${YELLOW}💡 Check CloudFormation console for details:${NC}"
        echo -e "${YELLOW}   https://${REGION}.console.aws.amazon.com/cloudformation/home?region=${REGION}${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Starting infrastructure deployment process...${NC}"
    
    check_prerequisites
    validate_templates
    deploy_infrastructure_stack
    get_stack_outputs
    deploy_monitoring_stack
    show_deployment_summary
    
    echo -e "${GREEN}🚀 OMNIX AI infrastructure deployment to $ENVIRONMENT completed successfully!${NC}"
}

# Trap to handle cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"