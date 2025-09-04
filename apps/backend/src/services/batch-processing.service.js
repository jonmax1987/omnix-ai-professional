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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
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
let BatchProcessingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var BatchProcessingService = _classThis = class {
        constructor() {
            this.jobsTableName = 'omnix-ai-batch-jobs-dev';
            this.queueUrl = process.env.BATCH_QUEUE_URL || 'https://sqs.eu-central-1.amazonaws.com/631844602411/omnix-ai-batch-queue-dev';
            // Batch processing configuration
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
        /**
         * Submit a batch analysis request for multiple customers
         */
        async submitBatchRequest(request) {
            const batchId = `batch-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
            const jobs = [];
            let totalEstimatedCost = 0;
            console.log(`📋 Creating batch analysis request: ${batchId}`);
            console.log(`   Customers: ${request.customers.length}`);
            console.log(`   Analysis Types: ${request.analysisTypes.join(', ')}`);
            // Create individual jobs for each customer
            for (const customer of request.customers) {
                const jobId = `${batchId}-${customer.customerId}`;
                // Estimate cost per job (rough calculation)
                const estimatedTokensPerAnalysis = customer.purchases.length * 50; // ~50 tokens per purchase
                const estimatedCostPerJob = request.analysisTypes.length * estimatedTokensPerAnalysis * 0.00025 / 1000; // Haiku pricing
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
                // Store job in DynamoDB
                await this.storeJob(job);
                // Add to SQS queue
                await this.enqueueJob(job, customer.purchases);
            }
            console.log(`✅ Created ${jobs.length} batch jobs with estimated cost: $${totalEstimatedCost.toFixed(4)}`);
            // Record batch metrics
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
        /**
         * Process batch jobs from the queue
         */
        async processBatchJobs(maxConcurrent = this.config.maxConcurrentJobs) {
            console.log(`🚀 Starting batch job processor (max concurrent: ${maxConcurrent})`);
            const activeJobs = new Set();
            while (true) {
                try {
                    // Check if we can process more jobs
                    if (activeJobs.size >= maxConcurrent) {
                        await this.sleep(this.config.pollingIntervalMs);
                        continue;
                    }
                    // Receive messages from SQS
                    const messages = await this.receiveMessages(maxConcurrent - activeJobs.size);
                    if (messages.length === 0) {
                        console.log('📭 No jobs in queue, waiting...');
                        await this.sleep(this.config.pollingIntervalMs);
                        continue;
                    }
                    // Process messages concurrently
                    for (const message of messages) {
                        const jobData = JSON.parse(message.Body || '{}');
                        activeJobs.add(jobData.jobId);
                        // Process job async
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
        /**
         * Process a single batch job
         */
        async processJob(jobData, receiptHandle) {
            const { jobId, customerId, purchases, analysisTypes, priority } = jobData;
            console.log(`🔄 Processing job ${jobId} for customer ${customerId}`);
            try {
                // Update job status to processing
                await this.updateJobStatus(jobId, 'processing');
                const results = {};
                let completedAnalyses = 0;
                // Process each analysis type for this customer
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
                    // Update progress
                    await this.updateJobProgress(jobId, progress);
                    // Small delay between analyses to avoid overwhelming the service
                    await this.sleep(100);
                }
                // Mark job as completed
                await this.completeJob(jobId, results);
                // Delete message from queue
                await this.deleteMessage(receiptHandle);
                console.log(`✅ Job ${jobId} completed successfully`);
            }
            catch (error) {
                console.error(`❌ Job ${jobId} failed:`, error);
                // Mark job as failed
                await this.failJob(jobId, error.message);
                // Delete message from queue (or could implement retry logic)
                await this.deleteMessage(receiptHandle);
            }
        }
        /**
         * Get batch job status and results
         */
        async getBatchStatus(batchId) {
            try {
                // Query all jobs for this batch
                const result = await this.dynamoClient.send(new lib_dynamodb_1.QueryCommand({
                    TableName: this.jobsTableName,
                    IndexName: 'batchId-createdAt-index',
                    KeyConditionExpression: 'begins_with(jobId, :batchId)',
                    ExpressionAttributeValues: {
                        ':batchId': batchId,
                    },
                }));
                const jobs = (result.Items || []);
                // Calculate statistics
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
        /**
         * Get queue statistics
         */
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
        // Private helper methods
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
                MessageGroupId: job.priority, // For FIFO queues
                MessageDeduplicationId: job.jobId,
            }));
        }
        async receiveMessages(maxMessages = 10) {
            const result = await this.sqsClient.send(new client_sqs_1.ReceiveMessageCommand({
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: Math.min(maxMessages, 10), // SQS limit
                WaitTimeSeconds: 5, // Long polling
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
                }, 0) / completedJobsWithTime.length / 1000 // Convert to seconds
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
    __setFunctionName(_classThis, "BatchProcessingService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BatchProcessingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BatchProcessingService = _classThis;
})();
exports.BatchProcessingService = BatchProcessingService;
