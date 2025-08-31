/**
 * Query Optimization Tests - Phase 5 QA
 * Comprehensive test suite for database query optimization patterns
 * Tests caching, deduplication, batching, search indexing, and performance monitoring
 */

import { describe, test, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import { 
  QueryCache, 
  QueryOptimizer, 
  DatabasePatterns,
  queryCache,
  queryOptimizer,
  createOptimizedStore 
} from '../queryOptimization.js';

/**
 * Mock LRU Cache
 */
vi.mock('lru-cache', () => ({
  LRUCache: vi.fn().mockImplementation(() => ({
    max: 100,
    size: 0,
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    keys: vi.fn(() => []),
    entries: vi.fn(() => []),
    has: vi.fn()
  }))
}));

beforeAll(() => {
  // Mock performance.now for consistent timing
  global.performance = {
    ...global.performance,
    now: vi.fn(() => Date.now())
  };
});

/**
 * QueryCache Tests
 */
describe('QueryCache', () => {
  let cache;

  beforeEach(() => {
    cache = new QueryCache();
    vi.clearAllMocks();
  });

  test('should initialize with default configuration', () => {
    expect(cache).toBeDefined();
    expect(cache.hitCount).toBe(0);
    expect(cache.missCount).toBe(0);
    expect(cache.keyGenerators).toBeInstanceOf(Map);
  });

  test('should generate consistent cache keys', () => {
    const endpoint = 'products';
    const params = { page: 1, search: 'coffee' };
    const options = { forceFresh: false };

    const key1 = cache.generateKey(endpoint, params, options);
    const key2 = cache.generateKey(endpoint, params, options);

    expect(key1).toBe(key2);
    expect(key1).toContain('products');
    expect(key1).toContain('coffee');
  });

  test('should sort parameters for consistent keys', () => {
    const endpoint = 'products';
    const params1 = { search: 'coffee', page: 1, category: 'food' };
    const params2 = { category: 'food', page: 1, search: 'coffee' };

    const key1 = cache.generateKey(endpoint, params1);
    const key2 = cache.generateKey(endpoint, params2);

    expect(key1).toBe(key2);
  });

  test('should register and use custom key generators', () => {
    const customGenerator = vi.fn((params) => `custom:${params.id}`);
    cache.registerKeyGenerator('users', customGenerator);

    const key = cache.generateKey('users', { id: 123, name: 'test' });
    
    expect(customGenerator).toHaveBeenCalledWith({ id: 123, name: 'test' }, {});
    expect(key).toBe('custom:123');
  });

  test('should handle cache hits correctly', () => {
    const mockData = { data: 'test', timestamp: Date.now() };
    mockLRUCache.get.mockReturnValue(mockData);

    const result = cache.get('endpoint', { param: 'value' });

    expect(result).toBe(mockData);
    expect(cache.hitCount).toBe(1);
    expect(cache.missCount).toBe(0);
  });

  test('should handle cache misses correctly', () => {
    mockLRUCache.get.mockReturnValue(null);

    const result = cache.get('endpoint', { param: 'value' });

    expect(result).toBeNull();
    expect(cache.hitCount).toBe(0);
    expect(cache.missCount).toBe(1);
  });

  test('should set cache entries with correct structure', () => {
    const endpoint = 'products';
    const params = { page: 1 };
    const options = { forceFresh: false };
    const data = { products: [] };
    const customTtl = 60000;

    cache.set(endpoint, params, options, data, customTtl);

    expect(mockLRUCache.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        data,
        timestamp: expect.any(Number),
        params: { page: 1 },
        options: { forceFresh: false }
      }),
      customTtl
    );
  });

  test('should invalidate cache entries by string', () => {
    const key = 'exact-key';
    cache.invalidate(key);
    
    expect(mockLRUCache.delete).toHaveBeenCalledWith(key);
  });

  test('should invalidate cache entries by regex', () => {
    const keys = ['products:1', 'products:2', 'orders:1'];
    mockLRUCache.keys.mockReturnValue(keys);
    
    const pattern = /^products:/;
    cache.invalidate(pattern);
    
    expect(mockLRUCache.delete).toHaveBeenCalledWith('products:1');
    expect(mockLRUCache.delete).toHaveBeenCalledWith('products:2');
    expect(mockLRUCache.delete).not.toHaveBeenCalledWith('orders:1');
  });

  test('should invalidate cache entries by function', () => {
    const entries = [
      ['key1', { timestamp: Date.now() - 100000 }],
      ['key2', { timestamp: Date.now() }]
    ];
    mockLRUCache.entries.mockReturnValue(entries);
    
    const isExpired = (key, value) => Date.now() - value.timestamp > 60000;
    cache.invalidate(isExpired);
    
    expect(mockLRUCache.delete).toHaveBeenCalledWith('key1');
    expect(mockLRUCache.delete).not.toHaveBeenCalledWith('key2');
  });

  test('should calculate statistics correctly', () => {
    cache.hitCount = 8;
    cache.missCount = 2;
    mockLRUCache.size = 50;
    mockLRUCache.max = 100;

    const stats = cache.getStats();

    expect(stats).toEqual({
      size: 50,
      hitCount: 8,
      missCount: 2,
      hitRate: 80,
      maxSize: 100
    });
  });

  test('should handle empty cache statistics', () => {
    cache.hitCount = 0;
    cache.missCount = 0;

    const stats = cache.getStats();

    expect(stats.hitRate).toBe(0);
  });

  test('should clear cache and reset counters', () => {
    cache.hitCount = 5;
    cache.missCount = 3;
    
    cache.clear();

    expect(mockLRUCache.clear).toHaveBeenCalled();
    expect(cache.hitCount).toBe(0);
    expect(cache.missCount).toBe(0);
  });
});

