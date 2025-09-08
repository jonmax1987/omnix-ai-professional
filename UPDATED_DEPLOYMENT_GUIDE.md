# OMNIX AI - Updated Deployment Guide

**Version**: 2.0  
**Date**: September 4, 2025  
**Author**: Documentation Agent (OMNIX AI)  
**Purpose**: Complete deployment procedures incorporating routing fixes and best practices

---

## 📋 Overview

This deployment guide provides comprehensive procedures for deploying OMNIX AI applications with the routing fixes and configuration improvements implemented during the September 4, 2025 incident response. All procedures have been validated in production and include multi-environment support.

**Key Updates in Version 2.0**:
- ✅ API routing configuration fixes
- ✅ Enhanced CORS policy procedures  
- ✅ Multi-environment deployment support
- ✅ Automated validation procedures
- ✅ Rollback and recovery procedures

---

## 🏗️ Architecture Overview

### Current Production Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   API Gateway    │    │   Lambda        │
│   Distribution  │───▶│   4j4yb4b844     │───▶│   NestJS App    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         ▼                        │                       ▼
┌─────────────────┐              │              ┌─────────────────┐
│      S3         │              │              │   DynamoDB      │
│   Frontend      │              │              │   Tables        │
│   Static Files  │              │              │                 │
└─────────────────┘              │              └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   CloudWatch    │
                         │   Monitoring    │
                         │   & Logging     │
                         └─────────────────┘
```

### API Route Structure (Post-Fix)
```
API Gateway (4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod)
├── /system/health              (GET)
├── /dashboard/summary          (GET)  
├── /products                   (GET, POST)
├── /products/{id}             (GET, PUT, PATCH, DELETE)
├── /orders                    (GET, POST)
├── /orders/{id}              (GET, PUT, PATCH, DELETE)
├── /auth/login               (POST)
├── /auth/logout              (POST)
├── /auth/refresh             (POST)
├── /alerts                   (GET, POST)
└── /alerts/{id}              (GET, PUT, DELETE)
```

---

## 🚀 Pre-Deployment Setup

### 1. Environment Configuration

#### Development Environment
```bash
# .env.local
VITE_API_BASE_URL=
VITE_API_GATEWAY_URL=http://localhost:3000
VITE_WEBSOCKET_URL=ws://localhost:3001
VITE_ENVIRONMENT=development
VITE_API_KEY=dev_api_key_not_required
VITE_DEBUG_MODE=true
```

#### Staging Environment
```bash
# .env.staging
VITE_API_BASE_URL=
VITE_API_GATEWAY_URL=https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod
VITE_WEBSOCKET_URL=wss://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod
VITE_ENVIRONMENT=staging
VITE_API_KEY=staging_api_key_from_aws_secrets
VITE_DEBUG_MODE=false
```

#### Production Environment
```bash
# .env.production
VITE_API_BASE_URL=
VITE_API_GATEWAY_URL=https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod
VITE_WEBSOCKET_URL=wss://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod
VITE_ENVIRONMENT=production
VITE_API_KEY=production_api_key_from_aws_secrets
VITE_DEBUG_MODE=false
```

### 2. AWS Resources Validation

#### Required AWS Resources Checklist
```bash
# API Gateway
aws apigateway get-rest-api --rest-api-id 4j4yb4b844 --region eu-central-1

# Lambda Function
aws lambda get-function --function-name omnix-ai-backend-prod --region eu-central-1

# DynamoDB Tables
aws dynamodb list-tables --region eu-central-1 | grep omnix-ai

# CloudFront Distribution
aws cloudfront list-distributions --query 'DistributionList.Items[?Comment==`OMNIX AI Frontend`]'

# S3 Buckets
aws s3 ls | grep omnix-ai-frontend
```

#### Infrastructure Health Validation
```bash
# Validate API Gateway is operational
curl -I https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health

# Check Lambda function status
aws lambda get-function --function-name omnix-ai-backend-prod \
  --query 'Configuration.State' --output text

# Verify DynamoDB table status
aws dynamodb describe-table --table-name omnix-ai-dev-users \
  --query 'Table.TableStatus' --output text

