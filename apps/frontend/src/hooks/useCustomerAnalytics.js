// React Hook for Customer Analytics
// Integration with API-003: Customer analytics service
import { useState, useEffect, useCallback, useRef } from 'react';
import customerAnalyticsService from '../services/customerAnalyticsService';
import { analyticsAPI } from '../services/api';

/**
 * Hook for customer analytics data and operations
 * @param {Object} options - Hook configuration options
 * @returns {Object} Analytics data and methods
 */
export const useCustomerAnalytics = (options = {}) => {
  const {
    autoFetch = true,
    refetchInterval = null,
    cacheEnabled = true,
    timeRange = '30d'
  } = options;

  const [state, setState] = useState({
    dashboard: { data: null, loading: false, error: null },
    revenue: { data: null, loading: false, error: null },
    customers: { data: null, loading: false, error: null },
    inventory: { data: null, loading: false, error: null },
    orders: { data: null, loading: false, error: null },
    products: { data: null, loading: false, error: null },
    predictions: { data: null, loading: false, error: null },
    realtime: { data: null, loading: false, error: null }
  });

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Generic state updater with mounted check
  const updateState = useCallback((section, updates) => {
    if (mountedRef.current) {
      setState(prevState => ({
        ...prevState,
        [section]: { ...prevState[section], ...updates }
      }));
    }
  }, []);

  // Error handler
  const handleError = useCallback((section, error) => {
    console.error(`Analytics error in ${section}:`, error);
    updateState(section, { 
      loading: false, 
      error: error.message || 'Failed to fetch analytics data' 
    });
  }, [updateState]);

  /**
   * Fetch dashboard summary
   */
  const fetchDashboardSummary = useCallback(async (params = {}) => {
    updateState('dashboard', { loading: true, error: null });
    
    try {
      const data = await customerAnalyticsService.getDashboardSummary({
        timeRange,
        useCache: cacheEnabled,
        ...params
      });
      
      updateState('dashboard', { data, loading: false });
      return data;
    } catch (error) {
      handleError('dashboard', error);
      throw error;
    }
  }, [timeRange, cacheEnabled, updateState, handleError]);

  /**
   * Fetch revenue analytics
   */
  const fetchRevenueAnalytics = useCallback(async (params = {}) => {
    updateState('revenue', { loading: true, error: null });
    
    try {
      const data = await customerAnalyticsService.getRevenueAnalytics({
        timeRange,
        includeForecasting: true,
        includeTrends: true,
        ...params
      });
      
      updateState('revenue', { data, loading: false });
      return data;
    } catch (error) {
      handleError('revenue', error);
      throw error;
    }
  }, [timeRange, updateState, handleError]);

  /**
   * Fetch customer analytics
   */
  const fetchCustomerAnalytics = useCallback(async (params = {}) => {
    updateState('customers', { loading: true, error: null });
    
    try {
      const data = await customerAnalyticsService.getCustomerAnalytics({
        timeRange,
        segmentBy: 'behavior',
        includeLifetimeValue: true,
        includeChurnAnalysis: true,
        includeSegmentTrends: true,
        ...params
      });
      
      updateState('customers', { data, loading: false });
      return data;
    } catch (error) {
      handleError('customers', error);
      throw error;
    }
  }, [timeRange, updateState, handleError]);

  /**
   * Fetch inventory analytics
   */
  const fetchInventoryAnalytics = useCallback(async (params = {}) => {
    updateState('inventory', { loading: true, error: null });
    
    try {
      const data = await customerAnalyticsService.getInventoryAnalytics({
        timeRange,
        includeForecasting: true,
        includeOptimization: true,
        includeAlerts: true,
        ...params
      });
      
      updateState('inventory', { data, loading: false });
      return data;
    } catch (error) {
      handleError('inventory', error);
      throw error;
    }
  }, [timeRange, updateState, handleError]);

  /**
   * Fetch order analytics
   */
  const fetchOrderAnalytics = useCallback(async (params = {}) => {
    updateState('orders', { loading: true, error: null });
    
    try {
      const data = await customerAnalyticsService.getOrderAnalytics({
        timeRange,
        includePatterns: true,
        includeSeasonality: true,
        ...params
      });
      
      updateState('orders', { data, loading: false });
      return data;
    } catch (error) {
      handleError('orders', error);
      throw error;
    }
  }, [timeRange, updateState, handleError]);

  /**
   * Fetch product analytics
   */
  const fetchProductAnalytics = useCallback(async (params = {}) => {
    updateState('products', { loading: true, error: null });
    
    try {
      const data = await customerAnalyticsService.getProductAnalytics({
        timeRange,
        includeRecommendations: true,
        includePerformance: true,
        includeCorrelations: true,
        ...params
      });
      
      updateState('products', { data, loading: false });
      return data;
    } catch (error) {
      handleError('products', error);
      throw error;
    }
  }, [timeRange, updateState, handleError]);

  /**
   * Fetch predictive analytics
   */
  const fetchPredictiveAnalytics = useCallback(async (params = {}) => {
    updateState('predictions', { loading: true, error: null });
    
    try {
      const data = await customerAnalyticsService.getPredictiveAnalytics({
        type: 'all',
        timeHorizon: '30d',
        confidenceLevel: 0.8,
        includeScenarios: true,
        ...params
      });
      
      updateState('predictions', { data, loading: false });
      return data;
    } catch (error) {
      handleError('predictions', error);
      throw error;
    }
  }, [updateState, handleError]);

  /**
   * Fetch real-time analytics
   */
  const fetchRealTimeAnalytics = useCallback(async (params = {}) => {
    updateState('realtime', { loading: true, error: null });
    
    try {
      const data = await customerAnalyticsService.getRealTimeAnalytics({
        metrics: ['orders', 'revenue', 'inventory', 'alerts'],
        includeComparisons: true,
        ...params
      });
      
      updateState('realtime', { data, loading: false });
      return data;
    } catch (error) {
      handleError('realtime', error);
      throw error;
    }
  }, [updateState, handleError]);

  /**
   * Generate custom report
   */
  const generateReport = useCallback(async (reportParams) => {
    try {
      return await customerAnalyticsService.generateCustomReport(reportParams);
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }, []);

  /**
   * Export analytics data
   */
  const exportData = useCallback(async (exportParams) => {
    try {
      return await customerAnalyticsService.exportAnalyticsData(exportParams);
    } catch (error) {
      console.error('Data export error:', error);
      throw error;
    }
  }, []);

  /**
   * Refresh all analytics data
   */
  const refreshAll = useCallback(async () => {
    const promises = [
      fetchDashboardSummary(),
      fetchRevenueAnalytics(),
      fetchCustomerAnalytics(),
      fetchInventoryAnalytics(),
      fetchOrderAnalytics(),
      fetchProductAnalytics(),
      fetchRealTimeAnalytics()
    ];

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error refreshing analytics data:', error);
    }
  }, [
    fetchDashboardSummary,
    fetchRevenueAnalytics,
    fetchCustomerAnalytics,
    fetchInventoryAnalytics,
    fetchOrderAnalytics,
    fetchProductAnalytics,
    fetchRealTimeAnalytics
  ]);

  /**
   * Clear cache
   */
  const clearCache = useCallback((pattern = null) => {
    customerAnalyticsService.clearCache(pattern);
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return customerAnalyticsService.getCacheStats();
  }, []);

  // Auto-fetch data on mount
  useEffect(() => {
    if (autoFetch) {
      refreshAll();
    }
  }, [autoFetch, refreshAll]);

  // Set up interval for periodic refreshing
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          refreshAll();
        }
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [refetchInterval, refreshAll]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Return hook interface
  return {
    // Data state
    dashboard: state.dashboard,
    revenue: state.revenue,
    customers: state.customers,
    inventory: state.inventory,
    orders: state.orders,
    products: state.products,
    predictions: state.predictions,
    realtime: state.realtime,

    // Computed states
    isLoading: Object.values(state).some(section => section.loading),
    hasError: Object.values(state).some(section => section.error),
    errors: Object.entries(state)
      .filter(([_, section]) => section.error)
      .reduce((acc, [key, section]) => ({ ...acc, [key]: section.error }), {}),

    // Methods
    fetchDashboardSummary,
    fetchRevenueAnalytics,
    fetchCustomerAnalytics,
    fetchInventoryAnalytics,
    fetchOrderAnalytics,
    fetchProductAnalytics,
    fetchPredictiveAnalytics,
    fetchRealTimeAnalytics,
    generateReport,
    exportData,
    refreshAll,
    clearCache,
    getCacheStats,

    // Utility methods
    retryFailedRequests: useCallback(() => {
      const failedSections = Object.entries(state)
        .filter(([_, section]) => section.error)
        .map(([key]) => key);

      failedSections.forEach(section => {
        switch (section) {
          case 'dashboard':
            fetchDashboardSummary();
            break;
          case 'revenue':
            fetchRevenueAnalytics();
            break;
          case 'customers':
            fetchCustomerAnalytics();
            break;
          case 'inventory':
            fetchInventoryAnalytics();
            break;
          case 'orders':
            fetchOrderAnalytics();
            break;
          case 'products':
            fetchProductAnalytics();
            break;
          case 'predictions':
            fetchPredictiveAnalytics();
            break;
          case 'realtime':
            fetchRealTimeAnalytics();
            break;
          default:
            break;
        }
      });
    }, [
      state,
      fetchDashboardSummary,
      fetchRevenueAnalytics,
      fetchCustomerAnalytics,
      fetchInventoryAnalytics,
      fetchOrderAnalytics,
      fetchProductAnalytics,
      fetchPredictiveAnalytics,
      fetchRealTimeAnalytics
    ])
  };
};

