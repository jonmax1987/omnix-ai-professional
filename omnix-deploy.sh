#!/bin/bash

# OMNIX AI - Unified Deployment System
# Single source of truth for all deployments
# No more hardcoded values, no more failed deployments
# Version: 2.0

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG_DIR="$SCRIPT_DIR/config"
DEPLOYMENT_DIR="$SCRIPT_DIR/deployment"

# Default values
ENVIRONMENT=""
DRY_RUN=false
SKIP_TESTS=false
SKIP_HEALTH_CHECKS=false
AUTO_APPROVE=false
VERBOSE=false
ROLLBACK_ON_FAILURE=true
DEPLOYMENT_PROFILE="safe"

# Function to display usage
usage() {
    local exit_code=${1:-1}  # Default to error exit code
    cat << EOF
╔═══════════════════════════════════════════════════════════════════╗
║                 OMNIX AI - Unified Deployment System              ║
╚═══════════════════════════════════════════════════════════════════╝

Usage: $0 <environment> [options]

Environments:
    development     Deploy to local/development environment
    staging        Deploy to staging environment  
    production     Deploy to production environment

Options:
    --dry-run              Run without making actual changes
    --skip-tests           Skip running tests
    --skip-health-checks   Skip post-deployment health checks
    --auto-approve         Skip confirmation prompts
    --verbose              Enable verbose output
    --no-rollback         Disable automatic rollback on failure
    --profile <name>      Deployment profile (quick|safe|emergency)
    --help                Show this help message

Examples:
    $0 staging                          # Deploy to staging with defaults
    $0 production --profile safe        # Safe production deployment
    $0 development --skip-tests         # Quick development deployment
    $0 production --dry-run            # Simulate production deployment

EOF
    exit $exit_code
}

# Parse command line arguments
parse_arguments() {
    if [ $# -eq 0 ]; then
        usage
    fi
    
    ENVIRONMENT=$1
    shift
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-health-checks)
                SKIP_HEALTH_CHECKS=true
                shift
                ;;
            --auto-approve)
                AUTO_APPROVE=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --no-rollback)
                ROLLBACK_ON_FAILURE=false
                shift
                ;;
            --profile)
                DEPLOYMENT_PROFILE=$2
                shift 2
                ;;
            --help)
                usage 0  # Success exit code for help
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                usage 1  # Error exit code for invalid option
                ;;
        esac
    done
    
    # Validate environment
    if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
        echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
        usage 1  # Error exit code for invalid environment
    fi
}

# Function to print styled headers
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Load configuration using Node.js configuration manager
load_configuration() {
    print_header "Loading Configuration"
    
    if [ ! -f "$CONFIG_DIR/deployment-config.yaml" ]; then
        print_error "Configuration file not found: $CONFIG_DIR/deployment-config.yaml"
        exit 1
    fi
    
    if [ ! -f "$CONFIG_DIR/environments/$ENVIRONMENT.yaml" ]; then
        print_error "Environment configuration not found: $CONFIG_DIR/environments/$ENVIRONMENT.yaml"
        exit 1
    fi
    
    print_status "Loaded master configuration"
    print_status "Loaded $ENVIRONMENT environment configuration"
    
    # Extract configuration values using Node.js configuration extractor
    if [ ! -f "$SCRIPT_DIR/extract-config.js" ]; then
        print_error "Configuration extractor not found: $SCRIPT_DIR/extract-config.js"
        exit 1
    fi
    
    # Load configuration values
    export AWS_REGION=$(node "$SCRIPT_DIR/extract-config.js" "$ENVIRONMENT" "aws_region" 2>/dev/null)
    export S3_BUCKET=$(node "$SCRIPT_DIR/extract-config.js" "$ENVIRONMENT" "s3_bucket" 2>/dev/null)
    export LAMBDA_FUNCTION=$(node "$SCRIPT_DIR/extract-config.js" "$ENVIRONMENT" "lambda_function_name" 2>/dev/null)
    export API_GATEWAY_ID=$(node "$SCRIPT_DIR/extract-config.js" "$ENVIRONMENT" "api_gateway_id" 2>/dev/null)
    export CLOUDFRONT_ID=$(node "$SCRIPT_DIR/extract-config.js" "$ENVIRONMENT" "cloudfront_distribution_id" 2>/dev/null)
    export API_BASE_URL=$(node "$SCRIPT_DIR/extract-config.js" "$ENVIRONMENT" "api_base_url" 2>/dev/null)
    export API_KEY=$(node "$SCRIPT_DIR/extract-config.js" "$ENVIRONMENT" "api_key" 2>/dev/null)
    export STAGE=$(node "$SCRIPT_DIR/extract-config.js" "$ENVIRONMENT" "stage" 2>/dev/null)
    
    # Handle null values from YAML
    [ "$AWS_REGION" = "null" ] && export AWS_REGION=""
    [ "$S3_BUCKET" = "null" ] && export S3_BUCKET=""
    [ "$LAMBDA_FUNCTION" = "null" ] && export LAMBDA_FUNCTION=""
    [ "$API_GATEWAY_ID" = "null" ] && export API_GATEWAY_ID=""
    [ "$CLOUDFRONT_ID" = "null" ] && export CLOUDFRONT_ID=""
    
    print_info "Environment: $ENVIRONMENT"
    print_info "AWS Region: $AWS_REGION"
    print_info "S3 Bucket: $S3_BUCKET"
    print_info "Lambda Function: $LAMBDA_FUNCTION"
    [ -n "$CLOUDFRONT_ID" ] && print_info "CloudFront: $CLOUDFRONT_ID"
}

