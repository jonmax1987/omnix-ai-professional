import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import Avatar from '../components/atoms/Avatar';
import Modal from '../components/atoms/Modal';
import ConfirmDialog from '../components/molecules/ConfirmDialog';
import DataTable from '../components/organisms/DataTable';
import ProductForm from '../components/organisms/ProductForm';
import CrossSellUpsellRecommendations from '../components/organisms/CrossSellUpsellRecommendations';
import BatchProductManager from '../components/organisms/BatchProductManager';
import { useI18n } from '../hooks/useI18n';
import { useModal } from '../contexts/ModalContext';
import useProductsStore from '../store/productsStore';
import { useRealtimeProducts } from '../hooks/useWebSocket';

const ProductsContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  min-height: 100vh;
  background: ${props => props.theme.colors.background.primary};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[4]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]};
  }
`;

const ProductsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[4]};
    margin-bottom: ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
    
    & > * {
      flex: 1;
    }
  }
`;

const StockStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const StockDot = styled.div.withConfig({
  shouldForwardProp: (prop) => !['level'].includes(prop),
})`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => getStockColor(props.level, props.theme)};
`;

const ProductImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const getStockColor = (level, theme) => {
  if (level === 'out') return theme.colors.red[500];
  if (level === 'low') return theme.colors.yellow[500];
  if (level === 'medium') return theme.colors.primary[500];
  return theme.colors.green[500];
};

