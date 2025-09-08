#!/bin/bash

# OMNIX AI Staging Lambda Version Control System
# Manages Lambda versions, creates backups, and enables easy rollback

set -e

# Configuration
FUNCTION_NAME="omnix-ai-backend-staging"
VERSIONS_DIR="lambda-versions"
VERSIONS_LOG="$VERSIONS_DIR/versions.log"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Ensure versions directory exists
mkdir -p "$VERSIONS_DIR"

# Initialize log file if it doesn't exist
if [ ! -f "$VERSIONS_LOG" ]; then
    echo "# OMNIX AI Staging Lambda Version Log" > "$VERSIONS_LOG"
    echo "# Format: TIMESTAMP|VERSION|STATUS|DESCRIPTION" >> "$VERSIONS_LOG"
fi

show_help() {
    echo "OMNIX AI Staging Lambda Version Control"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  backup          Create backup of current Lambda"
    echo "  list            List all available versions"
    echo "  deploy          Deploy lambda-staging-simple.js with version control"
    echo "  rollback [ID]   Rollback to specific version"
    echo "  status          Show current Lambda status"
    echo "  cleanup         Remove old backups (keep last 10)"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 deploy"
    echo "  $0 rollback v20250908_143022"
    echo "  $0 list"
}

create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local version_id="v${timestamp}"
    local backup_file="$VERSIONS_DIR/${version_id}.zip"
    
    echo -e "${BLUE}💾 Creating backup version: $version_id${NC}"
    
    # Get current Lambda configuration
    local config_file="$VERSIONS_DIR/${version_id}.config.json"
    aws lambda get-function-configuration --function-name "$FUNCTION_NAME" > "$config_file"
    
    # Get current Lambda code
    local download_url=$(aws lambda get-function --function-name "$FUNCTION_NAME" --query 'Code.Location' --output text)
    
    if [ "$download_url" != "null" ] && [ -n "$download_url" ]; then
        curl -s "$download_url" -o "$backup_file"
        
        # Log the version
        echo "${timestamp}|${version_id}|BACKUP|Automatic backup of Lambda function" >> "$VERSIONS_LOG"
        
        echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
        echo -e "${CYAN}📝 Version ID: $version_id${NC}"
        
        return 0
    else
        echo -e "${RED}❌ Failed to create backup${NC}"
        return 1
    fi
}

list_versions() {
    echo -e "${BLUE}📋 Available Lambda Versions${NC}"
    echo "=================================="
    
    if [ ! -f "$VERSIONS_LOG" ] || [ ! -s "$VERSIONS_LOG" ]; then
        echo -e "${YELLOW}No versions found${NC}"
        return
    fi
    
    # Skip header lines and show versions
    tail -n +3 "$VERSIONS_LOG" | while IFS='|' read -r timestamp version_id status description; do
        local backup_file="$VERSIONS_DIR/${version_id}.zip"
        local config_file="$VERSIONS_DIR/${version_id}.config.json"
        
        if [ -f "$backup_file" ]; then
            local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
            local readable_size=$(numfmt --to=iec "$file_size" 2>/dev/null || echo "${file_size} bytes")
            
            echo -e "${GREEN}✓${NC} $version_id"
            echo -e "   📅 Date: $(date -d "${timestamp:0:8} ${timestamp:9:2}:${timestamp:11:2}:${timestamp:13:2}" 2>/dev/null || echo "$timestamp")"
            echo -e "   📊 Status: $status"
            echo -e "   📝 Description: $description"
            echo -e "   💾 Size: $readable_size"
            echo ""
        else
            echo -e "${RED}✗${NC} $version_id (backup file missing)"
            echo ""
        fi
    done
}

deploy_with_version() {
    local lambda_file="lambda-staging-simple.js"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local version_id="v${timestamp}"
    local description="Deployment of $lambda_file"
    
    echo -e "${BLUE}🚀 Deploying with version control${NC}"
    echo "Version ID: $version_id"
    
    # Check if Lambda file exists
    if [ ! -f "$lambda_file" ]; then
        echo -e "${RED}❌ ERROR: $lambda_file not found${NC}"
        return 1
    fi
    
    # Create backup first
    echo -e "${YELLOW}Creating backup before deployment...${NC}"
    if ! create_backup; then
        echo -e "${YELLOW}⚠️  Warning: Backup creation failed, continuing with deployment${NC}"
    fi
    
    # Deploy the new version
    echo -e "${BLUE}Deploying new version...${NC}"
    
    local deploy_zip="lambda-deploy-${timestamp}.zip"
    zip -q "$deploy_zip" "$lambda_file"
    
    # Deploy to AWS Lambda
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://$deploy_zip"
    
    # Verify and fix handler if needed
    local current_handler=$(aws lambda get-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --query 'Handler' --output text)
    
    if [ "$current_handler" != "lambda-staging-simple.handler" ]; then
        echo -e "${YELLOW}Fixing handler configuration...${NC}"
        aws lambda update-function-configuration \
            --function-name "$FUNCTION_NAME" \
            --handler "lambda-staging-simple.handler"
    fi
    
    # Clean up deployment package
    rm "$deploy_zip"
    
    # Log the deployment
    echo "${timestamp}|${version_id}|DEPLOYED|$description" >> "$VERSIONS_LOG"
    
    echo -e "${GREEN}✅ Deployment completed${NC}"
    echo -e "${CYAN}Version ID: $version_id${NC}"
    
    # Test the deployment
    test_deployment
}