/**
 * QueryOptimizer Tests
 */
describe('QueryOptimizer', () => {
  let optimizer;

  beforeEach(() => {
    optimizer = new QueryOptimizer();
    vi.clearAllMocks();
  });

  test('should initialize with empty state', () => {
    expect(optimizer.pendingRequests).toBeInstanceOf(Map);
    expect(optimizer.batchQueue).toBeInstanceOf(Map);
    expect(optimizer.prefetchQueue).toBeInstanceOf(Set);
    expect(optimizer.debounceTimers).toBeInstanceOf(Map);
  });

  test('should deduplicate identical requests', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const key = 'test-key';

    // Start two identical requests
    const promise1 = optimizer.deduplicate(mockFn, key);
    const promise2 = optimizer.deduplicate(mockFn, key);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result1).toBe('result');
    expect(result2).toBe('result');
  });

  test('should handle request deduplication errors', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Request failed'));
    const key = 'error-key';

    await expect(optimizer.deduplicate(mockFn, key)).rejects.toThrow('Request failed');
    expect(optimizer.pendingRequests.has(key)).toBe(false);
  });

  test('should batch requests correctly', async () => {
    const items = [1, 2, 3, 4, 5];
    const batchProcessor = vi.fn().mockImplementation(async (batch) => 
      batch.map(item => ({ id: item, processed: true }))
    );

    const results = await optimizer.batch('endpoint', items, batchProcessor, { batchSize: 2 });

    expect(batchProcessor).toHaveBeenCalledTimes(3); // 5 items with batch size 2
    expect(batchProcessor).toHaveBeenCalledWith([1, 2]);
    expect(batchProcessor).toHaveBeenCalledWith([3, 4]);
    expect(batchProcessor).toHaveBeenCalledWith([5]);
    expect(results).toHaveLength(5);
  });

  test('should debounce function calls', async () => {
    const mockFn = vi.fn().mockResolvedValue('debounced-result');
    const key = 'debounce-key';
    const delay = 100;

    // Start multiple debounced calls
    const promise1 = optimizer.debounce(mockFn, key, delay);
    const promise2 = optimizer.debounce(mockFn, key, delay);
    const promise3 = optimizer.debounce(mockFn, key, delay);

    // Wait for debounce delay
    await new Promise(resolve => setTimeout(resolve, delay + 10));
    
    const result = await promise3;

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result).toBe('debounced-result');
  });

  test('should prefetch next pages', async () => {
    const mockFetchFn = vi.fn().mockImplementation(async (page) => ({
      page,
      data: [`item${page}`]
    }));

    const currentPage = 1;
    const totalPages = 5;
    const prefetchDistance = 2;

    await optimizer.prefetch(mockFetchFn, currentPage, totalPages, prefetchDistance);

    expect(mockFetchFn).toHaveBeenCalledTimes(2);
    expect(mockFetchFn).toHaveBeenCalledWith(2);
    expect(mockFetchFn).toHaveBeenCalledWith(3);
  });

  test('should optimize query parameters', () => {
    const params = {
      search: 'coffee',
      category: undefined,
      tags: ['organic', 'fair-trade'],
      page: 1,
      empty: '',
      nullValue: null
    };

    const optimized = optimizer.optimizeParams(params);

    expect(optimized).toEqual({
      page: 1,
      search: 'coffee',
      tags: 'organic,fair-trade'
    });
    expect(optimized).not.toHaveProperty('category');
    expect(optimized).not.toHaveProperty('empty');
    expect(optimized).not.toHaveProperty('nullValue');
  });

  test('should create optimized query function', async () => {
    const mockFetchFn = vi.fn().mockResolvedValue({ data: 'test' });
    const endpoint = 'test-endpoint';
    
    const optimizedQuery = optimizer.createOptimizedQuery(endpoint, mockFetchFn, {
      cacheTtl: 60000,
      enableDeduplication: true,
      enableDebounce: false,
      enablePrefetch: false
    });

    expect(typeof optimizedQuery).toBe('function');
    
    // Test the optimized query
    const result = await optimizedQuery({ search: 'test' });
    expect(result).toEqual({ data: 'test' });
    expect(mockFetchFn).toHaveBeenCalledWith({ search: 'test' }, {});
  });
});

