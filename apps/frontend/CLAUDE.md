# OMNIX AI — Project Overview
Dual-interface smart retail management system: Manager dashboards + Customer personalization.  
FE=React(Vite,TypeScript), Mobile First, Atomic Design, Styled Components, Framer Motion, Zustand, ES6+, Hooks, ARIA.  
BE=NestJS+Python(AI), AWS Lambda, DynamoDB, AWS Bedrock (Claude 3 Haiku & Sonnet).  
API First — spec=FRONTEND_INTEGRATION_GUIDE.md + omnix-api-updated.yaml (2,177 lines, includes WebSocket).  
Design System=atoms→molecules→organisms→pages→templates.  
Principles: Clean & performant code, AI-powered insights, reusable/testable components, accessibility, dual-role architecture.


**CRITICAL WORKFLOW**: 
1. **Master Plan**: All work based on tasks in `OMNIX_MASTER_PLAN.md` (267 tasks across 6 phases)  
2. **Context Preservation**: Every task completion updates `task_status.md` AND master plan status  
3. **Session Startup**: Always check master plan → identify next task → update to IN_PROGRESS  
4. **Sources of Truth**: OMNIX_MASTER_PLAN.md, task_status.md, FRONTEND_INTEGRATION_GUIDE.md, CLAUDE.md  
5. **Sequential Execution**: Work strictly task-by-task in order until all tasks are complete, ensuring no errors before moving forward


**Current Status**: Phase 4 (Real-Time Features) - 145/267 tasks complete (54.3%) - WEBSOCKET FOUNDATION COMPLETE! 🎉  
**Next Critical Task**: MGR-023 - Live manager revenue updates  
**Goal**: Production launch May 16, 2025

## Production URLs & Infrastructure
- **Frontend**: https://d1vu6p9f5uc16.cloudfront.net (CloudFront + S3)
- **Backend API**: https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod (API Gateway + Lambda)
- **WebSocket**: wss://5oo31khrrj.execute-api.eu-central-1.amazonaws.com/dev (AWS API Gateway WebSocket)
- **Local Dev**: http://localhost:5173 (frontend), http://localhost:3001 (backend)

## Current Data Status
- **Data Source**: Mock data in Lambda function (`omnix-api-minimal.js`) + DynamoDB populated
- **DynamoDB Tables**: 
  - `omnix-ai-dev-users`: 5 records ✅
  - `omnix-ai-dev-inventory`: 3 records ✅ (Bananas, Milk, Bread)
  - `omnix-ai-dev-orders`: 2 records ✅ (Test orders)
  - `omnix-ai-dev-sessions`: Empty (0 records)

## API Compliance Status
- ✅ `/health` - Health check endpoint operational ✅
- ✅ `/v1/health` - Health check endpoint operational ✅  
- ✅ `/v1/dashboard/summary` - Fully compliant with DashboardSummary schema ✅
- ✅ `/v1/products` - Now includes all required fields (quantity, minThreshold, supplier) ✅
- ✅ `/v1/orders` - Order schema implemented and working ✅
- ✅ `/v1/auth/login` - Authentication endpoint working ✅

# OMNIX AI — Story Overview

OMNIX AI transforms supermarket operations through dual-role AI intelligence:

## For Managers: Business Intelligence Platform
- Real-time revenue and customer analytics dashboards
- AI-powered inventory depletion forecasting (Claude Sonnet: 94% accuracy)
- Customer segmentation wheel with 8-segment behavioral analysis
- A/B testing for AI model performance optimization
- Predictive order recommendations with supplier integration

## For Customers: Personal Shopping Assistant
- AI-driven product recommendations based on purchase patterns
- Consumption prediction: "You usually buy milk every 7 days"
- Smart replenishment alerts and shopping list generation
- Personal analytics: spending patterns, health insights, savings optimization
- Meal planning integration with recipe suggestions

## Technical Innovation
- **Dual Interface Architecture**: Separate but integrated manager/customer experiences
- **Real-time Streaming**: WebSocket-powered live updates and notifications
- **AI Model A/B Testing**: Haiku vs Sonnet performance comparison
- **Mobile-First PWA**: Professional desktop power in mobile-optimized interface
- **Privacy-First Design**: Customer data anonymized in manager analytics

## Business Impact
- 40% faster decision making through visual AI insights
- 95% inventory prediction accuracy reducing waste
- 15-20% revenue optimization through demand forecasting
- Enhanced customer loyalty through personalized experiences

OMNIX AI is the "super-smart manager" that turns data into decisions and transforms both business operations and customer relationships.

## Recent Fixes & Known Issues
- ✅ **Fixed**: CORS configuration for production (specific origin instead of wildcard)
- ✅ **Fixed**: httpClient baseURL configuration (`/v1` instead of `/api/v1`)
- ✅ **Fixed**: Dashboard data transformation (API spec → frontend store format)
- ✅ **Fixed**: Products/Orders endpoints now fully schema-compliant ✅
- ✅ **Fixed**: Lambda functions deployed and operational ✅
- ✅ **Fixed**: DynamoDB tables populated with test data ✅
- ✅ **Fixed**: Full frontend-to-backend connectivity working ✅

