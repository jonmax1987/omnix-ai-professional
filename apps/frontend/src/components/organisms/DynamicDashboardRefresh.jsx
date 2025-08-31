/**
 * OMNIX AI - Dynamic Dashboard Refresh Control Panel
 * MGR-028: Dynamic dashboard widget refresh interface
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import dashboardWidgetRefreshService from '../../services/dashboardWidgetRefreshService';
import { useWebSocketStore } from '../../store/websocketStore';

const RefreshContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border: 2px solid ${props => props.theme.colors.border.primary};
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const RefreshHeader = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme.colors.background.primary};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ServiceStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIndicator = styled(motion.div)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$active ? '#22c55e' : '#6b7280'};
  box-shadow: ${props => props.$active ? '0 0 12px rgba(34, 197, 94, 0.6)' : 'none'};
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ControlButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => {
    if (props.$variant === 'start') return '#22c55e';
    if (props.$variant === 'stop') return '#ef4444';
    if (props.$variant === 'optimize') return '#3b82f6';
    return props.theme.colors.background.elevated;
  }};
  color: ${props => {
    if (props.$variant === 'start' || props.$variant === 'stop' || props.$variant === 'optimize') return 'white';
    return props.theme.colors.text.primary;
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'start') return '#22c55e';
    if (props.$variant === 'stop') return '#ef4444';
    if (props.$variant === 'optimize') return '#3b82f6';
    return props.theme.colors.border.primary;
  }};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1rem;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    if (props.$type === 'success') return '#22c55e';
    if (props.$type === 'warning') return '#f59e0b';
    if (props.$type === 'error') return '#ef4444';
    return props.theme.colors.primary.main;
  }};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const WidgetsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
`;

const WidgetItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 8px;
  border: 2px solid ${props => {
    if (props.$status === 'healthy') return '#22c55e';
    if (props.$status === 'slow') return '#f59e0b';
    if (props.$status === 'error') return '#ef4444';
    return props.theme.colors.border.primary;
  }};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const WidgetInfo = styled.div`
  flex: 1;
`;

const WidgetName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const WidgetMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const WidgetControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WidgetStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  background: ${props => {
    if (props.$status === 'healthy') return '#22c55e';
    if (props.$status === 'slow') return '#f59e0b';
    if (props.$status === 'error') return '#ef4444';
    return '#6b7280';
  }};
`;

const RefreshingIndicator = styled(motion.div)`
  width: 16px;
  height: 16px;
  border: 2px solid ${props => props.theme.colors.border.primary};
  border-top: 2px solid ${props => props.theme.colors.primary.main};
  border-radius: 50%;
  margin-left: 0.5rem;
`;

const ToggleSwitch = styled.button`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${props => props.$enabled ? '#22c55e' : '#6b7280'};
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$enabled ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const DynamicDashboardRefresh = () => {
  const [serviceStats, setServiceStats] = useState({});
  const [widgetStatuses, setWidgetStatuses] = useState({});
  const [isServiceActive, setIsServiceActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { isConnected } = useWebSocketStore();

  useEffect(() => {
    // Subscribe to service events
    const unsubscribe = dashboardWidgetRefreshService.subscribe((event) => {
      setLastUpdate(new Date());
      updateServiceData();
      
      if (event.event === 'service_started') {
        setIsServiceActive(true);
      } else if (event.event === 'service_stopped') {
        setIsServiceActive(false);
      }
    });

    // Initial data load
    updateServiceData();
    setIsServiceActive(dashboardWidgetRefreshService.isActive);

    // Periodic stats update
    const interval = setInterval(updateServiceData, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updateServiceData = () => {
    setServiceStats(dashboardWidgetRefreshService.getServiceStats());
    setWidgetStatuses(dashboardWidgetRefreshService.getAllWidgetStatuses());
  };

  const handleStartService = () => {
    dashboardWidgetRefreshService.start();
  };

  const handleStopService = () => {
    dashboardWidgetRefreshService.stop();
  };

  const handleOptimizeService = () => {
    dashboardWidgetRefreshService.optimizeRefreshIntervals();
  };

  const handleToggleWidget = (widgetId, enabled) => {
    dashboardWidgetRefreshService.updateWidgetConfig(widgetId, { enabled });
  };

  const handleForceRefresh = (widgetId) => {
    dashboardWidgetRefreshService.forceRefresh(widgetId);
  };

  const formatTime = (ms) => {
    if (!ms) return 'Never';
    const seconds = Math.floor((Date.now() - ms) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const formatInterval = (ms) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const getServiceHealthColor = () => {
    const failureRate = parseFloat(serviceStats.failureRate || 0);
    if (failureRate > 10) return 'error';
    if (failureRate > 5) return 'warning';
    return 'success';
  };

  return (
    <RefreshContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RefreshHeader>
        <HeaderLeft>
          <div>
            <Title>Dynamic Dashboard Refresh</Title>
            <ServiceStatus>
              <StatusIndicator
                $active={isServiceActive}
                animate={{ scale: isServiceActive ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Subtitle>
                Service {isServiceActive ? 'Active' : 'Inactive'}
                {lastUpdate && ` • Updated ${lastUpdate.toLocaleTimeString()}`}
              </Subtitle>
            </ServiceStatus>
          </div>
        </HeaderLeft>
        
        <ControlButtons>
          <ControlButton
            $variant="start"
            onClick={handleStartService}
            disabled={isServiceActive}
          >
            Start Service
          </ControlButton>
          <ControlButton
            $variant="stop"
            onClick={handleStopService}
            disabled={!isServiceActive}
          >
            Stop Service
          </ControlButton>
          <ControlButton
            $variant="optimize"
            onClick={handleOptimizeService}
            disabled={!isServiceActive}
          >
            Optimize Now
          </ControlButton>
        </ControlButtons>
      </RefreshHeader>

      <StatsGrid>
        <StatCard>
          <StatValue $type="primary">{serviceStats.totalWidgets || 0}</StatValue>
          <StatLabel>Total Widgets</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue $type="success">{serviceStats.activeWidgets || 0}</StatValue>
          <StatLabel>Active Widgets</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue $type="primary">{serviceStats.totalRefreshes || 0}</StatValue>
          <StatLabel>Total Refreshes</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue $type="primary">{serviceStats.avgRefreshTime || 0}ms</StatValue>
          <StatLabel>Avg Refresh Time</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue $type={getServiceHealthColor()}>{serviceStats.failureRate || 0}%</StatValue>
          <StatLabel>Failure Rate</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue $type="warning">{serviceStats.memoryUsage || 0}%</StatValue>
          <StatLabel>Memory Usage</StatLabel>
        </StatCard>
      </StatsGrid>

      <WidgetsList>
        <AnimatePresence>
          {Object.entries(widgetStatuses).length === 0 ? (
            <EmptyState>
              <h4>No widgets registered</h4>
              <p>Widgets will appear here when they are registered with the refresh service.</p>
            </EmptyState>
          ) : (
            Object.entries(widgetStatuses).map(([widgetId, status]) => (
              <WidgetItem
                key={widgetId}
                $status={status.healthStatus}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <WidgetInfo>
                  <WidgetName>{status.name}</WidgetName>
                  <WidgetMeta>
                    <span>Last: {formatTime(status.lastRefresh)}</span>
                    <span>Count: {status.refreshCount}</span>
                    <span>Avg: {status.avgRefreshTime}ms</span>
                    <span>Failures: {status.failureRate}%</span>
                  </WidgetMeta>
                </WidgetInfo>
                
                <WidgetControls>
                  <WidgetStatus $status={status.healthStatus}>
                    {status.healthStatus}
                  </WidgetStatus>
                  
                  {status.isRefreshing && (
                    <RefreshingIndicator
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  
                  <ControlButton
                    onClick={() => handleForceRefresh(widgetId)}
                    disabled={status.isRefreshing || !status.enabled}
                    title="Force refresh this widget"
                  >
                    Refresh
                  </ControlButton>
                  
                  <ToggleSwitch
                    $enabled={status.enabled}
                    onClick={() => handleToggleWidget(widgetId, !status.enabled)}
                    title={status.enabled ? 'Disable widget refresh' : 'Enable widget refresh'}
                  />
                </WidgetControls>
              </WidgetItem>
            ))
          )}
        </AnimatePresence>
      </WidgetsList>
    </RefreshContainer>
  );
};

export default DynamicDashboardRefresh;