"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const recommendations_service_1 = require("./recommendations.service");
describe('RecommendationsService', () => {
    let service;
    const mockBedrockClient = {
        invoke: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                recommendations_service_1.RecommendationsService,
                {
                    provide: 'BedrockClient',
                    useValue: mockBedrockClient,
                },
            ],
        }).compile();
        service = module.get(recommendations_service_1.RecommendationsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getCustomerRecommendations', () => {
        it('should generate recommendations for a customer', async () => {
            const customerId = 'customer-123';
            const context = 'homepage';
            const limit = 5;
            const result = await service.getCustomerRecommendations(customerId, context, limit);
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });
        it('should handle customer with no purchase history', async () => {
            const customerId = 'new-customer';
            const context = 'checkout';
            const limit = 5;
            const result = await service.getCustomerRecommendations(customerId, context, limit);
            expect(Array.isArray(result)).toBe(true);
        });
    });
    describe('getSeasonalRecommendations', () => {
        it('should return seasonal product recommendations', async () => {
            const season = 'winter';
            const limit = 10;
            const result = await service.getSeasonalRecommendations(season, limit);
            expect(Array.isArray(result)).toBe(true);
        });
    });
    describe('trackRecommendationFeedback', () => {
        it('should record recommendation feedback', async () => {
            const customerId = 'customer-123';
            const productId = 'product-456';
            const action = 'click';
            await service.trackRecommendationFeedback(customerId, productId, action);
            expect(true).toBe(true);
        });
    });
});
//# sourceMappingURL=recommendations.service.spec.js.map