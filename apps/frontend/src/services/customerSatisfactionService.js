/**
 * OMNIX AI - Customer Satisfaction Scoring Service
 * Real-time customer satisfaction measurement and sentiment analysis
 */

class CustomerSatisfactionService {
  constructor() {
    this.satisfactionMetrics = new Map();
    this.sentimentAnalysis = new Map();
    this.feedbackData = new Map();
    this.satisfactionHistory = new Map();
    this.touchpointScores = new Map();
    this.performanceMetrics = {
      totalSatisfactionScores: 0,
      averageSatisfactionScore: 0,
      sentimentAnalysisCount: 0,
      feedbackProcessed: 0,
      lastUpdated: null,
      trendsTracked: 0
    };

    this.initializeSatisfactionModels();
    this.initializeTouchpoints();
  }

  /**
   * Initialize satisfaction scoring models
   */
  initializeSatisfactionModels() {
    // NPS (Net Promoter Score) model
    this.satisfactionModels = {
      nps: {
        name: 'Net Promoter Score',
        weight: 0.3,
        calculate: (data) => this.calculateNPS(data),
        factors: ['likelihood_recommend', 'overall_experience']
      },

      // CSAT (Customer Satisfaction Score) model
      csat: {
        name: 'Customer Satisfaction Score',
        weight: 0.25,
        calculate: (data) => this.calculateCSAT(data),
        factors: ['service_rating', 'product_quality', 'value_perception']
      },

      // CES (Customer Effort Score) model
      ces: {
        name: 'Customer Effort Score',
        weight: 0.2,
        calculate: (data) => this.calculateCES(data),
        factors: ['ease_of_use', 'problem_resolution', 'interaction_effort']
      },

      // Sentiment analysis model
      sentiment: {
        name: 'AI Sentiment Analysis',
        weight: 0.15,
        calculate: (data) => this.calculateSentimentScore(data),
        factors: ['text_sentiment', 'emotional_tone', 'context_analysis']
      },

      // Behavioral satisfaction model
      behavioral: {
        name: 'Behavioral Satisfaction',
        weight: 0.1,
        calculate: (data) => this.calculateBehavioralSatisfaction(data),
        factors: ['usage_frequency', 'feature_adoption', 'support_tickets']
      }
    };
  }

  /**
   * Initialize customer touchpoints for satisfaction tracking
   */
  initializeTouchpoints() {
    this.touchpoints = {
      purchase: {
        name: 'Purchase Experience',
        weight: 0.25,
        factors: ['checkout_ease', 'payment_process', 'order_confirmation']
      },
      delivery: {
        name: 'Delivery Experience',
        weight: 0.2,
        factors: ['delivery_speed', 'packaging_quality', 'delivery_tracking']
      },
      product: {
        name: 'Product Experience',
        weight: 0.3,
        factors: ['product_quality', 'value_for_money', 'expectations_met']
      },
      support: {
        name: 'Customer Support',
        weight: 0.15,
        factors: ['response_time', 'issue_resolution', 'support_quality']
      },
      website: {
        name: 'Website Experience',
        weight: 0.1,
        factors: ['site_navigation', 'search_functionality', 'loading_speed']
      }
    };
  }

  /**
   * Calculate real-time customer satisfaction score
   */
  calculateSatisfactionScore(customerId, feedbackData = {}, contextData = {}) {
    const customerHistory = this.satisfactionHistory.get(customerId) || [];
    const touchpointScores = this.touchpointScores.get(customerId) || {};
    
    // Calculate scores from different models
    const modelScores = {};
    let totalWeight = 0;

    for (const [modelId, model] of Object.entries(this.satisfactionModels)) {
      const score = model.calculate({
        ...feedbackData,
        ...contextData,
        history: customerHistory,
        touchpoints: touchpointScores
      });
      
      modelScores[modelId] = {
        score: score.value,
        confidence: score.confidence,
        factors: score.factors,
        weight: model.weight
      };
      totalWeight += model.weight;
    }

    // Calculate weighted ensemble score
    const ensembleScore = Object.values(modelScores).reduce((sum, model) => {
      return sum + (model.score * model.weight);
    }, 0) / totalWeight;

    // Apply recency weighting
    const recencyAdjustedScore = this.applyRecencyWeighting(
      ensembleScore, 
      customerHistory,
      contextData.timestamp
    );

    // Calculate satisfaction level
    const satisfactionLevel = this.determineSatisfactionLevel(recencyAdjustedScore);

    // Generate insights and recommendations
    const insights = this.generateSatisfactionInsights(modelScores, contextData);
    const recommendations = this.generateActionRecommendations(
      recencyAdjustedScore,
      satisfactionLevel,
      modelScores
    );

    const satisfactionResult = {
      customerId,
      overallScore: recencyAdjustedScore,
      satisfactionLevel,
      confidence: this.calculateOverallConfidence(modelScores),
      modelBreakdown: modelScores,
      insights,
      recommendations,
      timestamp: new Date().toISOString(),
      touchpointScores: this.calculateTouchpointScores(feedbackData, contextData),
      trendDirection: this.calculateTrendDirection(customerId, recencyAdjustedScore)
    };

    // Update satisfaction metrics
    this.updateSatisfactionMetrics(customerId, satisfactionResult);

    // Cache the result
    this.cacheSatisfactionScore(customerId, satisfactionResult);

    return satisfactionResult;
  }

