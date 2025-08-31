import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, AlertTriangle, Award, Star } from 'lucide-react';
import * as d3 from 'd3';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { withMemoization, withExpensiveComputation } from '../hoc/withMemoization';
import { useDeepMemo, useTrackedMemo, useThrottledMemo } from '../../utils/memoization.jsx';

const Container = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667EEA, #764BA2, #00D9FF);
    opacity: 0.8;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button`
  padding: 6px 12px;
  background: ${({ active, theme }) => 
    active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => 
    active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) => 
      active ? theme.colors.primary : theme.colors.background.tertiary};
  }
`;

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SVGContainer = styled.svg`
  width: 100%;
  height: 100%;
  max-width: 400px;
  max-height: 400px;
`;

const CenterMetrics = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`;

const TotalCustomers = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const TotalValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SegmentTooltip = styled(motion.div)`
  position: absolute;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 1000;
  min-width: 200px;
`;

const TooltipTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.base};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TooltipMetric = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 4px;

  span:last-child {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
  }
`;

const LegendContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 24px;
`;

const LegendItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
    transform: translateX(4px);
  }
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

const LegendInfo = styled.div`
  flex: 1;
`;

const LegendName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LegendValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MigrationArrow = styled.path`
  fill: none;
  stroke: ${({ color }) => color};
  stroke-width: 2;
  stroke-linecap: round;
  opacity: 0.6;
  stroke-dasharray: 5, 5;
  animation: dash 2s linear infinite;

  @keyframes dash {
    to {
      stroke-dashoffset: -10;
    }
  }
