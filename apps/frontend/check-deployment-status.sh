#!/bin/bash

# OMNIX AI - Deployment Status Checker
# Run this script to check the health and status of your deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# URLs
FRONTEND_URL="https://d1vu6p9f5uc16.cloudfront.net"
API_URL="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    OMNIX AI DEPLOYMENT STATUS               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🚀 Checking deployment status...${NC}"
echo ""

# Function to check HTTP status
check_status() {
    local url=$1
    local name=$2
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$url")
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ $name: ${NC}HTTP $status_code ${GREEN}(${response_time}s)${NC}"
        return 0
    elif [ "$status_code" = "000" ]; then
        echo -e "${RED}❌ $name: ${NC}Connection timeout/failed"
        return 1
    else
        echo -e "${YELLOW}⚠️  $name: ${NC}HTTP $status_code ${YELLOW}(${response_time}s)${NC}"
        return 1
    fi
}

# Function to get cache info
get_cache_info() {
    local url=$1
    local cache_status=$(curl -s -I "$url" | grep -i "x-cache" | cut -d' ' -f2- | tr -d '\r')
    local last_modified=$(curl -s -I "$url" | grep -i "last-modified" | cut -d' ' -f2- | tr -d '\r')
    echo "Cache: $cache_status | Modified: $last_modified"
}

# 1. Frontend Health Check
echo -e "${PURPLE}🌐 FRONTEND STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_status "$FRONTEND_URL/" "Main App"
check_status "$FRONTEND_URL/products" "Products Page"
check_status "$FRONTEND_URL/dashboard" "Dashboard Page"

# Get current JavaScript bundle info
echo ""
echo -e "${CYAN}📦 JavaScript Bundles:${NC}"
current_bundles=$(curl -s "$FRONTEND_URL/" | grep -o 'assets/js/index-[^"]*\.js' | head -2)
if [ ! -z "$current_bundles" ]; then
    echo "$current_bundles" | while read bundle; do
        bundle_status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/$bundle")
        if [ "$bundle_status" = "200" ]; then
            echo -e "${GREEN}✅${NC} $bundle"
        else
            echo -e "${RED}❌${NC} $bundle (HTTP $bundle_status)"
        fi
    done
else
    echo -e "${RED}❌ Could not find JavaScript bundles${NC}"
fi

echo ""
echo -e "${CYAN}🔄 CloudFront Cache Info:${NC}"
cache_info=$(get_cache_info "$FRONTEND_URL/")
echo "$cache_info"

echo ""

# 2. API Backend Health Check  
echo -e "${PURPLE}🔧 API BACKEND STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_status "$API_URL/dashboard/summary" "Dashboard API"
check_status "$API_URL/products" "Products API"
check_status "$API_URL/auth/login" "Auth API"

echo ""

# 3. Specific Health Checks
echo -e "${PURPLE}🧪 DETAILED HEALTH TESTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test CORS headers
echo -e "${CYAN}🔒 CORS Check:${NC}"
cors_test=$(curl -s -I -H "Origin: https://d1vu6p9f5uc16.cloudfront.net" "$API_URL/dashboard/summary" | grep -i "access-control-allow-origin" | cut -d' ' -f2- | tr -d '\r')
if [ ! -z "$cors_test" ]; then
    echo -e "${GREEN}✅ CORS enabled:${NC} $cors_test"
else
    echo -e "${YELLOW}⚠️  CORS headers not found${NC}"
fi

# Test API response size
echo -e "${CYAN}📊 API Response Test:${NC}"
api_response=$(curl -s "$API_URL/dashboard/summary")
if [ ! -z "$api_response" ]; then
    response_size=$(echo "$api_response" | wc -c)
    echo -e "${GREEN}✅ Dashboard API responding${NC} (${response_size} bytes)"
    
    # Check if response contains expected fields
    if echo "$api_response" | grep -q "revenue\|customers\|products"; then
        echo -e "${GREEN}✅ API data structure valid${NC}"
    else
        echo -e "${YELLOW}⚠️  API response structure may be incomplete${NC}"
    fi
else
    echo -e "${RED}❌ Dashboard API not responding${NC}"
fi

echo ""

# 4. Performance Metrics
echo -e "${PURPLE}⚡ PERFORMANCE METRICS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend load time
frontend_time=$(curl -s -o /dev/null -w "%{time_total}" "$FRONTEND_URL/")
echo -e "${CYAN}🏠 Frontend load time:${NC} ${frontend_time}s"

# API response time  
api_time=$(curl -s -o /dev/null -w "%{time_total}" "$API_URL/dashboard/summary")
echo -e "${CYAN}🔧 API response time:${NC} ${api_time}s"

# DNS resolution time
dns_time=$(curl -s -o /dev/null -w "%{time_namelookup}" "$FRONTEND_URL/")
echo -e "${CYAN}🌐 DNS resolution time:${NC} ${dns_time}s"

echo ""

# 5. Deployment Info
echo -e "${PURPLE}📋 DEPLOYMENT INFORMATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get last modified time
last_modified=$(curl -s -I "$FRONTEND_URL/" | grep -i "last-modified" | cut -d' ' -f2- | tr -d '\r')
echo -e "${CYAN}📅 Last deployment:${NC} $last_modified"

# Get ETag for version tracking
etag=$(curl -s -I "$FRONTEND_URL/" | grep -i "etag" | cut -d' ' -f2 | tr -d '\r"')
echo -e "${CYAN}🏷️  Version ETag:${NC} $etag"

# CloudFront edge location
cf_pop=$(curl -s -I "$FRONTEND_URL/" | grep -i "x-amz-cf-pop" | cut -d' ' -f2 | tr -d '\r')
echo -e "${CYAN}🌍 Edge location:${NC} $cf_pop"

echo ""

# 6. Summary
echo -e "${PURPLE}📊 DEPLOYMENT SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count successful checks
total_checks=6
passed_checks=0

# Check each service
services=("$FRONTEND_URL/" "$FRONTEND_URL/products" "$FRONTEND_URL/dashboard" "$API_URL/dashboard/summary" "$API_URL/products" "$API_URL/auth/login")
for service in "${services[@]}"; do
    if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$service" | grep -q "200"; then
        ((passed_checks++))
    fi
done

if [ $passed_checks -eq ${#services[@]} ]; then
    echo -e "${GREEN}🎉 ALL SYSTEMS OPERATIONAL${NC}"
    echo -e "${GREEN}✅ All $passed_checks/${#services[@]} services are healthy${NC}"
elif [ $passed_checks -gt $((${#services[@]} / 2)) ]; then
    echo -e "${YELLOW}⚠️  PARTIALLY OPERATIONAL${NC}"
    echo -e "${YELLOW}⚠️  $passed_checks/${#services[@]} services are healthy${NC}"
else
    echo -e "${RED}🚨 SYSTEM ISSUES DETECTED${NC}"
    echo -e "${RED}❌ Only $passed_checks/${#services[@]} services are healthy${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Quick Links:${NC}"
echo -e "${CYAN}   Frontend:${NC} $FRONTEND_URL"
echo -e "${CYAN}   API:${NC} $API_URL"
echo -e "${CYAN}   Products:${NC} $FRONTEND_URL/products"
echo -e "${CYAN}   Dashboard:${NC} $FRONTEND_URL/dashboard"

echo ""
echo -e "${BLUE}⏰ Status check completed at: ${NC}$(date)"
echo ""