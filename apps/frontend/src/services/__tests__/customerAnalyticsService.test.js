// Tests for Customer Analytics Service  
// API-003 Implementation Verification
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock httpService before importing customerAnalyticsService
vi.mock('../httpClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  ApiError: vi.fn().mockImplementation((message, status, code) => ({
    message,
    status,
    code,
    isApiError: true
  }))
}));

import customerAnalyticsService from '../customerAnalyticsService';
import httpService from '../httpClient';

const mockHttpService = vi.mocked(httpService);

describe('CustomerAnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    customerAnalyticsService.clearCache();
  });

  afterEach(() => {
    customerAnalyticsService.clearCache();
  });

  describe('getDashboardSummary', () => {
    it('should fetch dashboard summary with default parameters', async () => {
      const mockData = {
        revenue: { current: 100000, trend: 'up' },
        orders: { current: 500, trend: 'up' },
        inventory: { totalValue: 50000, lowStockItems: 5 }
      };

      mockHttpService.get.mockResolvedValue(mockData);

      const result = await customerAnalyticsService.getDashboardSummary();

      expect(mockHttpService.get).toHaveBeenCalledWith('/dashboard/summary', {
        timeRange: '7d',
        includeComparisons: true,
        includeTrends: true
      });
      expect(result).toBeDefined();
      expect(result.lastUpdated).toBeDefined();
    });

    it('should use cached data when available', async () => {
      const mockData = { revenue: { current: 100000 } };
      mockHttpService.get.mockResolvedValue(mockData);

      // First call
      await customerAnalyticsService.getDashboardSummary();
      
      // Second call should use cache
      await customerAnalyticsService.getDashboardSummary();

      expect(mockHttpService.get).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('API Error');
      mockHttpService.get.mockRejectedValue(error);

      await expect(customerAnalyticsService.getDashboardSummary())
        .rejects.toThrow('Dashboard summary fetch failed');
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should fetch revenue analytics with forecasting', async () => {
      const mockCurrentData = {
        total: 100000,
        trends: [{ period: '2024-01', value: 95000 }]
      };
      const mockForecastData = {
        predictions: [{ period: '2024-02', predicted: 105000 }]
      };

      mockHttpService.get
        .mockResolvedValueOnce(mockCurrentData)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockForecastData);

      const result = await customerAnalyticsService.getRevenueAnalytics();

      expect(result).toHaveProperty('current', mockCurrentData);
      expect(result).toHaveProperty('forecast', mockForecastData);
      expect(result).toHaveProperty('insights');
    });

    it('should handle comparison data when provided', async () => {
      const mockCurrentData = { total: 100000 };
      const mockComparisonData = { total: 90000 };

      mockHttpService.get
        .mockResolvedValueOnce(mockCurrentData)
        .mockResolvedValueOnce(mockComparisonData)
        .mockResolvedValueOnce(null);

      const result = await customerAnalyticsService.getRevenueAnalytics({
        compareWith: '30d'
      });

      expect(result.current).toBe(mockCurrentData);
      expect(result.comparison).toBe(mockComparisonData);
    });
  });

  describe('getCustomerAnalytics', () => {
    it('should fetch comprehensive customer analytics', async () => {
      const mockSegmentationData = {
        segments: [
          { id: 1, name: 'High Value', revenue: 50000, customers: 100 },
          { id: 2, name: 'Regular', revenue: 30000, customers: 200 }
        ]
      };
      const mockLTVData = { averageLifetimeValue: 500 };
      const mockChurnData = { overallRate: 0.05, riskFactors: ['low_engagement'] };
      const mockTrendsData = { trends: [] };

      mockHttpService.get
        .mockResolvedValueOnce(mockSegmentationData)
        .mockResolvedValueOnce(mockLTVData)
        .mockResolvedValueOnce(mockChurnData)
        .mockResolvedValueOnce(mockTrendsData);

      const result = await customerAnalyticsService.getCustomerAnalytics();

      expect(result.segmentation).toBeDefined();
      expect(result.segmentation.segments).toHaveLength(2);
      expect(result.lifetimeValue).toBe(mockLTVData);
      expect(result.churnAnalysis).toBeDefined();
      expect(result.insights).toBeDefined();
    });

    it('should use cache for repeated requests', async () => {
      const mockData = { segments: [] };
      mockHttpService.get.mockResolvedValue(mockData);

      // First call
      await customerAnalyticsService.getCustomerAnalytics();
      // Second call should use cache
      const result = await customerAnalyticsService.getCustomerAnalytics();

      expect(mockHttpService.get).toHaveBeenCalledTimes(4); // Only first call makes API requests
      expect(result).toBeDefined();
    });
  });

  describe('getInventoryAnalytics', () => {
    it('should fetch inventory analytics with forecasting and optimization', async () => {
      const mockInventoryData = {
        totalValue: 50000,
        totalItems: 1000,
        lowStockItems: 10
      };
      const mockForecastData = {
        predictions: [{ product: 'A', reorderPoint: 50 }]
      };
      const mockOptimizationData = {
        recommendations: ['increase_stock_A']
      };
      const mockAlertsData = {
        alerts: [{ type: 'low_stock', product: 'B' }]
      };

      mockHttpService.get
        .mockResolvedValueOnce(mockInventoryData)
        .mockResolvedValueOnce(mockForecastData)
        .mockResolvedValueOnce(mockOptimizationData)
        .mockResolvedValueOnce(mockAlertsData);

      const result = await customerAnalyticsService.getInventoryAnalytics();

      expect(result.metrics).toBe(mockInventoryData);
      expect(result.forecasting).toBe(mockForecastData);
      expect(result.optimization).toBe(mockOptimizationData);
      expect(result.alerts).toBe(mockAlertsData);
      expect(result.insights).toBeDefined();
    });
  });

  describe('getOrderAnalytics', () => {
    it('should fetch order analytics with patterns and seasonality', async () => {
      const mockOrderMetrics = {
        totalOrders: 500,
        averageOrderValue: 75
      };
      const mockPatternsData = {
        patterns: [{ type: 'weekly', peak: 'Friday' }]
      };
      const mockSeasonalityData = {
        seasonal: [{ month: 'December', multiplier: 1.5 }]
      };

      mockHttpService.get
        .mockResolvedValueOnce(mockOrderMetrics)
        .mockResolvedValueOnce(mockPatternsData)
        .mockResolvedValueOnce(mockSeasonalityData);

      const result = await customerAnalyticsService.getOrderAnalytics();

      expect(result.metrics).toBe(mockOrderMetrics);
      expect(result.patterns).toBe(mockPatternsData);
      expect(result.seasonality).toBe(mockSeasonalityData);
      expect(result.insights).toBeDefined();
    });
  });

  describe('getProductAnalytics', () => {
    it('should fetch product analytics with recommendations and performance', async () => {
      const mockProductData = {
        products: [{ id: 1, name: 'Product A', sales: 100 }]
      };
      const mockRecommendations = {
        recommendations: ['promote_product_B']
      };
      const mockPerformance = {
        topPerformers: ['Product A'],
        underPerformers: ['Product C']
      };
      const mockCorrelations = {
        correlations: [{ productA: 'A', productB: 'B', strength: 0.8 }]
      };

      mockHttpService.get
        .mockResolvedValueOnce(mockProductData)
        .mockResolvedValueOnce(mockRecommendations)
        .mockResolvedValueOnce(mockPerformance)
        .mockResolvedValueOnce(mockCorrelations);

      const result = await customerAnalyticsService.getProductAnalytics();

      expect(result.products).toBe(mockProductData);
      expect(result.recommendations).toBe(mockRecommendations);
      expect(result.performance).toBe(mockPerformance);
      expect(result.correlations).toBe(mockCorrelations);
      expect(result.insights).toBeDefined();
    });
  });

  describe('getPredictiveAnalytics', () => {
    it('should fetch all types of predictions when type is "all"', async () => {
      const mockDemandData = { predictions: [{ product: 'A', demand: 100 }] };
      const mockRevenueData = { predictions: [{ month: 'Feb', revenue: 110000 }] };
      const mockChurnData = { predictions: [{ segment: 'High Value', churnRate: 0.02 }] };
      const mockInventoryData = { predictions: [{ product: 'B', stockout: 'low' }] };

      mockHttpService.get
        .mockResolvedValueOnce(mockDemandData)
        .mockResolvedValueOnce(mockRevenueData)
        .mockResolvedValueOnce(mockChurnData)
        .mockResolvedValueOnce(mockInventoryData);

      const result = await customerAnalyticsService.getPredictiveAnalytics({ type: 'all' });

      expect(result.predictions.demand).toBe(mockDemandData);
      expect(result.predictions.revenue).toBe(mockRevenueData);
      expect(result.predictions.churn).toBe(mockChurnData);
      expect(result.predictions.inventory).toBe(mockInventoryData);
      expect(result.confidence).toBeDefined();
    });

    it('should fetch specific prediction type when specified', async () => {
      const mockData = { predictions: [{ product: 'A', demand: 100 }] };
      mockHttpService.get.mockResolvedValue(mockData);

      const result = await customerAnalyticsService.getPredictiveAnalytics({ type: 'demand' });

      expect(mockHttpService.get).toHaveBeenCalledWith('/analytics/predictions/demand', {
        timeHorizon: '30d',
        confidenceLevel: 0.8,
        includeScenarios: true,
        includeFactors: true
      });
      expect(result.predictions.demand).toBe(mockData);
    });
  });

  describe('getRealTimeAnalytics', () => {
    it('should fetch real-time analytics data', async () => {
      const mockRealTimeData = {
        orders: { current: 25, trend: 'up' },
        revenue: { current: 5000, trend: 'stable' },
        inventory: { alerts: 3 },
        lastUpdate: Date.now()
      };

      mockHttpService.get.mockResolvedValue(mockRealTimeData);

      const result = await customerAnalyticsService.getRealTimeAnalytics();

      expect(mockHttpService.get).toHaveBeenCalledWith('/analytics/realtime', {
        metrics: ['orders', 'revenue', 'inventory', 'alerts'],
        includeComparisons: true,
        includeMetadata: true
      });
      expect(result).toEqual(expect.objectContaining(mockRealTimeData));
      expect(result.timestamp).toBeDefined();
      expect(result.insights).toBeDefined();
    });
  });

  describe('generateCustomReport', () => {
    it('should generate custom report with specified parameters', async () => {
      const mockReport = {
        id: 'report_123',
        name: 'Monthly Revenue Report',
        data: { revenue: 100000, orders: 500 },
        format: 'json'
      };

      mockHttpService.post.mockResolvedValue(mockReport);

      const result = await customerAnalyticsService.generateCustomReport({
        name: 'Monthly Revenue Report',
        metrics: ['revenue', 'orders'],
        timeRange: '30d',
        format: 'json'
      });

      expect(mockHttpService.post).toHaveBeenCalledWith('/analytics/reports/generate', {
        name: 'Monthly Revenue Report',
        metrics: ['revenue', 'orders'],
        timeRange: '30d',
        filters: {},
        format: 'json',
        options: {
          includeCharts: true,
          includeInsights: true,
          includeRawData: false
        }
      });
      expect(result.generated).toBeDefined();
      expect(result.insights).toBeDefined();
    });
  });

  describe('exportAnalyticsData', () => {
    it('should export analytics data in specified format', async () => {
      const mockExportData = {
        downloadUrl: 'https://example.com/export.csv',
        filename: 'revenue_analytics_123.csv'
      };

      mockHttpService.get.mockResolvedValue(mockExportData);

      const result = await customerAnalyticsService.exportAnalyticsData({
        type: 'revenue',
        timeRange: '30d',
        format: 'csv'
      });

      expect(mockHttpService.get).toHaveBeenCalledWith('/analytics/export/revenue', {
        timeRange: '30d',
        format: 'csv',
        includeMetadata: true,
        filename: expect.stringContaining('revenue_analytics_')
      });
      expect(result).toBe(mockExportData);
    });
  });

  describe('Cache Management', () => {
    it('should cache data and retrieve from cache', async () => {
      const mockData = { test: 'data' };
      
      // Set cache
      customerAnalyticsService.setCachedData('test_key', mockData);
      
      // Get from cache
      const cachedData = customerAnalyticsService.getCachedData('test_key');
      
      expect(cachedData).toEqual(mockData);
    });

    it('should return null for expired cache', async () => {
      const mockData = { test: 'data' };
      
      // Mock expired timestamp
      customerAnalyticsService.cache.set('test_key', {
        data: mockData,
        timestamp: Date.now() - (10 * 60 * 1000) // 10 minutes ago
      });
      
      const cachedData = customerAnalyticsService.getCachedData('test_key');
      
      expect(cachedData).toBeNull();
    });

    it('should clear cache correctly', () => {
      customerAnalyticsService.setCachedData('test1', { data: 1 });
      customerAnalyticsService.setCachedData('test2', { data: 2 });
      
      customerAnalyticsService.clearCache();
      
      expect(customerAnalyticsService.getCacheStats().totalEntries).toBe(0);
    });

    it('should clear cache with pattern', () => {
      customerAnalyticsService.setCachedData('dashboard_test', { data: 1 });
      customerAnalyticsService.setCachedData('revenue_test', { data: 2 });
      customerAnalyticsService.setCachedData('other_test', { data: 3 });
      
      customerAnalyticsService.clearCache('dashboard');
      
      const stats = customerAnalyticsService.getCacheStats();
      expect(stats.totalEntries).toBe(2);
    });

    it('should provide cache statistics', () => {
      customerAnalyticsService.clearCache();
      customerAnalyticsService.setCachedData('test1', { data: 1 });
      customerAnalyticsService.setCachedData('test2', { data: 2 });
      
      const stats = customerAnalyticsService.getCacheStats();
      
      expect(stats).toEqual({
        totalEntries: 2,
        validEntries: 2,
        expiredEntries: 0,
        cacheHitRate: 1
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors properly', async () => {
      const apiError = {
        message: 'Server Error',
        status: 500,
        code: 'INTERNAL_ERROR',
        isApiError: true
      };

      mockHttpService.get.mockRejectedValue(apiError);

      await expect(customerAnalyticsService.getDashboardSummary())
        .rejects.toMatchObject({
          message: expect.stringContaining('Dashboard summary fetch failed'),
          isApiError: true
        });
    });

    it('should handle generic errors', async () => {
      const genericError = new Error('Network Error');
      mockHttpService.get.mockRejectedValue(genericError);

      await expect(customerAnalyticsService.getRevenueAnalytics())
        .rejects.toMatchObject({
          message: 'Revenue analytics fetch failed',
          status: 500,
          code: 'ANALYTICS_ERROR'
        });
    });
  });
});

