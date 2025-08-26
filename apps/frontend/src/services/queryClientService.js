// React Query Data Caching Service
// Implementation of API-010: Data caching with React Query
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import httpService from './httpClient';
import { ApiError } from './httpClient';
import errorHandlingService from './errorHandlingService';

/**
 * Query key factory for consistent cache key generation
 */
export const queryKeys = {
  // Dashboard queries
  dashboard: ['dashboard'],
  dashboardSummary: (params) => [...queryKeys.dashboard, 'summary', params],
  
  // Customer queries
  customers: ['customers'],
  customer: (id) => [...queryKeys.customers, id],
  customerProfile: (id) => [...queryKeys.customers, id, 'profile'],
  customerAnalytics: (id, params) => [...queryKeys.customers, id, 'analytics', params],
  customerSegment: (id) => [...queryKeys.customers, id, 'segment'],
  customerRecommendations: (id, params) => [...queryKeys.customers, id, 'recommendations', params],
  customerCostAnalytics: (id, params) => [...queryKeys.customers, id, 'cost-analytics', params],
  
  // Analytics queries
  analytics: ['analytics'],
  revenueAnalytics: (params) => [...queryKeys.analytics, 'revenue', params],
  inventoryAnalytics: (params) => [...queryKeys.analytics, 'inventory', params],
  orderAnalytics: (params) => [...queryKeys.analytics, 'orders', params],
  productAnalytics: (params) => [...queryKeys.analytics, 'products', params],
  predictiveAnalytics: (params) => [...queryKeys.analytics, 'predictive', params],
  realTimeAnalytics: (params) => [...queryKeys.analytics, 'realtime', params],
  
  // Cost analytics queries
  costAnalytics: ['cost-analytics'],
  costOverview: (params) => [...queryKeys.costAnalytics, 'overview', params],
  topCustomersCost: (params) => [...queryKeys.costAnalytics, 'top-customers', params],
  costBreakdown: (params) => [...queryKeys.costAnalytics, 'breakdown', params],
  costTrends: (params) => [...queryKeys.costAnalytics, 'trends', params],
  
  // Batch processing queries
  batch: ['batch'],
  batchJob: (id) => [...queryKeys.batch, 'job', id],
  batchHistory: (params) => [...queryKeys.batch, 'history', params],
  batchQueue: (params) => [...queryKeys.batch, 'queue', params],
  
  // A/B testing queries
  abTests: ['ab-tests'],
  abTest: (id) => [...queryKeys.abTests, id],
  abTestResults: (id) => [...queryKeys.abTests, id, 'results'],
  
  // Real-time streaming queries
  streaming: ['streaming'],
  streamingInsights: (customerId, params) => [...queryKeys.streaming, 'insights', customerId, params],
  streamingOverview: () => [...queryKeys.streaming, 'overview'],
  
  // Inventory queries
  inventory: ['inventory'],
  inventoryItems: (params) => [...queryKeys.inventory, 'items', params],
  inventoryForecasts: (params) => [...queryKeys.inventory, 'forecasts', params],
  inventoryAlerts: () => [...queryKeys.inventory, 'alerts'],
  
  // Authentication queries
  auth: ['auth'],
  currentUser: () => [...queryKeys.auth, 'current-user'],
  userPermissions: () => [...queryKeys.auth, 'permissions']
};

/**
 * Cache configuration for different data types
 */
const cacheConfig = {
  // Real-time data - short cache times
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true
  },
  
  // Analytics data - medium cache times
  analytics: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 3
  },
  
  // Static/reference data - long cache times
  reference: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2
  },
  
  // User-specific data - medium cache with focus refresh
  user: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    retry: 3
  },
  
  // Batch/background operations - long cache times
  background: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 45 * 60 * 1000, // 45 minutes
    refetchOnWindowFocus: false,
    retry: 1
  }
};

/**
 * Global error handler for React Query
 */
const handleQueryError = (error, query) => {
  // Log the error with context
  const enhancedError = errorHandlingService.enhanceError(error, {
    component: 'ReactQuery',
    action: 'query_error',
    metadata: {
      queryKey: query.queryKey,
      queryHash: query.queryHash,
      state: query.state
    }
  });

  // Handle specific error types
  if (enhancedError.code === 'UNAUTHORIZED') {
    // Clear all user-related cache on auth errors
    queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    queryClient.invalidateQueries({ queryKey: queryKeys.customers });
  }

  // Report error
  errorHandlingService.handleError(enhancedError);
};

/**
 * Global success handler for mutations
 */
