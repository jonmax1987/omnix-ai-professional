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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABTestingController = exports.ABTestResultsDto = exports.CreateABTestDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enhanced_bedrock_service_1 = require("../services/enhanced-bedrock.service");
const ab_testing_service_1 = require("../services/ab-testing.service");
class CreateABTestDto {
}
exports.CreateABTestDto = CreateABTestDto;
class ABTestResultsDto {
}
exports.ABTestResultsDto = ABTestResultsDto;
let ABTestingController = class ABTestingController {
    constructor(enhancedBedrockService, abTestingService) {
        this.enhancedBedrockService = enhancedBedrockService;
        this.abTestingService = abTestingService;
    }
    async createABTest(createTestDto) {
        console.log(`📊 Creating A/B test: ${createTestDto.testName}`);
        this.validateTestConfig(createTestDto);
        await this.enhancedBedrockService.createABTest(createTestDto);
        return {
            success: true,
            message: `A/B test '${createTestDto.testName}' created successfully`,
            testId: createTestDto.testId,
        };
    }
    async listABTests() {
        const tests = await this.enhancedBedrockService.listABTests();
        return {
            success: true,
            data: tests,
            totalTests: tests.length,
            activeTests: tests.filter(test => test.active).length,
        };
    }
    async getABTestResults(testId, includeRawData) {
        console.log(`📈 Generating results for A/B test: ${testId}`);
        const results = await this.enhancedBedrockService.getABTestResults(testId);
        if (!includeRawData) {
            delete results.rawMetrics;
        }
        return {
            success: true,
            data: results,
            summary: this.generateResultsSummary(results),
        };
    }
    async deactivateABTest(testId) {
        console.log(`🛑 Deactivating A/B test: ${testId}`);
        await this.enhancedBedrockService.deactivateABTest(testId);
        return {
            success: true,
            message: `A/B test '${testId}' deactivated successfully`,
        };
    }
    async getABTestStatus(testId) {
        const results = await this.enhancedBedrockService.getABTestResults(testId);
        return {
            success: true,
            data: {
                testId: results.testId,
                testName: results.testName,
                status: results.status,
                startDate: results.startDate,
                endDate: results.endDate,
                modelsCompared: [results.modelA.name, results.modelB.name],
                totalRequests: results.modelA.metrics.totalRequests + results.modelB.metrics.totalRequests,
                currentWinner: results.winner,
                significance: results.significance,
            },
        };
    }
    async createQuickTest(quickTestDto) {
        const testId = `quick-test-${Date.now()}`;
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + (quickTestDto.durationDays || 7) * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
        const trafficSplit = quickTestDto.trafficSplit || 50;
        const testConfig = {
            testId,
            testName: quickTestDto.testName,
            modelA: {
                id: 'claude-3-haiku',
                name: 'Claude 3 Haiku',
                weight: trafficSplit,
            },
            modelB: {
                id: 'claude-3-sonnet',
                name: 'Claude 3 Sonnet',
                weight: 100 - trafficSplit,
            },
            startDate,
            endDate,
            metrics: [quickTestDto.analysisType],
        };
        await this.enhancedBedrockService.createABTest(testConfig);
        return {
            success: true,
            message: `Quick A/B test created: ${quickTestDto.testName}`,
            testId,
            config: testConfig,
            estimatedCompletionDate: endDate,
        };
    }
    async getAvailableModels() {
        const availableModels = [
            {
                id: 'claude-3-haiku',
                name: 'Claude 3 Haiku',
                description: 'Fast and cost-effective model for high-volume applications',
                costPer1kTokens: { input: 0.00025, output: 0.00125 },
                avgResponseTime: '800ms',
                recommended: true,
            },
            {
                id: 'claude-3-sonnet',
                name: 'Claude 3 Sonnet',
                description: 'Balanced model with higher accuracy for complex analysis',
                costPer1kTokens: { input: 0.003, output: 0.015 },
                avgResponseTime: '1200ms',
                recommended: false,
            },
            {
                id: 'claude-3-5-sonnet',
                name: 'Claude 3.5 Sonnet',
                description: 'Latest model with enhanced reasoning capabilities',
                costPer1kTokens: { input: 0.003, output: 0.015 },
                avgResponseTime: '1400ms',
                recommended: false,
            },
        ];
        return {
            success: true,
            data: availableModels,
            totalModels: availableModels.length,
        };
    }
    validateTestConfig(config) {
        if (!config.testId || !config.testName) {
            throw new Error('Test ID and name are required');
        }
        if (config.modelA.weight + config.modelB.weight !== 100) {
            throw new Error('Model weights must sum to 100');
        }
        if (new Date(config.startDate) >= new Date(config.endDate)) {
            throw new Error('End date must be after start date');
        }
        if (!config.metrics || config.metrics.length === 0) {
            throw new Error('At least one metric must be specified');
        }
        const validMetrics = ['consumption_prediction', 'customer_profiling', 'recommendation_generation'];
        const invalidMetrics = config.metrics.filter(metric => !validMetrics.includes(metric));
        if (invalidMetrics.length > 0) {
            throw new Error(`Invalid metrics: ${invalidMetrics.join(', ')}`);
        }
    }
    generateResultsSummary(results) {
        const totalRequests = results.modelA.metrics.totalRequests + results.modelB.metrics.totalRequests;
        if (totalRequests === 0) {
            return {
                status: 'No data available',
                recommendation: 'Wait for more test data to be collected',
            };
        }
        const summary = {
            testDuration: this.calculateTestDuration(results.startDate, results.endDate),
            totalRequests,
            winner: results.winner,
            confidence: `${Math.round(results.significance * 100)}%`,
            keyFindings: [],
            recommendation: results.recommendations[0] || 'Continue monitoring test results',
        };
        if (results.winner !== 'tie') {
            const winner = results.winner === 'A' ? results.modelA : results.modelB;
            const loser = results.winner === 'A' ? results.modelB : results.modelA;
            if (winner.metrics.successRate > loser.metrics.successRate + 0.05) {
                summary.keyFindings.push(`${winner.name} has ${Math.round((winner.metrics.successRate - loser.metrics.successRate) * 100)}% higher success rate`);
            }
            if (winner.metrics.averageProcessingTime < loser.metrics.averageProcessingTime * 0.9) {
                summary.keyFindings.push(`${winner.name} is ${Math.round((1 - winner.metrics.averageProcessingTime / loser.metrics.averageProcessingTime) * 100)}% faster`);
            }
            if (winner.metrics.averageTokenCost < loser.metrics.averageTokenCost * 0.9) {
                summary.keyFindings.push(`${winner.name} is ${Math.round((1 - winner.metrics.averageTokenCost / loser.metrics.averageTokenCost) * 100)}% more cost-effective`);
            }
        }
        return summary;
    }
    calculateTestDuration(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1)
            return '1 day';
        if (diffDays < 7)
            return `${diffDays} days`;
        if (diffDays === 7)
            return '1 week';
        if (diffDays < 30)
            return `${Math.ceil(diffDays / 7)} weeks`;
        return `${Math.ceil(diffDays / 30)} months`;
    }
};
exports.ABTestingController = ABTestingController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new A/B test',
        description: 'Create a new A/B test to compare different Bedrock models (Haiku vs Sonnet)'
    }),
    (0, swagger_1.ApiBody)({ type: CreateABTestDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'A/B test created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid test configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateABTestDto]),
    __metadata("design:returntype", Promise)
], ABTestingController.prototype, "createABTest", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List all A/B tests',
        description: 'Get list of all A/B tests with their current status'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of A/B tests retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ABTestingController.prototype, "listABTests", null);
