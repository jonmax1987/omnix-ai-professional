/**
 * OMNIX AI - Mock A/B Test Generator
 * Generates realistic A/B test updates for real-time testing
 * MGR-027: Live A/B test result updates
 */

class MockABTestGenerator {
  constructor() {
    this.isActive = false;
    this.intervalId = null;
    this.subscribers = [];
    this.generateInterval = 5000; // 5 seconds
    
    // Test templates for different analysis types
    this.testTemplates = [
      {
        testType: 'ai_model_comparison',
        weight: 25,
        analysisTypes: [
          'inventory_prediction',
          'demand_forecasting', 
          'price_optimization',
          'customer_segmentation',
          'recommendation_engine'
        ],
        modelPairs: [
          { A: { name: 'Claude Haiku', type: 'haiku' }, B: { name: 'Claude Sonnet', type: 'sonnet' } },
          { A: { name: 'GPT-4 Turbo', type: 'gpt4_turbo' }, B: { name: 'Claude Sonnet', type: 'sonnet' } },
          { A: { name: 'Baseline Model', type: 'baseline' }, B: { name: 'AI Enhanced', type: 'ai_enhanced' } }
        ],
        metrics: {
          accuracy: { min: 75, max: 95, unit: '%' },
          precision: { min: 70, max: 98, unit: '%' },
          recall: { min: 68, max: 92, unit: '%' },
          f1Score: { min: 72, max: 94, unit: '%' },
          responseTime: { min: 200, max: 1200, unit: 'ms' }
        }
      },
      {
        testType: 'pricing_strategy',
        weight: 20,
        analysisTypes: [
          'dynamic_pricing',
          'promotional_pricing',
          'competitor_pricing',
          'psychological_pricing'
        ],
        modelPairs: [
          { A: { name: 'Conservative Pricing', type: 'conservative' }, B: { name: 'Aggressive Pricing', type: 'aggressive' } },
          { A: { name: 'Fixed Pricing', type: 'fixed' }, B: { name: 'Dynamic Pricing', type: 'dynamic' } },
          { A: { name: 'Cost Plus', type: 'cost_plus' }, B: { name: 'Value Based', type: 'value_based' } }
        ],
        metrics: {
          revenue: { min: 100000, max: 500000, unit: '$' },
          margin: { min: 15, max: 35, unit: '%' },
          conversionRate: { min: 12, max: 28, unit: '%' },
          avgOrderValue: { min: 45, max: 120, unit: '$' },
          customerSatisfaction: { min: 3.2, max: 4.8, unit: '/5' }
        }
      },
      {
        testType: 'recommendation_algorithm',
        weight: 18,
        analysisTypes: [
          'collaborative_filtering',
          'content_based',
          'hybrid_recommendation',
          'deep_learning_rec'
        ],
        modelPairs: [
          { A: { name: 'Collaborative Filter', type: 'collaborative' }, B: { name: 'AI Hybrid Model', type: 'ai_hybrid' } },
          { A: { name: 'Content Based', type: 'content_based' }, B: { name: 'Deep Learning', type: 'deep_learning' } },
          { A: { name: 'Random Forest', type: 'random_forest' }, B: { name: 'Neural Network', type: 'neural_net' } }
        ],
        metrics: {
          clickThroughRate: { min: 2.5, max: 8.5, unit: '%' },
          conversionRate: { min: 6, max: 18, unit: '%' },
          avgRecommendations: { min: 3, max: 8, unit: '' },
          userEngagement: { min: 45, max: 85, unit: '%' },
          revenue: { min: 50000, max: 200000, unit: '$' }
        }
      },
      {
        testType: 'inventory_optimization',
        weight: 15,
        analysisTypes: [
          'stock_level_optimization',
          'reorder_point_calculation',
          'safety_stock_analysis',
          'demand_variability'
        ],
        modelPairs: [
          { A: { name: 'Traditional EOQ', type: 'eoq' }, B: { name: 'AI Predictive', type: 'ai_predictive' } },
          { A: { name: 'Statistical Model', type: 'statistical' }, B: { name: 'Machine Learning', type: 'ml_model' } }
        ],
        metrics: {
          stockoutRate: { min: 2, max: 15, unit: '%' },
          inventoryTurnover: { min: 4, max: 12, unit: 'x' },
          carryingCost: { min: 12000, max: 45000, unit: '$' },
          serviceLevel: { min: 85, max: 98, unit: '%' },
          wasteReduction: { min: 8, max: 35, unit: '%' }
        }
      },
      {
        testType: 'customer_segmentation',
        weight: 12,
        analysisTypes: [
          'behavioral_segmentation',
          'demographic_segmentation',
          'psychographic_segmentation',
          'value_based_segmentation'
        ],
        modelPairs: [
          { A: { name: 'K-Means Clustering', type: 'kmeans' }, B: { name: 'AI Behavioral', type: 'ai_behavioral' } },
          { A: { name: 'Rule Based', type: 'rule_based' }, B: { name: 'Deep Clustering', type: 'deep_clustering' } }
        ],
        metrics: {
          segmentAccuracy: { min: 70, max: 92, unit: '%' },
          targetingEfficiency: { min: 65, max: 88, unit: '%' },
          campaignROI: { min: 150, max: 350, unit: '%' },
          customerLifetimeValue: { min: 180, max: 450, unit: '$' },
          engagementRate: { min: 25, max: 65, unit: '%' }
        }
      },
      {
        testType: 'marketing_optimization',
        weight: 10,
        analysisTypes: [
          'ad_creative_testing',
          'channel_optimization',
          'timing_optimization',
          'audience_targeting'
        ],
        modelPairs: [
          { A: { name: 'Traditional Ads', type: 'traditional' }, B: { name: 'AI Generated', type: 'ai_generated' } },
          { A: { name: 'Broad Targeting', type: 'broad' }, B: { name: 'Precision Targeting', type: 'precision' } }
        ],
        metrics: {
          impressions: { min: 50000, max: 500000, unit: '' },
          clickThroughRate: { min: 1.2, max: 6.8, unit: '%' },
          costPerClick: { min: 0.85, max: 3.20, unit: '$' },
          conversionRate: { min: 8, max: 24, unit: '%' },
          ROAS: { min: 200, max: 450, unit: '%' }
        }
      }
    ];
    
    // Test names for variety
    this.testNameTemplates = [
      'AI Model Performance Comparison',
      'Pricing Strategy Optimization',
      'Recommendation Engine A/B Test',
      'Inventory Management Test',
      'Customer Segmentation Analysis',
      'Marketing Campaign Optimization',
      'Predictive Analytics Benchmark',
      'Revenue Optimization Study',
      'Customer Experience Test',
      'Operational Efficiency Analysis'
    ];
    
    // Current running tests
    this.activeTests = new Map();
    
    this.initializeTests();
  }
  
