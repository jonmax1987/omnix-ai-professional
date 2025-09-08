# OMNIX AI Comprehensive Monitoring Setup Guide

## Overview

This guide provides complete setup instructions for the OMNIX AI monitoring and alerting infrastructure, designed to ensure enterprise-grade reliability, performance, and security compliance.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    OMNIX AI Monitoring Stack                    │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React)     │  Backend (NestJS)    │  Infrastructure   │
│  • Web Vitals         │  • API Metrics       │  • CloudWatch      │
│  • User Experience    │  • Database Health   │  • CloudFormation  │
│  • Performance        │  • AI Service        │  • Lambda Functions│
│  • Error Tracking     │  • Security Checks   │  • Step Functions  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
        ┌─────────────────────────────────────────┐
        │         Alerting & Response              │
        │  • SNS Topics (4 levels)                 │
        │  • Email, Slack, PagerDuty               │
        │  • Escalation Procedures                 │
        │  • Automated Incident Response           │
        └─────────────────────────────────────────┘
                                │
                                ▼
        ┌─────────────────────────────────────────┐
        │           Dashboards                     │
        │  • Executive Dashboard                   │
        │  • Technical Operations                  │
        │  • Customer Experience                   │
        │  • Security Monitoring                   │
        └─────────────────────────────────────────┘
```

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- CloudFormation deployment capabilities
- Slack workspace (for Slack notifications)
- PagerDuty account (optional, for critical alerts)
- Email addresses for alert recipients

## Deployment Steps

### 1. Deploy Core Monitoring Infrastructure

#### Step 1.1: Deploy Comprehensive Monitoring Stack
```bash
aws cloudformation create-stack \
  --stack-name omnix-ai-monitoring-comprehensive-staging \
  --template-body file://infrastructure/cloudformation/monitoring-comprehensive.yml \
  --parameters \
    ParameterKey=Environment,ParameterValue=staging \
    ParameterKey=ProjectName,ParameterValue=omnix-ai \
    ParameterKey=AlertEmail,ParameterValue=alerts@omnix.ai \
    ParameterKey=SlackWebhookUrl,ParameterValue=YOUR_SLACK_WEBHOOK_URL \
    ParameterKey=CloudFrontDistributionId,ParameterValue=YOUR_DISTRIBUTION_ID \
    ParameterKey=S3BucketName,ParameterValue=YOUR_S3_BUCKET \
    ParameterKey=ApiGatewayId,ParameterValue=YOUR_API_GATEWAY_ID \
    ParameterKey=HealthCheckUrl,ParameterValue=https://omnix-ai-staging.vercel.app/health \
  --capabilities CAPABILITY_NAMED_IAM
```

#### Step 1.2: Deploy Security Monitoring
```bash
aws cloudformation create-stack \
  --stack-name omnix-ai-security-monitoring-staging \
  --template-body file://infrastructure/cloudformation/security-monitoring.yml \
  --parameters \
    ParameterKey=Environment,ParameterValue=staging \
    ParameterKey=ProjectName,ParameterValue=omnix-ai \
    ParameterKey=AlertTopicArn,ParameterValue=CRITICAL_ALERT_TOPIC_ARN \
    ParameterKey=ApiGatewayId,ParameterValue=YOUR_API_GATEWAY_ID \
  --capabilities CAPABILITY_NAMED_IAM
```

#### Step 1.3: Deploy Business Metrics Monitoring
```bash
aws cloudformation create-stack \
  --stack-name omnix-ai-business-monitoring-staging \
  --template-body file://infrastructure/cloudformation/business-monitoring.yml \
  --parameters \
    ParameterKey=Environment,ParameterValue=staging \
    ParameterKey=ProjectName,ParameterValue=omnix-ai \
    ParameterKey=AlertTopicArn,ParameterValue=BUSINESS_ALERT_TOPIC_ARN \
    ParameterKey=DynamoDBTableNames,ParameterValue="customers,orders,inventory,analytics" \
  --capabilities CAPABILITY_NAMED_IAM
