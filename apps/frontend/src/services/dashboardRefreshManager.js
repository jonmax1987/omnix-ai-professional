/**
 * OMNIX AI - Dashboard Refresh Manager
 * Centralized management of dashboard widget refresh scheduling and coordination
 * MGR-028: Dynamic dashboard widget refresh
 */

class DashboardRefreshManager {
  constructor() {
    this.widgets = new Map();
    this.refreshSchedules = new Map();
    this.priorityQueue = [];
    this.globalRefreshActive = false;
    this.webSocketStore = null;
    this.refreshStats = {
      totalRefreshes: 0,
      successfulRefreshes: 0,
      failedRefreshes: 0,
      averageRefreshTime: 0,
      lastGlobalRefresh: null
    };
    
    // Refresh priorities and scheduling
    this.priorityLevels = {
      critical: { weight: 1, maxConcurrent: 1, retryAttempts: 5 },
      high: { weight: 2, maxConcurrent: 2, retryAttempts: 3 },
      normal: { weight: 3, maxConcurrent: 4, retryAttempts: 2 },
      low: { weight: 4, maxConcurrent: 6, retryAttempts: 1 }
    };
    
    // Event triggers for widget refreshes
    this.eventTriggers = {
      'inventory_update': ['inventory-widget', 'alerts-widget', 'overview-widget'],
      'revenue_update': ['revenue-widget', 'metrics-widget', 'charts-widget'],
      'customer_activity': ['customer-widget', 'activity-widget', 'segments-widget'],
      'ab_test_update': ['ab-test-widget', 'experiments-widget'],
      'alert_notification': ['alerts-widget', 'notifications-widget'],
      'system_status': ['system-widget', 'health-widget']
    };
    
    // Refresh patterns
    this.refreshPatterns = {
      realtime: { interval: 5000, priority: 'critical' },
      frequent: { interval: 15000, priority: 'high' },
      normal: { interval: 30000, priority: 'normal' },
      slow: { interval: 60000, priority: 'low' },
      manual: { interval: null, priority: 'normal' }
    };
    
    // Initialize WebSocket integration
    this.initializeWebSocketIntegration();
  }
  
  /**
   * Initialize WebSocket integration for event-triggered refreshes
   */
  initializeWebSocketIntegration() {
    // Dynamically import and subscribe to WebSocket store
    import('../store/websocketStore.js').then(({ default: useWebSocketStore }) => {
      this.webSocketStore = useWebSocketStore;
      
      // Subscribe to relevant WebSocket events
      const unsubscribe = this.webSocketStore.subscribe((state) => {
        if (state.lastEvent) {
          this.handleWebSocketEvent(state.lastEvent);
        }
      });
      
      // Store cleanup function
      this.webSocketCleanup = unsubscribe;
    }).catch(console.error);
  }
  
  /**
   * Handle incoming WebSocket events and trigger appropriate refreshes
   */
  handleWebSocketEvent(event) {
    if (!event || !event.type) return;
    
    const eventMappings = {
      // Inventory and stock events
      'inventory_update': ['inventory-widget', 'alerts-widget', 'overview-widget'],
      'low_stock_alert': ['inventory-widget', 'alerts-widget'],
      'stock_replenishment': ['inventory-widget', 'overview-widget'],
      
      // Revenue and financial events
      'revenue_update': ['revenue-widget', 'metrics-widget', 'charts-widget'],
      'sales_milestone': ['revenue-widget', 'overview-widget'],
      'payment_processed': ['revenue-widget', 'transactions-widget'],
      
      // Customer activity events
      'customer_activity': ['customer-widget', 'activity-widget', 'segments-widget'],
      'new_customer': ['customer-widget', 'overview-widget'],
      'customer_segment_update': ['segments-widget', 'analytics-widget'],
      
      // A/B test and experiment events
      'ab_test_update': ['ab-test-widget', 'experiments-widget'],
      'test_results': ['ab-test-widget', 'analytics-widget'],
      'experiment_metrics': ['experiments-widget', 'metrics-widget'],
      
      // System and notification events
      'alert_notification': ['alerts-widget', 'notifications-widget'],
      'system_status': ['system-widget', 'health-widget'],
      'team_activity': ['team-widget', 'activity-widget'],
      
      // Dashboard-specific events
      'dashboard_refresh': ['*'], // Refresh all widgets
      'widget_error': ['system-widget', 'health-widget']
    };
    
    const triggeredWidgets = eventMappings[event.type];
    if (triggeredWidgets) {
      console.log(`⚡ WebSocket event trigger: ${event.type} -> refreshing widgets:`, triggeredWidgets);
      
      if (triggeredWidgets.includes('*')) {
        // Global refresh triggered
        this.refreshAll(['manual']).catch(console.error);
      } else {
        // Selective refresh
        this.refreshWidgets(triggeredWidgets, 2).catch(console.error);
      }
    }
  }
  