/**
 * Specialized hook for dashboard analytics
 */
export const useDashboardAnalytics = (options = {}) => {
  const { dashboard, fetchDashboardSummary, isLoading, hasError } = useCustomerAnalytics({
    autoFetch: true,
    refetchInterval: 30000, // Refresh every 30 seconds
    ...options
  });

  return {
    data: dashboard.data,
    loading: dashboard.loading,
    error: dashboard.error,
    refresh: fetchDashboardSummary,
    isLoading,
    hasError
  };
};

/**
 * Specialized hook for real-time analytics
 */
export const useRealTimeAnalytics = (options = {}) => {
  const { realtime, fetchRealTimeAnalytics } = useCustomerAnalytics({
    autoFetch: true,
    refetchInterval: 10000, // Refresh every 10 seconds
    ...options
  });

  return {
    data: realtime.data,
    loading: realtime.loading,
    error: realtime.error,
    refresh: fetchRealTimeAnalytics
  };
};

/**
 * Hook for analytics data export functionality
 */
export const useAnalyticsExport = () => {
  const [exportState, setExportState] = useState({
    loading: false,
    progress: 0,
    error: null,
    downloadUrl: null
  });

  const exportAnalytics = useCallback(async (params) => {
    setExportState({ loading: true, progress: 0, error: null, downloadUrl: null });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 500);

      const result = await customerAnalyticsService.exportAnalyticsData(params);
      
      clearInterval(progressInterval);
      
      setExportState({
        loading: false,
        progress: 100,
        error: null,
        downloadUrl: result.downloadUrl
      });

      return result;
    } catch (error) {
      setExportState({
        loading: false,
        progress: 0,
        error: error.message,
        downloadUrl: null
      });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setExportState({
      loading: false,
      progress: 0,
      error: null,
      downloadUrl: null
    });
  }, []);

  return {
    ...exportState,
    exportAnalytics,
    reset
  };
};

export default useCustomerAnalytics;