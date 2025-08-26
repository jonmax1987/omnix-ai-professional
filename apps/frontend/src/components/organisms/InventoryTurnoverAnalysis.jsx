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
  ComposedChart,
  Area,
  Treemap
} from 'recharts';
import { Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, RotateCw, BarChart3, Info } from 'lucide-react';

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

const CategoryFilter = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterButton = styled.button`
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
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const KPICard = styled.div`
  background: ${({ status, theme }) => {
    if (status === 'critical') return `${theme.colors.error.light}10`;
    if (status === 'warning') return `${theme.colors.warning.light}10`;
    if (status === 'good') return `${theme.colors.success.light}10`;
    return theme.colors.background.main;
  }};
  border: 1px solid ${({ status, theme }) => {
    if (status === 'critical') return theme.colors.error.light;
    if (status === 'warning') return theme.colors.warning.light;
    if (status === 'good') return theme.colors.success.light;
    return theme.colors.neutral.border;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const KPIHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const KPILabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const KPIValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const KPISubtext = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
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

const ProductTable = styled.div`
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

const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.surface.secondary};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};

  &:hover {
    background: ${({ theme }) => theme.colors.neutral.hover};
  }
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-align: left;
`;

const StatusBadge = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ status, theme }) => {
    if (status === 'fast') return theme.colors.success.light;
    if (status === 'medium') return theme.colors.warning.light;
    if (status === 'slow') return theme.colors.error.light;
    return theme.colors.neutral.light;
  }};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const InfoTooltip = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: ${({ theme }) => theme.colors.primary.light};
  color: white;
  border-radius: 50%;
  font-size: 10px;
  cursor: help;
