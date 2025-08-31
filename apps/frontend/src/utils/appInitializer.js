/**
 * Application Initializer - PERF Integration
 * Centralized initialization system for all performance optimizations
 * Coordinates CDN optimization, store initialization, and service worker setup
 */

import { initializeCDNOptimizations } from './cdnOptimization.js';
import { initializeAllStores } from './storeInitializer.js';
import { optimizedDataService } from '../services/optimizedDataService.js';

/**
 * Application initialization configuration
 */
const APP_INIT_CONFIG = {
  TIMEOUT: 15000, // 15 seconds total timeout
  CRITICAL_FEATURES: ['cdn', 'stores'], // Features that must succeed
  OPTIONAL_FEATURES: ['serviceWorker', 'analytics'], // Features that can fail gracefully
  LOG_LEVEL: import.meta.env?.MODE === 'development' ? 'debug' : 'info'
};

/**
 * Application Initializer Class
 */
class ApplicationInitializer {
  constructor() {
    this.initializationResults = new Map();
    this.startTime = null;
    this.listeners = new Set();
  }

  /**
   * Log messages with appropriate level
   */
  log(level, message, data = null) {
    if (level === 'debug' && APP_INIT_CONFIG.LOG_LEVEL !== 'debug') return;
    
    const prefix = '[AppInitializer]';
    const timestamp = new Date().toISOString();
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ERROR [${timestamp}]:`, message, data);
        break;
      case 'warn':
        console.warn(`${prefix} WARN [${timestamp}]:`, message, data);
        break;
      case 'info':
        console.log(`${prefix} INFO [${timestamp}]:`, message, data);
        break;
      case 'debug':
        console.debug(`${prefix} DEBUG [${timestamp}]:`, message, data);
        break;
    }
  }

  /**
   * Add event listener for initialization events
   */
  addEventListener(event, callback) {
    this.listeners.add({ event, callback });
  }

  /**
   * Emit initialization events
   */
  emit(event, data) {
    this.listeners.forEach(({ event: listenerEvent, callback }) => {
      if (listenerEvent === event) {
        try {
          callback(data);
        } catch (error) {
          this.log('error', `Event listener error for ${event}:`, error);
        }
      }
    });
  }

  /**
   * Initialize CDN optimizations
   */
  async initializeCDN() {
    this.log('debug', 'Initializing CDN optimizations...');
    
    try {
      const cdnServices = await initializeCDNOptimizations();
      this.initializationResults.set('cdn', { success: true, services: cdnServices });
      this.log('info', 'CDN optimizations initialized successfully');
      this.emit('cdn:ready', cdnServices);
      return true;
    } catch (error) {
      this.log('error', 'Failed to initialize CDN optimizations:', error);
      this.initializationResults.set('cdn', { success: false, error });
      this.emit('cdn:error', error);
      return false;
    }
  }

  /**
   * Initialize optimized stores
   */
  async initializeStores() {
    this.log('debug', 'Initializing optimized stores...');
    
    try {
      const storeResults = await initializeAllStores();
      this.initializationResults.set('stores', { success: true, results: storeResults });
      this.log('info', `Stores initialized: ${storeResults.successful.join(', ')}`);
      
      if (storeResults.failed.length > 0) {
        this.log('warn', `Some stores failed to initialize: ${storeResults.failed.join(', ')}`);
      }
      
      this.emit('stores:ready', storeResults);
      return true;
    } catch (error) {
      this.log('error', 'Failed to initialize stores:', error);
      this.initializationResults.set('stores', { success: false, error });
      this.emit('stores:error', error);
      return false;
    }
  }

  /**
   * Initialize service worker (optional)
   */
  async initializeServiceWorker() {
    this.log('debug', 'Checking service worker...');
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          this.log('info', 'Service worker is active');
          this.initializationResults.set('serviceWorker', { success: true, registration });
          this.emit('serviceWorker:ready', registration);
        } else {
          this.log('debug', 'Service worker not registered');
          this.initializationResults.set('serviceWorker', { success: false, reason: 'not-registered' });
        }
      } else {
        this.log('debug', 'Service worker not supported');
        this.initializationResults.set('serviceWorker', { success: false, reason: 'not-supported' });
      }
      return true;
    } catch (error) {
      this.log('warn', 'Service worker check failed:', error);
      this.initializationResults.set('serviceWorker', { success: false, error });
      this.emit('serviceWorker:error', error);
      return false;
    }
  }

  /**
   * Initialize analytics and monitoring (optional)
   */
  async initializeAnalytics() {
    this.log('debug', 'Initializing performance analytics...');
    
    try {
      // Setup performance monitoring
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'navigation') {
              this.log('debug', 'Navigation timing:', {
                loadTime: entry.loadEventEnd - entry.loadEventStart,
                domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                totalTime: entry.loadEventEnd - entry.fetchStart
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['navigation', 'resource'] });
        
        this.initializationResults.set('analytics', { success: true, observer });
        this.log('info', 'Performance analytics initialized');
        this.emit('analytics:ready', observer);
      } else {
        this.log('debug', 'PerformanceObserver not supported');
        this.initializationResults.set('analytics', { success: false, reason: 'not-supported' });
      }
      
      return true;
    } catch (error) {
      this.log('warn', 'Analytics initialization failed:', error);
      this.initializationResults.set('analytics', { success: false, error });
      this.emit('analytics:error', error);
      return false;
    }
  }

  /**
   * Run all initialization steps
   */
  async initializeApp() {
    this.startTime = performance.now();
    this.log('info', 'Starting application initialization...');

    // Create timeout for the entire initialization process
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Application initialization timeout'));
      }, APP_INIT_CONFIG.TIMEOUT);
    });

    try {
      // Run initialization steps
      const initPromise = this.runInitializationSteps();
      
      // Race against timeout
      await Promise.race([initPromise, timeoutPromise]);
      
      const totalTime = performance.now() - this.startTime;
      this.log('info', `Application initialization completed in ${totalTime.toFixed(2)}ms`);
      
      // Generate initialization report
      const report = this.generateInitializationReport();
      this.emit('init:complete', report);
      
      return report;
      
    } catch (error) {
      this.log('error', 'Application initialization failed:', error);
      const report = this.generateInitializationReport(error);
      this.emit('init:error', report);
      throw error;
    }
  }

  /**
   * Run initialization steps in optimal order
   */
  async runInitializationSteps() {
    // Phase 1: Critical optimizations (parallel)
    this.log('debug', 'Phase 1: Initializing critical features...');
    const criticalPromises = [
      this.initializeCDN(),
      this.initializeStores()
    ];

    const criticalResults = await Promise.allSettled(criticalPromises);
    
    // Check if any critical features failed
    const criticalFailures = criticalResults
      .map((result, index) => ({ 
        feature: APP_INIT_CONFIG.CRITICAL_FEATURES[index], 
        result 
      }))
      .filter(({ result }) => result.status === 'rejected' || !result.value);

    if (criticalFailures.length > 0) {
      const failedFeatures = criticalFailures.map(({ feature }) => feature);
      throw new Error(`Critical features failed to initialize: ${failedFeatures.join(', ')}`);
    }

    this.log('info', 'Critical features initialized successfully');

    // Phase 2: Optional features (parallel, with graceful failures)
    this.log('debug', 'Phase 2: Initializing optional features...');
    const optionalPromises = [
      this.initializeServiceWorker().catch(() => false),
      this.initializeAnalytics().catch(() => false)
    ];

    await Promise.allSettled(optionalPromises);
    this.log('debug', 'Optional features initialization completed');

    // Phase 3: Post-initialization optimizations
    this.log('debug', 'Phase 3: Running post-initialization optimizations...');
    await this.runPostInitializationTasks();
  }

  /**
   * Run post-initialization optimization tasks
   */
  async runPostInitializationTasks() {
    try {
      // Warm up optimized data service cache
      if (optimizedDataService.initialized) {
        this.log('debug', 'Warming up data service cache...');
        // This could include prefetching critical data
      }

      // Initialize route-specific preloading based on current route
      const currentPath = window.location.pathname;
      let routeName = 'dashboard'; // default
      
      if (currentPath.includes('/analytics')) routeName = 'analytics';
      else if (currentPath.includes('/products')) routeName = 'products';
      else if (currentPath.includes('/customers')) routeName = 'customers';

      const cdnResult = this.initializationResults.get('cdn');
      if (cdnResult?.success && cdnResult.services?.assetPreloader) {
        this.log('debug', `Preloading assets for route: ${routeName}`);
        await cdnResult.services.assetPreloader.preloadRouteAssets(routeName)
          .catch(error => this.log('warn', 'Route asset preloading failed:', error));
      }

      this.log('debug', 'Post-initialization tasks completed');
    } catch (error) {
      this.log('warn', 'Post-initialization tasks failed:', error);
    }
  }

  /**
   * Generate initialization report
   */
  generateInitializationReport(error = null) {
    const totalTime = this.startTime ? performance.now() - this.startTime : 0;
    
    const report = {
      success: !error,
      error: error?.message,
      totalTime: totalTime.toFixed(2) + 'ms',
      results: {},
      summary: {
        critical: { success: 0, failed: 0 },
        optional: { success: 0, failed: 0 }
      }
    };

    // Process results
    for (const [feature, result] of this.initializationResults) {
      report.results[feature] = {
        success: result.success,
        error: result.error?.message,
        reason: result.reason
      };

      // Update summary
      const isCritical = APP_INIT_CONFIG.CRITICAL_FEATURES.includes(feature);
      const category = isCritical ? 'critical' : 'optional';
      
      if (result.success) {
        report.summary[category].success++;
      } else {
        report.summary[category].failed++;
      }
    }

    // Add performance metrics
    report.performance = {
      criticalFeaturesReady: report.summary.critical.success === APP_INIT_CONFIG.CRITICAL_FEATURES.length,
      optionalFeaturesReady: report.summary.optional.failed === 0,
      overallHealth: error ? 'unhealthy' : 'healthy'
    };

    return report;
  }

  /**
   * Get current initialization status
   */
  getInitializationStatus() {
    return {
      isComplete: this.initializationResults.size > 0,
      results: Object.fromEntries(this.initializationResults),
      startTime: this.startTime
    };
  }

  /**
   * Reset initialization state
   */
  reset() {
    this.initializationResults.clear();
    this.startTime = null;
    this.listeners.clear();
    this.log('debug', 'Application initializer reset');
  }
}

/**
 * Global application initializer instance
 */
export const applicationInitializer = new ApplicationInitializer();

/**
 * Convenience function to initialize the entire app
 */
export async function initializeApplication() {
  return await applicationInitializer.initializeApp();
}

/**
 * React hook for initialization status
 */
export function useApplicationInitialization() {
  return {
    initialize: () => applicationInitializer.initializeApp(),
    getStatus: () => applicationInitializer.getInitializationStatus(),
    addEventListener: (event, callback) => applicationInitializer.addEventListener(event, callback),
    reset: () => applicationInitializer.reset()
  };
}

export default applicationInitializer;