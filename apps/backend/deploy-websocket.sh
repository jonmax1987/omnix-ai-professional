#!/bin/bash

# OMNIX AI - WebSocket Deployment Script for AWS
# Creates API Gateway WebSocket API + Lambda functions for real-time features

set -e

echo "🔌 OMNIX AI WebSocket Deployment Starting..."
echo "=========================================="

# Configuration
REGION="eu-central-1"
API_NAME="omnix-ai-websocket-api"
STAGE="dev"
LAMBDA_PREFIX="omnix-ai-ws"
ROLE_NAME="omnix-ai-websocket-lambda-role"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    error "AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
log "Using AWS Account: $ACCOUNT_ID"

# Step 1: Build the application with WebSocket support
log "Building application..."
npm run build
if [ $? -ne 0 ]; then
    error "Build failed. Fix TypeScript errors first."
    exit 1
fi

# Step 2: Create IAM role for WebSocket Lambda functions
log "Creating IAM role for WebSocket Lambda functions..."

# Create trust policy for Lambda
cat > /tmp/websocket-lambda-trust-policy.json << EOF
{
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
}
EOF

# Create role if it doesn't exist
if ! aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file:///tmp/websocket-lambda-trust-policy.json \
        --description "IAM role for OMNIX AI WebSocket Lambda functions"
fi

# Attach necessary policies
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Step 3: Create WebSocket Lambda handlers
log "Creating WebSocket Lambda functions..."

# Create connect handler
cat > /tmp/websocket-connect.js << 'EOF'
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const apiGateway = new AWS.ApiGatewayManagementApi({
    endpoint: process.env.WEBSOCKET_ENDPOINT
});

exports.handler = async (event) => {
    console.log('WebSocket Connect Event:', JSON.stringify(event, null, 2));
    
    try {
        const connectionId = event.requestContext.connectionId;
        const token = event.queryStringParameters?.token;
        
        if (!token) {
            console.log('No token provided');
            return { statusCode: 401, body: 'Unauthorized' };
        }
        
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token verified for user:', decoded.email);
        
        // Store connection in DynamoDB (optional)
        // TODO: Store connection metadata
        
        return { statusCode: 200, body: 'Connected' };
    } catch (error) {
        console.error('Connect error:', error);
        return { statusCode: 500, body: 'Connection failed' };
    }
};
EOF

# Create disconnect handler
cat > /tmp/websocket-disconnect.js << 'EOF'
exports.handler = async (event) => {
    console.log('WebSocket Disconnect Event:', JSON.stringify(event, null, 2));
    
    try {
        const connectionId = event.requestContext.connectionId;
        console.log('Client disconnected:', connectionId);
        
        // Clean up connection data from DynamoDB (optional)
        // TODO: Remove connection metadata
        
        return { statusCode: 200, body: 'Disconnected' };
    } catch (error) {
        console.error('Disconnect error:', error);
        return { statusCode: 500, body: 'Disconnect failed' };
    }
};
EOF

# Create message handler
cat > /tmp/websocket-message.js << 'EOF'
const AWS = require('aws-sdk');

const apiGateway = new AWS.ApiGatewayManagementApi({
    endpoint: process.env.WEBSOCKET_ENDPOINT
});

exports.handler = async (event) => {
    console.log('WebSocket Message Event:', JSON.stringify(event, null, 2));
    
    try {
        const connectionId = event.requestContext.connectionId;
        const message = JSON.parse(event.body);
        
        console.log('Received message:', message);
        
        // Echo message back (demo functionality)
        const response = {
            type: 'echo',
            data: message,
            timestamp: new Date().toISOString()
        };
        
        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(response)
        }).promise();
        
        return { statusCode: 200, body: 'Message sent' };
    } catch (error) {
        console.error('Message error:', error);
        return { statusCode: 500, body: 'Message failed' };
    }
};
EOF

# Create Lambda function packages
log "Packaging Lambda functions..."
for handler in connect disconnect message; do
    mkdir -p /tmp/websocket-$handler
    cp /tmp/websocket-$handler.js /tmp/websocket-$handler/index.js
    cd /tmp/websocket-$handler
    npm init -y &> /dev/null
    npm install jsonwebtoken aws-sdk --save &> /dev/null
    zip -r ../websocket-$handler.zip . &> /dev/null
    cd - &> /dev/null
done

# Deploy Lambda functions
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"

