/**
 * CDN Optimization Utilities - PERF-007
 * Advanced CDN integration for static assets with intelligent caching and optimization
 * Provides asset optimization, lazy loading, and performance monitoring for OMNIX AI
 */

/**
 * CDN Configuration
 */
const CDN_CONFIG = {
  // Primary CDN (CloudFront)
  PRIMARY_CDN: 'https://d1vu6p9f5uc16.cloudfront.net',
  
  // Asset optimization settings
  ASSET_DOMAINS: {
    IMAGES: 'https://d1vu6p9f5uc16.cloudfront.net/assets/images',
    ICONS: 'https://d1vu6p9f5uc16.cloudfront.net/assets/icons',
    FONTS: 'https://d1vu6p9f5uc16.cloudfront.net/assets/fonts',
    VIDEOS: 'https://d1vu6p9f5uc16.cloudfront.net/assets/videos',
    DOCUMENTS: 'https://d1vu6p9f5uc16.cloudfront.net/assets/documents'
  },
  
  // Image optimization parameters
  IMAGE_OPTIMIZATION: {
    QUALITIES: {
      low: 60,
      medium: 80,
      high: 95
    },
    FORMATS: ['webp', 'avif', 'jpg', 'png'],
    RESPONSIVE_BREAKPOINTS: [320, 480, 768, 1024, 1200, 1920],
    LAZY_LOAD_THRESHOLD: 0.1
  },
  
  // Caching strategies
  CACHE_STRATEGIES: {
    IMMUTABLE: 'max-age=31536000, immutable', // 1 year
    VERSIONED: 'max-age=31536000', // 1 year for versioned assets
    SHORT_TERM: 'max-age=3600', // 1 hour
    NO_CACHE: 'no-cache, no-store, must-revalidate'
  },
  
  // Performance thresholds
  PERFORMANCE: {
    MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
    MAX_BUNDLE_SIZE: 5 * 1024 * 1024, // 5MB
    CRITICAL_RESOURCE_TIMEOUT: 3000, // 3 seconds
    PRELOAD_VIEWPORT_MARGIN: 200 // pixels
  }
};

/**
 * Asset URL Generator
 */
export class AssetURLGenerator {
  constructor() {
    this.baseURL = CDN_CONFIG.PRIMARY_CDN;
    this.supportsWebP = null;
    this.supportsAVIF = null;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.connectionSpeed = this.detectConnectionSpeed();
    
    this.initializeFormatSupport();
  }

  /**
   * Initialize format support detection
   */
  async initializeFormatSupport() {
    this.supportsWebP = await this.checkWebPSupport();
    this.supportsAVIF = await this.checkAVIFSupport();
  }

