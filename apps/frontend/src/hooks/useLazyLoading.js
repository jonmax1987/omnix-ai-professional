/**
 * useLazyLoading Hook - PERF-002: Image optimization and lazy loading
 * Advanced lazy loading hook with intersection observer and performance monitoring
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Global intersection observer instance for performance
let globalObserver = null;
const observedElements = new Map();

/**
 * Create or get global intersection observer
 */
function getGlobalObserver(options = {}) {
  if (globalObserver) return globalObserver;

  const defaultOptions = {
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    rootMargin: '50px 0px',
    ...options
  };

  globalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const callbacks = observedElements.get(entry.target);
      if (callbacks) {
        callbacks.forEach(callback => callback(entry));
      }
    });
  }, defaultOptions);

  return globalObserver;
}

/**
 * Add element to global observer
 */
function observeElement(element, callback) {
  const observer = getGlobalObserver();
  
  if (!observedElements.has(element)) {
    observedElements.set(element, new Set());
    observer.observe(element);
  }
  
  observedElements.get(element).add(callback);
  
  return () => {
    const callbacks = observedElements.get(element);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        observedElements.delete(element);
        observer.unobserve(element);
      }
    }
  };
}

/**
 * Hook for intersection observer with visibility tracking
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    enabled = true
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const handleIntersection = (entry) => {
      const isVisible = entry.intersectionRatio > threshold;
      
      setIsIntersecting(isVisible);
      setIntersectionRatio(entry.intersectionRatio);
      
      if (isVisible && !hasIntersected) {
        setHasIntersected(true);
      }
    };

    const cleanup = observeElement(element, handleIntersection);
    return cleanup;
  }, [threshold, rootMargin, triggerOnce, enabled, hasIntersected]);

  return {
    ref: elementRef,
    isIntersecting,
    intersectionRatio,
    hasIntersected
  };
}

/**
 * Hook for lazy loading with performance monitoring
 */
export function useLazyLoading(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    preload = false,
    onVisible,
    onHidden,
    onLoad,
    onError
  } = options;

  const [loadingState, setLoadingState] = useState('idle'); // 'idle', 'loading', 'loaded', 'error'
  const [startTime, setStartTime] = useState(null);
  const [loadTime, setLoadTime] = useState(null);
  
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce,
    enabled: !preload
  });

  // Determine if should start loading
  const shouldLoad = preload || hasIntersected || isIntersecting;

  // Handle visibility changes
  useEffect(() => {
    if (isIntersecting) {
      onVisible?.();
    } else {
      onHidden?.();
    }
  }, [isIntersecting, onVisible, onHidden]);

  // Load resource when conditions are met
  const load = useCallback(async (resourceLoader) => {
    if (loadingState === 'loading' || loadingState === 'loaded') return;

    setLoadingState('loading');
    setStartTime(performance.now());

    try {
      const result = await resourceLoader();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setLoadTime(duration);
      setLoadingState('loaded');
      onLoad?.(result, duration);
      
      return result;
    } catch (error) {
      setLoadingState('error');
      onError?.(error);
      throw error;
    }
  }, [loadingState, startTime, onLoad, onError]);

  return {
    ref,
    shouldLoad,
    isIntersecting,
    hasIntersected,
    loadingState,
    loadTime,
    load
  };
}

/**
 * Hook for lazy loading images with optimization
 */
export function useLazyImage(src, options = {}) {
  const {
    sizes,
    quality = 80,
    format,
    placeholder,
    blurDataURL,
    priority = false,
    onLoad,
    onError,
    ...lazyOptions
  } = options;

  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageState, setImageState] = useState('idle');
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imageRef = useRef(null);

  const {
    ref: containerRef,
    shouldLoad,
    isIntersecting,
    loadingState,
    load
  } = useLazyLoading({
    preload: priority,
    onLoad: () => onLoad?.(src),
    onError: (error) => onError?.(error),
    ...lazyOptions
  });

  // Load image when should load
  useEffect(() => {
    if (!shouldLoad || !src || imageState === 'loaded') return;

    const loadImage = async () => {
      const img = new Image();
      
      // Set up image attributes
      if (sizes) img.sizes = sizes;
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          setImageSrc(src);
          setImageState('loaded');
          setHasError(false);
          resolve(img);
        };
        
        img.onerror = () => {
          setImageState('error');
          setHasError(true);
          reject(new Error(`Failed to load image: ${src}`));
        };
        
        img.src = src;
      });
    };

    load(loadImage).catch(() => {
      // Error already handled in the load function
    });
  }, [shouldLoad, src, imageState, load, sizes]);

  // Retry failed loads
  const retry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setImageState('idle');
      setHasError(false);
    }
  }, [retryCount]);

  // Update image element when src changes
  useEffect(() => {
    if (imageRef.current && imageSrc) {
      imageRef.current.src = imageSrc;
    }
  }, [imageSrc]);

  return {
    ref: containerRef,
    imageRef,
    src: imageSrc,
    isLoading: loadingState === 'loading',
    isLoaded: imageState === 'loaded',
    hasError,
    shouldLoad,
    isIntersecting,
    retry,
    canRetry: retryCount < 3
  };
}

