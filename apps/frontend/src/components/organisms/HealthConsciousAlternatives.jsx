import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Leaf, 
  Activity, 
  Shield, 
  TrendingUp, 
  Star, 
  CheckCircle,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Eye,
  Filter,
  Search,
  Settings,
  Target,
  Brain,
  Award,
  Zap,
  Package,
  DollarSign,
  Clock,
  Users,
  Lightbulb,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart, 
  Bar, 
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

const HealthProfile = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.success}15, ${({ theme }) => theme.colors.success}05);
  border: 1px solid ${({ theme }) => theme.colors.success}20;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProfileTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.success};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HealthScore = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.success}30;
`;

const ScoreValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success};
`;

const ScoreLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProfileContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HealthMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const NutritionRadar = styled.div`
  height: 160px;
  background: white;
  border-radius: 8px;
  padding: 12px;
`;

const AlternativesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const AlternativeCard = styled(motion.div)`
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

const ComparisonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ComparisonTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const HealthBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ level, theme }) => {
    switch (level) {
      case 'excellent': return theme.colors.success;
      case 'good': return theme.colors.primary;
      case 'better': return theme.colors.warning;
      default: return theme.colors.gray[300];
    }
  }};
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
  margin-bottom: 8px;
`;

const ProductPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const ComparisonArrow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.colors.success};
`;

const ArrowIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

const ArrowLabel = styled.div`
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
`;

const HealthBenefits = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const BenefitsTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BenefitsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const BenefitTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'nutrition': return theme.colors.success;
      case 'health': return theme.colors.primary;
      case 'lifestyle': return theme.colors.warning;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
`;

const NutritionComparison = styled.div`
  margin-bottom: 16px;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const NutritionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: ${({ improved, theme }) => 
    improved ? theme.colors.success + '10' : 'white'};
  border-radius: 4px;
  font-size: 12px;
`;

const NutritionLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NutritionValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AlternativeActions = styled.div`
  display: flex;
  gap: 8px;
`;

