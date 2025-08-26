// React Query Hooks for OMNIX AI Services
// Comprehensive hooks for all API integrations with React Query
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, cacheConfig } from '../services/queryClientService';
import httpService from '../services/httpClient';
import customerAnalyticsService from '../services/customerAnalyticsService';
import costAnalyticsService from '../services/costAnalyticsService';
import batchProcessingService from '../services/batchProcessingService';

// =============================================================================
// DASHBOARD HOOKS
// =============================================================================

/**
 * Dashboard summary hook
 */
export const useDashboardSummary = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(params),
    queryFn: () => customerAnalyticsService.getDashboardSummary(params),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * Real-time analytics hook with auto-refresh
 */
export const useRealTimeAnalytics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.realTimeAnalytics(params),
    queryFn: () => customerAnalyticsService.getRealTimeAnalytics(params),
    ...cacheConfig.realtime,
    ...options
  });
};

// =============================================================================
// CUSTOMER ANALYTICS HOOKS
// =============================================================================

/**
 * Customer profile hook
 */
export const useCustomerProfile = (customerId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.customerProfile(customerId),
    queryFn: () => httpService.get(`/v1/customers/${customerId}/profile`),
    ...cacheConfig.user,
    enabled: !!customerId,
    ...options
  });
};

/**
 * Customer analytics hook
 */
export const useCustomerAnalytics = (customerId, params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.customerAnalytics(customerId, params),
    queryFn: () => httpService.get(`/v1/customers/${customerId}/ai-analysis`, params),
    ...cacheConfig.analytics,
    enabled: !!customerId,
    ...options
  });
};

/**
 * Customer segmentation hook
 */
export const useCustomerSegment = (customerId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.customerSegment(customerId),
    queryFn: () => httpService.get(`/v1/customers/${customerId}/segment`),
    ...cacheConfig.analytics,
    enabled: !!customerId,
    ...options
  });
};

/**
 * Customer recommendations hook
 */
export const useCustomerRecommendations = (customerId, params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.customerRecommendations(customerId, params),
    queryFn: () => httpService.get(`/v1/customers/${customerId}/ai-recommendations`, params),
    ...cacheConfig.user,
    enabled: !!customerId,
    ...options
  });
};

/**
 * Revenue analytics hook
 */
export const useRevenueAnalytics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.revenueAnalytics(params),
    queryFn: () => customerAnalyticsService.getRevenueAnalytics(params),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * Customer analytics with pagination
 */
export const useCustomerAnalyticsInfinite = (params = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.customerAnalytics('all', params),
    queryFn: ({ pageParam = 1 }) => 
      customerAnalyticsService.getCustomerAnalytics({ ...params, page: pageParam }),
    ...cacheConfig.analytics,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.pagination && lastPage.pagination.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    ...options
  });
};

// =============================================================================
// COST ANALYTICS HOOKS
// =============================================================================

/**
 * Customer cost analytics hook
 */
export const useCustomerCostAnalytics = (customerId, params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.customerCostAnalytics(customerId, params),
    queryFn: () => costAnalyticsService.getCustomerCostAnalytics(customerId, params),
    ...cacheConfig.analytics,
    enabled: !!customerId,
    ...options
  });
};

/**
 * Cost overview hook
 */
export const useCostOverview = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.costOverview(params),
    queryFn: () => costAnalyticsService.getCostOverview(params),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * Top customers by cost hook
 */
export const useTopCustomersByCost = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.topCustomersCost(params),
    queryFn: () => costAnalyticsService.getTopCustomersByCost(params),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * Cost breakdown hook
 */
export const useCostBreakdown = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.costBreakdown(params),
    queryFn: () => costAnalyticsService.getCostBreakdown(params),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * Cost trends hook
 */
export const useCostTrends = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.costTrends(params),
    queryFn: () => costAnalyticsService.getCostTrends(params),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * Model cost comparison hook
 */
export const useModelCostComparison = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['cost-analytics', 'model-comparison', params],
    queryFn: () => costAnalyticsService.getModelCostComparison(params),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * Cost alerts hook
 */
export const useCostAlerts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['cost-analytics', 'alerts', params],
    queryFn: () => costAnalyticsService.getCostAlerts(params),
    ...cacheConfig.realtime,
    ...options
  });
};

// =============================================================================
// BATCH PROCESSING HOOKS
// =============================================================================

/**
 * Batch job status hook with polling
 */