const handleMutationSuccess = (data, variables, context, mutation) => {
  // Auto-invalidate related queries based on mutation type
  const mutationKey = mutation.options.mutationKey;
  if (mutationKey) {
    const [scope] = mutationKey;
    
    switch (scope) {
      case 'customer':
        // Invalidate customer-related queries
        queryClient.invalidateQueries({ queryKey: queryKeys.customers });
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
        break;
      
      case 'inventory':
        // Invalidate inventory-related queries
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
        break;
      
      case 'batch':
        // Invalidate batch-related queries
        queryClient.invalidateQueries({ queryKey: queryKeys.batch });
        break;
      
      case 'auth':
        // Invalidate auth-related queries
        queryClient.invalidateQueries({ queryKey: queryKeys.auth });
        break;
    }
  }
};

/**
 * Create and configure QueryClient instance
 */
const createQueryClient = () => {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
      onSuccess: (data, query) => {
        // Log successful queries in debug mode
        if (import.meta.env.DEV) {
          console.log('Query success:', query.queryKey, data);
        }
      }
    }),
    
    mutationCache: new MutationCache({
      onSuccess: handleMutationSuccess,
      onError: (error, variables, context, mutation) => {
        handleQueryError(error, { 
          queryKey: mutation.options.mutationKey || ['unknown_mutation'],
          queryHash: mutation.mutationId,
          state: mutation.state
        });
      }
    }),
    
    defaultOptions: {
      queries: {
        // Global query defaults
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
          // Don't retry on auth errors
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        
        // Network mode configuration
        networkMode: 'online',
        
        // Error handling
        useErrorBoundary: false,
        
        // Suspense support (disabled by default)
        suspense: false
      },
      
      mutations: {
        // Global mutation defaults
        retry: 1,
        retryDelay: 2000,
        networkMode: 'online',
        useErrorBoundary: false,
        
        // Optimistic updates context
        onMutate: async (variables) => {
          // Return snapshot for rollback if needed
          return { variables, timestamp: Date.now() };
        }
      }
    }
  });
};

// Create singleton QueryClient instance
export const queryClient = createQueryClient();

/**
 * Query Client Service for advanced cache management
 */
class QueryClientService {
  constructor(client = queryClient) {
    this.client = client;
    this.offlineQueue = [];
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // Setup network status monitoring
    this.setupNetworkStatusMonitoring();
  }

  /**
   * Setup network status monitoring
   */
  setupNetworkStatusMonitoring() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network back online - resuming queries');
      
      // Resume queries
      this.client.resumePausedMutations();
      
