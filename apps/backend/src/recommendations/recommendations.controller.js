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
exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let RecommendationsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('recommendations'), (0, common_1.Controller)('recommendations')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getRecommendations_decorators;
    let _getOrderRecommendations_decorators;
    let _acceptRecommendation_decorators;
    let _dismissRecommendation_decorators;
    let _getRecommendationHistory_decorators;
    let _getRecommendationSettings_decorators;
    let _updateRecommendationSettings_decorators;
    let _getCustomerRecommendations_decorators;
    let _getSimilarProducts_decorators;
    let _getTrendingProducts_decorators;
    let _getSeasonalRecommendations_decorators;
    let _getComplementaryProducts_decorators;
    let _trackRecommendationFeedback_decorators;
    var RecommendationsController = _classThis = class {
        constructor(recommendationsService) {
            this.recommendationsService = (__runInitializers(this, _instanceExtraInitializers), recommendationsService);
        }
        async getRecommendations(query) {
            return await this.recommendationsService.getRecommendations(query);
        }
        async getOrderRecommendations(query) {
            // For now, return the same recommendations as the general endpoint
            // In the future, this could be filtered to only order-specific recommendations
            return await this.recommendationsService.getRecommendations(query);
        }
        async acceptRecommendation(recommendationId) {
            return await this.recommendationsService.acceptRecommendation(recommendationId);
        }
        async dismissRecommendation(recommendationId) {
            return await this.recommendationsService.dismissRecommendation(recommendationId);
        }
        async getRecommendationHistory(query) {
            // Return recommendation history with mock data for now
            return {
                data: [],
                total: 0,
                page: query.page || 1,
                limit: query.limit || 10,
                totalPages: 0
            };
        }
        async getRecommendationSettings() {
            // Return default recommendation settings
            return {
                autoApply: false,
                notificationEnabled: true,
                minConfidence: 0.7,
                maxRecommendationsPerDay: 10,
                categories: ['reorder', 'optimize', 'discontinue', 'promotion']
            };
        }
        async updateRecommendationSettings(settings) {
            // For now, just return the updated settings
            return {
                ...settings,
                updatedAt: new Date().toISOString()
            };
        }
        // Customer product recommendation endpoints
        async getCustomerRecommendations(customerId, context, limit) {
            return await this.recommendationsService.getCustomerRecommendations(customerId, context || 'homepage', limit ? parseInt(limit, 10) : 10);
        }
        async getSimilarProducts(productId, limit) {
            return await this.recommendationsService.getSimilarProducts(productId, limit ? parseInt(limit, 10) : 5);
        }
        async getTrendingProducts(limit) {
            return await this.recommendationsService.getTrendingProducts(limit ? parseInt(limit, 10) : 10);
        }
        async getSeasonalRecommendations(season, limit) {
            return await this.recommendationsService.getSeasonalRecommendations(season || 'current', limit ? parseInt(limit, 10) : 10);
        }
        async getComplementaryProducts(body) {
            return await this.recommendationsService.getComplementaryProducts(body.productIds, body.limit || 5);
        }
        async trackRecommendationFeedback(user, body) {
            return await this.recommendationsService.trackRecommendationFeedback(user.id, body.productId, body.action);
        }
    };
    __setFunctionName(_classThis, "RecommendationsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getRecommendations_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get AI-powered recommendations with filtering and pagination' }), (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['reorder', 'optimize', 'discontinue', 'promotion'] }), (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['high', 'medium', 'low'] }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated list of recommendations' })];
        _getOrderRecommendations_decorators = [(0, common_1.Get)('orders'), (0, swagger_1.ApiOperation)({ summary: 'Get order recommendations' }), (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['reorder', 'optimize', 'discontinue', 'promotion'] }), (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['high', 'medium', 'low'] }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated list of order recommendations' })];
        _acceptRecommendation_decorators = [(0, common_1.Post)(':recommendationId/accept'), (0, swagger_1.ApiOperation)({ summary: 'Accept a recommendation' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Recommendation accepted successfully' })];
        _dismissRecommendation_decorators = [(0, common_1.Post)(':recommendationId/dismiss'), (0, swagger_1.ApiOperation)({ summary: 'Dismiss a recommendation' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Recommendation dismissed successfully' })];
        _getRecommendationHistory_decorators = [(0, common_1.Get)('history'), (0, swagger_1.ApiOperation)({ summary: 'Get recommendation history' }), (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns recommendation history' })];
        _getRecommendationSettings_decorators = [(0, common_1.Get)('settings'), (0, swagger_1.ApiOperation)({ summary: 'Get recommendation settings' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns recommendation settings' })];
        _updateRecommendationSettings_decorators = [(0, common_1.Patch)('settings'), (0, swagger_1.ApiOperation)({ summary: 'Update recommendation settings' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings updated successfully' })];
        _getCustomerRecommendations_decorators = [(0, common_1.Get)('customers/:customerId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Get personalized product recommendations for a customer' }), (0, swagger_1.ApiQuery)({ name: 'context', required: false, enum: ['homepage', 'product_page', 'checkout', 'email'] }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number })];
        _getSimilarProducts_decorators = [(0, common_1.Get)('products/:productId/similar'), (0, swagger_1.ApiOperation)({ summary: 'Get similar products recommendations' }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number })];
        _getTrendingProducts_decorators = [(0, common_1.Get)('trending'), (0, swagger_1.ApiOperation)({ summary: 'Get trending products' }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number })];
        _getSeasonalRecommendations_decorators = [(0, common_1.Get)('seasonal'), (0, swagger_1.ApiOperation)({ summary: 'Get seasonal product recommendations' }), (0, swagger_1.ApiQuery)({ name: 'season', required: false, enum: ['spring', 'summer', 'autumn', 'winter', 'current'] }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number })];
        _getComplementaryProducts_decorators = [(0, common_1.Post)('complementary'), (0, swagger_1.ApiOperation)({ summary: 'Get complementary product recommendations' })];
        _trackRecommendationFeedback_decorators = [(0, common_1.Post)('feedback'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Track user feedback on recommendations' })];
        __esDecorate(_classThis, null, _getRecommendations_decorators, { kind: "method", name: "getRecommendations", static: false, private: false, access: { has: obj => "getRecommendations" in obj, get: obj => obj.getRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrderRecommendations_decorators, { kind: "method", name: "getOrderRecommendations", static: false, private: false, access: { has: obj => "getOrderRecommendations" in obj, get: obj => obj.getOrderRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptRecommendation_decorators, { kind: "method", name: "acceptRecommendation", static: false, private: false, access: { has: obj => "acceptRecommendation" in obj, get: obj => obj.acceptRecommendation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _dismissRecommendation_decorators, { kind: "method", name: "dismissRecommendation", static: false, private: false, access: { has: obj => "dismissRecommendation" in obj, get: obj => obj.dismissRecommendation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRecommendationHistory_decorators, { kind: "method", name: "getRecommendationHistory", static: false, private: false, access: { has: obj => "getRecommendationHistory" in obj, get: obj => obj.getRecommendationHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRecommendationSettings_decorators, { kind: "method", name: "getRecommendationSettings", static: false, private: false, access: { has: obj => "getRecommendationSettings" in obj, get: obj => obj.getRecommendationSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateRecommendationSettings_decorators, { kind: "method", name: "updateRecommendationSettings", static: false, private: false, access: { has: obj => "updateRecommendationSettings" in obj, get: obj => obj.updateRecommendationSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCustomerRecommendations_decorators, { kind: "method", name: "getCustomerRecommendations", static: false, private: false, access: { has: obj => "getCustomerRecommendations" in obj, get: obj => obj.getCustomerRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSimilarProducts_decorators, { kind: "method", name: "getSimilarProducts", static: false, private: false, access: { has: obj => "getSimilarProducts" in obj, get: obj => obj.getSimilarProducts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTrendingProducts_decorators, { kind: "method", name: "getTrendingProducts", static: false, private: false, access: { has: obj => "getTrendingProducts" in obj, get: obj => obj.getTrendingProducts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSeasonalRecommendations_decorators, { kind: "method", name: "getSeasonalRecommendations", static: false, private: false, access: { has: obj => "getSeasonalRecommendations" in obj, get: obj => obj.getSeasonalRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getComplementaryProducts_decorators, { kind: "method", name: "getComplementaryProducts", static: false, private: false, access: { has: obj => "getComplementaryProducts" in obj, get: obj => obj.getComplementaryProducts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _trackRecommendationFeedback_decorators, { kind: "method", name: "trackRecommendationFeedback", static: false, private: false, access: { has: obj => "trackRecommendationFeedback" in obj, get: obj => obj.trackRecommendationFeedback }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RecommendationsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RecommendationsController = _classThis;
})();
exports.RecommendationsController = RecommendationsController;
