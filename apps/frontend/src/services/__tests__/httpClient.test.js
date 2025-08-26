// Tests for Enhanced HTTP Client Service
// API-001 Implementation Verification
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock axios and axios-retry before importing httpService
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(() => 'request-interceptor-id') },
      response: { use: vi.fn(() => 'response-interceptor-id') }
    },
    defaults: {
      baseURL: '',
      timeout: 0
    }
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      CancelToken: {
        source: vi.fn(() => ({ token: 'cancel-token', cancel: vi.fn() }))
      },
      isCancel: vi.fn()
    }
  };
});

vi.mock('axios-retry', () => {
  return {
    default: vi.fn(),
    isNetworkOrIdempotentRequestError: vi.fn(() => true)
  };
});

// Mock user store
vi.mock('../../store/userStore', () => ({
  default: {
    getState: vi.fn(() => ({
      token: 'mock-token',
      refreshSession: vi.fn()
    }))
  }
}));

// Import after mocking
import axios from 'axios';
import httpService, { ApiError } from '../httpClient';

const mockAxios = vi.mocked(axios);

describe('HttpClient Service', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(() => 'request-interceptor-id') },
        response: { use: vi.fn(() => 'response-interceptor-id') }
      },
      defaults: {
        baseURL: '',
        timeout: 0
      }
    };
    
    mockAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Reset environment variables
    delete import.meta.env.VITE_API_BASE_URL;
    delete import.meta.env.VITE_API_KEY;
  });

  afterEach(() => {
    httpService.resetMetrics();
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const config = httpService.getConfig();
      
      expect(config.baseURL).toBe('https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/v1');
      expect(config.timeout).toBe(30000);
      expect(config.maxRetries).toBe(3);
      expect(config.backoffType).toBe('exponential');
    });

    it('should allow configuration updates', () => {
      const newConfig = {
        timeout: 15000,
        maxRetries: 5
      };
      
      httpService.updateConfig(newConfig);
      const config = httpService.getConfig();
      
      expect(config.timeout).toBe(15000);
      expect(config.maxRetries).toBe(5);
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      // Setup successful response mock
      mockAxiosInstance.get.mockResolvedValue({
        data: { success: true }
      });
      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true }
      });
      mockAxiosInstance.put.mockResolvedValue({
        data: { success: true }
      });
      mockAxiosInstance.patch.mockResolvedValue({
        data: { success: true }
      });
      mockAxiosInstance.delete.mockResolvedValue({
        data: { success: true }
      });
    });

    it('should handle GET requests', async () => {
      const params = { page: 1, limit: 10 };
      await httpService.get('/test', params);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {
        params,
      });
    });

    it('should handle POST requests', async () => {
      const data = { name: 'test' };
      await httpService.post('/test', data);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data, {});
    });

    it('should handle PUT requests', async () => {
      const data = { name: 'updated' };
      await httpService.put('/test/1', data);
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', data, {});
    });

    it('should handle PATCH requests', async () => {
      const data = { name: 'patched' };
      await httpService.patch('/test/1', data);
      
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', data, {});
    });

    it('should handle DELETE requests', async () => {
      await httpService.delete('/test/1');
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', {});
    });
  });

  describe('Response Transformation', () => {
    it('should transform products endpoint response', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, name: 'Product 1' },
            { id: 2, name: 'Product 2' }
          ],
          pagination: { page: 1, total: 2 }
        }
      };
      
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      
      const result = await httpService.get('/products');
      
      expect(result).toEqual({
        products: mockResponse.data.data,
        pagination: mockResponse.data.pagination
      });
    });

    it('should transform dashboard summary response', async () => {
      const mockResponse = {
        data: {
          data: {
            totalInventoryValue: 100000,
            totalItems: 500,
            lowStockItems: 10,
            categoryBreakdown: [
              { category: 'Food', value: 50000 },
              { category: 'Beverages', value: 30000 }
            ]
          }
        }
      };
      
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      
      const result = await httpService.get('/dashboard/summary');
      
      expect(result).toEqual({
        revenue: {
          current: 100000,
          previous: 0,
          change: 0,
          trend: 'neutral'
        },
        inventory: {
          totalValue: 100000,
          totalItems: 500,
          lowStockItems: 10,
          outOfStockItems: 0
        },
        alerts: {
          critical: 0,
          warning: 0,
          info: 0,
          total: 0
        },
        categoryBreakdown: mockResponse.data.data.categoryBreakdown
      });
    });

    it('should preserve auth endpoint responses', async () => {
      const mockResponse = {
        data: {
          token: 'new-token',
          user: { id: 1, name: 'Test User' }
        }
      };
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      
      const result = await httpService.post('/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('File Upload', () => {
    it('should handle file uploads with progress', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');
      
      const mockResponse = { data: { success: true, fileId: '123' } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      
      const onProgress = vi.fn();
      await httpService.upload('/upload', formData, onProgress);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        formData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          }),
          onUploadProgress: expect.any(Function)
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should create ApiError from axios error', () => {
      const axiosError = {
        response: {
          status: 404,
          data: { message: 'Not found', code: 'NOT_FOUND' },
          statusText: 'Not Found'
        },
        config: { url: '/test' }
      };
      
      const apiError = new ApiError(
        axiosError.response.data.message,
        axiosError.response.status,
        axiosError.response.data.code,
        axiosError.response.data,
        axiosError.config
      );
      
      expect(apiError.message).toBe('Not found');
      expect(apiError.status).toBe(404);
      expect(apiError.code).toBe('NOT_FOUND');
      expect(apiError.data).toEqual({ message: 'Not found', code: 'NOT_FOUND' });
      expect(apiError.isApiError).toBe(true);
    });
  });

  describe('Metrics', () => {
    it('should track request metrics', () => {
      const initialStats = httpService.getMetrics();
      expect(initialStats.total).toBe(0);
      expect(initialStats.success).toBe(0);
      expect(initialStats.failed).toBe(0);
    });

    it('should reset metrics', () => {
      httpService.resetMetrics();
      const stats = httpService.getMetrics();
      
      expect(stats).toEqual({
        total: 0,
        success: 0,
        failed: 0,
        retries: 0,
        avgResponseTime: 0
      });
    });
  });

  describe('Health Check', () => {
    it('should return true for successful health check', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { status: 'healthy' } });
      
      const result = await httpService.healthCheck();
      
      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/system/health');
    });

    it('should return false for failed health check', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Health check failed'));
      
      const result = await httpService.healthCheck();
      
      expect(result).toBe(false);
    });
  });

  describe('Cancel Tokens', () => {
    it('should create cancel tokens', () => {
      // Mock the axios CancelToken
      const mockCancelToken = {
        token: 'cancel-token',
        cancel: vi.fn()
      };
      
      vi.mocked(axios.CancelToken.source).mockReturnValue(mockCancelToken);
      
      const cancelToken = httpService.createCancelToken();
      
      expect(cancelToken).toBe(mockCancelToken);
    });

    it('should identify cancel errors', () => {
      const cancelError = new Error('Request cancelled');
      
      vi.mocked(axios.isCancel).mockReturnValue(true);
      
      const result = httpService.isCancelError(cancelError);
      
      expect(result).toBe(true);
    });
  });
});

describe('ApiError', () => {
  it('should create error with all properties', () => {
    const error = new ApiError(
      'Test error',
      500,
      'TEST_ERROR',
      { detail: 'Additional data' },
      { url: '/test' }
    );
    
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(500);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.data).toEqual({ detail: 'Additional data' });
    expect(error.config).toEqual({ url: '/test' });
    expect(error.isApiError).toBe(true);
  });

  it('should be instance of Error', () => {
    const error = new ApiError('Test', 400, 'TEST');
    
    expect(error instanceof Error).toBe(true);
    expect(error instanceof ApiError).toBe(true);
  });
});