```

### 2. Deploy Alerting and Escalation System

#### Step 2.1: Deploy Alerting Infrastructure
```bash
aws cloudformation create-stack \
  --stack-name omnix-ai-alerting-escalation-staging \
  --template-body file://infrastructure/cloudformation/alerting-escalation.yml \
  --parameters \
    ParameterKey=Environment,ParameterValue=staging \
    ParameterKey=ProjectName,ParameterValue=omnix-ai \
    ParameterKey=PrimaryEmail,ParameterValue=alerts@omnix.ai \
    ParameterKey=EscalationEmail,ParameterValue=emergency@omnix.ai \
    ParameterKey=SlackWebhookUrl,ParameterValue=YOUR_SLACK_WEBHOOK_URL \
    ParameterKey=PagerDutyIntegrationKey,ParameterValue=YOUR_PAGERDUTY_KEY \
  --capabilities CAPABILITY_NAMED_IAM
```

#### Step 2.2: Deploy Incident Response System
```bash
aws cloudformation create-stack \
  --stack-name omnix-ai-incident-response-staging \
  --template-body file://infrastructure/cloudformation/incident-response.yml \
  --parameters \
    ParameterKey=Environment,ParameterValue=staging \
    ParameterKey=ProjectName,ParameterValue=omnix-ai \
    ParameterKey=AlertTopicArn,ParameterValue=CRITICAL_ALERT_TOPIC_ARN \
    ParameterKey=ApiGatewayId,ParameterValue=YOUR_API_GATEWAY_ID \
    ParameterKey=CloudFrontDistributionId,ParameterValue=YOUR_DISTRIBUTION_ID \
    ParameterKey=S3BucketName,ParameterValue=YOUR_S3_BUCKET \
  --capabilities CAPABILITY_NAMED_IAM
```

### 3. Deploy Dashboard Infrastructure

#### Step 3.1: Deploy Executive Dashboards
```bash
aws cloudformation create-stack \
  --stack-name omnix-ai-executive-dashboards-staging \
  --template-body file://infrastructure/cloudformation/executive-dashboard.yml \
  --parameters \
    ParameterKey=Environment,ParameterValue=staging \
    ParameterKey=ProjectName,ParameterValue=omnix-ai \
    ParameterKey=ApiGatewayId,ParameterValue=YOUR_API_GATEWAY_ID \
    ParameterKey=CloudFrontDistributionId,ParameterValue=YOUR_DISTRIBUTION_ID
```

## Configuration

### Frontend Monitoring Configuration

Update your `.env` file:
```env
# Performance Monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_SAMPLE_RATE=0.1

# Error Tracking
VITE_ENABLE_ERROR_TRACKING=true
VITE_SENTRY_DSN=YOUR_SENTRY_DSN
VITE_SENTRY_ENVIRONMENT=staging

# API Configuration
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
VITE_ENVIRONMENT=staging
```

### Backend Monitoring Configuration

Update your environment variables:
```env
# AWS Configuration
AWS_REGION=eu-central-1

# Monitoring
ENABLE_MONITORING=true
CLOUDWATCH_NAMESPACE=OMNIX/AI

# Alert Configuration
CRITICAL_ALERT_TOPIC_ARN=arn:aws:sns:region:account:omnix-ai-staging-critical-alerts
WARNING_ALERT_TOPIC_ARN=arn:aws:sns:region:account:omnix-ai-staging-warning-alerts
```

## Monitoring Targets & SLAs

### API Performance
- **Availability**: >99.9% uptime
- **Response Time**: <500ms average, <1000ms 95th percentile
- **Error Rate**: <1% for all endpoints

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: <2.5 seconds
- **First Input Delay (FID)**: <100ms
- **Cumulative Layout Shift (CLS)**: <0.1

### Business Metrics
- **Revenue Processing**: 95%+ success rate
- **Inventory Management**: <10% out-of-stock
- **AI Recommendations**: 70%+ confidence rate
- **Customer Segmentation**: 95%+ accuracy

### Security
- **Zero PII exposure incidents**
- **Authentication failure rate**: <5% of total requests
- **SSL certificate expiration**: >30 days warning

## Dashboard Access

After deployment, access your dashboards:

### Executive Dashboard
- **Purpose**: High-level business metrics and system health
- **Audience**: C-level executives, product managers
- **URL**: `https://console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards:name=omnix-ai-staging-executive`

