/**
 * OMNIX AI - Real-Time Recommendations Component
 * Dynamic product recommendations with live adjustments
 * STREAM-004: Real-time recommendation adjustments
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Zap,
  TrendingUp,
  Clock,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  Percent,
  Package,
  Award,
  Sparkles,
  RefreshCw,
  Filter,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import realTimeRecommendationEngine from '../../services/realTimeRecommendationEngine';
import useCustomerBehaviorStore from '../../store/customerBehaviorStore';
import { formatCurrency, formatRelativeTime, formatNumber } from '../../utils/formatters';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import Typography from '../atoms/Typography';

// Animations
const recommendationUpdate = keyframes`
  0% {
    transform: translateY(-10px);
    opacity: 0;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
`;

const scoreUpdate = keyframes`
  0% {
    background: rgba(59, 130, 246, 0.2);
  }
  100% {
    background: transparent;
  }
`;

const urgentPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
`;

// Styled Components
const RecommendationsContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  height: ${({ height }) => height || 'auto'};
  display: flex;
  flex-direction: column;
`;

const RecommendationsHeader = styled.div`
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

const HeaderControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const RecommendationsContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  
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

const RecommendationsList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RecommendationCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px);
  }
  
  ${({ updated }) => updated && css`
    animation: ${recommendationUpdate} 0.5s ease-out;
  `}
  
  ${({ urgency }) => urgency === 'high' && css`
    border-color: ${({ theme }) => theme.colors.status.warning};
    animation: ${urgentPulse} 2s ease-in-out infinite;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ theme, confidence }) => {
      if (confidence >= 0.8) return theme.colors.status.success;
      if (confidence >= 0.6) return theme.colors.status.warning;
      return theme.colors.status.error;
    }};
  }
`;

const RecommendationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProductCategory = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const RecommendationReason = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ScoreSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ScoreBar = styled.div`
  flex: 1;
  height: 6px;
  background: ${({ theme }) => theme.colors.neutral.subtle};
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const ScoreFill = styled.div`
  height: 100%;
  background: ${({ theme, score }) => {
    if (score >= 0.8) return theme.colors.status.success;
    if (score >= 0.6) return theme.colors.primary.main;
    if (score >= 0.4) return theme.colors.status.warning;
    return theme.colors.status.error;
  }};
  width: ${({ score }) => (score * 100)}%;
  transition: width 0.3s ease;
  
  ${({ updated }) => updated && css`
    animation: ${scoreUpdate} 0.5s ease-out;
  `}
`;

const ScoreValue = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 40px;
`;

const AlgorithmTags = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const AlgorithmTag = styled.span`
  font-size: 0.7rem;
  padding: 2px 6px;
  background: ${({ theme }) => theme.colors.primary.main}20;
  color: ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const AdjustmentsList = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const AdjustmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: 2px;
`;

const RecommendationActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const UrgencyIndicator = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme, urgency }) => {
    switch (urgency) {
      case 'high': return theme.colors.status.error;
      case 'medium': return theme.colors.status.warning;
      default: return theme.colors.status.success;
    }
  }};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const MetricCard = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
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

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Main Component
const RealTimeRecommendations = ({ 
  height = "500px",
  customerId = null,
  maxRecommendations = 10,
  showMetrics = true,
  onRecommendationClick,
  onRecommendationAction
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    highConfidence: 0,
    urgent: 0,
    avgScore: 0
  });

  const { behaviors } = useCustomerBehaviorStore();

  // Subscribe to recommendation updates
  useEffect(() => {
    const unsubscribe = realTimeRecommendationEngine.subscribe((update) => {
      if (!customerId || update.customerId === customerId) {
        if (update.type === 'generation' || update.type === 'adjustment') {
          setRecommendations(prevRecs => {
            const newRecs = update.recommendations.map(rec => ({
              ...rec,
              updated: true,
              id: rec.productId || `rec-${Date.now()}`
            }));
            
            // Clear update flag after animation
            setTimeout(() => {
              setRecommendations(current => 
                current.map(r => ({ ...r, updated: false }))
              );
            }, 500);
            
            return newRecs;
          });
        }
      }
    });

    return unsubscribe;
  }, [customerId]);

  // Generate initial recommendations
  useEffect(() => {
    if (customerId) {
      handleRefresh();
    }
  }, [customerId]);

  // Calculate statistics
  useEffect(() => {
    const newStats = {
      total: recommendations.length,
      highConfidence: recommendations.filter(r => r.confidence >= 0.8).length,
      urgent: recommendations.filter(r => r.urgency === 'high').length,
      avgScore: recommendations.length > 0 
        ? recommendations.reduce((sum, r) => sum + r.finalScore, 0) / recommendations.length 
        : 0
    };
    setStats(newStats);
  }, [recommendations]);

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;
    
    if (filter === 'high_confidence') {
      filtered = filtered.filter(r => r.confidence >= 0.8);
    } else if (filter === 'urgent') {
      filtered = filtered.filter(r => r.urgency === 'high');
    } else if (filter === 'pattern_based') {
      filtered = filtered.filter(r => r.algorithms?.includes('pattern'));
    }
    
    return filtered.slice(0, maxRecommendations);
  }, [recommendations, filter, maxRecommendations]);

  const handleRefresh = useCallback(async () => {
    if (!customerId) return;
    
    setIsRefreshing(true);
    try {
      const context = {
        timestamp: new Date().toISOString(),
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        season: getCurrentSeason()
      };
      
      await realTimeRecommendationEngine.generateRecommendations(customerId, context);
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [customerId]);

  const handleRecommendationClick = useCallback((recommendation) => {
    // Track interaction
    realTimeRecommendationEngine.trackRecommendationInteraction(
      customerId,
      recommendation.productId,
      'click',
      { ranking: recommendation.ranking, algorithm: recommendation.algorithm }
    );
    
    if (onRecommendationClick) {
      onRecommendationClick(recommendation);
    }
  }, [customerId, onRecommendationClick]);

  const handleAction = useCallback((action, recommendation) => {
    // Track interaction
    realTimeRecommendationEngine.trackRecommendationInteraction(
      customerId,
      recommendation.productId,
      action,
      { ranking: recommendation.ranking }
    );
    
    if (onRecommendationAction) {
      onRecommendationAction(action, recommendation);
    }
  }, [customerId, onRecommendationAction]);

  const getRecommendationIcon = (algorithm) => {
    switch (algorithm) {
      case 'collaborative': return <Users size={16} />;
      case 'content': return <Target size={16} />;
      case 'pattern': return <Repeat size={16} />;
      case 'trending': return <TrendingUp size={16} />;
      case 'seasonal': return <Calendar size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  };

  return (
    <RecommendationsContainer
      height={height}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RecommendationsHeader>
        <HeaderTitle>
          <Target size={24} />
          Live Recommendations
          <Badge variant="primary" size="sm">
            {stats.total}
          </Badge>
          {stats.urgent > 0 && (
            <Badge variant="error" size="sm">
              {stats.urgent} Urgent
            </Badge>
          )}
        </HeaderTitle>
        
        <HeaderControls>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ 
              padding: '4px 8px', 
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Recommendations</option>
            <option value="high_confidence">High Confidence</option>
            <option value="urgent">Urgent</option>
            <option value="pattern_based">Pattern-Based</option>
          </select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        </HeaderControls>
      </RecommendationsHeader>

      <RecommendationsContent>
        {/* Metrics Grid */}
        {showMetrics && (
          <MetricsGrid>
            <MetricCard>
              <MetricValue type="primary">{stats.total}</MetricValue>
              <MetricLabel>Total Recs</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue type="success">{stats.highConfidence}</MetricValue>
              <MetricLabel>High Confidence</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue type="warning">{stats.urgent}</MetricValue>
              <MetricLabel>Urgent</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{formatNumber(stats.avgScore, 2)}</MetricValue>
              <MetricLabel>Avg Score</MetricLabel>
            </MetricCard>
          </MetricsGrid>
        )}

        {/* Recommendations List */}
        {filteredRecommendations.length > 0 ? (
          <RecommendationsList>
            <AnimatePresence>
              {filteredRecommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={recommendation.id}
                  confidence={recommendation.confidence}
                  urgency={recommendation.urgency}
                  updated={recommendation.updated}
                  onClick={() => handleRecommendationClick(recommendation)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {recommendation.urgency === 'high' && (
                    <UrgencyIndicator urgency={recommendation.urgency}>
                      <AlertCircle size={12} />
                      URGENT
                    </UrgencyIndicator>
                  )}
                  
                  <RecommendationHeader>
                    <ProductInfo>
                      <ProductTitle>
                        {recommendation.productId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </ProductTitle>
                      <ProductCategory>
                        {recommendation.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </ProductCategory>
                    </ProductInfo>
                    
                    <Badge 
                      variant={recommendation.ranking <= 3 ? 'primary' : 'secondary'}
                      size="sm"
                    >
                      #{recommendation.ranking}
                    </Badge>
                  </RecommendationHeader>

                  <RecommendationReason>
                    {getRecommendationIcon(recommendation.algorithm)}
                    {recommendation.reason}
                  </RecommendationReason>

                  <ScoreSection>
                    <ScoreBar>
                      <ScoreFill 
                        score={recommendation.finalScore} 
                        updated={recommendation.updated}
                      />
                    </ScoreBar>
                    <ScoreValue>
                      {Math.round(recommendation.finalScore * 100)}%
                    </ScoreValue>
                  </ScoreSection>

                  {recommendation.algorithms && (
                    <AlgorithmTags>
                      {recommendation.algorithms.map((algo, i) => (
                        <AlgorithmTag key={i}>{algo}</AlgorithmTag>
                      ))}
                    </AlgorithmTags>
                  )}

                  {recommendation.adjustments && recommendation.adjustments.length > 0 && (
                    <AdjustmentsList>
                      {recommendation.adjustments.slice(0, 3).map((adjustment, i) => (
                        <AdjustmentItem key={i}>
                          <ArrowRight size={10} />
                          {adjustment}
                        </AdjustmentItem>
                      ))}
                    </AdjustmentsList>
                  )}

                  {recommendation.predictedDate && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                      <Clock size={10} style={{ marginRight: '4px' }} />
                      Expected: {formatRelativeTime(recommendation.predictedDate)}
                    </div>
                  )}

                  <RecommendationActions>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('purchase', recommendation);
                      }}
                    >
                      <ShoppingCart size={14} />
                      Add to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('like', recommendation);
                      }}
                    >
                      <ThumbsUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('dislike', recommendation);
                      }}
                    >
                      <ThumbsDown size={14} />
                    </Button>
                  </RecommendationActions>
                </RecommendationCard>
              ))}
            </AnimatePresence>
          </RecommendationsList>
        ) : (
          <EmptyState>
            <Target size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <div>No recommendations available</div>
            <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
              {customerId ? 'Recommendations will appear based on customer behavior' : 'Select a customer to see personalized recommendations'}
            </div>
          </EmptyState>
        )}
      </RecommendationsContent>
    </RecommendationsContainer>
  );
};

export default RealTimeRecommendations;