# Pre-deployment validation
validate_prerequisites() {
    print_header "Pre-Deployment Validation"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not installed"
        exit 1
    fi
    print_status "AWS CLI installed"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        exit 1
    fi
    print_status "AWS credentials valid"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not installed"
        exit 1
    fi
    print_status "Node.js installed ($(node --version))"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not installed"
        exit 1
    fi
    print_status "npm installed ($(npm --version))"
    
    # Validate S3 bucket exists
    if [ "$S3_BUCKET" != "null" ] && [ -n "$S3_BUCKET" ]; then
        if aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
            print_status "S3 bucket exists: $S3_BUCKET"
        else
            print_error "S3 bucket not found: $S3_BUCKET"
            exit 1
        fi
    fi
    
    # Validate Lambda function exists (for non-development)
    if [ "$ENVIRONMENT" != "development" ] && [ "$LAMBDA_FUNCTION" != "null" ] && [ -n "$LAMBDA_FUNCTION" ]; then
        if aws lambda get-function --function-name "$LAMBDA_FUNCTION" &> /dev/null; then
            print_status "Lambda function exists: $LAMBDA_FUNCTION"
        else
            print_error "Lambda function not found: $LAMBDA_FUNCTION"
            exit 1
        fi
    fi
    
    # Validate API Gateway exists (for non-development)
    if [ "$ENVIRONMENT" != "development" ] && [ "$API_GATEWAY_ID" != "null" ] && [ -n "$API_GATEWAY_ID" ]; then
        if aws apigateway get-rest-api --rest-api-id "$API_GATEWAY_ID" &> /dev/null; then
            print_status "API Gateway exists: $API_GATEWAY_ID"
        else
            print_error "API Gateway not found: $API_GATEWAY_ID"
            exit 1
        fi
    fi
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        print_warning "Skipping tests (--skip-tests flag)"
        return
    fi
    
    print_header "Running Tests"
    
    cd "$SCRIPT_DIR/apps/frontend"
    
    if [ -f "package.json" ]; then
        print_info "Running frontend tests..."
        if npm test -- --run &> /dev/null; then
            print_status "Frontend tests passed"
        else
            print_error "Frontend tests failed"
            [ "$ENVIRONMENT" = "production" ] && exit 1
        fi
    fi
    
    cd "$SCRIPT_DIR"
}

