/**
 * OMNIX AI - Behavior Analytics Web Worker
 * Handles heavy computation tasks for customer behavior analysis
 * Prevents UI thread blocking during intensive data processing
 */

class BehaviorAnalyticsWorker {
  constructor() {
    this.patterns = {
      purchasePatterns: new Map(),
      browsingPatterns: new Map(),
      timeBasedPatterns: new Map(),
      locationPatterns: new Map(),
      seasonalPatterns: new Map()
    };

    this.behaviorScores = new Map();
    this.engagementLevels = new Map();
    this.churnRisk = new Map();

    // Performance optimization: batch processing
    this.processingQueue = [];
    this.isProcessing = false;
  }

  /**
   * Process behavior data with performance optimization
   */
  async processBehaviorData(behaviorData, allBehaviors = []) {
    try {
      const results = {
        analytics: null,
        patterns: null,
        scores: null,
        alerts: null,
        insights: null
      };

      // Use requestIdleCallback-like behavior for non-blocking processing
      const processChunk = (callback) => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(callback, { timeout: 50 });
        } else {
          setTimeout(callback, 0);
        }
      };

      // Process analytics in chunks
      await new Promise((resolve) => {
        processChunk(() => {
          results.analytics = this.processAnalytics(behaviorData);
          resolve();
        });
      });

      // Process patterns in chunks
      await new Promise((resolve) => {
        processChunk(() => {
          results.patterns = this.processPatterns(behaviorData, allBehaviors);
          resolve();
        });
      });

      // Process behavior scores
      await new Promise((resolve) => {
        processChunk(() => {
          results.scores = this.processBehaviorScores(behaviorData);
          resolve();
        });
      });

      // Process alerts
      await new Promise((resolve) => {
        processChunk(() => {
          results.alerts = this.processAlerts(behaviorData, allBehaviors);
          resolve();
        });
      });

      // Generate insights
      await new Promise((resolve) => {
        processChunk(() => {
          results.insights = this.processInsights(allBehaviors);
          resolve();
        });
      });

