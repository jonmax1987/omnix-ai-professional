import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import AlertCenter from '../components/organisms/AlertCenter';
import { useI18n } from '../hooks/useI18n';
import useAlertsStore from '../store/alertsStore';
import { useRealtimeAlerts } from '../hooks/useWebSocket';
import { useNotificationStore } from '../store/notificationStore';

const AlertsContainer = styled(motion.div)`
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

const AlertsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[4]};
    margin-bottom: ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
    
    & > * {
      flex: 1;
    }
  }
`;

const AlertsContent = styled.div`
  height: calc(100vh - 200px);
  min-height: 600px;
`;

const Alerts = () => {
  const { t } = useI18n();
  
  // Alerts store
  const { 
    alerts, 
    loading, 
    error,
    fetchAlerts,
    acknowledgeAlert,
    dismissAlert 
  } = useAlertsStore();
  
  // Notification store for push notifications
  const { requestPermission } = useNotificationStore();
  
  // Enable real-time alert updates
  useRealtimeAlerts();

  // Fetch alerts on component mount and request notification permission
  useEffect(() => {
    fetchAlerts();
    
    // Request browser notification permission for critical alerts
    requestPermission();
  }, [fetchAlerts, requestPermission]);

  const handleRefresh = async () => {
    await fetchAlerts();
  };

  const handleAlertClick = (alert) => {
    console.log('Alert clicked:', alert);
    // Navigate to related page or show details
  };

  const handleAlertAction = async (action, alert) => {
    try {
      switch (action) {
        case 'markRead':
          await acknowledgeAlert(alert.id);
          break;
        case 'markUnread':
          // TODO: Implement unacknowledge if API supports it
          console.log('Mark unread not yet implemented');
          break;
        case 'archive':
          await dismissAlert(alert.id);
          break;
        case 'delete':
          await dismissAlert(alert.id);
          break;
        default:
          break;
      }
      // Refresh alerts after action
      await fetchAlerts();
    } catch (error) {
      console.error('Error performing alert action:', error);
      // TODO: Show error notification
    }
  };

  const handleBulkAction = async (action, alertIds) => {
    try {
      switch (action) {
        case 'markRead':
          // Acknowledge multiple alerts
          await Promise.all(alertIds.map(id => acknowledgeAlert(id)));
          break;
        case 'markUnread':
          // TODO: Implement bulk unacknowledge if API supports it
          console.log('Bulk mark unread not yet implemented');
          break;
        case 'archive':
          // Dismiss multiple alerts
          await Promise.all(alertIds.map(id => dismissAlert(id)));
          break;
        case 'delete':
          // Dismiss multiple alerts (same as archive for now)
          await Promise.all(alertIds.map(id => dismissAlert(id)));
          break;
        default:
          break;
      }
      // Refresh alerts after bulk action
      await fetchAlerts();
    } catch (error) {
      console.error('Error performing bulk alert action:', error);
      // TODO: Show error notification
    }
  };

  const handleExport = () => {
    console.log('Export alerts');
    // Export alerts to CSV or PDF
  };

  const handleSettings = () => {
    console.log('Open alert settings');
    // Open alert configuration/settings
  };

  const handleCreateRule = () => {
    console.log('Create alert rule');
    // Open dialog to create new alert rule
  };

  // Calculate statistics from real alerts data
  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.read && !a.archived).length,
    critical: alerts.filter(a => a.severity === 'error' && !a.archived).length,
    warning: alerts.filter(a => a.severity === 'warning' && !a.archived).length
  };

  return (
    <AlertsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AlertsHeader>
        <HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="h3" weight="bold" color="primary">
              {t('alerts.title')}
            </Typography>
            {stats.unread > 0 && (
              <Badge variant="error" size="sm">
                {stats.unread} {t('alerts.unread')}
              </Badge>
            )}
          </div>
          <Typography variant="body1" color="secondary">
            {t('alerts.description')}
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant="caption" color="tertiary">
                {stats.total} {t('alerts.total')}
              </Typography>
              <Typography variant="caption" color="tertiary">
                •
              </Typography>
              <Typography variant="caption" color="error">
                {stats.critical} {t('alerts.critical')}
              </Typography>
              <Typography variant="caption" color="tertiary">
                •
              </Typography>
              <Typography variant="caption" color="warning">
                {stats.warning} {t('alerts.warnings')}
              </Typography>
            </div>
          </div>
          
          <QuickActions>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateRule}
            >
              <Icon name="plus" size={16} />
              {t('alerts.createRule')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSettings}
            >
              <Icon name="settings" size={16} />
              {t('alerts.settings')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
            >
              <Icon name="download" size={16} />
              {t('common.export')}
            </Button>
          </QuickActions>
        </HeaderRight>
      </AlertsHeader>

      <AlertsContent>
        <AlertCenter
          alerts={alerts}
          loading={loading}
          showStats={true}
          showSearch={true}
          showFilters={true}
          showBulkActions={true}
          onAlertClick={handleAlertClick}
          onAlertAction={handleAlertAction}
          onBulkAction={handleBulkAction}
          onRefresh={handleRefresh}
        />
      </AlertsContent>
    </AlertsContainer>
  );
};

export default Alerts;