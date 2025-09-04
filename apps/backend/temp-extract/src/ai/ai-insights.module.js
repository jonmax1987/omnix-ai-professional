"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIInsightsModule = void 0;
const common_1 = require("@nestjs/common");
const ai_insights_controller_1 = require("./ai-insights.controller");
const enhanced_bedrock_service_1 = require("../services/enhanced-bedrock.service");
const realtime_analytics_service_1 = require("../services/realtime-analytics.service");
const customer_segmentation_service_1 = require("../services/customer-segmentation.service");
const recommendations_module_1 = require("../recommendations/recommendations.module");
const cache_service_1 = require("../services/cache.service");
const dynamodb_service_1 = require("../services/dynamodb.service");
const websocket_module_1 = require("../websocket/websocket.module");
const bedrock_service_1 = require("../services/bedrock.service");
const ab_testing_service_1 = require("../services/ab-testing.service");
const monitoring_service_1 = require("../services/monitoring.service");
const cost_analytics_service_1 = require("../services/cost-analytics.service");
let AIInsightsModule = class AIInsightsModule {
};
exports.AIInsightsModule = AIInsightsModule;
exports.AIInsightsModule = AIInsightsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            recommendations_module_1.RecommendationsModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [ai_insights_controller_1.AIInsightsController],
        providers: [
            bedrock_service_1.BedrockAnalysisService,
            ab_testing_service_1.ABTestingService,
            monitoring_service_1.MonitoringService,
            cost_analytics_service_1.CostAnalyticsService,
            cache_service_1.CacheService,
            dynamodb_service_1.DynamoDBService,
            enhanced_bedrock_service_1.EnhancedBedrockService,
            realtime_analytics_service_1.RealtimeAnalyticsService,
            customer_segmentation_service_1.CustomerSegmentationService,
        ],
        exports: [
            enhanced_bedrock_service_1.EnhancedBedrockService,
            realtime_analytics_service_1.RealtimeAnalyticsService,
            customer_segmentation_service_1.CustomerSegmentationService,
        ],
    })
], AIInsightsModule);
//# sourceMappingURL=ai-insights.module.js.map