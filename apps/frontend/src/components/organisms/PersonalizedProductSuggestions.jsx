import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Star, 
  Heart, 
  ShoppingCart, 
  TrendingUp, 
  Brain, 
  Target, 
  Clock,
  DollarSign,
  Package,
  Eye,
  Filter,
  Search,
  Grid,
  List,
  Shuffle,
  Settings,
  Award,
  Zap,
  Calendar,
  MapPin,
  Users,
  ThumbsUp,
  ChevronRight,
  X,
  Plus,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

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

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: 8px 12px;
  border: none;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'white'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.gray[50]};
  }
`;

const PersonalizationOverview = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}10, ${({ theme }) => theme.colors.primary}05);
  border: 1px solid ${({ theme }) => theme.colors.primary}20;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const OverviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const OverviewTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PersonalizationStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minWidth(120px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const PreferenceRadar = styled.div`
  height: 160px;
  background: white;
  border-radius: 8px;
  padding: 12px;
`;

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: ${({ view }) => view === 'grid' ? '1fr' : '2fr 1fr'};
  gap: 24px;
  flex: 1;
  min-height: 0;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const SuggestionsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FilterCategories = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const CategoryChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.gray[100]};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const SuggestionsList = styled.div`
  display: ${({ view }) => view === 'grid' ? 'grid' : 'flex'};
  grid-template-columns: ${({ view }) => 
    view === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'none'};
  flex-direction: ${({ view }) => view === 'list' ? 'column' : 'row'};
  gap: ${({ view }) => view === 'grid' ? '16px' : '12px'};
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const SuggestionCard = styled(motion.div)`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  padding: ${({ view }) => view === 'grid' ? '16px' : '12px'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: ${({ view }) => view === 'list' ? 'flex' : 'block'};
  align-items: ${({ view }) => view === 'list' ? 'center' : 'stretch'};
  gap: ${({ view }) => view === 'list' ? '12px' : '0'};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.div`
  width: ${({ view }) => view === 'grid' ? '100%' : '80px'};
  height: ${({ view }) => view === 'grid' ? '120px' : '80px'};
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ view }) => view === 'grid' ? '12px' : '0'};
  flex-shrink: 0;
`;

const ProductContent = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: ${({ view }) => view === 'grid' ? '14px' : '16px'};
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

const PersonalizationTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
`;

const PersonalizationTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'preference': return theme.colors.primary;
      case 'history': return theme.colors.success;
      case 'trending': return theme.colors.warning;
      case 'health': return theme.colors.error;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
`;

const ProductPrice = styled.div`
  font-size: ${({ view }) => view === 'grid' ? '16px' : '18px'};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ view }) => view === 'grid' ? '8px' : '4px'};
`;

const MatchScore = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ScoreBar = styled.div`
  flex: 1;
  height: 4px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 2px;
  overflow: hidden;
`;

const ScoreFill = styled.div`
  height: 100%;
  background: ${({ score, theme }) => 
    score > 80 ? theme.colors.success : 
    score > 60 ? theme.colors.warning : theme.colors.error};
  width: ${({ score }) => score}%;
  transition: width 0.3s ease;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: ${({ view }) => view === 'list' ? '0' : '8px'};
