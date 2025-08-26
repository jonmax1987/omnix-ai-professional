import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Eye } from 'lucide-react';

const AnalysisContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.surface.secondary};
  color: ${({ isActive, theme }) => 
    isActive ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isActive, theme }) => 
      isActive ? theme.colors.primary.dark : theme.colors.neutral.hover};
    transform: translateY(-1px);
  }
`;

const MetricsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MetricValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success.main : theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ChartTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
`;

const ChartOptions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ChartOption = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.light : 'transparent'};
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.dark : theme.colors.text.secondary};
  border: 1px solid ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.light : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral.hover};
  }
`;

const InsightsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InsightCard = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const InsightTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const InsightList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const InsightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  &:before {
    content: '•';
    color: ${({ theme }) => theme.colors.primary.main};
    font-weight: bold;
    margin-top: 2px;
  }
`;

const RevenueTrendAnalysis = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('line');
  const [categoryView, setCategoryView] = useState('total');

  const revenueData = useMemo(() => {
    const generateData = (days) => {
      return Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        const baseRevenue = 25000 + Math.random() * 10000;
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.round(baseRevenue),
          groceries: Math.round(baseRevenue * 0.4),
          electronics: Math.round(baseRevenue * 0.25),
          clothing: Math.round(baseRevenue * 0.2),
          other: Math.round(baseRevenue * 0.15),
          forecast: Math.round(baseRevenue * (1 + (Math.random() - 0.5) * 0.2))
        };
      });
    };

    switch (timeRange) {
      case 'week':
        return generateData(7);
      case 'month':
        return generateData(30);
      case 'quarter':
        return generateData(90);
      default:
        return generateData(30);
    }
  }, [timeRange]);

  const categoryBreakdown = useMemo(() => [
    { name: 'Groceries', value: 42, color: '#4F46E5' },
    { name: 'Electronics', value: 25, color: '#10B981' },
    { name: 'Clothing', value: 18, color: '#F59E0B' },
    { name: 'Home & Garden', value: 10, color: '#EF4444' },
    { name: 'Other', value: 5, color: '#8B5CF6' }
  ], []);

  const metrics = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const avgRevenue = totalRevenue / revenueData.length;
    const previousPeriodRevenue = totalRevenue * 0.92;
    const growth = ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;

    return {
      total: {
        value: `$${(totalRevenue / 1000).toFixed(1)}K`,
        change: growth,
        label: 'Total Revenue'
      },
      average: {
        value: `$${(avgRevenue / 1000).toFixed(1)}K`,
        change: 5.2,
        label: 'Daily Average'
      },
      peak: {
        value: `$${(Math.max(...revenueData.map(d => d.revenue)) / 1000).toFixed(1)}K`,
        change: 12.8,
        label: 'Peak Day'
      },
      growth: {
        value: `${growth.toFixed(1)}%`,
        change: growth,
        label: 'Growth Rate'
      }
    };
  }, [revenueData]);

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Legend />
            {categoryView === 'total' ? (
              <>
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  name="Actual Revenue"
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="AI Forecast"
                  dot={{ r: 3 }}
                />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="groceries" stroke="#4F46E5" name="Groceries" />
                <Line type="monotone" dataKey="electronics" stroke="#10B981" name="Electronics" />
                <Line type="monotone" dataKey="clothing" stroke="#F59E0B" name="Clothing" />
                <Line type="monotone" dataKey="other" stroke="#8B5CF6" name="Other" />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Legend />
            {categoryView === 'total' ? (
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4F46E5" 
                fill="#4F46E5"
                fillOpacity={0.3}
                name="Revenue"
              />
            ) : (
              <>
                <Area type="monotone" dataKey="groceries" stackId="1" stroke="#4F46E5" fill="#4F46E5" />
                <Area type="monotone" dataKey="electronics" stackId="1" stroke="#10B981" fill="#10B981" />
                <Area type="monotone" dataKey="clothing" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                <Area type="monotone" dataKey="other" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Legend />
            {categoryView === 'total' ? (
              <Bar dataKey="revenue" fill="#4F46E5" name="Revenue" />
            ) : (
              <>
                <Bar dataKey="groceries" stackId="a" fill="#4F46E5" />
                <Bar dataKey="electronics" stackId="a" fill="#10B981" />
                <Bar dataKey="clothing" stackId="a" fill="#F59E0B" />
                <Bar dataKey="other" stackId="a" fill="#8B5CF6" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <AnalysisContainer>
      <Header>
        <Title>
          <DollarSign size={24} />
          Revenue Trend Analysis
        </Title>
        <Controls>
          <ControlButton isActive={timeRange === 'week'} onClick={() => setTimeRange('week')}>
            <Calendar size={16} />
            7 Days
          </ControlButton>
          <ControlButton isActive={timeRange === 'month'} onClick={() => setTimeRange('month')}>
            <Calendar size={16} />
            30 Days
          </ControlButton>
          <ControlButton isActive={timeRange === 'quarter'} onClick={() => setTimeRange('quarter')}>
            <Calendar size={16} />
            90 Days
          </ControlButton>
          <ControlButton>
            <Filter size={16} />
            Filters
          </ControlButton>
          <ControlButton>
            <Download size={16} />
            Export
          </ControlButton>
        </Controls>
      </Header>

      <MetricsOverview>
        {Object.values(metrics).map((metric, index) => (
          <MetricCard key={index}>
            <MetricLabel>{metric.label}</MetricLabel>
            <MetricValue>{metric.value}</MetricValue>
            <MetricChange isPositive={metric.change > 0}>
              {metric.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(metric.change).toFixed(1)}% vs last period
            </MetricChange>
          </MetricCard>
        ))}
      </MetricsOverview>

      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Revenue Trends</ChartTitle>
          <ChartOptions>
            <ChartOption isActive={chartType === 'line'} onClick={() => setChartType('line')}>
              Line
            </ChartOption>
            <ChartOption isActive={chartType === 'area'} onClick={() => setChartType('area')}>
              Area
            </ChartOption>
            <ChartOption isActive={chartType === 'bar'} onClick={() => setChartType('bar')}>
              Bar
            </ChartOption>
            <span style={{ width: '1px', background: '#E5E7EB', margin: '0 8px' }} />
            <ChartOption isActive={categoryView === 'total'} onClick={() => setCategoryView('total')}>
              Total
            </ChartOption>
            <ChartOption isActive={categoryView === 'category'} onClick={() => setCategoryView('category')}>
              By Category
            </ChartOption>
          </ChartOptions>
        </ChartHeader>
        {renderChart()}
      </ChartContainer>

      <InsightsSection>
        <InsightCard>
          <InsightTitle>Key Revenue Insights</InsightTitle>
          <InsightList>
            <InsightItem>
              Weekend sales consistently 35% higher than weekday average
            </InsightItem>
            <InsightItem>
              Morning hours (8-11 AM) generate 42% of daily revenue
            </InsightItem>
            <InsightItem>
              Premium product sales increased by 23% this period
            </InsightItem>
            <InsightItem>
              Promotional campaigns drove 18% revenue uplift on targeted days
            </InsightItem>
          </InsightList>
        </InsightCard>

        <InsightCard>
          <InsightTitle>Category Performance</InsightTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <InsightList style={{ marginTop: '16px' }}>
            {categoryBreakdown.map((category, index) => (
              <InsightItem key={index} style={{ '&:before': { color: category.color } }}>
                {category.name}: {category.value}% of total revenue
              </InsightItem>
            ))}
          </InsightList>
        </InsightCard>
      </InsightsSection>
    </AnalysisContainer>
  );
};

export default RevenueTrendAnalysis;