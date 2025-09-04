import * as Sentry from '@sentry/react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Configuration
const MONITORING_CONFIG = {
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    enabled: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true'
  },
  performance: {
    enabled: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
    sampleRate: parseFloat(import.meta.env.VITE_PERFORMANCE_SAMPLE_RATE || '0.1')
  }
};

// Initialize Sentry
export function initializeErrorTracking() {
  if (!MONITORING_CONFIG.sentry.enabled || !MONITORING_CONFIG.sentry.dsn) {
    // console.log('Error tracking disabled or DSN not configured');
    return;
  }

  Sentry.init({
    dsn: MONITORING_CONFIG.sentry.dsn,
    environment: MONITORING_CONFIG.sentry.environment,
    
    // Performance monitoring
    tracesSampleRate: MONITORING_CONFIG.performance.sampleRate,
    
    // Session replay (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integration configuration
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.browserProfilingIntegration()
    ],

    // Filter out development errors
    beforeSend(event) {
      // Don't send events in development
      if (import.meta.env.DEV) {
        console.warn('Sentry event (development):', event);
        return null;
      }

      // Filter out common non-critical errors
      const error = event.exception?.values?.[0];
      if (error) {
        const message = error.value || '';
        
        // Filter out common browser extension errors
        if (message.includes('Non-Error promise rejection captured') ||
            message.includes('Script error') ||
            message.includes('ResizeObserver loop limit exceeded')) {
          return null;
        }
      }

      return event;
    },

    // Custom error tags
    initialScope: {
      tags: {
        component: 'omnix-ai-react',
        version: import.meta.env.PACKAGE_VERSION || '1.0.0'
      }
    }
  });

  // console.log('Error tracking initialized');
}

// Web Vitals monitoring
export function initializePerformanceMonitoring() {
  if (!MONITORING_CONFIG.performance.enabled) {
    // console.log('Performance monitoring disabled');
    return;
  }

  // Core Web Vitals
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics); // INP replaced FID in web-vitals v3+
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);

  // Custom performance metrics
  measureCustomMetrics();
  
  // console.log('Performance monitoring initialized');
}

function sendToAnalytics({ name, value, id, delta }) {
  // Send to Sentry
  if (MONITORING_CONFIG.sentry.enabled) {
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${name}: ${value}`,
      level: 'info',
      data: { name, value, id, delta }
    });
  }

  // Send to custom analytics endpoint
  if (typeof gtag !== 'undefined') {
    gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true
    });
  }

  // Send to CloudWatch via API
  sendToCloudWatch({
    metricName: name,
    value: value,
    unit: getMetricUnit(name),
    dimensions: {
      Environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      Page: window.location.pathname
    }
  });

  console.log(`${name}: ${value}`, { id, delta });
}

function getMetricUnit(metricName) {
  switch (metricName) {
    case 'CLS':
      return 'None';
    case 'LCP':
    case 'FCP':
    case 'FID':
    case 'INP':
    case 'TTFB':
      return 'Milliseconds';
    default:
      return 'None';
  }
}

async function sendToCloudWatch(metric) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.omnix-ai.com';
    
    await fetch(`${apiUrl}/monitoring/web-vitals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...metric
      })
    });
  } catch (error) {
    // Don't log monitoring failures in production
    if (import.meta.env.DEV) {
      console.warn('Failed to send metric to CloudWatch:', error);
    }
  }
}

function measureCustomMetrics() {
  // Measure time to interactive
  if ('performance' in window && 'PerformanceObserver' in window) {
    // Navigation timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const metrics = {
            'dns-lookup': entry.domainLookupEnd - entry.domainLookupStart,
            'tcp-connect': entry.connectEnd - entry.connectStart,
            'tls-negotiation': entry.secureConnectionStart ? entry.connectEnd - entry.secureConnectionStart : 0,
            'request-response': entry.responseEnd - entry.requestStart,
            'dom-parsing': entry.domContentLoadedEventStart - entry.responseEnd,
            'resource-loading': entry.loadEventStart - entry.domContentLoadedEventStart,
          };

          Object.entries(metrics).forEach(([metric, value]) => {
            if (value > 0) {
              sendToAnalytics({
                name: `navigation-${metric}`,
                value,
                id: `nav-${Date.now()}`,
                delta: value
              });
            }
          });
        }
      }
    });

    navObserver.observe({ entryTypes: ['navigation'] });

    // Resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track slow resources
        if (entry.duration > 1000) {
          sendToAnalytics({
            name: 'slow-resource',
            value: entry.duration,
            id: entry.name,
            delta: entry.duration
          });
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
  }
}

// Error boundary reporting
export function reportError(error, errorInfo = {}) {
  if (MONITORING_CONFIG.sentry.enabled) {
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
      Sentry.captureException(error);
    });
  } else {
    console.error('Error caught by boundary:', error, errorInfo);
  }
}

// User feedback
export function reportUserFeedback(feedback) {
  if (MONITORING_CONFIG.sentry.enabled) {
    // captureUserFeedback is deprecated in newer Sentry versions
    // Use addBreadcrumb instead for user feedback
    Sentry.addBreadcrumb({
      category: 'user-feedback',
      message: feedback.message || 'User feedback provided',
      level: 'info',
      data: {
        name: feedback.name || 'Anonymous',
        email: feedback.email || '',
        comments: feedback.message
      }
    });
  }
}

// Custom event tracking
export function trackEvent(eventName, properties = {}) {
  if (MONITORING_CONFIG.sentry.enabled) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: eventName,
      level: 'info',
      data: properties
    });
  }

  // Custom analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, properties);
  }

  // console.log(`Event: ${eventName}`, properties);
}

// Performance marks
export function markPerformance(name) {
  if ('performance' in window) {
    performance.mark(name);
  }
}

export function measurePerformance(name, startMark, endMark) {
  if ('performance' in window) {
    try {
      const measure = performance.measure(name, startMark, endMark);
      sendToAnalytics({
        name: `custom-${name}`,
        value: measure.duration,
        id: `measure-${Date.now()}`,
        delta: measure.duration
      });
      return measure.duration;
    } catch (error) {
      console.warn('Could not measure performance:', error);
    }
  }
  return null;
}

// Network information tracking
export function trackNetworkInfo() {
  if ('navigator' in window && 'connection' in navigator) {
    const connection = navigator.connection;
    
    trackEvent('network-info', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });
  }
}

// Device information tracking
export function trackDeviceInfo() {
  const deviceInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    platform: navigator.platform,
    vendor: navigator.vendor,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };

  if (MONITORING_CONFIG.sentry.enabled) {
    Sentry.setContext('device', deviceInfo);
  }

  return deviceInfo;
}

// Initialize monitoring
export function initializeMonitoring() {
  initializeErrorTracking();
  initializePerformanceMonitoring();
  trackNetworkInfo();
  trackDeviceInfo();
}

// Export Sentry for error boundaries
export { Sentry };

export default {
  init: initializeMonitoring,
  reportError,
  reportUserFeedback,
  trackEvent,
  markPerformance,
  measurePerformance,
  trackNetworkInfo,
  trackDeviceInfo
};