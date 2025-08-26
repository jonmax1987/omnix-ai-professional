/**
 * @fileoverview API Type Definitions for OMNIX AI
 * JSDoc type definitions for API responses and data models
 */

/**
 * @typedef {Object} Pagination
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} total - Total number of items
 * @property {number} pages - Total number of pages
 * @property {boolean} hasNext - Whether there are more pages
 * @property {boolean} hasPrev - Whether there are previous pages
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Unique product identifier (UUID)
 * @property {string} name - Product name
 * @property {string} sku - Stock Keeping Unit
 * @property {string} category - Product category
 * @property {number} quantity - Current stock quantity
 * @property {number} minThreshold - Minimum stock threshold
 * @property {number} price - Selling price
 * @property {string} supplier - Supplier name
 * @property {string} [barcode] - Product barcode (backend field)
 * @property {number} [cost] - Cost price (backend field)
 * @property {string} [unit] - Unit of measurement (backend field)
 * @property {string} [expirationDate] - Expiration date (backend field)
 * @property {string} [location] - Storage location (backend field)
 * @property {string} [description] - Product description (backend field)
 * @property {string[]} [tags] - Product tags (client-side field)
 * @property {string} [status] - Product status: active, inactive, discontinued (client-side field)
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {string} [lastUpdated] - Backend timestamp field
 */

/**
 * @typedef {Object} Alert
 * @property {string} id - Unique alert identifier (UUID)
 * @property {string} type - Alert type: low-stock, out-of-stock, expired, forecast-warning, system
 * @property {string} [productId] - Related product ID
 * @property {string} [productName] - Related product name
 * @property {string} severity - Alert severity: high, medium, low
 * @property {string} message - Alert message
 * @property {string} [details] - Additional alert details
 * @property {boolean} [actionRequired] - Whether action is required
 * @property {string} createdAt - Creation timestamp
 * @property {string} [expiresAt] - Expiration timestamp (backend field)
 * @property {string} [dismissedAt] - Dismissal timestamp (backend field)
 * @property {string} [dismissedBy] - User who dismissed the alert (backend field)
 * @property {string} [title] - Alert title (client-side field)
 * @property {boolean} [acknowledged] - Whether alert is acknowledged (client-side field)
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {number} totalInventoryValue - Total inventory value (backend field)
 * @property {number} totalItems - Total number of items
 * @property {number} lowStockItems - Number of low stock items
 * @property {number} outOfStockItems - Number of out of stock items
 * @property {number} expiredItems - Number of expired items
 * @property {number} activeAlerts - Number of active alerts
 * @property {CategoryBreakdown[]} categoryBreakdown - Category breakdown data
 * @property {TopCategory[]} topCategories - Top categories by percentage
 */

/**
 * @typedef {Object} CategoryBreakdown
 * @property {string} category - Category name
 * @property {number} itemCount - Number of items in category
 * @property {number} value - Total value of category
 */

/**
 * @typedef {Object} TopCategory
 * @property {string} category - Category name
 * @property {number} percentage - Percentage of total
 */

/**
 * @typedef {Object} InventoryGraphData
 * @property {string} timeRange - Time range for the data
 * @property {string} granularity - Data granularity (daily, weekly, monthly)
 * @property {InventoryDataPoint[]} dataPoints - Array of data points
 */

/**
 * @typedef {Object} InventoryDataPoint
 * @property {string} timestamp - Data point timestamp
 * @property {number} inventoryValue - Inventory value at this point
 * @property {number} itemCount - Item count at this point
 * @property {CategoryData[]} categories - Category breakdown for this point
 */

/**
 * @typedef {Object} CategoryData
 * @property {string} category - Category name
 * @property {number} value - Category value
 * @property {number} count - Category item count
 */

/**
 * @typedef {Object} OrderRecommendation
 * @property {string} id - Recommendation ID
 * @property {string} productId - Product ID
 * @property {string} productName - Product name
 * @property {number} currentStock - Current stock level
 * @property {number} recommendedQuantity - Recommended order quantity
 * @property {string} urgency - Urgency level: high, medium, low
 * @property {string} reason - Reason for recommendation
 * @property {string} explanation - Detailed explanation
 * @property {number} estimatedCost - Estimated cost
 * @property {string} supplier - Supplier name
 * @property {number} leadTime - Lead time in days
 * @property {number} confidence - Confidence score (0-1)
 * @property {string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} DemandForecast
 * @property {string} productId - Product ID
 * @property {string} productName - Product name
 * @property {string} category - Product category
 * @property {string} timeHorizon - Forecast time horizon
 * @property {ForecastPrediction[]} predictions - Array of predictions
 * @property {number} accuracy - Model accuracy (0-1)
 * @property {string} model - Model name
 * @property {string} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} ForecastPrediction
 * @property {string} period - Period date
 * @property {number} predictedDemand - Predicted demand
 * @property {ConfidenceInterval} confidenceInterval - Confidence interval
 */

/**
 * @typedef {Object} ConfidenceInterval
 * @property {number} lower - Lower bound
 * @property {number} upper - Upper bound
 */

/**
 * @typedef {Object} TrendAnalysis
 * @property {string} timeRange - Analysis time range
 * @property {string} overallTrend - Overall trend: increasing, decreasing, stable, seasonal
 * @property {SeasonalityData} seasonality - Seasonality information
 * @property {CorrelationData[]} correlations - Correlation factors
 * @property {string[]} insights - Analysis insights
 */

/**
 * @typedef {Object} SeasonalityData
 * @property {boolean} detected - Whether seasonality was detected
 * @property {string} pattern - Seasonal pattern
 * @property {number} strength - Seasonality strength
 */

/**
 * @typedef {Object} CorrelationData
 * @property {string} factor - Correlation factor
 * @property {number} correlation - Correlation value
 */

/**
 * @typedef {Object} APIResponse
 * @property {any} data - Response data
 * @property {Pagination} [pagination] - Pagination info
 * @property {Object} [meta] - Additional metadata
 * @property {string} [message] - Response message
 */

/**
 * @typedef {Object} APIError
 * @property {string} error - Error type
 * @property {string} message - Error message
 * @property {string} [details] - Error details
 * @property {number} code - HTTP status code
 * @property {string} timestamp - Error timestamp
 */

/**
 * Client-side transformed dashboard data structure
 * @typedef {Object} DashboardMetrics
 * @property {RevenueMetrics} revenue - Revenue metrics
 * @property {InventoryMetrics} inventory - Inventory metrics
 * @property {AlertMetrics} alerts - Alert metrics
 * @property {CategoryBreakdown[]} categoryBreakdown - Category breakdown
 */

/**
 * @typedef {Object} RevenueMetrics
 * @property {number} current - Current revenue/inventory value
 * @property {number} previous - Previous period value
 * @property {number} change - Change percentage
 * @property {string} trend - Trend direction: up, down, neutral
 */

/**
 * @typedef {Object} InventoryMetrics
 * @property {number} totalValue - Total inventory value
 * @property {number} totalItems - Total number of items
 * @property {number} lowStockItems - Number of low stock items
 * @property {number} outOfStockItems - Number of out of stock items
 */

/**
 * @typedef {Object} AlertMetrics
 * @property {number} critical - Number of critical alerts
 * @property {number} warning - Number of warning alerts
 * @property {number} info - Number of info alerts
 * @property {number} total - Total number of alerts
 */

export {};