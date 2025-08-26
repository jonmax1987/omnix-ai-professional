import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';

const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing[2]} 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  ${props => props.variant === 'compact' && css`
    padding: ${props.theme.spacing[1]} 0;
  `}
  
  ${props => props.variant === 'card' && css`
    background: ${props.theme.colors.background.elevated};
    border: 1px solid ${props.theme.colors.border.default};
    border-radius: ${props.theme.spacing[2]};
    padding: ${props.theme.spacing[3]} ${props.theme.spacing[4]};
  `}
`;

const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: max-content;
  flex-wrap: nowrap;
`;

const BreadcrumbItem = styled(motion.li)`
  display: flex;
  align-items: center;
  white-space: nowrap;
  
  &:not(:last-child)::after {
    content: '';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin: 0 ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.text.tertiary};
  }
  
  ${props => props.separator === 'chevron' && css`
    &:not(:last-child)::after {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23${props.theme.colors.text.tertiary.slice(1)}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m9 18 6-6-6-6'/%3E%3C/svg%3E");
    }
  `}
  
  ${props => props.separator === 'slash' && css`
    &:not(:last-child)::after {
      content: '/';
      font-size: ${props.theme.typography.fontSize.sm};
    }
  `}
  
  ${props => props.separator === 'dot' && css`
    &:not(:last-child)::after {
      content: '•';
      font-size: ${props.theme.typography.fontSize.lg};
    }
  `}
  
  ${props => props.separator === 'arrow' && css`
    &:not(:last-child)::after {
      content: '→';
      font-size: ${props.theme.typography.fontSize.sm};
    }
  `}
  
  /* RTL Support */
  [dir="rtl"] & {
    &:not(:last-child)::after {
      margin: 0 ${props => props.theme.spacing[2]};
      transform: scaleX(-1);
    }
  }
`;

const BreadcrumbLink = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  min-height: auto;
  height: auto;
  min-width: auto;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  border-radius: ${props => props.theme.spacing[1]};
  text-decoration: none;
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  ${props => props.compact && css`
    padding: ${props.theme.spacing[1]};
  `}
`;

const BreadcrumbCurrent = styled.span`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  
  ${props => props.compact && css`
    padding: ${props => props.theme.spacing[1]};
  `}
`;

const BreadcrumbIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CollapseButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  padding: ${props => props.theme.spacing[1]};
  min-width: auto;
  width: 32px;
  height: 28px;
  color: ${props => props.theme.colors.text.tertiary};
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.text.secondary};
    background-color: ${props => props.theme.colors.background.secondary};
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + ${props => props.theme.spacing[1]});
  left: 0;
  z-index: 10;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing[2]} 0;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
`;

const DropdownItem = styled(Button).attrs({
  variant: 'ghost'
})`
  width: 100%;
  justify-content: flex-start;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border-radius: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.background.secondary};
  }
`;

const Breadcrumb = forwardRef(({
  items = [],
  separator = 'chevron',
  variant = 'default',
  maxItems = 4,
  showHome = true,
  homeIcon = 'home',
  showIcons = true,
  compact = false,
  onItemClick,
  className,
  ...props
}, ref) => {
  const [showCollapsed, setShowCollapsed] = useState(false);

  // Ensure items is always an array
  const breadcrumbItems = Array.isArray(items) ? items : [];
  
  // Add home item if requested and not already present
  const allItems = showHome && breadcrumbItems.length > 0 && breadcrumbItems[0].id !== 'home'
    ? [{ id: 'home', label: 'Home', href: '/', icon: homeIcon }].concat(breadcrumbItems)
    : breadcrumbItems;

  // Determine which items to show based on maxItems
  const shouldCollapse = allItems.length > maxItems;
  const visibleItems = shouldCollapse
    ? [allItems[0], ...allItems.slice(-Math.max(maxItems - 2, 1))]
    : allItems;
  
  const hiddenItems = shouldCollapse
    ? allItems.slice(1, allItems.length - Math.max(maxItems - 2, 1))
    : [];

  const handleItemClick = (item, index) => {
    if (item.onClick) {
      item.onClick(item, index);
    } else if (onItemClick) {
      onItemClick(item, index);
    } else if (item.href && window) {
      window.location.href = item.href;
    }
  };

  const renderBreadcrumbItem = (item, index, isLast) => {
    const itemContent = (
      <>
        {showIcons && item.icon && (
          <BreadcrumbIcon>
            <Icon name={item.icon} size={compact ? 14 : 16} />
          </BreadcrumbIcon>
        )}
        <Typography variant={compact ? 'caption' : 'body2'}>
          {item.label}
        </Typography>
      </>
    );

    const itemProps = {
      key: item.id || index,
      compact,
      'aria-current': isLast ? 'page' : undefined
    };

    if (isLast) {
      return (
        <BreadcrumbCurrent {...itemProps}>
          {itemContent}
        </BreadcrumbCurrent>
      );
    }

    return (
      <BreadcrumbLink
        {...itemProps}
        onClick={() => handleItemClick(item, index)}
        disabled={item.disabled}
        title={item.title || item.label}
      >
        {itemContent}
      </BreadcrumbLink>
    );
  };

  const renderCollapsedMenu = () => (
    <div style={{ position: 'relative' }}>
      <CollapseButton
        onClick={() => setShowCollapsed(!showCollapsed)}
        title={`Show ${hiddenItems.length} hidden items`}
        aria-label={`Show ${hiddenItems.length} hidden breadcrumb items`}
      >
        <Icon name="moreHorizontal" size={16} />
      </CollapseButton>
      
      {showCollapsed && (
        <DropdownMenu
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          onMouseLeave={() => setShowCollapsed(false)}
        >
          {hiddenItems.map((item, index) => (
            <DropdownItem
              key={item.id || index}
              onClick={() => {
                handleItemClick(item, index + 1);
                setShowCollapsed(false);
              }}
              disabled={item.disabled}
            >
              {showIcons && item.icon && (
                <BreadcrumbIcon style={{ marginRight: '8px' }}>
                  <Icon name={item.icon} size={14} />
                </BreadcrumbIcon>
              )}
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </div>
  );

  if (allItems.length === 0) {
    return null;
  }

  return (
    <BreadcrumbContainer
      ref={ref}
      variant={variant}
      className={className}
      aria-label="Breadcrumb navigation"
      {...props}
    >
      <BreadcrumbList>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const showCollapseAfterFirst = shouldCollapse && index === 0;

          return (
            <BreadcrumbItem
              key={item.id || index}
              separator={separator}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {renderBreadcrumbItem(item, index, isLast)}
              
              {showCollapseAfterFirst && (
                <>
                  <div style={{ margin: '0 8px', color: '#9CA3AF' }}>
                    {separator === 'chevron' && <Icon name="chevronRight" size={14} />}
                    {separator === 'slash' && '/'}
                    {separator === 'dot' && '•'}
                    {separator === 'arrow' && '→'}
                  </div>
                  {renderCollapsedMenu()}
                  <div style={{ margin: '0 8px', color: '#9CA3AF' }}>
                    {separator === 'chevron' && <Icon name="chevronRight" size={14} />}
                    {separator === 'slash' && '/'}
                    {separator === 'dot' && '•'}
                    {separator === 'arrow' && '→'}
                  </div>
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbContainer>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;