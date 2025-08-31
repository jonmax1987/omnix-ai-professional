/**
 * OMNIX AI - A/B Testing Dashboard
 * MGR-027: Live A/B test result updates with statistical analysis
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocketStore } from '../../store/websocketStore';
import abTestingService from '../../services/abTestingService';

const DashboardContainer = styled.div`
  padding: 1.5rem;
  min-height: 100vh;
  background: ${props => props.theme.colors.background.primary};
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LiveIndicator = styled(motion.div)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$isLive ? '#22c55e' : '#6b7280'};
  box-shadow: ${props => props.$isLive ? '0 0 12px rgba(34, 197, 94, 0.6)' : 'none'};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid ${props => props.theme.colors.border.primary};
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  border: none;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.background.secondary};
  }

  ${props => props.$active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: ${props.theme.colors.primary.main};
    }
  `}
`;

const TestGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
`;

const TestCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border: 2px solid ${props => {
    if (props.$isSignificant) return '#22c55e';
    if (props.$isRunning) return '#3b82f6';
    return props.theme.colors.border.primary;
  }};
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const TestHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  position: relative;
`;

const TestStatus = styled.span`
  background: ${props => {
    switch (props.$status) {
      case 'running': return '#3b82f6';
      case 'completed': return '#22c55e';
      case 'paused': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const TestName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
  max-width: 70%;
`;

const TestDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  line-height: 1.4;
`;

const TestMetrics = styled.div`
  padding: 1.5rem;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 8px;
  border-left: 4px solid ${props => props.$color || props.theme.colors.primary.main};
`;

const MetricLabel = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const MetricValue = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$color || props.theme.colors.primary.main};
`;

const VariantContainer = styled.div`
  margin-top: 1.5rem;
`;

const VariantGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const VariantCard = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border: 2px solid ${props => {
    if (props.$isControl) return '#f59e0b';
    if (props.$isSignificant) return '#22c55e';
    return props.theme.colors.border.primary;
  }};
  border-radius: 8px;
  padding: 1rem;
  position: relative;
`;

const VariantBadge = styled.span`
  background: ${props => props.$isControl ? '#f59e0b' : '#6b7280'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
`;

const VariantName = styled.h4`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.75rem;
  max-width: 70%;
`;

const VariantMetric = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const VariantMetricLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.75rem;
`;

const VariantMetricValue = styled.span`
  font-weight: 600;
  color: ${props => props.$isPositive ? '#22c55e' : props.$isNegative ? '#ef4444' : props.theme.colors.text.primary};
`;

const StatisticalAnalysis = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 8px;
  border: 2px solid ${props => props.$isSignificant ? '#22c55e' : '#f59e0b'};
`;

const SignificanceIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SignificanceIcon = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$isSignificant ? '#22c55e' : '#f59e0b'};
  position: relative;

  &::after {
    content: '${props => props.$isSignificant ? '✓' : '⚠'}';
    color: white;
    font-size: 10px;
    font-weight: bold;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const RecommendationBanner = styled(motion.div)`
  background: ${props => {
    switch (props.$action) {
      case 'conclude': return 'linear-gradient(135deg, #22c55e, #16a34a)';
      case 'continue': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      default: return 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
  }};
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.colors.border.primary};
  border-top: 3px solid ${props => props.theme.colors.primary.main};
  border-radius: 50%;
  margin: 2rem auto;
`;

const ABTestingDashboard = () => {
  const [activeTab, setActiveTab] = useState('running');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { isConnected } = useWebSocketStore();

  useEffect(() => {
    // Subscribe to A/B testing service updates
    const unsubscribe = abTestingService.subscribe((update) => {
      setLastUpdate(new Date());
      
      if (update.event === 'test_created' || update.event === 'test_started' || update.event === 'test_updated') {
        setTests(current => {
          const newTests = [...current];
          const existingIndex = newTests.findIndex(t => t.test.id === update.data.test.id);
          
          if (existingIndex >= 0) {
            newTests[existingIndex] = update.data;
          } else {
            newTests.push(update.data);
          }
          
          return newTests.sort((a, b) => new Date(b.test.createdAt) - new Date(a.test.createdAt));
        });
      }
    });

    // Load initial tests
    const loadTests = () => {
      const activeTests = abTestingService.getActiveTests();
      setTests(activeTests);
      setLoading(false);
    };

    loadTests();
    return unsubscribe;
  }, []);

  const filteredTests = tests.filter(testData => {
    switch (activeTab) {
      case 'running':
        return testData.test.status === 'running';
      case 'completed':
        return testData.test.status === 'completed';
      case 'significant':
        return testData.results?.statisticalAnalysis?.isSignificant;
      default:
        return true;
    }
  });

  const getTabCounts = () => {
    return {
      running: tests.filter(t => t.test.status === 'running').length,
      completed: tests.filter(t => t.test.status === 'completed').length,
      significant: tests.filter(t => t.results?.statisticalAnalysis?.isSignificant).length,
      all: tests.length
    };
  };

  const tabCounts = getTabCounts();

  const formatDuration = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffInDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Started today';
    if (diffInDays === 1) return '1 day';
    return `${diffInDays} days`;
  };

  const getRecommendationMessage = (analysis) => {
    if (!analysis) return null;

    switch (analysis.recommendedAction) {
      case 'conclude':
        return 'Test shows significant results. Consider concluding and implementing the winning variant.';
      case 'continue':
        return analysis.isSignificant 
          ? 'Test is significant but still within optimal duration. Continue for more data.'
          : 'Continue test to reach statistical significance.';
      default:
        return 'Monitor test progress and statistical significance.';
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>
          A/B Testing Dashboard
          <LiveIndicator
            $isLive={isConnected}
            animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </Title>
        <Subtitle>
          Live statistical analysis and test performance
          {lastUpdate && (
            <span>• Last update: {lastUpdate.toLocaleTimeString()}</span>
          )}
        </Subtitle>
      </Header>

      <TabContainer>
        <TabList>
          <Tab 
            $active={activeTab === 'running'} 
            onClick={() => setActiveTab('running')}
          >
            Running ({tabCounts.running})
          </Tab>
          <Tab 
            $active={activeTab === 'significant'} 
            onClick={() => setActiveTab('significant')}
          >
            Significant ({tabCounts.significant})
          </Tab>
          <Tab 
            $active={activeTab === 'completed'} 
            onClick={() => setActiveTab('completed')}
          >
            Completed ({tabCounts.completed})
          </Tab>
          <Tab 
            $active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            All Tests ({tabCounts.all})
          </Tab>
        </TabList>
      </TabContainer>

      <AnimatePresence mode="wait">
        {filteredTests.length === 0 ? (
          <EmptyState>
            <h3>No tests found</h3>
            <p>No A/B tests match the current filter criteria.</p>
          </EmptyState>
        ) : (
          <TestGrid>
            {filteredTests.map((testData, index) => {
              const { test, results } = testData;
              const analysis = results?.statisticalAnalysis;
              
              return (
                <TestCard
                  key={test.id}
                  $isRunning={test.status === 'running'}
                  $isSignificant={analysis?.isSignificant}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TestHeader>
                    <TestStatus $status={test.status}>
                      {test.status}
                    </TestStatus>
                    <TestName>{test.name}</TestName>
                    <TestDescription>{test.description}</TestDescription>
                  </TestHeader>

                  <TestMetrics>
                    <MetricRow $color="#3b82f6">
                      <MetricLabel>Total Participants</MetricLabel>
                      <MetricValue $color="#3b82f6">
                        {results?.totalParticipants?.toLocaleString() || 0}
                      </MetricValue>
                    </MetricRow>

                    <MetricRow $color="#f59e0b">
                      <MetricLabel>Test Duration</MetricLabel>
                      <MetricValue $color="#f59e0b">
                        {test.startDate ? formatDuration(test.startDate) : 'Not started'}
                      </MetricValue>
                    </MetricRow>

                    {analysis && (
                      <MetricRow $color={analysis.isSignificant ? "#22c55e" : "#ef4444"}>
                        <MetricLabel>Confidence Level</MetricLabel>
                        <MetricValue $color={analysis.isSignificant ? "#22c55e" : "#ef4444"}>
                          {analysis.confidenceLevel.toFixed(1)}%
                        </MetricValue>
                      </MetricRow>
                    )}
                  </TestMetrics>

                  {results && results.variants && (
                    <VariantContainer>
                      <VariantGrid>
                        {results.variants.map((variant) => {
                          const testVariant = test.variants.find(v => v.id === variant.variantId);
                          const isControl = testVariant?.isControl;
                          
                          return (
                            <VariantCard
                              key={variant.variantId}
                              $isControl={isControl}
                              $isSignificant={variant.statisticalSignificance}
                            >
                              <VariantBadge $isControl={isControl}>
                                {isControl ? 'Control' : 'Variant'}
                              </VariantBadge>
                              
                              <VariantName>{variant.name}</VariantName>
                              
                              <VariantMetric>
                                <VariantMetricLabel>Participants</VariantMetricLabel>
                                <VariantMetricValue>
                                  {variant.participants.toLocaleString()}
                                </VariantMetricValue>
                              </VariantMetric>
                              
                              <VariantMetric>
                                <VariantMetricLabel>Conversion Rate</VariantMetricLabel>
                                <VariantMetricValue>
                                  {variant.conversionRate}%
                                </VariantMetricValue>
                              </VariantMetric>
                              
                              {variant.liftOverControl !== null && !isControl && (
                                <VariantMetric>
                                  <VariantMetricLabel>Lift</VariantMetricLabel>
                                  <VariantMetricValue
                                    $isPositive={variant.liftOverControl > 0}
                                    $isNegative={variant.liftOverControl < 0}
                                  >
                                    {variant.liftOverControl > 0 ? '+' : ''}{variant.liftOverControl.toFixed(2)}%
                                  </VariantMetricValue>
                                </VariantMetric>
                              )}
                            </VariantCard>
                          );
                        })}
                      </VariantGrid>
                    </VariantContainer>
                  )}

                  {analysis && (
                    <StatisticalAnalysis $isSignificant={analysis.isSignificant}>
                      <SignificanceIndicator>
                        <SignificanceIcon $isSignificant={analysis.isSignificant} />
                        <span style={{ fontWeight: 600 }}>
                          {analysis.isSignificant ? 'Statistically Significant' : 'Not Yet Significant'}
                        </span>
                      </SignificanceIndicator>
                      
                      {analysis.pValue && (
                        <VariantMetric>
                          <VariantMetricLabel>P-Value</VariantMetricLabel>
                          <VariantMetricValue>{analysis.pValue.toFixed(4)}</VariantMetricValue>
                        </VariantMetric>
                      )}
                      
                      <VariantMetric>
                        <VariantMetricLabel>Progress</VariantMetricLabel>
                        <VariantMetricValue>{analysis.progressPercentage.toFixed(0)}%</VariantMetricValue>
                      </VariantMetric>

                      {analysis.daysRemaining > 0 && (
                        <VariantMetric>
                          <VariantMetricLabel>Days Remaining</VariantMetricLabel>
                          <VariantMetricValue>{analysis.daysRemaining}</VariantMetricValue>
                        </VariantMetric>
                      )}
                    </StatisticalAnalysis>
                  )}

                  {analysis && getRecommendationMessage(analysis) && (
                    <RecommendationBanner
                      $action={analysis.recommendedAction}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {getRecommendationMessage(analysis)}
                    </RecommendationBanner>
                  )}
                </TestCard>
              );
            })}
          </TestGrid>
        )}
      </AnimatePresence>
    </DashboardContainer>
  );
};

export default ABTestingDashboard;