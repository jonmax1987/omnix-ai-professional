"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABTestingController = exports.ABTestResultsDto = exports.CreateABTestDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
class CreateABTestDto {
}
exports.CreateABTestDto = CreateABTestDto;
class ABTestResultsDto {
}
exports.ABTestResultsDto = ABTestResultsDto;
let ABTestingController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('A/B Testing'), (0, common_1.Controller)('ab-tests')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createABTest_decorators;
    let _listABTests_decorators;
    let _getABTestResults_decorators;
    let _deactivateABTest_decorators;
    let _getABTestStatus_decorators;
    let _createQuickTest_decorators;
    let _getAvailableModels_decorators;
    var ABTestingController = _classThis = class {
        constructor(enhancedBedrockService, abTestingService) {
            this.enhancedBedrockService = (__runInitializers(this, _instanceExtraInitializers), enhancedBedrockService);
            this.abTestingService = abTestingService;
        }
        async createABTest(createTestDto) {
            console.log(`📊 Creating A/B test: ${createTestDto.testName}`);
            // Validate test configuration
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
            // Filter raw data if not requested
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
        /**
         * Validate A/B test configuration
         */
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
        /**
         * Generate summary of A/B test results
         */
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
            // Add key findings
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
        /**
         * Calculate test duration in human-readable format
         */
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
    __setFunctionName(_classThis, "ABTestingController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createABTest_decorators = [(0, common_1.Post)(), (0, swagger_1.ApiOperation)({
                summary: 'Create new A/B test',
                description: 'Create a new A/B test to compare different Bedrock models (Haiku vs Sonnet)'
            }), (0, swagger_1.ApiBody)({ type: CreateABTestDto }), (0, swagger_1.ApiResponse)({ status: 201, description: 'A/B test created successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid test configuration' })];
        _listABTests_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({
                summary: 'List all A/B tests',
                description: 'Get list of all A/B tests with their current status'
            }), (0, swagger_1.ApiResponse)({ status: 200, description: 'List of A/B tests retrieved successfully' })];
        _getABTestResults_decorators = [(0, common_1.Get)(':testId/results'), (0, swagger_1.ApiOperation)({
                summary: 'Get A/B test results',
                description: 'Retrieve detailed results and performance comparison for an A/B test'
            }), (0, swagger_1.ApiParam)({ name: 'testId', description: 'A/B test identifier' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'A/B test results retrieved successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'A/B test not found' })];
        _deactivateABTest_decorators = [(0, common_1.Put)(':testId/deactivate'), (0, swagger_1.ApiOperation)({
                summary: 'Deactivate A/B test',
                description: 'Stop an active A/B test and prevent new assignments'
            }), (0, swagger_1.ApiParam)({ name: 'testId', description: 'A/B test identifier' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'A/B test deactivated successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'A/B test not found' })];
        _getABTestStatus_decorators = [(0, common_1.Get)(':testId/status'), (0, swagger_1.ApiOperation)({
                summary: 'Get A/B test status',
                description: 'Get current status and basic metrics for an A/B test'
            }), (0, swagger_1.ApiParam)({ name: 'testId', description: 'A/B test identifier' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'A/B test status retrieved successfully' })];
        _createQuickTest_decorators = [(0, common_1.Post)('quick-test'), (0, swagger_1.ApiOperation)({
                summary: 'Create quick Haiku vs Sonnet test',
                description: 'Create a standard 7-day A/B test comparing Claude 3 Haiku vs Sonnet models'
            }), (0, swagger_1.ApiBody)({
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
            }), (0, swagger_1.ApiResponse)({ status: 201, description: 'Quick A/B test created successfully' })];
        _getAvailableModels_decorators = [(0, common_1.Get)('models/available'), (0, swagger_1.ApiOperation)({
                summary: 'List available models',
                description: 'Get list of available Bedrock models for A/B testing'
            }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Available models retrieved successfully' })];
        __esDecorate(_classThis, null, _createABTest_decorators, { kind: "method", name: "createABTest", static: false, private: false, access: { has: obj => "createABTest" in obj, get: obj => obj.createABTest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listABTests_decorators, { kind: "method", name: "listABTests", static: false, private: false, access: { has: obj => "listABTests" in obj, get: obj => obj.listABTests }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getABTestResults_decorators, { kind: "method", name: "getABTestResults", static: false, private: false, access: { has: obj => "getABTestResults" in obj, get: obj => obj.getABTestResults }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deactivateABTest_decorators, { kind: "method", name: "deactivateABTest", static: false, private: false, access: { has: obj => "deactivateABTest" in obj, get: obj => obj.deactivateABTest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getABTestStatus_decorators, { kind: "method", name: "getABTestStatus", static: false, private: false, access: { has: obj => "getABTestStatus" in obj, get: obj => obj.getABTestStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createQuickTest_decorators, { kind: "method", name: "createQuickTest", static: false, private: false, access: { has: obj => "createQuickTest" in obj, get: obj => obj.createQuickTest }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAvailableModels_decorators, { kind: "method", name: "getAvailableModels", static: false, private: false, access: { has: obj => "getAvailableModels" in obj, get: obj => obj.getAvailableModels }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ABTestingController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ABTestingController = _classThis;
})();
exports.ABTestingController = ABTestingController;
