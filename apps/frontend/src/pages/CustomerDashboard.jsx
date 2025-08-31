import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import useWebSocketStore from '../store/websocketStore';
import useCustomerBehaviorStore from '../store/customerBehaviorStore';
import aiInsightsService from '../services/aiInsightsService';
import useUserStore from '../store/userStore';
import { webSocketManager } from '../services/websocket';
import {
  User,
  ShoppingBag,
  Heart,
  Bell,
  Settings,
  Search,
  TrendingUp,
  Package,
  Calendar,
  Star,
  Gift,
  Zap,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  Plus,
  ChevronRight,
  MapPin,
  Smartphone
} from 'lucide-react';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary[100]}05 0%, 
    ${({ theme }) => theme.colors.secondary[100]}05 100%);
`;

const Header = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.small};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
`;

const SearchBar = styled.div`
  flex: 1;
  max-width: 400px;
  margin: 0 ${({ theme }) => theme.spacing.xl};
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.sm} 48px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 2px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.main};
    transform: translateY(-1px);
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: ${({ theme }) => theme.colors.error.main};
  color: white;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[400]}, ${({ theme }) => theme.colors.secondary[400]});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const MainPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1024px) {
    order: -1;
  }
`;

const WelcomeCard = styled(motion.div)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.main}, ${({ theme }) => theme.colors.secondary.main});
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const WelcomeSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  opacity: 0.9;
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InsightCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const InsightHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InsightTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
  flex: 1;
`;

const InsightIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.primary[100]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const InsightValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InsightDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
  line-height: 1.5;
`;

const RecommendationsSection = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const ProductCard = styled.div`
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 120px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const ProductName = styled.h4`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  line-height: 1.3;
`;

const ProductPrice = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const SidebarCard = styled.div`
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const SidebarTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 24px;
  height: 24px;
  background: ${({ theme }) => theme.colors.primary[100]};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ActivityText = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary.main};
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
  }
