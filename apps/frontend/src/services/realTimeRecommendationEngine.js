/**
 * OMNIX AI - Real-Time Recommendation Engine
 * Dynamic product recommendations based on live behavior and patterns
 * STREAM-004: Real-time recommendation adjustments
 */

import customerBehaviorAnalytics from './customerBehaviorAnalytics';
import consumptionPatternService from './consumptionPatternService';
import segmentMigrationService from './segmentMigrationService';

class RealTimeRecommendationEngine {
  constructor() {
    this.recommendations = new Map(); // customerId -> recommendations
    this.recommendationHistory = new Map(); // track performance
    this.listeners = new Set();
    this.algorithmWeights = this.initializeAlgorithmWeights();
    this.contextFactors = this.initializeContextFactors();
    this.performanceMetrics = new Map();
    this.abTestVariants = new Map();
  }

  /**
   * Initialize recommendation algorithm weights
   */
  initializeAlgorithmWeights() {
    return {
      // Behavior-based weights
      behaviorRecency: 0.3,
      behaviorFrequency: 0.25,
      behaviorValue: 0.2,
      
      // Pattern-based weights
      consumptionPattern: 0.35,
      seasonalPattern: 0.15,
      temporalPattern: 0.1,
      
      // Segment-based weights
      segmentPreference: 0.4,
      segmentMigration: 0.3,
      churnRisk: 0.3,
      
      // Social proof weights
      popularityScore: 0.2,
      trendingScore: 0.15,
      ratingScore: 0.25,
      
      // Context weights
      timeOfDay: 0.1,
      dayOfWeek: 0.05,
      season: 0.15,
      inventory: 0.25,
      pricing: 0.2
    };
  }

  /**
   * Initialize context factors for recommendations
   */
  initializeContextFactors() {
    return {
      timeOfDay: {
        morning: { health: 1.5, convenience: 1.2, coffee: 2.0 },
        afternoon: { snacks: 1.3, productivity: 1.1, beverages: 1.2 },
        evening: { entertainment: 1.4, comfort: 1.3, family: 1.2 },
        night: { convenience: 1.5, delivery: 1.8, essentials: 0.8 }
      },
      dayOfWeek: {
        weekday: { convenience: 1.3, productivity: 1.2, health: 1.1 },
        weekend: { entertainment: 1.4, family: 1.5, leisure: 1.3 }
      },
      season: {
        spring: { health: 1.3, outdoor: 1.4, fresh: 1.2 },
        summer: { cooling: 1.8, outdoor: 1.5, beverages: 1.4 },
        fall: { comfort: 1.3, warm: 1.2, seasonal: 1.5 },
        winter: { comfort: 1.6, warm: 1.8, indoor: 1.3 }
      }
    };
  }

  /**
   * Generate real-time recommendations for a customer
   */
  async generateRecommendations(customerId, context = {}) {
    try {
      // Get customer data
      const behaviorAnalysis = await this.getCustomerBehaviorAnalysis(customerId);
      const consumptionPatterns = await this.getCustomerConsumptionPatterns(customerId);
      const segmentData = await this.getCustomerSegmentData(customerId);
      
      // Generate recommendations using multiple algorithms
      const recommendations = await this.combineRecommendationAlgorithms(
        customerId,
        behaviorAnalysis,
        consumptionPatterns,
        segmentData,
        context
      );
      
      // Apply real-time adjustments
      const adjustedRecommendations = await this.applyRealTimeAdjustments(
        recommendations,
        customerId,
        context
      );
      
      // Score and rank recommendations
      const rankedRecommendations = this.scoreAndRankRecommendations(
        adjustedRecommendations,
        behaviorAnalysis,
        context
      );
      
      // Store recommendations
      this.recommendations.set(customerId, {
        customerId,
        recommendations: rankedRecommendations,
        timestamp: new Date().toISOString(),
        context,
        algorithms: this.getAlgorithmContributions(rankedRecommendations),
        confidence: this.calculateOverallConfidence(rankedRecommendations)
      });
      
      // Track performance
      this.trackRecommendationGeneration(customerId, rankedRecommendations);
      
      // Notify listeners
      this.notifyListeners({
        customerId,
        recommendations: rankedRecommendations,
        type: 'generation',
        timestamp: new Date().toISOString()
      });
      
      return rankedRecommendations;
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return [];
    }
  }

