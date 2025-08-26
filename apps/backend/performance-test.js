#!/usr/bin/env node

// OMNIX AI - Performance Testing for Customer Analytics
// Tests AI analysis performance with large datasets and concurrent users

const AWS = require('aws-sdk');
const axios = require('axios');
const crypto = require('crypto');

// Configuration
const TEST_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  REGION: 'eu-central-1',
  MAX_CONCURRENT_REQUESTS: 10,
  TOTAL_TEST_CUSTOMERS: 100,
  PURCHASES_PER_CUSTOMER: 50,
  TEST_DURATION_MINUTES: 5,
  WARM_UP_REQUESTS: 5,
};

// Performance metrics collector
class PerformanceMetrics {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalLatency: 0,
      minLatency: Infinity,
      maxLatency: 0,
      latencies: [],
      errorsByType: {},
      throughput: 0,
      concurrentUsers: 0,
      memoryUsage: [],
      cpuUsage: [],
    };
    this.startTime = Date.now();
  }

  recordRequest(latency, success, error = null) {
    this.metrics.totalRequests++;
    this.metrics.totalLatency += latency;
    this.metrics.latencies.push(latency);
    
    this.metrics.minLatency = Math.min(this.metrics.minLatency, latency);
    this.metrics.maxLatency = Math.max(this.metrics.maxLatency, latency);

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
      if (error) {
        this.metrics.errorsByType[error] = (this.metrics.errorsByType[error] || 0) + 1;
      }
    }
  }

  calculatePercentile(percentile) {
    const sorted = this.metrics.latencies.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  getReport() {
    const duration = (Date.now() - this.startTime) / 1000;
    const avgLatency = this.metrics.totalLatency / this.metrics.totalRequests;
    
    return {
      duration: `${duration.toFixed(2)}s`,
      totalRequests: this.metrics.totalRequests,
      successRate: `${((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2)}%`,
      throughput: `${(this.metrics.totalRequests / duration).toFixed(2)} req/s`,
      latency: {
        average: `${avgLatency.toFixed(2)}ms`,
        min: `${this.metrics.minLatency}ms`,
        max: `${this.metrics.maxLatency}ms`,
        p50: `${this.calculatePercentile(50)}ms`,
        p90: `${this.calculatePercentile(90)}ms`,
        p95: `${this.calculatePercentile(95)}ms`,
        p99: `${this.calculatePercentile(99)}ms`,
      },
      errors: this.metrics.errorsByType,
    };
  }
}

// Test data generator
class TestDataGenerator {
  constructor() {
    this.productCategories = [
      'Dairy', 'Meat', 'Vegetables', 'Fruits', 'Bakery', 'Beverages', 
      'Snacks', 'Frozen', 'Household', 'Personal Care'
    ];
    
    this.products = [
      { name: 'Milk', category: 'Dairy', avgPrice: 3.50 },
      { name: 'Bread', category: 'Bakery', avgPrice: 2.25 },
      { name: 'Chicken Breast', category: 'Meat', avgPrice: 8.99 },
      { name: 'Bananas', category: 'Fruits', avgPrice: 1.29 },
      { name: 'Yogurt', category: 'Dairy', avgPrice: 4.50 },
      { name: 'Orange Juice', category: 'Beverages', avgPrice: 3.99 },
      { name: 'Pasta', category: 'Pantry', avgPrice: 1.99 },
      { name: 'Ground Beef', category: 'Meat', avgPrice: 6.99 },
      { name: 'Apples', category: 'Fruits', avgPrice: 2.99 },
      { name: 'Eggs', category: 'Dairy', avgPrice: 2.49 },
    ];
  }

  generateCustomerId() {
    return `test-customer-${crypto.randomUUID()}`;
  }

  generatePurchaseHistory(customerId, count = 20) {
    const purchases = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const product = this.products[Math.floor(Math.random() * this.products.length)];
      const daysAgo = Math.floor(Math.random() * 180); // Last 6 months
      const purchaseDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      purchases.push({
        productId: `prod-${product.name.toLowerCase().replace(/\s+/g, '-')}`,
        productName: product.name,
        category: product.category,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: product.avgPrice + (Math.random() - 0.5) * 2, // ±$1 variation
        purchaseDate: purchaseDate.toISOString(),
      });
    }
    
