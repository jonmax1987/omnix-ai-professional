# OMNIX AI - Production Deployment Guide

## AI-Powered Customer Analytics with AWS Bedrock

This guide covers the complete deployment of OMNIX AI's customer analytics system with AWS Bedrock integration for AI-powered consumption prediction and customer profiling.

## 🚀 Quick Start

```bash
# 1. Setup Bedrock access and IAM policies
./setup-bedrock.sh

# 2. Deploy Lambda with AI components
./deploy-lambda.sh

# 3. Seed test data
node seed-ai-test-data.js

# 4. Run comprehensive tests
node test-ai-analysis.js
```

## 📋 Prerequisites

### AWS Account Requirements
- ✅ AWS account with admin access
- ✅ AWS Bedrock service enabled
- ✅ Claude 3 model access enabled in Bedrock console
- ✅ AWS CLI configured with proper credentials
- ✅ Sufficient quotas for Lambda, DynamoDB, and Bedrock

### Local Development Requirements
- ✅ Node.js 18+ and npm
- ✅ AWS CLI v2
- ✅ jq (for JSON processing)
- ✅ curl (for API testing)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   API Gateway   │────│    Lambda    │────│   DynamoDB     │
│                 │    │              │    │                 │
│ REST Endpoints  │    │ NestJS App   │    │ Customer Data   │
└─────────────────┘    └──────┬───────┘    └─────────────────┘
                              │
                       ┌──────▼───────┐
                       │ AWS Bedrock  │
                       │              │
                       │ Claude 3 AI  │
                       └──────────────┘
```

## 🔧 Step-by-Step Deployment

### Step 1: Enable AWS Bedrock Access

1. **Open AWS Bedrock Console**
   - Navigate to AWS Bedrock in your preferred region (us-east-1 recommended)
   - Go to "Model access" in the left sidebar

2. **Request Model Access**
   ```
   Enable access for:
   ✅ Anthropic Claude 3 Haiku
   ✅ Anthropic Claude 3 Sonnet (optional, higher cost)
   ```

3. **Verify Model Access**
   ```bash
   aws bedrock list-foundation-models --region us-east-1 \
     --query "modelSummaries[?contains(modelId,'claude')]"
   ```

### Step 2: Run Bedrock Setup Script

```bash
# Make script executable
chmod +x setup-bedrock.sh

# Run with default settings
./setup-bedrock.sh

# Or with custom configuration
AWS_REGION=eu-central-1 BEDROCK_REGION=us-east-1 ./setup-bedrock.sh
```

This script will:
- ✅ Verify AWS CLI configuration
- ✅ Check Bedrock access and model availability
- ✅ Create IAM policy for Bedrock access
- ✅ Attach policy to Lambda execution role
- ✅ Update Lambda environment variables
- ✅ Test Bedrock connectivity

### Step 3: Deploy Lambda Function

```bash
# Build and package with AI components
./deploy-lambda.sh
```

The deployment process:
- ✅ Builds TypeScript to JavaScript
- ✅ Verifies AI dependencies are included
- ✅ Creates optimized Lambda package
- ✅ Excludes unnecessary files (tests, maps)
- ✅ Validates AI services are packaged

### Step 4: Configure Environment Variables

Set these variables in your Lambda function:

**Required Variables:**
```env
# AWS Configuration
AWS_REGION=eu-central-1
DYNAMODB_TABLE_PREFIX=omnix-ai-prod-

# Bedrock AI Configuration
AWS_BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
AI_ANALYSIS_ENABLED=true

# Application Configuration
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-here
```

**Optional Variables:**
```env
# Cost Control
BEDROCK_MAX_TOKENS=4000
BEDROCK_TIMEOUT=30000

# Feature Flags
AI_FALLBACK_ENABLED=true
ANALYSIS_CACHE_TTL=86400
```

### Step 5: Set Up DynamoDB Tables

```bash
# Create all required tables
./setup-dynamodb.sh

