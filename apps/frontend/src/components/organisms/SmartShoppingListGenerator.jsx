import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Star, 
  Clock, 
  Zap, 
  Brain,
  Target,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Filter,
  Search,
  Download,
  Share2,
  RefreshCw,
  TrendingUp,
  Lightbulb
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AIInsights = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}10, ${({ theme }) => theme.colors.primary}05);
  border: 1px solid ${({ theme }) => theme.colors.primary}20;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const InsightsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const InsightsTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const InsightCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
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

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const QuickActionChip = styled.button`
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
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const ListContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const AddItemSection = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const AddItemForm = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 200px;
`;

const InputLabel = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 12px;
`;

const SuggestionChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}10;
  }
`;

const ItemsList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const CategorySection = styled.div`
  margin-bottom: 20px;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.gray[100]};
`;

const CategoryTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryStats = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ItemCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ItemCheckbox = styled.button`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ checked, theme }) => checked ? theme.colors.success : theme.colors.border};
  border-radius: 4px;
  background: ${({ checked, theme }) => checked ? theme.colors.success : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.success};
  }
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
  text-decoration: ${({ checked }) => checked ? 'line-through' : 'none'};
  opacity: ${({ checked }) => checked ? 0.6 : 1};
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ItemBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'ai': return theme.colors.primary;
      case 'urgent': return theme.colors.error;
      case 'habit': return theme.colors.success;
      case 'deal': return theme.colors.warning;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
`;

