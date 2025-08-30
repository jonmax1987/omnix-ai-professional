// Enhanced Error Handling Service
// Implementation of API-009: Error handling and retry mechanisms
import { ApiError } from './httpClient';

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Error categories for better classification
 */
export const ErrorCategory = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  BUSINESS_LOGIC: 'business_logic',
  RATE_LIMIT: 'rate_limit',
  SERVER_ERROR: 'server_error',
  CLIENT_ERROR: 'client_error',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

/**
 * Error context for tracking and debugging
 */
class ErrorContext {
  constructor(options = {}) {
    this.timestamp = Date.now();
    this.requestId = options.requestId || this.generateRequestId();
    this.userId = options.userId || null;
    this.sessionId = options.sessionId || this.getSessionId();
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    this.url = typeof window !== 'undefined' ? window.location.href : null;
    this.component = options.component || null;
    this.action = options.action || null;
    this.metadata = options.metadata || {};
  }

  generateRequestId() {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  getSessionId() {
    if (typeof sessionStorage !== 'undefined') {
      let sessionId = sessionStorage.getItem('error_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem('error_session_id', sessionId);
      }
      return sessionId;
    }
    return null;
  }
}

/**
 * Enhanced Error class with additional context and handling capabilities
 */
export class EnhancedError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'EnhancedError';
    this.code = options.code || 'UNKNOWN_ERROR';
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.context = new ErrorContext(options.context);
    this.originalError = options.originalError || null;
    this.data = options.data || null;
    this.recoverable = options.recoverable !== false; // Default to recoverable
    this.userMessage = options.userMessage || this.generateUserMessage();
    this.shouldRetry = options.shouldRetry !== false;
    this.retryAfter = options.retryAfter || null;
    this.suggestions = options.suggestions || [];
  }

  /**
   * Generate user-friendly error message
   */
  generateUserMessage() {
    const userMessages = {
      [ErrorCategory.NETWORK]: 'Connection problem. Please check your internet connection.',
      [ErrorCategory.AUTHENTICATION]: 'Please log in again to continue.',
      [ErrorCategory.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
      [ErrorCategory.TIMEOUT]: 'Request timed out. Please try again.',
      [ErrorCategory.SERVER_ERROR]: 'Server error. Please try again later.',
      [ErrorCategory.CLIENT_ERROR]: 'Invalid request. Please check your input.'
    };

    return userMessages[this.category] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Convert to JSON for logging/reporting
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      context: this.context,
      userMessage: this.userMessage,
      recoverable: this.recoverable,
      shouldRetry: this.shouldRetry,
      retryAfter: this.retryAfter,
      suggestions: this.suggestions,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : null
    };
  }
}

/**
 * Retry configuration and strategies
 */
export class RetryConfig {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.strategy = options.strategy || 'exponential'; // 'linear', 'exponential', 'fixed'
    this.jitter = options.jitter !== false; // Add randomization
    this.retryableErrors = options.retryableErrors || [
      ErrorCategory.NETWORK,
      ErrorCategory.TIMEOUT,
      ErrorCategory.SERVER_ERROR,
      ErrorCategory.RATE_LIMIT
    ];
  }

  /**
   * Calculate delay for retry attempt
   */
  calculateDelay(attempt) {
    let delay;

    switch (this.strategy) {
      case 'linear':
        delay = this.baseDelay * attempt;
        break;
      case 'exponential':
        delay = this.baseDelay * Math.pow(2, attempt - 1);
        break;
      case 'fixed':
      default:
        delay = this.baseDelay;
        break;
    }

    // Add jitter to prevent thundering herd
    if (this.jitter) {
      delay = delay + (Math.random() * delay * 0.1);
    }

    return Math.min(delay, this.maxDelay);
  }

  /**
   * Check if error is retryable
   */
  shouldRetry(error, attempt) {
    if (attempt >= this.maxAttempts) return false;
    if (!error.shouldRetry) return false;
    return this.retryableErrors.includes(error.category);
  }
}

/**
 * Error Handler Service
 */
class ErrorHandlingService {
  constructor() {
    this.handlers = new Map();
    this.interceptors = [];
    this.reportingCallbacks = [];
    this.retryConfig = new RetryConfig();
    this.errorQueue = [];
    this.reportingEnabled = true;
    this.debugMode = import.meta.env.DEV;
  }

  /**
   * Register error handler for specific error types
   */
  registerHandler(category, handler) {
    if (!this.handlers.has(category)) {
      this.handlers.set(category, []);
    }
    this.handlers.get(category).push(handler);
  }

