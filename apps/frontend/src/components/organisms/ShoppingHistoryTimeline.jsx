import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  ChevronDown, 
  Package,
  Star,
  Filter,
  Search
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

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
  justify-content: between;
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

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: white;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SpendingChart = styled.div`
  height: 120px;
  margin-bottom: 24px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 16px;
`;

const ChartTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TimelineContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const TimelineGroup = styled.div`
  margin-bottom: 32px;
`;

const DateHeader = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimelineItem = styled(motion.div)`
  display: flex;
  margin-bottom: 16px;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: 20px;
    top: 48px;
    bottom: -16px;
    width: 2px;
    background: ${({ theme }) => theme.colors.gray[200]};
  }
  
  &:last-child:before {
    display: none;
  }
`;

const TimelineDot = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
  margin-left: 16px;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ShopInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ShopDetails = styled.div`
  flex: 1;
`;

const ShopName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ShopMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const Amount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  text-align: right;
`;

const AmountSub = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: right;
`;

const ProductsList = styled.div`
  margin-top: 12px;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
`;

const ProductsCount = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ToggleIcon = styled(motion.div)`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProductsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 8px;
`;

const ProductChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
`;

const ShoppingHistoryTimeline = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const spendingData = [
    { date: '2024-01', amount: 320 },
    { date: '2024-02', amount: 285 },
    { date: '2024-03', amount: 410 },
    { date: '2024-04', amount: 375 },
    { date: '2024-05', amount: 445 },
    { date: '2024-06', amount: 390 },
  ];

  const historyData = [
    {
      date: 'Today',
      items: [
        {
          id: 1,
          shopName: 'Fresh Market Downtown',
          time: '2:30 PM',
          location: '123 Main St',
          amount: 89.50,
          items: 12,
          rating: 4.8,
          products: [
            { name: 'Organic Apples', qty: '2kg' },
            { name: 'Greek Yogurt', qty: '3x' },
            { name: 'Whole Grain Bread', qty: '1x' },
            { name: 'Free Range Eggs', qty: '1 dozen' },
            { name: 'Fresh Salmon', qty: '500g' },
            { name: 'Spinach', qty: '1 bag' }
          ]
        }
      ]
    },
    {
      date: 'Yesterday',
      items: [
        {
          id: 2,
          shopName: 'QuickStop Express',
          time: '6:45 PM',
          location: '456 Oak Ave',
          amount: 23.75,
          items: 5,
          rating: 4.2,
          products: [
            { name: 'Milk', qty: '1L' },
            { name: 'Coffee Beans', qty: '250g' },
            { name: 'Energy Bar', qty: '2x' }
          ]
        }
      ]
    },
    {
      date: 'Tuesday, June 18',
      items: [
        {
          id: 3,
          shopName: 'Mega Grocery Center',
          time: '11:15 AM',
          location: '789 Pine Rd',
          amount: 156.30,
          items: 28,
          rating: 4.6,
          products: [
            { name: 'Chicken Breast', qty: '1kg' },
            { name: 'Rice', qty: '5kg' },
            { name: 'Pasta', qty: '3x' },
            { name: 'Tomatoes', qty: '1kg' },
            { name: 'Cheese', qty: '200g' },
            { name: 'Olive Oil', qty: '500ml' },
            { name: 'Onions', qty: '2kg' },
            { name: 'Bell Peppers', qty: '4x' }
          ]
        }
      ]
    }
  ];

  const toggleItemExpansion = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredHistory = historyData.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.products.some(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  })).filter(group => group.items.length > 0);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <ShoppingBag size={20} />
          Shopping History
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterButton>
            <Filter size={16} />
            Filter
            <ChevronDown size={14} />
          </FilterButton>
        </Controls>
      </Header>

      <SpendingChart>
        <ChartTitle>
          <TrendingUp size={16} />
          Monthly Spending Trend
        </ChartTitle>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={spendingData}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Spent']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#4f46e5" 
              fill="#4f46e5" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </SpendingChart>

      <TimelineContainer>
        {filteredHistory.map((group, groupIndex) => (
          <TimelineGroup key={groupIndex}>
            <DateHeader>
              <Calendar size={16} />
              {group.date}
            </DateHeader>
            
            {group.items.map((item) => (
              <TimelineItem
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
              >
                <TimelineDot>
                  <ShoppingBag size={18} color="white" />
                </TimelineDot>
                
                <TimelineContent>
                  <ShopInfo>
                    <ShopDetails>
                      <ShopName>{item.shopName}</ShopName>
                      <ShopMeta>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {item.time}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {item.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Package size={12} />
                          {item.items} items
                        </span>
                      </ShopMeta>
                      <RatingBadge>
                        <Star size={12} fill="currentColor" />
                        {item.rating}
                      </RatingBadge>
                    </ShopDetails>
                    
                    <div>
                      <Amount>${item.amount.toFixed(2)}</Amount>
                      <AmountSub>Total</AmountSub>
                    </div>
                  </ShopInfo>
                  
                  <ProductsList>
                    <ProductsHeader onClick={() => toggleItemExpansion(item.id)}>
                      <ProductsCount>
                        {item.products.length} products purchased
                      </ProductsCount>
                      <ToggleIcon
                        animate={{ rotate: expandedItems.has(item.id) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </ToggleIcon>
                    </ProductsHeader>
                    
                    <AnimatePresence>
                      {expandedItems.has(item.id) && (
                        <ProductsGrid
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.products.map((product, index) => (
                            <ProductChip key={index}>
                              {product.name}
                              <span style={{ fontWeight: 500 }}>{product.qty}</span>
                            </ProductChip>
                          ))}
                        </ProductsGrid>
                      )}
                    </AnimatePresence>
                  </ProductsList>
                </TimelineContent>
              </TimelineItem>
            ))}
          </TimelineGroup>
        ))}
      </TimelineContainer>
    </Container>
  );
};

export default ShoppingHistoryTimeline;