  /**
   * Check WebP support
   */
  checkWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Check AVIF support
   */
  checkAVIFSupport() {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
    });
  }

  /**
   * Detect connection speed
   */
  detectConnectionSpeed() {
    if (navigator.connection) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case '4g':
          return 'fast';
        case '3g':
          return 'medium';
        default:
          return 'slow';
      }
    }
    
    return 'medium'; // Default assumption
  }

  /**
   * Generate optimized image URL
   */
  generateImageURL(imagePath, options = {}) {
    const {
      width,
      height,
      quality = this.getOptimalQuality(),
      format = this.getOptimalFormat(),
      resize = 'fit',
      background = 'transparent'
    } = options;

    // Build base URL
    let url = `${CDN_CONFIG.ASSET_DOMAINS.IMAGES}/${imagePath}`;
    
    // Add optimization parameters
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    if (format) params.append('f', format);
    if (resize) params.append('fit', resize);
    if (background) params.append('bg', background);

    // Add device pixel ratio for high-DPI displays
    if (this.devicePixelRatio > 1) {
      params.append('dpr', this.devicePixelRatio.toString());
    }

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Get optimal image quality based on connection speed
   */
  getOptimalQuality() {
    const { QUALITIES } = CDN_CONFIG.IMAGE_OPTIMIZATION;
    
    switch (this.connectionSpeed) {
      case 'slow':
        return QUALITIES.low;
      case 'medium':
        return QUALITIES.medium;
      case 'fast':
      default:
        return QUALITIES.high;
    }
  }

  /**
   * Get optimal image format based on browser support
   */
  getOptimalFormat() {
    if (this.supportsAVIF) return 'avif';
    if (this.supportsWebP) return 'webp';
    return 'jpg';
  }

  /**
   * Generate responsive image srcset
   */
  generateResponsiveImageSrcSet(imagePath, options = {}) {
    const { breakpoints = CDN_CONFIG.IMAGE_OPTIMIZATION.RESPONSIVE_BREAKPOINTS } = options;
    
    return breakpoints
      .map(width => {
        const url = this.generateImageURL(imagePath, { ...options, width });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Generate asset URL for other types
   */
  generateAssetURL(assetPath, type = 'IMAGES') {
    const domain = CDN_CONFIG.ASSET_DOMAINS[type];
    return `${domain}/${assetPath}`;
  }
}

/**
 * Lazy Loading Manager
 */
export class LazyLoadingManager {
  constructor() {
    this.observer = null;
    this.loadedImages = new Set();
    this.loadingImages = new Set();
    this.initializeObserver();
  }

  /**
   * Initialize Intersection Observer
   */
  initializeObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('[CDN] IntersectionObserver not supported, falling back to immediate loading');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.loadedImages.has(entry.target)) {
            this.loadImage(entry.target);
          }
        });
      },
      {
        threshold: CDN_CONFIG.IMAGE_OPTIMIZATION.LAZY_LOAD_THRESHOLD,
        rootMargin: `${CDN_CONFIG.PERFORMANCE.PRELOAD_VIEWPORT_MARGIN}px`
      }
    );
  }

  /**
   * Add image to lazy loading queue
   */
  observe(imageElement) {
    if (!this.observer) {
      // Fallback: load immediately
      this.loadImage(imageElement);
      return;
    }

    this.observer.observe(imageElement);
  }

  /**
   * Load image with error handling and performance monitoring
   */
  async loadImage(imageElement) {
    if (this.loadingImages.has(imageElement) || this.loadedImages.has(imageElement)) {
      return;
    }

    this.loadingImages.add(imageElement);
    
    const startTime = performance.now();
    const dataSrc = imageElement.getAttribute('data-src');
    const dataSrcset = imageElement.getAttribute('data-srcset');

    try {
      // Create new image for preloading
      const img = new Image();
      
      // Set up promise for loading
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        
        // Timeout fallback
        setTimeout(() => {
          reject(new Error('Image load timeout'));
        }, CDN_CONFIG.PERFORMANCE.CRITICAL_RESOURCE_TIMEOUT);
      });

      // Start loading
      if (dataSrcset) img.srcset = dataSrcset;
      if (dataSrc) img.src = dataSrc;

      await loadPromise;

      // Update actual image element
      if (dataSrcset) imageElement.srcset = dataSrcset;
      if (dataSrc) imageElement.src = dataSrc;

      // Add loaded class for CSS transitions
      imageElement.classList.add('loaded');
      imageElement.classList.remove('loading');

      // Track performance
      const loadTime = performance.now() - startTime;
      this.trackImagePerformance(dataSrc || dataSrcset, loadTime);

      this.loadedImages.add(imageElement);
      
      // Stop observing this element
      if (this.observer) {
        this.observer.unobserve(imageElement);
      }

    } catch (error) {
      console.error('[CDN] Failed to load image:', dataSrc, error);
      
      // Add error class for fallback styling
      imageElement.classList.add('error');
      imageElement.classList.remove('loading');
      
      // Set fallback image if available
      const fallback = imageElement.getAttribute('data-fallback');
      if (fallback) {
        imageElement.src = fallback;
      }
    } finally {
      this.loadingImages.delete(imageElement);
    }
  }

  /**
   * Track image loading performance
   */
  trackImagePerformance(imageSrc, loadTime) {
    if (loadTime > CDN_CONFIG.PERFORMANCE.CRITICAL_RESOURCE_TIMEOUT) {
      console.warn(`[CDN] Slow image load detected: ${imageSrc} took ${loadTime.toFixed(2)}ms`);
    }

    // Store metrics for performance monitoring
    if (!window.cdnMetrics) {
      window.cdnMetrics = { imageLoads: [] };
    }
    
    window.cdnMetrics.imageLoads.push({
      url: imageSrc,
      loadTime,
      timestamp: Date.now()
    });
  }

  /**
   * Preload critical images
   */
  preloadImages(imagePaths) {
    imagePaths.forEach(path => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = path;
      document.head.appendChild(link);
    });
  }

  /**
   * Cleanup observer
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Asset Preloader
 */
