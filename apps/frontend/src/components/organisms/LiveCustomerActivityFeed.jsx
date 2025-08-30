/**
 * OMNIX AI - Live Customer Activity Feed
 * MGR-024: Live customer activity feed for managers
 * Displays real-time customer activities with WebSocket updates
 */

import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShoppingCart, 
  Eye, 
  Heart, 
  Search, 
  Navigation, 
  Clock,
  Activity,
  UserCheck,
  UserPlus,
  ArrowRight,
  Filter,
  TrendingUp,
  MapPin,
  Tag
} from 'lucide-react';
import useWebSocketStore from '../../store/websocketStore';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { formatRelativeTime, formatTime, capitalize } from '../../utils/formatters';

const FeedContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors.gradients.primary};
    opacity: ${({ isConnected }) => (isConnected ? 1 : 0.3)};
    transition: opacity 0.3s ease;
  }
`;

const FeedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const LiveIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ isLive }) => (isLive ? '#10b98120' : '#ef444420')};
  color: ${({ isLive }) => (isLive ? '#10b981' : '#ef4444')};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const Dot = styled(motion.span)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`;

const FilterControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const FilterButton = styled(Button)`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  
  ${({ active }) => active && `
    background: var(--colors-primary-main);
    color: white;
  `}
`;

const ActivityStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const StatItem = styled.div`
  text-align: center;
  
  .label {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 4px;
  }
  
  .value {
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ActivityList = styled.div`
  max-height: 500px;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing.sm};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.default};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.medium};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ color, theme }) => color || theme.colors.primary.main}20;
  color: ${({ color, theme }) => color || theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActivityTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
`;

const ActivityTime = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  flex-shrink: 0;
`;

const ActivityDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ActivityMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const MetadataItem = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  .icon {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }
`;

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All Activity', icon: Activity },
  { id: 'browsing', label: 'Browsing', icon: Eye },
  { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'social', label: 'Social', icon: Heart },
  { id: 'auth', label: 'Auth', icon: UserCheck }
];

const ACTIVITY_ICONS = {
  'product_view': Eye,
  'add_to_cart': ShoppingCart,
  'purchase': ShoppingCart,
  'search': Search,
  'wishlist_add': Heart,
  'login': UserCheck,
  'register': UserPlus,
  'navigation': Navigation,
  'checkout_start': ShoppingCart,
  'checkout_complete': ShoppingCart,
  'profile_update': UserCheck,
  'page_view': Eye,
  'category_browse': Navigation
};

const ACTIVITY_COLORS = {
  'product_view': '#3b82f6',
  'add_to_cart': '#f59e0b',
  'purchase': '#10b981',
  'search': '#8b5cf6',
  'wishlist_add': '#ec4899',
  'login': '#10b981',
  'register': '#06b6d4',
  'navigation': '#6b7280',
  'checkout_start': '#f59e0b',
  'checkout_complete': '#10b981',
  'profile_update': '#3b82f6',
  'page_view': '#6b7280',
  'category_browse': '#8b5cf6'
};

const LiveCustomerActivityFeed = ({ 
  maxItems = 50,
  autoRefresh = true,
  showFilters = true,
  showStats = true,
  onActivityClick
}) => {
  const { 
    isConnected, 
    realtimeData,
    subscribeToStream,
    unsubscribeFromStream 
  } = useWebSocketStore();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLive, setIsLive] = useState(false);
  const [activityStats, setActivityStats] = useState({
    totalToday: 0,
    browsing: 0,
    shopping: 0,
    activeUsers: 0
  });

  // Get customer activity data
  const customerActivity = realtimeData?.customerActivity || [];
  
  // Filter activities based on selected filter
  const filteredActivities = customerActivity
    .filter(activity => {
      if (activeFilter === 'all') return true;
      
      const activityCategory = getActivityCategory(activity.type || activity.action);
      return activityCategory === activeFilter;
    })
    .slice(0, maxItems);

  // Subscribe to customer activity stream
  useEffect(() => {
    if (!isConnected) return;
    
    const handleActivityUpdate = (data) => {
      setIsLive(true);
      
      // Update stats
      updateActivityStats(data.payload);
      
      // Reset live indicator after 5 seconds
      setTimeout(() => setIsLive(false), 5000);
    };
    
    const unsubscribe = subscribeToStream('customer_activity', handleActivityUpdate);
    
    return () => {
      unsubscribe();
      unsubscribeFromStream('customer_activity', handleActivityUpdate);
    };
  }, [isConnected, subscribeToStream, unsubscribeFromStream]);

  // Update activity statistics
  const updateActivityStats = useCallback((activity) => {
    setActivityStats(prev => ({
      ...prev,
      totalToday: prev.totalToday + 1,
      browsing: getActivityCategory(activity.type) === 'browsing' 
        ? prev.browsing + 1 
        : prev.browsing,
      shopping: getActivityCategory(activity.type) === 'shopping' 
        ? prev.shopping + 1 
        : prev.shopping,
      activeUsers: prev.activeUsers // This would be calculated differently in real app
    }));
  }, []);

  // Calculate activity statistics on mount
  useEffect(() => {
    if (customerActivity.length > 0) {
      const stats = customerActivity.reduce((acc, activity) => {
        const category = getActivityCategory(activity.type || activity.action);
        acc.totalToday++;
        if (category === 'browsing') acc.browsing++;
        if (category === 'shopping') acc.shopping++;
        return acc;
      }, { totalToday: 0, browsing: 0, shopping: 0, activeUsers: 0 });
      
      // Estimate active users (simplified)
      const uniqueUsers = new Set(customerActivity.map(a => a.userId || a.customerId));
      stats.activeUsers = uniqueUsers.size;
      
      setActivityStats(stats);
    }
  }, [customerActivity]);

  // Get activity category for filtering
  const getActivityCategory = (activityType) => {
    if (!activityType) return 'browsing';
    
    const browsing = ['product_view', 'page_view', 'navigation', 'category_browse'];
    const shopping = ['add_to_cart', 'purchase', 'checkout_start', 'checkout_complete'];
    const search = ['search'];
    const social = ['wishlist_add', 'review', 'rating'];
    const auth = ['login', 'register', 'profile_update'];
    
    if (browsing.includes(activityType)) return 'browsing';
    if (shopping.includes(activityType)) return 'shopping';
    if (search.includes(activityType)) return 'search';
    if (social.includes(activityType)) return 'social';
    if (auth.includes(activityType)) return 'auth';
    
    return 'browsing';
  };

  // Get icon for activity type
  const getActivityIcon = (activityType) => {
    return ACTIVITY_ICONS[activityType] || Activity;
  };

  // Get color for activity type
  const getActivityColor = (activityType) => {
    return ACTIVITY_COLORS[activityType] || '#6b7280';
  };

  // Format activity description
  const formatActivityDescription = (activity) => {
    const { type, action, details, productName, searchTerm, category } = activity;
    const activityType = type || action;
    
    switch (activityType) {
      case 'product_view':
        return `Viewed ${productName || 'a product'}`;
      case 'add_to_cart':
        return `Added ${productName || 'item'} to cart`;
      case 'purchase':
        return `Purchased ${productName || 'items'} for $${details?.amount || '0.00'}`;
      case 'search':
        return `Searched for "${searchTerm || details?.query || 'products'}"`;
      case 'wishlist_add':
        return `Added ${productName || 'item'} to wishlist`;
      case 'category_browse':
        return `Browsed ${category || details?.category || 'products'}`;
      case 'login':
        return 'Logged in to account';
      case 'register':
        return 'Created new account';
      default:
        return details?.description || `Performed ${activityType}`;
    }
  };

  return (
    <FeedContainer
      isConnected={isConnected}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FeedHeader>
        <Title>
          <Users size={24} />
          Live Customer Activity
        </Title>
        <Controls>
          <LiveIndicator isLive={isLive}>
            <Dot
              animate={{ scale: isLive ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {isLive ? 'LIVE' : isConnected ? 'CONNECTED' : 'OFFLINE'}
          </LiveIndicator>
          <Badge variant="neutral">
            {filteredActivities.length} activities
          </Badge>
        </Controls>
      </FeedHeader>

      {showStats && (
        <ActivityStats>
          <StatItem>
            <div className="label">Today</div>
            <div className="value">{activityStats.totalToday}</div>
          </StatItem>
          <StatItem>
            <div className="label">Browsing</div>
            <div className="value">{activityStats.browsing}</div>
          </StatItem>
          <StatItem>
            <div className="label">Shopping</div>
            <div className="value">{activityStats.shopping}</div>
          </StatItem>
          <StatItem>
            <div className="label">Active Users</div>
            <div className="value">{activityStats.activeUsers}</div>
          </StatItem>
        </ActivityStats>
      )}

      {showFilters && (
        <FilterControls>
          {ACTIVITY_FILTERS.map(filter => {
            const IconComponent = filter.icon;
            return (
              <FilterButton
                key={filter.id}
                variant={activeFilter === filter.id ? 'primary' : 'tertiary'}
                size="sm"
                active={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                <IconComponent size={14} />
                {filter.label}
              </FilterButton>
            );
          })}
        </FilterControls>
      )}

      {filteredActivities.length > 0 ? (
        <ActivityList>
          <AnimatePresence mode="popLayout">
            {filteredActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type || activity.action);
              const color = getActivityColor(activity.type || activity.action);
              const description = formatActivityDescription(activity);
              
              return (
                <ActivityItem
                  key={activity.id || `${activity.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  onClick={() => onActivityClick?.(activity)}
                >
                  <ActivityIcon color={color}>
                    <IconComponent size={20} />
                  </ActivityIcon>
                  
                  <ActivityContent>
                    <ActivityHeader>
                      <ActivityTitle>
                        {activity.customerName || `Customer ${activity.customerId || 'Unknown'}`}
                      </ActivityTitle>
                      <ActivityTime>
                        {formatRelativeTime(activity.timestamp)}
                      </ActivityTime>
                    </ActivityHeader>
                    
                    <ActivityDescription>
                      {description}
                    </ActivityDescription>
                    
                    <ActivityMetadata>
                      {activity.location && (
                        <MetadataItem>
                          <MapPin size={12} />
                          {activity.location}
                        </MetadataItem>
                      )}
                      {activity.deviceType && (
                        <MetadataItem>
                          <Tag size={12} />
                          {capitalize(activity.deviceType)}
                        </MetadataItem>
                      )}
                      {activity.value && (
                        <MetadataItem>
                          <TrendingUp size={12} />
                          ${activity.value}
                        </MetadataItem>
                      )}
                    </ActivityMetadata>
                  </ActivityContent>
                  
                  <ArrowRight size={16} opacity={0.5} />
                </ActivityItem>
              );
            })}
          </AnimatePresence>
        </ActivityList>
      ) : (
        <EmptyState>
          <div className="icon">
            <Users size={48} />
          </div>
          <div>No customer activity</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {isConnected 
              ? 'Waiting for customer activity updates...' 
              : 'Connect to WebSocket to see live activity'}
          </div>
        </EmptyState>
      )}
    </FeedContainer>
  );
};

export default LiveCustomerActivityFeed;