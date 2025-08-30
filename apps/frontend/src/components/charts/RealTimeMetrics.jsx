import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

const MetricsContainer = styled.div`
  width: 100%;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.success[50]};
  border: 1px solid ${props => props.theme.colors.success[200]};
  border-radius: ${props => props.theme.spacing[1]};
`;

const LiveDot = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.colors.success[500]};
`;

const RefreshButton = styled.button`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
    border-color: ${props => props.theme.colors.primary[300]};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const MetricCard = styled(motion.div)`
  background: ${props => props.gradient ? 
    `linear-gradient(135deg, ${props.gradient.from}15, ${props.gradient.to}15)` : 
    props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.accentColor || props.theme.colors.primary[500]};
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const MetricInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MetricValue = styled.div`
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChangeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.color}20;
  border-radius: ${props => props.theme.spacing[1]};
`;

const MiniChart = styled.div`
  width: 60px;
  height: 30px;
  position: relative;
`;

const MiniChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const MiniChartPath = styled.path`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const AlertsSection = styled.div`
  margin-top: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const AlertsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  max-height: 200px;
  overflow-y: auto;
`;

const AlertItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['severity'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.severity === 'high' ? 
    props.theme.colors.error[50] : 
    props.severity === 'medium' ? 
    props.theme.colors.warning[50] : 
    props.theme.colors.info[50]};
  border: 1px solid ${props => props.severity === 'high' ? 
    props.theme.colors.error[200] : 
    props.severity === 'medium' ? 
    props.theme.colors.warning[200] : 
    props.theme.colors.info[200]};
  border-radius: ${props => props.theme.spacing[1]};
`;

const AlertIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const ActivityFeed = styled.div`
  margin-top: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  max-height: 150px;
  overflow-y: auto;
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.hover};
  border-radius: ${props => props.theme.spacing[1]};