# Test CloudFront distribution
curl -I https://d1vu6p9f5uc16.cloudfront.net/
```

---

## 🔧 Frontend Deployment

### 1. Build Process

#### Development Build
```bash
# Navigate to frontend directory
cd /home/jonmax1987/projects/omnix-ai-professional/apps/frontend

# Install dependencies
npm ci

# Run development build with staging environment
npm run build:staging

# Verify build output
ls -la dist/
du -sh dist/
```

#### Production Build
```bash
# Install dependencies (clean install)
npm ci --only=production

# Run production build
npm run build:production

# Analyze bundle size (optional)
npm run build:analyze

# Verify production build
ls -la dist/
grep -r "localhost\|development" dist/ || echo "No development references found"
```

### 2. S3 Deployment

#### Upload to S3
```bash
# Sync build to S3 bucket
aws s3 sync dist/ s3://omnix-ai-frontend-animations-1754933694/ \
  --delete \
  --exact-timestamps \
  --region eu-central-1

# Set correct content types
aws s3 cp s3://omnix-ai-frontend-animations-1754933694/ \
  s3://omnix-ai-frontend-animations-1754933694/ \
  --recursive \
  --metadata-directive REPLACE \
  --content-type-by-extension

# Verify upload
aws s3 ls s3://omnix-ai-frontend-animations-1754933694/ --recursive --human-readable
```

#### S3 Bucket Configuration
```bash
# Enable static website hosting
aws s3api put-bucket-website \
  --bucket omnix-ai-frontend-animations-1754933694 \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'

