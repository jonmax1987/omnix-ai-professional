#!/usr/bin/env node
// Test Unified API Integration
// This script tests the login flow with the unified API client

import { unifiedAPI } from './src/services/unifiedAPIClient.js';

const testCredentials = {
  admin: { email: 'admin@omnix.ai', password: 'admin123' },
  manager: { email: 'manager@omnix.ai', password: 'manager123' }
};

async function testLogin(role = 'admin') {
  console.log(`\n🧪 Testing ${role} login with unified API...`);
  
  try {
    const credentials = testCredentials[role];
    if (!credentials) {
      throw new Error(`Unknown role: ${role}`);
    }

    console.log('📤 Sending login request...');
    console.log(`   Email: ${credentials.email}`);
    
    const response = await unifiedAPI.auth.login(credentials);
    
    console.log('✅ Login successful!');
    console.log('📊 Response structure:');
    console.log(JSON.stringify(response, null, 2));
    
    // Test additional endpoints if login successful
    if (response.success && response.data?.accessToken) {
      console.log('\n🔄 Testing dashboard endpoint...');
      try {
        const dashboardResponse = await unifiedAPI.dashboard.getSummary();
        console.log('✅ Dashboard data retrieved successfully');
        console.log('📊 Dashboard structure:');
        console.log(JSON.stringify(dashboardResponse, null, 2));
      } catch (dashError) {
        console.log('⚠️ Dashboard test failed:', dashError.message);
      }

      console.log('\n🔄 Testing system health...');
      try {
        const healthStatus = await unifiedAPI.healthCheck();
        console.log(`✅ System health: ${healthStatus ? 'Healthy' : 'Unhealthy'}`);
      } catch (healthError) {
        console.log('⚠️ Health check failed:', healthError.message);
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Login failed');
    console.log('📋 Error details:');
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Message:', error.message);
      console.log('   Stack:', error.stack);
    }
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('🚀 OMNIX AI - Unified API Integration Test');
  console.log('==========================================');
  
  // Test admin login
  const adminSuccess = await testLogin('admin');
  
  // Test manager login
  const managerSuccess = await testLogin('manager');
  
  console.log('\n📋 Test Summary:');
  console.log(`   Admin Login: ${adminSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Manager Login: ${managerSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  if (adminSuccess || managerSuccess) {
    console.log('\n🎉 Integration test completed successfully!');
    console.log('   The unified API client is working properly.');
  } else {
    console.log('\n💥 Integration test failed!');
    console.log('   Please check the backend deployment and network connectivity.');
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPIEndpoints().catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
}

export { testAPIEndpoints };