import { Construct } from 'constructs';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as kinesisAnalytics from 'aws-cdk-lib/aws-kinesisanalytics';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Duration } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';

export interface KinesisStreamsProps {
  config: EnvironmentConfig;
  lambdaFunction?: lambda.Function;
}

export class KinesisStreams extends Construct {
  public readonly customerEventsStream: kinesis.Stream;
  public readonly analyticsStream: kinesis.Stream;
  public readonly analyticsApplication?: kinesisAnalytics.CfnApplication;

  constructor(scope: Construct, id: string, props: KinesisStreamsProps) {
    super(scope, id);

    const { config, lambdaFunction } = props;

    // Customer Events Stream - Primary stream for real-time customer events
    this.customerEventsStream = new kinesis.Stream(this, 'CustomerEventsStream', {
      streamName: `omnix-ai-customer-events-${config.stage}`,
      shardCount: config.kinesisShardCount,
      retentionPeriod: Duration.days(1), // 24-hour retention
      encryption: kinesis.StreamEncryption.AWS_MANAGED,
    });

    // Analytics Stream - Processed events for dashboard consumption
    this.analyticsStream = new kinesis.Stream(this, 'AnalyticsStream', {
      streamName: `omnix-ai-analytics-${config.stage}`,
      shardCount: Math.max(1, Math.floor(config.kinesisShardCount / 2)),
      retentionPeriod: Duration.hours(12), // 12-hour retention for processed data
      encryption: kinesis.StreamEncryption.AWS_MANAGED,
    });

    // Add Lambda as event source for customer events stream if provided
    if (lambdaFunction) {
      lambdaFunction.addEventSource(
        new lambdaEventSources.KinesisEventSource(this.customerEventsStream, {
          startingPosition: lambda.StartingPosition.LATEST,
          batchSize: 100,
          maxBatchingWindow: Duration.seconds(5),
          retryAttempts: 3,
          parallelizationFactor: 10,
          reportBatchItemFailures: true,
        })
      );

      // Grant Lambda permissions to read from streams
      this.customerEventsStream.grantRead(lambdaFunction);
      this.analyticsStream.grantRead(lambdaFunction);
      
      // Grant Lambda permissions to write to analytics stream
      this.analyticsStream.grantWrite(lambdaFunction);
    }

    // Kinesis Analytics Application for real-time processing (Production only)
    if (config.stage === 'prod' || config.stage === 'staging') {
      const analyticsRole = new iam.Role(this, 'AnalyticsRole', {
        assumedBy: new iam.ServicePrincipal('kinesisanalytics.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/KinesisAnalyticsServiceRole'),
        ],
      });

      // Grant permissions to read from input stream and write to output stream
      this.customerEventsStream.grantRead(analyticsRole);
      this.analyticsStream.grantWrite(analyticsRole);

      this.analyticsApplication = new kinesisAnalytics.CfnApplication(this, 'AnalyticsApp', {
        applicationName: `omnix-ai-analytics-${config.stage}`,
        applicationDescription: 'Real-time analytics processing for OMNIX AI',
        serviceExecutionRole: analyticsRole.roleArn,
        runtimeEnvironment: 'FLINK-1_15',
        applicationConfiguration: {
          applicationCodeConfiguration: {
            codeContent: {
              textContent: this.getFlinkSqlQuery(),
            },
            codeContentType: 'PLAINTEXT',
          },
          flinkApplicationConfiguration: {
            checkpointConfiguration: {
              configurationType: 'CUSTOM',
              checkpointingEnabled: true,
              checkpointInterval: 60000, // 1 minute
              minPauseBetweenCheckpoints: 5000,
            },
            monitoringConfiguration: {
              configurationType: 'CUSTOM',
              logLevel: 'INFO',
              metricsLevel: 'APPLICATION',
            },
            parallelismConfiguration: {
              configurationType: 'CUSTOM',
              parallelism: config.kinesisShardCount,
              parallelismPerKpu: 1,
              autoScalingEnabled: true,
            },
          },
        },
      });
    }
  }

  private getFlinkSqlQuery(): string {
    return `
-- Real-time analytics processing for OMNIX AI customer events
CREATE TABLE customer_events (
  eventId VARCHAR(50),
  eventType VARCHAR(30),
  customerId VARCHAR(50),
  productId VARCHAR(50),
  timestamp BIGINT,
  metadata ROW<
    amount DECIMAL(10,2),
    category VARCHAR(50),
    segmentId VARCHAR(20)
  >,
  eventTime AS TO_TIMESTAMP(FROM_UNIXTIME(timestamp)),
  WATERMARK FOR eventTime AS eventTime - INTERVAL '5' SECOND
) WITH (
  'connector' = 'kinesis',
  'stream' = 'omnix-ai-customer-events-\${stage}',
  'aws.region' = '\${region}',
  'scan.stream.initpos' = 'LATEST',
  'format' = 'json'
);

CREATE TABLE analytics_output (
  windowStart TIMESTAMP(3),
  windowEnd TIMESTAMP(3),
  eventType VARCHAR(30),
  segmentId VARCHAR(20),
  eventCount BIGINT,
  totalAmount DECIMAL(15,2),
  avgAmount DECIMAL(10,2),
  uniqueCustomers BIGINT
) WITH (
  'connector' = 'kinesis',
  'stream' = 'omnix-ai-analytics-\${stage}',
  'aws.region' = '\${region}',
  'format' = 'json'
);

-- Aggregate events by segment and type in 1-minute tumbling windows
INSERT INTO analytics_output
SELECT 
  TUMBLE_START(eventTime, INTERVAL '1' MINUTE) as windowStart,
  TUMBLE_END(eventTime, INTERVAL '1' MINUTE) as windowEnd,
  eventType,
  COALESCE(metadata.segmentId, 'unknown') as segmentId,
  COUNT(*) as eventCount,
  COALESCE(SUM(metadata.amount), 0) as totalAmount,
  COALESCE(AVG(metadata.amount), 0) as avgAmount,
  COUNT(DISTINCT customerId) as uniqueCustomers
FROM customer_events
GROUP BY 
  TUMBLE(eventTime, INTERVAL '1' MINUTE),
  eventType,
  metadata.segmentId;
    `.trim();
  }
}