# CloudFront 403 Forbidden Fix Guide

## Problem
Frontend getting **403 Forbidden** when calling `/api/auth/login` through CloudFront distribution `d1vu6p9f5uc16.cloudfront.net`.

## Root Cause
CloudFront is not properly configured to forward the `x-api-key` header to the API Gateway backend.

## Immediate Fix (Recommended)

### 1. Update Frontend API Base URL
Change the frontend to call API Gateway directly instead of through CloudFront:

```typescript
// frontend/utils/api-client.ts or config
// Change from:
const API_BASE_URL = 'https://d1vu6p9f5uc16.cloudfront.net/api';

// To:
const API_BASE_URL = 'https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev';
```

### 2. Update Environment Variables
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev
NEXT_PUBLIC_API_KEY=omnix-api-key-development-2024
```

## Long-term Fix (CloudFront Configuration)

If you want to keep using CloudFront for API requests, update the distribution:

### Option A: AWS CLI Update
```bash
# Get current config
aws cloudfront get-distribution-config --id E2MCXLNXS3ZTKY > cloudfront-config.json

# Edit the JSON to add headers forwarding for /api/* behavior:
# Under CacheBehaviors -> Items[0] (PathPattern: "/api/*"):
{
  "ForwardedValues": {
    "QueryString": true,
    "Cookies": {
      "Forward": "none"
    },
    "Headers": {
      "Quantity": 4,
      "Items": [
        "Authorization",
        "x-api-key", 
        "Content-Type",
        "Origin"
      ]
    }
  }
}

# Update distribution
aws cloudfront update-distribution --id E2MCXLNXS3ZTKY --distribution-config file://cloudfront-config.json --if-match CURRENT_ETAG
```

### Option B: Infrastructure as Code Fix
Update your CDK/CloudFormation template:

```typescript
// In your CDK stack
const apiCacheBehavior = {
  pathPattern: '/api/*',
  origin: apiGatewayOrigin,
  viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
  cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
  cachePolicy: new cloudfront.CachePolicy(this, 'ApiCachePolicy', {
    headerBehavior: cloudfront.CacheHeaderBehavior.allowList([
      'Authorization',
      'x-api-key',
      'Content-Type', 
      'Origin'
    ]),
    queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
    cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    defaultTtl: Duration.seconds(0), // Don't cache API responses
    maxTtl: Duration.seconds(0),
  }),
};
```

## Testing the Fix

### 1. Test Direct API Gateway Call
```bash
curl -X POST https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: omnix-api-key-development-2024" \
  -d '{"email":"test@example.com","password":"testPassword"}'
```

### 2. Test Through CloudFront (after fix)
```bash
curl -X POST https://d1vu6p9f5uc16.cloudfront.net/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: omnix-api-key-development-2024" \
  -d '{"email":"test@example.com","password":"testPassword"}'
```

## Frontend Code Update Example

```typescript
// services/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'omnix-api-key-development-2024';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Login function
export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};
```

## Architecture Recommendation

For better separation of concerns:

1. **Static assets (HTML, CSS, JS)**: Serve through CloudFront from S3
2. **API calls**: Call API Gateway directly from frontend
3. **CDN**: Use CloudFront only for static content caching

This approach:
- ✅ Reduces complexity
- ✅ Better performance for API calls
- ✅ Easier debugging
- ✅ No header forwarding issues

## Current CloudFront Distribution Info
- **Distribution ID**: E2MCXLNXS3ZTKY
- **Domain**: d1vu6p9f5uc16.cloudfront.net
- **API Origin**: 18sz01wxsi.execute-api.eu-central-1.amazonaws.com
- **API Path**: /api/* → /dev (origin path)

---

**Recommendation**: Use the immediate fix (direct API Gateway calls) for fastest resolution.