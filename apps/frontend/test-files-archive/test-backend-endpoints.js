#!/usr/bin/env node

/**
 * OMNIX AI Backend Endpoint Verification Script
 * 
 * This script tests all required backend endpoints to verify they are
 * properly implemented according to the BACKEND_REQUIREMENTS.md specification.
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL || 'https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1',
  API_KEY: process.env.VITE_API_KEY || 'test-api-key',
  TIMEOUT: 10000,
  TEST_USER: {
    email: 'test@omnix-ai.com',
    password: 'TestPassword123!'
  }
};

// Test results storage
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: []
};

let authToken = null;

// Utility functions
function makeRequest(method, endpoint, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-Key': CONFIG.API_KEY,
      ...headers
    };

    if (authToken) {
      defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: defaultHeaders,
      timeout: CONFIG.TIMEOUT
    };

    const req = lib.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PATCH' || method.toUpperCase() === 'PUT')) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function logResult(priority, method, endpoint, status, message, details = null) {
  const result = {
    priority,
    method,
    endpoint,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.results.push(result);
  testResults.total++;
  
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const priorityColor = priority === 'P0' ? '\x1b[31m' : priority === 'P1' ? '\x1b[33m' : '\x1b[32m';
  
  console.log(`${statusIcon} [${priorityColor}${priority}\x1b[0m] ${method} ${endpoint} - ${message}`);
  
  if (details && status === 'FAIL') {
    console.log(`   Details: ${details}`);
  }
  
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.skipped++;
}

async function testEndpoint(priority, method, endpoint, expectedStatus = 200, testData = null, description = '') {
  try {
    const response = await makeRequest(method, endpoint, testData);
    
    if (response.status === expectedStatus) {
      // Additional validation for specific endpoints
      if (endpoint.includes('/dashboard/summary') && response.data) {
        if (!response.data.data || typeof response.data.data.totalInventoryValue === 'undefined') {
          logResult(priority, method, endpoint, 'FAIL', 
            'Invalid response structure - missing required dashboard data fields');
          return false;
        }
      }
      
      if (endpoint.includes('/products') && method === 'GET' && response.data) {
        if (!response.data.data || !Array.isArray(response.data.data)) {
          logResult(priority, method, endpoint, 'FAIL', 
            'Invalid response structure - expected data array');
          return false;
        }
      }
      
      logResult(priority, method, endpoint, 'PASS', `${description} - Status: ${response.status}`);
      return true;
    } else {
      logResult(priority, method, endpoint, 'FAIL', 
        `Expected status ${expectedStatus}, got ${response.status}`, 
        response.data?.message || JSON.stringify(response.data));
      return false;
    }
  } catch (error) {
    logResult(priority, method, endpoint, 'FAIL', `Request failed: ${error.message}`);
    return false;
  }
}

// Test Authentication
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Endpoints...\n');
  
  // Test login
  const loginSuccess = await testEndpoint('P0', 'POST', '/auth/login', 200, CONFIG.TEST_USER, 'User login');
  
  if (loginSuccess) {
    try {
      const loginResponse = await makeRequest('POST', '/auth/login', CONFIG.TEST_USER);
      if (loginResponse.data?.data?.token) {
        authToken = loginResponse.data.data.token;
        console.log('   🔑 Auth token obtained for subsequent tests');
      }
    } catch (error) {
      console.log('   ⚠️ Could not extract auth token');
    }
  }
  
  // Test other auth endpoints
  await testEndpoint('P0', 'POST', '/auth/logout', 200, null, 'User logout');
  await testEndpoint('P0', 'POST', '/auth/refresh', 200, { refreshToken: 'dummy-token' }, 'Token refresh');
}

// Test User Management
async function testUserManagement() {
  console.log('\n👤 Testing User Management Endpoints...\n');
  
  await testEndpoint('P0', 'GET', '/user/profile', 200, null, 'Get user profile');
  await testEndpoint('P0', 'PATCH', '/user/profile', 200, { name: 'Test User' }, 'Update user profile');
}

// Test Dashboard
async function testDashboard() {
  console.log('\n📊 Testing Dashboard Endpoints...\n');
  
  await testEndpoint('P0', 'GET', '/dashboard/summary', 200, null, 'Dashboard summary');
  await testEndpoint('P0', 'GET', '/dashboard/summary?timeRange=month', 200, null, 'Dashboard summary with time range');
  await testEndpoint('P0', 'GET', '/dashboard/inventory-graph', 200, null, 'Inventory graph data');
  await testEndpoint('P0', 'GET', '/dashboard/inventory-graph?timeRange=week', 200, null, 'Inventory graph with time range');
}

// Test Products
async function testProducts() {
  console.log('\n📦 Testing Products Endpoints...\n');
  
  await testEndpoint('P0', 'GET', '/products', 200, null, 'List products');
  await testEndpoint('P0', 'GET', '/products?page=1&limit=10', 200, null, 'List products with pagination');
  await testEndpoint('P0', 'GET', '/products?search=coffee', 200, null, 'Search products');
  await testEndpoint('P0', 'GET', '/products?category=Beverages', 200, null, 'Filter products by category');
  
  // Test product CRUD (will need a real product ID for GET/PATCH/DELETE)
  const createProduct = {
    name: 'Test Product',
    sku: 'TEST-001',
    category: 'Test Category',
    quantity: 100,
    minThreshold: 10,
    price: 29.99,
    supplier: 'Test Supplier'
  };
  
  await testEndpoint('P0', 'POST', '/products', 201, createProduct, 'Create product');
  
  // For GET/PATCH/DELETE individual product, we'd need the created product ID
  // These will likely return 404 with dummy ID, but we test the endpoint exists
  await testEndpoint('P0', 'GET', '/products/test-id', 404, null, 'Get product by ID (expected 404)');
}

// Test Alerts
async function testAlerts() {
  console.log('\n🚨 Testing Alerts Endpoints...\n');
  
  await testEndpoint('P0', 'GET', '/alerts', 200, null, 'List alerts');
  await testEndpoint('P0', 'GET', '/alerts?type=low-stock', 200, null, 'Filter alerts by type');
  await testEndpoint('P0', 'GET', '/alerts?severity=high', 200, null, 'Filter alerts by severity');
  
  // Test dismiss alert (will likely return 404 with dummy ID)
  await testEndpoint('P0', 'POST', '/alerts/test-id/dismiss', 404, null, 'Dismiss alert (expected 404)');
}

// Test AI Features
async function testAIFeatures() {
  console.log('\n🤖 Testing AI Features Endpoints...\n');
  
  await testEndpoint('P0', 'GET', '/recommendations/orders', 200, null, 'Order recommendations');
  await testEndpoint('P0', 'GET', '/recommendations/orders?urgency=high', 200, null, 'Filter recommendations by urgency');
  
  await testEndpoint('P0', 'GET', '/forecasts/demand', 200, null, 'Demand forecasts');
  await testEndpoint('P0', 'GET', '/forecasts/demand?timeHorizon=month', 200, null, 'Demand forecasts with time horizon');
  
  await testEndpoint('P0', 'GET', '/forecasts/trends', 200, null, 'Trend analysis');
  await testEndpoint('P0', 'GET', '/forecasts/trends?timeRange=year', 200, null, 'Trend analysis with time range');
}

// Test Inventory Management (P1)
async function testInventory() {
  console.log('\n📋 Testing Inventory Management Endpoints (P1)...\n');
  
  await testEndpoint('P1', 'GET', '/inventory', 200, null, 'Inventory overview');
  await testEndpoint('P1', 'GET', '/inventory/test-id', 404, null, 'Get product inventory (expected 404)');
  
  const stockAdjustment = {
    quantity: -5,
    reason: 'sale',
    notes: 'Test adjustment'
  };
  await testEndpoint('P1', 'POST', '/inventory/test-id/adjust', 404, stockAdjustment, 'Adjust stock (expected 404)');
  
  await testEndpoint('P1', 'GET', '/inventory/test-id/history', 404, null, 'Get inventory history (expected 404)');
}

// Test Orders (P2)
async function testOrders() {
  console.log('\n🛒 Testing Orders Endpoints (P2)...\n');
  
  await testEndpoint('P2', 'GET', '/orders', 200, null, 'List orders');
  await testEndpoint('P2', 'GET', '/orders?status=pending', 200, null, 'Filter orders by status');
  
  const createOrder = {
    supplierId: 'test-supplier',
    items: [
      {
        productId: 'test-product',
        quantity: 10,
        unitPrice: 25.99
      }
    ]
  };
  await testEndpoint('P2', 'POST', '/orders', 201, createOrder, 'Create order');
  
  await testEndpoint('P2', 'GET', '/orders/test-id', 404, null, 'Get order by ID (expected 404)');
  await testEndpoint('P2', 'PATCH', '/orders/test-id', 404, { status: 'confirmed' }, 'Update order (expected 404)');
}

// Test System Health (P2)
async function testSystemHealth() {
  console.log('\n🏥 Testing System Health Endpoints (P2)...\n');
  
  await testEndpoint('P2', 'GET', '/system/health', 200, null, 'System health check');
  await testEndpoint('P2', 'GET', '/system/status', 200, null, 'System status');
}

// Generate summary report
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 BACKEND VERIFICATION SUMMARY REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n📊 Overall Results:`);
  console.log(`   Total Tests: ${testResults.total}`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   ⚠️ Skipped: ${testResults.skipped}`);
  console.log(`   Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // Group results by priority
  const byPriority = testResults.results.reduce((acc, result) => {
    if (!acc[result.priority]) acc[result.priority] = { total: 0, passed: 0, failed: 0 };
    acc[result.priority].total++;
    if (result.status === 'PASS') acc[result.priority].passed++;
    else if (result.status === 'FAIL') acc[result.priority].failed++;
    return acc;
  }, {});
  
  console.log(`\n🎯 Results by Priority:`);
  Object.entries(byPriority).forEach(([priority, stats]) => {
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    const status = stats.passed === stats.total ? '✅' : stats.passed > stats.total * 0.5 ? '⚠️' : '❌';
    console.log(`   ${status} ${priority}: ${stats.passed}/${stats.total} (${rate}%)`);
  });
  
  // List failed endpoints
  const failures = testResults.results.filter(r => r.status === 'FAIL');
  if (failures.length > 0) {
    console.log(`\n❌ Failed Endpoints:`);
    failures.forEach(failure => {
      console.log(`   • [${failure.priority}] ${failure.method} ${failure.endpoint}`);
      console.log(`     Reason: ${failure.message}`);
    });
  }
  
  // Critical endpoint status
  const criticalEndpoints = testResults.results.filter(r => r.priority === 'P0');
  const criticalPassed = criticalEndpoints.filter(r => r.status === 'PASS').length;
  const criticalTotal = criticalEndpoints.length;
  
  console.log(`\n🔴 Critical Endpoints Status: ${criticalPassed}/${criticalTotal}`);
  if (criticalPassed === criticalTotal) {
    console.log('   ✅ All critical endpoints are working! Frontend should be fully functional.');
  } else {
    console.log('   ❌ Some critical endpoints are missing. Frontend may have limited functionality.');
  }
  
  console.log('\n' + '='.repeat(80));
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting OMNIX AI Backend Verification');
  console.log(`📡 Testing against: ${CONFIG.BASE_URL}`);
  console.log(`🔑 Using API Key: ${CONFIG.API_KEY ? 'Configured' : 'Missing'}`);
  console.log('=' .repeat(80));
  
  try {
    // Run all test suites
    await testAuthentication();
    await testUserManagement();
    await testDashboard();
    await testProducts();
    await testAlerts();
    await testAIFeatures();
    await testInventory();
    await testOrders();
    await testSystemHealth();
    
    // Generate final report
    generateReport();
    
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testResults };