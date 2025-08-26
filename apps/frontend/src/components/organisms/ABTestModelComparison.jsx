import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import MetricCard from '../molecules/MetricCard';
import { useI18n } from '../../hooks/useI18n';

const ComparisonContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ComparisonHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.indigo[25]} 0%, 
    ${props => props.theme.colors.indigo[50]} 100%);
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
    ${props => props.theme.colors.indigo[500]} 0%, 
    ${props => props.theme.colors.indigo[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
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

const ModelCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ModelCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['isWinner', 'modelType'].includes(prop)
})`
  background: ${props => props.isWinner 
    ? `linear-gradient(135deg, ${props.theme.colors.green[25]} 0%, ${props.theme.colors.green[50]} 100%)`
    : props.theme.colors.background.secondary};
  border: 2px solid ${props => props.isWinner 
    ? props.theme.colors.green[300]
    : props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  position: relative;
  
  ${props => props.isWinner && css`
    &::before {
      content: '👑 WINNER';
      position: absolute;
      top: -12px;
      right: 20px;
      background: linear-gradient(135deg, ${props.theme.colors.yellow[400]}, ${props.theme.colors.yellow[500]});
      color: white;
      font-size: ${props.theme.typography.fontSize.xs};
      font-weight: ${props.theme.typography.fontWeight.bold};
      padding: 4px 12px;
      border-radius: 12px;
      letter-spacing: 0.5px;
    }
  `}
`;

const ModelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ModelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ModelIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'modelType'
})`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getModelColor(props.modelType, props.theme)}20;
  color: ${props => getModelColor(props.modelType, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[3]};
`;

const MetricItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'trend'
})`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => 
    props.trend === 'positive' ? props.theme.colors.green[600] :
    props.trend === 'negative' ? props.theme.colors.red[600] :
    props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const ComparisonTable = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.tertiary};
  border-bottom: 2px solid ${props => props.theme.colors.border.default};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const TableRow = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'isWinner'
})`
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  transition: all 0.2s ease;
  
  ${props => props.isWinner && css`
    background: ${props.theme.colors.green[25]};
  `}
  
  &:hover {
    background: ${props => props.isWinner 
      ? props.theme.colors.green[50]
      : props.theme.colors.background.primary};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'align'
})`
  display: flex;
  align-items: center;
  justify-content: ${props => props.align || 'flex-start'};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ModelName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const ScoreBar = styled.div`
  position: relative;
  width: 100%;
  height: 24px;
  background: ${props => props.theme.colors.gray[100]};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
