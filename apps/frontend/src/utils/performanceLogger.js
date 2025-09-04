/**
 * OMNIX AI - Performance Logger
 * Production-optimized logging system with performance metrics tracking
 * Replaces console logging with efficient, configurable logging
 */

class PerformanceLogger {
  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.isDevelopment = import.meta.env.DEV;
    this.logLevel = this.isProduction ? 'warn' : 'debug';
    this.maxLogEntries = 1000;
    this.logBuffer = [];
    this.performanceMetrics = new Map();
    this.startTimes = new Map();
    
    // Log levels hierarchy
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4
    };

    // Performance thresholds
    this.thresholds = {
      api: 2000,      // 2 seconds for API calls
      ui: 100,        // 100ms for UI operations
      worker: 500,    // 500ms for worker operations
      memory: 50 * 1024 * 1024  // 50MB memory usage
    };

    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring() {
    if (typeof performance !== 'undefined') {
      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) { // Tasks longer than 50ms
                this.warn('Long task detected', {
                  name: entry.name,
                  duration: entry.duration,
                  startTime: entry.startTime
                });
              }
            }
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch (error) {
          // PerformanceObserver not supported
        }
      }
    }

    // Clean up log buffer periodically
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Check if log level should be output
   */
  shouldLog(level) {
    return this.logLevels[level] >= this.logLevels[this.logLevel];
  }

  /**
   * Create log entry
   */
  createLogEntry(level, message, data = null, context = null) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      message,
      data,
      context,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    };

    // Add performance info if available
    if (typeof performance !== 'undefined' && performance.memory) {
      entry.memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }

    return entry;
  }

  /**
   * Add log entry to buffer
   */
  addToBuffer(entry) {
    this.logBuffer.push(entry);
    
    // Limit buffer size
    if (this.logBuffer.length > this.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-Math.floor(this.maxLogEntries * 0.8));
    }
  }

  /**
   * Debug logging (development only)
   */
  debug(message, data = null, context = null) {
    if (!this.shouldLog('debug')) return;

    const entry = this.createLogEntry('debug', message, data, context);
    this.addToBuffer(entry);

    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Info logging
   */
  info(message, data = null, context = null) {
    if (!this.shouldLog('info')) return;

    const entry = this.createLogEntry('info', message, data, context);
    this.addToBuffer(entry);

    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  /**
   * Warning logging
   */
  warn(message, data = null, context = null) {
    if (!this.shouldLog('warn')) return;

    const entry = this.createLogEntry('warn', message, data, context);
    this.addToBuffer(entry);

    console.warn(`[WARN] ${message}`, data || '');
  }

  /**
   * Error logging
   */
  error(message, error = null, context = null) {
    const entry = this.createLogEntry('error', message, {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null
    }, context);
    
    this.addToBuffer(entry);
    console.error(`[ERROR] ${message}`, error || '');

    // Send error to monitoring service in production
    if (this.isProduction) {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * Critical error logging
   */
  critical(message, error = null, context = null) {
    const entry = this.createLogEntry('critical', message, {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null
    }, context);
    
    this.addToBuffer(entry);
    console.error(`[CRITICAL] ${message}`, error || '');

    // Always send critical errors to monitoring
    this.sendToMonitoring(entry);
  }

  /**
   * Performance timing utilities
   */
  startTiming(key, context = null) {
    this.startTimes.set(key, {
      start: performance.now(),
      context
    });
  }

  endTiming(key, threshold = null) {
    const timing = this.startTimes.get(key);
    if (!timing) {
      this.warn(`No start time found for key: ${key}`);
      return null;
    }

    const duration = performance.now() - timing.start;
    const metric = {
      key,
      duration,
      context: timing.context,
      timestamp: Date.now()
    };

    // Store performance metric
    this.performanceMetrics.set(key, metric);
    this.startTimes.delete(key);

    // Check against threshold
    const appliedThreshold = threshold || this.getThresholdForKey(key);
    if (appliedThreshold && duration > appliedThreshold) {
      this.warn(`Performance threshold exceeded for ${key}`, {
        duration: `${duration.toFixed(2)}ms`,
        threshold: `${appliedThreshold}ms`,
        context: timing.context
      });
    }

    this.debug(`Performance timing: ${key}`, {
      duration: `${duration.toFixed(2)}ms`,
      context: timing.context
    });

    return metric;
  }

  /**
   * Get appropriate threshold for timing key
   */
  getThresholdForKey(key) {
    if (key.includes('api') || key.includes('request')) return this.thresholds.api;
    if (key.includes('ui') || key.includes('render')) return this.thresholds.ui;
    if (key.includes('worker')) return this.thresholds.worker;
    return null;
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation, duration, context = null) {
    const metric = {
      operation,
      duration,
      context,
      timestamp: Date.now()
    };

    this.performanceMetrics.set(`${operation}-${Date.now()}`, metric);

    if (duration > 100) { // Log slow operations
      this.warn(`Slow operation detected: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        context
      });
    } else {
      this.debug(`Performance: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        context
      });
    }
  }

  /**
   * Memory usage monitoring
   */
  checkMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.totalJSHeapSize;
      
      if (used > this.thresholds.memory) {
        this.warn('High memory usage detected', {
          used: `${(used / 1024 / 1024).toFixed(2)}MB`,
          total: `${(total / 1024 / 1024).toFixed(2)}MB`,
          percentage: `${((used / total) * 100).toFixed(2)}%`
        });
      }

      return { used, total, percentage: (used / total) * 100 };
    }
    return null;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const metrics = Array.from(this.performanceMetrics.values());
    const recentMetrics = metrics.filter(m => Date.now() - m.timestamp < 60000); // Last minute

    if (recentMetrics.length === 0) {
      return { message: 'No recent performance data' };
    }

    const durations = recentMetrics.map(m => m.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const slowOperations = recentMetrics.filter(m => m.duration > 100);

    return {
      totalOperations: recentMetrics.length,
      averageDuration: avgDuration.toFixed(2),
      maxDuration: maxDuration.toFixed(2),
      slowOperations: slowOperations.length,
      memoryUsage: this.checkMemoryUsage()
    };
  }

  /**
   * Get recent logs
   */
  getRecentLogs(level = null, limit = 50) {
    let logs = this.logBuffer;
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }

    return logs
      .slice(-limit)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Send critical logs to monitoring service
   */
  async sendToMonitoring(entry) {
    if (!this.isProduction) return;

    try {
      // In a real implementation, this would send to your monitoring service
      // For now, we'll just store it
      const monitoringData = {
        ...entry,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };

      // Store in localStorage for later retrieval
      const existingLogs = JSON.parse(localStorage.getItem('omnix-error-logs') || '[]');
      existingLogs.push(monitoringData);
      
      // Keep only last 100 error logs
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('omnix-error-logs', JSON.stringify(existingLogs));
    } catch (error) {
      // Silent fail for monitoring
    }
  }

  /**
   * Cleanup old logs and metrics
   */
  cleanup() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Clean up old performance metrics
    for (const [key, metric] of this.performanceMetrics.entries()) {
      if (metric.timestamp < oneHourAgo) {
        this.performanceMetrics.delete(key);
      }
    }

    // Clean up old logs
    this.logBuffer = this.logBuffer.filter(log => 
      new Date(log.timestamp).getTime() > oneHourAgo
    );

    this.debug('Logger cleanup completed', {
      metricsCount: this.performanceMetrics.size,
      logCount: this.logBuffer.length
    });
  }

  /**
   * Export logs for debugging
   */
  exportLogs() {
    return {
      logs: this.logBuffer,
      metrics: Array.from(this.performanceMetrics.values()),
      summary: this.getPerformanceSummary(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Set log level
   */
  setLogLevel(level) {
    if (this.logLevels.hasOwnProperty(level)) {
      this.logLevel = level;
      this.info(`Log level changed to: ${level}`);
    } else {
      this.error(`Invalid log level: ${level}`);
    }
  }
}

// Create singleton instance
const logger = new PerformanceLogger();

// Export convenience methods
export const debug = (message, data, context) => logger.debug(message, data, context);
export const info = (message, data, context) => logger.info(message, data, context);
export const warn = (message, data, context) => logger.warn(message, data, context);
export const error = (message, error, context) => logger.error(message, error, context);
export const critical = (message, error, context) => logger.critical(message, error, context);

export const startTiming = (key, context) => logger.startTiming(key, context);
export const endTiming = (key, threshold) => logger.endTiming(key, threshold);
export const logPerformance = (operation, duration, context) => logger.logPerformance(operation, duration, context);

export const getPerformanceSummary = () => logger.getPerformanceSummary();
export const getRecentLogs = (level, limit) => logger.getRecentLogs(level, limit);
export const checkMemoryUsage = () => logger.checkMemoryUsage();

export default logger;