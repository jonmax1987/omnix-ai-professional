import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  Sankey
} from 'recharts';
import { Users, TrendingUp, ShoppingBag, Clock, Target, Heart, AlertCircle, ArrowRight } from 'lucide-react';

const InsightsContainer = styled.div`
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

const SegmentSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.main};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const SegmentButton = styled.button`
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

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InsightCard = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InsightTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const InsightValue = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const InsightDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0 0 0;
  line-height: 1.5;
`;

const ChartSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ChartContainer = styled.div`
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
`;

const BehaviorPatternGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PatternCard = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary.light}10 0%, 
    ${({ theme }) => theme.colors.secondary.light}10 100%);
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const PatternList = styled.ul`
  margin: ${({ theme }) => theme.spacing.md} 0 0 0;
  padding: 0;
  list-style: none;
`;

const PatternItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const JourneyFlow = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const JourneyStage = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ isActive, theme }) => 
    isActive ? `${theme.colors.primary.light}20` : theme.colors.surface.primary};
  border: 1px solid ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.light : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const StageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StageMetrics = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StageMetric = styled.div`
  text-align: center;
`;

const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MetricValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const CustomerBehaviorInsights = () => {
  const [selectedSegment, setSelectedSegment] = useState('all');

  const behaviorMetrics = useMemo(() => [
    {
      title: 'Average Basket Size',
      value: '$67.42',
      icon: ShoppingBag,
      description: 'Up 12% from last month',
      trend: 'positive'
    },
    {
      title: 'Visit Frequency',
      value: '2.3x/week',
      icon: Clock,
      description: 'Most active on weekends',
      trend: 'stable'
    },
    {
      title: 'Customer Lifetime Value',
      value: '$3,842',
      icon: TrendingUp,
      description: '18 month average',
      trend: 'positive'
    },
    {
      title: 'Loyalty Score',
      value: '8.4/10',
      icon: Heart,
      description: 'Above industry average',
      trend: 'positive'
    },
    {
      title: 'Churn Risk',
      value: '12%',
      icon: AlertCircle,
      description: '142 customers at risk',
      trend: 'negative'
    },
    {
      title: 'Engagement Rate',
      value: '76%',
      icon: Target,
      description: 'Active in last 30 days',
      trend: 'stable'
    }
  ], []);

  const behaviorRadarData = useMemo(() => [
    { attribute: 'Price Sensitivity', premium: 65, value: 80, budget: 95 },
    { attribute: 'Brand Loyalty', premium: 90, value: 70, budget: 50 },
    { attribute: 'Purchase Frequency', premium: 85, value: 75, budget: 60 },
    { attribute: 'Basket Size', premium: 95, value: 60, budget: 40 },
    { attribute: 'Digital Engagement', premium: 80, value: 85, budget: 70 },
    { attribute: 'Promotion Response', premium: 40, value: 70, budget: 90 }
  ], []);

  const timeDistribution = useMemo(() => [
    { hour: '6-9', visits: 342, purchases: 287 },
    { hour: '9-12', visits: 856, purchases: 712 },
    { hour: '12-15', visits: 654, purchases: 543 },
    { hour: '15-18', visits: 923, purchases: 798 },
    { hour: '18-21', visits: 1142, purchases: 976 },
    { hour: '21-24', visits: 423, purchases: 356 }
  ], []);

  const purchasePatterns = useMemo(() => [
    { x: 25, y: 45, z: 120, category: 'Frequent Buyers' },
    { x: 35, y: 65, z: 80, category: 'Premium Shoppers' },
    { x: 45, y: 35, z: 200, category: 'Value Seekers' },
    { x: 55, y: 85, z: 60, category: 'Loyal Customers' },
    { x: 65, y: 55, z: 150, category: 'Occasional Buyers' },
    { x: 75, y: 75, z: 40, category: 'New Customers' }
  ], []);

  const customerJourney = useMemo(() => [
    { stage: 'Discovery', customers: 1245, conversion: '32%', avgTime: '2.3 days' },
    { stage: 'First Purchase', customers: 398, conversion: '78%', avgTime: '1.2 days' },
    { stage: 'Repeat Purchase', customers: 310, conversion: '65%', avgTime: '7.5 days' },
    { stage: 'Loyal Customer', customers: 202, conversion: '92%', avgTime: '30+ days' },
    { stage: 'Brand Advocate', customers: 186, conversion: '100%', avgTime: 'Lifetime' }
  ], []);

  return (
    <InsightsContainer>
      <Header>
        <Title>
          <Users size={24} />
          Customer Behavior Insights
        </Title>
        <SegmentSelector>
          <SegmentButton 
            isActive={selectedSegment === 'all'} 
            onClick={() => setSelectedSegment('all')}
          >
            All Customers
          </SegmentButton>
          <SegmentButton 
            isActive={selectedSegment === 'premium'} 
            onClick={() => setSelectedSegment('premium')}
          >
            Premium
          </SegmentButton>
          <SegmentButton 
            isActive={selectedSegment === 'value'} 
            onClick={() => setSelectedSegment('value')}
          >
            Value Seekers
          </SegmentButton>
          <SegmentButton 
            isActive={selectedSegment === 'budget'} 
            onClick={() => setSelectedSegment('budget')}
          >
            Budget Conscious
          </SegmentButton>
        </SegmentSelector>
      </Header>

      <InsightsGrid>
        {behaviorMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <InsightCard key={index}>
              <InsightHeader>
                <InsightTitle>
                  <Icon size={18} />
                  {metric.title}
                </InsightTitle>
              </InsightHeader>
              <InsightValue>{metric.value}</InsightValue>
              <InsightDescription>{metric.description}</InsightDescription>
            </InsightCard>
          );
        })}
      </InsightsGrid>

      <BehaviorPatternGrid>
        <ChartContainer>
          <ChartTitle>Segment Behavior Profile</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={behaviorRadarData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="attribute" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Premium" dataKey="premium" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
              <Radar name="Value" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Radar name="Budget" dataKey="budget" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Shopping Time Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visits" fill="#4F46E5" name="Store Visits" />
              <Bar dataKey="purchases" fill="#10B981" name="Purchases" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </BehaviorPatternGrid>

      <JourneyFlow>
        <ChartTitle>Customer Journey Analysis</ChartTitle>
        {customerJourney.map((stage, index) => (
          <JourneyStage key={index} isActive={index === 2}>
            <StageInfo>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{stage.stage}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {stage.customers} customers
                </div>
              </div>
            </StageInfo>
            <StageMetrics>
              <StageMetric>
                <MetricLabel>Conversion</MetricLabel>
                <MetricValue>{stage.conversion}</MetricValue>
              </StageMetric>
              <StageMetric>
                <MetricLabel>Avg Time</MetricLabel>
                <MetricValue>{stage.avgTime}</MetricValue>
              </StageMetric>
            </StageMetrics>
            {index < customerJourney.length - 1 && <ArrowRight size={20} color="#9CA3AF" />}
          </JourneyStage>
        ))}
      </JourneyFlow>

      <ChartSection>
        <ChartContainer>
          <ChartTitle>Customer Segmentation Matrix</ChartTitle>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Purchase Frequency" 
                unit="%" 
                domain={[0, 100]}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Average Basket Size" 
                unit="%" 
                domain={[0, 100]}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Customer Segments" data={purchasePatterns} fill="#8884d8">
                {purchasePatterns.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartSection>

      <BehaviorPatternGrid>
        <PatternCard>
          <InsightTitle>Shopping Patterns</InsightTitle>
          <PatternList>
            <PatternItem>
              <ShoppingBag size={16} />
              Peak shopping hours: 6-9 PM (34% of daily traffic)
            </PatternItem>
            <PatternItem>
              <Clock size={16} />
              Average shopping duration: 18 minutes per visit
            </PatternItem>
            <PatternItem>
              <Target size={16} />
              Most popular categories: Groceries (42%), Electronics (23%)
            </PatternItem>
            <PatternItem>
              <Heart size={16} />
              Repeat purchase rate: 68% within 30 days
            </PatternItem>
          </PatternList>
        </PatternCard>

        <PatternCard>
          <InsightTitle>Engagement Insights</InsightTitle>
          <PatternList>
            <PatternItem>
              <Users size={16} />
              Mobile app adoption: 73% of active customers
            </PatternItem>
            <PatternItem>
              <TrendingUp size={16} />
              Email open rate: 42% (industry avg: 28%)
            </PatternItem>
            <PatternItem>
              <AlertCircle size={16} />
              Cart abandonment rate: 31% (decreasing trend)
            </PatternItem>
            <PatternItem>
              <Target size={16} />
              Promotion redemption: 56% of offered discounts
            </PatternItem>
          </PatternList>
        </PatternCard>
      </BehaviorPatternGrid>
    </InsightsContainer>
  );
};

export default CustomerBehaviorInsights;