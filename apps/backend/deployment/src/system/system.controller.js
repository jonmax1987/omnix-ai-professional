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
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const system_service_1 = require("./system.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const system_dto_1 = require("../common/dto/system.dto");
let SystemController = class SystemController {
    constructor(systemService) {
        this.systemService = systemService;
    }
    async getHealthCheck() {
        return this.systemService.getHealthCheck();
    }
    async getSystemStatus() {
        const status = await this.systemService.getSystemStatus();
        return {
            data: status,
            message: 'System status retrieved successfully'
        };
    }
    async getSystemMetrics() {
        const metrics = await this.systemService.getSystemMetrics();
        return {
            data: metrics,
            message: 'System metrics retrieved successfully'
        };
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'System health check endpoint' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System health status',
        type: system_dto_1.HealthCheck
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getHealthCheck", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Detailed system status and service information' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System status retrieved successfully',
        type: system_dto_1.SystemStatus
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getSystemStatus", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Comprehensive system metrics and performance data' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System metrics retrieved successfully',
        type: system_dto_1.SystemMetrics
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getSystemMetrics", null);
exports.SystemController = SystemController = __decorate([
    (0, swagger_1.ApiTags)('System Monitoring'),
    (0, common_1.Controller)('system'),
    __metadata("design:paramtypes", [system_service_1.SystemService])
], SystemController);
//# sourceMappingURL=system.controller.js.map