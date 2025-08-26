#!/bin/bash
# 🧪 OMNIX AI - Unified Testing Script
# Professional test suite orchestration

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 OMNIX AI - Professional Test Suite${NC}"
echo -e "${BLUE}===================================${NC}"
echo -e "${YELLOW}Project Root: $PROJECT_ROOT${NC}"
echo ""

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run tests and track results
run_test_suite() {
    local name=$1
    local command=$2
    local directory=$3
    
    echo -e "${BLUE}🧪 Testing $name...${NC}"
    cd "$directory"
    
    if eval $command > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name tests passed${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ $name tests failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        # Run again to show output
        echo -e "${YELLOW}Error details for $name:${NC}"
        eval $command || true
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    cd "$PROJECT_ROOT"
}

echo -e "${BLUE}📋 Test Plan:${NC}"
echo -e "${YELLOW}1. 🎨 Frontend Tests (Unit + Integration)${NC}"
echo -e "${YELLOW}2. ⚙️ Backend Tests (Unit + Integration)${NC}"
echo -e "${YELLOW}3. 📦 Infrastructure Tests (CDK)${NC}"
echo -e "${YELLOW}4. 🔗 API Integration Tests${NC}"
echo -e "${YELLOW}5. 🎭 E2E Tests (Playwright)${NC}"
echo ""

# Frontend Tests
if [ -d "$PROJECT_ROOT/apps/frontend" ] && [ -f "$PROJECT_ROOT/apps/frontend/package.json" ]; then
    run_test_suite "Frontend" "npm run test -- --run" "$PROJECT_ROOT/apps/frontend"
else
    echo -e "${YELLOW}⚠️ Frontend tests not available${NC}"
fi

# Backend Tests  
if [ -d "$PROJECT_ROOT/apps/backend" ] && [ -f "$PROJECT_ROOT/apps/backend/package.json" ]; then
    run_test_suite "Backend" "npm run test" "$PROJECT_ROOT/apps/backend"
else
    echo -e "${YELLOW}⚠️ Backend tests not available${NC}"
fi

# Infrastructure Tests
if [ -d "$PROJECT_ROOT/infrastructure" ] && [ -f "$PROJECT_ROOT/infrastructure/package.json" ]; then
    run_test_suite "Infrastructure" "npm run test" "$PROJECT_ROOT/infrastructure"
else
    echo -e "${YELLOW}⚠️ Infrastructure tests not available${NC}"
fi

# API Integration Tests
if [ -f "$PROJECT_ROOT/test-system.js" ]; then
    echo -e "${BLUE}🔗 Running API Integration Tests...${NC}"
    cd "$PROJECT_ROOT"
    if node test-system.js > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API Integration tests passed${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ API Integration tests failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${YELLOW}Running API tests with output:${NC}"
        node test-system.js || true
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo -e "${YELLOW}⚠️ API Integration tests not available${NC}"
fi

# E2E Tests
if [ -d "$PROJECT_ROOT/apps/frontend/e2e" ]; then
    cd "$PROJECT_ROOT/apps/frontend"
    echo -e "${BLUE}🎭 Running E2E Tests...${NC}"
    if npx playwright test > /dev/null 2>&1; then
        echo -e "${GREEN}✅ E2E tests passed${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${YELLOW}E2E test details:${NC}"
        npx playwright test || true
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo -e "${YELLOW}⚠️ E2E tests not available${NC}"
fi

# Test Results Summary
echo ""
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo -e "${BLUE}======================${NC}"
echo -e "${GREEN}✅ Passed: $PASSED_TESTS${NC}"
echo -e "${RED}❌ Failed: $FAILED_TESTS${NC}"
echo -e "${BLUE}📊 Total: $TOTAL_TESTS${NC}"

if [ $TOTAL_TESTS -eq 0 ]; then
    echo -e "${YELLOW}⚠️ No tests were found to run${NC}"
    echo -e "${YELLOW}Make sure test scripts are configured in package.json files${NC}"
    exit 1
elif [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! The application is ready for deployment.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}💥 Some tests failed. Please review the errors above.${NC}"
    echo -e "${YELLOW}Fix the failing tests before deploying to production.${NC}"
    exit 1
fi