  /**
   * Combine multiple recommendation algorithms
   */
  async combineRecommendationAlgorithms(customerId, behaviorAnalysis, patterns, segmentData, context) {
    const recommendations = new Map();

    // 1. Collaborative Filtering
    const collaborativeRecs = await this.getCollaborativeRecommendations(customerId, segmentData);
    this.mergeRecommendations(recommendations, collaborativeRecs, 'collaborative', 0.3);

    // 2. Content-Based Filtering
    const contentRecs = await this.getContentBasedRecommendations(customerId, behaviorAnalysis);
    this.mergeRecommendations(recommendations, contentRecs, 'content', 0.25);

    // 3. Pattern-Based Recommendations
    const patternRecs = await this.getPatternBasedRecommendations(customerId, patterns);
    this.mergeRecommendations(recommendations, patternRecs, 'pattern', 0.35);

    // 4. Trending Products
    const trendingRecs = await this.getTrendingRecommendations(context);
    this.mergeRecommendations(recommendations, trendingRecs, 'trending', 0.1);

    // 5. Seasonal Recommendations
    const seasonalRecs = await this.getSeasonalRecommendations(context);
    this.mergeRecommendations(recommendations, seasonalRecs, 'seasonal', 0.15);

    // 6. Inventory-Based Recommendations
    const inventoryRecs = await this.getInventoryBasedRecommendations(context);
    this.mergeRecommendations(recommendations, inventoryRecs, 'inventory', 0.1);

    return Array.from(recommendations.values());
  }

  /**
   * Apply real-time adjustments based on current context
   */
  async applyRealTimeAdjustments(recommendations, customerId, context) {
    return recommendations.map(rec => {
      let adjustedScore = rec.score;
      const adjustments = [];

      // Time-based adjustments
      const timeAdjustment = this.applyTimeAdjustments(rec, context);
      adjustedScore *= timeAdjustment.multiplier;
      if (timeAdjustment.multiplier !== 1) {
        adjustments.push(timeAdjustment.reason);
      }

      // Inventory adjustments
      const inventoryAdjustment = this.applyInventoryAdjustments(rec, context);
      adjustedScore *= inventoryAdjustment.multiplier;
      if (inventoryAdjustment.multiplier !== 1) {
        adjustments.push(inventoryAdjustment.reason);
      }

      // Pricing adjustments
      const pricingAdjustment = this.applyPricingAdjustments(rec, context);
      adjustedScore *= pricingAdjustment.multiplier;
      if (pricingAdjustment.multiplier !== 1) {
        adjustments.push(pricingAdjustment.reason);
      }

      // Personalization adjustments
      const personalAdjustment = this.applyPersonalizationAdjustments(rec, customerId);
      adjustedScore *= personalAdjustment.multiplier;
      if (personalAdjustment.multiplier !== 1) {
        adjustments.push(personalAdjustment.reason);
      }

      return {
        ...rec,
        originalScore: rec.score,
        score: Math.max(0, Math.min(1, adjustedScore)),
        adjustments,
        adjustmentFactors: {
          time: timeAdjustment.multiplier,
          inventory: inventoryAdjustment.multiplier,
          pricing: pricingAdjustment.multiplier,
          personal: personalAdjustment.multiplier
        }
      };
    });
  }

  /**
   * Get collaborative filtering recommendations
   */
  async getCollaborativeRecommendations(customerId, segmentData) {
    // Simulate collaborative filtering based on segment similarity
    const similarCustomers = this.findSimilarCustomers(customerId, segmentData);
    const recommendations = [];

    similarCustomers.forEach(similarCustomer => {
      // Get products purchased by similar customers
      const analytics = consumptionPatternService.getCustomerAnalytics(similarCustomer.customerId);
      if (analytics) {
        analytics.summary.favoriteCategories.forEach(category => {
          recommendations.push({
            productId: `${category.category}_popular`,
            category: category.category,
            reason: `Popular with similar customers (${segmentData.segment})`,
            score: 0.7 * similarCustomer.similarity,
            algorithm: 'collaborative',
            confidence: similarCustomer.similarity
          });
        });
      }
    });

    return recommendations.slice(0, 10);
  }

