import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import { useI18n } from '../../hooks/useI18n';

const patternPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
`;

const neuralNetwork = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

const AnalysisContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(45deg, ${props => props.theme.colors.purple[500]}, ${props => props.theme.colors.blue[500]}, ${props => props.theme.colors.green[500]});
    background-size: 300% 300%;
    animation: ${neuralNetwork} 5s ease infinite;
  }
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.purple[50]}, ${props => props.theme.colors.blue[50]});
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

const BehaviorIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.purple[500]}, ${props => props.theme.colors.blue[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: ${patternPulse} 3s ease-in-out infinite;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const AnalysisTypeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const TypeOption = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? props.theme.colors.purple[500] : 'transparent'};
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

const AIStatus = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.primary[50]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  }
`;

const AIIndicator = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.colors.green[500]};
`;

const PatternOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PatternCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
  position: relative;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => getPatternColor(props.pattern, props.theme)};
  }
  
  ${props => props.highlight && css`
    border-color: ${props => getPatternColor(props.pattern, props.theme)};
    background: ${props => getPatternColor(props.pattern, props.theme)}10;
  `}
`;

const PatternValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getPatternColor(props.pattern, props.theme)};
  line-height: 1;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const PatternLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const PatternTrend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => getTrendColor(props.trend, props.theme)};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const AnalysisContent = styled.div`
  flex: 1;
  display: flex;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  overflow: hidden;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    flex-direction: column;
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const MainAnalysis = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const SideAnalysis = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const Section = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const SectionTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const PatternVisualization = styled.div`
  padding: ${props => props.theme.spacing[4]};
  height: 300px;
  position: relative;
`;

const PatternGraph = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.primary};
  overflow: hidden;
`;

const PatternLine = styled(motion.div)`
  position: absolute;
  height: 2px;
  background: ${props => getPatternGradient(props.pattern, props.theme)};
  border-radius: 1px;
  transform-origin: left center;
`;

const DataPoint = styled(motion.div)`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => getPatternColor(props.pattern, props.theme)};
  border: 2px solid ${props => props.theme.colors.background.elevated};
  cursor: pointer;
  
  &:hover {
    transform: scale(1.5);
    z-index: 10;
  }
`;

const PatternsList = styled.div`
  padding: ${props => props.theme.spacing[4]};
  max-height: 400px;
  overflow-y: auto;
`;

const PatternItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    border-color: ${props => getPatternColor(props.pattern, props.theme)};
    background: ${props => getPatternColor(props.pattern, props.theme)}10;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PatternDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => getPatternColor(props.pattern, props.theme)};
  flex-shrink: 0;
  
  ${props => props.active && css`
    animation: ${patternPulse} 2s ease-in-out infinite;
  `}
`;

const PatternInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PatternName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const PatternDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const PatternMetrics = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const MetricValue = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const InsightPanel = styled.div`
  padding: ${props => props.theme.spacing[4]};
`;

const InsightItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
  background: ${props => getInsightBackground(props.type, props.theme)};
  border: 1px solid ${props => getInsightBorder(props.type, props.theme)};
  border-radius: ${props => props.theme.spacing[2]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InsightIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => getInsightColor(props.type, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const InsightText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const InsightMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const RecommendationPanel = styled.div`
  padding: ${props => props.theme.spacing[4]};
