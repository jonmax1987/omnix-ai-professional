// CDN configuration and helpers
const CDN_CONFIG = {
  // Configure your CDN base URL
  baseUrl: import.meta.env.VITE_CDN_URL || '',
  
  // Asset domains for different types
  domains: {
    images: import.meta.env.VITE_CDN_IMAGES || import.meta.env.VITE_CDN_URL || '',
    static: import.meta.env.VITE_CDN_STATIC || import.meta.env.VITE_CDN_URL || '',
    fonts: import.meta.env.VITE_CDN_FONTS || import.meta.env.VITE_CDN_URL || ''
  },
  
  // Enable CDN in production
  enabled: import.meta.env.MODE === 'production' && !!import.meta.env.VITE_CDN_URL
};

/**
 * Get CDN URL for an asset
 * @param {string} path - Asset path
 * @param {string} type - Asset type (images, static, fonts)
 * @returns {string} - Complete URL with CDN or local path
 */
export function getCdnUrl(path, type = 'static') {
  if (!CDN_CONFIG.enabled) {
    return path;
  }

  const domain = CDN_CONFIG.domains[type] || CDN_CONFIG.baseUrl;
  
  // Remove leading slash from path
  const cleanPath = path.replace(/^\//, '');
  
  // Combine domain and path
  return `${domain}/${cleanPath}`;
}

/**
 * Get optimized image URL with CDN and responsive variants
 * @param {string} src - Original image source
 * @param {Object} options - Image optimization options
 * @returns {string} - Optimized image URL
 */
export function getOptimizedImageUrl(src, options = {}) {
  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    fit = 'cover'
  } = options;

  if (!CDN_CONFIG.enabled) {
    return src;
  }

  const baseUrl = getCdnUrl(src, 'images');
  const params = new URLSearchParams();

  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality !== 80) params.set('q', quality.toString());
  if (format !== 'auto') params.set('f', format);
  if (fit !== 'cover') params.set('fit', fit);

  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
}

/**
 * Generate srcset for responsive images
 * @param {string} src - Base image source
 * @param {Array} breakpoints - Array of width breakpoints
 * @returns {string} - srcset attribute value
 */
export function generateSrcSet(src, breakpoints = [480, 768, 1024, 1440, 1920]) {
  if (!CDN_CONFIG.enabled) {
    return src;
  }

  const srcsetEntries = breakpoints.map(width => {
    const url = getOptimizedImageUrl(src, { width });
    return `${url} ${width}w`;
  });

  return srcsetEntries.join(', ');
}

/**
 * Preload critical assets
 * @param {Array} assets - Array of asset objects with src and type
 */
export function preloadAssets(assets) {
  assets.forEach(({ src, type = 'image', as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = getCdnUrl(src, type === 'image' ? 'images' : 'static');
    link.as = as || type;
    
    if (type === 'image') {
      link.type = 'image/webp';
      link.media = '(min-width: 768px)'; // Only preload on larger screens
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Lazy load images with CDN optimization
 * @param {HTMLImageElement} img - Image element
 * @param {Object} options - Optimization options
 */
export function lazyLoadImage(img, options = {}) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const src = target.dataset.src;
        
        if (src) {
          target.src = getOptimizedImageUrl(src, options);
          target.classList.add('loaded');
          observer.unobserve(target);
        }
      }
    });
  }, { rootMargin: '50px' });

  observer.observe(img);
  return observer;
}

/**
 * Set up performance hints for CDN resources
 */
export function setupCdnPerformanceHints() {
  if (!CDN_CONFIG.enabled) return;

  // DNS prefetch for CDN domains
  Object.values(CDN_CONFIG.domains).forEach(domain => {
    if (domain && domain !== window.location.origin) {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    }
  });

  // Preconnect to primary CDN
  if (CDN_CONFIG.baseUrl && CDN_CONFIG.baseUrl !== window.location.origin) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = CDN_CONFIG.baseUrl;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

/**
 * Cache busting helper for development
 * @param {string} url - Asset URL
 * @returns {string} - URL with cache buster in development
 */
export function cacheBust(url) {
  if (import.meta.env.DEV) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${Date.now()}`;
  }
  return url;
}

// Initialize CDN performance hints
if (typeof window !== 'undefined') {
  setupCdnPerformanceHints();
}

export default CDN_CONFIG;