for handler in connect disconnect message; do
    FUNCTION_NAME="$LAMBDA_PREFIX-$handler"
    
    log "Deploying $FUNCTION_NAME..."
    
    if aws lambda get-function --function-name $FUNCTION_NAME &> /dev/null; then
        # Update existing function
        aws lambda update-function-code \
            --function-name $FUNCTION_NAME \
            --zip-file fileb:///tmp/websocket-$handler.zip \
            --region $REGION
    else
        # Create new function
        aws lambda create-function \
            --function-name $FUNCTION_NAME \
            --runtime nodejs18.x \
            --role $ROLE_ARN \
            --handler index.handler \
            --zip-file fileb:///tmp/websocket-$handler.zip \
            --timeout 30 \
            --memory-size 256 \
            --environment Variables="{JWT_SECRET=$JWT_SECRET,WEBSOCKET_ENDPOINT=wss://api.omnix-ai.com/ws}" \
            --region $REGION
    fi
    
    # Add permission for API Gateway to invoke Lambda
    aws lambda add-permission \
        --function-name $FUNCTION_NAME \
        --statement-id apigateway-websocket-invoke \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:*/*/*" \
        --region $REGION || true
done

# Step 4: Create WebSocket API Gateway
log "Creating WebSocket API Gateway..."

# Check if API exists
API_ID=$(aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='$API_NAME'].ApiId" --output text)

if [ "$API_ID" = "" ] || [ "$API_ID" = "None" ]; then
    # Create new WebSocket API
    API_ID=$(aws apigatewayv2 create-api \
        --name $API_NAME \
        --protocol-type WEBSOCKET \
        --route-selection-expression "\$request.body.action" \
        --description "OMNIX AI WebSocket API for real-time features" \
        --region $REGION \
        --query ApiId --output text)
    
    log "Created WebSocket API: $API_ID"
else
    log "Using existing WebSocket API: $API_ID"
fi

# Create integrations and routes
for handler in connect disconnect message; do
    FUNCTION_NAME="$LAMBDA_PREFIX-$handler"
    FUNCTION_ARN="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$FUNCTION_NAME"
    
    # Create integration
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id $API_ID \
        --integration-type AWS_PROXY \
        --integration-method POST \
        --integration-uri $FUNCTION_ARN \
        --region $REGION \
        --query IntegrationId --output text)
    
    # Create route
    if [ "$handler" = "connect" ]; then
        ROUTE_KEY="\$connect"
    elif [ "$handler" = "disconnect" ]; then
        ROUTE_KEY="\$disconnect"
    else
        ROUTE_KEY="\$default"
    fi
    
    aws apigatewayv2 create-route \
        --api-id $API_ID \
        --route-key "$ROUTE_KEY" \
        --target "integrations/$INTEGRATION_ID" \
        --region $REGION || true
done

# Step 5: Deploy WebSocket API
log "Deploying WebSocket API stage..."

# Create deployment
DEPLOYMENT_ID=$(aws apigatewayv2 create-deployment \
    --api-id $API_ID \
    --description "WebSocket API deployment $(date)" \
    --region $REGION \
    --query DeploymentId --output text)

# Create or update stage
aws apigatewayv2 create-stage \
    --api-id $API_ID \
    --stage-name $STAGE \
    --deployment-id $DEPLOYMENT_ID \
    --description "Development stage for WebSocket API" \
    --region $REGION || \
aws apigatewayv2 update-stage \
    --api-id $API_ID \
    --stage-name $STAGE \
    --deployment-id $DEPLOYMENT_ID \
    --region $REGION

# Step 6: Output connection information
log "WebSocket deployment completed!"

WEBSOCKET_URL="wss://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE"

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 WebSocket Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}WebSocket Connection URL:${NC}"
echo "$WEBSOCKET_URL"
echo ""
echo -e "${BLUE}Lambda Functions Created:${NC}"
echo "  - $LAMBDA_PREFIX-connect"
echo "  - $LAMBDA_PREFIX-disconnect" 
echo "  - $LAMBDA_PREFIX-message"
echo ""
echo -e "${BLUE}API Gateway WebSocket API:${NC}"
echo "  - API ID: $API_ID"
echo "  - Stage: $STAGE"
echo "  - Region: $REGION"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update frontend WebSocket client to use: $WEBSOCKET_URL"
echo "2. Test WebSocket connection with authentication"
echo "3. Integrate with existing REST API for hybrid functionality"
echo ""
echo -e "${BLUE}Testing Command:${NC}"
echo "wscat -c '$WEBSOCKET_URL?token=YOUR_JWT_TOKEN'"
echo ""

# Clean up temporary files
rm -rf /tmp/websocket-* 2>/dev/null || true

echo "🚀 WebSocket API is ready for testing!"