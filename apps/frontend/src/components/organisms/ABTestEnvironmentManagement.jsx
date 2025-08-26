import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Settings, Server, Globe, Lock, Shield, CheckCircle, AlertCircle, XCircle, Play, Pause, RefreshCw, Copy, Edit, Trash2, Plus, Eye, EyeOff, Download, Upload, Database, Cloud, MonitorSpeaker, Layers, Cpu, HardDrive, Network, Activity } from 'lucide-react';

const EnvironmentContainer = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadows.medium};
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 8px 0 0 0;
  line-height: 1.5;
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: ${props => {
    switch(props.variant) {
      case 'primary': return props.theme.colors.primary.main;
      case 'success': return props.theme.colors.success.main;
      case 'warning': return props.theme.colors.warning.main;
      case 'danger': return props.theme.colors.error.main;
      default: return props.theme.colors.background.secondary;
    }
  }};
  color: ${props => props.variant ? 'white' : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.variant ? 'transparent' : props.theme.colors.border.light};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${props => {
      switch(props.variant) {
        case 'primary': return props.theme.colors.primary.dark;
        case 'success': return props.theme.colors.success.dark;
        case 'warning': return props.theme.colors.warning.dark;
        case 'danger': return props.theme.colors.error.dark;
        default: return props.theme.colors.background.hover;
      }
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EnvironmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const EnvironmentCard = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border: 2px solid ${props => {
    switch(props.status) {
      case 'active': return props.theme.colors.success.main;
      case 'warning': return props.theme.colors.warning.main;
      case 'error': return props.theme.colors.error.main;
      default: return props.theme.colors.border.light;
    }
  }};
  position: relative;
  overflow: hidden;
`;

const EnvironmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const EnvironmentName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EnvironmentBadge = styled.div`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${props => {
    switch(props.status) {
      case 'active': return props.theme.colors.success.main + '20';
      case 'warning': return props.theme.colors.warning.main + '20';
      case 'error': return props.theme.colors.error.main + '20';
      case 'inactive': return props.theme.colors.gray[300] + '20';
      default: return props.theme.colors.primary.main + '20';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'active': return props.theme.colors.success.main;
      case 'warning': return props.theme.colors.warning.main;
      case 'error': return props.theme.colors.error.main;
      case 'inactive': return props.theme.colors.gray[600];
      default: return props.theme.colors.primary.main;
    }
  }};
`;

const EnvironmentInfo = styled.div`
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  font-family: monospace;
`;

const EnvironmentActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const QuickAction = styled.button`
  padding: 6px 12px;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const ConfigurationSection = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const ConfigCard = styled.div`
  padding: 16px;
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 8px;
`;

const ConfigTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConfigItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
`;

const ConfigKey = styled.span`
  color: ${props => props.theme.colors.text.secondary};
`;

const ConfigValue = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-family: monospace;
  font-size: 13px;
`;

const MonitoringSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const MonitoringCard = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ABTestEnvironmentManagement = ({ onEnvironmentUpdate, onClose }) => {
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');
  const [isCreating, setIsCreating] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});

  const environments = useMemo(() => [
    {
      id: 'production',
      name: 'Production',
      status: 'active',
      icon: Globe,
      url: 'https://omnix-ai.com',
      region: 'us-east-1',
      version: 'v2.1.3',
      uptime: '99.98%',
      activeTests: 12,
      totalRequests: '2.3M/day',
      avgResponse: '145ms',
      errorRate: '0.02%',
      lastDeploy: '2 hours ago',
      resources: {
        cpu: 45,
        memory: 67,
        disk: 34
      },
      config: {
        'Database URL': 'postgres://prod-db-cluster.aws.com:5432',
        'Redis Cache': 'redis://prod-cache.aws.com:6379',
        'AI Model': 'claude-3.5-sonnet-20241022',
        'Max Test Participants': '100000',
        'Test Timeout': '30s',
        'Rate Limit': '1000/min'
      }
    },
    {
      id: 'staging',
      name: 'Staging',
      status: 'active',
      icon: Cloud,
      url: 'https://staging.omnix-ai.com',
      region: 'us-east-1',
      version: 'v2.2.0-rc1',
      uptime: '99.87%',
      activeTests: 8,
      totalRequests: '450K/day',
      avgResponse: '189ms',
      errorRate: '0.08%',
      lastDeploy: '6 hours ago',
      resources: {
        cpu: 32,
        memory: 54,
        disk: 28
      },
      config: {
        'Database URL': 'postgres://staging-db.aws.com:5432',
        'Redis Cache': 'redis://staging-cache.aws.com:6379',
        'AI Model': 'claude-3.5-sonnet-20241022',
        'Max Test Participants': '10000',
        'Test Timeout': '45s',
        'Rate Limit': '500/min'
      }
    },
    {
      id: 'development',
      name: 'Development',
      status: 'warning',
      icon: Cpu,
      url: 'https://dev.omnix-ai.com',
      region: 'us-west-2',
      version: 'v2.2.0-dev',
      uptime: '98.45%',
      activeTests: 3,
      totalRequests: '12K/day',
      avgResponse: '234ms',
      errorRate: '0.15%',
      lastDeploy: '1 day ago',
      resources: {
        cpu: 78,
        memory: 89,
        disk: 45
      },
      config: {
        'Database URL': 'postgres://dev-db.internal:5432',
        'Redis Cache': 'redis://dev-cache.internal:6379',
        'AI Model': 'claude-3-haiku-20240307',
        'Max Test Participants': '1000',
        'Test Timeout': '60s',
        'Rate Limit': '100/min'
      }
    },
    {
      id: 'testing',
      name: 'Testing',
      status: 'inactive',
      icon: Database,
      url: 'https://test.omnix-ai.com',
      region: 'us-west-2',
      version: 'v2.1.3',
      uptime: '0%',
      activeTests: 0,
      totalRequests: '0/day',
      avgResponse: 'N/A',
      errorRate: 'N/A',
      lastDeploy: '3 days ago',
      resources: {
        cpu: 0,
        memory: 0,
        disk: 12
      },
      config: {
        'Database URL': 'postgres://test-db.internal:5432',
        'Redis Cache': 'redis://test-cache.internal:6379',
        'AI Model': 'claude-3-haiku-20240307',
        'Max Test Participants': '500',
        'Test Timeout': '120s',
        'Rate Limit': '50/min'
      }
    }
  ], []);

  const performanceData = useMemo(() => [
    { time: '00:00', production: 98.5, staging: 97.2, development: 95.8 },
    { time: '04:00', production: 99.1, staging: 98.4, development: 96.1 },
    { time: '08:00', production: 99.8, staging: 99.2, development: 97.5 },
    { time: '12:00', production: 99.9, staging: 99.5, development: 98.2 },
    { time: '16:00', production: 99.7, staging: 99.1, development: 97.8 },
    { time: '20:00', production: 99.6, staging: 98.9, development: 96.9 },
    { time: '24:00', production: 99.8, staging: 99.3, development: 97.4 }
  ], []);

  const testDistribution = useMemo(() => [
    { name: 'Production', value: 12, color: '#10B981' },
    { name: 'Staging', value: 8, color: '#F59E0B' },
    { name: 'Development', value: 3, color: '#8B5CF6' },
    { name: 'Testing', value: 0, color: '#6B7280' }
  ], []);

  const handleEnvironmentAction = useCallback((envId, action) => {
    console.log(`${action} environment:`, envId);
    
    switch (action) {
      case 'start':
      case 'stop':
      case 'restart':
        // Simulate environment state change
        if (onEnvironmentUpdate) {
          onEnvironmentUpdate({
            environmentId: envId,
            action,
            timestamp: new Date()
          });
        }
        break;
      case 'clone':
        setIsCreating(true);
        setTimeout(() => setIsCreating(false), 2000);
        break;
      default:
        break;
    }
  }, [onEnvironmentUpdate]);

  const handleToggleSecrets = useCallback((envId) => {
    setShowSecrets(prev => ({
      ...prev,
      [envId]: !prev[envId]
    }));
  }, []);

  const handleCreateEnvironment = useCallback(async () => {
    setIsCreating(true);
    
    // Simulate environment creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsCreating(false);
    
    if (onEnvironmentUpdate) {
      onEnvironmentUpdate({
        action: 'create',
        environment: {
          id: `env-${Date.now()}`,
          name: 'New Environment',
          status: 'inactive'
        }
      });
    }
  }, [onEnvironmentUpdate]);

  const handleExportConfig = useCallback((envId) => {
    const env = environments.find(e => e.id === envId);
    if (!env) return;

    const exportData = {
      environment: {
        id: env.id,
        name: env.name,
        url: env.url,
        region: env.region,
        version: env.version
      },
      configuration: env.config,
      resources: env.resources,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${env.name.toLowerCase()}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [environments]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return XCircle;
      default: return RefreshCw;
    }
  };

  return (
    <EnvironmentContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <div>
          <Title>
            <Server size={32} />
            Test Environment Management
          </Title>
          <Subtitle>
            Manage and monitor A/B testing environments across development, staging, and production systems.
          </Subtitle>
        </div>
      </Header>

      <ControlsSection>
        <ActionButton 
          variant="primary" 
          onClick={handleCreateEnvironment}
          disabled={isCreating}
        >
          {isCreating ? <RefreshCw size={16} className="spinning" /> : <Plus size={16} />}
          {isCreating ? 'Creating...' : 'New Environment'}
        </ActionButton>

        <ActionButton onClick={() => handleEnvironmentAction('all', 'refresh')}>
          <RefreshCw size={16} />
          Refresh All
        </ActionButton>

        <ActionButton onClick={() => console.log('Import configuration')}>
          <Upload size={16} />
          Import Config
        </ActionButton>
      </ControlsSection>

      <EnvironmentGrid>
        {environments.map((env, index) => {
          const StatusIcon = getStatusIcon(env.status);
          
          return (
            <EnvironmentCard
              key={env.id}
              status={env.status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EnvironmentHeader>
                <EnvironmentName>
                  <env.icon size={24} />
                  {env.name}
                </EnvironmentName>
                <EnvironmentBadge status={env.status}>
                  <StatusIcon size={12} />
                  {env.status.charAt(0).toUpperCase() + env.status.slice(1)}
                </EnvironmentBadge>
              </EnvironmentHeader>

              <EnvironmentInfo>
                <InfoRow>
                  <InfoLabel>URL</InfoLabel>
                  <InfoValue>{env.url}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Region</InfoLabel>
                  <InfoValue>{env.region}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Version</InfoLabel>
                  <InfoValue>{env.version}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Uptime</InfoLabel>
                  <InfoValue>{env.uptime}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Active Tests</InfoLabel>
                  <InfoValue>{env.activeTests}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Requests/Day</InfoLabel>
                  <InfoValue>{env.totalRequests}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Avg Response</InfoLabel>
                  <InfoValue>{env.avgResponse}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Error Rate</InfoLabel>
                  <InfoValue>{env.errorRate}</InfoValue>
                </InfoRow>
              </EnvironmentInfo>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Resource Usage
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <div>CPU: {env.resources.cpu}%</div>
                    <div style={{ width: '100%', height: '4px', background: '#e5e7eb', borderRadius: '2px', marginTop: '2px' }}>
                      <div style={{ width: `${env.resources.cpu}%`, height: '100%', background: env.resources.cpu > 80 ? '#ef4444' : env.resources.cpu > 60 ? '#f59e0b' : '#10b981', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div>
                    <div>RAM: {env.resources.memory}%</div>
                    <div style={{ width: '100%', height: '4px', background: '#e5e7eb', borderRadius: '2px', marginTop: '2px' }}>
                      <div style={{ width: `${env.resources.memory}%`, height: '100%', background: env.resources.memory > 80 ? '#ef4444' : env.resources.memory > 60 ? '#f59e0b' : '#10b981', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div>
                    <div>Disk: {env.resources.disk}%</div>
                    <div style={{ width: '100%', height: '4px', background: '#e5e7eb', borderRadius: '2px', marginTop: '2px' }}>
                      <div style={{ width: `${env.resources.disk}%`, height: '100%', background: env.resources.disk > 80 ? '#ef4444' : env.resources.disk > 60 ? '#f59e0b' : '#10b981', borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>
              </div>

              <EnvironmentActions>
                {env.status === 'active' ? (
                  <QuickAction onClick={() => handleEnvironmentAction(env.id, 'restart')}>
                    <RefreshCw size={14} />
                    Restart
                  </QuickAction>
                ) : (
                  <QuickAction onClick={() => handleEnvironmentAction(env.id, 'start')}>
                    <Play size={14} />
                    Start
                  </QuickAction>
                )}
                
                <QuickAction onClick={() => handleEnvironmentAction(env.id, 'clone')}>
                  <Copy size={14} />
                  Clone
                </QuickAction>

                <QuickAction onClick={() => setSelectedEnvironment(env.id)}>
                  <Edit size={14} />
                  Configure
                </QuickAction>

                <QuickAction onClick={() => handleExportConfig(env.id)}>
                  <Download size={14} />
                  Export
                </QuickAction>
              </EnvironmentActions>
            </EnvironmentCard>
          );
        })}
      </EnvironmentGrid>

      <MonitoringSection>
        <MonitoringCard>
          <ChartTitle>
            <Activity size={20} />
            Environment Performance
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[90, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="production" stroke="#10B981" strokeWidth={3} name="Production" />
              <Line type="monotone" dataKey="staging" stroke="#F59E0B" strokeWidth={2} name="Staging" />
              <Line type="monotone" dataKey="development" stroke="#8B5CF6" strokeWidth={2} name="Development" />
            </LineChart>
          </ResponsiveContainer>
        </MonitoringCard>

        <MonitoringCard>
          <ChartTitle>
            <PieChart size={20} />
            Active Tests Distribution
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={testDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {testDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </MonitoringCard>
      </MonitoringSection>

      {selectedEnvironment && (
        <ConfigurationSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <SectionTitle>
              <Settings size={20} />
              {environments.find(e => e.id === selectedEnvironment)?.name} Configuration
            </SectionTitle>
            <div style={{ display: 'flex', gap: '8px' }}>
              <QuickAction onClick={() => handleToggleSecrets(selectedEnvironment)}>
                {showSecrets[selectedEnvironment] ? <EyeOff size={14} /> : <Eye size={14} />}
                {showSecrets[selectedEnvironment] ? 'Hide' : 'Show'} Secrets
              </QuickAction>
              <QuickAction onClick={() => handleExportConfig(selectedEnvironment)}>
                <Download size={14} />
                Export Config
              </QuickAction>
            </div>
          </div>

          <ConfigGrid>
            <ConfigCard>
              <ConfigTitle>
                <Database size={16} />
                Database Configuration
              </ConfigTitle>
              {Object.entries(environments.find(e => e.id === selectedEnvironment)?.config || {})
                .filter(([key]) => key.toLowerCase().includes('database') || key.toLowerCase().includes('redis'))
                .map(([key, value]) => (
                  <ConfigItem key={key}>
                    <ConfigKey>{key}:</ConfigKey>
                    <ConfigValue>
                      {showSecrets[selectedEnvironment] ? value : key.toLowerCase().includes('url') ? '••••••••' : value}
                    </ConfigValue>
                  </ConfigItem>
                ))
              }
            </ConfigCard>

            <ConfigCard>
              <ConfigTitle>
                <Cpu size={16} />
                AI Model Configuration
              </ConfigTitle>
              {Object.entries(environments.find(e => e.id === selectedEnvironment)?.config || {})
                .filter(([key]) => key.toLowerCase().includes('model') || key.toLowerCase().includes('timeout'))
                .map(([key, value]) => (
                  <ConfigItem key={key}>
                    <ConfigKey>{key}:</ConfigKey>
                    <ConfigValue>{value}</ConfigValue>
                  </ConfigItem>
                ))
              }
            </ConfigCard>

            <ConfigCard>
              <ConfigTitle>
                <Network size={16} />
                Network & Limits
              </ConfigTitle>
              {Object.entries(environments.find(e => e.id === selectedEnvironment)?.config || {})
                .filter(([key]) => key.toLowerCase().includes('limit') || key.toLowerCase().includes('max'))
                .map(([key, value]) => (
                  <ConfigItem key={key}>
                    <ConfigKey>{key}:</ConfigKey>
                    <ConfigValue>{value}</ConfigValue>
                  </ConfigItem>
                ))
              }
            </ConfigCard>
          </ConfigGrid>
        </ConfigurationSection>
      )}

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </EnvironmentContainer>
  );
};

export default ABTestEnvironmentManagement;