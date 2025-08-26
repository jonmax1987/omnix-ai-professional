import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Spinner from '../atoms/Spinner';
import { exportChartAsImage } from '../../utils/exportUtils';
import { useI18n } from '../../hooks/useI18n';

const ChartWrapper = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['fullScreen'].includes(prop),
})`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  position: relative;
  
  &.chart-container {
    /* Print-specific styles are handled in global CSS */
  }
  
  ${props => props.fullScreen && css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    border-radius: 0;
  `}
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  flex: 1;
  min-width: 0;
`;

const ChartTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
  min-width: 0;
`;

const ChartIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getChartIconBackground(props.type, props.theme)};
  color: ${props => getChartIconColor(props.type, props.theme)};
  flex-shrink: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const TimeRangeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
`;

const TimeRangeButton = styled(Button).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop),
}).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  border-radius: 0;
  border: none;
  
  ${props => props.active && css`
    background: ${props.theme.colors.primary[100]};
    color: ${props.theme.colors.primary[700]};
  `}
`;

const ChartContent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['minHeight'].includes(prop),
})`
  flex: 1;
  padding: ${props => props.theme.spacing[4]};
  position: relative;
  min-height: ${props => props.minHeight || '300px'};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]};
    min-height: ${props => props.minHeight || '250px'};
  }
`;

const ChartArea = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  
  ${props => props.aspectRatio && css`
    aspect-ratio: ${props.aspectRatio};
  `}
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[3]};
  height: 100%;
  min-height: 200px;
  color: ${props => props.theme.colors.text.tertiary};
  text-align: center;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[3]};
  height: 100%;
  min-height: 200px;
  color: ${props => props.theme.colors.text.tertiary};
  text-align: center;
`;

const ChartFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    flex-direction: column;
    gap: ${props => props.theme.spacing[2]};
    align-items: flex-start;
  }
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  flex-wrap: wrap;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    gap: ${props => props.theme.spacing[2]};
  }
`;

const LegendItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['interactive', 'disabled'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  cursor: ${props => props.interactive ? 'pointer' : 'default'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: opacity ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    opacity: ${props => props.interactive && !props.disabled ? 0.8 : 1};
  }
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const ChartActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const ActionButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  padding: ${props => props.theme.spacing[1]};
  min-width: auto;
  width: 32px;
  height: 32px;
`;

const FullScreenOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
`;

const getChartIconBackground = (type, theme) => {
  const backgrounds = {
    line: theme.colors.primary[100],
    bar: theme.colors.green[100],
    pie: theme.colors.yellow[100],
    area: theme.colors.primary[100],
    scatter: theme.colors.red[100],
    doughnut: theme.colors.yellow[100],
    gauge: theme.colors.primary[100],
    heatmap: theme.colors.red[100]
  };
  return backgrounds[type] || theme.colors.gray[100];
};

const getChartIconColor = (type, theme) => {
  const colors = {
    line: theme.colors.primary[600],
    bar: theme.colors.green[600],
    pie: theme.colors.yellow[600],
    area: theme.colors.primary[600],
    scatter: theme.colors.red[600],
    doughnut: theme.colors.yellow[600],
    gauge: theme.colors.primary[600],
    heatmap: theme.colors.red[600]
  };
  return colors[type] || theme.colors.gray[600];
};

const getChartIcon = (type) => {
  const icons = {
    line: 'trending',
    bar: 'analytics',
    pie: 'analytics',
    area: 'trending',
    scatter: 'analytics',
    doughnut: 'analytics',
    gauge: 'analytics',
    heatmap: 'analytics'
  };
  return icons[type] || 'analytics';
};

const TIME_RANGES = [
  { id: '1h', label: '1H' },
  { id: '24h', label: '24H' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: '1y', label: '1Y' }
];

const ChartContainer = ({
  title,
  description,
  type = 'line',
  data,
  loading = false,
  error,
  empty = false,
  emptyMessage,
  errorMessage = 'Failed to load chart data',
  showTimeRange = false,
  timeRange = '24h',
  onTimeRangeChange,
  showLegend = false,
  legend = [],
  onLegendClick,
  exportable = false,
  fullScreenable = false,
  refreshable = false,
  onRefresh,
  onExport,
  minHeight = '300px',
  aspectRatio,
  lastUpdated,
  badge,
  className,
  children,
  ...props
}) => {
  const { t } = useI18n();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [legendState, setLegendState] = useState(
    legend.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
  );
  const chartRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreen]);

  const handleLegendItemClick = (itemId) => {
    if (onLegendClick) {
      const newState = { ...legendState, [itemId]: !legendState[itemId] };
      setLegendState(newState);
      onLegendClick(itemId, newState[itemId]);
    }
  };

  const handleExport = (format = 'png') => {
    if (chartRef.current) {
      const filename = `${title || 'chart'}-${new Date().toISOString().split('T')[0]}.${format}`;
      exportChartAsImage(chartRef.current, filename, format, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
      });
    }
    
    // Call custom export handler if provided
    onExport?.(chartRef.current, format);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const chartContent = () => {
    if (loading) {
      return (
        <LoadingOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Spinner size={32} />
            <Typography variant="body2" color="secondary">
              Loading chart data...
            </Typography>
          </div>
        </LoadingOverlay>
      );
    }

    if (error) {
      return (
        <ErrorState>
          <Icon name="error" size={48} />
          <div>
            <Typography variant="subtitle1" weight="medium">
              Chart Error
            </Typography>
            <Typography variant="body2" color="secondary">
              {errorMessage}
            </Typography>
          </div>
          {refreshable && (
            <Button variant="secondary" size="sm" onClick={onRefresh}>
              <Icon name="refresh" size={16} />
              Retry
            </Button>
          )}
        </ErrorState>
      );
    }

    if (empty || !data || (Array.isArray(data) && data.length === 0)) {
      return (
        <EmptyState>
          <Icon name="analytics" size={48} />
          <div>
            <Typography variant="subtitle1" weight="medium">
              {t('common.noData')}
            </Typography>
            <Typography variant="body2" color="secondary">
              {emptyMessage || t('common.noDataAvailable')}
            </Typography>
          </div>
        </EmptyState>
      );
    }

    return (
      <ChartArea ref={chartRef} aspectRatio={aspectRatio}>
        {children}
      </ChartArea>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isFullScreen && (
          <FullScreenOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullScreen(false)}
          />
        )}
      </AnimatePresence>

      <ChartWrapper
        fullScreen={isFullScreen}
        className={`chart-container ${className || ''}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          ...(isFullScreen && {
            x: 0,
            y: 0,
            width: '100vw',
            height: '100vh'
          })
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        {...props}
      >
        <ChartHeader>
          <HeaderLeft>
            <ChartTitle>
              <ChartIcon type={type}>
                <Icon name={getChartIcon(type)} size={18} />
              </ChartIcon>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" weight="semibold" truncate>
                  {title}
                </Typography>
                {description && (
                  <Typography variant="body2" color="secondary" truncate>
                    {description}
                  </Typography>
                )}
              </div>
              {badge && (
                <Badge variant="secondary" size="sm">
                  {badge}
                </Badge>
              )}
            </ChartTitle>
          </HeaderLeft>

          <HeaderRight>
            {showTimeRange && (
              <TimeRangeSelector>
                {TIME_RANGES.map(range => (
                  <TimeRangeButton
                    key={range.id}
                    active={timeRange === range.id}
                    onClick={() => onTimeRangeChange?.(range.id)}
                  >
                    {range.label}
                  </TimeRangeButton>
                ))}
              </TimeRangeSelector>
            )}

            <ChartActions>
              {refreshable && (
                <ActionButton
                  onClick={onRefresh}
                  disabled={loading}
                  title="Refresh"
                >
                  <Icon name="refresh" size={16} />
                </ActionButton>
              )}

              {exportable && (
                <ActionButton
                  onClick={() => handleExport('png')}
                  title={t('common.export')}
                >
                  <Icon name="download" size={16} />
                </ActionButton>
              )}

              {fullScreenable && (
                <ActionButton
                  onClick={toggleFullScreen}
                  title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                >
                  <Icon name={isFullScreen ? 'close' : 'eye'} size={16} />
                </ActionButton>
              )}
            </ChartActions>
          </HeaderRight>
        </ChartHeader>

        <ChartContent minHeight={minHeight}>
          <AnimatePresence mode="wait">
            {chartContent()}
          </AnimatePresence>
        </ChartContent>

        {(showLegend && legend.length > 0) || lastUpdated ? (
          <ChartFooter>
            {showLegend && legend.length > 0 && (
              <Legend>
                {legend.map(item => (
                  <LegendItem
                    key={item.id}
                    interactive={!!onLegendClick}
                    disabled={!legendState[item.id]}
                    onClick={() => handleLegendItemClick(item.id)}
                    whileHover={onLegendClick ? { scale: 1.02 } : undefined}
                  >
                    <LegendColor color={item.color} />
                    <Typography variant="caption" color="secondary">
                      {item.label}
                    </Typography>
                  </LegendItem>
                ))}
              </Legend>
            )}

            {lastUpdated && (
              <Typography variant="caption" color="tertiary">
                {t('common.lastUpdatedLabel')} {lastUpdated}
              </Typography>
            )}
          </ChartFooter>
        ) : null}
      </ChartWrapper>
    </>
  );
};

export default ChartContainer;