`;

const RecommendationItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.green[50]};
  border: 1px solid ${props => props.theme.colors.green[200]};
  border-radius: ${props => props.theme.spacing[2]};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.green[100]};
    transform: translateX(4px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RecommendationIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.green[500]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const RecommendationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const RecommendationTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const RecommendationDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

// Helper functions
const getPatternColor = (pattern, theme) => {
  const colors = {
    browsing: theme.colors.blue[600],
    purchase: theme.colors.green[600],
    engagement: theme.colors.purple[600],
    seasonal: theme.colors.orange[600],
    loyalty: theme.colors.pink[600]
  };
  return colors[pattern] || theme.colors.gray[600];
};

const getPatternGradient = (pattern, theme) => {
  const gradients = {
    browsing: `linear-gradient(90deg, ${theme.colors.blue[500]}, ${theme.colors.blue[400]})`,
    purchase: `linear-gradient(90deg, ${theme.colors.green[500]}, ${theme.colors.green[400]})`,
    engagement: `linear-gradient(90deg, ${theme.colors.purple[500]}, ${theme.colors.purple[400]})`,
    seasonal: `linear-gradient(90deg, ${theme.colors.orange[500]}, ${theme.colors.orange[400]})`,
    loyalty: `linear-gradient(90deg, ${theme.colors.pink[500]}, ${theme.colors.pink[400]})`
  };
  return gradients[pattern] || `linear-gradient(90deg, ${theme.colors.gray[500]}, ${theme.colors.gray[400]})`;
};

const getTrendColor = (trend, theme) => {
  if (trend > 0) return theme.colors.green[600];
  if (trend < 0) return theme.colors.red[600];
  return theme.colors.gray[500];
};

const getInsightBackground = (type, theme) => {
  const backgrounds = {
    discovery: theme.colors.blue[50],
    prediction: theme.colors.purple[50],
    anomaly: theme.colors.red[50],
    opportunity: theme.colors.green[50]
  };
  return backgrounds[type] || theme.colors.gray[50];
};

const getInsightBorder = (type, theme) => {
  const borders = {
    discovery: theme.colors.blue[200],
    prediction: theme.colors.purple[200],
    anomaly: theme.colors.red[200],
    opportunity: theme.colors.green[200]
  };
  return borders[type] || theme.colors.gray[200];
};

const getInsightColor = (type, theme) => {
  const colors = {
    discovery: theme.colors.blue[500],
    prediction: theme.colors.purple[500],
    anomaly: theme.colors.red[500],
    opportunity: theme.colors.green[500]
  };
  return colors[type] || theme.colors.gray[500];
};

const BehavioralPatternAnalysis = ({
  patterns = [],
  analysisType = 'behavior',
  onAnalysisTypeChange,
  onPatternClick,
  onInsightClick,
  onRecommendationClick,
  loading = false,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedAnalysis, setSelectedAnalysis] = useState(analysisType);
  const [selectedPattern, setSelectedPattern] = useState(null);

  // Default pattern data
  const defaultPatterns = [
    {
      id: 'weekend-shopping',
      name: 'Weekend Shopping Surge',
      description: 'Customers show 340% increase in purchases during weekends',
      pattern: 'purchase',
      confidence: 94,
      frequency: 68,
      impact: 'High',
      customers: 2456,
      revenue: 156780
    },
    {
      id: 'morning-browse',
      name: 'Morning Browse Pattern',
      description: '67% of customers browse products between 8-11 AM but purchase later',
      pattern: 'browsing',
      confidence: 87,
      frequency: 73,
      impact: 'Medium',
      customers: 3421,
      revenue: 89400
    },
    {
      id: 'seasonal-demand',
      name: 'Seasonal Demand Spike',
      description: 'Electronics purchases increase 45% during back-to-school season',
      pattern: 'seasonal',
      confidence: 92,
      frequency: 12,
      impact: 'High',
      customers: 1876,
      revenue: 234560
    },
    {
      id: 'loyalty-behavior',
      name: 'Loyalty Program Engagement',
      description: 'Members show 23% higher engagement and 18% more frequent purchases',
      pattern: 'loyalty',
      confidence: 89,
      frequency: 56,
      impact: 'High',
      customers: 1234,
      revenue: 187650
    },
    {
      id: 'email-response',
      name: 'Email Response Pattern',
      description: 'Customers respond 3x better to emails sent on Tuesday mornings',
      pattern: 'engagement',
      confidence: 76,
      frequency: 34,
      impact: 'Medium',
      customers: 4567,
      revenue: 67890
    }
  ];

  const currentPatterns = patterns.length > 0 ? patterns : defaultPatterns;

  const analysisTypes = [
    { id: 'behavior', label: 'Behavior', icon: 'activity' },
    { id: 'temporal', label: 'Temporal', icon: 'clock' },
    { id: 'cohort', label: 'Cohorts', icon: 'users' },
    { id: 'anomaly', label: 'Anomalies', icon: 'alertTriangle' }
  ];

  const overviewStats = useMemo(() => {
    const totalPatterns = currentPatterns.length;
    const highImpact = currentPatterns.filter(p => p.impact === 'High').length;
    const avgConfidence = currentPatterns.reduce((sum, p) => sum + p.confidence, 0) / currentPatterns.length;
    const totalCustomers = currentPatterns.reduce((sum, p) => sum + p.customers, 0);
    
    return {
      patterns: totalPatterns,
      highImpact,
      confidence: avgConfidence,
      customers: totalCustomers
    };
  }, [currentPatterns]);

  const insights = [
    {
      id: 'insight-1',
      type: 'discovery',
      text: 'New pattern discovered: Mobile users spend 27% more during lunch hours (12-2 PM)',
      confidence: 91,
      impact: 'High'
    },
    {
      id: 'insight-2',
      type: 'prediction',
      text: 'Predicted surge in electronics demand next week based on seasonal patterns',
      confidence: 84,
      impact: 'Medium'
    },
    {
      id: 'insight-3',
      type: 'anomaly',
      text: 'Unusual spike in cart abandonment rate (45%) detected in premium products',
      confidence: 96,
      impact: 'Critical'
    },
    {
      id: 'insight-4',
      type: 'opportunity',
      text: 'Opportunity to increase email engagement by 23% with optimal send times',
      confidence: 78,
      impact: 'Medium'
    }
  ];

  const recommendations = [
    {
      id: 'rec-1',
      title: 'Optimize Weekend Campaigns',
      description: 'Schedule major promotions for Friday-Sunday to capitalize on weekend shopping surge',
      action: 'schedule',
      impact: 'Revenue increase: ~15%'
    },
    {
      id: 'rec-2',
      title: 'Morning Browse Retargeting',
      description: 'Create retargeting campaigns for morning browsers with afternoon/evening delivery',
      action: 'retarget',
      impact: 'Conversion boost: ~12%'
    },
    {
      id: 'rec-3',
      title: 'Seasonal Inventory Prep',
      description: 'Increase electronics inventory by 45% ahead of back-to-school season',
      action: 'inventory',
      impact: 'Revenue opportunity: ~$234K'
    },
    {
      id: 'rec-4',
      title: 'Email Send Optimization',
      description: 'Shift email campaigns to Tuesday mornings for 3x better response rates',
      action: 'optimize',
      impact: 'Engagement boost: ~300%'
    }
  ];

  const handleAnalysisChange = (type) => {
    setSelectedAnalysis(type);
    onAnalysisTypeChange?.(type);
  };

  const handlePatternClick = (pattern) => {
    setSelectedPattern(pattern);
    onPatternClick?.(pattern);
  };

  return (
    <AnalysisContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <AnalysisHeader>
        <HeaderLeft>
          <BehaviorIcon>
            <Icon name="activity" size={18} />
          </BehaviorIcon>
          <div>
            <Typography variant="h5" weight="semibold">
              Behavioral Pattern Analysis
            </Typography>
            <Typography variant="caption" color="secondary">
              AI-powered customer behavior insights
            </Typography>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <AnalysisTypeSelector>
            {analysisTypes.map(option => (
              <TypeOption
                key={option.id}
                active={selectedAnalysis === option.id}
                onClick={() => handleAnalysisChange(option.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name={option.icon} size={12} />
                {option.label}
              </TypeOption>
            ))}
          </AnalysisTypeSelector>
          
          <Button variant="ghost" size="sm">
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </AnalysisHeader>

      <AIStatus>
        <AIIndicator
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <Typography variant="body2" color="primary">
          AI Pattern Detection: Active • Processing 847,234 behavioral events
        </Typography>
      </AIStatus>

      <PatternOverview>
        <PatternCard pattern="patterns" highlight>
          <PatternValue pattern="patterns">{overviewStats.patterns}</PatternValue>
          <PatternLabel>Active Patterns</PatternLabel>
          <PatternTrend trend={12}>
            <Icon name="trending-up" size={10} />
            +12%
          </PatternTrend>
        </PatternCard>

        <PatternCard pattern="purchase">
          <PatternValue pattern="purchase">{overviewStats.highImpact}</PatternValue>
          <PatternLabel>High Impact</PatternLabel>
          <PatternTrend trend={8}>
            <Icon name="trending-up" size={10} />
            +8%
          </PatternTrend>
        </PatternCard>

        <PatternCard pattern="engagement">
          <PatternValue pattern="engagement">{Math.round(overviewStats.confidence)}%</PatternValue>
          <PatternLabel>Avg Confidence</PatternLabel>
          <PatternTrend trend={3}>
            <Icon name="trending-up" size={10} />
            +3%
          </PatternTrend>
        </PatternCard>

        <PatternCard pattern="browsing">
          <PatternValue pattern="browsing">{(overviewStats.customers / 1000).toFixed(1)}K</PatternValue>
          <PatternLabel>Customers Analyzed</PatternLabel>
          <PatternTrend trend={15}>
            <Icon name="trending-up" size={10} />
            +15%
          </PatternTrend>
        </PatternCard>
      </PatternOverview>

      <AnalysisContent>
        <MainAnalysis>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <Icon name="trending-up" size={20} />
                Pattern Visualization
              </SectionTitle>
            </SectionHeader>
            <PatternVisualization>
              <PatternGraph>
                {/* Simulated pattern lines and data points */}
                <PatternLine
                  pattern="purchase"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2 }}
                  style={{
                    top: '20%',
                    left: '10%',
                    width: '80%',
                    transform: 'rotate(15deg)'
                  }}
                />
                <PatternLine
                  pattern="browsing"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2, delay: 0.5 }}
                  style={{
                    top: '50%',
                    left: '5%',
                    width: '90%',
                    transform: 'rotate(-10deg)'
                  }}
                />
                <PatternLine
                  pattern="engagement"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2, delay: 1 }}
                  style={{
                    top: '75%',
                    left: '15%',
                    width: '70%',
                    transform: 'rotate(25deg)'
                  }}
                />
                
                {/* Data points */}
                {[...Array(12)].map((_, index) => (
                  <DataPoint
                    key={index}
                    pattern={['purchase', 'browsing', 'engagement'][index % 3]}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 1.5 }}
                    style={{
                      left: `${15 + index * 7}%`,
                      top: `${20 + Math.sin(index * 0.5) * 40}%`
                    }}
                  />
                ))}
              </PatternGraph>
            </PatternVisualization>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <Icon name="list" size={20} />
                Discovered Patterns ({currentPatterns.length})
              </SectionTitle>
            </SectionHeader>
            <PatternsList>
              {currentPatterns.map((pattern, index) => (
                <PatternItem
                  key={pattern.id}
                  pattern={pattern.pattern}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  onClick={() => handlePatternClick(pattern)}
                >
                  <PatternDot 
                    pattern={pattern.pattern} 
                    active={pattern.confidence > 90}
                  />
                  
                  <PatternInfo>
                    <PatternName>{pattern.name}</PatternName>
                    <PatternDescription>{pattern.description}</PatternDescription>
                  </PatternInfo>
                  
                  <PatternMetrics>
                    <MetricValue>{pattern.confidence}%</MetricValue>
                    <MetricLabel>Confidence</MetricLabel>
                    <div style={{ marginTop: '0.5rem' }}>
                      <Badge 
                        variant={
                          pattern.impact === 'High' ? 'success' : 
                          pattern.impact === 'Medium' ? 'warning' : 'secondary'
                        } 
                        size="sm"
                      >
                        {pattern.impact} Impact
                      </Badge>
                    </div>
                  </PatternMetrics>
                </PatternItem>
              ))}
            </PatternsList>
          </Section>
        </MainAnalysis>

        <SideAnalysis>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <Icon name="brain" size={20} />
                AI Insights
              </SectionTitle>
            </SectionHeader>
            <InsightPanel>
              {insights.map((insight, index) => (
                <InsightItem
                  key={insight.id}
                  type={insight.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  onClick={() => onInsightClick?.(insight)}
                >
                  <InsightIcon type={insight.type}>
                    {insight.type === 'discovery' ? '🔍' :
                     insight.type === 'prediction' ? '🔮' :
                     insight.type === 'anomaly' ? '⚠️' : '💡'}
                  </InsightIcon>
                  <InsightContent>
                    <InsightText>{insight.text}</InsightText>
                    <InsightMeta>
                      <Badge variant="info" size="sm">
                        {insight.confidence}% confidence
                      </Badge>
                      <Badge 
                        variant={
                          insight.impact === 'Critical' ? 'danger' :
                          insight.impact === 'High' ? 'warning' : 'secondary'
                        } 
                        size="sm"
                      >
                        {insight.impact}
                      </Badge>
                    </InsightMeta>
                  </InsightContent>
                </InsightItem>
              ))}
            </InsightPanel>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <Icon name="lightbulb" size={20} />
                Recommendations
              </SectionTitle>
            </SectionHeader>
            <RecommendationPanel>
              {recommendations.map((rec, index) => (
                <RecommendationItem
                  key={rec.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onRecommendationClick?.(rec)}
                >
                  <RecommendationIcon>
                    <Icon 
                      name={
                        rec.action === 'schedule' ? 'calendar' :
                        rec.action === 'retarget' ? 'target' :
                        rec.action === 'inventory' ? 'package' : 'settings'
                      } 
                      size={16} 
                    />
                  </RecommendationIcon>
                  <RecommendationContent>
                    <RecommendationTitle>{rec.title}</RecommendationTitle>
                    <RecommendationDescription>{rec.description}</RecommendationDescription>
                    <div style={{ marginTop: '0.5rem' }}>
                      <Badge variant="success" size="sm">
                        {rec.impact}
                      </Badge>
                    </div>
                  </RecommendationContent>
                </RecommendationItem>
              ))}
            </RecommendationPanel>
          </Section>
        </SideAnalysis>
      </AnalysisContent>
    </AnalysisContainer>
  );
};

export default BehavioralPatternAnalysis;