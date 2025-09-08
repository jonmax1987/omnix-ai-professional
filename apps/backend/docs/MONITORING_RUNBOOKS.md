# OMNIX AI - Monitoring Runbooks

## Production Data Retrieval System Operations

**Last Updated**: September 5, 2025  
**Environment**: Production (eu-central-1)  
**System**: OMNIX AI Data Retrieval & Analytics Platform

---

## 📚 Table of Contents

1. [Daily Operations](#daily-operations)
2. [Weekly Health Checks](#weekly-health-checks)
3. [Monthly Performance Reviews](#monthly-performance-reviews)
4. [Alert Response Procedures](#alert-response-procedures)
5. [Performance Optimization](#performance-optimization)
6. [Capacity Planning](#capacity-planning)
7. [Security Monitoring](#security-monitoring)

---

## 🌅 Daily Operations

### Morning Health Check (9:00 AM)

Execute the daily health check routine to ensure system stability:

```bash
# Navigate to backend directory
cd /home/jonmax1987/projects/omnix-ai-professional/apps/backend

# Run comprehensive health check
./scripts/sla-monitoring-service.sh health-check

# Check overnight alerts
aws cloudwatch describe-alarms \
  --state-value ALARM \
  --alarm-name-prefix "OMNIX-prod" \
  --region eu-central-1 \
  --query 'MetricAlarms[*].{Name:AlarmName,State:StateValue,Reason:StateReason}'
```

### Key Metrics to Review Daily

1. **System Availability**
   ```bash
   # Check uptime from CloudWatch
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Invocations \
     --dimensions Name=FunctionName,Value=omnix-ai-backend-dev \
     --start-time $(date -d '24 hours ago' --iso-8601) \
     --end-time $(date --iso-8601) \
     --period 3600 \
     --statistics Sum \
     --region eu-central-1
   ```

2. **Error Rate Analysis**
   ```bash
   # Calculate daily error rate
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Errors \
     --dimensions Name=FunctionName,Value=omnix-ai-backend-dev \
     --start-time $(date -d '24 hours ago' --iso-8601) \
     --end-time $(date --iso-8601) \
     --period 3600 \
     --statistics Sum \
     --region eu-central-1
   ```

3. **Performance Benchmarks**
   ```bash
   # Test critical endpoint response times
   for endpoint in "/v1/health" "/v1/dashboard/summary" "/v1/products"; do
     echo "Testing $endpoint..."
     curl -w "@curl-format.txt" -s -o /dev/null \
       "https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod$endpoint"
   done
   ```

### Daily Checklist
- [ ] Health check passed
- [ ] No critical alarms active
- [ ] API response times < 500ms
- [ ] Error rate < 1%
- [ ] DynamoDB tables active
- [ ] Cache performance acceptable
- [ ] Business metrics accurate

---

## 🗓️ Weekly Health Checks

### Comprehensive System Review (Monday 9:00 AM)

1. **Infrastructure Health Assessment**
   ```bash
   # Run extended monitoring validation
   ./scripts/sla-monitoring-service.sh data-validation
   
   # Check Lambda function configuration
   aws lambda get-function-configuration \
     --function-name omnix-ai-backend-dev \
     --region eu-central-1
   ```

2. **Performance Trend Analysis**
   ```bash
   # Weekly performance report
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Duration \
     --dimensions Name=FunctionName,Value=omnix-ai-backend-dev \
     --start-time $(date -d '7 days ago' --iso-8601) \
     --end-time $(date --iso-8601) \
     --period 86400 \
     --statistics Average,Maximum \
     --region eu-central-1
   ```

3. **Capacity Utilization Review**
   ```bash
   # DynamoDB capacity analysis
   for table in "omnix-ai-products-dev" "omnix-ai-dev-orders" "omnix-ai-cdk-streaming-analytics-dev-20250820T1533"; do
     echo "Checking capacity for $table..."
     aws cloudwatch get-metric-statistics \
       --namespace AWS/DynamoDB \
       --metric-name ConsumedReadCapacityUnits \
       --dimensions Name=TableName,Value=$table \
       --start-time $(date -d '7 days ago' --iso-8601) \
       --end-time $(date --iso-8601) \
       --period 86400 \
       --statistics Sum \
       --region eu-central-1
   done
   ```

### Weekly Tasks
- [ ] Performance trends reviewed
- [ ] Capacity utilization analyzed
- [ ] Security monitoring validated
- [ ] Backup procedures verified
- [ ] Cost optimization opportunities identified
- [ ] Alert threshold tuning completed

---

## 📊 Monthly Performance Reviews

### Business Intelligence Analysis (1st Monday of Month)

1. **Revenue Calculation Accuracy**
   ```bash
   # Monthly revenue validation
   curl -s "https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/v1/dashboard/summary" | \
   jq '.data | {totalRevenue: .totalRevenue, totalOrders: .totalOrders, averageOrderValue: .averageOrderValue}'
   ```

2. **Data Quality Assessment**
   ```bash
   # Products data integrity check
   products_count=$(curl -s "https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/v1/products" | jq '.total')
   orders_count=$(curl -s "https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/v1/orders" | jq '.total')
   
   echo "Data Quality Report:"
   echo "Products: $products_count items"
   echo "Orders: $orders_count orders"
   ```

3. **SLA Compliance Report**
   ```bash
   # Generate SLA compliance report
   aws cloudwatch get-metric-statistics \
     --namespace OMNIX/SLA \
     --metric-name SLACompliance \
     --start-time $(date -d '30 days ago' --iso-8601) \
     --end-time $(date --iso-8601) \
     --period 86400 \
     --statistics Average \
     --region eu-central-1
   ```

### Monthly Checklist
- [ ] SLA compliance > 99.9%
- [ ] Cost optimization reviewed
- [ ] Capacity planning updated
- [ ] Security audit completed
- [ ] Performance baselines updated
- [ ] Disaster recovery tested

---

## 🚨 Alert Response Procedures

### Critical Alert: Lambda High Error Rate

**Alert**: `OMNIX-prod-Lambda-High-Error-Rate`  
**Threshold**: > 5 errors in 5 minutes

#### Immediate Response (0-5 minutes)
```bash
# 1. Check current Lambda status
aws lambda get-function --function-name omnix-ai-backend-dev --region eu-central-1

# 2. Review recent errors
aws logs filter-log-events \
  --log-group-name '/aws/lambda/omnix-ai-backend-dev' \
  --start-time $(date -d '10 minutes ago' +%s)000 \
  --filter-pattern 'ERROR' \
  --region eu-central-1 | jq '.events[].message'

# 3. Test API endpoints
curl -I https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/v1/health
```

#### Investigation Actions (5-15 minutes)
```bash
# Check for deployment issues
aws lambda list-versions-by-function \
  --function-name omnix-ai-backend-dev \
  --region eu-central-1

# Monitor real-time metrics
watch -n 10 'aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=omnix-ai-backend-dev \
  --start-time $(date -d "15 minutes ago" --iso-8601) \
  --end-time $(date --iso-8601) \
  --period 300 \
  --statistics Sum \
  --region eu-central-1'
```

### Performance Alert: API High Latency

**Alert**: `OMNIX-prod-API-High-Latency`  
**Threshold**: > 2000ms for 3 periods

#### Response Procedure
```bash
# 1. Performance baseline test
./production-validation-test.js

# 2. Check DynamoDB performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name SuccessfulRequestLatency \
  --dimensions Name=TableName,Value=omnix-ai-products-dev Name=Operation,Value=Scan \
  --start-time $(date -d '30 minutes ago' --iso-8601) \
  --end-time $(date --iso-8601) \
  --period 300 \
  --statistics Average \
  --region eu-central-1

# 3. Cache performance analysis
grep -i "cache" /tmp/omnix-sla-monitoring.log | tail -20
```

### Business Alert: Data Accuracy Issues

**Alert**: `OMNIX-prod-Data-Accuracy-Issues`  
**Threshold**: > 3 accuracy errors in 5 minutes

#### Response Procedure
```bash
# 1. Immediate data validation
./scripts/sla-monitoring-service.sh data-validation

# 2. Compare with expected values
expected_revenue=31630.91
actual_revenue=$(curl -s "https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod/v1/dashboard/summary" | jq '.data.totalRevenue')

# 3. Check data consistency
./production-validation-test.js --data-accuracy-only
```

---

## ⚡ Performance Optimization

### Lambda Function Optimization

1. **Memory Optimization**
   ```bash
   # Current configuration
   aws lambda get-function-configuration \
     --function-name omnix-ai-backend-dev \
     --region eu-central-1 | jq '.MemorySize, .Timeout'
   
   # Optimization based on usage patterns
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Duration \
     --dimensions Name=FunctionName,Value=omnix-ai-backend-dev \
     --start-time $(date -d '7 days ago' --iso-8601) \
     --end-time $(date --iso-8601) \
     --period 86400 \
     --statistics Average,Maximum \
     --region eu-central-1
   ```

2. **Cold Start Reduction**
   ```bash
   # Monitor cold start frequency
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name Duration \
     --dimensions Name=FunctionName,Value=omnix-ai-backend-dev \
     --start-time $(date -d '24 hours ago' --iso-8601) \
     --end-time $(date --iso-8601) \
     --period 3600 \
     --statistics Maximum \
     --region eu-central-1
   ```

### DynamoDB Performance Tuning

1. **Read Capacity Optimization**
   ```bash
   # Analyze read patterns
   for table in "omnix-ai-products-dev" "omnix-ai-dev-orders"; do
     aws cloudwatch get-metric-statistics \
       --namespace AWS/DynamoDB \
       --metric-name ConsumedReadCapacityUnits \
       --dimensions Name=TableName,Value=$table \
       --start-time $(date -d '24 hours ago' --iso-8601) \
       --end-time $(date --iso-8601) \
       --period 3600 \
       --statistics Sum \
       --region eu-central-1
   done
   ```

2. **Query Optimization Analysis**
   ```bash
   # Check for scan operations in logs
   aws logs filter-log-events \
     --log-group-name '/aws/lambda/omnix-ai-backend-dev' \
     --start-time $(date -d '24 hours ago' +%s)000 \
     --filter-pattern 'Scan' \
     --region eu-central-1
   ```

---

## 📈 Capacity Planning

### Monthly Capacity Review

1. **Traffic Growth Analysis**
   ```bash
   # API request volume trend
   aws cloudwatch get-metric-statistics \
     --namespace AWS/ApiGateway \
     --metric-name Count \
     --dimensions Name=ApiName,Value=4j4yb4b844 \
     --start-time $(date -d '30 days ago' --iso-8601) \
     --end-time $(date --iso-8601) \
     --period 86400 \
     --statistics Sum \
     --region eu-central-1
   ```

2. **Resource Utilization Forecasting**
   ```bash
   # Lambda concurrent execution trends
   aws cloudwatch get-metric-statistics \
     --namespace AWS/Lambda \
     --metric-name ConcurrentExecutions \
     --dimensions Name=FunctionName,Value=omnix-ai-backend-dev \
     --start-time $(date -d '30 days ago' --iso-8601) \
     --end-time $(date --iso-8601) \
     --period 86400 \
     --statistics Maximum \
     --region eu-central-1
   ```

### Scaling Recommendations

Based on traffic patterns and growth projections:

1. **Auto-scaling Configuration**
   ```bash
   # Enable DynamoDB auto-scaling
   aws application-autoscaling register-scalable-target \
     --service-namespace dynamodb \
     --resource-id table/omnix-ai-products-dev \
     --scalable-dimension dynamodb:table:ReadCapacityUnits \
     --min-capacity 5 \
     --max-capacity 100 \
     --region eu-central-1
   ```

2. **API Gateway Throttling**
   ```bash
   # Review current throttling limits
   aws apigateway get-usage-plans --region eu-central-1
   ```

---

## 🔒 Security Monitoring

### Daily Security Checks

1. **Access Patterns Analysis**
   ```bash
   # Check for unusual API access patterns
   aws logs filter-log-events \
     --log-group-name '/aws/apigateway/omnix-ai-api' \
     --start-time $(date -d '24 hours ago' +%s)000 \
     --filter-pattern '[timestamp, requestId, ip, user, timestamp, method, resource, status=4*, ...]' \
     --region eu-central-1
   ```

2. **Authentication Monitoring**
   ```bash
   # Monitor authentication failures
   aws logs filter-log-events \
     --log-group-name '/aws/lambda/omnix-ai-backend-dev' \
     --start-time $(date -d '24 hours ago' +%s)000 \
     --filter-pattern 'Invalid credentials' \
     --region eu-central-1
   ```

### Weekly Security Review

1. **IAM Access Review**
   ```bash
   # Review Lambda execution role permissions
   aws iam get-role --role-name omnix-ai-lambda-execution-role
   ```

2. **VPC and Network Security**
   ```bash
   # Check security groups (if applicable)
   aws ec2 describe-security-groups \
     --group-names omnix-ai-lambda-sg \
     --region eu-central-1
   ```

---

## 🛠️ Troubleshooting Quick Reference

### Common Issues and Solutions

#### Issue: High Response Times
**Symptoms**: API responses > 2 seconds  
**Quick Fix**: 
```bash
# Increase Lambda memory temporarily
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-dev \
  --memory-size 1024 \
  --region eu-central-1
```

#### Issue: DynamoDB Throttling
**Symptoms**: ReadThrottleEvents > 0  
**Quick Fix**:
```bash
# Temporarily increase capacity
aws dynamodb update-table \
  --table-name omnix-ai-products-dev \
  --provisioned-throughput ReadCapacityUnits=50,WriteCapacityUnits=10 \
  --region eu-central-1
```

#### Issue: Cache Performance Degradation
**Symptoms**: Low cache hit rate  
**Quick Fix**:
```bash
# Force Lambda environment refresh
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-dev \
  --description "Cache refresh - $(date)" \
  --region eu-central-1
```

---

## 📞 Emergency Contacts

### On-Call Escalation
1. **Primary**: Development Team (+1-XXX-XXX-XXXX)
2. **Secondary**: DevOps Team (+1-XXX-XXX-XXXX)
3. **Escalation**: Engineering Manager (+1-XXX-XXX-XXXX)

### Vendor Support
- **AWS Support**: Premium Support Case
- **Third-party Integrations**: As per service agreements

---

## 📋 Maintenance Windows

### Planned Maintenance Schedule
- **Weekly**: Sundays 2:00-4:00 AM UTC (Low traffic period)
- **Monthly**: First Sunday of month 2:00-6:00 AM UTC (Extended maintenance)
- **Emergency**: As needed with stakeholder notification

### Maintenance Procedures
1. **Pre-maintenance**: Health check and backup verification
2. **During maintenance**: Progressive updates with rollback readiness
3. **Post-maintenance**: Comprehensive validation and monitoring

---

**Document Maintained By**: OMNIX AI DevOps Team  
**Last Reviewed**: September 5, 2025  
**Next Review**: October 5, 2025