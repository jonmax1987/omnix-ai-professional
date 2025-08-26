import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ShoppingCart, 
  Star, 
  Plus, 
  X, 
  DollarSign, 
  TrendingUp,
  Users,
  Clock,
  Target,
  Brain,
  Lightbulb,
  Award,
  Zap,
  Heart,
  Eye,
  Filter,
  Search,
  Settings,
  ArrowRight,
  CheckCircle,
  Gift,
  Sparkles,
  Coffee,
  ChefHat,
  Home,
  Activity,
  Calendar,
  Percent,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Share2
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

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px 12px 8px 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BundlingInsights = styled.div`
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

const InsightsStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const CategoryTab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.gray[100]};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const BundlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const BundleCard = styled(motion.div)`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  padding: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BundleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const BundleTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const BundleBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'popular': return theme.colors.warning;
      case 'trending': return theme.colors.success;
      case 'ai-recommended': return theme.colors.primary;
      case 'seasonal': return theme.colors.error;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
`;

const BundleDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const BundleMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProductsSection = styled.div`
  margin-bottom: 16px;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProductsTitle = styled.h5`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductsCount = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 6px;
`;

const ProductImage = styled.div`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`;

const ProductCategory = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProductPrice = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const PricingSection = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const PricingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PricingLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PricingValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SavingsHighlight = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
`;

const BundleReasons = styled.div`
  margin-bottom: 16px;
`;

const ReasonsTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReasonsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ReasonTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ reason, theme }) => {
    switch (reason) {
      case 'frequently-bought-together': return theme.colors.primary;
      case 'seasonal-pairing': return theme.colors.warning;
      case 'recipe-based': return theme.colors.success;
      case 'complementary': return theme.colors.error;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
`;

const BundleActions = styled.div`
  display: flex;
  gap: 8px;
`;

const BundleButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary : theme.colors.border};
  border-radius: 8px;
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary : 'white'};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? 'white' : theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ variant, theme }) => 
      variant === 'primary' ? theme.colors.primary : theme.colors.gray[50]};
  }
`;

const FeedbackButtons = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 4px;
`;

const FeedbackButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: ${({ active, positive, theme }) => 
    active ? (positive ? theme.colors.success : theme.colors.error) : theme.colors.gray[100]};
  color: ${({ active }) => active ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ positive, theme }) => 
      positive ? theme.colors.success : theme.colors.error};
    color: white;
  }
