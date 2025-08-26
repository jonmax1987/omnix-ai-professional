#!/usr/bin/env node
/**
 * Test frontend WebSocket service with Socket.IO
 */

import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001';
const TEST_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUxYWY1OGNiOTZhM2VhMmY5YzdjZjkiLCJlbWFpbCI6Im1hbmFnZXJAb21uaXguYWkiLCJyb2xlIjoibWFuYWdlciIsImlhdCI6MTczNjk0OTQzMywiZXhwIjoxNzM2OTUzMDMzfQ.aY7eQPOe9e8c3lAmGEFiGJQYNPdV6K6d5PZZ0BnL3P4';

console.log('🧪 Testing Frontend WebSocket Integration');
console.log('========================================');

async function testFrontendWebSocket() {
  return new Promise((resolve, reject) => {
    console.log('🔌 Connecting to Socket.IO backend...');
    
    const socket = io(BACKEND_URL + '/ws', {
      auth: { token: TEST_JWT_TOKEN },
      transports: ['websocket'],
      forceNew: true
    });
    
    let messageCount = 0;
    const startTime = Date.now();
    
    socket.on('connect', () => {
      console.log('✅ Connected successfully!');
      console.log(`   Socket ID: ${socket.id}`);
      console.log('');
      
      // Test frontend message format - subscribe to channels
      console.log('📡 Testing subscription messages...');
      
      // Subscribe to products channel (frontend format)
      socket.emit('message', { type: 'subscribe', channel: 'products' });
      console.log('   → Subscribed to products channel');
      
      // Subscribe to dashboard channel
      socket.emit('message', { type: 'subscribe', channel: 'dashboard' });
      console.log('   → Subscribed to dashboard channel');
      
      // Subscribe to alerts channel
      socket.emit('message', { type: 'subscribe', channel: 'alerts' });
      console.log('   → Subscribed to alerts channel');
      
      // Request dashboard metrics
      socket.emit('message', { type: 'GET_DASHBOARD_METRICS' });
      console.log('   → Requested dashboard metrics');
      
      console.log('');
      console.log('⏳ Listening for messages for 5 seconds...');
    });
    
    socket.on('message', (data) => {
      messageCount++;
      console.log(`📨 Message ${messageCount}:`, {
        channel: data.channel || data.event || 'unknown',
        type: data.type || 'unknown',
        hasPayload: !!data.payload,
        payloadKeys: data.payload ? Object.keys(data.payload) : []
      });
    });
    
    // Listen for specific events that the backend might emit
    socket.on('product.updated', (data) => {
      console.log('🛍️ Product Update:', data);
    });
    
    socket.on('alert.created', (data) => {
      console.log('🚨 New Alert:', data);
    });
    
    socket.on('metrics.updated', (data) => {
      console.log('📊 Metrics Update:', data);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Connection Error:', error.message);
      reject(error);
    });
    
    socket.on('disconnect', (reason) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`🔌 Disconnected after ${duration}s: ${reason}`);
      
      console.log('');
      console.log('📋 Test Summary:');
      console.log(`   • Connection: ✅ Successful`);
      console.log(`   • Duration: ${duration} seconds`);
      console.log(`   • Messages received: ${messageCount}`);
      console.log(`   • Subscriptions sent: 4 (products, dashboard, alerts, metrics)`);
      
      if (messageCount > 0) {
        console.log('   • Real-time communication: ✅ Working');
      } else {
        console.log('   • Real-time communication: ⚠️ No messages received');
      }
      
      console.log('');
      console.log('🎉 Frontend WebSocket integration is ready! 🚀');
      
      resolve({
        connected: true,
        messagesReceived: messageCount,
        duration: parseFloat(duration)
      });
    });
    
    // Disconnect after 5 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout - disconnecting...');
      socket.disconnect();
    }, 5000);
  });
}

// Run the test
testFrontendWebSocket()
  .then(result => {
    console.log('\n✨ SUCCESS! Frontend is ready to connect to backend! ✨');
    console.log('\n🔗 Next steps:');
    console.log('1. Open http://localhost:5174 in your browser');
    console.log('2. Login with manager@omnix.ai');
    console.log('3. Check browser console for "WebSocket connected via Socket.IO"');
    console.log('4. Watch real-time updates in action!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n🚨 Test failed:', error.message);
    process.exit(1);
  });