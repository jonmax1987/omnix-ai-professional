// API service layer for OMNIX AI
// Enhanced with unified API client for BE/FE consistency
import unifiedAPI from './unifiedAPIClient';
import httpService, { ApiError } from './httpClient';
import useUserStore from '../store/userStore';
import { wsService } from './websocketService';
import { abTestingService } from './abTestingService';
// Socket.IO is imported dynamically when needed

// MIGRATION NOTE: Transitioning to unified API client
// New implementations should use unifiedAPI, legacy code uses httpService

/**
 * @typedef {import('../types/api.js').APIResponse} APIResponse
 * @typedef {import('../types/api.js').Product} Product
 * @typedef {import('../types/api.js').Alert} Alert
 * @typedef {import('../types/api.js').DashboardSummary} DashboardSummary
 * @typedef {import('../types/api.js').DashboardMetrics} DashboardMetrics
 * @typedef {import('../types/api.js').OrderRecommendation} OrderRecommendation
 * @typedef {import('../types/api.js').DemandForecast} DemandForecast
 * @typedef {import('../types/api.js').TrendAnalysis} TrendAnalysis
 */

// Legacy API Configuration (now managed by httpClient service)
const API_CONFIG = httpService.getConfig();

// Generic API methods (now using enhanced httpService)
const api = {
  get: (endpoint, params = {}) => httpService.get(endpoint, params),
  post: (endpoint, data) => httpService.post(endpoint, data),
  put: (endpoint, data) => httpService.put(endpoint, data),
  patch: (endpoint, data) => httpService.patch(endpoint, data),
  delete: (endpoint) => httpService.delete(endpoint),
  upload: (endpoint, formData) => httpService.upload(endpoint, formData)
};

// Authentication API - UNIFIED VERSION
export const authAPI = {
  // Use unified API client for auth endpoints
  login: async (credentials) => {
    try {
      return await unifiedAPI.auth.login(credentials);
    } catch (error) {
      // Fallback to legacy API if unified client fails
      console.warn('Unified API login failed, falling back to legacy:', error.message);
      return await api.post('/auth/login', credentials);
    }
  },
  logout: async () => {
    try {
      return await unifiedAPI.auth.logout();
    } catch (error) {
      console.warn('Unified API logout failed, falling back to legacy:', error.message);
      return await api.post('/auth/logout');
    }
  },
  refreshToken: async (refreshToken) => {
    try {
      return await unifiedAPI.auth.refreshToken(refreshToken);
    } catch (error) {
      console.warn('Unified API refresh failed, falling back to legacy:', error.message);
      return await api.post('/auth/refresh', { refreshToken });
    }
  },
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  setupTwoFactor: () => api.post('/auth/2fa/setup'),
  verifyTwoFactor: (code) => api.post('/auth/2fa/verify', { code }),
  disableTwoFactor: (code) => api.post('/auth/2fa/disable', { code })
};

// User Profile API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.upload('/user/avatar', formData);
  },
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (preferences) => api.patch('/user/preferences', preferences),
  getPermissions: () => api.get('/user/permissions'),
  getSessionHistory: (params = {}) => api.get('/user/sessions', params),
  deleteAccount: (password) => api.delete('/user/account', { password })
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => api.get('/products', params),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.patch(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Batch operations (INV-015)
  bulkImportProducts: (data) => api.post('/products/bulk-import', data),
  bulkExportProducts: (params = {}) => api.get('/products/bulk-export', params),
  bulkUpdateProducts: (updates) => api.patch('/products/bulk-update', updates),
  bulkDeleteProducts: (ids) => api.delete('/products/bulk-delete', { data: { ids } }),
  deleteProducts: (ids) => api.post('/products/batch-delete', { ids }),
  validateProductsImport: (data) => api.post('/products/import/validate', data),
  getImportTemplate: (format = 'csv') => api.get(`/products/import/template?format=${format}`),
  getExportStatus: (jobId) => api.get(`/products/export/${jobId}/status`),
  getImportStatus: (jobId) => api.get(`/products/import/${jobId}/status`),
  importProducts: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/products/import', formData);
  },
  exportProducts: (params = {}) => api.get('/products/export', params),
  getProductHistory: (id, params = {}) => api.get(`/products/${id}/history`, params),
  bulkUpdate: (updates) => api.post('/products/batch-update', updates),
  getCategories: () => api.get('/products/categories'),
  getSuppliers: () => api.get('/products/suppliers'),
  getTags: () => api.get('/products/tags')
};

