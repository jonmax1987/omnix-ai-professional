"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KinesisStreamingService = void 0;
const common_1 = require("@nestjs/common");
const client_kinesis_1 = require("@aws-sdk/client-kinesis");
let KinesisStreamingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var KinesisStreamingService = _classThis = class {
        constructor() {
            this.logger = new common_1.Logger(KinesisStreamingService.name);
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
                // Split into batches of max 500 records (Kinesis limit)
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
    __setFunctionName(_classThis, "KinesisStreamingService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        KinesisStreamingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return KinesisStreamingService = _classThis;
})();
exports.KinesisStreamingService = KinesisStreamingService;
