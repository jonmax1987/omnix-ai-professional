# OMNIX AI - Customer Analytics Development Context

## Core Principles
- AWS Serverless microservices with Node.js/Nest.js and AI-powered analytics.
- API-First using OpenAPI.
- Mobile First, Atomic Design, WCAG + ARIA.
- AI-driven customer insights and consumption prediction.

## Tech Stack
- Frontend: Next.js, Styled Components, Zustand/Context.
- Backend: Node.js + Nest.js Lambdas, DynamoDB, AWS Bedrock (Claude), API Gateway, SQS.
- AI Layer: AWS Bedrock for customer analysis, consumption prediction, and behavioral insights.

## Coding Rules
- Follow architecture + API-First.
- Use ES6+, React hooks.
- Clean, modular code.
- Accessibility mandatory.
- Update OpenAPI on API changes.
- Privacy-first approach for customer data.
- Document AI decisions in DECISIONS_LOG.md.

## AI Development Focus
- Customer consumption pattern prediction using AWS Bedrock
- Analyze purchase history to predict needs (e.g., "buys milk every 5 days")
- Socioeconomic profiling from shopping behavior
- Real-time personalization based on AI insights

## Quick Checklist
- Match architecture & coding style.
- Update API docs if needed.
- Accessibility included.
- Optimize performance.
- Document AI prompts and model decisions.
- Test AI predictions for accuracy.

---

## Task Management Instructions

Claude manages AI customer analytics development with professional workflow practices.

**Context Loading Protocol:**
- Primary context: CLAUDE.md (this file) + docs/CURRENT_SPRINT.md
- Module context: context/customer-ai/ files for AI-specific work
- Session context: context/sessions/ for handoff continuity
- Design reference: AI_CUSTOMER_ANALYTICS_SYSTEM_DESIGN.md

**Development Focus Areas:**
- Phase 1: ✅ Complete (Database, Customer Profiles, Basic ML)
- Phase 2: ✅ Complete (AWS Bedrock Integration, AI Analysis)
- Phase 3: ✅ Complete (Advanced Personalization, Performance)
- Phase 4: 🚀 Current (Scale & Advanced Features)

**AI Implementation Status:**
- Phase 1: ✅ Complete (Database, Customer Profiles, Basic ML)
- Phase 2: ✅ Complete (AWS Bedrock Integration, AI Analysis)
- Phase 3: ✅ Complete (Advanced Personalization, Performance)
- Phase 4: ✅ Complete (Customer Segmentation with AI insights)
- Phase 5: ✅ Complete (A/B Testing Framework + Real-time Streaming Analytics)

**Current Focus (Phase 6):**
1. 🚀 Business Intelligence Dashboards leveraging real-time data
2. Context-aware personalization engine based on streaming insights
3. Multi-region deployment architecture

**Session Management:**
- 45-60 minute focused sessions on single AI feature
- Update task_status.md and context files in real-time
- Document AI decisions in docs/DECISIONS_LOG.md
- End with handoff notes for next session
- Test AI accuracy before marking tasks complete

**Communication Protocol:**
- **Before Starting Work**: Present analysis and detailed plan using TodoWrite tool, get approval before implementation
- **During Work**: Provide clear, high-level step-by-step updates as changes are made, update todo status in real-time
- **After Completion**: Summarize all changes made, important decisions, and next steps

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

### Agent Integration Workflow

```
Development Flow:
1. Architecture Agent → Design feature architecture
2. Implementation Agent → Build feature following design
3. Code Review Agent → Review code quality and security
4. Security Agent → Validate privacy and compliance
5. Performance Agent → Optimize for speed and scale
6. Documentation Agent → Update docs and guides
7. Deployment Agent → Deploy to staging/production
8. Monitoring Agent → Set up monitoring and alerts
```

### Usage Examples

**Feature Development:**
- `/design customer-segmentation` → Architecture planning
- `/implement MGR-023` → Build live revenue updates  
- `/review` → Code quality validation
- `/deploy-staging` → Staging deployment
- `/monitoring-setup` → Production monitoring

**System Optimization:**
- `/ai-optimize` → Model performance tuning
- `/performance-audit` → Speed optimization
- `/security-audit` → Privacy compliance check
- `/ab-test claude-haiku-vs-sonnet` → A/B testing

**Maintenance Operations:**
- `/health-check` → System status assessment  
- `/docs-update` → Documentation refresh
- `/sla-report` → Performance compliance review

### Professional Standards

All agents follow OMNIX AI principles:
- **API-First Development**: OpenAPI specifications drive implementation
- **Mobile First**: Responsive design starts with mobile constraints  
- **Privacy by Design**: Customer data protection built into architecture
- **AI-Driven Insights**: AWS Bedrock integration for customer analytics
- **Accessibility Mandatory**: WCAG + ARIA compliance for all interfaces
- **Real-time Capabilities**: WebSocket-powered live updates

This agents system ensures consistent quality, security, and performance across the entire OMNIX AI platform while maintaining the dual-interface architecture for both managers and customers.

---

Always maintain context and respond accordingly.
