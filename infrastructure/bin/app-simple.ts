#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CoreStack } from '../lib/stacks/core-stack-simple';
import { getEnvironmentConfig } from '../lib/config/environment';

// Get environment from context or default to 'dev'
const envName = process.env.CDK_ENV || process.env.NODE_ENV || 'dev';

const app = new cdk.App();

// Get environment from CDK context
const contextEnv = app.node.tryGetContext('env') || envName;
const config = getEnvironmentConfig(contextEnv);

// Define AWS environment
const env = {
  account: config.account || process.env.CDK_DEFAULT_ACCOUNT,
  region: config.region,
};

// Stack naming convention (with timestamp to avoid conflicts)
const timestamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
const getStackName = (stackType: string, stage: string): string => {
  return `omnix-ai-cdk-${stackType}-${stage}-${timestamp}`;
};

// Core Stack - Contains Lambda, API Gateway, DynamoDB
const coreStack = new CoreStack(app, getStackName('core', config.stage), {
  config,
  env,
  description: `OMNIX AI Core Infrastructure - ${config.stage}`,
  tags: {
    Environment: config.stage,
    Project: 'omnix-ai',
    Component: 'core',
    Owner: 'engineering-team',
    ManagedBy: 'aws-cdk',
  },
});

// Add global tags to all resources
cdk.Tags.of(app).add('Project', 'omnix-ai');
cdk.Tags.of(app).add('Environment', config.stage);
cdk.Tags.of(app).add('ManagedBy', 'aws-cdk');

// Synthesis and validation
app.synth();

// Log deployment information
console.log(`
🚀 OMNIX AI Infrastructure Deployment Configuration
================================================

Environment: ${config.stage}
Region: ${config.region}
Account: ${env.account || 'Using default account'}

Core Stack: ${getStackName('core', config.stage)}
├── Lambda Function: omnix-ai-backend-${config.stage}
├── REST API: omnix-ai-api-${config.stage}
├── DynamoDB Tables: 14 tables with GSIs
└── IAM Roles & Policies

Configuration:
- Lambda Memory: ${config.lambdaMemorySize} MB
- Lambda Timeout: ${config.lambdaTimeout} seconds
- DynamoDB Billing: ${config.dynamodbBillingMode}
- Monitoring: ${config.enableMonitoring ? 'Enabled' : 'Disabled'}

AWS Bedrock Configuration:
- Bedrock Region: ${config.bedrockRegion}
- Primary Model: Claude 3 Haiku (cost-optimized)

Deployment Commands:
- Deploy: cdk deploy ${getStackName('core', config.stage)}
- Test: curl [API_ENDPOINT]/health

Next Steps:
1. Ensure AWS credentials are configured
2. Build Lambda function: cd ../backend && npm run build
3. Deploy: cdk deploy ${getStackName('core', config.stage)}

================================================
`);

export { coreStack };