/**
 * OMNIX AI - WebSocket Health Monitor Component
 * Real-time connection status and health indicator
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocketStore } from '../../store/websocketStore';
import { websocketErrorHandler } from '../../services/websocketErrorHandler';

const HealthMonitor = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: ${props => props.theme.shadows.medium};
  border: 2px solid ${props => props.statusColor};
  min-width: 200px;
  cursor: pointer;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
  animation: ${props => props.pulse ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const StatusText = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

const MetricValue = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.primary};
  margin-left: auto;
  font-weight: 600;
`;

const DetailPanel = styled(motion.div)`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 11px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;
  margin-top: 8px;
  width: 100%;
  
  &:hover {
    background: ${props => props.theme.colors.primary.dark};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const FallbackIndicator = styled.div`
  background: ${props => props.theme.colors.warning.light};
  color: ${props => props.theme.colors.warning.dark};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  text-align: center;
  margin-top: 8px;
  font-weight: 600;
`;

export const WebSocketHealthMonitor = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [autoHideTimer, setAutoHideTimer] = useState(null);
  
  const {
    connectionState,
    isConnected,
    isAuthenticated,
    reconnectAttempts,
    maxReconnectAttempts,
    latency,
    averageLatency,
    connectionQuality,
    queuedMessagesCount,
    totalMessagesReceived,
    totalMessagesSent,
    getConnectionInfo
  } = useWebSocketStore();

  const errorHandlerStatus = websocketErrorHandler.getStatus();

  // Auto-hide when connection is stable
  useEffect(() => {
    if (isConnected && isAuthenticated && !errorHandlerStatus.isUsingFallback) {
      if (autoHideTimer) clearTimeout(autoHideTimer);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      
      setAutoHideTimer(timer);
      return () => clearTimeout(timer);
    } else {
      if (autoHideTimer) clearTimeout(autoHideTimer);
      setIsVisible(true);
    }
  }, [isConnected, isAuthenticated, errorHandlerStatus.isUsingFallback]);

  // Show monitor when there are issues
  useEffect(() => {
    if (connectionState === 'error' || connectionState === 'failed' || errorHandlerStatus.isUsingFallback) {
      setIsVisible(true);
      if (autoHideTimer) clearTimeout(autoHideTimer);
    }
  }, [connectionState, errorHandlerStatus.isUsingFallback]);

  const getStatusColor = () => {
    if (errorHandlerStatus.isUsingFallback) return '#ff9800'; // Orange
    if (!isConnected) return '#f44336'; // Red
    if (!isAuthenticated) return '#ff9800'; // Orange
    if (connectionQuality === 'poor') return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };

  const getStatusText = () => {
    if (errorHandlerStatus.isUsingFallback) return 'Fallback Mode';
    if (!isConnected) return 'Disconnected';
    if (!isAuthenticated) return 'Authenticating';
    return 'Connected';
  };

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'fair': return '#ff9800';
      case 'poor': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const handleReconnect = async () => {
    try {
      const websocketStore = useWebSocketStore.getState();
      await websocketStore.forceReconnect();
    } catch (error) {
      console.error('Manual reconnect failed:', error);
    }
  };

  const handleResetErrors = () => {
    websocketErrorHandler.resetErrorState();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <HealthMonitor
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        statusColor={getStatusColor()}
        onClick={() => setShowDetails(!showDetails)}
      >
        <StatusRow>
          <StatusDot 
            color={getStatusColor()} 
            pulse={!isConnected || !isAuthenticated}
          />
          <StatusText>{getStatusText()}</StatusText>
          <MetricValue>{Math.round(averageLatency)}ms</MetricValue>
        </StatusRow>

        <StatusRow>
          <StatusText>Quality</StatusText>
          <StatusDot color={getQualityColor()} />
          <MetricValue>{connectionQuality}</MetricValue>
        </StatusRow>

        {reconnectAttempts > 0 && (
          <StatusRow>
            <StatusText>Reconnect</StatusText>
            <MetricValue>{reconnectAttempts}/{maxReconnectAttempts}</MetricValue>
          </StatusRow>
        )}

        {errorHandlerStatus.isUsingFallback && (
          <FallbackIndicator>
            Using Backup Connection
          </FallbackIndicator>
        )}

        <AnimatePresence>
          {showDetails && (
            <DetailPanel
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <DetailRow>
                <span>State:</span>
                <span>{connectionState}</span>
              </DetailRow>
              
              <DetailRow>
                <span>Messages:</span>
                <span>↑{totalMessagesSent} ↓{totalMessagesReceived}</span>
              </DetailRow>
              
              {queuedMessagesCount > 0 && (
                <DetailRow>
                  <span>Queued:</span>
                  <span>{queuedMessagesCount}</span>
                </DetailRow>
              )}
              
              <DetailRow>
                <span>Latency:</span>
                <span>{latency}ms (avg: {Math.round(averageLatency)}ms)</span>
              </DetailRow>
              
              {errorHandlerStatus.errorCount > 0 && (
                <DetailRow>
                  <span>Errors:</span>
                  <span>{errorHandlerStatus.errorCount}</span>
                </DetailRow>
              )}
              
              {errorHandlerStatus.isCircuitBreakerOpen && (
                <DetailRow>
                  <span>Circuit:</span>
                  <span style={{ color: '#f44336' }}>OPEN</span>
                </DetailRow>
              )}

              {(!isConnected || errorHandlerStatus.errorCount > 0) && (
                <ActionButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReconnect();
                  }}
                  disabled={errorHandlerStatus.isCircuitBreakerOpen}
                >
                  Force Reconnect
                </ActionButton>
              )}

              {errorHandlerStatus.errorCount > 0 && (
                <ActionButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetErrors();
                  }}
                  style={{ marginTop: 4 }}
                >
                  Reset Errors
                </ActionButton>
              )}
            </DetailPanel>
          )}
        </AnimatePresence>
      </HealthMonitor>
    </AnimatePresence>
  );
};

export default WebSocketHealthMonitor;