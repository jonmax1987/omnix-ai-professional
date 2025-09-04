/**
 * OMNIX AI - PII Sanitization Utility
 * Privacy-first data sanitization for logging and error reporting
 * GDPR/CCPA compliant data handling
 */

/**
 * Hash function for consistent but anonymized IDs
 * @param {string} input - The input string to hash
 * @returns {string} - A consistent hash of the input
 */
function simpleHash(input) {
  if (!input) return 'anonymous';
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36).substring(0, 8);
}

/**
 * Sanitize customer ID for logging
 * @param {string} customerId - The customer ID to sanitize
 * @returns {string} - Sanitized customer ID in format "cust_****1234"
 */
export function sanitizeCustomerId(customerId) {
  if (!customerId || typeof customerId !== 'string') {
    return 'anonymous_user';
  }
  
  // For development environments, show partial ID
  if (process.env.NODE_ENV === 'development' && customerId.length > 8) {
    const start = customerId.substring(0, 4);
    const end = customerId.substring(customerId.length - 4);
    return `${start}****${end}`;
  }
  
  // For production, use consistent hash
  return `cust_${simpleHash(customerId)}`;
}

/**
 * Sanitize session ID for logging
 * @param {string} sessionId - The session ID to sanitize
 * @returns {string} - Sanitized session ID
 */
export function sanitizeSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return 'session_anonymous';
  }
  
  return `sess_${simpleHash(sessionId)}`;
}

/**
 * Sanitize authentication token for logging
 * @param {string} token - The token to sanitize
 * @returns {string} - Completely masked token
 */
export function sanitizeToken(token) {
  if (!token) return '[NO_TOKEN]';
  
  // Never log actual tokens - only indicate presence
  return '[TOKEN_PRESENT]';
}

/**
 * Sanitize error messages to remove PII
 * @param {string} message - The error message
 * @returns {string} - Sanitized error message
 */
export function sanitizeErrorMessage(message) {
  if (!message || typeof message !== 'string') {
    return 'Error occurred';
  }
  
  // Remove common PII patterns
  let sanitized = message
    // Remove email patterns
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
    // Remove phone number patterns
    .replace(/\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE_REDACTED]')
    // Remove credit card patterns
    .replace(/\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g, '[CARD_REDACTED]')
    // Remove SSN patterns
    .replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[SSN_REDACTED]')
    // Remove potential API keys (long alphanumeric strings)
    .replace(/\b[A-Za-z0-9]{32,}\b/g, '[KEY_REDACTED]');
    
  return sanitized;
}

/**
 * Sanitize behavior data object for logging
 * @param {object} behaviorData - The behavior data object
 * @returns {object} - Sanitized behavior data
 */
export function sanitizeBehaviorData(behaviorData) {
  if (!behaviorData || typeof behaviorData !== 'object') {
    return { error: 'Invalid behavior data' };
  }
  
  const sanitized = { ...behaviorData };
  
  // Sanitize PII fields
  if (sanitized.customerId) {
    sanitized.customerId = sanitizeCustomerId(sanitized.customerId);
  }
  
  if (sanitized.sessionId) {
    sanitized.sessionId = sanitizeSessionId(sanitized.sessionId);
  }
  
  // Remove or sanitize sensitive metadata
  if (sanitized.metadata) {
    const cleanMetadata = { ...sanitized.metadata };
    
    // Remove authentication tokens
    delete cleanMetadata.authToken;
    delete cleanMetadata.accessToken;
    delete cleanMetadata.refreshToken;
    delete cleanMetadata.jwt;
    
    // Sanitize user agent (keep only browser info, remove versions)
    if (cleanMetadata.userAgent) {
      cleanMetadata.userAgent = cleanMetadata.userAgent.replace(/\d+\.\d+\.\d+/g, 'x.x.x');
    }
    
    // Sanitize IP addresses
    if (cleanMetadata.ip || cleanMetadata.ipAddress) {
      cleanMetadata.ip = '[IP_REDACTED]';
      delete cleanMetadata.ipAddress;
    }
    
    sanitized.metadata = cleanMetadata;
  }
  
  // Remove location data that might be too specific
  if (sanitized.location && typeof sanitized.location === 'object') {
    const { city, region, country } = sanitized.location;
    sanitized.location = { region, country }; // Keep only general location
  }
  
  return sanitized;
}

