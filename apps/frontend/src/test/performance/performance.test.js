import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

describe('Performance Tests', () => {
  let browser;
  let page;
  let chrome;

  beforeAll(async () => {
    // Launch browser for Puppeteer tests
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    if (chrome) {
      await chrome.kill();
    }
  });

  describe('Page Load Performance', () => {
    it('should load the dashboard within acceptable time', async () => {
      // Start timing
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    it('should render first meaningful paint quickly', async () => {
      await page.goto('http://localhost:3000');
      
      // Measure First Contentful Paint
      const navigationMetrics = await page.evaluate(() => {
        return JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')[0]));
      });

      const fcp = await page.evaluate(() => {
        return new Promise(resolve => {
          new PerformanceObserver(list => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
            }
          }).observe({ entryTypes: ['paint'] });
        });
      });

      // FCP should be less than 2 seconds
      expect(fcp).toBeLessThan(2000);
    });
  });

  describe('Runtime Performance', () => {
    it('should handle component updates efficiently', async () => {
      await page.goto('http://localhost:3000');
      
      // Measure time for search functionality
      const searchStart = Date.now();
      
      await page.type('[data-testid="search-input"]', 'test query');
      await page.waitForTimeout(100); // Wait for debounced search
      
      const searchTime = Date.now() - searchStart;
      
      // Search should respond quickly
      expect(searchTime).toBeLessThan(500);
    });

    it('should scroll smoothly with large datasets', async () => {
      await page.goto('http://localhost:3000/products');
      
      // Measure scrolling performance
      const scrollStart = Date.now();
      
      // Simulate scrolling through a large list
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await page.waitForTimeout(200);
      const scrollTime = Date.now() - scrollStart;
      
      // Scrolling should be smooth (under 300ms)
      expect(scrollTime).toBeLessThan(300);
    });
  });

  describe('Memory Usage', () => {
    it('should not have memory leaks during navigation', async () => {
      await page.goto('http://localhost:3000');
      
      // Get initial memory usage
      const initialMetrics = await page.metrics();
      
      // Navigate between pages multiple times
      for (let i = 0; i < 5; i++) {
        await page.click('a[href="/products"]');
        await page.waitForSelector('[data-testid="products-page"]');
        await page.click('a[href="/"]');
        await page.waitForSelector('[data-testid="dashboard-page"]');
      }
      
      // Get final memory usage
      const finalMetrics = await page.metrics();
      
      // Memory usage shouldn't increase dramatically
      const memoryIncrease = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;
      const memoryIncreasePercent = (memoryIncrease / initialMetrics.JSHeapUsedSize) * 100;
      
      // Memory increase should be less than 50%
      expect(memoryIncreasePercent).toBeLessThan(50);
    });
  });

  describe('Bundle Size', () => {
    it('should have reasonable bundle sizes', async () => {
      await page.goto('http://localhost:3000');
      
      // Get all JavaScript resources
      const jsResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter(entry => entry.name.includes('.js'))
          .map(entry => ({
            name: entry.name,
            transferSize: entry.transferSize,
            decodedSize: entry.decodedBodySize
          }));
      });
      
      const totalJSSize = jsResources.reduce((total, resource) => {
        return total + resource.transferSize;
      }, 0);
      
      // Total JavaScript should be under 1MB (compressed)
      expect(totalJSSize).toBeLessThan(1024 * 1024);
    });
  });
});

describe('Lighthouse Performance Audit', () => {
  let chrome;

  beforeAll(async () => {
    chrome = await launch({ chromeFlags: ['--headless'] });
  });

  afterAll(async () => {
    if (chrome) {
      await chrome.kill();
    }
  });

  it('should pass Lighthouse performance audit', async () => {
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse('http://localhost:3000', options);
    const score = runnerResult.lhr.categories.performance.score * 100;
    
    // Should achieve at least 80% performance score
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('should pass Core Web Vitals thresholds', async () => {
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse('http://localhost:3000', options);
    const audits = runnerResult.lhr.audits;
    
    // Largest Contentful Paint should be under 2.5s
    const lcpValue = audits['largest-contentful-paint'].numericValue / 1000;
    expect(lcpValue).toBeLessThan(2.5);
    
    // First Input Delay should be under 100ms (if available)
    if (audits['max-potential-fid']) {
      const fidValue = audits['max-potential-fid'].numericValue;
      expect(fidValue).toBeLessThan(100);
    }
    
    // Cumulative Layout Shift should be under 0.1
    const clsValue = audits['cumulative-layout-shift'].numericValue;
    expect(clsValue).toBeLessThan(0.1);
  });

  it('should have efficient resource loading', async () => {
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse('http://localhost:3000', options);
    const audits = runnerResult.lhr.audits;
    
    // Unused JavaScript should be minimal
    if (audits['unused-javascript']) {
      const unusedJS = audits['unused-javascript'].numericValue;
      expect(unusedJS).toBeLessThan(100); // Less than 100KB of unused JS
    }
    
    // Images should be optimized
    if (audits['uses-optimized-images']) {
      expect(audits['uses-optimized-images'].score).toBeGreaterThanOrEqual(0.8);
    }
  });
});

describe('Web Vitals Integration', () => {
  it('should measure and report Core Web Vitals', async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Inject web-vitals library
    await page.addScriptTag({
      url: 'https://unpkg.com/web-vitals@3/dist/web-vitals.umd.js'
    });
    
    await page.goto('http://localhost:3000');
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitalsData = {};
        
        // Measure CLS, FID, FCP, LCP, TTFB
        webVitals.getCLS((metric) => vitalsData.cls = metric.value);
        webVitals.getFID((metric) => vitalsData.fid = metric.value);
        webVitals.getFCP((metric) => vitalsData.fcp = metric.value);
        webVitals.getLCP((metric) => vitalsData.lcp = metric.value);
        webVitals.getTTFB((metric) => vitalsData.ttfb = metric.value);
        
        // Wait a bit for metrics to be collected
        setTimeout(() => resolve(vitalsData), 2000);
      });
    });
    
    // Assert Core Web Vitals are within good thresholds
    if (vitals.cls !== undefined) {
      expect(vitals.cls).toBeLessThan(0.1); // Good CLS
    }
    
    if (vitals.fcp !== undefined) {
      expect(vitals.fcp).toBeLessThan(1800); // Good FCP
    }
    
    if (vitals.lcp !== undefined) {
      expect(vitals.lcp).toBeLessThan(2500); // Good LCP
    }
    
    if (vitals.ttfb !== undefined) {
      expect(vitals.ttfb).toBeLessThan(600); // Good TTFB
    }
    
    await browser.close();
  });
});