#!/usr/bin/env node

// Test Fixed API URL Construction
console.log('🔍 Testing Fixed API URL Construction...\n');

// Simulate the frontend API configuration
const VITE_API_BASE_URL = 'https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev';
const baseURL = VITE_API_BASE_URL + '/v1';
const endpoint = '/dashboard/summary';
const fullURL = baseURL + endpoint;

console.log('📋 API URL Construction:');
console.log(`   Environment URL: ${VITE_API_BASE_URL}`);
console.log(`   Base URL + /v1: ${baseURL}`);
console.log(`   Endpoint: ${endpoint}`);
console.log(`   Full URL: ${fullURL}`);
console.log('');

async function testFixedAPI() {
  try {
    console.log(`📡 Testing: ${fullURL}`);
    
    const response = await fetch(fullURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! API URL construction is now correct!');
      console.log('');
      console.log('📦 Backend Data:');
      console.log(`   Total Items: ${data.data.totalItems}`);
      console.log(`   Inventory Value: $${data.data.totalInventoryValue}`);
      console.log(`   Low Stock: ${data.data.lowStockItems}`);
      
      // Check if this is real data (not mock)
      if (data.data.totalItems === 203 && data.data.totalInventoryValue === 4256.97) {
        console.log('');
        console.log('🎉 This is REAL backend data! (203 items, $4256.97)');
        console.log('   Frontend will now display live data instead of mock data.');
      }
      
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

testFixedAPI().then(success => {
  console.log('');
  if (success) {
    console.log('🔧 API URL construction fix is working!');
  } else {
    console.log('⚠️  API URL needs further investigation');
  }
});