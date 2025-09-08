#!/bin/bash

# OMNIX AI Monitoring Infrastructure Deployment Script
# This script deploys the complete monitoring infrastructure for OMNIX AI

set -e  # Exit on any error

# Configuration
PROJECT_NAME="omnix-ai"
ENVIRONMENT="${1:-staging}"
REGION="${AWS_REGION:-eu-central-1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI not found. Please install AWS CLI."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Please run 'aws configure'."
        exit 1
    fi
    
    # Check if CloudFormation templates exist
    local template_dir="infrastructure/cloudformation"
    local required_templates=(
        "monitoring-comprehensive.yml"
        "security-monitoring.yml"
        "business-monitoring.yml"
        "alerting-escalation.yml"
        "incident-response.yml"
        "executive-dashboard.yml"
    )
    
    for template in "${required_templates[@]}"; do
        if [ ! -f "${template_dir}/${template}" ]; then
            error "Required CloudFormation template not found: ${template_dir}/${template}"
            exit 1
        fi
    done
    
    success "Prerequisites check passed"
}

# Get user input for configuration
get_configuration() {
    log "Gathering deployment configuration..."
    
    # Basic configuration
    read -p "Enter your alert email address (default: alerts@omnix.ai): " ALERT_EMAIL
    ALERT_EMAIL=${ALERT_EMAIL:-"alerts@omnix.ai"}
    
    read -p "Enter your escalation email address (default: emergency@omnix.ai): " ESCALATION_EMAIL
    ESCALATION_EMAIL=${ESCALATION_EMAIL:-"emergency@omnix.ai"}
    
    # Slack configuration
    read -p "Enter your Slack webhook URL (optional, press Enter to skip): " SLACK_WEBHOOK_URL
    
    # PagerDuty configuration
    read -p "Enter your PagerDuty integration key (optional, press Enter to skip): " PAGERDUTY_KEY
    
    # AWS resource IDs
    read -p "Enter your CloudFront Distribution ID: " CLOUDFRONT_DISTRIBUTION_ID
    if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        error "CloudFront Distribution ID is required"
        exit 1
    fi
    
    read -p "Enter your API Gateway ID: " API_GATEWAY_ID
    if [ -z "$API_GATEWAY_ID" ]; then
        error "API Gateway ID is required"
        exit 1
    fi
    
    read -p "Enter your S3 bucket name: " S3_BUCKET_NAME
    if [ -z "$S3_BUCKET_NAME" ]; then
        error "S3 bucket name is required"
        exit 1
    fi
    
    read -p "Enter your health check URL (default: https://omnix-ai-staging.vercel.app/health): " HEALTH_CHECK_URL
    HEALTH_CHECK_URL=${HEALTH_CHECK_URL:-"https://omnix-ai-staging.vercel.app/health"}
    
    # DynamoDB tables
    read -p "Enter your DynamoDB table names (comma-separated, default: customers,orders,inventory,analytics): " DYNAMODB_TABLES
    DYNAMODB_TABLES=${DYNAMODB_TABLES:-"customers,orders,inventory,analytics"}
    
    success "Configuration gathered successfully"
}

# Deploy CloudFormation stack
deploy_stack() {
    local stack_name=$1
    local template_file=$2
    local parameters=$3
    local capabilities=$4
    
    log "Deploying stack: $stack_name"
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$stack_name" --region "$REGION" &> /dev/null; then
        log "Stack $stack_name exists, updating..."
        aws cloudformation update-stack \
            --stack-name "$stack_name" \
            --template-body "file://$template_file" \
            --parameters "$parameters" \
            --capabilities "$capabilities" \
            --region "$REGION" || {
                if [ $? -eq 255 ]; then
                    warning "No changes to deploy for stack $stack_name"
                else
                    error "Failed to update stack $stack_name"
                    return 1
                fi
            }
    else
        log "Creating new stack: $stack_name"
        aws cloudformation create-stack \
            --stack-name "$stack_name" \
            --template-body "file://$template_file" \
            --parameters "$parameters" \
            --capabilities "$capabilities" \
            --region "$REGION" || {
                error "Failed to create stack $stack_name"
                return 1
            }
    fi
    
    # Wait for stack operation to complete
    log "Waiting for stack operation to complete..."
    if ! wait_for_stack "$stack_name"; then
        error "Stack operation failed for $stack_name"
        return 1
    fi
    
    success "Stack $stack_name deployed successfully"
    return 0
}