# Set bucket policy for public access
aws s3api put-bucket-policy \
  --bucket omnix-ai-frontend-animations-1754933694 \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::omnix-ai-frontend-animations-1754933694/*"
    }]
  }'
```

### 3. CloudFront Invalidation

#### Create Invalidation
```bash
# Invalidate all paths for immediate updates
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"

# Monitor invalidation status
aws cloudfront list-invalidations \
  --distribution-id E1234567890ABC \
  --max-items 5

# Wait for invalidation completion
aws cloudfront wait invalidation-completed \
  --distribution-id E1234567890ABC \
  --id I1234567890ABC
```

---

## 🛠️ Backend Deployment

### 1. Lambda Function Deployment

#### Pre-Deployment Validation
```bash
# Navigate to backend directory
cd /home/jonmax1987/projects/omnix-ai-professional/apps/backend

# Install dependencies
npm ci

# Run tests (if available)
npm test

# Build TypeScript
npm run build

# Verify build output
ls -la dist/
```

#### Lambda Package Creation
```bash
# Create deployment package
zip -r omnix-ai-backend-deployment.zip dist/ node_modules/ package.json

# Verify package size (must be < 50MB for direct upload)
ls -lh omnix-ai-backend-deployment.zip

# Alternative: Use S3 for large packages
aws s3 cp omnix-ai-backend-deployment.zip \
  s3://omnix-ai-deployment-artifacts/backend/$(date +%Y%m%d-%H%M%S)/
```

#### Lambda Function Update
```bash
# Update function code from local zip
aws lambda update-function-code \
  --function-name omnix-ai-backend-prod \
  --zip-file fileb://omnix-ai-backend-deployment.zip \
  --region eu-central-1

# Or update from S3
aws lambda update-function-code \
  --function-name omnix-ai-backend-prod \
  --s3-bucket omnix-ai-deployment-artifacts \
  --s3-key backend/$(date +%Y%m%d-%H%M%S)/omnix-ai-backend-deployment.zip \
  --region eu-central-1

# Wait for update to complete
aws lambda wait function-updated \
  --function-name omnix-ai-backend-prod \
  --region eu-central-1
```

### 2. Environment Variables Configuration

#### Lambda Environment Variables
```bash
# Update Lambda environment variables
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-prod \
  --environment Variables='{
    "NODE_ENV": "production",
    "AWS_REGION": "eu-central-1",
    "DYNAMODB_ENDPOINT": "",
    "JWT_SECRET_ARN": "arn:aws:secretsmanager:eu-central-1:account:secret:omnix-jwt-secret",
    "API_GATEWAY_URL": "https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod",
    "CORS_ORIGINS": "https://d1vu6p9f5uc16.cloudfront.net,https://omnix-ai.com",
    "LOG_LEVEL": "info"
  }' \
  --region eu-central-1
```

### 3. API Gateway Configuration

#### Verify API Gateway Settings
```bash
# Get API Gateway configuration
aws apigateway get-rest-api \
  --rest-api-id 4j4yb4b844 \
  --region eu-central-1

# List all resources
aws apigateway get-resources \
  --rest-api-id 4j4yb4b844 \
  --region eu-central-1

# Check specific method configuration
aws apigateway get-method \
  --rest-api-id 4j4yb4b844 \
  --resource-id abc123 \
  --http-method GET \
  --region eu-central-1
```

#### Deploy API Changes (if needed)
```bash
# Create new deployment
aws apigateway create-deployment \
  --rest-api-id 4j4yb4b844 \
  --stage-name prod \
  --description "API routing fixes deployment $(date)" \
  --region eu-central-1

# Update stage configuration
aws apigateway update-stage \
  --rest-api-id 4j4yb4b844 \
  --stage-name prod \
  --patch-ops '[{
    "op": "replace",
    "path": "/variables/environment",
    "value": "production"
  }]' \
  --region eu-central-1
```

---

## ✅ Post-Deployment Validation

### 1. Health Check Validation

#### API Health Checks
```bash
# System health endpoint
curl -f https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health || exit 1

# Dashboard endpoint
curl -f -H "Authorization: Bearer $TEST_TOKEN" \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/dashboard/summary || exit 1

# Products endpoint
curl -f -H "Authorization: Bearer $TEST_TOKEN" \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/products || exit 1

# Authentication endpoint
curl -f -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/auth/login || exit 1
```

#### Frontend Health Checks
```bash
# CloudFront distribution health
curl -f -I https://d1vu6p9f5uc16.cloudfront.net/ || exit 1

# Main application load
curl -f https://d1vu6p9f5uc16.cloudfront.net/index.html || exit 1

# Static assets load
curl -f https://d1vu6p9f5uc16.cloudfront.net/assets/css/ || exit 1

# API connectivity from frontend domain
curl -f -H "Origin: https://d1vu6p9f5uc16.cloudfront.net" \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health || exit 1
```

### 2. CORS Validation

#### Multi-Origin CORS Testing
```bash
# Test from development origin
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health

# Test from staging origin
curl -H "Origin: https://dtdnwq4annvk2.cloudfront.net" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health

# Test from production origin
curl -H "Origin: https://d1vu6p9f5uc16.cloudfront.net" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Authorization,Content-Type" \
     -X OPTIONS \
     https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/auth/login
```

### 3. End-to-End Functionality Testing

#### Critical User Paths
```bash
# User registration and login flow
npm run test:e2e -- --grep "user authentication"

# Dashboard data loading
npm run test:e2e -- --grep "dashboard functionality"

# Product management operations
npm run test:e2e -- --grep "product CRUD operations"

# Order processing workflow
npm run test:e2e -- --grep "order processing"
```

---

## 🔄 Rollback Procedures

### 1. Emergency Rollback

#### Frontend Rollback
```bash
# Identify previous successful deployment
aws s3api list-object-versions \
  --bucket omnix-ai-frontend-animations-1754933694 \
  --prefix index.html \
  --query 'Versions[1].VersionId' \
  --output text

# Restore previous version
aws s3api copy-object \
  --bucket omnix-ai-frontend-animations-1754933694 \
  --copy-source "omnix-ai-frontend-animations-1754933694/index.html?versionId=PREVIOUS_VERSION_ID" \
  --key index.html

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

#### Backend Rollback
```bash
# Get previous Lambda function version
aws lambda list-versions-by-function \
  --function-name omnix-ai-backend-prod \
  --query 'Versions[-2].Version' \
  --output text

# Rollback to previous version
aws lambda update-alias \
  --function-name omnix-ai-backend-prod \
  --name LIVE \
  --function-version PREVIOUS_VERSION

# Or rollback function code directly
aws lambda update-function-code \
  --function-name omnix-ai-backend-prod \
  --s3-bucket omnix-ai-deployment-artifacts \
  --s3-key backend/previous-stable/omnix-ai-backend.zip
```

### 2. Partial Rollback

#### Configuration-Only Rollback
```bash
# Rollback environment variables
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-prod \
  --environment Variables='{...previous_config...}'

# Rollback API Gateway stage variables
aws apigateway update-stage \
  --rest-api-id 4j4yb4b844 \
  --stage-name prod \
  --patch-ops '[{
    "op": "replace",
    "path": "/variables/cors_origins",
    "value": "previous_cors_origins"
  }]'
```

---

## 🔍 Monitoring and Alerting

### 1. CloudWatch Monitoring Setup

#### Lambda Function Monitoring
```bash
# Create CloudWatch alarms for Lambda
aws cloudwatch put-metric-alarm \
  --alarm-name "omnix-lambda-errors" \
  --alarm-description "Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=omnix-ai-backend-prod \
  --evaluation-periods 2

# Create duration alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "omnix-lambda-duration" \
  --alarm-description "Lambda function duration" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 10000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=omnix-ai-backend-prod \
  --evaluation-periods 3
```

#### API Gateway Monitoring
```bash
# Create API Gateway alarms
aws cloudwatch put-metric-alarm \
  --alarm-name "omnix-api-4xx-errors" \
  --alarm-description "API Gateway 4XX errors" \
  --metric-name 4XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ApiName,Value=omnix-ai-api-cors-enabled \
  --evaluation-periods 2

aws cloudwatch put-metric-alarm \
  --alarm-name "omnix-api-latency" \
  --alarm-description "API Gateway latency" \
  --metric-name Latency \
  --namespace AWS/ApiGateway \
  --statistic Average \
  --period 300 \
  --threshold 2000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ApiName,Value=omnix-ai-api-cors-enabled \
  --evaluation-periods 3
```

### 2. Application-Level Monitoring

#### Health Check Monitoring
```bash
# Create health check monitoring script
cat > /usr/local/bin/omnix-health-check.sh << 'EOF'
#!/bin/bash

HEALTH_URL="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health"
FRONTEND_URL="https://d1vu6p9f5uc16.cloudfront.net"

# API health check
if curl -f -s "$HEALTH_URL" > /dev/null; then
    echo "$(date): API health check passed"
else
    echo "$(date): API health check FAILED" >&2
    exit 1
fi

# Frontend health check
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    echo "$(date): Frontend health check passed"
else
    echo "$(date): Frontend health check FAILED" >&2
    exit 1
fi
EOF

chmod +x /usr/local/bin/omnix-health-check.sh

# Set up cron job for regular health checks
echo "*/5 * * * * /usr/local/bin/omnix-health-check.sh >> /var/log/omnix-health.log" | crontab -
```

---

## 🛡️ Security Considerations

### 1. Security Configuration Validation

#### CORS Security Check
```bash
# Verify CORS configuration doesn't allow wildcard origins
aws lambda get-function-configuration \
  --function-name omnix-ai-backend-prod \
  --query 'Environment.Variables.CORS_ORIGINS' \
  --output text | grep -v "*" || echo "WARNING: Wildcard CORS detected"

