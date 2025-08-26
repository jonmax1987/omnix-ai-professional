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
exports.ABTestingService = void 0;
const common_1 = require("@nestjs/common");
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const dynamodb_service_1 = require("./dynamodb.service");
const monitoring_service_1 = require("./monitoring.service");
let ABTestingService = class ABTestingService {
    constructor(dynamoDBService, monitoring) {
        this.dynamoDBService = dynamoDBService;
        this.monitoring = monitoring;
        this.testsTable = 'ab-tests';
        this.metricsTable = 'ab-test-metrics';
        this.availableModels = {
            'claude-3-haiku': 'anthropic.claude-3-haiku-20240307-v1:0',
            'claude-3-sonnet': 'anthropic.claude-3-sonnet-20240229-v1:0',
            'claude-3-5-sonnet': 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        };
        this.bedrock = new client_bedrock_runtime_1.BedrockRuntimeClient({
            region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
        });
    }
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
        await this.initializeTestMetrics(config.testId, config.modelA.id);
        await this.initializeTestMetrics(config.testId, config.modelB.id);
        console.log(`✅ A/B test created: ${config.testId}`);
    }
    async getModelAssignment(customerId, analysisType) {
        const activeTests = await this.getActiveTests(analysisType);
        if (activeTests.length === 0) {
            return {
                modelId: this.availableModels['claude-3-haiku'],
                modelName: 'claude-3-haiku',
            };
        }
        const test = activeTests[0];
        const assignment = this.assignCustomerToModel(customerId, test);
        console.log(`🎯 Customer ${customerId} assigned to model ${assignment.modelName} (test: ${test.testId})`);
        return {
            modelId: assignment.modelId,
            modelName: assignment.modelName,
            testId: test.testId,
        };
    }
    async invokeModelWithABTesting(request, prompt) {
        const startTime = Date.now();
        const assignment = await this.getModelAssignment(request.customerId, request.analysisType);
        try {
            const response = await this.invokeBedrockModel(assignment.modelId, prompt);
            const processingTime = Date.now() - startTime;
            const inputTokens = this.estimateTokens(prompt);
            const outputTokens = this.estimateTokens(response);
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
    async getABTestResults(testId) {
        console.log(`📊 Generating A/B test results for ${testId}`);
        const test = await this.getTestConfig(testId);
        if (!test) {
            throw new Error(`Test ${testId} not found`);
        }
        const modelAMetrics = await this.getModelMetrics(testId, test.modelA.id);
        const modelBMetrics = await this.getModelMetrics(testId, test.modelB.id);
        const significance = this.calculateStatisticalSignificance(modelAMetrics, modelBMetrics);
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
    assignCustomerToModel(customerId, test) {
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
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash) / 2147483647;
    }
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
    async getActiveTests(analysisType) {
        const currentDate = new Date().toISOString().split('T')[0];
        const allTests = await this.dynamoDBService.scan(this.testsTable);
        return allTests.filter((test) => test.active &&
            test.startDate <= currentDate &&
            test.endDate >= currentDate &&
            test.metrics.includes(analysisType));
    }
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
    async recordABTestMetrics(testId, modelId, metrics) {
        try {
            const currentMetrics = await this.dynamoDBService.get(this.metricsTable, { testId, modelId }) || {
                totalRequests: 0,
                successfulRequests: 0,
                totalProcessingTime: 0,
                totalConfidence: 0,
                totalInputTokens: 0,
                totalOutputTokens: 0,
            };
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
    calculateStatisticalSignificance(modelA, modelB) {
        const minSampleSize = Math.min(modelA.totalRequests, modelB.totalRequests);
        if (minSampleSize < 30) {
            return 0;
        }
        const difference = Math.abs(modelA.averageConfidence - modelB.averageConfidence);
        const pooledStdDev = Math.sqrt((Math.pow(modelA.averageConfidence * 0.2, 2) + Math.pow(modelB.averageConfidence * 0.2, 2)) / 2);
        const tStat = difference / (pooledStdDev * Math.sqrt(2 / minSampleSize));
        return Math.min(0.99, tStat * 0.1);
    }
    determineWinner(modelA, modelB) {
        let scoreA = 0;
        let scoreB = 0;
        if (modelA.successRate > modelB.successRate)
            scoreA += 40;
        else if (modelB.successRate > modelA.successRate)
            scoreB += 40;
        if (modelA.averageConfidence > modelB.averageConfidence)
            scoreA += 30;
        else if (modelB.averageConfidence > modelA.averageConfidence)
            scoreB += 30;
        if (modelA.averageProcessingTime < modelB.averageProcessingTime)
            scoreA += 20;
        else if (modelB.averageProcessingTime < modelA.averageProcessingTime)
            scoreB += 20;
        if (modelA.averageTokenCost < modelB.averageTokenCost)
            scoreA += 10;
        else if (modelB.averageTokenCost < modelA.averageTokenCost)
            scoreB += 10;
        const scoreDifference = Math.abs(scoreA - scoreB);
        if (scoreDifference < 10)
            return 'tie';
        return scoreA > scoreB ? 'A' : 'B';
    }
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
    extractConfidenceFromResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
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
        return 0.5;
    }
    calculateTokenCost(inputTokens, outputTokens, modelId) {
        const pricing = {
            'claude-3-haiku': { input: 0.00025, output: 0.00125 },
            'claude-3-sonnet': { input: 0.003, output: 0.015 },
            'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
        };
        const modelName = Object.keys(this.availableModels).find(key => this.availableModels[key] === modelId) || 'claude-3-haiku';
        const rates = pricing[modelName] || pricing['claude-3-haiku'];
        return (inputTokens / 1000 * rates.input) + (outputTokens / 1000 * rates.output);
    }
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    async listABTests() {
        return await this.dynamoDBService.scan(this.testsTable);
    }
    async deactivateABTest(testId) {
        await this.dynamoDBService.update(this.testsTable, { testId }, { active: false });
        console.log(`🛑 A/B test deactivated: ${testId}`);
    }
};
exports.ABTestingService = ABTestingService;
exports.ABTestingService = ABTestingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dynamodb_service_1.DynamoDBService,
        monitoring_service_1.MonitoringService])
], ABTestingService);
//# sourceMappingURL=ab-testing.service.js.map