describe('Data Processing Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enhanceDashboardData', () => {
    it('should enhance dashboard data with insights', () => {
      const mockData = {
        revenue: { current: 100000, trend: 'up' },
        orders: { current: 500, trend: 'up' }
      };

      const enhanced = customerAnalyticsService.enhanceDashboardData(mockData);

      expect(enhanced).toEqual(expect.objectContaining(mockData));
      expect(enhanced.insights).toBeDefined();
      expect(enhanced.lastUpdated).toBeDefined();
    });

    it('should handle null data', () => {
      const result = customerAnalyticsService.enhanceDashboardData(null);
      expect(result).toBeNull();
    });
  });

  describe('processSegmentationData', () => {
    it('should process segmentation data with health scores', () => {
      const mockData = {
        segments: [
          { id: 1, name: 'High Value', revenue: 50000 },
          { id: 2, name: 'Regular', revenue: 30000 }
        ]
      };

      const processed = customerAnalyticsService.processSegmentationData(mockData);

      expect(processed.segments).toHaveLength(2);
      expect(processed.segments[0]).toHaveProperty('healthScore');
      expect(processed.segments[0]).toHaveProperty('growthPotential');
      expect(processed.segments[0]).toHaveProperty('recommendations');
      expect(processed.summary).toBeDefined();
    });
  });

  describe('processChurnData', () => {
    it('should process churn data with risk levels', () => {
      const mockData = {
        overallRate: 0.05,
        predictions: [{ customer: 'A', risk: 'high' }]
      };

      const processed = customerAnalyticsService.processChurnData(mockData);

      expect(processed).toEqual(expect.objectContaining(mockData));
      expect(processed.riskLevels).toBeDefined();
      expect(processed.actionableInsights).toBeDefined();
    });
  });
});