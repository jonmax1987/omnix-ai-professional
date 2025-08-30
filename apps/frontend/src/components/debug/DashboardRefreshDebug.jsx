/**
 * OMNIX AI - Dashboard Refresh Debug
 * Development testing component for dynamic widget refresh system
 * MGR-028: Dynamic dashboard widget refresh
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  RefreshCw,
  Play,
  Pause,
  Zap,
  Settings,
  Monitor,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import dashboardRefreshManager from '../../services/dashboardRefreshManager';
import useWebSocketStore from '../../store/websocketStore';
import useDashboardStore from '../../store/dashboardStore';
import Button from '../atoms/Button';

const DebugContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 400px;
  max-height: 600px;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  font-family: 'SF Mono', monospace;
  font-size: 0.8rem;
  z-index: 10000;
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    bottom: 10px;
    left: 20px;
  }
`;

const DebugHeader = styled.div`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DebugTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DebugContent = styled.div`
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const Section = styled.div`
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 0.85rem;
  color: #4CAF50;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const ControlButton = styled.button`
  background: ${({ variant }) => {
    switch (variant) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsList = styled.div`
  display: grid;
  gap: 6px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.75rem;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const StatValue = styled.span`
  color: ${({ type }) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return 'white';
    }
  }};
  font-weight: 500;
`;

const WidgetList = styled.div`
  display: grid;
  gap: 8px;
`;

const WidgetItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop)
})`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px 12px;
  border-left: 3px solid ${({ status }) => {
    switch (status) {
      case 'refreshing': return '#2196F3';
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'stale': return '#FF9800';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const WidgetName = styled.span`
  font-weight: 500;
  font-size: 0.8rem;
`;

const WidgetStatus = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EventLog = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px;
  max-height: 120px;
  overflow-y: auto;
  font-size: 0.7rem;
  line-height: 1.4;
`;

const LogEntry = styled.div`
  color: ${({ type }) => {
    switch (type) {
      case 'websocket': return '#2196F3';
      case 'refresh': return '#4CAF50';
      case 'error': return '#F44336';
      default: return 'rgba(255, 255, 255, 0.8)';
    }
  }};
  margin-bottom: 2px;
`;

const DashboardRefreshDebug = ({ onClose }) => {
  const [refreshStats, setRefreshStats] = useState({});
  const [widgetStatuses, setWidgetStatuses] = useState({});
  const [eventLog, setEventLog] = useState([]);
  const [mockWidgetsRegistered, setMockWidgetsRegistered] = useState(false);
  
  const { isConnected, sendMessage } = useWebSocketStore();
  const { widgetRefreshes } = useDashboardStore();

  // Update data periodically
  useEffect(() => {
    const updateData = () => {
      setRefreshStats(dashboardRefreshManager.getRefreshStats());
      setWidgetStatuses(dashboardRefreshManager.getAllWidgetStatuses());
    };

    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  const addLogEntry = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [...prev.slice(-19), { message, type, timestamp }]);
  };

  const registerMockWidgets = () => {
    const mockWidgets = [
      {
        id: 'revenue-widget',
        name: 'Revenue Dashboard',
        refreshFunction: () => new Promise(resolve => {
          setTimeout(() => {
            addLogEntry('Revenue widget refreshed', 'refresh');
            resolve({ data: 'mock revenue data' });
          }, Math.random() * 2000 + 500);
        }),
        priority: 'high',
        pattern: 'frequent',
        triggers: ['revenue_update', 'payment_processed']
      },
      {
        id: 'inventory-widget',
        name: 'Inventory Status',
        refreshFunction: () => new Promise(resolve => {
          setTimeout(() => {
            addLogEntry('Inventory widget refreshed', 'refresh');
            resolve({ data: 'mock inventory data' });
          }, Math.random() * 1500 + 300);
        }),
        priority: 'critical',
        pattern: 'realtime',
        triggers: ['inventory_update', 'low_stock_alert']
      },
      {
        id: 'customer-widget',
        name: 'Customer Analytics',
        refreshFunction: () => new Promise(resolve => {
          setTimeout(() => {
            addLogEntry('Customer widget refreshed', 'refresh');
            resolve({ data: 'mock customer data' });
          }, Math.random() * 3000 + 800);
        }),
        priority: 'normal',
        pattern: 'normal',
        triggers: ['customer_activity', 'new_customer']
      },
      {
        id: 'ab-test-widget',
        name: 'A/B Test Results',
        refreshFunction: () => new Promise(resolve => {
          setTimeout(() => {
            addLogEntry('A/B Test widget refreshed', 'refresh');
            resolve({ data: 'mock ab test data' });
          }, Math.random() * 2500 + 600);
        }),
        priority: 'normal',
        pattern: 'slow',
        triggers: ['ab_test_update', 'test_results']
      }
    ];

    mockWidgets.forEach(widget => {
      dashboardRefreshManager.registerWidget(widget);
    });

    setMockWidgetsRegistered(true);
    addLogEntry('Mock widgets registered', 'info');
  };

  const handleGlobalRefresh = async () => {
    addLogEntry('Starting global refresh...', 'refresh');
    try {
      await dashboardRefreshManager.refreshAll();
      addLogEntry('Global refresh completed', 'refresh');
    } catch (error) {
      addLogEntry(`Global refresh failed: ${error.message}`, 'error');
    }
  };

  const triggerWebSocketEvent = (eventType) => {
    if (isConnected) {
      sendMessage({
        type: eventType,
        data: { timestamp: Date.now(), source: 'debug' }
      });
      addLogEntry(`WebSocket event: ${eventType}`, 'websocket');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'refreshing': return <Activity size={12} />;
      case 'success': return <CheckCircle size={12} />;
      case 'error': return <AlertTriangle size={12} />;
      case 'stale': return <Clock size={12} />;
      default: return null;
    }
  };

  const widgetArray = Object.values(widgetStatuses);

  return (
    <DebugContainer
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DebugHeader>
        <DebugTitle>🔄 Refresh Debug</DebugTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </DebugHeader>

      <DebugContent>
        <Section>
          <SectionTitle>
            <Settings size={14} />
            System Controls
          </SectionTitle>
          
          <ControlGrid>
            <ControlButton 
              onClick={registerMockWidgets}
              disabled={mockWidgetsRegistered}
              variant="success"
            >
              <Play size={12} />
              Register Widgets
            </ControlButton>
            
            <ControlButton 
              onClick={handleGlobalRefresh}
              disabled={!mockWidgetsRegistered}
              variant="warning"
            >
              <RefreshCw size={12} />
              Global Refresh
            </ControlButton>
          </ControlGrid>
        </Section>

        <Section>
          <SectionTitle>
            <Monitor size={14} />
            Statistics
          </SectionTitle>
          
          <StatsList>
            <StatItem>
              <StatLabel>Active Widgets:</StatLabel>
              <StatValue>{refreshStats.activeWidgets || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Refreshing:</StatLabel>
              <StatValue type="warning">{refreshStats.refreshingWidgets || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Errors:</StatLabel>
              <StatValue type="error">{refreshStats.errorWidgets || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Success Rate:</StatLabel>
              <StatValue type="success">
                {refreshStats.totalRefreshes ? 
                  Math.round((refreshStats.successfulRefreshes / refreshStats.totalRefreshes) * 100) : 0}%
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>WebSocket:</StatLabel>
              <StatValue type={isConnected ? "success" : "error"}>
                {isConnected ? "Connected" : "Disconnected"}
              </StatValue>
            </StatItem>
          </StatsList>
        </Section>

        <Section>
          <SectionTitle>
            <Zap size={14} />
            WebSocket Triggers
          </SectionTitle>
          
          <ControlGrid>
            <ControlButton 
              onClick={() => triggerWebSocketEvent('inventory_update')}
              disabled={!isConnected}
              variant="success"
            >
              Inventory Update
            </ControlButton>
            
            <ControlButton 
              onClick={() => triggerWebSocketEvent('revenue_update')}
              disabled={!isConnected}
              variant="success"
            >
              Revenue Update
            </ControlButton>
            
            <ControlButton 
              onClick={() => triggerWebSocketEvent('customer_activity')}
              disabled={!isConnected}
              variant="success"
            >
              Customer Activity
            </ControlButton>
            
            <ControlButton 
              onClick={() => triggerWebSocketEvent('dashboard_refresh')}
              disabled={!isConnected}
              variant="warning"
            >
              Global Trigger
            </ControlButton>
          </ControlGrid>
        </Section>

        <Section>
          <SectionTitle>
            <Activity size={14} />
            Widget Status ({widgetArray.length})
          </SectionTitle>
          
          <WidgetList>
            {widgetArray.map(widget => (
              <WidgetItem key={widget.id} status={widget.status}>
                <WidgetHeader>
                  <WidgetName>{widget.name}</WidgetName>
                  <WidgetStatus>
                    {getStatusIcon(widget.status)}
                    {widget.status}
                  </WidgetStatus>
                </WidgetHeader>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>
                  Refreshes: {widget.refreshCount} • 
                  Avg: {widget.averageRefreshTime ? Math.round(widget.averageRefreshTime) : 0}ms
                </div>
              </WidgetItem>
            ))}
            
            {widgetArray.length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: '12px' }}>
                No widgets registered
              </div>
            )}
          </WidgetList>
        </Section>

        <Section>
          <SectionTitle>
            <Monitor size={14} />
            Event Log
          </SectionTitle>
          
          <EventLog>
            {eventLog.map((entry, index) => (
              <LogEntry key={index} type={entry.type}>
                [{entry.timestamp}] {entry.message}
              </LogEntry>
            ))}
            
            {eventLog.length === 0 && (
              <div style={{ opacity: 0.5 }}>No events logged</div>
            )}
          </EventLog>
        </Section>
      </DebugContent>
    </DebugContainer>
  );
};

export default DashboardRefreshDebug;