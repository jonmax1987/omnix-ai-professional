import { RecommendationEngineService } from './recommendation-engine.service';
import { ProductSimilarityService } from './product-similarity.service';
import { CustomersService } from '../customers/customers.service';
export interface RecommendationRequest {
    customerId: string;
    context: 'homepage' | 'product_page' | 'checkout' | 'email';
    productId?: string;
    limit?: number;
    excludeOwned?: boolean;
}
export interface RecommendationResponse {
    recommendations: any[];
    reason: string;
    algorithm: string;
    confidence: number;
    generatedAt: string;
}
export declare class MlService {
    private readonly recommendationEngine;
    private readonly productSimilarity;
    private readonly customersService;
    constructor(recommendationEngine: RecommendationEngineService, productSimilarity: ProductSimilarityService, customersService: CustomersService);
    getPersonalizedRecommendations(request: RecommendationRequest): Promise<RecommendationResponse>;
    getSimilarProducts(productId: string, limit?: number): Promise<RecommendationResponse>;
    getTrendingProducts(limit?: number): Promise<any[]>;
    getSeasonalRecommendations(season: string, limit?: number): Promise<any[]>;
    getComplementaryProducts(productIds: string[], limit?: number): Promise<any[]>;
    trackRecommendationFeedback(customerId: string, productId: string, action: 'click' | 'purchase' | 'dismiss'): Promise<void>;
    private getRecommendationReason;
}
