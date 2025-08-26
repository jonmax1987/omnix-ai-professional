import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect, useCallback } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Avatar from '../atoms/Avatar';
import { useI18n } from '../../hooks/useI18n';

const urgentPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
`;

const criticalGlow = keyframes`
  0%, 100% {
    border-color: #ef4444;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  }
  50% {
    border-color: #dc2626;
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
  }
`;

const NotificationContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 2px solid ${props => props.theme.colors.red[500]};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: ${criticalGlow} 3s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.red[500]}, ${props => props.theme.colors.orange[500]}, ${props => props.theme.colors.red[600]});
    z-index: 1;
  }
`;

const CenterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.red[50]}, ${props => props.theme.colors.orange[50]});
  border-bottom: 1px solid ${props => props.theme.colors.red[200]};
  position: relative;
  z-index: 2;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const CriticalIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.red[500]}, ${props => props.theme.colors.red[600]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${props => props.theme.colors.red[500]}, ${props => props.theme.colors.red[600]});
    z-index: -1;
    animation: ${urgentPulse} 2s infinite;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const SeverityFilter = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const FilterChip = styled(motion.button)`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? getSeverityBackground(props.severity, props.theme) : 'transparent'};
  color: ${props => props.active ? getSeverityColor(props.severity, props.theme) : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  
  &:hover {
    background: ${props => getSeverityBackground(props.severity, props.theme)};
    color: ${props => getSeverityColor(props.severity, props.theme)};
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.background.elevated};
  }
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getSeverityColor(props.severity, props.theme)};
  line-height: 1;
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const AlertsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[2]} 0;
`;

const CriticalAlert = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  position: relative;
  
  &:hover {
    background: ${props => getSeverityBackground(props.severity, props.theme)};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.severity === 'critical' && css`
    background: linear-gradient(90deg, ${props.theme.colors.red[25]} 0%, transparent 100%);
    border-left: 4px solid ${props.theme.colors.red[500]};
  `}
  
  ${props => props.severity === 'high' && css`
    background: linear-gradient(90deg, ${props.theme.colors.orange[25]} 0%, transparent 100%);
    border-left: 4px solid ${props.theme.colors.orange[500]};
  `}
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    gap: ${props => props.theme.spacing[3]};
  }
`;

const AlertIcon = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => getSeverityGradient(props.severity, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  position: relative;
  
  ${props => props.severity === 'critical' && css`
    animation: ${urgentPulse} 2s infinite;
  `}
`;

const AlertContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const AlertTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.3;
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const AlertTime = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const AlertDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const AlertMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ImpactIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  
  ${props => props.impact === 'high' && css`
    color: ${props.theme.colors.red[600]};
    font-weight: ${props.theme.typography.fontWeight.medium};
  `}
`;

const AlertActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => getActionBorderColor(props.action, props.theme)};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => getActionBackground(props.action, props.theme)};
  color: ${props => getActionColor(props.action, props.theme)};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  
  &:hover {
    background: ${props => getActionHoverBackground(props.action, props.theme)};
    border-color: ${props => getActionHoverBorderColor(props.action, props.theme)};
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.text.tertiary};
`;

const FloatingBadge = styled(motion.div)`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.theme.colors.red[500]};
  animation: ${urgentPulse} 2s infinite;
`;

// Helper functions
const getSeverityColor = (severity, theme) => {
  const colors = {
    critical: theme.colors.red[600],
    high: theme.colors.orange[600],
    medium: theme.colors.yellow[600],
    low: theme.colors.blue[600]
  };
  return colors[severity] || theme.colors.gray[600];
};

const getSeverityBackground = (severity, theme) => {
  const backgrounds = {
    critical: theme.colors.red[100],
    high: theme.colors.orange[100],
    medium: theme.colors.yellow[100],
    low: theme.colors.blue[100]
  };
  return backgrounds[severity] || theme.colors.gray[100];
};

const getSeverityGradient = (severity, theme) => {
  const gradients = {
    critical: `linear-gradient(135deg, ${theme.colors.red[500]}, ${theme.colors.red[600]})`,
    high: `linear-gradient(135deg, ${theme.colors.orange[500]}, ${theme.colors.orange[600]})`,
    medium: `linear-gradient(135deg, ${theme.colors.yellow[500]}, ${theme.colors.yellow[600]})`,
    low: `linear-gradient(135deg, ${theme.colors.blue[500]}, ${theme.colors.blue[600]})`
  };
  return gradients[severity] || `linear-gradient(135deg, ${theme.colors.gray[400]}, ${theme.colors.gray[500]})`;
};

const getActionBackground = (action, theme) => {
  const backgrounds = {
    resolve: theme.colors.green[500],
    escalate: theme.colors.red[500],
    postpone: theme.colors.gray[400],
    investigate: theme.colors.blue[500]
  };
  return backgrounds[action] || theme.colors.background.secondary;
};

