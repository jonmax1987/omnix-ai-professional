"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KinesisStreamingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KinesisStreamingService = void 0;
const common_1 = require("@nestjs/common");
const client_kinesis_1 = require("@aws-sdk/client-kinesis");
let KinesisStreamingService = KinesisStreamingService_1 = class KinesisStreamingService {
    constructor() {
        this.logger = new common_1.Logger(KinesisStreamingService_1.name);
        this.config = {
            kinesisStreamName: process.env.KINESIS_STREAM_NAME || 'omnix-ai-customer-events',
            region: process.env.AWS_REGION || 'eu-central-1',
            shardCount: parseInt(process.env.KINESIS_SHARD_COUNT || '2'),
            retentionPeriodHours: parseInt(process.env.KINESIS_RETENTION_HOURS || '24'),
            enableCompression: process.env.KINESIS_ENABLE_COMPRESSION === 'true',
            batchSize: parseInt(process.env.KINESIS_BATCH_SIZE || '100'),
            maxLatency: parseInt(process.env.KINESIS_MAX_LATENCY_MS || '100')
        };
        this.kinesis = new client_kinesis_1.KinesisClient({
            region: this.config.region
        });
    }
    async publishPurchaseEvent(event) {
        try {
            const record = {
                StreamName: this.config.kinesisStreamName,
                Data: Buffer.from(JSON.stringify({
                    eventType: 'purchase',
                    ...event
                })),
                PartitionKey: event.customerId
            };
            await this.kinesis.send(new client_kinesis_1.PutRecordCommand(record));
            this.logger.debug(`Published purchase event for customer ${event.customerId}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish purchase event: ${error.message}`);
            throw error;
        }
    }
    async publishSegmentUpdateEvent(event) {
        try {
            const record = {
                StreamName: this.config.kinesisStreamName,
                Data: Buffer.from(JSON.stringify({
                    eventType: 'segment_update',
                    ...event
                })),
                PartitionKey: event.customerId
            };
            await this.kinesis.send(new client_kinesis_1.PutRecordCommand(record));
            this.logger.debug(`Published segment update event for customer ${event.customerId}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish segment update event: ${error.message}`);
            throw error;
        }
    }
    async publishConsumptionPredictionEvent(event) {
        try {
            const record = {
                StreamName: this.config.kinesisStreamName,
                Data: Buffer.from(JSON.stringify({
                    eventType: 'consumption_prediction',
                    ...event
                })),
                PartitionKey: event.customerId
            };
            await this.kinesis.send(new client_kinesis_1.PutRecordCommand(record));
            this.logger.debug(`Published consumption prediction event for customer ${event.customerId}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish consumption prediction event: ${error.message}`);
            throw error;
        }
    }
    async publishBatchEvents(events) {
        if (events.length === 0)
            return;
        try {
            const records = events.map(event => ({
                Data: Buffer.from(JSON.stringify(event)),
                PartitionKey: event.customerId
            }));
            const batches = this.chunkArray(records, 500);
            for (const batch of batches) {
                const command = new client_kinesis_1.PutRecordsCommand({
                    StreamName: this.config.kinesisStreamName,
                    Records: batch
                });
                const response = await this.kinesis.send(command);
                if (response.FailedRecordCount > 0) {
                    this.logger.warn(`${response.FailedRecordCount} records failed to publish in batch`);
                }
                this.logger.debug(`Published batch of ${batch.length} events, ${response.FailedRecordCount} failed`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to publish batch events: ${error.message}`);
            throw error;
        }
    }
    async createStream() {
        try {
            const command = new client_kinesis_1.CreateStreamCommand({
                StreamName: this.config.kinesisStreamName,
                ShardCount: this.config.shardCount
            });
            await this.kinesis.send(command);
            this.logger.log(`Kinesis stream ${this.config.kinesisStreamName} created successfully`);
        }
        catch (error) {
            if (error.name === 'ResourceInUseException') {
                this.logger.log(`Kinesis stream ${this.config.kinesisStreamName} already exists`);
                return;
            }
            this.logger.error(`Failed to create Kinesis stream: ${error.message}`);
            throw error;
        }
    }
    async getStreamStatus() {
        try {
            const command = new client_kinesis_1.DescribeStreamCommand({
                StreamName: this.config.kinesisStreamName
            });
            const response = await this.kinesis.send(command);
            return response.StreamDescription.StreamStatus;
        }
        catch (error) {
            this.logger.error(`Failed to get stream status: ${error.message}`);
            return 'UNKNOWN';
        }
    }
    async getStreamMetrics() {
        try {
            const command = new client_kinesis_1.DescribeStreamCommand({
                StreamName: this.config.kinesisStreamName
            });
            const response = await this.kinesis.send(command);
            const streamDescription = response.StreamDescription;
            return {
                incomingRecords: 0,
                outgoingRecords: 0,
                iteratorAgeMs: 0,
                writeProvisionedThroughputExceeded: 0,
                readProvisionedThroughputExceeded: 0,
                successfulRecordCount: 0,
                failedRecordCount: 0
            };
        }
        catch (error) {
            this.logger.error(`Failed to get stream metrics: ${error.message}`);
            throw error;
        }
    }
    async listStreams() {
        try {
            const command = new client_kinesis_1.ListStreamsCommand({});
            const response = await this.kinesis.send(command);
            return response.StreamNames || [];
        }
        catch (error) {
            this.logger.error(`Failed to list streams: ${error.message}`);
            return [];
        }
    }
    getConfig() {
        return { ...this.config };
    }
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
};
exports.KinesisStreamingService = KinesisStreamingService;
exports.KinesisStreamingService = KinesisStreamingService = KinesisStreamingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KinesisStreamingService);
//# sourceMappingURL=kinesis-streaming.service.js.map