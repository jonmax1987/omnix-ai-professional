#!/bin/bash

# AWS Lambda and API Gateway Setup Script for OMNIX AI Backend
# Target URL: https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1

set -e  # Exit on any error

echo "🚀 OMNIX AI Backend - AWS Infrastructure Setup"
echo "=============================================="

# Configuration variables
FUNCTION_NAME="omnix-ai-backend-dev"
ROLE_NAME="omnix-ai-lambda-execution-role-dev"
API_NAME="omnix-ai-api-dev"
REGION="eu-central-1"
STAGE="dev"

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    echo "   Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured. Current identity:"
aws sts get-caller-identity

echo ""
echo "📋 Setup Configuration:"
echo "   Function Name: $FUNCTION_NAME"
echo "   IAM Role: $ROLE_NAME"
echo "   API Name: $API_NAME"
echo "   Region: $REGION"
echo "   Stage: $STAGE"
echo ""

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Step 1: Create IAM Role for Lambda
echo "🔐 Creating IAM Role for Lambda..."
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }' \
    --region $REGION || echo "Role may already exist"

# Attach policies to the role
echo "📎 Attaching policies to IAM role..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Get account ID for role ARN
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo "✅ IAM Role ARN: $ROLE_ARN"

# Wait for role to be ready
echo "⏳ Waiting for IAM role to be ready..."
sleep 10

# Step 2: Create Lambda function
echo "⚡ Creating Lambda function..."
if [ ! -f "omnix-ai-backend-lambda.zip" ]; then
    echo "❌ Lambda package not found. Please run ./deploy-lambda.sh first."
    exit 1
fi

aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs18.x \
    --role $ROLE_ARN \
    --handler dist/lambda.handler \
    --zip-file fileb://omnix-ai-backend-lambda.zip \
    --timeout 30 \
    --memory-size 512 \
    --environment Variables='{
        "NODE_ENV":"production",
        "JWT_SECRET":"omnix-jwt-secret-change-in-production",
        "JWT_REFRESH_SECRET":"omnix-refresh-secret-change-in-production",
        "API_KEY_1":"omnix-api-key-production-2024",
        "AWS_REGION":"'$REGION'",
        "DYNAMODB_TABLE_PREFIX":"omnix-ai-'$STAGE'-"
    }' \
    --region $REGION || echo "Function may already exist"

echo "✅ Lambda function created: $FUNCTION_NAME"

# Step 3: Create API Gateway
echo "🌐 Creating API Gateway..."
API_ID=$(aws apigateway create-rest-api \
    --name $API_NAME \
    --description "OMNIX AI Inventory Management API" \
    --region $REGION \
    --query 'id' \
    --output text) || echo "API may already exist"

if [ -z "$API_ID" ]; then
    echo "❌ Failed to create API Gateway"
    exit 1
fi

echo "✅ API Gateway created: $API_ID"

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[?path==`/`].id' \
    --output text)

# Create {proxy+} resource
echo "📡 Setting up API Gateway proxy resource..."
PROXY_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part '{proxy+}' \
    --region $REGION \
    --query 'id' \
    --output text)

# Create ANY method for proxy resource
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method ANY \
    --authorization-type NONE \
    --region $REGION

# Set up Lambda integration
LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method ANY \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" \
    --region $REGION

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*/*" \
    --region $REGION || echo "Permission may already exist"

# Deploy API
echo "🚀 Deploying API Gateway..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name $STAGE \
    --region $REGION

# Get the API URL
API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE}"

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "✅ Lambda Function: $FUNCTION_NAME"
echo "✅ API Gateway: $API_NAME"
echo "✅ API URL: $API_URL"
echo ""
echo "🔧 Next Steps:"
echo "1. Set up DynamoDB tables (run ./setup-dynamodb.sh)"
echo "2. Test API endpoints: curl $API_URL/v1/system/health"
echo "3. Configure custom domain (optional)"
echo "4. Set up CloudWatch monitoring"
echo ""
echo "📚 Documentation: $API_URL/api/docs (if NODE_ENV != production)"
echo ""
echo "⚠️  Important: Update environment variables for production use!"