/**
 * OMNIX AI - WebSocket Client Connection Manager
 * Real-time communication service for live updates and notifications
 */

import useUserStore from '../store/userStore';
import { useNotificationStore } from '../store/notificationStore';
import { websocketErrorHandler } from './websocketErrorHandler';

class WebSocketManager {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.heartbeatInterval = 30000;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.isConnecting = false;
    this.isAuthenticated = false;
    this.messageQueue = [];
    this.eventListeners = new Map();
    this.connectionState = 'disconnected';
    this.lastActivity = Date.now();
    
    // WebSocket URL from environment
    this.wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    
    // Bind methods
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  /**
   * Establish WebSocket connection
   */
  async connect() {
    if (!this.wsUrl) {
      console.log('WebSocket: No WebSocket URL configured, skipping connection');
      return false;
    }

    if (this.isConnecting || this.isConnected()) {
      console.log('WebSocket: Already connected or connecting');
      return false;
    }

    try {
      this.isConnecting = true;
      this.updateConnectionState('connecting');
      
      // Get authentication token
      const userStore = useUserStore.getState();
      const token = userStore.token;
      
      if (!token) {
        console.error('WebSocket: No authentication token available');
        this.updateConnectionState('disconnected');
        return false;
      }

      // Create WebSocket connection with auth header
      const wsUrl = `${this.wsUrl}?token=${encodeURIComponent(token)}`;
      this.socket = new WebSocket(wsUrl);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      console.log('WebSocket: Attempting connection to', this.wsUrl);
      return true;
    } catch (error) {
      console.error('WebSocket: Connection failed', error);
      this.isConnecting = false;
      this.updateConnectionState('error');
      return false;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
    }
    
    this.clearTimers();
    this.isAuthenticated = false;
    this.updateConnectionState('disconnected');
    console.log('WebSocket: Disconnected');
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN && this.isAuthenticated;
  }

  /**
   * Send message through WebSocket
   */
  send(type, data = {}) {
    const message = {
      type,
      data,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };

    if (this.isConnected()) {
      try {
        this.socket.send(JSON.stringify(message));
        this.lastActivity = Date.now();
        console.log('WebSocket: Message sent', type);
        return true;
      } catch (error) {
        console.error('WebSocket: Send failed', error);
        this.queueMessage(message);
        return false;
      }
    } else {
      console.log('WebSocket: Not connected, queuing message', type);
      this.queueMessage(message);
      return false;
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  subscribe(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType).add(callback);
    console.log(`WebSocket: Subscribed to ${eventType}`);
    
    // Return unsubscribe function
    return () => this.unsubscribe(eventType, callback);
  }

  /**
   * Unsubscribe from WebSocket events
   */
  unsubscribe(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).delete(callback);
      
      if (this.eventListeners.get(eventType).size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
    
    console.log(`WebSocket: Unsubscribed from ${eventType}`);
  }

  /**
   * Handle WebSocket open event
   */
  handleOpen(event) {
    console.log('WebSocket: Connection opened');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.updateConnectionState('connected');
    
    // Authenticate the connection
    this.authenticate();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Emit connection event
    this.emit('connection', { status: 'connected' });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      this.lastActivity = Date.now();
      
      console.log('WebSocket: Message received', message.type);
      
      // Handle system messages
      switch (message.type) {
        case 'auth_success':
          this.handleAuthSuccess(message);
          break;
        case 'auth_failed':
          this.handleAuthFailed(message);
          break;
        case 'heartbeat_response':
          // Heartbeat acknowledged
          break;
        case 'notification':
          this.handleNotification(message);
          break;
        case 'inventory_update':
          this.handleInventoryUpdate(message);
          break;
        case 'customer_activity':
          this.handleCustomerActivity(message);
          break;
        default:
          // Emit custom event
          this.emit(message.type, message.data);
      }
    } catch (error) {
      console.error('WebSocket: Message parsing failed', error);
    }
  }

