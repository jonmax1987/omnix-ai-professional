#!/usr/bin/env node

// Test Backend Connection Script
console.log('🔍 Testing OMNIX AI Backend Connection...\n');

const API_URL = 'https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev';

async function testBackend() {
  try {
    console.log(`📡 Attempting to connect to: ${API_URL}/v1/dashboard/summary`);
    
    const response = await fetch(`${API_URL}/v1/dashboard/summary`);
    const status = response.status;
    
    console.log(`📊 Response Status: ${status}`);
    
    if (status === 200) {
      const data = await response.json();
      console.log('✅ SUCCESS! Backend is working!');
      console.log('📦 Response data:', JSON.stringify(data, null, 2));
      return true;
    } else if (status === 401 || status === 403) {
      console.log('⚠️  Backend responding but needs authentication');
      console.log('   Add API key to environment variables');
      return false;
    } else if (status === 404) {
      console.log('❌ Lambda integration not complete');
      console.log('   Backend team needs to complete AWS setup');
      return false;
    } else {
      const text = await response.text();
      console.log(`❌ Unexpected response: ${text}`);
      return false;
    }
  } catch (error) {
    if (error.message.includes('fetch')) {
      console.log('❌ Network error - API Gateway may not be configured');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('\n💡 Lambda-API Gateway integration needs to be completed');
    console.log('   Follow steps in FRONTEND_BACKEND_INTEGRATION_GUIDE.md');
    return false;
  }
}

// Run test
testBackend().then(success => {
  if (success) {
    console.log('\n🎉 Backend integration is complete!');
    console.log('   Your frontend can now receive real data');
  } else {
    console.log('\n⏳ Backend setup incomplete');
    console.log('   Frontend will use mock data until backend is ready');
  }
  process.exit(success ? 0 : 1);
});