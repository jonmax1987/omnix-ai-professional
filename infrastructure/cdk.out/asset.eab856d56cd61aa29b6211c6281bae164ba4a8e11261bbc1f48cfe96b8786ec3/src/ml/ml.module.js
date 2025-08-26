"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlModule = void 0;
const common_1 = require("@nestjs/common");
const ml_service_1 = require("./ml.service");
const recommendation_engine_service_1 = require("./recommendation-engine.service");
const product_similarity_service_1 = require("./product-similarity.service");
const dynamodb_service_1 = require("../services/dynamodb.service");
const customers_module_1 = require("../customers/customers.module");
const products_module_1 = require("../products/products.module");
let MlModule = class MlModule {
};
exports.MlModule = MlModule;
exports.MlModule = MlModule = __decorate([
    (0, common_1.Module)({
        imports: [customers_module_1.CustomersModule, products_module_1.ProductsModule],
        providers: [
            ml_service_1.MlService,
            recommendation_engine_service_1.RecommendationEngineService,
            product_similarity_service_1.ProductSimilarityService,
            dynamodb_service_1.DynamoDBService,
        ],
        exports: [ml_service_1.MlService, recommendation_engine_service_1.RecommendationEngineService, product_similarity_service_1.ProductSimilarityService],
    })
], MlModule);
//# sourceMappingURL=ml.module.js.map