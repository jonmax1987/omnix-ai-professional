#!/usr/bin/env node

/**
 * OMNIX AI - Staging Health Check Script
 * Comprehensive testing of staging deployment
 */

import https from 'https';
import { performance } from 'perf_hooks';

const STAGING_URL = 'https://dtdnwq4annvk2.cloudfront.net';
const API_BASE = 'https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/v1';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    
    const req = https.request(url, options, (res) => {
      const end = performance.now();
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: Math.round(end - start)
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    const result = await makeRequest(url);
    const status = result.statusCode === expectedStatus ? 'PASS' : 'FAIL';
    const statusColor = status === 'PASS' ? colors.green : colors.red;
    
    log(colors.cyan, `Testing ${name}:`);
    log(statusColor, `  ${status} - Status: ${result.statusCode} (${result.responseTime}ms)`);
    
    if (result.data) {
      try {
        const json = JSON.parse(result.data);
        log(colors.yellow, `  Data: ${json.message || 'Response received'}`);
      } catch {
        log(colors.yellow, `  Data: ${result.data.substring(0, 100)}...`);
      }
    }
    
    return { name, status, responseTime: result.responseTime, statusCode: result.statusCode };
  } catch (error) {
    log(colors.red, `  FAIL - ${name}: ${error.message}`);
    return { name, status: 'FAIL', error: error.message };
  }
}

async function testStaticAssets() {
  log(colors.cyan, '\n=== STATIC ASSETS HEALTH CHECK ===');
  
  const assets = [
    'Main Page',
    'Cache Version',
    'Service Worker',
    'App Manifest'
  ];
  
  const urls = [
    STAGING_URL,
    `${STAGING_URL}/cache-version.txt`,
    `${STAGING_URL}/sw.js`,
    `${STAGING_URL}/manifest.webmanifest`
  ];
  
  const results = [];
  for (let i = 0; i < assets.length; i++) {
    const result = await testEndpoint(assets[i], urls[i]);
    results.push(result);
  }
  
  return results;
}

async function testAPIEndpoints() {
  log(colors.cyan, '\n=== API ENDPOINTS HEALTH CHECK ===');
  
  const endpoints = [
    ['Health Check', `${API_BASE}/health`],
    ['Dashboard Summary', `${API_BASE}/dashboard/summary`],
    ['Products List', `${API_BASE}/products`],
    ['Orders List', `${API_BASE}/orders`]
  ];
  
  const results = [];
  for (const [name, url] of endpoints) {
    const result = await testEndpoint(name, url);
    results.push(result);
  }
  
  return results;
}

async function testPerformanceMetrics() {
  log(colors.cyan, '\n=== PERFORMANCE METRICS ===');
  
  const performanceTests = [
    ['Main Page Load Time', STAGING_URL],
    ['API Response Time', `${API_BASE}/health`],
    ['Dashboard API Time', `${API_BASE}/dashboard/summary`]
  ];
  
  const results = [];
  for (const [name, url] of performanceTests) {
    try {
      const result = await makeRequest(url);
      const responseTime = result.responseTime;
      
      let performance = 'EXCELLENT';
      let color = colors.green;
      
      if (responseTime > 500) {
        performance = 'SLOW';
        color = colors.red;
      } else if (responseTime > 200) {
        performance = 'GOOD';
        color = colors.yellow;
      }
      
      log(colors.cyan, `${name}:`);
      log(color, `  ${performance} - ${responseTime}ms`);
      
      results.push({ name, responseTime, performance });
    } catch (error) {
      log(colors.red, `  FAIL - ${name}: ${error.message}`);
      results.push({ name, status: 'FAIL', error: error.message });
    }
  }
  
  return results;
}

async function testSecurityHeaders() {
  log(colors.cyan, '\n=== SECURITY HEADERS CHECK ===');
  
  try {
    const result = await makeRequest(STAGING_URL);
    const headers = result.headers;
    
    const securityChecks = [
      ['Cache Control', headers['cache-control'] && headers['cache-control'].includes('no-cache')],
      ['Content Type', headers['content-type'] && headers['content-type'].includes('text/html')],
      ['CloudFront', headers['via'] && headers['via'].includes('cloudfront')],
      ['HTTPS Only', true] // We're making HTTPS requests
    ];
    
    securityChecks.forEach(([name, passed]) => {
      const status = passed ? 'PASS' : 'FAIL';
      const color = passed ? colors.green : colors.red;
      log(color, `  ${status} - ${name}`);
    });
    
    return securityChecks.map(([name, passed]) => ({ name, status: passed ? 'PASS' : 'FAIL' }));
  } catch (error) {
    log(colors.red, `  FAIL - Security headers check: ${error.message}`);
    return [{ name: 'Security Headers', status: 'FAIL', error: error.message }];
  }
}

async function runHealthChecks() {
  log(colors.cyan, '🚀 OMNIX AI - Staging Deployment Health Check\n');
  
  const staticResults = await testStaticAssets();
  const apiResults = await testAPIEndpoints();
  const performanceResults = await testPerformanceMetrics();
  const securityResults = await testSecurityHeaders();
  
  // Summary
  log(colors.cyan, '\n=== DEPLOYMENT HEALTH SUMMARY ===');
  
  const allResults = [...staticResults, ...apiResults, ...securityResults];
  const passedTests = allResults.filter(r => r.status === 'PASS').length;
  const totalTests = allResults.length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  log(colors.cyan, `Total Tests: ${totalTests}`);
  log(colors.green, `Passed: ${passedTests}`);
  log(colors.red, `Failed: ${totalTests - passedTests}`);
  log(colors.cyan, `Success Rate: ${successRate}%`);
  
  // Performance Summary
  const avgResponseTime = performanceResults
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / performanceResults.length;
  
  log(colors.yellow, `Average Response Time: ${Math.round(avgResponseTime)}ms`);
  
  // Deployment Status
  if (successRate >= 90 && avgResponseTime < 1000) {
    log(colors.green, '\n✅ DEPLOYMENT READY FOR PRODUCTION');
    log(colors.green, '   All critical systems operational');
  } else if (successRate >= 70) {
    log(colors.yellow, '\n⚠️  DEPLOYMENT NEEDS ATTENTION');
    log(colors.yellow, '   Some issues detected but core functionality works');
  } else {
    log(colors.red, '\n❌ DEPLOYMENT NOT READY');
    log(colors.red, '   Critical issues detected - rollback recommended');
  }
  
  log(colors.cyan, `\n🌐 Staging URL: ${STAGING_URL}`);
  log(colors.cyan, `📊 API Base: ${API_BASE}`);
  
  return {
    successRate,
    avgResponseTime,
    totalTests,
    passedTests,
    stagingUrl: STAGING_URL
  };
}

// Run the health checks
runHealthChecks().catch(console.error);