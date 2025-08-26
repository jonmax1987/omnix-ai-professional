import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import Button from '../atoms/Button';
import MetricCard from '../molecules/MetricCard';
import { useRealtimeMetrics } from '../../hooks/useWebSocket';

// Performance indicator animation
const performanceGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.3);
  }
`;

const metricsUpdate = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
  100% {
    transform: translateY(0);
  }
`;

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${props => props.theme.spacing[6]};
  width: 100%;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[4]};
  }
`;

const MetricsDashboardCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.md};
  position: relative;
  overflow: hidden;
  
  ${props => props.variant === 'excellent' && css`
    border-color: ${props.theme.colors.green[300]};
    background: linear-gradient(135deg, 
      ${props.theme.colors.background.elevated} 0%,
      ${props.theme.colors.green[25]} 100%
    );
    animation: ${performanceGlow} 4s ease-in-out infinite;
  `}
  
  ${props => props.variant === 'good' && css`
    border-color: ${props.theme.colors.blue[300]};
    background: linear-gradient(135deg, 
      ${props.theme.colors.background.elevated} 0%,
      ${props.theme.colors.blue[25]} 100%
    );
  `}
  
  ${props => props.variant === 'warning' && css`
    border-color: ${props.theme.colors.yellow[300]};
    background: linear-gradient(135deg, 
      ${props.theme.colors.background.elevated} 0%,
      ${props.theme.colors.yellow[25]} 100%
    );
  `}
  
  ${props => props.variant === 'critical' && css`
    border-color: ${props.theme.colors.red[300]};
    background: linear-gradient(135deg, 
      ${props.theme.colors.background.elevated} 0%,
      ${props.theme.colors.red[25]} 100%
    );
  `}
  
  ${props => props.updating && css`
    animation: ${metricsUpdate} 0.6s ease-in-out;
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getIconBackground(props.variant, props.theme)};
  color: ${props => getIconColor(props.variant, props.theme)};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const TimeRangeSelector = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
`;

const TimeRangeButton = styled(Button)`
  background: ${props => props.active ? props.theme.colors.primary[100] : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary[700] : props.theme.colors.text.secondary};
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  min-width: auto;
  height: auto;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[100] : props.theme.colors.background.tertiary};
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[5]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const MetricItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  position: relative;
  
  ${props => props.highlighted && css`
    background: ${props.theme.colors.primary[25]};
    border-color: ${props.theme.colors.primary[200]};
  `}
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MetricValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${props => props.theme.spacing[2]};
`;

const MainValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1;
`;

const MetricUnit = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => {
    if (props.trend === 'up' && props.positive) return props.theme.colors.green[600];
    if (props.trend === 'down' && props.positive) return props.theme.colors.red[600];
    if (props.trend === 'up' && !props.positive) return props.theme.colors.red[600];
    if (props.trend === 'down' && !props.positive) return props.theme.colors.green[600];
    return props.theme.colors.gray[500];
  }};
`;

const PerformanceIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[2]} 0;
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
`;

const TargetProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const ChartContainer = styled.div`
  height: 200px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  padding: ${props => props.theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.tertiary};
  position: relative;
  overflow: hidden;
`;

const LiveDataIndicator = styled(motion.div)`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.isLive ? props.theme.colors.green[600] : props.theme.colors.gray[500]};
`;

const getIconBackground = (variant, theme) => {
  switch (variant) {
    case 'excellent': return theme.colors.green[100];
    case 'good': return theme.colors.blue[100];
    case 'warning': return theme.colors.yellow[100];
    case 'critical': return theme.colors.red[100];
    default: return theme.colors.primary[100];
  }
};

const getIconColor = (variant, theme) => {
  switch (variant) {
    case 'excellent': return theme.colors.green[600];
    case 'good': return theme.colors.blue[600];
    case 'warning': return theme.colors.yellow[600];
    case 'critical': return theme.colors.red[600];
    default: return theme.colors.primary[600];
  }
};

const getPerformanceVariant = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'warning';
  return 'critical';
};

