// Security utilities and CSP configuration

// Content Security Policy configuration
export const CSP_CONFIG = {
  // Basic CSP directives
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and inline scripts
    "'unsafe-eval'", // Required for development HMR
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://cdn.mxpnl.com",
    "https://api.mixpanel.com",
    "https://js.sentry-cdn.com",
    ...(import.meta.env.VITE_CDN_URL ? [import.meta.env.VITE_CDN_URL] : [])
  ].filter(Boolean),
  
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for styled-components
    "https://fonts.googleapis.com",
    ...(import.meta.env.VITE_CDN_FONTS ? [import.meta.env.VITE_CDN_FONTS] : [])
  ].filter(Boolean),
  
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https:",
    ...(import.meta.env.VITE_CDN_IMAGES ? [import.meta.env.VITE_CDN_IMAGES] : [])
  ].filter(Boolean),
  
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    ...(import.meta.env.VITE_CDN_FONTS ? [import.meta.env.VITE_CDN_FONTS] : [])
  ].filter(Boolean),
  
  connectSrc: [
    "'self'",
    "https://api.omnix-ai.com",
    "https://www.google-analytics.com",
    "https://api.mixpanel.com",
    "https://sentry.io",
    "wss:",
    // Add API base URL (extract hostname to allow all paths)
    ...(import.meta.env.VITE_API_BASE_URL ? [
      new URL(import.meta.env.VITE_API_BASE_URL).origin
    ] : []),
    ...(import.meta.env.VITE_WEBSOCKET_URL ? [import.meta.env.VITE_WEBSOCKET_URL] : [])
  ].filter(Boolean),
  
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  
  // Report URI for CSP violations
  reportUri: import.meta.env.VITE_CSP_REPORT_URI || "/api/csp-report"
};

// Generate CSP header value
export function generateCSPHeader(excludeReportUri = false) {
  const directives = Object.entries(CSP_CONFIG)
    .filter(([key]) => {
      // Exclude report-uri when used in meta tags (doesn't work there)
      if (excludeReportUri && key === 'reportUri') {
        return false;
      }
      return true;
    })
    .map(([key, value]) => {
      const directiveName = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      if (Array.isArray(value)) {
        return `${directiveName} ${value.join(' ')}`;
      }
      return `${directiveName} ${value}`;
    });
  
  return directives.join('; ');
}

// Security headers configuration
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS Protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (replace Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '),
  
  // HSTS (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site'
};

// Input sanitization
export function sanitizeInput(input, type = 'text') {
  if (typeof input !== 'string') return input;
  
  switch (type) {
    case 'html':
      return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    
    case 'javascript':
      return input.replace(/[<>"'&]/g, '');
    
    case 'sql':
      return input.replace(/['";\\]/g, '');
    
    case 'text':
    default:
      return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
  }
}

// Validate URLs
export function isValidUrl(url, allowedDomains = []) {
  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check domain whitelist if provided
    if (allowedDomains.length > 0) {
      return allowedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`));
    }
    
    return true;
  } catch {
    return false;
  }
}

// Rate limiting (client-side)
export class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(identifier, validRequests);
    
    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    return true;
  }
  
  getRemainingRequests(identifier = 'default') {
    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }
    
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const validRequests = this.requests.get(identifier).filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Secure storage utilities
export const secureStorage = {
  set(key, value, encrypt = false) {
    try {
      const data = encrypt ? btoa(JSON.stringify(value)) : JSON.stringify(value);
      localStorage.setItem(key, data);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },
  
  get(key, decrypt = false) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const parsed = decrypt ? JSON.parse(atob(data)) : JSON.parse(data);
      return parsed;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

// Token management
export class TokenManager {
  constructor() {
    this.tokenKey = 'auth_token';
    this.refreshKey = 'refresh_token';
  }
  
  setTokens(accessToken, refreshToken) {
    secureStorage.set(this.tokenKey, accessToken, true);
    if (refreshToken) {
      secureStorage.set(this.refreshKey, refreshToken, true);
    }
  }
  
  getAccessToken() {
    return secureStorage.get(this.tokenKey, true);
  }
  
  getRefreshToken() {
    return secureStorage.get(this.refreshKey, true);
  }
  
  clearTokens() {
    secureStorage.remove(this.tokenKey);
    secureStorage.remove(this.refreshKey);
  }
  
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch {
      return true;
    }
  }
}

// CSRF protection
export function generateCSRFToken() {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
}

export function setCSRFToken(token) {
  secureStorage.set('csrf_token', token);
}

export function getCSRFToken() {
  return secureStorage.get('csrf_token');
}

// Security event logging
export function logSecurityEvent(event, details = {}) {
  const securityEvent = {
    type: event,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    details
  };
  
  console.warn('Security event:', securityEvent);
  
  // Send to monitoring service
  if (typeof analytics !== 'undefined') {
    analytics.trackEvent('security_event', {
      event_type: event,
      ...details,
      category: 'Security'
    });
  }
}

// Content validation
export function validateFileUpload(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) {
  const errors = [];
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size ${file.size} exceeds maximum ${maxSize}`);
  }
  
  return errors;
}

// Initialize security measures
export function initializeSecurity() {
  // Set CSP meta tag if not already set by server
  if (import.meta.env.VITE_ENABLE_SECURITY_HEADERS === 'true' && !document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    // Exclude report-uri from meta CSP as it's not supported
    meta.content = generateCSPHeader(true);
    document.head.appendChild(meta);
  }
  
  // Disable right-click in production (optional)
  if (import.meta.env.PROD && import.meta.env.VITE_DISABLE_RIGHT_CLICK === 'true') {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  // Disable F12 and developer tools shortcuts (optional)
  if (import.meta.env.PROD && import.meta.env.VITE_DISABLE_DEV_TOOLS === 'true') {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
      }
    });
  }
  
  // console.log('Security measures initialized');
}

// Export instances
export const rateLimiter = new RateLimiter();
export const tokenManager = new TokenManager();

export default {
  CSP_CONFIG,
  SECURITY_HEADERS,
  generateCSPHeader,
  sanitizeInput,
  isValidUrl,
  RateLimiter,
  secureStorage,
  TokenManager,
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  logSecurityEvent,
  validateFileUpload,
  initializeSecurity,
  rateLimiter,
  tokenManager
};