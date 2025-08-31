import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Eye,
  Filter,
  Clock,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Shield,
  Settings,
  BarChart3,
  Truck,
  Zap
} from 'lucide-react';
import { useWebSocketStore } from '../../store/websocketStore';
import alertService, { 
  createInventoryAlert, 
  createSalesAlert, 
  createCustomerAlert, 
  createSystemAlert 
} from '../../services/alertService';

const AlertCenterContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: ${({ $isOpen }) => $isOpen ? '0' : '-420px'};
  width: 420px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease-in-out;
`;

const AlertToggleButton = styled(motion.button)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;

  &:hover {
    transform: scale(1.05);
  }
`;

const AlertBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }
`;

const AlertHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const AlertTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const AlertFilters = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const FilterButtonsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  font-weight: 500;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.hover};
  }
`;

const AlertList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
`;

const AlertItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  position: relative;

  border-left: 4px solid ${({ $priority }) => {
    switch ($priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }};

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const AlertContent = styled.div`
  padding: 1rem;
`;

const AlertItemHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const AlertIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $category }) => {
    switch ($category) {
      case 'inventory': return '#dcfce7';
      case 'sales': return '#fef3c7';
      case 'customer': return '#eff6ff';
      case 'system': return '#fee2e2';
      case 'performance': return '#f0f9ff';
      case 'security': return '#fef2f2';
      case 'supplier': return '#f0fdf4';
      case 'cost': return '#fffbeb';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $category }) => {
    switch ($category) {
      case 'inventory': return '#166534';
      case 'sales': return '#92400e';
      case 'customer': return '#1e40af';
      case 'system': return '#991b1b';
      case 'performance': return '#0369a1';
      case 'security': return '#dc2626';
      case 'supplier': return '#15803d';
      case 'cost': return '#d97706';
      default: return '#374151';
    }
  }};
  margin-right: 0.75rem;
`;

const AlertDetails = styled.div`
  flex: 1;
`;

const AlertTitleText = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const AlertMessage = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.8rem;
  line-height: 1.4;
`;

const AlertActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertActionButton = styled.button`
  padding: 0.25rem;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const AlertMetadata = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border}40;
