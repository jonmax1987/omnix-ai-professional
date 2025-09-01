import { EnhancedBedrockService } from '../services/enhanced-bedrock.service';
import { RealtimeAnalyticsService } from '../services/realtime-analytics.service';
import { CustomerSegmentationService } from '../services/customer-segmentation.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
export declare class AIInsightsController {
    private readonly enhancedBedrockService;
    private readonly realtimeAnalyticsService;
    private readonly customerSegmentationService;
    private readonly recommendationsService;
    constructor(enhancedBedrockService: EnhancedBedrockService, realtimeAnalyticsService: RealtimeAnalyticsService, customerSegmentationService: CustomerSegmentationService, recommendationsService: RecommendationsService);
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        service: string;
        endpoints: string[];
    }>;
    getRealtimeInsights(customerId?: string, limit?: string, priority?: string, types?: string, timeRange?: string, user?: any): Promise<{
        success: boolean;
        insights: any[];
        metadata: {
            total: number;
            customerId: any;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        insights: any[];
        metadata?: undefined;
    }>;
    getSegmentationInsights(customerId?: string): Promise<{
        success: boolean;
        segments: {
            id: string;
            name: string;
            confidence: number;
        }[];
        insights: {
            type: string;
            message: string;
            confidence: number;
        }[];
        metadata: {
            customerId: string;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        segments: any[];
        insights: any[];
        metadata?: undefined;
    }>;
    getConsumptionPredictions(customerId?: string, productId?: string, timeHorizon?: string, includeConfidence?: string, includeFactors?: string, user?: any): Promise<{
        success: boolean;
        predictions: {
            productId: string;
            productName: string;
            predictedConsumptionDate: string;
            confidence: number;
            reason: string;
            emoji: string;
            price: number;
            personalizedScore: number;
        }[];
        metadata: {
            customerId: any;
            productId: string;
            timeHorizon: string;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        predictions: any[];
        metadata?: undefined;
    }>;
    getChurnRiskAnalysis(customerId?: string, includeFactors?: string, includeInterventions?: string, riskThreshold?: string, user?: any): Promise<{
        success: boolean;
        riskAnalysis: {
            customerId: string;
            riskScore: number;
            riskLevel: string;
            factors: string[];
            interventions: string[];
            timestamp: string;
        }[];
        metadata: {
            customerId: any;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        riskAnalysis: any[];
        metadata?: undefined;
    }>;
    getPersonalizationRecommendations(body: {
        customerId: string;
        context?: any;
        options?: any;
    }, user?: any): Promise<{
        success: boolean;
        recommendations: any[];
        metadata: {
            customerId: any;
            context: any;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        recommendations: any[];
        metadata?: undefined;
    }>;
    getPricingOptimization(productId?: string, categoryId?: string, timeRange?: string, includeCompetitorAnalysis?: string, includeMarginImpact?: string): Promise<{
        success: boolean;
        optimizations: {
            productId: any;
            currentPrice: number;
            recommendedPrice: number;
            expectedRevenueLift: number;
            confidence: number;
            reasoning: string;
        }[];
        metadata: {
            productId: string;
            categoryId: string;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        optimizations: any[];
        metadata?: undefined;
    }>;
    submitFeedback(feedback: {
        predictionId: string;
        actualOutcome: any;
        userFeedback: any;
        context?: any;
    }, user?: any): Promise<{
        success: boolean;
        feedbackId: string;
        predictionId: string;
        submittedAt: string;
        userId: any;
    } | {
        success: boolean;
        error: any;
    }>;
    getModelPerformance(modelType?: string, timeRange?: string, includeAccuracyTrends?: string, includeConfidenceDistribution?: string): Promise<{
        success: boolean;
        performance: {
            models: {
                consumption_prediction: {
                    accuracy: number;
                    precision: number;
                    recall: number;
                    f1Score: number;
                    lastTraining: string;
                };
                churn_prediction: {
                    accuracy: number;
                    precision: number;
                    recall: number;
                    f1Score: number;
                    lastTraining: string;
                };
                recommendation_engine: {
                    accuracy: number;
                    clickThroughRate: number;
                    conversionRate: number;
                    lastTraining: string;
                };
            };
            trends: any[];
            confidenceDistribution: {};
        };
        metadata: {
            modelType: string;
            timeRange: string;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        performance: {};
        metadata?: undefined;
    }>;
    getDemandForecasting(productId?: string, categoryId?: string, forecastPeriod?: string, includeSeasonality?: string, includeExternalFactors?: string, confidenceLevel?: string): Promise<{
        success: boolean;
        forecasts: {
            productId: any;
            productName: string;
            currentDemand: number;
            forecastedDemand: {
                period: string;
                demand: number;
                confidence: number;
            }[];
            seasonalFactors: {
                spring: number;
                summer: number;
                autumn: number;
                winter: number;
            };
            externalFactors: string[];
        }[];
        metadata: {
            productId: string;
            categoryId: string;
            forecastPeriod: number;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        forecasts: any[];
        metadata?: undefined;
    }>;
    getABTestRecommendations(feature?: string, targetMetric?: string, includeDesignSuggestions?: string, includeStatisticalPower?: string): Promise<{
        success: boolean;
        recommendations: {
            testId: string;
            feature: any;
            hypothesis: string;
            suggestedVariants: {
                name: string;
                description: string;
                expectedMetric: {
                    conversionRate: number;
                };
            }[];
            statisticalPower: number;
            designSuggestions: string[];
            estimatedDuration: string;
            confidence: number;
        }[];
        metadata: {
            feature: string;
            targetMetric: string;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        recommendations: any[];
        metadata?: undefined;
    }>;
    getBusinessIntelligenceSummary(timeRange?: string, includeKeyInsights?: string, includeActionItems?: string, includePerformanceMetrics?: string, includePredictions?: string): Promise<{
        success: boolean;
        summary: {
            keyMetrics: {
                totalRevenue: number;
                customerGrowth: number;
                conversionRate: number;
                averageOrderValue: number;
            };
            trends: {
                revenue: string;
                customers: string;
                conversion: string;
                orderValue: string;
            };
        };
        insights: {
            type: string;
            message: string;
            impact: string;
            confidence: number;
        }[];
        metadata: {
            timeRange: string;
            generatedAt: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        summary: {};
        insights: any[];
        metadata?: undefined;
    }>;
    private generateMockInsights;
    private generateMockConsumptionPredictions;
    private generateMockChurnAnalysis;
    private generateMockPricingOptimizations;
    private enhanceRecommendationsWithAI;
    private generateMockDemandForecasting;
    private generateMockABTestRecommendations;
    private generateMockBusinessIntelligence;
}
