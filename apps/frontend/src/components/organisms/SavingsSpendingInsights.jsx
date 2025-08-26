import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { baseShouldForwardProp } from '../../utils/styledUtils';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Target, 
  Calendar, 
  BarChart3, 
  PieChart, 
  LineChart, 
  CreditCard,
  Wallet,
  Receipt,
  Tag,
  Gift,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Percent,
  Clock,
  ShoppingBag,
  Package,
  Heart,
  Star,
  Zap,
  Brain,
  Lightbulb,
  Filter,
  Download,
  Share2,
  Settings,
  Eye,
  EyeOff,
  MoreHorizontal,
  ChevronRight,
  Award,
  Crown,
  Medal,
  Trophy
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  BarChart as RechartsBarChart,
  Bar,
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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.primary.light};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main : 
    variant === 'secondary' ? theme.colors.secondary.main : 
    theme.colors.gray[100]};
  color: ${({ variant, theme }) => 
    variant === 'primary' || variant === 'secondary' ? 'white' : theme.colors.text.primary};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const OverviewCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const OverviewCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['gradient'].includes(prop)
})`
  background: ${({ gradient, theme }) => 
    gradient === 'spending' ? 'linear-gradient(135deg, #FF6B6B, #4ECDC4)' :
    gradient === 'savings' ? 'linear-gradient(135deg, #4ECDC4, #45B7D1)' :
    gradient === 'budget' ? 'linear-gradient(135deg, #96CEB4, #FFEAA7)' :
    gradient === 'deals' ? 'linear-gradient(135deg, #FFEAA7, #DDA0DD)' :
    theme.colors.gray[50]};
  color: ${({ gradient }) => gradient ? 'white' : 'inherit'};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: ${({ gradient }) => gradient ? 'white' : 'inherit'};
`;

const CardValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  color: ${({ gradient }) => gradient ? 'white' : 'inherit'};
`;

const CardLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
  color: ${({ gradient }) => gradient ? 'white' : 'inherit'};
`;

const CardChange = styled.div.withConfig({
  shouldForwardProp: (prop) => !['positive', 'gradient'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ positive, gradient }) => 
    gradient ? 'rgba(255, 255, 255, 0.9)' :
    positive ? '#10B981' : '#EF4444'};
`;

const ChartSection = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimeFilter = styled.div`
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 4px;
`;

const TimeButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})`
  padding: 8px 16px;
  background: ${({ active, theme }) => active ? theme.colors.primary.main : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary.main : theme.colors.gray[100]};
  }
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const InsightCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['type'].includes(prop)
})`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${({ type, theme }) => 
    type === 'warning' ? theme.colors.warning.main :
    type === 'success' ? theme.colors.success.main :
    type === 'info' ? theme.colors.info.main :
    theme.colors.primary.main};
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const InsightIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ type, theme }) => 
    type === 'warning' ? theme.colors.warning.light :
    type === 'success' ? theme.colors.success.light :
    type === 'info' ? theme.colors.info.light :
    theme.colors.primary.light};
  color: ${({ type, theme }) => 
    type === 'warning' ? theme.colors.warning.main :
    type === 'success' ? theme.colors.success.main :
    type === 'info' ? theme.colors.info.main :
    theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InsightTitle = styled.h5`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InsightDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin-bottom: 12px;
`;

const InsightAction = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.gray[200]};
    transform: translateX(2px);
  }
`;

const CategoryBreakdown = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
`;

const CategoryColor = styled.div.withConfig({
  shouldForwardProp: (prop) => !['color'].includes(prop)
})`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CategoryAmount = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CategoryPercent = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const GoalsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
`;

const GoalsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const GoalItem = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 10px;
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const GoalTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const GoalStatus = styled.div.withConfig({
  shouldForwardProp: (prop) => !['achieved'].includes(prop)
})`
  font-size: 12px;
  color: ${({ achieved, theme }) => achieved ? theme.colors.success.main : theme.colors.warning.main};
  font-weight: 500;
