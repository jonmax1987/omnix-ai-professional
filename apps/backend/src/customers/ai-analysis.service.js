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
exports.AIAnalysisService = void 0;
const common_1 = require("@nestjs/common");
let AIAnalysisService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AIAnalysisService = _classThis = class {
        constructor(bedrockService, customersService, dynamoDBService) {
            this.bedrockService = bedrockService;
            this.customersService = customersService;
            this.dynamoDBService = dynamoDBService;
            this.analysisResultsTable = 'ai-analysis-results';
        }
        async analyzeCustomerConsumption(customerId) {
            console.log(`🔍 Starting consumption analysis for customer ${customerId}`);
            // Get customer purchase history
            const purchases = await this.customersService.getCustomerPurchases(customerId, 20);
            if (purchases.length === 0) {
                throw new common_1.NotFoundException(`No purchase history found for customer ${customerId}`);
            }
            // Convert to AI analysis format
            const purchaseData = await this.convertPurchasesToAnalysisFormat(purchases);
            // Perform AI analysis
            const analysisRequest = {
                customerId,
                purchases: purchaseData,
                analysisType: 'consumption_prediction',
            };
            const response = await this.bedrockService.analyzeCustomer(analysisRequest);
            if (!response.success) {
                throw new Error(`AI analysis failed: ${response.error}`);
            }
            // Cache the results
            await this.cacheAnalysisResults(response.data);
            return response.data;
        }
        async analyzeCustomerProfile(customerId) {
            console.log(`👤 Starting profile analysis for customer ${customerId}`);
            const purchases = await this.customersService.getCustomerPurchases(customerId, 50);
            if (purchases.length === 0) {
                throw new common_1.NotFoundException(`No purchase history found for customer ${customerId}`);
            }
            const purchaseData = await this.convertPurchasesToAnalysisFormat(purchases);
            const analysisRequest = {
                customerId,
                purchases: purchaseData,
                analysisType: 'customer_profiling',
            };
            const response = await this.bedrockService.analyzeCustomer(analysisRequest);
            if (!response.success) {
                throw new Error(`AI profile analysis failed: ${response.error}`);
            }
            await this.cacheAnalysisResults(response.data);
            return response.data;
        }
        async generateRecommendations(customerId, maxRecommendations = 5) {
            console.log(`💡 Generating AI recommendations for customer ${customerId}`);
            const purchases = await this.customersService.getCustomerPurchases(customerId, 30);
            if (purchases.length === 0) {
                throw new common_1.NotFoundException(`No purchase history found for customer ${customerId}`);
            }
            const purchaseData = await this.convertPurchasesToAnalysisFormat(purchases);
            const analysisRequest = {
                customerId,
                purchases: purchaseData,
                analysisType: 'recommendation_generation',
                maxRecommendations,
            };
            const response = await this.bedrockService.analyzeCustomer(analysisRequest);
            if (!response.success) {
                throw new Error(`AI recommendation generation failed: ${response.error}`);
            }
            await this.cacheAnalysisResults(response.data);
            return response.data;
        }
        async getCustomerAnalysisHistory(customerId, limit = 10) {
            const results = await this.dynamoDBService.query(this.analysisResultsTable, 'customerId-analysisDate-index', 'customerId = :customerId', { ':customerId': customerId });
            return (results || []).slice(0, limit);
        }
        async predictNextPurchaseDate(customerId, productId) {
            // Get recent analysis or perform new one
            const analysis = await this.getOrCreateAnalysis(customerId);
            const pattern = analysis.consumptionPatterns.find(p => p.productId === productId);
            if (!pattern) {
                return {
                    predictedDate: '',
                    confidence: 0,
                    averageDaysBetween: 0,
                };
            }
            return {
                predictedDate: pattern.predictedNextPurchaseDate,
                confidence: pattern.confidence,
                averageDaysBetween: pattern.averageDaysBetweenPurchases,
            };
        }
        async getReplenishmentAlerts(customerId) {
            const analysis = await this.getOrCreateAnalysis(customerId);
            const today = new Date();
            const urgent = [];
            const upcoming = [];
            analysis.consumptionPatterns.forEach(pattern => {
                const predictedDate = new Date(pattern.predictedNextPurchaseDate);
                const daysUntilNeeded = Math.ceil((predictedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (daysUntilNeeded <= 1 && pattern.confidence > 0.7) {
                    urgent.push(pattern);
                }
                else if (daysUntilNeeded <= 7 && pattern.confidence > 0.6) {
                    upcoming.push(pattern);
                }
            });
            return { urgent, upcoming };
        }
        async getOrCreateAnalysis(customerId) {
            // Check for recent analysis (within last 24 hours)
            const recentAnalysis = await this.getRecentAnalysis(customerId);
            if (recentAnalysis) {
                return recentAnalysis;
            }
            // Create new analysis
            return await this.analyzeCustomerConsumption(customerId);
        }
        async getRecentAnalysis(customerId) {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const results = await this.dynamoDBService.query(this.analysisResultsTable, 'customerId-analysisDate-index', 'customerId = :customerId AND analysisDate > :date', {
                ':customerId': customerId,
                ':date': oneDayAgo,
            });
            return results && results.length > 0 ? results[0] : null;
        }
        async convertPurchasesToAnalysisFormat(purchases) {
            // For now, we'll need to get product details from products service
            // This is a simplified version that uses available data
            return purchases.map(p => ({
                id: p.id,
                customerId: p.customerId,
                productId: p.productId,
                productName: `Product-${p.productId}`, // This should come from products service
                category: 'General', // This should come from products service
                quantity: p.quantity,
                price: p.totalPrice,
                purchaseDate: p.purchaseDate,
            }));
        }
        async cacheAnalysisResults(analysis) {
            const cacheKey = `${analysis.customerId}-${Date.now()}`;
            const cacheData = {
                ...analysis,
                id: cacheKey,
                ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days TTL
            };
            try {
                await this.dynamoDBService.put(this.analysisResultsTable, cacheData);
                console.log(`✅ Cached analysis results for customer ${analysis.customerId}`);
            }
            catch (error) {
                console.error('❌ Failed to cache analysis results:', error);
                // Don't throw - caching failure shouldn't break the analysis
            }
        }
    };
    __setFunctionName(_classThis, "AIAnalysisService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AIAnalysisService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AIAnalysisService = _classThis;
})();
exports.AIAnalysisService = AIAnalysisService;
