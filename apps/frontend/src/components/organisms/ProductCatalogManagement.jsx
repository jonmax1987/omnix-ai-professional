import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import Modal from '../atoms/Modal';
import ProductForm from './ProductForm';
import inventoryService from '../../services/inventoryService';
import { useI18n } from '../../hooks/useI18n';

const CatalogContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const SearchAndFilters = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const SearchInput = styled.input`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.base};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  transition: border-color ${props => props.theme.animation.duration.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const FilterSelect = styled.select`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.base};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.secondary};
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[2]};
`;

const ViewButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: none;
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast};
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.background.elevated};
  }
`;

const ProductGrid = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'viewMode'
})`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
  
  ${props => props.viewMode === 'grid' && css`
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  `}
  
  ${props => props.viewMode === 'list' && css`
    grid-template-columns: 1fr;
  `}
  
  ${props => props.viewMode === 'table' && css`
    display: block;
  `}
`;

const ProductCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['status', 'viewMode'].includes(prop)
})`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
  overflow: hidden;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
    border-color: ${props => props.theme.colors.border.strong};
  }
  
  ${props => props.viewMode === 'list' && css`
    display: grid;
    grid-template-columns: 100px 1fr auto;
    gap: ${props => props.theme.spacing[4]};
    align-items: center;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => getStatusGradient(props.status, props.theme)};
  }
`;

const ProductImage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'viewMode'
})`
  width: 100px;
  height: 100px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing[3]};
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  ${props => props.viewMode === 'list' && css`
    margin-bottom: 0;
    flex-shrink: 0;
  `}
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing[2]};
  gap: ${props => props.theme.spacing[2]};
`;

const ProductTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
  line-height: 1.3;
`;

const ProductSKU = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.tertiary};
  font-family: monospace;
`;

const ProductDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
  margin-bottom: ${props => props.theme.spacing[3]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductMetrics = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'viewMode'
})`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
  
  ${props => props.viewMode === 'list' && css`
    grid-template-columns: repeat(4, 1fr);
  `}
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'trend'
})`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getMetricColor(props.trend, props.theme)};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductActions = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'viewMode'
})`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[3]};
  
  ${props => props.viewMode === 'list' && css`
    margin-top: 0;
    flex-direction: column;
  `}
`;

const ProductTable = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 100px 2fr 1fr 1fr 1fr 1fr 1fr auto;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TableRow = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  display: grid;
  grid-template-columns: 100px 2fr 1fr 1fr 1fr 1fr 1fr auto;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  transition: background-color ${props => props.theme.animation.duration.fast};
  align-items: center;
  border-left: 4px solid ${props => getStatusColor(props.status, props.theme)};
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled(Badge).withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  ${props => {
    const variants = {
      in_stock: 'success',
      low_stock: 'warning',
      out_of_stock: 'error',
      discontinued: 'secondary'
    };
    return `variant: ${variants[props.status] || 'secondary'};`;
  }}
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing[4]};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
`;