# Wait for CloudFormation stack operation to complete
wait_for_stack() {
    local stack_name=$1
    local max_attempts=60  # 30 minutes (60 * 30 seconds)
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local status=$(aws cloudformation describe-stacks \
            --stack-name "$stack_name" \
            --region "$REGION" \
            --query 'Stacks[0].StackStatus' \
            --output text)
        
        case $status in
            CREATE_COMPLETE|UPDATE_COMPLETE)
                return 0
                ;;
            CREATE_IN_PROGRESS|UPDATE_IN_PROGRESS)
                echo -n "."
                ;;
            CREATE_FAILED|UPDATE_FAILED|ROLLBACK_COMPLETE|ROLLBACK_FAILED|DELETE_FAILED)
                echo ""
                error "Stack operation failed with status: $status"
                # Show stack events for debugging
                aws cloudformation describe-stack-events \
                    --stack-name "$stack_name" \
                    --region "$REGION" \
                    --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[ResourceType,ResourceStatus,ResourceStatusReason]' \
                    --output table
                return 1
                ;;
            *)
                echo -n "."
                ;;
        esac
        
        sleep 30
        ((attempt++))
    done
    
    echo ""
    error "Timeout waiting for stack operation to complete"
    return 1
}

# Deploy comprehensive monitoring stack
deploy_comprehensive_monitoring() {
    local stack_name="${PROJECT_NAME}-monitoring-comprehensive-${ENVIRONMENT}"
    local template_file="infrastructure/cloudformation/monitoring-comprehensive.yml"
    local parameters="ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
        ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
        ParameterKey=AlertEmail,ParameterValue=${ALERT_EMAIL} \
        ParameterKey=CloudFrontDistributionId,ParameterValue=${CLOUDFRONT_DISTRIBUTION_ID} \
        ParameterKey=S3BucketName,ParameterValue=${S3_BUCKET_NAME} \
        ParameterKey=ApiGatewayId,ParameterValue=${API_GATEWAY_ID} \
        ParameterKey=HealthCheckUrl,ParameterValue=${HEALTH_CHECK_URL}"
    
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        parameters="${parameters} ParameterKey=SlackWebhookUrl,ParameterValue=${SLACK_WEBHOOK_URL}"
    fi
    
    deploy_stack "$stack_name" "$template_file" "$parameters" "CAPABILITY_NAMED_IAM"
}

# Deploy security monitoring
deploy_security_monitoring() {
    local stack_name="${PROJECT_NAME}-security-monitoring-${ENVIRONMENT}"
    local template_file="infrastructure/cloudformation/security-monitoring.yml"
    
    # Get critical alert topic ARN from comprehensive monitoring stack
    local critical_alert_topic=$(aws cloudformation describe-stacks \
        --stack-name "${PROJECT_NAME}-monitoring-comprehensive-${ENVIRONMENT}" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`CriticalAlertTopicArn`].OutputValue' \
        --output text)
    
    if [ -z "$critical_alert_topic" ]; then
        error "Could not find CriticalAlertTopicArn from comprehensive monitoring stack"
        return 1
    fi
    
    local parameters="ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
        ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
        ParameterKey=AlertTopicArn,ParameterValue=${critical_alert_topic} \
        ParameterKey=ApiGatewayId,ParameterValue=${API_GATEWAY_ID}"
    
    deploy_stack "$stack_name" "$template_file" "$parameters" "CAPABILITY_NAMED_IAM"
}

# Deploy business monitoring
deploy_business_monitoring() {
    local stack_name="${PROJECT_NAME}-business-monitoring-${ENVIRONMENT}"
    local template_file="infrastructure/cloudformation/business-monitoring.yml"
    
    # Get business alert topic ARN from comprehensive monitoring stack
    local business_alert_topic=$(aws cloudformation describe-stacks \
        --stack-name "${PROJECT_NAME}-monitoring-comprehensive-${ENVIRONMENT}" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`BusinessAlertTopicArn`].OutputValue' \
        --output text)
    
    if [ -z "$business_alert_topic" ]; then
        error "Could not find BusinessAlertTopicArn from comprehensive monitoring stack"
        return 1
    fi
    
    local parameters="ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
        ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
        ParameterKey=AlertTopicArn,ParameterValue=${business_alert_topic} \
        ParameterKey=DynamoDBTableNames,ParameterValue=${DYNAMODB_TABLES}"
    
    deploy_stack "$stack_name" "$template_file" "$parameters" "CAPABILITY_NAMED_IAM"
}

