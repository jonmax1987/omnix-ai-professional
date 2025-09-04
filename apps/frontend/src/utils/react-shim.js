/**
 * React AsyncMode shim to prevent "Cannot set properties of undefined" errors
 * This resolves issues with older react-is versions trying to access React.AsyncMode
 * which was deprecated and removed in React 18
 */

// Ensure React is available globally before any libraries try to access it
import React from 'react';

// Add AsyncMode shim if it doesn't exist (for backward compatibility with old react-is versions)
if (React && !React.AsyncMode) {
  React.AsyncMode = undefined;
}

// Also ensure it's available on the global React object if libraries access it that way
if (typeof window !== 'undefined' && window.React && !window.React.AsyncMode) {
  window.React.AsyncMode = undefined;
}

// For server-side rendering compatibility
if (typeof global !== 'undefined' && global.React && !global.React.AsyncMode) {
  global.React.AsyncMode = undefined;
}

export default React;