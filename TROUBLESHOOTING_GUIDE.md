# OMNIX AI - Troubleshooting Guide

**Version**: 1.0  
**Date**: September 4, 2025  
**Author**: Documentation Agent (OMNIX AI)  
**Purpose**: Common issues, solutions, and diagnostic procedures for OMNIX AI platform

---

## 📋 Overview

This troubleshooting guide provides comprehensive solutions for common issues encountered in the OMNIX AI platform. Based on real production incidents, including the September 4, 2025 API routing issue, this guide enables rapid problem resolution and system recovery.

**Issue Categories Covered**:
- 🌐 API and Routing Issues
- 🔐 Authentication and Security Problems  
- 🚀 Deployment and Infrastructure Issues
- ⚡ Performance and Optimization Problems
- 💾 Database and Data Issues
- 🖥️ Frontend and UI Problems

---

## 🚨 Emergency Procedures

### Critical System Down (Level 1)
If the entire system is unavailable:

1. **Immediate Assessment** (0-2 minutes)
   ```bash
   # Quick system health check
   curl -I https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health
   curl -I https://d1vu6p9f5uc16.cloudfront.net/
   ```

2. **Activate Multi-Agent Response** (2-5 minutes)
   ```bash
   # Start orchestrator with emergency response
   /emergency-response --severity critical --type system-down
   ```

3. **Check AWS Service Status** (1 minute)
   ```bash
   # AWS service status
   aws health describe-events --region eu-central-1
   # Or visit: https://status.aws.amazon.com/
   ```

4. **Immediate Rollback** (if recent deployment)
   ```bash
   # Lambda rollback
   aws lambda update-alias --function-name omnix-ai-backend-prod \
     --name LIVE --function-version $PREVIOUS_VERSION
   
   # CloudFront rollback
   aws s3 sync s3://omnix-ai-frontend-backup/ \
     s3://omnix-ai-frontend-animations-1754933694/ --delete
   aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
   ```

---

## 🌐 API and Routing Issues

### Issue: API 404 Errors

**Symptoms**:
- Frontend shows "Failed to load data"
- API calls returning 404 Not Found
- Browser console shows network errors

**Diagnosis**:
```bash
# Check specific endpoint
curl -v https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health

# Check API Gateway resources
aws apigateway get-resources --rest-api-id 4j4yb4b844 --region eu-central-1

# Check Lambda function mapping
aws apigateway get-integration --rest-api-id 4j4yb4b844 \
  --resource-id YOUR_RESOURCE_ID --http-method GET --region eu-central-1
```

**Common Causes & Solutions**:

1. **Route Mismatch (Most Common)**
   ```bash
   # Problem: Frontend calling /v1/endpoint, backend expects /endpoint
   
   # Solution 1: Update frontend routes (Recommended)
   # In apps/frontend/src/services/httpClient.js
   const HTTP_CONFIG = {
     baseURL: '', // Remove /v1 prefix
   };
   
   # Solution 2: Update backend routes (if needed)
   # In apps/backend: Add global prefix
   app.setGlobalPrefix('v1');
   ```

2. **API Gateway Deployment Not Updated**
   ```bash
   # Deploy API Gateway changes
   aws apigateway create-deployment \
     --rest-api-id 4j4yb4b844 \
     --stage-name prod \
     --region eu-central-1
   ```

3. **Lambda Function Not Connected**
   ```bash
   # Check Lambda integration
   aws apigateway get-method --rest-api-id 4j4yb4b844 \
     --resource-id YOUR_RESOURCE_ID --http-method GET
   
   # Fix integration if missing
   aws apigateway put-integration \
     --rest-api-id 4j4yb4b844 \
     --resource-id YOUR_RESOURCE_ID \
     --http-method GET \
     --type AWS_PROXY \
     --integration-http-method POST \
     --uri "arn:aws:apigateway:eu-central-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-central-1:ACCOUNT:function:omnix-ai-backend-prod/invocations"
   ```

