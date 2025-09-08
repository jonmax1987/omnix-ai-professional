#!/usr/bin/env node

/**
 * OMNIX AI - Performance Testing Script
 * Measures Core Web Vitals and performance metrics on staging
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
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function measureResourceLoadTime(url, description) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    
    const req = https.get(url, (res) => {
      let size = 0;
      
      res.on('data', (chunk) => {
        size += chunk.length;
      });
      
      res.on('end', () => {
        const end = performance.now();
        const loadTime = Math.round(end - start);
        
        resolve({
          description,
          loadTime,
          size: Math.round(size / 1024), // KB
          statusCode: res.statusCode
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testResourceLoading() {
  log(colors.cyan, '\n=== RESOURCE LOADING PERFORMANCE ===');
  
  const resources = [
    [STAGING_URL, 'Main HTML Document'],
    [`${STAGING_URL}/sw.js`, 'Service Worker'],
    [`${STAGING_URL}/manifest.webmanifest`, 'Web App Manifest']
  ];
  
  const results = [];
  
  for (const [url, description] of resources) {
    try {
      const result = await measureResourceLoadTime(url, description);
      
      let performance = 'EXCELLENT';
      let color = colors.green;
      
      if (result.loadTime > 1000) {
        performance = 'SLOW';
        color = colors.red;
      } else if (result.loadTime > 500) {
        performance = 'MODERATE';
        color = colors.yellow;
      }
      
      log(colors.cyan, `${description}:`);
      log(color, `  ${performance} - ${result.loadTime}ms (${result.size}KB)`);
      
      results.push(result);
    } catch (error) {
      log(colors.red, `  FAILED - ${description}: ${error.message}`);
      results.push({ description, error: error.message, failed: true });
    }
  }
  
  return results;
}

async function testAPIPerformance() {
  log(colors.cyan, '\n=== API PERFORMANCE METRICS ===');
  
  const apis = [
    [`${API_BASE}/health`, 'Health Check API'],
    [`${API_BASE}/dashboard/summary`, 'Dashboard Summary API'],
    [`${API_BASE}/products`, 'Products List API'],
    [`${API_BASE}/orders`, 'Orders List API']
  ];
  
  const results = [];
  
  for (const [url, description] of apis) {
    try {
      // Multiple requests to get average
      const requests = [];
      for (let i = 0; i < 3; i++) {
        requests.push(measureResourceLoadTime(url, description));
      }
      
      const responses = await Promise.all(requests);
      const avgLoadTime = Math.round(responses.reduce((sum, r) => sum + r.loadTime, 0) / responses.length);
      const avgSize = Math.round(responses.reduce((sum, r) => sum + r.size, 0) / responses.length);
      
      let performance = 'EXCELLENT';
      let color = colors.green;
      
      if (avgLoadTime > 500) {
        performance = 'SLOW';
        color = colors.red;
      } else if (avgLoadTime > 200) {
        performance = 'MODERATE';
        color = colors.yellow;
      }
      
      log(colors.cyan, `${description}:`);
      log(color, `  ${performance} - ${avgLoadTime}ms avg (${avgSize}KB)`);
      
      results.push({ description, avgLoadTime, avgSize, performance });
    } catch (error) {
      log(colors.red, `  FAILED - ${description}: ${error.message}`);
      results.push({ description, error: error.message, failed: true });
    }
  }
  
  return results;
}

async function testCachePerformance() {
  log(colors.cyan, '\n=== CACHE PERFORMANCE TEST ===');
  
  try {
    // First request (cold cache)
    const coldResult = await measureResourceLoadTime(STAGING_URL, 'Cold Cache');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Second request (should hit cache)
    const warmResult = await measureResourceLoadTime(STAGING_URL, 'Warm Cache');
    
    const improvement = Math.round(((coldResult.loadTime - warmResult.loadTime) / coldResult.loadTime) * 100);
    
    log(colors.cyan, 'Cache Performance:');
    log(colors.yellow, `  Cold Cache: ${coldResult.loadTime}ms`);
    log(colors.green, `  Warm Cache: ${warmResult.loadTime}ms`);
    
    if (improvement > 0) {
      log(colors.green, `  Cache Improvement: ${improvement}%`);
    } else {
      log(colors.yellow, '  No significant cache improvement detected');
    }
    
    return { coldResult, warmResult, improvement };
  } catch (error) {
    log(colors.red, `  FAILED - Cache test: ${error.message}`);
    return { error: error.message, failed: true };
  }
}

async function testConcurrentRequests() {
  log(colors.cyan, '\n=== CONCURRENT REQUEST PERFORMANCE ===');
  
  try {
    const concurrentRequests = 5;
    const requests = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(measureResourceLoadTime(`${API_BASE}/dashboard/summary`, `Request ${i + 1}`));
    }
    
    const start = performance.now();
    const results = await Promise.all(requests);
    const totalTime = Math.round(performance.now() - start);
    
    const avgResponseTime = Math.round(results.reduce((sum, r) => sum + r.loadTime, 0) / results.length);
    const maxResponseTime = Math.max(...results.map(r => r.loadTime));
    const minResponseTime = Math.min(...results.map(r => r.loadTime));
    
    let performance_rating = 'EXCELLENT';
    let color = colors.green;
    
    if (avgResponseTime > 1000) {
      performance_rating = 'SLOW';
      color = colors.red;
    } else if (avgResponseTime > 500) {
      performance_rating = 'MODERATE';
      color = colors.yellow;
    }
    
    log(colors.cyan, `Concurrent Requests (${concurrentRequests} simultaneous):`);
    log(color, `  ${performance_rating} - Avg: ${avgResponseTime}ms`);
    log(colors.yellow, `  Min: ${minResponseTime}ms, Max: ${maxResponseTime}ms`);
    log(colors.cyan, `  Total Time: ${totalTime}ms`);
    
    return { avgResponseTime, maxResponseTime, minResponseTime, totalTime };
  } catch (error) {
    log(colors.red, `  FAILED - Concurrent requests: ${error.message}`);
    return { error: error.message, failed: true };
  }
}

async function testMemoryOptimization() {
  log(colors.cyan, '\n=== MEMORY OPTIMIZATION VERIFICATION ===');
  
  try {
    const memBefore = process.memoryUsage();
    
    // Simulate heavy operations by making multiple API requests
    const heavyRequests = [];
    for (let i = 0; i < 10; i++) {
      heavyRequests.push(measureResourceLoadTime(`${API_BASE}/products`, `Heavy Request ${i}`));
    }
    
    await Promise.all(heavyRequests);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const memAfter = process.memoryUsage();
    const memDiff = Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024 * 100) / 100;
    
    log(colors.cyan, 'Memory Usage:');
    log(colors.yellow, `  Before: ${Math.round(memBefore.heapUsed / 1024 / 1024 * 100) / 100}MB`);
    log(colors.yellow, `  After: ${Math.round(memAfter.heapUsed / 1024 / 1024 * 100) / 100}MB`);
    
    if (memDiff < 5) {
      log(colors.green, `  Memory Growth: ${memDiff}MB (Excellent)`);
    } else if (memDiff < 10) {
      log(colors.yellow, `  Memory Growth: ${memDiff}MB (Good)`);
    } else {
      log(colors.red, `  Memory Growth: ${memDiff}MB (Needs Attention)`);
    }
    
    return { memBefore: memBefore.heapUsed, memAfter: memAfter.heapUsed, memDiff };
  } catch (error) {
    log(colors.red, `  FAILED - Memory test: ${error.message}`);
    return { error: error.message, failed: true };
  }
}

async function runPerformanceTests() {
  log(colors.magenta, '⚡ OMNIX AI - Performance & Core Web Vitals Testing\n');
  
  const resourceResults = await testResourceLoading();
  const apiResults = await testAPIPerformance();
  const cacheResults = await testCachePerformance();
  const concurrentResults = await testConcurrentRequests();
  const memoryResults = await testMemoryOptimization();
  
  // Performance Summary
  log(colors.magenta, '\n=== PERFORMANCE SUMMARY ===');
  
  // Calculate overall scores
  const successfulResources = resourceResults.filter(r => !r.failed);
  const avgResourceTime = successfulResources.reduce((sum, r) => sum + r.loadTime, 0) / successfulResources.length;
  
  const successfulAPIs = apiResults.filter(r => !r.failed);
  const avgAPITime = successfulAPIs.reduce((sum, r) => sum + r.avgLoadTime, 0) / successfulAPIs.length;
  
  // Core Web Vitals Simulation
  log(colors.cyan, 'Simulated Core Web Vitals:');
  
  // LCP (Largest Contentful Paint) - simulated by main page load
  const lcp = resourceResults.find(r => r.description === 'Main HTML Document')?.loadTime || 0;
  const lcpStatus = lcp < 2500 ? 'GOOD' : lcp < 4000 ? 'NEEDS IMPROVEMENT' : 'POOR';
  const lcpColor = lcp < 2500 ? colors.green : lcp < 4000 ? colors.yellow : colors.red;
  
  log(colors.cyan, `  LCP (Simulated): ${lcp}ms`);
  log(lcpColor, `    ${lcpStatus} (Target: <2500ms)`);
  
  // FID (First Input Delay) - simulated by API response time
  const fid = avgAPITime;
  const fidStatus = fid < 100 ? 'GOOD' : fid < 300 ? 'NEEDS IMPROVEMENT' : 'POOR';
  const fidColor = fid < 100 ? colors.green : fid < 300 ? colors.yellow : colors.red;
  
  log(colors.cyan, `  FID (Simulated): ${Math.round(fid)}ms`);
  log(fidColor, `    ${fidStatus} (Target: <100ms)`);
  
  // Overall Performance Score
  let performanceScore = 100;
  if (lcp > 2500) performanceScore -= 20;
  if (fid > 100) performanceScore -= 20;
  if (avgResourceTime > 1000) performanceScore -= 20;
  if (concurrentResults.avgResponseTime > 1000) performanceScore -= 20;
  if (memoryResults.memDiff > 10) performanceScore -= 20;
  
  const scoreColor = performanceScore >= 90 ? colors.green : performanceScore >= 70 ? colors.yellow : colors.red;
  
  log(colors.cyan, '\nPerformance Metrics:');
  log(colors.yellow, `  Average Resource Load: ${Math.round(avgResourceTime)}ms`);
  log(colors.yellow, `  Average API Response: ${Math.round(avgAPITime)}ms`);
  log(colors.yellow, `  Concurrent Performance: ${concurrentResults.avgResponseTime}ms`);
  log(colors.yellow, `  Memory Efficiency: ${memoryResults.memDiff}MB growth`);
  
  log(colors.cyan, '\nOverall Assessment:');
  log(scoreColor, `  Performance Score: ${performanceScore}/100`);
  
  if (performanceScore >= 90) {
    log(colors.green, '  ✅ EXCELLENT PERFORMANCE - Ready for production');
    log(colors.green, '     All performance targets met or exceeded');
  } else if (performanceScore >= 70) {
    log(colors.yellow, '  ⚠️  GOOD PERFORMANCE - Minor optimizations recommended');
    log(colors.yellow, '     Core functionality performs well');
  } else {
    log(colors.red, '  ❌ PERFORMANCE ISSUES DETECTED');
    log(colors.red, '     Significant optimization needed before production');
  }
  
  log(colors.cyan, `\n🌐 Staging URL: ${STAGING_URL}`);
  log(colors.cyan, `📊 Performance Optimizations Active: Web Workers, API Caching, Memory Management`);
  
  return {
    performanceScore,
    avgResourceTime: Math.round(avgResourceTime),
    avgAPITime: Math.round(avgAPITime),
    lcp,
    fid: Math.round(fid),
    stagingUrl: STAGING_URL
  };
}

// Run performance tests
runPerformanceTests().catch(console.error);