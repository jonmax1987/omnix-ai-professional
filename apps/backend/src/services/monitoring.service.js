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
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
let MonitoringService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MonitoringService = _classThis = class {
        constructor() {
            this.namespace = 'OMNIX/AI';
            this.region = process.env.AWS_REGION || 'eu-central-1';
            const clientConfig = {
                region: this.region,
            };
            // In Lambda, use IAM role; locally use explicit credentials if available
            if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
                clientConfig.credentials = {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                };
            }
            this.cloudWatch = new client_cloudwatch_1.CloudWatchClient(clientConfig);
            console.log('📊 Monitoring Service initialized for region:', this.region);
        }
        /**
         * Emit AI analysis performance metrics
         */
        async recordAIAnalysisMetrics(metrics) {
            const metricData = [];
            // Record analysis count
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
            // Record customer analysis count
            metricData.push({
                MetricName: 'CustomerAnalysisCount',
                Value: 1,
                Unit: 'Count',
                Dimensions: [
                    { Name: 'AnalysisType', Value: metrics.analysisType }
                ],
                Timestamp: new Date()
            });
            // Record processing time (latency)
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
            // Record errors
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
            // Record fallback usage
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
            // Record confidence/accuracy
            if (metrics.confidence > 0) {
                metricData.push({
                    MetricName: 'AIRecommendationAccuracy',
                    Value: metrics.confidence * 100, // Convert to percentage
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
        /**
         * Record Bedrock API call for cost tracking
         */
        async recordBedrockAPICall(metrics) {
            const metricData = [];
            // Record API call count for cost estimation
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
            // Record token usage if available
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
            // Record estimated cost if available
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
        /**
         * Record customer engagement metrics
         */
        async recordCustomerEngagement(metrics) {
            const metricData = [];
            // Record recommendations generated
            metricData.push({
                MetricName: 'RecommendationsGenerated',
                Value: metrics.recommendationCount,
                Unit: 'Count',
                Dimensions: [
                    { Name: 'Service', Value: 'CustomerAnalytics' }
                ],
                Timestamp: new Date()
            });
            // Record prediction accuracy if measured
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
            // Record customer engagement score
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
        /**
         * Record system performance metrics
         */
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
        /**
         * Publish metrics to CloudWatch (with error handling)
         */
        async publishMetrics(metricData) {
            try {
                // CloudWatch accepts up to 20 metrics per request
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
                // Don't throw - monitoring should not break the main functionality
            }
        }
        /**
         * Utility to chunk array into smaller pieces
         */
        chunkArray(array, chunkSize) {
            const chunks = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }
            return chunks;
        }
        /**
         * Create a custom business metric for tracking
         */
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
        /**
         * Record customer segmentation metrics
         */
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
        /**
         * Record segment migration metrics
         */
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
    __setFunctionName(_classThis, "MonitoringService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MonitoringService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MonitoringService = _classThis;
})();
exports.MonitoringService = MonitoringService;
