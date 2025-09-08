# OMNIX AI Backend Deployment Cleanup Plan

## Environment Testing Results
✅ **Development**: S3 deployment working (HTTP access)
✅ **Staging**: Full CloudFront + API Gateway deployment working 
✅ **Production**: Full CloudFront + API Gateway deployment working

## Current Active Files (DO NOT DELETE)
- `omnix-deploy.sh` - Unified deployment script ✅ WORKING
- `extract-config.js` - Configuration extractor ✅ WORKING
- `config/deployment-config.yaml` - Master configuration ✅ WORKING
- `lambda-staging-simple.js` - Active staging Lambda function ✅ WORKING
- `omnix-api-complete.js` - Active production Lambda function ✅ WORKING

## Files Safe to Delete

### Old Lambda Deployment Files
```
data-lambda-fixed.zip
data-lambda-temp.js
data-lambda.zip
lambda-cors-cloudfront-fix.zip
lambda-cors-fix.zip
lambda-fix.zip
lambda-restore.zip
lambda-staging.zip
lambda-update.zip
lambda.js (old standalone version)
lambda.ts (old standalone version)
omnix-ai-auth-lambda-fixed.zip
omnix-ai-auth-lambda.zip
omnix-ai-backend-lambda-final.zip
omnix-ai-backend-lambda-fixed.zip
omnix-ai-backend-lambda.zip
omnix-ai-backend-staging.zip
omnix-lambda.zip
simple-lambda.js
simple-lambda.zip
```

### Old Deployment Directories
```
deployment/
deployment-small/
dist/deployment/
dist/src/
lambda-deploy/
lambda-deploy-fixed/
lambda-deploy-staging/
temp-extract/
```

### Old Scripts
```
deploy-lambda.sh (replaced by omnix-deploy.sh)
deploy-websocket.sh (not currently used)
validate-deployment.sh (manual testing completed)
```

### Test Files
```
test-api-endpoints.js
test-bedrock.js
test-customer-segmentation.js
test-event.json
test-payload.json
test-segmentation-unit.js
performance-test.js
production-validation-test.js
seed-ai-test-data.js
test/ directory
```

### Backup/Fixed Files
```
omnix-ai-backend-fixed.zip
omnix-ai-backend-fixed-handler.zip
omnix-ai-backend-working-fixed.zip
omnix-ai-backend-dynamodb-fixed.zip
omnix-ai-backend-dynamodb-final-fixed.zip
```

### Other Old Files
```
deployment.zip
lambda-role-policy.json
package-lambda.json
lambda-auth.js
lambda-package.json
lambda-dynamodb-fix.zip
```

## Cleanup Commands
```bash
# Remove old Lambda deployment files
rm -f data-lambda-fixed.zip data-lambda-temp.js data-lambda.zip
rm -f lambda-cors-cloudfront-fix.zip lambda-cors-fix.zip lambda-fix.zip
rm -f lambda-restore.zip lambda-staging.zip lambda-update.zip
rm -f lambda.js lambda.ts
rm -f omnix-ai-auth-lambda-fixed.zip omnix-ai-auth-lambda.zip
rm -f omnix-ai-backend-lambda-final.zip omnix-ai-backend-lambda-fixed.zip
rm -f omnix-ai-backend-lambda.zip omnix-ai-backend-staging.zip
rm -f omnix-lambda.zip simple-lambda.js simple-lambda.zip

# Remove old deployment directories  
rm -rf deployment/ deployment-small/ dist/deployment/ dist/src/
rm -rf lambda-deploy/ lambda-deploy-fixed/ lambda-deploy-staging/
rm -rf temp-extract/

# Remove old scripts
rm -f deploy-lambda.sh deploy-websocket.sh validate-deployment.sh

# Remove test files
rm -f test-*.js performance-test.js production-validation-test.js
rm -f seed-ai-test-data.js test-event.json test-payload.json
rm -rf test/

# Remove backup/fixed files
rm -f omnix-ai-backend-fixed.zip omnix-ai-backend-fixed-handler.zip
rm -f omnix-ai-backend-working-fixed.zip omnix-ai-backend-dynamodb-fixed.zip
rm -f omnix-ai-backend-dynamodb-final-fixed.zip

# Remove other old files
rm -f deployment.zip lambda-role-policy.json package-lambda.json
rm -f lambda-auth.js lambda-package.json lambda-dynamodb-fix.zip
```

## Post-Cleanup Verification
After cleanup, these files should remain:
- `omnix-deploy.sh` - Active unified deployment script
- `extract-config.js` - Configuration extractor
- `lambda-staging-simple.js` - Staging Lambda function
- `omnix-api-complete.js` - Production Lambda function  
- `config/deployment-config.yaml` - Master deployment configuration
- `DEPLOYMENT_TEST_LOG.md` - Testing documentation
- `DEPLOYMENT_CLEANUP_PLAN.md` - This cleanup plan (can be deleted after cleanup)

## Risk Assessment: LOW RISK
All files marked for deletion are old versions, backups, or test files that are no longer needed. The current deployment system has been tested and validated to work correctly across all environments.