// Inventory Management Service
// Implementation of API-004: Inventory management service
import httpService from './httpClient';
import { ApiError } from './httpClient';

/**
 * Inventory Management Service
 * Comprehensive service layer for inventory management, forecasting, and optimization
 */
class InventoryService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3 * 60 * 1000; // 3 minutes for inventory data
    this.subscriptions = new Map();
    this.forecastCache = new Map();
    this.forecastCacheTimeout = 15 * 60 * 1000; // 15 minutes for forecasts
  }

  /**
   * Get inventory overview and summary
   * @param {Object} params - Query parameters
   * @param {string} params.timeRange - Time range for analytics (7d, 30d, 90d)
   * @param {boolean} params.includeMetrics - Include calculated metrics
   * @param {boolean} params.includeAlerts - Include stock alerts
   * @returns {Promise<Object>} Inventory overview
   */
  async getInventoryOverview(params = {}) {
    const { 
      timeRange = '30d', 
      includeMetrics = true, 
      includeAlerts = true,
      useCache = true 
    } = params;
    
    const cacheKey = `inventory_overview_${timeRange}`;
    
    if (useCache && this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockInventoryOverview(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [overview, metrics, alerts] = await Promise.allSettled([
          httpService.get('/inventory', {
            summary: true,
            timeRange,
            includeCategories: true,
            includeLocations: true
          }),
          includeMetrics ? httpService.get('/analytics/inventory', {
            timeRange,
            includeMetrics: true,
            includeTrends: true
          }) : Promise.resolve(null),
          includeAlerts ? httpService.get('/inventory/alerts', {
            severity: ['critical', 'warning', 'info'],
            includeHistorical: false
          }) : Promise.resolve(null)
        ]);

        const result = {
          overview: overview.status === 'fulfilled' ? overview.value : null,
          metrics: metrics.status === 'fulfilled' ? metrics.value : null,
          alerts: alerts.status === 'fulfilled' ? alerts.value : null,
          insights: this.generateInventoryInsights(overview.value, metrics.value, alerts.value),
          lastUpdated: Date.now()
        };

        this.setCachedData(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Inventory overview fetch failed', apiError);
      }
    }
  }

  /**
   * Get detailed inventory list with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Inventory list
   */
  async getInventoryList(params = {}) {
    const {
      page = 1,
      limit = 50,
      sortBy = 'lastUpdated',
      sortOrder = 'desc',
      category = null,
      location = null,
      status = null,
      search = '',
      lowStockOnly = false,
      includeHistory = false
    } = params;

    try {
      const inventoryData = await httpService.get('/inventory', {
        page,
        limit,
        sortBy,
        sortOrder,
        category,
        location,
        status,
        search,
        lowStockOnly,
        includeHistory,
        includeMetrics: true
      });

      return {
        ...inventoryData,
        items: inventoryData.items?.map(item => ({
          ...item,
          healthScore: this.calculateItemHealthScore(item),
          recommendations: this.generateItemRecommendations(item),
          riskLevel: this.assessStockRisk(item)
        })),
        insights: this.generateListInsights(inventoryData.items)
      };
    } catch (error) {
      throw this.handleInventoryError('Inventory list fetch failed', error);
    }
  }

  /**
   * Get specific inventory item details
   * @param {string} productId - Product ID
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Item details
   */
  async getInventoryItem(productId, params = {}) {
    const { 
      includeHistory = true, 
      includeForecasting = true,
      includeRecommendations = true 
    } = params;

    try {
      const [item, history, forecasting, recommendations] = await Promise.allSettled([
        httpService.get(`/inventory/${productId}`),
        includeHistory ? httpService.get(`/inventory/${productId}/history`, {
          timeRange: '90d',
          includeAdjustments: true,
          includeTransfers: true
        }) : Promise.resolve(null),
        includeForecasting ? this.getItemForecasting(productId) : Promise.resolve(null),
        includeRecommendations ? this.getItemRecommendations(productId) : Promise.resolve(null)
      ]);

      const itemData = item.status === 'fulfilled' ? item.value : null;
      
      if (!itemData) {
        throw new ApiError('Item not found', 404, 'ITEM_NOT_FOUND');
      }

      const result = {
        ...itemData,
        history: history.status === 'fulfilled' ? history.value : null,
        forecasting: forecasting.status === 'fulfilled' ? forecasting.value : null,
        recommendations: recommendations.status === 'fulfilled' ? recommendations.value : null,
        healthScore: this.calculateItemHealthScore(itemData),
        riskAssessment: this.performRiskAssessment(itemData),
        insights: this.generateItemInsights(itemData)
      };

      return result;
    } catch (error) {
      throw this.handleInventoryError('Inventory item fetch failed', error);
    }
  }

  /**
   * Adjust inventory stock levels
   * @param {string} productId - Product ID
   * @param {Object} adjustment - Stock adjustment data
   * @returns {Promise<Object>} Adjustment response
   */
  async adjustStock(productId, adjustment) {
    const {
      quantity,
      type = 'manual', // 'manual', 'sale', 'purchase', 'transfer', 'adjustment'
      reason = '',
      location = null,
      batchNumber = null,
      expiryDate = null,
      cost = null,
      notes = ''
    } = adjustment;

    try {
      // Validate adjustment
      this.validateStockAdjustment(adjustment);

      const response = await httpService.post(`/inventory/${productId}/adjust`, {
        quantity,
        type,
        reason,
        location,
        batchNumber,
        expiryDate,
        cost,
        notes,
        timestamp: Date.now()
      });

      // Clear relevant cache entries
      this.clearCache('inventory');

      return {
        ...response,
        insights: this.generateAdjustmentInsights(response),
        recommendations: this.generatePostAdjustmentRecommendations(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Stock adjustment failed', error);
    }
  }

  /**
   * Bulk adjust multiple inventory items
   * @param {Array} adjustments - Array of adjustment objects
   * @returns {Promise<Object>} Bulk adjustment response
   */
  async bulkAdjustStock(adjustments) {
    try {
      // Validate all adjustments
      adjustments.forEach(adj => this.validateStockAdjustment(adj));

      const response = await httpService.post('/inventory/bulk-adjust', {
        adjustments: adjustments.map(adj => ({
          ...adj,
          timestamp: Date.now()
        }))
      });

      // Clear cache
      this.clearCache('inventory');

      return {
        ...response,
        summary: this.generateBulkAdjustmentSummary(response),
        insights: this.generateBulkAdjustmentInsights(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Bulk stock adjustment failed', error);
    }
  }

  /**
   * Transfer stock between locations
   * @param {Object} transfer - Transfer data
   * @returns {Promise<Object>} Transfer response
   */
  async transferStock(transfer) {
    const {
      productId,
      fromLocation,
      toLocation,
      quantity,
      reason = '',
      expectedDate = null,
      notes = ''
    } = transfer;

    try {
      this.validateStockTransfer(transfer);

      const response = await httpService.post('/inventory/transfer', {
        productId,
        fromLocation,
        toLocation,
        quantity,
        reason,
        expectedDate,
        notes,
        initiatedAt: Date.now()
      });

      // Clear cache
      this.clearCache('inventory');

      return {
        ...response,
        insights: this.generateTransferInsights(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Stock transfer failed', error);
    }
  }

  /**
   * Get inventory forecasting and predictions
   * @param {Object} params - Forecasting parameters
   * @returns {Promise<Object>} Forecasting data
   */
  async getInventoryForecasting(params = {}) {
    const {
      timeHorizon = '60d',
      includeReorderPoints = true,
      includeSeasonality = true,
      includeOptimization = true,
      productIds = null,
      categories = null
    } = params;

    const cacheKey = `forecasting_${timeHorizon}_${JSON.stringify({ productIds, categories })}`;
    
    if (this.getForecastCache(cacheKey)) {
      return this.getForecastCache(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockInventoryForecasting(params);
      this.setForecastCache(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock forecasting data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [forecasting, reorderPoints, seasonality, optimization] = await Promise.allSettled([
          httpService.get('/analytics/inventory/forecasting', {
            timeHorizon,
            productIds,
            categories,
            includeConfidence: true,
            includeScenarios: true
          }),
          includeReorderPoints ? httpService.get('/analytics/inventory/reorder-points', {
            productIds,
            categories,
            includeRecommendations: true
          }) : Promise.resolve(null),
          includeSeasonality ? httpService.get('/analytics/inventory/seasonality', {
            timeRange: '1y',
            productIds,
            categories
          }) : Promise.resolve(null),
          includeOptimization ? httpService.get('/analytics/inventory/optimization', {
            includeRecommendations: true,
            includeCostAnalysis: true,
            productIds,
            categories
          }) : Promise.resolve(null)
        ]);

        const result = {
          forecasting: forecasting.status === 'fulfilled' ? forecasting.value : null,
          reorderPoints: reorderPoints.status === 'fulfilled' ? reorderPoints.value : null,
          seasonality: seasonality.status === 'fulfilled' ? seasonality.value : null,
          optimization: optimization.status === 'fulfilled' ? optimization.value : null,
          insights: this.generateForecastingInsights(forecasting.value, reorderPoints.value),
          recommendations: this.generateForecastingRecommendations(forecasting.value),
          generatedAt: Date.now()
        };

        this.setForecastCache(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Inventory forecasting failed', apiError);
      }
    }
  }

  /**
   * Get inventory alerts and notifications
   * @param {Object} params - Alert parameters
   * @returns {Promise<Object>} Alerts data
   */
  async getInventoryAlerts(params = {}) {
    const {
      severity = ['critical', 'warning'],
      category = null,
      location = null,
      includeHistorical = false,
      limit = 100
    } = params;

    try {
      const alerts = await httpService.get('/inventory/alerts', {
        severity,
        category,
        location,
        includeHistorical,
        limit,
        includeMetadata: true
      });

      return {
        ...alerts,
        categorized: this.categorizeAlerts(alerts.alerts || []),
        prioritized: this.prioritizeAlerts(alerts.alerts || []),
        actionItems: this.generateAlertActionItems(alerts.alerts || []),
        insights: this.generateAlertInsights(alerts.alerts || [])
      };
    } catch (error) {
      throw this.handleInventoryError('Inventory alerts fetch failed', error);
    }
  }

  /**
   * Create custom inventory alert rule
   * @param {Object} rule - Alert rule configuration
   * @returns {Promise<Object>} Rule creation response
   */
  async createAlertRule(rule) {
    const {
      name,
      description,
      conditions,
      severity = 'warning',
      channels = ['dashboard'],
      isActive = true
    } = rule;

    try {
      this.validateAlertRule(rule);

      const response = await httpService.post('/inventory/alert-rules', {
        name,
        description,
        conditions,
        severity,
        channels,
        isActive,
        createdAt: Date.now()
      });

      return {
        ...response,
        insights: this.generateRuleInsights(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Alert rule creation failed', error);
    }
  }

  /**
   * Get inventory optimization recommendations
   * @param {Object} params - Optimization parameters
   * @returns {Promise<Object>} Optimization recommendations
   */
  async getOptimizationRecommendations(params = {}) {
    const {
      type = 'all', // 'stock_levels', 'reorder_points', 'safety_stock', 'cost', 'all'
      priority = 'high',
      includeImpactAnalysis = true,
      includeImplementationPlan = true
    } = params;

    const cacheKey = `optimization_${type}_${priority}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockOptimizationRecommendations(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock optimization data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [recommendations, impactAnalysis, implementationPlan] = await Promise.allSettled([
          httpService.get('/analytics/inventory/optimization', {
            type,
            priority,
            includeRecommendations: true,
            includeReasoning: true
          }),
          includeImpactAnalysis ? httpService.get('/analytics/inventory/impact-analysis', {
            type,
            includeFinancial: true,
            includeOperational: true
          }) : Promise.resolve(null),
          includeImplementationPlan ? this.generateImplementationPlan(type) : Promise.resolve(null)
        ]);

        const result = {
          recommendations: recommendations.status === 'fulfilled' ? 
            this.processOptimizationRecommendations(recommendations.value) : null,
          impactAnalysis: impactAnalysis.status === 'fulfilled' ? impactAnalysis.value : null,
          implementationPlan: implementationPlan.status === 'fulfilled' ? implementationPlan.value : null,
          prioritizedActions: this.prioritizeOptimizationActions(recommendations.value),
          insights: this.generateOptimizationInsights(recommendations.value)
        };

        this.setCachedData(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Optimization recommendations fetch failed', apiError);
      }
    }
  }

  /**
   * Get inventory locations
   * @param {Object} params - Location parameters
   * @returns {Promise<Object>} Locations data
   */
  async getLocations(params = {}) {
    const {
      includeMetrics = true,
      includeCapacity = true,
      includeAlerts = true
    } = params;

    try {
      const [locations, metrics, alerts] = await Promise.allSettled([
        httpService.get('/inventory/locations'),
        includeMetrics ? httpService.get('/analytics/inventory/locations', {
          includeUtilization: true,
          includePerformance: true
        }) : Promise.resolve(null),
        includeAlerts ? httpService.get('/inventory/alerts', {
          groupBy: 'location',
          severity: ['critical', 'warning']
        }) : Promise.resolve(null)
      ]);

      const result = {
        locations: locations.status === 'fulfilled' ? locations.value : null,
        metrics: metrics.status === 'fulfilled' ? metrics.value : null,
        alerts: alerts.status === 'fulfilled' ? alerts.value : null,
        insights: this.generateLocationInsights(locations.value, metrics.value)
      };

      return result;
    } catch (error) {
      throw this.handleInventoryError('Locations fetch failed', error);
    }
  }

  /**
   * Create new inventory location
   * @param {Object} location - Location data
   * @returns {Promise<Object>} Creation response
   */
  async createLocation(location) {
    const {
      name,
      description = '',
      type = 'warehouse',
      capacity = null,
      address = null,
      contactInfo = null,
      isActive = true
    } = location;

    try {
      this.validateLocation(location);

      const response = await httpService.post('/inventory/locations', {
        name,
        description,
        type,
        capacity,
        address,
        contactInfo,
        isActive,
        createdAt: Date.now()
      });

      // Clear locations cache
      this.clearCache('location');

      return {
        ...response,
        insights: this.generateLocationCreationInsights(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Location creation failed', error);
    }
  }

  // Data processing and analysis methods

  /**
   * Calculate item health score
   * @param {Object} item - Inventory item
   * @returns {number} Health score (0-1)
   */
  calculateItemHealthScore(item) {
    if (!item) return 0;

    let score = 0.5;
    
    // Stock level health
    if (item.currentStock > item.reorderPoint * 2) score += 0.2;
    else if (item.currentStock <= item.reorderPoint) score -= 0.3;
    
    // Turnover rate health
    if (item.turnoverRate > 8) score += 0.15;
    else if (item.turnoverRate < 2) score -= 0.15;
    
    // Age of inventory
    if (item.averageAge < 30) score += 0.1;
    else if (item.averageAge > 90) score -= 0.2;
    
    // Demand consistency
    if (item.demandVariability < 0.3) score += 0.15;
    else if (item.demandVariability > 0.7) score -= 0.15;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Assess stock risk level
   * @param {Object} item - Inventory item
   * @returns {string} Risk level
   */
  assessStockRisk(item) {
    if (!item) return 'unknown';

    const stockRatio = item.currentStock / (item.reorderPoint || 1);
    const demandRate = item.averageDailyDemand || 0;
    const leadTime = item.averageLeadTime || 7;

    if (stockRatio < 0.5 || (demandRate * leadTime > item.currentStock)) {
      return 'critical';
    } else if (stockRatio < 1 || (demandRate * leadTime * 1.5 > item.currentStock)) {
      return 'high';
    } else if (stockRatio < 1.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate item recommendations
   * @param {Object} item - Inventory item
   * @returns {Array} Recommendations
   */
  generateItemRecommendations(item) {
    const recommendations = [];

    if (!item) return recommendations;

    const riskLevel = this.assessStockRisk(item);
    
    if (riskLevel === 'critical') {
      recommendations.push({
        type: 'urgent_reorder',
        priority: 'high',
        description: 'Immediate reorder required to prevent stockout',
        action: 'Create emergency purchase order',
        impact: 'Prevents revenue loss from stockouts'
      });
    }

    if (item.turnoverRate < 2) {
      recommendations.push({
        type: 'slow_moving',
        priority: 'medium',
        description: 'Item has low turnover rate',
        action: 'Consider promotion or markdown',
        impact: 'Improves cash flow and reduces carrying costs'
      });
    }

    if (item.demandVariability > 0.7) {
      recommendations.push({
        type: 'demand_variability',
        priority: 'medium',
        description: 'High demand variability detected',
        action: 'Implement dynamic safety stock calculation',
        impact: 'Reduces stockout risk while minimizing excess inventory'
      });
    }

    return recommendations;
  }

  /**
   * Generate inventory insights
   * @param {Object} overview - Inventory overview
   * @param {Object} metrics - Inventory metrics
   * @param {Object} alerts - Inventory alerts
   * @returns {Array} Insights
   */
  generateInventoryInsights(overview, metrics, alerts) {
    const insights = [];

    if (overview?.summary) {
      const { totalValue, totalItems, lowStockItems } = overview.summary;
      
      if (lowStockItems > 0) {
        const percentage = ((lowStockItems / totalItems) * 100).toFixed(1);
        insights.push({
          type: 'warning',
          metric: 'low_stock_percentage',
          value: `${percentage}%`,
          description: `${lowStockItems} items (${percentage}%) are running low on stock`,
          priority: lowStockItems > totalItems * 0.1 ? 'high' : 'medium'
        });
      }
    }

    if (metrics?.turnoverRate) {
      const turnoverHealth = metrics.turnoverRate > 6 ? 'excellent' : 
                           metrics.turnoverRate > 4 ? 'good' : 
                           metrics.turnoverRate > 2 ? 'average' : 'poor';
      
      insights.push({
        type: turnoverHealth === 'poor' ? 'warning' : 'info',
        metric: 'inventory_turnover',
        value: metrics.turnoverRate.toFixed(1),
        description: `Inventory turnover rate is ${turnoverHealth}`,
        priority: turnoverHealth === 'poor' ? 'high' : 'low'
      });
    }

    if (alerts?.alerts?.length > 0) {
      const criticalAlerts = alerts.alerts.filter(a => a.severity === 'critical').length;
      if (criticalAlerts > 0) {
        insights.push({
          type: 'alert',
          metric: 'critical_alerts',
          value: criticalAlerts,
          description: `${criticalAlerts} critical inventory alerts require immediate attention`,
          priority: 'critical'
        });
      }
    }

    return insights;
  }

  // Validation methods

  /**
   * Validate stock adjustment
   * @param {Object} adjustment - Stock adjustment
   * @throws {ApiError} Validation error
   */
  validateStockAdjustment(adjustment) {
    if (!adjustment.quantity || isNaN(adjustment.quantity)) {
      throw new ApiError('Valid quantity is required', 400, 'INVALID_QUANTITY');
    }

    if (!adjustment.type || !['manual', 'sale', 'purchase', 'transfer', 'adjustment'].includes(adjustment.type)) {
      throw new ApiError('Valid adjustment type is required', 400, 'INVALID_TYPE');
    }

    if (adjustment.quantity < 0 && !adjustment.reason) {
      throw new ApiError('Reason is required for stock reductions', 400, 'REASON_REQUIRED');
    }
  }

  /**
   * Validate stock transfer
   * @param {Object} transfer - Stock transfer
   * @throws {ApiError} Validation error
   */
  validateStockTransfer(transfer) {
    if (!transfer.productId) {
      throw new ApiError('Product ID is required', 400, 'PRODUCT_ID_REQUIRED');
    }

    if (!transfer.fromLocation || !transfer.toLocation) {
      throw new ApiError('Both from and to locations are required', 400, 'LOCATIONS_REQUIRED');
    }

    if (transfer.fromLocation === transfer.toLocation) {
      throw new ApiError('From and to locations cannot be the same', 400, 'SAME_LOCATION');
    }

    if (!transfer.quantity || transfer.quantity <= 0) {
      throw new ApiError('Valid positive quantity is required', 400, 'INVALID_QUANTITY');
    }
  }

  /**
   * Validate alert rule
   * @param {Object} rule - Alert rule
   * @throws {ApiError} Validation error
   */
  validateAlertRule(rule) {
    if (!rule.name || rule.name.trim().length === 0) {
      throw new ApiError('Rule name is required', 400, 'NAME_REQUIRED');
    }

    if (!rule.conditions || !Array.isArray(rule.conditions) || rule.conditions.length === 0) {
      throw new ApiError('At least one condition is required', 400, 'CONDITIONS_REQUIRED');
    }

    if (!['critical', 'warning', 'info'].includes(rule.severity)) {
      throw new ApiError('Valid severity level is required', 400, 'INVALID_SEVERITY');
    }
  }

  /**
   * Validate location
   * @param {Object} location - Location data
   * @throws {ApiError} Validation error
   */
  validateLocation(location) {
    if (!location.name || location.name.trim().length === 0) {
      throw new ApiError('Location name is required', 400, 'NAME_REQUIRED');
    }

    if (location.type && !['warehouse', 'store', 'distribution_center', 'factory'].includes(location.type)) {
      throw new ApiError('Valid location type is required', 400, 'INVALID_TYPE');
    }
  }

  // Cache management methods

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data
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
   * Set cached data
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean old entries
    if (this.cache.size > 50) {
      const oldEntries = Array.from(this.cache.entries())
        .filter(([_, value]) => Date.now() - value.timestamp > this.cacheTimeout);
      
      oldEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Get forecast cache data
   * @param {string} key - Cache key
   * @returns {Object|null} Cached forecast data
   */
  getForecastCache(key) {
    const cached = this.forecastCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.forecastCacheTimeout) {
      return cached.data;
    }
    this.forecastCache.delete(key);
    return null;
  }

  /**
   * Set forecast cache data
   * @param {string} key - Cache key
   * @param {Object} data - Forecast data to cache
   */
  setForecastCache(key, data) {
    this.forecastCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   * @param {string} pattern - Pattern to match keys
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
   * Handle inventory-specific errors
   * @param {string} message - Error message
   * @param {Error} originalError - Original error
   * @returns {ApiError} Formatted error
   */
  handleInventoryError(message, originalError) {
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
      'INVENTORY_ERROR',
      { originalError: originalError.message }
    );
  }

  // Placeholder methods for additional functionality
  // These would be fully implemented based on specific business requirements

  getItemForecasting(productId) {
    return Promise.resolve({ productId, forecast: 'placeholder' });
  }

  getItemRecommendations(productId) {
    return Promise.resolve([{ type: 'placeholder', productId }]);
  }

  performRiskAssessment(item) {
    return { riskLevel: this.assessStockRisk(item), factors: [] };
  }

  generateItemInsights(item) {
    return this.generateItemRecommendations(item);
  }

  generateAdjustmentInsights(response) {
    return [{ type: 'success', description: 'Stock adjustment completed successfully' }];
  }

  generatePostAdjustmentRecommendations(response) {
    return [{ type: 'monitor', description: 'Monitor stock levels for next 7 days' }];
  }

  generateBulkAdjustmentSummary(response) {
    return { successful: response.successful?.length || 0, failed: response.failed?.length || 0 };
  }

  generateBulkAdjustmentInsights(response) {
    return [{ type: 'summary', description: 'Bulk adjustment completed' }];
  }

  generateTransferInsights(response) {
    return [{ type: 'transfer', description: 'Stock transfer initiated successfully' }];
  }

  generateForecastingInsights(forecasting, reorderPoints) {
    return [{ type: 'forecasting', description: 'Forecasting data available' }];
  }

  generateForecastingRecommendations(forecasting) {
    return [{ type: 'forecast_recommendation', description: 'Review forecasting recommendations' }];
  }

  categorizeAlerts(alerts) {
    return alerts.reduce((acc, alert) => {
      acc[alert.category] = acc[alert.category] || [];
      acc[alert.category].push(alert);
      return acc;
    }, {});
  }

  prioritizeAlerts(alerts) {
    return alerts.sort((a, b) => {
      const priority = { critical: 3, warning: 2, info: 1 };
      return (priority[b.severity] || 0) - (priority[a.severity] || 0);
    });
  }

  generateAlertActionItems(alerts) {
    return alerts.map(alert => ({
      alertId: alert.id,
      action: `Address ${alert.severity} alert: ${alert.message}`,
      priority: alert.severity
    }));
  }

  generateAlertInsights(alerts) {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    return criticalCount > 0 ? [
      { type: 'alert', description: `${criticalCount} critical alerts need immediate attention` }
    ] : [];
  }

  generateRuleInsights(response) {
    return [{ type: 'rule_created', description: 'Alert rule created successfully' }];
  }

  processOptimizationRecommendations(recommendations) {
    return recommendations;
  }

  prioritizeOptimizationActions(recommendations) {
    return recommendations?.actions?.sort((a, b) => 
      (b.priority_score || 0) - (a.priority_score || 0)) || [];
  }

  generateOptimizationInsights(recommendations) {
    return [{ type: 'optimization', description: 'Optimization recommendations available' }];
  }

  generateImplementationPlan(type) {
    return Promise.resolve({ type, plan: 'Implementation plan placeholder' });
  }

  generateLocationInsights(locations, metrics) {
    return [{ type: 'location_info', description: 'Location data available' }];
  }

  generateLocationCreationInsights(response) {
    return [{ type: 'location_created', description: 'New location created successfully' }];
  }

  generateListInsights(items) {
    if (!items || items.length === 0) return [];
    const lowStockCount = items.filter(item => 
      this.assessStockRisk(item) === 'critical' || this.assessStockRisk(item) === 'high').length;
    
    return lowStockCount > 0 ? [
      { type: 'warning', description: `${lowStockCount} items need immediate attention` }
    ] : [];
  }

  /**
   * Generate mock inventory overview data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockInventoryOverview(params = {}) {
    return {
      overview: {
        overallHealth: 75,
        totalValue: 450000,
        totalItems: 1245,
        categories: [
          {
            id: 'electronics',
            name: 'Electronics',
            icon: 'laptop',
            health: 85,
            stockLevel: 92,
            turnoverRate: 78,
            expiredItems: 0,
            lowStockItems: 3,
            issues: [
              { type: 'low-stock', text: '3 items below reorder point', severity: 'medium' }
            ]
          },
          {
            id: 'clothing',
            name: 'Clothing',
            icon: 'shirt',
            health: 68,
            stockLevel: 76,
            turnoverRate: 65,
            expiredItems: 5,
            lowStockItems: 12,
            issues: [
              { type: 'low-stock', text: '12 items below reorder point', severity: 'warning' },
              { type: 'expired', text: '5 expired items need attention', severity: 'high' }
            ]
          },
          {
            id: 'groceries',
            name: 'Groceries',
            icon: 'shopping-cart',
            health: 72,
            stockLevel: 68,
            turnoverRate: 85,
            expiredItems: 15,
            lowStockItems: 23,
            issues: [
              { type: 'expired', text: '15 expired items need removal', severity: 'critical' },
              { type: 'low-stock', text: '23 items critically low', severity: 'high' }
            ]
          }
        ]
      },
      alerts: {
        alerts: [
          {
            id: 'alert-1',
            title: 'Critical Stock Level',
            message: 'Multiple items are below critical threshold',
            severity: 'critical',
            type: 'stock',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            items: ['Milk 1L', 'Bread Loaf', 'Eggs 12pk']
          },
          {
            id: 'alert-2',
            title: 'Expiring Soon',
            message: 'Items expiring within 3 days',
            severity: 'warning',
            type: 'expiration',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            items: ['Yogurt', 'Cheese', 'Fresh Meat']
          }
        ]
      },
      insights: [
        {
          type: 'optimization',
          title: 'Stock Optimization Opportunity',
          description: 'Consider rebalancing inventory across categories',
          impact: 'medium',
          actionable: true
        },
        {
          type: 'trend',
          title: 'Seasonal Demand Increase',
          description: 'Electronics showing 15% higher demand',
          impact: 'high',
          actionable: false
        }
      ]
    };
  }

  /**
   * Generate mock inventory forecasting data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockInventoryForecasting(params = {}) {
    return {
      forecasting: {
        products: [
          {
            id: 'product-1',
            name: 'Premium Coffee Beans',
            currentStock: 45,
            predictedOutDate: '2025-01-25',
            daysRemaining: 8,
            suggestedOrder: '150 units',
            confidence: 94,
            urgency: 'critical',
            supplier: 'Coffee Masters Inc.'
          },
          {
            id: 'product-2',
            name: 'Organic Milk 1L',
            currentStock: 28,
            predictedOutDate: '2025-01-28',
            daysRemaining: 11,
            suggestedOrder: '200 units',
            confidence: 89,
            urgency: 'warning',
            supplier: 'Fresh Dairy Co.'
          },
          {
            id: 'product-3',
            name: 'Wireless Headphones',
            currentStock: 156,
            predictedOutDate: '2025-02-15',
            daysRemaining: 29,
            suggestedOrder: '75 units',
            confidence: 78,
            urgency: 'normal',
            supplier: 'Tech Supplies Ltd.'
          }
        ]
      }
    };
  }

  /**
   * Get seasonal demand forecasting data
   * @param {Object} params - Forecasting parameters
   * @returns {Promise<Object>} Seasonal forecasting data
   */
  async getSeasonalForecasting(params = {}) {
    const {
      timeHorizon = '12m',
      categories = null,
      includeHistorical = true,
      includePatterns = true,
      includePredictions = true
    } = params;

    const cacheKey = `seasonal_forecasting_${timeHorizon}_${JSON.stringify({ categories })}`;
    
    if (this.getForecastCache(cacheKey)) {
      return this.getForecastCache(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockSeasonalForecasting(params);
      this.setForecastCache(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock seasonal forecasting data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [forecasting, patterns, predictions] = await Promise.allSettled([
          httpService.get('/analytics/inventory/seasonal-forecasting', {
            timeHorizon,
            categories,
            includeHistorical,
            includeConfidence: true
          }),
          includePatterns ? httpService.get('/analytics/seasonal-patterns', {
            timeHorizon,
            categories,
            includeCorrelations: true
          }) : Promise.resolve(null),
          includePredictions ? httpService.get('/analytics/demand-predictions', {
            timeHorizon,
            categories,
            includeScenarios: true
          }) : Promise.resolve(null)
        ]);

        const result = {
          forecasting: forecasting.status === 'fulfilled' ? forecasting.value : null,
          patterns: patterns.status === 'fulfilled' ? patterns.value : null,
          predictions: predictions.status === 'fulfilled' ? predictions.value : null,
          insights: this.generateSeasonalInsights(forecasting.value, patterns.value),
          recommendations: this.generateSeasonalRecommendations(forecasting.value),
          generatedAt: Date.now()
        };

        this.setForecastCache(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Seasonal forecasting fetch failed', apiError);
      }
    }
  }

  /**
   * Generate mock optimization recommendations data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockOptimizationRecommendations(params = {}) {
    const { type = 'all' } = params;
    
    const allRecommendations = [
      {
        id: 'opt-1',
        type: 'stock_levels',
        priority: 'critical',
        title: 'Optimize Stock Levels for Electronics',
        description: 'Current stock levels for smartphones and tablets are suboptimal. AI analysis suggests adjusting inventory levels to reduce holding costs while maintaining service levels.',
        confidence: 94,
        affectedProducts: 23,
        estimatedSavings: 24500,
        implementationEffort: 'Medium',
        impact: {
          costSavings: '$24,500',
          inventoryReduction: '15%',
          serviceLevel: '97%',
          paybackPeriod: '2.3 months'
        },
        actions: [
          'Reduce iPhone 15 stock by 20 units',
          'Increase Samsung Galaxy stock by 12 units',
          'Implement dynamic reorder points'
        ],
        reasoning: 'Machine learning analysis of sales velocity and demand patterns',
        category: 'electronics'
      },
      {
        id: 'opt-2',
        type: 'reorder_points',
        priority: 'high',
        title: 'Adjust Reorder Points for Seasonal Items',
        description: 'Historical demand patterns indicate reorder points for seasonal items should be adjusted to prevent stockouts during peak periods.',
        confidence: 89,
        affectedProducts: 45,
        estimatedSavings: 18200,
        implementationEffort: 'Low',
        impact: {
          stockoutReduction: '78%',
          serviceImprovement: '12%',
          customerSatisfaction: '+8.5%',
          revenueIncrease: '$18,200'
        },
        actions: [
          'Increase winter clothing reorder points by 30%',
          'Implement seasonal multipliers',
          'Set up automated alerts'
        ],
        reasoning: 'Seasonal demand analysis with weather correlation',
        category: 'clothing'
      },
      {
        id: 'opt-3',
        type: 'safety_stock',
        priority: 'medium',
        title: 'Optimize Safety Stock Calculations',
        description: 'Current safety stock calculations are based on static formulas. Dynamic safety stock based on demand variability will improve efficiency.',
        confidence: 87,
        affectedProducts: 89,
        estimatedSavings: 31800,
        implementationEffort: 'High',
        impact: {
          inventoryReduction: '$31,800',
          spaceUtilization: '+22%',
          carryingCosts: '-18%',
          fillRate: '99.2%'
        },
        actions: [
          'Implement variable safety stock formula',
          'Reduce safety stock for fast-moving items',
          'Increase safety stock for critical items'
        ],
        reasoning: 'Statistical analysis of demand variability patterns',
        category: 'all'
      },
      {
        id: 'opt-4',
        type: 'cost',
        priority: 'high',
        title: 'Supplier Contract Renegotiation',
        description: 'Analysis reveals opportunities to reduce procurement costs through supplier consolidation and bulk purchasing agreements.',
        confidence: 92,
        affectedProducts: 156,
        estimatedSavings: 42300,
        implementationEffort: 'Medium',
        impact: {
          costReduction: '$42,300',
          leadTimeImprovement: '2.5 days',
          qualityScore: '+15%',
          supplierRating: '4.8/5'
        },
        actions: [
          'Consolidate suppliers from 12 to 8',
          'Negotiate volume discounts',
          'Implement preferred vendor agreements'
        ],
        reasoning: 'Supplier performance and cost analysis',
        category: 'procurement'
      }
    ];

    const filteredRecommendations = type === 'all' 
      ? allRecommendations 
      : allRecommendations.filter(rec => rec.type === type);

    return {
      recommendations: filteredRecommendations,
      impactAnalysis: {
        totalPotentialSavings: filteredRecommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0),
        averageConfidence: Math.round(
          filteredRecommendations.reduce((sum, rec) => sum + rec.confidence, 0) / filteredRecommendations.length
        ),
        timeToValue: '2-6 months',
        riskLevel: 'low',
        implementationComplexity: 'medium'
      },
      implementationPlan: {
        phases: [
          {
            name: 'Quick Wins',
            duration: '1-2 weeks',
            recommendations: filteredRecommendations.filter(r => r.implementationEffort === 'Low').map(r => r.id)
          },
          {
            name: 'Medium Impact',
            duration: '1-2 months',
            recommendations: filteredRecommendations.filter(r => r.implementationEffort === 'Medium').map(r => r.id)
          },
          {
            name: 'Strategic Initiatives',
            duration: '3-6 months',
            recommendations: filteredRecommendations.filter(r => r.implementationEffort === 'High').map(r => r.id)
          }
        ]
      },
      insights: [
        {
          type: 'opportunity',
          description: `${filteredRecommendations.length} optimization opportunities identified`,
          priority: 'high'
        },
        {
          type: 'savings',
          description: `Potential annual savings of $${filteredRecommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0).toLocaleString()}`,
          priority: 'high'
        }
      ],
      generatedAt: Date.now()
    };
  }

  /**
   * Generate mock seasonal forecasting data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockSeasonalForecasting(params = {}) {
    const { timeHorizon = '12m', categories = null } = params;
    
    // Generate seasonal patterns based on historical retail data
    const seasonalPatterns = [
      {
        id: 'winter-electronics',
        season: 'winter',
        category: 'Electronics',
        peakMonths: ['November', 'December'],
        demandIncrease: 45,
        confidence: 94,
        historicalData: {
          year2023: { increase: 42, accuracy: 91 },
          year2024: { increase: 48, accuracy: 96 },
          year2025: { increase: 45, accuracy: 94 }
        },
        drivingFactors: ['Holiday shopping', 'Gift giving', 'Black Friday', 'End of year bonuses'],
        affectedProducts: ['Gaming Consoles', 'Smart TVs', 'Headphones', 'Smartphones'],
        recommendedActions: [
          'Increase stock levels by 40% in October',
          'Secure additional suppliers',
          'Plan promotional campaigns'
        ]
      },
      {
        id: 'spring-clothing',
        season: 'spring',
        category: 'Clothing & Fashion',
        peakMonths: ['March', 'April', 'May'],
        demandIncrease: 32,
        confidence: 87,
        historicalData: {
          year2023: { increase: 35, accuracy: 85 },
          year2024: { increase: 29, accuracy: 89 },
          year2025: { increase: 32, accuracy: 87 }
        },
        drivingFactors: ['Weather transition', 'Easter holiday', 'Spring break', 'Wedding season'],
        affectedProducts: ['Spring Jackets', 'Dresses', 'Casual Wear', 'Shoes'],
        recommendedActions: [
          'Launch spring collection early',
          'Clear winter inventory',
          'Focus on trending colors'
        ]
      },
      {
        id: 'summer-outdoors',
        season: 'summer',
        category: 'Sports & Outdoors',
        peakMonths: ['June', 'July', 'August'],
        demandIncrease: 78,
        confidence: 91,
        historicalData: {
          year2023: { increase: 75, accuracy: 88 },
          year2024: { increase: 82, accuracy: 93 },
          year2025: { increase: 78, accuracy: 91 }
        },
        drivingFactors: ['Summer vacation', 'Outdoor activities', 'Sports season', 'Pool season'],
        affectedProducts: ['Camping Gear', 'Sports Equipment', 'Pool Supplies', 'Outdoor Furniture'],
        recommendedActions: [
          'Stock up on popular outdoor items',
          'Partner with tourism businesses',
          'Plan summer promotions'
        ]
      },
      {
        id: 'autumn-home',
        season: 'autumn',
        category: 'Home & Garden',
        peakMonths: ['September', 'October'],
        demandIncrease: 28,
        confidence: 82,
        historicalData: {
          year2023: { increase: 25, accuracy: 79 },
          year2024: { increase: 31, accuracy: 84 },
          year2025: { increase: 28, accuracy: 82 }
        },
        drivingFactors: ['Back to school', 'Home preparation', 'Garden maintenance', 'Holiday prep'],
        affectedProducts: ['Home Decor', 'Gardening Tools', 'Heating Equipment', 'Storage Solutions'],
        recommendedActions: [
          'Focus on home comfort items',
          'Prepare for heating season',
          'Market organization products'
        ]
      },
      {
        id: 'holiday-gifting',
        season: 'holiday',
        category: 'All Categories',
        peakMonths: ['November', 'December'],
        demandIncrease: 156,
        confidence: 96,
        historicalData: {
          year2023: { increase: 149, accuracy: 95 },
          year2024: { increase: 163, accuracy: 97 },
          year2025: { increase: 156, accuracy: 96 }
        },
        drivingFactors: ['Christmas shopping', 'Holiday parties', 'Gift giving', 'Year-end celebrations'],
        affectedProducts: ['Gift Cards', 'Jewelry', 'Toys', 'Books', 'Food & Beverages'],
        recommendedActions: [
          'Increase inventory across all categories',
          'Enhance gift wrapping services',
          'Extend operating hours'
        ]
      }
    ];

    // Generate demand forecast periods
    const months = timeHorizon === '6m' ? 6 : timeHorizon === '12m' ? 12 : timeHorizon === '18m' ? 18 : 24;
    const forecastPeriods = [];
    
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      const month = date.getMonth();
      const monthName = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      
      // Calculate seasonal multiplier based on patterns
      const seasonalMultiplier = this.calculateSeasonalMultiplier(month);
      const baselineDemand = 1000;
      const forecastedDemand = Math.round(baselineDemand * seasonalMultiplier);
      
      // Add some realistic variance
      const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
      const adjustedDemand = Math.round(forecastedDemand * (1 + variance));
      
      forecastPeriods.push({
        period: `${monthName} ${year}`,
        month: monthName,
        year: year,
        baseline: baselineDemand,
        forecasted: adjustedDemand,
        seasonalMultiplier: seasonalMultiplier,
        trendPercentage: ((seasonalMultiplier - 1) * 100).toFixed(1),
        confidence: Math.round(85 + Math.random() * 10), // 85-95% confidence
        factors: this.getSeasonalFactors(month),
        categories: this.getCategoryForecasts(month, baselineDemand)
      });
    }

    return {
      forecasting: {
        periods: forecastPeriods,
        overallAccuracy: 89,
        confidenceRange: '85-95%',
        lastUpdated: Date.now(),
        modelVersion: '2.1.0',
        trainingData: '5 years historical data'
      },
      patterns: seasonalPatterns.filter(pattern => 
        !categories || categories.includes(pattern.category) || pattern.category === 'All Categories'
      ),
      insights: [
        {
          type: 'trend',
          title: 'Strong Holiday Season Expected',
          description: 'Forecasting shows 156% increase in demand during November-December',
          confidence: 96,
          impact: 'high',
          actionable: true,
          recommendation: 'Begin inventory buildup in September'
        },
        {
          type: 'opportunity',
          title: 'Summer Sports Equipment Surge',
          description: 'Sports & outdoors category showing 78% seasonal increase',
          confidence: 91,
          impact: 'medium',
          actionable: true,
          recommendation: 'Partner with local sports organizations'
        },
        {
          type: 'warning',
          title: 'Winter Clothing Clearance Needed',
          description: 'Post-winter demand drops significantly, plan clearance sales',
          confidence: 88,
          impact: 'medium',
          actionable: true,
          recommendation: 'Start clearance sales in February'
        }
      ],
      recommendations: [
        {
          id: 'seasonal-1',
          title: 'Optimize Holiday Inventory',
          description: 'Increase inventory levels by 40-60% for November-December peak',
          priority: 'high',
          estimatedImpact: '$125,000 additional revenue',
          implementation: 'Begin October 1st',
          confidence: 96
        },
        {
          id: 'seasonal-2',
          title: 'Summer Outdoor Expansion',
          description: 'Expand sports and outdoor equipment selection for summer season',
          priority: 'medium',
          estimatedImpact: '$45,000 additional revenue',
          implementation: 'Begin May 1st',
          confidence: 91
        },
        {
          id: 'seasonal-3',
          title: 'Spring Fashion Focus',
          description: 'Launch targeted spring fashion campaigns in March-April',
          priority: 'medium',
          estimatedImpact: '$32,000 additional revenue',
          implementation: 'Begin February 15th',
          confidence: 87
        }
      ],
      summary: {
        overallTrend: 18.5,
        peakSeason: 'Holiday (Nov-Dec)',
        expectedIncrease: '156%',
        riskLevel: 'low',
        forecastReliability: 89,
        keyOpportunities: 3,
        seasonalImpact: 'high'
      },
      generatedAt: Date.now()
    };
  }

  /**
   * Calculate seasonal demand multiplier for a given month
   * @param {number} month - Month (0-11)
   * @returns {number} Seasonal multiplier
   */
  calculateSeasonalMultiplier(month) {
    const seasonalPatterns = {
      0: 0.75,  // January - post-holiday slowdown
      1: 0.85,  // February - gradual recovery
      2: 1.15,  // March - spring surge
      3: 1.20,  // April - spring peak
      4: 1.10,  // May - spring maintenance
      5: 1.35,  // June - summer start
      6: 1.40,  // July - summer peak
      7: 1.30,  // August - back to school
      8: 1.05,  // September - autumn start
      9: 1.10,  // October - autumn activities
      10: 1.45, // November - holiday prep
      11: 2.20  // December - holiday peak
    };
    
    return seasonalPatterns[month] || 1.0;
  }

  /**
   * Get seasonal factors for a given month
   * @param {number} month - Month (0-11)
   * @returns {Array} Seasonal factors
   */
  getSeasonalFactors(month) {
    const factorsByMonth = {
      0: ['Post-holiday recovery', 'New Year resolutions', 'January sales'],
      1: ['Valentine\'s Day', 'Winter sports', 'Indoor activities'],
      2: ['Spring preparation', 'Easter shopping', 'Garden planning'],
      3: ['Easter holiday', 'Spring cleaning', 'Wardrobe refresh'],
      4: ['Mother\'s Day', 'Graduation season', 'Wedding planning'],
      5: ['Summer vacation prep', 'Father\'s Day', 'Outdoor activities start'],
      6: ['Peak summer', 'Vacation season', 'BBQ and outdoor dining'],
      7: ['Back to school prep', 'Late summer activities', 'Vacation end'],
      8: ['Back to school', 'Fall preparation', 'Home organization'],
      9: ['Halloween prep', 'Autumn activities', 'Home comfort'],
      10: ['Thanksgiving', 'Black Friday', 'Holiday shopping starts'],
      11: ['Christmas shopping', 'Holiday parties', 'Year-end celebrations']
    };
    
    return factorsByMonth[month] || ['Seasonal variation'];
  }

  /**
   * Get category-specific forecasts for a given month
   * @param {number} month - Month (0-11)
   * @param {number} baseline - Baseline demand
   * @returns {Object} Category forecasts
   */
  getCategoryForecasts(month, baseline) {
    const categories = {
      electronics: this.calculateSeasonalMultiplier(month) * (month === 11 ? 1.5 : 1.0),
      clothing: this.calculateSeasonalMultiplier(month) * ([2,3,4].includes(month) ? 1.3 : 1.0),
      home_garden: this.calculateSeasonalMultiplier(month) * ([8,9].includes(month) ? 1.2 : 1.0),
      sports_outdoors: this.calculateSeasonalMultiplier(month) * ([5,6,7].includes(month) ? 1.6 : 1.0),
      food_beverages: this.calculateSeasonalMultiplier(month) * ([10,11].includes(month) ? 1.4 : 1.0)
    };
    
    const result = {};
    Object.entries(categories).forEach(([category, multiplier]) => {
      result[category] = Math.round(baseline * multiplier);
    });
    
    return result;
  }

  /**
   * Generate seasonal insights
   * @param {Object} forecasting - Forecasting data
   * @param {Object} patterns - Seasonal patterns
   * @returns {Array} Insights
   */
  generateSeasonalInsights(forecasting, patterns) {
    return [
      { type: 'seasonal', description: 'Seasonal forecasting analysis available' }
    ];
  }

  /**
   * Generate seasonal recommendations
   * @param {Object} forecasting - Forecasting data
   * @returns {Array} Recommendations
   */
  generateSeasonalRecommendations(forecasting) {
    return [
      { type: 'seasonal_recommendation', description: 'Review seasonal recommendations' }
    ];
  }

  /**
   * Get cost analysis and margin optimization data
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} Cost analysis data
   */
  async getCostAnalysis(params = {}) {
    const {
      analysisType = 'overview',
      timeRange = '12m',
      categories = null,
      includeOptimizations = true,
      includeProfitability = true
    } = params;

    const cacheKey = `cost_analysis_${analysisType}_${timeRange}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockCostAnalysis(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock cost analysis data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [costAnalysis, optimizations, profitability] = await Promise.allSettled([
          httpService.get('/analytics/cost-analysis', {
            analysisType,
            timeRange,
            categories,
            includeBreakdown: true
          }),
          includeOptimizations ? httpService.get('/analytics/cost-optimizations', {
            analysisType,
            includeRecommendations: true
          }) : Promise.resolve(null),
          includeProfitability ? httpService.get('/analytics/profitability', {
            timeRange,
            includeMargins: true
          }) : Promise.resolve(null)
        ]);

        const result = {
          costAnalysis: costAnalysis.status === 'fulfilled' ? costAnalysis.value : null,
          optimizations: optimizations.status === 'fulfilled' ? optimizations.value : null,
          profitability: profitability.status === 'fulfilled' ? profitability.value : null,
          insights: this.generateCostInsights(costAnalysis.value),
          recommendations: this.generateCostRecommendations(costAnalysis.value),
          generatedAt: Date.now()
        };

        this.setCachedData(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Cost analysis fetch failed', apiError);
      }
    }
  }

  /**
   * Generate mock cost analysis data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockCostAnalysis(params = {}) {
    const { analysisType = 'overview', categories = null } = params;
    
    const costBreakdown = [
      {
        id: 'procurement',
        category: 'procurement',
        name: 'Procurement Costs',
        amount: 285600,
        percentage: 42.5,
        trend: -2.3,
        margin: 28.5,
        efficiency: 82,
        optimizationPotential: 34500
      },
      {
        id: 'operations',
        category: 'operations', 
        name: 'Operations',
        amount: 156800,
        percentage: 23.3,
        trend: 1.8,
        margin: 35.2,
        efficiency: 76,
        optimizationPotential: 11800
      },
      {
        id: 'overhead',
        category: 'overhead',
        name: 'Overhead',
        amount: 98400,
        percentage: 14.6,
        trend: -0.5,
        margin: 18.7,
        efficiency: 71,
        optimizationPotential: 8200
      },
      {
        id: 'shipping',
        category: 'shipping',
        name: 'Shipping & Logistics',
        amount: 78200,
        percentage: 11.6,
        trend: 3.2,
        margin: 22.1,
        efficiency: 84,
        optimizationPotential: 15600
      },
      {
        id: 'storage',
        category: 'storage',
        name: 'Storage & Handling',
        amount: 54000,
        percentage: 8.0,
        trend: -1.2,
        margin: 31.8,
        efficiency: 79,
        optimizationPotential: 27300
      }
    ];

    const optimizations = [
      {
        id: 'bulk-discount',
        title: 'Negotiate Better Bulk Discounts',
        description: 'Consolidate orders with top 3 suppliers to achieve tier-3 pricing discounts of 8-12%',
        impact: 'high',
        priority: 'high',
        estimatedSavings: 34500,
        implementation: 'Medium complexity',
        timeframe: '2-3 months',
        confidence: 92,
        category: 'procurement',
        roi: 285
      },
      {
        id: 'shipping-optimization',
        title: 'Optimize Shipping Routes',
        description: 'Implement zone skipping and route optimization to reduce shipping costs by 15-20%',
        impact: 'high',
        priority: 'medium',
        estimatedSavings: 15600,
        implementation: 'Low complexity',
        timeframe: '1 month',
        confidence: 88,
        category: 'shipping',
        roi: 195
      },
      {
        id: 'inventory-reduction',
        title: 'Reduce Dead Stock Carrying Costs',
        description: 'Identify and liquidate slow-moving inventory to reduce storage costs and free up capital',
        impact: 'medium',
        priority: 'high',
        estimatedSavings: 27300,
        implementation: 'Low complexity',
        timeframe: '2 weeks',
        confidence: 95,
        category: 'storage',
        roi: 456
      }
    ];

    return {
      costBreakdown: costBreakdown,
      optimizations: optimizations,
      profitability: {
        grossMargin: 32.8,
        netMargin: 18.5,
        contributionMargin: 45.2,
        breakEvenPoint: 156780,
        roi: 24.3
      },
      summary: {
        totalCosts: 673000,
        potentialSavings: 107900,
        optimizationOpportunities: 5,
        averageMargin: 27.3,
        costEfficiencyScore: 78
      },
      generatedAt: Date.now()
    };
  }

  /**
   * Generate cost insights
   * @param {Object} costAnalysis - Cost analysis data
   * @returns {Array} Insights
   */
  generateCostInsights(costAnalysis) {
    return [
      { type: 'cost_insight', description: 'Cost analysis insights available' }
    ];
  }

  /**
   * Generate cost recommendations
   * @param {Object} costAnalysis - Cost analysis data
   * @returns {Array} Recommendations
   */
  generateCostRecommendations(costAnalysis) {
    return [
      { type: 'cost_recommendation', description: 'Review cost optimization recommendations' }
    ];
  }

  /**
   * Get products catalog data
   * @param {Object} params - Catalog parameters
   * @returns {Promise<Object>} Products data
   */
  async getProductsCatalog(params = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = null,
      status = null,
      sortBy = 'name',
      sortOrder = 'asc',
      includeMetrics = true
    } = params;

    const cacheKey = `products_catalog_${page}_${limit}_${search}_${category}_${status}_${sortBy}_${sortOrder}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockProductsCatalog(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock products catalog data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [products, categories, metrics] = await Promise.allSettled([
          httpService.get('/products', {
            page,
            limit,
            search,
            category,
            status,
            sortBy,
            sortOrder
          }),
          httpService.get('/products/categories'),
          includeMetrics ? httpService.get('/products/metrics') : Promise.resolve(null)
        ]);

        const result = {
          products: products.status === 'fulfilled' ? products.value : null,
          categories: categories.status === 'fulfilled' ? categories.value : null,
          metrics: metrics.status === 'fulfilled' ? metrics.value : null,
          pagination: this.generatePaginationInfo(products.value, page, limit),
          insights: this.generateProductInsights(products.value),
          generatedAt: Date.now()
        };

        this.setCachedData(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Products catalog fetch failed', apiError);
      }
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    try {
      this.validateProduct(productData);
      
      // TODO: Replace with real API call
      const response = await httpService.post('/products', productData);
      
      // Clear related caches
      this.clearProductCaches();
      
      return response;
    } catch (error) {
      throw this.handleInventoryError('Product creation failed', error);
    }
  }

  /**
   * Update an existing product
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productId, productData) {
    try {
      this.validateProduct(productData);
      
      // TODO: Replace with real API call
      const response = await httpService.put(`/products/${productId}`, productData);
      
      // Clear related caches
      this.clearProductCaches();
      
      return response;
    } catch (error) {
      throw this.handleInventoryError('Product update failed', error);
    }
  }

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise<void>}
   */
  async deleteProduct(productId) {
    try {
      // TODO: Replace with real API call
      await httpService.delete(`/products/${productId}`);
      
      // Clear related caches
      this.clearProductCaches();
    } catch (error) {
      throw this.handleInventoryError('Product deletion failed', error);
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Array>}
   */
  async getCategories() {
    try {
      // TODO: Replace with real API call
      // const categories = await httpService.get('/categories');
      
      // Return mock data for now
      const mockCategories = this.getMockCategories();
      
      return mockCategories;
    } catch (error) {
      throw this.handleInventoryError('Failed to fetch categories', error);
    }
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>}
   */
  async createCategory(categoryData) {
    try {
      // TODO: Replace with real API call
      // const category = await httpService.post('/categories', categoryData);
      
      // Simulate API call
      await this.simulateApiDelay();
      
      const newCategory = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...categoryData,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newCategory;
    } catch (error) {
      throw this.handleInventoryError('Category creation failed', error);
    }
  }

  /**
   * Update a category
   * @param {string} categoryId - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>}
   */
  async updateCategory(categoryId, categoryData) {
    try {
      // TODO: Replace with real API call
      // const category = await httpService.put(`/categories/${categoryId}`, categoryData);
      
      // Simulate API call
      await this.simulateApiDelay();
      
      const updatedCategory = {
        id: categoryId,
        ...categoryData,
        updatedAt: new Date().toISOString()
      };
      
      return updatedCategory;
    } catch (error) {
      throw this.handleInventoryError('Category update failed', error);
    }
  }

  /**
   * Delete a category
   * @param {string} categoryId - Category ID
   * @returns {Promise<void>}
   */
  async deleteCategory(categoryId) {
    try {
      // TODO: Replace with real API call
      await httpService.delete(`/categories/${categoryId}`);
      
      // Clear related caches
      this.clearProductCaches();
    } catch (error) {
      throw this.handleInventoryError('Category deletion failed', error);
    }
  }

  /**
   * Get all tags
   * @returns {Promise<Array>}
   */
  async getTags() {
    try {
      // TODO: Replace with real API call
      // const tags = await httpService.get('/tags');
      
      // Return mock data for now
      const mockTags = this.getMockTags();
      
      return mockTags;
    } catch (error) {
      throw this.handleInventoryError('Failed to fetch tags', error);
    }
  }

  /**
   * Create a new tag
   * @param {Object} tagData - Tag data
   * @returns {Promise<Object>}
   */
  async createTag(tagData) {
    try {
      // TODO: Replace with real API call
      // const tag = await httpService.post('/tags', tagData);
      
      // Simulate API call
      await this.simulateApiDelay();
      
      const newTag = {
        id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...tagData,
        productCount: 0,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newTag;
    } catch (error) {
      throw this.handleInventoryError('Tag creation failed', error);
    }
  }

  /**
   * Update a tag
   * @param {string} tagId - Tag ID
   * @param {Object} tagData - Updated tag data
   * @returns {Promise<Object>}
   */
  async updateTag(tagId, tagData) {
    try {
      // TODO: Replace with real API call
      // const tag = await httpService.put(`/tags/${tagId}`, tagData);
      
      // Simulate API call
      await this.simulateApiDelay();
      
      const updatedTag = {
        id: tagId,
        ...tagData,
        updatedAt: new Date().toISOString()
      };
      
      return updatedTag;
    } catch (error) {
      throw this.handleInventoryError('Tag update failed', error);
    }
  }

  /**
   * Delete a tag
   * @param {string} tagId - Tag ID
   * @returns {Promise<void>}
   */
  async deleteTag(tagId) {
    try {
      // TODO: Replace with real API call
      await httpService.delete(`/tags/${tagId}`);
      
      // Clear related caches
      this.clearProductCaches();
    } catch (error) {
      throw this.handleInventoryError('Tag deletion failed', error);
    }
  }

  /**
   * Generate mock categories data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockCategories() {
    const categories = [
      {
        id: 'cat-001',
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        color: '#0ea5e9',
        icon: 'smartphone',
        parentId: null,
        productCount: 45,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'cat-002', 
        name: 'Clothing & Apparel',
        description: 'Fashion items, clothing, and accessories',
        color: '#f59e0b',
        icon: 'shirt',
        parentId: null,
        productCount: 128,
        createdAt: '2024-01-16T14:20:00Z',
        updatedAt: '2024-01-16T14:20:00Z'
      },
      {
        id: 'cat-003',
        name: 'Food & Beverages',
        description: 'Consumable food items and drinks',
        color: '#10b981',
        icon: 'coffee',
        parentId: null,
        productCount: 89,
        createdAt: '2024-01-17T09:15:00Z',
        updatedAt: '2024-01-17T09:15:00Z'
      },
      {
        id: 'cat-004',
        name: 'Home & Garden',
        description: 'Home improvement and gardening supplies',
        color: '#8b5cf6',
        icon: 'home',
        parentId: null,
        productCount: 76,
        createdAt: '2024-01-18T16:45:00Z',
        updatedAt: '2024-01-18T16:45:00Z'
      },
      {
        id: 'cat-005',
        name: 'Books & Media',
        description: 'Books, magazines, and digital media',
        color: '#ef4444',
        icon: 'book',
        parentId: null,
        productCount: 34,
        createdAt: '2024-01-19T11:30:00Z',
        updatedAt: '2024-01-19T11:30:00Z'
      },
      {
        id: 'cat-006',
        name: 'Smartphones',
        description: 'Mobile phones and accessories',
        color: '#0ea5e9',
        icon: 'smartphone',
        parentId: 'cat-001',
        productCount: 23,
        createdAt: '2024-01-20T13:20:00Z',
        updatedAt: '2024-01-20T13:20:00Z'
      },
      {
        id: 'cat-007',
        name: 'Laptops & Computers',
        description: 'Computing devices and peripherals',
        color: '#0ea5e9',
        icon: 'laptop',
        parentId: 'cat-001',
        productCount: 18,
        createdAt: '2024-01-21T15:10:00Z',
        updatedAt: '2024-01-21T15:10:00Z'
      },
      {
        id: 'cat-008',
        name: 'Men\'s Clothing',
        description: 'Clothing items for men',
        color: '#f59e0b',
        icon: 'shirt',
        parentId: 'cat-002',
        productCount: 67,
        createdAt: '2024-01-22T12:00:00Z',
        updatedAt: '2024-01-22T12:00:00Z'
      }
    ];

    return categories;
  }

  /**
   * Generate mock tags data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockTags() {
    const tags = [
      {
        id: 'tag-001',
        name: 'bestseller',
        description: 'Top-selling products',
        color: '#f59e0b',
        icon: 'star',
        productCount: 23,
        usageCount: 156,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-02-01T14:20:00Z'
      },
      {
        id: 'tag-002',
        name: 'new-arrival',
        description: 'Recently added products',
        color: '#10b981',
        icon: 'zap',
        productCount: 45,
        usageCount: 89,
        createdAt: '2024-01-16T14:20:00Z',
        updatedAt: '2024-02-05T09:15:00Z'
      },
      {
        id: 'tag-003',
        name: 'sale',
        description: 'Items currently on sale',
        color: '#ef4444',
        icon: 'tag',
        productCount: 67,
        usageCount: 234,
        createdAt: '2024-01-17T09:15:00Z',
        updatedAt: '2024-02-10T16:45:00Z'
      },
      {
        id: 'tag-004',
        name: 'premium',
        description: 'High-end premium products',
        color: '#8b5cf6',
        icon: 'crown',
        productCount: 12,
        usageCount: 67,
        createdAt: '2024-01-18T16:45:00Z',
        updatedAt: '2024-01-25T11:30:00Z'
      },
      {
        id: 'tag-005',
        name: 'eco-friendly',
        description: 'Environmentally conscious products',
        color: '#059669',
        icon: 'leaf',
        productCount: 34,
        usageCount: 145,
        createdAt: '2024-01-19T11:30:00Z',
        updatedAt: '2024-02-01T13:20:00Z'
      },
      {
        id: 'tag-006',
        name: 'limited-edition',
        description: 'Limited availability products',
        color: '#dc2626',
        icon: 'zap',
        productCount: 8,
        usageCount: 32,
        createdAt: '2024-01-20T13:20:00Z',
        updatedAt: '2024-01-28T15:10:00Z'
      },
      {
        id: 'tag-007',
        name: 'bundle-deal',
        description: 'Products sold as bundles',
        color: '#0369a1',
        icon: 'package',
        productCount: 15,
        usageCount: 78,
        createdAt: '2024-01-21T15:10:00Z',
        updatedAt: '2024-02-03T12:00:00Z'
      },
      {
        id: 'tag-008',
        name: 'trending',
        description: 'Currently trending products',
        color: '#ea580c',
        icon: 'trending-up',
        productCount: 29,
        usageCount: 187,
        createdAt: '2024-01-22T12:00:00Z',
        updatedAt: '2024-02-08T10:45:00Z'
      }
    ];

    return tags;
  }

  /**
   * Generate mock products catalog data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockProductsCatalog(params = {}) {
    const { search = '', category = null, status = null } = params;
    
    const mockProducts = [
      {
        id: 'prod-001',
        sku: 'ELEC-001',
        name: 'iPhone 15 Pro Max',
        description: 'Latest flagship smartphone with advanced camera system and titanium design',
        category: 'Electronics',
        price: 1199.99,
        cost: 850.00,
        stock: 45,
        reorderPoint: 10,
        supplier: 'Apple Inc.',
        status: 'in_stock',
        image: null,
        lastOrderDate: '2025-01-15',
        salesVelocity: 8.5,
        profitMargin: 29.2,
        barcode: '123456789012',
        weight: 221,
        dimensions: '6.7 × 3.0 × 0.33 in',
        tags: ['premium', 'smartphone', 'apple'],
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z'
      },
      {
        id: 'prod-002',
        sku: 'CLTH-001',
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality 100% cotton t-shirt in various colors and sizes',
        category: 'Clothing',
        price: 29.99,
        cost: 12.50,
        stock: 8,
        reorderPoint: 20,
        supplier: 'Fashion Co.',
        status: 'low_stock',
        image: null,
        lastOrderDate: '2025-01-10',
        salesVelocity: 15.2,
        profitMargin: 58.3,
        barcode: '234567890123',
        weight: 180,
        dimensions: 'S, M, L, XL',
        tags: ['clothing', 'cotton', 'basic'],
        createdAt: '2024-11-15T00:00:00Z',
        updatedAt: '2025-01-10T14:20:00Z'
      },
      {
        id: 'prod-003',
        sku: 'HOME-001',
        name: 'Smart Home Hub',
        description: 'Central control hub for all smart home devices with voice control',
        category: 'Home & Garden',
        price: 149.99,
        cost: 89.00,
        stock: 0,
        reorderPoint: 5,
        supplier: 'Smart Tech Ltd.',
        status: 'out_of_stock',
        image: null,
        lastOrderDate: '2025-01-08',
        salesVelocity: 4.8,
        profitMargin: 40.7,
        barcode: '345678901234',
        weight: 450,
        dimensions: '5.5 × 5.5 × 1.2 in',
        tags: ['smart-home', 'hub', 'iot'],
        createdAt: '2024-10-20T00:00:00Z',
        updatedAt: '2025-01-08T09:15:00Z'
      },
      {
        id: 'prod-004',
        sku: 'BOOK-001',
        name: 'The Art of Programming',
        description: 'Comprehensive guide to modern programming techniques and best practices',
        category: 'Books',
        price: 49.99,
        cost: 20.00,
        stock: 156,
        reorderPoint: 25,
        supplier: 'Tech Books Publisher',
        status: 'in_stock',
        image: null,
        lastOrderDate: '2025-01-12',
        salesVelocity: 3.2,
        profitMargin: 60.0,
        barcode: '456789012345',
        weight: 680,
        dimensions: '9.2 × 7.4 × 1.8 in',
        tags: ['books', 'programming', 'education'],
        createdAt: '2024-09-10T00:00:00Z',
        updatedAt: '2025-01-12T11:45:00Z'
      },
      {
        id: 'prod-005',
        sku: 'SPORT-001',
        name: 'Professional Tennis Racket',
        description: 'High-performance carbon fiber tennis racket for professional players',
        category: 'Sports',
        price: 299.99,
        cost: 180.00,
        stock: 23,
        reorderPoint: 8,
        supplier: 'Sports Equipment Pro',
        status: 'in_stock',
        image: null,
        lastOrderDate: '2025-01-14',
        salesVelocity: 2.1,
        profitMargin: 40.0,
        barcode: '567890123456',
        weight: 310,
        dimensions: '27 × 11 × 1 in',
        tags: ['sports', 'tennis', 'professional'],
        createdAt: '2024-08-05T00:00:00Z',
        updatedAt: '2025-01-14T16:20:00Z'
      },
      {
        id: 'prod-006',
        sku: 'DISC-001',
        name: 'Vintage Vinyl Collection',
        description: 'Classic rock vinyl records from the 1970s - discontinued item',
        category: 'Music',
        price: 89.99,
        cost: 45.00,
        stock: 3,
        reorderPoint: 0,
        supplier: 'Vintage Music Store',
        status: 'discontinued',
        image: null,
        lastOrderDate: '2024-12-20',
        salesVelocity: 0.8,
        profitMargin: 50.0,
        barcode: '678901234567',
        weight: 180,
        dimensions: '12.2 × 12.2 × 0.3 in',
        tags: ['music', 'vintage', 'vinyl'],
        createdAt: '2024-07-01T00:00:00Z',
        updatedAt: '2024-12-20T13:10:00Z'
      }
    ];

    // Apply filters
    let filteredProducts = mockProducts;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    if (status && status !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.status === status);
    }

    return {
      products: filteredProducts,
      categories: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Music'],
      metrics: {
        totalProducts: filteredProducts.length,
        inStock: filteredProducts.filter(p => p.status === 'in_stock').length,
        lowStock: filteredProducts.filter(p => p.status === 'low_stock').length,
        outOfStock: filteredProducts.filter(p => p.status === 'out_of_stock').length,
        discontinued: filteredProducts.filter(p => p.status === 'discontinued').length,
        totalValue: filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0),
        averageMargin: filteredProducts.reduce((sum, p) => sum + p.profitMargin, 0) / filteredProducts.length
      },
      pagination: {
        currentPage: params.page || 1,
        totalPages: Math.ceil(filteredProducts.length / (params.limit || 20)),
        totalItems: filteredProducts.length,
        itemsPerPage: params.limit || 20
      },
      insights: [
        {
          type: 'stock_alert',
          title: 'Low Stock Items Detected',
          description: `${filteredProducts.filter(p => p.status === 'low_stock').length} products are running low on stock`,
          priority: 'high',
          actionable: true
        },
        {
          type: 'performance',
          title: 'High Velocity Products',
          description: `${filteredProducts.filter(p => p.salesVelocity > 5).length} products showing strong sales performance`,
          priority: 'medium',
          actionable: false
        }
      ],
      generatedAt: Date.now()
    };
  }

  /**
   * Validate product data
   * @param {Object} productData - Product data to validate
   */
  validateProduct(productData) {
    const required = ['name', 'sku', 'price', 'cost', 'category'];
    
    for (const field of required) {
      if (!productData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    if (productData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (productData.cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    if (productData.stock < 0) {
      throw new Error('Stock cannot be negative');
    }
  }

  /**
   * Clear product-related caches
   */
  clearProductCaches() {
    // Clear all product-related cache entries
    const cacheKeys = Object.keys(this.cache).filter(key => 
      key.startsWith('products_catalog_') || 
      key.startsWith('product_') ||
      key.startsWith('inventory_')
    );
    
    cacheKeys.forEach(key => {
      delete this.cache[key];
    });
  }

  /**
   * Generate pagination information
   * @param {Object} productsResponse - Products API response
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @returns {Object} Pagination info
   */
  generatePaginationInfo(productsResponse, page, limit) {
    return {
      currentPage: page,
      totalPages: Math.ceil((productsResponse?.total || 0) / limit),
      totalItems: productsResponse?.total || 0,
      itemsPerPage: limit
    };
  }

  /**
   * Generate product insights
   * @param {Object} productsData - Products data
   * @returns {Array} Insights
   */
  generateProductInsights(productsData) {
    return [
      { type: 'product_insight', description: 'Product insights available' }
    ];
  }

  /**
   * Get price history for a product
   * @param {string} productId - Product ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Price history data
   */
  async getPriceHistory(productId, params = {}) {
    const {
      timeframe = '3months',
      includeCompetitorData = true,
      includeAnalysis = true
    } = params;

    const cacheKey = `price_history_${productId}_${timeframe}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    try {
      const mockData = this.getMockPriceHistory(productId, params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      throw this.handleInventoryError('Price history fetch failed', error);
    }
  }

  /**
   * Update product price with tracking
   * @param {string} productId - Product ID
   * @param {Object} priceUpdate - Price update data
   * @returns {Promise<Object>} Update response
   */
  async updateProductPrice(productId, priceUpdate) {
    const {
      newPrice,
      reason,
      effectiveDate = new Date().toISOString(),
      notifyCustomers = false,
      temporary = false,
      endDate = null
    } = priceUpdate;

    try {
      this.validatePriceUpdate(priceUpdate);

      const response = await httpService.put(`/inventory/products/${productId}/price`, {
        newPrice,
        reason,
        effectiveDate,
        notifyCustomers,
        temporary,
        endDate,
        updatedAt: new Date().toISOString()
      });

      // Clear relevant caches
      this.clearPriceHistoryCache(productId);

      return {
        ...response,
        analysis: this.analyzePriceImpact(response),
        recommendations: this.generatePriceRecommendations(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Price update failed', error);
    }
  }

  /**
   * Get pricing optimization recommendations
   * @param {string} productId - Product ID (optional)
   * @param {Object} params - Parameters
   * @returns {Promise<Object>} Optimization recommendations
   */
  async getPricingOptimization(productId = null, params = {}) {
    const {
      analysisType = 'comprehensive',
      includeCompetitorAnalysis = true,
      includeSeasonalTrends = true,
      optimizationGoals = ['profit', 'volume']
    } = params;

    const cacheKey = `pricing_optimization_${productId || 'all'}_${analysisType}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    try {
      const mockData = this.getMockPricingOptimization(productId, params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      throw this.handleInventoryError('Pricing optimization fetch failed', error);
    }
  }

  /**
   * Get price analytics and trends
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} Price analytics
   */
  async getPriceAnalytics(params = {}) {
    const {
      timeframe = '6months',
      categories = [],
      includeForecasts = true,
      includeInsights = true
    } = params;

    const cacheKey = `price_analytics_${timeframe}_${categories.join(',')}}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    try {
      const mockData = this.getMockPriceAnalytics(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      throw this.handleInventoryError('Price analytics fetch failed', error);
    }
  }

  /**
   * Generate mock price history data
   * @param {string} productId - Product ID
   * @param {Object} params - Parameters
   * @returns {Object} Mock price history
   */
  getMockPriceHistory(productId, params = {}) {
    const { timeframe = '3months' } = params;
    
    // Generate dates based on timeframe
    const periods = {
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365
    };
    
    const days = periods[timeframe] || 90;
    const now = new Date();
    const basePrice = 89.99;
    
    const history = [];
    for (let i = days; i >= 0; i -= 3) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const price = Math.max(basePrice * (1 + variation), basePrice * 0.7);
      
      history.push({
        date: date.toISOString(),
        price: Math.round(price * 100) / 100,
        reason: i === 0 ? 'Current Price' : this.getRandomPriceReason(),
        volume: Math.floor(Math.random() * 100) + 20,
        margin: Math.round((price - 45.50) / price * 100 * 100) / 100
      });
    }

    const currentPrice = history[history.length - 1].price;
    const previousPrice = history[history.length - 7]?.price || currentPrice;
    
    return {
      productId,
      productName: 'Premium Coffee Beans - 1kg',
      sku: 'COFFEE-PREM-1KG',
      currentPrice,
      currency: 'ILS',
      history,
      summary: {
        averagePrice: history.reduce((sum, item) => sum + item.price, 0) / history.length,
        highestPrice: Math.max(...history.map(item => item.price)),
        lowestPrice: Math.min(...history.map(item => item.price)),
        priceChanges: history.length - 1,
        trend: currentPrice > previousPrice ? 'increasing' : currentPrice < previousPrice ? 'decreasing' : 'stable',
        volatility: this.calculatePriceVolatility(history)
      },
      competitorData: this.getMockCompetitorPrices(),
      analysis: this.getMockPriceAnalysis(history),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate mock pricing optimization data
   * @param {string} productId - Product ID
   * @param {Object} params - Parameters
   * @returns {Object} Mock pricing optimization
   */
  getMockPricingOptimization(productId, params = {}) {
    const currentPrice = 89.99;
    const cost = 45.50;
    
    return {
      productId,
      currentPrice,
      cost,
      currentMargin: Math.round((currentPrice - cost) / currentPrice * 100),
      recommendations: [
        {
          id: 'opt-001',
          type: 'price_increase',
          title: 'Optimal Price Increase',
          description: 'Increase price by 8.3% to maximize profit while maintaining sales volume',
          recommendedPrice: 97.49,
          expectedImpact: {
            revenueChange: '+12.4%',
            volumeChange: '-3.2%',
            profitChange: '+18.7%'
          },
          confidence: 87,
          reasoning: 'Price elasticity analysis shows low sensitivity in this category',
          timeframe: 'Implement within 2 weeks',
          priority: 'high'
        },
        {
          id: 'opt-002',
          type: 'seasonal_pricing',
          title: 'Seasonal Adjustment',
          description: 'Implement dynamic pricing for peak coffee season',
          recommendedPrice: 94.99,
          expectedImpact: {
            revenueChange: '+8.1%',
            volumeChange: '+2.4%',
            profitChange: '+11.3%'
          },
          confidence: 76,
          reasoning: 'Historical data shows 15% higher demand October-February',
          timeframe: 'Start October 1st',
          priority: 'medium'
        },
        {
          id: 'opt-003',
          type: 'competitive_adjustment',
          title: 'Competitive Positioning',
          description: 'Adjust pricing to maintain premium positioning vs competitors',
          recommendedPrice: 92.99,
          expectedImpact: {
            revenueChange: '+5.2%',
            volumeChange: '+4.1%',
            profitChange: '+7.8%'
          },
          confidence: 91,
          reasoning: 'Competitors averaging ₪85-88, maintain 8-10% premium',
          timeframe: 'Review monthly',
          priority: 'high'
        }
      ],
      marketAnalysis: {
        competitorRange: { min: 75.99, max: 95.99, average: 86.50 },
        marketPosition: 'Premium',
        priceElasticity: -1.2,
        demandForecast: '+6.3% next quarter'
      },
      aiInsights: [
        'Current pricing is slightly below optimal profit-maximizing level',
        'Strong brand loyalty allows for moderate price increases',
        'Seasonal patterns suggest implementing dynamic pricing',
        'Monitor competitor pricing changes weekly'
      ],
      lastAnalyzed: new Date().toISOString()
    };
  }

  /**
   * Generate mock price analytics data
   * @param {Object} params - Parameters
   * @returns {Object} Mock price analytics
   */
  getMockPriceAnalytics(params = {}) {
    const { timeframe = '6months' } = params;
    
    return {
      timeframe,
      overview: {
        totalProducts: 1247,
        avgPriceChange: '+3.2%',
        priceOptimizationOpportunities: 89,
        revenueImpact: '+₪127,450'
      },
      trends: {
        overallTrend: 'increasing',
        categoryTrends: [
          { category: 'Coffee & Beverages', trend: '+5.1%', products: 234 },
          { category: 'Fresh Produce', trend: '+2.8%', products: 456 },
          { category: 'Dairy Products', trend: '+1.9%', products: 189 },
          { category: 'Bakery', trend: '+4.3%', products: 145 }
        ],
        seasonalPatterns: this.getMockSeasonalPatterns()
      },
      optimization: {
        potentialIncrease: '₪45,200 monthly',
        confidenceScore: 84,
        recommendedActions: 12,
        implementationTimeframe: '2-4 weeks'
      },
      alerts: [
        {
          type: 'opportunity',
          message: 'Coffee category shows strong price elasticity - consider 5-8% increase',
          priority: 'high',
          potentialImpact: '₪12,300/month'
        },
        {
          type: 'warning',
          message: 'Fresh produce pricing below competitor average',
          priority: 'medium',
          potentialImpact: '₪8,900/month'
        }
      ],
      forecasts: this.getMockPriceForecasts(),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Helper methods for price history functionality
   */
  getRandomPriceReason() {
    const reasons = [
      'Market adjustment',
      'Cost increase',
      'Seasonal pricing',
      'Competitive response',
      'Promotion end',
      'Supply chain impact',
      'Demand optimization'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  calculatePriceVolatility(history) {
    if (history.length < 2) return 0;
    
    const prices = history.map(item => item.price);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / prices.length;
    return Math.round(Math.sqrt(variance) / average * 100 * 100) / 100;
  }

  getMockCompetitorPrices() {
    return [
      { competitor: 'SuperSol', price: 84.99, lastUpdated: '2025-08-19' },
      { competitor: 'Shufersal', price: 87.50, lastUpdated: '2025-08-18' },
      { competitor: 'Mega', price: 85.99, lastUpdated: '2025-08-20' },
      { competitor: 'Tiv Taam', price: 92.99, lastUpdated: '2025-08-19' }
    ];
  }

  getMockPriceAnalysis(history) {
    return {
      trendAnalysis: 'Price showing moderate upward trend over selected period',
      volatilityLevel: 'Low to moderate price volatility',
      seasonalImpact: 'Strong seasonal correlation with coffee consumption patterns',
      competitivePosition: 'Currently priced at premium vs market average',
      recommendations: [
        'Consider implementing dynamic pricing strategy',
        'Monitor competitor pricing more frequently',
        'Test price elasticity with controlled increases'
      ]
    };
  }

  getMockSeasonalPatterns() {
    return [
      { month: 'Jan', factor: 1.15, reason: 'Winter consumption peak' },
      { month: 'Feb', factor: 1.12, reason: 'Cold weather continues' },
      { month: 'Mar', factor: 1.02, reason: 'Spring transition' },
      { month: 'Apr', factor: 0.98, reason: 'Weather warming' },
      { month: 'May', factor: 0.95, reason: 'Lower demand' },
      { month: 'Jun', factor: 0.92, reason: 'Summer low' },
      { month: 'Jul', factor: 0.90, reason: 'Vacation season' },
      { month: 'Aug', factor: 0.93, reason: 'Back to routine' },
      { month: 'Sep', factor: 1.05, reason: 'Return to work/school' },
      { month: 'Oct', factor: 1.08, reason: 'Cooler weather' },
      { month: 'Nov', factor: 1.12, reason: 'Holiday season prep' },
      { month: 'Dec', factor: 1.18, reason: 'Holiday peak' }
    ];
  }

  getMockPriceForecasts() {
    return {
      nextMonth: {
        predictedTrend: '+2.1%',
        confidence: 78,
        factors: ['Seasonal increase', 'Supply chain costs']
      },
      nextQuarter: {
        predictedTrend: '+5.4%',
        confidence: 71,
        factors: ['Market expansion', 'Premium positioning']
      },
      nextYear: {
        predictedTrend: '+8.2%',
        confidence: 65,
        factors: ['Inflation', 'Brand development', 'Market maturation']
      }
    };
  }

  /**
   * Validation and utility methods
   */
  validatePriceUpdate(priceUpdate) {
    const { newPrice } = priceUpdate;
    
    if (!newPrice || typeof newPrice !== 'number') {
      throw new Error('Valid price is required');
    }
    
    if (newPrice <= 0) {
      throw new Error('Price must be greater than 0');
    }
    
    if (newPrice > 999999) {
      throw new Error('Price exceeds maximum allowed value');
    }
  }

  clearPriceHistoryCache(productId) {
    const cacheKeys = Object.keys(this.cache).filter(key => 
      key.includes('price_history') && key.includes(productId)
    );
    
    cacheKeys.forEach(key => {
      delete this.cache[key];
    });
  }

  analyzePriceImpact(priceUpdateResponse) {
    return {
      impactScore: Math.floor(Math.random() * 30) + 70, // 70-100
      expectedVolumeChange: `${Math.floor(Math.random() * 10) - 5}%`,
      expectedRevenueChange: `+${Math.floor(Math.random() * 15) + 5}%`,
      competitiveImpact: 'Moderate'
    };
  }

  generatePriceRecommendations(priceUpdateResponse) {
    return [
      'Monitor sales volume for next 2 weeks',
      'Track competitor responses',
      'Consider customer communication strategy'
    ];
  }

  /**
   * Get comprehensive product performance analytics
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} Product performance data
   */
  async getProductPerformanceAnalytics(params = {}) {
    const {
      timeframe = '30days',
      category = 'all',
      includeInsights = true,
      includeTrends = true,
      includeComparison = true
    } = params;

    const cacheKey = `product_analytics_${timeframe}_${category}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    try {
      const mockData = this.getMockProductAnalytics(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      throw this.handleInventoryError('Product analytics fetch failed', error);
    }
  }

  /**
   * Get individual product performance metrics
   * @param {string} productId - Product ID
   * @param {Object} params - Parameters
   * @returns {Promise<Object>} Product metrics
   */
  async getProductMetrics(productId, params = {}) {
    const {
      timeframe = '30days',
      includeCompetitorData = true,
      includeRecommendations = true
    } = params;

    try {
      const mockData = this.getMockProductMetrics(productId, params);
      return mockData;
    } catch (error) {
      throw this.handleInventoryError('Product metrics fetch failed', error);
    }
  }

  /**
   * Generate mock product performance analytics
   * @param {Object} params - Parameters
   * @returns {Object} Mock analytics data
   */
  getMockProductAnalytics(params = {}) {
    const { timeframe = '30days', category = 'all' } = params;
    
    // Generate realistic data based on timeframe
    const timeframeDays = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
      '6months': 180,
      '1year': 365
    };
    
    const days = timeframeDays[timeframe] || 30;
    const baseRevenue = 125000;
    const revenueVariation = Math.random() * 0.3 + 0.85; // 85-115% of base
    const totalRevenue = Math.round(baseRevenue * revenueVariation * (days / 30));
    
    return {
      timeframe,
      category,
      lastUpdated: new Date().toISOString(),
      
      // Overview metrics
      overview: {
        totalRevenue: totalRevenue,
        revenueGrowth: Math.round((Math.random() - 0.2) * 30 * 10) / 10, // -6% to +24%
        totalUnitsSold: Math.round(totalRevenue / 45), // Average price ~45
        unitsSoldGrowth: Math.round((Math.random() - 0.1) * 25 * 10) / 10, // -2.5% to +22.5%
        averageRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0
        ratingCount: Math.floor(Math.random() * 500) + 100,
        conversionRate: Math.round((Math.random() * 3 + 2) * 10) / 10, // 2-5%
        conversionGrowth: Math.round((Math.random() - 0.3) * 20 * 10) / 10 // -6% to +14%
      },

      // Product list with performance metrics
      products: this.generateMockProductsList(),

      // Chart data
      charts: {
        revenueTrend: this.generateMockChartData('revenue', days),
        categoryTrends: this.generateMockCategoryTrends(),
        seasonalPatterns: this.generateMockSeasonalData()
      },

      // AI insights
      insights: this.generateMockProductInsights(),

      // Performance benchmarks
      benchmarks: {
        industryAverage: {
          conversionRate: 3.2,
          averageOrderValue: 67.50,
          customerRetention: 68.5
        },
        topPerformers: {
          conversionRate: 5.8,
          averageOrderValue: 95.20,
          customerRetention: 89.2
        }
      },

      // Summary statistics
      summary: {
        totalProducts: 1247,
        activeProducts: 1186,
        topPerforming: 89,
        underperforming: 156,
        outOfStock: 12
      }
    };
  }

  /**
   * Generate mock product metrics for individual product
   * @param {string} productId - Product ID
   * @param {Object} params - Parameters
   * @returns {Object} Mock product metrics
   */
  getMockProductMetrics(productId, params = {}) {
    const { timeframe = '30days' } = params;
    
    return {
      productId,
      productName: 'Premium Coffee Beans - 1kg',
      sku: 'COFFEE-PREM-1KG',
      category: 'Coffee & Beverages',
      
      performance: {
        revenue: Math.round(Math.random() * 5000 + 3000),
        unitsSold: Math.round(Math.random() * 100 + 50),
        averagePrice: 89.99,
        growthRate: Math.round((Math.random() - 0.2) * 30 * 10) / 10,
        profitMargin: Math.round((Math.random() * 20 + 40) * 10) / 10,
        performanceScore: Math.round(Math.random() * 40 + 60) // 60-100
      },
      
      customerMetrics: {
        averageRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        repeatPurchaseRate: Math.round((Math.random() * 30 + 40) * 10) / 10,
        customerSatisfaction: Math.round((Math.random() * 20 + 75) * 10) / 10
      },
      
      competitiveAnalysis: {
        marketPosition: 'Premium',
        competitorCount: 8,
        priceCompetitiveness: 'Above Average',
        marketShare: Math.round(Math.random() * 10 + 5) // 5-15%
      },
      
      recommendations: [
        'Consider seasonal pricing strategy',
        'Optimize inventory levels based on demand patterns',
        'Implement targeted marketing campaigns',
        'Monitor competitor pricing changes'
      ]
    };
  }

  /**
   * Generate mock products list with performance data
   * @returns {Array} Products with performance metrics
   */
  generateMockProductsList() {
    const products = [];
    const productNames = [
      'Premium Coffee Beans - 1kg',
      'Organic Whole Milk - 1L',
      'Fresh Avocados (Pack of 4)',
      'Artisan Sourdough Bread',
      'Greek Yogurt Natural - 500g',
      'Free-Range Eggs (12 pack)',
      'Extra Virgin Olive Oil - 500ml',
      'Organic Bananas (1kg)',
      'Smoked Salmon - 200g',
      'Himalayan Pink Salt - 250g',
      'Fresh Spinach Leaves - 150g',
      'Dark Chocolate 85% - 100g',
      'Quinoa Organic - 500g',
      'Cherry Tomatoes - 250g',
      'Coconut Oil Virgin - 400ml',
      'Almonds Raw - 200g',
      'Honey Raw Unfiltered - 340g',
      'Green Tea Leaves - 100g',
      'Blueberries Fresh - 150g',
      'Parmesan Cheese Aged - 200g'
    ];

    const categories = [
      'Coffee & Beverages', 'Dairy Products', 'Fresh Produce', 
      'Bakery', 'Proteins', 'Condiments & Oils', 'Snacks & Confectionery'
    ];

    for (let i = 0; i < 20; i++) {
      const revenue = Math.round(Math.random() * 8000 + 2000);
      const unitsSold = Math.round(Math.random() * 200 + 50);
      const averagePrice = Math.round(revenue / unitsSold * 100) / 100;
      
      products.push({
        id: `prod_${i + 1}`,
        name: productNames[i],
        sku: `SKU-${String(i + 1).padStart(3, '0')}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        image: `/api/placeholder/40/40?text=${productNames[i].charAt(0)}`,
        revenue,
        units_sold: unitsSold,
        average_price: averagePrice,
        growth_rate: Math.round((Math.random() - 0.3) * 50 * 10) / 10, // -15% to +35%
        performance_score: Math.round(Math.random() * 40 + 60), // 60-100
        profit_margin: Math.round((Math.random() * 25 + 30) * 10) / 10, // 30-55%
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
        stock_level: Math.floor(Math.random() * 200) + 20,
        last_ordered: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return products.sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Generate mock chart data
   * @param {string} type - Chart type
   * @param {number} days - Number of days
   * @returns {Array} Chart data points
   */
  generateMockChartData(type, days) {
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      let value;
      
      switch (type) {
        case 'revenue':
          value = Math.round(Math.random() * 2000 + 3000 + Math.sin(i / 7) * 500);
          break;
        case 'units':
          value = Math.round(Math.random() * 50 + 75 + Math.sin(i / 7) * 20);
          break;
        default:
          value = Math.random() * 100;
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value,
        label: date.toLocaleDateString()
      });
    }
    
    return data;
  }

  /**
   * Generate mock category trends data
   * @returns {Array} Category trend data
   */
  generateMockCategoryTrends() {
    const categories = [
      'Coffee & Beverages',
      'Fresh Produce', 
      'Dairy Products',
      'Bakery',
      'Frozen Foods',
      'Snacks & Confectionery'
    ];

    return categories.map(category => ({
      category,
      revenue: Math.round(Math.random() * 15000 + 8000),
      growth: Math.round((Math.random() - 0.2) * 30 * 10) / 10,
      products: Math.floor(Math.random() * 200) + 50
    }));
  }

  /**
   * Generate mock seasonal data
   * @returns {Array} Seasonal pattern data
   */
  generateMockSeasonalData() {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, index) => ({
      month,
      value: Math.round(Math.random() * 20000 + 15000 + Math.sin(index / 2) * 5000),
      growth: Math.round((Math.random() - 0.2) * 25 * 10) / 10
    }));
  }

  /**
   * Generate mock product insights
   * @returns {Array} AI-generated insights
   */
  generateMockProductInsights() {
    const insights = [
      {
        title: 'Strong Performance in Coffee Category',
        description: 'Coffee products showing 18.3% growth vs last period, driven by premium coffee beans and seasonal drinks.',
        severity: 'success',
        impact: 'High Revenue Impact (+₪12,400)',
        actions: ['Increase Coffee Inventory', 'Launch Premium Line']
      },
      {
        title: 'Declining Fresh Produce Sales',
        description: 'Fresh produce category down 8.2% this month. Weather patterns and supplier issues contributing to decline.',
        severity: 'warning',
        impact: 'Medium Revenue Impact (-₪5,800)',
        actions: ['Review Supplier Contracts', 'Adjust Pricing Strategy']
      },
      {
        title: 'Opportunity in Organic Products',
        description: 'Organic products growing 24% faster than conventional alternatives. Customer demand increasing significantly.',
        severity: 'info',
        impact: 'Growth Opportunity (+₪8,200)',
        actions: ['Expand Organic Range', 'Partner with Organic Suppliers']
      },
      {
        title: 'Inventory Risk Alert',
        description: 'Several high-performing products showing low stock levels. Risk of stockouts in next 5-7 days.',
        severity: 'critical',
        impact: 'Revenue Risk (-₪15,000)',
        actions: ['Emergency Reorder', 'Review Safety Stock Levels']
      }
    ];

    return insights;
  }
}

// Export singleton instance
const inventoryService = new InventoryService();

export default inventoryService;
export { InventoryService };