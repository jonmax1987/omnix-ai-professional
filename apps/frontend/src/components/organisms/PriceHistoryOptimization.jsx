import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import inventoryService from '../../services/inventoryService';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  height: 100%;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const TabButton = styled(Button).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})`
  border-radius: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  
  ${props => props.active && css`
    color: ${props.theme.colors.primary[600]};
    border-bottom-color: ${props.theme.colors.primary[500]};
    background: transparent;
  `}
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  flex: 1;
  min-height: 400px;
`;

const PriceChart = styled.div`
  position: relative;
  height: 300px;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.subtle};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PricePoint = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['trend'].includes(prop)
})`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.background.elevated};
  cursor: pointer;
  
  ${props => {
    switch (props.trend) {
      case 'up':
        return `background: ${props.theme.colors.green[500]};`;
      case 'down':
        return `background: ${props.theme.colors.red[500]};`;
      default:
        return `background: ${props.theme.colors.primary[500]};`;
    }
  }}
  
  &:hover {
    transform: scale(1.2);
  }
`;

const PriceTooltip = styled(motion.div)`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.text.primary};
  color: ${props => props.theme.colors.text.inverse};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: ${props => props.theme.colors.text.primary};
  }
`;

const OptimizationCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[4]};
`;

const OptimizationCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['type'].includes(prop)
})`
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'increase': return props.theme.colors.green[500];
      case 'decrease': return props.theme.colors.red[500];
      case 'maintain': return props.theme.colors.blue[500];
      default: return props.theme.colors.primary[500];
    }
  }};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin: ${props => props.theme.spacing[3]} 0;
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => !['trend'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: 18px;
  font-weight: 600;
  color: ${props => {
    switch (props.trend) {
      case 'up': return props.theme.colors.green[600];
      case 'down': return props.theme.colors.red[600];
      default: return props.theme.colors.text.primary;
    }
  }};
`;

const HistoryTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 120px 100px 100px 120px 1fr 80px;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  font-weight: 600;
  font-size: 14px;
`;

const TableRow = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['isLatest'].includes(prop)
})`
  display: grid;
  grid-template-columns: 120px 100px 100px 120px 1fr 80px;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  align-items: center;
  
  ${props => props.isLatest && css`
    background: ${props.theme.colors.primary[25]};
    border-color: ${props.theme.colors.primary[200]};
  `}
  
  &:hover {
    background: ${props => props.theme.colors.background.subtle};
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[6]};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[6]};
  text-align: center;
`;

const ActionButton = styled(Button)`
  min-width: 120px;
