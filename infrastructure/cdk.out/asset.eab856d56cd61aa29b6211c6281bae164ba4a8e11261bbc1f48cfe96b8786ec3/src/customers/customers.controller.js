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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const ai_analysis_service_1 = require("./ai-analysis.service");
const cost_analytics_service_1 = require("../services/cost-analytics.service");
const batch_processing_service_1 = require("../services/batch-processing.service");
const customer_segmentation_service_1 = require("../services/customer-segmentation.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../auth/decorators/user.decorator");
const customer_dto_1 = require("../common/dto/customer.dto");
let CustomersController = class CustomersController {
    constructor(customersService, aiAnalysisService, costAnalyticsService, batchProcessingService, segmentationService) {
        this.customersService = customersService;
        this.aiAnalysisService = aiAnalysisService;
        this.costAnalyticsService = costAnalyticsService;
        this.batchProcessingService = batchProcessingService;
        this.segmentationService = segmentationService;
    }
    async registerCustomer(createDto, user) {
        const customerId = createDto.customerId || user.id;
        return this.customersService.createCustomerProfile({
            ...createDto,
            customerId,
        });
    }
    async getCustomerProfile(customerId) {
        return this.customersService.getCustomerProfile(customerId);
    }
    async updateCustomerProfile(customerId, updateDto) {
        return this.customersService.updateCustomerProfile(customerId, updateDto);
    }
    async updateCustomerPreferences(customerId, preferences) {
        return this.customersService.updateCustomerPreferences(customerId, preferences);
    }
    async getCustomerPurchases(customerId, limit) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        return this.customersService.getCustomerPurchases(customerId, limitNum);
    }
    async addPurchaseHistory(customerId, purchaseDto) {
        return this.customersService.addPurchaseHistory(customerId, purchaseDto);
    }
    async importPurchaseHistory(customerId, importDto) {
        return this.customersService.importPurchaseHistory(customerId, importDto.purchases);
    }
    async trackProductInteraction(customerId, interactionDto) {
        return this.customersService.trackProductInteraction(customerId, interactionDto);
    }
    async getCustomerInteractions(customerId, limit) {
        const limitNum = limit ? parseInt(limit, 10) : 100;
        return this.customersService.getCustomerInteractions(customerId, limitNum);
    }
    async getProductInteractions(productId, limit) {
        const limitNum = limit ? parseInt(limit, 10) : 100;
        return this.customersService.getProductInteractions(productId, limitNum);
    }
    async getCustomersBySegment(segment) {
        return this.customersService.getCustomersBySegment(segment);
    }
    async getAllCustomers(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 100;
        return this.customersService.getAllCustomers(limitNum);
    }
    async getCustomerAIAnalysis(customerId) {
        return this.aiAnalysisService.analyzeCustomerConsumption(customerId);
    }
    async getConsumptionPredictions(customerId) {
        return this.aiAnalysisService.analyzeCustomerConsumption(customerId);
    }
    async getCustomerProfileAnalysis(customerId) {
        return this.aiAnalysisService.analyzeCustomerProfile(customerId);
    }
    async getAIRecommendations(customerId, limit) {
        const limitNum = limit ? parseInt(limit, 10) : 5;
        return this.aiAnalysisService.generateRecommendations(customerId, limitNum);
    }
    async getReplenishmentAlerts(customerId) {
        return this.aiAnalysisService.getReplenishmentAlerts(customerId);
    }
    async predictNextPurchase(customerId, productId) {
        return this.aiAnalysisService.predictNextPurchaseDate(customerId, productId);
    }
    async triggerAIAnalysis(customerId) {
        return this.aiAnalysisService.analyzeCustomerConsumption(customerId);
    }
    async getAnalysisHistory(customerId, limit) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.aiAnalysisService.getCustomerAnalysisHistory(customerId, limitNum);
    }
    async getCustomerCostAnalytics(customerId, days) {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.costAnalyticsService.getCustomerCostAnalytics(customerId, daysNum);
    }
    async getCostOverview(timeRange = 'day') {
        return this.costAnalyticsService.getCostAnalytics(timeRange);
    }
    async getTopCustomersByCost(limit, days) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.costAnalyticsService.getTopCustomersByCost(limitNum, daysNum);
    }
    async submitBatchAnalysis(batchRequest) {
        return this.batchProcessingService.submitBatchRequest(batchRequest);
    }
    async getBatchStatus(batchId) {
        return this.batchProcessingService.getBatchStatus(batchId);
    }
    async getQueueStats() {
        return this.batchProcessingService.getQueueStats();
    }
    async segmentCustomer(customerId, request) {
        const segmentationRequest = {
            customerId,
            analysisDepth: request?.analysisDepth || 'detailed',
            includeRecommendations: request?.includeRecommendations !== false,
            forceRecalculation: request?.forceRecalculation || false
        };
        return this.segmentationService.segmentCustomers(segmentationRequest);
    }
    async segmentCustomersBatch(request) {
        return this.segmentationService.segmentCustomers(request);
    }
    async getCustomerSegment(customerId) {
        return this.segmentationService.segmentCustomers({
            customerId,
            analysisDepth: 'basic',
            includeRecommendations: false
        });
    }
    async getSegmentOverview() {
        const result = await this.segmentationService.segmentCustomers({
            analysisDepth: 'basic',
            includeRecommendations: false
        });
        return {
            segments: result.segments || [],
            statistics: result.statistics
        };
    }
    async getSegmentPerformance(segmentId) {
        return this.segmentationService.getSegmentPerformance(segmentId);
    }
    async trackSegmentMigration(migration) {
        await this.segmentationService.trackSegmentMigration({
            customerId: migration.customerId,
            fromSegment: migration.fromSegment,
            toSegment: migration.toSegment,
            migrationDate: new Date().toISOString(),
            reason: migration.reason,
            impactScore: migration.impactScore || 0
        });
        return {
            success: true,
            message: `Migration tracked for customer ${migration.customerId}`
        };
    }
    async getSegmentBasedRecommendations(customerId, includeStrategy) {
        const segmentation = await this.segmentationService.segmentCustomers({
            customerId,
            analysisDepth: 'detailed',
            includeRecommendations: true
        });
        const assignment = segmentation.assignments?.[0];
        if (!assignment) {
            throw new Error('Customer segment not found');
        }
        const segment = segmentation.segments?.find(s => s.segmentId === assignment.segmentId);
        const recommendations = await this.aiAnalysisService.generateRecommendations(customerId, 5);
        return {
            segment: assignment.segmentName,
            recommendations: recommendations.recommendations || [],
            strategy: includeStrategy === 'true' ? segment?.recommendations : undefined
        };
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.CreateCustomerProfileDto, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "registerCustomer", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerProfile", null);
__decorate([
    (0, common_1.Put)(':id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_dto_1.UpdateCustomerProfileDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "updateCustomerProfile", null);
__decorate([
    (0, common_1.Patch)(':id/preferences'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_dto_1.CustomerPreferencesDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "updateCustomerPreferences", null);
__decorate([
    (0, common_1.Get)(':id/purchases'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerPurchases", null);
__decorate([
    (0, common_1.Post)(':id/purchases'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_dto_1.CreatePurchaseHistoryDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "addPurchaseHistory", null);
__decorate([
    (0, common_1.Post)(':id/purchases/import'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_dto_1.ImportPurchaseHistoryDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "importPurchaseHistory", null);
__decorate([
    (0, common_1.Post)(':id/interactions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_dto_1.CreateProductInteractionDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "trackProductInteraction", null);
__decorate([
    (0, common_1.Get)(':id/interactions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerInteractions", null);
__decorate([
    (0, common_1.Get)('products/:productId/interactions'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getProductInteractions", null);
__decorate([
    (0, common_1.Get)('segment/:segment'),
    __param(0, (0, common_1.Param)('segment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomersBySegment", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getAllCustomers", null);
__decorate([
    (0, common_1.Get)(':id/ai-analysis'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerAIAnalysis", null);
__decorate([
    (0, common_1.Get)(':id/consumption-predictions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getConsumptionPredictions", null);
__decorate([
    (0, common_1.Get)(':id/customer-profile-analysis'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerProfileAnalysis", null);
__decorate([
    (0, common_1.Get)(':id/ai-recommendations'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getAIRecommendations", null);
__decorate([
    (0, common_1.Get)(':id/replenishment-alerts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getReplenishmentAlerts", null);
__decorate([
    (0, common_1.Get)(':id/purchase-prediction/:productId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "predictNextPurchase", null);
__decorate([
    (0, common_1.Post)(':id/analyze'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "triggerAIAnalysis", null);
__decorate([
    (0, common_1.Get)(':id/analysis-history'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getAnalysisHistory", null);
__decorate([
    (0, common_1.Get)(':id/cost-analytics'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerCostAnalytics", null);
__decorate([
    (0, common_1.Get)('cost-analytics/overview'),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCostOverview", null);
__decorate([
    (0, common_1.Get)('cost-analytics/top-customers'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getTopCustomersByCost", null);
__decorate([
    (0, common_1.Post)('batch-analysis'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "submitBatchAnalysis", null);
__decorate([
    (0, common_1.Get)('batch-analysis/:batchId'),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getBatchStatus", null);
__decorate([
    (0, common_1.Get)('batch-analysis/queue/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getQueueStats", null);
__decorate([
    (0, common_1.Post)(':id/segmentation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "segmentCustomer", null);
__decorate([
    (0, common_1.Post)('segmentation/batch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "segmentCustomersBatch", null);
__decorate([
    (0, common_1.Get)(':id/segment'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerSegment", null);
__decorate([
    (0, common_1.Get)('segments/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getSegmentOverview", null);
__decorate([
    (0, common_1.Get)('segments/:segmentId/performance'),
    __param(0, (0, common_1.Param)('segmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getSegmentPerformance", null);
__decorate([
    (0, common_1.Post)('segments/migrate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "trackSegmentMigration", null);
__decorate([
    (0, common_1.Get)(':id/segment-recommendations'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('includeStrategy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getSegmentBasedRecommendations", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('v1/customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [customers_service_1.CustomersService,
        ai_analysis_service_1.AIAnalysisService,
        cost_analytics_service_1.CostAnalyticsService,
        batch_processing_service_1.BatchProcessingService,
        customer_segmentation_service_1.CustomerSegmentationService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map