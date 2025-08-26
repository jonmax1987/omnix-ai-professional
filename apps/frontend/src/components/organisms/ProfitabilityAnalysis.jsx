import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Treemap,
  ComposedChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Percent, Target, Info, AlertCircle, ArrowUpRight } from 'lucide-react';

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

const ViewToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.main};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const ToggleButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : 'transparent'};
  color: ${({ isActive, theme }) => 
    isActive ? 'white' : theme.colors.text.secondary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isActive, theme }) => 
      isActive ? theme.colors.primary.dark : theme.colors.neutral.hover};
  }
`;

const ProfitMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MetricCard = styled.div`
  background: ${({ performance, theme }) => {
    if (performance === 'excellent') return `${theme.colors.success.light}10`;
    if (performance === 'good') return `${theme.colors.primary.light}10`;
    if (performance === 'poor') return `${theme.colors.error.light}10`;
    return theme.colors.background.main;
  }};
  border: 1px solid ${({ performance, theme }) => {
    if (performance === 'excellent') return theme.colors.success.light;
    if (performance === 'good') return theme.colors.primary.light;
    if (performance === 'poor') return theme.colors.error.light;
    return theme.colors.neutral.border;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MetricValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MetricTrend = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success.main : theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => columns === 1 ? '1fr' : `repeat(${columns}, 1fr)`};
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  grid-column: ${({ span }) => span ? `span ${span}` : 'auto'};
`;

const ChartTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CategoryTable = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};

  &:hover {
    background: ${({ theme }) => theme.colors.neutral.hover};
  }
`;

const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  background: ${({ theme }) => theme.colors.surface.secondary};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ProgressBar = styled.div`
  width: 100px;
  height: 8px;
  background: ${({ theme }) => theme.colors.neutral.light};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ value, theme }) => 
    value > 70 ? theme.colors.success.main :
    value > 40 ? theme.colors.warning.main :
    theme.colors.error.main};
  width: ${({ value }) => `${value}%`};
  transition: width 0.3s ease;
`;

const InsightCard = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary.light}10 0%, 
    ${({ theme }) => theme.colors.secondary.light}10 100%);
  border: 1px solid ${({ theme }) => theme.colors.primary.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InsightTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
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
    content: '→';
    color: ${({ theme }) => theme.colors.primary.main};
    font-weight: bold;
  }
