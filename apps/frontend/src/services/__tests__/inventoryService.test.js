// Inventory Service Tests
// Tests for API-004: Inventory management service
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import inventoryService, { InventoryService } from '../inventoryService';
import httpService from '../httpClient';
import { ApiError } from '../httpClient';

// Mock httpService
vi.mock('../httpClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn()
  },
  ApiError: class ApiError extends Error {
    constructor(message, status, code, data) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code;
      this.data = data;
    }
  }
}));

describe('InventoryService', () => {
  let service;

  beforeEach(() => {
    service = new InventoryService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('getInventoryOverview', () => {
    const mockOverviewData = {
      summary: {
        totalItems: 150,
        totalValue: 50000,
        lowStockItems: 15,
        categories: 8
      }
    };

    const mockMetricsData = {
      turnoverRate: 6.2,
      averageAge: 45,
      stockoutRisk: 0.12
    };

    const mockAlertsData = {
      alerts: [
        { id: 1, severity: 'critical', message: 'Low stock alert' },
        { id: 2, severity: 'warning', message: 'Slow moving item' }
      ]
    };

    it('should fetch inventory overview with all components', async () => {
      httpService.get.mockImplementation((endpoint) => {
        if (endpoint === '/inventory') return Promise.resolve(mockOverviewData);
        if (endpoint === '/analytics/inventory') return Promise.resolve(mockMetricsData);
        if (endpoint === '/inventory/alerts') return Promise.resolve(mockAlertsData);
        return Promise.reject(new Error('Unexpected endpoint'));
      });

      const result = await service.getInventoryOverview({
        timeRange: '30d',
        includeMetrics: true,
        includeAlerts: true
      });

      expect(result).toHaveProperty('overview', mockOverviewData);
      expect(result).toHaveProperty('metrics', mockMetricsData);
      expect(result).toHaveProperty('alerts', mockAlertsData);
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('lastUpdated');

      expect(httpService.get).toHaveBeenCalledTimes(3);
      expect(httpService.get).toHaveBeenCalledWith('/inventory', {
        summary: true,
        timeRange: '30d',
        includeCategories: true,
        includeLocations: true
      });
    });

    it('should use cached data when available', async () => {
      httpService.get.mockResolvedValue(mockOverviewData);

      // First call - will fetch data (no cache, no metrics, no alerts)
      await service.getInventoryOverview({ 
        timeRange: '30d',
        includeMetrics: false,
        includeAlerts: false,
        useCache: false 
      });
      
      // Second call should use cache
      const result = await service.getInventoryOverview({ 
        timeRange: '30d',
        includeMetrics: false,
        includeAlerts: false,
        useCache: true
      });

      expect(result).toHaveProperty('overview');
      expect(httpService.get).toHaveBeenCalledTimes(1); // Only called once due to caching
    });

    it('should handle API errors gracefully', async () => {
      const apiError = new ApiError('Service unavailable', 503, 'SERVICE_UNAVAILABLE');
      httpService.get.mockImplementation(() => {
        throw apiError;
      });

      await expect(service.getInventoryOverview()).rejects.toThrow('Inventory overview fetch failed');
    });
  });

  describe('getInventoryList', () => {
    const mockInventoryList = {
      items: [
        {
          id: 'item1',
          name: 'Product A',
          currentStock: 25,
          reorderPoint: 50,
          turnoverRate: 4.2,
          averageAge: 30
        },
        {
          id: 'item2',
          name: 'Product B',
          currentStock: 100,
          reorderPoint: 30,
          turnoverRate: 8.5,
          averageAge: 15
        }
      ],
      pagination: {
        page: 1,
        limit: 50,
        total: 2
      }
    };

    it('should fetch inventory list with enhancements', async () => {
      httpService.get.mockResolvedValue(mockInventoryList);

      const result = await service.getInventoryList({
        page: 1,
        limit: 50,
        sortBy: 'name',
        lowStockOnly: true
      });

      expect(result).toHaveProperty('items');
      expect(result.items[0]).toHaveProperty('healthScore');
      expect(result.items[0]).toHaveProperty('recommendations');
      expect(result.items[0]).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('insights');

      expect(httpService.get).toHaveBeenCalledWith('/inventory', {
        page: 1,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'desc',
        category: null,
        location: null,
        status: null,
        search: '',
        lowStockOnly: true,
        includeHistory: false,
        includeMetrics: true
      });
    });

    it('should handle empty inventory list', async () => {
      httpService.get.mockResolvedValue({ items: [], pagination: { total: 0 } });

      const result = await service.getInventoryList();

      expect(result.items).toEqual([]);
      expect(result.insights).toEqual([]);
    });
  });

  describe('getInventoryItem', () => {
    const mockItem = {
      id: 'item1',
      name: 'Product A',
      currentStock: 25,
      reorderPoint: 50,
      turnoverRate: 4.2,
      averageAge: 30,
      averageDailyDemand: 2.5,
      averageLeadTime: 7,
      demandVariability: 0.4
    };

    const mockHistory = {
      adjustments: [
        { date: '2025-01-18', quantity: -10, type: 'sale' },
        { date: '2025-01-17', quantity: 50, type: 'purchase' }
      ]
    };

    it('should fetch detailed item information', async () => {
      httpService.get.mockImplementation((endpoint) => {
        if (endpoint === '/inventory/item1') return Promise.resolve(mockItem);
        if (endpoint === '/inventory/item1/history') return Promise.resolve(mockHistory);
        return Promise.resolve(null);
      });

      const result = await service.getInventoryItem('item1', {
        includeHistory: true,
        includeForecasting: true,
        includeRecommendations: true
      });

      expect(result).toHaveProperty('id', 'item1');
      expect(result).toHaveProperty('history', mockHistory);
      expect(result).toHaveProperty('healthScore');
      expect(result).toHaveProperty('riskAssessment');
      expect(result).toHaveProperty('insights');
      expect(typeof result.healthScore).toBe('number');
      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(1);
    });

    it('should throw error for non-existent item', async () => {
      httpService.get.mockRejectedValue(new ApiError('Not found', 404, 'NOT_FOUND'));

      await expect(service.getInventoryItem('nonexistent')).rejects.toThrow('Inventory item fetch failed');
    });
  });

  describe('adjustStock', () => {
    const mockAdjustmentResponse = {
      success: true,
      newStock: 75,
      adjustment: {
        id: 'adj123',
        quantity: 25,
        type: 'purchase',
        timestamp: Date.now()
      }
    };

    it('should successfully adjust stock', async () => {
      httpService.post.mockResolvedValue(mockAdjustmentResponse);

      const adjustment = {
        quantity: 25,
        type: 'purchase',
        reason: 'Restocking',
        location: 'warehouse-1'
      };

      const result = await service.adjustStock('item1', adjustment);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('recommendations');

      expect(httpService.post).toHaveBeenCalledWith('/inventory/item1/adjust', {
        quantity: 25,
        type: 'purchase',
        reason: 'Restocking',
        location: 'warehouse-1',
        batchNumber: null,
        expiryDate: null,
        cost: null,
        notes: '',
        timestamp: expect.any(Number)
      });
    });

    it('should validate adjustment data', async () => {
      const invalidAdjustment = {
        quantity: 'invalid',
        type: 'invalid_type'
      };

      await expect(service.adjustStock('item1', invalidAdjustment)).rejects.toThrow('Valid quantity is required');
    });

    it('should require reason for negative adjustments', async () => {
      const adjustment = {
        quantity: -10,
        type: 'adjustment'
        // Missing reason
      };

      await expect(service.adjustStock('item1', adjustment)).rejects.toThrow('Reason is required for stock reductions');
    });
  });

  describe('bulkAdjustStock', () => {
    const mockBulkResponse = {
      successful: [
        { productId: 'item1', newStock: 75 },
        { productId: 'item2', newStock: 125 }
      ],
      failed: []
    };

    it('should successfully perform bulk adjustments', async () => {
      httpService.post.mockResolvedValue(mockBulkResponse);

      const adjustments = [
        { productId: 'item1', quantity: 25, type: 'purchase', reason: 'Restock' },
        { productId: 'item2', quantity: 50, type: 'purchase', reason: 'Restock' }
      ];

      const result = await service.bulkAdjustStock(adjustments);

      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('insights');
      expect(result.summary.successful).toBe(2);
      expect(result.summary.failed).toBe(0);

      expect(httpService.post).toHaveBeenCalledWith('/inventory/bulk-adjust', {
        adjustments: adjustments.map(adj => ({
          ...adj,
          timestamp: expect.any(Number)
        }))
      });
    });

    it('should validate all adjustments before processing', async () => {
      const adjustments = [
        { productId: 'item1', quantity: 25, type: 'purchase', reason: 'Restock' },
        { productId: 'item2', quantity: 'invalid', type: 'purchase' }
      ];

      await expect(service.bulkAdjustStock(adjustments)).rejects.toThrow('Valid quantity is required');
    });
  });

  describe('transferStock', () => {
    const mockTransferResponse = {
      success: true,
      transferId: 'transfer123',
      status: 'initiated'
    };

    it('should successfully transfer stock', async () => {
      httpService.post.mockResolvedValue(mockTransferResponse);

      const transfer = {
        productId: 'item1',
        fromLocation: 'warehouse-1',
        toLocation: 'store-1',
        quantity: 20,
        reason: 'Store replenishment'
      };

      const result = await service.transferStock(transfer);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('insights');

      expect(httpService.post).toHaveBeenCalledWith('/inventory/transfer', {
        ...transfer,
        expectedDate: null,
        notes: '',
        initiatedAt: expect.any(Number)
      });
    });

    it('should validate transfer data', async () => {
      const invalidTransfer = {
        productId: 'item1',
        fromLocation: 'warehouse-1',
        toLocation: 'warehouse-1', // Same as from location
        quantity: 20
      };

      await expect(service.transferStock(invalidTransfer)).rejects.toThrow('From and to locations cannot be the same');
    });

    it('should require positive quantity', async () => {
      const transfer = {
        productId: 'item1',
        fromLocation: 'warehouse-1',
        toLocation: 'store-1',
        quantity: -5
      };

      await expect(service.transferStock(transfer)).rejects.toThrow('Valid positive quantity is required');
    });
  });

  describe('getInventoryForecasting', () => {
    const mockForecastingData = {
      forecasting: {
        predictions: [
          { productId: 'item1', forecastedDemand: 100, confidence: 0.85 }
        ]
      },
      reorderPoints: {
        recommendations: [
          { productId: 'item1', recommendedReorderPoint: 45 }
        ]
      }
    };

    it('should fetch forecasting data with caching', async () => {
      httpService.get.mockImplementation(() => Promise.resolve(mockForecastingData.forecasting));

      const result = await service.getInventoryForecasting({
        timeHorizon: '60d',
        includeReorderPoints: true,
        includeSeasonality: true
      });

      expect(result).toHaveProperty('forecasting');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('generatedAt');
    });

    it('should use forecast cache', async () => {
      httpService.get.mockResolvedValue(mockForecastingData.forecasting);

      // First call - disable extra components to reduce API calls
      await service.getInventoryForecasting({ 
        timeHorizon: '30d',
        includeReorderPoints: false,
        includeSeasonality: false,
        includeOptimization: false
      });
      
      // Second call should use cache
      const result = await service.getInventoryForecasting({ 
        timeHorizon: '30d',
        includeReorderPoints: false,
        includeSeasonality: false,
        includeOptimization: false
      });

      expect(result).toHaveProperty('forecasting');
      expect(httpService.get).toHaveBeenCalledTimes(1); // Only called once due to caching
    });
  });

  describe('Data Processing Methods', () => {
    describe('calculateItemHealthScore', () => {
      it('should calculate health score correctly', () => {
        const item = {
          currentStock: 100,
          reorderPoint: 50,
          turnoverRate: 6,
          averageAge: 25,
          demandVariability: 0.2
        };

        const healthScore = service.calculateItemHealthScore(item);

        expect(healthScore).toBeGreaterThan(0.5);
        expect(healthScore).toBeLessThanOrEqual(1);
      });

      it('should return 0 for null item', () => {
        const healthScore = service.calculateItemHealthScore(null);
        expect(healthScore).toBe(0);
      });

      it('should penalize low stock levels', () => {
        const lowStockItem = {
          currentStock: 10,
          reorderPoint: 50,
          turnoverRate: 6,
          averageAge: 25,
          demandVariability: 0.2
        };

        const healthScore = service.calculateItemHealthScore(lowStockItem);
        expect(healthScore).toBeLessThan(0.5);
      });
    });

    describe('assessStockRisk', () => {
      it('should assess critical risk for very low stock', () => {
        const item = {
          currentStock: 5,
          reorderPoint: 50,
          averageDailyDemand: 10,
          averageLeadTime: 7
        };

        const riskLevel = service.assessStockRisk(item);
        expect(riskLevel).toBe('critical');
      });

      it('should assess low risk for high stock', () => {
        const item = {
          currentStock: 200,
          reorderPoint: 50,
          averageDailyDemand: 5,
          averageLeadTime: 7
        };

        const riskLevel = service.assessStockRisk(item);
        expect(riskLevel).toBe('low');
      });

      it('should return unknown for null item', () => {
        const riskLevel = service.assessStockRisk(null);
        expect(riskLevel).toBe('unknown');
      });
    });

    describe('generateItemRecommendations', () => {
      it('should generate urgent reorder recommendation for critical risk', () => {
        const item = {
          currentStock: 5,
          reorderPoint: 50,
          turnoverRate: 6,
          demandVariability: 0.3
        };

        const recommendations = service.generateItemRecommendations(item);
        
        expect(recommendations.some(r => r.type === 'urgent_reorder' && r.priority === 'high')).toBe(true);
      });

      it('should generate slow moving recommendation for low turnover', () => {
        const item = {
          currentStock: 100,
          reorderPoint: 50,
          turnoverRate: 1.5,
          demandVariability: 0.3
        };

        const recommendations = service.generateItemRecommendations(item);
        
        expect(recommendations.some(r => r.type === 'slow_moving' && r.priority === 'medium')).toBe(true);
      });

      it('should return empty array for null item', () => {
        const recommendations = service.generateItemRecommendations(null);
        expect(recommendations).toEqual([]);
      });
    });
  });

  describe('Validation Methods', () => {
    describe('validateStockAdjustment', () => {
      it('should pass valid adjustment', () => {
        const adjustment = {
          quantity: 25,
          type: 'purchase',
          reason: 'Restocking'
        };

        expect(() => service.validateStockAdjustment(adjustment)).not.toThrow();
      });

      it('should throw error for invalid quantity', () => {
        const adjustment = {
          quantity: 'invalid',
          type: 'purchase'
        };

        expect(() => service.validateStockAdjustment(adjustment))
          .toThrow('Valid quantity is required');
      });

      it('should throw error for invalid type', () => {
        const adjustment = {
          quantity: 25,
          type: 'invalid_type'
        };

        expect(() => service.validateStockAdjustment(adjustment))
          .toThrow('Valid adjustment type is required');
      });
    });

    describe('validateStockTransfer', () => {
      it('should pass valid transfer', () => {
        const transfer = {
          productId: 'item1',
          fromLocation: 'warehouse-1',
          toLocation: 'store-1',
          quantity: 25
        };

        expect(() => service.validateStockTransfer(transfer)).not.toThrow();
      });

      it('should throw error for same locations', () => {
        const transfer = {
          productId: 'item1',
          fromLocation: 'warehouse-1',
          toLocation: 'warehouse-1',
          quantity: 25
        };

        expect(() => service.validateStockTransfer(transfer))
          .toThrow('From and to locations cannot be the same');
      });
    });

    describe('validateAlertRule', () => {
      it('should pass valid rule', () => {
        const rule = {
          name: 'Low Stock Alert',
          conditions: [{ field: 'currentStock', operator: '<', value: 10 }],
          severity: 'warning'
        };

        expect(() => service.validateAlertRule(rule)).not.toThrow();
      });

      it('should throw error for empty name', () => {
        const rule = {
          name: '',
          conditions: [{}],
          severity: 'warning'
        };

        expect(() => service.validateAlertRule(rule))
          .toThrow('Rule name is required');
      });
    });
  });

  describe('Cache Management', () => {
    it('should cache and retrieve data', () => {
      const testData = { test: 'data' };
      service.setCachedData('test_key', testData);

      const cached = service.getCachedData('test_key');
      expect(cached).toEqual(testData);
    });

    it('should return null for expired cache', () => {
      const testData = { test: 'data' };
      service.setCachedData('test_key', testData);
      
      // Manually expire the cache
      service.cache.get('test_key').timestamp = Date.now() - service.cacheTimeout - 1000;
      
      const cached = service.getCachedData('test_key');
      expect(cached).toBeNull();
    });

    it('should clear cache by pattern', () => {
      service.setCachedData('inventory_test', { test: 1 });
      service.setCachedData('forecast_test', { test: 2 });
      service.setCachedData('other_test', { test: 3 });

      service.clearCache('inventory');

      expect(service.getCachedData('inventory_test')).toBeNull();
      expect(service.getCachedData('forecast_test')).toBeTruthy();
      expect(service.getCachedData('other_test')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors properly', () => {
      const originalError = new ApiError('Service error', 500, 'SERVICE_ERROR');
      const handled = service.handleInventoryError('Test failed', originalError);

      expect(handled).toBeInstanceOf(ApiError);
      expect(handled.message).toContain('Test failed: Service error');
      expect(handled.status).toBe(500);
      expect(handled.code).toBe('SERVICE_ERROR');
    });

    it('should wrap non-API errors', () => {
      const originalError = new Error('Generic error');
      const handled = service.handleInventoryError('Test failed', originalError);

      expect(handled).toBeInstanceOf(ApiError);
      expect(handled.message).toBe('Test failed');
      expect(handled.status).toBe(500);
      expect(handled.code).toBe('INVENTORY_ERROR');
    });
  });
});