#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CoreStack } from '../lib/stacks/core-stack';
import { StreamingStack } from '../lib/stacks/streaming-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';
import { getEnvironmentConfig } from '../lib/config/environment';

// Get environment from context or default to 'dev'
const envName = process.env.CDK_ENV || process.env.NODE_ENV || 'dev';
const config = getEnvironmentConfig(envName);

const app = new cdk.App();

// Get environment from CDK context
const contextEnv = app.node.tryGetContext('env') || envName;
const finalConfig = getEnvironmentConfig(contextEnv);

// Define AWS environment
const env = {
  account: finalConfig.account || process.env.CDK_DEFAULT_ACCOUNT,
  region: finalConfig.region,
};

// Stack naming convention
const getStackName = (stackType: string, stage: string): string => {
  return `omnix-ai-${stackType}-${stage}`;
};

// Core Stack - Contains Lambda, API Gateway, DynamoDB, Secrets
const coreStack = new CoreStack(app, getStackName('core', finalConfig.stage), {
  config: finalConfig,
  env,
  description: `OMNIX AI Core Infrastructure - ${finalConfig.stage}`,
  tags: {
    Environment: finalConfig.stage,
    Project: 'omnix-ai',
    Component: 'core',
    Owner: 'engineering-team',
    CostCenter: 'product-development',
    ManagedBy: 'aws-cdk',
  },
});

// Streaming Stack - Contains Kinesis, SQS, EventBridge
const streamingStack = new StreamingStack(app, getStackName('streaming', finalConfig.stage), {
  config: finalConfig,
  lambdaFunction: coreStack.lambdaFunction.function,
  env,
  description: `OMNIX AI Streaming Infrastructure - ${finalConfig.stage}`,
  tags: {
    Environment: finalConfig.stage,
    Project: 'omnix-ai',
    Component: 'streaming',
    Owner: 'engineering-team',
    CostCenter: 'product-development',
    ManagedBy: 'aws-cdk',
  },
});

// Add dependency - Streaming stack depends on Core stack
streamingStack.addDependency(coreStack);

// Monitoring Stack - Contains CloudWatch, SNS, Alarms
const monitoringStack = new MonitoringStack(app, getStackName('monitoring', finalConfig.stage), {
  config: finalConfig,
  lambdaFunction: coreStack.lambdaFunction.function,
  restApi: coreStack.apiGateway.restApi,
  dynamodbTables: [
    coreStack.dynamodbTables.usersTable,
    coreStack.dynamodbTables.productsTable,
    coreStack.dynamodbTables.ordersTable,
    coreStack.dynamodbTables.inventoryTable,
    coreStack.dynamodbTables.sessionsTable,
    coreStack.dynamodbTables.customerProfilesTable,
    coreStack.dynamodbTables.purchaseHistoryTable,
    coreStack.dynamodbTables.productInteractionsTable,
    coreStack.dynamodbTables.recommendationsTable,
    coreStack.dynamodbTables.abTestResultsTable,
    coreStack.dynamodbTables.costAnalyticsTable,
    coreStack.dynamodbTables.segmentationTable,
    coreStack.dynamodbTables.streamingAnalyticsTable,
    coreStack.dynamodbTables.aiAnalysisHistoryTable,
  ],
  kinesisStreams: [
    streamingStack.kinesisStreams.customerEventsStream,
    streamingStack.kinesisStreams.analyticsStream,
  ],
  sqsQueues: [
    streamingStack.sqsQueues.aiAnalysisQueue,
    streamingStack.sqsQueues.batchProcessingQueue,
    streamingStack.sqsQueues.notificationQueue,
    streamingStack.sqsQueues.segmentationQueue,
    streamingStack.sqsQueues.aiAnalysisDLQ,
    streamingStack.sqsQueues.batchProcessingDLQ,
    streamingStack.sqsQueues.notificationDLQ,
    streamingStack.sqsQueues.segmentationDLQ,
  ],
  env,
  description: `OMNIX AI Monitoring Infrastructure - ${finalConfig.stage}`,
  tags: {
    Environment: finalConfig.stage,
    Project: 'omnix-ai',
    Component: 'monitoring',
    Owner: 'engineering-team',
    CostCenter: 'product-development',
    ManagedBy: 'aws-cdk',
  },
});