`;

const ProfitabilityAnalysis = () => {
  const [viewMode, setViewMode] = useState('category');
  const [timeRange, setTimeRange] = useState('month');

  const profitMetrics = useMemo(() => [
    {
      label: 'Gross Profit Margin',
      value: '42.3%',
      trend: 2.1,
      target: 45,
      performance: 'good'
    },
    {
      label: 'Net Profit Margin',
      value: '18.7%',
      trend: -0.8,
      target: 20,
      performance: 'good'
    },
    {
      label: 'Operating Margin',
      value: '24.5%',
      trend: 1.5,
      target: 25,
      performance: 'excellent'
    },
    {
      label: 'EBITDA Margin',
      value: '31.2%',
      trend: 3.2,
      target: 30,
      performance: 'excellent'
    },
    {
      label: 'ROI',
      value: '156%',
      trend: 12.4,
      target: 150,
      performance: 'excellent'
    },
    {
      label: 'Cost Ratio',
      value: '57.7%',
      trend: -2.3,
      target: 55,
      performance: 'poor'
    }
  ], []);

  const categoryProfitability = useMemo(() => [
    { 
      category: 'Electronics',
      revenue: 450000,
      cost: 320000,
      profit: 130000,
      margin: 28.9,
      growth: 15.2
    },
    {
      category: 'Groceries',
      revenue: 380000,
      cost: 285000,
      profit: 95000,
      margin: 25.0,
      growth: 8.5
    },
    {
      category: 'Clothing',
      revenue: 290000,
      cost: 174000,
      profit: 116000,
      margin: 40.0,
      growth: 22.3
    },
    {
      category: 'Home & Garden',
      revenue: 210000,
      cost: 147000,
      profit: 63000,
      margin: 30.0,
      growth: -5.2
    },
    {
      category: 'Health & Beauty',
      revenue: 185000,
      cost: 111000,
      profit: 74000,
      margin: 40.0,
      growth: 18.7
    },
    {
      category: 'Sports',
      revenue: 145000,
      cost: 101500,
      profit: 43500,
      margin: 30.0,
      growth: 12.1
    }
  ], []);

  const profitTrend = useMemo(() => [
    { month: 'Jan', gross: 38.5, net: 15.2, operating: 22.1 },
    { month: 'Feb', gross: 39.2, net: 16.1, operating: 22.8 },
    { month: 'Mar', gross: 40.1, net: 17.2, operating: 23.5 },
    { month: 'Apr', gross: 41.3, net: 17.8, operating: 24.0 },
    { month: 'May', gross: 41.8, net: 18.3, operating: 24.2 },
    { month: 'Jun', gross: 42.3, net: 18.7, operating: 24.5 }
  ], []);

  const costBreakdown = useMemo(() => [
    { name: 'Cost of Goods', value: 45, color: '#EF4444' },
    { name: 'Operations', value: 18, color: '#F59E0B' },
    { name: 'Marketing', value: 12, color: '#10B981' },
    { name: 'Personnel', value: 15, color: '#4F46E5' },
    { name: 'Other', value: 10, color: '#8B5CF6' }
  ], []);

  const productProfitability = useMemo(() => [
    { name: 'Premium Electronics', size: 130000, fill: '#10B981' },
    { name: 'Designer Clothing', size: 95000, fill: '#4F46E5' },
    { name: 'Organic Groceries', size: 75000, fill: '#F59E0B' },
    { name: 'Beauty Products', size: 65000, fill: '#8B5CF6' },
    { name: 'Smart Home', size: 55000, fill: '#06B6D4' },
    { name: 'Fitness Equipment', size: 45000, fill: '#EC4899' },
    { name: 'Garden Supplies', size: 35000, fill: '#10B981' },
    { name: 'Others', size: 25000, fill: '#6B7280' }
  ], []);

  const radialData = useMemo(() => 
    categoryProfitability.map(cat => ({
      name: cat.category,
      margin: cat.margin,
      fill: cat.margin > 35 ? '#10B981' : cat.margin > 25 ? '#F59E0B' : '#EF4444'
    }))
  , [categoryProfitability]);

  return (
    <AnalysisContainer>
      <Header>
        <Title>
          <DollarSign size={24} />
          Profitability Analysis
        </Title>
        <ViewToggle>
          <ToggleButton 
            isActive={viewMode === 'category'} 
            onClick={() => setViewMode('category')}
          >
            By Category
          </ToggleButton>
          <ToggleButton 
            isActive={viewMode === 'product'} 
            onClick={() => setViewMode('product')}
          >
            By Product
          </ToggleButton>
          <ToggleButton 
            isActive={viewMode === 'trend'} 
            onClick={() => setViewMode('trend')}
          >
            Trends
          </ToggleButton>
        </ViewToggle>
      </Header>

      <ProfitMetricsGrid>
        {profitMetrics.map((metric, index) => (
          <MetricCard key={index} performance={metric.performance}>
            <MetricHeader>
              <MetricLabel>
                <Percent size={16} />
                {metric.label}
              </MetricLabel>
              <Info size={14} />
            </MetricHeader>
            <MetricValue>{metric.value}</MetricValue>
            <MetricTrend isPositive={metric.trend > 0}>
              {metric.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(metric.trend)}% vs last period
            </MetricTrend>
            <div style={{ marginTop: '8px' }}>
              <ProgressBar>
                <ProgressFill value={(parseFloat(metric.value) / metric.target) * 100} />
              </ProgressBar>
              <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>
                Target: {metric.target}%
              </div>
            </div>
          </MetricCard>
        ))}
      </ProfitMetricsGrid>

      <InsightCard>
        <InsightTitle>
          <AlertCircle size={18} />
          AI-Powered Profitability Insights
        </InsightTitle>
        <InsightList>
          <InsightItem>
            Electronics category showing strongest profit growth at 28.9% margin, exceeding target by 3.9%
          </InsightItem>
          <InsightItem>
            Clothing and Beauty categories demonstrate highest margins (40%), suggesting premium positioning opportunity
          </InsightItem>
          <InsightItem>
            Home & Garden showing -5.2% growth, requires immediate attention to reverse declining profitability
          </InsightItem>
          <InsightItem>
            Operating costs increased 2.3% - recommend automation to reduce personnel expenses by 15%
          </InsightItem>
        </InsightList>
      </InsightCard>

      <ChartGrid columns={2}>
        <ChartCard>
          <ChartTitle>
            <TrendingUp size={20} />
            Margin Trends
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="gross" stroke="#10B981" strokeWidth={2} name="Gross Margin %" />
              <Line type="monotone" dataKey="net" stroke="#4F46E5" strokeWidth={2} name="Net Margin %" />
              <Line type="monotone" dataKey="operating" stroke="#F59E0B" strokeWidth={2} name="Operating Margin %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <DollarSign size={20} />
            Cost Structure
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <ChartGrid columns={1}>
        <ChartCard>
          <ChartTitle>
            <BarChart size={20} />
            Category Profitability Comparison
          </ChartTitle>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={categoryProfitability}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#4F46E5" name="Revenue ($)" />
              <Bar yAxisId="left" dataKey="profit" fill="#10B981" name="Profit ($)" />
              <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#F59E0B" strokeWidth={2} name="Margin (%)" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <ChartGrid columns={2}>
        <ChartCard>
          <ChartTitle>
            <Target size={20} />
            Margin Performance by Category
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="100%" data={radialData}>
              <RadialBar dataKey="margin" cornerRadius={10} fill="#8884d8" />
              <Legend />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <ArrowUpRight size={20} />
            Product Profitability Map
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={productProfitability}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#8884d8"
            />
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <CategoryTable>
        <ChartTitle>
          <DollarSign size={20} />
          Detailed Category Analysis
        </ChartTitle>
        <Table>
          <thead>
            <tr>
              <TableHeader>Category</TableHeader>
              <TableHeader>Revenue</TableHeader>
              <TableHeader>Cost</TableHeader>
              <TableHeader>Profit</TableHeader>
              <TableHeader>Margin %</TableHeader>
              <TableHeader>Growth %</TableHeader>
              <TableHeader>Performance</TableHeader>
            </tr>
          </thead>
          <tbody>
            {categoryProfitability.map((cat, index) => (
              <TableRow key={index}>
                <TableCell style={{ fontWeight: 600 }}>{cat.category}</TableCell>
                <TableCell>${(cat.revenue / 1000).toFixed(0)}K</TableCell>
                <TableCell>${(cat.cost / 1000).toFixed(0)}K</TableCell>
                <TableCell style={{ color: '#10B981', fontWeight: 600 }}>
                  ${(cat.profit / 1000).toFixed(0)}K
                </TableCell>
                <TableCell>{cat.margin.toFixed(1)}%</TableCell>
                <TableCell style={{ 
                  color: cat.growth > 0 ? '#10B981' : '#EF4444',
                  fontWeight: 600 
                }}>
                  {cat.growth > 0 ? '+' : ''}{cat.growth}%
                </TableCell>
                <TableCell>
                  <ProgressBar>
                    <ProgressFill value={cat.margin * 2} />
                  </ProgressBar>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </CategoryTable>
    </AnalysisContainer>
  );
};

export default ProfitabilityAnalysis;