import { MlService } from '../ml/ml.service';
export declare class RecommendationsService {
    private readonly mlService;
    constructor(mlService: MlService);
    private mockRecommendations;
    getRecommendations(query?: any): Promise<{
        data: ({
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
            daysUntilAction: number;
            confidence: number;
            createdAt: string;
        } | {
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
            daysUntilAction: number;
            confidence: number;
            createdAt: string;
            estimatedSavings?: undefined;
        })[];
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
    getCustomerRecommendations(customerId: string, context?: 'homepage' | 'product_page' | 'checkout' | 'email', limit?: number): Promise<import("../ml/ml.service").RecommendationResponse>;
    getSimilarProducts(productId: string, limit?: number): Promise<import("../ml/ml.service").RecommendationResponse>;
    getTrendingProducts(limit?: number): Promise<any[]>;
    getSeasonalRecommendations(season?: string, limit?: number): Promise<any[]>;
    getComplementaryProducts(productIds: string[], limit?: number): Promise<any[]>;
    trackRecommendationFeedback(customerId: string, productId: string, action: 'click' | 'purchase' | 'dismiss'): Promise<void>;
    private getCurrentSeason;
}
