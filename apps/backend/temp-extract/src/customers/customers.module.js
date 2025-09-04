"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersModule = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const customers_controller_1 = require("./customers.controller");
const ai_analysis_service_1 = require("./ai-analysis.service");
const dynamodb_service_1 = require("../services/dynamodb.service");
const bedrock_service_1 = require("../services/bedrock.service");
const ab_testing_service_1 = require("../services/ab-testing.service");
const enhanced_bedrock_service_1 = require("../services/enhanced-bedrock.service");
const ab_testing_controller_1 = require("../controllers/ab-testing.controller");
const monitoring_service_1 = require("../services/monitoring.service");
const cost_analytics_service_1 = require("../services/cost-analytics.service");
const batch_processing_service_1 = require("../services/batch-processing.service");
const customer_segmentation_service_1 = require("../services/customer-segmentation.service");
const cache_service_1 = require("../services/cache.service");
let CustomersModule = class CustomersModule {
};
exports.CustomersModule = CustomersModule;
exports.CustomersModule = CustomersModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [customers_controller_1.CustomersController, ab_testing_controller_1.ABTestingController],
        providers: [
            customers_service_1.CustomersService,
            ai_analysis_service_1.AIAnalysisService,
            bedrock_service_1.BedrockAnalysisService,
            ab_testing_service_1.ABTestingService,
            enhanced_bedrock_service_1.EnhancedBedrockService,
            dynamodb_service_1.DynamoDBService,
            monitoring_service_1.MonitoringService,
            cost_analytics_service_1.CostAnalyticsService,
            batch_processing_service_1.BatchProcessingService,
            customer_segmentation_service_1.CustomerSegmentationService,
            cache_service_1.CacheService
        ],
        exports: [customers_service_1.CustomersService, ai_analysis_service_1.AIAnalysisService, enhanced_bedrock_service_1.EnhancedBedrockService],
    })
], CustomersModule);
//# sourceMappingURL=customers.module.js.map