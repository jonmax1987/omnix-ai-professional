#!/bin/bash

# OMNIX AI - Deploy Comprehensive Data Retrieval Monitoring
# Production-ready monitoring setup for the data retrieval system

set -e  # Exit on any error

echo "🚀 OMNIX AI - Deploying Comprehensive Data Retrieval Monitoring"
echo "=============================================================="

# Configuration variables
STACK_NAME="omnix-ai-data-retrieval-monitoring-prod"
TEMPLATE_FILE="infrastructure/cloudformation/data-retrieval-monitoring-comprehensive.yml"
REGION="eu-central-1"
ENVIRONMENT="prod"

# Lambda and API Gateway details from deployment report
LAMBDA_FUNCTION_NAME="omnix-ai-backend-dev"
API_GATEWAY_ID="4j4yb4b844"
API_STAGE_NAME="prod"
ALERT_EMAIL="admin@omnix.ai"

echo "📋 Deployment Configuration:"
echo "   Stack Name: $STACK_NAME"
echo "   Template: $TEMPLATE_FILE"
echo "   Region: $REGION"
echo "   Environment: $ENVIRONMENT"
echo "   Lambda Function: $LAMBDA_FUNCTION_NAME"
echo "   API Gateway: $API_GATEWAY_ID"
echo "   Stage: $API_STAGE_NAME"
echo "   Alert Email: $ALERT_EMAIL"
echo ""

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured. Proceeding with deployment..."

# Check if CloudFormation template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ CloudFormation template not found: $TEMPLATE_FILE"
    echo "   Please ensure the template file exists in the correct location."
    exit 1
fi

echo "✅ CloudFormation template found: $TEMPLATE_FILE"

# Validate CloudFormation template
echo "📝 Validating CloudFormation template..."
aws cloudformation validate-template \
    --template-body file://$TEMPLATE_FILE \
    --region $REGION > /dev/null

echo "✅ CloudFormation template validation successful"

# Check if stack already exists
STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].StackStatus' \
    --output text 2>/dev/null || echo "NOT_EXISTS")

if [ "$STACK_EXISTS" != "NOT_EXISTS" ]; then
    echo "📦 Stack $STACK_NAME already exists with status: $STACK_EXISTS"
    echo "🔄 Updating existing stack..."
    
    OPERATION="update-stack"
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
            ParameterKey=LambdaFunctionName,ParameterValue=$LAMBDA_FUNCTION_NAME \
            ParameterKey=AlertEmail,ParameterValue=$ALERT_EMAIL \
            ParameterKey=APIGatewayId,ParameterValue=$API_GATEWAY_ID \
            ParameterKey=APIGatewayStageName,ParameterValue=$API_STAGE_NAME \
        --capabilities CAPABILITY_IAM \
        --region $REGION
else
    echo "🆕 Creating new stack..."
    
    OPERATION="create-stack"
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
            ParameterKey=LambdaFunctionName,ParameterValue=$LAMBDA_FUNCTION_NAME \
            ParameterKey=AlertEmail,ParameterValue=$ALERT_EMAIL \
            ParameterKey=APIGatewayId,ParameterValue=$API_GATEWAY_ID \
            ParameterKey=APIGatewayStageName,ParameterValue=$API_STAGE_NAME \
        --capabilities CAPABILITY_IAM \
        --region $REGION
fi

echo "⏳ Waiting for CloudFormation operation to complete..."

# Wait for stack operation to complete
if [ "$OPERATION" = "create-stack" ]; then
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION
    echo "✅ Stack creation completed successfully"
else
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION
    echo "✅ Stack update completed successfully"
fi

# Get stack outputs
echo "📋 Retrieving stack outputs..."
OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[*].{Key:OutputKey,Value:OutputValue}' \
    --output table)

echo "$OUTPUTS"

# Get specific output values
BUSINESS_DASHBOARD_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`BusinessIntelligenceDashboardURL`].OutputValue' \
    --output text)

TECHNICAL_DASHBOARD_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`TechnicalPerformanceDashboardURL`].OutputValue' \
    --output text)

