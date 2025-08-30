/**
 * OMNIX AI - Alert Notification Debug Component
 * Development debug panel for testing real-time alert notifications
 * MGR-026: Real-time alert notifications
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import mockAlertGenerator from '../../services/mockAlertGenerator';
import useWebSocketStore from '../../store/websocketStore';
import useNotificationStore from '../../store/notificationStore';

const DebugPanel = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 360px;
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
  color: #ff6b35;
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
    color: #ff6b35;
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
    if (props.variant === 'critical') return '#d32f2f';
    if (props.variant === 'info') return '#2196F3';
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
    if (props.type === 'critical') return '#f44336';
    if (props.type === 'warning') return '#ff9800';
    if (props.type === 'success') return '#4CAF50';
    if (props.type === 'info') return '#2196F3';
    return '#fff';
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

const RecentAlerts = styled.div`
  max-height: 120px;
  overflow-y: auto;
  margin-top: 8px;
`;

const AlertItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 10px;
  border-left: 3px solid ${props => {
    if (props.type === 'critical') return '#f44336';
    if (props.type === 'warning') return '#ff9800';
    if (props.type === 'success') return '#4CAF50';
    return '#2196F3';
  }};
`;

const AlertNotificationDebug = ({ onClose }) => {
  const [generatorActive, setGeneratorActive] = useState(false);
  const [alertStats, setAlertStats] = useState({});
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [selectedAlertType, setSelectedAlertType] = useState('inventory');
  const [selectedSeverity, setSelectedSeverity] = useState('critical');
  const { connectionStatus } = useWebSocketStore();
  const { notifications, unreadCount } = useNotificationStore();
  
  useEffect(() => {
    // Subscribe to alert notifications
    const unsubscribe = mockAlertGenerator.subscribe((alert) => {
      setRecentAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10
    });
    
    // Update stats periodically
    const updateStats = () => {
      setAlertStats(mockAlertGenerator.getAlertStats());
    };
    
    updateStats();
    const statsInterval = setInterval(updateStats, 2000);
    
    return () => {
      unsubscribe();
      clearInterval(statsInterval);
    };
  }, []);
  
  const handleStart = () => {
    mockAlertGenerator.start();
    setGeneratorActive(true);
  };
  
  const handleStop = () => {
    mockAlertGenerator.stop();
    setGeneratorActive(false);
  };
  
  const handleBurst = () => {
    mockAlertGenerator.generateBurst(5);
  };
  
  const handleSpecificAlert = () => {
    mockAlertGenerator.generateSpecificAlert(selectedAlertType, selectedSeverity);
  };
  
  const alertTypes = [
    { value: 'inventory', label: 'Inventory' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'customer', label: 'Customer' },
    { value: 'system', label: 'System' },
    { value: 'security', label: 'Security' },
    { value: 'quality', label: 'Quality' },
    { value: 'achievement', label: 'Achievement' }
  ];
  
  const severityLevels = [
    { value: 'critical', label: 'Critical' },
    { value: 'warning', label: 'Warning' },
    { value: 'success', label: 'Success' },
    { value: 'info', label: 'Info' }
  ];
  
  return (
    <DebugPanel
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
    >
      <DebugHeader>
        <DebugTitle>🚨 Alert Notification Debug</DebugTitle>
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
          <StatusText>Notifications: {unreadCount} unread</StatusText>
        </StatusIndicator>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Alert Statistics</SectionTitle>
        <StatsGrid>
          <StatItem>
            <StatValue type="critical">{alertStats.totalTypes || 0}</StatValue>
            <StatLabel>Alert Types</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{alertStats.totalTemplates || 0}</StatValue>
            <StatLabel>Templates</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="success">{notifications?.length || 0}</StatValue>
            <StatLabel>Total Alerts</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="warning">{unreadCount}</StatValue>
            <StatLabel>Unread</StatLabel>
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
            variant="warning"
            onClick={handleBurst}
          >
            Burst (5x)
          </DebugButton>
        </ControlRow>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Manual Alert Generation</SectionTitle>
        <ControlRow>
          <Select
            value={selectedAlertType}
            onChange={(e) => setSelectedAlertType(e.target.value)}
          >
            {alertTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          <Select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            {severityLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </Select>
        </ControlRow>
        <ControlRow>
          <DebugButton onClick={handleSpecificAlert}>
            Generate Alert
          </DebugButton>
        </ControlRow>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Quick Alert Types</SectionTitle>
        <ControlRow>
          <DebugButton
            variant="critical"
            onClick={() => mockAlertGenerator.generateSpecificAlert('inventory', 'critical')}
          >
            Critical
          </DebugButton>
          <DebugButton
            variant="warning"
            onClick={() => mockAlertGenerator.generateSpecificAlert('system', 'warning')}
          >
            Warning
          </DebugButton>
        </ControlRow>
        <ControlRow>
          <DebugButton
            variant="success"
            onClick={() => mockAlertGenerator.generateSpecificAlert('revenue', 'success')}
          >
            Success
          </DebugButton>
          <DebugButton
            variant="info"
            onClick={() => mockAlertGenerator.generateSpecificAlert('customer', 'info')}
          >
            Info
          </DebugButton>
        </ControlRow>
      </DebugSection>
      
      {recentAlerts.length > 0 && (
        <DebugSection>
          <SectionTitle>Recent Alerts</SectionTitle>
          <RecentAlerts>
            {recentAlerts.map(alert => (
              <AlertItem key={alert.id} type={alert.alertType}>
                <div>
                  <strong>{alert.title}</strong>
                </div>
                <div>
                  {alert.content.substring(0, 50)}{alert.content.length > 50 ? '...' : ''}
                </div>
                <div style={{ color: '#888' }}>
                  {alert.timestamp.toLocaleTimeString()}
                </div>
              </AlertItem>
            ))}
          </RecentAlerts>
        </DebugSection>
      )}
    </DebugPanel>
  );
};

export default AlertNotificationDebug;