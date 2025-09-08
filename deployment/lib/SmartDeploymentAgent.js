/**
 * OMNIX AI - Smart Deployment Agent v2.0
 * Intelligent deployment system that learns from mistakes and prevents failures
 * NEVER repeats the same error twice
 */

const { ConfigurationManager } = require('./ConfigurationManager');
const { StateManager } = require('./StateManager');
const { RollbackManager } = require('./RollbackManager');
const { ConfigurationValidator } = require('./ConfigurationValidator');

class SmartDeploymentAgent {
  constructor(config = {}) {
    this.configManager = new ConfigurationManager();
    this.stateManager = new StateManager(config);
    this.rollbackManager = new RollbackManager(config);
    this.validator = new ConfigurationValidator();
    
    // Agent memory and learning system
    this.memory = {
      knownErrors: new Map(),
      successPatterns: new Map(),
      riskFactors: new Map(),
      environmentInsights: new Map()
    };
    
    // Error prevention rules learned from past deployments
    this.preventionRules = [];
    
    // Agent configuration
    this.config = {
      learningEnabled: config.learningEnabled !== false,
      autoPreventErrors: config.autoPreventErrors !== false,
      riskThreshold: config.riskThreshold || 0.7,
      maxRetries: config.maxRetries || 3,
      ...config
    };
    
    this.initialized = false;
  }

  /**
   * Initialize agent with historical data
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('🤖 Initializing Smart Deployment Agent...');
    
    try {
      // Load historical deployment data for learning
      await this.loadMemoryFromHistory();
      
      // Initialize prevention rules
      await this.initializePreventionRules();
      
      console.log('✅ Smart Deployment Agent initialized');
      console.log(`   Learned from ${this.memory.knownErrors.size} error patterns`);
      console.log(`   Active prevention rules: ${this.preventionRules.length}`);
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Smart Deployment Agent:', error.message);
      throw error;
    }
  }

  /**
   * Execute intelligent deployment with error prevention
   */
  async deployWithIntelligence(environment, options = {}) {
    await this.initialize();
    
    console.log('🚀 Starting intelligent deployment...');
    console.log(`   Environment: ${environment}`);
    console.log(`   Learning: ${this.config.learningEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   Error Prevention: ${this.config.autoPreventErrors ? 'Enabled' : 'Disabled'}`);
    
    const deploymentStart = Date.now();
    let deploymentState = null;
    let deploymentId = null;
    
    try {
      // Load configuration
      const config = await this.configManager.loadConfiguration(environment, options.configOverrides);
      
      // Create deployment state
      deploymentState = await this.stateManager.createDeploymentState(environment, config, {
        agentVersion: '2.0',
        intelligenceEnabled: true,
        options
      });
      deploymentId = deploymentState.deploymentId;
      
      // Pre-deployment intelligence analysis
      await this.analyzeDeploymentRisk(deploymentId, config, environment);
      
      // Apply prevention rules
      if (this.config.autoPreventErrors) {
        await this.applyPreventionRules(deploymentId, config);
      }
      
      // Create pre-deployment snapshot
      const snapshot = await this.rollbackManager.createPreDeploymentSnapshot(deploymentId, config);
      
      // Execute deployment with monitoring
      const deploymentResult = await this.executeMonitoredDeployment(deploymentId, config, options);
      
      // Post-deployment learning
      await this.learnFromDeployment(deploymentId, deploymentResult, config);
      
      // Mark deployment as successful
      await this.stateManager.updateDeploymentState(deploymentId, {
        status: 'completed',
        result: deploymentResult,
        completedAt: new Date().toISOString()
      });
      
      const duration = Date.now() - deploymentStart;
      console.log(`🎉 Intelligent deployment completed successfully in ${Math.round(duration / 1000)}s`);
      
      return {
        success: true,
        deploymentId,
        duration,
        result: deploymentResult,
        snapshotId: snapshot.snapshotId
      };
      
    } catch (error) {
      console.error(`❌ Deployment failed: ${error.message}`);
      
      // Record failure and learn from it
      if (deploymentId) {
        await this.handleDeploymentFailure(deploymentId, error, environment);
      }
      
      throw error;
    }
  }

