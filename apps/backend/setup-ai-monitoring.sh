#!/bin/bash

# AI-Specific CloudWatch Monitoring Setup for OMNIX AI Customer Analytics
# Phase 3 - Advanced Monitoring & Cost Tracking

set -e  # Exit on any error

echo "🤖 OMNIX AI - AWS Bedrock & AI Performance Monitoring Setup"
echo "=========================================================="

# Configuration variables
FUNCTION_NAME="omnix-ai-backend-dev"
API_NAME="omnix-ai-api-dev"
REGION="eu-central-1"
SNS_TOPIC_NAME="omnix-ai-ai-alerts-dev"
EMAIL_ENDPOINT="admin@omnix.ai"  # Change this to your email
DASHBOARD_NAME="OMNIX-AI-Customer-Analytics-Dashboard"

echo "📋 AI Monitoring Configuration:"
echo "   Function Name: $FUNCTION_NAME"
echo "   Region: $REGION"
echo "   SNS Topic: $SNS_TOPIC_NAME"
echo "   Dashboard: $DASHBOARD_NAME"
echo ""

# Check AWS CLI setup
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured. Setting up AI monitoring..."
echo ""

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Step 1: Create SNS Topic for AI-specific alerts
echo "📢 Creating SNS topic for AI alerts..."
AI_SNS_TOPIC_ARN=$(aws sns create-topic \
    --name "$SNS_TOPIC_NAME" \
    --region "$REGION" \
    --query 'TopicArn' \
    --output text 2>/dev/null || echo "arn:aws:sns:${REGION}:${ACCOUNT_ID}:${SNS_TOPIC_NAME}")

echo "✅ AI SNS Topic ARN: $AI_SNS_TOPIC_ARN"

# Subscribe email to SNS topic
echo "📧 Subscribing email to AI alerts..."
aws sns subscribe \
    --topic-arn "$AI_SNS_TOPIC_ARN" \
    --protocol email \
    --notification-endpoint "$EMAIL_ENDPOINT" \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Email subscription may already exist"

echo "   ✅ Email subscription for AI alerts created"

# Function to create CloudWatch alarm
create_ai_alarm() {
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
    
    echo "⚠️  Creating AI alarm: $alarm_name"
    
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
        --alarm-actions "$AI_SNS_TOPIC_ARN" \
        --dimensions "$dimensions" \
        --region "$REGION" > /dev/null 2>&1 || echo "     ⚠️  Alarm may already exist"
    
    echo "     ✅ $alarm_name created/updated"
}

# Step 2: Create AI-specific CloudWatch alarms
echo "🤖 Setting up AI performance alarms..."

# AI Analysis High Error Rate (custom metric from our code)
create_ai_alarm \
    "OMNIX-AI-Bedrock-High-Error-Rate" \
    "Alert when Bedrock AI analysis error rate is high" \
    "BedrockAnalysisErrors" \
    "OMNIX/AI" \
    "Sum" \
    300 \
    5 \
    "GreaterThanOrEqualToThreshold" \
    2 \
    "Service=BedrockAnalysis"

# AI Analysis High Latency
create_ai_alarm \
    "OMNIX-AI-Bedrock-High-Latency" \
    "Alert when Bedrock analysis takes too long" \
    "BedrockAnalysisLatency" \
    "OMNIX/AI" \
    "Average" \
    300 \
    15000 \
    "GreaterThanThreshold" \
    3 \
    "Service=BedrockAnalysis"

# Fallback Analysis Usage (too many fallbacks indicate AI service issues)
create_ai_alarm \
    "OMNIX-AI-High-Fallback-Usage" \
    "Alert when too many AI requests fall back to rule-based analysis" \
    "FallbackAnalysisCount" \
    "OMNIX/AI" \
    "Sum" \
    300 \
    10 \
    "GreaterThanThreshold" \
    2 \
    "Service=BedrockAnalysis"

# Cost monitoring alarm (estimated based on API calls)
create_ai_alarm \
    "OMNIX-AI-High-Bedrock-Cost" \
    "Alert when estimated Bedrock costs are high" \
    "BedrockAPICallCount" \
    "OMNIX/AI" \
    "Sum" \
    3600 \
    1000 \
    "GreaterThanThreshold" \
    1 \
    "Service=BedrockAnalysis"

# Step 3: Create comprehensive AI dashboard
echo "📊 Creating AI Customer Analytics Dashboard..."

