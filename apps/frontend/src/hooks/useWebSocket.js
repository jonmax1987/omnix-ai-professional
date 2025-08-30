import { useEffect, useCallback } from 'react';
import { useWebSocketStore } from '../store/websocketStore';
import { webSocketManager } from '../services/websocket';
import { fallbackPollingService } from '../services/fallbackPollingService';
import useUserStore from '../store/userStore';
import useProductStore from '../store/productsStore';
import useDashboardStore from '../store/dashboardStore';
import useAlertStore from '../store/alertsStore';
import { useNotificationStore } from '../store/notificationStore';

/**
 * Hook for WebSocket real-time updates
 * Automatically connects when user is authenticated
 * Maps backend events to store updates
 */
export const useWebSocket = () => {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const updateProduct = useProductStore(state => state.updateProduct);
  const deleteProduct = useProductStore(state => state.deleteProduct);
  const updateMetrics = useDashboardStore(state => state.updateMetrics);
  const addAlert = useAlertStore(state => state.addAlert);
  const updateAlert = useAlertStore(state => state.updateAlert);
  const addNotification = useNotificationStore(state => state.addNotification);
  
  const { 
    connect, 
    disconnect, 
    sendMessage, 
    subscribeToStream, 
    unsubscribeFromStream,
    isConnected 
  } = useWebSocketStore();

  // Handle incoming WebSocket messages
  const handleRealtimeUpdate = useCallback((message) => {
    const { type, payload } = message;
    
    switch (type) {
      // Product events
      case 'product.updated':
      case 'PRODUCT_UPDATE':
        if (payload.productId || payload.id) {
          updateProduct(payload.productId || payload.id, payload);
        }
        break;
        
      case 'product.deleted':
      case 'PRODUCT_DELETE':
        if (payload.productId || payload.id) {
          deleteProduct(payload.productId || payload.id);
        }
        break;
        
      case 'product.stock_changed':
      case 'STOCK_UPDATE':
        if (payload.productId && payload.stock !== undefined) {
          updateProduct(payload.productId, { stock: payload.stock });
          
          // Check for low stock alert
          if (payload.stock < payload.minStock) {
            addAlert({
              type: 'warning',
              title: 'Low Stock Alert',
              message: `${payload.productName} is low on stock (${payload.stock} units remaining)`,
              productId: payload.productId
            });
          }
        }
        break;
        
      // Dashboard events
      case 'metrics.updated':
      case 'DASHBOARD_UPDATE':
        if (payload.metrics) {
          updateMetrics(payload.metrics);
        }
        break;
        
      // Alert events
      case 'alert.created':
      case 'NEW_ALERT':
        addAlert(payload);
        addNotification({
          type: payload.severity || 'info',
          title: payload.title || 'New Alert',
          message: payload.message
        });
        break;
        
      case 'alert.updated':
      case 'ALERT_UPDATE':
        if (payload.id) {
          updateAlert(payload.id, payload);
        }
        break;
        
      // Order events
      case 'order.created':
      case 'NEW_ORDER':
        addNotification({
          type: 'success',
          title: 'New Order',
          message: `Order #${payload.orderNumber || payload.id} has been created`
        });
        break;
        
      case 'order.status_changed':
      case 'ORDER_STATUS_UPDATE':
        addNotification({
          type: 'info',
          title: 'Order Status Update',
          message: `Order #${payload.orderNumber} status changed to ${payload.status}`
        });
        break;
        
      // Recommendation events
      case 'recommendation.new':
      case 'NEW_RECOMMENDATION':
        addNotification({
          type: 'info',
          title: 'New AI Recommendation',
          message: payload.message || 'Check the recommendations page for new insights'
        });
        break;
        
      // System events
      case 'system.maintenance':
        addNotification({
          type: 'warning',
          title: 'System Maintenance',
          message: payload.message || 'System maintenance scheduled'
        });
        break;
        
      default:
        console.log('Unhandled WebSocket event:', type, payload);
    }
  }, [updateProduct, deleteProduct, updateMetrics, addAlert, updateAlert, addNotification]);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check if WebSocket is disabled
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      if (!wsUrl || wsUrl === '') {
        console.log('WebSocket disabled - starting fallback HTTP polling');
        
        // Start fallback polling instead
        fallbackPollingService.start(['notifications', 'inventory', 'systemAlerts']);
        
        return () => {
          fallbackPollingService.stop();
        };
      }
      
      let unsubscribers = [];
      
      // Connect to WebSocket
      connect().then(() => {
        console.log('WebSocket connected successfully');
        
        // Subscribe to specific event streams
        unsubscribers = [
          subscribeToStream('product_update', handleRealtimeUpdate),
          subscribeToStream('product_delete', handleRealtimeUpdate),
          subscribeToStream('stock_update', handleRealtimeUpdate),
          subscribeToStream('dashboard_update', handleRealtimeUpdate),
          subscribeToStream('new_alert', handleRealtimeUpdate),
          subscribeToStream('alert_update', handleRealtimeUpdate),
          subscribeToStream('new_order', handleRealtimeUpdate),
          subscribeToStream('order_status_update', handleRealtimeUpdate),
          subscribeToStream('new_recommendation', handleRealtimeUpdate),
          subscribeToStream('system_maintenance', handleRealtimeUpdate)
        ];
      }).catch(error => {
        console.error('Failed to connect to WebSocket:', error);
      });
      
      // Cleanup on unmount or when user logs out
      return () => {
        // Cleanup subscriptions
        unsubscribers.forEach(unsubscribe => unsubscribe && unsubscribe());
        
        if (!isAuthenticated) {
          disconnect();
        }
      };
    }
  }, [isAuthenticated, handleRealtimeUpdate, connect, disconnect, subscribeToStream]);

  // Expose WebSocket methods for manual control
  return {
    connect: () => {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      if (!wsUrl) {
        console.log('WebSocket disabled - connect() ignored');
        return Promise.resolve();
      }
      return connect();
    },
    disconnect: () => {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      if (!wsUrl) return;
      disconnect();
    },
    send: (type, data) => {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      if (!wsUrl) return;
      sendMessage(type, data);
    },
    subscribe: (stream, callback) => {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      if (!wsUrl) return;
      return subscribeToStream(stream, callback);
    },
    unsubscribe: (stream, callback) => {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      if (!wsUrl) return;
      unsubscribeFromStream(stream, callback);
    },
    isConnected: () => {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      if (!wsUrl) return false;
      return isConnected;
    }
  };
};

