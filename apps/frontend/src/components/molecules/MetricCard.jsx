import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import { useI18n } from '../../hooks/useI18n';

const CardContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['variant', 'clickable'].includes(prop),
})`
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
  border-radius: ${props => props.theme?.spacing?.[3] || '12px'};
  padding: ${props => props.theme?.spacing?.[6] || '24px'};
  position: relative;
  overflow: hidden;
  transition: all ${props => props.theme?.animation?.duration?.fast || '150ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
  
  &.metric-card {
    /* Print-specific styles are handled in global CSS */
  }
  
  &:hover {
    border-color: ${props => props.theme?.colors?.border?.strong || '#cbd5e1'};
    box-shadow: ${props => props.theme?.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
  }
  
  ${props => props.clickable && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
    }
  `}
  
  ${props => props.variant === 'compact' && css`
    padding: ${props.theme?.spacing?.[4] || '16px'};
  `}
  
  ${props => props.variant === 'featured' && css`
    background: linear-gradient(135deg, ${props.theme?.colors?.primary?.[600] || '#0284c7'}, ${props.theme?.colors?.primary?.[700] || '#0369a1'});
    border-color: ${props.theme?.colors?.primary?.[500] || '#0ea5e9'};
    color: ${props.theme?.colors?.text?.inverse || '#ffffff'};
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme?.spacing?.[4] || '16px'};
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '8px'};
  flex: 1;
  min-width: 0;
`;

const CardIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'color'].includes(prop),
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme?.spacing?.[2] || '8px'};
  background: ${props => getIconBackground(props.color, props.theme)};
  color: ${props => getIconColor(props.color, props.theme)};
  flex-shrink: 0;
  
  ${props => props.variant === 'compact' && css`
    width: 32px;
    height: 32px;
  `}
  
  ${props => props.variant === 'featured' && css`
    background: rgba(255, 255, 255, 0.2);
    color: ${props.theme?.colors?.text?.inverse || '#ffffff'};
  `}
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '8px'};
`;

const MetricValue = styled.div`
  margin-bottom: ${props => props.theme?.spacing?.[2] || '8px'};
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[1] || '4px'};
  margin-bottom: ${props => props.theme?.spacing?.[3] || '12px'};
`;

const TrendIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['trend'].includes(prop),
})`
  display: flex;
  align-items: center;
  color: ${props => getTrendColor(props.trend, props.theme)};
`;

const MetricFooter = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop),
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  ${props => props.variant === 'compact' && css`
    margin-top: ${props.theme?.spacing?.[2] || '8px'};
  `}
`;

const MetricMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[4] || '16px'};
`;

const MetricDetail = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[1] || '4px'};
  opacity: 0.8;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme?.colors?.gray?.[200] || '#e2e8f0'};
  border-radius: 2px;
  overflow: hidden;
  margin-top: ${props => props.theme?.spacing?.[3] || '12px'};
`;

const ProgressFill = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop)
})`
  height: 100%;
  background: ${props => getProgressColor(props.status, props.theme)};
  border-radius: 2px;
`;

const SparklineContainer = styled.div`
  height: 32px;
  margin-top: ${props => props.theme?.spacing?.[2] || '8px'};
  opacity: 0.6;
`;

const getIconBackground = (color, theme) => {
  const backgrounds = {
    primary: theme?.colors?.primary?.[100] || '#e0f2fe',
    success: theme?.colors?.green?.[100] || '#dcfce7',
    warning: theme?.colors?.yellow?.[100] || '#fef3c7',
    error: theme?.colors?.red?.[100] || '#fee2e2',
    info: theme?.colors?.primary?.[100] || '#e0f2fe'
  };
  return backgrounds[color] || theme?.colors?.gray?.[100] || '#f1f5f9';
};

const getIconColor = (color, theme) => {
  const colors = {
    primary: theme?.colors?.primary?.[600] || '#0284c7',
    success: theme?.colors?.green?.[600] || '#16a34a',
    warning: theme?.colors?.yellow?.[600] || '#d97706',
    error: theme?.colors?.red?.[600] || '#dc2626',
    info: theme?.colors?.primary?.[600] || '#0284c7'
  };
  return colors[color] || theme?.colors?.gray?.[600] || '#475569';
};

const getTrendColor = (trend, theme) => {
  const colors = {
    up: theme?.colors?.green?.[600] || '#16a34a',
    down: theme?.colors?.red?.[600] || '#dc2626',
    neutral: theme?.colors?.gray?.[500] || '#64748b'
  };
  return colors[trend] || theme?.colors?.gray?.[500] || '#64748b';
};

const getTrendIcon = (trend) => {
  const icons = {
    up: 'trending',
    down: 'arrowDown',
    neutral: 'arrowRight'
  };
  return icons[trend] || 'arrowRight';
};

