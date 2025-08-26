import { PurchaseEvent, CustomerSegmentUpdateEvent, ConsumptionPredictionEvent, StreamingAnalyticsConfig, KinesisStreamMetrics } from '../interfaces/streaming-analytics.interface';
export declare class KinesisStreamingService {
    private readonly logger;
    private kinesis;
    private config;
    constructor();
    publishPurchaseEvent(event: PurchaseEvent): Promise<void>;
    publishSegmentUpdateEvent(event: CustomerSegmentUpdateEvent): Promise<void>;
    publishConsumptionPredictionEvent(event: ConsumptionPredictionEvent): Promise<void>;
    publishBatchEvents(events: Array<PurchaseEvent | CustomerSegmentUpdateEvent | ConsumptionPredictionEvent>): Promise<void>;
    createStream(): Promise<void>;
    getStreamStatus(): Promise<string>;
    getStreamMetrics(): Promise<KinesisStreamMetrics>;
    listStreams(): Promise<string[]>;
    getConfig(): StreamingAnalyticsConfig;
    private chunkArray;
}
