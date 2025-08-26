import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';

// Styled components
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ItemsSection = styled.div`
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  background: ${props => props.theme.colors.background.secondary};
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const ItemCard = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ItemDetails = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TotalSection = styled.div`
  background: ${props => props.theme.colors.primary[50]};
  border: 1px solid ${props => props.theme.colors.primary[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  display: flex;
  justify-content: between;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const ErrorMessage = styled(motion.div)`
  background: ${props => props.theme.colors.status.error.background};
  color: ${props => props.theme.colors.status.error.text};
  border: 1px solid ${props => props.theme.colors.status.error.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '⚠';
    font-size: 1rem;
  }
`;

// Mock suppliers data - in real app this would come from API
const mockSuppliers = [
  { id: '1', name: 'Tech Distributors Inc.', contactEmail: 'orders@techdist.com' },
  { id: '2', name: 'Global Electronics Ltd.', contactEmail: 'sales@globalelec.com' },
  { id: '3', name: 'Premium Parts Co.', contactEmail: 'orders@premiumparts.com' }
];

// Mock products data - in real app this would come from products API
const mockProducts = [
  { id: '1', name: 'iPhone 14 Pro', sku: 'IP14P-256-BLK', unitCost: 999.00, stock: 5 },
  { id: '2', name: 'MacBook Pro 16"', sku: 'MBP16-512-SIL', unitCost: 2499.00, stock: 2 },
  { id: '3', name: 'iPad Air', sku: 'IPA-256-BLU', unitCost: 599.00, stock: 8 },
  { id: '4', name: 'AirPods Pro', sku: 'APP-2ND-GEN', unitCost: 249.00, stock: 15 },
  { id: '5', name: 'Apple Watch Series 9', sku: 'AWS9-45-GPS', unitCost: 399.00, stock: 10 }
];

function OrderForm({ order, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    priority: 'medium',
    notes: '',
    items: []
  });
  
  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    sku: '',
    quantity: '',
    unitCost: '',
    totalCost: 0
  });
  
  const [error, setError] = useState('');

  // Initialize form data when editing
  useEffect(() => {
    if (order) {
      setFormData({
        supplierId: order.supplierId || '',
        supplierName: order.supplier?.name || '',
        orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expectedDelivery: order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : '',
        priority: order.priority || 'medium',
        notes: order.notes || '',
        items: order.items || []
      });
    }
  }, [order]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  // Handle supplier selection
  const handleSupplierChange = (supplierId) => {
    const supplier = mockSuppliers.find(s => s.id === supplierId);
    setFormData(prev => ({
      ...prev,
      supplierId,
      supplierName: supplier ? supplier.name : ''
    }));
  };

  // Handle new item changes
  const handleNewItemChange = (field, value) => {
    setNewItem(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total cost
      if (field === 'quantity' || field === 'unitCost') {
        const quantity = parseFloat(updated.quantity) || 0;
        const unitCost = parseFloat(updated.unitCost) || 0;
        updated.totalCost = quantity * unitCost;
      }
      
      return updated;
    });
  };

  // Handle product selection for new item
  const handleProductSelect = (productId) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setNewItem(prev => ({
        ...prev,
        productId,
        productName: product.name,
        sku: product.sku,
        unitCost: product.unitCost.toString(),
        totalCost: (parseFloat(prev.quantity) || 0) * product.unitCost
      }));
    }
  };

  // Add item to order
  const handleAddItem = () => {
    if (!newItem.productId || !newItem.quantity || parseFloat(newItem.quantity) <= 0) {
      setError('Please select a product and enter a valid quantity');
      return;
    }

    const item = {
      id: Date.now().toString(), // Temporary ID
      ...newItem,
      quantity: parseFloat(newItem.quantity),
      unitCost: parseFloat(newItem.unitCost),
      totalCost: parseFloat(newItem.quantity) * parseFloat(newItem.unitCost)
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    // Reset new item form
    setNewItem({
      productId: '',
      productName: '',
      sku: '',
      quantity: '',
      unitCost: '',
      totalCost: 0
    });
    
    setError('');
  };

  // Remove item from order
  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Update existing item
  const handleUpdateItem = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: field === 'quantity' || field === 'unitCost' ? parseFloat(value) || 0 : value };
          if (field === 'quantity' || field === 'unitCost') {
            updated.totalCost = updated.quantity * updated.unitCost;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.supplierId) return 'Please select a supplier';
    if (!formData.orderDate) return 'Please select an order date';
    if (formData.items.length === 0) return 'Please add at least one item to the order';
    return null;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Calculate totals
    const totalAmount = formData.items.reduce((sum, item) => sum + item.totalCost, 0);
    const totalItems = formData.items.reduce((sum, item) => sum + item.quantity, 0);

    const orderData = {
      ...formData,
      totalAmount,
      totalItems,
      status: order ? order.status : 'pending'
    };

    onSubmit(orderData);
  };

  // Calculate totals
  const totalAmount = formData.items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  const totalItems = formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && (
        <ErrorMessage
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {error}
        </ErrorMessage>
      )}

      {/* Order Details */}
      <FormSection>
        <Typography variant="h3" weight="600">
          Order Details
        </Typography>
        
        <FormRow>
          <FormGroup>
            <Typography variant="label" weight="500">Supplier *</Typography>
            <select
              value={formData.supplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              required
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Select supplier...</option>
              {mockSuppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </FormGroup>
          
          <FormGroup>
            <Typography variant="label" weight="500">Priority</Typography>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Typography variant="label" weight="500">Order Date *</Typography>
            <Input
              type="date"
              value={formData.orderDate}
              onChange={(e) => handleInputChange('orderDate', e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Typography variant="label" weight="500">Expected Delivery</Typography>
            <Input
              type="date"
              value={formData.expectedDelivery}
              onChange={(e) => handleInputChange('expectedDelivery', e.target.value)}
              min={formData.orderDate}
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Typography variant="label" weight="500">Notes</Typography>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes or special instructions..."
            rows={3}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '80px'
            }}
          />
        </FormGroup>
      </FormSection>

      {/* Order Items */}
      <ItemsSection>
        <Typography variant="h3" weight="600">
          Order Items
        </Typography>
        
        {/* Add New Item */}
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
          <Typography variant="body2" weight="500" style={{ marginBottom: '1rem' }}>
            Add Item
          </Typography>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <Typography variant="caption" color="secondary">Product</Typography>
              <select
                value={newItem.productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">Select product...</option>
                {mockProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Typography variant="caption" color="secondary">Quantity</Typography>
              <Input
                type="number"
                value={newItem.quantity}
                onChange={(e) => handleNewItemChange('quantity', e.target.value)}
                placeholder="0"
                min="1"
                size="sm"
              />
            </div>
            
            <div>
              <Typography variant="caption" color="secondary">Unit Cost</Typography>
              <Input
                type="number"
                value={newItem.unitCost}
                onChange={(e) => handleNewItemChange('unitCost', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                size="sm"
              />
            </div>
            
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddItem}
              disabled={!newItem.productId || !newItem.quantity}
            >
              Add
            </Button>
          </div>
          
          {newItem.totalCost > 0 && (
            <Typography variant="caption" color="secondary" style={{ marginTop: '0.5rem', display: 'block' }}>
              Total: ${newItem.totalCost.toFixed(2)}
            </Typography>
          )}
        </div>

        {/* Items List */}
        <ItemList>
          <AnimatePresence>
            {formData.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ItemCard>
                  <ItemDetails>
                    <div>
                      <Typography variant="body2" weight="500">
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        SKU: {item.sku}
                      </Typography>
                    </div>
                    
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                      min="1"
                      size="sm"
                      style={{ textAlign: 'center' }}
                    />
                    
                    <Input
                      type="number"
                      value={item.unitCost}
                      onChange={(e) => handleUpdateItem(item.id, 'unitCost', e.target.value)}
                      min="0"
                      step="0.01"
                      size="sm"
                      style={{ textAlign: 'right' }}
                    />
                    
                    <Typography variant="body2" weight="500" style={{ textAlign: 'right' }}>
                      ${item.totalCost.toFixed(2)}
                    </Typography>
                  </ItemDetails>
                  
                  <ItemActions>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </Button>
                  </ItemActions>
                </ItemCard>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {formData.items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <Typography variant="body2">
                No items added yet. Add items to your order above.
              </Typography>
            </div>
          )}
        </ItemList>
      </ItemsSection>

      {/* Order Summary */}
      {formData.items.length > 0 && (
        <TotalSection>
          <div>
            <Typography variant="h3" weight="600">
              Order Summary
            </Typography>
            <Typography variant="body2" color="secondary">
              {totalItems} items from {formData.supplierName}
            </Typography>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <Typography variant="h2" weight="700" color="primary">
              ${totalAmount.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="secondary">
              Total Amount
            </Typography>
          </div>
        </TotalSection>
      )}

      {/* Form Actions */}
      <ButtonGroup>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || formData.items.length === 0}
        >
          {loading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
        </Button>
      </ButtonGroup>
    </FormContainer>
  );
}

export default OrderForm;