  /**
   * Calculate NPS (Net Promoter Score)
   */
  calculateNPS(data) {
    const recommendationScore = data.likelihood_recommend || 7; // Default neutral score
    const experienceScore = data.overall_experience || 7;
    
    // NPS is based on likelihood to recommend (0-10 scale)
    let npsScore = (recommendationScore - 5) * 10; // Normalize to 0-100
    
    // Adjust based on overall experience
    const experienceAdjustment = (experienceScore - 7) * 5;
    npsScore += experienceAdjustment;
    
    // Ensure score is within bounds
    npsScore = Math.max(0, Math.min(100, npsScore));

    return {
      value: npsScore,
      confidence: 0.85,
      factors: {
        likelihood_recommend: recommendationScore,
        overall_experience: experienceScore,
        category: this.getNPSCategory(recommendationScore)
      }
    };
  }

  /**
   * Calculate CSAT (Customer Satisfaction Score)
   */
  calculateCSAT(data) {
    const serviceRating = data.service_rating || 4;
    const productQuality = data.product_quality || 4;
    const valuePerception = data.value_perception || 4;
    
    // CSAT is average of satisfaction ratings (1-5 scale, convert to 0-100)
    const csatScore = ((serviceRating + productQuality + valuePerception) / 3 - 1) * 25;

    return {
      value: Math.max(0, Math.min(100, csatScore)),
      confidence: 0.8,
      factors: {
        service_rating: serviceRating,
        product_quality: productQuality,
        value_perception: valuePerception,
        category: this.getCSATCategory(csatScore)
      }
    };
  }

  /**
   * Calculate CES (Customer Effort Score)
   */
  calculateCES(data) {
    const easeOfUse = data.ease_of_use || 3;
    const problemResolution = data.problem_resolution || 3;
    const interactionEffort = data.interaction_effort || 3;
    
    // CES is inverse effort score (1-5 scale, lower effort = higher satisfaction)
    const effortScore = (easeOfUse + problemResolution + interactionEffort) / 3;
    const cesScore = (6 - effortScore) * 25; // Convert to 0-100, invert scale

    return {
      value: Math.max(0, Math.min(100, cesScore)),
      confidence: 0.75,
      factors: {
        ease_of_use: easeOfUse,
        problem_resolution: problemResolution,
        interaction_effort: interactionEffort,
        effort_level: this.getEffortLevel(effortScore)
      }
    };
  }

  /**
   * Calculate AI-powered sentiment score
   */
  calculateSentimentScore(data) {
    const textFeedback = data.text_feedback || '';
    const reviewText = data.review_text || '';
    const supportMessages = data.support_messages || [];

    // Combine all text sources
    const combinedText = [textFeedback, reviewText, ...supportMessages].join(' ');

    if (!combinedText.trim()) {
      return {
        value: 50, // Neutral if no text
        confidence: 0.1,
        factors: { no_text_available: true }
      };
    }

    // Simple sentiment analysis (in production, use proper NLP service)
    const sentimentScore = this.analyzeSentiment(combinedText);
    
    return {
      value: sentimentScore.score,
      confidence: sentimentScore.confidence,
      factors: {
        sentiment_polarity: sentimentScore.polarity,
        emotional_tone: sentimentScore.emotion,
        key_phrases: sentimentScore.keyPhrases,
        text_length: combinedText.length
      }
    };
  }

