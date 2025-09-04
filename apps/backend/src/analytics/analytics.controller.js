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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const performance_dto_1 = require("./dto/performance.dto");
let AnalyticsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Analytics'), (0, common_1.Controller)('analytics')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _recordPerformanceMetrics_decorators;
    let _getPerformanceSummary_decorators;
    let _healthCheck_decorators;
    var AnalyticsController = _classThis = class {
        constructor(realtimeAnalyticsService) {
            this.realtimeAnalyticsService = (__runInitializers(this, _instanceExtraInitializers), realtimeAnalyticsService);
            this.logger = new common_1.Logger(AnalyticsController.name);
        }
        async recordPerformanceMetrics(metrics) {
            try {
                this.logger.log(`Recording performance metrics: ${JSON.stringify(metrics)}`);
                // Process the metrics - for now we'll just log them
                // In a real implementation, you would:
                // 1. Validate the metrics
                // 2. Store them in a database or analytics service
                // 3. Trigger any real-time processing
                if (this.realtimeAnalyticsService) {
                    // If realtime analytics service is available, use it
                    // await this.realtimeAnalyticsService.processPerformanceMetrics(metrics);
                }
                // Log key performance indicators
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
                // In a real implementation, this would aggregate stored metrics
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
    __setFunctionName(_classThis, "AnalyticsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _recordPerformanceMetrics_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('performance'), (0, swagger_1.ApiOperation)({
                summary: 'Record performance metrics from frontend application',
                description: 'Accepts performance metrics data from the frontend and stores it for analysis'
            }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: 'Performance metrics recorded successfully',
                type: performance_dto_1.PerformanceResponseDto
            }), (0, swagger_1.ApiResponse)({
                status: 400,
                description: 'Invalid performance metrics data'
            })];
        _getPerformanceSummary_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Get)('performance/summary'), (0, swagger_1.ApiOperation)({
                summary: 'Get performance analytics summary',
                description: 'Returns aggregated performance metrics and insights'
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Performance summary retrieved successfully'
            })];
        _healthCheck_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('health'), (0, swagger_1.ApiOperation)({ summary: 'Analytics service health check' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics service is healthy' })];
        __esDecorate(_classThis, null, _recordPerformanceMetrics_decorators, { kind: "method", name: "recordPerformanceMetrics", static: false, private: false, access: { has: obj => "recordPerformanceMetrics" in obj, get: obj => obj.recordPerformanceMetrics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPerformanceSummary_decorators, { kind: "method", name: "getPerformanceSummary", static: false, private: false, access: { has: obj => "getPerformanceSummary" in obj, get: obj => obj.getPerformanceSummary }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _healthCheck_decorators, { kind: "method", name: "healthCheck", static: false, private: false, access: { has: obj => "healthCheck" in obj, get: obj => obj.healthCheck }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnalyticsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnalyticsController = _classThis;
})();
exports.AnalyticsController = AnalyticsController;
