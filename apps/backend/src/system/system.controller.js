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
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const system_dto_1 = require("../common/dto/system.dto");
let SystemController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('System Monitoring'), (0, common_1.Controller)('system')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getHealthCheck_decorators;
    let _getSystemStatus_decorators;
    let _getSystemMetrics_decorators;
    var SystemController = _classThis = class {
        constructor(systemService) {
            this.systemService = (__runInitializers(this, _instanceExtraInitializers), systemService);
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
    __setFunctionName(_classThis, "SystemController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getHealthCheck_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('health'), (0, swagger_1.ApiOperation)({ summary: 'System health check endpoint' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'System health status',
                type: system_dto_1.HealthCheck
            })];
        _getSystemStatus_decorators = [(0, common_1.Get)('status'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Detailed system status and service information' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'System status retrieved successfully',
                type: system_dto_1.SystemStatus
            })];
        _getSystemMetrics_decorators = [(0, common_1.Get)('metrics'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Comprehensive system metrics and performance data' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'System metrics retrieved successfully',
                type: system_dto_1.SystemMetrics
            })];
        __esDecorate(_classThis, null, _getHealthCheck_decorators, { kind: "method", name: "getHealthCheck", static: false, private: false, access: { has: obj => "getHealthCheck" in obj, get: obj => obj.getHealthCheck }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSystemStatus_decorators, { kind: "method", name: "getSystemStatus", static: false, private: false, access: { has: obj => "getSystemStatus" in obj, get: obj => obj.getSystemStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSystemMetrics_decorators, { kind: "method", name: "getSystemMetrics", static: false, private: false, access: { has: obj => "getSystemMetrics" in obj, get: obj => obj.getSystemMetrics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SystemController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SystemController = _classThis;
})();
exports.SystemController = SystemController;