const getActionColor = (action, theme) => {
  const colors = {
    resolve: theme.colors.text.inverse,
    escalate: theme.colors.text.inverse,
    postpone: theme.colors.text.inverse,
    investigate: theme.colors.text.inverse
  };
  return colors[action] || theme.colors.text.primary;
};

const getActionBorderColor = (action, theme) => {
  const borders = {
    resolve: theme.colors.green[600],
    escalate: theme.colors.red[600],
    postpone: theme.colors.gray[500],
    investigate: theme.colors.blue[600]
  };
  return borders[action] || theme.colors.border.default;
};

const getActionHoverBackground = (action, theme) => {
  const hovers = {
    resolve: theme.colors.green[600],
    escalate: theme.colors.red[600],
    postpone: theme.colors.gray[500],
    investigate: theme.colors.blue[600]
  };
  return hovers[action] || theme.colors.background.elevated;
};

const getActionHoverBorderColor = (action, theme) => {
  const hovers = {
    resolve: theme.colors.green[700],
    escalate: theme.colors.red[700],
    postpone: theme.colors.gray[600],
    investigate: theme.colors.blue[700]
  };
  return hovers[action] || theme.colors.border.strong;
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const diff = Math.floor((now - timestamp) / 1000);
  
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const CriticalAlertsCenter = ({
  alerts = [],
  onAlertClick,
  onAlertAction,
  onRefresh,
  loading = false,
  showStats = true,
  autoRefresh = true,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock critical alerts data
  const defaultAlerts = [
    {
      id: 'alert-critical-1',
      severity: 'critical',
      title: 'System Outage - Payment Processing Down',
      description: 'Payment gateway is experiencing complete downtime. All transactions are failing. Revenue loss estimated at $2,000/minute.',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      category: 'system',
      impact: 'high',
      affectedUsers: 1247,
      estimatedLoss: 6000,
      source: 'Payment Monitor',
      actions: ['escalate', 'investigate', 'resolve'],
      assignee: 'DevOps Team'
    },
    {
      id: 'alert-critical-2',
      severity: 'critical',
      title: 'Inventory Stock-Out - iPhone 15 Pro',
      description: 'iPhone 15 Pro completely out of stock. 47 customers in queue, potential loss of $47,000 in sales.',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      category: 'inventory',
      impact: 'high',
      affectedProducts: 1,
      estimatedLoss: 47000,
      source: 'Inventory System',
      actions: ['resolve', 'postpone'],
      assignee: 'Procurement Team'
    },
    {
      id: 'alert-high-1',
      severity: 'high',
      title: 'Database Performance Degradation',
      description: 'Query response times increased by 400%. Customer experience severely impacted.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      category: 'performance',
      impact: 'medium',
      affectedUsers: 892,
      source: 'DB Monitor',
      actions: ['investigate', 'resolve'],
      assignee: 'Backend Team'
    },
    {
      id: 'alert-high-2',
      severity: 'high',
      title: 'Unusual Activity - Security Alert',
      description: 'Multiple failed login attempts detected from suspicious IPs. Potential security breach.',
      timestamp: new Date(Date.now() - 1000 * 60 * 22),
      category: 'security',
      impact: 'high',
      affectedUsers: 156,
      source: 'Security Monitor',
      actions: ['escalate', 'investigate'],
      assignee: 'Security Team'
    },
    {
      id: 'alert-high-3',
      severity: 'high',
      title: 'Supplier Delivery Delay',
      description: 'Samsung supplier reports 48-hour delay for Galaxy S24 shipment. Affects weekend sales.',
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      category: 'supply-chain',
      impact: 'medium',
      estimatedLoss: 15000,
      source: 'Supply Chain',
      actions: ['resolve', 'postpone'],
      assignee: 'Supply Team'
    }
  ];

  const currentAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  // Filter alerts based on severity
  const filteredAlerts = useMemo(() => {
    if (selectedSeverity === 'all') {
      return currentAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
    }
    return currentAlerts.filter(alert => alert.severity === selectedSeverity);
  }, [currentAlerts, selectedSeverity]);

  // Calculate statistics
  const stats = useMemo(() => {
    const critical = currentAlerts.filter(a => a.severity === 'critical').length;
    const high = currentAlerts.filter(a => a.severity === 'high').length;
    const totalAffected = currentAlerts.reduce((sum, a) => sum + (a.affectedUsers || 0), 0);
    const totalLoss = currentAlerts.reduce((sum, a) => sum + (a.estimatedLoss || 0), 0);
    
    return { critical, high, totalAffected, totalLoss };
  }, [currentAlerts]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      onRefresh?.();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  const handleAlertAction = useCallback((alert, action) => {
    onAlertAction?.(alert, action);
  }, [onAlertAction]);

  const severityFilters = [
    { id: 'all', label: 'All Critical', icon: 'alertTriangle' },
    { id: 'critical', label: 'Critical', icon: 'x' },
    { id: 'high', label: 'High', icon: 'warning' }
  ];

  return (
    <NotificationContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={className}
      {...props}
    >
      <CenterHeader>
        <HeaderLeft>
          <CriticalIcon
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Icon name="alert-triangle" size={18} />
          </CriticalIcon>
          <div>
            <Typography variant="h5" weight="semibold" color="red">
              Critical Alerts
            </Typography>
            <Typography variant="caption" color="secondary">
              Last updated {formatTimeAgo(lastUpdate)} ago
            </Typography>
          </div>
          {stats.critical > 0 && <FloatingBadge />}
        </HeaderLeft>

        <HeaderRight>
          <SeverityFilter>
            {severityFilters.map(filter => (
              <FilterChip
                key={filter.id}
                severity={filter.id === 'all' ? 'critical' : filter.id}
                active={selectedSeverity === filter.id}
                onClick={() => setSelectedSeverity(filter.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name={filter.icon} size={12} />
                {filter.label}
              </FilterChip>
            ))}
          </SeverityFilter>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            loading={loading}
          >
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </CenterHeader>

      {showStats && (
        <StatsRow>
          <StatCard whileHover={{ scale: 1.05 }}>
            <StatValue severity="critical">{stats.critical}</StatValue>
            <StatLabel>Critical</StatLabel>
          </StatCard>
          <StatCard whileHover={{ scale: 1.05 }}>
            <StatValue severity="high">{stats.high}</StatValue>
            <StatLabel>High Priority</StatLabel>
          </StatCard>
          <StatCard whileHover={{ scale: 1.05 }}>
            <StatValue>{stats.totalAffected}</StatValue>
            <StatLabel>Users Affected</StatLabel>
          </StatCard>
          <StatCard whileHover={{ scale: 1.05 }}>
            <StatValue severity="critical">${(stats.totalLoss / 1000).toFixed(0)}K</StatValue>
            <StatLabel>Est. Impact</StatLabel>
          </StatCard>
        </StatsRow>
      )}

      <AlertsList>
        {loading ? (
          <EmptyState>
            <Icon name="alert-triangle" size={48} />
            <Typography variant="body1" color="secondary">
              Loading critical alerts...
            </Typography>
          </EmptyState>
        ) : filteredAlerts.length === 0 ? (
          <EmptyState>
            <Icon name="shield" size={48} />
            <div>
              <Typography variant="h6" weight="medium">
                No critical alerts
              </Typography>
              <Typography variant="body2" color="secondary">
                All systems operating normally
              </Typography>
            </div>
          </EmptyState>
        ) : (
          filteredAlerts.map((alert, index) => (
            <CriticalAlert
              key={alert.id}
              severity={alert.severity}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              onClick={() => onAlertClick?.(alert)}
            >
              <AlertIcon
                severity={alert.severity}
                animate={alert.severity === 'critical' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: alert.severity === 'critical' ? Infinity : 0 }}
              >
                <Icon 
                  name={alert.severity === 'critical' ? 'x' : 'alertTriangle'} 
                  size={20} 
                />
              </AlertIcon>

              <AlertContent>
                <AlertHeader>
                  <div style={{ flex: 1 }}>
                    <AlertTitle>{alert.title}</AlertTitle>
                  </div>
                  <AlertTime>
                    <Icon name="clock" size={12} />
                    {formatTimeAgo(alert.timestamp)}
                  </AlertTime>
                </AlertHeader>

                <AlertDescription>{alert.description}</AlertDescription>

                <AlertMeta>
                  <Badge variant={alert.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                    {alert.category}
                  </Badge>
                  
                  {alert.assignee && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Avatar size="xs" name={alert.assignee} />
                      <Typography variant="caption" color="secondary">
                        {alert.assignee}
                      </Typography>
                    </div>
                  )}
                  
                  {alert.impact && (
                    <ImpactIndicator impact={alert.impact}>
                      <Icon name="trending-up" size={12} />
                      {alert.impact} impact
                    </ImpactIndicator>
                  )}
                  
                  <Typography variant="caption" color="secondary">
                    {alert.source}
                  </Typography>
                </AlertMeta>

                <AlertActions>
                  {alert.actions?.map(action => (
                    <ActionButton
                      key={action}
                      action={action}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAlertAction(alert, action);
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon 
                        name={
                          action === 'resolve' ? 'check' :
                          action === 'escalate' ? 'arrowUp' :
                          action === 'investigate' ? 'search' :
                          action === 'postpone' ? 'clock' : 'more'
                        } 
                        size={12} 
                      />
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </ActionButton>
                  ))}
                </AlertActions>
              </AlertContent>
            </CriticalAlert>
          ))
        )}
      </AlertsList>
    </NotificationContainer>
  );
};

export default CriticalAlertsCenter;