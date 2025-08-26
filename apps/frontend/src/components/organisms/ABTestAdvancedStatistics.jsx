import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Calculator, Brain, Target, AlertTriangle, CheckCircle, Zap, BarChart3, PieChart as PieChartIcon, Download, Filter } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const StatsContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.primary};
  min-height: 100vh;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
  
  h2 {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    margin-bottom: ${props => props.theme.spacing[2]};
  }
  
  p {
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.base};
    max-width: 600px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[4]};
  }
`;

const StatsCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  animation: ${fadeIn} 0.6s ease-out;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  h3 {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin: 0;
  }
`;

const TabContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  margin-bottom: ${props => props.theme.spacing[4]};
  overflow-x: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    gap: ${props => props.theme.spacing[1]};
  }
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: none;
  background: none;
  color: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary[600] : 'transparent'};
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: ${props => props.theme.colors.primary[600]};
    background: ${props => props.theme.colors.primary[50]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
`;

const ContentArea = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
`;

const MetricCard = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
  
  h4 {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.base};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin: 0;
  }
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => {
    if (props.status === 'excellent') return props.theme.colors.green[600];
    if (props.status === 'good') return props.theme.colors.blue[600];
    if (props.status === 'warning') return props.theme.colors.yellow[600];
    if (props.status === 'poor') return props.theme.colors.red[600];
    return props.theme.colors.text.primary;
  }};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin: 0;
  line-height: 1.5;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  .recharts-wrapper {
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
  
  .recharts-tooltip-wrapper {
    .recharts-default-tooltip {
      background: ${props => props.theme.colors.background.elevated} !important;
      border: 1px solid ${props => props.theme.colors.border.subtle} !important;
      border-radius: ${props => props.theme.spacing[2]} !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
    }
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.status) {
      case 'excellent':
        return `
          background: ${props.theme.colors.green[100]};
          color: ${props.theme.colors.green[700]};
        `;
      case 'good':
        return `
          background: ${props.theme.colors.blue[100]};
          color: ${props.theme.colors.blue[700]};
        `;
      case 'warning':
        return `
          background: ${props.theme.colors.yellow[100]};
          color: ${props.theme.colors.yellow[700]};
        `;
      case 'poor':
        return `
          background: ${props.theme.colors.red[100]};
          color: ${props.theme.colors.red[700]};
        `;
      default:
        return `
          background: ${props.theme.colors.gray[100]};
          color: ${props.theme.colors.gray[700]};
        `;
    }
  }}
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary[50]};
    border-color: ${props => props.theme.colors.primary[200]};
    color: ${props => props.theme.colors.primary[700]};
  }
`;

const ParameterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ParameterCard = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
`;

const ParameterLabel = styled.label`
  display: block;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const ParameterInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
`;

