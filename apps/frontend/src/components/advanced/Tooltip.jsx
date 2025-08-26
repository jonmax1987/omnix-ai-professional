import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['size', 'maxWidth'].includes(prop),
})`
  position: absolute;
  z-index: 1000;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.size === 'sm' ? props.theme.spacing[1] : 
                    props.size === 'lg' ? props.theme.spacing[3] : 
                    props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.lg};
  max-width: ${props => props.maxWidth || '250px'};
  word-wrap: break-word;
  pointer-events: none;
  
  /* Arrow positioning */
  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    
    ${props => {
      switch (props.placement) {
        case 'top':
          return `
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 6px 6px 0 6px;
            border-color: ${props.theme.colors.border.default} transparent transparent transparent;
          `;
        case 'bottom':
          return `
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 0 6px 6px 6px;
            border-color: transparent transparent ${props.theme.colors.border.default} transparent;
          `;
        case 'left':
          return `
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 6px 0 6px 6px;
            border-color: transparent transparent transparent ${props.theme.colors.border.default};
          `;
        case 'right':
          return `
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 6px 6px 6px 0;
            border-color: transparent ${props.theme.colors.border.default} transparent transparent;
          `;
        default:
          return '';
      }
    }}
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    
    ${props => {
      switch (props.placement) {
        case 'top':
          return `
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 5px 5px 0 5px;
            border-color: ${props.theme.colors.background.elevated} transparent transparent transparent;
          `;
        case 'bottom':
          return `
            top: -5px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 0 5px 5px 5px;
            border-color: transparent transparent ${props.theme.colors.background.elevated} transparent;
          `;
        case 'left':
          return `
            right: -5px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 5px 0 5px 5px;
            border-color: transparent transparent transparent ${props.theme.colors.background.elevated};
          `;
        case 'right':
          return `
            left: -5px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 5px 5px 5px 0;
            border-color: transparent ${props.theme.colors.background.elevated} transparent transparent;
          `;
        default:
          return '';
      }
    }}
  }
`;

const TooltipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  margin-bottom: ${props => props.theme.spacing[1]};
  padding-bottom: ${props => props.theme.spacing[1]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const TooltipBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const TooltipFooter = styled.div`
  margin-top: ${props => props.theme.spacing[2]};
  padding-top: ${props => props.theme.spacing[2]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const KeyboardShortcut = styled.span`
  padding: ${props => props.theme.spacing[0.5]} ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[0.5]};
  font-size: ${props => props.theme.typography.caption.fontSize};
  font-family: monospace;
  color: ${props => props.theme.colors.text.secondary};
`;

const TooltipProvider = styled.div`
  /* Global tooltip container */
