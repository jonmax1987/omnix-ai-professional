# 🔒 STAGING ENVIRONMENT PROTECTION GUIDE

## CRITICAL: DO NOT MODIFY WITHOUT READING THIS DOCUMENT

Last Updated: 2025-09-08
Status: **PRODUCTION-READY STAGING ENVIRONMENT**

---

## 🚨 CRITICAL STAGING CONFIGURATION - DO NOT CHANGE

### Lambda Function: `omnix-ai-backend-staging`
- **File**: `/apps/backend/lambda-staging-simple.js`
- **Handler**: `lambda-staging-simple.handler`
- **Runtime**: Node.js 18.x
- **Status**: ✅ FULLY FUNCTIONAL - DO NOT REPLACE

### CloudFront Distribution: `E1HN3Y5MSQJFFC`
- **Domain**: https://dtdnwq4annvk2.cloudfront.net
- **S3 Bucket**: `omnix-ai-staging-frontend-minimal`
- **Status**: ✅ OPERATIONAL

### API Gateway: `4j4yb4b844`
- **Stage**: `/staging`
- **Endpoint**: https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging
- **Status**: ✅ ALL ENDPOINTS WORKING

---

## ✅ CRITICAL FIXES THAT MUST BE PRESERVED

### 1. **Performance Monitoring Fix** (CRITICAL - COST ISSUE)
**File**: `/apps/frontend/src/services/performance.ts`
```javascript
// Line 362-369: MUST REMAIN AS IS
if (process.env.NODE_ENV !== 'production' && this.analyticsEnabled) {
    // Rate limit: Only send analytics every 30 seconds max
    const now = Date.now();
    if (!this.lastAnalyticsSent || now - this.lastAnalyticsSent > 30000) {
        this.lastAnalyticsSent = now;
        this.sendToEndpoint(metric);
    }
}
```
**WHY**: Previously sending HUNDREDS of API calls per second, costing $$$

### 2. **Dashboard Refresh Interval** (CRITICAL - PERFORMANCE)
**File**: `/apps/frontend/src/components/organisms/LiveDashboardPerformanceMetrics.jsx`
```javascript
// Line 308: MUST BE 60000, NOT 5000
refreshInterval = 60000 // Reduced from 5s to 60s to prevent API spam
```
**WHY**: Was refreshing every 5 seconds causing Lambda overload

### 3. **Staging Lambda Endpoints** (CRITICAL - FUNCTIONALITY)
**File**: `/apps/backend/lambda-staging-simple.js`
**Required Endpoints** (ALL MUST EXIST):
- ✅ GET /staging/v1/health
- ✅ GET /staging/v1/dashboard/summary
- ✅ GET /staging/v1/products
- ✅ GET /staging/v1/orders
- ✅ GET /staging/v1/orders/statistics
- ✅ GET /staging/v1/alerts
- ✅ GET /staging/v1/recommendations/orders
- ✅ GET /staging/v1/customer/profile
- ✅ GET /staging/v1/customer/recommendations
- ✅ GET /staging/v1/ai/insights/consumption-predictions
- ✅ POST /staging/v1/ai/insights/personalization
- ✅ GET /staging/v1/ai/insights/realtime
- ✅ POST /staging/v1/auth/login
- ✅ POST /staging/v1/analytics/performance (RATE LIMITED)

### 4. **Authentication Credentials** (CRITICAL - ACCESS)
**Manager Account**:
- Email: `staging@omnix.ai`
- Password: `staging123`
- Role: `admin`

**Customer Account**:
- Email: `customer@staging.omnix.ai`
- Password: `customer123`
- Role: `customer`

### 5. **CORS Configuration** (CRITICAL - SECURITY)
```javascript
const ALLOWED_ORIGINS = [
    'https://dtdnwq4annvk2.cloudfront.net', // Staging CloudFront
    'https://d1vu6p9f5uc16.cloudfront.net', // Production
    'http://localhost:5173' // Local development
];
```

---