`;

const CrossCategoryBundlingSuggestions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [feedback, setFeedback] = useState({});

  const insights = [
    { value: '23', label: 'Active Bundles' },
    { value: '$67.40', label: 'Potential Savings' },
    { value: '94%', label: 'Bundle Accuracy' },
    { value: '4.6⭐', label: 'Customer Rating' }
  ];

  const categories = [
    { id: 'all', label: 'All Bundles', icon: Package },
    { id: 'meal-prep', label: 'Meal Prep', icon: ChefHat },
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'entertaining', label: 'Entertaining', icon: Users },
    { id: 'seasonal', label: 'Seasonal', icon: Calendar },
    { id: 'health', label: 'Health & Wellness', icon: Activity },
    { id: 'home-care', label: 'Home Care', icon: Home }
  ];

  const bundles = [
    {
      id: 1,
      title: 'Ultimate Taco Tuesday Bundle',
      description: 'Everything you need for authentic taco night including proteins, tortillas, and fresh toppings.',
      type: 'popular',
      category: 'meal-prep',
      rating: 4.8,
      popularity: 89,
      savings: 15.40,
      savingsPercent: 23,
      products: [
        { name: 'Ground Beef', category: 'Meat', price: 6.99, image: null },
        { name: 'Soft Tortillas', category: 'Bakery', price: 2.49, image: null },
        { name: 'Fresh Cilantro', category: 'Produce', price: 1.29, image: null },
        { name: 'Lime (6-pack)', category: 'Produce', price: 2.99, image: null },
        { name: 'Sharp Cheddar', category: 'Dairy', price: 4.49, image: null },
        { name: 'Taco Seasoning', category: 'Pantry', price: 1.99, image: null }
      ],
      totalPrice: 20.24,
      bundlePrice: 18.99,
      reasons: [
        { type: 'frequently-bought-together', label: 'Bought Together 78%' },
        { type: 'recipe-based', label: 'Recipe Match' },
        { type: 'seasonal-pairing', label: 'Weekly Special' }
      ],
      feedback: null
    },
    {
      id: 2,
      title: 'Morning Energy Boost Pack',
      description: 'Perfect breakfast combination with protein, fruits, and energizing beverages.',
      type: 'trending',
      category: 'breakfast',
      rating: 4.6,
      popularity: 76,
      savings: 8.75,
      savingsPercent: 18,
      products: [
        { name: 'Greek Yogurt', category: 'Dairy', price: 5.99, image: null },
        { name: 'Fresh Berries', category: 'Produce', price: 4.99, image: null },
        { name: 'Granola', category: 'Cereal', price: 6.49, image: null },
        { name: 'Organic Honey', category: 'Pantry', price: 8.99, image: null },
        { name: 'Premium Coffee', category: 'Beverages', price: 12.99, image: null }
      ],
      totalPrice: 39.45,
      bundlePrice: 35.99,
      reasons: [
        { type: 'frequently-bought-together', label: 'Health Trend' },
        { type: 'complementary', label: 'Nutrition Balance' },
        { type: 'recipe-based', label: 'Breakfast Bowl' }
      ],
      feedback: null
    },
    {
      id: 3,
      title: 'Game Day Entertainment Set',
      description: 'Complete party package with snacks, drinks, and finger foods for your next gathering.',
      type: 'seasonal',
      category: 'entertaining',
      rating: 4.7,
      popularity: 82,
      savings: 12.30,
      savingsPercent: 21,
      products: [
        { name: 'Tortilla Chips', category: 'Snacks', price: 3.99, image: null },
        { name: 'Guacamole Mix', category: 'Dips', price: 2.49, image: null },
        { name: 'Wings (2lbs)', category: 'Meat', price: 8.99, image: null },
        { name: 'Hot Sauce', category: 'Condiments', price: 3.49, image: null },
        { name: 'Beer (12-pack)', category: 'Beverages', price: 15.99, image: null },
        { name: 'Ice Cream', category: 'Frozen', price: 4.99, image: null }
      ],
      totalPrice: 39.94,
      bundlePrice: 34.99,
      reasons: [
        { type: 'seasonal-pairing', label: 'Game Season' },
        { type: 'frequently-bought-together', label: 'Party Staples' },
        { type: 'complementary', label: 'Complete Experience' }
      ],
      feedback: null
    },
    {
      id: 4,
      title: 'Home Spa Relaxation Kit',
      description: 'Transform your home into a spa with bath essentials, aromatherapy, and comfort items.',
      type: 'ai-recommended',
      category: 'health',
      rating: 4.5,
      popularity: 68,
      savings: 18.60,
      savingsPercent: 28,
      products: [
        { name: 'Epsom Salt', category: 'Bath', price: 4.99, image: null },
        { name: 'Essential Oils', category: 'Aromatherapy', price: 12.99, image: null },
        { name: 'Face Masks', category: 'Beauty', price: 8.49, image: null },
        { name: 'Herbal Tea', category: 'Beverages', price: 6.99, image: null },
        { name: 'Scented Candles', category: 'Home', price: 9.99, image: null }
      ],
      totalPrice: 43.45,
      bundlePrice: 37.99,
      reasons: [
        { type: 'complementary', label: 'Wellness Theme' },
        { type: 'frequently-bought-together', label: 'Self-Care Trend' },
        { type: 'seasonal-pairing', label: 'Stress Relief' }
      ],
      feedback: null
    },
    {
      id: 5,
      title: 'Family Movie Night Package',
      description: 'Cozy night in with popcorn, candy, drinks, and comfort snacks for the whole family.',
      type: 'popular',
      category: 'entertaining',
      rating: 4.9,
      popularity: 91,
      savings: 9.85,
      savingsPercent: 19,
      products: [
        { name: 'Microwave Popcorn', category: 'Snacks', price: 4.99, image: null },
        { name: 'Candy Assortment', category: 'Candy', price: 7.99, image: null },
        { name: 'Soda (6-pack)', category: 'Beverages', price: 5.49, image: null },
        { name: 'Ice Cream Bars', category: 'Frozen', price: 6.99, image: null },
        { name: 'Cozy Blanket', category: 'Home', price: 14.99, image: null }
      ],
      totalPrice: 40.45,
      bundlePrice: 34.99,
      reasons: [
        { type: 'frequently-bought-together', label: 'Family Activity' },
        { type: 'seasonal-pairing', label: 'Weekend Special' },
        { type: 'complementary', label: 'Complete Experience' }
      ],
      feedback: null
    },
    {
      id: 6,
      title: 'Green Cleaning Essentials',
      description: 'Eco-friendly cleaning products for a spotless and sustainable home.',
      type: 'trending',
      category: 'home-care',
      rating: 4.4,
      popularity: 73,
      savings: 11.20,
      savingsPercent: 24,
      products: [
        { name: 'All-Purpose Cleaner', category: 'Cleaning', price: 5.99, image: null },
        { name: 'Microfiber Cloths', category: 'Supplies', price: 7.99, image: null },
        { name: 'Glass Cleaner', category: 'Cleaning', price: 4.49, image: null },
        { name: 'Dish Soap', category: 'Kitchen', price: 3.99, image: null },
        { name: 'Bamboo Scrubbers', category: 'Supplies', price: 6.99, image: null }
      ],
      totalPrice: 29.45,
      bundlePrice: 24.99,
      reasons: [
        { type: 'complementary', label: 'Eco-Friendly' },
        { type: 'frequently-bought-together', label: 'Cleaning Day' },
        { type: 'seasonal-pairing', label: 'Spring Cleaning' }
      ],
      feedback: null
    }
  ];

  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = bundle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bundle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bundle.products.some(product => 
                           product.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesCategory = activeCategory === 'all' || bundle.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const addBundleToCart = (bundleId) => {
    console.log('Add bundle to cart:', bundleId);
  };

  const customizeBundle = (bundleId) => {
    console.log('Customize bundle:', bundleId);
  };

  const saveBundle = (bundleId) => {
    console.log('Save bundle:', bundleId);
  };

  const provideFeedback = (bundleId, positive) => {
    setFeedback(prev => ({
      ...prev,
      [bundleId]: positive
    }));
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'popular': return Star;
      case 'trending': return TrendingUp;
      case 'ai-recommended': return Brain;
      case 'seasonal': return Calendar;
      default: return Package;
    }
  };

  const getReasonIcon = (type) => {
    switch (type) {
      case 'frequently-bought-together': return Users;
      case 'seasonal-pairing': return Calendar;
      case 'recipe-based': return ChefHat;
      case 'complementary': return Lightbulb;
      default: return CheckCircle;
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
          <Package size={20} />
          Cross-Category Bundling
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search bundles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <ActionButton>
            <Filter size={16} />
            Filter
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
            Preferences
          </ActionButton>
          <ActionButton primary>
            <Plus size={16} />
            Create Bundle
          </ActionButton>
        </Controls>
      </Header>

      <BundlingInsights>
        <InsightsHeader>
          <InsightsTitle>
            <Sparkles size={16} />
            Smart Bundling Insights
          </InsightsTitle>
          <ActionButton style={{ padding: '4px 8px' }}>
            <Eye size={12} />
            View Analytics
          </ActionButton>
        </InsightsHeader>
        
        <InsightsStats>
          {insights.map((insight, index) => (
            <StatCard key={index}>
              <StatValue>{insight.value}</StatValue>
              <StatLabel>{insight.label}</StatLabel>
            </StatCard>
          ))}
        </InsightsStats>
      </BundlingInsights>

      <CategoryTabs>
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <CategoryTab
              key={category.id}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              <Icon size={16} />
              {category.label}
            </CategoryTab>
          );
        })}
      </CategoryTabs>

      <BundlesGrid>
        {filteredBundles.map((bundle, index) => {
          const BadgeIcon = getBadgeIcon(bundle.type);
          return (
            <BundleCard
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <FeedbackButtons>
                <FeedbackButton
                  positive
                  active={feedback[bundle.id] === true}
                  onClick={() => provideFeedback(bundle.id, true)}
                >
                  <ThumbsUp size={10} />
                </FeedbackButton>
                <FeedbackButton
                  active={feedback[bundle.id] === false}
                  onClick={() => provideFeedback(bundle.id, false)}
                >
                  <ThumbsDown size={10} />
                </FeedbackButton>
              </FeedbackButtons>

              <BundleHeader>
                <BundleTitle>{bundle.title}</BundleTitle>
                <BundleBadge type={bundle.type}>
                  <BadgeIcon size={10} />
                  {bundle.type.replace('-', ' ').toUpperCase()}
                </BundleBadge>
              </BundleHeader>

              <BundleDescription>{bundle.description}</BundleDescription>

              <BundleMetrics>
                <MetricItem>
                  <Star size={12} fill="currentColor" />
                  {bundle.rating}
                </MetricItem>
                <MetricItem>
                  <Users size={12} />
                  {bundle.popularity}% popularity
                </MetricItem>
                <MetricItem>
                  <Package size={12} />
                  {bundle.products.length} items
                </MetricItem>
              </BundleMetrics>

              <ProductsSection>
                <ProductsHeader>
                  <ProductsTitle>Bundle Contents</ProductsTitle>
                  <ProductsCount>{bundle.products.length} items</ProductsCount>
                </ProductsHeader>
                <ProductsList>
                  {bundle.products.slice(0, 4).map((product, productIndex) => (
                    <ProductItem key={productIndex}>
                      <ProductImage>
                        <Package size={16} color="#9ca3af" />
                      </ProductImage>
                      <ProductInfo>
                        <ProductName>{product.name}</ProductName>
                        <ProductCategory>{product.category}</ProductCategory>
                      </ProductInfo>
                      <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                    </ProductItem>
                  ))}
                  {bundle.products.length > 4 && (
                    <ProductItem>
                      <ProductImage>
                        <Plus size={16} color="#9ca3af" />
                      </ProductImage>
                      <ProductInfo>
                        <ProductName>+{bundle.products.length - 4} more items</ProductName>
                        <ProductCategory>View all items</ProductCategory>
                      </ProductInfo>
                    </ProductItem>
                  )}
                </ProductsList>
              </ProductsSection>

              <PricingSection>
                <PricingHeader>
                  <PricingLabel>Individual Total:</PricingLabel>
                  <PricingValue style={{ textDecoration: 'line-through', color: '#9ca3af' }}>
                    ${bundle.totalPrice.toFixed(2)}
                  </PricingValue>
                </PricingHeader>
                <PricingHeader>
                  <PricingLabel>Bundle Price:</PricingLabel>
                  <PricingValue>${bundle.bundlePrice.toFixed(2)}</PricingValue>
                </PricingHeader>
                <SavingsHighlight>
                  <DollarSign size={12} />
                  Save ${bundle.savings.toFixed(2)} ({bundle.savingsPercent}% off)
                </SavingsHighlight>
              </PricingSection>

              <BundleReasons>
                <ReasonsTitle>Why This Bundle?</ReasonsTitle>
                <ReasonsList>
                  {bundle.reasons.map((reason, reasonIndex) => {
                    const ReasonIcon = getReasonIcon(reason.type);
                    return (
                      <ReasonTag key={reasonIndex} reason={reason.type}>
                        <ReasonIcon size={8} />
                        {reason.label}
                      </ReasonTag>
                    );
                  })}
                </ReasonsList>
              </BundleReasons>

              <BundleActions>
                <BundleButton 
                  variant="primary"
                  onClick={() => addBundleToCart(bundle.id)}
                >
                  <ShoppingCart size={14} />
                  Add Bundle
                </BundleButton>
                <BundleButton onClick={() => customizeBundle(bundle.id)}>
                  <Settings size={14} />
                  Customize
                </BundleButton>
                <BundleButton onClick={() => saveBundle(bundle.id)}>
                  <Heart size={14} />
                  Save
                </BundleButton>
              </BundleActions>
            </BundleCard>
          );
        })}
      </BundlesGrid>
    </Container>
  );
};

export default CrossCategoryBundlingSuggestions;