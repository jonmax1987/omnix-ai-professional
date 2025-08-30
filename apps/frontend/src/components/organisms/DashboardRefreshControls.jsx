/**
 * OMNIX AI - Dashboard Refresh Controls
 * Global dashboard refresh management interface
 * MGR-028: Dynamic dashboard widget refresh
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw,
  Settings,
  Activity,
  Pause,
  Play,
  BarChart3,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  MoreVertical,
  Maximize2,
  Minimize2
} from 'lucide-react';
import dashboardRefreshManager from '../../services/dashboardRefreshManager';
import useDashboardStore from '../../store/dashboardStore';
import useWebSocketStore from '../../store/websocketStore';
import { formatRelativeTime, formatDuration } from '../../utils/formatters';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

const ControlsContainer = styled(motion.div)`
  position: fixed;
  top: 80px;
  right: 20px;
  width: ${({ isExpanded }) => isExpanded ? '400px' : '60px'};
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10001;
  overflow: hidden;
  transition: width 0.3s ease;

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
  }
`;

const ControlsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
`;

const HeaderTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  opacity: ${({ isExpanded }) => isExpanded ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ControlsContent = styled.div`
  padding: ${({ isExpanded }) => isExpanded ? '16px' : '0'};
  color: white;
  opacity: ${({ isExpanded }) => isExpanded ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: ${({ isExpanded }) => isExpanded ? 'auto' : 'none'};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${({ type, theme }) => {
    switch (type) {
      case 'success': return theme.colors.status.success;
      case 'error': return theme.colors.status.error;
      case 'warning': return theme.colors.status.warning;
      case 'primary': return theme.colors.primary.main;
      default: return 'white';
    }
  }};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
`;

const GlobalControls = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ControlButton = styled.button`
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary': return theme.colors.primary.main;
      case 'success': return theme.colors.status.success;
      case 'warning': return theme.colors.status.warning;
      case 'danger': return theme.colors.status.error;
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const WidgetList = styled.div`
  max-height: 300px;
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

const WidgetItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid ${({ status, theme }) => {
    switch (status) {
      case 'refreshing': return theme.colors.primary.main;
      case 'success': return theme.colors.status.success;
      case 'error': return theme.colors.status.error;
      case 'stale': return theme.colors.status.warning;
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  }};
`;

const WidgetInfo = styled.div`
  flex: 1;
`;

const WidgetName = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 2px;
`;

const WidgetStatus = styled.div`
  font-size: 0.7rem;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const WidgetActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'refreshing': return theme.colors.primary.main;
      case 'success': return theme.colors.status.success;
      case 'error': return theme.colors.status.error;
      case 'stale': return theme.colors.status.warning;
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
  animation: ${({ status }) => status === 'refreshing' ? 'pulse 2s ease-in-out infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const FloatingButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: ${({ isExpanded }) => isExpanded ? 0 : 1};
  transition: opacity 0.3s ease;
  pointer-events: ${({ isExpanded }) => isExpanded ? 'none' : 'auto'};
`;

const DashboardRefreshControls = ({ onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStats, setRefreshStats] = useState({});
  const [widgetStatuses, setWidgetStatuses] = useState({});
  
  const { isConnected } = useWebSocketStore();
  const { realtimeData } = useDashboardStore();

  // Update stats and widget statuses
  useEffect(() => {
    const updateData = () => {
      setRefreshStats(dashboardRefreshManager.getRefreshStats());
      setWidgetStatuses(dashboardRefreshManager.getAllWidgetStatuses());
    };

    updateData();
    const interval = setInterval(updateData, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dashboardRefreshManager.refreshAll();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleWidgetRefresh = async (widgetId) => {
    await dashboardRefreshManager.refreshWidget(widgetId, 'manual');
  };

  const handleWidgetPause = (widgetId) => {
    const widget = widgetStatuses[widgetId];
    if (widget?.status === 'paused') {
      dashboardRefreshManager.resumeWidget(widgetId);
    } else {
      dashboardRefreshManager.pauseWidget(widgetId);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'refreshing': return <Activity size={12} />;
      case 'success': return <CheckCircle size={12} />;
      case 'error': return <AlertTriangle size={12} />;
      case 'stale': return <Clock size={12} />;
      default: return <Eye size={12} />;
    }
  };

  const widgetArray = Object.values(widgetStatuses).filter(Boolean);

  return (
    <ControlsContainer
      isExpanded={isExpanded}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ControlsHeader>
        <HeaderTitle isExpanded={isExpanded}>
          Dashboard Refresh
        </HeaderTitle>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge 
            variant={isConnected ? 'success' : 'error'} 
            size="xs"
            style={{ opacity: isExpanded ? 1 : 0 }}
          >
            {isConnected ? 'Live' : 'Offline'}
          </Badge>
          <ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </ToggleButton>
        </div>
      </ControlsHeader>

      <FloatingButton isExpanded={isExpanded}>
        <RefreshCw 
          size={20} 
          style={{ 
            color: 'rgba(255,255,255,0.7)',
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
          }} 
        />
      </FloatingButton>

      <ControlsContent isExpanded={isExpanded}>
        <StatsGrid>
          <StatCard>
            <StatValue type="primary">{refreshStats.activeWidgets || 0}</StatValue>
            <StatLabel>Widgets</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue type="success">{refreshStats.refreshingWidgets || 0}</StatValue>
            <StatLabel>Refreshing</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue type="error">{refreshStats.errorWidgets || 0}</StatValue>
            <StatLabel>Errors</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue type="warning">{refreshStats.staleWidgets || 0}</StatValue>
            <StatLabel>Stale</StatLabel>
          </StatCard>
        </StatsGrid>

        <GlobalControls>
          <ControlButton
            variant="primary"
            onClick={handleGlobalRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} />
            {isRefreshing ? 'Refreshing...' : 'Refresh All'}
          </ControlButton>
          
          <ControlButton variant="default">
            <Settings size={14} />
            Settings
          </ControlButton>
        </GlobalControls>

        <div style={{ fontSize: '0.8rem', marginBottom: '12px', opacity: 0.8 }}>
          Widgets ({widgetArray.length})
        </div>

        <WidgetList>
          <AnimatePresence mode="popLayout">
            {widgetArray.map((widget) => (
              <WidgetItem
                key={widget.id}
                status={widget.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <WidgetInfo>
                  <WidgetName>{widget.name}</WidgetName>
                  <WidgetStatus>
                    <StatusIndicator status={widget.status} />
                    {getStatusIcon(widget.status)}
                    {widget.status}
                    {widget.lastRefresh && (
                      <span>• {formatRelativeTime(widget.lastRefresh)}</span>
                    )}
                  </WidgetStatus>
                </WidgetInfo>
                
                <WidgetActions>
                  <ActionButton
                    onClick={() => handleWidgetRefresh(widget.id)}
                    disabled={widget.isRefreshing}
                    title="Refresh widget"
                  >
                    <RefreshCw size={12} />
                  </ActionButton>
                  
                  <ActionButton
                    onClick={() => handleWidgetPause(widget.id)}
                    title={widget.status === 'paused' ? 'Resume' : 'Pause'}
                  >
                    {widget.status === 'paused' ? <Play size={12} /> : <Pause size={12} />}
                  </ActionButton>
                </WidgetActions>
              </WidgetItem>
            ))}
          </AnimatePresence>

          {widgetArray.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              opacity: 0.5, 
              fontSize: '0.8rem' 
            }}>
              No widgets registered
            </div>
          )}
        </WidgetList>

        {refreshStats.lastGlobalRefresh && (
          <div style={{ 
            fontSize: '0.7rem', 
            opacity: 0.6, 
            textAlign: 'center', 
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            Last refresh: {formatRelativeTime(refreshStats.lastGlobalRefresh)}
            <br />
            Success rate: {
              refreshStats.totalRefreshes ? 
              Math.round((refreshStats.successfulRefreshes / refreshStats.totalRefreshes) * 100) : 0
            }%
          </div>
        )}
      </ControlsContent>
    </ControlsContainer>
  );
};

export default DashboardRefreshControls;