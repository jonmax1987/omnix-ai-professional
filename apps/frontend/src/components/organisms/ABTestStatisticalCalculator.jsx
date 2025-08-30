import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useMemo, useEffect } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import Progress from '../atoms/Progress';
import MetricCard from '../molecules/MetricCard';
import { useI18n } from '../../hooks/useI18n';

const CalculatorContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const CalculatorHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.purple[25]} 0%, 
    ${props => props.theme.colors.purple[50]} 100%);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
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
    ${props => props.theme.colors.purple[500]} 0%, 
    ${props => props.theme.colors.purple[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
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

const CalculatorSection = styled(motion.div)`
  margin-bottom: ${props => props.theme.spacing[8]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[5]};
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const InputCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[200]};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const InputRow = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InputLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const InputHelp = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing[1]};
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ResultCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  background: ${props => {
    switch (props.status) {
      case 'significant':
        return `linear-gradient(135deg, ${props.theme.colors.green[25]} 0%, ${props.theme.colors.green[50]} 100%)`;
      case 'approaching':
        return `linear-gradient(135deg, ${props.theme.colors.yellow[25]} 0%, ${props.theme.colors.yellow[50]} 100%)`;
      case 'insufficient':
        return `linear-gradient(135deg, ${props.theme.colors.red[25]} 0%, ${props.theme.colors.red[50]} 100%)`;
      default:
        return `linear-gradient(135deg, ${props.theme.colors.blue[25]} 0%, ${props.theme.colors.blue[50]} 100%)`;
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'significant':
        return props.theme.colors.green[200];
      case 'approaching':
        return props.theme.colors.yellow[200];
      case 'insufficient':
        return props.theme.colors.red[200];
      default:
        return props.theme.colors.blue[200];
    }
  }};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  text-align: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.status) {
        case 'significant':
          return props.theme.colors.green[500];
        case 'approaching':
          return props.theme.colors.yellow[500];
        case 'insufficient':
          return props.theme.colors.red[500];
        default:
          return props.theme.colors.blue[500];
      }
    }};
    border-radius: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]} 0 0;
  }
`;

const ResultValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  font-size: ${props => props.theme.typography.fontSize.xl2};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => {
    switch (props.status) {
      case 'significant':
        return props.theme.colors.green[600];
      case 'approaching':
        return props.theme.colors.yellow[600];
      case 'insufficient':
        return props.theme.colors.red[600];
      default:
        return props.theme.colors.blue[600];
    }
  }};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const ResultLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const ResultBadge = styled(Badge).withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  ${props => {
    switch (props.status) {
      case 'significant':
        return css`
          background-color: ${props.theme.colors.green[100]};
          color: ${props.theme.colors.green[700]};
        `;
      case 'approaching':
        return css`
          background-color: ${props.theme.colors.yellow[100]};
          color: ${props.theme.colors.yellow[700]};
        `;
      case 'insufficient':
        return css`
          background-color: ${props.theme.colors.red[100]};
          color: ${props.theme.colors.red[700]};
        `;
      default:
        return css`
          background-color: ${props.theme.colors.blue[100]};
          color: ${props.theme.colors.blue[700]};
        `;
    }
  }}
`;

const FormulaCard = styled(motion.div)`
  background: ${props => props.theme.colors.gray[50]};
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
`;

const FormulaTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[3]};
  font-family: ${props => props.theme?.typography?.fontFamily?.sans?.join(', ') || props.theme?.typography?.fontFamily?.base || 'Inter, system-ui, sans-serif'};
`;

const FormulaText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  white-space: pre-wrap;
`;

const RecommendationCard = styled(motion.div)`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.blue[25]} 0%, 
    ${props => props.theme.colors.blue[50]} 100%);
  border: 1px solid ${props => props.theme.colors.blue[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
`;

const RecommendationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecommendationItem = styled.li`
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

const RecommendationIcon = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.theme.colors.blue[500]};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
`;

// Statistical calculation functions
const calculateZScore = (p1, p2, n1, n2) => {
  const pooledP = (p1 * n1 + p2 * n2) / (n1 + n2);
  const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  return (p1 - p2) / standardError;
};

const calculatePValue = (zScore) => {
  // Two-tailed p-value calculation (simplified)
  const absZ = Math.abs(zScore);
  if (absZ > 6) return 0.000001;
  
  // Approximation using complementary error function
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989423 * Math.exp(-absZ * absZ / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return 2 * p; // Two-tailed
};

const calculateConfidenceInterval = (p1, p2, n1, n2, confidenceLevel = 0.95) => {
  const z = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645;
  const diff = p1 - p2;
  const standardError = Math.sqrt((p1 * (1 - p1) / n1) + (p2 * (1 - p2) / n2));
  const margin = z * standardError;
  return {
    lower: diff - margin,
    upper: diff + margin,
    margin: margin
  };
};

const calculateSampleSizeForPower = (p1, p2, power = 0.8, alpha = 0.05) => {
  const zAlpha = alpha === 0.05 ? 1.96 : alpha === 0.01 ? 2.576 : 1.645;
  const zBeta = power === 0.8 ? 0.84 : power === 0.9 ? 1.28 : 0.67;
  const pooledP = (p1 + p2) / 2;
  const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * pooledP * (1 - pooledP);
  const denominator = Math.pow(p1 - p2, 2);
  return Math.ceil(numerator / denominator);
};

const ABTestStatisticalCalculator = ({
  testData,
  onCalculationUpdate,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Input states
  const [inputs, setInputs] = useState({
    // Variant A
    visitorsA: testData?.participants?.variantA || 1000,
    conversionsA: testData?.conversions?.variantA?.count || 123,
    
    // Variant B  
    visitorsB: testData?.participants?.variantB || 1000,
    conversionsB: testData?.conversions?.variantB?.count || 147,
    
    // Configuration
    confidenceLevel: 95,
    testDuration: 14,
    dailyVisitors: 500,
    
    // Sample size calculator
    baselineRate: 10,
    minimumDetectableEffect: 20,
    statisticalPower: 80,
    significance: 95
  });

  // Update inputs when testData changes
  useEffect(() => {
    if (testData) {
      setInputs(prev => ({
        ...prev,
        visitorsA: testData.participants?.variantA || prev.visitorsA,
        conversionsA: testData.conversions?.variantA?.count || prev.conversionsA,
        visitorsB: testData.participants?.variantB || prev.visitorsB,
        conversionsB: testData.conversions?.variantB?.count || prev.conversionsB
      }));
    }
  }, [testData]);

  const updateInput = useCallback((field, value) => {
    setInputs(prev => {
      const updated = { ...prev, [field]: parseFloat(value) || 0 };
      return updated;
    });
  }, []);

  // Calculate all statistical metrics
  const calculations = useMemo(() => {
    const { visitorsA, conversionsA, visitorsB, conversionsB, confidenceLevel } = inputs;
    
    if (visitorsA <= 0 || visitorsB <= 0) {
      return {
        conversionRateA: 0,
        conversionRateB: 0,
        improvement: 0,
        zScore: 0,
        pValue: 1,
        confidenceInterval: { lower: 0, upper: 0, margin: 0 },
        isSignificant: false,
        status: 'insufficient',
        sampleSizeRecommendation: 1000,
        powerAnalysis: 0,
        effectSize: 0
      };
    }
    
    const pA = conversionsA / visitorsA;
    const pB = conversionsB / visitorsB;
    const improvement = ((pB - pA) / pA) * 100;
    
    const zScore = calculateZScore(pB, pA, visitorsB, visitorsA);
    const pValue = calculatePValue(zScore);
    const confidenceInterval = calculateConfidenceInterval(pB, pA, visitorsB, visitorsA, confidenceLevel / 100);
    
    const alpha = (100 - confidenceLevel) / 100;
    const isSignificant = pValue < alpha;
    
    const status = isSignificant ? 'significant' : 
                   pValue < alpha * 2 ? 'approaching' : 'insufficient';
    
    const effectSize = (pB - pA) / Math.sqrt((pA * (1 - pA) + pB * (1 - pB)) / 2);
    const sampleSizeRecommendation = calculateSampleSizeForPower(pA, pB);
    
    // Power analysis (simplified)
    const actualSampleSize = Math.min(visitorsA, visitorsB);
    const powerAnalysis = actualSampleSize >= sampleSizeRecommendation ? 0.8 : 
                         actualSampleSize >= sampleSizeRecommendation * 0.7 ? 0.6 : 0.4;
    
    return {
      conversionRateA: pA * 100,
      conversionRateB: pB * 100,
      improvement,
      zScore,
      pValue,
      confidenceInterval,
      isSignificant,
      status,
      sampleSizeRecommendation,
      powerAnalysis: powerAnalysis * 100,
      effectSize
    };
  }, [inputs]);

  // Sample size calculator
  const sampleSizeCalculations = useMemo(() => {
    const { baselineRate, minimumDetectableEffect, statisticalPower, significance } = inputs;
    
    const p1 = baselineRate / 100;
    const effectSize = minimumDetectableEffect / 100;
    const p2 = p1 * (1 + effectSize);
    const power = statisticalPower / 100;
    const alpha = (100 - significance) / 100;
    
    const requiredSampleSize = calculateSampleSizeForPower(p1, p2, power, alpha);
    const totalSampleSize = requiredSampleSize * 2;
    
    const dailyTraffic = inputs.dailyVisitors || 500;
    const testDurationDays = Math.ceil(totalSampleSize / dailyTraffic);
    
    return {
      sampleSizePerVariant: requiredSampleSize,
      totalSampleSize,
      estimatedDuration: testDurationDays,
      dailyTrafficNeeded: Math.ceil(totalSampleSize / (inputs.testDuration || 14)),
      power: power * 100,
      detectionThreshold: (p2 - p1) * 100
    };
  }, [inputs]);

  // Get recommendations based on current status
  const recommendations = useMemo(() => {
    const { status, pValue, powerAnalysis } = calculations;
    const recs = [];
    
    if (status === 'significant') {
      recs.push('✅ Test has reached statistical significance');
      recs.push('📊 Consider stopping the test and implementing the winning variant');
      recs.push('📝 Document the results and learnings for future tests');
    } else if (status === 'approaching') {
      recs.push('⏳ Test is approaching significance - continue running');
      recs.push('📈 Monitor daily for significance threshold');
      recs.push('🎯 Consider extending test duration if needed');
    } else {
      recs.push('⚠️ Test lacks statistical significance');
      recs.push('📊 Increase sample size or extend test duration');
      recs.push('🔍 Consider increasing the effect size or improving variants');
    }
    
    if (powerAnalysis < 70) {
      recs.push('⚡ Statistical power is low - increase sample size');
    }
    
    if (pValue > 0.1) {
      recs.push('📉 P-value is high - results may not be reliable');
    }
    
    return recs;
  }, [calculations]);

  // Tabs configuration
  const tabs = [
    { id: 'calculator', label: 'Significance Calculator', icon: 'calculator' },
    { id: 'sample-size', label: 'Sample Size Calculator', icon: 'users' },
    { id: 'formulas', label: 'Statistical Formulas', icon: 'book-open' }
  ];

  const renderCalculatorTab = () => (
    <motion.div
      key="calculator"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Input Section */}
      <CalculatorSection>
        <SectionHeader>
          <SectionTitle>
            <Icon name="edit" size={24} />
            <Typography variant="h5" weight="semibold">Test Data Input</Typography>
          </SectionTitle>
        </SectionHeader>

        <InputGrid>
          <InputCard whileHover={{ scale: 1.01 }}>
            <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px', color: '#3b82f6' }}>
              Variant A (Control)
            </Typography>
            <InputRow>
              <InputLabel>Visitors</InputLabel>
              <Input
                type="number"
                min="1"
                value={inputs.visitorsA}
                onChange={(e) => updateInput('visitorsA', e.target.value)}
                placeholder="e.g., 1000"
              />
              <InputHelp>Total number of visitors exposed to variant A</InputHelp>
            </InputRow>
            <InputRow>
              <InputLabel>Conversions</InputLabel>
              <Input
                type="number"
                min="0"
                max={inputs.visitorsA}
                value={inputs.conversionsA}
                onChange={(e) => updateInput('conversionsA', e.target.value)}
                placeholder="e.g., 123"
              />
              <InputHelp>Number of conversions from variant A</InputHelp>
            </InputRow>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <Typography variant="body1" weight="bold" color="primary">
                {calculations.conversionRateA.toFixed(2)}%
              </Typography>
              <Typography variant="caption" color="secondary">
                Conversion Rate
              </Typography>
            </div>
          </InputCard>

          <InputCard whileHover={{ scale: 1.01 }}>
            <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px', color: '#10b981' }}>
              Variant B (Treatment)
            </Typography>
            <InputRow>
              <InputLabel>Visitors</InputLabel>
              <Input
                type="number"
                min="1"
                value={inputs.visitorsB}
                onChange={(e) => updateInput('visitorsB', e.target.value)}
                placeholder="e.g., 1000"
              />
              <InputHelp>Total number of visitors exposed to variant B</InputHelp>
            </InputRow>
            <InputRow>
              <InputLabel>Conversions</InputLabel>
              <Input
                type="number"
                min="0"
                max={inputs.visitorsB}
                value={inputs.conversionsB}
                onChange={(e) => updateInput('conversionsB', e.target.value)}
                placeholder="e.g., 147"
              />
              <InputHelp>Number of conversions from variant B</InputHelp>
            </InputRow>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
              <Typography variant="body1" weight="bold" color="success">
                {calculations.conversionRateB.toFixed(2)}%
              </Typography>
              <Typography variant="caption" color="secondary">
                Conversion Rate
              </Typography>
            </div>
          </InputCard>

          <InputCard whileHover={{ scale: 1.01 }}>
            <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
              Configuration
            </Typography>
            <InputRow>
              <InputLabel>Confidence Level (%)</InputLabel>
              <Input
                type="number"
                min="90"
                max="99.9"
                step="0.1"
                value={inputs.confidenceLevel}
                onChange={(e) => updateInput('confidenceLevel', e.target.value)}
              />
              <InputHelp>Statistical confidence level (95% is standard)</InputHelp>
            </InputRow>
            <InputRow>
              <InputLabel>Test Duration (days)</InputLabel>
              <Input
                type="number"
                min="1"
                max="365"
                value={inputs.testDuration}
                onChange={(e) => updateInput('testDuration', e.target.value)}
              />
              <InputHelp>How long has the test been running?</InputHelp>
            </InputRow>
          </InputCard>
        </InputGrid>
      </CalculatorSection>

      {/* Results Section */}
      <CalculatorSection>
        <SectionHeader>
          <SectionTitle>
            <Icon name="bar-chart" size={24} />
            <Typography variant="h5" weight="semibold">Statistical Analysis Results</Typography>
          </SectionTitle>
        </SectionHeader>

        <ResultsGrid>
          <ResultCard 
            status={calculations.status}
            whileHover={{ scale: 1.02 }}
            animate={calculations.isSignificant ? { 
              boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 10px rgba(34, 197, 94, 0)'],
            } : {}}
            transition={{ duration: 2, repeat: calculations.isSignificant ? Infinity : 0 }}
          >
            <ResultValue status={calculations.status}>
              {Math.abs(calculations.improvement).toFixed(1)}%
            </ResultValue>
            <ResultLabel>Improvement Rate</ResultLabel>
            <ResultBadge status={calculations.status} size="sm">
              {calculations.improvement >= 0 ? '+' : ''}{calculations.improvement.toFixed(1)}%
            </ResultBadge>
          </ResultCard>

          <ResultCard status={calculations.pValue < 0.05 ? 'significant' : 'insufficient'} whileHover={{ scale: 1.02 }}>
            <ResultValue status={calculations.pValue < 0.05 ? 'significant' : 'insufficient'}>
              {calculations.pValue.toFixed(4)}
            </ResultValue>
            <ResultLabel>P-Value</ResultLabel>
            <ResultBadge status={calculations.pValue < 0.05 ? 'significant' : 'insufficient'} size="sm">
              {calculations.pValue < 0.05 ? 'Significant' : 'Not Significant'}
            </ResultBadge>
          </ResultCard>

          <ResultCard status="info" whileHover={{ scale: 1.02 }}>
            <ResultValue status="info">
              {calculations.zScore.toFixed(2)}
            </ResultValue>
            <ResultLabel>Z-Score</ResultLabel>
            <ResultBadge status="info" size="sm">
              {Math.abs(calculations.zScore) > 1.96 ? 'Strong' : 'Weak'}
            </ResultBadge>
          </ResultCard>

          <ResultCard status="info" whileHover={{ scale: 1.02 }}>
            <ResultValue status="info">
              {inputs.confidenceLevel}%
            </ResultValue>
            <ResultLabel>Confidence Level</ResultLabel>
            <ResultBadge status="info" size="sm">
              ±{(calculations.confidenceInterval.margin * 100).toFixed(1)}%
            </ResultBadge>
          </ResultCard>

          <ResultCard status={calculations.powerAnalysis >= 80 ? 'significant' : 'approaching'} whileHover={{ scale: 1.02 }}>
            <ResultValue status={calculations.powerAnalysis >= 80 ? 'significant' : 'approaching'}>
              {calculations.powerAnalysis.toFixed(0)}%
            </ResultValue>
            <ResultLabel>Statistical Power</ResultLabel>
            <ResultBadge status={calculations.powerAnalysis >= 80 ? 'significant' : 'approaching'} size="sm">
              {calculations.powerAnalysis >= 80 ? 'Good' : 'Low'}
            </ResultBadge>
          </ResultCard>

          <ResultCard status="info" whileHover={{ scale: 1.02 }}>
            <ResultValue status="info">
              {calculations.effectSize.toFixed(2)}
            </ResultValue>
            <ResultLabel>Effect Size (Cohen's d)</ResultLabel>
            <ResultBadge status="info" size="sm">
              {Math.abs(calculations.effectSize) > 0.8 ? 'Large' : 
               Math.abs(calculations.effectSize) > 0.5 ? 'Medium' : 'Small'}
            </ResultBadge>
          </ResultCard>
        </ResultsGrid>
      </CalculatorSection>

      {/* Recommendations */}
      <RecommendationCard whileHover={{ scale: 1.01 }}>
        <RecommendationHeader>
          <Icon name="lightbulb" size={20} />
          <Typography variant="h6" weight="semibold">
            Recommendations
          </Typography>
        </RecommendationHeader>
        <RecommendationList>
          {recommendations.map((rec, index) => (
            <RecommendationItem key={index}>
              <RecommendationIcon>{index + 1}</RecommendationIcon>
              <span>{rec}</span>
            </RecommendationItem>
          ))}
        </RecommendationList>
      </RecommendationCard>
    </motion.div>
  );

  const renderSampleSizeTab = () => (
    <motion.div
      key="sample-size"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CalculatorSection>
        <SectionHeader>
          <SectionTitle>
            <Icon name="users" size={24} />
            <Typography variant="h5" weight="semibold">Sample Size Calculator</Typography>
          </SectionTitle>
        </SectionHeader>

        <InputGrid>
          <InputCard whileHover={{ scale: 1.01 }}>
            <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
              Test Parameters
            </Typography>
            <InputRow>
              <InputLabel>Baseline Conversion Rate (%)</InputLabel>
              <Input
                type="number"
                min="0.1"
                max="50"
                step="0.1"
                value={inputs.baselineRate}
                onChange={(e) => updateInput('baselineRate', e.target.value)}
              />
              <InputHelp>Current conversion rate before testing</InputHelp>
            </InputRow>
            <InputRow>
              <InputLabel>Minimum Detectable Effect (%)</InputLabel>
              <Input
                type="number"
                min="1"
                max="100"
                value={inputs.minimumDetectableEffect}
                onChange={(e) => updateInput('minimumDetectableEffect', e.target.value)}
              />
              <InputHelp>Minimum improvement you want to detect</InputHelp>
            </InputRow>
          </InputCard>

          <InputCard whileHover={{ scale: 1.01 }}>
            <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
              Statistical Requirements
            </Typography>
            <InputRow>
              <InputLabel>Statistical Power (%)</InputLabel>
              <Input
                type="number"
                min="70"
                max="95"
                value={inputs.statisticalPower}
                onChange={(e) => updateInput('statisticalPower', e.target.value)}
              />
              <InputHelp>Probability of detecting an effect (80% is standard)</InputHelp>
            </InputRow>
            <InputRow>
              <InputLabel>Significance Level (%)</InputLabel>
              <Input
                type="number"
                min="90"
                max="99.9"
                step="0.1"
                value={inputs.significance}
                onChange={(e) => updateInput('significance', e.target.value)}
              />
              <InputHelp>Statistical significance threshold</InputHelp>
            </InputRow>
          </InputCard>

          <InputCard whileHover={{ scale: 1.01 }}>
            <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
              Traffic Information
            </Typography>
            <InputRow>
              <InputLabel>Daily Visitors</InputLabel>
              <Input
                type="number"
                min="10"
                max="100000"
                value={inputs.dailyVisitors}
                onChange={(e) => updateInput('dailyVisitors', e.target.value)}
              />
              <InputHelp>Average daily visitors to your test</InputHelp>
            </InputRow>
            <InputRow>
              <InputLabel>Desired Test Duration (days)</InputLabel>
              <Input
                type="number"
                min="7"
                max="365"
                value={inputs.testDuration}
                onChange={(e) => updateInput('testDuration', e.target.value)}
              />
              <InputHelp>How long do you want to run the test?</InputHelp>
            </InputRow>
          </InputCard>
        </InputGrid>
      </CalculatorSection>

      <CalculatorSection>
        <SectionHeader>
          <SectionTitle>
            <Icon name="calculator" size={24} />
            <Typography variant="h5" weight="semibold">Sample Size Calculation Results</Typography>
          </SectionTitle>
        </SectionHeader>

        <ResultsGrid>
          <ResultCard status="significant" whileHover={{ scale: 1.02 }}>
            <ResultValue status="significant">
              {sampleSizeCalculations.sampleSizePerVariant.toLocaleString()}
            </ResultValue>
            <ResultLabel>Sample Size Per Variant</ResultLabel>
            <ResultBadge status="significant" size="sm">
              Required
            </ResultBadge>
          </ResultCard>

          <ResultCard status="info" whileHover={{ scale: 1.02 }}>
            <ResultValue status="info">
              {sampleSizeCalculations.totalSampleSize.toLocaleString()}
            </ResultValue>
            <ResultLabel>Total Sample Size</ResultLabel>
            <ResultBadge status="info" size="sm">
              Both Variants
            </ResultBadge>
          </ResultCard>

          <ResultCard status="approaching" whileHover={{ scale: 1.02 }}>
            <ResultValue status="approaching">
              {sampleSizeCalculations.estimatedDuration}
            </ResultValue>
            <ResultLabel>Estimated Duration (days)</ResultLabel>
            <ResultBadge status="approaching" size="sm">
              At Current Traffic
            </ResultBadge>
          </ResultCard>

          <ResultCard status="info" whileHover={{ scale: 1.02 }}>
            <ResultValue status="info">
              {sampleSizeCalculations.dailyTrafficNeeded.toLocaleString()}
            </ResultValue>
            <ResultLabel>Daily Traffic Needed</ResultLabel>
            <ResultBadge status="info" size="sm">
              For Desired Duration
            </ResultBadge>
          </ResultCard>
        </ResultsGrid>
      </CalculatorSection>
    </motion.div>
  );

  const renderFormulasTab = () => (
    <motion.div
      key="formulas"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CalculatorSection>
        <SectionHeader>
          <SectionTitle>
            <Icon name="book-open" size={24} />
            <Typography variant="h5" weight="semibold">Statistical Formulas</Typography>
          </SectionTitle>
        </SectionHeader>

        <FormulaCard whileHover={{ scale: 1.01 }}>
          <FormulaTitle>Z-Score Calculation</FormulaTitle>
          <FormulaText>{`z = (p1 - p2) / SE

Where:
- p1, p2 = conversion rates for variants A and B
- SE = standard error = √(p̂(1-p̂)(1/n1 + 1/n2))
- p̂ = pooled proportion = (x1 + x2) / (n1 + n2)
- n1, n2 = sample sizes for variants A and B`}</FormulaText>
        </FormulaCard>

        <FormulaCard whileHover={{ scale: 1.01 }}>
          <FormulaTitle>P-Value Calculation</FormulaTitle>
          <FormulaText>{`P(Z ≥ |z|) for two-tailed test

Where:
- Z follows standard normal distribution
- For |z| > 1.96, p < 0.05 (95% confidence)
- For |z| > 2.576, p < 0.01 (99% confidence)`}</FormulaText>
        </FormulaCard>

        <FormulaCard whileHover={{ scale: 1.01 }}>
          <FormulaTitle>Sample Size Calculation</FormulaTitle>
          <FormulaText>{`n = (z_α + z_β)² × 2p̂(1-p̂) / (p1-p2)²

Where:
- z_α = critical value for significance level α
- z_β = critical value for power (1-β)
- p̂ = average of p1 and p2
- p1, p2 = expected conversion rates`}</FormulaText>
        </FormulaCard>

        <FormulaCard whileHover={{ scale: 1.01 }}>
          <FormulaTitle>Confidence Interval</FormulaTitle>
          <FormulaText>{`CI = (p1 - p2) ± z_α/2 × SE

Where:
- SE = √((p1(1-p1)/n1) + (p2(1-p2)/n2))
- z_α/2 = critical value for confidence level
- For 95% confidence: z = 1.96
- For 99% confidence: z = 2.576`}</FormulaText>
        </FormulaCard>

        <FormulaCard whileHover={{ scale: 1.01 }}>
          <FormulaTitle>Effect Size (Cohen's d)</FormulaTitle>
          <FormulaText>{`d = (p1 - p2) / √((p1(1-p1) + p2(1-p2)) / 2)

Interpretation:
- Small effect: d = 0.2
- Medium effect: d = 0.5  
- Large effect: d = 0.8`}</FormulaText>
        </FormulaCard>
      </CalculatorSection>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calculator':
        return renderCalculatorTab();
      case 'sample-size':
        return renderSampleSizeTab();
      case 'formulas':
        return renderFormulasTab();
      default:
        return null;
    }
  };

  // Notify parent of calculation updates
  useEffect(() => {
    onCalculationUpdate?.(calculations);
  }, [calculations, onCalculationUpdate]);

  return (
    <CalculatorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <CalculatorHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="calculator" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                Statistical Significance Calculator
              </Typography>
              <Typography variant="body2" color="secondary">
                Advanced statistical analysis and sample size calculations for A/B tests
              </Typography>
            </div>
          </HeaderLeft>
          <div>
            <Badge 
              variant={calculations.isSignificant ? 'success' : 'warning'} 
              size="sm"
            >
              {calculations.isSignificant ? 'Significant' : 'Not Significant'}
            </Badge>
          </div>
        </HeaderContent>
      </CalculatorHeader>

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
    </CalculatorContainer>
  );
};

export default ABTestStatisticalCalculator;