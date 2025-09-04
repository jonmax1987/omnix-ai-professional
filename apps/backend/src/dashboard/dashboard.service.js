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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
let DashboardService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DashboardService = _classThis = class {
        constructor(productsService, webSocketService) {
            this.productsService = productsService;
            this.webSocketService = webSocketService;
        }
        async getSummary(query) {
            const totalInventoryValue = await this.productsService.getTotalInventoryValue();
            const totalItems = await this.productsService.getTotalItemCount();
            const lowStockProducts = await this.productsService.findLowStockProducts();
            const categoryBreakdown = await this.productsService.getCategoryBreakdown();
            const lowStockItems = lowStockProducts.filter(p => p.quantity > 0).length;
            const outOfStockItems = lowStockProducts.filter(p => p.quantity === 0).length;
            // Mock expired items calculation
            const expiredItems = 1;
            // Calculate active alerts
            const activeAlerts = lowStockItems + outOfStockItems + expiredItems;
            // Calculate top categories by percentage
            const topCategories = categoryBreakdown
                .map(cat => ({
                category: cat.category,
                percentage: Math.round((cat.value / totalInventoryValue) * 100 * 100) / 100
            }))
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 5);
            const summary = {
                totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
                totalItems,
                lowStockItems,
                outOfStockItems,
                expiredItems,
                activeAlerts,
                categoryBreakdown,
                topCategories,
            };
            // Emit WebSocket event for dashboard update
            this.webSocketService.emitDashboardUpdate(summary);
            return summary;
        }
        async getInventoryGraphData(query) {
            const dataPoints = this.generateMockTimeSeriesData(query.timeRange, query.granularity, query.category);
            return {
                timeRange: query.timeRange,
                granularity: query.granularity,
                dataPoints,
            };
        }
        generateMockTimeSeriesData(timeRange, granularity, category) {
            const now = new Date();
            const dataPoints = [];
            let pointCount = 7;
            let intervalDays = 1;
            // Generate mock data points
            for (let i = pointCount - 1; i >= 0; i--) {
                const timestamp = new Date(now.getTime() - (i * intervalDays * 24 * 60 * 60 * 1000));
                const inventoryValue = Math.round((15000 + (Math.random() - 0.5) * 2000) * 100) / 100;
                const itemCount = Math.round(1200 + (Math.random() - 0.5) * 200);
                const categories = [
                    { category: 'Beverages', value: inventoryValue * 0.4, count: Math.round(itemCount * 0.3) },
                    { category: 'Baking', value: inventoryValue * 0.3, count: Math.round(itemCount * 0.25) },
                    { category: 'Snacks', value: inventoryValue * 0.2, count: Math.round(itemCount * 0.3) },
                    { category: 'Dairy', value: inventoryValue * 0.1, count: Math.round(itemCount * 0.15) },
                ];
                dataPoints.push({
                    timestamp: timestamp.toISOString(),
                    inventoryValue,
                    itemCount,
                    categories: category ? categories.filter(c => c.category === category) : categories,
                });
            }
            return dataPoints;
        }
    };
    __setFunctionName(_classThis, "DashboardService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DashboardService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DashboardService = _classThis;
})();
exports.DashboardService = DashboardService;
