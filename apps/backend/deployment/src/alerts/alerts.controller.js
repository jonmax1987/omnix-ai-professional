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
exports.AlertsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const alerts_service_1 = require("./alerts.service");
let AlertsController = class AlertsController {
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    async getAlerts(type, severity, limit) {
        try {
            const limitNum = limit ? parseInt(limit, 10) : 50;
            return await this.alertsService.findAll(type, severity, limitNum);
        }
        catch (error) {
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to retrieve alerts',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async dismissAlert(alertId) {
        try {
            const dismissed = await this.alertsService.dismissAlert(alertId);
            if (!dismissed) {
                throw new common_1.HttpException({
                    error: 'Not Found',
                    message: 'Alert not found',
                    code: common_1.HttpStatus.NOT_FOUND,
                    timestamp: new Date().toISOString(),
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'Alert dismissed successfully' };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.NOT_FOUND) {
                throw error;
            }
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to dismiss alert',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get alerts',
        description: 'Retrieve current alerts including low stock, expired items, and urgent notifications',
    }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['low-stock', 'out-of-stock', 'expired', 'forecast-warning', 'system'] }),
    (0, swagger_1.ApiQuery)({ name: 'severity', required: false, enum: ['high', 'medium', 'low'] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: 'number', example: 50 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alerts retrieved successfully' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('severity')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Post)(':alertId/dismiss'),
    (0, swagger_1.ApiOperation)({
        summary: 'Dismiss an alert',
        description: 'Mark an alert as dismissed',
    }),
    (0, swagger_1.ApiParam)({ name: 'alertId', description: 'Alert ID to dismiss' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert dismissed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert not found' }),
    __param(0, (0, common_1.Param)('alertId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "dismissAlert", null);
exports.AlertsController = AlertsController = __decorate([
    (0, swagger_1.ApiTags)('Alerts'),
    (0, swagger_1.ApiSecurity)('ApiKeyAuth'),
    (0, swagger_1.ApiSecurity)('BearerAuth'),
    (0, common_1.Controller)('alerts'),
    __metadata("design:paramtypes", [alerts_service_1.AlertsService])
], AlertsController);
//# sourceMappingURL=alerts.controller.js.map