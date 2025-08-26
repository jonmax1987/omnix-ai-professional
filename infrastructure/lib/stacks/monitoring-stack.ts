import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';
import { MonitoringStack as MonitoringConstruct } from '../constructs/monitoring';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib';

export interface MonitoringStackProps extends StackProps {
  config: EnvironmentConfig;
  lambdaFunction: lambda.Function;
  restApi: apigateway.RestApi;
  dynamodbTables: dynamodb.Table[];
  kinesisStreams: kinesis.Stream[];
  sqsQueues: sqs.Queue[];
}

export class MonitoringStack extends Stack {
  public readonly monitoring: MonitoringConstruct;
  public readonly eventBus: events.EventBridge;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const { config, lambdaFunction, restApi, dynamodbTables, kinesisStreams, sqsQueues } = props;

    // Create EventBridge custom event bus
    this.eventBus = new events.EventBridge(this, 'EventBus', {
      eventBusName: `omnix-ai-events-${config.stage}`,
    });

    // Grant Lambda permissions to put events
    this.eventBus.grantPutEventsTo(lambdaFunction);

    // Create monitoring construct
    this.monitoring = new MonitoringConstruct(this, 'Monitoring', {
      config,
      lambdaFunction,
      restApi,
      dynamodbTables,
      kinesisStreams,
      sqsQueues,
    });

    // Create EventBridge rules for automated responses
    this.createEventBridgeRules(lambdaFunction);

    // Create scheduled events for maintenance tasks
    this.createScheduledEvents(lambdaFunction);

    // Update Lambda environment with monitoring resources
    lambdaFunction.addEnvironment('SNS_ALERTS_TOPIC_ARN', this.monitoring.alertsTopic.topicArn);
    lambdaFunction.addEnvironment('EVENTBRIDGE_BUS_NAME', this.eventBus.eventBusName);
    lambdaFunction.addEnvironment('CLOUDWATCH_DASHBOARD_NAME', this.monitoring.dashboard.dashboardName);

    // Grant Lambda permissions to publish to SNS
    this.monitoring.alertsTopic.grantPublish(lambdaFunction);

    // Stack Outputs
    new CfnOutput(this, 'AlertsTopicArn', {
      value: this.monitoring.alertsTopic.topicArn,
      description: 'SNS Alerts Topic ARN',
      exportName: `${config.stage}-omnix-ai-alerts-topic-arn`,
    });

