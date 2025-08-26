#!/usr/bin/env node
/**
 * Test Socket.IO connection to the backend server
 */

import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001';
const TEST_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUxYWY1OGNiOTZhM2VhMmY5YzdjZjkiLCJlbWFpbCI6Im1hbmFnZXJAb21uaXguYWkiLCJyb2xlIjoibWFuYWdlciIsImlhdCI6MTczNjk0OTQzMywiZXhwIjoxNzM2OTUzMDMzfQ.aY7eQPOe9e8c3lAmGEFiGJQYNPdV6K6d5PZZ0BnL3P4';

console.log('🧪 Testing Socket.IO Connection');
console.log('================================');

async function testSocketIOConnection() {
  return new Promise((resolve, reject) => {
    // Test different Socket.IO connection methods
    const connectionOptions = [
      // Option 1: Socket.IO with /ws namespace and token in auth
      {
        name: 'Socket.IO with /ws namespace (auth object)',
        url: BACKEND_URL,
        options: {
          forceNew: true,
          transports: ['websocket'],
          auth: { token: TEST_JWT_TOKEN }
        },
        namespace: '/ws'
      },
      // Option 2: Socket.IO with token in query
      {
        name: 'Socket.IO with /ws namespace (query token)',
        url: BACKEND_URL,
        options: {
          forceNew: true,
          transports: ['websocket'],
          query: { token: TEST_JWT_TOKEN }
        },
        namespace: '/ws'
      },
      // Option 3: Socket.IO on default namespace
      {
        name: 'Socket.IO default namespace (auth object)',
        url: BACKEND_URL,
        options: {
          forceNew: true,
          transports: ['websocket'],
          auth: { token: TEST_JWT_TOKEN }
        },
        namespace: ''
      }
    ];
    
    let successfulConnection = null;
    let testCount = 0;
    
    async function testConnection(config) {
      return new Promise((resolveTest, rejectTest) => {
        console.log(`\n🔄 Testing: ${config.name}`);
        
        const socket = io(config.url + config.namespace, config.options);
        
        const timeout = setTimeout(() => {
          socket.close();
          rejectTest(new Error('Connection timeout'));
        }, 3000);
        
        socket.on('connect', () => {
          console.log('✅ Connected successfully!');
          clearTimeout(timeout);
          
          // Test sending a message
          socket.emit('subscribe', { channel: 'products' });
          
          setTimeout(() => {
            socket.close();
            resolveTest({
              success: true,
              config,
              socketId: socket.id
            });
          }, 1000);
        });
        
        socket.on('connect_error', (error) => {
          console.log('❌ Connection failed:', error.message);
          clearTimeout(timeout);
          socket.close();
          rejectTest(error);
        });
        
        socket.on('disconnect', () => {
          console.log('🔌 Disconnected');
        });
        
        socket.on('message', (data) => {
          console.log('📨 Received message:', data);
        });
      });
    }
    
    async function testAllConfigurations() {
      for (const config of connectionOptions) {
        try {
          const result = await testConnection(config);
          successfulConnection = result;
          break; // Stop on first success
        } catch (error) {
          testCount++;
          continue; // Try next configuration
        }
      }
      
      if (successfulConnection) {
        console.log('\n🎯 Test Result: SUCCESS ✅');
        console.log(`Successful configuration: ${successfulConnection.config.name}`);
        console.log(`Socket ID: ${successfulConnection.socketId}`);
        resolve(successfulConnection);
      } else {
        console.log('\n🚨 Test Result: ALL CONFIGURATIONS FAILED ❌');
        reject(new Error('All Socket.IO configurations failed'));
      }
    }
    
    testAllConfigurations();
  });
}

// Run the test
testSocketIOConnection()
  .then(result => {
    console.log('\n🎉 Socket.IO backend is working!');
    console.log('✨ Frontend integration is ready! 🚀');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n🔧 Troubleshooting Socket.IO Connection:');
    console.error('1. Backend might not be using Socket.IO');
    console.error('2. Different namespace or configuration needed');
    console.error('3. Authentication method might be different');
    console.error('4. CORS or firewall issues');
    console.log('\n💡 Next steps: Check backend WebSocket implementation details');
    process.exit(1);
  });