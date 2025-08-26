import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import { useI18n } from '../../hooks/useI18n';

const valueGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
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
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.green[50]}, ${props => props.theme.colors.blue[50]});
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

const CLVIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.green[500]}, ${props => props.theme.colors.blue[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: ${valueGlow} 3s ease-in-out infinite;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const AnalysisSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const AnalysisOption = styled(motion.button)`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? props.theme.colors.green[500] : 'transparent'};
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

const CLVOverview = styled.div`
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

const OverviewCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
  position: relative;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => getCLVColor(props.type, props.theme)};
  }
  
  ${props => props.highlight && css`
    border-color: ${props.theme.colors.green[400]};
    background: ${props.theme.colors.green[50]};
    animation: ${valueGlow} 3s ease-in-out infinite;
  `}
`;

const OverviewValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getCLVColor(props.type, props.theme)};
  line-height: 1;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const OverviewLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const OverviewTrend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => getTrendColor(props.trend, props.theme)};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const CLVAnalysisContent = styled.div`
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

const AnalysisSection = styled(motion.div)`
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

const CLVChart = styled.div`
  padding: ${props => props.theme.spacing[4]};
  height: 300px;
  position: relative;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: end;
  justify-content: space-around;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  position: relative;
`;

const CLVBar = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
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
`;

const SegmentList = styled.div`
  padding: ${props => props.theme.spacing[4]};
  max-height: 400px;
  overflow-y: auto;
`;

const SegmentItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    border-color: ${props => props.color};
    background: ${props => props.color}10;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SegmentDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const SegmentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SegmentName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SegmentMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const SegmentCLV = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const CLVValue = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const CLVPrediction = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => getTrendColor(props.growth, props.theme)};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const PredictiveInsights = styled.div`
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
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border: 1px solid ${props => getActionBorderColor(props.action, props.theme)};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getActionBackground(props.action, props.theme)};
  color: ${props => getActionColor(props.action, props.theme)};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  flex: 1;
  
  &:hover {
    background: ${props => getActionHoverBackground(props.action, props.theme)};
    border-color: ${props => getActionHoverBorderColor(props.action, props.theme)};
  }
`;

// Helper functions
const getCLVColor = (type, theme) => {
  const colors = {
    average: theme.colors.green[600],
    projected: theme.colors.blue[600],
    growth: theme.colors.purple[600],
    segments: theme.colors.orange[600]
  };
  return colors[type] || theme.colors.text.primary;
};

const getTrendColor = (trend, theme) => {
  if (trend > 0) return theme.colors.green[600];
  if (trend < 0) return theme.colors.red[600];
  return theme.colors.gray[500];
};

const getInsightBackground = (type, theme) => {
  const backgrounds = {
    opportunity: theme.colors.green[50],
    risk: theme.colors.red[50],
    prediction: theme.colors.blue[50],
    optimization: theme.colors.purple[50]
  };
  return backgrounds[type] || theme.colors.gray[50];
};

const getInsightBorder = (type, theme) => {
  const borders = {
    opportunity: theme.colors.green[200],
    risk: theme.colors.red[200],
    prediction: theme.colors.blue[200],
    optimization: theme.colors.purple[200]
  };
  return borders[type] || theme.colors.gray[200];
};

const getInsightColor = (type, theme) => {
  const colors = {
    opportunity: theme.colors.green[500],
    risk: theme.colors.red[500],
    prediction: theme.colors.blue[500],
    optimization: theme.colors.purple[500]
  };
  return colors[type] || theme.colors.gray[500];
};

const getActionBackground = (action, theme) => {
  const backgrounds = {
    export: theme.colors.primary[50],
    campaign: theme.colors.green[50],
    optimize: theme.colors.purple[50]
  };
  return backgrounds[action] || theme.colors.background.secondary;
};

const getActionColor = (action, theme) => {
  const colors = {
    export: theme.colors.primary[700],
    campaign: theme.colors.green[700],
    optimize: theme.colors.purple[700]
  };
  return colors[action] || theme.colors.text.primary;
};

const getActionBorderColor = (action, theme) => {
  const borders = {
    export: theme.colors.primary[300],
    campaign: theme.colors.green[300],
    optimize: theme.colors.purple[300]
  };
  return borders[action] || theme.colors.border.default;
};

const getActionHoverBackground = (action, theme) => {
  const hovers = {
    export: theme.colors.primary[100],
    campaign: theme.colors.green[100],
    optimize: theme.colors.purple[100]
  };
  return hovers[action] || theme.colors.background.elevated;
};

