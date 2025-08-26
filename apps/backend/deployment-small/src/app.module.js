"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
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
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map