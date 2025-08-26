import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import Typography from './Typography';

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['placement', 'size'].includes(prop),
})`
  position: absolute;
  z-index: 1000;
  background: ${props => props.theme.colors.gray[900]};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => getTooltipPadding(props.size)};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => getTooltipFontSize(props.size, props.theme)};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  line-height: ${props => props.theme.typography.lineHeight.tight};
  white-space: nowrap;
  max-width: 200px;
  word-wrap: break-word;
  pointer-events: none;
  box-shadow: ${props => props.theme.shadows.lg};
  
  /* Arrow styles */
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    
    ${props => getArrowStyles(props.placement, props.theme)}
  }
`;

const getTooltipPadding = (size) => {
  switch (size) {
    case 'sm':
      return '4px 8px';
    case 'lg':
      return '12px 16px';
    default: // md
      return '8px 12px';
  }
};

const getTooltipFontSize = (size, theme) => {
  switch (size) {
    case 'sm':
      return theme.typography.fontSize.xs;
    case 'lg':
      return theme.typography.fontSize.base;
    default: // md
      return theme.typography.fontSize.sm;
  }
};

const getArrowStyles = (placement, theme) => {
  const arrowColor = theme.colors.gray[900];
  
  switch (placement) {
    case 'top':
      return css`
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px 5px 0 5px;
        border-color: ${arrowColor} transparent transparent transparent;
      `;
    case 'bottom':
      return css`
        top: -5px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0 5px 5px 5px;
        border-color: transparent transparent ${arrowColor} transparent;
      `;
    case 'left':
      return css`
        right: -5px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 5px 0 5px 5px;
        border-color: transparent transparent transparent ${arrowColor};
      `;
    case 'right':
      return css`
        left: -5px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 5px 5px 5px 0;
        border-color: transparent ${arrowColor} transparent transparent;
      `;
    default:
      return '';
  }
};

const Tooltip = ({
  children,
  content,
  placement = 'top',
  size = 'md',
  delay = 500,
  disabled = false,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [actualPlacement, setActualPlacement] = useState(placement);
  
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  // Calculate optimal position with collision detection
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const offset = 8;
    
    let x = 0;
    let y = 0;
    let finalPlacement = placement;
    
    // Calculate initial position based on placement
    switch (placement) {
      case 'top':
        x = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top + scrollY - tooltipRect.height - offset;
        
        // Check if tooltip goes above viewport
        if (y < scrollY) {
          finalPlacement = 'bottom';
          y = triggerRect.bottom + scrollY + offset;
        }
        break;
        
      case 'bottom':
        x = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + scrollY + offset;
        
        // Check if tooltip goes below viewport
        if (y + tooltipRect.height > scrollY + viewportHeight) {
          finalPlacement = 'top';
          y = triggerRect.top + scrollY - tooltipRect.height - offset;
        }
        break;
        
      case 'left':
        x = triggerRect.left + scrollX - tooltipRect.width - offset;
        y = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        
        // Check if tooltip goes left of viewport
        if (x < scrollX) {
          finalPlacement = 'right';
          x = triggerRect.right + scrollX + offset;
        }
        break;
        
      case 'right':
        x = triggerRect.right + scrollX + offset;
        y = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        
        // Check if tooltip goes right of viewport
        if (x + tooltipRect.width > scrollX + viewportWidth) {
          finalPlacement = 'left';
          x = triggerRect.left + scrollX - tooltipRect.width - offset;
        }
        break;
    }
    
    // Ensure tooltip stays within horizontal viewport bounds
    if (finalPlacement === 'top' || finalPlacement === 'bottom') {
      if (x < scrollX + 8) x = scrollX + 8;
      if (x + tooltipRect.width > scrollX + viewportWidth - 8) {
        x = scrollX + viewportWidth - tooltipRect.width - 8;
      }
    }
    
    // Ensure tooltip stays within vertical viewport bounds
    if (finalPlacement === 'left' || finalPlacement === 'right') {
      if (y < scrollY + 8) y = scrollY + 8;
      if (y + tooltipRect.height > scrollY + viewportHeight - 8) {
        y = scrollY + viewportHeight - tooltipRect.height - 8;
      }
    }
    
    setPosition({ x, y });
    setActualPlacement(finalPlacement);
  };

  const showTooltip = () => {
    if (disabled || !content) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  const handleMouseEnter = () => showTooltip();
  const handleMouseLeave = () => hideTooltip();
  const handleFocus = () => showTooltip();
  const handleBlur = () => hideTooltip();

  // Recalculate position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure tooltip is rendered and measured
      setTimeout(calculatePosition, 0);
    }
  }, [isVisible]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clone children with event handlers
  const triggerElement = cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    'aria-describedby': isVisible ? 'tooltip' : undefined,
    ...(children.props || {})
  });

  const tooltipPortal = createPortal(
    <AnimatePresence>
      {isVisible && content && (
        <TooltipContent
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={className}
          placement={actualPlacement}
          size={size}
          style={{
            left: position.x,
            top: position.y,
          }}
          initial={{
            opacity: 0,
            scale: 0.9,
            ...(actualPlacement === 'top' && { y: 5 }),
            ...(actualPlacement === 'bottom' && { y: -5 }),
            ...(actualPlacement === 'left' && { x: 5 }),
            ...(actualPlacement === 'right' && { x: -5 })
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            ...(actualPlacement === 'top' && { y: 5 }),
            ...(actualPlacement === 'bottom' && { y: -5 }),
            ...(actualPlacement === 'left' && { x: 5 }),
            ...(actualPlacement === 'right' && { x: -5 })
          }}
          transition={{
            duration: 0.2,
            ease: 'easeOut'
          }}
          {...props}
        >
          {typeof content === 'string' ? (
            <Typography as="span" variant="body2">
              {content}
            </Typography>
          ) : (
            content
          )}
        </TooltipContent>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <TooltipWrapper>
      {triggerElement}
      {tooltipPortal}
    </TooltipWrapper>
  );
};

export default Tooltip;