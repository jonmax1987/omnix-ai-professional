import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import FilterDropdown from '../molecules/FilterDropdown';
import SearchBar from '../molecules/SearchBar';
import useProductsStore from '../../store/productsStore';
import useRecommendationsStore from '../../store/recommendationsStore';
import inventoryService from '../../services/inventoryService';
import { useI18n } from '../../hooks/useI18n';

const RecommendationsContainer = styled(motion.div)`
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border-radius: ${props => props.theme?.spacing?.[4] || '16px'};
  border: 1px solid ${props => props.theme?.colors?.border?.subtle || '#e5e7eb'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const RecommendationsHeader = styled.div`
  padding: ${props => props.theme?.spacing?.[6] || '24px'};
  border-bottom: 1px solid ${props => props.theme?.colors?.border?.subtle || '#e5e7eb'};
  background: linear-gradient(135deg, 
    ${props => props.theme?.colors?.primary?.[25] || '#eff6ff'} 0%, 
    ${props => props.theme?.colors?.primary?.[50] || '#dbeafe'} 100%);
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme?.spacing?.[4] || '16px'};
  margin-bottom: ${props => props.theme?.spacing?.[4] || '16px'};
  flex-wrap: wrap;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[3] || '12px'};
`;

const HeaderIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme?.spacing?.[3] || '12px'};
  background: linear-gradient(135deg, 
    ${props => props.theme?.colors?.primary?.[500] || '#3b82f6'} 0%, 
    ${props => props.theme?.colors?.primary?.[600] || '#2563eb'} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '8px'};
  flex-wrap: wrap;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[3] || '12px'};
  flex-wrap: wrap;
  margin-top: ${props => props.theme?.spacing?.[4] || '16px'};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme?.spacing?.[3] || '12px'};
  margin-bottom: ${props => props.theme?.spacing?.[6] || '24px'};
  padding: ${props => props.theme?.spacing?.[5] || '20px'};
  background: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: ${props => props.theme?.spacing?.[3] || '12px'};
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border-radius: ${props => props.theme?.spacing?.[2] || '8px'};
  border: 1px solid ${props => props.theme?.colors?.border?.subtle || '#e5e7eb'};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid ${props => props.theme?.colors?.border?.subtle || '#e5e7eb'};
  padding: 0 ${props => props.theme?.spacing?.[6] || '24px'};
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme?.spacing?.[3] || '12px'} ${props => props.theme?.spacing?.[4] || '16px'};
  background: none;
  border: none;
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '0.875rem'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.medium || '500'};
  color: ${props => props.active ? props.theme?.colors?.primary?.[600] || '#2563eb' : props.theme?.colors?.text?.secondary || '#6b7280'};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid ${props => props.active ? props.theme?.colors?.primary?.[500] || '#3b82f6' : 'transparent'};
  position: relative;
  
  &:hover:not(:disabled) {
    color: ${props => props.theme?.colors?.primary?.[500] || '#3b82f6'};
    background: ${props => props.theme?.colors?.primary?.[25] || '#eff6ff'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabContent = styled(motion.div)`
  padding: ${props => props.theme?.spacing?.[6] || '24px'};
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: ${props => props.theme?.spacing?.[4] || '16px'};
  margin-bottom: ${props => props.theme?.spacing?.[6] || '24px'};
`;

const RecommendationCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['type', 'priority'].includes(prop)
})`
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border?.subtle || '#e5e7eb'};
  border-radius: ${props => props.theme?.spacing?.[3] || '12px'};
  padding: ${props => props.theme?.spacing?.[5] || '20px'};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all ${props => props.theme?.animation?.duration?.fast || '150ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => getRecommendationGradient(props.type, props.theme)};
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'};
    border-color: ${props => props.theme?.colors?.primary?.[200] || '#bfdbfe'};
  }
`;

const RecommendationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme?.spacing?.[4] || '16px'};
`;

const RecommendationIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'type'
})`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme?.spacing?.[2] || '8px'};
  background: ${props => getRecommendationGradient(props.type, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: ${props => props.theme?.spacing?.[3] || '12px'};
  flex-shrink: 0;
`;

const RecommendationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductPair = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[3] || '12px'};
  margin: ${props => props.theme?.spacing?.[3] || '12px'} 0;
  padding: ${props => props.theme?.spacing?.[3] || '12px'};
  background: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
  border-radius: ${props => props.theme?.spacing?.[2] || '8px'};
