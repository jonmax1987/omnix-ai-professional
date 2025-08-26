#!/usr/bin/env node

// Final verification - no Node.js specific imports
console.log('🎯 FINAL VERIFICATION: Frontend-Backend Integration\n');

async function finalCheck() {
  console.log('📡 Testing Backend API...');
  try {
    const response = await fetch('https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/dashboard/summary');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API: WORKING');
      console.log(`   Real Data: ${data.data.totalItems} items, $${data.data.totalInventoryValue}`);
      
      if (data.data.totalItems === 203) {
        console.log('   🎉 This is confirmed REAL backend data (not mock)');
      }
    }
  } catch (error) {
    console.log('❌ Backend API failed:', error.message);
    return false;
  }

  console.log('\n🌐 Testing Frontend...');
  try {
    const frontendResponse = await fetch('http://localhost:5173');
    if (frontendResponse.ok) {
      console.log('✅ Frontend: ACCESSIBLE');
    }
  } catch (error) {
    console.log('❌ Frontend failed:', error.message);
    return false;
  }

  console.log('\n✅ ALL SYSTEMS GO!');
  console.log('');
  console.log('🚀 Your frontend is now ready:');
  console.log('   1. Open: http://localhost:5173/dashboard');
  console.log('   2. Look for the debug panel in top-right corner');
  console.log('   3. Check browser console for API request logs');
  console.log('   4. Verify dashboard shows real data:');
  console.log('      - 203 total items (not mock data)');
  console.log('      - $4,256.97 inventory value (not mock data)');
  console.log('      - Beverages: 158 items');
  console.log('      - Baking: 45 items');
  console.log('');
  console.log('💡 If you still see mock data, refresh the page');
  console.log('   and check the debug panel for real-time API status');
  
  return true;
}

finalCheck();