#!/bin/bash

# OMNIX AI - Staging Deployment Script
# Deploys to staging CloudFront with analytics fixes

set -e

# Configuration - Use staging CloudFront
BUCKET_NAME="omnix-ai-staging-frontend-minimal"
CLOUDFRONT_DISTRIBUTION_ID="E1HN3Y5MSQJFFC"
REGION="eu-central-1"

echo "🚀 OMNIX AI - Staging Deployment with Analytics Fix"
echo "=================================================="
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Step 1: Build for production
echo "🔨 Building for production..."
VITE_API_BASE_URL=https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/dev VITE_API_KEY=omnix-api-key-development-2024 npm run build
echo "✅ Build completed"

# Step 2: Upload files directly to existing bucket
echo "⬆️  Uploading files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete \
    --cache-control "max-age=31536000" \
    --exclude "*.html"

aws s3 sync dist/ s3://$BUCKET_NAME --delete \
    --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
    --include "*.html"

echo "✅ Files uploaded successfully"

# Invalidate CloudFront distribution
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*" > /dev/null

# Get the website URL
WEBSITE_URL="https://$CLOUDFRONT_DISTRIBUTION_ID.cloudfront.net"

echo ""
echo "🎉 Staging Deployment Complete!"
echo "================================"
echo "Staging URL: $WEBSITE_URL"
echo ""
echo "📝 Deployment Info:"
echo "Bucket: $BUCKET_NAME" 
echo "CloudFront: $CLOUDFRONT_DISTRIBUTION_ID"
echo "Region: $REGION"
echo "Built with API URL: https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/dev"
echo "Built with API Key: omnix-api-key-development-2024"
echo ""
echo "🔗 Your OMNIX AI staging application is now live with analytics fixes!"