`;

const ActivityDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const RealTimeMetrics = ({
  data = {},
  updateInterval = 5000, // 5 seconds
  onRefresh,
  loading = false,
  animate = true
}) => {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Generate mock real-time data
  const metricsData = useMemo(() => {
    if (Object.keys(data).length > 0) return data;
    
    const now = new Date();
    const baseMetrics = {
      totalSales: 245680,
      activeOrders: 127,
      lowStockItems: 23,
      inventoryValue: 2845920,
      avgOrderValue: 156.50,
      conversionRate: 3.2
    };
    
    // Add some realistic variation
    const variation = () => (Math.random() - 0.5) * 0.1; // ±5% variation
    
    return {
      totalSales: {
        value: Math.round(baseMetrics.totalSales * (1 + variation())),
        change: (Math.random() - 0.3) * 20, // Bias towards positive
        trend: 'up',
        history: Array.from({ length: 24 }, (_, i) => 
          baseMetrics.totalSales * (0.8 + Math.random() * 0.4)
        )
      },
      activeOrders: {
        value: Math.round(baseMetrics.activeOrders * (1 + variation())),
        change: (Math.random() - 0.4) * 15,
        trend: 'up',
        history: Array.from({ length: 24 }, (_, i) => 
          baseMetrics.activeOrders * (0.7 + Math.random() * 0.6)
        )
      },
      lowStockItems: {
        value: Math.round(baseMetrics.lowStockItems * (1 + variation())),
        change: (Math.random() - 0.6) * 10, // Bias towards negative (good)
        trend: 'down',
        history: Array.from({ length: 24 }, (_, i) => 
          baseMetrics.lowStockItems * (0.5 + Math.random() * 1)
        )
      },
      inventoryValue: {
        value: Math.round(baseMetrics.inventoryValue * (1 + variation())),
        change: (Math.random() - 0.5) * 5,
        trend: 'stable',
        history: Array.from({ length: 24 }, (_, i) => 
          baseMetrics.inventoryValue * (0.9 + Math.random() * 0.2)
        )
      },
      avgOrderValue: {
        value: Math.round(baseMetrics.avgOrderValue * (1 + variation()) * 100) / 100,
        change: (Math.random() - 0.3) * 12,
        trend: 'up',
        history: Array.from({ length: 24 }, (_, i) => 
          baseMetrics.avgOrderValue * (0.8 + Math.random() * 0.4)
        )
      },
      conversionRate: {
        value: Math.round(baseMetrics.conversionRate * (1 + variation()) * 10) / 10,
        change: (Math.random() - 0.4) * 8,
        trend: 'up',
        history: Array.from({ length: 24 }, (_, i) => 
          baseMetrics.conversionRate * (0.7 + Math.random() * 0.6)
        )
      }
    };
  }, [data, lastUpdate]);

  // Generate mock alerts
  const alerts = useMemo(() => [
    {
      id: 1,
      message: 'iPhone 14 Pro stock below minimum threshold',
      severity: 'high',
      time: '2 minutes ago',
      icon: 'alert-triangle'
    },
    {
      id: 2,
      message: 'Unusual spike in electronics category demand',
      severity: 'medium',
      time: '5 minutes ago',
      icon: 'trending-up'
    },
    {
      id: 3,
      message: 'Automated reorder placed for Samsung Galaxy S23',
      severity: 'low',
      time: '8 minutes ago',
      icon: 'check-circle'
    }
  ], [lastUpdate]);

  // Generate mock activity feed
  const activities = useMemo(() => [
    {
      id: 1,
      message: 'New order #12847 received ($234.50)',
      time: '1 min ago',
      type: 'order'
    },
    {
      id: 2,
      message: 'Inventory updated for MacBook Pro 16"',
      time: '3 min ago',
      type: 'inventory'
    },
    {
      id: 3,
      message: 'Price adjustment applied to Nike Air Max 90',
      time: '7 min ago',
      type: 'price'
    },
    {
      id: 4,
      message: 'Supplier delivery confirmed for tomorrow',
      time: '12 min ago',
      type: 'supplier'
    }
  ], [lastUpdate]);

  // Auto-refresh effect
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [isLive, updateInterval]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    } else {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setLastUpdate(new Date());
    setRefreshing(false);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Get change color
  const getChangeColor = (change, inverted = false) => {
    const positive = inverted ? change < 0 : change > 0;
    return positive ? '#10B981' : change < 0 ? '#EF4444' : '#6B7280';
  };

  // Get change icon
  const getChangeIcon = (change) => {
    if (change > 2) return 'trending-up';
    if (change < -2) return 'trending-down';
    return 'minus';
  };

  // Generate mini chart path
  const generateMiniChartPath = (data) => {
    if (!data || data.length === 0) return '';
    
    const width = 60;
    const height = 30;
    const padding = 2;
    
    const xStep = (width - padding * 2) / (data.length - 1);
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue || 1;
    
    return data.map((value, index) => {
      const x = padding + index * xStep;
      const y = padding + ((maxValue - value) / valueRange) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const metrics = [
    {
      key: 'totalSales',
      title: 'Total Sales',
      icon: 'dollar-sign',
      color: '#3B82F6',
      value: formatCurrency(metricsData.totalSales?.value || 0),
      change: metricsData.totalSales?.change || 0,
      gradient: { from: '#3B82F6', to: '#1D4ED8' }
    },
    {
      key: 'activeOrders',
      title: 'Active Orders',
      icon: 'shopping-cart',
      color: '#10B981',
      value: metricsData.activeOrders?.value || 0,
      change: metricsData.activeOrders?.change || 0,
      gradient: { from: '#10B981', to: '#059669' }
    },
    {
      key: 'lowStockItems',
      title: 'Low Stock Items',
      icon: 'alert-triangle',
      color: '#F59E0B',
      value: metricsData.lowStockItems?.value || 0,
      change: metricsData.lowStockItems?.change || 0,
      inverted: true,
      gradient: { from: '#F59E0B', to: '#D97706' }
    },
    {
      key: 'inventoryValue',
      title: 'Inventory Value',
      icon: 'package',
      color: '#8B5CF6',
      value: formatCurrency(metricsData.inventoryValue?.value || 0),
      change: metricsData.inventoryValue?.change || 0,
      gradient: { from: '#8B5CF6', to: '#7C3AED' }
    },
    {
      key: 'avgOrderValue',
      title: 'Avg Order Value',
      icon: 'credit-card',
      color: '#06B6D4',
      value: formatCurrency(metricsData.avgOrderValue?.value || 0),
      change: metricsData.avgOrderValue?.change || 0,
      gradient: { from: '#06B6D4', to: '#0891B2' }
    },
    {
      key: 'conversionRate',
      title: 'Conversion Rate',
      icon: 'target',
      color: '#84CC16',
      value: `${metricsData.conversionRate?.value || 0}%`,
      change: metricsData.conversionRate?.change || 0,
      gradient: { from: '#84CC16', to: '#65A30D' }
    }
  ];

  return (
    <MetricsContainer>
      <Header>
        <Title>
          <Icon name="activity" size={20} color="primary" />
          <div>
            <Typography variant="h6" weight="semibold">
              Real-time Metrics
            </Typography>
            <Typography variant="caption" color="secondary">
              Live dashboard with automatic updates
            </Typography>
          </div>
        </Title>
        
        <Controls>
          <StatusIndicator>
            <LiveDot
              animate={{ scale: isLive ? [1, 1.2, 1] : 1, opacity: isLive ? 1 : 0.5 }}
              transition={{ duration: 1, repeat: isLive ? Infinity : 0 }}
            />
            <Typography variant="caption" color="success">
              {isLive ? 'Live' : 'Paused'}
            </Typography>
          </StatusIndicator>
          
          <RefreshButton onClick={handleRefresh} disabled={refreshing}>
            <Icon name="refresh" size={14} />
            <Typography variant="caption">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Typography>
          </RefreshButton>
          
          <Typography variant="caption" color="secondary">
            Last update: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </Controls>
      </Header>

      {/* Metrics Grid */}
      <MetricsGrid>
        <AnimatePresence mode="wait">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.key}
              accentColor={metric.color}
              gradient={metric.gradient}
              initial={animate ? { opacity: 0, y: 20 } : false}
              animate={animate ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <MetricHeader>
                <MetricInfo>
                  <MetricIcon color={metric.color}>
                    <Icon name={metric.icon} size={20} color={metric.color} />
                  </MetricIcon>
                  <div>
                    <Typography variant="caption" color="secondary">
                      {metric.title}
                    </Typography>
                  </div>
                </MetricInfo>
                {metricsData[metric.key]?.history && (
                  <MiniChart>
                    <MiniChartSVG viewBox="0 0 60 30">
                      <MiniChartPath 
                        d={generateMiniChartPath(metricsData[metric.key].history)}
                        color={metric.color}
                      />
                    </MiniChartSVG>
                  </MiniChart>
                )}
              </MetricHeader>
              
              <MetricValue>
                <Typography variant="h4" weight="bold">
                  {metric.value}
                </Typography>
              </MetricValue>
              
              <MetricChange>
                <ChangeIndicator color={getChangeColor(metric.change, metric.inverted)}>
                  <Icon 
                    name={getChangeIcon(metric.change)} 
                    size={12} 
                    color={getChangeColor(metric.change, metric.inverted)} 
                  />
                  <Typography 
                    variant="caption" 
                    weight="medium"
                    style={{ color: getChangeColor(metric.change, metric.inverted) }}
                  >
                    {formatPercentage(metric.change)}
                  </Typography>
                </ChangeIndicator>
                
                <Typography variant="caption" color="secondary">
                  vs last hour
                </Typography>
              </MetricChange>
            </MetricCard>
          ))}
        </AnimatePresence>
      </MetricsGrid>

      {/* Recent Alerts */}
      <AlertsSection>
        <AlertsHeader>
          <Typography variant="h6" weight="semibold">
            Recent Alerts
          </Typography>
          <Badge variant="error" size="sm">
            {alerts.filter(a => a.severity === 'high').length} High Priority
          </Badge>
        </AlertsHeader>
        
        <AlertsList>
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <AlertItem
                key={alert.id}
                severity={alert.severity}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AlertIcon 
                  color={alert.severity === 'high' ? '#EF4444' : 
                         alert.severity === 'medium' ? '#F59E0B' : '#3B82F6'}
                >
                  <Icon 
                    name={alert.icon} 
                    size={12} 
                    color="white" 
                  />
                </AlertIcon>
                
                <AlertContent>
                  <Typography variant="body2" weight="medium">
                    {alert.message}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {alert.time}
                  </Typography>
                </AlertContent>
              </AlertItem>
            ))}
          </AnimatePresence>
        </AlertsList>
      </AlertsSection>

      {/* Activity Feed */}
      <ActivityFeed>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '12px' }}>
          Recent Activity
        </Typography>
        
        <ActivityList>
          <AnimatePresence>
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ActivityDot 
                  color={activity.type === 'order' ? '#10B981' : 
                         activity.type === 'inventory' ? '#3B82F6' :
                         activity.type === 'price' ? '#F59E0B' : '#8B5CF6'}
                />
                
                <div style={{ flex: 1 }}>
                  <Typography variant="body2">
                    {activity.message}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {activity.time}
                  </Typography>
                </div>
              </ActivityItem>
            ))}
          </AnimatePresence>
        </ActivityList>
      </ActivityFeed>
    </MetricsContainer>
  );
};

export default RealTimeMetrics;