`;

const ProductImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme?.spacing?.[1] || '4px'};
  background: ${props => props.theme?.colors?.background?.primary || '#ffffff'};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme?.colors?.border?.subtle || '#e5e7eb'};
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ArrowIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme?.colors?.primary?.[100] || '#dbeafe'};
  color: ${props => props.theme?.colors?.primary?.[600] || '#2563eb'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme?.spacing?.[3] || '12px'};
  margin: ${props => props.theme?.spacing?.[4] || '16px'} 0;
`;

const MetricItem = styled.div`
  text-align: center;
  padding: ${props => props.theme?.spacing?.[2] || '8px'};
  background: ${props => props.theme?.colors?.background?.subtle || '#f1f5f9'};
  border-radius: ${props => props.theme?.spacing?.[1] || '4px'};
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.lg || '1.125rem'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || '700'};
  color: ${props => props.theme?.colors?.primary?.[600] || '#2563eb'};
  margin-bottom: ${props => props.theme?.spacing?.[1] || '4px'};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.xs || '0.75rem'};
  color: ${props => props.theme?.colors?.text?.tertiary || '#9ca3af'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme?.spacing?.[2] || '8px'};
  margin-top: ${props => props.theme?.spacing?.[4] || '16px'};
  
  @media (max-width: ${props => props.theme?.breakpoints?.sm || '640px'}) {
    flex-direction: column;
  }
`;

const ConfidenceIndicator = styled.div`
  position: absolute;
  top: ${props => props.theme?.spacing?.[3] || '12px'};
  right: ${props => props.theme?.spacing?.[3] || '12px'};
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[1] || '4px'};
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme?.spacing?.[8] || '32px'};
  text-align: center;
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme?.spacing?.[8] || '32px'};
  text-align: center;
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
`;

// Utility functions
const getRecommendationGradient = (type, theme) => {
  const gradients = {
    cross_sell: `linear-gradient(135deg, ${theme.colors?.green?.[500] || '#10B981'}, ${theme.colors?.green?.[600] || '#059669'})`,
    upsell: `linear-gradient(135deg, ${theme.colors?.blue?.[500] || '#3B82F6'}, ${theme.colors?.blue?.[600] || '#2563EB'})`,
    bundle: `linear-gradient(135deg, ${theme.colors?.purple?.[500] || '#8B5CF6'}, ${theme.colors?.purple?.[600] || '#7C3AED'})`,
    substitute: `linear-gradient(135deg, ${theme.colors?.orange?.[500] || '#F97316'}, ${theme.colors?.orange?.[600] || '#EA580C'})`
  };
  return gradients[type] || gradients.cross_sell;
};

const getRecommendationIcon = (type) => {
  const icons = {
    cross_sell: 'plus-circle',
    upsell: 'trending-up',
    bundle: 'package',
    substitute: 'repeat'
  };
  return icons[type] || 'lightbulb';
};

