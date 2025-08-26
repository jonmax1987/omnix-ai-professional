# 🎯 OMNIX AI - Smart Inventory Management System

**Professional, enterprise-grade customer analytics platform with AI-powered insights.**

[![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue.svg)](https://typescriptlang.org/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-orange.svg)](https://aws.amazon.com/)

## 🚀 Quick Start

```bash
# Clone and setup (one-time only)
git clone <repository-url>
cd omnix-ai-professional
make setup

# Start development environment
make dev

# Deploy to staging
make deploy-staging
```

## 📁 Professional Project Structure

```
omnix-ai-professional/
├── 📁 apps/                    # Applications
│   ├── 🎨 frontend/           # React + TypeScript frontend
│   ├── ⚙️ backend/            # NestJS + Lambda backend
│   └── 🧠 ai-service/         # Python AI/ML service
├── 📦 infrastructure/         # AWS CDK infrastructure as code
├── 📚 packages/              # Shared packages and utilities
├── 🔧 scripts/               # Automation and deployment scripts
├── 📖 docs/                  # Comprehensive documentation
├── 🧪 tests/                 # Organized test suites
└── 🛠️ tools/                 # Development and CI/CD tools
```

## 🏗️ Architecture Overview

**Modern Serverless Architecture** with AI-powered analytics:

- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + AWS Lambda + API Gateway
- **Database**: DynamoDB with 14+ optimized tables
- **AI/ML**: AWS Bedrock (Claude) + Custom Python services
- **Real-time**: WebSocket + Kinesis Streams
- **Monitoring**: CloudWatch + Custom dashboards

## ✨ Key Features

### 🎯 **Core Functionality**
- **Smart Inventory Management** - Real-time stock tracking and optimization
- **Customer Analytics** - AI-driven behavioral analysis and predictions  
- **Order Management** - Complete order lifecycle management
- **Dashboard & Reporting** - Comprehensive business intelligence

### 🧠 **AI-Powered Insights**
- **Consumption Prediction** - Predict when customers will need products
- **Customer Segmentation** - Advanced behavioral profiling
- **Demand Forecasting** - ML-driven inventory planning
- **Personalized Recommendations** - Real-time product suggestions

### ⚡ **Technical Excellence**
- **Unified API Client** - Consistent BE/FE integration
- **Real-time Updates** - WebSocket-based live data
- **A/B Testing Framework** - Data-driven optimization
- **Streaming Analytics** - Real-time data processing

## 🔧 Development Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make setup` | Install all dependencies | One-time setup |
| `make dev` | Start development servers | Daily development |
| `make test` | Run all test suites | Before commits |
| `make build` | Build all applications | Pre-deployment |
| `make deploy-staging` | Deploy to staging | Feature testing |
| `make deploy-production` | Deploy to production | Releases |
| `make clean` | Clean build artifacts | Troubleshooting |

## 🔗 Quick Access

### 📚 **Documentation**
- [🏗️ System Architecture](docs/architecture/SYSTEM_DESIGN.md)
- [🚀 Deployment Guide](docs/deployment/)
- [💻 Development Setup](docs/development/)
- [📊 API Documentation](docs/api/)

### 🌐 **Development URLs**
- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **AI Service**: http://localhost:8000 (optional)

### 🔧 **Application Structure**
- **Frontend Code**: `apps/frontend/src/`
- **Backend Code**: `apps/backend/src/`
- **Infrastructure**: `infrastructure/lib/`
- **Shared Types**: `packages/shared-types/`

## 🎭 **What's New in Professional Structure**

### ✅ **Enterprise Benefits**
- **🏆 Professional Organization** - Industry-standard monorepo structure
- **⚡ Unified Workflow** - Single commands for all operations
- **📚 Centralized Documentation** - Everything in one place
- **🧪 Automated Testing** - Comprehensive test orchestration
- **🚀 One-Click Deployment** - Complete stack deployment

### ✅ **Developer Experience**
- **⏱️ 2-3 minute setup** (vs 15-30 minutes previously)
- **🎯 Single command development** - `make dev` starts everything
- **📖 Clear documentation** - No more hunting for information
- **🔧 Consistent environments** - Same setup across all machines
- **🤝 Better collaboration** - Standardized processes

### ✅ **Technical Improvements**
- **📦 Workspace management** - Efficient dependency handling
- **🔄 Automated workflows** - GitHub Actions integration
- **📊 Unified testing** - All tests run with one command
- **🏗️ Modular architecture** - Clean separation of concerns
- **📈 Easy scaling** - Simple to add new features/services

## 🛡️ **Quality Assurance**

### 🧪 **Testing Strategy**
- **Unit Tests** - Component and service level testing
- **Integration Tests** - API and database integration
- **E2E Tests** - Complete user workflow testing
- **Performance Tests** - Load and stress testing

### 📊 **Code Quality**
- **TypeScript** - Type safety across the stack
- **ESLint + Prettier** - Consistent code formatting
- **Automated CI/CD** - GitHub Actions workflows
- **Code Coverage** - Comprehensive test coverage

## 🚀 **Deployment Environments**

| Environment | Purpose | URL | Command |
|-------------|---------|-----|---------|
| **Development** | Local development | http://localhost:5173 | `make dev` |
| **Staging** | Feature testing | https://staging.omnix.ai | `make deploy-staging` |
| **Production** | Live system | https://omnix.ai | `make deploy-production` |

## 📈 **Performance & Scale**

### ⚡ **Performance Metrics**
- **Frontend**: Sub-second load times with code splitting
- **Backend**: <200ms API response times 
- **Database**: Optimized DynamoDB with proper indexing
- **AI Processing**: Real-time recommendations <500ms

### 📊 **Scalability**
- **Serverless Architecture** - Auto-scaling based on demand
- **CDN Distribution** - Global content delivery
- **Database Sharding** - Horizontal scaling capability
- **Microservices** - Independent service scaling

## 🤝 **Team Collaboration**

### 👥 **Development Teams**
- **Frontend Team**: Work in `apps/frontend/` with familiar React structure
- **Backend Team**: Work in `apps/backend/` with NestJS patterns
- **DevOps Team**: Manage `infrastructure/` with CDK
- **All Teams**: Use unified `make` commands for consistency

### 📋 **Workflow**
1. **Feature Development**: Use feature branches
2. **Testing**: Run `make test` before commits
3. **Deployment**: Use `make deploy-staging` for testing
4. **Production**: Use `make deploy-production` for releases

## 🔒 **Security & Compliance**

- **JWT Authentication** - Secure user sessions
- **API Rate Limiting** - DOS protection
- **Data Encryption** - At rest and in transit
- **RBAC Authorization** - Role-based access control
- **AWS IAM** - Principle of least privilege
- **GDPR Compliance** - Privacy-first data handling

## 📞 **Support & Maintenance**

### 🔧 **Development Support**
- **Setup Issues**: Check `docs/development/TROUBLESHOOTING.md`
- **API Questions**: See `docs/api/` documentation  
- **Deployment Problems**: Review `docs/deployment/` guides

### 📊 **Monitoring**
- **Application Logs**: CloudWatch Logs
- **Performance Metrics**: CloudWatch Metrics
- **Error Tracking**: Automated alerting
- **Health Checks**: Automated monitoring

## 🎉 **Getting Started**

### **For New Developers**
1. Run `make setup` - installs everything you need
2. Run `make dev` - starts the complete development environment
3. Open http://localhost:5173 - see the application running
4. Read `docs/development/` for detailed guides

### **For Existing Team Members**
- All your code is in the same places, just better organized
- Same React components in `apps/frontend/src/`
- Same NestJS services in `apps/backend/src/`
- Same CDK infrastructure (unchanged)
- **New**: Unified commands make everything easier!

---

## 🏆 **Professional Excellence**

This project represents **enterprise-grade development practices**:

✅ **Industry Standards** - Monorepo architecture used by major tech companies  
✅ **Developer Experience** - Optimized for productivity and collaboration  
✅ **Production Ready** - Scalable, secure, and maintainable  
✅ **Future Proof** - Easy to extend and maintain  

**Built with ❤️ by the OMNIX AI Team**