import { Construct } from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';

export interface MonitoringProps {
  config: EnvironmentConfig;
  lambdaFunction: lambda.Function;
  restApi: apigateway.RestApi;
  dynamodbTables: dynamodb.Table[];
  kinesisStreams: kinesis.Stream[];
  sqsQueues: sqs.Queue[];
}

export class MonitoringStack extends Construct {
  public readonly alertsTopic: sns.Topic;
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    const { config, lambdaFunction, restApi, dynamodbTables, kinesisStreams, sqsQueues } = props;

    // Create SNS topic for alerts
    this.alertsTopic = new sns.Topic(this, 'AlertsTopic', {
      topicName: `omnix-ai-alerts-${config.stage}`,
      displayName: `OMNIX AI Alerts - ${config.stage}`,
    });

    // Add email subscription for production alerts
    if (config.stage === 'prod' && process.env.ALERT_EMAIL) {
      this.alertsTopic.addSubscription(
        new snsSubscriptions.EmailSubscription(process.env.ALERT_EMAIL)
      );
    }

    // Create CloudWatch Dashboard
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `omnix-ai-${config.stage}`,
      defaultInterval: Duration.hours(1),
    });

    this.createLambdaAlarms(lambdaFunction);
    this.createApiGatewayAlarms(restApi);
    this.createDynamoDBAlarms(dynamodbTables);
    this.createKinesisAlarms(kinesisStreams);
    this.createSQSAlarms(sqsQueues);
    this.createCustomMetricAlarms();
    this.createDashboardWidgets(lambdaFunction, restApi, dynamodbTables, kinesisStreams, sqsQueues);
  }

  private createLambdaAlarms(lambdaFunction: lambda.Function) {
    // Lambda Error Rate Alarm
    const errorRate = new cloudwatch.Alarm(this, 'LambdaErrorRate', {
      alarmName: `OMNIX-AI-Lambda-High-Error-Rate-${this.node.scope?.node.id}`,
      alarmDescription: 'Alert when Lambda function error rate is high',
      metric: lambdaFunction.metricErrors({
        period: Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 5,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    errorRate.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));

    // Lambda Duration Alarm
    const duration = new cloudwatch.Alarm(this, 'LambdaDuration', {
      alarmName: `OMNIX-AI-Lambda-High-Duration-${this.node.scope?.node.id}`,
      alarmDescription: 'Alert when Lambda function duration is high',
      metric: lambdaFunction.metricDuration({
        period: Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 25000, // 25 seconds
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    duration.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));

    // Lambda Throttles Alarm
    const throttles = new cloudwatch.Alarm(this, 'LambdaThrottles', {
      alarmName: `OMNIX-AI-Lambda-Throttles-${this.node.scope?.node.id}`,
      alarmDescription: 'Alert when Lambda function is being throttled',
      metric: lambdaFunction.metricThrottles({
        period: Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    throttles.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));
  }

  private createApiGatewayAlarms(restApi: apigateway.RestApi) {
    // API Gateway 4XX Errors
    const api4xxErrors = new cloudwatch.Alarm(this, 'Api4xxErrors', {
      alarmName: `OMNIX-AI-API-High-4XX-Errors-${this.node.scope?.node.id}`,
      alarmDescription: 'Alert when API Gateway 4XX error rate is high',
      metric: restApi.metricClientError({
        period: Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 10,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    api4xxErrors.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));

    // API Gateway 5XX Errors
    const api5xxErrors = new cloudwatch.Alarm(this, 'Api5xxErrors', {
      alarmName: `OMNIX-AI-API-High-5XX-Errors-${this.node.scope?.node.id}`,
      alarmDescription: 'Alert when API Gateway 5XX error rate is high',
      metric: restApi.metricServerError({
        period: Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 5,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    api5xxErrors.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));

    // API Gateway Latency
    const apiLatency = new cloudwatch.Alarm(this, 'ApiLatency', {
      alarmName: `OMNIX-AI-API-High-Latency-${this.node.scope?.node.id}`,
      alarmDescription: 'Alert when API Gateway latency is high',
      metric: restApi.metricLatency({
        period: Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 5000, // 5 seconds
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    apiLatency.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));
  }

  private createDynamoDBAlarms(tables: dynamodb.Table[]) {
    tables.forEach((table, index) => {
      // DynamoDB Throttles
      const throttles = new cloudwatch.Alarm(this, `DynamoThrottles${index}`, {
        alarmName: `OMNIX-AI-DynamoDB-Throttles-${table.tableName}`,
        alarmDescription: `Alert when DynamoDB table ${table.tableName} is throttling`,
        metric: table.metricUserErrors({
          period: Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 1,
        evaluationPeriods: 2,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
      throttles.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));
    });
  }

  private createKinesisAlarms(streams: kinesis.Stream[]) {
    streams.forEach((stream, index) => {
      // Kinesis Put Records Failed
      const putRecordsFailed = new cloudwatch.Alarm(this, `KinesisPutFailed${index}`, {
        alarmName: `OMNIX-AI-Kinesis-Put-Failed-${stream.streamName}`,
        alarmDescription: `Alert when Kinesis stream ${stream.streamName} has failed put records`,
        metric: new cloudwatch.Metric({
          namespace: 'AWS/Kinesis',
          metricName: 'PutRecord.Failed',
          dimensionsMap: {
            StreamName: stream.streamName,
          },
          period: Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 5,
        evaluationPeriods: 2,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
      putRecordsFailed.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));
    });
  }

  private createSQSAlarms(queues: sqs.Queue[]) {
    queues.forEach((queue, index) => {
      // Skip DLQ alarms to avoid duplicates
      if (queue.queueName.includes('dlq')) return;

      // SQS Queue Depth
      const queueDepth = new cloudwatch.Alarm(this, `SQSQueueDepth${index}`, {
        alarmName: `OMNIX-AI-SQS-High-Queue-Depth-${queue.queueName}`,
        alarmDescription: `Alert when SQS queue ${queue.queueName} has high message count`,
        metric: queue.metricApproximateNumberOfVisibleMessages({
          period: Duration.minutes(5),
          statistic: 'Average',
        }),
        threshold: 100,
        evaluationPeriods: 3,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
      queueDepth.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));
    });
  }

  private createCustomMetricAlarms() {
    // AI Analysis Cost Alarm
    const aiCost = new cloudwatch.Alarm(this, 'AICostAlarm', {
      alarmName: `OMNIX-AI-Bedrock-High-Cost-${this.node.scope?.node.id}`,
      alarmDescription: 'Alert when AI analysis costs are high',
      metric: new cloudwatch.Metric({
        namespace: 'OMNIX-AI/Bedrock',
        metricName: 'TotalCost',
        period: Duration.hours(1),
        statistic: 'Sum',
      }),
      threshold: 100, // $100 per hour
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    aiCost.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));

    // AI Analysis Accuracy Alarm
    const aiAccuracy = new cloudwatch.Alarm(this, 'AIAccuracyAlarm', {
      alarmName: `OMNIX-AI-Low-Accuracy-${this.node.scope?.node.id}`,
      alarmDescription: 'Alert when AI analysis accuracy drops',
      metric: new cloudwatch.Metric({
        namespace: 'OMNIX-AI/Analysis',
        metricName: 'AccuracyScore',
        period: Duration.hours(1),
        statistic: 'Average',
      }),
      threshold: 0.7, // 70% accuracy threshold
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    });
    aiAccuracy.addAlarmAction(new cloudwatch.SnsAction(this.alertsTopic));
  }

  private createDashboardWidgets(
    lambdaFunction: lambda.Function,
    restApi: apigateway.RestApi,
    dynamodbTables: dynamodb.Table[],
    kinesisStreams: kinesis.Stream[],
    sqsQueues: sqs.Queue[]
  ) {
    // Lambda Performance Widget
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Lambda Performance',
        left: [
          lambdaFunction.metricInvocations({ label: 'Invocations' }),
          lambdaFunction.metricErrors({ label: 'Errors' }),
          lambdaFunction.metricThrottles({ label: 'Throttles' }),
        ],
        right: [
          lambdaFunction.metricDuration({ label: 'Duration (ms)' }),
        ],
        width: 12,
        height: 6,
      })
    );

    // API Gateway Performance Widget
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway Performance',
        left: [
          restApi.metricCount({ label: 'Request Count' }),
          restApi.metricClientError({ label: '4XX Errors' }),
          restApi.metricServerError({ label: '5XX Errors' }),
        ],
        right: [
          restApi.metricLatency({ label: 'Latency (ms)' }),
        ],
        width: 12,
        height: 6,
      })
    );

    // DynamoDB Performance Widget
    if (dynamodbTables.length > 0) {
      this.dashboard.addWidgets(
        new cloudwatch.GraphWidget({
          title: 'DynamoDB Performance',
          left: dynamodbTables.slice(0, 3).map((table, i) => 
            table.metricConsumedReadCapacityUnits({ label: `Read Capacity ${i + 1}` })
          ),
          right: dynamodbTables.slice(0, 3).map((table, i) => 
            table.metricConsumedWriteCapacityUnits({ label: `Write Capacity ${i + 1}` })
          ),
          width: 12,
          height: 6,
        })
      );
    }

    // Kinesis Performance Widget
    if (kinesisStreams.length > 0) {
      this.dashboard.addWidgets(
        new cloudwatch.GraphWidget({
          title: 'Kinesis Streams Performance',
          left: kinesisStreams.map((stream, i) => 
            new cloudwatch.Metric({
              namespace: 'AWS/Kinesis',
              metricName: 'IncomingRecords',
              dimensionsMap: { StreamName: stream.streamName },
              label: `Incoming Records ${i + 1}`,
            })
          ),
          right: kinesisStreams.map((stream, i) => 
            new cloudwatch.Metric({
              namespace: 'AWS/Kinesis',
              metricName: 'OutgoingRecords',
              dimensionsMap: { StreamName: stream.streamName },
              label: `Outgoing Records ${i + 1}`,
            })
          ),
          width: 12,
          height: 6,
        })
      );
    }

    // SQS Performance Widget
    if (sqsQueues.length > 0) {
      this.dashboard.addWidgets(
        new cloudwatch.GraphWidget({
          title: 'SQS Queues Performance',
          left: sqsQueues.filter(q => !q.queueName.includes('dlq')).map((queue, i) => 
            queue.metricApproximateNumberOfVisibleMessages({ label: `Queue Depth ${i + 1}` })
          ),
          right: sqsQueues.filter(q => !q.queueName.includes('dlq')).map((queue, i) => 
            queue.metricNumberOfMessagesSent({ label: `Messages Sent ${i + 1}` })
          ),
          width: 12,
          height: 6,
        })
      );
    }

    // Custom Metrics Widget
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'AI Analysis Metrics',
        left: [
          new cloudwatch.Metric({
            namespace: 'OMNIX-AI/Bedrock',
            metricName: 'RequestCount',
            label: 'AI Requests',
          }),
          new cloudwatch.Metric({
            namespace: 'OMNIX-AI/Analysis',
            metricName: 'SuccessRate',
            label: 'Success Rate',
          }),
        ],
        right: [
          new cloudwatch.Metric({
            namespace: 'OMNIX-AI/Bedrock',
            metricName: 'TotalCost',
            label: 'Cost ($)',
          }),
          new cloudwatch.Metric({
            namespace: 'OMNIX-AI/Analysis',
            metricName: 'AccuracyScore',
            label: 'Accuracy Score',
          }),
        ],
        width: 12,
        height: 6,
      })
    );
  }
}