/**
 * DatabasePatterns Tests
 */
describe('DatabasePatterns', () => {
  const mockData = [
    { id: 1, name: 'Coffee Beans', category: 'food', price: 24.99, date: new Date('2024-01-01') },
    { id: 2, name: 'Tea Leaves', category: 'food', price: 19.99, date: new Date('2024-01-02') },
    { id: 3, name: 'Notebook', category: 'office', price: 4.99, date: new Date('2024-01-03') },
    { id: 4, name: 'Coffee Mug', category: 'kitchen', price: 12.99, date: new Date('2024-01-04') }
  ];

  test('should create cursor pagination correctly', () => {
    const result = DatabasePatterns.createCursorPagination(mockData, null, 2);

    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe(1);
    expect(result.items[1].id).toBe(2);
    expect(result.hasNextPage).toBe(true);
    expect(result.cursor).toBe(2);
    expect(result.totalCount).toBe(4);
  });

  test('should handle cursor-based navigation', () => {
    const result = DatabasePatterns.createCursorPagination(mockData, 2, 2);

    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe(3);
    expect(result.items[1].id).toBe(4);
    expect(result.hasNextPage).toBe(false);
    expect(result.cursor).toBeNull();
  });

  test('should create filter pipeline correctly', () => {
    const filters = {
      category: 'food',
      price: { min: 20, max: 30 }
    };

    const filtered = DatabasePatterns.createFilterPipeline(mockData, filters);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Coffee Beans');
  });

  test('should handle array filters', () => {
    const filters = {
      category: ['food', 'kitchen']
    };

    const filtered = DatabasePatterns.createFilterPipeline(mockData, filters);

    expect(filtered).toHaveLength(3);
    expect(filtered.map(item => item.category)).toEqual(['food', 'food', 'kitchen']);
  });

  test('should handle string search filters', () => {
    const filters = {
      name: 'coffee'
    };

    const filtered = DatabasePatterns.createFilterPipeline(mockData, filters);

    expect(filtered).toHaveLength(2);
    expect(filtered.every(item => item.name.toLowerCase().includes('coffee'))).toBe(true);
  });

  test('should create sort pipeline for strings', () => {
    const sorted = DatabasePatterns.createSortPipeline(mockData, 'name', 'asc');

    expect(sorted[0].name).toBe('Coffee Beans');
    expect(sorted[1].name).toBe('Coffee Mug');
    expect(sorted[2].name).toBe('Notebook');
    expect(sorted[3].name).toBe('Tea Leaves');
  });

  test('should create sort pipeline for numbers', () => {
    const sorted = DatabasePatterns.createSortPipeline(mockData, 'price', 'desc');

    expect(sorted[0].price).toBe(24.99);
    expect(sorted[1].price).toBe(19.99);
    expect(sorted[2].price).toBe(12.99);
    expect(sorted[3].price).toBe(4.99);
  });

  test('should create sort pipeline for dates', () => {
    const sorted = DatabasePatterns.createSortPipeline(mockData, 'date', 'desc');

    expect(sorted[0].id).toBe(4); // Latest date
    expect(sorted[3].id).toBe(1); // Earliest date
  });

  test('should create search index with n-grams', () => {
    const searchFields = ['name', 'category'];
    const index = DatabasePatterns.createSearchIndex(mockData, searchFields);

    expect(index).toBeInstanceOf(Map);
    expect(index.size).toBeGreaterThan(0);
    
    // Check if 'coffee' ngram exists
    expect(index.has('coffee')).toBe(true);
    expect(index.get('coffee').size).toBeGreaterThan(0);
  });

  test('should search with index effectively', () => {
    const searchFields = ['name', 'category'];
    const index = DatabasePatterns.createSearchIndex(mockData, searchFields);
    
    const results = DatabasePatterns.searchWithIndex(mockData, index, 'coffee');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every(item => 
      item.name.toLowerCase().includes('coffee') || 
      item.category.toLowerCase().includes('coffee')
    )).toBe(true);
  });

  test('should handle empty search queries', () => {
    const searchFields = ['name'];
    const index = DatabasePatterns.createSearchIndex(mockData, searchFields);
    
    const results = DatabasePatterns.searchWithIndex(mockData, index, '');
    expect(results).toEqual(mockData);
  });

  test('should create aggregation pipeline', () => {
    const aggregations = {
      totalPrice: { field: 'price', operation: 'sum' },
      avgPrice: { field: 'price', operation: 'avg' },
      maxPrice: { field: 'price', operation: 'max' },
      minPrice: { field: 'price', operation: 'min' },
      itemCount: { field: 'id', operation: 'count' },
      distinctCategories: { field: 'category', operation: 'distinct' }
    };

    const results = DatabasePatterns.createAggregationPipeline(mockData, aggregations);

    expect(results.totalPrice).toBeCloseTo(62.96, 2);
    expect(results.avgPrice).toBeCloseTo(15.74, 2);
    expect(results.maxPrice).toBe(24.99);
    expect(results.minPrice).toBe(4.99);
    expect(results.itemCount).toBe(4);
    expect(results.distinctCategories).toBe(3);
  });

  test('should create grouped aggregations', () => {
    const aggregations = {
      priceByCategory: { field: 'price', operation: 'sum', groupBy: 'category' }
    };

    const results = DatabasePatterns.createAggregationPipeline(mockData, aggregations);

    expect(results.priceByCategory).toHaveProperty('food');
    expect(results.priceByCategory).toHaveProperty('office');
    expect(results.priceByCategory).toHaveProperty('kitchen');
    expect(results.priceByCategory.food).toBeCloseTo(44.98, 2);
  });

  test('should apply aggregation operations correctly', () => {
    const values = [10, 20, 30, 40, 50];
    
    expect(DatabasePatterns.applyAggregation(values, 'sum')).toBe(150);
    expect(DatabasePatterns.applyAggregation(values, 'avg')).toBe(30);
    expect(DatabasePatterns.applyAggregation(values, 'min')).toBe(10);
    expect(DatabasePatterns.applyAggregation(values, 'max')).toBe(50);
    expect(DatabasePatterns.applyAggregation(values, 'count')).toBe(5);
    expect(DatabasePatterns.applyAggregation([1, 2, 2, 3], 'distinct')).toBe(3);
  });

  test('should handle unknown aggregation operations', () => {
    const values = [1, 2, 3];
    const result = DatabasePatterns.applyAggregation(values, 'unknown');
    expect(result).toEqual(values);
  });
});

