import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, GetQueueAttributesCommand } from '@aws-sdk/client-sqs';
import { BedrockAnalysisService } from './bedrock.service';
import { MonitoringService } from './monitoring.service';
import { CostAnalyticsService } from './cost-analytics.service';
import { BedrockAnalysisRequest, AIAnalysisResult } from '../interfaces/ai-analysis.interface';
import { BatchJob, BatchRequest, BatchStats, BatchStatusResponse, QueueStats } from '../interfaces/batch-processing.interface';
import * as crypto from 'crypto';

@Injectable()
export class BatchProcessingService {
  private dynamoClient: DynamoDBDocumentClient;
  private sqsClient: SQSClient;
  private bedrockService: BedrockAnalysisService;
  private monitoring: MonitoringService;
  private costAnalytics: CostAnalyticsService;
  
  private readonly jobsTableName = 'omnix-ai-batch-jobs-dev';
  private readonly queueUrl = process.env.BATCH_QUEUE_URL || 'https://sqs.eu-central-1.amazonaws.com/631844602411/omnix-ai-batch-queue-dev';
  
  // Batch processing configuration
  private readonly config = {
    maxConcurrentJobs: 50,
    defaultBatchSize: 10,
    maxRetries: 3,
    jobTimeoutMinutes: 30,
    pollingIntervalMs: 5000,
  };

