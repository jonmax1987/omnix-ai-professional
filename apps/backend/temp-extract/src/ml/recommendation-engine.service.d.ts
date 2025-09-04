import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { ProductSimilarityService } from './product-similarity.service';
import { DynamoDBService } from '../services/dynamodb.service';
import { ProductDto as Product } from '../common/dto/product.dto';
export interface RecommendationItem {
    product: Product;
    score: number;
    reason: string;
    tags: string[];
}
export interface RecommendationResult {
    customerId: string;
    recommendations: RecommendationItem[];
    algorithmType: string;
    confidence: number;
    context: string;
    generatedAt: string;
}
export declare class RecommendationEngineService {
    private readonly customersService;
    private readonly productsService;
    private readonly productSimilarityService;
    private readonly dynamoDBService;
    private readonly recommendationsTable;
    constructor(customersService: CustomersService, productsService: ProductsService, productSimilarityService: ProductSimilarityService, dynamoDBService: DynamoDBService);
    generateRecommendations(customerId: string, context?: 'homepage' | 'product_page' | 'checkout' | 'email', limit?: number): Promise<RecommendationResult>;
    private getContentBasedRecommendations;
    private getCollaborativeRecommendations;
    private getInteractionBasedRecommendations;
    private getPopularRecommendations;
    private deduplicateAndSort;
    private saveRecommendation;
    getSimilarProducts(productId: string, limit?: number): Promise<RecommendationItem[]>;
}
