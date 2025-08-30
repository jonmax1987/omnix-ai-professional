import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../atoms/Icon';

const Container = styled(motion.div)`
  background: ${props => props.theme?.colors?.background?.paper || '#ffffff'};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e5e7eb'};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.text?.primary || '#1f2937'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.variant === 'primary' 
    ? (props.theme?.colors?.primary?.[600] || '#2563eb')
    : (props.theme?.colors?.background?.secondary || '#f3f4f6')};
  color: ${props => props.variant === 'primary' 
    ? '#ffffff' 
    : (props.theme?.colors?.text?.primary || '#1f2937')};
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;

  &:hover {
    background: ${props => props.variant === 'primary' 
      ? (props.theme?.colors?.primary?.[700] || '#1d4ed8')
      : (props.theme?.colors?.background?.tertiary || '#e5e7eb')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: ${props => props.theme?.colors?.background?.secondary || '#f3f4f6'};
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
`;

const Tab = styled(motion.button)`
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: ${props => props.active 
    ? (props.theme?.colors?.background?.paper || '#ffffff')
    : 'transparent'};
  color: ${props => props.active 
    ? (props.theme?.colors?.primary?.[600] || '#2563eb')
    : (props.theme?.colors?.text?.secondary || '#6b7280')};
  border-radius: 6px;
  font-weight: ${props => props.active ? '500' : '400'};
  cursor: pointer;
  font-size: 14px;
  box-shadow: ${props => props.active ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'};
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const SuggestionCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.background?.secondary || '#f9fafb'};
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e5e7eb'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: ${props => props.theme?.colors?.primary?.[300] || '#93c5fd'};
    background: ${props => props.theme?.colors?.primary?.[50] || '#eff6ff'};
  }
`;

const SuggestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ProductName = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme?.colors?.text?.primary || '#1f2937'};
  margin: 0 0 4px 0;
`;

const SupplierName = styled.span`
  font-size: 12px;
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
`;

const PriorityBadge = styled.span.withConfig({
  shouldForwardProp: (prop) => !['priority'].includes(prop)
})`
  background: ${props => {
    switch (props.priority) {
      case 'high': return props.theme?.colors?.error?.[100] || '#fef2f2';
      case 'medium': return props.theme?.colors?.warning?.[100] || '#fffbeb';
      case 'low': return props.theme?.colors?.success?.[100] || '#f0fdf4';
      default: return props.theme?.colors?.background?.tertiary || '#e5e7eb';
    }
  }};
  color: ${props => {
    switch (props.priority) {
      case 'high': return props.theme?.colors?.error?.[700] || '#b91c1c';
      case 'medium': return props.theme?.colors?.warning?.[700] || '#a16207';
      case 'low': return props.theme?.colors?.success?.[700] || '#15803d';
      default: return props.theme?.colors?.text?.secondary || '#6b7280';
    }
  }};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
`;

const SuggestionDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DetailLabel = styled.span`
  font-size: 11px;
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
  text-transform: uppercase;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: ${props => props.theme?.colors?.text?.primary || '#1f2937'};
  font-weight: 500;
`;

const CheckboxContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const SelectedSummary = styled(motion.div)`
  background: ${props => props.theme?.colors?.primary?.[50] || '#eff6ff'};
  border: 1px solid ${props => props.theme?.colors?.primary?.[200] || '#bfdbfe'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const SummaryTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.primary?.[800] || '#1e40af'};
  margin: 0 0 8px 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
`;

const OrderForm = styled.div`
  background: ${props => props.theme?.colors?.background?.paper || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e5e7eb'};
  border-radius: 12px;
  padding: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
  text-transform: uppercase;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e5e7eb'};
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary?.[500] || '#3b82f6'};
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e5e7eb'};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary?.[500] || '#3b82f6'};
  }
