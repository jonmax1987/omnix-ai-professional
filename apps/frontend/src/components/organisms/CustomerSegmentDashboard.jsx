import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import CustomerSegmentWheel from './CustomerSegmentWheel';
import { useI18n } from '../../hooks/useI18n';

const DashboardContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing[4]};
  height: 100%;
  
  @media (min-width: ${props => props.theme.breakpoints.xl}) {
    grid-template-columns: 2fr 1fr;
  }
`;

const MainPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const WheelContainer = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.purple[500]}, ${props => props.theme.colors.blue[500]});
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const WheelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
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

const SegmentIcon = styled(motion.div)`
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
`;

const ViewSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const ViewOption = styled(motion.button)`
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

const SegmentMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const MetricCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.border.strong};
  }
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getMetricColor(props.type, props.theme)};
  line-height: 1;
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const SegmentsList = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: fit-content;
`;

const SegmentsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const SegmentItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    gap: ${props => props.theme.spacing[3]};
  }
`;

const SegmentColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid ${props => props.theme.colors.background.elevated};
  flex-shrink: 0;
`;

const SegmentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SegmentName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SegmentDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const SegmentStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing[1]};
  flex-shrink: 0;
`;

const SegmentCount = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const SegmentPercentage = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const TrendIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => getTrendColor(props.trend, props.theme)};
`;

const InsightsPanel = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  height: fit-content;
`;

const InsightItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.primary[50]};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AIIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.purple[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const ActionButton = styled(motion.button)`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.primary[300]};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.primary[50]};
  color: ${props => props.theme.colors.primary[700]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  &:hover {
    background: ${props => props.theme.colors.primary[100]};
    border-color: ${props => props.theme.colors.primary[400]};
  }
`;

// Helper functions
const getMetricColor = (type, theme) => {
  const colors = {
    customers: theme.colors.blue[600],
    revenue: theme.colors.green[600],
    growth: theme.colors.purple[600],
    retention: theme.colors.orange[600]
  };
  return colors[type] || theme.colors.text.primary;
};

const getTrendColor = (trend, theme) => {
  if (trend > 0) return theme.colors.green[600];
  if (trend < 0) return theme.colors.red[600];
  return theme.colors.gray[500];
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const CustomerSegmentDashboard = ({
  segments = [],
  view = 'customers',
  onSegmentClick,
  onViewChange,
  onActionClick,
  loading = false,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedView, setSelectedView] = useState(view);
  const [selectedSegment, setSelectedSegment] = useState(null);

  // Default segment data for demonstration
  const defaultSegments = [
    {
      id: 'champions',
      name: 'Champions',
      description: 'Bought recently, buy often and spend the most',
      color: '#10B981',
      customers: 1247,
      percentage: 12.5,
      revenue: 487500,
      trend: 8.5,
      avgOrderValue: 391,
      frequency: 4.2,
      recency: 15
    },
    {
      id: 'loyal-customers',
      name: 'Loyal Customers',
      description: 'Spend good money with us often. Responsive to promotions',
      color: '#3B82F6',
      customers: 2156,
      percentage: 21.6,
      revenue: 423600,
      trend: 5.2,
      avgOrderValue: 196,
      frequency: 3.1,
      recency: 22
    },
    {
      id: 'potential-loyalists',
      name: 'Potential Loyalists',
      description: 'Recent customers, but spent a good amount and bought more than once',
      color: '#8B5CF6',
      customers: 1834,
      percentage: 18.3,
      revenue: 312800,
      trend: 15.7,
      avgOrderValue: 171,
      frequency: 2.3,
      recency: 18
    },
    {
      id: 'new-customers',
      name: 'New Customers',
      description: 'Bought most recently, but not frequently',
      color: '#06B6D4',
      customers: 892,
      percentage: 8.9,
      revenue: 156780,
      trend: 23.4,
      avgOrderValue: 176,
      frequency: 1.2,
      recency: 8
    },
    {
      id: 'promising',
      name: 'Promising',
      description: 'Recent shoppers, but haven\'t spent much',
      color: '#84CC16',
      customers: 756,
      percentage: 7.6,
      revenue: 89400,
      trend: 12.1,
      avgOrderValue: 118,
      frequency: 1.8,
      recency: 12
    },
    {
      id: 'need-attention',
      name: 'Need Attention',
      description: 'Above average recency, frequency and monetary values. May not have bought recently',
      color: '#F59E0B',
      customers: 1123,
      percentage: 11.2,
      revenue: 234600,
      trend: -3.2,
      avgOrderValue: 209,
      frequency: 2.9,
      recency: 45
    },
    {
      id: 'about-to-sleep',
      name: 'About to Sleep',
      description: 'Below average recency, frequency and monetary values. Will lose them if not reactivated',
      color: '#EF4444',
      customers: 967,
      percentage: 9.7,
      revenue: 145050,
      trend: -8.7,
      avgOrderValue: 150,
      frequency: 2.1,
      recency: 67
    },
    {
      id: 'at-risk',
      name: 'At Risk',
      description: 'Spent big money and purchased often. But long time ago. Need to bring them back!',
      color: '#DC2626',
      customers: 534,
      percentage: 5.3,
      revenue: 98700,
      trend: -12.4,
      avgOrderValue: 185,
      frequency: 1.8,
      recency: 89
    }
  ];

  const currentSegments = segments.length > 0 ? segments : defaultSegments;

  const totalMetrics = useMemo(() => {
    const totalCustomers = currentSegments.reduce((sum, s) => sum + s.customers, 0);
    const totalRevenue = currentSegments.reduce((sum, s) => sum + s.revenue, 0);
    const avgGrowth = currentSegments.reduce((sum, s) => sum + s.trend, 0) / currentSegments.length;
    const topSegments = currentSegments.filter(s => s.trend > 10).length;
    
    return {
      customers: totalCustomers,
      revenue: totalRevenue,
      growth: avgGrowth,
      performers: topSegments
    };
  }, [currentSegments]);

  const viewOptions = [
    { id: 'customers', label: 'Customers', icon: 'users' },
    { id: 'revenue', label: 'Revenue', icon: 'dollarSign' },
    { id: 'frequency', label: 'Frequency', icon: 'repeat' },
    { id: 'recency', label: 'Recency', icon: 'clock' }
  ];

  const handleViewChange = (viewId) => {
    setSelectedView(viewId);
    onViewChange?.(viewId);
  };

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
    onSegmentClick?.(segment);
  };

  const aiInsights = [
    {
      id: 'insight-1',
      text: 'Champions segment growing 8.5% - consider premium product line expansion',
      confidence: 92
    },
    {
      id: 'insight-2',
      text: 'At Risk customers need immediate re-engagement campaign to prevent churn',
      confidence: 94
    },
    {
      id: 'insight-3',
      text: 'New Customers showing 23% growth - optimize onboarding experience',
      confidence: 89
    }
  ];

  return (
    <DashboardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <MainPanel>
        <WheelContainer>
          <WheelHeader>
            <HeaderLeft>
              <SegmentIcon
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <Icon name="users" size={18} />
              </SegmentIcon>
              <div>
                <Typography variant="h4" weight="semibold">
                  Customer Segmentation
                </Typography>
                <Typography variant="caption" color="secondary">
                  RFM Analysis with AI Insights
                </Typography>
              </div>
            </HeaderLeft>

            <HeaderRight>
              <ViewSelector>
                {viewOptions.map(option => (
                  <ViewOption
                    key={option.id}
                    active={selectedView === option.id}
                    onClick={() => handleViewChange(option.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon name={option.icon} size={12} />
                    {option.label}
                  </ViewOption>
                ))}
              </ViewSelector>
              
              <Button variant="ghost" size="sm">
                <Icon name="refresh" size={16} />
              </Button>
            </HeaderRight>
          </WheelHeader>

          <SegmentMetrics>
            <MetricCard whileHover={{ scale: 1.02 }}>
              <MetricValue type="customers">{formatNumber(totalMetrics.customers)}</MetricValue>
              <MetricLabel>Total Customers</MetricLabel>
            </MetricCard>
            <MetricCard whileHover={{ scale: 1.02 }}>
              <MetricValue type="revenue">{formatCurrency(totalMetrics.revenue)}</MetricValue>
              <MetricLabel>Total Revenue</MetricLabel>
            </MetricCard>
            <MetricCard whileHover={{ scale: 1.02 }}>
              <MetricValue type="growth">{totalMetrics.growth.toFixed(1)}%</MetricValue>
              <MetricLabel>Avg Growth</MetricLabel>
            </MetricCard>
            <MetricCard whileHover={{ scale: 1.02 }}>
              <MetricValue type="performers">{totalMetrics.performers}</MetricValue>
              <MetricLabel>High Performers</MetricLabel>
            </MetricCard>
          </SegmentMetrics>

          <CustomerSegmentWheel
            segments={currentSegments}
            view={selectedView}
            onSegmentClick={handleSegmentClick}
            selectedSegment={selectedSegment}
          />
        </WheelContainer>

        <ActionButtons>
          <ActionButton
            onClick={() => onActionClick?.('export')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon name="download" size={16} />
            Export Segments
          </ActionButton>
          <ActionButton
            onClick={() => onActionClick?.('campaign')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon name="mail" size={16} />
            Create Campaign
          </ActionButton>
          <ActionButton
            onClick={() => onActionClick?.('analyze')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon name="barChart3" size={16} />
            Deep Analysis
          </ActionButton>
        </ActionButtons>
      </MainPanel>

      <SidePanel>
        <SegmentsList>
          <SegmentsHeader>
            <Typography variant="h6" weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="list" size={20} />
              Segment Details
            </Typography>
          </SegmentsHeader>
          
          {currentSegments.map((segment, index) => (
            <SegmentItem
              key={segment.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ x: -4 }}
              onClick={() => handleSegmentClick(segment)}
            >
              <SegmentColor color={segment.color} />
              
              <SegmentInfo>
                <SegmentName>{segment.name}</SegmentName>
                <SegmentDescription>{segment.description}</SegmentDescription>
              </SegmentInfo>
              
              <SegmentStats>
                <SegmentCount>{formatNumber(segment.customers)}</SegmentCount>
                <SegmentPercentage>{segment.percentage}%</SegmentPercentage>
                <TrendIndicator trend={segment.trend}>
                  <Icon 
                    name={segment.trend > 0 ? 'trendingUp' : segment.trend < 0 ? 'trendingDown' : 'minus'} 
                    size={12} 
                  />
                  {Math.abs(segment.trend).toFixed(1)}%
                </TrendIndicator>
              </SegmentStats>
            </SegmentItem>
          ))}
        </SegmentsList>

        <InsightsPanel>
          <Typography variant="h6" weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Icon name="brain" size={20} />
            AI Insights
          </Typography>
          
          {aiInsights.map((insight, index) => (
            <InsightItem
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <AIIcon>AI</AIIcon>
              <div style={{ flex: 1 }}>
                <Typography variant="body2" style={{ lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  {insight.text}
                </Typography>
                <Badge variant="info" size="sm">
                  {insight.confidence}% confidence
                </Badge>
              </div>
            </InsightItem>
          ))}
        </InsightsPanel>
      </SidePanel>
    </DashboardContainer>
  );
};

export default CustomerSegmentDashboard;