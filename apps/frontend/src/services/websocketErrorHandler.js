/**
 * OMNIX AI - WebSocket Error Handling and Fallback Service
 * Comprehensive error recovery and fallback mechanisms
 */

import { useNotificationStore } from '../store/notificationStore';
import useUserStore from '../store/userStore';
import { fallbackPollingService } from './fallbackPollingService';
import { ERROR_TYPES, CONNECTION_STATES } from '../types/websocket';

class WebSocketErrorHandler {
  constructor() {
    this.fallbackPollingInterval = 30000; // 30 seconds
    this.fallbackTimer = null;
    this.isUsingFallback = false;
    this.errorThreshold = 3;
    this.errorCount = 0;
    this.lastErrorTime = null;
    this.circuitBreakerTimeout = 60000; // 1 minute
    this.isCircuitBreakerOpen = false;
    this.fallbackEndpoints = {
      notifications: '/api/v1/notifications/poll',
      inventory: '/api/v1/inventory/poll',
      activity: '/api/v1/activity/poll'
    };
    this.webSocketManager = null; // Will be set later to avoid circular dependency
  }

  /**
   * Initialize error handling listeners
   * Called after webSocketManager is available
   */
  initialize(webSocketManager) {
    this.webSocketManager = webSocketManager;
    this.setupErrorHandling();
  }

  /**
   * Set up error handling listeners
   */
  setupErrorHandling() {
    if (!this.webSocketManager) {
      console.warn('WebSocket Error Handler: WebSocketManager not available yet');
      return;
    }

    // Listen to WebSocket errors
    this.webSocketManager.subscribe('error', this.handleWebSocketError.bind(this));
    this.webSocketManager.subscribe('disconnection', this.handleDisconnection.bind(this));
    this.webSocketManager.subscribe('auth_failed', this.handleAuthFailure.bind(this));
    this.webSocketManager.subscribe('state_change', this.handleStateChange.bind(this));
    
    // Network monitoring
    window.addEventListener('online', this.handleNetworkOnline.bind(this));
    window.addEventListener('offline', this.handleNetworkOffline.bind(this));
    
    // Monitor connection quality
    this.monitorConnectionQuality();
  }

  /**
   * Handle WebSocket connection errors
   */
  handleWebSocketError(errorData) {
    console.error('WebSocket Error Handler: Error detected', errorData);
    
    this.errorCount++;
    this.lastErrorTime = Date.now();
    
    // Categorize error type
    const errorType = this.categorizeError(errorData.error);
    
    // Apply error-specific handling
    switch (errorType) {
      case ERROR_TYPES.CONNECTION_FAILED:
        this.handleConnectionFailure(errorData);
        break;
      case ERROR_TYPES.AUTHENTICATION_FAILED:
        this.handleAuthFailure(errorData);
        break;
      case ERROR_TYPES.RATE_LIMIT_EXCEEDED:
        this.handleRateLimit(errorData);
        break;
      case ERROR_TYPES.SERVER_ERROR:
        this.handleServerError(errorData);
        break;
      case ERROR_TYPES.TIMEOUT:
        this.handleTimeout(errorData);
        break;
      default:
        this.handleGenericError(errorData);
    }
    
    // Check if circuit breaker should open
    this.evaluateCircuitBreaker();
  }

  /**
   * Handle disconnection events
   */
  handleDisconnection(data) {
    console.log('WebSocket Error Handler: Disconnection detected', data);
    
    // If not a normal closure, consider it an error
    if (data.code !== 1000) {
      this.errorCount++;
      
      // Start fallback if multiple failures
      if (this.errorCount >= this.errorThreshold) {
        this.activateFallbackMode();
      }
    }
  }

  /**
   * Handle authentication failures
   */
  handleAuthFailure(data) {
    console.error('WebSocket Error Handler: Authentication failed', data);
    
    // Clear stored auth and redirect to login
    this.clearAuthAndRedirect();
    
    // Show user-friendly error
    this.showErrorNotification({
      type: 'auth_error',
      title: 'Session Expired',
      message: 'Please log in again to continue receiving updates',
      action: 'Redirect to Login'
    });
  }

