import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';

// Simple formatting utilities
const formatNumber = (num) => num?.toLocaleString() || '0';
const formatCurrency = (amount) => `$${amount?.toLocaleString() || '0'}`;

const Container = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  height: 600px;
  display: flex;
  flex-direction: column;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AIBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #00D9FF 0%, #7928CA 100%);
  border-radius: 20px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: white;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ConfidenceBadge = styled.div`
  padding: 4px 8px;
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: 6px 12px;
  background: ${({ active, theme }) => 
    active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => 
    active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) => 
      active ? theme.colors.primary : theme.colors.background.tertiary};
  }
`;

const ProductList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin: -4px;
  padding: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.secondary};
    border-radius: 3px;
  }
`;

const ProductCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'urgency'
})`
  background: ${({ urgency, theme }) => {
    switch (urgency) {
      case 'critical': return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)';
      case 'warning': return 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)';
      case 'normal': return theme.colors.background.tertiary;
      default: return theme.colors.background.tertiary;
    }
  }};
  border: 1px solid ${({ urgency, theme }) => {
    switch (urgency) {
      case 'critical': return 'rgba(239, 68, 68, 0.3)';
      case 'warning': return 'rgba(245, 158, 11, 0.3)';
      default: return theme.colors.border.primary;
    }
  }};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ProductMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const UrgencyIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'urgency'
})`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ urgency }) => {
    switch (urgency) {
      case 'critical': return 'rgba(239, 68, 68, 0.2)';
      case 'warning': return 'rgba(245, 158, 11, 0.2)';
      default: return 'rgba(34, 197, 94, 0.2)';
    }
  }};
  color: ${({ urgency }) => {
    switch (urgency) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#22C55E';
    }
  }};
`;

const InventoryBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
`;

const CurrentStock = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 8px;
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['urgency', 'value'].includes(prop)
})`
  height: 100%;
  background: ${({ urgency }) => {
    switch (urgency) {
      case 'critical': return 'linear-gradient(90deg, #EF4444, #DC2626)';
      case 'warning': return 'linear-gradient(90deg, #F59E0B, #D97706)';
      default: return 'linear-gradient(90deg, #22C55E, #16A34A)';
    }
  }};
  width: ${({ value }) => Math.max(5, value)}%;
  transition: width 0.5s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const PredictionContainer = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const PredictionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PredictionDate = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DaysRemaining = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'urgency'
})`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ urgency }) => {
    switch (urgency) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#22C55E';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant'
})`
  padding: 6px 12px;
  background: ${({ variant, theme }) => 
    variant === 'primary' 
      ? `linear-gradient(135deg, ${theme.colors.primary}, #764BA2)`
      : 'transparent'};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? 'white' : theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  margin-top: 16px;
  flex-wrap: wrap;