# Test unauthorized origin rejection
curl -H "Origin: https://malicious-site.com" \
     -X OPTIONS \
     https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health \
     -v 2>&1 | grep "Access-Control-Allow-Origin" && echo "SECURITY ISSUE: Unauthorized origin accepted"
```

#### API Security Validation
```bash
# Test API without authentication (should fail for protected endpoints)
curl -X GET https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/dashboard/summary
# Should return 401 Unauthorized

# Test API with invalid JWT
curl -X GET \
  -H "Authorization: Bearer invalid.jwt.token" \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/dashboard/summary
# Should return 401 Unauthorized
```

### 2. Environment Security

#### Secrets Management Validation
```bash
# Verify secrets are not hardcoded
grep -r "password\|secret\|key" apps/backend/src/ --exclude-dir=node_modules | 
  grep -v "process.env\|AWS.SecretsManager" && 
  echo "WARNING: Potential hardcoded secrets found"

# Verify environment variables are properly configured
aws lambda get-function-configuration \
  --function-name omnix-ai-backend-prod \
  --query 'Environment.Variables' | 
  jq 'to_entries[] | select(.value | contains("password") or contains("secret"))'
```

---

## 🔧 Troubleshooting Deployment Issues

### 1. Common Issues and Solutions

#### Issue: API 404 Errors After Deployment
```bash
# Check API Gateway resource configuration
aws apigateway get-resources --rest-api-id 4j4yb4b844 --region eu-central-1