## Key Configuration Files
- `vite.config.js` - Proxy configuration for API calls
- `src/services/httpClient.js` - Base URL configuration
- `src/store/dashboardStore.js` - Data transformation logic
- `.env.production` - Production API endpoint

---

## OMNIX AI Agents System

The OMNIX AI platform utilizes a specialized agents system to ensure professional development practices, code quality, and operational excellence across all aspects of the dual-interface system.

### Core Agents

#### 🚀 **Deployment Agent** (`/deploy`, `/deploy-staging`, `/deploy-prod`)
- **Specialty**: Multi-environment AWS deployments (CloudFront, Lambda, API Gateway)
- **Handles**: Staging/production deployments, health checks, rollback procedures
- **Integration**: CloudFormation stacks, WebSocket deployment, infrastructure updates

#### 📝 **Code Review & QA Agent** (`/review`, `/security-check`, `/accessibility`)
- **Specialty**: React/TypeScript, NestJS, AWS Lambda code quality
- **Focus**: Security vulnerabilities, WCAG compliance, API validation, AI implementation
- **Standards**: Mobile First, Atomic Design, OpenAPI compliance, privacy-first patterns

#### 🛠️ **Implementation Agent** (`/implement`, `/feature`, `/component`)
- **Specialty**: Full-stack feature development following OMNIX_MASTER_PLAN.md
- **Focus**: React hooks, NestJS services, AWS Bedrock integration, WebSocket features
- **Approach**: Task-driven development with comprehensive testing and documentation

#### 🏗️ **Architecture Agent** (`/architecture`, `/design`, `/scalability`)
- **Specialty**: AWS serverless microservices, dual-interface system design
- **Focus**: System scalability, API design patterns, performance optimization
- **Ensures**: Architectural consistency, best practices, scalability planning

### Specialized Agents

#### 🔒 **Security Agent** (`/security-audit`, `/privacy-check`, `/compliance`)
- **Specialty**: Customer data privacy, GDPR/CCPA compliance, authentication security
- **Focus**: Data anonymization for AI, JWT security, API protection, privacy-by-design
- **Monitoring**: Security vulnerabilities, data breach prevention, compliance validation

#### 🤖 **AI/ML Agent** (`/ai-optimize`, `/ab-test`, `/prompt-engineering`)
- **Specialty**: AWS Bedrock optimization, A/B testing, customer analytics enhancement
- **Focus**: Claude Haiku/Sonnet model selection, cost optimization, consumption prediction
- **Analytics**: Model performance comparison, prompt optimization, accuracy improvement

#### ⚡ **Performance Agent** (`/performance-audit`, `/optimize-lambda`, `/mobile-performance`)
- **Specialty**: Core Web Vitals, Lambda cold starts, WebSocket scaling, DynamoDB optimization
- **Focus**: Mobile-first performance, real-time optimization, caching strategies
- **Targets**: <2.5s LCP, <500ms API response, 10,000+ concurrent WebSocket connections

#### 📚 **Documentation Agent** (`/docs-update`, `/api-docs`, `/user-guide`)
- **Specialty**: OpenAPI specifications, architectural decisions, user guides
- **Focus**: Manager dashboard guides, customer app tutorials, developer documentation
- **Maintains**: Technical accuracy, up-to-date API docs, decision log (DECISIONS_LOG.md)

#### 📊 **Monitoring Agent** (`/monitoring-setup`, `/health-check`, `/sla-report`)
- **Specialty**: CloudWatch monitoring, business intelligence, SLA compliance
- **Focus**: Real-time performance tracking, cost optimization monitoring, anomaly detection
- **Dashboards**: System health, business KPIs, AI service performance

### Orchestrator Commands

```bash
# Analysis & Diagnosis
orchestrator diagnose <issue>          # Analyze issue and recommend agents
orchestrator status                    # System health check
orchestrator history                   # View execution history

# Automated Workflows
orchestrator fix <error>               # Auto-fix with appropriate agents
orchestrator workflow <name>           # Execute predefined workflows
orchestrator rollback                  # Emergency rollback procedure

# Interactive Mode
orchestrator interactive               # Start interactive session
```

### Common Workflows

#### Frontend Development
```bash
# Feature development workflow
orchestrator workflow feature-development

# Performance optimization
orchestrator workflow performance-optimization

# Bug fixes
orchestrator fix "React component not rendering"
```

#### Emergency Procedures
```bash
# Production issues
orchestrator fix "API endpoints returning 500"
orchestrator rollback --force

# Security incidents  
orchestrator workflow security-incident
```

### Professional Standards

All agents follow OMNIX AI principles:
- **API-First Development**: OpenAPI specifications drive implementation
- **Mobile First**: Responsive design starts with mobile constraints  
- **Privacy by Design**: Customer data protection built into architecture
- **AI-Driven Insights**: AWS Bedrock integration for customer analytics
- **Accessibility Mandatory**: WCAG + ARIA compliance for all interfaces
- **Real-time Capabilities**: WebSocket-powered live updates

This agents system ensures consistent quality, security, and performance across the entire OMNIX AI platform while maintaining the dual-interface architecture for both managers and customers.
