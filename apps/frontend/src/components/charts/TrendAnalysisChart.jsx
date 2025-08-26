import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

const ChartContainer = styled.div`
  width: 100%;
  height: ${props => props.height || '450px'};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  position: relative;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
    height: ${props => props.height || '400px'};
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
  gap: ${props => props.theme.spacing[2]};
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

const Select = styled.select`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.body2.fontSize};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[100]};
  }
`;

const TrendSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const TrendCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.background || 'transparent'};
`;

const TrendIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TrendData = styled.div`
  flex: 1;
`;

const ChartArea = styled.div`
  width: 100%;
  height: calc(100% - 160px);
  position: relative;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
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

const TrendLine = styled.path`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 2px 4px ${props => props.color}30);
`;

const TrendArea = styled.path`
  fill: url(#${props => props.gradientId});
  opacity: 0.4;
`;

const DataPoint = styled.circle`
  fill: ${props => props.color};
  stroke: ${props => props.theme.colors.background.elevated};
  stroke-width: 3;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: drop-shadow(0 2px 4px ${props => props.color}40);
  
  &:hover {
    r: 7;
    stroke-width: 4;
  }
`;

const TrendArrow = styled.path`
  fill: ${props => props.color};
  stroke: none;
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[3]};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 10;
  pointer-events: none;
  min-width: 180px;
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.text.secondary};
`;

const NoDataMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  margin-top: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const LegendLine = styled.div`
  width: 20px;
  height: 3px;
  background: ${props => props.color};
  border-radius: 2px;
