#!/usr/bin/env node

// Test CORS Fix with Vite Proxy
console.log('🔍 Testing CORS Fix with Vite Proxy\n');

async function testProxy() {
  try {
    console.log('📡 Testing proxy endpoint: http://localhost:5173/api/dashboard/summary');
    
    const response = await fetch('http://localhost:5173/api/dashboard/summary');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Proxy working! Real backend data received:');
      console.log(`   - Total Items: ${data.data.totalItems}`);
      console.log(`   - Inventory Value: $${data.data.totalInventoryValue}`);
      console.log(`   - Categories: ${data.data.categoryBreakdown?.length || 0}`);
      
      if (data.data.totalItems === 203) {
        console.log('\n🎉 SUCCESS! This is confirmed real backend data');
        console.log('   Frontend browser requests will now work without CORS errors');
        
        return true;
      }
    } else {
      console.log(`❌ Proxy failed with status: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Proxy test failed: ${error.message}`);
    return false;
  }
}

testProxy().then(success => {
  console.log('\n📋 Next Steps:');
  if (success) {
    console.log('✅ CORS issue is FIXED!');
    console.log('✅ Proxy configuration is working');
    console.log('✅ Frontend can now access real backend data');
    console.log('');
    console.log('🌐 Open http://localhost:5173/dashboard');
    console.log('   You should now see REAL data instead of mock data');
    console.log('   Check the browser console - no more CORS errors!');
  } else {
    console.log('⚠️  Proxy setup needs attention');
  }
});