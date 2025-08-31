/**
 * Database Query Optimization Patterns - PERF-006
 * Advanced client-side query optimization, caching, and data management strategies
 */

import { LRUCache } from 'lru-cache';

/**
 * Query cache configuration
 */
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000,      // 5 minutes
  MAX_SIZE: 100,                   // Maximum number of cached queries
  BATCH_SIZE: 50,                  // Maximum batch size for bulk operations
  DEBOUNCE_DELAY: 300,             // Debounce delay for search queries
  PREFETCH_THRESHOLD: 0.8          // Prefetch when 80% through current page
};

/**
 * Advanced LRU Cache for query results
 */
class QueryCache {
  constructor(options = {}) {
    this.cache = new LRUCache({
      max: options.maxSize || CACHE_CONFIG.MAX_SIZE,
      ttl: options.ttl || CACHE_CONFIG.DEFAULT_TTL,
      allowStale: true,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });
    
    this.hitCount = 0;
    this.missCount = 0;
    this.keyGenerators = new Map();
  }

  /**
   * Generate cache key from query parameters
   */
  generateKey(endpoint, params = {}, options = {}) {
    const keyGenerator = this.keyGenerators.get(endpoint);
    if (keyGenerator) {
      return keyGenerator(params, options);
    }
    
    // Default key generation
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}:${JSON.stringify(options)}`;
  }

  /**
   * Register custom key generator for specific endpoint
   */
  registerKeyGenerator(endpoint, generator) {
    this.keyGenerators.set(endpoint, generator);
  }

  /**
   * Get cached result
   */
  get(endpoint, params, options) {
    const key = this.generateKey(endpoint, params, options);
    const result = this.cache.get(key);
    
    if (result) {
      this.hitCount++;
      return result;
    }
    
    this.missCount++;
    return null;
  }

  /**
   * Set cache result
   */
  set(endpoint, params, options, data, customTtl) {
    const key = this.generateKey(endpoint, params, options);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      params: { ...params },
      options: { ...options }
    }, customTtl);
  }

  /**
   * Invalidate cache entries
   */
  invalidate(pattern) {
    if (typeof pattern === 'string') {
      // Exact key match
      this.cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
      // Regex pattern match
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    } else if (typeof pattern === 'function') {
      // Custom function match
      for (const [key, value] of this.cache.entries()) {
        if (pattern(key, value)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
      maxSize: this.cache.max
    };
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

/**
 * Global query cache instance
 */
export const queryCache = new QueryCache();

/**
 * Query optimization utilities
 */
export class QueryOptimizer {
  constructor() {
    this.pendingRequests = new Map();
    this.batchQueue = new Map();
    this.prefetchQueue = new Set();
    this.debounceTimers = new Map();
  }

  /**
   * Deduplicate identical requests
   */
  async deduplicate(requestFn, key) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      this.pendingRequests.delete(key);
      return result;
    } catch (error) {
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  /**
   * Batch multiple requests together
   */
  async batch(endpoint, items, batchProcessor, options = {}) {
    const batchSize = options.batchSize || CACHE_CONFIG.BATCH_SIZE;
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchKey = `${endpoint}:batch:${i}`;
      
      const batchResult = await this.deduplicate(
        () => batchProcessor(batch),
        batchKey
      );
      
      results.push(...batchResult);
    }

    return results;
  }

  /**
   * Debounce search queries
   */
  debounce(fn, key, delay = CACHE_CONFIG.DEBOUNCE_DELAY) {
    return new Promise((resolve, reject) => {
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(async () => {
        try {
          const result = await fn();
          this.debounceTimers.delete(key);
          resolve(result);
        } catch (error) {
          this.debounceTimers.delete(key);
          reject(error);
        }
      }, delay);

      this.debounceTimers.set(key, timer);
    });
  }

  /**
   * Prefetch next page of data
   */
  async prefetch(fetchFn, currentPage, totalPages, prefetchDistance = 2) {
    const prefetchPromises = [];
    
    for (let i = 1; i <= prefetchDistance; i++) {
      const nextPage = currentPage + i;
      if (nextPage <= totalPages) {
        const prefetchKey = `prefetch:page:${nextPage}`;
        
        if (!this.prefetchQueue.has(prefetchKey)) {
          this.prefetchQueue.add(prefetchKey);
          
          const prefetchPromise = fetchFn(nextPage).finally(() => {
            this.prefetchQueue.delete(prefetchKey);
          });
          
          prefetchPromises.push(prefetchPromise);
        }
      }
    }

    return Promise.all(prefetchPromises);
  }

  /**
   * Optimize query parameters
   */
  optimizeParams(params) {
    const optimized = { ...params };
    
    // Remove empty or undefined values
    Object.keys(optimized).forEach(key => {
      if (optimized[key] === undefined || optimized[key] === null || optimized[key] === '') {
        delete optimized[key];
      }
    });

    // Convert arrays to comma-separated strings for URL parameters
    Object.keys(optimized).forEach(key => {
      if (Array.isArray(optimized[key])) {
        optimized[key] = optimized[key].join(',');
      }
    });

    // Sort keys for consistent caching
    const sortedKeys = Object.keys(optimized).sort();
    const sortedParams = {};
    sortedKeys.forEach(key => {
      sortedParams[key] = optimized[key];
    });

    return sortedParams;
  }

  /**
   * Create optimized query function
   */
  createOptimizedQuery(endpoint, fetchFn, options = {}) {
    const {
      cacheTtl = CACHE_CONFIG.DEFAULT_TTL,
      enableDeduplication = true,
      enableDebounce = false,
      enablePrefetch = false,
      keyGenerator
    } = options;

    if (keyGenerator) {
      queryCache.registerKeyGenerator(endpoint, keyGenerator);
    }

    return async (params = {}, queryOptions = {}) => {
      const optimizedParams = this.optimizeParams(params);
      
      // Check cache first
      const cached = queryCache.get(endpoint, optimizedParams, queryOptions);
      if (cached && !queryOptions.forceFresh) {
        return cached.data;
      }

      // Create request function
      const requestFn = () => fetchFn(optimizedParams, queryOptions);
      
      // Apply optimizations
      let promise = requestFn;
      
      if (enableDeduplication) {
        const dedupeKey = queryCache.generateKey(endpoint, optimizedParams, queryOptions);
        promise = () => this.deduplicate(requestFn, dedupeKey);
      }
      
      if (enableDebounce && optimizedParams.search) {
        const debounceKey = `${endpoint}:search:${optimizedParams.search}`;
        promise = () => this.debounce(promise(), debounceKey);
      }

      // Execute query
      const result = await promise();
      
      // Cache result
      queryCache.set(endpoint, optimizedParams, queryOptions, result, cacheTtl);
      
      // Prefetch if enabled
      if (enablePrefetch && result.pagination) {
        const { currentPage, totalPages } = result.pagination;
        this.prefetch(
          (page) => fetchFn({ ...optimizedParams, page }, queryOptions),
          currentPage,
          totalPages
        ).catch(error => console.warn('Prefetch failed:', error));
      }

      return result;
    };
  }
}

/**
 * Global query optimizer instance
 */
export const queryOptimizer = new QueryOptimizer();

/**
 * Database query patterns and utilities
 */
export class DatabasePatterns {
  /**
   * Implement pagination with cursor-based navigation
   */
  static createCursorPagination(items, cursor, limit) {
    const startIndex = cursor ? items.findIndex(item => item.id === cursor) + 1 : 0;
    const endIndex = startIndex + limit;
    
    const paginatedItems = items.slice(startIndex, endIndex);
    const hasNextPage = endIndex < items.length;
    const nextCursor = hasNextPage ? paginatedItems[paginatedItems.length - 1]?.id : null;

    return {
      items: paginatedItems,
      cursor: nextCursor,
      hasNextPage,
      totalCount: items.length
    };
  }

  /**
   * Create efficient filters for client-side filtering
   */
  static createFilterPipeline(data, filters) {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        
        const itemValue = item[key];
        
        // Handle different filter types
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        
        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          return itemValue >= value.min && itemValue <= value.max;
        }
        
        return itemValue === value;
      });
    });
  }

  /**
   * Create efficient sorting
   */
  static createSortPipeline(data, sortBy, sortOrder = 'asc') {
    if (!sortBy) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      // Handle different data types
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortOrder === 'desc' ? -comparison : comparison;
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        const comparison = aVal - bVal;
        return sortOrder === 'desc' ? -comparison : comparison;
      }
      
      if (aVal instanceof Date && bVal instanceof Date) {
        const comparison = aVal.getTime() - bVal.getTime();
        return sortOrder === 'desc' ? -comparison : comparison;
      }
      
      // Fallback to string comparison
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Create search index for faster searching
   */
  static createSearchIndex(data, searchFields) {
    const index = new Map();
    
    data.forEach((item, idx) => {
      searchFields.forEach(field => {
        const value = String(item[field] || '').toLowerCase();
        
        // Create n-grams for fuzzy search
        for (let i = 0; i < value.length; i++) {
          for (let j = i + 1; j <= value.length; j++) {
            const ngram = value.slice(i, j);
            if (ngram.length >= 2) {
              if (!index.has(ngram)) {
                index.set(ngram, new Set());
              }
              index.get(ngram).add(idx);
            }
          }
        }
      });
    });
    
    return index;
  }

  /**
   * Search using the created index
   */
  static searchWithIndex(data, searchIndex, query, minScore = 0.3) {
    if (!query || query.length < 2) return data;
    
    const queryLower = query.toLowerCase();
    const candidates = new Map();
    
    // Find candidates using n-gram matching
    for (let i = 0; i < queryLower.length; i++) {
      for (let j = i + 2; j <= queryLower.length; j++) {
        const ngram = queryLower.slice(i, j);
        const matches = searchIndex.get(ngram);
        
        if (matches) {
          matches.forEach(idx => {
            candidates.set(idx, (candidates.get(idx) || 0) + 1);
          });
        }
      }
    }
    
    // Score and filter candidates
    const results = [];
    candidates.forEach((score, idx) => {
      const normalizedScore = score / queryLower.length;
      if (normalizedScore >= minScore) {
        results.push({
          item: data[idx],
          score: normalizedScore
        });
      }
    });
    
    // Sort by relevance score
    return results
      .sort((a, b) => b.score - a.score)
      .map(result => result.item);
  }

  /**
   * Create aggregation pipeline
   */
  static createAggregationPipeline(data, aggregations) {
    const results = {};
    
    Object.entries(aggregations).forEach(([key, config]) => {
      const { field, operation, groupBy } = config;
      
      if (groupBy) {
        const groups = {};
        data.forEach(item => {
          const groupKey = item[groupBy];
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push(item[field]);
        });
        
        results[key] = Object.entries(groups).reduce((acc, [groupKey, values]) => {
          acc[groupKey] = this.applyAggregation(values, operation);
          return acc;
        }, {});
      } else {
        const values = data.map(item => item[field]).filter(val => val != null);
        results[key] = this.applyAggregation(values, operation);
      }
    });
    
    return results;
  }

  /**
   * Apply aggregation operation
   */
  static applyAggregation(values, operation) {
    switch (operation) {
      case 'sum':
        return values.reduce((sum, val) => sum + Number(val), 0);
      case 'avg':
        return values.reduce((sum, val) => sum + Number(val), 0) / values.length;
      case 'min':
        return Math.min(...values.map(Number));
      case 'max':
        return Math.max(...values.map(Number));
      case 'count':
        return values.length;
      case 'distinct':
        return [...new Set(values)].length;
      default:
        return values;
    }
  }
}

/**
 * Create optimized store enhancer
 */
export function createOptimizedStore(config) {
  const {
    name,
    endpoints = {},
    defaultCacheTtl = CACHE_CONFIG.DEFAULT_TTL
    // enableAnalytics feature reserved for future implementation
  } = config;

  // Create optimized query functions for each endpoint
  const optimizedQueries = {};
  
  Object.entries(endpoints).forEach(([key, endpointConfig]) => {
    const {
      fetchFn,
      options = {}
      // url property reserved for future endpoint configuration
    } = endpointConfig;

    optimizedQueries[key] = queryOptimizer.createOptimizedQuery(
      `${name}:${key}`,
      fetchFn,
      {
        cacheTtl: options.cacheTtl || defaultCacheTtl,
        enableDeduplication: options.enableDeduplication !== false,
        enableDebounce: options.enableDebounce || false,
        enablePrefetch: options.enablePrefetch || false,
        keyGenerator: options.keyGenerator
      }
    );
  });

  return {
    queries: optimizedQueries,
    cache: queryCache,
    optimizer: queryOptimizer,
    patterns: DatabasePatterns
  };
}

export default {
  QueryCache,
  QueryOptimizer,
  DatabasePatterns,
  queryCache,
  queryOptimizer,
  createOptimizedStore
};