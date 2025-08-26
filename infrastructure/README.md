# OMNIX AI - AWS CDK Infrastructure

Complete AWS CDK infrastructure for the OMNIX AI customer analytics platform, supporting 14+ backend modules with AI-powered insights, real-time streaming, and comprehensive monitoring.

## 🏗️ Architecture Overview

### **System Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    OMNIX AI INFRASTRUCTURE                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐                   │
│  │   Frontend   │────│   API Gateway    │────│     Lambda      │                   │
│  │   (Next.js)  │    │  (REST + WS)    │    │   (NestJS)      │                   │
│  └──────────────┘    └─────────────────┘    └─────────────────┘                   │
│                                                       │                            │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                            CORE SERVICES                                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Customer    │  │   Product    │  │    Order     │  │  Inventory   │  │  │
│  │  │ Management   │  │ Management   │  │ Management   │  │ Management   │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                           AI & ANALYTICS                                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  AI Analysis │  │ Segmentation │  │  A/B Testing │  │  Forecasting │  │  │
│  │  │  (Bedrock)   │  │   Engine     │  │  Framework   │  │    Engine    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                        STREAMING & MESSAGING                               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │    Kinesis   │  │     SQS      │  │ EventBridge  │  │  WebSocket   │  │  │
│  │  │   Streams    │  │    Queues    │  │   Events     │  │   Gateway    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                           DATA LAYER                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  DynamoDB    │  │    Secrets   │  │ Parameter    │  │  CloudWatch  │  │  │
│  │  │ (14 Tables)  │  │   Manager    │  │    Store     │  │     Logs     │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### **Core Modules (14 Domains)**

1. **Authentication & Authorization** - JWT auth, API keys, RBAC
2. **Customer Management & AI Analytics** - AI profiling, consumption prediction  
3. **Product Management** - Catalog, inventory, similarity analysis
4. **Order Management** - Processing, history, analytics
5. **Inventory Management** - Stock tracking, alerts, optimization
6. **Dashboard & Analytics** - Business intelligence, real-time metrics
7. **AI Recommendations** - Personalized ML-driven insights
8. **Forecasting & Predictions** - Demand forecasting, trend analysis
9. **Alerts & Notifications** - Real-time monitoring, automated alerts
10. **Machine Learning Engine** - Advanced algorithms, recommendation engine
11. **Real-time Communication** - WebSocket, live updates
12. **Streaming Analytics** - Kinesis integration, real-time processing
13. **A/B Testing Framework** - Model comparison, optimization
14. **System Management** - Health checks, configuration

## 📦 AWS Services Included

### 🗄️ Data Storage
- **DynamoDB Tables**
  - `Products` - Product catalog and inventory data
  - `HistoricalData` - Historical demand and sales data
  - `Forecasts` - AI-generated forecast results
  - `Alerts` - System alerts and notifications

### 🔗 API & Networking
- **API Gateway** - RESTful API endpoint management
- **CloudFront** - Global content delivery network
- **Route 53** - DNS management (optional)

### ⚡ Compute Services
- **Lambda Functions** - Serverless compute for business logic
- **Lambda Layers** - Shared dependencies for Python/Node.js

### 📨 Messaging & Events
- **SQS Queues** - Asynchronous task processing
- **SNS Topics** - Notification delivery
- **EventBridge** - Event-driven scheduling

### 📊 Monitoring & Logging
- **CloudWatch** - Metrics, logs, and alarms
- **X-Ray** - Distributed tracing
- **CloudTrail** - API call auditing

### 🔒 Security & Access
- **IAM Roles** - Service permissions and access control
- **KMS** - Encryption key management
- **WAF** - Web application firewall

### 📈 Analytics & ML
- **S3 Data Lake** - Historical data storage for analytics
- **Kinesis** - Real-time data streaming (optional)
- **SageMaker** - Advanced ML model training (optional)

## 🚀 Deployment Guide

### Prerequisites

1. **AWS CLI** - Install and configure
   ```bash
   # Install AWS CLI
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install

   # Configure credentials
   aws configure
   ```

2. **Permissions** - Ensure your AWS user/role has:
   - CloudFormation full access
   - IAM role creation permissions
   - Service permissions for all components

3. **Region Selection** - Choose appropriate AWS region
   - `us-east-1` (N. Virginia) - Default, lowest latency to US East
   - `us-west-2` (Oregon) - US West Coast
   - `eu-west-1` (Ireland) - Europe
   - `ap-southeast-1` (Singapore) - Asia Pacific

