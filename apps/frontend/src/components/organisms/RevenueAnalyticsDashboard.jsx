import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Users, ShoppingCart, Target, AlertCircle, Download, Filter, RefreshCw, Zap } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const DashboardContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.primary};
  min-height: 100vh;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  h2 {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    margin-bottom: ${props => props.theme.spacing[2]};
  }
  
  p {
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.base};
    max-width: 500px;
  }
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

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary[50]};
    border-color: ${props => props.theme.colors.primary[200]};
    color: ${props => props.theme.colors.primary[700]};
  }
  
  &.primary {
    background: ${props => props.theme.colors.primary[600]};
    border-color: ${props => props.theme.colors.primary[600]};
    color: ${props => props.theme.colors.white};
    
    &:hover {
      background: ${props => props.theme.colors.primary[700]};
      border-color: ${props => props.theme.colors.primary[700]};
    }
  }
  
  &.refreshing {
    animation: ${pulse} 1s infinite;
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const KpiCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.status) {
        case 'positive': return props.theme.colors.green[500];
        case 'negative': return props.theme.colors.red[500];
        case 'warning': return props.theme.colors.yellow[500];
        default: return props.theme.colors.blue[500];
      }
    }};
  }
`;

const KpiHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const KpiIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => {
    switch (props.status) {
      case 'positive': return props.theme.colors.green[100];
      case 'negative': return props.theme.colors.red[100];
      case 'warning': return props.theme.colors.yellow[100];
      default: return props.theme.colors.blue[100];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'positive': return props.theme.colors.green[600];
      case 'negative': return props.theme.colors.red[600];
      case 'warning': return props.theme.colors.yellow[600];
      default: return props.theme.colors.blue[600];
    }
  }};
`;

const KpiTitle = styled.h3`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin: 0;
`;

const KpiValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: ${props => props.theme.spacing[2]} 0;
`;

const KpiChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => {
    switch (props.status) {
      case 'positive': return props.theme.colors.green[600];
      case 'negative': return props.theme.colors.red[600];
      case 'warning': return props.theme.colors.yellow[600];
      default: return props.theme.colors.text.secondary;
    }
  }};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  animation: ${fadeIn} 0.6s ease-out;
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  h3 {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin: 0;
  }
`;

const ChartContainer = styled.div`
  height: 350px;
  
  .recharts-wrapper {
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
  
  .recharts-tooltip-wrapper {
    .recharts-default-tooltip {
      background: ${props => props.theme.colors.background.elevated} !important;
      border: 1px solid ${props => props.theme.colors.border.subtle} !important;
      border-radius: ${props => props.theme.spacing[2]} !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
    }
  }
`;

const TimeFilter = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
`;

const TimeFilterButton = styled.button`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? props.theme.colors.primary[600] : 'transparent'};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[700] : props.theme.colors.primary[50]};
    color: ${props => props.active ? props.theme.colors.white : props.theme.colors.primary[700]};
  }
`;

const InsightsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const InsightCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  animation: ${fadeIn} 0.6s ease-out;
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const InsightIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.primary[100]};
  color: ${props => props.theme.colors.primary[600]};
`;

const InsightTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin: 0;
`;

const InsightList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InsightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InsightBullet = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary[500]};
  margin-top: 6px;
  flex-shrink: 0;
`;