  /**
   * Calculate behavioral satisfaction score
   */
  calculateBehavioralSatisfaction(data) {
    const usageFrequency = data.usage_frequency || 0.5;
    const featureAdoption = data.feature_adoption || 0.3;
    const supportTickets = data.support_tickets || 0;
    const returnRate = data.return_rate || 0;

    // Behavioral satisfaction based on engagement and issues
    let behavioralScore = 0;
    
    // Usage frequency contributes positively
    behavioralScore += usageFrequency * 40;
    
    // Feature adoption contributes positively
    behavioralScore += featureAdoption * 30;
    
    // Support tickets contribute negatively (but presence shows engagement)
    behavioralScore += Math.max(0, 20 - supportTickets * 5);
    
    // Return rate contributes negatively
    behavioralScore -= returnRate * 30;

    behavioralScore = Math.max(0, Math.min(100, behavioralScore));

    return {
      value: behavioralScore,
      confidence: 0.7,
      factors: {
        usage_frequency: usageFrequency,
        feature_adoption: featureAdoption,
        support_tickets: supportTickets,
        return_rate: returnRate,
        engagement_level: this.getEngagementLevel(usageFrequency, featureAdoption)
      }
    };
  }

  /**
   * Process real-time feedback
   */
  processRealtimeFeedback(customerId, feedbackType, feedbackData) {
    const processedFeedback = {
      customerId,
      type: feedbackType,
      data: feedbackData,
      timestamp: new Date().toISOString(),
      processed: true
    };

    // Update customer feedback history
    const customerFeedback = this.feedbackData.get(customerId) || [];
    customerFeedback.unshift(processedFeedback);
    
    // Keep only last 50 feedback entries
    if (customerFeedback.length > 50) {
      customerFeedback.splice(50);
    }
    
    this.feedbackData.set(customerId, customerFeedback);

    // Recalculate satisfaction score with new feedback
    const satisfactionScore = this.calculateSatisfactionScore(
      customerId,
      feedbackData,
      { feedbackType, realtime: true }
    );

    // Check for satisfaction alerts
    this.checkSatisfactionAlerts(customerId, satisfactionScore);

    return {
      processed: processedFeedback,
      updatedSatisfaction: satisfactionScore,
      alertsTriggered: this.getTriggeredAlerts(customerId, satisfactionScore)
    };
  }

  /**
   * Batch process customer satisfaction scores
   */
  batchCalculateSatisfaction(customerIds, contextData = {}) {
    const results = customerIds.map(customerId => {
      const customerFeedback = this.feedbackData.get(customerId) || [];
      const latestFeedback = customerFeedback[0]?.data || {};
      
      return this.calculateSatisfactionScore(
        customerId,
        latestFeedback,
        { ...contextData, batch: true }
      );
    });

    // Calculate batch insights
    const batchInsights = this.calculateBatchSatisfactionInsights(results);

    return {
      satisfactionScores: results,
      batchInsights,
      summary: {
        totalCustomers: customerIds.length,
        averageSatisfaction: batchInsights.averageScore,
        satisfiedCustomers: results.filter(r => r.satisfactionLevel === 'satisfied' || r.satisfactionLevel === 'very_satisfied').length,
        atRiskCustomers: results.filter(r => r.satisfactionLevel === 'unsatisfied' || r.satisfactionLevel === 'very_unsatisfied').length
      }
    };
  }