  /**
   * Register a widget with the refresh manager
   */
  registerWidget(widgetConfig) {
    const {
      id,
      name,
      refreshFunction,
      priority = 'normal',
      pattern = 'normal',
      triggers = [],
      dependencies = [],
      staleThreshold = 300000
    } = widgetConfig;
    
    const widget = {
      id,
      name,
      refreshFunction,
      priority,
      pattern,
      triggers,
      dependencies,
      staleThreshold,
      lastRefresh: null,
      nextRefresh: null,
      isRefreshing: false,
      error: null,
      refreshCount: 0,
      averageRefreshTime: 0,
      status: 'idle'
    };
    
    this.widgets.set(id, widget);
    
    // Schedule automatic refreshes
    if (pattern !== 'manual') {
      this.scheduleWidgetRefresh(id);
    }
    
    console.log(`📊 Widget registered: ${name} (${id}) - ${priority} priority, ${pattern} pattern`);
    return widget;
  }
  
  /**
   * Unregister a widget
   */
  unregisterWidget(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      this.cancelScheduledRefresh(widgetId);
      this.widgets.delete(widgetId);
      console.log(`📊 Widget unregistered: ${widget.name}`);
    }
  }
  
  /**
   * Schedule a widget refresh
   */
  scheduleWidgetRefresh(widgetId, delay = null) {
    const widget = this.widgets.get(widgetId);
    if (!widget) return;
    
    const refreshDelay = delay || this.refreshPatterns[widget.pattern].interval;
    if (!refreshDelay) return;
    
    // Clear existing schedule
    this.cancelScheduledRefresh(widgetId);
    
    const scheduleId = setTimeout(() => {
      this.refreshWidget(widgetId, 'scheduled');
    }, refreshDelay);
    
    this.refreshSchedules.set(widgetId, scheduleId);
    widget.nextRefresh = Date.now() + refreshDelay;
  }
  
  /**
   * Cancel scheduled refresh
   */
  cancelScheduledRefresh(widgetId) {
    const scheduleId = this.refreshSchedules.get(widgetId);
    if (scheduleId) {
      clearTimeout(scheduleId);
      this.refreshSchedules.delete(widgetId);
      
      const widget = this.widgets.get(widgetId);
      if (widget) {
        widget.nextRefresh = null;
      }
    }
  }
  
  /**
   * Refresh a specific widget
   */
  async refreshWidget(widgetId, source = 'manual') {
    const widget = this.widgets.get(widgetId);
    if (!widget || widget.isRefreshing) {
      return { success: false, error: 'Widget not found or already refreshing' };
    }
    
    const startTime = Date.now();
    widget.isRefreshing = true;
    widget.status = 'refreshing';
    widget.error = null;
    
    console.log(`🔄 Refreshing widget: ${widget.name} (source: ${source})`);
    
    try {
      // Check dependencies
      const dependenciesReady = await this.checkDependencies(widget.dependencies);
      if (!dependenciesReady) {
        throw new Error('Dependencies not ready');
      }
      
      // Execute refresh function
      const result = await widget.refreshFunction();
      
      const refreshTime = Date.now() - startTime;
      widget.lastRefresh = Date.now();
      widget.refreshCount += 1;
      widget.averageRefreshTime = 
        (widget.averageRefreshTime * (widget.refreshCount - 1) + refreshTime) / widget.refreshCount;
      widget.status = 'success';
      
      // Update global stats
      this.refreshStats.totalRefreshes += 1;
      this.refreshStats.successfulRefreshes += 1;
      this.refreshStats.averageRefreshTime = 
        (this.refreshStats.averageRefreshTime * (this.refreshStats.totalRefreshes - 1) + refreshTime) / this.refreshStats.totalRefreshes;
      
      // Schedule next refresh
      if (widget.pattern !== 'manual') {
        this.scheduleWidgetRefresh(widgetId);
      }
      
      console.log(`✅ Widget refreshed: ${widget.name} (${refreshTime}ms)`);
      return { success: true, refreshTime, result };
      
    } catch (error) {
      console.error(`❌ Widget refresh failed: ${widget.name}`, error);
      
      widget.error = error.message;
      widget.status = 'error';
      
      this.refreshStats.totalRefreshes += 1;
      this.refreshStats.failedRefreshes += 1;
      
      // Retry logic based on priority
      const priorityConfig = this.priorityLevels[widget.priority];
      if (widget.refreshCount < priorityConfig.retryAttempts) {
        const retryDelay = Math.pow(2, widget.refreshCount) * 1000; // Exponential backoff
        setTimeout(() => {
          this.refreshWidget(widgetId, `retry-${widget.refreshCount}`);
        }, retryDelay);
      }
      
      return { success: false, error: error.message };
      
    } finally {
      widget.isRefreshing = false;
    }
  }
  
  /**
   * Refresh multiple widgets in priority order
   */
  async refreshWidgets(widgetIds, maxConcurrent = 3) {
    const widgets = widgetIds
      .map(id => this.widgets.get(id))
      .filter(widget => widget && !widget.isRefreshing)
      .sort((a, b) => this.priorityLevels[a.priority].weight - this.priorityLevels[b.priority].weight);
    
    console.log(`🔄 Batch refreshing ${widgets.length} widgets (max concurrent: ${maxConcurrent})`);
    
    const results = [];
    for (let i = 0; i < widgets.length; i += maxConcurrent) {
      const batch = widgets.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(widget => 
        this.refreshWidget(widget.id, 'batch').catch(error => ({ success: false, error, widgetId: widget.id }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
  
  /**
   * Global dashboard refresh
   */
  async refreshAll(excludePatterns = ['manual']) {
    if (this.globalRefreshActive) {
      console.log('⚠️ Global refresh already in progress');
      return { success: false, error: 'Global refresh in progress' };
    }
    
    this.globalRefreshActive = true;
    const startTime = Date.now();
    
    console.log('🔄 Starting global dashboard refresh...');
    
    try {
      const eligibleWidgets = Array.from(this.widgets.values())
        .filter(widget => !excludePatterns.includes(widget.pattern))
        .map(widget => widget.id);
      
      const results = await this.refreshWidgets(eligibleWidgets, 4);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      const totalTime = Date.now() - startTime;
      
      this.refreshStats.lastGlobalRefresh = Date.now();
      
      console.log(`✅ Global refresh completed: ${successCount} success, ${failureCount} failed (${totalTime}ms)`);
      
      return {
        success: true,
        totalTime,
        successCount,
        failureCount,
        results
      };
      
    } catch (error) {
      console.error('❌ Global refresh failed:', error);
      return { success: false, error: error.message };
      
    } finally {
      this.globalRefreshActive = false;
    }
  }
  
  /**
   * Handle event-triggered refreshes
   */
  async handleEventTrigger(eventType, eventData) {
    const triggeredWidgets = this.eventTriggers[eventType];
    if (!triggeredWidgets) return;
    
    console.log(`⚡ Event trigger: ${eventType} -> refreshing ${triggeredWidgets.length} widgets`);
    
    const results = await this.refreshWidgets(triggeredWidgets, 2);
    return results;
  }
  
  /**
   * Check if dependencies are ready
   */
  async checkDependencies(dependencies) {
    if (!dependencies.length) return true;
    
    for (const depId of dependencies) {
      const depWidget = this.widgets.get(depId);
      if (!depWidget || depWidget.status === 'error' || depWidget.isRefreshing) {
        return false;
      }
      
      // Check if dependency is stale
      if (Date.now() - (depWidget.lastRefresh || 0) > depWidget.staleThreshold) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get widget status
   */
  getWidgetStatus(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (!widget) return null;
    
    const isStale = widget.lastRefresh && 
      (Date.now() - widget.lastRefresh) > widget.staleThreshold;
    
    return {
      id: widget.id,
      name: widget.name,
      status: widget.status,
      isRefreshing: widget.isRefreshing,
      isStale,
      lastRefresh: widget.lastRefresh,
      nextRefresh: widget.nextRefresh,
      refreshCount: widget.refreshCount,
      averageRefreshTime: widget.averageRefreshTime,
      error: widget.error
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
   * Get refresh statistics
   */
  getRefreshStats() {
    return {
      ...this.refreshStats,
      activeWidgets: this.widgets.size,
      refreshingWidgets: Array.from(this.widgets.values()).filter(w => w.isRefreshing).length,
      errorWidgets: Array.from(this.widgets.values()).filter(w => w.status === 'error').length,
      staleWidgets: Array.from(this.widgets.values()).filter(w => {
        return w.lastRefresh && (Date.now() - w.lastRefresh) > w.staleThreshold;
      }).length
    };
  }
  
  /**
   * Update widget configuration
   */
  updateWidgetConfig(widgetId, config) {
    const widget = this.widgets.get(widgetId);
    if (!widget) return false;
    
    // Update configuration
    Object.assign(widget, config);
    
    // Reschedule if pattern changed
    if (config.pattern && config.pattern !== 'manual') {
      this.cancelScheduledRefresh(widgetId);
      this.scheduleWidgetRefresh(widgetId);
    }
    
    console.log(`📊 Widget configuration updated: ${widget.name}`);
    return true;
  }
  
  /**
   * Pause/resume widget refreshes
   */
  pauseWidget(widgetId) {
    this.cancelScheduledRefresh(widgetId);
    const widget = this.widgets.get(widgetId);
    if (widget) {
      widget.status = 'paused';
    }
  }
  
  resumeWidget(widgetId) {
    const widget = this.widgets.get(widgetId);
    if (widget && widget.status === 'paused') {
      widget.status = 'idle';
      if (widget.pattern !== 'manual') {
        this.scheduleWidgetRefresh(widgetId);
      }
    }
  }
  
  /**
   * Cleanup - stop all scheduled refreshes
   */
  cleanup() {
    for (const [widgetId] of this.refreshSchedules) {
      this.cancelScheduledRefresh(widgetId);
    }
    
    // Cleanup WebSocket subscription
    if (this.webSocketCleanup) {
      this.webSocketCleanup();
      this.webSocketCleanup = null;
    }
    
    this.widgets.clear();
    console.log('📊 Dashboard refresh manager cleaned up');
  }
}

// Export singleton instance
const dashboardRefreshManager = new DashboardRefreshManager();

export default dashboardRefreshManager;