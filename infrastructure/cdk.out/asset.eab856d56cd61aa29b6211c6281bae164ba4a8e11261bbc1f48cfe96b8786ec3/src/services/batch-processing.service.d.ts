import { BatchRequest, BatchStatusResponse, QueueStats } from '../interfaces/batch-processing.interface';
export declare class BatchProcessingService {
    private dynamoClient;
    private sqsClient;
    private bedrockService;
    private monitoring;
    private costAnalytics;
    private readonly jobsTableName;
    private readonly queueUrl;
    private readonly config;
    constructor();
    submitBatchRequest(request: BatchRequest): Promise<{
        batchId: string;
        jobCount: number;
        estimatedCost: number;
    }>;
    processBatchJobs(maxConcurrent?: number): Promise<void>;
    private processJob;
    getBatchStatus(batchId: string): Promise<BatchStatusResponse>;
    getQueueStats(): Promise<QueueStats>;
    private storeJob;
    private enqueueJob;
    private receiveMessages;
    private deleteMessage;
    private updateJobStatus;
    private updateJobProgress;
    private completeJob;
    private failJob;
    private calculateBatchStats;
    private recordBatchMetrics;
    private sleep;
}
