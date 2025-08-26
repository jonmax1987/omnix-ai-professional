import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import { useI18n } from '../../hooks/useI18n';

const progressShine = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const achievementGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
  }
`;

const TrackingContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  ${props => props.overallAchievement >= 100 && css`
    border-color: ${props.theme.colors.green[500]};
    animation: ${achievementGlow} 3s ease-in-out infinite;
  `}
`;

const TrackingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.overallAchievement >= 100 
    ? `linear-gradient(135deg, ${props.theme.colors.green[50]}, ${props.theme.colors.green[100]})`
    : `linear-gradient(135deg, ${props.theme.colors.primary[50]}, ${props.theme.colors.purple[50]})`};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const PerformanceIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.achieved 
    ? `linear-gradient(135deg, ${props.theme.colors.green[500]}, ${props.theme.colors.green[600]})`
    : `linear-gradient(135deg, ${props.theme.colors.primary[500]}, ${props.theme.colors.purple[500]})`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  
  ${props => props.achieved && css`
    &::after {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${props.theme.colors.green[500]}, ${props.theme.colors.green[600]});
      z-index: -1;
      opacity: 0.3;
      animation: ${achievementGlow} 2s ease-in-out infinite;
    }
  `}
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const PeriodSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const PeriodTab = styled(motion.button)`
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

const OverallProgress = styled.div`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const OverallHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const OverallValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getAchievementColor(props.percentage, props.theme)};
  line-height: 1;
`;

const OverallLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing[1]};
`;

const ProgressContainer = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const CustomProgress = styled.div`
  width: 100%;
  height: 12px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[1]};
  overflow: hidden;
  position: relative;
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: ${props => getProgressGradient(props.percentage, props.theme)};
  border-radius: ${props => props.theme.spacing[1]};
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: ${progressShine} 2s ease-in-out infinite;
  }
`;

const TargetMarker = styled.div`
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  background: ${props => props.theme.colors.gray[700]};
  border-radius: 1px;
  left: ${props => Math.min(props.position, 100)}%;
  
  &::after {
    content: 'Target';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: ${props => props.theme.colors.text.tertiary};
    white-space: nowrap;
  }
`;

const MetricsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[2]} 0;
`;

const MetricCard = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  position: relative;
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.achieved && css`
    background: linear-gradient(90deg, ${props.theme.colors.green[25]} 0%, transparent 100%);
    border-left: 4px solid ${props.theme.colors.green[500]};
  `}
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    gap: ${props => props.theme.spacing[3]};
  }
`;

const MetricIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getMetricGradient(props.category, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 40px;
    height: 40px;
  }
`;

const MetricContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const MetricTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
`;

const MetricBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const MetricValues = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const MetricValue = styled.div`
  text-align: center;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    text-align: left;
  }
`;

const ValueNumber = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => getValueColor(props.type, props.theme)};
  line-height: 1.2;
`;

const ValueLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: ${props => props.theme.spacing[1]};
`;

