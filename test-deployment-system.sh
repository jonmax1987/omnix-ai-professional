#!/bin/bash

# OMNIX AI - Deployment System Validation Test
# Tests all components of the new deployment system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              OMNIX AI - Deployment System Test               ║"
echo "║                      Validation Suite                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

TEST_RESULTS=()
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_success="$3"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    echo "Command: $test_command"
    
    if eval "$test_command" &>/dev/null; then
        if [ "$expected_success" = "true" ]; then
            echo -e "  ${GREEN}✅ PASSED${NC}"
            TEST_RESULTS+=("PASS: $test_name")
            ((PASSED_TESTS++))
        else
            echo -e "  ${RED}❌ FAILED (Expected to fail but passed)${NC}"
            TEST_RESULTS+=("FAIL: $test_name - Expected failure but passed")
            ((FAILED_TESTS++))
        fi
    else
        if [ "$expected_success" = "false" ]; then
            echo -e "  ${GREEN}✅ PASSED (Expected failure)${NC}"
            TEST_RESULTS+=("PASS: $test_name - Failed as expected")
            ((PASSED_TESTS++))
        else
            echo -e "  ${RED}❌ FAILED${NC}"
            TEST_RESULTS+=("FAIL: $test_name")
            ((FAILED_TESTS++))
        fi
    fi
    echo ""
}

# Function to validate file exists
validate_file() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$file_path" ]; then
        echo -e "  ${GREEN}✅ $description exists${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $description missing: $file_path${NC}"
        return 1
    fi
}

# Function to validate directory exists
validate_directory() {
    local dir_path="$1"
    local description="$2"
    
    if [ -d "$dir_path" ]; then
        echo -e "  ${GREEN}✅ $description exists${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $description missing: $dir_path${NC}"
        return 1
    fi
}

echo -e "${YELLOW}Phase 1: File Structure Validation${NC}"
echo "═══════════════════════════════════════════"
echo ""

# Test configuration files
echo "📋 Configuration System:"
validate_file "config/deployment-config.yaml" "Master deployment configuration"
validate_file "config/environments/development.yaml" "Development environment config"
validate_file "config/environments/staging.yaml" "Staging environment config"
validate_file "config/environments/production.yaml" "Production environment config"
echo ""

# Test deployment system files
echo "🚀 Deployment System:"
validate_file "deployment/lib/ConfigurationManager.js" "Configuration Manager"
validate_file "deployment/lib/ConfigurationValidator.js" "Configuration Validator"
validate_file "deployment/lib/StateManager.js" "State Manager"
validate_file "deployment/lib/RollbackManager.js" "Rollback Manager"
validate_file "deployment/lib/SmartDeploymentAgent.js" "Smart Deployment Agent"
validate_file "deployment/lib/HealthChecker.js" "Health Checker"
validate_file "omnix-deploy.sh" "Unified deployment script"
echo ""

# Test orchestrator commands
echo "🎭 Orchestrator Commands:"
validate_file "orchestrator/commands/deploy.js" "Deploy command"
validate_file "orchestrator/commands/rollback.js" "Rollback command"
validate_directory "deployment/commands" "Deployment commands directory"
echo ""

# Test directories
echo "📁 Directory Structure:"
validate_directory "config" "Configuration directory"
validate_directory "config/environments" "Environment configs directory"
validate_directory "deployment" "Deployment directory"
validate_directory "deployment/lib" "Deployment libraries"
validate_directory "orchestrator" "Orchestrator directory"
validate_directory "orchestrator/commands" "Orchestrator commands"
echo ""

echo -e "${YELLOW}Phase 2: Configuration Validation${NC}"
echo "═════════════════════════════════════════"
echo ""

# Test YAML syntax validation
run_test "Master config YAML syntax" "python3 -c \"import yaml; yaml.safe_load(open('config/deployment-config.yaml'))\"" "true"
run_test "Development config YAML syntax" "python3 -c \"import yaml; yaml.safe_load(open('config/environments/development.yaml'))\"" "true"
run_test "Staging config YAML syntax" "python3 -c \"import yaml; yaml.safe_load(open('config/environments/staging.yaml'))\"" "true"
run_test "Production config YAML syntax" "python3 -c \"import yaml; yaml.safe_load(open('config/environments/production.yaml'))\"" "true"

echo -e "${YELLOW}Phase 3: Script Validation${NC}"
echo "═════════════════════════════════════════"
echo ""

# Test script syntax
run_test "Unified deployment script syntax" "bash -n omnix-deploy.sh" "true"
run_test "Deployment script permissions" "test -x omnix-deploy.sh" "true"

# Test script help functionality
run_test "Deployment script help" "./omnix-deploy.sh --help" "true"

# Test invalid environment handling
run_test "Invalid environment rejection" "./omnix-deploy.sh invalid-env --dry-run" "false"

