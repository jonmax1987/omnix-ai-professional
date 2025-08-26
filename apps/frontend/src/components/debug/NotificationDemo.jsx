// Notification Demo Component
// Demonstrates NotificationCard functionality with various examples
import React, { useState } from 'react';
import styled from 'styled-components';
import NotificationCard, { NotificationTypes, NotificationPriorities } from '../molecules/NotificationCard';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';

const DemoContainer = styled.div`
  position: fixed;
  top: 120px;
  left: 20px;
  width: 400px;
  max-height: 70vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  ${({ theme }) => theme.breakpoints.mobile} {
    width: calc(100vw - 40px);
    left: 20px;
    right: 20px;
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const ControlsSection = styled.div`
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const NotificationDemo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'ai-insight-1',
      type: NotificationTypes.AI_INSIGHT,
      priority: NotificationPriorities.HIGH,
      title: 'AI Insight Available',
      message: 'Customer segment migration detected: 15 customers moved from "Potential Loyalists" to "Champions" this week.',
      timestamp: Date.now() - 300000, // 5 minutes ago
      read: false,
      badge: { text: 'AI', variant: 'filled', color: 'primary' },
      actions: [
        {
          id: 'view-insight',
          label: 'View Details',
          icon: 'Eye',
          variant: 'outline',
          onClick: (id) => console.log('View insight:', id)
        },
        {
          id: 'apply-suggestion',
          label: 'Apply Suggestion',
          icon: 'CheckCircle',
          variant: 'filled',
          color: 'primary',
          onClick: (id) => console.log('Apply suggestion:', id)
        }
      ],
      metadata: {
        'Confidence': '94%',
        'Impact': 'High'
      }
    },
    {
      id: 'inventory-alert-1',
      type: NotificationTypes.INVENTORY,
      priority: NotificationPriorities.CRITICAL,
      title: 'Critical Stock Alert',
      message: 'Multiple products are approaching stockout. Immediate reordering required.',
      timestamp: Date.now() - 120000, // 2 minutes ago
      read: false,
      actions: [
        {
          id: 'create-order',
          label: 'Create Order',
          icon: 'shopping-cart',
          variant: 'filled',
          color: 'danger',
          onClick: (id) => console.log('Create order:', id)
        },
        {
          id: 'view-items',
          label: 'View Items',
          icon: 'List',
          variant: 'outline',
          onClick: (id) => console.log('View items:', id)
        }
      ],
      metadata: {
        'Affected Items': '12',
        'Estimated Stockout': '2 days'
      }
    },
    {
      id: 'cost-warning-1',
      type: NotificationTypes.COST,
      priority: NotificationPriorities.MEDIUM,
      title: 'Budget Alert',
      message: 'Monthly AI processing costs have reached 80% of budget limit.',
      timestamp: Date.now() - 3600000, // 1 hour ago
      read: false,
      badge: { text: 'Budget', variant: 'outline', color: 'warning' },
      actions: [
        {
          id: 'view-breakdown',
          label: 'View Breakdown',
          icon: 'PieChart',
          variant: 'outline',
          onClick: (id) => console.log('View breakdown:', id)
        },
        {
          id: 'optimize',
          label: 'Optimize Usage',
          icon: 'TrendingDown',
          variant: 'outline',
          color: 'primary',
          onClick: (id) => console.log('Optimize:', id)
        }
      ],
      metadata: {
        'Current': '$800',
        'Budget': '$1,000',
        'Remaining': '$200'
      }
    },
    {
      id: 'batch-complete-1',
      type: NotificationTypes.BATCH,
      priority: NotificationPriorities.MEDIUM,
      title: 'Batch Analysis Complete',
      message: 'Customer segmentation analysis for 1,250 customers has completed successfully.',
      timestamp: Date.now() - 7200000, // 2 hours ago
      read: true,
      actions: [
        {
          id: 'download-results',
          label: 'Download Results',
          icon: 'Download',
          variant: 'outline',
          onClick: (id) => console.log('Download:', id)
        },
        {
          id: 'view-summary',
          label: 'View Summary',
          icon: 'BarChart',
          variant: 'filled',
          color: 'primary',
          onClick: (id) => console.log('View summary:', id)
        }
      ],
      metadata: {
        'Processed': '1,250 customers',
        'Duration': '45 minutes',
        'Success Rate': '99.2%'
      }
    },
    {
      id: 'system-update-1',
      type: NotificationTypes.SYSTEM,
      priority: NotificationPriorities.LOW,
      title: 'System Update Available',
      message: 'A new version of the OMNIX AI system is available with performance improvements.',
      timestamp: Date.now() - 86400000, // 1 day ago
      read: true,
      actions: [
        {
          id: 'view-changelog',
          label: 'View Changes',
          icon: 'FileText',
          variant: 'outline',
          onClick: (id) => console.log('View changelog:', id)
        },
        {
          id: 'schedule-update',
          label: 'Schedule Update',
          icon: 'Calendar',
          variant: 'outline',
          color: 'primary',
          onClick: (id) => console.log('Schedule update:', id)
        }
      ]
    },
    {
      id: 'success-1',
      type: NotificationTypes.SUCCESS,
      priority: NotificationPriorities.LOW,
      title: 'Customer Analysis Updated',
      message: 'Successfully processed 50 new customer profiles.',
      timestamp: Date.now() - 1800000, // 30 minutes ago
      read: true,
      avatar: {
        fallback: 'AI',
        alt: 'AI System'
      }
    }
  ]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '120px',
          left: '20px',
          zIndex: 9998,
          padding: '8px 12px',
          fontSize: '12px'
        }}
      >
        Show Notifications Demo
      </Button>
    );
  }

  const handleNotificationRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  const handleNotificationDismiss = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleActionClick = (action, notificationId, event) => {
    console.log('Action clicked:', { action: action.id, notificationId, event });
  };

  const addNewNotification = (type) => {
    const newNotification = {
      id: `new-${Date.now()}`,
      type,
      priority: NotificationPriorities.MEDIUM,
      title: `New ${type} Notification`,
      message: `This is a dynamically added ${type} notification.`,
      timestamp: Date.now(),
      read: false,
      actions: [
        {
          id: 'test-action',
          label: 'Test Action',
          icon: 'Zap',
          variant: 'outline',
          onClick: (id) => console.log('Test action:', id)
        }
      ]
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAllRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <DemoContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant="h6">Notifications Demo</Typography>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="small"
        >
          ×
        </Button>
      </div>

      <NotificationList>
        {notifications.length === 0 ? (
          <Typography variant="body2" color="secondary" style={{ textAlign: 'center', padding: '20px' }}>
            No notifications to display
          </Typography>
        ) : (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              {...notification}
              onRead={handleNotificationRead}
              onDismiss={handleNotificationDismiss}
              onActionClick={handleActionClick}
              interactive={true}
            />
          ))
        )}
      </NotificationList>

      <ControlsSection>
        <Button
          onClick={() => addNewNotification(NotificationTypes.INFO)}
          size="small"
          variant="outline"
        >
          Add Info
        </Button>
        <Button
          onClick={() => addNewNotification(NotificationTypes.SUCCESS)}
          size="small"
          variant="outline"
        >
          Add Success
        </Button>
        <Button
          onClick={() => addNewNotification(NotificationTypes.WARNING)}
          size="small"
          variant="outline"
        >
          Add Warning
        </Button>
        <Button
          onClick={() => addNewNotification(NotificationTypes.ERROR)}
          size="small"
          variant="outline"
        >
          Add Error
        </Button>
        <Button
          onClick={markAllRead}
          size="small"
          variant="outline"
          color="primary"
        >
          Mark All Read
        </Button>
        <Button
          onClick={clearAll}
          size="small"
          variant="outline"
          color="danger"
        >
          Clear All
        </Button>
      </ControlsSection>
    </DemoContainer>
  );
};

export default NotificationDemo;