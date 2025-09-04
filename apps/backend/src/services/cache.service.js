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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const monitoring_service_1 = require("./monitoring.service");
const crypto = __importStar(require("crypto"));
let CacheService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CacheService = _classThis = class {
        constructor() {
            this.tableName = 'omnix-ai-analysis-cache-dev';
            // Cache configuration
            this.cacheConfig = {
                consumption_prediction: {
                    ttlMinutes: 60, // 1 hour cache for predictions
                    maxEntriesPerCustomer: 10,
                    enableCaching: true,
                },
                customer_profiling: {
                    ttlMinutes: 720, // 12 hours for profiles (changes less frequently)
                    maxEntriesPerCustomer: 5,
                    enableCaching: true,
                },
                recommendation_generation: {
                    ttlMinutes: 30, // 30 minutes for recommendations
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
        /**
         * Get cached analysis result if available and not expired
         */
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
                    // Cache miss
                    await this.recordCacheMetrics(false, Date.now() - startTime);
                    return null;
                }
                const entry = result.Item;
                // Check if expired
                if (new Date(entry.expiresAt) < new Date()) {
                    // Cache expired - delete it
                    await this.deleteCacheEntry(cacheKey);
                    await this.recordCacheMetrics(false, Date.now() - startTime);
                    return null;
                }
                // Update access statistics
                await this.updateAccessStats(cacheKey);
                // Cache hit
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
        /**
         * Store analysis result in cache
         */
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
                // Store cache entry
                await this.dynamoClient.send(new lib_dynamodb_1.PutCommand({
                    TableName: this.tableName,
                    Item: entry,
                }));
                // Clean up old entries for this customer/analysis type
                await this.cleanupOldEntries(request.customerId, request.analysisType, config.maxEntriesPerCustomer);
                console.log(`💾 Cache STORE for ${request.analysisType} analysis (expires: ${expiresAt.toISOString()})`);
            }
            catch (error) {
                console.error('❌ Cache storage failed:', error);
            }
        }
        /**
         * Generate deterministic cache key based on request parameters
         */
        generateCacheKey(request) {
            const requestHash = this.generateRequestHash(request);
            return `${request.customerId}-${request.analysisType}-${requestHash}`;
        }
        /**
         * Generate hash of request parameters that affect analysis outcome
         */
        generateRequestHash(request) {
            // Create hash based on purchase data that affects analysis
            const purchaseData = request.purchases
                .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate))
                .map(p => `${p.productId}-${p.quantity}-${p.purchaseDate}`)
                .join('|');
            const hashInput = `${request.analysisType}-${purchaseData}-${request.maxRecommendations || 5}`;
            return crypto.createHash('md5').update(hashInput).digest('hex').substring(0, 12);
        }
        /**
         * Clean up old cache entries to maintain limits per customer
         */
        async cleanupOldEntries(customerId, analysisType, maxEntries) {
            try {
                // Query all entries for this customer and analysis type
                const result = await this.dynamoClient.send(new lib_dynamodb_1.QueryCommand({
                    TableName: this.tableName,
                    IndexName: 'customerId-createdAt-index',
                    KeyConditionExpression: 'customerId = :customerId',
                    FilterExpression: 'analysisType = :analysisType',
                    ExpressionAttributeValues: {
                        ':customerId': customerId,
                        ':analysisType': analysisType,
                    },
                    ScanIndexForward: false, // Latest first
                }));
                if (!result.Items || result.Items.length <= maxEntries) {
                    return; // No cleanup needed
                }
                // Delete entries beyond the limit
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
        /**
         * Delete cache entry
         */
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
        /**
         * Update access statistics for cache entry
         */
        async updateAccessStats(cacheKey) {
            try {
                // Note: This is a simplified update - in production, you might use DynamoDB UpdateItem
                // with atomic counters for better performance
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
        /**
         * Record cache performance metrics
         */
        async recordCacheMetrics(hit, latencyMs) {
            try {
                await this.monitoring.recordSystemPerformance({
                    cacheHitRate: hit ? 1 : 0,
                });
                // Record cache latency
                await this.monitoring.recordBusinessMetric('CacheLatency', latencyMs, 'Milliseconds', [{ name: 'CacheResult', value: hit ? 'HIT' : 'MISS' }]);
            }
            catch (error) {
                console.error('❌ Failed to record cache metrics:', error);
            }
        }
        /**
         * Get cache statistics for monitoring
         */
        async getCacheStatistics() {
            try {
                // This is a simplified version - in production you'd use more efficient queries
                const result = await this.dynamoClient.send(new lib_dynamodb_1.QueryCommand({
                    TableName: this.tableName,
                    IndexName: 'customerId-createdAt-index',
                    KeyConditionExpression: 'customerId = :dummyKey', // This won't work as intended
                    ExpressionAttributeValues: {
                        ':dummyKey': 'dummy', // Placeholder - need to implement proper global stats
                    },
                }));
                // For now, return basic structure
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
        /**
         * Invalidate cache for a specific customer (useful when they make new purchases)
         */
        async invalidateCustomerCache(customerId) {
            try {
                // Query all entries for this customer
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
                // Delete all entries for this customer
                for (const entry of result.Items) {
                    await this.deleteCacheEntry(entry.cacheKey);
                }
                console.log(`🗑️  Invalidated ${result.Items.length} cache entries for customer ${customerId}`);
            }
            catch (error) {
                console.error(`❌ Failed to invalidate cache for customer ${customerId}:`, error);
            }
        }
        /**
         * Warm cache with pre-computed analysis for high-value customers
         */
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
                    // Check if already cached
                    const existing = await this.getCachedResult(request);
                    if (!existing) {
                        console.log(`   Pre-computing ${analysisType} for ${customer.customerId}...`);
                        // Note: In a real implementation, you would trigger the analysis here
                        // For now, just log the intent
                    }
                }
            }
            console.log('🔥 Cache warming completed');
        }
        /**
         * Generic get method for simple string caching
         */
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
                // Check if expired
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
        /**
         * Generic set method for simple string caching
         */
        async set(key, value, ttlSeconds) {
            const now = new Date();
            const expiresAt = ttlSeconds
                ? new Date(now.getTime() + ttlSeconds * 1000)
                : new Date(now.getTime() + 3600 * 1000); // Default 1 hour
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
    __setFunctionName(_classThis, "CacheService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CacheService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CacheService = _classThis;
})();
exports.CacheService = CacheService;