    return purchases.sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
  }

  generateTestCustomers(count) {
    console.log(`🔄 Generating ${count} test customers with purchase history...`);
    const customers = [];
    
    for (let i = 0; i < count; i++) {
      const customerId = this.generateCustomerId();
      const purchases = this.generatePurchaseHistory(customerId, TEST_CONFIG.PURCHASES_PER_CUSTOMER);
      
      customers.push({
        customerId,
        purchases,
      });
      
      if (i % 20 === 0) {
        console.log(`   Generated ${i}/${count} customers...`);
      }
    }
    
    console.log(`✅ Generated ${count} test customers`);
    return customers;
  }
}

// API Client for testing
class APIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
    });
  }

  async analyzeCustomer(customerId, analysisType = 'consumption_prediction') {
    const startTime = Date.now();
    
    try {
      const response = await this.axios.post(`/v1/customers/${customerId}/analyze`, {
        analysisType,
        maxRecommendations: 5,
      });
      
      const latency = Date.now() - startTime;
      return { success: true, latency, data: response.data };
    } catch (error) {
      const latency = Date.now() - startTime;
      return { 
        success: false, 
        latency, 
        error: error.response?.status || error.code || 'Unknown error'
      };
    }
  }

  async getCostAnalytics(timeRange = 'day') {
    const startTime = Date.now();
    
    try {
      const response = await this.axios.get(`/v1/customers/cost-analytics/overview?timeRange=${timeRange}`);
      const latency = Date.now() - startTime;
      return { success: true, latency, data: response.data };
    } catch (error) {
      const latency = Date.now() - startTime;
      return { 
        success: false, 
        latency, 
        error: error.response?.status || error.code || 'Unknown error'
      };
    }
  }
}

// Load tester
class LoadTester {
  constructor(apiClient, metrics) {
    this.apiClient = apiClient;
    this.metrics = metrics;
    this.activeRequests = 0;
  }

  async runConcurrentTest(customers, maxConcurrent = 10, durationMinutes = 5) {
    console.log(`🚀 Starting concurrent load test:`);
    console.log(`   Max concurrent requests: ${maxConcurrent}`);
    console.log(`   Test duration: ${durationMinutes} minutes`);
    console.log(`   Total customers: ${customers.length}`);
    
    const endTime = Date.now() + durationMinutes * 60 * 1000;
    const promises = [];
    
    // Start concurrent workers
    for (let i = 0; i < maxConcurrent; i++) {
      promises.push(this.worker(customers, endTime));
    }
    
    // Monitor progress
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - this.metrics.startTime) / 1000;
      console.log(`   Progress: ${elapsed.toFixed(0)}s elapsed, ${this.activeRequests} active requests, ${this.metrics.metrics.totalRequests} total requests`);
    }, 10000);
    
    await Promise.all(promises);
    clearInterval(progressInterval);
    
    console.log(`✅ Concurrent test completed`);
  }

  async worker(customers, endTime) {
    while (Date.now() < endTime) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const analysisTypes = ['consumption_prediction', 'customer_profiling', 'recommendation_generation'];
      const analysisType = analysisTypes[Math.floor(Math.random() * analysisTypes.length)];
      
      this.activeRequests++;
      
      try {
        const result = await this.apiClient.analyzeCustomer(customer.customerId, analysisType);
        this.metrics.recordRequest(result.latency, result.success, result.error);
      } catch (error) {
        this.metrics.recordRequest(0, false, 'Exception');
      }
      
      this.activeRequests--;
      
      // Random delay between requests (0.1-2 seconds)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1900 + 100));
    }
  }

  async runScalabilityTest(customers) {
    console.log(`📈 Running scalability test...`);
    
    const concurrencyLevels = [1, 2, 5, 10, 20, 50];
    const results = [];
    
    for (const concurrency of concurrencyLevels) {
      console.log(`\n🔄 Testing with ${concurrency} concurrent users...`);
      
      const testMetrics = new PerformanceMetrics();
      const tester = new LoadTester(this.apiClient, testMetrics);
      
      // Run shorter tests for scalability (1 minute each)
      await tester.runConcurrentTest(customers.slice(0, 20), concurrency, 1);
      
      const report = testMetrics.getReport();
      results.push({
        concurrency,
        throughput: parseFloat(report.throughput.split(' ')[0]),
        avgLatency: parseFloat(report.latency.average.replace('ms', '')),
        p95Latency: parseFloat(report.latency.p95.replace('ms', '')),
        successRate: parseFloat(report.successRate.replace('%', '')),
      });
      
      console.log(`   Results: ${report.throughput}, ${report.latency.average} avg latency`);
    }
    
    return results;
  }
}

