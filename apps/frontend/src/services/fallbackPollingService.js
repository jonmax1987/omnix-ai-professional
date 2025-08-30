/**
 * OMNIX AI - Fallback Polling Service
 * REST API polling service for when WebSocket is unavailable
 */

import useUserStore from '../store/userStore';
import { useNotificationStore } from '../store/notificationStore';

class FallbackPollingService {
  constructor() {
    this.isActive = false;
    this.intervals = new Map();
    this.lastPolled = new Map();
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    
    // Polling configurations for different data types
    this.pollingConfig = {
      notifications: {
        endpoint: '/notifications/poll',
        interval: 15000, // 15 seconds
        priority: 'high'
      },
      inventory: {
        endpoint: '/inventory/live',
        interval: 30000, // 30 seconds
        priority: 'medium'
      },
      customerActivity: {
        endpoint: '/customer-activity/recent',
        interval: 45000, // 45 seconds
        priority: 'medium'
      },
      orders: {
        endpoint: '/orders/status-updates',
        interval: 20000, // 20 seconds
        priority: 'high'
      },
      pricing: {
        endpoint: '/products/price-updates',
        interval: 60000, // 1 minute
        priority: 'low'
      },
      systemAlerts: {
        endpoint: '/system/alerts',
        interval: 30000, // 30 seconds
        priority: 'high'
      }
    };
  }

  /**
   * Start fallback polling for specified data types
   */
  start(dataTypes = Object.keys(this.pollingConfig)) {
    if (this.isActive) {
      console.log('Fallback Polling: Already active');
      return;
    }

    console.log('Fallback Polling: Disabled - API endpoints not available yet');
    console.log('Fallback Polling: Would start for data types:', dataTypes);
    
    // TODO: Enable when backend endpoints are implemented
    // this.isActive = true;
    // dataTypes.forEach(dataType => {
    //   if (this.pollingConfig[dataType]) {
    //     this.startPollingForType(dataType);
    //   }
    // });

    // Emit start event (for compatibility)
    this.emitEvent('fallback_started', { dataTypes: [] });
  }

  /**
   * Stop all fallback polling
   */
  stop() {
    if (!this.isActive) return;

    console.log('Fallback Polling: Stopping all polling');
    this.isActive = false;

    // Clear all intervals
    this.intervals.forEach((intervalId, dataType) => {
      clearInterval(intervalId);
      console.log(`Fallback Polling: Stopped polling for ${dataType}`);
    });

    this.intervals.clear();
    this.lastPolled.clear();
    this.retryAttempts.clear();

    // Emit stop event
    this.emitEvent('fallback_stopped', {});
  }

  /**
   * Start polling for a specific data type
   */
  startPollingForType(dataType) {
    const config = this.pollingConfig[dataType];
    if (!config) return;

    // Clear existing interval if any
    if (this.intervals.has(dataType)) {
      clearInterval(this.intervals.get(dataType));
    }

    // Initial poll
    this.pollData(dataType);

    // Set up recurring polling
    const intervalId = setInterval(() => {
      this.pollData(dataType);
    }, config.interval);

    this.intervals.set(dataType, intervalId);
    console.log(`Fallback Polling: Started polling ${dataType} every ${config.interval}ms`);
  }

  /**
   * Poll data for a specific type
   */
  async pollData(dataType) {
    const config = this.pollingConfig[dataType];
    if (!config || !this.isActive) return;

    try {
      const lastPolledTime = this.lastPolled.get(dataType) || 0;
      const url = `${this.apiBaseUrl}${config.endpoint}?since=${lastPolledTime}`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process the data
      await this.processPolledData(dataType, data);
      
      // Update last polled time
      this.lastPolled.set(dataType, Date.now());
      
      // Reset retry count on success
      this.retryAttempts.set(dataType, 0);
      
      console.log(`Fallback Polling: Successfully polled ${dataType}`, data);

    } catch (error) {
      console.error(`Fallback Polling: Error polling ${dataType}:`, error);
      
      // Handle retry logic
      const retries = this.retryAttempts.get(dataType) || 0;
      if (retries < this.maxRetries) {
        this.retryAttempts.set(dataType, retries + 1);
        
        // Exponential backoff retry
        setTimeout(() => {
          if (this.isActive) this.pollData(dataType);
        }, Math.pow(2, retries) * 1000);
      } else {
        console.error(`Fallback Polling: Max retries reached for ${dataType}`);
        this.emitEvent('polling_failed', { dataType, error: error.message });
      }
    }
  }

  /**
   * Process polled data based on type
   */
  async processPolledData(dataType, data) {
    if (!data || !data.items) return;

    switch (dataType) {
      case 'notifications':
        this.processNotifications(data.items);
        break;
      case 'inventory':
        this.processInventoryUpdates(data.items);
        break;
      case 'customerActivity':
        this.processCustomerActivity(data.items);
        break;
      case 'orders':
        this.processOrderUpdates(data.items);
        break;
      case 'pricing':
        this.processPricingUpdates(data.items);
        break;
      case 'systemAlerts':
        this.processSystemAlerts(data.items);
        break;
      default:
        console.warn(`Fallback Polling: Unknown data type: ${dataType}`);
    }

    // Emit generic data event
    this.emitEvent('fallback_data_received', { dataType, items: data.items });
  }

