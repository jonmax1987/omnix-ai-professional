import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Gift, 
  Star, 
  Heart, 
  ShoppingCart, 
  Clock, 
  TrendingUp,
  Snowflake,
  Sun,
  Leaf,
  Flower,
  Package,
  Award,
  Target,
  Brain,
  Sparkles,
  Users,
  ChefHat,
  Coffee,
  Cake,
  Wine,
  Apple,
  Utensils,
  Home,
  PartyPopper,
  Crown,
  Flame,
  Zap,
  Eye,
  Filter,
  Search,
  Plus,
  Settings,
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
  width: 180px;
  
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

const SeasonalBanner = styled.div`
  background: linear-gradient(135deg, ${({ season }) => {
    switch (season) {
      case 'winter': return '#3b82f6, #1e40af';
      case 'spring': return '#10b981, #059669';
      case 'summer': return '#f59e0b, #d97706';
      case 'fall': return '#ef4444, #dc2626';
      default: return '#4f46e5, #3730a3';
    }
  }});
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
`;

const BannerContent = styled.div`
  position: relative;
  z-index: 2;
`;

const BannerTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BannerSubtitle = styled.p`
  font-size: 16px;
  margin: 0 0 16px 0;
  opacity: 0.9;
`;

const BannerStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
`;

const BannerStat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const BannerDecoration = styled.div`
  position: absolute;
  top: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const SuggestionCard = styled(motion.div)`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardImage = styled.div`
  height: 140px;
  background: ${({ category, theme }) => {
    switch (category) {
      case 'holiday-meals': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'seasonal-produce': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'decorations': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'beverages': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case 'gifts': return 'linear-gradient(135deg, #f97316, #ea580c)';
      default: return 'linear-gradient(135deg, #4f46e5, #3730a3)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const CardIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SeasonalBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProductsList = styled.div`
  margin-bottom: 16px;
`;

const ProductsHeader = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ProductTag = styled.div`
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const CardButton = styled.button`
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

const SeasonalHolidaySuggestions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentSeason, setCurrentSeason] = useState('winter');

  const seasonalStats = {
    suggestions: '24',
    trending: '67%',
    savings: '$45.20',
    popularity: '89%'
  };

  const categories = [
    { id: 'all', label: 'All Suggestions', icon: Sparkles },
    { id: 'holiday-meals', label: 'Holiday Meals', icon: ChefHat },
    { id: 'seasonal-produce', label: 'Seasonal Produce', icon: Apple },
    { id: 'decorations', label: 'Decorations', icon: Star },
    { id: 'beverages', label: 'Holiday Beverages', icon: Coffee },
    { id: 'gifts', label: 'Gift Ideas', icon: Gift },
    { id: 'entertaining', label: 'Entertaining', icon: Users }
  ];

  const suggestions = [
    {
      id: 1,
      title: 'Christmas Dinner Essentials',
      description: 'Everything you need for a perfect Christmas dinner, from turkey to all the trimmings.',
      category: 'holiday-meals',
      season: 'winter',
      trending: true,
      savings: 15,
      popularity: 94,
      products: ['Turkey', 'Cranberry Sauce', 'Brussels Sprouts', 'Sweet Potatoes', 'Stuffing Mix'],
      icon: ChefHat,
      estimatedCost: '$87.50',
      serves: '8-10 people'
    },
    {
      id: 2,
      title: 'Winter Citrus Collection',
      description: 'Brighten up winter days with fresh, vitamin-rich citrus fruits at their seasonal peak.',
      category: 'seasonal-produce',
      season: 'winter',
      trending: false,
      savings: 20,
      popularity: 87,
      products: ['Blood Oranges', 'Ruby Grapefruit', 'Meyer Lemons', 'Clementines', 'Limes'],
      icon: Apple,
      estimatedCost: '$24.99',
      serves: 'Family of 4'
    },
    {
      id: 3,
      title: 'Holiday Baking Bundle',
      description: 'Premium baking ingredients and tools for creating memorable holiday treats.',
      category: 'holiday-meals',
      season: 'winter',
      trending: true,
      savings: 12,
      popularity: 91,
      products: ['Premium Flour', 'Vanilla Extract', 'Chocolate Chips', 'Baking Spices', 'Cookie Cutters'],
      icon: Cake,
      estimatedCost: '$45.30',
      serves: 'Multiple batches'
    },
    {
      id: 4,
      title: 'Festive Table Decorations',
      description: 'Create a magical dining atmosphere with elegant holiday table decoration essentials.',
      category: 'decorations',
      season: 'winter',
      trending: false,
      savings: 25,
      popularity: 78,
      products: ['Candles', 'Table Runner', 'Napkin Rings', 'Centerpiece Kit', 'Place Cards'],
      icon: Star,
      estimatedCost: '$32.75',
      serves: 'Table for 8'
    },
    {
      id: 5,
      title: 'Holiday Cocktail Collection',
      description: 'Signature holiday cocktails and mocktails to impress your guests this season.',
      category: 'beverages',
      season: 'winter',
      trending: true,
      savings: 18,
      popularity: 89,
      products: ['Cranberry Juice', 'Sparkling Cider', 'Cocktail Garnishes', 'Premium Mixers', 'Party Glasses'],
      icon: Wine,
      estimatedCost: '$56.80',
      serves: '12-15 drinks'
    },
    {
      id: 6,
      title: 'Gourmet Gift Baskets',
      description: 'Curated selection of premium foods perfect for gifting to loved ones.',
      category: 'gifts',
      season: 'winter',
      trending: false,
      savings: 30,
      popularity: 82,
      products: ['Artisan Chocolates', 'Specialty Coffee', 'Gourmet Cheese', 'Crackers', 'Gift Wrapping'],
      icon: Gift,
      estimatedCost: '$78.25',
      serves: '3-4 gifts'
    },
    {
      id: 7,
      title: 'New Year Party Essentials',
      description: 'Ring in the new year with style - everything needed for an unforgettable celebration.',
      category: 'entertaining',
      season: 'winter',
      trending: true,
      savings: 22,
      popularity: 93,
      products: ['Champagne', 'Party Appetizers', 'Confetti', 'Noise Makers', 'Midnight Snacks'],
      icon: PartyPopper,
      estimatedCost: '$89.40',
      serves: '15-20 guests'
    },
    {
      id: 8,
      title: 'Cozy Winter Comfort Foods',
      description: 'Warm up with hearty soups, stews, and comfort foods perfect for cold winter days.',
      category: 'seasonal-produce',
      season: 'winter',
      trending: false,
      savings: 16,
      popularity: 85,
      products: ['Root Vegetables', 'Soup Bones', 'Fresh Herbs', 'Warming Spices', 'Bread'],
      icon: Utensils,
      estimatedCost: '$42.60',
      serves: '6-8 meals'
    }
  ];

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.products.some(product => 
                           product.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesCategory = activeCategory === 'all' || suggestion.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const addAllToCart = (suggestionId) => {
    console.log('Add all items to cart:', suggestionId);
  };

  const saveCollection = (suggestionId) => {
    console.log('Save collection:', suggestionId);
  };

  const viewDetails = (suggestionId) => {
    console.log('View details:', suggestionId);
  };

  const getSeasonIcon = (season) => {
    switch (season) {
      case 'winter': return Snowflake;
      case 'spring': return Flower;
      case 'summer': return Sun;
      case 'fall': return Leaf;
      default: return Calendar;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'holiday-meals': return ChefHat;
      case 'seasonal-produce': return Apple;
      case 'decorations': return Star;
      case 'beverages': return Coffee;
      case 'gifts': return Gift;
      case 'entertaining': return Users;
      default: return Package;
    }
  };

  const SeasonIcon = getSeasonIcon(currentSeason);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Calendar size={20} />
          Seasonal & Holiday Suggestions
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search suggestions..."
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
            Create List
          </ActionButton>
        </Controls>
      </Header>

      <SeasonalBanner season={currentSeason}>
        <BannerContent>
          <BannerTitle>
            <SeasonIcon size={28} />
            Winter Holiday Season
          </BannerTitle>
          <BannerSubtitle>
            Discover personalized suggestions for the perfect holiday season based on your preferences and shopping history.
          </BannerSubtitle>
          <BannerStats>
            <BannerStat>
              <StatValue>{seasonalStats.suggestions}</StatValue>
              <StatLabel>New Suggestions</StatLabel>
            </BannerStat>
            <BannerStat>
              <StatValue>{seasonalStats.trending}</StatValue>
              <StatLabel>Trending Items</StatLabel>
            </BannerStat>
            <BannerStat>
              <StatValue>{seasonalStats.savings}</StatValue>
              <StatLabel>Potential Savings</StatLabel>
            </BannerStat>
            <BannerStat>
              <StatValue>{seasonalStats.popularity}</StatValue>
              <StatLabel>Match Score</StatLabel>
            </BannerStat>
          </BannerStats>
        </BannerContent>
        <BannerDecoration>
          <Sparkles size={40} />
        </BannerDecoration>
      </SeasonalBanner>

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

      <SuggestionsGrid>
        {filteredSuggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <SuggestionCard
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardImage category={suggestion.category}>
                <CardIcon>
                  <Icon size={28} />
                </CardIcon>
                <SeasonalBadge>
                  {suggestion.trending && <TrendingUp size={10} />}
                  {suggestion.savings}% OFF
                </SeasonalBadge>
              </CardImage>

              <CardContent>
                <CardTitle>{suggestion.title}</CardTitle>
                <CardDescription>{suggestion.description}</CardDescription>

                <CardMeta>
                  <MetaItem>
                    <Target size={12} />
                    {suggestion.popularity}% match
                  </MetaItem>
                  <MetaItem>
                    <Users size={12} />
                    {suggestion.serves}
                  </MetaItem>
                  <MetaItem>
                    <Award size={12} />
                    Popular
                  </MetaItem>
                </CardMeta>

                <ProductsList>
                  <ProductsHeader>
                    Includes {suggestion.products.length} items • {suggestion.estimatedCost}
                  </ProductsHeader>
                  <ProductTags>
                    {suggestion.products.slice(0, 4).map((product, productIndex) => (
                      <ProductTag key={productIndex}>
                        {product}
                      </ProductTag>
                    ))}
                    {suggestion.products.length > 4 && (
                      <ProductTag>
                        +{suggestion.products.length - 4} more
                      </ProductTag>
                    )}
                  </ProductTags>
                </ProductsList>

                <CardActions>
                  <CardButton 
                    variant="primary"
                    onClick={() => addAllToCart(suggestion.id)}
                  >
                    <ShoppingCart size={14} />
                    Add All to Cart
                  </CardButton>
                  <CardButton onClick={() => saveCollection(suggestion.id)}>
                    <Heart size={14} />
                    Save
                  </CardButton>
                  <CardButton onClick={() => viewDetails(suggestion.id)}>
                    <Eye size={14} />
                    Details
                  </CardButton>
                </CardActions>
              </CardContent>
            </SuggestionCard>
          );
        })}
      </SuggestionsGrid>
    </Container>
  );
};

export default SeasonalHolidaySuggestions;