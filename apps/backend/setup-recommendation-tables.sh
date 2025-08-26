#!/bin/bash

# Script to create DynamoDB tables for Customer Recommendation System
# Usage: ./setup-recommendation-tables.sh

REGION="eu-central-1"
PROFILE=""  # Add --profile your-profile if needed

echo "🚀 Setting up DynamoDB tables for Customer Recommendation System..."

# 1. Customer Profiles Table
echo "Creating customer profiles table..."
aws dynamodb create-table \
    --table-name omnix-ai-customer-profiles-dev \
    --attribute-definitions \
        AttributeName=customerId,AttributeType=S \
        AttributeName=updatedAt,AttributeType=S \
    --key-schema \
        AttributeName=customerId,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=customerId-updatedAt-index,Keys=[{AttributeName=customerId,KeyType=HASH},{AttributeName=updatedAt,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION $PROFILE \
    2>/dev/null || echo "Table omnix-ai-customer-profiles-dev already exists or error occurred"

# 2. Purchase History Table
echo "Creating purchase history table..."
aws dynamodb create-table \
    --table-name omnix-ai-purchase-history-dev \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=customerId,AttributeType=S \
        AttributeName=purchaseDate,AttributeType=S \
        AttributeName=productId,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=customerId-purchaseDate-index,Keys=[{AttributeName=customerId,KeyType=HASH},{AttributeName=purchaseDate,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
        "IndexName=productId-purchaseDate-index,Keys=[{AttributeName=productId,KeyType=HASH},{AttributeName=purchaseDate,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION $PROFILE \
    2>/dev/null || echo "Table omnix-ai-purchase-history-dev already exists or error occurred"

# 3. Product Interactions Table
echo "Creating product interactions table..."
aws dynamodb create-table \
    --table-name omnix-ai-product-interactions-dev \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=customerId,AttributeType=S \
        AttributeName=timestamp,AttributeType=S \
        AttributeName=productId,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=customerId-timestamp-index,Keys=[{AttributeName=customerId,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
        "IndexName=productId-timestamp-index,Keys=[{AttributeName=productId,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION $PROFILE \
    2>/dev/null || echo "Table omnix-ai-product-interactions-dev already exists or error occurred"

# 4. Recommendations Table
echo "Creating recommendations table..."
aws dynamodb create-table \
    --table-name omnix-ai-recommendations-dev \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=customerId,AttributeType=S \
        AttributeName=generatedAt,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=customerId-generatedAt-index,Keys=[{AttributeName=customerId,KeyType=HASH},{AttributeName=generatedAt,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST" \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION $PROFILE \
    2>/dev/null || echo "Table omnix-ai-recommendations-dev already exists or error occurred"

echo "✅ DynamoDB tables setup process completed!"

# Wait for tables to be active
echo "Waiting for tables to become active..."
for table in "omnix-ai-customer-profiles-dev" "omnix-ai-purchase-history-dev" "omnix-ai-product-interactions-dev" "omnix-ai-recommendations-dev"; do
    aws dynamodb wait table-exists --table-name $table --region $REGION $PROFILE 2>/dev/null || true
    echo "Table $table is ready"
done

echo "🎉 All tables are ready for use!"

# Display table information
echo ""
echo "📊 Table Information:"
for table in "omnix-ai-customer-profiles-dev" "omnix-ai-purchase-history-dev" "omnix-ai-product-interactions-dev" "omnix-ai-recommendations-dev"; do
    echo "- $table"
    aws dynamodb describe-table --table-name $table --region $REGION $PROFILE --query "Table.[TableStatus,ItemCount]" --output text 2>/dev/null || echo "  Status: Not found or error"
done