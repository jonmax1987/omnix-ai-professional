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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const inventory_dto_1 = require("../common/dto/inventory.dto");
const uuid_1 = require("uuid");
let InventoryService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var InventoryService = _classThis = class {
        constructor(webSocketService) {
            this.webSocketService = webSocketService;
            this.inventoryHistory = [];
            // Mock product data for inventory calculations
            this.mockProducts = [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Premium Coffee Beans',
                    sku: 'PCB-001',
                    category: 'Beverages',
                    quantity: 150,
                    minThreshold: 20,
                    price: 24.99,
                    cost: 18.50,
                    supplier: 'Global Coffee Co.',
                    location: 'Warehouse A, Shelf 3',
                },
                {
                    id: '223e4567-e89b-12d3-a456-426614174001',
                    name: 'Organic Green Tea',
                    sku: 'OGT-002',
                    category: 'Beverages',
                    quantity: 8,
                    minThreshold: 15,
                    price: 12.99,
                    cost: 9.50,
                    supplier: 'Organic Tea Ltd.',
                    location: 'Warehouse A, Shelf 2',
                },
                {
                    id: '323e4567-e89b-12d3-a456-426614174002',
                    name: 'Whole Wheat Flour',
                    sku: 'WWF-003',
                    category: 'Baking',
                    quantity: 45,
                    minThreshold: 10,
                    price: 8.99,
                    cost: 6.50,
                    supplier: 'Mills & Grains Co.',
                    location: 'Warehouse B, Shelf 1',
                },
            ];
        }
        async getInventoryOverview() {
            const products = this.mockProducts;
            const totalProducts = products.length;
            const totalStockValue = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
            const lowStockProducts = products.filter(p => p.quantity <= p.minThreshold).length;
            const outOfStockProducts = products.filter(p => p.quantity === 0).length;
            const overstockedProducts = products.filter(p => p.quantity > (p.minThreshold * 4)).length;
            const recentMovements = this.inventoryHistory.filter(h => new Date(h.adjustedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
            // Category breakdown
            const categoryMap = new Map();
            products.forEach(product => {
                const existing = categoryMap.get(product.category) || {
                    category: product.category,
                    productCount: 0,
                    stockValue: 0,
                    totalQuantity: 0,
                };
                existing.productCount += 1;
                existing.stockValue += product.quantity * product.cost;
                existing.totalQuantity += product.quantity;
                categoryMap.set(product.category, existing);
            });
            const categoryBreakdown = Array.from(categoryMap.values()).map(cat => ({
                category: cat.category,
                productCount: cat.productCount,
                stockValue: Math.round(cat.stockValue * 100) / 100,
                averageStockLevel: Math.round((cat.totalQuantity / cat.productCount) * 100) / 100,
            }));
            // Location breakdown
            const locationMap = new Map();
            products.forEach(product => {
                if (product.location) {
                    const existing = locationMap.get(product.location) || {
                        location: product.location,
                        productCount: 0,
                        stockValue: 0,
                    };
                    existing.productCount += 1;
                    existing.stockValue += product.quantity * product.cost;
                    locationMap.set(product.location, existing);
                }
            });
            const locationBreakdown = Array.from(locationMap.values()).map(loc => ({
                location: loc.location,
                productCount: loc.productCount,
                stockValue: Math.round(loc.stockValue * 100) / 100,
            }));
            return {
                totalProducts,
                totalStockValue: Math.round(totalStockValue * 100) / 100,
                lowStockProducts,
                outOfStockProducts,
                overstockedProducts,
                recentMovements,
                categoryBreakdown,
                locationBreakdown,
            };
        }
        async getProductInventory(productId) {
            const product = this.mockProducts.find(p => p.id === productId);
            if (!product) {
                return null;
            }
            const reservedStock = 0; // Mock reserved stock
            const availableStock = product.quantity - reservedStock;
            const stockValue = product.quantity * product.cost;
            let stockStatus;
            if (product.quantity === 0) {
                stockStatus = 'critical';
            }
            else if (product.quantity <= product.minThreshold) {
                stockStatus = 'low';
            }
            else if (product.quantity > product.minThreshold * 4) {
                stockStatus = 'overstocked';
            }
            else {
                stockStatus = 'normal';
            }
            const lastMovement = this.inventoryHistory
                .filter(h => h.productId === productId)
                .sort((a, b) => new Date(b.adjustedAt).getTime() - new Date(a.adjustedAt).getTime())[0];
            return {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                category: product.category,
                currentStock: product.quantity,
                minThreshold: product.minThreshold,
                reservedStock,
                availableStock,
                stockValue: Math.round(stockValue * 100) / 100,
                lastMovement: lastMovement?.adjustedAt,
                stockStatus,
                location: product.location,
                supplier: product.supplier,
                updatedAt: new Date().toISOString(),
            };
        }
        async adjustStock(productId, adjustment, userId) {
            const productIndex = this.mockProducts.findIndex(p => p.id === productId);
            if (productIndex === -1) {
                return null;
            }
            const product = this.mockProducts[productIndex];
            const previousQuantity = product.quantity;
            let newQuantity;
            switch (adjustment.type) {
                case inventory_dto_1.AdjustmentType.INCREASE:
                    newQuantity = previousQuantity + adjustment.quantity;
                    break;
                case inventory_dto_1.AdjustmentType.DECREASE:
                    newQuantity = Math.max(0, previousQuantity - adjustment.quantity);
                    break;
                case inventory_dto_1.AdjustmentType.SET:
                    newQuantity = adjustment.quantity;
                    break;
                default:
                    throw new Error('Invalid adjustment type');
            }
            // Update the product quantity
            this.mockProducts[productIndex].quantity = newQuantity;
            // Record the history
            const historyEntry = {
                id: (0, uuid_1.v4)(),
                productId,
                productName: product.name,
                previousQuantity,
                newQuantity,
                adjustmentQuantity: adjustment.quantity,
                adjustmentType: adjustment.type,
                reason: adjustment.reason,
                notes: adjustment.notes,
                adjustedBy: userId,
                adjustedAt: new Date().toISOString(),
            };
            this.inventoryHistory.push(historyEntry);
            // Emit WebSocket events for stock change
            this.webSocketService.emitStockChanged(productId, product.name, newQuantity, product.minThreshold);
            // Return updated inventory item
            return this.getProductInventory(productId);
        }
        async getInventoryHistory(productId, limit = 50) {
            return this.inventoryHistory
                .filter(h => h.productId === productId)
                .sort((a, b) => new Date(b.adjustedAt).getTime() - new Date(a.adjustedAt).getTime())
                .slice(0, limit);
        }
        async getAllInventoryItems() {
            const items = [];
            for (const product of this.mockProducts) {
                const inventoryItem = await this.getProductInventory(product.id);
                if (inventoryItem) {
                    items.push(inventoryItem);
                }
            }
            return items.sort((a, b) => a.productName.localeCompare(b.productName));
        }
    };
    __setFunctionName(_classThis, "InventoryService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InventoryService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InventoryService = _classThis;
})();
exports.InventoryService = InventoryService;