### Technical Operations Dashboard
- **Purpose**: Infrastructure health and performance metrics
- **Audience**: DevOps, platform engineers, on-call engineers
- **URL**: `https://console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards:name=omnix-ai-staging-technical`

### Customer Experience Dashboard
- **Purpose**: User journey and engagement analytics
- **Audience**: UX designers, frontend engineers, product managers
- **URL**: `https://console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards:name=omnix-ai-staging-customer-experience`

### Security Monitoring Dashboard
- **Purpose**: Security events and compliance monitoring
- **Audience**: Security team, compliance officers
- **URL**: `https://console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards:name=omnix-ai-staging-security`

### Business Metrics Dashboard
- **Purpose**: Revenue, customer, and AI effectiveness metrics
- **Audience**: Business analysts, data scientists, executives
- **URL**: `https://console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards:name=omnix-ai-staging-business`

## Alert Levels and Escalation

### Alert Severity Levels

1. **Critical** (Red)
   - System down, security breaches, data loss
   - **Response Time**: 15 minutes
   - **Escalation**: Immediate PagerDuty, Slack, Email
   - **Examples**: API completely down, PII exposure detected

2. **Warning** (Orange)
   - Performance degradation, high error rates
   - **Response Time**: 1 hour
   - **Escalation**: Slack, Email after 1 hour
   - **Examples**: API latency >500ms, error rate >5%

3. **Business** (Blue)
   - Revenue impact, inventory issues, AI degradation
   - **Response Time**: 4 hours
   - **Escalation**: Email to business stakeholders
   - **Examples**: Revenue processing <95%, AI confidence <70%

4. **Info** (Green)
   - General notifications, maintenance updates
   - **Response Time**: 24 hours
   - **Escalation**: Email digest
   - **Examples**: Deployment completed, backup created

### Escalation Procedures

1. **Immediate Response (0-15 minutes)**
   - Automated incident response triggered
   - PagerDuty notification for critical alerts
   - Slack notification to #incidents channel

2. **First Escalation (15-60 minutes)**
   - On-call engineer notification
   - Manager notification for unacknowledged critical alerts
   - Additional team members pulled in

3. **Second Escalation (1-4 hours)**
   - Senior engineering management notification
   - Product owner notification for business impact
   - External vendor engagement if needed

4. **Executive Escalation (4+ hours)**
   - VP Engineering notification
   - CEO notification for customer-facing outages
   - Public status page updates if applicable

## Automated Incident Response

The system includes automated incident response for common scenarios:

### API Down Incidents
1. Verify API health with synthetic checks
2. Restart API Gateway deployment
3. Invalidate CloudFront cache
4. Check Lambda function health
5. Verify recovery after 30 seconds

### High Error Rate Incidents
1. Analyze error patterns (4XX vs 5XX)
2. Invalidate cache if 5XX errors are high
3. Perform security check if 4XX errors are high
4. Enable enhanced monitoring

### Database Issues
1. Check DynamoDB table status
2. Ensure auto-scaling is enabled
3. Create emergency backup if needed
4. Alert if <80% of tables are accessible

### Performance Degradation
1. Scale up Lambda concurrency
2. Invalidate API-specific cache
3. Enable provisioned concurrency for critical functions

### Security Breaches
1. Initiate API key rotation
2. Enable enhanced CloudTrail logging
3. Block suspicious IP addresses
4. Create security incident record
5. Immediate escalation to security team

## Manual Procedures

### Acknowledging Alerts
1. Access the alerts dashboard
2. Find the specific alert incident
3. Click "Acknowledge" to stop escalation
4. Add notes about investigation status

