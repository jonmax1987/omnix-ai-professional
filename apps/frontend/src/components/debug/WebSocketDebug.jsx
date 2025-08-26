import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWebSocketStore } from '../../store/websocketStore';
import { webSocketManager } from '../../services/websocket';
import useUserStore from '../../store/userStore';

const DebugContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 20px;
  width: 400px;
  max-height: 60vh;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', monospace;
  font-size: 12px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const Title = styled.h4`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.connected ? '#10B981' : '#EF4444'};
  margin-left: 8px;
`;

const LogContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
`;

const LogEntry = styled.div`
  margin: 2px 0;
  color: ${props => {
    switch (props.type) {
      case 'error': return '#EF4444';
      case 'success': return '#10B981';
      case 'info': return '#3B82F6';
      case 'warning': return '#F59E0B';
      default: return props.theme.colors.text.secondary;
    }
  }};
  font-size: 11px;
`;

const Button = styled.button`
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 4px;
  font-size: 11px;
  
  &:hover {
    background: ${props => props.theme.colors.primary.dark};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 8px 0;
  font-size: 11px;
`;

const Stat = styled.div`
  background: ${props => props.theme.colors.background.primary};
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
`;

const WebSocketDebug = () => {
  const { isAuthenticated } = useUserStore();
  const { 
    isConnected,
    connectionState, 
    totalMessagesReceived, 
    totalMessagesSent,
    connect,
    disconnect,
    sendMessage 
  } = useWebSocketStore();
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  
  // Add log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-20), { message, type, timestamp }].slice(-25));
  };
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Subscribe to WebSocket events for logging
    const unsubscribers = [
      webSocketManager.subscribe('connection', () => {
        addLog('✅ WebSocket connected', 'success');
      }),
      
      webSocketManager.subscribe('disconnection', () => {
        addLog('❌ WebSocket disconnected', 'error');
      }),
      
      webSocketManager.subscribe('error', (data) => {
        addLog(`🚨 Connection error: ${data.error?.message || 'Unknown error'}`, 'error');
      }),
      
      webSocketManager.subscribe('authenticated', () => {
        addLog('🔑 Authentication successful', 'success');
      }),
      
      webSocketManager.subscribe('auth_failed', (data) => {
        addLog(`🔐 Authentication failed: ${JSON.stringify(data)}`, 'error');
      }),
      
      webSocketManager.subscribe('state_change', (data) => {
        addLog(`🔄 State changed to: ${data.state}`, 'info');
      })
    ];
    
    return () => {
      // Cleanup subscriptions
      unsubscribers.forEach(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [isAuthenticated]);
  
  const handleConnect = () => {
    addLog('🔄 Attempting to connect...', 'warning');
    connect().then(() => {
      addLog('✅ Connected successfully', 'success');
    }).catch(error => {
      addLog(`❌ Connection failed: ${error.message}`, 'error');
    });
  };
  
  const handleDisconnect = () => {
    addLog('🔌 Disconnecting...', 'warning');
    disconnect();
  };
  
  const handleTestMessage = () => {
    sendMessage('test', { message: 'Hello from debug panel', timestamp: Date.now() });
    addLog('📤 Test message sent', 'info');
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  // Show debug panel only in development or when explicitly enabled
  if (!import.meta.env.DEV && !import.meta.env.VITE_DEBUG_WEBSOCKET) {
    return null;
  }
  
  if (!isVisible) {
    return (
      <div 
        style={{ 
          position: 'fixed', 
          top: '80px', 
          right: '20px', 
          zIndex: 1001,
          background: '#1f2937',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
        onClick={() => setIsVisible(true)}
      >
        🔌 WebSocket Debug
      </div>
    );
  }
  
  return (
    <DebugContainer>
      <Header>
        <Title>WebSocket Debug</Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusIndicator connected={isConnected} />
          <span style={{ fontSize: '10px', marginLeft: '4px' }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <Button onClick={() => setIsVisible(false)} style={{ marginLeft: '8px' }}>×</Button>
        </div>
      </Header>
      
      <Stats>
        <Stat>Received: {totalMessagesReceived}</Stat>
        <Stat>Sent: {totalMessagesSent}</Stat>
        <Stat>State: {connectionState}</Stat>
        <Stat>Logs: {logs.length}</Stat>
      </Stats>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
        <Button onClick={handleConnect} disabled={isConnected}>Connect</Button>
        <Button onClick={handleDisconnect} disabled={!isConnected}>Disconnect</Button>
        <Button onClick={handleTestMessage} disabled={!isConnected}>Test</Button>
        <Button onClick={clearLogs}>Clear</Button>
      </div>
      
      <LogContainer>
        {logs.length === 0 ? (
          <LogEntry>No logs yet...</LogEntry>
        ) : (
          logs.map((log, index) => (
            <LogEntry key={index} type={log.type}>
              [{log.timestamp}] {log.message}
            </LogEntry>
          ))
        )}
      </LogContainer>
    </DebugContainer>
  );
};

export default WebSocketDebug;