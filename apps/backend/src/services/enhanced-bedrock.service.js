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
exports.EnhancedBedrockService = void 0;
const common_1 = require("@nestjs/common");
let EnhancedBedrockService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EnhancedBedrockService = _classThis = class {
        constructor(bedrockService, abTestingService, monitoring, costAnalytics) {
            this.bedrockService = bedrockService;
            this.abTestingService = abTestingService;
            this.monitoring = monitoring;
            this.costAnalytics = costAnalytics;
        }
        /**
         * Enhanced analysis with A/B testing support
         */
        async analyzeCustomerWithABTesting(request) {
            const startTime = Date.now();
            try {
                // Check if A/B testing is enabled
                if (process.env.AB_TESTING_ENABLED === 'true') {
                    return await this.performABTestAnalysis(request);
                }
                // Fall back to standard analysis
                return await this.bedrockService.analyzeCustomer(request);
            }
            catch (error) {
                console.error('❌ Enhanced Bedrock analysis failed:', error);
                // Record failure metrics
                await this.recordFailureMetrics(request, Date.now() - startTime, error);
                // Return fallback analysis
                return await this.bedrockService.analyzeCustomer(request);
            }
        }
        /**
         * Perform analysis using A/B testing
         */
        async performABTestAnalysis(request) {
            console.log(`🧪 Starting A/B test analysis for customer ${request.customerId}`);
            // Build analysis prompt
            const prompt = this.buildAnalysisPrompt(request);
            // Use A/B testing service to invoke model
            const testResult = await this.abTestingService.invokeModelWithABTesting(request, prompt);
            // Parse the response
            const analysisResult = this.parseBedrockResponse(testResult.response, request.customerId);
            // Record comprehensive metrics
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
        /**
         * Build analysis prompt (copied from original bedrock service)
         */
        buildAnalysisPrompt(request) {
            const { customerId, purchases, analysisType } = request;
            // Sort purchases by date (most recent first)
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
        /**
         * Parse Bedrock response (copied from original service)
         */
        parseBedrockResponse(response, customerId) {
            try {
                // Extract JSON from response (Claude might wrap it in explanation text)
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No valid JSON found in Bedrock response');
                }
                const parsed = JSON.parse(jsonMatch[0]);
                // Build complete analysis result
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
                // Return fallback result
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
        /**
         * Calculate overall confidence
         */
        calculateOverallConfidence(parsed) {
            if (parsed.consumptionPatterns && parsed.consumptionPatterns.length > 0) {
                const avgConfidence = parsed.consumptionPatterns.reduce((sum, pattern) => sum + (pattern.confidence || 0), 0) / parsed.consumptionPatterns.length;
                return avgConfidence;
            }
            return 0.5; // Default medium confidence
        }
        /**
         * Get default customer profile
         */
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
        /**
         * Record A/B test metrics
         */
        async recordABTestMetrics(request, testResult) {
            try {
                // Record monitoring metrics
                await this.monitoring.recordAIAnalysisMetrics({
                    analysisType: request.analysisType,
                    processingTime: testResult.processingTime,
                    success: true,
                    usedFallback: false,
                    confidence: 0.7, // Placeholder - would be extracted from response
                    customerId: request.customerId,
                });
                // Record cost analytics
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
        /**
         * Record failure metrics
         */
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
        /**
         * Get A/B test results
         */
        async getABTestResults(testId) {
            return await this.abTestingService.getABTestResults(testId);
        }
        /**
         * List all A/B tests
         */
        async listABTests() {
            return await this.abTestingService.listABTests();
        }
        /**
         * Create new A/B test
         */
        async createABTest(config) {
            await this.abTestingService.createABTest({
                ...config,
                active: true,
            });
        }
        /**
         * Deactivate A/B test
         */
        async deactivateABTest(testId) {
            await this.abTestingService.deactivateABTest(testId);
        }
    };
    __setFunctionName(_classThis, "EnhancedBedrockService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EnhancedBedrockService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EnhancedBedrockService = _classThis;
})();
exports.EnhancedBedrockService = EnhancedBedrockService;
