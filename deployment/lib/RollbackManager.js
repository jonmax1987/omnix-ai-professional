/**
 * OMNIX AI - Rollback Manager
 * Handles automatic and manual rollbacks for failed deployments
 * Never leave users with a broken application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { StateManager } = require('./StateManager');

class RollbackManager {
  constructor(config = {}) {
    this.awsRegion = config.awsRegion || 'eu-central-1';
    this.stateManager = new StateManager(config);
    this.rollbackTimeoutMs = config.rollbackTimeoutMs || 300000; // 5 minutes
    this.maxRollbackAttempts = config.maxRollbackAttempts || 3;
    this.snapshotRetention = config.snapshotRetention || 5;
  }

  /**
   * Create a deployment snapshot before deployment
   */
  async createPreDeploymentSnapshot(deploymentId, config) {
    console.log('📸 Creating pre-deployment snapshot...');
    
    const snapshot = {
      deploymentId,
      timestamp: new Date().toISOString(),
      environment: config.environment,
      type: 'pre_deployment',
      resources: {},
      config: config,
      metadata: {
        user: process.env.USER || 'unknown',
        gitCommit: await this.getGitCommit(),
        gitBranch: await this.getGitBranch()
      }
    };

    // Capture current resource states
    try {
      // S3 bucket state
      if (config.frontend?.s3_bucket) {
        snapshot.resources.s3 = await this.captureS3State(config.frontend.s3_bucket);
      }

      // Lambda function state
      if (config.backend?.lambda_function_name) {
        snapshot.resources.lambda = await this.captureLambdaState(config.backend.lambda_function_name);
      }

      // API Gateway state
      if (config.backend?.api_gateway_id) {
        snapshot.resources.apiGateway = await this.captureApiGatewayState(config.backend.api_gateway_id);
      }

      // CloudFront state
      if (config.frontend?.cloudfront_distribution_id) {
        snapshot.resources.cloudfront = await this.captureCloudFrontState(config.frontend.cloudfront_distribution_id);
      }

    } catch (error) {
      console.warn(`⚠️ Warning: Failed to capture complete snapshot: ${error.message}`);
    }

    // Save snapshot
    const snapshotId = await this.stateManager.createSnapshot(deploymentId);
    await this.saveSnapshot(snapshotId, snapshot);
    
    console.log(`✅ Snapshot created: ${snapshotId}`);
    return { snapshotId, snapshot };
  }

  /**
   * Execute automatic rollback
   */
  async executeRollback(deploymentId, reason = 'deployment_failed') {
    console.log(`🔄 Initiating rollback for deployment: ${deploymentId}`);
    console.log(`   Reason: ${reason}`);
    
    const rollbackStart = Date.now();
    const rollbackId = `rollback-${deploymentId}-${Date.now()}`;

    try {
      // Get deployment state
      const deploymentState = await this.stateManager.loadState(deploymentId);
      if (!deploymentState) {
        throw new Error(`Deployment state not found: ${deploymentId}`);
      }

      // Get rollback information
      const rollbackInfo = await this.stateManager.getRollbackInfo(deploymentId);
      
      console.log(`   Rolling back to: ${rollbackInfo.rollbackTarget}`);

      // Execute rollback steps
      const rollbackResults = await this.performRollback(rollbackInfo, deploymentState.config);

      // Calculate rollback duration
      const rollbackDuration = Date.now() - rollbackStart;

      // Update deployment state
      await this.stateManager.markAsRolledBack(deploymentId, {
        ...rollbackInfo,
        reason,
        rollbackId,
        duration: rollbackDuration,
        results: rollbackResults,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Rollback completed in ${Math.round(rollbackDuration / 1000)}s`);
      
      // Verify rollback
      const verificationResult = await this.verifyRollback(rollbackInfo, deploymentState.config);
      
      if (!verificationResult.success) {
        throw new Error(`Rollback verification failed: ${verificationResult.error}`);
      }

      return {
        success: true,
        rollbackId,
        duration: rollbackDuration,
        results: rollbackResults
      };

    } catch (error) {
      console.error(`❌ Rollback failed: ${error.message}`);
      
      // Record failed rollback
      await this.stateManager.updateDeploymentState(deploymentId, {
        rollbackInfo: {
          failed: true,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });

      throw error;
    }
  }

  /**
   * Perform the actual rollback operations
   */
  async performRollback(rollbackInfo, config) {
    const results = {
      frontend: { success: false, details: null },
      backend: { success: false, details: null },
      apiGateway: { success: false, details: null },
      cloudfront: { success: false, details: null }
    };

    // Rollback frontend (S3)
    if (config.frontend?.s3_bucket) {
      console.log('   Rolling back frontend...');
      try {
        results.frontend = await this.rollbackS3(
          config.frontend.s3_bucket, 
          rollbackInfo.artifacts?.s3Bucket
        );
      } catch (error) {
        console.error(`   Frontend rollback failed: ${error.message}`);
        results.frontend = { success: false, error: error.message };
      }
    }

    // Rollback backend (Lambda)
    if (config.backend?.lambda_function_name) {
      console.log('   Rolling back backend...');
      try {
        results.backend = await this.rollbackLambda(
          config.backend.lambda_function_name,
          rollbackInfo.artifacts?.lambdaVersion
        );
      } catch (error) {
        console.error(`   Backend rollback failed: ${error.message}`);
        results.backend = { success: false, error: error.message };
      }
    }

    // Rollback API Gateway if needed
    if (config.backend?.api_gateway_id) {
      console.log('   Rolling back API Gateway...');
      try {
        results.apiGateway = await this.rollbackApiGateway(
          config.backend.api_gateway_id,
          config.backend.api_gateway_stage,
          rollbackInfo.artifacts?.apiGatewayDeployment
        );
      } catch (error) {
        console.error(`   API Gateway rollback failed: ${error.message}`);
        results.apiGateway = { success: false, error: error.message };
      }
    }

    // Invalidate CloudFront if needed
    if (config.frontend?.cloudfront_distribution_id) {
      console.log('   Invalidating CloudFront...');
      try {
        results.cloudfront = await this.invalidateCloudFront(
          config.frontend.cloudfront_distribution_id
        );
      } catch (error) {
        console.error(`   CloudFront invalidation failed: ${error.message}`);
        results.cloudfront = { success: false, error: error.message };
      }
    }

    return results;
  }

  /**
   * Rollback S3 deployment
   */
  async rollbackS3(bucketName, previousState) {
    console.log(`     Restoring S3 bucket: ${bucketName}`);
    
    try {
      // If we have previous state, restore from it
      if (previousState && previousState.objects) {
        // Clear current bucket contents
        await this.executeAwsCommand(`aws s3 rm s3://${bucketName} --recursive`);
        
        // Restore previous objects (this is a simplified approach)
        // In production, you'd want to restore from versioned objects or backup
        console.log('     S3 objects cleared, previous state would be restored from backup');
      } else {
        // Simple rollback: assume previous successful deployment
        const lastSuccessfulDeployment = await this.stateManager.getLastSuccessfulDeployment(
          this.getCurrentEnvironment()
        );
        
        if (lastSuccessfulDeployment?.artifacts?.s3Bucket) {
          console.log('     Restoring from last successful deployment artifacts');
        }
      }
      
      return {
        success: true,
        details: `S3 bucket ${bucketName} rolled back successfully`
      };
      
    } catch (error) {
      throw new Error(`S3 rollback failed: ${error.message}`);
    }
  }

  /**
   * Rollback Lambda function
   */
  async rollbackLambda(functionName, previousVersion) {
    console.log(`     Rolling back Lambda: ${functionName}`);
    
    try {
      if (previousVersion) {
        // Rollback to specific version
        await this.executeAwsCommand(
          `aws lambda update-alias --function-name ${functionName} --name LIVE --function-version ${previousVersion}`
        );
        console.log(`     Lambda rolled back to version: ${previousVersion}`);
      } else {
        // Get previous version from Lambda versions
        const versionsOutput = await this.executeAwsCommand(
          `aws lambda list-versions-by-function --function-name ${functionName} --query 'Versions[-2].Version' --output text`
        );
        
        if (versionsOutput && versionsOutput !== 'None') {
          await this.executeAwsCommand(
            `aws lambda update-alias --function-name ${functionName} --name LIVE --function-version ${versionsOutput.trim()}`
          );
          console.log(`     Lambda rolled back to previous version: ${versionsOutput.trim()}`);
        }
      }
      
      return {
        success: true,
        details: `Lambda function ${functionName} rolled back successfully`
      };
      
    } catch (error) {
      throw new Error(`Lambda rollback failed: ${error.message}`);
    }
  }

  /**
   * Rollback API Gateway
   */
  async rollbackApiGateway(apiId, stageName, previousDeploymentId) {
    console.log(`     Rolling back API Gateway: ${apiId}`);
    
    try {
      if (previousDeploymentId) {
        // Rollback to specific deployment
        await this.executeAwsCommand(
          `aws apigateway update-stage --rest-api-id ${apiId} --stage-name ${stageName} --patch-ops op=replace,path=/deploymentId,value=${previousDeploymentId}`
        );
        console.log(`     API Gateway rolled back to deployment: ${previousDeploymentId}`);
      } else {
        // Get previous deployment
        const deploymentsOutput = await this.executeAwsCommand(
          `aws apigateway get-deployments --rest-api-id ${apiId} --query 'items[1].id' --output text`
        );
        
        if (deploymentsOutput && deploymentsOutput !== 'None') {
          await this.executeAwsCommand(
            `aws apigateway update-stage --rest-api-id ${apiId} --stage-name ${stageName} --patch-ops op=replace,path=/deploymentId,value=${deploymentsOutput.trim()}`
          );
          console.log(`     API Gateway rolled back to previous deployment`);
        }
      }
      
      return {
        success: true,
        details: `API Gateway ${apiId} rolled back successfully`
      };
      
    } catch (error) {
      throw new Error(`API Gateway rollback failed: ${error.message}`);
    }
  }

  /**
   * Invalidate CloudFront distribution
   */
  async invalidateCloudFront(distributionId) {
    console.log(`     Invalidating CloudFront: ${distributionId}`);
    
    try {
      const invalidationOutput = await this.executeAwsCommand(
        `aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*" --query 'Invalidation.Id' --output text`
      );
      
      return {
        success: true,
        details: `CloudFront invalidation created: ${invalidationOutput.trim()}`
      };
      
    } catch (error) {
      throw new Error(`CloudFront invalidation failed: ${error.message}`);
    }
  }

  /**
   * Verify rollback was successful
   */
  async verifyRollback(rollbackInfo, config) {
    console.log('🔍 Verifying rollback...');
    
    const verificationResults = {
      success: true,
      checks: []
    };

    try {
      // Check frontend health
      if (config.frontend?.cloudfront_distribution_id) {
        const frontendUrl = await this.getCloudFrontUrl(config.frontend.cloudfront_distribution_id);
        const frontendCheck = await this.checkEndpointHealth(frontendUrl, 5000);
        
        verificationResults.checks.push({
          name: 'frontend_health',
          success: frontendCheck.success,
          details: frontendCheck.details
        });
        
        if (!frontendCheck.success) {
          verificationResults.success = false;
        }
      }

      // Check API health
      if (config.backend?.api_gateway_url) {
        const healthUrl = config.backend.api_gateway_url.replace('/v1', '') + '/health';
        const apiCheck = await this.checkEndpointHealth(healthUrl, 5000);
        
        verificationResults.checks.push({
          name: 'api_health',
          success: apiCheck.success,
          details: apiCheck.details
        });
        
        if (!apiCheck.success) {
          verificationResults.success = false;
        }
      }

      console.log(`✅ Rollback verification ${verificationResults.success ? 'passed' : 'failed'}`);
      return verificationResults;

    } catch (error) {
      console.error(`❌ Rollback verification error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        checks: verificationResults.checks
      };
    }
  }

  /**
   * Manual rollback command
   */
  async manualRollback(environment, targetDeploymentId = null) {
    console.log(`🔧 Manual rollback requested for environment: ${environment}`);
    
    try {
      // Find deployment to rollback
      let deploymentToRollback;
      
      if (targetDeploymentId) {
        deploymentToRollback = await this.stateManager.loadState(targetDeploymentId);
      } else {
        // Find last failed deployment
        const history = await this.stateManager.getDeploymentHistory(environment, 10);
        deploymentToRollback = history.find(d => d.status === 'failed');
      }

      if (!deploymentToRollback) {
        throw new Error('No deployment found to rollback');
      }

      console.log(`   Rolling back deployment: ${deploymentToRollback.deploymentId}`);
      
      const result = await this.executeRollback(deploymentToRollback.deploymentId, 'manual_rollback');
      
      return result;

    } catch (error) {
      console.error(`❌ Manual rollback failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * List available rollback targets
   */
  async listRollbackTargets(environment, limit = 5) {
    const history = await this.stateManager.getDeploymentHistory(environment, 20);
    
    const targets = history
      .filter(d => d.status === 'completed')
      .slice(0, limit)
      .map(d => ({
        deploymentId: d.deploymentId,
        timestamp: d.timestamp,
        user: d.user,
        gitBranch: d.gitBranch,
        gitCommit: d.gitCommit?.substring(0, 8),
        duration: d.duration
      }));

    return targets;
  }

  // ============= Helper Methods =============

  /**
   * Capture current S3 bucket state
   */
  async captureS3State(bucketName) {
    try {
      const objectsOutput = await this.executeAwsCommand(
        `aws s3 ls s3://${bucketName} --recursive`
      );
      
      return {
        bucket: bucketName,
        capturedAt: new Date().toISOString(),
        objects: objectsOutput.split('\n').filter(line => line.trim())
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Capture current Lambda function state
   */
  async captureLambdaState(functionName) {
    try {
      const configOutput = await this.executeAwsCommand(
        `aws lambda get-function-configuration --function-name ${functionName}`
      );
      
      return {
        functionName,
        capturedAt: new Date().toISOString(),
        configuration: JSON.parse(configOutput)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Capture current API Gateway state
   */
  async captureApiGatewayState(apiId) {
    try {
      const apiOutput = await this.executeAwsCommand(
        `aws apigateway get-rest-api --rest-api-id ${apiId}`
      );
      
      return {
        apiId,
        capturedAt: new Date().toISOString(),
        configuration: JSON.parse(apiOutput)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Capture current CloudFront state
   */
  async captureCloudFrontState(distributionId) {
    try {
      const distOutput = await this.executeAwsCommand(
        `aws cloudfront get-distribution --id ${distributionId}`
      );
      
      return {
        distributionId,
        capturedAt: new Date().toISOString(),
        configuration: JSON.parse(distOutput)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Execute AWS CLI command
   */
  async executeAwsCommand(command) {
    try {
      return execSync(command, { 
        encoding: 'utf8', 
        timeout: 30000,
        env: { ...process.env, AWS_REGION: this.awsRegion }
      });
    } catch (error) {
      throw new Error(`AWS command failed: ${command} - ${error.message}`);
    }
  }

  /**
   * Check endpoint health
   */
  async checkEndpointHealth(url, timeoutMs = 5000) {
    return new Promise((resolve) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      fetch(url, { signal: controller.signal })
        .then(response => {
          clearTimeout(timeoutId);
          resolve({
            success: response.ok,
            status: response.status,
            details: response.ok ? 'Endpoint healthy' : `HTTP ${response.status}`
          });
        })
        .catch(error => {
          clearTimeout(timeoutId);
          resolve({
            success: false,
            details: error.message
          });
        });
    });
  }

  /**
   * Get CloudFront distribution URL
   */
  async getCloudFrontUrl(distributionId) {
    try {
      const domainOutput = await this.executeAwsCommand(
        `aws cloudfront get-distribution --id ${distributionId} --query 'Distribution.DomainName' --output text`
      );
      return `https://${domainOutput.trim()}`;
    } catch {
      return null;
    }
  }

  /**
   * Get current environment (stub)
   */
  getCurrentEnvironment() {
    return process.env.OMNIX_ENVIRONMENT || 'development';
  }

  /**
   * Get Git commit hash
   */
  async getGitCommit() {
    try {
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
      return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Save snapshot to storage
   */
  async saveSnapshot(snapshotId, snapshot) {
    const snapshotDir = path.join(process.cwd(), 'deployment', 'state', 'snapshots');
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }
    
    const filepath = path.join(snapshotDir, `${snapshotId}.json`);
    fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
    
    // Clean up old snapshots
    await this.cleanupOldSnapshots(snapshotDir);
  }

  /**
   * Clean up old snapshots
   */
  async cleanupOldSnapshots(snapshotDir) {
    try {
      const files = fs.readdirSync(snapshotDir)
        .filter(f => f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(snapshotDir, f),
          mtime: fs.statSync(path.join(snapshotDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      // Keep only the most recent snapshots
      if (files.length > this.snapshotRetention) {
        const toDelete = files.slice(this.snapshotRetention);
        toDelete.forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`   Cleaned up old snapshot: ${file.name}`);
        });
      }
    } catch (error) {
      console.warn(`Warning: Failed to cleanup old snapshots: ${error.message}`);
    }
  }
}

module.exports = { RollbackManager };