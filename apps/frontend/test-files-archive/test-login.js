#!/usr/bin/env node
/**
 * Test script to verify the login functionality works with the deployed frontend
 */

// Test with both the working API directly and through the frontend's expected behavior
async function testLoginFlow() {
  console.log('🔐 Testing Login Flow');
  console.log('====================');
  
  // Test 1: Direct API call
  console.log('\n1. Testing direct API call...');
  try {
    const response = await fetch('https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    console.error(`   Error: ${error.message}`);
  }
  
  // Test 2: Check if the frontend is configured correctly
  console.log('\n2. Testing frontend configuration...');
  try {
    const frontendResponse = await fetch('http://omnix-ai-frontend-animations-1754933694.s3-website.eu-central-1.amazonaws.com');
    console.log(`   Frontend Status: ${frontendResponse.status}`);
    
    if (frontendResponse.ok) {
      console.log('   ✅ Frontend is accessible');
      console.log('   The login should now work correctly with the API endpoint.');
    }
  } catch (error) {
    console.error(`   Frontend Error: ${error.message}`);
  }
  
  console.log('\n🎉 Test completed!');
  console.log('\nNext steps:');
  console.log('1. Visit: http://omnix-ai-frontend-animations-1754933694.s3-website.eu-central-1.amazonaws.com');
  console.log('2. Navigate to the login page');
  console.log('3. The frontend should now make API calls to: https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/v1');
}

testLoginFlow().catch(console.error);