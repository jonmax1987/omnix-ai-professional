/**
 * withImageOptimization HOC - PERF-002: Image optimization and lazy loading
 * Higher-order component for automatic image optimization
 */

import React, { useMemo, forwardRef, createContext, useState, useCallback, useContext } from 'react';
import { imageOptimizer } from '../../utils/imageOptimization';
import { useLazyImage } from '../../hooks/useLazyLoading';

/**
 * Configuration for different image optimization presets
 */
const OPTIMIZATION_PRESETS = {
  // Hero images - high quality, priority loading
  hero: {
    quality: 90,
    priority: true,
    sizes: '100vw',
    breakpoints: [800, 1200, 1600, 2000],
    lazy: false
  },
  
  // Product images - balanced quality and performance
  product: {
    quality: 85,
    priority: false,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    breakpoints: [400, 800, 1200],
    lazy: true
  },
  
  // Avatar/profile images - smaller, optimized for quick loading
  avatar: {
    quality: 80,
    priority: false,
    sizes: '(max-width: 640px) 80px, 120px',
    breakpoints: [80, 160, 240],
    lazy: true
  },
  
  // Gallery thumbnails - lower quality, very fast loading
  thumbnail: {
    quality: 75,
    priority: false,
    sizes: '(max-width: 640px) 25vw, 200px',
    breakpoints: [200, 400],
    lazy: true
  },
  
  // Background images - optimized for coverage
  background: {
    quality: 80,
    priority: false,
    sizes: '100vw',
    breakpoints: [1200, 1600, 2000],
    lazy: true
  },
  
  // Icons and small images - crisp and fast
  icon: {
    quality: 90,
    priority: false,
    sizes: '(max-width: 640px) 24px, 32px',
    breakpoints: [24, 48, 64],
    lazy: true
  }
};

/**
 * Higher-order component that adds image optimization to any component
 */