      return results;
    } catch (error) {
      console.error('Error processing behavior data:', error);
      throw error;
    }
  }

  /**
   * Process analytics data
   */
  processAnalytics(behavior) {
    return {
      deviceUpdate: behavior.device ? { [behavior.device]: 1 } : null,
      pageUpdate: behavior.page ? { [behavior.page]: 1 } : null,
      locationUpdate: behavior.location ? { [behavior.location]: 1 } : null,
      totalEvents: 1,
      uniqueCustomer: behavior.customerId,
      timestamp: behavior.timestamp
    };
  }

  /**
   * Process behavioral patterns with optimization
   */
  processPatterns(behavior, allBehaviors) {
    const patterns = {};

    // Purchase pattern detection (optimized)
    if (behavior.is_purchase) {
      const customerId = behavior.customerId;
      const customerPurchases = allBehaviors.filter(b => 
        b.customerId === customerId && b.is_purchase
      );

      if (customerPurchases.length > 1) {
        // Optimized time calculation
        const purchaseTimes = customerPurchases.map(p => new Date(p.timestamp).getTime());
        const timeDiffs = [];
        
        for (let i = 0; i < purchaseTimes.length - 1; i++) {
          timeDiffs.push(purchaseTimes[i + 1] - purchaseTimes[i]);
        }

        const avgTimeBetween = timeDiffs.reduce((sum, time) => sum + time, 0) / timeDiffs.length;
        const avgValue = customerPurchases.reduce((sum, p) => sum + (p.value || 0), 0) / customerPurchases.length;

        patterns.purchasePattern = {
          customerId,
          frequency: avgTimeBetween,
          totalPurchases: customerPurchases.length,
          avgValue,
          lastPurchase: behavior.timestamp,
          pattern: avgTimeBetween < 7 * 24 * 60 * 60 * 1000 ? 'frequent' : 'occasional'
        };
      }
    }

    // Time-based pattern detection (optimized)
    if (behavior.type === 'page_view') {
      const hour = new Date(behavior.timestamp).getHours();
      const timeSlot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      
      patterns.timePattern = { timeSlot, count: 1 };
    }

    // Product browsing patterns (optimized)
    if (behavior.product?.category) {
      patterns.browsingPattern = { category: behavior.product.category, count: 1 };
    }

    return patterns;
  }

  /**
   * Process behavior scores with optimization
   */
  processBehaviorScores(behavior) {
    const customerId = behavior.customerId;
    
    // Score updates mapping (cached for performance)
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
    
    return {
      customerId,
      engagementIncrease: scoreIncrease,
      purchaseIncrease: behavior.is_purchase ? 20 : 0,
      timestamp: behavior.timestamp,
      behaviorType: behavior.type
    };
  }

  /**
   * Process behavioral alerts with optimization
   */
  processAlerts(behavior, recentBehaviors = []) {
    const alerts = [];

    // High-value purchase alert
    if (behavior.is_purchase && behavior.value > 1000) {
      alerts.push({
        type: 'high_value_purchase',
        severity: 'info',
        customerId: behavior.customerId,
        message: `High-value purchase: $${behavior.value}`,
        timestamp: behavior.timestamp,
        value: behavior.value
      });
    }

    // Rapid engagement detection (optimized)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const rapidBehaviors = recentBehaviors.filter(b => 
      b.customerId === behavior.customerId && 
      new Date(b.timestamp).getTime() > tenMinutesAgo
    );

    if (rapidBehaviors.length > 10) {
      alerts.push({
        type: 'rapid_engagement',
        severity: 'info',
        customerId: behavior.customerId,
        message: `Rapid engagement detected (${rapidBehaviors.length} actions)`,
        timestamp: behavior.timestamp,
        actionCount: rapidBehaviors.length
      });
    }

    return alerts;
  }

  /**
   * Process insights with optimization
   */
  processInsights(behaviors) {
    if (!behaviors || behaviors.length === 0) {
      return {
        topBehaviors: [],
        emergingPatterns: [],
        trends: []
      };
    }

    // Filter last 24 hours efficiently
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = behaviors.filter(b => 
      new Date(b.timestamp).getTime() > twentyFourHoursAgo
    );

    // Top behaviors (optimized counting)
    const behaviorCounts = recent.reduce((acc, b) => {
      acc[b.type] = (acc[b.type] || 0) + 1;
      return acc;
    }, {});

    const topBehaviors = Object.entries(behaviorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / recent.length) * 100
      }));

    // Hourly activity patterns (optimized)
    const hourlyActivity = recent.reduce((acc, b) => {
      const hour = new Date(b.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakHours = Object.entries(hourlyActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Activity trends (optimized)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

    const currentHourActivity = recent.filter(b => 
      new Date(b.timestamp).getTime() > oneHourAgo
    ).length;

    const previousHourActivity = recent.filter(b => {
      const time = new Date(b.timestamp).getTime();
      return time <= oneHourAgo && time > twoHoursAgo;
    }).length;

    const trends = [];
    if (previousHourActivity > 0) {
      const change = ((currentHourActivity - previousHourActivity) / previousHourActivity) * 100;
      trends.push({
        metric: 'hourly_activity',
        change,
        direction: change > 0 ? 'up' : 'down',
        description: `Activity ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}%`
      });
    }

    return {
      topBehaviors,
      emergingPatterns: [
        {
          type: 'peak_hours',
          data: peakHours,
          description: `Peak activity: ${peakHours.map(p => `${p.hour}:00`).join(', ')}`
        }
      ],
      trends
    };
  }

  /**
   * Batch process multiple behaviors for efficiency
   */
  async batchProcessBehaviors(behaviors) {
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < behaviors.length; i += batchSize) {
      const batch = behaviors.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(behavior => this.processBehaviorData(behavior, behaviors))
      );
      results.push(...batchResults);

      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
  }
}

// Web Worker message handling
let worker = null;

self.onmessage = async function(e) {
  const { type, data, id } = e.data;

  if (!worker) {
    worker = new BehaviorAnalyticsWorker();
  }

  try {
    let result = null;

    switch (type) {
      case 'PROCESS_BEHAVIOR':
        result = await worker.processBehaviorData(data.behavior, data.allBehaviors);
        break;
      
      case 'BATCH_PROCESS':
        result = await worker.batchProcessBehaviors(data.behaviors);
        break;
      
      case 'PROCESS_INSIGHTS':
        result = await worker.processInsights(data.behaviors);
        break;
      
      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    self.postMessage({
      type: 'SUCCESS',
      id,
      result
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

// Handle worker termination
self.onclose = function() {
  if (worker) {
    worker = null;
  }
};