import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ComposedChart } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Brain, Target, Clock, AlertCircle, CheckCircle, Cpu, Gauge, Award, Activity, Zap, DollarSign, Percent, Users, Eye, Play, Pause, RefreshCw, Download, Filter, Calendar, Settings, Layers } from 'lucide-react';

const BenchmarkingContainer = styled(motion.div)`
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

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const ModelCard = styled(motion.div)`
  padding: 20px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border: 2px solid ${props => {
    if (props.winner) return props.theme.colors.success.main;
    if (props.selected) return props.theme.colors.primary.main;
    return props.theme.colors.border.light;
  }};
  position: relative;
  overflow: hidden;
`;

const ModelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModelName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModelBadge = styled.div`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch(props.type) {
      case 'winner': return props.theme.colors.success.main;
      case 'runner-up': return props.theme.colors.warning.main;
      case 'baseline': return props.theme.colors.gray[500];
      default: return props.theme.colors.primary.main;
    }
  }};
  color: white;
`;

const ModelMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const Metric = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props => {
    if (props.value >= 90) return props.theme.colors.success.main;
    if (props.value >= 70) return props.theme.colors.warning.main;
    return props.theme.colors.error.main;
  }};
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  font-weight: 600;
`;

const PerformanceBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
`;

const PerformanceFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.value >= 90) return props.theme.colors.success.main;
    if (props.value >= 70) return props.theme.colors.warning.main;
    return props.theme.colors.error.main;
  }};
  width: ${props => props.value}%;
  transition: width 0.3s ease;
`;

const ComparisonSection = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 20px 0;
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

const BenchmarkTable = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  border-bottom: 2px solid ${props => props.theme.colors.border.light};
  font-size: 14px;
  text-transform: uppercase;
`;

const TableRow = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  color: ${props => props.theme.colors.text.primary};
`;

const ScoreCell = styled(TableCell)`
  font-weight: 700;
  color: ${props => {
    if (props.score >= 90) return props.theme.colors.success.main;
    if (props.score >= 70) return props.theme.colors.warning.main;
    return props.theme.colors.error.main;
  }};
`;

