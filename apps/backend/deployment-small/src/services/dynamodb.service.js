"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBService = void 0;
const common_1 = require("@nestjs/common");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
let DynamoDBService = class DynamoDBService {
    constructor() {
        const clientConfig = {
            region: process.env.AWS_REGION || 'eu-central-1',
        };
        if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            clientConfig.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            };
        }
        console.log('🔧 DynamoDB Service initializing with region:', clientConfig.region);
        console.log('🔑 Running in Lambda:', !!process.env.AWS_LAMBDA_FUNCTION_NAME);
        console.log('🔑 Using AWS credentials:', !!clientConfig.credentials ? 'Yes (from env)' : 'No (using IAM role)');
        this.client = new client_dynamodb_1.DynamoDBClient(clientConfig);
        this.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(this.client, {
            marshallOptions: {
                convertEmptyValues: false,
                removeUndefinedValues: true,
                convertClassInstanceToMap: false,
            },
            unmarshallOptions: {
                wrapNumbers: false,
            },
        });
        this.tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'omnix-ai-dev-';
    }
    getTableName(tableName) {
        if (tableName === 'products') {
            return 'omnix-ai-products-dev';
        }
        return `${this.tablePrefix}${tableName}`;
    }
    async scan(tableName, filter) {
        try {
            const fullTableName = this.getTableName(tableName);
            console.log(`📊 Scanning DynamoDB table: ${fullTableName}`);
            const command = new lib_dynamodb_1.ScanCommand({
                TableName: fullTableName,
                ...filter,
            });
            const response = await this.docClient.send(command);
            console.log(`✅ Scan successful: Found ${response.Items?.length || 0} items`);
            return response.Items || [];
        }
        catch (error) {
            console.error(`❌ Error scanning table ${tableName}:`, error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                tableName: this.getTableName(tableName),
            });
            throw error;
        }
    }
    async get(tableName, key) {
        try {
            const command = new lib_dynamodb_1.GetCommand({
                TableName: this.getTableName(tableName),
                Key: key,
            });
            const response = await this.docClient.send(command);
            return response.Item;
        }
        catch (error) {
            console.error(`Error getting item from ${tableName}:`, error);
            throw error;
        }
    }
    async put(tableName, item) {
        try {
            const fullTableName = this.getTableName(tableName);
            console.log(`📝 Attempting to write to DynamoDB table: ${fullTableName}`);
            console.log(`📝 Item to write:`, JSON.stringify(item, null, 2));
            const command = new lib_dynamodb_1.PutCommand({
                TableName: fullTableName,
                Item: item,
                ReturnValues: 'ALL_OLD',
            });
            console.log(`📝 Sending PutCommand to DynamoDB...`);
            const response = await this.docClient.send(command);
            console.log(`✅ Successfully wrote item to DynamoDB table ${fullTableName}`);
            console.log(`📝 DynamoDB response:`, JSON.stringify(response, null, 2));
            return item;
        }
        catch (error) {
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
    async update(tableName, key, updates) {
        try {
            const updateExpression = [];
            const expressionAttributeNames = {};
            const expressionAttributeValues = {};
            Object.keys(updates).forEach((field, index) => {
                const placeholder = `#field${index}`;
                const valuePlaceholder = `:value${index}`;
                updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
                expressionAttributeNames[placeholder] = field;
                expressionAttributeValues[valuePlaceholder] = updates[field];
            });
            const command = new lib_dynamodb_1.UpdateCommand({
                TableName: this.getTableName(tableName),
                Key: key,
                UpdateExpression: `SET ${updateExpression.join(', ')}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW',
            });
            const response = await this.docClient.send(command);
            return response.Attributes;
        }
        catch (error) {
            console.error(`Error updating item in ${tableName}:`, error);
            throw error;
        }
    }
    async delete(tableName, key) {
        try {
            const command = new lib_dynamodb_1.DeleteCommand({
                TableName: this.getTableName(tableName),
                Key: key,
                ReturnValues: 'ALL_OLD',
            });
            const response = await this.docClient.send(command);
            return !!response.Attributes;
        }
        catch (error) {
            console.error(`Error deleting item from ${tableName}:`, error);
            throw error;
        }
    }
    async query(tableName, indexName, keyCondition, expressionValues, expressionNames) {
        try {
            const params = {
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
            const command = new lib_dynamodb_1.QueryCommand(params);
            const response = await this.docClient.send(command);
            return response.Items || [];
        }
        catch (error) {
            console.error(`Error querying table ${tableName}:`, error);
            throw error;
        }
    }
    async batchWrite(tableName, putItems, deleteKeys) {
        try {
            const requests = [];
            if (putItems && putItems.length > 0) {
                putItems.forEach(item => {
                    requests.push({
                        PutRequest: {
                            Item: item,
                        },
                    });
                });
            }
            if (deleteKeys && deleteKeys.length > 0) {
                deleteKeys.forEach(key => {
                    requests.push({
                        DeleteRequest: {
                            Key: key,
                        },
                    });
                });
            }
            const batchSize = 25;
            for (let i = 0; i < requests.length; i += batchSize) {
                const batch = requests.slice(i, i + batchSize);
                const command = new lib_dynamodb_1.BatchWriteCommand({
                    RequestItems: {
                        [this.getTableName(tableName)]: batch,
                    },
                });
                await this.docClient.send(command);
            }
        }
        catch (error) {
            console.error(`Error batch writing to ${tableName}:`, error);
            throw error;
        }
    }
};
exports.DynamoDBService = DynamoDBService;
exports.DynamoDBService = DynamoDBService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DynamoDBService);
//# sourceMappingURL=dynamodb.service.js.map