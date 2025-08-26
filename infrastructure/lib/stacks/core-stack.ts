import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';
import { DynamoDBTables } from '../constructs/dynamodb-tables';
import { OmnixLambdaFunction } from '../constructs/lambda-function';
import { OmnixApiGateway } from '../constructs/api-gateway-simple';
import { SecretsManager } from '../constructs/secrets-manager';

export interface CoreStackProps extends StackProps {
  config: EnvironmentConfig;
}

export class CoreStack extends Stack {
  public readonly dynamodbTables: DynamoDBTables;
  public readonly lambdaFunction: OmnixLambdaFunction;
  public readonly apiGateway: OmnixApiGateway;
  public readonly secretsManager: SecretsManager;

  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    const { config } = props;

    // Create Secrets Manager and Parameter Store
    this.secretsManager = new SecretsManager(this, 'SecretsManager', {
      config,
    });

    // Create DynamoDB Tables
    this.dynamodbTables = new DynamoDBTables(this, 'DynamoDBTables', {
      config,
    });

    // Prepare Lambda environment variables
    const lambdaEnvironment = {
      // Basic configuration
      NODE_ENV: config.stage,
      AWS_REGION: config.region,
      AWS_BEDROCK_REGION: config.bedrockRegion,

      // DynamoDB table names
      USERS_TABLE: this.dynamodbTables.usersTable.tableName,
      PRODUCTS_TABLE: this.dynamodbTables.productsTable.tableName,
      ORDERS_TABLE: this.dynamodbTables.ordersTable.tableName,
      INVENTORY_TABLE: this.dynamodbTables.inventoryTable.tableName,
      SESSIONS_TABLE: this.dynamodbTables.sessionsTable.tableName,
      CUSTOMER_PROFILES_TABLE: this.dynamodbTables.customerProfilesTable.tableName,
      PURCHASE_HISTORY_TABLE: this.dynamodbTables.purchaseHistoryTable.tableName,
      PRODUCT_INTERACTIONS_TABLE: this.dynamodbTables.productInteractionsTable.tableName,
      RECOMMENDATIONS_TABLE: this.dynamodbTables.recommendationsTable.tableName,
      AB_TEST_RESULTS_TABLE: this.dynamodbTables.abTestResultsTable.tableName,
      COST_ANALYTICS_TABLE: this.dynamodbTables.costAnalyticsTable.tableName,
      SEGMENTATION_TABLE: this.dynamodbTables.segmentationTable.tableName,
      STREAMING_ANALYTICS_TABLE: this.dynamodbTables.streamingAnalyticsTable.tableName,
      AI_ANALYSIS_HISTORY_TABLE: this.dynamodbTables.aiAnalysisHistoryTable.tableName,

      // Feature flags
      AI_ANALYSIS_ENABLED: 'true',
      STREAMING_ANALYTICS_ENABLED: 'true',
      AB_TESTING_ENABLED: 'true',
      COST_OPTIMIZATION_ENABLED: 'true',
      BATCH_PROCESSING_ENABLED: 'true',
      MONITORING_ENHANCED: config.enableMonitoring.toString(),

      // Performance configuration
      BEDROCK_CACHE_TTL: '3600',
      BATCH_SIZE_LIMIT: '1000',
      AI_TIMEOUT: '30000',
      RETRY_ATTEMPTS: '3',
      RATE_LIMIT_REQUESTS: '1000',
      MAX_CONCURRENT_ANALYSES: '10',

      // Cost optimization
      BEDROCK_COST_THRESHOLD: '100',
      AUTO_SCALING_ENABLED: 'true',
      CACHE_ENABLED: 'true',
      BATCH_OPTIMIZATION_ENABLED: 'true',

      // Secret ARNs (Lambda will retrieve values at runtime)
      ...this.secretsManager.getSecretArns(),

      // Parameter Store names (Lambda will retrieve values at runtime)
      ...this.secretsManager.getParameterNames(),
    };

    // Create Lambda Function
    this.lambdaFunction = new OmnixLambdaFunction(this, 'LambdaFunction', {
      config,
      environment: lambdaEnvironment,
    });

