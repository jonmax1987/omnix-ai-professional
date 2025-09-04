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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_dto_1 = require("@/common/dto/common.dto");
let DashboardController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Dashboard'), (0, swagger_1.ApiSecurity)('ApiKeyAuth'), (0, swagger_1.ApiSecurity)('BearerAuth'), (0, common_1.Controller)('dashboard')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getSummary_decorators;
    let _getInventoryGraph_decorators;
    var DashboardController = _classThis = class {
        constructor(dashboardService) {
            this.dashboardService = (__runInitializers(this, _instanceExtraInitializers), dashboardService);
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
    __setFunctionName(_classThis, "DashboardController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getSummary_decorators = [(0, common_1.Get)('summary'), (0, swagger_1.ApiOperation)({
                summary: 'Get dashboard summary',
                description: 'Retrieve key metrics for the dashboard including total inventory value, item counts, and category breakdown',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Dashboard summary retrieved successfully',
                type: (common_dto_1.SuccessResponseDto),
            }), (0, swagger_1.ApiResponse)({
                status: 401,
                description: 'Unauthorized - Authentication required',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 500,
                description: 'Internal Server Error',
                type: common_dto_1.ErrorDto,
            })];
        _getInventoryGraph_decorators = [(0, common_1.Get)('inventory-graph'), (0, swagger_1.ApiOperation)({
                summary: 'Get inventory graph data',
                description: 'Retrieve time-series data for inventory value and item counts',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Inventory graph data retrieved successfully',
                type: (common_dto_1.SuccessResponseDto),
            }), (0, swagger_1.ApiResponse)({
                status: 401,
                description: 'Unauthorized - Authentication required',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 500,
                description: 'Internal Server Error',
                type: common_dto_1.ErrorDto,
            })];
        __esDecorate(_classThis, null, _getSummary_decorators, { kind: "method", name: "getSummary", static: false, private: false, access: { has: obj => "getSummary" in obj, get: obj => obj.getSummary }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getInventoryGraph_decorators, { kind: "method", name: "getInventoryGraph", static: false, private: false, access: { has: obj => "getInventoryGraph" in obj, get: obj => obj.getInventoryGraph }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DashboardController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DashboardController = _classThis;
})();
exports.DashboardController = DashboardController;