echo -e "${YELLOW}Phase 4: Node.js Module Validation${NC}"
echo "═════════════════════════════════════════"
echo ""

# Check Node.js syntax for modules
run_test "ConfigurationManager syntax" "node -c deployment/lib/ConfigurationManager.js" "true"
run_test "ConfigurationValidator syntax" "node -c deployment/lib/ConfigurationValidator.js" "true"
run_test "StateManager syntax" "node -c deployment/lib/StateManager.js" "true"
run_test "RollbackManager syntax" "node -c deployment/lib/RollbackManager.js" "true"
run_test "SmartDeploymentAgent syntax" "node -c deployment/lib/SmartDeploymentAgent.js" "true"
run_test "HealthChecker syntax" "node -c deployment/lib/HealthChecker.js" "true"
run_test "Deploy command syntax" "node -c orchestrator/commands/deploy.js" "true"
run_test "Rollback command syntax" "node -c orchestrator/commands/rollback.js" "true"

echo -e "${YELLOW}Phase 5: Integration Testing${NC}"
echo "═══════════════════════════════════════=="
echo ""

# Create test script for configuration loading
cat > test-config-load.js << 'EOF'
const { ConfigurationManager } = require('./deployment/lib/ConfigurationManager');

async function testConfigLoad() {
  const configManager = new ConfigurationManager();
  
  try {
    const config = await configManager.loadConfiguration('development');
    console.log('Config loaded successfully');
    
    if (!config.environment) {
      throw new Error('Environment not set in config');
    }
    
    if (!config.aws_region) {
      throw new Error('AWS region not set in config');
    }
    
    console.log(`Environment: ${config.environment}`);
    console.log(`AWS Region: ${config.aws_region}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Config load failed:', error.message);
    process.exit(1);
  }
}

testConfigLoad();
EOF

run_test "Configuration loading integration" "node test-config-load.js" "true"
rm -f test-config-load.js

# Test deployment script dry run
run_test "Development dry-run deployment" "./omnix-deploy.sh development --dry-run --skip-tests --auto-approve" "true"

echo -e "${YELLOW}Phase 6: System Requirements Check${NC}"
echo "════════════════════════════════════════════"
echo ""

# Check required tools
run_test "Node.js available" "command -v node" "true"
run_test "npm available" "command -v npm" "true"
run_test "AWS CLI available" "command -v aws" "true"
run_test "Python3 available" "command -v python3" "true"
run_test "YAML module available" "python3 -c 'import yaml'" "true"

# Check Node.js version
run_test "Node.js version >= 18" "node -e 'process.exit(parseInt(process.version.substring(1)) >= 18 ? 0 : 1)'" "true"

echo -e "${YELLOW}Phase 7: Documentation Validation${NC}"
echo "════════════════════════════════════════════"
echo ""

# Check if documentation exists
validate_file "DEPLOYMENT_IMPROVEMENT_TASKS.md" "Deployment tasks documentation"

# Test that task file has proper structure
run_test "Tasks file has proper structure" "grep -q '## 🔧 Implementation Tasks' DEPLOYMENT_IMPROVEMENT_TASKS.md" "true"
run_test "Tasks file has phases" "grep -q 'Phase 1:' DEPLOYMENT_IMPROVEMENT_TASKS.md" "true"

echo ""
echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════════╗"
echo "║                        TEST SUMMARY                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Print test summary
TOTAL_TESTS=$((PASSED_TESTS + FAILED_TESTS))
SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo -e "${CYAN}Total Tests:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Passed:${NC} $PASSED_TESTS"
echo -e "${RED}Failed:${NC} $FAILED_TESTS"
echo -e "${BLUE}Success Rate:${NC} $SUCCESS_RATE%"
echo ""

# Print individual results
echo -e "${CYAN}Test Results:${NC}"
for result in "${TEST_RESULTS[@]}"; do
    if [[ $result == PASS:* ]]; then
        echo -e "  ${GREEN}✅ ${result#PASS: }${NC}"
    else
        echo -e "  ${RED}❌ ${result#FAIL: }${NC}"
    fi
done
echo ""

# Overall status
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}The new deployment system is ready for use.${NC}"
    echo ""
    
    echo -e "${CYAN}Next Steps:${NC}"
    echo "1. Test with actual AWS resources"
    echo "2. Run deployment in development environment"
    echo "3. Migrate existing deployments to new system"
    echo "4. Train team on new deployment commands"
    echo ""
    
    echo -e "${CYAN}Available Commands:${NC}"
    echo "./omnix-deploy.sh development --dry-run    # Test development deployment"
    echo "./omnix-deploy.sh staging                  # Deploy to staging"
    echo "orchestrator deploy production --profile safe    # Production deployment"
    echo "orchestrator rollback staging             # Emergency rollback"
    
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED!${NC}"
    echo -e "${YELLOW}Please fix the failing tests before using the deployment system.${NC}"
    exit 1
fi