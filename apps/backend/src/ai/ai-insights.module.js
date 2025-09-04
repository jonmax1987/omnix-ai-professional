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
let AIInsightsModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                recommendations_module_1.RecommendationsModule,
                websocket_module_1.WebSocketModule,
            ],
            controllers: [ai_insights_controller_1.AIInsightsController],
            providers: [
                // Core services for AI insights
                bedrock_service_1.BedrockAnalysisService,
                ab_testing_service_1.ABTestingService,
                monitoring_service_1.MonitoringService,
                cost_analytics_service_1.CostAnalyticsService,
                cache_service_1.CacheService,
                dynamodb_service_1.DynamoDBService,
                // Enhanced AI services
                enhanced_bedrock_service_1.EnhancedBedrockService,
                realtime_analytics_service_1.RealtimeAnalyticsService,
                customer_segmentation_service_1.CustomerSegmentationService,
            ],
            exports: [
                enhanced_bedrock_service_1.EnhancedBedrockService,
                realtime_analytics_service_1.RealtimeAnalyticsService,
                customer_segmentation_service_1.CustomerSegmentationService,
            ],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AIInsightsModule = _classThis = class {
    };
    __setFunctionName(_classThis, "AIInsightsModule");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AIInsightsModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AIInsightsModule = _classThis;
})();
exports.AIInsightsModule = AIInsightsModule;
