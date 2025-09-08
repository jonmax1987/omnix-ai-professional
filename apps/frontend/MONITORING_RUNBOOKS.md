# OMNIX AI Monitoring Runbooks

## Table of Contents
1. [System Health Incidents](#system-health-incidents)
2. [Performance Issues](#performance-issues)
3. [Security Incidents](#security-incidents)
4. [Business Metrics Alerts](#business-metrics-alerts)
5. [Database Issues](#database-issues)
6. [AI Service Failures](#ai-service-failures)
7. [Infrastructure Incidents](#infrastructure-incidents)
8. [Maintenance Procedures](#maintenance-procedures)

---

## System Health Incidents

### API Service Down (CRITICAL)

#### Symptoms
- Health check endpoint returns 5XX errors or timeouts
- API Gateway showing 100% error rate
- Customer reports of application unavailability

#### Immediate Response (0-5 minutes)
1. **Acknowledge the alert** in PagerDuty/Slack
2. **Check system status**:
   ```bash
   # Quick health check
   curl -f https://api.omnix-ai.com/health
   
   # Check API Gateway status
   aws apigateway get-rest-api --rest-api-id YOUR_API_ID
   ```

3. **Verify the scope**:
   - Check multiple endpoints: `/health`, `/api/customers`, `/api/orders`
   - Confirm issue from multiple locations (use external monitoring if available)

#### Investigation (5-15 minutes)
4. **Check CloudWatch dashboards**:
   - API Gateway errors, latency, and request count
   - Lambda function errors and duration
   - CloudFront origin error rates

5. **Review recent deployments**:
   ```bash
   # Check recent Lambda deployments
   aws lambda list-versions-by-function --function-name omnix-ai-staging-api
   
   # Check API Gateway deployment history
   aws apigateway get-deployments --rest-api-id YOUR_API_ID
   ```

#### Resolution Actions
6. **If recent deployment is suspected**:
   ```bash
   # Rollback Lambda function
   aws lambda update-function-code \
     --function-name omnix-ai-staging-api \
     --s3-bucket your-deployment-bucket \
     --s3-key previous-version.zip
   
   # Rollback API Gateway
   aws apigateway create-deployment \
     --rest-api-id YOUR_API_ID \
     --stage-name prod \
     --description "Emergency rollback"
   ```

7. **If Lambda timeout/memory issues**:
   ```bash
   # Increase Lambda timeout
   aws lambda update-function-configuration \
     --function-name omnix-ai-staging-api \
     --timeout 30
   
   # Increase Lambda memory
   aws lambda update-function-configuration \
     --function-name omnix-ai-staging-api \
     --memory-size 1024
   ```

8. **Clear CloudFront cache**:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DISTRIBUTION_ID \
     --invalidation-batch 'Paths={Quantity=1,Items=["/api/*"]},CallerReference=emergency-'$(date +%s)
   ```

#### Post-Resolution (15-30 minutes)
9. **Verify recovery**:
   - Test all critical endpoints
   - Monitor error rates return to normal
   - Confirm customer impact is resolved

10. **Document incident**:
    - Update incident ticket with timeline
    - Note root cause and resolution
    - Schedule post-mortem if needed

### Database Connectivity Issues (CRITICAL)

#### Symptoms
- DynamoDB timeout errors in application logs
- "Unable to connect to database" messages
- Business metrics showing 0 database operations

#### Immediate Response
1. **Check DynamoDB service health**:
   ```bash
   # Check table status
   aws dynamodb describe-table --table-name omnix-ai-staging-customers
   aws dynamodb describe-table --table-name omnix-ai-staging-orders
   aws dynamodb describe-table --table-name omnix-ai-staging-inventory
   ```

2. **Review CloudWatch metrics**:
   - DynamoDB throttling events
   - Read/write capacity utilization
   - Error counts and latencies

#### Investigation
3. **Check for throttling**:
   ```bash
   # Get throttling metrics
   aws cloudwatch get-metric-statistics \
     --namespace AWS/DynamoDB \
     --metric-name ThrottledRequests \
     --start-time 2024-01-01T00:00:00Z \
     --end-time 2024-01-01T01:00:00Z \
     --period 300 \
     --statistics Sum \
     --dimensions Name=TableName,Value=omnix-ai-staging-customers
   ```

4. **Review IAM permissions**:
   ```bash
   # Check Lambda execution role permissions
   aws iam get-role --role-name omnix-ai-staging-lambda-execution-role
   aws iam list-attached-role-policies --role-name omnix-ai-staging-lambda-execution-role
   ```

#### Resolution Actions
5. **If throttling detected**:
   ```bash
   # Enable auto-scaling (if not already enabled)
   aws application-autoscaling register-scalable-target \
     --service-namespace dynamodb \
     --scalable-dimension dynamodb:table:ReadCapacityUnits \
     --resource-id table/omnix-ai-staging-customers \
     --min-capacity 5 \
     --max-capacity 40
   
   # Temporarily increase capacity
   aws dynamodb update-table \
     --table-name omnix-ai-staging-customers \
     --provisioned-throughput ReadCapacityUnits=20,WriteCapacityUnits=20
   ```

6. **If permissions issue**:
   ```bash
   # Attach DynamoDB access policy
   aws iam attach-role-policy \
     --role-name omnix-ai-staging-lambda-execution-role \
     --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
   ```

---

## Performance Issues

### High API Latency (WARNING)

#### Symptoms
- API Gateway latency >500ms average
- Customer complaints about slow loading
- Core Web Vitals degrading

#### Investigation
1. **Identify bottleneck**:
   ```bash
   # Check Lambda duration metrics
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Duration \
     --start-time $(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%SZ') \
     --end-time $(date -u '+%Y-%m-%dT%H:%M:%SZ') \
     --period 300 \
     --statistics Average,Maximum \
     --dimensions Name=FunctionName,Value=omnix-ai-staging-api
   ```

2. **Check database latency**:
   ```bash
   # DynamoDB latency metrics
   aws cloudwatch get-metric-statistics \
     --namespace AWS/DynamoDB \
     --metric-name SuccessfulRequestLatency \
     --start-time $(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%SZ') \
     --end-time $(date -u '+%Y-%m-%dT%H:%M:%SZ') \
     --period 300 \
     --statistics Average \
     --dimensions Name=TableName,Value=omnix-ai-staging-customers Name=Operation,Value=Query
   ```

#### Resolution Actions
3. **Optimize Lambda performance**:
   ```bash
   # Increase Lambda memory (improves CPU)
   aws lambda update-function-configuration \
     --function-name omnix-ai-staging-api \
     --memory-size 1024
   
   # Enable provisioned concurrency
   aws lambda put-provisioned-concurrency-config \
     --function-name omnix-ai-staging-api \
     --qualifier $LATEST \
     --provisioned-concurrency-config ProvisionedConcurrencyUnits=5
   ```

4. **Enable caching**:
   ```bash
   # Enable API Gateway caching
   aws apigateway update-stage \
     --rest-api-id YOUR_API_ID \
     --stage-name prod \
     --patch-ops op=replace,path=/cacheClusterEnabled,value=true \
     --patch-ops op=replace,path=/cacheClusterSize,value=0.5
   ```

### CloudFront Cache Miss Rate High (WARNING)

#### Symptoms
- CloudFront cache hit rate <70%
- Origin server receiving high load
- Increased bandwidth costs

#### Investigation
1. **Check cache statistics**:
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/CloudFront \
     --metric-name CacheHitRate \
     --start-time $(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%SZ') \
     --end-time $(date -u '+%Y-%m-%dT%H:%M:%SZ') \
     --period 300 \
     --statistics Average \
     --dimensions Name=DistributionId,Value=YOUR_DISTRIBUTION_ID \
     --region us-east-1
   ```

2. **Analyze cache behaviors**:
   ```bash
   # Get distribution configuration
   aws cloudfront get-distribution-config --id YOUR_DISTRIBUTION_ID
   ```

#### Resolution Actions
3. **Optimize cache policies**:
   ```bash
   # Create optimized cache policy
   aws cloudfront create-cache-policy \
     --cache-policy-config '{
       "Name": "OptimizedCaching",
       "DefaultTTL": 86400,
       "MaxTTL": 31536000,
       "MinTTL": 1,
       "ParametersInCacheKeyAndForwardedToOrigin": {
         "EnableAcceptEncodingGzip": true,
         "EnableAcceptEncodingBrotli": true,
         "QueryStringsConfig": {
           "QueryStringBehavior": "whitelist",
           "QueryStrings": {
             "Quantity": 1,
             "Items": ["version"]
           }
         },
         "HeadersConfig": {
           "HeaderBehavior": "none"
         },
         "CookiesConfig": {
           "CookieBehavior": "none"
         }
       }
     }'
   ```

4. **Update cache headers** in your application:
   ```javascript
   // Add cache headers to API responses
   response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200');
   response.setHeader('ETag', generateETag(content));
   response.setHeader('Last-Modified', lastModifiedDate);
   ```

---

## Security Incidents

### PII Exposure Detected (CRITICAL)

#### Symptoms
- Security monitoring detected PII patterns in logs
- Automated security scan triggered alert
- External security report received

#### Immediate Response (0-15 minutes)
1. **Stop potential data exposure**:
   ```bash
   # Immediately rotate API keys
   aws apigateway create-api-key --name emergency-rotation-$(date +%s)
   
   # Disable compromised keys
   aws apigateway update-api-key --api-key OLD_KEY_ID --patch-ops op=replace,path=/enabled,value=false
   ```

2. **Contain the incident**:
   ```bash
   # Enable detailed logging
   aws logs create-log-group --log-group-name /aws/apigateway/emergency-audit
   
   # Block suspicious IPs if identified
   aws wafv2 update-ip-set \
     --scope CLOUDFRONT \
     --id YOUR_IP_SET_ID \
     --addresses "suspicious.ip.address/32"
   ```

#### Investigation (15-60 minutes)
3. **Analyze the exposure**:
   ```bash
   # Search for PII in logs
   aws logs start-query \
     --log-group-name /aws/lambda/omnix-ai-staging-api \
     --start-time $(date -d '24 hours ago' +%s) \
     --end-time $(date +%s) \
     --query-string 'fields @timestamp, @message | filter @message like /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/'
   ```

4. **Determine scope**:
   - Which logs contain PII?
   - What time period is affected?
   - How many records potentially exposed?
   - What type of PII (email, phone, SSN, etc.)?

#### Resolution Actions (1-4 hours)
5. **Remediate data exposure**:
   ```bash
   # Purge logs containing PII (if legally permissible)
   aws logs delete-log-group --log-group-name /aws/lambda/compromised-function
   
   # Update log retention for faster purging
   aws logs put-retention-policy \
     --log-group-name /aws/lambda/omnix-ai-staging-api \
     --retention-in-days 1
   ```

6. **Implement safeguards**:
   ```javascript
   // Add PII sanitization to logging
   function sanitizeLogData(data) {
     return JSON.stringify(data).replace(
       /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
       '[EMAIL_REDACTED]'
     ).replace(
       /\b\d{3}-?\d{2}-?\d{4}\b/g,
       '[SSN_REDACTED]'
     );
   }
   ```

#### Post-Incident (4-24 hours)
7. **Compliance reporting**:
   - Document incident timeline
   - Assess regulatory notification requirements
   - Prepare customer communication if needed
   - Update security policies

### Authentication Failure Rate High (WARNING)

#### Symptoms
- 4XX error rate >20% on authentication endpoints
- Multiple failed login attempts from same IPs
- Unusual geographic login patterns

#### Investigation
1. **Analyze authentication patterns**:
   ```bash
   # Get authentication error metrics
   aws cloudwatch get-metric-statistics \
     --namespace AWS/ApiGateway \
     --metric-name 4XXError \
     --start-time $(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%SZ') \
     --end-time $(date -u '+%Y-%m-%dT%H:%M:%SZ') \
     --period 300 \
     --statistics Sum \
     --dimensions Name=ApiName,Value=omnix-ai-staging-api
   ```

2. **Check for brute force attacks**:
   ```bash
   # Query access logs for failed auth attempts
   aws logs start-query \
     --log-group-name /aws/apigateway/omnix-ai-staging-api \
     --start-time $(date -d '1 hour ago' +%s) \
     --end-time $(date +%s) \
     --query-string 'fields @timestamp, sourceIPAddress, status | filter status = 401 | stats count() by sourceIPAddress | sort count desc'
   ```

#### Resolution Actions
3. **If brute force attack detected**:
   ```bash
   # Block attacking IPs
   aws wafv2 update-ip-set \
     --scope CLOUDFRONT \
     --id YOUR_IP_SET_ID \
     --addresses "attacking.ip.1/32" "attacking.ip.2/32"
   
   # Enable rate limiting
   aws wafv2 create-rate-based-rule \
     --name AuthRateLimit \
     --metric-name AuthRateLimit \
     --rate-key IP \
     --rate-limit 100
   ```

4. **Implement account lockout**:
   ```javascript
   // Add account lockout logic
   async function checkAccountLockout(userId) {
     const attempts = await getFailedAttempts(userId);
     if (attempts >= 5) {
       await lockAccount(userId, 15 * 60 * 1000); // 15 minutes
       return true;
     }
     return false;
   }
   ```

---

## Business Metrics Alerts

### Revenue Processing Success Rate Low (BUSINESS)

#### Symptoms
- Order processing success rate <95%
- Payment gateway errors increasing
- Customer complaints about failed purchases

#### Investigation
1. **Check payment gateway status**:
   ```bash
   # Review payment processing logs
   aws logs start-query \
     --log-group-name /aws/lambda/omnix-ai-staging-payment-processor \
     --start-time $(date -d '1 hour ago' +%s) \
     --end-time $(date +%s) \
     --query-string 'fields @timestamp, @message | filter @message like /ERROR/'
   ```

2. **Analyze failure patterns**:
   - Which payment methods are failing?
   - Are failures related to specific products?
   - Geographic patterns in failures?

#### Resolution Actions
3. **If payment gateway issues**:
   ```bash
   # Switch to backup payment processor
   aws ssm put-parameter \
     --name /omnix-ai/staging/payment/primary-processor \
     --value backup-processor \
     --overwrite
   
   # Restart payment processing Lambda
   aws lambda update-function-configuration \
     --function-name omnix-ai-staging-payment-processor \
     --environment Variables='{PAYMENT_PROCESSOR=backup}'
   ```

4. **If inventory issues**:
   ```javascript
   // Implement graceful inventory handling
   async function processOrder(order) {
     try {
       await checkInventory(order.items);
       await processPayment(order.payment);
       await updateInventory(order.items);
       return { success: true, orderId: order.id };
     } catch (inventoryError) {
       // Handle out of stock gracefully
       await notifyCustomer(order.customer, 'inventory_issue');
       await issueRefund(order.payment);
       return { success: false, reason: 'inventory_unavailable' };
     }
   }
   ```

### AI Recommendation Confidence Low (BUSINESS)

#### Symptoms
- AI recommendation confidence <70%
- High fallback usage rate
- Customer engagement with recommendations decreasing

#### Investigation
1. **Check AI service performance**:
   ```bash
   # Review Bedrock service metrics
   aws cloudwatch get-metric-statistics \
     --namespace OMNIX/AI \
     --metric-name BedrockAnalysisLatency \
     --start-time $(date -u -d '4 hours ago' '+%Y-%m-%dT%H:%M:%SZ') \
     --end-time $(date -u '+%Y-%m-%dT%H:%M:%SZ') \
     --period 300 \
     --statistics Average,Maximum
   ```

2. **Analyze AI model performance**:
   - Are specific models underperforming?
   - Has input data quality changed?
   - Are prompts being truncated?

#### Resolution Actions
3. **If model performance degraded**:
   ```javascript
   // Implement model fallback strategy
   const AI_MODELS = {
     primary: 'anthropic.claude-3-haiku-20240307-v1:0',
     secondary: 'anthropic.claude-3-sonnet-20240229-v1:0',
     fallback: 'local-recommendation-engine'
   };
   
   async function generateRecommendations(customerData) {
     try {
       return await callBedrockModel(AI_MODELS.primary, customerData);
     } catch (error) {
       console.warn('Primary model failed, trying secondary');
       try {
         return await callBedrockModel(AI_MODELS.secondary, customerData);
       } catch (secondaryError) {
         console.warn('Secondary model failed, using fallback');
         return await localRecommendationEngine(customerData);
       }
     }
   }
   ```

4. **If data quality issues**:
   ```javascript
   // Implement data validation
   function validateCustomerData(data) {
     const required = ['customerId', 'purchaseHistory', 'preferences'];
     const missing = required.filter(field => !data[field]);
     
     if (missing.length > 0) {
       throw new Error(`Missing required fields: ${missing.join(', ')}`);
     }
     
     // Ensure minimum data quality
     if (data.purchaseHistory.length < 3) {
       throw new Error('Insufficient purchase history for accurate recommendations');
     }
     
     return true;
   }
   ```

---

## Maintenance Procedures

### Scheduled Maintenance Window

#### Pre-Maintenance (24 hours before)
1. **Notify stakeholders**:
   ```bash
   # Send maintenance notification
   aws sns publish \
     --topic-arn arn:aws:sns:region:account:omnix-ai-maintenance-notifications \
     --subject "Scheduled Maintenance: $(date -d 'tomorrow' '+%Y-%m-%d %H:%M UTC')" \
     --message "Scheduled maintenance window for OMNIX AI platform infrastructure."
   ```

2. **Prepare rollback procedures**:
   ```bash
   # Create deployment backup
   aws s3 cp s3://omnix-ai-deployments/current/ s3://omnix-ai-deployments/backup-$(date +%Y%m%d)/ --recursive
   
   # Document current configuration
   aws apigateway get-rest-api --rest-api-id YOUR_API_ID > api-config-backup.json
   ```

#### During Maintenance
3. **Enable maintenance mode**:
   ```bash
   # Update CloudFront to serve maintenance page
   aws cloudfront update-distribution \
     --id YOUR_DISTRIBUTION_ID \
     --distribution-config file://maintenance-distribution-config.json
   ```

4. **Perform updates**:
   - Deploy new application versions
   - Update infrastructure components
   - Run database migrations
   - Update monitoring configurations

#### Post-Maintenance
5. **Verify system health**:
   ```bash
   # Run comprehensive health checks
   ./scripts/health-check-comprehensive.sh
   
   # Validate all critical user journeys
   ./scripts/end-to-end-tests.sh
   ```

6. **Restore normal operations**:
   ```bash
   # Restore normal CloudFront configuration
   aws cloudfront update-distribution \
     --id YOUR_DISTRIBUTION_ID \
     --distribution-config file://normal-distribution-config.json
   
   # Send completion notification
   aws sns publish \
     --topic-arn arn:aws:sns:region:account:omnix-ai-maintenance-notifications \
     --subject "Maintenance Complete: $(date '+%Y-%m-%d %H:%M UTC')" \
     --message "Scheduled maintenance completed successfully. All systems operational."
   ```

### Emergency Procedures

#### Complete System Disaster Recovery
1. **Assess impact**:
   - Determine scope of outage
   - Estimate recovery time
   - Identify critical vs non-critical services

2. **Activate disaster recovery**:
   ```bash
   # Deploy to DR region
   aws cloudformation create-stack \
     --stack-name omnix-ai-dr-recovery \
     --template-body file://dr-infrastructure.yml \
     --region us-west-2 \
     --parameters ParameterKey=Environment,ParameterValue=disaster-recovery
   
   # Update DNS to point to DR region
   aws route53 change-resource-record-sets \
     --hosted-zone-id YOUR_HOSTED_ZONE \
     --change-batch file://dr-dns-changes.json
   ```

3. **Data recovery**:
   ```bash
   # Restore from backups
   aws dynamodb restore-table-from-backup \
     --target-table-name omnix-ai-dr-customers \
     --backup-arn arn:aws:dynamodb:region:account:table/omnix-ai-customers/backup/latest
   ```

#### Critical Security Response
1. **Immediate containment**:
   ```bash
   # Disable all API access
   aws apigateway update-stage \
     --rest-api-id YOUR_API_ID \
     --stage-name prod \
     --patch-ops op=replace,path=/throttle/rateLimit,value=0
   
   # Block all traffic through WAF
   aws wafv2 update-web-acl \
     --scope CLOUDFRONT \
     --id YOUR_WAF_ID \
     --default-action Block={}
   ```

2. **Forensic preservation**:
   ```bash
   # Export all logs for analysis
   aws logs create-export-task \
     --log-group-name /aws/lambda/omnix-ai-staging-api \
     --from $(date -d '24 hours ago' +%s)000 \
     --to $(date +%s)000 \
     --destination omnix-ai-security-forensics \
     --destination-prefix incident-$(date +%Y%m%d)
   ```

3. **Communication**:
   - Notify legal team immediately
   - Prepare customer communication
   - Contact law enforcement if required
   - Update status page with generic message

---

## Quick Reference

### Emergency Contacts
- **On-Call Engineer**: Slack #oncall or PagerDuty
- **Security Team**: security@omnix.ai
- **Business Operations**: business-ops@omnix.ai

### Key Commands
```bash
# Check API health
curl -f https://api.omnix-ai.com/health

# View recent alerts
aws sns list-subscriptions-by-topic --topic-arn CRITICAL_ALERT_TOPIC_ARN

# Check Lambda function status
aws lambda get-function --function-name omnix-ai-staging-api

# View CloudWatch dashboard
aws cloudwatch get-dashboard --dashboard-name omnix-ai-staging-executive
```

### Common Log Locations
- **API Gateway**: `/aws/apigateway/{api-id}`
- **Lambda Functions**: `/aws/lambda/{function-name}`
- **Application Logs**: `/aws/lambda/omnix-ai-{environment}-{service}`

This runbook should be regularly updated based on new incidents and lessons learned. All procedures should be tested during scheduled maintenance windows to ensure effectiveness during actual incidents.