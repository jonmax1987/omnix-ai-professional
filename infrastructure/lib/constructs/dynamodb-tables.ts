import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';

export interface DynamoDBTablesProps {
  config: EnvironmentConfig;
}

export class DynamoDBTables extends Construct {
  public readonly usersTable: dynamodb.Table;
  public readonly productsTable: dynamodb.Table;
  public readonly ordersTable: dynamodb.Table;
  public readonly inventoryTable: dynamodb.Table;
  public readonly sessionsTable: dynamodb.Table;
  public readonly customerProfilesTable: dynamodb.Table;
  public readonly purchaseHistoryTable: dynamodb.Table;
  public readonly productInteractionsTable: dynamodb.Table;
  public readonly recommendationsTable: dynamodb.Table;
  public readonly abTestResultsTable: dynamodb.Table;
  public readonly costAnalyticsTable: dynamodb.Table;
  public readonly segmentationTable: dynamodb.Table;
  public readonly streamingAnalyticsTable: dynamodb.Table;
  public readonly aiAnalysisHistoryTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoDBTablesProps) {
    super(scope, id);

    const { config } = props;
    const billingMode = config.dynamodbBillingMode === 'PROVISIONED' 
      ? dynamodb.BillingMode.PROVISIONED 
      : dynamodb.BillingMode.PAY_PER_REQUEST;
    
    // Add timestamp to make table names unique
    const timestamp = new Date().toISOString().slice(0,16).replace(/[-:]/g,'');

    // Users Table
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: `omnix-ai-cdk-${config.stage}-users-${timestamp}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });
    
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
    });

    // Products Table
    this.productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: `omnix-ai-cdk-${config.stage}-products-${timestamp}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });
    
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'category-index',
      partitionKey: { name: 'category', type: dynamodb.AttributeType.STRING },
    });

    // Orders Table
    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: `omnix-ai-cdk-${config.stage}-orders-${timestamp}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });
    
    this.ordersTable.addGlobalSecondaryIndex({
      indexName: 'status-created-index',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    // Inventory Table
    this.inventoryTable = new dynamodb.Table(this, 'InventoryTable', {
      tableName: `omnix-ai-cdk-${config.stage}-inventory-${timestamp}`,
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });

    // Sessions Table (with TTL)
    this.sessionsTable = new dynamodb.Table(this, 'SessionsTable', {
      tableName: `omnix-ai-cdk-${config.stage}-sessions-${timestamp}`,
      partitionKey: { name: 'refreshToken', type: dynamodb.AttributeType.STRING },
      billingMode,
      timeToLiveAttribute: 'expiresAt',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    
    this.sessionsTable.addGlobalSecondaryIndex({
      indexName: 'user-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });

    // Customer Profiles Table
    this.customerProfilesTable = new dynamodb.Table(this, 'CustomerProfilesTable', {
      tableName: `omnix-ai-cdk-customer-profiles-${config.stage}-${timestamp}`,
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });

    // Purchase History Table
    this.purchaseHistoryTable = new dynamodb.Table(this, 'PurchaseHistoryTable', {
      tableName: `omnix-ai-cdk-purchase-history-${config.stage}-${timestamp}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });
    
    this.purchaseHistoryTable.addGlobalSecondaryIndex({
      indexName: 'customerId-purchaseDate-index',
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'purchaseDate', type: dynamodb.AttributeType.STRING },
    });
    
    this.purchaseHistoryTable.addGlobalSecondaryIndex({
      indexName: 'productId-purchaseDate-index',
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'purchaseDate', type: dynamodb.AttributeType.STRING },
    });

    // Product Interactions Table
    this.productInteractionsTable = new dynamodb.Table(this, 'ProductInteractionsTable', {
      tableName: `omnix-ai-cdk-product-interactions-${config.stage}-${timestamp}`,
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'interactionDate', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });

    // Recommendations Table
    this.recommendationsTable = new dynamodb.Table(this, 'RecommendationsTable', {
      tableName: `omnix-ai-cdk-recommendations-${config.stage}-${timestamp}`,
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'generatedAt', type: dynamodb.AttributeType.STRING },
      billingMode,
      timeToLiveAttribute: 'ttl',
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });

    // A/B Test Results Table
    this.abTestResultsTable = new dynamodb.Table(this, 'ABTestResultsTable', {
      tableName: `omnix-ai-cdk-ab-test-results-${config.stage}-${timestamp}`,
      partitionKey: { name: 'testId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });

    // Cost Analytics Table
    this.costAnalyticsTable = new dynamodb.Table(this, 'CostAnalyticsTable', {
      tableName: `omnix-ai-cdk-cost-analytics-${config.stage}-${timestamp}`,
      partitionKey: { name: 'service', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });

    // Customer Segmentation Table
    this.segmentationTable = new dynamodb.Table(this, 'SegmentationTable', {
      tableName: `omnix-ai-cdk-customer-segmentation-${config.stage}-${timestamp}`,
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      billingMode,
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });
    
    this.segmentationTable.addGlobalSecondaryIndex({
      indexName: 'segment-index',
      partitionKey: { name: 'segmentId', type: dynamodb.AttributeType.STRING },
    });

    // Streaming Analytics Table
    this.streamingAnalyticsTable = new dynamodb.Table(this, 'StreamingAnalyticsTable', {
      tableName: `omnix-ai-cdk-streaming-analytics-${config.stage}-${timestamp}`,
      partitionKey: { name: 'eventId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode,
      timeToLiveAttribute: 'ttl',
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });

    // AI Analysis History Table
    this.aiAnalysisHistoryTable = new dynamodb.Table(this, 'AIAnalysisHistoryTable', {
      tableName: `omnix-ai-cdk-analysis-history-${config.stage}-${timestamp}`,
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'analysisDate', type: dynamodb.AttributeType.STRING },
      billingMode,
      timeToLiveAttribute: 'ttl',
      removalPolicy: config.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.stage === 'prod',
    });
  }
}