  /**
   * Handle network state changes
   */
  handleNetworkOnline() {
    console.log('WebSocket Error Handler: Network online detected');
    
    if (this.isUsingFallback) {
      // Attempt to restore WebSocket connection
      this.attemptConnectionRestore();
    }
  }

  handleNetworkOffline() {
    console.log('WebSocket Error Handler: Network offline detected');
    
    // Activate offline mode
    this.activateOfflineMode();
  }

  /**
   * Handle WebSocket state changes
   */
  handleStateChange(data) {
    if (data.state === CONNECTION_STATES.CONNECTED) {
      // Connection restored
      this.handleConnectionRestored();
    } else if (data.state === CONNECTION_STATES.FAILED) {
      // Connection completely failed
      this.activateFallbackMode();
    }
  }

  /**
   * Categorize error for appropriate handling
   */
  categorizeError(error) {
    if (!error) return ERROR_TYPES.SERVER_ERROR;
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('connection')) {
      return ERROR_TYPES.CONNECTION_FAILED;
    } else if (message.includes('auth') || message.includes('token')) {
      return ERROR_TYPES.AUTHENTICATION_FAILED;
    } else if (message.includes('rate') || message.includes('limit')) {
      return ERROR_TYPES.RATE_LIMIT_EXCEEDED;
    } else if (message.includes('timeout')) {
      return ERROR_TYPES.TIMEOUT;
    } else {
      return ERROR_TYPES.SERVER_ERROR;
    }
  }

  /**
   * Handle connection failure
   */
  handleConnectionFailure(errorData) {
    console.log('WebSocket Error Handler: Handling connection failure');
    
    // Check if we should activate fallback
    if (this.shouldActivateFallback()) {
      this.activateFallbackMode();
    }
    
    // Show connection error notification
    this.showErrorNotification({
      type: 'connection_error',
      title: 'Connection Issues',
      message: 'Using backup connection for updates',
      priority: 'medium'
    });
  }

  /**
   * Handle rate limiting
   */
  handleRateLimit(errorData) {
    console.log('WebSocket Error Handler: Rate limit detected');
    
    // Increase polling interval to respect rate limits
    this.fallbackPollingInterval = Math.min(this.fallbackPollingInterval * 2, 300000); // Max 5 minutes
    
    this.showErrorNotification({
      type: 'rate_limit',
      title: 'Reduced Update Frequency',
      message: 'Updates will be less frequent to respect server limits',
      priority: 'low'
    });
  }

  /**
   * Handle server errors
   */
  handleServerError(errorData) {
    console.error('WebSocket Error Handler: Server error detected');
    
    // If server errors persist, use fallback
    if (this.errorCount >= 2) {
      this.activateFallbackMode();
    }
  }

  /**
   * Handle timeout errors
   */
  handleTimeout(errorData) {
    console.log('WebSocket Error Handler: Timeout detected');
    
    // Timeouts might indicate poor connection quality
    this.activateFallbackMode();
  }

  /**
   * Handle generic errors
   */
  handleGenericError(errorData) {
    console.error('WebSocket Error Handler: Generic error', errorData);
    
    // Log for debugging
    this.logErrorForAnalytics(errorData);
  }

  /**
   * Activate fallback polling mode
   */
  activateFallbackMode() {
    if (this.isUsingFallback) return;
    
    console.log('WebSocket Error Handler: Activating fallback mode');
    this.isUsingFallback = true;
    
    // Start fallback polling service
    fallbackPollingService.start(['notifications', 'inventory', 'customerActivity', 'orders', 'systemAlerts']);
    
    // Notify user
    this.showErrorNotification({
      type: 'fallback_mode',
      title: 'Backup Mode Active',
      message: 'Using alternative method for real-time updates',
      priority: 'medium',
      persistent: true
    });
    
    // Update connection state
    this.updateFallbackState(true);
  }

  /**
   * Start fallback polling mechanism
   */
  startFallbackPolling() {
    this.stopFallbackPolling(); // Clear existing timer
    
    this.fallbackTimer = setInterval(async () => {
      try {
        await this.pollCriticalData();
      } catch (error) {
        console.error('WebSocket Error Handler: Fallback polling failed', error);
      }
    }, this.fallbackPollingInterval);
    
    console.log(`WebSocket Error Handler: Fallback polling started (${this.fallbackPollingInterval}ms interval)`);
  }

  /**
   * Poll critical data when WebSocket is unavailable
   */
  async pollCriticalData() {
    const promises = [
      this.pollNotifications(),
      this.pollInventoryUpdates(),
      this.pollCustomerActivity()
    ];
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('WebSocket Error Handler: Critical data polling failed', error);
    }
  }

  /**
   * Poll notifications via REST API
   */
  async pollNotifications() {
    try {
      const response = await fetch(this.fallbackEndpoints.notifications, {
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        const notifications = await response.json();
        this.processFallbackNotifications(notifications);
      }
    } catch (error) {
      console.error('WebSocket Error Handler: Notification polling failed', error);
    }
  }

  /**
   * Poll inventory updates via REST API
   */
  async pollInventoryUpdates() {
    try {
      const response = await fetch(this.fallbackEndpoints.inventory, {
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        const inventory = await response.json();
        this.processFallbackInventory(inventory);
      }
    } catch (error) {
      console.error('WebSocket Error Handler: Inventory polling failed', error);
    }
  }

  /**
   * Poll customer activity via REST API
   */
  async pollCustomerActivity() {
    try {
      const response = await fetch(this.fallbackEndpoints.activity, {
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        const activity = await response.json();
        this.processFallbackActivity(activity);
      }
    } catch (error) {
      console.error('WebSocket Error Handler: Activity polling failed', error);
    }
  }

  /**
   * Process fallback notifications
   */
  processFallbackNotifications(notifications) {
    const notificationStore = useNotificationStore.getState();
    
    notifications.forEach(notification => {
      notificationStore.addNotification({
        ...notification,
        source: 'fallback_polling'
      });
    });
  }

  /**
   * Process fallback inventory data
   */
  processFallbackInventory(inventory) {
    // Emit inventory update event for components to handle
    window.dispatchEvent(new CustomEvent('fallback_inventory_update', {
      detail: inventory
    }));
  }

  /**
   * Process fallback activity data
   */
  processFallbackActivity(activity) {
    // Emit activity update event
    window.dispatchEvent(new CustomEvent('fallback_activity_update', {
      detail: activity
    }));
  }

  /**
   * Attempt to restore WebSocket connection
   */
  async attemptConnectionRestore() {
    if (this.isCircuitBreakerOpen || !this.webSocketManager) return;
    
    console.log('WebSocket Error Handler: Attempting connection restore');
    
    try {
      const success = await this.webSocketManager.connect();
      
      if (success) {
        this.handleConnectionRestored();
      }
    } catch (error) {
      console.error('WebSocket Error Handler: Connection restore failed', error);
    }
  }

  /**
   * Handle successful connection restoration
   */
  handleConnectionRestored() {
    console.log('WebSocket Error Handler: Connection restored');
    
    // Reset error state
    this.errorCount = 0;
    this.isCircuitBreakerOpen = false;
    
    // Deactivate fallback mode
    this.deactivateFallbackMode();
    
    // Show success notification
    this.showErrorNotification({
      type: 'connection_restored',
      title: 'Connection Restored',
      message: 'Real-time updates are now working normally',
      priority: 'medium',
      autoDismiss: 5000
    });
  }

  /**
   * Deactivate fallback mode
   */
  deactivateFallbackMode() {
    if (!this.isUsingFallback) return;
    
    console.log('WebSocket Error Handler: Deactivating fallback mode');
    
    this.isUsingFallback = false;
    
    // Stop fallback polling service
    fallbackPollingService.stop();
    
    this.updateFallbackState(false);
    
    // Reset polling interval
    this.fallbackPollingInterval = 30000;
  }

  /**
   * Stop fallback polling
   */
  stopFallbackPolling() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  /**
   * Evaluate if circuit breaker should open
   */
  evaluateCircuitBreaker() {
    const now = Date.now();
    const timeSinceLastError = now - (this.lastErrorTime || 0);
    
    // Open circuit breaker if too many errors in short time
    if (this.errorCount >= this.errorThreshold && timeSinceLastError < this.circuitBreakerTimeout) {
      this.openCircuitBreaker();
    }
    
    // Reset error count if enough time has passed
    if (timeSinceLastError > this.circuitBreakerTimeout) {
      this.errorCount = 0;
    }
  }

  /**
   * Open circuit breaker to prevent connection attempts
   */
  openCircuitBreaker() {
    console.log('WebSocket Error Handler: Circuit breaker opened');
    this.isCircuitBreakerOpen = true;
    
    // Close circuit breaker after timeout
    setTimeout(() => {
      this.isCircuitBreakerOpen = false;
      console.log('WebSocket Error Handler: Circuit breaker closed');
    }, this.circuitBreakerTimeout);
  }

  /**
   * Check if fallback should be activated
   */
  shouldActivateFallback() {
    return this.errorCount >= this.errorThreshold || 
           !navigator.onLine || 
           this.isCircuitBreakerOpen;
  }

  /**
   * Monitor connection quality
   */
  monitorConnectionQuality() {
    setInterval(() => {
      if (this.webSocketManager && this.webSocketManager.isConnected()) {
        // Send ping to measure latency
        const startTime = Date.now();
        this.webSocketManager.send('ping', { timestamp: startTime });
      }
    }, 60000); // Check every minute
  }

  /**
   * Activate offline mode
   */
  activateOfflineMode() {
    console.log('WebSocket Error Handler: Activating offline mode');
    
    this.showErrorNotification({
      type: 'offline_mode',
      title: 'Offline Mode',
      message: 'You are currently offline. Updates will sync when reconnected.',
      priority: 'high',
      persistent: true
    });
    
    // Store offline state
    localStorage.setItem('omnix_offline_mode', 'true');
  }

  /**
   * Clear authentication and redirect
   */
  clearAuthAndRedirect() {
    // Clear user store
    const userStore = useUserStore.getState();
    userStore.logout();
    
    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * Get authentication headers for API calls
   */
  getAuthHeaders() {
    const userStore = useUserStore.getState();
    return {
      'Authorization': `Bearer ${userStore.token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Show error notification to user
   */
  showErrorNotification(errorInfo) {
    const notificationStore = useNotificationStore.getState();
    
    notificationStore.addNotification({
      id: `error_${Date.now()}`,
      type: errorInfo.type,
      title: errorInfo.title,
      body: errorInfo.message,
      priority: errorInfo.priority || 'medium',
      persistent: errorInfo.persistent || false,
      autoDismiss: errorInfo.autoDismiss || null,
      timestamp: Date.now(),
      category: 'system',
      source: 'websocket_error_handler'
    });
  }

  /**
   * Update fallback state in stores
   */
  updateFallbackState(isActive) {
    // Update WebSocket store with fallback status
    window.dispatchEvent(new CustomEvent('websocket_fallback_state', {
      detail: { isActive }
    }));
  }

  /**
   * Log error for analytics
   */
  logErrorForAnalytics(errorData) {
    // Send error data to analytics service
    try {
      fetch('/api/v1/analytics/errors', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          type: 'websocket_error',
          error: errorData,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to log error for analytics', error);
    }
  }

  /**
   * Get current error handler status
   */
  getStatus() {
    return {
      isUsingFallback: this.isUsingFallback,
      errorCount: this.errorCount,
      isCircuitBreakerOpen: this.isCircuitBreakerOpen,
      lastErrorTime: this.lastErrorTime,
      fallbackPollingInterval: this.fallbackPollingInterval
    };
  }

  /**
   * Force fallback activation (for testing)
   */
  forceFallbackMode() {
    this.activateFallbackMode();
  }

  /**
   * Reset error state
   */
  resetErrorState() {
    this.errorCount = 0;
    this.lastErrorTime = null;
    this.isCircuitBreakerOpen = false;
    this.deactivateFallbackMode();
  }
}

// Create singleton instance
export const websocketErrorHandler = new WebSocketErrorHandler();
export default websocketErrorHandler;