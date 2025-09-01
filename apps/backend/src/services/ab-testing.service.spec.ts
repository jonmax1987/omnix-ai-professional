import { Test, TestingModule } from '@nestjs/testing';
import { ABTestingService } from './ab-testing.service';

describe('ABTestingService', () => {
  let service: ABTestingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ABTestingService],
    }).compile();

    service = module.get<ABTestingService>(ABTestingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createABTest', () => {
    it('should create a new A/B test', async () => {
      const testData = {
        name: 'Claude Model Comparison',
        description: 'Testing Claude 3 Haiku vs Sonnet for customer analysis',
        variants: [
          { name: 'control', modelId: 'claude-3-haiku', traffic: 50 },
          { name: 'treatment', modelId: 'claude-3-sonnet', traffic: 50 }
        ]
      };

      const result = await service.createABTest(testData);
      
      expect(result).toBeDefined();
      expect(result.testId).toMatch(/^test-/);
      expect(result.status).toBe('active');
      expect(result.variants).toHaveLength(2);
    });
  });

  describe('getTestAssignment', () => {
    it('should assign users to test variants consistently', async () => {
      const customerId = 'customer-123';
      const testId = 'test-model-comparison';
      
      const assignment1 = await service.getTestAssignment(customerId, testId);
      const assignment2 = await service.getTestAssignment(customerId, testId);
      
      expect(assignment1.variant).toBe(assignment2.variant);
      expect(['control', 'treatment']).toContain(assignment1.variant);
    });
  });

  describe('recordMetrics', () => {
    it('should record test metrics correctly', async () => {
      const testId = 'test-model-comparison';
      const customerId = 'customer-123';
      const metrics = {
        responseTime: 1200,
        accuracy: 0.92,
        cost: 0.005,
        success: true
      };

      await service.recordMetrics(testId, customerId, metrics);
      
      const testData = await service.getTestResults(testId);
      expect(testData.metrics.totalRecords).toBeGreaterThan(0);
    });
  });
});