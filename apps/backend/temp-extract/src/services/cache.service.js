"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const monitoring_service_1 = require("./monitoring.service");
const crypto = __importStar(require("crypto"));
let CacheService = class CacheService {
    constructor() {
        this.tableName = 'omnix-ai-analysis-cache-dev';
        this.cacheConfig = {
            consumption_prediction: {
                ttlMinutes: 60,
                maxEntriesPerCustomer: 10,
                enableCaching: true,
            },
            customer_profiling: {
                ttlMinutes: 720,
                maxEntriesPerCustomer: 5,
                enableCaching: true,
            },
            recommendation_generation: {
                ttlMinutes: 30,
                maxEntriesPerCustomer: 15,
                enableCaching: true,
            },
        };
        this.monitoring = new monitoring_service_1.MonitoringService();
        const region = process.env.AWS_REGION || 'eu-central-1';
        const clientConfig = { region };
        if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            clientConfig.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            };
        }
        const dynamoClient = new client_dynamodb_1.DynamoDBClient(clientConfig);
        this.dynamoClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
        console.log('🚀 Cache Service initialized');
    }
    async getCachedResult(request) {
        const config = this.cacheConfig[request.analysisType];
        if (!config?.enableCaching) {
            return null;
        }
        const cacheKey = this.generateCacheKey(request);
        const startTime = Date.now();
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.GetCommand({
                TableName: this.tableName,
                Key: { cacheKey },
            }));
            if (!result.Item) {
                await this.recordCacheMetrics(false, Date.now() - startTime);
                return null;
            }
            const entry = result.Item;
            if (new Date(entry.expiresAt) < new Date()) {
                await this.deleteCacheEntry(cacheKey);
                await this.recordCacheMetrics(false, Date.now() - startTime);
                return null;
            }
            await this.updateAccessStats(cacheKey);
            await this.recordCacheMetrics(true, Date.now() - startTime);
            console.log(`🎯 Cache HIT for ${request.analysisType} analysis (customer: ${request.customerId})`);
            return entry.result;
        }
        catch (error) {
            console.error('❌ Cache retrieval failed:', error);
            await this.recordCacheMetrics(false, Date.now() - startTime);
            return null;
        }
    }
    async setCachedResult(request, result) {
        const config = this.cacheConfig[request.analysisType];
        if (!config?.enableCaching) {
            return;
        }
        const cacheKey = this.generateCacheKey(request);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + config.ttlMinutes * 60 * 1000);
        const entry = {
            cacheKey,
            customerId: request.customerId,
            analysisType: request.analysisType,
            requestHash: this.generateRequestHash(request),
            result,
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            hitCount: 0,
            lastAccessedAt: now.toISOString(),
        };
        try {
            await this.dynamoClient.send(new lib_dynamodb_1.PutCommand({
                TableName: this.tableName,
                Item: entry,
            }));
            await this.cleanupOldEntries(request.customerId, request.analysisType, config.maxEntriesPerCustomer);
            console.log(`💾 Cache STORE for ${request.analysisType} analysis (expires: ${expiresAt.toISOString()})`);
        }
        catch (error) {
            console.error('❌ Cache storage failed:', error);
        }
    }
    generateCacheKey(request) {
        const requestHash = this.generateRequestHash(request);
        return `${request.customerId}-${request.analysisType}-${requestHash}`;
    }
    generateRequestHash(request) {
        const purchaseData = request.purchases
            .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate))
            .map(p => `${p.productId}-${p.quantity}-${p.purchaseDate}`)
            .join('|');
        const hashInput = `${request.analysisType}-${purchaseData}-${request.maxRecommendations || 5}`;
        return crypto.createHash('md5').update(hashInput).digest('hex').substring(0, 12);
    }
    async cleanupOldEntries(customerId, analysisType, maxEntries) {
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.QueryCommand({
                TableName: this.tableName,
                IndexName: 'customerId-createdAt-index',
                KeyConditionExpression: 'customerId = :customerId',
                FilterExpression: 'analysisType = :analysisType',
                ExpressionAttributeValues: {
                    ':customerId': customerId,
                    ':analysisType': analysisType,
                },
                ScanIndexForward: false,
            }));
            if (!result.Items || result.Items.length <= maxEntries) {
                return;
            }
            const entriesToDelete = result.Items.slice(maxEntries);
            for (const entry of entriesToDelete) {
                await this.deleteCacheEntry(entry.cacheKey);
            }
            console.log(`🧹 Cleaned up ${entriesToDelete.length} old cache entries for ${customerId}`);
        }
        catch (error) {
            console.error('❌ Cache cleanup failed:', error);
        }
    }
    async deleteCacheEntry(cacheKey) {
        try {
            await this.dynamoClient.send(new lib_dynamodb_1.DeleteCommand({
                TableName: this.tableName,
                Key: { cacheKey },
            }));
        }
        catch (error) {
            console.error(`❌ Failed to delete cache entry ${cacheKey}:`, error);
        }
    }
    async updateAccessStats(cacheKey) {
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.GetCommand({
                TableName: this.tableName,
                Key: { cacheKey },
            }));
            if (result.Item) {
                const entry = result.Item;
                entry.hitCount = (entry.hitCount || 0) + 1;
                entry.lastAccessedAt = new Date().toISOString();
                await this.dynamoClient.send(new lib_dynamodb_1.PutCommand({
                    TableName: this.tableName,
                    Item: entry,
                }));
            }
        }
        catch (error) {
            console.error(`❌ Failed to update access stats for ${cacheKey}:`, error);
        }
    }
    async recordCacheMetrics(hit, latencyMs) {
        try {
            await this.monitoring.recordSystemPerformance({
                cacheHitRate: hit ? 1 : 0,
            });
            await this.monitoring.recordBusinessMetric('CacheLatency', latencyMs, 'Milliseconds', [{ name: 'CacheResult', value: hit ? 'HIT' : 'MISS' }]);
        }
        catch (error) {
            console.error('❌ Failed to record cache metrics:', error);
        }
    }
    async getCacheStatistics() {
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.QueryCommand({
                TableName: this.tableName,
                IndexName: 'customerId-createdAt-index',
                KeyConditionExpression: 'customerId = :dummyKey',
                ExpressionAttributeValues: {
                    ':dummyKey': 'dummy',
                },
            }));
            return {
                totalEntries: 0,
                entriesByType: {},
                oldestEntry: 'N/A',
                newestEntry: 'N/A',
                estimatedCostSavings: 0,
            };
        }
        catch (error) {
            console.error('❌ Failed to get cache statistics:', error);
            return {
                totalEntries: 0,
                entriesByType: {},
                oldestEntry: 'N/A',
                newestEntry: 'N/A',
                estimatedCostSavings: 0,
            };
        }
    }
    async invalidateCustomerCache(customerId) {
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.QueryCommand({
                TableName: this.tableName,
                IndexName: 'customerId-createdAt-index',
                KeyConditionExpression: 'customerId = :customerId',
                ExpressionAttributeValues: {
                    ':customerId': customerId,
                },
            }));
            if (!result.Items) {
                return;
            }
            for (const entry of result.Items) {
                await this.deleteCacheEntry(entry.cacheKey);
            }
            console.log(`🗑️  Invalidated ${result.Items.length} cache entries for customer ${customerId}`);
        }
        catch (error) {
            console.error(`❌ Failed to invalidate cache for customer ${customerId}:`, error);
        }
    }
    async warmCache(customers) {
        console.log(`🔥 Warming cache for ${customers.length} customers...`);
        for (const customer of customers) {
            const analysisTypes = ['consumption_prediction', 'customer_profiling', 'recommendation_generation'];
            for (const analysisType of analysisTypes) {
                const request = {
                    customerId: customer.customerId,
                    purchases: customer.purchases,
                    analysisType,
                    maxRecommendations: 5,
                };
                const existing = await this.getCachedResult(request);
                if (!existing) {
                    console.log(`   Pre-computing ${analysisType} for ${customer.customerId}...`);
                }
            }
        }
        console.log('🔥 Cache warming completed');
    }
    async get(key) {
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.GetCommand({
                TableName: this.tableName,
                Key: { cacheKey: key },
            }));
            if (!result.Item) {
                return null;
            }
            const entry = result.Item;
            if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
                await this.deleteCacheEntry(key);
                return null;
            }
            return entry.value || null;
        }
        catch (error) {
            console.error('❌ Generic cache get failed:', error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        const now = new Date();
        const expiresAt = ttlSeconds
            ? new Date(now.getTime() + ttlSeconds * 1000)
            : new Date(now.getTime() + 3600 * 1000);
        try {
            await this.dynamoClient.send(new lib_dynamodb_1.PutCommand({
                TableName: this.tableName,
                Item: {
                    cacheKey: key,
                    value,
                    createdAt: now.toISOString(),
                    expiresAt: expiresAt.toISOString(),
                },
            }));
        }
        catch (error) {
            console.error('❌ Generic cache set failed:', error);
        }
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CacheService);
//# sourceMappingURL=cache.service.js.map