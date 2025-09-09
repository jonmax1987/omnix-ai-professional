// Temporarily disable web-vitals to fix build
// import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

interface Metric {
  value: number;
  delta?: number;
  id: string;
  navigationType?: string;
}

// Performance monitoring service with Web Vitals integration
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  navigationType?: string;
  timestamp: number;
}

export interface PerformanceThresholds {
  CLS: { good: number; poor: number };
  FID: { good: number; poor: number };
  FCP: { good: number; poor: number };
  LCP: { good: number; poor: number };
  TTFB: { good: number; poor: number };
  [key: string]: { good: number; poor: number };
}

class PerformanceMonitoringService {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private reportCallback?: (metrics: PerformanceMetric[]) => void;
  private analyticsEnabled: boolean = true;
  private debugMode: boolean = false;
  private lastAnalyticsSent: number = 0;
  
  // Web Vitals thresholds based on Google's recommendations
  private readonly thresholds: PerformanceThresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 }
  };

  constructor() {
    this.initializeMonitoring();
  }

  // Initialize performance monitoring
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor Web Vitals
    this.monitorWebVitals();
    
    // Monitor custom metrics
    this.monitorCustomMetrics();
    
    // Monitor resource timing
    this.monitorResourceTiming();
    
    // Monitor long tasks
    this.monitorLongTasks();
    
    // Monitor memory usage (if available)
    this.monitorMemoryUsage();
  }

  // Monitor Core Web Vitals (temporarily disabled)
  private monitorWebVitals(): void {
    // TODO: Fix web-vitals import compatibility
    console.log('[Performance] Web Vitals monitoring temporarily disabled');
  }

  // Handle Web Vital metric
  private handleWebVital(metric: Metric, name: string): void {
    const rating = this.getRating(name, metric.value);
    
    const performanceMetric: PerformanceMetric = {
      name,
      value: metric.value,
      rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now()
    };

    this.metrics.set(name, performanceMetric);
    
    if (this.debugMode) {
      console.log(`[Performance] ${name}:`, performanceMetric);
    }

    // Send to analytics
    this.sendToAnalytics(performanceMetric);
    
    // Report if callback is set
    if (this.reportCallback) {
      this.reportCallback([performanceMetric]);
    }
  }

  // Get rating based on thresholds
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.thresholds[name];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Monitor custom performance metrics
  private monitorCustomMetrics(): void {
    // Time to Interactive (custom implementation)
    this.measureTimeToInteractive();
    
    // First Meaningful Paint (custom)
    this.measureFirstMeaningfulPaint();
    
    // Component render times
    this.measureComponentRenderTimes();
    
    // API response times
    this.measureApiResponseTimes();
  }

  // Measure Time to Interactive
  private measureTimeToInteractive(): void {
    if (!window.performance || !window.performance.timing) return;
    
    const timing = window.performance.timing;
    const tti = timing.domInteractive - timing.navigationStart;
    
    this.recordMetric('TTI', tti, { good: 3800, poor: 7300 });
  }

  // Measure First Meaningful Paint
  private measureFirstMeaningfulPaint(): void {
    if (!window.performance) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fmpEntry = entries.find(entry => 
        entry.name === 'first-meaningful-paint'
      );
      
      if (fmpEntry) {
        this.recordMetric('FMP', fmpEntry.startTime, { good: 2000, poor: 4000 });
        observer.disconnect();
      }
    });
    
    try {
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('FMP', observer);
    } catch (e) {
      // Observer not supported
    }
  }

  // Measure component render times
  private measureComponentRenderTimes(): void {
    // This would integrate with React DevTools Profiler API
    // For production, we'd use React.Profiler components
  }

  // Measure API response times
  private measureApiResponseTimes(): void {
    if (!window.performance) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('/api/') || entry.name.includes('/v1/')) {
          const duration = entry.duration;
          this.recordMetric(
            `API_${entry.name.split('/').pop()}`,
            duration,
            { good: 200, poor: 1000 }
          );
        }
      });
    });
    
    try {
      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('API', observer);
    } catch (e) {
      // Observer not supported
    }
  }

  // Monitor resource timing
  private monitorResourceTiming(): void {
    if (!window.performance) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        // Track large resources
        if (entry.transferSize > 500000) { // > 500KB
          this.recordMetric(
            `LargeResource_${entry.initiatorType}`,
            entry.transferSize,
            { good: 500000, poor: 1000000 }
          );
        }
        
        // Track slow resources
        if (entry.duration > 1000) { // > 1 second
          this.recordMetric(
            `SlowResource_${entry.initiatorType}`,
            entry.duration,
            { good: 500, poor: 2000 }
          );
        }
      });
    });
    
    try {
      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('Resource', observer);
    } catch (e) {
      // Observer not supported
    }
  }

  // Monitor long tasks
  private monitorLongTasks(): void {
    if (!window.PerformanceObserver) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.duration > 50) { // Long task threshold
          this.recordMetric(
            'LongTask',
            entry.duration,
            { good: 50, poor: 100 }
          );
          
          if (this.debugMode) {
            console.warn('[Performance] Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        }
      });
    });
    
    try {
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('LongTask', observer);
    } catch (e) {
      // Long task observer not supported
    }
  }

  // Monitor memory usage
  private monitorMemoryUsage(): void {
    if (!(window.performance as any).memory) return;
    
    setInterval(() => {
      const memory = (window.performance as any).memory;
      
      const usedJSHeapSize = memory.usedJSHeapSize / 1048576; // Convert to MB
      const totalJSHeapSize = memory.totalJSHeapSize / 1048576;
      const limit = memory.jsHeapSizeLimit / 1048576;
      
      this.recordMetric(
        'MemoryUsage',
        usedJSHeapSize,
        { good: 50, poor: 100 }
      );
      
      // Check for potential memory leak
      const usage = (usedJSHeapSize / limit) * 100;
      if (usage > 90) {
        console.warn('[Performance] High memory usage detected:', {
          used: usedJSHeapSize.toFixed(2) + 'MB',
          total: totalJSHeapSize.toFixed(2) + 'MB',
          limit: limit.toFixed(2) + 'MB',
          usage: usage.toFixed(2) + '%'
        });
      }
    }, 30000); // Check every 30 seconds
  }

  // Record a custom metric
  public recordMetric(
    name: string,
    value: number,
    thresholds?: { good: number; poor: number }
  ): void {
    const threshold = thresholds || { good: 100, poor: 300 };
    const rating = this.getRating(name, value);
    
    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      id: `${name}_${Date.now()}`,
      timestamp: Date.now()
    };
    
    this.metrics.set(name, metric);
    
    if (this.debugMode) {
      console.log(`[Performance] Custom metric ${name}:`, metric);
    }
    
    this.sendToAnalytics(metric);
  }

  // Mark performance timing
  public mark(name: string): void {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  }

  // Measure between marks
  public measure(name: string, startMark: string, endMark?: string): void {
    if (window.performance && window.performance.measure) {
      try {
        const measure = endMark
          ? window.performance.measure(name, startMark, endMark)
          : window.performance.measure(name, startMark);
        
        if (measure) {
          this.recordMetric(name, measure.duration);
        }
      } catch (e) {
        console.error('[Performance] Measure error:', e);
      }
    }
  }

  // Send metrics to analytics service
  private sendToAnalytics(metric: PerformanceMetric): void {
    if (!this.analyticsEnabled) return;
    
    // Send to Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_delta: metric.delta
      });
    }
    
    // Send to custom analytics endpoint
    // CRITICAL FIX: Only send analytics in NON-production to prevent API spam
    if (import.meta.env.VITE_NODE_ENV !== 'production' && this.analyticsEnabled) {
      // Rate limit: Only send analytics every 30 seconds max
      const now = Date.now();
      if (!this.lastAnalyticsSent || now - this.lastAnalyticsSent > 30000) {
        this.lastAnalyticsSent = now;
        this.sendToEndpoint(metric);
      }
    }
  }

  // Send metrics to backend endpoint
  private async sendToEndpoint(metric: PerformanceMetric): Promise<void> {
    try {
      // Use environment variable for API base URL, fallback to relative path
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const endpoint = `${apiBaseUrl}/analytics/performance`;
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'omnix-api-key-development-2024'
        },
        body: JSON.stringify({
          metrics: metric,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: metric.timestamp
        })
      });
    } catch (error) {
      // Silently fail in production
      if (this.debugMode) {
        console.error('[Performance] Failed to send metric:', error);
      }
    }
  }

  // Get all collected metrics
  public getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // Get specific metric
  public getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  // Clear all metrics
  public clearMetrics(): void {
    this.metrics.clear();
  }

  // Set report callback
  public onReport(callback: (metrics: PerformanceMetric[]) => void): void {
    this.reportCallback = callback;
  }

  // Enable/disable analytics
  public setAnalyticsEnabled(enabled: boolean): void {
    this.analyticsEnabled = enabled;
  }

  // Enable/disable debug mode
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  // Generate performance report
  public generateReport(): {
    metrics: PerformanceMetric[];
    summary: {
      good: number;
      needsImprovement: number;
      poor: number;
    };
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    
    const summary = {
      good: metrics.filter(m => m.rating === 'good').length,
      needsImprovement: metrics.filter(m => m.rating === 'needs-improvement').length,
      poor: metrics.filter(m => m.rating === 'poor').length
    };
    
    const recommendations: string[] = [];
    
    // Generate recommendations based on metrics
    metrics.forEach(metric => {
      if (metric.rating === 'poor') {
        recommendations.push(this.getRecommendation(metric));
      }
    });
    
    return { metrics, summary, recommendations };
  }

  // Get recommendation for poor metric
  private getRecommendation(metric: PerformanceMetric): string {
    const recommendations: Record<string, string> = {
      CLS: 'Reduce layout shifts by setting dimensions for images and ads',
      FID: 'Optimize JavaScript execution and reduce main thread blocking',
      FCP: 'Reduce server response time and optimize critical rendering path',
      LCP: 'Optimize images, fonts, and reduce JavaScript blocking time',
      TTFB: 'Improve server response time, use CDN, and enable caching',
      TTI: 'Reduce JavaScript payload and optimize code execution',
      FMP: 'Prioritize visible content and optimize critical resources',
      MemoryUsage: 'Check for memory leaks and optimize component lifecycle',
      LongTask: 'Break up long-running JavaScript into smaller chunks'
    };
    
    return recommendations[metric.name] || 
           `Optimize ${metric.name} - current value: ${metric.value.toFixed(2)}`;
  }

  // Cleanup
  public destroy(): void {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Clear metrics
    this.metrics.clear();
    
    // Clear callbacks
    this.reportCallback = undefined;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitoringService();

// Export instance and class
export { performanceMonitor, PerformanceMonitoringService };

// React hook for performance monitoring
export function usePerformanceMonitoring(
  componentName: string,
  enabled: boolean = true
): {
  markStart: (label?: string) => void;
  markEnd: (label?: string) => void;
  measure: (name: string, startMark: string, endMark?: string) => void;
  metrics: PerformanceMetric[];
} {
  const markStart = (label?: string) => {
    if (enabled) {
      performanceMonitor.mark(`${componentName}_${label || 'start'}`);
    }
  };
  
  const markEnd = (label?: string) => {
    if (enabled) {
      performanceMonitor.mark(`${componentName}_${label || 'end'}`);
    }
  };
  
  const measure = (name: string, startMark: string, endMark?: string) => {
    if (enabled) {
      performanceMonitor.measure(name, startMark, endMark);
    }
  };
  
  const metrics = performanceMonitor.getMetrics();
  
  return { markStart, markEnd, measure, metrics };
}