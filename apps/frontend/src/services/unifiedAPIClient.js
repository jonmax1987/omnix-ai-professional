// Unified API Client - Professional BE/FE Integration
// This service unifies the API handling between Backend and Frontend teams
import axios from 'axios';
import axiosRetry from 'axios-retry';

/**
 * Unified API Response Format
 * This ensures consistent response structure across all endpoints
 */
const standardizeResponse = (data, endpoint, status = 200) => {
  // Standardized response format for all endpoints
  const baseResponse = {
    success: status >= 200 && status < 300,
    data: null,
    message: null,
    errors: null,
    meta: {
      timestamp: new Date().toISOString(),
      endpoint,
      status
    }
  };

  // Handle different backend response formats
  if (data && typeof data === 'object') {
    // If backend returns { data, pagination } format
    if (data.data !== undefined) {
      baseResponse.data = data.data;
      baseResponse.meta.pagination = data.pagination || data.meta;
    }
    // If backend returns direct data
    else {
      baseResponse.data = data;
    }

    // Extract message if present
    if (data.message) {
      baseResponse.message = data.message;
    }
  } else {
    baseResponse.data = data;
  }

  return baseResponse;
};

/**
 * Unified Error Handler
 * Consistent error format across all API calls
 */
const handleAPIError = (error, endpoint) => {
  const baseError = {
    success: false,
    data: null,
    message: 'An unexpected error occurred',
    errors: null,
    meta: {
      timestamp: new Date().toISOString(),
      endpoint,
      status: error.response?.status || 0
    }
  };

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    baseError.meta.status = status;
    baseError.message = data?.message || data?.error || `HTTP ${status} Error`;
    baseError.errors = data?.errors || data?.details;
  } else if (error.request) {
    // Network error
    if (error.code === 'ECONNABORTED') {
      baseError.message = 'Request timeout';
      baseError.meta.status = 408;
    } else {
      baseError.message = 'Network error - please check your connection';
      baseError.meta.status = 0;
    }
  } else {
    // Something else
    baseError.message = error.message || 'Unknown error occurred';
  }

  return baseError;
};

/**
 * Create Unified HTTP Client
 */
const createUnifiedClient = () => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Client-Type': 'web'
    }
  });

  // Configure retry logic for resilience
  axiosRetry(client, {
    retries: 3,
    retryDelay: (retryCount) => Math.min(1000 * Math.pow(2, retryCount - 1), 10000),
    retryCondition: (error) => {
      // Retry on network errors and 5xx server errors
      return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
             (error.response?.status >= 500);
    }
  });

  return client;
};

const unifiedClient = createUnifiedClient();

/**
 * Request Interceptor - Add auth and standardize headers
 */
unifiedClient.interceptors.request.use(
  (config) => {
    // Add authentication token from store
    const token = localStorage.getItem('auth_token') || 
                 JSON.parse(localStorage.getItem('user-store') || '{}')?.state?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add API key if available
    const apiKey = import.meta.env.VITE_API_KEY;
    if (apiKey && apiKey !== 'your_api_key_here_if_required') {
      config.headers['X-API-Key'] = apiKey;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor - Standardize responses and handle auth
 */
unifiedClient.interceptors.response.use(
  (response) => {
    // Standardize successful responses
    const standardized = standardizeResponse(
      response.data, 
      response.config.url, 
      response.status
    );
    
    // Return standardized response while preserving axios structure
    return {
      ...response,
      data: standardized
    };
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 unauthorized - attempt token refresh
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/')) {
      
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = JSON.parse(localStorage.getItem('user-store') || '{}')?.state?.refreshToken;
        
        if (refreshToken) {
          const refreshResponse = await unifiedClient.post('/auth/refresh', {
            refreshToken
          });

          if (refreshResponse.data.success && refreshResponse.data.data?.accessToken) {
            const newToken = refreshResponse.data.data.accessToken;
            
            // Update stored token
            const userStore = JSON.parse(localStorage.getItem('user-store') || '{}');
            if (userStore.state) {
              userStore.state.token = newToken;
              userStore.state.refreshToken = refreshResponse.data.data.refreshToken;
              localStorage.setItem('user-store', JSON.stringify(userStore));
            }

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return unifiedClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem('auth_token');
        const userStore = JSON.parse(localStorage.getItem('user-store') || '{}');
        if (userStore.state) {
          userStore.state.isAuthenticated = false;
          userStore.state.token = null;
          userStore.state.refreshToken = null;
          localStorage.setItem('user-store', JSON.stringify(userStore));
        }
        
        // Redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Standardize error responses
    const standardizedError = handleAPIError(error, originalRequest?.url);
    
    // Create a proper rejected promise with standardized error
    const apiError = new Error(standardizedError.message);
    apiError.response = {
      ...error.response,
      data: standardizedError
    };
    
    return Promise.reject(apiError);
  }
);

/**
 * Unified API Service - High-level methods for all endpoints
 */
export const unifiedAPI = {
  // Generic HTTP methods
  async get(endpoint, params = {}) {
    const response = await unifiedClient.get(endpoint, { params });
    return response.data;
  },

  async post(endpoint, data = {}) {
    const response = await unifiedClient.post(endpoint, data);
    return response.data;
  },

  async put(endpoint, data = {}) {
    const response = await unifiedClient.put(endpoint, data);
    return response.data;
  },

  async patch(endpoint, data = {}) {
    const response = await unifiedClient.patch(endpoint, data);
    return response.data;
  },

  async delete(endpoint) {
    const response = await unifiedClient.delete(endpoint);
    return response.data;
  },

  // File upload with progress
  async upload(endpoint, formData, onProgress = null) {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      };
    }

    const response = await unifiedClient.post(endpoint, formData, config);
    return response.data;
  },

  // Authentication endpoints
  auth: {
    async login(credentials) {
      return await unifiedAPI.post('/auth/login', credentials);
    },

    async logout() {
      return await unifiedAPI.post('/auth/logout');
    },

    async refreshToken(refreshToken) {
      return await unifiedAPI.post('/auth/refresh', { refreshToken });
    },

    async resetPassword(email) {
      return await unifiedAPI.post('/auth/reset-password', { email });
    }
  },

  // Product endpoints
  products: {
    async list(params = {}) {
      return await unifiedAPI.get('/products', params);
    },

    async get(id) {
      return await unifiedAPI.get(`/products/${id}`);
    },

    async create(data) {
      return await unifiedAPI.post('/products', data);
    },

    async update(id, data) {
      return await unifiedAPI.patch(`/products/${id}`, data);
    },

    async delete(id) {
      return await unifiedAPI.delete(`/products/${id}`);
    }
  },

  // Dashboard endpoints
  dashboard: {
    async getSummary(params = {}) {
      return await unifiedAPI.get('/dashboard/summary', params);
    },

    async getInventoryGraph(params = {}) {
      return await unifiedAPI.get('/dashboard/inventory-graph', params);
    }
  },

  // Alert endpoints
  alerts: {
    async list(params = {}) {
      return await unifiedAPI.get('/alerts', params);
    },

    async dismiss(id) {
      return await unifiedAPI.post(`/alerts/${id}/dismiss`);
    },

    async resolve(id, resolution) {
      return await unifiedAPI.post(`/alerts/${id}/resolve`, { resolution });
    }
  },

  // System health check
  async healthCheck() {
    try {
      const response = await unifiedAPI.get('/system/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }
};

// Export client for advanced usage
export { unifiedClient };

// Default export
export default unifiedAPI;