const MetricProgress = styled.div`
  position: relative;
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TrendIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => getTrendColor(props.trend, props.theme)};
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
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
const getAchievementColor = (percentage, theme) => {
  if (percentage >= 100) return theme.colors.green[600];
  if (percentage >= 80) return theme.colors.blue[600];
  if (percentage >= 60) return theme.colors.yellow[600];
  return theme.colors.red[600];
};

const getProgressGradient = (percentage, theme) => {
  if (percentage >= 100) {
    return `linear-gradient(90deg, ${theme.colors.green[500]}, ${theme.colors.green[400]})`;
  }
  if (percentage >= 80) {
    return `linear-gradient(90deg, ${theme.colors.blue[500]}, ${theme.colors.blue[400]})`;
  }
  if (percentage >= 60) {
    return `linear-gradient(90deg, ${theme.colors.yellow[500]}, ${theme.colors.yellow[400]})`;
  }
  return `linear-gradient(90deg, ${theme.colors.red[500]}, ${theme.colors.red[400]})`;
};

const getMetricGradient = (category, theme) => {
  const gradients = {
    revenue: `linear-gradient(135deg, ${theme.colors.green[500]}, ${theme.colors.green[600]})`,
    sales: `linear-gradient(135deg, ${theme.colors.blue[500]}, ${theme.colors.blue[600]})`,
    inventory: `linear-gradient(135deg, ${theme.colors.purple[500]}, ${theme.colors.purple[600]})`,
    customer: `linear-gradient(135deg, ${theme.colors.orange[500]}, ${theme.colors.orange[600]})`,
    operational: `linear-gradient(135deg, ${theme.colors.teal[500]}, ${theme.colors.teal[600]})`
  };
  return gradients[category] || `linear-gradient(135deg, ${theme.colors.gray[400]}, ${theme.colors.gray[500]})`;
};

const getValueColor = (type, theme) => {
  const colors = {
    actual: theme.colors.text.primary,
    target: theme.colors.text.secondary,
    achievement: theme.colors.primary[600]
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

const PerformanceVsTargets = ({
  metrics = [],
  period = 'monthly',
  onMetricClick,
  onPeriodChange,
  loading = false,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const periods = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly' }
  ];

  // Mock data for demonstration
  const defaultMetrics = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      category: 'revenue',
      icon: 'dollarSign',
      actual: 487500,
      target: 500000,
      unit: 'currency',
      trend: 12.5,
      period: 'This Month'
    },
    {
      id: 'sales-volume',
      title: 'Sales Volume',
      category: 'sales',
      icon: 'shopping-cart',
      actual: 1347,
      target: 1200,
      unit: 'number',
      trend: 8.7,
      period: 'This Month'
    },
    {
      id: 'inventory-turnover',
      title: 'Inventory Turnover',
      category: 'inventory',
      icon: 'repeat',
      actual: 4.2,
      target: 4.0,
      unit: 'decimal',
      trend: 5.0,
      period: 'This Quarter'
    },
    {
      id: 'customer-acquisition',
      title: 'New Customers',
      category: 'customer',
      icon: 'users',
      actual: 234,
      target: 300,
      unit: 'number',
      trend: -5.2,
      period: 'This Month'
    },
    {
      id: 'avg-order-value',
      title: 'Average Order Value',
      category: 'sales',
      icon: 'creditCard',
      actual: 156.80,
      target: 150.00,
      unit: 'currency',
      trend: 4.5,
      period: 'This Month'
    },
    {
      id: 'gross-margin',
      title: 'Gross Margin',
      category: 'revenue',
      icon: 'percent',
      actual: 42.3,
      target: 40.0,
      unit: 'percentage',
      trend: 2.8,
      period: 'This Month'
    },
    {
      id: 'fulfillment-rate',
      title: 'Order Fulfillment Rate',
      category: 'operational',
      icon: 'truck',
      actual: 96.5,
      target: 98.0,
      unit: 'percentage',
      trend: -1.5,
      period: 'This Week'
    },
    {
      id: 'customer-satisfaction',
      title: 'Customer Satisfaction',
      category: 'customer',
      icon: 'star',
      actual: 4.7,
      target: 4.5,
      unit: 'rating',
      trend: 6.8,
      period: 'This Month'
    }
  ];

  const currentMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  // Calculate overall achievement
  const overallAchievement = useMemo(() => {
    const achievements = currentMetrics.map(metric => (metric.actual / metric.target) * 100);
    return achievements.reduce((sum, achievement) => sum + achievement, 0) / achievements.length;
  }, [currentMetrics]);

  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    onPeriodChange?.(periodId);
  };

  const formatValue = (value, unit) => {
    switch (unit) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${value}%`;
      case 'rating':
        return `${value}/5`;
      case 'decimal':
        return value.toFixed(1);
      default:
        return formatNumber(value);
    }
  };

  return (
    <TrackingContainer
      overallAchievement={overallAchievement}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <TrackingHeader overallAchievement={overallAchievement}>
        <HeaderLeft>
          <PerformanceIcon achieved={overallAchievement >= 100}>
            <Icon name={overallAchievement >= 100 ? 'trophy' : 'target'} size={18} />
          </PerformanceIcon>
          <div>
            <Typography variant="h5" weight="semibold">
              Performance vs Targets
            </Typography>
            <Typography variant="caption" color="secondary">
              {currentMetrics.length} metrics tracked
            </Typography>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <PeriodSelector>
            {periods.map(periodOption => (
              <PeriodTab
                key={periodOption.id}
                active={selectedPeriod === periodOption.id}
                onClick={() => handlePeriodChange(periodOption.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {periodOption.label}
              </PeriodTab>
            ))}
          </PeriodSelector>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </TrackingHeader>

      <OverallProgress>
        <OverallHeader>
          <div>
            <OverallValue percentage={overallAchievement}>
              {Math.round(overallAchievement)}%
            </OverallValue>
            <OverallLabel>Overall Achievement</OverallLabel>
          </div>
          <Badge 
            variant={overallAchievement >= 100 ? 'success' : overallAchievement >= 80 ? 'info' : overallAchievement >= 60 ? 'warning' : 'danger'}
            size="md"
          >
            {overallAchievement >= 100 ? 'Exceeded' : 
             overallAchievement >= 80 ? 'On Track' : 
             overallAchievement >= 60 ? 'Behind' : 'Critical'}
          </Badge>
        </OverallHeader>
        
        <ProgressContainer>
          <CustomProgress>
            <ProgressBar
              percentage={overallAchievement}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(overallAchievement, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <TargetMarker position={100} />
          </CustomProgress>
        </ProgressContainer>
      </OverallProgress>

      <MetricsList>
        {loading ? (
          <EmptyState>
            <Icon name="target" size={48} />
            <Typography variant="body1" color="secondary">
              Loading performance metrics...
            </Typography>
          </EmptyState>
        ) : currentMetrics.length === 0 ? (
          <EmptyState>
            <Icon name="target" size={48} />
            <div>
              <Typography variant="h6" weight="medium">
                No metrics configured
              </Typography>
              <Typography variant="body2" color="secondary">
                Set up performance targets to track progress
              </Typography>
            </div>
          </EmptyState>
        ) : (
          currentMetrics.map((metric, index) => {
            const achievement = (metric.actual / metric.target) * 100;
            const isAchieved = achievement >= 100;
            
            return (
              <MetricCard
                key={metric.id}
                achieved={isAchieved}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => onMetricClick?.(metric)}
              >
                <MetricIcon category={metric.category}>
                  <Icon name={metric.icon} size={24} />
                </MetricIcon>

                <MetricContent>
                  <MetricHeader>
                    <MetricTitle>{metric.title}</MetricTitle>
                    <MetricBadge>
                      {isAchieved && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <Icon name="trophy" size={16} color="gold" />
                        </motion.div>
                      )}
                      <Badge 
                        variant={isAchieved ? 'success' : achievement >= 80 ? 'info' : achievement >= 60 ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {Math.round(achievement)}%
                      </Badge>
                    </MetricBadge>
                  </MetricHeader>

                  <MetricValues>
                    <MetricValue>
                      <ValueNumber type="actual">
                        {formatValue(metric.actual, metric.unit)}
                      </ValueNumber>
                      <ValueLabel>Actual</ValueLabel>
                    </MetricValue>
                    <MetricValue>
                      <ValueNumber type="target">
                        {formatValue(metric.target, metric.unit)}
                      </ValueNumber>
                      <ValueLabel>Target</ValueLabel>
                    </MetricValue>
                    <MetricValue>
                      <ValueNumber type="achievement">
                        {formatValue(metric.actual - metric.target, metric.unit)}
                      </ValueNumber>
                      <ValueLabel>Variance</ValueLabel>
                    </MetricValue>
                  </MetricValues>

                  <MetricProgress>
                    <ProgressInfo>
                      <Typography variant="caption" color="secondary">
                        {metric.period}
                      </Typography>
                      <Typography variant="caption" color={achievement >= 100 ? 'success' : 'secondary'}>
                        {Math.round(achievement)}% of target
                      </Typography>
                    </ProgressInfo>
                    
                    <CustomProgress>
                      <ProgressBar
                        percentage={achievement}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(achievement, 100)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                      <TargetMarker position={100} />
                    </CustomProgress>
                  </MetricProgress>
                </MetricContent>

                <TrendIndicator trend={metric.trend}>
                  <Icon 
                    name={metric.trend > 0 ? 'trendingUp' : metric.trend < 0 ? 'trendingDown' : 'minus'} 
                    size={12} 
                  />
                  {Math.abs(metric.trend).toFixed(1)}%
                </TrendIndicator>
              </MetricCard>
            );
          })
        )}
      </MetricsList>
    </TrackingContainer>
  );
};

export default PerformanceVsTargets;