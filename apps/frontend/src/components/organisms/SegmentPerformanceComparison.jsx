import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import { useI18n } from '../../hooks/useI18n';

const ComparisonContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ComparisonHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[50]}, ${props => props.theme.colors.purple[50]});
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

const ComparisonIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.purple[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const MetricSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const MetricOption = styled(motion.button)`
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
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  
  &:hover {
    color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  }
`;

const SegmentSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
    flex-wrap: wrap;
  }
`;

const SelectorLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
`;

const SegmentTags = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
  flex: 1;
`;

const SegmentTag = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.selected ? props.color + '20' : props.theme.colors.background.elevated};
  border: 1px solid ${props => props.selected ? props.color : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[4]};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    border-color: ${props => props.color};
    background: ${props => props.color + '10'};
  }
`;

const SegmentDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const AddSegmentButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px dashed ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[4]};
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[400]};
    color: ${props => props.theme.colors.primary[600]};
    background: ${props => props.theme.colors.primary[50]};
  }
`;

const ComparisonContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[4]} 0;
`;

const ComparisonTable = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing[2]};
  margin: 0 ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    margin: 0 ${props => props.theme.spacing[4]};
    grid-template-columns: 150px repeat(auto-fit, minmax(120px, 1fr));
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const TableHeader = styled.div`
  display: contents;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const HeaderCell = styled.div`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
  border: 1px solid ${props => props.theme.colors.border.subtle};
  
  &:first-child {
    text-align: left;
  }
`;

const SegmentHeader = styled(HeaderCell)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  background: ${props => props.color + '10'};
  border-color: ${props => props.color + '40'};
`;

const MetricRow = styled.div`
  display: contents;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: block;
    background: ${props => props.theme.colors.background.elevated};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.spacing[2]};
    padding: ${props => props.theme.spacing[3]};
    margin-bottom: ${props => props.theme.spacing[3]};
  }
`;

const MetricLabel = styled.div`
  padding: ${props => props.theme.spacing[3]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    background: transparent;
    border: none;
    padding: 0 0 ${props => props.theme.spacing[2]} 0;
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }
`;

const MetricCell = styled(motion.div)`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  text-align: center;
  border: 1px solid ${props => props.theme.colors.border.default};
  position: relative;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    border-color: ${props => props.segmentColor || props.theme.colors.border.strong};
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  ${props => props.isWinner && css`
    border-color: ${props.theme.colors.green[400]};
    background: ${props.theme.colors.green[50]};
    
    &::after {
      content: '👑';
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 16px;
    }
  `}
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    margin-bottom: ${props => props.theme.spacing[2]};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.2;
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => getTrendColor(props.change, props.theme)};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    justify-content: flex-end;
  }
`;

const ComparisonChart = styled.div`
  margin: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    margin: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    padding: ${props => props.theme.spacing[3]};
  }
`;

const ChartTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[3]};
  text-align: center;
`;

const ChartBars = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 200px;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} 0;
`;

const ChartBar = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 100px;
`;

const Bar = styled(motion.div)`
  width: 100%;
  background: linear-gradient(180deg, ${props => props.color}, ${props => props.color}80);
  border-radius: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[1]} 0 0;
  margin-bottom: ${props => props.theme.spacing[2]};
  position: relative;
  
  &::after {
    content: '${props => props.value}';
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    font-size: ${props => props.theme.typography.fontSize.xs};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    white-space: nowrap;
  }
`;

const BarLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  line-height: 1.2;
  max-width: 80px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.text.tertiary};
`;

// Helper functions
const getTrendColor = (change, theme) => {
  if (change > 0) return theme.colors.green[600];
  if (change < 0) return theme.colors.red[600];
  return theme.colors.gray[500];
};

const formatValue = (value, metric) => {
  switch (metric) {
    case 'revenue':
    case 'avgOrderValue':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(value);
    case 'customers':
      return value.toLocaleString();
    case 'frequency':
    case 'recency':
      return value.toFixed(1);
    case 'retention':
    case 'conversion':
      return `${value.toFixed(1)}%`;
    default:
      return value.toString();
  }
};

