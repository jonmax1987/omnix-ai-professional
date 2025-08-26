import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

const ChartContainer = styled.div`
  width: 100%;
  height: ${props => props.height || '500px'};
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

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
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

const ToggleButton = styled.button`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.caption.fontSize};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.background.hover};
  }
`;

const ChartArea = styled.div`
  width: 100%;
  height: calc(100% - 120px);
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

const ConfidenceArea = styled.path`
  fill: ${props => props.color};
  opacity: 0.2;
`;

const ForecastLine = styled.path`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: ${props => props.dashed ? '8,4' : 'none'};
`;

const HistoricalLine = styled.path`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const DataPoint = styled.circle`
  fill: ${props => props.color};
  stroke: ${props => props.theme.colors.background.elevated};
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    r: 6;
    stroke-width: 3;
  }
`;

const VerticalLine = styled.line`
  stroke: ${props => props.theme.colors.border.default};
  stroke-width: 2;
  stroke-dasharray: 4,4;
  opacity: 0.7;
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
  min-width: 200px;
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

const LegendLine = styled.div`
  width: 20px;
  height: 3px;
  background: ${props => props.color};
  border-radius: 2px;
  ${props => props.dashed && 'background-image: linear-gradient(to right, transparent 40%, ' + props.color + ' 40%, ' + props.color + ' 60%, transparent 60%);'}
`;

const LegendArea = styled.div`
  width: 20px;
  height: 12px;
  background: ${props => props.color};
  opacity: 0.3;
  border-radius: 2px;
`;

const MetricsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const MetricCard = styled.div`
  text-align: center;
`;

