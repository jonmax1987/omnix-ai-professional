import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Package, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Check, 
  X, 
  Plus,
  Minus,
  ShoppingCart,
  Star,
  AlertCircle,
  Brain,
  Zap,
  Target,
  Settings,
  Filter,
  Calendar,
  BarChart3,
  Lightbulb,
  Timer,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AIOverview = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}10, ${({ theme }) => theme.colors.primary}05);
  border: 1px solid ${({ theme }) => theme.colors.primary}20;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const OverviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const OverviewTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const SummaryText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const SuggestionsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  padding: 4px;
`;

const FilterTab = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: ${({ active, theme }) => active ? 'white' : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text.primary : theme.colors.text.secondary};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) => active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
`;

const SuggestionsList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const SuggestionCard = styled(motion.div)`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SuggestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ProductDetails = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const PriorityBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => !['priority'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: ${({ priority, theme }) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
`;

const AIInsights = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const InsightRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InsightLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InsightValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}10;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 40px;
  text-align: center;
`;

const SuggestionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SuggestionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary : 'white'};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? 'white' : theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ variant, theme }) => 
      variant === 'primary' ? theme.colors.primary : theme.colors.gray[50]};
  }
`;

const FeedbackButtons = styled.div`
  display: flex;
  gap: 4px;
  position: absolute;
  top: 12px;
  right: 12px;
`;

const FeedbackButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: ${({ active, positive, theme }) => 
    active ? (positive ? theme.colors.success : theme.colors.error) : theme.colors.gray[100]};
  color: ${({ active }) => active ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ positive, theme }) => 
      positive ? theme.colors.success : theme.colors.error};
    color: white;
  }
