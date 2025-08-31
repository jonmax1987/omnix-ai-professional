/**
 * System Health Monitor - MGR-031
 * Real-time system health monitoring with comprehensive metrics
 * Provides live monitoring of WebSocket connections, API health, performance, and system status
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Activity, Wifi, WifiOff, Server, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import useWebSocketStore from '../../store/websocketStore.js';
import { cdnPerformanceMonitor } from '../../utils/cdnOptimization.js';

/**
 * Styled Components
 */
const MonitorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints?.md || '768px'}) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

const HealthCard = styled.div`
  background: ${props => props.theme.colors?.white || 'white'};
  border: 1px solid ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors?.gray?.[900] || '#111827'};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  
  background: ${props => {
    switch (props.$status) {
      case 'healthy': return props.theme.colors?.green?.[50] || '#f0fdf4';
      case 'warning': return props.theme.colors?.yellow?.[50] || '#fefce8';
      case 'error': return props.theme.colors?.red?.[50] || '#fef2f2';
      default: return props.theme.colors?.gray?.[50] || '#f9fafb';
    }
  }};
  
  color: ${props => {
    switch (props.$status) {
      case 'healthy': return props.theme.colors?.green?.[700] || '#15803d';
      case 'warning': return props.theme.colors?.yellow?.[700] || '#a16207';
      case 'error': return props.theme.colors?.red?.[700] || '#b91c1c';
      default: return props.theme.colors?.gray?.[700] || '#374151';
    }
  }};
`;

const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px dotted ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.span`
  color: ${props => props.theme.colors?.gray?.[600] || '#4b5563'};
  font-size: 0.875rem;
`;

