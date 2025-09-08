/**
 * OMNIX AI - Configuration Manager
 * Centralized configuration management for deployments
 * Prevents hardcoded values and configuration drift
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { ConfigurationValidator } = require('./ConfigurationValidator');

class ConfigurationManager {
  constructor() {
    this.configPath = path.join(process.cwd(), 'config');
    this.masterConfig = null;
    this.environmentConfig = null;
    this.validator = new ConfigurationValidator();
    this.configCache = new Map();
  }

  /**
   * Load configuration for a specific environment
   * @param {string} environment - The environment to load (development, staging, production)
   * @param {object} overrides - Optional configuration overrides
   */
  async loadConfiguration(environment, overrides = {}) {
    console.log(`📋 Loading configuration for environment: ${environment}`);
    
    try {
      // Load master configuration
      this.masterConfig = await this.loadYamlFile('deployment-config.yaml');
      
      // Load environment-specific configuration
      const envConfigPath = `environments/${environment}.yaml`;
      this.environmentConfig = await this.loadYamlFile(envConfigPath);
      
      // Merge configurations (environment overrides master)
      const mergedConfig = this.mergeConfigurations(
        this.masterConfig,
        this.environmentConfig,
        overrides
      );
      
      // Apply environment variable overrides
      const finalConfig = this.applyEnvironmentVariables(mergedConfig);
      
      // Validate configuration
      const validation = await this.validator.validate(finalConfig, environment);
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Cache the configuration
      this.configCache.set(environment, finalConfig);
      
      console.log('✅ Configuration loaded successfully');
      return finalConfig;
      
    } catch (error) {
      console.error(`❌ Failed to load configuration: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load a YAML configuration file
   */
  async loadYamlFile(filename) {
    const filepath = path.join(this.configPath, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Configuration file not found: ${filepath}`);
    }
    
    try {
      const fileContents = fs.readFileSync(filepath, 'utf8');
      return yaml.load(fileContents);
    } catch (error) {
      throw new Error(`Failed to parse YAML file ${filename}: ${error.message}`);
    }
  }

  /**
   * Merge multiple configuration objects
   * Later objects override earlier ones
   */
  mergeConfigurations(...configs) {
    const merged = {};
    
    for (const config of configs) {
      if (!config) continue;
      this.deepMerge(merged, config);
    }
    
    return merged;
  }

  /**
   * Deep merge helper function
   */
  deepMerge(target, source) {
    for (const key in source) {
      if (source[key] === null || source[key] === undefined) {
        continue;
      }
      
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!(key in target)) {
          target[key] = {};
        }
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    
    return target;
  }

  /**
   * Apply environment variable overrides
   * Environment variables override configuration files
   */
  applyEnvironmentVariables(config) {
    const envMappings = {
      'OMNIX_AWS_REGION': 'aws_region',
      'OMNIX_S3_BUCKET': 'frontend.s3_bucket',
      'OMNIX_LAMBDA_FUNCTION': 'backend.lambda_function_name',
      'OMNIX_API_GATEWAY_ID': 'backend.api_gateway_id',
      'OMNIX_CLOUDFRONT_ID': 'frontend.cloudfront_distribution_id',
      'OMNIX_API_KEY': 'frontend.build_env.VITE_API_KEY',
      'OMNIX_API_BASE_URL': 'frontend.build_env.VITE_API_BASE_URL',
      'OMNIX_DEPLOYMENT_STRATEGY': 'deployment.strategy',
      'OMNIX_AUTO_ROLLBACK': 'deployment.rollback_on_failure'
    };
    
    for (const [envVar, configPath] of Object.entries(envMappings)) {
      if (process.env[envVar]) {
        this.setNestedProperty(config, configPath, process.env[envVar]);
        console.log(`  Applied override from ${envVar}`);
      }
    }
    
    return config;
  }

  /**
   * Set a nested property in an object using dot notation
   */
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    // Convert string booleans to actual booleans
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Get a specific configuration value
   */
  get(path, defaultValue = null) {
    if (!this.masterConfig) {
      throw new Error('Configuration not loaded. Call loadConfiguration() first.');
    }
    
    const keys = path.split('.');
    let current = this.mergeConfigurations(this.masterConfig, this.environmentConfig);
    
    for (const key of keys) {
      if (current && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  /**
   * Get configuration for a specific environment from cache
   */
  getEnvironmentConfig(environment) {
    if (!this.configCache.has(environment)) {
      throw new Error(`Configuration for ${environment} not loaded`);
    }
    return this.configCache.get(environment);
  }

  /**
   * Compare configurations between two environments
   */
  compareEnvironments(env1, env2) {
    const config1 = this.getEnvironmentConfig(env1);
    const config2 = this.getEnvironmentConfig(env2);
    
    const differences = [];
    this.findDifferences(config1, config2, '', differences);
    
    return differences;
  }

  /**
   * Find differences between two objects
   */
  findDifferences(obj1, obj2, path, differences) {
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    
    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];
      
      if (typeof val1 === 'object' && typeof val2 === 'object' && !Array.isArray(val1)) {
        this.findDifferences(val1, val2, newPath, differences);
      } else if (val1 !== val2) {
        differences.push({
          path: newPath,
          env1Value: val1,
          env2Value: val2
        });
      }
    }
  }

  /**
   * Export configuration as environment variables
   */
  exportAsEnvVars(config) {
    const envVars = {};
    
    // Frontend environment variables
    if (config.frontend?.build_env) {
      Object.assign(envVars, config.frontend.build_env);
    }
    
    // Backend environment variables
    if (config.backend?.lambda_config?.environment_variables) {
      Object.assign(envVars, config.backend.lambda_config.environment_variables);
    }
    
    // Add standard variables
    envVars.AWS_REGION = config.aws_region || config.global?.default_region;
    envVars.DEPLOYMENT_STAGE = config.stage;
    envVars.DEPLOYMENT_ENVIRONMENT = config.environment;
    
    return envVars;
  }

  /**
   * Generate deployment summary
   */
  generateSummary(config) {
    return {
      environment: config.environment,
      stage: config.stage,
      region: config.aws_region,
      frontend: {
        bucket: config.frontend?.s3_bucket,
        cloudfront: config.frontend?.cloudfront_distribution_id,
        domain: config.frontend?.cloudfront_domain
      },
      backend: {
        lambda: config.backend?.lambda_function_name,
        apiGateway: config.backend?.api_gateway_id,
        apiUrl: config.backend?.api_gateway_url
      },
      deployment: {
        strategy: config.deployment?.strategy,
        autoRollback: config.deployment?.rollback_on_failure,
        healthChecks: config.deployment?.health_check_enabled
      }
    };
  }

  /**
   * Validate that all required AWS resources exist
   */
  async validateResources(config) {
    const resources = {
      s3Bucket: config.frontend?.s3_bucket,
      lambdaFunction: config.backend?.lambda_function_name,
      apiGateway: config.backend?.api_gateway_id,
      cloudfront: config.frontend?.cloudfront_distribution_id
    };
    
    const missing = [];
    for (const [type, resource] of Object.entries(resources)) {
      if (resource && !(await this.resourceExists(type, resource))) {
        missing.push(`${type}: ${resource}`);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Check if an AWS resource exists (stub - implement with AWS SDK)
   */
  async resourceExists(type, identifier) {
    // This would be implemented with actual AWS SDK calls
    console.log(`  Checking ${type}: ${identifier}`);
    return true; // Stub implementation
  }

  /**
   * Save configuration snapshot for rollback
   */
  saveSnapshot(environment, config) {
    const snapshotDir = path.join(this.configPath, 'snapshots');
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${environment}-${timestamp}.yaml`;
    const filepath = path.join(snapshotDir, filename);
    
    fs.writeFileSync(filepath, yaml.dump(config));
    console.log(`  Configuration snapshot saved: ${filename}`);
    
    return filepath;
  }

  /**
   * List all configuration files
   */
  listConfigurations() {
    const configs = {
      master: 'deployment-config.yaml',
      environments: [],
      snapshots: []
    };
    
    // List environment configs
    const envDir = path.join(this.configPath, 'environments');
    if (fs.existsSync(envDir)) {
      configs.environments = fs.readdirSync(envDir)
        .filter(f => f.endsWith('.yaml'))
        .map(f => f.replace('.yaml', ''));
    }
    
    // List snapshots
    const snapshotDir = path.join(this.configPath, 'snapshots');
    if (fs.existsSync(snapshotDir)) {
      configs.snapshots = fs.readdirSync(snapshotDir)
        .filter(f => f.endsWith('.yaml'))
        .sort()
        .reverse()
        .slice(0, 10); // Last 10 snapshots
    }
    
    return configs;
  }
}

module.exports = { ConfigurationManager };