  /**
   * Add error interceptor
   */
  addInterceptor(interceptor) {
    this.interceptors.push(interceptor);
  }

  /**
   * Add reporting callback
   */
  onError(callback) {
    this.reportingCallbacks.push(callback);
  }

  /**
   * Handle error with comprehensive processing
   */
  async handleError(error, context = {}) {
    try {
      // Convert to EnhancedError if needed
      const enhancedError = this.enhanceError(error, context);

      // Run interceptors
      for (const interceptor of this.interceptors) {
        try {
          const result = await interceptor(enhancedError);
          if (result === false) return; // Interceptor handled the error
        } catch (interceptorError) {
          console.error('Error interceptor failed:', interceptorError);
        }
      }

      // Run specific handlers
      const handlers = this.handlers.get(enhancedError.category) || [];
      for (const handler of handlers) {
        try {
          await handler(enhancedError);
        } catch (handlerError) {
          console.error('Error handler failed:', handlerError);
        }
      }

      // Report error
      this.reportError(enhancedError);

      // Log in debug mode
      if (this.debugMode) {
        console.group('🚨 Error Details');
        console.error('Error:', enhancedError.message);
        console.error('Code:', enhancedError.code);
        console.error('Category:', enhancedError.category);
        console.error('Severity:', enhancedError.severity);
        console.error('Context:', enhancedError.context);
        console.error('Full Error:', enhancedError.toJSON());
        console.groupEnd();
      }

      return enhancedError;
    } catch (handlingError) {
      console.error('Error handling failed:', handlingError);
      return error;
    }
  }

  /**
   * Convert any error to EnhancedError
   */
  enhanceError(error, context = {}) {
    if (error instanceof EnhancedError) {
      return error;
    }

    let category = ErrorCategory.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let code = 'UNKNOWN_ERROR';
    let shouldRetry = true;
    let retryAfter = null;

    if (error instanceof ApiError) {
      code = error.code;
      
      // Categorize based on status code
      if (error.status === 401) {
        category = ErrorCategory.AUTHENTICATION;
        severity = ErrorSeverity.HIGH;
        shouldRetry = false;
      } else if (error.status === 403) {
        category = ErrorCategory.AUTHORIZATION;
        severity = ErrorSeverity.HIGH;
        shouldRetry = false;
      } else if (error.status === 400) {
        category = ErrorCategory.VALIDATION;
        severity = ErrorSeverity.MEDIUM;
        shouldRetry = false;
      } else if (error.status === 408) {
        category = ErrorCategory.TIMEOUT;
        severity = ErrorSeverity.MEDIUM;
      } else if (error.status === 429) {
        category = ErrorCategory.RATE_LIMIT;
        severity = ErrorSeverity.MEDIUM;
        retryAfter = error.data?.retryAfter || 60000;
      } else if (error.status >= 500) {
        category = ErrorCategory.SERVER_ERROR;
        severity = ErrorSeverity.HIGH;
      } else if (error.status >= 400) {
        category = ErrorCategory.CLIENT_ERROR;
        severity = ErrorSeverity.MEDIUM;
        shouldRetry = false;
      }
      
      if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
        category = ErrorCategory.NETWORK;
      }
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      category = ErrorCategory.NETWORK;
      code = 'NETWORK_ERROR';
    } else if (error.name === 'AbortError') {
      category = ErrorCategory.TIMEOUT;
      code = 'REQUEST_ABORTED';
    }

