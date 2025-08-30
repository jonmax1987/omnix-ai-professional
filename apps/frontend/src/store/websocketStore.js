/**
 * OMNIX AI - WebSocket Connection State Management
 * Centralized state management for real-time connection status and events
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { webSocketManager } from '../services/websocket';
import { websocketErrorHandler } from '../services/websocketErrorHandler';
import { fallbackPollingService } from '../services/fallbackPollingService';

// Enable MapSet plugin for Immer to handle Map and Set in state
enableMapSet();

export const useWebSocketStore = create(
  immer((set, get) => ({
    // Connection state
    connectionState: 'disconnected', // 'disconnected', 'connecting', 'connected', 'authenticated', 'error', 'failed'
    isConnected: false,
    isAuthenticated: false,
    lastConnected: null,
    lastDisconnected: null,
    
    // Connection stats
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    queuedMessagesCount: 0,
    totalMessagesReceived: 0,
    totalMessagesSent: 0,
    
    // Real-time data streams
    activeStreams: new Set(),
    subscriptions: new Map(),
    realtimeData: {
      inventory: {},
      customerActivity: [],
      notifications: [],
      systemAlerts: []
    },
    
    // Error handling
    connectionErrors: [],
    lastError: null,
    
    // Performance metrics
    latency: 0,
    averageLatency: 0,
    connectionQuality: 'unknown', // 'excellent', 'good', 'fair', 'poor'
    
    // Actions
    connect: async () => {
      set((state) => {
        state.connectionState = 'connecting';
      });
      
      try {
        const success = await webSocketManager.connect();
        if (success) {
          // Set up event listeners
          get().setupEventListeners();
        }
        return success;
      } catch (error) {
        set((state) => {
          state.connectionState = 'error';
          state.lastError = error.message;
          state.connectionErrors.push({
            timestamp: Date.now(),
            error: error.message
          });
        });
        return false;
      }
    },

    disconnect: () => {
      webSocketManager.disconnect();
      set((state) => {
        state.connectionState = 'disconnected';
        state.isConnected = false;
        state.isAuthenticated = false;
        state.lastDisconnected = Date.now();
        state.activeStreams.clear();
        state.subscriptions.clear();
      });
    },

    setupEventListeners: () => {
      // Connection state changes
      webSocketManager.subscribe('state_change', (data) => {
        set((state) => {
          state.connectionState = data.state;
          
          if (data.state === 'connected') {
            state.isConnected = true;
            state.lastConnected = Date.now();
            state.reconnectAttempts = 0;
          } else if (data.state === 'authenticated') {
            state.isAuthenticated = true;
          } else if (data.state === 'disconnected') {
            state.isConnected = false;
            state.isAuthenticated = false;
            state.lastDisconnected = Date.now();
          }
        });
      });

      // Authentication events
      webSocketManager.subscribe('authenticated', (data) => {
        set((state) => {
          state.isAuthenticated = true;
          state.connectionState = 'authenticated';
        });
        
        // Subscribe to default channels
        get().subscribeToDefaultChannels();
      });

      webSocketManager.subscribe('auth_failed', (data) => {
        set((state) => {
          state.connectionState = 'error';
          state.lastError = 'Authentication failed';
          state.connectionErrors.push({
            timestamp: Date.now(),
            error: 'Authentication failed',
            details: data
          });
        });
      });

      // Connection events
      webSocketManager.subscribe('connection', (data) => {
        set((state) => {
          state.isConnected = true;
          state.lastConnected = Date.now();
        });
      });

      webSocketManager.subscribe('disconnection', (data) => {
        set((state) => {
          state.isConnected = false;
          state.isAuthenticated = false;
          state.lastDisconnected = Date.now();
          
          if (data.code !== 1000) { // Not normal closure
            state.reconnectAttempts += 1;
          }
        });
      });

      // Error events
      webSocketManager.subscribe('error', (data) => {
        set((state) => {
          state.connectionState = 'error';
          state.lastError = data.error?.message || 'WebSocket error';
          state.connectionErrors.push({
            timestamp: Date.now(),
            error: data.error?.message || 'Unknown error',
            details: data
          });
        });
      });

      // Real-time data events
      webSocketManager.subscribe('inventory_update', (data) => {
        set((state) => {
          state.realtimeData.inventory = {
            ...state.realtimeData.inventory,
            ...data
          };
          state.totalMessagesReceived += 1;
        });
        
        // Calculate latency if timestamp is provided
        if (data.timestamp) {
          const latency = Date.now() - data.timestamp;
          get().updateLatency(latency);
        }
      });

      webSocketManager.subscribe('customer_activity', (data) => {
        set((state) => {
          state.realtimeData.customerActivity.unshift(data);
          
          // Keep only last 100 activities
          if (state.realtimeData.customerActivity.length > 100) {
            state.realtimeData.customerActivity = state.realtimeData.customerActivity.slice(0, 100);
          }
          
          state.totalMessagesReceived += 1;
        });
      });

      webSocketManager.subscribe('notification', (data) => {
        set((state) => {
          state.realtimeData.notifications.unshift(data);
          
          // Keep only last 50 notifications
          if (state.realtimeData.notifications.length > 50) {
            state.realtimeData.notifications = state.realtimeData.notifications.slice(0, 50);
          }
          
          state.totalMessagesReceived += 1;
        });
      });

      webSocketManager.subscribe('system_alert', (data) => {
        set((state) => {
          state.realtimeData.systemAlerts.unshift(data);
          
          // Keep only last 20 alerts
          if (state.realtimeData.systemAlerts.length > 20) {
            state.realtimeData.systemAlerts = state.realtimeData.systemAlerts.slice(0, 20);
          }
          
          state.totalMessagesReceived += 1;
        });
      });

      // Revenue stream events
      webSocketManager.subscribe('revenue_update', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to dashboard store for processing
        const { updateRevenueStream } = require('../store/dashboardStore').default.getState();
        if (updateRevenueStream) {
          updateRevenueStream(data);
        }
      });

      webSocketManager.subscribe('transaction', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to dashboard store for processing
        const { updateRevenueStream } = require('../store/dashboardStore').default.getState();
        if (updateRevenueStream) {
          updateRevenueStream(data);
        }
      });

      webSocketManager.subscribe('hourly_revenue', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to dashboard store for processing
        const { updateHourlyRevenue } = require('../store/dashboardStore').default.getState();
        if (updateHourlyRevenue) {
          updateHourlyRevenue(data);
        }
      });

      // Team Activity events
      webSocketManager.subscribe('team_activity', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to team activity store for processing
        import('./teamActivityStore.js').then(({ default: useTeamActivityStore }) => {
          useTeamActivityStore.getState().addActivity(data);
        }).catch(console.error);
      });

      webSocketManager.subscribe('user_presence', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to team activity store for processing
        import('./teamActivityStore.js').then(({ default: useTeamActivityStore }) => {
          useTeamActivityStore.getState().updatePresence(data.userId, data.presence);
        }).catch(console.error);
      });

      webSocketManager.subscribe('collaboration_start', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to team activity store for processing
        import('./teamActivityStore.js').then(({ default: useTeamActivityStore }) => {
          useTeamActivityStore.getState().startCollaboration(data);
        }).catch(console.error);
      });

      webSocketManager.subscribe('collaboration_end', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to team activity store for processing
        import('./teamActivityStore.js').then(({ default: useTeamActivityStore }) => {
          useTeamActivityStore.getState().endCollaboration(data.collaborationId, data);
        }).catch(console.error);
      });

      // Customer Behavior events
      webSocketManager.subscribe('customer_behavior', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to customer behavior store for processing
        import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
          useCustomerBehaviorStore.getState().trackBehavior(data);
        }).catch(console.error);
      });

      webSocketManager.subscribe('customer_journey', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to customer behavior store for processing
        import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
          data.behaviors?.forEach(behavior => {
            useCustomerBehaviorStore.getState().trackBehavior(behavior);
          });
        }).catch(console.error);
      });

      webSocketManager.subscribe('behavior_patterns', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to customer behavior store for processing
        import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
          useCustomerBehaviorStore.getState().generateInsights();
        }).catch(console.error);
      });

      webSocketManager.subscribe('customer_insights', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to customer behavior store for processing
        import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
          useCustomerBehaviorStore.getState().generateInsights();
        }).catch(console.error);
      });
    },

    subscribeToDefaultChannels: () => {
      const defaultChannels = [
        'inventory_updates',
        'customer_activity',
        'system_notifications',
        'price_changes',
        'revenue_stream',
        'revenue_updates',
        'transactions',
        'customer_actions',
        'user_events',
        'alert_notifications',
        'critical_alerts',
        'system_alerts',
        'ab_test_updates',
        'test_results',
        'experiment_metrics',
        'team_activity',
        'user_presence',
        'collaboration_start',
        'collaboration_end',
        'customer_behavior',
        'customer_journey',
        'behavior_patterns',
        'customer_insights'
      ];
      
      webSocketManager.subscribeToChannels(defaultChannels);
      
      set((state) => {
        defaultChannels.forEach(channel => {
          state.activeStreams.add(channel);
        });
      });
    },

    subscribeToStream: (streamName, callback) => {
      // Add to local subscriptions
      set((state) => {
        if (!state.subscriptions.has(streamName)) {
          state.subscriptions.set(streamName, new Set());
        }
        state.subscriptions.get(streamName).add(callback);
        state.activeStreams.add(streamName);
      });

      // Subscribe to WebSocket events
      const unsubscribe = webSocketManager.subscribe(streamName, callback);
      
      // Subscribe to channel on server
      if (webSocketManager.isConnected()) {
        webSocketManager.subscribeToChannels([streamName]);
      }

      return unsubscribe;
    },

    unsubscribeFromStream: (streamName, callback) => {
      set((state) => {
        if (state.subscriptions.has(streamName)) {
          state.subscriptions.get(streamName).delete(callback);
          
          // Remove stream if no more subscribers
          if (state.subscriptions.get(streamName).size === 0) {
            state.subscriptions.delete(streamName);
            state.activeStreams.delete(streamName);
          }
        }
      });

      // Unsubscribe from server if no local subscribers
      const subscriptions = get().subscriptions;
      if (!subscriptions.has(streamName) || subscriptions.get(streamName).size === 0) {
        webSocketManager.unsubscribeFromChannels([streamName]);
      }
    },

    sendMessage: (type, data) => {
      const success = webSocketManager.send(type, data);
      
      if (success) {
        set((state) => {
          state.totalMessagesSent += 1;
        });
      } else {
        set((state) => {
          state.queuedMessagesCount += 1;
        });
      }
      
      return success;
    },

    updateLatency: (latency) => {
      set((state) => {
        state.latency = latency;
        
        // Calculate running average
        const alpha = 0.1; // Smoothing factor
        state.averageLatency = state.averageLatency === 0 
          ? latency 
          : state.averageLatency * (1 - alpha) + latency * alpha;
        
        // Update connection quality based on latency
        if (state.averageLatency < 100) {
          state.connectionQuality = 'excellent';
        } else if (state.averageLatency < 300) {
          state.connectionQuality = 'good';
        } else if (state.averageLatency < 1000) {
          state.connectionQuality = 'fair';
        } else {
          state.connectionQuality = 'poor';
        }
      });
    },

    clearErrors: () => {
      set((state) => {
        state.connectionErrors = [];
        state.lastError = null;
      });
    },

    getConnectionInfo: () => {
      const state = get();
      const errorHandlerStatus = websocketErrorHandler.getStatus();
      const fallbackStatus = fallbackPollingService.getStatus();
      
      return {
        state: state.connectionState,
        isConnected: state.isConnected,
        isAuthenticated: state.isAuthenticated,
        reconnectAttempts: state.reconnectAttempts,
        queuedMessages: state.queuedMessagesCount,
        activeStreams: Array.from(state.activeStreams),
        latency: state.latency,
        averageLatency: Math.round(state.averageLatency),
        connectionQuality: state.connectionQuality,
        lastConnected: state.lastConnected,
        lastDisconnected: state.lastDisconnected,
        totalMessagesReceived: state.totalMessagesReceived,
        totalMessagesSent: state.totalMessagesSent,
        errors: state.connectionErrors.slice(-5), // Last 5 errors
        errorHandler: errorHandlerStatus,
        fallback: fallbackStatus
      };
    },

    // Real-time data getters
    getInventoryUpdates: () => get().realtimeData.inventory,
    getCustomerActivity: () => get().realtimeData.customerActivity,
    getRealtimeNotifications: () => get().realtimeData.notifications,
    getSystemAlerts: () => get().realtimeData.systemAlerts,

    // Health check
    isHealthy: () => {
      const state = get();
      return (
        state.isConnected &&
        state.isAuthenticated &&
        state.connectionQuality !== 'poor' &&
        state.reconnectAttempts < state.maxReconnectAttempts
      );
    },

    // Force reconnection
    forceReconnect: async () => {
      get().disconnect();
      
      // Wait a moment before reconnecting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return get().connect();
    },

    // Auto-connect based on auth state
    autoConnect: () => {
      // This should be called when user logs in
      if (!get().isConnected) {
        get().connect();
      }
    },

    // Auto-disconnect
    autoDisconnect: () => {
      // This should be called when user logs out
      get().disconnect();
    }
  }))
);

export default useWebSocketStore;