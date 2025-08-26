import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { MonitoringService } from './monitoring.service';
import { BedrockCostEntry, CostAnalytics, TopCustomerCost } from '../interfaces/cost-analytics.interface';

@Injectable()
export class CostAnalyticsService {
  private dynamoClient: DynamoDBDocumentClient;
  private monitoring: MonitoringService;
  private readonly tableName = 'omnix-ai-bedrock-costs-dev';
  
  // Claude 3 Haiku pricing (per 1K tokens) - as of 2025
  private readonly PRICING = {
    'anthropic.claude-3-haiku-20240307-v1:0': {
      input: 0.00025,   // $0.25 per 1M input tokens
      output: 0.00125,  // $1.25 per 1M output tokens
    },
    'anthropic.claude-3-sonnet-20240229-v1:0': {
      input: 0.003,     // $3 per 1M input tokens
      output: 0.015,    // $15 per 1M output tokens
    },
  };

  constructor() {
    this.monitoring = new MonitoringService();
    const region = process.env.AWS_REGION || 'eu-central-1';
    
    const clientConfig: any = { region };

    if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    const dynamoClient = new DynamoDBClient(clientConfig);
    this.dynamoClient = DynamoDBDocumentClient.from(dynamoClient);
    
    console.log('💰 Cost Analytics Service initialized');
  }

  /**
   * Record a Bedrock API call cost
   */
  async recordBedrockCall(params: {
    customerId: string;
    analysisType: 'consumption_prediction' | 'customer_profiling' | 'recommendation_generation';
    modelId: string;
    inputTokens: number;
    outputTokens: number;
    processingTimeMs: number;
    success: boolean;
    usedFallback: boolean;
  }): Promise<void> {
    const estimatedCost = this.calculateCost(params.modelId, params.inputTokens, params.outputTokens);
    
    const costEntry: BedrockCostEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      customerId: params.customerId,
      analysisType: params.analysisType,
      modelId: params.modelId,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      estimatedCost,
      processingTimeMs: params.processingTimeMs,
      success: params.success,
      usedFallback: params.usedFallback,
    };

