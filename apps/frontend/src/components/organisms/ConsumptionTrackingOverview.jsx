import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Package,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

const Container = styled(motion.div)`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const TimeFilter = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: white;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: white;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  margin-bottom: 8px;
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success : theme.colors.error};
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartSection = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartToggle = styled.div`
  display: flex;
  gap: 4px;
`;

const ToggleButton = styled.button`
  padding: 4px 8px;
  border: none;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const ChartContainer = styled.div`
  flex: 1;
  min-height: 200px;
`;

const ProductsList = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProductsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ProductsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ProductItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ProductIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`;

const ProductMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProductStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'low': return theme.colors.error;
      case 'normal': return theme.colors.success;
      case 'high': return theme.colors.warning;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
`;

const Prediction = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const ConsumptionTrackingOverview = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('consumption');

  const stats = [
    {
      id: 1,
      label: 'Daily Average',
      value: '12.5',
      unit: 'items',
      trend: 8.5,
      isPositive: true,
      icon: Activity,
      color: '#4f46e5'
    },
    {
      id: 2,
      label: 'Weekly Total',
      value: '87',
      unit: 'items',
      trend: -3.2,
      isPositive: false,
      icon: Calendar,
      color: '#06b6d4'
    },
    {
      id: 3,
      label: 'Efficiency Score',
      value: '94%',
      unit: '',
      trend: 12.1,
      isPositive: true,
      icon: Target,
      color: '#10b981'
    },
    {
      id: 4,
      label: 'Waste Reduction',
      value: '15%',
      unit: '',
      trend: 5.4,
      isPositive: true,
      icon: Zap,
      color: '#f59e0b'
    }
  ];

  const consumptionData = [
    { date: '2024-06-15', items: 8, calories: 2150, waste: 0.5 },
    { date: '2024-06-16', items: 12, calories: 2340, waste: 0.2 },
    { date: '2024-06-17', items: 15, calories: 2580, waste: 0.8 },
    { date: '2024-06-18', items: 9, calories: 1980, waste: 0.1 },
    { date: '2024-06-19', items: 14, calories: 2420, waste: 0.4 },
    { date: '2024-06-20', items: 11, calories: 2280, waste: 0.3 },
    { date: '2024-06-21', items: 13, calories: 2490, waste: 0.6 }
  ];

  const categoryData = [
    { name: 'Fruits', value: 28, color: '#10b981' },
    { name: 'Vegetables', value: 24, color: '#06b6d4' },
    { name: 'Dairy', value: 18, color: '#f59e0b' },
    { name: 'Proteins', value: 16, color: '#ef4444' },
    { name: 'Grains', value: 14, color: '#8b5cf6' }
  ];

  const trackedProducts = [
    {
      id: 1,
      name: 'Milk',
      category: 'Dairy',
      lastConsumed: '6 hours ago',
      frequency: 'Daily',
      status: 'normal',
      prediction: '2 days left',
      icon: Package
    },
    {
      id: 2,
      name: 'Bananas',
      category: 'Fruits',
      lastConsumed: '1 day ago',
      frequency: 'Every 2 days',
      status: 'low',
      prediction: 'Buy today',
      icon: Package
    },
    {
      id: 3,
      name: 'Bread',
      category: 'Grains',
      lastConsumed: '8 hours ago',
      frequency: 'Daily',
      status: 'normal',
      prediction: '4 days left',
      icon: Package
    },
    {
      id: 4,
      name: 'Yogurt',
      category: 'Dairy',
      lastConsumed: '2 days ago',
      frequency: 'Every 3 days',
      status: 'high',
      prediction: 'Well stocked',
      icon: Package
    },
    {
      id: 5,
      name: 'Chicken',
      category: 'Proteins',
      lastConsumed: '1 day ago',
      frequency: 'Weekly',
      status: 'normal',
      prediction: '5 days left',
      icon: Package
    }
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'consumption':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={consumptionData}>
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === 'items' ? 'Items Consumed' : 'Calories']}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Area 
                type="monotone" 
                dataKey="items" 
                stroke="#4f46e5" 
                fill="#4f46e5" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'calories':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={consumptionData}>
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, 'Calories']}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="calories" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'waste':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consumptionData}>
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value + '%', 'Food Waste']}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Bar dataKey="waste" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'categories':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value + '%', 'Category Share']} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Activity size={20} />
          Consumption Tracking
        </Title>
        <Controls>
          <TimeFilter value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="1d">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
          </TimeFilter>
          <ActionButton>
            <Filter size={16} />
            Filter
          </ActionButton>
          <ActionButton>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
        </Controls>
      </Header>

      <StatsGrid>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={stat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: stat.id * 0.1 }}
            >
              <StatIcon color={stat.color}>
                <Icon size={18} />
              </StatIcon>
              <StatValue>
                {stat.value}
                {stat.unit && <span style={{ fontSize: '14px', fontWeight: 400 }}> {stat.unit}</span>}
              </StatValue>
              <StatLabel>{stat.label}</StatLabel>
              <StatTrend isPositive={stat.isPositive}>
                {stat.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(stat.trend)}%
              </StatTrend>
            </StatCard>
          );
        })}
      </StatsGrid>

      <ContentGrid>
        <ChartSection>
          <ChartHeader>
            <ChartTitle>
              <BarChart3 size={16} />
              Analytics Overview
            </ChartTitle>
            <ChartToggle>
              <ToggleButton 
                active={chartType === 'consumption'}
                onClick={() => setChartType('consumption')}
              >
                Items
              </ToggleButton>
              <ToggleButton 
                active={chartType === 'calories'}
                onClick={() => setChartType('calories')}
              >
                Calories
              </ToggleButton>
              <ToggleButton 
                active={chartType === 'waste'}
                onClick={() => setChartType('waste')}
              >
                Waste
              </ToggleButton>
              <ToggleButton 
                active={chartType === 'categories'}
                onClick={() => setChartType('categories')}
              >
                Categories
              </ToggleButton>
            </ChartToggle>
          </ChartHeader>
          <ChartContainer>
            {renderChart()}
          </ChartContainer>
        </ChartSection>

        <ProductsList>
          <ProductsHeader>
            <ProductsTitle>Tracked Products</ProductsTitle>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {trackedProducts.length} items
            </span>
          </ProductsHeader>
          <ProductsContainer>
            {trackedProducts.map((product, index) => {
              const Icon = product.icon;
              return (
                <ProductItem
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductInfo>
                    <ProductIcon>
                      <Icon size={16} color="#6b7280" />
                    </ProductIcon>
                    <ProductDetails>
                      <ProductName>{product.name}</ProductName>
                      <ProductMeta>
                        {product.category} • {product.lastConsumed} • {product.frequency}
                      </ProductMeta>
                    </ProductDetails>
                  </ProductInfo>
                  <ProductStatus>
                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge status={product.status}>
                        {product.status === 'low' && <AlertCircle size={10} />}
                        {product.status === 'normal' && <CheckCircle size={10} />}
                        {product.status === 'high' && <Clock size={10} />}
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </StatusBadge>
                      <Prediction>{product.prediction}</Prediction>
                    </div>
                  </ProductStatus>
                </ProductItem>
              );
            })}
          </ProductsContainer>
        </ProductsList>
      </ContentGrid>
    </Container>
  );
};

export default ConsumptionTrackingOverview;