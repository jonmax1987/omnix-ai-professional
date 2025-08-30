import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import Spinner from './Spinner';

const StyledButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'fullWidth'].includes(prop)
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  padding: ${props => getButtonPadding(props.size, props.theme)};
  font-family: ${props => props.theme?.typography?.fontFamily?.sans?.join(', ') || 'system-ui, -apple-system, sans-serif'};
  font-size: ${props => getButtonFontSize(props.size, props.theme)};
  font-weight: ${props => props.theme?.typography?.fontWeight?.medium || '500'};
  line-height: 1;
  border: none;
  border-radius: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  cursor: pointer;
  transition: all ${props => props.theme?.animation?.duration?.fast || '200ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
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
    outline: 2px solid ${props => props.theme?.colors?.primary?.[500] || '#3b82f6'};
    outline-offset: 2px;
  }
`;

const getButtonPadding = (size, theme) => {
  if (!theme?.spacing) return '0.75rem 1rem';
  
  switch (size) {
    case 'sm':
      return `${theme?.spacing?.[2] || '0.5rem'} ${theme?.spacing?.[3] || '0.75rem'}`;
    case 'lg':
      return `${theme?.spacing?.[4] || '1rem'} ${theme?.spacing?.[6] || '1.5rem'}`;
    default: // md
      return `${theme?.spacing?.[3] || '0.75rem'} ${theme?.spacing?.[4] || '1rem'}`;
  }
};

const getButtonFontSize = (size, theme) => {
  if (!theme?.typography?.fontSize) return '1rem';
  
  switch (size) {
    case 'sm':
      return theme?.typography?.fontSize?.sm || '0.875rem';
    case 'lg':
      return theme?.typography?.fontSize?.lg || '1.125rem';
    default: // md
      return theme?.typography?.fontSize?.base || '1rem';
  }
};

const getButtonVariantStyles = (variant, theme) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme?.colors?.primary?.[600] || '#2563eb'};
        color: ${theme?.colors?.text?.inverse || '#ffffff'};
        
        &:hover:not(:disabled) {
          background-color: ${theme?.colors?.primary?.[700] || '#1d4ed8'};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme?.colors?.primary?.[800] || '#1e40af'};
        }
      `;
      
    case 'secondary':
      return css`
        background-color: ${theme?.colors?.background?.elevated || '#f8fafc'};
        color: ${theme?.colors?.text?.primary || '#0f172a'};
        border: 1px solid ${theme?.colors?.border?.default || '#e2e8f0'};
        
        &:hover:not(:disabled) {
          background-color: ${theme?.colors?.background?.secondary || '#f1f5f9'};
          border-color: ${theme?.colors?.border?.strong || '#cbd5e1'};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme?.colors?.gray?.[100] || '#f1f5f9'};
        }
      `;
      
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${theme?.colors?.text?.secondary || '#475569'};
        
        &:hover:not(:disabled) {
          background-color: ${theme?.colors?.background?.secondary || '#f1f5f9'};
          color: ${theme?.colors?.text?.primary || '#0f172a'};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme?.colors?.gray?.[100] || '#f1f5f9'};
        }
      `;
      
    case 'danger':
      return css`
        background-color: ${theme?.colors?.red?.[600] || '#dc2626'};
        color: ${theme?.colors?.text?.inverse || '#ffffff'};
        
        &:hover:not(:disabled) {
          background-color: ${theme?.colors?.red?.[700] || '#b91c1c'};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme?.colors?.red?.[800] || '#991b1b'};
        }
      `;
      
    case 'success':
      return css`
        background-color: ${theme?.colors?.green?.[600] || '#059669'};
        color: ${theme?.colors?.text?.inverse || '#ffffff'};
        
        &:hover:not(:disabled) {
          background-color: ${theme?.colors?.green?.[700] || '#047857'};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme?.colors?.green?.[800] || '#065f46'};
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