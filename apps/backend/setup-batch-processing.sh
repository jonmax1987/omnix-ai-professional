#!/bin/bash

# OMNIX AI Batch Processing Setup
# Creates SQS queue, DynamoDB table, and monitoring for large-scale customer analysis

set -e  # Exit on any error

echo "⚡ OMNIX AI - Batch Processing Setup"
echo "===================================="

# Configuration
QUEUE_NAME="omnix-ai-batch-queue-dev"
JOBS_TABLE_NAME="omnix-ai-batch-jobs-dev"
DLQ_NAME="omnix-ai-batch-dlq-dev"
REGION="eu-central-1"

echo "📋 Batch Processing Configuration:"
echo "   Queue Name: $QUEUE_NAME"
echo "   Jobs Table: $JOBS_TABLE_NAME"
echo "   Dead Letter Queue: $DLQ_NAME"
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

echo "✅ AWS CLI configured. Setting up batch processing..."

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Step 1: Create Dead Letter Queue (DLQ)
echo "💀 Creating Dead Letter Queue..."

DLQ_URL=$(aws sqs create-queue \
    --queue-name "$DLQ_NAME.fifo" \
    --attributes '{
        "FifoQueue": "true",
        "ContentBasedDeduplication": "true",
        "MessageRetentionPeriod": "1209600"
    }' \
    --region "$REGION" \
    --query 'QueueUrl' \
    --output text 2>/dev/null || echo "")

if [ -z "$DLQ_URL" ]; then
    # Try to get existing queue URL
    DLQ_URL=$(aws sqs get-queue-url --queue-name "$DLQ_NAME.fifo" --region "$REGION" --query 'QueueUrl' --output text 2>/dev/null || echo "")
fi

echo "   ✅ Dead Letter Queue: $DLQ_URL"

# Get DLQ ARN
DLQ_ARN=$(aws sqs get-queue-attributes \
    --queue-url "$DLQ_URL" \
    --attribute-names QueueArn \
    --region "$REGION" \
    --query 'Attributes.QueueArn' \
    --output text)

# Step 2: Create main SQS queue with FIFO
echo "📋 Creating batch processing queue..."

QUEUE_URL=$(aws sqs create-queue \
    --queue-name "$QUEUE_NAME.fifo" \
    --attributes "$(cat <<EOF
{
    "FifoQueue": "true",
    "ContentBasedDeduplication": "true",
    "MessageRetentionPeriod": "1209600",
    "VisibilityTimeoutSeconds": "1800",
    "RedrivePolicy": "{\"deadLetterTargetArn\":\"$DLQ_ARN\",\"maxReceiveCount\":3}"
}
EOF
)" \
    --region "$REGION" \
    --query 'QueueUrl' \
    --output text 2>/dev/null || echo "")

if [ -z "$QUEUE_URL" ]; then
    # Try to get existing queue URL
    QUEUE_URL=$(aws sqs get-queue-url --queue-name "$QUEUE_NAME.fifo" --region "$REGION" --query 'QueueUrl' --output text 2>/dev/null || echo "")
fi

echo "   ✅ Main Queue: $QUEUE_URL"

# Step 3: Create DynamoDB table for batch jobs
echo "🗄️  Creating batch jobs table..."

aws dynamodb create-table \
    --table-name "$JOBS_TABLE_NAME" \
    --attribute-definitions \
        AttributeName=jobId,AttributeType=S \
        AttributeName=status,AttributeType=S \
        AttributeName=createdAt,AttributeType=S \
    --key-schema \
        AttributeName=jobId,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=status-createdAt-index,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Table may already exist"

echo "   ✅ Jobs table created: $JOBS_TABLE_NAME"

# Step 4: Create batch processing dashboard
echo "📊 Creating batch processing dashboard..."