# Create AI-specific analysis cache table
./setup-recommendation-tables.sh
```

**Tables Created:**
- `omnix-ai-customer-profiles-prod` - Customer profiles
- `omnix-ai-purchase-history-prod` - Purchase transactions
- `omnix-ai-product-interactions-prod` - User interactions
- `omnix-ai-recommendations-prod` - ML recommendations
- `omnix-ai-analysis-results-prod` - AI analysis cache

### Step 6: Configure API Gateway

1. **Create API Gateway (if not exists)**
   ```bash
   aws apigatewayv2 create-api \
     --name "omnix-ai-api-prod" \
     --protocol-type HTTP \
     --target "arn:aws:lambda:region:account:function:omnix-ai-backend-prod"
   ```

2. **Configure Lambda Integration**
   - Set up proxy integration to Lambda
   - Configure CORS for frontend access
   - Set up custom domain (optional)

### Step 7: Set Up Monitoring

```bash
# Create CloudWatch alarms for AI components
./setup-monitoring.sh

# This creates alarms for:
# - Bedrock API errors
# - Lambda duration (AI calls are slower)
# - DynamoDB throttling
# - High error rates
```

## 🧪 Testing and Validation

### 1. Seed Test Data
```bash
# Create realistic customer with purchase history
node seed-ai-test-data.js

# Verify data creation
aws dynamodb scan --table-name omnix-ai-customer-profiles-dev \
  --query 'Items[?customerId.S==`ai-test-customer-001`]'
```

### 2. Run Comprehensive Tests
```bash
# Test all AI endpoints
node test-ai-analysis.js

# Test specific functionality
node test-ai-analysis.js --test-consumption-prediction
node test-ai-analysis.js --test-recommendations
```

### 3. Manual API Testing
```bash
# Get your API Gateway URL
API_URL="https://your-api-id.execute-api.region.amazonaws.com"
TOKEN="your-jwt-token"

# Test AI analysis
curl -H "Authorization: Bearer $TOKEN" \
     "$API_URL/v1/customers/ai-test-customer-001/ai-analysis"

# Test consumption predictions
curl -H "Authorization: Bearer $TOKEN" \
     "$API_URL/v1/customers/ai-test-customer-001/consumption-predictions"

# Test recommendations
curl -H "Authorization: Bearer $TOKEN" \
     "$API_URL/v1/customers/ai-test-customer-001/ai-recommendations?limit=5"
```

## 📊 Performance and Cost Optimization

### Bedrock Cost Management

**Claude 3 Haiku Pricing (as of 2025):**
- Input tokens: $0.00025 per 1K tokens
- Output tokens: $0.00125 per 1K tokens
- Typical analysis: 2K input + 1K output = ~$0.002 per analysis

**Cost Optimization Strategies:**
```env
# Use Haiku for cost-effectiveness
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Cache results aggressively
ANALYSIS_CACHE_TTL=86400  # 24 hours

# Limit token usage
BEDROCK_MAX_TOKENS=2000

# Enable fallback for reliability
AI_FALLBACK_ENABLED=true
```

### Lambda Performance Tuning

```json
{
  "Runtime": "nodejs18.x",
  "MemorySize": 1024,
  "Timeout": 60,
  "Environment": {
    "Variables": {
      "NODE_OPTIONS": "--max-old-space-size=950"
    }
  }
}
```

### DynamoDB Optimization

- Use on-demand billing for variable workloads
- Enable point-in-time recovery for production
- Set up global tables for multi-region deployment

## 🔒 Security Configuration

### IAM Policies

**Lambda Execution Role** should have:
- ✅ DynamoDB read/write access
- ✅ Bedrock InvokeModel permissions
- ✅ CloudWatch Logs access
- ✅ VPC access (if using VPC)

**API Gateway** should have:
- ✅ JWT authentication configured
- ✅ Rate limiting enabled
- ✅ CORS properly configured

### Data Privacy

**Customer Data Protection:**
- All PII is encrypted at rest in DynamoDB
- AI analysis results exclude raw personal data
- Bedrock requests don't include identifiable information
- Analysis cache has TTL for data retention compliance

## 🚨 Troubleshooting

### Common Issues

**1. Bedrock Access Denied**
```bash
# Check model access
aws bedrock list-foundation-models --region us-east-1

