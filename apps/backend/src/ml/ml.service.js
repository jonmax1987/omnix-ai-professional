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
exports.MlService = void 0;
const common_1 = require("@nestjs/common");
let MlService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MlService = _classThis = class {
        constructor(recommendationEngine, productSimilarity, customersService) {
            this.recommendationEngine = recommendationEngine;
            this.productSimilarity = productSimilarity;
            this.customersService = customersService;
        }
        async getPersonalizedRecommendations(request) {
            const limit = request.limit || 10;
            // Generate personalized recommendations
            const result = await this.recommendationEngine.generateRecommendations(request.customerId, request.context, limit);
            // Track the recommendation generation as an interaction
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
            // This would analyze recent interactions across all customers
            // For now, return popular products
            const popular = await this.recommendationEngine['getPopularRecommendations'](limit);
            return popular;
        }
        async getSeasonalRecommendations(season, limit = 10) {
            // This would return season-specific products
            // For now, return category-based recommendations
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
            // Track user feedback on recommendations
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
    __setFunctionName(_classThis, "MlService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MlService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MlService = _classThis;
})();
exports.MlService = MlService;