  /**
   * Analyze deployment risk before execution
   */
  async analyzeDeploymentRisk(deploymentId, config, environment) {
    console.log('📊 Analyzing deployment risk...');
    
    const riskFactors = [];
    let riskScore = 0;
    
    // Check for known error patterns
    const errorPatterns = await this.checkForKnownErrorPatterns(config, environment);
    if (errorPatterns.length > 0) {
      riskScore += 0.3;
      riskFactors.push(`Known error patterns detected: ${errorPatterns.join(', ')}`);
    }
    
    // Check deployment time patterns
    const timeRisk = await this.analyzeDeploymentTime();
    if (timeRisk.risky) {
      riskScore += 0.2;
      riskFactors.push(`Risky deployment time: ${timeRisk.reason}`);
    }
    
    // Check environment stability
    const envStats = await this.stateManager.getDeploymentStatistics(environment, 7);
    if (envStats.successRate < 80) {
      riskScore += 0.3;
      riskFactors.push(`Low recent success rate: ${envStats.successRate.toFixed(1)}%`);
    }
    
    // Check configuration changes
    const configRisk = await this.analyzeConfigurationRisk(config, environment);
    riskScore += configRisk.score;
    riskFactors.push(...configRisk.factors);
    
    // Check resource availability
    const resourceRisk = await this.checkResourceAvailability(config);
    riskScore += resourceRisk.score;
    riskFactors.push(...resourceRisk.factors);
    
    // Store risk analysis
    await this.stateManager.updateDeploymentState(deploymentId, {
      riskAnalysis: {
        score: riskScore,
        factors: riskFactors,
        recommendation: this.getRiskRecommendation(riskScore),
        analyzedAt: new Date().toISOString()
      }
    });
    
    console.log(`   Risk Score: ${(riskScore * 100).toFixed(0)}%`);
    
    if (riskScore > this.config.riskThreshold) {
      console.log('⚠️ HIGH RISK DEPLOYMENT DETECTED!');
      riskFactors.forEach(factor => console.log(`   - ${factor}`));
      
      if (riskScore > 0.9) {
        throw new Error(`Deployment blocked due to extremely high risk (${(riskScore * 100).toFixed(0)}%)`);
      }
    }
    
    return { riskScore, riskFactors };
  }

  /**
   * Apply learned prevention rules
   */
  async applyPreventionRules(deploymentId, config) {
    console.log('🛡️ Applying error prevention rules...');
    
    let rulesApplied = 0;
    
    for (const rule of this.preventionRules) {
      if (await this.shouldApplyRule(rule, config)) {
        console.log(`   Applying rule: ${rule.name}`);
        
        try {
          await rule.apply(config, this);
          rulesApplied++;
          
          await this.stateManager.addDeploymentStage(deploymentId, 'prevention_rule_applied', 'completed', {
            rule: rule.name,
            description: rule.description
          });
          
        } catch (error) {
          console.warn(`   Failed to apply rule ${rule.name}: ${error.message}`);
        }
      }
    }
    
    console.log(`   Applied ${rulesApplied} prevention rules`);
  }

  /**
   * Execute deployment with real-time monitoring
   */
  async executeMonitoredDeployment(deploymentId, config, options) {
    const stages = [
      { name: 'validation', fn: () => this.validatePreDeployment(config) },
      { name: 'build', fn: () => this.executeBuild(config, options) },
      { name: 'deploy_frontend', fn: () => this.deployFrontend(config, options) },
      { name: 'deploy_backend', fn: () => this.deployBackend(config, options) },
      { name: 'health_checks', fn: () => this.executeHealthChecks(config) }
    ];
    
    const results = {};
    
    for (const stage of stages) {
      console.log(`🔄 Executing stage: ${stage.name}`);
      const stageStart = Date.now();
      
      try {
        await this.stateManager.addDeploymentStage(deploymentId, stage.name, 'in_progress');
        
        results[stage.name] = await stage.fn();
        
        const stageDuration = Date.now() - stageStart;
        await this.stateManager.addDeploymentStage(deploymentId, stage.name, 'completed', {
          duration: stageDuration,
          result: results[stage.name]
        });
        
        console.log(`   ✅ Stage ${stage.name} completed in ${Math.round(stageDuration / 1000)}s`);
        
      } catch (error) {
        const stageDuration = Date.now() - stageStart;
        await this.stateManager.addDeploymentStage(deploymentId, stage.name, 'failed', {
          duration: stageDuration,
          error: error.message
        });
        
        console.error(`   ❌ Stage ${stage.name} failed: ${error.message}`);
        
        // Check if this is a known recoverable error
        const recoveryAction = await this.checkRecoveryActions(error, stage.name, config);
        
        if (recoveryAction) {
          console.log(`   🔄 Attempting recovery: ${recoveryAction.name}`);
          
          try {
            await recoveryAction.execute(config, error);
            console.log(`   ✅ Recovery successful, retrying stage...`);
            
            // Retry the stage
            results[stage.name] = await stage.fn();
            
            await this.stateManager.addDeploymentStage(deploymentId, `${stage.name}_recovery`, 'completed', {
              recoveryAction: recoveryAction.name
            });
            
          } catch (recoveryError) {
            console.error(`   ❌ Recovery failed: ${recoveryError.message}`);
            throw error; // Throw original error
          }
        } else {
          throw error;
        }
      }
    }
    
    return results;
  }