const getMetricIcon = (metric) => {
  const icons = {
    customers: 'users',
    revenue: 'dollarSign',
    avgOrderValue: 'creditCard',
    frequency: 'repeat',
    recency: 'clock',
    retention: 'heart',
    conversion: 'trendingUp'
  };
  return icons[metric] || 'barChart3';
};

const SegmentPerformanceComparison = ({
  segments = [],
  selectedMetric = 'revenue',
  selectedSegments = [],
  onMetricChange,
  onSegmentSelect,
  onSegmentDeselect,
  loading = false,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [currentMetric, setCurrentMetric] = useState(selectedMetric);
  const [compareSegments, setCompareSegments] = useState(selectedSegments);

  // Default segments for demonstration
  const defaultSegments = [
    {
      id: 'champions',
      name: 'Champions',
      color: '#10B981',
      customers: 1247,
      revenue: 487500,
      avgOrderValue: 391,
      frequency: 4.2,
      recency: 15,
      retention: 94.5,
      conversion: 8.7,
      revenueChange: 8.5,
      customersChange: 5.2,
      frequencyChange: 2.1
    },
    {
      id: 'loyal-customers',
      name: 'Loyal Customers',
      color: '#3B82F6',
      customers: 2156,
      revenue: 423600,
      avgOrderValue: 196,
      frequency: 3.1,
      recency: 22,
      retention: 87.3,
      conversion: 6.4,
      revenueChange: 5.2,
      customersChange: 3.8,
      frequencyChange: 1.5
    },
    {
      id: 'potential-loyalists',
      name: 'Potential Loyalists',
      color: '#8B5CF6',
      customers: 1834,
      revenue: 312800,
      avgOrderValue: 171,
      frequency: 2.3,
      recency: 18,
      retention: 68.9,
      conversion: 12.1,
      revenueChange: 15.7,
      customersChange: 23.4,
      frequencyChange: 8.9
    },
    {
      id: 'at-risk',
      name: 'At Risk',
      color: '#EF4444',
      customers: 534,
      revenue: 98700,
      avgOrderValue: 185,
      frequency: 1.8,
      recency: 89,
      retention: 34.2,
      conversion: 2.3,
      revenueChange: -12.4,
      customersChange: -8.7,
      frequencyChange: -15.3
    }
  ];

  const currentSegments = segments.length > 0 ? segments : defaultSegments;

  const metrics = [
    { id: 'revenue', label: 'Revenue', icon: 'dollarSign' },
    { id: 'customers', label: 'Customers', icon: 'users' },
    { id: 'avgOrderValue', label: 'AOV', icon: 'creditCard' },
    { id: 'frequency', label: 'Frequency', icon: 'repeat' },
    { id: 'retention', label: 'Retention', icon: 'heart' },
    { id: 'conversion', label: 'Conversion', icon: 'trendingUp' }
  ];

  const currentCompareSegments = useMemo(() => {
    if (compareSegments.length === 0) {
      return currentSegments.slice(0, 3); // Default to first 3 segments
    }
    return currentSegments.filter(segment => compareSegments.includes(segment.id));
  }, [currentSegments, compareSegments]);

  const handleMetricChange = (metric) => {
    setCurrentMetric(metric);
    onMetricChange?.(metric);
  };

  const handleSegmentToggle = (segmentId) => {
    const isSelected = compareSegments.includes(segmentId);
    if (isSelected) {
      const newSelection = compareSegments.filter(id => id !== segmentId);
      setCompareSegments(newSelection);
      onSegmentDeselect?.(segmentId);
    } else {
      const newSelection = [...compareSegments, segmentId];
      setCompareSegments(newSelection);
      onSegmentSelect?.(segmentId);
    }
  };

  const getWinner = (metric) => {
    if (currentCompareSegments.length === 0) return null;
    
    return currentCompareSegments.reduce((winner, segment) => {
      return segment[metric] > winner[metric] ? segment : winner;
    });
  };

  const getMaxValue = (metric) => {
    return Math.max(...currentCompareSegments.map(segment => segment[metric]));
  };

  const winner = getWinner(currentMetric);
  const maxValue = getMaxValue(currentMetric);

  return (
    <ComparisonContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <ComparisonHeader>
        <HeaderLeft>
          <ComparisonIcon
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <Icon name="gitCompare" size={18} />
          </ComparisonIcon>
          <div>
            <Typography variant="h5" weight="semibold">
              Segment Performance Comparison
            </Typography>
            <Typography variant="caption" color="secondary">
              Compare {currentCompareSegments.length} segments across key metrics
            </Typography>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <MetricSelector>
            {metrics.map(metric => (
              <MetricOption
                key={metric.id}
                active={currentMetric === metric.id}
                onClick={() => handleMetricChange(metric.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name={metric.icon} size={12} />
                {metric.label}
              </MetricOption>
            ))}
          </MetricSelector>
          
          <Button variant="ghost" size="sm">
            <Icon name="download" size={16} />
          </Button>
        </HeaderRight>
      </ComparisonHeader>

      <SegmentSelector>
        <SelectorLabel>Compare:</SelectorLabel>
        <SegmentTags>
          {currentSegments.map(segment => (
            <SegmentTag
              key={segment.id}
              color={segment.color}
              selected={compareSegments.length === 0 || compareSegments.includes(segment.id)}
              onClick={() => handleSegmentToggle(segment.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SegmentDot color={segment.color} />
              <Typography variant="caption">{segment.name}</Typography>
              {(compareSegments.length === 0 || compareSegments.includes(segment.id)) && (
                <Icon name="check" size={12} />
              )}
            </SegmentTag>
          ))}
          <AddSegmentButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon name="plus" size={12} />
            Add Segment
          </AddSegmentButton>
        </SegmentTags>
      </SegmentSelector>

      <ComparisonContent>
        {currentCompareSegments.length === 0 ? (
          <EmptyState>
            <Icon name="gitCompare" size={48} />
            <div>
              <Typography variant="h6" weight="medium">
                Select segments to compare
              </Typography>
              <Typography variant="body2" color="secondary">
                Choose 2 or more segments from the list above
              </Typography>
            </div>
          </EmptyState>
        ) : (
          <>
            <ComparisonTable>
              <TableHeader>
                <HeaderCell>Metrics</HeaderCell>
                {currentCompareSegments.map(segment => (
                  <SegmentHeader key={segment.id} color={segment.color}>
                    <SegmentDot color={segment.color} />
                    {segment.name}
                  </SegmentHeader>
                ))}
              </TableHeader>

              {metrics.map(metric => (
                <MetricRow key={metric.id}>
                  <MetricLabel>
                    <Icon name={metric.icon} size={16} />
                    {metric.label}
                  </MetricLabel>
                  {currentCompareSegments.map(segment => {
                    const isWinner = winner && segment.id === winner.id && currentMetric === metric.id;
                    const changeKey = `${metric.id}Change`;
                    const change = segment[changeKey] || 0;
                    
                    return (
                      <MetricCell
                        key={segment.id}
                        segmentColor={segment.color}
                        isWinner={isWinner}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MetricValue>
                          {formatValue(segment[metric.id], metric.id)}
                        </MetricValue>
                        <MetricChange change={change}>
                          <Icon 
                            name={change > 0 ? 'trendingUp' : change < 0 ? 'trendingDown' : 'minus'} 
                            size={10} 
                          />
                          {Math.abs(change).toFixed(1)}%
                        </MetricChange>
                      </MetricCell>
                    );
                  })}
                </MetricRow>
              ))}
            </ComparisonTable>

            <ComparisonChart>
              <ChartTitle>
                {metrics.find(m => m.id === currentMetric)?.label} Comparison
              </ChartTitle>
              <ChartBars>
                {currentCompareSegments.map(segment => (
                  <ChartBar key={segment.id}>
                    <Bar
                      color={segment.color}
                      value={formatValue(segment[currentMetric], currentMetric)}
                      initial={{ height: 0 }}
                      animate={{ 
                        height: `${(segment[currentMetric] / maxValue) * 150}px` 
                      }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                    <BarLabel>{segment.name}</BarLabel>
                  </ChartBar>
                ))}
              </ChartBars>
            </ComparisonChart>
          </>
        )}
      </ComparisonContent>
    </ComparisonContainer>
  );
};

export default SegmentPerformanceComparison;