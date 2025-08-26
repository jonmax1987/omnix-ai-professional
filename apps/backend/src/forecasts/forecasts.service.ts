import { Injectable } from '@nestjs/common';

@Injectable()
export class ForecastsService {
  private generateForecastData(days: number = 30) {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Generate realistic forecast data with some variation
      const baseValue = 50 + Math.sin(i * 0.2) * 20;
      const seasonality = Math.sin(i * 0.7) * 10;
      const randomVariation = (Math.random() - 0.5) * 10;
      
      data.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.max(0, Math.round(baseValue + seasonality + randomVariation)),
        actual: i < 7 ? Math.max(0, Math.round(baseValue + seasonality + (Math.random() - 0.5) * 15)) : undefined,
        confidence: Math.min(100, Math.max(60, 85 + (Math.random() - 0.5) * 20)) / 100,
      });
    }
    
    return data;
  }

  async getMetrics() {
    return {
      totalForecasts: 12,
      averageAccuracy: 87.3,
      upcomingReorders: 5,
      potentialSavings: 12450,
      criticalItems: 3,
    };
  }

  async getForecasts(query: any = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 5;
    const days = parseInt(query.days) || 30;
    
    // Mock forecast data for different products
    const mockForecasts = [
      {
        productId: '1',
        productName: 'Premium Coffee Beans',
        productSku: 'COF-001',
        forecastDays: days,
        data: this.generateForecastData(days),
        trend: 'increasing' as const,
        seasonality: 'high' as const,
        accuracy: 89.2,
        nextOrderDate: '2025-08-20',
        recommendedQuantity: 150,
      },
      {
        productId: '2',
        productName: 'Organic Flour 25lb',
        productSku: 'FLR-025',
        forecastDays: days,
        data: this.generateForecastData(days),
        trend: 'stable' as const,
        seasonality: 'low' as const,
        accuracy: 92.5,
        nextOrderDate: '2025-08-25',
        recommendedQuantity: 75,
      },
      {
        productId: '3',
        productName: 'Artisan Chocolate',
        productSku: 'CHC-001',
        forecastDays: days,
        data: this.generateForecastData(days),
        trend: 'decreasing' as const,
        seasonality: 'medium' as const,
        accuracy: 78.3,
        nextOrderDate: '2025-09-01',
        recommendedQuantity: 25,
      },
    ];

    // Apply filters
    let filteredForecasts = mockForecasts;
    if (query.trend) {
      filteredForecasts = filteredForecasts.filter(f => f.trend === query.trend);
    }

    const total = filteredForecasts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredForecasts.slice(startIndex, endIndex);

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
        totalForecasts: total,
        averageAccuracy: 86.7,
        upcomingReorders: 5,
        potentialSavings: 12450,
        criticalItems: 3,
      },
    };
  }

  async getForecast(productId: string, days: number = 30) {
    // Mock data for specific product forecast
    return {
      productId,
      productName: 'Premium Coffee Beans',
      productSku: 'COF-001',
      forecastDays: days,
      data: this.generateForecastData(days),
      trend: 'increasing' as const,
      seasonality: 'high' as const,
      accuracy: 89.2,
      nextOrderDate: '2025-08-20',
      recommendedQuantity: 150,
    };
  }
}