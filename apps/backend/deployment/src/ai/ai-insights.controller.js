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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIInsightsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../auth/decorators/user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const enhanced_bedrock_service_1 = require("../services/enhanced-bedrock.service");
const realtime_analytics_service_1 = require("../services/realtime-analytics.service");
const customer_segmentation_service_1 = require("../services/customer-segmentation.service");
const recommendations_service_1 = require("../recommendations/recommendations.service");
let AIInsightsController = class AIInsightsController {
    constructor(enhancedBedrockService, realtimeAnalyticsService, customerSegmentationService, recommendationsService) {
        this.enhancedBedrockService = enhancedBedrockService;
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
            const targetCustomerId = customerId || (user?.role === 'customer' ? user.id : null);
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
            const recommendations = await this.recommendationsService.getCustomerRecommendations(targetCustomerId, 'homepage', body.options?.maxRecommendations || 8);
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
        if (Array.isArray(recommendations)) {
            return recommendations.map((rec, index) => ({
                ...rec,
                productId: rec.id || `rec_${index}`,
                productName: rec.name || rec.title || `Product ${index + 1}`,
                confidence: 0.85 + (Math.random() * 0.15),
                reason: `Based on your purchase history and preferences`,
                personalizedScore: 0.80 + (Math.random() * 0.20),
                emoji: ['🥛', '🍌', '🥬', '🍞', '🥣', '🫒'][index % 6],
                price: 2.99 + (Math.random() * 8),
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
exports.AIInsightsController = AIInsightsController;
__decorate([
    (0, common_1.Get)('health'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check for AI insights service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI insights service is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('realtime'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time AI insights' }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['all', 'high', 'medium', 'low'] }),
    (0, swagger_1.ApiQuery)({ name: 'types', required: false, type: String, description: 'Comma-separated list of insight types' }),
    (0, swagger_1.ApiQuery)({ name: 'timeRange', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns real-time AI insights' }),
    __param(0, (0, common_1.Query)('customerId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('priority')),
    __param(3, (0, common_1.Query)('types')),
    __param(4, (0, common_1.Query)('timeRange')),
    __param(5, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getRealtimeInsights", null);
__decorate([
    (0, common_1.Get)('segmentation'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer segmentation insights' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns customer segmentation insights' }),
    __param(0, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getSegmentationInsights", null);
__decorate([
    (0, common_1.Get)('consumption-predictions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get consumption pattern predictions' }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'productId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'timeHorizon', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'includeConfidence', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'includeFactors', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns consumption predictions' }),
    __param(0, (0, common_1.Query)('customerId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('timeHorizon')),
    __param(3, (0, common_1.Query)('includeConfidence')),
    __param(4, (0, common_1.Query)('includeFactors')),
    __param(5, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getConsumptionPredictions", null);
__decorate([
    (0, common_1.Get)('churn-risk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get churn risk analysis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns churn risk analysis' }),
    __param(0, (0, common_1.Query)('customerId')),
    __param(1, (0, common_1.Query)('includeFactors')),
    __param(2, (0, common_1.Query)('includeInterventions')),
    __param(3, (0, common_1.Query)('riskThreshold')),
    __param(4, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getChurnRiskAnalysis", null);
__decorate([
    (0, common_1.Post)('personalization'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized recommendations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns personalized recommendations' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getPersonalizationRecommendations", null);
__decorate([
    (0, common_1.Get)('pricing-optimization'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get pricing optimization recommendations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns pricing optimization recommendations' }),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('timeRange')),
    __param(3, (0, common_1.Query)('includeCompetitorAnalysis')),
    __param(4, (0, common_1.Query)('includeMarginImpact')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getPricingOptimization", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Submit AI feedback for model improvement' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feedback submitted successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Get)('model-performance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI model performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns model performance metrics' }),
    __param(0, (0, common_1.Query)('modelType')),
    __param(1, (0, common_1.Query)('timeRange')),
    __param(2, (0, common_1.Query)('includeAccuracyTrends')),
    __param(3, (0, common_1.Query)('includeConfidenceDistribution')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getModelPerformance", null);
__decorate([
    (0, common_1.Get)('demand-forecasting'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory demand forecasting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns demand forecasting data' }),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('forecastPeriod')),
    __param(3, (0, common_1.Query)('includeSeasonality')),
    __param(4, (0, common_1.Query)('includeExternalFactors')),
    __param(5, (0, common_1.Query)('confidenceLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getDemandForecasting", null);
__decorate([
    (0, common_1.Get)('ab-test-recommendations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get A/B test recommendations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns A/B test recommendations' }),
    __param(0, (0, common_1.Query)('feature')),
    __param(1, (0, common_1.Query)('targetMetric')),
    __param(2, (0, common_1.Query)('includeDesignSuggestions')),
    __param(3, (0, common_1.Query)('includeStatisticalPower')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getABTestRecommendations", null);
__decorate([
    (0, common_1.Get)('business-intelligence'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get business intelligence summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns business intelligence summary' }),
    __param(0, (0, common_1.Query)('timeRange')),
    __param(1, (0, common_1.Query)('includeKeyInsights')),
    __param(2, (0, common_1.Query)('includeActionItems')),
    __param(3, (0, common_1.Query)('includePerformanceMetrics')),
    __param(4, (0, common_1.Query)('includePredictions')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AIInsightsController.prototype, "getBusinessIntelligenceSummary", null);
exports.AIInsightsController = AIInsightsController = __decorate([
    (0, swagger_1.ApiTags)('AI Insights'),
    (0, common_1.Controller)('ai/insights'),
    __metadata("design:paramtypes", [enhanced_bedrock_service_1.EnhancedBedrockService,
        realtime_analytics_service_1.RealtimeAnalyticsService,
        customer_segmentation_service_1.CustomerSegmentationService,
        recommendations_service_1.RecommendationsService])
], AIInsightsController);
//# sourceMappingURL=ai-insights.controller.js.map