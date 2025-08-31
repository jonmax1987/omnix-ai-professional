/**
 * OMNIX AI - Customer Behavior Analytics Service
 * Advanced AI-powered behavior pattern detection and predictive analytics
 * STREAM-001: Real-time customer behavior tracking
 */

class CustomerBehaviorAnalytics {
  constructor() {
    this.segmentDefinitions = {
      'high_value': {
        criteria: { minPurchaseValue: 500, minFrequency: 2 },
        weight: 1.5
      },
      'frequent_buyer': {
        criteria: { minPurchases: 5, timeframe: 30 },
        weight: 1.3
      },
      'bargain_hunter': {
        criteria: { discountPreference: 0.7, priceComparisonRate: 0.8 },
        weight: 1.0
      },
      'browser': {
        criteria: { browseToCartRatio: 0.1, sessionCount: 10 },
        weight: 0.8
      },
      'churning': {
        criteria: { inactivityDays: 30, decreasedEngagement: 0.5 },
        weight: 0.5
      },
      'new_customer': {
        criteria: { accountAge: 7, firstPurchase: true },
        weight: 1.2
      },
      'loyal': {
        criteria: { accountAge: 365, repeatRate: 0.8, npsScore: 8 },
        weight: 2.0
      }
    };

    this.behaviorWeights = {
      'purchase': 10,
      'cart_add': 5,
      'product_view': 2,
      'search': 3,
      'review': 8,
      'wishlist_add': 4,
      'page_view': 1,
      'share': 6,
      'recommendation_click': 7
    };

    this.anomalyThresholds = {
      rapidActivity: { actions: 20, timeWindow: 300000 }, // 20 actions in 5 minutes
      highSpend: { amount: 2000, timeWindow: 3600000 }, // $2000 in 1 hour
      unusualPattern: { deviation: 3.0 }, // 3 standard deviations
      cartAbandonment: { threshold: 0.7, minCarts: 3 }
    };
  }

