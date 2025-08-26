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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const dynamodb_service_1 = require("../services/dynamodb.service");
const websocket_service_1 = require("../websocket/websocket.service");
let ProductsService = class ProductsService {
    constructor(dynamoDBService, webSocketService) {
        this.dynamoDBService = dynamoDBService;
        this.webSocketService = webSocketService;
        this.tableName = 'products';
    }
    async findAll(query) {
        try {
            console.log('🔍 Fetching products from DynamoDB...');
            let products = await this.dynamoDBService.scan(this.tableName);
            console.log(`📦 Retrieved ${products.length} products from database`);
            if (query.search) {
                const searchTerm = query.search.toLowerCase();
                products = products.filter((product) => product.name?.toLowerCase().includes(searchTerm) ||
                    product.sku?.toLowerCase().includes(searchTerm) ||
                    product.barcode?.toLowerCase().includes(searchTerm));
            }
            if (query.category) {
                products = products.filter((product) => product.category?.toLowerCase() === query.category.toLowerCase());
            }
            if (query.supplier) {
                products = products.filter((product) => product.supplier?.toLowerCase().includes(query.supplier.toLowerCase()));
            }
            if (query.lowStock) {
                products = products.filter((product) => product.quantity <= product.minThreshold);
            }
            products.sort((a, b) => {
                const aValue = a[query.sortBy] || '';
                const bValue = b[query.sortBy] || '';
                if (query.sortOrder === 'desc') {
                    return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
                }
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            });
            const total = products.length;
            const pages = Math.ceil(total / query.limit);
            const startIndex = (query.page - 1) * query.limit;
            const endIndex = startIndex + query.limit;
            const paginatedProducts = products.slice(startIndex, endIndex);
            const totalValue = products.reduce((sum, product) => sum + ((product.price || 0) * (product.quantity || 0)), 0);
            const totalItems = products.reduce((sum, product) => sum + (product.quantity || 0), 0);
            return {
                data: paginatedProducts,
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total,
                    pages,
                    hasNext: query.page < pages,
                    hasPrev: query.page > 1,
                },
                meta: {
                    totalValue,
                    totalItems,
                },
            };
        }
        catch (error) {
            console.error('❌ Error fetching products:', error);
            console.error('Returning empty product list due to database error');
            return {
                data: [],
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total: 0,
                    pages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
                meta: {
                    totalValue: 0,
                    totalItems: 0,
                },
            };
        }
    }
    async findOne(id) {
        try {
            const product = await this.dynamoDBService.get(this.tableName, { id });
            return product || null;
        }
        catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }
    async create(createProductDto) {
        try {
            console.log('🆕 Creating new product with data:', JSON.stringify(createProductDto, null, 2));
            console.log('🔍 Checking for existing SKU...');
            const existingProducts = await this.dynamoDBService.scan(this.tableName);
            const existingProduct = existingProducts.find((product) => product.sku?.toLowerCase() === createProductDto.sku.toLowerCase());
            if (existingProduct) {
                console.log(`❌ Product with SKU '${createProductDto.sku}' already exists`);
                throw new Error(`Product with SKU '${createProductDto.sku}' already exists`);
            }
            const now = new Date().toISOString();
            const newProduct = {
                id: (0, uuid_1.v4)(),
                ...createProductDto,
                createdAt: now,
                updatedAt: now,
                lastUpdated: now,
            };
            console.log('💾 Attempting to save product to DynamoDB...');
            console.log('💾 Product data:', JSON.stringify(newProduct, null, 2));
            await this.dynamoDBService.put(this.tableName, newProduct);
            console.log('✅ Product successfully created with ID:', newProduct.id);
            this.webSocketService.emitProductUpdate(newProduct.id, newProduct);
            return newProduct;
        }
        catch (error) {
            console.error('❌ Error creating product:', error);
            console.error('❌ Error stack:', error.stack);
            throw error;
        }
    }
    async update(id, updateProductDto) {
        try {
            const existingProduct = await this.findOne(id);
            if (!existingProduct) {
                return null;
            }
            const now = new Date().toISOString();
            const updates = {
                ...updateProductDto,
                updatedAt: now,
                lastUpdated: now,
            };
            const updatedProduct = await this.dynamoDBService.update(this.tableName, { id }, updates);
            this.webSocketService.emitProductUpdate(id, updatedProduct);
            if (updateProductDto.quantity !== undefined && updateProductDto.quantity !== existingProduct.quantity) {
                this.webSocketService.emitStockChanged(id, updatedProduct.name, updatedProduct.quantity, updatedProduct.minThreshold || 0);
            }
            return updatedProduct;
        }
        catch (error) {
            console.error('Error updating product:', error);
            return null;
        }
    }
    async remove(id) {
        try {
            const result = await this.dynamoDBService.delete(this.tableName, { id });
            if (result) {
                this.webSocketService.emitProductDeleted(id);
            }
            return result;
        }
        catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }
    async findLowStockProducts() {
        try {
            const products = await this.dynamoDBService.scan(this.tableName);
            return products.filter((product) => product.quantity <= product.minThreshold);
        }
        catch (error) {
            console.error('Error finding low stock products:', error);
            return [];
        }
    }
    async findByCategory(category) {
        try {
            const products = await this.dynamoDBService.scan(this.tableName);
            return products.filter((product) => product.category?.toLowerCase() === category.toLowerCase());
        }
        catch (error) {
            console.error('Error finding products by category:', error);
            return [];
        }
    }
    async getTotalInventoryValue() {
        try {
            const products = await this.dynamoDBService.scan(this.tableName);
            return products.reduce((sum, product) => sum + ((product.price || 0) * (product.quantity || 0)), 0);
        }
        catch (error) {
            console.error('Error calculating inventory value:', error);
            return 0;
        }
    }
    async getTotalItemCount() {
        try {
            const products = await this.dynamoDBService.scan(this.tableName);
            return products.reduce((sum, product) => sum + (product.quantity || 0), 0);
        }
        catch (error) {
            console.error('Error calculating item count:', error);
            return 0;
        }
    }
    async getCategoryBreakdown() {
        try {
            const products = await this.dynamoDBService.scan(this.tableName);
            const categoryMap = new Map();
            for (const product of products) {
                if (!product.category)
                    continue;
                const existing = categoryMap.get(product.category) || { itemCount: 0, value: 0 };
                categoryMap.set(product.category, {
                    itemCount: existing.itemCount + (product.quantity || 0),
                    value: existing.value + ((product.price || 0) * (product.quantity || 0)),
                });
            }
            return Array.from(categoryMap.entries()).map(([category, stats]) => ({
                category,
                ...stats,
            }));
        }
        catch (error) {
            console.error('Error getting category breakdown:', error);
            return [];
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dynamodb_service_1.DynamoDBService,
        websocket_service_1.WebSocketService])
], ProductsService);
//# sourceMappingURL=products.service.js.map