CRITICAL_ALERTS_TOPIC=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CriticalAlertsTopicArn`].OutputValue' \
    --output text)

echo ""
echo "🎉 Comprehensive Data Retrieval Monitoring Deployment Complete!"
echo ""
echo "📊 Dashboard URLs:"
echo "   Business Intelligence: $BUSINESS_DASHBOARD_URL"
echo "   Technical Performance: $TECHNICAL_DASHBOARD_URL"
echo ""
echo "🔔 Alert Topics Created:"
echo "   Critical Alerts: $CRITICAL_ALERTS_TOPIC"
echo ""
echo "📧 Important: Check your email ($ALERT_EMAIL) to confirm SNS subscriptions!"

# Create health check script for monitoring validation
echo "🏥 Creating monitoring health check script..."
cat > monitoring-health-check.sh << 'EOF'
#!/bin/bash

# OMNIX AI - Monitoring Health Check
# Validates that all monitoring components are working correctly

set -e

REGION="eu-central-1"
LAMBDA_FUNCTION="omnix-ai-backend-dev"
API_ENDPOINT="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod"

echo "🩺 OMNIX AI - Monitoring Health Check"
echo "====================================="

# Check API Gateway health
echo "🌐 Checking API Gateway health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_ENDPOINT/v1/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "   ✅ API Gateway is healthy"
else
    echo "   ❌ API Gateway health check failed (HTTP $HEALTH_RESPONSE)"
fi

# Check Lambda function status
echo "⚡ Checking Lambda function status..."
LAMBDA_STATE=$(aws lambda get-function \
    --function-name $LAMBDA_FUNCTION \
    --region $REGION \
    --query 'Configuration.State' \
    --output text 2>/dev/null || echo "ERROR")

if [ "$LAMBDA_STATE" = "Active" ]; then
    echo "   ✅ Lambda function is active"
else
    echo "   ❌ Lambda function is not active (State: $LAMBDA_STATE)"
fi

# Check CloudWatch alarms
echo "⚠️  Checking CloudWatch alarms..."
ALARM_COUNT=$(aws cloudwatch describe-alarms \
    --alarm-name-prefix "OMNIX-prod" \
    --region $REGION \
    --query 'length(MetricAlarms)' \
    --output text 2>/dev/null || echo "0")

echo "   📊 Found $ALARM_COUNT monitoring alarms"

if [ "$ALARM_COUNT" -gt "0" ]; then
    echo "   ✅ Monitoring alarms are configured"
else
    echo "   ❌ No monitoring alarms found"
fi

# Test API endpoint performance
echo "🚀 Testing API endpoint performance..."
START_TIME=$(date +%s%N)
TEST_RESPONSE=$(curl -s "$API_ENDPOINT/v1/dashboard/summary")
END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 )) # Convert to milliseconds

echo "   📈 Dashboard API response time: ${DURATION}ms"

if [ "$DURATION" -lt 2000 ]; then
    echo "   ✅ API response time is within SLA (< 2000ms)"
else
    echo "   ⚠️  API response time exceeds SLA target"
fi

echo ""
echo "🩺 Health Check Summary:"
echo "   API Gateway: $([ "$HEALTH_RESPONSE" = "200" ] && echo "✅ Healthy" || echo "❌ Unhealthy")"
echo "   Lambda Function: $([ "$LAMBDA_STATE" = "Active" ] && echo "✅ Active" || echo "❌ Inactive")"
echo "   Monitoring Alarms: $([ "$ALARM_COUNT" -gt "0" ] && echo "✅ Configured" || echo "❌ Missing")"
echo "   Performance: $([ "$DURATION" -lt 2000 ] && echo "✅ Within SLA" || echo "⚠️  Above SLA")"
echo ""
EOF

chmod +x monitoring-health-check.sh

echo "✅ Health check script created: monitoring-health-check.sh"
echo ""
echo "🔧 Next Steps:"
echo "1. Run ./monitoring-health-check.sh to validate monitoring setup"
echo "2. Confirm email subscriptions for all alert topics"
echo "3. Test alert functionality by triggering test errors"
echo "4. Review dashboard configurations and customize as needed"
echo "5. Set up additional custom metrics for business-specific monitoring"
echo ""
echo "📚 Monitoring Features Deployed:"
echo "   ✅ 10+ CloudWatch Alarms for critical monitoring"
echo "   ✅ 3 SNS Topics (Critical, Business, Performance)"
echo "   ✅ 2 Comprehensive Dashboards (BI + Technical)"
echo "   ✅ Custom Metrics (Data Accuracy, Cache Performance)"
echo "   ✅ DynamoDB Throttling Monitoring"
echo "   ✅ API Gateway Performance Monitoring"
echo "   ✅ Lambda Function Health Monitoring"
echo ""
echo "🚨 Alert Thresholds Configured:"
echo "   Critical: Lambda Errors > 5 in 5min"
echo "   Performance: API Latency > 500ms (3 periods)"
echo "   Business: Data Accuracy Errors > 3 in 5min"
echo "   Infrastructure: DynamoDB Throttling > 1 event"
echo ""

# Run initial health check
echo "🏃 Running initial health check..."
./monitoring-health-check.sh

echo ""
echo "🎯 Monitoring deployment completed successfully!"
echo "   Monitor your production data retrieval system at:"
echo "   📊 Business Dashboard: $BUSINESS_DASHBOARD_URL"
echo "   ⚡ Technical Dashboard: $TECHNICAL_DASHBOARD_URL"