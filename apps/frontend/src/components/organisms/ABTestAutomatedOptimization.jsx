import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Zap, Settings, TrendingUp, TrendingDown, Brain, Target, Clock, AlertCircle, CheckCircle, PlayCircle, PauseCircle, StopCircle, RotateCcw, Activity, Gauge, Layers, ArrowRight, Play, Pause, RefreshCw, Download, Filter, Calendar, Cpu, Users, DollarSign, BarChart3, Eye, ToggleLeft } from 'lucide-react';

const OptimizationContainer = styled(motion.div)`
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

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const SwitchLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const Switch = styled.button`
  position: relative;
  width: 48px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? props.theme.colors.success.main : props.theme.colors.gray[300]};

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
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

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => {
    switch(props.status) {
      case 'active': return props.theme.colors.success.main + '20';
      case 'paused': return props.theme.colors.warning.main + '20';
      case 'stopped': return props.theme.colors.error.main + '20';
      default: return props.theme.colors.gray[100];
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'active': return props.theme.colors.success.main;
      case 'paused': return props.theme.colors.warning.main;
      case 'stopped': return props.theme.colors.error.main;
      default: return props.theme.colors.gray[600];
    }
  }};
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

const OptimizationRules = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const RuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const RuleTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RuleCard = styled(motion.div)`
  padding: 16px;
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.active ? props.theme.colors.success.main : props.theme.colors.border.light};
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    transform: translateY(-2px);
  }
`;

const RuleContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RuleInfo = styled.div`
  flex: 1;
`;

const RuleName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 4px 0;
`;

const RuleDescription = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const RuleStats = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const RuleStat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
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

const ActivityLog = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  max-height: 400px;
  overflow-y: auto;
`;

const LogEntry = styled(motion.div)`
  padding: 12px;
  background: ${props => props.theme.colors.background.primary};
  border-left: 4px solid ${props => {
    switch(props.type) {
      case 'optimization': return props.theme.colors.success.main;
      case 'warning': return props.theme.colors.warning.main;
      case 'error': return props.theme.colors.error.main;
      default: return props.theme.colors.primary.main;
    }
  }};
  border-radius: 8px;
  margin-bottom: 8px;
`;

