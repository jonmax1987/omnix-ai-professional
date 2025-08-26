// Enhanced HTTP Client Service with Axios Interceptors and Retry Logic
// Implementation of API-001: HTTP client with interceptors and retry
import axios from 'axios';
import axiosRetry from 'axios-retry';
import useUserStore from '../store/userStore';

/**
 * Custom API Error class for enhanced error handling
 */
export class ApiError extends Error {
  constructor(message, status, code, data = null, config = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
    this.config = config;
    this.isApiError = true;
  }
}

/**
 * HTTP Client Configuration
 */
const HTTP_CONFIG = {
  // Unified API base URL that works across all environments
  baseURL: import.meta.env.VITE_API_BASE_URL || '/v1', // Use env var in production, proxy in dev
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  backoffType: 'exponential',
  enableLogging: import.meta.env.DEV,
  enableMetrics: true
};

/**
 * Request/Response metrics tracking
 */
class RequestMetrics {
  constructor() {
    this.requests = new Map();
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      retries: 0,
      avgResponseTime: 0
    };
  }

  startRequest(requestId, config) {
    if (!HTTP_CONFIG.enableMetrics) return;
    
    this.requests.set(requestId, {
      startTime: performance.now(),
      url: config.url,
      method: config.method?.toUpperCase() || 'GET',
      attempt: 1
    });
    this.stats.total++;
  }

  recordRetry(requestId) {
    if (!HTTP_CONFIG.enableMetrics) return;
    
    const request = this.requests.get(requestId);
    if (request) {
      request.attempt++;
      this.stats.retries++;
    }
  }

  endRequest(requestId, success = true, error = null) {
    if (!HTTP_CONFIG.enableMetrics) return;
    
    const request = this.requests.get(requestId);
    if (!request) return;

    const duration = performance.now() - request.startTime;
    
    // Update average response time
    const totalRequests = this.stats.success + this.stats.failed;
    this.stats.avgResponseTime = (this.stats.avgResponseTime * totalRequests + duration) / (totalRequests + 1);
    
    if (success) {
      this.stats.success++;
    } else {
      this.stats.failed++;
    }

    // Log performance metrics in development
    if (HTTP_CONFIG.enableLogging && duration > 2000) {
      console.warn(`🐌 Slow API Request [${duration.toFixed(2)}ms]:`, {
        url: request.url,
        method: request.method,
        attempts: request.attempt
      });
    }

    this.requests.delete(requestId);
  }

  getStats() {
    return { ...this.stats };
  }

  reset() {
    this.requests.clear();
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      retries: 0,
      avgResponseTime: 0
    };
  }
}

// Initialize metrics tracker
const metrics = new RequestMetrics();

/**
 * Create axios instance with default configuration
 */
