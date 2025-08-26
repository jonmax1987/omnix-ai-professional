import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

const TimelineContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary || '#f8fafc'};
  border-radius: ${props => props.theme.borderRadius.xl || '12px'};
  padding: ${props => props.theme.spacing[6] || '24px'};
  border: 1px solid ${props => props.theme.colors.border.light || '#e2e8f0'};
  box-shadow: ${props => props.theme.shadows.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
`;

const TimelineHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[6] || '24px'};
  
  @media (max-width: ${props => props.theme.breakpoints.md || '768px'}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[4] || '16px'};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background.primary || '#ffffff'};
  border-radius: ${props => props.theme.borderRadius.lg || '8px'};
  border: 1px solid ${props => props.theme.colors.border.light || '#e2e8f0'};
  overflow: hidden;
`;

const ViewToggleButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[2] || '8px'} ${props => props.theme.spacing[3] || '12px'};
  border: none;
  background: ${props => props.active ? 
    (props.theme.colors.primary[500] || '#3b82f6') : 
    'transparent'};
  color: ${props => props.active ? 
    (props.theme.colors.white || '#ffffff') : 
    (props.theme.colors.text.secondary || '#6b7280')};
  font-size: ${props => props.theme.typography.fontSize.sm || '14px'};
  font-weight: ${props => props.theme.typography.fontWeight.medium || '500'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1] || '4px'};
  
  &:hover {
    background: ${props => props.active ? 
      (props.theme.colors.primary[600] || '#2563eb') : 
      (props.theme.colors.background.secondary || '#f8fafc')};
  }
`;

const TimelineGrid = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4] || '16px'};
`;

const TimelineAxis = styled.div`
  position: relative;
  height: 40px;
  background: linear-gradient(90deg, 
    ${props => props.theme.colors?.success?.[100] || '#dcfce7'} 0%, 
    ${props => props.theme.colors?.warning?.[100] || '#fef3c7'} 50%, 
    ${props => props.theme.colors?.danger?.[100] || '#fee2e2'} 100%);
  border-radius: ${props => props.theme.borderRadius?.md || '6px'};
  border: 1px solid ${props => props.theme.colors?.border?.light || '#e2e8f0'};
  margin-bottom: ${props => props.theme.spacing?.[6] || '24px'};
  overflow: hidden;
`;

const TimelineMarker = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['position', 'urgency'].includes(prop)
})`
  position: absolute;
  top: 50%;
  left: ${props => props.position}%;
  transform: translateY(-50%);
  width: 2px;
  height: 30px;
  background: ${props => {
    const colors = props.theme.colors || {};
    switch (props.urgency) {
      case 'critical': return colors.danger?.[600] || '#dc2626';
      case 'warning': return colors.warning?.[600] || '#d97706';
      case 'normal': return colors.success?.[600] || '#16a34a';
      default: return colors.gray?.[400] || '#9ca3af';
    }
  }};
  
  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: inherit;
  }
`;

const TimelineLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing[2] || '8px'};
  padding: 0 ${props => props.theme.spacing[2] || '8px'};
`;

const TimelineLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs || '12px'};
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-weight: ${props => props.theme.typography.fontWeight.medium || '500'};
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3] || '12px'};
  max-height: 600px;
  overflow-y: auto;
`;

const ProductItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['urgency', 'selected'].includes(prop)
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4] || '16px'};
  background: ${props => props.selected ? 
    (props.theme.colors.primary[50] || '#eff6ff') : 
    (props.theme.colors.background.primary || '#ffffff')};
  border: 1px solid ${props => {
    const colors = props.theme.colors || {};
    if (props.selected) return colors.primary?.[200] || '#bfdbfe';
    switch (props.urgency) {
      case 'critical': return colors.danger?.[200] || '#fecaca';
      case 'warning': return colors.warning?.[200] || '#fed7aa';
      case 'normal': return colors.success?.[200] || '#bbf7d0';
      default: return colors.border?.light || '#e2e8f0';
    }
  }};
  border-radius: ${props => props.theme.borderRadius.lg || '8px'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3] || '12px'};
  flex: 1;
