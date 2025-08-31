/**
 * OMNIX AI - Real-time Alert Service
 * MGR-026: Real-time alert notifications
 * Comprehensive alert management with real-time notifications
 */

import { toast } from 'react-hot-toast';

class AlertService {
  constructor() {
    this.alerts = new Map();
    this.alertHistory = [];
    this.subscribers = new Set();
    this.alertQueue = [];
    this.config = {
      maxAlerts: 100,
      maxHistorySize: 500,
      autoCleanupInterval: 300000, // 5 minutes
      priorityLevels: {
        critical: { weight: 4, color: '#ef4444', persistTime: 0 }, // Never auto-dismiss
        high: { weight: 3, color: '#f59e0b', persistTime: 30000 }, // 30 seconds
        medium: { weight: 2, color: '#3b82f6', persistTime: 15000 }, // 15 seconds
        low: { weight: 1, color: '#10b981', persistTime: 10000 }, // 10 seconds
        info: { weight: 0, color: '#6b7280', persistTime: 8000 } // 8 seconds
      },
      categories: {
        inventory: 'Inventory Management',
        sales: 'Sales & Revenue',
        customer: 'Customer Activity', 
        system: 'System Status',
        performance: 'Performance',
        security: 'Security',
        supplier: 'Supplier Updates',
        cost: 'Cost Optimization'
      }
    };

    this.initializeAlertProcessing();
    this.setupPeriodicCleanup();
  }

  /**
   * Initialize alert processing system
   */
  initializeAlertProcessing() {
    // Process alert queue every 100ms
    this.processingInterval = setInterval(() => {
      this.processAlertQueue();
    }, 100);

    // Auto-dismiss expired alerts
    this.dismissalInterval = setInterval(() => {
      this.processDismissals();
    }, 1000);
  }

  /**
   * Add a new alert to the system
   */
  addAlert(alert) {
    const enrichedAlert = this.enrichAlert(alert);
    
    // Add to queue for processing
    this.alertQueue.push(enrichedAlert);
    
    // Immediately notify subscribers for critical alerts
    if (enrichedAlert.priority === 'critical') {
      this.processAlert(enrichedAlert);
    }

    return enrichedAlert.id;
  }

