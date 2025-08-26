import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Duration } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';

export interface SQSQueuesProps {
  config: EnvironmentConfig;
  lambdaFunction?: lambda.Function;
}

export class SQSQueues extends Construct {
  public readonly aiAnalysisQueue: sqs.Queue;
  public readonly aiAnalysisDLQ: sqs.Queue;
  public readonly batchProcessingQueue: sqs.Queue;
  public readonly batchProcessingDLQ: sqs.Queue;
  public readonly notificationQueue: sqs.Queue;
  public readonly notificationDLQ: sqs.Queue;
  public readonly segmentationQueue: sqs.Queue;
  public readonly segmentationDLQ: sqs.Queue;

  constructor(scope: Construct, id: string, props: SQSQueuesProps) {
    super(scope, id);

    const { config, lambdaFunction } = props;

    // AI Analysis Queue - For queueing AI analysis requests
    this.aiAnalysisDLQ = new sqs.Queue(this, 'AIAnalysisDLQ', {
      queueName: `omnix-ai-analysis-dlq-${config.stage}`,
      retentionPeriod: Duration.days(14),
    });

    this.aiAnalysisQueue = new sqs.Queue(this, 'AIAnalysisQueue', {
      queueName: `omnix-ai-analysis-${config.stage}`,
      visibilityTimeout: Duration.seconds(300), // 5 minutes for AI processing
      messageRetentionPeriod: Duration.days(4),
      deadLetterQueue: {
        queue: this.aiAnalysisDLQ,
        maxReceiveCount: 3,
      },
      receiveMessageWaitTime: Duration.seconds(20), // Long polling
    });

    // Batch Processing Queue - For large batch operations
    this.batchProcessingDLQ = new sqs.Queue(this, 'BatchProcessingDLQ', {
      queueName: `omnix-ai-batch-dlq-${config.stage}`,
      retentionPeriod: Duration.days(14),
    });

    this.batchProcessingQueue = new sqs.Queue(this, 'BatchProcessingQueue', {
      queueName: `omnix-ai-batch-${config.stage}`,
      visibilityTimeout: Duration.seconds(900), // 15 minutes for batch processing
      messageRetentionPeriod: Duration.days(7),
      deadLetterQueue: {
        queue: this.batchProcessingDLQ,
        maxReceiveCount: 2,
      },
      receiveMessageWaitTime: Duration.seconds(20),
    });

    // Notification Queue - For sending alerts and notifications
    this.notificationDLQ = new sqs.Queue(this, 'NotificationDLQ', {
      queueName: `omnix-ai-notifications-dlq-${config.stage}`,
      retentionPeriod: Duration.days(7),
    });

    this.notificationQueue = new sqs.Queue(this, 'NotificationQueue', {
      queueName: `omnix-ai-notifications-${config.stage}`,
      visibilityTimeout: Duration.seconds(60),
      messageRetentionPeriod: Duration.days(2),
      deadLetterQueue: {
        queue: this.notificationDLQ,
        maxReceiveCount: 5,
      },
      receiveMessageWaitTime: Duration.seconds(10),
    });

    // Customer Segmentation Queue - For processing customer segmentation updates
    this.segmentationDLQ = new sqs.Queue(this, 'SegmentationDLQ', {
      queueName: `omnix-ai-segmentation-dlq-${config.stage}`,
      retentionPeriod: Duration.days(14),
    });

    this.segmentationQueue = new sqs.Queue(this, 'SegmentationQueue', {
      queueName: `omnix-ai-segmentation-${config.stage}`,
      visibilityTimeout: Duration.seconds(180), // 3 minutes for segmentation processing
      messageRetentionPeriod: Duration.days(4),
      deadLetterQueue: {
        queue: this.segmentationDLQ,
        maxReceiveCount: 3,
      },
      receiveMessageWaitTime: Duration.seconds(20),
    });

    // Add Lambda event sources if Lambda function is provided
    if (lambdaFunction) {
      // AI Analysis Queue event source
      lambdaFunction.addEventSource(
        new lambdaEventSources.SqsEventSource(this.aiAnalysisQueue, {
          batchSize: 10,
          maxBatchingWindow: Duration.seconds(5),
          reportBatchItemFailures: true,
        })
      );

      // Batch Processing Queue event source
      lambdaFunction.addEventSource(
        new lambdaEventSources.SqsEventSource(this.batchProcessingQueue, {
          batchSize: 1, // Process one batch job at a time
          maxBatchingWindow: Duration.seconds(0),
          reportBatchItemFailures: true,
        })
      );

      // Notification Queue event source
      lambdaFunction.addEventSource(
        new lambdaEventSources.SqsEventSource(this.notificationQueue, {
          batchSize: 25,
          maxBatchingWindow: Duration.seconds(10),
          reportBatchItemFailures: true,
        })
      );

      // Segmentation Queue event source
      lambdaFunction.addEventSource(
        new lambdaEventSources.SqsEventSource(this.segmentationQueue, {
          batchSize: 5,
          maxBatchingWindow: Duration.seconds(10),
          reportBatchItemFailures: true,
        })
      );

      // Grant Lambda permissions to consume from queues
      this.aiAnalysisQueue.grantConsumeMessages(lambdaFunction);
      this.batchProcessingQueue.grantConsumeMessages(lambdaFunction);
      this.notificationQueue.grantConsumeMessages(lambdaFunction);
      this.segmentationQueue.grantConsumeMessages(lambdaFunction);

      // Grant Lambda permissions to send messages to queues (for enqueueing)
      this.aiAnalysisQueue.grantSendMessages(lambdaFunction);
      this.batchProcessingQueue.grantSendMessages(lambdaFunction);
      this.notificationQueue.grantSendMessages(lambdaFunction);
      this.segmentationQueue.grantSendMessages(lambdaFunction);
    }
  }
}