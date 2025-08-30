/**
 * OMNIX AI - Dynamic Dashboard Widget
 * MGR-028: Dynamic dashboard widget refresh
 * Self-refreshing widget wrapper with scheduling, priority, and real-time triggers
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  Settings,
  Activity,
  TrendingUp,
  Eye,
  EyeOff,
  MoreHorizontal
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import useWebSocketStore from '../../store/websocketStore';
import { formatRelativeTime } from '../../utils/formatters';

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
`;

const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const WidgetContainer = styled(motion.div)`
  position: relative;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme, isActive, priority }) => {
    if (priority === 'critical') return theme.colors.status.error;
    if (priority === 'high') return theme.colors.status.warning;
    if (isActive) return theme.colors.primary.main;
    return theme.colors.neutral.border;
  }};
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme, status }) => {
      switch (status) {
        case 'refreshing': return `linear-gradient(90deg, ${theme.colors.primary.main}, ${theme.colors.primary.light})`;
        case 'error': return theme.colors.status.error;
        case 'success': return theme.colors.status.success;
        case 'stale': return theme.colors.status.warning;
        default: return 'transparent';
      }
    }};
    animation: ${({ isRefreshing }) => isRefreshing ? 'pulse 2s ease-in-out infinite' : 'none'};
  }

  ${({ isLive }) => isLive && `
    animation: ${pulseAnimation} 3s ease-in-out infinite;
  `}
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  min-height: 60px;
`;

const WidgetTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1;
`;

const WidgetName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const WidgetStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.75rem;
  color: ${({ theme, status }) => {
    switch (status) {
      case 'refreshing': return theme.colors.primary.main;
      case 'error': return theme.colors.status.error;
      case 'success': return theme.colors.status.success;
      case 'stale': return theme.colors.status.warning;
      default: return theme.colors.text.secondary;
    }
  }};
`;

const WidgetControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ isActive, theme }) => isActive && `
    background: ${theme.colors.primary.main};
    color: white;
  `}
`;

const RefreshIcon = styled(RefreshCw)`
  animation: ${({ isSpinning }) => isSpinning ? `${spinAnimation} 1s linear infinite` : 'none'};
`;

const WidgetContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
  min-height: 200px;
  
  ${({ isRefreshing }) => isRefreshing && `
    opacity: 0.7;
    pointer-events: none;
  `}
`;

const StatusIndicator = styled(motion.div)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${({ theme, status }) => {
    switch (status) {
      case 'live': return theme.colors.status.success;
      case 'refreshing': return theme.colors.primary.main;
      case 'error': return theme.colors.status.error;
      case 'stale': return theme.colors.status.warning;
      default: return theme.colors.neutral.subtle;
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const RefreshProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: ${({ theme }) => theme.colors.primary.main};
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const LastUpdateInfo = styled.div`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xs};
  right: ${({ theme }) => theme.spacing.sm};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  opacity: 0.7;
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.status.error}20;
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.status.error};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DynamicDashboardWidget = ({
  id,
  title,
  children,
  refreshFunction,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  priority = 'normal', // normal, high, critical
  triggers = [], // Array of event types that trigger refresh
  onRefresh,
  onError,
  staleThreshold = 300000, // 5 minutes
  showControls = true,
  retryAttempts = 3,
  retryDelay = 1000
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshProgress, setRefreshProgress] = useState(0);
  
  const refreshTimer = useRef(null);
  const staleTimer = useRef(null);
  const retryTimer = useRef(null);
  const progressTimer = useRef(null);
  
  const { isConnected } = useWebSocketStore();
  const { addWidgetRefresh, updateWidgetStatus } = useDashboardStore();

  // Calculate widget status
  const widgetStatus = useMemo(() => {
    if (isRefreshing) return 'refreshing';
    if (error) return 'error';
    if (Date.now() - lastUpdate > staleThreshold) return 'stale';
    if (isLive) return 'live';
    return 'success';
  }, [isRefreshing, error, lastUpdate, staleThreshold, isLive]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh || isPaused) return;

    refreshTimer.current = setInterval(() => {
      handleRefresh('auto');
    }, refreshInterval);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [autoRefresh, refreshInterval, isPaused]);

  // Stale detection
  useEffect(() => {
    staleTimer.current = setTimeout(() => {
      if (!isRefreshing) {
        updateWidgetStatus(id, 'stale');
      }
    }, staleThreshold);

    return () => {
      if (staleTimer.current) {
        clearTimeout(staleTimer.current);
      }
    };
  }, [lastUpdate, staleThreshold, isRefreshing]);

  // WebSocket trigger integration
  useEffect(() => {
    if (!triggers.length || !isConnected) return;

    // This would integrate with WebSocket events
    // For now, simulate triggered refreshes
    const triggerInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of trigger
        handleRefresh('trigger');
        setIsLive(true);
        setTimeout(() => setIsLive(false), 5000);
      }
    }, 15000);

    return () => clearInterval(triggerInterval);
  }, [triggers, isConnected]);

  const handleRefresh = useCallback(async (source = 'manual') => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setError(null);
    setRefreshProgress(0);
    
    // Progress simulation
    const progressInterval = setInterval(() => {
      setRefreshProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      if (refreshFunction) {
        await refreshFunction();
      }
      
      setLastUpdate(Date.now());
      setRefreshCount(prev => prev + 1);
      setRetryCount(0);
      
      // Add refresh to dashboard store
      addWidgetRefresh({
        widgetId: id,
        timestamp: new Date(),
        source,
        success: true
      });
      
      if (onRefresh) {
        onRefresh({ source, success: true });
      }
      
      // Update widget status
      updateWidgetStatus(id, 'success');
      
    } catch (err) {
      console.error(`Widget ${id} refresh failed:`, err);
      setError(err.message || 'Refresh failed');
      
      // Retry logic
      if (retryCount < retryAttempts) {
        setRetryCount(prev => prev + 1);
        retryTimer.current = setTimeout(() => {
          handleRefresh(source);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        updateWidgetStatus(id, 'error');
        if (onError) {
          onError(err);
        }
      }
    } finally {
      clearInterval(progressInterval);
      setRefreshProgress(100);
      
      setTimeout(() => {
        setIsRefreshing(false);
        setRefreshProgress(0);
      }, 500);
    }
  }, [isRefreshing, refreshFunction, id, onRefresh, onError, retryCount, retryAttempts, retryDelay]);

  const toggleAutoRefresh = () => {
    setIsPaused(!isPaused);
  };

  const getStatusIcon = () => {
    switch (widgetStatus) {
      case 'refreshing': return <Activity size={14} />;
      case 'error': return <AlertTriangle size={14} />;
      case 'success': return <CheckCircle size={14} />;
      case 'stale': return <Clock size={14} />;
      case 'live': return <Zap size={14} />;
      default: return <Eye size={14} />;
    }
  };

  const getStatusText = () => {
    switch (widgetStatus) {
      case 'refreshing': return `Refreshing... ${retryCount > 0 ? `(Retry ${retryCount})` : ''}`;
      case 'error': return `Error ${retryCount > 0 ? `(${retryCount}/${retryAttempts})` : ''}`;
      case 'success': return 'Up to date';
      case 'stale': return 'Data may be stale';
      case 'live': return 'Live updates';
      default: return 'Ready';
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      if (staleTimer.current) clearTimeout(staleTimer.current);
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  return (
    <WidgetContainer
      isActive={isRefreshing}
      isRefreshing={isRefreshing}
      isLive={isLive}
      priority={priority}
      status={widgetStatus}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <WidgetHeader>
        <WidgetTitle>
          <WidgetName>{title}</WidgetName>
          <WidgetStatus status={widgetStatus}>
            {getStatusIcon()}
            {getStatusText()}
          </WidgetStatus>
        </WidgetTitle>

        {showControls && (
          <WidgetControls>
            <ControlButton
              onClick={() => handleRefresh('manual')}
              disabled={isRefreshing}
              title="Refresh now"
            >
              <RefreshIcon size={16} isSpinning={isRefreshing} />
            </ControlButton>
            
            <ControlButton
              onClick={toggleAutoRefresh}
              isActive={!isPaused}
              title={isPaused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </ControlButton>
            
            <ControlButton title="Widget settings">
              <Settings size={16} />
            </ControlButton>
          </WidgetControls>
        )}
      </WidgetHeader>

      <WidgetContent isRefreshing={isRefreshing}>
        {children}
        
        {error && (
          <ErrorMessage>
            <AlertTriangle size={16} />
            {error}
            {retryCount > 0 && ` (Retrying ${retryCount}/${retryAttempts})`}
          </ErrorMessage>
        )}

        <LastUpdateInfo>
          Last updated {formatRelativeTime(lastUpdate)} • {refreshCount} refreshes
        </LastUpdateInfo>
        
        {refreshProgress > 0 && refreshProgress < 100 && (
          <RefreshProgress progress={refreshProgress} />
        )}
      </WidgetContent>

      <AnimatePresence>
        {isRefreshing && (
          <LoadingOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RefreshIcon size={24} isSpinning={true} />
          </LoadingOverlay>
        )}
      </AnimatePresence>

      <StatusIndicator
        status={widgetStatus}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {widgetStatus === 'live' && <TrendingUp size={12} />}
        {widgetStatus}
      </StatusIndicator>
    </WidgetContainer>
  );
};

export default DynamicDashboardWidget;