    try {
      // Store in DynamoDB for detailed analytics
      await this.dynamoClient.send(new PutCommand({
        TableName: this.tableName,
        Item: costEntry,
      }));

      // Also record in CloudWatch for real-time monitoring
      await this.monitoring.recordBedrockAPICall({
        modelId: params.modelId,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        estimatedCost,
      });

      console.log(`💰 Recorded Bedrock call cost: $${estimatedCost.toFixed(4)} (${params.inputTokens + params.outputTokens} tokens)`);
    } catch (error) {
      console.error('❌ Failed to record Bedrock cost:', error);
    }
  }

  /**
   * Calculate estimated cost based on token usage and model pricing
   */
  private calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const pricing = this.PRICING[modelId];
    if (!pricing) {
      console.warn(`⚠️  Unknown model pricing for ${modelId}, using Haiku pricing as fallback`);
      return this.calculateCost('anthropic.claude-3-haiku-20240307-v1:0', inputTokens, outputTokens);
    }

    // Calculate cost per 1000 tokens, then convert to actual usage
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    
    return inputCost + outputCost;
  }

  /**
   * Get cost analytics for a specific time range
   */
  async getCostAnalytics(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<CostAnalytics> {
    const endTime = new Date();
    const startTime = new Date();
    
    switch (timeRange) {
      case 'hour':
        startTime.setHours(startTime.getHours() - 1);
        break;
      case 'day':
        startTime.setDate(startTime.getDate() - 1);
        break;
      case 'week':
        startTime.setDate(startTime.getDate() - 7);
        break;
      case 'month':
        startTime.setMonth(startTime.getMonth() - 1);
        break;
    }

    try {
      const result = await this.dynamoClient.send(new ScanCommand({
        TableName: this.tableName,
        FilterExpression: '#timestamp BETWEEN :start AND :end',
        ExpressionAttributeNames: {
          '#timestamp': 'timestamp',
        },
        ExpressionAttributeValues: {
          ':start': startTime.toISOString(),
          ':end': endTime.toISOString(),
        },
      }));

      return this.calculateAnalytics(result.Items || []);
    } catch (error) {
      console.error('❌ Failed to fetch cost analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Get cost analytics for a specific customer
   */
  async getCustomerCostAnalytics(customerId: string, days: number = 30): Promise<CostAnalytics> {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);

    try {
      const result = await this.dynamoClient.send(new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'customerId = :customerId AND #timestamp BETWEEN :start AND :end',
        ExpressionAttributeNames: {
          '#timestamp': 'timestamp',
        },
        ExpressionAttributeValues: {
          ':customerId': customerId,
          ':start': startTime.toISOString(),
          ':end': endTime.toISOString(),
        },
      }));

      return this.calculateAnalytics(result.Items || []);
    } catch (error) {
      console.error(`❌ Failed to fetch cost analytics for customer ${customerId}:`, error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Calculate cost analytics from raw data
   */
  private calculateAnalytics(items: any[]): CostAnalytics {
    if (!items.length) {
      return this.getEmptyAnalytics();
    }

    const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
    const totalRequests = items.length;
    const successfulRequests = items.filter(item => item.success);
    const fallbackRequests = items.filter(item => item.usedFallback);

    // Cost breakdown by analysis type
    const costByAnalysisType: { [key: string]: any } = {};
    items.forEach(item => {
      if (!costByAnalysisType[item.analysisType]) {
        costByAnalysisType[item.analysisType] = {
          totalCost: 0,
          requestCount: 0,
          averageCost: 0,
        };
      }
      costByAnalysisType[item.analysisType].totalCost += item.estimatedCost;
      costByAnalysisType[item.analysisType].requestCount++;
    });

    // Calculate averages
    Object.keys(costByAnalysisType).forEach(type => {
      const data = costByAnalysisType[type];
      data.averageCost = data.totalCost / data.requestCount;
    });

    // Token usage
    const totalInputTokens = items.reduce((sum, item) => sum + item.inputTokens, 0);
    const totalOutputTokens = items.reduce((sum, item) => sum + item.outputTokens, 0);

    // Time-based cost breakdown (simplified - would need more complex logic for accurate hourly/daily/monthly)
    const costByTimeRange = this.calculateCostByTimeRange(items);

    // Project monthly cost based on current usage pattern
    const projectedMonthlyCost = this.projectMonthlyCost(items);

    return {
      totalCost,
      totalRequests,
      averageCostPerRequest: totalCost / totalRequests,
      costByAnalysisType,
      costByTimeRange,
      tokenUsage: {
        totalInputTokens,
        totalOutputTokens,
        averageTokensPerRequest: (totalInputTokens + totalOutputTokens) / totalRequests,
      },
      fallbackRate: fallbackRequests.length / totalRequests,
      projectedMonthlyCost,
    };
  }

  /**
   * Calculate cost breakdown by time ranges
   */
  private calculateCostByTimeRange(items: any[]): { hourly: number; daily: number; monthly: number } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const hourlyItems = items.filter(item => new Date(item.timestamp) > oneHourAgo);
    const dailyItems = items.filter(item => new Date(item.timestamp) > oneDayAgo);
    const monthlyItems = items.filter(item => new Date(item.timestamp) > oneMonthAgo);

    return {
      hourly: hourlyItems.reduce((sum, item) => sum + item.estimatedCost, 0),
      daily: dailyItems.reduce((sum, item) => sum + item.estimatedCost, 0),
      monthly: monthlyItems.reduce((sum, item) => sum + item.estimatedCost, 0),
    };
  }

  /**
   * Project monthly cost based on current usage patterns
   */
  private projectMonthlyCost(items: any[]): number {
    if (!items.length) return 0;

    // Sort items by timestamp
    const sortedItems = items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Calculate daily average cost over the sample period
    const firstItem = sortedItems[0];
    const lastItem = sortedItems[sortedItems.length - 1];
    const periodDays = (new Date(lastItem.timestamp).getTime() - new Date(firstItem.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    
    if (periodDays === 0) return items.reduce((sum, item) => sum + item.estimatedCost, 0) * 30; // If same day, multiply by 30
    
    const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
    const dailyAverageCost = totalCost / Math.max(periodDays, 1);
    
    return dailyAverageCost * 30; // Project to monthly
  }

  /**
   * Get empty analytics structure
   */
  private getEmptyAnalytics(): CostAnalytics {
    return {
      totalCost: 0,
      totalRequests: 0,
      averageCostPerRequest: 0,
      costByAnalysisType: {},
      costByTimeRange: {
        hourly: 0,
        daily: 0,
        monthly: 0,
      },
      tokenUsage: {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        averageTokensPerRequest: 0,
      },
      fallbackRate: 0,
      projectedMonthlyCost: 0,
    };
  }

  /**
   * Get top customers by cost (useful for identifying high-usage customers)
   */
  async getTopCustomersByCost(limit: number = 10, days: number = 30): Promise<TopCustomerCost[]> {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);

    try {
      const result = await this.dynamoClient.send(new ScanCommand({
        TableName: this.tableName,
        FilterExpression: '#timestamp BETWEEN :start AND :end',
        ExpressionAttributeNames: {
          '#timestamp': 'timestamp',
        },
        ExpressionAttributeValues: {
          ':start': startTime.toISOString(),
          ':end': endTime.toISOString(),
        },
      }));

      // Group by customer
      const customerCosts = new Map<string, { totalCost: number; requestCount: number }>();
      
      result.Items?.forEach(item => {
        if (!customerCosts.has(item.customerId)) {
          customerCosts.set(item.customerId, { totalCost: 0, requestCount: 0 });
        }
        const customer = customerCosts.get(item.customerId)!;
        customer.totalCost += item.estimatedCost;
        customer.requestCount++;
      });

      // Convert to array and sort by total cost
      return Array.from(customerCosts.entries())
        .map(([customerId, data]) => ({
          customerId,
          totalCost: data.totalCost,
          requestCount: data.requestCount,
          averageCostPerRequest: data.totalCost / data.requestCount,
        }))
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Failed to get top customers by cost:', error);
      return [];
    }
  }

  /**
   * Set up cost alerting thresholds
   */
  async setupCostAlerts(thresholds: {
    dailyThreshold: number;
    monthlyThreshold: number;
    perCustomerThreshold: number;
  }): Promise<void> {
    // This would integrate with CloudWatch alarms
    // For now, just store thresholds for checking
    console.log('💰 Cost alert thresholds configured:', thresholds);
    
    // TODO: Create CloudWatch alarms based on custom metrics
    // This would require additional CloudWatch alarm setup
  }
}