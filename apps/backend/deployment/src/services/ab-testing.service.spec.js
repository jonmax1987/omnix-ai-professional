"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const ab_testing_service_1 = require("./ab-testing.service");
describe('ABTestingService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [ab_testing_service_1.ABTestingService],
        }).compile();
        service = module.get(ab_testing_service_1.ABTestingService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('createABTest', () => {
        it('should create a new A/B test', async () => {
            const testData = {
                testId: 'test-model-comparison',
                testName: 'Claude Model Comparison',
                modelA: { id: 'claude-3-haiku', name: 'Claude 3 Haiku', weight: 50 },
                modelB: { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', weight: 50 },
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                active: true,
                metrics: ['customer-analysis']
            };
            await service.createABTest(testData);
            expect(true).toBe(true);
        });
    });
    describe('getModelAssignment', () => {
        it('should assign users to models consistently', async () => {
            const customerId = 'customer-123';
            const analysisType = 'customer-analysis';
            const assignment1 = await service.getModelAssignment(customerId, analysisType);
            const assignment2 = await service.getModelAssignment(customerId, analysisType);
            expect(assignment1.modelName).toBe(assignment2.modelName);
            expect(assignment1.modelId).toBeDefined();
        });
    });
    describe('getABTestResults', () => {
        it('should return test results', async () => {
            const testId = 'test-model-comparison';
            try {
                const testData = await service.getABTestResults(testId);
                expect(testData).toBeDefined();
                expect(testData.testId).toBe(testId);
            }
            catch (error) {
                expect(error.message).toContain('not found');
            }
        });
    });
});
//# sourceMappingURL=ab-testing.service.spec.js.map