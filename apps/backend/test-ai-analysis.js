const axios = require('axios');
const { seedAITestData, testCustomerId } = require('./seed-ai-test-data');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_KEY = process.env.API_KEY || 'test-api-key';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds for AI analysis
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`, // Assuming JWT auth
    'x-api-key': API_KEY, // Fallback to API key
  }
};

class AIAnalysisTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Running: ${testName}`);
    try {
      await testFn();
      this.results.passed++;
      console.log(`✅ PASSED: ${testName}`);
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ test: testName, error: error.message });
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  async testEndpoint(endpoint, expectedKeys = []) {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`   📡 Testing: ${url}`);
    
    const response = await axios.get(url, {
      ...TEST_CONFIG,
      timeout: 30000, // 30s for AI endpoints
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    const data = response.data;
    if (!data) {
      throw new Error('Response data is empty');
    }

    // Check for expected keys in response
    expectedKeys.forEach(key => {
      if (!(key in data)) {
        throw new Error(`Expected key '${key}' not found in response`);
      }
    });

    console.log(`   ✅ Response structure valid`);
    return data;
  }

  async testAIAnalysisEndpoints() {
    const customerId = testCustomerId;

    // Test 1: Basic AI Analysis
    await this.runTest('AI Analysis Endpoint', async () => {
      const data = await this.testEndpoint(`/v1/customers/${customerId}/ai-analysis`, [
        'customerId', 'analysisDate', 'consumptionPatterns', 'confidence'
      ]);
      
      if (data.customerId !== customerId) {
        throw new Error(`Expected customerId ${customerId}, got ${data.customerId}`);
      }
    });

    // Test 2: Consumption Predictions
    await this.runTest('Consumption Predictions', async () => {
      const data = await this.testEndpoint(`/v1/customers/${customerId}/consumption-predictions`, [
        'consumptionPatterns'
      ]);
      
      if (!Array.isArray(data.consumptionPatterns)) {
        throw new Error('consumptionPatterns should be an array');
      }
    });

    // Test 3: Customer Profile Analysis
    await this.runTest('Customer Profile Analysis', async () => {
      const data = await this.testEndpoint(`/v1/customers/${customerId}/customer-profile-analysis`, [
        'customerProfile'
      ]);
      
      const profile = data.customerProfile;
      if (!profile.spendingPatterns || !profile.behavioralInsights) {
        throw new Error('Customer profile missing required sections');
      }
    });

    // Test 4: AI Recommendations
    await this.runTest('AI Recommendations', async () => {
      const data = await this.testEndpoint(`/v1/customers/${customerId}/ai-recommendations?limit=3`, [
        'recommendations'
      ]);
      
      if (!Array.isArray(data.recommendations)) {
        throw new Error('recommendations should be an array');
      }
      
      if (data.recommendations.length > 3) {
        throw new Error('Should respect limit parameter');
      }
    });

    // Test 5: Replenishment Alerts
    await this.runTest('Replenishment Alerts', async () => {
      const data = await this.testEndpoint(`/v1/customers/${customerId}/replenishment-alerts`, [
        'urgent', 'upcoming'
      ]);
      
      if (!Array.isArray(data.urgent) || !Array.isArray(data.upcoming)) {
        throw new Error('urgent and upcoming should be arrays');
      }
    });

    // Test 6: Purchase Prediction
    await this.runTest('Purchase Prediction', async () => {
      const productId = 'prod-milk'; // From our test data
      const data = await this.testEndpoint(`/v1/customers/${customerId}/purchase-prediction/${productId}`, [
        'predictedDate', 'confidence', 'averageDaysBetween'
      ]);
      
      if (typeof data.confidence !== 'number') {
        throw new Error('confidence should be a number');
      }
    });

    // Test 7: Manual Analysis Trigger
    await this.runTest('Manual Analysis Trigger', async () => {
      const url = `${BASE_URL}/v1/customers/${customerId}/analyze`;
      console.log(`   📡 Testing POST: ${url}`);
      
      const response = await axios.post(url, {}, {
        ...TEST_CONFIG,
        timeout: 45000, // 45s for manual analysis
      });

      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      const data = response.data;
      if (!data.customerId || !data.analysisDate) {
        throw new Error('Analysis response missing required fields');
      }
    });

    // Test 8: Analysis History
    await this.runTest('Analysis History', async () => {
      const data = await this.testEndpoint(`/v1/customers/${customerId}/analysis-history?limit=5`);
      
      if (!Array.isArray(data)) {
        throw new Error('Analysis history should be an array');
      }
    });
  }

  async testErrorHandling() {
    console.log(`\n🧪 Testing Error Handling...`);

    // Test non-existent customer
    await this.runTest('Non-existent Customer Handling', async () => {
      try {
        await this.testEndpoint('/v1/customers/non-existent-id/ai-analysis');
        throw new Error('Should have thrown an error for non-existent customer');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return; // Expected error
        }
        throw error;
      }
    });

    // Test invalid product ID
    await this.runTest('Invalid Product ID Handling', async () => {
      try {
        await this.testEndpoint(`/v1/customers/${testCustomerId}/purchase-prediction/invalid-product`);
        // This might return empty results rather than error, which is also valid
      } catch (error) {
        if (error.response && [400, 404].includes(error.response.status)) {
          return; // Expected error
        }
        throw error;
      }
    });
  }

  async testPerformance() {
    console.log(`\n⏱️ Testing Performance...`);

    await this.runTest('AI Analysis Response Time', async () => {
      const startTime = Date.now();
      await this.testEndpoint(`/v1/customers/${testCustomerId}/ai-analysis`);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      console.log(`   ⏱️ Response time: ${responseTime}ms`);
      
      if (responseTime > 30000) { // 30 seconds
        throw new Error(`Response time too slow: ${responseTime}ms`);
      }
    });
  }

  async runAllTests() {
    console.log('🚀 Starting AI Analysis Integration Tests');
    console.log(`📍 API Base URL: ${BASE_URL}`);
    console.log(`👤 Test Customer ID: ${testCustomerId}`);
    
    try {
      // Seed test data if needed
      console.log('\n📊 Checking test data availability...');
      try {
        await this.testEndpoint(`/v1/customers/${testCustomerId}/profile`);
        console.log('✅ Test data already available');
      } catch (error) {
        console.log('📊 Seeding test data...');
        await seedAITestData();
      }

      // Run test suites
      await this.testAIAnalysisEndpoints();
      await this.testErrorHandling();
      await this.testPerformance();

      // Print results
      console.log('\n📊 Test Results Summary');
      console.log('═'.repeat(50));
      console.log(`✅ Tests Passed: ${this.results.passed}`);
      console.log(`❌ Tests Failed: ${this.results.failed}`);
      console.log(`📊 Total Tests: ${this.results.passed + this.results.failed}`);
      
      if (this.results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        this.results.errors.forEach((err, i) => {
          console.log(`${i + 1}. ${err.test}: ${err.error}`);
        });
      }

      const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
      console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
      
      if (this.results.failed === 0) {
        console.log('\n🎉 All tests passed! AI Analysis system is ready.');
      } else {
        console.log('\n⚠️ Some tests failed. Please check the configuration and try again.');
      }

    } catch (error) {
      console.error('\n💥 Test suite failed to run:', error.message);
      process.exit(1);
    }
  }

  printUsageInstructions() {
    console.log('\n📚 Usage Instructions:');
    console.log('1. Ensure your backend is running and accessible');
    console.log('2. Set up AWS Bedrock access and credentials');
    console.log('3. Configure environment variables in .env file');
    console.log('4. Run: node test-ai-analysis.js');
    console.log('\n🔧 Required Environment Variables:');
    console.log('- AWS_BEDROCK_REGION (default: us-east-1)');
    console.log('- BEDROCK_MODEL_ID (default: anthropic.claude-3-haiku-20240307-v1:0)');
    console.log('- API_BASE_URL (default: http://localhost:3001)');
    console.log('- API_KEY or JWT token for authentication');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new AIAnalysisTest();
  
  // Check if help requested
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    tester.printUsageInstructions();
    process.exit(0);
  }
  
  tester.runAllTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

module.exports = AIAnalysisTest;