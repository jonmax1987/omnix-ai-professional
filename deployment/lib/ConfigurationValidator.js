/**
 * OMNIX AI - Configuration Validator
 * Validates deployment configurations to prevent errors
 */

const fs = require('fs');
const path = require('path');

class ConfigurationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate a complete configuration
   */
  async validate(config, environment) {
    this.errors = [];
    this.warnings = [];
    
    console.log(`🔍 Validating configuration for ${environment}...`);
    
    // Required field validation
    this.validateRequiredFields(config, environment);
    
    // Environment-specific validation
    this.validateEnvironment(config, environment);
    
    // AWS resource validation
    this.validateAWSResources(config);
    
    // URL and endpoint validation
    this.validateURLs(config);
    
    // Security validation
    this.validateSecurity(config, environment);
    
    // Performance and limits validation
    this.validatePerformanceSettings(config);
    
    // Deployment strategy validation
    this.validateDeploymentStrategy(config);
    
    const result = {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
    
    if (result.valid) {
      console.log('✅ Configuration validation passed');
    } else {
      console.log(`❌ Configuration validation failed with ${this.errors.length} errors`);
    }
    
    if (this.warnings.length > 0) {
      console.log(`⚠️  ${this.warnings.length} warnings found`);
    }
    
    return result;
  }

  /**
   * Validate required fields are present
   */
  validateRequiredFields(config, environment) {
    const requiredFields = [
      'environment',
      'stage',
      'aws_region',
      'frontend.s3_bucket',
      'backend.lambda_function_name'
    ];
    
    // Additional required fields for staging/production
    if (environment !== 'development') {
      requiredFields.push(
        'frontend.cloudfront_distribution_id',
        'backend.api_gateway_id',
        'backend.api_gateway_stage'
      );
    }
    
    for (const field of requiredFields) {
      if (!this.getNestedProperty(config, field)) {
        this.errors.push(`Required field missing: ${field}`);
      }
    }
  }

  /**
   * Validate environment-specific settings
   */
  validateEnvironment(config, environment) {
    // Check environment matches
    if (config.environment !== environment) {
      this.errors.push(`Environment mismatch: config says ${config.environment}, but loading ${environment}`);
    }
    
    // Development should not have production resources
    if (environment === 'development') {
      if (config.frontend?.cloudfront_distribution_id) {
        this.warnings.push('CloudFront configured for development environment');
      }
    }
    
    // Production must have certain features
    if (environment === 'production') {
      if (!config.monitoring?.cloudwatch?.enabled) {
        this.errors.push('CloudWatch monitoring must be enabled for production');
      }
      
      if (!config.deployment?.rollback_on_failure) {
        this.warnings.push('Auto-rollback should be enabled for production');
      }
      
      if (!config.database?.dynamodb?.backup?.enabled) {
        this.errors.push('Database backups must be enabled for production');
      }
    }
  }

  /**
   * Validate AWS resource identifiers
   */
  validateAWSResources(config) {
    // S3 bucket naming rules
    if (config.frontend?.s3_bucket) {
      const bucket = config.frontend.s3_bucket;
      if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(bucket)) {
        this.errors.push(`Invalid S3 bucket name: ${bucket}`);
      }
      if (bucket.length < 3 || bucket.length > 63) {
        this.errors.push(`S3 bucket name must be 3-63 characters: ${bucket}`);
      }
    }
    
    // Lambda function name validation
    if (config.backend?.lambda_function_name) {
      const funcName = config.backend.lambda_function_name;
      if (!/^[a-zA-Z0-9-_]+$/.test(funcName)) {
        this.errors.push(`Invalid Lambda function name: ${funcName}`);
      }
      if (funcName.length > 64) {
        this.errors.push(`Lambda function name too long: ${funcName}`);
      }
    }
    
    // API Gateway ID validation
    if (config.backend?.api_gateway_id) {
      const apiId = config.backend.api_gateway_id;
      if (!/^[a-z0-9]+$/.test(apiId)) {
        this.warnings.push(`Unusual API Gateway ID format: ${apiId}`);
      }
    }
    
    // CloudFront distribution ID validation
    if (config.frontend?.cloudfront_distribution_id) {
      const distId = config.frontend.cloudfront_distribution_id;
      if (!/^E[A-Z0-9]+$/.test(distId)) {
        this.warnings.push(`Unusual CloudFront distribution ID format: ${distId}`);
      }
    }
  }

  /**
   * Validate URLs and endpoints
   */
  validateURLs(config) {
    const urlFields = [
      'frontend.build_env.VITE_API_BASE_URL',
      'frontend.build_env.VITE_WEBSOCKET_URL',
      'backend.api_gateway_url'
    ];
    
    for (const field of urlFields) {
      const url = this.getNestedProperty(config, field);
      if (url && !this.isValidURL(url)) {
        this.errors.push(`Invalid URL in ${field}: ${url}`);
      }
    }
    
    // Check for localhost in non-development
    if (config.environment !== 'development') {
      const apiUrl = config.frontend?.build_env?.VITE_API_BASE_URL;
      if (apiUrl && apiUrl.includes('localhost')) {
        this.errors.push('localhost URL found in non-development environment');
      }
    }
    
    // Validate WebSocket URLs
    const wsUrl = config.frontend?.build_env?.VITE_WEBSOCKET_URL;
    if (wsUrl) {
      if (config.environment === 'production' && !wsUrl.startsWith('wss://')) {
        this.errors.push('Production WebSocket must use wss:// protocol');
      }
      if (config.environment === 'development' && !wsUrl.startsWith('ws://')) {
        this.warnings.push('Development WebSocket should use ws:// protocol');
      }
    }
  }

  /**
   * Validate security settings
   */
  validateSecurity(config, environment) {
    // Check for hardcoded secrets
    const sensitiveFields = [
      'frontend.build_env.VITE_API_KEY',
      'backend.lambda_config.environment_variables.JWT_SECRET'
    ];
    
    for (const field of sensitiveFields) {
      const value = this.getNestedProperty(config, field);
      if (value && environment === 'production') {
        if (!value.includes('ARN') && !value.startsWith('${')) {
          this.warnings.push(`Possible hardcoded secret in ${field}`);
        }
      }
    }
    
    // CORS validation
    if (environment !== 'development') {
      const corsOrigins = config.backend?.lambda_config?.environment_variables?.CORS_ORIGINS;
      if (corsOrigins && corsOrigins === '*') {
        this.errors.push('CORS cannot use wildcard (*) in non-development environment');
      }
    }
    
    // HTTPS enforcement
    if (environment === 'production') {
      const apiUrl = config.frontend?.build_env?.VITE_API_BASE_URL;
      if (apiUrl && !apiUrl.startsWith('https://')) {
        this.errors.push('Production API must use HTTPS');
      }
    }
  }

  /**
   * Validate performance settings
   */
  validatePerformanceSettings(config) {
    // Lambda memory validation
    const memory = config.backend?.lambda_config?.memory_size;
    if (memory) {
      if (memory < 128 || memory > 10240) {
        this.errors.push(`Lambda memory must be 128-10240 MB: ${memory}`);
      }
      if (memory % 64 !== 0) {
        this.errors.push(`Lambda memory must be multiple of 64: ${memory}`);
      }
    }
    
    // Lambda timeout validation
    const timeout = config.backend?.lambda_config?.timeout;
    if (timeout) {
      if (timeout < 1 || timeout > 900) {
        this.errors.push(`Lambda timeout must be 1-900 seconds: ${timeout}`);
      }
    }
    
    // Reserved concurrent executions
    const reserved = config.backend?.lambda_config?.reserved_concurrent_executions;
    if (reserved && (reserved < 0 || reserved > 1000)) {
      this.warnings.push(`Unusual reserved concurrent executions: ${reserved}`);
    }
    
    // Cache TTL validation
    if (config.frontend?.cache_control) {
      const htmlCache = config.frontend.cache_control.html;
      const assetCache = config.frontend.cache_control.assets;
      
      if (htmlCache && !htmlCache.includes('no-cache')) {
        this.warnings.push('HTML files should typically have no-cache headers');
      }
      
      if (assetCache && !assetCache.includes('max-age')) {
        this.warnings.push('Asset files should have max-age cache headers');
      }
    }
  }

  /**
   * Validate deployment strategy
   */
  validateDeploymentStrategy(config) {
    const validStrategies = ['all-at-once', 'rolling', 'blue-green', 'canary'];
    const strategy = config.deployment?.strategy;
    
    if (strategy && !validStrategies.includes(strategy)) {
      this.errors.push(`Invalid deployment strategy: ${strategy}`);
    }
    
    // Canary-specific validation
    if (strategy === 'canary') {
      const percentage = config.deployment?.canary_percentage;
      const duration = config.deployment?.canary_duration;
      
      if (!percentage || percentage < 1 || percentage > 50) {
        this.errors.push('Canary percentage must be 1-50%');
      }
      
      if (!duration || duration < 60 || duration > 3600) {
        this.warnings.push('Canary duration should be 60-3600 seconds');
      }
    }
    
    // Health check validation
    if (config.deployment?.health_check_enabled) {
      const gracePeriod = config.deployment?.health_check_grace_period;
      if (gracePeriod && gracePeriod < 0) {
        this.errors.push('Health check grace period cannot be negative');
      }
    }
  }

  /**
   * Helper to get nested property
   */
  getNestedProperty(obj, path) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Validate URL format
   */
  isValidURL(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:' || 
             url.protocol === 'ws:' || url.protocol === 'wss:';
    } catch {
      return false;
    }
  }

  /**
   * Check for configuration conflicts
   */
  checkConflicts(config) {
    const conflicts = [];
    
    // Check for conflicting bucket names
    const buckets = new Set();
    const bucketFields = [
      'frontend.s3_bucket',
      'deployment.artifacts_bucket'
    ];
    
    for (const field of bucketFields) {
      const bucket = this.getNestedProperty(config, field);
      if (bucket) {
        if (buckets.has(bucket)) {
          conflicts.push(`Duplicate bucket name: ${bucket}`);
        }
        buckets.add(bucket);
      }
    }
    
    return conflicts;
  }
}

module.exports = { ConfigurationValidator };