/**
 * Sanitize consumption pattern data for logging
 * @param {object} consumptionData - The consumption data object
 * @returns {object} - Sanitized consumption data
 */
export function sanitizeConsumptionData(consumptionData) {
  if (!consumptionData || typeof consumptionData !== 'object') {
    return { error: 'Invalid consumption data' };
  }
  
  const sanitized = { ...consumptionData };
  
  // Sanitize customer ID
  if (sanitized.customerId) {
    sanitized.customerId = sanitizeCustomerId(sanitized.customerId);
  }
  
  // Sanitize metadata
  if (sanitized.metadata) {
    const cleanMetadata = { ...sanitized.metadata };
    
    if (cleanMetadata.sessionId) {
      cleanMetadata.sessionId = sanitizeSessionId(cleanMetadata.sessionId);
    }
    
    // Remove precise location
    if (cleanMetadata.location) {
      delete cleanMetadata.location.coordinates;
      delete cleanMetadata.location.address;
      delete cleanMetadata.location.zipCode;
    }
    
    sanitized.metadata = cleanMetadata;
  }
  
  return sanitized;
}

/**
 * Create a sanitized error object for logging
 * @param {Error|string} error - The error to sanitize
 * @param {object} context - Additional context data
 * @returns {object} - Sanitized error object
 */
export function createSanitizedError(error, context = {}) {
  const sanitizedError = {
    message: error.message ? sanitizeErrorMessage(error.message) : 'Unknown error',
    type: error.name || 'Error',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  };
  
  // Add sanitized context
  if (context.customerId) {
    sanitizedError.customer = sanitizeCustomerId(context.customerId);
  }
  
  if (context.sessionId) {
    sanitizedError.session = sanitizeSessionId(context.sessionId);
  }
  
  // Add error code if present (usually safe to log)
  if (error.code) {
    sanitizedError.code = error.code;
  }
  
  // Add status code if present (HTTP errors)
  if (error.status || error.statusCode) {
    sanitizedError.status = error.status || error.statusCode;
  }
  
  return sanitizedError;
}

/**
 * Safe logging function that automatically sanitizes data
 * @param {string} level - Log level ('info', 'warn', 'error', 'debug')
 * @param {string} message - Log message
 * @param {object} data - Data to log (will be sanitized)
 */
export function securelog(level, message, data = {}) {
  // Only log in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_SECURE_LOGGING) {
    return;
  }
  
  const sanitizedData = {
    ...data,
    timestamp: new Date().toISOString(),
    level: level.toUpperCase()
  };
  
  // Sanitize common PII fields
  if (sanitizedData.customerId) {
    sanitizedData.customerId = sanitizeCustomerId(sanitizedData.customerId);
  }
  
  if (sanitizedData.sessionId) {
    sanitizedData.sessionId = sanitizeSessionId(sanitizedData.sessionId);
  }
  
  // Remove sensitive fields
  delete sanitizedData.password;
  delete sanitizedData.token;
  delete sanitizedData.authToken;
  delete sanitizedData.accessToken;
  delete sanitizedData.refreshToken;
  
  const logMessage = `[OMNIX-SECURE] ${message}`;
  
  switch (level.toLowerCase()) {
    case 'error':
      console.error(logMessage, sanitizedData);
      break;
    case 'warn':
      console.warn(logMessage, sanitizedData);
      break;
    case 'debug':
      console.debug(logMessage, sanitizedData);
      break;
    default:
      console.info(logMessage, sanitizedData);
  }
}

/**
 * Environment-based logging control
 * @returns {boolean} - Whether logging is enabled
 */
export function isLoggingEnabled() {
  return process.env.NODE_ENV === 'development' || process.env.ENABLE_SECURE_LOGGING === 'true';
}

// Default export with all functions
export default {
  sanitizeCustomerId,
  sanitizeSessionId,
  sanitizeToken,
  sanitizeErrorMessage,
  sanitizeBehaviorData,
  sanitizeConsumptionData,
  createSanitizedError,
  securelog,
  isLoggingEnabled
};