const PaginationInfo = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  align-items: center;
`;

// Utility functions
const getStatusColor = (status, theme = {}) => {
  const colors = {
    in_stock: theme.colors?.green?.[500] || '#10B981',
    low_stock: theme.colors?.yellow?.[500] || '#F59E0B',
    out_of_stock: theme.colors?.red?.[500] || '#EF4444',
    discontinued: theme.colors?.gray?.[400] || '#6B7280'
  };
  return colors[status] || colors.in_stock;
};

const getStatusGradient = (status, theme = {}) => {
  const gradients = {
    in_stock: `linear-gradient(90deg, ${theme.colors?.green?.[500] || '#10B981'}, ${theme.colors?.green?.[400] || '#34D399'})`,
    low_stock: `linear-gradient(90deg, ${theme.colors?.yellow?.[500] || '#F59E0B'}, ${theme.colors?.yellow?.[400] || '#FBBF24'})`,
    out_of_stock: `linear-gradient(90deg, ${theme.colors?.red?.[500] || '#EF4444'}, ${theme.colors?.red?.[400] || '#F87171'})`,
    discontinued: `linear-gradient(90deg, ${theme.colors?.gray?.[500] || '#6B7280'}, ${theme.colors?.gray?.[400] || '#9CA3AF'})`
  };
  return gradients[status] || gradients.in_stock;
};

const getMetricColor = (trend, theme = {}) => {
  if (trend > 0) return theme.colors?.green?.[600] || '#16A34A';
  if (trend < 0) return theme.colors?.red?.[600] || '#DC2626';
  return theme.colors?.text?.primary || '#374151';
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const ProductCatalogManagement = ({
  onProductCreate,
  onProductEdit,
  onProductDelete,
  onProductView,
  onBulkAction,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);
  
  // Product form modal state
  const [showProductForm, setShowProductForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Mock product data
  const mockProducts = [
    {
      id: 'prod-001',
      sku: 'ELEC-001',
      name: 'iPhone 15 Pro Max',
      description: 'Latest flagship smartphone with advanced camera system and titanium design',
      category: 'Electronics',
      price: 1199.99,
      cost: 850.00,
      stock: 45,
      reorderPoint: 10,
      supplier: 'Apple Inc.',
      status: 'in_stock',
      image: null,
      lastOrderDate: '2025-01-15',
      salesVelocity: 8.5,
      profitMargin: 29.2,
      barcode: '123456789012',
      weight: 221,
      dimensions: '6.7 × 3.0 × 0.33 in'
    },
    {
      id: 'prod-002',
      sku: 'CLTH-001',
      name: 'Premium Cotton T-Shirt',
      description: 'High-quality 100% cotton t-shirt in various colors and sizes',
      category: 'Clothing',
      price: 29.99,
      cost: 12.50,
      stock: 8,
      reorderPoint: 20,
      supplier: 'Fashion Co.',
      status: 'low_stock',
      image: null,
      lastOrderDate: '2025-01-10',
      salesVelocity: 15.2,
      profitMargin: 58.3,
      barcode: '234567890123',
      weight: 180,
      dimensions: 'S, M, L, XL'
    },
    {
      id: 'prod-003',
      sku: 'HOME-001',
      name: 'Smart Home Hub',
      description: 'Central control hub for all smart home devices with voice control',
      category: 'Home & Garden',
      price: 149.99,
      cost: 89.00,
      stock: 0,
      reorderPoint: 5,
      supplier: 'Smart Tech Ltd.',
      status: 'out_of_stock',
      image: null,
      lastOrderDate: '2025-01-08',
      salesVelocity: 4.8,
      profitMargin: 40.7,
      barcode: '345678901234',
      weight: 450,
      dimensions: '5.5 × 5.5 × 1.2 in'
    },
    {
      id: 'prod-004',
      sku: 'BOOK-001',
      name: 'The Art of Programming',
      description: 'Comprehensive guide to modern programming techniques and best practices',
      category: 'Books',
      price: 49.99,
      cost: 20.00,
      stock: 156,
      reorderPoint: 25,
      supplier: 'Tech Books Publisher',
      status: 'in_stock',
      image: null,
      lastOrderDate: '2025-01-12',
      salesVelocity: 3.2,
      profitMargin: 60.0,
      barcode: '456789012345',
      weight: 680,
      dimensions: '9.2 × 7.4 × 1.8 in'
    },
    {
      id: 'prod-005',
      sku: 'SPORT-001',
      name: 'Professional Tennis Racket',
      description: 'High-performance carbon fiber tennis racket for professional players',
      category: 'Sports',
      price: 299.99,
      cost: 180.00,
      stock: 23,
      reorderPoint: 8,
      supplier: 'Sports Equipment Pro',
      status: 'in_stock',
      image: null,
      lastOrderDate: '2025-01-14',
      salesVelocity: 2.1,
      profitMargin: 40.0,
      barcode: '567890123456',
      weight: 310,
      dimensions: '27 × 11 × 1 in'
    },
    {
      id: 'prod-006',
      sku: 'DISC-001',
      name: 'Vintage Vinyl Collection',
      description: 'Classic rock vinyl records from the 1970s - discontinued item',
      category: 'Music',
      price: 89.99,
      cost: 45.00,
      stock: 3,
      reorderPoint: 0,
      supplier: 'Vintage Music Store',
      status: 'discontinued',
      image: null,
      lastOrderDate: '2024-12-20',
      salesVelocity: 0.8,
      profitMargin: 50.0,
      barcode: '678901234567',
      weight: 180,
      dimensions: '12.2 × 12.2 × 0.3 in'
    }
  ];

  // Categories for filtering
  const categories = ['all', 'Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Music'];
  const statuses = ['all', 'in_stock', 'low_stock', 'out_of_stock', 'discontinued'];

  // Fetch products data
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProducts(mockProducts);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // Initialize data
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    onBulkAction?.(action, selectedProductsList);
    setSelectedProducts(new Set());
  };

  // Product form handlers
  const handleCreateProduct = () => {
    setFormMode('create');
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setFormMode('edit');
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleProductFormSubmit = async (productData) => {
    setFormLoading(true);
    try {
      if (formMode === 'create') {
        const newProduct = await inventoryService.createProduct(productData);
        setProducts(prev => [newProduct, ...prev]);
        onProductCreate?.(newProduct);
      } else {
        const updatedProduct = await inventoryService.updateProduct(editingProduct.id, productData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
        onProductEdit?.(updatedProduct);
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Product form error:', error);
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleProductFormCancel = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setFormLoading(false);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      setFormLoading(true);
      try {
        await inventoryService.deleteProduct(product.id);
        setProducts(prev => prev.filter(p => p.id !== product.id));
        onProductDelete?.(product);
        setShowProductForm(false);
        setEditingProduct(null);
      } catch (error) {
        console.error('Delete product error:', error);
        setError(error.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  // Render product in grid/list mode
  const renderProduct = (product) => (
    <ProductCard
      key={product.id}
      status={product.status}
      viewMode={viewMode}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
    >
      <input
        type="checkbox"
        checked={selectedProducts.has(product.id)}
        onChange={() => toggleProductSelection(product.id)}
        style={{ position: 'absolute', top: '1rem', right: '1rem' }}
      />
      
      <ProductImage viewMode={viewMode}>
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <Icon name="package" size={40} color="secondary" />
        )}
      </ProductImage>
      
      <ProductInfo>
        <ProductHeader>
          <div>
            <ProductTitle>{product.name}</ProductTitle>
            <ProductSKU>SKU: {product.sku}</ProductSKU>
          </div>
          <StatusBadge status={product.status} size="sm">
            {product.status.replace('_', ' ')}
          </StatusBadge>
        </ProductHeader>
        
        {viewMode === 'grid' && (
          <ProductDescription>{product.description}</ProductDescription>
        )}
        
        <ProductMetrics viewMode={viewMode}>
          <MetricItem>
            <MetricValue>{formatPrice(product.price)}</MetricValue>
            <MetricLabel>Price</MetricLabel>
          </MetricItem>
          <MetricItem>
            <MetricValue trend={product.stock > product.reorderPoint ? 1 : -1}>
              {product.stock}
            </MetricValue>
            <MetricLabel>Stock</MetricLabel>
          </MetricItem>
          {viewMode === 'list' && (
            <>
              <MetricItem>
                <MetricValue trend={1}>{product.profitMargin}%</MetricValue>
                <MetricLabel>Margin</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue trend={product.salesVelocity > 5 ? 1 : -1}>
                  {product.salesVelocity}
                </MetricValue>
                <MetricLabel>Velocity</MetricLabel>
              </MetricItem>
            </>
          )}
        </ProductMetrics>
        
        <ProductActions viewMode={viewMode}>
          <Button variant="ghost" size="sm" onClick={() => onProductView?.(product)}>
            <Icon name="eye" size={14} />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
            <Icon name="edit" size={14} />
            Edit
          </Button>
          {viewMode === 'grid' && (
            <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product)}>
              <Icon name="trash" size={14} />
            </Button>
          )}
        </ProductActions>
      </ProductInfo>
    </ProductCard>
  );

  // Render table row
  const renderTableRow = (product) => (
    <TableRow
      key={product.id}
      status={product.status}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          checked={selectedProducts.has(product.id)}
          onChange={() => toggleProductSelection(product.id)}
        />
        <ProductImage viewMode="table" style={{ width: '60px', height: '60px', margin: 0 }}>
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <Icon name="package" size={24} color="secondary" />
          )}
        </ProductImage>
      </div>
      
      <div>
        <div style={{ fontWeight: 600 }}>{product.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {product.sku}</div>
      </div>
      
      <div>{product.category}</div>
      <div>{formatPrice(product.price)}</div>
      <div style={{ color: getMetricColor(product.stock > product.reorderPoint ? 1 : -1) }}>
        {product.stock}
      </div>
      <div>{product.profitMargin}%</div>
      <div>
        <StatusBadge status={product.status} size="sm">
          {product.status.replace('_', ' ')}
        </StatusBadge>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="ghost" size="xs" onClick={() => onProductView?.(product)}>
          <Icon name="eye" size={12} />
        </Button>
        <Button variant="ghost" size="xs" onClick={() => handleEditProduct(product)}>
          <Icon name="edit" size={12} />
        </Button>
        <Button variant="ghost" size="xs" onClick={() => handleDeleteProduct(product)}>
          <Icon name="trash" size={12} />
        </Button>
      </div>
    </TableRow>
  );

  // Loading state
  if (loading) {
    return (
      <CatalogContainer className={className} {...props}>
        <LoadingState>
          <Icon name="loader" size={48} className="animate-spin" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Loading product catalog...
          </Typography>
        </LoadingState>
      </CatalogContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <CatalogContainer className={className} {...props}>
        <EmptyState>
          <Icon name="alert-triangle" size={48} color="error" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Failed to load products
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '1rem' }}>
            {error}
          </Typography>
          <Button onClick={fetchProducts}>
            <Icon name="refresh" size={16} />
            Try Again
          </Button>
        </EmptyState>
      </CatalogContainer>
    );
  }

  return (
    <CatalogContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <HeaderSection>
        <HeaderContent>
          <Icon name="package" size={32} />
          <div>
            <Typography variant="h4" weight="bold">
              Product Catalog Management
            </Typography>
            <Typography variant="body2" color="secondary">
              {products.length} products • {selectedProducts.size} selected
            </Typography>
          </div>
        </HeaderContent>
        
        <HeaderActions>
          {selectedProducts.size > 0 && (
            <>
              <Button variant="outline" onClick={() => handleBulkAction('export')}>
                <Icon name="download" size={16} />
                Export ({selectedProducts.size})
              </Button>
              <Button variant="ghost" onClick={() => handleBulkAction('delete')}>
                <Icon name="trash" size={16} />
                Delete ({selectedProducts.size})
              </Button>
            </>
          )}
          <Button variant="primary" onClick={handleCreateProduct}>
            <Icon name="plus" size={16} />
            Add Product
          </Button>
        </HeaderActions>
      </HeaderSection>

      <SearchAndFilters>
        <SearchInput
          type="text"
          placeholder="Search products by name, SKU, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </FilterSelect>
        
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : status.replace('_', ' ')}
            </option>
          ))}
        </FilterSelect>
        
        <ViewToggle>
          <ViewButton
            active={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
          >
            <Icon name="grid" size={16} />
          </ViewButton>
          <ViewButton
            active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            <Icon name="list" size={16} />
          </ViewButton>
          <ViewButton
            active={viewMode === 'table'}
            onClick={() => setViewMode('table')}
          >
            <Icon name="table" size={16} />
          </ViewButton>
        </ViewToggle>
      </SearchAndFilters>

      {filteredAndSortedProducts.length === 0 ? (
        <EmptyState>
          <Icon name="search" size={48} />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            No products found
          </Typography>
          <Typography variant="body2" color="secondary">
            Try adjusting your search criteria or filters
          </Typography>
        </EmptyState>
      ) : viewMode === 'table' ? (
        <ProductTable>
          <TableHeader>
            <div>
              <input
                type="checkbox"
                checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
                onChange={toggleSelectAll}
              />
            </div>
            <div>Product</div>
            <div>Category</div>
            <div>Price</div>
            <div>Stock</div>
            <div>Margin</div>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>
          <AnimatePresence>
            {paginatedProducts.map(renderTableRow)}
          </AnimatePresence>
        </ProductTable>
      ) : (
        <ProductGrid viewMode={viewMode}>
          <AnimatePresence>
            {paginatedProducts.map(renderProduct)}
          </AnimatePresence>
        </ProductGrid>
      )}

      <PaginationControls>
        <PaginationInfo>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
        </PaginationInfo>
        
        <PaginationButtons>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            <Icon name="chevrons-left" size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <Icon name="chevron-left" size={16} />
          </Button>
          
          <Typography variant="body2" color="secondary" style={{ margin: '0 1rem' }}>
            Page {currentPage} of {totalPages}
          </Typography>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            <Icon name="chevron-right" size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            <Icon name="chevrons-right" size={16} />
          </Button>
        </PaginationButtons>
      </PaginationControls>
      
      {/* Product Form Modal */}
      <Modal
        isOpen={showProductForm}
        onClose={handleProductFormCancel}
        title={formMode === 'create' ? 'Add New Product' : 'Edit Product'}
        size="lg"
        preventCloseOnBackdropClick={formLoading}
      >
        <ProductForm
          mode={formMode}
          initialData={editingProduct || {}}
          onSubmit={handleProductFormSubmit}
          onCancel={handleProductFormCancel}
          onDelete={formMode === 'edit' ? () => handleDeleteProduct(editingProduct) : undefined}
          loading={formLoading}
        />
      </Modal>
    </CatalogContainer>
  );
};

export default ProductCatalogManagement;