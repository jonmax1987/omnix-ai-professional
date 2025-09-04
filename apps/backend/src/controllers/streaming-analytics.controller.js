"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StreamingAnalyticsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Streaming Analytics'), (0, common_1.Controller)('v1/streaming'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _publishPurchaseEvent_decorators;
    let _publishSegmentUpdateEvent_decorators;
    let _publishConsumptionPredictionEvent_decorators;
    let _publishBatchEvents_decorators;
    let _getStreamStatus_decorators;
    let _getStreamMetrics_decorators;
    let _listStreams_decorators;
    let _createStream_decorators;
    let _getCustomerInsights_decorators;
    let _getSystemInsightsOverview_decorators;
    var StreamingAnalyticsController = _classThis = class {
        constructor(kinesisStreamingService, realtimeAnalyticsService) {
            this.kinesisStreamingService = (__runInitializers(this, _instanceExtraInitializers), kinesisStreamingService);
            this.realtimeAnalyticsService = realtimeAnalyticsService;
            this.logger = new common_1.Logger(StreamingAnalyticsController.name);
        }
        async publishPurchaseEvent(event) {
            try {
                // Publish to Kinesis stream
                await this.kinesisStreamingService.publishPurchaseEvent(event);
                // Process for immediate insights
                const insights = await this.realtimeAnalyticsService.processPurchaseEvent(event);
                this.logger.log(`Published purchase event for customer ${event.customerId}`);
                return {
                    message: 'Purchase event published successfully',
                    insights
                };
            }
            catch (error) {
                this.logger.error(`Failed to publish purchase event: ${error.message}`);
                throw error;
            }
        }
        async publishSegmentUpdateEvent(event) {
            try {
                await this.kinesisStreamingService.publishSegmentUpdateEvent(event);
                const insights = await this.realtimeAnalyticsService.processSegmentUpdateEvent(event);
                this.logger.log(`Published segment update event for customer ${event.customerId}`);
                return {
                    message: 'Segment update event published successfully',
                    insights
                };
            }
            catch (error) {
                this.logger.error(`Failed to publish segment update event: ${error.message}`);
                throw error;
            }
        }
        async publishConsumptionPredictionEvent(event) {
            try {
                await this.kinesisStreamingService.publishConsumptionPredictionEvent(event);
                const insights = await this.realtimeAnalyticsService.processConsumptionPredictionEvent(event);
                this.logger.log(`Published consumption prediction event for customer ${event.customerId}`);
                return {
                    message: 'Consumption prediction event published successfully',
                    insights
                };
            }
            catch (error) {
                this.logger.error(`Failed to publish consumption prediction event: ${error.message}`);
                throw error;
            }
        }
        async publishBatchEvents(events) {
            try {
                await this.kinesisStreamingService.publishBatchEvents(events);
                this.logger.log(`Published batch of ${events.length} events`);
                return {
                    message: 'Batch events published successfully',
                    publishedCount: events.length
                };
            }
            catch (error) {
                this.logger.error(`Failed to publish batch events: ${error.message}`);
                throw error;
            }
        }
        async getStreamStatus() {
            try {
                const status = await this.kinesisStreamingService.getStreamStatus();
                const config = this.kinesisStreamingService.getConfig();
                return {
                    streamName: config.kinesisStreamName,
                    status,
                    config: {
                        region: config.region,
                        shardCount: config.shardCount,
                        retentionPeriodHours: config.retentionPeriodHours,
                        batchSize: config.batchSize
                    }
                };
            }
            catch (error) {
                this.logger.error(`Failed to get stream status: ${error.message}`);
                throw error;
            }
        }
        async getStreamMetrics() {
            try {
                return await this.kinesisStreamingService.getStreamMetrics();
            }
            catch (error) {
                this.logger.error(`Failed to get stream metrics: ${error.message}`);
                throw error;
            }
        }
        async listStreams() {
            try {
                const streams = await this.kinesisStreamingService.listStreams();
                return { streams };
            }
            catch (error) {
                this.logger.error(`Failed to list streams: ${error.message}`);
                throw error;
            }
        }
        async createStream() {
            try {
                await this.kinesisStreamingService.createStream();
                const config = this.kinesisStreamingService.getConfig();
                return {
                    message: 'Stream created successfully or already exists',
                    streamName: config.kinesisStreamName
                };
            }
            catch (error) {
                this.logger.error(`Failed to create stream: ${error.message}`);
                throw error;
            }
        }
        async getCustomerInsights(customerId, hours = '24') {
            try {
                // In a real implementation, this would fetch from a database or cache
                // For now, return a placeholder response
                const timeRange = `${hours} hours`;
                this.logger.log(`Retrieved insights for customer ${customerId} for ${timeRange}`);
                return {
                    customerId,
                    insights: [], // Would be populated from storage
                    timeRange
                };
            }
            catch (error) {
                this.logger.error(`Failed to get customer insights: ${error.message}`);
                throw error;
            }
        }
        async getSystemInsightsOverview() {
            try {
                // In a real implementation, this would aggregate from multiple sources
                return {
                    totalInsights: 0,
                    insightsByType: {
                        'segment_migration': 0,
                        'consumption_prediction': 0,
                        'behavior_anomaly': 0,
                        'recommendation_update': 0
                    },
                    insightsByPriority: {
                        'low': 0,
                        'medium': 0,
                        'high': 0,
                        'critical': 0
                    },
                    processingMetrics: {
                        averageLatencyMs: 0,
                        successRate: 100,
                        errorRate: 0
                    }
                };
            }
            catch (error) {
                this.logger.error(`Failed to get system insights overview: ${error.message}`);
                throw error;
            }
        }
    };
    __setFunctionName(_classThis, "StreamingAnalyticsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _publishPurchaseEvent_decorators = [(0, common_1.Post)('events/purchase'), (0, swagger_1.ApiOperation)({ summary: 'Publish a purchase event to Kinesis stream' }), (0, swagger_1.ApiResponse)({ status: 201, description: 'Purchase event published successfully' })];
        _publishSegmentUpdateEvent_decorators = [(0, common_1.Post)('events/segment-update'), (0, swagger_1.ApiOperation)({ summary: 'Publish a customer segment update event' }), (0, swagger_1.ApiResponse)({ status: 201, description: 'Segment update event published successfully' })];
        _publishConsumptionPredictionEvent_decorators = [(0, common_1.Post)('events/consumption-prediction'), (0, swagger_1.ApiOperation)({ summary: 'Publish a consumption prediction event' }), (0, swagger_1.ApiResponse)({ status: 201, description: 'Consumption prediction event published successfully' })];
        _publishBatchEvents_decorators = [(0, common_1.Post)('events/batch'), (0, swagger_1.ApiOperation)({ summary: 'Publish multiple events in batch' }), (0, swagger_1.ApiResponse)({ status: 201, description: 'Batch events published successfully' })];
        _getStreamStatus_decorators = [(0, common_1.Get)('stream/status'), (0, swagger_1.ApiOperation)({ summary: 'Get Kinesis stream status' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Stream status retrieved successfully' })];
        _getStreamMetrics_decorators = [(0, common_1.Get)('stream/metrics'), (0, swagger_1.ApiOperation)({ summary: 'Get Kinesis stream metrics' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Stream metrics retrieved successfully' })];
        _listStreams_decorators = [(0, common_1.Get)('streams'), (0, swagger_1.ApiOperation)({ summary: 'List all Kinesis streams' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Streams listed successfully' })];
        _createStream_decorators = [(0, common_1.Post)('stream/create'), (0, swagger_1.ApiOperation)({ summary: 'Create Kinesis stream if it does not exist' }), (0, swagger_1.ApiResponse)({ status: 201, description: 'Stream created or already exists' })];
        _getCustomerInsights_decorators = [(0, common_1.Get)('insights/:customerId'), (0, swagger_1.ApiOperation)({ summary: 'Get recent real-time insights for a customer' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer insights retrieved successfully' })];
        _getSystemInsightsOverview_decorators = [(0, common_1.Get)('insights/system/overview'), (0, swagger_1.ApiOperation)({ summary: 'Get system-wide real-time insights overview' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'System insights overview retrieved successfully' })];
        __esDecorate(_classThis, null, _publishPurchaseEvent_decorators, { kind: "method", name: "publishPurchaseEvent", static: false, private: false, access: { has: obj => "publishPurchaseEvent" in obj, get: obj => obj.publishPurchaseEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _publishSegmentUpdateEvent_decorators, { kind: "method", name: "publishSegmentUpdateEvent", static: false, private: false, access: { has: obj => "publishSegmentUpdateEvent" in obj, get: obj => obj.publishSegmentUpdateEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _publishConsumptionPredictionEvent_decorators, { kind: "method", name: "publishConsumptionPredictionEvent", static: false, private: false, access: { has: obj => "publishConsumptionPredictionEvent" in obj, get: obj => obj.publishConsumptionPredictionEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _publishBatchEvents_decorators, { kind: "method", name: "publishBatchEvents", static: false, private: false, access: { has: obj => "publishBatchEvents" in obj, get: obj => obj.publishBatchEvents }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStreamStatus_decorators, { kind: "method", name: "getStreamStatus", static: false, private: false, access: { has: obj => "getStreamStatus" in obj, get: obj => obj.getStreamStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStreamMetrics_decorators, { kind: "method", name: "getStreamMetrics", static: false, private: false, access: { has: obj => "getStreamMetrics" in obj, get: obj => obj.getStreamMetrics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listStreams_decorators, { kind: "method", name: "listStreams", static: false, private: false, access: { has: obj => "listStreams" in obj, get: obj => obj.listStreams }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createStream_decorators, { kind: "method", name: "createStream", static: false, private: false, access: { has: obj => "createStream" in obj, get: obj => obj.createStream }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomerInsights_decorators, { kind: "method", name: "getCustomerInsights", static: false, private: false, access: { has: obj => "getCustomerInsights" in obj, get: obj => obj.getCustomerInsights }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSystemInsightsOverview_decorators, { kind: "method", name: "getSystemInsightsOverview", static: false, private: false, access: { has: obj => "getSystemInsightsOverview" in obj, get: obj => obj.getSystemInsightsOverview }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StreamingAnalyticsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StreamingAnalyticsController = _classThis;
})();
exports.StreamingAnalyticsController = StreamingAnalyticsController;
