import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBService {
  private readonly client: DynamoDBClient;
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tablePrefix: string;

  constructor() {
    // Initialize DynamoDB client
    const clientConfig: any = {
      region: process.env.AWS_REGION || 'eu-central-1',
    };

    // In Lambda, we should use IAM role, not explicit credentials
    // Only add credentials if running locally (not in Lambda)
    if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    console.log('🔧 DynamoDB Service initializing with region:', clientConfig.region);
    console.log('🔑 Running in Lambda:', !!process.env.AWS_LAMBDA_FUNCTION_NAME);
    console.log('🔑 Using AWS credentials:', !!clientConfig.credentials ? 'Yes (from env)' : 'No (using IAM role)');

    this.client = new DynamoDBClient(clientConfig);

    // Create document client for easier operations
    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true,
        convertClassInstanceToMap: false,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });

    // Table prefix for environment separation
    this.tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'omnix-ai-dev-';
  }

  /**
   * Get table name with prefix
   */
  getTableName(tableName: string): string {
    // Handle special table naming conventions
    if (tableName === 'products') {
      return 'omnix-ai-products-dev';
    }
    if (tableName === 'customer-profiles') {
      return 'omnix-ai-customer-profiles-dev';
    }
    if (tableName === 'purchase-history') {
      return 'omnix-ai-purchase-history-dev';
    }
    if (tableName === 'product-interactions') {
      return 'omnix-ai-product-interactions-dev';
    }
    if (tableName === 'recommendations') {
      return 'omnix-ai-recommendations-dev';
    }
    return `${this.tablePrefix}${tableName}`;
  }

  /**
   * Scan all items from a table
   */
  async scan(tableName: string, filter?: any): Promise<any[]> {
    try {
      const fullTableName = this.getTableName(tableName);
      console.log(`📊 Scanning DynamoDB table: ${fullTableName}`);
      
      const command = new ScanCommand({
        TableName: fullTableName,
        ...filter,
      });

      const response = await this.docClient.send(command);
      console.log(`✅ Scan successful: Found ${response.Items?.length || 0} items`);
      return response.Items || [];
    } catch (error) {
      console.error(`❌ Error scanning table ${tableName}:`, error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        tableName: this.getTableName(tableName),
      });
      throw error;
    }
  }

  /**
   * Get a single item by key
   */
  async get(tableName: string, key: Record<string, any>): Promise<any> {
    try {
      const command = new GetCommand({
        TableName: this.getTableName(tableName),
        Key: key,
      });

      const response = await this.docClient.send(command);
      return response.Item;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Put (create or update) an item
   */
  async put(tableName: string, item: Record<string, any>): Promise<any> {
    try {
      const fullTableName = this.getTableName(tableName);
      console.log(`📝 Attempting to write to DynamoDB table: ${fullTableName}`);
      console.log(`📝 Item to write:`, JSON.stringify(item, null, 2));
      
      const command = new PutCommand({
        TableName: fullTableName,
        Item: item,
        ReturnValues: 'ALL_OLD',
      });

      console.log(`📝 Sending PutCommand to DynamoDB...`);
      const response = await this.docClient.send(command);
      console.log(`✅ Successfully wrote item to DynamoDB table ${fullTableName}`);
      console.log(`📝 DynamoDB response:`, JSON.stringify(response, null, 2));
      
      return item;
    } catch (error) {
      console.error(`❌ Error putting item to ${tableName}:`, error);
      console.error(`❌ Error details:`, {
        message: error.message,
        code: error.code,
        statusCode: error.$metadata?.httpStatusCode,
        tableName: this.getTableName(tableName),
      });
      throw error;
    }
  }

  /**
   * Update an item
   */
  async update(
    tableName: string,
    key: Record<string, any>,
    updates: Record<string, any>,
  ): Promise<any> {
    try {
      // Build update expression
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.keys(updates).forEach((field, index) => {
        const placeholder = `#field${index}`;
        const valuePlaceholder = `:value${index}`;
        
        updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
        expressionAttributeNames[placeholder] = field;
        expressionAttributeValues[valuePlaceholder] = updates[field];
      });

      const command = new UpdateCommand({
        TableName: this.getTableName(tableName),
        Key: key,
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      });

      const response = await this.docClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete an item
   */
  async delete(tableName: string, key: Record<string, any>): Promise<boolean> {
    try {
      const command = new DeleteCommand({
        TableName: this.getTableName(tableName),
        Key: key,
        ReturnValues: 'ALL_OLD',
      });

      const response = await this.docClient.send(command);
      return !!response.Attributes;
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Query items using an index
   */
  async query(
    tableName: string,
    indexName: string | null,
    keyCondition: string,
    expressionValues: Record<string, any>,
    expressionNames?: Record<string, string>,
  ): Promise<any[]> {
    try {
      const params: any = {
        TableName: this.getTableName(tableName),
        KeyConditionExpression: keyCondition,
        ExpressionAttributeValues: expressionValues,
      };

      if (indexName) {
        params.IndexName = indexName;
      }

      if (expressionNames) {
        params.ExpressionAttributeNames = expressionNames;
      }

      const command = new QueryCommand(params);
      const response = await this.docClient.send(command);
      return response.Items || [];
    } catch (error) {
      console.error(`Error querying table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Batch write items (create/delete multiple items)
   */
  async batchWrite(tableName: string, putItems?: any[], deleteKeys?: any[]): Promise<void> {
    try {
      const requests: any[] = [];

      // Add put requests
      if (putItems && putItems.length > 0) {
        putItems.forEach(item => {
          requests.push({
            PutRequest: {
              Item: item,
            },
          });
        });
      }

      // Add delete requests
      if (deleteKeys && deleteKeys.length > 0) {
        deleteKeys.forEach(key => {
          requests.push({
            DeleteRequest: {
              Key: key,
            },
          });
        });
      }

      // Process in batches of 25 (DynamoDB limit)
      const batchSize = 25;
      for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        
        const command = new BatchWriteCommand({
          RequestItems: {
            [this.getTableName(tableName)]: batch,
          },
        });

        await this.docClient.send(command);
      }
    } catch (error) {
      console.error(`Error batch writing to ${tableName}:`, error);
      throw error;
    }
  }
}