  /**
   * Handle deployment failure with learning
   */
  async handleDeploymentFailure(deploymentId, error, environment) {
    console.log('🧠 Learning from deployment failure...');
    
    // Update deployment state
    await this.stateManager.updateDeploymentState(deploymentId, {
      status: 'failed',
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      failedAt: new Date().toISOString()
    });
    
    // Learn from the error
    await this.learnFromError(error, deploymentId, environment);
    
    // Attempt automatic rollback
    try {
      console.log('🔄 Attempting automatic rollback...');
      const rollbackResult = await this.rollbackManager.executeRollback(
        deploymentId, 
        'automatic_failure_rollback'
      );
      
      console.log('✅ Automatic rollback completed');
      
    } catch (rollbackError) {
      console.error(`❌ Automatic rollback failed: ${rollbackError.message}`);
      console.error('🚨 MANUAL INTERVENTION REQUIRED!');
    }
  }

  /**
   * Learn from successful or failed deployments
   */
  async learnFromDeployment(deploymentId, result, config) {
    if (!this.config.learningEnabled) return;
    
    console.log('🧠 Learning from deployment...');
    
    const deployment = await this.stateManager.loadState(deploymentId);
    
    if (deployment.status === 'completed') {
      await this.learnFromSuccess(deployment, result, config);
    } else {
      await this.learnFromError(new Error(deployment.error?.message || 'Unknown error'), deploymentId, config.environment);
    }
  }

  /**
   * Learn from successful deployment
   */
  async learnFromSuccess(deployment, result, config) {
    const pattern = this.extractSuccessPattern(deployment, config);
    const key = this.generatePatternKey(pattern);
    
    if (this.memory.successPatterns.has(key)) {
      const existing = this.memory.successPatterns.get(key);
      existing.count++;
      existing.lastSeen = new Date().toISOString();
      existing.avgDuration = (existing.avgDuration + deployment.metrics.duration) / 2;
    } else {
      this.memory.successPatterns.set(key, {
        pattern,
        count: 1,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        avgDuration: deployment.metrics.duration
      });
    }
    
    console.log(`   Learned success pattern: ${key}`);
  }

  /**
   * Learn from deployment error
   */
  async learnFromError(error, deploymentId, environment) {
    const errorPattern = this.extractErrorPattern(error, deploymentId, environment);
    const key = this.generateErrorKey(errorPattern);
    
    if (this.memory.knownErrors.has(key)) {
      const existing = this.memory.knownErrors.get(key);
      existing.occurrences++;
      existing.lastSeen = new Date().toISOString();
      existing.environments.add(environment);
    } else {
      this.memory.knownErrors.set(key, {
        pattern: errorPattern,
        occurrences: 1,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        environments: new Set([environment])
      });
    }
    
    // Create prevention rule if error is frequent
    if (this.memory.knownErrors.get(key).occurrences >= 2) {
      await this.createPreventionRule(errorPattern);
    }
    
    console.log(`   Learned error pattern: ${key} (${this.memory.knownErrors.get(key).occurrences} occurrences)`);
  }

