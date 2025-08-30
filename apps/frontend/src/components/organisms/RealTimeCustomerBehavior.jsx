/**
 * OMNIX AI - Real-Time Customer Behavior Tracking
 * Live customer behavior analysis and pattern detection
 * STREAM-001: Real-time customer behavior tracking
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Activity,
  Eye,
  ShoppingCart,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  AlertTriangle,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  Heart
} from 'lucide-react';
import useCustomerBehaviorStore from '../../store/customerBehaviorStore';
import useWebSocketStore from '../../store/websocketStore';
import { formatRelativeTime, formatNumber } from '../../utils/formatters';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
`;

const BehaviorContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const BehaviorHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const HeaderStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const StatBadge = styled(Badge)`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const BehaviorContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${({ type, theme }) => {
    switch (type) {
      case 'success': return theme.colors.status.success;
      case 'error': return theme.colors.status.error;
      case 'warning': return theme.colors.status.warning;
      case 'primary': return theme.colors.primary.main;
      default: return theme.colors.text.primary;
    }
  }};
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BehaviorTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  background: ${({ theme }) => theme.colors.background.elevated};
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive'
})`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.text.secondary};
  border-bottom: 2px solid ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : 'transparent'};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.paper};
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};

  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral.subtle};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral.border};
    border-radius: 2px;
  }
`;

const BehaviorList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const BehaviorItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme, priority }) => {
    switch (priority) {
      case 'high': return theme.colors.status.warning;
      case 'critical': return theme.colors.status.error;
      default: return theme.colors.neutral.border;
    }
  }};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.elevated};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const BehaviorIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'page_view': return `${theme.colors.primary.main}20`;
      case 'product_view': return `${theme.colors.status.info}20`;
      case 'purchase': return `${theme.colors.status.success}20`;
      case 'cart_add': return `${theme.colors.status.warning}20`;
      case 'search': return `${theme.colors.neutral.subtle}20`;
      default: return `${theme.colors.neutral.subtle}20`;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ type, theme }) => {
    switch (type) {
      case 'page_view': return theme.colors.primary.main;
      case 'product_view': return theme.colors.status.info;
      case 'purchase': return theme.colors.status.success;
      case 'cart_add': return theme.colors.status.warning;
      case 'search': return theme.colors.text.secondary;
      default: return theme.colors.text.secondary;
    }
  }};
  flex-shrink: 0;
  animation: ${({ isNew }) => isNew ? `${pulseAnimation} 2s ease-in-out` : 'none'};
`;

const BehaviorDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const BehaviorAction = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`;

const BehaviorMeta = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`;

const InsightsList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InsightCard = styled.div`
  background: ${({ theme }) => theme.colors.background.elevated};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InsightTitle = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InsightDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const PatternList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PatternItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const PatternName = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const PatternCount = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const RealTimeCustomerBehavior = ({ 
  height = 500,
  showMetrics = true,
  showTabs = true,
  maxBehaviors = 50 
}) => {
  const [activeTab, setActiveTab] = useState('live');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    behaviors,
    insights,
    analytics,
    behaviorAlerts,
    getMetrics,
    generateInsights,
    trackBehavior 
  } = useCustomerBehaviorStore();
  
  const { isConnected } = useWebSocketStore();

  // Generate insights periodically
  useEffect(() => {
    generateInsights();
    const interval = setInterval(generateInsights, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [generateInsights]);

  // Get real-time metrics
  const metrics = useMemo(() => getMetrics(), [analytics, behaviors]);

  // Filter behaviors for display
  const displayBehaviors = useMemo(() => {
    return behaviors.slice(0, maxBehaviors);
  }, [behaviors, maxBehaviors]);

  // Get behavior icon
  const getBehaviorIcon = (type) => {
    switch (type) {
      case 'page_view': return <Eye size={16} />;
      case 'product_view': return <Target size={16} />;
      case 'purchase': return <ShoppingCart size={16} />;
      case 'cart_add': return <ShoppingCart size={16} />;
      case 'search': return <Search size={16} />;
      case 'review': return <Heart size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    generateInsights();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const tabs = [
    { key: 'live', label: 'Live Feed', icon: Activity },
    { key: 'insights', label: 'Insights', icon: TrendingUp },
    { key: 'patterns', label: 'Patterns', icon: BarChart3 },
    { key: 'alerts', label: 'Alerts', icon: AlertTriangle }
  ];

  return (
    <BehaviorContainer
      style={{ height }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BehaviorHeader>
        <HeaderTitle>
          <Users size={20} />
          Customer Behavior
          <StatBadge variant={isConnected ? 'success' : 'error'} size="xs">
            {isConnected ? 'Live' : 'Offline'}
          </StatBadge>
        </HeaderTitle>

        <HeaderStats>
          <StatBadge variant="primary" size="sm">
            <Activity size={12} />
            {metrics.activeBehaviors}
          </StatBadge>
          <StatBadge variant="success" size="sm">
            <Users size={12} />
            {metrics.uniqueCustomersCount}
          </StatBadge>
        </HeaderStats>

        <HeaderControls>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        </HeaderControls>
      </BehaviorHeader>

      {showMetrics && (
        <MetricsGrid>
          <MetricCard>
            <MetricValue type="primary">{metrics.activeJourneys}</MetricValue>
            <MetricLabel>Active Sessions</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue type="success">{formatNumber(metrics.conversionRate, 1)}%</MetricValue>
            <MetricLabel>Conversion Rate</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue type="warning">{formatNumber(metrics.bounceRate, 1)}%</MetricValue>
            <MetricLabel>Bounce Rate</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{Math.round(metrics.avgTimeOnSite / 60000)}m</MetricValue>
            <MetricLabel>Avg Session</MetricLabel>
          </MetricCard>
        </MetricsGrid>
      )}

      {showTabs && (
        <BehaviorTabs>
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              isActive={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.key === 'alerts' && behaviorAlerts.length > 0 && (
                <Badge variant="error" size="xs">{behaviorAlerts.length}</Badge>
              )}
            </Tab>
          ))}
        </BehaviorTabs>
      )}

      <BehaviorContent>
        <TabContent>
          {activeTab === 'live' && (
            <BehaviorList>
              <AnimatePresence mode="popLayout">
                {displayBehaviors.length > 0 ? (
                  displayBehaviors.map((behavior, index) => (
                    <BehaviorItem
                      key={behavior.id}
                      priority={behavior.is_purchase ? 'high' : 'normal'}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <BehaviorIcon type={behavior.type} isNew={index < 3}>
                        {getBehaviorIcon(behavior.type)}
                      </BehaviorIcon>
                      
                      <BehaviorDetails>
                        <BehaviorAction>{behavior.action}</BehaviorAction>
                        <BehaviorMeta>
                          <Clock size={10} />
                          {formatRelativeTime(behavior.timestamp)}
                          
                          {behavior.device && (
                            <>
                              {behavior.device === 'mobile' ? <Smartphone size={10} /> : <Monitor size={10} />}
                              {behavior.device}
                            </>
                          )}
                          
                          {behavior.location && (
                            <>
                              <MapPin size={10} />
                              {behavior.location}
                            </>
                          )}
                          
                          {behavior.value > 0 && (
                            <Badge variant="success" size="xs">
                              ${behavior.value}
                            </Badge>
                          )}
                          
                          {behavior.is_new_customer && (
                            <Badge variant="primary" size="xs">
                              New Customer
                            </Badge>
                          )}
                        </BehaviorMeta>
                      </BehaviorDetails>
                    </BehaviorItem>
                  ))
                ) : (
                  <EmptyState>
                    <Activity size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <div>No customer behavior data yet</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                      Real-time behavior tracking will appear here
                    </div>
                  </EmptyState>
                )}
              </AnimatePresence>
            </BehaviorList>
          )}

          {activeTab === 'insights' && (
            <InsightsList>
              {insights.trends.length > 0 ? (
                insights.trends.map((trend, index) => (
                  <InsightCard key={index}>
                    <InsightHeader>
                      <TrendingUp size={16} color={trend.direction === 'up' ? '#4CAF50' : '#F44336'} />
                      <InsightTitle>Activity Trend</InsightTitle>
                    </InsightHeader>
                    <InsightDescription>{trend.description}</InsightDescription>
                  </InsightCard>
                ))
              ) : (
                <EmptyState>
                  <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <div>No insights available yet</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                    Insights will be generated as behavior data accumulates
                  </div>
                </EmptyState>
              )}

              {insights.topBehaviors.length > 0 && (
                <InsightCard>
                  <InsightHeader>
                    <PieChart size={16} />
                    <InsightTitle>Top Behaviors (24h)</InsightTitle>
                  </InsightHeader>
                  <PatternList>
                    {insights.topBehaviors.map((behavior, index) => (
                      <PatternItem key={index}>
                        <PatternName>{behavior.type.replace('_', ' ').toUpperCase()}</PatternName>
                        <PatternCount>{behavior.count} ({behavior.percentage.toFixed(1)}%)</PatternCount>
                      </PatternItem>
                    ))}
                  </PatternList>
                </InsightCard>
              )}
            </InsightsList>
          )}

          {activeTab === 'patterns' && (
            <InsightsList>
              {insights.emergingPatterns.length > 0 ? (
                insights.emergingPatterns.map((pattern, index) => (
                  <InsightCard key={index}>
                    <InsightHeader>
                      <Target size={16} />
                      <InsightTitle>{pattern.type.replace('_', ' ').toUpperCase()}</InsightTitle>
                    </InsightHeader>
                    <InsightDescription>{pattern.description}</InsightDescription>
                    {pattern.data && pattern.type === 'peak_hours' && (
                      <PatternList style={{ marginTop: '12px' }}>
                        {pattern.data.map((hour, idx) => (
                          <PatternItem key={idx}>
                            <PatternName>{hour.hour}:00</PatternName>
                            <PatternCount>{hour.count} events</PatternCount>
                          </PatternItem>
                        ))}
                      </PatternList>
                    )}
                  </InsightCard>
                ))
              ) : (
                <EmptyState>
                  <Target size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <div>No patterns detected yet</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                    Behavioral patterns will be identified over time
                  </div>
                </EmptyState>
              )}
            </InsightsList>
          )}

          {activeTab === 'alerts' && (
            <BehaviorList>
              <AnimatePresence mode="popLayout">
                {behaviorAlerts.length > 0 ? (
                  behaviorAlerts.map((alert) => (
                    <BehaviorItem
                      key={alert.id}
                      priority={alert.severity === 'warning' ? 'high' : 'critical'}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <BehaviorIcon type="alert" isNew>
                        <AlertTriangle size={16} />
                      </BehaviorIcon>
                      
                      <BehaviorDetails>
                        <BehaviorAction>{alert.message}</BehaviorAction>
                        <BehaviorMeta>
                          <Clock size={10} />
                          {formatRelativeTime(alert.timestamp)}
                          
                          <Badge variant={alert.severity === 'warning' ? 'warning' : 'error'} size="xs">
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </BehaviorMeta>
                      </BehaviorDetails>
                    </BehaviorItem>
                  ))
                ) : (
                  <EmptyState>
                    <AlertTriangle size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <div>No behavior alerts</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                      Behavior-based alerts will appear here when detected
                    </div>
                  </EmptyState>
                )}
              </AnimatePresence>
            </BehaviorList>
          )}
        </TabContent>
      </BehaviorContent>
    </BehaviorContainer>
  );
};

export default RealTimeCustomerBehavior;