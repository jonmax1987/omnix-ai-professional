/**
 * Optimized Data Service - PERF-006
 * Centralized query optimization service for all store integrations
 * Provides optimized data fetching, caching, and processing for OMNIX AI stores
 */

import { queryOptimizer, queryCache, DatabasePatterns, createOptimizedStore } from '../utils/queryOptimization.js';

/**
 * Optimized data service configuration
 */
const SERVICE_CONFIG = {
  CACHE_TTL: {
    DASHBOARD: 2 * 60 * 1000,    // 2 minutes
    PRODUCTS: 5 * 60 * 1000,     // 5 minutes
    ORDERS: 3 * 60 * 1000,       // 3 minutes
    CUSTOMERS: 10 * 60 * 1000,   // 10 minutes
    ANALYTICS: 1 * 60 * 1000     // 1 minute
  },
  BATCH_SIZES: {
    PRODUCTS: 50,
    ORDERS: 25,
    CUSTOMERS: 100
  },
  SEARCH_INDEX_CONFIG: {
    PRODUCTS: ['name', 'sku', 'description', 'supplier', 'category'],
    CUSTOMERS: ['name', 'email', 'phone'],
    ORDERS: ['orderNumber', 'customerName', 'status']
  }
};

/**
 * Optimized Data Service Class
 */
