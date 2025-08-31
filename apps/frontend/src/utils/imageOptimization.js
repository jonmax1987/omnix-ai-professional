/**
 * Image Optimization Utilities - PERF-002: Image optimization and lazy loading
 * Advanced image processing and optimization utilities
 */

// Image format support detection
export const ImageFormats = {
  WEBP: 'webp',
  AVIF: 'avif',
  JPEG: 'jpeg',
  PNG: 'png',
  SVG: 'svg'
};

class ImageOptimizer {
  constructor() {
    this.supportCache = new Map();
    this.imageCache = new Map();
    this.init();
  }

  async init() {
    // Pre-check format support
    await this.checkFormatSupport();
  }

  /**
   * Check browser support for modern image formats
   */
  async checkFormatSupport() {
    const formats = {
      webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    };

    for (const [format, dataUrl] of Object.entries(formats)) {
      try {
        const supported = await this.testImageFormat(dataUrl);
        this.supportCache.set(format, supported);
      } catch (error) {
        this.supportCache.set(format, false);
      }
    }
  }

  /**
   * Test if an image format is supported
   */
  testImageFormat(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width === 2 && img.height === 2);
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });
  }

  /**
   * Get the best supported image format
   */
  getBestFormat(originalFormat = 'jpeg') {
    if (this.supportCache.get('avif')) return ImageFormats.AVIF;
    if (this.supportCache.get('webp')) return ImageFormats.WEBP;
    return originalFormat;
  }

  /**
   * Generate responsive image sources
   */
  generateResponsiveSources(src, options = {}) {
    const {
      sizes = [400, 800, 1200, 1600, 2000],
      formats = ['avif', 'webp'],
      quality = 80
    } = options;

    if (!src || typeof src !== 'string') {
      return { sources: [], fallback: src };
    }

    // Extract base name and extension
    const lastDot = src.lastIndexOf('.');
    const baseName = lastDot > 0 ? src.substring(0, lastDot) : src;
    const originalExt = lastDot > 0 ? src.substring(lastDot + 1) : 'jpg';

    const sources = [];

    // Generate modern format sources
    formats.forEach(format => {
      if (this.supportCache.get(format)) {
        const srcSet = sizes
          .map(size => `${baseName}_${size}w.${format} ${size}w`)
          .join(', ');
        
        sources.push({
          type: `image/${format}`,
          srcSet,
          sizes: this.generateSizesAttribute(sizes)
        });
      }
    });

    // Generate fallback source
    const fallbackSrcSet = sizes
      .map(size => `${baseName}_${size}w.${originalExt} ${size}w`)
      .join(', ');

    sources.push({
      srcSet: fallbackSrcSet,
      sizes: this.generateSizesAttribute(sizes)
    });

    return {
      sources,
      fallback: src,
      srcSet: fallbackSrcSet
    };
  }

  /**
   * Generate sizes attribute for responsive images
   */
  generateSizesAttribute(breakpoints) {
    // Generate responsive sizes based on common breakpoints
    const sizes = [
      '(max-width: 640px) 100vw',
      '(max-width: 768px) 100vw',
      '(max-width: 1024px) 50vw',
      '(max-width: 1280px) 33vw',
      '25vw'
    ];
    return sizes.join(', ');
  }

  /**
   * Optimize image URL with parameters
   */
  optimizeImageUrl(src, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format,
      fit = 'cover',
      position = 'center',
      blur,
      sharpen,
      auto = ['compress', 'format']
    } = options;

    if (!src) return src;

    // For external CDN services like Cloudinary, Imagekit, etc.
    // This is a generic implementation - adapt based on your CDN
    const params = new URLSearchParams();

    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (quality !== 80) params.append('q', quality);
    if (format) params.append('f', format);
    if (fit !== 'cover') params.append('fit', fit);
    if (position !== 'center') params.append('pos', position);
    if (blur) params.append('blur', blur);
    if (sharpen) params.append('sharp', sharpen);
    if (auto.length > 0) params.append('auto', auto.join(','));

    const queryString = params.toString();
    const separator = src.includes('?') ? '&' : '?';
    
    return queryString ? `${src}${separator}${queryString}` : src;
  }

  /**
   * Generate blur placeholder data URL
   */
  async generateBlurPlaceholder(src, options = {}) {
    const { width = 10, height = 10, quality = 10 } = options;
    
    try {
      // This would typically be handled by your backend or build process
      // For now, return a simple base64 blur placeholder
      return this.createColorPlaceholder('#f0f0f0', width, height);
    } catch (error) {
      console.warn('Failed to generate blur placeholder:', error);
      return this.createColorPlaceholder('#f0f0f0', width, height);
    }
  }

  /**
   * Create a simple color placeholder
   */
  createColorPlaceholder(color = '#f0f0f0', width = 1, height = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  }

  /**
   * Preload critical images
   */
  preloadImages(urls, options = {}) {
    const { priority = false, crossOrigin = 'anonymous' } = options;
    
    return Promise.allSettled(
      urls.map(url => this.preloadImage(url, { priority, crossOrigin }))
    );
  }

  /**
   * Preload a single image
   */
  preloadImage(url, options = {}) {
    const { priority = false, crossOrigin = 'anonymous' } = options;
    
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(url)) {
        resolve(url);
        return;
      }

      const img = new Image();
      
      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }

      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(url);
      };
      
      img.onerror = reject;
      img.src = url;

      // Add priority hint for modern browsers
      if (priority && 'fetchPriority' in img) {
        img.fetchPriority = 'high';
      }
    });
  }

  /**
   * Calculate optimal image dimensions based on container
   */
  calculateOptimalSize(containerWidth, containerHeight, devicePixelRatio = 1) {
    const pixelRatio = Math.min(devicePixelRatio, 2); // Cap at 2x for performance
    
    // Find the closest size from standard breakpoints
    const breakpoints = [400, 800, 1200, 1600, 2000];
    const targetWidth = containerWidth * pixelRatio;
    
    const optimalWidth = breakpoints.find(bp => bp >= targetWidth) || breakpoints[breakpoints.length - 1];
    
    // Calculate height maintaining aspect ratio if needed
    const aspectRatio = containerHeight / containerWidth;
    const optimalHeight = Math.round(optimalWidth * aspectRatio);
    
    return { width: optimalWidth, height: optimalHeight };
  }

  /**
   * Get image loading strategy based on position and importance
   */
  getLoadingStrategy(element, options = {}) {
    const { threshold = 0.1, rootMargin = '50px' } = options;
    
    // Check if image is above the fold
    const rect = element.getBoundingClientRect();
    const isAboveFold = rect.top < window.innerHeight;
    
    if (isAboveFold) {
      return { loading: 'eager', fetchPriority: 'high' };
    }
    
    return { loading: 'lazy', fetchPriority: 'auto' };
  }

  /**
   * Monitor image loading performance
   */
  monitorPerformance(src, startTime) {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Log performance metrics (in production, send to analytics)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'image_load_time', {
        custom_parameter: {
          src,
          load_time: Math.round(loadTime),
          connection: navigator.connection?.effectiveType || 'unknown'
        }
      });
    }
    
    console.debug(`Image loaded in ${Math.round(loadTime)}ms: ${src}`);
  }

  /**
   * Get cache status and statistics
   */
  getCacheStats() {
    return {
      formatSupport: Object.fromEntries(this.supportCache),
      imagesCached: this.imageCache.size,
      cacheSize: this.calculateCacheSize()
    };
  }

  /**
   * Calculate approximate cache size
   */
  calculateCacheSize() {
    // Rough estimation based on cached URLs
    return this.imageCache.size * 50; // Assume average 50KB per cached reference
  }

  /**
   * Clear image cache (useful for memory management)
   */
  clearCache() {
    this.imageCache.clear();
  }
}

// Create singleton instance
export const imageOptimizer = new ImageOptimizer();

// Utility functions for easier usage
export function optimizeImage(src, options = {}) {
  return imageOptimizer.optimizeImageUrl(src, options);
}

export function generateResponsiveImage(src, options = {}) {
  return imageOptimizer.generateResponsiveSources(src, options);
}

export function preloadCriticalImages(urls) {
  return imageOptimizer.preloadImages(urls, { priority: true });
}

export function getBestImageFormat() {
  return imageOptimizer.getBestFormat();
}

// React hook for image optimization
export function useImageOptimization(src, options = {}) {
  const [optimizedSrc, setOptimizedSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setError(null);

    try {
      const optimized = imageOptimizer.optimizeImageUrl(src, options);
      setOptimizedSrc(optimized);
    } catch (err) {
      setError(err);
      setOptimizedSrc(src); // Fallback to original
    } finally {
      setIsLoading(false);
    }
  }, [src, JSON.stringify(options)]);

  return { optimizedSrc, isLoading, error };
}

export default imageOptimizer;