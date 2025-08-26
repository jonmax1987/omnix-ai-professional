import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import { useI18n } from '../../hooks/useI18n';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  ${props => props.size === 'lg' && css`
    gap: ${props.theme.spacing[3]};
  `}
  
  ${props => props.orientation === 'vertical' && css`
    flex-direction: column;
    align-items: stretch;
  `}
`;

const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  
  ${props => props.size === 'sm' && css`
    padding: ${props.theme.spacing[0.5]};
    border-radius: ${props.theme.spacing[1]};
  `}
  
  ${props => props.size === 'lg' && css`
    padding: ${props.theme.spacing[1.5]};
    border-radius: ${props.theme.spacing[3]};
  `}
  
  ${props => props.orientation === 'vertical' && css`
    flex-direction: column;
    width: 100%;
  `}
  
  ${props => props.variant === 'outlined' && css`
    background: transparent;
    border: 2px solid ${props.theme.colors.primary[200]};
  `}
  
  ${props => props.variant === 'elevated' && css`
    box-shadow: ${props.theme.shadows.sm};
    border: none;
  `}
`;

const ToggleOption = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => getTogglePadding(props.size, props.theme)};
  border: none;
  border-radius: ${props => getToggleBorderRadius(props.size, props.theme)};
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.secondary};
  font-size: ${props => getToggleFontSize(props.size, props.theme)};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  white-space: nowrap;
  position: relative;
  min-width: ${props => getToggleMinWidth(props.size)};
  
  &:hover {
    color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.background.elevated};
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${props => props.loading && css`
    pointer-events: none;
  `}
  
  ${props => props.orientation === 'vertical' && css`
    width: 100%;
    justify-content: flex-start;
    margin-bottom: ${props.theme.spacing[0.5]};
    
    &:last-child {
      margin-bottom: 0;
    }
  `}
`;

const ToggleIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.iconOnly && css`
    width: 100%;
    height: 100%;
  `}
`;

const ToggleText = styled.span`
  ${props => props.iconOnly && css`
    display: none;
  `}
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    ${props => props.hideOnMobile && css`
      display: none;
    `}
  }
`;

const LoadingSpinner = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border: 1.5px solid transparent;
  border-top: 1.5px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const MetaInfo = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} 0;
  
  ${props => props.orientation === 'vertical' && css`
    justify-content: center;
    padding: ${props.theme.spacing[2]};
    border-top: 1px solid ${props.theme.colors.border.subtle};
    margin-top: ${props.theme.spacing[1]};
  `}
`;

const DataRange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
`;

const RefreshButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
    color: ${props => props.theme.colors.text.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Helper functions
const getTogglePadding = (size, theme) => {
  switch (size) {
    case 'sm':
      return `${theme.spacing[1]} ${theme.spacing[2]}`;
    case 'lg':
      return `${theme.spacing[3]} ${theme.spacing[4]}`;
    default: // md
      return `${theme.spacing[2]} ${theme.spacing[3]}`;
  }
};

const getToggleBorderRadius = (size, theme) => {
  switch (size) {
    case 'sm':
      return theme.spacing[1];
    case 'lg':
      return theme.spacing[2];
    default: // md
      return theme.spacing[1];
  }
};

const getToggleFontSize = (size, theme) => {
  switch (size) {
    case 'sm':
      return theme.typography.fontSize.xs;
    case 'lg':
      return theme.typography.fontSize.base;
    default: // md
      return theme.typography.fontSize.sm;
  }
};

const getToggleMinWidth = (size) => {
  switch (size) {
    case 'sm':
      return '32px';
    case 'lg':
      return '80px';
    default: // md
      return '60px';
  }
};

const getDefaultTimeViews = (type) => {
  const commonViews = {
    basic: [
      { id: 'hour', label: 'Hourly', icon: 'clock' },
      { id: 'day', label: 'Daily', icon: 'calendar' },
      { id: 'week', label: 'Weekly', icon: 'calendarDays' },
      { id: 'month', label: 'Monthly', icon: 'calendarRange' }
    ],
    extended: [
      { id: '1h', label: '1H', icon: 'clock' },
      { id: '6h', label: '6H', icon: 'clock' },
      { id: '24h', label: '24H', icon: 'calendar' },
      { id: '7d', label: '7D', icon: 'calendarDays' },
      { id: '30d', label: '30D', icon: 'calendarRange' },
      { id: '90d', label: '90D', icon: 'calendarRange' }
    ],
    analytics: [
      { id: 'realtime', label: 'Live', icon: 'activity' },
      { id: 'hourly', label: 'Hourly', icon: 'clock' },
      { id: 'daily', label: 'Daily', icon: 'calendar' },
      { id: 'weekly', label: 'Weekly', icon: 'calendarDays' },
      { id: 'monthly', label: 'Monthly', icon: 'calendarRange' },
      { id: 'quarterly', label: 'Quarterly', icon: 'trendingUp' }
    ],
    compact: [
      { id: 'hour', label: 'H', icon: 'clock' },
      { id: 'day', label: 'D', icon: 'calendar' },
      { id: 'week', label: 'W', icon: 'calendarDays' },
      { id: 'month', label: 'M', icon: 'calendarRange' }
    ]
  };
  
  return commonViews[type] || commonViews.basic;
};

const formatDataRange = (view, lastUpdate) => {
  const now = new Date();
  
  const ranges = {
    hour: 'Last 60 minutes',
    '1h': 'Last hour',
    '6h': 'Last 6 hours',
    day: 'Last 24 hours',
    '24h': 'Last 24 hours',
    week: 'Last 7 days',
    '7d': 'Last 7 days',
    month: 'Last 30 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    realtime: 'Live data',
    hourly: 'Hourly aggregation',
    daily: 'Daily aggregation',
    weekly: 'Weekly aggregation',
    monthly: 'Monthly aggregation',
    quarterly: 'Quarterly aggregation'
  };
  
  return ranges[view] || 'Data range';
};

const TimeViewToggle = ({
  views = [],
  defaultView = 'day',
  value,
  onChange,
  size = 'md',
  variant = 'default',
  orientation = 'horizontal',
  showIcons = true,
  showText = true,
  showMeta = false,
  showRefresh = false,
  iconOnly = false,
  hideOnMobile = false,
  loading = false,
  disabled = false,
  onRefresh,
  className,
  type = 'basic',
  ...props
}) => {
  const { t } = useI18n();
  const [selectedView, setSelectedView] = useState(value || defaultView);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const currentViews = views.length > 0 ? views : getDefaultTimeViews(type);
  
  const activeView = useMemo(() => {
    return currentViews.find(view => view.id === selectedView) || currentViews[0];
  }, [currentViews, selectedView]);

  useEffect(() => {
    if (value && value !== selectedView) {
      setSelectedView(value);
    }
  }, [value]);

  const handleViewChange = (viewId) => {
    if (loading || disabled) return;
    
    setSelectedView(viewId);
    onChange?.(viewId);
    setLastUpdate(new Date());
  };

  const handleRefresh = () => {
    if (loading || disabled) return;
    
    setLastUpdate(new Date());
    onRefresh?.(selectedView);
  };

  return (
    <ToggleContainer
      size={size}
      orientation={orientation}
      className={className}
      {...props}
    >
      <ToggleGroup
        size={size}
        variant={variant}
        orientation={orientation}
      >
        {currentViews.map((view, index) => (
          <ToggleOption
            key={view.id}
            size={size}
            active={selectedView === view.id}
            loading={loading}
            disabled={disabled}
            iconOnly={iconOnly}
            hideOnMobile={hideOnMobile}
            orientation={orientation}
            onClick={() => handleViewChange(view.id)}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            transition={{ duration: 0.1 }}
          >
            {loading && selectedView === view.id && <LoadingSpinner />}
            
            {showIcons && (
              <ToggleIcon iconOnly={iconOnly}>
                <Icon name={view.icon} size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
              </ToggleIcon>
            )}
            
            {showText && (
              <ToggleText iconOnly={iconOnly} hideOnMobile={hideOnMobile}>
                {view.label}
              </ToggleText>
            )}
            
            {view.badge && (
              <Badge variant={view.badge.variant || 'secondary'} size="xs">
                {view.badge.content}
              </Badge>
            )}
          </ToggleOption>
        ))}
      </ToggleGroup>

      {showMeta && (
        <AnimatePresence>
          <MetaInfo
            orientation={orientation}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DataRange>
              <Icon name="database" size={12} />
              <span>{formatDataRange(selectedView, lastUpdate)}</span>
            </DataRange>
            
            {showRefresh && (
              <RefreshButton
                onClick={handleRefresh}
                disabled={loading || disabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon 
                  name="refresh" 
                  size={12}
                  style={{
                    animation: loading ? 'spin 1s linear infinite' : 'none'
                  }}
                />
                <span>Refresh</span>
              </RefreshButton>
            )}
          </MetaInfo>
        </AnimatePresence>
      )}
    </ToggleContainer>
  );
};

export default TimeViewToggle;