export const useBatchJobStatus = (batchId, options = {}) => {
  const { refetchInterval = 30000, ...queryOptions } = options;
  
  return useQuery({
    queryKey: queryKeys.batchJob(batchId),
    queryFn: () => batchProcessingService.getBatchStatus(batchId),
    ...cacheConfig.background,
    enabled: !!batchId,
    refetchInterval: (data) => {
      // Stop polling if job is completed, failed, or cancelled
      if (data && ['completed', 'failed', 'cancelled'].includes(data.status)) {
        return false;
      }
      return refetchInterval;
    },
    ...queryOptions
  });
};

/**
 * Batch queue statistics hook
 */
export const useBatchQueueStats = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.batchQueue(params),
    queryFn: () => batchProcessingService.getQueueStatistics(params),
    ...cacheConfig.realtime,
    ...options
  });
};

/**
 * Batch history hook with infinite loading
 */
export const useBatchHistoryInfinite = (params = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.batchHistory(params),
    queryFn: ({ pageParam = 0 }) => 
      batchProcessingService.getBatchHistory({ ...params, offset: pageParam }),
    ...cacheConfig.background,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.batches && lastPage.batches.length === params.limit) {
        return allPages.length * params.limit;
      }
      return undefined;
    },
    ...options
  });
};

/**
 * Batch results hook
 */
export const useBatchResults = (batchId, params = {}, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.batchJob(batchId), 'results', params],
    queryFn: () => batchProcessingService.getBatchResults(batchId, params),
    ...cacheConfig.background,
    enabled: !!batchId,
    ...options
  });
};

// =============================================================================
// A/B TESTING HOOKS
// =============================================================================

/**
 * A/B tests list hook
 */
export const useABTests = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.abTests,
    queryFn: () => httpService.get('/v1/ab-tests'),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * A/B test results hook
 */
export const useABTestResults = (testId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.abTestResults(testId),
    queryFn: () => httpService.get(`/v1/ab-tests/${testId}/results`),
    ...cacheConfig.analytics,
    enabled: !!testId,
    ...options
  });
};

/**
 * Available AI models hook
 */
export const useAvailableModels = (options = {}) => {
  return useQuery({
    queryKey: ['ab-tests', 'models', 'available'],
    queryFn: () => httpService.get('/v1/ab-tests/models/available'),
    ...cacheConfig.reference,
    ...options
  });
};

// =============================================================================
// STREAMING ANALYTICS HOOKS
// =============================================================================

/**
 * Customer insights hook with real-time updates
 */
export const useCustomerInsights = (customerId, params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.streamingInsights(customerId, params),
    queryFn: () => httpService.get(`/v1/streaming/insights/${customerId}`, params),
    ...cacheConfig.realtime,
    enabled: !!customerId,
    ...options
  });
};

/**
 * System insights overview hook
 */
export const useSystemInsightsOverview = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.streamingOverview(),
    queryFn: () => httpService.get('/v1/streaming/insights/system/overview'),
    ...cacheConfig.realtime,
    ...options
  });
};

// =============================================================================
// INVENTORY HOOKS
// =============================================================================

/**
 * Inventory analytics hook
 */
export const useInventoryAnalytics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.inventoryAnalytics(params),
    queryFn: () => customerAnalyticsService.getInventoryAnalytics(params),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * Inventory items with infinite scrolling
 */
export const useInventoryItemsInfinite = (params = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.inventoryItems(params),
    queryFn: ({ pageParam = 1 }) => 
      httpService.get('/v1/inventory/items', { ...params, page: pageParam }),
    ...cacheConfig.reference,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.pagination && lastPage.pagination.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    ...options
  });
};

/**
 * Inventory forecasts hook
 */
export const useInventoryForecasts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.inventoryForecasts(params),
    queryFn: () => httpService.get('/v1/inventory/forecasts', params),
    ...cacheConfig.analytics,
    ...options
  });
};

/**
 * Inventory alerts hook
 */
export const useInventoryAlerts = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.inventoryAlerts(),
    queryFn: () => httpService.get('/v1/inventory/alerts'),
    ...cacheConfig.realtime,
    ...options
  });
};

// =============================================================================
// AUTHENTICATION HOOKS
// =============================================================================

/**
 * Current user hook
 */
export const useCurrentUser = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.currentUser(),
    queryFn: () => httpService.get('/auth/me'),
    ...cacheConfig.user,
    ...options
  });
};

/**
 * User permissions hook
 */
export const useUserPermissions = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.userPermissions(),
    queryFn: () => httpService.get('/auth/permissions'),
    ...cacheConfig.user,
    ...options
  });
};

