"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessingService = void 0;
const common_1 = require("@nestjs/common");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const bedrock_service_1 = require("./bedrock.service");
const monitoring_service_1 = require("./monitoring.service");
const cost_analytics_service_1 = require("./cost-analytics.service");
const crypto = __importStar(require("crypto"));
let BatchProcessingService = class BatchProcessingService {
    constructor() {
        this.jobsTableName = 'omnix-ai-batch-jobs-dev';
        this.queueUrl = process.env.BATCH_QUEUE_URL || 'https://sqs.eu-central-1.amazonaws.com/631844602411/omnix-ai-batch-queue-dev';
        this.config = {
            maxConcurrentJobs: 50,
            defaultBatchSize: 10,
            maxRetries: 3,
            jobTimeoutMinutes: 30,
            pollingIntervalMs: 5000,
        };
        this.monitoring = new monitoring_service_1.MonitoringService();
        this.costAnalytics = new cost_analytics_service_1.CostAnalyticsService();
        this.bedrockService = new bedrock_service_1.BedrockAnalysisService();
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
        this.sqsClient = new client_sqs_1.SQSClient(clientConfig);
        console.log('⚡ Batch Processing Service initialized');
    }
    async submitBatchRequest(request) {
        const batchId = `batch-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
        const jobs = [];
        let totalEstimatedCost = 0;
        console.log(`📋 Creating batch analysis request: ${batchId}`);
        console.log(`   Customers: ${request.customers.length}`);
        console.log(`   Analysis Types: ${request.analysisTypes.join(', ')}`);
        for (const customer of request.customers) {
            const jobId = `${batchId}-${customer.customerId}`;
            const estimatedTokensPerAnalysis = customer.purchases.length * 50;
            const estimatedCostPerJob = request.analysisTypes.length * estimatedTokensPerAnalysis * 0.00025 / 1000;
            const job = {
                jobId,
                customerId: customer.customerId,
                analysisTypes: request.analysisTypes,
                status: 'queued',
                priority: customer.priority || 'normal',
                createdAt: new Date().toISOString(),
                progress: 0,
                estimatedCost: estimatedCostPerJob,
            };
            jobs.push(job);
            totalEstimatedCost += estimatedCostPerJob;
            await this.storeJob(job);
            await this.enqueueJob(job, customer.purchases);
        }
        console.log(`✅ Created ${jobs.length} batch jobs with estimated cost: $${totalEstimatedCost.toFixed(4)}`);
        await this.recordBatchMetrics({
            batchId,
            jobCount: jobs.length,
            totalCost: totalEstimatedCost,
            analysisTypes: request.analysisTypes,
        });
        return {
            batchId,
            jobCount: jobs.length,
            estimatedCost: totalEstimatedCost,
        };
    }
    async processBatchJobs(maxConcurrent = this.config.maxConcurrentJobs) {
        console.log(`🚀 Starting batch job processor (max concurrent: ${maxConcurrent})`);
        const activeJobs = new Set();
        while (true) {
            try {
                if (activeJobs.size >= maxConcurrent) {
                    await this.sleep(this.config.pollingIntervalMs);
                    continue;
                }
                const messages = await this.receiveMessages(maxConcurrent - activeJobs.size);
                if (messages.length === 0) {
                    console.log('📭 No jobs in queue, waiting...');
                    await this.sleep(this.config.pollingIntervalMs);
                    continue;
                }
                for (const message of messages) {
                    const jobData = JSON.parse(message.Body || '{}');
                    activeJobs.add(jobData.jobId);
                    this.processJob(jobData, message.ReceiptHandle)
                        .then(() => activeJobs.delete(jobData.jobId))
                        .catch((error) => {
                        console.error(`❌ Job ${jobData.jobId} failed:`, error);
                        activeJobs.delete(jobData.jobId);
                    });
                }
            }
            catch (error) {
                console.error('❌ Batch processing error:', error);
                await this.sleep(this.config.pollingIntervalMs);
            }
        }
    }
    async processJob(jobData, receiptHandle) {
        const { jobId, customerId, purchases, analysisTypes, priority } = jobData;
        console.log(`🔄 Processing job ${jobId} for customer ${customerId}`);
        try {
            await this.updateJobStatus(jobId, 'processing');
            const results = {};
            let completedAnalyses = 0;
            for (const analysisType of analysisTypes) {
                const request = {
                    customerId,
                    purchases,
                    analysisType,
                    maxRecommendations: 5,
                };
                console.log(`   Running ${analysisType} analysis...`);
                const analysisResult = await this.bedrockService.analyzeCustomer(request);
                if (analysisResult.success && analysisResult.data) {
                    results[analysisType] = analysisResult.data;
                }
                completedAnalyses++;
                const progress = (completedAnalyses / analysisTypes.length) * 100;
                await this.updateJobProgress(jobId, progress);
                await this.sleep(100);
            }
            await this.completeJob(jobId, results);
            await this.deleteMessage(receiptHandle);
            console.log(`✅ Job ${jobId} completed successfully`);
        }
        catch (error) {
            console.error(`❌ Job ${jobId} failed:`, error);
            await this.failJob(jobId, error.message);
            await this.deleteMessage(receiptHandle);
        }
    }
    async getBatchStatus(batchId) {
        try {
            const result = await this.dynamoClient.send(new lib_dynamodb_1.QueryCommand({
                TableName: this.jobsTableName,
                IndexName: 'batchId-createdAt-index',
                KeyConditionExpression: 'begins_with(jobId, :batchId)',
                ExpressionAttributeValues: {
                    ':batchId': batchId,
                },
            }));
            const jobs = (result.Items || []);
            const stats = this.calculateBatchStats(jobs);
            return {
                batchId,
                stats,
                jobs,
            };
        }
        catch (error) {
            console.error(`❌ Failed to get batch status for ${batchId}:`, error);
            throw error;
        }
    }
    async getQueueStats() {
        try {
            const result = await this.sqsClient.send(new client_sqs_1.GetQueueAttributesCommand({
                QueueUrl: this.queueUrl,
                AttributeNames: ['All'],
            }));
            const attributes = result.Attributes || {};
            return {
                approximateNumberOfMessages: parseInt(attributes['ApproximateNumberOfMessages'] || '0'),
                approximateNumberOfMessagesNotVisible: parseInt(attributes['ApproximateNumberOfMessagesNotVisible'] || '0'),
                approximateAgeOfOldestMessage: parseInt(attributes['ApproximateAgeOfOldestMessage'] || '0'),
            };
        }
        catch (error) {
            console.error('❌ Failed to get queue stats:', error);
            return {
                approximateNumberOfMessages: 0,
                approximateNumberOfMessagesNotVisible: 0,
                approximateAgeOfOldestMessage: 0,
            };
        }
    }
    async storeJob(job) {
        await this.dynamoClient.send(new lib_dynamodb_1.PutCommand({
            TableName: this.jobsTableName,
            Item: job,
        }));
    }
    async enqueueJob(job, purchases) {
        const messageBody = JSON.stringify({
            jobId: job.jobId,
            customerId: job.customerId,
            purchases,
            analysisTypes: job.analysisTypes,
            priority: job.priority,
        });
        await this.sqsClient.send(new client_sqs_1.SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: messageBody,
            MessageGroupId: job.priority,
            MessageDeduplicationId: job.jobId,
        }));
    }
    async receiveMessages(maxMessages = 10) {
        const result = await this.sqsClient.send(new client_sqs_1.ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: Math.min(maxMessages, 10),
            WaitTimeSeconds: 5,
            VisibilityTimeout: this.config.jobTimeoutMinutes * 60,
        }));
        return result.Messages || [];
    }
    async deleteMessage(receiptHandle) {
        await this.sqsClient.send(new client_sqs_1.DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: receiptHandle,
        }));
    }
    async updateJobStatus(jobId, status) {
        const updateData = {
            status,
        };
        if (status === 'processing') {
            updateData.startedAt = new Date().toISOString();
        }
        else if (status === 'completed' || status === 'failed') {
            updateData.completedAt = new Date().toISOString();
        }
        await this.dynamoClient.send(new lib_dynamodb_1.UpdateCommand({
            TableName: this.jobsTableName,
            Key: { jobId },
            UpdateExpression: 'SET #status = :status' + (updateData.startedAt ? ', startedAt = :startedAt' : '') + (updateData.completedAt ? ', completedAt = :completedAt' : ''),
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': status,
                ...(updateData.startedAt && { ':startedAt': updateData.startedAt }),
                ...(updateData.completedAt && { ':completedAt': updateData.completedAt }),
            },
        }));
    }
    async updateJobProgress(jobId, progress) {
        await this.dynamoClient.send(new lib_dynamodb_1.UpdateCommand({
            TableName: this.jobsTableName,
            Key: { jobId },
            UpdateExpression: 'SET progress = :progress',
            ExpressionAttributeValues: {
                ':progress': progress,
            },
        }));
    }
    async completeJob(jobId, results) {
        await this.dynamoClient.send(new lib_dynamodb_1.UpdateCommand({
            TableName: this.jobsTableName,
            Key: { jobId },
            UpdateExpression: 'SET #status = :status, results = :results, completedAt = :completedAt, progress = :progress',
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': 'completed',
                ':results': results,
                ':completedAt': new Date().toISOString(),
                ':progress': 100,
            },
        }));
    }
    async failJob(jobId, error) {
        await this.dynamoClient.send(new lib_dynamodb_1.UpdateCommand({
            TableName: this.jobsTableName,
            Key: { jobId },
            UpdateExpression: 'SET #status = :status, #error = :error, completedAt = :completedAt',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#error': 'error',
            },
            ExpressionAttributeValues: {
                ':status': 'failed',
                ':error': error,
                ':completedAt': new Date().toISOString(),
            },
        }));
    }
    calculateBatchStats(jobs) {
        const totalJobs = jobs.length;
        const completedJobs = jobs.filter(j => j.status === 'completed').length;
        const failedJobs = jobs.filter(j => j.status === 'failed').length;
        const queuedJobs = jobs.filter(j => j.status === 'queued').length;
        const processingJobs = jobs.filter(j => j.status === 'processing').length;
        const completedJobsWithTime = jobs.filter(j => j.status === 'completed' && j.startedAt && j.completedAt);
        const averageProcessingTime = completedJobsWithTime.length > 0
            ? completedJobsWithTime.reduce((sum, job) => {
                const start = new Date(job.startedAt).getTime();
                const end = new Date(job.completedAt).getTime();
                return sum + (end - start);
            }, 0) / completedJobsWithTime.length / 1000
            : 0;
        const totalCost = jobs.reduce((sum, job) => sum + (job.estimatedCost || 0), 0);
        const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
        return {
            totalJobs,
            completedJobs,
            failedJobs,
            queuedJobs,
            processingJobs,
            averageProcessingTime,
            totalCost,
            successRate,
        };
    }
    async recordBatchMetrics(metrics) {
        try {
            await this.monitoring.recordBusinessMetric('BatchJobsSubmitted', metrics.jobCount, 'Count', [{ name: 'BatchId', value: metrics.batchId }]);
            await this.monitoring.recordBusinessMetric('BatchEstimatedCost', metrics.totalCost, 'None', [{ name: 'BatchId', value: metrics.batchId }]);
        }
        catch (error) {
            console.error('❌ Failed to record batch metrics:', error);
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.BatchProcessingService = BatchProcessingService;
exports.BatchProcessingService = BatchProcessingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BatchProcessingService);
//# sourceMappingURL=batch-processing.service.js.map