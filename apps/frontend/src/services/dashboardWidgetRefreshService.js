/**
 * OMNIX AI - Dynamic Dashboard Widget Refresh Service
 * MGR-028: Dynamic dashboard widget refresh with intelligent intervals
 * Manages individual widget refresh schedules and optimization
 */

class DashboardWidgetRefreshService {
  constructor() {
    this.widgets = new Map();
    this.globalRefreshInterval = 30000; // 30 seconds default
    this.isActive = false;
    this.performanceMetrics = {
      refreshCount: 0,
      avgRefreshTime: 0,
      failureRate: 0,
      lastOptimization: null
    };
    this.subscribers = new Set();
    this.refreshQueue = [];
    this.isProcessingQueue = false;

    // Widget refresh configurations
    this.widgetConfigs = {
      // High priority widgets (every 15 seconds)
      high_priority: {
        interval: 15000,
        widgets: ['revenue-stream', 'live-alerts', 'inventory-tracker', 'customer-activity']
      },
      // Medium priority widgets (every 30 seconds) 
      medium_priority: {
        interval: 30000,
        widgets: ['ab-testing', 'team-activity', 'performance-metrics', 'churn-risk']
      },
      // Low priority widgets (every 60 seconds)
      low_priority: {
        interval: 60000,
        widgets: ['cost-optimization', 'seasonal-forecasting', 'product-analytics', 'supplier-integration']
      },
      // Background widgets (every 5 minutes)
      background: {
        interval: 300000,
        widgets: ['bulk-operations', 'reports', 'audit-logs']
      }
    };

    // Performance thresholds for optimization
    this.optimizationThresholds = {
      maxRefreshTime: 2000, // 2 seconds
      maxFailureRate: 0.05, // 5%
      cpuThreshold: 80, // 80% CPU usage
      memoryThreshold: 85 // 85% memory usage
    };

    this.initializeService();
  }

  /**
   * Initialize the service
   */
  initializeService() {
    this.setupDefaultWidgets();
    this.startPerformanceMonitoring();
    this.optimizeRefreshIntervals();
  }

  /**
   * Register a widget for dynamic refresh
   */
  registerWidget(widgetId, config = {}) {
    const widgetConfig = {
      id: widgetId,
      name: config.name || widgetId,
      priority: config.priority || 'medium_priority',
      customInterval: config.customInterval || null,
      refreshCallback: config.refreshCallback || null,
      enabled: config.enabled !== false,
      lastRefresh: null,
      nextRefresh: null,
      refreshCount: 0,
      avgRefreshTime: 0,
      failureCount: 0,
      isRefreshing: false,
      dependencies: config.dependencies || [],
      conditionalRefresh: config.conditionalRefresh || null,
      metadata: config.metadata || {},
      healthStatus: 'healthy'
    };

    // Set refresh interval based on priority or custom interval
    if (widgetConfig.customInterval) {
      widgetConfig.interval = widgetConfig.customInterval;
    } else {
      widgetConfig.interval = this.widgetConfigs[widgetConfig.priority]?.interval || 30000;
    }

    // Schedule next refresh
    widgetConfig.nextRefresh = Date.now() + widgetConfig.interval;

    this.widgets.set(widgetId, widgetConfig);
    this.notifySubscribers('widget_registered', { widget: widgetConfig });

    // Start automatic refresh if service is active
    if (this.isActive) {
      this.scheduleWidgetRefresh(widgetId);
    }

    return widgetConfig;
  }