`;

const GoalProgress = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const GoalProgressBar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['progress', 'achieved'].includes(prop)
})
  height: 100%;
  background: ${({ achieved, theme }) => 
    achieved ? theme.colors.success.main : theme.colors.primary.main};
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const GoalDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SavingsSpendingInsights = () => {
  const [activeTimeFrame, setActiveTimeFrame] = useState('month');
  const [showBudgetGoals, setShowBudgetGoals] = useState(true);

  // Mock data
  const overviewData = {
    totalSpent: 2847.50,
    totalSaved: 312.45,
    budgetRemaining: 652.55,
    dealsUsed: 23
  };

  const spendingTrend = [
    { month: 'Jan', spending: 2650, budget: 3000 },
    { month: 'Feb', spending: 2890, budget: 3000 },
    { month: 'Mar', spending: 2425, budget: 3000 },
    { month: 'Apr', spending: 2735, budget: 3000 },
    { month: 'May', spending: 2980, budget: 3000 },
    { month: 'Jun', spending: 2847, budget: 3000 }
  ];

  const categoryData = [
    { name: 'Groceries', value: 1245.30, color: '#8884D8', percent: 43.7 },
    { name: 'Household', value: 456.80, color: '#82CA9D', percent: 16.0 },
    { name: 'Personal Care', value: 234.20, color: '#FFC658', percent: 8.2 },
    { name: 'Snacks', value: 178.90, color: '#FF7C7C', percent: 6.3 },
    { name: 'Beverages', value: 156.40, color: '#8DD1E1', percent: 5.5 },
    { name: 'Other', value: 575.90, color: '#D084D0', percent: 20.3 }
  ];

  const insights = [
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Budget Alert',
      description: 'You\'ve spent 78% of your monthly grocery budget. Consider checking for deals on upcoming purchases.',
      action: 'View Deals'
    },
    {
      type: 'success',
      icon: TrendingDown,
      title: 'Spending Improvement',
      description: 'Great job! You\'ve reduced your spending by 12% compared to last month by using coupons and store brands.',
      action: 'See Details'
    },
    {
      type: 'info',
      icon: Lightbulb,
      title: 'Smart Tip',
      description: 'Based on your shopping patterns, buying in bulk could save you $45/month on household essentials.',
      action: 'Explore Bulk Items'
    },
    {
      type: 'primary',
      icon: Trophy,
      title: 'Savings Achievement',
      description: 'You\'ve unlocked the "Coupon Master" badge by saving over $300 this month! Keep up the great work.',
      action: 'View Achievements'
    }
  ];

  const budgetGoals = [
    {
      title: 'Monthly Grocery Budget',
      target: 3000,
      current: 2347,
      achieved: false,
      progress: 78.2
    },
    {
      title: 'Savings Goal',
      target: 500,
      current: 312,
      achieved: false,
      progress: 62.4
    },
    {
      title: 'Deal Usage Target',
      target: 20,
      current: 23,
      achieved: true,
      progress: 115
    },
    {
      title: 'Brand Optimization',
      target: 15,
      current: 18,
      achieved: true,
      progress: 120
    }
  ];

  const timeFrames = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'quarter', label: 'Quarter' },
    { id: 'year', label: 'Year' }
  ];

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <IconWrapper>
            <PiggyBank size={18} />
          </IconWrapper>
          Savings & Spending Insights
        </Title>
        
        <ActionButtons>
          <ActionButton variant="secondary">
            <Download size={14} />
            Export Report
          </ActionButton>
          <ActionButton variant="primary">
            <Target size={14} />
            Set Goals
          </ActionButton>
        </ActionButtons>
      </Header>

      <Content>
        {/* Overview Cards */}
        <OverviewCards>
          <OverviewCard
            gradient="spending"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CardIcon gradient>
              <CreditCard size={24} />
            </CardIcon>
            <CardValue gradient>${overviewData.totalSpent.toFixed(2)}</CardValue>
            <CardLabel gradient>Total Spent This Month</CardLabel>
            <CardChange positive={false} gradient>
              <ArrowUp size={12} />
              5.2% vs last month
            </CardChange>
          </OverviewCard>

          <OverviewCard
            gradient="savings"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CardIcon gradient>
              <PiggyBank size={24} />
            </CardIcon>
            <CardValue gradient>${overviewData.totalSaved.toFixed(2)}</CardValue>
            <CardLabel gradient>Total Saved</CardLabel>
            <CardChange positive={true} gradient>
              <ArrowDown size={12} />
              12.8% increase
            </CardChange>
          </OverviewCard>

          <OverviewCard
            gradient="budget"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CardIcon gradient>
              <Wallet size={24} />
            </CardIcon>
            <CardValue gradient>${overviewData.budgetRemaining.toFixed(2)}</CardValue>
            <CardLabel gradient>Budget Remaining</CardLabel>
            <CardChange positive={true} gradient>
              <Target size={12} />
              21.8% left
            </CardChange>
          </OverviewCard>

          <OverviewCard
            gradient="deals"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CardIcon gradient>
              <Tag size={24} />
            </CardIcon>
            <CardValue gradient>{overviewData.dealsUsed}</CardValue>
            <CardLabel gradient>Deals Used</CardLabel>
            <CardChange positive={true} gradient>
              <Percent size={12} />
              15% savings rate
            </CardChange>
          </OverviewCard>
        </OverviewCards>

        {/* Spending Trend Chart */}
        <ChartSection>
          <ChartHeader>
            <ChartTitle>
              <LineChart size={20} />
              Spending Trend
            </ChartTitle>
            
            <TimeFilter>
              {timeFrames.map(frame => (
                <TimeButton
                  key={frame.id}
                  active={activeTimeFrame === frame.id}
                  onClick={() => setActiveTimeFrame(frame.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {frame.label}
                </TimeButton>
              ))}
            </TimeFilter>
          </ChartHeader>
          
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={spendingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="spending" 
                stroke="#6366F1" 
                strokeWidth={3}
                dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2, fill: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#EF4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* Insights Grid */}
        <InsightsGrid>
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <InsightCard
                key={index}
                type={insight.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <InsightHeader>
                  <InsightIcon type={insight.type}>
                    <Icon size={20} />
                  </InsightIcon>
                  <InsightTitle>{insight.title}</InsightTitle>
                </InsightHeader>
                
                <InsightDescription>{insight.description}</InsightDescription>
                
                <InsightAction
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {insight.action}
                  <ChevronRight size={12} />
                </InsightAction>
              </InsightCard>
            );
          })}
        </InsightsGrid>

        {/* Category Breakdown and Goals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <CategoryBreakdown>
            <ChartTitle>
              <PieChart size={20} />
              Spending by Category
            </ChartTitle>
            
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            <CategoryList>
              {categoryData.map((category, index) => (
                <CategoryItem key={index}>
                  <CategoryColor color={category.color} />
                  <CategoryInfo>
                    <CategoryName>{category.name}</CategoryName>
                    <CategoryAmount>${category.value.toFixed(2)}</CategoryAmount>
                  </CategoryInfo>
                  <CategoryPercent>{category.percent}%</CategoryPercent>
                </CategoryItem>
              ))}
            </CategoryList>
          </CategoryBreakdown>

          <GoalsSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ChartTitle>
                <Target size={20} />
                Budget Goals
              </ChartTitle>
              
              <ActionButton
                onClick={() => setShowBudgetGoals(!showBudgetGoals)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showBudgetGoals ? <EyeOff size={14} /> : <Eye size={14} />}
                {showBudgetGoals ? 'Hide' : 'Show'}
              </ActionButton>
            </div>
            
            <AnimatePresence>
              {showBudgetGoals && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GoalsList>
                    {budgetGoals.map((goal, index) => (
                      <GoalItem key={index}>
                        <GoalHeader>
                          <GoalTitle>{goal.title}</GoalTitle>
                          <GoalStatus achieved={goal.achieved}>
                            {goal.achieved ? 'Achieved!' : `${goal.progress.toFixed(1)}%`}
                          </GoalStatus>
                        </GoalHeader>
                        
                        <GoalProgress>
                          <GoalProgressBar
                            progress={Math.min(goal.progress, 100)}
                            achieved={goal.achieved}
                          />
                        </GoalProgress>
                        
                        <GoalDetails>
                          <span>
                            ${goal.current.toFixed(2)} of ${goal.target.toFixed(2)}
                          </span>
                          <span>
                            {goal.achieved ? (
                              <CheckCircle size={12} style={{ color: '#10B981' }} />
                            ) : (
                              `$${(goal.target - goal.current).toFixed(2)} remaining`
                            )}
                          </span>
                        </GoalDetails>
                      </GoalItem>
                    ))}
                  </GoalsList>
                </motion.div>
              )}
            </AnimatePresence>
          </GoalsSection>
        </div>
      </Content>
    </Container>
  );
};

export default SavingsSpendingInsights;