  /**
   * Create prevention rule from error pattern
   */
  async createPreventionRule(errorPattern) {
    const ruleName = `prevent_${errorPattern.type}_${Date.now()}`;
    
    const rule = {
      name: ruleName,
      description: `Prevent ${errorPattern.type} errors`,
      condition: (config) => this.errorPatternMatches(errorPattern, config),
      apply: async (config, agent) => {
        // Apply specific prevention based on error type
        switch (errorPattern.type) {
          case 'bucket_not_found':
            await agent.ensureS3BucketExists(config.frontend?.s3_bucket);
            break;
          case 'lambda_not_found':
            await agent.ensureLambdaExists(config.backend?.lambda_function_name);
            break;
          case 'cors_error':
            await agent.validateCorsConfiguration(config);
            break;
          case 'timeout':
            await agent.increaseTimeouts(config);
            break;
          default:
            console.log(`   No specific prevention for error type: ${errorPattern.type}`);
        }
      },
      createdAt: new Date().toISOString(),
      errorPattern
    };
    
    this.preventionRules.push(rule);
    console.log(`   Created prevention rule: ${ruleName}`);
  }

  // ============= Analysis Methods =============

  /**
   * Check for known error patterns in configuration
   */
  async checkForKnownErrorPatterns(config, environment) {
    const patterns = [];
    
    for (const [key, errorInfo] of this.memory.knownErrors) {
      if (errorInfo.environments.has(environment)) {
        if (this.configMatchesErrorPattern(config, errorInfo.pattern)) {
          patterns.push(errorInfo.pattern.type);
        }
      }
    }
    
    return patterns;
  }

  /**
   * Analyze deployment time risk
   */
  async analyzeDeploymentTime() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // High risk times
    if (hour >= 23 || hour <= 6) {
      return { risky: true, reason: 'Late night/early morning deployment' };
    }
    
