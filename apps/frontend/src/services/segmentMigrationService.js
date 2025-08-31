/**
 * OMNIX AI - Segment Migration Service
 * Real-time customer segment migration detection and notifications
 * STREAM-002: Live segment migration notifications
 */

import customerBehaviorAnalytics from './customerBehaviorAnalytics';

class SegmentMigrationService {
  constructor() {
    this.segmentHistory = new Map(); // customerId -> { current, previous, history }
    this.migrationListeners = new Set();
    this.migrationRules = this.initializeMigrationRules();
    this.notificationThresholds = {
      criticalMigrations: ['churning', 'at_risk', 'dormant'],
      positiveHigrations: ['high_value', 'loyal', 'vip', 'champion'],
      watchlistMigrations: ['declining', 'price_sensitive', 'seasonal']
    };
  }

  /**
   * Initialize segment migration rules and impacts
   */
  initializeMigrationRules() {
    return {
      // Critical migrations that need immediate attention
      'active_to_churning': {
        severity: 'critical',
        impact: 'negative',
        action: 'retention_campaign',
        message: 'Customer showing signs of churning',
        recommendations: [
          'Send personalized retention offer',
          'Reach out with customer satisfaction survey',
          'Offer loyalty rewards or exclusive benefits'
        ]
      },
      'high_value_to_declining': {
        severity: 'high',
        impact: 'negative',
        action: 'reactivation',
        message: 'High-value customer engagement declining',
        recommendations: [
          'Schedule personal account review',
          'Offer VIP customer service support',
          'Present exclusive product previews'
        ]
      },
      'loyal_to_at_risk': {
        severity: 'high',
        impact: 'negative',
        action: 'urgent_retention',
        message: 'Loyal customer at risk',
        recommendations: [
          'Immediate loyalty bonus activation',
          'Personal thank you message from management',
          'Special anniversary discount'
        ]
      },
      
      // Positive migrations to celebrate
      'browser_to_buyer': {
        severity: 'low',
        impact: 'positive',
        action: 'nurture',
        message: 'Browser converted to buyer',
        recommendations: [
          'Send welcome series emails',
          'Offer first-time buyer discount for next purchase',
          'Introduce loyalty program benefits'
        ]
      },
      'active_to_loyal': {
        severity: 'low',
        impact: 'positive',
        action: 'reward',
        message: 'Customer achieved loyal status',
        recommendations: [
          'Grant loyalty tier upgrade',
          'Send congratulations message',
          'Unlock exclusive benefits'
        ]
      },
      'frequent_buyer_to_high_value': {
        severity: 'low',
        impact: 'positive',
        action: 'vip_treatment',
        message: 'Customer upgraded to high-value segment',
        recommendations: [
          'Assign dedicated account manager',
          'Provide priority customer service',
          'Offer VIP event invitations'
        ]
      },
      
      // Opportunity migrations
      'new_to_engaged': {
        severity: 'low',
        impact: 'positive',
        action: 'accelerate',
        message: 'New customer showing strong engagement',
        recommendations: [
          'Accelerate onboarding sequence',
          'Show product recommendations',
          'Offer bundle deals'
        ]
      },
      'dormant_to_active': {
        severity: 'medium',
        impact: 'positive',
        action: 'welcome_back',
        message: 'Dormant customer reactivated',
        recommendations: [
          'Send welcome back offer',
          'Show what\'s new since last visit',
          'Provide personalized recommendations'
        ]
      },
      'bargain_hunter_to_regular': {
        severity: 'low',
        impact: 'positive',
        action: 'upsell',
        message: 'Price-sensitive customer buying at regular prices',
        recommendations: [
          'Gradually reduce discount dependency',
          'Highlight value over price',
          'Introduce premium product lines'
        ]
      }
    };
  }

  /**
   * Track customer segment changes
   */
  trackSegmentChange(customerId, newSegment, metadata = {}) {
    const customerHistory = this.segmentHistory.get(customerId) || {
      current: null,
      previous: null,
      history: [],
      firstSeen: new Date().toISOString(),
      lastUpdated: null
    };

    // Skip if no actual change
    if (customerHistory.current === newSegment) {
      return null;
    }

    // Record the migration
    const migration = {
      customerId,
      fromSegment: customerHistory.current,
      toSegment: newSegment,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        timeInPreviousSegment: this.calculateTimeInSegment(customerHistory.lastUpdated),
        migrationCount: customerHistory.history.length + 1
      }
    };

    // Update history
    customerHistory.previous = customerHistory.current;
    customerHistory.current = newSegment;
    customerHistory.lastUpdated = migration.timestamp;
    customerHistory.history.push(migration);

