import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import MetricCard from '../molecules/MetricCard';
import { useI18n } from '../../hooks/useI18n';

const VisualizationContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const VisualizationHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary[25]} 0%, 
    ${props => props.theme.colors.primary[50]} 100%);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.spacing[3]};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary[500]} 0%, 
    ${props => props.theme.colors.primary[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const StatusIndicator = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.status) {
      case 'running':
        return css`
          background: ${props.theme.colors.green[100]};
          color: ${props.theme.colors.green[700]};
        `;
      case 'completed':
        return css`
          background: ${props.theme.colors.blue[100]};
          color: ${props.theme.colors.blue[700]};
        `;
      case 'significant':
        return css`
          background: ${props.theme.colors.yellow[100]};
          color: ${props.theme.colors.yellow[700]};
        `;
      default:
        return css`
          background: ${props.theme.colors.gray[100]};
          color: ${props.theme.colors.gray[700]};
        `;
    }
  }}
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.default};
    border-radius: 1px;
  }
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  color: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.primary[500]};
    background: ${props => props.theme.colors.primary[25]};
  }
`;

const ContentArea = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ChartContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[5]};
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ChartTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const VariantComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const VariantCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'variant'
})`
  background: ${props => props.theme.colors.background.secondary};
  border: 2px solid ${props => 
    props.variant === 'A' ? props.theme.colors.blue[200] : props.theme.colors.green[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  text-align: center;
  position: relative;
  
  &::before {
    content: '${props => props.variant}';
    position: absolute;
    top: -12px;
    left: 20px;
    background: ${props => 
      props.variant === 'A' ? props.theme.colors.blue[500] : props.theme.colors.green[500]};
    color: white;
    font-size: ${props => props.theme.typography.fontSize.sm};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    padding: 4px 12px;
    border-radius: 12px;
    letter-spacing: 0.5px;
  }
`;

const VariantValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant'
})`
  font-size: ${props => props.theme.typography.fontSize.xl2};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => 
    props.variant === 'A' ? props.theme.colors.blue[600] : props.theme.colors.green[600]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const VariantChange = styled.div.withConfig({
  shouldForwardProp: (prop) => !['positive', 'variant'].includes(prop)
})`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.positive ? props.theme.colors.green[600] : props.theme.colors.red[600]};
`;

const StatisticalSignificance = styled(motion.div)`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.yellow[50]} 0%, 
    ${props => props.theme.colors.yellow[100]} 100%);
  border: 1px solid ${props => props.theme.colors.yellow[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const SignificanceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const SignificanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
`;

const SignificanceItem = styled.div`
  text-align: center;
`;

const SignificanceValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => 
    props.status === 'significant' ? props.theme.colors.green[600] :
    props.status === 'approaching' ? props.theme.colors.yellow[600] :
    props.theme.colors.gray[600]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SignificanceLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const RealTimeUpdates = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const UpdateIndicator = styled(motion.div)`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: ${props => props.theme.colors.green[500]};
  border-radius: 50%;
  box-shadow: 0 0 0 4px ${props => props.theme.colors.green[100]};
`;

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)'
      }}>
        <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: entry.color,
              borderRadius: '2px'
            }} />
            <Typography variant="caption" color="secondary">
              {entry.name}: {entry.value}
            </Typography>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ABTestResultsVisualization = ({
  testId,
  testData,
  realTimeUpdates = true,
  refreshInterval = 5000,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock real-time test data
  const [data, setData] = useState({
    testName: 'Claude Sonnet vs Haiku Recommendation Accuracy',
    status: 'running',
    progress: 68,
    duration: 14,
    daysRemaining: 4,
    participants: {
      total: 2847,
      variantA: 1423,
      variantB: 1424
    },
    conversions: {
      variantA: { count: 175, rate: 12.3 },
      variantB: { count: 209, rate: 14.7 }
    },
    significance: {
      level: 89,
      pValue: 0.11,
      confidenceInterval: '±2.1%',
      status: 'approaching'
    },
    timeline: [
      { date: '2024-08-06', variantA: 8.5, variantB: 9.2 },
      { date: '2024-08-07', variantA: 10.1, variantB: 11.3 },
      { date: '2024-08-08', variantA: 11.2, variantB: 12.8 },
      { date: '2024-08-09', variantA: 10.8, variantB: 13.5 },
      { date: '2024-08-10', variantA: 12.0, variantB: 14.1 },
      { date: '2024-08-11', variantA: 11.9, variantB: 14.3 },
      { date: '2024-08-12', variantA: 12.1, variantB: 14.5 },
      { date: '2024-08-13', variantA: 12.3, variantB: 14.7 }
    ],
    segmentData: [
      { segment: 'New Users', variantA: 15.2, variantB: 18.1 },
      { segment: 'Returning Users', variantA: 11.8, variantB: 13.9 },
      { segment: 'Premium Users', variantA: 9.5, variantB: 12.3 },
      { segment: 'Mobile Users', variantA: 13.7, variantB: 16.2 }
    ],
    ...testData
  });

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'activity' },
    { id: 'timeline', label: 'Timeline', icon: 'trending-up' },
    { id: 'segments', label: 'User Segments', icon: 'users' },
    { id: 'statistical', label: 'Statistical Analysis', icon: 'bar-chart' }
  ];

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeUpdates || data.status !== 'running') return;

    const interval = setInterval(() => {
      setIsUpdating(true);
      
      setTimeout(() => {
        setData(prev => {
          const newParticipants = Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0;
          const newConversionsA = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;
          const newConversionsB = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;
          
          const updatedParticipants = {
            total: prev.participants.total + newParticipants,
            variantA: prev.participants.variantA + Math.floor(newParticipants / 2),
            variantB: prev.participants.variantB + Math.ceil(newParticipants / 2)
          };
          
          const updatedConversions = {
            variantA: {
              count: prev.conversions.variantA.count + newConversionsA,
              rate: ((prev.conversions.variantA.count + newConversionsA) / updatedParticipants.variantA * 100)
            },
            variantB: {
              count: prev.conversions.variantB.count + newConversionsB,
              rate: ((prev.conversions.variantB.count + newConversionsB) / updatedParticipants.variantB * 100)
            }
          };
          
          // Update significance based on new data
          const improvement = ((updatedConversions.variantB.rate - updatedConversions.variantA.rate) / updatedConversions.variantA.rate) * 100;
          const newSignificance = Math.min(95, prev.significance.level + (Math.random() > 0.5 ? 1 : -0.5));
          
          return {
            ...prev,
            participants: updatedParticipants,
            conversions: updatedConversions,
            significance: {
              ...prev.significance,
              level: newSignificance,
              status: newSignificance >= 95 ? 'significant' : newSignificance >= 80 ? 'approaching' : 'not_significant'
            }
          };
        });
        
        setLastUpdated(new Date());
        setIsUpdating(false);
      }, 300);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [realTimeUpdates, refreshInterval, data.status]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const improvement = ((data.conversions.variantB.rate - data.conversions.variantA.rate) / data.conversions.variantA.rate) * 100;
    const isPositive = improvement > 0;
    
    return {
      participantsTotal: data.participants.total,
      conversionRateA: data.conversions.variantA.rate,
      conversionRateB: data.conversions.variantB.rate,
      improvement,
      isPositive,
      significance: data.significance.level,
      pValue: data.significance.pValue,
      confidenceInterval: data.significance.confidenceInterval
    };
  }, [data]);

  // Chart colors
  const colors = {
    variantA: '#3b82f6',
    variantB: '#10b981',
    improvement: '#f59e0b',
    significance: '#8b5cf6'
  };

  const renderOverviewTab = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Key Metrics */}
      <MetricsGrid>
        <MetricCard
          title="Total Participants"
          value={metrics.participantsTotal.toLocaleString()}
          icon="users"
          trend={{ value: '+127', label: 'vs yesterday' }}
          color="blue"
        />
        <MetricCard
          title="Conversion Rate A"
          value={`${metrics.conversionRateA.toFixed(1)}%`}
          icon="target"
          trend={{ value: `${data.participants.variantA} users`, label: 'participants' }}
          color="blue"
        />
        <MetricCard
          title="Conversion Rate B"
          value={`${metrics.conversionRateB.toFixed(1)}%`}
          icon="zap"
          trend={{ value: `${data.participants.variantB} users`, label: 'participants' }}
          color="green"
        />
        <MetricCard
          title="Improvement"
          value={`${metrics.improvement > 0 ? '+' : ''}${metrics.improvement.toFixed(1)}%`}
          icon={metrics.isPositive ? 'trending-up' : 'trending-down'}
          trend={{ value: metrics.confidenceInterval, label: 'confidence' }}
          color={metrics.isPositive ? 'green' : 'red'}
        />
      </MetricsGrid>

      {/* Variant Comparison */}
      <VariantComparison>
        <VariantCard variant="A" whileHover={{ scale: 1.02 }}>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
            Control Group
          </Typography>
          <VariantValue variant="A">
            {metrics.conversionRateA.toFixed(1)}%
          </VariantValue>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
            {data.conversions.variantA.count} conversions
          </Typography>
          <VariantChange variant="A" positive={false}>
            <Icon name="minus" size={14} />
            Baseline
          </VariantChange>
        </VariantCard>

        <VariantCard variant="B" whileHover={{ scale: 1.02 }}>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
            Test Variant
          </Typography>
          <VariantValue variant="B">
            {metrics.conversionRateB.toFixed(1)}%
          </VariantValue>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
            {data.conversions.variantB.count} conversions
          </Typography>
          <VariantChange variant="B" positive={metrics.isPositive}>
            <Icon name={metrics.isPositive ? 'trending-up' : 'trending-down'} size={14} />
            {metrics.improvement > 0 ? '+' : ''}{metrics.improvement.toFixed(1)}%
          </VariantChange>
        </VariantCard>
      </VariantComparison>

      {/* Statistical Significance */}
      <StatisticalSignificance
        whileHover={{ scale: 1.01 }}
        animate={data.significance.status === 'significant' ? { 
          boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 10px rgba(34, 197, 94, 0)'],
        } : {}}
        transition={{ duration: 2, repeat: data.significance.status === 'significant' ? Infinity : 0 }}
      >
        <SignificanceHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icon name="bar-chart" size={24} />
            <Typography variant="h6" weight="semibold">
              Statistical Significance
            </Typography>
            <Badge 
              variant={data.significance.status === 'significant' ? 'success' : 'warning'}
              size="sm"
            >
              {data.significance.status === 'significant' ? 'Significant' : 
               data.significance.status === 'approaching' ? 'Approaching' : 'Not Significant'}
            </Badge>
          </div>
          {realTimeUpdates && (
            <Typography variant="caption" color="tertiary">
              Updated {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </SignificanceHeader>

        <SignificanceGrid>
          <SignificanceItem>
            <SignificanceValue status={data.significance.status}>
              {metrics.significance.toFixed(1)}%
            </SignificanceValue>
            <SignificanceLabel>Confidence Level</SignificanceLabel>
          </SignificanceItem>
          <SignificanceItem>
            <SignificanceValue status="info">
              {metrics.pValue.toFixed(3)}
            </SignificanceValue>
            <SignificanceLabel>P-Value</SignificanceLabel>
          </SignificanceItem>
          <SignificanceItem>
            <SignificanceValue status="info">
              {metrics.confidenceInterval}
            </SignificanceValue>
            <SignificanceLabel>Confidence Interval</SignificanceLabel>
          </SignificanceItem>
          <SignificanceItem>
            <SignificanceValue status="info">
              {data.daysRemaining}
            </SignificanceValue>
            <SignificanceLabel>Days Remaining</SignificanceLabel>
          </SignificanceItem>
        </SignificanceGrid>
      </StatisticalSignificance>

      {/* Real-time Conversion Rate Chart */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <RealTimeUpdates>
          {isUpdating && (
            <UpdateIndicator
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            />
          )}
        </RealTimeUpdates>
        <ChartHeader>
          <ChartTitle>
            <Icon name="activity" size={20} />
            <Typography variant="h6" weight="semibold">
              Real-time Conversion Rates
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="variantA" 
              stroke={colors.variantA}
              strokeWidth={3}
              dot={{ fill: colors.variantA, strokeWidth: 2, r: 4 }}
              name="Variant A"
            />
            <Line 
              type="monotone" 
              dataKey="variantB" 
              stroke={colors.variantB}
              strokeWidth={3}
              dot={{ fill: colors.variantB, strokeWidth: 2, r: 4 }}
              name="Variant B"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderTimelineTab = () => (
    <motion.div
      key="timeline"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="trending-up" size={20} />
            <Typography variant="h6" weight="semibold">
              Conversion Rate Timeline
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="variantA"
              stackId="1"
              stroke={colors.variantA}
              fill={`${colors.variantA}30`}
              name="Variant A"
            />
            <Area
              type="monotone"
              dataKey="variantB"
              stackId="2"
              stroke={colors.variantB}
              fill={`${colors.variantB}30`}
              name="Variant B"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="bar-chart" size={20} />
            <Typography variant="h6" weight="semibold">
              Daily Improvement Rate
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.timeline.map(item => ({
            ...item,
            improvement: ((item.variantB - item.variantA) / item.variantA * 100).toFixed(1)
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="improvement" fill={colors.improvement} name="Improvement %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderSegmentsTab = () => (
    <motion.div
      key="segments"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="users" size={20} />
            <Typography variant="h6" weight="semibold">
              Performance by User Segment
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.segmentData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" stroke="#64748b" fontSize={12} />
            <YAxis dataKey="segment" type="category" stroke="#64748b" fontSize={12} width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="variantA" fill={colors.variantA} name="Variant A" />
            <Bar dataKey="variantB" fill={colors.variantB} name="Variant B" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="pie-chart" size={20} />
            <Typography variant="h6" weight="semibold">
              Participant Distribution
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Variant A', value: data.participants.variantA, fill: colors.variantA },
                { name: 'Variant B', value: data.participants.variantB, fill: colors.variantB }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderStatisticalTab = () => (
    <motion.div
      key="statistical"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MetricsGrid>
        <MetricCard
          title="Statistical Power"
          value="80%"
          icon="zap"
          trend={{ value: 'Good', label: 'power level' }}
          color="purple"
        />
        <MetricCard
          title="Effect Size"
          value="0.23"
          icon="target"
          trend={{ value: 'Medium', label: 'effect size' }}
          color="orange"
        />
        <MetricCard
          title="Sample Size"
          value={data.participants.total.toLocaleString()}
          icon="users"
          trend={{ value: '95%', label: 'of target' }}
          color="blue"
        />
        <MetricCard
          title="False Discovery Rate"
          value="5%"
          icon="shield"
          trend={{ value: 'Low', label: 'risk level' }}
          color="green"
        />
      </MetricsGrid>

      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="activity" size={20} />
            <Typography variant="h6" weight="semibold">
              Statistical Significance Over Time
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeline.map((item, index) => ({
            ...item,
            significance: Math.min(95, 60 + index * 4 + Math.random() * 3)
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="significance" 
              stroke={colors.significance}
              strokeWidth={3}
              dot={{ fill: colors.significance, strokeWidth: 2, r: 4 }}
              name="Significance %"
            />
            <Line 
              type="monotone" 
              dataKey={() => 95} 
              stroke="#ef4444"
              strokeDasharray="5 5"
              name="95% Threshold"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'timeline':
        return renderTimelineTab();
      case 'segments':
        return renderSegmentsTab();
      case 'statistical':
        return renderStatisticalTab();
      default:
        return null;
    }
  };

  return (
    <VisualizationContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <VisualizationHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="activity" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                {data.testName}
              </Typography>
              <Typography variant="body2" color="secondary">
                Real-time A/B test results and statistical analysis
              </Typography>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <StatusIndicator 
              status={data.status}
              animate={data.status === 'running' ? { 
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 2, repeat: data.status === 'running' ? Infinity : 0 }}
            >
              <Icon name="radio" size={12} />
              {data.status === 'running' ? 'Live' : 'Completed'}
            </StatusIndicator>
            <Progress value={data.progress} max={100} size="sm" />
            <Typography variant="caption" color="secondary">
              {data.progress}%
            </Typography>
          </HeaderRight>
        </HeaderContent>
      </VisualizationHeader>

      {/* Tabs */}
      <TabsContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      {/* Content */}
      <ContentArea>
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </ContentArea>
    </VisualizationContainer>
  );
};

export default ABTestResultsVisualization;