### Issue: CORS Errors

**Symptoms**:
- Browser console: "Access-Control-Allow-Origin" errors
- Preflight OPTIONS requests failing
- API calls work in Postman but not in browser

**Diagnosis**:
```bash
# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: https://d1vu6p9f5uc16.cloudfront.net" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  -v https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health

# Check current Lambda CORS configuration
aws lambda get-function-configuration \
  --function-name omnix-ai-backend-prod \
  --query 'Environment.Variables'
```

**Solutions**:

1. **Update CORS Origins in Lambda**
   ```typescript
   // In apps/backend/deployment/lambda.ts
   app.enableCors({
     origin: [
       'http://localhost:5173',
       'https://d1vu6p9f5uc16.cloudfront.net',
       'https://dtdnwq4annvk2.cloudfront.net',
       'https://omnix-ai.com',
       // Add your domain here
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
   });
   ```

2. **Enable CORS in API Gateway**
   ```bash
   # Enable CORS for specific resource
   aws apigateway put-method --rest-api-id 4j4yb4b844 \
     --resource-id YOUR_RESOURCE_ID \
     --http-method OPTIONS \
     --authorization-type NONE
   
   # Add CORS headers to method response
   aws apigateway put-method-response \
     --rest-api-id 4j4yb4b844 \
     --resource-id YOUR_RESOURCE_ID \
     --http-method OPTIONS \
     --status-code 200 \
     --response-parameters "method.response.header.Access-Control-Allow-Origin=true"
   ```

### Issue: API Gateway Timeout

**Symptoms**:
- "Gateway Timeout" errors
- Lambda function logs show incomplete execution
- Requests hanging for 30+ seconds

**Diagnosis**:
```bash
# Check Lambda function timeout settings
aws lambda get-function-configuration \
  --function-name omnix-ai-backend-prod \
  --query '{Timeout:Timeout,MemorySize:MemorySize}'

# Check API Gateway timeout settings
aws apigateway get-method --rest-api-id 4j4yb4b844 \
  --resource-id YOUR_RESOURCE_ID --http-method GET \
  --query 'methodIntegration.timeoutInMillis'

# Check recent Lambda executions
aws logs tail "/aws/lambda/omnix-ai-backend-prod" --since 1h | grep TIMEOUT
```

**Solutions**:
```bash
# Increase Lambda timeout (max 15 minutes)
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-prod \
  --timeout 30

# Increase API Gateway timeout (max 29 seconds)
aws apigateway update-integration \
  --rest-api-id 4j4yb4b844 \
  --resource-id YOUR_RESOURCE_ID \
  --http-method GET \
  --patch-ops 'op=replace,path=/timeoutInMillis,value=29000'

# Increase Lambda memory for better performance
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-prod \
  --memory-size 1024
```

---

## 🔐 Authentication and Security Issues

### Issue: JWT Token Authentication Failures

**Symptoms**:
- Users getting logged out randomly
- "Unauthorized" errors on protected endpoints
- Token refresh not working

**Diagnosis**:
```bash
# Check JWT token validity (decode without verification for debugging)
echo "YOUR_JWT_TOKEN" | cut -d. -f2 | base64 -d | jq .

# Test authentication endpoint
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"validpassword"}' \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/auth/login

# Check protected endpoint with token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/dashboard/summary
```

**Common Solutions**:

1. **Token Expiration Issues**
   ```javascript
   // In frontend: Check token expiration before API calls
   const isTokenExpired = (token) => {
     try {
       const payload = JSON.parse(atob(token.split('.')[1]));
       return Date.now() >= payload.exp * 1000;
     } catch (error) {
       return true;
     }
   };
   
   // Automatically refresh tokens
   if (isTokenExpired(token)) {
     await refreshAuthToken();
   }
   ```

