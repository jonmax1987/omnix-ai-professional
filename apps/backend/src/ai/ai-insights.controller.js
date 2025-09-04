"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIInsightsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let AIInsightsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('AI Insights'), (0, common_1.Controller)('ai/insights')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _healthCheck_decorators;
    let _getRealtimeInsights_decorators;
    let _getSegmentationInsights_decorators;
    let _getConsumptionPredictions_decorators;
    let _getChurnRiskAnalysis_decorators;
    let _getPersonalizationRecommendations_decorators;
    let _getPricingOptimization_decorators;
    let _submitFeedback_decorators;
    let _getModelPerformance_decorators;
    let _getDemandForecasting_decorators;
    let _getABTestRecommendations_decorators;
    let _getBusinessIntelligenceSummary_decorators;
    var AIInsightsController = _classThis = class {
        constructor(enhancedBedrockService, realtimeAnalyticsService, customerSegmentationService, recommendationsService) {
            this.enhancedBedrockService = (__runInitializers(this, _instanceExtraInitializers), enhancedBedrockService);
            this.realtimeAnalyticsService = realtimeAnalyticsService;
            this.customerSegmentationService = customerSegmentationService;
            this.recommendationsService = recommendationsService;
        }
        async healthCheck() {
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'ai-insights',
                endpoints: [
                    '/realtime',
                    '/segmentation',
                    '/consumption-predictions',
                    '/churn-risk',
                    '/personalization',
                    '/pricing-optimization',
                    '/feedback',
                    '/model-performance',
                    '/demand-forecasting',
                    '/ab-test-recommendations',
                    '/business-intelligence'
                ]
            };
        }
        async getRealtimeInsights(customerId, limit, priority, types, timeRange, user) {
            try {
                // Use the current user's ID if no customerId provided and user is a customer
                const targetCustomerId = customerId || (user?.role === 'customer' ? user.id : null);
                // Generate mock insights for now - in production, this would use real AI services
                const insights = await this.generateMockInsights(targetCustomerId, {
                    limit: limit ? parseInt(limit) : 10,
                    priority: priority || 'all',
                    types: types ? types.split(',') : ['savings', 'behavior', 'health', 'efficiency'],
                    timeRange: timeRange || '24h',
                });
                return {
                    success: true,
                    insights,
                    metadata: {
                        total: insights.length,
                        customerId: targetCustomerId,
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    insights: [],
                };
            }
        }
        async getSegmentationInsights(customerId) {
            try {
                // For now, return mock segmentation data since the exact method needs to be implemented
                const segmentationData = {
                    segments: [
                        { id: 'loyal_customer', name: 'Loyal Customer', confidence: 0.89 }
                    ],
                    insights: [
                        { type: 'segmentation', message: 'Customer shows high loyalty patterns', confidence: 0.89 }
                    ]
                };
                return {
                    success: true,
                    segments: segmentationData?.segments || [],
                    insights: segmentationData?.insights || [],
                    metadata: {
                        customerId,
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    segments: [],
                    insights: [],
                };
            }
        }
        async getConsumptionPredictions(customerId, productId, timeHorizon, includeConfidence, includeFactors, user) {
            try {
                const targetCustomerId = customerId || (user?.role === 'customer' ? user.id : null);
                // Generate mock predictions for now
                const predictions = await this.generateMockConsumptionPredictions(targetCustomerId, {
                    productId,
                    timeHorizon: timeHorizon || '30d',
                    includeConfidence: includeConfidence === 'true',
                    includeFactors: includeFactors === 'true',
                });
                return {
                    success: true,
                    predictions,
                    metadata: {
                        customerId: targetCustomerId,
                        productId,
                        timeHorizon: timeHorizon || '30d',
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    predictions: [],
                };
            }
        }
        async getChurnRiskAnalysis(customerId, includeFactors, includeInterventions, riskThreshold, user) {
            try {
                const targetCustomerId = customerId || (user?.role === 'customer' ? user.id : null);
                const riskAnalysis = await this.generateMockChurnAnalysis(targetCustomerId, {
                    includeFactors: includeFactors === 'true',
                    includeInterventions: includeInterventions === 'true',
                    riskThreshold: riskThreshold ? parseFloat(riskThreshold) : 0.7,
                });
                return {
                    success: true,
                    riskAnalysis,
                    metadata: {
                        customerId: targetCustomerId,
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    riskAnalysis: [],
                };
            }
        }
        async getPersonalizationRecommendations(body, user) {
            try {
                const targetCustomerId = body.customerId || (user?.role === 'customer' ? user.id : null);
                if (!targetCustomerId) {
                    throw new Error('Customer ID is required');
                }
                // Use existing recommendations service
                const recommendations = await this.recommendationsService.getCustomerRecommendations(targetCustomerId, 'homepage', body.options?.maxRecommendations || 8);
                // Enhance with AI insights
                const enhancedRecommendations = await this.enhanceRecommendationsWithAI(recommendations, targetCustomerId, body.context);
                return {
                    success: true,
                    recommendations: enhancedRecommendations,
                    metadata: {
                        customerId: targetCustomerId,
                        context: body.context,
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    recommendations: [],
                };
            }
        }
        async getPricingOptimization(productId, categoryId, timeRange, includeCompetitorAnalysis, includeMarginImpact) {
            try {
                const optimizations = await this.generateMockPricingOptimizations({
                    productId,
                    categoryId,
                    timeRange: timeRange || '30d',
                    includeCompetitorAnalysis: includeCompetitorAnalysis === 'true',
                    includeMarginImpact: includeMarginImpact === 'true',
                });
                return {
                    success: true,
                    optimizations,
                    metadata: {
                        productId,
                        categoryId,
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    optimizations: [],
                };
            }
        }
        async submitFeedback(feedback, user) {
            try {
                // In production, this would feed back into the AI models
                const result = {
                    success: true,
                    feedbackId: `feedback_${Date.now()}`,
                    predictionId: feedback.predictionId,
                    submittedAt: new Date().toISOString(),
                    userId: user?.id,
                };
                return result;
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        }
        async getModelPerformance(modelType, timeRange, includeAccuracyTrends, includeConfidenceDistribution) {
            try {
                const performance = {
                    models: {
                        consumption_prediction: {
                            accuracy: 0.94,
                            precision: 0.91,
                            recall: 0.89,
                            f1Score: 0.90,
                            lastTraining: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        },
                        churn_prediction: {
                            accuracy: 0.87,
                            precision: 0.85,
                            recall: 0.83,
                            f1Score: 0.84,
                            lastTraining: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                        },
                        recommendation_engine: {
                            accuracy: 0.92,
                            clickThroughRate: 0.15,
                            conversionRate: 0.08,
                            lastTraining: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                        },
                    },
                    trends: includeAccuracyTrends === 'true' ? [] : undefined,
                    confidenceDistribution: includeConfidenceDistribution === 'true' ? {} : undefined,
                };
                return {
                    success: true,
                    performance,
                    metadata: {
                        modelType: modelType || 'all',
                        timeRange: timeRange || '7d',
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    performance: {},
                };
            }
        }
        async getDemandForecasting(productId, categoryId, forecastPeriod, includeSeasonality, includeExternalFactors, confidenceLevel) {
            try {
                const forecasts = await this.generateMockDemandForecasting({
                    productId,
                    categoryId,
                    forecastPeriod: forecastPeriod ? parseInt(forecastPeriod) : 60,
                    includeSeasonality: includeSeasonality === 'true',
                    includeExternalFactors: includeExternalFactors === 'true',
                    confidenceLevel: confidenceLevel ? parseFloat(confidenceLevel) : 0.95,
                });
                return {
                    success: true,
                    forecasts,
                    metadata: {
                        productId,
                        categoryId,
                        forecastPeriod: forecastPeriod ? parseInt(forecastPeriod) : 60,
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    forecasts: [],
                };
            }
        }
        async getABTestRecommendations(feature, targetMetric, includeDesignSuggestions, includeStatisticalPower) {
            try {
                const recommendations = await this.generateMockABTestRecommendations({
                    feature,
                    targetMetric: targetMetric || 'revenue',
                    includeDesignSuggestions: includeDesignSuggestions === 'true',
                    includeStatisticalPower: includeStatisticalPower === 'true',
                });
                return {
                    success: true,
                    recommendations,
                    metadata: {
                        feature,
                        targetMetric: targetMetric || 'revenue',
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    recommendations: [],
                };
            }
        }
        async getBusinessIntelligenceSummary(timeRange, includeKeyInsights, includeActionItems, includePerformanceMetrics, includePredictions) {
            try {
                const summary = await this.generateMockBusinessIntelligence({
                    timeRange: timeRange || '24h',
                    includeKeyInsights: includeKeyInsights === 'true',
                    includeActionItems: includeActionItems === 'true',
                    includePerformanceMetrics: includePerformanceMetrics === 'true',
                    includePredictions: includePredictions === 'true',
                });
                return {
                    success: true,
                    summary: summary.summary,
                    insights: summary.insights,
                    metadata: {
                        timeRange: timeRange || '24h',
                        generatedAt: new Date().toISOString(),
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                    summary: {},
                    insights: [],
                };
            }
        }
        // Private helper methods for generating mock data
        async generateMockInsights(customerId, options) {
            const insightTypes = options.types || ['savings', 'behavior', 'health', 'efficiency'];
            const insights = [];
            if (insightTypes.includes('savings')) {
                insights.push({
                    id: `insight_savings_${Date.now()}`,
                    type: 'savings',
                    value: '$127',
                    insight: 'AI recommendations saved $127 this month',
                    confidence: 0.94,
                    timestamp: new Date().toISOString(),
                    dailySavings: '12.50',
                    totalSavings: '$127',
                });
            }
            if (insightTypes.includes('behavior')) {
                insights.push({
                    id: `insight_behavior_${Date.now()}`,
                    type: 'behavior',
                    purchaseCount: 23,
                    insight: 'Customer shows increased engagement with organic products',
                    confidence: 0.89,
                    timestamp: new Date().toISOString(),
                    orderCount: '8',
                });
            }
            if (insightTypes.includes('health')) {
                insights.push({
                    id: `insight_health_${Date.now()}`,
                    type: 'health',
                    healthScore: 8.5,
                    insight: 'Health score improved by 15% this month',
                    trend: 'up',
                    confidence: 0.91,
                    timestamp: new Date().toISOString(),
                });
            }
            if (insightTypes.includes('efficiency')) {
                insights.push({
                    id: `insight_efficiency_${Date.now()}`,
                    type: 'efficiency',
                    timeSaved: '4.5h',
                    insight: 'Smart recommendations reduced shopping time',
                    confidence: 0.87,
                    timestamp: new Date().toISOString(),
                });
            }
            return insights.slice(0, options.limit);
        }
        async generateMockConsumptionPredictions(customerId, options) {
            return [
                {
                    productId: 'prod_001',
                    productName: 'Organic Bananas',
                    predictedConsumptionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    confidence: 0.92,
                    reason: 'Based on 7-day consumption cycle',
                    emoji: '🍌',
                    price: 3.99,
                    personalizedScore: 0.95,
                },
                {
                    productId: 'prod_002',
                    productName: 'Almond Milk',
                    predictedConsumptionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                    confidence: 0.88,
                    reason: 'Usually purchased every 10 days',
                    emoji: '🥛',
                    price: 4.49,
                    personalizedScore: 0.87,
                },
            ];
        }
        async generateMockChurnAnalysis(customerId, options) {
            return [
                {
                    customerId,
                    riskScore: 0.25,
                    riskLevel: 'low',
                    factors: options.includeFactors ? ['regular_purchases', 'high_satisfaction'] : undefined,
                    interventions: options.includeInterventions ? ['none_required'] : undefined,
                    timestamp: new Date().toISOString(),
                },
            ];
        }
        async generateMockPricingOptimizations(options) {
            return [
                {
                    productId: options.productId || 'prod_001',
                    currentPrice: 3.99,
                    recommendedPrice: 4.29,
                    expectedRevenueLift: 0.12,
                    confidence: 0.89,
                    reasoning: 'Market analysis suggests 7% price increase with minimal demand impact',
                },
            ];
        }
        async enhanceRecommendationsWithAI(recommendations, customerId, context) {
            // Enhance existing recommendations with AI insights
            if (Array.isArray(recommendations)) {
                return recommendations.map((rec, index) => ({
                    ...rec,
                    productId: rec.id || `rec_${index}`,
                    productName: rec.name || rec.title || `Product ${index + 1}`,
                    confidence: 0.85 + (Math.random() * 0.15), // Random confidence between 0.85-1.0
                    reason: `Based on your purchase history and preferences`,
                    personalizedScore: 0.80 + (Math.random() * 0.20), // Random score between 0.80-1.0
                    emoji: ['🥛', '🍌', '🥬', '🍞', '🥣', '🫒'][index % 6],
                    price: 2.99 + (Math.random() * 8), // Random price between $2.99-$10.99
                }));
            }
            return [];
        }
        async generateMockDemandForecasting(options) {
            return [
                {
                    productId: options.productId || 'prod_001',
                    productName: 'Organic Bananas',
                    currentDemand: 150,
                    forecastedDemand: [
                        { period: 'Week 1', demand: 165, confidence: 0.92 },
                        { period: 'Week 2', demand: 158, confidence: 0.89 },
                        { period: 'Week 3', demand: 172, confidence: 0.85 },
                        { period: 'Week 4', demand: 180, confidence: 0.81 },
                    ],
                    seasonalFactors: options.includeSeasonality ? {
                        spring: 1.1,
                        summer: 1.3,
                        autumn: 1.0,
                        winter: 0.8,
                    } : undefined,
                    externalFactors: options.includeExternalFactors ? [
                        'weather_conditions',
                        'local_events',
                        'economic_indicators',
                    ] : undefined,
                },
            ];
        }
        async generateMockABTestRecommendations(options) {
            return [
                {
                    testId: `ab_test_${Date.now()}`,
                    feature: options.feature || 'product_recommendations',
                    hypothesis: 'Personalized AI recommendations will increase conversion rate',
                    suggestedVariants: [
                        {
                            name: 'Control',
                            description: 'Current recommendation algorithm',
                            expectedMetric: { conversionRate: 0.08 },
                        },
                        {
                            name: 'AI Enhanced',
                            description: 'AWS Bedrock powered personalized recommendations',
                            expectedMetric: { conversionRate: 0.12 },
                        },
                    ],
                    statisticalPower: options.includeStatisticalPower ? 0.80 : undefined,
                    designSuggestions: options.includeDesignSuggestions ? [
                        'Use 50/50 traffic split',
                        'Run test for minimum 2 weeks',
                        'Track both primary and secondary metrics',
                    ] : undefined,
                    estimatedDuration: '14 days',
                    confidence: 0.87,
                },
            ];
        }
        async generateMockBusinessIntelligence(options) {
            return {
                summary: {
                    keyMetrics: {
                        totalRevenue: 45620,
                        customerGrowth: 12.5,
                        conversionRate: 8.3,
                        averageOrderValue: 67.89,
                    },
                    trends: {
                        revenue: 'up',
                        customers: 'up',
                        conversion: 'stable',
                        orderValue: 'up',
                    },
                },
                insights: options.includeKeyInsights ? [
                    {
                        type: 'revenue',
                        message: 'Revenue increased 15% compared to last month',
                        impact: 'high',
                        confidence: 0.94,
                    },
                    {
                        type: 'customer_behavior',
                        message: 'Organic products showing 25% higher engagement',
                        impact: 'medium',
                        confidence: 0.87,
                    },
                    {
                        type: 'inventory',
                        message: 'Fresh produce category performing above forecast',
                        impact: 'medium',
                        confidence: 0.91,
                    },
                ] : [],
            };
        }
    };
    __setFunctionName(_classThis, "AIInsightsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _healthCheck_decorators = [(0, common_1.Get)('health'), (0, public_decorator_1.Public)(), (0, swagger_1.ApiOperation)({ summary: 'Health check for AI insights service' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'AI insights service is healthy' })];
        _getRealtimeInsights_decorators = [(0, common_1.Get)('realtime'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get real-time AI insights' }), (0, swagger_1.ApiQuery)({ name: 'customerId', required: false, type: String }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['all', 'high', 'medium', 'low'] }), (0, swagger_1.ApiQuery)({ name: 'types', required: false, type: String, description: 'Comma-separated list of insight types' }), (0, swagger_1.ApiQuery)({ name: 'timeRange', required: false, type: String }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns real-time AI insights' })];
        _getSegmentationInsights_decorators = [(0, common_1.Get)('segmentation'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get customer segmentation insights' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns customer segmentation insights' })];
        _getConsumptionPredictions_decorators = [(0, common_1.Get)('consumption-predictions'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get consumption pattern predictions' }), (0, swagger_1.ApiQuery)({ name: 'customerId', required: false, type: String }), (0, swagger_1.ApiQuery)({ name: 'productId', required: false, type: String }), (0, swagger_1.ApiQuery)({ name: 'timeHorizon', required: false, type: String }), (0, swagger_1.ApiQuery)({ name: 'includeConfidence', required: false, type: Boolean }), (0, swagger_1.ApiQuery)({ name: 'includeFactors', required: false, type: Boolean }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns consumption predictions' })];
        _getChurnRiskAnalysis_decorators = [(0, common_1.Get)('churn-risk'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get churn risk analysis' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns churn risk analysis' })];
        _getPersonalizationRecommendations_decorators = [(0, common_1.Post)('personalization'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get personalized recommendations' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns personalized recommendations' })];
        _getPricingOptimization_decorators = [(0, common_1.Get)('pricing-optimization'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get pricing optimization recommendations' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns pricing optimization recommendations' })];
        _submitFeedback_decorators = [(0, common_1.Post)('feedback'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Submit AI feedback for model improvement' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Feedback submitted successfully' })];
        _getModelPerformance_decorators = [(0, common_1.Get)('model-performance'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get AI model performance metrics' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns model performance metrics' })];
        _getDemandForecasting_decorators = [(0, common_1.Get)('demand-forecasting'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get inventory demand forecasting' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns demand forecasting data' })];
        _getABTestRecommendations_decorators = [(0, common_1.Get)('ab-test-recommendations'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get A/B test recommendations' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns A/B test recommendations' })];
        _getBusinessIntelligenceSummary_decorators = [(0, common_1.Get)('business-intelligence'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get business intelligence summary' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns business intelligence summary' })];
        __esDecorate(_classThis, null, _healthCheck_decorators, { kind: "method", name: "healthCheck", static: false, private: false, access: { has: obj => "healthCheck" in obj, get: obj => obj.healthCheck }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRealtimeInsights_decorators, { kind: "method", name: "getRealtimeInsights", static: false, private: false, access: { has: obj => "getRealtimeInsights" in obj, get: obj => obj.getRealtimeInsights }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSegmentationInsights_decorators, { kind: "method", name: "getSegmentationInsights", static: false, private: false, access: { has: obj => "getSegmentationInsights" in obj, get: obj => obj.getSegmentationInsights }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getConsumptionPredictions_decorators, { kind: "method", name: "getConsumptionPredictions", static: false, private: false, access: { has: obj => "getConsumptionPredictions" in obj, get: obj => obj.getConsumptionPredictions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getChurnRiskAnalysis_decorators, { kind: "method", name: "getChurnRiskAnalysis", static: false, private: false, access: { has: obj => "getChurnRiskAnalysis" in obj, get: obj => obj.getChurnRiskAnalysis }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPersonalizationRecommendations_decorators, { kind: "method", name: "getPersonalizationRecommendations", static: false, private: false, access: { has: obj => "getPersonalizationRecommendations" in obj, get: obj => obj.getPersonalizationRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPricingOptimization_decorators, { kind: "method", name: "getPricingOptimization", static: false, private: false, access: { has: obj => "getPricingOptimization" in obj, get: obj => obj.getPricingOptimization }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _submitFeedback_decorators, { kind: "method", name: "submitFeedback", static: false, private: false, access: { has: obj => "submitFeedback" in obj, get: obj => obj.submitFeedback }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getModelPerformance_decorators, { kind: "method", name: "getModelPerformance", static: false, private: false, access: { has: obj => "getModelPerformance" in obj, get: obj => obj.getModelPerformance }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDemandForecasting_decorators, { kind: "method", name: "getDemandForecasting", static: false, private: false, access: { has: obj => "getDemandForecasting" in obj, get: obj => obj.getDemandForecasting }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getABTestRecommendations_decorators, { kind: "method", name: "getABTestRecommendations", static: false, private: false, access: { has: obj => "getABTestRecommendations" in obj, get: obj => obj.getABTestRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBusinessIntelligenceSummary_decorators, { kind: "method", name: "getBusinessIntelligenceSummary", static: false, private: false, access: { has: obj => "getBusinessIntelligenceSummary" in obj, get: obj => obj.getBusinessIntelligenceSummary }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AIInsightsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AIInsightsController = _classThis;
})();
exports.AIInsightsController = AIInsightsController;
