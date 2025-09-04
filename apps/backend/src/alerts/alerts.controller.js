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
exports.AlertsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let AlertsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Alerts'), (0, swagger_1.ApiSecurity)('ApiKeyAuth'), (0, swagger_1.ApiSecurity)('BearerAuth'), (0, common_1.Controller)('alerts')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getAlerts_decorators;
    let _dismissAlert_decorators;
    var AlertsController = _classThis = class {
        constructor(alertsService) {
            this.alertsService = (__runInitializers(this, _instanceExtraInitializers), alertsService);
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
    __setFunctionName(_classThis, "AlertsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getAlerts_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({
                summary: 'Get alerts',
                description: 'Retrieve current alerts including low stock, expired items, and urgent notifications',
            }), (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['low-stock', 'out-of-stock', 'expired', 'forecast-warning', 'system'] }), (0, swagger_1.ApiQuery)({ name: 'severity', required: false, enum: ['high', 'medium', 'low'] }), (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: 'number', example: 50 }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Alerts retrieved successfully' })];
        _dismissAlert_decorators = [(0, common_1.Post)(':alertId/dismiss'), (0, swagger_1.ApiOperation)({
                summary: 'Dismiss an alert',
                description: 'Mark an alert as dismissed',
            }), (0, swagger_1.ApiParam)({ name: 'alertId', description: 'Alert ID to dismiss' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Alert dismissed successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Alert not found' })];
        __esDecorate(_classThis, null, _getAlerts_decorators, { kind: "method", name: "getAlerts", static: false, private: false, access: { has: obj => "getAlerts" in obj, get: obj => obj.getAlerts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _dismissAlert_decorators, { kind: "method", name: "dismissAlert", static: false, private: false, access: { has: obj => "dismissAlert" in obj, get: obj => obj.dismissAlert }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AlertsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AlertsController = _classThis;
})();
exports.AlertsController = AlertsController;
