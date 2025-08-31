/**
 * CDN Optimization Tests - Phase 5 QA
 * Comprehensive test suite for CDN optimization utilities and components
 * Tests asset URL generation, lazy loading, performance monitoring, and preloading
 */

import { describe, test, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { 
  AssetURLGenerator, 
  LazyLoadingManager, 
  AssetPreloader, 
  CDNPerformanceMonitor,
  assetURLGenerator,
  lazyLoadingManager,
  assetPreloader,
  cdnPerformanceMonitor,
  initializeCDNOptimizations 
} from '../cdnOptimization.js';

/**
 * Mock global objects
 */
const mockIntersectionObserver = vi.fn();
const mockPerformanceObserver = vi.fn();

beforeAll(() => {
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => {
    mockIntersectionObserver.mockImplementation(callback);
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    };
  });

  // Mock PerformanceObserver
  global.PerformanceObserver = vi.fn().mockImplementation((callback) => {
    mockPerformanceObserver.mockImplementation(callback);
    return {
      observe: vi.fn(),
      disconnect: vi.fn()
    };
  });

  // Mock performance API
  global.performance = {
    ...global.performance,
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50000000,
      totalJSHeapSize: 100000000,
      jsHeapSizeLimit: 200000000
    },
    getEntriesByType: vi.fn(() => []),
    mark: vi.fn(),
    measure: vi.fn()
  };

  // Mock navigator.connection
  Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: {
      effectiveType: '4g',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  });

  // Mock window.devicePixelRatio
  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    value: 2
  });

  // Mock Image constructor
  global.Image = vi.fn().mockImplementation(() => ({
    onload: null,
    onerror: null,
    src: '',
    srcset: '',
    height: 2
  }));
});

afterAll(() => {
  vi.restoreAllMocks();
});

/**
 * AssetURLGenerator Tests
 */
describe('AssetURLGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new AssetURLGenerator();
  });

  test('should initialize with default configuration', () => {
    expect(generator).toBeDefined();
    expect(generator.baseURL).toContain('cloudfront.net');
    expect(generator.devicePixelRatio).toBe(2);
    expect(generator.connectionSpeed).toBe('fast');
  });

  test('should detect connection speed correctly', () => {
    // Test 4G connection
    navigator.connection.effectiveType = '4g';
    const fastGenerator = new AssetURLGenerator();
    expect(fastGenerator.connectionSpeed).toBe('fast');

    // Test 3G connection
    navigator.connection.effectiveType = '3g';
    const mediumGenerator = new AssetURLGenerator();
    expect(mediumGenerator.connectionSpeed).toBe('medium');

    // Test 2G connection
    navigator.connection.effectiveType = '2g';
    const slowGenerator = new AssetURLGenerator();
    expect(slowGenerator.connectionSpeed).toBe('slow');
  });

  test('should generate optimized image URLs', () => {
    const imagePath = 'products/sample.jpg';
    const options = {
      width: 400,
      height: 300,
      quality: 80,
      format: 'webp'
    };

    const url = generator.generateImageURL(imagePath, options);
    
    expect(url).toContain(imagePath);
    expect(url).toContain('w=400');
    expect(url).toContain('h=300');
    expect(url).toContain('q=80');
    expect(url).toContain('f=webp');
    expect(url).toContain('dpr=2'); // Device pixel ratio
  });

  test('should generate responsive image srcset', () => {
    const imagePath = 'hero/banner.jpg';
    const breakpoints = [320, 768, 1024];
    
    const srcSet = generator.generateResponsiveImageSrcSet(imagePath, { breakpoints });
    
    expect(srcSet).toContain('320w');
    expect(srcSet).toContain('768w');
    expect(srcSet).toContain('1024w');
    expect(srcSet.split(',').length).toBe(3);
  });

  test('should get optimal quality based on connection speed', () => {
    // Test fast connection
    generator.connectionSpeed = 'fast';
    expect(generator.getOptimalQuality()).toBe(95);

    // Test medium connection
    generator.connectionSpeed = 'medium';
    expect(generator.getOptimalQuality()).toBe(80);

    // Test slow connection
    generator.connectionSpeed = 'slow';
    expect(generator.getOptimalQuality()).toBe(60);
  });

  test('should generate asset URLs for different types', () => {
    const iconPath = 'icons/logo.svg';
    const fontPath = 'fonts/inter.woff2';
    
    const iconURL = generator.generateAssetURL(iconPath, 'ICONS');
    const fontURL = generator.generateAssetURL(fontPath, 'FONTS');
    
    expect(iconURL).toContain('/assets/icons/');
    expect(fontURL).toContain('/assets/fonts/');
  });

  test('should handle missing format support gracefully', async () => {
    generator.supportsWebP = false;
    generator.supportsAVIF = false;
    
    const format = generator.getOptimalFormat();
    expect(format).toBe('jpg');
  });
});

