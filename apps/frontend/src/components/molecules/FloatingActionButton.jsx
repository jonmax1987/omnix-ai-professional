import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, forwardRef } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';

// Animations
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const FABContainer = styled.div`
  position: fixed;
  z-index: 1000;
  
  ${props => {
    switch (props.position) {
      case 'bottom-left':
        return css`
          bottom: ${props.theme.spacing[6]};
          left: ${props.theme.spacing[6]};
        `;
      case 'bottom-center':
        return css`
          bottom: ${props.theme.spacing[6]};
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'top-right':
        return css`
          top: ${props.theme.spacing[6]};
          right: ${props.theme.spacing[6]};
        `;
      case 'top-left':
        return css`
          top: ${props.theme.spacing[6]};
          left: ${props.theme.spacing[6]};
        `;
      case 'center-right':
        return css`
          top: 50%;
          right: ${props.theme.spacing[6]};
          transform: translateY(-50%);
        `;
      case 'center-left':
        return css`
          top: 50%;
          left: ${props.theme.spacing[6]};
          transform: translateY(-50%);
        `;
      default: // bottom-right
        return css`
          bottom: ${props.theme.spacing[6]};
          right: ${props.theme.spacing[6]};
        `;
    }
  }}
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    bottom: ${props => props.theme.spacing[4]};
    right: ${props => props.theme.spacing[4]};
    left: auto;
    top: auto;
    transform: none;
  }
`;

const MainFAB = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => getFABSize(props.size)};
  height: ${props => getFABSize(props.size)};
  border-radius: 50%;
  border: none;
  background: ${props => getFABBackground(props.variant, props.theme)};
  color: ${props => getFABColor(props.variant, props.theme)};
  box-shadow: ${props => props.theme.shadows.lg};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.xl};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  ${props => props.pulse && css`
    animation: ${pulse} 2s infinite;
  `}
  
  ${props => props.disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: ${ripple} 0.6s linear;
    opacity: 0;
  }
  
  &:active::after {
    animation: ${ripple} 0.3s linear;
  }
`;

const FABNotificationBadge = styled(Badge)`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  font-size: 10px;
  pointer-events: none;
`;

const ActionsMenu = styled(motion.div)`
  position: absolute;
  bottom: calc(100% + ${props => props.theme.spacing[3]});
  right: 0;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  
  ${props => props.direction === 'horizontal' && css`
    bottom: 50%;
    right: calc(100% + ${props.theme.spacing[3]});
    flex-direction: row;
    transform: translateY(50%);
  `}
  
  ${props => props.direction === 'up' && css`
    bottom: calc(100% + ${props.theme.spacing[3]});
    right: 0;
    flex-direction: column-reverse;
  `}
  
  ${props => props.direction === 'down' && css`
    top: calc(100% + ${props.theme.spacing[3]});
    right: 0;
    flex-direction: column;
  `}
  
  ${props => props.direction === 'left' && css`
    bottom: 50%;
    right: calc(100% + ${props.theme.spacing[3]});
    flex-direction: row-reverse;
    transform: translateY(50%);
  `}
  
  ${props => props.direction === 'radial' && css`
    bottom: calc(50% - 100px);
    right: calc(50% - 100px);
    flex-direction: column;
    width: 200px;
    height: 200px;
    justify-content: center;
    align-items: center;
  `}
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[6]};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  white-space: nowrap;
  box-shadow: ${props => props.theme.shadows.md};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  min-height: 40px;
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
    box-shadow: ${props => props.theme.shadows.lg};
    transform: scale(1.02);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  ${props => props.variant === 'primary' && css`
    background: ${props.theme.colors.primary[500]};
    color: ${props.theme.colors.text.inverse};
    border-color: ${props.theme.colors.primary[600]};
    
    &:hover {
      background: ${props.theme.colors.primary[600]};
    }
  `}
  
  ${props => props.variant === 'danger' && css`
    background: ${props.theme.colors.red[500]};
    color: ${props.theme.colors.text.inverse};
    border-color: ${props.theme.colors.red[600]};
    
    &:hover {
      background: ${props.theme.colors.red[600]};
    }
  `}
  
  ${props => props.variant === 'success' && css`
    background: ${props.theme.colors.green[500]};
    color: ${props.theme.colors.text.inverse};
    border-color: ${props.theme.colors.green[600]};
    
    &:hover {
      background: ${props.theme.colors.green[600]};
    }
  `}
`;

