import { Injectable } from '@nestjs/common';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBService } from './dynamodb.service';
import { MonitoringService } from './monitoring.service';
import { 
  AIAnalysisResult, 
  BedrockAnalysisRequest,
  ABTestResult,
  ModelPerformanceMetrics 
} from '../interfaces/ai-analysis.interface';

export interface ABTestConfig {
  testId: string;
  testName: string;
  modelA: {
    id: string;
    name: string;
    weight: number;
  };
  modelB: {
    id: string;
    name: string;
    weight: number;
  };
  startDate: string;
  endDate: string;
  active: boolean;
  metrics: string[];
}

export interface ABTestMetrics {
  testId: string;
  modelId: string;
  totalRequests: number;
  successRate: number;
  averageProcessingTime: number;
  averageConfidence: number;
  averageTokenCost: number;
  customerSatisfactionScore?: number;
}

@Injectable()
export class ABTestingService {
  private bedrock: BedrockRuntimeClient;
  private readonly testsTable = 'ab-tests';
  private readonly metricsTable = 'ab-test-metrics';
  
  // Available Bedrock models for testing
  private readonly availableModels = {
    'claude-3-haiku': 'anthropic.claude-3-haiku-20240307-v1:0',
    'claude-3-sonnet': 'anthropic.claude-3-sonnet-20240229-v1:0',
    'claude-3-5-sonnet': 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  };

  constructor(
    private readonly dynamoDBService: DynamoDBService,
    private readonly monitoring: MonitoringService,
  ) {
    this.bedrock = new BedrockRuntimeClient({
      region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
    });
  }

  /**
   * Create a new A/B test configuration
   */
  async createABTest(config: ABTestConfig): Promise<void> {
    console.log(`🧪 Creating A/B test: ${config.testName}`);
    
    await this.dynamoDBService.put(this.testsTable, {
      testId: config.testId,
      testName: config.testName,
      modelA: config.modelA,
      modelB: config.modelB,
      startDate: config.startDate,
      endDate: config.endDate,
      active: config.active,
      metrics: config.metrics,
      createdAt: new Date().toISOString(),
    });
    
    // Initialize metrics tables for both models
    await this.initializeTestMetrics(config.testId, config.modelA.id);
    await this.initializeTestMetrics(config.testId, config.modelB.id);
    
    console.log(`✅ A/B test created: ${config.testId}`);
  }

  /**
   * Get model assignment for a customer based on active A/B tests
   */
  async getModelAssignment(customerId: string, analysisType: string): Promise<{
    modelId: string;
    modelName: string;
    testId?: string;
  }> {
    // Check for active A/B tests
    const activeTests = await this.getActiveTests(analysisType);
    
    if (activeTests.length === 0) {
      // No active tests, use default model
      return {
        modelId: this.availableModels['claude-3-haiku'],
        modelName: 'claude-3-haiku',
      };
    }

    // Use the first active test (can be extended for multiple concurrent tests)
    const test = activeTests[0];
    const assignment = this.assignCustomerToModel(customerId, test);
    
    console.log(`🎯 Customer ${customerId} assigned to model ${assignment.modelName} (test: ${test.testId})`);
    
    return {
      modelId: assignment.modelId,
      modelName: assignment.modelName,
      testId: test.testId,
    };
  }

