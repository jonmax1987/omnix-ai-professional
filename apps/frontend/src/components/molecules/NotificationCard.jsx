// NotificationCard Molecule
// Implementation of MOL-008: NotificationCard with action buttons
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Avatar from '../atoms/Avatar';
import { useI18n } from '../../hooks/useI18n';

// Notification types
export const NotificationTypes = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SYSTEM: 'system',
  AI_INSIGHT: 'ai_insight',
  INVENTORY: 'inventory',
  COST: 'cost',
  BATCH: 'batch'
};

// Notification priorities
export const NotificationPriorities = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const NotificationContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['type', 'priority', 'read', 'interactive', 'compact'].includes(prop)
})`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.compact ? props.theme.spacing[3] : props.theme.spacing[4]};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[2]};
  position: relative;
  transition: all 0.2s ease;
  cursor: ${props => props.interactive ? 'pointer' : 'default'};
  
  ${props => props.read && css`
    opacity: 0.7;
    background: ${props.theme.colors.background};
  `}
  
  ${props => props.interactive && css`
    &:hover {
      background: ${props.theme.colors.background};
      border-color: ${props.theme.colors.primary};
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  `}
  
  ${props => getNotificationTypeStyles(props.type, props.theme)}
  ${props => getNotificationPriorityStyles(props.priority, props.theme)}
  
  @media print {
    break-inside: avoid;
    border: 1px solid #ccc;
    background: white;
  }
`;

const NotificationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const NotificationTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
  min-width: 0;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-shrink: 0;
`;

const NotificationBody = styled.div`
  margin-bottom: ${props => props.theme.spacing[3]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const NotificationFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[3]};
  padding-top: ${props => props.theme.spacing[3]};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  
  ${props => props.theme.breakpoints.mobile} {
    flex-wrap: wrap;
  }
`;

const DismissButton = styled(Button)`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
  padding: 4px;
  min-width: auto;
  width: 24px;
  height: 24px;
`;

const UnreadIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
`;

// Styling functions
function getNotificationTypeStyles(type, theme) {
  const styles = {
    [NotificationTypes.INFO]: css`
      border-left: 4px solid ${theme.colors.info};
      
      ${NotificationIcon} {
        background: ${theme.colors.info}20;
        color: ${theme.colors.info};
      }
    `,
    [NotificationTypes.SUCCESS]: css`
      border-left: 4px solid ${theme.colors.success};
      
      ${NotificationIcon} {
        background: ${theme.colors.success}20;
        color: ${theme.colors.success};
      }
    `,
    [NotificationTypes.WARNING]: css`
      border-left: 4px solid ${theme.colors.warning};
      
      ${NotificationIcon} {
        background: ${theme.colors.warning}20;
        color: ${theme.colors.warning};
      }
    `,
    [NotificationTypes.ERROR]: css`
      border-left: 4px solid ${theme.colors.danger};
      
      ${NotificationIcon} {
        background: ${theme.colors.danger}20;
        color: ${theme.colors.danger};
      }
    `,
    [NotificationTypes.SYSTEM]: css`
      border-left: 4px solid ${theme.colors.secondary};
      
      ${NotificationIcon} {
        background: ${theme.colors.secondary}20;
        color: ${theme.colors.secondary};
      }
    `,
    [NotificationTypes.AI_INSIGHT]: css`
      border-left: 4px solid ${theme.colors.gradient.ai.from};
      
      ${NotificationIcon} {
        background: linear-gradient(135deg, ${theme.colors.gradient.ai.from}20, ${theme.colors.gradient.ai.to}20);
        color: ${theme.colors.gradient.ai.from};
      }
    `,
    [NotificationTypes.INVENTORY]: css`
      border-left: 4px solid ${theme.colors.gradient.inventory.from};
      
      ${NotificationIcon} {
        background: linear-gradient(135deg, ${theme.colors.gradient.inventory.from}20, ${theme.colors.gradient.inventory.to}20);
        color: ${theme.colors.gradient.inventory.from};
      }
    `,
    [NotificationTypes.COST]: css`
      border-left: 4px solid ${theme.colors.gradient.cost.from};
      
      ${NotificationIcon} {
        background: linear-gradient(135deg, ${theme.colors.gradient.cost.from}20, ${theme.colors.gradient.cost.to}20);
        color: ${theme.colors.gradient.cost.from};
      }
    `,
    [NotificationTypes.BATCH]: css`
      border-left: 4px solid ${theme.colors.gradient.batch.from};
      
      ${NotificationIcon} {
        background: linear-gradient(135deg, ${theme.colors.gradient.batch.from}20, ${theme.colors.gradient.batch.to}20);
        color: ${theme.colors.gradient.batch.from};
      }
    `
  };

  return styles[type] || styles[NotificationTypes.INFO];
}

function getNotificationPriorityStyles(priority, theme) {
  const styles = {
    [NotificationPriorities.CRITICAL]: css`
      border: 2px solid ${theme.colors.danger};
      box-shadow: 0 0 8px ${theme.colors.danger}40;
      
      ${NotificationIcon} {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `,
    [NotificationPriorities.HIGH]: css`
      border-width: 2px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `
  };

  return styles[priority] || '';
}

function getNotificationIcon(type) {
  const icons = {
    [NotificationTypes.INFO]: 'Info',
    [NotificationTypes.SUCCESS]: 'CheckCircle',
    [NotificationTypes.WARNING]: 'AlertTriangle',
    [NotificationTypes.ERROR]: 'AlertCircle',
    [NotificationTypes.SYSTEM]: 'Settings',
    [NotificationTypes.AI_INSIGHT]: 'Brain',
    [NotificationTypes.INVENTORY]: 'Package',
    [NotificationTypes.COST]: 'DollarSign',
    [NotificationTypes.BATCH]: 'Database'
  };

  return icons[type] || icons[NotificationTypes.INFO];
}

function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * NotificationCard Component
 * Advanced notification card with action buttons and rich metadata
 */
const NotificationCard = ({
  id,
  type = NotificationTypes.INFO,
  priority = NotificationPriorities.MEDIUM,
  title,
  message,
  timestamp,
  read = false,
  avatar = null,
  badge = null,
  actions = [],
  dismissible = true,
  interactive = false,
  compact = false,
  metadata = {},
  onRead = null,
  onDismiss = null,
  onClick = null,
  onActionClick = null,
  className = '',
  ...props
}) => {
  const { t } = useI18n();
  const [isRead, setIsRead] = useState(read);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleClick = useCallback((e) => {
    if (!interactive) return;
    
    // Mark as read if not already
    if (!isRead && onRead) {
      setIsRead(true);
      onRead(id);
    }
    
    if (onClick) {
      onClick(id, e);
    }
  }, [interactive, isRead, onRead, onClick, id]);

  const handleActionClick = useCallback((action, e) => {
    e.stopPropagation(); // Prevent card click
    
    if (onActionClick) {
      onActionClick(action, id, e);
    }
    
    // Execute action callback if provided
    if (action.onClick) {
      action.onClick(id, e);
    }
  }, [onActionClick, id]);

  const handleDismiss = useCallback((e) => {
    e.stopPropagation();
    setIsDismissed(true);
    
    if (onDismiss) {
      onDismiss(id);
    }
  }, [onDismiss, id]);

  const handleReadToggle = useCallback((e) => {
    e.stopPropagation();
    setIsRead(!isRead);
    
    if (onRead) {
      onRead(id);
    }
  }, [isRead, onRead, id]);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <NotificationContainer
        type={type}
        priority={priority}
        read={isRead}
        interactive={interactive}
        compact={compact}
        onClick={handleClick}
        className={`notification-card notification-${type} ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {/* Unread indicator */}
        {!isRead && <UnreadIndicator />}
        
        {/* Dismiss button */}
        {dismissible && (
          <DismissButton
            onClick={handleDismiss}
            variant="ghost"
            size="small"
            aria-label={t('notifications.dismiss')}
          >
            <Icon name="X" size={14} />
          </DismissButton>
        )}

        {/* Icon or Avatar */}
        <NotificationIcon>
          {avatar ? (
            <Avatar
              src={avatar.src}
              alt={avatar.alt}
              fallback={avatar.fallback}
              size="sm"
            />
          ) : (
            <Icon name={getNotificationIcon(type)} size={20} />
          )}
        </NotificationIcon>

        <NotificationContent>
          {/* Header with title and meta */}
          <NotificationHeader>
            <NotificationTitle>
              <Typography variant="subtitle2" weight="medium">
                {title}
              </Typography>
              
              {badge && (
                <Badge
                  variant={badge.variant || 'outline'}
                  color={badge.color}
                  size="sm"
                >
                  {badge.text}
                </Badge>
              )}
            </NotificationTitle>

            <NotificationMeta>
              {priority === NotificationPriorities.CRITICAL && (
                <Badge variant="filled" color="danger" size="sm">
                  {t('notifications.critical')}
                </Badge>
              )}
              {priority === NotificationPriorities.HIGH && (
                <Badge variant="outline" color="warning" size="sm">
                  {t('notifications.high')}
                </Badge>
              )}
            </NotificationMeta>
          </NotificationHeader>

          {/* Message body */}
          {message && (
            <NotificationBody>
              <Typography variant="body2" color="secondary">
                {message}
              </Typography>
            </NotificationBody>
          )}

          {/* Metadata */}
          {Object.keys(metadata).length > 0 && (
            <NotificationBody>
              <MetaInfo>
                {Object.entries(metadata).map(([key, value]) => (
                  <span key={key}>
                    <strong>{key}:</strong> {value}
                  </span>
                ))}
              </MetaInfo>
            </NotificationBody>
          )}

          {/* Footer with actions and timestamp */}
          {(actions.length > 0 || timestamp) && (
            <NotificationFooter>
              <ActionGroup>
                {actions.map((action, index) => (
                  <Button
                    key={action.id || index}
                    onClick={(e) => handleActionClick(action, e)}
                    variant={action.variant || 'outline'}
                    size="small"
                    color={action.color}
                    disabled={action.disabled}
                    loading={action.loading}
                  >
                    {action.icon && <Icon name={action.icon} size={14} />}
                    {action.label}
                  </Button>
                ))}
                
                {/* Quick read toggle */}
                {!compact && (
                  <Button
                    onClick={handleReadToggle}
                    variant="ghost"
                    size="small"
                  >
                    <Icon name={isRead ? 'Mail' : 'MailOpen'} size={14} />
                    {isRead ? t('notifications.markUnread') : t('notifications.markRead')}
                  </Button>
                )}
              </ActionGroup>

              {timestamp && (
                <MetaInfo>
                  <Icon name="Clock" size={12} />
                  {formatTimeAgo(timestamp)}
                </MetaInfo>
              )}
            </NotificationFooter>
          )}
        </NotificationContent>
      </NotificationContainer>
    </AnimatePresence>
  );
};

export default NotificationCard;