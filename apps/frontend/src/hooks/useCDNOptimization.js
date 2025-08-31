/**
 * CDN Optimization Hook - PERF-007
 * React hook for simplified CDN integration and asset optimization
 * Provides optimized image URLs, preloading capabilities, and performance monitoring
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  assetURLGenerator, 
  lazyLoadingManager, 
  assetPreloader, 
  cdnPerformanceMonitor,
  initializeCDNOptimizations 
} from '../utils/cdnOptimization.js';

/**
 * Main CDN optimization hook
 */
export function useCDNOptimization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initializeCDNOptimizations();
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('[useCDNOptimization] Initialization failed:', error);
        if (mounted) {
          setInitError(error);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isInitialized,
    initError,
    assetURLGenerator,
    lazyLoadingManager,
    assetPreloader,
    cdnPerformanceMonitor
  };
}

/**
 * Hook for optimized image URLs
 */
export function useOptimizedImage(imagePath, options = {}) {
  const [imageURLs, setImageURLs] = useState({
    src: imagePath,
    srcSet: ''
  });
  const [isFormatDetected, setIsFormatDetected] = useState(false);

  const {
    width,
    height,
    quality,
    format,
    responsive = true,
    breakpoints
  } = options;

  // Memoize the generation function to avoid unnecessary recalculations
  const generateURLs = useCallback(() => {
    if (!assetURLGenerator || !isFormatDetected) {
      return { src: imagePath, srcSet: '' };
    }

    const optimizationOptions = {
      width,
      height,
      quality,
      format
    };

    const src = assetURLGenerator.generateImageURL(imagePath, optimizationOptions);
    
    let srcSet = '';
    if (responsive) {
      srcSet = assetURLGenerator.generateResponsiveImageSrcSet(
        imagePath,
        { ...optimizationOptions, breakpoints }
      );
    }

    return { src, srcSet };
  }, [imagePath, width, height, quality, format, responsive, breakpoints, isFormatDetected]);

  // Wait for format detection to complete
  useEffect(() => {
    const checkFormatSupport = async () => {
      if (assetURLGenerator && 
          assetURLGenerator.supportsWebP !== null && 
          assetURLGenerator.supportsAVIF !== null) {
        setIsFormatDetected(true);
      } else {
        // Wait a bit longer for initialization
        setTimeout(() => setIsFormatDetected(true), 1000);
      }
    };

    checkFormatSupport();
  }, []);

  // Generate URLs when format detection is complete or options change
  useEffect(() => {
    const urls = generateURLs();
    setImageURLs(urls);
  }, [generateURLs]);

  return imageURLs;
}

/**
 * Hook for asset preloading
 */
export function useAssetPreloader() {
  const [preloadingAssets, setPreloadingAssets] = useState(new Set());
  const [preloadedAssets, setPreloadedAssets] = useState(new Set());

  const preloadAsset = useCallback(async (asset) => {
    if (preloadedAssets.has(asset.path) || preloadingAssets.has(asset.path)) {
      return;
    }

    setPreloadingAssets(prev => new Set(prev).add(asset.path));

    try {
      await assetPreloader.preloadAsset(asset);
      setPreloadedAssets(prev => new Set(prev).add(asset.path));
    } catch (error) {
      console.warn(`[useAssetPreloader] Failed to preload asset: ${asset.path}`, error);
    } finally {
      setPreloadingAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(asset.path);
        return newSet;
      });
    }
  }, [preloadedAssets, preloadingAssets]);

  const preloadAssets = useCallback(async (assets) => {
    const preloadPromises = assets.map(asset => preloadAsset(asset));
    await Promise.allSettled(preloadPromises);
  }, [preloadAsset]);

  const preloadRouteAssets = useCallback(async (routeName) => {
    setPreloadingAssets(prev => new Set(prev).add(`route-${routeName}`));
    
    try {
      await assetPreloader.preloadRouteAssets(routeName);
      setPreloadedAssets(prev => new Set(prev).add(`route-${routeName}`));
    } catch (error) {
      console.warn(`[useAssetPreloader] Failed to preload route assets: ${routeName}`, error);
    } finally {
      setPreloadingAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(`route-${routeName}`);
        return newSet;
      });
    }
  }, []);

  const isAssetPreloading = useCallback((assetPath) => {
    return preloadingAssets.has(assetPath);
  }, [preloadingAssets]);

  const isAssetPreloaded = useCallback((assetPath) => {
    return preloadedAssets.has(assetPath);
  }, [preloadedAssets]);

  return {
    preloadAsset,
    preloadAssets,
    preloadRouteAssets,
    isAssetPreloading,
    isAssetPreloaded,
    preloadingAssets: Array.from(preloadingAssets),
    preloadedAssets: Array.from(preloadedAssets)
  };
}

