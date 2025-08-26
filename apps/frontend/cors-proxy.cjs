#!/usr/bin/env node

// Simple CORS proxy server for development
const http = require('http');
const https = require('https');
const { URL } = require('url');

const TARGET_URL = 'https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1';
const PORT = 3001;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Construct target URL
  const targetUrl = `${TARGET_URL}${req.url}`;
  const parsedUrl = new URL(targetUrl);
  
  console.log(`📡 Proxying: ${req.method} ${req.url} -> ${targetUrl}`);
  
  // Forward request to backend
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: parsedUrl.pathname + parsedUrl.search,
    method: req.method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'OMNIX-Proxy/1.0'
    }
  };
  
  const proxyReq = https.request(options, (proxyRes) => {
    // Forward response headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Forward response body
    proxyRes.pipe(res);
    
    console.log(`✅ Response: ${proxyRes.statusCode}`);
  });
  
  proxyReq.on('error', (err) => {
    console.error(`❌ Proxy error: ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  });
  
  // Forward request body if present
  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`🔄 CORS Proxy running on http://localhost:${PORT}`);
  console.log(`   Forwarding to: ${TARGET_URL}`);
  console.log(`   Frontend can use: http://localhost:${PORT}/dashboard/summary`);
});

// Handle server errors
server.on('error', (err) => {
  console.error(`❌ Server error: ${err.message}`);
});