2. **JWT Secret Mismatch**
   ```bash
   # Verify JWT secret is consistent
   aws secretsmanager get-secret-value \
     --secret-id omnix-jwt-secret \
     --query 'SecretString' --output text
   
   # Update Lambda environment if needed
   aws lambda update-function-configuration \
     --function-name omnix-ai-backend-prod \
     --environment Variables='{"JWT_SECRET_ARN":"arn:aws:secretsmanager:eu-central-1:ACCOUNT:secret:omnix-jwt-secret"}'
   ```

3. **Cross-Domain Token Storage Issues**
   ```javascript
   // In frontend: Use consistent token storage
   const tokenStorage = {
     set: (token) => localStorage.setItem('omnix_token', token),
     get: () => localStorage.getItem('omnix_token'),
     remove: () => localStorage.removeItem('omnix_token')
   };
   ```

### Issue: API Key Authentication Problems

**Symptoms**:
- API calls rejected with "Invalid API Key"
- Inconsistent authentication behavior
- Some endpoints work, others don't

**Diagnosis**:
```bash
# Test with API key
curl -H "X-API-Key: YOUR_API_KEY" \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health

# Check API Gateway API key configuration
aws apigateway get-api-keys --include-values \
  --query 'items[?name==`omnix-api-key`]'

# Check usage plan association
aws apigateway get-usage-plans \
  --query 'items[?name==`omnix-usage-plan`]'
```

**Solutions**:
```bash
# Create or update API key
aws apigateway create-api-key \
  --name omnix-api-key \
  --description "OMNIX AI API Key" \
  --enabled

# Associate with usage plan
aws apigateway create-usage-plan-key \
  --usage-plan-id YOUR_USAGE_PLAN_ID \
  --key-id YOUR_API_KEY_ID \
  --key-type API_KEY
```

---

## 🚀 Deployment and Infrastructure Issues

### Issue: Lambda Function Not Updating

**Symptoms**:
- Code changes not reflected in production
- Old version still running after deployment
- Function appears updated but behavior unchanged

**Diagnosis**:
```bash
# Check Lambda function version and update time
aws lambda get-function --function-name omnix-ai-backend-prod \
  --query '{Version:Configuration.Version,LastModified:Configuration.LastModified,CodeSize:Configuration.CodeSize}'

# Check function aliases
aws lambda list-aliases --function-name omnix-ai-backend-prod

# Verify deployment package
aws lambda get-function --function-name omnix-ai-backend-prod \
  --query 'Code.Location' --output text | xargs curl -I
```

**Solutions**:

1. **Force Update with New Zip**
   ```bash
   # Create new deployment package
   cd apps/backend
   npm run build
   zip -r ../omnix-backend-$(date +%Y%m%d-%H%M%S).zip dist/ node_modules/ package.json
   
   # Update function code
   aws lambda update-function-code \
     --function-name omnix-ai-backend-prod \
     --zip-file fileb://omnix-backend-$(date +%Y%m%d-%H%M%S).zip
   
   # Wait for update to complete
   aws lambda wait function-updated --function-name omnix-ai-backend-prod
   ```

2. **Update via S3 (for large packages)**
   ```bash
   # Upload to S3
   aws s3 cp omnix-backend-$(date +%Y%m%d-%H%M%S).zip \
     s3://omnix-deployment-artifacts/lambda/
   
   # Update from S3
   aws lambda update-function-code \
     --function-name omnix-ai-backend-prod \
     --s3-bucket omnix-deployment-artifacts \
     --s3-key lambda/omnix-backend-$(date +%Y%m%d-%H%M%S).zip
   ```

3. **Clear Lambda Cache (if using layers)**
   ```bash
   # Update function configuration to trigger cache clear
   aws lambda update-function-configuration \
     --function-name omnix-ai-backend-prod \
     --environment Variables='{"CACHE_BUST":"'$(date +%s)'"}'
   ```

### Issue: CloudFront Not Serving Updated Files

**Symptoms**:
- Old frontend version still displayed
- New files uploaded to S3 but not accessible
- Cached content not updating

