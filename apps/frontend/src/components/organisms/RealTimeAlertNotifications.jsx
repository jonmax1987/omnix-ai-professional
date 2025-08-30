/**
 * OMNIX AI - Real-Time Alert Notifications
 * MGR-026: Real-time alert notifications
 * Live notification system with WebSocket integration and toast notifications
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  BellRing,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Volume2,
  VolumeX,
  Settings,
  Filter,
  Clock,
  TrendingDown,
  Package,
  DollarSign,
  Users,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import useWebSocketStore from '../../store/websocketStore';
import useNotificationStore from '../../store/notificationStore';
import { formatRelativeTime, formatCurrency, formatNumber } from '../../utils/formatters';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
  width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  pointer-events: none;

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`;

const NotificationToast = styled(motion.div)`
  background: ${({ theme, alertType }) => {
    switch (alertType) {
      case 'critical': return `linear-gradient(135deg, ${theme.colors.status.error} 0%, #dc2626 100%)`;
      case 'warning': return `linear-gradient(135deg, ${theme.colors.status.warning} 0%, #f59e0b 100%)`;
      case 'success': return `linear-gradient(135deg, ${theme.colors.status.success} 0%, #10b981 100%)`;
      case 'info': return `linear-gradient(135deg, ${theme.colors.status.info} 0%, #3b82f6 100%)`;
      default: return `linear-gradient(135deg, ${theme.colors.background.paper} 0%, ${theme.colors.background.elevated} 100%)`;
    }
  }};
  border: 1px solid ${({ theme, alertType }) => {
    switch (alertType) {
      case 'critical': return 'rgba(220, 38, 38, 0.3)';
      case 'warning': return 'rgba(245, 158, 11, 0.3)';
      case 'success': return 'rgba(16, 185, 129, 0.3)';
      case 'info': return 'rgba(59, 130, 246, 0.3)';
      default: return theme.colors.border.default;
    }
  }};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  color: ${({ alertType }) => alertType === 'critical' || alertType === 'warning' ? 'white' : 'inherit'};
  pointer-events: auto;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme, alertType }) => {
      switch (alertType) {
        case 'critical': return theme.colors.status.error;
        case 'warning': return theme.colors.status.warning;
        case 'success': return theme.colors.status.success;
        case 'info': return theme.colors.status.info;
        default: return theme.colors.primary.main;
      }
    }};
  }

  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const NotificationIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ alertType }) => alertType === 'critical' || alertType === 'warning' ? 'white' : 'inherit'};
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ alertType }) => alertType === 'critical' || alertType === 'warning' ? 'white' : 'inherit'};
`;

const NotificationContent = styled.div`
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 8px;
  color: ${({ alertType }) => alertType === 'critical' || alertType === 'warning' ? 'rgba(255,255,255,0.9)' : 'inherit'};
`;

const NotificationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  opacity: 0.8;
  color: ${({ alertType }) => alertType === 'critical' || alertType === 'warning' ? 'rgba(255,255,255,0.7)' : 'inherit'};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ alertType }) => alertType === 'critical' || alertType === 'warning' ? 'white' : 'inherit'};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ControlPanel = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10001;
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    bottom: 10px;
    right: 10px;
    left: 10px;
    justify-content: center;
  }
`;

const ControlButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  background: ${({ active, theme }) => active ? theme.colors.primary.main : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ active }) => active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary.dark : 'rgba(255, 255, 255, 0.2)'};
    color: white;
  }
`;

const AlertCounter = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    top: 10px;
    left: 10px;
  }
`;

const alertIcons = {
  critical: AlertTriangle,
  warning: AlertCircle,
  success: CheckCircle,
  info: Info,
  inventory: Package,
  revenue: DollarSign,
  customer: Users,
  system: Zap
};

const alertTitles = {
  critical: 'Critical Alert',
  warning: 'Warning',
  success: 'Success',
  info: 'Information',
  inventory: 'Inventory Alert',
  revenue: 'Revenue Alert',
  customer: 'Customer Alert',
  system: 'System Alert'
};

const RealTimeAlertNotifications = ({ 
  maxNotifications = 5,
  autoHideDelay = 6000,
  soundEnabled = true,
  showControls = true 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundEnabled);
  const [alertStats, setAlertStats] = useState({ total: 0, critical: 0, warning: 0, info: 0 });
  const audioRef = useRef(null);
  
  const { realtimeData } = useDashboardStore();
  const { isConnected } = useWebSocketStore();
  const { addNotification } = useNotificationStore();

  // Create audio element for alert sounds
  useEffect(() => {
    audioRef.current = new Audio('/sounds/alert.mp3');
    audioRef.current.volume = 0.3;
  }, []);

  // Generate alerts from inventory changes
  useEffect(() => {
    const inventoryChanges = realtimeData?.inventoryChanges?.changes || [];
    const latestChange = inventoryChanges[0];
    
    if (latestChange && latestChange.urgent) {
      const alertType = latestChange.reorderStatus === 'critical' ? 'critical' : 'warning';
      
      addAlert({
        id: `inventory_${latestChange.id}`,
        type: 'inventory',
        alertType,
        title: `${latestChange.productName} Stock Alert`,
        content: `Stock level is ${latestChange.reorderStatus}. Current: ${latestChange.newStock} units (${latestChange.changeAmount > 0 ? '+' : ''}${latestChange.changeAmount})`,
        data: {
          productId: latestChange.productId,
          productName: latestChange.productName,
          currentStock: latestChange.newStock,
          minThreshold: latestChange.minThreshold,
          changeType: latestChange.changeType,
          change: latestChange.changeAmount
        },
        actions: [
          { label: 'View Product', action: () => console.log('View product:', latestChange.productId) },
          { label: 'Reorder', action: () => console.log('Reorder:', latestChange.productId) }
        ]
      });
    }
  }, [realtimeData?.inventoryChanges?.changes]);

  // Generate alerts from revenue stream
  useEffect(() => {
    const revenueStream = realtimeData?.revenueStream;
    const lastTransaction = revenueStream?.lastTransaction;
    
    if (lastTransaction && lastTransaction.amount > 500) {
      addAlert({
        id: `revenue_${lastTransaction.id}`,
        type: 'revenue',
        alertType: 'success',
        title: 'Large Transaction',
        content: `High-value transaction: ${formatCurrency(lastTransaction.amount)} from ${lastTransaction.customerName || 'Customer'}`,
        data: {
          amount: lastTransaction.amount,
          customerName: lastTransaction.customerName,
          items: lastTransaction.items
        }
      });
    }
  }, [realtimeData?.revenueStream?.lastTransaction]);

  // Generate alerts from customer activity
  useEffect(() => {
    const customerActivity = realtimeData?.customerActivity?.activities || [];
    const latestActivity = customerActivity[0];
    
    if (latestActivity && latestActivity.type === 'purchase' && latestActivity.value > 200) {
      addAlert({
        id: `customer_${latestActivity.id}`,
        type: 'customer',
        alertType: 'info',
        title: 'High-Value Purchase',
        content: `${latestActivity.customerName} made a purchase worth ${formatCurrency(latestActivity.value)}`,
        data: latestActivity
      });
    }
  }, [realtimeData?.customerActivity?.activities]);

  const addAlert = useCallback((alert) => {
    const newAlert = {
      ...alert,
      timestamp: Date.now(),
      read: false
    };

    // Add to notification store
    addNotification(newAlert);
    
    // Play sound if enabled
    if (isSoundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    }

    // Add to local state for toast display
    setNotifications(prev => {
      const updated = [newAlert, ...prev.slice(0, maxNotifications - 1)];
      return updated;
    });

    // Update stats
    setAlertStats(prev => ({
      total: prev.total + 1,
      critical: prev.critical + (alert.alertType === 'critical' ? 1 : 0),
      warning: prev.warning + (alert.alertType === 'warning' ? 1 : 0),
      info: prev.info + (alert.alertType === 'info' ? 1 : 0)
    }));

    // Auto-remove after delay
    if (autoHideDelay > 0) {
      setTimeout(() => {
        removeAlert(newAlert.id);
      }, autoHideDelay);
    }
  }, [isSoundEnabled, maxNotifications, autoHideDelay, addNotification]);

  const removeAlert = useCallback((alertId) => {
    setNotifications(prev => prev.filter(n => n.id !== alertId));
  }, []);

  const handleAlertClick = useCallback((alert) => {
    if (alert.actions && alert.actions.length > 0) {
      alert.actions[0].action();
    }
    removeAlert(alert.id);
  }, [removeAlert]);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleSound = () => setIsSoundEnabled(!isSoundEnabled);
  const clearAll = () => setNotifications([]);

  const getAlertIcon = (type, alertType) => {
    const IconComponent = alertIcons[type] || alertIcons[alertType] || Info;
    return <IconComponent size={16} />;
  };

  return (
    <>
      {/* Alert Counter */}
      {showControls && (
        <AlertCounter>
          🚨 {alertStats.critical} | ⚠️ {alertStats.warning} | ℹ️ {alertStats.info} | Total: {alertStats.total}
        </AlertCounter>
      )}

      {/* Notification Toasts */}
      <AnimatePresence>
        {isVisible && (
          <NotificationContainer>
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => (
                <NotificationToast
                  key={notification.id}
                  alertType={notification.alertType}
                  initial={{ x: 400, opacity: 0, scale: 0.8 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1, 
                    scale: 1,
                    y: index * -5 // Slight stagger effect
                  }}
                  exit={{ x: 400, opacity: 0, scale: 0.8 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 25, 
                    stiffness: 120,
                    delay: index * 0.05
                  }}
                  onClick={() => handleAlertClick(notification)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <NotificationHeader>
                    <NotificationIcon alertType={notification.alertType}>
                      {getAlertIcon(notification.type, notification.alertType)}
                      <NotificationTitle alertType={notification.alertType}>
                        {alertTitles[notification.type] || notification.title}
                      </NotificationTitle>
                    </NotificationIcon>
                    <CloseButton
                      alertType={notification.alertType}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAlert(notification.id);
                      }}
                    >
                      <X size={14} />
                    </CloseButton>
                  </NotificationHeader>
                  
                  <NotificationContent alertType={notification.alertType}>
                    {notification.content}
                  </NotificationContent>
                  
                  <NotificationFooter alertType={notification.alertType}>
                    <span>{formatRelativeTime(notification.timestamp)}</span>
                    {isConnected ? (
                      <Badge variant="success" size="xs">Live</Badge>
                    ) : (
                      <Badge variant="warning" size="xs">Offline</Badge>
                    )}
                  </NotificationFooter>
                </NotificationToast>
              ))}
            </AnimatePresence>
          </NotificationContainer>
        )}
      </AnimatePresence>

      {/* Control Panel */}
      {showControls && (
        <ControlPanel
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ControlButton
            active={isVisible}
            onClick={toggleVisibility}
            title={isVisible ? 'Hide notifications' : 'Show notifications'}
          >
            {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            {isVisible ? 'Hide' : 'Show'}
          </ControlButton>
          
          <ControlButton
            active={isSoundEnabled}
            onClick={toggleSound}
            title={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            Sound
          </ControlButton>
          
          <ControlButton
            onClick={clearAll}
            title="Clear all notifications"
          >
            <X size={16} />
            Clear
          </ControlButton>
          
          <Badge variant={isConnected ? 'success' : 'error'} size="sm">
            {isConnected ? (
              <>
                <BellRing size={12} />
                Live
              </>
            ) : (
              <>
                <Bell size={12} />
                Offline
              </>
            )}
          </Badge>
        </ControlPanel>
      )}
    </>
  );
};

export default RealTimeAlertNotifications;