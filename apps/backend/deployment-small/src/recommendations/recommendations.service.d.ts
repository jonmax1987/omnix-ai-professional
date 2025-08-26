export declare class RecommendationsService {
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
}