const ActionLabel = styled(motion.div)`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  bottom: calc(100% + ${props => props.theme.spacing[2]});
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.gray[800]};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid ${props => props.theme.colors.gray[800]};
  }
`;

const getFABSize = (size) => {
  switch (size) {
    case 'sm':
      return '48px';
    case 'lg':
      return '64px';
    default: // md
      return '56px';
  }
};

const getFABBackground = (variant, theme) => {
  switch (variant) {
    case 'secondary':
      return theme.colors.background.elevated;
    case 'danger':
      return theme.colors.red[500];
    case 'success':
      return theme.colors.green[500];
    case 'warning':
      return theme.colors.yellow[500];
    default: // primary
      return `linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[600]})`;
  }
};

const getFABColor = (variant, theme) => {
  switch (variant) {
    case 'secondary':
      return theme.colors.text.primary;
    default:
      return theme.colors.text.inverse;
  }
};

const FloatingActionButton = forwardRef(({
  icon = 'plus',
  actions = [],
  variant = 'primary',
  size = 'md',
  position = 'bottom-right',
  direction = 'up',
  badge,
  tooltip,
  pulse = false,
  disabled = false,
  showBackdrop = true,
  onClick,
  onActionClick,
  className,
  children,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef(null);
  const fabRef = useRef(null);

  const hasActions = actions.length > 0;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMainClick = () => {
    if (hasActions) {
      setIsOpen(!isOpen);
    } else {
      onClick?.();
    }
  };

  const handleActionClick = (action, index) => {
    if (action.onClick) {
      action.onClick(action, index);
    } else if (onActionClick) {
      onActionClick(action, index);
    }
    setIsOpen(false);
  };

  const defaultActions = [
    { id: 'add-product', label: 'Add Product', icon: 'plus', variant: 'primary' },
    { id: 'scan-inventory', label: 'Scan Inventory', icon: 'scan' },
    { id: 'generate-report', label: 'Generate Report', icon: 'fileText' },
    { id: 'send-notification', label: 'Send Alert', icon: 'bell', variant: 'warning' }
  ];

  const currentActions = actions.length > 0 ? actions : (hasActions ? defaultActions : []);

  const containerVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    }
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 10
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 10,
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1
      }
    }
  };

  const actionVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.8 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.8 }
  };

  return (
    <FABContainer
      ref={containerRef}
      position={position}
      className={className}
      {...props}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative' }}
      >
        <MainFAB
          ref={fabRef}
          variant={variant}
          size={size}
          pulse={pulse}
          disabled={disabled}
          onClick={handleMainClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen && hasActions ? 45 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Icon name={icon} size={size === 'sm' ? 18 : size === 'lg' ? 28 : 24} />
          </motion.div>
          
          {badge && (
            <FABNotificationBadge variant={badge.variant || 'count'}>
              {badge.content || badge}
            </FABNotificationBadge>
          )}
        </MainFAB>

        <AnimatePresence>
          {tooltip && showTooltip && !isOpen && (
            <Tooltip
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              {tooltip}
            </Tooltip>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && hasActions && (
            <>
              {showBackdrop && (
                <Backdrop
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsOpen(false)}
                />
              )}
              
              <ActionsMenu
                direction={direction}
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {currentActions.map((action, index) => (
                  <ActionButton
                    key={action.id || index}
                    variant={action.variant}
                    onClick={() => handleActionClick(action, index)}
                    disabled={action.disabled}
                    variants={actionVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {action.icon && (
                      <Icon name={action.icon} size={16} />
                    )}
                    <ActionLabel>
                      {action.label}
                    </ActionLabel>
                    {action.badge && (
                      <Badge variant={action.badge.variant || 'count'} size="sm">
                        {action.badge.content || action.badge}
                      </Badge>
                    )}
                  </ActionButton>
                ))}
              </ActionsMenu>
            </>
          )}
        </AnimatePresence>
      </motion.div>
      
      {children}
    </FABContainer>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;