# OMNIX AI Agent Orchestrator Guide

## Orchestrator Agent Commands

### Primary Commands
- `/diagnose` - Analyze current system state and recommend appropriate agent
- `/workflow <task>` - Execute multi-agent workflow for complex tasks
- `/fix <error>` - Auto-diagnose error and dispatch to appropriate agents
- `/status` - Full system health check across all components
- `/rollback` - Emergency rollback with proper agent coordination

## Agent Selection Matrix

### By Error Type
| Error Pattern | Primary Agent | Secondary Agent | Follow-up |
|--------------|---------------|-----------------|-----------|
| Build failures | Code Review | Implementation | Deployment |
| API 4xx/5xx | Security | Implementation | Monitoring |
| Performance issues | Performance | Architecture | Deployment |
| AWS errors | Deployment | Monitoring | Architecture |
| Type errors | Code Review | Implementation | Testing |
| Security vulnerabilities | Security | Implementation | Deployment |

### By Task Type
| Task | Agent Sequence |
|------|---------------|
| New feature | Architecture → Implementation → Review → Security → Deploy |
| Bug fix | Monitoring → Implementation → Review → Deploy → Monitoring |
| Optimization | Performance → Architecture → Implementation → Deploy |
| Emergency fix | Implementation → Deploy → Monitoring |
| Compliance | Security → Documentation → Review |

## Intelligent Workflows

### 1. Production Issue Resolution
```bash
/fix "customers can't login"
# Orchestrator executes:
1. /monitoring-setup - Check error logs
2. /security-audit - Verify auth system
3. /implement - Fix identified issue
4. /deploy-staging - Test fix
5. /deploy-prod - Deploy if tests pass
6. /monitoring-setup - Verify resolution
```

### 2. Feature Development
```bash
/workflow "add real-time notifications"
# Orchestrator executes:
1. /architecture - Design WebSocket integration
2. /implement - Build feature
3. /review - Code quality check
4. /security-check - Validate data privacy
5. /performance-audit - Optimize for scale
6. /docs-update - Update documentation
7. /deploy-staging - Staging deployment
8. /ab-test - A/B testing setup
9. /deploy-prod - Production rollout
```

### 3. System Optimization
```bash
/workflow "optimize Lambda cold starts"
# Orchestrator executes:
1. /performance-audit - Identify bottlenecks
2. /architecture - Design improvements
3. /implement - Apply optimizations
4. /review - Validate changes
5. /deploy-staging - Test performance
6. /monitoring-setup - Set up metrics
7. /deploy-prod - Production deployment
```

## Context-Aware Routing

### File-Based Detection
```javascript
// Orchestrator analyzes files to determine agent
const agentRouter = {
  'package.json': ['Implementation', 'Deployment'],
  'cloudformation/*.yml': ['Deployment', 'Architecture'],
  '*.test.ts': ['Code Review', 'Implementation'],
  'api-gateway/*': ['Architecture', 'Security'],
  'lambda/*': ['Performance', 'Implementation'],
  'frontend/components/*': ['Implementation', 'Performance']
};
```

### Error Pattern Recognition
```javascript
const errorPatterns = {
  'ECONNREFUSED': 'Deployment Agent',
  'ValidationError': 'Code Review Agent',
  'ProvisionedThroughputExceededException': 'Performance Agent',
  'AccessDenied': 'Security Agent',
  'CloudFormation stack failed': 'Deployment Agent',
  'Jest test failed': 'Implementation Agent'
};
```

## Automated Status Checks

### Pre-Deployment Checklist
```bash
/status
# Orchestrator runs:
- Code review status
- Test coverage check
- Security scan results
- Performance benchmarks
- Documentation updates
- API validation
```

### Post-Deployment Verification
```bash
/verify-deployment
# Orchestrator executes:
1. Health check endpoints
2. CloudWatch metrics
3. Error rate monitoring
4. Performance metrics
5. User impact assessment
```

## Emergency Procedures

### Rollback Protocol
```bash
/rollback
# Orchestrator coordinates:
1. Monitoring Agent - Capture current state
2. Deployment Agent - Execute rollback
3. Monitoring Agent - Verify stability
4. Documentation Agent - Log incident
5. Architecture Agent - Plan fix
```

### Incident Response
```bash
/incident "high error rate detected"
# Orchestrator manages:
1. Immediate diagnosis
2. Impact assessment
3. Mitigation deployment
4. Monitoring setup
5. Post-mortem documentation
```

## Usage Examples

### Example 1: API Performance Issue
```bash
User: "API responses are slow"
Orchestrator: /diagnose
→ Analyzing CloudWatch metrics...
→ Found: Lambda cold start issues
→ Recommended: Performance Agent
→ Executing: /performance-audit
→ Next: /optimize-lambda
→ Follow-up: /deploy-staging
```

### Example 2: Failed Deployment
```bash
User: "Deployment failed with CloudFormation error"
Orchestrator: /fix "CloudFormation stack CREATE_FAILED"
→ Analyzing stack events...
→ Found: IAM permission issue
→ Executing: /security-audit
→ Fixing: IAM policies
→ Retrying: /deploy-staging
→ Success: Moving to production
```

### Example 3: New Feature Request
```bash
User: "Implement customer segmentation with AI"
Orchestrator: /workflow "customer segmentation"
→ Phase 1: /architecture - Design AI integration
→ Phase 2: /ai-optimize - Configure Bedrock models
→ Phase 3: /implement - Build feature
→ Phase 4: /security-check - Validate privacy
→ Phase 5: /ab-test - Test effectiveness
→ Phase 6: /deploy-prod - Full rollout
```

## Best Practices

1. **Always start with diagnosis** - Let orchestrator analyze before acting
2. **Follow the workflow** - Don't skip agents in the sequence
3. **Document decisions** - Orchestrator updates DECISIONS_LOG.md
4. **Monitor transitions** - Track handoffs between agents
5. **Validate each step** - Ensure agent success before proceeding

## Integration with CI/CD

```yaml
# GitHub Actions integration
on:
  push:
    branches: [main]
  
jobs:
  orchestrate:
    steps:
      - name: Run Orchestrator
        run: |
          /status
          /review
          /security-check
          /deploy-staging
          /monitoring-setup
```

## Metrics and KPIs

Track orchestrator effectiveness:
- Mean Time to Resolution (MTTR)
- Agent handoff success rate
- Workflow completion time
- Error detection accuracy
- Deployment success rate

---

This orchestrator ensures professional, systematic problem resolution and feature development across the OMNIX AI platform.