// Main performance test runner
async function runPerformanceTests() {
  console.log('🎯 OMNIX AI - Performance Testing Suite');
  console.log('======================================');
  console.log(`Base URL: ${TEST_CONFIG.BASE_URL}`);
  console.log(`Region: ${TEST_CONFIG.REGION}`);
  console.log('');

  const generator = new TestDataGenerator();
  const apiClient = new APIClient(TEST_CONFIG.BASE_URL);
  const metrics = new PerformanceMetrics();
  const tester = new LoadTester(apiClient, metrics);

  try {
    // 1. Generate test data
    const customers = generator.generateTestCustomers(TEST_CONFIG.TOTAL_TEST_CUSTOMERS);
    
    // 2. Warm-up requests
    console.log('🔥 Running warm-up requests...');
    for (let i = 0; i < TEST_CONFIG.WARM_UP_REQUESTS; i++) {
      const customer = customers[i];
      await apiClient.analyzeCustomer(customer.customerId);
    }
    console.log('✅ Warm-up completed');

    // 3. Run main load test
    console.log('\n🚀 Starting main load test...');
    await tester.runConcurrentTest(
      customers, 
      TEST_CONFIG.MAX_CONCURRENT_REQUESTS, 
      TEST_CONFIG.TEST_DURATION_MINUTES
    );

    // 4. Generate performance report
    console.log('\n📊 Performance Test Results');
    console.log('============================');
    const report = metrics.getReport();
    
    console.log(`Duration: ${report.duration}`);
    console.log(`Total Requests: ${report.totalRequests}`);
    console.log(`Success Rate: ${report.successRate}`);
    console.log(`Throughput: ${report.throughput}`);
    console.log('');
    console.log('Latency Statistics:');
    console.log(`  Average: ${report.latency.average}`);
    console.log(`  Min: ${report.latency.min}`);
    console.log(`  Max: ${report.latency.max}`);
    console.log(`  50th percentile: ${report.latency.p50}`);
    console.log(`  90th percentile: ${report.latency.p90}`);
    console.log(`  95th percentile: ${report.latency.p95}`);
    console.log(`  99th percentile: ${report.latency.p99}`);
    
    if (Object.keys(report.errors).length > 0) {
      console.log('');
      console.log('Errors:');
      Object.entries(report.errors).forEach(([error, count]) => {
        console.log(`  ${error}: ${count}`);
      });
    }

    // 5. Performance analysis and recommendations
    console.log('\n💡 Performance Analysis & Recommendations');
    console.log('==========================================');
    
    const avgLatency = parseFloat(report.latency.average.replace('ms', ''));
    const p95Latency = parseFloat(report.latency.p95.replace('ms', ''));
    const throughput = parseFloat(report.throughput.split(' ')[0]);
    const successRate = parseFloat(report.successRate.replace('%', ''));

    if (avgLatency > 5000) {
      console.log('⚠️  High average latency detected (>5s)');
      console.log('   Recommendations:');
      console.log('   • Implement response caching');
      console.log('   • Consider connection pooling');
      console.log('   • Review Bedrock model selection (Haiku vs Sonnet)');
    }

    if (p95Latency > 10000) {
      console.log('⚠️  High P95 latency detected (>10s)');
      console.log('   Recommendations:');
      console.log('   • Implement request timeouts');
      console.log('   • Add circuit breaker pattern');
      console.log('   • Consider async processing for complex analyses');
    }

    if (throughput < 1) {
      console.log('⚠️  Low throughput detected (<1 req/s)');
      console.log('   Recommendations:');
      console.log('   • Increase Lambda concurrent execution limit');
      console.log('   • Optimize database queries');
      console.log('   • Consider read replicas for DynamoDB');
    }

    if (successRate < 95) {
      console.log('⚠️  Low success rate detected (<95%)');
      console.log('   Recommendations:');
      console.log('   • Improve error handling and retries');
      console.log('   • Check AWS service limits');
      console.log('   • Monitor fallback mechanism usage');
    }

    if (avgLatency < 2000 && successRate > 99 && throughput > 5) {
      console.log('✅ Excellent performance! System is well-optimized.');
    }

    // 6. Test cost analytics endpoint
    console.log('\n💰 Testing Cost Analytics Performance...');
    const costResult = await apiClient.getCostAnalytics('day');
    if (costResult.success) {
      console.log(`✅ Cost analytics endpoint: ${costResult.latency}ms`);
    } else {
      console.log(`❌ Cost analytics endpoint failed: ${costResult.error}`);
    }

  } catch (error) {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  }

  console.log('\n🎉 Performance testing completed!');
}

// Run if called directly
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { runPerformanceTests, TestDataGenerator, PerformanceMetrics, LoadTester };