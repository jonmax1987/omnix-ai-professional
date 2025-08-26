import React from 'react';
import * as LucideIcons from 'lucide-react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { baseShouldForwardProp } from '../../utils/styledUtils';

// Styled wrapper for consistent styling
const IconContainer = styled(motion.span).withConfig({
  shouldForwardProp: (prop) => !['clickable'].includes(prop) && baseShouldForwardProp(prop)
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || 'currentColor'};
  transition: all ${props => props.theme?.animation?.duration?.fast || '0.2s'} ease;
  
  ${props => props.clickable && `
    cursor: pointer;
    
    &:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
  `}
`;

// Helper function to convert icon names to different cases
const normalizeIconName = (name) => {
  if (!name || typeof name !== 'string') return null;
  
  // Remove 'Icon' suffix if present
  let normalized = name.replace(/Icon$/i, '');
  
  // Common name mappings
  const nameMappings = {
    'home': 'Home',
    'dashboard': 'LayoutDashboard',
    'analytics': 'BarChart3',
    'products': 'Package',
    'alerts': 'AlertCircle',
    'settings': 'Settings',
    'plus': 'Plus',
    'minus': 'Minus',
    'edit': 'Edit',
    'delete': 'Trash2',
    'save': 'Save',
    'copy': 'Copy',
    'archive': 'Archive',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'ArrowUpDown',
    'menu': 'Menu',
    'close': 'X',
    'chevronDown': 'ChevronDown',
    'chevronUp': 'ChevronUp',
    'chevronLeft': 'ChevronLeft',
    'chevronRight': 'ChevronRight',
    'chevron-down': 'ChevronDown',
    'chevron-up': 'ChevronUp',
    'chevron-left': 'ChevronLeft',
    'chevron-right': 'ChevronRight',
    'arrowUp': 'ArrowUp',
    'arrowDown': 'ArrowDown',
    'arrowLeft': 'ArrowLeft',
    'arrowRight': 'ArrowRight',
    'arrow-up': 'ArrowUp',
    'arrow-down': 'ArrowDown',
    'arrow-left': 'ArrowLeft',
    'arrow-right': 'ArrowRight',
    'refresh': 'RefreshCw',
    'download': 'Download',
    'upload': 'Upload',
    'trending': 'TrendingUp',
    'trending-up': 'TrendingUp',
    'trending-down': 'TrendingDown',
    'package': 'Package',
    'check': 'Check',
    'checkCircle': 'CheckCircle',
    'check-circle': 'CheckCircle',
    'info': 'Info',
    'warning': 'AlertTriangle',
    'error': 'AlertCircle',
    'bell': 'Bell',
    'user': 'User',
    'users': 'Users',
    'logout': 'LogOut',
    'calendar': 'Calendar',
    'clock': 'Clock',
    'eye': 'Eye',
    'eyeOff': 'EyeOff',
    'eye-off': 'EyeOff',
    'activity': 'Activity',
    'pie-chart': 'PieChart',
    'pieChart': 'PieChart',
    'bar-chart': 'BarChart3',
    'barChart': 'BarChart3',
    'alert-triangle': 'AlertTriangle',
    'alertTriangle': 'AlertTriangle',
    'alert': 'AlertCircle',
    'more-vertical': 'MoreVertical',
    'moreVertical': 'MoreVertical',
    'more-horizontal': 'MoreHorizontal',
    'moreHorizontal': 'MoreHorizontal',
    'grip-vertical': 'GripVertical',
    'gripVertical': 'GripVertical',
    'x': 'X',
    'zap': 'Zap',
    'tag': 'Tag',
    'tags': 'Tags',
    'dollar-sign': 'DollarSign',
    'dollarSign': 'DollarSign',
    'check-square': 'CheckSquare',
    'checkSquare': 'CheckSquare',
    'grid': 'Grid3x3',
    'inbox': 'Inbox',
    'folder': 'Folder',
    'gauge': 'Gauge',
    'image': 'Image',
    'image-off': 'ImageOff',
    'imageOff': 'ImageOff',
    'shopping-cart': 'ShoppingCart',
    'shoppingCart': 'ShoppingCart',
    'cart': 'ShoppingCart',
    'laptop': 'Laptop',
    'shirt': 'Shirt',
    'brain': 'Brain',
    'truck': 'Truck',
    'message-circle': 'MessageCircle',
    'messageCircle': 'MessageCircle',
    'loader': 'Loader',
    'loader-2': 'Loader2',
    'loader2': 'Loader2',
    'loading': 'Loader',
    'spinner': 'Loader',
    'spin': 'Loader',
    'star': 'Star',
    'heart': 'Heart',
    'bookmark': 'Bookmark',
    'share': 'Share',
    'share-2': 'Share2',
    'share2': 'Share2',
    'link': 'Link',
    'external-link': 'ExternalLink',
    'externalLink': 'ExternalLink',
    'file': 'File',
    'file-text': 'FileText',
    'fileText': 'FileText',
    'folder-open': 'FolderOpen',
    'folderOpen': 'FolderOpen',
    'maximize': 'Maximize',
    'minimize': 'Minimize',
    'mail': 'Mail',
    'email': 'Mail',
    'phone': 'Phone',
    'shopping-bag': 'ShoppingBag',
    'shoppingBag': 'ShoppingBag',
    'bag': 'ShoppingBag',
    'credit-card': 'CreditCard',
    'creditCard': 'CreditCard',
    'map-pin': 'MapPin',
    'mapPin': 'MapPin',
    'location': 'MapPin',
    'map': 'Map',
    'sun': 'Sun',
    'moon': 'Moon',
    'gamepad': 'Gamepad2',
    'music': 'Music',
    'heart-pulse': 'HeartPulse',
    'heartPulse': 'HeartPulse',
    'notification': 'Bell',
    'notify': 'Bell',
    'config': 'Settings',
    'gear': 'Settings',
    'cog': 'Settings',
    'preferences': 'Settings',
    'trash': 'Trash2',
    'bin': 'Trash2',
    'remove': 'X',
    'cancel': 'X',
    'profile': 'User',
    'account': 'User',
    'person': 'User',
    'people': 'Users',
    'group': 'Users',
    'team': 'Users',
    'time': 'Clock',
    'schedule': 'Calendar',
    'date': 'Calendar',
    'money': 'DollarSign',
    'price': 'DollarSign',
    'cost': 'DollarSign',
    'currency': 'DollarSign',
    'favorite': 'Heart',
    'favourite': 'Heart',
    'like': 'Heart',
    'love': 'Heart',
    'rating': 'Star',
    'review': 'Star',
    'feedback': 'MessageCircle',
    'message': 'MessageCircle',
    'chat': 'MessageCircle',
    'conversation': 'MessageCircle',
    'url': 'Link',
    'connection': 'Link',
    'document': 'File',
    'doc': 'File',
    'paper': 'File',
    'pdf': 'File',
    'text': 'FileText',
    'basket': 'ShoppingBag',
    'place': 'MapPin',
    'position': 'MapPin',
    'ring': 'Bell',
    'rotate': 'RefreshCw',
    'reload': 'RefreshCw',
    
    // Scientific and Lab icons
    'flask': 'FlaskConical',
    'flask-conical': 'FlaskConical',
    'flaskConical': 'FlaskConical',
    'flask-round': 'FlaskRound',
    'flaskRound': 'FlaskRound',
    'beaker': 'Beaker',
    'microscope': 'Microscope',
    'test-tube': 'TestTube',
    'testTube': 'TestTube',
    'test-tube-2': 'TestTube2',
    'testTube2': 'TestTube2',
    'test-tube-diagonal': 'TestTubeDiagonal',
    'testTubeDiagonal': 'TestTubeDiagonal',
    'test-tubes': 'TestTubes',
    'testTubes': 'TestTubes',
    'dna': 'Dna',
    'atom': 'Atom',
    'pill': 'Pill',
    'syringe': 'Syringe',
    'thermometer': 'Thermometer',
    'stethoscope': 'Stethoscope',
    
    // Additional common icons
    'building': 'Building',
    'building-2': 'Building2',
    'building2': 'Building2',
    'house': 'Home',
    'store': 'Store',
    'shop': 'Store',
    'factory': 'Factory',
    'warehouse': 'Warehouse',
    'hospital': 'Hospital',
    'school': 'School',
    'university': 'GraduationCap',
    'graduation': 'GraduationCap',
    'graduationCap': 'GraduationCap',
    'graduation-cap': 'GraduationCap',
    
    // More UI icons
    'expand': 'Expand',
    'collapse': 'Minimize2',
    'fullscreen': 'Maximize',
    'exit-fullscreen': 'Minimize',
    'exitFullscreen': 'Minimize',
    'zoom-in': 'ZoomIn',
    'zoomIn': 'ZoomIn',
    'zoom-out': 'ZoomOut',
    'zoomOut': 'ZoomOut',
    'move': 'Move',
    'drag': 'Move',
    'resize': 'Move',
    
    // More status icons
    'success': 'CheckCircle',
    'question': 'HelpCircle',
    'help': 'HelpCircle',
    'exclamation': 'AlertCircle',
    
    // Additional action icons
    'print': 'Printer',
    'printer': 'Printer',
    'scan': 'Scan',
    'scanner': 'Scan',
    'camera': 'Camera',
    'photo': 'Camera',
    'video': 'Video',
    'play': 'Play',
    'pause': 'Pause',
    'stop': 'Square',
    'record': 'Circle',
    'skip-forward': 'SkipForward',
    'skipForward': 'SkipForward',
    'skip-back': 'SkipBack',
    'skipBack': 'SkipBack',
    'fast-forward': 'FastForward',
    'fastForward': 'FastForward',
    'rewind': 'Rewind',
    
    // Chart and data icons
    'chart': 'BarChart3',
    'graph': 'LineChart',
    'pie': 'PieChart',
    'line-chart': 'LineChart',
    'area-chart': 'AreaChart',
    'scatter-chart': 'ScatterChart',
    
    // Nature and weather
    'tree': 'TreeDeciduous',
    'tree-deciduous': 'TreeDeciduous',
    'treeDeciduous': 'TreeDeciduous',
    'tree-pine': 'TreePine',
    'treePine': 'TreePine',
    'tree-palm': 'TreePalm',
    'treePalm': 'TreePalm',
    'palm-tree': 'TreePalm',
    'palmTree': 'TreePalm',
    'trees': 'Trees',
    'flower': 'Flower',
    'plant': 'Flower',
    'cloud': 'Cloud',
    'rain': 'CloudRain',
    'snow': 'CloudSnow',
    'storm': 'CloudLightning',
    'wind': 'Wind',
    'sunrise': 'Sunrise',
    'sunset': 'Sunset',
    
    // Food and drink
    'coffee': 'Coffee',
    'cup': 'Coffee',
    'wine': 'Wine',
    'beer': 'Beer',
    'pizza': 'Pizza',
    'cake': 'Cake',
    'utensils': 'Utensils',
    'fork': 'Utensils',
    'knife': 'Utensils'
  };
  
  // Check if we have a direct mapping
  const lowerName = normalized.toLowerCase();
  if (nameMappings[lowerName]) {
    return nameMappings[lowerName];
  }
  
  // Try to convert kebab-case to PascalCase
  if (normalized.includes('-')) {
    normalized = normalized
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }
  // Try to convert camelCase to PascalCase
  else if (normalized[0] === normalized[0].toLowerCase()) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  return normalized;
};

/**
 * Universal Icon Component that uses lucide-react
 * This component will NEVER fail - it always returns an icon
 */
const IconWrapper = ({ 
  name, 
  size = 24, 
  color, 
  className, 
  clickable = false,
  onClick,
  strokeWidth = 2,
  ...props 
}) => {
  // Normalize the icon name
  const iconName = normalizeIconName(name);
  
  // Try to get the icon from lucide-react
  let IconComponent = null;
  
  if (iconName && LucideIcons[iconName]) {
    IconComponent = LucideIcons[iconName];
  } else {
    // Try to find similar icons for better suggestions
    const availableIcons = Object.keys(LucideIcons).filter(key => 
      key !== 'default' && 
      key !== 'createLucideIcon' && 
      typeof LucideIcons[key] === 'function' &&
      key[0] === key[0].toUpperCase()
    );
    
    const suggestions = availableIcons.filter(icon => 
      icon.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(icon.toLowerCase())
    ).slice(0, 3);
    
    const suggestionText = suggestions.length > 0 
      ? ` Try: ${suggestions.join(', ')}`
      : ' Visit https://lucide.dev/icons to browse all available icons.';
    
    console.warn(`🎨 Icon "${name}" (normalized to "${iconName}") not found.${suggestionText}`);
    IconComponent = LucideIcons.HelpCircle || LucideIcons.AlertCircle || LucideIcons.Circle;
  }
  
  // If somehow we still don't have an icon (shouldn't happen), use a basic SVG
  if (!IconComponent) {
    return (
      <IconContainer
        as="svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color || "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        color={color}
        clickable={clickable}
        onClick={onClick}
        className={className}
        whileHover={clickable ? { scale: 1.1 } : undefined}
        whileTap={clickable ? { scale: 0.9 } : undefined}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </IconContainer>
    );
  }
  
  return (
    <IconContainer
      color={color}
      clickable={clickable}
      onClick={onClick}
      className={className}
      whileHover={clickable ? { scale: 1.1 } : undefined}
      whileTap={clickable ? { scale: 0.9 } : undefined}
      {...props}
    >
      <IconComponent 
        size={size} 
        strokeWidth={strokeWidth}
      />
    </IconContainer>
  );
};

// Helper component to list all available Lucide icons
export const ListAvailableIcons = () => {
  const iconNames = Object.keys(LucideIcons).filter(key => 
    key !== 'default' && 
    key !== 'createLucideIcon' && 
    typeof LucideIcons[key] === 'function'
  );
  
  console.log('Available Lucide Icons:', iconNames.length);
  console.log(iconNames.sort());
  
  return iconNames;
};

export default IconWrapper;