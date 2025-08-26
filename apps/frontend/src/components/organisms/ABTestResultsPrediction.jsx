import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, Brain, Target, Clock, AlertCircle, CheckCircle, Eye, Zap, BarChart3, Activity, Gauge, Layers, ArrowRight, Play, Pause, Settings, RefreshCw, Download, Filter, Calendar } from 'lucide-react';

const PredictionContainer = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadows.medium};
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 8px 0 0 0;
  line-height: 1.5;
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 6px;
  background: ${props => props.theme.colors.background.secondary};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: ${props => {
    switch(props.variant) {
      case 'primary': return props.theme.colors.primary.main;
      case 'success': return props.theme.colors.success.main;
      case 'warning': return props.theme.colors.warning.main;
      default: return props.theme.colors.background.secondary;
    }
  }};
  color: ${props => props.variant ? 'white' : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.variant ? 'transparent' : props.theme.colors.border.light};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${props => {
      switch(props.variant) {
        case 'primary': return props.theme.colors.primary.dark;
        case 'success': return props.theme.colors.success.dark;
        case 'warning': return props.theme.colors.warning.dark;
        default: return props.theme.colors.background.hover;
      }
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const MetricCard = styled(motion.div)`
  padding: 20px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
  position: relative;
  overflow: hidden;
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConfidenceIndicator = styled.div`
  padding: 4px 8px;
  background: ${props => {
    if (props.confidence >= 90) return props.theme.colors.success.main + '20';
    if (props.confidence >= 70) return props.theme.colors.warning.main + '20';
    return props.theme.colors.error.main + '20';
  }};
  color: ${props => {
    if (props.confidence >= 90) return props.theme.colors.success.main;
    if (props.confidence >= 70) return props.theme.colors.warning.main;
    return props.theme.colors.error.main;
  }};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.positive ? props.theme.colors.success.main : props.theme.colors.error.main};
`;

const PredictionTimeline = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TimelineTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const ChartCard = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModelInsightsSection = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const InsightCard = styled(motion.div)`
  padding: 16px;
  background: ${props => {
    switch(props.type) {
      case 'success': return props.theme.colors.success.main + '10';
      case 'warning': return props.theme.colors.warning.main + '10';
      case 'info': return props.theme.colors.primary.main + '10';
      default: return props.theme.colors.background.primary;
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.type) {
      case 'success': return props.theme.colors.success.main;
      case 'warning': return props.theme.colors.warning.main;
      case 'info': return props.theme.colors.primary.main;
      default: return props.theme.colors.border.light;
    }
  }};
  border-radius: 8px;
  margin-bottom: 12px;
`;

const InsightTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InsightDescription = styled.p`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const ABTestResultsPrediction = ({ testData, onPredictionUpdate, onClose }) => {
  const [selectedTest, setSelectedTest] = useState(testData?.[0]?.id || '');
  const [predictionHorizon, setPredictionHorizon] = useState('7');
  const [modelType, setModelType] = useState('ensemble');
  const [isRunning, setIsRunning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock prediction data based on test
  const predictionData = useMemo(() => {
    const test = testData?.find(t => t.id === selectedTest) || testData?.[0];
    if (!test) return null;

    return {
      testName: test?.name || 'Sample Test',
      currentProgress: test?.progress || 45,
      predictions: {
        finalConversionA: 12.8,
        finalConversionB: 15.2,
        significanceReach: 7,
        confidenceLevel: 87,
        recommendedAction: 'Continue test - Strong positive signal',
        riskAssessment: 'Low risk, high reward potential'
      },
      timeSeriesPrediction: [
        { day: 0, actualA: 12.1, actualB: 14.3, predictedA: 12.1, predictedB: 14.3, confidence: 95 },
        { day: 1, actualA: 12.3, actualB: 14.5, predictedA: 12.2, predictedB: 14.4, confidence: 93 },
        { day: 2, actualA: 12.2, actualB: 14.8, predictedA: 12.4, predictedB: 14.7, confidence: 91 },
        { day: 3, actualA: null, actualB: null, predictedA: 12.5, predictedB: 14.9, confidence: 89 },
        { day: 4, actualA: null, actualB: null, predictedA: 12.6, predictedB: 15.0, confidence: 87 },
        { day: 5, actualA: null, actualB: null, predictedA: 12.7, predictedB: 15.1, confidence: 85 },
        { day: 6, actualA: null, actualB: null, predictedA: 12.8, predictedB: 15.2, confidence: 83 },
        { day: 7, actualA: null, actualB: null, predictedA: 12.8, predictedB: 15.2, confidence: 81 }
      ],
      scenarioAnalysis: [
        { scenario: 'Optimistic', conversionA: 13.2, conversionB: 15.8, probability: 25 },
        { scenario: 'Expected', conversionA: 12.8, conversionB: 15.2, probability: 50 },
        { scenario: 'Conservative', conversionA: 12.4, conversionB: 14.6, probability: 25 }
      ],
      featureImportance: [
        { feature: 'Time of Day', importance: 0.28 },
        { feature: 'User Segment', importance: 0.24 },
        { feature: 'Historical Performance', importance: 0.21 },
        { feature: 'Traffic Volume', importance: 0.15 },
        { feature: 'Seasonality', importance: 0.12 }
      ]
    };
  }, [selectedTest, testData]);

  const handleRunPrediction = useCallback(async () => {
    setIsRunning(true);
    
    // Simulate AI prediction calculation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setLastUpdated(new Date());
    setIsRunning(false);
    
    if (onPredictionUpdate) {
      onPredictionUpdate({
        testId: selectedTest,
        predictions: predictionData.predictions,
        confidence: predictionData.predictions.confidenceLevel,
        recommendedAction: predictionData.predictions.recommendedAction
      });
    }
  }, [selectedTest, predictionData, onPredictionUpdate]);

  const handleExportResults = useCallback(() => {
    const exportData = {
      testId: selectedTest,
      testName: predictionData.testName,
      predictions: predictionData.predictions,
      timeSeriesData: predictionData.timeSeriesPrediction,
      scenarioAnalysis: predictionData.scenarioAnalysis,
      modelType,
      predictionHorizon,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-prediction-${selectedTest}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedTest, predictionData, modelType, predictionHorizon]);

  const insights = useMemo(() => [
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Strong Positive Signal',
      description: `Variant B shows consistent 18.7% improvement with ${predictionData?.predictions.confidenceLevel}% confidence level.`
    },
    {
      type: 'info',
      icon: Clock,
      title: 'Optimal Test Duration',
      description: `Statistical significance expected in ${predictionData?.predictions.significanceReach} days with current traffic levels.`
    },
    {
      type: 'warning',
      icon: AlertCircle,
      title: 'Sample Size Consideration',
      description: 'Consider increasing sample size by 15% to reduce prediction uncertainty and improve final confidence.'
    },
    {
      type: 'info',
      icon: Brain,
      title: 'Model Recommendation',
      description: `${modelType === 'ensemble' ? 'Ensemble model' : 'Bayesian model'} shows best performance for this test type with 91% accuracy.`
    }
  ], [predictionData, modelType]);

  if (!predictionData) {
    return (
      <PredictionContainer>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertCircle size={48} color="#6B7280" style={{ marginBottom: '16px' }} />
          <h3>No Test Data Available</h3>
          <p>Please select a test to view predictions.</p>
        </div>
      </PredictionContainer>
    );
  }

  return (
    <PredictionContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <div>
          <Title>
            <Brain size={32} />
            AI Test Results Prediction
          </Title>
          <Subtitle>
            Advanced machine learning predictions for A/B test outcomes and optimal decision timing.
          </Subtitle>
        </div>
      </Header>

      <ControlsSection>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
            Select Test
          </label>
          <Select 
            value={selectedTest} 
            onChange={(e) => setSelectedTest(e.target.value)}
          >
            {testData?.map(test => (
              <option key={test.id} value={test.id}>{test.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
            Prediction Horizon
          </label>
          <Select 
            value={predictionHorizon} 
            onChange={(e) => setPredictionHorizon(e.target.value)}
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </Select>
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
            Model Type
          </label>
          <Select 
            value={modelType} 
            onChange={(e) => setModelType(e.target.value)}
          >
            <option value="ensemble">Ensemble Model</option>
            <option value="bayesian">Bayesian Model</option>
            <option value="neural">Neural Network</option>
            <option value="regression">Time Series</option>
          </Select>
        </div>

        <ActionButton 
          variant="primary" 
          onClick={handleRunPrediction}
          disabled={isRunning}
        >
          {isRunning ? <RefreshCw size={16} className="spinning" /> : <Play size={16} />}
          {isRunning ? 'Running Prediction...' : 'Run Prediction'}
        </ActionButton>

        <ActionButton onClick={handleExportResults}>
          <Download size={16} />
          Export Results
        </ActionButton>
      </ControlsSection>

      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <MetricTitle>
              <Target size={16} />
              Predicted Final Conversion A
            </MetricTitle>
            <ConfidenceIndicator confidence={predictionData.predictions.confidenceLevel}>
              {predictionData.predictions.confidenceLevel}% Confidence
            </ConfidenceIndicator>
          </MetricHeader>
          <MetricValue>{predictionData.predictions.finalConversionA}%</MetricValue>
          <MetricChange positive={predictionData.predictions.finalConversionA > 12.0}>
            {predictionData.predictions.finalConversionA > 12.0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {predictionData.predictions.finalConversionA > 12.0 ? '+' : ''}{((predictionData.predictions.finalConversionA - 12.0) / 12.0 * 100).toFixed(1)}%
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>
              <Target size={16} />
              Predicted Final Conversion B
            </MetricTitle>
            <ConfidenceIndicator confidence={predictionData.predictions.confidenceLevel}>
              {predictionData.predictions.confidenceLevel}% Confidence
            </ConfidenceIndicator>
          </MetricHeader>
          <MetricValue>{predictionData.predictions.finalConversionB}%</MetricValue>
          <MetricChange positive={predictionData.predictions.finalConversionB > predictionData.predictions.finalConversionA}>
            <TrendingUp size={16} />
            +{(((predictionData.predictions.finalConversionB - predictionData.predictions.finalConversionA) / predictionData.predictions.finalConversionA) * 100).toFixed(1)}% vs A
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>
              <Clock size={16} />
              Days to Significance
            </MetricTitle>
            <ConfidenceIndicator confidence={85}>
              85% Confidence
            </ConfidenceIndicator>
          </MetricHeader>
          <MetricValue>{predictionData.predictions.significanceReach}</MetricValue>
          <MetricChange positive={predictionData.predictions.significanceReach < 10}>
            <Clock size={16} />
            {predictionData.predictions.significanceReach < 10 ? 'Fast' : 'Standard'} timeline
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>
              <Gauge size={16} />
              Overall Confidence
            </MetricTitle>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </MetricHeader>
          <MetricValue>{predictionData.predictions.confidenceLevel}%</MetricValue>
          <MetricChange positive={predictionData.predictions.confidenceLevel > 80}>
            {predictionData.predictions.confidenceLevel > 80 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {predictionData.predictions.confidenceLevel > 80 ? 'High confidence' : 'Moderate confidence'}
          </MetricChange>
        </MetricCard>
      </MetricsGrid>

      <PredictionTimeline>
        <TimelineHeader>
          <TimelineTitle>
            <Activity size={20} />
            Conversion Rate Prediction Timeline
          </TimelineTitle>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            Next {predictionHorizon} days forecast
          </div>
        </TimelineHeader>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={predictionData.timeSeriesPrediction}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: 'Days from now', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actualA" stroke="#8884d8" strokeWidth={3} name="Actual A" connectNulls={false} />
            <Line type="monotone" dataKey="actualB" stroke="#82ca9d" strokeWidth={3} name="Actual B" connectNulls={false} />
            <Line type="monotone" dataKey="predictedA" stroke="#8884d8" strokeWidth={2} strokeDasharray="5 5" name="Predicted A" />
            <Line type="monotone" dataKey="predictedB" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" name="Predicted B" />
          </LineChart>
        </ResponsiveContainer>
      </PredictionTimeline>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            <Layers size={20} />
            Scenario Analysis
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictionData.scenarioAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversionA" fill="#8884d8" name="Variant A %" />
              <Bar dataKey="conversionB" fill="#82ca9d" name="Variant B %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <BarChart3 size={20} />
            Feature Importance
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictionData.featureImportance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="feature" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="importance" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <ModelInsightsSection>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700' }}>
          AI Model Insights & Recommendations
        </h3>
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            type={insight.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <InsightTitle>
              <insight.icon size={16} />
              {insight.title}
            </InsightTitle>
            <InsightDescription>{insight.description}</InsightDescription>
          </InsightCard>
        ))}
      </ModelInsightsSection>

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PredictionContainer>
  );
};

export default ABTestResultsPrediction;