"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingModule = void 0;
const common_1 = require("@nestjs/common");
const streaming_analytics_controller_1 = require("../controllers/streaming-analytics.controller");
const kinesis_streaming_service_1 = require("../services/kinesis-streaming.service");
const realtime_analytics_service_1 = require("../services/realtime-analytics.service");
const customer_segmentation_service_1 = require("../services/customer-segmentation.service");
const enhanced_bedrock_service_1 = require("../services/enhanced-bedrock.service");
const bedrock_service_1 = require("../services/bedrock.service");
const ab_testing_service_1 = require("../services/ab-testing.service");
const monitoring_service_1 = require("../services/monitoring.service");
const cost_analytics_service_1 = require("../services/cost-analytics.service");
const cache_service_1 = require("../services/cache.service");
const websocket_module_1 = require("../websocket/websocket.module");
let StreamingModule = class StreamingModule {
};
exports.StreamingModule = StreamingModule;
exports.StreamingModule = StreamingModule = __decorate([
    (0, common_1.Module)({
        imports: [websocket_module_1.WebSocketModule],
        controllers: [streaming_analytics_controller_1.StreamingAnalyticsController],
        providers: [
            kinesis_streaming_service_1.KinesisStreamingService,
            realtime_analytics_service_1.RealtimeAnalyticsService,
            customer_segmentation_service_1.CustomerSegmentationService,
            bedrock_service_1.BedrockAnalysisService,
            ab_testing_service_1.ABTestingService,
            monitoring_service_1.MonitoringService,
            cost_analytics_service_1.CostAnalyticsService,
            enhanced_bedrock_service_1.EnhancedBedrockService,
            cache_service_1.CacheService
        ],
        exports: [
            kinesis_streaming_service_1.KinesisStreamingService,
            realtime_analytics_service_1.RealtimeAnalyticsService
        ]
    })
], StreamingModule);
//# sourceMappingURL=streaming.module.js.map