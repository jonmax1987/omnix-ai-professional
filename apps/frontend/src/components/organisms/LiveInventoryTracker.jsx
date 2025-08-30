/**
 * OMNIX AI - Live Inventory Tracker
 * MGR-025: Instant inventory level changes
 * Real-time inventory level tracking with WebSocket updates
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import mockInventoryChangeGenerator from '../../services/mockInventoryChangeGenerator';
import useDashboardStore from '../../store/dashboardStore';
import useWebSocketStore from '../../store/websocketStore';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';
import { formatNumber, formatRelativeTime, capitalize } from '../../utils/formatters';

const TrackerContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors.gradients.primary};
    opacity: ${({ isConnected }) => (isConnected ? 1 : 0.3)};
    transition: opacity 0.3s ease;
  }
`;

const TrackerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const LiveIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ isLive }) => (isLive ? '#10b98120' : '#ef444420')};
  color: ${({ isLive }) => (isLive ? '#10b981' : '#ef4444')};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const Dot = styled(motion.span)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const StatItem = styled(motion.div)`
  text-align: center;
  
  .label {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 4px;
  }
  
  .value {
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled(Input)`
  max-width: 250px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    max-width: 100%;
  }
`;

const FilterButton = styled(Button)`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  
  ${({ active }) => active && `
    background: var(--colors-primary-main);
    color: white;
  `}
`;

const InventoryList = styled.div`
  max-height: 600px;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing.sm};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.default};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.medium};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

const InventoryItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ${({ hasUpdate }) => hasUpdate && `
    box-shadow: 0 0 0 2px #10b98120;
    animation: pulse 2s ease-in-out;
    
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 2px #10b98120; }
      50% { box-shadow: 0 0 0 4px #10b98140; }
    }
  `}
`;

const ItemIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ status, theme }) => {
    switch (status) {
      case 'critical': return '#ef444420';
      case 'low': return '#f59e0b20';
      case 'normal': return '#10b98120';
      default: return theme.colors.primary.main + '20';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'low': return '#f59e0b';
      case 'normal': return '#10b981';
      default: return '#6b7280';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ItemName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
`;

const ItemDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  flex-wrap: wrap;
`;

const StockLevel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  
  .current {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.sizes.lg};
  }
  
  .threshold {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
  }
`;

const ChangeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ change }) => {
    if (change > 0) return '#10b98120';
    if (change < 0) return '#ef444420';
    return '#6b728020';
  }};
  color: ${({ change }) => {
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#6b7280';
  }};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  .icon {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }
`;

const INVENTORY_FILTERS = [
  { id: 'all', label: 'All Items', icon: Package },
  { id: 'critical', label: 'Critical', icon: AlertTriangle },
  { id: 'low', label: 'Low Stock', icon: TrendingDown },
  { id: 'normal', label: 'Normal', icon: CheckCircle },
  { id: 'recent', label: 'Recent Changes', icon: Clock }
];

const LiveInventoryTracker = ({ 
  maxItems = 100,
  autoRefresh = true,
  showFilters = true,
  showStats = true,
  onItemClick
}) => {
  const { isConnected } = useWebSocketStore();
  const { 
    addInventoryChange, 
    updateInventoryStats,
    realtimeData 
  } = useDashboardStore();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState(new Set());

  // Mock inventory data for demonstration
  const mockInventoryData = useMemo(() => [
    { id: 'inv_001', name: 'Organic Bananas', category: 'Fruits', currentStock: 145, minThreshold: 50, maxThreshold: 200, status: 'normal', lastChange: -12, lastUpdate: Date.now() - 300000, location: 'Aisle A1' },
    { id: 'inv_002', name: 'Whole Milk (1L)', category: 'Dairy', currentStock: 23, minThreshold: 30, maxThreshold: 100, status: 'low', lastChange: -7, lastUpdate: Date.now() - 600000, location: 'Dairy Section' },
    { id: 'inv_003', name: 'Sourdough Bread', category: 'Bakery', currentStock: 8, minThreshold: 15, maxThreshold: 50, status: 'critical', lastChange: -5, lastUpdate: Date.now() - 180000, location: 'Bakery' },
    { id: 'inv_004', name: 'Greek Yogurt', category: 'Dairy', currentStock: 67, minThreshold: 25, maxThreshold: 80, status: 'normal', lastChange: +15, lastUpdate: Date.now() - 240000, location: 'Dairy Section' },
    { id: 'inv_005', name: 'Free-Range Eggs', category: 'Dairy', currentStock: 34, minThreshold: 20, maxThreshold: 60, status: 'normal', lastChange: +8, lastUpdate: Date.now() - 420000, location: 'Dairy Section' },
    { id: 'inv_006', name: 'Organic Spinach', category: 'Vegetables', currentStock: 89, minThreshold: 30, maxThreshold: 120, status: 'normal', lastChange: -3, lastUpdate: Date.now() - 720000, location: 'Produce' },
    { id: 'inv_007', name: 'Wild Salmon Fillet', category: 'Seafood', currentStock: 12, minThreshold: 15, maxThreshold: 40, status: 'low', lastChange: -4, lastUpdate: Date.now() - 480000, location: 'Seafood Counter' },
    { id: 'inv_008', name: 'Olive Oil (500ml)', category: 'Pantry', currentStock: 156, minThreshold: 40, maxThreshold: 200, status: 'normal', lastChange: +22, lastUpdate: Date.now() - 360000, location: 'Aisle B3' },
    { id: 'inv_009', name: 'Tomatoes', category: 'Vegetables', currentStock: 78, minThreshold: 25, maxThreshold: 100, status: 'normal', lastChange: -6, lastUpdate: Date.now() - 540000, location: 'Produce' },
    { id: 'inv_010', name: 'Chicken Breast', category: 'Meat', currentStock: 5, minThreshold: 12, maxThreshold: 50, status: 'critical', lastChange: -8, lastUpdate: Date.now() - 120000, location: 'Meat Counter' }
  ], []);

  // Initialize inventory data from mock service
  useEffect(() => {
    const currentInventory = mockInventoryChangeGenerator.getCurrentInventory();
    const formattedInventory = currentInventory.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      supplier: item.supplier,
      currentStock: item.currentStock,
      minThreshold: item.minThreshold,
      maxThreshold: item.maxStock,
      status: item.reorderStatus,
      lastChange: 0,
      lastUpdate: item.lastUpdated.getTime(),
      location: `${item.category} Section`
    }));
    setInventoryData(formattedInventory);
    
    // Update stats
    const stats = mockInventoryChangeGenerator.getInventoryStats();
    updateInventoryStats(stats);
  }, [updateInventoryStats]);

  // Subscribe to inventory changes from mock service
  useEffect(() => {
    const handleInventoryChange = (change) => {
      setIsLive(true);
      
      // Add change to dashboard store
      addInventoryChange(change);
      
      // Update local inventory data
      setInventoryData(prev => {
        const updated = prev.map(item => {
          if (item.id === change.productId) {
            return {
              ...item,
              currentStock: change.newStock,
              lastChange: change.changeAmount,
              lastUpdate: change.timestamp.getTime(),
              status: change.reorderStatus
            };
          }
          return item;
        });
        return updated;
      });
      
      // Update stats
      const stats = mockInventoryChangeGenerator.getInventoryStats();
      updateInventoryStats(stats);
      
      // Track recent updates
      setRecentUpdates(prev => {
        const newSet = new Set(prev);
        newSet.add(change.productId);
        return newSet;
      });
      
      // Clear recent update indicator after 5 seconds
      setTimeout(() => {
        setRecentUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(change.productId);
          return newSet;
        });
      }, 5000);
      
      // Reset live indicator after 3 seconds
      setTimeout(() => setIsLive(false), 3000);
    };
    
    const unsubscribe = mockInventoryChangeGenerator.subscribe(handleInventoryChange);
    
    return () => {
      unsubscribe();
    };
  }, [addInventoryChange, updateInventoryStats]);

  // Get stock status based on thresholds
  const getStockStatus = (current, min, max) => {
    if (current <= min * 0.5) return 'critical';
    if (current <= min) return 'low';
    return 'normal';
  };

  // Filter inventory items
  const filteredInventory = useMemo(() => {
    let filtered = inventoryData;
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => {
        switch (activeFilter) {
          case 'critical':
            return item.status === 'critical';
          case 'low':
            return item.status === 'low';
          case 'normal':
            return item.status === 'normal';
          case 'recent':
            return Date.now() - item.lastUpdate < 600000; // Last 10 minutes
          default:
            return true;
        }
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by last update (most recent first) then by status priority
    return filtered
      .sort((a, b) => {
        const statusPriority = { critical: 3, low: 2, normal: 1 };
        if (a.status !== b.status) {
          return statusPriority[b.status] - statusPriority[a.status];
        }
        return b.lastUpdate - a.lastUpdate;
      })
      .slice(0, maxItems);
  }, [inventoryData, activeFilter, searchTerm, maxItems]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: inventoryData.length,
      critical: inventoryData.filter(item => item.status === 'critical').length,
      low: inventoryData.filter(item => item.status === 'low').length,
      normal: inventoryData.filter(item => item.status === 'normal').length,
      recentUpdates: inventoryData.filter(item => Date.now() - item.lastUpdate < 300000).length
    };
  }, [inventoryData]);

  // Get change icon
  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUp size={12} />;
    if (change < 0) return <ArrowDown size={12} />;
    return <Minus size={12} />;
  };

  return (
    <TrackerContainer
      isConnected={isConnected}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TrackerHeader>
        <Title>
          <Package size={24} />
          Live Inventory Tracker
        </Title>
        <Controls>
          <LiveIndicator isLive={isLive}>
            <Dot
              animate={{ scale: isLive ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {isLive ? 'UPDATING' : isConnected ? 'LIVE' : 'OFFLINE'}
          </LiveIndicator>
          <Badge variant="neutral">
            {filteredInventory.length} items
          </Badge>
        </Controls>
      </TrackerHeader>

      {showStats && (
        <StatsGrid>
          <StatItem>
            <div className="label">Total Items</div>
            <div className="value">{stats.total}</div>
          </StatItem>
          <StatItem
            animate={{ scale: stats.critical > 0 ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="label">Critical</div>
            <div className="value" style={{ color: '#ef4444' }}>
              {stats.critical}
              {stats.critical > 0 && <AlertTriangle size={16} />}
            </div>
          </StatItem>
          <StatItem>
            <div className="label">Low Stock</div>
            <div className="value" style={{ color: '#f59e0b' }}>
              {stats.low}
              {stats.low > 0 && <TrendingDown size={16} />}
            </div>
          </StatItem>
          <StatItem>
            <div className="label">Normal</div>
            <div className="value" style={{ color: '#10b981' }}>
              {stats.normal}
              <CheckCircle size={16} />
            </div>
          </StatItem>
          <StatItem>
            <div className="label">Recent Updates</div>
            <div className="value">{stats.recentUpdates}</div>
          </StatItem>
        </StatsGrid>
      )}

      <FilterControls>
        <SearchInput
          type="text"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={16} />}
        />
        
        {showFilters && INVENTORY_FILTERS.map(filter => {
          const IconComponent = filter.icon;
          return (
            <FilterButton
              key={filter.id}
              variant={activeFilter === filter.id ? 'primary' : 'tertiary'}
              size="sm"
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              <IconComponent size={14} />
              {filter.label}
            </FilterButton>
          );
        })}
      </FilterControls>

      {filteredInventory.length > 0 ? (
        <InventoryList>
          <AnimatePresence mode="popLayout">
            {filteredInventory.map((item, index) => {
              const hasRecentUpdate = recentUpdates.has(item.id);
              
              return (
                <InventoryItem
                  key={item.id}
                  hasUpdate={hasRecentUpdate}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  onClick={() => onItemClick?.(item)}
                >
                  <ItemIcon status={item.status}>
                    <Package size={20} />
                  </ItemIcon>
                  
                  <ItemContent>
                    <ItemHeader>
                      <ItemName>{item.name}</ItemName>
                      <Badge variant={
                        item.status === 'critical' ? 'danger' :
                        item.status === 'low' ? 'warning' : 'success'
                      }>
                        {capitalize(item.status)}
                      </Badge>
                    </ItemHeader>
                    
                    <ItemDetails>
                      <StockLevel>
                        <span className="current">{formatNumber(item.currentStock)}</span>
                        <span className="threshold">/ {formatNumber(item.minThreshold)} min</span>
                      </StockLevel>
                      
                      {item.lastChange !== 0 && (
                        <ChangeIndicator change={item.lastChange}>
                          {getChangeIcon(item.lastChange)}
                          {Math.abs(item.lastChange)}
                        </ChangeIndicator>
                      )}
                      
                      <span>{item.category}</span>
                      <span>{item.location}</span>
                      <span>{formatRelativeTime(item.lastUpdate)}</span>
                    </ItemDetails>
                  </ItemContent>
                </InventoryItem>
              );
            })}
          </AnimatePresence>
        </InventoryList>
      ) : (
        <EmptyState>
          <div className="icon">
            <Package size={48} />
          </div>
          <div>No inventory items found</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {searchTerm || activeFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Connect to WebSocket to see live inventory updates'}
          </div>
        </EmptyState>
      )}
    </TrackerContainer>
  );
};

export default LiveInventoryTracker;