/**
 * OMNIX AI - A/B Testing Service with Real-time Updates
 * MGR-027: Live A/B test result updates
 * Comprehensive A/B testing analytics with statistical significance
 */

class ABTestingService {
  constructor() {
    this.activeTests = new Map();
    this.testResults = new Map();
    this.testHistory = [];
    this.subscribers = new Set();
    this.updateQueue = [];
    
    this.config = {
      minSampleSize: 100,
      significanceLevel: 0.05, // 95% confidence
      minTestDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      maxTestDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
      updateInterval: 5000, // 5 seconds
      metrics: {
        conversion_rate: { name: 'Conversion Rate', unit: '%', type: 'percentage' },
        revenue_per_visitor: { name: 'Revenue per Visitor', unit: '$', type: 'currency' },
        average_order_value: { name: 'Average Order Value', unit: '$', type: 'currency' },
        click_through_rate: { name: 'Click-through Rate', unit: '%', type: 'percentage' },
        engagement_rate: { name: 'Engagement Rate', unit: '%', type: 'percentage' },
        bounce_rate: { name: 'Bounce Rate', unit: '%', type: 'percentage' },
        time_on_page: { name: 'Time on Page', unit: 's', type: 'duration' },
        page_views: { name: 'Page Views', unit: '', type: 'count' }
      }
    };

    this.initializeTestProcessing();
    this.generateMockTests();
  }

