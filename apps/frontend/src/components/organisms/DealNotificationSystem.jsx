/**
 * OMNIX AI - Deal & Discount Notification System
 * AI-powered personalized deal alerts with smart targeting
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Percent,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Bell,
  BellOff,
  Settings,
  Filter,
  Zap,
  Target,
  Gift,
  AlertCircle,
  CheckCircle,
  Heart,
  Share2,
  ExternalLink,
  Calendar,
  Users,
  Sparkles,
  FlashIcon as Lightning
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService } from '../../services/notifications';
import { apiService } from '../../services/api';

const DealContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterChips = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.background.main};
  color: ${({ isActive, theme }) => 
    isActive ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ isActive, theme }) => 
      isActive ? 'white' : theme.colors.primary.main};
  }
`;

const DealsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const DealCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.main};
  border: 2px solid ${({ dealType, theme }) => {
    if (dealType === 'flash') return '#FF6B35';
    if (dealType === 'exclusive') return '#8B5CF6';
    if (dealType === 'personalized') return '#10B981';
    return theme.colors.neutral.border;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.large};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const DealBanner = styled.div`
  background: ${({ dealType }) => {
    if (dealType === 'flash') return 'linear-gradient(135deg, #FF6B35, #F7931E)';
    if (dealType === 'exclusive') return 'linear-gradient(135deg, #8B5CF6, #EC4899)';
    if (dealType === 'personalized') return 'linear-gradient(135deg, #10B981, #059669)';
    return 'linear-gradient(135deg, #3B82F6, #1E40AF)';
  }};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DealTypeIcon = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TimeRemaining = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const DealContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ProductInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProductImage = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.neutral.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const ProductBrand = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CurrentPrice = styled.span`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const OriginalPrice = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  text-decoration: line-through;
`;

const Discount = styled.div`
  background: ${({ theme }) => theme.colors.error.main};
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const DealFeatures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FeatureTag = styled.span`
  background: ${({ theme }) => theme.colors.primary.light}20;
  color: ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const AIInsight = styled.div`
  background: ${({ theme }) => theme.colors.neutral.light}40;
  border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const InsightText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
  font-style: italic;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main : 'transparent'};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? 'white' : theme.colors.primary.main};
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background: ${({ variant, theme }) => 
      variant === 'primary' ? theme.colors.primary.dark : `${theme.colors.primary.main}10`};
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DealNotificationSystem = ({ className }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notificationStats, setNotificationStats] = useState({
    sent: 0,
    clicked: 0,
    saved: 0
  });

  const { preferences, isNotificationEnabled, updateAnalytics } = useNotificationStore();

  const filters = [
    { id: 'all', label: 'All Deals', icon: Tag },
    { id: 'flash', label: 'Flash Sales', icon: Lightning },
    { id: 'personalized', label: 'For You', icon: Target },
    { id: 'exclusive', label: 'Exclusive', icon: Star },
    { id: 'trending', label: 'Trending', icon: TrendingUp }
  ];

  useEffect(() => {
    loadDeals();
    loadNotificationStats();
  }, [activeFilter]);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/deals/personalized', {
        params: { 
          filter: activeFilter,
          userId: 'current',
          includeAI: true
        }
      });
      setDeals(response.deals);
    } catch (error) {
      console.error('Failed to load deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const response = await apiService.get('/analytics/deal-notifications');
      setNotificationStats(response.stats);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const handleNotifyMe = useCallback(async (deal) => {
    try {
      await notificationService.sendLocalNotification('DEAL_ALERT', {
        id: deal.id,
        productName: deal.productName,
        discount: deal.discountPercentage,
        savings: deal.savings,
        dealType: deal.type,
        productId: deal.productId,
        dealId: deal.id,
        expiresAt: deal.expiresAt
      });

      updateAnalytics('delivered', { type: 'DEAL_ALERT' });
      
      // Update local stats
      setNotificationStats(prev => ({
        ...prev,
        sent: prev.sent + 1
      }));
    } catch (error) {
      console.error('Failed to send deal notification:', error);
    }
  }, [updateAnalytics]);

  const handleViewDeal = useCallback((deal) => {
    updateAnalytics('clicked', { type: 'DEAL_ALERT' });
    window.open(`/deals/${deal.id}?source=notification`, '_blank');
  }, [updateAnalytics]);

  const handleSaveDeal = useCallback(async (deal) => {
    try {
      await apiService.post('/deals/save', { dealId: deal.id });
      
      setNotificationStats(prev => ({
        ...prev,
        saved: prev.saved + 1
      }));
      
      // Show success feedback
      alert('Deal saved to your favorites!');
    } catch (error) {
      console.error('Failed to save deal:', error);
    }
  }, []);

  const handleShareDeal = useCallback((deal) => {
    if (navigator.share) {
      navigator.share({
        title: `${deal.discountPercentage}% off ${deal.productName}`,
        text: `Check out this great deal on OMNIX AI!`,
        url: `${window.location.origin}/deals/${deal.id}`
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/deals/${deal.id}`);
      alert('Deal link copied to clipboard!');
    }
  }, []);

  const getDealTypeIcon = (type) => {
    switch (type) {
      case 'flash': return Lightning;
      case 'exclusive': return Star;
      case 'personalized': return Target;
      case 'trending': return TrendingUp;
      default: return Tag;
    }
  };

  const getDealTypeName = (type) => {
    switch (type) {
      case 'flash': return 'Flash Sale';
      case 'exclusive': return 'Exclusive Deal';
      case 'personalized': return 'Just for You';
      case 'trending': return 'Trending Deal';
      default: return 'Special Deal';
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 1) return `${minutes}m left`;
    if (hours < 24) return `${hours}h ${minutes}m left`;
    
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  const isSystemActive = isNotificationEnabled('DEAL_ALERT');

  return (
    <DealContainer
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Tag size={24} />
          Smart Deal Alerts
        </Title>
        <HeaderActions>
          <div style={{ 
            color: isSystemActive ? '#10B981' : '#6B7280',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isSystemActive ? <Bell size={14} /> : <BellOff size={14} />}
            {isSystemActive ? 'Active' : 'Inactive'}
          </div>
        </HeaderActions>
      </Header>

      <FilterChips>
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <FilterChip
              key={filter.id}
              isActive={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              <Icon size={14} />
              {filter.label}
            </FilterChip>
          );
        })}
      </FilterChips>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Sparkles size={32} style={{ animation: 'pulse 2s infinite' }} />
          <p>Finding the best deals for you...</p>
        </div>
      ) : deals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
          <Gift size={48} style={{ marginBottom: '16px' }} />
          <h3>No deals available</h3>
          <p>Check back later for personalized offers!</p>
        </div>
      ) : (
        <>
          <DealsGrid>
            {deals.map((deal, index) => {
              const DealIcon = getDealTypeIcon(deal.type);
              const timeLeft = formatTimeRemaining(deal.expiresAt);
              
              return (
                <DealCard
                  key={deal.id}
                  dealType={deal.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <DealBanner dealType={deal.type}>
                    <DealTypeIcon>
                      <DealIcon size={14} />
                      {getDealTypeName(deal.type)}
                    </DealTypeIcon>
                    <TimeRemaining>
                      <Clock size={12} />
                      {timeLeft}
                    </TimeRemaining>
                  </DealBanner>
                  
                  <DealContent>
                    <ProductInfo>
                      <ProductImage>
                        {deal.productEmoji || '🛍️'}
                      </ProductImage>
                      <ProductDetails>
                        <ProductName>{deal.productName}</ProductName>
                        <ProductBrand>{deal.brand}</ProductBrand>
                      </ProductDetails>
                    </ProductInfo>
                    
                    <PriceInfo>
                      <CurrentPrice>${deal.salePrice}</CurrentPrice>
                      <OriginalPrice>${deal.originalPrice}</OriginalPrice>
                      <Discount>{deal.discountPercentage}% OFF</Discount>
                    </PriceInfo>
                    
                    <DealFeatures>
                      <FeatureTag>Save ${deal.savings}</FeatureTag>
                      {deal.freeShipping && <FeatureTag>Free Shipping</FeatureTag>}
                      {deal.limitedQuantity && <FeatureTag>Limited Stock</FeatureTag>}
                      {deal.memberExclusive && <FeatureTag>Member Only</FeatureTag>}
                    </DealFeatures>
                    
                    {deal.aiInsight && (
                      <AIInsight>
                        <InsightText>🤖 {deal.aiInsight}</InsightText>
                      </AIInsight>
                    )}
                    
                    <ActionButtons>
                      <ActionButton onClick={() => handleSaveDeal(deal)}>
                        <Heart size={14} />
                        Save
                      </ActionButton>
                      <ActionButton onClick={() => handleShareDeal(deal)}>
                        <Share2 size={14} />
                        Share
                      </ActionButton>
                      <ActionButton onClick={() => handleNotifyMe(deal)}>
                        <Bell size={14} />
                        Notify
                      </ActionButton>
                      <ActionButton variant="primary" onClick={() => handleViewDeal(deal)}>
                        <ExternalLink size={14} />
                        View Deal
                      </ActionButton>
                    </ActionButtons>
                    
                    <StatsRow>
                      <span>
                        <Users size={12} style={{ marginRight: '4px' }} />
                        {deal.claimedCount} people claimed
                      </span>
                      <span>
                        <Star size={12} style={{ marginRight: '4px' }} />
                        {deal.rating}/5 rating
                      </span>
                    </StatsRow>
                  </DealContent>
                </DealCard>
              );
            })}
          </DealsGrid>
          
          <StatsRow style={{ marginTop: '24px', paddingTop: '16px' }}>
            <span>Notifications sent: {notificationStats.sent}</span>
            <span>Deals clicked: {notificationStats.clicked}</span>
            <span>Deals saved: {notificationStats.saved}</span>
          </StatsRow>
        </>
      )}
    </DealContainer>
  );
};

export default DealNotificationSystem;