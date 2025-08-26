import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import Input from '../atoms/Input';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';

const FieldContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['inline'].includes(prop),
})`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  width: 100%;
  
  ${props => props.inline && css`
    flex-direction: row;
    align-items: flex-start;
    gap: ${props.theme.spacing[4]};
  `}
`;

const LabelContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['inline'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  ${props => props.inline && css`
    min-width: 120px;
    flex-shrink: 0;
  `}
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  ${props => props.disabled && css`
    opacity: 0.5;
  `}
`;

const RequiredIndicator = styled.span`
  color: ${props => props.theme.colors.red[500]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const OptionalIndicator = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const InputContainer = styled.div`
  position: relative;
  flex: 1;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PrefixContainer = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  color: ${props => props.theme.colors.text.tertiary};
  pointer-events: none;
`;

const SuffixContainer = styled.div`
  position: absolute;
  right: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  color: ${props => props.theme.colors.text.tertiary};
`;

const StyledInput = styled(Input)`
  ${props => props.hasPrefix && css`
    padding-left: ${props.theme.spacing[10]};
  `}
  
  ${props => props.hasSuffix && css`
    padding-right: ${props.theme.spacing[10]};
  `}
`;

const TextArea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => !['error'].includes(prop),
})`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  line-height: 1.5;
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  resize: vertical;
  min-height: 80px;
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
`;

const Select = styled.select.withConfig({
  shouldForwardProp: (prop) => !['error'].includes(prop),
})`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  line-height: 1.5;
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
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
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  ${props => props.disabled && css`
    opacity: 0.5;
  `}
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' }).withConfig({
  shouldForwardProp: (prop) => !['error'].includes(prop),
})`
  width: 18px;
  height: 18px;
  margin-top: 2px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background-color: ${props => props.theme.colors.background.elevated};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:checked {
    background-color: ${props => props.theme.colors.primary[600]};
    border-color: ${props => props.theme.colors.primary[600]};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  ${props => props.error && css`
    border-color: ${props.theme.colors.red[500]};
  `}
`;

const CheckboxLabel = styled.div`
  flex: 1;
  line-height: 1.4;
`;

const HelpText = styled(motion.div)`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const ErrorText = styled(motion.div)`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.red[600]};
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const CharacterCount = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOverLimit'].includes(prop)
})`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.isOverLimit ? props.theme.colors.red[600] : props.theme.colors.text.tertiary};
  text-align: right;
  margin-top: ${props => props.theme.spacing[1]};
`;

const FormField = forwardRef(({
  type = 'text',
  label,
  name,
  value,
  defaultValue,
  placeholder,
  required = false,
  optional = false,
  disabled = false,
  error,
  helperText,
  prefix,
  suffix,
  options = [],
  rows = 4,
  maxLength,
  showCharacterCount = false,
  inline = false,
  size = 'md',
  onChange,
  onBlur,
  onFocus,
  className,
  children,
  ...props
}, ref) => {
  const hasError = !!error;
  const hasPrefix = !!prefix;
  const hasSuffix = !!suffix;
  
  const currentLength = typeof value === 'string' ? value.length : 0;
  const isOverLimit = maxLength && currentLength > maxLength;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <TextArea
            ref={ref}
            name={name}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            error={hasError}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            {...props}
          />
        );
        
      case 'select':
        return (
          <Select
            ref={ref}
            name={name}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            error={hasError}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option
                key={option.value || index}
                value={option.value || option}
              >
                {option.label || option}
              </option>
            ))}
          </Select>
        );
        
      case 'checkbox':
        return (
          <CheckboxContainer disabled={disabled}>
            <Checkbox
              ref={ref}
              name={name}
              checked={value}
              defaultChecked={defaultValue}
              disabled={disabled}
              error={hasError}
              onChange={onChange}
              onBlur={onBlur}
              onFocus={onFocus}
              {...props}
            />
            <CheckboxLabel>
              <Typography variant="body2">
                {label}
                {required && <RequiredIndicator> *</RequiredIndicator>}
                {optional && <OptionalIndicator> (optional)</OptionalIndicator>}
              </Typography>
              {children}
            </CheckboxLabel>
          </CheckboxContainer>
        );
        
      default:
        return (
          <InputWrapper>
            {hasPrefix && (
              <PrefixContainer>
                {typeof prefix === 'string' ? (
                  <Typography variant="body2" color="tertiary">
                    {prefix}
                  </Typography>
                ) : (
                  prefix
                )}
              </PrefixContainer>
            )}
            
            <StyledInput
              ref={ref}
              type={type}
              name={name}
              value={value}
              defaultValue={defaultValue}
              placeholder={placeholder}
              size={size}
              disabled={disabled}
              error={error}
              hasPrefix={hasPrefix}
              hasSuffix={hasSuffix}
              maxLength={maxLength}
              onChange={onChange}
              onBlur={onBlur}
              onFocus={onFocus}
              {...props}
            />
            
            {hasSuffix && (
              <SuffixContainer>
                {typeof suffix === 'string' ? (
                  <Typography variant="body2" color="tertiary">
                    {suffix}
                  </Typography>
                ) : (
                  suffix
                )}
              </SuffixContainer>
            )}
          </InputWrapper>
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <FieldContainer className={className}>
        {renderInput()}
        {hasError && (
          <ErrorText
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Icon name="error" size={16} />
            {error}
          </ErrorText>
        )}
        {helperText && !hasError && (
          <HelpText>{helperText}</HelpText>
        )}
      </FieldContainer>
    );
  }

  return (
    <FieldContainer inline={inline} className={className}>
      {label && (
        <LabelContainer inline={inline}>
          <Label htmlFor={name} disabled={disabled}>
            <Typography variant="subtitle2" weight="medium">
              {label}
            </Typography>
            {required && <RequiredIndicator> *</RequiredIndicator>}
            {optional && <OptionalIndicator> (optional)</OptionalIndicator>}
          </Label>
        </LabelContainer>
      )}
      
      <InputContainer>
        {renderInput()}
        
        {showCharacterCount && maxLength && (
          <CharacterCount isOverLimit={isOverLimit}>
            {currentLength}/{maxLength}
          </CharacterCount>
        )}
        
        {hasError && (
          <ErrorText
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Icon name="error" size={16} />
            {error}
          </ErrorText>
        )}
        
        {helperText && !hasError && (
          <HelpText>{helperText}</HelpText>
        )}
      </InputContainer>
    </FieldContainer>
  );
});

FormField.displayName = 'FormField';

export default FormField;