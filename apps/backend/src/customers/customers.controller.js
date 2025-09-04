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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let CustomersController = (() => {
    let _classDecorators = [(0, common_1.Controller)('v1/customers'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _registerCustomer_decorators;
    let _getCustomerProfile_decorators;
    let _updateCustomerProfile_decorators;
    let _updateCustomerPreferences_decorators;
    let _getCustomerPurchases_decorators;
    let _addPurchaseHistory_decorators;
    let _importPurchaseHistory_decorators;
    let _trackProductInteraction_decorators;
    let _getCustomerInteractions_decorators;
    let _getProductInteractions_decorators;
    let _getCustomersBySegment_decorators;
    let _getAllCustomers_decorators;
    let _getCustomerAIAnalysis_decorators;
    let _getConsumptionPredictions_decorators;
    let _getCustomerProfileAnalysis_decorators;
    let _getAIRecommendations_decorators;
    let _getReplenishmentAlerts_decorators;
    let _predictNextPurchase_decorators;
    let _triggerAIAnalysis_decorators;
    let _getAnalysisHistory_decorators;
    let _getCustomerCostAnalytics_decorators;
    let _getCostOverview_decorators;
    let _getTopCustomersByCost_decorators;
    let _submitBatchAnalysis_decorators;
    let _getBatchStatus_decorators;
    let _getQueueStats_decorators;
    let _segmentCustomer_decorators;
    let _segmentCustomersBatch_decorators;
    let _getCustomerSegment_decorators;
    let _getSegmentOverview_decorators;
    let _getSegmentPerformance_decorators;
    let _trackSegmentMigration_decorators;
    let _getSegmentBasedRecommendations_decorators;
    var CustomersController = _classThis = class {
        constructor(customersService, aiAnalysisService, costAnalyticsService, batchProcessingService, segmentationService) {
            this.customersService = (__runInitializers(this, _instanceExtraInitializers), customersService);
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
        // AI Analysis Endpoints
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
        // Cost Analytics Endpoints
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
        // Batch Processing Endpoints
        async submitBatchAnalysis(batchRequest) {
            return this.batchProcessingService.submitBatchRequest(batchRequest);
        }
        async getBatchStatus(batchId) {
            return this.batchProcessingService.getBatchStatus(batchId);
        }
        async getQueueStats() {
            return this.batchProcessingService.getQueueStats();
        }
        // Customer Segmentation Endpoints
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
            // Get AI recommendations tailored to the segment
            const recommendations = await this.aiAnalysisService.generateRecommendations(customerId, 5);
            return {
                segment: assignment.segmentName,
                recommendations: recommendations.recommendations || [],
                strategy: includeStrategy === 'true' ? segment?.recommendations : undefined
            };
        }
    };
    __setFunctionName(_classThis, "CustomersController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _registerCustomer_decorators = [(0, common_1.Post)('register'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
        _getCustomerProfile_decorators = [(0, common_1.Get)(':id/profile')];
        _updateCustomerProfile_decorators = [(0, common_1.Put)(':id/profile')];
        _updateCustomerPreferences_decorators = [(0, common_1.Patch)(':id/preferences')];
        _getCustomerPurchases_decorators = [(0, common_1.Get)(':id/purchases')];
        _addPurchaseHistory_decorators = [(0, common_1.Post)(':id/purchases'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
        _importPurchaseHistory_decorators = [(0, common_1.Post)(':id/purchases/import')];
        _trackProductInteraction_decorators = [(0, common_1.Post)(':id/interactions'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
        _getCustomerInteractions_decorators = [(0, common_1.Get)(':id/interactions')];
        _getProductInteractions_decorators = [(0, common_1.Get)('products/:productId/interactions')];
        _getCustomersBySegment_decorators = [(0, common_1.Get)('segment/:segment')];
        _getAllCustomers_decorators = [(0, common_1.Get)()];
        _getCustomerAIAnalysis_decorators = [(0, common_1.Get)(':id/ai-analysis')];
        _getConsumptionPredictions_decorators = [(0, common_1.Get)(':id/consumption-predictions')];
        _getCustomerProfileAnalysis_decorators = [(0, common_1.Get)(':id/customer-profile-analysis')];
        _getAIRecommendations_decorators = [(0, common_1.Get)(':id/ai-recommendations')];
        _getReplenishmentAlerts_decorators = [(0, common_1.Get)(':id/replenishment-alerts')];
        _predictNextPurchase_decorators = [(0, common_1.Get)(':id/purchase-prediction/:productId')];
        _triggerAIAnalysis_decorators = [(0, common_1.Post)(':id/analyze'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getAnalysisHistory_decorators = [(0, common_1.Get)(':id/analysis-history')];
        _getCustomerCostAnalytics_decorators = [(0, common_1.Get)(':id/cost-analytics')];
        _getCostOverview_decorators = [(0, common_1.Get)('cost-analytics/overview')];
        _getTopCustomersByCost_decorators = [(0, common_1.Get)('cost-analytics/top-customers')];
        _submitBatchAnalysis_decorators = [(0, common_1.Post)('batch-analysis')];
        _getBatchStatus_decorators = [(0, common_1.Get)('batch-analysis/:batchId')];
        _getQueueStats_decorators = [(0, common_1.Get)('batch-analysis/queue/stats')];
        _segmentCustomer_decorators = [(0, common_1.Post)(':id/segmentation')];
        _segmentCustomersBatch_decorators = [(0, common_1.Post)('segmentation/batch')];
        _getCustomerSegment_decorators = [(0, common_1.Get)(':id/segment')];
        _getSegmentOverview_decorators = [(0, common_1.Get)('segments/overview')];
        _getSegmentPerformance_decorators = [(0, common_1.Get)('segments/:segmentId/performance')];
        _trackSegmentMigration_decorators = [(0, common_1.Post)('segments/migrate')];
        _getSegmentBasedRecommendations_decorators = [(0, common_1.Get)(':id/segment-recommendations')];
        __esDecorate(_classThis, null, _registerCustomer_decorators, { kind: "method", name: "registerCustomer", static: false, private: false, access: { has: obj => "registerCustomer" in obj, get: obj => obj.registerCustomer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomerProfile_decorators, { kind: "method", name: "getCustomerProfile", static: false, private: false, access: { has: obj => "getCustomerProfile" in obj, get: obj => obj.getCustomerProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateCustomerProfile_decorators, { kind: "method", name: "updateCustomerProfile", static: false, private: false, access: { has: obj => "updateCustomerProfile" in obj, get: obj => obj.updateCustomerProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateCustomerPreferences_decorators, { kind: "method", name: "updateCustomerPreferences", static: false, private: false, access: { has: obj => "updateCustomerPreferences" in obj, get: obj => obj.updateCustomerPreferences }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomerPurchases_decorators, { kind: "method", name: "getCustomerPurchases", static: false, private: false, access: { has: obj => "getCustomerPurchases" in obj, get: obj => obj.getCustomerPurchases }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addPurchaseHistory_decorators, { kind: "method", name: "addPurchaseHistory", static: false, private: false, access: { has: obj => "addPurchaseHistory" in obj, get: obj => obj.addPurchaseHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _importPurchaseHistory_decorators, { kind: "method", name: "importPurchaseHistory", static: false, private: false, access: { has: obj => "importPurchaseHistory" in obj, get: obj => obj.importPurchaseHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _trackProductInteraction_decorators, { kind: "method", name: "trackProductInteraction", static: false, private: false, access: { has: obj => "trackProductInteraction" in obj, get: obj => obj.trackProductInteraction }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomerInteractions_decorators, { kind: "method", name: "getCustomerInteractions", static: false, private: false, access: { has: obj => "getCustomerInteractions" in obj, get: obj => obj.getCustomerInteractions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProductInteractions_decorators, { kind: "method", name: "getProductInteractions", static: false, private: false, access: { has: obj => "getProductInteractions" in obj, get: obj => obj.getProductInteractions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomersBySegment_decorators, { kind: "method", name: "getCustomersBySegment", static: false, private: false, access: { has: obj => "getCustomersBySegment" in obj, get: obj => obj.getCustomersBySegment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllCustomers_decorators, { kind: "method", name: "getAllCustomers", static: false, private: false, access: { has: obj => "getAllCustomers" in obj, get: obj => obj.getAllCustomers }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomerAIAnalysis_decorators, { kind: "method", name: "getCustomerAIAnalysis", static: false, private: false, access: { has: obj => "getCustomerAIAnalysis" in obj, get: obj => obj.getCustomerAIAnalysis }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getConsumptionPredictions_decorators, { kind: "method", name: "getConsumptionPredictions", static: false, private: false, access: { has: obj => "getConsumptionPredictions" in obj, get: obj => obj.getConsumptionPredictions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomerProfileAnalysis_decorators, { kind: "method", name: "getCustomerProfileAnalysis", static: false, private: false, access: { has: obj => "getCustomerProfileAnalysis" in obj, get: obj => obj.getCustomerProfileAnalysis }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAIRecommendations_decorators, { kind: "method", name: "getAIRecommendations", static: false, private: false, access: { has: obj => "getAIRecommendations" in obj, get: obj => obj.getAIRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getReplenishmentAlerts_decorators, { kind: "method", name: "getReplenishmentAlerts", static: false, private: false, access: { has: obj => "getReplenishmentAlerts" in obj, get: obj => obj.getReplenishmentAlerts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _predictNextPurchase_decorators, { kind: "method", name: "predictNextPurchase", static: false, private: false, access: { has: obj => "predictNextPurchase" in obj, get: obj => obj.predictNextPurchase }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _triggerAIAnalysis_decorators, { kind: "method", name: "triggerAIAnalysis", static: false, private: false, access: { has: obj => "triggerAIAnalysis" in obj, get: obj => obj.triggerAIAnalysis }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAnalysisHistory_decorators, { kind: "method", name: "getAnalysisHistory", static: false, private: false, access: { has: obj => "getAnalysisHistory" in obj, get: obj => obj.getAnalysisHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomerCostAnalytics_decorators, { kind: "method", name: "getCustomerCostAnalytics", static: false, private: false, access: { has: obj => "getCustomerCostAnalytics" in obj, get: obj => obj.getCustomerCostAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCostOverview_decorators, { kind: "method", name: "getCostOverview", static: false, private: false, access: { has: obj => "getCostOverview" in obj, get: obj => obj.getCostOverview }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTopCustomersByCost_decorators, { kind: "method", name: "getTopCustomersByCost", static: false, private: false, access: { has: obj => "getTopCustomersByCost" in obj, get: obj => obj.getTopCustomersByCost }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _submitBatchAnalysis_decorators, { kind: "method", name: "submitBatchAnalysis", static: false, private: false, access: { has: obj => "submitBatchAnalysis" in obj, get: obj => obj.submitBatchAnalysis }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBatchStatus_decorators, { kind: "method", name: "getBatchStatus", static: false, private: false, access: { has: obj => "getBatchStatus" in obj, get: obj => obj.getBatchStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getQueueStats_decorators, { kind: "method", name: "getQueueStats", static: false, private: false, access: { has: obj => "getQueueStats" in obj, get: obj => obj.getQueueStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _segmentCustomer_decorators, { kind: "method", name: "segmentCustomer", static: false, private: false, access: { has: obj => "segmentCustomer" in obj, get: obj => obj.segmentCustomer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _segmentCustomersBatch_decorators, { kind: "method", name: "segmentCustomersBatch", static: false, private: false, access: { has: obj => "segmentCustomersBatch" in obj, get: obj => obj.segmentCustomersBatch }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomerSegment_decorators, { kind: "method", name: "getCustomerSegment", static: false, private: false, access: { has: obj => "getCustomerSegment" in obj, get: obj => obj.getCustomerSegment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSegmentOverview_decorators, { kind: "method", name: "getSegmentOverview", static: false, private: false, access: { has: obj => "getSegmentOverview" in obj, get: obj => obj.getSegmentOverview }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSegmentPerformance_decorators, { kind: "method", name: "getSegmentPerformance", static: false, private: false, access: { has: obj => "getSegmentPerformance" in obj, get: obj => obj.getSegmentPerformance }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _trackSegmentMigration_decorators, { kind: "method", name: "trackSegmentMigration", static: false, private: false, access: { has: obj => "trackSegmentMigration" in obj, get: obj => obj.trackSegmentMigration }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSegmentBasedRecommendations_decorators, { kind: "method", name: "getSegmentBasedRecommendations", static: false, private: false, access: { has: obj => "getSegmentBasedRecommendations" in obj, get: obj => obj.getSegmentBasedRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CustomersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CustomersController = _classThis;
})();
exports.CustomersController = CustomersController;
