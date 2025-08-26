import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useOrdersStore from '../store/ordersStore';
import { useModal } from '../contexts/ModalContext';

// Components
import DataTable from '../components/organisms/DataTable';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import Typography from '../components/atoms/Typography';
import Badge from '../components/atoms/Badge';
import SearchBar from '../components/molecules/SearchBar';
import BulkOperations from '../components/molecules/BulkOperations';
import FilterDropdown from '../components/molecules/FilterDropdown';
import ViewToggle from '../components/molecules/ViewToggle';
import Modal from '../components/atoms/Modal';
import ConfirmDialog from '../components/molecules/ConfirmDialog';
import OrderForm from '../components/organisms/OrderForm';
import SEOHead from '../components/atoms/SEOHead';

// Styled components
const OrdersContainer = styled.div`
  padding: 2rem;
  max-width: 100%;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1rem;
  }
`;

const OrdersHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const OrdersTitle = styled.div`
  flex: 1;
  min-width: 200px;
`;

const OrdersActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;
`;

const StatusBadge = styled(Badge)`
  text-transform: capitalize;
`;

function Orders() {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, order: null });
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();

  const {
    orders,
    statistics,
    filters,
    pagination,
    sort,
    selectedOrders,
    view,
    loading,
    errors,
    fetchOrders,
    fetchStatistics,
    createOrder,
    updateOrder,
    cancelOrder,
    fulfillOrder,
    bulkDeleteOrders,
    setFilters,
    clearFilters,
    setSearch,
    setPage,
    setLimit,
    toggleSort,
    toggleOrderSelection,
    selectAllOrders,
    deselectAllOrders,
    setView,
    getSelectedOrdersCount,
    getSelectedOrders,
    hasActiveFilters
  } = useOrdersStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, [filters, pagination.page, pagination.limit, sort]);

  // Handle search
  const handleSearch = (query) => {
    setSearch(query);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleLimitChange = (limit) => {
    setLimit(limit);
  };

  // Handle sorting
  const handleSort = (field) => {
    toggleSort(field);
  };

  // Handle order actions
  const handleAddOrder = () => {
    setEditingOrder(null);
    setIsOrderFormOpen(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setIsOrderFormOpen(true);
  };

  const handleViewOrder = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleCancelOrder = async (order) => {
    try {
      await openModal({
        title: 'Cancel Order',
        content: (
          <div>
            <Typography variant="body1" style={{ marginBottom: '1rem' }}>
              Are you sure you want to cancel order #{order.id}?
            </Typography>
            <Input
              placeholder="Reason for cancellation (optional)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmCancel(order, e.target.value);
                }
              }}
            />
          </div>
        ),
        confirmText: 'Cancel Order',
        cancelText: 'Keep Order',
        variant: 'danger',
        onConfirm: (reason) => handleConfirmCancel(order, reason)
      });
    } catch (error) {
      console.error('Order cancellation cancelled:', error);
    }
  };

  const handleConfirmCancel = async (order, reason) => {
    try {
      await cancelOrder(order.id, reason);
      closeModal();
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const handleFulfillOrder = async (order) => {
    try {
      await fulfillOrder(order.id, {
        fulfilledAt: new Date().toISOString(),
        notes: 'Order fulfilled successfully'
      });
    } catch (error) {
      console.error('Failed to fulfill order:', error);
    }
  };

  const handleDeleteOrder = (order) => {
    setDeleteConfirm({ open: true, order });
  };

  const confirmDeleteOrder = async () => {
    try {
      await cancelOrder(deleteConfirm.order.id, 'Order deleted');
      setDeleteConfirm({ open: false, order: null });
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  // Handle bulk operations
  const handleBulkAction = async (action) => {
    const selected = getSelectedOrders();
    
    try {
      switch (action) {
        case 'cancel':
          await Promise.all(selected.map(order => cancelOrder(order.id, 'Bulk cancellation')));
          break;
        case 'fulfill':
          await Promise.all(selected.map(order => fulfillOrder(order.id, {
            fulfilledAt: new Date().toISOString(),
            notes: 'Bulk fulfillment'
          })));
          break;
        case 'delete':
          await bulkDeleteOrders(selected.map(order => order.id));
          break;
        default:
          console.log('Unknown bulk action:', action);
      }
      deselectAllOrders();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  // Handle form submission
  const handleOrderSubmit = async (orderData) => {
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, orderData);
      } else {
        await createOrder(orderData);
      }
      setIsOrderFormOpen(false);
      setEditingOrder(null);
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  // Table configuration
  const columns = [
    {
      key: 'id',
      title: 'Order ID',
      sortable: true,
      render: (order) => (
        <Typography variant="body2" weight="500" color="primary">
          #{order.id}
        </Typography>
      )
    },
    {
      key: 'supplier',
      title: 'Supplier',
      sortable: true,
      render: (order) => (
        <Typography variant="body2">
          {order.supplier?.name || 'Unknown Supplier'}
        </Typography>
      )
    },
    {
      key: 'items',
      title: 'Items',
      render: (order) => (
        <Typography variant="body2">
          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
        </Typography>
      )
    },
    {
      key: 'totalAmount',
      title: 'Total Amount',
      sortable: true,
      render: (order) => (
        <Typography variant="body2" weight="500">
          ${order.totalAmount?.toFixed(2) || '0.00'}
        </Typography>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (order) => {
        const statusColors = {
          pending: 'warning',
          processing: 'info',
          fulfilled: 'success',
          cancelled: 'error'
        };
        return (
          <StatusBadge variant={statusColors[order.status] || 'default'}>
            {order.status || 'pending'}
          </StatusBadge>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (order) => (
        <Typography variant="body2">
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
        </Typography>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 200,
      render: (order) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewOrder(order)}
          >
            View
          </Button>
          {order.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditOrder(order)}
            >
              Edit
            </Button>
          )}
          {order.status === 'pending' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleFulfillOrder(order)}
            >
              Fulfill
            </Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'fulfilled' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleCancelOrder(order)}
            >
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  const bulkActions = [
    { key: 'cancel', label: 'Cancel Selected', icon: '🚫' },
    { key: 'fulfill', label: 'Fulfill Selected', icon: '✅' },
    { key: 'delete', label: 'Delete Selected', icon: '🗑️' }
  ];

  const filterOptions = {
    status: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'fulfilled', label: 'Fulfilled' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    priority: [
      { value: 'all', label: 'All Priorities' },
      { value: 'high', label: 'High Priority' },
      { value: 'medium', label: 'Medium Priority' },
      { value: 'low', label: 'Low Priority' }
    ]
  };

  return (
    <>
      <SEOHead 
        title="Orders - OMNIX AI"
        description="Manage purchase orders and supplier relationships"
      />
      
      <OrdersContainer>
        <OrdersHeader>
          <OrdersTitle>
            <Typography variant="h1" weight="600">
              Orders
            </Typography>
            <Typography variant="body2" color="secondary">
              Manage purchase orders and supplier relationships
            </Typography>
          </OrdersTitle>
          
          <OrdersActions>
            <ViewToggle
              view={view}
              onViewChange={setView}
              options={[
                { key: 'list', label: 'List', icon: '📋' },
                { key: 'grid', label: 'Grid', icon: '⊞' },
                { key: 'kanban', label: 'Kanban', icon: '📊' }
              ]}
            />
            
            <Button
              variant="primary"
              onClick={handleAddOrder}
              disabled={loading.create}
            >
              + New Order
            </Button>
          </OrdersActions>
        </OrdersHeader>

        {/* Statistics */}
        {statistics && (
          <StatsBar>
            <StatCard>
              <Typography variant="h2" weight="600" color="primary">
                {statistics.totalOrders || 0}
              </Typography>
              <Typography variant="body2" color="secondary">
                Total Orders
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="h2" weight="600" color="success">
                ${(statistics.totalValue || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="secondary">
                Total Value
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="h2" weight="600" color="warning">
                {statistics.pendingOrders || 0}
              </Typography>
              <Typography variant="body2" color="secondary">
                Pending Orders
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="h2" weight="600" color="info">
                {statistics.averageOrderValue || 0}
              </Typography>
              <Typography variant="body2" color="secondary">
                Avg. Order Value
              </Typography>
            </StatCard>
          </StatsBar>
        )}

        {/* Filters and Search */}
        <FilterBar>
          <SearchBar
            placeholder="Search orders by ID, supplier, or items..."
            value={filters.search}
            onSearch={handleSearch}
            style={{ flex: 1, minWidth: '300px' }}
          />
          
          <FilterGroup>
            <FilterDropdown
              label="Status"
              value={filters.status}
              options={filterOptions.status}
              onChange={(value) => handleFilterChange('status', value)}
            />
            
            <FilterDropdown
              label="Priority"
              value={filters.priority}
              options={filterOptions.priority}
              onChange={(value) => handleFilterChange('priority', value)}
            />
            
            <Input
              type="text"
              placeholder="Supplier"
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
              style={{ width: '150px' }}
            />
            
            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </FilterGroup>
        </FilterBar>

        {/* Bulk Operations */}
        <AnimatePresence>
          {getSelectedOrdersCount() > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: '1rem' }}
            >
              <BulkOperations
                selectedCount={getSelectedOrdersCount()}
                actions={bulkActions}
                onAction={handleBulkAction}
                onDeselectAll={deselectAllOrders}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Table */}
        <DataTable
          data={orders}
          columns={columns}
          loading={loading.orders}
          error={errors.orders}
          selectedItems={selectedOrders}
          onSelectItem={toggleOrderSelection}
          onSelectAll={selectAllOrders}
          onDeselectAll={deselectAllOrders}
          onSort={handleSort}
          sortField={sort.field}
          sortDirection={sort.direction}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange
          }}
          emptyMessage="No orders found. Create your first order to get started."
        />

        {/* Order Form Modal */}
        <Modal
          isOpen={isOrderFormOpen}
          onClose={() => {
            setIsOrderFormOpen(false);
            setEditingOrder(null);
          }}
          title={editingOrder ? 'Edit Order' : 'Create Order'}
          size="lg"
        >
          <OrderForm
            order={editingOrder}
            onSubmit={handleOrderSubmit}
            onCancel={() => {
              setIsOrderFormOpen(false);
              setEditingOrder(null);
            }}
            loading={loading.create || loading.update}
          />
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirm.open}
          title="Delete Order"
          message={`Are you sure you want to delete order #${deleteConfirm.order?.id}? This action cannot be undone.`}
          confirmText="Delete Order"
          cancelText="Cancel"
          variant="danger"
          onConfirm={confirmDeleteOrder}
          onCancel={() => setDeleteConfirm({ open: false, order: null })}
        />
      </OrdersContainer>
    </>
  );
}

export default Orders;