/**
 * Hook for CDN performance monitoring
 */
export function useCDNPerformance(refreshInterval = 2000) {
  const [performanceData, setPerformanceData] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const refreshPerformanceData = useCallback(() => {
    if (cdnPerformanceMonitor) {
      const report = cdnPerformanceMonitor.getPerformanceReport();
      setPerformanceData(report);
    }
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    // Initial data fetch
    refreshPerformanceData();

    // Setup interval
    const interval = setInterval(refreshPerformanceData, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval, refreshPerformanceData]);

  const performanceMetrics = useMemo(() => {
    if (!performanceData) return null;

    return {
      cacheHitRate: parseFloat(performanceData.summary.cacheHitRate),
      averageLoadTime: parseFloat(performanceData.summary.averageLoadTime),
      totalRequests: performanceData.summary.totalRequests,
      totalTransferSize: performanceData.summary.totalTransferSize,
      efficiency: performanceData.summary.efficiency,
      imageLoads: performanceData.details.imageLoads,
      slowestImage: performanceData.details.slowestImage,
      recommendations: performanceData.details.recommendations
    };
  }, [performanceData]);

  return {
    performanceData,
    performanceMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshPerformanceData
  };
}

/**
 * Hook for responsive image sizing
 */
export function useResponsiveImage(baseWidth, baseHeight, breakpoints = []) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: baseWidth,
    height: baseHeight
  });

  useEffect(() => {
    if (breakpoints.length === 0) return;

    const updateBreakpoint = () => {
      const viewportWidth = window.innerWidth;
      
      // Find the appropriate breakpoint
      const matchingBreakpoint = breakpoints
        .sort((a, b) => b.width - a.width)
        .find(bp => viewportWidth >= bp.width);

      if (matchingBreakpoint) {
        setCurrentBreakpoint(matchingBreakpoint);
        setImageDimensions({
          width: matchingBreakpoint.imageWidth || baseWidth,
          height: matchingBreakpoint.imageHeight || baseHeight
        });
      }
    };

    // Initial check
    updateBreakpoint();

    // Setup resize listener
    window.addEventListener('resize', updateBreakpoint);
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, [breakpoints, baseWidth, baseHeight]);

  return {
    currentBreakpoint,
    width: imageDimensions.width,
    height: imageDimensions.height,
    aspectRatio: imageDimensions.width / imageDimensions.height
  };
}

/**
 * Hook for image lazy loading with intersection observer
 */
export function useImageLazyLoading(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const {
    threshold = 0.1,
    rootMargin = '200px',
    triggerOnce = true
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without Intersection Observer
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, threshold, rootMargin, triggerOnce]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setError(null);
  }, []);

  const handleError = useCallback((err) => {
    setError(err);
    setIsLoaded(false);
  }, []);

  return {
    isIntersecting,
    isLoaded,
    error,
    handleLoad,
    handleError,
    shouldLoad: isIntersecting
  };
}

/**
 * Hook for connection-aware quality optimization
 */
export function useConnectionAwareQuality() {
  const [connectionSpeed, setConnectionSpeed] = useState('medium');
  const [quality, setQuality] = useState(80);

  useEffect(() => {
    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        
        let speed = 'medium';
        let imageQuality = 80;
        
        switch (effectiveType) {
          case '4g':
            speed = 'fast';
            imageQuality = 95;
            break;
          case '3g':
            speed = 'medium';
            imageQuality = 80;
            break;
          case '2g':
          case 'slow-2g':
            speed = 'slow';
            imageQuality = 60;
            break;
          default:
            speed = 'medium';
            imageQuality = 80;
        }
        
        setConnectionSpeed(speed);
        setQuality(imageQuality);
      }
    };

    // Initial check
    updateConnectionInfo();

    // Listen for connection changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateConnectionInfo);
      
      return () => {
        navigator.connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  return {
    connectionSpeed,
    quality,
    isSlowConnection: connectionSpeed === 'slow',
    isFastConnection: connectionSpeed === 'fast'
  };
}

export default {
  useCDNOptimization,
  useOptimizedImage,
  useAssetPreloader,
  useCDNPerformance,
  useResponsiveImage,
  useImageLazyLoading,
  useConnectionAwareQuality
};