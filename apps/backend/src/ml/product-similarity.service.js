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
exports.ProductSimilarityService = void 0;
const common_1 = require("@nestjs/common");
let ProductSimilarityService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProductSimilarityService = _classThis = class {
        constructor(productsService) {
            this.productsService = productsService;
        }
        calculateProductSimilarity(product1, product2) {
            if (product1.id === product2.id)
                return 0;
            let similarityScore = 0;
            const weights = {
                category: 0.35,
                price: 0.25,
                supplier: 0.15,
                location: 0.10,
                tags: 0.15,
            };
            // Category similarity
            if (product1.category === product2.category) {
                similarityScore += weights.category;
            }
            // Price similarity (within 20% range)
            const priceDiff = Math.abs(product1.price - product2.price);
            const avgPrice = (product1.price + product2.price) / 2;
            const priceRatio = avgPrice > 0 ? 1 - (priceDiff / avgPrice) : 0;
            if (priceRatio > 0.8) {
                similarityScore += weights.price * priceRatio;
            }
            // Supplier similarity
            if (product1.supplier === product2.supplier) {
                similarityScore += weights.supplier;
            }
            // Location similarity
            if (product1.location === product2.location) {
                similarityScore += weights.location;
            }
            // Tags similarity (if available) - currently not implemented in ProductDto
            // Could be added later when product tagging is implemented
            return Math.min(1, similarityScore);
        }
        async findSimilarProducts(productId, limit = 10, minSimilarity = 0.3) {
            const targetProduct = await this.productsService.findOne(productId);
            if (!targetProduct) {
                throw new Error(`Product ${productId} not found`);
            }
            const allProductsResponse = await this.productsService.findAll({});
            const allProducts = allProductsResponse.data;
            const similarities = [];
            for (const product of allProducts) {
                if (product.id === productId)
                    continue;
                const similarity = this.calculateProductSimilarity(targetProduct, product);
                if (similarity >= minSimilarity) {
                    const reasons = this.getSimilarityReasons(targetProduct, product, similarity);
                    similarities.push({
                        productId: product.id,
                        product,
                        similarity,
                        reasons,
                    });
                }
            }
            // Sort by similarity score (descending)
            similarities.sort((a, b) => b.similarity - a.similarity);
            return similarities.slice(0, limit);
        }
        async findProductsByCategory(category, excludeProductId, limit = 10) {
            const products = await this.productsService.findByCategory(category);
            const filtered = excludeProductId
                ? products.filter(p => p.id !== excludeProductId)
                : products;
            return filtered.slice(0, limit);
        }
        async findProductsInPriceRange(minPrice, maxPrice, excludeProductId, limit = 10) {
            const allProductsResponse = await this.productsService.findAll({});
            const allProducts = allProductsResponse.data;
            const filtered = allProducts.filter(p => {
                if (excludeProductId && p.id === excludeProductId)
                    return false;
                return p.price >= minPrice && p.price <= maxPrice;
            });
            // Sort by popularity (using quantity level as proxy)
            filtered.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
            return filtered.slice(0, limit);
        }
        getSimilarityReasons(product1, product2, similarity) {
            const reasons = [];
            if (product1.category === product2.category) {
                reasons.push(`Same category: ${product1.category}`);
            }
            const priceDiff = Math.abs(product1.price - product2.price);
            const avgPrice = (product1.price + product2.price) / 2;
            const priceRatio = avgPrice > 0 ? 1 - (priceDiff / avgPrice) : 0;
            if (priceRatio > 0.8) {
                reasons.push('Similar price range');
            }
            if (product1.supplier === product2.supplier) {
                reasons.push(`Same supplier: ${product1.supplier}`);
            }
            if (product1.location === product2.location) {
                reasons.push(`Same location: ${product1.location}`);
            }
            if (similarity > 0.7) {
                reasons.push('Highly similar product');
            }
            else if (similarity > 0.5) {
                reasons.push('Related product');
            }
            return reasons;
        }
        async getComplementaryProducts(productId) {
            const product = await this.productsService.findOne(productId);
            if (!product) {
                throw new Error(`Product ${productId} not found`);
            }
            // Define complementary categories based on the product category
            const complementaryMap = {
                'Fruits': ['Vegetables', 'Dairy', 'Bakery'],
                'Vegetables': ['Fruits', 'Spices', 'Dairy'],
                'Meat': ['Vegetables', 'Spices', 'Sauces'],
                'Dairy': ['Bakery', 'Fruits', 'Cereals'],
                'Bakery': ['Dairy', 'Spreads', 'Beverages'],
                'Beverages': ['Snacks', 'Bakery'],
                'Snacks': ['Beverages', 'Fruits'],
                'Frozen': ['Sauces', 'Vegetables'],
                'Cereals': ['Dairy', 'Fruits'],
                'Spices': ['Meat', 'Vegetables'],
            };
            const complementaryCategories = complementaryMap[product.category] || [];
            const complementaryProducts = [];
            for (const category of complementaryCategories) {
                const products = await this.findProductsByCategory(category, undefined, 3);
                complementaryProducts.push(...products);
            }
            return complementaryProducts.slice(0, 10);
        }
    };
    __setFunctionName(_classThis, "ProductSimilarityService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductSimilarityService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductSimilarityService = _classThis;
})();
exports.ProductSimilarityService = ProductSimilarityService;