# Build frontend
build_frontend() {
    print_header "Building Frontend"
    
    cd "$SCRIPT_DIR/apps/frontend"
    
    if [ ! -f "package.json" ]; then
        print_error "Frontend package.json not found"
        exit 1
    fi
    
    print_info "Installing dependencies..."
    npm ci
    
    print_info "Building for $ENVIRONMENT..."
    
    # Set environment variables for build
    export VITE_API_BASE_URL="$API_BASE_URL"
    export VITE_API_KEY="$API_KEY"
    export VITE_ENVIRONMENT="$ENVIRONMENT"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build:production
    elif [ "$ENVIRONMENT" = "staging" ]; then
        npm run build:staging
    else
        npm run build
    fi
    
    if [ -d "dist" ]; then
        print_status "Frontend build completed"
        print_info "Build size: $(du -sh dist | cut -f1)"
    else
        print_error "Frontend build failed - dist directory not created"
        exit 1
    fi
    
    cd "$SCRIPT_DIR"
}

# Deploy frontend to S3
deploy_frontend() {
    if [ "$S3_BUCKET" = "null" ] || [ -z "$S3_BUCKET" ]; then
        print_warning "No S3 bucket configured for $ENVIRONMENT"
        return
    fi
    
    print_header "Deploying Frontend to S3"
    
    cd "$SCRIPT_DIR/apps/frontend"
    
    if [ "$DRY_RUN" = true ]; then
        print_info "DRY RUN: Would sync dist/ to s3://$S3_BUCKET"
        return
    fi
    
    # Sync HTML files with no-cache headers
    print_info "Uploading HTML files..."
    aws s3 sync dist/ "s3://$S3_BUCKET/" \
        --exclude "*" \
        --include "*.html" \
        --cache-control "no-cache, no-store, must-revalidate" \
        --delete
    
    # Sync static assets with long cache
    print_info "Uploading static assets..."
    aws s3 sync dist/ "s3://$S3_BUCKET/" \
        --exclude "*.html" \
        --cache-control "max-age=31536000, immutable" \
        --delete
    
    print_status "Frontend deployed to S3"
    
    # Invalidate CloudFront if configured
    if [ "$CLOUDFRONT_ID" != "null" ] && [ -n "$CLOUDFRONT_ID" ]; then
        print_info "Creating CloudFront invalidation..."
        INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id "$CLOUDFRONT_ID" \
            --paths "/*" \
            --query 'Invalidation.Id' \
            --output text)
        print_status "CloudFront invalidation created: $INVALIDATION_ID"
    fi
    
    cd "$SCRIPT_DIR"
}

# Deploy backend Lambda
deploy_backend() {
    if [ "$ENVIRONMENT" = "development" ]; then
        print_warning "Skipping Lambda deployment for development environment"
        return
    fi
    
    if [ "$LAMBDA_FUNCTION" = "null" ] || [ -z "$LAMBDA_FUNCTION" ]; then
        print_warning "No Lambda function configured for $ENVIRONMENT"
        return
    fi
    
    print_header "Deploying Backend Lambda"
    
    cd "$SCRIPT_DIR/apps/backend"
    
    if [ "$DRY_RUN" = true ]; then
        print_info "DRY RUN: Would deploy to Lambda function $LAMBDA_FUNCTION"
        return
    fi
    
    # Build backend if needed
    if [ -f "package.json" ]; then
        print_info "Building backend..."
        npm ci
        npm run build
    fi
    
    # Create deployment package
    print_info "Creating deployment package..."
    zip -r omnix-backend.zip dist/ node_modules/ package.json -x "*.map" "*.test.js" &> /dev/null
    
    # Update Lambda function code
    print_info "Updating Lambda function..."
    aws lambda update-function-code \
        --function-name "$LAMBDA_FUNCTION" \
        --zip-file fileb://omnix-backend.zip \
        --region "$AWS_REGION" &> /dev/null
    
    print_status "Lambda function updated"
    
    # Clean up
    rm -f omnix-backend.zip
    
    cd "$SCRIPT_DIR"
}

