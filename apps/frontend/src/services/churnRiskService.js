/**
 * OMNIX AI - Live Churn Risk Calculation Service
 * Real-time customer churn risk assessment and prediction
 * STREAM-005: Live churn risk calculations
 */

import customerBehaviorAnalytics from './customerBehaviorAnalytics';
import consumptionPatternService from './consumptionPatternService';
import segmentMigrationService from './segmentMigrationService';

class ChurnRiskService {
  constructor() {
    this.customerRiskScores = new Map(); // customerId -> risk data
    this.riskFactors = this.initializeRiskFactors();
    this.churnModels = this.initializeChurnModels();
    this.riskListeners = new Set();
    this.interventionRules = this.initializeInterventionRules();
    this.alertThresholds = {
      low: 30,
      medium: 50,
      high: 70,
      critical: 85
    };
  }

  /**
   * Initialize churn risk factors and weights
   */
  initializeRiskFactors() {
    return {
      // Behavioral factors
      behavioral: {
        daysSinceLastPurchase: { weight: 0.25, max: 90 },
        daysSinceLastLogin: { weight: 0.15, max: 30 },
        engagementDecline: { weight: 0.20, max: 100 },
        sessionFrequencyDrop: { weight: 0.15, max: 100 },
        cartAbandonmentRate: { weight: 0.10, max: 100 },
        supportTickets: { weight: 0.05, max: 10 },
        negativeReviews: { weight: 0.10, max: 5 }
      },
      
      // Transactional factors
      transactional: {
        purchaseFrequencyDrop: { weight: 0.30, max: 100 },
        averageOrderValueDrop: { weight: 0.20, max: 100 },
        categoryDiversityDrop: { weight: 0.15, max: 100 },
        discountDependency: { weight: 0.15, max: 100 },
        paymentFailures: { weight: 0.10, max: 10 },
        refundRate: { weight: 0.10, max: 100 }
      },
      
      // Engagement factors
      engagement: {
        emailOpenRateDrop: { weight: 0.25, max: 100 },
        clickThroughRateDrop: { weight: 0.20, max: 100 },
        recommendationIgnoreRate: { weight: 0.15, max: 100 },
        socialMediaDisengagement: { weight: 0.10, max: 100 },
        appUsageDecline: { weight: 0.20, max: 100 },
        notificationOptOut: { weight: 0.10, max: 1 }
      },
      
      // Satisfaction factors
      satisfaction: {
        npsScoreDrop: { weight: 0.35, max: 10 },
        satisfactionSurveyScore: { weight: 0.25, max: 10 },
        complaintFrequency: { weight: 0.20, max: 10 },
        responseTimeComplaints: { weight: 0.10, max: 5 },
        competitorMentions: { weight: 0.10, max: 5 }
      }
    };
  }

  /**
   * Initialize different churn prediction models
   */
  initializeChurnModels() {
    return {
      // Rule-based model (fast, interpretable)
      ruleBased: {
        name: 'Rule-Based Model',
        speed: 'fast',
        accuracy: 0.75,
        interpretability: 'high',
        rules: [
          { condition: 'daysSinceLastPurchase > 60', riskIncrease: 40 },
          { condition: 'engagementScore < 20', riskIncrease: 35 },
          { condition: 'segmentMigration == "churning"', riskIncrease: 80 },
          { condition: 'supportTickets > 3', riskIncrease: 25 },
          { condition: 'refundRate > 0.3', riskIncrease: 30 }
        ]
      },
      
      // ML-like model (more complex, higher accuracy)
      mlLike: {
        name: 'ML-Like Model',
        speed: 'medium',
        accuracy: 0.85,
        interpretability: 'medium',
        features: [
          'behavioral_score', 'transactional_score', 'engagement_score', 
          'satisfaction_score', 'segment_stability', 'pattern_consistency'
        ],
        weights: [0.25, 0.30, 0.20, 0.15, 0.05, 0.05]
      },
      
      // Ensemble model (combines multiple approaches)
      ensemble: {
        name: 'Ensemble Model',
        speed: 'slow',
        accuracy: 0.90,
        interpretability: 'low',
        models: ['ruleBased', 'mlLike'],
        weights: [0.4, 0.6]
      }
    };
  }

