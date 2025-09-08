#!/bin/bash

# OMNIX AI - Data Retrieval Deployment Rollback Plan
# Emergency rollback script for production deployment
# Usage: ./rollback-plan.sh [quick|full]

set -e

FUNCTION_NAME="omnix-ai-backend-dev"
REGION="eu-central-1"
PRODUCTION_API="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod"

echo "🚨 OMNIX AI Emergency Rollback Script"
echo "======================================"
echo "Function: $FUNCTION_NAME"
echo "Region: $REGION"
echo "Timestamp: $(date)"
echo ""

ROLLBACK_TYPE=${1:-quick}

if [ "$ROLLBACK_TYPE" = "quick" ]; then
    echo "🔄 Executing QUICK ROLLBACK (Switch to previous version)"
    
    # Get current production alias version
    CURRENT_VERSION=$(aws lambda get-alias \
        --function-name $FUNCTION_NAME \
        --name production \
        --region $REGION \
        --query 'FunctionVersion' \
        --output text)
    
    echo "Current production version: $CURRENT_VERSION"
    
    # Switch to $LATEST (previous deployment)
    echo "Switching production alias to \$LATEST..."
    aws lambda update-alias \
        --function-name $FUNCTION_NAME \
        --name production \
        --function-version '$LATEST' \
        --region $REGION \
        --description "Emergency rollback - $(date)"
    
    echo "✅ Quick rollback completed"

elif [ "$ROLLBACK_TYPE" = "full" ]; then
    echo "🔄 Executing FULL ROLLBACK (Deploy previous package)"
    
    if [ ! -f "omnix-ai-backend-previous.zip" ]; then
        echo "❌ Previous deployment package not found!"
        echo "Creating emergency package from current directory..."
        
        # Create emergency package
        mkdir -p rollback-temp
        cp lambda.js rollback-temp/
        cp package-lambda.json rollback-temp/package.json
        cd rollback-temp
        npm install --production
        zip -r ../omnix-ai-backend-emergency.zip .
        cd ..
        rm -rf rollback-temp
        
        echo "✅ Emergency package created: omnix-ai-backend-emergency.zip"
        PACKAGE_FILE="omnix-ai-backend-emergency.zip"
    else
        PACKAGE_FILE="omnix-ai-backend-previous.zip"
    fi
    
    echo "Deploying rollback package: $PACKAGE_FILE"
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://$PACKAGE_FILE \
        --region $REGION
    
    echo "✅ Full rollback completed"
    
else
    echo "❌ Invalid rollback type. Use 'quick' or 'full'"
    exit 1
fi

# Wait for deployment to stabilize
echo ""
echo "⏳ Waiting for deployment to stabilize..."
sleep 10

# Test health endpoint
echo "🧪 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" "$PRODUCTION_API/v1/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep -o "HTTP_CODE:.*" | cut -d: -f2)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed 's/HTTP_CODE:.*//')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed (HTTP $HTTP_CODE)"
    echo "Response: $HEALTH_BODY"
else
    echo "❌ Health check failed (HTTP $HTTP_CODE)"
    echo "Response: $HEALTH_BODY"
    exit 1
fi

# Test critical endpoints
echo ""
echo "🧪 Testing critical endpoints..."

# Test products endpoint
PRODUCTS_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_API/v1/products")
if [ "$PRODUCTS_HTTP_CODE" = "200" ]; then
    echo "✅ Products API: HTTP $PRODUCTS_HTTP_CODE"
else
    echo "❌ Products API failed: HTTP $PRODUCTS_HTTP_CODE"
fi

# Test orders endpoint  
ORDERS_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_API/v1/orders")
if [ "$ORDERS_HTTP_CODE" = "200" ]; then
    echo "✅ Orders API: HTTP $ORDERS_HTTP_CODE"
else
    echo "❌ Orders API failed: HTTP $ORDERS_HTTP_CODE"
fi

# Test dashboard endpoint
DASHBOARD_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_API/v1/dashboard/summary")
if [ "$DASHBOARD_HTTP_CODE" = "200" ]; then
    echo "✅ Dashboard API: HTTP $DASHBOARD_HTTP_CODE"
else
    echo "❌ Dashboard API failed: HTTP $DASHBOARD_HTTP_CODE"
fi

echo ""
echo "🎉 Rollback validation completed!"
echo ""
echo "📊 Post-Rollback Checklist:"
echo "□ Monitor CloudWatch metrics for 15 minutes"
echo "□ Verify frontend dashboard functionality"  
echo "□ Test user authentication flows"
echo "□ Check data consistency"
echo "□ Notify stakeholders of rollback"
echo ""
echo "🔍 Monitoring Commands:"
echo "aws logs describe-log-streams --log-group-name '/aws/lambda/$FUNCTION_NAME' --region $REGION"
echo "aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=$FUNCTION_NAME --start-time \$(date -u -d '10 minutes ago' +%Y-%m-%dT%H:%M:%SZ) --end-time \$(date -u +%Y-%m-%dT%H:%M:%SZ) --period 60 --statistics Sum --region $REGION"
echo ""
echo "✅ Rollback procedure completed successfully!"