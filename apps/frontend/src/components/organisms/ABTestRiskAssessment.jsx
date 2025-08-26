import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Shield, AlertTriangle, XCircle, CheckCircle, TrendingDown, TrendingUp, Activity, Target, Users, DollarSign, Clock, Brain, Eye, RefreshCw, Download, Settings, Zap, AlertCircle, Info, PlayCircle, PauseCircle, StopCircle } from 'lucide-react';

const RiskContainer = styled(motion.div)`
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

const RiskOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const RiskCard = styled(motion.div)`
  padding: 20px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border-left: 4px solid ${props => {
    switch(props.level) {
      case 'critical': return props.theme.colors.error.main;
      case 'high': return '#FF6B35';
      case 'medium': return props.theme.colors.warning.main;
      case 'low': return props.theme.colors.success.main;
      default: return props.theme.colors.primary.main;
    }
  }};
  position: relative;
`;

const RiskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const RiskTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RiskLevel = styled.div`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch(props.level) {
      case 'critical': return props.theme.colors.error.main + '20';
      case 'high': return '#FF6B3520';
      case 'medium': return props.theme.colors.warning.main + '20';
      case 'low': return props.theme.colors.success.main + '20';
      default: return props.theme.colors.primary.main + '20';
    }
  }};
  color: ${props => {
    switch(props.level) {
      case 'critical': return props.theme.colors.error.main;
      case 'high': return '#FF6B35';
      case 'medium': return props.theme.colors.warning.main;
      case 'low': return props.theme.colors.success.main;
      default: return props.theme.colors.primary.main;
    }
  }};
`;

const RiskDescription = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const RiskScore = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => {
    if (props.score >= 80) return props.theme.colors.error.main;
    if (props.score >= 60) return '#FF6B35';
    if (props.score >= 40) return props.theme.colors.warning.main;
    return props.theme.colors.success.main;
  }};
  text-align: center;
  margin-bottom: 8px;
`;

const RiskMeter = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const RiskFill = styled.div`
  height: 100%;
  width: ${props => props.score}%;
  background: ${props => {
    if (props.score >= 80) return props.theme.colors.error.main;
    if (props.score >= 60) return '#FF6B35';
    if (props.score >= 40) return props.theme.colors.warning.main;
    return props.theme.colors.success.main;
  }};
  transition: width 0.3s ease;
`;

const MitigationActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: ${props => {
    switch(props.variant) {
      case 'primary': return props.theme.colors.primary.main;
      case 'success': return props.theme.colors.success.main;
      case 'warning': return props.theme.colors.warning.main;
      case 'danger': return props.theme.colors.error.main;
      default: return 'transparent';
    }
  }};
  color: ${props => props.variant ? 'white' : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.variant ? 'transparent' : props.theme.colors.border.light};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const MonitoringSection = styled.div`
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

const AlertsSection = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const AlertCard = styled(motion.div)`
  padding: 16px;
  background: ${props => {
    switch(props.severity) {
      case 'critical': return props.theme.colors.error.main + '10';
      case 'high': return '#FF6B3510';
      case 'medium': return props.theme.colors.warning.main + '10';
      case 'low': return props.theme.colors.success.main + '10';
      default: return props.theme.colors.background.primary;
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.severity) {
      case 'critical': return props.theme.colors.error.main;
      case 'high': return '#FF6B35';
      case 'medium': return props.theme.colors.warning.main;
      case 'low': return props.theme.colors.success.main;
      default: return props.theme.colors.border.light;
    }
  }};
  border-radius: 8px;
  margin-bottom: 12px;
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const AlertTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AlertTime = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const AlertDescription = styled.p`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const ABTestRiskAssessment = ({ testData, onRiskUpdate, onClose }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [autoMitigation, setAutoMitigation] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const riskCategories = useMemo(() => [
    {
      id: 'performance',
      title: 'Performance Risk',
      level: 'medium',
      score: 42,
      description: 'Risk of degraded system performance or user experience during testing.',
      icon: Activity,
      mitigations: ['Reduce traffic allocation', 'Enable circuit breaker', 'Scale resources']
    },
    {
      id: 'statistical',
      title: 'Statistical Validity',
      level: 'low',
      score: 18,
      description: 'Risk of invalid or misleading test results due to statistical issues.',
      icon: Target,
      mitigations: ['Increase sample size', 'Extend test duration', 'Review segmentation']
    },
    {
      id: 'business',
      title: 'Business Impact',
      level: 'high',
      score: 73,
      description: 'Risk of negative impact on revenue, conversions, or customer satisfaction.',
      icon: DollarSign,
      mitigations: ['Set safety thresholds', 'Enable auto-rollback', 'Monitor KPIs closely']
    },
    {
      id: 'technical',
      title: 'Technical Risk',
      level: 'critical',
      score: 85,
      description: 'Risk of system failures, bugs, or security vulnerabilities in test variants.',
      icon: AlertTriangle,
      mitigations: ['Run comprehensive tests', 'Enable monitoring', 'Prepare rollback plan']
    },
    {
      id: 'compliance',
      title: 'Compliance Risk',
      level: 'low',
      score: 12,
      description: 'Risk of violating regulatory requirements or privacy policies.',
      icon: Shield,
      mitigations: ['Review compliance checklist', 'Enable audit logging', 'Legal review']
    },
    {
      id: 'user-experience',
      title: 'User Experience Risk',
      level: 'medium',
      score: 56,
      description: 'Risk of confusing or frustrating users with test variations.',
      icon: Users,
      mitigations: ['User testing', 'Feedback monitoring', 'Gradual rollout']
    }
  ], []);

  const riskTrends = useMemo(() => [
    { time: '00:00', overall: 45, performance: 35, business: 60, technical: 70, ux: 40 },
    { time: '04:00', overall: 42, performance: 32, business: 65, technical: 68, ux: 38 },
    { time: '08:00', overall: 48, performance: 40, business: 70, technical: 72, ux: 45 },
    { time: '12:00', overall: 52, performance: 45, business: 75, technical: 80, ux: 50 },
    { time: '16:00', overall: 49, performance: 42, business: 73, technical: 85, ux: 56 },
    { time: '20:00', overall: 51, performance: 44, business: 71, technical: 82, ux: 52 },
    { time: '24:00', overall: 47, performance: 42, business: 68, technical: 78, ux: 48 }
  ], []);

  const riskDistribution = useMemo(() => [
    { name: 'Low Risk', value: 2, color: '#10B981' },
    { name: 'Medium Risk', value: 2, color: '#F59E0B' },
    { name: 'High Risk', value: 1, color: '#FF6B35' },
    { name: 'Critical Risk', value: 1, color: '#EF4444' }
  ], []);

  const radarData = useMemo(() => [
    { category: 'Performance', score: 42, fullMark: 100 },
    { category: 'Statistical', score: 18, fullMark: 100 },
    { category: 'Business', score: 73, fullMark: 100 },
    { category: 'Technical', score: 85, fullMark: 100 },
    { category: 'Compliance', score: 12, fullMark: 100 },
    { category: 'UX', score: 56, fullMark: 100 }
  ], []);

  const alerts = useMemo(() => [
    {
      id: 1,
      severity: 'critical',
      title: 'High Error Rate Detected',
      description: 'Test variant B showing 3.2% error rate (2.8% above baseline). Immediate attention required.',
      time: '2 minutes ago',
      icon: XCircle,
      testId: 'ab-001'
    },
    {
      id: 2,
      severity: 'high',
      title: 'Revenue Impact Warning',
      description: 'Test showing -12% revenue impact. Consider stopping if trend continues.',
      time: '8 minutes ago',
      icon: TrendingDown,
      testId: 'ab-002'
    },
    {
      id: 3,
      severity: 'medium',
      title: 'Statistical Power Low',
      description: 'Current sample size may be insufficient for reliable results. Extend test duration.',
      time: '15 minutes ago',
      icon: Target,
      testId: 'ab-003'
    },
    {
      id: 4,
      severity: 'low',
      title: 'User Segment Imbalance',
      description: 'Mobile users underrepresented in test. Consider adjusting traffic allocation.',
      time: '23 minutes ago',
      icon: Users,
      testId: 'ab-001'
    }
  ], []);

  const handleMitigation = useCallback((riskId, action) => {
    console.log(`Applying mitigation for ${riskId}:`, action);
    
    // Simulate mitigation action
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      if (onRiskUpdate) {
        onRiskUpdate({
          riskId,
          action,
          timestamp: new Date(),
          status: 'mitigated'
        });
      }
    }, 2000);
  }, [onRiskUpdate]);

  const handleAlertAction = useCallback((alertId, action) => {
    console.log(`Alert ${alertId} action:`, action);
    
    // Handle alert actions (acknowledge, dismiss, escalate)
    if (onRiskUpdate) {
      onRiskUpdate({
        alertId,
        action,
        timestamp: new Date()
      });
    }
  }, [onRiskUpdate]);

  const handleRunAssessment = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate risk assessment
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    
    if (onRiskUpdate) {
      onRiskUpdate({
        action: 'assessment_complete',
        timestamp: new Date(),
        overallRisk: 52
      });
    }
  }, [onRiskUpdate]);

  const handleExportReport = useCallback(() => {
    const reportData = {
      assessment: {
        timestamp: new Date().toISOString(),
        overallRisk: 52,
        categories: riskCategories,
        alerts: alerts.length
      },
      trends: riskTrends.slice(-7),
      distribution: riskDistribution,
      activeAlerts: alerts,
      mitigationRecommendations: riskCategories.filter(r => r.score >= 50).map(r => ({
        category: r.title,
        priority: r.level,
        actions: r.mitigations
      }))
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-assessment-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [riskCategories, riskTrends, riskDistribution, alerts]);

  const getRiskIcon = (level) => {
    switch (level) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return AlertCircle;
      case 'low': return CheckCircle;
      default: return Info;
    }
  };

  const overallRisk = Math.round(riskCategories.reduce((sum, r) => sum + r.score, 0) / riskCategories.length);

  return (
    <RiskContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <div>
          <Title>
            <Shield size={32} />
            A/B Test Risk Assessment
          </Title>
          <Subtitle>
            Comprehensive risk analysis and automated mitigation for A/B testing operations.
          </Subtitle>
        </div>
      </Header>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
        <ActionButton 
          variant="primary" 
          onClick={handleRunAssessment}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? <RefreshCw size={16} className="spinning" /> : <Activity size={16} />}
          {isAnalyzing ? 'Analyzing...' : 'Run Risk Assessment'}
        </ActionButton>
        
        <ActionButton onClick={handleExportReport}>
          <Download size={16} />
          Export Report
        </ActionButton>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Auto-Mitigation:</span>
          <button
            onClick={() => setAutoMitigation(!autoMitigation)}
            style={{
              position: 'relative',
              width: '48px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: autoMitigation ? '#10B981' : '#D1D5DB',
              transition: 'all 0.3s ease'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: autoMitigation ? '26px' : '2px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            />
          </button>
        </div>

        <div style={{ 
          padding: '8px 16px', 
          background: overallRisk >= 80 ? '#EF444410' : overallRisk >= 60 ? '#FF6B3510' : overallRisk >= 40 ? '#F59E0B10' : '#10B98110',
          border: `1px solid ${overallRisk >= 80 ? '#EF4444' : overallRisk >= 60 ? '#FF6B35' : overallRisk >= 40 ? '#F59E0B' : '#10B981'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Overall Risk:</span>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '700',
            color: overallRisk >= 80 ? '#EF4444' : overallRisk >= 60 ? '#FF6B35' : overallRisk >= 40 ? '#F59E0B' : '#10B981'
          }}>
            {overallRisk}%
          </span>
        </div>
      </div>

      <RiskOverview>
        {riskCategories.map((risk, index) => {
          const RiskIcon = risk.icon;
          
          return (
            <RiskCard
              key={risk.id}
              level={risk.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RiskHeader>
                <RiskTitle>
                  <RiskIcon size={20} />
                  {risk.title}
                </RiskTitle>
                <RiskLevel level={risk.level}>{risk.level}</RiskLevel>
              </RiskHeader>
              
              <RiskDescription>{risk.description}</RiskDescription>
              
              <RiskScore score={risk.score}>{risk.score}%</RiskScore>
              <RiskMeter>
                <RiskFill score={risk.score} />
              </RiskMeter>
              
              <MitigationActions>
                {risk.mitigations.slice(0, 2).map((mitigation, idx) => (
                  <ActionButton
                    key={idx}
                    variant={risk.level === 'critical' ? 'danger' : risk.level === 'high' ? 'warning' : 'primary'}
                    onClick={() => handleMitigation(risk.id, mitigation)}
                    disabled={isAnalyzing}
                  >
                    <Zap size={12} />
                    {mitigation}
                  </ActionButton>
                ))}
              </MitigationActions>
            </RiskCard>
          );
        })}
      </RiskOverview>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            <Activity size={20} />
            Risk Trends Over Time
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overall" stroke="#8B5CF6" strokeWidth={3} name="Overall Risk" />
              <Line type="monotone" dataKey="technical" stroke="#EF4444" strokeWidth={2} name="Technical" />
              <Line type="monotone" dataKey="business" stroke="#FF6B35" strokeWidth={2} name="Business" />
              <Line type="monotone" dataKey="performance" stroke="#F59E0B" strokeWidth={2} name="Performance" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <Target size={20} />
            Risk Category Analysis
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Risk Score"
                dataKey="score"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <PieChart size={20} />
            Risk Distribution
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <BarChart size={20} />
            Risk Scores by Category
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <AlertsSection>
        <SectionTitle>
          <AlertTriangle size={20} />
          Active Risk Alerts
        </SectionTitle>
        
        {alerts.map((alert, index) => {
          const AlertIcon = alert.icon;
          
          return (
            <AlertCard
              key={alert.id}
              severity={alert.severity}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AlertHeader>
                <AlertTitle>
                  <AlertIcon size={16} />
                  {alert.title}
                </AlertTitle>
                <AlertTime>{alert.time}</AlertTime>
              </AlertHeader>
              
              <AlertDescription>{alert.description}</AlertDescription>
              
              <MitigationActions>
                <ActionButton
                  variant={alert.severity === 'critical' ? 'danger' : 'primary'}
                  onClick={() => handleAlertAction(alert.id, 'mitigate')}
                >
                  <Zap size={12} />
                  Auto-Fix
                </ActionButton>
                <ActionButton onClick={() => handleAlertAction(alert.id, 'acknowledge')}>
                  <CheckCircle size={12} />
                  Acknowledge
                </ActionButton>
                <ActionButton onClick={() => handleAlertAction(alert.id, 'dismiss')}>
                  <Eye size={12} />
                  View Details
                </ActionButton>
              </MitigationActions>
            </AlertCard>
          );
        })}
      </AlertsSection>

      <MonitoringSection>
        <SectionTitle>
          <Brain size={20} />
          AI Risk Insights & Recommendations
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ 
            padding: '16px', 
            background: '#EF444420', 
            borderLeft: '4px solid #EF4444', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={16} color="#EF4444" />
              Critical: Technical Risk
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4, color: '#374151' }}>
              High error rate detected in variant B. Recommend immediate rollback or traffic reduction to prevent user impact.
            </p>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: '#FF6B3520', 
            borderLeft: '4px solid #FF6B35', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={16} color="#FF6B35" />
              High: Business Impact
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4, color: '#374151' }}>
              Revenue decline trend detected. Consider implementing safety thresholds and automated rollback triggers.
            </p>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: '#10B98120', 
            borderLeft: '4px solid #10B981', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="#10B981" />
              Optimization Opportunity
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4, color: '#374151' }}>
              Statistical risk is low. Consider increasing traffic allocation to winning variant for faster results.
            </p>
          </div>
        </div>
      </MonitoringSection>

      <div style={{ textAlign: 'center', padding: '20px', fontSize: '14px', color: '#6B7280' }}>
        Last assessment: {new Date().toLocaleString()}
        <br />
        Next automated assessment: {new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}
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
    </RiskContainer>
  );
};

export default ABTestRiskAssessment;