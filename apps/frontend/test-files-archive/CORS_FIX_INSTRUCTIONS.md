# CORS Fix Instructions for API Gateway

## Problem
The API Gateway is not returning the `Access-Control-Allow-Origin` header for your frontend domain:
```
http://omnix-ai-frontend-animations-1754933694.s3-website.eu-central-1.amazonaws.com
```

## Backend Fix Required

### AWS API Gateway Console Fix:
1. Go to AWS API Gateway console
2. Select your API: `omnix-ai-api-dev`
3. For each resource/method (especially `/v1/auth/login`):
   - Select the method (POST)
   - Click on "Actions" → "Enable CORS"
   - Add your S3 website URL to "Access-Control-Allow-Origin":
     ```
     http://omnix-ai-frontend-animations-1754933694.s3-website.eu-central-1.amazonaws.com
     ```
   - Or use wildcard for development: `*`
   - Ensure headers include: `Content-Type,Authorization,X-API-Key`
   - Click "Deploy API" after changes

### Serverless Framework Fix (if using):
Add to your `serverless.yml`:
```yaml
functions:
  auth:
    events:
      - http:
          path: v1/auth/login
          method: post
          cors:
            origin: 
              - http://omnix-ai-frontend-animations-1754933694.s3-website.eu-central-1.amazonaws.com
            headers:
              - Content-Type
              - Authorization
              - X-API-Key
            allowCredentials: true
```

### Express.js/NestJS Backend Fix (if applicable):
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://omnix-ai-frontend-animations-1754933694.s3-website.eu-central-1.amazonaws.com'
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
```

## Current CORS Headers
The API currently returns:
- ✅ `access-control-allow-headers: Content-Type,Authorization,X-API-Key`
- ✅ `access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`  
- ✅ `access-control-allow-credentials: true`
- ❌ **Missing: `Access-Control-Allow-Origin`**

## Temporary Workaround
For immediate testing, you can temporarily set CORS to allow all origins (`*`) in the API Gateway, but this should only be used for development.

## Verification
After fixing the API Gateway CORS, test with:
```bash
curl -X POST "https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/v1/auth/login" \
  -H "Origin: http://omnix-ai-frontend-animations-1754933694.s3-website.eu-central-1.amazonaws.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpass"}' \
  -v | grep -i "access-control-allow-origin"
```

This should return:
```
access-control-allow-origin: http://omnix-ai-frontend-animations-1754933694.s3-website.eu-central-1.amazonaws.com
```

## Next Steps
1. Fix the API Gateway CORS configuration (backend task)
2. Deploy the API Gateway changes
3. Test the login functionality from the frontend

The frontend code is correct - this is purely a backend CORS configuration issue.