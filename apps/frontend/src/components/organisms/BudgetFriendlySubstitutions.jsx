import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Percent, 
  PiggyBank, 
  Target,
  Star,
  ShoppingCart,
  Plus,
  X,
  RefreshCw,
  Award,
  Package,
  Clock,
  Users,
  Heart,
  Eye,
  Filter,
  Search,
  Settings,
  Brain,
  Lightbulb,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Calculator,
  CreditCard
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
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

const SavingsOverview = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.success}15, ${({ theme }) => theme.colors.success}05);
  border: 1px solid ${({ theme }) => theme.colors.success}20;
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
  color: ${({ theme }) => theme.colors.success};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TotalSavings = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.success}30;
`;

const SavingsValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success};
`;

const SavingsLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SavingsStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
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

const SavingsChart = styled.div`
  height: 120px;
  background: white;
  border-radius: 8px;
  padding: 12px;
`;

const SubstitutionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const SubstitutionCard = styled(motion.div)`
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

const SubstitutionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SubstitutionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SavingsBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ savings }) => 
    savings > 50 ? '#10b981' : 
    savings > 25 ? '#f59e0b' : '#4f46e5'};
  color: white;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
`;

const ProductComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
`;

const ProductSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ProductImage = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border: ${({ recommended, theme }) => 
    recommended ? `2px solid ${theme.colors.success}` : 'none'};
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ProductBrand = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 6px;
`;

const ProductPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ discounted, theme }) => 
    discounted ? theme.colors.success : theme.colors.primary};
`;

const PriceUnit = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 400;
`;

const ComparisonArrow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.colors.success};
`;

const ArrowIcon = styled.div`
  font-size: 20px;
  margin-bottom: 4px;
`;

const SavingsAmount = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.success};
`;

const SubstitutionDetails = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DetailValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const QualityIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
`;

const QualityBars = styled.div`
  display: flex;
  gap: 2px;
  flex: 1;
`;

const QualityBar = styled.div`
  height: 4px;
  background: ${({ active, theme }) => 
    active ? theme.colors.success : theme.colors.gray[200]};
  border-radius: 2px;
  flex: 1;
`;

const QualityLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const SubstitutionTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`;

const SubstitutionTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'store-brand': return theme.colors.primary;
      case 'bulk': return theme.colors.warning;
      case 'generic': return theme.colors.success;
      case 'alternative': return theme.colors.error;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
`;

const SubstitutionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SubstitutionButton = styled.button`
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

const BudgetFriendlySubstitutions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({});

  const savingsStats = [
    { value: '$247.80', label: 'Monthly Savings' },
    { value: '32%', label: 'Avg Discount' },
    { value: '18', label: 'Active Substitutions' },
    { value: '4.2⭐', label: 'Quality Score' }
  ];

  const weeklySavings = [
    { week: 'Week 1', savings: 23.50 },
    { week: 'Week 2', savings: 45.80 },
    { week: 'Week 3', savings: 67.20 },
    { week: 'Week 4', savings: 89.40 }
  ];

  const substitutions = [
    {
      id: 1,
      title: 'Name Brand → Store Brand Cereal',
      currentProduct: {
        name: 'Premium Honey Oats',
        brand: 'Famous Brand',
        price: 5.99,
        size: '18 oz',
        image: null
      },
      alternativeProduct: {
        name: 'Honey Oat Crunch',
        brand: 'Store Brand',
        price: 3.49,
        size: '18 oz',
        image: null
      },
      savings: 42,
      savingsAmount: 2.50,
      quality: 4,
      tags: [
        { type: 'store-brand', label: 'Store Brand' },
        { type: 'generic', label: 'Same Quality' }
      ],
      details: {
        taste: 'Similar (4.2/5)',
        nutrition: 'Identical',
        ingredients: '95% Match',
        popularity: 'High'
      },
      feedback: null
    },
    {
      id: 2,
      title: 'Organic → Conventional Produce',
      currentProduct: {
        name: 'Organic Bananas',
        brand: 'Organic Valley',
        price: 2.99,
        size: '2 lbs',
        image: null
      },
      alternativeProduct: {
        name: 'Fresh Bananas',
        brand: 'Farm Fresh',
        price: 1.89,
        size: '2 lbs',
        image: null
      },
      savings: 37,
      savingsAmount: 1.10,
      quality: 4,
      tags: [
        { type: 'alternative', label: 'Conventional' },
        { type: 'bulk', label: 'Family Pack' }
      ],
      details: {
        taste: 'Excellent (4.5/5)',
        nutrition: 'Nearly Identical',
        pesticides: 'Meets Standards',
        freshness: 'Very Good'
      },
      feedback: null
    },
    {
      id: 3,
      title: 'Premium → Standard Ground Coffee',
      currentProduct: {
        name: 'Artisan Dark Roast',
        brand: 'Coffee Masters',
        price: 12.99,
        size: '12 oz',
        image: null
      },
      alternativeProduct: {
        name: 'Medium Roast Blend',
        brand: 'Daily Grind',
        price: 7.99,
        size: '12 oz',
        image: null
      },
      savings: 38,
      savingsAmount: 5.00,
      quality: 3,
      tags: [
        { type: 'generic', label: 'House Brand' },
        { type: 'bulk', label: 'Value Size' }
      ],
      details: {
        taste: 'Good (3.8/5)',
        aroma: 'Pleasant',
        roast: 'Medium',
        caffeine: 'Standard'
      },
      feedback: null
    },
    {
      id: 4,
      title: 'Frozen → Fresh Vegetables',
      currentProduct: {
        name: 'Frozen Broccoli Florets',
        brand: 'Frozen Fresh',
        price: 3.49,
        size: '16 oz',
        image: null
      },
      alternativeProduct: {
        name: 'Fresh Broccoli Crowns',
        brand: 'Local Farm',
        price: 2.99,
        size: '1 lb',
        image: null
      },
      savings: 14,
      savingsAmount: 0.50,
      quality: 5,
      tags: [
        { type: 'alternative', label: 'Fresh Option' },
        { type: 'store-brand', label: 'Seasonal' }
      ],
      details: {
        nutrition: 'Superior',
        texture: 'Crisp',
        shelf_life: '5-7 days',
        prep_time: '+3 minutes'
      },
      feedback: null
    },
    {
      id: 5,
      title: 'Individual → Family Size Yogurt',
      currentProduct: {
        name: 'Individual Greek Yogurt',
        brand: 'Creamy Delight',
        price: 1.29,
        size: '6 oz x 6',
        image: null
      },
      alternativeProduct: {
        name: 'Family Greek Yogurt',
        brand: 'Creamy Delight',
        price: 5.99,
        size: '32 oz',
        image: null
      },
      savings: 23,
      savingsAmount: 1.75,
      quality: 5,
      tags: [
        { type: 'bulk', label: 'Bulk Size' },
        { type: 'generic', label: 'Same Brand' }
      ],
      details: {
        cost_per_oz: '$0.19 vs $0.22',
        freshness: 'Same',
        convenience: 'Less Portable',
        waste: 'Reduced Packaging'
      },
      feedback: null
    },
    {
      id: 6,
      title: 'Specialty → Regular Pasta Sauce',
      currentProduct: {
        name: 'Gourmet Marinara',
        brand: 'Chef\'s Choice',
        price: 4.99,
        size: '24 oz',
        image: null
      },
      alternativeProduct: {
        name: 'Traditional Marinara',
        brand: 'Home Style',
        price: 2.49,
        size: '24 oz',
        image: null
      },
      savings: 50,
      savingsAmount: 2.50,
      quality: 4,
      tags: [
        { type: 'store-brand', label: 'Store Brand' },
        { type: 'generic', label: 'Classic Recipe' }
      ],
      details: {
        taste: 'Very Good (4.1/5)',
        ingredients: 'Natural',
        sodium: 'Moderate',
        herbs: 'Traditional Blend'
      },
      feedback: null
    }
  ];

  const filteredSubstitutions = substitutions.filter(substitution =>
    substitution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    substitution.currentProduct.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    substitution.alternativeProduct.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const makeSubstitution = (substitutionId) => {
    console.log('Make substitution:', substitutionId);
  };

  const addToCompare = (substitutionId) => {
    console.log('Add to compare:', substitutionId);
  };

  const provideFeedback = (substitutionId, positive) => {
    setFeedback(prev => ({
      ...prev,
      [substitutionId]: positive
    }));
  };

  const getTagIcon = (type) => {
    switch (type) {
      case 'store-brand': return Star;
      case 'bulk': return Package;
      case 'generic': return CheckCircle;
      case 'alternative': return RefreshCw;
      default: return DollarSign;
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
          <PiggyBank size={20} />
          Budget-Friendly Substitutions
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search substitutions..."
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
            Budget Goals
          </ActionButton>
          <ActionButton primary>
            <Calculator size={16} />
            Savings Calculator
          </ActionButton>
        </Controls>
      </Header>

      <SavingsOverview>
        <OverviewHeader>
          <OverviewTitle>
            <TrendingDown size={16} />
            Your Savings Potential
          </OverviewTitle>
          <TotalSavings>
            <SavingsValue>$247.80</SavingsValue>
            <SavingsLabel>Monthly Savings</SavingsLabel>
          </TotalSavings>
        </OverviewHeader>
        
        <SavingsStats>
          {savingsStats.map((stat, index) => (
            <StatCard key={index}>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </SavingsStats>
        
        <SavingsChart>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklySavings}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${value.toFixed(2)}`, 'Weekly Savings']}
              />
              <Area 
                type="monotone" 
                dataKey="savings" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SavingsChart>
      </SavingsOverview>

      <SubstitutionsGrid>
        {filteredSubstitutions.map((substitution, index) => (
          <SubstitutionCard
            key={substitution.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <FeedbackButtons>
              <FeedbackButton
                positive
                active={feedback[substitution.id] === true}
                onClick={() => provideFeedback(substitution.id, true)}
              >
                <ThumbsUp size={10} />
              </FeedbackButton>
              <FeedbackButton
                active={feedback[substitution.id] === false}
                onClick={() => provideFeedback(substitution.id, false)}
              >
                <ThumbsDown size={10} />
              </FeedbackButton>
            </FeedbackButtons>

            <SubstitutionHeader>
              <SubstitutionTitle>{substitution.title}</SubstitutionTitle>
              <SavingsBadge savings={substitution.savings}>
                <Percent size={10} />
                {substitution.savings}% OFF
              </SavingsBadge>
            </SubstitutionHeader>

            <ProductComparison>
              <ProductSide>
                <ProductImage>
                  <Package size={24} color="#9ca3af" />
                </ProductImage>
                <ProductName>{substitution.currentProduct.name}</ProductName>
                <ProductBrand>{substitution.currentProduct.brand}</ProductBrand>
                <ProductPrice>
                  ${substitution.currentProduct.price.toFixed(2)}
                  <PriceUnit>/{substitution.currentProduct.size}</PriceUnit>
                </ProductPrice>
              </ProductSide>

              <ComparisonArrow>
                <ArrowIcon>
                  <ArrowRight size={20} />
                </ArrowIcon>
                <SavingsAmount>
                  Save ${substitution.savingsAmount.toFixed(2)}
                </SavingsAmount>
              </ComparisonArrow>

              <ProductSide>
                <ProductImage recommended>
                  <Package size={24} color="#10b981" />
                </ProductImage>
                <ProductName>{substitution.alternativeProduct.name}</ProductName>
                <ProductBrand>{substitution.alternativeProduct.brand}</ProductBrand>
                <ProductPrice discounted>
                  ${substitution.alternativeProduct.price.toFixed(2)}
                  <PriceUnit>/{substitution.alternativeProduct.size}</PriceUnit>
                </ProductPrice>
              </ProductSide>
            </ProductComparison>

            <QualityIndicator>
              <QualityLabel>Quality:</QualityLabel>
              <QualityBars>
                {[1, 2, 3, 4, 5].map(bar => (
                  <QualityBar key={bar} active={bar <= substitution.quality} />
                ))}
              </QualityBars>
              <span style={{ fontSize: '12px', fontWeight: '500' }}>
                {substitution.quality}/5
              </span>
            </QualityIndicator>

            <SubstitutionTags>
              {substitution.tags.map((tag, tagIndex) => {
                const TagIcon = getTagIcon(tag.type);
                return (
                  <SubstitutionTag key={tagIndex} type={tag.type}>
                    <TagIcon size={8} />
                    {tag.label}
                  </SubstitutionTag>
                );
              })}
            </SubstitutionTags>

            <SubstitutionDetails>
              {Object.entries(substitution.details).map(([key, value]) => (
                <DetailRow key={key}>
                  <DetailLabel>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}:
                  </DetailLabel>
                  <DetailValue>{value}</DetailValue>
                </DetailRow>
              ))}
            </SubstitutionDetails>

            <SubstitutionActions>
              <SubstitutionButton 
                variant="primary"
                onClick={() => makeSubstitution(substitution.id)}
              >
                <RefreshCw size={12} />
                Make Substitution
              </SubstitutionButton>
              <SubstitutionButton onClick={() => addToCompare(substitution.id)}>
                <Eye size={12} />
                Compare
              </SubstitutionButton>
            </SubstitutionActions>
          </SubstitutionCard>
        ))}
      </SubstitutionsGrid>
    </Container>
  );
};

export default BudgetFriendlySubstitutions;