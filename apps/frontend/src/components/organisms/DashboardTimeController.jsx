import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import TimeViewToggle from '../molecules/TimeViewToggle';
import { useI18n } from '../../hooks/useI18n';

const ControllerContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  
  ${props => props.compact && css`
    padding: ${props.theme.spacing[3]} ${props.theme.spacing[4]};
    gap: ${props.theme.spacing[3]};
  `}
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    gap: ${props.theme.spacing[3]};
  }
`;

const ControllerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const TimeIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.primary[600]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    align-self: flex-end;
  }
`;

const TimeStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.isLive ? props.theme.colors.green[50] : props.theme.colors.gray[50]};
  border: 1px solid ${props => props.isLive ? props.theme.colors.green[200] : props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.isLive ? props.theme.colors.green[700] : props.theme.colors.gray[700]};
`;

const LiveDot = styled(motion.div)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.theme.colors.green[500]};
`;

const MainControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const TimeControls = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    justify-content: flex-start;
  }
`;

const ActionControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const CustomRangeButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.secondary};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.background.elevated};
    color: ${props => props.theme.colors.text.primary};
    border-color: ${props => props.theme.colors.border.strong};
  }
`;

const QuickStats = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${props => props.theme.spacing[2]};
    padding: ${props => props.theme.spacing[2]};
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.2;
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: ${props => props.theme.spacing[1]};
`;

const AdvancedOptions = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
`;

const OptionToggle = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.active ? props.theme.colors.primary[300] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? props.theme.colors.primary[50] : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary[700] : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[100] : props.theme.colors.background.elevated};
    color: ${props => props.active ? props.theme.colors.primary[700] : props.theme.colors.text.primary};
  }
`;

const DateRangeInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
`;

const AutoRefreshCounter = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.blue[50]};
  border: 1px solid ${props => props.theme.colors.blue[200]};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.blue[700]};