// Hook for components that need real-time product updates
export const useRealtimeProducts = (productId = null) => {
  const ws = useWebSocket();
  const updateProduct = useProductStore(state => state.updateProduct);
  
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) return;
    
    if (productId && ws.isConnected()) {
      // Subscribe to specific product updates
      ws.send('SUBSCRIBE_PRODUCT', { productId });
      
      return () => {
        ws.send('UNSUBSCRIBE_PRODUCT', { productId });
      };
    }
  }, [productId, ws]);
};

// Hook for real-time dashboard metrics
export const useRealtimeDashboard = () => {
  const ws = useWebSocket();
  const { fetchMetrics } = useDashboardStore();
  
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    
    const interval = setInterval(() => {
      if (wsUrl && wsUrl !== '' && ws.isConnected()) {
        // Request latest dashboard metrics via WebSocket
        ws.send('GET_DASHBOARD_METRICS', {});
      } else {
        // Fallback to API polling if WebSocket is disabled or disconnected
        fetchMetrics();
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [ws, fetchMetrics]);
};

// Hook for real-time alerts
export const useRealtimeAlerts = () => {
  const ws = useWebSocket();
  const { fetchAlerts } = useAlertStore();
  
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) return;
    
    if (ws.isConnected()) {
      // Subscribe to alert channel
      ws.send('SUBSCRIBE_ALERTS', {});
    }
    
    return () => {
      if (ws.isConnected()) {
        ws.send('UNSUBSCRIBE_ALERTS', {});
      }
    };
  }, [ws]);
};