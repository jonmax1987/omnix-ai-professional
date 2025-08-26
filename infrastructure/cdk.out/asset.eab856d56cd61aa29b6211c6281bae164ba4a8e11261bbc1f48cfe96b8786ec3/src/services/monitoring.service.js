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
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
let MonitoringService = class MonitoringService {
    constructor() {
        this.namespace = 'OMNIX/AI';
        this.region = process.env.AWS_REGION || 'eu-central-1';
        const clientConfig = {
            region: this.region,
        };
        if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            clientConfig.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            };
        }
        this.cloudWatch = new client_cloudwatch_1.CloudWatchClient(clientConfig);
        console.log('📊 Monitoring Service initialized for region:', this.region);
    }
    async recordAIAnalysisMetrics(metrics) {
        const metricData = [];
        metricData.push({
            MetricName: 'BedrockAnalysisCount',
            Value: 1,
            Unit: 'Count',
            Dimensions: [
                { Name: 'Service', Value: 'BedrockAnalysis' },
                { Name: 'AnalysisType', Value: metrics.analysisType }
            ],
            Timestamp: new Date()
        });
        metricData.push({
            MetricName: 'CustomerAnalysisCount',
            Value: 1,
            Unit: 'Count',
            Dimensions: [
                { Name: 'AnalysisType', Value: metrics.analysisType }
            ],
            Timestamp: new Date()
        });
        metricData.push({
            MetricName: 'BedrockAnalysisLatency',
            Value: metrics.processingTime,
            Unit: 'Milliseconds',
            Dimensions: [
                { Name: 'Service', Value: 'BedrockAnalysis' },
                { Name: 'AnalysisType', Value: metrics.analysisType }
            ],
            Timestamp: new Date()
        });
        if (!metrics.success) {
            metricData.push({
                MetricName: 'BedrockAnalysisErrors',
                Value: 1,
                Unit: 'Count',
                Dimensions: [
                    { Name: 'Service', Value: 'BedrockAnalysis' },
                    { Name: 'AnalysisType', Value: metrics.analysisType }
                ],
                Timestamp: new Date()
            });
        }
        if (metrics.usedFallback) {
            metricData.push({
                MetricName: 'FallbackAnalysisCount',
                Value: 1,
                Unit: 'Count',
                Dimensions: [
                    { Name: 'Service', Value: 'BedrockAnalysis' },
                    { Name: 'AnalysisType', Value: metrics.analysisType }
                ],
                Timestamp: new Date()
            });
        }
        if (metrics.confidence > 0) {
            metricData.push({
                MetricName: 'AIRecommendationAccuracy',
                Value: metrics.confidence * 100,
                Unit: 'Percent',
                Dimensions: [
                    { Name: 'Service', Value: 'BedrockAnalysis' },
                    { Name: 'AnalysisType', Value: metrics.analysisType }
                ],
                Timestamp: new Date()
            });
        }
        await this.publishMetrics(metricData);
    }
    async recordBedrockAPICall(metrics) {
        const metricData = [];
        metricData.push({
            MetricName: 'BedrockAPICallCount',
            Value: 1,
            Unit: 'Count',
            Dimensions: [
                { Name: 'Service', Value: 'BedrockAnalysis' },
                { Name: 'ModelId', Value: metrics.modelId }
            ],
            Timestamp: new Date()
        });
        if (metrics.inputTokens) {
            metricData.push({
                MetricName: 'BedrockInputTokens',
                Value: metrics.inputTokens,
                Unit: 'Count',
                Dimensions: [
                    { Name: 'Service', Value: 'BedrockAnalysis' },
                    { Name: 'ModelId', Value: metrics.modelId }
                ],
                Timestamp: new Date()
            });
        }
        if (metrics.outputTokens) {
            metricData.push({
                MetricName: 'BedrockOutputTokens',
                Value: metrics.outputTokens,
                Unit: 'Count',
                Dimensions: [
                    { Name: 'Service', Value: 'BedrockAnalysis' },
                    { Name: 'ModelId', Value: metrics.modelId }
                ],
                Timestamp: new Date()
            });
        }
        if (metrics.estimatedCost) {
            metricData.push({
                MetricName: 'BedrockEstimatedCost',
                Value: metrics.estimatedCost,
                Unit: 'None',
                Dimensions: [
                    { Name: 'Service', Value: 'BedrockAnalysis' },
                    { Name: 'ModelId', Value: metrics.modelId }
                ],
                Timestamp: new Date()
            });
        }
        await this.publishMetrics(metricData);
    }
    async recordCustomerEngagement(metrics) {
        const metricData = [];
        metricData.push({
            MetricName: 'RecommendationsGenerated',
            Value: metrics.recommendationCount,
            Unit: 'Count',
            Dimensions: [
                { Name: 'Service', Value: 'CustomerAnalytics' }
            ],
            Timestamp: new Date()
        });
        if (metrics.predictionAccuracy !== undefined) {
            metricData.push({
                MetricName: 'PredictionAccuracy',
                Value: metrics.predictionAccuracy * 100,
                Unit: 'Percent',
                Dimensions: [
                    { Name: 'Service', Value: 'CustomerAnalytics' }
                ],
                Timestamp: new Date()
            });
        }
        if (metrics.engagementScore !== undefined) {
            metricData.push({
                MetricName: 'CustomerEngagementScore',
                Value: metrics.engagementScore,
                Unit: 'None',
                Dimensions: [
                    { Name: 'Service', Value: 'CustomerAnalytics' }
                ],
                Timestamp: new Date()
            });
        }
        await this.publishMetrics(metricData);
    }
    async recordSystemPerformance(metrics) {
        const metricData = [];
        if (metrics.cacheHitRate !== undefined) {
            metricData.push({
                MetricName: 'CacheHitRate',
                Value: metrics.cacheHitRate * 100,
                Unit: 'Percent',
                Dimensions: [
                    { Name: 'Service', Value: 'AICache' }
                ],
                Timestamp: new Date()
            });
        }
        if (metrics.databaseLatency !== undefined) {
            metricData.push({
                MetricName: 'DatabaseLatency',
                Value: metrics.databaseLatency,
                Unit: 'Milliseconds',
                Dimensions: [
                    { Name: 'Service', Value: 'DynamoDB' }
                ],
                Timestamp: new Date()
            });
        }
        if (metrics.concurrentAnalyses !== undefined) {
            metricData.push({
                MetricName: 'ConcurrentAnalyses',
                Value: metrics.concurrentAnalyses,
                Unit: 'Count',
                Dimensions: [
                    { Name: 'Service', Value: 'BedrockAnalysis' }
                ],
                Timestamp: new Date()
            });
        }
        await this.publishMetrics(metricData);
    }
    async publishMetrics(metricData) {
        try {
            const chunks = this.chunkArray(metricData, 20);
            for (const chunk of chunks) {
                const command = new client_cloudwatch_1.PutMetricDataCommand({
                    Namespace: this.namespace,
                    MetricData: chunk,
                });
                await this.cloudWatch.send(command);
            }
            console.log(`📊 Published ${metricData.length} metrics to CloudWatch namespace: ${this.namespace}`);
        }
        catch (error) {
            console.error('❌ Failed to publish metrics to CloudWatch:', error);
        }
    }
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    async recordBusinessMetric(metricName, value, unit, dimensions) {
        const metricData = [{
                MetricName: metricName,
                Value: value,
                Unit: unit,
                Dimensions: dimensions?.map(d => ({ Name: d.name, Value: d.value })) || [],
                Timestamp: new Date()
            }];
        await this.publishMetrics(metricData);
    }
    async recordSegmentationMetrics(metrics) {
        const metricData = [
            {
                MetricName: 'CustomerSegmentationCount',
                Value: metrics.customersSegmented,
                Unit: 'Count',
                Dimensions: [
                    { Name: 'Service', Value: 'CustomerSegmentation' }
                ],
                Timestamp: new Date()
            },
            {
                MetricName: 'SegmentationProcessingTime',
                Value: metrics.processingTime,
                Unit: 'Milliseconds',
                Dimensions: [
                    { Name: 'Service', Value: 'CustomerSegmentation' }
                ],
                Timestamp: new Date()
            },
            {
                MetricName: 'SegmentationConfidence',
                Value: metrics.averageConfidence,
                Unit: 'Percent',
                Dimensions: [
                    { Name: 'Service', Value: 'CustomerSegmentation' }
                ],
                Timestamp: new Date()
            }
        ];
        await this.publishMetrics(metricData);
    }
    async recordSegmentMigration(migration) {
        const metricData = [
            {
                MetricName: 'SegmentMigration',
                Value: 1,
                Unit: 'Count',
                Dimensions: [
                    { Name: 'Service', Value: 'CustomerSegmentation' },
                    { Name: 'FromSegment', Value: migration.fromSegment },
                    { Name: 'ToSegment', Value: migration.toSegment }
                ],
                Timestamp: new Date()
            }
        ];
        await this.publishMetrics(metricData);
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map