  /**
   * Get content-based recommendations
   */
  async getContentBasedRecommendations(customerId, behaviorAnalysis) {
    const recommendations = [];
    
    if (behaviorAnalysis.predictions?.preferredCategories) {
      behaviorAnalysis.predictions.preferredCategories.forEach((category, index) => {
        recommendations.push({
          productId: `${category}_recommended`,
          category,
          reason: `Based on your preference for ${category}`,
          score: 0.8 - (index * 0.1),
          algorithm: 'content',
          confidence: 0.8
        });
      });
    }

    return recommendations;
  }

  /**
   * Get pattern-based recommendations
   */
  async getPatternBasedRecommendations(customerId, patterns) {
    const recommendations = [];
    
    if (patterns && patterns.length > 0) {
      patterns.forEach(pattern => {
        if (pattern.predictions?.nextPurchaseDate) {
          const daysUntil = Math.ceil(
            (new Date(pattern.predictions.nextPurchaseDate) - new Date()) / (24 * 60 * 60 * 1000)
          );
          
          if (daysUntil <= 7) {
            recommendations.push({
              productId: pattern.productId,
              category: pattern.category,
              reason: `Due for replenishment in ${daysUntil} days`,
              score: 0.9 - (daysUntil * 0.05),
              algorithm: 'pattern',
              confidence: pattern.confidence,
              urgency: daysUntil <= 3 ? 'high' : 'medium',
              predictedDate: pattern.predictions.nextPurchaseDate
            });
          }
        }
        
        if (pattern.insights) {
          pattern.insights.forEach(insight => {
            if (insight.type === 'frequency' && insight.priority === 'high') {
              recommendations.push({
                productId: `${pattern.category}_frequency`,
                category: pattern.category,
                reason: insight.message,
                score: 0.85,
                algorithm: 'pattern',
                confidence: pattern.confidence
              });
            }
          });
        }
      });
    }

    return recommendations;
  }

  /**
   * Apply time-based adjustments
   */
  applyTimeAdjustments(recommendation, context) {
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const season = this.getCurrentSeason();

    let multiplier = 1;
    let reason = '';

    // Time of day adjustments
    if (hour >= 6 && hour < 12) { // Morning
      const morningFactors = this.contextFactors.timeOfDay.morning;
      if (morningFactors[recommendation.category]) {
        multiplier *= morningFactors[recommendation.category];
        reason = 'Morning boost';
      }
    } else if (hour >= 12 && hour < 17) { // Afternoon
      const afternoonFactors = this.contextFactors.timeOfDay.afternoon;
      if (afternoonFactors[recommendation.category]) {
        multiplier *= afternoonFactors[recommendation.category];
        reason = 'Afternoon preference';
      }
    } else if (hour >= 17 && hour < 22) { // Evening
      const eveningFactors = this.contextFactors.timeOfDay.evening;
      if (eveningFactors[recommendation.category]) {
        multiplier *= eveningFactors[recommendation.category];
        reason = 'Evening preference';
      }
    }

    // Weekend adjustments
    if (isWeekend) {
      const weekendFactors = this.contextFactors.dayOfWeek.weekend;
      if (weekendFactors[recommendation.category]) {
        multiplier *= weekendFactors[recommendation.category];
        reason += reason ? ', Weekend boost' : 'Weekend boost';
      }
    }

    // Seasonal adjustments
    const seasonalFactors = this.contextFactors.season[season];
    if (seasonalFactors && seasonalFactors[recommendation.category]) {
      multiplier *= seasonalFactors[recommendation.category];
      reason += reason ? `, ${season} season` : `${season} season boost`;
    }

    return {
      multiplier: Math.max(0.1, Math.min(2.0, multiplier)),
      reason: reason || 'No time adjustment'
    };
  }

  /**
   * Apply inventory-based adjustments
   */
  applyInventoryAdjustments(recommendation, context) {
    let multiplier = 1;
    let reason = '';

    // Mock inventory data - in real app this would come from inventory service
    const inventoryLevel = context.inventory?.[recommendation.productId] || 100;
    
    if (inventoryLevel < 10) {
      multiplier *= 0.3; // Heavily reduce low stock items
      reason = 'Low inventory';
    } else if (inventoryLevel < 25) {
      multiplier *= 0.7; // Reduce medium stock items
      reason = 'Limited stock';
    } else if (inventoryLevel > 100) {
      multiplier *= 1.2; // Boost high stock items
      reason = 'High availability';
    }

    return {
      multiplier: Math.max(0.1, Math.min(1.5, multiplier)),
      reason
    };
  }

