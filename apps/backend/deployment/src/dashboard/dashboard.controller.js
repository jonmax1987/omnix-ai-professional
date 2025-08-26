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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_dto_1 = require("../common/dto/dashboard.dto");
const common_dto_1 = require("../common/dto/common.dto");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSummary(query) {
        try {
            const data = await this.dashboardService.getSummary(query);
            return { data };
        }
        catch (error) {
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to retrieve dashboard summary',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getInventoryGraph(query) {
        try {
            const data = await this.dashboardService.getInventoryGraphData(query);
            return { data };
        }
        catch (error) {
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to retrieve inventory graph data',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get dashboard summary',
        description: 'Retrieve key metrics for the dashboard including total inventory value, item counts, and category breakdown',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard summary retrieved successfully',
        type: (common_dto_1.SuccessResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        type: common_dto_1.ErrorDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('inventory-graph'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get inventory graph data',
        description: 'Retrieve time-series data for inventory value and item counts',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Inventory graph data retrieved successfully',
        type: (common_dto_1.SuccessResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        type: common_dto_1.ErrorDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.InventoryGraphQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getInventoryGraph", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, swagger_1.ApiSecurity)('ApiKeyAuth'),
    (0, swagger_1.ApiSecurity)('BearerAuth'),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map