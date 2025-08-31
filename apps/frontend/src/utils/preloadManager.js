/**
 * Preload Manager - PERF-001: Bundle size optimization and code splitting
 * Manages preloading of critical resources and code splitting optimization
 */

// Route-based preloading map
export const PRELOAD_MAP = {
  dashboard: () => import('../pages/Dashboard'),
  products: () => import('../pages/Products'),
  orders: () => import('../pages/Orders'),
  analytics: () => import('../pages/Analytics'),
  settings: () => import('../pages/Settings'),
  'ab-testing': () => import('../pages/ABTesting'),
  alerts: () => import('../pages/Alerts'),
  recommendations: () => import('../pages/Recommendations'),
  customer: () => import('../pages/CustomerDashboard'),
};

// Critical component preloading
export const CRITICAL_COMPONENTS = {
  'customer-segment-wheel': () => import('../components/organisms/CustomerSegmentWheel'),
  'ai-insights-panel': () => import('../components/organisms/AIInsightsPanel'),
  'predictive-inventory': () => import('../components/organisms/PredictiveInventoryPanel'),
  'revenue-stream-chart': () => import('../components/organisms/RevenueStreamChart'),
  'ab-test-results': () => import('../components/organisms/ABTestResultsVisualizer'),
};

class PreloadManager {
  constructor() {
    this.preloadedRoutes = new Set();
    this.preloadedComponents = new Set();
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  /**
   * Preload a route component
   * @param {string} routeName - Route name from PRELOAD_MAP
   * @param {boolean} priority - High priority preload
   */
  preloadRoute(routeName, priority = false) {
    if (this.preloadedRoutes.has(routeName) || !PRELOAD_MAP[routeName]) {
      return Promise.resolve();
    }

    const preloadPromise = PRELOAD_MAP[routeName]()
      .then(() => {
        this.preloadedRoutes.add(routeName);
        console.log(`✅ Preloaded route: ${routeName}`);
      })
      .catch(error => {
        console.warn(`❌ Failed to preload route ${routeName}:`, error);
      });

    if (priority) {
      return preloadPromise;
    } else {
      this.queuePreload(() => preloadPromise);
      return Promise.resolve();
    }
  }

  /**
   * Preload a critical component
   * @param {string} componentName - Component name from CRITICAL_COMPONENTS
   */
  preloadComponent(componentName) {
    if (this.preloadedComponents.has(componentName) || !CRITICAL_COMPONENTS[componentName]) {
      return Promise.resolve();
    }

    return CRITICAL_COMPONENTS[componentName]()
      .then(() => {
        this.preloadedComponents.add(componentName);
        console.log(`✅ Preloaded component: ${componentName}`);
      })
      .catch(error => {
        console.warn(`❌ Failed to preload component ${componentName}:`, error);
      });
  }

  /**
   * Queue non-critical preloads for idle time
   */
  queuePreload(preloadFn) {
    this.preloadQueue.push(preloadFn);
    if (!this.isPreloading) {
      this.processQueue();
    }
  }

  /**
   * Process preload queue during idle time
   */
  async processQueue() {
    if (this.preloadQueue.length === 0) {
      this.isPreloading = false;
      return;
    }

    this.isPreloading = true;

    // Use requestIdleCallback for non-blocking preloads
    const processNext = (deadline) => {
      while (deadline.timeRemaining() > 0 && this.preloadQueue.length > 0) {
        const preloadFn = this.preloadQueue.shift();
        preloadFn().catch(error => {
          console.warn('Queued preload failed:', error);
        });
      }

      if (this.preloadQueue.length > 0) {
        this.scheduleNextBatch();
      } else {
        this.isPreloading = false;
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(processNext, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => processNext({ timeRemaining: () => 50 }), 100);
    }
  }

  scheduleNextBatch() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback((deadline) => this.processQueue(), { timeout: 5000 });
    } else {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Preload based on user navigation patterns
   * @param {string} currentRoute - Current route name
   */
  predictivePreload(currentRoute) {
    const preloadPatterns = {
      dashboard: ['products', 'analytics'], // From dashboard, likely to go to products or analytics
      products: ['orders', 'analytics'], // From products, likely to check orders or analytics
      orders: ['products', 'analytics'],
      analytics: ['ab-testing', 'products'],
      'ab-testing': ['analytics'],
      customer: ['products', 'orders'] // Customer might browse products or check orders
    };

    const nextLikelyRoutes = preloadPatterns[currentRoute] || [];
    nextLikelyRoutes.forEach(route => {
      this.preloadRoute(route, false); // Non-priority preload
    });
  }

  /**
   * Preload critical components based on route
   * @param {string} routeName - Current route name
   */
  preloadCriticalComponents(routeName) {
    const criticalForRoute = {
      dashboard: ['customer-segment-wheel', 'ai-insights-panel', 'revenue-stream-chart'],
      analytics: ['customer-segment-wheel', 'revenue-stream-chart'],
      'ab-testing': ['ab-test-results'],
      products: ['predictive-inventory']
    };

    const components = criticalForRoute[routeName] || [];
    components.forEach(component => {
      this.preloadComponent(component);
    });
  }

  /**
   * Initialize preloading based on user role and current route
   */
  initialize(userRole, currentRoute) {
    console.log(`🚀 Initializing preload manager for ${userRole} on ${currentRoute}`);

    // Always preload critical routes immediately
    if (userRole === 'customer') {
      this.preloadRoute('customer', true);
    } else {
      this.preloadRoute('dashboard', true);
    }

    // Preload components for current route
    this.preloadCriticalComponents(currentRoute);

    // Start predictive preloading
    setTimeout(() => {
      this.predictivePreload(currentRoute);
    }, 2000); // Delay to not interfere with initial load
  }

  /**
   * Get preload status for debugging
   */
  getStatus() {
    return {
      preloadedRoutes: Array.from(this.preloadedRoutes),
      preloadedComponents: Array.from(this.preloadedComponents),
      queueLength: this.preloadQueue.length,
      isPreloading: this.isPreloading
    };
  }
}

// Create singleton instance
export const preloadManager = new PreloadManager();

// Hook for using preload manager in components
export function usePreloadManager() {
  return preloadManager;
}

// Initialize on first import
if (typeof window !== 'undefined') {
  // Wait for initial render to complete before starting preloads
  setTimeout(() => {
    console.log('🎯 Preload manager initialized');
  }, 1000);
}