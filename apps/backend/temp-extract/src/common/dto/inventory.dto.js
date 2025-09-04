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
exports.InventoryOverview = exports.InventoryItem = exports.InventoryHistory = exports.StockAdjustmentDto = exports.AdjustmentReason = exports.AdjustmentType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var AdjustmentType;
(function (AdjustmentType) {
    AdjustmentType["INCREASE"] = "increase";
    AdjustmentType["DECREASE"] = "decrease";
    AdjustmentType["SET"] = "set";
})(AdjustmentType || (exports.AdjustmentType = AdjustmentType = {}));
var AdjustmentReason;
(function (AdjustmentReason) {
    AdjustmentReason["RECEIVED_SHIPMENT"] = "received_shipment";
    AdjustmentReason["SOLD"] = "sold";
    AdjustmentReason["DAMAGED"] = "damaged";
    AdjustmentReason["EXPIRED"] = "expired";
    AdjustmentReason["THEFT"] = "theft";
    AdjustmentReason["INVENTORY_COUNT"] = "inventory_count";
    AdjustmentReason["MANUAL_ADJUSTMENT"] = "manual_adjustment";
    AdjustmentReason["TRANSFER"] = "transfer";
})(AdjustmentReason || (exports.AdjustmentReason = AdjustmentReason = {}));
class StockAdjustmentDto {
}
exports.StockAdjustmentDto = StockAdjustmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50, description: 'Quantity to adjust' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], StockAdjustmentDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AdjustmentType, example: AdjustmentType.INCREASE }),
    (0, class_validator_1.IsEnum)(AdjustmentType),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AdjustmentReason, example: AdjustmentReason.RECEIVED_SHIPMENT }),
    (0, class_validator_1.IsEnum)(AdjustmentReason),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Received new shipment from supplier' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "notes", void 0);
class InventoryHistory {
}
exports.InventoryHistory = InventoryHistory;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryHistory.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryHistory.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryHistory.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryHistory.prototype, "previousQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryHistory.prototype, "newQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryHistory.prototype, "adjustmentQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AdjustmentType }),
    __metadata("design:type", String)
], InventoryHistory.prototype, "adjustmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AdjustmentReason }),
    __metadata("design:type", String)
], InventoryHistory.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryHistory.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryHistory.prototype, "adjustedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryHistory.prototype, "adjustedAt", void 0);
class InventoryItem {
}
exports.InventoryItem = InventoryItem;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryItem.prototype, "currentStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryItem.prototype, "minThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryItem.prototype, "maxCapacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryItem.prototype, "reservedStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryItem.prototype, "availableStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryItem.prototype, "stockValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "lastMovement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "stockStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "supplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InventoryItem.prototype, "updatedAt", void 0);
class InventoryOverview {
}
exports.InventoryOverview = InventoryOverview;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverview.prototype, "totalProducts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverview.prototype, "totalStockValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverview.prototype, "lowStockProducts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverview.prototype, "outOfStockProducts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverview.prototype, "overstockedProducts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InventoryOverview.prototype, "recentMovements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], InventoryOverview.prototype, "categoryBreakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], InventoryOverview.prototype, "locationBreakdown", void 0);
//# sourceMappingURL=inventory.dto.js.map