**Diagnosis**:
```bash
# Check S3 bucket contents
aws s3 ls s3://omnix-ai-frontend-animations-1754933694/ --recursive \
  --human-readable --summarize

# Check CloudFront distribution
aws cloudfront get-distribution --id E1234567890ABC \
  --query 'Distribution.{Status:Status,DomainName:DomainName}'

# Check recent invalidations
aws cloudfront list-invalidations --distribution-id E1234567890ABC --max-items 5
```

**Solutions**:

1. **Create CloudFront Invalidation**
   ```bash
   # Invalidate all files
   aws cloudfront create-invalidation \
     --distribution-id E1234567890ABC \
     --paths "/*"
   
   # Invalidate specific files only
   aws cloudfront create-invalidation \
     --distribution-id E1234567890ABC \
     --paths "/index.html" "/static/js/main.*.js" "/static/css/main.*.css"
   
   # Monitor invalidation progress
   aws cloudfront list-invalidations --distribution-id E1234567890ABC
   ```

2. **Update S3 Objects with Correct Headers**
   ```bash
   # Set correct content types
   aws s3 cp s3://omnix-ai-frontend-animations-1754933694/ \
     s3://omnix-ai-frontend-animations-1754933694/ \
     --recursive --metadata-directive REPLACE \
     --content-type-by-extension
   
   # Set cache control headers
   aws s3 cp dist/ s3://omnix-ai-frontend-animations-1754933694/ \
     --recursive \
     --cache-control "public, max-age=31536000" \
     --exclude "index.html"
   
   # Set index.html with no cache
   aws s3 cp dist/index.html s3://omnix-ai-frontend-animations-1754933694/index.html \
     --cache-control "no-cache, no-store, must-revalidate"
   ```

3. **Update CloudFront Behaviors**
   ```bash
   # Check current cache behaviors
   aws cloudfront get-distribution-config --id E1234567890ABC \
     --query 'DistributionConfig.DefaultCacheBehavior'
   
   # Update cache behavior (complex operation - consider using AWS Console)
   ```

---

## ⚡ Performance and Optimization Issues

### Issue: Slow API Response Times

**Symptoms**:
- API calls taking >2 seconds
- Frontend showing loading states for extended periods
- Users reporting slow application performance

**Diagnosis**:
```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health

# Check Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=omnix-ai-backend-prod \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum

# Check DynamoDB throttling
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ThrottledRequests \
  --dimensions Name=TableName,Value=omnix-ai-dev-users \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

**Solutions**:

1. **Optimize Lambda Function**
   ```bash
   # Increase memory allocation (improves CPU performance)
   aws lambda update-function-configuration \
     --function-name omnix-ai-backend-prod \
     --memory-size 1024
   
   # Set reserved concurrency to avoid cold starts
   aws lambda put-reserved-concurrency \
     --function-name omnix-ai-backend-prod \
     --reserved-concurrent-executions 10
   
   # Enable provisioned concurrency
   aws lambda put-provisioned-concurrency-config \
     --function-name omnix-ai-backend-prod \
     --qualifier \$LATEST \
     --provisioned-concurrency-config ProvisionedConcurrencyUnits=5
   ```

2. **Optimize Database Queries**
   ```javascript
   // In backend code: Add connection reuse
   let cachedClient = null;
   
   const getDynamoDBClient = () => {
     if (!cachedClient) {
       cachedClient = new AWS.DynamoDB.DocumentClient({
         region: 'eu-central-1',
         httpOptions: {
           timeout: 5000,
           agent: new https.Agent({
             keepAlive: true,
             maxSockets: 50
           })
         }
       });
     }
     return cachedClient;
   };
   
   // Use parallel queries where possible
   const [users, products] = await Promise.all([
     getUsersFromDB(),
     getProductsFromDB()
   ]);
   ```

3. **Add Response Caching**
   ```typescript
   // In NestJS backend: Add caching interceptor
   @UseInterceptors(CacheInterceptor)
   @CacheTTL(300) // 5 minutes
   @Get('dashboard/summary')
   async getDashboardSummary() {
     return await this.dashboardService.getSummary();
   }
   ```

### Issue: Lambda Cold Start Problems

**Symptoms**:
- First request after inactivity is very slow (>3 seconds)
- Intermittent slow responses during low traffic periods
- Timeout errors on cold starts

**Diagnosis**:
```bash
# Check cold start metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name InitDuration \
  --dimensions Name=FunctionName,Value=omnix-ai-backend-prod \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum

# Check concurrent executions
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name ConcurrentExecutions \
  --dimensions Name=FunctionName,Value=omnix-ai-backend-prod \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum
```

**Solutions**:

1. **Enable Provisioned Concurrency**
   ```bash
   # Create alias for stable version
   aws lambda create-alias \
     --function-name omnix-ai-backend-prod \
     --name LIVE \
     --function-version \$LATEST
   
   # Configure provisioned concurrency
   aws lambda put-provisioned-concurrency-config \
     --function-name omnix-ai-backend-prod \
     --qualifier LIVE \
     --provisioned-concurrency-config ProvisionedConcurrencyUnits=3
   ```

2. **Optimize Cold Start Code**
   ```typescript
   // Move initialization outside handler
   import { NestFactory } from '@nestjs/core';
   import { AppModule } from './app.module';
   
   let cachedServer;
   
   const createServer = async () => {
     if (!cachedServer) {
       const app = await NestFactory.create(AppModule);
       await app.init();
       cachedServer = app;
     }
     return cachedServer;
   };
   
   export const handler = async (event, context) => {
     const server = await createServer();
     return await server.handleRequest(event, context);
   };
   ```

3. **Keep Functions Warm**
   ```bash
   # Create CloudWatch rule to ping function every 5 minutes
   aws events put-rule \
     --name omnix-lambda-warmer \
     --schedule-expression "rate(5 minutes)" \
     --description "Keep Lambda function warm"
   
   # Add target
   aws events put-targets \
     --rule omnix-lambda-warmer \
     --targets "Id"="1","Arn"="arn:aws:lambda:eu-central-1:ACCOUNT:function:omnix-ai-backend-prod","Input"='{"warmer":true}'
   ```

---

## 💾 Database and Data Issues

### Issue: DynamoDB Throttling

**Symptoms**:
- "ProvisionedThroughputExceededException" errors
- Slow database operations
- API timeouts during high load

**Diagnosis**:
```bash
# Check throttling metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=omnix-ai-dev-users \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Check table capacity
aws dynamodb describe-table --table-name omnix-ai-dev-users \
  --query 'Table.{ReadCapacity:ProvisionedThroughput.ReadCapacityUnits,WriteCapacity:ProvisionedThroughput.WriteCapacityUnits}'
