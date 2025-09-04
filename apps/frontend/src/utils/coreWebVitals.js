/**
 * OMNIX AI - Core Web Vitals Monitoring
 * Comprehensive performance monitoring system for Core Web Vitals
 * Tracks LCP, FID, CLS, FCP, TTFB and custom metrics
 */

import { info, warn, error, logPerformance } from './performanceLogger.js';

class CoreWebVitalsMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.isMonitoring = false;
    this.vitalsBuffer = [];
    this.maxBufferSize = 100;
    
    // Performance thresholds (in milliseconds or scores)
    this.thresholds = {
      // Core Web Vitals thresholds
      LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
      FID: { good: 100, poor: 300 },        // First Input Delay
      CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
      
      // Additional metrics
      FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
      TTFB: { good: 800, poor: 1800 },      // Time to First Byte
      
      // Custom metrics
      API_RESPONSE: { good: 500, poor: 2000 },
      UI_INTERACTION: { good: 100, poor: 300 },
      MEMORY_USAGE: { good: 50, poor: 100 }  // MB
    };

    this.initialize();
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  initialize() {
    if (typeof window === 'undefined') {
      return; // Skip on server side
    }

    this.isMonitoring = true;
    
    // Initialize performance observers
    this.initializeLCPObserver();
    this.initializeFIDObserver();
    this.initializeCLSObserver();
    this.initializeFCPObserver();
    this.initializeTTFBObserver();
    this.initializeLongTaskObserver();
    
    // Monitor custom metrics
    this.initializeCustomMetrics();
    
    // Set up periodic reporting
    this.setupPeriodicReporting();
    
    info('Core Web Vitals monitoring initialized');
  }

  /**
   * Initialize Largest Contentful Paint observer
   */
  initializeLCPObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordMetric('LCP', lastEntry.startTime, {
          element: lastEntry.element?.tagName || 'unknown',
          url: lastEntry.url || window.location.href
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (err) {
      warn('Failed to initialize LCP observer', err);
    }
  }

  /**
   * Initialize First Input Delay observer
   */
  initializeFIDObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('FID', entry.processingStart - entry.startTime, {
            eventType: entry.name,
            target: entry.target?.tagName || 'unknown'
          });
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (err) {
      warn('Failed to initialize FID observer', err);
    }
  }

  /**
   * Initialize Cumulative Layout Shift observer
   */
  initializeCLSObserver() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let clsEntries = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
            
            this.recordMetric('CLS', clsValue, {
              sources: clsEntries.map(e => ({
                element: e.sources?.[0]?.node?.tagName || 'unknown',
                value: e.value
              }))
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (err) {
      warn('Failed to initialize CLS observer', err);
    }
  }

  /**
   * Initialize First Contentful Paint observer
   */
  initializeFCPObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime);
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (err) {
      warn('Failed to initialize FCP observer', err);
    }
  }

  /**
   * Initialize Time to First Byte observer
   */
  initializeTTFBObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const ttfb = entry.responseStart - entry.requestStart;
            this.recordMetric('TTFB', ttfb, {
              type: entry.type,
              transferSize: entry.transferSize
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (err) {
      warn('Failed to initialize TTFB observer', err);
    }
  }

  /**
   * Initialize Long Task observer
   */
  initializeLongTaskObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('LONG_TASK', entry.duration, {
            name: entry.name,
            attribution: entry.attribution?.map(attr => ({
              name: attr.name,
              containerType: attr.containerType,
              containerName: attr.containerName
            })) || []
          });
          
          if (entry.duration > 50) {
            warn('Long task detected', {
              duration: `${entry.duration.toFixed(2)}ms`,
              name: entry.name
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (err) {
      warn('Failed to initialize Long Task observer', err);
    }
  }

  /**
   * Initialize custom performance metrics
   */
  initializeCustomMetrics() {
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor API response times
    this.monitorAPIResponses();
    
    // Monitor UI interactions
    this.monitorUIInteractions();
  }

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage() {
    if (typeof performance === 'undefined' || !performance.memory) return;

    setInterval(() => {
      const memoryInfo = performance.memory;
      const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
      
      this.recordMetric('MEMORY_USAGE', usedMB, {
        total: memoryInfo.totalJSHeapSize / 1024 / 1024,
        limit: memoryInfo.jsHeapSizeLimit / 1024 / 1024,
        usage: (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Monitor API response times
   */
  monitorAPIResponses() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            const responseTime = entry.responseEnd - entry.requestStart;
            
            this.recordMetric('API_RESPONSE', responseTime, {
              url: entry.name,
              method: 'unknown', // Unfortunately not available in Resource Timing
              status: 'unknown',
              transferSize: entry.transferSize,
              decodedBodySize: entry.decodedBodySize
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (err) {
      warn('Failed to initialize API response monitoring', err);
    }
  }

  /**
   * Monitor UI interactions
   */
  monitorUIInteractions() {
    const interactionTypes = ['click', 'keydown', 'scroll'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        
        // Use requestAnimationFrame to measure UI response time
        requestAnimationFrame(() => {
          const responseTime = performance.now() - startTime;
          
          if (responseTime > 16.67) { // Slower than 60fps
            this.recordMetric('UI_INTERACTION', responseTime, {
              type,
              target: event.target?.tagName || 'unknown',
              timestamp: Date.now()
            });
          }
        });
      }, { passive: true });
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(name, value, context = null) {
    const metric = {
      name,
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
      context,
      timestamp: Date.now(),
      rating: this.getRating(name, value)
    };

    // Store in metrics map
    const existing = this.metrics.get(name) || [];
    existing.push(metric);
    this.metrics.set(name, existing);

    // Add to buffer
    this.vitalsBuffer.push(metric);
    if (this.vitalsBuffer.length > this.maxBufferSize) {
      this.vitalsBuffer.shift();
    }

    // Log performance
    logPerformance(`${name}_metric`, value, context);

    // Check thresholds
    this.checkThreshold(metric);

    info(`${name} recorded`, {
      value: `${value.toFixed(2)}${name === 'CLS' ? '' : 'ms'}`,
      rating: metric.rating,
      context
    });
  }

  /**
   * Get performance rating for a metric
   */
  getRating(name, value) {
    const threshold = this.thresholds[name];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Check if metric exceeds thresholds
   */
  checkThreshold(metric) {
    const { name, value, rating } = metric;

    if (rating === 'poor') {
      warn(`Poor ${name} performance detected`, {
        value: `${value.toFixed(2)}${name === 'CLS' ? '' : 'ms'}`,
        threshold: this.thresholds[name],
        context: metric.context
      });
    }
  }

  /**
   * Get Core Web Vitals summary
   */
  getCoreWebVitalsSummary() {
    const summary = {};
    const coreVitals = ['LCP', 'FID', 'CLS'];
    
    coreVitals.forEach(vital => {
      const metrics = this.metrics.get(vital) || [];
      const latest = metrics[metrics.length - 1];
      
      summary[vital] = {
        value: latest?.value || null,
        rating: latest?.rating || 'unknown',
        timestamp: latest?.timestamp || null,
        count: metrics.length
      };
    });

    return summary;
  }

  /**
   * Get all performance metrics summary
   */
  getPerformanceSummary() {
    const summary = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      const values = metrics.map(m => m.value);
      const ratings = metrics.map(m => m.rating);
      
      summary[name] = {
        count: metrics.length,
        latest: metrics[metrics.length - 1],
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        ratings: {
          good: ratings.filter(r => r === 'good').length,
          'needs-improvement': ratings.filter(r => r === 'needs-improvement').length,
          poor: ratings.filter(r => r === 'poor').length
        }
      };
    }

    return summary;
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore() {
    const coreVitals = this.getCoreWebVitalsSummary();
    let score = 100;
    let totalWeight = 0;

    // Core Web Vitals weights
    const weights = {
      LCP: 25,  // 25% weight
      FID: 25,  // 25% weight  
      CLS: 50   // 50% weight
    };

    Object.keys(weights).forEach(vital => {
      const metric = coreVitals[vital];
      if (metric && metric.rating) {
        const weight = weights[vital];
        totalWeight += weight;
        
        let vitalScore = 100;
        if (metric.rating === 'needs-improvement') {
          vitalScore = 60;
        } else if (metric.rating === 'poor') {
          vitalScore = 20;
        }
        
        score -= (100 - vitalScore) * (weight / 100);
      }
    });

    return Math.max(0, Math.round(score));
  }

  /**
   * Setup periodic reporting
   */
  setupPeriodicReporting() {
    // Report metrics every 5 minutes
    setInterval(() => {
      const summary = this.getPerformanceSummary();
      const score = this.getPerformanceScore();
      
      info('Performance metrics report', {
        score,
        coreWebVitals: this.getCoreWebVitalsSummary(),
        totalMetrics: Object.keys(summary).length
      });
    }, 5 * 60 * 1000);
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics() {
    return {
      coreWebVitals: this.getCoreWebVitalsSummary(),
      allMetrics: this.getPerformanceSummary(),
      performanceScore: this.getPerformanceScore(),
      recentMetrics: this.vitalsBuffer.slice(-50),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cleanup observers and intervals
   */
  cleanup() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (err) {
        // Ignore cleanup errors
      }
    });
    this.observers = [];
    this.isMonitoring = false;
    
    info('Core Web Vitals monitoring cleaned up');
  }

  /**
   * Manual metric recording for custom measurements
   */
  recordCustomMetric(name, value, context = null) {
    this.recordMetric(`CUSTOM_${name}`, value, context);
  }

  /**
   * Start timing a custom operation
   */
  startCustomTiming(name) {
    const key = `custom_timing_${name}`;
    this.customTimings = this.customTimings || new Map();
    this.customTimings.set(key, performance.now());
    return key;
  }

  /**
   * End timing a custom operation
   */
  endCustomTiming(key, context = null) {
    if (!this.customTimings || !this.customTimings.has(key)) {
      warn(`No start time found for custom timing: ${key}`);
      return null;
    }

    const startTime = this.customTimings.get(key);
    const duration = performance.now() - startTime;
    this.customTimings.delete(key);

    const name = key.replace('custom_timing_', '');
    this.recordCustomMetric(name, duration, context);

    return duration;
  }
}

// Create singleton instance
const coreWebVitalsMonitor = new CoreWebVitalsMonitor();

// Export convenience functions
export const getCoreWebVitalsSummary = () => coreWebVitalsMonitor.getCoreWebVitalsSummary();
export const getPerformanceSummary = () => coreWebVitalsMonitor.getPerformanceSummary();
export const getPerformanceScore = () => coreWebVitalsMonitor.getPerformanceScore();
export const recordCustomMetric = (name, value, context) => coreWebVitalsMonitor.recordCustomMetric(name, value, context);
export const startCustomTiming = (name) => coreWebVitalsMonitor.startCustomTiming(name);
export const endCustomTiming = (key, context) => coreWebVitalsMonitor.endCustomTiming(key, context);
export const exportMetrics = () => coreWebVitalsMonitor.exportMetrics();

export default coreWebVitalsMonitor;