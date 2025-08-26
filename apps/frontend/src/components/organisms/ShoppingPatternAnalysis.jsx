import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Package, 
  DollarSign, 
  Star,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Brain,
  Lightbulb,
  PieChart,
  Activity,
  MapPin,
  Timer,
  ShoppingCart,
  Users,
  Award
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
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ComposedChart,
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  Scatter,
  ScatterChart
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

const InsightsPanel = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}10, ${({ theme }) => theme.colors.primary}05);
  border: 1px solid ${({ theme }) => theme.colors.primary}20;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const InsightsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const InsightsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const KeyInsights = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const InsightCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InsightIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const InsightLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
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

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const PatternCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
`;

const PatternHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PatternTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PatternList = styled.div`
  space-y: 12px;
`;

const PatternItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const PatternInfo = styled.div`
  flex: 1;
`;

const PatternName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const PatternDetail = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PatternScore = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const ShoppingPatternAnalysis = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('frequency');

  const keyInsights = [
    {
      icon: ShoppingCart,
      value: '2.3x/week',
      label: 'Shopping Frequency',
      color: '#4f46e5'
    },
    {
      icon: DollarSign,
      value: '$124.50',
      label: 'Avg Weekly Spend',
      color: '#10b981'
    },
    {
      icon: Clock,
      value: '18:30',
      label: 'Peak Shopping Time',
      color: '#f59e0b'
    },
    {
      icon: Package,
      value: '23 items',
      label: 'Avg Basket Size',
      color: '#ef4444'
    }
  ];

  const frequencyData = [
    { day: 'Mon', shops: 12, items: 156, amount: 428.50 },
    { day: 'Tue', shops: 8, items: 89, amount: 234.20 },
    { day: 'Wed', shops: 15, items: 203, amount: 567.80 },
    { day: 'Thu', shops: 11, items: 145, amount: 389.40 },
    { day: 'Fri', shops: 18, items: 267, amount: 734.60 },
    { day: 'Sat', shops: 25, items: 389, amount: 1045.30 },
    { day: 'Sun', shops: 14, items: 187, amount: 498.70 }
  ];

  const timePatternData = [
    { hour: '06:00', frequency: 2 },
    { hour: '08:00', frequency: 8 },
    { hour: '10:00', frequency: 15 },
    { hour: '12:00', frequency: 22 },
    { hour: '14:00', frequency: 18 },
    { hour: '16:00', frequency: 12 },
    { hour: '18:00', frequency: 28 },
    { hour: '20:00', frequency: 19 },
    { hour: '22:00', frequency: 5 }
  ];

  const categoryData = [
    { name: 'Grocery', value: 45, color: '#4f46e5' },
    { name: 'Fresh Produce', value: 25, color: '#10b981' },
    { name: 'Dairy', value: 15, color: '#f59e0b' },
    { name: 'Meat & Seafood', value: 10, color: '#ef4444' },
    { name: 'Other', value: 5, color: '#8b5cf6' }
  ];

  const behaviorData = [
    { subject: 'Impulse Buying', A: 65, fullMark: 100 },
    { subject: 'List Following', A: 88, fullMark: 100 },
    { subject: 'Deal Seeking', A: 72, fullMark: 100 },
    { subject: 'Brand Loyalty', A: 91, fullMark: 100 },
    { subject: 'Quality Focus', A: 85, fullMark: 100 },
    { subject: 'Time Efficiency', A: 78, fullMark: 100 }
  ];

  const loyaltyPatterns = [
    {
      name: 'Fresh Market Downtown',
      frequency: '3.2x/week',
      preference: '68%',
      score: 95
    },
    {
      name: 'QuickStop Express',
      frequency: '1.8x/week',
      preference: '32%',
      score: 78
    },
    {
      name: 'Mega Grocery Center',
      frequency: '0.5x/week',
      preference: '12%',
      score: 45
    }
  ];

  const seasonalPatterns = [
    {
      name: 'Winter Comfort Foods',
      period: 'Dec-Feb',
      increase: '+34%',
      score: 92
    },
    {
      name: 'Summer Fresh Produce',
      period: 'Jun-Aug',
      increase: '+28%',
      score: 88
    },
    {
      name: 'Holiday Preparations',
      period: 'Nov-Dec',
      increase: '+45%',
      score: 95
    },
    {
      name: 'Spring Cleaning',
      period: 'Mar-Apr',
      increase: '+22%',
      score: 75
    }
  ];

  const renderMainChart = () => {
    switch (chartType) {
      case 'frequency':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={frequencyData}>
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="shops" fill="#4f46e5" name="Shopping Trips" />
              <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} name="Amount ($)" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'time':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timePatternData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="frequency" 
                stroke="#4f46e5" 
                fill="#4f46e5" 
                fillOpacity={0.3}
                name="Shopping Frequency"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'behavior':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={behaviorData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Shopping Behavior" 
                dataKey="A" 
                stroke="#4f46e5" 
                fill="#4f46e5" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
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
          <BarChart3 size={20} />
          Shopping Pattern Analysis
        </Title>
        <Controls>
          <TimeFilter value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </TimeFilter>
          <ActionButton>
            <Filter size={16} />
            Filter
          </ActionButton>
          <ActionButton>
            <Download size={16} />
            Export
          </ActionButton>
          <ActionButton>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
        </Controls>
      </Header>

      <InsightsPanel>
        <InsightsHeader>
          <InsightsTitle>
            <Brain size={16} />
            AI-Powered Insights
          </InsightsTitle>
          <ActionButton style={{ padding: '4px 8px' }}>
            <Eye size={12} />
            View Details
          </ActionButton>
        </InsightsHeader>
        
        <KeyInsights>
          {keyInsights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <InsightCard key={index}>
                <InsightIcon color={insight.color}>
                  <Icon size={20} />
                </InsightIcon>
                <InsightContent>
                  <InsightValue>{insight.value}</InsightValue>
                  <InsightLabel>{insight.label}</InsightLabel>
                </InsightContent>
              </InsightCard>
            );
          })}
        </KeyInsights>
      </InsightsPanel>

      <ChartsGrid>
        <ChartPanel>
          <ChartHeader>
            <ChartTitle>
              <Activity size={16} />
              Shopping Patterns
            </ChartTitle>
            <ChartToggle>
              <ToggleButton 
                active={chartType === 'frequency'}
                onClick={() => setChartType('frequency')}
              >
                Frequency
              </ToggleButton>
              <ToggleButton 
                active={chartType === 'time'}
                onClick={() => setChartType('time')}
              >
                Time
              </ToggleButton>
              <ToggleButton 
                active={chartType === 'behavior'}
                onClick={() => setChartType('behavior')}
              >
                Behavior
              </ToggleButton>
            </ChartToggle>
          </ChartHeader>
          <ChartContainer>
            {renderMainChart()}
          </ChartContainer>
        </ChartPanel>

        <ChartPanel>
          <ChartHeader>
            <ChartTitle>
              <PieChart size={16} />
              Category Distribution
            </ChartTitle>
          </ChartHeader>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartPanel>
      </ChartsGrid>

      <BottomGrid>
        <PatternCard>
          <PatternHeader>
            <PatternTitle>
              <MapPin size={16} />
              Store Loyalty Patterns
            </PatternTitle>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Last {timeRange}
            </span>
          </PatternHeader>
          <PatternList>
            {loyaltyPatterns.map((pattern, index) => (
              <PatternItem
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PatternInfo>
                  <PatternName>{pattern.name}</PatternName>
                  <PatternDetail>
                    {pattern.frequency} • {pattern.preference} preference
                  </PatternDetail>
                </PatternInfo>
                <PatternScore>
                  <Star size={12} fill="currentColor" />
                  {pattern.score}
                </PatternScore>
              </PatternItem>
            ))}
          </PatternList>
        </PatternCard>

        <PatternCard>
          <PatternHeader>
            <PatternTitle>
              <Calendar size={16} />
              Seasonal Patterns
            </PatternTitle>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Annual trends
            </span>
          </PatternHeader>
          <PatternList>
            {seasonalPatterns.map((pattern, index) => (
              <PatternItem
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PatternInfo>
                  <PatternName>{pattern.name}</PatternName>
                  <PatternDetail>
                    {pattern.period} • {pattern.increase} vs baseline
                  </PatternDetail>
                </PatternInfo>
                <PatternScore>
                  <TrendingUp size={12} />
                  {pattern.score}%
                </PatternScore>
              </PatternItem>
            ))}
          </PatternList>
        </PatternCard>
      </BottomGrid>
    </Container>
  );
};

export default ShoppingPatternAnalysis;