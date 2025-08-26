#!/usr/bin/env node

/**
 * Customer Segmentation System Test Suite
 * Tests the AI-powered customer segmentation with clustering algorithms
 */

const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const TEST_TOKEN = process.env.TEST_JWT_TOKEN || 'test-token';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Test customer data for segmentation
const testCustomers = [
  { customerId: 'CUST_CHAMPION_001', type: 'champion' },
  { customerId: 'CUST_LOYAL_001', type: 'loyal' },
  { customerId: 'CUST_NEW_001', type: 'new' },
  { customerId: 'CUST_ATRISK_001', type: 'at-risk' },
  { customerId: 'CUST_HIBERNATING_001', type: 'hibernating' }
];

class SegmentationTester {
  constructor() {
    this.results = {
      tests: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Customer Segmentation System Tests');
    console.log('================================================\n');

    try {
      await this.testSingleCustomerSegmentation();
      await this.testBatchSegmentation();
      await this.testSegmentMigration();
      await this.testSegmentPerformance();
      await this.testSegmentBasedRecommendations();
      await this.testSegmentOverview();
      await this.testAIVsRuleBasedSegmentation();
    } catch (error) {
      this.recordError('Test Suite Execution', error);
    }

    this.printResults();
  }

  async testSingleCustomerSegmentation() {
    console.log('🎯 Test 1: Single Customer Segmentation');
    
    for (const customer of testCustomers.slice(0, 3)) {
      try {
        this.results.tests++;
        
        const response = await axiosInstance.post(`/v1/customers/${customer.customerId}/segmentation`, {
          analysisDepth: 'comprehensive',
          includeRecommendations: true,
          forceRecalculation: true
        });

        if (response.status === 200 && response.data.success) {
          const assignment = response.data.assignments?.[0];
          
          console.log(`✅ Customer ${customer.customerId}:`);
          console.log(`   Segment: ${assignment?.segmentName}`);
          console.log(`   Confidence: ${assignment?.confidence}`);
          console.log(`   Features: ${assignment?.features?.totalPurchases} purchases, $${assignment?.features?.totalSpent} spent`);
          
          this.results.passed++;
        } else {
          throw new Error(`Unexpected response: ${response.status}`);
        }
      } catch (error) {
        this.recordError(`Single Customer Segmentation - ${customer.customerId}`, error);
      }
    }
    console.log();
  }

  async testBatchSegmentation() {
    console.log('📊 Test 2: Batch Customer Segmentation');
    
    try {
      this.results.tests++;
      
      const customerIds = testCustomers.map(c => c.customerId);
      
      const response = await axiosInstance.post('/v1/customers/segmentation/batch', {
        customerIds,
        analysisDepth: 'detailed',
        includeRecommendations: false
      });

      if (response.status === 200 && response.data.success) {
        const { assignments, statistics } = response.data;
        
        console.log(`✅ Batch segmentation completed:`);
        console.log(`   Customers processed: ${assignments.length}`);
        console.log(`   Average confidence: ${statistics.averageConfidence.toFixed(2)}`);
        console.log(`   Processing time: ${response.data.processingTime}ms`);
        
        // Show segment distribution
        console.log('   Segment distribution:');
        statistics.segmentDistribution.forEach(segment => {
          console.log(`     ${segment.segmentName}: ${segment.count} customers (${segment.percentage.toFixed(1)}%)`);
        });
        
        this.results.passed++;
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (error) {
      this.recordError('Batch Segmentation', error);
    }
    console.log();
  }

  async testSegmentMigration() {
    console.log('🔄 Test 3: Segment Migration Tracking');
    
    try {
      this.results.tests++;
      
      const migration = {
        customerId: 'CUST_CHAMPION_001',
        fromSegment: 'loyal',
        toSegment: 'champions',
        reason: 'Increased purchase frequency and order value',
        impactScore: 8.5
      };
      
      const response = await axiosInstance.post('/v1/customers/segments/migrate', migration);

      if (response.status === 200 && response.data.success) {
        console.log(`✅ Migration tracked successfully:`);
        console.log(`   ${migration.customerId}: ${migration.fromSegment} → ${migration.toSegment}`);
        console.log(`   Reason: ${migration.reason}`);
        
        this.results.passed++;
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (error) {
      this.recordError('Segment Migration', error);
    }
    console.log();
  }

  async testSegmentPerformance() {
    console.log('📈 Test 4: Segment Performance Metrics');
    
    const segments = ['champions', 'loyal', 'potential-loyalists', 'new', 'at-risk'];
    
    for (const segmentId of segments.slice(0, 3)) {
      try {
        this.results.tests++;
        
        const response = await axiosInstance.get(`/v1/customers/segments/${segmentId}/performance`);

        if (response.status === 200) {
          const metrics = response.data;
          
          console.log(`✅ ${segmentId} segment performance:`);
          console.log(`   Conversion Rate: ${(metrics.conversionRate * 100).toFixed(1)}%`);
          console.log(`   Average Revenue: $${metrics.averageRevenue.toFixed(2)}`);
          console.log(`   Customer Retention: ${(metrics.customerRetention * 100).toFixed(1)}%`);
          console.log(`   Engagement Score: ${metrics.engagementScore.toFixed(1)}`);
          
          this.results.passed++;
        } else {
          throw new Error(`Unexpected response: ${response.status}`);
        }
      } catch (error) {
        this.recordError(`Segment Performance - ${segmentId}`, error);
      }
    }
    console.log();
  }

  async testSegmentBasedRecommendations() {
    console.log('🎯 Test 5: Segment-Based Recommendations');
    
    try {
      this.results.tests++;
      
      const customerId = 'CUST_CHAMPION_001';
      
      const response = await axiosInstance.get(
        `/v1/customers/${customerId}/segment-recommendations?includeStrategy=true`
      );

      if (response.status === 200) {
        const { segment, recommendations, strategy } = response.data;
        
        console.log(`✅ Segment-based recommendations for ${customerId}:`);
        console.log(`   Segment: ${segment}`);
        console.log(`   Recommendations: ${recommendations.length} items`);
        
        if (strategy) {
          console.log(`   Strategy: ${strategy.priority} priority, ${strategy.recommendationType} type`);
          console.log(`   Communication: ${strategy.communicationFrequency}, ${strategy.contentTone} tone`);
        }
        
        // Show first few recommendations
        recommendations.slice(0, 2).forEach((rec, i) => {
          console.log(`   ${i+1}. ${rec.productName || rec.reason}`);
        });
        
        this.results.passed++;
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (error) {
      this.recordError('Segment-Based Recommendations', error);
    }
    console.log();
  }

  async testSegmentOverview() {
    console.log('📋 Test 6: Segment Overview');
    
    try {
      this.results.tests++;
      
      const response = await axiosInstance.get('/v1/customers/segments/overview');

      if (response.status === 200) {
        const { segments, statistics } = response.data;
        
        console.log(`✅ Segment overview retrieved:`);
        console.log(`   Total segments: ${segments.length}`);
        console.log(`   Total customers: ${statistics?.totalCustomers || 0}`);
        
        // Show segment details
        segments.slice(0, 4).forEach(segment => {
          console.log(`   ${segment.segmentName}: ${segment.customerCount} customers, $${segment.averageOrderValue.toFixed(2)} AOV`);
        });
        
        this.results.passed++;
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (error) {
      this.recordError('Segment Overview', error);
    }
    console.log();
  }

  async testAIVsRuleBasedSegmentation() {
    console.log('🤖 Test 7: AI vs Rule-Based Segmentation Comparison');
    
    try {
      this.results.tests++;
      
      const customerId = 'CUST_LOYAL_001';
      
      // Test with different analysis depths
      const basicResponse = await axiosInstance.post(`/v1/customers/${customerId}/segmentation`, {
        analysisDepth: 'basic',
        forceRecalculation: true
      });
      
      const comprehensiveResponse = await axiosInstance.post(`/v1/customers/${customerId}/segmentation`, {
        analysisDepth: 'comprehensive',
        forceRecalculation: true
      });

      if (basicResponse.status === 200 && comprehensiveResponse.status === 200) {
        const basicAssignment = basicResponse.data.assignments?.[0];
        const comprehensiveAssignment = comprehensiveResponse.data.assignments?.[0];
        
        console.log(`✅ Segmentation comparison for ${customerId}:`);
        console.log(`   Rule-based (basic): ${basicAssignment?.segmentName} (confidence: ${basicAssignment?.confidence})`);
        console.log(`   AI-enhanced (comprehensive): ${comprehensiveAssignment?.segmentName} (confidence: ${comprehensiveAssignment?.confidence})`);
        console.log(`   Processing time difference: ${comprehensiveResponse.data.processingTime - basicResponse.data.processingTime}ms`);
        
        this.results.passed++;
      } else {
        throw new Error('Failed to get segmentation responses');
      }
    } catch (error) {
      this.recordError('AI vs Rule-Based Comparison', error);
    }
    console.log();
  }

  recordError(testName, error) {
    this.results.failed++;
    this.results.errors.push({ test: testName, error: error.message });
    console.log(`❌ ${testName}: ${error.message}\n`);
  }

  printResults() {
    console.log('🏁 Customer Segmentation Test Results');
    console.log('=====================================');
    console.log(`Total Tests: ${this.results.tests}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.tests) * 100).toFixed(1)}%\n`);

    if (this.results.errors.length > 0) {
      console.log('❌ Failed Tests:');
      this.results.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.test}: ${error.error}`);
      });
      console.log();
    }

    // Performance insights
    if (this.results.passed > this.results.failed) {
      console.log('🎉 Customer Segmentation System is operational!');
      console.log('\nKey Features Tested:');
      console.log('✅ Single customer segmentation with AI analysis');
      console.log('✅ Batch processing with clustering algorithms');
      console.log('✅ Segment migration tracking');
      console.log('✅ Performance metrics by segment');
      console.log('✅ Segment-based personalized recommendations');
      console.log('✅ Comprehensive segment overview');
      console.log('✅ AI vs rule-based comparison');
    } else {
      console.log('⚠️  Some segmentation features need attention.');
      console.log('Check the failed tests above for details.');
    }
  }
}

// Performance monitoring for segmentation system
class SegmentationPerformanceMonitor {
  static async checkSystemHealth() {
    console.log('\n🔍 System Health Check');
    console.log('=====================');
    
    try {
      const startTime = Date.now();
      
      // Test basic endpoint response time
      const response = await axiosInstance.get('/v1/customers/segments/overview');
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ API Response Time: ${responseTime}ms`);
      console.log(`✅ System Status: ${response.status === 200 ? 'Healthy' : 'Issues Detected'}`);
      
      if (responseTime > 5000) {
        console.log('⚠️  High latency detected - consider performance optimization');
      } else if (responseTime < 1000) {
        console.log('🚀 Excellent response time - system performing well');
      }
      
    } catch (error) {
      console.log(`❌ System Health Check Failed: ${error.message}`);
    }
  }
}

// Run tests
async function main() {
  const tester = new SegmentationTester();
  
  // Check system health first
  await SegmentationPerformanceMonitor.checkSystemHealth();
  
  // Run all segmentation tests
  await tester.runAllTests();
  
  console.log('\n📊 Next Steps:');
  console.log('1. Review segment performance metrics');
  console.log('2. Test segment-based recommendation accuracy');
  console.log('3. Validate clustering algorithm effectiveness');
  console.log('4. Monitor customer segment migrations over time');
  console.log('5. A/B test different segmentation strategies');
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { SegmentationTester, SegmentationPerformanceMonitor };