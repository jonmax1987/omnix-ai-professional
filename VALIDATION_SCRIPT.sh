#!/bin/bash
# 🧪 OMNIX AI Professional Structure Validation
# Comprehensive validation of the new professional structure

set -e

PROJECT_ROOT="/home/jonmax1987/projects/omnix-ai-professional"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 OMNIX AI - Professional Structure Validation${NC}"
echo -e "${BLUE}=============================================${NC}"
echo -e "${YELLOW}Validating: $PROJECT_ROOT${NC}"
echo ""

# Validation results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run validation check
run_check() {
    local name=$1
    local command=$2
    local directory=${3:-$PROJECT_ROOT}
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "🔍 $name... "
    cd "$directory"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${YELLOW}   Error: $command failed in $directory${NC}"
    fi
    
    cd "$PROJECT_ROOT"
}

# Function to check file exists
check_file() {
    local name=$1
    local file=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "📁 $name... "
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ EXISTS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ MISSING${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${YELLOW}   Missing: $file${NC}"
    fi
}

# Function to check directory exists
check_directory() {
    local name=$1
    local dir=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    echo -n "📂 $name... "
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ EXISTS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ MISSING${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${YELLOW}   Missing: $dir${NC}"
    fi
}

echo -e "${BLUE}📋 Structure Validation${NC}"
echo -e "${BLUE}=====================${NC}"

# Check main directories
check_directory "Apps directory" "$PROJECT_ROOT/apps"
check_directory "Frontend app" "$PROJECT_ROOT/apps/frontend"
check_directory "Backend app" "$PROJECT_ROOT/apps/backend"
check_directory "AI service" "$PROJECT_ROOT/apps/ai-service"
check_directory "Infrastructure" "$PROJECT_ROOT/infrastructure"
check_directory "Packages" "$PROJECT_ROOT/packages"
check_directory "Scripts" "$PROJECT_ROOT/scripts"
check_directory "Documentation" "$PROJECT_ROOT/docs"
check_directory "Tests" "$PROJECT_ROOT/tests"

echo ""
echo -e "${BLUE}📄 Essential Files${NC}"
echo -e "${BLUE}=================${NC}"

# Check essential files
check_file "Root package.json" "$PROJECT_ROOT/package.json"
check_file "Makefile" "$PROJECT_ROOT/Makefile"
check_file "Project README" "$PROJECT_ROOT/PROJECT_README.md"
check_file "Frontend package.json" "$PROJECT_ROOT/apps/frontend/package.json"
check_file "Backend package.json" "$PROJECT_ROOT/apps/backend/package.json"
check_file "Infrastructure CDK" "$PROJECT_ROOT/infrastructure/cdk.json"
check_file "Deployment script" "$PROJECT_ROOT/scripts/deployment/deploy-all.sh"
check_file "Development script" "$PROJECT_ROOT/scripts/development/start-dev.sh"
check_file "Testing script" "$PROJECT_ROOT/scripts/testing/run-all-tests.sh"

echo ""
echo -e "${BLUE}🔧 Functional Validation${NC}"
echo -e "${BLUE}========================${NC}"

# Check if setup works
run_check "Root setup" "npm install"

# Check frontend setup
run_check "Frontend setup" "npm install" "$PROJECT_ROOT/apps/frontend"

# Check backend setup  
run_check "Backend setup" "npm install" "$PROJECT_ROOT/apps/backend"

# Check infrastructure setup
run_check "Infrastructure setup" "npm install" "$PROJECT_ROOT/infrastructure"

# Check if build works
run_check "Frontend build" "npm run build" "$PROJECT_ROOT/apps/frontend"

# Check if backend compiles
run_check "Backend compile" "npm run build" "$PROJECT_ROOT/apps/backend"

# Check CDK synth
run_check "Infrastructure synth" "npm run synth" "$PROJECT_ROOT/infrastructure"

# Check Makefile commands
run_check "Make help" "make help"

echo ""
echo -e "${BLUE}📊 Application Content Validation${NC}"
echo -e "${BLUE}=================================${NC}"

# Check if key application files exist
check_file "Frontend src/main.jsx" "$PROJECT_ROOT/apps/frontend/src/main.jsx"
check_file "Frontend src/App.jsx" "$PROJECT_ROOT/apps/frontend/src/App.jsx"
check_file "Frontend unified API" "$PROJECT_ROOT/apps/frontend/src/services/unifiedAPIClient.js"
check_file "Backend src/main.ts" "$PROJECT_ROOT/apps/backend/src/main.ts"
check_file "Backend lambda.ts" "$PROJECT_ROOT/apps/backend/src/lambda.ts"
check_file "Backend auth service" "$PROJECT_ROOT/apps/backend/src/auth/auth.service.ts"
check_file "CDK core stack" "$PROJECT_ROOT/infrastructure/lib/stacks/core-stack.ts"
check_file "AI lambda function" "$PROJECT_ROOT/apps/ai-service/lambda_function.py"

echo ""
echo -e "${BLUE}🔍 Configuration Validation${NC}"
echo -e "${BLUE}===========================${NC}"

# Check if configurations are correct
if [ -f "$PROJECT_ROOT/package.json" ]; then
    if grep -q "workspaces" "$PROJECT_ROOT/package.json"; then
        echo -e "📦 Workspace configuration... ${GREEN}✅ CONFIGURED${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "📦 Workspace configuration... ${RED}❌ MISSING${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

# Check if scripts are executable
if [ -x "$PROJECT_ROOT/scripts/deployment/deploy-all.sh" ]; then
    echo -e "🔧 Executable scripts... ${GREEN}✅ EXECUTABLE${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "🔧 Executable scripts... ${RED}❌ NOT EXECUTABLE${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Final Results
echo ""
echo -e "${BLUE}📊 Validation Results${NC}"
echo -e "${BLUE}===================${NC}"
echo -e "${GREEN}✅ Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}❌ Failed: $FAILED_CHECKS${NC}"
echo -e "${BLUE}📊 Total: $TOTAL_CHECKS${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All validations passed!${NC}"
    echo -e "${GREEN}The professional structure is ready for use.${NC}"
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo -e "${YELLOW}1. cd /home/jonmax1987/projects/omnix-ai-professional${NC}"
    echo -e "${YELLOW}2. make dev${NC}"
    echo -e "${YELLOW}3. Open http://localhost:5173${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}💥 Some validations failed.${NC}"
    echo -e "${YELLOW}Please review the errors above and fix them.${NC}"
    exit 1
fi