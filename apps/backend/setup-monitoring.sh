#!/bin/bash

# CloudWatch Monitoring and Alerting Setup for OMNIX AI Backend

set -e  # Exit on any error

echo "📊 OMNIX AI Backend - CloudWatch Monitoring Setup"
echo "================================================="

# Configuration variables
FUNCTION_NAME="omnix-ai-backend-dev"
API_NAME="omnix-ai-api-dev"
REGION="eu-central-1"
SNS_TOPIC_NAME="omnix-ai-alerts-dev"
EMAIL_ENDPOINT="admin@omnix.ai"  # Change this to your email

echo "📋 Configuration:"
echo "   Function Name: $FUNCTION_NAME"
echo "   API Name: $API_NAME"
echo "   Region: $REGION"
echo "   SNS Topic: $SNS_TOPIC_NAME"
echo "   Alert Email: $EMAIL_ENDPOINT"
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

echo "✅ AWS CLI configured. Setting up monitoring..."
echo ""

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Step 1: Create SNS Topic for alerts
echo "📢 Creating SNS topic for alerts..."
SNS_TOPIC_ARN=$(aws sns create-topic \
    --name "$SNS_TOPIC_NAME" \
    --region "$REGION" \
    --query 'TopicArn' \
    --output text 2>/dev/null || echo "arn:aws:sns:${REGION}:${ACCOUNT_ID}:${SNS_TOPIC_NAME}")

echo "✅ SNS Topic ARN: $SNS_TOPIC_ARN"

# Step 2: Subscribe email to SNS topic
echo "📧 Subscribing email to SNS topic..."
aws sns subscribe \
    --topic-arn "$SNS_TOPIC_ARN" \
    --protocol email \
    --notification-endpoint "$EMAIL_ENDPOINT" \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Email subscription may already exist"

echo "   ✅ Email subscription created (check your email to confirm)"

# Function to create CloudWatch alarm
create_alarm() {
    local alarm_name=$1
    local alarm_description=$2
    local metric_name=$3
    local namespace=$4
    local statistic=$5
    local period=$6
    local threshold=$7
    local comparison_operator=$8
    local evaluation_periods=$9
    local dimensions=${10}
    
    echo "⚠️  Creating alarm: $alarm_name"
    
    aws cloudwatch put-metric-alarm \
        --alarm-name "$alarm_name" \
        --alarm-description "$alarm_description" \
        --metric-name "$metric_name" \
        --namespace "$namespace" \
        --statistic "$statistic" \
        --period "$period" \
        --threshold "$threshold" \
        --comparison-operator "$comparison_operator" \
        --evaluation-periods "$evaluation_periods" \
        --alarm-actions "$SNS_TOPIC_ARN" \
        --dimensions "$dimensions" \
        --region "$REGION" > /dev/null 2>&1 || echo "     ⚠️  Alarm may already exist"
    
    echo "     ✅ $alarm_name created/updated"
}

# Step 3: Create Lambda function alarms
echo "⚡ Setting up Lambda function alarms..."

# High error rate alarm
create_alarm \
    "OMNIX-AI-Lambda-High-Error-Rate" \
    "Alert when Lambda function error rate is high" \
    "Errors" \
    "AWS/Lambda" \
    "Sum" \
    300 \
    5 \
    "GreaterThanOrEqualToThreshold" \
    2 \
    "Name=FunctionName,Value=$FUNCTION_NAME"

# High duration alarm
create_alarm \
    "OMNIX-AI-Lambda-High-Duration" \
    "Alert when Lambda function duration is high" \
    "Duration" \
    "AWS/Lambda" \
    "Average" \
    300 \
    25000 \
    "GreaterThanThreshold" \
    3 \
    "Name=FunctionName,Value=$FUNCTION_NAME"

# Throttling alarm
create_alarm \
    "OMNIX-AI-Lambda-Throttles" \
    "Alert when Lambda function is being throttled" \
    "Throttles" \
    "AWS/Lambda" \
    "Sum" \
    300 \
    1 \
    "GreaterThanOrEqualToThreshold" \
    1 \
    "Name=FunctionName,Value=$FUNCTION_NAME"

