/**
 * OMNIX AI - Replenishment Alert Notification System
 * AI-powered smart replenishment notifications with consumption prediction
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  TrendingDown,
  AlertCircle,
  ShoppingCart,
  Calendar,
  Bell,
  BellOff,
  Settings,
  Zap,
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService } from '../../services/notifications';
import { apiService } from '../../services/api';

const NotificationContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ isActive, theme }) => 
    isActive ? `${theme.colors.success.main}20` : `${theme.colors.neutral.light}20`};
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.success.main : theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ReplenishmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ReplenishmentCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.main};
  border: 2px solid ${({ urgency, theme }) => {
    if (urgency === 'critical') return theme.colors.error.main;
    if (urgency === 'high') return theme.colors.warning.main;
    if (urgency === 'medium') return theme.colors.primary.light;
    return theme.colors.neutral.border;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.large};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const UrgencyBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ urgency, theme }) => {
    if (urgency === 'critical') return theme.colors.error.main;
    if (urgency === 'high') return theme.colors.warning.main;
    if (urgency === 'medium') return theme.colors.primary.main;
    return theme.colors.success.main;
  }};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-transform: uppercase;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.neutral.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const ProductCategory = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
`;

const ConsumptionInfo = styled.div`
  background: ${({ theme }) => theme.colors.neutral.light}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ConsumptionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ConsumptionLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ConsumptionValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ProgressBarContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.neutral.light};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ percentage, theme }) => {
    if (percentage > 80) return theme.colors.error.main;
    if (percentage > 60) return theme.colors.warning.main;
    return theme.colors.success.main;
  }};
  border-radius: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main : 'transparent'};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? 'white' : theme.colors.primary.main};
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background: ${({ variant, theme }) => 
      variant === 'primary' ? theme.colors.primary.dark : `${theme.colors.primary.main}10`};
  }
`;

const SettingsPanel = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SettingTitle = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const SettingDescription = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Toggle = styled.button`
  width: 48px;
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
    left: ${({ isOn }) => isOn ? '26px' : '2px'};
    transition: left 0.2s ease;
  }
`;

const NumberInput = styled.input`
  width: 60px;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ReplenishmentNotificationSystem = ({ className }) => {
  const [replenishmentItems, setReplenishmentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    alertDays: 3,
    smartTiming: true,
    quietHours: { start: 22, end: 8 },
    frequency: 'optimal'
  });

  const { preferences, updatePreferences, isNotificationEnabled } = useNotificationStore();

  useEffect(() => {
    loadReplenishmentData();
  }, []);

  const loadReplenishmentData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/ai/replenishment-predictions');
      setReplenishmentItems(response.predictions);
      
      // Load user settings
      const userSettings = await apiService.get('/notifications/replenishment-settings');
      setSettings({ ...settings, ...userSettings });
    } catch (error) {
      console.error('Failed to load replenishment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotifyNow = useCallback(async (item) => {
    try {
      await notificationService.sendLocalNotification('REPLENISHMENT', {
        id: item.productId,
        productName: item.name,
        daysRemaining: item.daysUntilEmpty,
        currentStock: item.estimatedStock,
        averageConsumption: item.averageConsumption,
        confidence: item.aiConfidence,
        productId: item.productId
      });
      
      // Update analytics
      useNotificationStore.getState().updateAnalytics('delivered', { type: 'REPLENISHMENT' });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, []);

  const handleBuyNow = useCallback((item) => {
    window.location.href = `/product/${item.productId}?action=buy&source=replenishment`;
  }, []);

  const handleScheduleReminder = useCallback(async (item) => {
    try {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 1);
      
      await useNotificationStore.getState().scheduleNotification(
        'REPLENISHMENT',
        {
          id: item.productId,
          productName: item.name,
          daysRemaining: item.daysUntilEmpty - 1,
          productId: item.productId
        },
        reminderDate
      );
      
      alert('Reminder scheduled for tomorrow!');
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      setSettings({ ...settings, ...newSettings });
      
      await updatePreferences({
        replenishment: { ...preferences.replenishment, ...newSettings }
      });
      
      // Update server settings
      await apiService.put('/notifications/replenishment-settings', newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }, [settings, preferences, updatePreferences]);

  const getUrgencyLevel = (daysUntilEmpty) => {
    if (daysUntilEmpty <= 1) return 'critical';
    if (daysUntilEmpty <= 2) return 'high';
    if (daysUntilEmpty <= 5) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      default: return '#10B981';
    }
  };

  const isSystemActive = settings.enabled && isNotificationEnabled('REPLENISHMENT');

  if (isLoading) {
    return (
      <NotificationContainer className={className}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading replenishment predictions...</p>
        </div>
      </NotificationContainer>
    );
  }

  return (
    <NotificationContainer
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Package size={24} />
          Smart Replenishment Alerts
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusIndicator isActive={isSystemActive}>
            {isSystemActive ? <Bell size={14} /> : <BellOff size={14} />}
            {isSystemActive ? 'Active' : 'Inactive'}
          </StatusIndicator>
          <ActionButton onClick={() => setShowSettings(!showSettings)}>
            <Settings size={14} />
            Settings
          </ActionButton>
        </div>
      </Header>

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SettingRow>
              <SettingLabel>
                <SettingTitle>Enable Replenishment Alerts</SettingTitle>
                <SettingDescription>Receive notifications when products are running low</SettingDescription>
              </SettingLabel>
              <Toggle 
                isOn={settings.enabled}
                onClick={() => updateSettings({ enabled: !settings.enabled })}
              />
            </SettingRow>
            
            <SettingRow>
              <SettingLabel>
                <SettingTitle>Alert Timing</SettingTitle>
                <SettingDescription>Days before running out to send alert</SettingDescription>
              </SettingLabel>
              <NumberInput
                type="number"
                value={settings.alertDays}
                min="1"
                max="14"
                onChange={(e) => updateSettings({ alertDays: parseInt(e.target.value) })}
              />
            </SettingRow>
            
            <SettingRow>
              <SettingLabel>
                <SettingTitle>AI-Optimized Timing</SettingTitle>
                <SettingDescription>Let AI choose the best time to notify you</SettingDescription>
              </SettingLabel>
              <Toggle 
                isOn={settings.smartTiming}
                onClick={() => updateSettings({ smartTiming: !settings.smartTiming })}
              />
            </SettingRow>
            
            <SettingRow>
              <SettingLabel>
                <SettingTitle>Notification Frequency</SettingTitle>
                <SettingDescription>How often to receive replenishment alerts</SettingDescription>
              </SettingLabel>
              <select 
                value={settings.frequency}
                onChange={(e) => updateSettings({ frequency: e.target.value })}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="optimal">AI Optimal</option>
                <option value="daily">Daily Check</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </SettingRow>
          </SettingsPanel>
        )}
      </AnimatePresence>

      {replenishmentItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
          <CheckCircle size={48} style={{ marginBottom: '16px' }} />
          <h3>All stocked up!</h3>
          <p>No items need replenishment at this time.</p>
        </div>
      ) : (
        <ReplenishmentGrid>
          {replenishmentItems.map((item, index) => {
            const urgency = getUrgencyLevel(item.daysUntilEmpty);
            const consumptionPercentage = ((item.totalPurchased - item.estimatedStock) / item.totalPurchased) * 100;
            
            return (
              <ReplenishmentCard
                key={item.productId}
                urgency={urgency}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <UrgencyBadge urgency={urgency}>
                  {urgency}
                </UrgencyBadge>
                
                <ProductInfo>
                  <ProductImage>
                    {item.emoji || '📦'}
                  </ProductImage>
                  <ProductDetails>
                    <ProductName>{item.name}</ProductName>
                    <ProductCategory>{item.category}</ProductCategory>
                  </ProductDetails>
                </ProductInfo>
                
                <ConsumptionInfo>
                  <ConsumptionRow>
                    <ConsumptionLabel>Estimated stock:</ConsumptionLabel>
                    <ConsumptionValue>{item.estimatedStock} {item.unit}</ConsumptionValue>
                  </ConsumptionRow>
                  <ConsumptionRow>
                    <ConsumptionLabel>Days until empty:</ConsumptionLabel>
                    <ConsumptionValue style={{ color: getUrgencyColor(urgency) }}>
                      {item.daysUntilEmpty} days
                    </ConsumptionValue>
                  </ConsumptionRow>
                  <ConsumptionRow>
                    <ConsumptionLabel>Daily usage:</ConsumptionLabel>
                    <ConsumptionValue>{item.averageConsumption} {item.unit}/day</ConsumptionValue>
                  </ConsumptionRow>
                  <ConsumptionRow>
                    <ConsumptionLabel>AI confidence:</ConsumptionLabel>
                    <ConsumptionValue>{Math.round(item.aiConfidence * 100)}%</ConsumptionValue>
                  </ConsumptionRow>
                </ConsumptionInfo>
                
                <ProgressBarContainer>
                  <ProgressLabel>
                    <span>Stock level</span>
                    <span>{Math.round(100 - consumptionPercentage)}% remaining</span>
                  </ProgressLabel>
                  <ProgressBar>
                    <ProgressFill
                      percentage={consumptionPercentage}
                      initial={{ width: 0 }}
                      animate={{ width: `${consumptionPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </ProgressBar>
                </ProgressBarContainer>
                
                <ActionButtons>
                  <ActionButton onClick={() => handleScheduleReminder(item)}>
                    <Clock size={14} />
                    Remind Later
                  </ActionButton>
                  <ActionButton onClick={() => handleNotifyNow(item)}>
                    <Bell size={14} />
                    Notify Now
                  </ActionButton>
                  <ActionButton variant="primary" onClick={() => handleBuyNow(item)}>
                    <ShoppingCart size={14} />
                    Buy Now
                  </ActionButton>
                </ActionButtons>
              </ReplenishmentCard>
            );
          })}
        </ReplenishmentGrid>
      )}
    </NotificationContainer>
  );
};

export default ReplenishmentNotificationSystem;