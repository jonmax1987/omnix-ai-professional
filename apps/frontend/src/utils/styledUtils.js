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
 * Helper function to create filtered styled components
 * Usage: const StyledDiv = filteredStyled.div`...`
 */
export const filteredStyled = new Proxy({}, {
  get(target, element) {
    if (typeof element === 'string') {
      const styled = require('styled-components').default;
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

export default {
  shouldForwardProp,
  createStyledComponent,
  withStyledConfig,
  filteredStyled,
  buttonPropFilter,
  inputPropFilter,
  cardPropFilter,
  layoutPropFilter
};