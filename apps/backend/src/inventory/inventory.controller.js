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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const inventory_dto_1 = require("../common/dto/inventory.dto");
let InventoryController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Inventory Management'), (0, common_1.Controller)('inventory'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getInventoryOverview_decorators;
    let _getAllInventoryItems_decorators;
    let _getProductInventory_decorators;
    let _adjustStock_decorators;
    let _getInventoryHistory_decorators;
    var InventoryController = _classThis = class {
        constructor(inventoryService) {
            this.inventoryService = (__runInitializers(this, _instanceExtraInitializers), inventoryService);
        }
        async getInventoryOverview() {
            const overview = await this.inventoryService.getInventoryOverview();
            return {
                data: overview,
                message: 'Inventory overview retrieved successfully'
            };
        }
        async getAllInventoryItems() {
            const items = await this.inventoryService.getAllInventoryItems();
            const meta = {
                totalItems: items.length,
                lowStockItems: items.filter(item => item.stockStatus === 'low' || item.stockStatus === 'critical').length,
                outOfStockItems: items.filter(item => item.currentStock === 0).length,
            };
            return {
                data: items,
                meta,
                message: 'Inventory items retrieved successfully'
            };
        }
        async getProductInventory(productId) {
            const inventory = await this.inventoryService.getProductInventory(productId);
            if (!inventory) {
                throw new common_1.NotFoundException(`Product with ID ${productId} not found`);
            }
            return {
                data: inventory,
                message: 'Product inventory retrieved successfully'
            };
        }
        async adjustStock(productId, adjustmentDto, user) {
            try {
                const updatedInventory = await this.inventoryService.adjustStock(productId, adjustmentDto, user.id);
                if (!updatedInventory) {
                    throw new common_1.NotFoundException(`Product with ID ${productId} not found`);
                }
                return {
                    data: updatedInventory,
                    message: `Stock adjustment completed successfully. ${adjustmentDto.type} of ${adjustmentDto.quantity} units.`
                };
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    throw error;
                }
                throw new common_1.BadRequestException('Invalid adjustment parameters: ' + error.message);
            }
        }
        async getInventoryHistory(productId, limit) {
            // Verify product exists
            const inventory = await this.inventoryService.getProductInventory(productId);
            if (!inventory) {
                throw new common_1.NotFoundException(`Product with ID ${productId} not found`);
            }
            const limitNum = limit ? parseInt(limit, 10) : 50;
            const history = await this.inventoryService.getInventoryHistory(productId, limitNum);
            return {
                data: history,
                meta: {
                    productId,
                    totalRecords: history.length,
                    limit: limitNum,
                },
                message: 'Inventory history retrieved successfully'
            };
        }
    };
    __setFunctionName(_classThis, "InventoryController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getInventoryOverview_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive inventory overview' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Inventory overview retrieved successfully',
                type: inventory_dto_1.InventoryOverview
            })];
        _getAllInventoryItems_decorators = [(0, common_1.Get)('items'), (0, swagger_1.ApiOperation)({ summary: 'Get all inventory items with detailed information' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Inventory items retrieved successfully'
            })];
        _getProductInventory_decorators = [(0, common_1.Get)(':productId'), (0, swagger_1.ApiOperation)({ summary: 'Get detailed inventory information for a specific product' }), (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product UUID' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Product inventory details retrieved successfully',
                type: inventory_dto_1.InventoryItem
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' })];
        _adjustStock_decorators = [(0, common_1.Post)(':productId/adjust'), (0, swagger_1.ApiOperation)({ summary: 'Adjust stock levels for a specific product' }), (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product UUID' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Stock adjustment completed successfully',
                type: inventory_dto_1.InventoryItem
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid adjustment parameters' })];
        _getInventoryHistory_decorators = [(0, common_1.Get)(':productId/history'), (0, swagger_1.ApiOperation)({ summary: 'Get inventory adjustment history for a specific product' }), (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product UUID' }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of history records to return (default: 50)' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Inventory history retrieved successfully'
            }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' })];
        __esDecorate(_classThis, null, _getInventoryOverview_decorators, { kind: "method", name: "getInventoryOverview", static: false, private: false, access: { has: obj => "getInventoryOverview" in obj, get: obj => obj.getInventoryOverview }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllInventoryItems_decorators, { kind: "method", name: "getAllInventoryItems", static: false, private: false, access: { has: obj => "getAllInventoryItems" in obj, get: obj => obj.getAllInventoryItems }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProductInventory_decorators, { kind: "method", name: "getProductInventory", static: false, private: false, access: { has: obj => "getProductInventory" in obj, get: obj => obj.getProductInventory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _adjustStock_decorators, { kind: "method", name: "adjustStock", static: false, private: false, access: { has: obj => "adjustStock" in obj, get: obj => obj.adjustStock }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getInventoryHistory_decorators, { kind: "method", name: "getInventoryHistory", static: false, private: false, access: { has: obj => "getInventoryHistory" in obj, get: obj => obj.getInventoryHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InventoryController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InventoryController = _classThis;
})();
exports.InventoryController = InventoryController;
