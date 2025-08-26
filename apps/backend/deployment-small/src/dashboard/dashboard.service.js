"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("../products/products.service");
let DashboardService = class DashboardService {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getSummary(query) {
        const totalInventoryValue = await this.productsService.getTotalInventoryValue();
        const totalItems = await this.productsService.getTotalItemCount();
        const lowStockProducts = await this.productsService.findLowStockProducts();
        const categoryBreakdown = await this.productsService.getCategoryBreakdown();
        const lowStockItems = lowStockProducts.filter(p => p.quantity > 0).length;
        const outOfStockItems = lowStockProducts.filter(p => p.quantity === 0).length;
        const expiredItems = 1;
        const activeAlerts = lowStockItems + outOfStockItems + expiredItems;
        const topCategories = categoryBreakdown
            .map(cat => ({
            category: cat.category,
            percentage: Math.round((cat.value / totalInventoryValue) * 100 * 100) / 100
        }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5);
        return {
            totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
            totalItems,
            lowStockItems,
            outOfStockItems,
            expiredItems,
            activeAlerts,
            categoryBreakdown,
            topCategories,
        };
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
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map