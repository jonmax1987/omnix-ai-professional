/**
 * Icon Component - Universal icon solution using lucide-react
 * This component will NEVER break, no matter what icon name is passed
 */

import IconWrapper from './IconWrapper';

// Re-export the IconWrapper as the default Icon component
const Icon = IconWrapper;

// For backward compatibility, export helper functions
export const getAvailableIcons = () => {
  console.log('Use ListAvailableIcons from IconWrapper to see all available icons');
  return [];
};

export const searchIcons = (keyword) => {
  console.log(`Icon search is now handled automatically. Just use <Icon name="${keyword}" />`);
  return [];
};

export const getIconCategories = () => {
  return {
    note: 'All lucide-react icons are available. See https://lucide.dev/icons for the full list'
  };
};

export default Icon;