const MetricValue = styled.span`
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: ${props => {
    if (props.$status === 'error') return props.theme.colors?.red?.[600] || '#dc2626';
    if (props.$status === 'warning') return props.theme.colors?.yellow?.[600] || '#d97706';
    if (props.$status === 'healthy') return props.theme.colors?.green?.[600] || '#059669';
    return props.theme.colors?.gray?.[900] || '#111827';
  }};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.$percentage > 80) return props.theme.colors?.green?.[500] || '#10b981';
    if (props.$percentage > 50) return props.theme.colors?.yellow?.[500] || '#f59e0b';
    return props.theme.colors?.red?.[500] || '#ef4444';
  }};
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const AlertsList = styled.div`
  margin-top: 1rem;
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  
  background: ${props => props.theme.colors?.red?.[50] || '#fef2f2'};
  color: ${props => props.theme.colors?.red?.[700] || '#b91c1c'};
  border-left: 3px solid ${props => props.theme.colors?.red?.[500] || '#ef4444'};
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const RefreshButton = styled.button`
  background: ${props => props.theme.colors?.blue?.[600] || '#2563eb'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors?.blue?.[700] || '#1d4ed8'};
  }

  &:disabled {
    background: ${props => props.theme.colors?.gray?.[400] || '#9ca3af'};
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

/**
 * System Health Monitor Component
 */
const SystemHealthMonitor = ({ 
  refreshInterval = 5000, 
  showAlerts = true,
  compactView = false 
}) => {
  const [systemHealth, setSystemHealth] = useState({
    overall: 'healthy',
    lastUpdate: new Date(),
    components: {}
  });
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { connectionState, isConnected, lastMessageTime, reconnectAttempts } = useWebSocketStore();

  /**
   * Collect WebSocket health metrics
   */
  const collectWebSocketMetrics = useCallback(() => {
    const now = Date.now();
    const lastMessageAge = lastMessageTime ? now - lastMessageTime : 0;
    const connectionAge = connectionState.connectedAt ? now - connectionState.connectedAt : 0;
    
    let status = 'healthy';
    let alerts = [];
    
    if (!isConnected) {
      status = 'error';
      alerts.push('WebSocket connection is down');
    } else if (lastMessageAge > 30000) { // 30 seconds
      status = 'warning';
      alerts.push('No messages received in 30+ seconds');
    }
    
    if (reconnectAttempts > 3) {
      status = 'warning';
      alerts.push(`High reconnection attempts: ${reconnectAttempts}`);
    }

    return {
      status,
      alerts,
      metrics: {
        connected: isConnected,
        connectionDuration: connectionAge,
        lastMessageAge,
        reconnectAttempts,
        state: connectionState.status
      }
    };
  }, [isConnected, lastMessageTime, reconnectAttempts, connectionState]);

  /**
   * Collect API health metrics
   */
  const collectAPIMetrics = useCallback(() => {
    const apiMetrics = {
      status: 'healthy',
      alerts: [],
      metrics: {
        responseTime: 0,
        successRate: 100,
        errorCount: 0,
        lastError: null
      }
    };

    // Check for recent API errors in localStorage or global error state
    const recentErrors = JSON.parse(localStorage.getItem('apiErrors') || '[]');
    const recentErrorsCount = recentErrors.filter(error => 
      Date.now() - error.timestamp < 300000 // Last 5 minutes
    ).length;

    if (recentErrorsCount > 5) {
      apiMetrics.status = 'error';
      apiMetrics.alerts.push(`High API error rate: ${recentErrorsCount} errors in 5 minutes`);
    } else if (recentErrorsCount > 2) {
      apiMetrics.status = 'warning';
      apiMetrics.alerts.push(`API errors detected: ${recentErrorsCount} in 5 minutes`);
    }

    apiMetrics.metrics.errorCount = recentErrorsCount;
    apiMetrics.metrics.lastError = recentErrors[recentErrors.length - 1]?.message || null;

    return apiMetrics;
  }, []);

  /**
   * Collect performance metrics
   */
  const collectPerformanceMetrics = useCallback(() => {
    const performance = window.performance;
    let status = 'healthy';
    let alerts = [];
    let metrics = {};

    // Memory usage (if available)
    if (performance.memory) {
      const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
      metrics.memoryUsage = memoryUsage.toFixed(1);
      
      if (memoryUsage > 90) {
        status = 'error';
        alerts.push('High memory usage detected');
      } else if (memoryUsage > 75) {
        status = 'warning';
        alerts.push('Memory usage is elevated');
      }
    }

    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      metrics.pageLoadTime = loadTime.toFixed(0);
      metrics.domContentLoaded = domContentLoaded.toFixed(0);
      
      if (loadTime > 3000) {
        status = status === 'healthy' ? 'warning' : status;
        alerts.push('Slow page load time detected');
      }
    }

    // CDN performance
    if (cdnPerformanceMonitor) {
      try {
        const cdnReport = cdnPerformanceMonitor.getPerformanceReport();
        metrics.cacheHitRate = cdnReport.summary.cacheHitRate;
        metrics.averageImageLoadTime = cdnReport.summary.averageLoadTime;
        
        const hitRate = parseFloat(cdnReport.summary.cacheHitRate);
        if (hitRate < 50) {
          status = status === 'healthy' ? 'warning' : status;
          alerts.push('Low CDN cache hit rate');
        }
      } catch (error) {
        console.debug('CDN metrics not available:', error);
      }
    }

    return { status, alerts, metrics };
  }, []);

  /**
   * Collect all health metrics
   */
  const collectHealthMetrics = useCallback(() => {
    const webSocketHealth = collectWebSocketMetrics();
    const apiHealth = collectAPIMetrics();
    const performanceHealth = collectPerformanceMetrics();
    
    // Determine overall health status
    const statuses = [webSocketHealth.status, apiHealth.status, performanceHealth.status];
    const overallStatus = statuses.includes('error') ? 'error' : 
                         statuses.includes('warning') ? 'warning' : 'healthy';
    
    // Collect all alerts
    const allAlerts = [
      ...webSocketHealth.alerts,
      ...apiHealth.alerts,
      ...performanceHealth.alerts
    ];

    return {
      overall: overallStatus,
      lastUpdate: new Date(),
      alerts: allAlerts,
      components: {
        webSocket: webSocketHealth,
        api: apiHealth,
        performance: performanceHealth
      }
    };
  }, [collectWebSocketMetrics, collectAPIMetrics, collectPerformanceMetrics]);

  /**
   * Refresh health metrics
   */
  const refreshMetrics = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      const healthData = collectHealthMetrics();
      setSystemHealth(healthData);
      
      // Update performance metrics from CDN monitor
      if (cdnPerformanceMonitor) {
        try {
          const perfReport = cdnPerformanceMonitor.getPerformanceReport();
          setPerformanceMetrics(perfReport);
        } catch (error) {
          console.debug('Failed to get CDN performance metrics:', error);
        }
      }
    } catch (error) {
      console.error('Failed to refresh health metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [collectHealthMetrics]);

  /**
   * Auto-refresh metrics
   */
  useEffect(() => {
    // Initial collection
    refreshMetrics();
    
    // Setup interval
    const interval = setInterval(refreshMetrics, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshMetrics, refreshInterval]);

  /**
   * Format duration helper
   */
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  /**
   * Format bytes helper
   */
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  /**
   * Render WebSocket health card
   */
  const renderWebSocketHealth = () => {
    const wsHealth = systemHealth.components.webSocket || {};
    const { status = 'unknown', metrics = {}, alerts = [] } = wsHealth;

    return (
      <HealthCard key="websocket">
        <CardHeader>
          <CardTitle>
            {isConnected ? <Wifi /> : <WifiOff />}
            WebSocket Connection
          </CardTitle>
          <StatusIndicator $status={status}>
            {status === 'healthy' && <CheckCircle size={16} />}
            {status === 'warning' && <AlertTriangle size={16} />}
            {status === 'error' && <AlertTriangle size={16} />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </StatusIndicator>
        </CardHeader>
        
        <MetricsList>
          <MetricRow>
            <MetricLabel>Connection State:</MetricLabel>
            <MetricValue $status={metrics.connected ? 'healthy' : 'error'}>
              {metrics.state || 'Unknown'}
            </MetricValue>
          </MetricRow>
          
          {metrics.connected && (
            <MetricRow>
              <MetricLabel>Uptime:</MetricLabel>
              <MetricValue $status="healthy">
                {formatDuration(metrics.connectionDuration)}
              </MetricValue>
            </MetricRow>
          )}
          
          <MetricRow>
            <MetricLabel>Last Message:</MetricLabel>
            <MetricValue $status={metrics.lastMessageAge > 30000 ? 'warning' : 'healthy'}>
              {formatDuration(metrics.lastMessageAge)} ago
            </MetricValue>
          </MetricRow>
          
          {metrics.reconnectAttempts > 0 && (
            <MetricRow>
              <MetricLabel>Reconnect Attempts:</MetricLabel>
              <MetricValue $status={metrics.reconnectAttempts > 3 ? 'warning' : 'healthy'}>
                {metrics.reconnectAttempts}
              </MetricValue>
            </MetricRow>
          )}
        </MetricsList>

        {showAlerts && alerts.length > 0 && (
          <AlertsList>
            {alerts.map((alert, index) => (
              <Alert key={index}>
                <AlertTriangle />
                {alert}
              </Alert>
            ))}
          </AlertsList>
        )}
      </HealthCard>
    );
  };

  /**
   * Render API health card
   */
  const renderAPIHealth = () => {
    const apiHealth = systemHealth.components.api || {};
    const { status = 'unknown', metrics = {}, alerts = [] } = apiHealth;

    return (
      <HealthCard key="api">
        <CardHeader>
          <CardTitle>
            <Server />
            API Services
          </CardTitle>
          <StatusIndicator $status={status}>
            {status === 'healthy' && <CheckCircle size={16} />}
            {status === 'warning' && <AlertTriangle size={16} />}
            {status === 'error' && <AlertTriangle size={16} />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </StatusIndicator>
        </CardHeader>
        
        <MetricsList>
          <MetricRow>
            <MetricLabel>Success Rate:</MetricLabel>
            <MetricValue $status={metrics.successRate > 95 ? 'healthy' : metrics.successRate > 90 ? 'warning' : 'error'}>
              {metrics.successRate}%
            </MetricValue>
          </MetricRow>
          
          <MetricRow>
            <MetricLabel>Recent Errors:</MetricLabel>
            <MetricValue $status={metrics.errorCount === 0 ? 'healthy' : metrics.errorCount > 5 ? 'error' : 'warning'}>
              {metrics.errorCount} (5 min)
            </MetricValue>
          </MetricRow>
          
          {metrics.responseTime > 0 && (
            <MetricRow>
              <MetricLabel>Response Time:</MetricLabel>
              <MetricValue $status={metrics.responseTime < 1000 ? 'healthy' : metrics.responseTime < 3000 ? 'warning' : 'error'}>
                {metrics.responseTime}ms
              </MetricValue>
            </MetricRow>
          )}
          
          {metrics.lastError && (
            <MetricRow>
              <MetricLabel>Last Error:</MetricLabel>
              <MetricValue $status="error" title={metrics.lastError}>
                {metrics.lastError.substring(0, 30)}...
              </MetricValue>
            </MetricRow>
          )}
        </MetricsList>

        {showAlerts && alerts.length > 0 && (
          <AlertsList>
            {alerts.map((alert, index) => (
              <Alert key={index}>
                <AlertTriangle />
                {alert}
              </Alert>
            ))}
          </AlertsList>
        )}
      </HealthCard>
    );
  };

  /**
   * Render performance health card
   */
  const renderPerformanceHealth = () => {
    const perfHealth = systemHealth.components.performance || {};
    const { status = 'unknown', metrics = {}, alerts = [] } = perfHealth;

    return (
      <HealthCard key="performance">
        <CardHeader>
          <CardTitle>
            <Zap />
            Performance
          </CardTitle>
          <StatusIndicator $status={status}>
            {status === 'healthy' && <CheckCircle size={16} />}
            {status === 'warning' && <AlertTriangle size={16} />}
            {status === 'error' && <AlertTriangle size={16} />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </StatusIndicator>
        </CardHeader>
        
        <MetricsList>
          {metrics.memoryUsage && (
            <>
              <MetricRow>
                <MetricLabel>Memory Usage:</MetricLabel>
                <MetricValue $status={metrics.memoryUsage > 75 ? 'warning' : 'healthy'}>
                  {metrics.memoryUsage}%
                </MetricValue>
              </MetricRow>
              <ProgressBar>
                <ProgressFill $percentage={parseFloat(metrics.memoryUsage)} />
              </ProgressBar>
            </>
          )}
          
          {metrics.pageLoadTime && (
            <MetricRow>
              <MetricLabel>Page Load Time:</MetricLabel>
              <MetricValue $status={metrics.pageLoadTime > 3000 ? 'warning' : 'healthy'}>
                {metrics.pageLoadTime}ms
              </MetricValue>
            </MetricRow>
          )}
          
          {metrics.cacheHitRate && (
            <MetricRow>
              <MetricLabel>CDN Cache Hit Rate:</MetricLabel>
              <MetricValue $status={parseFloat(metrics.cacheHitRate) > 70 ? 'healthy' : 'warning'}>
                {metrics.cacheHitRate}
              </MetricValue>
            </MetricRow>
          )}
          
          {metrics.averageImageLoadTime && (
            <MetricRow>
              <MetricLabel>Avg Image Load:</MetricLabel>
              <MetricValue $status={parseFloat(metrics.averageImageLoadTime) < 1000 ? 'healthy' : 'warning'}>
                {metrics.averageImageLoadTime}
              </MetricValue>
            </MetricRow>
          )}
        </MetricsList>

        {showAlerts && alerts.length > 0 && (
          <AlertsList>
            {alerts.map((alert, index) => (
              <Alert key={index}>
                <AlertTriangle />
                {alert}
              </Alert>
            ))}
          </AlertsList>
        )}
      </HealthCard>
    );
  };

  /**
   * Render overall system status
   */
  const renderOverallStatus = () => {
    return (
      <HealthCard key="overall">
        <CardHeader>
          <CardTitle>
            <Activity />
            System Overview
          </CardTitle>
          <StatusIndicator $status={systemHealth.overall}>
            {systemHealth.overall === 'healthy' && <CheckCircle size={16} />}
            {systemHealth.overall === 'warning' && <AlertTriangle size={16} />}
            {systemHealth.overall === 'error' && <AlertTriangle size={16} />}
            System {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
          </StatusIndicator>
        </CardHeader>
        
        <MetricsList>
          <MetricRow>
            <MetricLabel>Last Updated:</MetricLabel>
            <MetricValue>
              {systemHealth.lastUpdate.toLocaleTimeString()}
            </MetricValue>
          </MetricRow>
          
          <MetricRow>
            <MetricLabel>Active Alerts:</MetricLabel>
            <MetricValue $status={systemHealth.alerts?.length > 0 ? 'warning' : 'healthy'}>
              {systemHealth.alerts?.length || 0}
            </MetricValue>
          </MetricRow>
          
          <MetricRow style={{ marginTop: '1rem' }}>
            <RefreshButton 
              onClick={refreshMetrics} 
              disabled={isRefreshing}
            >
              <Clock />
              {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </RefreshButton>
          </MetricRow>
        </MetricsList>

        {showAlerts && systemHealth.alerts && systemHealth.alerts.length > 0 && (
          <AlertsList>
            {systemHealth.alerts.slice(0, 3).map((alert, index) => (
              <Alert key={index}>
                <AlertTriangle />
                {alert}
              </Alert>
            ))}
            {systemHealth.alerts.length > 3 && (
              <Alert>
                <AlertTriangle />
                +{systemHealth.alerts.length - 3} more alerts...
              </Alert>
            )}
          </AlertsList>
        )}
      </HealthCard>
    );
  };

  return (
    <MonitorContainer>
      {!compactView && renderOverallStatus()}
      {renderWebSocketHealth()}
      {renderAPIHealth()}
      {renderPerformanceHealth()}
    </MonitorContainer>
  );
};

export default SystemHealthMonitor;