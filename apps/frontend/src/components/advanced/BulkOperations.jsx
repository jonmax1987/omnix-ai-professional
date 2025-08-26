import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';

const BulkContainer = styled(motion.div)`
  position: fixed;
  bottom: ${props => props.theme.spacing[6]};
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: 40;
  min-width: 400px;
  max-width: 600px;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    left: ${props => props.theme.spacing[4]};
    right: ${props => props.theme.spacing[4]};
    transform: none;
    min-width: auto;
  }
`;

const BulkHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const BulkInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
`;

const ActionButton = styled(Button)`
  white-space: nowrap;
`;

const SelectedItems = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const SelectedItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
  min-width: 0;
`;

const ItemIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const RemoveButton = styled.button`
  padding: ${props => props.theme.spacing[1]};
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${props => props.theme.spacing[1]};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.error[500]};
  }
`;

const ConfirmationModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContent = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[6]};
  max-width: 500px;
  margin: ${props => props.theme.spacing[4]};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing[4]};
`;

const SelectAllBar = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SelectAllInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: 2px;
  overflow: hidden;
  margin: ${props => props.theme.spacing[2]} 0;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.color || props.theme.colors.primary[500]};
  border-radius: 2px;
`;

const BulkOperations = ({
  selectedItems = [],
  onSelectionChange,
  onBulkAction,
  availableActions = [],
  totalItems = 0,
  onSelectAll,
  onDeselectAll,
  itemType = 'items',
  className
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSelectedItems, setShowSelectedItems] = useState(false);

  const selectedCount = selectedItems.length;
  const allSelected = selectedCount === totalItems && totalItems > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalItems;

  // Default actions
  const defaultActions = [
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash-2',
      variant: 'error',
      requiresConfirmation: true,
      confirmationTitle: 'Delete Items',
      confirmationMessage: `Are you sure you want to delete ${selectedCount} ${itemType}? This action cannot be undone.`,
      dangerous: true
    },
    {
      id: 'export',
      label: 'Export',
      icon: 'download',
      variant: 'outline'
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: 'copy',
      variant: 'outline'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: 'archive',
      variant: 'outline',
      requiresConfirmation: true,
      confirmationTitle: 'Archive Items',
      confirmationMessage: `Archive ${selectedCount} ${itemType}? They will be moved to the archive section.`
    },
    {
      id: 'tag',
      label: 'Add Tags',
      icon: 'tag',
      variant: 'outline'
    },
    {
      id: 'category',
      label: 'Change Category',
      icon: 'folder',
      variant: 'outline'
    },
    {
      id: 'status',
      label: 'Update Status',
      icon: 'settings',
      variant: 'outline'
    }
  ];

  const actions = availableActions.length > 0 ? availableActions : defaultActions;

  // Simulate progress for bulk operations
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsProcessing(false);
            return 0;
          }
          return prev + 10;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleActionClick = (action) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirmation(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action) => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      if (onBulkAction) {
        await onBulkAction(action.id, selectedItems);
      }
      
      // Simulate operation time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear selection after successful operation
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      executeAction(pendingAction);
    }
    setShowConfirmation(false);
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setPendingAction(null);
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    }
  };

  const handleDeselectAll = () => {
    if (onDeselectAll) {
      onDeselectAll();
    }
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const handleRemoveItem = (itemId) => {
    const newSelection = selectedItems.filter(item => 
      typeof item === 'object' ? item.id !== itemId : item !== itemId
    );
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const getItemIcon = (item) => {
    if (typeof item === 'object') {
      switch (item.type || itemType) {
        case 'product':
        case 'products':
          return { icon: 'package', color: '#3B82F6' };
        case 'order':
        case 'orders':
          return { icon: 'shopping-cart', color: '#10B981' };
        case 'customer':
        case 'customers':
          return { icon: 'user', color: '#F59E0B' };
        case 'supplier':
        case 'suppliers':
          return { icon: 'truck', color: '#8B5CF6' };
        default:
          return { icon: 'file', color: '#6B7280' };
      }
    }
    return { icon: 'file', color: '#6B7280' };
  };

  const getItemDisplayName = (item) => {
    if (typeof item === 'object') {
      return item.name || item.title || item.id || 'Unknown Item';
    }
    return item.toString();
  };

  const getItemDisplayInfo = (item) => {
    if (typeof item === 'object') {
      if (item.sku) return `SKU: ${item.sku}`;
      if (item.email) return item.email;
      if (item.orderNumber) return `Order: ${item.orderNumber}`;
      return '';
    }
    return '';
  };

  if (selectedCount === 0 && !isProcessing) {
    return null;
  }

  return (
    <>
      {/* Select All Bar */}
      {totalItems > 0 && (someSelected || allSelected) && (
        <SelectAllBar
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <SelectAllInfo>
            <Icon name="check-square" size={16} color="primary" />
            <Typography variant="body2">
              {allSelected 
                ? `All ${totalItems} ${itemType} selected`
                : `${selectedCount} of ${totalItems} ${itemType} selected`
              }
            </Typography>
          </SelectAllInfo>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {!allSelected && (
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                Select All {totalItems}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleDeselectAll}>
              Clear Selection
            </Button>
          </div>
        </SelectAllBar>
      )}

      {/* Bulk Operations Panel */}
      <AnimatePresence>
        {(selectedCount > 0 || isProcessing) && (
          <BulkContainer
            className={className}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <BulkHeader>
              <BulkInfo>
                <Icon name="check-square" size={20} color="primary" />
                <div>
                  <Typography variant="body1" weight="semibold">
                    {isProcessing ? 'Processing...' : `${selectedCount} ${itemType} selected`}
                  </Typography>
                  {isProcessing && (
                    <Typography variant="caption" color="secondary">
                      {progress}% complete
                    </Typography>
                  )}
                </div>
                {!isProcessing && (
                  <Badge variant="primary" size="sm">
                    {selectedCount}
                  </Badge>
                )}
              </BulkInfo>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSelectedItems(!showSelectedItems)}
                  >
                    <Icon name={showSelectedItems ? 'chevron-down' : 'chevron-up'} size={16} />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDeselectAll}
                  disabled={isProcessing}
                >
                  <Icon name="x" size={16} />
                </Button>
              </div>
            </BulkHeader>

            {isProcessing && (
              <div style={{ padding: '0 16px 16px' }}>
                <ProgressBar>
                  <ProgressFill
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </ProgressBar>
              </div>
            )}

            {!isProcessing && (
              <BulkActions>
                {actions.map(action => (
                  <ActionButton
                    key={action.id}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={() => handleActionClick(action)}
                    disabled={isProcessing}
                  >
                    <Icon name={action.icon} size={14} />
                    {action.label}
                  </ActionButton>
                ))}
              </BulkActions>
            )}

            {/* Selected Items List */}
            <AnimatePresence>
              {showSelectedItems && selectedCount > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <SelectedItems>
                    {selectedItems.slice(0, 10).map((item, index) => {
                      const itemId = typeof item === 'object' ? item.id : item;
                      const iconInfo = getItemIcon(item);
                      
                      return (
                        <SelectedItem key={itemId || index}>
                          <ItemInfo>
                            <ItemIcon color={iconInfo.color}>
                              <Icon name={iconInfo.icon} size={16} color={iconInfo.color} />
                            </ItemIcon>
                            <ItemDetails>
                              <Typography variant="body2" weight="medium">
                                {getItemDisplayName(item)}
                              </Typography>
                              {getItemDisplayInfo(item) && (
                                <Typography variant="caption" color="secondary">
                                  {getItemDisplayInfo(item)}
                                </Typography>
                              )}
                            </ItemDetails>
                          </ItemInfo>
                          
                          <RemoveButton onClick={() => handleRemoveItem(itemId)}>
                            <Icon name="x" size={14} />
                          </RemoveButton>
                        </SelectedItem>
                      );
                    })}
                    
                    {selectedCount > 10 && (
                      <div style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <Typography variant="caption" color="secondary">
                          And {selectedCount - 10} more items...
                        </Typography>
                      </div>
                    )}
                  </SelectedItems>
                </motion.div>
              )}
            </AnimatePresence>
          </BulkContainer>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && pendingAction && (
          <ConfirmationModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ModalHeader>
                <Icon 
                  name={pendingAction.dangerous ? 'alert-triangle' : 'help-circle'} 
                  size={24} 
                  color={pendingAction.dangerous ? 'error' : 'warning'} 
                />
                <Typography variant="h6" weight="semibold">
                  {pendingAction.confirmationTitle || 'Confirm Action'}
                </Typography>
              </ModalHeader>
              
              <Typography variant="body2" color="secondary">
                {pendingAction.confirmationMessage || 
                 `Are you sure you want to ${pendingAction.label.toLowerCase()} ${selectedCount} ${itemType}?`}
              </Typography>
              
              <ModalActions>
                <Button variant="outline" onClick={handleCancelAction}>
                  Cancel
                </Button>
                <Button 
                  variant={pendingAction.dangerous ? 'error' : 'primary'} 
                  onClick={handleConfirmAction}
                >
                  {pendingAction.label}
                </Button>
              </ModalActions>
            </ModalContent>
          </ConfirmationModal>
        )}
      </AnimatePresence>
    </>
  );
};

export default BulkOperations;