// Add dependencies - Monitoring stack depends on both Core and Streaming stacks
monitoringStack.addDependency(coreStack);
monitoringStack.addDependency(streamingStack);

// Add global tags to all resources
cdk.Tags.of(app).add('Project', 'omnix-ai');
cdk.Tags.of(app).add('Environment', finalConfig.stage);
cdk.Tags.of(app).add('ManagedBy', 'aws-cdk');
cdk.Tags.of(app).add('Repository', 'omnix-ai-infrastructure');
cdk.Tags.of(app).add('Owner', 'engineering-team');

// Add cost allocation tags for production
if (finalConfig.stage === 'prod') {
  cdk.Tags.of(app).add('CostCenter', 'product-development');
  cdk.Tags.of(app).add('BusinessUnit', 'ai-analytics');
  cdk.Tags.of(app).add('BillingCode', 'omnix-prod-infra');
}

// Add development tags for non-production environments
if (finalConfig.stage !== 'prod') {
  cdk.Tags.of(app).add('AutoDelete', 'true');
  cdk.Tags.of(app).add('DeveloperAccess', 'true');
}

// Synthesis and validation
app.synth();

// Log deployment information
console.log(`
🚀 OMNIX AI Infrastructure Deployment Configuration
================================================

Environment: ${finalConfig.stage}
Region: ${finalConfig.region}
Account: ${env.account || 'Using default account'}

Stacks to be deployed:
├── Core Stack (${getStackName('core', finalConfig.stage)})
│   ├── Lambda Function: omnix-ai-backend-${finalConfig.stage}
│   ├── REST API: omnix-ai-api-${finalConfig.stage}
│   ├── WebSocket API: omnix-ai-websocket-${finalConfig.stage}
│   ├── DynamoDB Tables: 14 tables with GSIs
│   └── Secrets Manager: JWT, API keys, external credentials
│
├── Streaming Stack (${getStackName('streaming', finalConfig.stage)})
│   ├── Kinesis Streams: Customer events (${finalConfig.kinesisShardCount} shards)
│   ├── SQS Queues: AI analysis, batch processing, notifications
│   └── EventBridge: Custom event bus for decoupled architecture
│
└── Monitoring Stack (${getStackName('monitoring', finalConfig.stage)})
    ├── CloudWatch: Dashboards, alarms, custom metrics
    ├── SNS: Alert notifications
    └── Scheduled Events: Cleanup, reporting, health checks

Configuration:
- Lambda Memory: ${finalConfig.lambdaMemorySize} MB
- Lambda Timeout: ${finalConfig.lambdaTimeout} seconds
- DynamoDB Billing: ${finalConfig.dynamodbBillingMode}
- Monitoring: ${finalConfig.enableMonitoring ? 'Enabled' : 'Disabled'}
- X-Ray Tracing: ${finalConfig.enableXRay ? 'Enabled' : 'Disabled'}
- Log Retention: ${finalConfig.logRetentionDays} days

AWS Bedrock Configuration:
- Bedrock Region: ${finalConfig.bedrockRegion}
- Primary Model: Claude 3 Haiku (cost-optimized)
- Fallback Model: Claude 3 Sonnet (higher accuracy)

Deployment Commands:
- Deploy All: npm run deploy:${finalConfig.stage}
- Deploy Core: cdk deploy ${getStackName('core', finalConfig.stage)}
- Deploy Streaming: cdk deploy ${getStackName('streaming', finalConfig.stage)}
- Deploy Monitoring: cdk deploy ${getStackName('monitoring', finalConfig.stage)}

Next Steps:
1. Ensure AWS credentials are configured
2. Build Lambda function: cd ../backend && npm run build
3. Deploy infrastructure: npm run deploy:${finalConfig.stage}
4. Run post-deployment scripts for data seeding
5. Configure external API keys in Secrets Manager
6. Set up monitoring alerts and notifications

================================================
`);

export { coreStack, streamingStack, monitoringStack };