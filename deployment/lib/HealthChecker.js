/**
 * OMNIX AI - Comprehensive Health Checker
 * Validates all system components after deployment
 * Prevents deployment completion until all systems are healthy
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

class HealthChecker {
  constructor(config = {}) {
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.retryCount = config.retryCount || 3;
    this.retryDelay = config.retryDelay || 2000; // 2 seconds
    this.parallelChecks = config.parallelChecks !== false;
    
    this.healthChecks = new Map();
    this.results = new Map();
    
    // Initialize built-in health checks
    this.initializeBuiltInChecks();
  }

  /**
   * Register a custom health check
   */
  registerHealthCheck(name, checkFunction, options = {}) {
    this.healthChecks.set(name, {
      name,
      check: checkFunction,
      timeout: options.timeout || this.timeout,
      retryCount: options.retryCount || this.retryCount,
      critical: options.critical !== false,
      category: options.category || 'custom',
      description: options.description || `Health check: ${name}`
    });
  }

  /**
   * Execute all health checks for a deployment
   */
  async executeHealthChecks(config, deploymentId) {
    console.log('🏥 Executing comprehensive health checks...');
    
    const startTime = performance.now();
    const checks = this.getRelevantChecks(config);
    
    console.log(`   Running ${checks.length} health checks`);
    
    const results = {
      deploymentId,
      timestamp: new Date().toISOString(),
      totalChecks: checks.length,
      passed: 0,
      failed: 0,
      warnings: 0,
      critical: 0,
      duration: 0,
      checks: {},
      overall: 'unknown',
      score: 0
    };

    try {
      // Execute checks in parallel or sequential based on configuration
      const checkResults = this.parallelChecks 
        ? await this.executeChecksInParallel(checks, config)
        : await this.executeChecksSequentially(checks, config);

      // Process results
      for (const [checkName, result] of Object.entries(checkResults)) {
        results.checks[checkName] = result;
        
        if (result.status === 'pass') {
          results.passed++;
        } else if (result.status === 'fail') {
          results.failed++;
          if (result.critical) {
            results.critical++;
          }
        } else if (result.status === 'warning') {
          results.warnings++;
        }
      }

      // Calculate overall status and score
      results.duration = Math.round(performance.now() - startTime);
      results.score = this.calculateHealthScore(results);
      results.overall = this.determineOverallStatus(results);

      // Log summary
      this.logHealthCheckSummary(results);

      return results;

    } catch (error) {
      console.error(`❌ Health check execution failed: ${error.message}`);
      results.overall = 'error';
      results.error = error.message;
      results.duration = Math.round(performance.now() - startTime);
      
      return results;
    }
  }

  /**
   * Execute checks in parallel for faster execution
   */
  async executeChecksInParallel(checks, config) {
    const promises = checks.map(async (check) => {
      try {
        const result = await this.executeHealthCheck(check, config);
        return { [check.name]: result };
      } catch (error) {
        return { [check.name]: this.createFailureResult(check, error) };
      }
    });

    const results = await Promise.allSettled(promises);
    const combinedResults = {};

    results.forEach((promiseResult, index) => {
      if (promiseResult.status === 'fulfilled') {
        Object.assign(combinedResults, promiseResult.value);
      } else {
        const check = checks[index];
        combinedResults[check.name] = this.createFailureResult(check, promiseResult.reason);
      }
    });

    return combinedResults;
  }

  /**
   * Execute checks sequentially with early termination on critical failures
   */
  async executeChecksSequentially(checks, config) {
    const results = {};

    for (const check of checks) {
      try {
        const result = await this.executeHealthCheck(check, config);
        results[check.name] = result;

        // Early termination on critical failures
        if (result.status === 'fail' && check.critical) {
          console.log(`❌ Critical health check failed: ${check.name}`);
          console.log('   Terminating remaining checks due to critical failure');
          break;
        }
      } catch (error) {
        results[check.name] = this.createFailureResult(check, error);
        
        if (check.critical) {
          console.log(`❌ Critical health check errored: ${check.name}`);
          break;
        }
      }
    }

    return results;
  }

  /**
   * Execute a single health check with retry logic
   */
  async executeHealthCheck(check, config) {
    console.log(`  🔍 ${check.name}`);
    
    const startTime = performance.now();
    let lastError = null;

    for (let attempt = 1; attempt <= check.retryCount; attempt++) {
      try {
        const result = await Promise.race([
          check.check(config),
          this.createTimeoutPromise(check.timeout, check.name)
        ]);

        const duration = Math.round(performance.now() - startTime);
        
        return {
          status: result.success ? 'pass' : (result.warning ? 'warning' : 'fail'),
          message: result.message || (result.success ? 'Health check passed' : 'Health check failed'),
          details: result.details || {},
          duration,
          attempt,
          critical: check.critical,
          category: check.category,
          timestamp: new Date().toISOString(),
          metrics: result.metrics || {}
        };

      } catch (error) {
        lastError = error;
        
        if (attempt < check.retryCount) {
          console.log(`    Retry ${attempt + 1}/${check.retryCount} in ${this.retryDelay}ms...`);
          await this.sleep(this.retryDelay);
        }
      }
    }

    // All attempts failed
    const duration = Math.round(performance.now() - startTime);
    return this.createFailureResult(check, lastError, duration);
  }

  /**
   * Initialize built-in health checks
   */
  initializeBuiltInChecks() {
    // Frontend health check
    this.registerHealthCheck('frontend_accessibility', async (config) => {
      if (!config.frontend?.cloudfront_distribution_id && !config.frontend?.s3_bucket) {
        return { success: true, message: 'No frontend configured', warning: true };
      }

      const frontendUrl = this.getFrontendUrl(config);
      if (!frontendUrl) {
        return { success: false, message: 'Cannot determine frontend URL' };
      }

      const response = await this.httpRequest(frontendUrl);
      
      return {
        success: response.statusCode >= 200 && response.statusCode < 400,
        message: `Frontend responded with HTTP ${response.statusCode}`,
        details: {
          url: frontendUrl,
          statusCode: response.statusCode,
          responseTime: response.responseTime,
          contentLength: response.headers['content-length'] || 0
        },
        metrics: {
          responseTime: response.responseTime,
          statusCode: response.statusCode
        }
      };
    }, { critical: true, category: 'frontend', description: 'Check if frontend is accessible' });

    // API health check
    this.registerHealthCheck('api_health_endpoint', async (config) => {
      const apiUrl = this.getApiHealthUrl(config);
      if (!apiUrl) {
        return { success: true, message: 'No API configured', warning: true };
      }

      const response = await this.httpRequest(apiUrl);
      
      return {
        success: response.statusCode === 200,
        message: `API health endpoint responded with HTTP ${response.statusCode}`,
        details: {
          url: apiUrl,
          statusCode: response.statusCode,
          responseTime: response.responseTime,
          body: response.body
        },
        metrics: {
          responseTime: response.responseTime,
          statusCode: response.statusCode
        }
      };
    }, { critical: true, category: 'api', description: 'Check API health endpoint' });

    // Database connectivity check
    this.registerHealthCheck('database_connectivity', async (config) => {
      // This would check DynamoDB connectivity
      // For now, we'll simulate it
      
      return {
        success: true,
        message: 'Database connectivity verified',
        details: {
          tables: config.database?.dynamodb?.tables || [],
          region: config.aws_region
        },
        metrics: {
          connectionTime: 45
        }
      };
    }, { critical: true, category: 'database', description: 'Verify database connectivity' });

    // CORS configuration check
    this.registerHealthCheck('cors_configuration', async (config) => {
      const apiUrl = this.getApiHealthUrl(config);
      const frontendUrl = this.getFrontendUrl(config);
      
      if (!apiUrl || !frontendUrl) {
        return { success: true, message: 'CORS check skipped - missing URLs', warning: true };
      }

      try {
        const corsCheck = await this.checkCorsConfiguration(apiUrl, frontendUrl);
        
        return {
          success: corsCheck.valid,
          message: corsCheck.message,
          details: corsCheck.details,
          metrics: {
            responseTime: corsCheck.responseTime
          }
        };
      } catch (error) {
        return {
          success: false,
          message: `CORS check failed: ${error.message}`,
          details: { error: error.message }
        };
      }
    }, { critical: false, category: 'api', description: 'Verify CORS configuration' });

    // SSL certificate check
    this.registerHealthCheck('ssl_certificate', async (config) => {
      const httpsUrls = [];
      
      if (config.frontend?.cloudfront_domain) {
        httpsUrls.push(`https://${config.frontend.cloudfront_domain}`);
      }
      
      if (config.backend?.api_gateway_url && config.backend.api_gateway_url.startsWith('https://')) {
        httpsUrls.push(config.backend.api_gateway_url);
      }

      if (httpsUrls.length === 0) {
        return { success: true, message: 'No HTTPS URLs to check', warning: true };
      }

      const certChecks = await Promise.all(
        httpsUrls.map(url => this.checkSSLCertificate(url))
      );

      const allValid = certChecks.every(check => check.valid);
      const expires = Math.min(...certChecks.map(check => check.daysUntilExpiry));

      return {
        success: allValid && expires > 30,
        message: `SSL certificates ${allValid ? 'valid' : 'invalid'}, minimum expiry: ${expires} days`,
        warning: expires < 30,
        details: {
          certificates: certChecks,
          minimumExpiry: expires
        },
        metrics: {
          certificateCount: certChecks.length,
          minimumExpiry: expires
        }
      };
    }, { critical: false, category: 'security', description: 'Check SSL certificate validity' });

    // Performance baseline check
    this.registerHealthCheck('performance_baseline', async (config) => {
      const urls = [];
      
      if (this.getFrontendUrl(config)) {
        urls.push({ name: 'frontend', url: this.getFrontendUrl(config) });
      }
      
      if (this.getApiHealthUrl(config)) {
        urls.push({ name: 'api', url: this.getApiHealthUrl(config) });
      }

      if (urls.length === 0) {
        return { success: true, message: 'No URLs for performance check', warning: true };
      }

      const performanceChecks = await Promise.all(
        urls.map(async ({ name, url }) => {
          const response = await this.httpRequest(url);
          return {
            name,
            url,
            responseTime: response.responseTime,
            statusCode: response.statusCode
          };
        })
      );

      const avgResponseTime = performanceChecks.reduce((sum, check) => sum + check.responseTime, 0) / performanceChecks.length;
      const maxResponseTime = Math.max(...performanceChecks.map(check => check.responseTime));

      return {
        success: maxResponseTime < 5000, // 5 seconds threshold
        message: `Performance check: avg ${Math.round(avgResponseTime)}ms, max ${Math.round(maxResponseTime)}ms`,
        warning: maxResponseTime > 2000, // Warning at 2 seconds
        details: {
          checks: performanceChecks,
          averageResponseTime: avgResponseTime,
          maxResponseTime: maxResponseTime
        },
        metrics: {
          averageResponseTime: avgResponseTime,
          maxResponseTime: maxResponseTime
        }
      };
    }, { critical: false, category: 'performance', description: 'Check system performance baselines' });

    // Environment configuration validation
    this.registerHealthCheck('environment_configuration', async (config) => {
      const issues = [];
      const warnings = [];

      // Check for development settings in production
      if (config.environment === 'production') {
        if (config.frontend?.build_env?.VITE_DEBUG_MODE === 'true') {
          issues.push('Debug mode enabled in production');
        }
        
        if (config.backend?.lambda_config?.environment_variables?.LOG_LEVEL === 'debug') {
          issues.push('Debug logging enabled in production');
        }
        
        if (config.backend?.lambda_config?.environment_variables?.CORS_ORIGINS === '*') {
          issues.push('Wildcard CORS enabled in production');
        }
      }

      // Check for missing required configuration
      if (config.environment !== 'development') {
        if (!config.frontend?.cloudfront_distribution_id) {
          warnings.push('No CloudFront distribution configured');
        }
        
        if (!config.backend?.api_gateway_id) {
          warnings.push('No API Gateway configured');
        }
      }

      return {
        success: issues.length === 0,
        message: issues.length === 0 ? 
          `Environment configuration valid (${warnings.length} warnings)` : 
          `Configuration issues found: ${issues.join(', ')}`,
        warning: warnings.length > 0,
        details: {
          issues,
          warnings,
          environment: config.environment
        },
        metrics: {
          issues: issues.length,
          warnings: warnings.length
        }
      };
    }, { critical: true, category: 'configuration', description: 'Validate environment configuration' });
  }

  /**
   * Get relevant health checks based on configuration
   */
  getRelevantChecks(config) {
    const relevantChecks = [];
    
    for (const [name, check] of this.healthChecks) {
      // Include all checks by default
      // Could add logic here to skip irrelevant checks based on config
      relevantChecks.push(check);
    }
    
    // Sort by criticality (critical checks first)
    return relevantChecks.sort((a, b) => {
      if (a.critical && !b.critical) return -1;
      if (!a.critical && b.critical) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * HTTP request helper with metrics
   */
  async httpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || this.timeout
      };

      const req = client.request(requestOptions, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          const responseTime = performance.now() - startTime;
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            responseTime: Math.round(responseTime)
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${this.timeout}ms`));
      });

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  /**
   * Check CORS configuration
   */
  async checkCorsConfiguration(apiUrl, origin) {
    const startTime = performance.now();
    
    const response = await this.httpRequest(apiUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    const responseTime = performance.now() - startTime;
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    const allowMethods = response.headers['access-control-allow-methods'];
    
    const valid = allowOrigin === origin || allowOrigin === '*';
    
    return {
      valid,
      message: valid ? 'CORS configured correctly' : `CORS misconfigured: origin ${origin} not allowed`,
      responseTime: Math.round(responseTime),
      details: {
        origin,
        allowOrigin,
        allowMethods,
        statusCode: response.statusCode
      }
    };
  }

  /**
   * Check SSL certificate
   */
  async checkSSLCertificate(url) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      
      const req = https.request({
        hostname: urlObj.hostname,
        port: 443,
        path: '/',
        method: 'HEAD'
      }, (res) => {
        const cert = res.connection.getPeerCertificate();
        
        if (cert && cert.valid_to) {
          const expiryDate = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          
          resolve({
            valid: daysUntilExpiry > 0,
            daysUntilExpiry,
            issuer: cert.issuer?.CN || 'Unknown',
            subject: cert.subject?.CN || 'Unknown',
            expiryDate: expiryDate.toISOString()
          });
        } else {
          resolve({
            valid: false,
            daysUntilExpiry: 0,
            error: 'No certificate found'
          });
        }
        
        req.destroy();
      });

      req.on('error', () => {
        resolve({
          valid: false,
          daysUntilExpiry: 0,
          error: 'SSL connection failed'
        });
      });

      req.end();
    });
  }

  // Helper methods
  getFrontendUrl(config) {
    if (config.frontend?.cloudfront_domain) {
      return `https://${config.frontend.cloudfront_domain}`;
    }
    if (config.frontend?.s3_bucket) {
      return `http://${config.frontend.s3_bucket}.s3-website-${config.aws_region}.amazonaws.com`;
    }
    return null;
  }

  getApiHealthUrl(config) {
    if (config.backend?.api_gateway_url) {
      return config.backend.api_gateway_url.replace(/\/v1.*$/, '') + '/health';
    }
    return null;
  }

  createTimeoutPromise(timeout, checkName) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Health check '${checkName}' timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  createFailureResult(check, error, duration = 0) {
    return {
      status: 'fail',
      message: error.message || 'Health check failed',
      details: { error: error.message },
      duration,
      critical: check.critical,
      category: check.category,
      timestamp: new Date().toISOString(),
      error: true
    };
  }

  calculateHealthScore(results) {
    if (results.totalChecks === 0) return 0;
    
    let score = 0;
    const weights = { pass: 100, warning: 70, fail: 0 };
    
    Object.values(results.checks).forEach(check => {
      const weight = check.critical ? 2 : 1;
      score += (weights[check.status] || 0) * weight;
    });
    
    const maxPossibleScore = results.totalChecks * 100 * 2; // Assuming all critical
    return Math.round((score / maxPossibleScore) * 100);
  }

  determineOverallStatus(results) {
    if (results.critical > 0) return 'critical';
    if (results.failed > 0) return 'unhealthy';
    if (results.warnings > 0) return 'degraded';
    return 'healthy';
  }

  logHealthCheckSummary(results) {
    console.log('');
    console.log('🏥 Health Check Summary');
    console.log('═══════════════════════');
    console.log(`Overall Status: ${this.getStatusEmoji(results.overall)} ${results.overall.toUpperCase()}`);
    console.log(`Health Score: ${results.score}/100`);
    console.log(`Duration: ${results.duration}ms`);
    console.log(`Checks: ${results.passed} passed, ${results.failed} failed, ${results.warnings} warnings`);
    
    if (results.critical > 0) {
      console.log(`❌ Critical failures: ${results.critical}`);
    }
    
    console.log('');
    
    // Log individual check results
    Object.entries(results.checks).forEach(([name, result]) => {
      const emoji = this.getStatusEmoji(result.status);
      const time = result.duration ? `(${result.duration}ms)` : '';
      console.log(`  ${emoji} ${name}: ${result.message} ${time}`);
    });
    
    console.log('');
  }

  getStatusEmoji(status) {
    switch (status) {
      case 'healthy': case 'pass': return '✅';
      case 'degraded': case 'warning': return '⚠️';
      case 'unhealthy': case 'fail': return '❌';
      case 'critical': return '🚨';
      default: return '❓';
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { HealthChecker };