  initializeTests() {
    // Create initial set of running tests
    for (let i = 0; i < 5; i++) {
      const test = this.generateTest(`initial_test_${i + 1}`, 'running');
      test.startDate = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000); // Random start within last 10 days
      test.lastUpdate = Date.now() - Math.random() * 300000; // Random last update within 5 minutes
      this.activeTests.set(test.testId, test);
    }
    
    // Add some completed tests
    for (let i = 0; i < 3; i++) {
      const test = this.generateTest(`completed_test_${i + 1}`, 'completed');
      test.startDate = new Date(Date.now() - (15 + Math.random() * 30) * 24 * 60 * 60 * 1000); // 15-45 days ago
      test.endDate = new Date(test.startDate.getTime() + test.durationDays * 24 * 60 * 60 * 1000);
      test.lastUpdate = test.endDate.getTime();
      this.activeTests.set(test.testId, test);
    }
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  notifySubscribers(update) {
    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error notifying A/B test subscriber:', error);
      }
    });
  }
  
  getWeightedTestType() {
    const totalWeight = this.testTemplates.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const testType of this.testTemplates) {
      if (random < testType.weight) {
        return testType;
      }
      random -= testType.weight;
    }
    
    return this.testTemplates[0];
  }
  
  generateTest(testId, status = 'running') {
    const template = this.getWeightedTestType();
    const analysisType = template.analysisTypes[Math.floor(Math.random() * template.analysisTypes.length)];
    const modelPair = template.modelPairs[Math.floor(Math.random() * template.modelPairs.length)];
    const testName = this.testNameTemplates[Math.floor(Math.random() * this.testNameTemplates.length)];
    
    // Generate test configuration
    const test = {
      testId,
      testName: `${testName} - ${analysisType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      status,
      analysisType,
      modelA: modelPair.A,
      modelB: modelPair.B,
      trafficSplit: 40 + Math.random() * 20, // 40-60% split
      startDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      durationDays: 7 + Math.floor(Math.random() * 14), // 7-21 days
      participants: Math.floor(500 + Math.random() * 4000), // 500-4500 participants
      modelAResults: {},
      modelBResults: {},
      winner: null,
      confidence: 50 + Math.random() * 45, // 50-95% confidence
      significance: 0.001 + Math.random() * 0.2, // 0.001-0.2 p-value
      lastUpdate: Date.now()
    };
    
    // Generate metrics for both models
    Object.entries(template.metrics).forEach(([metricName, config]) => {
      const baseValue = config.min + Math.random() * (config.max - config.min);
      const variation = 0.1 + Math.random() * 0.2; // 10-30% potential difference
      
      test.modelAResults[metricName] = parseFloat(baseValue.toFixed(2));
      test.modelBResults[metricName] = parseFloat(
        (baseValue * (1 + (Math.random() - 0.5) * variation)).toFixed(2)
      );
    });
    
    // Determine winner based on key metrics
    const keyMetric = Object.keys(template.metrics)[0];
    const aValue = test.modelAResults[keyMetric];
    const bValue = test.modelBResults[keyMetric];
    const improvement = Math.abs((bValue - aValue) / aValue);
    
    if (improvement > 0.05 && test.confidence > 85) {
      test.winner = bValue > aValue ? 'B' : 'A';
    }
    
    return test;
  }
  
  generateTestUpdate(testId) {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'running') return null;
    
    const template = this.testTemplates.find(t => 
      t.analysisTypes.includes(test.analysisType)
    );
    if (!template) return null;
    
    // Update participants
    const participantIncrease = Math.floor(Math.random() * 100) + 20;
    test.participants += participantIncrease;
    
    // Update metrics with small variations
    Object.keys(template.metrics).forEach(metricName => {
      const config = template.metrics[metricName];
      const variation = 0.02; // 2% max variation per update
      
      // Update model A
      const currentA = test.modelAResults[metricName];
      const changeA = (Math.random() - 0.5) * variation * currentA;
      test.modelAResults[metricName] = Math.max(
        config.min, 
        Math.min(config.max, parseFloat((currentA + changeA).toFixed(2)))
      );
      
      // Update model B
      const currentB = test.modelBResults[metricName];
      const changeB = (Math.random() - 0.5) * variation * currentB;
      test.modelBResults[metricName] = Math.max(
        config.min,
        Math.min(config.max, parseFloat((currentB + changeB).toFixed(2)))
      );
    });
    
    // Update confidence and significance
    const progress = (Date.now() - test.startDate.getTime()) / (test.durationDays * 24 * 60 * 60 * 1000);
    test.confidence = Math.min(95, 50 + progress * 45 + Math.random() * 5);
    test.significance = Math.max(0.001, 0.2 - progress * 0.15 + (Math.random() - 0.5) * 0.02);
    
    // Re-evaluate winner
    const keyMetric = Object.keys(template.metrics)[0];
    const aValue = test.modelAResults[keyMetric];
    const bValue = test.modelBResults[keyMetric];
    const improvement = Math.abs((bValue - aValue) / aValue);
    
    if (improvement > 0.05 && test.confidence > 85) {
      test.winner = bValue > aValue ? 'B' : 'A';
    } else if (improvement < 0.03) {
      test.winner = null;
    }
    
    test.lastUpdate = Date.now();
    
    // Create update event
    const update = {
      type: 'test_metrics_update',
      testId: test.testId,
      testName: test.testName,
      participantIncrease,
      newParticipants: test.participants,
      updatedMetrics: {
        modelA: { ...test.modelAResults },
        modelB: { ...test.modelBResults }
      },
      confidence: test.confidence,
      significance: test.significance,
      winner: test.winner,
      timestamp: new Date(),
      progress: Math.min(progress * 100, 100)
    };
    
    return update;
  }
  
  generateRandomEvent() {
    const events = ['participant_milestone', 'significance_reached', 'test_completion', 'performance_alert'];
    const eventType = events[Math.floor(Math.random() * events.length)];
    const runningTests = Array.from(this.activeTests.values()).filter(t => t.status === 'running');
    
    if (runningTests.length === 0) return null;
    
    const test = runningTests[Math.floor(Math.random() * runningTests.length)];
    
    const event = {
      type: eventType,
      testId: test.testId,
      testName: test.testName,
      timestamp: new Date()
    };
    
    switch (eventType) {
      case 'participant_milestone':
        const milestones = [1000, 2500, 5000, 10000];
        const milestone = milestones.find(m => test.participants >= m && test.participants - 100 < m);
        if (milestone) {
          event.milestone = milestone;
          event.message = `Test reached ${milestone} participants`;
        } else {
          return null;
        }
        break;
        
      case 'significance_reached':
        if (test.confidence > 90 && test.significance < 0.05) {
          event.confidence = test.confidence;
          event.significance = test.significance;
          event.winner = test.winner;
          event.message = `Statistical significance reached (${test.confidence.toFixed(1)}% confidence)`;
        } else {
          return null;
        }
        break;
        
      case 'test_completion':
        const progress = (Date.now() - test.startDate.getTime()) / (test.durationDays * 24 * 60 * 60 * 1000);
        if (progress >= 1.0) {
          test.status = 'completed';
          test.endDate = new Date();
          event.message = `Test completed after ${test.durationDays} days`;
          event.finalResults = {
            winner: test.winner,
            confidence: test.confidence,
            significance: test.significance,
            participants: test.participants
          };
        } else {
          return null;
        }
        break;
        
      case 'performance_alert':
        // Random performance issue
        const issues = [
          'Model B response time increased significantly',
          'Unusual traffic pattern detected',
          'Model A accuracy dropped below threshold',
          'High variance in conversion rates detected'
        ];
        event.message = issues[Math.floor(Math.random() * issues.length)];
        event.severity = Math.random() > 0.7 ? 'high' : 'medium';
        break;
    }
    
    return event;
  }
  
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🧪 Mock A/B Test Generator started');
    
    this.intervalId = setInterval(() => {
      // 70% chance of metric update, 30% chance of event
      if (Math.random() < 0.7) {
        const runningTests = Array.from(this.activeTests.keys()).filter(
          testId => this.activeTests.get(testId).status === 'running'
        );
        
        if (runningTests.length > 0) {
          const testId = runningTests[Math.floor(Math.random() * runningTests.length)];
          const update = this.generateTestUpdate(testId);
          if (update) {
            this.notifySubscribers(update);
          }
        }
      } else {
        const event = this.generateRandomEvent();
        if (event) {
          this.notifySubscribers(event);
        }
      }
    }, this.generateInterval);
  }
  
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🧪 Mock A/B Test Generator stopped');
  }
  
  generateBurst(count = 3) {
    console.log(`🧪 Generating ${count} A/B test updates...`);
    
    const runningTests = Array.from(this.activeTests.keys()).filter(
      testId => this.activeTests.get(testId).status === 'running'
    );
    
    for (let i = 0; i < count && i < runningTests.length; i++) {
      setTimeout(() => {
        const testId = runningTests[i];
        const update = this.generateTestUpdate(testId);
        if (update) {
          this.notifySubscribers(update);
        }
      }, i * 1000);
    }
  }
  
  getAllTests() {
    return Array.from(this.activeTests.values());
  }
  
  getTestById(testId) {
    return this.activeTests.get(testId);
  }
  
  getRunningTests() {
    return Array.from(this.activeTests.values()).filter(test => test.status === 'running');
  }
  
  getTestStats() {
    const tests = Array.from(this.activeTests.values());
    return {
      total: tests.length,
      running: tests.filter(t => t.status === 'running').length,
      completed: tests.filter(t => t.status === 'completed').length,
      paused: tests.filter(t => t.status === 'paused').length,
      totalParticipants: tests.reduce((sum, t) => sum + t.participants, 0),
      avgConfidence: tests.length ? tests.reduce((sum, t) => sum + t.confidence, 0) / tests.length : 0
    };
  }
}

// Export singleton instance
const mockABTestGenerator = new MockABTestGenerator();

export default mockABTestGenerator;