  /**
   * Enrich alert with metadata and processing information
   */
  enrichAlert(alert) {
    const now = new Date();
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      timestamp: now.toISOString(),
      ...alert,
      priority: alert.priority || 'medium',
      category: alert.category || 'system',
      source: alert.source || 'system',
      acknowledged: false,
      dismissed: false,
      expiresAt: alert.priority === 'critical' ? null : 
                 new Date(now.getTime() + this.config.priorityLevels[alert.priority || 'medium'].persistTime).toISOString(),
      metadata: {
        ...alert.metadata,
        processingTime: now.toISOString(),
        alertVersion: '1.0',
        deviceInfo: this.getDeviceInfo()
      }
    };
  }

  /**
   * Process alert queue
   */
  processAlertQueue() {
    if (this.alertQueue.length === 0) return;

    // Process up to 5 alerts per cycle to avoid overwhelming
    const alertsToProcess = this.alertQueue.splice(0, 5);
    
    alertsToProcess.forEach(alert => {
      this.processAlert(alert);
    });
  }

  /**
   * Process individual alert
   */
  processAlert(alert) {
    // Check for duplicates
    if (this.isDuplicateAlert(alert)) {
      this.handleDuplicateAlert(alert);
      return;
    }

    // Add to active alerts
    this.alerts.set(alert.id, alert);
    
    // Add to history
    this.alertHistory.unshift({
      ...alert,
      processedAt: new Date().toISOString()
    });

    // Trim history if needed
    if (this.alertHistory.length > this.config.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(0, this.config.maxHistorySize);
    }

    // Show visual notification
    this.showNotification(alert);

    // Notify subscribers
    this.notifySubscribers('alert_added', alert);

    // Trigger custom handlers
    this.triggerAlertHandlers(alert);
  }

  /**
   * Check if alert is duplicate
   */
  isDuplicateAlert(newAlert) {
    const timeWindow = 60000; // 1 minute
    const cutoffTime = new Date(Date.now() - timeWindow);
    
    return Array.from(this.alerts.values()).some(existingAlert => {
      return existingAlert.message === newAlert.message &&
             existingAlert.category === newAlert.category &&
             new Date(existingAlert.timestamp) > cutoffTime;
    });
  }

  /**
   * Handle duplicate alerts by updating the existing one
   */
  handleDuplicateAlert(newAlert) {
    const existing = Array.from(this.alerts.values()).find(alert => 
      alert.message === newAlert.message && alert.category === newAlert.category
    );
    
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      existing.lastOccurrence = newAlert.timestamp;
      this.notifySubscribers('alert_updated', existing);
    }
  }

  /**
   * Show visual notification
   */
  showNotification(alert) {
    const priorityConfig = this.config.priorityLevels[alert.priority];
    
    const toastOptions = {
      duration: alert.priority === 'critical' ? Infinity : priorityConfig.persistTime,
      position: 'top-right',
      style: {
        background: alert.priority === 'critical' ? '#fef2f2' : 
                   alert.priority === 'high' ? '#fffbeb' :
                   alert.priority === 'medium' ? '#eff6ff' : '#f0fdf4',
        color: priorityConfig.color,
        border: `1px solid ${priorityConfig.color}20`,
        borderLeft: `4px solid ${priorityConfig.color}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: this.getAlertIcon(alert),
    };

    // Show toast notification
    if (alert.priority === 'critical') {
      toast.error(`🚨 ${alert.title}: ${alert.message}`, toastOptions);
    } else if (alert.priority === 'high') {
      toast(`⚠️ ${alert.title}: ${alert.message}`, toastOptions);
    } else if (alert.priority === 'medium') {
      toast(`ℹ️ ${alert.title}: ${alert.message}`, toastOptions);
    } else {
      toast.success(`✅ ${alert.title}: ${alert.message}`, toastOptions);
    }
  }

  /**
   * Get appropriate icon for alert category
   */
  getAlertIcon(alert) {
    const icons = {
      inventory: '📦',
      sales: '💰',
      customer: '👥',
      system: '⚙️',
      performance: '📊',
      security: '🔒',
      supplier: '🚛',
      cost: '💰'
    };
    return icons[alert.category] || '🔔';
  }

  /**
   * Process alert dismissals
   */
  processDismissals() {
    const now = new Date();
    const expiredAlerts = [];

    this.alerts.forEach((alert, id) => {
      if (alert.expiresAt && new Date(alert.expiresAt) <= now) {
        expiredAlerts.push(id);
      }
    });

    expiredAlerts.forEach(id => {
      this.dismissAlert(id, 'expired');
    });
  }

  /**
   * Dismiss an alert
   */
  dismissAlert(alertId, reason = 'user') {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.dismissed = true;
    alert.dismissedAt = new Date().toISOString();
    alert.dismissalReason = reason;

    // Remove from active alerts
    this.alerts.delete(alertId);

    // Update in history
    const historyIndex = this.alertHistory.findIndex(h => h.id === alertId);
    if (historyIndex !== -1) {
      this.alertHistory[historyIndex] = { ...alert };
    }

    this.notifySubscribers('alert_dismissed', alert);
    return true;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId, userId = null) {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = userId;

    this.notifySubscribers('alert_acknowledged', alert);
    return true;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(filters = {}) {
    let alerts = Array.from(this.alerts.values());

    // Apply filters
    if (filters.priority) {
      alerts = alerts.filter(alert => alert.priority === filters.priority);
    }
    if (filters.category) {
      alerts = alerts.filter(alert => alert.category === filters.category);
    }
    if (filters.acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === filters.acknowledged);
    }

    // Sort by priority and timestamp
    return alerts.sort((a, b) => {
      const priorityDiff = this.config.priorityLevels[b.priority].weight - 
                          this.config.priorityLevels[a.priority].weight;
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit = 50, filters = {}) {
    let history = [...this.alertHistory];

    // Apply filters
    if (filters.category) {
      history = history.filter(alert => alert.category === filters.category);
    }
    if (filters.priority) {
      history = history.filter(alert => alert.priority === filters.priority);
    }
    if (filters.timeRange) {
      const { start, end } = filters.timeRange;
      history = history.filter(alert => {
        const alertTime = new Date(alert.timestamp);
        return alertTime >= start && alertTime <= end;
      });
    }

    return history.slice(0, limit);
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(timeRange = 24) { // hours
    const cutoffTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
    const recentAlerts = this.alertHistory.filter(alert => 
      new Date(alert.timestamp) > cutoffTime
    );

    const stats = {
      total: recentAlerts.length,
      byPriority: {},
      byCategory: {},
      acknowledged: recentAlerts.filter(a => a.acknowledged).length,
      dismissed: recentAlerts.filter(a => a.dismissed).length,
      averageResponseTime: 0
    };

    // Count by priority and category
    Object.keys(this.config.priorityLevels).forEach(priority => {
      stats.byPriority[priority] = recentAlerts.filter(a => a.priority === priority).length;
    });

    Object.keys(this.config.categories).forEach(category => {
      stats.byCategory[category] = recentAlerts.filter(a => a.category === category).length;
    });

    // Calculate average response time for acknowledged alerts
    const acknowledgedAlerts = recentAlerts.filter(a => a.acknowledged && a.acknowledgedAt);
    if (acknowledgedAlerts.length > 0) {
      const totalResponseTime = acknowledgedAlerts.reduce((sum, alert) => {
        return sum + (new Date(alert.acknowledgedAt) - new Date(alert.timestamp));
      }, 0);
      stats.averageResponseTime = totalResponseTime / acknowledgedAlerts.length / 1000; // in seconds
    }

    return stats;
  }

  /**
   * Subscribe to alert events
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers
   */
  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback({ event, data, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Alert subscriber error:', error);
      }
    });
  }

  /**
   * Trigger custom alert handlers
   */
  triggerAlertHandlers(alert) {
    // Critical alerts may trigger additional actions
    if (alert.priority === 'critical') {
      this.handleCriticalAlert(alert);
    }

    // Category-specific handlers
    switch (alert.category) {
      case 'inventory':
        this.handleInventoryAlert(alert);
        break;
      case 'security':
        this.handleSecurityAlert(alert);
        break;
      case 'system':
        this.handleSystemAlert(alert);
        break;
    }
  }

  /**
   * Handle critical alerts
   */
  handleCriticalAlert(alert) {
    // Could trigger escalation processes, external notifications, etc.
    console.warn('🚨 Critical Alert Triggered:', alert);
    
    // Store critical alert separately for escalation tracking
    const criticalAlerts = JSON.parse(localStorage.getItem('critical_alerts') || '[]');
    criticalAlerts.unshift({
      ...alert,
      escalated: false,
      escalationTime: null
    });
    
    // Keep only last 10 critical alerts
    localStorage.setItem('critical_alerts', JSON.stringify(criticalAlerts.slice(0, 10)));
  }

  /**
   * Handle inventory-specific alerts
   */
  handleInventoryAlert(alert) {
    // Could trigger automatic reorder processes, supplier notifications, etc.
    if (alert.metadata?.stockLevel !== undefined && alert.metadata.stockLevel === 0) {
      // Out of stock - could trigger emergency restocking
      this.addAlert({
        title: 'Emergency Restocking Required',
        message: `${alert.metadata.itemName || 'Item'} is completely out of stock`,
        priority: 'critical',
        category: 'inventory',
        source: 'inventory_monitor',
        metadata: { ...alert.metadata, autoGenerated: true }
      });
    }
  }

  /**
   * Handle security alerts
   */
  handleSecurityAlert(alert) {
    // Could trigger security protocols, logging, etc.
    console.warn('🔒 Security Alert:', alert);
  }

  /**
   * Handle system alerts
   */
  handleSystemAlert(alert) {
    // Could trigger system monitoring, health checks, etc.
    if (alert.priority === 'critical') {
      console.error('⚠️ System Critical:', alert);
    }
  }

  /**
   * Setup periodic cleanup
   */
  setupPeriodicCleanup() {
    setInterval(() => {
      this.performCleanup();
    }, this.config.autoCleanupInterval);
  }

  /**
   * Perform cleanup of old alerts and data
   */
  performCleanup() {
    // Clean up expired alerts that weren't properly dismissed
    const now = new Date();
    const expiredAlerts = [];

    this.alerts.forEach((alert, id) => {
      if (alert.expiresAt && new Date(alert.expiresAt) <= now) {
        expiredAlerts.push(id);
      }
    });

    expiredAlerts.forEach(id => {
      this.dismissAlert(id, 'cleanup');
    });

    // Trim alert history if it's too large
    if (this.alertHistory.length > this.config.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(0, this.config.maxHistorySize);
    }

    // Clean up critical alerts from localStorage
    try {
      const criticalAlerts = JSON.parse(localStorage.getItem('critical_alerts') || '[]');
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentCritical = criticalAlerts.filter(alert => 
        new Date(alert.timestamp) > oneWeekAgo
      );
      localStorage.setItem('critical_alerts', JSON.stringify(recentCritical));
    } catch (error) {
      console.error('Failed to clean up critical alerts:', error);
    }
  }

  /**
   * Get device information for context
   */
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenSize: `${screen.width}x${screen.height}`
    };
  }

  /**
   * Export alerts for reporting or backup
   */
  exportAlerts(format = 'json') {
    const exportData = {
      timestamp: new Date().toISOString(),
      activeAlerts: Array.from(this.alerts.values()),
      alertHistory: this.alertHistory,
      statistics: this.getAlertStatistics(168) // 1 week
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    // Could add CSV, XML, etc. formats here
    return exportData;
  }

  /**
   * Destroy the alert service
   */
  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    if (this.dismissalInterval) {
      clearInterval(this.dismissalInterval);
    }
    
    this.alerts.clear();
    this.subscribers.clear();
    this.alertQueue = [];
    this.alertHistory = [];
  }
}

// Create and export singleton instance
const alertService = new AlertService();

// Helper functions for common alert types
export const createInventoryAlert = (itemName, stockLevel, threshold, priority = 'medium') => {
  return alertService.addAlert({
    title: 'Inventory Alert',
    message: `${itemName} stock is ${stockLevel <= 0 ? 'out of stock' : `low (${stockLevel} remaining)`}`,
    priority: stockLevel <= 0 ? 'critical' : priority,
    category: 'inventory',
    source: 'inventory_monitor',
    metadata: { itemName, stockLevel, threshold }
  });
};

export const createSalesAlert = (message, amount, priority = 'info') => {
  return alertService.addAlert({
    title: 'Sales Update',
    message,
    priority,
    category: 'sales',
    source: 'sales_monitor',
    metadata: { amount }
  });
};

export const createCustomerAlert = (message, customerId, priority = 'medium') => {
  return alertService.addAlert({
    title: 'Customer Activity',
    message,
    priority,
    category: 'customer',
    source: 'customer_monitor',
    metadata: { customerId }
  });
};

export const createSystemAlert = (message, priority = 'high') => {
  return alertService.addAlert({
    title: 'System Alert',
    message,
    priority,
    category: 'system',
    source: 'system_monitor'
  });
};

export default alertService;