  /**
   * Apply pricing adjustments
   */
  applyPricingAdjustments(recommendation, context) {
    let multiplier = 1;
    let reason = '';

    // Mock pricing data
    const priceChange = context.pricing?.[recommendation.productId] || 0;
    const discount = context.discounts?.[recommendation.productId] || 0;
    
    if (discount > 0.2) { // 20%+ discount
      multiplier *= 1.5;
      reason = `${Math.round(discount * 100)}% discount`;
    } else if (discount > 0.1) { // 10%+ discount
      multiplier *= 1.2;
      reason = `${Math.round(discount * 100)}% discount`;
    }
    
    if (priceChange > 0.1) { // Price increased
      multiplier *= 0.8;
      reason += reason ? ', Price increased' : 'Price increased';
    }

    return {
      multiplier: Math.max(0.5, Math.min(2.0, multiplier)),
      reason: reason || 'No pricing adjustment'
    };
  }

  /**
   * Apply personalization adjustments
   */
  applyPersonalizationAdjustments(recommendation, customerId) {
    let multiplier = 1;
    let reason = '';

    // Get customer's historical interaction with this recommendation
    const history = this.recommendationHistory.get(customerId) || [];
    const previousInteractions = history.filter(h => 
      h.productId === recommendation.productId || h.category === recommendation.category
    );

    if (previousInteractions.length > 0) {
      const avgClickRate = previousInteractions.reduce((sum, h) => sum + (h.clicked ? 1 : 0), 0) / previousInteractions.length;
      const avgPurchaseRate = previousInteractions.reduce((sum, h) => sum + (h.purchased ? 1 : 0), 0) / previousInteractions.length;
      
      if (avgClickRate > 0.5) {
        multiplier *= 1.3;
        reason = 'High engagement history';
      } else if (avgClickRate < 0.1) {
        multiplier *= 0.6;
        reason = 'Low engagement history';
      }
      
      if (avgPurchaseRate > 0.3) {
        multiplier *= 1.4;
        reason += reason ? ', High purchase rate' : 'High purchase rate';
      }
    }

    return {
      multiplier: Math.max(0.3, Math.min(1.8, multiplier)),
      reason: reason || 'No personalization data'
    };
  }