const getProgressColor = (status, theme) => {
  const colors = {
    success: theme?.colors?.green?.[500] || '#22c55e',
    warning: theme?.colors?.yellow?.[500] || '#eab308',
    error: theme?.colors?.red?.[500] || '#ef4444',
    info: theme?.colors?.primary?.[500] || '#0ea5e9'
  };
  return colors[status] || theme?.colors?.primary?.[500] || '#0ea5e9';
};

const formatValue = (value, format = 'number') => {
  if (typeof value !== 'number') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
      
    case 'percentage':
      return `${value.toFixed(1)}%`;
      
    case 'compact':
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toString();
      
    default:
      return new Intl.NumberFormat().format(value);
  }
};

const formatChange = (change, format = 'percentage') => {
  if (typeof change !== 'number') return change;
  
  const sign = change > 0 ? '+' : '';
  
  switch (format) {
    case 'percentage':
      return `${sign}${change.toFixed(1)}%`;
    case 'number':
      return `${sign}${formatValue(change, 'compact')}`;
    default:
      return `${sign}${change}`;
  }
};

const MetricCard = ({
  title,
  value,
  valueFormat = 'number',
  change,
  changeFormat = 'percentage',
  trend = 'neutral',
  icon,
  iconColor = 'primary',
  variant = 'default',
  badge,
  target,
  progress,
  progressStatus = 'info',
  sparkline,
  footer,
  lastUpdated,
  clickable = false,
  onClick,
  className,
  children,
  ...props
}) => {
  const { t } = useI18n();
  const hasChange = change !== undefined && change !== null;
  const hasProgress = progress !== undefined && progress !== null;
  const formattedValue = formatValue(value, valueFormat);
  const formattedChange = hasChange ? formatChange(change, changeFormat) : null;

  return (
    <CardContainer
      variant={variant}
      clickable={clickable}
      onClick={onClick}
      className={`metric-card ${className || ''}`}
      whileHover={clickable ? { y: -2 } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      {...props}
    >
      <CardHeader>
        <CardTitle>
          {icon && (
            <CardIcon color={iconColor} variant={variant}>
              <Icon name={icon} size={variant === 'compact' ? 18 : 20} />
            </CardIcon>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant={variant === 'compact' ? 'body2' : 'subtitle2'} 
              color={variant === 'featured' ? 'inverse' : 'secondary'}
              truncate
            >
              {title}
            </Typography>
            {badge && (
              <div style={{ marginTop: '4px' }}>
                <Badge variant={variant === 'featured' ? 'ghost' : 'secondary'} size="sm">
                  {badge}
                </Badge>
              </div>
            )}
          </div>
        </CardTitle>

        <CardActions>
          {target && (
            <Typography 
              variant="caption" 
              color={variant === 'featured' ? 'inverse' : 'tertiary'}
            >
              Target: {formatValue(target, valueFormat)}
            </Typography>
          )}
        </CardActions>
      </CardHeader>

      <MetricValue>
        <Typography 
          variant={variant === 'compact' ? 'h5' : 'h3'} 
          weight="bold"
          color={variant === 'featured' ? 'inverse' : 'primary'}
        >
          {formattedValue}
        </Typography>
      </MetricValue>

      {hasChange && (
        <MetricChange>
          <TrendIcon trend={trend}>
            <Icon name={getTrendIcon(trend)} size={16} />
          </TrendIcon>
          <Typography 
            variant="body2" 
            weight="medium"
            color={variant === 'featured' ? 'inverse' : getTrendColor(trend, props.theme)}
          >
            {formattedChange}
          </Typography>
          <Typography 
            variant="caption" 
            color={variant === 'featured' ? 'inverse' : 'tertiary'}
          >
            {t('common.vsLastPeriod')}
          </Typography>
        </MetricChange>
      )}

      {hasProgress && (
        <ProgressBar>
          <ProgressFill
            status={progressStatus}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </ProgressBar>
      )}

      {sparkline && (
        <SparklineContainer>
          {sparkline}
        </SparklineContainer>
      )}

      {children && (
        <div style={{ marginTop: variant === 'compact' ? '12px' : '16px' }}>
          {children}
        </div>
      )}

      {(footer || lastUpdated) && (
        <MetricFooter variant={variant}>
          <MetricMeta>
            {footer && (
              <Typography 
                variant="caption" 
                color={variant === 'featured' ? 'inverse' : 'tertiary'}
              >
                {footer}
              </Typography>
            )}
          </MetricMeta>
          
          {lastUpdated && (
            <MetricDetail>
              <Icon name="clock" size={12} />
              <Typography 
                variant="caption" 
                color={variant === 'featured' ? 'inverse' : 'tertiary'}
              >
                {lastUpdated}
              </Typography>
            </MetricDetail>
          )}
        </MetricFooter>
      )}
    </CardContainer>
  );
};

export default MetricCard;