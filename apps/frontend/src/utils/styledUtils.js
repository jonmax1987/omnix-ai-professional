/**
 * Utility functions for styled-components to prevent prop forwarding issues
 */

// List of props that should NOT be forwarded to DOM elements
const NON_DOM_PROPS = new Set([
  // Component state props
  'active',
  'selected',
  'disabled',
  'loading',
  'expanded',
  'collapsed',
  'open',
  'closed',
  'visible',
  'hidden',
  'focused',
  'hovered',
  'pressed',
  'checked',
  'indeterminate',
  
  // Visual variant props
  'variant',
  'size',
  'color',
  'theme',
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
  'light',
  'dark',
  
  // Layout props
  'fullWidth',
  'centered',
  'rounded',
  'bordered',
  'shadowed',
  'elevated',
  'outlined',
  'filled',
  'transparent',
  
  // Interaction props
  'clickable',
  'hoverable',
  'draggable',
  'sortable',
  'resizable',
  'selectable',
  'editable',
  
  // Animation props
  'animated',
  'duration',
  'delay',
  'easing',
  'direction',
  'iteration',
  
  // Custom component props
  'isLoading',
  'isSelected',
  'isActive',
  'isDisabled',
  'isVisible',
  'isExpanded',
  'isCollapsed',
  'isOpen',
  'isClosed',
  'isFocused',
  'isHovered',
  'isPressed',
  'isChecked',
  
  // Progress and status props
  'progress',
  'status',
  'state',
  'level',
  'priority',
  'severity',
  'position',
  'trend',
  
  // Data props that shouldn't go to DOM
  'data',
  'items',
  'options',
  'choices',
  'values',
  'content',
  
  // Handler props (just in case)
  'onToggle',
  'onSelect',
  'onExpand',
  'onCollapse',
  'onActivate',
  'onDeactivate',
  
  // Icon and image props
  'icon',
  'iconSize',
  'iconColor',
  'iconPosition',
  'image',
  'imageSize',
  'imageFit',
  
  // Typography props
  'weight',
  'align',
  'transform',
  'decoration',
  'family',
  
  // Spacing props
  'margin',
  'padding',
  'gap',
  'spacing',
  
  // Grid and flex props
  'columns',
  'rows',
  'span',
  'order',
  'grow',
  'shrink',
  'basis',
  'wrap',
  'direction',
  'justify',
  'align',
  'content',
  
  // Chart and data visualization props
  'data',
  'labels',
  'datasets',
  'xAxis',
  'yAxis',
  'legend',
  'tooltip',
  
  // Form props
  'required',
  'invalid',
  'valid',
  'touched',
  'dirty',
  'pristine',
  'submitted',
  
  // Navigation props
  'current',
  'previous',
  'next',
  'first',
  'last',
  'breadcrumb',
  
  // Modal and overlay props
  'modal',
  'overlay',
  'backdrop',
  'centered',
  'fullscreen',
  
  // Table props
  'sortable',
  'filterable',
  'paginated',
  'striped',
  'bordered',
  'hoverable',
  'compact',
  
  // Card props
  'elevated',
  'outlined',
  'interactive',
  'media',
  'header',
  'footer',
  
  // Button props
  'loading',
  'disabled',
  'active',
  'pressed',
  'icon',
  'iconOnly',
  'fullWidth',
  
  // Input props (additional to HTML)
  'error',
  'success',
  'warning',
  'helper',
  'label',
  'prefix',
  'suffix',
  
  // Badge and tag props
  'count',
  'max',
  'dot',
  'pulse',
  'outline',
  'removable',
  
  // Progress props
  'value',
  'max',
  'indeterminate',
  'striped',
  'animated',
  
  // Notification props
  'type',
  'timeout',
  'persistent',
  'closable',
  'actions',
  
  // Calendar and date props
  'selected',
  'disabled',
  'highlighted',
  'range',
  'multiple',
  
  // Shopping and e-commerce props
  'price',
  'discount',
  'sale',
  'featured',
  'outOfStock',
  'inCart',
  'wishlist',
  
  // OMNIX-specific props
  'rarity',
  'earned',
  'gradient',
  'category',
  'type',
  'rank',
  'score',
  'savings',
  'bundled',
  'recommended',
  'trending',
  'new',
  'popular',
  'premium',
  'free',
  
  // Additional common non-DOM props
  'show',
  'hide',
  'toggle',
  'flip',
  'rotate',
  'scale',
  'fade',
  'slide',
  'bounce',
  'pulse'
]);

/**
 * Base prop filter function - does not call defaultValidatorFn to avoid recursion
 */
