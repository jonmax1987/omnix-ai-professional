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
exports.ForecastsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const forecasts_service_1 = require("./forecasts.service");
let ForecastsController = class ForecastsController {
    constructor(forecastsService) {
        this.forecastsService = forecastsService;
    }
    async getMetrics() {
        return { data: await this.forecastsService.getMetrics() };
    }
    async getForecasts(query) {
        return await this.forecastsService.getForecasts(query);
    }
    async getForecast(productId, days) {
        return { data: await this.forecastsService.getForecast(productId, days) };
    }
};
exports.ForecastsController = ForecastsController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get forecast metrics overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns forecast metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ForecastsController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get demand forecasts with filtering and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'trend', required: false, enum: ['increasing', 'decreasing', 'stable'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated list of demand forecasts' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ForecastsController.prototype, "getForecasts", null);
__decorate([
    (0, common_1.Get)(':productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get forecast for a specific product' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns demand forecast for specific product' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ForecastsController.prototype, "getForecast", null);
exports.ForecastsController = ForecastsController = __decorate([
    (0, swagger_1.ApiTags)('forecasts'),
    (0, common_1.Controller)('forecasts'),
    __metadata("design:paramtypes", [forecasts_service_1.ForecastsService])
], ForecastsController);
//# sourceMappingURL=forecasts.controller.js.map