/**
 * OMNIX AI - Real-Time WebSocket Event Type Definitions
 * Comprehensive event types for live data streaming and communication
 */

// Connection Events
export const CONNECTION_EVENTS = {
  CONNECT: 'connection',
  DISCONNECT: 'disconnection',
  AUTHENTICATE: 'authenticate',
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILED: 'auth_failed',
  HEARTBEAT: 'heartbeat',
  HEARTBEAT_RESPONSE: 'heartbeat_response',
  STATE_CHANGE: 'state_change',
  ERROR: 'error'
};

// Manager Dashboard Events
export const MANAGER_EVENTS = {
  // Revenue & Analytics
  REVENUE_UPDATE: 'revenue_update',
  SALES_ANALYTICS: 'sales_analytics',
  CUSTOMER_METRICS: 'customer_metrics',
  PERFORMANCE_KPI: 'performance_kpi',
  
  // Inventory Management
  INVENTORY_UPDATE: 'inventory_update',
  STOCK_ALERT: 'stock_alert',
  DEPLETION_FORECAST: 'depletion_forecast',
  REORDER_SUGGESTION: 'reorder_suggestion',
  SUPPLIER_UPDATE: 'supplier_update',
  BULK_ORDER_STATUS: 'bulk_order_status',
  
  // Customer Activity
  CUSTOMER_ACTIVITY: 'customer_activity',
  CUSTOMER_LOGIN: 'customer_login',
  CUSTOMER_PURCHASE: 'customer_purchase',
  CUSTOMER_BEHAVIOR: 'customer_behavior',
  SEGMENT_UPDATE: 'segment_update',
  
  // A/B Testing
  AB_TEST_RESULT: 'ab_test_result',
  MODEL_PERFORMANCE: 'model_performance',
  EXPERIMENT_UPDATE: 'experiment_update',
  
  // Alerts & Notifications
  SYSTEM_ALERT: 'system_alert',
  CRITICAL_ALERT: 'critical_alert',
  BUSINESS_INSIGHT: 'business_insight'
};

// Customer Events
export const CUSTOMER_EVENTS = {
  // Personalization
  RECOMMENDATION_UPDATE: 'recommendation_update',
  PERSONALIZATION_SYNC: 'personalization_sync',
  PREFERENCE_CHANGE: 'preference_change',
  
  // Shopping
  CART_SYNC: 'cart_sync',
  WISHLIST_SYNC: 'wishlist_sync',
  ORDER_STATUS: 'order_status',
  DELIVERY_UPDATE: 'delivery_update',
  
  // Notifications
  NOTIFICATION: 'notification',
  PRICE_DROP: 'price_drop',
  STOCK_AVAILABLE: 'stock_available',
  DEAL_ALERT: 'deal_alert',
  LOYALTY_UPDATE: 'loyalty_update',
  REPLENISHMENT_REMINDER: 'replenishment_reminder',
  
  // Engagement
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  MILESTONE_REACHED: 'milestone_reached',
  CHALLENGE_UPDATE: 'challenge_update'
};

// System Events
export const SYSTEM_EVENTS = {
  MAINTENANCE_MODE: 'maintenance_mode',
  FEATURE_FLAG_UPDATE: 'feature_flag_update',
  CONFIG_UPDATE: 'config_update',
  SERVICE_STATUS: 'service_status',
  ERROR_REPORT: 'error_report',
  PERFORMANCE_METRIC: 'performance_metric'
};

// Channel Subscriptions
export const CHANNELS = {
  // Manager Channels
  MANAGER_DASHBOARD: 'manager_dashboard',
  INVENTORY_STREAM: 'inventory_stream',
  CUSTOMER_ANALYTICS: 'customer_analytics',
  REVENUE_STREAM: 'revenue_stream',
  ALERT_STREAM: 'alert_stream',
  AB_TEST_STREAM: 'ab_test_stream',
  
  // Customer Channels
  CUSTOMER_PERSONAL: 'customer_personal',
  RECOMMENDATIONS: 'recommendations',
  NOTIFICATIONS: 'notifications',
  DEALS: 'deals',
  LOYALTY: 'loyalty',
  
  // Global Channels
  SYSTEM_UPDATES: 'system_updates',
  PRICE_UPDATES: 'price_updates',
  PRODUCT_UPDATES: 'product_updates'
};

// Message Priorities
export const MESSAGE_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Event Data Structures
export const EVENT_SCHEMAS = {
  // Connection Events
  [CONNECTION_EVENTS.AUTHENTICATE]: {
    token: 'string',
    userId: 'string',
    role: 'string',
    clientInfo: 'object'
  },
  
  // Manager Events
  [MANAGER_EVENTS.INVENTORY_UPDATE]: {
    productId: 'string',
    currentStock: 'number',
    reserved: 'number',
    available: 'number',
    lastUpdated: 'timestamp',
    location: 'string',
    alerts: 'array'
  },
  
  [MANAGER_EVENTS.REVENUE_UPDATE]: {
    period: 'string',
    totalRevenue: 'number',
    growth: 'number',
    transactions: 'number',
    averageOrderValue: 'number',
    timestamp: 'timestamp'
  },
  
  [MANAGER_EVENTS.CUSTOMER_ACTIVITY]: {
    customerId: 'string',
    activity: 'string',
    details: 'object',
    location: 'string',
    timestamp: 'timestamp',
    sessionId: 'string'
  },
  
  // Customer Events
  [CUSTOMER_EVENTS.RECOMMENDATION_UPDATE]: {
    customerId: 'string',
    recommendations: 'array',
    reason: 'string',
    confidence: 'number',
    category: 'string',
    timestamp: 'timestamp'
  },
  
  [CUSTOMER_EVENTS.PRICE_DROP]: {
    productId: 'string',
    productName: 'string',
    oldPrice: 'number',
    newPrice: 'number',
    discount: 'number',
    validUntil: 'timestamp',
    customerId: 'string'
  },
  
  [CUSTOMER_EVENTS.NOTIFICATION]: {
    id: 'string',
    type: 'string',
    title: 'string',
    body: 'string',
    data: 'object',
    priority: 'string',
    timestamp: 'timestamp',
    expiresAt: 'timestamp'
  }
};