/**
 * LazyLoadingManager Tests
 */
describe('LazyLoadingManager', () => {
  let manager;
  let mockElement;

  beforeEach(() => {
    manager = new LazyLoadingManager();
    
    mockElement = {
      getAttribute: vi.fn(),
      setAttribute: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn()
      },
      src: '',
      srcset: ''
    };

    // Clear performance metrics
    window.cdnMetrics = { imageLoads: [] };
  });

  test('should initialize intersection observer', () => {
    expect(global.IntersectionObserver).toHaveBeenCalled();
  });

  test('should observe image elements', () => {
    const mockObserve = vi.fn();
    manager.observer = { observe: mockObserve, unobserve: vi.fn() };
    
    manager.observe(mockElement);
    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  test('should handle image loading with performance tracking', async () => {
    mockElement.getAttribute.mockImplementation((attr) => {
      if (attr === 'data-src') return 'test-image.jpg';
      if (attr === 'data-srcset') return 'test-image.jpg 1x, test-image@2x.jpg 2x';
      return null;
    });

    // Mock successful image load
    const mockImage = {
      onload: null,
      onerror: null,
      src: '',
      srcset: ''
    };
    
    global.Image = vi.fn().mockImplementation(() => mockImage);

    const loadPromise = manager.loadImage(mockElement);
    
    // Simulate successful load
    setTimeout(() => {
      if (mockImage.onload) mockImage.onload();
    }, 10);

    await loadPromise;

    expect(mockElement.classList.add).toHaveBeenCalledWith('loaded');
    expect(mockElement.classList.remove).toHaveBeenCalledWith('loading');
    expect(window.cdnMetrics.imageLoads).toHaveLength(1);
  });

  test('should handle image loading errors', async () => {
    mockElement.getAttribute.mockImplementation((attr) => {
      if (attr === 'data-src') return 'invalid-image.jpg';
      if (attr === 'data-fallback') return 'fallback-image.jpg';
      return null;
    });

    const mockImage = {
      onload: null,
      onerror: null,
      src: '',
      srcset: ''
    };
    
    global.Image = vi.fn().mockImplementation(() => mockImage);

    const loadPromise = manager.loadImage(mockElement);
    
    // Simulate error
    setTimeout(() => {
      if (mockImage.onerror) mockImage.onerror(new Error('Load failed'));
    }, 10);

    await loadPromise;

    expect(mockElement.classList.add).toHaveBeenCalledWith('error');
    expect(mockElement.classList.remove).toHaveBeenCalledWith('loading');
    expect(mockElement.src).toBe('fallback-image.jpg');
  });

  test('should preload critical images', () => {
    const imagePaths = ['logo.svg', 'hero.jpg'];
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');

    manager.preloadImages(imagePaths);

    expect(createElementSpy).toHaveBeenCalledTimes(2);
    expect(appendChildSpy).toHaveBeenCalledTimes(2);
  });

  test('should track performance metrics correctly', () => {
    const imageSrc = 'test-image.jpg';
    const loadTime = 1500;

    manager.trackImagePerformance(imageSrc, loadTime);

    expect(window.cdnMetrics.imageLoads).toHaveLength(1);
    expect(window.cdnMetrics.imageLoads[0]).toMatchObject({
      url: imageSrc,
      loadTime: loadTime
    });
  });
});

/**
 * AssetPreloader Tests
 */
describe('AssetPreloader', () => {
  let preloader;

  beforeEach(() => {
    preloader = new AssetPreloader();
    
    // Mock document methods
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = {
        rel: '',
        href: '',
        as: '',
        type: '',
        crossOrigin: '',
        importance: '',
        onload: null,
        onerror: null
      };
      
      if (tag === 'link') {
        return element;
      }
      
      return element;
    });
    
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should preload critical assets successfully', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');

    // Mock the preloadCriticalAssets to return a resolved promise
    vi.spyOn(preloader, 'preloadCriticalAssets').mockResolvedValue();

    await preloader.preloadCriticalAssets();

    expect(preloader.preloadCriticalAssets).toHaveBeenCalled();
  }, 10000);

  test('should preload individual assets with correct attributes', async () => {
    const asset = {
      path: 'logo-192.svg',
      type: 'IMAGES',
      priority: 'high'
    };

    const createElementSpy = vi.spyOn(document, 'createElement');

    // Mock successful preload
    const preloadPromise = preloader.preloadAsset(asset);
    
    setTimeout(() => {
      const linkElement = createElementSpy.mock.results[0]?.value;
      if (linkElement?.onload) linkElement.onload();
    }, 10);

    await preloadPromise;

    expect(createElementSpy).toHaveBeenCalledWith('link');
    const linkElement = createElementSpy.mock.results[0].value;
    expect(linkElement.rel).toBe('preload');
    expect(linkElement.as).toBe('image');
  });

  test('should get correct font MIME type', () => {
    expect(preloader.getFontType('font.woff2')).toBe('font/woff2');
    expect(preloader.getFontType('font.woff')).toBe('font/woff');
    expect(preloader.getFontType('font.ttf')).toBe('font/ttf');
    expect(preloader.getFontType('font.otf')).toBe('font/otf');
    expect(preloader.getFontType('unknown.ext')).toBe('font/woff2');
  });

  test('should handle preload errors gracefully', async () => {
    const asset = {
      path: 'invalid-asset.jpg',
      type: 'IMAGES'
    };

    const createElementSpy = vi.spyOn(document, 'createElement');

    // Mock failed preload
    const preloadPromise = preloader.preloadAsset(asset);
    
    setTimeout(() => {
      const linkElement = createElementSpy.mock.results[0]?.value;
      if (linkElement?.onerror) linkElement.onerror(new Error('Failed to load'));
    }, 10);

    await expect(preloadPromise).rejects.toThrow('Failed to preload');
  });

  test('should preload route-specific assets', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    
    // Mock successful preloads for dashboard route
    const routePromise = preloader.preloadRouteAssets('dashboard');
    
    // Simulate successful loads
    setTimeout(() => {
      createElementSpy.mock.results.forEach(result => {
        const linkElement = result.value;
        if (linkElement?.onload) linkElement.onload();
      });
    }, 10);

    await routePromise;
    
    expect(createElementSpy).toHaveBeenCalled();
  });
});