  /**
   * Initialize test processing and real-time updates
   */
  initializeTestProcessing() {
    // Process updates every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processUpdates();
    }, this.config.updateInterval);

    // Generate mock data for demonstration
    this.mockDataInterval = setInterval(() => {
      this.generateMockTestData();
    }, 10000); // Every 10 seconds
  }

  /**
   * Create a new A/B test
   */
  createTest(testConfig) {
    const test = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: testConfig.name,
      description: testConfig.description,
      hypothesis: testConfig.hypothesis,
      primaryMetric: testConfig.primaryMetric,
      secondaryMetrics: testConfig.secondaryMetrics || [],
      variants: testConfig.variants.map((variant, index) => ({
        id: `variant_${index}`,
        name: variant.name,
        description: variant.description,
        trafficAllocation: variant.trafficAllocation || (100 / testConfig.variants.length),
        isControl: variant.isControl || index === 0
      })),
      status: 'draft',
      startDate: null,
      endDate: null,
      createdAt: new Date().toISOString(),
      createdBy: testConfig.createdBy || 'system',
      targetAudience: testConfig.targetAudience || 'all',
      expectedEffect: testConfig.expectedEffect || 5, // 5% improvement
      powerAnalysis: this.calculatePowerAnalysis(testConfig),
      metadata: {
        category: testConfig.category || 'general',
        tags: testConfig.tags || [],
        businessImpact: testConfig.businessImpact || 'medium'
      }
    };

    this.activeTests.set(test.id, test);
    this.notifySubscribers('test_created', test);
    return test;
  }

  /**
   * Start an A/B test
   */
  startTest(testId) {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    test.status = 'running';
    test.startDate = new Date().toISOString();
    test.endDate = new Date(Date.now() + this.config.maxTestDuration).toISOString();

    // Initialize results tracking
    const initialResults = {
      testId,
      startDate: test.startDate,
      lastUpdate: new Date().toISOString(),
      totalParticipants: 0,
      variants: test.variants.map(variant => ({
        variantId: variant.id,
        name: variant.name,
        participants: 0,
        conversions: 0,
        metrics: this.initializeMetrics(),
        statisticalSignificance: false,
        confidenceLevel: 0,
        liftOverControl: null
      })),
      overallMetrics: this.initializeMetrics(),
      statisticalAnalysis: {
        isSignificant: false,
        pValue: null,
        confidenceLevel: 0,
        recommendedAction: 'continue',
        daysRemaining: this.calculateDaysRemaining(test.startDate),
        progressPercentage: 0
      }
    };

    this.testResults.set(testId, initialResults);
    this.activeTests.set(testId, test);
    this.notifySubscribers('test_started', { test, results: initialResults });

    return { test, results: initialResults };
  }

  /**
   * Get real-time test results
   */
  getTestResults(testId) {
    const test = this.activeTests.get(testId);
    const results = this.testResults.get(testId);
    
    if (!test || !results) return null;

    return {
      test,
      results: {
        ...results,
        variants: results.variants.map(variant => ({
          ...variant,
          conversionRate: variant.participants > 0 ? 
            (variant.conversions / variant.participants * 100).toFixed(2) : '0.00',
          metrics: this.formatMetrics(variant.metrics)
        })),
        overallMetrics: this.formatMetrics(results.overallMetrics)
      }
    };
  }

  /**
   * Get all active tests
   */
  getActiveTests() {
    return Array.from(this.activeTests.values()).map(test => ({
      ...test,
      results: this.testResults.get(test.id)
    }));
  }

  /**
   * List all tests (for API compatibility)
   */
  async listAllTests(params = {}) {
    try {
      const tests = Array.from(this.activeTests.values()).map(test => ({
        ...test,
        results: this.testResults.get(test.id)
      }));

      // Apply filters if provided
      let filteredTests = tests;
      if (params.status) {
        filteredTests = tests.filter(test => test.status === params.status);
      }
      if (params.category) {
        filteredTests = filteredTests.filter(test => test.metadata?.category === params.category);
      }

      return {
        data: filteredTests,
        total: filteredTests.length,
        page: params.page || 1,
        limit: params.limit || 25
      };
    } catch (error) {
      throw new Error(`Failed to list tests: ${error.message}`);
    }
  }

  /**
   * Get available models for A/B testing (mock data)
   */
  async getAvailableModels() {
    try {
      // Mock available AI models for A/B testing
      const models = [
        {
          id: 'claude-3-haiku',
          name: 'Claude 3 Haiku',
          provider: 'Anthropic',
          type: 'text',
          capabilities: ['chat', 'analysis', 'recommendations'],
          cost: 0.25,
          speed: 'fast',
          accuracy: 'high'
        },
        {
          id: 'claude-3-sonnet', 
          name: 'Claude 3 Sonnet',
          provider: 'Anthropic',
          type: 'text',
          capabilities: ['chat', 'analysis', 'recommendations', 'complex_reasoning'],
          cost: 3.00,
          speed: 'medium',
          accuracy: 'very_high'
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          provider: 'OpenAI',
          type: 'text',
          capabilities: ['chat', 'analysis'],
          cost: 0.15,
          speed: 'fast',
          accuracy: 'good'
        },
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          provider: 'OpenAI', 
          type: 'text',
          capabilities: ['chat', 'analysis', 'recommendations', 'multimodal'],
          cost: 5.00,
          speed: 'medium',
          accuracy: 'excellent'
        }
      ];

      return {
        data: models,
        total: models.length
      };
    } catch (error) {
      throw new Error(`Failed to get available models: ${error.message}`);
    }
  }

  /**
   * Process queued updates
   */
  processUpdates() {
    if (this.updateQueue.length === 0) return;

    const updates = this.updateQueue.splice(0, 50); // Process up to 50 updates
    const updatedTests = new Set();

    updates.forEach(update => {
      updatedTests.add(update.testId);
    });

    // Notify subscribers of updated tests
    updatedTests.forEach(testId => {
      const testData = this.getTestResults(testId);
      if (testData) {
        this.notifySubscribers('test_updated', testData);
      }
    });
  }

  /**
   * Calculate statistical analysis
   */
  calculateStatisticalAnalysis(results) {
    const controlVariant = results.variants.find(v => 
      this.activeTests.get(results.testId)?.variants.find(av => av.id === v.variantId)?.isControl
    );
    
    if (!controlVariant || controlVariant.participants < this.config.minSampleSize) {
      return {
        isSignificant: false,
        pValue: null,
        confidenceLevel: 0,
        recommendedAction: 'continue',
        progressPercentage: Math.min(100, (controlVariant?.participants || 0) / this.config.minSampleSize * 100),
        daysRemaining: this.calculateDaysRemaining(results.startDate)
      };
    }

    const analysis = {
      isSignificant: false,
      pValue: null,
      confidenceLevel: 0,
      recommendedAction: 'continue',
      progressPercentage: 100,
      daysRemaining: this.calculateDaysRemaining(results.startDate)
    };

    // Calculate statistical significance for each variant vs control
    results.variants.forEach(variant => {
      if (variant.variantId === controlVariant.variantId) return;

      const stats = this.calculateTwoSampleTTest(
        controlVariant.conversions,
        controlVariant.participants,
        variant.conversions,
        variant.participants
      );

      variant.statisticalSignificance = stats.pValue < this.config.significanceLevel;
      variant.pValue = stats.pValue;
      variant.confidenceLevel = (1 - stats.pValue) * 100;
      variant.liftOverControl = stats.lift;

      // Update overall analysis
      if (stats.pValue < this.config.significanceLevel) {
        analysis.isSignificant = true;
        analysis.pValue = Math.min(analysis.pValue || 1, stats.pValue);
        analysis.confidenceLevel = Math.max(analysis.confidenceLevel, (1 - stats.pValue) * 100);
      }
    });

    // Determine recommendation
    if (analysis.isSignificant && analysis.daysRemaining <= 0) {
      analysis.recommendedAction = 'conclude';
    } else if (analysis.daysRemaining <= -7) { // Test has been running too long
      analysis.recommendedAction = 'conclude';
    } else if (analysis.progressPercentage < 100) {
      analysis.recommendedAction = 'continue';
    }

    return analysis;
  }

  /**
   * Calculate two-sample t-test for conversion rates
   */
  calculateTwoSampleTTest(controlConversions, controlParticipants, variantConversions, variantParticipants) {
    if (controlParticipants === 0 || variantParticipants === 0) {
      return { pValue: 1, lift: 0, tStatistic: 0 };
    }

    const controlRate = controlConversions / controlParticipants;
    const variantRate = variantConversions / variantParticipants;
    
    const pooledRate = (controlConversions + variantConversions) / (controlParticipants + variantParticipants);
    const pooledVariance = pooledRate * (1 - pooledRate) * (1/controlParticipants + 1/variantParticipants);
    
    if (pooledVariance === 0) {
      return { pValue: 1, lift: 0, tStatistic: 0 };
    }

    const tStatistic = (variantRate - controlRate) / Math.sqrt(pooledVariance);
    
    // Simplified p-value calculation
    const pValue = this.calculatePValue(Math.abs(tStatistic));
    const lift = controlRate > 0 ? ((variantRate - controlRate) / controlRate * 100) : 0;

    return { pValue, lift, tStatistic };
  }

  /**
   * Simplified p-value calculation
   */
  calculatePValue(tStatistic) {
    if (tStatistic < 1) return 0.8;
    if (tStatistic < 1.5) return 0.15;
    if (tStatistic < 1.96) return 0.08;
    if (tStatistic < 2.58) return 0.02;
    return 0.01;
  }

  /**
   * Initialize metrics structure
   */
  initializeMetrics() {
    const metrics = {};
    Object.keys(this.config.metrics).forEach(key => {
      metrics[key] = {
        total: 0,
        count: 0,
        average: 0
      };
    });
    return metrics;
  }

  /**
   * Update metrics based on event
   */
  updateMetrics(metrics, eventType, eventData) {
    Object.keys(eventData).forEach(key => {
      if (metrics[key] && typeof eventData[key] === 'number') {
        const metric = metrics[key];
        metric.total += eventData[key];
        metric.count++;
        metric.average = metric.total / metric.count;
      }
    });
  }

  /**
   * Format metrics for display
   */
  formatMetrics(metrics) {
    const formatted = {};
    Object.entries(metrics).forEach(([key, metric]) => {
      const config = this.config.metrics[key];
      if (config && metric.count > 0) {
        let value = metric.average;
        
        if (config.type === 'percentage') {
          value = (value * 100).toFixed(2);
        } else if (config.type === 'currency') {
          value = value.toFixed(2);
        } else if (config.type === 'duration') {
          value = Math.round(value);
        } else {
          value = Math.round(value);
        }
        
        formatted[key] = {
          ...metric,
          displayValue: `${value}${config.unit}`,
          name: config.name
        };
      }
    });
    return formatted;
  }

  /**
   * Calculate power analysis for test planning
   */
  calculatePowerAnalysis(testConfig) {
    const sampleSizePerVariant = Math.max(this.config.minSampleSize, 500);
    const totalSampleSize = sampleSizePerVariant * testConfig.variants.length;
    
    return {
      sampleSizePerVariant,
      totalSampleSize,
      expectedDuration: Math.ceil(sampleSizePerVariant / 100),
      power: 0.8,
      significance: this.config.significanceLevel,
      minimumDetectableEffect: testConfig.expectedEffect || 5
    };
  }

  /**
   * Calculate days remaining for test
   */
  calculateDaysRemaining(startDate) {
    const start = new Date(startDate);
    const maxEnd = new Date(start.getTime() + this.config.maxTestDuration);
    const now = new Date();
    
    const daysRemaining = Math.ceil((maxEnd - now) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysRemaining);
  }

  /**
   * Generate mock test data for demonstration
   */
  generateMockTestData() {
    this.activeTests.forEach((test, testId) => {
      if (test.status !== 'running') return;

      const results = this.testResults.get(testId);
      if (!results) return;

      // Simulate new participants and conversions
      results.variants.forEach(variant => {
        // Add 1-5 new participants
        const newParticipants = Math.floor(Math.random() * 5) + 1;
        variant.participants += newParticipants;
        results.totalParticipants += newParticipants;

        // Add conversions based on variant performance
        const baseConversionRate = variant.variantId.includes('0') ? 0.05 : 0.06; // Control vs variant
        const newConversions = Math.floor(newParticipants * baseConversionRate * (0.8 + Math.random() * 0.4));
        variant.conversions += newConversions;

        // Add sample metric data
        const sampleMetrics = {
          revenue_per_visitor: Math.random() * 50 + 25,
          average_order_value: Math.random() * 30 + 40,
          time_on_page: Math.random() * 120 + 60,
          page_views: Math.floor(Math.random() * 5) + 1
        };

        this.updateMetrics(variant.metrics, 'sample', sampleMetrics);
      });

      // Update analysis
      results.statisticalAnalysis = this.calculateStatisticalAnalysis(results);
      results.lastUpdate = new Date().toISOString();

      // Notify subscribers
      this.notifySubscribers('test_updated', { test, results });
    });
  }

  /**
   * Generate mock tests for demonstration
   */
  generateMockTests() {
    // Create sample tests
    const testConfigs = [
      {
        name: 'Product Page CTA Button Test',
        description: 'Testing different button colors and text for product page CTA',
        hypothesis: 'Green "Buy Now" button will increase conversions by 10%',
        primaryMetric: 'conversion_rate',
        secondaryMetrics: ['revenue_per_visitor', 'average_order_value'],
        variants: [
          { name: 'Control (Blue Button)', description: 'Original blue "Add to Cart" button', isControl: true },
          { name: 'Green "Buy Now"', description: 'Green button with "Buy Now" text' }
        ],
        category: 'ui_optimization',
        expectedEffect: 10,
        baselineConversionRate: 0.05
      },
      {
        name: 'Homepage Hero Section',
        description: 'Testing different hero section layouts and messaging',
        hypothesis: 'Benefit-focused messaging will improve engagement',
        primaryMetric: 'click_through_rate',
        secondaryMetrics: ['bounce_rate', 'time_on_page'],
        variants: [
          { name: 'Control (Product Features)', description: 'Original feature-focused hero', isControl: true },
          { name: 'Benefit-focused', description: 'Benefits and outcomes focused messaging' }
        ],
        category: 'content_optimization',
        expectedEffect: 15,
        baselineConversionRate: 0.12
      }
    ];

    testConfigs.forEach(config => {
      const test = this.createTest(config);
      this.startTest(test.id);
    });
  }

  /**
   * Subscribe to test updates
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify subscribers
   */
  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback({ event, data, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('A/B testing subscriber error:', error);
      }
    });
  }

  /**
   * Get service statistics
   */
  getStatistics() {
    return {
      activeTests: this.activeTests.size,
      completedTests: this.testHistory.length,
      totalParticipants: Array.from(this.testResults.values())
        .reduce((sum, result) => sum + result.totalParticipants, 0),
      significantTests: this.testHistory
        .filter(test => test.results?.statisticalAnalysis?.isSignificant).length
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
    }
    
    this.activeTests.clear();
    this.testResults.clear();
    this.subscribers.clear();
    this.updateQueue = [];
  }
}

// Create and export singleton instance
const abTestingService = new ABTestingService();
export default abTestingService;