import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Bell, 
  Star, 
  Clock, 
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Filter,
  Search,
  Settings,
  BarChart3,
  PieChart,
  Award,
  ShoppingCart,
  Heart,
  Tag,
  Calendar,
  MapPin,
  Timer,
  Package,
  Percent,
  ArrowDown,
  ArrowUp,
  Brain,
  Lightbulb,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
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

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const SummaryCard = styled(motion.div)`
  background: linear-gradient(135deg, ${({ color }) => color}15, ${({ color }) => color}05);
  border: 1px solid ${({ color }) => color}20;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const CardValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const CardLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  margin-bottom: 8px;
`;

const CardTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success : theme.colors.error};
  font-weight: 500;
`;

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const DealsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  padding: 4px;
  overflow-x: auto;
`;

const FilterTab = styled.button`
  flex: 1;
  min-width: 100px;
  padding: 8px 12px;
  border: none;
  background: ${({ active, theme }) => active ? 'white' : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text.primary : theme.colors.text.secondary};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) => active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  white-space: nowrap;
`;

const DealsList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const DealCard = styled(motion.div)`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const DealBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'flash': return theme.colors.error;
      case 'bulk': return theme.colors.warning;
      case 'clearance': return theme.colors.success;
      case 'new': return theme.colors.primary;
      default: return theme.colors.gray[300];
    }
  }};
  color: white;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  position: absolute;
  top: 12px;
  right: 12px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ProductBrand = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const CurrentPrice = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success};
`;

const OriginalPrice = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: line-through;
`;

const DiscountPercent = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.error};
`;

const DealDetails = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
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
`;

const DealActions = styled.div`
  display: flex;
  gap: 8px;
`;

const DealButton = styled.button`
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

const AlertsPanel = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const AlertsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AlertsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  max-height: 200px;
  overflow-y: auto;
`;

const AlertItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid ${({ type, theme }) => {
    switch (type) {
      case 'price-drop': return theme.colors.success;
      case 'flash-sale': return theme.colors.error;
      case 'bulk-discount': return theme.colors.warning;
      case 'expiring': return theme.colors.primary;
      default: return theme.colors.gray[300];
    }
  }};
`;

const AlertIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'price-drop': return theme.colors.success;
      case 'flash-sale': return theme.colors.error;
      case 'bulk-discount': return theme.colors.warning;
      case 'expiring': return theme.colors.primary;
      default: return theme.colors.gray[300];
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  margin-bottom: 2px;
`;

const AlertTime = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ChartSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  height: 200px;
`;

const ChartTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DealAlertsOptimization = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const summaryData = [
    {
      label: 'Active Deals',
      value: '47',
      trend: 12.5,
      isPositive: true,
      icon: Tag,
      color: '#4f46e5'
    },
    {
      label: 'Potential Savings',
      value: '$127.50',
      trend: 8.3,
      isPositive: true,
      icon: DollarSign,
      color: '#10b981'
    },
    {
      label: 'Price Alerts',
      value: '8',
      trend: -3.2,
      isPositive: false,
      icon: Bell,
      color: '#f59e0b'
    },
    {
      label: 'Avg Discount',
      value: '23%',
      trend: 5.7,
      isPositive: true,
      icon: Percent,
      color: '#ef4444'
    }
  ];

  const filterTabs = [
    { id: 'all', label: 'All Deals' },
    { id: 'flash', label: 'Flash Sales' },
    { id: 'bulk', label: 'Bulk Discounts' },
    { id: 'clearance', label: 'Clearance' },
    { id: 'favorites', label: 'Your Favorites' }
  ];

  const deals = [
    {
      id: 1,
      name: 'Organic Greek Yogurt',
      brand: 'Fresh Valley',
      currentPrice: 4.99,
      originalPrice: 6.99,
      discountPercent: 29,
      type: 'flash',
      expiresIn: '2 hours',
      stock: 'Limited',
      store: 'Fresh Market',
      category: 'Dairy',
      savings: 2.00,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Artisan Sourdough Bread',
      brand: 'Local Bakery',
      currentPrice: 3.75,
      originalPrice: 4.50,
      discountPercent: 17,
      type: 'bulk',
      expiresIn: '1 day',
      stock: 'In Stock',
      store: 'Corner Bakery',
      category: 'Bakery',
      savings: 0.75,
      rating: 4.6
    },
    {
      id: 3,
      name: 'Premium Olive Oil',
      brand: 'Mediterranean Gold',
      currentPrice: 12.99,
      originalPrice: 18.50,
      discountPercent: 30,
      type: 'clearance',
      expiresIn: '3 days',
      stock: 'Few Left',
      store: 'Gourmet Plus',
      category: 'Pantry',
      savings: 5.51,
      rating: 4.9
    },
    {
      id: 4,
      name: 'Organic Baby Spinach',
      brand: 'Green Fields',
      currentPrice: 2.99,
      originalPrice: 3.75,
      discountPercent: 20,
      type: 'new',
      expiresIn: '5 days',
      stock: 'In Stock',
      store: 'Fresh Market',
      category: 'Produce',
      savings: 0.76,
      rating: 4.4
    },
    {
      id: 5,
      name: 'Almond Butter Crunchy',
      brand: 'Nutty Goodness',
      currentPrice: 9.99,
      originalPrice: 12.99,
      discountPercent: 23,
      type: 'bulk',
      expiresIn: '1 week',
      stock: 'In Stock',
      store: 'Health Foods',
      category: 'Pantry',
      savings: 3.00,
      rating: 4.7
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'price-drop',
      text: 'Greek Yogurt dropped 29% - now $4.99',
      time: '5 minutes ago',
      icon: ArrowDown
    },
    {
      id: 2,
      type: 'flash-sale',
      text: 'Flash sale: Premium coffee 40% off',
      time: '12 minutes ago',
      icon: Zap
    },
    {
      id: 3,
      type: 'bulk-discount',
      text: 'Buy 3 get 1 free on pasta sauces',
      time: '1 hour ago',
      icon: Package
    },
    {
      id: 4,
      type: 'expiring',
      text: 'Olive oil deal expires in 2 hours',
      time: '1 hour ago',
      icon: Timer
    }
  ];

  const savingsData = [
    { week: 'Week 1', savings: 23.50 },
    { week: 'Week 2', savings: 45.20 },
    { week: 'Week 3', savings: 67.80 },
    { week: 'Week 4', savings: 127.50 }
  ];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter !== 'all') {
      matchesFilter = deal.type === activeFilter;
    }
    
    return matchesSearch && matchesFilter;
  });

  const addToCart = (dealId) => {
    console.log('Add to cart:', dealId);
  };

  const addToWatchlist = (dealId) => {
    console.log('Add to watchlist:', dealId);
  };

  const setAlert = (dealId) => {
    console.log('Set alert for:', dealId);
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'flash': return Zap;
      case 'bulk': return Package;
      case 'clearance': return Tag;
      case 'new': return Star;
      default: return DollarSign;
    }
  };

  const getBadgeLabel = (type) => {
    switch (type) {
      case 'flash': return 'FLASH SALE';
      case 'bulk': return 'BULK DEAL';
      case 'clearance': return 'CLEARANCE';
      case 'new': return 'NEW DEAL';
      default: return 'DEAL';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'price-drop': return ArrowDown;
      case 'flash-sale': return Zap;
      case 'bulk-discount': return Package;
      case 'expiring': return Timer;
      default: return Bell;
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
          <DollarSign size={20} />
          Deal Alerts & Optimization
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search deals..."
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
            Alert Settings
          </ActionButton>
          <ActionButton primary>
            <Plus size={16} />
            Add Alert
          </ActionButton>
        </Controls>
      </Header>

      <SummaryCards>
        {summaryData.map((summary, index) => {
          const Icon = summary.icon;
          return (
            <SummaryCard
              key={index}
              color={summary.color}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardHeader>
                <CardIcon color={summary.color}>
                  <Icon size={18} />
                </CardIcon>
              </CardHeader>
              <CardValue>{summary.value}</CardValue>
              <CardLabel>{summary.label}</CardLabel>
              <CardTrend isPositive={summary.isPositive}>
                {summary.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(summary.trend)}% vs last week
              </CardTrend>
            </SummaryCard>
          );
        })}
      </SummaryCards>

      <ContentLayout>
        <DealsPanel>
          <FilterTabs>
            {filterTabs.map(tab => (
              <FilterTab
                key={tab.id}
                active={activeFilter === tab.id}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
              </FilterTab>
            ))}
          </FilterTabs>

          <DealsList>
            {filteredDeals.map((deal, index) => {
              const BadgeIcon = getBadgeIcon(deal.type);
              return (
                <DealCard
                  key={deal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <DealBadge type={deal.type}>
                    <BadgeIcon size={10} />
                    {getBadgeLabel(deal.type)}
                  </DealBadge>

                  <DealHeader>
                    <ProductInfo>
                      <ProductName>{deal.name}</ProductName>
                      <ProductBrand>{deal.brand} • {deal.store}</ProductBrand>
                    </ProductInfo>
                  </DealHeader>

                  <PriceSection>
                    <CurrentPrice>${deal.currentPrice.toFixed(2)}</CurrentPrice>
                    <OriginalPrice>${deal.originalPrice.toFixed(2)}</OriginalPrice>
                    <DiscountPercent>{deal.discountPercent}% OFF</DiscountPercent>
                  </PriceSection>

                  <DealDetails>
                    <DetailRow>
                      <DetailLabel>You Save:</DetailLabel>
                      <DetailValue>${deal.savings.toFixed(2)}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Expires In:</DetailLabel>
                      <DetailValue>{deal.expiresIn}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Stock:</DetailLabel>
                      <DetailValue>{deal.stock}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Rating:</DetailLabel>
                      <DetailValue>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} fill="currentColor" />
                          {deal.rating}
                        </div>
                      </DetailValue>
                    </DetailRow>
                  </DealDetails>

                  <DealActions>
                    <DealButton 
                      variant="primary"
                      onClick={() => addToCart(deal.id)}
                    >
                      <ShoppingCart size={12} />
                      Add to Cart
                    </DealButton>
                    <DealButton onClick={() => addToWatchlist(deal.id)}>
                      <Heart size={12} />
                      Save
                    </DealButton>
                    <DealButton onClick={() => setAlert(deal.id)}>
                      <Bell size={12} />
                      Alert
                    </DealButton>
                  </DealActions>
                </DealCard>
              );
            })}
          </DealsList>
        </DealsPanel>

        <AlertsPanel>
          <AlertsHeader>
            <AlertsTitle>
              <Bell size={16} />
              Recent Alerts
            </AlertsTitle>
            <ActionButton style={{ padding: '4px 8px' }}>
              <Eye size={12} />
              View All
            </ActionButton>
          </AlertsHeader>
          
          <AlertsList>
            {alerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <AlertItem
                  key={alert.id}
                  type={alert.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <AlertIcon type={alert.type}>
                    <Icon size={14} />
                  </AlertIcon>
                  <AlertContent>
                    <AlertText>{alert.text}</AlertText>
                    <AlertTime>{alert.time}</AlertTime>
                  </AlertContent>
                </AlertItem>
              );
            })}
          </AlertsList>

          <ChartSection>
            <ChartTitle>
              <BarChart3 size={14} />
              Weekly Savings
            </ChartTitle>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Savings']}
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
          </ChartSection>
        </AlertsPanel>
      </ContentLayout>
    </Container>
  );
};

export default DealAlertsOptimization;