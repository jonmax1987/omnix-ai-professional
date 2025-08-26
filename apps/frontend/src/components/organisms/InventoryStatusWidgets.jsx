import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import Button from '../atoms/Button';
import MetricCard from '../molecules/MetricCard';
import { useRealtimeInventory } from '../../hooks/useWebSocket';

// Real-time data pulse animation
const dataPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
`;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
`;

const WidgetsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[6]};
  width: 100%;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[4]};
  }
`;

const Widget = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.sm};
  position: relative;
  overflow: hidden;
  
  ${props => props.variant === 'critical' && css`
    border-color: ${props.theme.colors.red[300]};
    background: linear-gradient(135deg, 
      ${props.theme.colors.background.elevated} 0%,
      ${props.theme.colors.red[25]} 100%
    );
  `}
  
  ${props => props.variant === 'warning' && css`
    border-color: ${props.theme.colors.yellow[300]};
    background: linear-gradient(135deg, 
      ${props.theme.colors.background.elevated} 0%,
      ${props.theme.colors.yellow[25]} 100%
    );
  `}
  
  ${props => props.variant === 'success' && css`
    border-color: ${props.theme.colors.green[300]};
    background: linear-gradient(135deg, 
      ${props.theme.colors.background.elevated} 0%,
      ${props.theme.colors.green[25]} 100%
    );
  `}
  
  ${props => props.realtime && css`
    animation: ${dataPulse} 3s ease-in-out infinite;
  `}
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const WidgetTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const WidgetIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getIconBackground(props.variant, props.theme)};
  color: ${props => getIconColor(props.variant, props.theme)};
`;

const LiveIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  color: ${props => props.isLive ? props.theme.colors.green[600] : props.theme.colors.gray[400]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  ${props => props.isLive && css`
    animation: ${pulse} 2s infinite;
  `}
`;

const LiveDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isLive ? props.theme.colors.green[500] : props.theme.colors.gray[400]};
`;

const WidgetContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const MetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const MetricLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
`;

const MetricValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => {
    if (props.trend === 'up') return props.theme.colors.green[600];
    if (props.trend === 'down') return props.theme.colors.red[600];
    return props.theme.colors.gray[500];
  }};
`;

const ItemsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const ItemRow = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  
  ${props => props.urgent && css`
    border-color: ${props.theme.colors.red[300]};
    background: ${props.theme.colors.red[25]};
  `}
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const QuickActionButton = styled(Button)`
  padding: ${props => props.theme.spacing[1]};
  min-width: auto;
  width: 32px;
  height: 32px;
`;

const StockChart = styled.div`
  height: 120px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]};
  gap: ${props => props.theme.spacing[1]};
  position: relative;
`;

const StockBar = styled(motion.div)`
  background: ${props => getStockBarColor(props.level, props.theme)};
  border-radius: 2px 2px 0 0;
  min-width: 8px;
  position: relative;
  
  &:hover::after {
    content: '${props => props.value}%';
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    background: ${props => props.theme.colors.gray[800]};
    color: ${props => props.theme.colors.text.inverse};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
`;

const AlertBanner = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.red[500]};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const getIconBackground = (variant, theme) => {
  switch (variant) {
    case 'critical': return theme.colors.red[100];
    case 'warning': return theme.colors.yellow[100];
    case 'success': return theme.colors.green[100];
    default: return theme.colors.primary[100];
  }
};

const getIconColor = (variant, theme) => {
  switch (variant) {
    case 'critical': return theme.colors.red[600];
    case 'warning': return theme.colors.yellow[600];
    case 'success': return theme.colors.green[600];
    default: return theme.colors.primary[600];
  }
};

const getStockBarColor = (level, theme) => {
  if (level < 20) return theme.colors.red[500];
  if (level < 50) return theme.colors.yellow[500];
  return theme.colors.green[500];
};

