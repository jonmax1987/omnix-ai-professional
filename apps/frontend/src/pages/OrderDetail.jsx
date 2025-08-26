import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import useOrdersStore from '../store/ordersStore';
import { useModal } from '../contexts/ModalContext';

// Components
import Button from '../components/atoms/Button';
import Typography from '../components/atoms/Typography';
import Badge from '../components/atoms/Badge';
import Spinner from '../components/atoms/Spinner';
import Modal from '../components/atoms/Modal';
import OrderForm from '../components/organisms/OrderForm';
import SEOHead from '../components/atoms/SEOHead';

// Styled components
const DetailContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1rem;
  }
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 300px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const DetailCard = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: 2rem;
`;

const DetailSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemsTable = styled.div`
  overflow-x: auto;
`;

const ItemsHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 0.5rem;
  align-items: center;
`;

const StatusBadge = styled(Badge)`
  text-transform: capitalize;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-left: 3px solid ${props => props.active ? props.theme.colors.primary[500] : props.theme.colors.border.light};
  background: ${props => props.active ? props.theme.colors.primary[50] : 'transparent'};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const TimelineIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.active ? props.theme.colors.primary[500] : props.theme.colors.background.secondary};
  border: 2px solid ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const BackButton = styled(Button)`
  margin-bottom: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  background: ${props => props.theme.colors.status.error.background};
  border: 1px solid ${props => props.theme.colors.status.error.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.status.error.text};
