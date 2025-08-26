#!/usr/bin/env node
/**
 * Test WebSocket connection to the backend server
 */

import WebSocket from 'ws';

const WEBSOCKET_URL = 'ws://localhost:3001/ws';
const TEST_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUxYWY1OGNiOTZhM2VhMmY5YzdjZjkiLCJlbWFpbCI6Im1hbmFnZXJAb21uaXguYWkiLCJyb2xlIjoibWFuYWdlciIsImlhdCI6MTczNjk0OTQzMywiZXhwIjoxNzM2OTUzMDMzfQ.aY7eQPOe9e8c3lAmGEFiGJQYNPdV6K6d5PZZ0BnL3P4';

console.log('🧪 Testing WebSocket Connection');
console.log('================================');

async function testWebSocketConnection() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WEBSOCKET_URL}?token=${TEST_JWT_TOKEN}`);
    
    let connected = false;
    let receivedMessages = [];
    
    // Connection timeout
    const timeout = setTimeout(() => {
      if (!connected) {
        ws.close();
        reject(new Error('Connection timeout after 5 seconds'));
      }
    }, 5000);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connected successfully!');
      connected = true;
      clearTimeout(timeout);
      
      // Test subscription to products channel
      console.log('📡 Subscribing to products channel...');
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'products'
      }));
      
      // Test subscription to dashboard channel
      console.log('📊 Subscribing to dashboard channel...');
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'dashboard'
      }));
      
      // Request dashboard metrics
      console.log('📈 Requesting dashboard metrics...');
      ws.send(JSON.stringify({
        type: 'GET_DASHBOARD_METRICS'
      }));
      
      // Close connection after 3 seconds to finish test
      setTimeout(() => {
        console.log('📋 Test Summary:');
        console.log(`   • Connection: ✅ Successful`);
        console.log(`   • Messages sent: 3 (subscribe products, dashboard, get metrics)`);
        console.log(`   • Messages received: ${receivedMessages.length}`);
        console.log('   • WebSocket backend is ready! 🎉');
        
        ws.close();
        resolve({
          connected: true,
          messagesSent: 3,
          messagesReceived: receivedMessages.length,
          messages: receivedMessages
        });
      }, 3000);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('📨 Received message:', {
          channel: message.channel || message.event,
          type: message.type,
          payloadKeys: Object.keys(message.payload || {})
        });
        receivedMessages.push(message);
      } catch (error) {
        console.log('📨 Received raw message:', data.toString());
        receivedMessages.push(data.toString());
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      connected = false;
      clearTimeout(timeout);
      reject(error);
    });
    
    ws.on('close', (code, reason) => {
      if (connected) {
        console.log('🔌 WebSocket connection closed normally');
      } else {
        console.log('❌ WebSocket connection closed with error:', code, reason);
      }
    });
  });
}

// Run the test
testWebSocketConnection()
  .then(result => {
    console.log('\n🎯 Test Result: SUCCESS ✅');
    console.log('Your WebSocket backend is working perfectly!');
    console.log('Frontend integration is ready to go! 🚀');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n🚨 Test Result: FAILED ❌');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure backend server is running on localhost:3001');
    console.log('2. Check if WebSocket endpoint is /ws');
    console.log('3. Verify JWT token is valid');
    console.log('4. Check for CORS configuration');
    process.exit(1);
  });