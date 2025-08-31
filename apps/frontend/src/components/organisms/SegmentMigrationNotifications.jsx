/**
 * OMNIX AI - Segment Migration Notifications Component
 * Real-time notifications for customer segment changes
 * STREAM-002: Live segment migration notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  ChevronRight,
  UserMinus,
  UserPlus,
  UserCheck,
  Zap,
  Target,
  Award,
  ShoppingBag,
  DollarSign,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import useCustomerBehaviorStore from '../../store/customerBehaviorStore';
import segmentMigrationService from '../../services/segmentMigrationService';
import { formatRelativeTime } from '../../utils/formatters';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
`;

const criticalPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
  }
`;

// Styled Components
const NotificationsContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 420px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral.border};
    border-radius: 2px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const NotificationCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme, severity }) => {
    switch (severity) {
      case 'critical': return theme.colors.status.error;
      case 'high': return theme.colors.status.warning;
      case 'positive': return theme.colors.status.success;
      default: return theme.colors.neutral.border;
    }
  }};
  position: relative;
  overflow: hidden;
  animation: ${slideIn} 0.3s ease-out;
  
  ${({ severity }) => severity === 'critical' && css`
    animation: ${slideIn} 0.3s ease-out, ${criticalPulse} 2s ease-in-out infinite;
  `}
  
  ${({ severity }) => severity === 'positive' && css`
    animation: ${slideIn} 0.3s ease-out, ${pulseGlow} 2s ease-in-out;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ theme, severity }) => {
      switch (severity) {
        case 'critical': return theme.colors.status.error;
        case 'high': return theme.colors.status.warning;
        case 'positive': return theme.colors.status.success;
        default: return theme.colors.primary.main;
      }
    }};
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1;
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, type }) => {
    switch (type) {
      case 'upgrade': return `${theme.colors.status.success}20`;
      case 'downgrade': return `${theme.colors.status.error}20`;
      case 'warning': return `${theme.colors.status.warning}20`;
      default: return `${theme.colors.primary.main}20`;
    }
  }};
  color: ${({ theme, type }) => {
    switch (type) {
      case 'upgrade': return theme.colors.status.success;
      case 'downgrade': return theme.colors.status.error;
      case 'warning': return theme.colors.status.warning;
      default: return theme.colors.primary.main;
    }
  }};
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    transform: scale(1.1);
  }
`;

const MigrationDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SegmentBadge = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
  font-weight: 500;
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'high_value': return theme.colors.status.success;
      case 'churning': return theme.colors.status.error;
      case 'at_risk': return theme.colors.status.warning;
      default: return theme.colors.primary.main;
    }
  }}20;
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'high_value': return theme.colors.status.success;
      case 'churning': return theme.colors.status.error;
      case 'at_risk': return theme.colors.status.warning;
      default: return theme.colors.primary.main;
    }
  }};
`;

const MigrationArrow = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NotificationMessage = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

const RecommendationsList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const RecommendationItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  }
`;

const RecommendationIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  flex-shrink: 0;
  margin-top: 2px;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const SummaryTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme, type }) => {
    switch (type) {
      case 'positive': return theme.colors.status.success;
      case 'negative': return theme.colors.status.error;
      case 'warning': return theme.colors.status.warning;
      default: return theme.colors.text.primary;
    }
  }};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SummaryLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Main Component
const SegmentMigrationNotifications = ({
  maxNotifications = 5,
  autoHideDelay = 10000,
  showSummary = true,
  onMigrationClick,
  onActionClick
}) => {
  const { segmentMigrations, activeMigrations } = useCustomerBehaviorStore();
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [stats, setStats] = useState({
    upgrades: 0,
    downgrades: 0,
    critical: 0,
    total: 0
  });

  // Process migrations into notifications
  useEffect(() => {
    const activeNotifications = segmentMigrations
      .filter(migration => !dismissedIds.has(migration.id))
      .slice(0, maxNotifications)
      .map(migration => ({
        ...migration,
        type: getNotificationType(migration),
        icon: getNotificationIcon(migration),
        displayTime: formatRelativeTime(migration.timestamp)
      }));

    setNotifications(activeNotifications);

    // Calculate statistics
    const newStats = segmentMigrations.reduce((acc, migration) => {
      acc.total++;
      if (migration.impact === 'positive' || migration.impact === 'highly_positive') {
        acc.upgrades++;
      } else if (migration.impact === 'negative' || migration.impact === 'highly_negative') {
        acc.downgrades++;
      }
      if (migration.severity === 'critical') {
        acc.critical++;
      }
      return acc;
    }, { upgrades: 0, downgrades: 0, critical: 0, total: 0 });

    setStats(newStats);
  }, [segmentMigrations, dismissedIds, maxNotifications]);

  // Auto-hide notifications
  useEffect(() => {
    if (autoHideDelay > 0) {
      const timers = notifications.map(notification => {
        if (notification.severity !== 'critical') {
          return setTimeout(() => {
            handleDismiss(notification.id);
          }, autoHideDelay);
        }
        return null;
      });

      return () => {
        timers.forEach(timer => timer && clearTimeout(timer));
      };
    }
  }, [notifications, autoHideDelay]);

  const getNotificationType = (migration) => {
    if (migration.impact === 'positive' || migration.impact === 'highly_positive') {
      return 'upgrade';
    } else if (migration.impact === 'negative' || migration.impact === 'highly_negative') {
      return 'downgrade';
    }
    return 'neutral';
  };

  const getNotificationIcon = (migration) => {
    const type = getNotificationType(migration);
    switch (type) {
      case 'upgrade':
        return <TrendingUp size={20} />;
      case 'downgrade':
        return <TrendingDown size={20} />;
      default:
        return <Users size={20} />;
    }
  };

  const handleDismiss = useCallback((id) => {
    setDismissedIds(prev => new Set([...prev, id]));
  }, []);

  const handleAction = useCallback((action, migration) => {
    if (onActionClick) {
      onActionClick(action, migration);
    }
    handleDismiss(migration.id);
  }, [onActionClick]);

  const handleViewDetails = useCallback((migration) => {
    if (onMigrationClick) {
      onMigrationClick(migration);
    }
  }, [onMigrationClick]);

  return (
    <>
      {showSummary && stats.total > 0 && (
        <NotificationsContainer>
          <SummaryCard>
            <SummaryTitle>
              <Target size={20} />
              Segment Migration Activity
            </SummaryTitle>
            <SummaryGrid>
              <SummaryItem>
                <SummaryValue type="positive">{stats.upgrades}</SummaryValue>
                <SummaryLabel>Upgrades</SummaryLabel>
              </SummaryItem>
              <SummaryItem>
                <SummaryValue type="negative">{stats.downgrades}</SummaryValue>
                <SummaryLabel>Downgrades</SummaryLabel>
              </SummaryItem>
              <SummaryItem>
                <SummaryValue type="warning">{stats.critical}</SummaryValue>
                <SummaryLabel>Critical</SummaryLabel>
              </SummaryItem>
              <SummaryItem>
                <SummaryValue>{stats.total}</SummaryValue>
                <SummaryLabel>Total</SummaryLabel>
              </SummaryItem>
            </SummaryGrid>
          </SummaryCard>
        </NotificationsContainer>
      )}

      <NotificationsContainer>
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              severity={notification.severity}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <NotificationHeader>
                <HeaderContent>
                  <NotificationIcon type={notification.type}>
                    {notification.icon}
                  </NotificationIcon>
                  <div>
                    <NotificationTitle>
                      Customer Segment Change
                    </NotificationTitle>
                    <NotificationTime>
                      {notification.displayTime}
                    </NotificationTime>
                  </div>
                </HeaderContent>
                <CloseButton onClick={() => handleDismiss(notification.id)}>
                  <X size={16} />
                </CloseButton>
              </NotificationHeader>

              <MigrationDetails>
                <SegmentBadge variant={notification.fromSegment}>
                  {notification.fromSegment || 'New'}
                </SegmentBadge>
                <MigrationArrow>
                  <ArrowRight size={16} />
                </MigrationArrow>
                <SegmentBadge variant={notification.toSegment}>
                  {notification.toSegment}
                </SegmentBadge>
              </MigrationDetails>

              <NotificationMessage>
                {notification.message}
              </NotificationMessage>

              {notification.recommendations && notification.recommendations.length > 0 && (
                <RecommendationsList>
                  {notification.recommendations.slice(0, 3).map((rec, index) => (
                    <RecommendationItem key={index}>
                      <RecommendationIcon>
                        <ChevronRight size={12} />
                      </RecommendationIcon>
                      <span>{rec}</span>
                    </RecommendationItem>
                  ))}
                </RecommendationsList>
              )}

              <NotificationActions>
                {notification.severity === 'critical' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAction('immediate_action', notification)}
                  >
                    Take Action
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(notification)}
                >
                  View Details
                </Button>
              </NotificationActions>
            </NotificationCard>
          ))}
        </AnimatePresence>
      </NotificationsContainer>
    </>
  );
};

export default SegmentMigrationNotifications;