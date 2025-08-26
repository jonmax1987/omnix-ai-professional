import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import DashboardGrid, { GridItem } from '../components/organisms/DashboardGrid';
import MetricCard from '../components/molecules/MetricCard';
import ChartContainer from '../components/organisms/ChartContainer';
import DataTable from '../components/organisms/DataTable';
import AlertCard from '../components/molecules/AlertCard';

const ProductDetailContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  min-height: 100vh;
  background: ${props => props.theme.colors.background.primary};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[4]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]};
  }
`;

const ProductHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[8]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing[4]};
    margin-bottom: ${props => props.theme.spacing[6]};
  }
`;

const ProductImage = styled.div`
  width: 200px;
  height: 200px;
  border-radius: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    width: 150px;
    height: 150px;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductTitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const ProductTitle = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  flex-shrink: 0;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
    
    & > * {
      flex: 1;
    }
  }
`;

const ProductMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const StockStatus = styled.div.withConfig({
  shouldForwardProp: (prop) => !['level'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => getStatusBackground(props.level, props.theme)};
  border: 1px solid ${props => getStatusBorder(props.level, props.theme)};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const StatusDot = styled.div.withConfig({
  shouldForwardProp: (prop) => !['level'].includes(prop),
})`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => getStatusColor(props.level, props.theme)};
`;

const TabNavigation = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  margin-bottom: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  overflow-x: auto;
`;

const TabButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  border-radius: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[2]} 0 0;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  
  ${props => props.active && `
    color: ${props.theme.colors.primary[600]};
    border-bottom-color: ${props.theme.colors.primary[600]};
    background: ${props.theme.colors.primary[50]};
  `}
`;

const TabContent = styled(motion.div)`
  min-height: 400px;
`;

const MockChart = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, ${props => props.color}20, ${props => props.color}40);
  border-radius: ${props => props.theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      ${props => props.color}10 10px,
      ${props => props.color}10 20px
    );
  }
