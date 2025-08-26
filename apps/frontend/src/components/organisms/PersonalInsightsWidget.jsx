import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Target,
  Heart,
  Zap,
  Award,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  ArrowRight,
  Star,
  Leaf,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

const WidgetContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  overflow: hidden;
`;

const WidgetHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WidgetTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TabBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Tab = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : 'transparent'};
  color: ${({ isActive, theme }) => 
    isActive ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isActive, theme }) => 
      isActive ? theme.colors.primary.dark : theme.colors.neutral.hover};
  }
`;

const WidgetContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const InsightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InsightCard = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const InsightIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${({ color, theme }) => color || theme.colors.primary.light}20;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ color, theme }) => color || theme.colors.primary.main};
  margin: 0 auto ${({ theme }) => theme.spacing.sm} auto;
`;

const InsightValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InsightLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InsightTrend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success.main : theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ChartContainer = styled.div`
  height: 200px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RecommendationItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.primary.light}05;
  }
`;

const RecommendationIcon = styled.div`
  width: 24px;
  height: 24px;
  background: ${({ type, theme }) => {
    if (type === 'saving') return `${theme.colors.success.main}20`;
    if (type === 'health') return `${theme.colors.warning.main}20`;
    if (type === 'efficiency') return `${theme.colors.primary.main}20`;
    return `${theme.colors.secondary.main}20`;
  }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ type, theme }) => {
    if (type === 'saving') return theme.colors.success.main;
    if (type === 'health') return theme.colors.warning.main;
    if (type === 'efficiency') return theme.colors.primary.main;
    return theme.colors.secondary.main;
  }};
`;

const RecommendationText = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
`;

const RecommendationAction = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ProgressSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProgressItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.neutral.light};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ color, theme }) => color || theme.colors.primary.main};
  border-radius: 4px;
