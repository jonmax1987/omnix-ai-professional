import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const StyledBadge = styled(motion.span).withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'dot', 'pulse', 'uppercase'].includes(prop)
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  padding: ${props => getBadgePadding(props.size, props.theme)};
  font-family: ${props => props.theme?.typography?.fontFamily?.sans?.join(', ') || 'Inter, system-ui, sans-serif'};
  font-size: ${props => getBadgeFontSize(props.size, props.theme)};
  font-weight: ${props => props.theme?.typography?.fontWeight?.medium || 500};
  line-height: 1;
  border-radius: ${props => getBadgeRadius(props.size, props.theme)};
  white-space: nowrap;
  text-transform: ${props => props.uppercase ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.uppercase ? '0.05em' : 'normal'};
  
  ${props => getBadgeVariantStyles(props.variant, props.theme)}
  
  ${props => props.dot && css`
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      right: -2px;
      width: 6px;
      height: 6px;
      background-color: ${props.theme.colors.red[500]};
      border-radius: 50%;
      border: 1px solid ${props.theme.colors.background.elevated};
    }
  `}
  
  ${props => props.pulse && css`
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `}
`;

const BadgeIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size === 'sm' ? '12px' : '16px'};
  height: ${props => props.size === 'sm' ? '12px' : '16px'};
`;

const getBadgePadding = (size, theme) => {
  switch (size) {
    case 'sm':
      return `${theme.spacing[1]} ${theme.spacing[2]}`;
    case 'lg':
      return `${theme.spacing[2]} ${theme.spacing[3]}`;
    default: // md
      return `${theme.spacing[1]} ${theme.spacing[3]}`;
  }
};

const getBadgeFontSize = (size, theme) => {
  switch (size) {
    case 'sm':
      return theme.typography.fontSize.xs;
    case 'lg':
      return theme.typography.fontSize.sm;
    default: // md
      return theme.typography.fontSize.xs;
  }
};

const getBadgeRadius = (size, theme) => {
  switch (size) {
    case 'sm':
      return theme.spacing[1];
    case 'lg':
      return theme.spacing[2];
    default: // md
      return `${theme.spacing[1]}`;
  }
};

const getBadgeVariantStyles = (variant, theme) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.colors.primary[100]};
        color: ${theme.colors.primary[800]};
        border: 1px solid ${theme.colors.primary[200]};
      `;
      
    case 'secondary':
      return css`
        background-color: ${theme.colors.gray[100]};
        color: ${theme.colors.gray[800]};
        border: 1px solid ${theme.colors.gray[200]};
      `;
      
    case 'success':
      return css`
        background-color: ${theme.colors.green[100]};
        color: ${theme.colors.green[800]};
        border: 1px solid ${theme.colors.green[200]};
      `;
      
    case 'warning':
      return css`
        background-color: ${theme.colors.yellow[100]};
        color: ${theme.colors.yellow[800]};
        border: 1px solid ${theme.colors.yellow[200]};
      `;
      
    case 'error':
      return css`
        background-color: ${theme.colors.red[100]};
        color: ${theme.colors.red[800]};
        border: 1px solid ${theme.colors.red[200]};
      `;
      
    case 'info':
      return css`
        background-color: ${theme.colors.primary[50]};
        color: ${theme.colors.primary[700]};
        border: 1px solid ${theme.colors.primary[100]};
      `;
      
    case 'solid-primary':
      return css`
        background-color: ${theme.colors.primary[600]};
        color: ${theme.colors.text.inverse};
        border: 1px solid transparent;
      `;
      
    case 'solid-success':
      return css`
        background-color: ${theme.colors.green[600]};
        color: ${theme.colors.text.inverse};
        border: 1px solid transparent;
      `;
      
    case 'solid-warning':
      return css`
        background-color: ${theme.colors.yellow[600]};
        color: ${theme.colors.text.inverse};
        border: 1px solid transparent;
      `;
      
    case 'solid-error':
      return css`
        background-color: ${theme.colors.red[600]};
        color: ${theme.colors.text.inverse};
        border: 1px solid transparent;
      `;
      
    case 'outline':
      return css`
        background-color: transparent;
        color: ${theme.colors.text.primary};
        border: 1px solid ${theme.colors.border.default};
      `;
      
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${theme.colors.text.secondary};
        border: 1px solid transparent;
      `;
      
    case 'count':
      return css`
        background-color: ${theme.colors.red[500]};
        color: ${theme.colors.text.inverse};
        border: 1px solid transparent;
        border-radius: 50%;
        min-width: 20px;
        height: 20px;
        padding: 0;
        font-size: ${theme.typography.fontSize.xs};
        font-weight: ${theme.typography.fontWeight.semibold};
      `;
      
    default:
      return getBadgeVariantStyles('secondary', theme);
  }
};

const Badge = ({
  children,
  variant = 'secondary',
  size = 'md',
  dot = false,
  pulse = false,
  uppercase = false,
  icon,
  className,
  ...props
}) => {
  return (
    <StyledBadge
      variant={variant}
      size={size}
      dot={dot}
      pulse={pulse}
      uppercase={uppercase}
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {icon && (
        <BadgeIcon size={size}>
          {icon}
        </BadgeIcon>
      )}
      {children}
    </StyledBadge>
  );
};

export default Badge;