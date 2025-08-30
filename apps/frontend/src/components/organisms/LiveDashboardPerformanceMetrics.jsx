/**
 * OMNIX AI - Live Dashboard Performance Metrics
 * Real-time performance monitoring and optimization system
 * MGR-030: Live dashboard performance metrics
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  Zap,
  Database,
  Server,
  Monitor,
  Wifi,
  WifiOff,
  BarChart3,
  Gauge,
  AlertTriangle,
  Info,
  RefreshCw,
  Settings,
  Download
} from 'lucide-react';
import { performanceMonitor, usePerformanceMonitoring } from '../../services/performance';
import useWebSocketStore from '../../store/websocketStore';
import useDashboardStore from '../../store/dashboardStore';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';

// Animation keyframes
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const performanceUpdate = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
`;

const criticalAlert = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
`;

// Styled components
const MetricsContainer = styled(motion.div)`
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border-radius: ${props => props.theme?.spacing?.[3] || props.theme?.spacing?.md || '0.75rem'};
  padding: ${props => props.theme?.spacing?.[6] || props.theme?.spacing?.xl || '1.5rem'};
  box-shadow: ${props => props.theme?.shadows?.lg || '0 10px 15px -3px rgb(0 0 0 / 0.1)'};
  position: relative;
  overflow: hidden;
  height: ${props => props.height || 'auto'};
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    padding: ${props => props.theme?.spacing?.[4] || props.theme?.spacing?.lg || '1rem'};
  }
`;

const MetricsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme?.spacing?.[5] || props.theme?.spacing?.xl || '1.25rem'};
  padding-bottom: ${props => props.theme?.spacing?.[4] || props.theme?.spacing?.lg || '1rem'};
  border-bottom: 1px solid ${props => props.theme?.colors?.border?.light || '#e2e8f0'};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[3] || props.theme?.spacing?.md || "0.75rem"};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || props.theme?.spacing?.sm || "0.5rem"};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme?.spacing?.[4] || props.theme?.spacing?.lg || "1rem"};
  margin-bottom: ${props => props.theme?.spacing?.[5] || props.theme?.spacing?.xl || "1.25rem"};
  
  @media (max-width: ${props => props.theme?.breakpoints?.sm || "640px"}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme?.spacing?.[3] || props.theme?.spacing?.md || "0.75rem"};
  }
`;

const MetricItem = styled(motion.div)`
  background: ${props => props.theme?.colors?.background?.primary || "#f8fafc"};
  border-radius: ${props => props.theme?.spacing?.[2] || props.theme?.spacing?.sm || "0.5rem"};
  padding: ${props => props.theme?.spacing?.[4] || props.theme?.spacing?.lg || "1rem"};
  border: 1px solid ${props => props.theme?.colors?.border?.light || "#e2e8f0"};
  position: relative;
  overflow: hidden;
  
  ${props => props.status === 'excellent' && css`
    border-color: ${props.theme?.colors?.green?.[400] || "#64748b"};
    background: linear-gradient(135deg,
      ${props.theme?.colors?.background?.primary || "#f8fafc"} 0%,
      ${props.theme?.colors?.green?.[50] || "#64748b"} 100%
    );
  `}
  
  ${props => props.status === 'good' && css`
    border-color: ${props.theme?.colors?.blue?.[400] || "#64748b"};
  `}
  
  ${props => props.status === 'warning' && css`
    border-color: ${props.theme?.colors?.yellow?.[400] || "#64748b"};
    background: linear-gradient(135deg,
      ${props.theme?.colors?.background?.primary || "#f8fafc"} 0%,
      ${props.theme?.colors?.yellow?.[50] || "#64748b"} 100%
    );
  `}
  
  ${props => props.status === 'critical' && css`
    border-color: ${props.theme?.colors?.red?.[400] || "#64748b"};
    background: linear-gradient(135deg,
      ${props.theme?.colors?.background?.primary || "#f8fafc"} 0%,
      ${props.theme?.colors?.red?.[50] || "#64748b"} 100%
    );
    animation: ${criticalAlert} 2s ease-in-out infinite;
  `}
  
  ${props => props.updating && css`
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: ${props.theme?.colors?.brand?.primary || props.theme?.colors?.primary?.[500] || '#3B82F6'};
      animation: ${performanceUpdate} 0.5s ease-out;
    }
  `}
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme?.spacing?.[2] || props.theme?.spacing?.sm || "0.5rem"};
`;

const MetricLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || props.theme?.spacing?.sm || "0.5rem"};
  color: ${props => props.theme?.colors?.text?.secondary || "#64748b"};
  font-size: ${props => props.theme?.typography?.fontSizes?.sm || props.theme?.typography?.fontSize?.sm || '0.875rem'};
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme?.typography?.fontSizes?.['2xl'] || props.theme?.typography?.fontSize?.['2xl'] || '1.5rem'};
  font-weight: ${props => props.theme?.typography?.fontWeights?.bold || props.theme?.typography?.fontWeight?.bold || 700};
  color: ${props => props.theme?.colors?.text?.primary || "#0f172a"};
  margin-bottom: ${props => props.theme?.spacing?.[1] || props.theme?.spacing?.xs || "0.25rem"};
`;

const MetricUnit = styled.span`
  font-size: ${props => props.theme?.typography?.fontSizes?.sm || props.theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${props => props.theme?.colors?.text?.tertiary || "#94a3b8"};
  font-weight: ${props => props.theme?.typography?.fontWeights?.normal || props.theme?.typography?.fontWeight?.normal || 400};
  margin-left: ${props => props.theme?.spacing?.[1] || props.theme?.spacing?.xs || "0.25rem"};
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[1] || props.theme?.spacing?.xs || "0.25rem"};
  font-size: ${props => props.theme?.typography?.fontSizes?.xs || props.theme?.typography?.fontSize?.xs || "0.75rem"};
  color: ${props => props.trend === 'up' 
    ? props.improvement ? props.theme?.colors?.green?.[600] || "#64748b" : props.theme?.colors?.red?.[600] || "#64748b"
    : props.improvement ? props.theme?.colors?.red?.[600] || "#64748b" : props.theme?.colors?.green?.[600] || "#64748b"
  };
`;

const PerformanceChart = styled.div`
  background: ${props => props.theme?.colors?.background?.primary || "#f8fafc"};
  border-radius: ${props => props.theme?.spacing?.[2] || props.theme?.spacing?.sm || "0.5rem"};
  padding: ${props => props.theme?.spacing?.[4] || props.theme?.spacing?.lg || "1rem"};
  margin-bottom: ${props => props.theme?.spacing?.[5] || props.theme?.spacing?.xl || "1.25rem"};
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme?.colors?.border?.light || "#e2e8f0"};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || props.theme?.spacing?.sm || "0.5rem"};
  padding: ${props => props.theme?.spacing?.[3] || props.theme?.spacing?.md || "0.75rem"};
  background: ${props => props.theme?.colors?.background?.primary || "#f8fafc"};
  border-radius: ${props => props.theme?.spacing?.[2] || props.theme?.spacing?.sm || "0.5rem"};
  border: 1px solid ${props => props.theme?.colors?.border?.light || "#e2e8f0"};
  margin-bottom: ${props => props.theme?.spacing?.[4] || props.theme?.spacing?.lg || "1rem"};
`;

const StatusDot = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'animated' && prop !== 'status'
})`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch(props.status) {
      case 'excellent': return props.theme?.colors?.green?.[500] || "#64748b";
      case 'good': return props.theme?.colors?.blue?.[500] || "#64748b";
      case 'warning': return props.theme?.colors?.yellow?.[500] || "#64748b";
      case 'critical': return props.theme?.colors?.red?.[500] || "#64748b";
      default: return props.theme?.colors?.gray?.[400] || "#64748b";
    }
  }};
  
  ${props => props.animated && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
`;

const OptimizationSuggestions = styled.div`
  background: ${props => props.theme?.colors?.background?.primary || "#f8fafc"};
  border-radius: ${props => props.theme?.spacing?.[2] || props.theme?.spacing?.sm || "0.5rem"};
  padding: ${props => props.theme?.spacing?.[4] || props.theme?.spacing?.lg || "1rem"};
  border: 1px solid ${props => props.theme?.colors?.border?.light || "#e2e8f0"};
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme?.spacing?.[3] || props.theme?.spacing?.md || "0.75rem"};
  padding: ${props => props.theme?.spacing?.[3] || props.theme?.spacing?.md || "0.75rem"} 0;
  border-bottom: 1px solid ${props => props.theme?.colors?.border?.light || "#e2e8f0"};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
`;

const SuggestionIcon = styled.div`
  color: ${props => {
    switch(props.priority) {
      case 'high': return props.theme?.colors?.red?.[500] || "#64748b";
      case 'medium': return props.theme?.colors?.yellow?.[500] || "#64748b";
      case 'low': return props.theme?.colors?.blue?.[500] || "#64748b";
      default: return props.theme?.colors?.gray?.[500] || "#64748b";
    }
  }};
`;

const SuggestionContent = styled.div`
  flex: 1;
`;

const SuggestionTitle = styled.div`
  font-weight: ${props => props.theme?.typography?.fontWeights?.medium || props.theme?.typography?.fontWeight?.medium || 500};
  color: ${props => props.theme?.colors?.text?.primary || "#0f172a"};
  margin-bottom: ${props => props.theme?.spacing?.[1] || props.theme?.spacing?.xs || "0.25rem"};
`;

const SuggestionDescription = styled.div`
  font-size: ${props => props.theme?.typography?.fontSizes?.sm || props.theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${props => props.theme?.colors?.text?.secondary || "#64748b"};
  line-height: 1.5;
`;

// Main Component
const LiveDashboardPerformanceMetrics = ({ 
  height,
  showChart = true,
  showSuggestions = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [metrics, setMetrics] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [overallStatus, setOverallStatus] = useState('good');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  const { connectionQuality, latency, isConnected } = useWebSocketStore();
  const { loading: dashboardLoading } = useDashboardStore();
  
  // Use performance monitoring hook
  const { markStart, markEnd, measure } = usePerformanceMonitoring('LiveDashboardPerformanceMetrics');
  
  // Fetch and process performance metrics
  const fetchMetrics = useCallback(async () => {
    markStart('fetchMetrics');
    setIsRefreshing(true);
    
    try {
      // Get Web Vitals and custom metrics
      const report = performanceMonitor.generateReport();
      
      // Process metrics into dashboard format
      const processedMetrics = {
        // Core Web Vitals
        lcp: {
          label: 'Largest Contentful Paint',
          value: report.metrics.find(m => m.name === 'LCP')?.value || 0,
          unit: 'ms',
          status: report.metrics.find(m => m.name === 'LCP')?.rating || 'good',
          icon: <Monitor size={16} />,
          threshold: { good: 2500, warning: 4000 }
        },
        fid: {
          label: 'First Input Delay',
          value: report.metrics.find(m => m.name === 'FID')?.value || 0,
          unit: 'ms',
          status: report.metrics.find(m => m.name === 'FID')?.rating || 'good',
          icon: <Clock size={16} />,
          threshold: { good: 100, warning: 300 }
        },
        cls: {
          label: 'Cumulative Layout Shift',
          value: report.metrics.find(m => m.name === 'CLS')?.value || 0,
          unit: '',
          status: report.metrics.find(m => m.name === 'CLS')?.rating || 'good',
          icon: <Activity size={16} />,
          threshold: { good: 0.1, warning: 0.25 }
        },
        
        // Performance metrics
        ttfb: {
          label: 'Time to First Byte',
          value: report.metrics.find(m => m.name === 'TTFB')?.value || 0,
          unit: 'ms',
          status: report.metrics.find(m => m.name === 'TTFB')?.rating || 'good',
          icon: <Server size={16} />,
          threshold: { good: 800, warning: 1800 }
        },
        
        // Real-time metrics
        wsLatency: {
          label: 'WebSocket Latency',
          value: latency || 0,
          unit: 'ms',
          status: getLatencyStatus(latency),
          icon: isConnected ? <Wifi size={16} /> : <WifiOff size={16} />,
          threshold: { good: 100, warning: 300 }
        },
        
        // Memory usage
        memory: {
          label: 'Memory Usage',
          value: report.metrics.find(m => m.name === 'MemoryUsage')?.value || 0,
          unit: 'MB',
          status: report.metrics.find(m => m.name === 'MemoryUsage')?.rating || 'good',
          icon: <Cpu size={16} />,
          threshold: { good: 50, warning: 100 }
        },
        
        // Dashboard specific
        refreshRate: {
          label: 'Refresh Rate',
          value: dashboardLoading ? 0 : (1000 / refreshInterval) * 60,
          unit: 'rpm',
          status: dashboardLoading ? 'warning' : 'good',
          icon: <RefreshCw size={16} />,
          threshold: { good: 12, warning: 6 }
        },
        
        // API response time
        apiResponseTime: {
          label: 'API Response Time',
          value: calculateAverageApiTime(report.metrics),
          unit: 'ms',
          status: getApiStatus(calculateAverageApiTime(report.metrics)),
          icon: <Database size={16} />,
          threshold: { good: 200, warning: 1000 }
        }
      };
      
      setMetrics(processedMetrics);
      
      // Calculate overall status
      const statuses = Object.values(processedMetrics).map(m => m.status);
      if (statuses.some(s => s === 'poor' || s === 'critical')) {
        setOverallStatus('critical');
      } else if (statuses.some(s => s === 'needs-improvement' || s === 'warning')) {
        setOverallStatus('warning');
      } else if (statuses.every(s => s === 'good')) {
        setOverallStatus('excellent');
      } else {
        setOverallStatus('good');
      }
      
      // Generate optimization suggestions
      const newSuggestions = generateSuggestions(processedMetrics, report.recommendations);
      setSuggestions(newSuggestions);
      
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setIsRefreshing(false);
      markEnd('fetchMetrics');
      measure('MetricsFetchDuration', 'LiveDashboardPerformanceMetrics_fetchMetrics');
    }
  }, [latency, isConnected, dashboardLoading, markStart, markEnd, measure]);
  
  // Use ref to avoid recreating interval when fetchMetrics changes
  const fetchMetricsRef = useRef(fetchMetrics);
  fetchMetricsRef.current = fetchMetrics;
  
  // Initial load
  useEffect(() => {
    fetchMetricsRef.current();
  }, []); // Empty dependency array - only run on mount
  
  // Auto-refresh interval using ref to avoid dependency issues
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchMetricsRef.current();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);
  
  // Helper functions
  const getLatencyStatus = (latency) => {
    if (!latency) return 'good';
    if (latency < 100) return 'good';
    if (latency < 300) return 'needs-improvement';
    return 'poor';
  };
  
  const getApiStatus = (time) => {
    if (!time) return 'good';
    if (time < 200) return 'good';
    if (time < 1000) return 'needs-improvement';
    return 'poor';
  };
  
  const calculateAverageApiTime = (metrics) => {
    const apiMetrics = metrics.filter(m => m.name.startsWith('API_'));
    if (apiMetrics.length === 0) return 0;
    const sum = apiMetrics.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / apiMetrics.length);
  };
  
  const generateSuggestions = (metrics, recommendations) => {
    const suggestions = [];
    
    // Check each metric and add relevant suggestions
    Object.entries(metrics).forEach(([key, metric]) => {
      if (metric.status === 'poor' || metric.status === 'critical') {
        suggestions.push({
          priority: 'high',
          title: `Optimize ${metric.label}`,
          description: getMetricSuggestion(key, metric),
          metric: key
        });
      } else if (metric.status === 'needs-improvement' || metric.status === 'warning') {
        suggestions.push({
          priority: 'medium',
          title: `Improve ${metric.label}`,
          description: getMetricSuggestion(key, metric),
          metric: key
        });
      }
    });
    
    // Add general recommendations
    recommendations.forEach(rec => {
      suggestions.push({
        priority: 'low',
        title: 'General Optimization',
        description: rec
      });
    });
    
    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 5); // Limit to top 5 suggestions
  };
  
  const getMetricSuggestion = (key, metric) => {
    const suggestions = {
      lcp: 'Optimize image loading, reduce JavaScript blocking time, and use resource hints',
      fid: 'Reduce JavaScript execution time and break up long tasks',
      cls: 'Set explicit dimensions for images and embeds, avoid inserting content above existing content',
      ttfb: 'Optimize server response time, use CDN, enable compression',
      wsLatency: 'Check network connection, consider using a closer WebSocket endpoint',
      memory: 'Check for memory leaks, optimize component updates, use React.memo',
      refreshRate: 'Reduce dashboard complexity, optimize data fetching',
      apiResponseTime: 'Implement caching, optimize API queries, use pagination'
    };
    
    return suggestions[key] || `Current value: ${metric.value}${metric.unit}. Target: < ${metric.threshold.good}${metric.unit}`;
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent':
      case 'good': return 'green';
      case 'needs-improvement':
      case 'warning': return 'yellow';
      case 'poor':
      case 'critical': return 'red';
      default: return 'gray';
    }
  };
  
  const handleExportReport = () => {
    const report = performanceMonitor.generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <MetricsContainer
      height={height}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <MetricsHeader>
        <HeaderTitle>
          <Gauge size={24} color="#3B82F6" />
          <Typography variant="h5" weight="semibold">
            Dashboard Performance
          </Typography>
          <Badge 
            variant={overallStatus === 'excellent' || overallStatus === 'good' ? 'success' : 
                    overallStatus === 'warning' ? 'warning' : 'error'}
            size="sm"
          >
            {overallStatus.toUpperCase()}
          </Badge>
        </HeaderTitle>
        
        <HeaderActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMetrics}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportReport}
          >
            <Download size={16} />
          </Button>
        </HeaderActions>
      </MetricsHeader>
      
      <StatusIndicator>
        <StatusDot status={overallStatus} animated />
        <Typography variant="body2" color="secondary">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </Typography>
        {connectionQuality && (
          <>
            <Typography variant="body2" color="tertiary">•</Typography>
            <Typography variant="body2" color="secondary">
              Connection: {connectionQuality}
            </Typography>
          </>
        )}
      </StatusIndicator>
      
      <MetricsGrid>
        {Object.entries(metrics).map(([key, metric]) => (
          <MetricItem
            key={key}
            status={metric.status}
            updating={isRefreshing}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <MetricHeader>
              <MetricLabel>
                {metric.icon}
                <span>{metric.label}</span>
              </MetricLabel>
            </MetricHeader>
            
            <MetricValue>
              {typeof metric.value === 'number' 
                ? metric.value < 1 
                  ? metric.value.toFixed(3)
                  : metric.value.toFixed(0)
                : metric.value}
              <MetricUnit>{metric.unit}</MetricUnit>
            </MetricValue>
            
            <Progress
              value={(metric.value / metric.threshold.warning) * 100}
              max={100}
              color={getStatusColor(metric.status)}
              size="sm"
              showValue={false}
            />
          </MetricItem>
        ))}
      </MetricsGrid>
      
      {showChart && (
        <PerformanceChart>
          <Typography variant="body2" color="tertiary">
            Performance Timeline Chart
          </Typography>
        </PerformanceChart>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <OptimizationSuggestions>
          <Typography variant="h6" weight="medium" style={{ marginBottom: '1rem' }}>
            Optimization Suggestions
          </Typography>
          
          {suggestions.map((suggestion, index) => (
            <SuggestionItem key={index}>
              <SuggestionIcon priority={suggestion.priority}>
                {suggestion.priority === 'high' ? <AlertTriangle size={20} /> :
                 suggestion.priority === 'medium' ? <AlertCircle size={20} /> :
                 <Info size={20} />}
              </SuggestionIcon>
              
              <SuggestionContent>
                <SuggestionTitle>{suggestion.title}</SuggestionTitle>
                <SuggestionDescription>{suggestion.description}</SuggestionDescription>
              </SuggestionContent>
            </SuggestionItem>
          ))}
        </OptimizationSuggestions>
      )}
    </MetricsContainer>
  );
};

export default LiveDashboardPerformanceMetrics;