import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import { useI18n } from '../../hooks/useI18n';

const flowAnimation = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

const JourneyContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const JourneyHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[50]}, ${props => props.theme.colors.blue[50]});
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

const JourneyIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.blue[500]});
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
  background: ${props => props.theme.colors.background.elevated};
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
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  
  &:hover {
    color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  }
`;

const JourneyStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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

const JourneyFlow = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing[6]};
  overflow-x: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const FlowContainer = styled.div`
  display: flex;
  align-items: center;
  min-width: 800px;
  height: 300px;
  position: relative;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    min-width: 600px;
    height: 250px;
  }
`;

const FlowStage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 2;
`;

const StageIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => getStageGradient(props.stage, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: ${props => props.theme.spacing[3]};
  position: relative;
  border: 4px solid ${props => props.theme.colors.background.elevated};
  box-shadow: ${props => props.theme.shadows.lg};
  
  &::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: ${props => getStageGradient(props.stage, props.theme)};
    z-index: -1;
    opacity: 0.3;
    animation: ${props => props.animate ? flowAnimation : 'none'} 2s ease-in-out infinite;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 60px;
    height: 60px;
    margin-bottom: ${props => props.theme.spacing[2]};
  }
`;

const StageTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const StageMetrics = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const StageCount = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const StagePercentage = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const ConversionRate = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => getTrendColor(props.rate, props.theme)};
  background: ${props => props.theme.colors.background.elevated};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const FlowArrow = styled(motion.div)`
  position: absolute;
  top: 40px;
  left: ${props => props.position}%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, ${props => props.theme.colors.primary[400]}, ${props => props.theme.colors.primary[600]});
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    right: -8px;
    top: -3px;
    width: 0;
    height: 0;
    border-left: 8px solid ${props => props.theme.colors.primary[500]};
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
  }
  
  &::before {
    content: '${props => props.conversion}%';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: ${props => props.theme.typography.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
    background: ${props => props.theme.colors.background.elevated};
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid ${props => props.theme.colors.border.subtle};
    white-space: nowrap;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    top: 30px;
    width: 40px;
    
    &::before {
      font-size: 10px;
      padding: 1px 4px;
    }
  }
`;

const AnimatedFlow = styled(motion.div)`
  position: absolute;
  top: 40px;
  left: ${props => props.position}%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary[500]};
  z-index: 3;
`;

const JourneyDetails = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[4]};
`;

const DetailCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
`;

const DetailTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[3]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
`;

const DetailLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const DetailValue = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

// Helper functions
const getStatColor = (type, theme) => {
  const colors = {
    total: theme.colors.primary[600],
    conversion: theme.colors.green[600],
    dropoff: theme.colors.red[600],
    time: theme.colors.blue[600]
  };
  return colors[type] || theme.colors.text.primary;
};

const getStageGradient = (stage, theme) => {
  const gradients = {
    awareness: `linear-gradient(135deg, ${theme.colors.blue[500]}, ${theme.colors.blue[600]})`,
    interest: `linear-gradient(135deg, ${theme.colors.purple[500]}, ${theme.colors.purple[600]})`,
    consideration: `linear-gradient(135deg, ${theme.colors.orange[500]}, ${theme.colors.orange[600]})`,
    purchase: `linear-gradient(135deg, ${theme.colors.green[500]}, ${theme.colors.green[600]})`,
    loyalty: `linear-gradient(135deg, ${theme.colors.yellow[500]}, ${theme.colors.yellow[600]})`
  };
  return gradients[stage] || `linear-gradient(135deg, ${theme.colors.gray[400]}, ${theme.colors.gray[500]})`;
};

const getTrendColor = (rate, theme) => {
  if (rate >= 75) return theme.colors.green[600];
  if (rate >= 50) return theme.colors.yellow[600];
  return theme.colors.red[600];
};

const getStageIcon = (stage) => {
  const icons = {
    awareness: 'eye',
    interest: 'heart',
    consideration: 'search',
    purchase: 'shopping-cart',
    loyalty: 'award'
  };
  return icons[stage] || 'circle';
};

const formatDuration = (days) => {
  if (days < 1) return `${Math.round(days * 24)}h`;
  if (days < 7) return `${Math.round(days)}d`;
  return `${Math.round(days / 7)}w`;
};

