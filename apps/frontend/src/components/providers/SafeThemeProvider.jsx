/**
 * SafeThemeProvider - Ensures theme is always available to prevent undefined errors
 * Wraps ThemeProvider with fallback logic
 */

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { createThemeValidator, validateThemeStructure } from '../../utils/styledUtils';

/**
 * Deep merge helper that preserves existing properties
 */
const deepMerge = (target, source) => {
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (key in target) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    } else if (!(key in target)) {
      output[key] = source[key];
    }
  });
  
  return output;
};

/**
 * Safe theme provider that ensures theme is always defined
 * Prevents "Cannot read properties of undefined" errors in styled-components
 */
const SafeThemeProvider = ({ theme, children }) => {
  // Always ensure we have a valid theme object
  const safeTheme = React.useMemo(() => {
    if (!theme) {
      console.warn('SafeThemeProvider: No theme provided, using default lightTheme');
      return lightTheme;
    }
    
    // Only add missing properties, don't override existing ones
    const patchedTheme = deepMerge(theme, {
      // Ensure colors.primary.main exists (common Material-UI pattern)
      colors: {
        primary: {
          main: theme?.colors?.primary?.main || theme?.colors?.primary?.[500]
        },
        // Ensure blue exists (alias to primary if missing)
        blue: theme?.colors?.blue || theme?.colors?.primary,
        // Ensure neutral exists for components that need it
        neutral: theme?.colors?.neutral || theme?.colors?.gray
      }
    });
    
    // In development, validate theme structure and wrap with validator
    if (process.env.NODE_ENV === 'development') {
      validateThemeStructure(patchedTheme);
      return createThemeValidator(patchedTheme);
    }
    
    return patchedTheme;
  }, [theme]);
  
  return (
    <ThemeProvider theme={safeTheme}>
      {children}
    </ThemeProvider>
  );
};

export default SafeThemeProvider;