BATCH_DASHBOARD_BODY=$(cat <<EOF
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
                    [ "AWS/SQS", "NumberOfMessagesSent", "QueueName", "$QUEUE_NAME.fifo" ],
                    [ ".", "NumberOfMessagesReceived", ".", "." ],
                    [ ".", "NumberOfMessagesDeleted", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "📋 Batch Queue Activity",
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
                    [ "AWS/SQS", "ApproximateNumberOfVisibleMessages", "QueueName", "$QUEUE_NAME.fifo" ],
                    [ ".", "ApproximateNumberOfMessagesNotVisible", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "🎯 Queue Depth",
                "period": 300
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
                    [ "OMNIX/AI", "BatchJobsSubmitted", "BatchId", ".*" ],
                    [ ".", "BatchJobsCompleted", ".", "." ],
                    [ ".", "BatchJobsFailed", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "⚡ Batch Job Status",
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
                    [ "OMNIX/AI", "BatchEstimatedCost", "BatchId", ".*" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "💰 Batch Processing Costs",
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
                    [ "AWS/DynamoDB", "ItemCount", "TableName", "$JOBS_TABLE_NAME" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "📚 Active Jobs",
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
                    [ "AWS/SQS", "ApproximateNumberOfVisibleMessages", "QueueName", "$QUEUE_NAME.fifo" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "📋 Messages in Queue",
                "period": 300
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
                    [ "AWS/SQS", "ApproximateAgeOfOldestMessage", "QueueName", "$QUEUE_NAME.fifo" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "⏱️ Oldest Message Age (s)",
                "period": 300
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
                    [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "$JOBS_TABLE_NAME" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "📖 DB Reads Today",
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
                    [ "AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", "$JOBS_TABLE_NAME" ]
                ],
                "view": "singleValue",
                "stacked": false,
                "region": "$REGION",
                "title": "✍️ DB Writes Today",
                "period": 86400,
                "stat": "Sum"
            }
        }
    ]
}
EOF
)

aws cloudwatch put-dashboard \
    --dashboard-name "OMNIX-AI-Batch-Processing-Dashboard" \
    --dashboard-body "$BATCH_DASHBOARD_BODY" \
    --region "$REGION" > /dev/null 2>&1 || echo "   ⚠️  Dashboard creation failed"

echo "   ✅ Batch processing dashboard created"

# Step 5: Create batch job processor script
echo "📝 Creating batch job processor script..."

cat > batch-processor.js << 'EOF'
#!/usr/bin/env node

// OMNIX AI - Batch Job Processor
// Processes batch analysis jobs from SQS queue

const { BatchProcessingService } = require('./src/services/batch-processing.service');

async function startBatchProcessor() {
    console.log('🚀 Starting OMNIX AI Batch Processor');
    console.log('===================================');
    
    const batchService = new BatchProcessingService();
    
    try {
        // Get queue stats
        const queueStats = await batchService.getQueueStats();
        console.log('📊 Queue Statistics:');
        console.log(`   Messages in queue: ${queueStats.approximateNumberOfMessages}`);
        console.log(`   Processing: ${queueStats.approximateNumberOfMessagesNotVisible}`);
        console.log(`   Oldest message age: ${queueStats.approximateAgeOfOldestMessage}s`);
        console.log('');
        
        if (queueStats.approximateNumberOfMessages === 0) {
            console.log('📭 No messages in queue. Exiting...');
            return;
        }
        
        // Start processing (this will run continuously)
        console.log('⚡ Starting batch job processing...');
        await batchService.processBatchJobs(10); // Max 10 concurrent jobs
        
    } catch (error) {
        console.error('❌ Batch processor failed:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

if (require.main === module) {
    startBatchProcessor().catch(console.error);
}
EOF

chmod +x batch-processor.js
echo "   ✅ Batch processor script created"

# Step 6: Create batch analysis example script
echo "📝 Creating batch analysis example..."

cat > example-batch-analysis.js << 'EOF'
#!/usr/bin/env node

// OMNIX AI - Batch Analysis Example
// Demonstrates how to submit large batch analysis requests

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Sample test customers with purchase history
const generateTestCustomers = (count = 50) => {
    const customers = [];
    const products = [
        { name: 'Milk', category: 'Dairy', price: 3.50 },
        { name: 'Bread', category: 'Bakery', price: 2.25 },
        { name: 'Chicken', category: 'Meat', price: 8.99 },
        { name: 'Bananas', category: 'Fruits', price: 1.29 },
        { name: 'Yogurt', category: 'Dairy', price: 4.50 },
    ];
    
    for (let i = 0; i < count; i++) {
        const customerId = `batch-customer-${i + 1}`;
        const purchases = [];
        
        // Generate 20-50 purchases per customer over last 6 months
        const numPurchases = Math.floor(Math.random() * 30) + 20;
        
        for (let j = 0; j < numPurchases; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const daysAgo = Math.floor(Math.random() * 180);
            const purchaseDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
            
            purchases.push({
                productId: `prod-${product.name.toLowerCase()}`,
                productName: product.name,
                category: product.category,
                quantity: Math.floor(Math.random() * 3) + 1,
                price: product.price,
                purchaseDate: purchaseDate.toISOString(),
            });
        }
        
        customers.push({
            customerId,
            purchases: purchases.sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate)),
            priority: i < 10 ? 'high' : (i < 30 ? 'normal' : 'low'), // First 10 are high priority
        });
    }
    
    return customers;
};

async function runBatchAnalysisExample() {
    console.log('⚡ OMNIX AI - Batch Analysis Example');
    console.log('===================================');
    
    try {
        // Generate test customers
        console.log('🔄 Generating test customers...');
        const customers = generateTestCustomers(100); // 100 customers
        
        console.log(`✅ Generated ${customers.length} test customers`);
        console.log(`   Average purchases per customer: ${Math.round(customers.reduce((sum, c) => sum + c.purchases.length, 0) / customers.length)}`);
        
        // Submit batch request
        console.log('\n📋 Submitting batch analysis request...');
        
        const batchRequest = {
            customers,
            analysisTypes: ['consumption_prediction', 'customer_profiling', 'recommendation_generation'],
            options: {
                maxConcurrent: 10,
                batchSize: 20,
                delayBetweenBatches: 1000, // 1 second
            },
        };
        
        const response = await axios.post(`${API_BASE_URL}/v1/customers/batch-analysis`, batchRequest);
        
        const { batchId, jobCount, estimatedCost } = response.data;
        
        console.log(`✅ Batch request submitted successfully!`);
        console.log(`   Batch ID: ${batchId}`);
        console.log(`   Jobs created: ${jobCount}`);
        console.log(`   Estimated cost: $${estimatedCost.toFixed(4)}`);
        
        // Monitor batch progress
        console.log('\n📊 Monitoring batch progress...');
        let completed = false;
        let attempts = 0;
        const maxAttempts = 60; // 10 minutes max
        
        while (!completed && attempts < maxAttempts) {
            attempts++;
            
            try {
                const statusResponse = await axios.get(`${API_BASE_URL}/v1/customers/batch-analysis/${batchId}`);
                const { stats, jobs } = statusResponse.data;
                
                const progress = stats.totalJobs > 0 ? ((stats.completedJobs + stats.failedJobs) / stats.totalJobs * 100) : 0;
                
                console.log(`   Progress: ${progress.toFixed(1)}% (${stats.completedJobs}/${stats.totalJobs} completed, ${stats.failedJobs} failed, ${stats.processingJobs} processing)`);
                
                if (stats.completedJobs + stats.failedJobs === stats.totalJobs) {
                    completed = true;
                    console.log('\n🎉 Batch analysis completed!');
                    console.log(`   Success rate: ${stats.successRate.toFixed(1)}%`);
                    console.log(`   Average processing time: ${stats.averageProcessingTime.toFixed(2)}s`);
                    console.log(`   Total cost: $${stats.totalCost.toFixed(4)}`);
                    
                    if (stats.failedJobs > 0) {
                        console.log(`   ⚠️  ${stats.failedJobs} jobs failed - check logs for details`);
                    }
                    
                    break;
                }
                
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
                
            } catch (error) {
                console.log(`   ⚠️  Status check failed: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds on error
            }
        }
        
        if (!completed) {
            console.log('\n⏰ Batch monitoring timeout reached. Check dashboard for current status.');
        }
        
    } catch (error) {
        console.error('❌ Batch analysis example failed:', error.response?.data || error.message);
    }
}

if (require.main === module) {
    runBatchAnalysisExample().catch(console.error);
}

module.exports = { runBatchAnalysisExample, generateTestCustomers };
EOF

chmod +x example-batch-analysis.js
echo "   ✅ Batch analysis example created"

echo ""
echo "🎉 Batch processing setup complete!"
echo ""
echo "📊 Created Batch Processing Resources:"
echo "   ✅ SQS Queue (FIFO): $QUEUE_URL"
echo "   ✅ Dead Letter Queue: $DLQ_URL"
echo "   ✅ Jobs Table: $JOBS_TABLE_NAME"
echo "   ✅ Batch processing dashboard"
echo "   ✅ Batch job processor script"
echo "   ✅ Example batch analysis script"
echo ""
echo "🔗 Useful Links:"
echo "   Batch Dashboard: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=OMNIX-AI-Batch-Processing-Dashboard"
echo "   SQS Console: https://${REGION}.console.aws.amazon.com/sqs/v3/home?region=${REGION}#/queues"
echo "   Jobs Table: https://${REGION}.console.aws.amazon.com/dynamodb/home?region=${REGION}#tables:selected=${JOBS_TABLE_NAME}"
echo ""
echo "⚡ Batch Processing Features:"
echo "   • FIFO queue with exactly-once processing"
echo "   • Dead letter queue for failed messages"
echo "   • Priority-based job processing"
echo "   • Comprehensive job tracking and monitoring"
echo "   • Cost estimation and optimization"
echo "   • Scalable concurrent processing"
echo ""
echo "🔧 Next Steps:"
echo "1. Start batch processor: node batch-processor.js"
echo "2. Test with example: node example-batch-analysis.js"
echo "3. Monitor via dashboard and CloudWatch logs"
echo "4. Scale processing by running multiple processors"
echo ""
echo "💡 Production Tips:"
echo "   • Run batch-processor.js as a service/daemon"
echo "   • Monitor queue depth and adjust concurrency"
echo "   • Set up auto-scaling based on queue metrics"
echo "   • Implement job priorities for VIP customers"