const CustomerJourneyVisualization = ({
  journeyData = [],
  view = 'conversion',
  onStageClick,
  onViewChange,
  animateFlow = true,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedView, setSelectedView] = useState(view);
  const [selectedStage, setSelectedStage] = useState(null);
  const [flowDots, setFlowDots] = useState([]);

  // Default journey data
  const defaultJourney = [
    {
      id: 'awareness',
      name: 'Awareness',
      icon: 'eye',
      customers: 10000,
      percentage: 100,
      conversionRate: 45,
      avgTime: 0.5,
      dropoffRate: 55,
      channels: ['Social Media', 'Search Ads', 'Referrals'],
      touchpoints: 3.2
    },
    {
      id: 'interest',
      name: 'Interest',
      icon: 'heart',
      customers: 4500,
      percentage: 45,
      conversionRate: 67,
      avgTime: 2.1,
      dropoffRate: 33,
      channels: ['Email', 'Content', 'Retargeting'],
      touchpoints: 5.7
    },
    {
      id: 'consideration',
      name: 'Consideration',
      icon: 'search',
      customers: 3015,
      percentage: 67,
      conversionRate: 34,
      avgTime: 7.3,
      dropoffRate: 66,
      channels: ['Product Pages', 'Reviews', 'Demos'],
      touchpoints: 8.9
    },
    {
      id: 'purchase',
      name: 'Purchase',
      icon: 'shopping-cart',
      customers: 1025,
      percentage: 34,
      conversionRate: 78,
      avgTime: 0.8,
      dropoffRate: 22,
      channels: ['Checkout', 'Support', 'Payment'],
      touchpoints: 2.1
    },
    {
      id: 'loyalty',
      name: 'Loyalty',
      icon: 'award',
      customers: 800,
      percentage: 78,
      conversionRate: 100,
      avgTime: 45,
      dropoffRate: 0,
      channels: ['Email', 'App', 'Customer Success'],
      touchpoints: 12.4
    }
  ];

  const currentJourney = journeyData.length > 0 ? journeyData : defaultJourney;

  const viewOptions = [
    { id: 'conversion', label: 'Conversion', icon: 'trending-up' },
    { id: 'time', label: 'Time', icon: 'clock' },
    { id: 'touchpoints', label: 'Touchpoints', icon: 'target' }
  ];

  const stats = useMemo(() => {
    const total = currentJourney[0]?.customers || 0;
    const converted = currentJourney[currentJourney.length - 1]?.customers || 0;
    const overallConversion = total > 0 ? (converted / total) * 100 : 0;
    const avgTime = currentJourney.reduce((sum, stage) => sum + stage.avgTime, 0) / currentJourney.length;
    const totalDropoff = total - converted;

    return {
      total,
      conversion: overallConversion,
      dropoff: totalDropoff,
      time: avgTime
    };
  }, [currentJourney]);

  // Animate flow dots
  useEffect(() => {
    if (!animateFlow) return;

    const interval = setInterval(() => {
      setFlowDots(prev => {
        const newDots = [];
        const stageWidth = 100 / currentJourney.length;
        
        for (let i = 0; i < currentJourney.length - 1; i++) {
          const position = (i + 1) * stageWidth - stageWidth / 2;
          newDots.push({
            id: `dot-${i}`,
            position,
            stage: i
          });
        }
        
        return newDots;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [animateFlow, currentJourney.length]);

  const handleViewChange = (viewId) => {
    setSelectedView(viewId);
    onViewChange?.(viewId);
  };

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    onStageClick?.(stage);
  };

  return (
    <JourneyContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <JourneyHeader>
        <HeaderLeft>
          <JourneyIcon
            animate={animateFlow ? { rotate: [0, 360] } : {}}
            transition={{ duration: 10, repeat: animateFlow ? Infinity : 0, ease: 'linear' }}
          >
            <Icon name="route" size={18} />
          </JourneyIcon>
          <div>
            <Typography variant="h5" weight="semibold">
              Customer Journey Flow
            </Typography>
            <Typography variant="caption" color="secondary">
              From awareness to loyalty - track every step
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
      </JourneyHeader>

      <JourneyStats>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue type="total">{stats.total.toLocaleString()}</StatValue>
          <StatLabel>Total Visitors</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue type="conversion">{stats.conversion.toFixed(1)}%</StatValue>
          <StatLabel>Conversion Rate</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue type="dropoff">{stats.dropoff.toLocaleString()}</StatValue>
          <StatLabel>Total Dropoff</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue type="time">{formatDuration(stats.time)}</StatValue>
          <StatLabel>Avg Journey Time</StatLabel>
        </StatCard>
      </JourneyStats>

      <JourneyFlow>
        <FlowContainer>
          {currentJourney.map((stage, index) => (
            <FlowStage
              key={stage.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StageIcon
                stage={stage.id}
                animate={animateFlow}
                whileHover={{ scale: 1.1 }}
                onClick={() => handleStageClick(stage)}
              >
                <Icon name={getStageIcon(stage.id)} size={32} />
              </StageIcon>
              
              <StageTitle>{stage.name}</StageTitle>
              
              <StageMetrics>
                <StageCount>{stage.customers.toLocaleString()}</StageCount>
                <StagePercentage>{stage.percentage}% of previous</StagePercentage>
                
                {selectedView === 'time' && (
                  <ConversionRate rate={stage.avgTime}>
                    <Icon name="clock" size={10} />
                    {formatDuration(stage.avgTime)}
                  </ConversionRate>
                )}
                
                {selectedView === 'touchpoints' && (
                  <ConversionRate rate={stage.touchpoints * 10}>
                    <Icon name="target" size={10} />
                    {stage.touchpoints} touches
                  </ConversionRate>
                )}
                
                {selectedView === 'conversion' && index < currentJourney.length - 1 && (
                  <ConversionRate rate={stage.conversionRate}>
                    <Icon name="trending-up" size={10} />
                    {stage.conversionRate}% convert
                  </ConversionRate>
                )}
              </StageMetrics>
            </FlowStage>
          ))}

          {/* Flow arrows */}
          {currentJourney.map((stage, index) => {
            if (index >= currentJourney.length - 1) return null;
            
            const stageWidth = 100 / currentJourney.length;
            const position = (index + 1) * stageWidth - stageWidth / 2;
            
            return (
              <FlowArrow
                key={`arrow-${index}`}
                position={position}
                conversion={stage.conversionRate}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.2 }}
              />
            );
          })}

          {/* Animated dots */}
          <AnimatePresence>
            {flowDots.map((dot) => (
              <AnimatedFlow
                key={dot.id}
                position={dot.position}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0], 
                  opacity: [0, 1, 0],
                  x: [0, 50, 100]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            ))}
          </AnimatePresence>
        </FlowContainer>
      </JourneyFlow>

      <AnimatePresence>
        {selectedStage && (
          <JourneyDetails
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DetailsGrid>
              <DetailCard>
                <DetailTitle>
                  <Icon name="target" size={20} />
                  Stage Performance
                </DetailTitle>
                <DetailList>
                  <DetailItem>
                    <DetailLabel>Customers</DetailLabel>
                    <DetailValue>{selectedStage.customers.toLocaleString()}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Conversion Rate</DetailLabel>
                    <DetailValue>{selectedStage.conversionRate}%</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Drop-off Rate</DetailLabel>
                    <DetailValue>{selectedStage.dropoffRate}%</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Average Time</DetailLabel>
                    <DetailValue>{formatDuration(selectedStage.avgTime)}</DetailValue>
                  </DetailItem>
                </DetailList>
              </DetailCard>

              <DetailCard>
                <DetailTitle>
                  <Icon name="radio" size={20} />
                  Key Channels
                </DetailTitle>
                <DetailList>
                  {selectedStage.channels?.map((channel, index) => (
                    <DetailItem key={index}>
                      <DetailLabel>{channel}</DetailLabel>
                      <DetailValue>
                        <Badge variant="secondary" size="sm">Active</Badge>
                      </DetailValue>
                    </DetailItem>
                  ))}
                  <DetailItem>
                    <DetailLabel>Avg Touchpoints</DetailLabel>
                    <DetailValue>{selectedStage.touchpoints}</DetailValue>
                  </DetailItem>
                </DetailList>
              </DetailCard>
            </DetailsGrid>
          </JourneyDetails>
        )}
      </AnimatePresence>
    </JourneyContainer>
  );
};

export default CustomerJourneyVisualization;