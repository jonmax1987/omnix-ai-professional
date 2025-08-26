import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import { useI18n } from '../../hooks/useI18n';

const migrationFlow = keyframes`
  0% {
    transform: translateX(-100%) scale(0.5);
    opacity: 0;
  }
  50% {
    opacity: 1;
    transform: translateX(0%) scale(1);
  }
  100% {
    transform: translateX(100%) scale(0.5);
    opacity: 0;
  }
`;

const TrackerContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TrackerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[50]}, ${props => props.theme.colors.green[50]});
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const MigrationIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.green[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
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
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const TimeOption = styled(motion.button)`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  white-space: nowrap;
  
  &:hover {
    color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  }
`;

const MigrationStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.background.elevated};
  }
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getStatColor(props.type, props.theme)};
  line-height: 1;
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MigrationContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MigrationFlow = styled.div`
  padding: ${props => props.theme.spacing[6]};
  overflow-x: auto;
  min-height: 400px;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
    min-height: 300px;
  }
`;

const FlowDiagram = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing[6]};
  min-width: 800px;
  position: relative;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${props => props.theme.spacing[4]};
    min-width: 600px;
  }
`;

const SegmentNode = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.elevated};
  border: 2px solid ${props => props.color || props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  position: relative;
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    border-color: ${props => props.color};
    box-shadow: 0 0 20px ${props => props.color}30;
    transform: translateY(-2px);
  }
  
  ${props => props.selected && css`
    border-color: ${props.color};
    box-shadow: 0 0 20px ${props.color}40;
    background: ${props.color}10;
  `}
`;

const SegmentIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.md};
`;

const SegmentName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const SegmentCount = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SegmentChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => getTrendColor(props.change, props.theme)};
`;

const MigrationArrow = styled(motion.div)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => getMigrationColor(props.volume, props.theme)};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  z-index: 10;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    width: ${props => Math.max(props.volume * 2, 20)}px;
    height: 2px;
    background: ${props => getMigrationColor(props.volume, props.theme)};
    transform: rotate(${props => props.rotation || 0}deg);
    opacity: 0.7;
  }
  
  &::after {
    content: '→';
    position: absolute;
    color: ${props => getMigrationColor(props.volume, props.theme)};
    font-size: 16px;
    transform: rotate(${props => props.rotation || 0}deg);
  }
`;

const MigrationParticle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${props => props.color};
  pointer-events: none;
  z-index: 5;
`;

const MigrationDetails = styled.div`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  max-height: 300px;
  overflow-y: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const DetailsTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[3]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const MigrationTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const MigrationRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr 1fr;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  align-items: center;
  
  &:hover {
    border-color: ${props => props.theme.colors.border.strong};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const SegmentTag = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const SegmentDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const MigrationVolume = styled.div`
  text-align: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const MigrationPercent = styled.div`
  text-align: center;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => getTrendColor(props.value, props.theme)};
`;