/**
 * createOptimizedStore Tests
 */
describe('createOptimizedStore', () => {
  test('should create optimized store with configuration', () => {
    const config = {
      name: 'testStore',
      endpoints: {
        list: {
          fetchFn: vi.fn().mockResolvedValue({ data: [] }),
          options: { cacheTtl: 30000 }
        },
        detail: {
          fetchFn: vi.fn().mockResolvedValue({ data: {} })
        }
      },
      defaultCacheTtl: 60000
    };

    const store = createOptimizedStore(config);

    expect(store).toHaveProperty('queries');
    expect(store).toHaveProperty('cache');
    expect(store).toHaveProperty('optimizer');
    expect(store).toHaveProperty('patterns');
    expect(store.queries).toHaveProperty('list');
    expect(store.queries).toHaveProperty('detail');
    expect(typeof store.queries.list).toBe('function');
    expect(typeof store.queries.detail).toBe('function');
  });

  test('should use custom cache TTL for endpoints', () => {
    const config = {
      name: 'customStore',
      endpoints: {
        fastData: {
          fetchFn: vi.fn(),
          options: { cacheTtl: 10000 }
        }
      },
      defaultCacheTtl: 60000
    };

    const store = createOptimizedStore(config);
    expect(store.queries.fastData).toBeDefined();
  });
});