`;

const InventoryTurnoverAnalysis = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const turnoverKPIs = useMemo(() => [
    {
      label: 'Overall Turnover Rate',
      value: '8.3x',
      subtext: 'Annual rate (target: 8-12x)',
      icon: RotateCw,
      status: 'good'
    },
    {
      label: 'Days Inventory Outstanding',
      value: '44 days',
      subtext: 'Average holding period',
      icon: Package,
      status: 'warning'
    },
    {
      label: 'Carrying Cost',
      value: '$127K',
      subtext: 'Monthly average',
      icon: DollarSign,
      status: 'warning'
    },
    {
      label: 'Stock-out Incidents',
      value: '12',
      subtext: 'Last 30 days',
      icon: AlertTriangle,
      status: 'critical'
    }
  ], []);

  const categoryTurnover = useMemo(() => [
    { category: 'Groceries', turnover: 12.5, target: 12, value: 450000 },
    { category: 'Electronics', turnover: 4.2, target: 6, value: 320000 },
    { category: 'Clothing', turnover: 6.8, target: 8, value: 280000 },
    { category: 'Home & Garden', turnover: 3.5, target: 5, value: 190000 },
    { category: 'Health & Beauty', turnover: 9.2, target: 10, value: 165000 },
    { category: 'Sports & Outdoors', turnover: 5.1, target: 6, value: 145000 }
  ], []);

  const turnoverTrend = useMemo(() => [
    { month: 'Jan', turnover: 7.2, cost: 142000, efficiency: 68 },
    { month: 'Feb', turnover: 7.5, cost: 138000, efficiency: 71 },
    { month: 'Mar', turnover: 7.8, cost: 135000, efficiency: 73 },
    { month: 'Apr', turnover: 8.1, cost: 131000, efficiency: 75 },
    { month: 'May', turnover: 8.3, cost: 127000, efficiency: 78 },
    { month: 'Jun', turnover: 8.5, cost: 124000, efficiency: 80 }
  ], []);

  const productPerformance = useMemo(() => [
    { product: 'Fresh Produce', turnover: 24.5, days: 15, status: 'fast', value: 89000 },
    { product: 'Dairy Products', turnover: 18.2, days: 20, status: 'fast', value: 76000 },
    { product: 'Beverages', turnover: 12.8, days: 28, status: 'medium', value: 65000 },
    { product: 'Snacks & Confectionery', turnover: 10.5, days: 35, status: 'medium', value: 54000 },
    { product: 'Electronics', turnover: 4.2, days: 87, status: 'slow', value: 320000 },
    { product: 'Furniture', turnover: 2.8, days: 130, status: 'slow', value: 180000 },
    { product: 'Cleaning Supplies', turnover: 8.9, days: 41, status: 'medium', value: 42000 },
    { product: 'Personal Care', turnover: 11.3, days: 32, status: 'medium', value: 38000 }
  ], []);

  const agingInventory = useMemo(() => [
    { range: '0-30 days', value: 45, color: '#10B981' },
    { range: '31-60 days', value: 28, color: '#F59E0B' },
    { range: '61-90 days', value: 15, color: '#EF4444' },
    { range: '90+ days', value: 12, color: '#991B1B' }
  ], []);

  const treemapData = useMemo(() => [
    { name: 'Fast Moving', size: 450, fill: '#10B981' },
    { name: 'Medium Moving', size: 320, fill: '#F59E0B' },
    { name: 'Slow Moving', size: 180, fill: '#EF4444' },
    { name: 'Dead Stock', size: 50, fill: '#991B1B' }
  ], []);

  return (
    <AnalysisContainer>
      <Header>
        <Title>
          <Package size={24} />
          Inventory Turnover Analysis
        </Title>
        <CategoryFilter>
          <FilterButton 
            isActive={selectedCategory === 'all'} 
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </FilterButton>
          <FilterButton 
            isActive={selectedCategory === 'fast'} 
            onClick={() => setSelectedCategory('fast')}
          >
            Fast Moving
          </FilterButton>
          <FilterButton 
            isActive={selectedCategory === 'slow'} 
            onClick={() => setSelectedCategory('slow')}
          >
            Slow Moving
          </FilterButton>
          <FilterButton 
            isActive={selectedCategory === 'critical'} 
            onClick={() => setSelectedCategory('critical')}
          >
            Critical Items
          </FilterButton>
        </CategoryFilter>
      </Header>

      <KPIGrid>
        {turnoverKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <KPICard key={index} status={kpi.status}>
              <KPIHeader>
                <KPILabel>
                  <Icon size={18} />
                  {kpi.label}
                </KPILabel>
                <InfoTooltip>?</InfoTooltip>
              </KPIHeader>
              <KPIValue>{kpi.value}</KPIValue>
              <KPISubtext>{kpi.subtext}</KPISubtext>
            </KPICard>
          );
        })}
      </KPIGrid>

      <ChartGrid columns={2}>
        <ChartCard>
          <ChartTitle>
            <BarChart3 size={20} />
            Category Turnover Performance
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryTurnover}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="turnover" fill="#4F46E5" name="Actual Turnover" />
              <Bar dataKey="target" fill="#10B981" name="Target Turnover" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <TrendingUp size={20} />
            Turnover Trend & Efficiency
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={turnoverTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="efficiency" 
                fill="#10B981" 
                stroke="#10B981"
                fillOpacity={0.3}
                name="Efficiency %"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="turnover" 
                stroke="#4F46E5" 
                strokeWidth={2}
                name="Turnover Rate"
              />
              <Bar 
                yAxisId="right"
                dataKey="cost" 
                fill="#F59E0B" 
                name="Carrying Cost ($)"
                opacity={0.6}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <ChartGrid columns={2}>
        <ChartCard>
          <ChartTitle>
            <Package size={20} />
            Inventory Age Distribution
          </ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={agingInventory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.range}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {agingInventory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <BarChart3 size={20} />
            Inventory Classification
          </ChartTitle>
          <ResponsiveContainer width="100%" height={250}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
            />
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>

      <ProductTable>
        <ChartTitle>
          <Package size={20} />
          Product-Level Turnover Details
        </ChartTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Product Category</TableHeaderCell>
              <TableHeaderCell>Turnover Rate</TableHeaderCell>
              <TableHeaderCell>Days on Hand</TableHeaderCell>
              <TableHeaderCell>Inventory Value</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Trend</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {productPerformance.map((product, index) => (
              <TableRow key={index}>
                <TableCell>{product.product}</TableCell>
                <TableCell>{product.turnover}x</TableCell>
                <TableCell>{product.days} days</TableCell>
                <TableCell>${(product.value / 1000).toFixed(0)}K</TableCell>
                <TableCell>
                  <StatusBadge status={product.status}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  {product.turnover > 10 ? (
                    <TrendingUp size={16} color="#10B981" />
                  ) : product.turnover < 5 ? (
                    <TrendingDown size={16} color="#EF4444" />
                  ) : (
                    <TrendingUp size={16} color="#F59E0B" style={{ transform: 'rotate(0deg)' }} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </ProductTable>
    </AnalysisContainer>
  );
};

export default InventoryTurnoverAnalysis;