// Inventory API
export const inventoryAPI = {
  getInventory: (params = {}) => api.get('/inventory', params),
  getInventoryItem: (productId) => api.get(`/inventory/${productId}`),
  adjustStock: (productId, adjustment) => 
    api.post(`/inventory/${productId}/adjust`, adjustment),
  transferStock: (data) => api.post('/inventory/transfer', data),
  getStockHistory: (productId, params = {}) => 
    api.get(`/inventory/${productId}/history`, params),
  getStockAlerts: (params = {}) => api.get('/inventory/alerts', params),
  dismissAlert: (alertId) => api.delete(`/inventory/alerts/${alertId}`),
  bulkAdjust: (adjustments) => api.post('/inventory/bulk-adjust', adjustments),
  getLocations: () => api.get('/inventory/locations'),
  createLocation: (data) => api.post('/inventory/locations', data),
  updateLocation: (id, data) => api.patch(`/inventory/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/inventory/locations/${id}`)
};

// Orders API
export const ordersAPI = {
  getOrders: (params = {}) => api.get('/orders', params),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrder: (id, data) => api.patch(`/orders/${id}`, data),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  fulfillOrder: (id, data) => api.post(`/orders/${id}/fulfill`, data),
  getOrderHistory: (id) => api.get(`/orders/${id}/history`),
  exportOrders: (params = {}) => api.get('/orders/export', params),
  // NOTE: Backend has a routing issue where /orders/statistics is incorrectly matched by /orders/:id
  // This causes a 404 error saying "Order with ID statistics not found"
  // Backend fix needed: Define /orders/statistics route BEFORE /orders/:id route
  getOrderStatistics: (params = {}) => api.get('/orders/statistics', params)
};

// Alerts API (aligned with backend spec)
export const alertsAPI = {
  getAlerts: (params = {}) => api.get('/alerts', params),
  getAlert: (id) => api.get(`/alerts/${id}`),
  createAlert: (data) => api.post('/alerts', data),
  dismissAlert: (id) => api.post(`/alerts/${id}/dismiss`), // Backend uses dismiss instead of acknowledge
  acknowledgeAlert: (id) => api.post(`/alerts/${id}/dismiss`), // Map to backend endpoint
  resolveAlert: (id, resolution) => api.post(`/alerts/${id}/resolve`, { resolution }),
  bulkAcknowledge: (ids) => api.post('/alerts/bulk-acknowledge', { ids }),
  bulkResolve: (ids, resolution) => api.post('/alerts/bulk-resolve', { ids, resolution }),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  getAlertStatistics: () => api.get('/alerts/statistics'),
  getAlertCategories: () => api.get('/alerts/categories'),
  createRule: (rule) => api.post('/alerts/rules', rule),
  updateRule: (id, rule) => api.patch(`/alerts/rules/${id}`, rule),
  deleteRule: (id) => api.delete(`/alerts/rules/${id}`),
  getRules: () => api.get('/alerts/rules')
};

// Dashboard API - UNIFIED VERSION
export const dashboardAPI = {
  getSummary: async (params = {}) => {
    try {
      return await unifiedAPI.dashboard.getSummary(params);
    } catch (error) {
      console.warn('Unified API dashboard summary failed, falling back to legacy:', error.message);
      return await api.get('/dashboard/summary', params);
    }
  },
  getInventoryGraph: async (params = {}) => {
    try {
      // Backend doesn't accept timeRange parameter, so don't pass it
      const { timeRange, ...backendParams } = params;
      return await unifiedAPI.dashboard.getInventoryGraph(backendParams);
    } catch (error) {
      console.warn('Unified API inventory graph failed, falling back to legacy:', error.message);
      const { timeRange, ...backendParams } = params;
      return await api.get('/dashboard/inventory-graph', backendParams);
    }
  }
};

