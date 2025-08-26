import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import Progress from '../atoms/Progress';
import MetricCard from '../molecules/MetricCard';
import { useI18n } from '../../hooks/useI18n';

const MultiVariantContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const MultiVariantHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.violet[25]} 0%, 
    ${props => props.theme.colors.purple[25]} 100%);
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
    ${props => props.theme.colors.violet[500]} 0%, 
    ${props => props.theme.colors.purple[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
`;

const VariantControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const VariantCount = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: rgba(255, 255, 255, 0.8);
  border-radius: ${props => props.theme.spacing[2]};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
  overflow-x: auto;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  color: ${props => props.active ? props.theme.colors.violet[600] : props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.violet[500] : 'transparent'};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.violet[500]};
    background: ${props => props.theme.colors.violet[25]};
  }
`;

const ContentArea = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const VariantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const VariantCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['performance', 'isWinner', 'variantColor'].includes(prop)
})`
  background: ${props => props.theme.colors.background.secondary};
  border: 2px solid ${props => {
    if (props.isWinner) return props.theme.colors.green[400];
    return props.variantColor || props.theme.colors.border.subtle;
  }};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.variantColor || props.theme.colors.gray[500]};
    border-radius: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]} 0 0;
  }

  ${props => props.isWinner && css`
    box-shadow: 0 0 0 3px ${props.theme.colors.green[100]};
    
    &::after {
      content: '👑';
      position: absolute;
      top: -8px;
      right: 12px;
      font-size: 24px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
  `}
`;

const VariantHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const VariantTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const VariantColorDot = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'color'
})`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const VariantMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin: ${props => props.theme.spacing[3]} 0;
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
  font-size: ${props => props.theme.typography.fontSize.sm};
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

const SetupSection = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const VariantSetup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const VariantInput = styled(Input)`
  flex: 1;
`;

const TrafficSlider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: ${props => props.theme.colors.gray[200]};
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.violet[500]};
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.violet[500]};
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
  }
`;