# Deploy alerting and escalation
deploy_alerting_escalation() {
    local stack_name="${PROJECT_NAME}-alerting-escalation-${ENVIRONMENT}"
    local template_file="infrastructure/cloudformation/alerting-escalation.yml"
    local parameters="ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
        ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
        ParameterKey=PrimaryEmail,ParameterValue=${ALERT_EMAIL} \
        ParameterKey=EscalationEmail,ParameterValue=${ESCALATION_EMAIL}"
    
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        parameters="${parameters} ParameterKey=SlackWebhookUrl,ParameterValue=${SLACK_WEBHOOK_URL}"
    fi
    
    if [ ! -z "$PAGERDUTY_KEY" ]; then
        parameters="${parameters} ParameterKey=PagerDutyIntegrationKey,ParameterValue=${PAGERDUTY_KEY}"
    fi
    
    deploy_stack "$stack_name" "$template_file" "$parameters" "CAPABILITY_NAMED_IAM"
}

# Deploy incident response
deploy_incident_response() {
    local stack_name="${PROJECT_NAME}-incident-response-${ENVIRONMENT}"
    local template_file="infrastructure/cloudformation/incident-response.yml"
    
    # Get critical alert topic ARN from alerting stack
    local critical_alert_topic=$(aws cloudformation describe-stacks \
        --stack-name "${PROJECT_NAME}-alerting-escalation-${ENVIRONMENT}" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`CriticalAlertTopicArn`].OutputValue' \
        --output text)
    
    if [ -z "$critical_alert_topic" ]; then
        error "Could not find CriticalAlertTopicArn from alerting escalation stack"
        return 1
    fi
    
    local parameters="ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
        ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
        ParameterKey=AlertTopicArn,ParameterValue=${critical_alert_topic} \
        ParameterKey=ApiGatewayId,ParameterValue=${API_GATEWAY_ID} \
        ParameterKey=CloudFrontDistributionId,ParameterValue=${CLOUDFRONT_DISTRIBUTION_ID} \
        ParameterKey=S3BucketName,ParameterValue=${S3_BUCKET_NAME}"
    
    deploy_stack "$stack_name" "$template_file" "$parameters" "CAPABILITY_NAMED_IAM"
}

# Deploy executive dashboards
deploy_executive_dashboards() {
    local stack_name="${PROJECT_NAME}-executive-dashboards-${ENVIRONMENT}"
    local template_file="infrastructure/cloudformation/executive-dashboard.yml"
    local parameters="ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
        ParameterKey=ProjectName,ParameterValue=${PROJECT_NAME} \
        ParameterKey=ApiGatewayId,ParameterValue=${API_GATEWAY_ID} \
        ParameterKey=CloudFrontDistributionId,ParameterValue=${CLOUDFRONT_DISTRIBUTION_ID}"
    
    deploy_stack "$stack_name" "$template_file" "$parameters" "CAPABILITY_IAM"
}