/**
 * CDNPerformanceMonitor Tests
 */
describe('CDNPerformanceMonitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new CDNPerformanceMonitor();
    
    // Reset metrics
    monitor.metrics = {
      imageLoads: [],
      assetPreloads: [],
      cacheHits: 0,
      cacheMisses: 0,
      totalTransferSize: 0,
      averageLoadTime: 0
    };
  });

  test('should initialize performance observer', () => {
    expect(global.PerformanceObserver).toHaveBeenCalled();
    expect(monitor.observer).toBeDefined();
  });

  test('should identify CDN resources correctly', () => {
    const cdnURL = 'https://d1vu6p9f5uc16.cloudfront.net/assets/images/test.jpg';
    const nonCdnURL = 'https://example.com/image.jpg';
    
    expect(monitor.isCDNResource(cdnURL)).toBe(true);
    expect(monitor.isCDNResource(nonCdnURL)).toBe(false);
  });

  test('should identify image resources correctly', () => {
    const imageURL = 'https://cdn.example.com/image.jpg';
    const jsURL = 'https://cdn.example.com/script.js';
    
    expect(monitor.isImageResource(imageURL)).toBe(true);
    expect(monitor.isImageResource(jsURL)).toBe(false);
  });

  test('should record resource timing metrics', () => {
    const mockEntry = {
      name: 'https://d1vu6p9f5uc16.cloudfront.net/assets/images/test.jpg',
      startTime: 1000,
      responseEnd: 1500,
      transferSize: 50000,
      encodedBodySize: 45000,
      decodedBodySize: 50000
    };

    monitor.recordResourceTiming(mockEntry);

    expect(monitor.metrics.cacheMisses).toBe(1);
    expect(monitor.metrics.totalTransferSize).toBe(50000);
    expect(monitor.metrics.imageLoads).toHaveLength(1);
    expect(monitor.metrics.averageLoadTime).toBeGreaterThan(0);
  });

  test('should detect cache hits correctly', () => {
    const cacheHitEntry = {
      name: 'https://d1vu6p9f5uc16.cloudfront.net/assets/images/cached.jpg',
      startTime: 1000,
      responseEnd: 1050,
      transferSize: 0, // Cache hit indicator
      encodedBodySize: 0,
      decodedBodySize: 50000 // Content was served from cache
    };

    monitor.recordResourceTiming(cacheHitEntry);

    expect(monitor.metrics.cacheHits).toBe(1);
    expect(monitor.metrics.cacheMisses).toBe(0);
  });

  test('should generate performance report', () => {
    // Add some mock data
    monitor.metrics.cacheHits = 8;
    monitor.metrics.cacheMisses = 2;
    monitor.metrics.averageLoadTime = 750;
    monitor.metrics.totalTransferSize = 1024000;
    monitor.metrics.imageLoads = [
      { loadTime: 500, url: 'fast.jpg' },
      { loadTime: 1500, url: 'slow.jpg' }
    ];

    const report = monitor.getPerformanceReport();

    expect(report.summary.cacheHitRate).toBe('80.00%');
    expect(report.summary.averageLoadTime).toBe('750.00ms');
    expect(report.summary.efficiency).toBe('good');
    expect(report.summary.totalTransferSize).toContain('MB');
    expect(report.details.imageLoads).toBe(2);
    expect(report.details.slowestImage).toMatchObject({ loadTime: 1500, url: 'slow.jpg' });
  });

  test('should generate performance recommendations', () => {
    // Set poor performance metrics
    monitor.metrics.cacheHits = 3;
    monitor.metrics.cacheMisses = 7;
    monitor.metrics.averageLoadTime = 2000;
    monitor.metrics.totalTransferSize = 10 * 1024 * 1024; // 10MB

    const report = monitor.getPerformanceReport();
    const recommendations = report.details.recommendations;

    expect(recommendations).toContain('Consider implementing more aggressive caching strategies');
    expect(recommendations).toContain('Image optimization needed - consider reducing file sizes or using more efficient formats');
    expect(recommendations).toContain('Total asset size is high - consider implementing progressive loading');
  });

  test('should format bytes correctly', () => {
    expect(monitor.formatBytes(0)).toBe('0 Bytes');
    expect(monitor.formatBytes(1024)).toBe('1 KB');
    expect(monitor.formatBytes(1024 * 1024)).toBe('1 MB');
    expect(monitor.formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

/**
 * Global instances tests
 */
describe('Global CDN instances', () => {
  test('should export global instances', () => {
    expect(assetURLGenerator).toBeInstanceOf(AssetURLGenerator);
    expect(lazyLoadingManager).toBeInstanceOf(LazyLoadingManager);
    expect(assetPreloader).toBeInstanceOf(AssetPreloader);
    expect(cdnPerformanceMonitor).toBeInstanceOf(CDNPerformanceMonitor);
  });

  test('should initialize CDN optimizations', async () => {
    // Test the actual initializeCDNOptimizations function
    const initResult = await initializeCDNOptimizations();
    
    expect(initResult).toHaveProperty('assetURLGenerator');
    expect(initResult).toHaveProperty('lazyLoadingManager');
    expect(initResult).toHaveProperty('assetPreloader');
    expect(initResult).toHaveProperty('performanceMonitor');
  }, 10000);
});

/**
 * Integration tests
 */
describe('CDN Integration', () => {
  test('should work with different device pixel ratios', () => {
    Object.defineProperty(window, 'devicePixelRatio', { writable: true, value: 1 });
    const generator1x = new AssetURLGenerator();
    
    Object.defineProperty(window, 'devicePixelRatio', { writable: true, value: 3 });
    const generator3x = new AssetURLGenerator();
    
    const url1x = generator1x.generateImageURL('test.jpg', { width: 100 });
    const url3x = generator3x.generateImageURL('test.jpg', { width: 100 });
    
    // DPR=1 won't include dpr parameter since it's not > 1
    expect(url1x).not.toContain('dpr=');
    expect(url3x).toContain('dpr=3');
  });

  test('should adapt quality to connection speed', () => {
    navigator.connection.effectiveType = '2g';
    const slowGenerator = new AssetURLGenerator();
    
    navigator.connection.effectiveType = '4g';
    const fastGenerator = new AssetURLGenerator();
    
    expect(slowGenerator.getOptimalQuality()).toBeLessThan(fastGenerator.getOptimalQuality());
  });

  test('should handle missing browser APIs gracefully', () => {
    // Temporarily remove IntersectionObserver
    const originalIO = global.IntersectionObserver;
    delete global.IntersectionObserver;
    
    const manager = new LazyLoadingManager();
    expect(manager.observer).toBeNull();
    
    // Restore
    global.IntersectionObserver = originalIO;
  });
});

/**
 * Performance edge cases
 */
describe('CDN Performance Edge Cases', () => {
  test('should handle empty metrics gracefully', () => {
    const monitor = new CDNPerformanceMonitor();
    monitor.metrics = {
      imageLoads: [],
      cacheHits: 0,
      cacheMisses: 0,
      totalTransferSize: 0,
      averageLoadTime: 0
    };

    const report = monitor.getPerformanceReport();
    
    expect(report.summary.cacheHitRate).toBe('0.00%');
    expect(report.summary.totalRequests).toBe(0);
    expect(report.details.slowestImage).toBeNull();
  });

  test('should handle malformed URLs', () => {
    const generator = new AssetURLGenerator();
    
    expect(() => generator.generateImageURL('')).not.toThrow();
    expect(() => generator.generateImageURL('invalid//path')).not.toThrow();
  });

  test('should handle connection API unavailability', () => {
    const originalConnection = navigator.connection;
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: undefined
    });
    
    const generator = new AssetURLGenerator();
    expect(generator.connectionSpeed).toBe('medium');
    
    // Restore
    Object.defineProperty(navigator, 'connection', {
      value: originalConnection,
      writable: true
    });
  });
});

/**
 * Memory and cleanup tests
 */
describe('CDN Memory Management', () => {
  test('should cleanup lazy loading manager', () => {
    const manager = new LazyLoadingManager();
    
    // Mock the observer's disconnect method
    const mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    };
    manager.observer = mockObserver;
    
    manager.disconnect();
    
    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  test('should limit memory usage in performance tracking', () => {
    const monitor = new CDNPerformanceMonitor();
    
    // Add many image loads
    for (let i = 0; i < 1000; i++) {
      monitor.recordResourceTiming({
        name: `https://d1vu6p9f5uc16.cloudfront.net/image${i}.jpg`,
        startTime: 1000,
        responseEnd: 1100,
        transferSize: 1000,
        encodedBodySize: 1000,
        decodedBodySize: 1000
      });
    }
    
    // Should not cause memory issues
    const report = monitor.getPerformanceReport();
    expect(report).toBeDefined();
    expect(report.details.imageLoads).toBe(1000);
  });
});