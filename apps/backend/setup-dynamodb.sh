#!/bin/bash

# DynamoDB Tables Setup Script for OMNIX AI Backend

set -e  # Exit on any error

echo "🗄️  OMNIX AI Backend - DynamoDB Tables Setup"
echo "============================================="

# Configuration variables
REGION="eu-central-1"
STAGE="dev"
TABLE_PREFIX="omnix-ai-${STAGE}-"

echo "📋 Configuration:"
echo "   Region: $REGION"
echo "   Stage: $STAGE"
echo "   Table Prefix: $TABLE_PREFIX"
echo ""

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured. Creating DynamoDB tables..."
echo ""

# Function to create table with error handling
create_table() {
    local table_name=$1
    local key_schema=$2
    local attribute_definitions=$3
    local global_secondary_indexes=$4
    
    echo "📊 Creating table: $table_name"
    
    if [ -z "$global_secondary_indexes" ]; then
        aws dynamodb create-table \
            --table-name "$table_name" \
            --key-schema "$key_schema" \
            --attribute-definitions "$attribute_definitions" \
            --billing-mode PAY_PER_REQUEST \
            --region "$REGION" \
            --output text > /dev/null 2>&1 || echo "   ⚠️  Table may already exist"
    else
        aws dynamodb create-table \
            --table-name "$table_name" \
            --key-schema "$key_schema" \
            --attribute-definitions "$attribute_definitions" \
            --global-secondary-indexes "$global_secondary_indexes" \
            --billing-mode PAY_PER_REQUEST \
            --region "$REGION" \
            --output text > /dev/null 2>&1 || echo "   ⚠️  Table may already exist"
    fi
    
    echo "   ✅ $table_name created/verified"
}

# 1. Users Table
echo "👥 Creating Users table..."
create_table \
    "${TABLE_PREFIX}users" \
    'AttributeName=id,KeyType=HASH' \
    'AttributeName=id,AttributeType=S AttributeName=email,AttributeType=S' \
    'IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL}'

# 2. Products Table
echo "📦 Creating Products table..."
create_table \
    "${TABLE_PREFIX}products" \
    'AttributeName=id,KeyType=HASH' \
    'AttributeName=id,AttributeType=S AttributeName=category,AttributeType=S' \
    'IndexName=category-index,KeySchema=[{AttributeName=category,KeyType=HASH}],Projection={ProjectionType=ALL}'

# 3. Orders Table
echo "🛍️  Creating Orders table..."
create_table \
    "${TABLE_PREFIX}orders" \
    'AttributeName=id,KeyType=HASH' \
    'AttributeName=id,AttributeType=S AttributeName=status,AttributeType=S AttributeName=createdAt,AttributeType=S' \
    'IndexName=status-created-index,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL}'

# 4. Inventory Table
echo "📊 Creating Inventory table..."
create_table \
    "${TABLE_PREFIX}inventory" \
    'AttributeName=productId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE' \
    'AttributeName=productId,AttributeType=S AttributeName=timestamp,AttributeType=S'

# 5. Sessions Table (for refresh tokens)
echo "🔐 Creating Sessions table..."
create_table \
    "${TABLE_PREFIX}sessions" \
    'AttributeName=refreshToken,KeyType=HASH' \
    'AttributeName=refreshToken,AttributeType=S AttributeName=userId,AttributeType=S' \
    'IndexName=user-index,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL}'

echo ""
echo "⏳ Waiting for tables to become active..."
sleep 5

# Check table status
echo "🔍 Checking table status..."
for table in "users" "products" "orders" "inventory" "sessions"; do
    table_name="${TABLE_PREFIX}${table}"
    status=$(aws dynamodb describe-table --table-name "$table_name" --region "$REGION" --query 'Table.TableStatus' --output text 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$status" = "ACTIVE" ]; then
        echo "   ✅ $table_name: ACTIVE"
    elif [ "$status" = "CREATING" ]; then
        echo "   🔄 $table_name: CREATING"
    else
        echo "   ❌ $table_name: $status"
    fi
done

echo ""
echo "🎉 DynamoDB setup complete!"
echo ""
echo "📊 Created Tables:"
echo "   ${TABLE_PREFIX}users      - User accounts and authentication"
echo "   ${TABLE_PREFIX}products   - Product catalog and inventory items"
echo "   ${TABLE_PREFIX}orders     - Purchase orders and order history"
echo "   ${TABLE_PREFIX}inventory  - Stock levels and adjustment history"
echo "   ${TABLE_PREFIX}sessions   - Refresh tokens and user sessions"
echo ""
echo "🔧 Next Steps:"
echo "1. Update Lambda environment variables to use DynamoDB"
echo "2. Replace in-memory data stores with DynamoDB operations"
echo "3. Test API endpoints with persistent storage"
echo ""
echo "💡 Environment Variables for Lambda:"
echo "   DYNAMODB_TABLE_PREFIX=${TABLE_PREFIX}"
echo "   AWS_REGION=${REGION}"
echo ""
echo "🧪 Test DynamoDB access:"
echo "   aws dynamodb scan --table-name ${TABLE_PREFIX}users --region ${REGION} --max-items 1"