```

**Solutions**:

1. **Increase Table Capacity**
   ```bash
   # Update table capacity
   aws dynamodb update-table \
     --table-name omnix-ai-dev-users \
     --provisioned-throughput ReadCapacityUnits=20,WriteCapacityUnits=10
   ```

2. **Enable Auto Scaling**
   ```bash
   # Enable auto scaling for reads
   aws application-autoscaling register-scalable-target \
     --service-namespace dynamodb \
     --resource-id table/omnix-ai-dev-users \
     --scalable-dimension dynamodb:table:ReadCapacityUnits \
     --min-capacity 5 \
     --max-capacity 100
   
   # Create scaling policy
   aws application-autoscaling put-scaling-policy \
     --policy-name omnix-users-read-scaling \
     --service-namespace dynamodb \
     --resource-id table/omnix-ai-dev-users \
     --scalable-dimension dynamodb:table:ReadCapacityUnits \
     --policy-type TargetTrackingScaling \
     --target-tracking-scaling-policy-configuration '{
       "TargetValue": 70.0,
       "ScaleInCooldown": 60,
       "ScaleOutCooldown": 60,
       "PredefinedMetricSpecification": {
         "PredefinedMetricType": "DynamoDBReadCapacityUtilization"
       }
     }'
   ```

3. **Optimize Database Queries**
   ```javascript
   // Use batch operations where possible
   const batchGetItems = async (keys) => {
     const params = {
       RequestItems: {
         'omnix-ai-dev-users': {
           Keys: keys
         }
       }
     };
     return await dynamodb.batchGet(params).promise();
   };
   
   // Use query instead of scan
   const getUsersByStatus = async (status) => {
     const params = {
       TableName: 'omnix-ai-dev-users',
       IndexName: 'status-index',
       KeyConditionExpression: '#status = :status',
       ExpressionAttributeNames: { '#status': 'status' },
       ExpressionAttributeValues: { ':status': status }
     };
     return await dynamodb.query(params).promise();
   };
   ```

### Issue: Data Inconsistency

**Symptoms**:
- Different data shown in different parts of the application
- Stale data displayed after updates
- Race conditions in concurrent operations

**Diagnosis**:
```bash
# Check for multiple table versions
aws dynamodb list-tables --query 'TableNames[?contains(@, `omnix`)]'

# Verify table schema consistency
aws dynamodb describe-table --table-name omnix-ai-dev-users \
  --query 'Table.{Attributes:AttributeDefinitions,Keys:KeySchema}'

# Check for failed transactions
aws logs filter-log-events \
  --log-group-name "/aws/lambda/omnix-ai-backend-prod" \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --filter-pattern "ERROR Transaction"
```

**Solutions**:

1. **Implement Consistent Reads**
   ```javascript
   // Use consistent reads for critical operations
   const getUserConsistent = async (userId) => {
     const params = {
       TableName: 'omnix-ai-dev-users',
       Key: { userId },
       ConsistentRead: true
     };
     return await dynamodb.get(params).promise();
   };
   ```

2. **Use DynamoDB Transactions**
   ```javascript
   // Atomic updates across multiple items
   const updateUserAndOrder = async (userId, orderId, updates) => {
     const params = {
       TransactItems: [
         {
           Update: {
             TableName: 'omnix-ai-dev-users',
             Key: { userId },
             UpdateExpression: 'SET #attr = :val',
             ExpressionAttributeNames: { '#attr': 'lastOrderId' },
             ExpressionAttributeValues: { ':val': orderId }
           }
         },
         {
           Put: {
             TableName: 'omnix-ai-dev-orders',
             Item: {
               orderId,
               userId,
               ...updates,
               createdAt: new Date().toISOString()
             }
           }
         }
       ]
     };
     return await dynamodb.transactWrite(params).promise();
   };
   ```

---

## 🖥️ Frontend and UI Issues

### Issue: Frontend Not Loading

**Symptoms**:
- Blank page or error page displayed
- JavaScript errors in browser console
- Static assets not loading

**Diagnosis**:
```bash
# Check if frontend is accessible
curl -I https://d1vu6p9f5uc16.cloudfront.net/

# Check S3 bucket contents
aws s3 ls s3://omnix-ai-frontend-animations-1754933694/ --recursive

# Check CloudFront distribution
aws cloudfront get-distribution --id E1234567890ABC \
  --query 'Distribution.Status'

# Test direct S3 access
curl -I http://omnix-ai-frontend-animations-1754933694.s3-website.eu-central-1.amazonaws.com/
```

**Solutions**:

1. **Fix Missing Files**
   ```bash
   # Re-upload missing files
   cd apps/frontend
   npm run build:production
   aws s3 sync dist/ s3://omnix-ai-frontend-animations-1754933694/ \
     --delete --content-type-by-extension
   
   # Invalidate CloudFront cache
   aws cloudfront create-invalidation \
     --distribution-id E1234567890ABC --paths "/*"
   ```

2. **Fix S3 Website Configuration**
   ```bash
   # Configure S3 for static website hosting
   aws s3api put-bucket-website \
     --bucket omnix-ai-frontend-animations-1754933694 \
     --website-configuration '{
       "IndexDocument": {"Suffix": "index.html"},
       "ErrorDocument": {"Key": "index.html"}
     }'
   
   # Set correct bucket policy
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

