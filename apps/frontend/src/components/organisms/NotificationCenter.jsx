/**
 * OMNIX AI - Comprehensive Notification Center
 * Centralized notification management with price drops, loyalty updates, and preferences
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Settings,
  TrendingDown,
  Gift,
  Crown,
  Star,
  DollarSign,
  Percent,
  Award,
  Target,
  Clock,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Toggle,
  ChevronRight,
  Check,
  X,
  Filter,
  Calendar,
  Sliders
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService } from '../../services/notifications';

const CenterContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.large};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  overflow: hidden;
  min-width: 400px;
  max-width: 500px;
`;

const Header = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  display: flex;
  justify-content: between;
  align-items: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
  flex: 1;
`;

const TabBar = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.background.main};
`;

const Tab = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.surface.primary : 'transparent'};
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.text.secondary};
  border: none;
  border-bottom: 2px solid ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : 'transparent'};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.primary.light}10;
  }
`;

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-height: 60vh;
  overflow-y: auto;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NotificationItem = styled(motion.div)`
  background: ${({ isRead, theme }) => 
    isRead ? theme.colors.background.main : `${theme.colors.primary.light}10`};
  border: 1px solid ${({ isRead, theme }) => 
    isRead ? theme.colors.neutral.border : `${theme.colors.primary.main}40`};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral.hover};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NotificationTitle = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const NotificationTime = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const NotificationBody = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
  line-height: 1.4;
`;

const PreferencesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const PreferenceGroup = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const PreferenceGroupTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};

  &:last-child {
    border-bottom: none;
  }
`;

const PreferenceLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PreferenceTitle = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const PreferenceDescription = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const ToggleSwitch = styled.button`
  width: 44px;
  height: 24px;
  background: ${({ isOn, theme }) => 
    isOn ? theme.colors.primary.main : theme.colors.neutral.light};
  border-radius: 12px;
  border: none;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${({ isOn }) => isOn ? '22px' : '2px'};
    transition: left 0.2s ease;
  }
`;

const NotificationCenter = ({ isOpen, onClose, className }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [priceDropAlerts, setPriceDropAlerts] = useState([]);
  const [loyaltyUpdates, setLoyaltyUpdates] = useState([]);
  
  const { 
    preferences, 
    updatePreferences, 
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadPriceDropAlerts();
      loadLoyaltyUpdates();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    // Mock data - would come from API
    setNotifications([
      {
        id: '1',
        type: 'price_drop',
        title: 'Price Drop Alert',
        body: 'Organic Bananas dropped to $3.49 (was $4.99)',
        timestamp: new Date(Date.now() - 300000),
        isRead: false,
        icon: TrendingDown
      },
      {
        id: '2',
        type: 'loyalty',
        title: 'Loyalty Milestone',
        body: 'Congratulations! You\'ve reached Gold tier',
        timestamp: new Date(Date.now() - 3600000),
        isRead: false,
        icon: Crown
      },
      {
        id: '3',
        type: 'replenishment',
        title: 'Stock Running Low',
        body: 'Your almond milk will run out in 2 days',
        timestamp: new Date(Date.now() - 7200000),
        isRead: true,
        icon: Bell
      }
    ]);
  };

  const loadPriceDropAlerts = async () => {
    setPriceDropAlerts([
      {
        id: 'pd1',
        productName: 'Organic Bananas',
        oldPrice: 4.99,
        newPrice: 3.49,
        discount: 30,
        isWatched: true
      },
      {
        id: 'pd2',
        productName: 'Greek Yogurt',
        oldPrice: 5.99,
        newPrice: 4.49,
        discount: 25,
        isWatched: true
      }
    ]);
  };

  const loadLoyaltyUpdates = async () => {
    setLoyaltyUpdates([
      {
        id: 'l1',
        type: 'milestone',
        title: 'Gold Tier Achieved',
        points: 2500,
        benefit: '15% discount on all purchases'
      },
      {
        id: 'l2',
        type: 'points',
        title: 'Points Earned',
        points: 150,
        benefit: 'From recent purchase'
      }
    ]);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Route based on notification type
    switch (notification.type) {
      case 'price_drop':
        window.location.href = '/watchlist';
        break;
      case 'loyalty':
        window.location.href = '/rewards';
        break;
      default:
        window.location.href = '/customer/dashboard';
    }
  };

  const handlePreferenceChange = async (category, setting, value) => {
    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [setting]: value
      }
    };
    
    await updatePreferences(newPreferences);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const renderNotifications = () => (
    <NotificationList>
      {notifications.map((notification) => {
        const Icon = notification.icon;
        return (
          <NotificationItem
            key={notification.id}
            isRead={notification.isRead}
            onClick={() => handleNotificationClick(notification)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NotificationHeader>
              <NotificationTitle>
                <Icon size={16} />
                {notification.title}
              </NotificationTitle>
              <NotificationTime>
                {formatTime(notification.timestamp)}
              </NotificationTime>
            </NotificationHeader>
            <NotificationBody>{notification.body}</NotificationBody>
          </NotificationItem>
        );
      })}
      
      {notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
          <Bell size={32} style={{ marginBottom: '8px' }} />
          <p>No notifications yet</p>
        </div>
      )}
    </NotificationList>
  );

  const renderPriceDrops = () => (
    <NotificationList>
      {priceDropAlerts.map((alert) => (
        <NotificationItem
          key={alert.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <NotificationHeader>
            <NotificationTitle>
              <TrendingDown size={16} color="#EF4444" />
              Price Drop: {alert.productName}
            </NotificationTitle>
            <span style={{ color: '#EF4444', fontWeight: 'bold' }}>
              -{alert.discount}%
            </span>
          </NotificationHeader>
          <NotificationBody>
            Now ${alert.newPrice} (was ${alert.oldPrice})
          </NotificationBody>
        </NotificationItem>
      ))}
    </NotificationList>
  );

  const renderLoyalty = () => (
    <NotificationList>
      {loyaltyUpdates.map((update) => (
        <NotificationItem
          key={update.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <NotificationHeader>
            <NotificationTitle>
              <Crown size={16} color="#F59E0B" />
              {update.title}
            </NotificationTitle>
            <span style={{ color: '#10B981', fontWeight: 'bold' }}>
              +{update.points} pts
            </span>
          </NotificationHeader>
          <NotificationBody>{update.benefit}</NotificationBody>
        </NotificationItem>
      ))}
    </NotificationList>
  );

  const renderPreferences = () => (
    <PreferencesSection>
      <PreferenceGroup>
        <PreferenceGroupTitle>
          <TrendingDown size={20} />
          Price Drop Alerts
        </PreferenceGroupTitle>
        
        <PreferenceItem>
          <PreferenceLabel>
            <PreferenceTitle>Enable Price Drop Notifications</PreferenceTitle>
            <PreferenceDescription>Get notified when watched items go on sale</PreferenceDescription>
          </PreferenceLabel>
          <ToggleSwitch
            isOn={preferences.priceDrops?.enabled}
            onClick={() => handlePreferenceChange('priceDrops', 'enabled', !preferences.priceDrops?.enabled)}
          />
        </PreferenceItem>
        
        <PreferenceItem>
          <PreferenceLabel>
            <PreferenceTitle>Minimum Discount</PreferenceTitle>
            <PreferenceDescription>Only notify for discounts above this percentage</PreferenceDescription>
          </PreferenceLabel>
          <input
            type="number"
            value={preferences.priceDrops?.minDropPercentage || 15}
            onChange={(e) => handlePreferenceChange('priceDrops', 'minDropPercentage', parseInt(e.target.value))}
            style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </PreferenceItem>
      </PreferenceGroup>

      <PreferenceGroup>
        <PreferenceGroupTitle>
          <Crown size={20} />
          Loyalty Program
        </PreferenceGroupTitle>
        
        <PreferenceItem>
          <PreferenceLabel>
            <PreferenceTitle>Milestone Alerts</PreferenceTitle>
            <PreferenceDescription>Celebrate when you reach new tiers</PreferenceDescription>
          </PreferenceLabel>
          <ToggleSwitch
            isOn={preferences.loyalty?.milestoneAlerts}
            onClick={() => handlePreferenceChange('loyalty', 'milestoneAlerts', !preferences.loyalty?.milestoneAlerts)}
          />
        </PreferenceItem>
        
        <PreferenceItem>
          <PreferenceLabel>
            <PreferenceTitle>Points Expiration Warnings</PreferenceTitle>
            <PreferenceDescription>Remind me before points expire</PreferenceDescription>
          </PreferenceLabel>
          <ToggleSwitch
            isOn={preferences.loyalty?.expirationWarnings}
            onClick={() => handlePreferenceChange('loyalty', 'expirationWarnings', !preferences.loyalty?.expirationWarnings)}
          />
        </PreferenceItem>
      </PreferenceGroup>

      <PreferenceGroup>
        <PreferenceGroupTitle>
          <Bell size={20} />
          Delivery Methods
        </PreferenceGroupTitle>
        
        <PreferenceItem>
          <PreferenceLabel>
            <PreferenceTitle>Push Notifications</PreferenceTitle>
            <PreferenceDescription>Browser and mobile push notifications</PreferenceDescription>
          </PreferenceLabel>
          <ToggleSwitch
            isOn={preferences.delivery?.webPush}
            onClick={() => handlePreferenceChange('delivery', 'webPush', !preferences.delivery?.webPush)}
          />
        </PreferenceItem>
        
        <PreferenceItem>
          <PreferenceLabel>
            <PreferenceTitle>Email Notifications</PreferenceTitle>
            <PreferenceDescription>Receive notifications via email</PreferenceDescription>
          </PreferenceLabel>
          <ToggleSwitch
            isOn={preferences.delivery?.email}
            onClick={() => handlePreferenceChange('delivery', 'email', !preferences.delivery?.email)}
          />
        </PreferenceItem>
      </PreferenceGroup>
    </PreferencesSection>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <CenterContainer
        className={className}
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Header>
          <Title>Notifications</Title>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#3B82F6',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Mark all read
            </button>
          )}
        </Header>

        <TabBar>
          <Tab
            isActive={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} />
            All ({unreadCount})
          </Tab>
          <Tab
            isActive={activeTab === 'price-drops'}
            onClick={() => setActiveTab('price-drops')}
          >
            <TrendingDown size={16} />
            Price Drops
          </Tab>
          <Tab
            isActive={activeTab === 'loyalty'}
            onClick={() => setActiveTab('loyalty')}
          >
            <Crown size={16} />
            Loyalty
          </Tab>
          <Tab
            isActive={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')}
          >
            <Settings size={16} />
            Settings
          </Tab>
        </TabBar>

        <Content>
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'price-drops' && renderPriceDrops()}
          {activeTab === 'loyalty' && renderLoyalty()}
          {activeTab === 'preferences' && renderPreferences()}
        </Content>
      </CenterContainer>
    </AnimatePresence>
  );
};

export default NotificationCenter;