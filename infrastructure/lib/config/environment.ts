export interface EnvironmentConfig {
  account: string;
  region: string;
  stage: 'dev' | 'staging' | 'prod';
  domainName?: string;
  certificateArn?: string;
  vpcId?: string;
  bedrockRegion: string;
  kinesisShardCount: number;
  dynamodbBillingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
  lambdaMemorySize: number;
  lambdaTimeout: number;
  enableMonitoring: boolean;
  enableXRay: boolean;
  logRetentionDays: number;
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '',
    region: 'eu-central-1',
    stage: 'dev',
    bedrockRegion: 'us-east-1',
    kinesisShardCount: 2,
    dynamodbBillingMode: 'PAY_PER_REQUEST',
    lambdaMemorySize: 512,
    lambdaTimeout: 30,
    enableMonitoring: true,
    enableXRay: false,
    logRetentionDays: 7,
  },
  staging: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '',
    region: 'eu-central-1',
    stage: 'staging',
    bedrockRegion: 'us-east-1',
    kinesisShardCount: 4,
    dynamodbBillingMode: 'PAY_PER_REQUEST',
    lambdaMemorySize: 1024,
    lambdaTimeout: 30,
    enableMonitoring: true,
    enableXRay: true,
    logRetentionDays: 14,
  },
  prod: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '',
    region: 'eu-central-1',
    stage: 'prod',
    domainName: 'api.omnix-ai.com',
    certificateArn: process.env.CERTIFICATE_ARN,
    bedrockRegion: 'us-east-1',
    kinesisShardCount: 10,
    dynamodbBillingMode: 'PROVISIONED',
    lambdaMemorySize: 2048,
    lambdaTimeout: 30,
    enableMonitoring: true,
    enableXRay: true,
    logRetentionDays: 30,
  },
};

export function getEnvironmentConfig(envName: string): EnvironmentConfig {
  const config = environments[envName];
  if (!config) {
    throw new Error(`Unknown environment: ${envName}. Valid environments are: ${Object.keys(environments).join(', ')}`);
  }
  return config;
}