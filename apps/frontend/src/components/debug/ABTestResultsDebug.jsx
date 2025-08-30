/**
 * OMNIX AI - A/B Test Results Debug Component
 * Development debug panel for testing live A/B test result functionality
 * MGR-027: Live A/B test result updates
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import mockABTestGenerator from '../../services/mockABTestGenerator';
import useWebSocketStore from '../../store/websocketStore';
import useDashboardStore from '../../store/dashboardStore';

const DebugPanel = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: 380px;
  width: 380px;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  z-index: 10000;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
    bottom: 20px;
  }
`;

const DebugHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
`;

const DebugTitle = styled.h4`
  margin: 0;
  color: #8b5cf6;
  font-size: 14px;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  
  &:hover {
    color: #8b5cf6;
  }
`;

const DebugSection = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h5`
  margin: 0 0 8px 0;
  color: #4CAF50;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ControlRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
`;

const DebugButton = styled.button`
  background: ${props => {
    if (props.variant === 'danger') return '#f44336';
    if (props.variant === 'success') return '#4CAF50';
    if (props.variant === 'warning') return '#ff9800';
    if (props.variant === 'purple') return '#8b5cf6';
    return '#2196F3';
  }};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
`;

const StatusDot = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop)
})`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'connected') return '#4CAF50';
    if (props.status === 'connecting') return '#ff9800';
    return '#f44336';
  }};
  animation: ${props => props.status === 'connecting' ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const StatusText = styled.span`
  font-size: 11px;
  color: #ccc;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const StatItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 6px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${props => {
    if (props.type === 'running') return '#4CAF50';
    if (props.type === 'completed') return '#2196F3';
    if (props.type === 'paused') return '#ff9800';
    return '#8b5cf6';
  }};
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #888;
  margin-top: 2px;
`;

const Select = styled.select`
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  flex: 1;
  
  option {
    background: #333;
    color: white;
  }
`;

const RecentUpdates = styled.div`
  max-height: 120px;
  overflow-y: auto;
  margin-top: 8px;
`;

const UpdateItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 10px;
  border-left: 3px solid ${props => {
    if (props.type === 'test_metrics_update') return '#8b5cf6';
    if (props.type === 'participant_milestone') return '#4CAF50';
    if (props.type === 'significance_reached') return '#ff9800';
    if (props.type === 'test_completion') return '#2196F3';
    return '#f44336';
  }};
`;

const TestList = styled.div`
  max-height: 100px;
  overflow-y: auto;
  margin-top: 8px;
`;

const TestItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 10px;
  border-left: 3px solid ${props => {
    if (props.status === 'running') return '#4CAF50';
    if (props.status === 'completed') return '#2196F3';
    if (props.status === 'paused') return '#ff9800';
    return '#888';
  }};
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ABTestResultsDebug = ({ onClose }) => {
  const [generatorActive, setGeneratorActive] = useState(false);
  const [testStats, setTestStats] = useState({});
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [allTests, setAllTests] = useState([]);
  const { connectionStatus } = useWebSocketStore();
  const { realtimeData } = useDashboardStore();
  
  useEffect(() => {
    // Subscribe to A/B test updates
    const unsubscribe = mockABTestGenerator.subscribe((update) => {
      setRecentUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10
    });
    
    // Update stats and tests periodically
    const updateData = () => {
      setTestStats(mockABTestGenerator.getTestStats());
      setAllTests(mockABTestGenerator.getAllTests());
    };
    
    updateData();
    const statsInterval = setInterval(updateData, 3000);
    
    return () => {
      unsubscribe();
      clearInterval(statsInterval);
    };
  }, []);
  
  const handleStart = () => {
    mockABTestGenerator.start();
    setGeneratorActive(true);
  };
  
  const handleStop = () => {
    mockABTestGenerator.stop();
    setGeneratorActive(false);
  };
  
  const handleBurst = () => {
    mockABTestGenerator.generateBurst(3);
  };
  
  const handleTestSelect = (testId) => {
    setSelectedTest(testId);
    const test = mockABTestGenerator.getTestById(testId);
    console.log('Selected test:', test);
  };
  
  const getUpdateTypeLabel = (type) => {
    switch (type) {
      case 'test_metrics_update': return 'Metrics';
      case 'participant_milestone': return 'Milestone';
      case 'significance_reached': return 'Significant';
      case 'test_completion': return 'Complete';
      case 'performance_alert': return 'Alert';
      default: return type;
    }
  };
  
  return (
    <DebugPanel
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
    >
      <DebugHeader>
        <DebugTitle>🧪 A/B Test Results Debug</DebugTitle>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </DebugHeader>
      
      <DebugSection>
        <SectionTitle>Connection Status</SectionTitle>
        <StatusIndicator>
          <StatusDot status={connectionStatus} />
          <StatusText>WebSocket: {connectionStatus}</StatusText>
        </StatusIndicator>
        <StatusIndicator>
          <StatusDot status="connected" />
          <StatusText>Generator: {generatorActive ? 'active' : 'stopped'}</StatusText>
        </StatusIndicator>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Test Statistics</SectionTitle>
        <StatsGrid>
          <StatItem>
            <StatValue type="running">{testStats.running || 0}</StatValue>
            <StatLabel>Running</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="completed">{testStats.completed || 0}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{testStats.totalParticipants ? Math.round(testStats.totalParticipants).toLocaleString() : 0}</StatValue>
            <StatLabel>Participants</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="purple">{testStats.avgConfidence ? testStats.avgConfidence.toFixed(1) : 0}%</StatValue>
            <StatLabel>Avg Confidence</StatLabel>
          </StatItem>
        </StatsGrid>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Generator Controls</SectionTitle>
        <ControlRow>
          <DebugButton
            variant="success"
            onClick={handleStart}
            disabled={generatorActive}
          >
            Start Auto
          </DebugButton>
          <DebugButton
            variant="danger"
            onClick={handleStop}
            disabled={!generatorActive}
          >
            Stop Auto
          </DebugButton>
          <DebugButton
            variant="purple"
            onClick={handleBurst}
          >
            Burst (3x)
          </DebugButton>
        </ControlRow>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Test Selection</SectionTitle>
        <ControlRow>
          <Select
            value={selectedTest}
            onChange={(e) => handleTestSelect(e.target.value)}
          >
            <option value="">Select Test...</option>
            {allTests.map(test => (
              <option key={test.testId} value={test.testId}>
                {test.testName.substring(0, 30)}...
              </option>
            ))}
          </Select>
        </ControlRow>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Running Tests</SectionTitle>
        <TestList>
          {allTests.filter(test => test.status === 'running').map(test => (
            <TestItem
              key={test.testId}
              status={test.status}
              onClick={() => handleTestSelect(test.testId)}
            >
              <div>
                <strong>{test.testName.substring(0, 25)}...</strong>
              </div>
              <div>
                {test.participants} participants • {test.confidence.toFixed(1)}% confidence
              </div>
              <div style={{ color: '#888' }}>
                {test.modelA.name} vs {test.modelB.name}
              </div>
            </TestItem>
          ))}
        </TestList>
      </DebugSection>
      
      {recentUpdates.length > 0 && (
        <DebugSection>
          <SectionTitle>Recent Updates</SectionTitle>
          <RecentUpdates>
            {recentUpdates.map((update, index) => (
              <UpdateItem key={`${update.testId}-${index}`} type={update.type}>
                <div>
                  <strong>{getUpdateTypeLabel(update.type)}</strong> - {update.testName?.substring(0, 20)}...
                </div>
                {update.type === 'test_metrics_update' && (
                  <div>
                    +{update.participantIncrease} participants ({update.newParticipants} total)
                  </div>
                )}
                {update.message && (
                  <div>{update.message}</div>
                )}
                <div style={{ color: '#888' }}>
                  {update.timestamp.toLocaleTimeString()}
                </div>
              </UpdateItem>
            ))}
          </RecentUpdates>
        </DebugSection>
      )}
    </DebugPanel>
  );
};

export default ABTestResultsDebug;