import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import { withMemoization, withExpensiveComputation } from '../hoc/withMemoization';
import { useDeepMemo, useTrackedMemo, useLRUMemo } from '../../utils/memoization.jsx';

// Real-time data pulse animation
const dataPulseKeyframes = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: ${props => props.height || '500px'};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  position: relative;
  overflow: hidden;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
    height: ${props => props.height || '450px'};
  }
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const ChartTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const LiveIndicator = styled(motion.div)`
  width: 12px;
  height: 12px;
  background: ${props => props.isLive ? '#10B981' : '#6B7280'};
  border-radius: 50%;
  animation: ${props => props.isLive ? dataPulseKeyframes : 'none'} 2s infinite;
`;

const ChartControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const TimeRangeButton = styled.button`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[3]};
  background: ${props => props.active ? props.theme.colors.primary[100] : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary[700] : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.active ? props.theme.colors.primary[300] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.medium : 'normal'};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast};
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[100] : props.theme.colors.background.secondary};
    border-color: ${props => props.active ? props.theme.colors.primary[300] : props.theme.colors.border.strong};
  }
`;

const RevenueStreams = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const StreamCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color};
    border-radius: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[1]} 0 0;
  }
`;

const StreamHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const StreamIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.color}20;
  border-radius: ${props => props.theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StreamData = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const StreamValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${props => props.theme.spacing[1]};
`;

const StreamChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  color: ${props => props.positive ? props.theme.colors.green[600] : props.theme.colors.red[600]};
`;

const ChartArea = styled.div`
  width: 100%;
  height: 280px;
  position: relative;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  overflow: hidden;
`;

const SVGChart = styled.svg`
  width: 100%;
  height: 100%;
`;

const GridLines = styled.g`
  stroke: ${props => props.theme.colors.border.subtle};
  stroke-width: 1;
  opacity: 0.3;
`;

const StreamLine = styled.path`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: ${props => props.highlighted ? 4 : 2.5};
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: ${props => props.dimmed ? 0.3 : 1};
  filter: drop-shadow(0 2px 4px ${props => props.color}40);
  transition: all ${props => props.theme.animation.duration.fast};
`;

const StreamArea = styled.path`
  fill: url(#${props => props.gradientId});
  opacity: ${props => props.dimmed ? 0.1 : 0.3};
  transition: opacity ${props => props.theme.animation.duration.fast};
`;

const RealtimeUpdateOverlay = styled(motion.div)`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.elevated};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: ${props => props.theme.shadows.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  z-index: 10;
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[3]};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 100;
  pointer-events: none;
  min-width: 200px;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[4]};
  margin-top: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
  opacity: ${props => props.dimmed ? 0.5 : 1};
  transition: opacity ${props => props.theme.animation.duration.fast};
  
  &:hover {
    opacity: 1;
  }