`;

const ProductIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'urgency'
})`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme?.borderRadius?.lg || '8px'};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.urgency) {
      case 'critical': return colors.danger?.[100] || '#fee2e2';
      case 'warning': return colors.warning?.[100] || '#fef3c7';
      case 'normal': return colors.success?.[100] || '#dcfce7';
      default: return colors.gray?.[100] || '#f3f4f6';
    }
  }};
  color: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.urgency) {
      case 'critical': return colors.danger?.[600] || '#dc2626';
      case 'warning': return colors.warning?.[600] || '#d97706';
      case 'normal': return colors.success?.[600] || '#16a34a';
      default: return colors.gray?.[500] || '#6b7280';
    }
  }};
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1] || '4px'};
  flex: 1;
`;

const ProductName = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeight.semibold || '600'};
  color: ${props => props.theme.colors.text.primary || '#111827'};
`;

const ProductSubtitle = styled(Typography)`
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-size: ${props => props.theme.typography.fontSize.sm || '14px'};
`;

const ProductMetrics = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing[2] || '8px'};
  min-width: 120px;
`;

const DaysRemaining = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'urgency'
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[1] || '4px'};
  color: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.urgency) {
      case 'critical': return colors.danger?.[600] || '#dc2626';
      case 'warning': return colors.warning?.[600] || '#d97706';
      case 'normal': return colors.success?.[600] || '#16a34a';
      default: return colors.gray?.[500] || '#6b7280';
    }
  }};
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
`;

const AIConfidence = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1] || '4px'};
`;

const ConfidenceBar = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'confidence'
})`
  width: 40px;
  height: 4px;
  background: ${props => props.theme.colors.gray?.[200] || '#e5e7eb'};
  border-radius: ${props => props.theme.borderRadius.full || '9999px'};
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.confidence}%;
    background: ${props => props.confidence > 80 ? 
      (props.theme.colors.success?.[500] || '#10b981') :
      props.confidence > 60 ? 
      (props.theme.colors.warning?.[500] || '#f59e0b') :
      (props.theme.colors.danger?.[500] || '#ef4444')};
    transition: width 0.3s ease-in-out;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3] || '12px'};
  margin-bottom: ${props => props.theme.spacing[4] || '16px'};
  flex-wrap: wrap;
  
  @media (max-width: ${props => props.theme.breakpoints.md || '768px'}) {
    gap: ${props => props.theme.spacing[2] || '8px'};
  }
`;

const FilterChip = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[1] || '4px'} ${props => props.theme.spacing[3] || '12px'};
  border: 1px solid ${props => props.active ? 
    (props.theme.colors.primary?.[300] || '#93c5fd') : 
    (props.theme.colors.border?.light || '#e2e8f0')};
  background: ${props => props.active ? 
    (props.theme.colors.primary?.[50] || '#eff6ff') : 
    (props.theme.colors.background.primary || '#ffffff')};
  color: ${props => props.active ? 
    (props.theme.colors.primary?.[700] || '#1d4ed8') : 
    (props.theme.colors.text.secondary || '#6b7280')};
  border-radius: ${props => props.theme.borderRadius.full || '9999px'};
  font-size: ${props => props.theme.typography.fontSize.sm || '14px'};
  font-weight: ${props => props.theme.typography.fontWeight.medium || '500'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1] || '4px'};
  
  &:hover {
    background: ${props => props.active ? 
      (props.theme.colors.primary?.[100] || '#dbeafe') : 
      (props.theme.colors.background.secondary || '#f8fafc')};
  }
`;

