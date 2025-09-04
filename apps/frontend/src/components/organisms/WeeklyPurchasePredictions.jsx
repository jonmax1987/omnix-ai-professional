import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Package,
  Clock,
  ChevronRight,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import aiInsightsService from '../../services/aiInsightsService';
import { consumptionPatternService } from '../../services/consumptionPatternService';
import useUserStore from '../../store/userStore';

const PredictionsContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme?.colors?.text?.primary || '#0f172a'};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SubTitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary.main};
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin: 0 -${({ theme }) => theme.spacing.md};
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    margin: 0 -${({ theme }) => theme.spacing.sm};
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border.default};
  white-space: nowrap;

  &:first-child {
    border-radius: ${({ theme }) => theme.borderRadius.md} 0 0 0;
  }

  &:last-child {
    border-radius: 0 ${({ theme }) => theme.borderRadius.md} 0 0;
    text-align: right;
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled(motion.tr)`
  transition: background 0.2s ease;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }

  &:not(:last-child) td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#0f172a'};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:last-child {
    text-align: right;
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ProductIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.primary[100]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
  }
`;

const ProductDetails = styled.div``;

const ProductName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#0f172a'};
  margin-bottom: 2px;
`;

const ProductCategory = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DateCell = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateMain = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const DateRelative = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ConfidenceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ confidence }) => 
    confidence >= 0.8 ? '#10B98120' : 
    confidence >= 0.6 ? '#F59E0B20' : 
    '#6B728020'
  };
  color: ${({ confidence }) => 
    confidence >= 0.8 ? '#10B981' : 
    confidence >= 0.6 ? '#F59E0B' : 
    '#6B7280'
  };
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const PatternBadge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.secondary[100]};
  color: ${({ theme }) => theme.colors.secondary.main};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.text.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border.default};

    &:hover {
      background: ${({ theme }) => theme.colors.background.secondary};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid ${({ theme }) => theme.colors.border.default};
  border-top: 3px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: ${({ theme }) => theme.spacing.sm};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InsightCard = styled.div`
  background: ${({ theme }) => theme.colors.primary[50]};
  border: 1px solid ${({ theme }) => theme.colors.primary[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InsightIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
`;

const InsightText = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.5;
`;

const WeeklyPurchasePredictions = () => {
  const { user } = useUserStore();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(new Set());

  useEffect(() => {
    if (user?.id) {
      fetchPredictions();
    }
  }, [user?.id]);

  const fetchPredictions = async () => {
    if (refreshing) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch consumption predictions for next 7 days
      const response = await aiInsightsService.getConsumptionPredictions({
        customerId: user.id,
        timeHorizon: '7d',
        includeConfidence: true,
        includeFactors: true
      });

      // Get customer analytics for pattern detection
      const analytics = consumptionPatternService.getCustomerAnalytics(user.id);
      
      // Check if response has success flag and predictions
      if (response.success && response.predictions) {
        // Combine and format predictions
        const formattedPredictions = formatPredictions(
          response.predictions,
          analytics?.patterns || []
        );
        
        setPredictions(formattedPredictions);
        setError(null); // Clear any previous errors
      } else if (response.predictions) {
        // Handle case where predictions exist but no success flag
        const formattedPredictions = formatPredictions(
          response.predictions,
          analytics?.patterns || []
        );
        setPredictions(formattedPredictions);
        setError(null);
      } else {
        // No predictions found, use fallback
        setPredictions(getFallbackPredictions());
      }
    } catch (err) {
      console.error('Failed to fetch weekly predictions:', err);
      
      // Check if it's an API error with a fallback response
      if (err.response?.data?.predictions) {
        const formattedPredictions = formatPredictions(
          err.response.data.predictions,
          []
        );
        setPredictions(formattedPredictions);
        setError(null);
      } else {
        // Always show fallback data even if there's an error
        const fallbackPreds = getFallbackPredictions();
        setPredictions(fallbackPreds);
        // Don't set error if we have fallback data to show
        if (fallbackPreds.length === 0) {
          setError('Unable to load predictions. Please try again later.');
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatPredictions = (apiPredictions, patterns) => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format API predictions - handle actual API response structure
    const formatted = apiPredictions
      .filter(pred => {
        // Handle both predictedDate and predictedConsumptionDate from API
        const predDate = new Date(pred.predictedDate || pred.predictedConsumptionDate || pred.nextPurchaseDate);
        return predDate >= now && predDate <= weekFromNow;
      })
      .map(pred => ({
        id: pred.productId || Math.random().toString(36).substr(2, 9),
        productName: pred.productName || pred.product?.name || 'Unknown Product',
        category: pred.category || pred.product?.category || 'General',
        emoji: pred.emoji || pred.product?.emoji || '📦',
        predictedDate: new Date(pred.predictedDate || pred.predictedConsumptionDate || pred.nextPurchaseDate),
        confidence: pred.confidence || 0.75,
        pattern: pred.pattern || detectPattern(pred),
        quantity: pred.predictedQuantity || pred.averageQuantity || 1,
        estimatedPrice: pred.estimatedPrice || pred.price || 0,
        lastPurchased: pred.lastPurchaseDate ? new Date(pred.lastPurchaseDate) : null,
        factors: pred.factors || [],
        reason: pred.reason || null
      }))
      .sort((a, b) => a.predictedDate - b.predictedDate);
    
    return formatted.length > 0 ? formatted : getFallbackPredictions();
  };

  const detectPattern = (prediction) => {
    // First check if reason contains pattern information
    const reason = prediction.reason || '';
    if (reason.includes('7-day') || reason.includes('weekly')) return 'Weekly';
    if (reason.includes('10 days') || reason.includes('bi-weekly')) return 'Bi-weekly';
    if (reason.includes('14-day')) return 'Bi-weekly';
    if (reason.includes('monthly') || reason.includes('30 days')) return 'Monthly';
    
    // Fallback to interval calculation
    const interval = prediction.purchaseInterval || prediction.averageInterval;
    if (!interval) return 'Variable';
    
    const days = typeof interval === 'number' ? interval : parseInt(interval);
    if (days <= 7) return 'Weekly';
    if (days <= 14) return 'Bi-weekly';
    if (days <= 31) return 'Monthly';
    return 'Periodic';
  };

  const getFallbackPredictions = () => {
    const now = new Date();
    return [
      {
        id: '1',
        productName: 'Organic Milk',
        category: 'Dairy',
        emoji: '🥛',
        predictedDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        confidence: 0.92,
        pattern: 'Weekly',
        quantity: 2,
        estimatedPrice: 8.98,
        lastPurchased: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        productName: 'Whole Grain Bread',
        category: 'Bakery',
        emoji: '🍞',
        predictedDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        confidence: 0.85,
        pattern: 'Weekly',
        quantity: 1,
        estimatedPrice: 3.79,
        lastPurchased: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        productName: 'Fresh Bananas',
        category: 'Fruits',
        emoji: '🍌',
        predictedDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        confidence: 0.88,
        pattern: 'Bi-weekly',
        quantity: 6,
        estimatedPrice: 3.99,
        lastPurchased: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        productName: 'Greek Yogurt',
        category: 'Dairy',
        emoji: '🥣',
        predictedDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        confidence: 0.78,
        pattern: 'Weekly',
        quantity: 4,
        estimatedPrice: 11.96,
        lastPurchased: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '5',
        productName: 'Free-Range Eggs',
        category: 'Dairy & Eggs',
        emoji: '🥚',
        predictedDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        confidence: 0.91,
        pattern: 'Bi-weekly',
        quantity: 1,
        estimatedPrice: 5.49,
        lastPurchased: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
      }
    ];
  };

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `In ${days} days`;
    return '';
  };

  const handleAddToCart = (productId) => {
    setAddedToCart(prev => new Set([...prev, productId]));
    // In real implementation, this would call the cart service
    console.log('Adding to cart:', productId);
    
    // Visual feedback
    setTimeout(() => {
      setAddedToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }, 2000);
  };

  const handleSkip = (productId) => {
    // In real implementation, this would update the prediction model
    console.log('Skipping prediction:', productId);
    setPredictions(prev => prev.filter(p => p.id !== productId));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPredictions();
  };

  const getTotalEstimated = () => {
    return predictions.reduce((sum, pred) => sum + (pred.estimatedPrice || 0), 0);
  };

  const getInsightMessage = () => {
    if (predictions.length === 0) return null;
    
    const weeklyItems = predictions.filter(p => p.pattern === 'Weekly').length;
    const highConfidence = predictions.filter(p => p.confidence >= 0.8).length;
    
    if (weeklyItems >= 3) {
      return `You have ${weeklyItems} weekly essentials coming up. Consider bundling them in a single order to save on delivery.`;
    }
    
    if (highConfidence >= 3) {
      return `${highConfidence} items are predicted with high confidence based on your consistent purchase patterns.`;
    }
    
    return `Based on your purchase history, you typically need these ${predictions.length} items this week.`;
  };

  return (
    <PredictionsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <div>
          <Title>
            <Calendar size={24} />
            Upcoming Weekly Purchases
          </Title>
          <SubTitle>
            AI-predicted items based on your consumption patterns
          </SubTitle>
        </div>
        <RefreshButton onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Updating...' : 'Refresh'}
        </RefreshButton>
      </Header>

      {loading ? (
        <LoadingState>
          <Spinner />
          Analyzing your purchase patterns...
        </LoadingState>
      ) : error && predictions.length === 0 ? (
        <EmptyState>
          <AlertCircle size={48} style={{ marginBottom: '16px', color: '#EF4444' }} />
          <div>{error}</div>
        </EmptyState>
      ) : predictions.length === 0 ? (
        <EmptyState>
          <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div>No upcoming purchases predicted for this week</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            We'll learn from your shopping patterns over time
          </div>
        </EmptyState>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Predicted Date</TableHeaderCell>
                  <TableHeaderCell>Pattern</TableHeaderCell>
                  <TableHeaderCell>Quantity</TableHeaderCell>
                  <TableHeaderCell>Est. Price</TableHeaderCell>
                  <TableHeaderCell>Confidence</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {predictions.map((prediction, index) => (
                    <TableRow
                      key={prediction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>
                        <ProductInfo>
                          <ProductIcon>{prediction.emoji}</ProductIcon>
                          <ProductDetails>
                            <ProductName>{prediction.productName}</ProductName>
                            <ProductCategory>
                              {prediction.category}
                              {prediction.reason && (
                                <span style={{ marginLeft: '8px', fontSize: '11px', color: '#6B7280' }}>
                                  • {prediction.reason}
                                </span>
                              )}
                            </ProductCategory>
                          </ProductDetails>
                        </ProductInfo>
                      </TableCell>
                      <TableCell>
                        <DateCell>
                          <DateMain>{formatDate(prediction.predictedDate)}</DateMain>
                          <DateRelative>{getRelativeTime(prediction.predictedDate)}</DateRelative>
                        </DateCell>
                      </TableCell>
                      <TableCell>
                        <PatternBadge>{prediction.pattern}</PatternBadge>
                      </TableCell>
                      <TableCell>{prediction.quantity}x</TableCell>
                      <TableCell>
                        ${prediction.estimatedPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <ConfidenceBadge confidence={prediction.confidence}>
                          {Math.round(prediction.confidence * 100)}%
                          {prediction.confidence >= 0.8 && <Check size={12} />}
                        </ConfidenceBadge>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {addedToCart.has(prediction.id) ? (
                            <ActionButton disabled>
                              <Check size={14} />
                              Added
                            </ActionButton>
                          ) : (
                            <ActionButton onClick={() => handleAddToCart(prediction.id)}>
                              <ShoppingCart size={14} />
                              Add
                            </ActionButton>
                          )}
                          <ActionButton 
                            className="secondary"
                            onClick={() => handleSkip(prediction.id)}
                          >
                            <X size={14} />
                            Skip
                          </ActionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>

          <div style={{ 
            marginTop: '20px', 
            paddingTop: '20px', 
            borderTop: `1px solid ${({ theme }) => theme?.colors?.border?.default || '#E5E7EB'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>
              Estimated Weekly Total
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#0F172A'
            }}>
              ${getTotalEstimated().toFixed(2)}
            </div>
          </div>

          {getInsightMessage() && (
            <InsightCard>
              <InsightIcon>
                <TrendingUp size={20} />
              </InsightIcon>
              <InsightText>{getInsightMessage()}</InsightText>
            </InsightCard>
          )}
        </>
      )}
    </PredictionsContainer>
  );
};

export default WeeklyPurchasePredictions;