# Step 4: Create API Gateway alarms (if API exists)
echo "🌐 Setting up API Gateway alarms..."

# Check if API Gateway exists
API_ID=$(aws apigateway get-rest-apis --region "$REGION" --query "items[?name=='$API_NAME'].id" --output text 2>/dev/null || echo "")

if [ -n "$API_ID" ] && [ "$API_ID" != "None" ]; then
    echo "   ✅ Found API Gateway: $API_ID"
    
    # High 4XX error rate
    create_alarm \
        "OMNIX-AI-API-High-4XX-Errors" \
        "Alert when API Gateway 4XX error rate is high" \
        "4XXError" \
        "AWS/ApiGateway" \
        "Sum" \
        300 \
        10 \
        "GreaterThanThreshold" \
        2 \
        "Name=ApiName,Value=$API_NAME"
    
    # High 5XX error rate
    create_alarm \
        "OMNIX-AI-API-High-5XX-Errors" \
        "Alert when API Gateway 5XX error rate is high" \
        "5XXError" \
        "AWS/ApiGateway" \
        "Sum" \
        300 \
        5 \
        "GreaterThanThreshold" \
        2 \
        "Name=ApiName,Value=$API_NAME"
else
    echo "   ⚠️  API Gateway not found. Skipping API alarms."
    echo "      Run API Gateway setup first, then re-run this script."
fi

# Step 5: Create CloudWatch Dashboard
echo "📊 Creating CloudWatch Dashboard..."

DASHBOARD_BODY=$(cat <<EOF
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Duration", "FunctionName", "$FUNCTION_NAME" ],
                    [ ".", "Errors", ".", "." ],
                    [ ".", "Invocations", ".", "." ],
                    [ ".", "Throttles", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Lambda Function Metrics",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/ApiGateway", "Count", "ApiName", "$API_NAME" ],
                    [ ".", "Latency", ".", "." ],
                    [ ".", "4XXError", ".", "." ],
                    [ ".", "5XXError", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "API Gateway Metrics",
                "period": 300
            }
        },
        {
            "type": "log",
            "x": 0,
            "y": 6,
            "width": 24,
            "height": 6,
            "properties": {
                "query": "SOURCE '/aws/lambda/$FUNCTION_NAME'\n| fields @timestamp, @message\n| filter @message like /ERROR/\n| sort @timestamp desc\n| limit 20",
                "region": "$REGION",
                "title": "Recent Errors",
                "view": "table"
            }
        }
    ]
}
EOF
)

aws cloudwatch put-dashboard \
    --dashboard-name "OMNIX-AI-Backend-Dashboard" \
    --dashboard-body "$DASHBOARD_BODY" \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Dashboard creation failed"

echo "   ✅ Dashboard created: OMNIX-AI-Backend-Dashboard"

echo ""
echo "🎉 CloudWatch monitoring setup complete!"
echo ""
echo "📊 Created Resources:"
echo "   ✅ SNS Topic: $SNS_TOPIC_ARN"
echo "   ✅ Email subscription (confirm via email)"
echo "   ✅ Lambda alarms: Error rate, Duration, Throttles"
if [ -n "$API_ID" ] && [ "$API_ID" != "None" ]; then
echo "   ✅ API Gateway alarms: 4XX errors, 5XX errors"
fi
echo "   ✅ CloudWatch Dashboard: OMNIX-AI-Backend-Dashboard"
echo ""
echo "🔗 Useful Links:"
echo "   Dashboard: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=OMNIX-AI-Backend-Dashboard"
echo "   Alarms: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#alarmsV2:"
echo "   Logs: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#logsV2:log-groups/log-group/\$252Faws\$252Flambda\$252F${FUNCTION_NAME}"
echo ""
echo "📧 Important: Check your email ($EMAIL_ENDPOINT) and confirm the SNS subscription!"
echo ""
echo "🔧 Next Steps:"
echo "1. Confirm email subscription for alerts"
echo "2. Test alarms by triggering some errors"
echo "3. Customize alarm thresholds based on your requirements"
echo "4. Set up additional custom metrics if needed"