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
exports.RecommendationEngineService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let RecommendationEngineService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RecommendationEngineService = _classThis = class {
        constructor(customersService, productsService, productSimilarityService, dynamoDBService) {
            this.customersService = customersService;
            this.productsService = productsService;
            this.productSimilarityService = productSimilarityService;
            this.dynamoDBService = dynamoDBService;
            this.recommendationsTable = 'recommendations';
        }
        async generateRecommendations(customerId, context = 'homepage', limit = 10) {
            try {
                // Get customer profile and purchase history
                const [profile, purchases, interactions] = await Promise.all([
                    this.customersService.getCustomerProfile(customerId).catch(() => null),
                    this.customersService.getCustomerPurchases(customerId, 50).catch(() => []),
                    this.customersService.getCustomerInteractions(customerId, 100).catch(() => []),
                ]);
                let recommendations = [];
                let algorithmType = 'hybrid';
                let confidence = 0.75;
                // If we have purchase history, use collaborative filtering
                if (purchases && purchases.length > 0) {
                    const collaborativeRecs = await this.getCollaborativeRecommendations(customerId, purchases, limit);
                    recommendations.push(...collaborativeRecs);
                    algorithmType = 'collaborative';
                    confidence = 0.85;
                }
                // If we have profile preferences, use content-based filtering
                if (profile && profile.preferences) {
                    const contentRecs = await this.getContentBasedRecommendations(profile, limit);
                    recommendations.push(...contentRecs);
                    if (recommendations.length === 0) {
                        algorithmType = 'content-based';
                        confidence = 0.70;
                    }
                }
                // If we have recent interactions, boost relevant products
                if (interactions && interactions.length > 0) {
                    const interactionRecs = await this.getInteractionBasedRecommendations(interactions, limit);
                    recommendations.push(...interactionRecs);
                }
                // Fallback to popular products if no personalized recommendations
                if (recommendations.length < limit) {
                    const popularRecs = await this.getPopularRecommendations(limit - recommendations.length);
                    recommendations.push(...popularRecs);
                    if (recommendations.length === popularRecs.length) {
                        algorithmType = 'popularity';
                        confidence = 0.60;
                    }
                }
                // Remove duplicates and sort by score
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
                // Save recommendation to database
                await this.saveRecommendation(result);
                return result;
            }
            catch (error) {
                console.error('Error generating recommendations:', error);
                // Return popular products as fallback
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
            // Filter by dietary restrictions if any
            let filteredProducts = products;
            if (profile.preferences.dietaryRestrictions && profile.preferences.dietaryRestrictions.length > 0) {
                // This would need actual dietary metadata on products
                // For now, we'll skip this filtering
            }
            // Filter by budget range
            if (profile.preferences.budgetRange) {
                filteredProducts = filteredProducts.filter(p => p.price >= profile.preferences.budgetRange.min &&
                    p.price <= profile.preferences.budgetRange.max);
            }
            // Prioritize favorite categories
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
            // Add products from preferred brands
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
            // For each purchased product, find similar products
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
            // Find complementary products
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
            // Get recently viewed products
            const viewedProducts = interactions
                .filter(i => i.interactionType === 'view')
                .slice(0, 10)
                .map(i => i.productId);
            // Get products added to cart but not purchased
            const cartProducts = interactions
                .filter(i => i.interactionType === 'add_to_cart')
                .slice(0, 5)
                .map(i => i.productId);
            // Find similar products to viewed items
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
            // Boost products that were in cart
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
            // Sort by quantity level (as a proxy for popularity)
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
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
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
    __setFunctionName(_classThis, "RecommendationEngineService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RecommendationEngineService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RecommendationEngineService = _classThis;
})();
exports.RecommendationEngineService = RecommendationEngineService;