    return new EnhancedError(error.message, {
      code,
      category,
      severity,
      context,
      originalError: error,
      shouldRetry,
      retryAfter
    });
  }

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation(operation, config = null) {
    const retryConfig = config || this.retryConfig;
    let lastError;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.enhanceError(error);
        
        if (!retryConfig.shouldRetry(lastError, attempt)) {
          break;
        }

        if (attempt < retryConfig.maxAttempts) {
          const delay = lastError.retryAfter || retryConfig.calculateDelay(attempt);
          
          if (this.debugMode) {
            console.log(`Retrying operation (attempt ${attempt}/${retryConfig.maxAttempts}) in ${delay}ms`);
          }
          
          await this.delay(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Circuit breaker implementation
   */
  createCircuitBreaker(operation, options = {}) {
    const {
      failureThreshold = 5,
      timeout = 60000,
      retryTimeout = 60000
    } = options;

    let failureCount = 0;
    let lastFailureTime = null;
    let state = 'closed'; // closed, open, half-open

    return async (...args) => {
      if (state === 'open') {
        if (Date.now() - lastFailureTime < retryTimeout) {
          throw new EnhancedError('Circuit breaker is open', {
            code: 'CIRCUIT_BREAKER_OPEN',
            category: ErrorCategory.SERVER_ERROR,
            severity: ErrorSeverity.HIGH,
            shouldRetry: false
          });
        } else {
          state = 'half-open';
        }
      }

      try {
        const result = await Promise.race([
          operation(...args),
          this.delay(timeout).then(() => {
            throw new EnhancedError('Circuit breaker timeout', {
              code: 'CIRCUIT_BREAKER_TIMEOUT',
              category: ErrorCategory.TIMEOUT,
              severity: ErrorSeverity.HIGH
            });
          })
        ]);

        // Success - reset circuit breaker
        failureCount = 0;
        state = 'closed';
        return result;
      } catch (error) {
        failureCount++;
        lastFailureTime = Date.now();

        if (failureCount >= failureThreshold) {
          state = 'open';
        }

        throw this.enhanceError(error);
      }
    };
  }

  /**
   * Report error to logging/monitoring services
   */
  reportError(error) {
    if (!this.reportingEnabled) return;

    // Add to queue
    this.errorQueue.push({
      ...error.toJSON(),
      reportedAt: Date.now()
    });

    // Trigger reporting callbacks
    this.reportingCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error reporting callback failed:', callbackError);
      }
    });

    // Batch send errors periodically
    this.scheduleErrorReporting();
  }

  /**
   * Schedule batch error reporting
   */
  scheduleErrorReporting() {
    if (this.reportingTimeout) return;

    this.reportingTimeout = setTimeout(() => {
      this.sendErrorBatch();
      this.reportingTimeout = null;
    }, 5000); // Send batch every 5 seconds
  }

  /**
   * Send error batch to monitoring service
   */
  async sendErrorBatch() {
    if (this.errorQueue.length === 0) return;

    const errors = this.errorQueue.splice(0);
    
    try {
      // For now, disable external error reporting since backend endpoint doesn't exist
      // Just log errors in debug mode
      if (this.debugMode) {
        console.group('🚨 Error Batch Report');
        console.log(`Reporting ${errors.length} errors:`, errors);
        console.groupEnd();
      }
      
      // TODO: Implement backend error reporting endpoint at /v1/errors/report
      // When ready, uncomment and use httpClient:
      // import httpClient from './httpClient';
      // await httpClient.post('/errors/report', {
      //   errors,
      //   batch: {
      //     id: `batch_${Date.now()}`,
      //     size: errors.length,
      //     timestamp: Date.now()
      //   }
      // });
    } catch (reportingError) {
      // Silently fail error reporting to avoid infinite loops
      if (this.debugMode) {
        console.warn('Error reporting failed:', reportingError);
      }
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errorQueue.length,
      errorsByCategory: {},
      errorsBySeverity: {},
      recentErrors: this.errorQueue.slice(-10)
    };

    this.errorQueue.forEach(error => {
      stats.errorsByCategory[error.category] = (stats.errorsByCategory[error.category] || 0) + 1;
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error queue
   */
  clearErrors() {
    this.errorQueue = [];
  }

  /**
   * Set retry configuration
   */
  setRetryConfig(config) {
    this.retryConfig = new RetryConfig(config);
  }

  /**
   * Enable/disable error reporting
   */
  setReportingEnabled(enabled) {
    this.reportingEnabled = enabled;
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create error boundary wrapper for components
   */
  createErrorBoundary(fallbackComponent) {
    return {
      componentDidCatch: (error, errorInfo) => {
        this.handleError(error, {
          component: errorInfo.componentStack,
          action: 'component_render',
          metadata: errorInfo
        });
      },
      fallback: fallbackComponent
    };
  }

  /**
   * Cleanup method
   */
  cleanup() {
    if (this.reportingTimeout) {
      clearTimeout(this.reportingTimeout);
      this.reportingTimeout = null;
    }
    this.sendErrorBatch(); // Send any remaining errors
  }
}

// Create singleton instance
const errorHandlingService = new ErrorHandlingService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    errorHandlingService.cleanup();
  });

  // Global error handlers
  window.addEventListener('error', (event) => {
    errorHandlingService.handleError(event.error, {
      component: 'global',
      action: 'global_error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorHandlingService.handleError(event.reason, {
      component: 'global',
      action: 'unhandled_promise_rejection'
    });
  });
}

export default errorHandlingService;
export { ErrorHandlingService };