`;

const BulkOrderGenerationInterface = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [orderSettings, setOrderSettings] = useState({
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    priority: 'normal',
    notes: ''
  });

  // Mock data for AI suggestions
  const [suggestions] = useState([
    {
      id: 1,
      productName: 'Organic Bananas',
      supplier: 'Fresh Farm Co',
      currentStock: 23,
      suggestedQuantity: 120,
      priority: 'high',
      depletionDate: '2025-01-22',
      unitPrice: 0.89,
      totalCost: 106.80,
      leadTime: '2-3 days',
      reason: 'High demand season, low stock'
    },
    {
      id: 2,
      productName: 'Whole Milk 1L',
      supplier: 'Dairy Excellence',
      currentStock: 45,
      suggestedQuantity: 200,
      priority: 'high',
      depletionDate: '2025-01-23',
      unitPrice: 1.25,
      totalCost: 250.00,
      leadTime: '1-2 days',
      reason: 'Daily essential, consistent demand'
    },
    {
      id: 3,
      productName: 'Premium Coffee Beans',
      supplier: 'Bean Masters',
      currentStock: 78,
      suggestedQuantity: 50,
      priority: 'medium',
      depletionDate: '2025-01-28',
      unitPrice: 12.99,
      totalCost: 649.50,
      leadTime: '3-5 days',
      reason: 'Steady consumption rate'
    },
    {
      id: 4,
      productName: 'Artisan Bread',
      supplier: 'Local Bakery',
      currentStock: 12,
      suggestedQuantity: 80,
      priority: 'medium',
      depletionDate: '2025-01-21',
      unitPrice: 3.50,
      totalCost: 280.00,
      leadTime: '1 day',
      reason: 'Popular breakfast item'
    },
    {
      id: 5,
      productName: 'Greek Yogurt 500g',
      supplier: 'Dairy Excellence',
      currentStock: 67,
      suggestedQuantity: 100,
      priority: 'low',
      depletionDate: '2025-01-30',
      unitPrice: 2.45,
      totalCost: 245.00,
      leadTime: '1-2 days',
      reason: 'Health trend growing'
    }
  ]);

  const toggleSuggestion = (suggestionId) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const selectAllSuggestions = () => {
    const filteredSuggestions = getFilteredSuggestions();
    const allIds = filteredSuggestions.map(s => s.id);
    setSelectedSuggestions(allIds);
  };

  const clearAllSelections = () => {
    setSelectedSuggestions([]);
  };

  const getFilteredSuggestions = () => {
    switch (activeTab) {
      case 'high-priority':
        return suggestions.filter(s => s.priority === 'high');
      case 'by-supplier':
        return suggestions.sort((a, b) => a.supplier.localeCompare(b.supplier));
      default:
        return suggestions.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
  };

  const getSelectedSummary = () => {
    const selected = suggestions.filter(s => selectedSuggestions.includes(s.id));
    return {
      totalItems: selected.length,
      totalProducts: selected.reduce((sum, s) => sum + s.suggestedQuantity, 0),
      totalCost: selected.reduce((sum, s) => sum + s.totalCost, 0),
      suppliers: [...new Set(selected.map(s => s.supplier))].length
    };
  };

  const generateBulkOrder = () => {
    if (selectedSuggestions.length === 0) {
      alert('Please select at least one suggestion to generate orders.');
      return;
    }
    
    // This would integrate with the actual order management system
    console.log('Generating bulk order:', {
      suggestions: selectedSuggestions,
      settings: orderSettings
    });
    
    alert(`Successfully generated ${selectedSuggestions.length} orders!`);
    setSelectedSuggestions([]);
  };

  const summary = getSelectedSummary();

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <Title>
          <Icon name="shopping-cart" size={24} />
          Bulk Order Generation
        </Title>
        <div style={{ display: 'flex', gap: '8px' }}>
          <ActionButton onClick={selectAllSuggestions}>
            <Icon name="check-square" size={16} />
            Select All
          </ActionButton>
          <ActionButton onClick={clearAllSelections}>
            <Icon name="x-square" size={16} />
            Clear
          </ActionButton>
          <ActionButton 
            variant="primary" 
            onClick={generateBulkOrder}
            disabled={selectedSuggestions.length === 0}
          >
            <Icon name="zap" size={16} />
            Generate Orders ({selectedSuggestions.length})
          </ActionButton>
        </div>
      </Header>

      <TabContainer>
        <Tab 
          active={activeTab === 'suggestions'} 
          onClick={() => setActiveTab('suggestions')}
        >
          All Suggestions
        </Tab>
        <Tab 
          active={activeTab === 'high-priority'} 
          onClick={() => setActiveTab('high-priority')}
        >
          High Priority
        </Tab>
        <Tab 
          active={activeTab === 'by-supplier'} 
          onClick={() => setActiveTab('by-supplier')}
        >
          By Supplier
        </Tab>
      </TabContainer>

      <AnimatePresence mode="wait">
        {selectedSuggestions.length > 0 && (
          <SelectedSummary
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SummaryTitle>Selected Orders Summary</SummaryTitle>
            <SummaryGrid>
              <DetailItem>
                <DetailLabel>Items</DetailLabel>
                <DetailValue>{summary.totalItems}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Total Products</DetailLabel>
                <DetailValue>{summary.totalProducts.toLocaleString()}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Total Cost</DetailLabel>
                <DetailValue>${summary.totalCost.toLocaleString()}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Suppliers</DetailLabel>
                <DetailValue>{summary.suppliers}</DetailValue>
              </DetailItem>
            </SummaryGrid>
          </SelectedSummary>
        )}
      </AnimatePresence>

      <Content>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {getFilteredSuggestions().map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleSuggestion(suggestion.id)}
              >
                <CheckboxContainer>
                  <Checkbox
                    type="checkbox"
                    checked={selectedSuggestions.includes(suggestion.id)}
                    onChange={() => toggleSuggestion(suggestion.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </CheckboxContainer>
                
                <SuggestionHeader>
                  <div>
                    <ProductName>{suggestion.productName}</ProductName>
                    <SupplierName>{suggestion.supplier}</SupplierName>
                  </div>
                  <PriorityBadge priority={suggestion.priority}>
                    {suggestion.priority}
                  </PriorityBadge>
                </SuggestionHeader>

                <SuggestionDetails>
                  <DetailItem>
                    <DetailLabel>Current Stock</DetailLabel>
                    <DetailValue>{suggestion.currentStock}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Suggested Qty</DetailLabel>
                    <DetailValue>{suggestion.suggestedQuantity}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Unit Price</DetailLabel>
                    <DetailValue>${suggestion.unitPrice}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Total Cost</DetailLabel>
                    <DetailValue>${suggestion.totalCost.toLocaleString()}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Lead Time</DetailLabel>
                    <DetailValue>{suggestion.leadTime}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Depletion Date</DetailLabel>
                    <DetailValue>{new Date(suggestion.depletionDate).toLocaleDateString()}</DetailValue>
                  </DetailItem>
                </SuggestionDetails>

                <DetailItem>
                  <DetailLabel>AI Reasoning</DetailLabel>
                  <DetailValue style={{ fontSize: '13px', color: '#6b7280' }}>
                    {suggestion.reason}
                  </DetailValue>
                </DetailItem>
              </SuggestionCard>
            ))}
          </motion.div>
        </AnimatePresence>

        {selectedSuggestions.length > 0 && (
          <OrderForm>
            <SummaryTitle style={{ marginBottom: '16px' }}>Order Settings</SummaryTitle>
            <FormRow>
              <FormGroup>
                <Label>Order Date</Label>
                <Input
                  type="date"
                  value={orderSettings.orderDate}
                  onChange={(e) => setOrderSettings(prev => ({ ...prev, orderDate: e.target.value }))}
                />
              </FormGroup>
              <FormGroup>
                <Label>Preferred Delivery Date</Label>
                <Input
                  type="date"
                  value={orderSettings.deliveryDate}
                  onChange={(e) => setOrderSettings(prev => ({ ...prev, deliveryDate: e.target.value }))}
                />
              </FormGroup>
              <FormGroup>
                <Label>Priority Level</Label>
                <Select
                  value={orderSettings.priority}
                  onChange={(e) => setOrderSettings(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FormGroup>
            </FormRow>
            <FormGroup>
              <Label>Order Notes</Label>
              <Input
                type="text"
                placeholder="Add any special instructions or notes..."
                value={orderSettings.notes}
                onChange={(e) => setOrderSettings(prev => ({ ...prev, notes: e.target.value }))}
              />
            </FormGroup>
          </OrderForm>
        )}
      </Content>
    </Container>
  );
};

export default BulkOrderGenerationInterface;