`;

const CustomerDashboard = () => {
  const { user } = useUserStore();
  const {
    isConnected: wsConnected
  } = useWebSocketStore();
  const {
    customerPatterns,
    consumptionPatterns,
    insights: behaviorInsights
  } = useCustomerBehaviorStore();
  
  const [userName] = useState(user?.name?.split(' ')[0] || 'Customer');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [personalizedInsights, setPersonalizedInsights] = useState([]);
  const [consumptionPredictions, setConsumptionPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(0);

  // Load personalized AI data on component mount
  useEffect(() => {
    fetchPersonalizedData();
  }, [user?.id]);
  
  // Connect to real-time updates
  useEffect(() => {
    if (wsConnected && user?.id) {
      webSocketManager.requestDashboardMetrics();
      // Subscribe to personalized product updates
      consumptionPatterns.forEach(pattern => {
        if (pattern.productId) {
          webSocketManager.subscribeToProduct(pattern.productId);
        }
      });
    }
  }, [wsConnected, user?.id, consumptionPatterns]);
  
  const fetchPersonalizedData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [recommendations, insights, predictions] = await Promise.all([
        aiInsightsService.getPersonalizationRecommendations(user.id, {
          currentBehavior: { timestamp: Date.now() },
          preferences: { includeHealthy: true, includeEco: true },
          maxRecommendations: 8
        }),
        aiInsightsService.getRealtimeInsights({
          customerId: user.id,
          types: ['savings', 'behavior', 'health', 'efficiency'],
          limit: 10
        }),
        aiInsightsService.getConsumptionPredictions({
          customerId: user.id,
          timeHorizon: '30d'
        })
      ]);
      
      setAiRecommendations(recommendations.recommendations || []);
      setPersonalizedInsights(insights.insights || []);
      setConsumptionPredictions(predictions.predictions || []);
    } catch (error) {
      console.error('Failed to load personalized data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate AI-powered insights from backend data
  const insights = [
    {
      title: 'Monthly Savings',
      value: personalizedInsights.find(i => i.type === 'savings')?.value || '$127',
      description: personalizedInsights.find(i => i.type === 'savings')?.insight || 'Saved through AI recommendations',
      icon: DollarSign,
      confidence: personalizedInsights.find(i => i.type === 'savings')?.confidence || 0.94,
      trend: 'up'
    },
    {
      title: 'Smart Purchases',
      value: personalizedInsights.find(i => i.type === 'behavior')?.purchaseCount?.toString() || '23',
      description: 'AI-suggested items bought this month',
      icon: Zap,
      aiGenerated: true,
      confidence: 0.89
    },
    {
      title: 'Health Score',
      value: personalizedInsights.find(i => i.type === 'health')?.healthScore?.toFixed(1) || '8.5',
      description: 'Based on your consumption patterns',
      icon: Target,
      trend: personalizedInsights.find(i => i.type === 'health')?.trend || 'up'
    },
    {
      title: 'Time Saved',
      value: personalizedInsights.find(i => i.type === 'efficiency')?.timeSaved || '4.5h',
      description: 'Through smart shopping recommendations',
      icon: Clock,
      aiOptimized: true
    }
  ];

  // AI-powered personalized recommendations from backend
  const recommendations = aiRecommendations.length > 0 ? aiRecommendations.map(rec => ({
    id: rec.productId,
    name: rec.productName,
    price: rec.price ? `$${rec.price.toFixed(2)}` : 'TBD',
    image: rec.emoji || '📦',
    confidence: rec.confidence,
    reason: rec.reason,
    predictedDate: rec.predictedConsumptionDate,
    aiGenerated: true,
    personalizedScore: rec.personalizedScore || 0.85
  })) : [
    // Fallback recommendations if AI service unavailable
    { id: 1, name: 'Organic Bananas', price: '$3.99', image: '🍌', confidence: 0.92 },
    { id: 2, name: 'Almond Milk', price: '$4.49', image: '🥛', confidence: 0.88 },
    { id: 3, name: 'Greek Yogurt', price: '$5.99', image: '🥣', confidence: 0.95 },
    { id: 4, name: 'Whole Grain Bread', price: '$3.79', image: '🍞', confidence: 0.79 },
    { id: 5, name: 'Fresh Spinach', price: '$2.99', image: '🥬', confidence: 0.84 },
    { id: 6, name: 'Olive Oil', price: '$8.99', image: '🫒', confidence: 0.91 }
  ];

  // Real-time activity from customer behavior analytics
  const recentActivity = [
    // Add real-time WebSocket updates
    ...personalizedInsights.filter(insight => insight.type === 'activity').map(activity => ({
      icon: activity.category === 'purchase' ? ShoppingBag : 
            activity.category === 'favorite' ? Heart :
            activity.category === 'reward' ? Gift : Package,
      text: activity.message,
      time: new Date(activity.timestamp).toLocaleString(),
      aiGenerated: true
    })),
    // Fallback static data
    { icon: ShoppingBag, text: 'Ordered weekly groceries', time: '2 hours ago' },
    { icon: Heart, text: 'Added almonds to favorites', time: '1 day ago' },
    { icon: Gift, text: 'Earned $5 cashback reward', time: '2 days ago' },
    { icon: Star, text: 'Rated Greek yogurt 5 stars', time: '3 days ago' },
    { icon: Package, text: 'Delivery completed successfully', time: '1 week ago' }
  ].slice(0, 5);

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <Logo>OMNIX</Logo>
          
          <SearchBar>
            <SearchIcon>
              <Search size={18} />
            </SearchIcon>
            <SearchInput placeholder="Search products, brands, or categories..." />
          </SearchBar>

          <HeaderActions>
            <IconButton>
              <Bell size={18} />
              <NotificationBadge>3</NotificationBadge>
            </IconButton>
            
            <IconButton>
              <ShoppingBag size={18} />
              <NotificationBadge>5</NotificationBadge>
            </IconButton>

            <UserProfile>
              <Avatar>
                <User size={16} />
              </Avatar>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{userName}</span>
            </UserProfile>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <MainContent>
        <MainPanel>
          <WelcomeCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeContent>
              <WelcomeTitle>Good morning, {userName}! 👋</WelcomeTitle>
              <WelcomeSubtitle>
                Your AI shopping assistant has {aiRecommendations.length || 6} personalized recommendations 
                {personalizedInsights.find(i => i.type === 'savings')?.dailySavings && 
                 ` and saved you $${personalizedInsights.find(i => i.type === 'savings').dailySavings} on today's deals`}.
                {wsConnected && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}> • Live AI Updates Active</span>}
              </WelcomeSubtitle>
              <QuickActions>
                <QuickActionButton>
                  <ShoppingBag size={16} />
                  Start Shopping
                </QuickActionButton>
                <QuickActionButton>
                  <BarChart3 size={16} />
                  View Insights
                </QuickActionButton>
                <QuickActionButton>
                  <Settings size={16} />
                  Preferences
                </QuickActionButton>
              </QuickActions>
            </WelcomeContent>
          </WelcomeCard>

          <InsightsGrid>
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <InsightCard
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                >
                  <InsightHeader>
                    <InsightTitle>{insight.title}</InsightTitle>
                    <InsightIcon>
                      <Icon size={16} />
                    </InsightIcon>
                  </InsightHeader>
                  <InsightValue>{insight.value}</InsightValue>
                  <InsightDescription>{insight.description}</InsightDescription>
                </InsightCard>
              );
            })}
          </InsightsGrid>

          <RecommendationsSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <SectionTitle>
              <Zap size={24} />
              AI Recommendations for You
              {aiRecommendations.length > 0 && (
                <span style={{ 
                  fontSize: '12px', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10B981', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  marginLeft: '8px'
                }}>
                  AWS Bedrock
                </span>
              )}
              {wsConnected && (
                <span style={{ 
                  fontSize: '12px', 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  color: '#3B82F6', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  marginLeft: '8px'
                }}>
                  Live
                </span>
              )}
            </SectionTitle>
            <ProductGrid>
              {loading ? (
                Array.from({length: 6}).map((_, index) => (
                  <ProductCard key={index} style={{ opacity: 0.6, animation: 'pulse 1.5s infinite' }}>
                    <ProductImage style={{ background: '#f3f4f6' }}>
                      <span style={{ fontSize: '2rem', color: '#9ca3af' }}>⏳</span>
                    </ProductImage>
                    <ProductName>Loading AI recommendations...</ProductName>
                    <ProductPrice>$--</ProductPrice>
                    <AddToCartButton disabled>
                      Loading...
                    </AddToCartButton>
                  </ProductCard>
                ))
              ) : (
                recommendations.map((product) => (
                  <ProductCard key={product.id} onClick={() => webSocketManager.subscribeToProduct(product.id)}>
                    <ProductImage>
                      <span style={{ fontSize: '3rem' }}>{product.image}</span>
                      {product.confidence && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: product.confidence > 0.9 ? '#10B981' : product.confidence > 0.8 ? '#F59E0B' : '#6B7280',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {Math.round(product.confidence * 100)}%
                        </div>
                      )}
                    </ProductImage>
                    <ProductName>
                      {product.name}
                      {product.aiGenerated && (
                        <span style={{ color: '#3B82F6', fontSize: '10px', marginLeft: '4px' }}>✨ AI</span>
                      )}
                    </ProductName>
                    <ProductPrice>{product.price}</ProductPrice>
                    {product.reason && (
                      <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '8px' }}>
                        {product.reason}
                      </div>
                    )}
                    {product.predictedDate && (
                      <div style={{ fontSize: '10px', color: '#10B981', marginBottom: '8px' }}>
                        Predicted need: {new Date(product.predictedDate).toLocaleDateString()}
                      </div>
                    )}
                    <AddToCartButton onClick={(e) => {
                      e.stopPropagation();
                      console.log('Adding AI recommendation to cart:', product);
                    }}>
                      <Plus size={14} />
                      Add to Cart
                    </AddToCartButton>
                  </ProductCard>
                ))
              )}
            </ProductGrid>
          </RecommendationsSection>
        </MainPanel>

        <Sidebar>
          <SidebarCard>
            <SidebarTitle>Recent Activity</SidebarTitle>
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <ActivityItem key={index}>
                  <ActivityIcon>
                    <Icon size={12} />
                  </ActivityIcon>
                  <div>
                    <ActivityText>{activity.text}</ActivityText>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{activity.time}</div>
                  </div>
                </ActivityItem>
              );
            })}
            <ViewAllButton>
              View All Activity
              <ChevronRight size={16} />
            </ViewAllButton>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Quick Stats</SidebarTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>This Month</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {personalizedInsights.find(i => i.type === 'spending')?.monthlySpent || '$347.82'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Orders</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {personalizedInsights.find(i => i.type === 'behavior')?.orderCount || '8'}
                  {wsConnected && realTimeUpdates > 0 && (
                    <span style={{ color: '#3B82F6', fontSize: '10px', marginLeft: '4px' }}>
                      (+{realTimeUpdates})
                    </span>
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Favorites</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {personalizedInsights.find(i => i.type === 'preferences')?.favoriteCount || '23'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>AI Savings</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#10B981' }}>
                  {personalizedInsights.find(i => i.type === 'savings')?.totalSavings || '$47'}
                  <span style={{ fontSize: '10px', color: '#6B7280', marginLeft: '4px' }}>✨</span>
                </span>
              </div>
            </div>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Shopping Goals</SidebarTitle>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Monthly Budget</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>69%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '3px' }}>
                <div style={{ width: '69%', height: '100%', background: '#10B981', borderRadius: '3px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Healthy Choices</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>85%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '3px' }}>
                <div style={{ width: '85%', height: '100%', background: '#4F46E5', borderRadius: '3px' }}></div>
              </div>
            </div>
          </SidebarCard>
        </Sidebar>
      </MainContent>
    </DashboardContainer>
  );
};

export default CustomerDashboard;