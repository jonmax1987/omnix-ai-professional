import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Avatar from '../atoms/Avatar';
import { useI18n } from '../../hooks/useI18n';

const WidgetContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  max-height: 800px;
  display: flex;
  flex-direction: column;
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    flex-direction: column;
    gap: ${props => props.theme.spacing[2]};
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    align-self: flex-end;
    width: 100%;
    justify-content: space-between;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
`;

const FilterTab = styled(motion.button)`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  white-space: nowrap;
  
  &:hover {
    color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.primary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getStatColor(props.type, props.theme)};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing[1]};
`;

const ProductsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[2]} 0;
`;

const ProductItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  position: relative;
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    gap: ${props => props.theme.spacing[3]};
  }
`;

const RankBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => getRankGradient(props.rank, props.theme)};
  color: ${props => props.rank <= 3 ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  flex-shrink: 0;
  position: relative;
  
  ${props => props.rank <= 3 && css`
    box-shadow: ${props.theme.shadows.md};
    
    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      padding: 2px;
      background: ${getRankGradient(props.rank, props.theme)};
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: exclude;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: pulse 2s infinite;
    }
  `}
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 48px;
    height: 48px;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const ProductMetrics = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing[1]};
  text-align: right;
  flex-shrink: 0;
`;

const MetricValue = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => getMetricColor(props.type, props.theme)};
  font-size: ${props => props.size === 'lg' ? props.theme.typography.fontSize.lg : props.theme.typography.fontSize.base};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TrendIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => getTrendColor(props.trend, props.theme)};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.text.tertiary};
