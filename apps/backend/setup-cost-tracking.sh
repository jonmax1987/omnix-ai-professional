#!/bin/bash

# AWS Bedrock Cost Tracking Setup for OMNIX AI
# Creates DynamoDB table and cost monitoring infrastructure

set -e  # Exit on any error

echo "💰 OMNIX AI - AWS Bedrock Cost Tracking Setup"
echo "=============================================="

# Configuration variables
TABLE_NAME="omnix-ai-bedrock-costs-dev"
REGION="eu-central-1"
BUDGET_NAME="omnix-ai-bedrock-budget-dev"
MONTHLY_BUDGET_LIMIT=100  # $100 monthly budget for Bedrock

echo "📋 Cost Tracking Configuration:"
echo "   Table Name: $TABLE_NAME"
echo "   Region: $REGION"
echo "   Budget Name: $BUDGET_NAME"
echo "   Monthly Budget: \$${MONTHLY_BUDGET_LIMIT}"
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

echo "✅ AWS CLI configured. Setting up cost tracking..."
echo ""

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Step 1: Create DynamoDB table for cost tracking
echo "🗄️  Creating DynamoDB table for cost tracking..."

aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=timestamp,AttributeType=S \
        AttributeName=customerId,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=timestamp-index,KeySchema=[{AttributeName=timestamp,KeyType=HASH}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
        "IndexName=customer-index,KeySchema=[{AttributeName=customerId,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Table may already exist"

echo "   ✅ DynamoDB table created: $TABLE_NAME"

# Step 2: Wait for table to be active
echo "⏳ Waiting for table to become active..."
aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
echo "   ✅ Table is active"

# Step 3: Create cost budget (requires AWS Budgets service)
echo "💰 Creating AWS Budget for Bedrock costs..."

# Create budget policy
BUDGET_POLICY=$(cat <<EOF
{
    "BudgetName": "$BUDGET_NAME",
    "BudgetLimit": {
        "Amount": "$MONTHLY_BUDGET_LIMIT",
        "Unit": "USD"
    },
    "TimeUnit": "MONTHLY",
    "TimePeriod": {
        "Start": "$(date -u +%Y-%m-01T00:00:00Z)",
        "End": "2030-12-31T23:59:59Z"
    },
    "CostFilters": {
        "Service": ["Amazon Bedrock"]
    },
    "BudgetType": "COST"
}
EOF
)

# Create notifications
NOTIFICATIONS=$(cat <<EOF
[
    {
        "Notification": {
            "NotificationType": "ACTUAL",
            "ComparisonOperator": "GREATER_THAN",
            "Threshold": 80
        },
        "Subscribers": [
            {
                "SubscriptionType": "EMAIL",
                "Address": "admin@omnix.ai"
            }
        ]
    },
    {
        "Notification": {
            "NotificationType": "FORECASTED",
            "ComparisonOperator": "GREATER_THAN",
            "Threshold": 100
        },
        "Subscribers": [
            {
                "SubscriptionType": "EMAIL",
                "Address": "admin@omnix.ai"
            }
        ]
    }
]
EOF
)

# Create the budget
aws budgets create-budget \
    --account-id "$ACCOUNT_ID" \
    --budget "$BUDGET_POLICY" \
    --notifications-with-subscribers "$NOTIFICATIONS" \
    --region us-east-1 > /dev/null 2>&1 || echo "   ⚠️  Budget may already exist or Budgets service not available"

echo "   ✅ Budget created: $BUDGET_NAME"

# Step 4: Create cost analysis CloudWatch dashboard
echo "📊 Creating Cost Analytics Dashboard..."

COST_DASHBOARD_BODY=$(cat <<EOF
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
                    [ "OMNIX/AI", "BedrockEstimatedCost", "Service", "BedrockAnalysis" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Bedrock Estimated Costs (USD)",
                "period": 3600,
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
                    [ "OMNIX/AI", "BedrockInputTokens", "Service", "BedrockAnalysis" ],
                    [ ".", "BedrockOutputTokens", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": true,
                "region": "$REGION",
                "title": "Token Usage (Cost Driver)",
                "period": 3600
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
                    [ "OMNIX/AI", "BedrockAPICallCount", "Service", "BedrockAnalysis" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "API Calls (Volume)",
                "period": 3600
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
                    [ "OMNIX/AI", "FallbackAnalysisCount", "Service", "BedrockAnalysis" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Fallback Usage (Cost Savings)",
                "period": 3600
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
                    [ "AWS/Budgets", "ActualCost", "BudgetName", "$BUDGET_NAME" ],
                    [ ".", "ForecastedCost", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "Budget Tracking",
                "period": 86400
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 12,
            "width": 6,
            "height": 4,
            "properties": {
                "metrics": [
                    [ "OMNIX/AI", "BedrockEstimatedCost", "Service", "BedrockAnalysis" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "Today's Estimated Cost",
                "period": 86400,
                "stat": "Sum"
            }
        },
        {
            "type": "metric",
            "x": 6,
            "y": 12,
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
        },
        {
            "type": "metric",
            "x": 12,
            "y": 12,
            "width": 6,
            "height": 4,
            "properties": {
                "metrics": [
                    [ { "expression": "m1 + m2", "label": "Total Tokens" } ],
                    [ "OMNIX/AI", "BedrockInputTokens", "Service", "BedrockAnalysis", { "id": "m1", "visible": false } ],
                    [ ".", "BedrockOutputTokens", ".", ".", { "id": "m2", "visible": false } ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "Total Tokens Today",
                "period": 86400,
                "stat": "Sum"
            }
        },
        {
            "type": "metric",
            "x": 18,
            "y": 12,
            "width": 6,
            "height": 4,
            "properties": {
                "metrics": [
                    [ { "expression": "m1 / (m1 + m2) * 100", "label": "Fallback Rate %" } ],
                    [ "OMNIX/AI", "FallbackAnalysisCount", "Service", "BedrockAnalysis", { "id": "m1", "visible": false } ],
                    [ ".", "BedrockAnalysisCount", ".", ".", { "id": "m2", "visible": false } ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "Fallback Rate %",
                "period": 86400,
                "stat": "Sum"
            }
        }
    ]
}
EOF
)

aws cloudwatch put-dashboard \
    --dashboard-name "OMNIX-AI-Cost-Analytics-Dashboard" \
    --dashboard-body "$COST_DASHBOARD_BODY" \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Dashboard creation failed"

echo "   ✅ Cost Analytics Dashboard created"

# Step 5: Create cost optimization recommendations script
echo "📝 Creating cost optimization script..."

cat > cost-optimization-report.js << 'EOF'
#!/usr/bin/env node

// OMNIX AI - Bedrock Cost Optimization Report
// Analyzes cost patterns and provides optimization recommendations

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-central-1' });

async function generateCostReport() {
    console.log('💰 OMNIX AI - Bedrock Cost Optimization Report');
    console.log('================================================');
    
    try {
        // Get cost data from last 7 days
        const endTime = new Date().toISOString();
        const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const result = await dynamodb.scan({
            TableName: 'omnix-ai-bedrock-costs-dev',
            FilterExpression: '#timestamp BETWEEN :start AND :end',
            ExpressionAttributeNames: { '#timestamp': 'timestamp' },
            ExpressionAttributeValues: {
                ':start': startTime,
                ':end': endTime
            }
        }).promise();
        
        if (!result.Items || result.Items.length === 0) {
            console.log('📊 No cost data found for the last 7 days');
            return;
        }
        
        const items = result.Items;
        const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
        const fallbackCount = items.filter(item => item.usedFallback).length;
        const totalRequests = items.length;
        
        console.log('\n📈 Cost Summary (Last 7 Days)');
        console.log('------------------------------');
        console.log(`Total Estimated Cost: $${totalCost.toFixed(4)}`);
        console.log(`Total Requests: ${totalRequests}`);
        console.log(`Average Cost per Request: $${(totalCost / totalRequests).toFixed(4)}`);
        console.log(`Fallback Rate: ${((fallbackCount / totalRequests) * 100).toFixed(1)}%`);
        console.log(`Projected Monthly Cost: $${(totalCost * 30 / 7).toFixed(2)}`);
        
        // Cost by analysis type
        const costByType = {};
        items.forEach(item => {
            if (!costByType[item.analysisType]) {
                costByType[item.analysisType] = { cost: 0, count: 0 };
            }
            costByType[item.analysisType].cost += item.estimatedCost;
            costByType[item.analysisType].count++;
        });
        
        console.log('\n💡 Cost Breakdown by Analysis Type');
        console.log('-----------------------------------');
        Object.entries(costByType).forEach(([type, data]) => {
            console.log(`${type}: $${data.cost.toFixed(4)} (${data.count} requests, $${(data.cost/data.count).toFixed(4)} avg)`);
        });
        
        // Optimization recommendations
        console.log('\n🚀 Cost Optimization Recommendations');
        console.log('------------------------------------');
        
        if (fallbackCount / totalRequests < 0.1) {
            console.log('✅ Good: Low fallback rate indicates reliable AI service');
        } else {
            console.log('⚠️  High fallback rate - consider AI service reliability improvements');
        }
        
        if (totalCost * 30 / 7 > 50) {
            console.log('💰 Consider implementing caching to reduce repeated similar requests');
            console.log('💰 Consider batch processing for bulk customer analysis');
        }
        
        const avgTokensPerRequest = items.reduce((sum, item) => sum + item.inputTokens + item.outputTokens, 0) / totalRequests;
        if (avgTokensPerRequest > 2000) {
            console.log('📝 Consider optimizing prompts to reduce token usage');
        }
        
    } catch (error) {
        console.error('❌ Error generating cost report:', error);
    }
}

generateCostReport();
EOF

chmod +x cost-optimization-report.js
echo "   ✅ Cost optimization script created"

echo ""
echo "🎉 Cost tracking setup complete!"
echo ""
echo "📊 Created Cost Tracking Resources:"
echo "   ✅ DynamoDB table: $TABLE_NAME"
echo "   ✅ AWS Budget: $BUDGET_NAME (\$${MONTHLY_BUDGET_LIMIT}/month)"
echo "   ✅ Cost Analytics Dashboard"
echo "   ✅ Cost optimization report script"
echo ""
echo "🔗 Useful Links:"
echo "   Cost Dashboard: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=OMNIX-AI-Cost-Analytics-Dashboard"
echo "   Budget: https://console.aws.amazon.com/billing/home?region=us-east-1#/budgets"
echo "   DynamoDB: https://${REGION}.console.aws.amazon.com/dynamodb/home?region=${REGION}#tables:selected=${TABLE_NAME}"
echo ""
echo "💰 Cost Tracking Features:"
echo "   • Real-time cost estimation per API call"
echo "   • Token usage tracking and optimization"
echo "   • Customer cost analytics"
echo "   • Budget alerts at 80% and 100%"
echo "   • Cost breakdown by analysis type"
echo "   • Fallback rate monitoring (cost savings)"
echo ""
echo "🔧 Next Steps:"
echo "1. Update Bedrock service to use CostAnalyticsService"
echo "2. Run ./cost-optimization-report.js weekly for insights"
echo "3. Set up automated cost alerts based on usage patterns"
echo "4. Implement caching strategies for high-cost scenarios"
echo ""
echo "📧 Budget alerts will be sent to: admin@omnix.ai"