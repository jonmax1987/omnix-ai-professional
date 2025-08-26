import { ProductsService } from '../products/products.service';
import { ProductDto as Product } from '../common/dto/product.dto';
export interface ProductSimilarity {
    productId: string;
    product: Product;
    similarity: number;
    reasons: string[];
}
export declare class ProductSimilarityService {
    private readonly productsService;
    constructor(productsService: ProductsService);
    calculateProductSimilarity(product1: Product, product2: Product): number;
    findSimilarProducts(productId: string, limit?: number, minSimilarity?: number): Promise<ProductSimilarity[]>;
    findProductsByCategory(category: string, excludeProductId?: string, limit?: number): Promise<Product[]>;
    findProductsInPriceRange(minPrice: number, maxPrice: number, excludeProductId?: string, limit?: number): Promise<Product[]>;
    private getSimilarityReasons;
    getComplementaryProducts(productId: string): Promise<Product[]>;
}