const InsightText = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.5;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[1]};
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const RevenueAnalyticsDashboard = ({ onAnalyticsUpdate, onClose }) => {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock real-time revenue data
  const revenueData = useMemo(() => {
    const generateTimeSeriesData = (days) => {
      const data = [];
      const baseRevenue = 12500;
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Simulate revenue with trends and seasonality
        const dayOfWeek = date.getDay();
        const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.15 : 1.0;
        const trendFactor = 1 + (days - i) * 0.005; // Growth trend
        const randomFactor = 0.8 + Math.random() * 0.4;
        
        const revenue = baseRevenue * weekendBoost * trendFactor * randomFactor;
        const orders = Math.floor(revenue / 25 + Math.random() * 100);
        const customers = Math.floor(orders * 0.7 + Math.random() * 50);
        
        data.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.round(revenue),
          orders,
          customers,
          avgOrderValue: Math.round(revenue / orders * 100) / 100
        });
      }
      return data;
    };

    const days = timeFilter === '24h' ? 1 : timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    return generateTimeSeriesData(days);
  }, [timeFilter]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (revenueData.length === 0) return {};
    
    const current = revenueData[revenueData.length - 1];
    const previous = revenueData.length > 1 ? revenueData[revenueData.length - 2] : current;
    
    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);
    const totalCustomers = revenueData.reduce((sum, d) => sum + d.customers, 0);
    const avgOrderValue = totalRevenue / totalOrders;
    
    const revenueChange = ((current.revenue - previous.revenue) / previous.revenue) * 100;
    const ordersChange = ((current.orders - previous.orders) / previous.orders) * 100;
    const customersChange = ((current.customers - previous.customers) / previous.customers) * 100;
    const aovChange = ((current.avgOrderValue - previous.avgOrderValue) / previous.avgOrderValue) * 100;
    
    return {
      totalRevenue: {
        value: totalRevenue,
        change: revenueChange,
        status: revenueChange > 0 ? 'positive' : revenueChange < -5 ? 'negative' : 'warning'
      },
      totalOrders: {
        value: totalOrders,
        change: ordersChange,
        status: ordersChange > 0 ? 'positive' : ordersChange < -5 ? 'negative' : 'warning'
      },
      totalCustomers: {
        value: totalCustomers,
        change: customersChange,
        status: customersChange > 0 ? 'positive' : customersChange < -5 ? 'negative' : 'warning'
      },
      avgOrderValue: {
        value: avgOrderValue,
        change: aovChange,
        status: aovChange > 0 ? 'positive' : aovChange < -5 ? 'negative' : 'warning'
      }
    };
  }, [revenueData]);

  // Revenue distribution by category (mock data)
  const categoryData = useMemo(() => [
    { name: 'Electronics', value: 35, amount: 4375, color: '#3b82f6' },
    { name: 'Groceries', value: 28, amount: 3500, color: '#10b981' },
    { name: 'Clothing', value: 20, amount: 2500, color: '#f59e0b' },
    { name: 'Home & Garden', value: 12, amount: 1500, color: '#ef4444' },
    { name: 'Books', value: 5, amount: 625, color: '#8b5cf6' }
  ], []);

  // AI-generated insights
  const insights = useMemo(() => [
    "Revenue increased by 12.5% this week, driven by strong weekend performance",
    "Electronics category shows highest growth with 18% increase in average order value",
    "Customer acquisition cost decreased by 8% while retention rate improved to 73%",
    "Peak sales hours are between 7-9 PM, suggesting optimal timing for promotions",
    "Mobile transactions now account for 68% of total revenue, up from 61% last month"
  ], []);

  const trends = useMemo(() => [
    "Seasonal trend shows 15% revenue increase expected for next month",
    "Weekend sales consistently outperform weekdays by 22% on average",
    "New customer conversion rate improved by 5.2% after recent UI updates",
    "Cross-sell opportunities increased revenue per customer by $23 on average"
  ], []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRefreshing(false);
    
    onAnalyticsUpdate?.({
      type: 'refresh',
      timestamp: new Date(),
      metrics: kpis
    });
  }, [kpis, onAnalyticsUpdate]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeFilter,
      kpis,
      revenueData,
      categoryData,
      insights,
      trends
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-analytics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onAnalyticsUpdate?.({
      type: 'export',
      format: 'json',
      timestamp: new Date()
    });
  }, [timeFilter, kpis, revenueData, categoryData, insights, trends, onAnalyticsUpdate]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        handleRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [handleRefresh, isRefreshing]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  const timeFilters = [
    { key: '24h', label: '24h' },
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
    { key: '90d', label: '90d' }
  ];

  return (
    <DashboardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {onClose && (
        <CloseButton onClick={onClose}>
          ✕
        </CloseButton>
      )}

      <Header>
        <HeaderLeft>
          <h2>
            <DollarSign />
            Revenue Analytics Dashboard
          </h2>
          <p>
            Real-time revenue tracking and insights powered by AI analytics. Monitor performance metrics, trends, and growth opportunities across all channels.
          </p>
        </HeaderLeft>
        
        <HeaderRight>
          <TimeFilter>
            {timeFilters.map(filter => (
              <TimeFilterButton
                key={filter.key}
                active={timeFilter === filter.key}
                onClick={() => setTimeFilter(filter.key)}
              >
                {filter.label}
              </TimeFilterButton>
            ))}
          </TimeFilter>
          
          <ActionButton 
            onClick={handleRefresh}
            className={isRefreshing ? 'refreshing' : ''}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </ActionButton>
          
          <ActionButton onClick={handleExport}>
            <Download size={16} />
            Export
          </ActionButton>
        </HeaderRight>
      </Header>

      {/* KPI Cards */}
      <KpiGrid>
        <KpiCard status={kpis.totalRevenue?.status}>
          <KpiHeader>
            <KpiTitle>Total Revenue</KpiTitle>
            <KpiIcon status={kpis.totalRevenue?.status}>
              <DollarSign size={24} />
            </KpiIcon>
          </KpiHeader>
          <KpiValue>{formatCurrency(kpis.totalRevenue?.value || 0)}</KpiValue>
          <KpiChange status={kpis.totalRevenue?.status}>
            {kpis.totalRevenue?.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(kpis.totalRevenue?.change || 0).toFixed(1)}% vs previous period
          </KpiChange>
        </KpiCard>

        <KpiCard status={kpis.totalOrders?.status}>
          <KpiHeader>
            <KpiTitle>Total Orders</KpiTitle>
            <KpiIcon status={kpis.totalOrders?.status}>
              <ShoppingCart size={24} />
            </KpiIcon>
          </KpiHeader>
          <KpiValue>{formatNumber(kpis.totalOrders?.value || 0)}</KpiValue>
          <KpiChange status={kpis.totalOrders?.status}>
            {kpis.totalOrders?.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(kpis.totalOrders?.change || 0).toFixed(1)}% vs previous period
          </KpiChange>
        </KpiCard>

        <KpiCard status={kpis.totalCustomers?.status}>
          <KpiHeader>
            <KpiTitle>Active Customers</KpiTitle>
            <KpiIcon status={kpis.totalCustomers?.status}>
              <Users size={24} />
            </KpiIcon>
          </KpiHeader>
          <KpiValue>{formatNumber(kpis.totalCustomers?.value || 0)}</KpiValue>
          <KpiChange status={kpis.totalCustomers?.status}>
            {kpis.totalCustomers?.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(kpis.totalCustomers?.change || 0).toFixed(1)}% vs previous period
          </KpiChange>
        </KpiCard>

        <KpiCard status={kpis.avgOrderValue?.status}>
          <KpiHeader>
            <KpiTitle>Avg Order Value</KpiTitle>
            <KpiIcon status={kpis.avgOrderValue?.status}>
              <Target size={24} />
            </KpiIcon>
          </KpiHeader>
          <KpiValue>{formatCurrency(kpis.avgOrderValue?.value || 0)}</KpiValue>
          <KpiChange status={kpis.avgOrderValue?.status}>
            {kpis.avgOrderValue?.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(kpis.avgOrderValue?.change || 0).toFixed(1)}% vs previous period
          </KpiChange>
        </KpiCard>
      </KpiGrid>

      {/* Charts */}
      <ChartsGrid>
        <ChartCard>
          <ChartHeader>
            <h3>
              <TrendingUp />
              Revenue Trends
            </h3>
          </ChartHeader>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                    name === 'revenue' ? 'Revenue' : 
                    name === 'orders' ? 'Orders' : 
                    name === 'customers' ? 'Customers' : name
                  ]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard>
          <ChartHeader>
            <h3>Revenue by Category</h3>
          </ChartHeader>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% (${formatCurrency(props.payload.amount)})`,
                    'Share'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </ChartsGrid>

      {/* AI Insights */}
      <InsightsSection>
        <InsightCard>
          <InsightHeader>
            <InsightIcon>
              <Zap size={20} />
            </InsightIcon>
            <InsightTitle>AI Insights</InsightTitle>
          </InsightHeader>
          <InsightList>
            {insights.map((insight, index) => (
              <InsightItem key={index}>
                <InsightBullet />
                <InsightText>{insight}</InsightText>
              </InsightItem>
            ))}
          </InsightList>
        </InsightCard>

        <InsightCard>
          <InsightHeader>
            <InsightIcon>
              <TrendingUp size={20} />
            </InsightIcon>
            <InsightTitle>Trend Analysis</InsightTitle>
          </InsightHeader>
          <InsightList>
            {trends.map((trend, index) => (
              <InsightItem key={index}>
                <InsightBullet />
                <InsightText>{trend}</InsightText>
              </InsightItem>
            ))}
          </InsightList>
        </InsightCard>
      </InsightsSection>
    </DashboardContainer>
  );
};

export default RevenueAnalyticsDashboard;