  /**
   * Process notifications from polling
   */
  processNotifications(notifications) {
    const notificationStore = useNotificationStore.getState();
    
    notifications.forEach(notification => {
      notificationStore.addNotification({
        ...notification,
        source: 'fallback_polling',
        timestamp: notification.timestamp || Date.now()
      });
    });

    console.log(`Fallback Polling: Processed ${notifications.length} notifications`);
  }

  /**
   * Process inventory updates from polling
   */
  processInventoryUpdates(inventoryItems) {
    inventoryItems.forEach(item => {
      this.emitEvent('inventory_update_fallback', item);
    });

    console.log(`Fallback Polling: Processed ${inventoryItems.length} inventory updates`);
  }

  /**
   * Process customer activity from polling
   */
  processCustomerActivity(activities) {
    activities.forEach(activity => {
      this.emitEvent('customer_activity_fallback', activity);
    });

    console.log(`Fallback Polling: Processed ${activities.length} customer activities`);
  }

  /**
   * Process order updates from polling
   */
  processOrderUpdates(orders) {
    orders.forEach(order => {
      this.emitEvent('order_update_fallback', order);
    });

    console.log(`Fallback Polling: Processed ${orders.length} order updates`);
  }

  /**
   * Process pricing updates from polling
   */
  processPricingUpdates(priceUpdates) {
    priceUpdates.forEach(update => {
      this.emitEvent('price_update_fallback', update);
    });

    console.log(`Fallback Polling: Processed ${priceUpdates.length} price updates`);
  }

  /**
   * Process system alerts from polling
   */
  processSystemAlerts(alerts) {
    alerts.forEach(alert => {
      this.emitEvent('system_alert_fallback', alert);
      
      // Show critical alerts immediately
      if (alert.priority === 'critical') {
        const notificationStore = useNotificationStore.getState();
        notificationStore.addNotification({
          id: `alert_${alert.id}`,
          title: alert.title,
          body: alert.message,
          type: 'system_alert',
          priority: 'high',
          persistent: true,
          source: 'fallback_polling'
        });
      }
    });

    console.log(`Fallback Polling: Processed ${alerts.length} system alerts`);
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders() {
    const userStore = useUserStore.getState();
    return {
      'Authorization': `Bearer ${userStore.token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Emit custom events for components to listen to
   */
  emitEvent(eventType, data) {
    window.dispatchEvent(new CustomEvent(`fallback_${eventType}`, {
      detail: { ...data, timestamp: Date.now() }
    }));
  }

  /**
   * Adjust polling intervals based on priority and network conditions
   */
  adjustPollingIntervals(networkCondition = 'normal') {
    const multipliers = {
      excellent: 0.8,
      good: 1.0,
      fair: 1.5,
      poor: 2.0
    };

    const multiplier = multipliers[networkCondition] || 1.0;

    Object.keys(this.pollingConfig).forEach(dataType => {
      const config = this.pollingConfig[dataType];
      const baseInterval = this.getBaseInterval(dataType);
      config.interval = Math.round(baseInterval * multiplier);
      
      // Restart polling with new interval if active
      if (this.intervals.has(dataType)) {
        this.startPollingForType(dataType);
      }
    });

    console.log(`Fallback Polling: Adjusted intervals for ${networkCondition} network`);
  }

  /**
   * Get base interval for a data type
   */
  getBaseInterval(dataType) {
    const baseIntervals = {
      notifications: 15000,
      inventory: 30000,
      customerActivity: 45000,
      orders: 20000,
      pricing: 60000,
      systemAlerts: 30000
    };
    return baseIntervals[dataType] || 30000;
  }

  /**
   * Get current polling status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      activePolls: Array.from(this.intervals.keys()),
      lastPolled: Object.fromEntries(this.lastPolled),
      retryAttempts: Object.fromEntries(this.retryAttempts),
      pollingIntervals: Object.fromEntries(
        Object.entries(this.pollingConfig).map(([key, config]) => [key, config.interval])
      )
    };
  }

  /**
   * Force immediate poll for specific data type
   */
  forcePoll(dataType) {
    if (!this.pollingConfig[dataType]) {
      console.warn(`Fallback Polling: Unknown data type: ${dataType}`);
      return;
    }

    console.log(`Fallback Polling: Force polling ${dataType}`);
    this.pollData(dataType);
  }

  /**
   * Add custom polling configuration
   */
  addCustomPolling(dataType, config) {
    this.pollingConfig[dataType] = {
      endpoint: config.endpoint,
      interval: config.interval || 30000,
      priority: config.priority || 'medium'
    };

    if (this.isActive) {
      this.startPollingForType(dataType);
    }

    console.log(`Fallback Polling: Added custom polling for ${dataType}`);
  }

  /**
   * Remove polling for a specific data type
   */
  removePolling(dataType) {
    if (this.intervals.has(dataType)) {
      clearInterval(this.intervals.get(dataType));
      this.intervals.delete(dataType);
    }

    this.lastPolled.delete(dataType);
    this.retryAttempts.delete(dataType);
    delete this.pollingConfig[dataType];

    console.log(`Fallback Polling: Removed polling for ${dataType}`);
  }
}

// Create singleton instance
export const fallbackPollingService = new FallbackPollingService();
export default fallbackPollingService;