    // Grant Lambda permissions to access all DynamoDB tables
    this.dynamodbTables.usersTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.productsTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.ordersTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.inventoryTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.sessionsTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.customerProfilesTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.purchaseHistoryTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.productInteractionsTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.recommendationsTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.abTestResultsTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.costAnalyticsTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.segmentationTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.streamingAnalyticsTable.grantFullAccess(this.lambdaFunction.function);
    this.dynamodbTables.aiAnalysisHistoryTable.grantFullAccess(this.lambdaFunction.function);

    // Grant Lambda permissions to access secrets and parameters
    this.secretsManager.jwtSecret.grantRead(this.lambdaFunction.function);
    this.secretsManager.jwtRefreshSecret.grantRead(this.lambdaFunction.function);
    this.secretsManager.apiKeys.grantRead(this.lambdaFunction.function);
    this.secretsManager.databaseCredentials.grantRead(this.lambdaFunction.function);
    this.secretsManager.externalApiKeys.grantRead(this.lambdaFunction.function);

    // Create API Gateway
    this.apiGateway = new OmnixApiGateway(this, 'ApiGateway', {
      config,
      lambdaFunction: this.lambdaFunction.function,
    });

    // Stack Outputs
    new CfnOutput(this, 'RestApiUrl', {
      value: this.apiGateway.restApi.url,
      description: 'REST API Gateway URL',
      exportName: `${config.stage}-omnix-ai-rest-api-url`,
    });

    new CfnOutput(this, 'WebSocketApiUrl', {
      value: this.apiGateway.webSocketApi.apiEndpoint,
      description: 'WebSocket API Gateway URL',
      exportName: `${config.stage}-omnix-ai-websocket-api-url`,
    });

    new CfnOutput(this, 'LambdaFunctionArn', {
      value: this.lambdaFunction.function.functionArn,
      description: 'Lambda Function ARN',
      exportName: `${config.stage}-omnix-ai-lambda-arn`,
    });

    new CfnOutput(this, 'LambdaFunctionName', {
      value: this.lambdaFunction.function.functionName,
      description: 'Lambda Function Name',
      exportName: `${config.stage}-omnix-ai-lambda-name`,
    });

    // DynamoDB Table Outputs
    const tableOutputs = [
      { name: 'UsersTable', table: this.dynamodbTables.usersTable },
      { name: 'ProductsTable', table: this.dynamodbTables.productsTable },
      { name: 'OrdersTable', table: this.dynamodbTables.ordersTable },
      { name: 'InventoryTable', table: this.dynamodbTables.inventoryTable },
      { name: 'SessionsTable', table: this.dynamodbTables.sessionsTable },
      { name: 'CustomerProfilesTable', table: this.dynamodbTables.customerProfilesTable },
      { name: 'PurchaseHistoryTable', table: this.dynamodbTables.purchaseHistoryTable },
      { name: 'ProductInteractionsTable', table: this.dynamodbTables.productInteractionsTable },
      { name: 'RecommendationsTable', table: this.dynamodbTables.recommendationsTable },
      { name: 'ABTestResultsTable', table: this.dynamodbTables.abTestResultsTable },
      { name: 'CostAnalyticsTable', table: this.dynamodbTables.costAnalyticsTable },
      { name: 'SegmentationTable', table: this.dynamodbTables.segmentationTable },
      { name: 'StreamingAnalyticsTable', table: this.dynamodbTables.streamingAnalyticsTable },
      { name: 'AIAnalysisHistoryTable', table: this.dynamodbTables.aiAnalysisHistoryTable },
    ];

    tableOutputs.forEach(({ name, table }) => {
      new CfnOutput(this, `${name}Name`, {
        value: table.tableName,
        description: `${name} DynamoDB table name`,
        exportName: `${config.stage}-omnix-ai-${name.toLowerCase()}-name`,
      });

      new CfnOutput(this, `${name}Arn`, {
        value: table.tableArn,
        description: `${name} DynamoDB table ARN`,
        exportName: `${config.stage}-omnix-ai-${name.toLowerCase()}-arn`,
      });
    });

    // Secrets Outputs
    new CfnOutput(this, 'JWTSecretArn', {
      value: this.secretsManager.jwtSecret.secretArn,
      description: 'JWT Secret ARN',
      exportName: `${config.stage}-omnix-ai-jwt-secret-arn`,
    });

    new CfnOutput(this, 'APIKeysSecretArn', {
      value: this.secretsManager.apiKeys.secretArn,
      description: 'API Keys Secret ARN',
      exportName: `${config.stage}-omnix-ai-api-keys-secret-arn`,
    });
  }
}