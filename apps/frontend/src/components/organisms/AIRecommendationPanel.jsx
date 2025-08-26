import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Star, 
  Heart, 
  ShoppingCart, 
  TrendingUp, 
  Zap, 
  Target, 
  Clock,
  DollarSign,
  Package,
  ThumbsUp,
  ThumbsDown,
  X,
  Plus,
  Filter,
  Shuffle,
  Settings,
  BarChart3,
  Lightbulb,
  Award,
  Users,
  Sparkles,
  Eye,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const Container = styled(motion.div)`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${({ primary, theme }) => primary ? theme.colors.primary : theme.colors.border};
  border-radius: 8px;
  background: ${({ primary, theme }) => primary ? theme.colors.primary : 'white'};
  color: ${({ primary, theme }) => primary ? 'white' : theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ primary, theme }) => 
      primary ? theme.colors.primary : theme.colors.gray[50]};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AIInsights = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}15, ${({ theme }) => theme.colors.primary}05);
  border: 1px solid ${({ theme }) => theme.colors.primary}20;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const InsightsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const InsightsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PersonalizationScore = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
`;

const ScoreValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const ScoreLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const InsightCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const InsightIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 12px;
`;

const InsightValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const InsightLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  padding: 4px;
  overflow-x: auto;
`;

const FilterTab = styled.button`
  flex: 1;
  min-width: 100px;
  padding: 8px 12px;
  border: none;
  background: ${({ active, theme }) => active ? 'white' : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text.primary : theme.colors.text.secondary};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) => active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  white-space: nowrap;
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const RecommendationCard = styled(motion.div)`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  padding: 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const RecommendationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const AIBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'trending': return theme.colors.warning;
      case 'personal': return theme.colors.primary;
      case 'deal': return theme.colors.success;
      case 'seasonal': return theme.colors.error;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  position: absolute;
  top: 12px;
  right: 12px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
  line-height: 1.2;
`;

const ProductBrand = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`;

const DiscountPrice = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: line-through;
  margin-left: 8px;
`;

const RecommendationReason = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 12px;
`;

const ReasonText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ConfidenceBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ConfidenceLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ConfidenceProgress = styled.div`
  flex: 1;
  height: 4px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 2px;
  margin: 0 8px;
  overflow: hidden;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background: ${({ confidence, theme }) => 
    confidence > 80 ? theme.colors.success : 
    confidence > 60 ? theme.colors.warning : theme.colors.error};
  width: ${({ confidence }) => confidence}%;
  transition: width 0.3s ease;
`;

const ConfidenceValue = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const ActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary : 'white'};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? 'white' : theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ variant, theme }) => 
      variant === 'primary' ? theme.colors.primary : theme.colors.gray[50]};
  }
`;

const FeedbackButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const FeedbackBtn = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  background: ${({ active, positive, theme }) => 
    active ? (positive ? theme.colors.success : theme.colors.error) : 'white'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ positive, theme }) => 
      positive ? theme.colors.success : theme.colors.error};
    color: white;
    border-color: ${({ positive, theme }) => 
      positive ? theme.colors.success : theme.colors.error};
  }
`;