  constructor() {
    this.monitoring = new MonitoringService();
    this.costAnalytics = new CostAnalyticsService();
    this.bedrockService = new BedrockAnalysisService();
    
    const region = process.env.AWS_REGION || 'eu-central-1';
    
    const clientConfig: any = { region };

    if (!process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    const dynamoClient = new DynamoDBClient(clientConfig);
    this.dynamoClient = DynamoDBDocumentClient.from(dynamoClient);
    this.sqsClient = new SQSClient(clientConfig);
    
    console.log('⚡ Batch Processing Service initialized');
  }

  /**
   * Submit a batch analysis request for multiple customers
   */
  async submitBatchRequest(request: BatchRequest): Promise<{ batchId: string; jobCount: number; estimatedCost: number }> {
    const batchId = `batch-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
    const jobs: BatchJob[] = [];
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
      
      const job: BatchJob = {
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
  async processBatchJobs(maxConcurrent: number = this.config.maxConcurrentJobs): Promise<void> {
    console.log(`🚀 Starting batch job processor (max concurrent: ${maxConcurrent})`);
    
    const activeJobs = new Set<string>();
    
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
          this.processJob(jobData, message.ReceiptHandle!)
            .then(() => activeJobs.delete(jobData.jobId))
            .catch((error) => {
              console.error(`❌ Job ${jobData.jobId} failed:`, error);
              activeJobs.delete(jobData.jobId);
            });
        }
        
      } catch (error) {
        console.error('❌ Batch processing error:', error);
        await this.sleep(this.config.pollingIntervalMs);
      }
    }
  }

  /**
   * Process a single batch job
   */
  private async processJob(jobData: any, receiptHandle: string): Promise<void> {
    const { jobId, customerId, purchases, analysisTypes, priority } = jobData;
    
    console.log(`🔄 Processing job ${jobId} for customer ${customerId}`);

    try {
      // Update job status to processing
      await this.updateJobStatus(jobId, 'processing');

      const results: { [analysisType: string]: AIAnalysisResult } = {};
      let completedAnalyses = 0;

      // Process each analysis type for this customer
      for (const analysisType of analysisTypes) {
        const request: BedrockAnalysisRequest = {
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

    } catch (error) {
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
  async getBatchStatus(batchId: string): Promise<BatchStatusResponse> {
    try {
      // Query all jobs for this batch
      const result = await this.dynamoClient.send(new QueryCommand({
        TableName: this.jobsTableName,
        IndexName: 'batchId-createdAt-index',
        KeyConditionExpression: 'begins_with(jobId, :batchId)',
        ExpressionAttributeValues: {
          ':batchId': batchId,
        },
      }));

      const jobs: BatchJob[] = (result.Items || []) as BatchJob[];
      
      // Calculate statistics
      const stats = this.calculateBatchStats(jobs);

      return {
        batchId,
        stats,
        jobs,
      };
    } catch (error) {
      console.error(`❌ Failed to get batch status for ${batchId}:`, error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    try {
      const result = await this.sqsClient.send(new GetQueueAttributesCommand({
        QueueUrl: this.queueUrl,
        AttributeNames: ['All'],
      }));

      const attributes = result.Attributes || {};

      return {
        approximateNumberOfMessages: parseInt(attributes['ApproximateNumberOfMessages'] || '0'),
        approximateNumberOfMessagesNotVisible: parseInt(attributes['ApproximateNumberOfMessagesNotVisible'] || '0'),
        approximateAgeOfOldestMessage: parseInt(attributes['ApproximateAgeOfOldestMessage'] || '0'),
      };
    } catch (error) {
      console.error('❌ Failed to get queue stats:', error);
      return {
        approximateNumberOfMessages: 0,
        approximateNumberOfMessagesNotVisible: 0,
        approximateAgeOfOldestMessage: 0,
      };
    }
  }

  // Private helper methods
  private async storeJob(job: BatchJob): Promise<void> {
    await this.dynamoClient.send(new PutCommand({
      TableName: this.jobsTableName,
      Item: job,
    }));
  }

  private async enqueueJob(job: BatchJob, purchases: any[]): Promise<void> {
    const messageBody = JSON.stringify({
      jobId: job.jobId,
      customerId: job.customerId,
      purchases,
      analysisTypes: job.analysisTypes,
      priority: job.priority,
    });

    await this.sqsClient.send(new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: messageBody,
      MessageGroupId: job.priority, // For FIFO queues
      MessageDeduplicationId: job.jobId,
    }));
  }

  private async receiveMessages(maxMessages: number = 10): Promise<any[]> {
    const result = await this.sqsClient.send(new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: Math.min(maxMessages, 10), // SQS limit
      WaitTimeSeconds: 5, // Long polling
      VisibilityTimeout: this.config.jobTimeoutMinutes * 60,
    }));

    return result.Messages || [];
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    await this.sqsClient.send(new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    }));
  }

  private async updateJobStatus(jobId: string, status: BatchJob['status']): Promise<void> {
    const updateData: any = {
      status,
    };

    if (status === 'processing') {
      updateData.startedAt = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date().toISOString();
    }

    await this.dynamoClient.send(new UpdateCommand({
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

  private async updateJobProgress(jobId: string, progress: number): Promise<void> {
    await this.dynamoClient.send(new UpdateCommand({
      TableName: this.jobsTableName,
      Key: { jobId },
      UpdateExpression: 'SET progress = :progress',
      ExpressionAttributeValues: {
        ':progress': progress,
      },
    }));
  }

  private async completeJob(jobId: string, results: { [analysisType: string]: AIAnalysisResult }): Promise<void> {
    await this.dynamoClient.send(new UpdateCommand({
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

  private async failJob(jobId: string, error: string): Promise<void> {
    await this.dynamoClient.send(new UpdateCommand({
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

  private calculateBatchStats(jobs: BatchJob[]): BatchStats {
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const failedJobs = jobs.filter(j => j.status === 'failed').length;
    const queuedJobs = jobs.filter(j => j.status === 'queued').length;
    const processingJobs = jobs.filter(j => j.status === 'processing').length;
    
    const completedJobsWithTime = jobs.filter(j => j.status === 'completed' && j.startedAt && j.completedAt);
    const averageProcessingTime = completedJobsWithTime.length > 0 
      ? completedJobsWithTime.reduce((sum, job) => {
          const start = new Date(job.startedAt!).getTime();
          const end = new Date(job.completedAt!).getTime();
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

  private async recordBatchMetrics(metrics: {
    batchId: string;
    jobCount: number;
    totalCost: number;
    analysisTypes: string[];
  }): Promise<void> {
    try {
      await this.monitoring.recordBusinessMetric(
        'BatchJobsSubmitted',
        metrics.jobCount,
        'Count',
        [{ name: 'BatchId', value: metrics.batchId }]
      );

      await this.monitoring.recordBusinessMetric(
        'BatchEstimatedCost',
        metrics.totalCost,
        'None',
        [{ name: 'BatchId', value: metrics.batchId }]
      );
    } catch (error) {
      console.error('❌ Failed to record batch metrics:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}