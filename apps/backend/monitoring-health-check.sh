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
