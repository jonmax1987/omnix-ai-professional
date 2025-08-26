import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';
import { KinesisStreams } from '../constructs/kinesis-streams';
import { SQSQueues } from '../constructs/sqs-queues';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface StreamingStackProps extends StackProps {
  config: EnvironmentConfig;
  lambdaFunction?: lambda.Function;
}

export class StreamingStack extends Stack {
  public readonly kinesisStreams: KinesisStreams;
  public readonly sqsQueues: SQSQueues;

  constructor(scope: Construct, id: string, props: StreamingStackProps) {
    super(scope, id, props);

    const { config, lambdaFunction } = props;

    // Create Kinesis Streams
    this.kinesisStreams = new KinesisStreams(this, 'KinesisStreams', {
      config,
      lambdaFunction,
    });

    // Create SQS Queues
    this.sqsQueues = new SQSQueues(this, 'SQSQueues', {
      config,
      lambdaFunction,
    });

    // Update Lambda environment with streaming resources if provided
    if (lambdaFunction) {
      lambdaFunction.addEnvironment('KINESIS_CUSTOMER_EVENTS_STREAM', this.kinesisStreams.customerEventsStream.streamName);
      lambdaFunction.addEnvironment('KINESIS_ANALYTICS_STREAM', this.kinesisStreams.analyticsStream.streamName);
      lambdaFunction.addEnvironment('SQS_AI_ANALYSIS_QUEUE', this.sqsQueues.aiAnalysisQueue.queueUrl);
      lambdaFunction.addEnvironment('SQS_BATCH_PROCESSING_QUEUE', this.sqsQueues.batchProcessingQueue.queueUrl);
      lambdaFunction.addEnvironment('SQS_NOTIFICATION_QUEUE', this.sqsQueues.notificationQueue.queueUrl);
      lambdaFunction.addEnvironment('SQS_SEGMENTATION_QUEUE', this.sqsQueues.segmentationQueue.queueUrl);
    }

    // Stack Outputs - Kinesis Streams
    new CfnOutput(this, 'CustomerEventsStreamName', {
      value: this.kinesisStreams.customerEventsStream.streamName,
      description: 'Kinesis Customer Events Stream Name',
      exportName: `${config.stage}-omnix-ai-customer-events-stream-name`,
    });

    new CfnOutput(this, 'CustomerEventsStreamArn', {
      value: this.kinesisStreams.customerEventsStream.streamArn,
      description: 'Kinesis Customer Events Stream ARN',
      exportName: `${config.stage}-omnix-ai-customer-events-stream-arn`,
    });

    new CfnOutput(this, 'AnalyticsStreamName', {
      value: this.kinesisStreams.analyticsStream.streamName,
      description: 'Kinesis Analytics Stream Name',
      exportName: `${config.stage}-omnix-ai-analytics-stream-name`,
    });

    new CfnOutput(this, 'AnalyticsStreamArn', {
      value: this.kinesisStreams.analyticsStream.streamArn,
      description: 'Kinesis Analytics Stream ARN',
      exportName: `${config.stage}-omnix-ai-analytics-stream-arn`,
    });

    // Kinesis Analytics Application Output (if created)
    if (this.kinesisStreams.analyticsApplication) {
      new CfnOutput(this, 'AnalyticsApplicationName', {
        value: this.kinesisStreams.analyticsApplication.applicationName || '',
        description: 'Kinesis Analytics Application Name',
        exportName: `${config.stage}-omnix-ai-analytics-app-name`,
      });
    }

    // Stack Outputs - SQS Queues
    const queueOutputs = [
      { name: 'AIAnalysisQueue', queue: this.sqsQueues.aiAnalysisQueue },
      { name: 'BatchProcessingQueue', queue: this.sqsQueues.batchProcessingQueue },
      { name: 'NotificationQueue', queue: this.sqsQueues.notificationQueue },
      { name: 'SegmentationQueue', queue: this.sqsQueues.segmentationQueue },
    ];

    queueOutputs.forEach(({ name, queue }) => {
      new CfnOutput(this, `${name}Url`, {
        value: queue.queueUrl,
        description: `${name} URL`,
        exportName: `${config.stage}-omnix-ai-${name.toLowerCase()}-url`,
      });

      new CfnOutput(this, `${name}Arn`, {
        value: queue.queueArn,
        description: `${name} ARN`,
        exportName: `${config.stage}-omnix-ai-${name.toLowerCase()}-arn`,
      });
    });

    // Dead Letter Queue Outputs
    const dlqOutputs = [
      { name: 'AIAnalysisDLQ', queue: this.sqsQueues.aiAnalysisDLQ },
      { name: 'BatchProcessingDLQ', queue: this.sqsQueues.batchProcessingDLQ },
      { name: 'NotificationDLQ', queue: this.sqsQueues.notificationDLQ },
      { name: 'SegmentationDLQ', queue: this.sqsQueues.segmentationDLQ },
    ];

    dlqOutputs.forEach(({ name, queue }) => {
      new CfnOutput(this, `${name}Url`, {
        value: queue.queueUrl,
        description: `${name} URL`,
        exportName: `${config.stage}-omnix-ai-${name.toLowerCase()}-url`,
      });

      new CfnOutput(this, `${name}Arn`, {
        value: queue.queueArn,
        description: `${name} ARN`,
        exportName: `${config.stage}-omnix-ai-${name.toLowerCase()}-arn`,
      });
    });
  }
}