const AIRecommendationPanel = () => {
  const [activeFilter, setActiveFilter] = useState('for-you');
  const [recommendations, setRecommendations] = useState([]);

  const insights = [
    {
      icon: Target,
      value: '92%',
      label: 'Match Score',
      color: '#4f46e5'
    },
    {
      icon: Star,
      value: '4.8',
      label: 'Avg Rating',
      color: '#f59e0b'
    },
    {
      icon: DollarSign,
      value: '$23.50',
      label: 'Savings Found',
      color: '#10b981'
    },
    {
      icon: Zap,
      value: '12',
      label: 'New Suggestions',
      color: '#ef4444'
    }
  ];

  const filterTabs = [
    { id: 'for-you', label: 'For You', icon: Heart },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'deals', label: 'Best Deals', icon: DollarSign },
    { id: 'seasonal', label: 'Seasonal', icon: Sparkles },
    { id: 'frequently-bought', label: 'Often Together', icon: Users },
    { id: 'new', label: 'New Arrivals', icon: Plus }
  ];

  const recommendationsList = [
    {
      id: 1,
      name: 'Organic Greek Yogurt',
      brand: 'Fresh Valley',
      price: 5.99,
      originalPrice: 6.99,
      discount: 14,
      type: 'personal',
      reason: 'Based on your healthy eating preferences',
      confidence: 94,
      rating: 4.8,
      reviews: 1247,
      image: null,
      tags: ['Organic', 'High Protein', 'Probiotics'],
      feedback: null
    },
    {
      id: 2,
      name: 'Artisan Sourdough Bread',
      brand: 'Local Bakery',
      price: 4.50,
      originalPrice: null,
      discount: 0,
      type: 'trending',
      reason: 'Popular with customers like you',
      confidence: 87,
      rating: 4.6,
      reviews: 892,
      image: null,
      tags: ['Artisan', 'Local', 'Fresh Daily'],
      feedback: null
    },
    {
      id: 3,
      name: 'Free Range Eggs',
      brand: 'Happy Farms',
      price: 6.75,
      originalPrice: 7.50,
      discount: 10,
      type: 'deal',
      reason: 'Limited time offer - 10% off',
      confidence: 91,
      rating: 4.9,
      reviews: 2156,
      image: null,
      tags: ['Free Range', 'Omega-3', 'Local'],
      feedback: null
    },
    {
      id: 4,
      name: 'Seasonal Berry Mix',
      brand: 'Berry Best',
      price: 8.99,
      originalPrice: null,
      discount: 0,
      type: 'seasonal',
      reason: 'Perfect for summer smoothies',
      confidence: 83,
      rating: 4.5,
      reviews: 543,
      image: null,
      tags: ['Seasonal', 'Antioxidants', 'Frozen'],
      feedback: null
    },
    {
      id: 5,
      name: 'Almond Butter Crunchy',
      brand: 'Nutty Goodness',
      price: 12.99,
      originalPrice: null,
      discount: 0,
      type: 'personal',
      reason: 'Complements your morning routine',
      confidence: 79,
      rating: 4.7,
      reviews: 987,
      image: null,
      tags: ['Natural', 'No Sugar Added', 'Protein'],
      feedback: null
    },
    {
      id: 6,
      name: 'Organic Baby Spinach',
      brand: 'Green Fields',
      price: 3.25,
      originalPrice: 3.75,
      discount: 13,
      type: 'deal',
      reason: 'Flash sale - expires today',
      confidence: 88,
      rating: 4.4,
      reviews: 756,
      image: null,
      tags: ['Organic', 'Baby Leaves', 'Ready to Eat'],
      feedback: null
    }
  ];

  const filteredRecommendations = recommendationsList.filter(rec => {
    switch (activeFilter) {
      case 'trending': return rec.type === 'trending';
      case 'deals': return rec.type === 'deal' || rec.discount > 0;
      case 'seasonal': return rec.type === 'seasonal';
      case 'frequently-bought': return rec.confidence > 85;
      case 'new': return rec.reviews < 1000;
      default: return rec.type === 'personal' || activeFilter === 'for-you';
    }
  });

  const addToCart = (productId) => {
    console.log('Add to cart:', productId);
  };

  const addToFavorites = (productId) => {
    console.log('Add to favorites:', productId);
  };

  const provideFeedback = (productId, positive) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === productId ? { ...rec, feedback: positive } : rec
    ));
  };

  const refreshRecommendations = () => {
    console.log('Refreshing recommendations...');
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'trending': return <TrendingUp size={8} />;
      case 'personal': return <Brain size={8} />;
      case 'deal': return <DollarSign size={8} />;
      case 'seasonal': return <Sparkles size={8} />;
      default: return <Star size={8} />;
    }
  };

  const getBadgeLabel = (type) => {
    switch (type) {
      case 'trending': return 'TRENDING';
      case 'personal': return 'FOR YOU';
      case 'deal': return 'DEAL';
      case 'seasonal': return 'SEASONAL';
      default: return 'RECOMMENDED';
    }
  };

  const getReasonIcon = (type) => {
    switch (type) {
      case 'trending': return TrendingUp;
      case 'personal': return Brain;
      case 'deal': return DollarSign;
      case 'seasonal': return Sparkles;
      default: return Lightbulb;
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Brain size={20} />
          AI Recommendations
        </Title>
        <Controls>
          <ActionButton onClick={refreshRecommendations}>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
          <ActionButton>
            <Filter size={16} />
            Filters
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
            Preferences
          </ActionButton>
        </Controls>
      </Header>

      <AIInsights>
        <InsightsHeader>
          <InsightsTitle>
            <Sparkles size={16} />
            Personalization Insights
          </InsightsTitle>
          <PersonalizationScore>
            <ScoreValue>92%</ScoreValue>
            <ScoreLabel>Match Score</ScoreLabel>
          </PersonalizationScore>
        </InsightsHeader>
        
        <InsightsGrid>
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <InsightCard key={index}>
                <InsightIcon color={insight.color}>
                  <Icon size={18} />
                </InsightIcon>
                <InsightValue>{insight.value}</InsightValue>
                <InsightLabel>{insight.label}</InsightLabel>
              </InsightCard>
            );
          })}
        </InsightsGrid>
      </AIInsights>

      <FilterTabs>
        {filterTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <FilterTab
              key={tab.id}
              active={activeFilter === tab.id}
              onClick={() => setActiveFilter(tab.id)}
            >
              <Icon size={12} style={{ marginRight: '4px' }} />
              {tab.label}
            </FilterTab>
          );
        })}
      </FilterTabs>

      <RecommendationsGrid>
        {filteredRecommendations.map((recommendation, index) => {
          const ReasonIcon = getReasonIcon(recommendation.type);
          return (
            <RecommendationCard
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <AIBadge type={recommendation.type}>
                {getBadgeIcon(recommendation.type)}
                {getBadgeLabel(recommendation.type)}
              </AIBadge>

              <ProductImage>
                <Package size={24} color="#9ca3af" />
              </ProductImage>

              <ProductInfo>
                <ProductName>{recommendation.name}</ProductName>
                <ProductBrand>{recommendation.brand}</ProductBrand>
                
                <ProductPrice>
                  ${recommendation.price.toFixed(2)}
                  {recommendation.originalPrice && (
                    <DiscountPrice>
                      ${recommendation.originalPrice.toFixed(2)}
                    </DiscountPrice>
                  )}
                </ProductPrice>

                <RecommendationReason>
                  <ReasonText>
                    <ReasonIcon size={12} />
                    {recommendation.reason}
                  </ReasonText>
                </RecommendationReason>

                <ConfidenceBar>
                  <ConfidenceLabel>AI Confidence</ConfidenceLabel>
                  <ConfidenceProgress>
                    <ConfidenceFill confidence={recommendation.confidence} />
                  </ConfidenceProgress>
                  <ConfidenceValue>{recommendation.confidence}%</ConfidenceValue>
                </ConfidenceBar>

                <ActionButtons>
                  <ActionBtn 
                    variant="primary"
                    onClick={() => addToCart(recommendation.id)}
                  >
                    <ShoppingCart size={12} />
                    Add to Cart
                  </ActionBtn>
                  <ActionBtn onClick={() => addToFavorites(recommendation.id)}>
                    <Heart size={12} />
                    Save
                  </ActionBtn>
                </ActionButtons>

                <FeedbackButtons>
                  <FeedbackBtn
                    positive
                    active={recommendation.feedback === true}
                    onClick={() => provideFeedback(recommendation.id, true)}
                  >
                    <ThumbsUp size={12} />
                  </FeedbackBtn>
                  <FeedbackBtn
                    active={recommendation.feedback === false}
                    onClick={() => provideFeedback(recommendation.id, false)}
                  >
                    <ThumbsDown size={12} />
                  </FeedbackBtn>
                </FeedbackButtons>
              </ProductInfo>
            </RecommendationCard>
          );
        })}
      </RecommendationsGrid>
    </Container>
  );
};

export default AIRecommendationPanel;