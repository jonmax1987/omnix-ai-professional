#!/bin/bash

# OMNIX AI - Production SLA Monitoring Service
# Continuous monitoring service for data retrieval system SLA compliance
# Target SLA: < 500ms API response time, < 1% error rate, 99.9% availability

set -e

echo "📊 OMNIX AI - SLA Monitoring Service"
echo "====================================="

# Configuration
API_ENDPOINT="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod"
LAMBDA_FUNCTION="omnix-ai-backend-dev"
REGION="eu-central-1"
SLA_TARGET_MS=500
SLA_ERROR_THRESHOLD=1
MONITORING_INTERVAL=60 # seconds
LOG_FILE="/tmp/omnix-sla-monitoring.log"

# SLA tracking variables
TOTAL_REQUESTS=0
SUCCESSFUL_REQUESTS=0
TOTAL_RESPONSE_TIME=0
SLA_VIOLATIONS=0

# Initialize log file
echo "$(date): OMNIX AI SLA Monitoring Started" > $LOG_FILE
echo "SLA Targets: Response Time < ${SLA_TARGET_MS}ms, Error Rate < ${SLA_ERROR_THRESHOLD}%" >> $LOG_FILE

# Function to log with timestamp
log_with_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" | tee -a $LOG_FILE
}

# Function to send CloudWatch custom metric
send_cloudwatch_metric() {
    local metric_name=$1
    local value=$2
    local unit=$3
    local namespace="OMNIX/SLA"
    
    aws cloudwatch put-metric-data \
        --region $REGION \
        --namespace $namespace \
        --metric-data MetricName=$metric_name,Value=$value,Unit=$unit \
        2>/dev/null || true
}

# Function to test API endpoint performance
test_api_performance() {
    local endpoint=$1
    local expected_status=${2:-200}
    
    # Measure response time
    local start_time=$(date +%s%N)
    local response=$(curl -s -o /dev/null -w "%{http_code},%{time_total}" --max-time 10 "$endpoint" 2>/dev/null || echo "000,10.000")
    local end_time=$(date +%s%N)
    
    # Parse response
    local status_code=$(echo $response | cut -d',' -f1)
    local curl_time=$(echo $response | cut -d',' -f2)
    local response_time_ms=$(echo "$curl_time * 1000" | bc -l 2>/dev/null || echo "10000")
    response_time_ms=${response_time_ms%.*} # Remove decimal places
    
    # Update counters
    TOTAL_REQUESTS=$((TOTAL_REQUESTS + 1))
    
    if [ "$status_code" = "$expected_status" ]; then
        SUCCESSFUL_REQUESTS=$((SUCCESSFUL_REQUESTS + 1))
        TOTAL_RESPONSE_TIME=$((TOTAL_RESPONSE_TIME + response_time_ms))
        
        # Check SLA compliance
        if [ "$response_time_ms" -gt "$SLA_TARGET_MS" ]; then
            SLA_VIOLATIONS=$((SLA_VIOLATIONS + 1))
            log_with_timestamp "⚠️  SLA VIOLATION: ${endpoint} - ${response_time_ms}ms (Target: ${SLA_TARGET_MS}ms)"
            send_cloudwatch_metric "SLAViolations" 1 "Count"
        else
            log_with_timestamp "✅ API OK: ${endpoint} - ${response_time_ms}ms"
        fi
    else
        log_with_timestamp "❌ API ERROR: ${endpoint} - Status: ${status_code}, Time: ${response_time_ms}ms"
        send_cloudwatch_metric "APIErrors" 1 "Count"
    fi
    
    # Send metrics to CloudWatch
    send_cloudwatch_metric "ResponseTime" $response_time_ms "Milliseconds"
    send_cloudwatch_metric "HTTPStatus${status_code}" 1 "Count"
    
    echo "$status_code,$response_time_ms"
}

# Function to check Lambda function health
check_lambda_health() {
    log_with_timestamp "🔍 Checking Lambda function health..."
    
    local function_state=$(aws lambda get-function \
        --function-name $LAMBDA_FUNCTION \
        --region $REGION \
        --query 'Configuration.State' \
        --output text 2>/dev/null || echo "ERROR")
    
    local last_update_status=$(aws lambda get-function \
        --function-name $LAMBDA_FUNCTION \
        --region $REGION \
        --query 'Configuration.LastUpdateStatus' \
        --output text 2>/dev/null || echo "ERROR")
    
    if [ "$function_state" = "Active" ] && [ "$last_update_status" = "Successful" ]; then
        log_with_timestamp "✅ Lambda function is healthy (State: $function_state, Status: $last_update_status)"
        send_cloudwatch_metric "LambdaHealth" 1 "Count"
    else
        log_with_timestamp "❌ Lambda function health issue (State: $function_state, Status: $last_update_status)"
        send_cloudwatch_metric "LambdaHealth" 0 "Count"
    fi
}

# Function to check DynamoDB table health
check_dynamodb_health() {
    local table_name=$1
    log_with_timestamp "🗄️  Checking DynamoDB table: $table_name"
    
    local table_status=$(aws dynamodb describe-table \
        --table-name $table_name \
        --region $REGION \
        --query 'Table.TableStatus' \
        --output text 2>/dev/null || echo "ERROR")
    
    if [ "$table_status" = "ACTIVE" ]; then
        log_with_timestamp "✅ DynamoDB table $table_name is active"
        send_cloudwatch_metric "DynamoDBHealth" 1 "Count"
    else
        log_with_timestamp "❌ DynamoDB table $table_name status: $table_status"
        send_cloudwatch_metric "DynamoDBHealth" 0 "Count"
    fi
}

