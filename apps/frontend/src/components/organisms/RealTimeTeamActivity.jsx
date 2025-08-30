/**
 * OMNIX AI - Real-Time Team Activity Feed
 * Live team member activity tracking and collaboration indicators
 * MGR-029: Real-time team activity indicators
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Activity,
  Eye,
  Edit3,
  BarChart3,
  Package,
  Settings,
  MessageCircle,
  Clock,
  MapPin,
  Zap,
  UserCheck,
  UserX,
  Coffee,
  Monitor,
  Smartphone,
  Globe,
  TrendingUp,
  Filter,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import useTeamActivityStore from '../../store/teamActivityStore';
import useWebSocketStore from '../../store/websocketStore';
import useUserStore from '../../store/userStore';
import { formatRelativeTime, formatDuration } from '../../utils/formatters';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const ActivityContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ActivityHeader = styled.div`
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

const FilterButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive'
})`
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : 'transparent'};
  color: ${({ isActive, theme }) => 
    isActive ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary.main : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${({ isActive, theme }) => 
      isActive ? theme.colors.primary.dark : theme.colors.background.elevated};
  }
`;

const ActivityContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TeamPresenceBar = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const PresenceGrid = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  align-items: center;
`;

const PresenceIndicator = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ status, theme }) => {
    switch (status) {
      case 'online': return `${theme.colors.status.success}15`;
      case 'away': return `${theme.colors.status.warning}15`;
      case 'busy': return `${theme.colors.status.error}15`;
      default: return `${theme.colors.neutral.subtle}15`;
    }
  }};
  border: 1px solid ${({ status, theme }) => {
    switch (status) {
      case 'online': return theme.colors.status.success;
      case 'away': return theme.colors.status.warning;
      case 'busy': return theme.colors.status.error;
      default: return theme.colors.neutral.border;
    }
  }};
`;

const PresenceAvatar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop)
})`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ status, theme }) => {
      switch (status) {
        case 'online': return theme.colors.status.success;
        case 'away': return theme.colors.status.warning;
        case 'busy': return theme.colors.status.error;
        default: return theme.colors.neutral.subtle;
      }
    }};
    border: 2px solid ${({ theme }) => theme.colors.background.paper};
    animation: ${({ status }) => status === 'online' ? css`${pulseAnimation} 2s infinite` : 'none'};
  }
`;

const PresenceName = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const ActivityList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.sm};
  
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

const ActivityItem = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme, priority }) => {
    switch (priority) {
      case 'critical': return theme.colors.status.error;
      case 'high': return theme.colors.status.warning;
      default: return theme.colors.neutral.border;
    }
  }};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.elevated};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'dashboard_view': return `${theme.colors.primary.main}20`;
      case 'inventory_update': return `${theme.colors.status.warning}20`;
      case 'analytics_view': return `${theme.colors.status.info}20`;
      case 'data_export': return `${theme.colors.status.success}20`;
      case 'settings_change': return `${theme.colors.neutral.subtle}20`;
      case 'collaboration': return `${theme.colors.primary.light}20`;
      default: return `${theme.colors.neutral.subtle}20`;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ type, theme }) => {
    switch (type) {
      case 'dashboard_view': return theme.colors.primary.main;
      case 'inventory_update': return theme.colors.status.warning;
      case 'analytics_view': return theme.colors.status.info;
      case 'data_export': return theme.colors.status.success;
      case 'settings_change': return theme.colors.text.secondary;
      case 'collaboration': return theme.colors.primary.light;
      default: return theme.colors.text.secondary;
    }
  }};
  flex-shrink: 0;
`;

const ActivityUser = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActivityDescription = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  margin-bottom: 4px;
`;

const ActivityMeta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`;

const MetaBadge = styled(Badge)`
  font-size: 0.65rem;
  padding: 2px 6px;
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const RealTimeTeamActivity = ({ 
  height = 400,
  showPresence = true,
  showFilters = true,
  maxActivities = 50 
}) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    teamMembers, 
    activities, 
    stats, 
    getOnlineMembers, 
    getRecentActivities,
    addActivity,
    updatePresence 
  } = useTeamActivityStore();
  
  const { isConnected } = useWebSocketStore();
  const { user } = useUserStore();

  // Filter activities based on selected filter
  const filteredActivities = useMemo(() => {
    if (selectedFilter === 'all') {
      return getRecentActivities(null, maxActivities);
    }
    return getRecentActivities(selectedFilter, maxActivities);
  }, [activities, selectedFilter, maxActivities]);

  // Get online team members
  const onlineMembers = useMemo(() => {
    return getOnlineMembers();
  }, [teamMembers]);

  // Activity type filters
  const filterOptions = [
    { key: 'all', label: 'All', icon: Activity },
    { key: 'dashboard_view', label: 'Dashboard', icon: Monitor },
    { key: 'inventory_update', label: 'Inventory', icon: Package },
    { key: 'analytics_view', label: 'Analytics', icon: BarChart3 },
    { key: 'collaboration', label: 'Collaboration', icon: MessageCircle }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'dashboard_view': return <Monitor size={16} />;
      case 'inventory_update': return <Package size={16} />;
      case 'analytics_view': return <BarChart3 size={16} />;
      case 'data_export': return <TrendingUp size={16} />;
      case 'settings_change': return <Settings size={16} />;
      case 'collaboration': return <MessageCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <ActivityContainer
      style={{ height }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ActivityHeader>
        <HeaderTitle>
          <Users size={20} />
          Team Activity
          <StatBadge variant={isConnected ? 'success' : 'error'} size="xs">
            {isConnected ? 'Live' : 'Offline'}
          </StatBadge>
        </HeaderTitle>

        <HeaderStats>
          <StatBadge variant="success" size="sm">
            <UserCheck size={12} />
            {stats.onlineMembers}
          </StatBadge>
          <StatBadge variant="primary" size="sm">
            <Activity size={12} />
            {stats.activitiesLast24h}
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
      </ActivityHeader>

      {showPresence && onlineMembers.length > 0 && (
        <TeamPresenceBar>
          <PresenceGrid>
            <AnimatePresence mode="popLayout">
              {onlineMembers.map((member) => (
                <PresenceIndicator
                  key={member.id}
                  status={member.presence.status}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  title={`${member.name} - ${member.presence.status} ${member.presence.statusMessage ? `(${member.presence.statusMessage})` : ''}`}
                >
                  <PresenceAvatar status={member.presence.status}>
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </PresenceAvatar>
                  <PresenceName>{member.name}</PresenceName>
                </PresenceIndicator>
              ))}
            </AnimatePresence>
          </PresenceGrid>
        </TeamPresenceBar>
      )}

      {showFilters && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--neutral-border)' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filterOptions.map((option) => (
              <FilterButton
                key={option.key}
                isActive={selectedFilter === option.key}
                onClick={() => setSelectedFilter(option.key)}
              >
                <option.icon size={12} />
                {option.label}
              </FilterButton>
            ))}
          </div>
        </div>
      )}

      <ActivityContent>
        <ActivityList>
          <AnimatePresence mode="popLayout">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  priority={activity.priority}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ActivityIcon type={activity.type}>
                    {getActivityIcon(activity.type)}
                  </ActivityIcon>
                  
                  <ActivityContent>
                    <ActivityHeader>
                      <ActivityUser>{activity.userName}</ActivityUser>
                      <ActivityTime>
                        <Clock size={10} />
                        {formatRelativeTime(activity.timestamp)}
                      </ActivityTime>
                    </ActivityHeader>
                    
                    <ActivityDescription>
                      {activity.action} {activity.details && `• ${activity.details}`}
                    </ActivityDescription>
                    
                    <ActivityMeta>
                      <MetaBadge variant="neutral" size="xs">
                        {activity.category}
                      </MetaBadge>
                      {activity.location && activity.location !== '/' && (
                        <MetaBadge variant="neutral" size="xs">
                          <MapPin size={8} />
                          {activity.location.replace('/', '')}
                        </MetaBadge>
                      )}
                      {activity.isCollaborative && (
                        <MetaBadge variant="primary" size="xs">
                          <MessageCircle size={8} />
                          Collaboration
                        </MetaBadge>
                      )}
                    </ActivityMeta>
                  </ActivityContent>
                </ActivityItem>
              ))
            ) : (
              <EmptyState>
                <Activity size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <div>No team activity yet</div>
                <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                  Activity will appear here when team members interact with the dashboard
                </div>
              </EmptyState>
            )}
          </AnimatePresence>
        </ActivityList>
      </ActivityContent>
    </ActivityContainer>
  );
};

export default RealTimeTeamActivity;