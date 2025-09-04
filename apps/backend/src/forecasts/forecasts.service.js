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
exports.ForecastsService = void 0;
const common_1 = require("@nestjs/common");
let ForecastsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ForecastsService = _classThis = class {
        generateForecastData(days = 30) {
            const data = [];
            const today = new Date();
            for (let i = 0; i < days; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);
                // Generate realistic forecast data with some variation
                const baseValue = 50 + Math.sin(i * 0.2) * 20;
                const seasonality = Math.sin(i * 0.7) * 10;
                const randomVariation = (Math.random() - 0.5) * 10;
                data.push({
                    date: date.toISOString().split('T')[0],
                    predicted: Math.max(0, Math.round(baseValue + seasonality + randomVariation)),
                    actual: i < 7 ? Math.max(0, Math.round(baseValue + seasonality + (Math.random() - 0.5) * 15)) : undefined,
                    confidence: Math.min(100, Math.max(60, 85 + (Math.random() - 0.5) * 20)) / 100,
                });
            }
            return data;
        }
        async getMetrics() {
            return {
                totalForecasts: 12,
                averageAccuracy: 87.3,
                upcomingReorders: 5,
                potentialSavings: 12450,
                criticalItems: 3,
            };
        }
        async getForecasts(query = {}) {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 5;
            const days = parseInt(query.days) || 30;
            // Mock forecast data for different products
            const mockForecasts = [
                {
                    productId: '1',
                    productName: 'Premium Coffee Beans',
                    productSku: 'COF-001',
                    forecastDays: days,
                    data: this.generateForecastData(days),
                    trend: 'increasing',
                    seasonality: 'high',
                    accuracy: 89.2,
                    nextOrderDate: '2025-08-20',
                    recommendedQuantity: 150,
                },
                {
                    productId: '2',
                    productName: 'Organic Flour 25lb',
                    productSku: 'FLR-025',
                    forecastDays: days,
                    data: this.generateForecastData(days),
                    trend: 'stable',
                    seasonality: 'low',
                    accuracy: 92.5,
                    nextOrderDate: '2025-08-25',
                    recommendedQuantity: 75,
                },
                {
                    productId: '3',
                    productName: 'Artisan Chocolate',
                    productSku: 'CHC-001',
                    forecastDays: days,
                    data: this.generateForecastData(days),
                    trend: 'decreasing',
                    seasonality: 'medium',
                    accuracy: 78.3,
                    nextOrderDate: '2025-09-01',
                    recommendedQuantity: 25,
                },
            ];
            // Apply filters
            let filteredForecasts = mockForecasts;
            if (query.trend) {
                filteredForecasts = filteredForecasts.filter(f => f.trend === query.trend);
            }
            const total = filteredForecasts.length;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const data = filteredForecasts.slice(startIndex, endIndex);
            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: endIndex < total,
                    hasPrev: page > 1,
                },
                meta: {
                    totalForecasts: total,
                    averageAccuracy: 86.7,
                    upcomingReorders: 5,
                    potentialSavings: 12450,
                    criticalItems: 3,
                },
            };
        }
        async getForecast(productId, days = 30) {
            // Mock data for specific product forecast
            return {
                productId,
                productName: 'Premium Coffee Beans',
                productSku: 'COF-001',
                forecastDays: days,
                data: this.generateForecastData(days),
                trend: 'increasing',
                seasonality: 'high',
                accuracy: 89.2,
                nextOrderDate: '2025-08-20',
                recommendedQuantity: 150,
            };
        }
    };
    __setFunctionName(_classThis, "ForecastsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ForecastsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ForecastsService = _classThis;
})();
exports.ForecastsService = ForecastsService;