const StatisticalSection = styled.div`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.blue[25]} 0%, 
    ${props => props.theme.colors.indigo[25]} 100%);
  border: 1px solid ${props => props.theme.colors.blue[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: rgba(255, 255, 255, 0.7);
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'significant':
        return props.theme.colors.green[500];
      case 'approaching':
        return props.theme.colors.yellow[500];
      case 'inconclusive':
        return props.theme.colors.blue[500];
      default:
        return props.theme.colors.gray[500];
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const WinnerIndicator = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.green[100]} 0%, 
    ${props => props.theme.colors.emerald[100]} 100%);
  border: 1px solid ${props => props.theme.colors.green[300]};
  border-radius: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.green[700]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

// Custom tooltip for multi-variant charts
const MultiVariantTooltip = ({ active, payload, label }) => {
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
              {entry.unit && ` ${entry.unit}`}
            </Typography>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MultiVariantTesting = ({
  testData,
  onVariantUpdate,
  onTrafficUpdate,
  onTestStart,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('setup');
  const [variantCount, setVariantCount] = useState(4);
  const [isRunning, setIsRunning] = useState(false);
  
  // Variant colors for visualization
  const variantColors = [
    '#3b82f6', // Blue
    '#10b981', // Green  
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316'  // Orange
  ];

  // Multi-variant test data
  const [variants, setVariants] = useState([
    {
      id: 'variant-a',
      name: 'Original (Control)',
      description: 'Current Claude 3 Haiku implementation',
      trafficAllocation: 25,
      participants: 2847,
      conversions: 387,
      conversionRate: 13.6,
      confidence: 95.2,
      color: variantColors[0],
      isControl: true
    },
    {
      id: 'variant-b', 
      name: 'Claude 3.5 Sonnet',
      description: 'Advanced Sonnet model with better accuracy',
      trafficAllocation: 25,
      participants: 2756,
      conversions: 445,
      conversionRate: 16.1,
      confidence: 96.8,
      color: variantColors[1]
    },
    {
      id: 'variant-c',
      name: 'Optimized Haiku',
      description: 'Haiku with performance optimizations',
      trafficAllocation: 25,
      participants: 2891,
      conversions: 421,
      conversionRate: 14.6,
      confidence: 89.3,
      color: variantColors[2]
    },
    {
      id: 'variant-d',
      name: 'Hybrid Approach',
      description: 'Combined model with intelligent routing',
      trafficAllocation: 25,
      participants: 2634,
      conversions: 473,
      conversionRate: 18.0,
      confidence: 98.1,
      color: variantColors[3]
    }
  ]);

  // Performance timeline data
  const [timelineData, setTimelineData] = useState([
    { time: '00:00', 'variant-a': 13.2, 'variant-b': 15.8, 'variant-c': 14.1, 'variant-d': 17.2 },
    { time: '04:00', 'variant-a': 13.5, 'variant-b': 16.0, 'variant-c': 14.4, 'variant-d': 17.8 },
    { time: '08:00', 'variant-a': 13.4, 'variant-b': 16.2, 'variant-c': 14.5, 'variant-d': 18.1 },
    { time: '12:00', 'variant-a': 13.6, 'variant-b': 16.1, 'variant-c': 14.6, 'variant-d': 18.0 },
    { time: '16:00', 'variant-a': 13.7, 'variant-b': 16.3, 'variant-c': 14.8, 'variant-d': 17.9 },
    { time: '20:00', 'variant-a': 13.6, 'variant-b': 16.1, 'variant-c': 14.6, 'variant-d': 18.0 }
  ]);

  const [statisticalResults, setStatisticalResults] = useState({
    overallSignificance: 96.8,
    winningVariant: 'variant-d',
    pairwiseComparisons: [
      { variant1: 'variant-a', variant2: 'variant-d', pValue: 0.012, significant: true },
      { variant1: 'variant-b', variant2: 'variant-d', pValue: 0.034, significant: true },
      { variant1: 'variant-c', variant2: 'variant-d', pValue: 0.018, significant: true },
      { variant1: 'variant-a', variant2: 'variant-b', pValue: 0.089, significant: false },
      { variant1: 'variant-a', variant2: 'variant-c', pValue: 0.156, significant: false },
      { variant1: 'variant-b', variant2: 'variant-c', pValue: 0.267, significant: false }
    ]
  });

  const tabs = [
    { id: 'setup', label: 'Variant Setup', icon: 'settings' },
    { id: 'results', label: 'Test Results', icon: 'bar-chart' },
    { id: 'analysis', label: 'Statistical Analysis', icon: 'trending-up' },
    { id: 'comparison', label: 'Variant Comparison', icon: 'git-compare' }
  ];

  const winningVariant = useMemo(() => {
    return variants.find(v => v.id === statisticalResults.winningVariant);
  }, [variants, statisticalResults.winningVariant]);

  const handleVariantCountChange = useCallback((newCount) => {
    setVariantCount(Math.max(2, Math.min(8, newCount)));
    // Adjust variants array based on new count
    setVariants(prev => {
      const newVariants = [...prev];
      if (newCount > prev.length) {
        // Add new variants
        for (let i = prev.length; i < newCount; i++) {
          newVariants.push({
            id: `variant-${String.fromCharCode(97 + i)}`,
            name: `Variant ${String.fromCharCode(65 + i)}`,
            description: `Test variant ${String.fromCharCode(65 + i)}`,
            trafficAllocation: Math.floor(100 / newCount),
            participants: 0,
            conversions: 0,
            conversionRate: 0,
            confidence: 0,
            color: variantColors[i % variantColors.length]
          });
        }
      } else if (newCount < prev.length) {
        // Remove excess variants
        newVariants.splice(newCount);
      }
      
      // Redistribute traffic allocation
      const evenAllocation = Math.floor(100 / newCount);
      newVariants.forEach((variant, index) => {
        variant.trafficAllocation = evenAllocation;
      });
      
      return newVariants;
    });
  }, [variantColors]);

  const handleTrafficUpdate = useCallback((variantId, allocation) => {
    setVariants(prev => prev.map(variant => 
      variant.id === variantId 
        ? { ...variant, trafficAllocation: allocation }
        : variant
    ));
    onTrafficUpdate?.(variantId, allocation);
  }, [onTrafficUpdate]);

  const handleStartTest = useCallback(() => {
    setIsRunning(true);
    onTestStart?.(variants);
  }, [variants, onTestStart]);

  const renderSetupTab = () => (
    <motion.div
      key="setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Variant Count Control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Typography variant="h5" weight="semibold">
          Multi-Variant Test Configuration
        </Typography>
        <VariantCount>
          <Typography variant="body2" weight="medium">
            Variants:
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button 
              size="xs" 
              variant="ghost"
              onClick={() => handleVariantCountChange(variantCount - 1)}
              disabled={variantCount <= 2}
            >
              <Icon name="minus" size={14} />
            </Button>
            <Typography variant="body1" weight="bold" style={{ minWidth: '20px', textAlign: 'center' }}>
              {variantCount}
            </Typography>
            <Button 
              size="xs" 
              variant="ghost"
              onClick={() => handleVariantCountChange(variantCount + 1)}
              disabled={variantCount >= 8}
            >
              <Icon name="plus" size={14} />
            </Button>
          </div>
        </VariantCount>
      </div>

      {/* Variant Setup */}
      <SetupSection>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
          Configure Test Variants
        </Typography>
        
        {variants.map((variant, index) => (
          <VariantSetup key={variant.id}>
            <VariantColorDot color={variant.color} />
            
            <div style={{ minWidth: '60px' }}>
              <Typography variant="body2" weight="medium">
                {String.fromCharCode(65 + index)}
              </Typography>
              <Typography variant="caption" color="secondary">
                {variant.isControl ? 'Control' : 'Variant'}
              </Typography>
            </div>
            
            <VariantInput
              placeholder="Variant name"
              value={variant.name}
              onChange={(e) => {
                setVariants(prev => prev.map(v => 
                  v.id === variant.id ? { ...v, name: e.target.value } : v
                ));
              }}
            />
            
            <VariantInput
              placeholder="Description"
              value={variant.description}
              onChange={(e) => {
                setVariants(prev => prev.map(v => 
                  v.id === variant.id ? { ...v, description: e.target.value } : v
                ));
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
              <TrafficSlider
                type="range"
                min="0"
                max="100"
                value={variant.trafficAllocation}
                onChange={(e) => handleTrafficUpdate(variant.id, parseInt(e.target.value))}
              />
              <Typography variant="body2" weight="medium" style={{ minWidth: '35px' }}>
                {variant.trafficAllocation}%
              </Typography>
            </div>
          </VariantSetup>
        ))}
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
          <Typography variant="body2" color="secondary">
            Total traffic allocation: {variants.reduce((sum, v) => sum + v.trafficAllocation, 0)}%
          </Typography>
          {variants.reduce((sum, v) => sum + v.trafficAllocation, 0) !== 100 && (
            <Badge variant="warning" size="xs">
              Must equal 100%
            </Badge>
          )}
        </div>
      </SetupSection>

      {/* Test Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button 
          variant="primary" 
          size="lg"
          onClick={handleStartTest}
          disabled={isRunning || variants.reduce((sum, v) => sum + v.trafficAllocation, 0) !== 100}
        >
          <Icon name="play" size={16} />
          {isRunning ? 'Test Running' : 'Start Multi-Variant Test'}
        </Button>
        
        {isRunning && (
          <Button variant="secondary" size="lg">
            <Icon name="pause" size={16} />
            Pause Test
          </Button>
        )}
        
        <Typography variant="body2" color="secondary">
          Test duration: 14 days • Target significance: 95%
        </Typography>
      </div>
    </motion.div>
  );

  const renderResultsTab = () => (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Winner Announcement */}
      {winningVariant && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <WinnerIndicator
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <Icon name="trophy" size={20} />
            <Typography variant="h6" weight="bold">
              {winningVariant.name} is the winner with {winningVariant.conversionRate}% conversion rate!
            </Typography>
          </WinnerIndicator>
        </div>
      )}

      {/* Variant Performance Cards */}
      <VariantGrid>
        {variants.map((variant, index) => (
          <VariantCard
            key={variant.id}
            variantColor={variant.color}
            isWinner={variant.id === statisticalResults.winningVariant}
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <VariantHeader>
              <VariantTitle>
                <VariantColorDot color={variant.color} />
                <div>
                  <Typography variant="h6" weight="semibold">
                    {variant.name}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {variant.description}
                  </Typography>
                </div>
              </VariantTitle>
              <div style={{ textAlign: 'right' }}>
                <Typography variant="h5" weight="bold" style={{ 
                  color: variant.id === statisticalResults.winningVariant ? '#10b981' : 'inherit'
                }}>
                  {variant.conversionRate}%
                </Typography>
                <Typography variant="caption" color="secondary">
                  Conversion
                </Typography>
              </div>
            </VariantHeader>

            <VariantMetrics>
              <MetricItem>
                <MetricValue>{variant.participants.toLocaleString()}</MetricValue>
                <MetricLabel>Participants</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue>{variant.conversions.toLocaleString()}</MetricValue>
                <MetricLabel>Conversions</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue>{variant.trafficAllocation}%</MetricValue>
                <MetricLabel>Traffic</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue trend={variant.confidence >= 95 ? 'positive' : 'neutral'}>
                  {variant.confidence}%
                </MetricValue>
                <MetricLabel>Confidence</MetricLabel>
              </MetricItem>
            </VariantMetrics>

            <div style={{ marginTop: '12px' }}>
              <Progress 
                value={variant.confidence} 
                max={100}
                color={variant.confidence >= 95 ? 'green' : variant.confidence >= 80 ? 'yellow' : 'gray'}
              />
            </div>
          </VariantCard>
        ))}
      </VariantGrid>

      {/* Performance Timeline */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="trending-up" size={20} />
            <Typography variant="h6" weight="semibold">
              Conversion Rate Timeline
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<MultiVariantTooltip />} />
            <Legend />
            {variants.map((variant, index) => (
              <Line
                key={variant.id}
                type="monotone"
                dataKey={variant.id}
                stroke={variant.color}
                strokeWidth={3}
                dot={{ fill: variant.color, strokeWidth: 2, r: 5 }}
                name={variant.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <MetricCard
          title="Total Participants"
          value={variants.reduce((sum, v) => sum + v.participants, 0).toLocaleString()}
          icon="users"
          trend={{ value: 'Across all variants', label: 'test coverage' }}
          color="blue"
        />
        <MetricCard
          title="Overall Significance"
          value={`${statisticalResults.overallSignificance}%`}
          icon="target"
          trend={{ 
            value: statisticalResults.overallSignificance >= 95 ? 'Significant' : 'In progress',
            label: 'statistical power'
          }}
          color={statisticalResults.overallSignificance >= 95 ? 'green' : 'yellow'}
        />
        <MetricCard
          title="Best Performer"
          value={winningVariant?.name || 'TBD'}
          icon="trophy"
          trend={{ 
            value: winningVariant ? `+${(winningVariant.conversionRate - variants[0].conversionRate).toFixed(1)}%` : '0%',
            label: 'vs control'
          }}
          color="purple"
        />
        <MetricCard
          title="Test Duration"
          value="8.5 days"
          icon="clock"
          trend={{ value: '5.5 days remaining', label: 'until completion' }}
          color="orange"
        />
      </div>
    </motion.div>
  );

  const renderAnalysisTab = () => (
    <motion.div
      key="analysis"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Statistical Significance Overview */}
      <StatisticalSection>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Icon name="activity" size={24} />
          <Typography variant="h6" weight="semibold">
            Statistical Analysis Results
          </Typography>
        </div>

        <StatCard>
          <StatIcon status={statisticalResults.overallSignificance >= 95 ? 'significant' : 'approaching'}>
            <Icon name="target" size={16} />
          </StatIcon>
          <div style={{ flex: 1 }}>
            <Typography variant="body1" weight="medium">
              Overall Test Significance
            </Typography>
            <Typography variant="body2" color="secondary">
              {statisticalResults.overallSignificance}% confidence level achieved
            </Typography>
          </div>
          <Typography variant="h6" weight="bold" color={
            statisticalResults.overallSignificance >= 95 ? 'success' : 'warning'
          }>
            {statisticalResults.overallSignificance >= 95 ? 'SIGNIFICANT' : 'APPROACHING'}
          </Typography>
        </StatCard>

        <StatCard>
          <StatIcon status="significant">
            <Icon name="trending-up" size={16} />
          </StatIcon>
          <div style={{ flex: 1 }}>
            <Typography variant="body1" weight="medium">
              Effect Size Analysis
            </Typography>
            <Typography variant="body2" color="secondary">
              Large effect size detected between variants
            </Typography>
          </div>
          <Typography variant="h6" weight="bold" color="success">
            LARGE
          </Typography>
        </StatCard>

        <StatCard>
          <StatIcon status="significant">
            <Icon name="check-circle" size={16} />
          </StatIcon>
          <div style={{ flex: 1 }}>
            <Typography variant="body1" weight="medium">
              Sample Size Adequacy
            </Typography>
            <Typography variant="body2" color="secondary">
              Sufficient data collected for reliable conclusions
            </Typography>
          </div>
          <Typography variant="h6" weight="bold" color="success">
            ADEQUATE
          </Typography>
        </StatCard>
      </StatisticalSection>

      {/* Pairwise Comparisons */}
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Pairwise Statistical Comparisons
      </Typography>

      <div style={{ display: 'grid', gap: '12px', marginBottom: '30px' }}>
        {statisticalResults.pairwiseComparisons.map((comparison, index) => {
          const variant1 = variants.find(v => v.id === comparison.variant1);
          const variant2 = variants.find(v => v.id === comparison.variant2);
          
          return (
            <motion.div
              key={`${comparison.variant1}-${comparison.variant2}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: props.theme?.colors?.background?.secondary || '#f8fafc',
                borderRadius: '8px',
                border: `1px solid ${comparison.significant ? '#10b981' : '#e2e8f0'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <VariantColorDot color={variant1?.color} />
                <Typography variant="body2" weight="medium">
                  {variant1?.name}
                </Typography>
                <Typography variant="body2" color="secondary">vs</Typography>
                <VariantColorDot color={variant2?.color} />
                <Typography variant="body2" weight="medium">
                  {variant2?.name}
                </Typography>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <Typography variant="body2" weight="medium">
                    p-value: {comparison.pValue.toFixed(3)}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    α = 0.05 threshold
                  </Typography>
                </div>
                <Badge 
                  variant={comparison.significant ? 'success' : 'secondary'} 
                  size="sm"
                >
                  {comparison.significant ? 'SIGNIFICANT' : 'NOT SIGNIFICANT'}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analysis Charts */}
      <AnalysisGrid>
        {/* Conversion Rate Distribution */}
        <ChartContainer whileHover={{ scale: 1.005 }}>
          <ChartHeader>
            <ChartTitle>
              <Icon name="bar-chart" size={20} />
              <Typography variant="h6" weight="semibold">
                Conversion Rate Distribution
              </Typography>
            </ChartTitle>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={variants}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<MultiVariantTooltip />} />
              <Bar dataKey="conversionRate" radius={[4, 4, 0, 0]}>
                {variants.map((variant, index) => (
                  <Cell key={`cell-${index}`} fill={variant.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Confidence Level Radar */}
        <ChartContainer whileHover={{ scale: 1.005 }}>
          <ChartHeader>
            <ChartTitle>
              <Icon name="radar" size={20} />
              <Typography variant="h6" weight="semibold">
                Confidence Radar
              </Typography>
            </ChartTitle>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={variants.map(v => ({ variant: v.name, confidence: v.confidence }))}>
              <PolarGrid />
              <PolarAngleAxis dataKey="variant" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Confidence"
                dataKey="confidence"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </AnalysisGrid>
    </motion.div>
  );

  const renderComparisonTab = () => (
    <motion.div
      key="comparison"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Detailed Variant Comparison
      </Typography>

      {/* Comparison Matrix */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="git-compare" size={20} />
            <Typography variant="h6" weight="semibold">
              Multi-Metric Comparison
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={variants.map(v => ({
              name: v.name,
              conversionRate: v.conversionRate,
              participants: v.participants / 100, // Scale for visibility
              confidence: v.confidence
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<MultiVariantTooltip />} />
            <Legend />
            <Bar dataKey="conversionRate" fill="#3b82f6" name="Conversion Rate (%)" />
            <Bar dataKey="confidence" fill="#10b981" name="Confidence Level (%)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Performance Comparison Table */}
      <div style={{ 
        background: props.theme?.colors?.background?.secondary || '#f8fafc',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
          gap: '12px',
          padding: '16px',
          background: '#f1f5f9',
          fontWeight: 600,
          fontSize: '14px',
          color: '#374151'
        }}>
          <div>Variant</div>
          <div>Conversion Rate</div>
          <div>Participants</div>
          <div>Conversions</div>
          <div>Confidence</div>
          <div>Status</div>
        </div>
        
        {variants.map((variant, index) => (
          <div
            key={variant.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: '12px',
              padding: '16px',
              alignItems: 'center',
              borderTop: index > 0 ? '1px solid #e2e8f0' : 'none',
              background: variant.id === statisticalResults.winningVariant ? '#f0fdf4' : 'white'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <VariantColorDot color={variant.color} />
              <div>
                <Typography variant="body2" weight="medium">
                  {variant.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {variant.description}
                </Typography>
              </div>
            </div>
            <Typography variant="body2" weight="bold">
              {variant.conversionRate}%
            </Typography>
            <Typography variant="body2">
              {variant.participants.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              {variant.conversions.toLocaleString()}
            </Typography>
            <Typography variant="body2" color={variant.confidence >= 95 ? 'success' : 'secondary'}>
              {variant.confidence}%
            </Typography>
            <div style={{ display: 'flex', gap: '4px' }}>
              {variant.id === statisticalResults.winningVariant && (
                <Badge variant="success" size="xs">WINNER</Badge>
              )}
              {variant.isControl && (
                <Badge variant="secondary" size="xs">CONTROL</Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div style={{ marginTop: '30px' }}>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
          Key Insights
        </Typography>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
            <Typography variant="body2" weight="medium" style={{ marginBottom: '4px' }}>
              🏆 Winner Identified
            </Typography>
            <Typography variant="body2" color="secondary">
              {winningVariant?.name} shows a {((winningVariant?.conversionRate || 0) - variants[0].conversionRate).toFixed(1)}% improvement over the control with 98.1% confidence
            </Typography>
          </div>
          
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
            <Typography variant="body2" weight="medium" style={{ marginBottom: '4px' }}>
              📊 Statistical Power
            </Typography>
            <Typography variant="body2" color="secondary">
              All variants have sufficient sample sizes for reliable conclusions. Consider running for 2 more days for maximum confidence.
            </Typography>
          </div>

          <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '8px', border: '1px solid #3b82f6' }}>
            <Typography variant="body2" weight="medium" style={{ marginBottom: '4px' }}>
              🎯 Implementation Recommendation  
            </Typography>
            <Typography variant="body2" color="secondary">
              Implement {winningVariant?.name} immediately. Expected revenue impact: +32% based on current conversion improvements.
            </Typography>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'setup':
        return renderSetupTab();
      case 'results':
        return renderResultsTab();
      case 'analysis':
        return renderAnalysisTab();
      case 'comparison':
        return renderComparisonTab();
      default:
        return null;
    }
  };

  return (
    <MultiVariantContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <MultiVariantHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="git-branch" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                Multi-Variant Testing
              </Typography>
              <Typography variant="body2" color="secondary">
                Advanced A/B/C/D/... testing with statistical analysis and variant comparison
              </Typography>
            </div>
          </HeaderLeft>
          <VariantControls>
            <VariantCount>
              <Typography variant="body2" weight="medium">
                {variantCount} Variants
              </Typography>
              {isRunning && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: '#10b981', 
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="caption" color="success" weight="medium">
                    LIVE
                  </Typography>
                </div>
              )}
            </VariantCount>
            {winningVariant && (
              <Badge variant="success" size="sm">
                <Icon name="trophy" size={12} />
                {winningVariant.name} Leading
              </Badge>
            )}
          </VariantControls>
        </HeaderContent>
      </MultiVariantHeader>

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
    </MultiVariantContainer>
  );
};

export default MultiVariantTesting;