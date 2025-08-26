import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

const SuggestionsContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary || '#f8fafc'};
  border-radius: ${props => props.theme.borderRadius.xl || '12px'};
  padding: ${props => props.theme.spacing[6] || '24px'};
  border: 1px solid ${props => props.theme.colors.border.light || '#e2e8f0'};
  box-shadow: ${props => props.theme.shadows.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
`;

const SuggestionsHeader = styled.div`
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

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3] || '12px'};
`;

const AIBadge = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1] || '4px'};
  padding: ${props => props.theme.spacing[1] || '4px'} ${props => props.theme.spacing[2] || '8px'};
  background: linear-gradient(135deg, 
    ${props => props.theme?.colors?.primary?.[100] || '#eff6ff'}, 
    ${props => props.theme?.colors?.secondary?.[100] || '#f0f9ff'});
  border: 1px solid ${props => props.theme?.colors?.primary?.[200] || '#bfdbfe'};
  border-radius: ${props => props.theme?.borderRadius?.full || '9999px'};
  color: ${props => props.theme?.colors?.primary?.[700] || '#1d4ed8'};
  font-size: ${props => props.theme.typography.fontSize.xs || '12px'};
  font-weight: ${props => props.theme.typography.fontWeight.medium || '500'};
`;

const ActionsBar = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2] || '8px'};
  align-items: center;
`;

const SummaryMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing[4] || '16px'};
  margin-bottom: ${props => props.theme.spacing[6] || '24px'};
  padding: ${props => props.theme.spacing[4] || '16px'};
  background: ${props => props.theme.colors.background.primary || '#ffffff'};
  border-radius: ${props => props.theme.borderRadius.lg || '8px'};
  border: 1px solid ${props => props.theme.colors.border.light || '#e2e8f0'};
`;

const MetricItem = styled(motion.div)`
  text-align: center;
  
  @media (max-width: ${props => props.theme.breakpoints.sm || '640px'}) {
    text-align: left;
  }
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'color'
})`
  font-size: ${props => props.theme?.typography?.fontSize?.['2xl'] || '24px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || '700'};
  color: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.color) {
      case 'primary': return colors.primary?.[600] || '#2563eb';
      case 'success': return colors.success?.[600] || '#16a34a';
      case 'warning': return colors.warning?.[600] || '#d97706';
      case 'danger': return colors.danger?.[600] || '#dc2626';
      default: return colors.text?.primary || '#111827';
    }
  }};
  margin-bottom: ${props => props.theme?.spacing?.[1] || '4px'};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm || '14px'};
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-weight: ${props => props.theme.typography.fontWeight.medium || '500'};
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3] || '12px'};
  max-height: 600px;
  overflow-y: auto;
`;

const SuggestionCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['priority', 'selected'].includes(prop)
})`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing[4] || '16px'};
  background: ${props => props.selected ? 
    (props.theme?.colors?.primary?.[50] || '#eff6ff') : 
    (props.theme?.colors?.background?.primary || '#ffffff')};
  border: 1px solid ${props => {
    const colors = props.theme?.colors || {};
    if (props.selected) return colors.primary?.[200] || '#bfdbfe';
    switch (props.priority) {
      case 'critical': return colors.danger?.[200] || '#fecaca';
      case 'high': return colors.warning?.[200] || '#fed7aa';
      case 'medium': return colors.blue?.[200] || '#bfdbfe';
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

const PriorityIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'priority'
})`
  width: 4px;
  height: 60px;
  border-radius: ${props => props.theme.borderRadius.full || '9999px'};
  background: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.priority) {
      case 'critical': return colors.danger?.[500] || '#ef4444';
      case 'high': return colors.warning?.[500] || '#f59e0b';
      case 'medium': return colors.blue?.[500] || '#3b82f6';
      case 'low': return colors.gray?.[400] || '#9ca3af';
      default: return colors.gray?.[300] || '#d1d5db';
    }
  }};
  margin-right: ${props => props.theme.spacing[3] || '12px'};
`;

const SuggestionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4] || '16px'};
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const ProductName = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeight.semibold || '600'};
  color: ${props => props.theme.colors.text.primary || '#111827'};
  margin-bottom: ${props => props.theme.spacing[1] || '4px'};