const AlternativeButton = styled.button`
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

const HealthConsciousAlternatives = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({});

  const healthMetrics = [
    { value: '85%', label: 'Health Score' },
    { value: '23g', label: 'Daily Protein' },
    { value: '12g', label: 'Fiber Intake' },
    { value: '1.2k', label: 'Sodium (mg)' }
  ];

  const nutritionProfile = [
    { subject: 'Protein', A: 85, fullMark: 100 },
    { subject: 'Fiber', A: 70, fullMark: 100 },
    { subject: 'Vitamins', A: 90, fullMark: 100 },
    { subject: 'Minerals', A: 75, fullMark: 100 },
    { subject: 'Omega-3', A: 60, fullMark: 100 },
    { subject: 'Antioxidants', A: 85, fullMark: 100 }
  ];

  const alternatives = [
    {
      id: 1,
      title: 'Greek Yogurt → Plant-Based Yogurt',
      currentProduct: {
        name: 'Regular Greek Yogurt',
        brand: 'Traditional Dairy',
        price: 5.99,
        image: null
      },
      alternativeProduct: {
        name: 'Coconut Greek Style Yogurt',
        brand: 'Plant Paradise',
        price: 6.49,
        image: null
      },
      healthLevel: 'excellent',
      benefits: [
        { type: 'nutrition', label: 'Lactose Free' },
        { type: 'health', label: 'Lower Cholesterol' },
        { type: 'lifestyle', label: 'Vegan Friendly' }
      ],
      nutritionComparison: {
        calories: { current: 150, alternative: 120, improved: true },
        protein: { current: 15, alternative: 12, improved: false },
        sugar: { current: 12, alternative: 8, improved: true },
        fiber: { current: 0, alternative: 3, improved: true }
      },
      feedback: null
    },
    {
      id: 2,
      title: 'White Bread → Whole Grain Bread',
      currentProduct: {
        name: 'White Sandwich Bread',
        brand: 'Classic Bakery',
        price: 2.99,
        image: null
      },
      alternativeProduct: {
        name: 'Ancient Grains Bread',
        brand: 'Healthy Choice',
        price: 4.49,
        image: null
      },
      healthLevel: 'good',
      benefits: [
        { type: 'nutrition', label: 'Higher Fiber' },
        { type: 'health', label: 'Better Digestion' },
        { type: 'nutrition', label: 'More Protein' }
      ],
      nutritionComparison: {
        calories: { current: 80, alternative: 90, improved: false },
        protein: { current: 3, alternative: 5, improved: true },
        fiber: { current: 1, alternative: 4, improved: true },
        sodium: { current: 170, alternative: 140, improved: true }
      },
      feedback: null
    },
    {
      id: 3,
      title: 'Ground Beef → Lean Turkey',
      currentProduct: {
        name: '80/20 Ground Beef',
        brand: 'Fresh Meat Co',
        price: 6.99,
        image: null
      },
      alternativeProduct: {
        name: '93/7 Ground Turkey',
        brand: 'Lean Choice',
        price: 7.49,
        image: null
      },
      healthLevel: 'excellent',
      benefits: [
        { type: 'nutrition', label: 'Lower Fat' },
        { type: 'health', label: 'Heart Healthy' },
        { type: 'nutrition', label: 'High Protein' }
      ],
      nutritionComparison: {
        calories: { current: 250, alternative: 180, improved: true },
        protein: { current: 20, alternative: 24, improved: true },
        fat: { current: 20, alternative: 8, improved: true },
        cholesterol: { current: 80, alternative: 65, improved: true }
      },
      feedback: null
    },
    {
      id: 4,
      title: 'Regular Pasta → Chickpea Pasta',
      currentProduct: {
        name: 'Traditional Pasta',
        brand: 'Pasta Classic',
        price: 1.99,
        image: null
      },
      alternativeProduct: {
        name: 'Chickpea Rotini',
        brand: 'Legume Lovers',
        price: 3.49,
        image: null
      },
      healthLevel: 'better',
      benefits: [
        { type: 'nutrition', label: 'Gluten Free' },
        { type: 'nutrition', label: 'High Protein' },
        { type: 'health', label: 'Blood Sugar Friendly' }
      ],
      nutritionComparison: {
        calories: { current: 200, alternative: 190, improved: true },
        protein: { current: 7, alternative: 14, improved: true },
        fiber: { current: 2, alternative: 8, improved: true },
        carbs: { current: 42, alternative: 32, improved: true }
      },
      feedback: null
    }
  ];

  const filteredAlternatives = alternatives.filter(alternative =>
    alternative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alternative.currentProduct.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alternative.alternativeProduct.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const replaceProduct = (alternativeId) => {
    console.log('Replace product:', alternativeId);
  };

  const addAlternative = (alternativeId) => {
    console.log('Add alternative:', alternativeId);
  };

  const provideFeedback = (alternativeId, positive) => {
    setFeedback(prev => ({
      ...prev,
      [alternativeId]: positive
    }));
  };

  const getBenefitIcon = (type) => {
    switch (type) {
      case 'nutrition': return Leaf;
      case 'health': return Heart;
      case 'lifestyle': return Star;
      default: return CheckCircle;
    }
  };

  const getHealthBadgeIcon = (level) => {
    switch (level) {
      case 'excellent': return Award;
      case 'good': return Star;
      case 'better': return TrendingUp;
      default: return CheckCircle;
    }
  };

  const getImprovementIcon = (improved) => {
    return improved ? TrendingUp : TrendingDown;
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Heart size={20} />
          Health-Conscious Alternatives
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search alternatives..."
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
            Health Profile
          </ActionButton>
          <ActionButton primary>
            <Plus size={16} />
            Add Goal
          </ActionButton>
        </Controls>
      </Header>

      <HealthProfile>
        <ProfileHeader>
          <ProfileTitle>
            <Activity size={16} />
            Your Health Profile
          </ProfileTitle>
          <HealthScore>
            <ScoreValue>85%</ScoreValue>
            <ScoreLabel>Health Score</ScoreLabel>
          </HealthScore>
        </ProfileHeader>
        
        <ProfileContent>
          <HealthMetrics>
            {healthMetrics.map((metric, index) => (
              <MetricCard key={index}>
                <MetricValue>{metric.value}</MetricValue>
                <MetricLabel>{metric.label}</MetricLabel>
              </MetricCard>
            ))}
          </HealthMetrics>
          
          <NutritionRadar>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={nutritionProfile}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="Your Nutrition" 
                  dataKey="A" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </NutritionRadar>
        </ProfileContent>
      </HealthProfile>

      <AlternativesGrid>
        {filteredAlternatives.map((alternative, index) => {
          const HealthIcon = getHealthBadgeIcon(alternative.healthLevel);
          return (
            <AlternativeCard
              key={alternative.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <FeedbackButtons>
                <FeedbackButton
                  positive
                  active={feedback[alternative.id] === true}
                  onClick={() => provideFeedback(alternative.id, true)}
                >
                  <ThumbsUp size={10} />
                </FeedbackButton>
                <FeedbackButton
                  active={feedback[alternative.id] === false}
                  onClick={() => provideFeedback(alternative.id, false)}
                >
                  <ThumbsDown size={10} />
                </FeedbackButton>
              </FeedbackButtons>

              <ComparisonHeader>
                <ComparisonTitle>{alternative.title}</ComparisonTitle>
                <HealthBadge level={alternative.healthLevel}>
                  <HealthIcon size={10} />
                  {alternative.healthLevel.toUpperCase()}
                </HealthBadge>
              </ComparisonHeader>

              <ProductComparison>
                <ProductSide>
                  <ProductImage>
                    <Package size={24} color="#9ca3af" />
                  </ProductImage>
                  <ProductName>{alternative.currentProduct.name}</ProductName>
                  <ProductBrand>{alternative.currentProduct.brand}</ProductBrand>
                  <ProductPrice>${alternative.currentProduct.price.toFixed(2)}</ProductPrice>
                </ProductSide>

                <ComparisonArrow>
                  <ArrowIcon>
                    <ArrowRight size={24} />
                  </ArrowIcon>
                  <ArrowLabel>Upgrade</ArrowLabel>
                </ComparisonArrow>

                <ProductSide>
                  <ProductImage recommended>
                    <Package size={24} color="#10b981" />
                  </ProductImage>
                  <ProductName>{alternative.alternativeProduct.name}</ProductName>
                  <ProductBrand>{alternative.alternativeProduct.brand}</ProductBrand>
                  <ProductPrice>${alternative.alternativeProduct.price.toFixed(2)}</ProductPrice>
                </ProductSide>
              </ProductComparison>

              <HealthBenefits>
                <BenefitsTitle>Health Benefits</BenefitsTitle>
                <BenefitsList>
                  {alternative.benefits.map((benefit, benefitIndex) => {
                    const BenefitIcon = getBenefitIcon(benefit.type);
                    return (
                      <BenefitTag key={benefitIndex} type={benefit.type}>
                        <BenefitIcon size={8} />
                        {benefit.label}
                      </BenefitTag>
                    );
                  })}
                </BenefitsList>
              </HealthBenefits>

              <NutritionComparison>
                <BenefitsTitle>Nutrition Comparison (per serving)</BenefitsTitle>
                <NutritionGrid>
                  {Object.entries(alternative.nutritionComparison).map(([key, values]) => {
                    const ImprovementIcon = getImprovementIcon(values.improved);
                    return (
                      <NutritionRow key={key} improved={values.improved}>
                        <NutritionLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</NutritionLabel>
                        <NutritionValue>
                          {values.current} → {values.alternative}
                          <ImprovementIcon 
                            size={12} 
                            color={values.improved ? '#10b981' : '#ef4444'} 
                          />
                        </NutritionValue>
                      </NutritionRow>
                    );
                  })}
                </NutritionGrid>
              </NutritionComparison>

              <AlternativeActions>
                <AlternativeButton 
                  variant="primary"
                  onClick={() => replaceProduct(alternative.id)}
                >
                  <RefreshCw size={12} />
                  Replace Item
                </AlternativeButton>
                <AlternativeButton onClick={() => addAlternative(alternative.id)}>
                  <Plus size={12} />
                  Add Alternative
                </AlternativeButton>
              </AlternativeActions>
            </AlternativeCard>
          );
        })}
      </AlternativesGrid>
    </Container>
  );
};

export default HealthConsciousAlternatives;