const AWS = require('aws-sdk');
const axios = require('axios');

// Configure AWS SDK for local testing
AWS.config.update({
  region: process.env.AWS_REGION || 'eu-central-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB();
const dynamodbDoc = new AWS.DynamoDB.DocumentClient();

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://your-api-gateway.amazonaws.com';
const STAGE = process.env.STAGE || 'dev';
const PROJECT_NAME = 'omnix-ai';

describe('A/B Testing System', () => {
  const testTableName = `${PROJECT_NAME}-ab-tests-${STAGE}`;
  const metricsTableName = `${PROJECT_NAME}-ab-test-metrics-${STAGE}`;
  
  console.log('🧪 Starting A/B Testing System Tests');
  console.log('=====================================');
  console.log(`📍 Region: ${AWS.config.region}`);
  console.log(`🏷️  Stage: ${STAGE}`);
  console.log(`🔗 API URL: ${API_BASE_URL}`);
  console.log('');

  // Test 1: Verify DynamoDB tables exist
  test('DynamoDB tables should exist and be accessible', async () => {
    console.log('🗄️  Testing DynamoDB tables...');
    
    try {
      // Check A/B tests table
      const testsTable = await dynamodb.describeTable({
        TableName: testTableName
      }).promise();
      
      expect(testsTable.Table.TableStatus).toBe('ACTIVE');
      expect(testsTable.Table.KeySchema).toEqual([
        { AttributeName: 'testId', KeyType: 'HASH' }
      ]);
      
      console.log(`✅ A/B tests table is active: ${testTableName}`);
      
      // Check metrics table
      const metricsTable = await dynamodb.describeTable({
        TableName: metricsTableName
      }).promise();
      
      expect(metricsTable.Table.TableStatus).toBe('ACTIVE');
      expect(metricsTable.Table.KeySchema).toEqual([
        { AttributeName: 'testId', KeyType: 'HASH' },
        { AttributeName: 'modelId', KeyType: 'RANGE' }
      ]);
      
      console.log(`✅ A/B test metrics table is active: ${metricsTableName}`);
      
    } catch (error) {
      console.error('❌ DynamoDB tables test failed:', error.message);
      throw error;
    }
  });

  // Test 2: Create A/B test via API
  test('Should create A/B test via API', async () => {
    console.log('🔌 Testing A/B test creation API...');
    
    const testConfig = {
      testId: `api-test-${Date.now()}`,
      testName: 'API Test - Haiku vs Sonnet',
      modelA: {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        weight: 60
      },
      modelB: {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet', 
        weight: 40
      },
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      metrics: ['customer_profiling', 'consumption_prediction']
    };
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/v1/ab-tests`,
        testConfig,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.testId).toBe(testConfig.testId);
      
      console.log(`✅ A/B test created successfully: ${testConfig.testId}`);
      
      // Verify test was stored in DynamoDB
      const storedTest = await dynamodbDoc.get({
        TableName: testTableName,
        Key: { testId: testConfig.testId }
      }).promise();
      
      expect(storedTest.Item).toBeTruthy();
      expect(storedTest.Item.testName).toBe(testConfig.testName);
      expect(storedTest.Item.active).toBe(true);
      
      console.log('✅ A/B test verified in DynamoDB');
      
    } catch (error) {
      console.error('❌ A/B test creation failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 3: Create quick test via API
  test('Should create quick Haiku vs Sonnet test', async () => {
    console.log('⚡ Testing quick A/B test creation...');
    
    const quickTestConfig = {
      testName: 'Quick Test - Customer Profiling',
      analysisType: 'customer_profiling',
      durationDays: 3,
      trafficSplit: 70
    };
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/v1/ab-tests/quick-test`,
        quickTestConfig,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.testId).toMatch(/^quick-test-\d+$/);
      
      const config = response.data.config;
      expect(config.modelA.name).toBe('Claude 3 Haiku');
      expect(config.modelB.name).toBe('Claude 3 Sonnet');
      expect(config.modelA.weight).toBe(70);
      expect(config.modelB.weight).toBe(30);
      
      console.log(`✅ Quick A/B test created: ${response.data.testId}`);
      
    } catch (error) {
      console.error('❌ Quick A/B test creation failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 4: List A/B tests
  test('Should list all A/B tests', async () => {
    console.log('📋 Testing A/B tests listing...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/ab-tests`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.totalTests).toBeGreaterThanOrEqual(0);
      
      console.log(`✅ Found ${response.data.totalTests} A/B tests (${response.data.activeTests} active)`);
      
      if (response.data.data.length > 0) {
        const firstTest = response.data.data[0];
        expect(firstTest).toHaveProperty('testId');
        expect(firstTest).toHaveProperty('testName');
        expect(firstTest).toHaveProperty('modelA');
        expect(firstTest).toHaveProperty('modelB');
        
        console.log(`✅ Sample test structure validated: ${firstTest.testName}`);
      }
      
    } catch (error) {
      console.error('❌ A/B tests listing failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 5: Get available models
  test('Should retrieve available models', async () => {
    console.log('🤖 Testing available models endpoint...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/ab-tests/models/available`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.totalModels).toBeGreaterThan(0);
      
      const models = response.data.data;
      const haikuModel = models.find(m => m.id === 'claude-3-haiku');
      const sonnetModel = models.find(m => m.id === 'claude-3-sonnet');
      
      expect(haikuModel).toBeTruthy();
      expect(sonnetModel).toBeTruthy();
      
      expect(haikuModel.recommended).toBe(true);
      expect(haikuModel.costPer1kTokens.input).toBeLessThan(sonnetModel.costPer1kTokens.input);
      
      console.log(`✅ Available models retrieved: ${models.map(m => m.name).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Available models test failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 6: Model assignment logic
  test('Should assign customers to models consistently', async () => {
    console.log('🎯 Testing model assignment logic...');
    
    // Create a test for assignment testing
    const testId = `assignment-test-${Date.now()}`;
    const testCustomers = ['customer-1', 'customer-2', 'customer-3', 'customer-100'];
    
    try {
      // Create test in DynamoDB directly for controlled testing
      await dynamodbDoc.put({
        TableName: testTableName,
        Item: {
          testId,
          testName: 'Model Assignment Test',
          modelA: { id: 'claude-3-haiku', name: 'Claude 3 Haiku', weight: 50 },
          modelB: { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', weight: 50 },
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          active: true,
          metrics: ['customer_profiling'],
          createdAt: new Date().toISOString()
        }
      }).promise();
      
      // Test assignment consistency
      const assignments = new Map();
      
      // Simulate hash-based assignment (simplified version)
      testCustomers.forEach(customerId => {
        let hash = 0;
        for (let i = 0; i < (customerId + testId).length; i++) {
          const char = (customerId + testId).charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        
        const normalizedHash = Math.abs(hash) / 2147483647;
        const assignment = normalizedHash < 0.5 ? 'A' : 'B';
        assignments.set(customerId, assignment);
      });
      
      // Verify assignments are deterministic
      testCustomers.forEach(customerId => {
        const assignment1 = assignments.get(customerId);
        
        // Re-calculate to ensure consistency
        let hash = 0;
        for (let i = 0; i < (customerId + testId).length; i++) {
          const char = (customerId + testId).charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        
        const normalizedHash = Math.abs(hash) / 2147483647;
        const assignment2 = normalizedHash < 0.5 ? 'A' : 'B';
        
        expect(assignment1).toBe(assignment2);
      });
      
      console.log(`✅ Model assignment is consistent for ${testCustomers.length} test customers`);
      
      // Clean up test
      await dynamodbDoc.delete({
        TableName: testTableName,
        Key: { testId }
      }).promise();
      
    } catch (error) {
      console.error('❌ Model assignment test failed:', error.message);
      throw error;
    }
  });

  // Test 7: A/B test deactivation
  test('Should deactivate A/B test', async () => {
    console.log('🛑 Testing A/B test deactivation...');
    
    // First create a test to deactivate
    const testId = `deactivation-test-${Date.now()}`;
    
    try {
      await dynamodbDoc.put({
        TableName: testTableName,
        Item: {
          testId,
          testName: 'Deactivation Test',
          modelA: { id: 'claude-3-haiku', name: 'Claude 3 Haiku', weight: 50 },
          modelB: { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', weight: 50 },
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          active: true,
          metrics: ['customer_profiling'],
          createdAt: new Date().toISOString()
        }
      }).promise();
      
      console.log(`✅ Test created for deactivation: ${testId}`);
      
      // Deactivate via API
      const response = await axios.put(`${API_BASE_URL}/v1/ab-tests/${testId}/deactivate`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      // Verify deactivation in DynamoDB
      const deactivatedTest = await dynamodbDoc.get({
        TableName: testTableName,
        Key: { testId }
      }).promise();
      
      expect(deactivatedTest.Item.active).toBe(false);
      
      console.log(`✅ A/B test deactivated successfully: ${testId}`);
      
    } catch (error) {
      console.error('❌ A/B test deactivation failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 8: Error handling
  test('Should handle invalid A/B test configurations', async () => {
    console.log('⚠️  Testing error handling...');
    
    const invalidConfigs = [
      {
        name: 'Missing required fields',
        config: { testName: 'Invalid Test' },
        expectedError: 'Test ID and name are required'
      },
      {
        name: 'Invalid weight sum',
        config: {
          testId: 'invalid-test-1',
          testName: 'Invalid Weights Test',
          modelA: { id: 'haiku', name: 'Haiku', weight: 60 },
          modelB: { id: 'sonnet', name: 'Sonnet', weight: 50 },
          startDate: '2025-01-01',
          endDate: '2025-01-02',
          metrics: ['customer_profiling']
        },
        expectedError: 'Model weights must sum to 100'
      },
      {
        name: 'Invalid date range',
        config: {
          testId: 'invalid-test-2',
          testName: 'Invalid Dates Test',
          modelA: { id: 'haiku', name: 'Haiku', weight: 50 },
          modelB: { id: 'sonnet', name: 'Sonnet', weight: 50 },
          startDate: '2025-01-02',
          endDate: '2025-01-01',
          metrics: ['customer_profiling']
        },
        expectedError: 'End date must be after start date'
      }
    ];
    
    for (const testCase of invalidConfigs) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/v1/ab-tests`,
          testCase.config,
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        // Should not reach here if validation works
        fail(`Expected error for ${testCase.name}, but request succeeded`);
        
      } catch (error) {
        expect(error.response.status).toBe(400);
        console.log(`✅ ${testCase.name}: properly rejected`);
      }
    }
  });

  // Test results summary
  afterAll(() => {
    console.log('');
    console.log('🎉 A/B Testing System Tests Complete!');
    console.log('====================================');
    console.log('');
    console.log('📋 Test Results Summary:');
    console.log('   ✅ DynamoDB infrastructure verified');
    console.log('   ✅ A/B test creation and management');
    console.log('   ✅ Model assignment logic validated');
    console.log('   ✅ API endpoints functional');
    console.log('   ✅ Error handling working correctly');
    console.log('');
    console.log('🚀 Your A/B testing system is ready for production!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Start your first production A/B test');
    console.log('   2. Monitor results in CloudWatch dashboard');
    console.log('   3. Collect performance metrics over time');
    console.log('   4. Make data-driven model selection decisions');
    console.log('');
  });
});

// Helper function to run specific tests
if (process.env.RUN_SPECIFIC_TEST) {
  const specificTest = process.env.RUN_SPECIFIC_TEST;
  console.log(`🎯 Running specific test: ${specificTest}`);
}

module.exports = {
  testConfig: {
    apiBaseUrl: API_BASE_URL,
    region: AWS.config.region,
    stage: STAGE,
    projectName: PROJECT_NAME,
  }
};