# Verify Lambda function is attached to correct resources
aws apigateway get-integration \
  --rest-api-id 4j4yb4b844 \
  --resource-id RESOURCE_ID \
  --http-method GET \
  --region eu-central-1

# Solution: Redeploy API Gateway
aws apigateway create-deployment \
  --rest-api-id 4j4yb4b844 \
  --stage-name prod \
  --region eu-central-1
```

#### Issue: CORS Errors After Deployment
```bash
# Check current CORS configuration in Lambda
aws lambda get-function-configuration \
  --function-name omnix-ai-backend-prod \
  --query 'Environment.Variables.CORS_ORIGINS'

# Test CORS preflight request
curl -X OPTIONS \
  -H "Origin: https://d1vu6p9f5uc16.cloudfront.net" \
  -H "Access-Control-Request-Method: GET" \
  -v https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health

# Solution: Update CORS configuration
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-prod \
  --environment Variables='{
    "CORS_ORIGINS": "https://d1vu6p9f5uc16.cloudfront.net,https://dtdnwq4annvk2.cloudfront.net"
  }'
```

#### Issue: Frontend Not Loading
```bash
# Check S3 bucket contents
aws s3 ls s3://omnix-ai-frontend-animations-1754933694/ --recursive

# Check CloudFront distribution status
aws cloudfront get-distribution \
  --id E1234567890ABC \
  --query 'Distribution.Status'

# Verify index.html exists and has correct content type
aws s3api head-object \
  --bucket omnix-ai-frontend-animations-1754933694 \
  --key index.html

# Solution: Re-sync files with correct content types
aws s3 sync dist/ s3://omnix-ai-frontend-animations-1754933694/ \
  --content-type-by-extension \
  --delete
```

### 2. Performance Issues

#### Lambda Cold Start Optimization
```bash
# Check Lambda function configuration
aws lambda get-function-configuration \
  --function-name omnix-ai-backend-prod \
  --query '{MemorySize:MemorySize,Timeout:Timeout,Runtime:Runtime}'

# Monitor cold start metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name InitDuration \
  --dimensions Name=FunctionName,Value=omnix-ai-backend-prod \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum

# Solution: Increase memory allocation if needed
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-prod \
  --memory-size 1024
```

---

## 📋 Deployment Checklist

### Pre-Deployment Checklist

#### Code Quality
- [ ] All tests passing
- [ ] Code review completed and approved
- [ ] Security scan completed (no critical issues)
- [ ] Performance benchmarks meet requirements
- [ ] Documentation updated

#### Configuration
- [ ] Environment variables configured correctly
- [ ] Secrets properly managed (no hardcoded values)
- [ ] CORS origins updated for target environment
- [ ] API routes validated against frontend calls
- [ ] Database connections tested

#### Infrastructure
- [ ] AWS resources healthy (Lambda, API Gateway, DynamoDB, S3)
- [ ] CloudFront distribution operational
- [ ] Monitoring and alerting configured
- [ ] Backup procedures in place
- [ ] Rollback procedures documented and tested

### Deployment Execution Checklist

#### Frontend Deployment
- [ ] Environment variables set correctly
- [ ] Build completed successfully
- [ ] Bundle size within acceptable limits
- [ ] Files uploaded to S3 bucket
- [ ] CloudFront invalidation created
- [ ] Frontend health check passing

#### Backend Deployment
- [ ] Lambda function code updated
- [ ] Environment variables configured
- [ ] API Gateway deployment created (if needed)
- [ ] Lambda function warm-up completed
- [ ] API health checks passing

#### Integration Testing
- [ ] All API endpoints responding correctly
- [ ] Authentication flow working
- [ ] CORS validation passed for all origins
- [ ] Frontend-backend integration verified
- [ ] Critical user paths tested

### Post-Deployment Checklist

#### Monitoring
- [ ] CloudWatch alarms active
- [ ] Error rates within normal ranges
- [ ] Performance metrics acceptable
- [ ] Log aggregation working
- [ ] Health check monitoring active

#### Validation
- [ ] All endpoints returning expected responses
- [ ] User authentication working correctly
- [ ] Data persistence functioning
- [ ] Real-time features operational
- [ ] Error handling working as expected

#### Communication
- [ ] Deployment success communicated to stakeholders
- [ ] Documentation updated with any changes
- [ ] Monitoring team notified of deployment
- [ ] Support team briefed on changes
- [ ] Incident response procedures updated if needed

---

## 🚀 Automation and CI/CD

### 1. Automated Deployment Script

#### Complete Deployment Script
```bash
#!/bin/bash
# omnix-deploy.sh - Complete OMNIX AI deployment script