  /**
   * Initialize intervention rules based on risk levels
   */
  initializeInterventionRules() {
    return {
      low: {
        actions: ['nurture_campaign', 'satisfaction_survey'],
        urgency: 'low',
        timeline: '30_days',
        success_rate: 0.95
      },
      medium: {
        actions: ['personalized_offer', 'loyalty_rewards', 'customer_check_in'],
        urgency: 'medium',
        timeline: '14_days',
        success_rate: 0.80
      },
      high: {
        actions: ['retention_discount', 'account_manager_call', 'vip_treatment'],
        urgency: 'high',
        timeline: '7_days',
        success_rate: 0.60
      },
      critical: {
        actions: ['immediate_intervention', 'executive_outreach', 'win_back_campaign'],
        urgency: 'critical',
        timeline: '24_hours',
        success_rate: 0.40
      }
    };
  }

  /**
   * Calculate real-time churn risk for a customer
   */
  async calculateChurnRisk(customerId, useModel = 'ensemble') {
    try {
      // Get customer data from various services
      const behaviorData = await this.getCustomerBehaviorData(customerId);
      const consumptionData = await this.getCustomerConsumptionData(customerId);
      const segmentData = await this.getCustomerSegmentData(customerId);
      
      // Calculate risk using specified model
      let riskScore = 0;
      let factors = {};
      let confidence = 0;

      switch (useModel) {
        case 'ruleBased':
          ({ riskScore, factors, confidence } = this.calculateRuleBasedRisk(
            behaviorData, consumptionData, segmentData
          ));
          break;
          
        case 'mlLike':
          ({ riskScore, factors, confidence } = this.calculateMLLikeRisk(
            behaviorData, consumptionData, segmentData
          ));
          break;
          
        case 'ensemble':
        default:
          ({ riskScore, factors, confidence } = this.calculateEnsembleRisk(
            behaviorData, consumptionData, segmentData
          ));
          break;
      }

      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore);
      
      // Generate intervention recommendations
      const interventions = this.generateInterventions(riskLevel, factors, behaviorData);
      
      // Calculate time to churn prediction
      const timeToChurn = this.predictTimeToChurn(riskScore, factors, behaviorData);
      
      // Create risk assessment
      const riskAssessment = {
        customerId,
        riskScore: Math.round(riskScore),
        riskLevel,
        confidence: Math.round(confidence * 100),
        model: useModel,
        factors,
        interventions,
        timeToChurn,
        timestamp: new Date().toISOString(),
        previousScore: this.customerRiskScores.get(customerId)?.riskScore || 0,
        trend: this.calculateRiskTrend(customerId, riskScore)
      };

      // Store risk assessment
      this.customerRiskScores.set(customerId, riskAssessment);
      
      // Check for alerts
      const alerts = this.checkChurnAlerts(riskAssessment);
      
      // Notify listeners
      this.notifyListeners({
        type: 'risk_update',
        customerId,
        riskAssessment,
        alerts,
        timestamp: new Date().toISOString()
      });

      return riskAssessment;
    } catch (error) {
      console.error('Churn risk calculation failed:', error);
      return null;
    }
  }

  /**
   * Rule-based churn risk calculation
   */
  calculateRuleBasedRisk(behaviorData, consumptionData, segmentData) {
    let riskScore = 0;
    const factors = {};
    
    const rules = this.churnModels.ruleBased.rules;
    
    rules.forEach(rule => {
      const riskIncrease = this.evaluateRule(rule, behaviorData, consumptionData, segmentData);
      if (riskIncrease > 0) {
        riskScore += riskIncrease;
        factors[rule.condition] = riskIncrease;
      }
    });

    // Additional behavioral analysis
    if (behaviorData.daysSinceLastActivity > 30) {
      const inactivityRisk = Math.min(50, behaviorData.daysSinceLastActivity - 30);
      riskScore += inactivityRisk;
      factors.inactivity = inactivityRisk;
    }

    if (behaviorData.engagementScore < 30) {
      const engagementRisk = 50 - behaviorData.engagementScore;
      riskScore += engagementRisk;
      factors.lowEngagement = engagementRisk;
    }

    if (segmentData.segment === 'churning' || segmentData.segment === 'at_risk') {
      riskScore += 60;
      factors.riskSegment = 60;
    }

    return {
      riskScore: Math.min(100, riskScore),
      factors,
      confidence: 0.75
    };
  }

  /**
   * ML-like churn risk calculation using feature scoring
   */
  calculateMLLikeRisk(behaviorData, consumptionData, segmentData) {
    const features = this.extractFeatures(behaviorData, consumptionData, segmentData);
    const model = this.churnModels.mlLike;
    
    let riskScore = 0;
    const factors = {};

    // Calculate weighted feature scores
    features.forEach((featureValue, index) => {
      const weight = model.weights[index];
      const contribution = featureValue * weight * 100;
      riskScore += contribution;
      factors[model.features[index]] = contribution;
    });

    // Apply sigmoid function for smoother scoring
    riskScore = this.applySigmoid(riskScore);

    return {
      riskScore: Math.min(100, Math.max(0, riskScore)),
      factors,
      confidence: 0.85
    };
  }

  /**
   * Ensemble model combining multiple approaches
   */
  calculateEnsembleRisk(behaviorData, consumptionData, segmentData) {
    const ruleBasedResult = this.calculateRuleBasedRisk(behaviorData, consumptionData, segmentData);
    const mlLikeResult = this.calculateMLLikeRisk(behaviorData, consumptionData, segmentData);
    
    const ensembleWeights = this.churnModels.ensemble.weights;
    
    // Weighted average of model predictions
    const riskScore = (ruleBasedResult.riskScore * ensembleWeights[0]) + 
                     (mlLikeResult.riskScore * ensembleWeights[1]);

    // Combine factors
    const factors = {
      ...ruleBasedResult.factors,
      ...mlLikeResult.factors,
      ensemble: {
        ruleBasedScore: ruleBasedResult.riskScore,
        mlLikeScore: mlLikeResult.riskScore,
        finalScore: riskScore
      }
    };

    // Higher confidence due to ensemble approach
    const confidence = (ruleBasedResult.confidence * ensembleWeights[0]) + 
                      (mlLikeResult.confidence * ensembleWeights[1]) + 0.05;

    return {
      riskScore: Math.min(100, Math.max(0, riskScore)),
      factors,
      confidence: Math.min(1, confidence)
    };
  }

  /**
   * Extract features for ML-like model
   */
  extractFeatures(behaviorData, consumptionData, segmentData) {
    return [
      // Behavioral score (0-1)
      Math.max(0, 1 - (behaviorData.engagementScore / 100)),
      
      // Transactional score (0-1)
      this.calculateTransactionalRisk(behaviorData, consumptionData),
      
      // Engagement score (0-1)
      this.calculateEngagementRisk(behaviorData),
      
      // Satisfaction score (0-1)
      this.calculateSatisfactionRisk(behaviorData),
      
      // Segment stability (0-1)
      this.calculateSegmentStability(segmentData),
      
      // Pattern consistency (0-1)
      this.calculatePatternConsistency(consumptionData)
    ];
  }

  /**
   * Calculate transactional risk factors
   */
  calculateTransactionalRisk(behaviorData, consumptionData) {
    let risk = 0;
    
    // Purchase frequency decline
    if (behaviorData.purchaseFrequencyChange < -0.3) {
      risk += 0.4;
    } else if (behaviorData.purchaseFrequencyChange < -0.1) {
      risk += 0.2;
    }
    
    // Order value decline
    if (behaviorData.avgOrderValueChange < -0.2) {
      risk += 0.3;
    }
    
    // Days since last purchase
    const daysSinceLastPurchase = behaviorData.daysSinceLastPurchase || 0;
    if (daysSinceLastPurchase > 60) {
      risk += 0.5;
    } else if (daysSinceLastPurchase > 30) {
      risk += 0.3;
    }

    return Math.min(1, risk);
  }

  /**
   * Calculate engagement risk factors
   */
  calculateEngagementRisk(behaviorData) {
    let risk = 0;
    
    // Session frequency decline
    if (behaviorData.sessionFrequencyChange < -0.4) {
      risk += 0.4;
    }
    
    // Page view decline
    if (behaviorData.pageViewChange < -0.3) {
      risk += 0.3;
    }
    
    // Email engagement decline
    if (behaviorData.emailEngagementChange < -0.5) {
      risk += 0.3;
    }

    return Math.min(1, risk);
  }

  /**
   * Calculate satisfaction risk factors
   */
  calculateSatisfactionRisk(behaviorData) {
    let risk = 0;
    
    // Support ticket frequency
    if (behaviorData.supportTickets > 2) {
      risk += 0.4;
    }
    
    // Negative feedback
    if (behaviorData.negativeReviews > 1) {
      risk += 0.3;
    }
    
    // Complaint resolution time
    if (behaviorData.avgComplaintResolutionTime > 24) {
      risk += 0.3;
    }

    return Math.min(1, risk);
  }

  /**
   * Calculate segment stability risk
   */
  calculateSegmentStability(segmentData) {
    if (!segmentData.migrationHistory) return 0;
    
    const recentMigrations = segmentData.migrationHistory.filter(m =>
      Date.now() - new Date(m.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    );

    // High migration frequency indicates instability
    if (recentMigrations.length > 3) return 0.8;
    if (recentMigrations.length > 1) return 0.4;
    
    // Check for negative migrations
    const negativesMigrations = recentMigrations.filter(m =>
      m.impact === 'negative' || m.impact === 'highly_negative'
    );
    
    return negativesMigrations.length * 0.3;
  }

  /**
   * Calculate pattern consistency risk
   */
  calculatePatternConsistency(consumptionData) {
    if (!consumptionData.patterns || consumptionData.patterns.length === 0) {
      return 0.5; // No patterns = moderate risk
    }
    
    const avgConfidence = consumptionData.patterns.reduce((sum, p) => 
      sum + p.confidence, 0
    ) / consumptionData.patterns.length;
    
    // Lower confidence = higher risk
    return Math.max(0, 1 - avgConfidence);
  }

  /**
   * Determine risk level from score
   */
  determineRiskLevel(riskScore) {
    if (riskScore >= this.alertThresholds.critical) return 'critical';
    if (riskScore >= this.alertThresholds.high) return 'high';
    if (riskScore >= this.alertThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Generate intervention recommendations
   */
  generateInterventions(riskLevel, factors, behaviorData) {
    const baseInterventions = this.interventionRules[riskLevel];
    const customInterventions = [];

    // Add specific interventions based on risk factors
    if (factors.inactivity > 20) {
      customInterventions.push({
        type: 'reactivation',
        action: 'Send "We miss you" campaign with special offer',
        priority: 'high',
        timeline: '48_hours'
      });
    }

    if (factors.lowEngagement > 30) {
      customInterventions.push({
        type: 're_engagement',
        action: 'Launch interactive content and gamification',
        priority: 'medium',
        timeline: '1_week'
      });
    }

    if (factors.riskSegment > 50) {
      customInterventions.push({
        type: 'segment_recovery',
        action: 'Immediate loyalty tier upgrade and benefits',
        priority: 'critical',
        timeline: 'immediate'
      });
    }

    if (factors.supportTickets > 15) {
      customInterventions.push({
        type: 'service_recovery',
        action: 'Dedicated customer success manager assignment',
        priority: 'high',
        timeline: '24_hours'
      });
    }

    return {
      base: baseInterventions,
      custom: customInterventions,
      recommended: this.selectBestInterventions(baseInterventions, customInterventions, riskLevel)
    };
  }

  /**
   * Predict time until customer churns
   */
  predictTimeToChurn(riskScore, factors, behaviorData) {
    let daysToChurn = 365; // Default 1 year

    // Accelerate based on risk score
    const riskMultiplier = riskScore / 100;
    daysToChurn *= (1 - riskMultiplier);

    // Adjust based on specific factors
    if (factors.inactivity > 30) {
      daysToChurn *= 0.5; // Halve time if highly inactive
    }

    if (factors.riskSegment > 50) {
      daysToChurn *= 0.3; // Very short time if in risky segment
    }

    if (behaviorData.daysSinceLastPurchase > 90) {
      daysToChurn *= 0.2; // Very short if long absence
    }

    // Apply random variance for realism
    const variance = 0.2; // 20% variance
    const randomFactor = 1 + (Math.random() - 0.5) * variance;
    daysToChurn *= randomFactor;

    return {
      days: Math.max(1, Math.round(daysToChurn)),
      confidence: this.calculateTimeToChurnConfidence(riskScore, factors),
      range: {
        min: Math.max(1, Math.round(daysToChurn * 0.7)),
        max: Math.round(daysToChurn * 1.3)
      }
    };
  }

  /**
   * Check for churn alerts that require immediate attention
   */
  checkChurnAlerts(riskAssessment) {
    const alerts = [];
    const { riskScore, riskLevel, customerId, factors, trend } = riskAssessment;

    // Critical risk alert
    if (riskLevel === 'critical') {
      alerts.push({
        type: 'critical_churn_risk',
        severity: 'critical',
        message: `Customer ${customerId} has critical churn risk (${riskScore}%)`,
        action: 'Immediate intervention required',
        timeline: '24_hours',
        priority: 1
      });
    }

    // Rapid risk increase alert
    if (trend.direction === 'increasing' && trend.magnitude > 20) {
      alerts.push({
        type: 'rapid_risk_increase',
        severity: 'high',
        message: `Churn risk increased by ${trend.magnitude}% rapidly`,
        action: 'Investigate cause and intervene',
        timeline: '48_hours',
        priority: 2
      });
    }

    // High-value customer at risk
    if (riskLevel === 'high' && factors.highValue) {
      alerts.push({
        type: 'high_value_at_risk',
        severity: 'high',
        message: 'High-value customer showing churn risk',
        action: 'Assign dedicated account manager',
        timeline: '24_hours',
        priority: 1
      });
    }

    // Pattern breakdown alert
    if (factors.patternInconsistency > 0.7) {
      alerts.push({
        type: 'pattern_breakdown',
        severity: 'medium',
        message: 'Customer behavior patterns becoming inconsistent',
        action: 'Review recent interactions and adjust strategy',
        timeline: '1_week',
        priority: 3
      });
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate risk trend compared to previous assessments
   */
  calculateRiskTrend(customerId, currentScore) {
    const previousAssessment = this.customerRiskScores.get(customerId);
    
    if (!previousAssessment) {
      return { direction: 'stable', magnitude: 0, isNew: true };
    }

    const previousScore = previousAssessment.riskScore;
    const difference = currentScore - previousScore;
    const magnitude = Math.abs(difference);

    let direction = 'stable';
    if (difference > 5) direction = 'increasing';
    else if (difference < -5) direction = 'decreasing';

    return {
      direction,
      magnitude: Math.round(magnitude),
      isNew: false,
      previousScore
    };
  }

  /**
   * Bulk churn risk analysis for all customers
   */
  async calculateBulkChurnRisk(customerIds = null) {
    const customers = customerIds || Array.from(this.customerRiskScores.keys());
    const results = [];

    for (const customerId of customers) {
      const assessment = await this.calculateChurnRisk(customerId);
      if (assessment) {
        results.push(assessment);
      }
    }

    // Analyze bulk patterns
    const bulkAnalysis = this.analyzeBulkChurnPatterns(results);
    
    return {
      results,
      bulkAnalysis,
      summary: {
        totalCustomers: results.length,
        criticalRisk: results.filter(r => r.riskLevel === 'critical').length,
        highRisk: results.filter(r => r.riskLevel === 'high').length,
        averageRisk: results.reduce((sum, r) => sum + r.riskScore, 0) / results.length
      }
    };
  }

  /**
   * Analyze patterns in bulk churn risk
   */
  analyzeBulkChurnPatterns(results) {
    const patterns = {};
    
    // Segment analysis
    results.forEach(result => {
      const segment = result.factors.segment || 'unknown';
      if (!patterns[segment]) {
        patterns[segment] = { count: 0, avgRisk: 0, totalRisk: 0 };
      }
      patterns[segment].count++;
      patterns[segment].totalRisk += result.riskScore;
      patterns[segment].avgRisk = patterns[segment].totalRisk / patterns[segment].count;
    });

    // Time-based patterns
    const timePatterns = this.analyzeTimeBasedChurnPatterns(results);
    
    return {
      segmentPatterns: patterns,
      timePatterns,
      insights: this.generateBulkInsights(patterns, timePatterns)
    };
  }

  /**
   * Helper methods
   */
  
  evaluateRule(rule, behaviorData, consumptionData, segmentData) {
    // Simple rule evaluation - in real implementation would use proper parser
    if (rule.condition.includes('daysSinceLastPurchase > 60')) {
      return (behaviorData.daysSinceLastPurchase || 0) > 60 ? rule.riskIncrease : 0;
    }
    
    if (rule.condition.includes('engagementScore < 20')) {
      return (behaviorData.engagementScore || 50) < 20 ? rule.riskIncrease : 0;
    }
    
    if (rule.condition.includes('segmentMigration == "churning"')) {
      return segmentData.segment === 'churning' ? rule.riskIncrease : 0;
    }

    return 0;
  }

  applySigmoid(x) {
    return 100 / (1 + Math.exp(-x / 20)); // Scaled sigmoid for 0-100 range
  }

  calculateTimeToChurnConfidence(riskScore, factors) {
    let confidence = 0.5;
    
    if (riskScore > 80) confidence += 0.3;
    if (factors.inactivity) confidence += 0.2;
    if (factors.riskSegment) confidence += 0.3;
    
    return Math.min(1, confidence);
  }

  selectBestInterventions(baseInterventions, customInterventions, riskLevel) {
    const combined = [
      ...baseInterventions.actions.map(action => ({ type: 'base', action, priority: riskLevel })),
      ...customInterventions.map(custom => ({ type: 'custom', ...custom }))
    ];

    // Sort by priority and return top 5
    return combined
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5);
  }

  analyzeTimeBasedChurnPatterns(results) {
    const now = new Date();
    const patterns = {
      hourly: {},
      daily: {},
      weekly: {}
    };

    results.forEach(result => {
      const timestamp = new Date(result.timestamp);
      const hour = timestamp.getHours();
      const day = timestamp.getDay();
      const week = Math.floor((now - timestamp) / (7 * 24 * 60 * 60 * 1000));

      patterns.hourly[hour] = (patterns.hourly[hour] || 0) + result.riskScore;
      patterns.daily[day] = (patterns.daily[day] || 0) + result.riskScore;
      patterns.weekly[week] = (patterns.weekly[week] || 0) + result.riskScore;
    });

    return patterns;
  }

  generateBulkInsights(segmentPatterns, timePatterns) {
    const insights = [];

    // Segment insights
    const highestRiskSegment = Object.entries(segmentPatterns)
      .sort((a, b) => b[1].avgRisk - a[1].avgRisk)[0];
    
    if (highestRiskSegment && highestRiskSegment[1].avgRisk > 60) {
      insights.push({
        type: 'segment_risk',
        message: `${highestRiskSegment[0]} segment has highest churn risk (${Math.round(highestRiskSegment[1].avgRisk)}%)`,
        action: 'Targeted retention campaign for this segment',
        priority: 'high'
      });
    }

    return insights;
  }

  async getCustomerBehaviorData(customerId) {
    // Mock data - in real app would fetch from behavior store
    return {
      customerId,
      daysSinceLastActivity: Math.floor(Math.random() * 90),
      daysSinceLastPurchase: Math.floor(Math.random() * 120),
      engagementScore: Math.floor(Math.random() * 100),
      sessionFrequencyChange: (Math.random() - 0.5) * 2,
      purchaseFrequencyChange: (Math.random() - 0.5) * 2,
      avgOrderValueChange: (Math.random() - 0.5) * 2,
      supportTickets: Math.floor(Math.random() * 5),
      negativeReviews: Math.floor(Math.random() * 3)
    };
  }

  async getCustomerConsumptionData(customerId) {
    return consumptionPatternService.getCustomerAnalytics(customerId) || {
      patterns: [],
      confidence: 0.5
    };
  }

  async getCustomerSegmentData(customerId) {
    // Mock data - in real app would get from segment service
    return {
      segment: ['active', 'loyal', 'churning', 'at_risk'][Math.floor(Math.random() * 4)],
      migrationHistory: []
    };
  }

  /**
   * Subscribe to churn risk updates
   */
  subscribe(listener) {
    this.riskListeners.add(listener);
    return () => this.riskListeners.delete(listener);
  }

  /**
   * Notify listeners of risk changes
   */
  notifyListeners(update) {
    this.riskListeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Churn risk listener error:', error);
      }
    });
  }

  /**
   * Get churn risk assessment for a customer
   */
  getChurnRisk(customerId) {
    return this.customerRiskScores.get(customerId);
  }

  /**
   * Get all customers by risk level
   */
  getCustomersByRiskLevel(riskLevel) {
    return Array.from(this.customerRiskScores.values())
      .filter(assessment => assessment.riskLevel === riskLevel)
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Get churn risk statistics
   */
  getStatistics() {
    const assessments = Array.from(this.customerRiskScores.values());
    
    return {
      totalCustomers: assessments.length,
      averageRisk: assessments.reduce((sum, a) => sum + a.riskScore, 0) / assessments.length,
      riskDistribution: {
        critical: assessments.filter(a => a.riskLevel === 'critical').length,
        high: assessments.filter(a => a.riskLevel === 'high').length,
        medium: assessments.filter(a => a.riskLevel === 'medium').length,
        low: assessments.filter(a => a.riskLevel === 'low').length
      },
      modelAccuracy: this.calculateModelAccuracy(),
      totalAlerts: assessments.reduce((sum, a) => sum + (a.alerts?.length || 0), 0)
    };
  }

  calculateModelAccuracy() {
    // Mock accuracy calculation
    return {
      ruleBased: 0.75,
      mlLike: 0.85,
      ensemble: 0.90
    };
  }

  /**
   * Clear all churn risk data
   */
  clearAllData() {
    this.customerRiskScores.clear();
  }
}

// Create singleton instance
const churnRiskService = new ChurnRiskService();

export default churnRiskService;