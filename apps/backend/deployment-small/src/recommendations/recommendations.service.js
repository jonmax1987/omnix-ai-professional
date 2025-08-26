"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
let RecommendationsService = class RecommendationsService {
    constructor() {
        this.mockRecommendations = [
            {
                id: 'rec_1',
                type: 'reorder',
                priority: 'high',
                productId: '1',
                productName: 'Premium Coffee Beans',
                productSku: 'COF-001',
                title: 'Urgent Reorder Required',
                description: 'Stock levels are critically low and demand is increasing. Historical data shows this product sells 50-60 units per week.',
                impact: 'High risk of stockout',
                action: 'Order 150 units immediately to maintain service levels',
                estimatedSavings: 2400,
                daysUntilAction: 3,
                confidence: 0.92,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'rec_2',
                type: 'optimize',
                priority: 'medium',
                productId: '2',
                productName: 'Organic Flour 25lb',
                productSku: 'FLR-025',
                title: 'Optimize Order Quantity',
                description: 'Current ordering pattern results in excess inventory. Adjust order quantity to reduce carrying costs while maintaining service levels.',
                impact: 'Reduce carrying costs by 15%',
                action: 'Reduce next order from 100 to 75 units',
                estimatedSavings: 450,
                daysUntilAction: 7,
                confidence: 0.78,
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'rec_3',
                type: 'promotion',
                priority: 'low',
                productId: '3',
                productName: 'Artisan Chocolate',
                productSku: 'CHC-001',
                title: 'Promotional Opportunity',
                description: 'Slow-moving inventory with seasonal demand pattern. Consider promotional pricing to increase velocity.',
                impact: 'Clear excess inventory',
                action: 'Apply 20% discount for next 2 weeks',
                estimatedSavings: 150,
                daysUntilAction: 14,
                confidence: 0.65,
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'rec_4',
                type: 'reorder',
                priority: 'medium',
                productId: '4',
                productName: 'Gourmet Tea Bags',
                productSku: 'TEA-050',
                title: 'Schedule Reorder',
                description: 'Stock levels approaching reorder point. Based on current consumption rate, order should be placed within the next week.',
                impact: 'Maintain optimal stock',
                action: 'Place order for 80 units by August 18th',
                estimatedSavings: 300,
                daysUntilAction: 8,
                confidence: 0.84,
                createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'rec_5',
                type: 'discontinue',
                priority: 'low',
                productId: '5',
                productName: 'Specialty Spice Mix',
                productSku: 'SPI-012',
                title: 'Consider Discontinuation',
                description: 'Very low sales velocity over the past 6 months. Product ties up valuable inventory space and capital.',
                impact: 'Free up inventory space',
                action: 'Discontinue after current stock is depleted',
                daysUntilAction: 30,
                confidence: 0.71,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            },
        ];
    }
    async getRecommendations(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        let filteredRecommendations = [...this.mockRecommendations];
        if (query.type) {
            filteredRecommendations = filteredRecommendations.filter(r => r.type === query.type);
        }
        if (query.priority) {
            filteredRecommendations = filteredRecommendations.filter(r => r.priority === query.priority);
        }
        const total = filteredRecommendations.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const data = filteredRecommendations.slice(startIndex, endIndex);
        const highPriority = filteredRecommendations.filter(r => r.priority === 'high').length;
        const mediumPriority = filteredRecommendations.filter(r => r.priority === 'medium').length;
        const lowPriority = filteredRecommendations.filter(r => r.priority === 'low').length;
        const totalSavings = filteredRecommendations.reduce((sum, r) => sum + (r.estimatedSavings || 0), 0);
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
                highPriority,
                mediumPriority,
                lowPriority,
                totalSavings,
            },
        };
    }
    async acceptRecommendation(recommendationId) {
        const recommendation = this.mockRecommendations.find(r => r.id === recommendationId);
        if (!recommendation) {
            throw new Error('Recommendation not found');
        }
        const index = this.mockRecommendations.findIndex(r => r.id === recommendationId);
        if (index > -1) {
            this.mockRecommendations.splice(index, 1);
        }
        return {
            message: 'Recommendation accepted successfully',
            recommendationId,
            action: recommendation.action,
        };
    }
    async dismissRecommendation(recommendationId) {
        const recommendation = this.mockRecommendations.find(r => r.id === recommendationId);
        if (!recommendation) {
            throw new Error('Recommendation not found');
        }
        const index = this.mockRecommendations.findIndex(r => r.id === recommendationId);
        if (index > -1) {
            this.mockRecommendations.splice(index, 1);
        }
        return {
            message: 'Recommendation dismissed',
            recommendationId,
        };
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)()
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map