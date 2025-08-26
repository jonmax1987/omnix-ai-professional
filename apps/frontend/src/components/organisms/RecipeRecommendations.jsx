import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  BookOpen, 
  ShoppingCart,
  Plus,
  Filter,
  Search,
  Grid,
  List,
  Bookmark,
  Play,
  Download,
  Share2,
  TrendingUp,
  Target,
  Brain,
  Utensils,
  Coffee,
  Apple,
  Salad,
  Pizza,
  Soup,
  Cookie,
  Beef,
  Fish,
  Leaf,
  Fire,
  Award,
  CheckCircle,
  ChevronRight,
  Eye,
  Timer
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

const AIInsights = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}10, ${({ theme }) => theme.colors.primary}05);
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

const PersonalizedStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 12px;
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

const TasteProfile = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const FilterTab = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
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

const RecipeGrid = styled.div`
  display: ${({ view }) => view === 'grid' ? 'grid' : 'flex'};
  grid-template-columns: ${({ view }) => 
    view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none'};
  flex-direction: ${({ view }) => view === 'list' ? 'column' : 'row'};
  gap: ${({ view }) => view === 'grid' ? '20px' : '16px'};
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const RecipeCard = styled(motion.div)`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: ${({ view }) => view === 'list' ? 'flex' : 'block'};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const RecipeImage = styled.div`
  width: ${({ view }) => view === 'grid' ? '100%' : '200px'};
  height: ${({ view }) => view === 'grid' ? '180px' : '120px'};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gray[200]}, ${({ theme }) => theme.colors.gray[100]});
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const RecipeContent = styled.div`
  padding: 16px;
  flex: 1;
`;

const RecipeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const RecipeName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: 1.2;
  flex: 1;
`;

const FavoriteButton = styled.button`
  background: none;
  border: none;
  color: ${({ favorited, theme }) => favorited ? theme.colors.error : theme.colors.text.secondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.error};
  }
`;

const RecipeDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RecipeMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RecipeTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const RecipeTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'dietary': return theme.colors.success;
      case 'difficulty': return theme.colors.warning;
      case 'cuisine': return theme.colors.primary;
      case 'meal': return theme.colors.error;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
`;

const MatchScore = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
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

const RecipeActions = styled.div`
  display: flex;
  gap: 8px;
`;

const RecipeButton = styled.button`
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

