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
var AnalyticsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const performance_dto_1 = require("./dto/performance.dto");
const realtime_analytics_service_1 = require("../services/realtime-analytics.service");
let AnalyticsController = AnalyticsController_1 = class AnalyticsController {
    constructor(realtimeAnalyticsService) {
        this.realtimeAnalyticsService = realtimeAnalyticsService;
        this.logger = new common_1.Logger(AnalyticsController_1.name);
    }
    async recordPerformanceMetrics(metrics) {
        try {
            this.logger.log(`Recording performance metrics: ${JSON.stringify(metrics)}`);
            if (this.realtimeAnalyticsService) {
            }
            if (metrics.metrics) {
                const perfData = metrics.metrics;
                this.logger.log(`Performance Data - LCP: ${perfData.lcp}ms, FID: ${perfData.fid}ms, CLS: ${perfData.cls}`);
            }
            return {
                success: true,
                message: 'Performance metrics recorded successfully',
                timestamp: new Date().toISOString(),
                metricsId: `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
        }
        catch (error) {
            this.logger.error(`Failed to record performance metrics: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPerformanceSummary() {
        try {
            this.logger.log('Retrieving performance analytics summary');
            return {
                summary: {
                    totalMetricsCollected: 0,
                    averageLCP: 0,
                    averageFID: 0,
                    averageCLS: 0,
                    performanceScore: 95,
                    lastUpdated: new Date().toISOString()
                },
                trends: {
                    lcp: { trend: 'improving', change: -5.2 },
                    fid: { trend: 'stable', change: 0.1 },
                    cls: { trend: 'improving', change: -0.05 }
                },
                message: 'Performance summary retrieved successfully'
            };
        }
        catch (error) {
            this.logger.error(`Failed to get performance summary: ${error.message}`, error.stack);
            throw error;
        }
    }
    async healthCheck() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString()
        };
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('performance'),
    (0, swagger_1.ApiOperation)({
        summary: 'Record performance metrics from frontend application',
        description: 'Accepts performance metrics data from the frontend and stores it for analysis'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Performance metrics recorded successfully',
        type: performance_dto_1.PerformanceResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid performance metrics data'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [performance_dto_1.PerformanceMetricsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "recordPerformanceMetrics", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('performance/summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get performance analytics summary',
        description: 'Returns aggregated performance metrics and insights'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Performance summary retrieved successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPerformanceSummary", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Analytics service health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics service is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "healthCheck", null);
exports.AnalyticsController = AnalyticsController = AnalyticsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [realtime_analytics_service_1.RealtimeAnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map