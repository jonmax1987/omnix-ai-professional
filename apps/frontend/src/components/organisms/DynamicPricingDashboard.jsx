/**
 * OMNIX AI - Dynamic Pricing Dashboard
 * Real-time pricing optimization and competitive intelligence system
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import dynamicPricingService from '../../services/dynamicPricingService';
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

const PricingIcon = styled(motion.div)`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.card};
  border-radius: 12px;
  border-left: 4px solid ${props => 
    props.type === 'revenue' ? '#059669' :
    props.type === 'optimization' ? '#3b82f6' :
    props.type === 'competition' ? '#f59e0b' :
    props.type === 'margin' ? '#8b5cf6' :
    '#6b7280'
  };
  position: relative;
  overflow: hidden;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${props => 
    props.type === 'revenue' ? '#059669' :
    props.type === 'optimization' ? '#3b82f6' :
    props.type === 'competition' ? '#f59e0b' :
    props.type === 'margin' ? '#8b5cf6' :
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
    props.trend === 'up' ? '#059669' :
    props.trend === 'down' ? '#dc2626' :
    '#6b7280'
  };
  display: flex;
  align-items: center;
  gap: 4px;
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
  border: 2px solid ${props => props.active ? '#3b82f6' : props.theme.colors.border};
  background: ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    border-color: #3b82f6;
  }
`;

const OptimizationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const OptimizationCard = styled(motion.div)`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => 
    props.impact === 'high' ? '#059669' :
    props.impact === 'medium' ? '#f59e0b' :
    props.impact === 'low' ? '#6b7280' :
    '#3b82f6'
  };

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
`;

const ProductId = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const PriceInfo = styled.div`
  text-align: right;
`;

const PriceChange = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => 
    props.change > 0 ? '#059669' :
    props.change < 0 ? '#dc2626' :
    props.theme.colors.text.primary
  };
`;

const PercentageChange = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ModelBreakdown = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ModelChip = styled.div`
  padding: 4px 8px;
  background: ${props => 
    props.model === 'demand-based' ? '#dbeafe' :
    props.model === 'competition-based' ? '#fef3c7' :
    props.model === 'value-based' ? '#f3e8ff' :
    '#f3f4f6'
  };
  color: ${props => 
    props.model === 'demand-based' ? '#1d4ed8' :
    props.model === 'competition-based' ? '#d97706' :
    props.model === 'value-based' ? '#7c3aed' :
    '#374151'
  };
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const ActionButton = styled(motion.button)`
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;

  &:hover {
    background: #2563eb;
  }
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
    props.urgency === 'high' ? '#fca5a5' :
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
    props.urgency === 'high' ? '#dc2626' :
    props.urgency === 'medium' ? '#d97706' :
    '#059669'
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

const RecommendationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RecommendationItem = styled.div`
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.primary};
  border-left: 3px solid #3b82f6;
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InsightCard = styled(motion.div)`
  padding: 16px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  border-left: 4px solid ${props => 
    props.impact === 'positive' ? '#059669' :
    props.impact === 'negative' ? '#dc2626' :
    '#3b82f6'
  };
`;

const InsightType = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => props.theme.colors.text.secondary};
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const InsightMessage = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.4;
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
`;

const ConfidenceFill = styled(motion.div)`
  height: 100%;
  background: ${props => 
    props.confidence >= 0.8 ? '#059669' :
    props.confidence >= 0.6 ? '#f59e0b' :
    '#dc2626'
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

const DynamicPricingDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [optimizations, setOptimizations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({});

  const { 
    pricingOptimizations = [], 
    pricingUpdates = new Map(), 
    pricingAlerts = [] 
  } = useCustomerBehaviorStore();
  
  const { isConnected } = useWebSocketStore();

  // Sample product IDs for demo
  const sampleProductIds = [
    'PROD001', 'PROD002', 'PROD003', 'PROD004', 'PROD005',
    'PROD006', 'PROD007', 'PROD008', 'PROD009', 'PROD010'
  ];

  useEffect(() => {
    const loadPricingData = async () => {
      setLoading(true);
      try {
        // Load batch optimizations
        const batchOptimizations = dynamicPricingService.optimizeBatchPricing(sampleProductIds);
        setOptimizations(batchOptimizations.optimizations);
        
        // Load insights
        const pricingInsights = dynamicPricingService.generatePricingInsights();
        setInsights(pricingInsights);
        
        // Load statistics
        const stats = dynamicPricingService.getStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Error loading pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPricingData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!refreshing && isConnected) {
        setRefreshing(true);
        try {
          const batchOptimizations = dynamicPricingService.optimizeBatchPricing(sampleProductIds);
          setOptimizations(batchOptimizations.optimizations);
          
          const pricingInsights = dynamicPricingService.generatePricingInsights();
          setInsights(pricingInsights);
          
          const stats = dynamicPricingService.getStatistics();
          setStatistics(stats);
        } catch (error) {
          console.error('Error refreshing pricing data:', error);
        } finally {
          setRefreshing(false);
        }
      }
    }, 45000); // Refresh every 45 seconds

    return () => clearInterval(interval);
  }, [refreshing, isConnected]);

  const filteredOptimizations = useMemo(() => {
    if (activeFilter === 'all') return optimizations;
    if (activeFilter === 'increases') return optimizations.filter(opt => opt.priceChange > 0);
    if (activeFilter === 'decreases') return optimizations.filter(opt => opt.priceChange < 0);
    if (activeFilter === 'high-impact') return optimizations.filter(opt => Math.abs(opt.percentageChange) > 5);
    return optimizations;
  }, [optimizations, activeFilter]);

  const stats = useMemo(() => {
    const totalOptimizations = optimizations.length;
    const priceIncreases = optimizations.filter(opt => opt.priceChange > 0).length;
    const priceDecreases = optimizations.filter(opt => opt.priceChange < 0).length;
    const avgPriceChange = optimizations.reduce((sum, opt) => sum + opt.percentageChange, 0) / totalOptimizations || 0;
    const expectedRevenue = optimizations.reduce((sum, opt) => sum + (opt.expectedImpact.revenueIncrease || 0), 0);
    const highImpactOptimizations = optimizations.filter(opt => Math.abs(opt.percentageChange) > 5).length;

    return {
      totalOptimizations,
      priceIncreases,
      priceDecreases,
      avgPriceChange,
      expectedRevenue,
      highImpactOptimizations
    };
  }, [optimizations]);

  const handleApplyOptimization = (optimization) => {
    // Track optimization application
    dynamicPricingService.trackPricingOutcome(
      optimization.productId,
      optimization,
      { applied: true, timestamp: new Date().toISOString() }
    );
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingState>Loading pricing optimization data...</LoadingState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Title>
            <PricingIcon
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💰
            </PricingIcon>
            Dynamic Pricing Dashboard
          </Title>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: isConnected ? '#059669' : '#dc2626'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: isConnected ? '#059669' : '#dc2626' 
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
          type="optimization"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatValue type="optimization">
            {stats.totalOptimizations}
          </StatValue>
          <StatLabel>Price Optimizations</StatLabel>
          <StatTrend trend="up">
            ↗ {stats.highImpactOptimizations} High Impact
          </StatTrend>
        </StatCard>

        <StatCard
          type="revenue"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatValue type="revenue">
            ${Math.round(stats.expectedRevenue).toLocaleString()}
          </StatValue>
          <StatLabel>Expected Revenue Impact</StatLabel>
          <StatTrend trend={stats.expectedRevenue > 0 ? 'up' : 'down'}>
            {stats.expectedRevenue > 0 ? '↗' : '↘'} Projected Monthly
          </StatTrend>
        </StatCard>

        <StatCard
          type="margin"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatValue type="margin">
            {Math.abs(stats.avgPriceChange).toFixed(1)}%
          </StatValue>
          <StatLabel>Avg Price Adjustment</StatLabel>
          <StatTrend trend={stats.avgPriceChange > 0 ? 'up' : 'down'}>
            {stats.priceIncreases}↗ / {stats.priceDecreases}↘
          </StatTrend>
        </StatCard>

        <StatCard
          type="competition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatValue type="competition">
            {pricingAlerts.length}
          </StatValue>
          <StatLabel>Active Alerts</StatLabel>
          <StatTrend trend="neutral">
            ⚠ Competitive Intelligence
          </StatTrend>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <MainSection>
          <Card>
            <CardHeader>
              <CardTitle>
                🎯 Price Optimizations
              </CardTitle>
            </CardHeader>
            
            <FilterTabs>
              {[
                { id: 'all', label: 'All Changes' },
                { id: 'increases', label: 'Price Increases' },
                { id: 'decreases', label: 'Price Decreases' },
                { id: 'high-impact', label: 'High Impact' }
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

            <OptimizationList>
              <AnimatePresence mode="popLayout">
                {filteredOptimizations.map((optimization, index) => (
                  <OptimizationCard
                    key={optimization.productId}
                    impact={Math.abs(optimization.percentageChange) > 5 ? 'high' : 'medium'}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <ProductInfo>
                      <div>
                        <ProductName>Product {optimization.productId}</ProductName>
                        <ProductId>ID: {optimization.productId}</ProductId>
                      </div>
                      <PriceInfo>
                        <PriceChange change={optimization.priceChange}>
                          ${optimization.optimizedPrice.toFixed(2)}
                        </PriceChange>
                        <PercentageChange>
                          {optimization.percentageChange > 0 ? '+' : ''}{optimization.percentageChange.toFixed(1)}%
                        </PercentageChange>
                      </PriceInfo>
                    </ProductInfo>

                    <MetricsRow>
                      <MetricItem>
                        <MetricValue>${optimization.originalPrice.toFixed(2)}</MetricValue>
                        <MetricLabel>Original</MetricLabel>
                      </MetricItem>
                      <MetricItem>
                        <MetricValue>{Math.round(optimization.confidence * 100)}%</MetricValue>
                        <MetricLabel>Confidence</MetricLabel>
                      </MetricItem>
                      <MetricItem>
                        <MetricValue>${Math.round(optimization.expectedImpact.revenueIncrease || 0)}</MetricValue>
                        <MetricLabel>Revenue Impact</MetricLabel>
                      </MetricItem>
                    </MetricsRow>

                    <ModelBreakdown>
                      {optimization.modelBreakdown.map(model => (
                        <ModelChip key={model.model} model={model.model}>
                          {model.model.replace('-', ' ')} {Math.round(model.confidence * 100)}%
                        </ModelChip>
                      ))}
                      <ActionButton
                        onClick={() => handleApplyOptimization(optimization)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Apply
                      </ActionButton>
                    </ModelBreakdown>
                  </OptimizationCard>
                ))}
              </AnimatePresence>
            </OptimizationList>

            {filteredOptimizations.length === 0 && (
              <EmptyState>
                No optimizations match the selected filter.
              </EmptyState>
            )}
          </Card>
        </MainSection>

        <SideSection>
          <Card>
            <CardHeader>
              <CardTitle>
                🚨 Pricing Alerts
              </CardTitle>
            </CardHeader>
            
            <AlertList>
              <AnimatePresence>
                {pricingAlerts.slice(0, 5).map(alert => (
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
                        {alert.recommendations.slice(0, 3).map((rec, idx) => (
                          <RecommendationItem key={idx}>
                            {rec.productName}: ${rec.recommendedPrice.toFixed(2)} 
                            ({rec.expectedImpact > 0 ? '+' : ''}${Math.round(rec.expectedImpact)})
                          </RecommendationItem>
                        ))}
                      </RecommendationList>
                    )}
                  </AlertCard>
                ))}
              </AnimatePresence>
              
              {pricingAlerts.length === 0 && (
                <EmptyState style={{ padding: '20px' }}>
                  No active pricing alerts
                </EmptyState>
              )}
            </AlertList>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                💡 Market Insights
              </CardTitle>
            </CardHeader>
            
            <InsightsList>
              {insights.map((insight, index) => (
                <InsightCard
                  key={`${insight.type}-${index}`}
                  impact={insight.impact}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <InsightType>{insight.type}</InsightType>
                  <InsightMessage>{insight.message}</InsightMessage>
                  <ConfidenceBar>
                    <ConfidenceFill
                      confidence={insight.confidence}
                      initial={{ width: 0 }}
                      animate={{ width: `${insight.confidence * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                  </ConfidenceBar>
                </InsightCard>
              ))}
              
              {insights.length === 0 && (
                <EmptyState style={{ padding: '20px' }}>
                  Loading market insights...
                </EmptyState>
              )}
            </InsightsList>
          </Card>
        </SideSection>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default DynamicPricingDashboard;