  /**
   * Invoke Bedrock model with A/B testing support
   */
  async invokeModelWithABTesting(
    request: BedrockAnalysisRequest,
    prompt: string
  ): Promise<{
    response: string;
    modelUsed: string;
    testId?: string;
    processingTime: number;
    inputTokens: number;
    outputTokens: number;
  }> {
    const startTime = Date.now();
    
    // Get model assignment
    const assignment = await this.getModelAssignment(
      request.customerId, 
      request.analysisType
    );
    
    try {
      // Invoke the assigned model
      const response = await this.invokeBedrockModel(assignment.modelId, prompt);
      const processingTime = Date.now() - startTime;
      
      // Estimate tokens for cost tracking
      const inputTokens = this.estimateTokens(prompt);
      const outputTokens = this.estimateTokens(response);
      
      // Record A/B test metrics if this is part of a test
      if (assignment.testId) {
        await this.recordABTestMetrics(assignment.testId, assignment.modelName, {
          success: true,
          processingTime,
          inputTokens,
          outputTokens,
          confidence: this.extractConfidenceFromResponse(response),
        });
      }
      
      return {
        response,
        modelUsed: assignment.modelName,
        testId: assignment.testId,
        processingTime,
        inputTokens,
        outputTokens,
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Record failure in A/B test metrics
      if (assignment.testId) {
        await this.recordABTestMetrics(assignment.testId, assignment.modelName, {
          success: false,
          processingTime,
          inputTokens: 0,
          outputTokens: 0,
          confidence: 0,
        });
      }
      
      throw error;
    }
  }

  /**
   * Get A/B test results and performance comparison
   */
  async getABTestResults(testId: string): Promise<ABTestResult> {
    console.log(`📊 Generating A/B test results for ${testId}`);
    
    const test = await this.getTestConfig(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }
    
    // Get metrics for both models
    const modelAMetrics = await this.getModelMetrics(testId, test.modelA.id);
    const modelBMetrics = await this.getModelMetrics(testId, test.modelB.id);
    
    // Calculate statistical significance
    const significance = this.calculateStatisticalSignificance(modelAMetrics, modelBMetrics);
    
    // Determine winner based on multiple metrics
    const winner = this.determineWinner(modelAMetrics, modelBMetrics);
    
    return {
      testId,
      testName: test.testName,
      status: this.getTestStatus(test),
      modelA: {
        name: test.modelA.name,
        metrics: modelAMetrics,
      },
      modelB: {
        name: test.modelB.name,
        metrics: modelBMetrics,
      },
      winner,
      significance,
      recommendations: this.generateRecommendations(modelAMetrics, modelBMetrics, winner),
      startDate: test.startDate,
      endDate: test.endDate,
    };
  }

  /**
   * Assign customer to model based on deterministic hash
   */
  private assignCustomerToModel(customerId: string, test: ABTestConfig): {
    modelId: string;
    modelName: string;
  } {
    // Use hash of customerId to ensure consistent assignment
    const hash = this.hashString(customerId + test.testId);
    const threshold = test.modelA.weight / (test.modelA.weight + test.modelB.weight);
    
    if (hash < threshold) {
      return {
        modelId: this.availableModels[test.modelA.id] || test.modelA.id,
        modelName: test.modelA.name,
      };
    } else {
      return {
        modelId: this.availableModels[test.modelB.id] || test.modelB.id,
        modelName: test.modelB.name,
      };
    }
  }

  /**
   * Hash string to number between 0 and 1
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  /**
   * Invoke specific Bedrock model
   */
  private async invokeBedrockModel(modelId: string, prompt: string): Promise<string> {
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(payload),
      contentType: 'application/json',
    });

