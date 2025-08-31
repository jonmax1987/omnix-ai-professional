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
        import('../store/dashboardStore').then(({ default: dashboardStore }) => {
          const { updateRevenueStream } = dashboardStore.getState();
          if (updateRevenueStream) {
            updateRevenueStream(data);
          }
        }).catch(console.error);
      });

      webSocketManager.subscribe('transaction', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to dashboard store for processing
        import('../store/dashboardStore').then(({ default: dashboardStore }) => {
          const { updateRevenueStream } = dashboardStore.getState();
          if (updateRevenueStream) {
            updateRevenueStream(data);
          }
        }).catch(console.error);
      });

      webSocketManager.subscribe('hourly_revenue', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to dashboard store for processing
        import('../store/dashboardStore').then(({ default: dashboardStore }) => {
          const { updateHourlyRevenue } = dashboardStore.getState();
          if (updateHourlyRevenue) {
            updateHourlyRevenue(data);
          }
        }).catch(console.error);
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

      // Segment migration events
      webSocketManager.subscribe('segment_migration', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to segment migration service
        import('../services/segmentMigrationService.js').then(({ default: segmentMigrationService }) => {
          const migration = segmentMigrationService.trackSegmentChange(
            data.customerId,
            data.newSegment,
            data.metadata
          );
          
          // Update customer behavior store with migration
          if (migration && migration.analysis.isSignificant) {
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              store.segmentMigrations.unshift({
                ...migration.migration,
                ...migration.analysis,
                id: `migration-${Date.now()}`
              });
            }).catch(console.error);
          }
        }).catch(console.error);
      });

      webSocketManager.subscribe('bulk_migration', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle bulk segment migrations
        import('../services/segmentMigrationService.js').then(({ default: segmentMigrationService }) => {
          const bulkAnalysis = segmentMigrationService.detectBulkMigrations(data.timeWindow);
          
          if (bulkAnalysis.detected) {
            // Notify about significant bulk migrations
            console.warn('Bulk segment migration detected:', bulkAnalysis);
          }
        }).catch(console.error);
      });

      // Consumption pattern events
      webSocketManager.subscribe('consumption_pattern', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to consumption pattern service
        import('../services/consumptionPatternService.js').then(({ default: consumptionPatternService }) => {
          const patternUpdate = consumptionPatternService.trackConsumption(data);
          
          // Update customer behavior store with pattern
          if (patternUpdate) {
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              store.consumptionPatterns.unshift({
                ...patternUpdate,
                id: `ws-pattern-${Date.now()}`
              });
            }).catch(console.error);
          }
        }).catch(console.error);
      });

      webSocketManager.subscribe('pattern_prediction', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle pattern predictions from server
        import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
          const store = useCustomerBehaviorStore.getState();
          
          // Update customer patterns with server predictions
          const existingPattern = store.customerPatterns.get(data.customerId);
          if (existingPattern) {
            existingPattern.predictions = {
              ...existingPattern.predictions,
              ...data.predictions
            };
            existingPattern.serverPredicted = true;
            store.customerPatterns.set(data.customerId, existingPattern);
          }
        }).catch(console.error);
      });

      webSocketManager.subscribe('replenishment_alert', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle replenishment alerts based on consumption patterns
        import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
          const store = useCustomerBehaviorStore.getState();
          
          // Add replenishment insight
          store.patternInsights.unshift({
            type: 'replenishment',
            message: data.message,
            action: 'Send replenishment reminder',
            priority: 'high',
            customerId: data.customerId,
            productId: data.productId,
            timestamp: new Date().toISOString(),
            id: `replenish-${Date.now()}`
          });
        }).catch(console.error);
      });

      // Real-time recommendation events
      webSocketManager.subscribe('recommendation_update', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to recommendation engine
        import('../services/realTimeRecommendationEngine.js').then(({ default: realTimeRecommendationEngine }) => {
          realTimeRecommendationEngine.generateRecommendations(data.customerId, data.context);
        }).catch(console.error);
      });

      webSocketManager.subscribe('recommendation_adjustment', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Apply real-time adjustments
        import('../services/realTimeRecommendationEngine.js').then(({ default: realTimeRecommendationEngine }) => {
          realTimeRecommendationEngine.adjustRecommendationsRealTime(data.customerId, data.behaviorEvent);
        }).catch(console.error);
      });

      webSocketManager.subscribe('recommendation_interaction', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Track recommendation performance
        import('../services/realTimeRecommendationEngine.js').then(({ default: realTimeRecommendationEngine }) => {
          realTimeRecommendationEngine.trackRecommendationInteraction(
            data.customerId,
            data.productId,
            data.interactionType,
            data.metadata
          );
        }).catch(console.error);
      });

      webSocketManager.subscribe('inventory_change', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Adjust recommendations based on inventory changes
        import('../services/realTimeRecommendationEngine.js').then(({ default: realTimeRecommendationEngine }) => {
          // Trigger recommendation refresh for all affected customers
          const stats = realTimeRecommendationEngine.getStatistics();
          // In a real implementation, would selectively update affected recommendations
        }).catch(console.error);
      });

      webSocketManager.subscribe('pricing_change', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Adjust recommendations based on pricing changes
        import('../services/realTimeRecommendationEngine.js').then(({ default: realTimeRecommendationEngine }) => {
          // Trigger recommendation refresh for customers with affected products
          const context = { pricing: { [data.productId]: data.priceChange } };
          // Would trigger selective updates in real implementation
        }).catch(console.error);
      });

      // Churn risk events
      webSocketManager.subscribe('churn_risk_alert', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to churn risk service
        import('../services/churnRiskService.js').then(({ default: churnRiskService }) => {
          const riskScore = churnRiskService.calculateChurnRisk(data.customerId, data.churnData);
          
          // Update customer behavior store with high-risk alerts
          if (riskScore.riskLevel === 'high' || riskScore.riskLevel === 'critical') {
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              store.churnAlerts.unshift({
                customerId: data.customerId,
                riskScore: riskScore.score,
                riskLevel: riskScore.riskLevel,
                primaryFactors: riskScore.factors.slice(0, 3),
                interventions: riskScore.interventions.filter(i => i.urgency === 'immediate'),
                timestamp: new Date().toISOString(),
                id: `churn-alert-${Date.now()}`
              });
            }).catch(console.error);
          }
        }).catch(console.error);
      });

      webSocketManager.subscribe('churn_prediction', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle real-time churn predictions from server
        import('../services/churnRiskService.js').then(({ default: churnRiskService }) => {
          // Update local predictions with server data
          const bulkPredictions = churnRiskService.analyzeCustomerBatch(data.customerIds);
          
          // Store predictions for dashboard display
          import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
            const store = useCustomerBehaviorStore.getState();
            
            bulkPredictions.forEach(prediction => {
              store.churnPredictions.set(prediction.customerId, {
                ...prediction,
                serverPredicted: true,
                lastUpdated: new Date().toISOString()
              });
            });
          }).catch(console.error);
        }).catch(console.error);
      });

      webSocketManager.subscribe('churn_intervention', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle intervention tracking and success metrics
        import('../services/churnRiskService.js').then(({ default: churnRiskService }) => {
          const interventionResult = churnRiskService.trackInterventionOutcome(
            data.customerId,
            data.interventionType,
            data.outcome,
            data.metadata
          );
          
          // Update insights with intervention effectiveness
          if (interventionResult) {
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              store.churnInterventions.unshift({
                ...interventionResult,
                realTime: true,
                timestamp: new Date().toISOString(),
                id: `intervention-${Date.now()}`
              });
            }).catch(console.error);
          }
        }).catch(console.error);
      });

      // Dynamic pricing events
      webSocketManager.subscribe('price_optimization', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to dynamic pricing service
        import('../services/dynamicPricingService.js').then(({ default: dynamicPricingService }) => {
          const optimization = dynamicPricingService.optimizeProductPrice(
            data.productId,
            data.currentPrice,
            data.context
          );
          
          // Update customer behavior store with pricing optimizations
          import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
            const store = useCustomerBehaviorStore.getState();
            store.pricingOptimizations.unshift({
              ...optimization,
              realTime: true,
              timestamp: new Date().toISOString(),
              id: `price-opt-${Date.now()}`
            });
          }).catch(console.error);
        }).catch(console.error);
      });

      webSocketManager.subscribe('dynamic_pricing', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle batch pricing updates from server
        import('../services/dynamicPricingService.js').then(({ default: dynamicPricingService }) => {
          const batchOptimizations = dynamicPricingService.optimizeBatchPricing(
            data.productIds,
            data.context
          );
          
          // Store batch optimizations for dashboard display
          import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
            const store = useCustomerBehaviorStore.getState();
            
            batchOptimizations.optimizations.forEach(optimization => {
              store.pricingUpdates.set(optimization.productId, {
                ...optimization,
                serverOptimized: true,
                batchId: data.batchId,
                lastUpdated: new Date().toISOString()
              });
            });
          }).catch(console.error);
        }).catch(console.error);
      });

      webSocketManager.subscribe('pricing_alert', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle pricing alerts and competitive intelligence
        import('../services/dynamicPricingService.js').then(({ default: dynamicPricingService }) => {
          // Track competitive pricing changes
          if (data.type === 'competitor_price_change') {
            // Generate counter-pricing recommendations
            const recommendations = dynamicPricingService.getCategoryPricingRecommendations(
              data.categoryId,
              { competitorPricing: data.competitorData }
            );
            
            // Update insights with competitive alerts
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              store.pricingAlerts.unshift({
                type: data.type,
                message: data.message,
                urgency: data.urgency,
                recommendations: recommendations.slice(0, 5),
                competitorData: data.competitorData,
                timestamp: new Date().toISOString(),
                id: `pricing-alert-${Date.now()}`
              });
            }).catch(console.error);
          }
        }).catch(console.error);
      });

      // Customer satisfaction events
      webSocketManager.subscribe('satisfaction_score', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to customer satisfaction service
        import('../services/customerSatisfactionService.js').then(({ default: customerSatisfactionService }) => {
          const satisfactionScore = customerSatisfactionService.calculateSatisfactionScore(
            data.customerId,
            data.feedbackData,
            data.context
          );
          
          // Update customer behavior store with satisfaction scores
          import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
            const store = useCustomerBehaviorStore.getState();
            store.satisfactionScores.set(data.customerId, {
              ...satisfactionScore,
              realTime: true,
              timestamp: new Date().toISOString(),
              id: `satisfaction-${Date.now()}`
            });

            // Add satisfaction trend to insights
            if (satisfactionScore.trendDirection === 'declining') {
              store.customerInsights.unshift({
                type: 'satisfaction_decline',
                message: `Customer ${data.customerId} satisfaction declining (${satisfactionScore.overallScore.toFixed(1)}%)`,
                action: satisfactionScore.recommendations[0]?.action || 'Monitor closely',
                priority: satisfactionScore.satisfactionLevel === 'unsatisfied' ? 'high' : 'medium',
                customerId: data.customerId,
                timestamp: new Date().toISOString(),
                id: `satisfaction-insight-${Date.now()}`
              });
            }
          }).catch(console.error);
        }).catch(console.error);
      });

      webSocketManager.subscribe('satisfaction_feedback', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Process real-time customer feedback
        import('../services/customerSatisfactionService.js').then(({ default: customerSatisfactionService }) => {
          const feedbackResult = customerSatisfactionService.processRealtimeFeedback(
            data.customerId,
            data.feedbackType,
            data.feedbackData
          );
          
          // Store feedback processing results
          import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
            const store = useCustomerBehaviorStore.getState();
            
            // Update satisfaction feedback history
            store.satisfactionFeedback.unshift({
              ...feedbackResult.processed,
              satisfactionUpdate: feedbackResult.updatedSatisfaction,
              alerts: feedbackResult.alertsTriggered,
              realTime: true,
              timestamp: new Date().toISOString(),
              id: `feedback-${Date.now()}`
            });

            // Update customer satisfaction score
            store.satisfactionScores.set(data.customerId, feedbackResult.updatedSatisfaction);
          }).catch(console.error);
        }).catch(console.error);
      });

      webSocketManager.subscribe('satisfaction_alert', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle satisfaction alerts and urgent notifications
        import('../services/customerSatisfactionService.js').then(({ default: customerSatisfactionService }) => {
          // Process satisfaction alert
          if (data.type === 'low_satisfaction' || data.type === 'satisfaction_drop') {
            // Get detailed satisfaction analysis
            const satisfactionAnalysis = customerSatisfactionService.calculateSatisfactionScore(
              data.customerId,
              data.additionalData || {},
              { alertTriggered: true, alertType: data.type }
            );
            
            // Update alerts in customer behavior store
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              store.satisfactionAlerts.unshift({
                type: data.type,
                customerId: data.customerId,
                currentScore: satisfactionAnalysis.overallScore,
                satisfactionLevel: satisfactionAnalysis.satisfactionLevel,
                urgency: data.urgency || 'high',
                message: data.message,
                recommendations: satisfactionAnalysis.recommendations,
                insights: satisfactionAnalysis.insights,
                timestamp: new Date().toISOString(),
                id: `sat-alert-${Date.now()}`
              });
            }).catch(console.error);
          }
        }).catch(console.error);
      });

      // Real-time inventory events
      webSocketManager.subscribe('stock_update', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to real-time inventory service
        import('../services/realTimeInventoryService.js').then(({ default: realTimeInventoryService }) => {
          const updateResult = realTimeInventoryService.updateInventoryItem(
            data.itemId,
            data.stockChange,
            data.context || {}
          );
          
          // Update customer behavior store with inventory updates
          import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
            const store = useCustomerBehaviorStore.getState();
            
            // Update inventory tracking
            store.inventoryUpdates.set(data.itemId, {
              ...updateResult.item,
              realTime: true,
              timestamp: new Date().toISOString(),
              id: `inventory-${Date.now()}`
            });

            // Add critical alerts to insights
            if (updateResult.alerts.length > 0) {
              updateResult.alerts.forEach(alert => {
                if (alert.priority === 'critical' || alert.priority === 'high') {
                  store.inventoryInsights.unshift({
                    type: 'inventory_alert',
                    message: alert.message,
                    action: alert.action,
                    priority: alert.priority,
                    itemId: data.itemId,
                    itemName: alert.itemName,
                    timestamp: new Date().toISOString(),
                    id: `inv-insight-${Date.now()}`
                  });
                }
              });
            }
          }).catch(console.error);
        }).catch(console.error);
      });

      webSocketManager.subscribe('inventory_alert', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle critical inventory alerts
        import('../services/realTimeInventoryService.js').then(({ default: realTimeInventoryService }) => {
          // Process the alert and get item analysis
          const item = realTimeInventoryService.inventoryData.get(data.itemId);
          if (item) {
            const analysis = realTimeInventoryService.analyzeInventoryItem(item, {
              alertTriggered: true,
              alertType: data.type
            });
            
            // Update inventory alerts in store
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              store.inventoryAlerts.unshift({
                type: data.type,
                itemId: data.itemId,
                itemName: data.itemName,
                currentStock: data.currentStock,
                threshold: data.threshold,
                urgency: data.urgency || 'high',
                message: data.message,
                recommendations: analysis.recommendations || [],
                riskScore: analysis.riskScore,
                timestamp: new Date().toISOString(),
                id: `inv-alert-${Date.now()}`
              });
            }).catch(console.error);
          }
        }).catch(console.error);
      });

      webSocketManager.subscribe('stock_movement', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle real-time stock movements (sales, deliveries, adjustments)
        import('../services/realTimeInventoryService.js').then(({ default: realTimeInventoryService }) => {
          // Update multiple items if it's a batch movement
          if (data.movements && Array.isArray(data.movements)) {
            const itemIds = data.movements.map(m => m.itemId);
            const batchResult = realTimeInventoryService.batchMonitorInventory(itemIds, {
              batchMovement: true,
              movementType: data.type
            });
            
            // Store batch movement results
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              
              batchResult.results.forEach(result => {
                store.stockMovements.unshift({
                  itemId: result.itemId,
                  movementType: data.type,
                  details: result.item,
                  alerts: result.alerts,
                  recommendations: result.recommendations,
                  batchId: data.batchId,
                  timestamp: new Date().toISOString(),
                  id: `movement-${Date.now()}-${result.itemId}`
                });
              });

              // Add batch insights
              if (batchResult.summary.criticalItems > 0) {
                store.inventoryInsights.unshift({
                  type: 'batch_critical_items',
                  message: `Batch movement resulted in ${batchResult.summary.criticalItems} critical items`,
                  action: 'Review critical items and place orders',
                  priority: 'high',
                  batchId: data.batchId,
                  timestamp: new Date().toISOString(),
                  id: `batch-insight-${Date.now()}`
                });
              }
            }).catch(console.error);
          } else {
            // Handle single item movement
            const updateResult = realTimeInventoryService.updateInventoryItem(
              data.itemId,
              data.stockChange,
              { movementType: data.type, ...data.context }
            );
            
            // Store single movement
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              store.stockMovements.unshift({
                itemId: data.itemId,
                movementType: data.type,
                stockChange: data.stockChange,
                details: updateResult.item,
                alerts: updateResult.alerts,
                recommendations: updateResult.recommendations,
                timestamp: new Date().toISOString(),
                id: `movement-${Date.now()}`
              });
            }).catch(console.error);
          }
        }).catch(console.error);
      });

      // Depletion prediction events
      webSocketManager.subscribe('depletion_prediction', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to depletion prediction service
        import('../services/depletionPredictionService.js').then(({ default: depletionPredictionService }) => {
          const prediction = depletionPredictionService.predictItemDepletion(
            data.itemId,
            data.currentStock,
            data.context || {}
          );
          
          // Update customer behavior store with depletion predictions
          import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
            const store = useCustomerBehaviorStore.getState();
            
            // Store depletion prediction
            store.depletionPredictions.set(data.itemId, {
              ...prediction,
              realTime: true,
              timestamp: new Date().toISOString(),
              id: `depletion-${Date.now()}`
            });

            // Add critical depletion insights
            if (prediction.predictedDepletion.urgency === 'critical' || prediction.predictedDepletion.urgency === 'urgent') {
              store.depletionInsights.unshift({
                type: 'critical_depletion',
                message: `URGENT: ${data.itemId} will deplete in ${Math.round(prediction.predictedDepletion.daysToDepletion)} days`,
                action: 'Emergency reorder required',
                priority: prediction.predictedDepletion.urgency,
                itemId: data.itemId,
                daysToDepletion: prediction.predictedDepletion.daysToDepletion,
                confidence: prediction.predictedDepletion.confidence,
                timestamp: new Date().toISOString(),
                id: `depletion-insight-${Date.now()}`
              });
            }
          }).catch(console.error);
        }).catch(console.error);
      });

      webSocketManager.subscribe('depletion_alert', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle critical depletion alerts
        import('../services/depletionPredictionService.js').then(({ default: depletionPredictionService }) => {
          // Get updated prediction for the alerted item
          const updatedPrediction = depletionPredictionService.predictItemDepletion(
            data.itemId,
            data.currentStock,
            { alertTriggered: true, alertType: data.type, ...data.context }
          );
          
          // Update depletion alerts in store
          import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
            const store = useCustomerBehaviorStore.getState();
            store.depletionAlerts.unshift({
              type: data.type,
              itemId: data.itemId,
              itemName: data.itemName,
              currentStock: data.currentStock,
              predictedDepletion: updatedPrediction.predictedDepletion,
              urgency: data.urgency || updatedPrediction.predictedDepletion.urgency,
              message: data.message,
              recommendations: updatedPrediction.recommendations,
              modelAccuracy: updatedPrediction.predictedDepletion.accuracy,
              timestamp: new Date().toISOString(),
              id: `depletion-alert-${Date.now()}`
            });
          }).catch(console.error);
        }).catch(console.error);
      });

      webSocketManager.subscribe('depletion_update', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Handle batch depletion prediction updates
        import('../services/depletionPredictionService.js').then(({ default: depletionPredictionService }) => {
          if (data.items && Array.isArray(data.items)) {
            // Batch prediction update
            const batchResult = depletionPredictionService.batchPredictDepletion(
              data.items,
              { batchUpdate: true, ...data.context }
            );
            
            // Store batch prediction results
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              
              // Update predictions for all items
              batchResult.predictions.forEach(prediction => {
                store.depletionPredictions.set(prediction.itemId, {
                  ...prediction,
                  batchProcessed: true,
                  batchId: data.batchId,
                  timestamp: new Date().toISOString()
                });
              });

              // Add batch insights
              if (batchResult.summary.criticalDepletions > 0) {
                store.depletionInsights.unshift({
                  type: 'batch_critical_depletions',
                  message: `Batch update: ${batchResult.summary.criticalDepletions} items require immediate attention`,
                  action: 'Review critical depletion list and place orders',
                  priority: 'high',
                  batchId: data.batchId,
                  criticalItems: batchResult.summary.criticalDepletions,
                  averageAccuracy: batchResult.summary.averageAccuracy,
                  timestamp: new Date().toISOString(),
                  id: `batch-depletion-${Date.now()}`
                });
              }

              // Track model performance
              store.depletionModelStats = {
                ...batchResult.batchInsights,
                lastBatchUpdate: new Date().toISOString(),
                itemsProcessed: batchResult.summary.totalItems,
                processingTime: batchResult.summary.processingTime
              };
            }).catch(console.error);
          } else {
            // Single item depletion update
            const prediction = depletionPredictionService.predictItemDepletion(
              data.itemId,
              data.currentStock,
              { realTimeUpdate: true, ...data.context }
            );
            
            // Store single item update
            import('./customerBehaviorStore.js').then(({ default: useCustomerBehaviorStore }) => {
              const store = useCustomerBehaviorStore.getState();
              store.depletionPredictions.set(data.itemId, {
                ...prediction,
                realTimeUpdate: true,
                timestamp: new Date().toISOString(),
                id: `depletion-update-${Date.now()}`
              });

              // Track velocity changes
              if (prediction.depletionMetrics.velocity > 0) {
                store.depletionVelocityUpdates.unshift({
                  itemId: data.itemId,
                  velocity: prediction.depletionMetrics.velocity,
                  acceleration: prediction.depletionMetrics.acceleration,
                  momentum: prediction.depletionMetrics.momentum,
                  timestamp: new Date().toISOString(),
                  id: `velocity-${Date.now()}`
                });
              }
            }).catch(console.error);
          }
        }).catch(console.error);
      });

      // Demand forecasting events
      webSocketManager.subscribe('demand_forecast', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to demand forecasting service
        import('../services/demandForecastingService.js').then(({ default: demandForecastingService }) => {
          const forecast = demandForecastingService.forecastDemand(
            data.itemId,
            data.forecastPeriod || 7,
            data.context || {}
          );
          
          // Store demand forecast
          set((state) => {
            if (!state.demandForecasts) state.demandForecasts = [];
            
            const existingIndex = state.demandForecasts.findIndex(f => f.itemId === data.itemId);
            if (existingIndex >= 0) {
              state.demandForecasts[existingIndex] = forecast;
            } else {
              state.demandForecasts.unshift(forecast);
            }
            
            // Keep only last 50 forecasts
            if (state.demandForecasts.length > 50) {
              state.demandForecasts = state.demandForecasts.slice(0, 50);
            }
            
            // Add insight for high demand forecasts
            if (forecast.peakDemand > forecast.averageDailyDemand * 1.8) {
              state.realtimeData.insights.unshift({
                type: 'high_demand_forecast',
                message: `High demand spike predicted for ${data.itemName || 'Item'}: ${forecast.peakDemand} units`,
                action: 'Prepare additional inventory',
                priority: 'high',
                timestamp: new Date().toISOString(),
                id: `demand-${data.itemId}-${Date.now()}`
              });
            }
          });
        }).catch(console.error);
      });

      webSocketManager.subscribe('demand_alert', (data) => {
        set((state) => {
          if (!state.demandAlerts) state.demandAlerts = [];
          
          state.demandAlerts.unshift({
            ...data,
            timestamp: new Date().toISOString(),
            id: `demand-alert-${data.itemId}-${Date.now()}`
          });
          
          // Keep only last 30 alerts
          if (state.demandAlerts.length > 30) {
            state.demandAlerts = state.demandAlerts.slice(0, 30);
          }
          
          state.totalMessagesReceived += 1;
        });
      });

      webSocketManager.subscribe('forecast_adjustment', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Apply real-time adjustments to forecasts
        import('../services/demandForecastingService.js').then(({ default: demandForecastingService }) => {
          if (data.historicalData) {
            demandForecastingService.updateHistoricalData(data.itemId, data.historicalData);
          }
          
          // Trigger new forecast with updated data
          const updatedForecast = demandForecastingService.forecastDemand(
            data.itemId,
            data.forecastPeriod || 7,
            data.context || {}
          );
          
          // Update stored forecast
          set((state) => {
            if (!state.demandForecasts) state.demandForecasts = [];
            
            const existingIndex = state.demandForecasts.findIndex(f => f.itemId === data.itemId);
            if (existingIndex >= 0) {
              state.demandForecasts[existingIndex] = updatedForecast;
            }
          });
        }).catch(console.error);
      });

      // Dynamic reorder point events
      webSocketManager.subscribe('reorder_calculation', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Forward to dynamic reorder service
        import('../services/dynamicReorderService.js').then(({ default: dynamicReorderService }) => {
          const calculation = dynamicReorderService.calculateDynamicReorderPoint(
            data.itemId,
            data.context || {}
          );
          
          // Store reorder calculation
          set((state) => {
            if (!state.reorderCalculations) state.reorderCalculations = [];
            
            const existingIndex = state.reorderCalculations.findIndex(c => c.itemId === data.itemId);
            if (existingIndex >= 0) {
              state.reorderCalculations[existingIndex] = calculation;
            } else {
              state.reorderCalculations.unshift(calculation);
            }
            
            // Keep only last 50 calculations
            if (state.reorderCalculations.length > 50) {
              state.reorderCalculations = state.reorderCalculations.slice(0, 50);
            }
            
            // Add insight for critical reorders
            if (calculation.urgency === 'critical') {
              state.realtimeData.insights.unshift({
                type: 'critical_reorder',
                message: `Critical reorder required for ${data.itemName || 'Item'}: ${calculation.optimalOrderQuantity} units`,
                action: 'Place emergency order immediately',
                priority: 'critical',
                timestamp: new Date().toISOString(),
                id: `reorder-${data.itemId}-${Date.now()}`
              });
            }
          });
        }).catch(console.error);
      });

      webSocketManager.subscribe('reorder_alert', (data) => {
        set((state) => {
          if (!state.reorderAlerts) state.reorderAlerts = [];
          
          state.reorderAlerts.unshift({
            ...data,
            timestamp: new Date().toISOString(),
            id: `reorder-alert-${data.itemId}-${Date.now()}`
          });
          
          // Keep only last 30 alerts
          if (state.reorderAlerts.length > 30) {
            state.reorderAlerts = state.reorderAlerts.slice(0, 30);
          }
          
          state.totalMessagesReceived += 1;
        });
      });

      webSocketManager.subscribe('reorder_update', (data) => {
        set((state) => {
          state.totalMessagesReceived += 1;
        });
        
        // Apply real-time updates to reorder calculations
        import('../services/dynamicReorderService.js').then(({ default: dynamicReorderService }) => {
          if (data.inventoryData) {
            dynamicReorderService.updateInventoryData(data.itemId, data.inventoryData);
          }
          
          if (data.supplierData && data.supplierId) {
            dynamicReorderService.updateSupplierData(data.supplierId, data.supplierData);
          }
          
          // Recalculate reorder point with updated data
          const updatedCalculation = dynamicReorderService.calculateDynamicReorderPoint(
            data.itemId,
            { recalculation: true, ...data.context }
          );
          
          // Update stored calculation
          set((state) => {
            if (!state.reorderCalculations) state.reorderCalculations = [];
            
            const existingIndex = state.reorderCalculations.findIndex(c => c.itemId === data.itemId);
            if (existingIndex >= 0) {
              state.reorderCalculations[existingIndex] = updatedCalculation;
            }
          });
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
        'customer_insights',
        'churn_risk_alert',
        'churn_prediction',
        'churn_intervention',
        'price_optimization',
        'dynamic_pricing',
        'pricing_alert',
        'satisfaction_score',
        'satisfaction_feedback',
        'satisfaction_alert',
        'stock_update',
        'inventory_alert',
        'stock_movement',
        'depletion_prediction',
        'depletion_alert',
        'depletion_update'
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