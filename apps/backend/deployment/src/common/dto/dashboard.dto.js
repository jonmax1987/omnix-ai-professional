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
exports.InventoryGraphDataDto = exports.InventoryGraphQueryDto = exports.DashboardQueryDto = exports.DashboardSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class DashboardSummaryDto {
}
exports.DashboardSummaryDto = DashboardSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total inventory value',
        example: 15432.50,
    }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "totalInventoryValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of items in stock',
        example: 1250,
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "totalItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of low stock items',
        example: 5,
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "lowStockItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of out of stock items',
        example: 2,
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "outOfStockItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of expired items',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "expiredItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of active alerts',
        example: 8,
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "activeAlerts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category breakdown',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                category: { type: 'string' },
                itemCount: { type: 'integer' },
                value: { type: 'number' },
            },
        },
    }),
    __metadata("design:type", Array)
], DashboardSummaryDto.prototype, "categoryBreakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Top categories by value percentage',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                category: { type: 'string' },
                percentage: { type: 'number' },
            },
        },
    }),
    __metadata("design:type", Array)
], DashboardSummaryDto.prototype, "topCategories", void 0);
class DashboardQueryDto {
    constructor() {
        this.timeRange = 'month';
    }
}
exports.DashboardQueryDto = DashboardQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Time range for data aggregation',
        example: 'month',
        enum: ['today', 'week', 'month', 'quarter', 'year'],
        default: 'month',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['today', 'week', 'month', 'quarter', 'year']),
    __metadata("design:type", String)
], DashboardQueryDto.prototype, "timeRange", void 0);
class InventoryGraphQueryDto {
    constructor() {
        this.timeRange = 'month';
        this.granularity = 'daily';
    }
}
exports.InventoryGraphQueryDto = InventoryGraphQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Time range for the graph',
        example: 'month',
        enum: ['week', 'month', 'quarter', 'year'],
        default: 'month',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['week', 'month', 'quarter', 'year']),
    __metadata("design:type", String)
], InventoryGraphQueryDto.prototype, "timeRange", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by specific category',
        example: 'Beverages',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InventoryGraphQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data point granularity',
        example: 'daily',
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['daily', 'weekly', 'monthly']),
    __metadata("design:type", String)
], InventoryGraphQueryDto.prototype, "granularity", void 0);
class InventoryGraphDataDto {
}
exports.InventoryGraphDataDto = InventoryGraphDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time range of the data',
        example: 'month',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InventoryGraphDataDto.prototype, "timeRange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data granularity',
        example: 'daily',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InventoryGraphDataDto.prototype, "granularity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Graph data points',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                timestamp: { type: 'string', format: 'date-time' },
                inventoryValue: { type: 'number' },
                itemCount: { type: 'integer' },
                categories: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            category: { type: 'string' },
                            value: { type: 'number' },
                            count: { type: 'integer' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Array)
], InventoryGraphDataDto.prototype, "dataPoints", void 0);
//# sourceMappingURL=dashboard.dto.js.map