## 🛡️ DEPLOYMENT PROTECTION RULES

### BEFORE ANY STAGING DEPLOYMENT:

1. **NEVER** replace `lambda-staging-simple.js` with another Lambda file
2. **NEVER** change the Lambda handler from `lambda-staging-simple.handler`
3. **ALWAYS** test locally before deploying
4. **ALWAYS** backup current Lambda before updates:
   ```bash
   # Backup current Lambda
   aws lambda get-function --function-name omnix-ai-backend-staging \
     --query 'Code.Location' --output text | xargs curl -o lambda-staging-backup-$(date +%Y%m%d).zip
   ```

### SAFE DEPLOYMENT PROCESS:

**OPTION 1: Automated Safe Deployment (RECOMMENDED)**
```bash
# Navigate to backend directory
cd /home/jonmax1987/projects/omnix-ai-professional/apps/backend

# Use the automated safe deployment script
./staging-deploy-safe.sh
```

**OPTION 2: Version Control System**
```bash
# Navigate to backend directory
cd /home/jonmax1987/projects/omnix-ai-professional/apps/backend

# Deploy with full version control
./staging-version-control.sh deploy

# List all versions
./staging-version-control.sh list

# Rollback if needed
./staging-version-control.sh rollback v20250908_143022
```

**OPTION 3: Manual Deployment (NOT RECOMMENDED)**
```bash
# 1. Always work with the staging-specific Lambda
cd /home/jonmax1987/projects/omnix-ai-professional/apps/backend

# 2. Make changes to lambda-staging-simple.js (NOT lambda.js or any other file)
# 3. Test endpoints locally first
# 4. Package ONLY the staging Lambda
zip -r lambda-staging-update.zip lambda-staging-simple.js

# 5. Deploy with confidence
aws lambda update-function-code \
  --function-name omnix-ai-backend-staging \
  --zip-file fileb://lambda-staging-update.zip

# 6. Test all endpoints
curl https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1/health
```

---

## 🔄 VERSION CONTROL SYSTEM

The staging environment now includes a comprehensive version control system to track all deployments and enable easy rollback.

### Version Control Files:
- **Script**: `staging-version-control.sh` - Full version management
- **Deployment**: `staging-deploy-safe.sh` - Safe deployment with backup
- **Health Check**: `staging-health-check.sh` - Automated testing

### Version Control Commands:

**Create Backup:**
```bash
./staging-version-control.sh backup
```

**List All Versions:**
```bash
./staging-version-control.sh list
```

**Deploy with Version Control:**
```bash
./staging-version-control.sh deploy
```

**Rollback to Specific Version:**
```bash
./staging-version-control.sh rollback v20250908_143022
```

**Check Current Status:**
```bash
./staging-version-control.sh status
```

**Clean Up Old Versions (keep last 10):**
```bash
./staging-version-control.sh cleanup
```

### Version Storage:
- **Location**: `/apps/backend/lambda-versions/`
- **Format**: `v[TIMESTAMP].zip` (e.g., `v20250908_143022.zip`)
- **Log File**: `lambda-versions/versions.log`
- **Retention**: Automatically keeps last 10 versions

### Automatic Features:
- ✅ Creates backup before every deployment
- ✅ Validates Lambda file before deployment
- ✅ Tests endpoints after deployment
- ✅ Logs all deployment activities
- ✅ Provides easy rollback mechanism
- ✅ Maintains deployment history

---

## 🔍 STAGING HEALTH CHECK COMMANDS

### Quick Health Check:
```bash
# Test staging is alive
curl -s https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1/health | jq .

# Test manager login
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"staging@omnix.ai","password":"staging123"}' \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1/auth/login | jq .

# Test customer login
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"customer@staging.omnix.ai","password":"customer123"}' \
  https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1/auth/login | jq .
```