// Real-time Data Types
export const REALTIME_DATA_TYPES = {
  // Inventory
  STOCK_LEVELS: 'stock_levels',
  INVENTORY_MOVEMENTS: 'inventory_movements',
  REORDER_POINTS: 'reorder_points',
  SUPPLIER_DELIVERIES: 'supplier_deliveries',
  
  // Sales & Revenue
  LIVE_SALES: 'live_sales',
  TRANSACTION_STREAM: 'transaction_stream',
  REVENUE_METRICS: 'revenue_metrics',
  PAYMENT_STATUS: 'payment_status',
  
  // Customer Behavior
  CUSTOMER_JOURNEY: 'customer_journey',
  SHOPPING_PATTERNS: 'shopping_patterns',
  ENGAGEMENT_METRICS: 'engagement_metrics',
  ABANDONMENT_ALERTS: 'abandonment_alerts',
  
  // AI & Personalization
  ML_PREDICTIONS: 'ml_predictions',
  RECOMMENDATION_SCORES: 'recommendation_scores',
  PERSONALIZATION_UPDATES: 'personalization_updates',
  AB_TEST_RESULTS: 'ab_test_results'
};

// WebSocket Message Structure
export const MESSAGE_STRUCTURE = {
  id: 'string', // Unique message identifier
  type: 'string', // Event type from above enums
  channel: 'string', // Channel name
  priority: 'string', // Message priority
  timestamp: 'number', // Unix timestamp
  data: 'object', // Event payload
  metadata: {
    source: 'string', // Message source
    version: 'string', // API version
    retry: 'number', // Retry count
    ttl: 'number' // Time to live
  }
};

// Error Types
export const ERROR_TYPES = {
  CONNECTION_FAILED: 'connection_failed',
  AUTHENTICATION_FAILED: 'authentication_failed',
  AUTHORIZATION_FAILED: 'authorization_failed',
  INVALID_MESSAGE: 'invalid_message',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SERVER_ERROR: 'server_error',
  TIMEOUT: 'timeout',
  INVALID_CHANNEL: 'invalid_channel'
};

// Connection States
export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error',
  FAILED: 'failed',
  RECONNECTING: 'reconnecting'
};

// Utility Functions
export const createMessage = (type, data, options = {}) => ({
  id: options.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  channel: options.channel,
  priority: options.priority || MESSAGE_PRIORITY.MEDIUM,
  timestamp: Date.now(),
  data,
  metadata: {
    source: options.source || 'client',
    version: options.version || '1.0',
    retry: options.retry || 0,
    ttl: options.ttl || 300000 // 5 minutes default TTL
  }
});

export const isEventType = (message, expectedType) => {
  return message && message.type === expectedType;
};

export const getChannelForRole = (role) => {
  switch (role) {
    case 'manager':
      return [
        CHANNELS.MANAGER_DASHBOARD,
        CHANNELS.INVENTORY_STREAM,
        CHANNELS.CUSTOMER_ANALYTICS,
        CHANNELS.REVENUE_STREAM,
        CHANNELS.ALERT_STREAM,
        CHANNELS.AB_TEST_STREAM,
        CHANNELS.SYSTEM_UPDATES
      ];
    case 'customer':
      return [
        CHANNELS.CUSTOMER_PERSONAL,
        CHANNELS.RECOMMENDATIONS,
        CHANNELS.NOTIFICATIONS,
        CHANNELS.DEALS,
        CHANNELS.LOYALTY,
        CHANNELS.PRICE_UPDATES,
        CHANNELS.PRODUCT_UPDATES
      ];
    default:
      return [CHANNELS.SYSTEM_UPDATES];
  }
};

export const validateMessage = (message) => {
  if (!message || typeof message !== 'object') {
    return { valid: false, error: 'Message must be an object' };
  }
  
  if (!message.type || typeof message.type !== 'string') {
    return { valid: false, error: 'Message type is required and must be a string' };
  }
  
  if (!message.timestamp || typeof message.timestamp !== 'number') {
    return { valid: false, error: 'Message timestamp is required and must be a number' };
  }
  
  return { valid: true };
};

// Event Handlers Registry
export class EventHandlerRegistry {
  constructor() {
    this.handlers = new Map();
  }
  
  register(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType).add(handler);
  }
  
  unregister(eventType, handler) {
    if (this.handlers.has(eventType)) {
      this.handlers.get(eventType).delete(handler);
    }
  }
  
  handle(eventType, data) {
    if (this.handlers.has(eventType)) {
      this.handlers.get(eventType).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error handling event ${eventType}:`, error);
        }
      });
    }
  }
  
  clear(eventType) {
    if (eventType) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.clear();
    }
  }
}

export default {
  CONNECTION_EVENTS,
  MANAGER_EVENTS,
  CUSTOMER_EVENTS,
  SYSTEM_EVENTS,
  CHANNELS,
  MESSAGE_PRIORITY,
  EVENT_SCHEMAS,
  REALTIME_DATA_TYPES,
  MESSAGE_STRUCTURE,
  ERROR_TYPES,
  CONNECTION_STATES,
  createMessage,
  isEventType,
  getChannelForRole,
  validateMessage,
  EventHandlerRegistry
};