`;

const AlertTimestamp = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AlertCount = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.background};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const RealTimeAlertCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { 
    inventoryUpdates,
    reorderCalculations,
    customerActivity,
    realtimeData,
    isConnected 
  } = useWebSocketStore();

  // Subscribe to alert service
  useEffect(() => {
    const handleAlertEvent = ({ event, data }) => {
      if (event === 'alert_added' || event === 'alert_updated') {
        setAlerts(alertService.getActiveAlerts());
      } else if (event === 'alert_dismissed' || event === 'alert_acknowledged') {
        setAlerts(alertService.getActiveAlerts());
      }
      
      // Update statistics
      setStatistics(alertService.getAlertStatistics());
    };

    const unsubscribe = alertService.subscribe(handleAlertEvent);

    // Initial load
    setAlerts(alertService.getActiveAlerts());
    setStatistics(alertService.getAlertStatistics());

    return unsubscribe;
  }, []);

  // Real-time inventory alerts
  useEffect(() => {
    if (inventoryUpdates && Object.keys(inventoryUpdates).length > 0) {
      Object.entries(inventoryUpdates).forEach(([itemId, data]) => {
        const stockLevel = data.currentStock || data.stockLevel;
        const itemName = data.itemName || `Item ${itemId}`;
        
        if (stockLevel <= 0) {
          createInventoryAlert(itemName, stockLevel, 0, 'critical');
        } else if (stockLevel <= 5) {
          createInventoryAlert(itemName, stockLevel, 5, 'high');
        } else if (stockLevel <= 10) {
          createInventoryAlert(itemName, stockLevel, 10, 'medium');
        }
      });
    }
  }, [inventoryUpdates]);

  // Real-time reorder alerts
  useEffect(() => {
    if (reorderCalculations && reorderCalculations.length > 0) {
      reorderCalculations.forEach(calc => {
        if (calc.urgency === 'critical' || calc.urgency === 'high') {
          alertService.addAlert({
            title: 'Reorder Required',
            message: `${calc.urgency.toUpperCase()}: ${calc.itemName} needs immediate reordering (${calc.optimalOrderQuantity} units)`,
            priority: calc.urgency,
            category: 'inventory',
            source: 'reorder_system',
            metadata: { 
              itemId: calc.itemId, 
              itemName: calc.itemName,
              orderQuantity: calc.optimalOrderQuantity,
              estimatedCost: calc.optimalOrderQuantity * (calc.unitCost || 0)
            }
          });
        }
      });
    }
  }, [reorderCalculations]);

  // Real-time customer activity alerts
  useEffect(() => {
    if (customerActivity && customerActivity.length > 0) {
      // Process significant customer activities
      customerActivity.forEach(activity => {
        if (activity.type === 'large_purchase' && activity.amount > 100) {
          createCustomerAlert(
            `Large purchase: ${activity.customerName || 'Customer'} spent $${activity.amount.toLocaleString()}`,
            activity.customerId,
            'info'
          );
        } else if (activity.type === 'first_time_customer') {
          createCustomerAlert(
            `New customer: ${activity.customerName || 'New customer'} just registered`,
            activity.customerId,
            'info'
          );
        }
      });
    }
  }, [customerActivity]);

  // Connection status alerts
  useEffect(() => {
    if (!isConnected) {
      createSystemAlert('Real-time connection lost', 'high');
    } else {
      // Connection restored
      alertService.addAlert({
        title: 'Connection Restored',
        message: 'Real-time updates are now active',
        priority: 'info',
        category: 'system',
        source: 'websocket_monitor'
      });
    }
  }, [isConnected]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    if (filter !== 'all') {
      filtered = filtered.filter(alert => alert.category === filter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.priority === priorityFilter);
    }

    return filtered;
  }, [alerts, filter, priorityFilter]);

  const handleDismissAlert = (alertId) => {
    alertService.dismissAlert(alertId, 'user');
  };

  const handleAcknowledgeAlert = (alertId) => {
    alertService.acknowledgeAlert(alertId, 'manager');
  };

  const getAlertIcon = (category) => {
    switch (category) {
      case 'inventory': return <Package size={16} />;
      case 'sales': return <DollarSign size={16} />;
      case 'customer': return <Users size={16} />;
      case 'system': return <Settings size={16} />;
      case 'performance': return <BarChart3 size={16} />;
      case 'security': return <Shield size={16} />;
      case 'supplier': return <Truck size={16} />;
      case 'cost': return <TrendingUp size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const criticalCount = alerts.filter(a => a.priority === 'critical').length;
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <>
      <AlertToggleButton
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={24} />
        {unacknowledgedCount > 0 && (
          <AlertBadge>{unacknowledgedCount}</AlertBadge>
        )}
      </AlertToggleButton>

      <AlertCenterContainer
        $isOpen={isOpen}
        initial={{ right: -420 }}
        animate={{ right: isOpen ? 0 : -420 }}
        transition={{ duration: 0.3 }}
      >
        <AlertHeader>
          <AlertTitle>
            <Bell size={20} />
            Alert Center
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap size={16} style={{ color: isConnected ? '#10b981' : '#6b7280' }} />
            </motion.div>
          </AlertTitle>
          
          <AlertStats>
            <StatItem>
              <StatValue $color="#ef4444">{criticalCount}</StatValue>
              <StatLabel>Critical</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue $color="#3b82f6">{alerts.length}</StatValue>
              <StatLabel>Active</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue $color="#f59e0b">{unacknowledgedCount}</StatValue>
              <StatLabel>Unread</StatLabel>
            </StatItem>
          </AlertStats>
        </AlertHeader>

        <AlertFilters>
          <FilterButtonsRow style={{ marginBottom: '0.75rem' }}>
            <FilterButton 
              $active={filter === 'all'} 
              onClick={() => setFilter('all')}
            >
              All
            </FilterButton>
            <FilterButton 
              $active={filter === 'inventory'} 
              onClick={() => setFilter('inventory')}
            >
              Inventory
            </FilterButton>
            <FilterButton 
              $active={filter === 'sales'} 
              onClick={() => setFilter('sales')}
            >
              Sales
            </FilterButton>
            <FilterButton 
              $active={filter === 'customer'} 
              onClick={() => setFilter('customer')}
            >
              Customer
            </FilterButton>
            <FilterButton 
              $active={filter === 'system'} 
              onClick={() => setFilter('system')}
            >
              System
            </FilterButton>
          </FilterButtonsRow>
          
          <FilterButtonsRow>
            <FilterButton 
              $active={priorityFilter === 'all'} 
              onClick={() => setPriorityFilter('all')}
            >
              All Priorities
            </FilterButton>
            <FilterButton 
              $active={priorityFilter === 'critical'} 
              onClick={() => setPriorityFilter('critical')}
            >
              Critical
            </FilterButton>
            <FilterButton 
              $active={priorityFilter === 'high'} 
              onClick={() => setPriorityFilter('high')}
            >
              High
            </FilterButton>
          </FilterButtonsRow>
        </AlertFilters>

        <AlertList>
          <AnimatePresence>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  $priority={alert.priority}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertContent>
                    <AlertItemHeader>
                      <AlertIcon $category={alert.category}>
                        {getAlertIcon(alert.category)}
                      </AlertIcon>
                      <AlertDetails>
                        <AlertTitleText>{alert.title}</AlertTitleText>
                        <AlertMessage>{alert.message}</AlertMessage>
                      </AlertDetails>
                      <AlertActions>
                        {!alert.acknowledged && (
                          <AlertActionButton
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            title="Acknowledge"
                          >
                            <Eye size={16} />
                          </AlertActionButton>
                        )}
                        <AlertActionButton
                          onClick={() => handleDismissAlert(alert.id)}
                          title="Dismiss"
                        >
                          <X size={16} />
                        </AlertActionButton>
                      </AlertActions>
                    </AlertItemHeader>
                    
                    <AlertMetadata>
                      <AlertTimestamp>
                        <Clock size={12} />
                        {getTimeAgo(alert.timestamp)}
                      </AlertTimestamp>
                      {alert.count > 1 && (
                        <AlertCount>
                          {alert.count} occurrences
                        </AlertCount>
                      )}
                    </AlertMetadata>
                  </AlertContent>
                </AlertItem>
              ))
            ) : (
              <EmptyState>
                <CheckCircle size={48} style={{ marginBottom: '1rem', color: '#10b981' }} />
                <div>No alerts matching your filters</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  All systems are running smoothly
                </div>
              </EmptyState>
            )}
          </AnimatePresence>
        </AlertList>
      </AlertCenterContainer>
    </>
  );
};

export default RealTimeAlertCenter;