"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBService = void 0;
const common_1 = require("@nestjs/common");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
let DynamoDBService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DynamoDBService = _classThis = class {
        constructor() {
            // Initialize DynamoDB client
            const clientConfig = {
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
            this.client = new client_dynamodb_1.DynamoDBClient(clientConfig);
            // Create document client for easier operations
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
            // Table prefix for environment separation
            this.tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'omnix-ai-dev-';
        }
        /**
         * Get table name with prefix
         */
        getTableName(tableName) {
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
        /**
         * Get a single item by key
         */
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
        /**
         * Put (create or update) an item
         */
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
        /**
         * Update an item
         */
        async update(tableName, key, updates) {
            try {
                // Build update expression
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
        /**
         * Delete an item
         */
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
        /**
         * Query items using an index
         */
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
        /**
         * Batch write items (create/delete multiple items)
         */
        async batchWrite(tableName, putItems, deleteKeys) {
            try {
                const requests = [];
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
    __setFunctionName(_classThis, "DynamoDBService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DynamoDBService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DynamoDBService = _classThis;
})();
exports.DynamoDBService = DynamoDBService;
