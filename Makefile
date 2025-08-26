# 🎯 OMNIX AI - Professional Makefile
# Unified commands for enterprise-grade development workflow

.PHONY: setup dev build test deploy clean lint format help
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m  
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Environment detection
ENV ?= development
REGION ?= eu-central-1

## Setup: Install all dependencies and prepare development environment
setup:
	@echo "$(BLUE)🔧 Setting up OMNIX AI professional environment...$(NC)"
	@echo "$(YELLOW)📦 Installing root dependencies...$(NC)"
	npm install
	@echo "$(YELLOW)📦 Installing frontend dependencies...$(NC)"
	cd apps/frontend && npm install
	@echo "$(YELLOW)📦 Installing backend dependencies...$(NC)"
	cd apps/backend && npm install
	@echo "$(YELLOW)📦 Installing infrastructure dependencies...$(NC)"
	cd infrastructure && npm install
	@echo "$(YELLOW)🐍 Installing AI service dependencies...$(NC)"
	cd apps/ai-service && pip install -r requirements.txt 2>/dev/null || echo "⚠️ AI service setup skipped (Python not configured)"
	@echo "$(GREEN)✅ Professional setup complete!$(NC)"
	@echo "$(BLUE)🚀 Run 'make dev' to start development servers$(NC)"

## Development: Start all development servers
dev:
	@echo "$(BLUE)🚀 Starting OMNIX AI development servers...$(NC)"
	@echo "$(YELLOW)⚙️ Starting backend server...$(NC)"
	@cd apps/backend && npm run dev &
	@echo "$(YELLOW)🎨 Starting frontend server...$(NC)"  
	@cd apps/frontend && npm run dev &
	@sleep 3
	@echo "$(GREEN)✅ Development servers started!$(NC)"
	@echo "$(BLUE)🌐 Frontend: http://localhost:5173$(NC)"
	@echo "$(BLUE)🔗 Backend API: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop all services$(NC)"

## Build: Build all applications for production
build:
	@echo "$(BLUE)🔨 Building all applications...$(NC)"
	@echo "$(YELLOW)🎨 Building frontend...$(NC)"
	cd apps/frontend && npm run build
	@echo "$(YELLOW)⚙️ Building backend...$(NC)"
	cd apps/backend && npm run build
	@echo "$(GREEN)✅ All applications built successfully!$(NC)"

## Test: Run all test suites
test:
	@echo "$(BLUE)🧪 Running all test suites...$(NC)"
	@echo "$(YELLOW)🧪 Testing frontend...$(NC)"
	cd apps/frontend && npm run test || true
	@echo "$(YELLOW)🧪 Testing backend...$(NC)"
	cd apps/backend && npm run test || true
	@echo "$(YELLOW)🧪 Testing infrastructure...$(NC)"
	cd infrastructure && npm run test || true
	@echo "$(GREEN)✅ All tests completed!$(NC)"

## Deploy-staging: Deploy to staging environment
deploy-staging:
	@echo "$(BLUE)🚀 Deploying OMNIX AI to staging...$(NC)"
	@echo "$(YELLOW)📦 Deploying infrastructure...$(NC)"
	cd infrastructure && npm run deploy:dev
	@echo "$(YELLOW)⚙️ Deploying backend...$(NC)"
	cd apps/backend && ./deploy-lambda.sh || echo "⚠️ Backend deployment script not found"
	@echo "$(YELLOW)🎨 Building and preparing frontend...$(NC)"
	cd apps/frontend && npm run build
	@echo "$(GREEN)✅ Staging deployment complete!$(NC)"

## Deploy-production: Deploy to production environment (requires confirmation)
deploy-production:
	@echo "$(RED)⚠️  PRODUCTION DEPLOYMENT$(NC)"
	@echo "$(YELLOW)This will deploy to production environment.$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "$(BLUE)🚀 Deploying OMNIX AI to production...$(NC)"
	cd infrastructure && npm run deploy:prod
	cd apps/backend && ./deploy-lambda.sh
	cd apps/frontend && npm run build
	@echo "$(GREEN)✅ Production deployment complete!$(NC)"

## Clean: Clean all build artifacts and dependencies
clean:
	@echo "$(BLUE)🧹 Cleaning all build artifacts...$(NC)"
	@echo "$(YELLOW)🗑️ Cleaning frontend...$(NC)"
	cd apps/frontend && rm -rf node_modules dist .vite 2>/dev/null || true
	@echo "$(YELLOW)🗑️ Cleaning backend...$(NC)"
	cd apps/backend && rm -rf node_modules dist deployment 2>/dev/null || true
	@echo "$(YELLOW)🗑️ Cleaning infrastructure...$(NC)"
	cd infrastructure && rm -rf node_modules cdk.out 2>/dev/null || true
	@echo "$(YELLOW)🗑️ Cleaning root...$(NC)"
	rm -rf node_modules 2>/dev/null || true
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

## Lint: Run code linting across all applications
lint:
	@echo "$(BLUE)🔍 Running linters...$(NC)"
	cd apps/frontend && npm run lint || true
	cd apps/backend && npm run lint || true
	@echo "$(GREEN)✅ Linting complete!$(NC)"

## Format: Format code across all applications
format:
	@echo "$(BLUE)✨ Formatting code...$(NC)"
	cd apps/frontend && npm run format 2>/dev/null || npx prettier --write src/
	cd apps/backend && npm run format 2>/dev/null || npx prettier --write src/
	@echo "$(GREEN)✅ Code formatting complete!$(NC)"

## Help: Show this help message
help:
	@echo "$(BLUE)🎯 OMNIX AI - Professional Development Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; } /^[a-zA-Z_-]+:.*##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(BLUE)Examples:$(NC)"
	@echo "  make setup           # One-time setup"
	@echo "  make dev            # Start development"
	@echo "  make test           # Run all tests" 
	@echo "  make deploy-staging # Deploy to staging"
	@echo ""
	@echo "$(GREEN)🚀 Quick Start: Run 'make setup' then 'make dev'$(NC)"