export class OptimizedDataService {
  constructor() {
    this.searchIndexes = new Map();
    this.optimizedQueries = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the service with API endpoints
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Import API services
      const { dashboardAPI, productsAPI, ordersAPI, customersAPI } = await import('./api.js');

      // Create optimized query functions
      this.createOptimizedQueries(dashboardAPI, productsAPI, ordersAPI, customersAPI);
      
      this.initialized = true;
      console.log('[OptimizedDataService] Initialized successfully');
    } catch (error) {
      console.error('[OptimizedDataService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create optimized query functions for all endpoints
   */
  createOptimizedQueries(dashboardAPI, productsAPI, ordersAPI, customersAPI) {
    // Dashboard queries
    this.optimizedQueries.set('dashboard.summary', queryOptimizer.createOptimizedQuery(
      'dashboard-summary',
      async (params, options) => await dashboardAPI.getDashboardSummary(params),
      {
        cacheTtl: SERVICE_CONFIG.CACHE_TTL.DASHBOARD,
        enableDeduplication: true,
        enableDebounce: false,
        enablePrefetch: false
      }
    ));

    this.optimizedQueries.set('dashboard.analytics', queryOptimizer.createOptimizedQuery(
      'dashboard-analytics',
      async (params, options) => await dashboardAPI.getAnalytics(params),
      {
        cacheTtl: SERVICE_CONFIG.CACHE_TTL.ANALYTICS,
        enableDeduplication: true,
        enableDebounce: false,
        enablePrefetch: false
      }
    ));

    // Product queries
    this.optimizedQueries.set('products.list', queryOptimizer.createOptimizedQuery(
      'products',
      async (params, options) => await productsAPI.getProducts(params),
      {
        cacheTtl: SERVICE_CONFIG.CACHE_TTL.PRODUCTS,
        enableDeduplication: true,
        enableDebounce: true,
        enablePrefetch: true,
        keyGenerator: this.createProductsKeyGenerator()
      }
    ));

    this.optimizedQueries.set('products.detail', queryOptimizer.createOptimizedQuery(
      'product-detail',
      async (params, options) => await productsAPI.getProduct(params.id),
      {
        cacheTtl: SERVICE_CONFIG.CACHE_TTL.PRODUCTS,
        enableDeduplication: true,
        enableDebounce: false,
        enablePrefetch: false
      }
    ));

    // Order queries
    this.optimizedQueries.set('orders.list', queryOptimizer.createOptimizedQuery(
      'orders',
      async (params, options) => await ordersAPI.getOrders(params),
      {
        cacheTtl: SERVICE_CONFIG.CACHE_TTL.ORDERS,
        enableDeduplication: true,
        enableDebounce: true,
        enablePrefetch: true
      }
    ));

    // Customer queries (if available)
    if (customersAPI) {
      this.optimizedQueries.set('customers.list', queryOptimizer.createOptimizedQuery(
        'customers',
        async (params, options) => await customersAPI.getCustomers(params),
        {
          cacheTtl: SERVICE_CONFIG.CACHE_TTL.CUSTOMERS,
          enableDeduplication: true,
          enableDebounce: true,
          enablePrefetch: true
        }
      ));
    }
  }

  /**
   * Create custom key generator for products
   */
  createProductsKeyGenerator() {
    return (params, options) => {
      const { search, page, limit, sortBy, sortOrder, category, supplier, location, ...filters } = params;
      
      // Create hierarchical key structure for better cache management
      const filterKey = Object.keys(filters).sort().map(key => `${key}:${filters[key]}`).join(',');
      const searchKey = search ? `search:${search}` : '';
      const paginationKey = `page:${page || 1},limit:${limit || 25}`;
      const sortKey = `sort:${sortBy || 'name'},order:${sortOrder || 'asc'}`;
      
      return `products:${filterKey}:${searchKey}:${paginationKey}:${sortKey}`;
    };
  }

  /**
   * Initialize search index for a specific entity type
   */
  initializeSearchIndex(entityType, data, searchFields) {
    const fields = searchFields || SERVICE_CONFIG.SEARCH_INDEX_CONFIG[entityType.toUpperCase()];
    if (!fields) {
      console.warn(`[OptimizedDataService] No search fields configured for ${entityType}`);
      return;
    }

    const index = DatabasePatterns.createSearchIndex(data, fields);
    this.searchIndexes.set(entityType, index);
    
    console.log(`[OptimizedDataService] Search index created for ${entityType} (${data.length} items)`);
  }

  /**
   * Get optimized query function
   */
  getOptimizedQuery(endpoint) {
    return this.optimizedQueries.get(endpoint);
  }

  /**
   * Perform optimized search across indexed data
   */
  optimizedSearch(entityType, data, query, minScore = 0.3) {
    const index = this.searchIndexes.get(entityType);
    if (!index) {
      console.warn(`[OptimizedDataService] No search index found for ${entityType}`);
      return data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
      );
    }

    return DatabasePatterns.searchWithIndex(data, index, query, minScore);
  }

  /**
   * Apply optimized filtering pipeline
   */
  applyOptimizedFilters(data, filters) {
    return DatabasePatterns.createFilterPipeline(data, filters);
  }

  /**
   * Apply optimized sorting pipeline
   */
  applyOptimizedSort(data, sortBy, sortOrder = 'asc') {
    return DatabasePatterns.createSortPipeline(data, sortBy, sortOrder);
  }

  /**
   * Create optimized pagination
   */
  createOptimizedPagination(data, page, limit, useCursor = false, cursor = null) {
    if (useCursor) {
      return DatabasePatterns.createCursorPagination(data, cursor, limit);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      items: data.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Batch process multiple requests
   */
  async batchProcess(endpoint, items, batchSize = 50) {
    const query = this.getOptimizedQuery(endpoint);
    if (!query) {
      throw new Error(`No optimized query found for endpoint: ${endpoint}`);
    }

    return queryOptimizer.batch(endpoint, items, async (batch) => {
      const results = await Promise.all(
        batch.map(item => query(item))
      );
      return results;
    }, { batchSize });
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats() {
    return {
      query: queryCache.getStats(),
      searchIndexes: Array.from(this.searchIndexes.keys()).map(key => ({
        entity: key,
        size: this.searchIndexes.get(key)?.size || 0
      }))
    };
  }

  /**
   * Clear all caches and indexes
   */
  clearCaches() {
    queryCache.clear();
    this.searchIndexes.clear();
    console.log('[OptimizedDataService] All caches cleared');
  }

  /**
   * Invalidate specific cache patterns
   */
  invalidateCache(pattern) {
    queryCache.invalidate(pattern);
    console.log(`[OptimizedDataService] Cache invalidated for pattern:`, pattern);
  }

  /**
   * Create performance monitoring metrics
   */
  getPerformanceMetrics() {
    const cacheStats = queryCache.getStats();
    return {
      cache: {
        hitRate: cacheStats.hitRate,
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
        efficiency: cacheStats.hitRate > 70 ? 'excellent' : cacheStats.hitRate > 50 ? 'good' : 'poor'
      },
      searchIndexes: this.searchIndexes.size,
      optimizedQueries: this.optimizedQueries.size,
      status: this.initialized ? 'ready' : 'initializing'
    };
  }
}

/**
 * Global optimized data service instance
 */
export const optimizedDataService = new OptimizedDataService();

/**
 * Store integration helpers
 */
export const storeOptimizations = {
  /**
   * Create optimized store enhancer for products
   */
  createProductsStoreEnhancer() {
    return {
      // Initialize optimizations
      async initializeOptimizations() {
        await optimizedDataService.initialize();
        
        const optimizedQuery = optimizedDataService.getOptimizedQuery('products.list');
        return {
          optimizedFetchProducts: optimizedQuery,
          searchProducts: (data, query) => optimizedDataService.optimizedSearch('products', data, query),
          filterProducts: (data, filters) => optimizedDataService.applyOptimizedFilters(data, filters),
          sortProducts: (data, sortBy, sortOrder) => optimizedDataService.applyOptimizedSort(data, sortBy, sortOrder)
        };
      },

      // Initialize search index for products
      initializeSearchIndex(products) {
        optimizedDataService.initializeSearchIndex('products', products);
      }
    };
  },

  /**
   * Create optimized store enhancer for dashboard
   */
  createDashboardStoreEnhancer() {
    return {
      async initializeOptimizations() {
        await optimizedDataService.initialize();
        
        return {
          optimizedFetchSummary: optimizedDataService.getOptimizedQuery('dashboard.summary'),
          optimizedFetchAnalytics: optimizedDataService.getOptimizedQuery('dashboard.analytics')
        };
      }
    };
  },

  /**
   * Create optimized store enhancer for orders
   */
  createOrdersStoreEnhancer() {
    return {
      async initializeOptimizations() {
        await optimizedDataService.initialize();
        
        return {
          optimizedFetchOrders: optimizedDataService.getOptimizedQuery('orders.list'),
          searchOrders: (data, query) => optimizedDataService.optimizedSearch('orders', data, query),
          filterOrders: (data, filters) => optimizedDataService.applyOptimizedFilters(data, filters)
        };
      }
    };
  }
};

export default optimizedDataService;