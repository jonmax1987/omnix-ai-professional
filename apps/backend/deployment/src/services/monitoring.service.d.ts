export declare class MonitoringService {
    private cloudWatch;
    private readonly namespace;
    private readonly region;
    constructor();
    recordAIAnalysisMetrics(metrics: {
        analysisType: 'consumption_prediction' | 'customer_profiling' | 'recommendation_generation';
        processingTime: number;
        success: boolean;
        usedFallback: boolean;
        confidence: number;
        customerId: string;
    }): Promise<void>;
    recordBedrockAPICall(metrics: {
        modelId: string;
        inputTokens?: number;
        outputTokens?: number;
        estimatedCost?: number;
    }): Promise<void>;
    recordCustomerEngagement(metrics: {
        customerId: string;
        recommendationCount: number;
        predictionAccuracy?: number;
        engagementScore?: number;
    }): Promise<void>;
    recordSystemPerformance(metrics: {
        cacheHitRate?: number;
        databaseLatency?: number;
        concurrentAnalyses?: number;
    }): Promise<void>;
    private publishMetrics;
    private chunkArray;
    recordBusinessMetric(metricName: string, value: number, unit: string, dimensions?: {
        name: string;
        value: string;
    }[]): Promise<void>;
    recordSegmentationMetrics(metrics: {
        customersSegmented: number;
        processingTime: number;
        averageConfidence: number;
    }): Promise<void>;
    recordSegmentMigration(migration: {
        customerId: string;
        fromSegment: string;
        toSegment: string;
        reason: string;
    }): Promise<void>;
}
