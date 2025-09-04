/**
 * Cache-Busting Utility for OMNIX AI
 * 
 * This utility helps resolve browser cache issues by:
 * 1. Force-clearing service worker cache
 * 2. Adding cache-busting parameters to requests
 * 3. Detecting and fixing React AsyncMode errors from old bundles
 */

const CACHE_BUSTER_VERSION = '2025-09-04-v2';
const CACHE_KEY = 'omnix-cache-version';

class CacheBuster {
  constructor() {
    this.initializeCacheBuster();
  }

  /**
   * Initialize cache busting system
   */
  initializeCacheBuster() {
    const currentVersion = localStorage.getItem(CACHE_KEY);
    
    // If version mismatch or not set, force cache clear
    if (currentVersion !== CACHE_BUSTER_VERSION) {
      this.forceCacheClear();
      localStorage.setItem(CACHE_KEY, CACHE_BUSTER_VERSION);
    }

    // Setup React AsyncMode protection
    this.setupAsyncModeProtection();

    // Setup resource error handlers
    this.setupErrorHandlers();
  }

  /**
   * Force clear all caches
   */
  async forceCacheClear() {
    try {
      // Clear service worker caches
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // Clear Cache API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear localStorage (except our cache version)
      const cacheVersion = localStorage.getItem(CACHE_KEY);
      localStorage.clear();
      localStorage.setItem(CACHE_KEY, cacheVersion);

      // Clear sessionStorage
      sessionStorage.clear();

      console.log('[CacheBuster] Successfully cleared all caches');
    } catch (error) {
      console.error('[CacheBuster] Error clearing caches:', error);
    }
  }

  /**
   * Setup React AsyncMode protection to prevent old bundle errors
   */
  setupAsyncModeProtection() {
    // Ensure React has AsyncMode property to prevent errors
    if (typeof window !== 'undefined' && window.React) {
      try {
        // Create a safe AsyncMode property if it doesn't exist
        if (!window.React.AsyncMode) {
          Object.defineProperty(window.React, 'AsyncMode', {
            value: null,
            writable: false,
            configurable: false,
            enumerable: false
          });
        }

        // Also protect against direct assignment attempts
        const originalReact = window.React;
        window.React = new Proxy(originalReact, {
          set(target, property, value) {
            if (property === 'AsyncMode') {
              console.warn('[CacheBuster] Prevented AsyncMode assignment from legacy bundle');
              return true; // Prevent the assignment but don't throw
            }
            return Reflect.set(target, property, value);
          }
        });

        console.log('[CacheBuster] React AsyncMode protection enabled');
      } catch (error) {
        console.warn('[CacheBuster] Could not setup AsyncMode protection:', error);
      }
    }
  }

  /**
   * Setup error handlers for resource loading failures
   */
  setupErrorHandlers() {
    // Handle script loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target.tagName === 'SCRIPT') {
        console.warn('[CacheBuster] Script loading error detected:', event.target.src);
        
        // If it's a vendor bundle error, try reloading with cache buster
        if (event.target.src.includes('vendor-react') || event.target.src.includes('vendor-misc')) {
          this.reloadWithCacheBuster(event.target.src);
        }
      }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && typeof event.reason.message === 'string') {
        const message = event.reason.message;
        
        // Check for AsyncMode related errors
        if (message.includes('AsyncMode') || message.includes('Cannot set properties of undefined')) {
          console.warn('[CacheBuster] AsyncMode error detected, clearing caches and reloading');
          this.forceCacheClear().then(() => {
            window.location.reload();
          });
        }
      }
    });
  }

  /**
   * Reload a resource with cache busting parameters
   */
  reloadWithCacheBuster(originalSrc) {
    try {
      const url = new URL(originalSrc);
      url.searchParams.set('cb', Date.now());
      url.searchParams.set('v', CACHE_BUSTER_VERSION);
      
      const newScript = document.createElement('script');
      newScript.src = url.toString();
      newScript.async = true;
      
      document.head.appendChild(newScript);
      console.log('[CacheBuster] Reloaded resource with cache buster:', newScript.src);
    } catch (error) {
      console.error('[CacheBuster] Error reloading resource:', error);
    }
  }

  /**
   * Add cache busting parameters to URLs
   */
  addCacheBuster(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.set('cb', Date.now());
      urlObj.searchParams.set('v', CACHE_BUSTER_VERSION);
      return urlObj.toString();
    } catch (error) {
      console.warn('[CacheBuster] Error adding cache buster to URL:', url, error);
      return url;
    }
  }

  /**
   * Check if current bundles are up to date
   */
  checkBundleVersions() {
    const scripts = document.querySelectorAll('script[src*="vendor-react"], script[src*="vendor-misc"]');
    const expectedHashes = {
      'vendor-react': 'CSueKD2d',
      'vendor-misc': 'DpN5rgRz'
    };

    for (const script of scripts) {
      const src = script.src;
      for (const [bundleName, expectedHash] of Object.entries(expectedHashes)) {
        if (src.includes(bundleName) && !src.includes(expectedHash)) {
          console.warn(`[CacheBuster] Outdated bundle detected: ${src}`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Force reload page with cache clearing
   */
  forceReload() {
    this.forceCacheClear().then(() => {
      // Use location.reload with forceGet flag
      window.location.reload(true);
    });
  }
}

// Create global instance
const cacheBuster = new CacheBuster();

// Export for use in other modules
export default cacheBuster;

// Also make available globally for debugging
if (typeof window !== 'undefined') {
  window.omnixCacheBuster = cacheBuster;
}