rollback_to_version() {
    local target_version="$1"
    
    if [ -z "$target_version" ]; then
        echo -e "${RED}❌ ERROR: Please specify a version ID${NC}"
        echo "Usage: $0 rollback [VERSION_ID]"
        echo ""
        echo "Available versions:"
        list_versions
        return 1
    fi
    
    local backup_file="$VERSIONS_DIR/${target_version}.zip"
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ ERROR: Version $target_version not found${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🔄 Rolling back to version: $target_version${NC}"
    
    # Create backup of current state before rollback
    echo -e "${BLUE}Creating safety backup...${NC}"
    create_backup
    
    # Deploy the rollback version
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://$backup_file"
    
    # Ensure handler is correct
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --handler "lambda-staging-simple.handler"
    
    # Log the rollback
    local timestamp=$(date +%Y%m%d_%H%M%S)
    echo "${timestamp}|rollback_to_${target_version}|ROLLBACK|Rolled back to version $target_version" >> "$VERSIONS_LOG"
    
    echo -e "${GREEN}✅ Rollback completed${NC}"
    
    # Test the rollback
    test_deployment
}

show_status() {
    echo -e "${BLUE}📊 Current Lambda Status${NC}"
    echo "=========================="
    
    # Get Lambda configuration
    local config=$(aws lambda get-function-configuration --function-name "$FUNCTION_NAME" 2>/dev/null || echo "ERROR")
    
    if [ "$config" = "ERROR" ]; then
        echo -e "${RED}❌ Cannot access Lambda function${NC}"
        return 1
    fi
    
    local handler=$(echo "$config" | jq -r '.Handler')
    local runtime=$(echo "$config" | jq -r '.Runtime')
    local last_modified=$(echo "$config" | jq -r '.LastModified')
    local code_size=$(echo "$config" | jq -r '.CodeSize')
    
    echo -e "${CYAN}Function Name:${NC} $FUNCTION_NAME"
    echo -e "${CYAN}Handler:${NC} $handler"
    echo -e "${CYAN}Runtime:${NC} $runtime"
    echo -e "${CYAN}Last Modified:${NC} $last_modified"
    echo -e "${CYAN}Code Size:${NC} $code_size bytes"
    
    # Check if staging is responding
    echo ""
    echo -e "${BLUE}🔍 Testing endpoint response...${NC}"
    
    local health_check=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1/health" || echo "000")
    
    if [ "$health_check" = "200" ]; then
        echo -e "${GREEN}✅ Staging endpoint is responding (HTTP 200)${NC}"
    else
        echo -e "${RED}❌ Staging endpoint issue (HTTP $health_check)${NC}"
    fi
    
    # Show latest versions
    echo ""
    echo -e "${BLUE}📋 Recent Versions (Last 5)${NC}"
    echo "----------------------------"
    if [ -f "$VERSIONS_LOG" ]; then
        tail -5 "$VERSIONS_LOG" | while IFS='|' read -r timestamp version_id status description; do
            if [[ ! "$version_id" =~ ^#.* ]] && [ -n "$version_id" ]; then
                echo -e "${CYAN}$version_id${NC} ($status) - $description"
            fi
        done
    else
        echo -e "${YELLOW}No version history found${NC}"
    fi
}

test_deployment() {
    echo -e "${BLUE}🧪 Testing deployment...${NC}"
    
    local base_url="https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1"
    local failed_tests=0
    
    # Quick health check
    local health_response=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/health")
    
    if [ "$health_response" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${RED}❌ Health check failed (HTTP $health_response)${NC}"
        ((failed_tests++))
    fi
    
    # Quick auth test
    local auth_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"staging@omnix.ai","password":"staging123"}' \
        -w "%{http_code}" \
        "$base_url/auth/login" | tail -c 3)
    
    if [ "$auth_response" = "200" ]; then
        echo -e "${GREEN}✅ Authentication test passed${NC}"
    else
        echo -e "${RED}❌ Authentication test failed${NC}"
        ((failed_tests++))
    fi
    
    if [ $failed_tests -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Some tests failed. Consider rollback if issues persist.${NC}"
    fi
}

cleanup_old_versions() {
    echo -e "${BLUE}🧹 Cleaning up old versions...${NC}"
    
    # Keep last 10 versions
    local keep_count=10
    
    if [ ! -f "$VERSIONS_LOG" ]; then
        echo -e "${YELLOW}No versions to clean up${NC}"
        return
    fi
    
    # Get list of versions to remove (older than last 10)
    local versions_to_remove=$(tail -n +3 "$VERSIONS_LOG" | head -n -"$keep_count" | cut -d'|' -f2)
    
    local removed_count=0
    for version_id in $versions_to_remove; do
        local backup_file="$VERSIONS_DIR/${version_id}.zip"
        local config_file="$VERSIONS_DIR/${version_id}.config.json"
        
        if [ -f "$backup_file" ]; then
            rm "$backup_file"
            echo -e "${YELLOW}Removed: $backup_file${NC}"
            ((removed_count++))
        fi
        
        if [ -f "$config_file" ]; then
            rm "$config_file"
        fi
    done
    
    echo -e "${GREEN}✅ Cleanup completed. Removed $removed_count old versions.${NC}"
    echo -e "${CYAN}Kept last $keep_count versions.${NC}"
}

# Main command processing
case "${1:-help}" in
    "backup")
        create_backup
        ;;
    "list")
        list_versions
        ;;
    "deploy")
        deploy_with_version
        ;;
    "rollback")
        rollback_to_version "$2"
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup_old_versions
        ;;
    "help"|*)
        show_help
        ;;
esac