// =============================================================================
// MUTATION HOOKS
// =============================================================================

/**
 * Submit batch analysis mutation
 */
export const useSubmitBatchAnalysis = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['batch', 'submit'],
    mutationFn: (batchRequest) => batchProcessingService.submitBatchAnalysis(batchRequest),
    onSuccess: (data, variables, context) => {
      // Invalidate batch queries
      queryClient.invalidateQueries({ queryKey: queryKeys.batch });
      
      // Start polling for the new batch job
      queryClient.prefetchQuery({
        queryKey: queryKeys.batchJob(data.batchId),
        queryFn: () => batchProcessingService.getBatchStatus(data.batchId),
        ...cacheConfig.background
      });
    },
    ...options
  });
};

/**
 * Cancel batch job mutation
 */
export const useCancelBatchJob = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['batch', 'cancel'],
    mutationFn: ({ batchId, reason }) => batchProcessingService.cancelBatchJob(batchId, reason),
    onSuccess: (data, variables, context) => {
      // Update specific batch job status
      queryClient.setQueryData(
        queryKeys.batchJob(variables.batchId),
        (oldData) => ({ ...oldData, status: 'cancelled' })
      );
      
      // Invalidate batch history
      queryClient.invalidateQueries({ queryKey: queryKeys.batchHistory() });
    },
    ...options
  });
};

/**
 * Create A/B test mutation
 */
export const useCreateABTest = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['ab-tests', 'create'],
    mutationFn: (testConfig) => httpService.post('/v1/ab-tests', testConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.abTests });
    },
    ...options
  });
};

/**
 * Create quick A/B test mutation
 */
export const useCreateQuickABTest = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['ab-tests', 'quick-create'],
    mutationFn: (testConfig) => httpService.post('/v1/ab-tests/quick-test', testConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.abTests });
    },
    ...options
  });
};

/**
 * Set budget and alerts mutation
 */
export const useSetBudgetAndAlerts = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['cost-analytics', 'budget'],
    mutationFn: (budgetConfig) => costAnalyticsService.setBudgetAndAlerts(budgetConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.costAnalytics });
    },
    ...options
  });
};

/**
 * Generate optimization report mutation
 */
export const useGenerateOptimizationReport = (options = {}) => {
  return useMutation({
    mutationKey: ['cost-analytics', 'optimization-report'],
    mutationFn: (params) => costAnalyticsService.generateOptimizationReport(params),
    ...options
  });
};

/**
 * Publish streaming event mutation
 */
export const usePublishStreamingEvent = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['streaming', 'publish'],
    mutationFn: (event) => {
      const eventType = event.type || 'purchase';
      return httpService.post(`/v1/streaming/events/${eventType}`, event);
    },
    onSuccess: (data, variables) => {
      // Invalidate related streaming queries
      if (variables.customerId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.streamingInsights(variables.customerId, {}) 
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.streamingOverview() });
    },
    ...options
  });
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Prefetch hook for warming up queries
 */
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();
  
  const prefetchDashboard = () => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.dashboardSummary({}),
      queryFn: () => customerAnalyticsService.getDashboardSummary(),
      ...cacheConfig.analytics
    });
  };
  
  const prefetchCurrentUser = () => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.currentUser(),
      queryFn: () => httpService.get('/auth/me'),
      ...cacheConfig.user
    });
  };
  
  const prefetchCostOverview = () => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.costOverview({}),
      queryFn: () => costAnalyticsService.getCostOverview(),
      ...cacheConfig.analytics
    });
  };
  
  return {
    prefetchDashboard,
    prefetchCurrentUser,
    prefetchCostOverview,
    prefetchAll: () => Promise.all([
      prefetchDashboard(),
      prefetchCurrentUser(),
      prefetchCostOverview()
    ])
  };
};

/**
 * Cache management hook
 */
export const useCacheManagement = () => {
  const queryClient = useQueryClient();
  
  const invalidateAll = () => {
    return queryClient.invalidateQueries();
  };
  
  const clearCache = () => {
    return queryClient.clear();
  };
  
  const invalidateCustomerData = (customerId) => {
    return queryClient.invalidateQueries({ 
      predicate: (query) => 
        query.queryKey.includes('customers') && 
        query.queryKey.includes(customerId)
    });
  };
  
  const invalidateAnalytics = () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
  };
  
  return {
    invalidateAll,
    clearCache,
    invalidateCustomerData,
    invalidateAnalytics
  };
};