/**
 * System Health Indicator - MGR-031 Support
 * Compact system health indicator for header/navigation
 * Shows overall system status with quick health metrics
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Activity, AlertTriangle, CheckCircle, Wifi, WifiOff, Server } from 'lucide-react';
import useWebSocketStore from '../../store/websocketStore.js';

/**
 * Styled Components
 */
const IndicatorContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'healthy': return props.theme.colors?.green?.[500] || '#10b981';
      case 'warning': return props.theme.colors?.yellow?.[500] || '#f59e0b';
      case 'error': return props.theme.colors?.red?.[500] || '#ef4444';
      default: return props.theme.colors?.gray?.[400] || '#9ca3af';
    }
  }};
  
  ${props => props.$pulse && `
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}
`;

const StatusButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: ${props => props.theme.colors?.gray?.[600] || '#4b5563'};
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors?.gray?.[50] || '#f9fafb'};
    color: ${props => props.theme.colors?.gray?.[900] || '#111827'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TooltipContainer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$visible ? '0' : '-10px'});
  transition: all 0.2s ease;
  pointer-events: ${props => props.$visible ? 'all' : 'none'};
`;

const Tooltip = styled.div`
  background: ${props => props.theme.colors?.white || 'white'};
  border: 1px solid ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  min-width: 280px;
  max-width: 320px;
`;

const TooltipHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => props.theme.colors?.gray?.[100] || '#f3f4f6'};
`;

const TooltipTitle = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors?.gray?.[900] || '#111827'};
`;

const ComponentStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
`;

const ComponentLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors?.gray?.[700] || '#374151'};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ComponentValue = styled.span`
  font-weight: 500;
  color: ${props => {
    switch (props.$status) {
      case 'healthy': return props.theme.colors?.green?.[600] || '#059669';
      case 'warning': return props.theme.colors?.yellow?.[600] || '#d97706';
      case 'error': return props.theme.colors?.red?.[600] || '#dc2626';
      default: return props.theme.colors?.gray?.[600] || '#4b5563';
    }
  }};
`;

const LastUpdated = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${props => props.theme.colors?.gray?.[100] || '#f3f4f6'};
  font-size: 0.75rem;
  color: ${props => props.theme.colors?.gray?.[500] || '#6b7280'};
  text-align: center;
`;

/**
 * System Health Indicator Component
 */
const SystemHealthIndicator = ({ 
  showLabel = false,
  refreshInterval = 10000,
  onClick 
}) => {
  const [systemStatus, setSystemStatus] = useState('healthy');
  const [showTooltip, setShowTooltip] = useState(false);
  const [healthData, setHealthData] = useState({
    webSocket: { status: 'healthy', connected: false },
    api: { status: 'healthy', errors: 0 },
    performance: { status: 'healthy', memory: 0 },
    lastUpdate: new Date()
  });

  const { isConnected, connectionState } = useWebSocketStore();

  /**
   * Collect system health data
   */
  const collectHealthData = React.useCallback(() => {
    // WebSocket status
    const webSocketStatus = isConnected ? 'healthy' : 'error';

    // API status - check for recent errors
    const recentErrors = JSON.parse(localStorage.getItem('apiErrors') || '[]');
    const recentErrorsCount = recentErrors.filter(error => 
      Date.now() - error.timestamp < 300000 // Last 5 minutes
    ).length;
    const apiStatus = recentErrorsCount > 5 ? 'error' : recentErrorsCount > 2 ? 'warning' : 'healthy';

    // Performance status
    let performanceStatus = 'healthy';
    let memoryUsage = 0;
    
    if (window.performance && window.performance.memory) {
      memoryUsage = (window.performance.memory.usedJSHeapSize / window.performance.memory.totalJSHeapSize) * 100;
      performanceStatus = memoryUsage > 90 ? 'error' : memoryUsage > 75 ? 'warning' : 'healthy';
    }

    // Overall status
    const statuses = [webSocketStatus, apiStatus, performanceStatus];
    const overallStatus = statuses.includes('error') ? 'error' : 
                         statuses.includes('warning') ? 'warning' : 'healthy';

    const newHealthData = {
      webSocket: { 
        status: webSocketStatus, 
        connected: isConnected,
        state: connectionState.status 
      },
      api: { 
        status: apiStatus, 
        errors: recentErrorsCount 
      },
      performance: { 
        status: performanceStatus, 
        memory: memoryUsage.toFixed(1) 
      },
      lastUpdate: new Date()
    };

    setSystemStatus(overallStatus);
    setHealthData(newHealthData);
  }, [isConnected, connectionState]);

  /**
   * Auto-refresh health data
   */
  useEffect(() => {
    collectHealthData();
    
    const interval = setInterval(collectHealthData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [collectHealthData, refreshInterval]);

  /**
   * Handle click
   */
  const handleClick = () => {
    if (onClick) {
      onClick(healthData);
    } else {
      setShowTooltip(!showTooltip);
    }
  };

  /**
   * Close tooltip when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTooltip && !event.target.closest('[data-tooltip-container]')) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showTooltip]);

  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'healthy':
        return <CheckCircle />;
      case 'warning':
        return <AlertTriangle />;
      case 'error':
        return <AlertTriangle />;
      default:
        return <Activity />;
    }
  };

  return (
    <IndicatorContainer data-tooltip-container>
      <StatusButton onClick={handleClick} title="System Health Status">
        <StatusDot 
          $status={systemStatus} 
          $pulse={systemStatus !== 'healthy'}
        />
        {getStatusIcon()}
        {showLabel && (
          <span>
            System {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
          </span>
        )}
      </StatusButton>

      <TooltipContainer $visible={showTooltip}>
        <Tooltip>
          <TooltipHeader>
            <TooltipTitle>System Health</TooltipTitle>
            <StatusDot $status={systemStatus} />
          </TooltipHeader>

          <ComponentStatus>
            <ComponentLabel>
              {healthData.webSocket.connected ? <Wifi /> : <WifiOff />}
              WebSocket
            </ComponentLabel>
            <ComponentValue $status={healthData.webSocket.status}>
              {healthData.webSocket.connected ? 'Connected' : 'Disconnected'}
            </ComponentValue>
          </ComponentStatus>

          <ComponentStatus>
            <ComponentLabel>
              <Server />
              API Services
            </ComponentLabel>
            <ComponentValue $status={healthData.api.status}>
              {healthData.api.errors > 0 ? `${healthData.api.errors} errors` : 'OK'}
            </ComponentValue>
          </ComponentStatus>

          <ComponentStatus>
            <ComponentLabel>
              <Activity />
              Performance
            </ComponentLabel>
            <ComponentValue $status={healthData.performance.status}>
              {healthData.performance.memory > 0 ? `${healthData.performance.memory}% mem` : 'OK'}
            </ComponentValue>
          </ComponentStatus>

          <LastUpdated>
            Last updated: {healthData.lastUpdate.toLocaleTimeString()}
          </LastUpdated>
        </Tooltip>
      </TooltipContainer>
    </IndicatorContainer>
  );
};

export default SystemHealthIndicator;