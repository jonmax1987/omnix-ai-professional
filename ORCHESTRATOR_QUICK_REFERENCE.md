# 🚀 OMNIX AI Orchestrator - Quick Reference Card

## ⚡ Essential Commands

### 🔍 **Diagnosis & Analysis**
```bash
orchestrator diagnose <issue>          # Analyze issue and get agent recommendations
orchestrator status                    # Complete system health check
orchestrator history                   # View recent execution history
```

### 🛠️ **Automated Problem Solving**
```bash
orchestrator fix <error>               # Auto-diagnose and fix with best agents
orchestrator workflow <name>           # Execute predefined multi-agent workflow
orchestrator rollback --force          # Emergency rollback (production)
```

### 💬 **Interactive Mode**
```bash
orchestrator interactive               # Start interactive session
```

---

## 🤖 Core Agents Quick Reference

| Agent | Commands | Specialty |
|-------|----------|-----------|
| 🚀 **Deployment** | `/deploy`, `/deploy-staging`, `/deploy-prod` | AWS deployments, CloudFront, Lambda |
| 📝 **Code Review** | `/review`, `/security-check`, `/accessibility` | Code quality, security, WCAG compliance |
| 🛠️ **Implementation** | `/implement`, `/feature`, `/component` | Feature development, bug fixes |
| 🏗️ **Architecture** | `/architecture`, `/design`, `/scalability` | System design, performance patterns |
| 🔒 **Security** | `/security-audit`, `/privacy-check`, `/compliance` | Data privacy, authentication, GDPR |
| 🤖 **AI/ML** | `/ai-optimize`, `/ab-test`, `/prompt-engineering` | AWS Bedrock, model optimization |
| ⚡ **Performance** | `/performance-audit`, `/optimize-lambda`, `/mobile-performance` | Speed optimization, Core Web Vitals |
| 📚 **Documentation** | `/docs-update`, `/api-docs`, `/user-guide` | API specs, technical guides |
| 📊 **Monitoring** | `/monitoring-setup`, `/health-check`, `/sla-report` | CloudWatch, SLA compliance |

---

## 🔄 Pre-built Workflows

### **Feature Development** (`feature-development`)
```
Architecture → Implementation → Code Review → Security → Performance → Documentation → Deploy Staging → Monitoring → Deploy Production
```

### **Bug Fix** (`bug-fix`)
```
Monitoring → Code Review → Implementation → Code Review → Deploy Staging → Monitoring → Deploy Production
```

### **Emergency Fix** (`emergency-fix`)
```
Implementation → Deploy Staging → Monitoring → Deploy Production → Monitoring
```

### **Performance Optimization** (`performance-optimization`)
```
Performance → Architecture → Implementation → Performance → Deploy Staging → Monitoring → Deploy Production
```

### **Security Incident** (`security-incident`)
```
Security → Monitoring → Implementation → Security → Deploy Emergency → Monitoring → Documentation
```

---

## 📋 Common Use Cases

### 🆘 **Production Issues**
```bash
# API down
orchestrator fix "API endpoints returning 500 errors"

# Performance problems  
orchestrator fix "slow response times"

# Security alert
orchestrator workflow security-incident

# Emergency rollback
orchestrator rollback --force
```

### 🔧 **Development Tasks**
```bash
# New feature
orchestrator workflow feature-development

# Component bug
orchestrator fix "React component not rendering properly"

# Performance optimization
orchestrator workflow performance-optimization

# Code review
orchestrator diagnose "TypeScript errors in build"
```

### 📊 **System Management**
```bash
# Health check
orchestrator status

# View recent activity
orchestrator history -n 20

# System diagnostics
orchestrator diagnose system-health
```

---

## ⚠️ Error Pattern Recognition

The orchestrator automatically detects issue types and selects appropriate agents:

| Error Pattern | Primary Agent | Action |
|---------------|---------------|--------|
| `ECONNREFUSED`, `ETIMEDOUT` | Deployment | Network/connection fixes |
| `ValidationError`, `TypeError` | Code Review | Code quality issues |
| `ProvisionedThroughputExceededException` | Performance | Scaling/optimization |
| `AccessDenied`, `Unauthorized` | Security | Permission/auth fixes |
| `CloudFormation.*failed` | Deployment | Infrastructure issues |
| `test.*failed`, `Jest.*error` | Implementation | Test failures |
| `Lambda.*timeout` | Performance | Lambda optimization |
| `DynamoDB.*error` | Implementation | Database issues |
| `API.*Gateway.*error` | Architecture | API routing issues |

---

## 🎯 Performance Targets

- **API Response**: <500ms
- **Lambda Cold Start**: <2s  
- **Frontend LCP**: <2.5s
- **WebSocket Connections**: 10,000+ concurrent
- **Deployment Time**: <5 minutes
- **Issue Resolution**: <35 minutes (critical)

---

## 🚨 Emergency Procedures

### **Production Down**
1. `orchestrator fix "production system down"`
2. Monitor via `orchestrator status`
3. If failed: `orchestrator rollback --force`

### **Security Breach**
1. `orchestrator workflow security-incident`
2. Follow agent recommendations
3. Document with `orchestrator history`

### **Performance Degradation**
1. `orchestrator diagnose "slow performance"`
2. Execute recommended workflow
3. Validate with monitoring agent

---

## 📞 Quick Help

```bash
orchestrator --help                    # Full command help
orchestrator <command> --help          # Command-specific help
orchestrator interactive               # Interactive mode with built-in help
orchestrator workflow --list           # List all available workflows
```

---

## 💡 Pro Tips

1. **Start with diagnosis**: `orchestrator diagnose` before manual fixes
2. **Use workflows**: Pre-built workflows are tested and optimized
3. **Check status regularly**: `orchestrator status` for system health
4. **Emergency rollback**: Always test `--dry-run` first unless critical
5. **History tracking**: Use `orchestrator history` for post-mortem analysis
6. **Interactive mode**: Great for learning and complex troubleshooting

---

**🎯 Remember**: The orchestrator learns from patterns and improves recommendations over time. Let it guide you to the most effective solutions!

---
*Generated for OMNIX AI Platform - Professional Agent Orchestration System*