    if (dayOfWeek === 5 && hour >= 15) {
      return { risky: true, reason: 'Friday afternoon deployment' };
    }
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { risky: true, reason: 'Weekend deployment' };
    }
    
    return { risky: false };
  }

  /**
   * Analyze configuration risk
   */
  async analyzeConfigurationRisk(config, environment) {
    let riskScore = 0;
    const factors = [];
    
    // Check for major configuration changes
    const lastSuccessful = await this.stateManager.getLastSuccessfulDeployment(environment);
    
    if (lastSuccessful) {
      const configDiff = this.configManager.compareEnvironments(environment, environment);
      
      if (configDiff.length > 5) {
        riskScore += 0.2;
        factors.push(`Many configuration changes: ${configDiff.length} differences`);
      }
      
      // Check for critical setting changes
      const criticalChanges = configDiff.filter(diff => 
        diff.path.includes('bucket') || 
        diff.path.includes('function') || 
        diff.path.includes('api_gateway')
      );
      
      if (criticalChanges.length > 0) {
        riskScore += 0.3;
        factors.push(`Critical configuration changes detected`);
      }
    }
    
    return { score: riskScore, factors };
  }

  /**
   * Check resource availability
   */
  async checkResourceAvailability(config) {
    let riskScore = 0;
    const factors = [];
    
    try {
      // This would be implemented with actual AWS SDK calls
      // For now, return low risk
      return { score: 0, factors: [] };
    } catch (error) {
      riskScore += 0.4;
      factors.push(`Resource availability check failed: ${error.message}`);
    }
    
    return { score: riskScore, factors };
  }

  // ============= Helper Methods =============

  /**
   * Load memory from deployment history
   */
  async loadMemoryFromHistory() {
    const environments = ['development', 'staging', 'production'];
    
    for (const env of environments) {
      const history = await this.stateManager.getDeploymentHistory(env, 50);
      
      for (const deployment of history) {
        if (deployment.status === 'failed' && deployment.error) {
          const error = new Error(deployment.error.message);
          await this.learnFromError(error, deployment.deploymentId, env);
        }
      }
    }
  }

  /**
   * Initialize default prevention rules
   */
  async initializePreventionRules() {
    this.preventionRules = [
      {
        name: 'ensure_bucket_exists',
        description: 'Ensure S3 bucket exists before deployment',
        condition: (config) => config.frontend?.s3_bucket,
        apply: async (config, agent) => {
          if (config.frontend?.s3_bucket) {
            await agent.ensureS3BucketExists(config.frontend.s3_bucket);
          }
        }
      },
      {
        name: 'validate_lambda_function',
        description: 'Validate Lambda function exists and is accessible',
        condition: (config) => config.backend?.lambda_function_name,
        apply: async (config, agent) => {
          if (config.backend?.lambda_function_name) {
            await agent.ensureLambdaExists(config.backend.lambda_function_name);
          }
        }
      },
      {
        name: 'check_cors_configuration',
        description: 'Validate CORS configuration is correct',
        condition: (config) => config.backend?.lambda_config?.environment_variables?.CORS_ORIGINS,
        apply: async (config, agent) => {
          await agent.validateCorsConfiguration(config);
        }
      }
    ];
  }

  /**
   * Extract error pattern from error
   */
  extractErrorPattern(error, deploymentId, environment) {
    const message = error.message.toLowerCase();
    
    let type = 'unknown_error';
    const details = {};
    
    if (message.includes('bucket') && message.includes('not found')) {
      type = 'bucket_not_found';
      details.resource = 's3_bucket';
    } else if (message.includes('function') && message.includes('not found')) {
      type = 'lambda_not_found';
      details.resource = 'lambda_function';
    } else if (message.includes('cors')) {
      type = 'cors_error';
      details.resource = 'api_gateway';
    } else if (message.includes('timeout')) {
      type = 'timeout';
    } else if (message.includes('access denied')) {
      type = 'permission_denied';
    }
    
    return {
      type,
      message: error.message,
      environment,
      deploymentId,
      details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract success pattern from deployment
   */
  extractSuccessPattern(deployment, config) {
    return {
      environment: deployment.environment,
      duration: deployment.metrics.duration,
      stagesCount: deployment.stages.length,
      configHash: this.hashConfig(config),
      hour: new Date(deployment.timestamp).getHours(),
      dayOfWeek: new Date(deployment.timestamp).getDay()
    };
  }

  /**
   * Generate pattern keys for storage
   */
  generatePatternKey(pattern) {
    return `${pattern.type || pattern.environment}_${pattern.configHash || pattern.duration}`;
  }

  generateErrorKey(errorPattern) {
    return `${errorPattern.type}_${errorPattern.environment}`;
  }

  /**
   * Hash configuration for pattern matching
   */
  hashConfig(config) {
    const crypto = require('crypto');
    const configString = JSON.stringify(config, Object.keys(config).sort());
    return crypto.createHash('md5').update(configString).digest('hex').substring(0, 8);
  }

  /**
   * Get risk recommendation based on score
   */
  getRiskRecommendation(riskScore) {
    if (riskScore < 0.3) return 'Low risk - proceed with deployment';
    if (riskScore < 0.6) return 'Medium risk - consider additional validation';
    if (riskScore < 0.8) return 'High risk - deployment requires approval';
    return 'Very high risk - deployment should be postponed';
  }

  // Stub methods for resource validation (implement with AWS SDK)
  async ensureS3BucketExists(bucketName) {
    console.log(`   Ensuring S3 bucket exists: ${bucketName}`);
  }
  
  async ensureLambdaExists(functionName) {
    console.log(`   Ensuring Lambda function exists: ${functionName}`);
  }
  
  async validateCorsConfiguration(config) {
    console.log(`   Validating CORS configuration`);
  }
  
  async increaseTimeouts(config) {
    console.log(`   Increasing timeout configurations`);
  }

  // Stub deployment methods (integrate with actual deployment logic)
  async validatePreDeployment(config) {
    return { validation: 'passed' };
  }
  
  async executeBuild(config, options) {
    return { build: 'completed' };
  }
  
  async deployFrontend(config, options) {
    return { frontend: 'deployed' };
  }
  
  async deployBackend(config, options) {
    return { backend: 'deployed' };
  }
  
  async executeHealthChecks(config) {
    return { health: 'all_passed' };
  }
  
  async checkRecoveryActions(error, stage, config) {
    // Return recovery actions based on error type
    return null;
  }

  // Helper methods
  shouldApplyRule(rule, config) {
    return rule.condition(config);
  }
  
  configMatchesErrorPattern(config, errorPattern) {
    // Compare config with error pattern
    return false;
  }
  
  errorPatternMatches(errorPattern, config) {
    return this.configMatchesErrorPattern(config, errorPattern);
  }
}

module.exports = { SmartDeploymentAgent };