### Issue: JavaScript Runtime Errors

**Symptoms**:
- Console shows "Uncaught TypeError" or similar errors
- Application partially works but some features broken
- White screen of death

**Diagnosis**:
```bash
# Check build for errors
cd apps/frontend
npm run build:production 2>&1 | tee build.log

# Check for TypeScript errors
npm run type-check

# Test in different browsers
# - Chrome DevTools Console
# - Firefox Developer Console
# - Safari Web Inspector
```

**Common Solutions**:

1. **Fix Import/Export Issues**
   ```javascript
   // Check for default vs named exports
   
   // Wrong
   import Component from './Component'; // when Component is exported as named export
   
   // Correct
   import { Component } from './Component';
   
   // Or fix the export
   export default Component;
   ```

2. **Fix Async/Await Issues**
   ```javascript
   // Add proper error handling
   const fetchData = async () => {
     try {
       const response = await api.getData();
       setData(response.data);
     } catch (error) {
       console.error('Failed to fetch data:', error);
       setError(error.message);
     }
   };
   ```

3. **Fix State Management Issues**
   ```javascript
   // Ensure state updates are properly handled
   const [data, setData] = useState(null);
   
   useEffect(() => {
     fetchData().catch(error => {
       console.error('Error in useEffect:', error);
     });
   }, []);
   ```

---

## 🔍 Diagnostic Tools and Scripts

### System Health Check Script
```bash
#!/bin/bash
# omnix-health-diagnostic.sh

echo "🔍 OMNIX AI System Diagnostic"
echo "============================="

# API Health
echo "📡 Testing API endpoints..."
if curl -f -s https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health > /dev/null; then
    echo "✅ API Gateway: Healthy"
else
    echo "❌ API Gateway: Failed"
    echo "   Checking API Gateway status..."
    aws apigateway get-rest-api --rest-api-id 4j4yb4b844 --region eu-central-1 --query '{Name:name,CreatedDate:createdDate}' 2>/dev/null || echo "   API Gateway not accessible"
fi

# Lambda Function Health
echo "🔧 Checking Lambda function..."
LAMBDA_STATE=$(aws lambda get-function --function-name omnix-ai-backend-prod --query 'Configuration.State' --output text 2>/dev/null)
if [ "$LAMBDA_STATE" = "Active" ]; then
    echo "✅ Lambda Function: Active"
else
    echo "❌ Lambda Function: $LAMBDA_STATE"
fi

# Database Health
echo "💾 Testing database connectivity..."
if aws dynamodb scan --table-name omnix-ai-dev-users --max-items 1 > /dev/null 2>&1; then
    echo "✅ DynamoDB: Accessible"
else
    echo "❌ DynamoDB: Connection failed"
fi

# Frontend Health
echo "🌐 Testing frontend..."
if curl -f -s https://d1vu6p9f5uc16.cloudfront.net/ > /dev/null; then
    echo "✅ Frontend: Accessible"
else
    echo "❌ Frontend: Failed to load"
fi

# CORS Test
echo "🔒 Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
  -H "Origin: https://d1vu6p9f5uc16.cloudfront.net" \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health | \
  grep -i "access-control-allow-origin")

if [ -n "$CORS_RESPONSE" ]; then
    echo "✅ CORS: Configured correctly"
else
    echo "❌ CORS: Configuration issues detected"
fi

echo "============================="
echo "🏁 Diagnostic complete"
```

