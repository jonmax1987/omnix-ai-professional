// Enhanced WebSocket Service with Queue Management and Offline Support
// Implementation of API-005: Real-time streaming service (WebSocket)

// Browser-compatible EventEmitter implementation
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event, listenerToRemove) {
    if (!this.events[event]) return this;
    
    this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    
    this.events[event].forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error('EventEmitter listener error:', error);
      }
    });
    
    return true;
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}
import useUserStore from '../store/userStore';

/**
 * Enhanced WebSocket Service Class
 * Features:
 * - Connection state management with events
 * - Automatic reconnection with exponential backoff
 * - Message queue for offline scenarios
 * - Heartbeat monitoring
 * - Multiple protocol support (Socket.IO & raw WebSocket)
 */
export class WebSocketService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Configuration
    this.config = {
      maxReconnectAttempts: options.maxReconnectAttempts || 5,
      reconnectDelay: options.reconnectDelay || 1000,
      heartbeatInterval: options.heartbeatInterval || 30000,
      maxQueueSize: options.maxQueueSize || 100,
      enableLogging: options.enableLogging ?? import.meta.env.DEV,
      ...options
    };
    
    // Connection state
    this.socket = null;
    this.connectionState = 'disconnected'; // disconnected, connecting, connected, reconnecting
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.connectionPromise = null;
    this.lastPongTime = null;
    
    // Message handling
    this.listeners = new Map();
    this.messageQueue = [];
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    
    // Metrics
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      reconnectCount: 0,
      lastConnectedAt: null,
      connectionDuration: 0
    };
    
    // Bind methods
    this.handleMessage = this.handleMessage.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.sendHeartbeat = this.sendHeartbeat.bind(this);
  }

  /**
   * Connect to WebSocket server
   */
  async connect() {
    
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    
    if (!wsUrl) {
      this.log('WebSocket disabled - using HTTP polling fallback');
      this.setConnectionState('disconnected');
      return Promise.resolve();
    }
    
    // Check if already connected
    if (this.connectionState === 'connected') {
      return Promise.resolve();
    }
    
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      return this.connectionPromise || Promise.resolve();
    }
    
    this.isConnecting = true;
    this.setConnectionState('connecting');
    
    const token = useUserStore.getState().token;
    if (!token) {
      this.log('No authentication token available');
      this.isConnecting = false;
      this.setConnectionState('disconnected');
      return Promise.reject(new Error('No authentication token'));
    }
    
    try {
      // Create connection based on URL type
      if (wsUrl.includes('amazonaws.com')) {
        this.socket = this.createAWSWebSocket(wsUrl, token);
      } else if (wsUrl.includes('localhost') || wsUrl.includes('127.0.0.1')) {
        this.socket = await this.createSocketIO(wsUrl, token);
      } else {
        throw new Error(`Unsupported WebSocket URL: ${wsUrl}`);
      }
      
      this.connectionPromise = this.setupConnection();
      return this.connectionPromise;
      
    } catch (error) {
      this.isConnecting = false;
      this.setConnectionState('disconnected');
      this.log('Connection setup failed:', error);
      throw error;
    }
  }

  /**
   * Create AWS API Gateway WebSocket connection
   */
  createAWSWebSocket(wsUrl, token) {
    const socket = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
    
    socket.onopen = () => {
      this.log('AWS WebSocket connected');
      this.handleConnected();
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        this.log('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = (event) => {
      this.log('AWS WebSocket disconnected:', event.code, event.reason);
      this.handleDisconnect(event.code !== 1000);
    };
    
    socket.onerror = (error) => {
      this.log('AWS WebSocket error:', error);
      this.handleDisconnect(true);
    };
    
    return socket;
  }

  /**
   * Create Socket.IO connection
   */
  async createSocketIO(wsUrl, token) {
    const { io } = await import('socket.io-client');
    
    const socket = io(`${wsUrl}/ws`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false // We handle reconnection manually
    });
    
    socket.on('connect', () => {
      this.log('Socket.IO connected');
      this.handleConnected();
    });
    
    socket.on('message', this.handleMessage);
    socket.on('disconnect', (reason) => {
      this.log('Socket.IO disconnected:', reason);
      this.handleDisconnect(reason !== 'io client disconnect');
    });
    
    socket.on('connect_error', (error) => {
      this.log('Socket.IO connection error:', error);
      this.handleDisconnect(true);
    });
    
    // Handle specific event channels
    ['products', 'dashboard', 'alerts', 'orders', 'notifications', 'inventory'].forEach(channel => {
      socket.on(channel, (data) => {
        this.handleMessage({ channel, payload: data });
      });
    });
    
    return socket;
  }

  /**
   * Setup connection promise and state management
   */
  setupConnection() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.isConnecting = false;
        this.setConnectionState('disconnected');
        reject(new Error('Connection timeout'));
      }, 10000); // 10 second timeout
      
      // Listen for successful connection
      const onConnected = () => {
        clearTimeout(timeout);
        this.isConnecting = false;
        resolve();
      };
      
      // Listen for connection failure
      const onDisconnected = (error) => {
        clearTimeout(timeout);
        this.isConnecting = false;
        reject(error || new Error('Connection failed'));
      };
      
      this.once('connected', onConnected);
      this.once('connection-error', onDisconnected);
    });
  }

  /**
   * Handle successful connection
   */
  handleConnected() {
    this.setConnectionState('connected');
    this.reconnectAttempts = 0;
    this.metrics.lastConnectedAt = Date.now();
    this.metrics.reconnectCount = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Process queued messages
    this.processMessageQueue();
    
    this.emit('connected');
    this.log('WebSocket connection established');
  }

  /**
   * Handle disconnection
   */
  handleDisconnect(shouldReconnect = true) {
    this.stopHeartbeat();
    
    if (this.connectionState === 'connected') {
      // Update connection duration
      this.metrics.connectionDuration += Date.now() - this.metrics.lastConnectedAt;
    }
    
    this.setConnectionState('disconnected');
    this.emit('disconnected');
    
    if (shouldReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      this.log('Max reconnection attempts reached or manual disconnect');
      this.emit('connection-failed');
    }
  }

  /**
   * Schedule automatic reconnection
   */
  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.setConnectionState('reconnecting');
    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );
    
    this.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.metrics.reconnectCount++;
      this.connect().catch(error => {
        this.log('Reconnection failed:', error);
        this.handleDisconnect(true);
      });
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      if (this.socket.disconnect) {
        // Socket.IO connection
        this.socket.disconnect();
      } else {
        // Raw WebSocket connection
        this.socket.close(1000, 'Client disconnect');
      }
      this.socket = null;
    }
    
    this.setConnectionState('disconnected');
    this.listeners.clear();
    this.messageQueue.length = 0;
    this.isConnecting = false;
    
    this.emit('disconnected');
    this.log('WebSocket disconnected');
  }

  /**
   * Send message with offline queue support
   */
  send(data) {
    const message = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      data,
      attempts: 0
    };
    
    if (this.isConnected()) {
      this.sendMessage(message);
    } else {
      this.queueMessage(message);
      this.log('Message queued (offline):', data);
    }
  }

  /**
   * Send message immediately
   */
  sendMessage(message) {
    if (!this.socket) return false;
    
    try {
      if (this.socket.emit) {
        // Socket.IO connection
        this.socket.emit('message', message.data);
      } else {
        // Raw WebSocket connection
        this.socket.send(JSON.stringify(message.data));
      }
      
      this.metrics.messagesSent++;
      message.sentAt = Date.now();
      return true;
    } catch (error) {
      this.log('Failed to send message:', error);
      this.queueMessage(message);
      return false;
    }
  }

  /**
   * Queue message for offline scenarios
   */
  queueMessage(message) {
    // Prevent queue overflow
    if (this.messageQueue.length >= this.config.maxQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
      this.log('Message queue full, removing oldest message');
    }
    
    this.messageQueue.push(message);
  }

  /**
   * Process queued messages when connection is restored
   */
  processMessageQueue() {
    if (this.messageQueue.length === 0) return;
    
    this.log(`Processing ${this.messageQueue.length} queued messages`);
    
    const messages = [...this.messageQueue];
    this.messageQueue.length = 0;
    
    for (const message of messages) {
      message.attempts++;
      
      // Skip messages that are too old (5 minutes)
      if (Date.now() - message.timestamp > 300000) {
        this.log('Skipping old queued message:', message.data);
        continue;
      }
      
      // Retry message with exponential backoff
      setTimeout(() => {
        if (this.isConnected()) {
          this.sendMessage(message);
        } else {
          this.queueMessage(message);
        }
      }, message.attempts * 100);
    }
  }

  /**
   * Subscribe to channel
   */
  subscribe(channel, callback) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel).add(callback);
    
    // Send subscription message
    this.send({ type: 'subscribe', channel });
    
    this.log(`Subscribed to channel: ${channel}`);
  }

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channel, callback) {
    if (this.listeners.has(channel)) {
      this.listeners.get(channel).delete(callback);
      if (this.listeners.get(channel).size === 0) {
        this.listeners.delete(channel);
        this.send({ type: 'unsubscribe', channel });
      }
    }
    
    this.log(`Unsubscribed from channel: ${channel}`);
  }

  /**
   * Handle incoming messages
   */
  handleMessage(data) {
    this.metrics.messagesReceived++;
    
    // Handle different message formats
    const { channel, type, payload, event } = data;
    const messageChannel = channel || event || type || 'default';
    const messageData = payload || data;
    
    // Update last pong time for heartbeat monitoring
    if (type === 'pong') {
      this.lastPongTime = Date.now();
      return;
    }
    
    // Emit to specific channel listeners
    if (this.listeners.has(messageChannel)) {
      this.listeners.get(messageChannel).forEach(callback => {
        try {
          callback({ type: messageChannel, payload: messageData });
        } catch (error) {
          this.log('Error in message callback:', error);
        }
      });
    }
    
    // Emit to global listeners
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => {
        try {
          callback({ type: messageChannel, payload: messageData });
        } catch (error) {
          this.log('Error in global callback:', error);
        }
      });
    }
    
    // Emit as event
    this.emit('message', { type: messageChannel, payload: messageData });
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    if (this.heartbeatTimer) return;
    
    this.lastPongTime = Date.now();
    this.heartbeatTimer = setInterval(this.sendHeartbeat, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Send heartbeat ping
   */
  sendHeartbeat() {
    if (!this.isConnected()) return;
    
    // Check if we received a pong recently
    if (this.lastPongTime && Date.now() - this.lastPongTime > this.config.heartbeatInterval * 2) {
      this.log('Heartbeat timeout - connection appears dead');
      this.handleDisconnect(true);
      return;
    }
    
    this.send({ type: 'ping', timestamp: Date.now() });
  }

  /**
   * Check if connected
   */
  isConnected() {
    if (!this.socket) return false;
    
    if (this.socket.connected !== undefined) {
      // Socket.IO connection
      return this.socket.connected && this.connectionState === 'connected';
    } else {
      // Raw WebSocket connection
      return this.socket.readyState === WebSocket.OPEN && this.connectionState === 'connected';
    }
  }

  /**
   * Get connection state
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Set connection state and emit events
   */
  setConnectionState(state) {
    const previousState = this.connectionState;
    this.connectionState = state;
    
    if (previousState !== state) {
      this.emit('state-change', { from: previousState, to: state });
      this.log(`Connection state changed: ${previousState} -> ${state}`);
    }
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      connectionState: this.connectionState,
      queuedMessages: this.messageQueue.length,
      activeListeners: this.listeners.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Logging utility
   */
  log(...args) {
    if (this.config.enableLogging) {
      console.log('[WebSocketService]', ...args);
    }
  }

  /**
   * Reset connection state and metrics
   */
  reset() {
    this.disconnect();
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      reconnectCount: 0,
      lastConnectedAt: null,
      connectionDuration: 0
    };
    this.reconnectAttempts = 0;
  }
}

// Export singleton instance
export const wsService = new WebSocketService();

// Export class for custom instances
export default WebSocketService;