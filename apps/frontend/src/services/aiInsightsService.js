/**
 * OMNIX AI - AI Insights Service
 * Integration with backend's AWS Bedrock AI analytics
 */

import httpClient from './httpClient';

class AIInsightsService {
  constructor() {
    this.baseEndpoint = '/ai/insights';
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute
  }

  /**
   * Get real-time AI insights from AWS Bedrock
   */
  async getRealtimeInsights(params = {}) {
    const cacheKey = `realtime-insights-${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await httpClient.get(`${this.baseEndpoint}/realtime`, {
        params: {
          limit: params.limit || 20,
          priority: params.priority || 'all',
          types: params.types ? params.types.join(',') : 'all',
          timeRange: params.timeRange || '24h'
        }
      });

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      // Provide fallback data for development
      return { 
        insights: this.getFallbackInsights(params), 
        error: error.message,
        fallback: true 
      };
    }
  }

  /**
   * Get customer segmentation insights
   */
  async getSegmentationInsights(customerId = null) {
    const cacheKey = `segmentation-${customerId || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = customerId 
        ? `${this.baseEndpoint}/segmentation/${customerId}`
        : `${this.baseEndpoint}/segmentation`;
      
      const response = await httpClient.get(endpoint);
      
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch segmentation insights:', error);
      return { segments: [], insights: [], error: error.message };
    }
  }

  /**
   * Get consumption pattern predictions
   */
  async getConsumptionPredictions(params = {}) {
    const cacheKey = `consumption-predictions-${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await httpClient.get(`${this.baseEndpoint}/consumption-predictions`, {
        params: {
          customerId: params.customerId,
          productId: params.productId,
          timeHorizon: params.timeHorizon || '30d',
          includeConfidence: true,
          includeFactors: true
        }
      });

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch consumption predictions:', error);
      return { 
        predictions: this.getFallbackConsumptionPredictions(params), 
        error: error.message,
        fallback: true 
      };
    }
  }

  /**
   * Get churn risk analysis
   */
  async getChurnRiskAnalysis(customerId = null) {
    const cacheKey = `churn-risk-${customerId || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = customerId 
        ? `${this.baseEndpoint}/churn-risk/${customerId}`
        : `${this.baseEndpoint}/churn-risk`;
      
      const response = await httpClient.get(endpoint, {
        params: {
          includeFactors: true,
          includeInterventions: true,
          riskThreshold: 0.7
        }
      });

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch churn risk analysis:', error);
      return { riskAnalysis: [], error: error.message };
    }
  }

  /**
   * Get pricing optimization recommendations
   */
  async getPricingOptimization(params = {}) {
    const cacheKey = `pricing-optimization-${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await httpClient.get(`${this.baseEndpoint}/pricing-optimization`, {
        params: {
          productId: params.productId,
          categoryId: params.categoryId,
          timeRange: params.timeRange || '30d',
          includeCompetitorAnalysis: true,
          includeMarginImpact: true
        }
      });

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pricing optimization:', error);
      return { optimizations: [], error: error.message };
    }
  }

  /**
   * Get inventory demand forecasting
   */
  async getDemandForecasting(params = {}) {
    const cacheKey = `demand-forecasting-${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await httpClient.get(`${this.baseEndpoint}/demand-forecasting`, {
        params: {
          productId: params.productId,
          categoryId: params.categoryId,
          forecastPeriod: params.forecastPeriod || 60,
          includeSeasonality: true,
          includeExternalFactors: true,
          confidenceLevel: 0.95
        }
      });

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch demand forecasting:', error);
      return { forecasts: [], error: error.message };
    }
  }

  /**
   * Get personalization recommendations for customer
   */
  async getPersonalizationRecommendations(customerId, context = {}) {
    const cacheKey = `personalization-${customerId}-${JSON.stringify(context)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await httpClient.post(`${this.baseEndpoint}/personalization`, {
        customerId,
        context: {
          currentBehavior: context.currentBehavior || {},
          historicalData: context.historicalData || {},
          sessionContext: context.sessionContext || {},
          preferences: context.preferences || {}
        },
        options: {
          includeReasons: true,
          includeConfidence: true,
          maxRecommendations: context.maxRecommendations || 10
        }
      });

      this.setCache(cacheKey, response.data, 30000); // 30 seconds for personalization
      return response.data;
    } catch (error) {
      console.error('Failed to fetch personalization recommendations:', error);
      return { 
        recommendations: this.getFallbackRecommendations(customerId), 
        error: error.message,
        fallback: true 
      };
    }
  }

  /**
   * Submit AI feedback for model improvement
   */
  async submitFeedback(feedback) {
    try {
      const response = await httpClient.post(`${this.baseEndpoint}/feedback`, {
        predictionId: feedback.predictionId,
        actualOutcome: feedback.actualOutcome,
        userFeedback: feedback.userFeedback,
        context: feedback.context || {},
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Failed to submit AI feedback:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get AI model performance metrics
   */
  async getModelPerformance(params = {}) {
    const cacheKey = `model-performance-${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await httpClient.get(`${this.baseEndpoint}/model-performance`, {
        params: {
          modelType: params.modelType || 'all',
          timeRange: params.timeRange || '7d',
          includeAccuracyTrends: true,
          includeConfidenceDistribution: true
        }
      });

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch model performance:', error);
      return { performance: {}, error: error.message };
    }
  }

