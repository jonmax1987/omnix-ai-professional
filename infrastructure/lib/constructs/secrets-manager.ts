import { Construct } from 'constructs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { RemovalPolicy } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';

export interface SecretsManagerProps {
  config: EnvironmentConfig;
  lambdaFunction?: lambda.Function;
}

export class SecretsManager extends Construct {
  public readonly jwtSecret: secretsmanager.Secret;
  public readonly jwtRefreshSecret: secretsmanager.Secret;
  public readonly apiKeys: secretsmanager.Secret;
  public readonly databaseCredentials: secretsmanager.Secret;
  public readonly externalApiKeys: secretsmanager.Secret;

  // Parameter Store parameters
  public readonly bedrockModelId: ssm.StringParameter;
  public readonly kinesisStreamName: ssm.StringParameter;
  public readonly dynamodbTablePrefix: ssm.StringParameter;
  public readonly corsOrigins: ssm.StringListParameter;

  constructor(scope: Construct, id: string, props: SecretsManagerProps) {
    super(scope, id);

    const { config, lambdaFunction } = props;

    // JWT Secrets
    this.jwtSecret = new secretsmanager.Secret(this, 'JWTSecret', {
      secretName: `omnix-ai-${config.stage}-jwt-secret`,
      description: 'JWT signing secret for OMNIX AI authentication',
      generateSecretString: {
        secretStringTemplate: '{}',
        generateStringKey: 'secret',
        excludeCharacters: '"@/\\\'',
        passwordLength: 64,
      },
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    this.jwtRefreshSecret = new secretsmanager.Secret(this, 'JWTRefreshSecret', {
      secretName: `omnix-ai-${config.stage}-jwt-refresh-secret`,
      description: 'JWT refresh token secret for OMNIX AI authentication',
      generateSecretString: {
        secretStringTemplate: '{}',
        generateStringKey: 'secret',
        excludeCharacters: '"@/\\\'',
        passwordLength: 64,
      },
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    // API Keys for internal services
    this.apiKeys = new secretsmanager.Secret(this, 'APIKeys', {
      secretName: `omnix-ai-${config.stage}-api-keys`,
      description: 'Internal API keys for OMNIX AI services',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          key1: '',
          key2: '',
          key3: '',
        }),
        generateStringKey: 'key1',
        excludeCharacters: '"@/\\\'',
        passwordLength: 32,
      },
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    // Database credentials (if using RDS in the future)
    this.databaseCredentials = new secretsmanager.Secret(this, 'DatabaseCredentials', {
      secretName: `omnix-ai-${config.stage}-database-credentials`,
      description: 'Database credentials for OMNIX AI',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'omnix_admin',
          engine: 'postgres',
          host: '',
          port: 5432,
          dbname: `omnix_ai_${config.stage}`,
        }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\\'',
        passwordLength: 32,
      },
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    // External API Keys (for third-party services)
    this.externalApiKeys = new secretsmanager.Secret(this, 'ExternalAPIKeys', {
      secretName: `omnix-ai-${config.stage}-external-api-keys`,
      description: 'External API keys for third-party integrations',
      secretObjectValue: {
        'stripe-api-key': secretsmanager.SecretValue.unsafePlainText(''),
        'sendgrid-api-key': secretsmanager.SecretValue.unsafePlainText(''),
        'analytics-api-key': secretsmanager.SecretValue.unsafePlainText(''),
        'monitoring-webhook-url': secretsmanager.SecretValue.unsafePlainText(''),
      },
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    // Parameter Store Parameters for non-sensitive configuration
    this.bedrockModelId = new ssm.StringParameter(this, 'BedrockModelId', {
      parameterName: `/omnix-ai/${config.stage}/bedrock/model-id`,
      stringValue: 'anthropic.claude-3-haiku-20240307-v1:0',
      description: 'AWS Bedrock model ID for AI analysis',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.kinesisStreamName = new ssm.StringParameter(this, 'KinesisStreamName', {
      parameterName: `/omnix-ai/${config.stage}/kinesis/stream-name`,
      stringValue: `omnix-ai-customer-events-${config.stage}`,
      description: 'Kinesis stream name for real-time events',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.dynamodbTablePrefix = new ssm.StringParameter(this, 'DynamoDBTablePrefix', {
      parameterName: `/omnix-ai/${config.stage}/dynamodb/table-prefix`,
      stringValue: `omnix-ai-${config.stage}`,
      description: 'DynamoDB table name prefix',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.corsOrigins = new ssm.StringListParameter(this, 'CorsOrigins', {
      parameterName: `/omnix-ai/${config.stage}/api/cors-origins`,
      stringListValue: config.stage === 'prod' 
        ? ['https://omnix-ai.com', 'https://www.omnix-ai.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      description: 'Allowed CORS origins for API Gateway',
      tier: ssm.ParameterTier.STANDARD,
    });

    // Feature flags and configuration parameters
    const featureFlags = [
      { name: 'ai-analysis-enabled', value: 'true', description: 'Enable AI analysis features' },
      { name: 'streaming-analytics-enabled', value: 'true', description: 'Enable streaming analytics' },
      { name: 'ab-testing-enabled', value: 'true', description: 'Enable A/B testing framework' },
      { name: 'cost-optimization-enabled', value: 'true', description: 'Enable cost optimization features' },
      { name: 'batch-processing-enabled', value: 'true', description: 'Enable batch processing' },
      { name: 'monitoring-enhanced', value: config.enableMonitoring.toString(), description: 'Enable enhanced monitoring' },
    ];

    featureFlags.forEach((flag, index) => {
      new ssm.StringParameter(this, `FeatureFlag${index}`, {
        parameterName: `/omnix-ai/${config.stage}/features/${flag.name}`,
        stringValue: flag.value,
        description: flag.description,
        tier: ssm.ParameterTier.STANDARD,
      });
    });

    // Performance configuration parameters
    const performanceConfig = [
      { name: 'bedrock-cache-ttl', value: '3600', description: 'Bedrock response cache TTL in seconds' },
      { name: 'batch-size-limit', value: '1000', description: 'Maximum batch size for processing' },
      { name: 'ai-timeout', value: '30000', description: 'AI analysis timeout in milliseconds' },
      { name: 'retry-attempts', value: '3', description: 'Maximum retry attempts for failed operations' },
      { name: 'rate-limit-requests', value: '1000', description: 'Rate limit requests per minute' },
      { name: 'max-concurrent-analyses', value: '10', description: 'Maximum concurrent AI analyses' },
    ];

    performanceConfig.forEach((param, index) => {
      new ssm.StringParameter(this, `PerfConfig${index}`, {
        parameterName: `/omnix-ai/${config.stage}/performance/${param.name}`,
        stringValue: param.value,
        description: param.description,
        tier: ssm.ParameterTier.STANDARD,
      });
    });

    // Cost optimization parameters
    const costConfig = [
      { name: 'bedrock-cost-threshold', value: '100', description: 'Daily cost threshold for Bedrock in USD' },
      { name: 'auto-scaling-enabled', value: 'true', description: 'Enable auto-scaling for cost optimization' },
      { name: 'cache-enabled', value: 'true', description: 'Enable caching to reduce API calls' },
      { name: 'batch-optimization-enabled', value: 'true', description: 'Enable batch processing optimization' },
    ];

    costConfig.forEach((param, index) => {
      new ssm.StringParameter(this, `CostConfig${index}`, {
        parameterName: `/omnix-ai/${config.stage}/cost/${param.name}`,
        stringValue: param.value,
        description: param.description,
        tier: ssm.ParameterTier.STANDARD,
      });
    });

    // Grant Lambda permissions to read secrets and parameters
    if (lambdaFunction) {
      this.jwtSecret.grantRead(lambdaFunction);
      this.jwtRefreshSecret.grantRead(lambdaFunction);
      this.apiKeys.grantRead(lambdaFunction);
      this.databaseCredentials.grantRead(lambdaFunction);
      this.externalApiKeys.grantRead(lambdaFunction);

      // Grant SSM parameter read permissions
      this.bedrockModelId.grantRead(lambdaFunction);
      this.kinesisStreamName.grantRead(lambdaFunction);
      this.dynamodbTablePrefix.grantRead(lambdaFunction);
      this.corsOrigins.grantRead(lambdaFunction);
    }
  }

  // Helper method to get all secret ARNs for Lambda environment variables
  public getSecretArns(): Record<string, string> {
    return {
      JWT_SECRET_ARN: this.jwtSecret.secretArn,
      JWT_REFRESH_SECRET_ARN: this.jwtRefreshSecret.secretArn,
      API_KEYS_ARN: this.apiKeys.secretArn,
      DATABASE_CREDENTIALS_ARN: this.databaseCredentials.secretArn,
      EXTERNAL_API_KEYS_ARN: this.externalApiKeys.secretArn,
    };
  }

  // Helper method to get all parameter names for Lambda environment variables
  public getParameterNames(): Record<string, string> {
    return {
      BEDROCK_MODEL_ID_PARAM: this.bedrockModelId.parameterName,
      KINESIS_STREAM_NAME_PARAM: this.kinesisStreamName.parameterName,
      DYNAMODB_TABLE_PREFIX_PARAM: this.dynamodbTablePrefix.parameterName,
      CORS_ORIGINS_PARAM: this.corsOrigins.parameterName,
    };
  }
}