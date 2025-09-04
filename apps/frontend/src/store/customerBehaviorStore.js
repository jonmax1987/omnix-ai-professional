/**
 * OMNIX AI - Customer Behavior Store
 * Real-time customer behavior tracking and pattern analysis
 * STREAM-001: Real-time customer behavior tracking
 */

import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import customerBehaviorAnalytics from '../services/customerBehaviorAnalytics';
import segmentMigrationService from '../services/segmentMigrationService';
import consumptionPatternService from '../services/consumptionPatternService';
import { sanitizeCustomerId, sanitizeSessionId, sanitizeBehaviorData, sanitizeConsumptionData, createSanitizedError, securelog } from '../utils/piiSanitizer';
import { BehaviorAnalyticsWorker, optimizedRequestIdleCallback, createDebouncer, BatchProcessor } from '../utils/webWorkerManager';

// Initialize performance optimization components
let behaviorWorker = null;
let behaviorProcessor = null;
let debouncedInsights = null;

const useCustomerBehaviorStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Real-time behavior tracking
        behaviors: [],
        maxBehaviors: 500,
        
        // Customer journey tracking
        customerJourneys: new Map(),
        activeJourneys: new Set(),
        
        // Behavior patterns
        patterns: {
          purchasePatterns: new Map(),
          browsingPatterns: new Map(),
          timeBasedPatterns: new Map(),
          locationPatterns: new Map(),
          seasonalPatterns: new Map()
        },
        
        // Real-time insights
        insights: {
          topBehaviors: [],
          emergingPatterns: [],
          anomalies: [],
          trends: [],
          segments: []
        },
        
        // Behavior analytics
        analytics: {
          totalEvents: 0,
          uniqueCustomers: new Set(),
          sessionDuration: 0,
          conversionRate: 0,
          bounceRate: 0,
          avgTimeOnSite: 0,
          topPages: new Map(),
          deviceBreakdown: new Map(),
          geoBreakdown: new Map()
        },
        
        // Behavior scoring
        behaviorScores: new Map(),
        engagementLevels: new Map(),
        churnRisk: new Map(),
        
        // Real-time alerts
        behaviorAlerts: [],
        thresholds: {
          highEngagement: 80,
          lowEngagement: 30,
          churnRisk: 70,
          anomalyThreshold: 2.5
        },
        
        // Segment migrations
        segmentMigrations: [],
        activeMigrations: new Map(),
        
        // Consumption patterns
        consumptionPatterns: [],
        customerPatterns: new Map(),
        productPatterns: new Map(),
        patternInsights: [],
        
        // Loading and error states
        loading: false,
        error: null,
        lastUpdate: null,

        // Performance monitoring
        performance: {
          processingTimes: [],
          workerStats: null,
          memoryUsage: 0,
          lastCleanup: null,
          avgProcessingTime: 0
        },

        // Cleanup intervals
        cleanupIntervals: new Set(),

        // Actions
        
        /**
         * Track real-time customer behavior event (Performance Optimized)
         */
        trackBehavior: async (behaviorData) => {
          const startTime = performance.now();
          
          try {
            // Initialize worker if needed
            if (!behaviorWorker) {
              behaviorWorker = new BehaviorAnalyticsWorker();
              await behaviorWorker.initialize();
            }

            // Initialize batch processor if needed
            if (!behaviorProcessor) {
              behaviorProcessor = new BatchProcessor(
                async (behaviors) => {
                  await get().processBehaviorBatch(behaviors);
                },
                5, // Batch size
                50  // Delay ms
              );
            }

            const behavior = {
              id: behaviorData.id || `behavior-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              customerId: behaviorData.customerId,
              sessionId: behaviorData.sessionId,
              timestamp: behaviorData.timestamp || new Date().toISOString(),
              
              // Behavior details
              type: behaviorData.type,
              action: behaviorData.action,
              category: behaviorData.category,
              value: behaviorData.value || 0,
              
              // Context data
              page: behaviorData.page,
              product: behaviorData.product,
              search_query: behaviorData.search_query,
              referrer: behaviorData.referrer,
              device: behaviorData.device || 'desktop',
              location: behaviorData.location,
              
              // Session data
              session_duration: behaviorData.session_duration || 0,
              page_views: behaviorData.page_views || 1,
              is_new_customer: behaviorData.is_new_customer || false,
              
              // Behavioral flags
              is_purchase: behaviorData.type === 'purchase',
              is_conversion: behaviorData.is_conversion || false,
              is_bounce: behaviorData.is_bounce || false,
              
              // Metadata
              metadata: behaviorData.metadata || {}
            };

            // Immediate state update (lightweight)
            set((state) => {
              // Add to behaviors array
              state.behaviors.unshift(behavior);
              
              // Limit array size efficiently
              if (state.behaviors.length > state.maxBehaviors) {
                state.behaviors.length = state.maxBehaviors;
              }

              // Quick journey update
              get().updateCustomerJourneyOptimized(behavior);
              
              state.lastUpdate = new Date().toISOString();
            });

            // Defer heavy computations to Web Worker
            optimizedRequestIdleCallback(async () => {
              try {
                const allBehaviors = get().behaviors;
                const processingResult = await behaviorWorker.processBehavior(behavior, allBehaviors);
                
                // Apply worker results to state
                set((state) => {
                  get().applyWorkerResults(processingResult, behavior);
                });
                
              } catch (workerError) {
                console.error('Worker processing failed, falling back to sync:', workerError);
                // Fallback to synchronous processing
                get().processHeavyComputationsSync(behavior);
              }
            });

            // Track performance
            const processingTime = performance.now() - startTime;
            get().updatePerformanceMetrics(processingTime);

          } catch (error) {
            console.error('Error in trackBehavior:', error);
            get().setError(error);
          }
        },

        /**
         * Update customer journey tracking
         */
        updateCustomerJourney: (behavior) =>
          set((state) => {
            const { customerId, sessionId } = behavior;
            const journeyKey = `${customerId}-${sessionId}`;
            
            let journey = state.customerJourneys.get(journeyKey);
            
            if (!journey) {
              journey = {
                customerId,
                sessionId,
                startTime: behavior.timestamp,
                endTime: behavior.timestamp,
                events: [],
                totalValue: 0,
                pageViews: 0,
                duration: 0,
                isActive: true,
                conversionEvents: [],
                touchpoints: []
              };
              
              state.activeJourneys.add(journeyKey);
            }
            
            // Update journey
            journey.events.push(behavior);
            journey.endTime = behavior.timestamp;
            journey.duration = new Date(journey.endTime) - new Date(journey.startTime);
            journey.totalValue += behavior.value || 0;
            
            if (behavior.type === 'page_view') {
              journey.pageViews += 1;
            }
            
            if (behavior.is_conversion || behavior.is_purchase) {
              journey.conversionEvents.push(behavior);
            }
            
            // Track touchpoints
            if (!journey.touchpoints.some(tp => tp.page === behavior.page)) {
              journey.touchpoints.push({
                page: behavior.page,
                timestamp: behavior.timestamp,
                order: journey.touchpoints.length + 1
              });
            }
            
            state.customerJourneys.set(journeyKey, journey);
            
            // Mark as inactive if no activity for 30 minutes
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            if (new Date(journey.endTime) < thirtyMinutesAgo) {
              journey.isActive = false;
              state.activeJourneys.delete(journeyKey);
            }
          }),

        /**
         * Update real-time analytics
         */
        updateAnalytics: (behavior) =>
          set((state) => {
            state.analytics.totalEvents += 1;
            state.analytics.uniqueCustomers.add(behavior.customerId);
            
            // Update device breakdown
            const deviceCount = state.analytics.deviceBreakdown.get(behavior.device) || 0;
            state.analytics.deviceBreakdown.set(behavior.device, deviceCount + 1);
            
            // Update page tracking
            if (behavior.page) {
              const pageCount = state.analytics.topPages.get(behavior.page) || 0;
              state.analytics.topPages.set(behavior.page, pageCount + 1);
            }
            
            // Update geo breakdown
            if (behavior.location) {
              const locationCount = state.analytics.geoBreakdown.get(behavior.location) || 0;
              state.analytics.geoBreakdown.set(behavior.location, locationCount + 1);
            }
            
            // Calculate conversion rate
            const conversions = state.behaviors.filter(b => b.is_conversion).length;
            const sessions = state.activeJourneys.size || 1;
            state.analytics.conversionRate = (conversions / sessions) * 100;
            
            // Calculate bounce rate
            const bounces = state.behaviors.filter(b => b.is_bounce).length;
            state.analytics.bounceRate = (bounces / sessions) * 100;
            
            // Calculate average session duration
            const journeys = Array.from(state.customerJourneys.values());
            const totalDuration = journeys.reduce((sum, journey) => sum + journey.duration, 0);
            state.analytics.avgTimeOnSite = journeys.length > 0 ? totalDuration / journeys.length : 0;
          }),

        /**
         * Detect behavioral patterns
         */
        detectPatterns: (behavior) =>
          set((state) => {
            // Purchase pattern detection
            if (behavior.is_purchase) {
              const customerId = behavior.customerId;
              const purchases = state.behaviors.filter(b => 
                b.customerId === customerId && b.is_purchase
              );
              
              if (purchases.length > 1) {
                // Detect purchase frequency
                const timeBetweenPurchases = purchases.slice(0, -1).map((purchase, index) => {
                  const nextPurchase = purchases[index + 1];
                  return new Date(nextPurchase.timestamp) - new Date(purchase.timestamp);
                });
                
                const avgTimeBetween = timeBetweenPurchases.reduce((sum, time) => sum + time, 0) / timeBetweenPurchases.length;
                
                state.patterns.purchasePatterns.set(customerId, {
                  frequency: avgTimeBetween,
                  totalPurchases: purchases.length,
                  avgValue: purchases.reduce((sum, p) => sum + p.value, 0) / purchases.length,
                  lastPurchase: behavior.timestamp,
                  pattern: avgTimeBetween < 7 * 24 * 60 * 60 * 1000 ? 'frequent' : 'occasional'
                });
              }
            }
            
            // Browsing pattern detection
            if (behavior.type === 'page_view') {
              const hour = new Date(behavior.timestamp).getHours();
              const timeSlot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
              
              const timePattern = state.patterns.timeBasedPatterns.get(timeSlot) || 0;
              state.patterns.timeBasedPatterns.set(timeSlot, timePattern + 1);
            }
            
            // Product browsing patterns
            if (behavior.product) {
              const productPattern = state.patterns.browsingPatterns.get(behavior.product.category) || 0;
              state.patterns.browsingPatterns.set(behavior.product.category, productPattern + 1);
            }
          }),

        /**
         * Update behavior scores and engagement levels
         */
        updateBehaviorScores: (behavior) =>
          set((state) => {
            const customerId = behavior.customerId;
            let score = state.behaviorScores.get(customerId) || {
              engagementScore: 50,
              purchaseScore: 0,
              loyaltyScore: 0,
              activityScore: 0,
              lastUpdate: behavior.timestamp
            };
            
            // Update engagement score based on behavior type
            const scoreUpdates = {
              'page_view': 2,
              'product_view': 5,
              'cart_add': 10,
              'purchase': 25,
              'review': 15,
              'search': 3,
              'wishlist_add': 8
            };
            
            const scoreIncrease = scoreUpdates[behavior.type] || 1;
            score.engagementScore = Math.min(100, score.engagementScore + scoreIncrease);
            
            if (behavior.is_purchase) {
              score.purchaseScore = Math.min(100, score.purchaseScore + 20);
            }
            
            // Activity decay over time
            const timeSinceLastUpdate = new Date(behavior.timestamp) - new Date(score.lastUpdate);
            const decayFactor = Math.max(0, 1 - (timeSinceLastUpdate / (24 * 60 * 60 * 1000))); // Decay over 24 hours
            score.engagementScore = Math.max(0, score.engagementScore * decayFactor);
            
            score.lastUpdate = behavior.timestamp;
            state.behaviorScores.set(customerId, score);
            
            // Set engagement level
            const engagementLevel = score.engagementScore > state.thresholds.highEngagement ? 'high' :
                                  score.engagementScore < state.thresholds.lowEngagement ? 'low' : 'medium';
            
            state.engagementLevels.set(customerId, engagementLevel);
            
            // Calculate churn risk
            const customerBehaviors = state.behaviors.filter(b => b.customerId === customerId);
            const recentBehaviors = customerBehaviors.filter(b => 
              new Date(behavior.timestamp) - new Date(b.timestamp) < 7 * 24 * 60 * 60 * 1000
            );
            
            const churnRiskScore = recentBehaviors.length === 0 ? 100 : 
                                 recentBehaviors.length < 3 ? 80 :
                                 recentBehaviors.length < 10 ? 40 : 10;
                                 
            state.churnRisk.set(customerId, churnRiskScore);
          }),

        /**
         * Check for behavior-based alerts
         */
        checkBehaviorAlerts: (behavior) =>
          set((state) => {
            const alerts = [];
            
            // High-value purchase alert
            if (behavior.is_purchase && behavior.value > 1000) {
              alerts.push({
                id: `alert-${Date.now()}`,
                type: 'high_value_purchase',
                severity: 'info',
                customerId: behavior.customerId,
                message: `High-value purchase: $${behavior.value}`,
                timestamp: behavior.timestamp,
                data: behavior
              });
            }
            
            // Rapid engagement alert
            const recentBehaviors = state.behaviors.filter(b => 
              b.customerId === behavior.customerId && 
              new Date(behavior.timestamp) - new Date(b.timestamp) < 10 * 60 * 1000 // Last 10 minutes
            );
            
            if (recentBehaviors.length > 10) {
              alerts.push({
                id: `alert-${Date.now()}-rapid`,
                type: 'rapid_engagement',
                severity: 'info',
                customerId: behavior.customerId,
                message: `Customer showing rapid engagement (${recentBehaviors.length} actions in 10 mins)`,
                timestamp: behavior.timestamp,
                data: { actionsCount: recentBehaviors.length }
              });
            }
            
            // Anomaly detection
            const customerScore = state.behaviorScores.get(behavior.customerId);
            if (customerScore && Math.abs(customerScore.engagementScore - 50) > state.thresholds.anomalyThreshold * 20) {
              alerts.push({
                id: `alert-${Date.now()}-anomaly`,
                type: 'behavior_anomaly',
                severity: 'warning',
                customerId: behavior.customerId,
                message: `Unusual behavior pattern detected (score: ${customerScore.engagementScore})`,
                timestamp: behavior.timestamp,
                data: customerScore
              });
            }
            
            // Add alerts to state
            state.behaviorAlerts.push(...alerts);
            
            // Keep only last 100 alerts
            if (state.behaviorAlerts.length > 100) {
              state.behaviorAlerts = state.behaviorAlerts.slice(-100);
            }
          }),

        /**
         * Track consumption patterns for purchase behaviors
         */
        trackConsumptionPattern: (behavior) =>
          set((state) => {
            // Sanitize consumption data before processing to prevent PII exposure
            const rawConsumptionData = {
              customerId: behavior.customerId,
              productId: behavior.product?.id || 'unknown',
              category: behavior.product?.category || 'general',
              quantity: behavior.product?.quantity || 1,
              value: behavior.value || 0,
              timestamp: behavior.timestamp,
              metadata: {
                sessionId: behavior.sessionId,
                device: behavior.device,
                location: behavior.location
              }
            };
            
            // Apply PII sanitization for internal processing
            const consumptionData = sanitizeConsumptionData(rawConsumptionData);

            // Track pattern using consumption service
            const patternUpdate = consumptionPatternService.trackConsumption(consumptionData);
            
            if (patternUpdate) {
              // Update store with new patterns
              state.consumptionPatterns.unshift({
                ...patternUpdate,
                id: `pattern-${Date.now()}`
              });
              
              // Keep only last 200 patterns
              if (state.consumptionPatterns.length > 200) {
                state.consumptionPatterns = state.consumptionPatterns.slice(0, 200);
              }
              
              // Update customer patterns map
              if (patternUpdate.patterns && patternUpdate.patterns.length > 0) {
                state.customerPatterns.set(behavior.customerId, {
                  customerId: behavior.customerId,
                  patterns: patternUpdate.patterns,
                  predictions: patternUpdate.predictions,
                  insights: patternUpdate.insights,
                  confidence: patternUpdate.confidence,
                  lastUpdate: patternUpdate.timestamp
                });
              }
              
              // Update product patterns
              if (consumptionData.productId !== 'unknown') {
                const productAnalytics = consumptionPatternService.getCustomerAnalytics(behavior.customerId);
                if (productAnalytics) {
                  state.productPatterns.set(consumptionData.productId, {
                    productId: consumptionData.productId,
                    category: consumptionData.category,
                    customers: new Set([behavior.customerId]),
                    totalConsumption: consumptionData.quantity,
                    lastUpdate: patternUpdate.timestamp
                  });
                }
              }
              
              // Add insights to pattern insights with PII protection
              if (patternUpdate.insights && patternUpdate.insights.length > 0) {
                state.patternInsights.push(...patternUpdate.insights.map(insight => ({
                  ...insight,
                  customerId: sanitizeCustomerId(behavior.customerId), // Sanitize customer ID in insights
                  timestamp: patternUpdate.timestamp,
                  id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                })));
                
                // Keep only last 100 insights
                if (state.patternInsights.length > 100) {
                  state.patternInsights = state.patternInsights.slice(-100);
                }
              }
            }
          }),

        /**
         * Get real-time insights using AI analytics
         */
        generateInsights: () =>
          set((state) => {
            const behaviors = state.behaviors;
            const last24Hours = behaviors.filter(b => 
              new Date() - new Date(b.timestamp) < 24 * 60 * 60 * 1000
            );
            
            // Top behaviors
            const behaviorCounts = {};
            last24Hours.forEach(b => {
              behaviorCounts[b.type] = (behaviorCounts[b.type] || 0) + 1;
            });
            
            state.insights.topBehaviors = Object.entries(behaviorCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([type, count]) => ({ type, count, percentage: (count / last24Hours.length) * 100 }));
            
            // Use AI analytics for each unique customer
            const uniqueCustomers = new Set(behaviors.map(b => b.customerId));
            const customerAnalytics = [];
            
            uniqueCustomers.forEach(customerId => {
              const analysis = customerBehaviorAnalytics.analyzeCustomerBehavior(behaviors, customerId);
              customerAnalytics.push(analysis);
              
              // Update individual customer metrics
              if (analysis.segment) {
                const previousSegment = state.engagementLevels.get(customerId);
                state.engagementLevels.set(customerId, analysis.segment);
                
                // Track segment migration
                if (previousSegment && previousSegment !== analysis.segment) {
                  const migration = segmentMigrationService.trackSegmentChange(
                    customerId,
                    analysis.segment,
                    {
                      score: analysis.score,
                      predictions: analysis.predictions,
                      timestamp: new Date().toISOString()
                    }
                  );
                  
                  if (migration && migration.analysis.isSignificant) {
                    state.segmentMigrations.unshift({
                      ...migration.migration,
                      ...migration.analysis,
                      id: `migration-${Date.now()}`
                    });
                    
                    // Keep only last 100 migrations
                    if (state.segmentMigrations.length > 100) {
                      state.segmentMigrations = state.segmentMigrations.slice(0, 100);
                    }
                    
                    // Add to active migrations if critical
                    if (migration.analysis.severity === 'critical' || migration.analysis.severity === 'high') {
                      state.activeMigrations.set(customerId, migration);
                    }
                  }
                }
              }
              if (analysis.predictions && analysis.predictions.churnRisk) {
                state.churnRisk.set(customerId, analysis.predictions.churnRisk);
              }
            });
            
            // Aggregate insights from AI analysis
            const segments = {};
            customerAnalytics.forEach(analysis => {
              segments[analysis.segment] = (segments[analysis.segment] || 0) + 1;
            });
            
            state.insights.segments = Object.entries(segments)
              .map(([segment, count]) => ({
                segment,
                count,
                percentage: (count / customerAnalytics.length) * 100
              }))
              .sort((a, b) => b.count - a.count);
            
            // Collect anomalies
            const allAnomalies = [];
            customerAnalytics.forEach(analysis => {
              if (analysis.anomalies && analysis.anomalies.length > 0) {
                allAnomalies.push(...analysis.anomalies.map(a => ({
                  ...a,
                  customerId: analysis.customerId
                })));
              }
            });
            state.insights.anomalies = allAnomalies.slice(0, 10);
            
            // Emerging patterns
            const hourlyActivity = {};
            last24Hours.forEach(b => {
              const hour = new Date(b.timestamp).getHours();
              hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
            });
            
            const peakHours = Object.entries(hourlyActivity)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([hour, count]) => ({ hour: parseInt(hour), count }));
            
            state.insights.emergingPatterns = [
              {
                type: 'peak_hours',
                data: peakHours,
                description: `Peak activity hours: ${peakHours.map(p => `${p.hour}:00`).join(', ')}`
              },
              {
                type: 'segment_distribution',
                data: state.insights.segments,
                description: `Top segment: ${state.insights.segments[0]?.segment || 'Unknown'} (${state.insights.segments[0]?.percentage.toFixed(1) || 0}%)`
              }
            ];
            
            // Behavior trends with AI predictions
            const trends = [];
            const currentHourActivity = last24Hours.filter(b => 
              new Date() - new Date(b.timestamp) < 60 * 60 * 1000
            ).length;
            
            const previousHourActivity = last24Hours.filter(b => {
              const hourAgo = new Date() - new Date(b.timestamp);
              return hourAgo >= 60 * 60 * 1000 && hourAgo < 2 * 60 * 60 * 1000;
            }).length;
            
            if (previousHourActivity > 0) {
              const change = ((currentHourActivity - previousHourActivity) / previousHourActivity) * 100;
              trends.push({
                metric: 'hourly_activity',
                change,
                direction: change > 0 ? 'up' : 'down',
                description: `Activity ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% vs last hour`
              });
            }
            
            state.insights.trends = trends;
          }),

        /**
         * Get customer behavior summary
         */
        getCustomerSummary: (customerId) => {
          const state = get();
          const customerBehaviors = state.behaviors.filter(b => b.customerId === customerId);
          const score = state.behaviorScores.get(customerId);
          const engagementLevel = state.engagementLevels.get(customerId);
          const churnRisk = state.churnRisk.get(customerId);
          
          return {
            customerId,
            totalBehaviors: customerBehaviors.length,
            lastActivity: customerBehaviors[0]?.timestamp,
            score,
            engagementLevel,
            churnRisk,
            topActions: customerBehaviors.reduce((acc, b) => {
              acc[b.type] = (acc[b.type] || 0) + 1;
              return acc;
            }, {})
          };
        },

        /**
         * Get real-time behavior metrics
         */
        getMetrics: () => {
          const state = get();
          return {
            ...state.analytics,
            uniqueCustomersCount: state.analytics.uniqueCustomers.size,
            activeBehaviors: state.behaviors.length,
            activeJourneys: state.activeJourneys.size,
            totalPatterns: Object.values(state.patterns).reduce((sum, map) => sum + map.size, 0),
            alertsCount: state.behaviorAlerts.length
          };
        },

        /**
         * Clear old behavior data
         */
        clearOldData: (days = 7) =>
          set((state) => {
            const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            
            state.behaviors = state.behaviors.filter(b => 
              new Date(b.timestamp) > cutoffDate
            );
            
            // Clean up old journeys
            for (const [key, journey] of state.customerJourneys.entries()) {
              if (new Date(journey.endTime) < cutoffDate) {
                state.customerJourneys.delete(key);
                state.activeJourneys.delete(key);
              }
            }
            
            // Clean up old alerts
            state.behaviorAlerts = state.behaviorAlerts.filter(alert =>
              new Date(alert.timestamp) > cutoffDate
            );
          }),

        /**
         * Reset store state
         */
        reset: () =>
          set((state) => {
            state.behaviors = [];
            state.customerJourneys.clear();
            state.activeJourneys.clear();
            state.patterns = {
              purchasePatterns: new Map(),
              browsingPatterns: new Map(),
              timeBasedPatterns: new Map(),
              locationPatterns: new Map(),
              seasonalPatterns: new Map()
            };
            state.insights = {
              topBehaviors: [],
              emergingPatterns: [],
              anomalies: [],
              trends: [],
              segments: []
            };
            state.analytics = {
              totalEvents: 0,
              uniqueCustomers: new Set(),
              sessionDuration: 0,
              conversionRate: 0,
              bounceRate: 0,
              avgTimeOnSite: 0,
              topPages: new Map(),
              deviceBreakdown: new Map(),
              geoBreakdown: new Map()
            };
            state.behaviorScores.clear();
            state.engagementLevels.clear();
            state.churnRisk.clear();
            state.behaviorAlerts = [];
            state.loading = false;
            state.error = null;
            state.lastUpdate = null;
          }),

        /**
         * Set loading state
         */
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
          }),

        /**
         * Set error state with PII sanitization
         */
        setError: (error) =>
          set((state) => {
            // Sanitize error before storing to prevent PII exposure in state
            const sanitizedError = createSanitizedError(error, {
              context: 'CustomerBehaviorStore',
              timestamp: new Date().toISOString()
            });
            
            state.error = sanitizedError;
            state.loading = false;
            
            // Use secure logging for error tracking
            securelog('error', 'CustomerBehaviorStore error occurred', sanitizedError);
          }),

        /**
         * Optimized customer journey update (lightweight)
         */
        updateCustomerJourneyOptimized: (behavior) =>
          set((state) => {
            const { customerId, sessionId } = behavior;
            const journeyKey = `${customerId}-${sessionId}`;
            
            let journey = state.customerJourneys.get(journeyKey);
            
            if (!journey) {
              journey = {
                customerId,
                sessionId,
                startTime: behavior.timestamp,
                endTime: behavior.timestamp,
                events: [],
                totalValue: 0,
                pageViews: 0,
                duration: 0,
                isActive: true,
                conversionEvents: [],
                touchpoints: []
              };
              
              state.activeJourneys.add(journeyKey);
            }
            
            // Optimized updates
            journey.events.push(behavior);
            journey.endTime = behavior.timestamp;
            journey.totalValue += behavior.value || 0;
            
            if (behavior.type === 'page_view') {
              journey.pageViews += 1;
            }
            
            state.customerJourneys.set(journeyKey, journey);
          }),

        /**
         * Apply Web Worker results to state
         */
        applyWorkerResults: (results, behavior) =>
          set((state) => {
            try {
              // Apply analytics updates
              if (results.analytics) {
                const analytics = results.analytics;
                state.analytics.totalEvents += analytics.totalEvents || 0;
                
                if (analytics.uniqueCustomer) {
                  state.analytics.uniqueCustomers.add(analytics.uniqueCustomer);
                }
                
                if (analytics.deviceUpdate) {
                  Object.entries(analytics.deviceUpdate).forEach(([device, count]) => {
                    const currentCount = state.analytics.deviceBreakdown.get(device) || 0;
                    state.analytics.deviceBreakdown.set(device, currentCount + count);
                  });
                }
              }

              // Apply pattern updates
              if (results.patterns) {
                const patterns = results.patterns;
                
                if (patterns.purchasePattern) {
                  state.patterns.purchasePatterns.set(
                    patterns.purchasePattern.customerId, 
                    patterns.purchasePattern
                  );
                }
                
                if (patterns.timePattern) {
                  const current = state.patterns.timeBasedPatterns.get(patterns.timePattern.timeSlot) || 0;
                  state.patterns.timeBasedPatterns.set(
                    patterns.timePattern.timeSlot, 
                    current + patterns.timePattern.count
                  );
                }
              }

              // Apply score updates
              if (results.scores) {
                const scores = results.scores;
                let score = state.behaviorScores.get(scores.customerId) || {
                  engagementScore: 50,
                  purchaseScore: 0,
                  loyaltyScore: 0,
                  activityScore: 0,
                  lastUpdate: scores.timestamp
                };
                
                score.engagementScore = Math.min(100, score.engagementScore + scores.engagementIncrease);
                score.purchaseScore = Math.min(100, score.purchaseScore + scores.purchaseIncrease);
                score.lastUpdate = scores.timestamp;
                
                state.behaviorScores.set(scores.customerId, score);
              }

              // Apply alerts
              if (results.alerts && results.alerts.length > 0) {
                results.alerts.forEach(alert => {
                  state.behaviorAlerts.push({
                    ...alert,
                    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
                  });
                });
                
                // Keep only last 100 alerts
                if (state.behaviorAlerts.length > 100) {
                  state.behaviorAlerts = state.behaviorAlerts.slice(-100);
                }
              }

            } catch (error) {
              console.error('Error applying worker results:', error);
            }
          }),

        /**
         * Fallback synchronous processing for heavy computations
         */
        processHeavyComputationsSync: (behavior) =>
          set((state) => {
            // Simplified synchronous versions of heavy computations
            get().updateAnalytics(behavior);
            get().updateBehaviorScores(behavior);
            
            if (behavior.is_purchase || behavior.type === 'purchase') {
              get().trackConsumptionPattern(behavior);
            }
          }),

        /**
         * Process behavior batch for batch processor
         */
        processBehaviorBatch: async (behaviors) => {
          try {
            if (!behaviorWorker) {
              behaviorWorker = new BehaviorAnalyticsWorker();
              await behaviorWorker.initialize();
            }
            
            const results = await behaviorWorker.batchProcessBehaviors(behaviors);
            
            set((state) => {
              results.forEach((result, index) => {
                get().applyWorkerResults(result, behaviors[index]);
              });
            });
            
          } catch (error) {
            console.error('Batch processing failed:', error);
            // Fallback to individual processing
            behaviors.forEach(behavior => {
              get().processHeavyComputationsSync(behavior);
            });
          }
        },

        /**
         * Update performance metrics
         */
        updatePerformanceMetrics: (processingTime) =>
          set((state) => {
            state.performance.processingTimes.push(processingTime);
            
            // Keep only last 100 measurements
            if (state.performance.processingTimes.length > 100) {
              state.performance.processingTimes = state.performance.processingTimes.slice(-100);
            }
            
            // Calculate average
            state.performance.avgProcessingTime = 
              state.performance.processingTimes.reduce((sum, time) => sum + time, 0) / 
              state.performance.processingTimes.length;
              
            // Update memory usage estimation
            if (typeof performance !== 'undefined' && performance.memory) {
              state.performance.memoryUsage = performance.memory.usedJSHeapSize;
            }
          }),

        /**
         * Get performance metrics
         */
        getPerformanceMetrics: () => {
          const state = get();
          return {
            ...state.performance,
            workerStats: behaviorWorker ? behaviorWorker.getStats() : null,
            queueSize: behaviorProcessor ? behaviorProcessor.getQueueSize() : 0,
            behaviorsCount: state.behaviors.length,
            activeJourneys: state.activeJourneys.size,
            memoryPressure: state.performance.memoryUsage > 50 * 1024 * 1024 // 50MB threshold
          };
        },

        /**
         * Setup automatic cleanup intervals
         */
        setupCleanupIntervals: () => {
          const state = get();
          
          // Clear existing intervals
          state.cleanupIntervals.forEach(intervalId => clearInterval(intervalId));
          state.cleanupIntervals.clear();
          
          // Setup memory cleanup interval (every 5 minutes)
          const memoryCleanupInterval = setInterval(() => {
            get().performMemoryCleanup();
          }, 5 * 60 * 1000);
          
          // Setup data cleanup interval (every hour)  
          const dataCleanupInterval = setInterval(() => {
            get().clearOldData(7); // Keep 7 days of data
          }, 60 * 60 * 1000);
          
          set((state) => {
            state.cleanupIntervals.add(memoryCleanupInterval);
            state.cleanupIntervals.add(dataCleanupInterval);
          });
        },

        /**
         * Perform memory cleanup
         */
        performMemoryCleanup: () =>
          set((state) => {
            // Clear old processing times
            if (state.performance.processingTimes.length > 50) {
              state.performance.processingTimes = state.performance.processingTimes.slice(-50);
            }
            
            // Clear old alerts
            if (state.behaviorAlerts.length > 50) {
              state.behaviorAlerts = state.behaviorAlerts.slice(-50);
            }
            
            // Clear old insights
            if (state.patternInsights.length > 50) {
              state.patternInsights = state.patternInsights.slice(-50);
            }
            
            state.performance.lastCleanup = new Date().toISOString();
          }),

        /**
         * Terminate worker and cleanup resources
         */
        cleanup: () => {
          if (behaviorWorker) {
            behaviorWorker.terminate();
            behaviorWorker = null;
          }
          
          if (behaviorProcessor) {
            behaviorProcessor.clear();
            behaviorProcessor = null;
          }
          
          const state = get();
          state.cleanupIntervals.forEach(intervalId => clearInterval(intervalId));
          
          set((state) => {
            state.cleanupIntervals.clear();
          });
        }
      })),
      {
        name: 'omnix-customer-behavior-store'
      }
    ),
    {
      name: 'CustomerBehaviorStore'
    }
  )
);

export default useCustomerBehaviorStore;