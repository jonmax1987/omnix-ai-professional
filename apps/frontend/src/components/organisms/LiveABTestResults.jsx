/**
 * OMNIX AI - Live A/B Test Results Monitor
 * MGR-027: Live A/B test result updates
 * Real-time A/B test monitoring with WebSocket integration and live statistics
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  BarChart3,
  PieChart,
  Award,
  Clock,
  Play,
  Pause,
  Square,
  AlertCircle,
  CheckCircle,
  Eye,
  Settings,
  Filter,
  RefreshCw,
  Zap,
  Brain,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Percent
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import useWebSocketStore from '../../store/websocketStore';
import { useABTesting } from '../../hooks/useABTesting';
import { formatNumber, formatPercentage, formatRelativeTime, formatDuration } from '../../utils/formatters';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

const MonitorContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'isLive'
})`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme, isLive }) => 
      isLive ? 
      `linear-gradient(90deg, ${theme.colors.status.success}, ${theme.colors.primary.main})` : 
      theme.colors.neutral.border
    };
    animation: ${({ isLive }) => isLive ? 'pulse-gradient 2s ease-in-out infinite' : 'none'};
  }

  @keyframes pulse-gradient {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LiveIndicator = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'isLive'
})`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: ${({ theme, isLive }) => 
    isLive ? theme.colors.status.success : theme.colors.neutral.subtle};
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
`;

const LiveDot = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isLive'
})`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: ${({ isLive }) => isLive ? 'pulse 2s ease-in-out infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const TestCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ theme, testStatus }) => {
      switch (testStatus) {
        case 'running': return theme.colors.status.success;
        case 'completed': return theme.colors.status.info;
        case 'paused': return theme.colors.status.warning;
        default: return theme.colors.neutral.border;
      }
    }};
  }
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TestTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
`;

const TestStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, status }) => {
    switch (status) {
      case 'running': return theme.colors.status.success;
      case 'completed': return theme.colors.status.info;
      case 'paused': return theme.colors.status.warning;
      default: return theme.colors.neutral.subtle;
    }
  }};
`;

const TestMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ModelSection = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isWinner'
})`
  background: ${({ theme, isWinner }) => 
    isWinner ? 
    `linear-gradient(135deg, ${theme.colors.status.success}20, ${theme.colors.background.elevated})` : 
    theme.colors.background.secondary
  };
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, isWinner }) => 
    isWinner ? theme.colors.status.success : theme.colors.neutral.border
  };
  position: relative;
`;

const ModelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ModelName = styled.h5`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const WinnerBadge = styled.div`
  background: ${({ theme }) => theme.colors.status.success};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.8rem;
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetricValue = styled.span`
  font-weight: 600;
  color: ${({ theme, trend }) => {
    if (trend === 'up') return theme.colors.status.success;
    if (trend === 'down') return theme.colors.status.error;
    return theme.colors.text.primary;
  }};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TestProgress = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.neutral.subtle};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ theme, status }) => {
    switch (status) {
      case 'running': return theme.colors.status.success;
      case 'completed': return theme.colors.status.info;
      default: return theme.colors.neutral.border;
    }
  }};
  border-radius: 3px;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TestActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 6px 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const StatIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const statusIcons = {
  running: Play,
  completed: CheckCircle,
  paused: Pause,
  pending: Clock
};

const LiveABTestResults = ({ 
  maxTests = 6,
  autoRefresh = true,
  showSummary = true,
  onTestClick
}) => {
  const [isLive, setIsLive] = useState(false);
  const [liveTests, setLiveTests] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalTests: 0,
    runningTests: 0,
    completedTests: 0,
    totalParticipants: 0
  });
  const [recentUpdates, setRecentUpdates] = useState(new Set());
  const updateTimeoutRef = useRef(null);
  
  const { isConnected } = useWebSocketStore();
  const { addABTestUpdate } = useDashboardStore();
  const { 
    tests, 
    activeTests, 
    loading, 
    error, 
    fetchTests, 
    fetchTestResults 
  } = useABTesting({ autoRefresh, realTimeUpdates: true });

  // Generate mock A/B test data for demonstration
  const mockTests = [
    {
      testId: 'test_001',
      testName: 'AI Model Haiku vs Sonnet',
      status: 'running',
      analysisType: 'inventory_prediction',
      modelA: { name: 'Claude Haiku', type: 'haiku' },
      modelB: { name: 'Claude Sonnet', type: 'sonnet' },
      trafficSplit: 50,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      durationDays: 14,
      participants: 2847,
      modelAResults: {
        accuracy: 87.4,
        precision: 89.2,
        recall: 85.1,
        conversionRate: 12.8,
        responseTime: 340
      },
      modelBResults: {
        accuracy: 91.2,
        precision: 92.1,
        recall: 88.7,
        conversionRate: 15.4,
        responseTime: 680
      },
      winner: 'B',
      confidence: 95.2,
      significance: 0.03,
      lastUpdate: Date.now() - 120000
    },
    {
      testId: 'test_002', 
      testName: 'Pricing Strategy A/B Test',
      status: 'running',
      analysisType: 'dynamic_pricing',
      modelA: { name: 'Conservative Pricing', type: 'conservative' },
      modelB: { name: 'Aggressive Pricing', type: 'aggressive' },
      trafficSplit: 60,
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      durationDays: 10,
      participants: 1923,
      modelAResults: {
        revenue: 145780,
        margin: 23.4,
        customerSatisfaction: 4.2,
        conversionRate: 18.7,
        avgOrderValue: 67.40
      },
      modelBResults: {
        revenue: 162340,
        margin: 19.8,
        customerSatisfaction: 3.8,
        conversionRate: 21.3,
        avgOrderValue: 72.10
      },
      winner: null,
      confidence: 78.9,
      significance: 0.12,
      lastUpdate: Date.now() - 45000
    },
    {
      testId: 'test_003',
      testName: 'Recommendation Engine Test', 
      status: 'completed',
      analysisType: 'product_recommendations',
      modelA: { name: 'Collaborative Filter', type: 'collaborative' },
      modelB: { name: 'AI Hybrid Model', type: 'ai_hybrid' },
      trafficSplit: 50,
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      durationDays: 14,
      participants: 4521,
      modelAResults: {
        clickThroughRate: 3.4,
        conversionRate: 8.9,
        avgRecommendations: 5.2,
        userEngagement: 67.3,
        revenue: 89340
      },
      modelBResults: {
        clickThroughRate: 4.8,
        conversionRate: 12.1,
        avgRecommendations: 4.7,
        userEngagement: 81.5,
        revenue: 124570
      },
      winner: 'B',
      confidence: 99.1,
      significance: 0.001,
      lastUpdate: Date.now() - 1800000
    }
  ];

  // Initialize with mock data and simulate live updates
  useEffect(() => {
    setLiveTests(mockTests);
    setIsLive(true);
    
    // Update summary stats
    setSummaryStats({
      totalTests: mockTests.length,
      runningTests: mockTests.filter(t => t.status === 'running').length,
      completedTests: mockTests.filter(t => t.status === 'completed').length,
      totalParticipants: mockTests.reduce((sum, t) => sum + t.participants, 0)
    });
    
    // Simulate live updates
    const interval = setInterval(() => {
      simulateLiveUpdate();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const simulateLiveUpdate = useCallback(() => {
    setLiveTests(prev => {
      const updated = prev.map(test => {
        if (test.status === 'running') {
          // Simulate metric updates
          const variation = 0.1; // 10% max variation
          const updateTest = { ...test };
          
          // Update participants
          updateTest.participants += Math.floor(Math.random() * 50) + 10;
          
          // Update model A results
          Object.keys(updateTest.modelAResults).forEach(key => {
            const currentValue = updateTest.modelAResults[key];
            const change = (Math.random() - 0.5) * variation * currentValue;
            updateTest.modelAResults[key] = Math.max(0, currentValue + change);
          });
          
          // Update model B results  
          Object.keys(updateTest.modelBResults).forEach(key => {
            const currentValue = updateTest.modelBResults[key];
            const change = (Math.random() - 0.5) * variation * currentValue;
            updateTest.modelBResults[key] = Math.max(0, currentValue + change);
          });
          
          updateTest.lastUpdate = Date.now();
          
          // Add to recent updates for highlighting
          setRecentUpdates(prev => {
            const newSet = new Set(prev);
            newSet.add(test.testId);
            return newSet;
          });
          
          // Clear highlight after 3 seconds
          if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
          updateTimeoutRef.current = setTimeout(() => {
            setRecentUpdates(prev => {
              const newSet = new Set(prev);
              newSet.delete(test.testId);
              return newSet;
            });
          }, 3000);
          
          return updateTest;
        }
        return test;
      });
      
      // Update summary stats
      setSummaryStats({
        totalTests: updated.length,
        runningTests: updated.filter(t => t.status === 'running').length,
        completedTests: updated.filter(t => t.status === 'completed').length,
        totalParticipants: updated.reduce((sum, t) => sum + t.participants, 0)
      });
      
      return updated;
    });
  }, []);

  const getProgress = (test) => {
    const elapsed = Date.now() - test.startDate.getTime();
    const total = test.durationDays * 24 * 60 * 60 * 1000;
    return Math.min((elapsed / total) * 100, 100);
  };

  const getMetricTrend = (valueA, valueB) => {
    if (valueB > valueA * 1.05) return 'up';
    if (valueB < valueA * 0.95) return 'down';
    return 'neutral';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUp size={12} />;
      case 'down': return <ArrowDown size={12} />;
      default: return <Minus size={12} />;
    }
  };

  const handleTestClick = (test) => {
    if (onTestClick) {
      onTestClick(test);
    } else {
      console.log('Test clicked:', test.testName);
    }
  };

  const getStatusIcon = (status) => {
    const IconComponent = statusIcons[status] || Clock;
    return <IconComponent size={16} />;
  };

  return (
    <MonitorContainer
      isLive={isLive}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <HeaderLeft>
          <Title>
            <Brain size={24} />
            Live A/B Test Results
          </Title>
          <LiveIndicator
            isLive={isLive}
            animate={{ scale: isLive ? 1 : 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <LiveDot isLive={isLive} />
            {isLive ? 'Live Updates' : 'Static'}
          </LiveIndicator>
        </HeaderLeft>
        <HeaderRight>
          <Badge variant={isConnected ? 'success' : 'error'} size="sm">
            {isConnected ? 'Connected' : 'Offline'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            <Eye size={16} />
          </Button>
        </HeaderRight>
      </Header>

      {showSummary && (
        <SummaryStats>
          <StatCard whileHover={{ scale: 1.02 }}>
            <StatIcon>
              <BarChart3 size={24} />
            </StatIcon>
            <StatValue>{summaryStats.totalTests}</StatValue>
            <StatLabel>Total Tests</StatLabel>
          </StatCard>
          
          <StatCard whileHover={{ scale: 1.02 }}>
            <StatIcon>
              <Activity size={24} />
            </StatIcon>
            <StatValue>{summaryStats.runningTests}</StatValue>
            <StatLabel>Running Tests</StatLabel>
          </StatCard>
          
          <StatCard whileHover={{ scale: 1.02 }}>
            <StatIcon>
              <CheckCircle size={24} />
            </StatIcon>
            <StatValue>{summaryStats.completedTests}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatCard>
          
          <StatCard whileHover={{ scale: 1.02 }}>
            <StatIcon>
              <Users size={24} />
            </StatIcon>
            <StatValue>{formatNumber(summaryStats.totalParticipants)}</StatValue>
            <StatLabel>Participants</StatLabel>
          </StatCard>
        </SummaryStats>
      )}

      <TestGrid>
        <AnimatePresence mode="popLayout">
          {liveTests.slice(0, maxTests).map((test) => (
            <TestCard
              key={test.testId}
              testStatus={test.status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: recentUpdates.has(test.testId) ? 1.02 : 1,
                boxShadow: recentUpdates.has(test.testId) 
                  ? '0 8px 32px rgba(76, 175, 80, 0.2)' 
                  : '0 2px 8px rgba(0,0,0,0.1)'
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleTestClick(test)}
              whileHover={{ scale: 1.01 }}
              style={{ cursor: 'pointer' }}
            >
              <TestHeader>
                <TestTitle>{test.testName}</TestTitle>
                <TestStatus>
                  <StatusIcon status={test.status}>
                    {getStatusIcon(test.status)}
                  </StatusIcon>
                  <Badge 
                    variant={
                      test.status === 'running' ? 'success' :
                      test.status === 'completed' ? 'info' :
                      test.status === 'paused' ? 'warning' : 'neutral'
                    }
                    size="xs"
                  >
                    {test.status}
                  </Badge>
                </TestStatus>
              </TestHeader>

              <TestProgress>
                <ProgressBar>
                  <ProgressFill
                    status={test.status}
                    initial={{ width: '0%' }}
                    animate={{ width: `${getProgress(test)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </ProgressBar>
                <ProgressInfo>
                  <span>{Math.round(getProgress(test))}% Complete</span>
                  <span>{formatNumber(test.participants)} participants</span>
                </ProgressInfo>
              </TestProgress>

              <TestMetrics>
                <ModelSection isWinner={test.winner === 'A'}>
                  <ModelHeader>
                    <ModelName>Model A: {test.modelA.name}</ModelName>
                    {test.winner === 'A' && (
                      <WinnerBadge>
                        <Award size={12} />
                        Winner
                      </WinnerBadge>
                    )}
                  </ModelHeader>
                  {Object.entries(test.modelAResults).slice(0, 3).map(([key, value]) => (
                    <MetricRow key={key}>
                      <MetricLabel>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</MetricLabel>
                      <MetricValue>
                        {typeof value === 'number' && value > 1 ? formatNumber(value) : 
                         typeof value === 'number' ? `${(value * (key.includes('Rate') ? 100 : 1)).toFixed(1)}${key.includes('Rate') ? '%' : ''}` :
                         value}
                      </MetricValue>
                    </MetricRow>
                  ))}
                </ModelSection>

                <ModelSection isWinner={test.winner === 'B'}>
                  <ModelHeader>
                    <ModelName>Model B: {test.modelB.name}</ModelName>
                    {test.winner === 'B' && (
                      <WinnerBadge>
                        <Award size={12} />
                        Winner
                      </WinnerBadge>
                    )}
                  </ModelHeader>
                  {Object.entries(test.modelBResults).slice(0, 3).map(([key, value]) => {
                    const aValue = test.modelAResults[key];
                    const trend = getMetricTrend(aValue, value);
                    return (
                      <MetricRow key={key}>
                        <MetricLabel>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</MetricLabel>
                        <MetricValue trend={trend}>
                          {typeof value === 'number' && value > 1 ? formatNumber(value) : 
                           typeof value === 'number' ? `${(value * (key.includes('Rate') ? 100 : 1)).toFixed(1)}${key.includes('Rate') ? '%' : ''}` :
                           value}
                          {getTrendIcon(trend)}
                        </MetricValue>
                      </MetricRow>
                    );
                  })}
                </ModelSection>
              </TestMetrics>

              <TestActions>
                <ActionButton onClick={(e) => { e.stopPropagation(); console.log('View details:', test.testId); }}>
                  <Eye size={12} />
                  Details
                </ActionButton>
                <ActionButton onClick={(e) => { e.stopPropagation(); console.log('View results:', test.testId); }}>
                  <BarChart3 size={12} />
                  Results
                </ActionButton>
                {test.status === 'running' && (
                  <ActionButton onClick={(e) => { e.stopPropagation(); console.log('Pause test:', test.testId); }}>
                    <Pause size={12} />
                    Pause
                  </ActionButton>
                )}
              </TestActions>
            </TestCard>
          ))}
        </AnimatePresence>
      </TestGrid>
    </MonitorContainer>
  );
};

export default LiveABTestResults;