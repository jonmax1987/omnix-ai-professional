#!/bin/bash

# OMNIX AI - Secure AWS Deployment Script
# Deploys React frontend to S3 + CloudFront with Origin Access Control

set -e

# Configuration
PROJECT_NAME="omnix-ai"
REGION="eu-central-1"
BUCKET_NAME="omnix-ai-frontend-animations-$(date +%s)"
DISTRIBUTION_NAME="${PROJECT_NAME}-cdn"

echo "🚀 OMNIX AI - Secure AWS Deployment"
echo "===================================="
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Step 1: Build for production
echo "🔨 Building for production..."
npm run build
echo "✅ Build completed"

# Step 2: Create S3 bucket (private)
echo "🪣 Creating private S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Step 3: Block all public access (security best practice)
echo "🔒 Blocking public access..."
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Step 4: Upload files to S3
echo "⬆️  Uploading files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete \
    --cache-control "max-age=31536000" \
    --exclude "*.html"

aws s3 sync dist/ s3://$BUCKET_NAME --delete \
    --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
    --include "*.html"

echo "✅ Files uploaded to private S3 bucket"

# Step 5: Create Origin Access Control
echo "🔐 Creating Origin Access Control..."
OAC_CONFIG='{
    "Name": "omnix-ai-oac",
    "Description": "OMNIX AI Origin Access Control",
    "OriginAccessControlOriginType": "s3",
    "SigningBehavior": "always",
    "SigningProtocol": "sigv4"
}'

OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config "$OAC_CONFIG" \
    --query 'OriginAccessControl.Id' --output text)

echo "✅ Origin Access Control created: $OAC_ID"

# Step 6: Create CloudFront distribution with OAC
echo "☁️  Creating CloudFront distribution..."
DISTRIBUTION_CONFIG=$(cat << EOF
{
  "CallerReference": "omnix-ai-$(date +%s)",
  "Comment": "OMNIX AI Frontend Distribution with OAC",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BUCKET_NAME",
        "DomainName": "$BUCKET_NAME.s3.$REGION.amazonaws.com",
        "OriginAccessControlId": "$OAC_ID",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 86400
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html", 
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 86400
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100",
  "HttpVersion": "http2",
  "IsIPV6Enabled": true
}
EOF
)

echo "$DISTRIBUTION_CONFIG" > distribution-config.json
DISTRIBUTION_RESULT=$(aws cloudfront create-distribution --distribution-config file://distribution-config.json)
DISTRIBUTION_ID=$(echo "$DISTRIBUTION_RESULT" | jq -r '.Distribution.Id')
DISTRIBUTION_DOMAIN=$(echo "$DISTRIBUTION_RESULT" | jq -r '.Distribution.DomainName')
DISTRIBUTION_ARN=$(echo "$DISTRIBUTION_RESULT" | jq -r '.Distribution.ARN')

rm distribution-config.json
echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"

# Step 7: Create bucket policy for CloudFront access
echo "🔓 Setting CloudFront-only bucket policy..."
BUCKET_POLICY=$(cat << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "$DISTRIBUTION_ARN"
        }
      }
    }
  ]
}
EOF
)

echo "$BUCKET_POLICY" > bucket-policy.json
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json
echo "✅ Bucket policy configured for CloudFront access"

echo ""
echo "🎉 Secure Deployment Complete!"
echo "=============================="
echo "CloudFront URL: https://$DISTRIBUTION_DOMAIN"
echo ""
echo "📝 Deployment Info:"
echo "Bucket Name: $BUCKET_NAME"
echo "Distribution ID: $DISTRIBUTION_ID"
echo "Origin Access Control ID: $OAC_ID"
echo "Region: $REGION"
echo ""
echo "⏰ Note: CloudFront distribution may take 15-20 minutes to fully deploy"
echo "🔒 Security: S3 bucket is private, only accessible via CloudFront"
echo "💡 Save these details for future updates!"

# Save deployment info for future use
cat > deployment-info.json << EOF
{
  "bucketName": "$BUCKET_NAME",
  "distributionId": "$DISTRIBUTION_ID",
  "distributionDomain": "$DISTRIBUTION_DOMAIN",
  "oac_id": "$OAC_ID",
  "region": "$REGION",
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "📄 Deployment info saved to deployment-info.json"