  /**
   * Generate satisfaction insights
   */
  generateSatisfactionInsights(modelScores, contextData) {
    const insights = [];

    // Identify strongest and weakest areas
    const sortedModels = Object.entries(modelScores)
      .sort(([,a], [,b]) => b.score - a.score);

    const strongest = sortedModels[0];
    const weakest = sortedModels[sortedModels.length - 1];

    if (strongest[1].score > 75) {
      insights.push({
        type: 'strength',
        area: strongest[0],
        message: `Strong performance in ${strongest[1].factors ? Object.keys(strongest[1].factors)[0] : strongest[0]}`,
        score: strongest[1].score,
        confidence: strongest[1].confidence
      });
    }

    if (weakest[1].score < 50) {
      insights.push({
        type: 'concern',
        area: weakest[0],
        message: `Improvement needed in ${weakest[1].factors ? Object.keys(weakest[1].factors)[0] : weakest[0]}`,
        score: weakest[1].score,
        confidence: weakest[1].confidence
      });
    }

    // Context-specific insights
    if (contextData.realtime) {
      insights.push({
        type: 'realtime',
        message: 'Real-time feedback processed - satisfaction score updated',
        timestamp: contextData.timestamp || new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Generate action recommendations based on satisfaction score
   */
  generateActionRecommendations(score, level, modelScores) {
    const recommendations = [];

    if (level === 'very_unsatisfied' || level === 'unsatisfied') {
      recommendations.push({
        priority: 'urgent',
        action: 'immediate_outreach',
        description: 'Contact customer immediately to address concerns',
        expectedImpact: 'high'
      });

      // Check which area needs most attention
      const lowestScore = Object.entries(modelScores)
        .sort(([,a], [,b]) => a.score - b.score)[0];

      recommendations.push({
        priority: 'high',
        action: 'address_specific_issue',
        description: `Focus on improving ${lowestScore[0]} experience`,
        expectedImpact: 'medium'
      });
    }

    if (level === 'neutral') {
      recommendations.push({
        priority: 'medium',
        action: 'engagement_increase',
        description: 'Increase customer engagement through personalized offers',
        expectedImpact: 'medium'
      });
    }

    if (level === 'satisfied' || level === 'very_satisfied') {
      recommendations.push({
        priority: 'low',
        action: 'loyalty_program',
        description: 'Invite to loyalty program or request referral',
        expectedImpact: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Analyze sentiment from text
   */
  analyzeSentiment(text) {
    // Simple sentiment analysis (replace with actual NLP service)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'satisfied', 'happy', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'unsatisfied', 'unhappy', 'poor', 'worst'];
    
    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) {
      return {
        score: 50,
        confidence: 0.3,
        polarity: 'neutral',
        emotion: 'neutral',
        keyPhrases: []
      };
    }

    const sentimentScore = (positiveCount / totalSentimentWords) * 100;
    
    return {
      score: sentimentScore,
      confidence: Math.min(0.8, totalSentimentWords / 10),
      polarity: sentimentScore > 60 ? 'positive' : sentimentScore < 40 ? 'negative' : 'neutral',
      emotion: this.detectEmotion(positiveCount, negativeCount, words),
      keyPhrases: [...positiveWords.filter(w => words.includes(w)), ...negativeWords.filter(w => words.includes(w))]
    };
  }

  /**
   * Helper methods
   */
  determineSatisfactionLevel(score) {
    if (score >= 80) return 'very_satisfied';
    if (score >= 65) return 'satisfied';
    if (score >= 45) return 'neutral';
    if (score >= 25) return 'unsatisfied';
    return 'very_unsatisfied';
  }

  calculateOverallConfidence(modelScores) {
    const confidences = Object.values(modelScores).map(model => model.confidence);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  applyRecencyWeighting(score, history, timestamp) {
    if (!history || history.length === 0) return score;
    
    // Give more weight to recent scores
    const now = new Date(timestamp || Date.now()).getTime();
    const recentHistory = history.filter(entry => {
      const entryTime = new Date(entry.timestamp).getTime();
      return now - entryTime < 30 * 24 * 60 * 60 * 1000; // Last 30 days
    });

    if (recentHistory.length === 0) return score;

    // Apply exponential decay weighting
    let weightedSum = score * 0.5; // Current score weight
    let totalWeight = 0.5;

    recentHistory.forEach((entry, index) => {
      const weight = Math.exp(-index * 0.1); // Exponential decay
      weightedSum += entry.score * weight * 0.5;
      totalWeight += weight * 0.5;
    });

    return weightedSum / totalWeight;
  }

  calculateTrendDirection(customerId, currentScore) {
    const history = this.satisfactionHistory.get(customerId) || [];
    if (history.length === 0) return 'stable';

    const previousScore = history[0]?.score || currentScore;
    const difference = currentScore - previousScore;

    if (Math.abs(difference) < 5) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  updateSatisfactionMetrics(customerId, satisfactionResult) {
    // Update performance metrics
    this.performanceMetrics.totalSatisfactionScores++;
    this.performanceMetrics.lastUpdated = satisfactionResult.timestamp;
    
    // Update history
    const history = this.satisfactionHistory.get(customerId) || [];
    history.unshift({
      score: satisfactionResult.overallScore,
      level: satisfactionResult.satisfactionLevel,
      timestamp: satisfactionResult.timestamp
    });
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(100);
    }
    
    this.satisfactionHistory.set(customerId, history);
  }

  cacheSatisfactionScore(customerId, satisfactionResult) {
    this.satisfactionMetrics.set(customerId, satisfactionResult);
  }

  /**
   * Get service statistics
   */
  getStatistics() {
    const allScores = Array.from(this.satisfactionMetrics.values());
    const averageScore = allScores.length > 0 ? 
      allScores.reduce((sum, result) => sum + result.overallScore, 0) / allScores.length : 0;

    return {
      ...this.performanceMetrics,
      averageSatisfactionScore: averageScore,
      totalCustomersTracked: this.satisfactionMetrics.size,
      satisfactionLevels: this.calculateSatisfactionDistribution(allScores),
      topInsightTypes: this.getTopInsightTypes(allScores)
    };
  }

  // Additional helper methods with simplified implementations
  getNPSCategory(score) {
    if (score >= 9) return 'promoter';
    if (score >= 7) return 'passive';
    return 'detractor';
  }

  getCSATCategory(score) {
    if (score >= 80) return 'very_satisfied';
    if (score >= 60) return 'satisfied';
    if (score >= 40) return 'neutral';
    return 'unsatisfied';
  }

  getEffortLevel(effortScore) {
    if (effortScore <= 2) return 'very_low_effort';
    if (effortScore <= 3) return 'low_effort';
    if (effortScore <= 4) return 'moderate_effort';
    return 'high_effort';
  }

  getEngagementLevel(usage, adoption) {
    const engagement = (usage + adoption) / 2;
    if (engagement >= 0.8) return 'high';
    if (engagement >= 0.5) return 'medium';
    return 'low';
  }

  detectEmotion(positive, negative, words) {
    if (positive > negative * 2) return 'joy';
    if (negative > positive * 2) return 'anger';
    if (words.includes('disappointed') || words.includes('frustrat')) return 'disappointment';
    return 'neutral';
  }

  calculateTouchpointScores(feedbackData, contextData) {
    const scores = {};
    
    for (const [touchpointId, touchpoint] of Object.entries(this.touchpoints)) {
      let touchpointScore = 50; // Default neutral
      
      // Calculate based on available feedback data
      touchpoint.factors.forEach(factor => {
        if (feedbackData[factor]) {
          touchpointScore += (feedbackData[factor] - 3) * 12.5; // Normalize 1-5 to contribution
        }
      });
      
      scores[touchpointId] = Math.max(0, Math.min(100, touchpointScore));
    }
    
    return scores;
  }

  checkSatisfactionAlerts(customerId, satisfactionScore) {
    // Implementation for satisfaction alerts
  }

  getTriggeredAlerts(customerId, satisfactionScore) {
    return [];
  }

  calculateBatchSatisfactionInsights(results) {
    const averageScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
    
    return {
      averageScore,
      distribution: this.calculateSatisfactionDistribution(results),
      trends: this.analyzeSatisfactionTrends(results)
    };
  }

  calculateSatisfactionDistribution(results) {
    const distribution = {
      very_satisfied: 0,
      satisfied: 0,
      neutral: 0,
      unsatisfied: 0,
      very_unsatisfied: 0
    };
    
    results.forEach(result => {
      const level = result.satisfactionLevel || this.determineSatisfactionLevel(result.overallScore);
      distribution[level]++;
    });
    
    return distribution;
  }

  getTopInsightTypes(results) {
    const insightTypes = {};
    
    results.forEach(result => {
      if (result.insights) {
        result.insights.forEach(insight => {
          insightTypes[insight.type] = (insightTypes[insight.type] || 0) + 1;
        });
      }
    });
    
    return Object.entries(insightTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  analyzeSatisfactionTrends(results) {
    return {
      improving: results.filter(r => r.trendDirection === 'improving').length,
      declining: results.filter(r => r.trendDirection === 'declining').length,
      stable: results.filter(r => r.trendDirection === 'stable').length
    };
  }
}

// Create and export singleton instance
const customerSatisfactionService = new CustomerSatisfactionService();
export default customerSatisfactionService;