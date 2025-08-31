/**
 * OMNIX AI - Customer Satisfaction Dashboard
 * Real-time customer satisfaction monitoring and sentiment analysis
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import customerSatisfactionService from '../../services/customerSatisfactionService';
import useCustomerBehaviorStore from '../../store/customerBehaviorStore';
import useWebSocketStore from '../../store/websocketStore';

const DashboardContainer = styled.div`
  padding: 24px;
  background: ${props => props.theme.colors.background};
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SatisfactionIcon = styled(motion.div)`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.card};
  border-radius: 12px;
  border-left: 4px solid ${props => 
    props.level === 'very_satisfied' ? '#10b981' :
    props.level === 'satisfied' ? '#34d399' :
    props.level === 'neutral' ? '#fbbf24' :
    props.level === 'unsatisfied' ? '#f97316' :
    props.level === 'very_unsatisfied' ? '#ef4444' :
    '#6b7280'
  };
  position: relative;
  overflow: hidden;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${props => 
    props.level === 'very_satisfied' ? '#10b981' :
    props.level === 'satisfied' ? '#34d399' :
    props.level === 'neutral' ? '#fbbf24' :
    props.level === 'unsatisfied' ? '#f97316' :
    props.level === 'very_unsatisfied' ? '#ef4444' :
    props.theme.colors.text.primary
  };
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  margin-bottom: 8px;
`;

const StatTrend = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => 
    props.trend === 'improving' ? '#10b981' :
    props.trend === 'declining' ? '#ef4444' :
    '#6b7280'
  };
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ScoreIndicator = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    ${props => 
      props.score >= 80 ? '#10b981' :
      props.score >= 60 ? '#fbbf24' :
      '#ef4444'
    } 0deg,
    ${props => 
      props.score >= 80 ? '#10b981' :
      props.score >= 60 ? '#fbbf24' :
      '#ef4444'
    } ${props => props.score * 3.6}deg,
    #e5e7eb ${props => props.score * 3.6}deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  
  &::before {
    content: '';
    position: absolute;
    width: 36px;
    height: 36px;
    background: ${props => props.theme.colors.card};
    border-radius: 50%;
  }
  
  span {
    position: relative;
    z-index: 1;
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.card};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterTab = styled(motion.button)`
  padding: 8px 16px;
  border: 2px solid ${props => props.active ? '#10b981' : props.theme.colors.border};
  background: ${props => props.active ? '#10b981' : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    border-color: #10b981;
  }
`;

const SatisfactionList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const SatisfactionCard = styled(motion.div)`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => 
    props.level === 'very_satisfied' ? '#10b981' :
    props.level === 'satisfied' ? '#34d399' :
    props.level === 'neutral' ? '#fbbf24' :
    props.level === 'unsatisfied' ? '#f97316' :
    '#ef4444'
  };

  &:last-child {
    margin-bottom: 0;
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
`;

const CustomerId = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const SatisfactionInfo = styled.div`
  text-align: right;
`;

const SatisfactionScore = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => 
    props.score >= 80 ? '#10b981' :
    props.score >= 60 ? '#fbbf24' :
    '#ef4444'
  };
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SatisfactionLevel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: capitalize;
`;

const ModelBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin: 12px 0;
`;

const ModelScore = styled.div`
  text-align: center;
  padding: 8px;
  background: ${props => props.theme.colors.background};
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ModelValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => 
    props.score >= 80 ? '#10b981' :
    props.score >= 60 ? '#fbbf24' :
    '#ef4444'
  };
`;

const ModelLabel = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
`;

const InsightsList = styled.div`
  margin: 12px 0;
`;

const InsightItem = styled.div`
  padding: 8px 12px;
  background: ${props => 
    props.type === 'strength' ? '#ecfdf5' :
    props.type === 'concern' ? '#fef2f2' :
    '#f8fafc'
  };
  border: 1px solid ${props => 
    props.type === 'strength' ? '#bbf7d0' :
    props.type === 'concern' ? '#fecaca' :
    '#e2e8f0'
  };
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.primary};

  &:last-child {
    margin-bottom: 0;
  }
`;

const RecommendationList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const RecommendationChip = styled.div`
  padding: 4px 8px;
  background: ${props => 
    props.priority === 'urgent' ? '#ef4444' :
    props.priority === 'high' ? '#f97316' :
    props.priority === 'medium' ? '#fbbf24' :
    '#10b981'
  };
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const AlertList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const AlertCard = styled(motion.div)`
  background: ${props => 
    props.urgency === 'high' ? '#fef2f2' :
    props.urgency === 'medium' ? '#fffbeb' :
    '#f0fdf4'
  };
  border: 1px solid ${props => 
    props.urgency === 'high' ? '#fecaca' :
    props.urgency === 'medium' ? '#fed7aa' :
    '#bbf7d0'
  };
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const AlertType = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => 
    props.urgency === 'high' ? '#ef4444' :
    props.urgency === 'medium' ? '#f59e0b' :
    '#10b981'
  };
`;

const AlertTime = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
`;

const AlertMessage = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 12px;
  line-height: 1.4;
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const FeedbackCard = styled(motion.div)`
  padding: 16px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  border-left: 4px solid ${props => 
    props.sentiment === 'positive' ? '#10b981' :
    props.sentiment === 'negative' ? '#ef4444' :
    '#6b7280'
  };
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const FeedbackType = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => props.theme.colors.text.secondary};
`;

const SentimentBadge = styled.div`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => 
    props.sentiment === 'positive' ? '#ecfdf5' :
    props.sentiment === 'negative' ? '#fef2f2' :
    '#f8fafc'
  };
  color: ${props => 
    props.sentiment === 'positive' ? '#065f46' :
    props.sentiment === 'negative' ? '#991b1b' :
    '#374151'
  };
`;

const FeedbackText = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.4;
  margin-bottom: 8px;
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
`;

const ConfidenceFill = styled(motion.div)`
  height: 100%;
  background: ${props => 
    props.confidence >= 0.8 ? '#10b981' :
    props.confidence >= 0.6 ? '#fbbf24' :
    '#ef4444'
  };
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.text.secondary};
`;

const CustomerSatisfactionDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [satisfactionScores, setSatisfactionScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({});

  const { 
    satisfactionScores: storedScores = new Map(), 
    satisfactionFeedback = [],
    satisfactionAlerts = [] 
  } = useCustomerBehaviorStore();
  
  const { isConnected } = useWebSocketStore();

  // Sample customer IDs for demo
  const sampleCustomerIds = [
    'CUST001', 'CUST002', 'CUST003', 'CUST004', 'CUST005',
    'CUST006', 'CUST007', 'CUST008', 'CUST009', 'CUST010'
  ];

  useEffect(() => {
    const loadSatisfactionData = async () => {
      setLoading(true);
      try {
        // Load batch satisfaction scores
        const batchScores = customerSatisfactionService.batchCalculateSatisfaction(sampleCustomerIds);
        setSatisfactionScores(batchScores.satisfactionScores);
        
        // Load statistics
        const stats = customerSatisfactionService.getStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Error loading satisfaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSatisfactionData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!refreshing && isConnected) {
        setRefreshing(true);
        try {
          const batchScores = customerSatisfactionService.batchCalculateSatisfaction(sampleCustomerIds);
          setSatisfactionScores(batchScores.satisfactionScores);
          
          const stats = customerSatisfactionService.getStatistics();
          setStatistics(stats);
        } catch (error) {
          console.error('Error refreshing satisfaction data:', error);
        } finally {
          setRefreshing(false);
        }
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [refreshing, isConnected]);

  const filteredScores = useMemo(() => {
    if (activeFilter === 'all') return satisfactionScores;
    return satisfactionScores.filter(score => score.satisfactionLevel === activeFilter);
  }, [satisfactionScores, activeFilter]);

  const stats = useMemo(() => {
    const distribution = satisfactionScores.reduce((acc, score) => {
      acc[score.satisfactionLevel] = (acc[score.satisfactionLevel] || 0) + 1;
      return acc;
    }, {});

    const avgScore = satisfactionScores.length > 0 ? 
      satisfactionScores.reduce((sum, score) => sum + score.overallScore, 0) / satisfactionScores.length : 0;

    const trendCounts = satisfactionScores.reduce((acc, score) => {
      acc[score.trendDirection] = (acc[score.trendDirection] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCustomers: satisfactionScores.length,
      averageScore: avgScore,
      distribution,
      trends: trendCounts,
      highSatisfaction: (distribution.very_satisfied || 0) + (distribution.satisfied || 0),
      lowSatisfaction: (distribution.unsatisfied || 0) + (distribution.very_unsatisfied || 0)
    };
  }, [satisfactionScores]);

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingState>Loading customer satisfaction data...</LoadingState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Title>
            <SatisfactionIcon
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              😊
            </SatisfactionIcon>
            Customer Satisfaction
          </Title>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: isConnected ? '#10b981' : '#ef4444'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: isConnected ? '#10b981' : '#ef4444' 
          }} />
          {isConnected ? 'Live' : 'Offline'}
          {refreshing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: '14px' }}
            >
              ⟳
            </motion.div>
          )}
        </div>
      </Header>

      <StatsGrid>
        <StatCard
          level="average"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatValue>
            {Math.round(stats.averageScore)}%
          </StatValue>
          <StatLabel>Average Satisfaction</StatLabel>
          <StatTrend trend={stats.trends.improving > stats.trends.declining ? 'improving' : 'declining'}>
            {stats.trends.improving > stats.trends.declining ? '↗' : '↘'} 
            {stats.trends.improving || 0} improving, {stats.trends.declining || 0} declining
          </StatTrend>
          <ScoreIndicator score={stats.averageScore}>
            <span>{Math.round(stats.averageScore)}</span>
          </ScoreIndicator>
        </StatCard>

        <StatCard
          level="very_satisfied"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatValue level="very_satisfied">
            {stats.highSatisfaction}
          </StatValue>
          <StatLabel>Satisfied Customers</StatLabel>
          <StatTrend trend="stable">
            📈 {Math.round((stats.highSatisfaction / stats.totalCustomers) * 100)}% of total
          </StatTrend>
        </StatCard>

        <StatCard
          level="unsatisfied"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatValue level="unsatisfied">
            {stats.lowSatisfaction}
          </StatValue>
          <StatLabel>At-Risk Customers</StatLabel>
          <StatTrend trend="declining">
            ⚠ {Math.round((stats.lowSatisfaction / stats.totalCustomers) * 100)}% need attention
          </StatTrend>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatValue>
            {satisfactionAlerts.length}
          </StatValue>
          <StatLabel>Active Alerts</StatLabel>
          <StatTrend trend="stable">
            🚨 Real-time monitoring
          </StatTrend>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <MainSection>
          <Card>
            <CardHeader>
              <CardTitle>
                📊 Customer Satisfaction Scores
              </CardTitle>
            </CardHeader>
            
            <FilterTabs>
              {[
                { id: 'all', label: 'All Customers' },
                { id: 'very_satisfied', label: 'Very Satisfied' },
                { id: 'satisfied', label: 'Satisfied' },
                { id: 'neutral', label: 'Neutral' },
                { id: 'unsatisfied', label: 'Unsatisfied' }
              ].map(filter => (
                <FilterTab
                  key={filter.id}
                  active={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {filter.label}
                </FilterTab>
              ))}
            </FilterTabs>

            <SatisfactionList>
              <AnimatePresence mode="popLayout">
                {filteredScores.map((score, index) => (
                  <SatisfactionCard
                    key={score.customerId}
                    level={score.satisfactionLevel}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <CustomerInfo>
                      <div>
                        <CustomerName>Customer {score.customerId}</CustomerName>
                        <CustomerId>ID: {score.customerId}</CustomerId>
                      </div>
                      <SatisfactionInfo>
                        <SatisfactionScore score={score.overallScore}>
                          {Math.round(score.overallScore)}%
                          {score.trendDirection === 'improving' && '📈'}
                          {score.trendDirection === 'declining' && '📉'}
                        </SatisfactionScore>
                        <SatisfactionLevel>
                          {score.satisfactionLevel.replace('_', ' ')}
                        </SatisfactionLevel>
                      </SatisfactionInfo>
                    </CustomerInfo>

                    <ModelBreakdown>
                      {Object.entries(score.modelBreakdown).slice(0, 4).map(([model, data]) => (
                        <ModelScore key={model}>
                          <ModelValue score={data.score}>{Math.round(data.score)}</ModelValue>
                          <ModelLabel>{model.replace('_', ' ')}</ModelLabel>
                        </ModelScore>
                      ))}
                    </ModelBreakdown>

                    <InsightsList>
                      {score.insights.slice(0, 2).map((insight, idx) => (
                        <InsightItem key={idx} type={insight.type}>
                          {insight.message}
                        </InsightItem>
                      ))}
                    </InsightsList>

                    <RecommendationList>
                      {score.recommendations.slice(0, 3).map((rec, idx) => (
                        <RecommendationChip key={idx} priority={rec.priority}>
                          {rec.action.replace('_', ' ')}
                        </RecommendationChip>
                      ))}
                    </RecommendationList>
                  </SatisfactionCard>
                ))}
              </AnimatePresence>
            </SatisfactionList>

            {filteredScores.length === 0 && (
              <EmptyState>
                No customers match the selected satisfaction level.
              </EmptyState>
            )}
          </Card>
        </MainSection>

        <SideSection>
          <Card>
            <CardHeader>
              <CardTitle>
                🚨 Satisfaction Alerts
              </CardTitle>
            </CardHeader>
            
            <AlertList>
              <AnimatePresence>
                {satisfactionAlerts.slice(0, 5).map(alert => (
                  <AlertCard
                    key={alert.id}
                    urgency={alert.urgency}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AlertHeader>
                      <AlertType urgency={alert.urgency}>
                        {alert.type.replace('_', ' ')}
                      </AlertType>
                      <AlertTime>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </AlertTime>
                    </AlertHeader>
                    
                    <AlertMessage>{alert.message}</AlertMessage>
                    
                    {alert.recommendations && (
                      <RecommendationList>
                        {alert.recommendations.slice(0, 2).map((rec, idx) => (
                          <RecommendationChip key={idx} priority={rec.priority}>
                            {rec.action.replace('_', ' ')}
                          </RecommendationChip>
                        ))}
                      </RecommendationList>
                    )}
                  </AlertCard>
                ))}
              </AnimatePresence>
              
              {satisfactionAlerts.length === 0 && (
                <EmptyState style={{ padding: '20px' }}>
                  No active satisfaction alerts
                </EmptyState>
              )}
            </AlertList>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                💬 Recent Feedback
              </CardTitle>
            </CardHeader>
            
            <FeedbackList>
              {satisfactionFeedback.slice(0, 5).map((feedback, index) => (
                <FeedbackCard
                  key={feedback.id}
                  sentiment={feedback.satisfactionUpdate?.modelBreakdown?.sentiment?.factors?.sentiment_polarity || 'neutral'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FeedbackHeader>
                    <FeedbackType>{feedback.type}</FeedbackType>
                    <SentimentBadge sentiment={feedback.satisfactionUpdate?.modelBreakdown?.sentiment?.factors?.sentiment_polarity || 'neutral'}>
                      {feedback.satisfactionUpdate?.modelBreakdown?.sentiment?.factors?.sentiment_polarity || 'neutral'}
                    </SentimentBadge>
                  </FeedbackHeader>
                  
                  <FeedbackText>
                    Customer {feedback.customerId} • Score: {Math.round(feedback.satisfactionUpdate?.overallScore || 50)}%
                  </FeedbackText>
                  
                  <ConfidenceBar>
                    <ConfidenceFill
                      confidence={feedback.satisfactionUpdate?.confidence || 0.5}
                      initial={{ width: 0 }}
                      animate={{ width: `${(feedback.satisfactionUpdate?.confidence || 0.5) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </ConfidenceBar>
                </FeedbackCard>
              ))}
              
              {satisfactionFeedback.length === 0 && (
                <EmptyState style={{ padding: '20px' }}>
                  No recent feedback available
                </EmptyState>
              )}
            </FeedbackList>
          </Card>
        </SideSection>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default CustomerSatisfactionDashboard;