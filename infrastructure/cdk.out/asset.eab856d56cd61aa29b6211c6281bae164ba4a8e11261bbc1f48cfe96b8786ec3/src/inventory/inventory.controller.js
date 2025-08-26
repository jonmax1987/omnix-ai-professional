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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../auth/decorators/user.decorator");
const auth_dto_1 = require("../common/dto/auth.dto");
const inventory_dto_1 = require("../common/dto/inventory.dto");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
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
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive inventory overview' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Inventory overview retrieved successfully',
        type: inventory_dto_1.InventoryOverview
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryOverview", null);
__decorate([
    (0, common_1.Get)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all inventory items with detailed information' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Inventory items retrieved successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getAllInventoryItems", null);
__decorate([
    (0, common_1.Get)(':productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed inventory information for a specific product' }),
    (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product inventory details retrieved successfully',
        type: inventory_dto_1.InventoryItem
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getProductInventory", null);
__decorate([
    (0, common_1.Post)(':productId/adjust'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust stock levels for a specific product' }),
    (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Stock adjustment completed successfully',
        type: inventory_dto_1.InventoryItem
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid adjustment parameters' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.StockAdjustmentDto,
        auth_dto_1.User]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Get)(':productId/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory adjustment history for a specific product' }),
    (0, swagger_1.ApiParam)({ name: 'productId', description: 'Product UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of history records to return (default: 50)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Inventory history retrieved successfully'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryHistory", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory Management'),
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map