# CORS Issue Analysis & Action Plan

## 🔍 Current Problem
Browser is still making **direct API calls** to `https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/auth/login` instead of using the CloudFront proxy path.

### Evidence:
- Request URL shows direct API Gateway URL
- Browser CORS error persists
- Request includes `x-api-key: omnix-api-key-development-2024`
- Referer shows correct frontend domain: `https://d1vu6p9f5uc16.cloudfront.net/`

## 🎯 Root Cause Analysis

### Issue 1: Frontend Configuration
The frontend is configured to use **direct API calls in production** instead of proxy path.

Current configuration in `httpClient.js`:
```javascript
baseURL: import.meta.env.DEV 
  ? '/api' // Development: Use Vite proxy
  : (import.meta.env.VITE_API_BASE_URL || 'https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev')
```

**Problem**: In production (`import.meta.env.DEV = false`), it uses the direct API URL.

### Issue 2: CloudFront Proxy Not Configured
We need to verify if CloudFront has the `/api/*` behavior properly set up for the correct distribution.

## 📋 Action Plan

### ✅ COMPLETED (Previous Work)
1. Backend provides CORS headers (`access-control-allow-origin: *`)
2. API key integration working
3. HTTPS deployment working
4. CloudFront invalidation working

### 🔥 IMMEDIATE ACTIONS NEEDED

#### 1. Research Current CORS Issue
- [IN PROGRESS] Analyze why browser is still making direct API calls
- Confirm frontend build configuration
- Check if VITE_API_BASE_URL is being set incorrectly in production

#### 2. Check Frontend Configuration
- Verify `httpClient.js` is using correct baseURL logic
- Check if environment variables are being set properly in build
- Confirm the app is actually using proxy path `/api`

#### 3. Verify CloudFront Proxy Configuration
- Check if E2MCXLNXS3ZTKY distribution has `/api/*` behavior
- Verify proxy target is correct API Gateway
- Test proxy routing manually

#### 4. Test API Calls Through Proxy
- Test: `curl https://d1vu6p9f5uc16.cloudfront.net/api/auth/login`
- Verify proxy forwards to: `https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/auth/login`
- Check if proxy adds/preserves headers

#### 5. Fix Frontend Configuration
- Update `httpClient.js` to ALWAYS use `/api` proxy path
- Remove direct API URL usage in production
- Update build script to not override proxy setting

#### 6. Deploy and Test Fix
- Build with proxy configuration
- Deploy to S3
- Invalidate CloudFront cache
- Test login from browser

## 🔧 Technical Solutions

### Solution 1: Force Proxy Usage (Recommended)
Update `httpClient.js`:
```javascript
const HTTP_CONFIG = {
  // ALWAYS use proxy path - both dev and production
  baseURL: '/api', // CloudFront will handle routing in production
  timeout: 30000
};
```

### Solution 2: CloudFront Behavior Setup
Ensure CloudFront distribution E2MCXLNXS3ZTKY has:
- Path pattern: `/api/*`
- Origin: API Gateway (18sz01wxsi.execute-api.eu-central-1.amazonaws.com)
- Origin path: `/dev`

### Solution 3: Environment Variable Fix
Ensure build doesn't override proxy setting:
```bash
# Don't set VITE_API_BASE_URL in build script
npm run build  # Use default proxy configuration
```

## 🚫 Actions to AVOID (Don't Repeat)

### ❌ Things We Already Tried (Don't Repeat)
1. ✅ Backend CORS headers - Already working
2. ✅ API key configuration - Already working  
3. ✅ HTTPS deployment - Already working
4. ✅ CloudFront invalidation - Already working
5. ✅ Direct API testing - Already confirmed working

### ❌ Wrong Solutions (Don't Use)
1. Don't try to fix backend CORS again
2. Don't create more CloudFront functions
3. Don't modify API Gateway settings
4. Don't use CORS browser extensions as permanent solution

## 📊 Success Criteria

### ✅ When Fixed, We Should See:
1. Browser requests to: `https://d1vu6p9f5uc16.cloudfront.net/api/auth/login`
2. No CORS errors in browser console
3. Successful login without browser extensions
4. Network tab shows proxy requests, not direct API calls

### 🧪 Test Commands
```bash
# Test proxy routing
curl https://d1vu6p9f5uc16.cloudfront.net/api/system/health

# Check CloudFront behavior
aws cloudfront get-distribution-config --id E2MCXLNXS3ZTKY --query 'DistributionConfig.CacheBehaviors'

# Test with browser-like headers
curl https://d1vu6p9f5uc16.cloudfront.net/api/auth/login \
  -H "Origin: https://d1vu6p9f5uc16.cloudfront.net" \
  -H "Content-Type: application/json" \
  -X POST -d '{"email":"test","password":"test"}'
```

## 📝 Next Steps Priority

1. **HIGH**: Fix frontend to use proxy path in production
2. **HIGH**: Verify/fix CloudFront proxy behavior  
3. **MEDIUM**: Test and deploy fix
4. **LOW**: Monitor and validate solution works

---
**Date**: August 24, 2025  
**Status**: In Progress  
**Goal**: Eliminate CORS errors by using CloudFront proxy instead of direct API calls