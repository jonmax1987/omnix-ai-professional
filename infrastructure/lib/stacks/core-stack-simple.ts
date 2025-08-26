import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';
import { DynamoDBTables } from '../constructs/dynamodb-tables';
import { OmnixLambdaFunction } from '../constructs/lambda-function';
import { OmnixApiGateway } from '../constructs/api-gateway-simple';

export interface CoreStackProps extends StackProps {
  config: EnvironmentConfig;
}

export class CoreStack extends Stack {
  public readonly dynamodbTables: DynamoDBTables;
  public readonly lambdaFunction: OmnixLambdaFunction;
  public readonly apiGateway: OmnixApiGateway;

  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    const { config } = props;

    // Create DynamoDB Tables
    this.dynamodbTables = new DynamoDBTables(this, 'DynamoDBTables', {
      config,
    });

    // Prepare Lambda environment variables
    const lambdaEnvironment = {
      // Basic configuration
      NODE_ENV: config.stage,
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

    // Key DynamoDB Table Outputs
    new CfnOutput(this, 'UsersTableName', {
      value: this.dynamodbTables.usersTable.tableName,
      description: 'Users DynamoDB table name',
      exportName: `${config.stage}-omnix-ai-users-table-name`,
    });

    new CfnOutput(this, 'ProductsTableName', {
      value: this.dynamodbTables.productsTable.tableName,
      description: 'Products DynamoDB table name',
      exportName: `${config.stage}-omnix-ai-products-table-name`,
    });

    new CfnOutput(this, 'CustomerProfilesTableName', {
      value: this.dynamodbTables.customerProfilesTable.tableName,
      description: 'Customer Profiles DynamoDB table name',
      exportName: `${config.stage}-omnix-ai-customer-profiles-table-name`,
    });
  }
}