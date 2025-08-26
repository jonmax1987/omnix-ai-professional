import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Duration } from 'aws-cdk-lib';
import { EnvironmentConfig } from '../config/environment';
import * as path from 'path';

export interface LambdaFunctionProps {
  config: EnvironmentConfig;
  environment: Record<string, string>;
}

export class OmnixLambdaFunction extends Construct {
  public readonly function: lambda.Function;
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
    super(scope, id);

    const { config, environment } = props;

    // Create Lambda execution role
    const timestamp = new Date().toISOString().slice(0,16).replace(/[-:]/g,'');
    this.role = new iam.Role(this, 'ExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `omnix-ai-cdk-lambda-role-${config.stage}-${timestamp}`,
      description: 'Execution role for OMNIX AI Lambda function',
    });

    // Add basic Lambda execution permissions
    this.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // Add VPC execution permissions if VPC is configured
    if (config.vpcId) {
      this.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
      );
    }

    // Add X-Ray permissions if enabled
    if (config.enableXRay) {
      this.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess')
      );
    }

    // Create Lambda function with unique name
    this.function = new lambda.Function(this, 'Function', {
      functionName: `omnix-ai-cdk-backend-${config.stage}-${timestamp}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../apps/backend/omnix-ai-backend-lambda-final.zip')),
      memorySize: config.lambdaMemorySize,
      timeout: Duration.seconds(config.lambdaTimeout),
      role: this.role,
      environment: {
        NODE_ENV: config.stage,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        ...environment,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      tracing: config.enableXRay ? lambda.Tracing.ACTIVE : lambda.Tracing.DISABLED,
      description: `OMNIX AI Backend Lambda - ${config.stage}`,
    });

    // Add DynamoDB permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:BatchWriteItem',
        'dynamodb:BatchGetItem',
        'dynamodb:DescribeTable',
        'dynamodb:DescribeStream',
        'dynamodb:GetRecords',
        'dynamodb:GetShardIterator',
        'dynamodb:ListStreams',
      ],
      resources: [
        `arn:aws:dynamodb:${config.region}:*:table/omnix-ai-${config.stage}-*`,
        `arn:aws:dynamodb:${config.region}:*:table/omnix-ai-${config.stage}-*/index/*`,
        `arn:aws:dynamodb:${config.region}:*:table/omnix-ai-*-${config.stage}`,
        `arn:aws:dynamodb:${config.region}:*:table/omnix-ai-*-${config.stage}/index/*`,
      ],
    }));

    // Add Bedrock permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
        'bedrock:ListFoundationModels',
        'bedrock:GetFoundationModel',
      ],
      resources: [
        `arn:aws:bedrock:${config.bedrockRegion}::foundation-model/anthropic.claude-3-haiku-*`,
        `arn:aws:bedrock:${config.bedrockRegion}::foundation-model/anthropic.claude-3-sonnet-*`,
      ],
    }));

    // Add Kinesis permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'kinesis:PutRecord',
        'kinesis:PutRecords',
        'kinesis:DescribeStream',
        'kinesis:GetShardIterator',
        'kinesis:GetRecords',
        'kinesis:ListShards',
        'kinesis:DescribeStreamSummary',
        'kinesis:ListStreams',
      ],
      resources: [
        `arn:aws:kinesis:${config.region}:*:stream/omnix-ai-*`,
      ],
    }));

    // Add SQS permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'sqs:SendMessage',
        'sqs:ReceiveMessage',
        'sqs:DeleteMessage',
        'sqs:GetQueueAttributes',
        'sqs:GetQueueUrl',
        'sqs:ChangeMessageVisibility',
      ],
      resources: [
        `arn:aws:sqs:${config.region}:*:omnix-ai-*`,
      ],
    }));

    // Add CloudWatch permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudwatch:PutMetricData',
        'cloudwatch:GetMetricData',
        'cloudwatch:GetMetricStatistics',
        'cloudwatch:ListMetrics',
      ],
      resources: ['*'],
    }));

    // Add Secrets Manager permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret',
      ],
      resources: [
        `arn:aws:secretsmanager:${config.region}:*:secret:omnix-ai-${config.stage}-*`,
      ],
    }));

    // Add Parameter Store permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ssm:GetParameter',
        'ssm:GetParameters',
        'ssm:GetParametersByPath',
      ],
      resources: [
        `arn:aws:ssm:${config.region}:*:parameter/omnix-ai/${config.stage}/*`,
      ],
    }));

    // Add EventBridge permissions
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'events:PutEvents',
      ],
      resources: [
        `arn:aws:events:${config.region}:*:event-bus/default`,
        `arn:aws:events:${config.region}:*:event-bus/omnix-ai-${config.stage}`,
      ],
    }));
  }
}