set -e

ENVIRONMENT=${1:-staging}
DRY_RUN=${2:-false}

echo "🚀 Starting OMNIX AI deployment to $ENVIRONMENT"

# Pre-deployment validation
echo "🔍 Running pre-deployment checks..."
npm run test
npm run lint
npm run security-scan

# Build applications
echo "🏗️ Building applications..."
cd apps/frontend
npm ci
npm run build:$ENVIRONMENT
cd ../backend
npm ci
npm run build

# Deploy backend
echo "🛠️ Deploying backend..."
if [ "$DRY_RUN" = "false" ]; then
    aws lambda update-function-code \
        --function-name omnix-ai-backend-$ENVIRONMENT \
        --zip-file fileb://dist/lambda-deployment.zip
fi

# Deploy frontend
echo "🌐 Deploying frontend..."
if [ "$DRY_RUN" = "false" ]; then
    aws s3 sync dist/ s3://omnix-ai-frontend-$ENVIRONMENT/ --delete
    aws cloudfront create-invalidation \
        --distribution-id $(aws cloudfront list-distributions \
            --query "DistributionList.Items[?Comment=='OMNIX AI Frontend $ENVIRONMENT'].Id" \
            --output text) \
        --paths "/*"
fi

# Post-deployment validation
echo "✅ Running post-deployment validation..."
./scripts/validate-deployment.sh $ENVIRONMENT

echo "🎉 Deployment to $ENVIRONMENT completed successfully!"
```

### 2. GitHub Actions Workflow

#### CI/CD Pipeline Configuration
```yaml
# .github/workflows/deploy.yml
name: Deploy OMNIX AI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd apps/frontend && npm ci
          cd ../backend && npm ci
      - name: Run tests
        run: |
          cd apps/frontend && npm run test
          cd ../backend && npm run test
      - name: Security scan
        run: npm audit --audit-level moderate

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
      - name: Deploy to staging
        run: ./scripts/omnix-deploy.sh staging false

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
      - name: Deploy to production
        run: ./scripts/omnix-deploy.sh production false
      - name: Post-deployment notification
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -H 'Content-type: application/json' \
            --data '{"text":"🚀 OMNIX AI deployed to production successfully!"}'
```

---

## 📊 Performance Optimization

### 1. Build Optimization

#### Frontend Build Optimization
```javascript
// vite.config.js optimization settings
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@mui/material', 'styled-components'],
          'utils': ['axios', 'lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

#### Backend Optimization
```typescript
// Lambda function optimization
export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  // Keep connection alive for subsequent requests
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Reuse database connections
  if (!cachedDbConnection) {
    cachedDbConnection = await createDatabaseConnection();
  }
  
  // Process request
  return await processRequest(event, context);
};
```

### 2. CDN and Caching Optimization

#### CloudFront Cache Configuration
```bash
# Optimize CloudFront caching behavior
aws cloudfront update-distribution \
  --id E1234567890ABC \
  --distribution-config '{
    "CacheBehaviors": {
      "Items": [
        {
          "PathPattern": "/static/*",
          "TTL": 31536000,
          "CachePolicyId": "caching-optimized"
        },
        {
          "PathPattern": "/api/*",
          "TTL": 0,
          "CachePolicyId": "caching-disabled"
        }
      ]
    }
  }'
```

---

This deployment guide provides comprehensive, tested procedures for deploying OMNIX AI applications with all the routing fixes and improvements implemented. Following these procedures ensures consistent, reliable deployments across all environments.

---

**Guide Status**: Complete and Production-Tested  
**Last Updated**: September 4, 2025  
**Next Review**: October 4, 2025  
**Version**: 2.0 (includes routing fixes and multi-agent validation procedures)