  /**
   * Analyze customer behavior patterns using ML-like algorithms
   */
  analyzeCustomerBehavior(behaviors, customerId) {
    const customerBehaviors = behaviors.filter(b => b.customerId === customerId);
    
    if (customerBehaviors.length === 0) {
      return {
        segment: 'new_visitor',
        score: 0,
        predictions: {},
        recommendations: []
      };
    }

    // Calculate behavior metrics
    const metrics = this.calculateBehaviorMetrics(customerBehaviors);
    
    // Determine customer segment
    const segment = this.determineCustomerSegment(metrics);
    
    // Calculate predictive scores
    const predictions = this.generatePredictions(metrics, customerBehaviors);
    
    // Generate personalized recommendations
    const recommendations = this.generateRecommendations(segment, predictions, metrics);
    
    // Detect anomalies
    const anomalies = this.detectAnomalies(customerBehaviors, metrics);

    return {
      customerId,
      segment,
      score: metrics.engagementScore,
      metrics,
      predictions,
      recommendations,
      anomalies,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate comprehensive behavior metrics
   */
  calculateBehaviorMetrics(behaviors) {
    const now = Date.now();
    const last30Days = behaviors.filter(b => 
      now - new Date(b.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000
    );

    // Basic counts
    const purchases = behaviors.filter(b => b.type === 'purchase');
    const cartAdds = behaviors.filter(b => b.type === 'cart_add');
    const productViews = behaviors.filter(b => b.type === 'product_view');
    
    // Calculate conversion rates
    const conversionRate = productViews.length > 0 
      ? purchases.length / productViews.length 
      : 0;
    
    const cartToOrderRate = cartAdds.length > 0
      ? purchases.length / cartAdds.length
      : 0;

    // Calculate engagement score
    let engagementScore = 0;
    behaviors.forEach(b => {
      const weight = this.behaviorWeights[b.type] || 1;
      const recency = 1 - (now - new Date(b.timestamp).getTime()) / (30 * 24 * 60 * 60 * 1000);
      engagementScore += weight * Math.max(0, recency);
    });
    engagementScore = Math.min(100, engagementScore);

    // Calculate average values
    const avgOrderValue = purchases.length > 0
      ? purchases.reduce((sum, p) => sum + (p.value || 0), 0) / purchases.length
      : 0;

    // Session analysis
    const sessions = this.identifySessions(behaviors);
    const avgSessionDuration = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
      : 0;

    // Time-based patterns
    const hourlyDistribution = this.getHourlyDistribution(behaviors);
    const dayOfWeekDistribution = this.getDayOfWeekDistribution(behaviors);
    
    // Product preferences
    const categoryPreferences = this.getCategoryPreferences(behaviors);
    const priceRangePreference = this.getPriceRangePreference(purchases);

    return {
      totalBehaviors: behaviors.length,
      totalPurchases: purchases.length,
      totalSpent: purchases.reduce((sum, p) => sum + (p.value || 0), 0),
      avgOrderValue,
      conversionRate,
      cartToOrderRate,
      engagementScore,
      sessionCount: sessions.length,
      avgSessionDuration,
      lastActivity: behaviors[0]?.timestamp,
      firstActivity: behaviors[behaviors.length - 1]?.timestamp,
      hourlyDistribution,
      dayOfWeekDistribution,
      categoryPreferences,
      priceRangePreference,
      browseToCartRatio: productViews.length > 0 ? cartAdds.length / productViews.length : 0,
      repeatPurchaseRate: this.calculateRepeatPurchaseRate(purchases)
    };
  }

  /**
   * Determine customer segment based on behavior metrics
   */
  determineCustomerSegment(metrics) {
    const segments = [];
    
    // Check each segment criteria
    for (const [segmentName, definition] of Object.entries(this.segmentDefinitions)) {
      let matches = true;
      
      if (definition.criteria.minPurchaseValue && metrics.avgOrderValue < definition.criteria.minPurchaseValue) {
        matches = false;
      }
      
      if (definition.criteria.minPurchases && metrics.totalPurchases < definition.criteria.minPurchases) {
        matches = false;
      }
      
      if (definition.criteria.browseToCartRatio !== undefined && 
          metrics.browseToCartRatio > definition.criteria.browseToCartRatio) {
        matches = false;
      }
      
      if (matches) {
        segments.push({
          name: segmentName,
          weight: definition.weight,
          confidence: this.calculateSegmentConfidence(metrics, definition)
        });
      }
    }
    
    // Return highest weighted segment
    if (segments.length > 0) {
      segments.sort((a, b) => (b.weight * b.confidence) - (a.weight * a.confidence));
      return segments[0].name;
    }
    
    // Default segment based on engagement
    if (metrics.engagementScore > 70) return 'engaged';
    if (metrics.engagementScore > 30) return 'active';
    return 'passive';
  }

  /**
   * Generate predictive analytics
   */
  generatePredictions(metrics, behaviors) {
    const predictions = {};

    // Predict next purchase date
    if (metrics.totalPurchases > 1) {
      const purchaseDates = behaviors
        .filter(b => b.type === 'purchase')
        .map(b => new Date(b.timestamp).getTime());
      
      if (purchaseDates.length > 1) {
        const intervals = [];
        for (let i = 1; i < purchaseDates.length; i++) {
          intervals.push(purchaseDates[i] - purchaseDates[i - 1]);
        }
        
        const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
        const lastPurchase = Math.max(...purchaseDates);
        predictions.nextPurchaseDate = new Date(lastPurchase + avgInterval).toISOString();
        predictions.daysUntilNextPurchase = Math.round(avgInterval / (24 * 60 * 60 * 1000));
      }
    }

    // Predict churn risk
    const daysSinceLastActivity = metrics.lastActivity 
      ? (Date.now() - new Date(metrics.lastActivity).getTime()) / (24 * 60 * 60 * 1000)
      : 999;
    
    predictions.churnRisk = this.calculateChurnRisk(daysSinceLastActivity, metrics.engagementScore);
    
    // Predict lifetime value
    predictions.lifetimeValue = this.predictLifetimeValue(metrics);
    
    // Predict preferred categories
    predictions.preferredCategories = Object.entries(metrics.categoryPreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
    
    // Predict best engagement time
    const peakHour = Object.entries(metrics.hourlyDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    predictions.bestEngagementTime = peakHour ? `${peakHour[0]}:00` : '10:00';

    return predictions;
  }

  /**
   * Generate AI-powered recommendations
   */
  generateRecommendations(segment, predictions, metrics) {
    const recommendations = [];

    // Segment-based recommendations
    switch (segment) {
      case 'high_value':
        recommendations.push({
          type: 'exclusive_offer',
          priority: 'high',
          message: 'Offer exclusive VIP benefits',
          action: 'Send personalized high-value product recommendations'
        });
        break;
        
      case 'churning':
        recommendations.push({
          type: 'retention',
          priority: 'critical',
          message: 'Customer at risk of churning',
          action: 'Send win-back campaign with special discount'
        });
        break;
        
      case 'frequent_buyer':
        recommendations.push({
          type: 'loyalty',
          priority: 'high',
          message: 'Reward frequent purchases',
          action: 'Enroll in loyalty program with bonus points'
        });
        break;
        
      case 'browser':
        recommendations.push({
          type: 'conversion',
          priority: 'medium',
          message: 'Convert browser to buyer',
          action: 'Show limited-time offers on viewed products'
        });
        break;
    }

    // Prediction-based recommendations
    if (predictions.churnRisk > 70) {
      recommendations.push({
        type: 'urgent_retention',
        priority: 'critical',
        message: `High churn risk: ${predictions.churnRisk}%`,
        action: 'Immediate personalized outreach required'
      });
    }

    if (predictions.nextPurchaseDate) {
      const daysUntil = predictions.daysUntilNextPurchase;
      if (daysUntil <= 7) {
        recommendations.push({
          type: 'timely_reminder',
          priority: 'high',
          message: `Expected purchase in ${daysUntil} days`,
          action: 'Send purchase reminder with personalized products'
        });
      }
    }

    // Engagement-based recommendations
    if (metrics.engagementScore < 30) {
      recommendations.push({
        type: 're_engagement',
        priority: 'high',
        message: 'Low engagement detected',
        action: 'Launch re-engagement campaign with incentives'
      });
    }

    return recommendations;
  }

  /**
   * Detect anomalies in customer behavior
   */
  detectAnomalies(behaviors, metrics) {
    const anomalies = [];
    const now = Date.now();

    // Check for rapid activity
    const recentBehaviors = behaviors.filter(b => 
      now - new Date(b.timestamp).getTime() < this.anomalyThresholds.rapidActivity.timeWindow
    );
    
    if (recentBehaviors.length > this.anomalyThresholds.rapidActivity.actions) {
      anomalies.push({
        type: 'rapid_activity',
        severity: 'medium',
        description: `${recentBehaviors.length} actions in last 5 minutes`,
        timestamp: new Date().toISOString()
      });
    }

    // Check for high spend
    const recentPurchases = behaviors.filter(b => 
      b.type === 'purchase' && 
      now - new Date(b.timestamp).getTime() < this.anomalyThresholds.highSpend.timeWindow
    );
    
    const recentSpend = recentPurchases.reduce((sum, p) => sum + (p.value || 0), 0);
    if (recentSpend > this.anomalyThresholds.highSpend.amount) {
      anomalies.push({
        type: 'high_spend',
        severity: 'high',
        description: `$${recentSpend} spent in last hour`,
        timestamp: new Date().toISOString()
      });
    }

    // Check for unusual patterns
    if (metrics.conversionRate > 0.8 || metrics.conversionRate < 0.01) {
      anomalies.push({
        type: 'unusual_conversion',
        severity: 'low',
        description: `Unusual conversion rate: ${(metrics.conversionRate * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }

    return anomalies;
  }

  // Helper methods
  
  identifySessions(behaviors) {
    const sessions = [];
    let currentSession = null;
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    behaviors.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    behaviors.forEach(behavior => {
      const timestamp = new Date(behavior.timestamp).getTime();
      
      if (!currentSession || timestamp - currentSession.endTime > sessionTimeout) {
        if (currentSession) {
          sessions.push(currentSession);
        }
        currentSession = {
          startTime: timestamp,
          endTime: timestamp,
          behaviors: [behavior],
          duration: 0
        };
      } else {
        currentSession.endTime = timestamp;
        currentSession.behaviors.push(behavior);
        currentSession.duration = currentSession.endTime - currentSession.startTime;
      }
    });

    if (currentSession) {
      sessions.push(currentSession);
    }

    return sessions;
  }

  getHourlyDistribution(behaviors) {
    const distribution = {};
    behaviors.forEach(b => {
      const hour = new Date(b.timestamp).getHours();
      distribution[hour] = (distribution[hour] || 0) + 1;
    });
    return distribution;
  }

  getDayOfWeekDistribution(behaviors) {
    const distribution = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    behaviors.forEach(b => {
      const day = days[new Date(b.timestamp).getDay()];
      distribution[day] = (distribution[day] || 0) + 1;
    });
    return distribution;
  }

  getCategoryPreferences(behaviors) {
    const preferences = {};
    behaviors.forEach(b => {
      if (b.product && b.product.category) {
        preferences[b.product.category] = (preferences[b.product.category] || 0) + 1;
      }
    });
    return preferences;
  }

  getPriceRangePreference(purchases) {
    if (purchases.length === 0) return 'unknown';
    
    const avgPrice = purchases.reduce((sum, p) => sum + (p.value || 0), 0) / purchases.length;
    
    if (avgPrice < 50) return 'budget';
    if (avgPrice < 200) return 'mid-range';
    if (avgPrice < 500) return 'premium';
    return 'luxury';
  }

  calculateRepeatPurchaseRate(purchases) {
    if (purchases.length <= 1) return 0;
    
    const customerIds = new Set(purchases.map(p => p.customerId));
    const repeatCustomers = customerIds.size < purchases.length ? customerIds.size : 0;
    
    return repeatCustomers / customerIds.size;
  }

  calculateSegmentConfidence(metrics, definition) {
    let confidence = 0;
    let criteriaCount = 0;

    for (const [key, value] of Object.entries(definition.criteria)) {
      criteriaCount++;
      
      switch (key) {
        case 'minPurchaseValue':
          confidence += Math.min(1, metrics.avgOrderValue / value);
          break;
        case 'minPurchases':
          confidence += Math.min(1, metrics.totalPurchases / value);
          break;
        case 'browseToCartRatio':
          confidence += 1 - Math.abs(metrics.browseToCartRatio - value);
          break;
        default:
          confidence += 0.5;
      }
    }

    return criteriaCount > 0 ? confidence / criteriaCount : 0;
  }

  calculateChurnRisk(daysSinceLastActivity, engagementScore) {
    let risk = 0;

    // Days since last activity component
    if (daysSinceLastActivity > 60) risk += 40;
    else if (daysSinceLastActivity > 30) risk += 30;
    else if (daysSinceLastActivity > 14) risk += 20;
    else if (daysSinceLastActivity > 7) risk += 10;

    // Engagement score component
    risk += Math.max(0, 50 - engagementScore);

    // Add randomness for realism
    risk += (Math.random() - 0.5) * 10;

    return Math.min(100, Math.max(0, risk));
  }

  predictLifetimeValue(metrics) {
    // Simple CLV prediction based on historical data
    const avgOrderValue = metrics.avgOrderValue || 0;
    const purchaseFrequency = metrics.totalPurchases / 12; // Assume 12 month period
    const customerLifespan = 24; // Assume 24 month average lifespan

    const clv = avgOrderValue * purchaseFrequency * customerLifespan;
    
    // Adjust based on engagement
    const engagementMultiplier = 0.5 + (metrics.engagementScore / 100);
    
    return Math.round(clv * engagementMultiplier);
  }
}

// Create singleton instance
const customerBehaviorAnalytics = new CustomerBehaviorAnalytics();

export default customerBehaviorAnalytics;