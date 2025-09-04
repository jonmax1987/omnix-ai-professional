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
exports.AIAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const bedrock_service_1 = require("../services/bedrock.service");
const customers_service_1 = require("./customers.service");
const dynamodb_service_1 = require("../services/dynamodb.service");
let AIAnalysisService = class AIAnalysisService {
    constructor(bedrockService, customersService, dynamoDBService) {
        this.bedrockService = bedrockService;
        this.customersService = customersService;
        this.dynamoDBService = dynamoDBService;
        this.analysisResultsTable = 'ai-analysis-results';
    }
    async analyzeCustomerConsumption(customerId) {
        console.log(`🔍 Starting consumption analysis for customer ${customerId}`);
        const purchases = await this.customersService.getCustomerPurchases(customerId, 20);
        if (purchases.length === 0) {
            throw new common_1.NotFoundException(`No purchase history found for customer ${customerId}`);
        }
        const purchaseData = await this.convertPurchasesToAnalysisFormat(purchases);
        const analysisRequest = {
            customerId,
            purchases: purchaseData,
            analysisType: 'consumption_prediction',
        };
        const response = await this.bedrockService.analyzeCustomer(analysisRequest);
        if (!response.success) {
            throw new Error(`AI analysis failed: ${response.error}`);
        }
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
        const recentAnalysis = await this.getRecentAnalysis(customerId);
        if (recentAnalysis) {
            return recentAnalysis;
        }
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
        return purchases.map(p => ({
            id: p.id,
            customerId: p.customerId,
            productId: p.productId,
            productName: `Product-${p.productId}`,
            category: 'General',
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
            ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        };
        try {
            await this.dynamoDBService.put(this.analysisResultsTable, cacheData);
            console.log(`✅ Cached analysis results for customer ${analysis.customerId}`);
        }
        catch (error) {
            console.error('❌ Failed to cache analysis results:', error);
        }
    }
};
exports.AIAnalysisService = AIAnalysisService;
exports.AIAnalysisService = AIAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bedrock_service_1.BedrockAnalysisService,
        customers_service_1.CustomersService,
        dynamodb_service_1.DynamoDBService])
], AIAnalysisService);
//# sourceMappingURL=ai-analysis.service.js.map