export const baseShouldForwardProp = (prop) => {
  // Don't forward props in our blacklist
  if (NON_DOM_PROPS.has(prop)) {
    return false;
  }
  
  // Don't forward props that start with '$' (transient props)
  if (prop.startsWith('$')) {
    return false;
  }
  
  // Don't forward props that start with 'is' or 'has' (boolean state props)
  if (prop.startsWith('is') || prop.startsWith('has')) {
    return false;
  }
  
  // Don't forward props that end with 'Color', 'Size', 'Width', 'Height' (style props)
  if (prop.endsWith('Color') || prop.endsWith('Size') || prop.endsWith('Width') || prop.endsWith('Height')) {
    return false;
  }
  
  return true;
};

/**
 * Universal shouldForwardProp function that filters out non-DOM props
 */
export const shouldForwardProp = (prop, defaultValidatorFn) => {
  // First check our base filters
  if (!baseShouldForwardProp(prop)) {
    return false;
  }
  
  // Use the default validator for everything else
  return typeof defaultValidatorFn === 'function' ? defaultValidatorFn(prop) : true;
};

/**
 * Create a styled component with automatic prop filtering
 * This is a wrapper around styled that automatically applies shouldForwardProp
 */
export const createStyledComponent = (element) => {
  return element.withConfig({
    shouldForwardProp
  });
};

/**
 * Common withConfig for styled components
 * Use this for any styled component that receives custom props
 */
export const withStyledConfig = {
  shouldForwardProp
};

/**
 * Helper to create a styled component with specific props filtered
 * Usage: const Button = styledWithProps('button', ['isActive', 'isLoading'])`...styles...`
 */
export const styledWithProps = (element, propsToFilter = []) => {
  const component = typeof element === 'string' ? styled[element] : styled(element);
  return component.withConfig({
    shouldForwardProp: (prop) => {
      // Filter out specific props
      if (propsToFilter.includes(prop)) return false;
      // Use default filtering
      return shouldForwardProp(prop);
    }
  });
};

/**
 * Helper function to create filtered styled components
 * Usage: const StyledDiv = filteredStyled.div`...`
 */
import styled, { css } from 'styled-components';

export const filteredStyled = new Proxy({}, {
  get(target, element) {
    if (typeof element === 'string') {
      return styled[element].withConfig({ shouldForwardProp });
    }
    return undefined;
  }
});

/**
 * Specific prop filters for common use cases
 */

// For button-like components
export const buttonPropFilter = (prop) => {
  const buttonProps = ['variant', 'size', 'disabled', 'loading', 'active', 'fullWidth', 'outlined', 'icon'];
  return !buttonProps.includes(prop) && shouldForwardProp(prop);
};

// For input-like components  
export const inputPropFilter = (prop) => {
  const inputProps = ['error', 'success', 'warning', 'size', 'variant', 'fullWidth'];
  return !inputProps.includes(prop) && shouldForwardProp(prop);
};

// For card-like components
export const cardPropFilter = (prop) => {
  const cardProps = ['elevated', 'outlined', 'interactive', 'selected', 'active'];
  return !cardProps.includes(prop) && shouldForwardProp(prop);
};

// For layout components
export const layoutPropFilter = (prop) => {
  const layoutProps = ['direction', 'align', 'justify', 'wrap', 'gap', 'columns', 'rows'];
  return !layoutProps.includes(prop) && shouldForwardProp(prop);
};

/**
 * Safe theme getter with fallback to default theme
 * Prevents "Cannot read properties of undefined" errors
 */
import { lightTheme } from '../styles/theme';

export const getThemeValue = (path, fallback) => (props) => {
  const theme = props.theme || lightTheme;
  const keys = path.split('.');
  
  let value = theme;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return fallback || '';
    }
  }
  
  return value || fallback || '';
};

/**
 * Safe spacing getter
 */
export const spacing = (size) => (props) => {
  const theme = props.theme || lightTheme;
  return theme?.spacing?.[size] || theme?.spacing?.[4] || '1rem';
};

/**
 * Safe typography getter
 */
export const fontSize = (size) => (props) => {
  const theme = props.theme || lightTheme;
  return theme?.typography?.sizes?.[size] || theme?.typography?.fontSize?.[size] || theme?.typography?.fontSize?.base || '1rem';
};

/**
 * Safe font weight getter
 */
export const fontWeight = (weight) => (props) => {
  const theme = props.theme || lightTheme;
  return theme?.typography?.weights?.[weight] || theme?.typography?.fontWeight?.[weight] || theme?.typography?.fontWeight?.normal || 400;
};

/**
 * Safe color getter
 */
export const color = (path) => (props) => {
  const theme = props.theme || lightTheme;
  const keys = path.split('.');
  
  let value = theme?.colors;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      // Default fallbacks for common color paths
      if (path.includes('text.primary')) return '#0f172a';
      if (path.includes('text.secondary')) return '#475569';
      if (path.includes('background')) return '#ffffff';
      if (path.includes('border')) return '#e2e8f0';
      return '#000000';
    }
  }
  
  return value || '#000000';
};

