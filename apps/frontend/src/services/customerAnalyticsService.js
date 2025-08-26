// Customer Analytics Service
// Implementation of API-003: Customer analytics service
import httpService from './httpClient';
import { ApiError } from './httpClient';

/**
 * Customer Analytics Service
 * Comprehensive service layer for customer data and analytics API calls
 */
class CustomerAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.realTimeSubscriptions = new Map();
  }

  /**
   * Get dashboard summary with key metrics
   * @param {Object} params - Query parameters
   * @param {string} params.timeRange - Time range (7d, 30d, 90d, 1y)
   * @param {boolean} params.useCache - Whether to use cached data
   * @returns {Promise<Object>} Dashboard metrics
   */
  async getDashboardSummary(params = {}) {
    const { timeRange = '7d', useCache = true } = params;
    const cacheKey = `dashboard_summary_${timeRange}`;
    
    if (useCache && this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    try {
      const response = await httpService.get('/dashboard/summary', {
        timeRange,
        includeComparisons: true,
        includeTrends: true
      });

      // Enhance response with calculated metrics
      const enhancedData = this.enhanceDashboardData(response);
      
      this.setCachedData(cacheKey, enhancedData);
      return enhancedData;
    } catch (error) {
      throw this.handleAnalyticsError('Dashboard summary fetch failed', error);
    }
  }

  /**
   * Get revenue analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Revenue analytics data
   */
  async getRevenueAnalytics(params = {}) {
    const {
      timeRange = '30d',
      groupBy = 'day',
      includeForecasting = true,
      includeTrends = true,
      compareWith = null
    } = params;

    try {
      const [currentData, comparisonData, forecastData] = await Promise.allSettled([
        httpService.get('/analytics/revenue', {
          timeRange,
          groupBy,
          includeTrends
        }),
        compareWith ? httpService.get('/analytics/revenue', {
          timeRange: compareWith,
          groupBy,
          includeTrends
        }) : Promise.resolve(null),
        includeForecasting ? httpService.get('/analytics/revenue/forecast', {
          timeRange: '30d',
          includePredictions: true
        }) : Promise.resolve(null)
      ]);

      const result = {
        current: currentData.status === 'fulfilled' ? currentData.value : null,
        comparison: comparisonData.status === 'fulfilled' ? comparisonData.value : null,
        forecast: forecastData.status === 'fulfilled' ? forecastData.value : null,
        insights: this.generateRevenueInsights(currentData.value, comparisonData.value)
      };

      return result;
    } catch (error) {
      throw this.handleAnalyticsError('Revenue analytics fetch failed', error);
    }
  }

  /**
   * Get customer analytics and segmentation data
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Customer analytics data
   */
  async getCustomerAnalytics(params = {}) {
    const {
      timeRange = '30d',
      segmentBy = 'behavior',
      includeLifetimeValue = true,
      includeChurnAnalysis = true,
      includeSegmentTrends = true
    } = params;

    const cacheKey = `customer_analytics_${timeRange}_${segmentBy}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    try {
      const [segmentationData, ltv, churnData, trendsData] = await Promise.allSettled([
        httpService.get('/analytics/customers/segmentation', {
          timeRange,
          segmentBy,
          includeMetrics: true
        }),
        includeLifetimeValue ? httpService.get('/analytics/customers/lifetime-value', {
          timeRange,
          includeProjections: true
        }) : Promise.resolve(null),
        includeChurnAnalysis ? httpService.get('/analytics/customers/churn-analysis', {
          timeRange,
          includeRiskFactors: true
        }) : Promise.resolve(null),
        includeSegmentTrends ? httpService.get('/analytics/customers/segment-trends', {
          timeRange: '90d',
          granularity: 'week'
        }) : Promise.resolve(null)
      ]);

      const result = {
        segmentation: segmentationData.status === 'fulfilled' ? 
          this.processSegmentationData(segmentationData.value) : null,
        lifetimeValue: ltv.status === 'fulfilled' ? ltv.value : null,
        churnAnalysis: churnData.status === 'fulfilled' ? 
          this.processChurnData(churnData.value) : null,
        trends: trendsData.status === 'fulfilled' ? trendsData.value : null,
        insights: this.generateCustomerInsights(segmentationData.value, churnData.value)
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      throw this.handleAnalyticsError('Customer analytics fetch failed', error);
    }
  }

  /**
   * Get inventory analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Inventory analytics data
   */
  async getInventoryAnalytics(params = {}) {
    const {
      timeRange = '30d',
      includeForecasting = true,
      includeOptimization = true,
      includeAlerts = true,
      groupBy = 'category'
    } = params;

    try {
      const [inventoryData, forecastData, optimizationData, alertsData] = await Promise.allSettled([
        httpService.get('/analytics/inventory', {
          timeRange,
          groupBy,
          includeMetrics: true,
          includeTrends: true
        }),
        includeForecasting ? httpService.get('/analytics/inventory/forecasting', {
          timeRange: '60d',
          includeReorderPoints: true,
          includeSeasonality: true
        }) : Promise.resolve(null),
        includeOptimization ? httpService.get('/analytics/inventory/optimization', {
          includeRecommendations: true,
          includeCostAnalysis: true
        }) : Promise.resolve(null),
        includeAlerts ? httpService.get('/analytics/inventory/alerts', {
          severity: ['critical', 'warning'],
          includeHistorical: true
        }) : Promise.resolve(null)
      ]);

      const result = {
        metrics: inventoryData.status === 'fulfilled' ? inventoryData.value : null,
        forecasting: forecastData.status === 'fulfilled' ? forecastData.value : null,
        optimization: optimizationData.status === 'fulfilled' ? optimizationData.value : null,
        alerts: alertsData.status === 'fulfilled' ? alertsData.value : null,
        insights: this.generateInventoryInsights(inventoryData.value, forecastData.value)
      };

      return result;
    } catch (error) {
      throw this.handleAnalyticsError('Inventory analytics fetch failed', error);
    }
  }

  /**
   * Get order analytics and patterns
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Order analytics data
   */
  async getOrderAnalytics(params = {}) {
    const {
      timeRange = '30d',
      includePatterns = true,
      includeSeasonality = true,
      groupBy = 'day'
    } = params;

    try {
      const [orderMetrics, patternsData, seasonalityData] = await Promise.allSettled([
        httpService.get('/analytics/orders', {
          timeRange,
          groupBy,
          includeMetrics: true,
          includeComparisons: true
        }),
        includePatterns ? httpService.get('/analytics/orders/patterns', {
          timeRange,
          includeFrequency: true,
          includeTiming: true
        }) : Promise.resolve(null),
        includeSeasonality ? httpService.get('/analytics/orders/seasonality', {
          timeRange: '1y',
          includeProjections: true
        }) : Promise.resolve(null)
      ]);

      const result = {
        metrics: orderMetrics.status === 'fulfilled' ? orderMetrics.value : null,
        patterns: patternsData.status === 'fulfilled' ? patternsData.value : null,
        seasonality: seasonalityData.status === 'fulfilled' ? seasonalityData.value : null,
        insights: this.generateOrderInsights(orderMetrics.value, patternsData.value)
      };

      return result;
    } catch (error) {
      throw this.handleAnalyticsError('Order analytics fetch failed', error);
    }
  }

  /**
   * Get product performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Product analytics data
   */
  async getProductAnalytics(params = {}) {
    const {
      timeRange = '30d',
      includeRecommendations = true,
      includePerformance = true,
      includeCorrelations = true,
      limit = 50
    } = params;

    try {
      const [productData, recommendations, performance, correlations] = await Promise.allSettled([
        httpService.get('/analytics/products', {
          timeRange,
          includeMetrics: true,
          includeTrends: true,
          limit
        }),
        includeRecommendations ? httpService.get('/analytics/products/recommendations', {
          timeRange,
          includeReasoning: true
        }) : Promise.resolve(null),
        includePerformance ? httpService.get('/analytics/products/performance', {
          timeRange,
          includeMargins: true,
          includeTurnover: true
        }) : Promise.resolve(null),
        includeCorrelations ? httpService.get('/analytics/products/correlations', {
          timeRange,
          includeBasketAnalysis: true
        }) : Promise.resolve(null)
      ]);

      const result = {
        products: productData.status === 'fulfilled' ? productData.value : null,
        recommendations: recommendations.status === 'fulfilled' ? recommendations.value : null,
        performance: performance.status === 'fulfilled' ? performance.value : null,
        correlations: correlations.status === 'fulfilled' ? correlations.value : null,
        insights: this.generateProductInsights(productData.value, performance.value)
      };

      return result;
    } catch (error) {
      throw this.handleAnalyticsError('Product analytics fetch failed', error);
    }
  }

  /**
   * Get predictive analytics and forecasts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Predictive analytics data
   */
  async getPredictiveAnalytics(params = {}) {
    const {
      type = 'all', // 'demand', 'revenue', 'churn', 'inventory', 'all'
      timeHorizon = '30d',
      confidenceLevel = 0.8,
      includeScenarios = true
    } = params;

    try {
      const endpoints = type === 'all' ? [
        '/analytics/predictions/demand',
        '/analytics/predictions/revenue',
        '/analytics/predictions/churn',
        '/analytics/predictions/inventory'
      ] : [`/analytics/predictions/${type}`];

      const predictions = await Promise.allSettled(
        endpoints.map(endpoint => 
          httpService.get(endpoint, {
            timeHorizon,
            confidenceLevel,
            includeScenarios,
            includeFactors: true
          })
        )
      );

      const result = {
        predictions: predictions.reduce((acc, prediction, index) => {
          if (prediction.status === 'fulfilled') {
            const predictionType = endpoints[index].split('/').pop();
            acc[predictionType] = prediction.value;
          }
          return acc;
        }, {}),
        insights: this.generatePredictiveInsights(predictions),
        confidence: this.calculateOverallConfidence(predictions)
      };

      return result;
    } catch (error) {
      throw this.handleAnalyticsError('Predictive analytics fetch failed', error);
    }
  }

  /**
   * Get real-time analytics data
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Real-time data
   */
  async getRealTimeAnalytics(params = {}) {
    const {
      metrics = ['orders', 'revenue', 'inventory', 'alerts'],
      includeComparisons = true
    } = params;

    try {
      const realTimeData = await httpService.get('/analytics/realtime', {
        metrics,
        includeComparisons,
        includeMetadata: true
      });

      return {
        ...realTimeData,
        timestamp: Date.now(),
        insights: this.generateRealTimeInsights(realTimeData)
      };
    } catch (error) {
      throw this.handleAnalyticsError('Real-time analytics fetch failed', error);
    }
  }

  /**
   * Generate custom analytics report
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Generated report
   */
  async generateCustomReport(params = {}) {
    const {
      name,
      metrics,
      timeRange,
      filters = {},
      format = 'json',
      includeCharts = true,
      includeInsights = true
    } = params;

    try {
      const report = await httpService.post('/analytics/reports/generate', {
        name,
        metrics,
        timeRange,
        filters,
        format,
        options: {
          includeCharts,
          includeInsights,
          includeRawData: format === 'csv' || format === 'xlsx'
        }
      });

      return {
        ...report,
        generated: Date.now(),
        insights: includeInsights ? this.generateReportInsights(report.data) : null
      };
    } catch (error) {
      throw this.handleAnalyticsError('Custom report generation failed', error);
    }
  }

  /**
   * Export analytics data
   * @param {Object} params - Export parameters
   * @returns {Promise<Object>} Export response
   */
  async exportAnalyticsData(params = {}) {
    const {
      type,
      timeRange,
      format = 'csv',
      includeMetadata = true,
      filename = null
    } = params;

    try {
      return await httpService.get(`/analytics/export/${type}`, {
        timeRange,
        format,
        includeMetadata,
        filename: filename || `${type}_analytics_${Date.now()}.${format}`
      });
    } catch (error) {
      throw this.handleAnalyticsError('Analytics data export failed', error);
    }
  }

  // Data processing and enhancement methods

  /**
   * Enhance dashboard data with calculated metrics
   * @param {Object} data - Raw dashboard data
   * @returns {Object} Enhanced dashboard data
   */
  enhanceDashboardData(data) {
    if (!data) return data;

    return {
      ...data,
      insights: {
        topMetric: this.identifyTopMetric(data),
        trends: this.analyzeTrends(data),
        alerts: this.generateDashboardAlerts(data),
        recommendations: this.generateDashboardRecommendations(data)
      },
      lastUpdated: Date.now()
    };
  }

  /**
   * Process customer segmentation data
   * @param {Object} data - Raw segmentation data
   * @returns {Object} Processed segmentation data
   */
  processSegmentationData(data) {
    if (!data || !data.segments) return data;

    const processedSegments = data.segments.map(segment => ({
      ...segment,
      healthScore: this.calculateSegmentHealth(segment),
      growthPotential: this.calculateGrowthPotential(segment),
      recommendations: this.generateSegmentRecommendations(segment)
    }));

    return {
      ...data,
      segments: processedSegments,
      summary: {
        totalSegments: processedSegments.length,
        healthySegments: processedSegments.filter(s => s.healthScore > 0.7).length,
        highGrowthSegments: processedSegments.filter(s => s.growthPotential > 0.8).length
      }
    };
  }

  /**
   * Process churn analysis data
   * @param {Object} data - Raw churn data
   * @returns {Object} Processed churn data
   */
  processChurnData(data) {
    if (!data) return data;

    return {
      ...data,
      riskLevels: this.categorizeChurnRisk(data),
      predictions: this.enhanceChurnPredictions(data.predictions),
      actionableInsights: this.generateChurnActionItems(data)
    };
  }

  // Insight generation methods

  /**
   * Generate revenue insights
   * @param {Object} current - Current revenue data
   * @param {Object} comparison - Comparison revenue data
   * @returns {Array} Revenue insights
   */
  generateRevenueInsights(current, comparison) {
    const insights = [];
    
    if (current && comparison) {
      const growth = ((current.total - comparison.total) / comparison.total) * 100;
      insights.push({
        type: growth > 0 ? 'positive' : 'negative',
        metric: 'revenue_growth',
        value: Math.abs(growth).toFixed(1),
        description: `Revenue ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}%`
      });
    }

    if (current?.trends) {
      const trend = this.analyzeTrendDirection(current.trends);
      insights.push({
        type: 'trend',
        metric: 'revenue_trend',
        value: trend,
        description: `Revenue trend is ${trend}`
      });
    }

    return insights;
  }

  /**
   * Generate customer insights
   * @param {Object} segmentation - Segmentation data
   * @param {Object} churn - Churn data
   * @returns {Array} Customer insights
   */
  generateCustomerInsights(segmentation, churn) {
    const insights = [];

    if (segmentation?.segments) {
      const topSegment = segmentation.segments.reduce((max, segment) => 
        segment.revenue > max.revenue ? segment : max, segmentation.segments[0]);
      
      insights.push({
        type: 'highlight',
        metric: 'top_segment',
        value: topSegment.name,
        description: `${topSegment.name} segment generates the highest revenue`
      });
    }

    if (churn?.overallRate) {
      const riskLevel = churn.overallRate > 0.1 ? 'high' : churn.overallRate > 0.05 ? 'medium' : 'low';
      insights.push({
        type: riskLevel === 'high' ? 'warning' : 'info',
        metric: 'churn_risk',
        value: `${(churn.overallRate * 100).toFixed(1)}%`,
        description: `Customer churn risk is ${riskLevel}`
      });
    }

    return insights;
  }

  /**
   * Generate inventory insights
   * @param {Object} inventory - Inventory data
   * @param {Object} forecasting - Forecasting data
   * @returns {Array} Inventory insights
   */
  generateInventoryInsights(inventory, forecasting) {
    const insights = [];

    if (inventory?.lowStockItems > 0) {
      insights.push({
        type: 'warning',
        metric: 'low_stock',
        value: inventory.lowStockItems,
        description: `${inventory.lowStockItems} items are running low on stock`
      });
    }

    if (forecasting?.predictions) {
      const stockoutRisk = forecasting.predictions.filter(p => p.riskLevel === 'high').length;
      if (stockoutRisk > 0) {
        insights.push({
          type: 'alert',
          metric: 'stockout_risk',
          value: stockoutRisk,
          description: `${stockoutRisk} items at risk of stocking out soon`
        });
      }
    }

    return insights;
  }

  // Utility methods

  /**
   * Handle analytics-specific errors
   * @param {string} message - Error message
   * @param {Error} originalError - Original error
   * @returns {ApiError} Formatted error
   */
  handleAnalyticsError(message, originalError) {
    if (originalError instanceof ApiError) {
      return new ApiError(
        `${message}: ${originalError.message}`,
        originalError.status,
        originalError.code,
        originalError.data
      );
    }
    
    return new ApiError(
      message,
      500,
      'ANALYTICS_ERROR',
      { originalError: originalError.message }
    );
  }

  /**
   * Get cached data if available and not expired
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean old cache entries periodically
    if (this.cache.size > 100) {
      const oldEntries = Array.from(this.cache.entries())
        .filter(([_, value]) => Date.now() - value.timestamp > this.cacheTimeout);
      
      oldEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Clear cache
   * @param {string} pattern - Pattern to match keys (optional)
   */
  clearCache(pattern = null) {
    if (pattern) {
      const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const entries = Array.from(this.cache.entries());
    const validEntries = entries.filter(([_, value]) => 
      Date.now() - value.timestamp < this.cacheTimeout);

    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
      cacheHitRate: validEntries.length / entries.length || 0
    };
  }

  // Helper methods for data analysis

  identifyTopMetric(data) {
    // Implementation for identifying the most significant metric
    return 'revenue'; // Simplified
  }

  analyzeTrends(data) {
    // Implementation for trend analysis
    return []; // Simplified
  }

  generateDashboardAlerts(data) {
    // Implementation for generating dashboard alerts
    return []; // Simplified
  }

  generateDashboardRecommendations(data) {
    // Implementation for generating recommendations
    return []; // Simplified
  }

  calculateSegmentHealth(segment) {
    // Implementation for calculating segment health score
    return 0.8; // Simplified
  }

  calculateGrowthPotential(segment) {
    // Implementation for calculating growth potential
    return 0.7; // Simplified
  }

  generateSegmentRecommendations(segment) {
    // Implementation for generating segment recommendations
    return []; // Simplified
  }

  categorizeChurnRisk(data) {
    // Implementation for categorizing churn risk levels
    return {}; // Simplified
  }

  enhanceChurnPredictions(predictions) {
    // Implementation for enhancing churn predictions
    return predictions; // Simplified
  }

  generateChurnActionItems(data) {
    // Implementation for generating churn action items
    return []; // Simplified
  }

  analyzeTrendDirection(trends) {
    // Implementation for analyzing trend direction
    return 'upward'; // Simplified
  }

  generateOrderInsights(metrics, patterns) {
    // Implementation for generating order insights
    return []; // Simplified
  }

  generateProductInsights(products, performance) {
    // Implementation for generating product insights
    return []; // Simplified
  }

  generatePredictiveInsights(predictions) {
    // Implementation for generating predictive insights
    return []; // Simplified
  }

  calculateOverallConfidence(predictions) {
    // Implementation for calculating overall confidence
    return 0.85; // Simplified
  }

  generateRealTimeInsights(data) {
    // Implementation for generating real-time insights
    return []; // Simplified
  }

  generateReportInsights(data) {
    // Implementation for generating report insights
    return []; // Simplified
  }
}

// Export singleton instance
const customerAnalyticsService = new CustomerAnalyticsService();

export default customerAnalyticsService;
export { CustomerAnalyticsService };