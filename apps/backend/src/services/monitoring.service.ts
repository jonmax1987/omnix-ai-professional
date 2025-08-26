import { Injectable } from '@nestjs/common';
import { CloudWatchClient, PutMetricDataCommand, MetricDatum } from '@aws-sdk/client-cloudwatch';

@Injectable()
export class MonitoringService {
  private cloudWatch: CloudWatchClient;
  private readonly namespace = 'OMNIX/AI';
  private readonly region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'eu-central-1';
    
    const clientConfig: any = {
      region: this.region,
    };

    // In Lambda, use IAM role; locally use explicit credentials if available
    if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.cloudWatch = new CloudWatchClient(clientConfig);
    console.log('📊 Monitoring Service initialized for region:', this.region);
  }

  /**
   * Emit AI analysis performance metrics
   */
  async recordAIAnalysisMetrics(metrics: {
    analysisType: 'consumption_prediction' | 'customer_profiling' | 'recommendation_generation';
    processingTime: number;
    success: boolean;
    usedFallback: boolean;
    confidence: number;
    customerId: string;
  }): Promise<void> {
    const metricData: MetricDatum[] = [];

    // Record analysis count
    metricData.push({
      MetricName: 'BedrockAnalysisCount',
      Value: 1,
      Unit: 'Count',
      Dimensions: [
        { Name: 'Service', Value: 'BedrockAnalysis' },
        { Name: 'AnalysisType', Value: metrics.analysisType }
      ],
      Timestamp: new Date()
    });

    // Record customer analysis count
    metricData.push({
      MetricName: 'CustomerAnalysisCount',
      Value: 1,
      Unit: 'Count',
      Dimensions: [
        { Name: 'AnalysisType', Value: metrics.analysisType }
      ],
      Timestamp: new Date()
    });

    // Record processing time (latency)
    metricData.push({
      MetricName: 'BedrockAnalysisLatency',
      Value: metrics.processingTime,
      Unit: 'Milliseconds',
      Dimensions: [
        { Name: 'Service', Value: 'BedrockAnalysis' },
        { Name: 'AnalysisType', Value: metrics.analysisType }
      ],
      Timestamp: new Date()
    });

    // Record errors
    if (!metrics.success) {
      metricData.push({
        MetricName: 'BedrockAnalysisErrors',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Service', Value: 'BedrockAnalysis' },
          { Name: 'AnalysisType', Value: metrics.analysisType }
        ],
        Timestamp: new Date()
      });
    }

    // Record fallback usage
    if (metrics.usedFallback) {
      metricData.push({
        MetricName: 'FallbackAnalysisCount',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Service', Value: 'BedrockAnalysis' },
          { Name: 'AnalysisType', Value: metrics.analysisType }
        ],
        Timestamp: new Date()
      });
    }

    // Record confidence/accuracy
    if (metrics.confidence > 0) {
      metricData.push({
        MetricName: 'AIRecommendationAccuracy',
        Value: metrics.confidence * 100, // Convert to percentage
        Unit: 'Percent',
        Dimensions: [
          { Name: 'Service', Value: 'BedrockAnalysis' },
          { Name: 'AnalysisType', Value: metrics.analysisType }
        ],
        Timestamp: new Date()
      });
    }

    await this.publishMetrics(metricData);
  }

  /**
   * Record Bedrock API call for cost tracking
   */
  async recordBedrockAPICall(metrics: {
    modelId: string;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
  }): Promise<void> {
    const metricData: MetricDatum[] = [];

    // Record API call count for cost estimation
    metricData.push({
      MetricName: 'BedrockAPICallCount',
      Value: 1,
      Unit: 'Count',
      Dimensions: [
        { Name: 'Service', Value: 'BedrockAnalysis' },
        { Name: 'ModelId', Value: metrics.modelId }
      ],
      Timestamp: new Date()
    });

    // Record token usage if available
    if (metrics.inputTokens) {
      metricData.push({
        MetricName: 'BedrockInputTokens',
        Value: metrics.inputTokens,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Service', Value: 'BedrockAnalysis' },
          { Name: 'ModelId', Value: metrics.modelId }
        ],
        Timestamp: new Date()
      });
    }

    if (metrics.outputTokens) {
      metricData.push({
        MetricName: 'BedrockOutputTokens',
        Value: metrics.outputTokens,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Service', Value: 'BedrockAnalysis' },
          { Name: 'ModelId', Value: metrics.modelId }
        ],
        Timestamp: new Date()
      });
    }

    // Record estimated cost if available
    if (metrics.estimatedCost) {
      metricData.push({
        MetricName: 'BedrockEstimatedCost',
        Value: metrics.estimatedCost,
        Unit: 'None',
        Dimensions: [
          { Name: 'Service', Value: 'BedrockAnalysis' },
          { Name: 'ModelId', Value: metrics.modelId }
        ],
        Timestamp: new Date()
      });
    }

    await this.publishMetrics(metricData);
  }

  /**
   * Record customer engagement metrics
   */
  async recordCustomerEngagement(metrics: {
    customerId: string;
    recommendationCount: number;
    predictionAccuracy?: number;
    engagementScore?: number;
  }): Promise<void> {
    const metricData: MetricDatum[] = [];

    // Record recommendations generated
    metricData.push({
      MetricName: 'RecommendationsGenerated',
      Value: metrics.recommendationCount,
      Unit: 'Count',
      Dimensions: [
        { Name: 'Service', Value: 'CustomerAnalytics' }
      ],
      Timestamp: new Date()
    });

    // Record prediction accuracy if measured
    if (metrics.predictionAccuracy !== undefined) {
      metricData.push({
        MetricName: 'PredictionAccuracy',
        Value: metrics.predictionAccuracy * 100,
        Unit: 'Percent',
        Dimensions: [
          { Name: 'Service', Value: 'CustomerAnalytics' }
        ],
        Timestamp: new Date()
      });
    }

    // Record customer engagement score
    if (metrics.engagementScore !== undefined) {
      metricData.push({
        MetricName: 'CustomerEngagementScore',
        Value: metrics.engagementScore,
        Unit: 'None',
        Dimensions: [
          { Name: 'Service', Value: 'CustomerAnalytics' }
        ],
        Timestamp: new Date()
      });
    }

    await this.publishMetrics(metricData);
  }

  /**
   * Record system performance metrics
   */
  async recordSystemPerformance(metrics: {
    cacheHitRate?: number;
    databaseLatency?: number;
    concurrentAnalyses?: number;
  }): Promise<void> {
    const metricData: MetricDatum[] = [];

    if (metrics.cacheHitRate !== undefined) {
      metricData.push({
        MetricName: 'CacheHitRate',
        Value: metrics.cacheHitRate * 100,
        Unit: 'Percent',
        Dimensions: [
          { Name: 'Service', Value: 'AICache' }
        ],
        Timestamp: new Date()
      });
    }

    if (metrics.databaseLatency !== undefined) {
      metricData.push({
        MetricName: 'DatabaseLatency',
        Value: metrics.databaseLatency,
        Unit: 'Milliseconds',
        Dimensions: [
          { Name: 'Service', Value: 'DynamoDB' }
        ],
        Timestamp: new Date()
      });
    }

    if (metrics.concurrentAnalyses !== undefined) {
      metricData.push({
        MetricName: 'ConcurrentAnalyses',
        Value: metrics.concurrentAnalyses,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Service', Value: 'BedrockAnalysis' }
        ],
        Timestamp: new Date()
      });
    }

    await this.publishMetrics(metricData);
  }

  /**
   * Publish metrics to CloudWatch (with error handling)
   */
  private async publishMetrics(metricData: MetricDatum[]): Promise<void> {
    try {
      // CloudWatch accepts up to 20 metrics per request
      const chunks = this.chunkArray(metricData, 20);
      
      for (const chunk of chunks) {
        const command = new PutMetricDataCommand({
          Namespace: this.namespace,
          MetricData: chunk,
        });

        await this.cloudWatch.send(command);
      }

      console.log(`📊 Published ${metricData.length} metrics to CloudWatch namespace: ${this.namespace}`);
    } catch (error) {
      console.error('❌ Failed to publish metrics to CloudWatch:', error);
      // Don't throw - monitoring should not break the main functionality
    }
  }

  /**
   * Utility to chunk array into smaller pieces
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Create a custom business metric for tracking
   */
  async recordBusinessMetric(metricName: string, value: number, unit: string, dimensions?: { name: string; value: string }[]): Promise<void> {
    const metricData: MetricDatum[] = [{
      MetricName: metricName,
      Value: value,
      Unit: unit as any,
      Dimensions: dimensions?.map(d => ({ Name: d.name, Value: d.value })) || [],
      Timestamp: new Date()
    }];

    await this.publishMetrics(metricData);
  }

  /**
   * Record customer segmentation metrics
   */
  async recordSegmentationMetrics(metrics: {
    customersSegmented: number;
    processingTime: number;
    averageConfidence: number;
  }): Promise<void> {
    const metricData: MetricDatum[] = [
      {
        MetricName: 'CustomerSegmentationCount',
        Value: metrics.customersSegmented,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Service', Value: 'CustomerSegmentation' }
        ],
        Timestamp: new Date()
      },
      {
        MetricName: 'SegmentationProcessingTime',
        Value: metrics.processingTime,
        Unit: 'Milliseconds',
        Dimensions: [
          { Name: 'Service', Value: 'CustomerSegmentation' }
        ],
        Timestamp: new Date()
      },
      {
        MetricName: 'SegmentationConfidence',
        Value: metrics.averageConfidence,
        Unit: 'Percent',
        Dimensions: [
          { Name: 'Service', Value: 'CustomerSegmentation' }
        ],
        Timestamp: new Date()
      }
    ];

    await this.publishMetrics(metricData);
  }

  /**
   * Record segment migration metrics
   */
  async recordSegmentMigration(migration: {
    customerId: string;
    fromSegment: string;
    toSegment: string;
    reason: string;
  }): Promise<void> {
    const metricData: MetricDatum[] = [
      {
        MetricName: 'SegmentMigration',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Service', Value: 'CustomerSegmentation' },
          { Name: 'FromSegment', Value: migration.fromSegment },
          { Name: 'ToSegment', Value: migration.toSegment }
        ],
        Timestamp: new Date()
      }
    ];

    await this.publishMetrics(metricData);
  }
}