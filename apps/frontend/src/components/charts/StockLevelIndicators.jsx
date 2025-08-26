import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

const IndicatorsContainer = styled.div`
  width: 100%;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const FilterToggle = styled.div`
  display: flex;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  overflow: hidden;
`;

const FilterButton = styled.button`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: none;
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.caption.fontSize};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.background.hover};
  }
`;

const StockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StockCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[300]};
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const StatusBadge = styled(Badge)`
  flex-shrink: 0;
`;

const StockMeter = styled.div`
  margin: ${props => props.theme.spacing[3]} 0;
`;

const MeterBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MeterFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.color};
  border-radius: 4px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: ${props => props.animated ? 'shimmer 2s infinite' : 'none'};
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const MeterLabels = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StockNumbers = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[3]};
`;

const StockStat = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[1]};
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.text.secondary};
  gap: ${props => props.theme.spacing[2]};
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.text.secondary};
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const SummaryCard = styled.div`
  text-align: center;
`;

const SummaryIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing[2]};
`;

const StockLevelIndicators = ({
  data = [],
  filter = 'all', // 'all', 'low', 'medium', 'high', 'out-of-stock'
  onFilterChange,
  loading = false,
  animate = true,
  onProductClick
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Generate mock data if no data provided
  const stockData = useMemo(() => {
    if (data.length > 0) return data;
    
    // Generate mock stock level data
    return [
      {
        id: 'P001',
        name: 'iPhone 14 Pro',
        sku: 'AAPL-IP14P-128',
        category: 'Electronics',
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        targetStock: 80,
        unitPrice: 999,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'P002',
        name: 'Samsung Galaxy S23',
        sku: 'SAMS-GS23-256',
        category: 'Electronics',
        currentStock: 12,
        minStock: 15,
        maxStock: 80,
        targetStock: 60,
        unitPrice: 899,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'P003',
        name: 'Nike Air Max 90',
        sku: 'NIKE-AM90-WHT',
        category: 'Footwear',
        currentStock: 0,
        minStock: 10,
        maxStock: 50,
        targetStock: 30,
        unitPrice: 120,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'P004',
        name: 'MacBook Pro 16"',
        sku: 'AAPL-MBP16-1TB',
        category: 'Electronics',
        currentStock: 8,
        minStock: 5,
        maxStock: 25,
        targetStock: 15,
        unitPrice: 2499,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'P005',
        name: 'Levi\'s 501 Jeans',
        sku: 'LEVI-501-32X32',
        category: 'Clothing',
        currentStock: 78,
        minStock: 20,
        maxStock: 100,
        targetStock: 80,
        unitPrice: 80,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'P006',
        name: 'Sony WH-1000XM4',
        sku: 'SONY-WH1000XM4',
        category: 'Electronics',
        currentStock: 3,
        minStock: 8,
        maxStock: 40,
        targetStock: 25,
        unitPrice: 349,
        lastUpdated: new Date().toISOString()
      }
    ];
  }, [data]);

  // Calculate stock status and metrics
  const stockWithStatus = useMemo(() => {
    return stockData.map(item => {
      const stockPercentage = (item.currentStock / item.maxStock) * 100;
      const targetPercentage = (item.targetStock / item.maxStock) * 100;
      const minPercentage = (item.minStock / item.maxStock) * 100;
      
      let status = 'high';
      let statusColor = '#10B981'; // green
      let statusVariant = 'success';
      
      if (item.currentStock === 0) {
        status = 'out-of-stock';
        statusColor = '#EF4444'; // red
        statusVariant = 'error';
      } else if (item.currentStock < item.minStock) {
        status = 'low';
        statusColor = '#F59E0B'; // yellow
        statusVariant = 'warning';
      } else if (item.currentStock < item.targetStock) {
        status = 'medium';
        statusColor = '#3B82F6'; // blue
        statusVariant = 'info';
      }
      
      return {
        ...item,
        status,
        statusColor,
        statusVariant,
        stockPercentage,
        targetPercentage,
        minPercentage,
        value: item.currentStock * item.unitPrice
      };
    });
  }, [stockData]);

  // Filter data based on current filter
  const filteredData = useMemo(() => {
    if (filter === 'all') return stockWithStatus;
    return stockWithStatus.filter(item => item.status === filter);
  }, [stockWithStatus, filter]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const outOfStock = stockWithStatus.filter(item => item.status === 'out-of-stock').length;
    const lowStock = stockWithStatus.filter(item => item.status === 'low').length;
    const mediumStock = stockWithStatus.filter(item => item.status === 'medium').length;
    const highStock = stockWithStatus.filter(item => item.status === 'high').length;
    const totalValue = stockWithStatus.reduce((sum, item) => sum + item.value, 0);
    
    return {
      outOfStock,
      lowStock,
      mediumStock,
      highStock,
      totalValue,
      totalProducts: stockWithStatus.length
    };
  }, [stockWithStatus]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'out-of-stock': return 'Out of Stock';
      case 'low': return 'Low Stock';
      case 'medium': return 'Medium Stock';
      case 'high': return 'Healthy Stock';
      default: return status;
    }
  };

  return (
    <IndicatorsContainer>
      <Header>
        <Title>
          <Icon name="gauge" size={20} color="primary" />
          <div>
            <Typography variant="h6" weight="semibold">
              Stock Level Indicators
            </Typography>
            <Typography variant="caption" color="secondary">
              Real-time inventory status monitoring
            </Typography>
          </div>
        </Title>
        
        <Controls>
          <FilterToggle>
            <FilterButton 
              active={filter === 'all'}
              onClick={() => onFilterChange?.('all')}
            >
              All ({summary.totalProducts})
            </FilterButton>
            <FilterButton 
              active={filter === 'out-of-stock'}
              onClick={() => onFilterChange?.('out-of-stock')}
            >
              Out ({summary.outOfStock})
            </FilterButton>
            <FilterButton 
              active={filter === 'low'}
              onClick={() => onFilterChange?.('low')}
            >
              Low ({summary.lowStock})
            </FilterButton>
            <FilterButton 
              active={filter === 'medium'}
              onClick={() => onFilterChange?.('medium')}
            >
              Medium ({summary.mediumStock})
            </FilterButton>
            <FilterButton 
              active={filter === 'high'}
              onClick={() => onFilterChange?.('high')}
            >
              High ({summary.highStock})
            </FilterButton>
          </FilterToggle>
        </Controls>
      </Header>

      {/* Summary Cards */}
      <Summary>
        <SummaryCard>
          <SummaryIcon color="#EF4444">
            <Icon name="alert-triangle" size={24} color="#EF4444" />
          </SummaryIcon>
          <Typography variant="h4" weight="bold" color="error">
            {summary.outOfStock}
          </Typography>
          <Typography variant="caption" color="secondary">
            Out of Stock
          </Typography>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon color="#F59E0B">
            <Icon name="alert" size={24} color="#F59E0B" />
          </SummaryIcon>
          <Typography variant="h4" weight="bold" style={{ color: '#F59E0B' }}>
            {summary.lowStock}
          </Typography>
          <Typography variant="caption" color="secondary">
            Low Stock Items
          </Typography>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon color="#10B981">
            <Icon name="check-circle" size={24} color="#10B981" />
          </SummaryIcon>
          <Typography variant="h4" weight="bold" color="success">
            {summary.highStock}
          </Typography>
          <Typography variant="caption" color="secondary">
            Healthy Stock
          </Typography>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon color="#3B82F6">
            <Icon name="dollar-sign" size={24} color="#3B82F6" />
          </SummaryIcon>
          <Typography variant="h4" weight="bold" color="primary">
            {formatCurrency(summary.totalValue)}
          </Typography>
          <Typography variant="caption" color="secondary">
            Total Value
          </Typography>
        </SummaryCard>
      </Summary>

      {/* Stock Grid */}
      {loading ? (
        <LoadingSpinner>
          <Icon name="refresh" size={16} />
          <Typography variant="body2">Loading stock data...</Typography>
        </LoadingSpinner>
      ) : filteredData.length === 0 ? (
        <NoDataMessage>
          <Typography variant="body2" color="secondary">
            No products found for the selected filter
          </Typography>
        </NoDataMessage>
      ) : (
        <StockGrid>
          {filteredData.map((item, index) => (
            <StockCard
              key={item.id}
              onClick={() => onProductClick?.(item)}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={animate ? { opacity: 0, y: 20 } : false}
              animate={animate ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProductInfo>
                <ProductDetails>
                  <Typography variant="body1" weight="semibold">
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    SKU: {item.sku}
                  </Typography>
                  <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                    {item.category}
                  </Typography>
                </ProductDetails>
                <StatusBadge variant={item.statusVariant} size="sm">
                  {getStatusLabel(item.status)}
                </StatusBadge>
              </ProductInfo>

              <StockMeter>
                <MeterBar>
                  <MeterFill
                    color={item.statusColor}
                    animated={item.status === 'low' || item.status === 'out-of-stock'}
                    initial={animate ? { width: '0%' } : { width: `${item.stockPercentage}%` }}
                    animate={{ width: `${item.stockPercentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </MeterBar>
                
                <MeterLabels>
                  <Typography variant="caption" color="secondary">
                    Min: {item.minStock}
                  </Typography>
                  <Typography variant="caption" weight="medium">
                    {item.currentStock} / {item.maxStock}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Target: {item.targetStock}
                  </Typography>
                </MeterLabels>
              </StockMeter>

              <StockNumbers>
                <StockStat>
                  <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                    Current
                  </Typography>
                  <Typography variant="body2" weight="semibold">
                    {item.currentStock}
                  </Typography>
                </StockStat>
                
                <StockStat>
                  <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                    Value
                  </Typography>
                  <Typography variant="body2" weight="semibold">
                    {formatCurrency(item.value)}
                  </Typography>
                </StockStat>
                
                <StockStat>
                  <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                    Unit Price
                  </Typography>
                  <Typography variant="body2" weight="semibold">
                    {formatCurrency(item.unitPrice)}
                  </Typography>
                </StockStat>
              </StockNumbers>
            </StockCard>
          ))}
        </StockGrid>
      )}
    </IndicatorsContainer>
  );
};

export default StockLevelIndicators;