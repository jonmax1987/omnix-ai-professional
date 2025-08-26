#!/bin/bash

# Update CloudFront origin path to include /v1 for backend API endpoints
# Backend now requires /v1 prefix for all endpoints

set -e

DISTRIBUTION_ID="E2MCXLNXS3ZTKY"
ORIGIN_ID="18sz01wxsi.execute-api.eu-central-1.amazonaws.com"

echo "🔧 Updating CloudFront origin path to include /v1..."
echo "Distribution: $DISTRIBUTION_ID"
echo "Origin: $ORIGIN_ID"
echo ""

# Get current config
echo "📥 Getting current distribution config..."
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --output json > current-config.json

# Extract ETag for update
ETAG=$(jq -r '.ETag' current-config.json)
echo "Current ETag: $ETAG"

# Update origin path from "/dev" to "/dev/v1"
echo "🔄 Updating origin path from '/dev' to '/dev/v1'..."
jq --arg originId "$ORIGIN_ID" '
  .DistributionConfig | 
  .Origins.Items = [
    .Origins.Items[] | 
    if .Id == $originId then
      .OriginPath = "/dev/v1"
    else
      .
    end
  ]' current-config.json > updated-config.json

# Update distribution
echo "⬆️  Updating CloudFront distribution..."
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --distribution-config file://updated-config.json \
  --if-match $ETAG \
  --output json > update-result.json

NEW_ETAG=$(jq -r '.ETag' update-result.json)
echo "✅ Distribution updated successfully"
echo "New ETag: $NEW_ETAG"

echo ""
echo "🎯 Update Summary:"
echo "- Changed API origin path from '/dev' to '/dev/v1'"
echo "- CloudFront /api/* requests will now route to correct v1 endpoints"
echo "- Frontend can continue using /api proxy path"
echo ""
echo "⏰ Note: Changes may take 5-10 minutes to propagate"
echo "🧪 Test with: curl https://d1vu6p9f5uc16.cloudfront.net/api/system/health"