const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ItemActionButton = styled.button`
  padding: 4px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SmartShoppingListGenerator = () => {
  const [newItem, setNewItem] = useState({ name: '', quantity: '', category: '' });
  const [activeFilter, setActiveFilter] = useState('all');
  const [items, setItems] = useState([]);

  const insights = [
    { value: '12', label: 'Items Needed' },
    { value: '$48.50', label: 'Est. Total' },
    { value: '15%', label: 'Savings' },
    { value: '3 days', label: 'Last Run' }
  ];

  const quickActions = [
    { id: 'weekly', label: 'Weekly Essentials', icon: Calendar, active: true },
    { id: 'deals', label: 'Best Deals', icon: DollarSign, active: false },
    { id: 'running-low', label: 'Running Low', icon: AlertCircle, active: false },
    { id: 'favorites', label: 'Favorites', icon: Star, active: false }
  ];

  const aiSuggestions = [
    'Milk (expires soon)',
    'Bread (weekly habit)',
    'Bananas (price drop)',
    'Yogurt (health goal)',
    'Coffee (running low)',
    'Eggs (weekly pattern)'
  ];

  const shoppingList = {
    'Dairy & Eggs': [
      {
        id: 1,
        name: 'Organic Milk',
        quantity: '1L',
        price: 4.99,
        type: 'habit',
        priority: 'high',
        checked: false,
        lastBought: '1 week ago',
        prediction: 'Usually buy weekly'
      },
      {
        id: 2,
        name: 'Greek Yogurt',
        quantity: '500g',
        price: 6.50,
        type: 'ai',
        priority: 'medium',
        checked: false,
        lastBought: '3 days ago',
        prediction: 'Running low'
      },
      {
        id: 3,
        name: 'Free Range Eggs',
        quantity: '12 pack',
        price: 7.25,
        type: 'urgent',
        priority: 'high',
        checked: true,
        lastBought: '2 weeks ago',
        prediction: 'Overdue purchase'
      }
    ],
    'Fruits & Vegetables': [
      {
        id: 4,
        name: 'Bananas',
        quantity: '6 pieces',
        price: 3.50,
        type: 'deal',
        priority: 'medium',
        checked: false,
        lastBought: '4 days ago',
        prediction: '20% off today'
      },
      {
        id: 5,
        name: 'Spinach',
        quantity: '1 bag',
        price: 2.99,
        type: 'habit',
        priority: 'medium',
        checked: false,
        lastBought: '5 days ago',
        prediction: 'Twice weekly habit'
      }
    ],
    'Pantry Staples': [
      {
        id: 6,
        name: 'Whole Grain Bread',
        quantity: '1 loaf',
        price: 4.50,
        type: 'ai',
        priority: 'high',
        checked: false,
        lastBought: '1 week ago',
        prediction: 'AI predicted need'
      },
      {
        id: 7,
        name: 'Olive Oil',
        quantity: '500ml',
        price: 12.99,
        type: 'habit',
        priority: 'low',
        checked: false,
        lastBought: '1 month ago',
        prediction: 'Monthly restock'
      }
    ]
  };

  const addItem = () => {
    if (newItem.name.trim()) {
      // Add item logic
      setNewItem({ name: '', quantity: '', category: '' });
    }
  };

  const toggleItem = (itemId) => {
    // Toggle item checked state
    console.log('Toggle item:', itemId);
  };

  const removeItem = (itemId) => {
    // Remove item logic
    console.log('Remove item:', itemId);
  };

  const addSuggestion = (suggestion) => {
    setNewItem({ ...newItem, name: suggestion });
  };

  const generateList = () => {
    // AI list generation logic
    console.log('Generating smart list...');
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'ai': return <Brain size={8} />;
      case 'urgent': return <AlertCircle size={8} />;
      case 'habit': return <Clock size={8} />;
      case 'deal': return <TrendingUp size={8} />;
      default: return null;
    }
  };

  const filteredCategories = Object.entries(shoppingList).map(([category, items]) => ({
    category,
    items: items.filter(item => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'pending') return !item.checked;
      if (activeFilter === 'completed') return item.checked;
      return item.type === activeFilter;
    })
  })).filter(({ items }) => items.length > 0);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <ShoppingCart size={20} />
          Smart Shopping List
        </Title>
        <Controls>
          <ActionButton onClick={generateList}>
            <Brain size={16} />
            AI Generate
          </ActionButton>
          <ActionButton>
            <Share2 size={16} />
            Share
          </ActionButton>
          <ActionButton>
            <Download size={16} />
            Export
          </ActionButton>
        </Controls>
      </Header>

      <AIInsights>
        <InsightsHeader>
          <Lightbulb size={16} />
          <InsightsTitle>Smart Insights</InsightsTitle>
          <ActionButton style={{ marginLeft: 'auto', padding: '4px 8px' }}>
            <RefreshCw size={12} />
          </ActionButton>
        </InsightsHeader>
        <InsightsGrid>
          {insights.map((insight, index) => (
            <InsightCard key={index}>
              <InsightValue>{insight.value}</InsightValue>
              <InsightLabel>{insight.label}</InsightLabel>
            </InsightCard>
          ))}
        </InsightsGrid>
      </AIInsights>

      <QuickActions>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <QuickActionChip
              key={action.id}
              active={activeFilter === action.id}
              onClick={() => setActiveFilter(action.id)}
            >
              <Icon size={12} />
              {action.label}
            </QuickActionChip>
          );
        })}
        <QuickActionChip
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          All Items
        </QuickActionChip>
      </QuickActions>

      <AddItemSection>
        <AddItemForm>
          <InputGroup>
            <InputLabel>Item Name</InputLabel>
            <Input
              type="text"
              placeholder="Add item..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
          </InputGroup>
          <InputGroup style={{ minWidth: '100px', maxWidth: '120px' }}>
            <InputLabel>Quantity</InputLabel>
            <Input
              type="text"
              placeholder="1x"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
          </InputGroup>
          <InputGroup style={{ minWidth: '120px', maxWidth: '150px' }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              <option value="">Auto</option>
              <option value="dairy">Dairy & Eggs</option>
              <option value="produce">Fruits & Vegetables</option>
              <option value="pantry">Pantry Staples</option>
              <option value="meat">Meat & Seafood</option>
              <option value="frozen">Frozen Foods</option>
            </Select>
          </InputGroup>
          <ActionButton primary onClick={addItem}>
            <Plus size={16} />
          </ActionButton>
        </AddItemForm>

        <SuggestionsGrid>
          {aiSuggestions.map((suggestion, index) => (
            <SuggestionChip key={index} onClick={() => addSuggestion(suggestion)}>
              <Zap size={10} />
              {suggestion}
            </SuggestionChip>
          ))}
        </SuggestionsGrid>
      </AddItemSection>

      <ListContainer>
        <ItemsList>
          {filteredCategories.map(({ category, items }) => (
            <CategorySection key={category}>
              <CategoryHeader>
                <CategoryTitle>
                  <Package size={16} />
                  {category}
                </CategoryTitle>
                <CategoryStats>
                  <span>{items.length} items</span>
                  <span>
                    ${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </span>
                </CategoryStats>
              </CategoryHeader>

              {items.map((item, index) => (
                <ItemCard
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ItemInfo>
                    <ItemCheckbox
                      checked={item.checked}
                      onClick={() => toggleItem(item.id)}
                    >
                      {item.checked && <Check size={12} color="white" />}
                    </ItemCheckbox>
                    
                    <ItemDetails>
                      <ItemName checked={item.checked}>
                        {item.name} ({item.quantity})
                      </ItemName>
                      <ItemMeta>
                        <span>${item.price.toFixed(2)}</span>
                        <span>•</span>
                        <span>{item.lastBought}</span>
                        <span>•</span>
                        <span>{item.prediction}</span>
                        <ItemBadge type={item.type}>
                          {getBadgeIcon(item.type)}
                          {item.type.toUpperCase()}
                        </ItemBadge>
                      </ItemMeta>
                    </ItemDetails>
                  </ItemInfo>

                  <ItemActions>
                    <ItemActionButton onClick={() => removeItem(item.id)}>
                      <Trash2 size={14} />
                    </ItemActionButton>
                    <ItemActionButton>
                      <Edit3 size={14} />
                    </ItemActionButton>
                  </ItemActions>
                </ItemCard>
              ))}
            </CategorySection>
          ))}
        </ItemsList>
      </ListContainer>
    </Container>
  );
};

export default SmartShoppingListGenerator;