const PerformanceMetricsDashboard = ({
  timeRange = '24h',
  showLiveData = true,
  showTargets = true,
  enableRealtime = true,
  className,
  ...props
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [updating, setUpdating] = useState(false);
  
  // Use real-time metrics data
  const { metricsData, loading, lastUpdate, isConnected } = useRealtimeMetrics({
    timeRange: selectedTimeRange,
    enabled: enableRealtime
  });

  // Mock performance data - replace with real metrics
  const mockMetricsData = {
    overall: {
      performanceScore: 87,
      trend: 'up',
      change: 5.2
    },
    revenue: {
      current: 245670,
      target: 300000,
      change: 12.5,
      trend: 'up'
    },
    orders: {
      current: 1247,
      target: 1500,
      change: 8.3,
      trend: 'up'
    },
    conversion: {
      current: 3.8,
      target: 4.5,
      change: -0.2,
      trend: 'down'
    },
    averageOrderValue: {
      current: 67.50,
      target: 75,
      change: 4.8,
      trend: 'up'
    },
    customerSatisfaction: {
      current: 4.6,
      target: 4.8,
      change: 0.1,
      trend: 'up'
    },
    responseTime: {
      current: 1.2,
      target: 1.0,
      change: -0.15,
      trend: 'down'
    },
    stockAccuracy: {
      current: 96.5,
      target: 98,
      change: 1.2,
      trend: 'up'
    },
    costReduction: {
      current: 12.5,
      target: 15,
      change: 2.1,
      trend: 'up'
    }
  };

  const currentData = metricsData || mockMetricsData;
  const overallVariant = getPerformanceVariant(currentData.overall?.performanceScore || 0);

  const timeRangeOptions = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' }
  ];

  useEffect(() => {
    if (lastUpdate) {
      setUpdating(true);
      const timeout = setTimeout(() => setUpdating(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [lastUpdate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <DashboardContainer className={className} {...props}>
      {/* Overall Performance Card */}
      <MetricsDashboardCard
        variant={overallVariant}
        updating={updating}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardHeader>
          <CardTitle>
            <CardIcon variant={overallVariant}>
              <Icon name="activity" size={24} />
            </CardIcon>
            <div>
              <Typography variant="h6" weight="semibold">
                Overall Performance
              </Typography>
              <Typography variant="caption" color="secondary">
                Comprehensive business metrics
              </Typography>
            </div>
          </CardTitle>
          
          <CardActions>
            <TimeRangeSelector>
              {timeRangeOptions.map(option => (
                <TimeRangeButton
                  key={option.value}
                  active={selectedTimeRange === option.value}
                  onClick={() => setSelectedTimeRange(option.value)}
                >
                  {option.label}
                </TimeRangeButton>
              ))}
            </TimeRangeSelector>
          </CardActions>
        </CardHeader>

        <MetricValue style={{ marginBottom: '16px' }}>
          <MainValue>{currentData.overall?.performanceScore || 0}</MainValue>
          <MetricUnit>/100</MetricUnit>
          <TrendIndicator trend={currentData.overall?.trend} positive={true}>
            <Icon 
              name={currentData.overall?.trend === 'up' ? 'trending-up' : 'trending-down'} 
              size={16} 
            />
            {formatPercentage(currentData.overall?.change || 0)}
          </TrendIndicator>
        </MetricValue>

        <Progress
          value={currentData.overall?.performanceScore || 0}
          max={100}
          variant={overallVariant === 'excellent' ? 'success' : overallVariant === 'critical' ? 'error' : 'default'}
          animated={true}
          aiMode={true}
          status="processing"
        />

        {showLiveData && (
          <LiveDataIndicator isLive={isConnected}>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%',
              background: isConnected ? '#10B981' : '#6B7280'
            }} />
            {isConnected ? 'Live Data' : 'Offline'}
          </LiveDataIndicator>
        )}
      </MetricsDashboardCard>

      {/* Revenue Metrics Card */}
      <MetricsDashboardCard
        variant="good"
        updating={updating}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardHeader>
          <CardTitle>
            <CardIcon variant="good">
              <Icon name="dollar-sign" size={24} />
            </CardIcon>
            <div>
              <Typography variant="h6" weight="semibold">
                Revenue Performance
              </Typography>
              <Typography variant="caption" color="secondary">
                Sales and financial metrics
              </Typography>
            </div>
          </CardTitle>
          
          <Badge variant="success">
            Target: 82%
          </Badge>
        </CardHeader>

        <MetricsGrid>
          <MetricItem
            highlighted={currentData.revenue?.trend === 'up'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <MetricHeader>
              <Typography variant="body2" color="secondary">
                Total Revenue
              </Typography>
              <TrendIndicator trend={currentData.revenue?.trend} positive={true}>
                <Icon name="trending-up" size={14} />
                {formatPercentage(currentData.revenue?.change || 0)}
              </TrendIndicator>
            </MetricHeader>
            <Typography variant="h5" weight="bold">
              {formatCurrency(currentData.revenue?.current || 0)}
            </Typography>
            {showTargets && (
              <TargetProgress>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Target: {formatCurrency(currentData.revenue?.target || 0)}</span>
                  <span>{calculateProgress(currentData.revenue?.current || 0, currentData.revenue?.target || 1).toFixed(0)}%</span>
                </div>
                <Progress
                  value={currentData.revenue?.current || 0}
                  max={currentData.revenue?.target || 1}
                  size="sm"
                  variant="success"
                  showValue={false}
                />
              </TargetProgress>
            )}
          </MetricItem>

          <MetricItem
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
          >
            <MetricHeader>
              <Typography variant="body2" color="secondary">
                Total Orders
              </Typography>
              <TrendIndicator trend={currentData.orders?.trend} positive={true}>
                <Icon name="trending-up" size={14} />
                {formatPercentage(currentData.orders?.change || 0)}
              </TrendIndicator>
            </MetricHeader>
            <Typography variant="h5" weight="bold">
              {(currentData.orders?.current || 0).toLocaleString()}
            </Typography>
            {showTargets && (
              <TargetProgress>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Target: {(currentData.orders?.target || 0).toLocaleString()}</span>
                  <span>{calculateProgress(currentData.orders?.current || 0, currentData.orders?.target || 1).toFixed(0)}%</span>
                </div>
                <Progress
                  value={currentData.orders?.current || 0}
                  max={currentData.orders?.target || 1}
                  size="sm"
                  showValue={false}
                />
              </TargetProgress>
            )}
          </MetricItem>

          <MetricItem
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <MetricHeader>
              <Typography variant="body2" color="secondary">
                Conversion Rate
              </Typography>
              <TrendIndicator trend={currentData.conversion?.trend} positive={false}>
                <Icon name="trendingDown" size={14} />
                {formatPercentage(currentData.conversion?.change || 0)}
              </TrendIndicator>
            </MetricHeader>
            <Typography variant="h5" weight="bold">
              {(currentData.conversion?.current || 0).toFixed(1)}%
            </Typography>
          </MetricItem>

          <MetricItem
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
          >
            <MetricHeader>
              <Typography variant="body2" color="secondary">
                Avg. Order Value
              </Typography>
              <TrendIndicator trend={currentData.averageOrderValue?.trend} positive={true}>
                <Icon name="trending-up" size={14} />
                {formatPercentage(currentData.averageOrderValue?.change || 0)}
              </TrendIndicator>
            </MetricHeader>
            <Typography variant="h5" weight="bold">
              {formatCurrency(currentData.averageOrderValue?.current || 0)}
            </Typography>
          </MetricItem>
        </MetricsGrid>

        <ChartContainer>
          <Typography variant="body2" color="tertiary">
            Revenue trend chart will be rendered here
          </Typography>
        </ChartContainer>
      </MetricsDashboardCard>

      {/* Operational Metrics Card */}
      <MetricsDashboardCard
        variant="warning"
        updating={updating}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CardHeader>
          <CardTitle>
            <CardIcon variant="warning">
              <Icon name="settings" size={24} />
            </CardIcon>
            <div>
              <Typography variant="h6" weight="semibold">
                Operational Metrics
              </Typography>
              <Typography variant="caption" color="secondary">
                Efficiency and performance indicators
              </Typography>
            </div>
          </CardTitle>
        </CardHeader>

        <MetricsGrid>
          <MetricItem
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <MetricHeader>
              <Typography variant="body2" color="secondary">
                Customer Satisfaction
              </Typography>
              <TrendIndicator trend={currentData.customerSatisfaction?.trend} positive={true}>
                <Icon name="trending-up" size={14} />
                {formatPercentage(currentData.customerSatisfaction?.change || 0)}
              </TrendIndicator>
            </MetricHeader>
            <Typography variant="h5" weight="bold">
              {(currentData.customerSatisfaction?.current || 0).toFixed(1)}/5.0
            </Typography>
            <Progress
              value={currentData.customerSatisfaction?.current || 0}
              max={5}
              size="sm"
              variant="success"
              showValue={false}
            />
          </MetricItem>

          <MetricItem
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
          >
            <MetricHeader>
              <Typography variant="body2" color="secondary">
                Response Time
              </Typography>
              <TrendIndicator trend={currentData.responseTime?.trend} positive={false}>
                <Icon name="trendingDown" size={14} />
                {Math.abs(currentData.responseTime?.change || 0).toFixed(2)}s
              </TrendIndicator>
            </MetricHeader>
            <Typography variant="h5" weight="bold">
              {(currentData.responseTime?.current || 0).toFixed(1)}s
            </Typography>
          </MetricItem>

          <MetricItem
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <MetricHeader>
              <Typography variant="body2" color="secondary">
                Stock Accuracy
              </Typography>
              <TrendIndicator trend={currentData.stockAccuracy?.trend} positive={true}>
                <Icon name="trending-up" size={14} />
                {formatPercentage(currentData.stockAccuracy?.change || 0)}
              </TrendIndicator>
            </MetricHeader>
            <Typography variant="h5" weight="bold">
              {(currentData.stockAccuracy?.current || 0).toFixed(1)}%
            </Typography>
          </MetricItem>

          <MetricItem
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
          >
            <MetricHeader>
              <Typography variant="body2" color="secondary">
                Cost Reduction
              </Typography>
              <TrendIndicator trend={currentData.costReduction?.trend} positive={true}>
                <Icon name="trending-up" size={14} />
                {formatPercentage(currentData.costReduction?.change || 0)}
              </TrendIndicator>
            </MetricHeader>
            <Typography variant="h5" weight="bold">
              {(currentData.costReduction?.current || 0).toFixed(1)}%
            </Typography>
          </MetricItem>
        </MetricsGrid>
      </MetricsDashboardCard>
    </DashboardContainer>
  );
};

export default PerformanceMetricsDashboard;