# Create enhanced dashboard with AI metrics
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
                    [ "OMNIX/AI", "BedrockAnalysisCount", "Service", "BedrockAnalysis" ],
                    [ ".", "FallbackAnalysisCount", ".", "." ],
                    [ ".", "BedrockAnalysisErrors", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "AI Analysis Volume & Errors",
                "period": 300,
                "stat": "Sum"
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
                    [ "OMNIX/AI", "BedrockAnalysisLatency", "Service", "BedrockAnalysis" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "AI Analysis Performance (ms)",
                "period": 300,
                "stat": "Average"
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 6,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "OMNIX/AI", "CustomerAnalysisCount", "AnalysisType", "consumption_prediction" ],
                    [ "...", "customer_profiling" ],
                    [ "...", "recommendation_generation" ]
                ],
                "view": "timeSeries",
                "stacked": true,
                "region": "$REGION",
                "title": "AI Analysis Types",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 8,
            "y": 6,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "OMNIX/AI", "BedrockAPICallCount", "Service", "BedrockAnalysis" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Bedrock API Calls (Cost Tracking)",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 16,
            "y": 6,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "OMNIX/AI", "AIRecommendationAccuracy", "Service", "BedrockAnalysis" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "AI Prediction Confidence",
                "period": 300,
                "stat": "Average"
            }
        },
        {
            "type": "log",
            "x": 0,
            "y": 12,
            "width": 24,
            "height": 6,
            "properties": {
                "query": "SOURCE '/aws/lambda/$FUNCTION_NAME'\n| fields @timestamp, @message\n| filter @message like /🤖/ or @message like /Bedrock/ or @message like /AI/\n| sort @timestamp desc\n| limit 50",
                "region": "$REGION",
                "title": "AI Analysis Logs",
                "view": "table"
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 18,
            "width": 6,
            "height": 4,
            "properties": {
                "metrics": [
                    [ "OMNIX/AI", "BedrockAnalysisCount", "Service", "BedrockAnalysis" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "AI Analyses Today",
                "period": 86400,
                "stat": "Sum"
            }
        },
        {
            "type": "metric",
            "x": 6,
            "y": 18,
            "width": 6,
            "height": 4,
            "properties": {
                "metrics": [
                    [ "OMNIX/AI", "BedrockAnalysisLatency", "Service", "BedrockAnalysis" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "Avg AI Latency (ms)",
                "period": 3600,
                "stat": "Average"
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 18,
            "width": 6,
            "height": 4,
            "properties": {
                "metrics": [
                    [ "OMNIX/AI", "FallbackAnalysisCount", "Service", "BedrockAnalysis" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "Fallback Count Today",
                "period": 86400,
                "stat": "Sum"
            }
        },
        {
            "type": "metric",
            "x": 18,
            "y": 18,
            "width": 6,
            "height": 4,
            "properties": {
                "metrics": [
                    [ "OMNIX/AI", "BedrockAPICallCount", "Service", "BedrockAnalysis" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "API Calls Today",
                "period": 86400,
                "stat": "Sum"
            }
        }
    ]
}
EOF
)

aws cloudwatch put-dashboard \
    --dashboard-name "$DASHBOARD_NAME" \
    --dashboard-body "$DASHBOARD_BODY" \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Dashboard creation failed"

echo "   ✅ AI Dashboard created: $DASHBOARD_NAME"

echo ""
echo "🎉 AI Monitoring setup complete!"
echo ""
echo "📊 Created AI Resources:"
echo "   ✅ SNS Topic: $AI_SNS_TOPIC_ARN"
echo "   ✅ AI-specific alarms: Bedrock errors, latency, fallback usage, costs"
echo "   ✅ AI CloudWatch Dashboard: $DASHBOARD_NAME"
echo ""
echo "🔗 Useful Links:"
echo "   AI Dashboard: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=${DASHBOARD_NAME}"
echo "   AI Alarms: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#alarmsV2:"
echo "   AI Logs: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#logsV2:log-groups/log-group/\$252Faws\$252Flambda\$252F${FUNCTION_NAME}"
echo ""
echo "📧 Important: Check your email ($EMAIL_ENDPOINT) and confirm the AI alert subscription!"
echo ""
echo "🤖 AI Monitoring Features:"
echo "   • Bedrock API call volume and costs"
echo "   • AI analysis performance and latency"
echo "   • Error rates and fallback usage"
echo "   • Customer analysis type breakdown"
echo "   • Prediction accuracy tracking"
echo ""
echo "🔧 Next Steps:"
echo "1. Deploy the enhanced Bedrock service with custom metrics"
echo "2. Run test AI analyses to populate metrics"
echo "3. Set cost budgets based on expected Bedrock usage"
echo "4. Configure custom alerts for business KPIs"