# Function to calculate and report SLA metrics
report_sla_metrics() {
    if [ $TOTAL_REQUESTS -gt 0 ]; then
        local success_rate=$((SUCCESSFUL_REQUESTS * 100 / TOTAL_REQUESTS))
        local error_rate=$((100 - success_rate))
        local avg_response_time=$((TOTAL_RESPONSE_TIME / SUCCESSFUL_REQUESTS))
        local sla_compliance_rate=$(((SUCCESSFUL_REQUESTS - SLA_VIOLATIONS) * 100 / TOTAL_REQUESTS))
        
        log_with_timestamp "📊 SLA Metrics Summary:"
        log_with_timestamp "   Total Requests: $TOTAL_REQUESTS"
        log_with_timestamp "   Success Rate: ${success_rate}%"
        log_with_timestamp "   Error Rate: ${error_rate}%"
        log_with_timestamp "   Average Response Time: ${avg_response_time}ms"
        log_with_timestamp "   SLA Violations: $SLA_VIOLATIONS"
        log_with_timestamp "   SLA Compliance: ${sla_compliance_rate}%"
        
        # Send summary metrics to CloudWatch
        send_cloudwatch_metric "SuccessRate" $success_rate "Percent"
        send_cloudwatch_metric "ErrorRate" $error_rate "Percent"
        send_cloudwatch_metric "AverageResponseTime" $avg_response_time "Milliseconds"
        send_cloudwatch_metric "SLACompliance" $sla_compliance_rate "Percent"
        
        # Check if SLA is being met
        if [ $error_rate -le $SLA_ERROR_THRESHOLD ] && [ $avg_response_time -le $SLA_TARGET_MS ]; then
            log_with_timestamp "🎯 SLA COMPLIANCE: All targets met"
        else
            log_with_timestamp "⚠️  SLA BREACH: Targets not met"
        fi
    fi
}

# Function to run comprehensive health check
run_health_check() {
    log_with_timestamp "🩺 Running comprehensive health check..."
    
    # Test all critical endpoints
    local endpoints=(
        "/v1/health:200"
        "/v1/dashboard/summary:200"
        "/v1/products:200"
        "/v1/orders:200"
        "/v1/analytics/sessions:200"
    )
    
    for endpoint_config in "${endpoints[@]}"; do
        local endpoint=$(echo $endpoint_config | cut -d':' -f1)
        local expected_status=$(echo $endpoint_config | cut -d':' -f2)
        local full_url="${API_ENDPOINT}${endpoint}"
        
        test_api_performance "$full_url" "$expected_status" > /dev/null
        sleep 1  # Small delay between requests
    done
    
    # Check infrastructure health
    check_lambda_health
    check_dynamodb_health "omnix-ai-products-dev"
    check_dynamodb_health "omnix-ai-dev-orders"
    
    # Report metrics
    report_sla_metrics
}

# Function to run data accuracy validation
validate_data_accuracy() {
    log_with_timestamp "🔍 Validating data accuracy..."
    
    # Test dashboard summary calculation
    local dashboard_response=$(curl -s "${API_ENDPOINT}/v1/dashboard/summary" | jq -r '.data.totalRevenue' 2>/dev/null || echo "ERROR")
    
    if [ "$dashboard_response" != "ERROR" ] && [ "$dashboard_response" != "null" ]; then
        log_with_timestamp "✅ Dashboard revenue calculation: $dashboard_response"
        send_cloudwatch_metric "DataAccuracyValidation" 1 "Count"
    else
        log_with_timestamp "❌ Dashboard revenue calculation failed"
        send_cloudwatch_metric "DataAccuracyValidation" 0 "Count"
    fi
    
    # Test products count
    local products_count=$(curl -s "${API_ENDPOINT}/v1/products" | jq -r '.total' 2>/dev/null || echo "ERROR")
    
    if [ "$products_count" != "ERROR" ] && [ "$products_count" -gt 0 ]; then
        log_with_timestamp "✅ Products count validation: $products_count items"
        send_cloudwatch_metric "ProductsDataValidation" 1 "Count"
    else
        log_with_timestamp "❌ Products data validation failed"
        send_cloudwatch_metric "ProductsDataValidation" 0 "Count"
    fi
}

# Continuous monitoring mode
continuous_monitoring() {
    log_with_timestamp "🚀 Starting continuous SLA monitoring (Interval: ${MONITORING_INTERVAL}s)"
    
    while true; do
        run_health_check
        validate_data_accuracy
        
        log_with_timestamp "⏸️  Waiting ${MONITORING_INTERVAL} seconds for next check..."
        sleep $MONITORING_INTERVAL
    done
}

# Signal handler for graceful shutdown
cleanup() {
    log_with_timestamp "🛑 Monitoring service stopped"
    report_sla_metrics
    echo ""
    echo "Final SLA Report saved to: $LOG_FILE"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main execution
case "${1:-continuous}" in
    "health-check")
        log_with_timestamp "🩺 Running single health check..."
        run_health_check
        ;;
    "data-validation")
        log_with_timestamp "🔍 Running data accuracy validation..."
        validate_data_accuracy
        ;;
    "continuous")
        continuous_monitoring
        ;;
    "report")
        report_sla_metrics
        ;;
    *)
        echo "Usage: $0 {health-check|data-validation|continuous|report}"
        echo ""
        echo "Commands:"
        echo "  health-check    - Run single comprehensive health check"
        echo "  data-validation - Run data accuracy validation"
        echo "  continuous      - Start continuous monitoring (default)"
        echo "  report          - Show current SLA metrics"
        exit 1
        ;;
esac