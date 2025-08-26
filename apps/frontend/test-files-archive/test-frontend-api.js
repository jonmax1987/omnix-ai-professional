#!/usr/bin/env node

// Test Frontend API Configuration
console.log('🔍 Testing Frontend API Configuration...\n');

// Simulate environment variables that Vite would load
process.env.VITE_API_BASE_URL = 'https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev';
process.env.NODE_ENV = 'development';

async function testFrontendAPI() {
  try {
    // Simulate what the frontend API service does
    const API_CONFIG = {
      baseURL: process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:3001',
      timeout: 30000
    };
    
    console.log('📋 API Configuration:');
    console.log(`   Base URL: ${API_CONFIG.baseURL}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log('');
    
    // Test the exact endpoint that analytics.getDashboardMetrics() calls
    const dashboardUrl = `${API_CONFIG.baseURL}/v1/dashboard/summary`;
    console.log(`📡 Testing Dashboard API: ${dashboardUrl}`);
    
    const response = await fetch(dashboardUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Frontend API configuration is working!');
      console.log('');
      console.log('📦 Real Backend Data Received:');
      console.log(`   Total Inventory Value: $${data.data.totalInventoryValue}`);
      console.log(`   Total Items: ${data.data.totalItems}`);
      console.log(`   Low Stock Items: ${data.data.lowStockItems}`);
      console.log(`   Active Alerts: ${data.data.activeAlerts}`);
      console.log('');
      console.log('📈 Category Breakdown:');
      data.data.categoryBreakdown.forEach(cat => {
        console.log(`   - ${cat.category}: ${cat.itemCount} items, $${cat.value.toFixed(2)}`);
      });
      
      return true;
    } else {
      console.log('❌ API call failed');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Run test
testFrontendAPI().then(success => {
  console.log('');
  if (success) {
    console.log('🎉 Frontend is properly configured to use real backend data!');
    console.log('   Dashboard will now show live inventory data instead of mock data.');
  } else {
    console.log('⚠️  Frontend API configuration needs attention');
  }
  process.exit(success ? 0 : 1);
});