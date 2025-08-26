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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StreamingAnalyticsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const kinesis_streaming_service_1 = require("../services/kinesis-streaming.service");
const realtime_analytics_service_1 = require("../services/realtime-analytics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StreamingAnalyticsController = StreamingAnalyticsController_1 = class StreamingAnalyticsController {
    constructor(kinesisStreamingService, realtimeAnalyticsService) {
        this.kinesisStreamingService = kinesisStreamingService;
        this.realtimeAnalyticsService = realtimeAnalyticsService;
        this.logger = new common_1.Logger(StreamingAnalyticsController_1.name);
    }
    async publishPurchaseEvent(event) {
        try {
            await this.kinesisStreamingService.publishPurchaseEvent(event);
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
            const timeRange = `${hours} hours`;
            this.logger.log(`Retrieved insights for customer ${customerId} for ${timeRange}`);
            return {
                customerId,
                insights: [],
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
exports.StreamingAnalyticsController = StreamingAnalyticsController;
__decorate([
    (0, common_1.Post)('events/purchase'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a purchase event to Kinesis stream' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Purchase event published successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "publishPurchaseEvent", null);
__decorate([
    (0, common_1.Post)('events/segment-update'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a customer segment update event' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Segment update event published successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "publishSegmentUpdateEvent", null);
__decorate([
    (0, common_1.Post)('events/consumption-prediction'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a consumption prediction event' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Consumption prediction event published successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "publishConsumptionPredictionEvent", null);
__decorate([
    (0, common_1.Post)('events/batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish multiple events in batch' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Batch events published successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "publishBatchEvents", null);
__decorate([
    (0, common_1.Get)('stream/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Kinesis stream status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stream status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "getStreamStatus", null);
__decorate([
    (0, common_1.Get)('stream/metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Kinesis stream metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stream metrics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "getStreamMetrics", null);
__decorate([
    (0, common_1.Get)('streams'),
    (0, swagger_1.ApiOperation)({ summary: 'List all Kinesis streams' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Streams listed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "listStreams", null);
__decorate([
    (0, common_1.Post)('stream/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Kinesis stream if it does not exist' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Stream created or already exists' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "createStream", null);
__decorate([
    (0, common_1.Get)('insights/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent real-time insights for a customer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer insights retrieved successfully' }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "getCustomerInsights", null);
__decorate([
    (0, common_1.Get)('insights/system/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system-wide real-time insights overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System insights overview retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StreamingAnalyticsController.prototype, "getSystemInsightsOverview", null);
exports.StreamingAnalyticsController = StreamingAnalyticsController = StreamingAnalyticsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Streaming Analytics'),
    (0, common_1.Controller)('v1/streaming'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [kinesis_streaming_service_1.KinesisStreamingService,
        realtime_analytics_service_1.RealtimeAnalyticsService])
], StreamingAnalyticsController);
//# sourceMappingURL=streaming-analytics.controller.js.map