  /**
   * Request A/B test recommendations
   */
  async getABTestRecommendations(params = {}) {
    const cacheKey = `ab-test-recommendations-${JSON.stringify(params)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await httpClient.get(`${this.baseEndpoint}/ab-test-recommendations`, {
        params: {
          feature: params.feature,
          targetMetric: params.targetMetric || 'revenue',
          includeDesignSuggestions: true,
          includeStatisticalPower: true
        }
      });

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch A/B test recommendations:', error);
      return { recommendations: [], error: error.message };
    }
  }

  /**
   * Get business intelligence summary
   */
  async getBusinessIntelligenceSummary(timeRange = '24h') {
    const cacheKey = `bi-summary-${timeRange}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await httpClient.get(`${this.baseEndpoint}/business-intelligence`, {
        params: {
          timeRange,
          includeKeyInsights: true,
          includeActionItems: true,
          includePerformanceMetrics: true,
          includePredictions: true
        }
      });

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch business intelligence summary:', error);
      return { summary: {}, insights: [], error: error.message };
    }
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data, timeout = null) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Auto-cleanup after timeout
    setTimeout(() => {
      this.cache.delete(key);
    }, timeout || this.cacheTimeout);
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    };
  }

  /**
   * Fallback methods for when backend is unavailable
   */
  getFallbackInsights(params) {
    const types = params.types || ['savings', 'behavior', 'health', 'efficiency'];
    const insights = [];

    if (types.includes('savings')) {
      insights.push({
        id: 'fallback_savings_1',
        type: 'savings',
        value: '$127',
        insight: 'AI recommendations saved $127 this month (estimated)',
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        dailySavings: '12.50',
        totalSavings: '$127',
        fallback: true
      });
    }

    if (types.includes('behavior')) {
      insights.push({
        id: 'fallback_behavior_1',
        type: 'behavior',
        purchaseCount: 23,
        insight: 'Customer shows consistent shopping patterns',
        confidence: 0.80,
        timestamp: new Date().toISOString(),
        orderCount: '8',
        fallback: true
      });
    }

    if (types.includes('health')) {
      insights.push({
        id: 'fallback_health_1',
        type: 'health',
        healthScore: 8.2,
        insight: 'Maintaining healthy shopping choices',
        trend: 'stable',
        confidence: 0.75,
        timestamp: new Date().toISOString(),
        fallback: true
      });
    }

    if (types.includes('efficiency')) {
      insights.push({
        id: 'fallback_efficiency_1',
        type: 'efficiency',
        timeSaved: '3.2h',
        insight: 'Shopping patterns show good efficiency',
        confidence: 0.70,
        timestamp: new Date().toISOString(),
        fallback: true
      });
    }

    return insights.slice(0, params.limit || 10);
  }

  getFallbackConsumptionPredictions(params) {
    return [
      {
        productId: 'fallback_prod_001',
        productName: 'Organic Bananas',
        predictedConsumptionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.85,
        reason: 'Based on typical consumption patterns',
        emoji: '🍌',
        price: 3.99,
        personalizedScore: 0.80,
        fallback: true
      },
      {
        productId: 'fallback_prod_002',
        productName: 'Almond Milk',
        predictedConsumptionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.78,
        reason: 'Regular purchase prediction',
        emoji: '🥛',
        price: 4.49,
        personalizedScore: 0.75,
        fallback: true
      },
      {
        productId: 'fallback_prod_003',
        productName: 'Greek Yogurt',
        predictedConsumptionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.82,
        reason: 'Weekly consumption pattern detected',
        emoji: '🥣',
        price: 5.99,
        personalizedScore: 0.85,
        fallback: true
      }
    ];
  }

  getFallbackRecommendations(customerId) {
    return [
      {
        productId: 'fallback_rec_001',
        productName: 'Organic Bananas',
        confidence: 0.88,
        reason: 'Popular healthy choice',
        personalizedScore: 0.82,
        emoji: '🍌',
        price: 3.99,
        fallback: true
      },
      {
        productId: 'fallback_rec_002',
        productName: 'Almond Milk',
        confidence: 0.84,
        reason: 'Matches dietary preferences',
        personalizedScore: 0.79,
        emoji: '🥛',
        price: 4.49,
        fallback: true
      },
      {
        productId: 'fallback_rec_003',
        productName: 'Greek Yogurt',
        confidence: 0.91,
        reason: 'High protein preference detected',
        personalizedScore: 0.89,
        emoji: '🥣',
        price: 5.99,
        fallback: true
      },
      {
        productId: 'fallback_rec_004',
        productName: 'Whole Grain Bread',
        confidence: 0.76,
        reason: 'Healthy carb choice',
        personalizedScore: 0.73,
        emoji: '🍞',
        price: 3.79,
        fallback: true
      },
      {
        productId: 'fallback_rec_005',
        productName: 'Fresh Spinach',
        confidence: 0.83,
        reason: 'Leafy green preference',
        personalizedScore: 0.81,
        emoji: '🥬',
        price: 2.99,
        fallback: true
      },
      {
        productId: 'fallback_rec_006',
        productName: 'Olive Oil',
        confidence: 0.87,
        reason: 'Mediterranean diet preference',
        personalizedScore: 0.85,
        emoji: '🫒',
        price: 8.99,
        fallback: true
      }
    ];
  }
}

export default new AIInsightsService();