`;

const ScoreFill = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['score', 'color'].includes(prop)
})`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: ${props => props.color};
  border-radius: ${props => props.theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: ${props => props.theme.spacing[2]};
`;

const ScoreText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: white;
`;

const PerformanceRadar = styled.div`
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InsightCard = styled(motion.div)`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.blue[25]} 0%, 
    ${props => props.theme.colors.blue[50]} 100%);
  border: 1px solid ${props => props.theme.colors.blue[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const InsightList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InsightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Utility functions
const getModelColor = (modelType, theme) => {
  const colors = {
    'claude-sonnet': theme.colors?.purple?.[500] || '#8B5CF6',
    'claude-haiku': theme.colors?.blue?.[500] || '#3B82F6',
    'gpt-4': theme.colors?.green?.[500] || '#10B981',
    'gpt-3.5': theme.colors?.teal?.[500] || '#14B8A6',
    'custom': theme.colors?.orange?.[500] || '#F97316'
  };
  return colors[modelType] || colors['custom'];
};

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

const ABTestModelComparison = ({
  models = [],
  testResults,
  onModelSelect,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModels, setSelectedModels] = useState([]);
  
  // Mock model comparison data
  const [comparisonData, setComparisonData] = useState({
    models: [
      {
        id: 'claude-sonnet-3.5',
        name: 'Claude 3.5 Sonnet',
        type: 'claude-sonnet',
        provider: 'Anthropic',
        version: '3.5',
        metrics: {
          accuracy: 94.2,
          speed: 1.8,
          cost: 0.024,
          satisfaction: 4.7,
          conversionRate: 14.7,
          responseTime: 1800,
          errorRate: 0.8,
          precision: 92.5,
          recall: 89.3,
          f1Score: 90.9
        },
        performance: {
          recommendations: 94,
          personalization: 92,
          understanding: 96,
          creativity: 88,
          reliability: 95,
          scalability: 90
        },
        timeline: [
          { date: '2024-08-06', conversion: 12.1, accuracy: 91.2 },
          { date: '2024-08-07', conversion: 13.2, accuracy: 92.5 },
          { date: '2024-08-08', conversion: 13.8, accuracy: 93.1 },
          { date: '2024-08-09', conversion: 14.2, accuracy: 93.8 },
          { date: '2024-08-10', conversion: 14.5, accuracy: 94.0 },
          { date: '2024-08-11', conversion: 14.6, accuracy: 94.1 },
          { date: '2024-08-12', conversion: 14.7, accuracy: 94.2 }
        ]
      },
      {
        id: 'claude-haiku-3',
        name: 'Claude 3 Haiku',
        type: 'claude-haiku',
        provider: 'Anthropic',
        version: '3.0',
        metrics: {
          accuracy: 89.5,
          speed: 0.4,
          cost: 0.003,
          satisfaction: 4.3,
          conversionRate: 12.3,
          responseTime: 400,
          errorRate: 1.5,
          precision: 88.2,
          recall: 85.7,
          f1Score: 86.9
        },
        performance: {
          recommendations: 88,
          personalization: 85,
          understanding: 90,
          creativity: 82,
          reliability: 92,
          scalability: 95
        },
        timeline: [
          { date: '2024-08-06', conversion: 10.5, accuracy: 87.1 },
          { date: '2024-08-07', conversion: 11.2, accuracy: 88.0 },
          { date: '2024-08-08', conversion: 11.6, accuracy: 88.5 },
          { date: '2024-08-09', conversion: 11.9, accuracy: 89.0 },
          { date: '2024-08-10', conversion: 12.1, accuracy: 89.3 },
          { date: '2024-08-11', conversion: 12.2, accuracy: 89.4 },
          { date: '2024-08-12', conversion: 12.3, accuracy: 89.5 }
        ]
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        type: 'gpt-4',
        provider: 'OpenAI',
        version: 'turbo',
        metrics: {
          accuracy: 91.8,
          speed: 2.2,
          cost: 0.030,
          satisfaction: 4.5,
          conversionRate: 13.5,
          responseTime: 2200,
          errorRate: 1.2,
          precision: 90.5,
          recall: 87.8,
          f1Score: 89.1
        },
        performance: {
          recommendations: 91,
          personalization: 88,
          understanding: 93,
          creativity: 90,
          reliability: 91,
          scalability: 88
        },
        timeline: [
          { date: '2024-08-06', conversion: 11.8, accuracy: 89.5 },
          { date: '2024-08-07', conversion: 12.4, accuracy: 90.2 },
          { date: '2024-08-08', conversion: 12.9, accuracy: 90.8 },
          { date: '2024-08-09', conversion: 13.2, accuracy: 91.3 },
          { date: '2024-08-10', conversion: 13.4, accuracy: 91.6 },
          { date: '2024-08-11', conversion: 13.4, accuracy: 91.7 },
          { date: '2024-08-12', conversion: 13.5, accuracy: 91.8 }
        ]
      }
    ],
    ...testResults
  });

  // Calculate winner based on multiple metrics
  const winner = useMemo(() => {
    if (!comparisonData.models || comparisonData.models.length === 0) return null;
    
    // Weighted scoring system
    const weights = {
      accuracy: 0.25,
      conversionRate: 0.25,
      satisfaction: 0.20,
      speed: 0.15,
      cost: 0.15
    };
    
    const scores = comparisonData.models.map(model => {
      const score = 
        (model.metrics.accuracy / 100) * weights.accuracy +
        (model.metrics.conversionRate / 20) * weights.conversionRate +
        (model.metrics.satisfaction / 5) * weights.satisfaction +
        (1 / model.metrics.speed) * weights.speed +
        (1 / model.metrics.cost) * weights.cost;
      
      return { ...model, totalScore: score };
    });
    
    return scores.reduce((max, model) => 
      model.totalScore > max.totalScore ? model : max
    );
  }, [comparisonData.models]);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'layout' },
    { id: 'metrics', label: 'Detailed Metrics', icon: 'bar-chart' },
    { id: 'performance', label: 'Performance Analysis', icon: 'activity' },
    { id: 'cost', label: 'Cost Analysis', icon: 'dollar-sign' },
    { id: 'timeline', label: 'Timeline Comparison', icon: 'trending-up' }
  ];

  // Generate insights based on comparison
  const insights = useMemo(() => {
    if (!winner) return [];
    
    const insights = [];
    
    // Accuracy insight
    if (winner.metrics.accuracy > 90) {
      insights.push(`${winner.name} achieves ${winner.metrics.accuracy}% accuracy, exceeding industry benchmarks`);
    }
    
    // Speed vs accuracy tradeoff
    const fastestModel = comparisonData.models.reduce((min, model) => 
      model.metrics.speed < min.metrics.speed ? model : min
    );
    if (fastestModel.id !== winner.id) {
      insights.push(`Consider ${fastestModel.name} for real-time applications (${fastestModel.metrics.speed}s response time)`);
    }
    
    // Cost efficiency
    const cheapestModel = comparisonData.models.reduce((min, model) => 
      model.metrics.cost < min.metrics.cost ? model : min
    );
    if (cheapestModel.id !== winner.id) {
      insights.push(`${cheapestModel.name} offers 
      ${((winner.metrics.cost - cheapestModel.metrics.cost) / winner.metrics.cost * 100).toFixed(0)}% cost savings`);
    }
    
    // Conversion rate improvement
    const conversionImprovement = ((winner.metrics.conversionRate - 10) / 10 * 100).toFixed(1);
    insights.push(`${winner.name} delivers ${conversionImprovement}% improvement in conversion rate`);
    
    // Reliability
    if (winner.metrics.errorRate < 1) {
      insights.push(`Exceptional reliability with only ${winner.metrics.errorRate}% error rate`);
    }
    
    return insights;
  }, [winner, comparisonData.models]);

  const renderOverviewTab = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Model Cards */}
      <ModelCards>
        {comparisonData.models.map(model => (
          <ModelCard
            key={model.id}
            isWinner={winner?.id === model.id}
            modelType={model.type}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ModelHeader>
              <ModelInfo>
                <ModelIcon modelType={model.type}>
                  <Icon name="cpu" size={20} />
                </ModelIcon>
                <div>
                  <Typography variant="h6" weight="semibold">
                    {model.name}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {model.provider} • v{model.version}
                  </Typography>
                </div>
              </ModelInfo>
              {winner?.id === model.id && (
                <Badge variant="success" size="sm">
                  Best Overall
                </Badge>
              )}
            </ModelHeader>

            <MetricsGrid>
              <MetricItem>
                <MetricValue trend="positive">
                  {model.metrics.accuracy}%
                </MetricValue>
                <MetricLabel>Accuracy</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue trend="positive">
                  {model.metrics.conversionRate}%
                </MetricValue>
                <MetricLabel>Conversion</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue>
                  {model.metrics.speed}s
                </MetricValue>
                <MetricLabel>Response</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue>
                  ${model.metrics.cost}
                </MetricValue>
                <MetricLabel>Per 1K</MetricLabel>
              </MetricItem>
            </MetricsGrid>

            <div style={{ marginTop: '20px' }}>
              <Typography variant="caption" color="secondary" style={{ marginBottom: '8px', display: 'block' }}>
                Overall Performance Score
              </Typography>
              <ScoreBar>
                <ScoreFill
                  score={model.metrics.accuracy}
                  color={getModelColor(model.type, { colors: { purple: { 500: '#8B5CF6' }, blue: { 500: '#3B82F6' }, green: { 500: '#10B981' } } })}
                  initial={{ width: 0 }}
                  animate={{ width: `${model.metrics.accuracy}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <ScoreText>{model.metrics.accuracy}%</ScoreText>
                </ScoreFill>
              </ScoreBar>
            </div>
          </ModelCard>
        ))}
      </ModelCards>

      {/* Comparison Table */}
      <ComparisonTable>
        <TableHeader>
          <div>Model</div>
          <div style={{ textAlign: 'center' }}>Accuracy</div>
          <div style={{ textAlign: 'center' }}>Speed</div>
          <div style={{ textAlign: 'center' }}>Cost</div>
          <div style={{ textAlign: 'center' }}>Satisfaction</div>
        </TableHeader>
        {comparisonData.models.map(model => (
          <TableRow
            key={model.id}
            isWinner={winner?.id === model.id}
            whileHover={{ x: 2 }}
          >
            <TableCell>
              <ModelName>{model.name}</ModelName>
            </TableCell>
            <TableCell align="center">
              <Badge variant={model.metrics.accuracy > 90 ? 'success' : 'warning'} size="sm">
                {model.metrics.accuracy}%
              </Badge>
            </TableCell>
            <TableCell align="center">
              <Badge variant={model.metrics.speed < 1 ? 'success' : 'info'} size="sm">
                {model.metrics.speed}s
              </Badge>
            </TableCell>
            <TableCell align="center">
              <Badge variant={model.metrics.cost < 0.01 ? 'success' : 'warning'} size="sm">
                ${model.metrics.cost}
              </Badge>
            </TableCell>
            <TableCell align="center">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="star" size={14} style={{ color: '#f59e0b' }} />
                {model.metrics.satisfaction}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </ComparisonTable>

      {/* Insights */}
      <InsightCard whileHover={{ scale: 1.01 }}>
        <InsightHeader>
          <Icon name="lightbulb" size={20} />
          <Typography variant="h6" weight="semibold">
            Key Insights
          </Typography>
        </InsightHeader>
        <InsightList>
          {insights.map((insight, index) => (
            <InsightItem key={index}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#3b82f6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {index + 1}
              </div>
              <span>{insight}</span>
            </InsightItem>
          ))}
        </InsightList>
      </InsightCard>
    </motion.div>
  );

  const renderMetricsTab = () => (
    <motion.div
      key="metrics"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="bar-chart" size={20} />
            <Typography variant="h6" weight="semibold">
              Comprehensive Metrics Comparison
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={comparisonData.models.map(m => ({
            name: m.name.split(' ')[0],
            accuracy: m.metrics.accuracy,
            precision: m.metrics.precision,
            recall: m.metrics.recall,
            f1Score: m.metrics.f1Score
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
            <Bar dataKey="precision" fill="#10b981" name="Precision %" />
            <Bar dataKey="recall" fill="#f59e0b" name="Recall %" />
            <Bar dataKey="f1Score" fill="#8b5cf6" name="F1 Score" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="zap" size={20} />
            <Typography variant="h6" weight="semibold">
              Response Time vs Error Rate
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="responseTime" 
              stroke="#64748b" 
              fontSize={12}
              label={{ value: 'Response Time (ms)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              dataKey="errorRate" 
              stroke="#64748b" 
              fontSize={12}
              label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              name="Models"
              data={comparisonData.models.map(m => ({
                name: m.name,
                responseTime: m.metrics.responseTime,
                errorRate: m.metrics.errorRate,
                fill: getModelColor(m.type, { colors: { purple: { 500: '#8B5CF6' }, blue: { 500: '#3B82F6' }, green: { 500: '#10B981' } } })
              }))}
              fill="#8884d8"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderPerformanceTab = () => (
    <motion.div
      key="performance"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="radar" size={20} />
            <Typography variant="h6" weight="semibold">
              Multi-Dimensional Performance Analysis
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <PerformanceRadar>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={Object.keys(comparisonData.models[0].performance).map(metric => ({
              metric: metric.charAt(0).toUpperCase() + metric.slice(1),
              ...comparisonData.models.reduce((acc, model, index) => ({
                ...acc,
                [`model${index}`]: model.performance[metric]
              }), {})
            }))}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={12} />
              <PolarRadiusAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
              {comparisonData.models.map((model, index) => (
                <Radar
                  key={model.id}
                  name={model.name}
                  dataKey={`model${index}`}
                  stroke={getModelColor(model.type, { colors: { purple: { 500: '#8B5CF6' }, blue: { 500: '#3B82F6' }, green: { 500: '#10B981' } } })}
                  fill={getModelColor(model.type, { colors: { purple: { 500: '#8B5CF6' }, blue: { 500: '#3B82F6' }, green: { 500: '#10B981' } } })}
                  fillOpacity={0.3}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </PerformanceRadar>
      </ChartContainer>

      <ModelCards>
        {comparisonData.models.map(model => {
          const performanceScore = Object.values(model.performance).reduce((sum, val) => sum + val, 0) / Object.values(model.performance).length;
          
          return (
            <ModelCard
              key={model.id}
              whileHover={{ scale: 1.02 }}
            >
              <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
                {model.name} Performance Breakdown
              </Typography>
              {Object.entries(model.performance).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Typography variant="caption" color="secondary">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                    <Typography variant="caption" weight="medium">
                      {value}%
                    </Typography>
                  </div>
                  <ScoreBar>
                    <ScoreFill
                      score={value}
                      color={value > 90 ? '#10b981' : value > 80 ? '#3b82f6' : '#f59e0b'}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </ScoreBar>
                </div>
              ))}
              <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <Typography variant="body2" weight="bold" color="primary">
                  Overall: {performanceScore.toFixed(1)}%
                </Typography>
              </div>
            </ModelCard>
          );
        })}
      </ModelCards>
    </motion.div>
  );

  const renderCostTab = () => (
    <motion.div
      key="cost"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="dollar-sign" size={20} />
            <Typography variant="h6" weight="semibold">
              Cost vs Performance Analysis
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="cost" 
              stroke="#64748b" 
              fontSize={12}
              label={{ value: 'Cost per 1K requests ($)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              dataKey="accuracy" 
              stroke="#64748b" 
              fontSize={12}
              label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              name="Models"
              data={comparisonData.models.map(m => ({
                name: m.name,
                cost: m.metrics.cost,
                accuracy: m.metrics.accuracy,
                fill: getModelColor(m.type, { colors: { purple: { 500: '#8B5CF6' }, blue: { 500: '#3B82F6' }, green: { 500: '#10B981' } } })
              }))}
              fill="#8884d8"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ModelCards>
        {comparisonData.models.map(model => {
          const monthlyVolume = 1000000;
          const monthlyCost = (model.metrics.cost * monthlyVolume / 1000).toFixed(2);
          const costPerConversion = (model.metrics.cost / model.metrics.conversionRate).toFixed(4);
          
          return (
            <ModelCard key={model.id} whileHover={{ scale: 1.02 }}>
              <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
                {model.name} Cost Analysis
              </Typography>
              
              <MetricsGrid>
                <MetricItem>
                  <MetricValue>${model.metrics.cost}</MetricValue>
                  <MetricLabel>Per 1K Requests</MetricLabel>
                </MetricItem>
                <MetricItem>
                  <MetricValue>${monthlyCost}</MetricValue>
                  <MetricLabel>Monthly (1M req)</MetricLabel>
                </MetricItem>
                <MetricItem>
                  <MetricValue>${costPerConversion}</MetricValue>
                  <MetricLabel>Per Conversion</MetricLabel>
                </MetricItem>
                <MetricItem>
                  <MetricValue>
                    {((model.metrics.accuracy / model.metrics.cost).toFixed(1))}
                  </MetricValue>
                  <MetricLabel>Accuracy/$ Ratio</MetricLabel>
                </MetricItem>
              </MetricsGrid>
              
              <div style={{ marginTop: '16px' }}>
                <Typography variant="caption" color="secondary">
                  ROI Projection (based on conversion rate)
                </Typography>
                <Typography variant="h6" weight="bold" color="success">
                  {((model.metrics.conversionRate * 100 / model.metrics.cost).toFixed(0))}x
                </Typography>
              </div>
            </ModelCard>
          );
        })}
      </ModelCards>
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
          <LineChart data={comparisonData.models[0].timeline.map((item, index) => ({
            date: item.date,
            ...comparisonData.models.reduce((acc, model) => ({
              ...acc,
              [model.name]: model.timeline[index]?.conversion || 0
            }), {})
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
            <Legend />
            {comparisonData.models.map(model => (
              <Line
                key={model.id}
                type="monotone"
                dataKey={model.name}
                stroke={getModelColor(model.type, { colors: { purple: { 500: '#8B5CF6' }, blue: { 500: '#3B82F6' }, green: { 500: '#10B981' } } })}
                strokeWidth={3}
                dot={{ fill: getModelColor(model.type, { colors: { purple: { 500: '#8B5CF6' }, blue: { 500: '#3B82F6' }, green: { 500: '#10B981' } } }), strokeWidth: 2, r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="activity" size={20} />
            <Typography variant="h6" weight="semibold">
              Accuracy Improvement Over Time
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={comparisonData.models[0].timeline.map((item, index) => ({
            date: item.date,
            ...comparisonData.models.reduce((acc, model) => ({
              ...acc,
              [`${model.name}_accuracy`]: model.timeline[index]?.accuracy || 0
            }), {})
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#64748b" fontSize={12} domain={[85, 95]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {comparisonData.models.map((model, index) => (
              <Area
                key={model.id}
                type="monotone"
                dataKey={`${model.name}_accuracy`}
                stackId={index}
                stroke={getModelColor(model.type, { colors: { purple: { 500: '#8B5CF6' }, blue: { 500: '#3B82F6' }, green: { 500: '#10B981' } } })}
                fill={`${getModelColor(model.type, { colors: { purple: { 500: '#8B5CF6' }, blue: { 500: '#3B82F6' }, green: { 500: '#10B981' } } })}30`}
                name={model.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'metrics':
        return renderMetricsTab();
      case 'performance':
        return renderPerformanceTab();
      case 'cost':
        return renderCostTab();
      case 'timeline':
        return renderTimelineTab();
      default:
        return null;
    }
  };

  return (
    <ComparisonContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <ComparisonHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="cpu" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                AI Model Performance Comparison
              </Typography>
              <Typography variant="body2" color="secondary">
                Comprehensive analysis of model performance, accuracy, and cost-effectiveness
              </Typography>
            </div>
          </HeaderLeft>
          <div>
            <Button variant="primary" size="sm" onClick={() => onModelSelect?.(winner)}>
              <Icon name="check" size={16} />
              Select Winner
            </Button>
          </div>
        </HeaderContent>
      </ComparisonHeader>

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
    </ComparisonContainer>
  );
};

export default ABTestModelComparison;