const MissingIngredients = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${({ theme }) => theme.colors.warning};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RecipeRecommendations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('for-you');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());

  const personalizedStats = [
    { value: '94%', label: 'Taste Match' },
    { value: '23', label: 'New Recipes' },
    { value: '4.8', label: 'Avg Rating' },
    { value: '12 min', label: 'Avg Cook Time' }
  ];

  const filterTabs = [
    { id: 'for-you', label: 'For You', icon: Target },
    { id: 'quick', label: 'Quick & Easy', icon: Timer },
    { id: 'healthy', label: 'Healthy', icon: Leaf },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'vegetarian', label: 'Vegetarian', icon: Salad },
    { id: 'dessert', label: 'Desserts', icon: Cookie }
  ];

  const recipes = [
    {
      id: 1,
      name: 'Mediterranean Quinoa Bowl',
      description: 'A healthy and colorful bowl packed with protein-rich quinoa, fresh vegetables, and tahini dressing.',
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      rating: 4.8,
      matchScore: 94,
      cuisine: 'Mediterranean',
      mealType: 'Lunch',
      tags: [
        { type: 'dietary', label: 'Vegetarian', icon: Leaf },
        { type: 'difficulty', label: 'Easy', icon: CheckCircle },
        { type: 'meal', label: 'Healthy', icon: Heart }
      ],
      missingIngredients: 0,
      favorited: false,
      ingredients: ['quinoa', 'tomatoes', 'cucumber', 'feta cheese', 'olive oil'],
      ownedIngredients: 5
    },
    {
      id: 2,
      name: 'One-Pan Lemon Herb Chicken',
      description: 'Juicy chicken thighs with roasted vegetables in a zesty lemon herb marinade.',
      cookTime: 35,
      servings: 6,
      difficulty: 'Medium',
      rating: 4.6,
      matchScore: 89,
      cuisine: 'American',
      mealType: 'Dinner',
      tags: [
        { type: 'difficulty', label: 'Medium', icon: Fire },
        { type: 'meal', label: 'Protein Rich', icon: Beef },
        { type: 'cuisine', label: 'Comfort Food', icon: Utensils }
      ],
      missingIngredients: 2,
      favorited: true,
      ingredients: ['chicken thighs', 'lemon', 'herbs', 'potatoes', 'carrots'],
      ownedIngredients: 3
    },
    {
      id: 3,
      name: 'Avocado Toast Variations',
      description: 'Three creative ways to elevate your avocado toast with seasonal toppings.',
      cookTime: 10,
      servings: 2,
      difficulty: 'Easy',
      rating: 4.4,
      matchScore: 87,
      cuisine: 'Contemporary',
      mealType: 'Breakfast',
      tags: [
        { type: 'dietary', label: 'Vegetarian', icon: Leaf },
        { type: 'difficulty', label: 'Easy', icon: CheckCircle },
        { type: 'meal', label: 'Quick', icon: Timer }
      ],
      missingIngredients: 1,
      favorited: false,
      ingredients: ['avocado', 'sourdough bread', 'eggs', 'tomatoes'],
      ownedIngredients: 3
    },
    {
      id: 4,
      name: 'Thai Coconut Curry',
      description: 'Aromatic and creamy coconut curry with vegetables and your choice of protein.',
      cookTime: 30,
      servings: 4,
      difficulty: 'Medium',
      rating: 4.9,
      matchScore: 92,
      cuisine: 'Thai',
      mealType: 'Dinner',
      tags: [
        { type: 'cuisine', label: 'Asian', icon: Soup },
        { type: 'difficulty', label: 'Medium', icon: Fire },
        { type: 'meal', label: 'Spicy', icon: Fire }
      ],
      missingIngredients: 3,
      favorited: false,
      ingredients: ['coconut milk', 'curry paste', 'vegetables', 'jasmine rice'],
      ownedIngredients: 2
    },
    {
      id: 5,
      name: 'Blueberry Overnight Oats',
      description: 'Creamy overnight oats with fresh blueberries and a touch of vanilla.',
      cookTime: 5,
      servings: 2,
      difficulty: 'Easy',
      rating: 4.7,
      matchScore: 85,
      cuisine: 'American',
      mealType: 'Breakfast',
      tags: [
        { type: 'dietary', label: 'Healthy', icon: Heart },
        { type: 'difficulty', label: 'Easy', icon: CheckCircle },
        { type: 'meal', label: 'Make Ahead', icon: Clock }
      ],
      missingIngredients: 0,
      favorited: true,
      ingredients: ['oats', 'milk', 'blueberries', 'vanilla', 'honey'],
      ownedIngredients: 5
    },
    {
      id: 6,
      name: 'Grilled Salmon with Asparagus',
      description: 'Perfectly grilled salmon with crispy asparagus and lemon butter sauce.',
      cookTime: 20,
      servings: 4,
      difficulty: 'Medium',
      rating: 4.8,
      matchScore: 91,
      cuisine: 'Contemporary',
      mealType: 'Dinner',
      tags: [
        { type: 'meal', label: 'Seafood', icon: Fish },
        { type: 'difficulty', label: 'Medium', icon: Fire },
        { type: 'dietary', label: 'Keto Friendly', icon: Target }
      ],
      missingIngredients: 1,
      favorited: false,
      ingredients: ['salmon fillets', 'asparagus', 'lemon', 'butter'],
      ownedIngredients: 3
    }
  ];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (activeFilter) {
      case 'quick':
        matchesFilter = recipe.cookTime <= 20;
        break;
      case 'healthy':
        matchesFilter = recipe.tags.some(tag => tag.label === 'Healthy' || tag.label === 'Vegetarian');
        break;
      case 'trending':
        matchesFilter = recipe.rating >= 4.7;
        break;
      case 'vegetarian':
        matchesFilter = recipe.tags.some(tag => tag.label === 'Vegetarian');
        break;
      case 'dessert':
        matchesFilter = recipe.mealType === 'Dessert' || recipe.tags.some(tag => tag.label === 'Sweet');
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const toggleFavorite = (recipeId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(recipeId)) {
        newFavorites.delete(recipeId);
      } else {
        newFavorites.add(recipeId);
      }
      return newFavorites;
    });
  };

  const viewRecipe = (recipeId) => {
    console.log('View recipe:', recipeId);
  };

  const addIngredientsToCart = (recipeId) => {
    console.log('Add ingredients to cart:', recipeId);
  };

  const startCooking = (recipeId) => {
    console.log('Start cooking:', recipeId);
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <ChefHat size={20} />
          Recipe Recommendations
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search recipes..."
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
            <Bookmark size={16} />
            Saved ({favorites.size})
          </ActionButton>
        </Controls>
      </Header>

      <AIInsights>
        <InsightsHeader>
          <InsightsTitle>
            <Brain size={16} />
            Personalized Recipe Insights
          </InsightsTitle>
          <ActionButton style={{ padding: '4px 8px' }}>
            <Eye size={12} />
            View Profile
          </ActionButton>
        </InsightsHeader>
        
        <PersonalizedStats>
          {personalizedStats.map((stat, index) => (
            <StatCard key={index}>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </PersonalizedStats>
        
        <TasteProfile>
          <ChefHat size={16} />
          <span>Your taste profile: Mediterranean flavors, healthy ingredients, quick prep times</span>
        </TasteProfile>
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
              <Icon size={12} />
              {tab.label}
            </FilterTab>
          );
        })}
      </FilterTabs>

      <RecipeGrid view={viewMode}>
        {filteredRecipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            view={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {recipe.missingIngredients > 0 && (
              <MissingIngredients>
                <ShoppingCart size={10} />
                {recipe.missingIngredients} missing
              </MissingIngredients>
            )}

            <RecipeImage view={viewMode}>
              <ChefHat size={32} color="#9ca3af" />
              <PlayButton onClick={() => viewRecipe(recipe.id)}>
                <Play size={16} color="#4f46e5" />
              </PlayButton>
            </RecipeImage>

            <RecipeContent>
              <RecipeHeader>
                <RecipeName>{recipe.name}</RecipeName>
                <FavoriteButton 
                  favorited={favorites.has(recipe.id)}
                  onClick={() => toggleFavorite(recipe.id)}
                >
                  <Heart 
                    size={16} 
                    fill={favorites.has(recipe.id) ? 'currentColor' : 'none'} 
                  />
                </FavoriteButton>
              </RecipeHeader>

              <RecipeDescription>{recipe.description}</RecipeDescription>

              <RecipeMeta>
                <MetaItem>
                  <Clock size={12} />
                  {recipe.cookTime} min
                </MetaItem>
                <MetaItem>
                  <Users size={12} />
                  {recipe.servings} servings
                </MetaItem>
                <MetaItem>
                  <Star size={12} fill="currentColor" />
                  {recipe.rating}
                </MetaItem>
              </RecipeMeta>

              <RecipeTags>
                {recipe.tags.map((tag, tagIndex) => {
                  const TagIcon = tag.icon;
                  return (
                    <RecipeTag key={tagIndex} type={tag.type}>
                      <TagIcon size={8} />
                      {tag.label}
                    </RecipeTag>
                  );
                })}
              </RecipeTags>

              <MatchScore>
                <Brain size={12} />
                <span>Match:</span>
                <ScoreBar>
                  <ScoreFill score={recipe.matchScore} />
                </ScoreBar>
                <span>{recipe.matchScore}%</span>
              </MatchScore>

              <RecipeActions>
                <RecipeButton 
                  variant="primary"
                  onClick={() => addIngredientsToCart(recipe.id)}
                >
                  <ShoppingCart size={12} />
                  Add Ingredients
                </RecipeButton>
                <RecipeButton onClick={() => startCooking(recipe.id)}>
                  <Play size={12} />
                  Start Cooking
                </RecipeButton>
              </RecipeActions>
            </RecipeContent>
          </RecipeCard>
        ))}
      </RecipeGrid>
    </Container>
  );
};

export default RecipeRecommendations;