`;

const segmentData = [
  { 
    id: 'champions',
    name: 'Champions',
    count: 1234,
    value: 487320,
    percentage: 15,
    color: '#667EEA',
    icon: Award,
    description: 'Best customers with frequent purchases',
    growth: 12.5
  },
  { 
    id: 'loyal',
    name: 'Loyal Customers',
    count: 2341,
    value: 385420,
    percentage: 28,
    color: '#48BB78',
    icon: Star,
    description: 'Regular customers with good habits',
    growth: 8.3
  },
  { 
    id: 'potential',
    name: 'Potential Loyalists',
    count: 1567,
    value: 234500,
    percentage: 19,
    color: '#4299E1',
    icon: TrendingUp,
    description: 'Recent customers with growth potential',
    growth: 23.7
  },
  { 
    id: 'new',
    name: 'New Customers',
    count: 892,
    value: 98340,
    percentage: 11,
    color: '#9F7AEA',
    icon: Users,
    description: 'Recently acquired customers',
    growth: 45.2
  },
  { 
    id: 'at-risk',
    name: 'At Risk',
    count: 743,
    value: 125670,
    percentage: 9,
    color: '#F59E0B',
    icon: AlertTriangle,
    description: 'Previously good customers now inactive',
    growth: -15.3
  },
  { 
    id: 'cant-lose',
    name: "Can't Lose Them",
    count: 456,
    value: 234500,
    percentage: 5,
    color: '#ED8936',
    icon: AlertTriangle,
    description: 'High-value customers at risk',
    growth: -8.7
  },
  { 
    id: 'hibernating',
    name: 'Hibernating',
    count: 678,
    value: 45320,
    percentage: 8,
    color: '#718096',
    icon: Users,
    description: 'Low engagement customers',
    growth: -2.1
  },
  { 
    id: 'lost',
    name: 'Lost',
    count: 460,
    value: 12340,
    percentage: 5,
    color: '#E53E3E',
    icon: Users,
    description: 'No recent engagement',
    growth: -25.4
  }
];

const CustomerSegmentWheel = ({ data = segmentData, onSegmentClick }) => {
  const [view, setView] = useState('wheel');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Memoize expensive calculations
  const { value: processedData, computeCount } = useTrackedMemo(() => {
    return data.map(segment => ({
      ...segment,
      // Pre-calculate arc angles and positions for better performance
      angle: (segment.percentage / 100) * 2 * Math.PI,
      arcData: {
        startAngle: 0, // Will be calculated in pie layout
        endAngle: 0,   // Will be calculated in pie layout
        padAngle: 0.02
      }
    }));
  }, [data], 'segmentDataProcessing');

  // Memoize total calculations
  const totals = useMemo(() => ({
    customers: data.reduce((sum, segment) => sum + segment.count, 0),
    value: data.reduce((sum, segment) => sum + segment.value, 0)
  }), [data]);

  // Throttled draw function to prevent excessive re-renders
  const throttledDrawWheel = useThrottledMemo(() => drawWheel, [view, processedData], 100);

  useEffect(() => {
    if (view === 'wheel' && svgRef.current) {
      throttledDrawWheel();
    }
  }, [view, processedData, throttledDrawWheel]);

  const drawWheel = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;
    const innerRadius = radius * 0.6;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
      .value(d => d.percentage)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc')
      .data(pie(processedData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Draw segments
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.3s ease')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius + 10)
          );
        
        setHoveredSegment(d.data);
        const [x, y] = d3.pointer(event, svg.node());
        setTooltipPosition({ x, y });
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
        
        setHoveredSegment(null);
      })
      .on('click', (event, d) => {
        setSelectedSegment(d.data);
        if (onSegmentClick) {
          onSegmentClick(d.data);
        }
      });

    // Add labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(d => d.data.percentage > 5 ? `${d.data.percentage}%` : '');

    // Draw migration arrows (example)
    const migrations = [
      { from: 'new', to: 'potential', count: 45 },
      { from: 'potential', to: 'loyal', count: 32 },
      { from: 'loyal', to: 'champions', count: 28 },
      { from: 'loyal', to: 'at-risk', count: 15 }
    ];

    // This would be more complex in production
    // Just showing the concept
  }, [processedData]);

  // Memoized event handlers
  const handleSegmentClick = useCallback((segment) => {
    setSelectedSegment(segment);
    onSegmentClick?.(segment);
  }, [onSegmentClick]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  // Memoized tooltip handlers
  const handleTooltipShow = useCallback((segment, position) => {
    setHoveredSegment(segment);
    setTooltipPosition(position);
  }, []);

  const handleTooltipHide = useCallback(() => {
    setHoveredSegment(null);
  }, []);

  return (
    <Container>
      <Header>
        <Title>Customer Segmentation</Title>
        <ViewToggle>
          <ToggleButton
            active={view === 'wheel'}
            onClick={() => handleViewChange('wheel')}
          >
            Wheel View
          </ToggleButton>
          <ToggleButton
            active={view === 'list'}
            onClick={() => handleViewChange('list')}
          >
            List View
          </ToggleButton>
        </ViewToggle>
      </Header>

      {view === 'wheel' ? (
        <ChartContainer>
          <SVGContainer
            ref={svgRef}
            viewBox="0 0 400 400"
            preserveAspectRatio="xMidYMid meet"
          />
          
          <CenterMetrics>
            <TotalCustomers>{formatNumber(totals.customers)}</TotalCustomers>
            <TotalValue>{formatCurrency(totals.value)}/month</TotalValue>
          </CenterMetrics>

          <AnimatePresence>
            {hoveredSegment && (
              <SegmentTooltip
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  left: tooltipPosition.x + 20,
                  top: tooltipPosition.y - 20
                }}
              >
                <TooltipTitle>
                  <LegendColor color={hoveredSegment.color} />
                  {hoveredSegment.name}
                </TooltipTitle>
                <TooltipMetric>
                  <span>Customers:</span>
                  <span>{formatNumber(hoveredSegment.count)}</span>
                </TooltipMetric>
                <TooltipMetric>
                  <span>Value:</span>
                  <span>{formatCurrency(hoveredSegment.value)}</span>
                </TooltipMetric>
                <TooltipMetric>
                  <span>Growth:</span>
                  <span style={{ 
                    color: hoveredSegment.growth > 0 ? '#48BB78' : '#E53E3E' 
                  }}>
                    {hoveredSegment.growth > 0 ? '+' : ''}{hoveredSegment.growth}%
                  </span>
                </TooltipMetric>
              </SegmentTooltip>
            )}
          </AnimatePresence>
        </ChartContainer>
      ) : (
        <LegendContainer>
          {processedData.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <LegendItem
                key={segment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSegmentClick(segment)}
              >
                <LegendColor color={segment.color} />
                <LegendInfo>
                  <LegendName>
                    {segment.name} ({segment.percentage}%)
                  </LegendName>
                  <LegendValue>
                    {formatNumber(segment.count)} customers • {formatCurrency(segment.value)}
                  </LegendValue>
                </LegendInfo>
                <Icon size={20} color={segment.color} />
              </LegendItem>
            );
          })}
        </LegendContainer>
      )}
    </Container>
  );
};

// Apply memoization HOCs for performance optimization
export default withMemoization(
  withExpensiveComputation(CustomerSegmentWheel, {
    computations: {
      // D3 calculations are expensive, cache them
      pieLayout: (props) => {
        const pie = d3.pie()
          .value(d => d.percentage)
          .sort(null);
        return pie(props.data);
      },
      // Arc generator is also expensive to recreate
      arcGenerator: () => {
        return d3.arc()
          .innerRadius(120)
          .outerRadius(200);
      }
    },
    cacheSize: 5,
    displayName: 'CustomerSegmentWheel'
  }),
  {
    strategy: 'deep',
    displayName: 'CustomerSegmentWheel',
    debug: process.env.NODE_ENV === 'development'
  }
);