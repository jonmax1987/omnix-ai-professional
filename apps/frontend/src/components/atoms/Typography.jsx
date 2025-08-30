import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const StyledTypography = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['variant', 'color', 'weight', 'align', 'transform', 'truncate', 'noWrap', 'lineHeight', 'letterSpacing', 'gutterBottom'].includes(prop),
})`
  margin: 0;
  padding: 0;
  
  ${props => getTypographyVariantStyles(props.variant, props.theme)}
  
  color: ${props => getTextColor(props.color, props.theme)};
  
  ${props => props.weight && css`
    font-weight: ${props.theme?.typography?.fontWeight?.[props.weight] || props.weight};
  `}
  
  ${props => props.align && css`
    text-align: ${props.align};
  `}
  
  ${props => props.transform && css`
    text-transform: ${props.transform};
  `}
  
  ${props => props.truncate && css`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `}
  
  ${props => props.noWrap && css`
    white-space: nowrap;
  `}
  
  ${props => props.lineHeight && css`
    line-height: ${props.lineHeight};
  `}
  
  ${props => props.letterSpacing && css`
    letter-spacing: ${props.letterSpacing};
  `}
`;

const getTypographyVariantStyles = (variant, theme) => {
  const baseStyles = css`
    font-family: ${theme?.typography?.fontFamily?.sans?.join(', ') || 'Inter, system-ui, sans-serif'};
  `;
  
  switch (variant) {
    case 'h1':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.['4xl'] || '2.25rem'};
        font-weight: ${theme?.typography?.fontWeight?.bold || 700};
        line-height: 1.2;
        letter-spacing: -0.02em;
      `;
      
    case 'h2':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.['3xl'] || '1.875rem'};
        font-weight: ${theme?.typography?.fontWeight?.bold || 700};
        line-height: 1.3;
        letter-spacing: -0.01em;
      `;
      
    case 'h3':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.['2xl'] || '1.5rem'};
        font-weight: ${theme?.typography?.fontWeight?.semibold || 600};
        line-height: 1.4;
      `;
      
    case 'h4':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.xl || '1.25rem'};
        font-weight: ${theme?.typography?.fontWeight?.semibold || 600};
        line-height: 1.4;
      `;
      
    case 'h5':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.lg || '1.125rem'};
        font-weight: ${theme?.typography?.fontWeight?.semibold || 600};
        line-height: 1.5;
      `;
      
    case 'h6':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.base || '1rem'};
        font-weight: ${theme?.typography?.fontWeight?.semibold || 600};
        line-height: 1.5;
      `;
      
    case 'body1':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.base || '1rem'};
        font-weight: ${theme?.typography?.fontWeight?.normal || 400};
        line-height: 1.6;
      `;
      
    case 'body2':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.sm || '0.875rem'};
        font-weight: ${theme?.typography?.fontWeight?.normal || 400};
        line-height: 1.5;
      `;
      
    case 'caption':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.xs || '0.75rem'};
        font-weight: ${theme?.typography?.fontWeight?.normal || 400};
        line-height: 1.4;
        letter-spacing: 0.02em;
      `;
      
    case 'overline':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.xs || '0.75rem'};
        font-weight: ${theme?.typography?.fontWeight?.medium || 500};
        line-height: 1.2;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      `;
      
    case 'subtitle1':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.base || '1rem'};
        font-weight: ${theme?.typography?.fontWeight?.medium || 500};
        line-height: 1.5;
      `;
      
    case 'subtitle2':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.sm || '0.875rem'};
        font-weight: ${theme?.typography?.fontWeight?.medium || 500};
        line-height: 1.4;
      `;
      
    case 'button':
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.sm || '0.875rem'};
        font-weight: ${theme?.typography?.fontWeight?.medium || 500};
        line-height: 1;
        letter-spacing: 0.02em;
      `;
      
    case 'mono':
      return css`
        font-family: ${theme?.typography?.fontFamily?.mono?.join(', ') || 'JetBrains Mono, monospace'};
        font-size: ${theme?.typography?.fontSize?.sm || '0.875rem'};
        font-weight: ${theme?.typography?.fontWeight?.normal || 400};
        line-height: 1.6;
      `;
      
    default:
      return css`
        ${baseStyles}
        font-size: ${theme?.typography?.fontSize?.base || '1rem'};
        font-weight: ${theme?.typography?.fontWeight?.normal || 400};
        line-height: 1.6;
      `;
  }
};

const getTextColor = (color, theme) => {
  if (!color) return theme?.colors?.text?.primary || '#0f172a';
  
  const colorMap = {
    primary: theme?.colors?.text?.primary || '#0f172a',
    secondary: theme?.colors?.text?.secondary || '#475569',
    tertiary: theme?.colors?.text?.tertiary || '#64748b',
    inverse: theme?.colors?.text?.inverse || '#ffffff',
    success: theme?.colors?.status?.success || '#059669',
    warning: theme?.colors?.status?.warning || '#d97706',
    error: theme?.colors?.status?.error || '#dc2626',
    info: theme?.colors?.status?.info || '#2563eb',
    brand: theme?.colors?.primary?.[600] || '#2563eb'
  };
  
  return colorMap[color] || color;
};

const getSemanticElement = (variant) => {
  const headingVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (headingVariants.includes(variant)) {
    return variant;
  }
  
  switch (variant) {
    case 'body1':
    case 'body2':
    case 'subtitle1':
    case 'subtitle2':
      return 'p';
    case 'caption':
    case 'overline':
    case 'button':
      return 'span';
    case 'mono':
      return 'code';
    default:
      return 'div';
  }
};

const Typography = ({
  children,
  variant = 'body1',
  as,
  color,
  weight,
  align,
  transform,
  truncate = false,
  noWrap = false,
  lineHeight,
  letterSpacing,
  className,
  ...props
}) => {
  const component = as || getSemanticElement(variant);
  
  return (
    <StyledTypography
      as={component}
      variant={variant}
      color={color}
      weight={weight}
      align={align}
      transform={transform}
      truncate={truncate}
      noWrap={noWrap}
      lineHeight={lineHeight}
      letterSpacing={letterSpacing}
      className={className}
      {...props}
    >
      {children}
    </StyledTypography>
  );
};

export default Typography;