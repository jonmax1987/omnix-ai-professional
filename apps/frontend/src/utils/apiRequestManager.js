/**
 * OMNIX AI - API Request Manager
 * Optimized API request handling with AbortController support
 * Prevents memory leaks and manages concurrent requests efficiently
 */

class APIRequestManager {
  constructor() {
    this.activeRequests = new Map();
    this.requestQueue = new Map();
    this.maxConcurrentRequests = 6;
    this.timeout = 15000; // 15 seconds default timeout
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    
    // Request deduplication cache
    this.requestCache = new Map();
    this.cacheTimeout = 5000; // 5 seconds cache
  }

  /**
   * Create a unique request key for deduplication
   */
  createRequestKey(url, method = 'GET', params = {}) {
    const sortedParams = Object.keys(params).sort().reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
    
    return `${method}:${url}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if request is already cached
   */
  getCachedRequest(requestKey) {
    const cached = this.requestCache.get(requestKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.promise;
    }
    
    return null;
  }

  /**
   * Cache request promise
   */
  cacheRequest(requestKey, promise) {
    this.requestCache.set(requestKey, {
      promise,
      timestamp: Date.now()
    });
    
    // Auto cleanup cache
    setTimeout(() => {
      this.requestCache.delete(requestKey);
    }, this.cacheTimeout);
  }

  /**
   * Make an optimized API request with AbortController
   */
  async request(url, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      timeout = this.timeout,
      retryAttempts = this.retryAttempts,
      retryDelay = this.retryDelay,
      cache = true,
      params = {},
      ...fetchOptions
    } = options;

    // Create request key for deduplication
    const requestKey = this.createRequestKey(url, method, params);
    
    // Check for cached request
    if (cache) {
      const cachedRequest = this.getCachedRequest(requestKey);
      if (cachedRequest) {
        return cachedRequest;
      }
    }

    // Create AbortController for this request
    const abortController = new AbortController();
    const requestId = `${requestKey}-${Date.now()}`;

    // Create the request promise
    const requestPromise = this.makeRequest({
      url,
      method,
      body,
      headers,
      timeout,
      retryAttempts,
      retryDelay,
      abortController,
      requestId,
      ...fetchOptions
    });

    // Store active request
    this.activeRequests.set(requestId, {
      abortController,
      promise: requestPromise,
      startTime: Date.now(),
      url,
      method
    });

    // Cache request if enabled
    if (cache) {
      this.cacheRequest(requestKey, requestPromise);
    }

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up active request
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Internal method to make the actual request
   */
  async makeRequest({
    url,
    method,
    body,
    headers,
    timeout,
    retryAttempts,
    retryDelay,
    abortController,
    requestId,
    ...fetchOptions
  }) {
    let lastError = null;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        // Set up timeout
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, timeout);

        const response = await fetch(url, {
          method,
          body,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          signal: abortController.signal,
          ...fetchOptions
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;

      } catch (error) {
        lastError = error;

        // Don't retry if request was aborted
        if (error.name === 'AbortError') {
          throw new Error(`Request cancelled: ${url}`);
        }

        // Don't retry on final attempt
        if (attempt === retryAttempts) {
          break;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    throw new Error(`Request failed after ${retryAttempts + 1} attempts: ${lastError.message}`);
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(requestId) {
    const request = this.activeRequests.get(requestId);
    if (request) {
      request.abortController.abort();
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Cancel all requests matching a pattern
   */
  cancelRequestsMatching(pattern) {
    const toCancel = [];
    
    for (const [requestId, request] of this.activeRequests.entries()) {
      if (pattern.test(request.url)) {
        toCancel.push(requestId);
      }
    }
    
    toCancel.forEach(requestId => this.cancelRequest(requestId));
  }

  /**
   * Cancel all active requests
   */
  cancelAllRequests() {
    for (const [requestId] of this.activeRequests.entries()) {
      this.cancelRequest(requestId);
    }
  }

  /**
   * Batch multiple requests with concurrency control
   */
  async batchRequests(requests, options = {}) {
    const {
      concurrency = this.maxConcurrentRequests,
      failFast = false
    } = options;

    const results = [];
    const errors = [];

    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (requestConfig, index) => {
        try {
          const result = await this.request(requestConfig.url, requestConfig.options);
          return { index: i + index, result, error: null };
        } catch (error) {
          return { index: i + index, result: null, error };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const promiseResult of batchResults) {
        if (promiseResult.status === 'fulfilled') {
          const { index, result, error } = promiseResult.value;
          
          if (error) {
            errors.push({ index, error });
            if (failFast) {
              throw error;
            }
          } else {
            results[index] = result;
          }
        }
      }
    }

    return { results, errors };
  }

  /**
   * Get active request statistics
   */
  getStats() {
    const active = Array.from(this.activeRequests.values());
    const now = Date.now();
    
    return {
      activeRequests: this.activeRequests.size,
      cachedRequests: this.requestCache.size,
      longestRunning: active.reduce((max, request) => {
        const duration = now - request.startTime;
        return duration > max ? duration : max;
      }, 0),
      averageRunning: active.length > 0 ? 
        active.reduce((sum, request) => sum + (now - request.startTime), 0) / active.length : 0,
      requestsByMethod: active.reduce((acc, request) => {
        acc[request.method] = (acc[request.method] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Clean up expired cache entries
   */
  cleanup() {
    const now = Date.now();
    
    for (const [key, cached] of this.requestCache.entries()) {
      if ((now - cached.timestamp) > this.cacheTimeout) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Destroy manager and cleanup all resources
   */
  destroy() {
    this.cancelAllRequests();
    this.requestCache.clear();
    this.requestQueue.clear();
  }
}

/**
 * Dashboard-specific API request manager
 */
export class DashboardAPIManager extends APIRequestManager {
  constructor() {
    super();
    this.dashboardRequests = new Set();
    this.refreshTimeout = 30000; // 30 seconds for dashboard refresh
  }

  /**
   * Optimized dashboard refresh with proper cleanup
   */
  async refreshDashboard(fetchFunctions) {
    // Cancel any existing dashboard requests
    this.cancelDashboardRequests();
    
    const abortController = new AbortController();
    const requestId = `dashboard-refresh-${Date.now()}`;
    
    // Track this refresh request
    this.dashboardRequests.add(requestId);
    this.activeRequests.set(requestId, {
      abortController,
      startTime: Date.now(),
      url: 'dashboard-refresh',
      method: 'BATCH'
    });

    try {
      // Set up timeout for entire refresh
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, this.refreshTimeout);

      // Execute all fetch functions with proper error handling
      const results = await Promise.allSettled(
        fetchFunctions.map(async (fetchFn) => {
          // Check if cancelled
          if (abortController.signal.aborted) {
            throw new Error('Dashboard refresh cancelled');
          }
          
          return await fetchFn();
        })
      );

      clearTimeout(timeoutId);

      // Process results
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected');

      return {
        successful,
        failed: failed.length,
        errors: failed.map(result => result.reason),
        total: results.length
      };

    } finally {
      // Clean up
      this.dashboardRequests.delete(requestId);
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Cancel all dashboard requests
   */
  cancelDashboardRequests() {
    for (const requestId of this.dashboardRequests) {
      this.cancelRequest(requestId);
    }
    this.dashboardRequests.clear();
  }

  /**
   * Optimized metrics fetch with deduplication
   */
  async fetchMetrics(apiService) {
    return this.request('/api/dashboard/metrics', {
      method: 'GET',
      cache: true,
      timeout: 10000,
      params: { timestamp: Date.now() }
    });
  }

  /**
   * Optimized chart data fetch with deduplication
   */
  async fetchChartData(apiService, chartType, timeRange = '7d') {
    const endpoint = this.getChartEndpoint(chartType);
    
    if (!endpoint) {
      throw new Error(`Unknown chart type: ${chartType}`);
    }

    return this.request(endpoint, {
      method: 'GET',
      cache: true,
      timeout: 8000,
      params: { timeRange, chartType }
    });
  }

  /**
   * Get API endpoint for chart type
   */
  getChartEndpoint(chartType) {
    const endpoints = {
      'revenue': '/api/analytics/revenue',
      'inventory': '/api/analytics/inventory',
      'topProducts': '/api/analytics/top-products',
      'categoryBreakdown': '/api/dashboard/metrics'
    };

    return endpoints[chartType];
  }
}

// Create singleton instances
export const apiRequestManager = new APIRequestManager();
export const dashboardAPIManager = new DashboardAPIManager();

// Setup cleanup interval
setInterval(() => {
  apiRequestManager.cleanup();
  dashboardAPIManager.cleanup();
}, 30000); // Clean up every 30 seconds

export default APIRequestManager;