import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  Calendar,
  Bell,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  PiggyBank,
  CreditCard,
  Wallet,
  BarChart3,
  LineChart,
  Activity,
  Zap,
  Brain,
  Timer,
  Award,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Cell, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  RadialBarChart,
  RadialBar
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

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${({ primary, theme }) => primary ? theme.colors.primary : theme.colors.border};
  border-radius: 8px;
  background: ${({ primary, theme }) => primary ? theme.colors.primary : 'white'};
  color: ${({ primary, theme }) => primary ? 'white' : theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ primary, theme }) => 
      primary ? theme.colors.primary : theme.colors.gray[50]};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const BudgetOverview = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainBudgetCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primary}dd);
  border-radius: 16px;
  padding: 24px;
  color: white;
  position: relative;
  overflow: hidden;
`;

const BudgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const BudgetTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  opacity: 0.9;
`;

const BudgetPeriod = styled.div`
  font-size: 12px;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
`;

const BudgetAmount = styled.div`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const BudgetProgress = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ percentage }) => 
    percentage > 90 ? '#ef4444' : 
    percentage > 75 ? '#f59e0b' : '#10b981'};
  width: ${({ percentage }) => Math.min(percentage, 100)}%;
  transition: all 0.3s ease;
`;

const BudgetStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  opacity: 0.8;
`;

const AlertsPanel = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const AlertsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AlertsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const AlertItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid ${({ type, theme }) => {
    switch (type) {
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'success': return theme.colors.success;
      default: return theme.colors.primary;
    }
  }};
`;

const AlertIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'success': return theme.colors.success;
      default: return theme.colors.primary;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  margin-bottom: 2px;
`;

const AlertTime = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ChartPanel = styled.div`
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
  min-height: 250px;
`;

const CategoriesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const CategoryCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CategoryTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CategoryItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const CategoryProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProgressBar = styled.div`
  width: 60px;
  height: 4px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: ${({ percentage, theme }) => 
    percentage > 90 ? theme.colors.error : 
    percentage > 75 ? theme.colors.warning : theme.colors.success};
  width: ${({ percentage }) => Math.min(percentage, 100)}%;
  transition: width 0.3s ease;
`;

const CategoryAmount = styled.div`
  text-align: right;