    new CfnOutput(this, 'DashboardUrl', {
      value: `https://${config.region}.console.aws.amazon.com/cloudwatch/home?region=${config.region}#dashboards:name=${this.monitoring.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
      exportName: `${config.stage}-omnix-ai-dashboard-url`,
    });

    new CfnOutput(this, 'EventBusName', {
      value: this.eventBus.eventBusName,
      description: 'EventBridge Custom Event Bus Name',
      exportName: `${config.stage}-omnix-ai-eventbus-name`,
    });

    new CfnOutput(this, 'EventBusArn', {
      value: this.eventBus.eventBusArn,
      description: 'EventBridge Custom Event Bus ARN',
      exportName: `${config.stage}-omnix-ai-eventbus-arn`,
    });
  }

  private createEventBridgeRules(lambdaFunction: lambda.Function) {
    // Rule for high-priority customer events
    const highPriorityCustomerRule = new events.Rule(this, 'HighPriorityCustomerRule', {
      eventBus: this.eventBus,
      ruleName: `omnix-ai-high-priority-customer-${this.stackName}`,
      description: 'Route high-priority customer events for immediate processing',
      eventPattern: {
        source: ['omnix-ai.customers'],
        detailType: ['Customer Segment Change', 'High-Value Purchase', 'Churn Risk Alert'],
        detail: {
          priority: ['high', 'critical'],
        },
      },
    });

    highPriorityCustomerRule.addTarget(new targets.LambdaFunction(lambdaFunction, {
      event: events.RuleTargetInput.fromObject({
        eventType: 'high-priority-customer',
        source: events.EventField.fromPath('$.source'),
        detailType: events.EventField.fromPath('$.detail-type'),
        detail: events.EventField.fromPath('$.detail'),
        timestamp: events.EventField.fromPath('$.time'),
      }),
    }));

    // Rule for AI analysis completion events
    const aiAnalysisRule = new events.Rule(this, 'AIAnalysisRule', {
      eventBus: this.eventBus,
      ruleName: `omnix-ai-analysis-complete-${this.stackName}`,
      description: 'Process completed AI analysis results',
      eventPattern: {
        source: ['omnix-ai.bedrock'],
        detailType: ['AI Analysis Complete', 'Prediction Generated', 'Segmentation Updated'],
      },
    });

    aiAnalysisRule.addTarget(new targets.LambdaFunction(lambdaFunction, {
      event: events.RuleTargetInput.fromObject({
        eventType: 'ai-analysis-complete',
        source: events.EventField.fromPath('$.source'),
        detailType: events.EventField.fromPath('$.detail-type'),
        detail: events.EventField.fromPath('$.detail'),
        timestamp: events.EventField.fromPath('$.time'),
      }),
    }));

    // Rule for cost threshold alerts
    const costAlertRule = new events.Rule(this, 'CostAlertRule', {
      eventBus: this.eventBus,
      ruleName: `omnix-ai-cost-alert-${this.stackName}`,
      description: 'Handle cost threshold alerts and optimization triggers',
      eventPattern: {
        source: ['omnix-ai.cost'],
        detailType: ['Cost Threshold Exceeded', 'Budget Alert', 'Optimization Required'],
      },
    });

    costAlertRule.addTarget(new targets.LambdaFunction(lambdaFunction, {
      event: events.RuleTargetInput.fromObject({
        eventType: 'cost-alert',
        source: events.EventField.fromPath('$.source'),
        detailType: events.EventField.fromPath('$.detail-type'),
        detail: events.EventField.fromPath('$.detail'),
        timestamp: events.EventField.fromPath('$.time'),
      }),
    }));

    // Rule for system health events
    const systemHealthRule = new events.Rule(this, 'SystemHealthRule', {
      eventBus: this.eventBus,
      ruleName: `omnix-ai-system-health-${this.stackName}`,
      description: 'Monitor system health and trigger automated responses',
      eventPattern: {
        source: ['omnix-ai.system'],
        detailType: ['Health Check Failed', 'Performance Degraded', 'Resource Exhausted'],
      },
    });

    systemHealthRule.addTarget(new targets.LambdaFunction(lambdaFunction, {
      event: events.RuleTargetInput.fromObject({
        eventType: 'system-health',
        source: events.EventField.fromPath('$.source'),
        detailType: events.EventField.fromPath('$.detail-type'),
        detail: events.EventField.fromPath('$.detail'),
        timestamp: events.EventField.fromPath('$.time'),
      }),
    }));

    // Grant EventBridge permissions to invoke Lambda
    lambdaFunction.addPermission('EventBridgeInvoke', {
      principal: new iam.ServicePrincipal('events.amazonaws.com'),
      sourceArn: `arn:aws:events:${this.region}:${this.account}:rule/${this.eventBus.eventBusName}/*`,
    });
  }

  private createScheduledEvents(lambdaFunction: lambda.Function) {
    // Daily cleanup job
    const dailyCleanup = new events.Rule(this, 'DailyCleanupRule', {
      ruleName: `omnix-ai-daily-cleanup-${this.stackName}`,
      description: 'Daily cleanup of expired data and cache',
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '2', // 2 AM UTC
        day: '*',
        month: '*',
        year: '*',
      }),
    });

    dailyCleanup.addTarget(new targets.LambdaFunction(lambdaFunction, {
      event: events.RuleTargetInput.fromObject({
        eventType: 'scheduled-cleanup',
        action: 'daily-cleanup',
        timestamp: events.EventField.fromPath('$.time'),
      }),
    }));

    // Weekly cost analysis report
    const weeklyCostReport = new events.Rule(this, 'WeeklyCostReportRule', {
      ruleName: `omnix-ai-weekly-cost-report-${this.stackName}`,
      description: 'Weekly cost analysis and optimization report',
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '8', // 8 AM UTC on Mondays
        day: '?',
        month: '*',
        year: '*',
        weekDay: 'MON',
      }),
    });

    weeklyCostReport.addTarget(new targets.LambdaFunction(lambdaFunction, {
      event: events.RuleTargetInput.fromObject({
        eventType: 'scheduled-report',
        action: 'weekly-cost-analysis',
        timestamp: events.EventField.fromPath('$.time'),
      }),
    }));

    // Monthly customer segmentation refresh
    const monthlySegmentation = new events.Rule(this, 'MonthlySegmentationRule', {
      ruleName: `omnix-ai-monthly-segmentation-${this.stackName}`,
      description: 'Monthly full customer segmentation refresh',
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '6', // 6 AM UTC on the 1st of each month
        day: '1',
        month: '*',
        year: '*',
      }),
    });

    monthlySegmentation.addTarget(new targets.LambdaFunction(lambdaFunction, {
      event: events.RuleTargetInput.fromObject({
        eventType: 'scheduled-maintenance',
        action: 'monthly-segmentation-refresh',
        timestamp: events.EventField.fromPath('$.time'),
      }),
    }));

    // Hourly health check (production only)
    if (this.node.scope?.node.id === 'prod') {
      const hourlyHealthCheck = new events.Rule(this, 'HourlyHealthCheckRule', {
        ruleName: `omnix-ai-hourly-health-${this.stackName}`,
        description: 'Hourly system health check and metrics collection',
        schedule: events.Schedule.rate(Duration.hours(1)),
      });

      hourlyHealthCheck.addTarget(new targets.LambdaFunction(lambdaFunction, {
        event: events.RuleTargetInput.fromObject({
          eventType: 'scheduled-health-check',
          action: 'system-health-check',
          timestamp: events.EventField.fromPath('$.time'),
        }),
      }));
    }

    // A/B testing result analysis (daily during business hours)
    const abTestAnalysis = new events.Rule(this, 'ABTestAnalysisRule', {
      ruleName: `omnix-ai-ab-test-analysis-${this.stackName}`,
      description: 'Daily A/B testing result analysis and winner determination',
      schedule: events.Schedule.cron({
        minute: '30',
        hour: '10,14,18', // 10:30, 14:30, 18:30 UTC
        day: '*',
        month: '*',
        year: '*',
      }),
    });

    abTestAnalysis.addTarget(new targets.LambdaFunction(lambdaFunction, {
      event: events.RuleTargetInput.fromObject({
        eventType: 'scheduled-analysis',
        action: 'ab-test-analysis',
        timestamp: events.EventField.fromPath('$.time'),
      }),
    }));

    // Grant CloudWatch Events permissions to invoke Lambda
    lambdaFunction.addPermission('ScheduledEventInvoke', {
      principal: new iam.ServicePrincipal('events.amazonaws.com'),
      sourceArn: `arn:aws:events:${this.region}:${this.account}:rule/*`,
    });
  }
}