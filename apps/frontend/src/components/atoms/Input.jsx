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
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  font-size: ${props => getInputFontSize(props.size, props.theme)};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  line-height: 1.5;
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
  
  &:hover:not(:disabled):not(:focus) {
    border-color: ${props => props.theme.colors.border.strong};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.text.tertiary};
    cursor: not-allowed;
  }
  
  ${props => props.error && css`
    border-color: ${props.theme.colors.red[500]};
    
    &:focus {
      border-color: ${props.theme.colors.red[500]};
      box-shadow: 0 0 0 3px ${props.theme.colors.red[100]};
    }
  `}
  
  ${props => props.success && css`
    border-color: ${props.theme.colors.green[500]};
    
    &:focus {
      border-color: ${props.theme.colors.green[500]};
      box-shadow: 0 0 0 3px ${props.theme.colors.green[100]};
    }
  `}
`;

const ErrorText = styled(motion.div)`
  margin-top: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.red[600]};
  line-height: 1.4;
`;

const HelperText = styled.div`
  margin-top: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const getInputPadding = (size, theme) => {
  switch (size) {
    case 'sm':
      return `${theme.spacing[2]} ${theme.spacing[3]}`;
    case 'lg':
      return `${theme.spacing[4]} ${theme.spacing[4]}`;
    default: // md
      return `${theme.spacing[3]} ${theme.spacing[4]}`;
  }
};

const getInputFontSize = (size, theme) => {
  switch (size) {
    case 'sm':
      return theme.typography.fontSize.sm;
    case 'lg':
      return theme.typography.fontSize.lg;
    default: // md
      return theme.typography.fontSize.base;
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