`;

const CurrentAmount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BudgetLimit = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BudgetTrackingAlerts = () => {
  const [chartType, setChartType] = useState('spending');
  const [timeRange, setTimeRange] = useState('monthly');

  const currentBudget = {
    period: 'Monthly Budget',
    total: 800,
    spent: 567.50,
    remaining: 232.50,
    percentage: 70.9,
    daysLeft: 12,
    avgDaily: 47.29,
    projected: 756.48
  };

  const alerts = [
    {
      id: 1,
      type: 'warning',
      text: 'Groceries budget 85% used with 12 days left',
      time: '2 hours ago',
      icon: AlertTriangle
    },
    {
      id: 2,
      type: 'error',
      text: 'Dining out budget exceeded by $23.50',
      time: '1 day ago',
      icon: AlertTriangle
    },
    {
      id: 3,
      type: 'success',
      text: 'Saved $45 this week through smart shopping',
      time: '2 days ago',
      icon: CheckCircle
    },
    {
      id: 4,
      type: 'info',
      text: 'New budget optimization suggestions available',
      time: '3 days ago',
      icon: Brain
    }
  ];

  const spendingData = [
    { date: '2024-06-01', amount: 45.20, budget: 800, cumulative: 45.20 },
    { date: '2024-06-05', amount: 67.80, budget: 800, cumulative: 113.00 },
    { date: '2024-06-10', amount: 89.30, budget: 800, cumulative: 202.30 },
    { date: '2024-06-15', amount: 134.70, budget: 800, cumulative: 337.00 },
    { date: '2024-06-20', amount: 98.50, budget: 800, cumulative: 435.50 },
    { date: '2024-06-25', amount: 132.00, budget: 800, cumulative: 567.50 }
  ];

  const categoryBudgets = [
    {
      name: 'Groceries',
      spent: 234.50,
      budget: 300,
      percentage: 78.2,
      icon: '🛒'
    },
    {
      name: 'Dining Out',
      spent: 123.50,
      budget: 100,
      percentage: 123.5,
      icon: '🍽️'
    },
    {
      name: 'Household',
      spent: 87.30,
      budget: 150,
      percentage: 58.2,
      icon: '🏠'
    },
    {
      name: 'Health & Beauty',
      spent: 45.20,
      budget: 80,
      percentage: 56.5,
      icon: '💄'
    },
    {
      name: 'Transportation',
      spent: 67.80,
      budget: 120,
      percentage: 56.5,
      icon: '🚗'
    },
    {
      name: 'Entertainment',
      spent: 9.20,
      budget: 50,
      percentage: 18.4,
      icon: '🎬'
    }
  ];

  const categoryData = categoryBudgets.map(cat => ({
    name: cat.name,
    value: cat.spent,
    color: cat.percentage > 100 ? '#ef4444' : 
           cat.percentage > 75 ? '#f59e0b' : '#10b981'
  }));

  const savingsData = [
    { name: 'Saved', value: 232.50, color: '#10b981' },
    { name: 'Spent', value: 567.50, color: '#4f46e5' }
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'spending':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendingData}>
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `$${value.toFixed(2)}`, 
                  name === 'cumulative' ? 'Total Spent' : 'Daily Amount'
                ]}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#4f46e5" 
                fill="#4f46e5" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'categories':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']} />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const addBudgetCategory = () => {
    console.log('Add new budget category');
  };

  const editBudget = (categoryName) => {
    console.log('Edit budget for:', categoryName);
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <PiggyBank size={20} />
          Budget Tracking & Alerts
        </Title>
        <Controls>
          <ActionButton primary onClick={addBudgetCategory}>
            <Plus size={16} />
            Add Category
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
            Settings
          </ActionButton>
          <ActionButton>
            <Bell size={16} />
            Alerts ({alerts.length})
          </ActionButton>
        </Controls>
      </Header>

      <BudgetOverview>
        <MainBudgetCard>
          <BudgetHeader>
            <BudgetTitle>{currentBudget.period}</BudgetTitle>
            <BudgetPeriod>{currentBudget.daysLeft} days left</BudgetPeriod>
          </BudgetHeader>
          
          <BudgetAmount>${currentBudget.spent.toFixed(2)}</BudgetAmount>
          
          <BudgetProgress>
            <ProgressFill percentage={currentBudget.percentage} />
          </BudgetProgress>
          
          <BudgetStats>
            <StatItem>
              <StatValue>${currentBudget.remaining.toFixed(2)}</StatValue>
              <StatLabel>Remaining</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>${currentBudget.avgDaily.toFixed(2)}</StatValue>
              <StatLabel>Daily Avg</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>${currentBudget.projected.toFixed(2)}</StatValue>
              <StatLabel>Projected</StatLabel>
            </StatItem>
          </BudgetStats>
        </MainBudgetCard>

        <AlertsPanel>
          <AlertsHeader>
            <AlertsTitle>
              <Bell size={16} />
              Recent Alerts
            </AlertsTitle>
            <ActionButton style={{ padding: '4px 8px' }}>
              <Eye size={12} />
            </ActionButton>
          </AlertsHeader>
          
          <AlertsList>
            {alerts.map((alert, index) => {
              const Icon = alert.icon;
              return (
                <AlertItem
                  key={alert.id}
                  type={alert.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <AlertIcon type={alert.type}>
                    <Icon size={14} />
                  </AlertIcon>
                  <AlertContent>
                    <AlertText>{alert.text}</AlertText>
                    <AlertTime>{alert.time}</AlertTime>
                  </AlertContent>
                </AlertItem>
              );
            })}
          </AlertsList>
        </AlertsPanel>
      </BudgetOverview>

      <ChartsSection>
        <ChartPanel>
          <ChartHeader>
            <ChartTitle>
              <BarChart3 size={16} />
              Spending Analysis
            </ChartTitle>
            <ChartToggle>
              <ToggleButton 
                active={chartType === 'spending'}
                onClick={() => setChartType('spending')}
              >
                Trend
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
        </ChartPanel>

        <ChartPanel>
          <ChartHeader>
            <ChartTitle>
              <Target size={16} />
              Budget vs Actual
            </ChartTitle>
          </ChartHeader>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                innerRadius="30%" 
                outerRadius="90%" 
                data={[{ 
                  name: 'Budget Usage', 
                  value: currentBudget.percentage,
                  fill: currentBudget.percentage > 90 ? '#ef4444' : 
                        currentBudget.percentage > 75 ? '#f59e0b' : '#10b981'
                }]}
              >
                <RadialBar dataKey="value" cornerRadius={10} />
                <text 
                  x="50%" 
                  y="50%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="progress-label"
                  style={{ fontSize: '24px', fontWeight: 'bold', fill: '#374151' }}
                >
                  {currentBudget.percentage.toFixed(1)}%
                </text>
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartPanel>
      </ChartsSection>

      <CategoriesSection>
        <CategoryCard>
          <CategoryHeader>
            <CategoryTitle>Category Budgets</CategoryTitle>
            <ActionButton style={{ padding: '4px 8px' }} onClick={addBudgetCategory}>
              <Plus size={12} />
              Add
            </ActionButton>
          </CategoryHeader>
          
          <CategoryList>
            {categoryBudgets.map((category, index) => (
              <CategoryItem
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CategoryInfo>
                  <CategoryName>
                    {category.icon} {category.name}
                  </CategoryName>
                  <CategoryProgress>
                    <ProgressBar>
                      <ProgressBarFill percentage={category.percentage} />
                    </ProgressBar>
                    <span>{category.percentage.toFixed(1)}%</span>
                  </CategoryProgress>
                </CategoryInfo>
                
                <CategoryAmount>
                  <CurrentAmount>${category.spent.toFixed(2)}</CurrentAmount>
                  <BudgetLimit>of ${category.budget.toFixed(2)}</BudgetLimit>
                </CategoryAmount>
                
                <ActionButton 
                  style={{ padding: '4px', marginLeft: '8px' }}
                  onClick={() => editBudget(category.name)}
                >
                  <Edit3 size={12} />
                </ActionButton>
              </CategoryItem>
            ))}
          </CategoryList>
        </CategoryCard>
      </CategoriesSection>
    </Container>
  );
};

export default BudgetTrackingAlerts;