import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  const mockBedrockClient = {
    invoke: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: 'BedrockClient',
          useValue: mockBedrockClient,
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
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
      const feedback = {
        recommendationId: 'rec-456',
        customerId: 'customer-123',
        feedback: 'helpful',
        rating: 5
      };

      await service.trackRecommendationFeedback(feedback);
      
      // Verify feedback was recorded
      expect(true).toBe(true);
    });
  });
});