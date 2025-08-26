import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import { useI18n } from '../../hooks/useI18n';

const AlertContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['severity', 'variant', 'read', 'dismissible', 'badge', 'category', 'timestamp', 'actions'].includes(prop)
})`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.spacing[2]};
  border-left: 4px solid;
  position: relative;
  
  &.alert-card {
    /* Print-specific styles are handled in global CSS */
  }
  
  ${props => getAlertSeverityStyles(props.severity, props.theme)}
  
  ${props => props.variant === 'filled' && css`
    border-left: none;
    color: ${props.theme.colors.text.inverse};
  `}
  
  ${props => props.variant === 'outlined' && css`
    border: 1px solid;
    border-left: 4px solid;
  `}
`;

const AlertIcon = styled.div`
  flex-shrink: 0;
  margin-top: 2px;
`;

const AlertContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AlertHeader = styled.div.withConfig({
  shouldForwardProp: (prop) => !['hasDescription'].includes(prop),
})`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.hasDescription ? props.theme.spacing[1] : 0};
`;

const AlertTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
  min-width: 0;
`;

const AlertActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-shrink: 0;
`;

const DismissButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  padding: ${props => props.theme.spacing[1]};
  min-width: auto;
  height: 24px;
  width: 24px;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const AlertDescription = styled.div`
  margin-top: ${props => props.theme.spacing[2]};
`;

const AlertMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[3]};
  padding-top: ${props => props.theme.spacing[3]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
`;

const AlertTimestamp = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  opacity: 0.8;
`;

const AlertCategory = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const getAlertSeverityStyles = (severity, theme) => {
  const baseStyles = {
    info: css`
      background-color: ${theme.colors.primary[50]};
      border-color: ${theme.colors.primary[500]};
      color: ${theme.colors.primary[800]};
    `,
    success: css`
      background-color: ${theme.colors.green[50]};
      border-color: ${theme.colors.green[500]};
      color: ${theme.colors.green[800]};
    `,
    warning: css`
      background-color: ${theme.colors.yellow[50]};
      border-color: ${theme.colors.yellow[500]};
      color: ${theme.colors.yellow[800]};
    `,
    error: css`
      background-color: ${theme.colors.red[50]};
      border-color: ${theme.colors.red[500]};
      color: ${theme.colors.red[800]};
    `
  };

  const filledStyles = {
    info: css`
      background-color: ${theme.colors.primary[600]};
      border-color: ${theme.colors.primary[700]};
    `,
    success: css`
      background-color: ${theme.colors.green[600]};
      border-color: ${theme.colors.green[700]};
    `,
    warning: css`
      background-color: ${theme.colors.yellow[600]};
      border-color: ${theme.colors.yellow[700]};
    `,
    error: css`
      background-color: ${theme.colors.red[600]};
      border-color: ${theme.colors.red[700]};
    `
  };

  return baseStyles[severity] || baseStyles.info;
};

const getSeverityIcon = (severity) => {
  const icons = {
    info: 'info',
    success: 'checkCircle',
    warning: 'warning',
    error: 'error'
  };
  return icons[severity] || icons.info;
};

const formatTimestamp = (timestamp, t) => {
  if (!timestamp) return null;
  
  const now = new Date();
  const alertTime = new Date(timestamp);
  const diffMs = now - alertTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return t('common.justNow');
  if (diffMins < 60) return `${diffMins}${t('common.minutesAgoShort')}`;
  if (diffHours < 24) return `${diffHours}${t('common.hoursAgoShort')}`;
  if (diffDays < 7) return `${diffDays}${t('common.daysAgoShort')}`;
  
  return alertTime.toLocaleDateString();
};

const AlertCard = ({
  severity = 'info',
  variant = 'default',
  title,
  description,
  children,
  dismissible = false,
  onDismiss,
  actions = [],
  category,
  timestamp,
  badge,
  icon,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    // Delay the onDismiss callback to allow exit animation
    setTimeout(() => onDismiss?.(), 200);
  };

  const severityIcon = icon || getSeverityIcon(severity);
  const hasDescription = description || children;
  const hasMeta = category || timestamp;

  return (
    <AnimatePresence>
      {isVisible && (
        <AlertContainer
          severity={severity}
          variant={variant}
          hasDescription={hasDescription}
          className={`alert-card ${className || ''}`}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          {...props}
        >
          <AlertIcon>
            <Icon name={severityIcon} size={20} />
          </AlertIcon>

          <AlertContent>
            <AlertHeader hasDescription={hasDescription}>
              <AlertTitle>
                <Typography 
                  variant="subtitle2" 
                  weight="medium"
                  truncate
                >
                  {title}
                </Typography>
                {badge && (
                  <Badge variant={severity} size="sm">
                    {badge}
                  </Badge>
                )}
              </AlertTitle>

              <AlertActions>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={action.onClick}
                  >
                    {action.icon && <Icon name={action.icon} size={16} />}
                    {action.label}
                  </Button>
                ))}
                {dismissible && (
                  <DismissButton onClick={handleDismiss}>
                    <Icon name="close" size={16} />
                  </DismissButton>
                )}
              </AlertActions>
            </AlertHeader>

            {hasDescription && (
              <AlertDescription>
                {children || (
                  <Typography variant="body2" lineHeight="1.5">
                    {description}
                  </Typography>
                )}
              </AlertDescription>
            )}

            {hasMeta && (
              <AlertMeta>
                {category && (
                  <AlertCategory>
                    <Icon name="tag" size={14} />
                    <Typography variant="caption" color="secondary">
                      {category}
                    </Typography>
                  </AlertCategory>
                )}
                {timestamp && (
                  <AlertTimestamp>
                    <Icon name="clock" size={14} />
                    <Typography variant="caption" color="secondary">
                      {formatTimestamp(timestamp, t)}
                    </Typography>
                  </AlertTimestamp>
                )}
              </AlertMeta>
            )}
          </AlertContent>
        </AlertContainer>
      )}
    </AnimatePresence>
  );
};

export default AlertCard;