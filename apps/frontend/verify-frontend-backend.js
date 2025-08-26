#!/usr/bin/env node

// Comprehensive Frontend-Backend Verification
console.log('🔍 COMPREHENSIVE FRONTEND-BACKEND VERIFICATION\n');

async function verifyIntegration() {
  let allPassed = true;
  
  console.log('📡 Step 1: Testing Backend API Direct Connection...');
  try {
    const backendURL = 'https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/dashboard/summary';
    const response = await fetch(backendURL);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API: WORKING');
      console.log(`   - Total Items: ${data.data.totalItems}`);
      console.log(`   - Inventory Value: $${data.data.totalInventoryValue}`);
      
      // Store real data for comparison
      global.realBackendData = data.data;
    } else {
      console.log('❌ Backend API: FAILED');
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ Backend API Error: ${error.message}`);
    allPassed = false;
  }
  
  console.log('\n🌐 Step 2: Testing Frontend Accessibility...');
  try {
    const frontendResponse = await fetch('http://localhost:5173');
    if (frontendResponse.ok) {
      console.log('✅ Frontend: ACCESSIBLE');
    } else {
      console.log('❌ Frontend: NOT ACCESSIBLE');
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ Frontend Error: ${error.message}`);
    allPassed = false;
  }
  
  console.log('\n📋 Step 3: Environment Configuration Check...');
  const envFile = require('fs').readFileSync('.env.development', 'utf8');
  const viteApiUrl = envFile.match(/VITE_API_BASE_URL=(.+)/)?.[1];
  
  if (viteApiUrl && viteApiUrl.includes('8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev')) {
    console.log('✅ Environment: CORRECTLY CONFIGURED');
    console.log(`   - VITE_API_BASE_URL: ${viteApiUrl}`);
  } else {
    console.log('❌ Environment: MISCONFIGURED');
    console.log(`   - Found: ${viteApiUrl || 'not set'}`);
    allPassed = false;
  }
  
  console.log('\n🔧 Step 4: API Configuration Check...');
  const apiFile = require('fs').readFileSync('src/services/api.js', 'utf8');
  
  if (apiFile.includes("+ '/v1'")) {
    console.log('✅ API Configuration: CORRECT (/v1 prefix added)');
  } else {
    console.log('❌ API Configuration: MISSING /v1 prefix');
    allPassed = false;
  }
  
  if (apiFile.includes('api.get(\'/dashboard/summary\'')) {
    console.log('✅ Analytics API: CORRECTLY MAPPED');
  } else {
    console.log('❌ Analytics API: NOT MAPPED CORRECTLY');
    allPassed = false;
  }
  
  console.log('\n📊 FINAL VERDICT:');
  if (allPassed) {
    console.log('🎉 ALL CHECKS PASSED!');
    console.log('');
    console.log('✅ Backend is providing real data');
    console.log('✅ Frontend is accessible');  
    console.log('✅ Environment variables are correct');
    console.log('✅ API configuration is fixed');
    console.log('');
    console.log('🚀 Your frontend should now be displaying REAL backend data!');
    console.log('   Open http://localhost:5173/dashboard to verify');
    console.log('');
    console.log('💡 Look for the debug panel in the top-right corner');
    console.log('   It will show you exactly what data is being loaded');
    
    if (global.realBackendData) {
      console.log('');
      console.log('🔍 Expected Real Data in Dashboard:');
      console.log(`   - Total Items: ${global.realBackendData.totalItems} (not mock data)`);
      console.log(`   - Inventory Value: $${global.realBackendData.totalInventoryValue} (not mock data)`);
      console.log(`   - Categories: ${global.realBackendData.categoryBreakdown?.length || 0} categories`);
      
      global.realBackendData.categoryBreakdown?.forEach(cat => {
        console.log(`     * ${cat.category}: ${cat.itemCount} items`);
      });
    }
  } else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('   Please fix the issues above and try again');
  }
  
  return allPassed;
}

verifyIntegration().then(success => {
  process.exit(success ? 0 : 1);
});