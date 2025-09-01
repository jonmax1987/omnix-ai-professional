import { RecommendationsService } from './recommendations.service';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    getRecommendations(query: any): Promise<{
        data: {
            id: string;
            type: string;
            priority: string;
            productId: string;
            productName: string;
            productSku: string;
            title: string;
            description: string;
            impact: string;
            action: string;
            estimatedSavings: number;
            estimatedValue: number;
            daysUntilAction: number;
            confidence: number;
            createdAt: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        meta: {
            highPriority: number;
            mediumPriority: number;
            lowPriority: number;
            totalSavings: number;
        };
    }>;
    getOrderRecommendations(query: any): Promise<{
        data: {
            id: string;
            type: string;
            priority: string;
            productId: string;
            productName: string;
            productSku: string;
            title: string;
            description: string;
            impact: string;
            action: string;
            estimatedSavings: number;
            estimatedValue: number;
            daysUntilAction: number;
            confidence: number;
            createdAt: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        meta: {
            highPriority: number;
            mediumPriority: number;
            lowPriority: number;
            totalSavings: number;
        };
    }>;
    acceptRecommendation(recommendationId: string): Promise<{
        message: string;
        recommendationId: string;
        action: string;
    }>;
    dismissRecommendation(recommendationId: string): Promise<{
        message: string;
        recommendationId: string;
    }>;
    getRecommendationHistory(query: any): Promise<{
        data: any[];
        total: number;
        page: any;
        limit: any;
        totalPages: number;
    }>;
    getRecommendationSettings(): Promise<{
        autoApply: boolean;
        notificationEnabled: boolean;
        minConfidence: number;
        maxRecommendationsPerDay: number;
        categories: string[];
    }>;
    updateRecommendationSettings(settings: any): Promise<any>;
    getCustomerRecommendations(customerId: string, context?: 'homepage' | 'product_page' | 'checkout' | 'email', limit?: string): Promise<import("../ml/ml.service").RecommendationResponse>;
    getSimilarProducts(productId: string, limit?: string): Promise<import("../ml/ml.service").RecommendationResponse>;
    getTrendingProducts(limit?: string): Promise<any[]>;
    getSeasonalRecommendations(season?: string, limit?: string): Promise<any[]>;
    getComplementaryProducts(body: {
        productIds: string[];
        limit?: number;
    }): Promise<any[]>;
    trackRecommendationFeedback(user: any, body: {
        productId: string;
        action: 'click' | 'purchase' | 'dismiss';
    }): Promise<void>;
}
