/**
 * OMNIX AI - Dynamic Widget Refresh Hook
 * MGR-028: React hook for easy widget refresh integration
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import dashboardWidgetRefreshService from '../services/dashboardWidgetRefreshService';

/**
 * Custom hook for integrating widgets with the dynamic refresh service
 * @param {Object} config - Configuration object
 * @param {string} config.widgetId - Unique identifier for the widget
 * @param {string} config.widgetName - Display name for the widget
 * @param {string} config.priority - Widget priority (high_priority, medium_priority, low_priority, background)
 * @param {Function} config.refreshCallback - Function to call when widget should refresh
 * @param {number} config.customInterval - Custom refresh interval in milliseconds (optional)
 * @param {boolean} config.autoStart - Whether to start the service automatically (default: true)
 * @param {Array<string>} config.dependencies - Array of widget IDs this widget depends on
 * @param {Function} config.conditionalRefresh - Function that returns boolean for conditional refresh
 * @param {boolean} config.enabled - Whether the widget refresh is enabled (default: true)
 * @returns {Object} Hook return object with refresh controls and status
 */
export const useDynamicRefresh = ({
  widgetId,
  widgetName,
  priority = 'medium_priority',
  refreshCallback,
  customInterval = null,
  autoStart = true,
  dependencies = [],
  conditionalRefresh = null,
  enabled = true
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [widgetStatus, setWidgetStatus] = useState('healthy');
  const isRegisteredRef = useRef(false);
  const subscriptionRef = useRef(null);

  // Create stable refresh callback
  const stableRefreshCallback = useCallback(async (widget) => {
    try {
      setIsRefreshing(true);
      setRefreshError(null);
      
      if (refreshCallback) {
        await refreshCallback(widget);
      }
      
      setRefreshCount(prev => prev + 1);
      setLastRefresh(new Date());
      
    } catch (error) {
      setRefreshError(error.message);
      throw error; // Re-throw so service can handle it
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCallback]);

  // Register widget with the service
  useEffect(() => {
    if (!widgetId || isRegisteredRef.current) return;

    const widgetConfig = {
      name: widgetName || widgetId,
      priority,
      customInterval,
      refreshCallback: stableRefreshCallback,
      enabled,
      dependencies,
      conditionalRefresh,
      metadata: {
        component: 'React',
        hookVersion: '1.0.0'
      }
    };

    dashboardWidgetRefreshService.registerWidget(widgetId, widgetConfig);
    isRegisteredRef.current = true;

    // Subscribe to widget-specific events
    subscriptionRef.current = dashboardWidgetRefreshService.subscribe((event) => {
      if (event.data.widgetId === widgetId || 
          (event.data.widget && event.data.widget.id === widgetId)) {
        
        switch (event.event) {
          case 'widget_refreshed':
            setLastRefresh(new Date(event.data.timestamp));
            break;
          case 'widget_refresh_failed':
            setRefreshError(event.data.error);
            break;
          case 'widget_optimized':
            // Widget interval was optimized
            break;
          default:
            break;
        }
      }
    });

    // Auto-start service if requested
    if (autoStart && !dashboardWidgetRefreshService.isActive) {
      dashboardWidgetRefreshService.start();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
      if (isRegisteredRef.current) {
        dashboardWidgetRefreshService.unregisterWidget(widgetId);
        isRegisteredRef.current = false;
      }
    };
  }, [
    widgetId, 
    widgetName, 
    priority, 
    customInterval, 
    enabled, 
    dependencies, 
    conditionalRefresh,
    stableRefreshCallback,
    autoStart
  ]);

  // Update widget status periodically
  useEffect(() => {
    const updateStatus = () => {
      const status = dashboardWidgetRefreshService.getWidgetStatus(widgetId);
      if (status) {
        setWidgetStatus(status.healthStatus);
        setIsRefreshing(status.isRefreshing);
        setRefreshCount(status.refreshCount);
        if (status.lastRefresh) {
          setLastRefresh(new Date(status.lastRefresh));
        }
      }
    };

    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, [widgetId]);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    return dashboardWidgetRefreshService.forceRefresh(widgetId);
  }, [widgetId]);

  // Update widget configuration
  const updateConfig = useCallback((updates) => {
    return dashboardWidgetRefreshService.updateWidgetConfig(widgetId, updates);
  }, [widgetId]);

  // Enable/disable widget refresh
  const setEnabled = useCallback((enabled) => {
    return updateConfig({ enabled });
  }, [updateConfig]);

  // Change widget priority
  const setPriority = useCallback((priority) => {
    return updateConfig({ priority });
  }, [updateConfig]);

  // Set custom refresh interval
  const setInterval = useCallback((interval) => {
    return updateConfig({ customInterval: interval });
  }, [updateConfig]);

  // Get current widget status
  const getStatus = useCallback(() => {
    return dashboardWidgetRefreshService.getWidgetStatus(widgetId);
  }, [widgetId]);

  return {
    // Status information
    isRefreshing,
    refreshCount,
    lastRefresh,
    refreshError,
    widgetStatus,
    
    // Control functions
    forceRefresh,
    updateConfig,
    setEnabled,
    setPriority,
    setInterval,
    getStatus,
    
    // Service controls
    startService: dashboardWidgetRefreshService.start.bind(dashboardWidgetRefreshService),
    stopService: dashboardWidgetRefreshService.stop.bind(dashboardWidgetRefreshService),
    
    // Computed values
    timeSinceLastRefresh: lastRefresh ? Date.now() - lastRefresh.getTime() : null,
    isServiceActive: dashboardWidgetRefreshService.isActive,
    
    // Helper functions
    formatTimeSince: (timestamp) => {
      if (!timestamp) return 'Never';
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    }
  };
};

/**
 * Simplified hook for basic refresh functionality
 * @param {string} widgetId - Unique widget identifier
 * @param {Function} refreshCallback - Function to call on refresh
 * @param {Object} options - Optional configuration
 */
export const useBasicRefresh = (widgetId, refreshCallback, options = {}) => {
  return useDynamicRefresh({
    widgetId,
    refreshCallback,
    widgetName: options.name || widgetId,
    priority: options.priority || 'medium_priority',
    customInterval: options.interval,
    enabled: options.enabled !== false,
    ...options
  });
};

/**
 * Hook for high-priority widgets that need frequent updates
 */
export const useHighPriorityRefresh = (widgetId, refreshCallback, options = {}) => {
  return useDynamicRefresh({
    widgetId,
    refreshCallback,
    priority: 'high_priority',
    ...options
  });
};

/**
 * Hook for low-priority widgets that can refresh less frequently
 */
export const useLowPriorityRefresh = (widgetId, refreshCallback, options = {}) => {
  return useDynamicRefresh({
    widgetId,
    refreshCallback,
    priority: 'low_priority',
    ...options
  });
};

/**
 * Hook for conditional refresh based on user activity or business hours
 */
export const useConditionalRefresh = (widgetId, refreshCallback, condition, options = {}) => {
  return useDynamicRefresh({
    widgetId,
    refreshCallback,
    conditionalRefresh: condition,
    ...options
  });
};

/**
 * Hook that provides only service-level controls (no widget registration)
 */
export const useDynamicRefreshService = () => {
  const [serviceStats, setServiceStats] = useState({});
  const [isActive, setIsActive] = useState(dashboardWidgetRefreshService.isActive);

  useEffect(() => {
    const updateStats = () => {
      setServiceStats(dashboardWidgetRefreshService.getServiceStats());
      setIsActive(dashboardWidgetRefreshService.isActive);
    };

    const subscription = dashboardWidgetRefreshService.subscribe((event) => {
      if (event.event === 'service_started' || event.event === 'service_stopped') {
        updateStats();
      }
    });

    const interval = setInterval(updateStats, 5000);
    updateStats(); // Initial load

    return () => {
      subscription();
      clearInterval(interval);
    };
  }, []);

  return {
    serviceStats,
    isActive,
    start: dashboardWidgetRefreshService.start.bind(dashboardWidgetRefreshService),
    stop: dashboardWidgetRefreshService.stop.bind(dashboardWidgetRefreshService),
    optimize: dashboardWidgetRefreshService.optimizeRefreshIntervals.bind(dashboardWidgetRefreshService),
    getWidgetStatuses: dashboardWidgetRefreshService.getAllWidgetStatuses.bind(dashboardWidgetRefreshService)
  };
};

export default useDynamicRefresh;