import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const GridContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['columns', 'spacing', 'layout'].includes(prop),
})`
  display: grid;
  gap: ${props => getGridGap(props.spacing, props.theme)};
  width: 100%;
  
  &.dashboard-grid {
    /* Print-specific styles are handled in global CSS */
  }
  
  ${props => getGridTemplate(props.layout, props.columns, props.theme)}
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    ${props => props.layout === 'masonry' && css`
      display: flex;
      flex-direction: column;
    `}
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) and (max-width: ${props => props.theme.breakpoints.xl}) {
    ${props => props.columns > 3 && css`
      grid-template-columns: repeat(3, 1fr);
    `}
  }
`;

const GridItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['span', 'rowSpan'].includes(prop),
})`
  ${props => props.span && css`
    grid-column: span ${props.span};
    
    @media (max-width: ${props.theme.breakpoints.lg}) {
      grid-column: span 1;
    }
  `}
  
  ${props => props.rowSpan && css`
    grid-row: span ${props.rowSpan};
    
    @media (max-width: ${props.theme.breakpoints.lg}) {
      grid-row: span 1;
    }
  `}
  
  ${props => props.order && css`
    order: ${props.order};
  `}
  
  ${props => props.layout === 'masonry' && css`
    break-inside: avoid;
    margin-bottom: ${getGridGap(props.spacing, props.theme)};
  `}
`;

const ResponsiveWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: ${props => props.minHeight || 'auto'};
  
  ${props => props.aspectRatio && css`
    aspect-ratio: ${props.aspectRatio};
  `}
`;

const DragHandle = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
  width: 20px;
  height: 20px;
  cursor: grab;
  opacity: 0;
  transition: opacity ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  z-index: 10;
  
  &:active {
    cursor: grabbing;
  }
  
  ${GridItem}:hover & {
    opacity: 0.5;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(circle, ${props => props.theme.colors.text.tertiary} 1px, transparent 1px);
    background-size: 4px 4px;
  }
`;

const getGridGap = (spacing, theme) => {
  const gaps = {
    none: '0',
    sm: theme.spacing[2],
    md: theme.spacing[4],
    lg: theme.spacing[6],
    xl: theme.spacing[8]
  };
  return gaps[spacing] || gaps.md;
};

const getGridTemplate = (layout, columns, theme) => {
  switch (layout) {
    case 'fixed':
      return css`
        grid-template-columns: repeat(${columns}, 1fr);
      `;
    case 'auto-fit':
      return css`
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      `;
    case 'auto-fill':
      return css`
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      `;
    case 'masonry':
      return css`
        columns: ${columns};
        column-gap: ${getGridGap('md', theme)};
      `;
    case 'custom':
      return css`
        grid-template-columns: ${columns};
      `;
    default:
      return css`
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      `;
  }
};

const defaultBreakpoints = {
  xs: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4
};

const DashboardGrid = ({
  children,
  layout = 'auto-fit',
  columns = 4,
  spacing = 'md',
  draggable = false,
  resizable = false,
  breakpoints = defaultBreakpoints,
  minItemWidth = 300,
  maxItemWidth,
  aspectRatio,
  onLayoutChange,
  onItemMove,
  onItemResize,
  className,
  ...props
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('xl');
  const gridRef = useRef(null);

  // Handle responsive breakpoints
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setCurrentBreakpoint('xs');
      else if (width < 768) setCurrentBreakpoint('sm');
      else if (width < 1024) setCurrentBreakpoint('md');
      else if (width < 1280) setCurrentBreakpoint('lg');
      else setCurrentBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  // Get current columns based on breakpoint
  const currentColumns = typeof columns === 'object' 
    ? columns[currentBreakpoint] || breakpoints[currentBreakpoint] || 1
    : breakpoints[currentBreakpoint] || columns;

  const handleDragStart = (e, index) => {
    if (!draggable) return;
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    if (!draggable || draggedItem === null) return;
    e.preventDefault();
    setDragOver(index);
  };

  const handleDragEnd = () => {
    if (!draggable) return;
    if (draggedItem !== null && dragOver !== null && draggedItem !== dragOver) {
      onItemMove?.(draggedItem, dragOver);
    }
    setDraggedItem(null);
    setDragOver(null);
  };

  const renderChildren = () => {
    return Array.isArray(children) ? children.map((child, index) => {
      if (!child) return null;

      const itemProps = child.props || {};
      const {
        span = 1,
        rowSpan,
        order,
        aspectRatio: itemAspectRatio,
        minHeight,
        ...childProps
      } = itemProps;

      return (
        <GridItem
          key={child.key || index}
          span={Math.min(span, currentColumns)}
          rowSpan={rowSpan}
          order={order}
          spacing={spacing}
          layout={layout}
          draggable={draggable}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.1,
            ease: 'easeOut'
          }}
          whileHover={draggable ? { scale: 1.02 } : undefined}
          style={{
            position: 'relative',
            transform: draggedItem === index ? 'rotate(5deg)' : undefined,
            zIndex: draggedItem === index ? 10 : undefined,
            opacity: draggedItem === index ? 0.7 : undefined
          }}
        >
          <ResponsiveWrapper
            minHeight={minHeight}
            aspectRatio={itemAspectRatio || aspectRatio}
          >
            {draggable && (
              <DragHandle />
            )}
            {typeof child === 'function' 
              ? child({ 
                  ...childProps,
                  breakpoint: currentBreakpoint,
                  columns: currentColumns,
                  isGrid: true
                })
              : child
            }
          </ResponsiveWrapper>
        </GridItem>
      );
    }) : children;
  };

  return (
    <GridContainer
      ref={gridRef}
      layout={layout}
      columns={layout === 'custom' ? columns : currentColumns}
      spacing={spacing}
      className={`dashboard-grid ${className || ''}`}
      {...props}
    >
      {renderChildren()}
    </GridContainer>
  );
};

// Export the styled GridItem component
export { GridItem };

// Predefined layout configurations
export const DASHBOARD_LAYOUTS = {
  // Standard 4-column responsive grid
  default: {
    layout: 'auto-fit',
    columns: { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
    spacing: 'md'
  },
  
  // Dense grid with smaller gaps
  compact: {
    layout: 'auto-fit',
    columns: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
    spacing: 'sm'
  },
  
  // Masonry-style layout
  masonry: {
    layout: 'masonry',
    columns: { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 },
    spacing: 'md'
  },
  
  // Large cards layout
  featured: {
    layout: 'auto-fit',
    columns: { xs: 1, sm: 1, md: 2, lg: 2, xl: 3 },
    spacing: 'lg',
    aspectRatio: '16/9'
  },
  
  // Fixed sidebar + content layout
  sidebar: {
    layout: 'custom',
    columns: '300px 1fr',
    spacing: 'lg'
  },
  
  // Three-column layout
  threeColumn: {
    layout: 'fixed',
    columns: 3,
    spacing: 'md'
  }
};

export default DashboardGrid;