`;

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { openModal, closeModal } = useModal();

  const {
    order,
    orderHistory,
    loading,
    errors,
    fetchOrder,
    fetchOrderHistory,
    updateOrder,
    cancelOrder,
    fulfillOrder
  } = useOrdersStore();

  useEffect(() => {
    if (id) {
      fetchOrder(id);
      fetchOrderHistory(id);
    }
  }, [id]);

  const handleBack = () => {
    navigate('/orders');
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCancel = async () => {
    try {
      await openModal({
        title: 'Cancel Order',
        content: (
          <div>
            <Typography variant="body1" style={{ marginBottom: '1rem' }}>
              Are you sure you want to cancel this order?
            </Typography>
            <input
              type="text"
              placeholder="Reason for cancellation (optional)"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
        ),
        confirmText: 'Cancel Order',
        cancelText: 'Keep Order',
        variant: 'danger',
        onConfirm: async (reason) => {
          await cancelOrder(id, reason || 'Order cancelled');
          closeModal();
        }
      });
    } catch (error) {
      console.error('Order cancellation cancelled:', error);
    }
  };

  const handleFulfill = async () => {
    try {
      await fulfillOrder(id, {
        fulfilledAt: new Date().toISOString(),
        notes: 'Order fulfilled successfully'
      });
    } catch (error) {
      console.error('Failed to fulfill order:', error);
    }
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      await updateOrder(id, orderData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  if (loading.order) {
    return (
      <DetailContainer>
        <LoadingContainer>
          <Spinner size="lg" />
        </LoadingContainer>
      </DetailContainer>
    );
  }

  if (errors.order) {
    return (
      <DetailContainer>
        <ErrorContainer>
          <Typography variant="h3" style={{ marginBottom: '1rem' }}>
            Failed to load order
          </Typography>
          <Typography variant="body1" style={{ marginBottom: '1rem' }}>
            {errors.order}
          </Typography>
          <Button variant="primary" onClick={() => fetchOrder(id)}>
            Retry
          </Button>
        </ErrorContainer>
      </DetailContainer>
    );
  }

  if (!order) {
    return (
      <DetailContainer>
        <ErrorContainer>
          <Typography variant="h3" style={{ marginBottom: '1rem' }}>
            Order not found
          </Typography>
          <Typography variant="body1" style={{ marginBottom: '1rem' }}>
            The order you're looking for doesn't exist or has been removed.
          </Typography>
          <Button variant="primary" onClick={handleBack}>
            Back to Orders
          </Button>
        </ErrorContainer>
      </DetailContainer>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      fulfilled: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getTimelineItems = () => {
    const baseItems = [
      {
        id: 'created',
        title: 'Order Created',
        description: 'Order was created and is pending processing',
        icon: '📝',
        active: true,
        timestamp: order.createdAt
      },
      {
        id: 'processing',
        title: 'Processing',
        description: 'Order is being processed by supplier',
        icon: '⏳',
        active: order.status === 'processing' || order.status === 'fulfilled',
        timestamp: order.processedAt
      },
      {
        id: 'fulfilled',
        title: order.status === 'cancelled' ? 'Cancelled' : 'Fulfilled',
        description: order.status === 'cancelled' ? 'Order was cancelled' : 'Order has been fulfilled and delivered',
        icon: order.status === 'cancelled' ? '❌' : '✅',
        active: order.status === 'fulfilled' || order.status === 'cancelled',
        timestamp: order.fulfilledAt || order.cancelledAt
      }
    ];

    return baseItems;
  };

  return (
    <>
      <SEOHead 
        title={`Order #${order.id} - OMNIX AI`}
        description={`Order details for order #${order.id}`}
      />
      
      <DetailContainer>
        <BackButton variant="outline" onClick={handleBack}>
          ← Back to Orders
        </BackButton>

        <DetailHeader>
          <HeaderInfo>
            <Typography variant="h1" weight="600" style={{ marginBottom: '0.5rem' }}>
              Order #{order.id}
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <StatusBadge variant={getStatusColor(order.status)}>
                {order.status || 'pending'}
              </StatusBadge>
              {order.priority && (
                <Badge variant={order.priority === 'high' ? 'error' : order.priority === 'medium' ? 'warning' : 'default'}>
                  {order.priority} priority
                </Badge>
              )}
            </div>
            <Typography variant="body2" color="secondary">
              Created {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown'}
            </Typography>
          </HeaderInfo>

          <HeaderActions>
            {order.status === 'pending' && (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  Edit Order
                </Button>
                <Button variant="primary" onClick={handleFulfill}>
                  Mark as Fulfilled
                </Button>
                <Button variant="danger" onClick={handleCancel}>
                  Cancel Order
                </Button>
              </>
            )}
            {order.status === 'processing' && (
              <>
                <Button variant="primary" onClick={handleFulfill}>
                  Mark as Fulfilled
                </Button>
                <Button variant="danger" onClick={handleCancel}>
                  Cancel Order
                </Button>
              </>
            )}
          </HeaderActions>
        </DetailHeader>

        <DetailGrid>
          <div>
            {/* Order Items */}
            <DetailCard>
              <Typography variant="h2" weight="600" style={{ marginBottom: '1.5rem' }}>
                Order Items
              </Typography>
              
              {order.items && order.items.length > 0 ? (
                <ItemsTable>
                  <ItemsHeader>
                    <div>Product</div>
                    <div>SKU</div>
                    <div>Quantity</div>
                    <div>Unit Cost</div>
                    <div>Total</div>
                  </ItemsHeader>
                  
                  {order.items.map(item => (
                    <ItemRow key={item.id}>
                      <div>
                        <Typography variant="body2" weight="500">
                          {item.productName || item.name}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="secondary">
                          {item.sku}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2">
                          {item.quantity}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2">
                          ${(item.unitCost || 0).toFixed(2)}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" weight="500">
                          ${(item.totalCost || item.quantity * item.unitCost || 0).toFixed(2)}
                        </Typography>
                      </div>
                    </ItemRow>
                  ))}
                  
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: '#f8fafc', 
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h4" weight="600">
                      Total
                    </Typography>
                    <Typography variant="h3" weight="700" color="primary">
                      ${(order.totalAmount || 0).toFixed(2)}
                    </Typography>
                  </div>
                </ItemsTable>
              ) : (
                <Typography variant="body2" color="secondary">
                  No items in this order.
                </Typography>
              )}
            </DetailCard>
          </div>

          <div>
            {/* Order Information */}
            <DetailCard style={{ marginBottom: '2rem' }}>
              <Typography variant="h2" weight="600" style={{ marginBottom: '1.5rem' }}>
                Order Information
              </Typography>
              
              <DetailSection>
                <DetailRow>
                  <Typography variant="body2" color="secondary">Supplier</Typography>
                  <Typography variant="body2" weight="500">
                    {order.supplier?.name || order.supplierName || 'Unknown'}
                  </Typography>
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="secondary">Order Date</Typography>
                  <Typography variant="body2">
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Not set'}
                  </Typography>
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="secondary">Expected Delivery</Typography>
                  <Typography variant="body2">
                    {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'Not set'}
                  </Typography>
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="secondary">Priority</Typography>
                  <Badge variant={order.priority === 'high' ? 'error' : order.priority === 'medium' ? 'warning' : 'default'}>
                    {order.priority || 'medium'}
                  </Badge>
                </DetailRow>
                
                {order.notes && (
                  <DetailRow>
                    <Typography variant="body2" color="secondary">Notes</Typography>
                    <Typography variant="body2">
                      {order.notes}
                    </Typography>
                  </DetailRow>
                )}
              </DetailSection>
            </DetailCard>

            {/* Order Timeline */}
            <DetailCard>
              <Typography variant="h2" weight="600" style={{ marginBottom: '1.5rem' }}>
                Order Timeline
              </Typography>
              
              <Timeline>
                {getTimelineItems().map(item => (
                  <TimelineItem key={item.id} active={item.active}>
                    <TimelineIcon active={item.active}>
                      {item.icon}
                    </TimelineIcon>
                    <TimelineContent>
                      <Typography variant="body1" weight="500" style={{ marginBottom: '0.25rem' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="secondary" style={{ marginBottom: '0.5rem' }}>
                        {item.description}
                      </Typography>
                      {item.timestamp && (
                        <Typography variant="caption" color="secondary">
                          {new Date(item.timestamp).toLocaleString()}
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </DetailCard>
          </div>
        </DetailGrid>

        {/* Edit Order Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Order"
          size="lg"
        >
          <OrderForm
            order={order}
            onSubmit={handleOrderSubmit}
            onCancel={() => setIsEditModalOpen(false)}
            loading={loading.update}
          />
        </Modal>
      </DetailContainer>
    </>
  );
}

export default OrderDetail;