// Analytics API (preserving original functionality + extended capabilities)
export const analyticsAPI = {
  // Original methods (preserved exactly as they were)
  getDashboardMetrics: (params = {}) => api.get('/dashboard/summary', params), // Maps to backend endpoint
  getInventoryGraph: (params = {}) => {
    // Backend doesn't accept timeRange parameter, so don't pass it
    const { timeRange, ...backendParams } = params;
    return api.get('/dashboard/inventory-graph', backendParams);
  }, // Maps to backend endpoint
  // Legacy endpoints (may need backend implementation)
  getRevenueMetrics: (params = {}) => api.get('/analytics/revenue', params),
  getInventoryMetrics: (params = {}) => api.get('/analytics/inventory', params),
  getOrderMetrics: (params = {}) => api.get('/analytics/orders', params),
  getForecast: (params = {}) => api.get('/forecasts/demand', params), // Map to backend forecasts
  getTrends: (params = {}) => api.get('/forecasts/trends', params), // Map to backend forecasts
  getPerformance: (params = {}) => api.get('/analytics/performance', params),
  generateReport: (type, params = {}) => api.post(`/analytics/reports/${type}`, params),
  getReports: (params = {}) => api.get('/analytics/reports', params),
  downloadReport: (reportId) => api.get(`/analytics/reports/${reportId}/download`),
  deleteReport: (reportId) => api.delete(`/analytics/reports/${reportId}`),

  // Extended analytics capabilities (new methods)
  getDashboardSummary: (params = {}) => api.get('/dashboard/summary', params),
  getRevenueAnalytics: (params = {}) => api.get('/analytics/revenue', params),
  getRevenueForecast: (params = {}) => api.get('/analytics/revenue/forecast', params),

  // Customer analytics
  getCustomerSegmentation: (params = {}) => api.get('/analytics/customers/segmentation', params),
  getCustomerLifetimeValue: (params = {}) => api.get('/analytics/customers/lifetime-value', params),
  getChurnAnalysis: (params = {}) => api.get('/analytics/customers/churn-analysis', params),
  getSegmentTrends: (params = {}) => api.get('/analytics/customers/segment-trends', params),

  // Extended inventory analytics
  getInventoryAnalytics: (params = {}) => api.get('/analytics/inventory', params),
  getInventoryForecasting: (params = {}) => api.get('/analytics/inventory/forecasting', params),
  getInventoryOptimization: (params = {}) => api.get('/analytics/inventory/optimization', params),
  getInventoryAlerts: (params = {}) => api.get('/analytics/inventory/alerts', params),

  // Extended order analytics
  getOrderAnalytics: (params = {}) => api.get('/analytics/orders', params),
  getOrderPatterns: (params = {}) => api.get('/analytics/orders/patterns', params),
  getOrderSeasonality: (params = {}) => api.get('/analytics/orders/seasonality', params),

  // Product analytics
  getProductAnalytics: (params = {}) => api.get('/analytics/products', params),
  getProductRecommendations: (params = {}) => api.get('/analytics/products/recommendations', params),
  getProductPerformance: (params = {}) => api.get('/analytics/products/performance', params),
  getProductCorrelations: (params = {}) => api.get('/analytics/products/correlations', params),

  // Predictive analytics
  getDemandPredictions: (params = {}) => api.get('/analytics/predictions/demand', params),
  getRevenuePredictions: (params = {}) => api.get('/analytics/predictions/revenue', params),
  getChurnPredictions: (params = {}) => api.get('/analytics/predictions/churn', params),
  getInventoryPredictions: (params = {}) => api.get('/analytics/predictions/inventory', params),

  // Real-time analytics
  getRealTimeAnalytics: (params = {}) => api.get('/analytics/realtime', params),
  getRealTimeMetrics: (params = {}) => api.get('/analytics/realtime', params),

  // Extended report generation and export
  generateCustomReport: (params = {}) => api.post('/analytics/reports/generate', params),
  getReport: (reportId) => api.get(`/analytics/reports/${reportId}`),
  exportAnalytics: (type, params = {}) => api.get(`/analytics/export/${type}`, params)
};

// Recommendations API (matches backend spec)
export const recommendationsAPI = {
  getOrderRecommendations: (params = {}) => api.get('/recommendations/orders', params),
  getRecommendations: (params = {}) => api.get('/recommendations/orders', params), // Map existing calls
  getRecommendation: (id) => api.get(`/recommendations/${id}`),
  acceptRecommendation: (id) => api.post(`/recommendations/${id}/accept`),
  dismissRecommendation: (id) => api.post(`/recommendations/${id}/dismiss`),
  getRecommendationHistory: (params = {}) => api.get('/recommendations/history', params),
  getRecommendationSettings: () => api.get('/recommendations/settings'),
  updateRecommendationSettings: (settings) => 
    api.patch('/recommendations/settings', settings),
    
  // Cross-sell and Upsell Recommendations (INV-014)
  getCrossSellRecommendations: (params = {}) => api.get('/recommendations/cross-sell', params),
  getUpsellRecommendations: (params = {}) => api.get('/recommendations/upsell', params),
  getCrossSellUpsellRecommendations: (params = {}) => api.get('/recommendations/cross-sell-upsell', params),
  getProductRecommendations: (productId, params = {}) => api.get(`/products/${productId}/recommendations`, params),
  getBundleRecommendations: (params = {}) => api.get('/recommendations/bundles', params),
  getSubstituteRecommendations: (params = {}) => api.get('/recommendations/substitutes', params),
  
  // Recommendation analytics
  getRecommendationAnalytics: (params = {}) => api.get('/recommendations/analytics', params),
  getRecommendationPerformance: (params = {}) => api.get('/recommendations/performance', params),
  getRecommendationConversions: (params = {}) => api.get('/recommendations/conversions', params),
  
  // Apply recommendations
  applyRecommendation: (id, params = {}) => api.post(`/recommendations/${id}/apply`, params),
  bulkApplyRecommendations: (ids, params = {}) => api.post('/recommendations/bulk-apply', { ids, ...params }),
  
  // Recommendation feedback
  provideRecommendationFeedback: (id, feedback) => api.post(`/recommendations/${id}/feedback`, feedback),
  getRecommendationFeedback: (id) => api.get(`/recommendations/${id}/feedback`)
};