const InventoryStatusWidgets = ({
  showRealTimeIndicator = true,
  enableAlerts = true,
  className,
  ...props
}) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  // Use real-time inventory data
  const { inventoryData, loading, lastUpdate, isConnected } = useRealtimeInventory({
    interval: refreshInterval,
    includeAlerts: enableAlerts
  });

  // Mock data for demonstration - replace with real data
  const mockInventoryData = {
    summary: {
      totalItems: 1247,
      lowStockItems: 23,
      outOfStockItems: 7,
      criticalItems: 5,
      totalValue: 234567,
      lastUpdated: new Date().toISOString()
    },
    lowStockItems: [
      { id: 1, name: 'Organic Apples', currentStock: 12, minStock: 50, category: 'Produce', urgent: true },
      { id: 2, name: 'Whole Wheat Bread', currentStock: 8, minStock: 25, category: 'Bakery', urgent: true },
      { id: 3, name: 'Greek Yogurt', currentStock: 15, minStock: 40, category: 'Dairy', urgent: false },
      { id: 4, name: 'Coffee Beans', currentStock: 6, minStock: 20, category: 'Beverages', urgent: true }
    ],
    stockLevels: [
      { category: 'Produce', level: 85 },
      { category: 'Dairy', level: 92 },
      { category: 'Meat', level: 67 },
      { category: 'Bakery', level: 34 },
      { category: 'Beverages', level: 78 },
      { category: 'Frozen', level: 56 },
      { category: 'Canned', level: 89 },
      { category: 'Snacks', level: 45 }
    ],
    trends: {
      stockTurnover: { value: 23.5, change: 5.2, trend: 'up' },
      averageStockDays: { value: 15.2, change: -2.1, trend: 'down' },
      reorderFrequency: { value: 12, change: 1, trend: 'up' }
    }
  };

  const currentData = inventoryData || mockInventoryData;
  const criticalAlerts = currentData.lowStockItems?.filter(item => item.urgent) || [];

  const handleQuickReorder = (item) => {
    console.log('Quick reorder:', item);
    // Implement quick reorder functionality
  };

  const handleViewDetails = (item) => {
    console.log('View details:', item);
    // Navigate to item details page
  };

  const formatLastUpdate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <WidgetsContainer className={className} {...props}>
      {/* Stock Overview Widget */}
      <Widget
        variant={criticalAlerts.length > 3 ? 'critical' : criticalAlerts.length > 0 ? 'warning' : 'success'}
        realtime={isConnected}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {criticalAlerts.length > 3 && (
          <AlertBanner
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Icon name="alert-triangle" size={16} />
            Critical Stock Alert: {criticalAlerts.length} items need immediate attention
          </AlertBanner>
        )}
        
        <WidgetHeader>
          <WidgetTitle>
            <WidgetIcon variant={criticalAlerts.length > 3 ? 'critical' : 'success'}>
              <Icon name="package" size={20} />
            </WidgetIcon>
            <div>
              <Typography variant="h6" weight="semibold">
                Inventory Overview
              </Typography>
              <Typography variant="caption" color="secondary">
                Real-time stock status
              </Typography>
            </div>
          </WidgetTitle>
          
          {showRealTimeIndicator && (
            <LiveIndicator isLive={isConnected}>
              <LiveDot isLive={isConnected} />
              {isConnected ? 'Live' : 'Offline'}
            </LiveIndicator>
          )}
        </WidgetHeader>

        <WidgetContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <MetricCard
              title="Total Items"
              value={currentData.summary?.totalItems || 0}
              icon="package"
              iconColor="primary"
              size="sm"
            />
            <MetricCard
              title="Stock Value"
              value={currentData.summary?.totalValue || 0}
              valueFormat="currency"
              icon="dollarSign"
              iconColor="success"
              size="sm"
            />
            <MetricCard
              title="Low Stock"
              value={currentData.summary?.lowStockItems || 0}
              icon="trendingDown"
              iconColor="warning"
              variant={currentData.summary?.lowStockItems > 20 ? 'warning' : 'default'}
              size="sm"
            />
            <MetricCard
              title="Out of Stock"
              value={currentData.summary?.outOfStockItems || 0}
              icon="xCircle"
              iconColor="error"
              variant={currentData.summary?.outOfStockItems > 5 ? 'error' : 'default'}
              size="sm"
            />
          </div>

          <div>
            <Typography variant="subtitle2" weight="medium" style={{ marginBottom: '12px' }}>
              Key Metrics
            </Typography>
            
            <MetricRow>
              <MetricLabel>
                <Icon name="rotateCcw" size={16} color="#6B7280" />
                <Typography variant="body2">Stock Turnover Rate</Typography>
              </MetricLabel>
              <MetricValue>
                <Typography variant="body2" weight="semibold">
                  {currentData.trends?.stockTurnover?.value || 0}%
                </Typography>
                <TrendIndicator trend={currentData.trends?.stockTurnover?.trend}>
                  <Icon 
                    name={currentData.trends?.stockTurnover?.trend === 'up' ? 'trendingUp' : 'trendingDown'} 
                    size={14} 
                  />
                  {Math.abs(currentData.trends?.stockTurnover?.change || 0)}%
                </TrendIndicator>
              </MetricValue>
            </MetricRow>

            <MetricRow>
              <MetricLabel>
                <Icon name="clock" size={16} color="#6B7280" />
                <Typography variant="body2">Avg. Stock Days</Typography>
              </MetricLabel>
              <MetricValue>
                <Typography variant="body2" weight="semibold">
                  {currentData.trends?.averageStockDays?.value || 0} days
                </Typography>
                <TrendIndicator trend={currentData.trends?.averageStockDays?.trend}>
                  <Icon 
                    name={currentData.trends?.averageStockDays?.trend === 'up' ? 'trendingUp' : 'trendingDown'} 
                    size={14} 
                  />
                  {Math.abs(currentData.trends?.averageStockDays?.change || 0)}%
                </TrendIndicator>
              </MetricValue>
            </MetricRow>
          </div>

          <Typography variant="caption" color="tertiary" style={{ textAlign: 'center' }}>
            Last updated: {formatLastUpdate(currentData.summary?.lastUpdated || Date.now())}
          </Typography>
        </WidgetContent>
      </Widget>

      {/* Low Stock Items Widget */}
      <Widget
        variant={criticalAlerts.length > 0 ? 'warning' : 'default'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WidgetHeader>
          <WidgetTitle>
            <WidgetIcon variant="warning">
              <Icon name="alert-triangle" size={20} />
            </WidgetIcon>
            <div>
              <Typography variant="h6" weight="semibold">
                Low Stock Items
              </Typography>
              <Typography variant="caption" color="secondary">
                Requires immediate attention
              </Typography>
            </div>
          </WidgetTitle>
          
          <Badge variant="warning">
            {currentData.lowStockItems?.length || 0} items
          </Badge>
        </WidgetHeader>

        <WidgetContent>
          <ItemsList>
            <AnimatePresence>
              {currentData.lowStockItems?.map((item, index) => (
                <ItemRow
                  key={item.id}
                  urgent={item.urgent}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ItemInfo>
                    <Typography variant="body2" weight="medium">
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {item.category} • {item.currentStock} / {item.minStock} units
                    </Typography>
                    
                    <Progress
                      value={item.currentStock}
                      max={item.minStock}
                      variant={item.urgent ? 'error' : 'warning'}
                      size="sm"
                      showValue={false}
                      style={{ marginTop: '8px' }}
                    />
                  </ItemInfo>
                  
                  <ItemActions>
                    <QuickActionButton
                      variant="ghost"
                      onClick={() => handleViewDetails(item)}
                      title="View details"
                    >
                      <Icon name="eye" size={14} />
                    </QuickActionButton>
                    <QuickActionButton
                      variant="primary"
                      onClick={() => handleQuickReorder(item)}
                      title="Quick reorder"
                    >
                      <Icon name="shopping-cart" size={14} />
                    </QuickActionButton>
                  </ItemActions>
                </ItemRow>
              ))}
            </AnimatePresence>
          </ItemsList>
        </WidgetContent>
      </Widget>

      {/* Category Stock Levels Widget */}
      <Widget
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <WidgetHeader>
          <WidgetTitle>
            <WidgetIcon>
              <Icon name="barChart3" size={20} />
            </WidgetIcon>
            <div>
              <Typography variant="h6" weight="semibold">
                Category Stock Levels
              </Typography>
              <Typography variant="caption" color="secondary">
                Stock distribution by category
              </Typography>
            </div>
          </WidgetTitle>
        </WidgetHeader>

        <WidgetContent>
          <StockChart>
            {currentData.stockLevels?.map((category, index) => (
              <StockBar
                key={category.category}
                level={category.level}
                value={category.level}
                initial={{ height: 0 }}
                animate={{ height: `${category.level}%` }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </StockChart>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '16px' }}>
            {currentData.stockLevels?.map(category => (
              <div key={category.category} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '2px',
                    background: getStockBarColor(category.level, props.theme || { colors: { red: { 500: '#ef4444' }, yellow: { 500: '#eab308' }, green: { 500: '#22c55e' } } })
                  }} 
                />
                <Typography variant="caption" style={{ flex: 1 }}>
                  {category.category}
                </Typography>
                <Typography variant="caption" weight="medium">
                  {category.level}%
                </Typography>
              </div>
            ))}
          </div>
        </WidgetContent>
      </Widget>
    </WidgetsContainer>
  );
};

export default InventoryStatusWidgets;