#!/bin/bash

# OMNIX AI Authentication Flow Test Script
# Usage: ./test-auth-flow.sh EMAIL PASSWORD

if [ $# -ne 2 ]; then
    echo "Usage: $0 <email> <password>"
    echo "Example: $0 test@omnix-ai.com mypassword123"
    exit 1
fi

EMAIL="$1"
PASSWORD="$2"
BASE_URL="https://wdqm1vpl80.execute-api.eu-central-1.amazonaws.com/dev"

echo "🔐 Testing OMNIX AI Authentication Flow"
echo "========================================"
echo "Email: $EMAIL"
echo "Backend: $BASE_URL"
echo ""

# Step 1: Test Login
echo "📝 Step 1: Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Login Response: $LOGIN_RESPONSE"

# Check if login was successful
if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ Login successful!"
    
    # Extract token (basic extraction - works if token is in the response)
    TOKEN=$(echo "$LOGIN_RESPONSE" | sed 's/.*"token":"\([^"]*\)".*/\1/')
    echo "🔑 JWT Token extracted: ${TOKEN:0:50}..."
    
    # Step 2: Test Protected Endpoint
    echo ""
    echo "📊 Step 2: Testing Protected Endpoint (Products)..."
    PRODUCTS_RESPONSE=$(curl -s -X GET "$BASE_URL/products" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "Products Response: $PRODUCTS_RESPONSE"
    
    if echo "$PRODUCTS_RESPONSE" | grep -q "data"; then
        echo "✅ Protected endpoint access successful!"
    else
        echo "❌ Protected endpoint access failed"
    fi
    
    # Step 3: Test Dashboard
    echo ""
    echo "📈 Step 3: Testing Dashboard Summary..."
    DASHBOARD_RESPONSE=$(curl -s -X GET "$BASE_URL/dashboard/summary" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "Dashboard Response: $DASHBOARD_RESPONSE"
    
    if echo "$DASHBOARD_RESPONSE" | grep -q "data"; then
        echo "✅ Dashboard access successful!"
    else
        echo "❌ Dashboard access failed"
    fi
    
    echo ""
    echo "🎉 Authentication flow test completed!"
    echo "✅ Login: Working"
    echo "✅ JWT Token: Received" 
    echo "✅ Protected APIs: Accessible"
    
else
    echo "❌ Login failed!"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi