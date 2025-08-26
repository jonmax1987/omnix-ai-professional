import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { baseShouldForwardProp } from '../../utils/styledUtils';
import { 
  Calendar, 
  ChefHat, 
  Clock, 
  Users, 
  Heart, 
  Zap, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Star,
  CheckCircle,
  X,
  Filter,
  Search,
  Download,
  Share2,
  RefreshCw,
  TrendingUp,
  Lightbulb,
  Target,
  Utensils,
  Apple,
  Beef,
  Fish,
  Leaf,
  Wheat,
  Droplets,
  AlertCircle,
  BookOpen,
  Camera
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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.primary.light};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main : 
    variant === 'secondary' ? theme.colors.secondary.main : 
    theme.colors.gray[100]};
  color: ${({ variant, theme }) => 
    variant === 'primary' || variant === 'secondary' ? 'white' : theme.colors.text.primary};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const TabNavigation = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  overflow-x: auto;
`;

const TabButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})`
  flex: 1;
  min-width: 120px;
  padding: 12px 16px;
  background: ${({ active, theme }) => active ? theme.colors.primary.main : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary.main : theme.colors.gray[100]};
  }
`;

const WeekPlanView = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const DayCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 16px;
  border: 2px solid ${({ active, theme }) => active ? theme.colors.primary.main : 'transparent'};
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DayTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DayDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MealSlots = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MealSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const MealInfo = styled.div`
  flex: 1;
`;

const MealType = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`;

const MealName = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 2px 0;
`;

const MealStats = styled.div`
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MealActions = styled.div`
  display: flex;
  gap: 4px;
`;

const MealActionButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: ${({ variant, theme }) => 
    variant === 'add' ? theme.colors.primary.light : 
    variant === 'delete' ? theme.colors.error.light : 
    theme.colors.gray[100]};
  color: ${({ variant, theme }) => 
    variant === 'add' ? theme.colors.primary.main : 
    variant === 'delete' ? theme.colors.error.main : 
    theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const RecipeCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
`;

const RecipeImage = styled.div`
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.light}, ${({ theme }) => theme.colors.secondary.light});
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
`;

const RecipeContent = styled.div`
  padding: 16px;
`;

const RecipeTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
`;

const RecipeMetrics = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RecipeMetric = styled.div`
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

const RecipeTag = styled.span.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})
  padding: 4px 8px;
  background: ${({ variant, theme }) => 
    variant === 'dietary' ? theme.colors.success.light : 
    variant === 'cuisine' ? theme.colors.warning.light : 
    variant === 'difficulty' ? theme.colors.info.light : 
    theme.colors.gray[100]};
  color: ${({ variant, theme }) => 
    variant === 'dietary' ? theme.colors.success.main : 
    variant === 'cuisine' ? theme.colors.warning.main : 
    variant === 'difficulty' ? theme.colors.info.main : 
    theme.colors.text.secondary};
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
`;

const RecipeActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RecipeRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.warning.main};
`;

const ShoppingListPanel = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const ShoppingListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ShoppingListTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ShoppingCategories = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ShoppingCategory = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
`;

const CategoryTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ShoppingItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ShoppingItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemQuantity = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const NutritionPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const NutritionCard = styled.div`
  text-align: center;
  padding: 16px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
`;

const NutritionValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 4px;
`;

const NutritionLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.gray[300]};
`;

const MealPlanningIntegration = () => {
  const [activeTab, setActiveTab] = useState('week-plan');
  const [selectedDay, setSelectedDay] = useState(0);
  const [mealPlan, setMealPlan] = useState({});
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState({});

  // Mock data
  const weekDays = [
    { name: 'Monday', date: 'Aug 20', short: 'Mon' },
    { name: 'Tuesday', date: 'Aug 21', short: 'Tue' },
    { name: 'Wednesday', date: 'Aug 22', short: 'Wed' },
    { name: 'Thursday', date: 'Aug 23', short: 'Thu' },
    { name: 'Friday', date: 'Aug 24', short: 'Fri' },
    { name: 'Saturday', date: 'Aug 25', short: 'Sat' },
    { name: 'Sunday', date: 'Aug 26', short: 'Sun' }
  ];

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const mockRecipes = [
    {
      id: 1,
      title: 'Mediterranean Quinoa Bowl',
      cookTime: '25 mins',
      servings: 4,
      difficulty: 'Easy',
      rating: 4.8,
      cuisine: 'Mediterranean',
      dietary: ['Vegetarian', 'Gluten-Free'],
      calories: 420,
      protein: 18,
      ingredients: ['Quinoa', 'Chickpeas', 'Cucumber', 'Tomatoes', 'Feta', 'Olive Oil'],
      nutrition: {
        calories: 420,
        protein: '18g',
        carbs: '58g',
        fat: '12g',
        fiber: '8g'
      }
    },
    {
      id: 2,
      title: 'Grilled Salmon with Asparagus',
      cookTime: '20 mins',
      servings: 2,
      difficulty: 'Medium',
      rating: 4.9,
      cuisine: 'American',
      dietary: ['Keto', 'Gluten-Free'],
      calories: 380,
      protein: 35,
      ingredients: ['Salmon Fillet', 'Asparagus', 'Lemon', 'Garlic', 'Olive Oil'],
      nutrition: {
        calories: 380,
        protein: '35g',
        carbs: '8g',
        fat: '22g',
        fiber: '4g'
      }
    },
    {
      id: 3,
      title: 'Thai Green Curry Chicken',
      cookTime: '35 mins',
      servings: 6,
      difficulty: 'Medium',
      rating: 4.7,
      cuisine: 'Thai',
      dietary: ['Dairy-Free'],
      calories: 320,
      protein: 28,
      ingredients: ['Chicken Breast', 'Coconut Milk', 'Green Curry Paste', 'Bell Peppers', 'Basil'],
      nutrition: {
        calories: 320,
        protein: '28g',
        carbs: '12g',
        fat: '18g',
        fiber: '3g'
      }
    },
    {
      id: 4,
      title: 'Overnight Oats Berry Parfait',
      cookTime: '5 mins',
      servings: 1,
      difficulty: 'Easy',
      rating: 4.6,
      cuisine: 'American',
      dietary: ['Vegetarian'],
      calories: 280,
      protein: 12,
      ingredients: ['Rolled Oats', 'Greek Yogurt', 'Mixed Berries', 'Honey', 'Chia Seeds'],
      nutrition: {
        calories: 280,
        protein: '12g',
        carbs: '45g',
        fat: '6g',
        fiber: '9g'
      }
    },
    {
      id: 5,
      title: 'Vegetarian Black Bean Tacos',
      cookTime: '15 mins',
      servings: 4,
      difficulty: 'Easy',
      rating: 4.5,
      cuisine: 'Mexican',
      dietary: ['Vegetarian', 'Vegan'],
      calories: 340,
      protein: 15,
      ingredients: ['Black Beans', 'Corn Tortillas', 'Avocado', 'Lime', 'Cilantro', 'Red Onion'],
      nutrition: {
        calories: 340,
        protein: '15g',
        carbs: '52g',
        fat: '8g',
        fiber: '12g'
      }
    },
    {
      id: 6,
      title: 'Classic Caesar Salad',
      cookTime: '10 mins',
      servings: 2,
      difficulty: 'Easy',
      rating: 4.4,
      cuisine: 'Italian',
      dietary: ['Vegetarian'],
      calories: 220,
      protein: 8,
      ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
      nutrition: {
        calories: 220,
        protein: '8g',
        carbs: '18g',
        fat: '14g',
        fiber: '4g'
      }
    }
  ];

  const mockShoppingList = {
    'Proteins': [
      { item: 'Salmon Fillet', quantity: '2 lbs', recipes: ['Grilled Salmon'] },
      { item: 'Chicken Breast', quantity: '3 lbs', recipes: ['Thai Green Curry'] },
      { item: 'Black Beans', quantity: '2 cans', recipes: ['Vegetarian Tacos'] }
    ],
    'Vegetables': [
      { item: 'Asparagus', quantity: '1 bunch', recipes: ['Grilled Salmon'] },
      { item: 'Bell Peppers', quantity: '4 pieces', recipes: ['Thai Green Curry'] },
      { item: 'Avocado', quantity: '3 pieces', recipes: ['Vegetarian Tacos'] },
      { item: 'Romaine Lettuce', quantity: '2 heads', recipes: ['Caesar Salad'] }
    ],
    'Pantry': [
      { item: 'Quinoa', quantity: '1 bag', recipes: ['Mediterranean Bowl'] },
      { item: 'Olive Oil', quantity: '1 bottle', recipes: ['Multiple'] },
      { item: 'Coconut Milk', quantity: '2 cans', recipes: ['Thai Green Curry'] }
    ],
    'Dairy': [
      { item: 'Feta Cheese', quantity: '1 container', recipes: ['Mediterranean Bowl'] },
      { item: 'Greek Yogurt', quantity: '1 large', recipes: ['Overnight Oats'] },
      { item: 'Parmesan', quantity: '1 piece', recipes: ['Caesar Salad'] }
    ],
    'Fruits': [
      { item: 'Mixed Berries', quantity: '2 containers', recipes: ['Overnight Oats'] },
      { item: 'Lemons', quantity: '4 pieces', recipes: ['Multiple'] },
      { item: 'Limes', quantity: '3 pieces', recipes: ['Vegetarian Tacos'] }
    ]
  };

  useEffect(() => {
    setSuggestedRecipes(mockRecipes);
    setShoppingList(mockShoppingList);
    
    // Initialize sample meal plan
    const samplePlan = {
      0: { // Monday
        breakfast: mockRecipes[3], // Overnight Oats
        lunch: mockRecipes[5], // Caesar Salad
        dinner: mockRecipes[1] // Grilled Salmon
      },
      1: { // Tuesday
        breakfast: mockRecipes[3], // Overnight Oats
        lunch: mockRecipes[0], // Mediterranean Bowl
        dinner: mockRecipes[2] // Thai Green Curry
      },
      2: { // Wednesday
        lunch: mockRecipes[4], // Vegetarian Tacos
        dinner: mockRecipes[1] // Grilled Salmon
      }
    };
    setMealPlan(samplePlan);
  }, []);

  const addMealToPlan = (dayIndex, mealType, recipe) => {
    setMealPlan(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [mealType]: recipe
      }
    }));
  };

  const removeMealFromPlan = (dayIndex, mealType) => {
    setMealPlan(prev => {
      const newPlan = { ...prev };
      if (newPlan[dayIndex]) {
        delete newPlan[dayIndex][mealType];
        if (Object.keys(newPlan[dayIndex]).length === 0) {
          delete newPlan[dayIndex];
        }
      }
      return newPlan;
    });
  };

  const getTotalNutrition = () => {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    
    Object.values(mealPlan).forEach(day => {
      Object.values(day).forEach(meal => {
        totals.calories += meal.calories || 0;
        totals.protein += parseInt(meal.nutrition?.protein || '0');
        totals.carbs += parseInt(meal.nutrition?.carbs || '0');
        totals.fat += parseInt(meal.nutrition?.fat || '0');
        totals.fiber += parseInt(meal.nutrition?.fiber || '0');
      });
    });
    
    return totals;
  };

  const nutritionTotals = getTotalNutrition();

  const tabs = [
    { id: 'week-plan', label: 'Week Plan', icon: Calendar },
    { id: 'recipes', label: 'Recipe Library', icon: BookOpen },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
    { id: 'nutrition', label: 'Nutrition', icon: Apple }
  ];

  const renderWeekPlan = () => (
    <div>
      <WeekPlanView>
        {weekDays.map((day, index) => (
          <DayCard
            key={index}
            active={selectedDay === index}
            onClick={() => setSelectedDay(index)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <DayHeader>
              <div>
                <DayTitle>{day.short}</DayTitle>
                <DayDate>{day.date}</DayDate>
              </div>
            </DayHeader>
            
            <MealSlots>
              {mealTypes.map(mealType => {
                const meal = mealPlan[index]?.[mealType];
                return (
                  <MealSlot key={mealType}>
                    <MealInfo>
                      <MealType>{mealType}</MealType>
                      {meal ? (
                        <div>
                          <MealName>{meal.title}</MealName>
                          <MealStats>
                            <span>{meal.calories} cal</span>
                            <span>{meal.cookTime}</span>
                          </MealStats>
                        </div>
                      ) : (
                        <MealName style={{ color: '#9CA3AF' }}>Not planned</MealName>
                      )}
                    </MealInfo>
                    
                    <MealActions>
                      {meal ? (
                        <MealActionButton
                          variant="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMealFromPlan(index, mealType);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={12} />
                        </MealActionButton>
                      ) : (
                        <MealActionButton
                          variant="add"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('recipes');
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Plus size={12} />
                        </MealActionButton>
                      )}
                    </MealActions>
                  </MealSlot>
                );
              })}
            </MealSlots>
          </DayCard>
        ))}
      </WeekPlanView>
    </div>
  );

  const renderRecipeLibrary = () => (
    <div>
      <RecipeGrid>
        {suggestedRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <RecipeImage>
              <ChefHat size={48} />
            </RecipeImage>
            
            <RecipeContent>
              <RecipeTitle>{recipe.title}</RecipeTitle>
              
              <RecipeMetrics>
                <RecipeMetric>
                  <Clock size={12} />
                  {recipe.cookTime}
                </RecipeMetric>
                <RecipeMetric>
                  <Users size={12} />
                  {recipe.servings} servings
                </RecipeMetric>
                <RecipeMetric>
                  <Zap size={12} />
                  {recipe.calories} cal
                </RecipeMetric>
              </RecipeMetrics>
              
              <RecipeTags>
                <RecipeTag variant="difficulty">{recipe.difficulty}</RecipeTag>
                <RecipeTag variant="cuisine">{recipe.cuisine}</RecipeTag>
                {recipe.dietary.map(diet => (
                  <RecipeTag key={diet} variant="dietary">{diet}</RecipeTag>
                ))}
              </RecipeTags>
              
              <RecipeActions>
                <RecipeRating>
                  <Star size={12} fill="currentColor" />
                  {recipe.rating}
                </RecipeRating>
                
                <ActionButton
                  variant="primary"
                  onClick={() => {
                    // Add to selected day/meal
                    setActiveTab('week-plan');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={14} />
                  Add to Plan
                </ActionButton>
              </RecipeActions>
            </RecipeContent>
          </RecipeCard>
        ))}
      </RecipeGrid>
    </div>
  );

  const renderShoppingList = () => (
    <ShoppingListPanel>
      <ShoppingListHeader>
        <ShoppingListTitle>
          <ShoppingCart size={20} />
          Generated Shopping List
        </ShoppingListTitle>
        <ActionButtons>
          <ActionButton variant="secondary">
            <Download size={14} />
            Export
          </ActionButton>
          <ActionButton variant="primary">
            <RefreshCw size={14} />
            Regenerate
          </ActionButton>
        </ActionButtons>
      </ShoppingListHeader>
      
      <ShoppingCategories>
        {Object.entries(shoppingList).map(([category, items]) => (
          <ShoppingCategory key={category}>
            <CategoryTitle>
              {category === 'Proteins' && <Beef size={14} />}
              {category === 'Vegetables' && <Leaf size={14} />}
              {category === 'Pantry' && <Package size={14} />}
              {category === 'Dairy' && <Droplets size={14} />}
              {category === 'Fruits' && <Apple size={14} />}
              {category}
            </CategoryTitle>
            
            <ShoppingItems>
              {items.map((item, index) => (
                <ShoppingItem key={index}>
                  <span>{item.item}</span>
                  <ItemQuantity>{item.quantity}</ItemQuantity>
                </ShoppingItem>
              ))}
            </ShoppingItems>
          </ShoppingCategory>
        ))}
      </ShoppingCategories>
    </ShoppingListPanel>
  );

  const renderNutrition = () => (
    <NutritionPanel>
      <ShoppingListTitle>
        <Apple size={20} />
        Weekly Nutrition Overview
      </ShoppingListTitle>
      
      <NutritionGrid>
        <NutritionCard>
          <NutritionValue>{nutritionTotals.calories}</NutritionValue>
          <NutritionLabel>Total Calories</NutritionLabel>
        </NutritionCard>
        
        <NutritionCard>
          <NutritionValue>{nutritionTotals.protein}g</NutritionValue>
          <NutritionLabel>Protein</NutritionLabel>
        </NutritionCard>
        
        <NutritionCard>
          <NutritionValue>{nutritionTotals.carbs}g</NutritionValue>
          <NutritionLabel>Carbohydrates</NutritionLabel>
        </NutritionCard>
        
        <NutritionCard>
          <NutritionValue>{nutritionTotals.fat}g</NutritionValue>
          <NutritionLabel>Fat</NutritionLabel>
        </NutritionCard>
        
        <NutritionCard>
          <NutritionValue>{nutritionTotals.fiber}g</NutritionValue>
          <NutritionLabel>Fiber</NutritionLabel>
        </NutritionCard>
        
        <NutritionCard>
          <NutritionValue>{Math.round(nutritionTotals.calories / 7)}</NutritionValue>
          <NutritionLabel>Avg Daily Calories</NutritionLabel>
        </NutritionCard>
      </NutritionGrid>
    </NutritionPanel>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'week-plan':
        return renderWeekPlan();
      case 'recipes':
        return renderRecipeLibrary();
      case 'shopping':
        return renderShoppingList();
      case 'nutrition':
        return renderNutrition();
      default:
        return renderWeekPlan();
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
          <IconWrapper>
            <ChefHat size={18} />
          </IconWrapper>
          AI Meal Planning
        </Title>
        
        <ActionButtons>
          <ActionButton variant="secondary">
            <Share2 size={14} />
            Share Plan
          </ActionButton>
          <ActionButton variant="primary">
            <Lightbulb size={14} />
            Get AI Suggestions
          </ActionButton>
        </ActionButtons>
      </Header>

      <Content>
        <TabNavigation>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={16} />
                {tab.label}
              </TabButton>
            );
          })}
        </TabNavigation>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </Content>
    </Container>
  );
};

export default MealPlanningIntegration;