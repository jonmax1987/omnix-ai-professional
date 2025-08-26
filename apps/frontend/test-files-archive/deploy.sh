#!/bin/bash

# OMNIX AI - AWS Deployment Script
# Deploys React frontend to S3 + CloudFront

set -e

# Configuration
PROJECT_NAME="omnix-ai"
REGION="eu-central-1"
BUCKET_NAME="${PROJECT_NAME}-frontend-$(date +%s)"
DISTRIBUTION_NAME="${PROJECT_NAME}-cdn"

echo "🚀 OMNIX AI - AWS Deployment"
echo "=============================="
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Step 1: Create production environment file
echo "📝 Creating production environment..."
cp .env.example .env.production
sed -i 's/https:\/\/8r85mpuvt3.execute-api.eu-central-1.amazonaws.com\/dev/https:\/\/18sz01wxsi.execute-api.eu-central-1.amazonaws.com\/dev/g' .env.production
echo "✅ Production environment configured"

# Step 2: Build for production
echo "🔨 Building for production..."
npm run build
echo "✅ Build completed"

# Step 3: Create S3 bucket
echo "🪣 Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Step 4: Configure bucket for static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Step 5: Set bucket policy for public read
echo "🔓 Setting bucket policy..."
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

# Step 6: Upload build files
echo "⬆️  Uploading files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete --cache-control "max-age=31536000" --exclude "*.html"
aws s3 sync dist/ s3://$BUCKET_NAME --delete --cache-control "max-age=0, no-cache, no-store, must-revalidate" --include "*.html"
echo "✅ Files uploaded"

# Step 7: Create CloudFront distribution
echo "☁️  Creating CloudFront distribution..."
DISTRIBUTION_CONFIG=$(cat << EOF
{
  "CallerReference": "omnix-ai-$(date +%s)",
  "Comment": "OMNIX AI Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3Origin",
        "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF
)

echo "$DISTRIBUTION_CONFIG" > distribution-config.json
DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file://distribution-config.json --query 'Distribution.Id' --output text)
rm distribution-config.json

echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"

# Step 8: Get URLs
S3_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
CLOUDFRONT_URL=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "S3 Website URL: $S3_URL"
echo "CloudFront URL: https://$CLOUDFRONT_URL"
echo ""
echo "📝 Deployment Info:"
echo "Bucket Name: $BUCKET_NAME"
echo "Distribution ID: $DISTRIBUTION_ID"
echo "Region: $REGION"
echo ""
echo "⏰ Note: CloudFront distribution may take 15-20 minutes to fully deploy"
echo "💡 Save these details for future updates!"