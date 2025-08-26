// Cost Analytics Service
// Implementation of API-007: Cost analytics service integration
import httpService from './httpClient';
import { ApiError } from './httpClient';

/**
 * Cost Analytics Service
 * Comprehensive service layer for cost tracking, usage analytics, and financial optimization
 * Following the FRONTEND_INTEGRATION_GUIDE.md specification
 */
class CostAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3 * 60 * 1000; // 3 minutes for cost data
    this.realTimeSubscriptions = new Map();
  }

  /**
   * Get customer cost analytics
   * @param {string} customerId - Customer ID
   * @param {Object} params - Query parameters
   * @param {number} params.days - Days to analyze (default: 30)
   * @param {boolean} params.includeBreakdown - Include cost breakdown by category
   * @param {boolean} params.includeTrends - Include trend analysis
   * @returns {Promise<Object>} Customer cost analytics data
   */
  async getCustomerCostAnalytics(customerId, params = {}) {
    const { days = 30, includeBreakdown = true, includeTrends = true, useCache = true } = params;
    const cacheKey = `customer_cost_${customerId}_${days}`;
    
    if (useCache && this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    try {
      const response = await httpService.get(`/v1/customers/${customerId}/cost-analytics`, {
        days,
        includeBreakdown,
        includeTrends,
        includeComparisons: true
      });

      // Enhance response with calculated metrics and insights
      const enhancedData = this.enhanceCustomerCostData(response, customerId);
      
      this.setCachedData(cacheKey, enhancedData);
      return enhancedData;
    } catch (error) {
      throw this.handleCostAnalyticsError('Customer cost analytics fetch failed', error);
    }
  }

  /**
   * Get cost overview for all customers
   * @param {Object} params - Query parameters
   * @param {string} params.timeRange - Time range ('day', 'week', 'month', 'quarter')
   * @param {string} params.groupBy - Group results by ('customer', 'category', 'service')
   * @param {boolean} params.includeForecasting - Include cost forecasting
   * @returns {Promise<Object>} Cost overview data
   */
  async getCostOverview(params = {}) {
    const {
      timeRange = 'day',
      groupBy = 'customer',
      includeForecasting = true,
      includeOptimization = true
    } = params;

    try {
      const [overviewData, forecastData, optimizationData] = await Promise.allSettled([
        httpService.get('/v1/customers/cost-analytics/overview', {
          timeRange,
          groupBy,
          includeMetrics: true,
          includeTrends: true
        }),
        includeForecasting ? httpService.get('/v1/cost-analytics/forecast', {
          timeRange: this.getExtendedTimeRange(timeRange),
          includeScenarios: true
        }) : Promise.resolve(null),
        includeOptimization ? httpService.get('/v1/cost-analytics/optimization', {
          includeRecommendations: true,
          includeThresholds: true
        }) : Promise.resolve(null)
      ]);

      const result = {
        overview: overviewData.status === 'fulfilled' ? overviewData.value : null,
        forecast: forecastData.status === 'fulfilled' ? forecastData.value : null,
        optimization: optimizationData.status === 'fulfilled' ? optimizationData.value : null,
        insights: this.generateCostOverviewInsights(overviewData.value, forecastData.value),
        lastUpdated: Date.now()
      };

      return result;
    } catch (error) {
      throw this.handleCostAnalyticsError('Cost overview fetch failed', error);
    }
  }

  /**
   * Get top customers by cost
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of top customers to return (default: 10)
   * @param {number} params.days - Days to analyze (default: 30)
   * @param {string} params.sortBy - Sort by metric ('totalCost', 'avgCost', 'requests')
   * @returns {Promise<Array>} Top customers by cost
   */
  async getTopCustomersByCost(params = {}) {
    const {
      limit = 10,
      days = 30,
      sortBy = 'totalCost',
      includeDetails = true
    } = params;

    try {
      const response = await httpService.get('/v1/customers/cost-analytics/top-customers', {
        limit,
        days,
        sortBy,
        includeDetails,
        includeMetrics: true
      });

      // Process and enhance the customer cost data
      const enhancedData = response.map(customer => ({
        ...customer,
        costPerRequest: customer.totalCost / Math.max(customer.totalRequests, 1),
        efficiency: this.calculateCostEfficiency(customer),
        riskLevel: this.assessCostRisk(customer),
        recommendations: this.generateCustomerCostRecommendations(customer)
      }));

      return {
        customers: enhancedData,
        summary: this.generateTopCustomersSummary(enhancedData),
        insights: this.generateTopCustomersInsights(enhancedData)
      };
    } catch (error) {
      throw this.handleCostAnalyticsError('Top customers by cost fetch failed', error);
    }
  }

  /**
   * Get detailed cost breakdown by service/feature
   * @param {Object} params - Query parameters
   * @param {string} params.timeRange - Time range to analyze
   * @param {string} params.breakdownBy - Breakdown dimension ('service', 'feature', 'model', 'customer')
   * @returns {Promise<Object>} Cost breakdown data
   */
  async getCostBreakdown(params = {}) {
    const {
      timeRange = 'month',
      breakdownBy = 'service',
      includeComparisons = true,
      includeTrends = true
    } = params;

    try {
      const response = await httpService.get('/v1/cost-analytics/breakdown', {
        timeRange,
        breakdownBy,
        includeComparisons,
        includeTrends,
        includeProjections: true
      });

      return {
        ...response,
        insights: this.generateBreakdownInsights(response, breakdownBy),
        recommendations: this.generateCostOptimizationRecommendations(response),
        lastUpdated: Date.now()
      };
    } catch (error) {
      throw this.handleCostAnalyticsError('Cost breakdown fetch failed', error);
    }
  }

  /**
   * Get cost trends and patterns
   * @param {Object} params - Query parameters
   * @param {string} params.timeRange - Time range for trend analysis
   * @param {string} params.granularity - Data granularity ('hour', 'day', 'week', 'month')
   * @returns {Promise<Object>} Cost trends data
   */
  async getCostTrends(params = {}) {
    const {
      timeRange = 'month',
      granularity = 'day',
      includeSeasonality = true,
      includeAnomalyDetection = true
    } = params;

    try {
      const response = await httpService.get('/v1/cost-analytics/trends', {
        timeRange,
        granularity,
        includeSeasonality,
        includeAnomalyDetection,
        includeProjections: true
      });

      return {
        ...response,
        patterns: this.analyzeCostPatterns(response),
        anomalies: this.detectCostAnomalies(response),
        insights: this.generateTrendInsights(response)
      };
    } catch (error) {
      throw this.handleCostAnalyticsError('Cost trends fetch failed', error);
    }
  }

  /**
   * Get AI model cost comparison
   * @param {Object} params - Query parameters
   * @param {Array} params.models - Models to compare (default: ['claude-haiku', 'claude-sonnet'])
   * @param {string} params.timeRange - Time range for comparison
   * @returns {Promise<Object>} Model cost comparison
   */
  async getModelCostComparison(params = {}) {
    const {
      models = ['claude-haiku', 'claude-sonnet'],
      timeRange = 'month',
      includePerformanceMetrics = true,
      includeEfficiencyAnalysis = true
    } = params;

    try {
      const response = await httpService.get('/v1/cost-analytics/models/comparison', {
        models,
        timeRange,
        includePerformanceMetrics,
        includeEfficiencyAnalysis,
        includeRecommendations: true
      });

      return {
        ...response,
        efficiency: this.calculateModelEfficiency(response),
        recommendations: this.generateModelOptimizationRecommendations(response),
        insights: this.generateModelComparisonInsights(response)
      };
    } catch (error) {
      throw this.handleCostAnalyticsError('Model cost comparison fetch failed', error);
    }
  }

  /**
   * Set cost budgets and alerts
   * @param {Object} budgetConfig - Budget configuration
   * @param {number} budgetConfig.monthlyLimit - Monthly cost limit
   * @param {Array} budgetConfig.thresholds - Alert thresholds (e.g., [50, 80, 95])
   * @param {Object} budgetConfig.breakdown - Budget breakdown by service/customer
   * @returns {Promise<Object>} Budget setup response
   */
  async setBudgetAndAlerts(budgetConfig) {
    const {
      monthlyLimit,
      thresholds = [50, 80, 95],
      breakdown = {},
      alertChannels = ['email'],
      autoActions = {}
    } = budgetConfig;

    try {
      const response = await httpService.post('/v1/cost-analytics/budget', {
        monthlyLimit,
        thresholds,
        breakdown,
        alertChannels,
        autoActions,
        enabled: true
      });

      return {
        ...response,
        projectedAlerts: this.projectBudgetAlerts(budgetConfig),
        recommendations: this.generateBudgetRecommendations(budgetConfig)
      };
    } catch (error) {
      throw this.handleCostAnalyticsError('Budget setup failed', error);
    }
  }

  /**
   * Get cost alerts and notifications
   * @param {Object} params - Query parameters
   * @param {string} params.severity - Alert severity filter ('low', 'medium', 'high', 'critical')
   * @param {number} params.days - Days to look back for alerts
   * @returns {Promise<Array>} Cost alerts
   */
  async getCostAlerts(params = {}) {
    const {
      severity = null,
      days = 7,
      includeResolved = false,
      includeProjections = true
    } = params;

    try {
      const response = await httpService.get('/v1/cost-analytics/alerts', {
        severity,
        days,
        includeResolved,
        includeProjections,
        includeContext: true
      });

      return {
        alerts: response.map(alert => ({
          ...alert,
          impact: this.assessAlertImpact(alert),
          urgency: this.calculateAlertUrgency(alert),
          suggestedActions: this.generateAlertActions(alert)
        })),
        summary: this.generateAlertsSummary(response),
        insights: this.generateAlertsInsights(response)
      };
    } catch (error) {
      throw this.handleCostAnalyticsError('Cost alerts fetch failed', error);
    }
  }

  /**
   * Generate cost optimization report
   * @param {Object} params - Report parameters
   * @param {string} params.scope - Report scope ('customer', 'service', 'overall')
   * @param {string} params.timeRange - Time range for analysis
   * @returns {Promise<Object>} Optimization report
   */
  async generateOptimizationReport(params = {}) {
    const {
      scope = 'overall',
      timeRange = 'month',
      includeRecommendations = true,
      includeProjections = true,
      includeComparisons = true
    } = params;

    try {
      const response = await httpService.post('/v1/cost-analytics/optimization/report', {
        scope,
        timeRange,
        includeRecommendations,
        includeProjections,
        includeComparisons,
        analysisDepth: 'comprehensive'
      });

      return {
        ...response,
        potentialSavings: this.calculatePotentialSavings(response),
        prioritizedActions: this.prioritizeOptimizationActions(response.recommendations),
        implementationPlan: this.generateImplementationPlan(response),
        riskAssessment: this.assessOptimizationRisks(response)
      };
    } catch (error) {
      throw this.handleCostAnalyticsError('Optimization report generation failed', error);
    }
  }

  // Data processing and enhancement methods

  /**
   * Enhance customer cost data with calculated metrics
   * @param {Object} data - Raw customer cost data
   * @param {string} customerId - Customer ID
   * @returns {Object} Enhanced cost data
   */
  enhanceCustomerCostData(data, customerId) {
    if (!data) return data;

    return {
      ...data,
      metrics: {
        ...data.metrics,
        costEfficiency: this.calculateCostEfficiency(data),
        trendDirection: this.analyzeCostTrend(data.trends),
        riskScore: this.assessCustomerCostRisk(data, customerId),
        benchmarkComparison: this.compareAgainstBenchmarks(data)
      },
      insights: this.generateCustomerCostInsights(data),
      recommendations: this.generateCustomerCostRecommendations(data),
      lastUpdated: Date.now()
    };
  }

  /**
   * Generate cost overview insights
   * @param {Object} overview - Overview data
   * @param {Object} forecast - Forecast data
   * @returns {Array} Cost insights
   */
  generateCostOverviewInsights(overview, forecast) {
    const insights = [];

    if (overview?.totalCost && overview?.previousPeriodCost) {
      const growth = ((overview.totalCost - overview.previousPeriodCost) / overview.previousPeriodCost) * 100;
      insights.push({
        type: Math.abs(growth) > 20 ? 'warning' : 'info',
        metric: 'cost_growth',
        value: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
        description: `Cost ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}% from previous period`,
        impact: Math.abs(growth) > 30 ? 'high' : Math.abs(growth) > 15 ? 'medium' : 'low'
      });
    }

    if (forecast?.projectedCost && overview?.totalCost) {
      const projectedGrowth = ((forecast.projectedCost - overview.totalCost) / overview.totalCost) * 100;
      insights.push({
        type: projectedGrowth > 25 ? 'alert' : 'trend',
        metric: 'projected_growth',
        value: `${projectedGrowth > 0 ? '+' : ''}${projectedGrowth.toFixed(1)}%`,
        description: `Projected cost growth of ${projectedGrowth.toFixed(1)}% for next period`,
        impact: projectedGrowth > 50 ? 'high' : projectedGrowth > 25 ? 'medium' : 'low'
      });
    }

    if (overview?.topCostDrivers) {
      const topDriver = overview.topCostDrivers[0];
      if (topDriver && topDriver.percentage > 40) {
        insights.push({
          type: 'highlight',
          metric: 'cost_concentration',
          value: `${topDriver.percentage.toFixed(1)}%`,
          description: `${topDriver.name} accounts for ${topDriver.percentage.toFixed(1)}% of total costs`,
          impact: 'medium'
        });
      }
    }

    return insights;
  }

  /**
   * Calculate cost efficiency score
   * @param {Object} data - Cost data
   * @returns {number} Efficiency score (0-1)
   */
  calculateCostEfficiency(data) {
    if (!data.totalCost || !data.totalRequests) return 0;

    const costPerRequest = data.totalCost / data.totalRequests;
    const benchmarkCostPerRequest = 0.01; // $0.01 per request benchmark
    
    // Efficiency score: lower cost per request = higher efficiency
    const efficiency = Math.max(0, 1 - (costPerRequest / benchmarkCostPerRequest));
    return Math.min(1, efficiency);
  }

  /**
   * Assess customer cost risk
   * @param {Object} data - Customer cost data
   * @param {string} customerId - Customer ID
   * @returns {string} Risk level ('low', 'medium', 'high', 'critical')
   */
  assessCustomerCostRisk(data, customerId) {
    let riskScore = 0;

    // High cost growth
    if (data.trends?.growthRate > 50) riskScore += 3;
    else if (data.trends?.growthRate > 25) riskScore += 2;
    else if (data.trends?.growthRate > 10) riskScore += 1;

    // High cost per request
    if (data.costPerRequest > 0.05) riskScore += 3;
    else if (data.costPerRequest > 0.02) riskScore += 2;
    else if (data.costPerRequest > 0.01) riskScore += 1;

    // Anomaly detection
    if (data.anomalies?.length > 0) riskScore += 2;

    // Budget utilization
    if (data.budgetUtilization > 0.9) riskScore += 3;
    else if (data.budgetUtilization > 0.8) riskScore += 2;

    if (riskScore >= 7) return 'critical';
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * Generate customer cost recommendations
   * @param {Object} data - Customer cost data
   * @returns {Array} Recommendations
   */
  generateCustomerCostRecommendations(data) {
    const recommendations = [];

    if (data.costEfficiency < 0.5) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        title: 'Optimize API Usage',
        description: 'Consider implementing request caching and batching to reduce costs',
        potentialSavings: '20-30%',
        effort: 'medium'
      });
    }

    if (data.modelDistribution?.['claude-sonnet'] > 0.7) {
      recommendations.push({
        type: 'model_optimization',
        priority: 'medium',
        title: 'Balance AI Model Usage',
        description: 'Consider using Claude Haiku for simpler tasks to reduce costs',
        potentialSavings: '15-25%',
        effort: 'low'
      });
    }

    if (data.trends?.growthRate > 30) {
      recommendations.push({
        type: 'monitoring',
        priority: 'high',
        title: 'Implement Cost Monitoring',
        description: 'Set up automated alerts for unusual cost spikes',
        potentialSavings: 'Prevention of cost overruns',
        effort: 'low'
      });
    }

    return recommendations;
  }

  // Utility and helper methods

  /**
   * Get extended time range for forecasting
   * @param {string} timeRange - Base time range
   * @returns {string} Extended time range
   */
  getExtendedTimeRange(timeRange) {
    const rangeMap = {
      day: 'week',
      week: 'month',
      month: 'quarter',
      quarter: 'year'
    };
    return rangeMap[timeRange] || 'month';
  }

  /**
   * Handle cost analytics specific errors
   * @param {string} message - Error message
   * @param {Error} originalError - Original error
   * @returns {ApiError} Formatted error
   */
  handleCostAnalyticsError(message, originalError) {
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
      'COST_ANALYTICS_ERROR',
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
    if (this.cache.size > 50) {
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

  // Placeholder methods for comprehensive functionality
  // These would be implemented with full business logic in production

  analyzeCostPatterns(data) { return []; }
  detectCostAnomalies(data) { return []; }
  generateTrendInsights(data) { return []; }
  calculateModelEfficiency(data) { return {}; }
  generateModelOptimizationRecommendations(data) { return []; }
  generateModelComparisonInsights(data) { return []; }
  projectBudgetAlerts(config) { return []; }
  generateBudgetRecommendations(config) { return []; }
  assessAlertImpact(alert) { return 'medium'; }
  calculateAlertUrgency(alert) { return 5; }
  generateAlertActions(alert) { return []; }
  generateAlertsSummary(alerts) { return {}; }
  generateAlertsInsights(alerts) { return []; }
  calculatePotentialSavings(data) { return 0; }
  prioritizeOptimizationActions(actions) { return actions; }
  generateImplementationPlan(data) { return {}; }
  assessOptimizationRisks(data) { return []; }
  analyzeCostTrend(trends) { return 'stable'; }
  compareAgainstBenchmarks(data) { return {}; }
  generateCustomerCostInsights(data) { return []; }
  generateTopCustomersSummary(customers) { return {}; }
  generateTopCustomersInsights(customers) { return []; }
  generateBreakdownInsights(data, breakdownBy) { return []; }
  generateCostOptimizationRecommendations(data) { return []; }
}

// Export singleton instance
const costAnalyticsService = new CostAnalyticsService();

export default costAnalyticsService;
export { CostAnalyticsService };