const ABTestModelBenchmarking = ({ models, onModelSelect, testData, onClose }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const [selectedModels, setSelectedModels] = useState(['claude-sonnet', 'claude-haiku', 'gpt-4-turbo']);
  const [lastBenchmark, setLastBenchmark] = useState(new Date());

  const modelData = useMemo(() => [
    {
      id: 'claude-sonnet',
      name: 'Claude 3.5 Sonnet',
      type: 'Large Language Model',
      badge: 'winner',
      metrics: {
        accuracy: 94.2,
        speed: 85.7,
        cost: 78.3,
        reliability: 96.8
      },
      performance: {
        avgResponseTime: 1.2,
        tokensPerSecond: 145,
        costPerRequest: 0.0024,
        errorRate: 0.032
      },
      testResults: {
        totalTests: 47,
        wins: 32,
        losses: 15,
        winRate: 68.1
      }
    },
    {
      id: 'claude-haiku',
      name: 'Claude 3 Haiku',
      type: 'Fast Language Model',
      badge: 'runner-up',
      metrics: {
        accuracy: 89.4,
        speed: 96.2,
        cost: 92.1,
        reliability: 94.3
      },
      performance: {
        avgResponseTime: 0.6,
        tokensPerSecond: 285,
        costPerRequest: 0.0008,
        errorRate: 0.057
      },
      testResults: {
        totalTests: 41,
        wins: 24,
        losses: 17,
        winRate: 58.5
      }
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      type: 'Large Language Model',
      badge: 'baseline',
      metrics: {
        accuracy: 91.8,
        speed: 73.6,
        cost: 65.4,
        reliability: 88.9
      },
      performance: {
        avgResponseTime: 2.1,
        tokensPerSecond: 98,
        costPerRequest: 0.0042,
        errorRate: 0.111
      },
      testResults: {
        totalTests: 38,
        wins: 19,
        losses: 19,
        winRate: 50.0
      }
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      type: 'Language Model',
      badge: null,
      metrics: {
        accuracy: 86.3,
        speed: 88.4,
        cost: 95.7,
        reliability: 92.1
      },
      performance: {
        avgResponseTime: 0.9,
        tokensPerSecond: 195,
        costPerRequest: 0.0006,
        errorRate: 0.079
      },
      testResults: {
        totalTests: 35,
        wins: 15,
        losses: 20,
        winRate: 42.9
      }
    }
  ], []);

  const performanceOverTime = useMemo(() => [
    { date: '2025-01-01', sonnet: 93.2, haiku: 88.1, gpt4: 90.5, gpt35: 85.3 },
    { date: '2025-01-08', sonnet: 93.8, haiku: 89.0, gpt4: 91.2, gpt35: 86.1 },
    { date: '2025-01-15', sonnet: 94.1, haiku: 89.4, gpt4: 91.8, gpt35: 86.3 },
    { date: '2025-01-22', sonnet: 94.2, haiku: 89.2, gpt4: 91.6, gpt35: 86.0 },
    { date: '2025-01-29', sonnet: 94.0, haiku: 89.6, gpt4: 91.9, gpt35: 86.5 },
    { date: '2025-02-05', sonnet: 94.3, haiku: 89.8, gpt4: 92.1, gpt35: 86.8 },
    { date: '2025-02-12', sonnet: 94.2, haiku: 89.4, gpt4: 91.8, gpt35: 86.3 }
  ], []);

  const benchmarkScenarios = useMemo(() => [
    {
      scenario: 'Product Recommendations',
      sonnet: 95.2,
      haiku: 91.3,
      gpt4: 89.7,
      gpt35: 84.1
    },
    {
      scenario: 'Content Personalization',
      sonnet: 93.8,
      haiku: 88.9,
      gpt4: 92.4,
      gpt35: 87.2
    },
    {
      scenario: 'Demand Forecasting',
      sonnet: 94.7,
      haiku: 87.6,
      gpt4: 93.1,
      gpt35: 85.8
    },
    {
      scenario: 'Price Optimization',
      sonnet: 92.4,
      haiku: 89.8,
      gpt4: 90.3,
      gpt35: 86.9
    },
    {
      scenario: 'Customer Segmentation',
      sonnet: 96.1,
      haiku: 92.4,
      gpt4: 88.7,
      gpt35: 83.5
    }
  ], []);

  const handleRunBenchmark = useCallback(async () => {
    setBenchmarkRunning(true);
    
    // Simulate benchmark running
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setBenchmarkRunning(false);
    setLastBenchmark(new Date());
  }, []);

  const handleModelToggle = useCallback((modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  }, []);

  const handleExportResults = useCallback(() => {
    const exportData = {
      benchmark: {
        timestamp: new Date().toISOString(),
        timeframe: selectedTimeframe,
        metric: selectedMetric,
        models: modelData.filter(m => selectedModels.includes(m.id))
      },
      results: benchmarkScenarios,
      performance: performanceOverTime.slice(-7),
      summary: {
        winner: modelData.find(m => m.badge === 'winner'),
        totalTests: modelData.reduce((sum, m) => sum + m.testResults.totalTests, 0)
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-benchmark-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedTimeframe, selectedMetric, selectedModels, modelData, benchmarkScenarios, performanceOverTime]);

  return (
    <BenchmarkingContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <div>
          <Title>
            <BarChart3 size={32} />
            AI Model Performance Benchmarking
          </Title>
          <Subtitle>
            Comprehensive performance analysis and comparison of AI models across different A/B testing scenarios.
          </Subtitle>
        </div>
      </Header>

      <ControlsSection>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
            Timeframe
          </label>
          <Select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </Select>
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
            Primary Metric
          </label>
          <Select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="accuracy">Accuracy</option>
            <option value="speed">Speed</option>
            <option value="cost">Cost Efficiency</option>
            <option value="reliability">Reliability</option>
          </Select>
        </div>

        <ActionButton 
          variant="primary" 
          onClick={handleRunBenchmark}
          disabled={benchmarkRunning}
        >
          {benchmarkRunning ? <RefreshCw size={16} className="spinning" /> : <Play size={16} />}
          {benchmarkRunning ? 'Running Benchmark...' : 'Run New Benchmark'}
        </ActionButton>

        <ActionButton onClick={handleExportResults}>
          <Download size={16} />
          Export Results
        </ActionButton>
      </ControlsSection>

      <ModelGrid>
        {modelData.map((model, index) => (
          <ModelCard
            key={model.id}
            winner={model.badge === 'winner'}
            selected={selectedModels.includes(model.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleModelToggle(model.id)}
          >
            <ModelHeader>
              <ModelName>
                <Cpu size={18} />
                {model.name}
              </ModelName>
              {model.badge && (
                <ModelBadge type={model.badge}>
                  {model.badge === 'winner' && <Award size={12} style={{ marginRight: '4px' }} />}
                  {model.badge.charAt(0).toUpperCase() + model.badge.slice(1).replace('-', ' ')}
                </ModelBadge>
              )}
            </ModelHeader>

            <ModelMetrics>
              <Metric>
                <MetricValue value={model.metrics.accuracy}>{model.metrics.accuracy}%</MetricValue>
                <MetricLabel>Accuracy</MetricLabel>
              </Metric>
              <Metric>
                <MetricValue value={model.metrics.speed}>{model.metrics.speed}%</MetricValue>
                <MetricLabel>Speed</MetricLabel>
              </Metric>
              <Metric>
                <MetricValue value={model.metrics.cost}>{model.metrics.cost}%</MetricValue>
                <MetricLabel>Cost Eff.</MetricLabel>
              </Metric>
              <Metric>
                <MetricValue value={model.metrics.reliability}>{model.metrics.reliability}%</MetricValue>
                <MetricLabel>Reliability</MetricLabel>
              </Metric>
            </ModelMetrics>

            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                Overall Score: {Math.round((model.metrics.accuracy + model.metrics.speed + model.metrics.cost + model.metrics.reliability) / 4)}%
              </div>
              <PerformanceBar>
                <PerformanceFill value={Math.round((model.metrics.accuracy + model.metrics.speed + model.metrics.cost + model.metrics.reliability) / 4)} />
              </PerformanceBar>
            </div>
          </ModelCard>
        ))}
      </ModelGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            <TrendingUp size={20} />
            Performance Over Time
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[80, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sonnet" stroke="#8B5CF6" strokeWidth={3} name="Claude Sonnet" />
              <Line type="monotone" dataKey="haiku" stroke="#10B981" strokeWidth={2} name="Claude Haiku" />
              <Line type="monotone" dataKey="gpt4" stroke="#F59E0B" strokeWidth={2} name="GPT-4 Turbo" />
              <Line type="monotone" dataKey="gpt35" stroke="#EF4444" strokeWidth={2} name="GPT-3.5 Turbo" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <Target size={20} />
            Scenario Performance Comparison
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={benchmarkScenarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sonnet" fill="#8B5CF6" name="Claude Sonnet" />
              <Bar dataKey="haiku" fill="#10B981" name="Claude Haiku" />
              <Bar dataKey="gpt4" fill="#F59E0B" name="GPT-4 Turbo" />
              <Bar dataKey="gpt35" fill="#EF4444" name="GPT-3.5 Turbo" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <BenchmarkTable>
        <SectionTitle>
          <Gauge size={20} />
          Detailed Performance Metrics
        </SectionTitle>
        <Table>
          <thead>
            <tr>
              <TableHeader>Model</TableHeader>
              <TableHeader>Accuracy</TableHeader>
              <TableHeader>Speed Score</TableHeader>
              <TableHeader>Avg Response Time</TableHeader>
              <TableHeader>Cost per Request</TableHeader>
              <TableHeader>Error Rate</TableHeader>
              <TableHeader>Win Rate</TableHeader>
              <TableHeader>Overall Score</TableHeader>
            </tr>
          </thead>
          <tbody>
            {modelData.map(model => (
              <TableRow key={model.id}>
                <TableCell>
                  <strong>{model.name}</strong>
                  <br />
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>{model.type}</span>
                </TableCell>
                <ScoreCell score={model.metrics.accuracy}>{model.metrics.accuracy}%</ScoreCell>
                <ScoreCell score={model.metrics.speed}>{model.metrics.speed}%</ScoreCell>
                <TableCell>{model.performance.avgResponseTime}s</TableCell>
                <TableCell>${model.performance.costPerRequest}</TableCell>
                <TableCell>{model.performance.errorRate}%</TableCell>
                <ScoreCell score={model.testResults.winRate}>{model.testResults.winRate}%</ScoreCell>
                <ScoreCell score={Math.round((model.metrics.accuracy + model.metrics.speed + model.metrics.cost + model.metrics.reliability) / 4)}>
                  {Math.round((model.metrics.accuracy + model.metrics.speed + model.metrics.cost + model.metrics.reliability) / 4)}%
                </ScoreCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </BenchmarkTable>

      <ComparisonSection>
        <SectionTitle>
          <Brain size={20} />
          Key Insights & Recommendations
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ 
            padding: '16px', 
            background: '#10B98120', 
            borderLeft: '4px solid #10B981', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="#10B981" />
              Best Overall: Claude 3.5 Sonnet
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4, color: '#374151' }}>
              Leads in accuracy (94.2%) and reliability (96.8%). Best choice for complex A/B testing scenarios where precision is critical.
            </p>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: '#F59E0B20', 
            borderLeft: '4px solid #F59E0B', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#F59E0B" />
              Fastest: Claude 3 Haiku
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4, color: '#374151' }}>
              Highest speed score (96.2%) with 0.6s response time. Ideal for real-time applications and high-volume testing.
            </p>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: '#8B5CF620', 
            borderLeft: '4px solid #8B5CF6', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={16} color="#8B5CF6" />
              Most Cost-Effective: GPT-3.5 Turbo
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4, color: '#374151' }}>
              Lowest cost per request ($0.0006) with decent performance. Good for budget-conscious testing scenarios.
            </p>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: '#EF444420', 
            borderLeft: '4px solid #EF4444', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#EF4444" />
              Recommendation
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4, color: '#374151' }}>
              Use Claude Sonnet for critical tests, Haiku for speed-sensitive scenarios, and consider hybrid approaches for optimal cost-performance balance.
            </p>
          </div>
        </div>
      </ComparisonSection>

      <div style={{ textAlign: 'center', padding: '20px', fontSize: '14px', color: '#6B7280' }}>
        Last benchmark: {lastBenchmark.toLocaleString()}
        <br />
        Next automated benchmark: {new Date(lastBenchmark.getTime() + 24 * 60 * 60 * 1000).toLocaleString()}
      </div>

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </BenchmarkingContainer>
  );
};

export default ABTestModelBenchmarking;