const ParameterSelect = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[1]};
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ABTestAdvancedStatistics = ({ testData, onAnalysisUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState('powerAnalysis');
  const [parameters, setParameters] = useState({
    alpha: 0.05,
    power: 0.8,
    effectSize: 0.05,
    baseConversionRate: 0.12,
    minimumDetectableEffect: 0.03,
    confidenceLevel: 0.95,
    testType: 'two-tailed',
    allocation: 0.5
  });

  // Mock statistical calculations based on parameters
  const statisticalAnalysis = useMemo(() => {
    const { alpha, power, effectSize, baseConversionRate, minimumDetectableEffect, confidenceLevel } = parameters;
    
    // Power analysis calculations
    const sampleSizePerVariant = Math.ceil((Math.pow((1.96 + 0.84), 2) * 2 * baseConversionRate * (1 - baseConversionRate)) / Math.pow(effectSize, 2));
    const actualPower = Math.min(0.99, power + Math.random() * 0.1 - 0.05);
    const detectedEffectSize = effectSize * (0.8 + Math.random() * 0.4);
    
    // Effect size calculations
    const cohensD = detectedEffectSize / Math.sqrt(baseConversionRate * (1 - baseConversionRate));
    const effectSizeInterpretation = cohensD < 0.2 ? 'small' : cohensD < 0.5 ? 'medium' : cohensD < 0.8 ? 'large' : 'very large';
    
    // Confidence intervals
    const marginOfError = 1.96 * Math.sqrt((baseConversionRate * (1 - baseConversionRate)) / sampleSizePerVariant);
    const confidenceInterval = [
      Math.max(0, baseConversionRate - marginOfError),
      Math.min(1, baseConversionRate + marginOfError)
    ];
    
    // Bayesian analysis
    const bayesianProbability = Math.random() * 0.3 + 0.7; // Mock Bayesian probability
    const credibleInterval = [
      baseConversionRate - minimumDetectableEffect * 1.2,
      baseConversionRate + minimumDetectableEffect * 1.2
    ];
    
    return {
      powerAnalysis: {
        sampleSize: sampleSizePerVariant,
        actualPower,
        expectedDuration: Math.ceil(sampleSizePerVariant / 100), // days
        status: actualPower >= 0.8 ? 'excellent' : actualPower >= 0.7 ? 'good' : 'warning'
      },
      effectSize: {
        cohensD,
        interpretation: effectSizeInterpretation,
        detectedEffect: detectedEffectSize,
        minimumDetectable: minimumDetectableEffect,
        status: cohensD >= 0.5 ? 'excellent' : cohensD >= 0.2 ? 'good' : 'warning'
      },
      confidence: {
        level: confidenceLevel,
        interval: confidenceInterval,
        marginOfError,
        status: marginOfError <= 0.02 ? 'excellent' : marginOfError <= 0.05 ? 'good' : 'warning'
      },
      bayesian: {
        probability: bayesianProbability,
        credibleInterval,
        posteriorDistribution: 'Beta distribution',
        status: bayesianProbability >= 0.95 ? 'excellent' : bayesianProbability >= 0.8 ? 'good' : 'warning'
      }
    };
  }, [parameters]);

  // Mock chart data generation
  const chartData = useMemo(() => {
    const generatePowerCurve = () => {
      return Array.from({ length: 20 }, (_, i) => {
        const effect = (i + 1) * 0.01;
        const power = 1 - Math.exp(-2 * Math.pow(effect / 0.05, 2));
        return { effectSize: effect, power: Math.min(0.99, power) };
      });
    };

    const generateSampleSizeCurve = () => {
      return Array.from({ length: 15 }, (_, i) => {
        const power = 0.5 + (i * 0.03);
        const sampleSize = Math.ceil(1000 / Math.pow(power, 1.5));
        return { power, sampleSize };
      });
    };

    const generateEffectDistribution = () => {
      return Array.from({ length: 10 }, (_, i) => {
        const effect = -0.1 + (i * 0.02);
        const density = Math.exp(-0.5 * Math.pow((effect - parameters.effectSize) / 0.02, 2));
        return { effect, density, cumulative: i / 9 };
      });
    };

    return {
      powerCurve: generatePowerCurve(),
      sampleSizeCurve: generateSampleSizeCurve(),
      effectDistribution: generateEffectDistribution()
    };
  }, [parameters]);

  const handleParameterChange = useCallback((key, value) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleExportAnalysis = useCallback(() => {
    const analysisData = {
      timestamp: new Date().toISOString(),
      parameters,
      analysis: statisticalAnalysis,
      recommendations: [
        'Continue test for at least ' + statisticalAnalysis.powerAnalysis.expectedDuration + ' days',
        'Monitor for ' + (statisticalAnalysis.effectSize.interpretation) + ' effect size',
        'Confidence level suggests ' + (statisticalAnalysis.confidence.status === 'excellent' ? 'high' : 'moderate') + ' reliability'
      ]
    };
    
    // Trigger download
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-statistical-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update parent component
    onAnalysisUpdate?.({
      type: 'export',
      analysis: analysisData,
      timestamp: new Date()
    });
  }, [parameters, statisticalAnalysis, onAnalysisUpdate]);

  const tabs = [
    { id: 'powerAnalysis', label: 'Power Analysis', icon: Activity },
    { id: 'effectSize', label: 'Effect Size', icon: Target },
    { id: 'confidence', label: 'Confidence Intervals', icon: CheckCircle },
    { id: 'bayesian', label: 'Bayesian Analysis', icon: Brain }
  ];

  return (
    <StatsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {onClose && (
        <CloseButton onClick={onClose}>
          ✕
        </CloseButton>
      )}

      <Header>
        <h2>
          <Calculator />
          Advanced Statistical Testing
        </h2>
        <p>
          Comprehensive statistical analysis including power analysis, effect size estimation, confidence intervals, and Bayesian inference for your A/B tests.
        </p>
      </Header>

      {/* Parameter Configuration */}
      <StatsCard>
        <CardHeader>
          <h3>
            <Filter />
            Test Parameters
          </h3>
          <ActionButton onClick={handleExportAnalysis}>
            <Download size={16} />
            Export Analysis
          </ActionButton>
        </CardHeader>
        
        <ParameterGrid>
          <ParameterCard>
            <ParameterLabel>Significance Level (α)</ParameterLabel>
            <ParameterSelect
              value={parameters.alpha}
              onChange={(e) => handleParameterChange('alpha', parseFloat(e.target.value))}
            >
              <option value={0.01}>0.01 (99% confidence)</option>
              <option value={0.05}>0.05 (95% confidence)</option>
              <option value={0.1}>0.10 (90% confidence)</option>
            </ParameterSelect>
          </ParameterCard>
          
          <ParameterCard>
            <ParameterLabel>Statistical Power</ParameterLabel>
            <ParameterInput
              type="number"
              min="0.5"
              max="0.99"
              step="0.01"
              value={parameters.power}
              onChange={(e) => handleParameterChange('power', parseFloat(e.target.value))}
            />
          </ParameterCard>
          
          <ParameterCard>
            <ParameterLabel>Expected Effect Size</ParameterLabel>
            <ParameterInput
              type="number"
              min="0.01"
              max="0.5"
              step="0.01"
              value={parameters.effectSize}
              onChange={(e) => handleParameterChange('effectSize', parseFloat(e.target.value))}
            />
          </ParameterCard>
          
          <ParameterCard>
            <ParameterLabel>Base Conversion Rate</ParameterLabel>
            <ParameterInput
              type="number"
              min="0.01"
              max="0.99"
              step="0.01"
              value={parameters.baseConversionRate}
              onChange={(e) => handleParameterChange('baseConversionRate', parseFloat(e.target.value))}
            />
          </ParameterCard>
          
          <ParameterCard>
            <ParameterLabel>Test Type</ParameterLabel>
            <ParameterSelect
              value={parameters.testType}
              onChange={(e) => handleParameterChange('testType', e.target.value)}
            >
              <option value="two-tailed">Two-tailed</option>
              <option value="one-tailed-upper">One-tailed (upper)</option>
              <option value="one-tailed-lower">One-tailed (lower)</option>
            </ParameterSelect>
          </ParameterCard>
          
          <ParameterCard>
            <ParameterLabel>Traffic Allocation</ParameterLabel>
            <ParameterInput
              type="number"
              min="0.1"
              max="0.9"
              step="0.1"
              value={parameters.allocation}
              onChange={(e) => handleParameterChange('allocation', parseFloat(e.target.value))}
            />
          </ParameterCard>
        </ParameterGrid>
      </StatsCard>

      {/* Analysis Tabs */}
      <TabContainer>
        <TabList>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </Tab>
            );
          })}
        </TabList>

        <ContentArea>
          <AnimatePresence mode="wait">
            {activeTab === 'powerAnalysis' && (
              <motion.div
                key="powerAnalysis"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StatsGrid>
                  <StatsCard>
                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <Activity />
                          Required Sample Size
                        </h4>
                        <StatusBadge status={statisticalAnalysis.powerAnalysis.status}>
                          <CheckCircle size={12} />
                          {statisticalAnalysis.powerAnalysis.status}
                        </StatusBadge>
                      </MetricHeader>
                      <MetricValue status={statisticalAnalysis.powerAnalysis.status}>
                        {statisticalAnalysis.powerAnalysis.sampleSize.toLocaleString()}
                      </MetricValue>
                      <MetricDescription>
                        per variant to achieve {(parameters.power * 100).toFixed(0)}% statistical power
                      </MetricDescription>
                    </MetricCard>

                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <TrendingUp />
                          Actual Power
                        </h4>
                      </MetricHeader>
                      <MetricValue status={statisticalAnalysis.powerAnalysis.status}>
                        {(statisticalAnalysis.powerAnalysis.actualPower * 100).toFixed(1)}%
                      </MetricValue>
                      <MetricDescription>
                        probability of detecting the effect if it exists
                      </MetricDescription>
                    </MetricCard>

                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <BarChart3 />
                          Expected Duration
                        </h4>
                      </MetricHeader>
                      <MetricValue>
                        {statisticalAnalysis.powerAnalysis.expectedDuration} days
                      </MetricValue>
                      <MetricDescription>
                        estimated time to reach statistical significance
                      </MetricDescription>
                    </MetricCard>
                  </StatsCard>

                  <StatsCard>
                    <CardHeader>
                      <h3>Power vs Effect Size</h3>
                    </CardHeader>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.powerCurve}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="effectSize" 
                            label={{ value: 'Effect Size', position: 'insideBottom', offset: -5 }}
                            tickFormatter={(value) => (value * 100).toFixed(1) + '%'}
                          />
                          <YAxis 
                            label={{ value: 'Statistical Power', angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => (value * 100).toFixed(0) + '%'}
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              (value * 100).toFixed(1) + '%',
                              name === 'power' ? 'Statistical Power' : name
                            ]}
                            labelFormatter={(value) => `Effect Size: ${(value * 100).toFixed(1)}%`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="power" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </StatsCard>
                </StatsGrid>
              </motion.div>
            )}

            {activeTab === 'effectSize' && (
              <motion.div
                key="effectSize"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StatsGrid>
                  <StatsCard>
                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <Target />
                          Cohen's d
                        </h4>
                        <StatusBadge status={statisticalAnalysis.effectSize.status}>
                          <CheckCircle size={12} />
                          {statisticalAnalysis.effectSize.interpretation}
                        </StatusBadge>
                      </MetricHeader>
                      <MetricValue status={statisticalAnalysis.effectSize.status}>
                        {statisticalAnalysis.effectSize.cohensD.toFixed(3)}
                      </MetricValue>
                      <MetricDescription>
                        standardized effect size measure ({statisticalAnalysis.effectSize.interpretation} effect)
                      </MetricDescription>
                    </MetricCard>

                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <Activity />
                          Detected Effect
                        </h4>
                      </MetricHeader>
                      <MetricValue>
                        {(statisticalAnalysis.effectSize.detectedEffect * 100).toFixed(2)}%
                      </MetricValue>
                      <MetricDescription>
                        actual observed difference between variants
                      </MetricDescription>
                    </MetricCard>

                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <AlertTriangle />
                          Minimum Detectable
                        </h4>
                      </MetricHeader>
                      <MetricValue>
                        {(statisticalAnalysis.effectSize.minimumDetectable * 100).toFixed(2)}%
                      </MetricValue>
                      <MetricDescription>
                        smallest effect that can be reliably detected
                      </MetricDescription>
                    </MetricCard>
                  </StatsCard>

                  <StatsCard>
                    <CardHeader>
                      <h3>Effect Size Distribution</h3>
                    </CardHeader>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.effectDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="effect"
                            label={{ value: 'Effect Size', position: 'insideBottom', offset: -5 }}
                            tickFormatter={(value) => (value * 100).toFixed(1) + '%'}
                          />
                          <YAxis 
                            label={{ value: 'Probability Density', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              value.toFixed(3),
                              name === 'density' ? 'Probability Density' : 'Cumulative Probability'
                            ]}
                            labelFormatter={(value) => `Effect Size: ${(value * 100).toFixed(1)}%`}
                          />
                          <Bar dataKey="density" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </StatsCard>
                </StatsGrid>
              </motion.div>
            )}

            {activeTab === 'confidence' && (
              <motion.div
                key="confidence"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StatsGrid>
                  <StatsCard>
                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <CheckCircle />
                          Confidence Level
                        </h4>
                        <StatusBadge status={statisticalAnalysis.confidence.status}>
                          <CheckCircle size={12} />
                          {(statisticalAnalysis.confidence.level * 100).toFixed(0)}%
                        </StatusBadge>
                      </MetricHeader>
                      <MetricValue status={statisticalAnalysis.confidence.status}>
                        {(statisticalAnalysis.confidence.level * 100).toFixed(1)}%
                      </MetricValue>
                      <MetricDescription>
                        confidence that the true effect lies within the interval
                      </MetricDescription>
                    </MetricCard>

                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <Activity />
                          Margin of Error
                        </h4>
                      </MetricHeader>
                      <MetricValue status={statisticalAnalysis.confidence.status}>
                        ±{(statisticalAnalysis.confidence.marginOfError * 100).toFixed(2)}%
                      </MetricValue>
                      <MetricDescription>
                        maximum expected deviation from the true value
                      </MetricDescription>
                    </MetricCard>

                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <Target />
                          Confidence Interval
                        </h4>
                      </MetricHeader>
                      <MetricValue>
                        [{(statisticalAnalysis.confidence.interval[0] * 100).toFixed(2)}%, {(statisticalAnalysis.confidence.interval[1] * 100).toFixed(2)}%]
                      </MetricValue>
                      <MetricDescription>
                        range of plausible values for the true conversion rate
                      </MetricDescription>
                    </MetricCard>
                  </StatsCard>

                  <StatsCard>
                    <CardHeader>
                      <h3>Confidence Interval Visualization</h3>
                    </CardHeader>
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { x: 0, lower: statisticalAnalysis.confidence.interval[0] * 100, upper: statisticalAnalysis.confidence.interval[1] * 100, point: parameters.baseConversionRate * 100 },
                          { x: 1, lower: statisticalAnalysis.confidence.interval[0] * 100, upper: statisticalAnalysis.confidence.interval[1] * 100, point: parameters.baseConversionRate * 100 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis hide />
                          <YAxis 
                            label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }}
                            domain={['dataMin - 1', 'dataMax + 1']}
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              value.toFixed(2) + '%',
                              name === 'point' ? 'Observed Rate' : 
                              name === 'upper' ? 'Upper Bound' : 'Lower Bound'
                            ]}
                          />
                          <Line type="monotone" dataKey="lower" stroke="#ef4444" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="upper" stroke="#ef4444" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="point" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </StatsCard>
                </StatsGrid>
              </motion.div>
            )}

            {activeTab === 'bayesian' && (
              <motion.div
                key="bayesian"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StatsGrid>
                  <StatsCard>
                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <Brain />
                          Probability of Superiority
                        </h4>
                        <StatusBadge status={statisticalAnalysis.bayesian.status}>
                          <CheckCircle size={12} />
                          {statisticalAnalysis.bayesian.status}
                        </StatusBadge>
                      </MetricHeader>
                      <MetricValue status={statisticalAnalysis.bayesian.status}>
                        {(statisticalAnalysis.bayesian.probability * 100).toFixed(1)}%
                      </MetricValue>
                      <MetricDescription>
                        probability that variant B outperforms variant A
                      </MetricDescription>
                    </MetricCard>

                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <Target />
                          Credible Interval
                        </h4>
                      </MetricHeader>
                      <MetricValue>
                        [{(statisticalAnalysis.bayesian.credibleInterval[0] * 100).toFixed(2)}%, {(statisticalAnalysis.bayesian.credibleInterval[1] * 100).toFixed(2)}%]
                      </MetricValue>
                      <MetricDescription>
                        {(parameters.confidenceLevel * 100).toFixed(0)}% credible interval for the effect size
                      </MetricDescription>
                    </MetricCard>

                    <MetricCard>
                      <MetricHeader>
                        <h4>
                          <Activity />
                          Posterior Distribution
                        </h4>
                      </MetricHeader>
                      <MetricValue>
                        {statisticalAnalysis.bayesian.posteriorDistribution}
                      </MetricValue>
                      <MetricDescription>
                        updated belief about the parameter after observing data
                      </MetricDescription>
                    </MetricCard>
                  </StatsCard>

                  <StatsCard>
                    <CardHeader>
                      <h3>Bayesian Analysis Summary</h3>
                    </CardHeader>
                    <div style={{ padding: '20px' }}>
                      <h4 style={{ marginBottom: '16px', color: '#1f2937' }}>Key Insights:</h4>
                      <ul style={{ color: '#6b7280', lineHeight: '1.8' }}>
                        <li>There's a <strong>{(statisticalAnalysis.bayesian.probability * 100).toFixed(1)}%</strong> chance that variant B is better than variant A</li>
                        <li>The credible interval suggests the true effect lies between <strong>{(statisticalAnalysis.bayesian.credibleInterval[0] * 100).toFixed(2)}%</strong> and <strong>{(statisticalAnalysis.bayesian.credibleInterval[1] * 100).toFixed(2)}%</strong></li>
                        <li>Based on the posterior distribution, we can make probabilistic statements about future performance</li>
                        <li>The Bayesian approach incorporates prior knowledge and provides intuitive probability statements</li>
                      </ul>
                    </div>
                  </StatsCard>
                </StatsGrid>
              </motion.div>
            )}
          </AnimatePresence>
        </ContentArea>
      </TabContainer>
    </StatsContainer>
  );
};

export default ABTestAdvancedStatistics;