`;

const PersonalInsightsWidget = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const spendingData = [
    { month: 'Jan', spending: 320, budget: 400 },
    { month: 'Feb', spending: 380, budget: 400 },
    { month: 'Mar', spending: 290, budget: 400 },
    { month: 'Apr', spending: 420, budget: 400 },
    { month: 'May', spending: 340, budget: 400 },
    { month: 'Jun', spending: 360, budget: 400 }
  ];

  const categoryData = [
    { name: 'Groceries', value: 45, color: '#4F46E5' },
    { name: 'Health', value: 25, color: '#10B981' },
    { name: 'Household', value: 20, color: '#F59E0B' },
    { name: 'Other', value: 10, color: '#8B5CF6' }
  ];

  const healthScore = [
    { name: 'Health Score', value: 78, fill: '#10B981' }
  ];

  const overviewInsights = [
    {
      icon: DollarSign,
      value: '$127',
      label: 'Monthly Savings',
      trend: 15.2,
      isPositive: true,
      color: '#10B981'
    },
    {
      icon: ShoppingCart,
      value: '23',
      label: 'Smart Purchases',
      trend: 8.5,
      isPositive: true,
      color: '#4F46E5'
    },
    {
      icon: Target,
      value: '85%',
      label: 'Goals Met',
      trend: 12.0,
      isPositive: true,
      color: '#F59E0B'
    },
    {
      icon: Heart,
      value: '78',
      label: 'Health Score',
      trend: -2.3,
      isPositive: false,
      color: '#EF4444'
    }
  ];

  const recommendations = [
    {
      type: 'saving',
      icon: DollarSign,
      text: 'Switch to store brand milk to save $8/month',
      action: 'Save Now'
    },
    {
      type: 'health',
      icon: Heart,
      text: 'Add more vegetables to reach your health goals',
      action: 'View Options'
    },
    {
      type: 'efficiency',
      icon: Clock,
      text: 'Subscribe to frequently bought items for 10% off',
      action: 'Set Up'
    },
    {
      type: 'discovery',
      icon: Star,
      text: 'Try organic pasta - highly rated by similar users',
      action: 'Learn More'
    }
  ];

  const goals = [
    { label: 'Monthly Budget', progress: 72, color: '#4F46E5', target: '$400' },
    { label: 'Healthy Choices', progress: 85, color: '#10B981', target: '90%' },
    { label: 'Sustainability', progress: 63, color: '#F59E0B', target: '80%' },
    { label: 'Time Savings', progress: 91, color: '#8B5CF6', target: '5h/week' }
  ];

  const renderOverview = () => (
    <>
      <InsightGrid>
        {overviewInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <InsightCard key={index}>
              <InsightIcon color={insight.color}>
                <Icon size={16} />
              </InsightIcon>
              <InsightValue>{insight.value}</InsightValue>
              <InsightLabel>{insight.label}</InsightLabel>
              <InsightTrend isPositive={insight.isPositive}>
                {insight.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(insight.trend)}%
              </InsightTrend>
            </InsightCard>
          );
        })}
      </InsightGrid>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spendingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="budget"
              stackId="1"
              stroke="#E5E7EB"
              fill="#E5E7EB"
              name="Budget"
            />
            <Area
              type="monotone"
              dataKey="spending"
              stackId="2"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.6}
              name="Spending"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </>
  );

  const renderGoals = () => (
    <ProgressSection>
      {goals.map((goal, index) => (
        <ProgressItem key={index}>
          <ProgressLabel>
            <span>{goal.label}</span>
            <span style={{ color: goal.color, fontWeight: '600' }}>
              {goal.progress}% → {goal.target}
            </span>
          </ProgressLabel>
          <ProgressBar>
            <ProgressFill
              color={goal.color}
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
            />
          </ProgressBar>
        </ProgressItem>
      ))}
    </ProgressSection>
  );

  const renderRecommendations = () => (
    <RecommendationsList>
      {recommendations.map((rec, index) => {
        const Icon = rec.icon;
        return (
          <RecommendationItem key={index}>
            <RecommendationIcon type={rec.type}>
              <Icon size={12} />
            </RecommendationIcon>
            <RecommendationText>{rec.text}</RecommendationText>
            <RecommendationAction>
              {rec.action}
              <ArrowRight size={12} style={{ marginLeft: '4px' }} />
            </RecommendationAction>
          </RecommendationItem>
        );
      })}
    </RecommendationsList>
  );

  const renderAnalytics = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Spending by Category
          </h4>
          <ResponsiveContainer width="100%" height={150}>
            <RechartsPieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Health Score
          </h4>
          <ResponsiveContainer width="100%" height={150}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={healthScore}>
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill="#10B981"
              />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#10B981" fontSize="24" fontWeight="bold">
                78
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <div style={{ padding: '12px', background: '#F3F4F6', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4F46E5' }}>
            <Activity size={16} style={{ marginRight: '4px' }} />
            92%
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Consistency Score</div>
        </div>
        <div style={{ padding: '12px', background: '#F3F4F6', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981' }}>
            <Leaf size={16} style={{ marginRight: '4px' }} />
            15
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Eco Points</div>
        </div>
      </div>
    </>
  );

  return (
    <WidgetContainer
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <WidgetHeader>
        <WidgetTitle>
          <Lightbulb size={20} />
          Personal Insights
        </WidgetTitle>
        <TabBar>
          <Tab isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </Tab>
          <Tab isActive={activeTab === 'goals'} onClick={() => setActiveTab('goals')}>
            Goals
          </Tab>
          <Tab isActive={activeTab === 'recommendations'} onClick={() => setActiveTab('recommendations')}>
            Tips
          </Tab>
          <Tab isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
            Analytics
          </Tab>
        </TabBar>
      </WidgetHeader>

      <WidgetContent>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'analytics' && renderAnalytics()}
      </WidgetContent>
    </WidgetContainer>
  );
};

export default PersonalInsightsWidget;