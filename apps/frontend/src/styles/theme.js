import { colors, typography, spacing, breakpoints, animation } from './tokens.js';

export const lightTheme = {
  colors: {
    ...colors,
    background: {
      primary: colors.gray[50],
      secondary: colors.gray[100],
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)'
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
      light: colors.gray[200]
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
  typography,
  spacing,
  breakpoints,
  animation,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem'
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...colors,
    background: {
      primary: colors.gray[900],
      secondary: colors.gray[800],
      elevated: colors.gray[700],
      overlay: 'rgba(0, 0, 0, 0.8)'
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
      light: colors.gray[700]
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