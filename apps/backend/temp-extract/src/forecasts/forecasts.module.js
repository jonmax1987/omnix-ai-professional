"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastsModule = void 0;
const common_1 = require("@nestjs/common");
const forecasts_controller_1 = require("./forecasts.controller");
const forecasts_service_1 = require("./forecasts.service");
const products_module_1 = require("../products/products.module");
let ForecastsModule = class ForecastsModule {
};
exports.ForecastsModule = ForecastsModule;
exports.ForecastsModule = ForecastsModule = __decorate([
    (0, common_1.Module)({
        imports: [products_module_1.ProductsModule],
        controllers: [forecasts_controller_1.ForecastsController],
        providers: [forecasts_service_1.ForecastsService],
        exports: [forecasts_service_1.ForecastsService],
    })
], ForecastsModule);
//# sourceMappingURL=forecasts.module.js.map