`;

const ProductButton = styled.button`
  flex: ${({ view }) => view === 'grid' ? '1' : '0'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: ${({ view }) => view === 'grid' ? '8px 12px' : '6px 8px'};
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

const AnalyticsPanel = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const AnalyticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AnalyticsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartContainer = styled.div`
  height: 200px;
  margin-bottom: 20px;
`;

const PersonalizedProductSuggestions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const stats = [
    { value: '94%', label: 'Match Accuracy' },
    { value: '127', label: 'Products Analyzed' },
    { value: '23', label: 'New Suggestions' },
    { value: '4.8', label: 'Avg Rating' }
  ];

  const preferenceData = [
    { subject: 'Organic', A: 90, fullMark: 100 },
    { subject: 'Local', A: 75, fullMark: 100 },
    { subject: 'Health', A: 85, fullMark: 100 },
    { subject: 'Budget', A: 60, fullMark: 100 },
    { subject: 'Convenience', A: 70, fullMark: 100 },
    { subject: 'Quality', A: 95, fullMark: 100 }
  ];

  const categories = [
    { id: 'all', label: 'All Products', icon: Package },
    { id: 'dairy', label: 'Dairy & Eggs', icon: Package },
    { id: 'produce', label: 'Fresh Produce', icon: Package },
    { id: 'pantry', label: 'Pantry Staples', icon: Package },
    { id: 'health', label: 'Health & Beauty', icon: Heart },
    { id: 'organic', label: 'Organic', icon: Star }
  ];

  const suggestions = [
    {
      id: 1,
      name: 'Organic Quinoa Blend',
      brand: 'Ancient Grains Co',
      price: 8.99,
      category: 'pantry',
      image: null,
      matchScore: 94,
      tags: [
        { type: 'preference', label: 'Organic Match' },
        { type: 'health', label: 'High Protein' },
        { type: 'history', label: 'Previous Purchase' }
      ],
      rating: 4.7,
      reasons: ['Matches your organic preference', 'High protein content', 'Previously purchased similar']
    },
    {
      id: 2,
      name: 'Local Honey Raw',
      brand: 'Valley Beekeepers',
      price: 12.50,
      category: 'pantry',
      image: null,
      matchScore: 89,
      tags: [
        { type: 'preference', label: 'Local Source' },
        { type: 'health', label: 'Natural' },
        { type: 'trending', label: 'Popular' }
      ],
      rating: 4.9,
      reasons: ['Supports local producers', 'Natural sweetener', 'Trending in your area']
    },
    {
      id: 3,
      name: 'Probiotic Greek Yogurt',
      brand: 'Wellness Dairy',
      price: 6.25,
      category: 'dairy',
      image: null,
      matchScore: 92,
      tags: [
        { type: 'health', label: 'Probiotic' },
        { type: 'preference', label: 'High Protein' },
        { type: 'history', label: 'Frequent Buy' }
      ],
      rating: 4.6,
      reasons: ['Supports digestive health', 'High protein content', 'Frequently purchased']
    },
    {
      id: 4,
      name: 'Organic Baby Spinach',
      brand: 'Green Valley Farms',
      price: 4.75,
      category: 'produce',
      image: null,
      matchScore: 87,
      tags: [
        { type: 'preference', label: 'Organic' },
        { type: 'health', label: 'Nutrient Dense' },
        { type: 'history', label: 'Weekly Pattern' }
      ],
      rating: 4.4,
      reasons: ['Organic certified', 'Rich in nutrients', 'Weekly purchase pattern']
    },
    {
      id: 5,
      name: 'Coconut Oil Virgin',
      brand: 'Tropical Wellness',
      price: 15.99,
      category: 'health',
      image: null,
      matchScore: 83,
      tags: [
        { type: 'health', label: 'MCT Rich' },
        { type: 'preference', label: 'Natural' },
        { type: 'trending', label: 'Wellness Trend' }
      ],
      rating: 4.8,
      reasons: ['Rich in MCTs', 'Natural and unprocessed', 'Wellness trending']
    },
    {
      id: 6,
      name: 'Almond Flour',
      brand: 'Nutty Goodness',
      price: 9.99,
      category: 'pantry',
      image: null,
      matchScore: 91,
      tags: [
        { type: 'health', label: 'Gluten Free' },
        { type: 'preference', label: 'Low Carb' },
        { type: 'history', label: 'Baking Habit' }
      ],
      rating: 4.5,
      reasons: ['Gluten-free alternative', 'Low carb option', 'Matches baking habits']
    }
  ];

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesCategory = activeCategory === 'all' || suggestion.category === activeCategory;
    const matchesSearch = suggestion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (productId) => {
    console.log('Add to cart:', productId);
  };

  const addToFavorites = (productId) => {
    console.log('Add to favorites:', productId);
  };

  const viewDetails = (productId) => {
    console.log('View details:', productId);
  };

  const getTagIcon = (type) => {
    switch (type) {
      case 'preference': return User;
      case 'history': return Clock;
      case 'trending': return TrendingUp;
      case 'health': return Heart;
      default: return Star;
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
          <User size={20} />
          Personalized Suggestions
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <ViewToggle>
            <ViewButton 
              active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </ViewButton>
            <ViewButton 
              active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </ViewButton>
          </ViewToggle>
          <ActionButton>
            <Filter size={16} />
            Filter
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
            Preferences
          </ActionButton>
        </Controls>
      </Header>

      <PersonalizationOverview>
        <OverviewHeader>
          <OverviewTitle>
            <Brain size={16} />
            Your Personalization Profile
          </OverviewTitle>
          <ActionButton style={{ padding: '4px 8px' }}>
            <Eye size={12} />
            View Profile
          </ActionButton>
        </OverviewHeader>
        
        <PersonalizationStats>
          {stats.map((stat, index) => (
            <StatCard key={index}>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </PersonalizationStats>
        
        <PreferenceRadar>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={preferenceData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Your Preferences" 
                dataKey="A" 
                stroke="#4f46e5" 
                fill="#4f46e5" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </PreferenceRadar>
      </PersonalizationOverview>

      <FilterCategories>
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <CategoryChip
              key={category.id}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              <Icon size={12} />
              {category.label}
            </CategoryChip>
          );
        })}
      </FilterCategories>

      <ContentLayout view={viewMode}>
        <SuggestionsPanel>
          <SuggestionsList view={viewMode}>
            {filteredSuggestions.map((suggestion, index) => (
              <SuggestionCard
                key={suggestion.id}
                view={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProductImage view={viewMode}>
                  <Package size={viewMode === 'grid' ? 32 : 24} color="#9ca3af" />
                </ProductImage>

                <ProductContent>
                  <ProductName view={viewMode}>{suggestion.name}</ProductName>
                  <ProductBrand>{suggestion.brand}</ProductBrand>
                  
                  <PersonalizationTags>
                    {suggestion.tags.map((tag, tagIndex) => {
                      const TagIcon = getTagIcon(tag.type);
                      return (
                        <PersonalizationTag key={tagIndex} type={tag.type}>
                          <TagIcon size={8} />
                          {tag.label}
                        </PersonalizationTag>
                      );
                    })}
                  </PersonalizationTags>

                  <ProductPrice view={viewMode}>
                    ${suggestion.price.toFixed(2)}
                  </ProductPrice>

                  <MatchScore>
                    <Brain size={12} />
                    <span>Match:</span>
                    <ScoreBar>
                      <ScoreFill score={suggestion.matchScore} />
                    </ScoreBar>
                    <span>{suggestion.matchScore}%</span>
                  </MatchScore>

                  <ProductActions view={viewMode}>
                    <ProductButton 
                      variant="primary" 
                      view={viewMode}
                      onClick={() => addToCart(suggestion.id)}
                    >
                      <ShoppingCart size={12} />
                      {viewMode === 'grid' && 'Add to Cart'}
                    </ProductButton>
                    <ProductButton 
                      view={viewMode}
                      onClick={() => addToFavorites(suggestion.id)}
                    >
                      <Heart size={12} />
                      {viewMode === 'grid' && 'Save'}
                    </ProductButton>
                    {viewMode === 'list' && (
                      <ProductButton 
                        view={viewMode}
                        onClick={() => viewDetails(suggestion.id)}
                      >
                        <Eye size={12} />
                      </ProductButton>
                    )}
                  </ProductActions>
                </ProductContent>
              </SuggestionCard>
            ))}
          </SuggestionsList>
        </SuggestionsPanel>

        {viewMode === 'list' && (
          <AnalyticsPanel>
            <AnalyticsHeader>
              <AnalyticsTitle>
                <BarChart3 size={16} />
                Personalization Analytics
              </AnalyticsTitle>
            </AnalyticsHeader>
            
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { week: 'Week 1', accuracy: 78, suggestions: 45 },
                  { week: 'Week 2', accuracy: 82, suggestions: 52 },
                  { week: 'Week 3', accuracy: 87, suggestions: 48 },
                  { week: 'Week 4', accuracy: 94, suggestions: 51 }
                ]}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="accuracy" 
                    stackId="1"
                    stroke="#4f46e5" 
                    fill="#4f46e5" 
                    name="Accuracy %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px' 
            }}>
              <div style={{ 
                background: 'white', 
                borderRadius: '8px', 
                padding: '12px', 
                textAlign: 'center' 
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: '#374151', 
                  marginBottom: '4px' 
                }}>
                  127
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280' 
                }}>
                  Products Learned
                </div>
              </div>
              <div style={{ 
                background: 'white', 
                borderRadius: '8px', 
                padding: '12px', 
                textAlign: 'center' 
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: '#374151', 
                  marginBottom: '4px' 
                }}>
                  89%
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280' 
                }}>
                  Satisfaction Rate
                </div>
              </div>
            </div>
          </AnalyticsPanel>
        )}
      </ContentLayout>
    </Container>
  );
};

export default PersonalizedProductSuggestions;