const CrossSellUpsellRecommendations = ({
  onRecommendationApply,
  onRecommendationDismiss,
  onViewDetails,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConfidence, setSelectedConfidence] = useState('all');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Store connections
  const { products } = useProductsStore();

  // Filter options
  const tabOptions = [
    { key: 'all', label: 'All Recommendations', icon: 'list' },
    { key: 'cross_sell', label: 'Cross-Sell', icon: 'plus-circle' },
    { key: 'upsell', label: 'Up-Sell', icon: 'trending-up' },
    { key: 'bundle', label: 'Bundles', icon: 'package' },
    { key: 'substitute', label: 'Substitutes', icon: 'repeat' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'coffee', label: 'Coffee & Beverages' },
    { value: 'fresh', label: 'Fresh Produce' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'frozen', label: 'Frozen Foods' },
    { value: 'snacks', label: 'Snacks & Confectionery' }
  ];

  const confidenceOptions = [
    { value: 'all', label: 'All Confidence Levels' },
    { value: 'high', label: 'High (80%+)' },
    { value: 'medium', label: 'Medium (60-79%)' },
    { value: 'low', label: 'Low (<60%)' }
  ];

  // Fetch cross-sell and upsell recommendations
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock comprehensive cross-sell and upsell data
      const mockRecommendations = [
        {
          id: 'cs-001',
          type: 'cross_sell',
          priority: 'high',
          title: 'Coffee + Pastry Bundle',
          description: 'Customers who buy premium coffee often purchase pastries. 73% purchase rate.',
          primaryProduct: {
            id: 'prod-1',
            name: 'Premium Ethiopian Coffee',
            image: '/products/coffee-ethiopian.jpg',
            category: 'coffee',
            price: 24.99,
            sku: 'COFFEE-ETH-001'
          },
          recommendedProduct: {
            id: 'prod-2',
            name: 'Artisan Croissants',
            image: '/products/croissant-artisan.jpg',
            category: 'bakery',
            price: 8.50,
            sku: 'BAKERY-CRS-001'
          },
          confidence: 87,
          expectedUplift: 23,
          potentialRevenue: 1850,
          purchaseCorrelation: 0.73,
          timeframe: '30 days',
          metrics: {
            conversionRate: '12.3%',
            avgOrderValue: '+₪31',
            frequency: '2.4x/month',
            customerSatisfaction: '4.7/5'
          },
          seasonality: 'year-round',
          customerSegments: ['premium', 'regular'],
          actions: [
            'Create bundle promotion',
            'Display together in store',
            'Add to recommendation engine'
          ]
        },
        {
          id: 'us-001',
          type: 'upsell',
          priority: 'high',
          title: 'Premium Milk Upgrade',
          description: 'Regular milk customers show 68% willingness to upgrade to organic milk.',
          primaryProduct: {
            id: 'prod-3',
            name: 'Regular Milk 1L',
            image: '/products/milk-regular.jpg',
            category: 'dairy',
            price: 5.20,
            sku: 'DAIRY-MLK-REG'
          },
          recommendedProduct: {
            id: 'prod-4',
            name: 'Organic Milk 1L',
            image: '/products/milk-organic.jpg',
            category: 'dairy',
            price: 8.90,
            sku: 'DAIRY-MLK-ORG'
          },
          confidence: 91,
          expectedUplift: 18,
          potentialRevenue: 2240,
          purchaseCorrelation: 0.68,
          timeframe: '30 days',
          metrics: {
            conversionRate: '18.7%',
            avgOrderValue: '+₪3.70',
            frequency: '3.1x/month',
            customerSatisfaction: '4.8/5'
          },
          seasonality: 'year-round',
          customerSegments: ['health-conscious', 'families'],
          actions: [
            'Create upgrade prompt at checkout',
            'Highlight health benefits',
            'Offer first-time discount'
          ]
        },
        {
          id: 'bd-001',
          type: 'bundle',
          priority: 'medium',
          title: 'Breakfast Bundle',
          description: 'Complete breakfast package with high customer appeal and margin.',
          primaryProduct: {
            id: 'prod-5',
            name: 'Fresh Eggs (12pk)',
            image: '/products/eggs-fresh.jpg',
            category: 'dairy',
            price: 12.00,
            sku: 'DAIRY-EGG-12'
          },
          recommendedProduct: {
            id: 'bundle-1',
            name: 'Bread + Butter + Jam',
            image: '/products/breakfast-bundle.jpg',
            category: 'bundle',
            price: 18.90,
            sku: 'BUNDLE-BRK-001'
          },
          confidence: 79,
          expectedUplift: 15,
          potentialRevenue: 1620,
          purchaseCorrelation: 0.61,
          timeframe: '30 days',
          metrics: {
            conversionRate: '15.2%',
            avgOrderValue: '+₪18.90',
            frequency: '1.8x/month',
            customerSatisfaction: '4.5/5'
          },
          seasonality: 'higher on weekends',
          customerSegments: ['families', 'convenience'],
          actions: [
            'Create promotional display',
            'Weekend special pricing',
            'Recipe card inclusion'
          ]
        },
        {
          id: 'cs-002',
          type: 'cross_sell',
          priority: 'medium',
          title: 'Wine + Cheese Pairing',
          description: 'Premium wine customers frequently purchase artisanal cheese selections.',
          primaryProduct: {
            id: 'prod-6',
            name: 'French Red Wine',
            image: '/products/wine-french-red.jpg',
            category: 'beverages',
            price: 45.00,
            sku: 'BEV-WINE-FR-001'
          },
          recommendedProduct: {
            id: 'prod-7',
            name: 'Artisan Cheese Selection',
            image: '/products/cheese-artisan.jpg',
            category: 'dairy',
            price: 28.50,
            sku: 'DAIRY-CHS-ART'
          },
          confidence: 83,
          expectedUplift: 31,
          potentialRevenue: 3420,
          purchaseCorrelation: 0.71,
          timeframe: '30 days',
          metrics: {
            conversionRate: '22.1%',
            avgOrderValue: '+₪28.50',
            frequency: '1.2x/month',
            customerSatisfaction: '4.9/5'
          },
          seasonality: 'higher during holidays',
          customerSegments: ['premium', 'entertaining'],
          actions: [
            'Create tasting station',
            'Wine & cheese night events',
            'Pairing guide brochures'
          ]
        },
        {
          id: 'sb-001',
          type: 'substitute',
          priority: 'low',
          title: 'Gluten-Free Alternative',
          description: 'When regular pasta is out of stock, 45% accept gluten-free alternative.',
          primaryProduct: {
            id: 'prod-8',
            name: 'Regular Pasta 500g',
            image: '/products/pasta-regular.jpg',
            category: 'pantry',
            price: 3.20,
            sku: 'PANTRY-PST-REG'
          },
          recommendedProduct: {
            id: 'prod-9',
            name: 'Gluten-Free Pasta 400g',
            image: '/products/pasta-gluten-free.jpg',
            category: 'pantry',
            price: 6.80,
            sku: 'PANTRY-PST-GF'
          },
          confidence: 65,
          expectedUplift: 8,
          potentialRevenue: 890,
          purchaseCorrelation: 0.45,
          timeframe: '30 days',
          metrics: {
            conversionRate: '8.3%',
            avgOrderValue: '+₪3.60',
            frequency: '0.8x/month',
            customerSatisfaction: '4.2/5'
          },
          seasonality: 'consistent',
          customerSegments: ['health-conscious', 'dietary-restricted'],
          actions: [
            'Stock out notifications',
            'Health benefit highlights',
            'Recipe suggestions'
          ]
        },
        {
          id: 'us-002',
          type: 'upsell',
          priority: 'high',
          title: 'Premium Olive Oil Upgrade',
          description: 'Regular olive oil customers show interest in premium extra virgin varieties.',
          primaryProduct: {
            id: 'prod-10',
            name: 'Regular Olive Oil 500ml',
            image: '/products/olive-oil-regular.jpg',
            category: 'pantry',
            price: 8.50,
            sku: 'PANTRY-OIL-REG'
          },
          recommendedProduct: {
            id: 'prod-11',
            name: 'Extra Virgin Olive Oil 500ml',
            image: '/products/olive-oil-premium.jpg',
            category: 'pantry',
            price: 19.90,
            sku: 'PANTRY-OIL-PREM'
          },
          confidence: 76,
          expectedUplift: 25,
          potentialRevenue: 2150,
          purchaseCorrelation: 0.58,
          timeframe: '30 days',
          metrics: {
            conversionRate: '16.4%',
            avgOrderValue: '+₪11.40',
            frequency: '1.4x/month',
            customerSatisfaction: '4.6/5'
          },
          seasonality: 'higher in cooking seasons',
          customerSegments: ['cooking-enthusiasts', 'health-conscious'],
          actions: [
            'Cooking demonstrations',
            'Taste comparison displays',
            'Recipe sharing program'
          ]
        }
      ];

      setRecommendations(mockRecommendations);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch cross-sell/upsell recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter recommendations based on active tab and filters
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(rec => rec.type === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rec =>
        rec.title.toLowerCase().includes(query) ||
        rec.description.toLowerCase().includes(query) ||
        rec.primaryProduct.name.toLowerCase().includes(query) ||
        rec.recommendedProduct.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rec =>
        rec.primaryProduct.category === selectedCategory ||
        rec.recommendedProduct.category === selectedCategory
      );
    }

    // Filter by confidence
    if (selectedConfidence !== 'all') {
      filtered = filtered.filter(rec => {
        switch (selectedConfidence) {
          case 'high':
            return rec.confidence >= 80;
          case 'medium':
            return rec.confidence >= 60 && rec.confidence < 80;
          case 'low':
            return rec.confidence < 60;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [recommendations, activeTab, searchQuery, selectedCategory, selectedConfidence]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRecommendations = recommendations.length;
    const highConfidence = recommendations.filter(r => r.confidence >= 80).length;
    const totalRevenue = recommendations.reduce((sum, r) => sum + r.potentialRevenue, 0);
    const avgConfidence = totalRecommendations > 0 
      ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / totalRecommendations)
      : 0;

    return {
      total: totalRecommendations,
      filtered: filteredRecommendations.length,
      highConfidence,
      totalRevenue,
      avgConfidence
    };
  }, [recommendations, filteredRecommendations]);

  // Auto refresh
  useEffect(() => {
    fetchRecommendations();
    
    if (autoRefresh) {
      const interval = setInterval(fetchRecommendations, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchRecommendations, autoRefresh, refreshInterval]);

  // Handle recommendation actions
  const handleApplyRecommendation = useCallback((recommendation) => {
    onRecommendationApply?.(recommendation);
  }, [onRecommendationApply]);

  const handleDismissRecommendation = useCallback((recommendation) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
    onRecommendationDismiss?.(recommendation);
  }, [onRecommendationDismiss]);

  const handleViewDetails = useCallback((recommendation) => {
    onViewDetails?.(recommendation);
  }, [onViewDetails]);

  // Loading state
  if (loading && recommendations.length === 0) {
    return (
      <RecommendationsContainer className={className} {...props}>
        <LoadingState>
          <Icon name="loader" size={48} className="animate-spin" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Analyzing purchase patterns...
          </Typography>
          <Typography variant="body2" color="secondary">
            Generating cross-sell and upsell recommendations
          </Typography>
        </LoadingState>
      </RecommendationsContainer>
    );
  }

  // Error state
  if (error && recommendations.length === 0) {
    return (
      <RecommendationsContainer className={className} {...props}>
        <EmptyState>
          <Icon name="alert-triangle" size={48} color="error" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Failed to load recommendations
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '1rem' }}>
            {error}
          </Typography>
          <Button onClick={fetchRecommendations}>
            <Icon name="refresh" size={16} />
            Try Again
          </Button>
        </EmptyState>
      </RecommendationsContainer>
    );
  }

  return (
    <RecommendationsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <RecommendationsHeader>
        <HeaderTop>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="trending-up" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                Cross-Sell & Up-Sell Recommendations
              </Typography>
              <Typography variant="body2" color="secondary">
                AI-powered product recommendations to boost sales and customer satisfaction
                {lastUpdated && ` • Last updated: ${lastUpdated.toLocaleTimeString()}`}
              </Typography>
            </div>
          </HeaderLeft>
          <HeaderActions>
            <Badge variant="info" size="lg">
              {stats.filtered} of {stats.total} recommendations
            </Badge>
            <Button variant="outline" onClick={fetchRecommendations} disabled={loading}>
              <Icon name={loading ? 'loader' : 'refresh'} size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </HeaderActions>
        </HeaderTop>

        {/* Filters */}
        <FilterSection>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search recommendations..."
            style={{ minWidth: '300px' }}
          />
          <FilterDropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Category"
          />
          <FilterDropdown
            options={confidenceOptions}
            value={selectedConfidence}
            onChange={setSelectedConfidence}
            placeholder="Confidence"
          />
        </FilterSection>
      </RecommendationsHeader>

      {/* Statistics */}
      <StatsGrid>
        <StatCard whileHover={{ scale: 1.02 }}>
          <MetricValue>₪{stats.totalRevenue.toLocaleString()}</MetricValue>
          <MetricLabel>Potential Revenue</MetricLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <MetricValue>{stats.highConfidence}</MetricValue>
          <MetricLabel>High Confidence</MetricLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <MetricValue>{stats.avgConfidence}%</MetricValue>
          <MetricLabel>Avg Confidence</MetricLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <MetricValue>{stats.total}</MetricValue>
          <MetricLabel>Total Opportunities</MetricLabel>
        </StatCard>
      </StatsGrid>

      {/* Tabs */}
      <TabsContainer>
        {tabOptions.map(tab => (
          <Tab
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            <Icon name={tab.icon} size={16} style={{ marginRight: '8px' }} />
            {tab.label}
            {tab.key !== 'all' && (
              <Badge variant="secondary" size="xs" style={{ marginLeft: '8px' }}>
                {recommendations.filter(r => r.type === tab.key).length}
              </Badge>
            )}
          </Tab>
        ))}
      </TabsContainer>

      {/* Content */}
      <TabContent
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {filteredRecommendations.length === 0 ? (
          <EmptyState>
            <Icon name="search" size={48} />
            <Typography variant="h6" style={{ marginTop: '1rem' }}>
              No recommendations found
            </Typography>
            <Typography variant="body2" color="secondary">
              Try adjusting your filters or search terms
            </Typography>
          </EmptyState>
        ) : (
          <RecommendationsGrid>
            <AnimatePresence>
              {filteredRecommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={recommendation.id}
                  type={recommendation.type}
                  priority={recommendation.priority}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleViewDetails(recommendation)}
                >
                  <ConfidenceIndicator>
                    <Icon name="brain" size={14} />
                    <Badge variant="info" size="sm">
                      {recommendation.confidence}%
                    </Badge>
                  </ConfidenceIndicator>
                  
                  <RecommendationHeader>
                    <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                      <RecommendationIcon type={recommendation.type}>
                        <Icon name={getRecommendationIcon(recommendation.type)} size={24} />
                      </RecommendationIcon>
                      <RecommendationContent>
                        <Typography variant="h6" weight="semibold" style={{ marginBottom: '8px' }}>
                          {recommendation.title}
                        </Typography>
                        <Typography variant="body2" color="secondary" style={{ marginBottom: '12px', lineHeight: 1.5 }}>
                          {recommendation.description}
                        </Typography>
                        <Badge 
                          variant={recommendation.type === 'cross_sell' ? 'success' : 
                                  recommendation.type === 'upsell' ? 'info' :
                                  recommendation.type === 'bundle' ? 'primary' : 'warning'}
                          size="sm"
                        >
                          {recommendation.type.replace('_', '-').toUpperCase()}
                        </Badge>
                      </RecommendationContent>
                    </div>
                  </RecommendationHeader>

                  {/* Product Pair */}
                  <ProductPair>
                    <ProductImage>
                      <Icon name="package" size={20} color={theme => theme?.colors?.text?.secondary || '#6b7280'} />
                    </ProductImage>
                    <ProductInfo>
                      <Typography variant="body2" weight="medium">
                        {recommendation.primaryProduct.name}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        ₪{recommendation.primaryProduct.price}
                      </Typography>
                    </ProductInfo>
                    <ArrowIcon>
                      <Icon name="arrow-right" size={16} />
                    </ArrowIcon>
                    <ProductImage>
                      <Icon name="package" size={20} color={theme => theme?.colors?.primary?.[500] || '#3b82f6'} />
                    </ProductImage>
                    <ProductInfo>
                      <Typography variant="body2" weight="medium">
                        {recommendation.recommendedProduct.name}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        ₪{recommendation.recommendedProduct.price}
                      </Typography>
                    </ProductInfo>
                  </ProductPair>

                  {/* Metrics */}
                  <MetricsRow>
                    {Object.entries(recommendation.metrics).slice(0, 3).map(([key, value]) => (
                      <MetricItem key={key}>
                        <MetricValue>{value}</MetricValue>
                        <MetricLabel>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </MetricLabel>
                      </MetricItem>
                    ))}
                  </MetricsRow>

                  {/* Expected Impact */}
                  <div style={{ margin: `${props?.theme?.spacing?.[3] || '12px'} 0` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Typography variant="body2" weight="medium">
                        Expected Revenue Impact
                      </Typography>
                      <Typography variant="body2" weight="medium" color="success">
                        +₪{recommendation.potentialRevenue.toLocaleString()}
                      </Typography>
                    </div>
                    <Progress 
                      value={recommendation.expectedUplift} 
                      max={50}
                      variant="success" 
                      size="sm" 
                    />
                  </div>

                  {/* Action Buttons */}
                  <ActionButtons>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyRecommendation(recommendation);
                      }}
                    >
                      <Icon name="play" size={14} />
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(recommendation);
                      }}
                    >
                      <Icon name="eye" size={14} />
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissRecommendation(recommendation);
                      }}
                    >
                      <Icon name="x" size={14} />
                      Dismiss
                    </Button>
                  </ActionButtons>
                </RecommendationCard>
              ))}
            </AnimatePresence>
          </RecommendationsGrid>
        )}
      </TabContent>
    </RecommendationsContainer>
  );
};

export default CrossSellUpsellRecommendations;