const DemandForecastChart = ({
  data = [],
  height = '500px',
  product = null,
  forecastDays = 30,
  confidenceLevel = 80,
  onProductChange,
  onForecastDaysChange,
  onConfidenceLevelChange,
  loading = false,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  showConfidenceIntervals = true,
  animate = true,
  colors = {
    historical: '#6B7280',
    forecast: '#3B82F6',
    confidence: '#3B82F6',
    actual: '#10B981'
  }
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate mock data if no data provided
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    
    const today = new Date();
    const historicalDays = 30;
    const forecastDaysCount = forecastDays;
    
    // Generate historical data
    const historical = Array.from({ length: historicalDays }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (historicalDays - i));
      
      // Simulate demand pattern with trend and seasonality
      const baseDemand = 150;
      const trend = i * 0.5; // Slight upward trend
      const seasonality = Math.sin((i / historicalDays) * Math.PI * 2) * 20;
      const noise = (Math.random() - 0.5) * 30;
      
      return {
        date: date.toISOString(),
        actual: Math.max(baseDemand + trend + seasonality + noise, 0),
        type: 'historical'
      };
    });
    
    // Generate forecast data with confidence intervals
    const forecast = Array.from({ length: forecastDaysCount }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i + 1);
      
      // Simulate forecast with uncertainty increasing over time
      const baseForecast = 170 + i * 0.8; // Continuing the trend
      const seasonality = Math.sin(((historicalDays + i) / 30) * Math.PI * 2) * 20;
      const uncertainty = 10 + i * 1.5; // Uncertainty increases with time
      
      const predicted = baseForecast + seasonality;
      const confidenceMultiplier = confidenceLevel === 95 ? 1.96 : confidenceLevel === 80 ? 1.28 : 0.67;
      
      return {
        date: date.toISOString(),
        predicted: Math.max(predicted, 0),
        upperBound: Math.max(predicted + uncertainty * confidenceMultiplier, 0),
        lowerBound: Math.max(predicted - uncertainty * confidenceMultiplier, 0),
        confidence: confidenceLevel,
        type: 'forecast'
      };
    });
    
    return [...historical, ...forecast];
  }, [data, forecastDays, confidenceLevel]);

  // Separate historical and forecast data
  const { historicalData, forecastData, todayIndex } = useMemo(() => {
    const historical = chartData.filter(d => d.type === 'historical');
    const forecast = chartData.filter(d => d.type === 'forecast');
    const todayIndex = historical.length - 1;
    
    return { historicalData: historical, forecastData: forecast, todayIndex };
  }, [chartData]);

  // Calculate chart dimensions and scales
  const chartDimensions = useMemo(() => {
    const padding = { top: 20, right: 40, bottom: 60, left: 60 };
    const width = 900;
    const height = 350;
    
    const allValues = [
      ...historicalData.map(d => d.actual),
      ...forecastData.map(d => d.predicted),
      ...forecastData.map(d => d.upperBound),
      ...forecastData.map(d => d.lowerBound)
    ].filter(v => v !== undefined);
    
    const minValue = Math.min(...allValues) * 0.9;
    const maxValue = Math.max(...allValues) * 1.1;
    
    const xScale = (index) => padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right);
    const yScale = (value) => padding.top + (1 - (value - minValue) / (maxValue - minValue)) * (height - padding.top - padding.bottom);
    
    return { padding, width, height, minValue, maxValue, xScale, yScale };
  }, [chartData, historicalData, forecastData]);

  // Generate SVG paths
  const paths = useMemo(() => {
    const { xScale, yScale } = chartDimensions;
    
    // Historical line path
    const historicalPath = historicalData
      .map((point, index) => {
        const x = xScale(index);
        const y = yScale(point.actual);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    
    // Forecast line path
    const forecastPath = forecastData
      .map((point, index) => {
        const actualIndex = historicalData.length + index;
        const x = xScale(actualIndex);
        const y = yScale(point.predicted);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    
    // Confidence area path
    let confidenceAreaPath = '';
    if (showConfidenceIntervals && forecastData.length > 0) {
      // Upper bound path
      const upperPath = forecastData
        .map((point, index) => {
          const actualIndex = historicalData.length + index;
          const x = xScale(actualIndex);
          const y = yScale(point.upperBound);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
      
      // Lower bound path (reversed)
      const lowerPath = forecastData
        .slice()
        .reverse()
        .map((point, index) => {
          const actualIndex = historicalData.length + (forecastData.length - 1 - index);
          const x = xScale(actualIndex);
          const y = yScale(point.lowerBound);
          return `L ${x} ${y}`;
        })
        .join(' ');
      
      confidenceAreaPath = upperPath + ' ' + lowerPath + ' Z';
    }
    
    return { historicalPath, forecastPath, confidenceAreaPath };
  }, [chartDimensions, historicalData, forecastData, showConfidenceIntervals]);

  // Calculate forecast metrics
  const forecastMetrics = useMemo(() => {
    if (forecastData.length === 0) return {};
    
    const avgForecast = forecastData.reduce((sum, d) => sum + d.predicted, 0) / forecastData.length;
    const peak = Math.max(...forecastData.map(d => d.predicted));
    const low = Math.min(...forecastData.map(d => d.predicted));
    const trend = forecastData.length > 1 ? 
      ((forecastData[forecastData.length - 1].predicted - forecastData[0].predicted) / forecastData[0].predicted) * 100 : 0;
    
    const lastHistorical = historicalData[historicalData.length - 1]?.actual || 0;
    const changeFromCurrent = ((avgForecast - lastHistorical) / lastHistorical) * 100;
    
    return {
      avgForecast: Math.round(avgForecast),
      peak: Math.round(peak),
      low: Math.round(low),
      trend: trend.toFixed(1),
      changeFromCurrent: changeFromCurrent.toFixed(1)
    };
  }, [forecastData, historicalData]);

  // Handle point hover
  const handlePointHover = (event, point, index, type) => {
    if (!showTooltip) return;
    
    const rect = event.currentTarget.closest('svg').getBoundingClientRect();
    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      data: {
        date: new Date(point.date).toLocaleDateString(),
        ...point,
        type
      }
    });
    setHoveredPoint(index);
  };

  const handlePointLeave = () => {
    setTooltip(null);
    setHoveredPoint(null);
  };

  // Generate grid lines
  const gridLines = useMemo(() => {
    const { width, height, padding } = chartDimensions;
    const lines = [];
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * (height - padding.top - padding.bottom);
      lines.push(
        <line key={`h-${i}`} x1={padding.left} y1={y} x2={width - padding.right} y2={y} />
      );
    }
    
    // Vertical grid lines
    const verticalLines = Math.min(chartData.length, 10);
    for (let i = 0; i <= verticalLines; i++) {
      const x = padding.left + (i / verticalLines) * (width - padding.left - padding.right);
      lines.push(
        <line key={`v-${i}`} x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} />
      );
    }
    
    return lines;
  }, [chartDimensions, chartData]);

  return (
    <ChartContainer height={height}>
      <ChartHeader>
        <ChartTitle>
          <Icon name="trending-up" size={20} color="primary" />
          <div>
            <Typography variant="h6" weight="semibold">
              Demand Forecast
            </Typography>
            <Typography variant="caption" color="secondary">
              AI-powered demand prediction with confidence intervals
            </Typography>
          </div>
          <Badge variant="info" size="sm">
            {confidenceLevel}% Confidence
          </Badge>
        </ChartTitle>
        
        <ChartControls>
          <ControlGroup>
            <Typography variant="caption" color="secondary">Product:</Typography>
            <Select value={product || 'all'} onChange={(e) => onProductChange?.(e.target.value)}>
              <option value="all">All Products</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food & Beverages</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <Typography variant="caption" color="secondary">Forecast:</Typography>
            <Select value={forecastDays} onChange={(e) => onForecastDaysChange?.(parseInt(e.target.value))}>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <Typography variant="caption" color="secondary">Confidence:</Typography>
            <Select value={confidenceLevel} onChange={(e) => onConfidenceLevelChange?.(parseInt(e.target.value))}>
              <option value={50}>50%</option>
              <option value={80}>80%</option>
              <option value={95}>95%</option>
            </Select>
          </ControlGroup>
          
          <ToggleButton 
            active={showConfidenceIntervals}
            onClick={() => onConfidenceLevelChange?.(showConfidenceIntervals ? 0 : confidenceLevel)}
          >
            Intervals
          </ToggleButton>
        </ChartControls>
      </ChartHeader>

      {/* Forecast Metrics */}
      <MetricsBar>
        <MetricCard>
          <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
            Avg Forecast
          </Typography>
          <Typography variant="h6" weight="bold" color="primary">
            {forecastMetrics.avgForecast}
          </Typography>
        </MetricCard>
        
        <MetricCard>
          <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
            Peak Demand
          </Typography>
          <Typography variant="h6" weight="bold">
            {forecastMetrics.peak}
          </Typography>
        </MetricCard>
        
        <MetricCard>
          <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
            Low Demand
          </Typography>
          <Typography variant="h6" weight="bold">
            {forecastMetrics.low}
          </Typography>
        </MetricCard>
        
        <MetricCard>
          <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
            Trend
          </Typography>
          <Typography 
            variant="h6" 
            weight="bold"
            color={parseFloat(forecastMetrics.trend) >= 0 ? 'success' : 'error'}
          >
            {forecastMetrics.trend > 0 ? '+' : ''}{forecastMetrics.trend}%
          </Typography>
        </MetricCard>
        
        <MetricCard>
          <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
            vs Current
          </Typography>
          <Typography 
            variant="h6" 
            weight="bold"
            color={parseFloat(forecastMetrics.changeFromCurrent) >= 0 ? 'success' : 'error'}
          >
            {forecastMetrics.changeFromCurrent > 0 ? '+' : ''}{forecastMetrics.changeFromCurrent}%
          </Typography>
        </MetricCard>
      </MetricsBar>

      <ChartArea>
        {loading ? (
          <LoadingSpinner>
            <Icon name="refresh" size={16} />
            <Typography variant="body2">Generating forecast...</Typography>
          </LoadingSpinner>
        ) : chartData.length === 0 ? (
          <NoDataMessage>
            <Typography variant="body2" color="secondary">
              No data available for forecast generation
            </Typography>
          </NoDataMessage>
        ) : (
          <SVGChart viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}>
            {/* Grid lines */}
            {showGrid && <GridLines>{gridLines}</GridLines>}
            
            {/* Y-axis labels */}
            <g>
              {Array.from({ length: 6 }, (_, i) => {
                const value = chartDimensions.minValue + (i / 5) * (chartDimensions.maxValue - chartDimensions.minValue);
                const y = chartDimensions.padding.top + ((5 - i) / 5) * (chartDimensions.height - chartDimensions.padding.top - chartDimensions.padding.bottom);
                
                return (
                  <text key={i} x={chartDimensions.padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="currentColor">
                    {Math.round(value)}
                  </text>
                );
              })}
            </g>
            
            {/* Today line */}
            <VerticalLine
              x1={chartDimensions.xScale(todayIndex)}
              y1={chartDimensions.padding.top}
              x2={chartDimensions.xScale(todayIndex)}
              y2={chartDimensions.height - chartDimensions.padding.bottom}
            />
            
            {/* Confidence area */}
            {showConfidenceIntervals && (
              <ConfidenceArea d={paths.confidenceAreaPath} color={colors.confidence} />
            )}
            
            {/* Historical line */}
            <motion.path
              d={paths.historicalPath}
              fill="none"
              stroke={colors.historical}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animate ? { pathLength: 0 } : false}
              animate={animate ? { pathLength: 1 } : false}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            
            {/* Forecast line */}
            <motion.path
              d={paths.forecastPath}
              fill="none"
              stroke={colors.forecast}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8,4"
              initial={animate ? { pathLength: 0 } : false}
              animate={animate ? { pathLength: 1 } : false}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
            />
            
            {/* Historical data points */}
            {historicalData.map((point, index) => {
              const x = chartDimensions.xScale(index);
              const y = chartDimensions.yScale(point.actual);
              
              return (
                <motion.circle
                  key={`hist-${index}`}
                  cx={x}
                  cy={y}
                  r={hoveredPoint === index ? 5 : 3}
                  fill={colors.historical}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handlePointHover(e, point, index, 'historical')}
                  onMouseLeave={handlePointLeave}
                  initial={animate ? { scale: 0 } : false}
                  animate={animate ? { scale: 1 } : false}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                />
              );
            })}
            
            {/* Forecast data points */}
            {forecastData.map((point, index) => {
              const actualIndex = historicalData.length + index;
              const x = chartDimensions.xScale(actualIndex);
              const y = chartDimensions.yScale(point.predicted);
              
              return (
                <motion.circle
                  key={`forecast-${index}`}
                  cx={x}
                  cy={y}
                  r={hoveredPoint === actualIndex ? 6 : 4}
                  fill={colors.forecast}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handlePointHover(e, point, actualIndex, 'forecast')}
                  onMouseLeave={handlePointLeave}
                  initial={animate ? { scale: 0 } : false}
                  animate={animate ? { scale: 1 } : false}
                  transition={{ duration: 0.3, delay: (historicalData.length + index) * 0.02 }}
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
              {tooltip.data.date}
            </Typography>
            
            {tooltip.data.type === 'historical' ? (
              <Typography variant="body2" weight="semibold" color="secondary" style={{ display: 'block' }}>
                Actual: {Math.round(tooltip.data.actual)}
              </Typography>
            ) : (
              <>
                <Typography variant="body2" weight="semibold" color="primary" style={{ display: 'block' }}>
                  Predicted: {Math.round(tooltip.data.predicted)}
                </Typography>
                {showConfidenceIntervals && (
                  <>
                    <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                      Upper: {Math.round(tooltip.data.upperBound)}
                    </Typography>
                    <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                      Lower: {Math.round(tooltip.data.lowerBound)}
                    </Typography>
                    <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                      Confidence: {tooltip.data.confidence}%
                    </Typography>
                  </>
                )}
              </>
            )}
          </Tooltip>
        )}
      </ChartArea>
      
      {/* Legend */}
      {showLegend && (
        <Legend>
          <LegendItem>
            <LegendLine color={colors.historical} />
            <Typography variant="caption">Historical Data</Typography>
          </LegendItem>
          <LegendItem>
            <LegendLine color={colors.forecast} dashed />
            <Typography variant="caption">Forecast</Typography>
          </LegendItem>
          {showConfidenceIntervals && (
            <LegendItem>
              <LegendArea color={colors.confidence} />
              <Typography variant="caption">{confidenceLevel}% Confidence Interval</Typography>
            </LegendItem>
          )}
        </Legend>
      )}
    </ChartContainer>
  );
};

export default DemandForecastChart;