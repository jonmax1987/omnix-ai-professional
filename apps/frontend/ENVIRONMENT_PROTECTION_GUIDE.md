# OMNIX AI - Environment Protection Guide

## 🛡️ CRITICAL: Environment Settings Protection

This document ensures that environment settings and API URLs are **NEVER** overwritten accidentally.

## ⚠️ **GOLDEN RULES**

### 1. **NEVER Edit Environment Files Manually in Production**
- ❌ Don't edit `.env.staging` or `.env.production` directly
- ✅ Use the deployment scripts instead

### 2. **ALWAYS Use the Official Deployment Scripts**
```bash
# Staging deployment
./deploy-multi-env.sh staging

# Production deployment  
./deploy-multi-env.sh production
```

### 3. **NEVER Commit Actual Environment Files**
- ✅ `.env.template` files are safe to commit
- ❌ `.env.staging`, `.env.production`, `.env.local` are protected by `.gitignore`

## 📋 **CURRENT ENVIRONMENT SETTINGS**

### **Staging Environment** (PROTECTED)
```
API URL: https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/staging
Environment: staging
WebSocket: wss://5oo31khrrj.execute-api.eu-central-1.amazonaws.com/staging  
CloudFront: E1HN3Y5MSQJFFC
S3 Bucket: omnix-ai-staging-frontend-minimal
```

### **Production Environment** (PROTECTED)  
```
API URL: https://4j4yb4b844.execute-api.eu-central-1.amazonaws.com/prod
Environment: production
WebSocket: wss://5oo31khrrj.execute-api.eu-central-1.amazonaws.com/prod
CloudFront: E3VGKLCQPWE4DG  
S3 Bucket: omnix-ai-frontend-animations-1755860292
```

## 🚀 **DEPLOYMENT WORKFLOWS**

### **Safe Staging Deployment**
```bash
cd /path/to/omnix-ai-professional/apps/frontend
./deploy-multi-env.sh staging
```

**What this does:**
- ✅ Validates environment configuration
- ✅ Runs security checks
- ✅ Builds with correct environment variables
- ✅ Deploys to correct S3 bucket
- ✅ Invalidates CloudFront cache
- ✅ Runs health checks

### **Safe Production Deployment**
```bash
cd /path/to/omnix-ai-professional/apps/frontend
./deploy-multi-env.sh production
```

**What this does:**
- ✅ Creates backup of current production
- ✅ Enhanced security validation for production
- ✅ Comprehensive health checks
- ✅ Rollback capability if deployment fails

## 🔒 **PROTECTION MECHANISMS ALREADY IN PLACE**

### 1. **Git Protection**
- `.gitignore` prevents committing actual environment files
- Only template files are version controlled

### 2. **Deployment Script Validation**  
- `deploy-multi-env.sh` validates all environment variables
- Prevents deployment with missing or invalid configuration
- Security checks prevent secrets exposure

### 3. **Environment File Structure**
```
.env.template          ← Safe template (committed)
.env.staging.template  ← Safe template (committed) 
.env.production.template ← Safe template (committed)
.env.staging          ← PROTECTED (not committed)
.env.production       ← PROTECTED (not committed)
.env.local           ← PROTECTED (not committed)
```

## ⚡ **QUICK REFERENCE COMMANDS**

### **Set Up Shell Aliases** (Recommended)
Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# OMNIX AI Deployment Aliases
alias omnix-deploy-staging='cd /path/to/omnix-ai-professional/apps/frontend && ./deploy-multi-env.sh staging'
alias omnix-deploy-prod='cd /path/to/omnix-ai-professional/apps/frontend && ./deploy-multi-env.sh production'
alias omnix-check-status='cd /path/to/omnix-ai-professional/apps/frontend && ./check-deployment-status.sh'
```

Then you can simply run:
```bash
omnix-deploy-staging   # Deploy to staging
omnix-deploy-prod      # Deploy to production
omnix-check-status     # Check deployment health
```

## 🚨 **EMERGENCY PROCEDURES**

### **If Environment Settings Get Corrupted**
1. **Never panic-edit** files directly
2. Use the template files to restore:
   ```bash
   cp .env.staging.template .env.staging
   cp .env.production.template .env.production
   ```
3. Redeploy using the official scripts

### **If Deployment Fails**
1. Check the deployment logs for specific errors
2. For production: Automatic backup exists in `omnix-ai-production-backups`
3. Use health check script: `./check-deployment-status.sh`

## 🎯 **BEST PRACTICES**

### **For Development**
1. Use `.env.local` for local development
2. Copy from `.env.template` and customize
3. Never modify staging/production env files for testing

### **For Staging**  
1. Always use `./deploy-multi-env.sh staging`
2. Test thoroughly before promoting to production
3. Monitor with health checks after deployment

### **For Production**
1. **ALWAYS** backup before deployment (automatic in script)
2. Use `./deploy-multi-env.sh production` 
3. Comprehensive health checks are mandatory
4. Never skip security validation

## 📞 **SUPPORT**

If you need to modify environment settings:
1. Update the appropriate `.env.template` file
2. Use the deployment scripts to apply changes
3. Document changes in deployment logs
4. Test thoroughly in staging first

**Remember: The deployment scripts are your friends - they prevent mistakes!**

---

**Last Updated:** 2025-09-09  
**Status:** All protection mechanisms active and verified ✅