`;

const BulkButton = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #00D9FF 0%, #7928CA 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 217, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Sample data
const inventoryData = [
  {
    id: '1',
    name: 'Premium Olive Oil 500ml',
    category: 'Oils & Vinegars',
    currentStock: 12,
    optimalStock: 50,
    daysRemaining: 3,
    predictedOutDate: '2024-01-25',
    urgency: 'critical',
    suggestedOrder: 150,
    confidence: 94,
    weeklyConsumption: 18,
    seasonalFactor: 1.2,
    price: 24.99,
    supplier: 'Mediterranean Foods Ltd.'
  },
  {
    id: '2',
    name: 'Organic Pasta Sauce 680g',
    category: 'Canned Foods',
    currentStock: 28,
    optimalStock: 80,
    daysRemaining: 7,
    predictedOutDate: '2024-01-29',
    urgency: 'warning',
    suggestedOrder: 120,
    confidence: 87,
    weeklyConsumption: 12,
    seasonalFactor: 0.9,
    price: 8.99,
    supplier: 'Fresh Garden Co.'
  },
  {
    id: '3',
    name: 'Artisan Bread Flour 1kg',
    category: 'Baking',
    currentStock: 45,
    optimalStock: 60,
    daysRemaining: 14,
    predictedOutDate: '2024-02-05',
    urgency: 'normal',
    suggestedOrder: 80,
    confidence: 91,
    weeklyConsumption: 8,
    seasonalFactor: 1.1,
    price: 12.50,
    supplier: 'Bakery Supplies Inc.'
  }
];

const PredictiveInventoryPanel = ({ 
  data = inventoryData, 
  onOrderGenerate,
  onBulkAction,
  loading = false 
}) => {
  const [filter, setFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredData = data.filter(product => {
    switch (filter) {
      case 'critical':
        return product.urgency === 'critical';
      case 'warning':
        return product.urgency === 'warning';
      case 'normal':
        return product.urgency === 'normal';
      default:
        return true;
    }
  });

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <Icon name="alert-triangle" size={14} />;
      case 'warning':
        return <Icon name="clock" size={14} />;
      default:
        return <Icon name="check-circle" size={14} />;
    }
  };

  const getUrgencyText = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'Critical';
      case 'warning':
        return 'Warning';
      default:
        return 'Normal';
    }
  };

  const getStockPercentage = (current, optimal) => {
    return (current / optimal) * 100;
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkOrder = async () => {
    setIsLoading(true);
    try {
      const selectedItems = data.filter(product => 
        selectedProducts.includes(product.id)
      );
      
      if (onBulkAction) {
        await onBulkAction('generate_orders', selectedItems);
      }
      
      setSelectedProducts([]);
    } catch (error) {
      console.error('Bulk order failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const criticalCount = data.filter(p => p.urgency === 'critical').length;
  const warningCount = data.filter(p => p.urgency === 'warning').length;

  return (
    <Container>
      <Header>
        <Title>
          <Icon name="package" size={24} />
          Stock Depletion Forecast
        </Title>
        <AIBadge>
          <Icon name="zap" size={16} />
          Claude Sonnet
        </AIBadge>
        <ConfidenceBadge>94% Confidence</ConfidenceBadge>
      </Header>

      <FilterRow>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All ({data.length})
        </FilterButton>
        <FilterButton 
          active={filter === 'critical'} 
          onClick={() => setFilter('critical')}
        >
          Critical ({criticalCount})
        </FilterButton>
        <FilterButton 
          active={filter === 'warning'} 
          onClick={() => setFilter('warning')}
        >
          Warning ({warningCount})
        </FilterButton>
        <FilterButton 
          active={filter === 'normal'} 
          onClick={() => setFilter('normal')}
        >
          Normal ({data.length - criticalCount - warningCount})
        </FilterButton>
      </FilterRow>

      <ProductList>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '200px',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <Typography variant="body2" color="secondary">
              Loading inventory forecasting...
            </Typography>
          </div>
        ) : (
          <AnimatePresence>
            {filteredData.map((product, index) => (
            <ProductCard
              key={product.id}
              urgency={product.urgency}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleProductToggle(product.id)}
            >
              <ProductHeader>
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductMeta>
                    {product.category} • {product.supplier}
                  </ProductMeta>
                </ProductInfo>
                <UrgencyIndicator urgency={product.urgency}>
                  {getUrgencyIcon(product.urgency)}
                  {getUrgencyText(product.urgency)}
                </UrgencyIndicator>
              </ProductHeader>

              <InventoryBar>
                <StockInfo>
                  <Icon name="package" size={16} />
                  <CurrentStock>{product.currentStock} units</CurrentStock>
                </StockInfo>
                <ProgressBarContainer>
                  <ProgressBar 
                    urgency={product.urgency}
                    value={getStockPercentage(product.currentStock, product.optimalStock)}
                  />
                </ProgressBarContainer>
              </InventoryBar>

              <PredictionContainer>
                <PredictionInfo>
                  <PredictionDate>
                    <Icon name="calendar" size={14} />
                    Out by: {product.predictedOutDate}
                  </PredictionDate>
                  <DaysRemaining urgency={product.urgency}>
                    ({product.daysRemaining} days)
                  </DaysRemaining>
                </PredictionInfo>

                <ActionButtons>
                  <ActionButton
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      // View details
                    }}
                  >
                    <Icon name="trending" size={12} />
                    Details
                  </ActionButton>
                  <ActionButton
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOrderGenerate) {
                        onOrderGenerate(product);
                      }
                    }}
                  >
                    <Icon name="shopping-cart" size={12} />
                    Order {product.suggestedOrder}
                  </ActionButton>
                </ActionButtons>
              </PredictionContainer>
            </ProductCard>
          ))}
          </AnimatePresence>
        )}
      </ProductList>

      {selectedProducts.length > 0 && (
        <BulkActions>
          <BulkButton
            onClick={handleBulkOrder}
            disabled={isLoading}
          >
            <Icon name="shopping-cart" size={16} />
            {isLoading ? 'Processing...' : `Generate Orders (${selectedProducts.length})`}
          </BulkButton>
          <BulkButton
            onClick={() => setSelectedProducts([])}
            style={{ 
              background: 'transparent',
              color: '#6B7280',
              border: '1px solid #D1D5DB'
            }}
          >
            <Icon name="x" size={16} />
            Clear Selection
          </BulkButton>
        </BulkActions>
      )}
    </Container>
  );
};

export default PredictiveInventoryPanel;