import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import Spinner from './Spinner';

const StyledButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'fullWidth'].includes(prop)
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => getButtonPadding(props.size, props.theme)};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  font-size: ${props => getButtonFontSize(props.size, props.theme)};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  line-height: 1;
  border: none;
  border-radius: ${props => props.theme.spacing[2]};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  
  ${props => getButtonVariantStyles(props.variant, props.theme)}
  ${props => props.fullWidth && css`width: 100%;`}
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const getButtonPadding = (size, theme) => {
  switch (size) {
    case 'sm':
      return `${theme.spacing[2]} ${theme.spacing[3]}`;
    case 'lg':
      return `${theme.spacing[4]} ${theme.spacing[6]}`;
    default: // md
      return `${theme.spacing[3]} ${theme.spacing[4]}`;
  }
};

const getButtonFontSize = (size, theme) => {
  switch (size) {
    case 'sm':
      return theme.typography.fontSize.sm;
    case 'lg':
      return theme.typography.fontSize.lg;
    default: // md
      return theme.typography.fontSize.base;
  }
};

const getButtonVariantStyles = (variant, theme) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.colors.primary[600]};
        color: ${theme.colors.text.inverse};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary[700]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.primary[800]};
        }
      `;
      
    case 'secondary':
      return css`
        background-color: ${theme.colors.background.elevated};
        color: ${theme.colors.text.primary};
        border: 1px solid ${theme.colors.border.default};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.background.secondary};
          border-color: ${theme.colors.border.strong};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.gray[100]};
        }
      `;
      
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${theme.colors.text.secondary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.background.secondary};
          color: ${theme.colors.text.primary};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.gray[100]};
        }
      `;
      
    case 'danger':
      return css`
        background-color: ${theme.colors.red[600]};
        color: ${theme.colors.text.inverse};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.red[700]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.red[800]};
        }
      `;
      
    case 'success':
      return css`
        background-color: ${theme.colors.green[600]};
        color: ${theme.colors.text.inverse};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.green[700]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.green[800]};
        }
      `;
      
    default:
      return getButtonVariantStyles('primary', theme);
  }
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={isDisabled}
      onClick={onClick}
      className={className}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      {...props}
    >
      {loading && <Spinner size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />}
      {children}
    </StyledButton>
  );
};

export default Button;