    // Keep only last 50 migrations per customer
    if (customerHistory.history.length > 50) {
      customerHistory.history = customerHistory.history.slice(-50);
    }

    this.segmentHistory.set(customerId, customerHistory);

    // Analyze the migration
    const analysis = this.analyzeMigration(migration);
    
    // Notify listeners
    this.notifyMigration({
      ...migration,
      analysis,
      customerHistory: {
        totalMigrations: customerHistory.history.length,
        customerLifetime: this.calculateCustomerLifetime(customerHistory.firstSeen),
        segmentPath: this.getSegmentPath(customerHistory.history)
      }
    });

    return { migration, analysis };
  }

  /**
   * Analyze a segment migration for patterns and impacts
   */
  analyzeMigration(migration) {
    const { fromSegment, toSegment } = migration;
    
    if (!fromSegment) {
      return {
        type: 'initial_segmentation',
        impact: 'neutral',
        severity: 'info',
        isSignificant: false,
        message: `Customer initially segmented as ${toSegment}`
      };
    }

    // Check predefined migration rules
    const ruleKey = `${fromSegment}_to_${toSegment}`;
    const rule = this.migrationRules[ruleKey];
    
    if (rule) {
      return {
        ...rule,
        type: 'known_pattern',
        isSignificant: true,
        migrationKey: ruleKey
      };
    }

    // Analyze based on segment characteristics
    const impact = this.determineImpact(fromSegment, toSegment);
    const severity = this.determineSeverity(impact);
    
    return {
      type: 'dynamic_analysis',
      impact,
      severity,
      isSignificant: severity !== 'low',
      message: this.generateMigrationMessage(fromSegment, toSegment, impact),
      recommendations: this.generateRecommendations(fromSegment, toSegment, impact)
    };
  }

  /**
   * Determine the impact of a migration
   */
  determineImpact(fromSegment, toSegment) {
    const segmentValues = {
      'vip': 10,
      'champion': 9,
      'loyal': 8,
      'high_value': 7,
      'frequent_buyer': 6,
      'engaged': 5,
      'active': 4,
      'new_customer': 3,
      'browser': 2,
      'bargain_hunter': 2,
      'passive': 1,
      'declining': -1,
      'at_risk': -2,
      'churning': -3,
      'dormant': -4
    };

    const fromValue = segmentValues[fromSegment] || 0;
    const toValue = segmentValues[toSegment] || 0;
    const delta = toValue - fromValue;

    if (delta > 2) return 'highly_positive';
    if (delta > 0) return 'positive';
    if (delta === 0) return 'neutral';
    if (delta > -2) return 'negative';
    return 'highly_negative';
  }

  /**
   * Determine severity based on impact
   */
  determineSeverity(impact) {
    switch (impact) {
      case 'highly_negative': return 'critical';
      case 'negative': return 'high';
      case 'neutral': return 'low';
      case 'positive': return 'low';
      case 'highly_positive': return 'info';
      default: return 'medium';
    }
  }

  /**
   * Generate migration message
   */
  generateMigrationMessage(fromSegment, toSegment, impact) {
    const templates = {
      'highly_positive': `Excellent! Customer upgraded from ${fromSegment} to ${toSegment}`,
      'positive': `Customer progressed from ${fromSegment} to ${toSegment}`,
      'neutral': `Customer transitioned from ${fromSegment} to ${toSegment}`,
      'negative': `Alert: Customer declined from ${fromSegment} to ${toSegment}`,
      'highly_negative': `Critical: Customer rapidly declined from ${fromSegment} to ${toSegment}`
    };

    return templates[impact] || `Customer moved from ${fromSegment} to ${toSegment}`;
  }

  /**
   * Generate recommendations based on migration
   */
  generateRecommendations(fromSegment, toSegment, impact) {
    const recommendations = [];

    if (impact === 'highly_negative' || impact === 'negative') {
      recommendations.push('Trigger retention workflow');
      recommendations.push('Review recent customer interactions');
      recommendations.push('Analyze competitor activity');
      
      if (toSegment === 'churning') {
        recommendations.push('Immediate win-back campaign');
        recommendations.push('Personal outreach from customer success');
      }
      
      if (toSegment === 'at_risk') {
        recommendations.push('Offer loyalty incentives');
        recommendations.push('Send satisfaction survey');
      }
    }

    if (impact === 'highly_positive' || impact === 'positive') {
      recommendations.push('Capitalize on positive momentum');
      recommendations.push('Cross-sell complementary products');
      
      if (toSegment === 'high_value' || toSegment === 'loyal') {
        recommendations.push('Enroll in VIP program');
        recommendations.push('Assign relationship manager');
      }
      
      if (toSegment === 'engaged') {
        recommendations.push('Nurture towards loyalty');
        recommendations.push('Introduce referral program');
      }
    }

    return recommendations;
  }

  /**
   * Detect bulk migrations (segment shifts affecting multiple customers)
   */
  detectBulkMigrations(timeWindow = 3600000) { // 1 hour default
    const now = Date.now();
    const migrations = [];
    
    for (const [customerId, history] of this.segmentHistory.entries()) {
      const recentMigrations = history.history.filter(m => 
        now - new Date(m.timestamp).getTime() < timeWindow
      );
      
      if (recentMigrations.length > 0) {
        migrations.push(...recentMigrations);
      }
    }

    // Group by migration pattern
    const patterns = {};
    migrations.forEach(m => {
      const key = `${m.fromSegment}_to_${m.toSegment}`;
      if (!patterns[key]) {
        patterns[key] = {
          pattern: key,
          count: 0,
          customers: [],
          fromSegment: m.fromSegment,
          toSegment: m.toSegment
        };
      }
      patterns[key].count++;
      patterns[key].customers.push(m.customerId);
    });

    // Identify significant patterns
    const significantPatterns = Object.values(patterns).filter(p => p.count >= 3);
    
    if (significantPatterns.length > 0) {
      return {
        detected: true,
        patterns: significantPatterns,
        totalMigrations: migrations.length,
        timeWindow,
        insights: this.generateBulkInsights(significantPatterns)
      };
    }

    return { detected: false, patterns: [], totalMigrations: migrations.length };
  }

  /**
   * Generate insights from bulk migrations
   */
  generateBulkInsights(patterns) {
    const insights = [];

    patterns.forEach(pattern => {
      const impact = this.determineImpact(pattern.fromSegment, pattern.toSegment);
      
      if (impact === 'highly_negative' || impact === 'negative') {
        insights.push({
          type: 'mass_decline',
          severity: 'critical',
          message: `${pattern.count} customers migrating from ${pattern.fromSegment} to ${pattern.toSegment}`,
          action: 'Investigate root cause immediately',
          affectedCustomers: pattern.customers
        });
      }
      
      if (impact === 'highly_positive') {
        insights.push({
          type: 'mass_upgrade',
          severity: 'info',
          message: `${pattern.count} customers upgraded from ${pattern.fromSegment} to ${pattern.toSegment}`,
          action: 'Analyze success factors for replication',
          affectedCustomers: pattern.customers
        });
      }
    });

    return insights;
  }

  /**
   * Predict next segment for a customer
   */
  predictNextSegment(customerId, currentBehavior) {
    const history = this.segmentHistory.get(customerId);
    
    if (!history || history.history.length < 2) {
      return {
        predicted: null,
        confidence: 0,
        reasoning: 'Insufficient history for prediction'
      };
    }

    // Analyze historical patterns
    const segmentDurations = this.calculateSegmentDurations(history.history);
    const migrationVelocity = this.calculateMigrationVelocity(history.history);
    
    // Use behavior analytics to predict
    const behaviorAnalysis = customerBehaviorAnalytics.analyzeCustomerBehavior(
      currentBehavior,
      customerId
    );

    // Combine historical and behavioral predictions
    const predictions = this.combinePredictions(
      history,
      segmentDurations,
      migrationVelocity,
      behaviorAnalysis
    );

    return predictions;
  }

  /**
   * Calculate time spent in each segment
   */
  calculateSegmentDurations(history) {
    const durations = {};
    
    for (let i = 0; i < history.length - 1; i++) {
      const segment = history[i].toSegment;
      const startTime = new Date(history[i].timestamp).getTime();
      const endTime = new Date(history[i + 1].timestamp).getTime();
      const duration = endTime - startTime;
      
      if (!durations[segment]) {
        durations[segment] = [];
      }
      durations[segment].push(duration);
    }

    // Calculate averages
    const averages = {};
    for (const [segment, times] of Object.entries(durations)) {
      averages[segment] = times.reduce((a, b) => a + b, 0) / times.length;
    }

    return averages;
  }

  /**
   * Calculate migration velocity (how fast customer moves between segments)
   */
  calculateMigrationVelocity(history) {
    if (history.length < 2) return 0;
    
    const timeSpan = new Date(history[history.length - 1].timestamp).getTime() - 
                    new Date(history[0].timestamp).getTime();
    const migrations = history.length;
    
    return migrations / (timeSpan / (24 * 60 * 60 * 1000)); // Migrations per day
  }

  /**
   * Combine predictions from multiple sources
   */
  combinePredictions(history, durations, velocity, behaviorAnalysis) {
    const predictions = [];
    const currentSegment = history.current;
    
    // Historical pattern prediction
    const commonTransitions = this.findCommonTransitions(history.history, currentSegment);
    commonTransitions.forEach(transition => {
      predictions.push({
        segment: transition.toSegment,
        probability: transition.probability,
        source: 'historical',
        timeframe: durations[currentSegment] || 30 * 24 * 60 * 60 * 1000
      });
    });

    // Behavior-based prediction
    if (behaviorAnalysis.predictions && behaviorAnalysis.predictions.churnRisk > 70) {
      predictions.push({
        segment: 'churning',
        probability: behaviorAnalysis.predictions.churnRisk / 100,
        source: 'behavioral',
        timeframe: 7 * 24 * 60 * 60 * 1000
      });
    }

    // Velocity-based prediction
    if (velocity > 0.5) { // More than 1 migration every 2 days
      predictions.push({
        segment: 'volatile',
        probability: Math.min(velocity / 2, 1),
        source: 'velocity',
        timeframe: 24 * 60 * 60 * 1000
      });
    }

    // Sort by probability and return top prediction
    predictions.sort((a, b) => b.probability - a.probability);
    
    if (predictions.length > 0) {
      return {
        predicted: predictions[0].segment,
        confidence: predictions[0].probability,
        timeframe: predictions[0].timeframe,
        reasoning: `Based on ${predictions[0].source} analysis`,
        alternatives: predictions.slice(1, 3)
      };
    }

    return {
      predicted: currentSegment,
      confidence: 0.5,
      reasoning: 'No clear migration pattern detected'
    };
  }

  /**
   * Find common transitions from a segment
   */
  findCommonTransitions(history, fromSegment) {
    const transitions = {};
    let totalFromSegment = 0;

    history.forEach(migration => {
      if (migration.fromSegment === fromSegment) {
        totalFromSegment++;
        transitions[migration.toSegment] = (transitions[migration.toSegment] || 0) + 1;
      }
    });

    return Object.entries(transitions).map(([toSegment, count]) => ({
      toSegment,
      count,
      probability: totalFromSegment > 0 ? count / totalFromSegment : 0
    })).sort((a, b) => b.probability - a.probability);
  }

  /**
   * Helper methods
   */
  
  calculateTimeInSegment(lastUpdated) {
    if (!lastUpdated) return 0;
    return Date.now() - new Date(lastUpdated).getTime();
  }

  calculateCustomerLifetime(firstSeen) {
    if (!firstSeen) return 0;
    return Date.now() - new Date(firstSeen).getTime();
  }

  getSegmentPath(history) {
    return history.slice(-5).map(m => m.toSegment).join(' → ');
  }

  /**
   * Subscribe to migration notifications
   */
  subscribe(listener) {
    this.migrationListeners.add(listener);
    return () => this.migrationListeners.delete(listener);
  }

  /**
   * Notify all listeners of a migration
   */
  notifyMigration(migration) {
    this.migrationListeners.forEach(listener => {
      try {
        listener(migration);
      } catch (error) {
        console.error('Migration listener error:', error);
      }
    });
  }

  /**
   * Get migration statistics
   */
  getStatistics() {
    const stats = {
      totalCustomers: this.segmentHistory.size,
      totalMigrations: 0,
      averageMigrationsPerCustomer: 0,
      mostCommonMigrations: {},
      segmentDistribution: {},
      recentMigrations: []
    };

    for (const [customerId, history] of this.segmentHistory.entries()) {
      stats.totalMigrations += history.history.length;
      
      if (history.current) {
        stats.segmentDistribution[history.current] = 
          (stats.segmentDistribution[history.current] || 0) + 1;
      }

      history.history.forEach(migration => {
        const key = `${migration.fromSegment}_to_${migration.toSegment}`;
        stats.mostCommonMigrations[key] = (stats.mostCommonMigrations[key] || 0) + 1;
      });
    }

    stats.averageMigrationsPerCustomer = 
      stats.totalCustomers > 0 ? stats.totalMigrations / stats.totalCustomers : 0;

    // Get recent migrations
    const allMigrations = [];
    for (const history of this.segmentHistory.values()) {
      allMigrations.push(...history.history);
    }
    
    stats.recentMigrations = allMigrations
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return stats;
  }

  /**
   * Clear migration history
   */
  clearHistory(customerId = null) {
    if (customerId) {
      this.segmentHistory.delete(customerId);
    } else {
      this.segmentHistory.clear();
    }
  }
}

// Create singleton instance
const segmentMigrationService = new SegmentMigrationService();

export default segmentMigrationService;