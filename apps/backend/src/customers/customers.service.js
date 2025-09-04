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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let CustomersService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CustomersService = _classThis = class {
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
    __setFunctionName(_classThis, "CustomersService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CustomersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CustomersService = _classThis;
})();
exports.CustomersService = CustomersService;