### Performance Analysis Script
```bash
#!/bin/bash
# performance-analysis.sh

echo "⚡ OMNIX AI Performance Analysis"
echo "==============================="

# API Response Times
echo "📊 Measuring API response times..."
for endpoint in "system/health" "dashboard/summary"; do
    echo "Testing /$endpoint..."
    TIME=$(curl -w "%{time_total}" -o /dev/null -s \
      https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/$endpoint)
    echo "  Response time: ${TIME}s"
    
    if (( $(echo "$TIME > 2.0" | bc -l) )); then
        echo "  ⚠️  Slower than target (2.0s)"
    else
        echo "  ✅ Within target"
    fi
done

# Lambda Performance
echo "🔧 Lambda performance metrics..."
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=omnix-ai-backend-prod \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average,Maximum \
  --query 'Datapoints[0].{Average:Average,Maximum:Maximum}' \
  --output table

# Cold Start Analysis
echo "🥶 Cold start analysis..."
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name InitDuration \
  --dimensions Name=FunctionName,Value=omnix-ai-backend-prod \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average,Maximum \
  --query 'Datapoints[0].{Average:Average,Maximum:Maximum}' \
  --output table

echo "==============================="
```

---

## 📞 Emergency Contacts and Escalation

### Incident Severity Levels

**Level 1 - Critical (Immediate Response)**
- Complete system outage
- Security breach
- Data loss or corruption
- **Response Time**: <15 minutes
- **Escalation**: Immediately notify all stakeholders

**Level 2 - High (4-hour Response)**
- Major feature failures
- Significant performance degradation
- Authentication system issues
- **Response Time**: <4 hours
- **Escalation**: Notify technical team and management

**Level 3 - Medium (24-hour Response)**
- Minor feature issues
- Non-critical performance issues
- UI/UX problems
- **Response Time**: <24 hours
- **Escalation**: Standard technical team response

### Contact Information
```
🚨 EMERGENCY CONTACTS

Technical Lead: [Name] - [Phone] - [Email]
DevOps Engineer: [Name] - [Phone] - [Email]
Security Officer: [Name] - [Phone] - [Email]
Product Owner: [Name] - [Phone] - [Email]

📞 Escalation Chain:
1. Technical Team → 2. Management → 3. Executive Team

🔗 Communication Channels:
- Slack: #omnix-incidents
- Email: incidents@omnix-ai.com
- Phone: Emergency hotline
```

---

## 📚 Additional Resources

### Documentation Links
- **[INCIDENT_RESPONSE_REPORT.md]**: Complete incident documentation and analysis
- **[API_ROUTING_FIXES_GUIDE.md]**: Technical implementation details for routing fixes
- **[MULTI_AGENT_ORCHESTRATION_PLAYBOOK.md]**: Emergency response coordination procedures
- **[UPDATED_DEPLOYMENT_GUIDE.md]**: Complete deployment procedures and best practices
- **[PRODUCTION_READINESS_CHECKLIST.md]**: Pre-deployment validation procedures

### Monitoring Dashboards
- **CloudWatch Dashboard**: [AWS Console Link]
- **Application Performance**: [Monitoring Tool Link]
- **Error Tracking**: [Error Tracking Tool Link]
- **Uptime Monitoring**: [Uptime Service Link]

### Useful Commands Reference
```bash
# Quick system status
curl -f https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/system/health

# Lambda logs (last hour)
aws logs tail "/aws/lambda/omnix-ai-backend-prod" --since 1h

# DynamoDB table status
aws dynamodb describe-table --table-name omnix-ai-dev-users --query 'Table.TableStatus'

# CloudFront invalidation
aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"

# API Gateway deployment
aws apigateway create-deployment --rest-api-id 4j4yb4b844 --stage-name prod
```

---

This troubleshooting guide provides comprehensive solutions for common OMNIX AI platform issues. Keep this guide updated as new issues and solutions are discovered through operational experience.

---

**Guide Status**: Complete and Production-Validated  
**Last Updated**: September 4, 2025  
**Next Review**: Monthly or after major incidents  
**Version**: 1.0 (Based on real production incident experience)