import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Clock,
  DollarSign,
  Star,
  MapPin,
  Truck,
  Bell,
  Filter,
  Heart,
  Settings,
  Target,
  Calendar,
  Package,
  Zap
} from 'lucide-react';

const ConfigContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  margin: 0;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Section = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.primary.light}20;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.light};
    background: ${({ theme }) => theme.colors.primary.light}05;
  }
`;

const PreferenceLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PreferenceName = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const PreferenceDesc = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.neutral.light};
  transition: 0.2s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
  }
`;

const RangeContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const RangeLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const RangeLabelText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const RangeValue = styled.span`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const RangeSlider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.neutral.light};
  outline: none;
  appearance: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    box-shadow: ${({ theme }) => theme.shadows.small};
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    border: none;
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CategoryCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ isSelected, theme }) => 
    isSelected ? theme.colors.primary.light : theme.colors.surface.primary};
  color: ${({ isSelected, theme }) => 
    isSelected ? 'white' : theme.colors.text.secondary};
  border: 2px solid ${({ isSelected, theme }) => 
    isSelected ? theme.colors.primary.main : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ isSelected, theme }) => 
      isSelected ? theme.colors.primary.main : theme.colors.primary.light}10;
  }
`;

const TimeSlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TimeSlot = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ isSelected, theme }) => 
    isSelected ? theme.colors.primary.main : theme.colors.surface.primary};
  color: ${({ isSelected, theme }) => 
    isSelected ? 'white' : theme.colors.text.primary};
  border: 1px solid ${({ isSelected, theme }) => 
    isSelected ? theme.colors.primary.main : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ isSelected, theme }) => 
      isSelected ? theme.colors.primary.dark : theme.colors.primary.light}10;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const SaveButton = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const ShoppingPreferencesConfig = () => {
  const [preferences, setPreferences] = useState({
    // Shopping Behavior
    budgetLimit: 500,
    priceAlerts: true,
    dealNotifications: true,
    smartRecommendations: true,
    
    // Delivery Preferences
    preferredDeliveryTime: ['morning'],
    deliveryLocation: 'home',
    deliveryInstructions: '',
    
    // Product Preferences
    preferredCategories: ['groceries', 'electronics'],
    avoidCategories: [],
    brandLoyalty: 'moderate',
    qualityVsPrice: 70, // 0-100 scale
    
    // Shopping Frequency
    frequentlyNeeded: ['groceries', 'household'],
    bulkPurchases: false,
    subscriptionPreference: true,
    
    // Notifications
    lowStockAlerts: true,
    priceDropAlerts: true,
    newProductAlerts: false,
    weeklyRecommendations: true,
    
    // AI Personalization
    aiRecommendationLevel: 'high',
    dataSharing: 'balanced',
    learningFromPurchases: true
  });

  const categories = [
    { id: 'groceries', name: 'Groceries', icon: '🛒' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'home', name: 'Home & Garden', icon: '🏠' },
    { id: 'health', name: 'Health & Beauty', icon: '💄' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'toys', name: 'Toys', icon: '🧸' }
  ];

  const timeSlots = [
    { id: 'morning', label: '6 AM - 12 PM' },
    { id: 'afternoon', label: '12 PM - 6 PM' },
    { id: 'evening', label: '6 PM - 10 PM' },
    { id: 'anytime', label: 'Anytime' }
  ];

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleRangeChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: parseInt(value)
    }));
  };

  const handleCategoryToggle = (categoryId, type = 'preferredCategories') => {
    setPreferences(prev => {
      const currentList = prev[type];
      const newList = currentList.includes(categoryId)
        ? currentList.filter(id => id !== categoryId)
        : [...currentList, categoryId];
      
      return {
        ...prev,
        [type]: newList
      };
    });
  };

  const handleTimeSlotToggle = (slotId) => {
    setPreferences(prev => {
      const currentSlots = prev.preferredDeliveryTime;
      const newSlots = currentSlots.includes(slotId)
        ? currentSlots.filter(id => id !== slotId)
        : [...currentSlots, slotId];
      
      return {
        ...prev,
        preferredDeliveryTime: newSlots
      };
    });
  };

  const handleSave = () => {
    console.log('Saving preferences:', preferences);
    // Implementation for saving preferences
  };

  return (
    <ConfigContainer>
      <Header>
        <Title>
          <Settings size={24} />
          Shopping Preferences
        </Title>
        <Description>
          Customize your shopping experience with AI-powered personalization
        </Description>
      </Header>

      <SectionGrid>
        {/* Budget & Pricing */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionHeader>
            <SectionIcon>
              <DollarSign size={20} />
            </SectionIcon>
            <SectionTitle>Budget & Pricing</SectionTitle>
          </SectionHeader>

          <RangeContainer>
            <RangeLabel>
              <RangeLabelText>Monthly Budget Limit</RangeLabelText>
              <RangeValue>${preferences.budgetLimit}</RangeValue>
            </RangeLabel>
            <RangeSlider
              type="range"
              min="100"
              max="2000"
              step="50"
              value={preferences.budgetLimit}
              onChange={(e) => handleRangeChange('budgetLimit', e.target.value)}
            />
          </RangeContainer>

          <RangeContainer>
            <RangeLabel>
              <RangeLabelText>Quality vs Price Priority</RangeLabelText>
              <RangeValue>{preferences.qualityVsPrice}% Quality</RangeValue>
            </RangeLabel>
            <RangeSlider
              type="range"
              min="0"
              max="100"
              step="10"
              value={preferences.qualityVsPrice}
              onChange={(e) => handleRangeChange('qualityVsPrice', e.target.value)}
            />
          </RangeContainer>

          <PreferenceItem>
            <PreferenceLabel>
              <PreferenceName>Price Drop Alerts</PreferenceName>
              <PreferenceDesc>Get notified when prices drop on watched items</PreferenceDesc>
            </PreferenceLabel>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.priceDropAlerts}
                onChange={() => handleToggle('priceDropAlerts')}
              />
              <ToggleSlider />
            </Toggle>
          </PreferenceItem>

          <PreferenceItem>
            <PreferenceLabel>
              <PreferenceName>Deal Notifications</PreferenceName>
              <PreferenceDesc>Receive alerts about special offers and discounts</PreferenceDesc>
            </PreferenceLabel>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.dealNotifications}
                onChange={() => handleToggle('dealNotifications')}
              />
              <ToggleSlider />
            </Toggle>
          </PreferenceItem>
        </Section>

        {/* Product Categories */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader>
            <SectionIcon>
              <Filter size={20} />
            </SectionIcon>
            <SectionTitle>Product Categories</SectionTitle>
          </SectionHeader>

          <div style={{ marginBottom: '1rem' }}>
            <PreferenceName style={{ marginBottom: '0.5rem', display: 'block' }}>
              Preferred Categories
            </PreferenceName>
            <CategoryGrid>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  isSelected={preferences.preferredCategories.includes(category.id)}
                  onClick={() => handleCategoryToggle(category.id)}
                  type="button"
                >
                  <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                  {category.name}
                </CategoryCard>
              ))}
            </CategoryGrid>
          </div>

          <div>
            <RangeLabel>
              <RangeLabelText>Brand Loyalty</RangeLabelText>
            </RangeLabel>
            <Select
              value={preferences.brandLoyalty}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                brandLoyalty: e.target.value 
              }))}
            >
              <option value="low">Try new brands</option>
              <option value="moderate">Balanced approach</option>
              <option value="high">Stick to known brands</option>
            </Select>
          </div>
        </Section>

        {/* Delivery Preferences */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader>
            <SectionIcon>
              <Truck size={20} />
            </SectionIcon>
            <SectionTitle>Delivery Preferences</SectionTitle>
          </SectionHeader>

          <div style={{ marginBottom: '1rem' }}>
            <PreferenceName style={{ marginBottom: '0.5rem', display: 'block' }}>
              Preferred Delivery Times
            </PreferenceName>
            <TimeSlotGrid>
              {timeSlots.map((slot) => (
                <TimeSlot
                  key={slot.id}
                  isSelected={preferences.preferredDeliveryTime.includes(slot.id)}
                  onClick={() => handleTimeSlotToggle(slot.id)}
                  type="button"
                >
                  {slot.label}
                </TimeSlot>
              ))}
            </TimeSlotGrid>
          </div>

          <div>
            <RangeLabel>
              <RangeLabelText>Delivery Location</RangeLabelText>
            </RangeLabel>
            <Select
              value={preferences.deliveryLocation}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                deliveryLocation: e.target.value 
              }))}
            >
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="pickup">Store Pickup</option>
              <option value="locker">Package Locker</option>
            </Select>
          </div>
        </Section>

        {/* AI Personalization */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader>
            <SectionIcon>
              <Zap size={20} />
            </SectionIcon>
            <SectionTitle>AI Personalization</SectionTitle>
          </SectionHeader>

          <PreferenceItem>
            <PreferenceLabel>
              <PreferenceName>Smart Recommendations</PreferenceName>
              <PreferenceDesc>AI-powered product suggestions based on your behavior</PreferenceDesc>
            </PreferenceLabel>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.smartRecommendations}
                onChange={() => handleToggle('smartRecommendations')}
              />
              <ToggleSlider />
            </Toggle>
          </PreferenceItem>

          <PreferenceItem>
            <PreferenceLabel>
              <PreferenceName>Learn from Purchases</PreferenceName>
              <PreferenceDesc>Improve recommendations based on purchase history</PreferenceDesc>
            </PreferenceLabel>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.learningFromPurchases}
                onChange={() => handleToggle('learningFromPurchases')}
              />
              <ToggleSlider />
            </Toggle>
          </PreferenceItem>

          <div style={{ marginTop: '1rem' }}>
            <RangeLabel>
              <RangeLabelText>AI Recommendation Level</RangeLabelText>
            </RangeLabel>
            <Select
              value={preferences.aiRecommendationLevel}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                aiRecommendationLevel: e.target.value 
              }))}
            >
              <option value="low">Conservative</option>
              <option value="medium">Balanced</option>
              <option value="high">Aggressive</option>
            </Select>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <RangeLabel>
              <RangeLabelText>Data Sharing</RangeLabelText>
            </RangeLabel>
            <Select
              value={preferences.dataSharing}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                dataSharing: e.target.value 
              }))}
            >
              <option value="minimal">Minimal</option>
              <option value="balanced">Balanced</option>
              <option value="full">Full Personalization</option>
            </Select>
          </div>
        </Section>

        {/* Notifications */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionHeader>
            <SectionIcon>
              <Bell size={20} />
            </SectionIcon>
            <SectionTitle>Notifications</SectionTitle>
          </SectionHeader>

          <PreferenceItem>
            <PreferenceLabel>
              <PreferenceName>Low Stock Alerts</PreferenceName>
              <PreferenceDesc>Get notified when frequently bought items are running low</PreferenceDesc>
            </PreferenceLabel>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.lowStockAlerts}
                onChange={() => handleToggle('lowStockAlerts')}
              />
              <ToggleSlider />
            </Toggle>
          </PreferenceItem>

          <PreferenceItem>
            <PreferenceLabel>
              <PreferenceName>New Product Alerts</PreferenceName>
              <PreferenceDesc>Be first to know about new products in your interests</PreferenceDesc>
            </PreferenceLabel>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.newProductAlerts}
                onChange={() => handleToggle('newProductAlerts')}
              />
              <ToggleSlider />
            </Toggle>
          </PreferenceItem>

          <PreferenceItem>
            <PreferenceLabel>
              <PreferenceName>Weekly Recommendations</PreferenceName>
              <PreferenceDesc>Receive curated product recommendations every week</PreferenceDesc>
            </PreferenceLabel>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.weeklyRecommendations}
                onChange={() => handleToggle('weeklyRecommendations')}
              />
              <ToggleSlider />
            </Toggle>
          </PreferenceItem>
        </Section>

        {/* Shopping Behavior */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SectionHeader>
            <SectionIcon>
              <ShoppingCart size={20} />
            </SectionIcon>
            <SectionTitle>Shopping Behavior</SectionTitle>
          </SectionHeader>

          <PreferenceItem>
            <PreferenceLabel>
              <PreferenceName>Bulk Purchases</PreferenceName>
              <PreferenceDesc>Prefer buying in larger quantities for discounts</PreferenceDesc>
            </PreferenceLabel>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.bulkPurchases}
                onChange={() => handleToggle('bulkPurchases')}
              />
              <ToggleSlider />
            </Toggle>
          </PreferenceItem>

          <PreferenceItem>
            <PreferenceLabel>
              <PreferenceName>Subscription Preference</PreferenceName>
              <PreferenceDesc>Open to subscription services for regular items</PreferenceDesc>
            </PreferenceLabel>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={preferences.subscriptionPreference}
                onChange={() => handleToggle('subscriptionPreference')}
              />
              <ToggleSlider />
            </Toggle>
          </PreferenceItem>

          <div style={{ marginTop: '1rem' }}>
            <PreferenceName style={{ marginBottom: '0.5rem', display: 'block' }}>
              Frequently Needed Categories
            </PreferenceName>
            <CategoryGrid>
              {categories.slice(0, 4).map((category) => (
                <CategoryCard
                  key={category.id}
                  isSelected={preferences.frequentlyNeeded.includes(category.id)}
                  onClick={() => handleCategoryToggle(category.id, 'frequentlyNeeded')}
                  type="button"
                >
                  <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                  {category.name}
                </CategoryCard>
              ))}
            </CategoryGrid>
          </div>
        </Section>
      </SectionGrid>

      <SaveButton
        onClick={handleSave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Settings size={18} />
        Save Preferences
      </SaveButton>
    </ConfigContainer>
  );
};

export default ShoppingPreferencesConfig;