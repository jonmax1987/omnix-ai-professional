import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';

const NavLink = styled(motion.a).withConfig({
  shouldForwardProp: (prop) => !['active', 'disabled', 'size', 'variant', 'whileHover', 'whileTap', 'initial', 'animate', 'exit', 'transition'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => getNavPadding(props.size, props.theme)};
  border-radius: ${props => props.theme.spacing[2]};
  text-decoration: none;
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  position: relative;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
    color: ${props => props.theme.colors.text.primary};
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  ${props => props.active && css`
    background-color: ${props.theme.colors.primary[100]};
    color: ${props.theme.colors.primary[700]};
    font-weight: ${props.theme.typography.fontWeight.medium};
    
    &:hover {
      background-color: ${props.theme.colors.primary[100]};
      color: ${props.theme.colors.primary[700]};
    }
  `}
  
  ${props => props.disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
  
  ${props => props.variant === 'compact' && css`
    padding: ${props.theme.spacing[2]};
    border-radius: ${props.theme.spacing[1]};
  `}
  
  ${props => props.variant === 'pill' && css`
    border-radius: ${props.theme.spacing[6]};
    
    ${props.active && css`
      background-color: ${props.theme.colors.primary[600]};
      color: ${props.theme.colors.text.inverse};
      
      &:hover {
        background-color: ${props.theme.colors.primary[700]};
        color: ${props.theme.colors.text.inverse};
      }
    `}
  `}
  
  ${props => props.variant === 'minimal' && css`
    padding: ${props.theme.spacing[2]} 0;
    border-radius: 0;
    border-bottom: 2px solid transparent;
    
    &:hover {
      background-color: transparent;
      border-bottom-color: ${props.theme.colors.border.default};
    }
    
    ${props.active && css`
      background-color: transparent;
      border-bottom-color: ${props.theme.colors.primary[600]};
      color: ${props.theme.colors.primary[700]};
      
      &:hover {
        background-color: transparent;
        border-bottom-color: ${props.theme.colors.primary[600]};
      }
    `}
  `}
`;

const NavIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${props => props.size === 'sm' && css`
    width: 16px;
    height: 16px;
  `}
  
  ${props => props.size === 'md' && css`
    width: 20px;
    height: 20px;
  `}
  
  ${props => props.size === 'lg' && css`
    width: 24px;
    height: 24px;
  `}
`;

const NavContent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['horizontal'].includes(prop),
})`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
  flex: 1;
  min-width: 0;
  
  ${props => props.horizontal && css`
    flex-direction: row;
    align-items: center;
    gap: ${props.theme.spacing[2]};
  `}
`;

const NavLabel = styled.div`
  flex: 1;
  min-width: 0;
`;

const NavDescription = styled.div`
  opacity: 0.8;
`;

const NavBadgeContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: ${props => props.theme.colors.primary[600]};
  border-radius: 0 2px 2px 0;
`;

const getNavPadding = (size, theme) => {
  switch (size) {
    case 'sm':
      return `${theme.spacing[2]} ${theme.spacing[3]}`;
    case 'lg':
      return `${theme.spacing[4]} ${theme.spacing[4]}`;
    default: // md
      return `${theme.spacing[3]} ${theme.spacing[4]}`;
  }
};

const getIconSize = (size) => {
  switch (size) {
    case 'sm':
      return 16;
    case 'lg':
      return 24;
    default: // md
      return 20;
  }
};

const getTextVariant = (size) => {
  switch (size) {
    case 'sm':
      return 'body2';
    case 'lg':
      return 'subtitle1';
    default: // md
      return 'body1';
  }
};

const NavItem = forwardRef(({
  icon,
  label,
  description,
  badge,
  active = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  showActiveIndicator = false,
  href,
  onClick,
  className,
  children,
  as = 'a',
  ...props
}, ref) => {
  const iconSize = getIconSize(size);
  const textVariant = getTextVariant(size);
  const isHorizontal = !description;

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <NavLink
      ref={ref}
      as={as}
      href={href}
      active={active}
      disabled={disabled}
      size={size}
      variant={variant}
      onClick={handleClick}
      className={className}
      whileHover={!disabled ? { x: 2 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      {...props}
    >
      {showActiveIndicator && active && (
        <ActiveIndicator
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      )}
      
      {icon && (
        <NavIconContainer size={size}>
          <Icon name={icon} size={iconSize} />
        </NavIconContainer>
      )}

      <NavContent horizontal={isHorizontal}>
        {label && (
          <NavLabel>
            <Typography 
              variant={textVariant}
              weight={active ? 'medium' : 'normal'}
              truncate
            >
              {label}
            </Typography>
          </NavLabel>
        )}
        
        {description && (
          <NavDescription>
            <Typography variant="caption" color="secondary" truncate>
              {description}
            </Typography>
          </NavDescription>
        )}
        
        {children}
      </NavContent>

      {badge && (
        <NavBadgeContainer>
          {typeof badge === 'object' ? (
            <Badge 
              variant={badge.variant || (active ? 'primary' : 'secondary')} 
              size="sm"
            >
              {badge.content}
            </Badge>
          ) : (
            <Badge 
              variant={active ? 'primary' : 'secondary'} 
              size="sm"
            >
              {badge}
            </Badge>
          )}
        </NavBadgeContainer>
      )}
    </NavLink>
  );
});

NavItem.displayName = 'NavItem';

export default NavItem;