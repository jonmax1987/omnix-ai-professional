import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  Download,
  RefreshCcw,
  Search,
  Target,
  Star,
  ArrowUp,
  ArrowDown,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';

import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Spinner from '../atoms/Spinner';
import Icon from '../atoms/Icon';

const CustomerAnalyticsContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  padding: ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.spacing[3]};
  box-shadow: ${props => props.theme.shadows.lg};
  max-width: 100%;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[6]};
  padding-bottom: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[6]};
  border-bottom: 2px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Tab = styled(motion.button)`
  background: none;
  border: none;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[2]} 0 0;
  color: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.text.secondary};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
  
  &:hover {
    color: ${props => props.theme.colors.primary[600]};
    background: ${props => props.theme.colors.primary[50]};
  }
  
  ${props => props.active && `
    background: ${props.theme.colors.primary[50]};
    border-bottom: 2px solid ${props.theme.colors.primary[600]};
    margin-bottom: -2px;
  `}
`;

const ContentContainer = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[6]};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const MetricCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || props.theme.colors.primary[500]};
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const MetricIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.positive ? props.theme.colors.success[600] : props.theme.colors.error[600]};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  h3 {
    margin: 0;
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const SegmentationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const SegmentCard = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const SegmentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const SegmentTitle = styled.h4`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const SegmentMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const SegmentMetric = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const CustomerAnalyticsDashboard = ({ onAnalyticsUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'segmentation', label: 'Segmentation', icon: Target },
    { id: 'lifecycle', label: 'Lifecycle', icon: Clock },
    { id: 'behavior', label: 'Behavior', icon: TrendingUp }
  ];

  // Mock data - in real app would come from API
  const customerMetrics = {
    totalCustomers: {
      value: '12,547',
      change: '+8.2%',
      positive: true,
      icon: Users,
      color: '#3B82F6'
    },
    activeCustomers: {
      value: '9,234',
      change: '+12.3%',
      positive: true,
      icon: UserCheck,
      color: '#10B981'
    },
    avgLifetimeValue: {
      value: '$2,847',
      change: '+5.7%',
      positive: true,
      icon: DollarSign,
      color: '#F59E0B'
    },
    churnRate: {
      value: '3.2%',
      change: '-0.8%',
      positive: true,
      icon: UserX,
      color: '#EF4444'
    }
  };

  const customerTrendData = [
    { month: 'Jan', customers: 8500, active: 6400, new: 450 },
    { month: 'Feb', customers: 9200, active: 7100, new: 520 },
    { month: 'Mar', customers: 9800, active: 7600, new: 480 },
    { month: 'Apr', customers: 10500, active: 8200, new: 590 },
    { month: 'May', customers: 11200, active: 8700, new: 620 },
    { month: 'Jun', customers: 11800, active: 9100, new: 580 },
    { month: 'Jul', customers: 12547, active: 9234, new: 650 }
  ];

  const segmentationData = [
    { name: 'High Value', value: 2847, color: '#10B981', count: 1254 },
    { name: 'Regular', value: 4523, color: '#3B82F6', count: 4523 },
    { name: 'Occasional', value: 3856, color: '#F59E0B', count: 3856 },
    { name: 'At Risk', value: 2067, color: '#EF4444', count: 2067 }
  ];

  const customerSegments = [
    {
      id: 'high-value',
      name: 'High Value Customers',
      count: 1254,
      percentage: 12.3,
      avgValue: '$4,200',
      retention: '94%',
      growth: '+15.2%',
      color: '#10B981'
    },
    {
      id: 'regular',
      name: 'Regular Customers',
      count: 4523,
      percentage: 36.1,
      avgValue: '$1,850',
      retention: '87%',
      growth: '+8.7%',
      color: '#3B82F6'
    },
    {
      id: 'occasional',
      name: 'Occasional Buyers',
      count: 3856,
      percentage: 30.7,
      avgValue: '$680',
      retention: '65%',
      growth: '+3.2%',
      color: '#F59E0B'
    },
    {
      id: 'at-risk',
      name: 'At Risk Customers',
      count: 2067,
      percentage: 16.5,
      avgValue: '$420',
      retention: '42%',
      growth: '-12.4%',
      color: '#EF4444'
    },
    {
      id: 'new',
      name: 'New Customers',
      count: 847,
      percentage: 6.8,
      avgValue: '$320',
      retention: '78%',
      growth: '+28.9%',
      color: '#8B5CF6'
    },
    {
      id: 'vip',
      name: 'VIP Customers',
      count: 234,
      percentage: 1.9,
      avgValue: '$8,500',
      retention: '98%',
      growth: '+22.1%',
      color: '#F59E0B'
    }
  ];

  const lifecycleData = [
    { stage: 'Prospect', count: 2547, conversion: '24%' },
    { stage: 'New Customer', count: 1847, conversion: '78%' },
    { stage: 'Active Customer', count: 6234, conversion: '85%' },
    { stage: 'Loyal Customer', count: 1854, conversion: '94%' },
    { stage: 'Champion', count: 465, conversion: '98%' }
  ];

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        handleRefresh();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setLoading(false);
    
    if (onAnalyticsUpdate) {
      onAnalyticsUpdate({
        type: 'customer_analytics_refreshed',
        timestamp: new Date(),
        metrics: customerMetrics
      });
    }
  };

  const handleExport = () => {
    const exportData = {
      metrics: customerMetrics,
      trends: customerTrendData,
      segments: customerSegments,
      lifecycle: lifecycleData,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <>
      <MetricsGrid>
        {Object.entries(customerMetrics).map(([key, metric]) => {
          const IconComponent = metric.icon;
          return (
            <MetricCard
              key={key}
              color={metric.color}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MetricHeader>
                <MetricIcon color={metric.color}>
                  <IconComponent size={24} />
                </MetricIcon>
                <MetricChange positive={metric.positive}>
                  {metric.positive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {metric.change}
                </MetricChange>
              </MetricHeader>
              <MetricValue>{metric.value}</MetricValue>
              <Typography variant="caption" color="secondary">
                {key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
              </Typography>
            </MetricCard>
          );
        })}
      </MetricsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartHeader>
            <h3>Customer Growth Trends</h3>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={customerTrendData}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="customers" 
                stroke="#3B82F6" 
                fill="url(#totalGradient)" 
                strokeWidth={2}
                name="Total Customers"
              />
              <Area 
                type="monotone" 
                dataKey="active" 
                stroke="#10B981" 
                fill="url(#activeGradient)" 
                strokeWidth={2}
                name="Active Customers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartHeader>
            <h3>Customer Distribution</h3>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={segmentationData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {segmentationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>
    </>
  );

  const renderSegmentation = () => (
    <SegmentationGrid>
      {customerSegments.map(segment => (
        <SegmentCard key={segment.id}>
          <SegmentHeader>
            <SegmentTitle>{segment.name}</SegmentTitle>
            <Badge 
              variant={segment.growth.startsWith('+') ? 'success' : 'error'} 
              size="sm"
            >
              {segment.growth}
            </Badge>
          </SegmentHeader>
          
          <SegmentMetrics>
            <SegmentMetric>
              <span>Customers</span>
              <strong>{segment.count.toLocaleString()}</strong>
            </SegmentMetric>
            <SegmentMetric>
              <span>Percentage</span>
              <strong>{segment.percentage}%</strong>
            </SegmentMetric>
            <SegmentMetric>
              <span>Avg Value</span>
              <strong>{segment.avgValue}</strong>
            </SegmentMetric>
            <SegmentMetric>
              <span>Retention</span>
              <strong>{segment.retention}</strong>
            </SegmentMetric>
          </SegmentMetrics>
        </SegmentCard>
      ))}
    </SegmentationGrid>
  );

  const renderLifecycle = () => (
    <ChartCard>
      <ChartHeader>
        <h3>Customer Lifecycle Analysis</h3>
      </ChartHeader>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={lifecycleData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" stroke="#6B7280" />
          <YAxis type="category" dataKey="stage" stroke="#6B7280" width={120} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey="count" 
            fill="#3B82F6" 
            radius={[0, 4, 4, 0]}
            name="Customer Count"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  const renderBehavior = () => (
    <ChartCard>
      <ChartHeader>
        <h3>Customer Behavior Patterns</h3>
      </ChartHeader>
      <div style={{ display: 'grid', gap: '24px' }}>
        <Typography variant="body1" color="secondary">
          Advanced behavioral analytics coming soon. This will include:
        </Typography>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            'Purchase frequency analysis',
            'Seasonal buying patterns',
            'Product affinity mapping',
            'Channel preference tracking',
            'Engagement scoring',
            'Predictive behavior models'
          ].map((feature, index) => (
            <div key={index} style={{ 
              padding: '12px', 
              background: '#F3F4F6', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Icon name="check" size={16} color="#10B981" />
              <Typography variant="caption">{feature}</Typography>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'segmentation':
        return renderSegmentation();
      case 'lifecycle':
        return renderLifecycle();
      case 'behavior':
        return renderBehavior();
      default:
        return renderOverview();
    }
  };

  return (
    <CustomerAnalyticsContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="h3" weight="bold" color="primary">
              Customer Analytics
            </Typography>
            <Badge variant="info" size="sm">
              <Icon name="users" size={12} />
              Live Data
            </Badge>
          </div>
          <Typography variant="body2" color="secondary">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant="caption" color="tertiary">
              Auto-refresh: {autoRefresh ? 'On' : 'Off'}
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Icon name="settings" size={16} />
            </Button>
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <Spinner size={16} />
            ) : (
              <RefreshCcw size={16} />
            )}
            Refresh
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
          >
            <Download size={16} />
            Export
          </Button>
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </HeaderRight>
      </Header>

      <TabsContainer>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconComponent size={16} />
                {tab.label}
              </div>
            </Tab>
          );
        })}
      </TabsContainer>

      <ContentContainer>
        {renderTabContent()}
      </ContentContainer>
    </CustomerAnalyticsContainer>
  );
};

export default CustomerAnalyticsDashboard;