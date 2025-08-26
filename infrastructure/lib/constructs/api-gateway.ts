import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apigatewayv2Integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { EnvironmentConfig } from '../config/environment';

export interface ApiGatewayProps {
  config: EnvironmentConfig;
  lambdaFunction: lambda.Function;
}

export class OmnixApiGateway extends Construct {
  public readonly restApi: apigateway.RestApi;
  public readonly webSocketApi: apigatewayv2.WebSocketApi;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    const { config, lambdaFunction } = props;

    // Create REST API Gateway
    this.restApi = new apigateway.RestApi(this, 'RestApi', {
      restApiName: `omnix-ai-api-${config.stage}`,
      description: `OMNIX AI REST API - ${config.stage}`,
      deployOptions: {
        stageName: config.stage,
        metricsEnabled: config.enableMonitoring,
        tracingEnabled: config.enableXRay,
        accessLogDestination: apigateway.AccessLogDestination.cloudWatchLogs(
          new apigateway.LogGroup(this, 'RestApiAccessLogs', {
            logGroupName: `/aws/apigateway/omnix-ai-${config.stage}`,
          })
        ),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
      defaultCorsPreflightOptions: {
        allowOrigins: config.stage === 'prod' 
          ? ['https://omnix-ai.com', 'https://www.omnix-ai.com']
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
          'X-API-Key',
        ],
        allowCredentials: true,
      },
      binaryMediaTypes: ['multipart/form-data', 'application/octet-stream'],
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
    });

    // Create Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      proxy: true,
      allowTestInvoke: config.stage !== 'prod',
    });

    // Add proxy resource to handle all paths
    const proxyResource = this.restApi.root.addResource('{proxy+}');
    proxyResource.addMethod('ANY', lambdaIntegration);
    
    // Add root resource handler
    this.restApi.root.addMethod('ANY', lambdaIntegration);

    // Add API Key for external integrations
    const apiKey = this.restApi.addApiKey(`OmnixApiKey${config.stage}`, {
      apiKeyName: `omnix-ai-key-${config.stage}`,
      description: `API Key for OMNIX AI - ${config.stage}`,
    });

    // Create usage plan
    const usagePlan = this.restApi.addUsagePlan(`OmnixUsagePlan${config.stage}`, {
      name: `omnix-ai-usage-plan-${config.stage}`,
      description: `Usage plan for OMNIX AI - ${config.stage}`,
      apiStages: [
        {
          api: this.restApi,
          stage: this.restApi.deploymentStage,
        },
      ],
      throttle: {
        rateLimit: config.stage === 'prod' ? 10000 : 1000,
        burstLimit: config.stage === 'prod' ? 5000 : 2000,
      },
      quota: {
        limit: config.stage === 'prod' ? 1000000 : 100000,
        period: apigateway.Period.MONTH,
      },
    });

    usagePlan.addApiKey(apiKey);

    // Create WebSocket API Gateway
    this.webSocketApi = new apigatewayv2.WebSocketApi(this, 'WebSocketApi', {
      apiName: `omnix-ai-websocket-${config.stage}`,
      description: `OMNIX AI WebSocket API - ${config.stage}`,
      connectRouteOptions: {
        integration: new apigatewayv2Integrations.WebSocketLambdaIntegration(
          'ConnectIntegration',
          lambdaFunction
        ),
      },
      disconnectRouteOptions: {
        integration: new apigatewayv2Integrations.WebSocketLambdaIntegration(
          'DisconnectIntegration',
          lambdaFunction
        ),
      },
      defaultRouteOptions: {
        integration: new apigatewayv2Integrations.WebSocketLambdaIntegration(
          'DefaultIntegration',
          lambdaFunction
        ),
      },
    });

    // Create WebSocket Stage
    const webSocketStage = new apigatewayv2.WebSocketStage(this, 'WebSocketStage', {
      webSocketApi: this.webSocketApi,
      stageName: config.stage,
      autoDeploy: true,
      throttle: {
        rateLimit: config.stage === 'prod' ? 10000 : 1000,
        burstLimit: config.stage === 'prod' ? 5000 : 2000,
      },
    });

    // Grant API Gateway invoke permissions to Lambda
    lambdaFunction.addPermission('ApiGatewayInvoke', {
      principal: new apigateway.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: this.restApi.arnForExecuteApi('*'),
    });

    lambdaFunction.addPermission('WebSocketApiGatewayInvoke', {
      principal: new apigateway.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: this.webSocketApi.executeApiArn,
    });

    // Custom domain configuration for production
    if (config.domainName && config.certificateArn) {
      const certificate = acm.Certificate.fromCertificateArn(
        this,
        'Certificate',
        config.certificateArn
      );

      // Create custom domain for REST API
      const restDomain = new apigateway.DomainName(this, 'RestDomain', {
        domainName: config.domainName,
        certificate,
        endpointType: apigateway.EndpointType.REGIONAL,
        securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
      });

      restDomain.addBasePathMapping(this.restApi, {
        basePath: 'v1',
      });

      // Create custom domain for WebSocket API
      const wsDomain = new apigatewayv2.DomainName(this, 'WebSocketDomain', {
        domainName: `ws.${config.domainName}`,
        certificate,
      });

      new apigatewayv2.ApiMapping(this, 'WebSocketApiMapping', {
        api: this.webSocketApi,
        domainName: wsDomain,
        stage: webSocketStage,
      });

      // Create Route53 records if hosted zone exists
      try {
        const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
          domainName: config.domainName.split('.').slice(-2).join('.'),
        });

        new route53.ARecord(this, 'RestApiAliasRecord', {
          zone: hostedZone,
          recordName: config.domainName,
          target: route53.RecordTarget.fromAlias(
            new targets.ApiGatewayDomain(restDomain)
          ),
        });

        new route53.ARecord(this, 'WebSocketApiAliasRecord', {
          zone: hostedZone,
          recordName: `ws.${config.domainName}`,
          target: route53.RecordTarget.fromAlias(
            new targets.ApiGatewayv2DomainProperties(
              wsDomain.regionalDomainName,
              wsDomain.regionalHostedZoneId
            )
          ),
        });
      } catch (error) {
        console.warn(`Could not create Route53 records: ${error}`);
      }
    }
  }
}