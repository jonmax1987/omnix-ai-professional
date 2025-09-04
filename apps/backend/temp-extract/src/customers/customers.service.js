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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const dynamodb_service_1 = require("../services/dynamodb.service");
const uuid_1 = require("uuid");
let CustomersService = class CustomersService {
    constructor(dynamoDBService) {
        this.dynamoDBService = dynamoDBService;
        this.profilesTable = 'customer-profiles';
        this.purchaseHistoryTable = 'purchase-history';
        this.productInteractionsTable = 'product-interactions';
    }
    async createCustomerProfile(createDto) {
        const customerId = createDto.customerId || (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const profile = {
            customerId,
            demographics: createDto.demographics || {},
            preferences: createDto.preferences || {
                dietaryRestrictions: [],
                favoriteCategories: [],
                budgetRange: { min: 0, max: 10000 },
                brandPreferences: [],
            },
            shoppingPatterns: createDto.shoppingPatterns || {
                preferredShoppingTimes: [],
                averageOrderValue: 0,
                shoppingFrequency: 'weekly',
                seasonalPatterns: {},
            },
            createdAt: now,
            updatedAt: now,
        };
        await this.dynamoDBService.put(this.profilesTable, profile);
        return profile;
    }
    async getCustomerProfile(customerId) {
        const result = await this.dynamoDBService.get(this.profilesTable, { customerId });
        if (!result) {
            throw new common_1.NotFoundException(`Customer profile not found for ID: ${customerId}`);
        }
        return result;
    }
    async updateCustomerProfile(customerId, updateDto) {
        const existingProfile = await this.getCustomerProfile(customerId);
        const updatedProfile = {
            ...existingProfile,
            ...updateDto,
            customerId,
            updatedAt: new Date().toISOString(),
        };
        if (updateDto.demographics) {
            updatedProfile.demographics = {
                ...existingProfile.demographics,
                ...updateDto.demographics,
            };
        }
        if (updateDto.preferences) {
            updatedProfile.preferences = {
                ...existingProfile.preferences,
                ...updateDto.preferences,
            };
        }
        if (updateDto.shoppingPatterns) {
            updatedProfile.shoppingPatterns = {
                ...existingProfile.shoppingPatterns,
                ...updateDto.shoppingPatterns,
            };
        }
        await this.dynamoDBService.put(this.profilesTable, updatedProfile);
        return updatedProfile;
    }
    async updateCustomerPreferences(customerId, preferences) {
        const profile = await this.getCustomerProfile(customerId);
        profile.preferences = {
            ...profile.preferences,
            ...preferences,
        };
        profile.updatedAt = new Date().toISOString();
        await this.dynamoDBService.put(this.profilesTable, profile);
        return profile;
    }
    async addPurchaseHistory(customerId, purchaseDto) {
        const purchaseId = (0, uuid_1.v4)();
        const purchaseDate = new Date().toISOString();
        const purchaseHistory = {
            id: purchaseId,
            customerId,
            productId: purchaseDto.productId,
            quantity: purchaseDto.quantity,
            unitPrice: purchaseDto.unitPrice,
            totalPrice: purchaseDto.totalPrice || purchaseDto.quantity * purchaseDto.unitPrice,
            purchaseDate,
            storeLocation: purchaseDto.storeLocation,
            promotionUsed: purchaseDto.promotionUsed || false,
            rating: purchaseDto.rating,
            review: purchaseDto.review,
        };
        await this.dynamoDBService.put(this.purchaseHistoryTable, purchaseHistory);
        await this.updateShoppingPatterns(customerId, purchaseHistory.totalPrice);
        return purchaseHistory;
    }
    async getCustomerPurchases(customerId, limit = 50) {
        const result = await this.dynamoDBService.query(this.purchaseHistoryTable, 'customerId-purchaseDate-index', 'customerId = :customerId', { ':customerId': customerId });
        return (result || []).slice(0, limit);
    }
    async trackProductInteraction(customerId, interactionDto) {
        const interactionId = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        const interaction = {
            id: interactionId,
            customerId,
            productId: interactionDto.productId,
            interactionType: interactionDto.interactionType,
            timestamp,
            sessionId: interactionDto.sessionId,
            metadata: interactionDto.metadata || {},
        };
        await this.dynamoDBService.put(this.productInteractionsTable, interaction);
        return interaction;
    }
    async getCustomerInteractions(customerId, limit = 100) {
        const result = await this.dynamoDBService.query(this.productInteractionsTable, 'customerId-timestamp-index', 'customerId = :customerId', { ':customerId': customerId });
        return (result || []).slice(0, limit);
    }
    async getProductInteractions(productId, limit = 100) {
        const result = await this.dynamoDBService.query(this.productInteractionsTable, 'productId-timestamp-index', 'productId = :productId', { ':productId': productId });
        return (result || []).slice(0, limit);
    }
    async importPurchaseHistory(customerId, purchases) {
        let imported = 0;
        let failed = 0;
        for (const purchase of purchases) {
            try {
                await this.addPurchaseHistory(customerId, purchase);
                imported++;
            }
            catch (error) {
                console.error(`Failed to import purchase:`, error);
                failed++;
            }
        }
        return { imported, failed };
    }
    async updateShoppingPatterns(customerId, orderValue) {
        try {
            const profile = await this.getCustomerProfile(customerId);
            const purchases = await this.getCustomerPurchases(customerId, 100);
            const totalValue = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
            const averageOrderValue = purchases.length > 0 ? totalValue / purchases.length : orderValue;
            const frequency = this.calculateShoppingFrequency(purchases);
            profile.shoppingPatterns.averageOrderValue = averageOrderValue;
            profile.shoppingPatterns.shoppingFrequency = frequency;
            profile.updatedAt = new Date().toISOString();
            await this.dynamoDBService.put(this.profilesTable, profile);
        }
        catch (error) {
            console.error('Error updating shopping patterns:', error);
        }
    }
    calculateShoppingFrequency(purchases) {
        if (purchases.length < 2)
            return 'monthly';
        const dates = purchases
            .map(p => new Date(p.purchaseDate).getTime())
            .sort((a, b) => a - b);
        const intervals = [];
        for (let i = 1; i < dates.length; i++) {
            intervals.push(dates[i] - dates[i - 1]);
        }
        const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
        const avgDays = avgInterval / (1000 * 60 * 60 * 24);
        if (avgDays <= 3)
            return 'daily';
        if (avgDays <= 7)
            return 'weekly';
        if (avgDays <= 14)
            return 'biweekly';
        if (avgDays <= 30)
            return 'monthly';
        return 'occasional';
    }
    async getCustomersBySegment(segment) {
        const result = await this.dynamoDBService.scan(this.profilesTable, {
            FilterExpression: 'shoppingPatterns.shoppingFrequency = :segment',
            ExpressionAttributeValues: {
                ':segment': segment,
            },
        });
        return (result || []);
    }
    async getAllCustomers(limit = 100) {
        const result = await this.dynamoDBService.scan(this.profilesTable, {
            Limit: limit,
        });
        return (result || []).slice(0, limit);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dynamodb_service_1.DynamoDBService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map