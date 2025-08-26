import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';

const DragContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DragList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const DragItem = styled(motion.div)`
  position: relative;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.isDragging ? props.theme.colors.primary[300] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  transition: all 0.2s ease;
  box-shadow: ${props => props.isDragging ? props.theme.shadows.lg : props.theme.shadows.sm};
  z-index: ${props => props.isDragging ? 10 : 1};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[200]};
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const DragHandle = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing[1]};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.secondary};
  cursor: grab;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[1]};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const ItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding-left: ${props => props.theme.spacing[8]};
`;

const ItemIcon = styled.div`
  width: 40px;
  height: 40px;
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

const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${DragItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing[1]};
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${props => props.theme.spacing[1]};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const DropZone = styled(motion.div)`
  height: 4px;
  background: ${props => props.theme.colors.primary[500]};
  border-radius: 2px;
  margin: ${props => props.theme.spacing[1]} 0;
  opacity: ${props => props.visible ? 1 : 0};
  transform: scaleY(${props => props.visible ? 1 : 0.5});
  transition: all 0.2s ease;
`;

const DragPreview = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1000;
  transform-origin: top left;
  opacity: 0.8;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[3]};
`;

const GridItem = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.isDragging ? props.theme.colors.primary[300] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  transition: all 0.2s ease;
  box-shadow: ${props => props.isDragging ? props.theme.shadows.lg : props.theme.shadows.sm};
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[200]};
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const CategoryContainer = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border: 2px dashed ${props => props.isOver ? props.theme.colors.primary[300] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  min-height: 200px;
  transition: all 0.2s ease;
  
  ${props => props.isOver && `
    background: ${props.theme.colors.primary[50]};
    border-color: ${props.theme.colors.primary[500]};
  `}
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
  padding-bottom: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const CategoryTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
`;

const DragAndDrop = ({
  items = [],
  onReorder,
  onCategoryChange,
  mode = 'list', // 'list', 'grid', 'categories'
  categories = [],
  className,
  renderItem,
  dragHandleProps = {},
  allowCrossCategory = true
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dropCategory, setDropCategory] = useState(null);

  const dragRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (isDragging && draggedItem) {
        handleDrop();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedItem, dropIndex, dropCategory]);

  const handleDragStart = (item, index, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedItem(item);
    setDraggedIndex(index);
    setIsDragging(true);
    
    // Prevent default drag behavior
    e.preventDefault();
  };

  const handleDragOver = (index, category = null) => {
    if (mode === 'categories' && category) {
      setDropCategory(category);
    } else {
      setDropIndex(index);
    }
  };

  const handleDrop = () => {
    if (mode === 'categories' && dropCategory && onCategoryChange) {
      onCategoryChange(draggedItem, dropCategory);
    } else if (dropIndex !== null && draggedIndex !== dropIndex && onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    
    // Reset drag state
    setDraggedItem(null);
    setDraggedIndex(null);
    setDropIndex(null);
    setDropCategory(null);
    setIsDragging(false);
  };

  const getItemIcon = (item) => {
    if (item.type) {
      switch (item.type) {
        case 'product':
          return { icon: 'package', color: '#3B82F6' };
        case 'category':
          return { icon: 'folder', color: '#10B981' };
        case 'order':
          return { icon: 'shopping-cart', color: '#F59E0B' };
        case 'customer':
          return { icon: 'user', color: '#8B5CF6' };
        default:
          return { icon: 'file', color: '#6B7280' };
      }
    }
    return { icon: 'file', color: '#6B7280' };
  };

  const renderListItem = (item, index) => {
    const isCurrentlyDragging = isDragging && draggedIndex === index;
    const iconInfo = getItemIcon(item);

    return (
      <>
        {dropIndex === index && isDragging && (
          <DropZone visible={true} />
        )}
        
        <DragItem
          key={item.id || index}
          isDragging={isCurrentlyDragging}
          style={{ opacity: isCurrentlyDragging ? 0.5 : 1 }}
          onMouseDown={(e) => handleDragStart(item, index, e)}
          onMouseEnter={() => handleDragOver(index)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <DragHandle {...dragHandleProps}>
            <Icon name="grip-vertical" size={16} />
          </DragHandle>
          
          <ItemContent>
            {renderItem ? renderItem(item, index) : (
              <>
                <ItemIcon color={iconInfo.color}>
                  <Icon name={iconInfo.icon} size={20} color={iconInfo.color} />
                </ItemIcon>
                
                <ItemDetails>
                  <Typography variant="body1" weight="medium">
                    {item.name || item.title || `Item ${index + 1}`}
                  </Typography>
                  {item.description && (
                    <Typography variant="caption" color="secondary">
                      {item.description}
                    </Typography>
                  )}
                </ItemDetails>
                
                <ItemActions>
                  <ActionButton>
                    <Icon name="edit" size={14} />
                  </ActionButton>
                  <ActionButton>
                    <Icon name="more-vertical" size={14} />
                  </ActionButton>
                </ItemActions>
              </>
            )}
          </ItemContent>
        </DragItem>
        
        {dropIndex === index + 1 && isDragging && (
          <DropZone visible={true} />
        )}
      </>
    );
  };

  const renderGridItem = (item, index) => {
    const isCurrentlyDragging = isDragging && draggedIndex === index;
    const iconInfo = getItemIcon(item);

    return (
      <GridItem
        key={item.id || index}
        isDragging={isCurrentlyDragging}
        style={{ opacity: isCurrentlyDragging ? 0.5 : 1 }}
        onMouseDown={(e) => handleDragStart(item, index, e)}
        onMouseEnter={() => handleDragOver(index)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
      >
        <DragHandle {...dragHandleProps} style={{ top: '8px', left: '8px', transform: 'none' }}>
          <Icon name="grip-vertical" size={14} />
        </DragHandle>
        
        {renderItem ? renderItem(item, index) : (
          <div style={{ paddingTop: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <ItemIcon color={iconInfo.color} style={{ margin: '0 auto' }}>
                <Icon name={iconInfo.icon} size={24} color={iconInfo.color} />
              </ItemIcon>
            </div>
            
            <Typography variant="body2" weight="medium" style={{ textAlign: 'center', marginBottom: '4px' }}>
              {item.name || item.title || `Item ${index + 1}`}
            </Typography>
            
            {item.description && (
              <Typography variant="caption" color="secondary" style={{ textAlign: 'center' }}>
                {item.description}
              </Typography>
            )}
          </div>
        )}
      </GridItem>
    );
  };

  const renderCategoryMode = () => {
    const itemsByCategory = items.reduce((acc, item) => {
      const category = item.category || 'uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {categories.map(category => (
          <CategoryContainer
            key={category.id}
            isOver={dropCategory === category.id}
            onMouseEnter={() => handleDragOver(null, category.id)}
          >
            <CategoryHeader>
              <CategoryTitle>
                <Icon name="folder" size={18} color="primary" />
                <Typography variant="h6" weight="semibold">
                  {category.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  ({itemsByCategory[category.id]?.length || 0})
                </Typography>
              </CategoryTitle>
            </CategoryHeader>
            
            {itemsByCategory[category.id]?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {itemsByCategory[category.id].map((item, index) => (
                  <DragItem
                    key={item.id}
                    isDragging={isDragging && draggedItem?.id === item.id}
                    style={{ 
                      opacity: isDragging && draggedItem?.id === item.id ? 0.5 : 1,
                      padding: '8px 12px'
                    }}
                    onMouseDown={(e) => handleDragStart(item, index, e)}
                  >
                    <ItemContent style={{ paddingLeft: '24px' }}>
                      <DragHandle style={{ left: '4px' }}>
                        <Icon name="grip-vertical" size={12} />
                      </DragHandle>
                      
                      {renderItem ? renderItem(item, index) : (
                        <>
                          <Typography variant="body2" weight="medium">
                            {item.name || item.title}
                          </Typography>
                          {item.description && (
                            <Typography variant="caption" color="secondary">
                              {item.description}
                            </Typography>
                          )}
                        </>
                      )}
                    </ItemContent>
                  </DragItem>
                ))}
              </div>
            ) : (
              <EmptyMessage>
                <Icon name="inbox" size={24} style={{ marginBottom: '8px' }} />
                <Typography variant="caption" color="secondary">
                  Drop items here
                </Typography>
              </EmptyMessage>
            )}
          </CategoryContainer>
        ))}
      </div>
    );
  };

  return (
    <DragContainer ref={containerRef} className={className}>
      {mode === 'list' && (
        <DragList>
          {items.map((item, index) => renderListItem(item, index))}
        </DragList>
      )}
      
      {mode === 'grid' && (
        <GridContainer>
          {items.map((item, index) => renderGridItem(item, index))}
        </GridContainer>
      )}
      
      {mode === 'categories' && renderCategoryMode()}
      
      {/* Drag Preview */}
      <AnimatePresence>
        {isDragging && draggedItem && (
          <DragPreview
            style={{
              left: mousePosition.x - dragOffset.x,
              top: mousePosition.y - dragOffset.y
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <DragItem isDragging={true} style={{ width: '250px' }}>
              <ItemContent style={{ paddingLeft: '32px' }}>
                {renderItem ? renderItem(draggedItem, draggedIndex) : (
                  <>
                    <ItemIcon color={getItemIcon(draggedItem).color}>
                      <Icon name={getItemIcon(draggedItem).icon} size={20} color={getItemIcon(draggedItem).color} />
                    </ItemIcon>
                    
                    <ItemDetails>
                      <Typography variant="body1" weight="medium">
                        {draggedItem.name || draggedItem.title || 'Item'}
                      </Typography>
                      {draggedItem.description && (
                        <Typography variant="caption" color="secondary">
                          {draggedItem.description}
                        </Typography>
                      )}
                    </ItemDetails>
                  </>
                )}
              </ItemContent>
            </DragItem>
          </DragPreview>
        )}
      </AnimatePresence>
    </DragContainer>
  );
};

export default DragAndDrop;