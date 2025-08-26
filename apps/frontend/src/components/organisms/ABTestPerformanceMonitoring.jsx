import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import Progress from '../atoms/Progress';
import MetricCard from '../molecules/MetricCard';
import { useI18n } from '../../hooks/useI18n';

const MonitoringContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const MonitoringHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.blue[25]} 0%, 
    ${props => props.theme.colors.blue[50]} 100%);
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
    ${props => props.theme.colors.blue[500]} 0%, 
    ${props => props.theme.colors.blue[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
`;

const StatusIndicators = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const StatusIndicator = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => {
    switch (props.status) {
      case 'healthy':
        return props.theme.colors.green[100];
      case 'warning':
        return props.theme.colors.yellow[100];
      case 'critical':
        return props.theme.colors.red[100];
      default:
        return props.theme.colors.gray[100];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'healthy':
        return props.theme.colors.green[700];
      case 'warning':
        return props.theme.colors.yellow[700];
      case 'critical':
        return props.theme.colors.red[700];
      default:
        return props.theme.colors.gray[700];
    }
  }};
  border-radius: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
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
  color: ${props => props.active ? props.theme.colors.blue[600] : props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.blue[500] : 'transparent'};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.blue[500]};
    background: ${props => props.theme.colors.blue[25]};
  }
`;

const ContentArea = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ChartContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[5]};
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ChartTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ChartControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const TimeRangeSelector = styled.select`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const AlertsSection = styled.div`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.red[25]} 0%, 
    ${props => props.theme.colors.orange[25]} 100%);
  border: 1px solid ${props => props.theme.colors.red[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const AlertItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'severity'
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid ${props => {
    switch (props.severity) {
      case 'critical':
        return props.theme.colors.red[300];
      case 'warning':
        return props.theme.colors.yellow[300];
      case 'info':
        return props.theme.colors.blue[300];
      default:
        return props.theme.colors.gray[300];
    }
  }};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'severity'
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    switch (props.severity) {
      case 'critical':
        return props.theme.colors.red[500];
      case 'warning':
        return props.theme.colors.yellow[500];
      case 'info':
        return props.theme.colors.blue[500];
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

const AlertContent = styled.div`
  flex: 1;
`;

const AlertActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const PerformanceCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['performance', 'priority'].includes(prop)
})`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => {
    switch (props.performance) {
      case 'excellent':
        return props.theme.colors.green[200];
      case 'good':
        return props.theme.colors.blue[200];
      case 'poor':
        return props.theme.colors.yellow[200];
      case 'critical':
        return props.theme.colors.red[200];
      default:
        return props.theme.colors.border.subtle;
    }
  }};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.performance) {
        case 'excellent':
          return props.theme.colors.green[500];
        case 'good':
          return props.theme.colors.blue[500];
        case 'poor':
          return props.theme.colors.yellow[500];
        case 'critical':
          return props.theme.colors.red[500];
        default:
          return props.theme.colors.gray[500];
      }
    }};
    border-radius: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]} 0 0;
  }
`;

const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ThresholdSettings = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
`;

const ThresholdGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const ThresholdLabel = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const ThresholdInput = styled(Input)`
  width: 100%;
`;

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)'
      }}>
        <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: entry.color,
              borderRadius: '2px'
            }} />
            <Typography variant="caption" color="secondary">
              {entry.name}: {entry.value}
              {entry.unit && ` ${entry.unit}`}
            </Typography>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ABTestPerformanceMonitoring = ({
  testId,
  testData,
  onAlertAction,
  onThresholdUpdate,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [isRealTime, setIsRealTime] = useState(true);
  
  // Mock performance data
  const [performanceData, setPerformanceData] = useState({
    overall: {
      health: 'healthy',
      uptime: 99.8,
      responseTime: 245,
      errorRate: 0.2,
      throughput: 1250
    },
    metrics: [
      {
        timestamp: '2024-08-20T08:00:00Z',
        responseTime: 230,
        errorRate: 0.1,
        throughput: 1200,
        cpuUsage: 45,
        memoryUsage: 62,
        significance: 85
      },
      {
        timestamp: '2024-08-20T08:30:00Z',
        responseTime: 245,
        errorRate: 0.2,
        throughput: 1250,
        cpuUsage: 48,
        memoryUsage: 64,
        significance: 87
      },
      {
        timestamp: '2024-08-20T09:00:00Z',
        responseTime: 265,
        errorRate: 0.3,
        throughput: 1180,
        cpuUsage: 52,
        memoryUsage: 68,
        significance: 89
      },
      {
        timestamp: '2024-08-20T09:30:00Z',
        responseTime: 250,
        errorRate: 0.15,
        throughput: 1320,
        cpuUsage: 49,
        memoryUsage: 65,
        significance: 91
      },
      {
        timestamp: '2024-08-20T10:00:00Z',
        responseTime: 240,
        errorRate: 0.12,
        throughput: 1380,
        cpuUsage: 46,
        memoryUsage: 63,
        significance: 93
      }
    ]
  });

  const [alerts, setAlerts] = useState([
    {
      id: 'alert-001',
      severity: 'warning',
      title: 'Response Time Spike Detected',
      description: 'Average response time increased by 15% in the last 30 minutes',
      timestamp: '2024-08-20T09:45:00Z',
      acknowledged: false,
      testId: 'ab-001'
    },
    {
      id: 'alert-002',
      severity: 'info',
      title: 'Statistical Significance Reached',
      description: 'Test has reached 95% statistical significance threshold',
      timestamp: '2024-08-20T09:30:00Z',
      acknowledged: true,
      testId: 'ab-001'
    },
    {
      id: 'alert-003',
      severity: 'critical',
      title: 'Error Rate Threshold Exceeded',
      description: 'Error rate has exceeded 5% threshold for the past 15 minutes',
      timestamp: '2024-08-20T09:15:00Z',
      acknowledged: false,
      testId: 'ab-002'
    }
  ]);

  const [monitoredTests, setMonitoredTests] = useState([
    {
      id: 'ab-001',
      name: 'Claude Sonnet vs Haiku Speed Test',
      performance: 'good',
      uptime: 99.5,
      responseTime: 245,
      errorRate: 0.2,
      participants: 2847,
      significance: 89,
      health: 'healthy'
    },
    {
      id: 'ab-002', 
      name: 'Personalization Algorithm Test',
      performance: 'critical',
      uptime: 95.2,
      responseTime: 450,
      errorRate: 5.8,
      participants: 1256,
      significance: 67,
      health: 'unhealthy'
    },
    {
      id: 'ab-003',
      name: 'Checkout Flow Optimization',
      performance: 'excellent',
      uptime: 99.9,
      responseTime: 180,
      errorRate: 0.05,
      participants: 3421,
      significance: 96,
      health: 'healthy'
    }
  ]);

  const [thresholds, setThresholds] = useState({
    responseTime: {
      warning: 300,
      critical: 500
    },
    errorRate: {
      warning: 1.0,
      critical: 5.0
    },
    cpuUsage: {
      warning: 70,
      critical: 85
    },
    memoryUsage: {
      warning: 80,
      critical: 90
    },
    significance: {
      target: 95
    }
  });

  // Simulate real-time updates
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        setPerformanceData(prev => {
          const newDataPoint = {
            timestamp: new Date().toISOString(),
            responseTime: 200 + Math.random() * 100,
            errorRate: Math.random() * 0.5,
            throughput: 1100 + Math.random() * 400,
            cpuUsage: 40 + Math.random() * 20,
            memoryUsage: 60 + Math.random() * 15,
            significance: Math.min(99, prev.metrics[prev.metrics.length - 1].significance + Math.random() * 2)
          };

          return {
            ...prev,
            metrics: [...prev.metrics.slice(-10), newDataPoint], // Keep last 10 points
            overall: {
              ...prev.overall,
              responseTime: newDataPoint.responseTime,
              errorRate: newDataPoint.errorRate,
              throughput: newDataPoint.throughput
            }
          };
        });
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [isRealTime, refreshInterval]);

  const tabs = [
    { id: 'overview', label: 'Monitoring Overview', icon: 'activity' },
    { id: 'performance', label: 'Performance Metrics', icon: 'trending-up' },
    { id: 'alerts', label: 'Alerts & Notifications', icon: 'bell' },
    { id: 'settings', label: 'Monitoring Settings', icon: 'settings' }
  ];

  const handleAlertAcknowledge = useCallback((alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    onAlertAction?.(alertId, 'acknowledge');
  }, [onAlertAction]);

  const handleAlertDismiss = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    onAlertAction?.(alertId, 'dismiss');
  }, [onAlertAction]);

  const handleThresholdChange = useCallback((category, level, value) => {
    setThresholds(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [level]: parseFloat(value)
      }
    }));
    onThresholdUpdate?.({ [category]: { [level]: parseFloat(value) } });
  }, [onThresholdUpdate]);

  const renderOverviewTab = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Key Metrics */}
      <MetricsGrid>
        <MetricCard
          title="Overall Health"
          value={performanceData.overall.health}
          icon="heart"
          trend={{ 
            value: `${performanceData.overall.uptime}%`, 
            label: 'uptime' 
          }}
          color={performanceData.overall.health === 'healthy' ? 'green' : 'red'}
        />
        <MetricCard
          title="Response Time"
          value={`${performanceData.overall.responseTime}ms`}
          icon="zap"
          trend={{ 
            value: performanceData.overall.responseTime < 300 ? 'Good' : 'Needs attention',
            label: 'performance'
          }}
          color={performanceData.overall.responseTime < 300 ? 'blue' : 'yellow'}
        />
        <MetricCard
          title="Error Rate"
          value={`${performanceData.overall.errorRate}%`}
          icon="alert-triangle"
          trend={{ 
            value: performanceData.overall.errorRate < 1 ? 'Low' : 'High',
            label: 'error rate'
          }}
          color={performanceData.overall.errorRate < 1 ? 'green' : 'red'}
        />
        <MetricCard
          title="Throughput"
          value={`${performanceData.overall.throughput}/min`}
          icon="trending-up"
          trend={{ 
            value: 'Stable', 
            label: 'requests per minute' 
          }}
          color="purple"
        />
      </MetricsGrid>

      {/* Active Alerts */}
      {alerts.filter(alert => !alert.acknowledged).length > 0 && (
        <AlertsSection>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Icon name="bell" size={24} />
            <Typography variant="h6" weight="semibold">
              Active Alerts ({alerts.filter(alert => !alert.acknowledged).length})
            </Typography>
          </div>
          
          {alerts.filter(alert => !alert.acknowledged).slice(0, 3).map((alert) => (
            <AlertItem key={alert.id} severity={alert.severity}>
              <AlertIcon severity={alert.severity}>
                <Icon name={
                  alert.severity === 'critical' ? 'alert-circle' :
                  alert.severity === 'warning' ? 'alert-triangle' :
                  'info'
                } size={16} />
              </AlertIcon>
              <AlertContent>
                <Typography variant="body1" weight="medium" style={{ marginBottom: '4px' }}>
                  {alert.title}
                </Typography>
                <Typography variant="body2" color="secondary">
                  {alert.description}
                </Typography>
                <Typography variant="caption" color="tertiary" style={{ marginTop: '4px' }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
              </AlertContent>
              <AlertActions>
                <Button 
                  size="xs" 
                  variant="secondary"
                  onClick={() => handleAlertAcknowledge(alert.id)}
                >
                  Acknowledge
                </Button>
                <Button 
                  size="xs" 
                  variant="ghost"
                  onClick={() => handleAlertDismiss(alert.id)}
                >
                  Dismiss
                </Button>
              </AlertActions>
            </AlertItem>
          ))}
        </AlertsSection>
      )}

      {/* Monitored Tests Overview */}
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Monitored Tests
      </Typography>
      
      <TestGrid>
        {monitoredTests.map((test, index) => (
          <PerformanceCard
            key={test.id}
            performance={test.performance}
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <Typography variant="h6" weight="semibold" style={{ marginBottom: '4px' }}>
                  {test.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Test ID: {test.id}
                </Typography>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Badge 
                    variant={
                      test.performance === 'excellent' ? 'success' : 
                      test.performance === 'good' ? 'info' :
                      test.performance === 'poor' ? 'warning' : 'error'
                    } 
                    size="xs"
                  >
                    {test.performance.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant={test.health === 'healthy' ? 'success' : 'error'} 
                    size="xs"
                  >
                    {test.health.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                <Typography variant="body2" weight="bold">
                  {test.uptime}%
                </Typography>
                <Typography variant="caption" color="secondary">
                  Uptime
                </Typography>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                <Typography variant="body2" weight="bold">
                  {test.responseTime}ms
                </Typography>
                <Typography variant="caption" color="secondary">
                  Response Time
                </Typography>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                <Typography variant="body2" weight="bold" color={test.errorRate > 1 ? 'error' : 'success'}>
                  {test.errorRate}%
                </Typography>
                <Typography variant="caption" color="secondary">
                  Error Rate
                </Typography>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                <Typography variant="body2" weight="bold">
                  {test.significance}%
                </Typography>
                <Typography variant="caption" color="secondary">
                  Significance
                </Typography>
              </div>
            </div>
          </PerformanceCard>
        ))}
      </TestGrid>
    </motion.div>
  );

  const renderPerformanceTab = () => (
    <motion.div
      key="performance"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Performance Charts */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="zap" size={20} />
            <Typography variant="h6" weight="semibold">
              Response Time Trends
            </Typography>
          </ChartTitle>
          <ChartControls>
            <TimeRangeSelector value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </TimeRangeSelector>
          </ChartControls>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData.metrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="responseTime" 
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Response Time (ms)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Error Rate Chart */}
        <ChartContainer whileHover={{ scale: 1.005 }}>
          <ChartHeader>
            <ChartTitle>
              <Icon name="alert-triangle" size={20} />
              <Typography variant="h6" weight="semibold">
                Error Rate Over Time
              </Typography>
            </ChartTitle>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData.metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => [`${value}%`, 'Error Rate']}
              />
              <Area
                type="monotone"
                dataKey="errorRate"
                stroke="#ef4444"
                fill="#ef444430"
                name="Error Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* System Resources Chart */}
        <ChartContainer whileHover={{ scale: 1.005 }}>
          <ChartHeader>
            <ChartTitle>
              <Icon name="cpu" size={20} />
              <Typography variant="h6" weight="semibold">
                System Resource Usage
              </Typography>
            </ChartTitle>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData.metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => [`${value}%`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cpuUsage" 
                stroke="#8b5cf6"
                strokeWidth={2}
                name="CPU Usage (%)"
              />
              <Line 
                type="monotone" 
                dataKey="memoryUsage" 
                stroke="#f59e0b"
                strokeWidth={2}
                name="Memory Usage (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Throughput and Significance */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="trending-up" size={20} />
            <Typography variant="h6" weight="semibold">
              Throughput vs Statistical Significance
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData.metrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="throughput" 
              stroke="#10b981"
              strokeWidth={2}
              name="Throughput (req/min)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="significance" 
              stroke="#f97316"
              strokeWidth={2}
              name="Significance (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderAlertsTab = () => (
    <motion.div
      key="alerts"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h5" weight="semibold">
          Alerts & Notifications
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusIndicator status="healthy">
            <Icon name="check" size={14} />
            {alerts.filter(a => a.severity === 'info').length} Info
          </StatusIndicator>
          <StatusIndicator status="warning">
            <Icon name="alert-triangle" size={14} />
            {alerts.filter(a => a.severity === 'warning').length} Warning
          </StatusIndicator>
          <StatusIndicator status="critical">
            <Icon name="alert-circle" size={14} />
            {alerts.filter(a => a.severity === 'critical').length} Critical
          </StatusIndicator>
        </div>
      </div>

      {/* All Alerts */}
      <div>
        {alerts.map((alert) => (
          <AlertItem key={alert.id} severity={alert.severity}>
            <AlertIcon severity={alert.severity}>
              <Icon name={
                alert.severity === 'critical' ? 'alert-circle' :
                alert.severity === 'warning' ? 'alert-triangle' :
                'info'
              } size={16} />
            </AlertIcon>
            <AlertContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Typography variant="body1" weight="medium">
                  {alert.title}
                </Typography>
                {alert.acknowledged && (
                  <Badge variant="info" size="xs">ACKNOWLEDGED</Badge>
                )}
              </div>
              <Typography variant="body2" color="secondary" style={{ marginBottom: '4px' }}>
                {alert.description}
              </Typography>
              <Typography variant="caption" color="tertiary">
                Test: {alert.testId} • {new Date(alert.timestamp).toLocaleString()}
              </Typography>
            </AlertContent>
            <AlertActions>
              {!alert.acknowledged && (
                <Button 
                  size="xs" 
                  variant="secondary"
                  onClick={() => handleAlertAcknowledge(alert.id)}
                >
                  Acknowledge
                </Button>
              )}
              <Button 
                size="xs" 
                variant="ghost"
                onClick={() => handleAlertDismiss(alert.id)}
              >
                Dismiss
              </Button>
            </AlertActions>
          </AlertItem>
        ))}
      </div>

      {alerts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Icon name="bell-off" size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
          <Typography variant="h6" color="secondary">
            No Active Alerts
          </Typography>
          <Typography variant="body2" color="tertiary">
            All systems are operating normally
          </Typography>
        </div>
      )}
    </motion.div>
  );

  const renderSettingsTab = () => (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Monitoring Settings
      </Typography>

      {/* Real-time Controls */}
      <div style={{ marginBottom: '30px' }}>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '12px' }}>
          Real-time Monitoring
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            variant={isRealTime ? 'primary' : 'secondary'}
            onClick={() => setIsRealTime(!isRealTime)}
          >
            <Icon name={isRealTime ? 'pause' : 'play'} size={16} />
            {isRealTime ? 'Pause' : 'Start'} Real-time Updates
          </Button>
          <div>
            <Typography variant="caption" color="secondary">
              Refresh Interval:
            </Typography>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              style={{ marginLeft: '8px', padding: '4px 8px' }}
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
            </select>
          </div>
        </div>
      </div>

      {/* Threshold Configuration */}
      <Typography variant="h6" weight="semibold" style={{ marginBottom: '12px' }}>
        Alert Thresholds
      </Typography>
      
      <ThresholdSettings>
        <ThresholdGroup>
          <ThresholdLabel>Response Time (ms)</ThresholdLabel>
          <ThresholdInput
            type="number"
            placeholder="Warning threshold"
            value={thresholds.responseTime.warning}
            onChange={(e) => handleThresholdChange('responseTime', 'warning', e.target.value)}
          />
          <ThresholdInput
            type="number"
            placeholder="Critical threshold"
            value={thresholds.responseTime.critical}
            onChange={(e) => handleThresholdChange('responseTime', 'critical', e.target.value)}
          />
        </ThresholdGroup>

        <ThresholdGroup>
          <ThresholdLabel>Error Rate (%)</ThresholdLabel>
          <ThresholdInput
            type="number"
            step="0.1"
            placeholder="Warning threshold"
            value={thresholds.errorRate.warning}
            onChange={(e) => handleThresholdChange('errorRate', 'warning', e.target.value)}
          />
          <ThresholdInput
            type="number"
            step="0.1"
            placeholder="Critical threshold"
            value={thresholds.errorRate.critical}
            onChange={(e) => handleThresholdChange('errorRate', 'critical', e.target.value)}
          />
        </ThresholdGroup>

        <ThresholdGroup>
          <ThresholdLabel>CPU Usage (%)</ThresholdLabel>
          <ThresholdInput
            type="number"
            placeholder="Warning threshold"
            value={thresholds.cpuUsage.warning}
            onChange={(e) => handleThresholdChange('cpuUsage', 'warning', e.target.value)}
          />
          <ThresholdInput
            type="number"
            placeholder="Critical threshold"
            value={thresholds.cpuUsage.critical}
            onChange={(e) => handleThresholdChange('cpuUsage', 'critical', e.target.value)}
          />
        </ThresholdGroup>

        <ThresholdGroup>
          <ThresholdLabel>Memory Usage (%)</ThresholdLabel>
          <ThresholdInput
            type="number"
            placeholder="Warning threshold"
            value={thresholds.memoryUsage.warning}
            onChange={(e) => handleThresholdChange('memoryUsage', 'warning', e.target.value)}
          />
          <ThresholdInput
            type="number"
            placeholder="Critical threshold"
            value={thresholds.memoryUsage.critical}
            onChange={(e) => handleThresholdChange('memoryUsage', 'critical', e.target.value)}
          />
        </ThresholdGroup>
      </ThresholdSettings>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'performance':
        return renderPerformanceTab();
      case 'alerts':
        return renderAlertsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return null;
    }
  };

  return (
    <MonitoringContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <MonitoringHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="activity" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                Test Performance Monitoring
              </Typography>
              <Typography variant="body2" color="secondary">
                Real-time monitoring and alerting for A/B test performance, health, and system metrics
              </Typography>
            </div>
          </HeaderLeft>
          <StatusIndicators>
            <StatusIndicator status={performanceData.overall.health}>
              <Icon name="heart" size={14} />
              System {performanceData.overall.health}
            </StatusIndicator>
            <StatusIndicator status={isRealTime ? 'healthy' : 'warning'}>
              <Icon name={isRealTime ? 'play' : 'pause'} size={14} />
              {isRealTime ? 'Live' : 'Paused'}
            </StatusIndicator>
          </StatusIndicators>
        </HeaderContent>
      </MonitoringHeader>

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
            {tab.id === 'alerts' && alerts.filter(a => !a.acknowledged).length > 0 && (
              <Badge variant="error" size="xs">
                {alerts.filter(a => !a.acknowledged).length}
              </Badge>
            )}
          </Tab>
        ))}
      </TabsContainer>

      {/* Content */}
      <ContentArea>
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </ContentArea>
    </MonitoringContainer>
  );
};

export default ABTestPerformanceMonitoring;