  /**
   * Handle WebSocket close event
   */
  handleClose(event) {
    console.log('WebSocket: Connection closed', event.code, event.reason);
    
    this.isAuthenticated = false;
    this.clearTimers();
    
    if (event.code !== 1000) { // Not a normal closure
      this.updateConnectionState('disconnected');
      this.attemptReconnection();
    } else {
      this.updateConnectionState('disconnected');
    }
    
    this.emit('disconnection', { 
      code: event.code, 
      reason: event.reason 
    });
  }

  /**
   * Handle WebSocket error event
   */
  handleError(error) {
    console.error('WebSocket: Connection error', error);
    this.updateConnectionState('error');
    
    // Let error handler process the error
    this.emit('error', { error });
    
    // Additional error context for handler
    websocketErrorHandler.handleWebSocketError({ 
      error, 
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts 
    });
  }

  /**
   * Authenticate WebSocket connection
   */
  authenticate() {
    const userStore = useUserStore.getState();
    
    this.send('authenticate', {
      token: userStore.token,
      userId: userStore.user?.id,
      role: userStore.user?.role,
      clientInfo: {
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Handle successful authentication
   */
  handleAuthSuccess(message) {
    console.log('WebSocket: Authentication successful');
    this.isAuthenticated = true;
    this.updateConnectionState('authenticated');
    
    // Process queued messages
    this.processMessageQueue();
    
    this.emit('authenticated', message.data);
  }

  /**
   * Handle failed authentication
   */
  handleAuthFailed(message) {
    console.error('WebSocket: Authentication failed', message.data);
    this.disconnect();
    this.emit('auth_failed', message.data);
  }

  /**
   * Handle incoming notifications
   */
  handleNotification(message) {
    const notificationStore = useNotificationStore.getState();
    
    // Add to notification store
    notificationStore.addNotification(message.data);
    
    // Show browser notification if enabled
    if (notificationStore.preferences.delivery.webPush) {
      this.showBrowserNotification(message.data);
    }
    
    this.emit('notification', message.data);
  }

  /**
   * Handle inventory updates
   */
  handleInventoryUpdate(message) {
    console.log('WebSocket: Inventory update received', message.data);
    this.emit('inventory_update', message.data);
  }

  /**
   * Handle customer activity updates
   */
  handleCustomerActivity(message) {
    console.log('WebSocket: Customer activity update', message.data);
    this.emit('customer_activity', message.data);
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Attempt to reconnect WebSocket
   */
  attemptReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnection attempts reached');
      this.updateConnectionState('failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`WebSocket: Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Queue message for later sending
   */
  queueMessage(message) {
    this.messageQueue.push(message);
    
    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      
      try {
        this.socket.send(JSON.stringify(message));
        console.log('WebSocket: Queued message sent', message.type);
      } catch (error) {
        console.error('WebSocket: Failed to send queued message', error);
        // Re-queue the message
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  /**
   * Update connection state
   */
  updateConnectionState(state) {
    this.connectionState = state;
    this.emit('state_change', { state });
    console.log(`WebSocket: State changed to ${state}`);
  }

  /**
   * Emit event to listeners
   */
  emit(eventType, data) {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`WebSocket: Event listener error for ${eventType}`, error);
        }
      });
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge.png',
        tag: notification.id
      });
    }
  }

  /**
   * Clear all timers
   */
  clearTimers() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      state: this.connectionState,
      isConnected: this.isConnected(),
      isAuthenticated: this.isAuthenticated,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      lastActivity: this.lastActivity
    };
  }

  /**
   * Subscribe to specific real-time channels
   */
  subscribeToChannels(channels) {
    if (this.isConnected()) {
      this.send('subscribe_channels', { channels });
    }
  }

  /**
   * Unsubscribe from channels
   */
  unsubscribeFromChannels(channels) {
    if (this.isConnected()) {
      this.send('unsubscribe_channels', { channels });
    }
  }
}

// Create singleton instance
export const webSocketManager = new WebSocketManager();

// Initialize error handler after webSocketManager is created
websocketErrorHandler.initialize(webSocketManager);

export default webSocketManager;