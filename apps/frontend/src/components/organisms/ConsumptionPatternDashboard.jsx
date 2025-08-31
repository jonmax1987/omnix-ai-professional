/**
 * OMNIX AI - Consumption Pattern Dashboard
 * Real-time consumption pattern visualization and insights
 * STREAM-003: Instant consumption pattern updates
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  BarChart3,
  PieChart,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Package,
  Repeat,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye
} from 'lucide-react';
import useCustomerBehaviorStore from '../../store/customerBehaviorStore';
import consumptionPatternService from '../../services/consumptionPatternService';
import { formatNumber, formatCurrency, formatRelativeTime } from '../../utils/formatters';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Typography from '../atoms/Typography';

// Animations
const patternUpdate = keyframes`
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulsePattern = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
`;

// Styled Components
const DashboardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  height: ${({ height }) => height || 'auto'};
  display: flex;
  flex-direction: column;
`;

const DashboardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const DashboardContent = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral.subtle};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral.border};
    border-radius: 2px;
  }
`;

const PatternGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const PatternCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ theme, patternType }) => {
      switch (patternType) {
        case 'frequency': return theme.colors.status.success;
        case 'seasonal': return theme.colors.status.warning;
        case 'volume': return theme.colors.primary.main;
        case 'temporal': return theme.colors.status.info;
        default: return theme.colors.neutral.border;
      }
    }};
  }
`;

const PatternHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const PatternTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PatternIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, type }) => {
    switch (type) {
      case 'frequency': return `${theme.colors.status.success}20`;
      case 'seasonal': return `${theme.colors.status.warning}20`;
      case 'volume': return `${theme.colors.primary.main}20`;
      case 'temporal': return `${theme.colors.status.info}20`;
      default: return `${theme.colors.neutral.subtle}20`;
    }
  }};
  color: ${({ theme, type }) => {
    switch (type) {
      case 'frequency': return theme.colors.status.success;
      case 'seasonal': return theme.colors.status.warning;
      case 'volume': return theme.colors.primary.main;
      case 'temporal': return theme.colors.status.info;
      default: return theme.colors.text.secondary;
    }
  }};
`;

const PatternDescription = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

const PatternMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.neutral.subtle};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background: ${({ theme, confidence }) => {
    if (confidence >= 0.8) return theme.colors.status.success;
    if (confidence >= 0.6) return theme.colors.status.warning;
    return theme.colors.status.error;
  }};
  width: ${({ confidence }) => (confidence * 100)}%;
  transition: width 0.3s ease;
`;

const PredictionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PredictionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
`;

const PredictionIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
`;

const InsightsList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InsightCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  animation: ${patternUpdate} 0.3s ease-out;
  
  ${({ priority }) => priority === 'high' && `
    border-color: #F59E0B;
    background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
  `}
  
  ${({ priority }) => priority === 'critical' && `
    border-color: #EF4444;
    background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
    animation: ${pulsePattern} 2s ease-in-out infinite;
  `}
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InsightTitle = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InsightMessage = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const InsightAction = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.primary.main};
  font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.status.success;
      case 'warning': return theme.colors.status.warning;
      case 'primary': return theme.colors.primary.main;
      default: return theme.colors.text.primary;
    }
  }};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Main Component
const ConsumptionPatternDashboard = ({ 
  height = "600px",
  customerId = null,
  showInsights = true,
  showPredictions = true,
  autoRefresh = true 
}) => {
  const { 
    consumptionPatterns,
    customerPatterns,
    productPatterns,
    patternInsights
  } = useCustomerBehaviorStore();

  const [selectedPattern, setSelectedPattern] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter patterns based on customerId if provided
  const filteredPatterns = useMemo(() => {
    let patterns = consumptionPatterns;
    
    if (customerId) {
      patterns = patterns.filter(p => p.customerId === customerId);
    }
    
    if (selectedPattern !== 'all') {
      patterns = patterns.filter(p => 
        p.patterns && p.patterns.some(pat => pat.type === selectedPattern)
      );
    }
    
    return patterns.slice(0, 20); // Show latest 20
  }, [consumptionPatterns, customerId, selectedPattern]);

  // Calculate statistics
  const stats = useMemo(() => {
    const allPatterns = Array.from(customerPatterns.values());
    const totalPatterns = allPatterns.reduce((sum, customer) => 
      sum + (customer.patterns?.length || 0), 0
    );
    
    const highConfidence = allPatterns.filter(p => p.confidence >= 0.8).length;
    const activeInsights = patternInsights.filter(insight => 
      insight.priority === 'high' || insight.priority === 'critical'
    ).length;

    return {
      totalCustomers: customerPatterns.size,
      totalPatterns,
      highConfidence,
      activeInsights,
      totalProducts: productPatterns.size
    };
  }, [customerPatterns, patternInsights, productPatterns]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Trigger pattern analysis refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const getPatternIcon = (type) => {
    switch (type) {
      case 'frequency': return <Repeat size={16} />;
      case 'seasonal': return <Calendar size={16} />;
      case 'volume': return <Package size={16} />;
      case 'temporal': return <Clock size={16} />;
      default: return <BarChart3 size={16} />;
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'prediction': return <Target size={16} />;
      case 'frequency': return <Repeat size={16} />;
      case 'seasonal': return <Calendar size={16} />;
      case 'replenishment': return <AlertTriangle size={16} />;
      default: return <Eye size={16} />;
    }
  };

  return (
    <DashboardContainer
      height={height}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <DashboardHeader>
        <HeaderTitle>
          <ShoppingBag size={24} />
          Consumption Patterns
          <Badge variant="primary" size="sm">
            {stats.totalPatterns}
          </Badge>
        </HeaderTitle>
        
        <HeaderActions>
          <select 
            value={selectedPattern} 
            onChange={(e) => setSelectedPattern(e.target.value)}
            style={{ 
              padding: '4px 8px', 
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Patterns</option>
            <option value="regular_weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="bulk_buyer">Bulk Buyer</option>
            <option value="frequent_small">Frequent Small</option>
            <option value="seasonal_summer">Summer</option>
            <option value="seasonal_winter">Winter</option>
          </select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        </HeaderActions>
      </DashboardHeader>

      <DashboardContent>
        {/* Statistics Grid */}
        <StatsGrid>
          <StatCard>
            <StatValue type="primary">{stats.totalCustomers}</StatValue>
            <StatLabel>Customers Analyzed</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue type="success">{stats.totalPatterns}</StatValue>
            <StatLabel>Patterns Detected</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue type="warning">{stats.highConfidence}</StatValue>
            <StatLabel>High Confidence</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue type="primary">{stats.activeInsights}</StatValue>
            <StatLabel>Active Insights</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalProducts}</StatValue>
            <StatLabel>Products Tracked</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Pattern Cards */}
        {filteredPatterns.length > 0 ? (
          <PatternGrid>
            <AnimatePresence>
              {filteredPatterns.map((pattern, index) => (
                <PatternCard
                  key={pattern.id}
                  patternType={pattern.patterns?.[0]?.type || 'general'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {pattern.patterns && pattern.patterns.map((pat, patIndex) => (
                    <div key={patIndex}>
                      <PatternHeader>
                        <PatternTitle>
                          <PatternIcon type={pat.type}>
                            {getPatternIcon(pat.type)}
                          </PatternIcon>
                          {pat.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </PatternTitle>
                        <Badge 
                          variant={pat.confidence >= 0.8 ? 'success' : pat.confidence >= 0.6 ? 'warning' : 'error'}
                          size="sm"
                        >
                          {Math.round(pat.confidence * 100)}%
                        </Badge>
                      </PatternHeader>

                      <PatternDescription>
                        Customer ID: {pattern.customerId}
                        <br />
                        {formatRelativeTime(pattern.timestamp)}
                      </PatternDescription>

                      <ConfidenceBar>
                        <ConfidenceFill confidence={pat.confidence} />
                      </ConfidenceBar>

                      {pat.data && (
                        <PatternMetrics>
                          {pat.data.averageInterval && (
                            <MetricItem>
                              <MetricValue>{Math.round(pat.data.averageInterval)} days</MetricValue>
                              <MetricLabel>Avg Interval</MetricLabel>
                            </MetricItem>
                          )}
                          {pat.data.averageQuantity && (
                            <MetricItem>
                              <MetricValue>{formatNumber(pat.data.averageQuantity, 1)}</MetricValue>
                              <MetricLabel>Avg Quantity</MetricLabel>
                            </MetricItem>
                          )}
                          {pat.data.seasonalIncrease && (
                            <MetricItem>
                              <MetricValue>+{formatNumber(pat.data.seasonalIncrease, 1)}%</MetricValue>
                              <MetricLabel>Seasonal Boost</MetricLabel>
                            </MetricItem>
                          )}
                        </PatternMetrics>
                      )}

                      {showPredictions && pattern.predictions && (
                        <PredictionsList>
                          {pattern.predictions.nextPurchaseDate && (
                            <PredictionItem>
                              <PredictionIcon><Target size={12} /></PredictionIcon>
                              Next purchase: {formatRelativeTime(pattern.predictions.nextPurchaseDate)}
                            </PredictionItem>
                          )}
                          {pattern.predictions.monthlyConsumption && (
                            <PredictionItem>
                              <PredictionIcon><BarChart3 size={12} /></PredictionIcon>
                              Monthly: {formatNumber(pattern.predictions.monthlyConsumption)} items
                            </PredictionItem>
                          )}
                        </PredictionsList>
                      )}
                    </div>
                  ))}
                </PatternCard>
              ))}
            </AnimatePresence>
          </PatternGrid>
        ) : (
          <EmptyState>
            <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <div>No consumption patterns detected yet</div>
            <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
              Patterns will appear as customers make purchases
            </div>
          </EmptyState>
        )}

        {/* Insights Section */}
        {showInsights && patternInsights.length > 0 && (
          <div>
            <Typography variant="h6" weight="medium" style={{ marginBottom: '1rem' }}>
              Pattern Insights
            </Typography>
            
            <InsightsList>
              {patternInsights.slice(0, 10).map((insight, index) => (
                <InsightCard
                  key={insight.id}
                  priority={insight.priority}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <InsightHeader>
                    {getInsightIcon(insight.type)}
                    <InsightTitle>{insight.type.replace(/_/g, ' ').toUpperCase()}</InsightTitle>
                    <Badge 
                      variant={insight.priority === 'critical' ? 'error' : 
                              insight.priority === 'high' ? 'warning' : 'info'}
                      size="xs"
                    >
                      {insight.priority}
                    </Badge>
                  </InsightHeader>
                  <InsightMessage>{insight.message}</InsightMessage>
                  {insight.action && (
                    <InsightAction>→ {insight.action}</InsightAction>
                  )}
                </InsightCard>
              ))}
            </InsightsList>
          </div>
        )}
      </DashboardContent>
    </DashboardContainer>
  );
};

export default ConsumptionPatternDashboard;