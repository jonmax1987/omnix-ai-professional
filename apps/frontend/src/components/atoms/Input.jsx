import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useState, forwardRef } from 'react';

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled(motion.input).withConfig({
  shouldForwardProp: (prop) => !['size', 'error', 'success'].includes(prop)
})`
  width: 100%;
  padding: ${props => getInputPadding(props.size, props.theme)};
  font-family: ${props => props.theme?.typography?.fontFamily?.sans?.join(', ') || 'Inter, system-ui, sans-serif'};
  font-size: ${props => getInputFontSize(props.size, props.theme)};
  font-weight: ${props => props.theme?.typography?.fontWeight?.normal || 400};
  line-height: 1.5;
  color: ${props => props.theme?.colors?.text?.primary || '#0f172a'};
  background-color: ${props => props.theme?.colors?.background?.elevated || '#f8fafc'};
  border: 1px solid ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
  border-radius: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  transition: all ${props => props.theme?.animation?.duration?.fast || '200ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
  
  &::placeholder {
    color: ${props => props.theme?.colors?.text?.tertiary || '#64748b'};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary?.[500] || '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.theme?.colors?.primary?.[100] || 'rgba(59, 130, 246, 0.1)'};
  }
  
  &:hover:not(:disabled):not(:focus) {
    border-color: ${props => props.theme?.colors?.border?.strong || '#cbd5e1'};
  }
  
  &:disabled {
    background-color: ${props => props.theme?.colors?.gray?.[100] || '#f1f5f9'};
    color: ${props => props.theme?.colors?.text?.tertiary || '#64748b'};
    cursor: not-allowed;
  }
  
  ${props => props.error && css`
    border-color: ${props.theme?.colors?.red?.[500] || '#ef4444'};
    
    &:focus {
      border-color: ${props.theme?.colors?.red?.[500] || '#ef4444'};
      box-shadow: 0 0 0 3px ${props.theme?.colors?.red?.[100] || 'rgba(239, 68, 68, 0.1)'};
    }
  `}
  
  ${props => props.success && css`
    border-color: ${props.theme?.colors?.green?.[500] || '#10b981'};
    
    &:focus {
      border-color: ${props.theme?.colors?.green?.[500] || '#10b981'};
      box-shadow: 0 0 0 3px ${props.theme?.colors?.green?.[100] || 'rgba(16, 185, 129, 0.1)'};
    }
  `}
`;

const ErrorText = styled(motion.div)`
  margin-top: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${props => props.theme?.colors?.red?.[600] || '#dc2626'};
  line-height: 1.4;
`;

const HelperText = styled.div`
  margin-top: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${props => props.theme?.colors?.text?.secondary || '#475569'};
  line-height: 1.4;
`;

const getInputPadding = (size, theme) => {
  switch (size) {
    case 'sm':
      return `${theme?.spacing?.[2] || '0.5rem'} ${theme?.spacing?.[3] || '0.75rem'}`;
    case 'lg':
      return `${theme?.spacing?.[4] || '1rem'} ${theme?.spacing?.[4] || '1rem'}`;
    default: // md
      return `${theme?.spacing?.[3] || '0.75rem'} ${theme?.spacing?.[4] || '1rem'}`;
  }
};

const getInputFontSize = (size, theme) => {
  switch (size) {
    case 'sm':
      return theme?.typography?.fontSize?.sm || '0.875rem';
    case 'lg':
      return theme?.typography?.fontSize?.lg || '1.125rem';
    default: // md
      return theme?.typography?.fontSize?.base || '1rem';
  }
};

const Input = forwardRef(({
  type = 'text',
  size = 'md',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  error,
  success = false,
  helperText,
  min,
  max,
  step,
  pattern,
  required = false,
  className,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    if (type === 'number') {
      const numValue = e.target.value === '' ? '' : Number(e.target.value);
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: numValue
        }
      };
      onChange?.(syntheticEvent);
    } else {
      onChange?.(e);
    }
  };

  const inputProps = {
    type,
    size,
    placeholder,
    value,
    defaultValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    disabled,
    error: !!error,
    success: success && !error,
    required,
    className,
    ref,
    ...props
  };

  if (type === 'number') {
    if (min !== undefined) inputProps.min = min;
    if (max !== undefined) inputProps.max = max;
    if (step !== undefined) inputProps.step = step;
  }

  if (pattern) inputProps.pattern = pattern;

  return (
    <InputContainer>
      <StyledInput
        {...inputProps}
        initial={false}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut'
        }}
      />
      {error && (
        <ErrorText
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </ErrorText>
      )}
      {helperText && !error && (
        <HelperText>
          {helperText}
        </HelperText>
      )}
    </InputContainer>
  );
});

Input.displayName = 'Input';

export default Input;