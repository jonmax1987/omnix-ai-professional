import { KinesisStreamingService } from '../services/kinesis-streaming.service';
import { RealtimeAnalyticsService } from '../services/realtime-analytics.service';
import { PurchaseEvent, CustomerSegmentUpdateEvent, ConsumptionPredictionEvent, RealtimeInsight, KinesisStreamMetrics } from '../interfaces/streaming-analytics.interface';
export declare class StreamingAnalyticsController {
    private kinesisStreamingService;
    private realtimeAnalyticsService;
    private readonly logger;
    constructor(kinesisStreamingService: KinesisStreamingService, realtimeAnalyticsService: RealtimeAnalyticsService);
    publishPurchaseEvent(event: PurchaseEvent): Promise<{
        message: string;
        insights: RealtimeInsight[];
    }>;
    publishSegmentUpdateEvent(event: CustomerSegmentUpdateEvent): Promise<{
        message: string;
        insights: RealtimeInsight[];
    }>;
    publishConsumptionPredictionEvent(event: ConsumptionPredictionEvent): Promise<{
        message: string;
        insights: RealtimeInsight[];
    }>;
    publishBatchEvents(events: Array<PurchaseEvent | CustomerSegmentUpdateEvent | ConsumptionPredictionEvent>): Promise<{
        message: string;
        publishedCount: number;
    }>;
    getStreamStatus(): Promise<{
        streamName: string;
        status: string;
        config: any;
    }>;
    getStreamMetrics(): Promise<KinesisStreamMetrics>;
    listStreams(): Promise<{
        streams: string[];
    }>;
    createStream(): Promise<{
        message: string;
        streamName: string;
    }>;
    getCustomerInsights(customerId: string, hours?: string): Promise<{
        customerId: string;
        insights: RealtimeInsight[];
        timeRange: string;
    }>;
    getSystemInsightsOverview(): Promise<{
        totalInsights: number;
        insightsByType: Record<string, number>;
        insightsByPriority: Record<string, number>;
        processingMetrics: any;
    }>;
}