const createHttpClient = () => {
  const client = axios.create({
    baseURL: HTTP_CONFIG.baseURL,
    timeout: HTTP_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Configure retry logic
  axiosRetry(client, {
    retries: HTTP_CONFIG.maxRetries,
    retryDelay: (retryCount, error) => {
      const requestId = error.config?.__requestId;
      if (requestId) {
        metrics.recordRetry(requestId);
      }

      if (HTTP_CONFIG.backoffType === 'exponential') {
        return Math.min(HTTP_CONFIG.retryDelay * Math.pow(2, retryCount - 1), 10000);
      }
      return HTTP_CONFIG.retryDelay * retryCount;
    },
    retryCondition: (error) => {
      // Retry on network errors, timeouts, and 5xx server errors
      if (axiosRetry.isNetworkOrIdempotentRequestError(error)) {
        return true;
      }
      
      // Don't retry on 4xx client errors (except 401, 408, 429)
      if (error.response) {
        const status = error.response.status;
        return status === 401 || status === 408 || status === 429 || status >= 500;
      }
      
      return false;
    },
    onRetry: (retryCount, error, requestConfig) => {
      if (HTTP_CONFIG.enableLogging) {
        console.log(`🔄 Retry attempt ${retryCount} for ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
      }
    }
  });

  return client;
};

// Create axios instance
const httpClient = createHttpClient();

/**
 * Request interceptor for adding authentication and logging
 */
httpClient.interceptors.request.use(
  (config) => {
    // Generate unique request ID for tracking
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    config.__requestId = requestId;
    
    // Start metrics tracking
    metrics.startRequest(requestId, config);
    
    // Add authentication token
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add API key if available and not a placeholder
    const apiKey = import.meta.env.VITE_API_KEY;
    if (apiKey && apiKey !== 'your_api_key_here_if_required') {
      config.headers['X-API-Key'] = apiKey;
    }
    
    // Log request in development
    if (HTTP_CONFIG.enableLogging) {
      console.group(`📤 HTTP Request [${requestId}]`);
      console.log('🎯 URL:', config.url);
      console.log('📋 Method:', config.method?.toUpperCase() || 'GET');
      console.log('📝 Headers:', config.headers);
      if (config.data) {
        console.log('📦 Data:', config.data);
      }
      if (config.params) {
        console.log('🔍 Params:', config.params);
      }
      console.groupEnd();
    }
    
    return config;
  },
  (error) => {
    if (HTTP_CONFIG.enableLogging) {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for handling responses, errors, and token refresh
 */
httpClient.interceptors.response.use(
  (response) => {
    const requestId = response.config?.__requestId;
    const duration = requestId ? performance.now() - metrics.requests.get(requestId)?.startTime : 0;
    
    // End metrics tracking
    metrics.endRequest(requestId, true);
    
    // Log successful response in development
    if (HTTP_CONFIG.enableLogging) {
      console.group(`📡 HTTP Response [${response.status}] - ${duration.toFixed(2)}ms`);
      console.log('✅ Status:', response.status, response.statusText);
      console.log('📝 Headers:', Object.fromEntries(
        Object.entries(response.headers).filter(([key]) => 
          ['content-type', 'content-length', 'x-ratelimit-remaining', 'x-request-id'].includes(key.toLowerCase())
        )
      ));
      
      // Only log response data for small responses to avoid console spam
      if (response.data && JSON.stringify(response.data).length < 1000) {
        console.log('📦 Data:', response.data);
      } else if (response.data) {
        console.log('📦 Data:', '[Large response - inspect network tab]');
      }
      console.groupEnd();
    }
    
    return response;
  },
  async (error) => {
    const requestId = error.config?.__requestId;
    
    // End metrics tracking
    metrics.endRequest(requestId, false, error);
    
    // Skip auth handling for logout endpoints to prevent loops
    if (error.config?.url?.includes('/auth/logout')) {
      const apiError = transformAxiosError(error);
      return Promise.reject(apiError);
    }
    
    // Handle 401 unauthorized responses (token refresh)
    if (error.response?.status === 401 && 
        !error.config._retryAttempted && 
        !error.config?.url?.includes('/auth/')) {
      
      error.config._retryAttempted = true;
      
      try {
        const userStore = useUserStore.getState();
        const refreshSuccess = await userStore.refreshSession();
        
        if (refreshSuccess) {
          // Retry the original request with the new token
          const newToken = useUserStore.getState().token;
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return httpClient.request(error.config);
        }
      } catch (refreshError) {
        console.error('Token refresh failed in interceptor:', refreshError);
        // Refresh failed, let the original error continue
      }
    }
    
    // Transform axios error into our custom ApiError
    const apiError = transformAxiosError(error);
    
    // Log error in development
    if (HTTP_CONFIG.enableLogging) {
      const duration = requestId ? 
        performance.now() - (metrics.requests.get(requestId)?.startTime || 0) : 0;
      
      console.group(`❌ HTTP Error [${apiError.status}] - ${duration.toFixed(2)}ms`);
      console.error('🚨 Error:', apiError.message);
      console.error('📍 URL:', error.config?.url);
      console.error('📋 Method:', error.config?.method?.toUpperCase());
      
      if (apiError.data) {
        console.error('📦 Error Data:', apiError.data);
      }
      
      console.error('🔧 Full Error:', apiError);
      console.groupEnd();
    }
    
    return Promise.reject(apiError);
  }
);

/**
 * Transform axios error into standardized ApiError
 */
const transformAxiosError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data, statusText } = error.response;
    const message = data?.message || data?.error || statusText || `HTTP ${status} Error`;
    const code = data?.code || data?.error_code || `HTTP_${status}`;
    
    return new ApiError(message, status, code, data, error.config);
  } else if (error.request) {
    // Network error - request was made but no response received
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      return new ApiError('Request timeout', 408, 'TIMEOUT', null, error.config);
    } else if (error.code === 'ERR_NETWORK') {
      return new ApiError('Network error', 0, 'NETWORK_ERROR', null, error.config);
    } else {
      return new ApiError('Request failed', 0, 'REQUEST_ERROR', { originalError: error.message }, error.config);
    }
  } else {
    // Something else happened
    return new ApiError(error.message || 'Unknown error', 0, 'UNKNOWN_ERROR', null, error.config);
  }
};

/**
 * Enhanced API methods with response transformation
 */
export const httpService = {
  // Core HTTP methods
  async get(endpoint, params = {}, config = {}) {
    const response = await httpClient.get(endpoint, { 
      params, 
      ...config 
    });
    return transformBackendResponse(response.data, endpoint);
  },

  async post(endpoint, data, config = {}) {
    const response = await httpClient.post(endpoint, data, config);
    return transformBackendResponse(response.data, endpoint);
  },

  async put(endpoint, data, config = {}) {
    const response = await httpClient.put(endpoint, data, config);
    return transformBackendResponse(response.data, endpoint);
  },

  async patch(endpoint, data, config = {}) {
    const response = await httpClient.patch(endpoint, data, config);
    return transformBackendResponse(response.data, endpoint);
  },

  async delete(endpoint, config = {}) {
    const response = await httpClient.delete(endpoint, config);
    return transformBackendResponse(response.data, endpoint);
  },

  // File upload with progress
  async upload(endpoint, formData, onProgress = null) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await httpClient.post(endpoint, formData, config);
    return transformBackendResponse(response.data, endpoint);
  },

  // Download with progress
  async download(endpoint, filename, onProgress = null) {
    const config = {
      responseType: 'blob',
    };

    if (onProgress) {
      config.onDownloadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await httpClient.get(endpoint, config);
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  },

  // Request with custom configuration
  async request(config) {
    const response = await httpClient(config);
    return transformBackendResponse(response.data, config.url);
  },

  // Cancel requests
  createCancelToken() {
    return axios.CancelToken.source();
  },

  // Check if error is cancellation
  isCancelError(error) {
    return axios.isCancel(error);
  },

  // Get metrics
  getMetrics() {
    return metrics.getStats();
  },

  // Reset metrics
  resetMetrics() {
    metrics.reset();
  },

  // Update configuration
  updateConfig(newConfig) {
    Object.assign(HTTP_CONFIG, newConfig);
    
    // Update axios defaults
    httpClient.defaults.baseURL = HTTP_CONFIG.baseURL;
    httpClient.defaults.timeout = HTTP_CONFIG.timeout;
  },

  // Get current configuration
  getConfig() {
    return { ...HTTP_CONFIG };
  },

  // Health check
  async healthCheck() {
    try {
      await this.get('/system/health');
      return true;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Response transformation utility (migrated from existing api.js)
 */
const transformBackendResponse = (data, endpoint) => {
  // Handle null/undefined responses
  if (!data) return data;

  // Transform backend's {data: [...], pagination: {...}} to client expected format
  if (data && typeof data === 'object' && data.data) {
    // Products endpoint transformation
    if (endpoint.includes('/products')) {
      return {
        products: data.data,
        pagination: data.pagination || data.meta,
        ...(data.meta && { meta: data.meta })
      };
    }
    
    // Dashboard summary transformation
    if (endpoint.includes('/dashboard/summary')) {
      return {
        revenue: {
          current: data.data.totalInventoryValue || 0,
          previous: 0,
          change: 0,
          trend: 'neutral'
        },
        inventory: {
          totalValue: data.data.totalInventoryValue || 0,
          totalItems: data.data.totalItems || 0,
          lowStockItems: data.data.lowStockItems || 0,
          outOfStockItems: 0
        },
        alerts: {
          critical: 0,
          warning: 0,
          info: 0,
          total: 0
        },
        categoryBreakdown: data.data.categoryBreakdown || []
      };
    }
    
    // Generic transformations for other endpoints
    const endpointMap = {
      '/alerts': { key: 'alerts' },
      '/recommendations': { key: 'recommendations' },
      '/forecasts': { key: 'forecasts' },
      '/orders': { key: 'orders' },
      '/inventory': { key: 'inventory' }
    };

    for (const [path, config] of Object.entries(endpointMap)) {
      if (endpoint.includes(path)) {
        return {
          [config.key]: data.data,
          pagination: data.pagination || data.meta,
          ...(data.meta && { meta: data.meta })
        };
      }
    }
    
    // Auth endpoints - preserve original structure
    if (endpoint.includes('/auth/')) {
      return data;
    }
    
    // Default transformation - return data directly
    return data.data;
  }
  
  // Return original data if no transformation needed
  return data;
};

// Export default HTTP service
export default httpService;