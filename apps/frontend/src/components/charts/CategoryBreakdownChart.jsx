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
    height: ${props => props.height || '350px'};
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

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: none;
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography?.caption?.fontSize || '0.75rem'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.background.hover};
  }
`;

const ChartContent = styled.div`
  display: flex;
  height: calc(100% - 80px);
  gap: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    height: auto;
  }
`;

const ChartArea = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;
`;

const SVGChart = styled.svg`
  width: 100%;
  height: 100%;
  max-width: 300px;
  max-height: 300px;
`;

const PieSlice = styled.path`
  cursor: pointer;
  transition: all 0.2s ease;
  transform-origin: center;
  
  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }
`;

const CenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: row;
    flex-wrap: wrap;
    max-height: none;
    overflow-y: visible;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.highlighted ? props.theme.colors.background.hover : 'transparent'};
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const LegendText = styled.div`
  flex: 1;
`;

const LegendValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing[0.5]};
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

const CategoryBreakdownChart = ({
  data = [],
  height = '400px',
  viewType = 'donut', // 'pie' or 'donut'
  onViewTypeChange,
  loading = false,
  showTooltip = true,
  showLegend = true,
  animate = true,
  colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ]
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Generate mock data if no data provided
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    
    // Generate mock category data
    return [
      { category: 'Electronics', value: 1250000, count: 342 },
      { category: 'Clothing', value: 890000, count: 567 },
      { category: 'Food & Beverages', value: 670000, count: 1234 },
      { category: 'Home & Garden', value: 450000, count: 289 },
      { category: 'Sports & Outdoor', value: 320000, count: 156 },
      { category: 'Books & Media', value: 180000, count: 432 },
      { category: 'Health & Beauty', value: 280000, count: 298 },
      { category: 'Automotive', value: 150000, count: 87 }
    ].sort((a, b) => b.value - a.value);
  }, [data]);

  // Calculate totals and percentages
  const { totalValue, totalCount, dataWithPercentages } = useMemo(() => {
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
    const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);
    
    const dataWithPercentages = chartData.map((item, index) => ({
      ...item,
      percentage: (item.value / totalValue) * 100,
      color: colors[index % colors.length]
    }));
    
    return { totalValue, totalCount, dataWithPercentages };
  }, [chartData, colors]);

  // Calculate SVG paths for pie slices
  const pieSlices = useMemo(() => {
    if (dataWithPercentages.length === 0) return [];
    
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const innerRadius = viewType === 'donut' ? 50 : 0;
    
    let currentAngle = -90; // Start from top
    
    return dataWithPercentages.map((item, index) => {
      const angle = (item.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // Convert angles to radians
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      // Calculate coordinates
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      let path;
      if (viewType === 'donut') {
        const ix1 = centerX + innerRadius * Math.cos(startAngleRad);
        const iy1 = centerY + innerRadius * Math.sin(startAngleRad);
        const ix2 = centerX + innerRadius * Math.cos(endAngleRad);
        const iy2 = centerY + innerRadius * Math.sin(endAngleRad);
        
        path = [
          `M ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${ix2} ${iy2}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`,
          'Z'
        ].join(' ');
      } else {
        path = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ');
      }
      
      currentAngle = endAngle;
      
      return {
        ...item,
        path,
        index,
        midAngle: startAngle + angle / 2
      };
    });
  }, [dataWithPercentages, viewType]);

  // Handle slice hover
  const handleSliceHover = (event, slice) => {
    if (!showTooltip) return;
    
    const rect = event.currentTarget.closest('svg').getBoundingClientRect();
    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      data: slice
    });
    setHoveredSlice(slice.index);
  };

  const handleSliceLeave = () => {
    setTooltip(null);
    setHoveredSlice(null);
  };

  // Handle legend item hover
  const handleLegendHover = (index) => {
    setHoveredSlice(index);
  };

  const handleLegendLeave = () => {
    setHoveredSlice(null);
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

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <ChartContainer height={height}>
      <ChartHeader>
        <ChartTitle>
          <Icon name="pie-chart" size={20} color="primary" />
          <div>
            <Typography variant="h6" weight="semibold">
              Category Breakdown
            </Typography>
            <Typography variant="caption" color="secondary">
              Inventory value by product category
            </Typography>
          </div>
          <Badge variant="info" size="sm">
            {dataWithPercentages.length} Categories
          </Badge>
        </ChartTitle>
        
        <ChartControls>
          <ViewToggle>
            <ViewButton 
              active={viewType === 'pie'}
              onClick={() => onViewTypeChange?.('pie')}
            >
              Pie
            </ViewButton>
            <ViewButton 
              active={viewType === 'donut'}
              onClick={() => onViewTypeChange?.('donut')}
            >
              Donut
            </ViewButton>
          </ViewToggle>
        </ChartControls>
      </ChartHeader>

      <ChartContent>
        <ChartArea>
          {loading ? (
            <LoadingSpinner>
              <Icon name="refresh" size={16} />
              <Typography variant="body2">Loading chart data...</Typography>
            </LoadingSpinner>
          ) : dataWithPercentages.length === 0 ? (
            <NoDataMessage>
              <Typography variant="body2" color="secondary">
                No category data available
              </Typography>
            </NoDataMessage>
          ) : (
            <>
              <SVGChart viewBox="0 0 300 300">
                {pieSlices.map((slice) => (
                  <motion.path
                    key={slice.category}
                    d={slice.path}
                    fill={slice.color}
                    opacity={hoveredSlice !== null && hoveredSlice !== slice.index ? 0.6 : 1}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => handleSliceHover(e, slice)}
                    onMouseLeave={handleSliceLeave}
                    initial={animate ? { scale: 0 } : false}
                    animate={animate ? { scale: 1 } : false}
                    transition={{ duration: 0.6, delay: slice.index * 0.1 }}
                  />
                ))}
              </SVGChart>
              
              {viewType === 'donut' && (
                <CenterText>
                  <Typography variant="h5" weight="bold" color="primary">
                    {formatCurrency(totalValue)}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Total Value
                  </Typography>
                  <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                    {totalCount.toLocaleString()} items
                  </Typography>
                </CenterText>
              )}
            </>
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
                {tooltip.data.category}
              </Typography>
              <Typography variant="body2" weight="semibold" color="primary" style={{ display: 'block' }}>
                {formatCurrency(tooltip.data.value)}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                {formatPercentage(tooltip.data.percentage)}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                {tooltip.data.count.toLocaleString()} items
              </Typography>
            </Tooltip>
          )}
        </ChartArea>
        
        {/* Legend */}
        {showLegend && (
          <Legend>
            {dataWithPercentages.map((item, index) => (
              <LegendItem
                key={item.category}
                highlighted={hoveredSlice === index}
                onMouseEnter={() => handleLegendHover(index)}
                onMouseLeave={handleLegendLeave}
              >
                <LegendColor color={item.color} />
                <LegendText>
                  <Typography variant="body2" weight="medium">
                    {item.category}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {item.count.toLocaleString()} items
                  </Typography>
                </LegendText>
                <LegendValue>
                  <Typography variant="body2" weight="semibold">
                    {formatCurrency(item.value)}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {formatPercentage(item.percentage)}
                  </Typography>
                </LegendValue>
              </LegendItem>
            ))}
          </Legend>
        )}
      </ChartContent>
    </ChartContainer>
  );
};

export default CategoryBreakdownChart;