/**
 * Safe shadow getter
 */
export const shadow = (size) => (props) => {
  const theme = props.theme || lightTheme;
  return theme?.shadows?.[size] || theme?.shadow?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)';
};

/**
 * Safe border radius getter
 */
export const borderRadius = (size) => (props) => {
  const theme = props.theme || lightTheme;
  return theme?.borderRadius?.[size] || theme?.border?.radius?.md || '0.375rem';
};

/**
 * Theme validation utilities to prevent unsafe theme access
 * Use these in development to catch unsafe theme property access
 */

// Development-only theme proxy that warns on unsafe access
export const createThemeValidator = (theme) => {
  if (process.env.NODE_ENV !== 'development') {
    return theme;
  }
  
  const createProxy = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    return new Proxy(obj, {
      get(target, prop) {
        // Skip React internal symbols and properties
        if (typeof prop === 'symbol' || 
            String(prop).startsWith('$$') || 
            String(prop).startsWith('__') ||
            String(prop) === 'valueOf' ||
            String(prop) === 'toString' ||
            String(prop) === 'constructor') {
          return target[prop];
        }
        
        const newPath = path ? `${path}.${String(prop)}` : String(prop);
        const value = target[prop];
        
        // If accessing a nested object, wrap it in a proxy too
        if (typeof value === 'object' && value !== null) {
          return createProxy(value, newPath);
        }
        
        // If undefined, log a warning (but not for React internals)
        if (value === undefined) {
          console.warn(`🎨 Theme Warning: Accessing undefined theme property "${newPath}". Consider using optional chaining and fallback values.`);
        }
        
        return value;
      }
    });
  };
  
  return createProxy(theme);
};

/**
 * Comprehensive theme path validator
 * Returns safe value or fallback with optional warning
 */
export const getThemePath = (theme, path, fallback = '', warn = true) => {
  if (!theme) {
    if (warn && process.env.NODE_ENV === 'development') {
      console.warn(`🎨 Theme Warning: No theme provided for path "${path}"`);
    }
    return fallback;
  }
  
  const keys = path.split('.');
  let current = theme;
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      if (warn && process.env.NODE_ENV === 'development') {
        const attemptedPath = keys.slice(0, i + 1).join('.');
        console.warn(`🎨 Theme Warning: Path "${attemptedPath}" not found in theme. Using fallback: "${fallback}"`);
      }
      return fallback;
    }
  }
  
  return current || fallback;
};

/**
 * Safe theme accessor with multiple fallback levels
 * Example: safeTheme(props, 'colors.primary.500', 'colors.primary.main', '#3b82f6')
 */
export const safeTheme = (props, ...paths) => {
  const theme = props.theme || lightTheme;
  
  // Try each path in order, return the first valid value
  for (let i = 0; i < paths.length - 1; i++) {
    const value = getThemePath(theme, paths[i], undefined, false);
    if (value !== undefined) {
      return value;
    }
  }
  
  // Return the final fallback value
  return paths[paths.length - 1];
};

/**
 * Validate entire theme structure against expected schema
 */
export const validateThemeStructure = (theme) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const requiredPaths = [
    'colors.primary.500',
    'colors.text.primary',
    'colors.text.secondary',
    'colors.background.primary',
    'colors.border.light',
    'spacing.xs',
    'spacing.sm',
    'spacing.md',
    'spacing.lg',
    'spacing.xl',
    'typography.fontSize.xs',
    'typography.fontSize.sm',
    'typography.fontSize.base',
    'typography.fontSize.lg',
    'typography.fontSize.xl',
    'typography.fontWeight.normal',
    'typography.fontWeight.medium',
    'typography.fontWeight.bold',
    'breakpoints.sm',
    'breakpoints.md',
    'breakpoints.lg',
    'shadows.sm',
    'shadows.md',
    'shadows.lg'
  ];
  
  const missing = [];
  
  requiredPaths.forEach(path => {
    if (getThemePath(theme, path, undefined, false) === undefined) {
      missing.push(path);
    }
  });
  
  if (missing.length > 0) {
    console.warn('🎨 Theme Structure Warning: Missing required theme paths:', missing);
  }
  
  console.log('🎨 Theme validation complete. Missing paths:', missing.length);
};

export default {
  shouldForwardProp,
  createStyledComponent,
  withStyledConfig,
  filteredStyled,
  buttonPropFilter,
  inputPropFilter,
  cardPropFilter,
  layoutPropFilter,
  // Safe theme accessors
  getThemeValue,
  spacing,
  fontSize,
  fontWeight,
  color,
  shadow,
  borderRadius,
  // Theme validation utilities
  createThemeValidator,
  getThemePath,
  safeTheme,
  validateThemeStructure
};