`;

const ProductDetails = styled(Typography)`
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-size: ${props => props.theme.typography.fontSize.sm || '14px'};
  line-height: 1.4;
`;

const OrderDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing[2] || '8px'};
  min-width: 150px;
`;

const SuggestedQuantity = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2] || '8px'};
`;

const QuantityBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'priority'
})`
  padding: ${props => props.theme.spacing[1] || '4px'} ${props => props.theme.spacing[2] || '8px'};
  border-radius: ${props => props.theme.borderRadius.md || '6px'};
  font-size: ${props => props.theme.typography.fontSize.sm || '14px'};
  font-weight: ${props => props.theme.typography.fontWeight.semibold || '600'};
  background: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.priority) {
      case 'critical': return colors.danger?.[100] || '#fee2e2';
      case 'high': return colors.warning?.[100] || '#fef3c7';
      case 'medium': return colors.blue?.[100] || '#eff6ff';
      default: return colors.gray?.[100] || '#f3f4f6';
    }
  }};
  color: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.priority) {
      case 'critical': return colors.danger?.[700] || '#b91c1c';
      case 'high': return colors.warning?.[700] || '#a16207';
      case 'medium': return colors.blue?.[700] || '#1d4ed8';
      default: return colors.gray?.[700] || '#374151';
    }
  }};
`;

const EstimatedCost = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm || '14px'};
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-weight: ${props => props.theme.typography.fontWeight.medium || '500'};
`;

const AIInsights = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1] || '4px'};
  min-width: 120px;
`;

const ConfidenceScore = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1] || '4px'};
  font-size: ${props => props.theme.typography.fontSize.xs || '12px'};
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

const ReasonChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[1] || '4px'};
  max-width: 120px;
`;

const ReasonChip = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'type'
})`
  padding: 2px ${props => props.theme.spacing[1] || '4px'};
  border-radius: ${props => props.theme.borderRadius.sm || '4px'};
  font-size: 10px;
  font-weight: ${props => props.theme.typography.fontWeight.medium || '500'};
  background: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.type) {
      case 'stock': return colors.danger?.[100] || '#fee2e2';
      case 'demand': return colors.blue?.[100] || '#eff6ff';
      case 'seasonal': return colors.purple?.[100] || '#f3e8ff';
      case 'trend': return colors.green?.[100] || '#dcfce7';
      default: return colors.gray?.[100] || '#f3f4f6';
    }
  }};
  color: ${props => {
    const colors = props.theme?.colors || {};
    switch (props.type) {
      case 'stock': return colors.danger?.[700] || '#b91c1c';
      case 'demand': return colors.blue?.[700] || '#1d4ed8';
      case 'seasonal': return colors.purple?.[700] || '#7c3aed';
      case 'trend': return colors.green?.[700] || '#15803d';
      default: return colors.gray?.[700] || '#374151';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1] || '4px'};
  min-width: 120px;
`;

const QuickActionButton = styled(Button).withConfig({
  shouldForwardProp: (prop) => prop !== 'variant'
})`
  font-size: ${props => props.theme.typography.fontSize.xs || '12px'};
  padding: ${props => props.theme.spacing[1] || '4px'} ${props => props.theme.spacing[2] || '8px'};
  height: auto;
  min-height: 28px;
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

const FilterTabs = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing[4] || '16px'};
  border-bottom: 1px solid ${props => props.theme.colors.border.light || '#e2e8f0'};
`;