const LogTime = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const LogMessage = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const ABTestAutomatedOptimization = ({ testData, onOptimizationUpdate, onClose }) => {
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState('performance');
  const [optimizationStatus, setOptimizationStatus] = useState('active');
  const [activeRules, setActiveRules] = useState(['traffic-allocation', 'significance-threshold', 'cost-efficiency']);
  const [lastOptimization, setLastOptimization] = useState(new Date());

  const optimizationStrategies = [
    { value: 'performance', label: 'Performance Optimization' },
    { value: 'cost', label: 'Cost Optimization' },
    { value: 'speed', label: 'Speed Optimization' },
    { value: 'balanced', label: 'Balanced Approach' }
  ];

  const optimizationRules = useMemo(() => [
    {
      id: 'traffic-allocation',
      name: 'Dynamic Traffic Allocation',
      description: 'Automatically adjusts traffic distribution based on performance',
      triggers: 12,
      improvements: '+18.3%',
      lastTriggered: '2 hours ago',
      active: activeRules.includes('traffic-allocation')
    },
    {
      id: 'significance-threshold',
      name: 'Early Significance Detection',
      description: 'Stops underperforming tests early when significance is reached',
      triggers: 8,
      improvements: '+24.7%',
      lastTriggered: '4 hours ago',
      active: activeRules.includes('significance-threshold')
    },
    {
      id: 'cost-efficiency',
      name: 'Cost Efficiency Monitoring',
      description: 'Optimizes test duration to minimize costs while maintaining accuracy',
      triggers: 15,
      improvements: '+31.2%',
      lastTriggered: '1 hour ago',
      active: activeRules.includes('cost-efficiency')
    },
    {
      id: 'segment-optimization',
      name: 'Segment-Based Optimization',
      description: 'Applies different strategies for different user segments',
      triggers: 6,
      improvements: '+22.1%',
      lastTriggered: '6 hours ago',
      active: activeRules.includes('segment-optimization')
    },
    {
      id: 'seasonal-adjustment',
      name: 'Seasonal Pattern Adjustment',
      description: 'Adapts test parameters based on seasonal trends',
      triggers: 4,
      improvements: '+15.8%',
      lastTriggered: '8 hours ago',
      active: activeRules.includes('seasonal-adjustment')
    },
    {
      id: 'anomaly-detection',
      name: 'Anomaly Detection & Response',
      description: 'Detects and responds to unusual patterns in test data',
      triggers: 9,
      improvements: '+27.4%',
      lastTriggered: '3 hours ago',
      active: activeRules.includes('anomaly-detection')
    }
  ], [activeRules]);

  const optimizationMetrics = useMemo(() => ({
    totalOptimizations: 47,
    avgImprovement: 23.8,
    costSavings: 34.2,
    timeReduction: 28.6,
    successRate: 91.3,
    activeTests: testData?.filter(t => t.status === 'running').length || 3
  }), [testData]);

  const performanceData = useMemo(() => [
    { time: '00:00', manual: 12.3, optimized: 12.3, savings: 0 },
    { time: '04:00', manual: 12.8, optimized: 13.2, savings: 120 },
    { time: '08:00', manual: 13.1, optimized: 14.1, savings: 340 },
    { time: '12:00', manual: 12.9, optimized: 14.8, savings: 520 },
    { time: '16:00', manual: 13.4, optimized: 15.3, savings: 680 },
    { time: '20:00', manual: 13.2, optimized: 15.7, savings: 840 },
    { time: '24:00', manual: 13.0, optimized: 16.1, savings: 1200 }
  ], []);

  const activityLog = useMemo(() => [
    {
      id: 1,
      time: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
      type: 'optimization',
      message: 'Traffic allocation optimized for Test AB-001: Increased variant B traffic to 65%'
    },
    {
      id: 2,
      time: new Date(Date.now() - 1000 * 60 * 32).toLocaleTimeString(),
      type: 'info',
      message: 'Early significance detected for Test AB-003: 97% confidence reached'
    },
    {
      id: 3,
      time: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString(),
      type: 'optimization',
      message: 'Cost efficiency rule triggered: Reduced sample size by 12% while maintaining accuracy'
    },
    {
      id: 4,
      time: new Date(Date.now() - 1000 * 60 * 67).toLocaleTimeString(),
      type: 'warning',
      message: 'Anomaly detected in Test AB-002: Unusual traffic pattern, monitoring closely'
    },
    {
      id: 5,
      time: new Date(Date.now() - 1000 * 60 * 89).toLocaleTimeString(),
      type: 'optimization',
      message: 'Segment optimization applied: Different strategies for mobile vs desktop users'
    }
  ], []);

  const handleToggleOptimization = useCallback(() => {
    setAutoOptimizationEnabled(!autoOptimizationEnabled);
    setOptimizationStatus(autoOptimizationEnabled ? 'paused' : 'active');
    
    if (onOptimizationUpdate) {
      onOptimizationUpdate({
        enabled: !autoOptimizationEnabled,
        status: autoOptimizationEnabled ? 'paused' : 'active',
        strategy: selectedStrategy
      });
    }
  }, [autoOptimizationEnabled, selectedStrategy, onOptimizationUpdate]);

  const handleRuleToggle = useCallback((ruleId) => {
    setActiveRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  }, []);

  const handleStrategyChange = useCallback((strategy) => {
    setSelectedStrategy(strategy);
    setLastOptimization(new Date());
    
    if (onOptimizationUpdate) {
      onOptimizationUpdate({
        enabled: autoOptimizationEnabled,
        status: optimizationStatus,
        strategy: strategy
      });
    }
  }, [autoOptimizationEnabled, optimizationStatus, onOptimizationUpdate]);

  const handleManualOptimization = useCallback(async () => {
    setOptimizationStatus('running');
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setOptimizationStatus('active');
    setLastOptimization(new Date());
    
    // Add new log entry
    const newLogEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: 'optimization',
      message: `Manual optimization completed: Applied ${selectedStrategy} strategy to all active tests`
    };
    
    if (onOptimizationUpdate) {
      onOptimizationUpdate({
        enabled: autoOptimizationEnabled,
        status: 'active',
        strategy: selectedStrategy,
        lastRun: new Date(),
        logEntry: newLogEntry
      });
    }
  }, [selectedStrategy, autoOptimizationEnabled, onOptimizationUpdate]);

  return (
    <OptimizationContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <div>
          <Title>
            <Zap size={32} />
            Automated Test Optimization
          </Title>
          <Subtitle>
            AI-powered real-time optimization that automatically improves A/B test performance and reduces costs.
          </Subtitle>
        </div>
        <StatusBadge status={optimizationStatus}>
          {optimizationStatus === 'active' && <PlayCircle size={16} />}
          {optimizationStatus === 'paused' && <PauseCircle size={16} />}
          {optimizationStatus === 'running' && <RefreshCw size={16} className="spinning" />}
          {optimizationStatus === 'stopped' && <StopCircle size={16} />}
          {optimizationStatus === 'active' ? 'Active' : 
           optimizationStatus === 'paused' ? 'Paused' :
           optimizationStatus === 'running' ? 'Running' : 'Stopped'}
        </StatusBadge>
      </Header>

      <ControlsSection>
        <ToggleSwitch>
          <SwitchLabel>Auto Optimization</SwitchLabel>
          <Switch 
            active={autoOptimizationEnabled}
            onClick={handleToggleOptimization}
          />
        </ToggleSwitch>

        <div>
          <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
            Optimization Strategy
          </label>
          <Select 
            value={selectedStrategy} 
            onChange={(e) => handleStrategyChange(e.target.value)}
          >
            {optimizationStrategies.map(strategy => (
              <option key={strategy.value} value={strategy.value}>
                {strategy.label}
              </option>
            ))}
          </Select>
        </div>

        <button
          onClick={handleManualOptimization}
          disabled={optimizationStatus === 'running'}
          style={{
            padding: '8px 16px',
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: optimizationStatus === 'running' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: optimizationStatus === 'running' ? 0.6 : 1
          }}
        >
          {optimizationStatus === 'running' ? <RefreshCw size={16} className="spinning" /> : <Play size={16} />}
          {optimizationStatus === 'running' ? 'Optimizing...' : 'Run Manual Optimization'}
        </button>
      </ControlsSection>

      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <MetricTitle>
              <Zap size={16} />
              Total Optimizations
            </MetricTitle>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              This month
            </div>
          </MetricHeader>
          <MetricValue>{optimizationMetrics.totalOptimizations}</MetricValue>
          <MetricChange positive={true}>
            <TrendingUp size={16} />
            +23% vs last month
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>
              <TrendingUp size={16} />
              Avg Performance Gain
            </MetricTitle>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Per optimization
            </div>
          </MetricHeader>
          <MetricValue>{optimizationMetrics.avgImprovement}%</MetricValue>
          <MetricChange positive={true}>
            <TrendingUp size={16} />
            +3.2% improvement
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>
              <DollarSign size={16} />
              Cost Savings
            </MetricTitle>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              This month
            </div>
          </MetricHeader>
          <MetricValue>{optimizationMetrics.costSavings}%</MetricValue>
          <MetricChange positive={true}>
            <DollarSign size={16} />
            $2,840 saved
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricHeader>
            <MetricTitle>
              <Clock size={16} />
              Time Reduction
            </MetricTitle>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Test duration
            </div>
          </MetricHeader>
          <MetricValue>{optimizationMetrics.timeReduction}%</MetricValue>
          <MetricChange positive={true}>
            <Clock size={16} />
            4.2 days faster
          </MetricChange>
        </MetricCard>
      </MetricsGrid>

      <OptimizationRules>
        <RuleHeader>
          <RuleTitle>
            <Settings size={20} />
            Optimization Rules
          </RuleTitle>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            {activeRules.length} of {optimizationRules.length} rules active
          </div>
        </RuleHeader>

        {optimizationRules.map((rule, index) => (
          <RuleCard
            key={rule.id}
            active={rule.active}
            onClick={() => handleRuleToggle(rule.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <RuleContent>
              <RuleInfo>
                <RuleName>{rule.name}</RuleName>
                <RuleDescription>{rule.description}</RuleDescription>
              </RuleInfo>
              <RuleStats>
                <RuleStat>
                  <StatValue>{rule.triggers}</StatValue>
                  <StatLabel>Triggers</StatLabel>
                </RuleStat>
                <RuleStat>
                  <StatValue>{rule.improvements}</StatValue>
                  <StatLabel>Improvement</StatLabel>
                </RuleStat>
                <RuleStat>
                  <StatValue style={{ fontSize: '12px' }}>{rule.lastTriggered}</StatValue>
                  <StatLabel>Last Used</StatLabel>
                </RuleStat>
                <ToggleLeft 
                  size={20} 
                  color={rule.active ? '#10B981' : '#6B7280'} 
                />
              </RuleStats>
            </RuleContent>
          </RuleCard>
        ))}
      </OptimizationRules>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            <BarChart3 size={20} />
            Performance Comparison
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="manual" stroke="#8884d8" strokeWidth={2} name="Manual Testing" />
              <Line type="monotone" dataKey="optimized" stroke="#82ca9d" strokeWidth={3} name="Auto-Optimized" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <DollarSign size={20} />
            Cumulative Cost Savings
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="savings" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <ActivityLog>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} />
          Optimization Activity Log
        </h3>
        {activityLog.map((entry, index) => (
          <LogEntry
            key={entry.id}
            type={entry.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LogTime>{entry.time}</LogTime>
            <LogMessage>{entry.message}</LogMessage>
          </LogEntry>
        ))}
      </ActivityLog>

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </OptimizationContainer>
  );
};

export default ABTestAutomatedOptimization;