# Get dashboard URLs
get_dashboard_urls() {
    log "Retrieving dashboard URLs..."
    
    local stacks=(
        "${PROJECT_NAME}-monitoring-comprehensive-${ENVIRONMENT}"
        "${PROJECT_NAME}-security-monitoring-${ENVIRONMENT}"
        "${PROJECT_NAME}-business-monitoring-${ENVIRONMENT}"
        "${PROJECT_NAME}-executive-dashboards-${ENVIRONMENT}"
    )
    
    echo ""
    echo "📊 MONITORING DASHBOARDS"
    echo "========================"
    
    for stack in "${stacks[@]}"; do
        local outputs=$(aws cloudformation describe-stacks \
            --stack-name "$stack" \
            --region "$REGION" \
            --query 'Stacks[0].Outputs' \
            --output json 2>/dev/null || echo "[]")
        
        if [ "$outputs" != "[]" ]; then
            echo "$outputs" | jq -r '.[] | select(.OutputKey | endswith("DashboardURL") or endswith("URL")) | "• \(.Description): \(.OutputValue)"'
        fi
    done
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if all stacks are healthy
    local stacks=(
        "${PROJECT_NAME}-monitoring-comprehensive-${ENVIRONMENT}"
        "${PROJECT_NAME}-security-monitoring-${ENVIRONMENT}"
        "${PROJECT_NAME}-business-monitoring-${ENVIRONMENT}"
        "${PROJECT_NAME}-alerting-escalation-${ENVIRONMENT}"
        "${PROJECT_NAME}-incident-response-${ENVIRONMENT}"
        "${PROJECT_NAME}-executive-dashboards-${ENVIRONMENT}"
    )
    
    local failed_stacks=()
    
    for stack in "${stacks[@]}"; do
        local status=$(aws cloudformation describe-stacks \
            --stack-name "$stack" \
            --region "$REGION" \
            --query 'Stacks[0].StackStatus' \
            --output text 2>/dev/null || echo "NOT_FOUND")
        
        if [[ "$status" != "CREATE_COMPLETE" && "$status" != "UPDATE_COMPLETE" ]]; then
            failed_stacks+=("$stack")
        fi
    done
    
    if [ ${#failed_stacks[@]} -eq 0 ]; then
        success "All monitoring stacks deployed successfully"
        return 0
    else
        error "Failed stacks: ${failed_stacks[*]}"
        return 1
    fi
}

# Send test alert
send_test_alert() {
    log "Sending test alert..."
    
    local critical_alert_topic=$(aws cloudformation describe-stacks \
        --stack-name "${PROJECT_NAME}-alerting-escalation-${ENVIRONMENT}" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`CriticalAlertTopicArn`].OutputValue' \
        --output text 2>/dev/null)
    
    if [ ! -z "$critical_alert_topic" ]; then
        aws sns publish \
            --topic-arn "$critical_alert_topic" \
            --subject "OMNIX AI Monitoring Test Alert" \
            --message "This is a test alert to verify the monitoring infrastructure deployment. If you receive this message, the alerting system is working correctly." \
            --region "$REGION"
        
        success "Test alert sent to SNS topic"
    else
        warning "Could not send test alert - SNS topic not found"
    fi
}

# Cleanup on failure
cleanup_on_failure() {
    if [ $? -ne 0 ]; then
        error "Deployment failed. Check the CloudFormation console for details."
        echo ""
        echo "To clean up failed stacks, run:"
        echo "aws cloudformation delete-stack --stack-name STACK_NAME --region $REGION"
    fi
}

# Main deployment function
main() {
    echo ""
    echo "🚀 OMNIX AI Monitoring Infrastructure Deployment"
    echo "==============================================="
    echo ""
    
    # Set trap for cleanup
    trap cleanup_on_failure EXIT
    
    # Run deployment steps
    check_prerequisites
    get_configuration
    
    echo ""
    echo "🏗️  Starting deployment to $ENVIRONMENT environment..."
    echo ""
    
    # Deploy stacks in order
    deploy_comprehensive_monitoring && \
    deploy_alerting_escalation && \
    deploy_security_monitoring && \
    deploy_business_monitoring && \
    deploy_incident_response && \
    deploy_executive_dashboards
    
    if [ $? -eq 0 ]; then
        echo ""
        success "🎉 All monitoring infrastructure deployed successfully!"
        echo ""
        
        # Get dashboard URLs
        get_dashboard_urls
        
        # Verify deployment
        echo ""
        verify_deployment
        
        # Send test alert
        echo ""
        read -p "Send a test alert to verify alerting system? (y/n): " send_test
        if [ "$send_test" = "y" ] || [ "$send_test" = "Y" ]; then
            send_test_alert
        fi
        
        echo ""
        echo "📚 Next Steps:"
        echo "=============="
        echo "1. Access the dashboards using the URLs above"
        echo "2. Configure your applications to send metrics to CloudWatch"
        echo "3. Test the incident response procedures"
        echo "4. Review and customize alert thresholds"
        echo "5. Set up additional notification channels if needed"
        echo ""
        echo "📖 Documentation:"
        echo "• Setup Guide: MONITORING_SETUP_GUIDE.md"
        echo "• Runbooks: MONITORING_RUNBOOKS.md"
        echo ""
        
        # Disable trap
        trap - EXIT
        
    else
        error "Deployment failed. Please check the error messages above."
        exit 1
    fi
}

# Show help
show_help() {
    echo "OMNIX AI Monitoring Infrastructure Deployment Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "Arguments:"
    echo "  ENVIRONMENT    Target environment (staging|production) [default: staging]"
    echo ""
    echo "Environment Variables:"
    echo "  AWS_REGION     AWS region for deployment [default: eu-central-1]"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy to staging"
    echo "  $0 production         # Deploy to production"
    echo "  AWS_REGION=us-west-2 $0 staging"
    echo ""
}

# Parse arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    "")
        ENVIRONMENT="staging"
        ;;
    staging|production)
        ENVIRONMENT="$1"
        ;;
    *)
        error "Invalid environment: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

# Run main function
main