`;

const getStatusColor = (level, theme) => {
  switch (level) {
    case 'out': return theme.colors.red[500];
    case 'low': return theme.colors.yellow[500];
    case 'medium': return theme.colors.primary[500];
    default: return theme.colors.green[500];
  }
};

const getStatusBackground = (level, theme) => {
  switch (level) {
    case 'out': return theme.colors.red[50];
    case 'low': return theme.colors.yellow[50];
    case 'medium': return theme.colors.primary[50];
    default: return theme.colors.green[50];
  }
};

const getStatusBorder = (level, theme) => {
  switch (level) {
    case 'out': return theme.colors.red[200];
    case 'low': return theme.colors.yellow[200];
    case 'medium': return theme.colors.primary[200];
    default: return theme.colors.green[200];
  }
};

const getStockInfo = (current, min = 0, max = 0) => {
  if (current === 0) return { level: 'out', label: 'Out of Stock', message: 'This product is currently out of stock' };
  if (current <= min) return { level: 'low', label: 'Low Stock', message: `Stock level is below minimum threshold of ${min}` };
  if (current <= max * 0.5) return { level: 'medium', label: 'Medium Stock', message: 'Stock levels are moderate' };
  return { level: 'high', label: 'In Stock', message: 'Stock levels are healthy' };
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const ProductDetail = ({ productId = 'PRD-001' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  // Mock product data
  const product = {
    id: 'PRD-001',
    name: 'iPhone 14 Pro',
    description: 'Latest iPhone with Pro camera system, A16 Bionic chip, and Dynamic Island. Available in multiple colors and storage capacities.',
    sku: 'APL-IP14P-256-SG',
    category: 'Electronics',
    supplier: 'Apple Inc.',
    price: 999.00,
    cost: 750.00,
    currentStock: 2,
    minStock: 5,
    maxStock: 50,
    reorderPoint: 10,
    location: 'A-1-01',
    barcode: '123456789012',
    weight: 0.206,
    dimensions: '147.5 × 71.5 × 7.85 mm',
    status: 'active',
    tags: ['smartphone', 'premium', 'ios'],
    createdAt: '2023-09-01T00:00:00Z',
    lastUpdated: '2024-01-15T10:30:00Z',
    image: null
  };

  const stockInfo = getStockInfo(product.currentStock, product.minStock, product.maxStock);

  // Mock metrics
  const metrics = [
    {
      title: 'Total Revenue',
      value: 125680,
      valueFormat: 'currency',
      change: 8.2,
      trend: 'up',
      icon: 'trending',
      iconColor: 'success',
      variant: 'compact'
    },
    {
      title: 'Units Sold',
      value: 126,
      change: -5.1,
      trend: 'down',
      icon: 'products',
      iconColor: 'primary',
      variant: 'compact'
    },
    {
      title: 'Avg. Order Value',
      value: 997.30,
      valueFormat: 'currency',
      change: 12.4,
      trend: 'up',
      icon: 'trending',
      iconColor: 'success',
      variant: 'compact'
    },
    {
      title: 'Return Rate',
      value: 2.1,
      valueFormat: 'percentage',
      change: -0.8,
      trend: 'down',
      icon: 'checkCircle',
      iconColor: 'success',
      variant: 'compact'
    }
  ];

  // Mock transaction history
  const transactions = [
    {
      id: 'TXN-001',
      type: 'sale',
      quantity: -1,
      price: 999.00,
      customer: 'John Doe',
      date: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: 'TXN-002',
      type: 'restock',
      quantity: 10,
      price: 750.00,
      supplier: 'Apple Inc.',
      date: '2024-01-12T14:20:00Z',
      status: 'completed'
    },
    {
      id: 'TXN-003',
      type: 'adjustment',
      quantity: -2,
      reason: 'Damaged units',
      date: '2024-01-10T09:15:00Z',
      status: 'completed'
    },
    {
      id: 'TXN-004',
      type: 'sale',
      quantity: -1,
      price: 999.00,
      customer: 'Jane Smith',
      date: '2024-01-08T16:45:00Z',
      status: 'completed'
    }
  ];

  const transactionColumns = [
    {
      key: 'type',
      header: 'Type',
      width: '100px',
      render: (_, transaction) => (
        <Badge 
          variant={
            transaction.type === 'sale' ? 'success' : 
            transaction.type === 'restock' ? 'info' : 
            'warning'
          } 
          size="sm"
        >
          {transaction.type}
        </Badge>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      width: '100px',
      align: 'right',
      render: (_, transaction) => (
        <Typography 
          variant="body2" 
          weight="medium"
          color={transaction.quantity > 0 ? 'success' : 'error'}
        >
          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
        </Typography>
      )
    },
    {
      key: 'details',
      header: 'Details',
      render: (_, transaction) => (
        <div>
          <Typography variant="body2" weight="medium">
            {transaction.customer || transaction.supplier || transaction.reason}
          </Typography>
          {transaction.price && (
            <Typography variant="caption" color="secondary">
              {formatPrice(transaction.price)}
            </Typography>
          )}
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      width: '150px',
      render: (_, transaction) => (
        <Typography variant="body2" color="secondary">
          {formatDate(transaction.date)}
        </Typography>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (_, transaction) => (
        <Badge variant="success" size="sm">
          {transaction.status}
        </Badge>
      )
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'history', label: 'Stock History', icon: 'analytics' },
    { id: 'forecasts', label: 'Demand Forecasts', icon: 'trending' },
    { id: 'transactions', label: 'Transactions', icon: 'products' },
    { id: 'alerts', label: 'Alerts', icon: 'bell' }
  ];

  const handleEdit = () => {
    console.log('Edit product:', product.id);
  };

  const handleReorder = () => {
    console.log('Reorder product:', product.id);
  };

  const handleAdjustStock = () => {
    console.log('Adjust stock:', product.id);
  };

  const handleExport = () => {
    console.log('Export product data:', product.id);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <TabContent
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardGrid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} spacing="lg">
              {metrics.map((metric) => (
                <GridItem key={metric.title}>
                  <MetricCard {...metric} />
                </GridItem>
              ))}
            </DashboardGrid>
          </TabContent>
        );

      case 'history':
        return (
          <TabContent
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ChartContainer
              title="Stock Level History"
              description="Historical stock levels and movements"
              type="line"
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              exportable
              showLegend
              legend={[
                { id: 'stock', label: 'Stock Level', color: '#3B82F6' },
                { id: 'min', label: 'Minimum Stock', color: '#EF4444' },
                { id: 'max', label: 'Maximum Stock', color: '#22C55E' }
              ]}
            >
              <MockChart color="#3B82F6">
                <Typography variant="h6" color="primary">
                  Stock History Chart
                </Typography>
              </MockChart>
            </ChartContainer>
          </TabContent>
        );

      case 'forecasts':
        return (
          <TabContent
            key="forecasts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
              <GridItem>
                <ChartContainer
                  title="Demand Forecast"
                  description="AI-powered demand predictions"
                  type="area"
                  badge="AI"
                  showTimeRange
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  refreshable
                  exportable
                  showLegend
                  legend={[
                    { id: 'actual', label: 'Historical Demand', color: '#8B5CF6' },
                    { id: 'forecast', label: 'Forecasted Demand', color: '#06B6D4' },
                    { id: 'confidence', label: 'Confidence Range', color: '#84CC16' }
                  ]}
                >
                  <MockChart color="#8B5CF6">
                    <Typography variant="h6" color="brand">
                      Demand Forecast Chart
                    </Typography>
                  </MockChart>
                </ChartContainer>
              </GridItem>
              <GridItem>
                <ChartContainer
                  title="Seasonal Trends"
                  description="Seasonal demand patterns"
                  type="bar"
                  refreshable
                  exportable
                >
                  <MockChart color="#F59E0B">
                    <Typography variant="h6" color="warning">
                      Seasonal Trends Chart
                    </Typography>
                  </MockChart>
                </ChartContainer>
              </GridItem>
            </DashboardGrid>
          </TabContent>
        );

      case 'transactions':
        return (
          <TabContent
            key="transactions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DataTable
              title="Transaction History"
              description="All stock movements and transactions"
              data={transactions}
              columns={transactionColumns}
              loading={loading}
              searchable
              searchPlaceholder="Search transactions..."
              pagination
              pageSize={10}
              emptyStateTitle="No transactions found"
              emptyStateDescription="No stock movements recorded for this product."
            />
          </TabContent>
        );

      case 'alerts':
        return (
          <TabContent
            key="alerts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AlertCard
                severity="error"
                title="Critical Stock Level"
                description="This product is below minimum stock level and needs immediate restocking."
                category="Inventory"
                timestamp={new Date(Date.now() - 10 * 60 * 1000)}
                dismissible
              />
              <AlertCard
                severity="warning"
                title="Reorder Point Reached"
                description="Stock level has reached the reorder point. Consider placing a new order."
                category="Reorder"
                timestamp={new Date(Date.now() - 2 * 60 * 60 * 1000)}
                dismissible
              />
            </div>
          </TabContent>
        );

      default:
        return null;
    }
  };

  return (
    <ProductDetailContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <ProductHeader>
        <ProductImage>
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <Icon name="products" size={64} color="#9CA3AF" />
          )}
        </ProductImage>

        <ProductInfo>
          <ProductTitleRow>
            <ProductTitle>
              <Typography variant="h3" weight="bold" color="primary">
                {product.name}
              </Typography>
              <Typography variant="body1" color="secondary" style={{ marginTop: '8px' }}>
                {product.description}
              </Typography>
            </ProductTitle>

            <ProductActions>
              <Button variant="secondary" size="sm" onClick={handleEdit}>
                <Icon name="edit" size={16} />
                Edit
              </Button>
              <Button variant="primary" size="sm" onClick={handleReorder}>
                <Icon name="plus" size={16} />
                Reorder
              </Button>
            </ProductActions>
          </ProductTitleRow>

          <ProductMeta>
            <MetaItem>
              <Typography variant="caption" color="tertiary" weight="medium">
                SKU
              </Typography>
              <Typography variant="body2" weight="medium">
                {product.sku}
              </Typography>
            </MetaItem>
            <MetaItem>
              <Typography variant="caption" color="tertiary" weight="medium">
                Category
              </Typography>
              <Typography variant="body2">
                {product.category}
              </Typography>
            </MetaItem>
            <MetaItem>
              <Typography variant="caption" color="tertiary" weight="medium">
                Supplier
              </Typography>
              <Typography variant="body2">
                {product.supplier}
              </Typography>
            </MetaItem>
            <MetaItem>
              <Typography variant="caption" color="tertiary" weight="medium">
                Price
              </Typography>
              <Typography variant="body2" weight="medium">
                {formatPrice(product.price)}
              </Typography>
            </MetaItem>
            <MetaItem>
              <Typography variant="caption" color="tertiary" weight="medium">
                Location
              </Typography>
              <Typography variant="body2">
                {product.location}
              </Typography>
            </MetaItem>
            <MetaItem>
              <Typography variant="caption" color="tertiary" weight="medium">
                Status
              </Typography>
              <Badge variant={product.status === 'active' ? 'success' : 'secondary'} size="sm">
                {product.status}
              </Badge>
            </MetaItem>
          </ProductMeta>
        </ProductInfo>
      </ProductHeader>

      <StockStatus level={stockInfo.level}>
        <StatusDot level={stockInfo.level} />
        <div style={{ flex: 1 }}>
          <Typography variant="subtitle2" weight="medium">
            Stock Status: {stockInfo.label}
          </Typography>
          <Typography variant="body2" color="secondary">
            {stockInfo.message} • Current: {product.currentStock} units
          </Typography>
        </div>
        <Button variant="ghost" size="sm" onClick={handleAdjustStock}>
          <Icon name="edit" size={16} />
          Adjust Stock
        </Button>
      </StockStatus>

      <TabNavigation>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </TabButton>
        ))}
      </TabNavigation>

      {renderTabContent()}
    </ProductDetailContainer>
  );
};

export default ProductDetail;