const getActionHoverBorderColor = (action, theme) => {
  const hovers = {
    export: theme.colors.primary[400],
    campaign: theme.colors.green[400],
    optimize: theme.colors.purple[400]
  };
  return hovers[action] || theme.colors.border.strong;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

const CustomerLifetimeValueAnalysis = ({
  clvData = {},
  analysisType = 'segments',
  onAnalysisTypeChange,
  onSegmentClick,
  onActionClick,
  loading = false,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedAnalysis, setSelectedAnalysis] = useState(analysisType);
  const [selectedSegment, setSelectedSegment] = useState(null);

  // Default CLV data
  const defaultData = {
    averageCLV: 1847,
    projectedCLV: 2156,
    clvGrowth: 16.7,
    totalSegments: 8,
    segments: [
      {
        id: 'champions',
        name: 'Champions',
        color: '#10B981',
        customers: 1247,
        averageCLV: 3456,
        projectedCLV: 4123,
        growth: 19.3,
        retention: 94.5,
        avgOrderValue: 391
      },
      {
        id: 'loyal',
        name: 'Loyal Customers',
        color: '#3B82F6',
        customers: 2156,
        averageCLV: 2134,
        projectedCLV: 2456,
        growth: 15.1,
        retention: 87.3,
        avgOrderValue: 196
      },
      {
        id: 'potential',
        name: 'Potential Loyalists',
        color: '#8B5CF6',
        customers: 1834,
        averageCLV: 1567,
        projectedCLV: 2089,
        growth: 33.3,
        retention: 68.9,
        avgOrderValue: 171
      },
      {
        id: 'new',
        name: 'New Customers',
        color: '#06B6D4',
        customers: 892,
        averageCLV: 876,
        projectedCLV: 1234,
        growth: 40.9,
        retention: 45.2,
        avgOrderValue: 176
      },
      {
        id: 'promising',
        name: 'Promising',
        color: '#84CC16',
        customers: 756,
        averageCLV: 567,
        projectedCLV: 823,
        growth: 45.2,
        retention: 52.1,
        avgOrderValue: 118
      },
      {
        id: 'risk',
        name: 'At Risk',
        color: '#EF4444',
        customers: 534,
        averageCLV: 1234,
        projectedCLV: 456,
        growth: -63.1,
        retention: 23.8,
        avgOrderValue: 185
      }
    ]
  };

  const currentData = { ...defaultData, ...clvData };

  const analysisOptions = [
    { id: 'segments', label: 'By Segments', icon: 'users' },
    { id: 'timeline', label: 'Timeline', icon: 'trending-up' },
    { id: 'cohorts', label: 'Cohorts', icon: 'layers' },
    { id: 'predictions', label: 'Predictions', icon: 'brain' }
  ];

  const maxCLV = Math.max(...currentData.segments.map(s => s.averageCLV));

  const insights = [
    {
      id: 'insight-1',
      type: 'opportunity',
      text: 'Potential Loyalists showing 33% CLV growth - focus retention campaigns on this segment',
      confidence: 89,
      impact: 'High'
    },
    {
      id: 'insight-2',
      type: 'risk',
      text: 'At Risk segment CLV declining by 63% - immediate intervention needed to prevent churn',
      confidence: 94,
      impact: 'Critical'
    },
    {
      id: 'insight-3',
      type: 'prediction',
      text: 'New Customers projected to reach $1,234 CLV within 12 months with proper nurturing',
      confidence: 78,
      impact: 'Medium'
    },
    {
      id: 'insight-4',
      type: 'optimization',
      text: 'Champions segment represents 67% of total CLV despite being only 12% of customers',
      confidence: 96,
      impact: 'High'
    }
  ];

  const handleAnalysisChange = (type) => {
    setSelectedAnalysis(type);
    onAnalysisTypeChange?.(type);
  };

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
    onSegmentClick?.(segment);
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
          <CLVIcon>
            <Icon name="dollar-sign" size={18} />
          </CLVIcon>
          <div>
            <Typography variant="h5" weight="semibold">
              Customer Lifetime Value Analysis
            </Typography>
            <Typography variant="caption" color="secondary">
              AI-powered CLV insights and predictions
            </Typography>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <AnalysisSelector>
            {analysisOptions.map(option => (
              <AnalysisOption
                key={option.id}
                active={selectedAnalysis === option.id}
                onClick={() => handleAnalysisChange(option.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name={option.icon} size={12} />
                {option.label}
              </AnalysisOption>
            ))}
          </AnalysisSelector>
          
          <Button variant="ghost" size="sm">
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </AnalysisHeader>

      <CLVOverview>
        <OverviewCard type="average" highlight>
          <OverviewValue type="average">
            {formatCurrency(currentData.averageCLV)}
          </OverviewValue>
          <OverviewLabel>Average CLV</OverviewLabel>
          <OverviewTrend trend={currentData.clvGrowth}>
            <Icon name="trending-up" size={10} />
            {currentData.clvGrowth}%
          </OverviewTrend>
        </OverviewCard>

        <OverviewCard type="projected">
          <OverviewValue type="projected">
            {formatCurrency(currentData.projectedCLV)}
          </OverviewValue>
          <OverviewLabel>Projected CLV</OverviewLabel>
          <OverviewTrend trend={16.7}>
            <Icon name="trending-up" size={10} />
            +16.7%
          </OverviewTrend>
        </OverviewCard>

        <OverviewCard type="growth">
          <OverviewValue type="growth">
            {currentData.clvGrowth.toFixed(1)}%
          </OverviewValue>
          <OverviewLabel>CLV Growth Rate</OverviewLabel>
          <OverviewTrend trend={2.3}>
            <Icon name="trending-up" size={10} />
            +2.3%
          </OverviewTrend>
        </OverviewCard>

        <OverviewCard type="segments">
          <OverviewValue type="segments">
            {currentData.totalSegments}
          </OverviewValue>
          <OverviewLabel>Active Segments</OverviewLabel>
          <OverviewTrend trend={0}>
            <Icon name="users" size={10} />
            Tracked
          </OverviewTrend>
        </OverviewCard>
      </CLVOverview>

      <CLVAnalysisContent>
        <MainAnalysis>
          <AnalysisSection>
            <SectionHeader>
              <SectionTitle>
                <Icon name="barChart3" size={20} />
                CLV by Customer Segments
              </SectionTitle>
            </SectionHeader>
            <CLVChart>
              <ChartContainer>
                {currentData.segments.map((segment, index) => (
                  <CLVBar key={segment.id}>
                    <Bar
                      color={segment.color}
                      value={formatCurrency(segment.averageCLV)}
                      initial={{ height: 0 }}
                      animate={{ 
                        height: `${(segment.averageCLV / maxCLV) * 200}px` 
                      }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      onClick={() => handleSegmentClick(segment)}
                    />
                    <BarLabel>{segment.name}</BarLabel>
                  </CLVBar>
                ))}
              </ChartContainer>
            </CLVChart>
          </AnalysisSection>
        </MainAnalysis>

        <SideAnalysis>
          <AnalysisSection>
            <SectionHeader>
              <SectionTitle>
                <Icon name="list" size={20} />
                Segment Details
              </SectionTitle>
            </SectionHeader>
            <SegmentList>
              {currentData.segments.map((segment, index) => (
                <SegmentItem
                  key={segment.id}
                  color={segment.color}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: -4 }}
                  onClick={() => handleSegmentClick(segment)}
                >
                  <SegmentDot color={segment.color} />
                  <SegmentInfo>
                    <SegmentName>{segment.name}</SegmentName>
                    <SegmentMetrics>
                      <span>{segment.customers.toLocaleString()} customers</span>
                      <span>•</span>
                      <span>{segment.retention}% retention</span>
                    </SegmentMetrics>
                  </SegmentInfo>
                  <SegmentCLV>
                    <CLVValue>{formatCurrency(segment.averageCLV)}</CLVValue>
                    <CLVPrediction growth={segment.growth}>
                      <Icon 
                        name={segment.growth > 0 ? 'trending-up' : 'trending-down'} 
                        size={10} 
                      />
                      {Math.abs(segment.growth).toFixed(1)}%
                    </CLVPrediction>
                  </SegmentCLV>
                </SegmentItem>
              ))}
            </SegmentList>
          </AnalysisSection>

          <AnalysisSection>
            <SectionHeader>
              <SectionTitle>
                <Icon name="brain" size={20} />
                AI Insights
              </SectionTitle>
            </SectionHeader>
            <PredictiveInsights>
              {insights.map((insight, index) => (
                <InsightItem
                  key={insight.id}
                  type={insight.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <InsightIcon type={insight.type}>
                    {insight.type === 'opportunity' ? '💡' :
                     insight.type === 'risk' ? '⚠️' :
                     insight.type === 'prediction' ? '🔮' : '⚡'}
                  </InsightIcon>
                  <InsightContent>
                    <InsightText>{insight.text}</InsightText>
                    <InsightMeta>
                      <Badge variant="info" size="sm">
                        {insight.confidence}% confidence
                      </Badge>
                      <Badge variant={insight.impact === 'Critical' ? 'danger' : insight.impact === 'High' ? 'warning' : 'secondary'} size="sm">
                        {insight.impact} impact
                      </Badge>
                    </InsightMeta>
                  </InsightContent>
                </InsightItem>
              ))}
            </PredictiveInsights>
          </AnalysisSection>
        </SideAnalysis>
      </CLVAnalysisContent>

      <ActionButtons>
        <ActionButton
          action="export"
          onClick={() => onActionClick?.('export')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon name="download" size={16} />
          Export CLV Report
        </ActionButton>
        <ActionButton
          action="campaign"
          onClick={() => onActionClick?.('campaign')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon name="mail" size={16} />
          Create Campaign
        </ActionButton>
        <ActionButton
          action="optimize"
          onClick={() => onActionClick?.('optimize')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon name="zap" size={16} />
          Optimize Strategy
        </ActionButton>
      </ActionButtons>
    </AnalysisContainer>
  );
};

export default CustomerLifetimeValueAnalysis;