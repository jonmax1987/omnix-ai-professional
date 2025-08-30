import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

const ChartContainer = styled.div`
  width: 100%;
  height: ${props => props.height || '400px'};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  position: relative;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
    height: ${props => props.height || '300px'};
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

const TimeRangeSelector = styled.select`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography?.body2?.fontSize || '0.875rem'};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[100]};
  }
`;

const ChartArea = styled.div`
  width: 100%;
  height: calc(100% - 80px);
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

const ChartLine = styled.path`
  fill: none;
  stroke: ${props => props.color || props.theme.colors.primary[500]};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const GradientArea = styled.path`
  fill: url(#gradient);
  opacity: 0.3;
`;

const DataPoint = styled.circle`
  fill: ${props => props.color || props.theme.colors.primary[500]};
  stroke: ${props => props.theme.colors.background.elevated};
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    r: 6;
    stroke-width: 3;
  }
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 10;
  pointer-events: none;
  min-width: 120px;
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
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.color};
`;

const InventoryValueChart = ({
  data = [],
  height = '400px',
  timeRange = '30d',
  onTimeRangeChange,
  loading = false,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  animate = true,
  colors = {
    primary: '#3B82F6',
    target: '#10B981',
    warning: '#F59E0B'
  }
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate mock data if no data provided
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    
    // Generate mock inventory value data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      // Simulate inventory value fluctuations
      const baseValue = 2500000;
      const variation = Math.sin(i * 0.2) * 200000 + Math.random() * 100000 - 50000;
      const targetValue = 2800000;
      
      return {
        date: date.toISOString(),
        value: Math.max(baseValue + variation, 1000000),
        target: targetValue,
        label: date.toLocaleDateString()
      };
    });
  }, [data, timeRange]);

  // Calculate chart dimensions and scales
  const chartDimensions = useMemo(() => {
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };
    const width = 800; // Base width for calculations
    const height = 300; // Base height for calculations
    
    const values = chartData.map(d => d.value);
    const targets = chartData.map(d => d.target);
    const allValues = [...values, ...targets];
    
    const minValue = Math.min(...allValues) * 0.95;
    const maxValue = Math.max(...allValues) * 1.05;
    
    const xScale = (index) => padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right);
    const yScale = (value) => padding.top + (1 - (value - minValue) / (maxValue - minValue)) * (height - padding.top - padding.bottom);
    
    return {
      padding,
      width,
      height,
      minValue,
      maxValue,
      xScale,
      yScale
    };
  }, [chartData]);

  // Generate SVG path for the main line
  const mainPath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const { xScale, yScale } = chartDimensions;
    
    return chartData
      .map((point, index) => {
        const x = xScale(index);
        const y = yScale(point.value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [chartData, chartDimensions]);

  // Generate SVG path for the target line
  const targetPath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const { xScale, yScale } = chartDimensions;
    
    return chartData
      .map((point, index) => {
        const x = xScale(index);
        const y = yScale(point.target);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [chartData, chartDimensions]);

  // Generate SVG path for the filled area
  const areaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const { xScale, yScale, height, padding } = chartDimensions;
    const bottomY = height - padding.bottom;
    
    let path = chartData
      .map((point, index) => {
        const x = xScale(index);
        const y = yScale(point.value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    
    // Close the path by going to bottom corners
    const lastX = xScale(chartData.length - 1);
    const firstX = xScale(0);
    path += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    
    return path;
  }, [chartData, chartDimensions]);

  // Handle point hover
  const handlePointHover = (event, point, index) => {
    if (!showTooltip) return;
    
    const rect = event.currentTarget.closest('svg').getBoundingClientRect();
    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      data: {
        date: new Date(point.date).toLocaleDateString(),
        value: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(point.value),
        target: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(point.target),
        difference: point.value - point.target
      }
    });
    setHoveredPoint(index);
  };

  const handlePointLeave = () => {
    setTooltip(null);
    setHoveredPoint(null);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Generate grid lines
  const gridLines = useMemo(() => {
    const { width, height, padding, minValue, maxValue } = chartDimensions;
    const lines = [];
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * (height - padding.top - padding.bottom);
      lines.push(
        <line
          key={`h-${i}`}
          x1={padding.left}
          y1={y}
          x2={width - padding.right}
          y2={y}
        />
      );
    }
    
    // Vertical grid lines
    const verticalLines = Math.min(chartData.length, 8);
    for (let i = 0; i <= verticalLines; i++) {
      const x = padding.left + (i / verticalLines) * (width - padding.left - padding.right);
      lines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={padding.top}
          x2={x}
          y2={height - padding.bottom}
        />
      );
    }
    
    return lines;
  }, [chartDimensions, chartData]);

  return (
    <ChartContainer height={height}>
      <ChartHeader>
        <ChartTitle>
          <Icon name="trending" size={20} color="primary" />
          <div>
            <Typography variant="h6" weight="semibold">
              Inventory Value Trend
            </Typography>
            <Typography variant="caption" color="secondary">
              Total inventory value over time
            </Typography>
          </div>
          <Badge variant="info" size="sm">
            Live
          </Badge>
        </ChartTitle>
        
        <ChartControls>
          <TimeRangeSelector 
            value={timeRange} 
            onChange={(e) => onTimeRangeChange?.(e.target.value)}
          >
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </TimeRangeSelector>
        </ChartControls>
      </ChartHeader>

      <ChartArea>
        {loading ? (
          <LoadingSpinner>
            <Icon name="refresh" size={16} />
            <Typography variant="body2">Loading chart data...</Typography>
          </LoadingSpinner>
        ) : chartData.length === 0 ? (
          <NoDataMessage>
            <Typography variant="body2" color="secondary">
              No data available for the selected time range
            </Typography>
          </NoDataMessage>
        ) : (
          <SVGChart viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} stopOpacity={0.4} />
                <stop offset="100%" stopColor={colors.primary} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {showGrid && (
              <GridLines>
                {gridLines}
              </GridLines>
            )}
            
            {/* Y-axis labels */}
            <g>
              {Array.from({ length: 6 }, (_, i) => {
                const value = chartDimensions.minValue + (i / 5) * (chartDimensions.maxValue - chartDimensions.minValue);
                const y = chartDimensions.padding.top + ((5 - i) / 5) * (chartDimensions.height - chartDimensions.padding.top - chartDimensions.padding.bottom);
                
                return (
                  <text
                    key={i}
                    x={chartDimensions.padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="currentColor"
                  >
                    {formatCurrency(value)}
                  </text>
                );
              })}
            </g>
            
            {/* Area fill */}
            <GradientArea d={areaPath} />
            
            {/* Target line */}
            <ChartLine 
              d={targetPath} 
              color={colors.target}
              strokeDasharray="5,5"
            />
            
            {/* Main line */}
            <motion.path
              d={mainPath}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animate ? { pathLength: 0 } : false}
              animate={animate ? { pathLength: 1 } : false}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const x = chartDimensions.xScale(index);
              const y = chartDimensions.yScale(point.value);
              
              return (
                <motion.circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={hoveredPoint === index ? 6 : 4}
                  fill={colors.primary}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handlePointHover(e, point, index)}
                  onMouseLeave={handlePointLeave}
                  initial={animate ? { scale: 0 } : false}
                  animate={animate ? { scale: 1 } : false}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
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
            <Typography variant="caption" weight="medium" style={{ display: 'block', marginBottom: '4px' }}>
              {tooltip.data.date}
            </Typography>
            <Typography variant="body2" weight="semibold" color="primary" style={{ display: 'block' }}>
              Value: {tooltip.data.value}
            </Typography>
            <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
              Target: {tooltip.data.target}
            </Typography>
            <Typography 
              variant="caption" 
              color={tooltip.data.difference >= 0 ? 'success' : 'error'}
              style={{ display: 'block' }}
            >
              {tooltip.data.difference >= 0 ? '+' : ''}{formatCurrency(tooltip.data.difference)}
            </Typography>
          </Tooltip>
        )}
      </ChartArea>
      
      {/* Legend */}
      {showLegend && (
        <Legend>
          <LegendItem>
            <LegendColor color={colors.primary} />
            <Typography variant="caption">Inventory Value</Typography>
          </LegendItem>
          <LegendItem>
            <LegendColor color={colors.target} style={{ borderStyle: 'dashed' }} />
            <Typography variant="caption">Target Level</Typography>
          </LegendItem>
        </Legend>
      )}
    </ChartContainer>
  );
};

export default InventoryValueChart;