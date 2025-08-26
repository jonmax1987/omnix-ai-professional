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
exports.EnhancedBedrockService = void 0;
const common_1 = require("@nestjs/common");
const bedrock_service_1 = require("./bedrock.service");
const ab_testing_service_1 = require("./ab-testing.service");
const monitoring_service_1 = require("./monitoring.service");
const cost_analytics_service_1 = require("./cost-analytics.service");
let EnhancedBedrockService = class EnhancedBedrockService {
    constructor(bedrockService, abTestingService, monitoring, costAnalytics) {
        this.bedrockService = bedrockService;
        this.abTestingService = abTestingService;
        this.monitoring = monitoring;
        this.costAnalytics = costAnalytics;
    }
    async analyzeCustomerWithABTesting(request) {
        const startTime = Date.now();
        try {
            if (process.env.AB_TESTING_ENABLED === 'true') {
                return await this.performABTestAnalysis(request);
            }
            return await this.bedrockService.analyzeCustomer(request);
        }
        catch (error) {
            console.error('❌ Enhanced Bedrock analysis failed:', error);
            await this.recordFailureMetrics(request, Date.now() - startTime, error);
            return await this.bedrockService.analyzeCustomer(request);
        }
    }
    async performABTestAnalysis(request) {
        console.log(`🧪 Starting A/B test analysis for customer ${request.customerId}`);
        const prompt = this.buildAnalysisPrompt(request);
        const testResult = await this.abTestingService.invokeModelWithABTesting(request, prompt);
        const analysisResult = this.parseBedrockResponse(testResult.response, request.customerId);
        await this.recordABTestMetrics(request, testResult);
        console.log(`✅ A/B test analysis completed using ${testResult.modelUsed} in ${testResult.processingTime}ms`);
        return {
            success: true,
            data: analysisResult,
            processingTime: testResult.processingTime,
            tokensUsed: testResult.inputTokens + testResult.outputTokens,
            modelUsed: testResult.modelUsed,
            testId: testResult.testId,
        };
    }
    buildAnalysisPrompt(request) {
        const { customerId, purchases, analysisType } = request;
        const sortedPurchases = purchases.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
        const purchaseHistory = sortedPurchases.map(p => `${p.purchaseDate}: ${p.productName} (${p.category}) - Qty: ${p.quantity}, Price: $${p.price}`).join('\n');
        let systemPrompt = '';
        let userPrompt = '';
        switch (analysisType) {
            case 'consumption_prediction':
                systemPrompt = `You are an AI shopping pattern analyst. Analyze customer purchase history to predict when they will need to buy products again. Focus on:
1. Regular consumption patterns (e.g., "buys milk every 5-7 days")
2. Seasonal variations
3. Quantity patterns
4. Brand preferences

Return your analysis as a valid JSON object with this structure:
{
  "consumptionPatterns": [
    {
      "productId": "string",
      "productName": "string", 
      "category": "string",
      "averageDaysBetweenPurchases": number,
      "predictedNextPurchaseDate": "YYYY-MM-DD",
      "confidence": number (0-1),
      "seasonalVariation": boolean
    }
  ],
  "dataQuality": "poor|fair|good|excellent"
}`;
                userPrompt = `Analyze this customer's purchase history for consumption patterns:

Customer ID: ${customerId}
Purchase History (${purchases.length} purchases):
${purchaseHistory}

Focus on products purchased multiple times. Calculate average days between purchases and predict next purchase dates. Only include patterns with confidence > 0.6.`;
                break;
            case 'customer_profiling':
                systemPrompt = `You are an AI customer profiling expert. Analyze shopping behavior to create a detailed customer profile. Consider:
1. Spending patterns and preferences
2. Shopping frequency and timing
3. Brand loyalty and price sensitivity
4. Lifestyle indicators from product choices

Return analysis as valid JSON:
{
  "customerProfile": {
    "customerId": "${customerId}",
    "spendingPatterns": {
      "averageOrderValue": number,
      "preferredCategories": ["string"],
      "shoppingFrequency": "daily|weekly|monthly|irregular", 
      "pricePreference": "budget|mid-range|premium"
    },
    "behavioralInsights": {
      "plannedShopper": boolean,
      "brandLoyal": boolean,
      "seasonalShopper": boolean,
      "bulkBuyer": boolean
    },
    "demographics": {
      "estimatedAgeGroup": "string",
      "estimatedIncomeLevel": "string", 
      "familySize": number,
      "lifestyle": ["string"]
    }
  }
}`;
                userPrompt = `Create a detailed profile for this customer based on their shopping behavior:

Customer ID: ${customerId}
Purchase History:
${purchaseHistory}

Analyze spending patterns, brand preferences, product categories, and shopping timing to infer demographics and lifestyle.`;
                break;
            case 'recommendation_generation':
                systemPrompt = `You are an AI recommendation engine. Generate personalized product recommendations based on purchase history. Consider:
1. Consumption patterns and timing
2. Complementary products
3. Seasonal needs
4. Brand preferences

Return recommendations as valid JSON:
{
  "recommendations": [
    {
      "productId": "string",
      "productName": "string",
      "reason": "string",
      "urgency": "low|medium|high",
      "predictedPurchaseDate": "YYYY-MM-DD"
    }
  ]
}`;
                userPrompt = `Generate ${request.maxRecommendations || 5} personalized recommendations for this customer:

Customer ID: ${customerId}
Recent Purchase History:
${purchaseHistory}

Focus on items they likely need soon based on consumption patterns, complementary products, and seasonal timing.`;
                break;
        }
        return `Human: ${systemPrompt}

${userPrompt}`;
    }
    parseBedrockResponse(response, customerId) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in Bedrock response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            const analysisResult = {
                customerId,
                analysisDate: new Date().toISOString(),
                consumptionPatterns: parsed.consumptionPatterns || [],
                customerProfile: parsed.customerProfile || this.getDefaultCustomerProfile(customerId),
                recommendations: parsed.recommendations || [],
                confidence: this.calculateOverallConfidence(parsed),
                dataQuality: parsed.dataQuality || 'fair',
            };
            return analysisResult;
        }
        catch (error) {
            console.error('❌ Failed to parse Bedrock response:', error);
            return {
                customerId,
                analysisDate: new Date().toISOString(),
                consumptionPatterns: [],
                customerProfile: this.getDefaultCustomerProfile(customerId),
                recommendations: [],
                confidence: 0,
                dataQuality: 'poor',
            };
        }
    }
    calculateOverallConfidence(parsed) {
        if (parsed.consumptionPatterns && parsed.consumptionPatterns.length > 0) {
            const avgConfidence = parsed.consumptionPatterns.reduce((sum, pattern) => sum + (pattern.confidence || 0), 0) / parsed.consumptionPatterns.length;
            return avgConfidence;
        }
        return 0.5;
    }
    getDefaultCustomerProfile(customerId) {
        return {
            customerId,
            spendingPatterns: {
                averageOrderValue: 0,
                preferredCategories: [],
                shoppingFrequency: 'irregular',
                pricePreference: 'mid-range',
            },
            behavioralInsights: {
                plannedShopper: false,
                brandLoyal: false,
                seasonalShopper: false,
                bulkBuyer: false,
            },
            demographics: {
                estimatedAgeGroup: 'unknown',
                estimatedIncomeLevel: 'unknown',
                familySize: 1,
                lifestyle: [],
            },
        };
    }
    async recordABTestMetrics(request, testResult) {
        try {
            await this.monitoring.recordAIAnalysisMetrics({
                analysisType: request.analysisType,
                processingTime: testResult.processingTime,
                success: true,
                usedFallback: false,
                confidence: 0.7,
                customerId: request.customerId,
            });
            await this.costAnalytics.recordBedrockCall({
                customerId: request.customerId,
                analysisType: request.analysisType,
                modelId: testResult.modelUsed,
                inputTokens: testResult.inputTokens,
                outputTokens: testResult.outputTokens,
                processingTimeMs: testResult.processingTime,
                success: true,
                usedFallback: false,
            });
        }
        catch (error) {
            console.error('❌ Failed to record A/B test metrics:', error);
        }
    }
    async recordFailureMetrics(request, processingTime, error) {
        try {
            await this.monitoring.recordAIAnalysisMetrics({
                analysisType: request.analysisType,
                processingTime,
                success: false,
                usedFallback: true,
                confidence: 0,
                customerId: request.customerId,
            });
        }
        catch (monitoringError) {
            console.error('❌ Failed to record failure metrics:', monitoringError);
        }
    }
    async getABTestResults(testId) {
        return await this.abTestingService.getABTestResults(testId);
    }
    async listABTests() {
        return await this.abTestingService.listABTests();
    }
    async createABTest(config) {
        await this.abTestingService.createABTest({
            ...config,
            active: true,
        });
    }
    async deactivateABTest(testId) {
        await this.abTestingService.deactivateABTest(testId);
    }
};
exports.EnhancedBedrockService = EnhancedBedrockService;
exports.EnhancedBedrockService = EnhancedBedrockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bedrock_service_1.BedrockAnalysisService,
        ab_testing_service_1.ABTestingService,
        monitoring_service_1.MonitoringService,
        cost_analytics_service_1.CostAnalyticsService])
], EnhancedBedrockService);
//# sourceMappingURL=enhanced-bedrock.service.js.map