`;

const DashboardTimeController = ({
  defaultView = 'day',
  views = [],
  onChange,
  onRefresh,
  showStats = true,
  showAdvanced = false,
  autoRefresh = false,
  autoRefreshInterval = 30,
  compact = false,
  allowCustomRange = true,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [currentView, setCurrentView] = useState(defaultView);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);
  const [refreshCounter, setRefreshCounter] = useState(autoRefreshInterval);
  const [advancedOptions, setAdvancedOptions] = useState({
    compare: false,
    forecast: false,
    aggregate: true,
    realtime: false
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const interval = setInterval(() => {
      setRefreshCounter(prev => {
        if (prev <= 1) {
          handleRefresh();
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, autoRefreshInterval]);

  // Live status detection
  useEffect(() => {
    setIsLive(currentView === 'realtime' || currentView === '1h' || advancedOptions.realtime);
  }, [currentView, advancedOptions.realtime]);

  const handleViewChange = useCallback((viewId) => {
    setCurrentView(viewId);
    setLastUpdate(new Date());
    onChange?.(viewId);
  }, [onChange]);

  const handleRefresh = useCallback(() => {
    setLastUpdate(new Date());
    setRefreshCounter(autoRefreshInterval);
    onRefresh?.(currentView);
  }, [onRefresh, currentView, autoRefreshInterval]);

  const toggleAdvancedOption = useCallback((option) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(prev => !prev);
    setRefreshCounter(autoRefreshInterval);
  }, [autoRefreshInterval]);

  // Mock stats based on current view
  const stats = useMemo(() => {
    const baseStats = {
      dataPoints: 0,
      range: '',
      lastUpdate: lastUpdate,
      coverage: '100%'
    };

    switch (currentView) {
      case 'realtime':
      case '1h':
        return { ...baseStats, dataPoints: 3600, range: 'Real-time' };
      case '6h':
        return { ...baseStats, dataPoints: 360, range: '6 hours' };
      case 'day':
      case '24h':
        return { ...baseStats, dataPoints: 144, range: '24 hours' };
      case 'week':
      case '7d':
        return { ...baseStats, dataPoints: 168, range: '7 days' };
      case 'month':
      case '30d':
        return { ...baseStats, dataPoints: 720, range: '30 days' };
      case '90d':
        return { ...baseStats, dataPoints: 2160, range: '90 days' };
      default:
        return { ...baseStats, dataPoints: 144, range: currentView };
    }
  }, [currentView, lastUpdate]);

  const formatLastUpdate = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <ControllerContainer
      compact={compact}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      {...props}
    >
      <ControllerHeader>
        <HeaderLeft>
          <TimeIcon
            animate={isLive ? { rotate: [0, 360] } : {}}
            transition={{ duration: 2, repeat: isLive ? Infinity : 0, ease: 'linear' }}
          >
            <Icon name={isLive ? 'activity' : 'clock'} size={18} />
          </TimeIcon>
          <div>
            <Typography variant={compact ? "h6" : "h5"} weight="semibold">
              Time Range Control
            </Typography>
            <Typography variant="caption" color="secondary">
              Data updated {formatLastUpdate(lastUpdate)}
            </Typography>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <TimeStatus isLive={isLive}>
            {isLive && (
              <LiveDot
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            {isLive ? 'Live' : 'Historical'}
          </TimeStatus>

          {autoRefreshEnabled && (
            <AutoRefreshCounter
              key={refreshCounter}
              initial={{ scale: 1 }}
              animate={{ scale: refreshCounter <= 5 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              <Icon name="refresh" size={12} />
              <span>{refreshCounter}s</span>
            </AutoRefreshCounter>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoRefresh}
            title={autoRefreshEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            <Icon 
              name={autoRefreshEnabled ? 'pause' : 'play'} 
              size={16} 
            />
          </Button>
        </HeaderRight>
      </ControllerHeader>

      <MainControls>
        <TimeControls>
          <TimeViewToggle
            value={currentView}
            onChange={handleViewChange}
            size={compact ? 'sm' : 'md'}
            type="extended"
            showMeta={!compact}
            showRefresh={true}
            onRefresh={handleRefresh}
          />
        </TimeControls>

        <ActionControls>
          {allowCustomRange && (
            <CustomRangeButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon name="calendar" size={16} />
              Custom Range
            </CustomRangeButton>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAdvanced(prev => !prev)}
          >
            <Icon name="settings" size={16} />
            {compact ? '' : 'Options'}
          </Button>
        </ActionControls>
      </MainControls>

      {showStats && (
        <QuickStats
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <StatItem>
            <StatValue>{stats.dataPoints.toLocaleString()}</StatValue>
            <StatLabel>Data Points</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.range}</StatValue>
            <StatLabel>Time Range</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.coverage}</StatValue>
            <StatLabel>Coverage</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{isLive ? 'Live' : 'Historical'}</StatValue>
            <StatLabel>Data Type</StatLabel>
          </StatItem>
        </QuickStats>
      )}

      <AnimatePresence>
        {showAdvanced && (
          <AdvancedOptions
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OptionToggle
              active={advancedOptions.compare}
              onClick={() => toggleAdvancedOption('compare')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon name="gitCompare" size={12} />
              Compare Periods
            </OptionToggle>

            <OptionToggle
              active={advancedOptions.forecast}
              onClick={() => toggleAdvancedOption('forecast')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon name="trending-up" size={12} />
              Show Forecast
            </OptionToggle>

            <OptionToggle
              active={advancedOptions.aggregate}
              onClick={() => toggleAdvancedOption('aggregate')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon name="barChart3" size={12} />
              Data Aggregation
            </OptionToggle>

            <OptionToggle
              active={advancedOptions.realtime}
              onClick={() => toggleAdvancedOption('realtime')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon name="activity" size={12} />
              Real-time Mode
            </OptionToggle>
          </AdvancedOptions>
        )}
      </AnimatePresence>

      <DateRangeInfo>
        <Icon name="calendar" size={16} />
        <span>
          Showing data from{' '}
          <strong>
            {new Date(Date.now() - getDurationInMs(currentView)).toLocaleDateString()}
          </strong>
          {' '}to{' '}
          <strong>
            {new Date().toLocaleDateString()}
          </strong>
        </span>
      </DateRangeInfo>
    </ControllerContainer>
  );
};

// Helper function to convert view to milliseconds
const getDurationInMs = (view) => {
  const durations = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  };
  
  return durations[view] || durations['24h'];
};

export default DashboardTimeController;