### Quick Deployment

```bash
# Deploy to development environment (default)
./deploy.sh

# Deploy to production with custom domain
./deploy.sh -e prod -r us-west-2 -d api.omnix.ai

# Deploy to staging environment
./deploy.sh -e staging

# Dry run to see what would be deployed
./deploy.sh --dry-run -e prod
```

### Detailed Deployment Steps

1. **Validate Configuration**
   ```bash
   # Check AWS credentials
   aws sts get-caller-identity

   # Validate CloudFormation template
   aws cloudformation validate-template \
     --template-body file://cloudformation-template.yml
   ```

2. **Deploy Infrastructure**
   ```bash
   # Development environment
   ./deploy.sh -e dev

   # Production environment with all features
   ./deploy.sh -e prod -r us-east-1
   ```

3. **Verify Deployment**
   ```bash
   # Check stack status
   aws cloudformation describe-stacks \
     --stack-name omnix-ai-infrastructure-dev

   # Test API Gateway endpoint
   curl -X GET https://your-api-id.execute-api.region.amazonaws.com/dev/v1/health
   ```

### Environment-Specific Configurations

#### Development (dev)
- **Cost Optimization** - On-demand billing, minimal redundancy
- **Monitoring** - Basic CloudWatch metrics
- **Retention** - 14 days for logs
- **Backup** - No point-in-time recovery

#### Production (prod)
- **High Availability** - Multi-AZ deployments
- **Enhanced Monitoring** - Detailed metrics and alarms
- **Retention** - 30+ days for logs
- **Backup** - Point-in-time recovery enabled
- **Security** - Enhanced security features

## 📊 Resource Overview

### DynamoDB Tables

| Table | Purpose | Key Schema | GSI | TTL |
|-------|---------|------------|-----|-----|
| `Products` | Product catalog | `id` (HASH) | `category-index`, `sku-index` | No |
| `HistoricalData` | Demand history | `product_id` (HASH), `date` (RANGE) | None | Yes (90 days) |
| `Forecasts` | AI predictions | `product_id` (HASH), `forecast_date` (RANGE) | `forecast-date-index` | Yes (90 days) |
| `Alerts` | System alerts | `id` (HASH) | `priority-created-index` | Yes (30 days) |

### API Gateway Endpoints

| Method | Path | Purpose | Lambda |
|--------|------|---------|--------|
| `GET` | `/v1/products` | List products | Backend |
| `POST` | `/v1/products` | Create product | Backend |
| `GET` | `/v1/forecasts` | Get forecasts | AI Lambda |
| `POST` | `/v1/ai/forecast` | Generate forecast | AI Lambda |
| `GET` | `/v1/dashboard/summary` | Dashboard data | Backend |

### SQS Queues

| Queue | Purpose | Visibility Timeout | DLQ |
|-------|---------|-------------------|-----|
| `forecasting-queue` | Batch AI processing | 300s | Yes |
| `notifications-queue` | Alert delivery | 60s | No |

## 💰 Cost Estimation

### Development Environment (Monthly)
- **DynamoDB**: $5-15 (on-demand)
- **Lambda**: $1-5 (1M requests)
- **API Gateway**: $3-10 (1M requests)
- **S3**: $1-5 (10GB storage)
- **CloudWatch**: $2-8 (basic monitoring)
- **Total**: ~$15-45/month

### Production Environment (Monthly)
- **DynamoDB**: $50-200 (higher throughput)
- **Lambda**: $10-50 (10M requests)
- **API Gateway**: $35-100 (10M requests)
- **S3**: $10-30 (100GB storage)
- **CloudWatch**: $20-50 (detailed monitoring)
- **Total**: ~$125-430/month

## 🔧 Configuration Options

### Template Parameters

| Parameter | Description | Default | Options |
|-----------|-------------|---------|---------|
| `Environment` | Deployment environment | `dev` | `dev`, `staging`, `prod` |
| `ProjectName` | Project name for resources | `omnix-ai` | Any string |
| `DomainName` | Custom domain (optional) | `""` | FQDN |

### Environment Variables (Lambda)