  /**
   * Unregister a widget
   */
  unregisterWidget(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      // Clear any pending refreshes
      if (widget.timeoutId) {
        clearTimeout(widget.timeoutId);
      }
      
      this.widgets.delete(widgetId);
      this.notifySubscribers('widget_unregistered', { widgetId });
      return true;
    }
    return false;
  }

  /**
   * Start the global refresh service
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.notifySubscribers('service_started', { timestamp: new Date() });

    // Schedule all registered widgets
    for (const [widgetId] of this.widgets) {
      this.scheduleWidgetRefresh(widgetId);
    }

    // Start queue processing
    this.startQueueProcessing();
    
    console.log('Dashboard Widget Refresh Service started');
  }

  /**
   * Stop the global refresh service
   */
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    // Clear all widget timeouts
    for (const [, widget] of this.widgets) {
      if (widget.timeoutId) {
        clearTimeout(widget.timeoutId);
        widget.timeoutId = null;
      }
    }

    // Stop queue processing
    this.isProcessingQueue = false;

    this.notifySubscribers('service_stopped', { timestamp: new Date() });
    console.log('Dashboard Widget Refresh Service stopped');
  }

  /**
   * Schedule refresh for a specific widget
   */
  scheduleWidgetRefresh(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (!widget || !widget.enabled || !this.isActive) return;

    // Clear existing timeout
    if (widget.timeoutId) {
      clearTimeout(widget.timeoutId);
    }

    // Calculate delay until next refresh
    const now = Date.now();
    const delay = Math.max(0, widget.nextRefresh - now);

    widget.timeoutId = setTimeout(() => {
      this.refreshWidget(widgetId);
    }, delay);
  }

  /**
   * Refresh a specific widget
   */
  async refreshWidget(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (!widget || widget.isRefreshing) return;

    // Check conditional refresh
    if (widget.conditionalRefresh && !widget.conditionalRefresh()) {
      this.scheduleNextRefresh(widgetId);
      return;
    }

    const startTime = performance.now();
    widget.isRefreshing = true;
    widget.lastRefresh = Date.now();

    try {
      // Add to refresh queue if processing async
      if (widget.dependencies.length > 0) {
        await this.refreshWithDependencies(widgetId);
      } else if (widget.refreshCallback) {
        await widget.refreshCallback(widget);
      } else {
        // Default refresh behavior
        await this.defaultWidgetRefresh(widget);
      }

      // Update success metrics
      const refreshTime = performance.now() - startTime;
      this.updateWidgetMetrics(widgetId, refreshTime, true);
      widget.healthStatus = refreshTime > this.optimizationThresholds.maxRefreshTime ? 'slow' : 'healthy';

      this.notifySubscribers('widget_refreshed', { 
        widgetId, 
        refreshTime,
        timestamp: Date.now()
      });

    } catch (error) {
      // Update failure metrics
      const refreshTime = performance.now() - startTime;
      this.updateWidgetMetrics(widgetId, refreshTime, false);
      widget.healthStatus = 'error';
      widget.lastError = error.message;

      console.error(`Widget refresh failed for ${widgetId}:`, error);
      this.notifySubscribers('widget_refresh_failed', { 
        widgetId, 
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      widget.isRefreshing = false;
      this.scheduleNextRefresh(widgetId);
    }
  }

  /**
   * Refresh widget with dependency management
   */
  async refreshWithDependencies(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (!widget) return;

    // Check if dependencies are ready
    const dependencyStates = widget.dependencies.map(depId => {
      const depWidget = this.widgets.get(depId);
      return {
        id: depId,
        ready: depWidget && !depWidget.isRefreshing,
        widget: depWidget
      };
    });

    const allDependenciesReady = dependencyStates.every(dep => dep.ready);

    if (allDependenciesReady) {
      // Refresh dependencies first if needed
      for (const dep of dependencyStates) {
        if (dep.widget && this.shouldRefreshDependency(dep.widget)) {
          await this.refreshWidget(dep.id);
        }
      }
      
      // Now refresh the main widget
      if (widget.refreshCallback) {
        await widget.refreshCallback(widget);
      }
    } else {
      // Schedule retry
      setTimeout(() => this.refreshWidget(widgetId), 1000);
    }
  }

  /**
   * Default widget refresh implementation
   */
  async defaultWidgetRefresh(widget) {
    // Simulate API call or data fetch
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Default refresh logic could include:
    // - Checking for new data
    // - Updating widget state
    // - Triggering UI updates
    
    return { success: true, data: null };
  }

  /**
   * Schedule next refresh for a widget
   */
  scheduleNextRefresh(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (!widget) return;

    // Apply intelligent interval adjustment based on activity
    let nextInterval = widget.interval;
    
    // Increase interval if widget is performing slowly
    if (widget.healthStatus === 'slow') {
      nextInterval = Math.min(nextInterval * 1.5, 300000); // Max 5 minutes
    }
    
    // Decrease interval for high-activity widgets
    if (widget.refreshCount > 10 && widget.avgRefreshTime < 500) {
      nextInterval = Math.max(nextInterval * 0.9, 5000); // Min 5 seconds
    }

    widget.nextRefresh = Date.now() + nextInterval;
    this.scheduleWidgetRefresh(widgetId);
  }

  /**
   * Update widget performance metrics
   */
  updateWidgetMetrics(widgetId, refreshTime, success) {
    const widget = this.widgets.get(widgetId);
    if (!widget) return;

    widget.refreshCount++;
    
    if (success) {
      // Update average refresh time
      widget.avgRefreshTime = widget.avgRefreshTime === 0 
        ? refreshTime 
        : (widget.avgRefreshTime + refreshTime) / 2;
    } else {
      widget.failureCount++;
    }

    // Update global metrics
    this.performanceMetrics.refreshCount++;
    this.performanceMetrics.avgRefreshTime = 
      (this.performanceMetrics.avgRefreshTime + refreshTime) / 2;
    this.performanceMetrics.failureRate = 
      this.calculateGlobalFailureRate();
  }

  /**
   * Calculate global failure rate
   */
  calculateGlobalFailureRate() {
    let totalFailures = 0;
    let totalRefreshes = 0;

    for (const [, widget] of this.widgets) {
      totalFailures += widget.failureCount;
      totalRefreshes += widget.refreshCount;
    }

    return totalRefreshes > 0 ? totalFailures / totalRefreshes : 0;
  }

  /**
   * Optimize refresh intervals based on performance
   */
  optimizeRefreshIntervals() {
    if (!this.isActive) return;

    const now = Date.now();
    let optimizationsApplied = 0;

    for (const [widgetId, widget] of this.widgets) {
      let newInterval = widget.interval;
      let optimized = false;

      // Reduce interval for healthy, fast widgets
      if (widget.healthStatus === 'healthy' && 
          widget.avgRefreshTime < 500 && 
          widget.refreshCount > 5) {
        newInterval = Math.max(widget.interval * 0.8, 5000);
        optimized = true;
      }

      // Increase interval for slow or failing widgets
      if (widget.healthStatus === 'slow' || 
          (widget.failureCount / Math.max(widget.refreshCount, 1)) > 0.1) {
        newInterval = Math.min(widget.interval * 1.3, 300000);
        optimized = true;
      }

      if (optimized && newInterval !== widget.interval) {
        widget.interval = newInterval;
        widget.nextRefresh = now + newInterval;
        optimizationsApplied++;
        
        this.notifySubscribers('widget_optimized', { 
          widgetId, 
          oldInterval: widget.interval,
          newInterval,
          reason: widget.healthStatus
        });
      }
    }

    this.performanceMetrics.lastOptimization = now;
    
    if (optimizationsApplied > 0) {
      console.log(`Optimized ${optimizationsApplied} widget refresh intervals`);
    }

    // Schedule next optimization
    setTimeout(() => this.optimizeRefreshIntervals(), 60000); // Every minute
  }

  /**
   * Setup default widgets
   */
  setupDefaultWidgets() {
    // Register high-priority widgets
    this.registerWidget('revenue-stream', {
      name: 'Revenue Stream Panel',
      priority: 'high_priority',
      conditionalRefresh: () => this.isUserActive()
    });

    this.registerWidget('live-alerts', {
      name: 'Real-time Alerts',
      priority: 'high_priority'
    });

    this.registerWidget('inventory-tracker', {
      name: 'Live Inventory Tracker',
      priority: 'high_priority',
      dependencies: ['inventory-data']
    });

    this.registerWidget('customer-activity', {
      name: 'Customer Activity Feed',
      priority: 'high_priority'
    });

    // Register medium-priority widgets
    this.registerWidget('ab-testing', {
      name: 'A/B Testing Results',
      priority: 'medium_priority'
    });

    this.registerWidget('team-activity', {
      name: 'Team Activity Feed',
      priority: 'medium_priority'
    });

    this.registerWidget('performance-metrics', {
      name: 'Dashboard Performance',
      priority: 'medium_priority'
    });

    // Register low-priority widgets
    this.registerWidget('cost-optimization', {
      name: 'Cost Optimization',
      priority: 'low_priority',
      conditionalRefresh: () => this.isBusinessHours()
    });

    this.registerWidget('seasonal-forecasting', {
      name: 'Seasonal Forecasting',
      priority: 'low_priority'
    });
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    const monitor = () => {
      if (!this.isActive) return;

      // Check system performance
      const memoryUsage = this.getMemoryUsage();
      const activeWidgets = Array.from(this.widgets.values()).filter(w => w.enabled).length;
      
      // Pause non-critical widgets if performance is poor
      if (memoryUsage > this.optimizationThresholds.memoryThreshold) {
        this.pauseLowPriorityWidgets();
      } else {
        this.resumeLowPriorityWidgets();
      }

      // Schedule next monitor
      setTimeout(monitor, 30000);
    };

    monitor();
  }

  /**
   * Start queue processing for batch operations
   */
  startQueueProcessing() {
    const processQueue = async () => {
      if (!this.isActive || this.isProcessingQueue || this.refreshQueue.length === 0) {
        setTimeout(processQueue, 1000);
        return;
      }

      this.isProcessingQueue = true;

      try {
        // Process up to 5 refreshes in batch
        const batch = this.refreshQueue.splice(0, 5);
        await Promise.all(batch.map(widgetId => this.refreshWidget(widgetId)));
      } catch (error) {
        console.error('Queue processing error:', error);
      } finally {
        this.isProcessingQueue = false;
        setTimeout(processQueue, 1000);
      }
    };

    processQueue();
  }

  /**
   * Utility methods
   */
  isUserActive() {
    // Simple activity detection - in real implementation would track mouse/keyboard
    return document.hasFocus() && !document.hidden;
  }

  isBusinessHours() {
    const hour = new Date().getHours();
    return hour >= 8 && hour <= 18; // 8 AM to 6 PM
  }

  getMemoryUsage() {
    if (performance.memory) {
      return (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
    }
    return 0;
  }

  shouldRefreshDependency(depWidget) {
    const timeSinceLastRefresh = Date.now() - (depWidget.lastRefresh || 0);
    return timeSinceLastRefresh > depWidget.interval;
  }

  pauseLowPriorityWidgets() {
    for (const [, widget] of this.widgets) {
      if (widget.priority === 'low_priority' || widget.priority === 'background') {
        widget.enabled = false;
        if (widget.timeoutId) {
          clearTimeout(widget.timeoutId);
          widget.timeoutId = null;
        }
      }
    }
    console.log('Paused low-priority widgets due to performance constraints');
  }

  resumeLowPriorityWidgets() {
    for (const [widgetId, widget] of this.widgets) {
      if ((widget.priority === 'low_priority' || widget.priority === 'background') && 
          !widget.enabled) {
        widget.enabled = true;
        this.scheduleWidgetRefresh(widgetId);
      }
    }
  }

  /**
   * Public API methods
   */
  
  /**
   * Get widget status
   */
  getWidgetStatus(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (!widget) return null;

    return {
      id: widget.id,
      name: widget.name,
      enabled: widget.enabled,
      isRefreshing: widget.isRefreshing,
      lastRefresh: widget.lastRefresh,
      nextRefresh: widget.nextRefresh,
      refreshCount: widget.refreshCount,
      avgRefreshTime: Math.round(widget.avgRefreshTime),
      healthStatus: widget.healthStatus,
      failureRate: widget.refreshCount > 0 ? 
        (widget.failureCount / widget.refreshCount * 100).toFixed(1) : 0
    };
  }

  /**
   * Get all widget statuses
   */
  getAllWidgetStatuses() {
    const statuses = {};
    for (const [widgetId] of this.widgets) {
      statuses[widgetId] = this.getWidgetStatus(widgetId);
    }
    return statuses;
  }

  /**
   * Get service statistics
   */
  getServiceStats() {
    return {
      isActive: this.isActive,
      totalWidgets: this.widgets.size,
      activeWidgets: Array.from(this.widgets.values()).filter(w => w.enabled).length,
      totalRefreshes: this.performanceMetrics.refreshCount,
      avgRefreshTime: Math.round(this.performanceMetrics.avgRefreshTime),
      failureRate: (this.performanceMetrics.failureRate * 100).toFixed(2),
      lastOptimization: this.performanceMetrics.lastOptimization,
      memoryUsage: this.getMemoryUsage().toFixed(1)
    };
  }

  /**
   * Force refresh a widget
   */
  forceRefresh(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (widget && !widget.isRefreshing) {
      // Clear existing timeout and refresh immediately
      if (widget.timeoutId) {
        clearTimeout(widget.timeoutId);
      }
      this.refreshWidget(widgetId);
      return true;
    }
    return false;
  }

  /**
   * Update widget configuration
   */
  updateWidgetConfig(widgetId, updates) {
    const widget = this.widgets.get(widgetId);
    if (!widget) return false;

    // Apply updates
    Object.assign(widget, updates);

    // Reschedule if interval changed
    if (updates.interval || updates.priority) {
      if (updates.priority && !updates.interval) {
        widget.interval = this.widgetConfigs[updates.priority]?.interval || widget.interval;
      }
      
      widget.nextRefresh = Date.now() + widget.interval;
      if (this.isActive) {
        this.scheduleWidgetRefresh(widgetId);
      }
    }

    this.notifySubscribers('widget_updated', { widgetId, updates });
    return true;
  }

  /**
   * Subscribe to service events
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify subscribers
   */
  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback({ event, data, timestamp: Date.now() });
      } catch (error) {
        console.error('Dashboard refresh service subscriber error:', error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stop();
    this.widgets.clear();
    this.subscribers.clear();
    this.refreshQueue = [];
    console.log('Dashboard Widget Refresh Service destroyed');
  }
}

// Create and export singleton instance
const dashboardWidgetRefreshService = new DashboardWidgetRefreshService();
export default dashboardWidgetRefreshService;