`;

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

const formatPercent = (percent) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percent / 100);
};

const PriceHistoryOptimization = ({
  onPriceUpdate,
  onOptimizationApply,
  onExportReport,
  autoRefresh = false,
  refreshInterval = 300000,
  className,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [priceData, setPriceData] = useState(null);
  const [optimizations, setOptimizations] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [error, setError] = useState(null);

  // Fetch price history data
  const fetchPriceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getPriceHistory();
      setPriceData(data);
      
      // Generate optimizations based on price data
      const optimizationData = await inventoryService.getPriceOptimizations();
      setOptimizations(optimizationData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchPriceData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Handle price update
  const handlePriceUpdate = async (productId, newPrice, reason) => {
    try {
      await inventoryService.updateProductPrice(productId, newPrice, reason);
      onPriceUpdate?.(productId, newPrice, reason);
      await fetchPriceData(); // Refresh data
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle optimization application
  const handleOptimizationApply = async (optimization) => {
    try {
      await handlePriceUpdate(
        optimization.productId, 
        optimization.recommendedPrice, 
        optimization.reason
      );
      onOptimizationApply?.(optimization);
    } catch (error) {
      setError(error.message);
    }
  };

  // Generate mock chart coordinates for price points
  const pricePoints = useMemo(() => {
    if (!priceData?.history) return [];
    
    const history = priceData.history;
    const maxPrice = Math.max(...history.map(h => h.price));
    const minPrice = Math.min(...history.map(h => h.price));
    const priceRange = maxPrice - minPrice;
    
    return history.map((item, index) => {
      const x = (index / (history.length - 1)) * 80 + 10; // 10-90% of width
      const y = priceRange > 0 
        ? 90 - ((item.price - minPrice) / priceRange) * 80 // 10-90% of height
        : 50;
      
      return {
        ...item,
        x: `${x}%`,
        y: `${y}%`,
        trend: index > 0 && history[index - 1] 
          ? item.price > history[index - 1].price ? 'up' : 'down'
          : 'neutral'
      };
    });
  }, [priceData?.history]);

  if (loading) {
    return (
      <Container className={className} {...props}>
        <LoadingState>
          <Icon name="loader" size={48} className="animate-spin" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Loading price data...
          </Typography>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={className} {...props}>
        <EmptyState>
          <Icon name="alert-triangle" size={48} color="error" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Failed to load price data
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '1rem' }}>
            {error}
          </Typography>
          <Button onClick={fetchPriceData}>
            <Icon name="refresh" size={16} />
            Try Again
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      {...props}
    >
      <Header>
        <HeaderLeft>
          <Typography variant="h5" weight="semibold">
            Price History & Optimization
          </Typography>
          <Typography variant="body2" color="secondary">
            Track price changes and optimize pricing strategies with AI recommendations
          </Typography>
        </HeaderLeft>
        <HeaderRight>
          <Badge variant="success" size="sm">
            {priceData?.summary?.totalProducts || 0} Products
          </Badge>
          <Badge variant="primary" size="sm">
            ${priceData?.summary?.averageOptimization || 0} Avg Impact
          </Badge>
          <Button variant="outline" size="sm" onClick={() => onExportReport?.(priceData)}>
            <Icon name="download" size={16} />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchPriceData}>
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </Header>

      <TabContainer>
        <TabButton
          variant="ghost"
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          <Icon name="trending-up" size={16} />
          Price History
        </TabButton>
        <TabButton
          variant="ghost"
          active={activeTab === 'optimization'}
          onClick={() => setActiveTab('optimization')}
        >
          <Icon name="zap" size={16} />
          AI Optimization
        </TabButton>
      </TabContainer>

      <ContentArea>
        {activeTab === 'history' && (
          <>
            {/* Price Chart */}
            <PriceChart>
              <Typography variant="h6" color="secondary">
                Price Trends Over Time
              </Typography>
              
              {pricePoints.map((point, index) => (
                <PricePoint
                  key={index}
                  trend={point.trend}
                  style={{ left: point.x, top: point.y }}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  whileHover={{ scale: 1.2 }}
                >
                  <AnimatePresence>
                    {hoveredPoint?.date === point.date && (
                      <PriceTooltip
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {formatPrice(point.price)} - {point.date}
                      </PriceTooltip>
                    )}
                  </AnimatePresence>
                </PricePoint>
              ))}
            </PriceChart>

            {/* Price History Table */}
            <HistoryTable>
              <TableHeader>
                <div>Date</div>
                <div>Old Price</div>
                <div>New Price</div>
                <div>Change</div>
                <div>Reason</div>
                <div>Status</div>
              </TableHeader>
              
              <AnimatePresence>
                {priceData?.history?.slice(0, 10).map((item, index) => (
                  <TableRow
                    key={item.id}
                    isLatest={index === 0}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Typography variant="body2">
                      {new Date(item.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      {formatPrice(item.previousPrice || 0)}
                    </Typography>
                    <Typography variant="body2" weight="medium">
                      {formatPrice(item.price)}
                    </Typography>
                    <MetricValue trend={item.change > 0 ? 'up' : item.change < 0 ? 'down' : 'neutral'}>
                      <Icon name={item.change > 0 ? 'arrow-up' : item.change < 0 ? 'arrow-down' : 'minus'} size={14} />
                      {formatPercent(Math.abs(item.change || 0))}
                    </MetricValue>
                    <Typography variant="body2" color="secondary">
                      {item.reason}
                    </Typography>
                    <Badge 
                      variant={item.status === 'active' ? 'success' : 'secondary'} 
                      size="xs"
                    >
                      {item.status}
                    </Badge>
                  </TableRow>
                ))}
              </AnimatePresence>
            </HistoryTable>
          </>
        )}

        {activeTab === 'optimization' && (
          <OptimizationCards>
            <AnimatePresence>
              {optimizations.map((optimization, index) => (
                <OptimizationCard
                  key={optimization.id}
                  type={optimization.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CardHeader>
                    <CardTitle>
                      <Icon 
                        name={optimization.type === 'increase' ? 'trending-up' : 
                              optimization.type === 'decrease' ? 'trending-down' : 'activity'} 
                        size={20} 
                      />
                      <div>
                        <Typography variant="h6" weight="semibold">
                          {optimization.productName}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          SKU: {optimization.sku}
                        </Typography>
                      </div>
                    </CardTitle>
                    <Badge 
                      variant={optimization.confidence > 0.8 ? 'success' : 
                               optimization.confidence > 0.6 ? 'warning' : 'secondary'} 
                      size="sm"
                    >
                      {Math.round(optimization.confidence * 100)}% Confidence
                    </Badge>
                  </CardHeader>

                  <MetricsGrid>
                    <MetricItem>
                      <Typography variant="caption" color="secondary">Current Price</Typography>
                      <MetricValue>{formatPrice(optimization.currentPrice)}</MetricValue>
                    </MetricItem>
                    <MetricItem>
                      <Typography variant="caption" color="secondary">Recommended Price</Typography>
                      <MetricValue trend={optimization.type === 'increase' ? 'up' : 'down'}>
                        {formatPrice(optimization.recommendedPrice)}
                      </MetricValue>
                    </MetricItem>
                    <MetricItem>
                      <Typography variant="caption" color="secondary">Expected Revenue Impact</Typography>
                      <MetricValue trend="up">
                        +{formatPrice(optimization.revenueImpact)}
                      </MetricValue>
                    </MetricItem>
                    <MetricItem>
                      <Typography variant="caption" color="secondary">Market Position</Typography>
                      <Typography variant="body2" weight="medium">
                        {optimization.marketPosition}
                      </Typography>
                    </MetricItem>
                  </MetricsGrid>

                  <Typography variant="body2" color="secondary" style={{ margin: `${props.theme?.spacing?.[3] || '12px'} 0` }}>
                    <strong>AI Insight:</strong> {optimization.insight}
                  </Typography>

                  <CardActions>
                    <ActionButton 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleOptimizationApply(optimization)}
                    >
                      Apply Recommendation
                    </ActionButton>
                    <ActionButton variant="outline" size="sm">
                      View Details
                    </ActionButton>
                  </CardActions>
                </OptimizationCard>
              ))}
            </AnimatePresence>
          </OptimizationCards>
        )}
      </ContentArea>
    </Container>
  );
};

export default PriceHistoryOptimization;