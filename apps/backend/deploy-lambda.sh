#!/bin/bash

echo "🚀 Starting AWS Lambda Deployment Process..."
echo "🤖 Including AI Analysis & Bedrock Support"

# Check for Bedrock dependencies
echo "🔍 Checking AI dependencies..."
if ! npm list @aws-sdk/client-bedrock-runtime &> /dev/null; then
    echo "❌ Bedrock SDK not found! Installing..."
    npm install @aws-sdk/client-bedrock-runtime
fi

# Step 1: Build the application
echo "📦 Building NestJS application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Step 2: Create deployment package
echo "📁 Creating deployment package..."
mkdir -p deployment
cp -r dist/* deployment/
cp package.json deployment/
cp -r node_modules deployment/

# Copy Lambda handler to deployment directory
cp lambda.ts deployment/ 2>/dev/null || echo "⚠️  Lambda handler not found, using alternative approach"

# Step 3: Install production dependencies only
echo "📦 Installing production dependencies..."
cd deployment
npm install --production --omit=dev
cd ..

# Step 4: Create ZIP file for Lambda
echo "🗜️  Creating Lambda deployment package..."
cd deployment
zip -r ../omnix-ai-backend-lambda.zip . -x "*.map" "*.ts" "test/*" "*.test.js"
cd ..

echo "✅ Lambda package created: omnix-ai-backend-lambda.zip"
echo "📊 Package size: $(du -h omnix-ai-backend-lambda.zip | cut -f1)"

# Step 5: Verify AI components are included
echo "🤖 Verifying AI components in package..."
if [[ -f "deployment/src/services/bedrock.service.js" ]]; then
    echo "✅ Bedrock service included"
else
    echo "❌ Bedrock service missing!"
fi

if [[ -f "deployment/src/customers/ai-analysis.service.js" ]]; then
    echo "✅ AI analysis service included"
else
    echo "❌ AI analysis service missing!"
fi

# Step 6: Check if AWS CLI is available
if command -v aws &> /dev/null; then
    echo "🔧 AWS CLI found. Ready for deployment!"
    echo ""
    echo "🤖 AI-Enhanced Deployment Steps:"
    echo "1. Run: ./setup-bedrock.sh (sets up Bedrock access)"
    echo "2. Upload omnix-ai-backend-lambda.zip to AWS Lambda"
    echo "3. Configure API Gateway to point to Lambda function"
    echo "4. Set up DynamoDB tables"
    echo "5. Configure environment variables (including Bedrock)"
    echo "6. Test AI endpoints with: node test-ai-analysis.js"
    echo ""
    echo "🔧 Required Environment Variables:"
    echo "   AWS_BEDROCK_REGION=us-east-1"
    echo "   BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0"
    echo "   AI_ANALYSIS_ENABLED=true"
else
    echo "⚠️  AWS CLI not found. Manual deployment required."
    echo ""
    echo "Manual deployment steps:"
    echo "1. Upload omnix-ai-backend-lambda.zip to AWS Lambda Console"
    echo "2. Set runtime to Node.js 18.x"
    echo "3. Set handler to 'dist/lambda.handler' or 'lambda.handler'"
    echo "4. Configure environment variables (see BACKEND_DEPLOYMENT_REPORT.md)"
fi

echo ""
echo "🎉 Deployment package ready!"