const TimeIndicator = styled.div`
  text-align: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

// Helper functions
const getStatColor = (type, theme) => {
  const colors = {
    upgrades: theme.colors.green[600],
    downgrades: theme.colors.red[600],
    total: theme.colors.primary[600],
    retention: theme.colors.blue[600]
  };
  return colors[type] || theme.colors.text.primary;
};

const getTrendColor = (change, theme) => {
  if (change > 0) return theme.colors.green[600];
  if (change < 0) return theme.colors.red[600];
  return theme.colors.gray[500];
};

const getMigrationColor = (volume, theme) => {
  if (volume >= 100) return theme.colors.green[500];
  if (volume >= 50) return theme.colors.yellow[500];
  if (volume >= 20) return theme.colors.orange[500];
  return theme.colors.red[500];
};

const getSegmentIcon = (segmentId) => {
  const icons = {
    champions: 'crown',
    loyal: 'heart',
    potential: 'trendingUp',
    new: 'userPlus',
    promising: 'star',
    attention: 'alertTriangle',
    sleep: 'moon',
    risk: 'alertCircle'
  };
  return icons[segmentId] || 'users';
};

const SegmentMigrationTracker = ({
  segments = [],
  migrations = [],
  timeRange = '30d',
  onSegmentClick,
  onTimeRangeChange,
  onMigrationClick,
  showAnimation = true,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [particles, setParticles] = useState([]);

  // Default segments and migrations
  const defaultSegments = [
    {
      id: 'champions',
      name: 'Champions',
      color: '#10B981',
      customers: 1247,
      change: 8.5
    },
    {
      id: 'loyal',
      name: 'Loyal',
      color: '#3B82F6',
      customers: 2156,
      change: 5.2
    },
    {
      id: 'potential',
      name: 'Potential',
      color: '#8B5CF6',
      customers: 1834,
      change: 15.7
    },
    {
      id: 'risk',
      name: 'At Risk',
      color: '#EF4444',
      customers: 534,
      change: -12.4
    }
  ];

  const defaultMigrations = [
    { from: 'potential', to: 'loyal', volume: 127, percentage: 6.9, timeframe: '2 weeks' },
    { from: 'loyal', to: 'champions', volume: 89, percentage: 4.1, timeframe: '3 weeks' },
    { from: 'risk', to: 'potential', volume: 67, percentage: 12.5, timeframe: '1 week' },
    { from: 'loyal', to: 'risk', volume: 45, percentage: 2.1, timeframe: '4 weeks' },
    { from: 'champions', to: 'loyal', volume: 34, percentage: 2.7, timeframe: '5 weeks' },
    { from: 'potential', to: 'risk', volume: 23, percentage: 1.3, timeframe: '6 weeks' }
  ];

  const currentSegments = segments.length > 0 ? segments : defaultSegments;
  const currentMigrations = migrations.length > 0 ? migrations : defaultMigrations;

  const timeOptions = [
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
    { id: '1y', label: '1 year' }
  ];

  const stats = useMemo(() => {
    const upgrades = currentMigrations
      .filter(m => {
        const fromIndex = currentSegments.findIndex(s => s.id === m.from);
        const toIndex = currentSegments.findIndex(s => s.id === m.to);
        return toIndex < fromIndex; // Moving to better segment
      })
      .reduce((sum, m) => sum + m.volume, 0);

    const downgrades = currentMigrations
      .filter(m => {
        const fromIndex = currentSegments.findIndex(s => s.id === m.from);
        const toIndex = currentSegments.findIndex(s => s.id === m.to);
        return toIndex > fromIndex; // Moving to worse segment
      })
      .reduce((sum, m) => sum + m.volume, 0);

    const total = currentMigrations.reduce((sum, m) => sum + m.volume, 0);
    const retention = ((total - downgrades) / total) * 100;

    return {
      upgrades,
      downgrades,
      total,
      retention
    };
  }, [currentMigrations, currentSegments]);

  // Animate migration particles
  useEffect(() => {
    if (!showAnimation) return;

    const interval = setInterval(() => {
      const newParticles = [];
      currentMigrations.forEach((migration, index) => {
        const fromSegment = currentSegments.find(s => s.id === migration.from);
        const toSegment = currentSegments.find(s => s.id === migration.to);
        
        if (fromSegment && toSegment) {
          newParticles.push({
            id: `particle-${index}`,
            color: fromSegment.color,
            from: migration.from,
            to: migration.to
          });
        }
      });
      
      setParticles(newParticles);
    }, 3000);

    return () => clearInterval(interval);
  }, [showAnimation, currentMigrations, currentSegments]);

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    onTimeRangeChange?.(range);
  };

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
    onSegmentClick?.(segment);
  };

  return (
    <TrackerContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <TrackerHeader>
        <HeaderLeft>
          <MigrationIcon
            animate={showAnimation ? { rotate: [0, 360] } : {}}
            transition={{ duration: 8, repeat: showAnimation ? Infinity : 0, ease: 'linear' }}
          >
            <Icon name="gitBranch" size={18} />
          </MigrationIcon>
          <div>
            <Typography variant="h5" weight="semibold">
              Segment Migration Tracker
            </Typography>
            <Typography variant="caption" color="secondary">
              Track customer movement between segments
            </Typography>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <TimeRangeSelector>
            {timeOptions.map(option => (
              <TimeOption
                key={option.id}
                active={selectedTimeRange === option.id}
                onClick={() => handleTimeRangeChange(option.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {option.label}
              </TimeOption>
            ))}
          </TimeRangeSelector>
          
          <Button variant="ghost" size="sm">
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </TrackerHeader>

      <MigrationStats>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue type="total">{stats.total}</StatValue>
          <StatLabel>Total Migrations</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue type="upgrades">{stats.upgrades}</StatValue>
          <StatLabel>Upgrades</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue type="downgrades">{stats.downgrades}</StatValue>
          <StatLabel>Downgrades</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue type="retention">{stats.retention.toFixed(1)}%</StatValue>
          <StatLabel>Net Retention</StatLabel>
        </StatCard>
      </MigrationStats>

      <MigrationContent>
        <MigrationFlow>
          <FlowDiagram>
            {currentSegments.map((segment, index) => (
              <SegmentNode
                key={segment.id}
                color={segment.color}
                selected={selectedSegment?.id === segment.id}
                onClick={() => handleSegmentClick(segment)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <SegmentIcon color={segment.color}>
                  <Icon name={getSegmentIcon(segment.id)} size={24} />
                </SegmentIcon>
                <SegmentName>{segment.name}</SegmentName>
                <SegmentCount>{segment.customers.toLocaleString()}</SegmentCount>
                <SegmentChange change={segment.change}>
                  <Icon 
                    name={segment.change > 0 ? 'trendingUp' : segment.change < 0 ? 'trendingDown' : 'minus'} 
                    size={10} 
                  />
                  {Math.abs(segment.change).toFixed(1)}%
                </SegmentChange>
              </SegmentNode>
            ))}

            {/* Migration particles */}
            <AnimatePresence>
              {particles.map((particle) => (
                <MigrationParticle
                  key={particle.id}
                  color={particle.color}
                  initial={{ x: 0, y: 0, scale: 0 }}
                  animate={{ 
                    x: [0, 100, 200, 300], 
                    y: [0, -20, 20, 0],
                    scale: [0, 1, 1, 0] 
                  }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              ))}
            </AnimatePresence>
          </FlowDiagram>
        </MigrationFlow>

        <MigrationDetails>
          <DetailsTitle>
            <Icon name="arrowRightLeft" size={20} />
            Migration Details ({selectedTimeRange})
          </DetailsTitle>
          
          <MigrationTable>
            {currentMigrations.map((migration, index) => {
              const fromSegment = currentSegments.find(s => s.id === migration.from);
              const toSegment = currentSegments.find(s => s.id === migration.to);
              
              return (
                <MigrationRow
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => onMigrationClick?.(migration)}
                >
                  <SegmentTag>
                    <SegmentDot color={fromSegment?.color} />
                    {fromSegment?.name}
                  </SegmentTag>
                  
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Icon name="arrowRight" size={16} />
                  </div>
                  
                  <SegmentTag>
                    <SegmentDot color={toSegment?.color} />
                    {toSegment?.name}
                  </SegmentTag>
                  
                  <MigrationVolume>{migration.volume}</MigrationVolume>
                  
                  <MigrationPercent value={migration.percentage}>
                    {migration.percentage}%
                  </MigrationPercent>
                  
                  <TimeIndicator>{migration.timeframe}</TimeIndicator>
                </MigrationRow>
              );
            })}
          </MigrationTable>
        </MigrationDetails>
      </MigrationContent>
    </TrackerContainer>
  );
};

export default SegmentMigrationTracker;