`;

const LegendLine = styled.div`
  width: 24px;
  height: 3px;
  background: ${props => props.color};
  border-radius: 2px;
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.text.secondary};
`;

const RevenueStreamChart = ({
  data = [],
  height = '500px',
  timeRange = '24h',
  onTimeRangeChange,
  loading = false,
  realTimeUpdates = true,
  showGrid = true,
  showLegend = true,
  animated = true,
  onStreamHover,
  className,
  ...props
}) => {
  const [activeTimeRange, setActiveTimeRange] = useState(timeRange);
  const [tooltip, setTooltip] = useState(null);
  const [hoveredStream, setHoveredStream] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realtimeData, setRealtimeData] = useState(data);


  // Memoized revenue streams configuration
  const revenueStreamsConfig = useMemo(() => ({
    retail: { name: 'Retail Sales', icon: 'shopping-cart', color: '#3B82F6' },
    online: { name: 'Online Orders', icon: 'globe', color: '#10B981' },
    wholesale: { name: 'Wholesale', icon: 'truck', color: '#F59E0B' },
    subscriptions: { name: 'Subscriptions', icon: 'refresh', color: '#8B5CF6' },
    services: { name: 'Services', icon: 'settings', color: '#EF4444' },
    partnerships: { name: 'Partnerships', icon: 'users', color: '#06B6D4' }
  }), []);

  // Generate mock real-time data using LRU cache for expensive calculations
  const { value: generateMockData } = useTrackedMemo(() => {
    const periods = activeTimeRange === '1h' ? 60 : 
                   activeTimeRange === '24h' ? 24 : 
                   activeTimeRange === '7d' ? 168 : 720; // 30d = 720 hours

    const baseValues = {
      retail: 5000,
      online: 3500,
      wholesale: 2000,
      subscriptions: 1200,
      services: 800,
      partnerships: 600
    };

    return Array.from({ length: periods }, (_, i) => {
      const date = new Date();
      if (activeTimeRange === '1h') {
        date.setMinutes(date.getMinutes() - (periods - 1 - i));
      } else {
        date.setHours(date.getHours() - (periods - 1 - i));
      }
      
      const streams = {};
      Object.keys(revenueStreamsConfig).forEach(streamKey => {
        const progress = i / periods;
        const hourOfDay = date.getHours();
        const dayOfWeek = date.getDay();
        
        // Business hours boost for retail
        const businessHoursMultiplier = streamKey === 'retail' && hourOfDay >= 9 && hourOfDay <= 17 ? 1.5 : 1;
        // Weekend boost for online
        const weekendMultiplier = streamKey === 'online' && (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1;
        // Seasonal trend
        const seasonalTrend = Math.sin((i / 24) * Math.PI * 2) * 0.2;
        // Random noise
        const noise = (Math.random() - 0.5) * 0.1;
        // Growth trend
        const growthTrend = progress * 0.1;
        
        const multiplier = (1 + seasonalTrend + noise + growthTrend) * businessHoursMultiplier * weekendMultiplier;
        streams[streamKey] = Math.max(baseValues[streamKey] * multiplier, baseValues[streamKey] * 0.3);
      });
      
      return {
        timestamp: date.toISOString(),
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        ...streams,
        total: Object.values(streams).reduce((sum, value) => sum + value, 0)
      };
    });
  }, [activeTimeRange], 'mockDataGeneration');

  // Use real data if provided, otherwise use generated data
  const chartData = data.length > 0 ? data : generateMockData;

  // Calculate stream analytics with LRU caching for performance
  const streamAnalytics = useLRUMemo(() => {
    if (chartData.length === 0) return {};
    
    const analytics = {};
    const streamKeys = Object.keys(revenueStreamsConfig);
    
    streamKeys.forEach(streamKey => {
      const values = chartData.map(d => d[streamKey] || 0);
      const current = values[values.length - 1];
      const previous = values[values.length - 2] || current;
      const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      const peak = Math.max(...values);
      const contribution = current / chartData[chartData.length - 1].total * 100;
      
      analytics[streamKey] = {
        current,
        previous,
        change,
        average,
        peak,
        contribution,
        trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable'
      };
    });
    
    return analytics;
  }, [chartData, revenueStreamsConfig], { maxSize: 10, keyGenerator: (deps) => `${deps[0]?.length}-${JSON.stringify(deps[1])}` });

  // Chart dimensions and scaling
  const chartDimensions = useMemo(() => {
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };
    const width = 800;
    const height = 240;
    
    const allValues = chartData.flatMap(d => Object.keys(revenueStreamsConfig).map(key => d[key] || 0));
    const minValue = 0;
    const maxValue = Math.max(...allValues) * 1.1;
    
    const xScale = (index) => padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right);
    const yScale = (value) => padding.top + (1 - (value - minValue) / (maxValue - minValue)) * (height - padding.top - padding.bottom);
    
    return { padding, width, height, minValue, maxValue, xScale, yScale };
  }, [chartData, revenueStreamsConfig]);

  // Generate SVG paths for each stream
  const streamPaths = useMemo(() => {
    if (chartData.length === 0) return {};
    
    const paths = {};
    const { xScale, yScale, height, padding } = chartDimensions;
    
    Object.keys(revenueStreamsConfig).forEach(streamKey => {
      const linePath = chartData
        .map((point, index) => {
          const x = xScale(index);
          const y = yScale(point[streamKey] || 0);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
      
      const areaPath = chartData
        .map((point, index) => {
          const x = xScale(index);
          const y = yScale(point[streamKey] || 0);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ') + 
        ` L ${xScale(chartData.length - 1)} ${height - padding.bottom} L ${xScale(0)} ${height - padding.bottom} Z`;
      
      paths[streamKey] = { linePath, areaPath };
    });
    
    return paths;
  }, [chartData, chartDimensions, revenueStreamsConfig]);

  // Memoized event handlers
  const handleTimeRangeChange = useCallback((range) => {
    setActiveTimeRange(range);
    onTimeRangeChange?.(range);
  }, [onTimeRangeChange]);

  const handleStreamHover = useCallback((streamKey) => {
    setHoveredStream(streamKey);
    onStreamHover?.(streamKey);
  }, [onStreamHover]);

  const handleStreamLeave = useCallback(() => {
    setHoveredStream(null);
    onStreamHover?.(null);
  }, [onStreamHover]);

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In a real app, this would fetch new data from an API
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  // Memoized format currency function
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }, []);

  // Generate grid lines
  const gridLines = useMemo(() => {
    const { width, height, padding } = chartDimensions;
    const lines = [];
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * (height - padding.top - padding.bottom);
      lines.push(
        <line key={`h-${i}`} x1={padding.left} y1={y} x2={width - padding.right} y2={y} />
      );
    }
    
    return lines;
  }, [chartDimensions]);

  const timeRangeOptions = [
    { value: '1h', label: '1H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' }
  ];

  return (
    <ChartContainer height={height} className={className} {...props}>
      <ChartHeader>
        <ChartTitle>
          <Icon name="trending-up" size={24} color="primary" />
          <div>
            <Typography variant="h5" weight="semibold">
              Revenue Streams
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <LiveIndicator isLive={realTimeUpdates} />
              <Typography variant="caption" color="secondary">
                {realTimeUpdates ? 'Live data' : 'Static data'} • Updated {lastUpdate.toLocaleTimeString()}
              </Typography>
            </div>
          </div>
        </ChartTitle>
        
        <ChartControls>
          {timeRangeOptions.map(option => (
            <TimeRangeButton
              key={option.value}
              active={activeTimeRange === option.value}
              onClick={() => handleTimeRangeChange(option.value)}
            >
              {option.label}
            </TimeRangeButton>
          ))}
        </ChartControls>
      </ChartHeader>

      {/* Revenue Stream Cards */}
      <RevenueStreams>
        {Object.entries(revenueStreamsConfig).map(([streamKey, stream]) => {
          const analytics = streamAnalytics[streamKey] || {};
          const isHovered = hoveredStream === streamKey;
          
          return (
            <StreamCard
              key={streamKey}
              color={stream.color}
              whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
              onMouseEnter={() => handleStreamHover(streamKey)}
              onMouseLeave={handleStreamLeave}
            >
              <StreamHeader>
                <StreamIcon color={stream.color}>
                  <Icon name={stream.icon} size={20} color={stream.color} />
                </StreamIcon>
                <Badge variant={analytics.trend === 'up' ? 'success' : analytics.trend === 'down' ? 'error' : 'default'}>
                  {analytics.trend === 'up' ? '↗' : analytics.trend === 'down' ? '↘' : '→'} {analytics.contribution?.toFixed(1)}%
                </Badge>
              </StreamHeader>
              
              <StreamData>
                <Typography variant="body2" weight="medium" color="secondary">
                  {stream.name}
                </Typography>
                
                <StreamValue>
                  <Typography variant="h6" weight="bold">
                    {formatCurrency(analytics.current || 0)}
                  </Typography>
                </StreamValue>
                
                <StreamChange positive={analytics.change >= 0}>
                  <Icon 
                    name={analytics.change >= 0 ? 'trending-up' : 'trending-down'} 
                    size={14}
                  />
                  <Typography variant="caption" weight="medium">
                    {analytics.change > 0 ? '+' : ''}{analytics.change?.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    vs previous
                  </Typography>
                </StreamChange>
                
                <Progress 
                  value={analytics.contribution || 0}
                  max={100}
                  size="sm"
                  variant={isHovered ? 'ai' : 'default'}
                  animated={isHovered}
                  showValue={false}
                />
              </StreamData>
            </StreamCard>
          );
        })}
      </RevenueStreams>

      {/* Chart Area */}
      <ChartArea>
        {loading ? (
          <LoadingSpinner>
            <Icon name="refresh" size={24} />
            <Typography variant="body2">Loading revenue data...</Typography>
          </LoadingSpinner>
        ) : (
          <SVGChart viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}>
            <defs>
              {Object.entries(revenueStreamsConfig).map(([streamKey, stream]) => (
                <linearGradient key={streamKey} id={`${streamKey}Gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={stream.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={stream.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            
            {/* Grid lines */}
            {showGrid && <GridLines>{gridLines}</GridLines>}
            
            {/* Y-axis labels */}
            <g>
              {Array.from({ length: 5 }, (_, i) => {
                const value = chartDimensions.minValue + (i / 4) * (chartDimensions.maxValue - chartDimensions.minValue);
                const y = chartDimensions.padding.top + ((4 - i) / 4) * (chartDimensions.height - chartDimensions.padding.top - chartDimensions.padding.bottom);
                
                return (
                  <text key={i} x={chartDimensions.padding.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="currentColor">
                    {formatCurrency(value)}
                  </text>
                );
              })}
            </g>
            
            {/* Stream areas and lines */}
            {Object.entries(revenueStreamsConfig).map(([streamKey, stream]) => {
              const paths = streamPaths[streamKey];
              if (!paths) return null;
              
              const isDimmed = hoveredStream && hoveredStream !== streamKey;
              const isHighlighted = hoveredStream === streamKey;
              
              return (
                <g key={streamKey}>
                  {/* Area fill */}
                  <StreamArea
                    d={paths.areaPath}
                    gradientId={`${streamKey}Gradient`}
                    dimmed={isDimmed}
                  />
                  
                  {/* Stream line */}
                  <motion.path
                    d={paths.linePath}
                    fill="none"
                    stroke={stream.color}
                    strokeWidth={isHighlighted ? 4 : 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isDimmed ? 0.3 : 1}
                    style={{
                      filter: `drop-shadow(0 2px 4px ${stream.color}40)`,
                      transition: 'all 0.3s ease'
                    }}
                    initial={animated ? { pathLength: 0 } : false}
                    animate={animated ? { pathLength: 1 } : false}
                    transition={{ duration: 1.5, delay: Object.keys(revenueStreamsConfig).indexOf(streamKey) * 0.1 }}
                  />
                </g>
              );
            })}
          </SVGChart>
        )}

        {/* Real-time update indicator */}
        {realTimeUpdates && (
          <AnimatePresence>
            <RealtimeUpdateOverlay
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Icon name="zap" size={14} color="#10B981" />
              <Typography variant="caption" color="success">
                Real-time
              </Typography>
            </RealtimeUpdateOverlay>
          </AnimatePresence>
        )}
      </ChartArea>

      {/* Legend */}
      {showLegend && (
        <Legend>
          {Object.entries(revenueStreamsConfig).map(([streamKey, stream]) => {
            const isDimmed = hoveredStream && hoveredStream !== streamKey;
            
            return (
              <LegendItem
                key={streamKey}
                dimmed={isDimmed}
                onMouseEnter={() => handleStreamHover(streamKey)}
                onMouseLeave={handleStreamLeave}
              >
                <LegendLine color={stream.color} />
                <Typography variant="caption">
                  {stream.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {formatCurrency(streamAnalytics[streamKey]?.current || 0)}
                </Typography>
              </LegendItem>
            );
          })}
        </Legend>
      )}
    </ChartContainer>
  );
};

// Apply memoization HOCs for performance optimization
export default withMemoization(
  withExpensiveComputation(RevenueStreamChart, {
    computations: {
      // SVG path calculations are expensive
      pathGeneration: (props) => {
        const { data, activeTimeRange } = props;
        // This would contain the complex SVG path generation logic
        return { calculated: true, dataLength: data.length, timeRange: activeTimeRange };
      },
      // Chart scaling calculations
      chartScaling: (props) => {
        const { data } = props;
        const allValues = data?.flatMap?.(d => Object.values(d).filter(v => typeof v === 'number')) || [];
        return {
          minValue: 0,
          maxValue: Math.max(...allValues) * 1.1,
          dataPoints: allValues.length
        };
      }
    },
    cacheSize: 8,
    displayName: 'RevenueStreamChart'
  }),
  {
    strategy: 'selective',
    propsToCompare: ['data', 'height', 'timeRange', 'loading', 'realTimeUpdates'],
    displayName: 'RevenueStreamChart',
    debug: process.env.NODE_ENV === 'development'
  }
);