/**
 * Hook for progressive image loading (low quality -> high quality)
 */
export function useProgressiveImage(lowQualitySrc, highQualitySrc, options = {}) {
  const [currentSrc, setCurrentSrc] = useState('');
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
  
  const {
    ref,
    shouldLoad,
    isIntersecting,
    load
  } = useLazyLoading(options);

  useEffect(() => {
    if (!shouldLoad) return;

    // Load low quality first
    if (lowQualitySrc && !currentSrc) {
      load(async () => {
        const img = new Image();
        return new Promise((resolve) => {
          img.onload = () => {
            setCurrentSrc(lowQualitySrc);
            resolve(img);
          };
          img.onerror = () => resolve(null);
          img.src = lowQualitySrc;
        });
      });
    }

    // Load high quality after
    if (highQualitySrc && !isHighQualityLoaded) {
      const timer = setTimeout(() => {
        load(async () => {
          const img = new Image();
          return new Promise((resolve) => {
            img.onload = () => {
              setCurrentSrc(highQualitySrc);
              setIsHighQualityLoaded(true);
              resolve(img);
            };
            img.onerror = () => resolve(null);
            img.src = highQualitySrc;
          });
        });
      }, 100); // Small delay to prioritize low quality load

      return () => clearTimeout(timer);
    }
  }, [shouldLoad, lowQualitySrc, highQualitySrc, currentSrc, isHighQualityLoaded, load]);

  return {
    ref,
    src: currentSrc,
    isHighQuality: isHighQualityLoaded,
    isIntersecting,
    shouldLoad
  };
}

/**
 * Hook for batch lazy loading multiple resources
 */
export function useBatchLazyLoading(resources, options = {}) {
  const [loadedResources, setLoadedResources] = useState(new Set());
  const [failedResources, setFailedResources] = useState(new Set());
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  
  const {
    ref,
    shouldLoad,
    load
  } = useLazyLoading(options);

  useEffect(() => {
    if (!shouldLoad || resources.length === 0) return;

    const loadBatch = async () => {
      const promises = resources.map(async (resource, index) => {
        try {
          const result = await resource.loader();
          setLoadedResources(prev => new Set(prev).add(resource.id || index));
          return { success: true, resource, result };
        } catch (error) {
          setFailedResources(prev => new Set(prev).add(resource.id || index));
          return { success: false, resource, error };
        }
      });

      const results = await Promise.allSettled(promises);
      const allLoaded = results.every(result => 
        result.status === 'fulfilled' && result.value.success
      );
      
      setIsAllLoaded(allLoaded);
      return results;
    };

    load(loadBatch);
  }, [shouldLoad, resources, load]);

  return {
    ref,
    loadedResources,
    failedResources,
    isAllLoaded,
    loadedCount: loadedResources.size,
    failedCount: failedResources.size,
    totalCount: resources.length,
    shouldLoad
  };
}

/**
 * Hook for performance monitoring of lazy loaded content
 */
export function useLazyLoadingPerformance() {
  const [metrics, setMetrics] = useState({
    totalElements: 0,
    loadedElements: 0,
    failedElements: 0,
    averageLoadTime: 0,
    totalLoadTime: 0
  });

  const addMetric = useCallback((loadTime, success = true) => {
    setMetrics(prev => {
      const newTotal = prev.totalElements + 1;
      const newLoaded = success ? prev.loadedElements + 1 : prev.loadedElements;
      const newFailed = success ? prev.failedElements : prev.failedElements + 1;
      const newTotalLoadTime = prev.totalLoadTime + (loadTime || 0);
      const newAverageLoadTime = newLoaded > 0 ? newTotalLoadTime / newLoaded : 0;

      return {
        totalElements: newTotal,
        loadedElements: newLoaded,
        failedElements: newFailed,
        averageLoadTime: newAverageLoadTime,
        totalLoadTime: newTotalLoadTime
      };
    });
  }, []);

  const reset = useCallback(() => {
    setMetrics({
      totalElements: 0,
      loadedElements: 0,
      failedElements: 0,
      averageLoadTime: 0,
      totalLoadTime: 0
    });
  }, []);

  return {
    metrics,
    addMetric,
    reset
  };
}

export default useLazyLoading;