__decorate([
    (0, common_1.Get)(':testId/results'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get A/B test results',
        description: 'Retrieve detailed results and performance comparison for an A/B test'
    }),
    (0, swagger_1.ApiParam)({ name: 'testId', description: 'A/B test identifier' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'A/B test results retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'A/B test not found' }),
    __param(0, (0, common_1.Param)('testId')),
    __param(1, (0, common_1.Query)('includeRawData')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], ABTestingController.prototype, "getABTestResults", null);
__decorate([
    (0, common_1.Put)(':testId/deactivate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate A/B test',
        description: 'Stop an active A/B test and prevent new assignments'
    }),
    (0, swagger_1.ApiParam)({ name: 'testId', description: 'A/B test identifier' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'A/B test deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'A/B test not found' }),
    __param(0, (0, common_1.Param)('testId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ABTestingController.prototype, "deactivateABTest", null);
__decorate([
    (0, common_1.Get)(':testId/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get A/B test status',
        description: 'Get current status and basic metrics for an A/B test'
    }),
    (0, swagger_1.ApiParam)({ name: 'testId', description: 'A/B test identifier' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'A/B test status retrieved successfully' }),
    __param(0, (0, common_1.Param)('testId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ABTestingController.prototype, "getABTestStatus", null);
__decorate([
    (0, common_1.Post)('quick-test'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create quick Haiku vs Sonnet test',
        description: 'Create a standard 7-day A/B test comparing Claude 3 Haiku vs Sonnet models'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                testName: { type: 'string', example: 'Haiku vs Sonnet - Customer Profiling' },
                analysisType: { type: 'string', enum: ['consumption_prediction', 'customer_profiling', 'recommendation_generation'] },
                durationDays: { type: 'number', default: 7, minimum: 1, maximum: 30 },
                trafficSplit: { type: 'number', default: 50, minimum: 10, maximum: 90, description: 'Percentage for Model A (Haiku)' },
            },
            required: ['testName', 'analysisType']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Quick A/B test created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ABTestingController.prototype, "createQuickTest", null);
__decorate([
    (0, common_1.Get)('models/available'),
    (0, swagger_1.ApiOperation)({
        summary: 'List available models',
        description: 'Get list of available Bedrock models for A/B testing'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available models retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ABTestingController.prototype, "getAvailableModels", null);
exports.ABTestingController = ABTestingController = __decorate([
    (0, swagger_1.ApiTags)('A/B Testing'),
    (0, common_1.Controller)('v1/ab-tests'),
    __metadata("design:paramtypes", [enhanced_bedrock_service_1.EnhancedBedrockService,
        ab_testing_service_1.ABTestingService])
], ABTestingController);
//# sourceMappingURL=ab-testing.controller.js.map