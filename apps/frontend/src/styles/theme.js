import { colors, typography, spacing, breakpoints, animation, border, shadow } from './tokens.js';

// Helper function to safely access spacing values
const getSpacing = (value) => {
  if (typeof value === 'number') {
    // Check if the numeric value exists in spacing
    return spacing[value] || `${value * 0.25}rem`; // Fallback to calculated rem value
  }
  return value || '0';
};

// Helper function to safely access border values
const getBorder = (property, value) => {
  if (!border[property]) return value || '0';
  return border[property][value] || value || '0';
};

export const lightTheme = {
  colors: {
    ...colors,
    // Add main property to primary for compatibility
    primary: {
      ...colors.primary,
      main: colors.primary[500],
      dark: colors.primary[700]
    },
    // Add semantic color aliases that components expect
    success: colors.green,
    warning: colors.yellow,
    danger: colors.red,
    error: colors.red,
    info: colors.primary,
    white: '#ffffff',
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12'
    },
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81'
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843'
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87'
    },
    background: {
      default: '#ffffff',
      primary: colors.gray[50],
      secondary: colors.gray[100],
      tertiary: colors.gray[200],
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
      paper: '#ffffff',
      hover: colors.gray[50],
      subtle: colors.gray[25] || '#fafafa'
    },
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      tertiary: colors.gray[400],
      inverse: '#ffffff'
    },
    border: {
      default: colors.gray[200],
      strong: colors.gray[300],
      subtle: colors.gray[100],
      light: colors.gray[200],
      primary: colors.primary[300],
      secondary: colors.secondary[300],
      medium: colors.gray[300]
    },
    gradients: {
      primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`,
      secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[700]} 100%)`,
      success: `linear-gradient(135deg, ${colors.green[500]} 0%, ${colors.green[700]} 100%)`,
      warning: `linear-gradient(135deg, ${colors.yellow[500]} 0%, ${colors.yellow[700]} 100%)`,
      error: `linear-gradient(135deg, ${colors.red[500]} 0%, ${colors.red[700]} 100%)`
    },
    status: {
      success: {
        background: colors.green[50],
        text: colors.green[700],
        border: colors.green[200]
      },
      warning: {
        background: colors.yellow[50],
        text: colors.yellow[700],
        border: colors.yellow[200]
      },
      error: {
        background: colors.red[50],
        text: colors.red[700],
        border: colors.red[200]
      },
      info: {
        background: colors.primary[50],
        text: colors.primary[700],
        border: colors.primary[200]
      }
    },
    info: {
      background: colors.primary[50],
      text: colors.primary[700],
      border: colors.primary[200]
    }
  },
  typography: {
    ...typography,
    // Add aliases for component usage
    sizes: {
      xs: typography.fontSize.xs,
      sm: typography.fontSize.sm,
      base: typography.fontSize.base,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg,
      xl: typography.fontSize.xl,
      xxl: typography.fontSize['2xl'],
      '2xl': typography.fontSize['2xl'],
      '3xl': typography.fontSize['3xl'],
      '4xl': typography.fontSize['4xl']
    },
    // Add fontSizes alias (components expect this)
    fontSizes: {
      xs: typography.fontSize.xs,
      sm: typography.fontSize.sm,
      base: typography.fontSize.base,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg,
      xl: typography.fontSize.xl,
      xxl: typography.fontSize['2xl'],
      '2xl': typography.fontSize['2xl'],
      '3xl': typography.fontSize['3xl'],
      '4xl': typography.fontSize['4xl']
    },
    weights: {
      normal: typography.fontWeight.normal,
      medium: typography.fontWeight.medium,
      semibold: typography.fontWeight.semibold,
      bold: typography.fontWeight.bold
    },
    // Add fontWeights alias (components expect this)
    fontWeights: {
      normal: typography.fontWeight.normal,
      medium: typography.fontWeight.medium,
      semibold: typography.fontWeight.semibold,
      bold: typography.fontWeight.bold,
      // Add numeric aliases
      100: typography.fontWeight[100],
      200: typography.fontWeight[200],
      300: typography.fontWeight[300],
      400: typography.fontWeight[400],
      500: typography.fontWeight[500],
      600: typography.fontWeight[600],
      700: typography.fontWeight[700],
      800: typography.fontWeight[800],
      900: typography.fontWeight[900],
      // Add common Material-UI aliases
      light: typography.fontWeight[300],
      regular: typography.fontWeight[400],
      thick: typography.fontWeight[600],
      black: typography.fontWeight[800]
    },
    // Add missing typography variants that components are accessing
    caption: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.tight
    },
    body2: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal
    },
    body1: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal
    },
    h1: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight
    },
    h2: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight
    },
    h3: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.tight
    },
    h4: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal
    },
    h5: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal
    },
    h6: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal
    }
  },
  spacing: {
    ...spacing,
    // Add named aliases for common use
    xs: spacing[1],    // 0.25rem
    sm: spacing[2],    // 0.5rem
    md: spacing[4],    // 1rem
    lg: spacing[6],    // 1.5rem
    xl: spacing[8],    // 2rem
    xxl: spacing[12],  // 3rem
    '2xl': spacing[10],  // 2.5rem
    '3xl': spacing[12],  // 3rem
    '4xl': spacing[16],  // 4rem
  },
  getSpacing,
  getBorder,
  breakpoints,
  animation,
  border,
  shadow,
  shadows: {
    ...shadow,
    small: shadow.sm,
    medium: shadow.md,
    large: shadow.lg,
    xlarge: shadow.xl
  }, // Alias for backwards compatibility with additional mappings
  borderRadius: {
    ...border.radius,
    // Add common aliases
    xs: border.radius.sm,
    sm: border.radius.sm,
    md: border.radius.md,
    lg: border.radius.lg,
    xl: border.radius.xl,
    xxl: border.radius['2xl'],
    full: border.radius.full
  } // Alias for backwards compatibility
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...colors,
    // Add main property to primary for compatibility
    primary: {
      ...colors.primary,
      main: colors.primary[400],
      dark: colors.primary[600]
    },
    // Add semantic color aliases that components expect
    success: colors.green,
    warning: colors.yellow,
    danger: colors.red,
    error: colors.red,
    info: colors.primary,
    white: '#ffffff',
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12'
    },
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81'
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843'
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87'
    },
    background: {
      default: colors.gray[900],
      primary: colors.gray[900],
      secondary: colors.gray[800],
      tertiary: colors.gray[700],
      elevated: colors.gray[700],
      overlay: 'rgba(0, 0, 0, 0.8)',
      paper: colors.gray[800],
      hover: colors.gray[800],
      subtle: colors.gray[850] || '#1a202c'
    },
    text: {
      primary: colors.gray[50],
      secondary: colors.gray[300],
      tertiary: colors.gray[400],
      inverse: colors.gray[900]
    },
    border: {
      default: colors.gray[700],
      strong: colors.gray[600],
      subtle: colors.gray[800],
      light: colors.gray[700],
      primary: colors.primary[600],
      secondary: colors.secondary[600],
      medium: colors.gray[600]
    },
    gradients: {
      primary: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[600]} 100%)`,
      secondary: `linear-gradient(135deg, ${colors.secondary[400]} 0%, ${colors.secondary[600]} 100%)`,
      success: `linear-gradient(135deg, ${colors.green[400]} 0%, ${colors.green[600]} 100%)`,
      warning: `linear-gradient(135deg, ${colors.yellow[400]} 0%, ${colors.yellow[600]} 100%)`,
      error: `linear-gradient(135deg, ${colors.red[400]} 0%, ${colors.red[600]} 100%)`
    },
    status: {
      success: {
        background: colors.green[900],
        text: colors.green[300],
        border: colors.green[700]
      },
      warning: {
        background: colors.yellow[900],
        text: colors.yellow[300],
        border: colors.yellow[700]
      },
      error: {
        background: colors.red[900],
        text: colors.red[300],
        border: colors.red[700]
      },
      info: {
        background: colors.primary[900],
        text: colors.primary[300],
        border: colors.primary[700]
      }
    },
    info: {
      background: colors.primary[900],
      text: colors.primary[300],
      border: colors.primary[700]
    }
  }
};