`;

const AnalyticsPanel = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const AnalyticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AnalyticsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartContainer = styled.div`
  height: 200px;
  margin-bottom: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StatItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatText = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AutomaticReplenishmentSuggestions = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [suggestions, setSuggestions] = useState([]);

  const metrics = [
    { value: '12', label: 'Active Suggestions' },
    { value: '94%', label: 'Accuracy Rate' },
    { value: '$127', label: 'Potential Savings' },
    { value: '3.2', label: 'Days Saved' }
  ];

  const replenishmentData = [
    { date: '2024-06-15', accepted: 8, declined: 2, auto: 5 },
    { date: '2024-06-16', accepted: 6, declined: 1, auto: 7 },
    { date: '2024-06-17', accepted: 9, declined: 3, auto: 4 },
    { date: '2024-06-18', accepted: 7, declined: 1, auto: 6 },
    { date: '2024-06-19', accepted: 11, declined: 2, auto: 8 },
    { date: '2024-06-20', accepted: 5, declined: 0, auto: 9 },
    { date: '2024-06-21', accepted: 8, declined: 1, auto: 7 }
  ];

  const suggestionsList = [
    {
      id: 1,
      product: 'Organic Milk',
      category: 'Dairy',
      currentStock: 0,
      suggestedQuantity: 2,
      price: 4.99,
      priority: 'high',
      reason: 'Usually consumed every 3 days',
      confidence: 94,
      savings: 0,
      lastBought: '3 days ago',
      avgConsumption: '1 per 3.2 days',
      feedback: null
    },
    {
      id: 2,
      product: 'Greek Yogurt',
      category: 'Dairy',
      currentStock: 1,
      suggestedQuantity: 3,
      price: 6.50,
      priority: 'medium',
      reason: 'Bulk discount available (15% off)',
      confidence: 87,
      savings: 2.93,
      lastBought: '5 days ago',
      avgConsumption: '2 per week',
      feedback: null
    },
    {
      id: 3,
      product: 'Whole Grain Bread',
      category: 'Bakery',
      currentStock: 0,
      suggestedQuantity: 1,
      price: 4.50,
      priority: 'high',
      reason: 'Consumption pattern indicates need',
      confidence: 91,
      savings: 0,
      lastBought: '6 days ago',
      avgConsumption: '1 per 5.8 days',
      feedback: null
    },
    {
      id: 4,
      product: 'Bananas',
      category: 'Produce',
      currentStock: 2,
      suggestedQuantity: 6,
      price: 3.50,
      priority: 'medium',
      reason: 'Price drop detected (20% off)',
      confidence: 83,
      savings: 0.70,
      lastBought: '2 days ago',
      avgConsumption: '4 per week',
      feedback: null
    },
    {
      id: 5,
      product: 'Olive Oil',
      category: 'Pantry',
      currentStock: 1,
      suggestedQuantity: 1,
      price: 12.99,
      priority: 'low',
      reason: 'Monthly restocking due',
      confidence: 76,
      savings: 0,
      lastBought: '3 weeks ago',
      avgConsumption: '1 per month',
      feedback: null
    }
  ];

  const filterTabs = [
    { id: 'all', label: 'All Suggestions', count: suggestionsList.length },
    { id: 'high', label: 'High Priority', count: suggestionsList.filter(s => s.priority === 'high').length },
    { id: 'savings', label: 'Best Deals', count: suggestionsList.filter(s => s.savings > 0).length },
    { id: 'auto', label: 'Auto-Buy Ready', count: 3 }
  ];

  const filteredSuggestions = suggestionsList.filter(suggestion => {
    switch (activeFilter) {
      case 'high': return suggestion.priority === 'high';
      case 'savings': return suggestion.savings > 0;
      case 'auto': return suggestion.confidence > 90;
      default: return true;
    }
  });

  const updateQuantity = (id, change) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, suggestedQuantity: Math.max(0, s.suggestedQuantity + change) } : s
    ));
  };

  const provideFeedback = (id, positive) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, feedback: positive } : s
    ));
  };

  const acceptSuggestion = (id) => {
    console.log('Accept suggestion:', id);
  };

  const declineSuggestion = (id) => {
    console.log('Decline suggestion:', id);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Clock;
      case 'low': return Target;
      default: return Package;
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
          <RefreshCw size={20} />
          Auto Replenishment
        </Title>
        <Controls>
          <ActionButton primary>
            <Zap size={16} />
            Enable Auto-Buy
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
            Configure
          </ActionButton>
        </Controls>
      </Header>

      <AIOverview>
        <OverviewHeader>
          <OverviewTitle>
            <Brain size={16} />
            AI Analysis Summary
          </OverviewTitle>
          <ActionButton style={{ padding: '4px 8px' }}>
            <RefreshCw size={12} />
          </ActionButton>
        </OverviewHeader>
        
        <MetricsGrid>
          {metrics.map((metric, index) => (
            <MetricCard key={index}>
              <MetricValue>{metric.value}</MetricValue>
              <MetricLabel>{metric.label}</MetricLabel>
            </MetricCard>
          ))}
        </MetricsGrid>
        
        <SummaryText>
          <Lightbulb size={16} />
          Based on your consumption patterns, we suggest restocking 12 items with potential savings of $127. 
          3 items are ready for automatic purchasing.
        </SummaryText>
      </AIOverview>

      <ContentLayout>
        <SuggestionsPanel>
          <FilterTabs>
            {filterTabs.map(tab => (
              <FilterTab
                key={tab.id}
                active={activeFilter === tab.id}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label} ({tab.count})
              </FilterTab>
            ))}
          </FilterTabs>

          <SuggestionsList>
            {filteredSuggestions.map((suggestion, index) => {
              const PriorityIcon = getPriorityIcon(suggestion.priority);
              return (
                <SuggestionCard
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <FeedbackButtons>
                    <FeedbackButton
                      positive
                      active={suggestion.feedback === true}
                      onClick={() => provideFeedback(suggestion.id, true)}
                    >
                      <ThumbsUp size={12} />
                    </FeedbackButton>
                    <FeedbackButton
                      active={suggestion.feedback === false}
                      onClick={() => provideFeedback(suggestion.id, false)}
                    >
                      <ThumbsDown size={12} />
                    </FeedbackButton>
                  </FeedbackButtons>

                  <SuggestionHeader>
                    <ProductInfo>
                      <ProductName>{suggestion.product}</ProductName>
                      <ProductDetails>
                        {suggestion.category} • Stock: {suggestion.currentStock} • ${suggestion.price.toFixed(2)} each
                      </ProductDetails>
                    </ProductInfo>
                    <PriorityBadge priority={suggestion.priority}>
                      <PriorityIcon size={10} />
                      {suggestion.priority.toUpperCase()}
                    </PriorityBadge>
                  </SuggestionHeader>

                  <AIInsights>
                    <InsightRow>
                      <InsightLabel>Reason:</InsightLabel>
                      <InsightValue>{suggestion.reason}</InsightValue>
                    </InsightRow>
                    <InsightRow>
                      <InsightLabel>Confidence:</InsightLabel>
                      <InsightValue>{suggestion.confidence}%</InsightValue>
                    </InsightRow>
                    <InsightRow>
                      <InsightLabel>Consumption Rate:</InsightLabel>
                      <InsightValue>{suggestion.avgConsumption}</InsightValue>
                    </InsightRow>
                    {suggestion.savings > 0 && (
                      <InsightRow>
                        <InsightLabel>Potential Savings:</InsightLabel>
                        <InsightValue style={{ color: '#10b981' }}>
                          ${suggestion.savings.toFixed(2)}
                        </InsightValue>
                      </InsightRow>
                    )}
                  </AIInsights>

                  <QuantityControls>
                    <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '60px' }}>
                      Quantity:
                    </span>
                    <QuantityButton 
                      onClick={() => updateQuantity(suggestion.id, -1)}
                      disabled={suggestion.suggestedQuantity <= 0}
                    >
                      <Minus size={12} />
                    </QuantityButton>
                    <QuantityDisplay>{suggestion.suggestedQuantity}</QuantityDisplay>
                    <QuantityButton onClick={() => updateQuantity(suggestion.id, 1)}>
                      <Plus size={12} />
                    </QuantityButton>
                    <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>
                      Total: ${(suggestion.price * suggestion.suggestedQuantity).toFixed(2)}
                    </span>
                  </QuantityControls>

                  <SuggestionActions>
                    <SuggestionButton 
                      variant="primary"
                      onClick={() => acceptSuggestion(suggestion.id)}
                    >
                      <ShoppingCart size={12} />
                      Add to Cart
                    </SuggestionButton>
                    <SuggestionButton onClick={() => declineSuggestion(suggestion.id)}>
                      <X size={12} />
                      Decline
                    </SuggestionButton>
                  </SuggestionActions>
                </SuggestionCard>
              );
            })}
          </SuggestionsList>
        </SuggestionsPanel>

        <AnalyticsPanel>
          <AnalyticsHeader>
            <AnalyticsTitle>
              <BarChart3 size={16} />
              Performance
            </AnalyticsTitle>
          </AnalyticsHeader>

          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={replenishmentData}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="accepted" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981" 
                  name="Accepted"
                />
                <Area 
                  type="monotone" 
                  dataKey="auto" 
                  stackId="1"
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  name="Auto-Buy"
                />
                <Area 
                  type="monotone" 
                  dataKey="declined" 
                  stackId="1"
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  name="Declined"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          <StatsGrid>
            <StatItem>
              <StatNumber>89%</StatNumber>
              <StatText>Acceptance Rate</StatText>
            </StatItem>
            <StatItem>
              <StatNumber>$342</StatNumber>
              <StatText>Total Savings</StatText>
            </StatItem>
            <StatItem>
              <StatNumber>47</StatNumber>
              <StatText>Auto Purchases</StatText>
            </StatItem>
            <StatItem>
              <StatNumber>4.8</StatNumber>
              <StatText>Satisfaction Score</StatText>
            </StatItem>
          </StatsGrid>
        </AnalyticsPanel>
      </ContentLayout>
    </Container>
  );
};

export default AutomaticReplenishmentSuggestions;