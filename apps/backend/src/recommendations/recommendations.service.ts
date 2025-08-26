import { Injectable } from '@nestjs/common';
import { MlService } from '../ml/ml.service';

@Injectable()
export class RecommendationsService {
  constructor(private readonly mlService: MlService) {}
  private mockRecommendations = [
    {
      id: 'rec_1',
      type: 'reorder',
      priority: 'high',
      productId: '1',
      productName: 'Premium Coffee Beans',
      productSku: 'COF-001',
      title: 'Urgent Reorder Required',
      description: 'Stock levels are critically low and demand is increasing. Historical data shows this product sells 50-60 units per week.',
      impact: 'High risk of stockout',
      action: 'Order 150 units immediately to maintain service levels',
      estimatedSavings: 2400,
      daysUntilAction: 3,
      confidence: 0.92,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: 'rec_2',
      type: 'optimize',
      priority: 'medium',
      productId: '2',
      productName: 'Organic Flour 25lb',
      productSku: 'FLR-025',
      title: 'Optimize Order Quantity',
      description: 'Current ordering pattern results in excess inventory. Adjust order quantity to reduce carrying costs while maintaining service levels.',
      impact: 'Reduce carrying costs by 15%',
      action: 'Reduce next order from 100 to 75 units',
      estimatedSavings: 450,
      daysUntilAction: 7,
      confidence: 0.78,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
    {
      id: 'rec_3',
      type: 'promotion',
      priority: 'low',
      productId: '3',
      productName: 'Artisan Chocolate',
      productSku: 'CHC-001',
      title: 'Promotional Opportunity',
      description: 'Slow-moving inventory with seasonal demand pattern. Consider promotional pricing to increase velocity.',
      impact: 'Clear excess inventory',
      action: 'Apply 20% discount for next 2 weeks',
      estimatedSavings: 150,
      daysUntilAction: 14,
      confidence: 0.65,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
    {
      id: 'rec_4',
      type: 'reorder',
      priority: 'medium',
      productId: '4',
      productName: 'Gourmet Tea Bags',
      productSku: 'TEA-050',
      title: 'Schedule Reorder',
      description: 'Stock levels approaching reorder point. Based on current consumption rate, order should be placed within the next week.',
      impact: 'Maintain optimal stock',
      action: 'Place order for 80 units by August 18th',
      estimatedSavings: 300,
      daysUntilAction: 8,
      confidence: 0.84,
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    },
    {
      id: 'rec_5',
      type: 'discontinue',
      priority: 'low',
      productId: '5',
      productName: 'Specialty Spice Mix',
      productSku: 'SPI-012',
      title: 'Consider Discontinuation',
      description: 'Very low sales velocity over the past 6 months. Product ties up valuable inventory space and capital.',
      impact: 'Free up inventory space',
      action: 'Discontinue after current stock is depleted',
      daysUntilAction: 30,
      confidence: 0.71,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    },
  ];

  async getRecommendations(query: any = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
    let filteredRecommendations = [...this.mockRecommendations];
    
    // Apply filters
    if (query.type) {
      filteredRecommendations = filteredRecommendations.filter(r => r.type === query.type);
    }
    if (query.priority) {
      filteredRecommendations = filteredRecommendations.filter(r => r.priority === query.priority);
    }

    const total = filteredRecommendations.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredRecommendations.slice(startIndex, endIndex);

    // Calculate meta statistics
    const highPriority = filteredRecommendations.filter(r => r.priority === 'high').length;
    const mediumPriority = filteredRecommendations.filter(r => r.priority === 'medium').length;
    const lowPriority = filteredRecommendations.filter(r => r.priority === 'low').length;
    const totalSavings = filteredRecommendations.reduce((sum, r) => sum + (r.estimatedSavings || 0), 0);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1,
      },
      meta: {
        highPriority,
        mediumPriority,
        lowPriority,
        totalSavings,
      },
    };
  }

  async acceptRecommendation(recommendationId: string) {
    // In a real implementation, this would update the recommendation status
    // and potentially trigger automated actions
    const recommendation = this.mockRecommendations.find(r => r.id === recommendationId);
    
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    // Remove from the list to simulate acceptance
    const index = this.mockRecommendations.findIndex(r => r.id === recommendationId);
    if (index > -1) {
      this.mockRecommendations.splice(index, 1);
    }

    return {
      message: 'Recommendation accepted successfully',
      recommendationId,
      action: recommendation.action,
    };
  }

  async dismissRecommendation(recommendationId: string) {
    // In a real implementation, this would mark the recommendation as dismissed
    const recommendation = this.mockRecommendations.find(r => r.id === recommendationId);
    
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    // Remove from the list to simulate dismissal
    const index = this.mockRecommendations.findIndex(r => r.id === recommendationId);
    if (index > -1) {
      this.mockRecommendations.splice(index, 1);
    }

    return {
      message: 'Recommendation dismissed',
      recommendationId,
    };
  }

  // Customer product recommendation methods
  async getCustomerRecommendations(
    customerId: string,
    context: 'homepage' | 'product_page' | 'checkout' | 'email' = 'homepage',
    limit: number = 10,
  ) {
    return this.mlService.getPersonalizedRecommendations({
      customerId,
      context,
      limit,
    });
  }

  async getSimilarProducts(productId: string, limit: number = 5) {
    return this.mlService.getSimilarProducts(productId, limit);
  }

  async getTrendingProducts(limit: number = 10) {
    return this.mlService.getTrendingProducts(limit);
  }

  async getSeasonalRecommendations(season: string = 'current', limit: number = 10) {
    const currentSeason = season === 'current' ? this.getCurrentSeason() : season;
    return this.mlService.getSeasonalRecommendations(currentSeason, limit);
  }

  async getComplementaryProducts(productIds: string[], limit: number = 5) {
    return this.mlService.getComplementaryProducts(productIds, limit);
  }

  async trackRecommendationFeedback(
    customerId: string,
    productId: string,
    action: 'click' | 'purchase' | 'dismiss',
  ) {
    return this.mlService.trackRecommendationFeedback(customerId, productId, action);
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
}