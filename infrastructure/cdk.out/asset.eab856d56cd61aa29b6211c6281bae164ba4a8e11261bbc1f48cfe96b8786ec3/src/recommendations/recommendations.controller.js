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
exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recommendations_service_1 = require("./recommendations.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../auth/decorators/user.decorator");
let RecommendationsController = class RecommendationsController {
    constructor(recommendationsService) {
        this.recommendationsService = recommendationsService;
    }
    async getRecommendations(query) {
        return await this.recommendationsService.getRecommendations(query);
    }
    async acceptRecommendation(recommendationId) {
        return await this.recommendationsService.acceptRecommendation(recommendationId);
    }
    async dismissRecommendation(recommendationId) {
        return await this.recommendationsService.dismissRecommendation(recommendationId);
    }
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
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI-powered recommendations with filtering and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['reorder', 'optimize', 'discontinue', 'promotion'] }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['high', 'medium', 'low'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated list of recommendations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Post)(':recommendationId/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a recommendation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recommendation accepted successfully' }),
    __param(0, (0, common_1.Param)('recommendationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "acceptRecommendation", null);
__decorate([
    (0, common_1.Post)(':recommendationId/dismiss'),
    (0, swagger_1.ApiOperation)({ summary: 'Dismiss a recommendation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recommendation dismissed successfully' }),
    __param(0, (0, common_1.Param)('recommendationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "dismissRecommendation", null);
__decorate([
    (0, common_1.Get)('customers/:customerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized product recommendations for a customer' }),
    (0, swagger_1.ApiQuery)({ name: 'context', required: false, enum: ['homepage', 'product_page', 'checkout', 'email'] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Query)('context')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getCustomerRecommendations", null);
__decorate([
    (0, common_1.Get)('products/:productId/similar'),
    (0, swagger_1.ApiOperation)({ summary: 'Get similar products recommendations' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getSimilarProducts", null);
__decorate([
    (0, common_1.Get)('trending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trending products' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getTrendingProducts", null);
__decorate([
    (0, common_1.Get)('seasonal'),
    (0, swagger_1.ApiOperation)({ summary: 'Get seasonal product recommendations' }),
    (0, swagger_1.ApiQuery)({ name: 'season', required: false, enum: ['spring', 'summer', 'autumn', 'winter', 'current'] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('season')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getSeasonalRecommendations", null);
__decorate([
    (0, common_1.Post)('complementary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get complementary product recommendations' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getComplementaryProducts", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Track user feedback on recommendations' }),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "trackRecommendationFeedback", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, swagger_1.ApiTags)('recommendations'),
    (0, common_1.Controller)('recommendations'),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService])
], RecommendationsController);
//# sourceMappingURL=recommendations.controller.js.map