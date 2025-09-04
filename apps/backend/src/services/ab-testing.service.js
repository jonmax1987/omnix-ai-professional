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
exports.ABTestingService = void 0;
const common_1 = require("@nestjs/common");
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
let ABTestingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ABTestingService = _classThis = class {
        constructor(dynamoDBService, monitoring) {
            this.dynamoDBService = dynamoDBService;
            this.monitoring = monitoring;
            this.testsTable = 'ab-tests';
            this.metricsTable = 'ab-test-metrics';
            // Available Bedrock models for testing
            this.availableModels = {
                'claude-3-haiku': 'anthropic.claude-3-haiku-20240307-v1:0',
                'claude-3-sonnet': 'anthropic.claude-3-sonnet-20240229-v1:0',
                'claude-3-5-sonnet': 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            };
            this.bedrock = new client_bedrock_runtime_1.BedrockRuntimeClient({
                region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
            });
        }
        /**
         * Create a new A/B test configuration
         */
        async createABTest(config) {
            console.log(`🧪 Creating A/B test: ${config.testName}`);
            await this.dynamoDBService.put(this.testsTable, {
                testId: config.testId,
                testName: config.testName,
                modelA: config.modelA,
                modelB: config.modelB,
                startDate: config.startDate,
                endDate: config.endDate,
                active: config.active,
                metrics: config.metrics,
                createdAt: new Date().toISOString(),
            });
            // Initialize metrics tables for both models
            await this.initializeTestMetrics(config.testId, config.modelA.id);
            await this.initializeTestMetrics(config.testId, config.modelB.id);
            console.log(`✅ A/B test created: ${config.testId}`);
        }
        /**
         * Get model assignment for a customer based on active A/B tests
         */
        async getModelAssignment(customerId, analysisType) {
            // Check for active A/B tests
            const activeTests = await this.getActiveTests(analysisType);
            if (activeTests.length === 0) {
                // No active tests, use default model
                return {
                    modelId: this.availableModels['claude-3-haiku'],
                    modelName: 'claude-3-haiku',
                };
            }
            // Use the first active test (can be extended for multiple concurrent tests)
            const test = activeTests[0];
            const assignment = this.assignCustomerToModel(customerId, test);
            console.log(`🎯 Customer ${customerId} assigned to model ${assignment.modelName} (test: ${test.testId})`);
            return {
                modelId: assignment.modelId,
                modelName: assignment.modelName,
                testId: test.testId,
            };
        }
        /**
         * Invoke Bedrock model with A/B testing support
         */
        async invokeModelWithABTesting(request, prompt) {
            const startTime = Date.now();
            // Get model assignment
            const assignment = await this.getModelAssignment(request.customerId, request.analysisType);
            try {
                // Invoke the assigned model
                const response = await this.invokeBedrockModel(assignment.modelId, prompt);
                const processingTime = Date.now() - startTime;
                // Estimate tokens for cost tracking
                const inputTokens = this.estimateTokens(prompt);
                const outputTokens = this.estimateTokens(response);
                // Record A/B test metrics if this is part of a test
                if (assignment.testId) {
                    await this.recordABTestMetrics(assignment.testId, assignment.modelName, {
                        success: true,
                        processingTime,
                        inputTokens,
                        outputTokens,
                        confidence: this.extractConfidenceFromResponse(response),
                    });
                }
                return {
                    response,
                    modelUsed: assignment.modelName,
                    testId: assignment.testId,
                    processingTime,
                    inputTokens,
                    outputTokens,
                };
            }
            catch (error) {
                const processingTime = Date.now() - startTime;
                // Record failure in A/B test metrics
                if (assignment.testId) {
                    await this.recordABTestMetrics(assignment.testId, assignment.modelName, {
                        success: false,
                        processingTime,
                        inputTokens: 0,
                        outputTokens: 0,
                        confidence: 0,
                    });
                }
                throw error;
            }
        }
        /**
         * Get A/B test results and performance comparison
         */
        async getABTestResults(testId) {
            console.log(`📊 Generating A/B test results for ${testId}`);
            const test = await this.getTestConfig(testId);
            if (!test) {
                throw new Error(`Test ${testId} not found`);
            }
            // Get metrics for both models
            const modelAMetrics = await this.getModelMetrics(testId, test.modelA.id);
            const modelBMetrics = await this.getModelMetrics(testId, test.modelB.id);
            // Calculate statistical significance
            const significance = this.calculateStatisticalSignificance(modelAMetrics, modelBMetrics);
            // Determine winner based on multiple metrics
            const winner = this.determineWinner(modelAMetrics, modelBMetrics);
            return {
                testId,
                testName: test.testName,
                status: this.getTestStatus(test),
                modelA: {
                    name: test.modelA.name,
                    metrics: modelAMetrics,
                },
                modelB: {
                    name: test.modelB.name,
                    metrics: modelBMetrics,
                },
                winner,
                significance,
                recommendations: this.generateRecommendations(modelAMetrics, modelBMetrics, winner),
                startDate: test.startDate,
                endDate: test.endDate,
            };
        }
        /**
         * Assign customer to model based on deterministic hash
         */
        assignCustomerToModel(customerId, test) {
            // Use hash of customerId to ensure consistent assignment
            const hash = this.hashString(customerId + test.testId);
            const threshold = test.modelA.weight / (test.modelA.weight + test.modelB.weight);
            if (hash < threshold) {
                return {
                    modelId: this.availableModels[test.modelA.id] || test.modelA.id,
                    modelName: test.modelA.name,
                };
            }
            else {
                return {
                    modelId: this.availableModels[test.modelB.id] || test.modelB.id,
                    modelName: test.modelB.name,
                };
            }
        }
        /**
         * Hash string to number between 0 and 1
         */
        hashString(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash) / 2147483647; // Normalize to 0-1
        }
        /**
         * Invoke specific Bedrock model
         */
        async invokeBedrockModel(modelId, prompt) {
            const payload = {
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 4000,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            };
            const command = new client_bedrock_runtime_1.InvokeModelCommand({
                modelId,
                body: JSON.stringify(payload),
                contentType: 'application/json',
            });
            const response = await this.bedrock.send(command);
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            return responseBody.content[0].text;
        }
        /**
         * Get active A/B tests for analysis type
         */
        async getActiveTests(analysisType) {
            const currentDate = new Date().toISOString().split('T')[0];
            // Query active tests (simplified - in practice would use DynamoDB query)
            const allTests = await this.dynamoDBService.scan(this.testsTable);
            return allTests.filter((test) => test.active &&
                test.startDate <= currentDate &&
                test.endDate >= currentDate &&
                test.metrics.includes(analysisType));
        }
        /**
         * Initialize metrics tracking for a model in a test
         */
        async initializeTestMetrics(testId, modelId) {
            await this.dynamoDBService.put(this.metricsTable, {
                testId,
                modelId,
                totalRequests: 0,
                successfulRequests: 0,
                totalProcessingTime: 0,
                totalConfidence: 0,
                totalInputTokens: 0,
                totalOutputTokens: 0,
                createdAt: new Date().toISOString(),
            });
        }
        /**
         * Record A/B test metrics for a model
         */
        async recordABTestMetrics(testId, modelId, metrics) {
            try {
                // Update metrics atomically
                // Get current metrics
                const currentMetrics = await this.dynamoDBService.get(this.metricsTable, { testId, modelId }) || {
                    totalRequests: 0,
                    successfulRequests: 0,
                    totalProcessingTime: 0,
                    totalConfidence: 0,
                    totalInputTokens: 0,
                    totalOutputTokens: 0,
                };
                // Update with new values
                const updates = {
                    totalRequests: currentMetrics.totalRequests + 1,
                    successfulRequests: currentMetrics.successfulRequests + (metrics.success ? 1 : 0),
                    totalProcessingTime: currentMetrics.totalProcessingTime + metrics.processingTime,
                    totalConfidence: currentMetrics.totalConfidence + metrics.confidence,
                    totalInputTokens: currentMetrics.totalInputTokens + metrics.inputTokens,
                    totalOutputTokens: currentMetrics.totalOutputTokens + metrics.outputTokens,
                    lastUpdated: new Date().toISOString(),
                };
                await this.dynamoDBService.update(this.metricsTable, { testId, modelId }, updates);
            }
            catch (error) {
                console.error(`❌ Failed to record A/B test metrics:`, error);
            }
        }
        /**
         * Get test configuration
         */
        async getTestConfig(testId) {
            try {
                const result = await this.dynamoDBService.get(this.testsTable, { testId });
                return result;
            }
            catch (error) {
                console.error(`❌ Failed to get test config for ${testId}:`, error);
                return null;
            }
        }
        /**
         * Get model performance metrics
         */
        async getModelMetrics(testId, modelId) {
            const metrics = await this.dynamoDBService.get(this.metricsTable, { testId, modelId });
            if (!metrics || metrics.totalRequests === 0) {
                return {
                    totalRequests: 0,
                    successRate: 0,
                    averageProcessingTime: 0,
                    averageConfidence: 0,
                    averageTokenCost: 0,
                };
            }
            return {
                totalRequests: metrics.totalRequests,
                successRate: metrics.successfulRequests / metrics.totalRequests,
                averageProcessingTime: metrics.totalProcessingTime / metrics.totalRequests,
                averageConfidence: metrics.totalConfidence / metrics.totalRequests,
                averageTokenCost: this.calculateTokenCost(metrics.totalInputTokens / metrics.totalRequests, metrics.totalOutputTokens / metrics.totalRequests, modelId),
            };
        }
        /**
         * Calculate statistical significance between two models
         */
        calculateStatisticalSignificance(modelA, modelB) {
            // Simplified statistical significance calculation
            // In production, use proper statistical tests like t-test
            const minSampleSize = Math.min(modelA.totalRequests, modelB.totalRequests);
            if (minSampleSize < 30) {
                return 0; // Insufficient sample size
            }
            const difference = Math.abs(modelA.averageConfidence - modelB.averageConfidence);
            const pooledStdDev = Math.sqrt((Math.pow(modelA.averageConfidence * 0.2, 2) + Math.pow(modelB.averageConfidence * 0.2, 2)) / 2);
            const tStat = difference / (pooledStdDev * Math.sqrt(2 / minSampleSize));
            // Convert t-statistic to confidence level (simplified)
            return Math.min(0.99, tStat * 0.1);
        }
        /**
         * Determine winner based on multiple metrics
         */
        determineWinner(modelA, modelB) {
            // Scoring system based on multiple factors
            let scoreA = 0;
            let scoreB = 0;
            // Success rate (40% weight)
            if (modelA.successRate > modelB.successRate)
                scoreA += 40;
            else if (modelB.successRate > modelA.successRate)
                scoreB += 40;
            // Average confidence (30% weight)
            if (modelA.averageConfidence > modelB.averageConfidence)
                scoreA += 30;
            else if (modelB.averageConfidence > modelA.averageConfidence)
                scoreB += 30;
            // Processing time (20% weight) - lower is better
            if (modelA.averageProcessingTime < modelB.averageProcessingTime)
                scoreA += 20;
            else if (modelB.averageProcessingTime < modelA.averageProcessingTime)
                scoreB += 20;
            // Cost efficiency (10% weight) - lower is better
            if (modelA.averageTokenCost < modelB.averageTokenCost)
                scoreA += 10;
            else if (modelB.averageTokenCost < modelA.averageTokenCost)
                scoreB += 10;
            const scoreDifference = Math.abs(scoreA - scoreB);
            if (scoreDifference < 10)
                return 'tie';
            return scoreA > scoreB ? 'A' : 'B';
        }
        /**
         * Generate recommendations based on test results
         */
        generateRecommendations(modelA, modelB, winner) {
            const recommendations = [];
            if (winner === 'tie') {
                recommendations.push('Results are statistically insignificant. Consider running test longer or with more traffic.');
            }
            else {
                const winnerModel = winner === 'A' ? modelA : modelB;
                const loserModel = winner === 'A' ? modelB : modelA;
                recommendations.push(`Model ${winner} shows superior performance. Consider gradual rollout.`);
                if (winnerModel.averageConfidence > loserModel.averageConfidence + 0.1) {
                    recommendations.push('Winner shows significantly higher confidence in predictions.');
                }
                if (winnerModel.averageProcessingTime < loserModel.averageProcessingTime * 0.8) {
                    recommendations.push('Winner provides better response times, improving user experience.');
                }
                if (winnerModel.averageTokenCost < loserModel.averageTokenCost * 0.9) {
                    recommendations.push('Winner is more cost-effective, reducing operational expenses.');
                }
            }
            if (Math.min(modelA.totalRequests, modelB.totalRequests) < 100) {
                recommendations.push('Consider collecting more data points for more reliable results.');
            }
            return recommendations;
        }
        /**
         * Get test status
         */
        getTestStatus(test) {
            const currentDate = new Date().toISOString().split('T')[0];
            if (!test.active)
                return 'paused';
            if (currentDate < test.startDate)
                return 'pending';
            if (currentDate > test.endDate)
                return 'completed';
            return 'running';
        }
        /**
         * Extract confidence score from model response
         */
        extractConfidenceFromResponse(response) {
            try {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    // Extract confidence from various possible locations
                    if (parsed.confidence)
                        return parsed.confidence;
                    if (parsed.consumptionPatterns && parsed.consumptionPatterns.length > 0) {
                        return parsed.consumptionPatterns.reduce((sum, p) => sum + (p.confidence || 0.5), 0) / parsed.consumptionPatterns.length;
                    }
                }
            }
            catch (error) {
                console.warn('Could not extract confidence from response');
            }
            return 0.5; // Default confidence
        }
        /**
         * Calculate token cost based on model pricing
         */
        calculateTokenCost(inputTokens, outputTokens, modelId) {
            // Simplified pricing - in production, use actual AWS pricing
            const pricing = {
                'claude-3-haiku': { input: 0.00025, output: 0.00125 }, // per 1K tokens
                'claude-3-sonnet': { input: 0.003, output: 0.015 },
                'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
            };
            const modelName = Object.keys(this.availableModels).find(key => this.availableModels[key] === modelId) || 'claude-3-haiku';
            const rates = pricing[modelName] || pricing['claude-3-haiku'];
            return (inputTokens / 1000 * rates.input) + (outputTokens / 1000 * rates.output);
        }
        /**
         * Estimate token count (rough approximation)
         */
        estimateTokens(text) {
            return Math.ceil(text.length / 4);
        }
        /**
         * List all A/B tests with their current status
         */
        async listABTests() {
            try {
                return await this.dynamoDBService.scan(this.testsTable);
            }
            catch (error) {
                // Handle case where ab-tests table doesn't exist yet
                if (error.name === 'ResourceNotFoundException') {
                    console.log(`⚠️ A/B tests table does not exist yet. Returning empty list.`);
                    return [];
                }
                console.error('❌ Failed to list A/B tests:', error);
                throw error;
            }
        }
        /**
         * Deactivate an A/B test
         */
        async deactivateABTest(testId) {
            await this.dynamoDBService.update(this.testsTable, { testId }, { active: false });
            console.log(`🛑 A/B test deactivated: ${testId}`);
        }
    };
    __setFunctionName(_classThis, "ABTestingService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ABTestingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ABTestingService = _classThis;
})();
exports.ABTestingService = ABTestingService;
