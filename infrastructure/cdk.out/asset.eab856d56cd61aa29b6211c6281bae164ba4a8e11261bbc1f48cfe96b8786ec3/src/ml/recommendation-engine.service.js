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
exports.RecommendationEngineService = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("../customers/customers.service");
const products_service_1 = require("../products/products.service");
const product_similarity_service_1 = require("./product-similarity.service");
const dynamodb_service_1 = require("../services/dynamodb.service");
const uuid_1 = require("uuid");
let RecommendationEngineService = class RecommendationEngineService {
    constructor(customersService, productsService, productSimilarityService, dynamoDBService) {
        this.customersService = customersService;
        this.productsService = productsService;
        this.productSimilarityService = productSimilarityService;
        this.dynamoDBService = dynamoDBService;
        this.recommendationsTable = 'recommendations';
    }
    async generateRecommendations(customerId, context = 'homepage', limit = 10) {
        try {
            const [profile, purchases, interactions] = await Promise.all([
                this.customersService.getCustomerProfile(customerId).catch(() => null),
                this.customersService.getCustomerPurchases(customerId, 50).catch(() => []),
                this.customersService.getCustomerInteractions(customerId, 100).catch(() => []),
            ]);
            let recommendations = [];
            let algorithmType = 'hybrid';
            let confidence = 0.75;
            if (purchases && purchases.length > 0) {
                const collaborativeRecs = await this.getCollaborativeRecommendations(customerId, purchases, limit);
                recommendations.push(...collaborativeRecs);
                algorithmType = 'collaborative';
                confidence = 0.85;
            }
            if (profile && profile.preferences) {
                const contentRecs = await this.getContentBasedRecommendations(profile, limit);
                recommendations.push(...contentRecs);
                if (recommendations.length === 0) {
                    algorithmType = 'content-based';
                    confidence = 0.70;
                }
            }
            if (interactions && interactions.length > 0) {
                const interactionRecs = await this.getInteractionBasedRecommendations(interactions, limit);
                recommendations.push(...interactionRecs);
            }
            if (recommendations.length < limit) {
                const popularRecs = await this.getPopularRecommendations(limit - recommendations.length);
                recommendations.push(...popularRecs);
                if (recommendations.length === popularRecs.length) {
                    algorithmType = 'popularity';
                    confidence = 0.60;
                }
            }
            recommendations = this.deduplicateAndSort(recommendations);
            recommendations = recommendations.slice(0, limit);
            const result = {
                customerId,
                recommendations,
                algorithmType,
                confidence,
                context,
                generatedAt: new Date().toISOString(),
            };
            await this.saveRecommendation(result);
            return result;
        }
        catch (error) {
            console.error('Error generating recommendations:', error);
            const popularRecs = await this.getPopularRecommendations(limit);
            return {
                customerId,
                recommendations: popularRecs,
                algorithmType: 'popularity',
                confidence: 0.50,
                context,
                generatedAt: new Date().toISOString(),
            };
        }
    }
    async getContentBasedRecommendations(profile, limit) {
        const recommendations = [];
        const productsResponse = await this.productsService.findAll({});
        const products = productsResponse.data;
        let filteredProducts = products;
        if (profile.preferences.dietaryRestrictions && profile.preferences.dietaryRestrictions.length > 0) {
        }
        if (profile.preferences.budgetRange) {
            filteredProducts = filteredProducts.filter(p => p.price >= profile.preferences.budgetRange.min &&
                p.price <= profile.preferences.budgetRange.max);
        }
        if (profile.preferences.favoriteCategories && profile.preferences.favoriteCategories.length > 0) {
            const categoryProducts = filteredProducts.filter(p => profile.preferences.favoriteCategories.includes(p.category));
            categoryProducts.forEach(product => {
                recommendations.push({
                    product,
                    score: 0.8,
                    reason: `From your favorite category: ${product.category}`,
                    tags: ['preferred_category', 'personalized'],
                });
            });
        }
        if (profile.preferences.brandPreferences && profile.preferences.brandPreferences.length > 0) {
            const brandProducts = filteredProducts.filter(p => profile.preferences.brandPreferences.includes(p.supplier));
            brandProducts.forEach(product => {
                if (!recommendations.find(r => r.product.id === product.id)) {
                    recommendations.push({
                        product,
                        score: 0.75,
                        reason: `From your preferred brand: ${product.supplier}`,
                        tags: ['preferred_brand', 'personalized'],
                    });
                }
            });
        }
        return recommendations.slice(0, limit);
    }
    async getCollaborativeRecommendations(customerId, purchases, limit) {
        const recommendations = [];
        const purchasedProductIds = new Set(purchases.map(p => p.productId));
        for (const purchase of purchases.slice(0, 5)) {
            try {
                const similarProducts = await this.productSimilarityService.findSimilarProducts(purchase.productId, 5, 0.4);
                for (const similar of similarProducts) {
                    if (!purchasedProductIds.has(similar.productId)) {
                        recommendations.push({
                            product: similar.product,
                            score: similar.similarity * 0.9,
                            reason: `Similar to ${similar.product.name} you purchased`,
                            tags: ['similar_to_purchased', 'collaborative'],
                        });
                    }
                }
            }
            catch (error) {
                console.error(`Error finding similar products for ${purchase.productId}:`, error);
            }
        }
        for (const purchase of purchases.slice(0, 3)) {
            try {
                const complementaryProducts = await this.productSimilarityService.getComplementaryProducts(purchase.productId);
                for (const product of complementaryProducts) {
                    if (!purchasedProductIds.has(product.id)) {
                        recommendations.push({
                            product,
                            score: 0.7,
                            reason: 'Frequently bought together',
                            tags: ['complementary', 'cross_sell'],
                        });
                    }
                }
            }
            catch (error) {
                console.error(`Error finding complementary products for ${purchase.productId}:`, error);
            }
        }
        return recommendations;
    }
    async getInteractionBasedRecommendations(interactions, limit) {
        const recommendations = [];
        const viewedProducts = interactions
            .filter(i => i.interactionType === 'view')
            .slice(0, 10)
            .map(i => i.productId);
        const cartProducts = interactions
            .filter(i => i.interactionType === 'add_to_cart')
            .slice(0, 5)
            .map(i => i.productId);
        for (const productId of viewedProducts.slice(0, 3)) {
            try {
                const similarProducts = await this.productSimilarityService.findSimilarProducts(productId, 3, 0.5);
                for (const similar of similarProducts) {
                    recommendations.push({
                        product: similar.product,
                        score: similar.similarity * 0.6,
                        reason: 'Based on your recent views',
                        tags: ['recently_viewed', 'session_based'],
                    });
                }
            }
            catch (error) {
                console.error(`Error processing viewed product ${productId}:`, error);
            }
        }
        for (const productId of cartProducts) {
            try {
                const product = await this.productsService.findOne(productId);
                if (product) {
                    recommendations.push({
                        product,
                        score: 0.85,
                        reason: 'Previously in your cart',
                        tags: ['abandoned_cart', 'high_intent'],
                    });
                }
            }
            catch (error) {
                console.error(`Error processing cart product ${productId}:`, error);
            }
        }
        return recommendations;
    }
    async getPopularRecommendations(limit) {
        const productsResponse = await this.productsService.findAll({});
        const products = productsResponse.data;
        const popularProducts = products
            .filter(p => p.quantity > 0)
            .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
            .slice(0, limit);
        return popularProducts.map(product => ({
            product,
            score: 0.5,
            reason: 'Popular product',
            tags: ['trending', 'bestseller'],
        }));
    }
    deduplicateAndSort(recommendations) {
        const seen = new Map();
        for (const rec of recommendations) {
            const existing = seen.get(rec.product.id);
            if (!existing || rec.score > existing.score) {
                seen.set(rec.product.id, rec);
            }
        }
        return Array.from(seen.values()).sort((a, b) => b.score - a.score);
    }
    async saveRecommendation(result) {
        const recommendation = {
            id: (0, uuid_1.v4)(),
            customerId: result.customerId,
            recommendations: result.recommendations.map(r => ({
                productId: r.product.id,
                productName: r.product.name,
                score: r.score,
                reason: r.reason,
                tags: r.tags,
            })),
            algorithmType: result.algorithmType,
            confidence: result.confidence,
            context: result.context,
            generatedAt: result.generatedAt,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
        };
        await this.dynamoDBService.put(this.recommendationsTable, recommendation);
    }
    async getSimilarProducts(productId, limit = 5) {
        const similarProducts = await this.productSimilarityService.findSimilarProducts(productId, limit, 0.3);
        return similarProducts.map(similar => ({
            product: similar.product,
            score: similar.similarity,
            reason: similar.reasons.join(', '),
            tags: ['similar_product'],
        }));
    }
};
exports.RecommendationEngineService = RecommendationEngineService;
exports.RecommendationEngineService = RecommendationEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customers_service_1.CustomersService,
        products_service_1.ProductsService,
        product_similarity_service_1.ProductSimilarityService,
        dynamodb_service_1.DynamoDBService])
], RecommendationEngineService);
//# sourceMappingURL=recommendation-engine.service.js.map