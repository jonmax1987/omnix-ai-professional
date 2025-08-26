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
- **Data Source**: Mock data in Lambda function (`data-lambda.js`)
- **DynamoDB Tables**: 
  - `omnix-ai-dev-users`: 3 records (admin@omnix.ai, manager@omnix.ai, analyst@omnix.ai)
  - `omnix-ai-dev-inventory`: Empty (0 records)
  - `omnix-ai-dev-orders`: Empty (0 records)
  - `omnix-ai-dev-sessions`: Empty (0 records)

## API Compliance Status
- ✅ `/dashboard/summary` - Fully compliant with DashboardSummary schema
- ⚠️ `/products` - Missing required fields (quantity, minThreshold, supplier)
- ⚠️ `/orders` - Order schema was missing in original spec, fixed in omnix-api-updated.yaml

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
- ⚠️ **Issue**: Products/Orders endpoints need schema alignment with frontend expectations
- ⚠️ **TODO**: Connect Lambda to DynamoDB instead of using mock data
- ⚠️ **TODO**: Populate DynamoDB tables with realistic inventory and order data

## Key Configuration Files
- `vite.config.js` - Proxy configuration for API calls
- `src/services/httpClient.js` - Base URL configuration
- `src/store/dashboardStore.js` - Data transformation logic
- `.env.production` - Production API endpoint

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.