`;

const TrendAnalysisChart = ({
  data = [],
  height = '450px',
  metric = 'sales', // 'sales', 'inventory', 'turnover', 'profit'
  timeRange = '6m',
  onMetricChange,
  onTimeRangeChange,
  loading = false,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  animate = true,
  colors = {
    sales: '#3B82F6',
    inventory: '#10B981',
    turnover: '#F59E0B',
    profit: '#8B5CF6'
  }
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate mock data if no data provided
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    
    const periods = timeRange === '3m' ? 90 : timeRange === '6m' ? 180 : 365;
    const baseValues = {
      sales: 100000,
      inventory: 2500000,
      turnover: 4.5,
      profit: 15000
    };
    
    return Array.from({ length: periods }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (periods - 1 - i));
      
      // Create realistic trends for different metrics
      const progress = i / periods;
      const seasonal = Math.sin((i / 30) * Math.PI * 2) * 0.1;
      const noise = (Math.random() - 0.5) * 0.05;
      
      let trendMultiplier = 1;
      switch (metric) {
        case 'sales':
          trendMultiplier = 1 + progress * 0.3 + seasonal; // 30% growth with seasonality
          break;
        case 'inventory':
          trendMultiplier = 1 + progress * 0.1 - seasonal * 0.5; // 10% growth, inverse seasonal
          break;
        case 'turnover':
          trendMultiplier = 1 + progress * 0.2 + seasonal * 0.3; // 20% improvement
          break;
        case 'profit':
          trendMultiplier = 1 + progress * 0.4 + seasonal * 0.2; // 40% profit growth
          break;
      }
      
      const value = baseValues[metric] * (trendMultiplier + noise);
      
      return {
        date: date.toISOString(),
        value: Math.max(value, baseValues[metric] * 0.5),
        label: date.toLocaleDateString(),
        period: Math.floor(i / 30) // Group by months for trend calculation
      };
    });
  }, [data, timeRange, metric]);

  // Calculate trend analysis
  const trendAnalysis = useMemo(() => {
    if (chartData.length < 2) return {};
    
    const values = chartData.map(d => d.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    const overallTrend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    // Calculate volatility (standard deviation)
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);
    const volatilityPercentage = (volatility / mean) * 100;
    
    // Calculate momentum (recent trend)
    const recentPeriod = values.slice(-30); // Last 30 days
    const recentTrend = recentPeriod.length > 1 ?
      ((recentPeriod[recentPeriod.length - 1] - recentPeriod[0]) / recentPeriod[0]) * 100 : 0;
    
    // Peak and trough
    const peak = Math.max(...values);
    const trough = Math.min(...values);
    const peakIndex = values.indexOf(peak);
    const troughIndex = values.indexOf(trough);
    
    return {
      overallTrend,
      volatility: volatilityPercentage,
      momentum: recentTrend,
      peak,
      trough,
      peakDate: chartData[peakIndex]?.date,
      troughDate: chartData[troughIndex]?.date,
      currentValue: values[values.length - 1],
      previousValue: values[values.length - 2] || values[values.length - 1]
    };
  }, [chartData]);

  // Calculate chart dimensions and scales
  const chartDimensions = useMemo(() => {
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };
    const width = 800;
    const height = 250;
    
    const values = chartData.map(d => d.value);
    const minValue = Math.min(...values) * 0.95;
    const maxValue = Math.max(...values) * 1.05;
    
    const xScale = (index) => padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right);
    const yScale = (value) => padding.top + (1 - (value - minValue) / (maxValue - minValue)) * (height - padding.top - padding.bottom);
    
    return { padding, width, height, minValue, maxValue, xScale, yScale };
  }, [chartData]);

  // Generate SVG paths
  const paths = useMemo(() => {
    if (chartData.length === 0) return { linePath: '', areaPath: '' };
    
    const { xScale, yScale, height, padding } = chartDimensions;
    
    // Line path
    const linePath = chartData
      .map((point, index) => {
        const x = xScale(index);
        const y = yScale(point.value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    
    // Area path
    const areaPath = chartData
      .map((point, index) => {
        const x = xScale(index);
        const y = yScale(point.value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ') + 
      ` L ${xScale(chartData.length - 1)} ${height - padding.bottom} L ${xScale(0)} ${height - padding.bottom} Z`;
    
    return { linePath, areaPath };
  }, [chartData, chartDimensions]);

  // Handle point hover
  const handlePointHover = (event, point, index) => {
    if (!showTooltip) return;
    
    const rect = event.currentTarget.closest('svg').getBoundingClientRect();
    const change = index > 0 ? 
      ((point.value - chartData[index - 1].value) / chartData[index - 1].value) * 100 : 0;
    
    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      data: {
        ...point,
        change,
        metric
      }
    });
    setHoveredPoint(index);
  };

  const handlePointLeave = () => {
    setTooltip(null);
    setHoveredPoint(null);
  };

  // Format value based on metric
  const formatValue = (value, metricType = metric) => {
    switch (metricType) {
      case 'sales':
      case 'inventory':
      case 'profit':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'turnover':
        return `${value.toFixed(1)}x`;
      default:
        return value.toLocaleString();
    }
  };

  // Get trend direction
  const getTrendDirection = (value) => {
    if (value > 5) return { icon: 'trending-up', color: '#10B981', label: 'Strong Uptrend' };
    if (value > 0) return { icon: 'trending-up', color: '#3B82F6', label: 'Uptrend' };
    if (value > -5) return { icon: 'minus', color: '#6B7280', label: 'Stable' };
    return { icon: 'trending-down', color: '#EF4444', label: 'Downtrend' };
  };

  const overallTrendDirection = getTrendDirection(trendAnalysis.overallTrend);
  const momentumDirection = getTrendDirection(trendAnalysis.momentum);

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

  return (
    <ChartContainer height={height}>
      <ChartHeader>
        <ChartTitle>
          <Icon name="activity" size={20} color="primary" />
          <div>
            <Typography variant="h6" weight="semibold">
              Trend Analysis
            </Typography>
            <Typography variant="caption" color="secondary">
              Statistical trend analysis and insights
            </Typography>
          </div>
        </ChartTitle>
        
        <ChartControls>
          <Select value={metric} onChange={(e) => onMetricChange?.(e.target.value)}>
            <option value="sales">Sales Revenue</option>
            <option value="inventory">Inventory Value</option>
            <option value="turnover">Turnover Rate</option>
            <option value="profit">Profit Margin</option>
          </Select>
          
          <Select value={timeRange} onChange={(e) => onTimeRangeChange?.(e.target.value)}>
            <option value="3m">3 months</option>
            <option value="6m">6 months</option>
            <option value="12m">12 months</option>
          </Select>
        </ChartControls>
      </ChartHeader>

      {/* Trend Summary */}
      <TrendSummary>
        <TrendCard>
          <TrendIcon color={overallTrendDirection.color}>
            <Icon name={overallTrendDirection.icon} size={20} color={overallTrendDirection.color} />
          </TrendIcon>
          <TrendData>
            <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
              Overall Trend
            </Typography>
            <Typography variant="body2" weight="bold" style={{ color: overallTrendDirection.color }}>
              {trendAnalysis.overallTrend > 0 ? '+' : ''}{trendAnalysis.overallTrend?.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="secondary">
              {overallTrendDirection.label}
            </Typography>
          </TrendData>
        </TrendCard>
        
        <TrendCard>
          <TrendIcon color={momentumDirection.color}>
            <Icon name={momentumDirection.icon} size={20} color={momentumDirection.color} />
          </TrendIcon>
          <TrendData>
            <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
              Recent Momentum
            </Typography>
            <Typography variant="body2" weight="bold" style={{ color: momentumDirection.color }}>
              {trendAnalysis.momentum > 0 ? '+' : ''}{trendAnalysis.momentum?.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="secondary">
              Last 30 days
            </Typography>
          </TrendData>
        </TrendCard>
        
        <TrendCard>
          <TrendIcon color="#F59E0B">
            <Icon name="activity" size={20} color="#F59E0B" />
          </TrendIcon>
          <TrendData>
            <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
              Volatility
            </Typography>
            <Typography variant="body2" weight="bold" style={{ color: '#F59E0B' }}>
              {trendAnalysis.volatility?.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="secondary">
              {trendAnalysis.volatility > 20 ? 'High' : trendAnalysis.volatility > 10 ? 'Medium' : 'Low'}
            </Typography>
          </TrendData>
        </TrendCard>
        
        <TrendCard>
          <TrendIcon color="#8B5CF6">
            <Icon name="target" size={20} color="#8B5CF6" />
          </TrendIcon>
          <TrendData>
            <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
              Current Value
            </Typography>
            <Typography variant="body2" weight="bold">
              {formatValue(trendAnalysis.currentValue)}
            </Typography>
            <Typography 
              variant="caption" 
              color={trendAnalysis.currentValue >= trendAnalysis.previousValue ? 'success' : 'error'}
            >
              {trendAnalysis.currentValue >= trendAnalysis.previousValue ? '↗' : '↘'} vs Previous
            </Typography>
          </TrendData>
        </TrendCard>
      </TrendSummary>

      <ChartArea>
        {loading ? (
          <LoadingSpinner>
            <Icon name="refresh" size={16} />
            <Typography variant="body2">Analyzing trends...</Typography>
          </LoadingSpinner>
        ) : chartData.length === 0 ? (
          <NoDataMessage>
            <Typography variant="body2" color="secondary">
              No data available for trend analysis
            </Typography>
          </NoDataMessage>
        ) : (
          <SVGChart viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}>
            <defs>
              <linearGradient id={`${metric}Gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors[metric]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors[metric]} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {showGrid && <GridLines>{gridLines}</GridLines>}
            
            {/* Y-axis labels */}
            <g>
              {Array.from({ length: 5 }, (_, i) => {
                const value = chartDimensions.minValue + (i / 4) * (chartDimensions.maxValue - chartDimensions.minValue);
                const y = chartDimensions.padding.top + ((4 - i) / 4) * (chartDimensions.height - chartDimensions.padding.top - chartDimensions.padding.bottom);
                
                return (
                  <text key={i} x={chartDimensions.padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="currentColor">
                    {formatValue(value)}
                  </text>
                );
              })}
            </g>
            
            {/* Area fill */}
            <TrendArea d={paths.areaPath} gradientId={`${metric}Gradient`} />
            
            {/* Trend line */}
            <motion.path
              d={paths.linePath}
              fill="none"
              stroke={colors[metric]}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animate ? { pathLength: 0 } : false}
              animate={animate ? { pathLength: 1 } : false}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            
            {/* Data points */}
            {chartData.map((point, index) => {
              // Show only every nth point to avoid clutter
              const showPoint = index % Math.max(1, Math.floor(chartData.length / 20)) === 0 || 
                              index === chartData.length - 1 || 
                              hoveredPoint === index;
              
              if (!showPoint) return null;
              
              const x = chartDimensions.xScale(index);
              const y = chartDimensions.yScale(point.value);
              
              return (
                <motion.circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={hoveredPoint === index ? 7 : 5}
                  fill={colors[metric]}
                  stroke="#fff"
                  strokeWidth={3}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handlePointHover(e, point, index)}
                  onMouseLeave={handlePointLeave}
                  initial={animate ? { scale: 0 } : false}
                  animate={animate ? { scale: 1 } : false}
                  transition={{ duration: 0.4, delay: index * 0.01 }}
                />
              );
            })}
          </SVGChart>
        )}
        
        {/* Tooltip */}
        {tooltip && (
          <Tooltip
            style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Typography variant="caption" weight="medium" style={{ display: 'block', marginBottom: '8px' }}>
              {new Date(tooltip.data.date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" weight="semibold" color="primary" style={{ display: 'block', marginBottom: '4px' }}>
              {formatValue(tooltip.data.value, tooltip.data.metric)}
            </Typography>
            {Math.abs(tooltip.data.change) > 0.1 && (
              <Typography 
                variant="caption" 
                color={tooltip.data.change >= 0 ? 'success' : 'error'}
                style={{ display: 'block' }}
              >
                {tooltip.data.change >= 0 ? '+' : ''}{tooltip.data.change.toFixed(1)}% from previous
              </Typography>
            )}
          </Tooltip>
        )}
      </ChartArea>
      
      {/* Legend */}
      {showLegend && (
        <Legend>
          <LegendItem>
            <LegendLine color={colors[metric]} />
            <Typography variant="caption">
              {metric.charAt(0).toUpperCase() + metric.slice(1)} Trend
            </Typography>
          </LegendItem>
        </Legend>
      )}
    </ChartContainer>
  );
};

export default TrendAnalysisChart;