      // Process offline queue
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network offline - pausing queries');
    });
  }

  /**
   * Get cached data for a specific query
   */
  getCachedData(queryKey) {
    return this.client.getQueryData(queryKey);
  }

  /**
   * Set data in cache
   */
  setCachedData(queryKey, data, options = {}) {
    this.client.setQueryData(queryKey, data, options);
  }

  /**
   * Invalidate specific queries
   */
  invalidateQueries(filters = {}) {
    return this.client.invalidateQueries(filters);
  }

  /**
   * Refetch specific queries
   */
  refetchQueries(filters = {}) {
    return this.client.refetchQueries(filters);
  }

  /**
   * Cancel outgoing queries
   */
  cancelQueries(filters = {}) {
    return this.client.cancelQueries(filters);
  }

  /**
   * Remove queries from cache
   */
  removeQueries(filters = {}) {
    this.client.removeQueries(filters);
  }

  /**
   * Reset entire query cache
   */
  resetQueryCache() {
    return this.client.resetQueries();
  }

  /**
   * Clear query cache
   */
  clearCache() {
    this.client.clear();
  }

  /**
   * Prefetch data
   */
  async prefetchQuery(queryKey, queryFn, options = {}) {
    return this.client.prefetchQuery({
      queryKey,
      queryFn,
      ...options
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const cache = this.client.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      invalidQueries: queries.filter(q => q.state.isInvalidated || false).length, // Fixed: use state.isInvalidated
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      loadingQueries: queries.filter(q => q.state.status === 'loading').length,
      successQueries: queries.filter(q => q.state.status === 'success').length,
      cacheSize: this.estimateCacheSize(queries),
      oldestQuery: this.getOldestQuery(queries),
      newestQuery: this.getNewestQuery(queries)
    };

    return stats;
  }

  /**
   * Estimate cache size in KB
   */
  estimateCacheSize(queries) {
    try {
      const dataSize = queries.reduce((total, query) => {
        if (query.state.data) {
          return total + JSON.stringify(query.state.data).length;
        }
        return total;
      }, 0);
      
      return Math.round(dataSize / 1024); // Convert to KB
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get oldest query timestamp
   */
  getOldestQuery(queries) {
    if (queries.length === 0) return null;
    
    return queries.reduce((oldest, query) => {
      const queryTime = query.state.dataUpdatedAt;
      return queryTime < oldest ? queryTime : oldest;
    }, queries[0].state.dataUpdatedAt);
  }

  /**
   * Get newest query timestamp
   */
  getNewestQuery(queries) {
    if (queries.length === 0) return null;
    
    return queries.reduce((newest, query) => {
      const queryTime = query.state.dataUpdatedAt;
      return queryTime > newest ? queryTime : newest;
    }, queries[0].state.dataUpdatedAt);
  }

  /**
   * Optimistic update helper
   */
  async optimisticUpdate(queryKey, updaterFn, rollbackFn = null) {
    // Cancel outgoing queries
    await this.cancelQueries({ queryKey });
    
    // Snapshot previous value
    const previousData = this.getCachedData(queryKey);
    
    // Optimistically update
    this.setCachedData(queryKey, updaterFn(previousData));
    
    // Return rollback function
    return () => {
      if (rollbackFn) {
        rollbackFn();
      } else {
        this.setCachedData(queryKey, previousData);
      }
    };
  }

  /**
   * Batch invalidation for related queries
   */
  invalidateRelatedQueries(scope) {
    const invalidationMap = {
      customer: [
        { queryKey: queryKeys.customers },
        { queryKey: queryKeys.analytics },
        { queryKey: queryKeys.costAnalytics }
      ],
      inventory: [
        { queryKey: queryKeys.inventory },
        { queryKey: queryKeys.analytics }
      ],
      analytics: [
        { queryKey: queryKeys.analytics },
        { queryKey: queryKeys.dashboard }
      ],
      auth: [
        { queryKey: queryKeys.auth },
        { queryKey: queryKeys.customers }
      ]
    };

    const queries = invalidationMap[scope];
    if (queries) {
      queries.forEach(filter => this.invalidateQueries(filter));
    }
  }

  /**
   * Cache warming - preload important queries
   */
  async warmCache() {
    const warmupQueries = [
      {
        queryKey: queryKeys.dashboardSummary({}),
        queryFn: () => httpService.get('/dashboard/summary'),
        ...cacheConfig.analytics
      },
      {
        queryKey: queryKeys.currentUser(),
        queryFn: () => httpService.get('/auth/me'),
        ...cacheConfig.user
      },
      {
        queryKey: queryKeys.realTimeAnalytics({}),
        queryFn: () => httpService.get('/analytics/realtime'),
        ...cacheConfig.realtime
      }
    ];

    const results = await Promise.allSettled(
      warmupQueries.map(query => this.prefetchQuery(
        query.queryKey,
        query.queryFn,
        query
      ))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Cache warming completed: ${successful} successful, ${failed} failed`);
    
    return { successful, failed, total: warmupQueries.length };
  }

  /**
   * Process offline queue when back online
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} offline operations`);

    const results = await Promise.allSettled(
      this.offlineQueue.map(operation => operation())
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Offline queue processed: ${successful} successful, ${failed} failed`);

    // Clear the queue
    this.offlineQueue = [];

    return { successful, failed };
  }

  /**
   * Add operation to offline queue
   */
  addToOfflineQueue(operation) {
    this.offlineQueue.push(operation);
  }

  /**
   * Memory cleanup - remove stale queries
   */
  cleanupCache() {
    const cache = this.client.getQueryCache();
    const queries = cache.getAll();
    
    // Remove queries older than 1 hour with no observers
    const cutoff = Date.now() - (60 * 60 * 1000);
    let removed = 0;

    queries.forEach(query => {
      if (
        query.getObserversCount() === 0 &&
        query.state.dataUpdatedAt < cutoff
      ) {
        cache.remove(query);
        removed++;
      }
    });

    console.log(`Cache cleanup: removed ${removed} stale queries`);
    return removed;
  }

  /**
   * Export cache state for persistence
   */
  exportCacheState() {
    try {
      const cache = this.client.getQueryCache();
      const queries = cache.getAll();
      
      const state = queries.map(query => ({
        queryKey: query.queryKey,
        queryHash: query.queryHash,
        state: {
          data: query.state.data,
          dataUpdatedAt: query.state.dataUpdatedAt,
          status: query.state.status
        }
      }));

      return JSON.stringify(state);
    } catch (error) {
      console.error('Failed to export cache state:', error);
      return null;
    }
  }

  /**
   * Import cache state from persistence
   */
  importCacheState(stateString) {
    try {
      const state = JSON.parse(stateString);
      
      state.forEach(({ queryKey, state: queryState }) => {
        this.setCachedData(queryKey, queryState.data);
      });

      console.log(`Imported ${state.length} cached queries`);
      return state.length;
    } catch (error) {
      console.error('Failed to import cache state:', error);
      return 0;
    }
  }
}

// Create singleton service instance
const queryClientService = new QueryClientService();

// Export service and utilities
export default queryClientService;
export { QueryClientService, cacheConfig };

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    queryClientService.cleanupCache();
  });
}