`;

const AIInsightsBanner = styled(motion.div)`
  margin: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  padding: ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[50]}, ${props => props.theme.colors.primary[100]});
  border: 1px solid ${props => props.theme.colors.primary[200]};
  border-radius: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    margin: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    padding: ${props => props.theme.spacing[3]};
  }
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const AIIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.primary[600]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`;

const getRankGradient = (rank, theme) => {
  if (rank === 1) return `linear-gradient(135deg, ${theme.colors.yellow[400]}, ${theme.colors.yellow[500]})`;
  if (rank === 2) return `linear-gradient(135deg, ${theme.colors.gray[300]}, ${theme.colors.gray[400]})`;
  if (rank === 3) return `linear-gradient(135deg, ${theme.colors.orange[400]}, ${theme.colors.orange[500]})`;
  return theme.colors.background.secondary;
};

const getStatColor = (type, theme) => {
  const colors = {
    revenue: theme.colors.green[600],
    units: theme.colors.blue[600],
    growth: theme.colors.primary[600],
    margin: theme.colors.purple[600]
  };
  return colors[type] || theme.colors.text.primary;
};

const getMetricColor = (type, theme) => {
  const colors = {
    revenue: theme.colors.green[600],
    units: theme.colors.blue[600],
    growth: theme.colors.primary[600],
    margin: theme.colors.purple[600]
  };
  return colors[type] || theme.colors.text.primary;
};

const getTrendColor = (trend, theme) => {
  if (trend > 0) return theme.colors.green[600];
  if (trend < 0) return theme.colors.red[600];
  return theme.colors.gray[500];
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const TopPerformingProducts = ({
  products = [],
  timeFilter = '7d',
  onProductClick,
  onTimeFilterChange,
  loading = false,
  showInsights = true,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState(timeFilter);
  
  const timeFilters = [
    { id: '24h', label: '24h' },
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' }
  ];

  // Mock data for demonstration
  const defaultProducts = [
    {
      id: 'prod-1',
      name: 'iPhone 15 Pro Max',
      category: 'Electronics',
      image: '/images/iphone.jpg',
      revenue: 125800,
      units: 89,
      growth: 23.5,
      margin: 42.3,
      trend: 15.2,
      sku: 'IPH-15-PM-256'
    },
    {
      id: 'prod-2',
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Electronics',
      image: '/images/galaxy.jpg',
      revenue: 98600,
      units: 76,
      growth: 18.7,
      margin: 38.9,
      trend: 12.1,
      sku: 'SAM-S24-U-512'
    },
    {
      id: 'prod-3',
      name: 'Nike Air Jordan 1',
      category: 'Footwear',
      image: '/images/jordan.jpg',
      revenue: 87500,
      units: 142,
      growth: 45.2,
      margin: 55.8,
      trend: 28.9,
      sku: 'NIKE-AJ1-BRD'
    },
    {
      id: 'prod-4',
      name: 'MacBook Pro 16"',
      category: 'Electronics',
      image: '/images/macbook.jpg',
      revenue: 76200,
      units: 28,
      growth: 12.4,
      margin: 35.6,
      trend: 8.7,
      sku: 'APPLE-MBP16'
    },
    {
      id: 'prod-5',
      name: 'Organic Avocados (6pk)',
      category: 'Groceries',
      image: '/images/avocado.jpg',
      revenue: 15600,
      units: 890,
      growth: 32.1,
      margin: 28.4,
      trend: 19.5,
      sku: 'ORG-AVO-6PK'
    },
    {
      id: 'prod-6',
      name: 'PlayStation 5',
      category: 'Gaming',
      image: '/images/ps5.jpg',
      revenue: 67800,
      units: 34,
      growth: 8.9,
      margin: 18.2,
      trend: -2.3,
      sku: 'SONY-PS5-STD'
    },
    {
      id: 'prod-7',
      name: 'Dyson V15 Detect',
      category: 'Home Appliances',
      image: '/images/dyson.jpg',
      revenue: 45300,
      units: 52,
      growth: 28.6,
      margin: 41.7,
      trend: 22.1,
      sku: 'DYS-V15-DET'
    },
    {
      id: 'prod-8',
      name: 'Levi\'s 501 Jeans',
      category: 'Clothing',
      image: '/images/levis.jpg',
      revenue: 38900,
      units: 167,
      growth: 15.3,
      margin: 52.1,
      trend: 11.8,
      sku: 'LEV-501-BLU'
    }
  ];

  const currentProducts = products.length > 0 ? products : defaultProducts;

  const stats = useMemo(() => {
    const totalRevenue = currentProducts.reduce((sum, p) => sum + p.revenue, 0);
    const totalUnits = currentProducts.reduce((sum, p) => sum + p.units, 0);
    const avgGrowth = currentProducts.reduce((sum, p) => sum + p.growth, 0) / currentProducts.length;
    const avgMargin = currentProducts.reduce((sum, p) => sum + p.margin, 0) / currentProducts.length;
    
    return {
      revenue: totalRevenue,
      units: totalUnits,
      growth: avgGrowth,
      margin: avgMargin
    };
  }, [currentProducts]);

  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
    onTimeFilterChange?.(filterId);
  };

  const topInsights = [
    'Electronics category driving 62% of total revenue this period',
    'Nike Air Jordan showing exceptional 45% growth - consider expanding inventory',
    'Mobile phones maintaining strong performance with healthy margins'
  ];

  return (
    <WidgetContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <WidgetHeader>
        <HeaderLeft>
          <HeaderTitle>
            <Icon name="trending-up" size={24} />
            <Typography variant="h5" weight="semibold">
              Top Performing Products
            </Typography>
            <Badge variant="primary" size="sm">
              {currentProducts.length}
            </Badge>
          </HeaderTitle>
        </HeaderLeft>

        <HeaderRight>
          <FilterTabs>
            {timeFilters.map(filter => (
              <FilterTab
                key={filter.id}
                active={selectedFilter === filter.id}
                onClick={() => handleFilterChange(filter.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {filter.label}
              </FilterTab>
            ))}
          </FilterTabs>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </WidgetHeader>

      <StatsBar>
        <StatItem>
          <StatValue type="revenue">{formatCurrency(stats.revenue)}</StatValue>
          <StatLabel>Total Revenue</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue type="units">{formatNumber(stats.units)}</StatValue>
          <StatLabel>Units Sold</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue type="growth">{stats.growth.toFixed(1)}%</StatValue>
          <StatLabel>Avg Growth</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue type="margin">{stats.margin.toFixed(1)}%</StatValue>
          <StatLabel>Avg Margin</StatLabel>
        </StatItem>
      </StatsBar>

      {showInsights && (
        <AIInsightsBanner
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4 }}
        >
          <InsightHeader>
            <AIIcon>AI</AIIcon>
            <Typography variant="body2" weight="semibold">
              Performance Insights
            </Typography>
            <Badge variant="info" size="sm">94% accuracy</Badge>
          </InsightHeader>
          <Typography variant="body2" style={{ lineHeight: 1.5 }}>
            {topInsights[0]}
          </Typography>
        </AIInsightsBanner>
      )}

      <ProductsList>
        {loading ? (
          <EmptyState>
            <Icon name="loader" size={48} />
            <Typography variant="body1" color="secondary">
              Loading top products...
            </Typography>
          </EmptyState>
        ) : currentProducts.length === 0 ? (
          <EmptyState>
            <Icon name="trending-up" size={48} />
            <div>
              <Typography variant="h6" weight="medium">
                No products found
              </Typography>
              <Typography variant="body2" color="secondary">
                Check back later for performance data
              </Typography>
            </div>
          </EmptyState>
        ) : (
          currentProducts.map((product, index) => (
            <ProductItem
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              onClick={() => onProductClick?.(product)}
            >
              <RankBadge rank={index + 1}>
                {index + 1}
              </RankBadge>

              <ProductImage>
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <Icon name="package" size={24} />
                )}
              </ProductImage>

              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductMeta>
                  <span>{product.category}</span>
                  <span>•</span>
                  <span>{product.sku}</span>
                  <Badge variant="secondary" size="sm">
                    {product.units} units
                  </Badge>
                </ProductMeta>
              </ProductInfo>

              <ProductMetrics>
                <MetricValue type="revenue" size="lg">
                  {formatCurrency(product.revenue)}
                </MetricValue>
                <TrendIndicator trend={product.trend}>
                  <Icon 
                    name={product.trend > 0 ? 'trending-up' : product.trend < 0 ? 'trending-down' : 'minus'} 
                    size={12} 
                  />
                  {Math.abs(product.trend).toFixed(1)}%
                </TrendIndicator>
                <MetricLabel>{product.margin.toFixed(1)}% margin</MetricLabel>
              </ProductMetrics>
            </ProductItem>
          ))
        )}
      </ProductsList>
    </WidgetContainer>
  );
};

export default TopPerformingProducts;