export function withImageOptimization(WrappedComponent, defaultPreset = 'product') {
  const OptimizedImageComponent = forwardRef((props, ref) => {
    const {
      src,
      preset = defaultPreset,
      optimization = {},
      onLoad,
      onError,
      ...restProps
    } = props;

    // Get optimization settings
    const optimizationSettings = useMemo(() => {
      const presetConfig = OPTIMIZATION_PRESETS[preset] || OPTIMIZATION_PRESETS.product;
      return { ...presetConfig, ...optimization };
    }, [preset, optimization]);

    // Generate optimized image sources
    const optimizedSources = useMemo(() => {
      if (!src) return null;

      return imageOptimizer.generateResponsiveSources(src, {
        sizes: optimizationSettings.breakpoints,
        quality: optimizationSettings.quality
      });
    }, [src, optimizationSettings]);

    // Use lazy loading if enabled
    const lazyImageProps = useLazyImage(src, {
      priority: optimizationSettings.priority,
      sizes: optimizationSettings.sizes,
      quality: optimizationSettings.quality,
      onLoad,
      onError,
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Prepare props for wrapped component
    const enhancedProps = {
      ...restProps,
      src: lazyImageProps.src || src,
      optimizedSources,
      isLoading: lazyImageProps.isLoading,
      isLoaded: lazyImageProps.isLoaded,
      hasError: lazyImageProps.hasError,
      canRetry: lazyImageProps.canRetry,
      retry: lazyImageProps.retry,
      containerRef: lazyImageProps.ref,
      imageRef: lazyImageProps.imageRef,
      sizes: optimizationSettings.sizes,
      loading: optimizationSettings.priority ? 'eager' : 'lazy'
    };

    return <WrappedComponent ref={ref} {...enhancedProps} />;
  });

  OptimizedImageComponent.displayName = `withImageOptimization(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return OptimizedImageComponent;
}

/**
 * Specialized HOC for hero images
 */
export const withHeroImageOptimization = (Component) => 
  withImageOptimization(Component, 'hero');

/**
 * Specialized HOC for product images
 */
export const withProductImageOptimization = (Component) => 
  withImageOptimization(Component, 'product');

/**
 * Specialized HOC for avatar images
 */
export const withAvatarImageOptimization = (Component) => 
  withImageOptimization(Component, 'avatar');

/**
 * Specialized HOC for thumbnail images
 */
export const withThumbnailImageOptimization = (Component) => 
  withImageOptimization(Component, 'thumbnail');

/**
 * Specialized HOC for background images
 */
export const withBackgroundImageOptimization = (Component) => 
  withImageOptimization(Component, 'background');

/**
 * Hook for manual image optimization
 */
export function useImageOptimization(src, preset = 'product', customOptions = {}) {
  const optimizationSettings = useMemo(() => {
    const presetConfig = OPTIMIZATION_PRESETS[preset] || OPTIMIZATION_PRESETS.product;
    return { ...presetConfig, ...customOptions };
  }, [preset, customOptions]);

  const optimizedSources = useMemo(() => {
    if (!src) return null;

    return imageOptimizer.generateResponsiveSources(src, {
      sizes: optimizationSettings.breakpoints,
      quality: optimizationSettings.quality
    });
  }, [src, optimizationSettings]);

  const optimizedUrl = useMemo(() => {
    if (!src) return src;

    return imageOptimizer.optimizeImageUrl(src, {
      quality: optimizationSettings.quality,
      format: imageOptimizer.getBestFormat()
    });
  }, [src, optimizationSettings]);

  return {
    optimizedUrl,
    optimizedSources,
    settings: optimizationSettings
  };
}

/**
 * Component for rendering optimized images with all features
 */
export const OptimizedImage = forwardRef(({
  src,
  alt,
  preset = 'product',
  className,
  style,
  onLoad,
  onError,
  placeholder = 'skeleton',
  showProgress = false,
  retry = true,
  ...props
}, ref) => {
  const {
    containerRef,
    imageRef,
    src: optimizedSrc,
    isLoading,
    isLoaded,
    hasError,
    canRetry,
    retry: retryFn
  } = useLazyImage(src, {
    preset,
    onLoad,
    onError,
    ...props
  });

  const { optimizedSources } = useImageOptimization(src, preset);

  return (
    <div ref={containerRef} className={className} style={style}>
      {optimizedSources?.sources.length > 0 ? (
        <picture>
          {optimizedSources.sources.map((source, index) => (
            <source
              key={index}
              type={source.type}
              srcSet={source.srcSet}
              sizes={source.sizes}
            />
          ))}
          <img
            ref={imageRef}
            src={optimizedSrc || src}
            alt={alt}
            loading={OPTIMIZATION_PRESETS[preset]?.priority ? 'eager' : 'lazy'}
            {...props}
          />
        </picture>
      ) : (
        <img
          ref={imageRef}
          src={optimizedSrc || src}
          alt={alt}
          loading={OPTIMIZATION_PRESETS[preset]?.priority ? 'eager' : 'lazy'}
          {...props}
        />
      )}
      
      {/* Loading state */}
      {isLoading && placeholder && (
        <div className="image-loading-placeholder">
          {/* Loading indicator */}
        </div>
      )}
      
      {/* Error state */}
      {hasError && retry && canRetry && (
        <button onClick={retryFn} className="image-retry-button">
          Retry
        </button>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Context provider for global image optimization settings
 */
export const ImageOptimizationContext = createContext({
  globalSettings: {},
  updateGlobalSettings: () => {}
});

export const ImageOptimizationProvider = ({ children, settings = {} }) => {
  const [globalSettings, setGlobalSettings] = useState(settings);

  const updateGlobalSettings = useCallback((newSettings) => {
    setGlobalSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const contextValue = useMemo(() => ({
    globalSettings,
    updateGlobalSettings
  }), [globalSettings, updateGlobalSettings]);

  return (
    <ImageOptimizationContext.Provider value={contextValue}>
      {children}
    </ImageOptimizationContext.Provider>
  );
};

/**
 * Hook to use global image optimization settings
 */
export function useGlobalImageOptimization() {
  const context = useContext(ImageOptimizationContext);
  if (!context) {
    throw new Error('useGlobalImageOptimization must be used within ImageOptimizationProvider');
  }
  return context;
}

export default withImageOptimization;