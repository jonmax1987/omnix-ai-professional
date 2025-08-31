/**
 * Store Initializer - PERF-006
 * Centralized initialization system for all optimized stores
 * Ensures proper setup of query optimizations, caching, and performance monitoring
 */

import { optimizedDataService } from '../services/optimizedDataService.js';

/**
 * Store initialization configuration
 */
const INIT_CONFIG = {
  TIMEOUT: 10000, // 10 seconds timeout
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second
  PERFORMANCE_MONITORING: true,
  LOG_LEVEL: import.meta.env?.MODE === 'development' ? 'debug' : 'info'
};

/**
 * Store Initializer Class
 */
class StoreInitializer {
  constructor() {
    this.initialized = new Set();
    this.errors = new Map();
    this.startTime = null;
  }

  /**
   * Log messages with appropriate level
   */
  log(level, message, data = null) {
    if (level === 'debug' && INIT_CONFIG.LOG_LEVEL !== 'debug') return;
    
    const prefix = '[StoreInitializer]';
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
   * Initialize optimized data service
   */
  async initializeDataService() {
    try {
      this.log('info', 'Initializing optimized data service...');
      await optimizedDataService.initialize();
      this.log('info', 'Optimized data service initialized successfully');
      return true;
    } catch (error) {
      this.log('error', 'Failed to initialize optimized data service', error);
      return false;
    }
  }

  /**
   * Initialize a specific store with retry logic
   */
  async initializeStore(storeName, storeHook, options = {}) {
    const { retryCount = INIT_CONFIG.RETRY_COUNT, timeout = INIT_CONFIG.TIMEOUT } = options;
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        this.log('debug', `Initializing store: ${storeName} (attempt ${attempt}/${retryCount})`);
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Store initialization timeout after ${timeout}ms`)), timeout);
        });

        // Initialize store with timeout
        const store = storeHook.getState();
        const initPromise = store.initializeOptimizations ? 
          store.initializeOptimizations() : 
          Promise.resolve();

        await Promise.race([initPromise, timeoutPromise]);

        this.initialized.add(storeName);
        this.log('info', `Store initialized successfully: ${storeName}`);
        return true;

      } catch (error) {
        const errorMessage = `Store initialization failed: ${storeName} (attempt ${attempt}/${retryCount})`;
        this.log('warn', errorMessage, error);
        
        this.errors.set(storeName, error);
        
        if (attempt < retryCount) {
          this.log('debug', `Retrying in ${INIT_CONFIG.RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, INIT_CONFIG.RETRY_DELAY));
        }
      }
    }

    this.log('error', `Failed to initialize store after ${retryCount} attempts: ${storeName}`);
    return false;
  }

  /**
   * Initialize all stores concurrently
   */
  async initializeAllStores() {
    this.startTime = performance.now();
    this.log('info', 'Starting store initialization process...');

    // Initialize data service first
    const dataServiceReady = await this.initializeDataService();
    if (!dataServiceReady) {
      this.log('warn', 'Data service failed to initialize, stores will use fallback mode');
    }

    // Dynamic imports to avoid circular dependencies
    const storePromises = [];

    try {
      // Products Store
      const { default: useProductsStore } = await import('../store/productsStore.js');
      storePromises.push(
        this.initializeStore('products', useProductsStore)
          .then(success => ({ store: 'products', success }))
      );
    } catch (error) {
      this.log('error', 'Failed to import products store', error);
    }

    try {
      // Dashboard Store
      const { default: useDashboardStore } = await import('../store/dashboardStore.js');
      storePromises.push(
        this.initializeStore('dashboard', useDashboardStore)
          .then(success => ({ store: 'dashboard', success }))
      );
    } catch (error) {
      this.log('error', 'Failed to import dashboard store', error);
    }

    try {
      // Customer Behavior Store (if exists)
      const { default: useCustomerBehaviorStore } = await import('../store/customerBehaviorStore.js');
      storePromises.push(
        this.initializeStore('customerBehavior', useCustomerBehaviorStore)
          .then(success => ({ store: 'customerBehavior', success }))
      );
    } catch (error) {
      this.log('debug', 'Customer behavior store not found or failed to import', error);
    }

    try {
      // WebSocket Store (if exists)
      const { default: useWebSocketStore } = await import('../store/websocketStore.js');
      storePromises.push(
        this.initializeStore('websocket', useWebSocketStore)
          .then(success => ({ store: 'websocket', success }))
      );
    } catch (error) {
      this.log('debug', 'WebSocket store not found or failed to import', error);
    }

    // Wait for all store initializations
    const results = await Promise.allSettled(storePromises);
    
    // Process results
    const successful = [];
    const failed = [];

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        successful.push(result.value.store);
      } else {
        const storeName = result.status === 'fulfilled' ? result.value.store : 'unknown';
        failed.push(storeName);
      }
    });

    const totalTime = performance.now() - this.startTime;
    
    this.log('info', `Store initialization completed in ${totalTime.toFixed(2)}ms`);
    this.log('info', `Successfully initialized: ${successful.join(', ')}`);
    
    if (failed.length > 0) {
      this.log('warn', `Failed to initialize: ${failed.join(', ')}`);
    }

    // Log performance metrics if enabled
    if (INIT_CONFIG.PERFORMANCE_MONITORING) {
      this.logPerformanceMetrics();
    }

    return {
      successful,
      failed,
      totalTime,
      errors: Object.fromEntries(this.errors)
    };
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics() {
    try {
      const metrics = optimizedDataService.getPerformanceMetrics();
      this.log('info', 'Performance metrics:', metrics);
      
      // Cache efficiency warning
      if (metrics.cache.efficiency === 'poor') {
        this.log('warn', 'Cache efficiency is poor, consider reviewing cache TTL settings');
      }
    } catch (error) {
      this.log('debug', 'Failed to get performance metrics', error);
    }
  }

  /**
   * Check if a store is initialized
   */
  isStoreInitialized(storeName) {
    return this.initialized.has(storeName);
  }

  /**
   * Get initialization status
   */
  getInitializationStatus() {
    return {
      initialized: Array.from(this.initialized),
      errors: Object.fromEntries(this.errors),
      totalInitialized: this.initialized.size,
      hasErrors: this.errors.size > 0
    };
  }

  /**
   * Clear all initialization state
   */
  reset() {
    this.initialized.clear();
    this.errors.clear();
    this.startTime = null;
    this.log('debug', 'Store initializer reset');
  }

  /**
   * Reinitialize a specific store
   */
  async reinitializeStore(storeName) {
    this.log('info', `Reinitializing store: ${storeName}`);
    this.initialized.delete(storeName);
    this.errors.delete(storeName);

    try {
      // Dynamic import and reinitialize
      let storeHook;
      
      switch (storeName) {
        case 'products': {
          const { default: useProductsStore } = await import('../store/productsStore.js');
          storeHook = useProductsStore;
          break;
        }
        case 'dashboard': {
          const { default: useDashboardStore } = await import('../store/dashboardStore.js');
          storeHook = useDashboardStore;
          break;
        }
        case 'customerBehavior': {
          const { default: useCustomerBehaviorStore } = await import('../store/customerBehaviorStore.js');
          storeHook = useCustomerBehaviorStore;
          break;
        }
        case 'websocket': {
          const { default: useWebSocketStore } = await import('../store/websocketStore.js');
          storeHook = useWebSocketStore;
          break;
        }
        default:
          throw new Error(`Unknown store: ${storeName}`);
      }

      return await this.initializeStore(storeName, storeHook);
    } catch (error) {
      this.log('error', `Failed to reinitialize store: ${storeName}`, error);
      return false;
    }
  }
}

/**
 * Global store initializer instance
 */
export const storeInitializer = new StoreInitializer();

/**
 * Convenience function to initialize all stores
 */
export async function initializeAllStores(options = {}) {
  return await storeInitializer.initializeAllStores(options);
}

/**
 * React hook for store initialization status
 */
export function useStoreInitialization() {
  return {
    isInitialized: (storeName) => storeInitializer.isStoreInitialized(storeName),
    getStatus: () => storeInitializer.getInitializationStatus(),
    reinitialize: (storeName) => storeInitializer.reinitializeStore(storeName),
    initializeAll: () => storeInitializer.initializeAllStores()
  };
}

export default storeInitializer;