### Creating Custom Alerts
```python
import boto3

cloudwatch = boto3.client('cloudwatch')

# Create custom business metric alarm
cloudwatch.put_metric_alarm(
    AlarmName='CustomBusinessMetric',
    ComparisonOperator='GreaterThanThreshold',
    EvaluationPeriods=2,
    MetricName='YourCustomMetric',
    Namespace='OMNIX/Business',
    Period=300,
    Statistic='Average',
    Threshold=100.0,
    ActionsEnabled=True,
    AlarmActions=[
        'arn:aws:sns:region:account:omnix-ai-staging-business-alerts'
    ],
    AlarmDescription='Custom business metric alert'
)
```

### Manual Health Checks
```bash
# Check API health
curl -f https://your-api-url/health || echo "API health check failed"

# Check database connectivity
aws dynamodb describe-table --table-name omnix-ai-staging-customers

# Check CloudFront distribution
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Check Lambda functions
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `omnix-ai-staging`)]'
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Missing Metrics
- **Issue**: No data appearing in dashboards
- **Solution**: Check Lambda function logs, verify IAM permissions, ensure CloudWatch namespace is correct

#### 2. Alert Fatigue
- **Issue**: Too many alerts being generated
- **Solution**: Adjust thresholds, implement alert suppression during maintenance, review alert criticality levels

#### 3. Dashboard Loading Slowly
- **Issue**: CloudWatch dashboards taking too long to load
- **Solution**: Reduce time range, optimize metric queries, consider data aggregation

#### 4. Incident Response Not Triggering
- **Issue**: Automated incident response not executing
- **Solution**: Check Step Functions execution, verify SNS topic subscriptions, review Lambda function permissions

### Log Locations
- **Lambda Functions**: CloudWatch Logs `/aws/lambda/function-name`
- **API Gateway**: CloudWatch Logs `/aws/apigateway/api-gateway-id`
- **CloudFront**: Access logs in S3 bucket
- **Application Logs**: Check application-specific log groups

## Production Considerations

### Scaling for Production
1. **Increase monitoring frequency**
   - Health checks: Every 1-2 minutes
   - Performance monitoring: Every 1 minute
   - Business metrics: Every 10-15 minutes

2. **Enhanced alerting**
   - Add phone/SMS notifications for critical alerts
   - Implement alert correlation to reduce noise
   - Set up war room procedures for major incidents

3. **Data retention**
   - Extend CloudWatch log retention to 90+ days
   - Set up long-term metric storage in S3
   - Implement compliance-required data retention policies

4. **Geographic monitoring**
   - Deploy health checks from multiple regions
   - Monitor CDN performance globally
   - Set up region-specific alerting

### Security Hardening
1. **Encrypt all monitoring data**
2. **Implement least-privilege access**
3. **Regular security audits of monitoring infrastructure**
4. **Secure webhook endpoints with authentication**

### Cost Optimization
1. **Right-size CloudWatch retention periods**
2. **Use CloudWatch Insights for complex queries instead of detailed logging**
3. **Implement metric filtering to reduce ingestion costs**
4. **Regular review of unused metrics and dashboards**

## Maintenance

### Weekly Tasks
- Review alert effectiveness and adjust thresholds
- Check dashboard accuracy and relevance
- Validate incident response playbooks
- Review security monitoring coverage

### Monthly Tasks
- Analyze monitoring costs and optimize
- Update runbooks based on recent incidents
- Review and test disaster recovery procedures
- Audit user access to monitoring systems

### Quarterly Tasks
- Comprehensive monitoring system health check
- Update monitoring strategy based on business changes
- Review and update SLA targets
- Conduct incident response drills

## Support and Contacts

### On-Call Rotation
- **Primary On-Call**: DevOps Engineer (24/7)
- **Secondary On-Call**: Senior Platform Engineer
- **Escalation**: Engineering Manager

### Emergency Contacts
- **Critical Issues**: emergency@omnix.ai
- **Security Issues**: security@omnix.ai
- **Business Impact**: business-ops@omnix.ai

### Documentation
- **Technical Runbooks**: `/docs/runbooks/`
- **Incident Response**: `/docs/incident-response/`
- **Architecture Docs**: `/docs/architecture/`

---

This monitoring setup provides enterprise-grade observability for OMNIX AI, ensuring high availability, performance, and security compliance while enabling rapid incident response and business insights.