# Verify IAM permissions
aws iam get-role-policy --role-name omnix-ai-lambda-execution-role-prod \
  --policy-name omnix-ai-bedrock-policy
```

**2. Lambda Timeout on AI Calls**
```bash
# Increase Lambda timeout
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-prod \
  --timeout 60
```

**3. High Bedrock Costs**
```bash
# Check usage in CloudWatch
aws logs filter-log-events \
  --log-group-name /aws/lambda/omnix-ai-backend-prod \
  --filter-pattern "Bedrock response received"
```

**4. AI Analysis Returns Empty Results**
- Verify customer has sufficient purchase history (>5 transactions)
- Check if fallback analysis is being used
- Review Bedrock request/response logs

### Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
LOG_LEVEL=debug
AI_ANALYSIS_DEBUG=true
```

## 📈 Monitoring and Alerts

### Key Metrics to Monitor

1. **AI Analysis Success Rate**
   ```
   Successful AI analyses / Total AI analysis requests
   Target: >95%
   ```

2. **Bedrock Response Time**
   ```
   Average time for Bedrock API calls
   Target: <5 seconds
   ```

3. **Fallback Usage Rate**
   ```
   Fallback analyses / Total analyses
   Target: <10%
   ```

4. **Customer Analysis Coverage**
   ```
   Customers with recent AI analysis / Active customers
   Target: >80%
   ```

### CloudWatch Dashboards

Create dashboards for:
- AI analysis volume and success rates
- Bedrock API call metrics
- Lambda performance metrics
- DynamoDB query performance
- Cost tracking

## 🔄 Maintenance and Updates

### Regular Maintenance Tasks

**Weekly:**
- Review Bedrock usage and costs
- Check error rates and fallback usage
- Monitor analysis result quality

**Monthly:**
- Update AI prompts based on feedback
- Review and optimize cache TTL settings
- Analyze customer analysis patterns

**Quarterly:**
- Evaluate model performance (Haiku vs Sonnet)
- Review and update IAM policies
- Performance testing and optimization

## 📞 Support and Escalation

### Issue Severity Levels

**Critical (P0):** AI analysis completely unavailable
- Immediate escalation to on-call engineer
- Enable fallback mode immediately
- Investigate Bedrock service status

**High (P1):** High error rate or poor analysis quality
- Investigate within 2 hours
- Check for Bedrock service issues
- Review recent deployments

**Medium (P2):** Performance degradation
- Investigate within 24 hours
- Optimize prompts or model selection
- Review cost efficiency

**Low (P3):** Feature requests or enhancements
- Plan for next development cycle
- Document requirements
- Evaluate cost/benefit

### Contact Information

- **Development Team:** ai-team@omnix.com
- **Infrastructure:** devops@omnix.com
- **Business Stakeholders:** product@omnix.com

---

## 🎉 Deployment Checklist

- [ ] AWS Bedrock access enabled
- [ ] Claude 3 model access granted
- [ ] IAM policies created and attached
- [ ] Lambda function deployed with AI components
- [ ] Environment variables configured
- [ ] DynamoDB tables created
- [ ] API Gateway configured
- [ ] Monitoring and alerts set up
- [ ] Test data seeded
- [ ] Comprehensive tests passed
- [ ] Performance benchmarks established
- [ ] Documentation updated
- [ ] Team trained on new features

**Congratulations! Your AI-powered customer analytics system is ready for production! 🚀**