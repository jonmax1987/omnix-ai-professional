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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlService = void 0;
const common_1 = require("@nestjs/common");
const recommendation_engine_service_1 = require("./recommendation-engine.service");
const product_similarity_service_1 = require("./product-similarity.service");
const customers_service_1 = require("../customers/customers.service");
let MlService = class MlService {
    constructor(recommendationEngine, productSimilarity, customersService) {
        this.recommendationEngine = recommendationEngine;
        this.productSimilarity = productSimilarity;
        this.customersService = customersService;
    }
    async getPersonalizedRecommendations(request) {
        const limit = request.limit || 10;
        const result = await this.recommendationEngine.generateRecommendations(request.customerId, request.context, limit);
        if (request.context !== 'email') {
            await this.customersService.trackProductInteraction(request.customerId, {
                productId: request.productId || 'homepage',
                interactionType: 'view',
                metadata: {
                    context: request.context,
                    recommendationsShown: result.recommendations.length,
                },
            }).catch(err => console.error('Failed to track recommendation view:', err));
        }
        return {
            recommendations: result.recommendations,
            reason: this.getRecommendationReason(result.algorithmType),
            algorithm: result.algorithmType,
            confidence: result.confidence,
            generatedAt: result.generatedAt,
        };
    }
    async getSimilarProducts(productId, limit = 5) {
        const recommendations = await this.recommendationEngine.getSimilarProducts(productId, limit);
        return {
            recommendations,
            reason: 'Products similar to what you are viewing',
            algorithm: 'content-based',
            confidence: 0.8,
            generatedAt: new Date().toISOString(),
        };
    }
    async getTrendingProducts(limit = 10) {
        const popular = await this.recommendationEngine['getPopularRecommendations'](limit);
        return popular;
    }
    async getSeasonalRecommendations(season, limit = 10) {
        const seasonalCategories = {
            summer: ['Beverages', 'Fruits', 'Ice Cream'],
            winter: ['Soups', 'Hot Beverages', 'Comfort Food'],
            spring: ['Fresh Produce', 'Salads', 'Light Meals'],
            autumn: ['Baking', 'Warm Beverages', 'Root Vegetables'],
        };
        const categories = seasonalCategories[season.toLowerCase()] || [];
        const products = [];
        for (const category of categories) {
            const categoryProducts = await this.productSimilarity.findProductsByCategory(category, undefined, Math.ceil(limit / categories.length));
            products.push(...categoryProducts);
        }
        return products.slice(0, limit).map(product => ({
            product,
            score: 0.7,
            reason: `Perfect for ${season}`,
            tags: ['seasonal', season.toLowerCase()],
        }));
    }
    async getComplementaryProducts(productIds, limit = 5) {
        const complementaryProducts = [];
        const seen = new Set();
        for (const productId of productIds.slice(0, 3)) {
            const products = await this.productSimilarity.getComplementaryProducts(productId);
            for (const product of products) {
                if (!seen.has(product.id)) {
                    seen.add(product.id);
                    complementaryProducts.push({
                        product,
                        score: 0.65,
                        reason: 'Frequently bought together',
                        tags: ['complementary', 'bundle'],
                    });
                }
            }
        }
        return complementaryProducts.slice(0, limit);
    }
    async trackRecommendationFeedback(customerId, productId, action) {
        const interactionType = action === 'purchase' ? 'add_to_cart' :
            action === 'click' ? 'view' : 'remove_from_cart';
        await this.customersService.trackProductInteraction(customerId, {
            productId,
            interactionType,
            metadata: {
                source: 'recommendation',
                action,
                timestamp: new Date().toISOString(),
            },
        });
    }
    getRecommendationReason(algorithmType) {
        const reasons = {
            'collaborative': 'Based on your purchase history and preferences',
            'content-based': 'Based on your preferences and interests',
            'hybrid': 'Personalized for you',
            'popularity': 'Popular products in our store',
            'session-based': 'Based on your current browsing session',
        };
        return reasons[algorithmType] || 'Recommended for you';
    }
};
exports.MlService = MlService;
exports.MlService = MlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [recommendation_engine_service_1.RecommendationEngineService,
        product_similarity_service_1.ProductSimilarityService,
        customers_service_1.CustomersService])
], MlService);
//# sourceMappingURL=ml.service.js.map