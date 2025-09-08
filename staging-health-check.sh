#!/bin/bash

# OMNIX AI Staging Environment Health Check
# This script verifies that all staging endpoints are working correctly
# Run this AFTER any deployment to ensure nothing is broken

echo "=========================================="
echo "   OMNIX AI STAGING HEALTH CHECK"
echo "=========================================="
echo ""

BASE_URL="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1"
ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_code=$4
    local description=$5
    
    if [ "$method" = "GET" ]; then
        response_code=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://dtdnwq4annvk2.cloudfront.net" "$BASE_URL$endpoint")
    else
        response_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -H "Origin: https://dtdnwq4annvk2.cloudfront.net" -d "$data" "$BASE_URL$endpoint")
    fi
    
    if [ "$response_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} $description (HTTP $response_code)"
    else
        echo -e "${RED}✗${NC} $description (Expected: $expected_code, Got: $response_code)"
        ((ERRORS++))
    fi
}

echo "🔍 Testing Core Endpoints..."
echo "----------------------------"
test_endpoint "GET" "/health" "" "200" "Health Check"
test_endpoint "GET" "/dashboard/summary" "" "200" "Dashboard Summary"
test_endpoint "GET" "/products" "" "200" "Products List"
test_endpoint "GET" "/orders" "" "200" "Orders List"
test_endpoint "GET" "/orders/statistics" "" "200" "Order Statistics"
test_endpoint "GET" "/alerts" "" "200" "Alerts"
test_endpoint "GET" "/recommendations/orders" "" "200" "Order Recommendations"

echo ""
echo "🔐 Testing Authentication..."
echo "----------------------------"
test_endpoint "POST" "/auth/login" '{"email":"staging@omnix.ai","password":"staging123"}' "200" "Manager Login"
test_endpoint "POST" "/auth/login" '{"email":"customer@staging.omnix.ai","password":"customer123"}' "200" "Customer Login"
test_endpoint "POST" "/auth/login" '{"email":"wrong@email.com","password":"wrongpass"}' "401" "Invalid Login (should fail)"

echo ""
echo "👤 Testing Customer Endpoints..."
echo "---------------------------------"
test_endpoint "GET" "/customer/profile" "" "200" "Customer Profile"
test_endpoint "GET" "/customer/recommendations" "" "200" "Customer Recommendations"

echo ""
echo "🤖 Testing AI Insights..."
echo "-------------------------"
test_endpoint "GET" "/ai/insights/consumption-predictions?params[customerId]=staging-customer-001" "" "200" "Consumption Predictions"
test_endpoint "POST" "/ai/insights/personalization" '{"customerId":"staging-customer-001"}' "200" "Personalization Insights"
test_endpoint "GET" "/ai/insights/realtime" "" "200" "Real-time Insights"

echo ""
echo "📊 Testing Analytics (Rate Limited)..."
echo "--------------------------------------"
test_endpoint "POST" "/analytics/performance" '{"test":"data"}' "200" "Analytics Performance"

# Check if analytics is properly rate limited
echo ""
echo "🔄 Testing Rate Limiting..."
echo "---------------------------"
response=$(curl -s -X POST -H "Content-Type: application/json" -H "Origin: https://dtdnwq4annvk2.cloudfront.net" -d '{"test":"data"}' "$BASE_URL/analytics/performance")
if echo "$response" | grep -q "rateLimited"; then
    echo -e "${GREEN}✓${NC} Analytics rate limiting is active"
else
    echo -e "${YELLOW}⚠${NC} Analytics rate limiting may not be working"
    ((WARNINGS++))
fi

echo ""
echo "=========================================="
echo "           TEST RESULTS"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo "Staging environment is fully operational."
    exit 0
elif [ $ERRORS -eq 0 ] && [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  TESTS PASSED WITH $WARNINGS WARNING(S)${NC}"
    echo "Staging environment is operational but review warnings."
    exit 0
else
    echo -e "${RED}❌ $ERRORS TEST(S) FAILED!${NC}"
    echo "Staging environment has issues. Check the failed endpoints above."
    exit 1
fi