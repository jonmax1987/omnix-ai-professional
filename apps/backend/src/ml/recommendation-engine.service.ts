import { Injectable } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { ProductSimilarityService } from './product-similarity.service';
import { DynamoDBService } from '../services/dynamodb.service';
import { ProductDto as Product } from '../common/dto/product.dto';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class RecommendationEngineService {
  private readonly recommendationsTable = 'recommendations';

  constructor(
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    private readonly productSimilarityService: ProductSimilarityService,
    private readonly dynamoDBService: DynamoDBService,
  ) {}

  async generateRecommendations(
    customerId: string,
    context: 'homepage' | 'product_page' | 'checkout' | 'email' = 'homepage',
    limit: number = 10,
  ): Promise<RecommendationResult> {
    try {
      // Get customer profile and purchase history
      const [profile, purchases, interactions] = await Promise.all([
        this.customersService.getCustomerProfile(customerId).catch(() => null),
        this.customersService.getCustomerPurchases(customerId, 50).catch(() => []),
        this.customersService.getCustomerInteractions(customerId, 100).catch(() => []),
      ]);

      let recommendations: RecommendationItem[] = [];
      let algorithmType = 'hybrid';
      let confidence = 0.75;

      // If we have purchase history, use collaborative filtering
      if (purchases && purchases.length > 0) {
        const collaborativeRecs = await this.getCollaborativeRecommendations(
          customerId,
          purchases,
          limit,
        );
        recommendations.push(...collaborativeRecs);
        algorithmType = 'collaborative';
        confidence = 0.85;
      }

      // If we have profile preferences, use content-based filtering
      if (profile && profile.preferences) {
        const contentRecs = await this.getContentBasedRecommendations(
          profile,
          limit,
        );
        recommendations.push(...contentRecs);
        if (recommendations.length === 0) {
          algorithmType = 'content-based';
          confidence = 0.70;
        }
      }

      // If we have recent interactions, boost relevant products
      if (interactions && interactions.length > 0) {
        const interactionRecs = await this.getInteractionBasedRecommendations(
          interactions,
          limit,
        );
        recommendations.push(...interactionRecs);
      }

      // Fallback to popular products if no personalized recommendations
      if (recommendations.length < limit) {
        const popularRecs = await this.getPopularRecommendations(limit - recommendations.length);
        recommendations.push(...popularRecs);
        if (recommendations.length === popularRecs.length) {
          algorithmType = 'popularity';
          confidence = 0.60;
        }
      }

      // Remove duplicates and sort by score
      recommendations = this.deduplicateAndSort(recommendations);
      recommendations = recommendations.slice(0, limit);

      const result: RecommendationResult = {
        customerId,
        recommendations,
        algorithmType,
        confidence,
        context,
        generatedAt: new Date().toISOString(),
      };

      // Save recommendation to database
      await this.saveRecommendation(result);

      return result;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Return popular products as fallback
      const popularRecs = await this.getPopularRecommendations(limit);
      return {
        customerId,
        recommendations: popularRecs,
        algorithmType: 'popularity',
        confidence: 0.50,
        context,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  private async getContentBasedRecommendations(
    profile: any,
    limit: number,
  ): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];
    const productsResponse = await this.productsService.findAll({});
    const products = productsResponse.data;

    // Filter by dietary restrictions if any
    let filteredProducts = products;
    if (profile.preferences.dietaryRestrictions && profile.preferences.dietaryRestrictions.length > 0) {
      // This would need actual dietary metadata on products
      // For now, we'll skip this filtering
    }

    // Filter by budget range
    if (profile.preferences.budgetRange) {
      filteredProducts = filteredProducts.filter(
        p => p.price >= profile.preferences.budgetRange.min && 
             p.price <= profile.preferences.budgetRange.max
      );
    }

    // Prioritize favorite categories
    if (profile.preferences.favoriteCategories && profile.preferences.favoriteCategories.length > 0) {
      const categoryProducts = filteredProducts.filter(
        p => profile.preferences.favoriteCategories.includes(p.category)
      );
      
      categoryProducts.forEach(product => {
        recommendations.push({
          product,
          score: 0.8,
          reason: `From your favorite category: ${product.category}`,
          tags: ['preferred_category', 'personalized'],
        });
      });
    }

    // Add products from preferred brands
    if (profile.preferences.brandPreferences && profile.preferences.brandPreferences.length > 0) {
      const brandProducts = filteredProducts.filter(
        p => profile.preferences.brandPreferences.includes(p.supplier)
      );
      
      brandProducts.forEach(product => {
        if (!recommendations.find(r => r.product.id === product.id)) {
          recommendations.push({
            product,
            score: 0.75,
            reason: `From your preferred brand: ${product.supplier}`,
            tags: ['preferred_brand', 'personalized'],
          });
        }
      });
    }

    return recommendations.slice(0, limit);
  }

  private async getCollaborativeRecommendations(
    customerId: string,
    purchases: any[],
    limit: number,
  ): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];
    const purchasedProductIds = new Set(purchases.map(p => p.productId));

    // For each purchased product, find similar products
    for (const purchase of purchases.slice(0, 5)) {
      try {
        const similarProducts = await this.productSimilarityService.findSimilarProducts(
          purchase.productId,
          5,
          0.4,
        );

        for (const similar of similarProducts) {
          if (!purchasedProductIds.has(similar.productId)) {
            recommendations.push({
              product: similar.product,
              score: similar.similarity * 0.9,
              reason: `Similar to ${similar.product.name} you purchased`,
              tags: ['similar_to_purchased', 'collaborative'],
            });
          }
        }
      } catch (error) {
        console.error(`Error finding similar products for ${purchase.productId}:`, error);
      }
    }

    // Find complementary products
    for (const purchase of purchases.slice(0, 3)) {
      try {
        const complementaryProducts = await this.productSimilarityService.getComplementaryProducts(
          purchase.productId,
        );

        for (const product of complementaryProducts) {
          if (!purchasedProductIds.has(product.id)) {
            recommendations.push({
              product,
              score: 0.7,
              reason: 'Frequently bought together',
              tags: ['complementary', 'cross_sell'],
            });
          }
        }
      } catch (error) {
        console.error(`Error finding complementary products for ${purchase.productId}:`, error);
      }
    }

    return recommendations;
  }

  private async getInteractionBasedRecommendations(
    interactions: any[],
    limit: number,
  ): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];
    
    // Get recently viewed products
    const viewedProducts = interactions
      .filter(i => i.interactionType === 'view')
      .slice(0, 10)
      .map(i => i.productId);

    // Get products added to cart but not purchased
    const cartProducts = interactions
      .filter(i => i.interactionType === 'add_to_cart')
      .slice(0, 5)
      .map(i => i.productId);

    // Find similar products to viewed items
    for (const productId of viewedProducts.slice(0, 3)) {
      try {
        const similarProducts = await this.productSimilarityService.findSimilarProducts(
          productId,
          3,
          0.5,
        );

        for (const similar of similarProducts) {
          recommendations.push({
            product: similar.product,
            score: similar.similarity * 0.6,
            reason: 'Based on your recent views',
            tags: ['recently_viewed', 'session_based'],
          });
        }
      } catch (error) {
        console.error(`Error processing viewed product ${productId}:`, error);
      }
    }

    // Boost products that were in cart
    for (const productId of cartProducts) {
      try {
        const product = await this.productsService.findOne(productId);
        if (product) {
          recommendations.push({
            product,
            score: 0.85,
            reason: 'Previously in your cart',
            tags: ['abandoned_cart', 'high_intent'],
          });
        }
      } catch (error) {
        console.error(`Error processing cart product ${productId}:`, error);
      }
    }

    return recommendations;
  }

  private async getPopularRecommendations(limit: number): Promise<RecommendationItem[]> {
    const productsResponse = await this.productsService.findAll({});
    const products = productsResponse.data;
    
    // Sort by quantity level (as a proxy for popularity)
    const popularProducts = products
      .filter(p => p.quantity > 0)
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, limit);

    return popularProducts.map(product => ({
      product,
      score: 0.5,
      reason: 'Popular product',
      tags: ['trending', 'bestseller'],
    }));
  }

  private deduplicateAndSort(recommendations: RecommendationItem[]): RecommendationItem[] {
    const seen = new Map<string, RecommendationItem>();
    
    for (const rec of recommendations) {
      const existing = seen.get(rec.product.id);
      if (!existing || rec.score > existing.score) {
        seen.set(rec.product.id, rec);
      }
    }

    return Array.from(seen.values()).sort((a, b) => b.score - a.score);
  }

  private async saveRecommendation(result: RecommendationResult): Promise<void> {
    const recommendation = {
      id: uuidv4(),
      customerId: result.customerId,
      recommendations: result.recommendations.map(r => ({
        productId: r.product.id,
        productName: r.product.name,
        score: r.score,
        reason: r.reason,
        tags: r.tags,
      })),
      algorithmType: result.algorithmType,
      confidence: result.confidence,
      context: result.context,
      generatedAt: result.generatedAt,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      status: 'active',
    };

    await this.dynamoDBService.put(this.recommendationsTable, recommendation);
  }

  async getSimilarProducts(productId: string, limit: number = 5): Promise<RecommendationItem[]> {
    const similarProducts = await this.productSimilarityService.findSimilarProducts(
      productId,
      limit,
      0.3,
    );

    return similarProducts.map(similar => ({
      product: similar.product,
      score: similar.similarity,
      reason: similar.reasons.join(', '),
      tags: ['similar_product'],
    }));
  }
}