    const response = await this.bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  }

  /**
   * Get active A/B tests for analysis type
   */
  private async getActiveTests(analysisType: string): Promise<ABTestConfig[]> {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Query active tests (simplified - in practice would use DynamoDB query)
    const allTests = await this.dynamoDBService.scan(this.testsTable);
    
    return allTests.filter((test: ABTestConfig) => 
      test.active && 
      test.startDate <= currentDate && 
      test.endDate >= currentDate &&
      test.metrics.includes(analysisType)
    );
  }

  /**
   * Initialize metrics tracking for a model in a test
   */
  private async initializeTestMetrics(testId: string, modelId: string): Promise<void> {
    await this.dynamoDBService.put(this.metricsTable, {
      testId,
      modelId,
      totalRequests: 0,
      successfulRequests: 0,
      totalProcessingTime: 0,
      totalConfidence: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Record A/B test metrics for a model
   */
  private async recordABTestMetrics(
    testId: string, 
    modelId: string, 
    metrics: {
      success: boolean;
      processingTime: number;
      inputTokens: number;
      outputTokens: number;
      confidence: number;
    }
  ): Promise<void> {
    try {
      // Update metrics atomically
      // Get current metrics
      const currentMetrics = await this.dynamoDBService.get(this.metricsTable, { testId, modelId }) || {
        totalRequests: 0,
        successfulRequests: 0,
        totalProcessingTime: 0,
        totalConfidence: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
      };

      // Update with new values
      const updates = {
        totalRequests: currentMetrics.totalRequests + 1,
        successfulRequests: currentMetrics.successfulRequests + (metrics.success ? 1 : 0),
        totalProcessingTime: currentMetrics.totalProcessingTime + metrics.processingTime,
        totalConfidence: currentMetrics.totalConfidence + metrics.confidence,
        totalInputTokens: currentMetrics.totalInputTokens + metrics.inputTokens,
        totalOutputTokens: currentMetrics.totalOutputTokens + metrics.outputTokens,
        lastUpdated: new Date().toISOString(),
      };

      await this.dynamoDBService.update(this.metricsTable, 
        { testId, modelId },
        updates
      );
    } catch (error) {
      console.error(`❌ Failed to record A/B test metrics:`, error);
    }
  }

  /**
   * Get test configuration
   */
  private async getTestConfig(testId: string): Promise<ABTestConfig | null> {
    try {
      const result = await this.dynamoDBService.get(this.testsTable, { testId });
      return result as ABTestConfig;
    } catch (error) {
      console.error(`❌ Failed to get test config for ${testId}:`, error);
      return null;
    }
  }

  /**
   * Get model performance metrics
   */
  private async getModelMetrics(testId: string, modelId: string): Promise<ModelPerformanceMetrics> {
    const metrics = await this.dynamoDBService.get(this.metricsTable, { testId, modelId });
    
    if (!metrics || metrics.totalRequests === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        averageProcessingTime: 0,
        averageConfidence: 0,
        averageTokenCost: 0,
      };
    }
    
    return {
      totalRequests: metrics.totalRequests,
      successRate: metrics.successfulRequests / metrics.totalRequests,
      averageProcessingTime: metrics.totalProcessingTime / metrics.totalRequests,
      averageConfidence: metrics.totalConfidence / metrics.totalRequests,
      averageTokenCost: this.calculateTokenCost(
        metrics.totalInputTokens / metrics.totalRequests,
        metrics.totalOutputTokens / metrics.totalRequests,
        modelId
      ),
    };
  }

  /**
   * Calculate statistical significance between two models
   */
  private calculateStatisticalSignificance(
    modelA: ModelPerformanceMetrics, 
    modelB: ModelPerformanceMetrics
  ): number {
    // Simplified statistical significance calculation
    // In production, use proper statistical tests like t-test
    const minSampleSize = Math.min(modelA.totalRequests, modelB.totalRequests);
    
    if (minSampleSize < 30) {
      return 0; // Insufficient sample size
    }
    
    const difference = Math.abs(modelA.averageConfidence - modelB.averageConfidence);
    const pooledStdDev = Math.sqrt(
      (Math.pow(modelA.averageConfidence * 0.2, 2) + Math.pow(modelB.averageConfidence * 0.2, 2)) / 2
    );
    
    const tStat = difference / (pooledStdDev * Math.sqrt(2 / minSampleSize));
    
    // Convert t-statistic to confidence level (simplified)
    return Math.min(0.99, tStat * 0.1);
  }

  /**
   * Determine winner based on multiple metrics
   */
  private determineWinner(
    modelA: ModelPerformanceMetrics, 
    modelB: ModelPerformanceMetrics
  ): 'A' | 'B' | 'tie' {
    // Scoring system based on multiple factors
    let scoreA = 0;
    let scoreB = 0;
    
    // Success rate (40% weight)
    if (modelA.successRate > modelB.successRate) scoreA += 40;
    else if (modelB.successRate > modelA.successRate) scoreB += 40;
    
    // Average confidence (30% weight)
    if (modelA.averageConfidence > modelB.averageConfidence) scoreA += 30;
    else if (modelB.averageConfidence > modelA.averageConfidence) scoreB += 30;
    
    // Processing time (20% weight) - lower is better
    if (modelA.averageProcessingTime < modelB.averageProcessingTime) scoreA += 20;
    else if (modelB.averageProcessingTime < modelA.averageProcessingTime) scoreB += 20;
    
    // Cost efficiency (10% weight) - lower is better
    if (modelA.averageTokenCost < modelB.averageTokenCost) scoreA += 10;
    else if (modelB.averageTokenCost < modelA.averageTokenCost) scoreB += 10;
    
    const scoreDifference = Math.abs(scoreA - scoreB);
    
    if (scoreDifference < 10) return 'tie';
    return scoreA > scoreB ? 'A' : 'B';
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(
    modelA: ModelPerformanceMetrics,
    modelB: ModelPerformanceMetrics,
    winner: 'A' | 'B' | 'tie'
  ): string[] {
    const recommendations: string[] = [];
    
    if (winner === 'tie') {
      recommendations.push('Results are statistically insignificant. Consider running test longer or with more traffic.');
    } else {
      const winnerModel = winner === 'A' ? modelA : modelB;
      const loserModel = winner === 'A' ? modelB : modelA;
      
      recommendations.push(`Model ${winner} shows superior performance. Consider gradual rollout.`);
      
      if (winnerModel.averageConfidence > loserModel.averageConfidence + 0.1) {
        recommendations.push('Winner shows significantly higher confidence in predictions.');
      }
      
      if (winnerModel.averageProcessingTime < loserModel.averageProcessingTime * 0.8) {
        recommendations.push('Winner provides better response times, improving user experience.');
      }
      
      if (winnerModel.averageTokenCost < loserModel.averageTokenCost * 0.9) {
        recommendations.push('Winner is more cost-effective, reducing operational expenses.');
      }
    }
    
    if (Math.min(modelA.totalRequests, modelB.totalRequests) < 100) {
      recommendations.push('Consider collecting more data points for more reliable results.');
    }
    
    return recommendations;
  }

  /**
   * Get test status
   */
  private getTestStatus(test: ABTestConfig): 'pending' | 'running' | 'completed' | 'paused' {
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (!test.active) return 'paused';
    if (currentDate < test.startDate) return 'pending';
    if (currentDate > test.endDate) return 'completed';
    return 'running';
  }

  /**
   * Extract confidence score from model response
   */
  private extractConfidenceFromResponse(response: string): number {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Extract confidence from various possible locations
        if (parsed.confidence) return parsed.confidence;
        if (parsed.consumptionPatterns && parsed.consumptionPatterns.length > 0) {
          return parsed.consumptionPatterns.reduce((sum: number, p: any) => 
            sum + (p.confidence || 0.5), 0) / parsed.consumptionPatterns.length;
        }
      }
    } catch (error) {
      console.warn('Could not extract confidence from response');
    }
    return 0.5; // Default confidence
  }

  /**
   * Calculate token cost based on model pricing
   */
  private calculateTokenCost(inputTokens: number, outputTokens: number, modelId: string): number {
    // Simplified pricing - in production, use actual AWS pricing
    const pricing = {
      'claude-3-haiku': { input: 0.00025, output: 0.00125 }, // per 1K tokens
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
    };
    
    const modelName = Object.keys(this.availableModels).find(key => 
      this.availableModels[key] === modelId
    ) || 'claude-3-haiku';
    
    const rates = pricing[modelName] || pricing['claude-3-haiku'];
    
    return (inputTokens / 1000 * rates.input) + (outputTokens / 1000 * rates.output);
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * List all A/B tests with their current status
   */
  async listABTests(): Promise<ABTestConfig[]> {
    return await this.dynamoDBService.scan(this.testsTable);
  }

  /**
   * Deactivate an A/B test
   */
  async deactivateABTest(testId: string): Promise<void> {
    await this.dynamoDBService.update(this.testsTable, 
      { testId },
      { active: false }
    );
    
    console.log(`🛑 A/B test deactivated: ${testId}`);
  }
}