import { Injectable, Logger } from '@nestjs/common';
import { 
  KinesisClient, 
  PutRecordCommand, 
  PutRecordsCommand,
  CreateStreamCommand,
  DescribeStreamCommand,
  ListStreamsCommand,
  PutRecordsRequestEntry
} from '@aws-sdk/client-kinesis';
import {
  PurchaseEvent,
  CustomerSegmentUpdateEvent,
  ConsumptionPredictionEvent,
  StreamingAnalyticsConfig,
  RealtimeInsight,
  KinesisStreamMetrics
} from '../interfaces/streaming-analytics.interface';

@Injectable()
export class KinesisStreamingService {
  private readonly logger = new Logger(KinesisStreamingService.name);
  private kinesis: KinesisClient;
  private config: StreamingAnalyticsConfig;

  constructor() {
    this.config = {
      kinesisStreamName: process.env.KINESIS_STREAM_NAME || 'omnix-ai-customer-events',
      region: process.env.AWS_REGION || 'eu-central-1',
      shardCount: parseInt(process.env.KINESIS_SHARD_COUNT || '2'),
      retentionPeriodHours: parseInt(process.env.KINESIS_RETENTION_HOURS || '24'),
      enableCompression: process.env.KINESIS_ENABLE_COMPRESSION === 'true',
      batchSize: parseInt(process.env.KINESIS_BATCH_SIZE || '100'),
      maxLatency: parseInt(process.env.KINESIS_MAX_LATENCY_MS || '100')
    };

    this.kinesis = new KinesisClient({ 
      region: this.config.region 
    });
  }

  async publishPurchaseEvent(event: PurchaseEvent): Promise<void> {
    try {
      const record = {
        StreamName: this.config.kinesisStreamName,
        Data: Buffer.from(JSON.stringify({
          eventType: 'purchase',
          ...event
        })),
        PartitionKey: event.customerId
      };

      await this.kinesis.send(new PutRecordCommand(record));
      this.logger.debug(`Published purchase event for customer ${event.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to publish purchase event: ${error.message}`);
      throw error;
    }
  }

  async publishSegmentUpdateEvent(event: CustomerSegmentUpdateEvent): Promise<void> {
    try {
      const record = {
        StreamName: this.config.kinesisStreamName,
        Data: Buffer.from(JSON.stringify({
          eventType: 'segment_update',
          ...event
        })),
        PartitionKey: event.customerId
      };

      await this.kinesis.send(new PutRecordCommand(record));
      this.logger.debug(`Published segment update event for customer ${event.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to publish segment update event: ${error.message}`);
      throw error;
    }
  }

  async publishConsumptionPredictionEvent(event: ConsumptionPredictionEvent): Promise<void> {
    try {
      const record = {
        StreamName: this.config.kinesisStreamName,
        Data: Buffer.from(JSON.stringify({
          eventType: 'consumption_prediction',
          ...event
        })),
        PartitionKey: event.customerId
      };

      await this.kinesis.send(new PutRecordCommand(record));
      this.logger.debug(`Published consumption prediction event for customer ${event.customerId}`);
    } catch (error) {
      this.logger.error(`Failed to publish consumption prediction event: ${error.message}`);
      throw error;
    }
  }

  async publishBatchEvents(events: Array<PurchaseEvent | CustomerSegmentUpdateEvent | ConsumptionPredictionEvent>): Promise<void> {
    if (events.length === 0) return;

    try {
      const records: PutRecordsRequestEntry[] = events.map(event => ({
        Data: Buffer.from(JSON.stringify(event)),
        PartitionKey: event.customerId
      }));

      // Split into batches of max 500 records (Kinesis limit)
      const batches = this.chunkArray(records, 500);
      
      for (const batch of batches) {
        const command = new PutRecordsCommand({
          StreamName: this.config.kinesisStreamName,
          Records: batch
        });

        const response = await this.kinesis.send(command);
        
        if (response.FailedRecordCount > 0) {
          this.logger.warn(`${response.FailedRecordCount} records failed to publish in batch`);
        }
        
        this.logger.debug(`Published batch of ${batch.length} events, ${response.FailedRecordCount} failed`);
      }
    } catch (error) {
      this.logger.error(`Failed to publish batch events: ${error.message}`);
      throw error;
    }
  }

  async createStream(): Promise<void> {
    try {
      const command = new CreateStreamCommand({
        StreamName: this.config.kinesisStreamName,
        ShardCount: this.config.shardCount
      });

      await this.kinesis.send(command);
      this.logger.log(`Kinesis stream ${this.config.kinesisStreamName} created successfully`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        this.logger.log(`Kinesis stream ${this.config.kinesisStreamName} already exists`);
        return;
      }
      this.logger.error(`Failed to create Kinesis stream: ${error.message}`);
      throw error;
    }
  }

  async getStreamStatus(): Promise<string> {
    try {
      const command = new DescribeStreamCommand({
        StreamName: this.config.kinesisStreamName
      });

      const response = await this.kinesis.send(command);
      return response.StreamDescription.StreamStatus;
    } catch (error) {
      this.logger.error(`Failed to get stream status: ${error.message}`);
      return 'UNKNOWN';
    }
  }

  async getStreamMetrics(): Promise<KinesisStreamMetrics> {
    try {
      const command = new DescribeStreamCommand({
        StreamName: this.config.kinesisStreamName
      });

      const response = await this.kinesis.send(command);
      const streamDescription = response.StreamDescription;

      // Basic metrics from stream description
      return {
        incomingRecords: 0, // Would need CloudWatch integration for actual metrics
        outgoingRecords: 0,
        iteratorAgeMs: 0,
        writeProvisionedThroughputExceeded: 0,
        readProvisionedThroughputExceeded: 0,
        successfulRecordCount: 0,
        failedRecordCount: 0
      };
    } catch (error) {
      this.logger.error(`Failed to get stream metrics: ${error.message}`);
      throw error;
    }
  }

  async listStreams(): Promise<string[]> {
    try {
      const command = new ListStreamsCommand({});
      const response = await this.kinesis.send(command);
      return response.StreamNames || [];
    } catch (error) {
      this.logger.error(`Failed to list streams: ${error.message}`);
      return [];
    }
  }

  getConfig(): StreamingAnalyticsConfig {
    return { ...this.config };
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}