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
exports.ProductSimilarityService = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("../products/products.service");
let ProductSimilarityService = class ProductSimilarityService {
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
        if (product1.category === product2.category) {
            similarityScore += weights.category;
        }
        const priceDiff = Math.abs(product1.price - product2.price);
        const avgPrice = (product1.price + product2.price) / 2;
        const priceRatio = avgPrice > 0 ? 1 - (priceDiff / avgPrice) : 0;
        if (priceRatio > 0.8) {
            similarityScore += weights.price * priceRatio;
        }
        if (product1.supplier === product2.supplier) {
            similarityScore += weights.supplier;
        }
        if (product1.location === product2.location) {
            similarityScore += weights.location;
        }
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
exports.ProductSimilarityService = ProductSimilarityService;
exports.ProductSimilarityService = ProductSimilarityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductSimilarityService);
//# sourceMappingURL=product-similarity.service.js.map