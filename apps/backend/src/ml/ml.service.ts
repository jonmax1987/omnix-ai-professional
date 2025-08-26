import { Injectable } from '@nestjs/common';
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

@Injectable()
export class MlService {
  constructor(
    private readonly recommendationEngine: RecommendationEngineService,
    private readonly productSimilarity: ProductSimilarityService,
    private readonly customersService: CustomersService,
  ) {}

  async getPersonalizedRecommendations(
    request: RecommendationRequest,
  ): Promise<RecommendationResponse> {
    const limit = request.limit || 10;

    // Generate personalized recommendations
    const result = await this.recommendationEngine.generateRecommendations(
      request.customerId,
      request.context,
      limit,
    );

    // Track the recommendation generation as an interaction
    if (request.context !== 'email') {
      await this.customersService.trackProductInteraction(request.customerId, {
        productId: request.productId || 'homepage',
        interactionType: 'view',
        metadata: {
          context: request.context,
          recommendationsShown: result.recommendations.length,
        },
      }).catch(err => console.error('Failed to track recommendation view:', err));
    }

    return {
      recommendations: result.recommendations,
      reason: this.getRecommendationReason(result.algorithmType),
      algorithm: result.algorithmType,
      confidence: result.confidence,
      generatedAt: result.generatedAt,
    };
  }

  async getSimilarProducts(
    productId: string,
    limit: number = 5,
  ): Promise<RecommendationResponse> {
    const recommendations = await this.recommendationEngine.getSimilarProducts(productId, limit);

    return {
      recommendations,
      reason: 'Products similar to what you are viewing',
      algorithm: 'content-based',
      confidence: 0.8,
      generatedAt: new Date().toISOString(),
    };
  }

  async getTrendingProducts(limit: number = 10): Promise<any[]> {
    // This would analyze recent interactions across all customers
    // For now, return popular products
    const popular = await this.recommendationEngine['getPopularRecommendations'](limit);
    return popular;
  }

  async getSeasonalRecommendations(season: string, limit: number = 10): Promise<any[]> {
    // This would return season-specific products
    // For now, return category-based recommendations
    const seasonalCategories: Record<string, string[]> = {
      summer: ['Beverages', 'Fruits', 'Ice Cream'],
      winter: ['Soups', 'Hot Beverages', 'Comfort Food'],
      spring: ['Fresh Produce', 'Salads', 'Light Meals'],
      autumn: ['Baking', 'Warm Beverages', 'Root Vegetables'],
    };

    const categories = seasonalCategories[season.toLowerCase()] || [];
    const products: any[] = [];

    for (const category of categories) {
      const categoryProducts = await this.productSimilarity.findProductsByCategory(
        category,
        undefined,
        Math.ceil(limit / categories.length),
      );
      products.push(...categoryProducts);
    }

    return products.slice(0, limit).map(product => ({
      product,
      score: 0.7,
      reason: `Perfect for ${season}`,
      tags: ['seasonal', season.toLowerCase()],
    }));
  }

  async getComplementaryProducts(
    productIds: string[],
    limit: number = 5,
  ): Promise<any[]> {
    const complementaryProducts: any[] = [];
    const seen = new Set<string>();

    for (const productId of productIds.slice(0, 3)) {
      const products = await this.productSimilarity.getComplementaryProducts(productId);
      
      for (const product of products) {
        if (!seen.has(product.id)) {
          seen.add(product.id);
          complementaryProducts.push({
            product,
            score: 0.65,
            reason: 'Frequently bought together',
            tags: ['complementary', 'bundle'],
          });
        }
      }
    }

    return complementaryProducts.slice(0, limit);
  }

  async trackRecommendationFeedback(
    customerId: string,
    productId: string,
    action: 'click' | 'purchase' | 'dismiss',
  ): Promise<void> {
    // Track user feedback on recommendations
    const interactionType = action === 'purchase' ? 'add_to_cart' : 
                          action === 'click' ? 'view' : 'remove_from_cart';

    await this.customersService.trackProductInteraction(customerId, {
      productId,
      interactionType,
      metadata: {
        source: 'recommendation',
        action,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private getRecommendationReason(algorithmType: string): string {
    const reasons: Record<string, string> = {
      'collaborative': 'Based on your purchase history and preferences',
      'content-based': 'Based on your preferences and interests',
      'hybrid': 'Personalized for you',
      'popularity': 'Popular products in our store',
      'session-based': 'Based on your current browsing session',
    };

    return reasons[algorithmType] || 'Recommended for you';
  }
}