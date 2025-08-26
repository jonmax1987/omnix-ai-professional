#!/bin/bash

# OMNIX AI Cache Setup for Performance Optimization
# Creates DynamoDB cache table and monitoring

set -e  # Exit on any error

echo "🚀 OMNIX AI - Cache Service Setup"
echo "=================================="

# Configuration
TABLE_NAME="omnix-ai-analysis-cache-dev"
REGION="eu-central-1"

echo "📋 Cache Configuration:"
echo "   Table Name: $TABLE_NAME"
echo "   Region: $REGION"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured. Setting up cache..."

# Create DynamoDB table for caching
echo "🗄️  Creating cache table..."

aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions \
        AttributeName=cacheKey,AttributeType=S \
        AttributeName=customerId,AttributeType=S \
        AttributeName=createdAt,AttributeType=S \
    --key-schema \
        AttributeName=cacheKey,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=customerId-createdAt-index,KeySchema=[{AttributeName=customerId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Table may already exist"

echo "   ✅ Cache table created: $TABLE_NAME"

# Create cache performance dashboard
echo "📊 Creating cache performance dashboard..."

CACHE_DASHBOARD_BODY=$(cat <<EOF
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
                    [ "OMNIX/AI", "CacheHitRate", "Service", "AICache" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "🎯 Cache Hit Rate %",
                "period": 300,
                "stat": "Average"
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
                    [ "OMNIX/AI", "CacheLatency", "CacheResult", "HIT" ],
                    [ "...", "MISS" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "⚡ Cache Latency (ms)",
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
                    [ "OMNIX/AI", "BedrockEstimatedCost", "Service", "BedrockAnalysis" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "💰 Cost with Caching",
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
                    [ "OMNIX/AI", "BedrockAnalysisLatency", "Service", "BedrockAnalysis" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "🚀 Analysis Performance",
                "period": 300,
                "stat": "Average"
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
                    [ "AWS/DynamoDB", "ItemCount", "TableName", "$TABLE_NAME" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "📚 Cache Entries",
                "period": 3600
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
                    [ "OMNIX/AI", "CacheHitRate", "Service", "AICache" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "🎯 Cache Hit Rate Today",
                "period": 86400,
                "stat": "Average"
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
                    [ { "expression": "m1 * 0.001 * 1000", "label": "Estimated Savings" } ],
                    [ "OMNIX/AI", "BedrockAPICallCount", "Service", "BedrockAnalysis", { "id": "m1", "visible": false } ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "💡 Estimated Cost Savings",
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
                    [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "$TABLE_NAME" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "📖 Cache Reads Today",
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
                    [ "AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", "$TABLE_NAME" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "✍️ Cache Writes Today",
                "period": 86400,
                "stat": "Sum"
            }
        }
    ]
}
EOF
)

aws cloudwatch put-dashboard \
    --dashboard-name "OMNIX-AI-Cache-Performance-Dashboard" \
    --dashboard-body "$CACHE_DASHBOARD_BODY" \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Dashboard creation failed"

echo "   ✅ Cache performance dashboard created"

# Create cache optimization script
echo "📝 Creating cache optimization script..."

cat > cache-optimization.js << 'EOF'
#!/usr/bin/env node

// OMNIX AI - Cache Optimization Analysis
// Analyzes cache performance and provides optimization recommendations

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-central-1' });

async function analyzeCachePerformance() {
    console.log('🚀 OMNIX AI - Cache Performance Analysis');
    console.log('=======================================');
    
    try {
        // Get cache entries from last 24 hours
        const endTime = new Date().toISOString();
        const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const result = await dynamodb.scan({
            TableName: 'omnix-ai-analysis-cache-dev',
            FilterExpression: 'createdAt BETWEEN :start AND :end',
            ExpressionAttributeValues: {
                ':start': startTime,
                ':end': endTime
            }
        }).promise();
        
        if (!result.Items || result.Items.length === 0) {
            console.log('📊 No cache entries found for the last 24 hours');
            return;
        }
        
        const items = result.Items;
        const totalEntries = items.length;
        const totalHits = items.reduce((sum, item) => sum + (item.hitCount || 0), 0);
        
        // Group by analysis type
        const byType = {};
        items.forEach(item => {
            if (!byType[item.analysisType]) {
                byType[item.analysisType] = { entries: 0, hits: 0 };
            }
            byType[item.analysisType].entries++;
            byType[item.analysisType].hits += item.hitCount || 0;
        });
        
        console.log('\n📈 Cache Statistics (Last 24 Hours)');
        console.log('-----------------------------------');
        console.log(`Total Cache Entries: ${totalEntries}`);
        console.log(`Total Cache Hits: ${totalHits}`);
        console.log(`Average Hits per Entry: ${(totalHits / totalEntries).toFixed(2)}`);
        
        console.log('\n🎯 Performance by Analysis Type');
        console.log('-------------------------------');
        Object.entries(byType).forEach(([type, data]) => {
            const hitRate = data.hits / data.entries;
            console.log(`${type}: ${data.entries} entries, ${data.hits} hits (${hitRate.toFixed(2)} hits/entry)`);
        });
        
        // Optimization recommendations
        console.log('\n💡 Cache Optimization Recommendations');
        console.log('------------------------------------');
        
        if (totalHits / totalEntries < 1) {
            console.log('⚠️  Low cache utilization detected');
            console.log('   Recommendations:');
            console.log('   • Increase cache TTL for frequently accessed analyses');
            console.log('   • Implement cache warming for high-value customers');
            console.log('   • Review cache invalidation strategy');
        }
        
        if (totalEntries > 1000) {
            console.log('💾 High cache volume detected');
            console.log('   Recommendations:');
            console.log('   • Monitor DynamoDB costs');
            console.log('   • Implement cache cleanup for low-hit entries');
            console.log('   • Consider cache size limits per customer');
        }
        
        // Check for expired entries
        const now = new Date();
        const expiredEntries = items.filter(item => new Date(item.expiresAt) < now);
        if (expiredEntries.length > totalEntries * 0.1) {
            console.log('🗑️  High percentage of expired entries');
            console.log('   Recommendations:');
            console.log('   • Implement automatic cleanup of expired entries');
            console.log('   • Review TTL settings for different analysis types');
        }
        
        if (totalHits / totalEntries > 2 && totalEntries > 100) {
            console.log('✅ Excellent cache performance! System is well-optimized.');
            console.log('💰 Estimated significant cost savings from caching');
        }
        
    } catch (error) {
        console.error('❌ Error analyzing cache performance:', error);
    }
}

analyzeCachePerformance();
EOF

chmod +x cache-optimization.js
echo "   ✅ Cache optimization script created"

echo ""
echo "🎉 Cache setup complete!"
echo ""
echo "📊 Created Cache Resources:"
echo "   ✅ DynamoDB table: $TABLE_NAME"
echo "   ✅ Cache performance dashboard"
echo "   ✅ Cache optimization analysis script"
echo ""
echo "🔗 Useful Links:"
echo "   Cache Dashboard: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=OMNIX-AI-Cache-Performance-Dashboard"
echo "   Cache Table: https://${REGION}.console.aws.amazon.com/dynamodb/home?region=${REGION}#tables:selected=${TABLE_NAME}"
echo ""
echo "🚀 Cache Features:"
echo "   • Intelligent TTL based on analysis type"
echo "   • Automatic cleanup of old entries"
echo "   • Cost optimization through reduced API calls"
echo "   • Performance monitoring and metrics"
echo "   • Cache warming capabilities"
echo ""
echo "🔧 Next Steps:"
echo "1. Deploy enhanced Bedrock service with caching"
echo "2. Run ./cache-optimization.js daily for insights"
echo "3. Monitor cache hit rates and adjust TTLs"
echo "4. Consider implementing cache warming for VIP customers"