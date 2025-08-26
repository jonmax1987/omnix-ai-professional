/**
 * OMNIX AI - New Product Arrival Notification System
 * AI-powered new product recommendations with smart targeting
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Star,
  TrendingUp,
  Bell,
  Heart,
  ShoppingCart,
  Info,
  Zap,
  Target,
  Filter,
  Calendar,
  Users,
  Award,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService } from '../../services/notifications';
import { apiService } from '../../services/api';

const Container = styled(motion.div)`
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

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ProductCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const NewBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ProductImage = styled.div`
  width: 100%;
  height: 160px;
  background: ${({ theme }) => theme.colors.neutral.light};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  position: relative;
`;

const ProductContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
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

const ProductPrice = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const AIRecommendation = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.light}20, ${({ theme }) => theme.colors.secondary.light}20);
  border-left: 3px solid ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const RecommendationText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
  font-style: italic;
`;

const MatchScore = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ScoreBar = styled.div`
  flex: 1;
  height: 6px;
  background: ${({ theme }) => theme.colors.neutral.light};
  border-radius: 3px;
  overflow: hidden;
`;

const ScoreFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.success.main}, ${({ theme }) => theme.colors.primary.main});
  border-radius: 3px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
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

const NewProductNotificationSystem = ({ className }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { updateAnalytics } = useNotificationStore();

  useEffect(() => {
    loadNewProducts();
  }, []);

  const loadNewProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/products/new-arrivals', {
        params: { 
          personalized: true,
          limit: 12
        }
      });
      setProducts(response.products);
    } catch (error) {
      console.error('Failed to load new products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyMe = async (product) => {
    try {
      await notificationService.sendLocalNotification('NEW_PRODUCT', {
        id: product.id,
        productName: product.name,
        reason: product.aiReason,
        price: product.price,
        productId: product.id,
        matchScore: product.matchScore
      });

      updateAnalytics('delivered', { type: 'NEW_PRODUCT' });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const handleInterested = async (product) => {
    try {
      await apiService.post('/products/interested', { productId: product.id });
      alert('Thanks! We\'ll let you know about similar products.');
    } catch (error) {
      console.error('Failed to mark interest:', error);
    }
  };

  const handleNotInterested = async (product) => {
    try {
      await apiService.post('/products/not-interested', { productId: product.id });
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (error) {
      console.error('Failed to mark not interested:', error);
    }
  };

  if (loading) {
    return (
      <Container className={className}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Sparkles size={32} style={{ animation: 'pulse 2s infinite' }} />
          <p>Discovering new products for you...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Sparkles size={24} />
          New Product Discoveries
        </Title>
      </Header>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
          <Star size={48} style={{ marginBottom: '16px' }} />
          <h3>No new products match your preferences</h3>
          <p>Check back later for personalized discoveries!</p>
        </div>
      ) : (
        <ProductsGrid>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductImage>
                <NewBadge>
                  <Sparkles size={12} />
                  NEW
                </NewBadge>
                {product.emoji || '🆕'}
              </ProductImage>
              
              <ProductContent>
                <ProductName>{product.name}</ProductName>
                <ProductBrand>{product.brand}</ProductBrand>
                <ProductPrice>${product.price}</ProductPrice>
                
                <MatchScore>
                  <Target size={14} color="#10B981" />
                  <ScoreBar>
                    <ScoreFill
                      initial={{ width: 0 }}
                      animate={{ width: `${product.matchScore}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </ScoreBar>
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 'bold' }}>
                    {product.matchScore}% match
                  </span>
                </MatchScore>
                
                <AIRecommendation>
                  <RecommendationText>
                    🤖 {product.aiReason}
                  </RecommendationText>
                </AIRecommendation>
                
                <ActionButtons>
                  <ActionButton onClick={() => handleNotInterested(product)}>
                    <XCircle size={14} />
                    Pass
                  </ActionButton>
                  <ActionButton onClick={() => handleNotifyMe(product)}>
                    <Bell size={14} />
                    Notify
                  </ActionButton>
                  <ActionButton onClick={() => handleInterested(product)}>
                    <Heart size={14} />
                    Interest
                  </ActionButton>
                  <ActionButton variant="primary" onClick={() => window.open(`/product/${product.id}`, '_blank')}>
                    <ShoppingCart size={14} />
                    View
                  </ActionButton>
                </ActionButtons>
              </ProductContent>
            </ProductCard>
          ))}
        </ProductsGrid>
      )}
    </Container>
  );
};

export default NewProductNotificationSystem;