### Full Endpoint Test:
```bash
# Run this to verify all endpoints are working
for endpoint in health dashboard/summary products orders orders/statistics alerts \
  recommendations/orders customer/profile customer/recommendations \
  ai/insights/consumption-predictions ai/insights/realtime; do
  echo "Testing: $endpoint"
  curl -s -o /dev/null -w "%{http_code}\n" \
    "https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging/v1/$endpoint"
done
```

---

## ⚠️ COMMON MISTAKES TO AVOID

### ❌ DO NOT:
1. Deploy `lambda.js` or `omnix-api-complete.js` to staging
2. Use production credentials in staging
3. Remove rate limiting from analytics endpoint
4. Change refresh intervals back to 5 seconds
5. Delete any existing endpoints when adding new ones
6. Forget to test after deployment

### ✅ ALWAYS:
1. Use `lambda-staging-simple.js` for staging
2. Preserve all existing endpoints when adding new ones
3. Test both manager and customer logins after deployment
4. Keep staging data prefixed with `[STAGING]`
5. Maintain rate limiting on analytics
6. Document any new changes in this file

---

## 📋 STAGING ENVIRONMENT CHECKLIST

Before marking staging as "working", verify:

- [ ] Health endpoint returns 200 OK
- [ ] Manager login works (staging@omnix.ai)
- [ ] Customer login works (customer@staging.omnix.ai)
- [ ] Dashboard loads without errors
- [ ] No 404 errors in browser console
- [ ] Analytics rate limiting is active
- [ ] All AI insights endpoints respond
- [ ] CORS headers are correct
- [ ] Data shows [STAGING] prefix

---

## 🚨 EMERGENCY RECOVERY

If staging breaks, recover using:

```bash
# 1. Check Lambda function exists
aws lambda get-function --function-name omnix-ai-backend-staging

# 2. Check current handler
aws lambda get-function-configuration \
  --function-name omnix-ai-backend-staging \
  --query 'Handler' --output text

# 3. If wrong handler, fix it:
aws lambda update-function-configuration \
  --function-name omnix-ai-backend-staging \
  --handler lambda-staging-simple.handler

# 4. Redeploy the correct staging Lambda
cd /home/jonmax1987/projects/omnix-ai-professional/apps/backend
zip -r lambda-staging-fix.zip lambda-staging-simple.js
aws lambda update-function-code \
  --function-name omnix-ai-backend-staging \
  --zip-file fileb://lambda-staging-fix.zip
```

---

## 📝 CHANGE LOG

### 2025-09-08 - MAJOR FIXES IMPLEMENTED
- ✅ Fixed analytics spam (hundreds of calls/second → 1 call/30 seconds)
- ✅ Added missing endpoints (orders/statistics, alerts, recommendations)
- ✅ Added customer authentication and endpoints
- ✅ Added AI insights endpoints (consumption predictions, personalization)
- ✅ Fixed CORS configuration
- ✅ Implemented rate limiting
- ✅ Created this protection document

### 2025-09-08 - VERSION CONTROL SYSTEM ADDED
- ✅ Created `staging-deploy-safe.sh` for safe deployments with backup
- ✅ Created `staging-version-control.sh` for full version management
- ✅ Added automatic backup creation before deployments
- ✅ Implemented rollback functionality with version tracking
- ✅ Added deployment validation and testing
- ✅ Created version history logging system
- ✅ Automated cleanup of old versions (keeps last 10)
- ✅ Updated protection documentation with new procedures

---

## 🤝 AGENT INSTRUCTIONS

**To all Claude agents and future sessions:**

1. **READ THIS DOCUMENT FIRST** before any staging work
2. **NEVER** replace the staging Lambda without backup
3. **ALWAYS** test endpoints after deployment
4. **PRESERVE** all fixes listed in this document
5. **UPDATE** this document with any new changes

**Remember**: The staging environment is WORKING. Don't break it!

---

**Document Version**: 1.0.0
**Critical Files**: 
- `/apps/backend/lambda-staging-simple.js` (DO NOT DELETE)
- `/apps/frontend/src/services/performance.ts` (KEEP RATE LIMITING)
- This document (UPDATE WITH CHANGES)