/**
 * Integration tests
 */
describe('Query Optimization Integration', () => {
  test('should work with global instances', () => {
    expect(queryCache).toBeInstanceOf(QueryCache);
    expect(queryOptimizer).toBeInstanceOf(QueryOptimizer);
  });

  test('should handle real-world optimization scenario', async () => {
    const mockAPI = vi.fn().mockResolvedValue({
      data: mockData,
      pagination: { page: 1, total: 4 }
    });

    const optimizedQuery = queryOptimizer.createOptimizedQuery(
      'products',
      mockAPI,
      {
        cacheTtl: 60000,
        enableDeduplication: true,
        enableDebounce: true,
        enablePrefetch: false
      }
    );

    // First call - should hit API
    const result1 = await optimizedQuery({ search: 'coffee' });
    expect(mockAPI).toHaveBeenCalledTimes(1);

    // Second identical call - should use cache
    mockLRUCache.get.mockReturnValue({
      data: result1,
      timestamp: Date.now()
    });
    
    const result2 = await optimizedQuery({ search: 'coffee' });
    expect(result2).toEqual(result1);
  });

  test('should handle complex filtering and sorting', () => {
    const complexFilters = {
      category: 'food',
      price: { min: 15, max: 25 },
      name: 'coffee'
    };

    let filtered = DatabasePatterns.createFilterPipeline(mockData, complexFilters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Coffee Beans');

    const sorted = DatabasePatterns.createSortPipeline(filtered, 'price', 'desc');
    expect(sorted[0].price).toBe(24.99);
  });

  test('should maintain performance under load', async () => {
    const startTime = performance.now();
    
    // Simulate heavy search operations
    const searchFields = ['name', 'category'];
    const index = DatabasePatterns.createSearchIndex(mockData, searchFields);
    
    const searchPromises = [];
    for (let i = 0; i < 100; i++) {
      searchPromises.push(
        Promise.resolve(DatabasePatterns.searchWithIndex(mockData, index, 'coffee'))
      );
    }
    
    const results = await Promise.all(searchPromises);
    const endTime = performance.now();
    
    expect(results).toHaveLength(100);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
  });
});

/**
 * Error handling tests
 */
describe('Query Optimization Error Handling', () => {
  test('should handle cache errors gracefully', () => {
    mockLRUCache.get.mockImplementation(() => {
      throw new Error('Cache error');
    });

    const cache = new QueryCache();
    expect(() => cache.get('endpoint', {})).toThrow('Cache error');
  });

  test('should handle malformed data in search index', () => {
    const malformedData = [
      { id: 1, name: null },
      { id: 2, category: undefined },
      { id: 3, name: 'valid' }
    ];
    
    const searchFields = ['name', 'category'];
    
    expect(() => {
      DatabasePatterns.createSearchIndex(malformedData, searchFields);
    }).not.toThrow();
  });

  test('should handle empty datasets', () => {
    const emptyData = [];
    
    const filtered = DatabasePatterns.createFilterPipeline(emptyData, { category: 'food' });
    const sorted = DatabasePatterns.createSortPipeline(emptyData, 'name');
    const paginated = DatabasePatterns.createCursorPagination(emptyData, null, 10);
    
    expect(filtered).toEqual([]);
    expect(sorted).toEqual([]);
    expect(paginated.items).toEqual([]);
    expect(paginated.hasNextPage).toBe(false);
  });

  test('should handle null/undefined values in aggregations', () => {
    const dataWithNulls = [
      { id: 1, value: 10 },
      { id: 2, value: null },
      { id: 3, value: undefined },
      { id: 4, value: 20 }
    ];

    const aggregations = {
      total: { field: 'value', operation: 'sum' },
      count: { field: 'value', operation: 'count' }
    };

    const results = DatabasePatterns.createAggregationPipeline(dataWithNulls, aggregations);

    expect(results.total).toBe(30); // Only valid values
    expect(results.count).toBe(2); // Only non-null values counted
  });
});

/**
 * Performance benchmarks
 */
describe('Query Optimization Performance', () => {
  test('should perform search indexing within acceptable time', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      category: `Category ${i % 10}`
    }));

    const startTime = performance.now();
    const index = DatabasePatterns.createSearchIndex(largeDataset, ['name', 'description', 'category']);
    const endTime = performance.now();

    expect(index.size).toBeGreaterThan(0);
    expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
  });

  test('should perform filtering efficiently on large datasets', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      category: i % 2 === 0 ? 'even' : 'odd',
      value: i * 2
    }));

    const startTime = performance.now();
    const filtered = DatabasePatterns.createFilterPipeline(largeDataset, { 
      category: 'even',
      value: { min: 100, max: 200 }
    });
    const endTime = performance.now();

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(item => item.category === 'even')).toBe(true);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
  });

  test('should perform sorting efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Product ${Math.random().toString(36).substring(7)}`,
      value: Math.random() * 1000
    }));

    const startTime = performance.now();
    const sorted = DatabasePatterns.createSortPipeline(largeDataset, 'value', 'desc');
    const endTime = performance.now();

    expect(sorted).toHaveLength(10000);
    expect(sorted[0].value).toBeGreaterThanOrEqual(sorted[1].value);
    expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
  });
});

