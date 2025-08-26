#!/usr/bin/env node

console.log('🔍 Checking AWS API Gateway Setup...\n');

const BASE_URL = 'https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev';

async function checkEndpoints() {
  const tests = [
    { name: 'Root', url: `${BASE_URL}/` },
    { name: 'V1 Root', url: `${BASE_URL}/v1/` },
    { name: 'Dashboard', url: `${BASE_URL}/v1/dashboard/summary` },
    { name: 'Products', url: `${BASE_URL}/v1/products` },
    { name: 'Health', url: `${BASE_URL}/v1/system/health` },
    { name: 'Alerts', url: `${BASE_URL}/v1/alerts` }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 Testing ${test.name}: ${test.url}`);
      const response = await fetch(test.url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        const data = await response.text();
        console.log(`   ✅ SUCCESS! Data: ${data.substring(0, 100)}...`);
      } else if (response.status === 403) {
        console.log(`   🔑 Authentication required`);
      } else if (response.status === 404) {
        console.log(`   ❌ Endpoint not configured`);
      } else {
        const text = await response.text();
        console.log(`   📝 Response: ${text}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

checkEndpoints();