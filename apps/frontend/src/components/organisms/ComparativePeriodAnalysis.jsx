import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  LineChart,
  BarChart,
  Cell
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, BarChart3, Percent, Target } from 'lucide-react';

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

const PeriodSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.main};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const PeriodButton = styled.button`
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

const ComparisonCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ComparisonCard = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
  flex: 1;
`;

const PeriodLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  background: ${({ theme }) => theme.colors.surface.secondary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const MetricComparison = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MetricValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const CurrentValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const PreviousValue = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: line-through;
`;

const ChangeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success.main : theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns}, 1fr)`};
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
`;

const PerformanceTable = styled.div`
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

const TrendBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ trend, theme }) => 
    trend === 'up' ? `${theme.colors.success.light}20` :
    trend === 'down' ? `${theme.colors.error.light}20` :
    `${theme.colors.neutral.light}20`};
  color: ${({ trend, theme }) => 
    trend === 'up' ? theme.colors.success.main :
    trend === 'down' ? theme.colors.error.main :
    theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const InsightsPanel = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary.light}08 0%, 
    ${({ theme }) => theme.colors.secondary.light}08 100%);
  border: 1px solid ${({ theme }) => theme.colors.primary.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InsightsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const InsightsList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const InsightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.6;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  &:before {
    content: '📊';
    margin-right: ${({ theme }) => theme.spacing.xs};
  }
`;

const ComparativePeriodAnalysis = () => {
  const [comparisonPeriod, setComparisonPeriod] = useState('month');

  const comparisonMetrics = useMemo(() => [
    {
      title: 'Total Revenue',
      current: '$847K',
      previous: '$732K',
      change: 15.7,
      period: 'vs last month'
    },
    {
      title: 'Customer Count',
      current: '4,326',
      previous: '3,892',
      change: 11.2,
      period: 'vs last month'
    },
    {
      title: 'Average Order',
      current: '$196',
      previous: '$188',
      change: 4.3,
      period: 'vs last month'
    },
    {
      title: 'Conversion Rate',
      current: '3.8%',
      previous: '3.2%',
      change: 18.8,
      period: 'vs last month'
    },
    {
      title: 'Profit Margin',
      current: '24.5%',
      previous: '22.1%',
      change: 10.9,
      period: 'vs last month'
    },
    {
      title: 'Customer Satisfaction',
      current: '4.7/5',
      previous: '4.4/5',
      change: 6.8,
      period: 'vs last month'
    }
  ], []);

  const periodComparison = useMemo(() => [
    { period: 'Week 1', current: 198000, previous: 165000, growth: 20.0 },
    { period: 'Week 2', current: 212000, previous: 178000, growth: 19.1 },
    { period: 'Week 3', current: 205000, previous: 192000, growth: 6.8 },
    { period: 'Week 4', current: 232000, previous: 197000, growth: 17.8 },
  ], []);

  const categoryPerformance = useMemo(() => [
    { 
      category: 'Electronics',
      currentRevenue: 145000,
      previousRevenue: 125000,
      growth: 16.0,
      currentOrders: 387,
      previousOrders: 342,
      orderGrowth: 13.2
    },
    {
      category: 'Groceries',
      currentRevenue: 198000,
      previousRevenue: 185000,
      growth: 7.0,
      currentOrders: 1245,
      previousOrders: 1187,
      orderGrowth: 4.9
    },
    {
      category: 'Clothing',
      currentRevenue: 132000,
      previousRevenue: 118000,
      growth: 11.9,
      currentOrders: 295,
      previousOrders: 278,
      orderGrowth: 6.1
    },
    {
      category: 'Home & Garden',
      currentRevenue: 89000,
      previousRevenue: 95000,
      growth: -6.3,
      currentOrders: 187,
      previousOrders: 203,
      orderGrowth: -7.9
    },
    {
      category: 'Sports',
      currentRevenue: 67000,
      previousRevenue: 62000,
      growth: 8.1,
      currentOrders: 156,
      previousOrders: 148,
      orderGrowth: 5.4
    }
  ], []);

  const timeSeriesComparison = useMemo(() => [
    { date: 'Jan', current: 245000, previous: 198000, forecast: 265000 },
    { date: 'Feb', current: 268000, previous: 215000, forecast: 285000 },
    { date: 'Mar', current: 295000, previous: 248000, forecast: 312000 },
    { date: 'Apr', current: 324000, previous: 275000, forecast: 342000 },
    { date: 'May', current: 356000, previous: 298000, forecast: 375000 },
    { date: 'Jun', current: 387000, previous: 325000, forecast: 405000 }
  ], []);

  const insights = useMemo(() => [
    "Revenue growth of 15.7% exceeds industry average of 8.2%, indicating strong market performance",
    "Customer acquisition rate increased 11.2%, with 434 new customers acquired this month",
    "Average order value improved by $8, primarily driven by premium product sales growth",
    "Electronics category showing strongest growth at 16%, while Home & Garden declining 6.3%",
    "Weekend sales performance 23% better than weekdays, suggesting opportunity for targeted marketing",
    "Customer retention rate at 94.2%, up from 91.8% in previous period"
  ], []);

  return (
    <AnalysisContainer>
      <Header>
        <Title>
          <Calendar size={24} />
          Comparative Period Analysis
        </Title>
        <PeriodSelector>
          <PeriodButton 
            isActive={comparisonPeriod === 'week'} 
            onClick={() => setComparisonPeriod('week')}
          >
            Week over Week
          </PeriodButton>
          <PeriodButton 
            isActive={comparisonPeriod === 'month'} 
            onClick={() => setComparisonPeriod('month')}
          >
            Month over Month
          </PeriodButton>
          <PeriodButton 
            isActive={comparisonPeriod === 'quarter'} 
            onClick={() => setComparisonPeriod('quarter')}
          >
            Quarter over Quarter
          </PeriodButton>
          <PeriodButton 
            isActive={comparisonPeriod === 'year'} 
            onClick={() => setComparisonPeriod('year')}
          >
            Year over Year
          </PeriodButton>
        </PeriodSelector>
      </Header>

      <ComparisonCards>
        {comparisonMetrics.map((metric, index) => (
          <ComparisonCard key={index}>
            <CardHeader>
              <CardTitle>{metric.title}</CardTitle>
              <PeriodLabel>{metric.period}</PeriodLabel>
            </CardHeader>
            <MetricComparison>
              <div>
                <CurrentValue>{metric.current}</CurrentValue>
                <PreviousValue>{metric.previous}</PreviousValue>
              </div>
              <MetricValue>
                <ChangeIndicator isPositive={metric.change > 0}>
                  {metric.change > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {Math.abs(metric.change).toFixed(1)}%
                </ChangeIndicator>
              </MetricValue>
            </MetricComparison>
          </ComparisonCard>
        ))}
      </ComparisonCards>

      <InsightsPanel>
        <InsightsTitle>Comparative Analysis Insights</InsightsTitle>
        <InsightsList>
          {insights.map((insight, index) => (
            <InsightItem key={index}>{insight}</InsightItem>
          ))}
        </InsightsList>
      </InsightsPanel>

      <ChartGrid columns={2}>
        <ChartCard>
          <ChartTitle>Revenue Comparison Trend</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={timeSeriesComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="previous" 
                fill="#E5E7EB" 
                stroke="#9CA3AF"
                name="Previous Period"
                fillOpacity={0.3}
              />
              <Bar dataKey="current" fill="#4F46E5" name="Current Period" />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#10B981" 
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Weekly Performance Comparison</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={periodComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="previous" fill="#E5E7EB" name="Previous Month" />
              <Bar dataKey="current" fill="#4F46E5" name="Current Month" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <ChartGrid columns={1}>
        <ChartCard>
          <ChartTitle>Growth Rate Analysis</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={periodComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="growth" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Growth Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <PerformanceTable>
        <ChartTitle>Category Performance Comparison</ChartTitle>
        <Table>
          <thead>
            <tr>
              <TableHeader>Category</TableHeader>
              <TableHeader>Current Revenue</TableHeader>
              <TableHeader>Previous Revenue</TableHeader>
              <TableHeader>Revenue Growth</TableHeader>
              <TableHeader>Current Orders</TableHeader>
              <TableHeader>Previous Orders</TableHeader>
              <TableHeader>Order Growth</TableHeader>
              <TableHeader>Trend</TableHeader>
            </tr>
          </thead>
          <tbody>
            {categoryPerformance.map((cat, index) => (
              <TableRow key={index}>
                <TableCell style={{ fontWeight: 600 }}>{cat.category}</TableCell>
                <TableCell style={{ color: '#4F46E5', fontWeight: 600 }}>
                  ${(cat.currentRevenue / 1000).toFixed(0)}K
                </TableCell>
                <TableCell>${(cat.previousRevenue / 1000).toFixed(0)}K</TableCell>
                <TableCell style={{ 
                  color: cat.growth > 0 ? '#10B981' : '#EF4444',
                  fontWeight: 600 
                }}>
                  {cat.growth > 0 ? '+' : ''}{cat.growth.toFixed(1)}%
                </TableCell>
                <TableCell>{cat.currentOrders}</TableCell>
                <TableCell>{cat.previousOrders}</TableCell>
                <TableCell style={{ 
                  color: cat.orderGrowth > 0 ? '#10B981' : '#EF4444',
                  fontWeight: 600 
                }}>
                  {cat.orderGrowth > 0 ? '+' : ''}{cat.orderGrowth.toFixed(1)}%
                </TableCell>
                <TableCell>
                  <TrendBadge trend={cat.growth > 5 ? 'up' : cat.growth < -2 ? 'down' : 'stable'}>
                    {cat.growth > 5 ? (
                      <>
                        <TrendingUp size={12} />
                        Strong
                      </>
                    ) : cat.growth < -2 ? (
                      <>
                        <TrendingDown size={12} />
                        Declining
                      </>
                    ) : (
                      <>
                        <BarChart3 size={12} />
                        Stable
                      </>
                    )}
                  </TrendBadge>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </PerformanceTable>
    </AnalysisContainer>
  );
};

export default ComparativePeriodAnalysis;