  /**
   * Score and rank recommendations
   */
  scoreAndRankRecommendations(recommendations, behaviorAnalysis, context) {
    return recommendations
      .map(rec => ({
        ...rec,
        finalScore: this.calculateFinalScore(rec, behaviorAnalysis, context),
        ranking: 0
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((rec, index) => ({ ...rec, ranking: index + 1 }))
      .slice(0, 20); // Top 20 recommendations
  }

  /**
   * Calculate final recommendation score
   */
  calculateFinalScore(recommendation, behaviorAnalysis, context) {
    let score = recommendation.score || 0.5;
    
    // Apply algorithm confidence
    score *= recommendation.confidence || 0.8;
    
    // Apply segment relevance
    if (behaviorAnalysis.segment && this.getSegmentRelevance(recommendation, behaviorAnalysis.segment)) {
      score *= this.getSegmentRelevance(recommendation, behaviorAnalysis.segment);
    }
    
    // Apply freshness decay (newer recommendations score higher)
    const age = Date.now() - new Date(recommendation.timestamp || Date.now()).getTime();
    const freshnessMultiplier = Math.max(0.5, 1 - (age / (24 * 60 * 60 * 1000))); // Decay over 24 hours
    score *= freshnessMultiplier;
    
    // Apply diversity penalty (reduce score if too similar to other high-scoring recs)
    const diversityPenalty = this.calculateDiversityPenalty(recommendation, context.existingRecommendations || []);
    score *= (1 - diversityPenalty);

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Real-time recommendation adjustment based on behavior changes
   */
  adjustRecommendationsRealTime(customerId, behaviorEvent) {
    const existingRecs = this.recommendations.get(customerId);
    if (!existingRecs) return null;

    const adjustedRecs = existingRecs.recommendations.map(rec => {
      let scoreMultiplier = 1;
      const adjustments = [...(rec.adjustments || [])];

      // Boost recommendations related to current behavior
      if (behaviorEvent.type === 'product_view' && 
          (rec.category === behaviorEvent.product?.category || rec.productId === behaviorEvent.product?.id)) {
        scoreMultiplier *= 1.5;
        adjustments.push('Current interest boost');
      }

      // Boost cart abandonment recovery
      if (behaviorEvent.type === 'cart_abandon' && rec.category === behaviorEvent.product?.category) {
        scoreMultiplier *= 1.8;
        adjustments.push('Cart recovery boost');
      }

      // Reduce recommendations for purchased items
      if (behaviorEvent.type === 'purchase' && rec.productId === behaviorEvent.product?.id) {
        scoreMultiplier *= 0.2;
        adjustments.push('Recently purchased');
      }

      // Boost complementary products after purchase
      if (behaviorEvent.type === 'purchase' && this.isComplementary(rec, behaviorEvent.product)) {
        scoreMultiplier *= 1.6;
        adjustments.push('Complementary product');
      }

      return {
        ...rec,
        score: Math.max(0, Math.min(1, rec.score * scoreMultiplier)),
        adjustments,
        lastAdjustment: new Date().toISOString(),
        adjustmentReason: `Behavior: ${behaviorEvent.type}`
      };
    });

    // Re-rank after adjustments
    const rerankedRecs = adjustedRecs
      .sort((a, b) => b.score - a.score)
      .map((rec, index) => ({ ...rec, ranking: index + 1 }));

    // Update stored recommendations
    this.recommendations.set(customerId, {
      ...existingRecs,
      recommendations: rerankedRecs,
      lastAdjustment: new Date().toISOString(),
      adjustmentTrigger: behaviorEvent.type
    });

    // Notify listeners of adjustment
    this.notifyListeners({
      customerId,
      recommendations: rerankedRecs,
      type: 'adjustment',
      trigger: behaviorEvent.type,
      timestamp: new Date().toISOString()
    });

    return rerankedRecs;
  }

  /**
   * Track recommendation performance
   */
  trackRecommendationInteraction(customerId, productId, interactionType, metadata = {}) {
    const history = this.recommendationHistory.get(customerId) || [];
    
    history.push({
      productId,
      interactionType, // 'view', 'click', 'purchase', 'ignore'
      timestamp: new Date().toISOString(),
      metadata,
      clicked: interactionType === 'click',
      purchased: interactionType === 'purchase',
      viewed: interactionType === 'view'
    });

    // Keep last 1000 interactions per customer
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    this.recommendationHistory.set(customerId, history);

    // Update algorithm performance metrics
    this.updateAlgorithmPerformance(customerId, productId, interactionType);
  }

  /**
   * Helper methods
   */
  
  findSimilarCustomers(customerId, segmentData) {
    // Mock implementation - in real app would use ML similarity
    return [
      { customerId: 'similar1', similarity: 0.85, segment: segmentData.segment },
      { customerId: 'similar2', similarity: 0.78, segment: segmentData.segment },
      { customerId: 'similar3', similarity: 0.72, segment: segmentData.segment }
    ];
  }

  getSegmentRelevance(recommendation, segment) {
    const segmentPreferences = {
      'high_value': { luxury: 1.5, premium: 1.3, exclusive: 1.4 },
      'bargain_hunter': { budget: 1.6, discount: 1.8, value: 1.3 },
      'frequent_buyer': { convenience: 1.4, bulk: 1.2, staples: 1.3 },
      'loyal': { premium: 1.2, new_arrivals: 1.1, exclusive: 1.3 }
    };

    return segmentPreferences[segment]?.[recommendation.category] || 1.0;
  }

  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  isComplementary(recommendation, purchasedProduct) {
    const complementaryPairs = {
      'coffee': ['cream', 'sugar', 'pastries'],
      'pasta': ['sauce', 'cheese', 'bread'],
      'milk': ['cereal', 'cookies', 'bread'],
      'wine': ['cheese', 'crackers', 'chocolate']
    };

    const purchased = purchasedProduct?.category?.toLowerCase();
    const recommended = recommendation.category?.toLowerCase();

    return complementaryPairs[purchased]?.includes(recommended) || 
           complementaryPairs[recommended]?.includes(purchased);
  }

  calculateDiversityPenalty(recommendation, existingRecommendations) {
    const sameCategory = existingRecommendations.filter(r => 
      r.category === recommendation.category && r.ranking <= 5
    ).length;

    return Math.min(0.5, sameCategory * 0.1); // Max 50% penalty
  }

  calculateOverallConfidence(recommendations) {
    if (recommendations.length === 0) return 0;
    
    const totalConfidence = recommendations.reduce((sum, rec) => 
      sum + (rec.confidence || 0.5), 0
    );
    
    return totalConfidence / recommendations.length;
  }

  mergeRecommendations(recommendations, newRecs, algorithm, weight) {
    newRecs.forEach(rec => {
      const key = rec.productId;
      if (recommendations.has(key)) {
        const existing = recommendations.get(key);
        existing.score = (existing.score * existing.weight + rec.score * weight) / 
                        (existing.weight + weight);
        existing.weight += weight;
        existing.algorithms.push(algorithm);
      } else {
        recommendations.set(key, {
          ...rec,
          weight,
          algorithms: [algorithm]
        });
      }
    });
  }

  async getTrendingRecommendations(context) {
    // Mock trending products
    return [
      { productId: 'trending1', category: 'electronics', score: 0.8, reason: 'Trending now' },
      { productId: 'trending2', category: 'fashion', score: 0.7, reason: 'Popular today' }
    ];
  }

  async getSeasonalRecommendations(context) {
    const season = this.getCurrentSeason();
    const seasonalProducts = {
      spring: [{ productId: 'spring1', category: 'outdoor', score: 0.8 }],
      summer: [{ productId: 'summer1', category: 'cooling', score: 0.9 }],
      fall: [{ productId: 'fall1', category: 'warm', score: 0.8 }],
      winter: [{ productId: 'winter1', category: 'comfort', score: 0.9 }]
    };

    return seasonalProducts[season] || [];
  }

  async getInventoryBasedRecommendations(context) {
    // Mock recommendations based on high inventory
    return [
      { productId: 'highstock1', category: 'excess', score: 0.6, reason: 'High inventory' }
    ];
  }

  getAlgorithmContributions(recommendations) {
    const contributions = {};
    recommendations.forEach(rec => {
      rec.algorithms?.forEach(algo => {
        contributions[algo] = (contributions[algo] || 0) + 1;
      });
    });
    return contributions;
  }

  trackRecommendationGeneration(customerId, recommendations) {
    // Track generation metrics for optimization
    const metrics = this.performanceMetrics.get(customerId) || {
      generationCount: 0,
      avgGenerationTime: 0,
      totalRecommendations: 0
    };

    metrics.generationCount++;
    metrics.totalRecommendations += recommendations.length;
    
    this.performanceMetrics.set(customerId, metrics);
  }

  updateAlgorithmPerformance(customerId, productId, interactionType) {
    // Update algorithm performance tracking
    const rec = this.findRecommendationByProduct(customerId, productId);
    if (rec && rec.algorithms) {
      rec.algorithms.forEach(algorithm => {
        // Track algorithm success rates
      });
    }
  }

  findRecommendationByProduct(customerId, productId) {
    const customerRecs = this.recommendations.get(customerId);
    return customerRecs?.recommendations.find(r => r.productId === productId);
  }

  /**
   * Subscribe to recommendation updates
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of recommendation changes
   */
  notifyListeners(update) {
    this.listeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Recommendation listener error:', error);
      }
    });
  }

  /**
   * Get recommendations for a customer
   */
  getRecommendations(customerId) {
    return this.recommendations.get(customerId);
  }

  /**
   * Clear recommendations
   */
  clearRecommendations(customerId = null) {
    if (customerId) {
      this.recommendations.delete(customerId);
    } else {
      this.recommendations.clear();
    }
  }

  /**
   * Get recommendation statistics
   */
  getStatistics() {
    return {
      totalCustomers: this.recommendations.size,
      totalRecommendations: Array.from(this.recommendations.values())
        .reduce((sum, customer) => sum + customer.recommendations.length, 0),
      avgConfidence: Array.from(this.recommendations.values())
        .reduce((sum, customer) => sum + customer.confidence, 0) / this.recommendations.size,
      algorithmDistribution: this.getAlgorithmDistribution()
    };
  }

  getAlgorithmDistribution() {
    const distribution = {};
    for (const customer of this.recommendations.values()) {
      Object.entries(customer.algorithms || {}).forEach(([algo, count]) => {
        distribution[algo] = (distribution[algo] || 0) + count;
      });
    }
    return distribution;
  }
}

// Create singleton instance
const realTimeRecommendationEngine = new RealTimeRecommendationEngine();

export default realTimeRecommendationEngine;