```bash
# Core configuration
STAGE=dev
PROJECT_NAME=omnix-ai
AWS_REGION=us-east-1

# DynamoDB tables
PRODUCTS_TABLE=omnix-ai-products-dev
FORECASTS_TABLE=omnix-ai-forecasts-dev
HISTORICAL_DATA_TABLE=omnix-ai-historical-data-dev

# SQS queues
FORECASTING_QUEUE_URL=https://sqs.region.amazonaws.com/account/omnix-forecasting-queue-dev

# S3 buckets
DATA_LAKE_BUCKET=omnix-ai-data-lake-dev-account
STATIC_ASSETS_BUCKET=omnix-ai-static-assets-dev-account
```

## 🔍 Monitoring & Observability

### CloudWatch Dashboards
- **API Performance** - Request rates, latency, error rates
- **Lambda Metrics** - Execution duration, memory usage, error rates
- **DynamoDB Metrics** - Read/write capacity, throttling
- **Cost Tracking** - Daily/monthly cost breakdowns

### Alarms & Notifications
- **High Error Rate** - >10 4XX errors in 5 minutes
- **High Latency** - >2s average response time
- **Lambda Failures** - Any function error rate >5%
- **Cost Alerts** - Monthly spending >$100 (configurable)

### Logging Strategy
```bash
# API Gateway access logs
/aws/apigateway/omnix-ai-dev

# Lambda function logs
/aws/lambda/omnix-ai-forecast-dev
/aws/lambda/omnix-ai-backend-dev

# Application logs (structured JSON)
{
  "timestamp": "2025-08-10T14:30:00Z",
  "level": "INFO",
  "request_id": "12345-67890",
  "service": "forecasting",
  "message": "Forecast generated successfully",
  "product_id": "COF-001",
  "execution_time": 1250
}
```

## 🛡️ Security Best Practices

### IAM Policies
- **Principle of Least Privilege** - Minimal required permissions
- **Resource-Based Policies** - Service-specific access controls
- **Cross-Account Access** - Secure multi-account setup

### Data Protection
- **Encryption at Rest** - All DynamoDB tables and S3 buckets
- **Encryption in Transit** - HTTPS/TLS for all communications
- **API Security** - API Gateway throttling and WAF protection

### Network Security
- **VPC Endpoints** - Private connectivity to AWS services
- **Security Groups** - Restrictive inbound/outbound rules
- **NACLs** - Network-level access control

## 🧪 Testing

### Infrastructure Testing
```bash
# Validate template syntax
aws cloudformation validate-template --template-body file://cloudformation-template.yml

# Test deployment (dry run)
./deploy.sh --dry-run -e dev

# Test resource creation
aws cloudformation create-stack --stack-name test-stack --template-body file://cloudformation-template.yml --parameters ParameterKey=Environment,ParameterValue=test
```

### API Testing
```bash
# Health check
curl -X GET https://api-gateway-url/dev/v1/health

# Product listing
curl -X GET https://api-gateway-url/dev/v1/products

# Forecast generation
curl -X POST https://api-gateway-url/dev/v1/ai/forecast \
  -H "Content-Type: application/json" \
  -d '{"product_id": "test", "forecast_days": 30}'
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy Infrastructure
on:
  push:
    branches: [main]
    paths: ['infrastructure/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy Infrastructure
        run: |
          cd infrastructure
          ./deploy.sh -e prod
```

## 🚨 Troubleshooting

### Common Issues

1. **Stack Creation Failed**
   ```bash
   # Check stack events
   aws cloudformation describe-stack-events --stack-name omnix-ai-infrastructure-dev
   ```

2. **Permission Denied**
   ```bash
   # Verify IAM permissions
   aws iam get-user
   aws iam list-attached-user-policies --user-name your-username
   ```

3. **Resource Conflicts**
   ```bash
   # Check for existing resources
   aws dynamodb list-tables
   aws s3 ls
   ```

### Cleanup Commands
```bash
# Delete entire stack
./deploy.sh --delete -e dev

# Delete specific resources
aws dynamodb delete-table --table-name omnix-ai-products-dev
aws s3 rb s3://omnix-ai-data-lake-dev-123456789 --force
```

## 📚 Additional Resources

- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [AWS DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [API Gateway Performance](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

---

## 📞 Support

For infrastructure issues or questions:
1. Check CloudFormation stack events
2. Review CloudWatch logs
3. Validate IAM permissions
4. Consult AWS documentation

The infrastructure is designed to be production-ready with appropriate monitoring, security, and cost optimization features built-in.