const FilterTab = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme?.spacing?.[2] || '8px'} ${props => props.theme?.spacing?.[4] || '16px'};
  border: none;
  background: transparent;
  color: ${props => props.active ? 
    (props.theme?.colors?.primary?.[600] || '#2563eb') : 
    (props.theme?.colors?.text?.secondary || '#6b7280')};
  font-weight: ${props => props.active ? 
    (props.theme?.typography?.fontWeight?.semibold || '600') : 
    (props.theme?.typography?.fontWeight?.medium || '500')};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    color: ${props => props.theme?.colors?.primary?.[600] || '#2563eb'};
  }
  
  ${props => props.active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: ${props.theme?.colors?.primary?.[600] || '#2563eb'};
    }
  `}
`;

const AutomatedOrderSuggestions = ({ 
  data = [], 
  onOrderCreate = () => {},
  onBulkOrder = () => {},
  onIgnoreSuggestion = () => {},
  refreshInterval = 300000, // 5 minutes
  className = '' 
}) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isGeneratingOrders, setIsGeneratingOrders] = useState(false);

  // Mock data if none provided
  const mockData = useMemo(() => [
    {
      id: 'suggestion-1',
      productId: 'product-1',
      productName: 'Premium Coffee Beans',
      category: 'Beverages',
      currentStock: 45,
      suggestedQuantity: 150,
      estimatedCost: 750,
      priority: 'critical',
      aiConfidence: 94,
      supplier: 'Coffee Masters Inc.',
      leadTime: 3,
      reasons: [
        { type: 'stock', label: 'Low Stock' },
        { type: 'demand', label: 'High Demand' },
        { type: 'trend', label: 'Growing Trend' }
      ],
      insights: {
        demandForecast: '+15% next week',
        stockoutRisk: 'High (2 days)',
        profitImpact: '+$1,200/month'
      }
    },
    {
      id: 'suggestion-2',
      productId: 'product-2',
      productName: 'Organic Milk 1L',
      category: 'Dairy',
      currentStock: 28,
      suggestedQuantity: 200,
      estimatedCost: 400,
      priority: 'high',
      aiConfidence: 89,
      supplier: 'Fresh Dairy Co.',
      leadTime: 1,
      reasons: [
        { type: 'stock', label: 'Critical' },
        { type: 'seasonal', label: 'Peak Season' }
      ],
      insights: {
        demandForecast: '+8% next week',
        stockoutRisk: 'Medium (4 days)',
        profitImpact: '+$600/month'
      }
    },
    {
      id: 'suggestion-3',
      productId: 'product-3',
      productName: 'Wireless Headphones',
      category: 'Electronics',
      currentStock: 156,
      suggestedQuantity: 75,
      estimatedCost: 2250,
      priority: 'medium',
      aiConfidence: 78,
      supplier: 'Tech Supplies Ltd.',
      leadTime: 5,
      reasons: [
        { type: 'trend', label: 'Uptrend' },
        { type: 'seasonal', label: 'Holiday Season' }
      ],
      insights: {
        demandForecast: '+12% holiday',
        stockoutRisk: 'Low (15 days)',
        profitImpact: '+$800/month'
      }
    },
    {
      id: 'suggestion-4',
      productId: 'product-4',
      productName: 'Fresh Bread Loaves',
      category: 'Bakery',
      currentStock: 12,
      suggestedQuantity: 120,
      estimatedCost: 180,
      priority: 'critical',
      aiConfidence: 96,
      supplier: 'Local Bakery',
      leadTime: 0.5,
      reasons: [
        { type: 'stock', label: 'Critical' },
        { type: 'demand', label: 'Daily Peak' }
      ],
      insights: {
        demandForecast: 'Stable daily',
        stockoutRisk: 'Critical (8 hours)',
        profitImpact: '+$300/day'
      }
    },
    {
      id: 'suggestion-5',
      productId: 'product-5',
      productName: 'Protein Bars',
      category: 'Health Food',
      currentStock: 89,
      suggestedQuantity: 100,
      estimatedCost: 300,
      priority: 'medium',
      aiConfidence: 82,
      supplier: 'Nutrition Plus',
      leadTime: 7,
      reasons: [
        { type: 'trend', label: 'Health Trend' },
        { type: 'demand', label: 'Growing' }
      ],
      insights: {
        demandForecast: '+5% monthly',
        stockoutRisk: 'Low (21 days)',
        profitImpact: '+$400/month'
      }
    }
  ], []);

  const processedData = data.length > 0 ? data : mockData;

  // Filter suggestions based on active filter
  const filteredSuggestions = useMemo(() => {
    return processedData.filter(suggestion => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'critical') return suggestion.priority === 'critical';
      if (activeFilter === 'high') return suggestion.priority === 'high';
      if (activeFilter === 'medium') return suggestion.priority === 'medium';
      return true;
    });
  }, [processedData, activeFilter]);

  // Sort by priority and confidence
  const sortedSuggestions = useMemo(() => {
    return [...filteredSuggestions].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.aiConfidence - a.aiConfidence;
    });
  }, [filteredSuggestions]);

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const total = processedData.length;
    const critical = processedData.filter(s => s.priority === 'critical').length;
    const totalCost = processedData.reduce((sum, s) => sum + s.estimatedCost, 0);
    const avgConfidence = processedData.reduce((sum, s) => sum + s.aiConfidence, 0) / total;

    return {
      totalSuggestions: total,
      criticalSuggestions: critical,
      totalEstimatedCost: totalCost,
      avgConfidence: Math.round(avgConfidence)
    };
  }, [processedData]);

  const handleSuggestionSelect = (suggestionId) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
      }
      return newSet;
    });
  };

  const handleCreateOrder = (suggestion) => {
    setIsGeneratingOrders(true);
    // Simulate API call
    setTimeout(() => {
      onOrderCreate(suggestion);
      setIsGeneratingOrders(false);
    }, 1000);
  };

  const handleBulkCreateOrders = () => {
    if (selectedSuggestions.size === 0) return;
    
    setIsGeneratingOrders(true);
    const selectedSuggestionData = processedData.filter(s => selectedSuggestions.has(s.id));
    
    // Simulate API call
    setTimeout(() => {
      onBulkOrder(selectedSuggestionData);
      setSelectedSuggestions(new Set());
      setIsGeneratingOrders(false);
    }, 2000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const filterTabs = [
    { key: 'all', label: 'All Suggestions', count: processedData.length },
    { key: 'critical', label: 'Critical', count: processedData.filter(s => s.priority === 'critical').length },
    { key: 'high', label: 'High Priority', count: processedData.filter(s => s.priority === 'high').length },
    { key: 'medium', label: 'Medium', count: processedData.filter(s => s.priority === 'medium').length }
  ];

  return (
    <SuggestionsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <SuggestionsHeader>
        <div>
          <HeaderInfo>
            <Typography variant="h3" weight="bold">
              AI Order Suggestions
            </Typography>
            <AIBadge
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Icon name="brain" size={14} />
              Claude AI
            </AIBadge>
          </HeaderInfo>
          <Typography variant="body2" color="secondary" style={{ marginTop: '4px' }}>
            Intelligent recommendations based on stock levels, demand patterns, and AI predictions
          </Typography>
        </div>
        
        <ActionsBar>
          <Typography variant="caption" color="tertiary">
            Updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          
          {selectedSuggestions.size > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleBulkCreateOrders}
              loading={isGeneratingOrders}
            >
              <Icon name="shopping-cart" size={14} />
              Create {selectedSuggestions.size} Orders
            </Button>
          )}
        </ActionsBar>
      </SuggestionsHeader>

      <SummaryMetrics>
        <MetricItem
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricValue color="primary">{summaryMetrics.totalSuggestions}</MetricValue>
          <MetricLabel>Total Suggestions</MetricLabel>
        </MetricItem>
        
        <MetricItem
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricValue color="danger">{summaryMetrics.criticalSuggestions}</MetricValue>
          <MetricLabel>Critical Priority</MetricLabel>
        </MetricItem>
        
        <MetricItem
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MetricValue color="success">{formatCurrency(summaryMetrics.totalEstimatedCost)}</MetricValue>
          <MetricLabel>Estimated Cost</MetricLabel>
        </MetricItem>
        
        <MetricItem
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MetricValue color="primary">{summaryMetrics.avgConfidence}%</MetricValue>
          <MetricLabel>Avg AI Confidence</MetricLabel>
        </MetricItem>
      </SummaryMetrics>

      <FilterTabs>
        {filterTabs.map(tab => (
          <FilterTab
            key={tab.key}
            active={activeFilter === tab.key}
            onClick={() => setActiveFilter(tab.key)}
            whileTap={{ scale: 0.98 }}
          >
            {tab.label} ({tab.count})
          </FilterTab>
        ))}
      </FilterTabs>

      <SuggestionsList>
        <AnimatePresence>
          {sortedSuggestions.length === 0 ? (
            <EmptyState
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon name="package" size={48} color="currentColor" />
              <Typography variant="h4" style={{ marginTop: '16px' }}>
                No suggestions available
              </Typography>
              <Typography variant="body2" color="secondary" style={{ marginTop: '8px' }}>
                All inventory levels are optimal or no data available
              </Typography>
            </EmptyState>
          ) : (
            sortedSuggestions.map((suggestion, index) => (
              <SuggestionCard
                key={suggestion.id}
                priority={suggestion.priority}
                selected={selectedSuggestions.has(suggestion.id)}
                onClick={() => handleSuggestionSelect(suggestion.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <PriorityIndicator priority={suggestion.priority} />
                
                <SuggestionContent>
                  <ProductInfo>
                    <ProductName variant="body1">
                      {suggestion.productName}
                    </ProductName>
                    <ProductDetails variant="caption">
                      {suggestion.category} • Current: {suggestion.currentStock} units • 
                      Supplier: {suggestion.supplier} • Lead time: {suggestion.leadTime} days
                    </ProductDetails>
                  </ProductInfo>
                  
                  <OrderDetails>
                    <SuggestedQuantity>
                      <Icon name="package" size={14} />
                      <QuantityBadge priority={suggestion.priority}>
                        {suggestion.suggestedQuantity} units
                      </QuantityBadge>
                    </SuggestedQuantity>
                    <EstimatedCost>
                      {formatCurrency(suggestion.estimatedCost)}
                    </EstimatedCost>
                  </OrderDetails>
                  
                  <AIInsights>
                    <ConfidenceScore>
                      <Icon name="brain" size={12} />
                      <ConfidenceBar confidence={suggestion.aiConfidence} />
                      <span>{suggestion.aiConfidence}%</span>
                    </ConfidenceScore>
                    
                    <ReasonChips>
                      {suggestion.reasons.map((reason, idx) => (
                        <ReasonChip key={idx} type={reason.type}>
                          {reason.label}
                        </ReasonChip>
                      ))}
                    </ReasonChips>
                  </AIInsights>
                  
                  <ActionButtons>
                    <QuickActionButton
                      variant="primary"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateOrder(suggestion);
                      }}
                      loading={isGeneratingOrders}
                    >
                      Create Order
                    </QuickActionButton>
                    
                    <QuickActionButton
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onIgnoreSuggestion(suggestion);
                      }}
                    >
                      Ignore
                    </QuickActionButton>
                  </ActionButtons>
                </SuggestionContent>
              </SuggestionCard>
            ))
          )}
        </AnimatePresence>
      </SuggestionsList>
    </SuggestionsContainer>
  );
};

export default AutomatedOrderSuggestions;