export class AssetPreloader {
  constructor() {
    this.preloadQueue = new Map();
    this.preloadedAssets = new Set();
    this.urlGenerator = new AssetURLGenerator();
  }

  /**
   * Preload critical assets
   */
  async preloadCriticalAssets() {
    const criticalAssets = [
      // Critical images
      { path: 'logo-192.svg', type: 'ICONS' },
      { path: 'logo-512.svg', type: 'ICONS' },
      
      // Critical fonts (if not using Google Fonts)
      // { path: 'inter-variable.woff2', type: 'FONTS' },
      
      // Hero images or above-the-fold content
      { path: 'hero-bg.webp', type: 'IMAGES', optional: true }
    ];

    const preloadPromises = criticalAssets.map(asset => 
      this.preloadAsset(asset).catch(error => {
        if (!asset.optional) {
          console.error(`[CDN] Failed to preload critical asset: ${asset.path}`, error);
        }
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Preload individual asset
   */
  async preloadAsset(asset) {
    const { path, type = 'IMAGES', priority = 'low' } = asset;
    const url = this.urlGenerator.generateAssetURL(path, type);

    if (this.preloadedAssets.has(url)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      // Set appropriate 'as' attribute
      switch (type) {
        case 'IMAGES':
          link.as = 'image';
          break;
        case 'FONTS':
          link.as = 'font';
          link.type = this.getFontType(path);
          link.crossOrigin = 'anonymous';
          break;
        case 'VIDEOS':
          link.as = 'video';
          break;
        default:
          link.as = 'fetch';
      }

      // Set priority for supporting browsers
      if ('importance' in link) {
        link.importance = priority;
      }

      link.onload = () => {
        this.preloadedAssets.add(url);
        resolve(url);
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to preload: ${url}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * Get font MIME type
   */
  getFontType(fontPath) {
    if (fontPath.endsWith('.woff2')) return 'font/woff2';
    if (fontPath.endsWith('.woff')) return 'font/woff';
    if (fontPath.endsWith('.ttf')) return 'font/ttf';
    if (fontPath.endsWith('.otf')) return 'font/otf';
    return 'font/woff2'; // Default
  }

  /**
   * Preload route-specific assets
   */
  async preloadRouteAssets(routeName) {
    const routeAssets = {
      dashboard: [
        { path: 'chart-icons.svg', type: 'ICONS' },
        { path: 'dashboard-bg.webp', type: 'IMAGES', optional: true }
      ],
      products: [
        { path: 'product-placeholder.webp', type: 'IMAGES' }
      ],
      analytics: [
        { path: 'analytics-icons.svg', type: 'ICONS' },
        { path: 'chart-patterns.webp', type: 'IMAGES', optional: true }
      ]
    };

    const assets = routeAssets[routeName] || [];
    
    const preloadPromises = assets.map(asset => 
      this.preloadAsset(asset).catch(error => {
        if (!asset.optional) {
          console.warn(`[CDN] Failed to preload route asset for ${routeName}:`, asset.path, error);
        }
      })
    );

    await Promise.allSettled(preloadPromises);
  }
}

/**
 * Performance Monitor
 */
export class CDNPerformanceMonitor {
  constructor() {
    this.metrics = {
      imageLoads: [],
      assetPreloads: [],
      cacheHits: 0,
      cacheMisses: 0,
      totalTransferSize: 0,
      averageLoadTime: 0
    };
    
    this.initializePerformanceObserver();
  }

  /**
   * Initialize Performance Observer for CDN assets
   */
  initializePerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      console.warn('[CDN] PerformanceObserver not supported');
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (this.isCDNResource(entry.name)) {
            this.recordResourceTiming(entry);
          }
        });
      });

      this.observer = observer;
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('[CDN] Failed to initialize PerformanceObserver:', error);
    }
  }

  /**
   * Check if resource is from CDN
   */
  isCDNResource(url) {
    return url.includes(CDN_CONFIG.PRIMARY_CDN) || 
           Object.values(CDN_CONFIG.ASSET_DOMAINS).some(domain => url.includes(domain));
  }

  /**
   * Record resource timing metrics
   */
  recordResourceTiming(entry) {
    const timing = {
      url: entry.name,
      loadTime: entry.responseEnd - entry.startTime,
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
      cacheHit: entry.transferSize === 0 && entry.decodedBodySize > 0,
      timestamp: entry.startTime
    };

    // Update metrics
    if (timing.cacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    this.metrics.totalTransferSize += timing.transferSize;
    
    // Categorize by resource type
    if (this.isImageResource(entry.name)) {
      this.metrics.imageLoads.push(timing);
    }

    // Calculate running average load time
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (totalRequests > 0) {
      this.metrics.averageLoadTime = 
        (this.metrics.averageLoadTime * (totalRequests - 1) + timing.loadTime) / totalRequests;
    }
  }

  /**
   * Check if resource is an image
   */
  isImageResource(url) {
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(url) ||
           url.includes(CDN_CONFIG.ASSET_DOMAINS.IMAGES);
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = totalRequests > 0 ? (this.metrics.cacheHits / totalRequests) * 100 : 0;

    return {
      summary: {
        totalRequests,
        cacheHitRate: cacheHitRate.toFixed(2) + '%',
        averageLoadTime: this.metrics.averageLoadTime.toFixed(2) + 'ms',
        totalTransferSize: this.formatBytes(this.metrics.totalTransferSize),
        efficiency: cacheHitRate > 80 ? 'excellent' : cacheHitRate > 60 ? 'good' : 'needs-improvement'
      },
      details: {
        imageLoads: this.metrics.imageLoads.length,
        slowestImage: this.getSlowestResource(this.metrics.imageLoads),
        recommendations: this.generateRecommendations(cacheHitRate, this.metrics.averageLoadTime)
      }
    };
  }

  /**
   * Get slowest loading resource
   */
  getSlowestResource(resources) {
    if (resources.length === 0) return null;
    
    return resources.reduce((slowest, current) => 
      current.loadTime > slowest.loadTime ? current : slowest
    );
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(cacheHitRate, averageLoadTime) {
    const recommendations = [];

    if (cacheHitRate < 60) {
      recommendations.push('Consider implementing more aggressive caching strategies');
    }

    if (averageLoadTime > 1000) {
      recommendations.push('Image optimization needed - consider reducing file sizes or using more efficient formats');
    }

    if (this.metrics.totalTransferSize > CDN_CONFIG.PERFORMANCE.MAX_BUNDLE_SIZE) {
      recommendations.push('Total asset size is high - consider implementing progressive loading');
    }

    return recommendations;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Global CDN service instances
 */
export const assetURLGenerator = new AssetURLGenerator();
export const lazyLoadingManager = new LazyLoadingManager();
export const assetPreloader = new AssetPreloader();
export const cdnPerformanceMonitor = new CDNPerformanceMonitor();

/**
 * Initialize CDN optimizations
 */
export async function initializeCDNOptimizations() {
  try {
    console.log('[CDN] Initializing CDN optimizations...');
    
    // Preload critical assets
    await assetPreloader.preloadCriticalAssets();
    
    // Initialize format support detection
    await assetURLGenerator.initializeFormatSupport();
    
    console.log('[CDN] CDN optimizations initialized successfully');
    
    return {
      assetURLGenerator,
      lazyLoadingManager,
      assetPreloader,
      performanceMonitor: cdnPerformanceMonitor
    };
  } catch (error) {
    console.error('[CDN] Failed to initialize CDN optimizations:', error);
    throw error;
  }
}

export default {
  AssetURLGenerator,
  LazyLoadingManager,
  AssetPreloader,
  CDNPerformanceMonitor,
  assetURLGenerator,
  lazyLoadingManager,
  assetPreloader,
  cdnPerformanceMonitor,
  initializeCDNOptimizations
};