`;

const Tooltip = ({
  children,
  content,
  title,
  description,
  icon,
  placement = 'top',
  trigger = 'hover', // 'hover', 'click', 'focus', 'manual'
  delay = 0,
  hideDelay = 0,
  size = 'md', // 'sm', 'md', 'lg'
  maxWidth,
  disabled = false,
  variant = 'default', // 'default', 'error', 'warning', 'success', 'info'
  showArrow = true,
  keyboard,
  footer,
  interactive = false,
  offset = 8,
  className,
  onShow,
  onHide,
  visible: controlledVisible,
  onVisibleChange
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [actualPlacement, setActualPlacement] = useState(placement);
  
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  
  const isControlled = controlledVisible !== undefined;
  const visible = isControlled ? controlledVisible : isVisible;

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = 0;
    let y = 0;
    let finalPlacement = placement;
    
    // Estimate tooltip dimensions (fallback if not measured)
    const tooltipWidth = tooltipRef.current?.offsetWidth || 200;
    const tooltipHeight = tooltipRef.current?.offsetHeight || 50;
    
    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        y = triggerRect.top - tooltipHeight - offset;
        
        // Check if tooltip goes off screen
        if (y < 0) {
          finalPlacement = 'bottom';
          y = triggerRect.bottom + offset;
        }
        if (x < 0) x = 8;
        if (x + tooltipWidth > viewportWidth) x = viewportWidth - tooltipWidth - 8;
        break;
        
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        y = triggerRect.bottom + offset;
        
        if (y + tooltipHeight > viewportHeight) {
          finalPlacement = 'top';
          y = triggerRect.top - tooltipHeight - offset;
        }
        if (x < 0) x = 8;
        if (x + tooltipWidth > viewportWidth) x = viewportWidth - tooltipWidth - 8;
        break;
        
      case 'left':
        x = triggerRect.left - tooltipWidth - offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        
        if (x < 0) {
          finalPlacement = 'right';
          x = triggerRect.right + offset;
        }
        if (y < 0) y = 8;
        if (y + tooltipHeight > viewportHeight) y = viewportHeight - tooltipHeight - 8;
        break;
        
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        
        if (x + tooltipWidth > viewportWidth) {
          finalPlacement = 'left';
          x = triggerRect.left - tooltipWidth - offset;
        }
        if (y < 0) y = 8;
        if (y + tooltipHeight > viewportHeight) y = viewportHeight - tooltipHeight - 8;
        break;
    }
    
    setPosition({ x, y });
    setActualPlacement(finalPlacement);
  };

  // Show tooltip
  const showTooltip = () => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    if (delay > 0) {
      showTimeoutRef.current = setTimeout(() => {
        if (!isControlled) setIsVisible(true);
        if (onVisibleChange) onVisibleChange(true);
        if (onShow) onShow();
        calculatePosition();
      }, delay);
    } else {
      if (!isControlled) setIsVisible(true);
      if (onVisibleChange) onVisibleChange(true);
      if (onShow) onShow();
      calculatePosition();
    }
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        if (!isControlled) setIsVisible(false);
        if (onVisibleChange) onVisibleChange(false);
        if (onHide) onHide();
      }, hideDelay);
    } else {
      if (!isControlled) setIsVisible(false);
      if (onVisibleChange) onVisibleChange(false);
      if (onHide) onHide();
    }
  };

  // Handle trigger events
  const handleMouseEnter = () => {
    if (trigger === 'hover') showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' && !interactive) hideTooltip();
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (visible) hideTooltip();
      else showTooltip();
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') showTooltip();
  };

  const handleBlur = () => {
    if (trigger === 'focus') hideTooltip();
  };

  // Handle tooltip mouse events for interactive tooltips
  const handleTooltipMouseEnter = () => {
    if (interactive && trigger === 'hover') {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    }
  };

  const handleTooltipMouseLeave = () => {
    if (interactive && trigger === 'hover') {
      hideTooltip();
    }
  };

  // Recalculate position on scroll/resize
  useEffect(() => {
    if (visible) {
      const handleReposition = () => calculatePosition();
      window.addEventListener('scroll', handleReposition, true);
      window.addEventListener('resize', handleReposition);
      
      return () => {
        window.removeEventListener('scroll', handleReposition, true);
        window.removeEventListener('resize', handleReposition);
      };
    }
  }, [visible]);

  // Close on escape key
  useEffect(() => {
    if (visible && trigger === 'click') {
      const handleEscape = (e) => {
        if (e.key === 'Escape') hideTooltip();
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [visible, trigger]);

  // Close on outside click
  useEffect(() => {
    if (visible && trigger === 'click') {
      const handleClickOutside = (e) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(e.target) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(e.target)
        ) {
          hideTooltip();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, trigger]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          color: '#991B1B'
        };
      case 'warning':
        return {
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA',
          color: '#92400E'
        };
      case 'success':
        return {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
          color: '#166534'
        };
      case 'info':
        return {
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          color: '#1E40AF'
        };
      default:
        return {};
    }
  };

  // Render tooltip content
  const renderTooltipContent = () => {
    if (typeof content === 'string') {
      return (
        <Typography variant={size === 'sm' ? 'caption' : 'body2'}>
          {content}
        </Typography>
      );
    }
    
    if (title || description || icon || keyboard || footer) {
      return (
        <>
          {(title || icon) && (
            <TooltipHeader>
              {icon && <Icon name={icon} size={14} />}
              {title && (
                <Typography variant="caption" weight="semibold">
                  {title}
                </Typography>
              )}
            </TooltipHeader>
          )}
          
          <TooltipBody>
            {description && (
              <Typography variant={size === 'sm' ? 'caption' : 'body2'}>
                {description}
              </Typography>
            )}
            {content}
          </TooltipBody>
          
          {(keyboard || footer) && (
            <TooltipFooter>
              {footer && <div>{footer}</div>}
              {keyboard && (
                <KeyboardShortcut>
                  {keyboard}
                </KeyboardShortcut>
              )}
            </TooltipFooter>
          )}
        </>
      );
    }
    
    return content;
  };

  // Clone children with event handlers
  const triggerElement = cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ...(children.props || {})
  });

  const tooltipPortal = createPortal(
    <AnimatePresence>
      {visible && (
        <TooltipContent
          ref={tooltipRef}
          className={className}
          placement={actualPlacement}
          size={size}
          maxWidth={maxWidth}
          style={{
            left: position.x,
            top: position.y,
            ...getVariantStyles()
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          initial={{
            opacity: 0,
            scale: 0.95,
            ...(actualPlacement === 'top' && { y: 10 }),
            ...(actualPlacement === 'bottom' && { y: -10 }),
            ...(actualPlacement === 'left' && { x: 10 }),
            ...(actualPlacement === 'right' && { x: -10 })
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            ...(actualPlacement === 'top' && { y: 10 }),
            ...(actualPlacement === 'bottom' && { y: -10 }),
            ...(actualPlacement === 'left' && { x: 10 }),
            ...(actualPlacement === 'right' && { x: -10 })
          }}
          transition={{
            duration: 0.15,
            ease: 'easeOut'
          }}
        >
          {renderTooltipContent()}
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

// HOC for easier usage
export const withTooltip = (Component, tooltipProps) => {
  return (props) => (
    <Tooltip {...tooltipProps}>
      <Component {...props} />
    </Tooltip>
  );
};

export default Tooltip;