/**
 * OMNIX AI - Deployment State Manager
 * Tracks all deployments, maintains history, and enables rollback
 * Prevents deployment failures by learning from past deployments
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');

class StateManager {
  constructor(config = {}) {
    this.stateStorage = config.stateStorage || 'local'; // 'local', 's3', or 'dynamodb'
    this.localStatePath = path.join(process.cwd(), 'deployment', 'state');
    this.s3Bucket = config.s3Bucket || 'omnix-ai-deployment-state';
    this.dynamoTable = config.dynamoTable || 'omnix-ai-deployment-state';
    this.maxHistoryItems = config.maxHistoryItems || 100;
    
    // Initialize AWS clients if needed
    if (this.stateStorage === 's3') {
      this.s3Client = new S3Client({ region: config.awsRegion || 'eu-central-1' });
    }
    if (this.stateStorage === 'dynamodb') {
      this.dynamoClient = new DynamoDBClient({ region: config.awsRegion || 'eu-central-1' });
    }
    
    // Ensure local state directory exists
    if (!fs.existsSync(this.localStatePath)) {
      fs.mkdirSync(this.localStatePath, { recursive: true });
    }
  }

  /**
   * Create a new deployment state record
   */
  async createDeploymentState(environment, config, metadata = {}) {
    const deploymentId = this.generateDeploymentId();
    const timestamp = new Date().toISOString();
    
    const state = {
      deploymentId,
      environment,
      timestamp,
      status: 'in_progress',
      config: this.sanitizeConfig(config),
      metadata: {
        ...metadata,
        user: process.env.USER || 'unknown',
        hostname: require('os').hostname(),
        gitCommit: await this.getGitCommit(),
        gitBranch: await this.getGitBranch(),
        nodeVersion: process.version,
        platform: process.platform
      },
      stages: [],
      artifacts: {},
      healthChecks: {},
      metrics: {
        startTime: Date.now(),
        duration: null,
        stagesCompleted: 0,
        stagesFailed: 0
      },
      errors: [],
      warnings: [],
      rollbackInfo: null
    };
    
    await this.saveState(deploymentId, state);
    console.log(`📝 Created deployment state: ${deploymentId}`);
    
    return state;
  }

  /**
   * Update deployment state
   */
  async updateDeploymentState(deploymentId, updates) {
    const state = await this.loadState(deploymentId);
    
    if (!state) {
      throw new Error(`Deployment state not found: ${deploymentId}`);
    }
    
    // Merge updates
    Object.assign(state, updates);
    
    // Update metrics
    if (updates.status === 'completed' || updates.status === 'failed') {
      state.metrics.endTime = Date.now();
      state.metrics.duration = state.metrics.endTime - state.metrics.startTime;
    }
    
    await this.saveState(deploymentId, state);
    
    return state;
  }

  /**
   * Add a deployment stage
   */
  async addDeploymentStage(deploymentId, stageName, status, details = {}) {
    const state = await this.loadState(deploymentId);
    
    if (!state) {
      throw new Error(`Deployment state not found: ${deploymentId}`);
    }
    
    const stage = {
      name: stageName,
      status,
      timestamp: new Date().toISOString(),
      duration: details.duration || null,
      details
    };
    
    state.stages.push(stage);
    
    // Update metrics
    if (status === 'completed') {
      state.metrics.stagesCompleted++;
    } else if (status === 'failed') {
      state.metrics.stagesFailed++;
    }
    
    await this.saveState(deploymentId, state);
    
    return stage;
  }

  /**
   * Record deployment artifacts
   */
  async recordArtifacts(deploymentId, artifacts) {
    const state = await this.loadState(deploymentId);
    
    if (!state) {
      throw new Error(`Deployment state not found: ${deploymentId}`);
    }
    
    state.artifacts = {
      ...state.artifacts,
      ...artifacts,
      recorded: new Date().toISOString()
    };
    
    await this.saveState(deploymentId, state);
  }

  /**
   * Record health check results
   */
  async recordHealthChecks(deploymentId, healthChecks) {
    const state = await this.loadState(deploymentId);
    
    if (!state) {
      throw new Error(`Deployment state not found: ${deploymentId}`);
    }
    
    state.healthChecks = {
      ...healthChecks,
      timestamp: new Date().toISOString()
    };
    
    await this.saveState(deploymentId, state);
  }

  /**
   * Get deployment history for an environment
   */
  async getDeploymentHistory(environment, limit = 10) {
    const history = await this.loadHistory();
    
    const filtered = history
      .filter(item => !environment || item.environment === environment)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    return filtered;
  }

  /**
   * Get last successful deployment
   */
  async getLastSuccessfulDeployment(environment) {
    const history = await this.getDeploymentHistory(environment, 50);
    
    return history.find(deployment => deployment.status === 'completed');
  }

  /**
   * Get deployment statistics
   */
  async getDeploymentStatistics(environment, days = 30) {
    const history = await this.getDeploymentHistory(environment, 1000);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const recent = history.filter(d => new Date(d.timestamp) > cutoffDate);
    
    const stats = {
      total: recent.length,
      successful: recent.filter(d => d.status === 'completed').length,
      failed: recent.filter(d => d.status === 'failed').length,
      rolledBack: recent.filter(d => d.rollbackInfo !== null).length,
      averageDuration: 0,
      successRate: 0,
      commonErrors: {},
      peakHours: {},
      byUser: {},
      byBranch: {}
    };
    
    // Calculate average duration
    const durations = recent
      .filter(d => d.metrics?.duration)
      .map(d => d.metrics.duration);
    
    if (durations.length > 0) {
      stats.averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    }
    
    // Calculate success rate
    if (stats.total > 0) {
      stats.successRate = (stats.successful / stats.total) * 100;
    }
    
    // Analyze common errors
    recent.forEach(deployment => {
      if (deployment.errors) {
        deployment.errors.forEach(error => {
          const key = error.type || 'unknown';
          stats.commonErrors[key] = (stats.commonErrors[key] || 0) + 1;
        });
      }
      
      // Track by user
      const user = deployment.metadata?.user || 'unknown';
      stats.byUser[user] = (stats.byUser[user] || 0) + 1;
      
      // Track by branch
      const branch = deployment.metadata?.gitBranch || 'unknown';
      stats.byBranch[branch] = (stats.byBranch[branch] || 0) + 1;
      
      // Track peak hours
      const hour = new Date(deployment.timestamp).getHours();
      stats.peakHours[hour] = (stats.peakHours[hour] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Compare two deployments
   */
  async compareDeployments(deploymentId1, deploymentId2) {
    const state1 = await this.loadState(deploymentId1);
    const state2 = await this.loadState(deploymentId2);
    
    if (!state1 || !state2) {
      throw new Error('One or both deployment states not found');
    }
    
    const comparison = {
      deployment1: {
        id: deploymentId1,
        environment: state1.environment,
        status: state1.status,
        timestamp: state1.timestamp,
        duration: state1.metrics?.duration
      },
      deployment2: {
        id: deploymentId2,
        environment: state2.environment,
        status: state2.status,
        timestamp: state2.timestamp,
        duration: state2.metrics?.duration
      },
      configDifferences: this.compareConfigs(state1.config, state2.config),
      stageDifferences: this.compareStages(state1.stages, state2.stages),
      performanceDelta: {
        duration: (state2.metrics?.duration || 0) - (state1.metrics?.duration || 0),
        stagesCompleted: (state2.metrics?.stagesCompleted || 0) - (state1.metrics?.stagesCompleted || 0)
      }
    };
    
    return comparison;
  }

  /**
   * Create a deployment snapshot for rollback
   */
  async createSnapshot(deploymentId) {
    const state = await this.loadState(deploymentId);
    
    if (!state) {
      throw new Error(`Deployment state not found: ${deploymentId}`);
    }
    
    const snapshot = {
      deploymentId,
      timestamp: new Date().toISOString(),
      environment: state.environment,
      config: state.config,
      artifacts: state.artifacts,
      metadata: state.metadata
    };
    
    const snapshotId = `snapshot-${deploymentId}`;
    await this.saveSnapshot(snapshotId, snapshot);
    
    return snapshotId;
  }

  /**
   * Get rollback information
   */
  async getRollbackInfo(deploymentId) {
    const state = await this.loadState(deploymentId);
    
    if (!state) {
      throw new Error(`Deployment state not found: ${deploymentId}`);
    }
    
    const previousDeployment = await this.getLastSuccessfulDeployment(state.environment);
    
    if (!previousDeployment) {
      throw new Error('No previous successful deployment found for rollback');
    }
    
    return {
      currentDeployment: deploymentId,
      rollbackTarget: previousDeployment.deploymentId,
      environment: state.environment,
      artifacts: previousDeployment.artifacts,
      config: previousDeployment.config
    };
  }

  /**
   * Mark deployment as rolled back
   */
  async markAsRolledBack(deploymentId, rollbackInfo) {
    const state = await this.loadState(deploymentId);
    
    if (!state) {
      throw new Error(`Deployment state not found: ${deploymentId}`);
    }
    
    state.status = 'rolled_back';
    state.rollbackInfo = {
      ...rollbackInfo,
      timestamp: new Date().toISOString()
    };
    
    await this.saveState(deploymentId, state);
  }

  /**
   * Analyze deployment patterns
   */
  async analyzePatterns(environment) {
    const stats = await this.getDeploymentStatistics(environment, 90);
    
    const patterns = {
      mostSuccessfulHour: null,
      mostFailureHour: null,
      recommendedDeploymentTime: null,
      riskFactors: [],
      recommendations: []
    };
    
    // Find best deployment times
    const successByHour = {};
    const failureByHour = {};
    
    const history = await this.getDeploymentHistory(environment, 200);
    
    history.forEach(deployment => {
      const hour = new Date(deployment.timestamp).getHours();
      if (deployment.status === 'completed') {
        successByHour[hour] = (successByHour[hour] || 0) + 1;
      } else if (deployment.status === 'failed') {
        failureByHour[hour] = (failureByHour[hour] || 0) + 1;
      }
    });
    
    // Find most successful hour
    let maxSuccess = 0;
    for (const [hour, count] of Object.entries(successByHour)) {
      if (count > maxSuccess) {
        maxSuccess = count;
        patterns.mostSuccessfulHour = parseInt(hour);
      }
    }
    
    // Find most failure hour
    let maxFailure = 0;
    for (const [hour, count] of Object.entries(failureByHour)) {
      if (count > maxFailure) {
        maxFailure = count;
        patterns.mostFailureHour = parseInt(hour);
      }
    }
    
    // Determine risk factors
    if (stats.successRate < 90) {
      patterns.riskFactors.push('Low success rate: ' + stats.successRate.toFixed(1) + '%');
    }
    
    if (stats.commonErrors.length > 0) {
      const topError = Object.entries(stats.commonErrors)
        .sort((a, b) => b[1] - a[1])[0];
      patterns.riskFactors.push(`Common error: ${topError[0]} (${topError[1]} occurrences)`);
    }
    
    // Generate recommendations
    if (patterns.mostSuccessfulHour !== null) {
      patterns.recommendations.push(
        `Deploy around ${patterns.mostSuccessfulHour}:00 for best success rate`
      );
    }
    
    if (patterns.mostFailureHour !== null) {
      patterns.recommendations.push(
        `Avoid deploying around ${patterns.mostFailureHour}:00`
      );
    }
    
    if (stats.averageDuration > 300000) { // 5 minutes
      patterns.recommendations.push(
        'Consider optimizing deployment process to reduce duration'
      );
    }
    
    return patterns;
  }

  // ============= Helper Methods =============

  /**
   * Generate unique deployment ID
   */
  generateDeploymentId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `deploy-${timestamp}-${random}`;
  }

  /**
   * Sanitize configuration for storage
   */
  sanitizeConfig(config) {
    const sanitized = JSON.parse(JSON.stringify(config));
    
    // Remove sensitive values
    const sensitiveKeys = ['api_key', 'secret', 'password', 'token', 'credential'];
    
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        } else if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          obj[key] = '***REDACTED***';
        }
      }
    };
    
    sanitizeObject(sanitized);
    return sanitized;
  }

  /**
   * Compare configurations
   */
  compareConfigs(config1, config2) {
    const differences = [];
    
    const compareObjects = (obj1, obj2, path = '') => {
      const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
      
      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];
        
        if (typeof val1 === 'object' && typeof val2 === 'object') {
          compareObjects(val1, val2, newPath);
        } else if (val1 !== val2) {
          differences.push({
            path: newPath,
            before: val1,
            after: val2
          });
        }
      }
    };
    
    compareObjects(config1, config2);
    return differences;
  }

  /**
   * Compare deployment stages
   */
  compareStages(stages1, stages2) {
    const comparison = {
      added: [],
      removed: [],
      modified: []
    };
    
    const stages1Names = new Set(stages1.map(s => s.name));
    const stages2Names = new Set(stages2.map(s => s.name));
    
    // Find added stages
    for (const stage of stages2) {
      if (!stages1Names.has(stage.name)) {
        comparison.added.push(stage.name);
      }
    }
    
    // Find removed stages
    for (const stage of stages1) {
      if (!stages2Names.has(stage.name)) {
        comparison.removed.push(stage.name);
      }
    }
    
    return comparison;
  }

  /**
   * Get Git commit hash
   */
  async getGitCommit() {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse HEAD').toString().trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get Git branch
   */
  async getGitBranch() {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch {
      return 'unknown';
    }
  }

  // ============= Storage Methods =============

  /**
   * Save state to storage
   */
  async saveState(deploymentId, state) {
    if (this.stateStorage === 'local') {
      const filepath = path.join(this.localStatePath, `${deploymentId}.json`);
      fs.writeFileSync(filepath, JSON.stringify(state, null, 2));
    } else if (this.stateStorage === 's3') {
      await this.saveToS3(deploymentId, state);
    } else if (this.stateStorage === 'dynamodb') {
      await this.saveToDynamoDB(deploymentId, state);
    }
    
    // Also update history
    await this.updateHistory(state);
  }

  /**
   * Load state from storage
   */
  async loadState(deploymentId) {
    if (this.stateStorage === 'local') {
      const filepath = path.join(this.localStatePath, `${deploymentId}.json`);
      if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
      }
    } else if (this.stateStorage === 's3') {
      return await this.loadFromS3(deploymentId);
    } else if (this.stateStorage === 'dynamodb') {
      return await this.loadFromDynamoDB(deploymentId);
    }
    
    return null;
  }

  /**
   * Update deployment history
   */
  async updateHistory(state) {
    const historyFile = path.join(this.localStatePath, 'history.json');
    let history = [];
    
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
    
    // Remove existing entry for this deployment
    history = history.filter(item => item.deploymentId !== state.deploymentId);
    
    // Add summary of current state
    history.push({
      deploymentId: state.deploymentId,
      environment: state.environment,
      timestamp: state.timestamp,
      status: state.status,
      duration: state.metrics?.duration,
      user: state.metadata?.user,
      gitBranch: state.metadata?.gitBranch,
      gitCommit: state.metadata?.gitCommit,
      errors: state.errors?.length || 0,
      rollbackInfo: state.rollbackInfo
    });
    
    // Keep only recent history
    history = history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, this.maxHistoryItems);
    
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  }

  /**
   * Load deployment history
   */
  async loadHistory() {
    const historyFile = path.join(this.localStatePath, 'history.json');
    
    if (fs.existsSync(historyFile)) {
      return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
    
    return [];
  }

  /**
   * Save snapshot
   */
  async saveSnapshot(snapshotId, snapshot) {
    const snapshotDir = path.join(this.localStatePath, 'snapshots');
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }
    
    const filepath = path.join(snapshotDir, `${snapshotId}.json`);
    fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
  }

  // S3 storage methods (stubs - implement with AWS SDK)
  async saveToS3(key, data) {
    // Implementation with AWS SDK
  }
  
  async loadFromS3(key) {
    // Implementation with AWS SDK
  }
  
  // DynamoDB storage methods (stubs - implement with AWS SDK)
  async saveToDynamoDB(key, data) {
    // Implementation with AWS SDK
  }
  
  async loadFromDynamoDB(key) {
    // Implementation with AWS SDK
  }
}

module.exports = { StateManager };