// Forecasting API (matches backend spec)
export const forecastsAPI = {
  getDemandForecasts: (params = {}) => api.get('/forecasts/demand', params),
  getTrendAnalysis: (params = {}) => api.get('/forecasts/trends', params)
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.patch('/settings', settings),
  getIntegrations: () => api.get('/settings/integrations'),
  updateIntegration: (id, data) => api.patch(`/settings/integrations/${id}`, data),
  testIntegration: (id) => api.post(`/settings/integrations/${id}/test`),
  getNotificationSettings: () => api.get('/settings/notifications'),
  updateNotificationSettings: (settings) => 
    api.patch('/settings/notifications', settings),
  getApiKeys: () => api.get('/settings/api-keys'),
  createApiKey: (data) => api.post('/settings/api-keys', data),
  revokeApiKey: (keyId) => api.delete(`/settings/api-keys/${keyId}`),
  getWebhooks: () => api.get('/settings/webhooks'),
  createWebhook: (webhook) => api.post('/settings/webhooks', webhook),
  updateWebhook: (id, webhook) => api.patch(`/settings/webhooks/${id}`, webhook),
  deleteWebhook: (id) => api.delete(`/settings/webhooks/${id}`),
  testWebhook: (id) => api.post(`/settings/webhooks/${id}/test`)
};

// A/B Testing API (AB-001 to AB-008)
export const abTestingAPI = {
  // Test management
  getABTests: (params = {}) => api.get('/ab-tests', params),
  getABTest: (id) => api.get(`/ab-tests/${id}`),
  createABTest: (data) => api.post('/ab-tests', data),
  updateABTest: (id, data) => api.patch(`/ab-tests/${id}`, data),
  deleteABTest: (id) => api.delete(`/ab-tests/${id}`),
  
  // Test operations
  startABTest: (id) => api.post(`/ab-tests/${id}/start`),
  pauseABTest: (id) => api.post(`/ab-tests/${id}/pause`),
  resumeABTest: (id) => api.post(`/ab-tests/${id}/resume`),
  stopABTest: (id) => api.post(`/ab-tests/${id}/stop`),
  duplicateABTest: (id) => api.post(`/ab-tests/${id}/duplicate`),
  
  // Test results and analytics
  getABTestResults: (id) => api.get(`/ab-tests/${id}/results`),
  getABTestMetrics: (id) => api.get(`/ab-tests/${id}/metrics`),
  getABTestStatistics: (id) => api.get(`/ab-tests/${id}/statistics`),
  calculateSignificance: (id) => api.post(`/ab-tests/${id}/significance`),
  
  // Test configuration
  validateTestConfig: (config) => api.post('/ab-tests/validate', config),
  getModelComparisons: () => api.get('/ab-tests/models'),
  getTestTemplates: () => api.get('/ab-tests/templates'),
  
  // Historical data and reporting
  getTestHistory: (params = {}) => api.get('/ab-tests/history', params),
  exportTestResults: (id, format = 'csv') => api.get(`/ab-tests/${id}/export?format=${format}`),
  getTestInsights: (id) => api.get(`/ab-tests/${id}/insights`),
  
  // Advanced analytics
  getTestSegmentation: (id) => api.get(`/ab-tests/${id}/segments`),
  getTestFunnel: (id) => api.get(`/ab-tests/${id}/funnel`),
  getTestCohorts: (id) => api.get(`/ab-tests/${id}/cohorts`)
};

// System API
export const systemAPI = {
  getHealth: () => api.get('/system/health'),
  getStatus: () => api.get('/system/status'),
  getVersion: () => api.get('/system/version'),
  getLogs: (params = {}) => api.get('/system/logs', params),
  getMetrics: (params = {}) => api.get('/system/metrics', params),
  backup: () => api.post('/system/backup'),
  getBackups: () => api.get('/system/backups'),
  restoreBackup: (backupId) => api.post(`/system/backups/${backupId}/restore`),
  deleteBackup: (backupId) => api.delete(`/system/backups/${backupId}`)
};

// Enhanced WebSocket service is now imported at top of file and exported below

// Export main API object and services for advanced usage
export default api;
export { httpService, wsService, abTestingService };