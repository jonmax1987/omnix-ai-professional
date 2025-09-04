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
exports.CostAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const monitoring_service_1 = require("./monitoring.service");
let CostAnalyticsService = class CostAnalyticsService {
    constructor() {
        this.tableName = 'omnix-ai-bedrock-costs-dev';
        this.PRICING = {
            'anthropic.claude-3-haiku-20240307-v1:0': {
                input: 0.00025,
                output: 0.00125,
            },
            'anthropic.claude-3-sonnet-20240229-v1:0': {
                input: 0.003,
                output: 0.015,
            },
        };
        this.monitoring = new monitoring_service_1.MonitoringService();
        const region = process.env.AWS_REGION || 'eu-central-1';
        const clientConfig = { region };
        if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            clientConfig.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            };
        }
        const dynamoClient = new client_dynamodb_1.DynamoDBClient(clientConfig);
        this.dynamoClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
        console.log('💰 Cost Analytics Service initialized');
    }
    async recordBedrockCall(params) {
        const estimatedCost = this.calculateCost(params.modelId, params.inputTokens, params.outputTokens);
        const costEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            customerId: params.customerId,
            analysisType: params.analysisType,
            modelId: params.modelId,
            inputTokens: params.inputTokens,
            outputTokens: params.outputTokens,
            estimatedCost,
            processingTimeMs: params.processingTimeMs,
            success: params.success,
            usedFallback: params.usedFallback,
        };
        try {
            await this.dynamoClient.send(new lib_dynamodb_1.PutCommand({
                TableName: this.tableName,
                Item: costEntry,
            }));
            await this.monitoring.recordBedrockAPICall({
                modelId: params.modelId,
                inputTokens: params.inputTokens,
                outputTokens: params.outputTokens,
                estimatedCost,
            });
            console.log(`💰 Recorded Bedrock call cost: $${estimatedCost.toFixed(4)} (${params.inputTokens + params.outputTokens} tokens)`);
        }
        catch (error) {
            console.error('❌ Failed to record Bedrock cost:', error);
        }
    }
    calculateCost(modelId, inputTokens, outputTokens) {
        const pricing = this.PRICING[modelId];
        if (!pricing) {
            console.warn(`⚠️  Unknown model pricing for ${modelId}, using Haiku pricing as fallback`);
            return this.calculateCost('anthropic.claude-3-haiku-20240307-v1:0', inputTokens, outputTokens);
        }
        const inputCost = (inputTokens / 1000) * pricing.input;
        const outputCost = (outputTokens / 1000) * pricing.output;
        return inputCost + outputCost;
    }
    async getCostAnalytics(timeRange = 'day') {
        const endTime = new Date();
        const startTime = new Date();
        switch (timeRange) {
            case 'hour':
                startTime.setHours(startTime.getHours() - 1);
                break;
            case 'day':
                startTime.setDate(startTime.getDate() - 1);
                break;
            case 'week':
                startTime.setDate(startTime.getDate() - 7);
                break;
            case 'month':
                startTime.setMonth(startTime.getMonth() - 1);
                break;
        }
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.ScanCommand({
                TableName: this.tableName,
                FilterExpression: '#timestamp BETWEEN :start AND :end',
                ExpressionAttributeNames: {
                    '#timestamp': 'timestamp',
                },
                ExpressionAttributeValues: {
                    ':start': startTime.toISOString(),
                    ':end': endTime.toISOString(),
                },
            }));
            return this.calculateAnalytics(result.Items || []);
        }
        catch (error) {
            console.error('❌ Failed to fetch cost analytics:', error);
            return this.getEmptyAnalytics();
        }
    }
    async getCustomerCostAnalytics(customerId, days = 30) {
        const endTime = new Date();
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - days);
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.ScanCommand({
                TableName: this.tableName,
                FilterExpression: 'customerId = :customerId AND #timestamp BETWEEN :start AND :end',
                ExpressionAttributeNames: {
                    '#timestamp': 'timestamp',
                },
                ExpressionAttributeValues: {
                    ':customerId': customerId,
                    ':start': startTime.toISOString(),
                    ':end': endTime.toISOString(),
                },
            }));
            return this.calculateAnalytics(result.Items || []);
        }
        catch (error) {
            console.error(`❌ Failed to fetch cost analytics for customer ${customerId}:`, error);
            return this.getEmptyAnalytics();
        }
    }
    calculateAnalytics(items) {
        if (!items.length) {
            return this.getEmptyAnalytics();
        }
        const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
        const totalRequests = items.length;
        const successfulRequests = items.filter(item => item.success);
        const fallbackRequests = items.filter(item => item.usedFallback);
        const costByAnalysisType = {};
        items.forEach(item => {
            if (!costByAnalysisType[item.analysisType]) {
                costByAnalysisType[item.analysisType] = {
                    totalCost: 0,
                    requestCount: 0,
                    averageCost: 0,
                };
            }
            costByAnalysisType[item.analysisType].totalCost += item.estimatedCost;
            costByAnalysisType[item.analysisType].requestCount++;
        });
        Object.keys(costByAnalysisType).forEach(type => {
            const data = costByAnalysisType[type];
            data.averageCost = data.totalCost / data.requestCount;
        });
        const totalInputTokens = items.reduce((sum, item) => sum + item.inputTokens, 0);
        const totalOutputTokens = items.reduce((sum, item) => sum + item.outputTokens, 0);
        const costByTimeRange = this.calculateCostByTimeRange(items);
        const projectedMonthlyCost = this.projectMonthlyCost(items);
        return {
            totalCost,
            totalRequests,
            averageCostPerRequest: totalCost / totalRequests,
            costByAnalysisType,
            costByTimeRange,
            tokenUsage: {
                totalInputTokens,
                totalOutputTokens,
                averageTokensPerRequest: (totalInputTokens + totalOutputTokens) / totalRequests,
            },
            fallbackRate: fallbackRequests.length / totalRequests,
            projectedMonthlyCost,
        };
    }
    calculateCostByTimeRange(items) {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const hourlyItems = items.filter(item => new Date(item.timestamp) > oneHourAgo);
        const dailyItems = items.filter(item => new Date(item.timestamp) > oneDayAgo);
        const monthlyItems = items.filter(item => new Date(item.timestamp) > oneMonthAgo);
        return {
            hourly: hourlyItems.reduce((sum, item) => sum + item.estimatedCost, 0),
            daily: dailyItems.reduce((sum, item) => sum + item.estimatedCost, 0),
            monthly: monthlyItems.reduce((sum, item) => sum + item.estimatedCost, 0),
        };
    }
    projectMonthlyCost(items) {
        if (!items.length)
            return 0;
        const sortedItems = items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const firstItem = sortedItems[0];
        const lastItem = sortedItems[sortedItems.length - 1];
        const periodDays = (new Date(lastItem.timestamp).getTime() - new Date(firstItem.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        if (periodDays === 0)
            return items.reduce((sum, item) => sum + item.estimatedCost, 0) * 30;
        const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
        const dailyAverageCost = totalCost / Math.max(periodDays, 1);
        return dailyAverageCost * 30;
    }
    getEmptyAnalytics() {
        return {
            totalCost: 0,
            totalRequests: 0,
            averageCostPerRequest: 0,
            costByAnalysisType: {},
            costByTimeRange: {
                hourly: 0,
                daily: 0,
                monthly: 0,
            },
            tokenUsage: {
                totalInputTokens: 0,
                totalOutputTokens: 0,
                averageTokensPerRequest: 0,
            },
            fallbackRate: 0,
            projectedMonthlyCost: 0,
        };
    }
    async getTopCustomersByCost(limit = 10, days = 30) {
        const endTime = new Date();
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - days);
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.ScanCommand({
                TableName: this.tableName,
                FilterExpression: '#timestamp BETWEEN :start AND :end',
                ExpressionAttributeNames: {
                    '#timestamp': 'timestamp',
                },
                ExpressionAttributeValues: {
                    ':start': startTime.toISOString(),
                    ':end': endTime.toISOString(),
                },
            }));
            const customerCosts = new Map();
            result.Items?.forEach(item => {
                if (!customerCosts.has(item.customerId)) {
                    customerCosts.set(item.customerId, { totalCost: 0, requestCount: 0 });
                }
                const customer = customerCosts.get(item.customerId);
                customer.totalCost += item.estimatedCost;
                customer.requestCount++;
            });
            return Array.from(customerCosts.entries())
                .map(([customerId, data]) => ({
                customerId,
                totalCost: data.totalCost,
                requestCount: data.requestCount,
                averageCostPerRequest: data.totalCost / data.requestCount,
            }))
                .sort((a, b) => b.totalCost - a.totalCost)
                .slice(0, limit);
        }
        catch (error) {
            console.error('❌ Failed to get top customers by cost:', error);
            return [];
        }
    }
    async setupCostAlerts(thresholds) {
        console.log('💰 Cost alert thresholds configured:', thresholds);
    }
};
exports.CostAnalyticsService = CostAnalyticsService;
exports.CostAnalyticsService = CostAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CostAnalyticsService);
//# sourceMappingURL=cost-analytics.service.js.map