const EmptyState = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[12] || '48px'} ${props => props.theme.spacing[6] || '24px'};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
`;

const StockDepletionTimeline = ({ 
  data = [], 
  timeRange = 30, 
  onProductSelect = () => {},
  showFilters = true,
  showConfidence = true,
  className = '' 
}) => {
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    urgency: 'all',
    category: 'all',
    confidence: 'all'
  });

  // Mock data if none provided
  const mockData = useMemo(() => [
    {
      id: 'product-1',
      name: 'Premium Coffee Beans',
      category: 'Beverages',
      currentStock: 45,
      dailyConsumption: 5.2,
      predictedOutDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      daysRemaining: 8,
      urgency: 'critical',
      aiConfidence: 94,
      supplier: 'Coffee Masters Inc.',
      leadTime: 3,
      reorderPoint: 50
    },
    {
      id: 'product-2',
      name: 'Organic Milk 1L',
      category: 'Dairy',
      currentStock: 28,
      dailyConsumption: 2.8,
      predictedOutDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      daysRemaining: 11,
      urgency: 'warning',
      aiConfidence: 89,
      supplier: 'Fresh Dairy Co.',
      leadTime: 1,
      reorderPoint: 20
    },
    {
      id: 'product-3',
      name: 'Wireless Headphones',
      category: 'Electronics',
      currentStock: 156,
      dailyConsumption: 3.1,
      predictedOutDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
      daysRemaining: 29,
      urgency: 'normal',
      aiConfidence: 78,
      supplier: 'Tech Supplies Ltd.',
      leadTime: 5,
      reorderPoint: 25
    },
    {
      id: 'product-4',
      name: 'Fresh Bread Loaves',
      category: 'Bakery',
      currentStock: 12,
      dailyConsumption: 18.5,
      predictedOutDate: new Date(Date.now() + 0.8 * 24 * 60 * 60 * 1000),
      daysRemaining: 1,
      urgency: 'critical',
      aiConfidence: 96,
      supplier: 'Local Bakery',
      leadTime: 0.5,
      reorderPoint: 30
    },
    {
      id: 'product-5',
      name: 'Protein Bars',
      category: 'Health Food',
      currentStock: 89,
      dailyConsumption: 4.2,
      predictedOutDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      daysRemaining: 21,
      urgency: 'warning',
      aiConfidence: 82,
      supplier: 'Nutrition Plus',
      leadTime: 7,
      reorderPoint: 40
    }
  ], []);

  const processedData = data.length > 0 ? data : mockData;

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    return processedData.filter(product => {
      if (activeFilters.urgency !== 'all' && product.urgency !== activeFilters.urgency) {
        return false;
      }
      if (activeFilters.category !== 'all' && product.category !== activeFilters.category) {
        return false;
      }
      if (activeFilters.confidence !== 'all') {
        const confidence = product.aiConfidence;
        switch (activeFilters.confidence) {
          case 'high': return confidence >= 80;
          case 'medium': return confidence >= 60 && confidence < 80;
          case 'low': return confidence < 60;
          default: return true;
        }
      }
      return true;
    });
  }, [processedData, activeFilters]);

  // Sort by urgency and days remaining
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const urgencyOrder = { critical: 0, warning: 1, normal: 2 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return a.daysRemaining - b.daysRemaining;
    });
  }, [filteredData]);

  // Get unique categories and urgency levels for filters
  const categories = useMemo(() => {
    return [...new Set(processedData.map(p => p.category))];
  }, [processedData]);

  const urgencyLevels = [
    { key: 'critical', label: 'Critical', color: '#dc2626' },
    { key: 'warning', label: 'Warning', color: '#d97706' },
    { key: 'normal', label: 'Normal', color: '#16a34a' }
  ];

  // Calculate timeline position (0-100%)
  const getTimelinePosition = (daysRemaining) => {
    const maxDays = Math.max(timeRange, Math.max(...processedData.map(p => p.daysRemaining)));
    return Math.max(0, Math.min(100, (daysRemaining / maxDays) * 100));
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product.id === selectedProduct?.id ? null : product);
    onProductSelect(product);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical': return 'alert-triangle';
      case 'warning': return 'alert-circle';
      case 'normal': return 'check-circle';
      default: return 'info';
    }
  };

  return (
    <TimelineContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <TimelineHeader>
        <div>
          <Typography variant="h3" weight="bold">
            Stock Depletion Timeline
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginTop: '4px' }}>
            AI-powered stock predictions for next {timeRange} days
          </Typography>
        </div>
        
        <ViewToggle>
          <ViewToggleButton
            active={viewMode === 'timeline'}
            onClick={() => setViewMode('timeline')}
            whileTap={{ scale: 0.98 }}
          >
            <Icon name="clock" size={16} />
            Timeline
          </ViewToggleButton>
          <ViewToggleButton
            active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            whileTap={{ scale: 0.98 }}
          >
            <Icon name="list" size={16} />
            List
          </ViewToggleButton>
        </ViewToggle>
      </TimelineHeader>

      {showFilters && (
        <FiltersContainer>
          <FilterChip
            active={activeFilters.urgency === 'all'}
            onClick={() => handleFilterChange('urgency', 'all')}
            whileTap={{ scale: 0.98 }}
          >
            All Items ({processedData.length})
          </FilterChip>
          
          {urgencyLevels.map(level => (
            <FilterChip
              key={level.key}
              active={activeFilters.urgency === level.key}
              onClick={() => handleFilterChange('urgency', level.key)}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: level.color
                }}
              />
              {level.label} ({processedData.filter(p => p.urgency === level.key).length})
            </FilterChip>
          ))}
        </FiltersContainer>
      )}

      <AnimatePresence mode="wait">
        {viewMode === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <TimelineAxis>
              {sortedData.map((product, index) => (
                <TimelineMarker
                  key={product.id}
                  position={getTimelinePosition(product.daysRemaining)}
                  urgency={product.urgency}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.2 }}
                  title={`${product.name} - ${product.daysRemaining} days remaining`}
                />
              ))}
            </TimelineAxis>
            
            <TimelineLabels>
              <TimelineLabel>Today</TimelineLabel>
              <TimelineLabel>{Math.floor(timeRange / 4)} days</TimelineLabel>
              <TimelineLabel>{Math.floor(timeRange / 2)} days</TimelineLabel>
              <TimelineLabel>{Math.floor((timeRange * 3) / 4)} days</TimelineLabel>
              <TimelineLabel>{timeRange} days</TimelineLabel>
            </TimelineLabels>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductList>
        <AnimatePresence>
          {sortedData.length === 0 ? (
            <EmptyState
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon name="package" size={48} color="currentColor" />
              <Typography variant="h4" style={{ marginTop: '16px' }}>
                No products match your filters
              </Typography>
              <Typography variant="body2" color="secondary" style={{ marginTop: '8px' }}>
                Try adjusting your filter criteria to see more results
              </Typography>
            </EmptyState>
          ) : (
            sortedData.map((product, index) => (
              <ProductItem
                key={product.id}
                urgency={product.urgency}
                selected={selectedProduct?.id === product.id}
                onClick={() => handleProductClick(product)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <ProductInfo>
                  <ProductIcon urgency={product.urgency}>
                    <Icon name={getUrgencyIcon(product.urgency)} size={20} />
                  </ProductIcon>
                  
                  <ProductDetails>
                    <ProductName variant="body1">
                      {product.name}
                    </ProductName>
                    <ProductSubtitle variant="caption">
                      {product.category} • Stock: {product.currentStock} units • Daily usage: {product.dailyConsumption}
                    </ProductSubtitle>
                  </ProductDetails>
                </ProductInfo>
                
                <ProductMetrics>
                  <DaysRemaining urgency={product.urgency}>
                    <Icon name="clock" size={14} />
                    {product.daysRemaining === 0 ? 'Today' : 
                     product.daysRemaining === 1 ? '1 day' : 
                     `${product.daysRemaining} days`}
                  </DaysRemaining>
                  
                  {showConfidence && (
                    <AIConfidence>
                      <Icon name="brain" size={12} />
                      <ConfidenceBar confidence={product.aiConfidence} />
                      <span style={{ fontSize: '11px', marginLeft: '4px' }}>
                        {product.aiConfidence}%
                      </span>
                    </AIConfidence>
                  )}
                  
                  <Badge 
                    variant={
                      product.urgency === 'critical' ? 'danger' :
                      product.urgency === 'warning' ? 'warning' : 'success'
                    }
                    size="sm"
                  >
                    {product.urgency}
                  </Badge>
                </ProductMetrics>
              </ProductItem>
            ))
          )}
        </AnimatePresence>
      </ProductList>
    </TimelineContainer>
  );
};

export default StockDepletionTimeline;