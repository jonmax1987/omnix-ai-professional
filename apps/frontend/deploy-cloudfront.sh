#!/bin/bash

# OMNIX AI Frontend Deployment Script with CloudFront
# This script builds and deploys the frontend to S3 with CloudFront CDN

set -e

echo "🚀 OMNIX AI Frontend Deployment with CloudFront"
echo "============================================="

# Configuration
S3_BUCKET="omnix-ai-frontend-animations-1755860292"
CLOUDFRONT_DISTRIBUTION_ID="E2MCXLNXS3ZTKY"
AWS_REGION="eu-central-1"

# API Configuration - can be overridden with environment variables
API_BASE_URL=${VITE_API_BASE_URL:-"https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod"}
API_KEY=${VITE_API_KEY:-"omnix-api-key-development-2024"}

echo ""
echo "📦 Building with configuration:"
echo "  API URL: $API_BASE_URL"
echo "  API Key: $API_KEY"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building production bundle..."
VITE_API_BASE_URL="$API_BASE_URL" VITE_API_KEY="$API_KEY" npm run build

# Deploy to S3
echo "☁️ Uploading to S3..."
aws s3 sync dist/ s3://$S3_BUCKET/ \
  --region $AWS_REGION \
  --delete \
  --metadata-directive REPLACE \
  --cache-control max-age=31536000,public \
  --exclude "*.html" \
  --exclude "_headers"

# Upload HTML files with no cache
aws s3 sync dist/ s3://$S3_BUCKET/ \
  --region $AWS_REGION \
  --exclude "*" \
  --include "*.html" \
  --include "_headers" \
  --metadata-directive REPLACE \
  --cache-control no-cache,no-store,must-revalidate

# Create CloudFront invalidation
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "📝 Invalidation created: $INVALIDATION_ID"

# Wait for distribution to be deployed (optional)
echo "⏳ Waiting for CloudFront distribution to be fully deployed..."
aws cloudfront wait distribution-deployed --id $CLOUDFRONT_DISTRIBUTION_ID 2>/dev/null || true

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "🔐 HTTPS URL: https://d1vu6p9f5uc16.cloudfront.net"
echo "🔓 HTTP URL (redirects to HTTPS): http://d1vu6p9f5uc16.cloudfront.net"
echo ""
echo "📝 Deployment Info:"
echo "  S3 Bucket: $S3_BUCKET"
echo "  CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
echo "  CloudFront Domain: d1vu6p9f5uc16.cloudfront.net"
echo "  Region: $AWS_REGION"
echo "  Invalidation ID: $INVALIDATION_ID"
echo ""
echo "✅ Your OMNIX AI application is now available with HTTPS!"
echo ""
echo "💡 To use a custom domain:"
echo "  1. Add your domain as an Alternate Domain Name (CNAME) in CloudFront"
echo "  2. Request/import an SSL certificate in ACM (us-east-1 region)"
echo "  3. Update your DNS to point to d1vu6p9f5uc16.cloudfront.net"