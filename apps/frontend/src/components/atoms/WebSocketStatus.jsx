import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useWebSocketStore } from '../../store/websocketStore';
import { webSocketManager } from '../../services/websocket';
import Icon from './Icon';
import { useI18n } from '../../hooks/useI18n.jsx';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => {
    if (props.$state === 'connected') return props.theme.colors.status.success + '10';
    if (props.$state === 'connecting' || props.$state === 'reconnecting') return props.theme.colors.status.warning + '10';
    return props.theme.colors.status.error + '10';
  }};
  border-radius: ${props => props.theme.borderRadius.xl};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => {
      if (props.$state === 'connected') return props.theme.colors.status.success + '20';
      if (props.$state === 'connecting' || props.$state === 'reconnecting') return props.theme.colors.status.warning + '20';
      return props.theme.colors.status.error + '20';
    }};
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.$state === 'connected') return props.theme.colors.status.success;
    if (props.$state === 'connecting' || props.$state === 'reconnecting') return props.theme.colors.status.warning;
    return props.theme.colors.status.error;
  }};
  animation: ${props => 
    props.$state === 'connected' ? 'pulse 2s infinite' :
    (props.$state === 'connecting' || props.$state === 'reconnecting') ? 'blink 1s infinite' : 'none'
  };
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 ${props => props.theme.colors.status.success + '40'};
    }
    70% {
      box-shadow: 0 0 0 10px ${props => props.theme.colors.status.success + '00'};
    }
    100% {
      box-shadow: 0 0 0 0 ${props => props.theme.colors.status.success + '00'};
    }
  }
  
  @keyframes blink {
    0%, 50% {
      opacity: 1;
    }
    51%, 100% {
      opacity: 0.3;
    }
  }
`;

const StatusText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

const MetricsText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.muted};
  margin-left: ${props => props.theme.spacing[1]};
`;

const WebSocketStatus = ({ showText = true, showTooltip = true, showMetrics = false }) => {
  const { t } = useI18n();
  const {
    connectionState,
    isConnected,
    reconnectAttempts,
    maxReconnectAttempts,
    queuedMessagesCount,
    totalMessagesReceived,
    totalMessagesSent,
    lastConnected
  } = useWebSocketStore();
  
  const handleClick = () => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) {
      console.log('WebSocket is disabled');
      return;
    }
    
    if (!isConnected) {
      const { connect } = useWebSocketStore.getState();
      connect().catch(error => {
        console.error('Failed to connect to WebSocket:', error);
      });
    }
  };
  
  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
      case 'authenticated':
        return t('websocket.connected', { fallback: 'Connected' });
      case 'connecting':
        return t('websocket.connecting', { fallback: 'Connecting...' });
      case 'reconnecting':
        return t('websocket.reconnecting', { 
          attempts: reconnectAttempts,
          fallback: `Reconnecting... (${reconnectAttempts})` 
        });
      case 'disconnected':
      case 'error':
      case 'failed':
      default:
        return t('websocket.disconnected', { fallback: 'Disconnected' });
    }
  };
  
  const getTooltipContent = () => {
    switch (connectionState) {
      case 'connected':
      case 'authenticated':
        const uptime = lastConnected ? 
          Math.floor((Date.now() - lastConnected) / 1000) : 0;
        return t('websocket.tooltip.connected', { 
          uptime,
          fallback: `Connected • Uptime: ${uptime}s` 
        });
      case 'connecting':
        return t('websocket.tooltip.connecting', { 
          fallback: 'Attempting to connect...' 
        });
      case 'reconnecting':
        return t('websocket.tooltip.reconnecting', { 
          attempts: reconnectAttempts,
          maxAttempts: maxReconnectAttempts,
          fallback: `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})` 
        });
      case 'disconnected':
      case 'error':
      case 'failed':
      default:
        const hasQueued = queuedMessagesCount > 0;
        return t('websocket.tooltip.disconnected', { 
          queuedMessages: queuedMessagesCount,
          hasQueued,
          fallback: hasQueued ? 
            `Disconnected • ${queuedMessagesCount} queued messages` : 
            'Disconnected • Click to reconnect' 
        });
    }
  };
  
  const isConnectionActive = connectionState === 'connected' || connectionState === 'authenticated';
  const showRefreshIcon = connectionState === 'disconnected' && reconnectAttempts === 0;
  
  return (
    <StatusContainer 
      $state={connectionState}
      onClick={handleClick}
      title={showTooltip ? getTooltipContent() : undefined}
    >
      <StatusDot $state={connectionState} />
      {showText && <StatusText>{getStatusText()}</StatusText>}
      {showMetrics && isConnectionActive && (
        <MetricsText>
          ↓{totalMessagesReceived || 0} ↑{totalMessagesSent || 0}
        </MetricsText>
      )}
      {queuedMessagesCount > 0 && (
        <MetricsText title={`${queuedMessagesCount} queued messages`}>
          📨{queuedMessagesCount}
        </MetricsText>
      )}
      {showRefreshIcon && (
        <Icon name="refresh" size={16} />
      )}
    </StatusContainer>
  );
};

export default WebSocketStatus;