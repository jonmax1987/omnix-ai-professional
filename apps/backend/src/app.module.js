"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const database_module_1 = require("./services/database.module");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const alerts_module_1 = require("./alerts/alerts.module");
const recommendations_module_1 = require("./recommendations/recommendations.module");
const forecasts_module_1 = require("./forecasts/forecasts.module");
const inventory_module_1 = require("./inventory/inventory.module");
const system_module_1 = require("./system/system.module");
const orders_module_1 = require("./orders/orders.module");
const websocket_module_1 = require("./websocket/websocket.module");
const customers_module_1 = require("./customers/customers.module");
const streaming_module_1 = require("./streaming/streaming.module");
const ai_insights_module_1 = require("./ai/ai-insights.module");
const analytics_module_1 = require("./analytics/analytics.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
let AppModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                database_module_1.DatabaseModule,
                auth_module_1.AuthModule,
                products_module_1.ProductsModule,
                dashboard_module_1.DashboardModule,
                alerts_module_1.AlertsModule,
                recommendations_module_1.RecommendationsModule,
                forecasts_module_1.ForecastsModule,
                inventory_module_1.InventoryModule,
                system_module_1.SystemModule,
                orders_module_1.OrdersModule,
                websocket_module_1.WebSocketModule,
                customers_module_1.CustomersModule,
                streaming_module_1.StreamingModule,
                ai_insights_module_1.AIInsightsModule,
                analytics_module_1.AnalyticsModule,
            ],
            providers: [
                {
                    provide: core_1.APP_GUARD,
                    useClass: jwt_auth_guard_1.JwtAuthGuard,
                },
            ],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppModule = _classThis = class {
    };
    __setFunctionName(_classThis, "AppModule");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
})();
exports.AppModule = AppModule;
