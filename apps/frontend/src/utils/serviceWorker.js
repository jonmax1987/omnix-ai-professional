// Cache configuration for advanced caching strategies
export const CACHE_CONFIG = {
  STATIC: 'omnix-static-v2',
  DYNAMIC: 'omnix-dynamic-v2', 
  IMAGES: 'omnix-images-v2',
  API: 'omnix-api-v2',
  FONTS: 'omnix-fonts-v2',
  VERSION: '2.0.0'
};

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL = {
  STATIC: 7 * 24 * 60 * 60 * 1000,    // 7 days
  DYNAMIC: 24 * 60 * 60 * 1000,       // 24 hours
  IMAGES: 30 * 24 * 60 * 60 * 1000,   // 30 days
  API: 5 * 60 * 1000,                 // 5 minutes
  FONTS: 30 * 24 * 60 * 60 * 1000     // 30 days
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              dispatchEvent(new CustomEvent('sw-update-available', {
                detail: { registration }
              }));
            }
          });
        }
      });

      // Check for updates every 30 minutes
      setInterval(() => {
        registration.update();
      }, 30 * 60 * 1000);

      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        console.log('Service Worker unregistered successfully');
        return true;
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
  return false;
};

export const updateServiceWorker = (registration) => {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
};

export const checkForServiceWorkerUpdate = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    } catch (error) {
      console.error('Service Worker update check failed:', error);
    }
  }
};

export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

export const getServiceWorkerStatus = async () => {
  if (!isServiceWorkerSupported()) {
    return { supported: false, registered: false, active: false };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      supported: true,
      registered: !!registration,
      active: !!registration?.active,
      installing: !!registration?.installing,
      waiting: !!registration?.waiting
    };
  } catch (error) {
    return { supported: true, registered: false, active: false, error };
  }
};

/**
 * Cache management utilities for advanced caching strategies
 */
export class CacheManager {
  static async isExpired(response, ttl) {
    const cachedTimestamp = response.headers.get('sw-cached-at');
    if (!cachedTimestamp) return true;
    
    const cachedTime = parseInt(cachedTimestamp, 10);
    const now = Date.now();
    return (now - cachedTime) > ttl;
  }

  static async addTimestamp(response) {
    const responseClone = response.clone();
    const responseBody = await responseClone.blob();
    
    const newResponse = new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'sw-cached-at': Date.now().toString()
      }
    });
    
    return newResponse;
  }

  static async invalidateCache(cacheName, pattern = null) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const request of keys) {
        if (!pattern || request.url.match(pattern)) {
          await cache.delete(request);
        }
      }
      
      console.log(`Cache ${cacheName} invalidated`);
    } catch (error) {
      console.error(`Failed to invalidate cache ${cacheName}:`, error);
    }
  }

  static async getCache(cacheName) {
    return caches.open(cacheName);
  }

  static async clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  }

  static async getCacheSize(cacheName = null) {
    if (cacheName) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      let totalSize = 0;
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const arrayBuffer = await response.clone().arrayBuffer();
          totalSize += arrayBuffer.byteLength;
        }
      }
      
      return { [cacheName]: totalSize };
    } else {
      const cacheNames = await caches.keys();
      const sizes = {};
      
      for (const name of cacheNames) {
        const result = await this.getCacheSize(name);
        Object.assign(sizes, result);
      }
      
      return sizes;
    }
  }
}

/**
 * Advanced caching strategies
 */
export class CachingStrategies {
  /**
   * Cache First - Try cache first, fallback to network
   * Best for static assets that rarely change
   */
  static async cacheFirst(request, cacheName, ttl = CACHE_TTL.STATIC) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !await CacheManager.isExpired(cachedResponse, ttl)) {
      return cachedResponse;
    }
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const responseWithTimestamp = await CacheManager.addTimestamp(networkResponse);
        await cache.put(request, responseWithTimestamp.clone());
        return responseWithTimestamp;
      }
      
      // Return stale cache if network fails
      return cachedResponse || networkResponse;
    } catch (error) {
      console.error('Network request failed:', error);
      return cachedResponse || new Response('Network error', { status: 503 });
    }
  }

  /**
   * Network First - Try network first, fallback to cache
   * Best for API data that should be fresh
   */
  static async networkFirst(request, cacheName, timeout = 3000, ttl = CACHE_TTL.API) {
    const cache = await caches.open(cacheName);
    
    try {
      const networkPromise = fetch(request);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      );
      
      const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
      
      if (networkResponse.ok) {
        const responseWithTimestamp = await CacheManager.addTimestamp(networkResponse);
        await cache.put(request, responseWithTimestamp.clone());
        return responseWithTimestamp;
      }
    } catch (error) {
      console.warn('Network failed, trying cache:', error.message);
    }
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('No cache available', { status: 503 });
  }

  /**
   * Stale While Revalidate - Return cache immediately, update cache in background
   * Best for frequently accessed resources that can tolerate some staleness
   */
  static async staleWhileRevalidate(request, cacheName, ttl = CACHE_TTL.DYNAMIC) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Start network request in background
    const networkPromise = fetch(request).then(async (response) => {
      if (response.ok) {
        const responseWithTimestamp = await CacheManager.addTimestamp(response);
        await cache.put(request, responseWithTimestamp.clone());
      }
      return response;
    });
    
    // Return cache immediately if available and not expired
    if (cachedResponse && !await CacheManager.isExpired(cachedResponse, ttl)) {
      // Don't wait for network request
      networkPromise.catch(error => console.warn('Background update failed:', error));
      return cachedResponse;
    }
    
    // Wait for network if no cache or expired
    return networkPromise;
  }
}

/**
 * Performance monitoring for service worker
 */
export class ServiceWorkerMetrics {
  static metrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    errors: 0
  };

  static recordCacheHit() {
    this.metrics.cacheHits++;
    this.reportMetrics();
  }

  static recordCacheMiss() {
    this.metrics.cacheMisses++;
    this.reportMetrics();
  }

  static recordNetworkRequest() {
    this.metrics.networkRequests++;
    this.reportMetrics();
  }

  static recordError() {
    this.metrics.errors++;
    this.reportMetrics();
  }

  static reportMetrics() {
    // Throttle metrics reporting
    if (!this.metricsTimer) {
      this.metricsTimer = setTimeout(() => {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SW_METRICS',
            data: { ...this.metrics }
          });
        }
        this.metricsTimer = null;
      }, 5000);
    }
  }

  static getCacheEfficiency() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
  }

  static getMetrics() {
    return {
      ...this.metrics,
      cacheEfficiency: this.getCacheEfficiency()
    };
  }
}