/**
 * Memory management tests
 */
describe('Query Optimization Memory Management', () => {
  test('should cleanup pending requests on completion', async () => {
    const optimizer = new QueryOptimizer();
    const mockFn = vi.fn().mockResolvedValue('result');
    
    await optimizer.deduplicate(mockFn, 'test-key');
    
    expect(optimizer.pendingRequests.has('test-key')).toBe(false);
  });

  test('should cleanup pending requests on error', async () => {
    const optimizer = new QueryOptimizer();
    const mockFn = vi.fn().mockRejectedValue(new Error('Test error'));
    
    try {
      await optimizer.deduplicate(mockFn, 'error-key');
    } catch (error) {
      // Expected error
    }
    
    expect(optimizer.pendingRequests.has('error-key')).toBe(false);
  });

  test('should cleanup debounce timers', async () => {
    const optimizer = new QueryOptimizer();
    const mockFn = vi.fn().mockResolvedValue('result');
    
    const promise = optimizer.debounce(mockFn, 'debounce-key', 50);
    
    // Wait for debounce to complete
    await new Promise(resolve => setTimeout(resolve, 60));
    await promise;
    
    expect(optimizer.debounceTimers.has('debounce-key')).toBe(false);
  });

  test('should manage prefetch queue correctly', async () => {
    const optimizer = new QueryOptimizer();
    const mockFetchFn = vi.fn().mockResolvedValue({ data: [] });
    
    await optimizer.prefetch(mockFetchFn, 1, 3, 1);
    
    // All prefetch operations should be cleaned up
    expect(optimizer.prefetchQueue.size).toBe(0);
  });
});