const getStockLabel = (current, min = 0, max = 0, t) => {
  if (current === 0) return { level: 'out', label: t('products.stockLevel.out') };
  if (current <= min) return { level: 'low', label: t('products.stockLevel.low') };
  if (current <= max * 0.5) return { level: 'medium', label: t('products.stockLevel.medium') };
  return { level: 'high', label: t('products.stockLevel.high') };
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const Products = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { openModal, closeModal, isModalOpen } = useModal();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  
  // Products store
  const { 
    products, 
    loading, 
    error, 
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    setFilters,
    filters 
  } = useProductsStore();
  
  // Enable real-time product updates for all products
  useRealtimeProducts();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Transform backend products to match frontend format
  const transformedProducts = useMemo(() => {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku || `SKU-${product.id}`,
      category: product.category || 'Uncategorized',
      supplier: product.supplier || 'Unknown',
      price: product.price || 0,
      cost: product.cost || product.price * 0.7, // Estimate cost as 70% of price
      currentStock: product.quantity || 0,
      minStock: product.minThreshold || 5,
      maxStock: product.maxStock || 100,
      reorderPoint: product.reorderPoint || product.minThreshold || 10,
      location: product.location || 'Unknown',
      barcode: product.barcode || product.sku,
      status: product.status || 'active',
      lastUpdated: product.updatedAt || product.createdAt || new Date().toISOString(),
      image: product.image || null
    }));
  }, [products]);

  // Define table columns
  const columns = [
    {
      key: 'product',
      header: t('products.name'),
      width: '300px',
      render: (_, product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ProductImage>
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <Icon name="products" size={20} />
            )}
          </ProductImage>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" weight="medium" truncate>
              {product.name}
            </Typography>
            <Typography variant="caption" color="secondary" truncate>
              {t('products.sku')}: {product.sku}
            </Typography>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: t('products.category'),
      accessor: 'category',
      width: '120px'
    },
    {
      key: 'supplier',
      header: t('products.supplier'),
      accessor: 'supplier',
      width: '150px',
      truncate: true,
      maxWidth: '150px'
    },
    {
      key: 'price',
      header: t('products.price'),
      width: '100px',
      align: 'right',
      render: (_, product) => (
        <Typography variant="body2" weight="medium">
          {formatPrice(product.price)}
        </Typography>
      )
    },
    {
      key: 'stock',
      header: t('products.quantity'),
      width: '120px',
      render: (_, product) => {
        const stockInfo = getStockLabel(product.currentStock, product.minStock, product.maxStock, t);
        return (
          <StockStatus>
            <StockDot level={stockInfo.level} />
            <div>
              <Typography variant="body2" weight="medium">
                {product.currentStock}
              </Typography>
              <Typography variant="caption" color="secondary">
                {stockInfo.label}
              </Typography>
            </div>
          </StockStatus>
        );
      }
    },
    {
      key: 'location',
      header: t('products.location'),
      accessor: 'location',
      width: '100px'
    },
    {
      key: 'status',
      header: t('products.status'),
      width: '100px',
      render: (_, product) => (
        <Badge 
          variant={product.status === 'active' ? 'success' : 'secondary'} 
          size="sm"
        >
          {product.status}
        </Badge>
      )
    }
  ];

  // Define filters
  const filterOptions = [
    { key: 'category', label: t('products.filters.category') },
    { key: 'supplier', label: t('products.filters.supplier') },
    { key: 'location', label: t('products.filters.location') },
    { key: 'status', label: t('products.filters.status') }
  ];

  // Define table actions
  const actions = [
    {
      id: 'view',
      icon: 'eye',
      label: t('products.actions.viewDetails')
    },
    {
      id: 'edit',
      icon: 'edit',
      label: t('products.actions.editProduct')
    },
    {
      id: 'more',
      icon: 'menu',
      label: t('products.actions.moreActions'),
      dropdown: [
        { id: 'duplicate', icon: 'copy', label: t('products.actions.duplicate') },
        { id: 'export', icon: 'download', label: t('products.actions.export') },
        { id: 'archive', icon: 'archive', label: t('products.actions.archive') },
        { id: 'delete', icon: 'delete', label: t('products.actions.delete'), destructive: true }
      ]
    }
  ];

  // Define bulk actions
  const bulkActions = [
    {
      id: 'updateStatus',
      label: t('products.bulkActions.updateStatus'),
      icon: 'edit',
      variant: 'secondary'
    },
    {
      id: 'updateLocation',
      label: t('products.bulkActions.updateLocation'),
      icon: 'products',
      variant: 'secondary'
    },
    {
      id: 'export',
      label: t('products.bulkActions.exportSelected'),
      icon: 'download',
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: 'delete',
      variant: 'danger'
    }
  ];

  const handleSearch = (query) => {
    console.log('Search:', query);
  };

  const handleSort = (sortConfig) => {
    console.log('Sort:', sortConfig);
  };

  const handleRowClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handleAction = (actionId, product) => {
    switch (actionId) {
      case 'view':
        navigate(`/products/${product.id}`);
        break;
      case 'edit':
        setProductToEdit(product);
        openModal('productForm', {
          title: t('products.editProduct', 'Edit Product'),
          size: 'lg'
        });
        break;
      case 'duplicate':
        setProductToEdit({ ...product, id: null, sku: `${product.sku}-copy` });
        openModal('productForm', {
          title: t('products.duplicateProduct', 'Duplicate Product'),
          size: 'lg'
        });
        break;
      case 'delete':
        setProductToDelete(product);
        openModal('deleteConfirm', {
          title: t('products.deleteProduct', 'Delete Product'),
          size: 'sm'
        });
        break;
      default:
        break;
    }
  };

  const handleBulkAction = (actionId, productIds) => {
    switch (actionId) {
      case 'updateStatus':
        // Open status update dialog
        console.log('Update status for:', productIds);
        break;
      case 'updateLocation':
        // Open location update dialog
        console.log('Update location for:', productIds);
        break;
      case 'export':
        // Export selected products
        console.log('Export products:', productIds);
        break;
      case 'delete':
        setBulkDeleteIds(productIds);
        openModal('bulkDeleteConfirm', {
          title: t('products.deleteProducts', 'Delete Products'),
          size: 'sm'
        });
        break;
      default:
        break;
    }
  };

  const handleSelect = (selectedIds) => {
    setSelectedProducts(selectedIds);
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleImport = () => {
    // Scroll to batch manager section
    const batchSection = document.querySelector('[data-batch-manager]');
    if (batchSection) {
      batchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddProduct = () => {
    setProductToEdit(null);
    openModal('productForm', {
      title: t('products.addProduct', 'Add Product'),
      size: 'lg'
    });
  };

  const handleExport = () => {
    // Scroll to batch manager section and trigger export
    const batchSection = document.querySelector('[data-batch-manager]');
    if (batchSection) {
      batchSection.scrollIntoView({ behavior: 'smooth' });
      // TODO: Could trigger export action programmatically
    }
  };

  // ProductForm submit handler
  const handleProductSubmit = async (productData) => {
    try {
      if (productToEdit?.id) {
        // Update existing product
        await updateProduct(productToEdit.id, productData);
      } else {
        // Create new product
        await createProduct(productData);
      }
      closeModal('productForm');
      setProductToEdit(null);
      // Refresh products list
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      // TODO: Show error notification
    }
  };

  // Delete confirmation handlers
  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(productToDelete.id);
      closeModal('deleteConfirm');
      setProductToDelete(null);
      // Refresh products list
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      // TODO: Show error notification
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await deleteMultipleProducts(bulkDeleteIds);
      closeModal('bulkDeleteConfirm');
      setBulkDeleteIds([]);
      setSelectedProducts([]);
      // Refresh products list
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      // TODO: Show error notification
    }
  };

  // Recommendation handlers
  const handleRecommendationApply = async (recommendation) => {
    try {
      console.log('Applying recommendation:', recommendation);
      // TODO: Implement recommendation application logic
      // This could involve:
      // - Creating product bundles
      // - Setting up promotional displays
      // - Updating pricing strategies
      // - Creating marketing campaigns
      
      // For now, just show success message
      // TODO: Show success notification
      console.log(`Applied recommendation: ${recommendation.title}`);
    } catch (error) {
      console.error('Error applying recommendation:', error);
      // TODO: Show error notification
    }
  };

  const handleRecommendationDismiss = async (recommendation) => {
    try {
      console.log('Dismissing recommendation:', recommendation);
      // TODO: Implement recommendation dismissal logic
      // This could involve storing user preferences or feedback
      
      console.log(`Dismissed recommendation: ${recommendation.title}`);
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      // TODO: Show error notification
    }
  };

  const handleRecommendationDetails = (recommendation) => {
    console.log('Viewing recommendation details:', recommendation);
    // TODO: Open recommendation details modal or navigate to details page
    // For now, just log the recommendation
  };

  // Batch operation handlers
  const handleImportComplete = async (results) => {
    try {
      console.log('Import completed:', results);
      // TODO: Show success/error notification based on results
      
      if (results.successful > 0) {
        console.log(`Successfully imported ${results.successful} products`);
        // TODO: Show success notification
      }
      
      if (results.failed > 0) {
        console.log(`Failed to import ${results.failed} products`);
        // TODO: Show warning notification with details
      }
      
      // Refresh products list to show newly imported items
      await fetchProducts();
    } catch (error) {
      console.error('Error handling import completion:', error);
      // TODO: Show error notification
    }
  };

  const handleExportComplete = (exportInfo) => {
    try {
      console.log('Export completed:', exportInfo);
      // TODO: Show success notification
      console.log(`Successfully exported ${exportInfo.recordCount} products to ${exportInfo.filename}`);
    } catch (error) {
      console.error('Error handling export completion:', error);
      // TODO: Show error notification
    }
  };

  return (
    <ProductsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <ProductsHeader>
        <HeaderLeft>
          <Typography variant="h3" weight="bold" color="primary">
            {t('products.title')}
          </Typography>
          <Typography variant="body1" color="secondary">
            {t('products.description')}
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            {loading ? 'Loading...' : error ? 'Error loading products' : `${transformedProducts.length} total products`}
          </Typography>
          
          <QuickActions>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleImport}
            >
              <Icon name="upload" size={16} />
              Import
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
            >
              <Icon name="download" size={16} />
              {t('common.export')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddProduct}
            >
              <Icon name="plus" size={16} />
              {t('products.addProduct')}
            </Button>
          </QuickActions>
        </HeaderRight>
      </ProductsHeader>

      <DataTable
        title={t('products.productInventory')}
        description={t('products.description')}
        data={transformedProducts}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder={t('products.searchPlaceholder')}
        sortable
        selectable
        filterable
        filters={filterOptions}
        actions={actions}
        bulkActions={bulkActions}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 25, 50, 100]}
        emptyStateTitle={t('products.emptyState')}
        emptyStateDescription={t('products.emptyStateDescription')}
        emptyStateIcon="products"
        onSearch={handleSearch}
        onSort={handleSort}
        onSelect={handleSelect}
        onRowClick={handleRowClick}
        onAction={handleAction}
        onBulkAction={handleBulkAction}
        exportable
        exportFilename="products-inventory"
        exportFormats={['csv', 'pdf']}
      />

      {/* Batch Product Manager */}
      <div style={{ marginTop: '48px' }} data-batch-manager>
        <BatchProductManager
          onImportComplete={handleImportComplete}
          onExportComplete={handleExportComplete}
        />
      </div>

      {/* Cross-sell & Upsell Recommendations */}
      <div style={{ marginTop: '48px' }}>
        <CrossSellUpsellRecommendations
          onRecommendationApply={handleRecommendationApply}
          onRecommendationDismiss={handleRecommendationDismiss}
          onViewDetails={handleRecommendationDetails}
          autoRefresh={true}
          refreshInterval={5 * 60 * 1000}
        />
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen('productForm')}
        onClose={() => closeModal('productForm')}
        title={productToEdit?.id ? t('products.editProduct', 'Edit Product') : t('products.addProduct', 'Add Product')}
        size="lg"
      >
        <ProductForm
          initialData={productToEdit || {}}
          mode={productToEdit?.id ? 'edit' : 'create'}
          onSubmit={handleProductSubmit}
          onCancel={() => closeModal('productForm')}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isModalOpen('deleteConfirm')}
        onClose={() => closeModal('deleteConfirm')}
        onConfirm={handleDeleteConfirm}
        title={t('products.deleteProduct', 'Delete Product')}
        description={t('products.deleteConfirmation', `Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`)}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="error"
        isLoading={loading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isModalOpen('bulkDeleteConfirm')}
        onClose={() => closeModal('bulkDeleteConfirm')}
        onConfirm={handleBulkDeleteConfirm}
        title={t('products.deleteProducts', 'Delete Products')}
        description={t('products.bulkDeleteConfirmation', `Are you sure you want to delete ${bulkDeleteIds.length} products? This action cannot be undone.`)}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="error"
        isLoading={loading}
      />
    </ProductsContainer>
  );
};

export default Products;