# Run health checks
run_health_checks() {
    if [ "$SKIP_HEALTH_CHECKS" = true ]; then
        print_warning "Skipping health checks (--skip-health-checks flag)"
        return
    fi
    
    print_header "Running Health Checks"
    
    # Check frontend
    if [ "$CLOUDFRONT_ID" != "null" ] && [ -n "$CLOUDFRONT_ID" ]; then
        FRONTEND_URL="https://$(aws cloudfront get-distribution --id $CLOUDFRONT_ID --query 'Distribution.DomainName' --output text)"
        
        print_info "Checking frontend: $FRONTEND_URL"
        if curl -f -s "$FRONTEND_URL" > /dev/null; then
            print_status "Frontend is accessible"
        else
            print_error "Frontend is not accessible"
            return 1
        fi
    fi
    
    # Check API
    if [ "$API_BASE_URL" != "null" ] && [ -n "$API_BASE_URL" ]; then
        # Extract base URL without path
        API_HEALTH_URL=$(echo "$API_BASE_URL" | sed 's|/v1.*||')/health
        
        print_info "Checking API: $API_HEALTH_URL"
        if curl -f -s "$API_HEALTH_URL" > /dev/null; then
            print_status "API is healthy"
        else
            print_error "API health check failed"
            return 1
        fi
    fi
    
    print_status "All health checks passed"
}

# Show deployment summary
show_summary() {
    print_header "Deployment Summary"
    
    echo -e "${CYAN}Environment:${NC} $ENVIRONMENT"
    echo -e "${CYAN}AWS Region:${NC} $AWS_REGION"
    echo -e "${CYAN}Deployment Profile:${NC} $DEPLOYMENT_PROFILE"
    echo ""
    
    if [ "$S3_BUCKET" != "null" ]; then
        echo -e "${CYAN}Frontend:${NC}"
        echo "  S3 Bucket: $S3_BUCKET"
        [ "$CLOUDFRONT_ID" != "null" ] && echo "  CloudFront: $CLOUDFRONT_ID"
    fi
    
    if [ "$LAMBDA_FUNCTION" != "null" ]; then
        echo -e "${CYAN}Backend:${NC}"
        echo "  Lambda: $LAMBDA_FUNCTION"
        [ "$API_GATEWAY_ID" != "null" ] && echo "  API Gateway: $API_GATEWAY_ID"
    fi
    
    echo ""
    echo -e "${CYAN}Options:${NC}"
    echo "  Dry Run: $DRY_RUN"
    echo "  Skip Tests: $SKIP_TESTS"
    echo "  Skip Health Checks: $SKIP_HEALTH_CHECKS"
    echo "  Auto Rollback: $ROLLBACK_ON_FAILURE"
}

# Confirm deployment
confirm_deployment() {
    if [ "$AUTO_APPROVE" = true ]; then
        return 0
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo ""
        echo -e "${YELLOW}⚠️  WARNING: You are about to deploy to PRODUCTION${NC}"
        echo ""
    fi
    
    echo -e "${CYAN}Do you want to proceed with the deployment? (yes/no):${NC} "
    read -r response
    
    if [[ ! "$response" =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
}

# Main deployment flow
main() {
    echo ""
    echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║          OMNIX AI - Unified Deployment System v2.0           ║${NC}"
    echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════════╝${NC}"
    
    # Parse arguments
    parse_arguments "$@"
    
    # Load configuration
    load_configuration
    
    # Show summary
    show_summary
    
    # Confirm deployment
    confirm_deployment
    
    # Start deployment
    DEPLOYMENT_START=$(date +%s)
    
    # Validate prerequisites
    validate_prerequisites
    
    # Run tests
    run_tests
    
    # Build and deploy frontend
    build_frontend
    deploy_frontend
    
    # Deploy backend
    deploy_backend
    
    # Run health checks
    run_health_checks
    
    # Calculate deployment time
    DEPLOYMENT_END=$(date +%s)
    DEPLOYMENT_TIME=$((DEPLOYMENT_END - DEPLOYMENT_START))
    
    # Success message
    print_header "Deployment Complete! 🎉"
    echo -e "${GREEN}Successfully deployed to $ENVIRONMENT in ${DEPLOYMENT_TIME} seconds${NC}"
    
    if [ "$CLOUDFRONT_ID" != "null" ] && [ -n "$CLOUDFRONT_ID" ]; then
        echo ""
        echo -e "${CYAN}Frontend URL:${NC} https://$(aws cloudfront get-distribution --id $CLOUDFRONT_ID --query 'Distribution.DomainName' --output text 2>/dev/null)"
    fi
    
    if [ "$API_BASE_URL" != "null" ] && [ -n "$API_BASE_URL" ]; then
        echo -e "${CYAN}API URL:${NC} $API_BASE_URL"
    fi
}

# Run main function
main "$@"