import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import Progress from '../atoms/Progress';
import MetricCard from '../molecules/MetricCard';
import { useI18n } from '../../hooks/useI18n';

const DeploymentContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const DeploymentHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.green[25]} 0%, 
    ${props => props.theme.colors.green[50]} 100%);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.spacing[3]};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.green[500]} 0%, 
    ${props => props.theme.colors.green[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
  overflow-x: auto;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  color: ${props => props.active ? props.theme.colors.green[600] : props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.green[500] : 'transparent'};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.green[500]};
    background: ${props => props.theme.colors.green[25]};
  }
`;

const ContentArea = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const DeploymentSection = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[5]};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const SectionIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'completed':
        return props.theme.colors.green[500];
      case 'running':
        return props.theme.colors.blue[500];
      case 'pending':
        return props.theme.colors.yellow[500];
      case 'failed':
        return props.theme.colors.red[500];
      default:
        return props.theme.colors.gray[500];
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DeploymentStep = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['status', 'isActive'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.isActive ? 
    props.theme.colors.green[25] : 
    props.theme.colors.background.elevated};
  border: 1px solid ${props => {
    if (props.isActive) return props.theme.colors.green[200];
    switch (props.status) {
      case 'completed':
        return props.theme.colors.green[200];
      case 'running':
        return props.theme.colors.blue[200];
      case 'failed':
        return props.theme.colors.red[200];
      default:
        return props.theme.colors.border.subtle;
    }
  }};
  border-radius: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
  position: relative;
  
  ${props => props.isActive && css`
    box-shadow: 0 0 0 2px ${props.theme.colors.green[100]};
  `}
`;

const StepIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'completed':
        return props.theme.colors.green[500];
      case 'running':
        return props.theme.colors.blue[500];
      case 'pending':
        return props.theme.colors.gray[300];
      case 'failed':
        return props.theme.colors.red[500];
      default:
        return props.theme.colors.gray[300];
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ConfigForm = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const FormLabel = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const FormSelect = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.green[500]};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.green[100]};
  }
`;

const DeploymentLog = styled.div`
  background: ${props => props.theme.colors.gray[900]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  max-height: 300px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
`;

const LogEntry = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'level'
})`
  color: ${props => {
    switch (props.level) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#10b981';
      case 'info':
        return '#3b82f6';
      default:
        return '#94a3b8';
    }
  }};
  margin-bottom: 4px;
  line-height: 1.4;
`;

const DeploymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const DeploymentCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['status', 'priority'].includes(prop)
})`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'deployed':
        return props.theme.colors.green[200];
      case 'deploying':
        return props.theme.colors.blue[200];
      case 'failed':
        return props.theme.colors.red[200];
      case 'scheduled':
        return props.theme.colors.yellow[200];
      default:
        return props.theme.colors.border.subtle;
    }
  }};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.status) {
        case 'deployed':
          return props.theme.colors.green[500];
        case 'deploying':
          return props.theme.colors.blue[500];
        case 'failed':
          return props.theme.colors.red[500];
        case 'scheduled':
          return props.theme.colors.yellow[500];
        default:
          return props.theme.colors.gray[500];
      }
    }};
    border-radius: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]} 0 0;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const CardTitle = styled.div`
  flex: 1;
`;

const CardMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin: ${props => props.theme.spacing[3]} 0;
`;

const MetricItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'trend'
})`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => 
    props.trend === 'positive' ? props.theme.colors.green[600] :
    props.trend === 'negative' ? props.theme.colors.red[600] :
    props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const AutomationRules = styled.div`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.purple[25]} 0%, 
    ${props => props.theme.colors.purple[50]} 100%);
  border: 1px solid ${props => props.theme.colors.purple[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const RuleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: rgba(255, 255, 255, 0.5);
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RuleToggle = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'enabled'
})`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${props => props.enabled ? props.theme.colors.green[500] : props.theme.colors.gray[300]};
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.enabled ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ABTestDeployment = ({
  testId,
  testData,
  onDeploymentStart,
  onDeploymentStop,
  onConfigUpdate,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('overview');
  const [deploymentConfig, setDeploymentConfig] = useState({
    environment: 'staging',
    trafficPercentage: 50,
    rolloutStrategy: 'gradual',
    duration: 14,
    autoStop: true,
    significanceThreshold: 95,
    monitoringEnabled: true,
    alertsEnabled: true,
    backupStrategy: 'immediate'
  });

  const [deploymentStatus, setDeploymentStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'auto-stop',
      name: 'Auto-stop on significance',
      description: 'Automatically stop test when statistical significance is reached',
      enabled: true,
      trigger: 'significance_reached',
      action: 'stop_test'
    },
    {
      id: 'traffic-ramp',
      name: 'Gradual traffic ramp-up',
      description: 'Gradually increase traffic allocation over time',
      enabled: true,
      trigger: 'time_based',
      action: 'increase_traffic'
    },
    {
      id: 'performance-guard',
      name: 'Performance degradation guard',
      description: 'Stop test if performance drops below threshold',
      enabled: true,
      trigger: 'performance_drop',
      action: 'rollback'
    },
    {
      id: 'error-rate-guard',
      name: 'Error rate monitoring',
      description: 'Alert and potentially stop if error rate increases',
      enabled: true,
      trigger: 'error_rate_high',
      action: 'alert'
    }
  ]);

  // Mock deployment data
  const [deployments, setDeployments] = useState([
    {
      id: 'deploy-001',
      testName: 'Claude Sonnet vs Haiku Speed Test',
      environment: 'production',
      status: 'deployed',
      startTime: '2024-08-20T08:00:00Z',
      traffic: 45,
      participants: 2847,
      conversionRate: 14.7,
      significance: 89,
      health: 'healthy'
    },
    {
      id: 'deploy-002',
      testName: 'Personalization Algorithm Test',
      environment: 'staging',
      status: 'deploying',
      startTime: '2024-08-20T10:30:00Z',
      traffic: 25,
      participants: 156,
      conversionRate: 0,
      significance: 0,
      health: 'deploying'
    },
    {
      id: 'deploy-003',
      testName: 'Checkout Flow Optimization',
      environment: 'production',
      status: 'failed',
      startTime: '2024-08-20T09:15:00Z',
      traffic: 0,
      participants: 0,
      conversionRate: 0,
      significance: 0,
      health: 'failed',
      error: 'Dependency service unavailable'
    }
  ]);

  const deploymentSteps = [
    {
      id: 'validation',
      name: 'Validation & Pre-checks',
      description: 'Validating test configuration and dependencies',
      icon: 'check-circle',
      estimatedTime: '2 minutes'
    },
    {
      id: 'preparation',
      name: 'Environment Preparation',
      description: 'Setting up deployment environment and resources',
      icon: 'settings',
      estimatedTime: '5 minutes'
    },
    {
      id: 'deployment',
      name: 'Test Deployment',
      description: 'Deploying A/B test configuration to target environment',
      icon: 'upload',
      estimatedTime: '3 minutes'
    },
    {
      id: 'verification',
      name: 'Deployment Verification',
      description: 'Verifying successful deployment and initial health checks',
      icon: 'shield-check',
      estimatedTime: '2 minutes'
    },
    {
      id: 'monitoring',
      name: 'Monitoring Setup',
      description: 'Configuring monitoring, alerts, and automated rules',
      icon: 'eye',
      estimatedTime: '1 minute'
    }
  ];

  // Simulate deployment progress
  useEffect(() => {
    if (deploymentStatus === 'deploying') {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < deploymentSteps.length - 1) {
            // Add log entry for step completion
            setDeploymentLogs(logs => [
              ...logs,
              {
                timestamp: new Date().toISOString(),
                level: 'success',
                message: `✓ ${deploymentSteps[prev].name} completed`
              }
            ]);
            return prev + 1;
          } else {
            setDeploymentStatus('deployed');
            setDeploymentLogs(logs => [
              ...logs,
              {
                timestamp: new Date().toISOString(),
                level: 'success',
                message: '🚀 Deployment completed successfully!'
              }
            ]);
            clearInterval(interval);
            return prev;
          }
        });
      }, 3000); // 3 seconds per step

      return () => clearInterval(interval);
    }
  }, [deploymentStatus, deploymentSteps]);

  const tabs = [
    { id: 'overview', label: 'Deployment Overview', icon: 'monitor' },
    { id: 'configure', label: 'Configuration', icon: 'sliders' },
    { id: 'deploy', label: 'Deploy & Monitor', icon: 'rocket' },
    { id: 'automation', label: 'Automation Rules', icon: 'zap' }
  ];

  const handleConfigChange = useCallback((field, value) => {
    setDeploymentConfig(prev => ({
      ...prev,
      [field]: value
    }));
    onConfigUpdate?.({ [field]: value });
  }, [onConfigUpdate]);

  const handleStartDeployment = useCallback(() => {
    setDeploymentStatus('deploying');
    setCurrentStep(0);
    setDeploymentLogs([
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '🔄 Starting deployment process...'
      }
    ]);
    onDeploymentStart?.(deploymentConfig);
  }, [deploymentConfig, onDeploymentStart]);

  const handleStopDeployment = useCallback(() => {
    setDeploymentStatus('stopping');
    setDeploymentLogs(logs => [
      ...logs,
      {
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: '⏹️ Stopping deployment...'
      }
    ]);
    
    setTimeout(() => {
      setDeploymentStatus('stopped');
      setDeploymentLogs(logs => [
        ...logs,
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: '⏸️ Deployment stopped successfully'
        }
      ]);
    }, 2000);
    
    onDeploymentStop?.();
  }, [onDeploymentStop]);

  const toggleAutomationRule = useCallback((ruleId) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  }, []);

  const renderOverviewTab = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Deployment Summary */}
      <DeploymentGrid>
        <MetricCard
          title="Active Deployments"
          value={deployments.filter(d => d.status === 'deployed').length}
          icon="rocket"
          trend={{ value: 'Live tests', label: 'currently running' }}
          color="green"
        />
        <MetricCard
          title="Success Rate"
          value="87.5%"
          icon="target"
          trend={{ value: 'Deployment', label: 'success rate' }}
          color="blue"
        />
        <MetricCard
          title="Average Deploy Time"
          value="12.5 min"
          icon="clock"
          trend={{ value: 'End-to-end', label: 'deployment time' }}
          color="purple"
        />
        <MetricCard
          title="Environment Health"
          value="Healthy"
          icon="shield-check"
          trend={{ value: 'All systems', label: 'operational' }}
          color="orange"
        />
      </DeploymentGrid>

      {/* Current Deployments */}
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Current Deployments
      </Typography>
      
      <DeploymentGrid>
        {deployments.map((deployment, index) => (
          <DeploymentCard
            key={deployment.id}
            status={deployment.status}
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CardHeader>
              <CardTitle>
                <Typography variant="h6" weight="semibold" style={{ marginBottom: '4px' }}>
                  {deployment.testName}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Environment: {deployment.environment}
                </Typography>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Badge 
                    variant={
                      deployment.status === 'deployed' ? 'success' : 
                      deployment.status === 'deploying' ? 'info' :
                      deployment.status === 'failed' ? 'error' : 'warning'
                    } 
                    size="xs"
                  >
                    {deployment.status.toUpperCase()}
                  </Badge>
                  <Badge variant="info" size="xs">
                    {deployment.traffic}% Traffic
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>

            <CardMetrics>
              <MetricItem>
                <MetricValue>{deployment.participants.toLocaleString()}</MetricValue>
                <MetricLabel>Participants</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue trend={deployment.conversionRate > 10 ? 'positive' : 'neutral'}>
                  {deployment.conversionRate.toFixed(1)}%
                </MetricValue>
                <MetricLabel>Conversion</MetricLabel>
              </MetricItem>
            </CardMetrics>

            {deployment.error && (
              <div style={{ 
                padding: '8px', 
                background: '#fef2f2', 
                border: '1px solid #fecaca',
                borderRadius: '6px',
                marginTop: '12px'
              }}>
                <Typography variant="caption" color="error">
                  Error: {deployment.error}
                </Typography>
              </div>
            )}
          </DeploymentCard>
        ))}
      </DeploymentGrid>
    </motion.div>
  );

  const renderConfigureTab = () => (
    <motion.div
      key="configure"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Deployment Configuration
      </Typography>

      <ConfigForm>
        <FormRow>
          <FormGroup>
            <FormLabel>Target Environment</FormLabel>
            <FormSelect
              value={deploymentConfig.environment}
              onChange={(e) => handleConfigChange('environment', e.target.value)}
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Initial Traffic Allocation (%)</FormLabel>
            <Input
              type="number"
              min="1"
              max="100"
              value={deploymentConfig.trafficPercentage}
              onChange={(e) => handleConfigChange('trafficPercentage', parseInt(e.target.value))}
              placeholder="50"
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <FormLabel>Rollout Strategy</FormLabel>
            <FormSelect
              value={deploymentConfig.rolloutStrategy}
              onChange={(e) => handleConfigChange('rolloutStrategy', e.target.value)}
            >
              <option value="immediate">Immediate (Full Traffic)</option>
              <option value="gradual">Gradual Ramp-up</option>
              <option value="canary">Canary (1% then scale)</option>
              <option value="blue-green">Blue-Green Deployment</option>
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Test Duration (days)</FormLabel>
            <Input
              type="number"
              min="1"
              max="90"
              value={deploymentConfig.duration}
              onChange={(e) => handleConfigChange('duration', parseInt(e.target.value))}
              placeholder="14"
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <FormLabel>Significance Threshold (%)</FormLabel>
            <Input
              type="number"
              min="80"
              max="99"
              value={deploymentConfig.significanceThreshold}
              onChange={(e) => handleConfigChange('significanceThreshold', parseInt(e.target.value))}
              placeholder="95"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Backup Strategy</FormLabel>
            <FormSelect
              value={deploymentConfig.backupStrategy}
              onChange={(e) => handleConfigChange('backupStrategy', e.target.value)}
            >
              <option value="immediate">Immediate Rollback Available</option>
              <option value="delayed">5-minute Rollback Delay</option>
              <option value="manual">Manual Rollback Only</option>
            </FormSelect>
          </FormGroup>
        </FormRow>
      </ConfigForm>
    </motion.div>
  );

  const renderDeployTab = () => (
    <motion.div
      key="deploy"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h5" weight="semibold">
          Deploy & Monitor
        </Typography>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {deploymentStatus === 'idle' && (
            <Button variant="primary" onClick={handleStartDeployment}>
              <Icon name="rocket" size={16} />
              Start Deployment
            </Button>
          )}
          
          {(deploymentStatus === 'deploying' || deploymentStatus === 'deployed') && (
            <Button variant="error" onClick={handleStopDeployment}>
              <Icon name="square" size={16} />
              Stop Deployment
            </Button>
          )}
        </div>
      </div>

      {/* Deployment Steps */}
      <DeploymentSection>
        <SectionHeader>
          <SectionIcon status={deploymentStatus === 'deployed' ? 'completed' : 'running'}>
            <Icon name="list" size={20} />
          </SectionIcon>
          <Typography variant="h6" weight="semibold">
            Deployment Pipeline
          </Typography>
        </SectionHeader>

        {deploymentSteps.map((step, index) => (
          <DeploymentStep
            key={step.id}
            status={
              index < currentStep ? 'completed' :
              index === currentStep && deploymentStatus === 'deploying' ? 'running' :
              deploymentStatus === 'failed' && index === currentStep ? 'failed' :
              'pending'
            }
            isActive={index === currentStep}
            whileHover={{ scale: 1.01 }}
          >
            <StepIcon
              status={
                index < currentStep ? 'completed' :
                index === currentStep && deploymentStatus === 'deploying' ? 'running' :
                deploymentStatus === 'failed' && index === currentStep ? 'failed' :
                'pending'
              }
            >
              <Icon 
                name={
                  index < currentStep ? 'check' :
                  index === currentStep && deploymentStatus === 'deploying' ? 'loader' :
                  deploymentStatus === 'failed' && index === currentStep ? 'x' :
                  step.icon
                } 
                size={16} 
              />
            </StepIcon>
            
            <StepContent>
              <Typography variant="body1" weight="medium" style={{ marginBottom: '4px' }}>
                {step.name}
              </Typography>
              <Typography variant="body2" color="secondary">
                {step.description}
              </Typography>
            </StepContent>
            
            <StepActions>
              <Typography variant="caption" color="tertiary">
                {step.estimatedTime}
              </Typography>
            </StepActions>
          </DeploymentStep>
        ))}
      </DeploymentSection>

      {/* Deployment Logs */}
      <DeploymentSection>
        <SectionHeader>
          <SectionIcon status="running">
            <Icon name="terminal" size={20} />
          </SectionIcon>
          <Typography variant="h6" weight="semibold">
            Deployment Logs
          </Typography>
        </SectionHeader>

        <DeploymentLog>
          {deploymentLogs.map((log, index) => (
            <LogEntry key={index} level={log.level}>
              [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
            </LogEntry>
          ))}
          {deploymentLogs.length === 0 && (
            <LogEntry level="info">
              Waiting for deployment to start...
            </LogEntry>
          )}
        </DeploymentLog>
      </DeploymentSection>
    </motion.div>
  );

  const renderAutomationTab = () => (
    <motion.div
      key="automation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Automation Rules
      </Typography>

      <AutomationRules>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Icon name="zap" size={24} />
          <Typography variant="h6" weight="semibold">
            Automated Deployment Controls
          </Typography>
        </div>
        
        {automationRules.map((rule) => (
          <RuleItem key={rule.id}>
            <div style={{ flex: 1 }}>
              <Typography variant="body1" weight="medium" style={{ marginBottom: '4px' }}>
                {rule.name}
              </Typography>
              <Typography variant="body2" color="secondary">
                {rule.description}
              </Typography>
            </div>
            <RuleToggle 
              enabled={rule.enabled} 
              onClick={() => toggleAutomationRule(rule.id)}
            />
          </RuleItem>
        ))}
      </AutomationRules>

      <DeploymentSection>
        <SectionHeader>
          <SectionIcon status="completed">
            <Icon name="settings" size={20} />
          </SectionIcon>
          <Typography variant="h6" weight="semibold">
            Advanced Automation Settings
          </Typography>
        </SectionHeader>

        <ConfigForm>
          <FormRow>
            <FormGroup>
              <FormLabel>Auto-stop Conditions</FormLabel>
              <FormSelect defaultValue="significance">
                <option value="significance">Statistical Significance Reached</option>
                <option value="sample-size">Target Sample Size Reached</option>
                <option value="duration">Maximum Duration Exceeded</option>
                <option value="performance">Performance Threshold Breached</option>
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Rollback Triggers</FormLabel>
              <FormSelect defaultValue="error-rate">
                <option value="error-rate">High Error Rate (&gt;5%)</option>
                <option value="performance">Performance Degradation (&gt;20%)</option>
                <option value="manual">Manual Trigger Only</option>
                <option value="combined">Combined Conditions</option>
              </FormSelect>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <FormLabel>Notification Channels</FormLabel>
              <FormSelect defaultValue="all">
                <option value="email">Email Only</option>
                <option value="slack">Slack Only</option>
                <option value="webhook">Webhook Integration</option>
                <option value="all">All Channels</option>
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Monitoring Frequency</FormLabel>
              <FormSelect defaultValue="1min">
                <option value="30sec">Every 30 seconds</option>
                <option value="1min">Every 1 minute</option>
                <option value="5min">Every 5 minutes</option>
                <option value="15min">Every 15 minutes</option>
              </FormSelect>
            </FormGroup>
          </FormRow>
        </ConfigForm>
      </DeploymentSection>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'configure':
        return renderConfigureTab();
      case 'deploy':
        return renderDeployTab();
      case 'automation':
        return renderAutomationTab();
      default:
        return null;
    }
  };

  return (
    <DeploymentContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <DeploymentHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="rocket" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                Automated Test Deployment
              </Typography>
              <Typography variant="body2" color="secondary">
                Deploy, monitor, and manage A/B tests with automated controls and intelligent rollback
              </Typography>
            </div>
          </HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Badge 
              variant={
                deploymentStatus === 'deployed' ? 'success' : 
                deploymentStatus === 'deploying' ? 'info' : 'secondary'
              } 
              size="sm"
            >
              {deploymentStatus === 'idle' ? 'Ready' : 
               deploymentStatus === 'deploying' ? 'Deploying' : 
               deploymentStatus === 'deployed' ? 'Live' : 
               deploymentStatus}
            </Badge>
          </div>
        </HeaderContent>
      </DeploymentHeader>

      {/* Tabs */}
      <TabsContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      {/* Content */}
      <ContentArea>
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </ContentArea>
    </DeploymentContainer>
  );
};

export default ABTestDeployment;