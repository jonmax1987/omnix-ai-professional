import { useRef, useEffect, useState, useCallback } from 'react';
import { createContext, useContext } from 'react';

// ARIA context for managing live regions and announcements
const AriaContext = createContext({
  announce: () => {},
  setLiveRegion: () => {},
  describedBy: {},
  labelledBy: {}
});

// Provider component for ARIA context
const AriaProvider = ({ children }) => {
  const liveRegionRef = useRef(null);
  const [describedBy, setDescribedBy] = useState({});
  const [labelledBy, setLabelledBy] = useState({});

  // Announce messages to screen readers
  const announce = useCallback((message, priority = 'polite') => {
    if (!liveRegionRef.current) return;

    // Clear previous message
    liveRegionRef.current.textContent = '';
    
    // Set new message after a brief delay to ensure it's announced
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message;
        liveRegionRef.current.setAttribute('aria-live', priority);
      }
    }, 100);
  }, []);

  // Set live region content
  const setLiveRegion = useCallback((content, priority = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = content;
      liveRegionRef.current.setAttribute('aria-live', priority);
    }
  }, []);

  useEffect(() => {
    // Create live region for announcements
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('role', 'status');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const contextValue = {
    announce,
    setLiveRegion,
    describedBy,
    labelledBy,
    setDescribedBy,
    setLabelledBy
  };

  return (
    <AriaContext.Provider value={contextValue}>
      {children}
    </AriaContext.Provider>
  );
};

// Hook to use ARIA context
const useAria = () => {
  const context = useContext(AriaContext);
  if (!context) {
    throw new Error('useAria must be used within an AriaProvider');
  }
  return context;
};

// Hook for generating unique IDs
const useUniqueId = (prefix = 'aria') => {
  const idRef = useRef(null);
  
  if (!idRef.current) {
    idRef.current = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return idRef.current;
};

// Hook for managing described-by relationships
const useDescribedBy = (description, id) => {
  const { setDescribedBy } = useAria();
  const descriptionId = useUniqueId('description');
  
  useEffect(() => {
    setDescribedBy(prev => ({
      ...prev,
      [id]: descriptionId
    }));
    
    return () => {
      setDescribedBy(prev => {
        const { [id]: removed, ...rest } = prev;
        return rest;
      });
    };
  }, [id, descriptionId, setDescribedBy]);

  return { descriptionId, description };
};

// Hook for managing labelled-by relationships
const useLabelledBy = (label, id) => {
  const { setLabelledBy } = useAria();
  const labelId = useUniqueId('label');
  
  useEffect(() => {
    setLabelledBy(prev => ({
      ...prev,
      [id]: labelId
    }));
    
    return () => {
      setLabelledBy(prev => {
        const { [id]: removed, ...rest } = prev;
        return rest;
      });
    };
  }, [id, labelId, setLabelledBy]);

  return { labelId, label };
};

// Hook for announcements
const useAnnouncer = () => {
  const { announce } = useAria();
  
  const announceMessage = useCallback((message, priority = 'polite') => {
    announce(message, priority);
  }, [announce]);

  const announceSuccess = useCallback((message) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  const announceError = useCallback((message) => {
    announce(`Error: ${message}`, 'assertive');
  }, [announce]);

  const announceWarning = useCallback((message) => {
    announce(`Warning: ${message}`, 'polite');
  }, [announce]);

  const announceLoading = useCallback((message = 'Loading') => {
    announce(`${message}...`, 'polite');
  }, [announce]);

  const announceLoadingComplete = useCallback((message = 'Loading complete') => {
    announce(message, 'polite');
  }, [announce]);

  return {
    announce: announceMessage,
    announceSuccess,
    announceError,
    announceWarning,
    announceLoading,
    announceLoadingComplete
  };
};

// Hook for screen reader detection
const useScreenReader = () => {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  
  useEffect(() => {
    // Check for screen reader indicators
    const checkScreenReader = () => {
      // Check for reduced motion preference (often used by screen readers)
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check for high contrast mode
      const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Check for common screen reader user agents
      const userAgent = navigator.userAgent.toLowerCase();
      const hasScreenReaderUA = userAgent.includes('nvda') || 
                               userAgent.includes('jaws') || 
                               userAgent.includes('orca');
      
      // Check for focus visibility
      const supportsFocusVisible = CSS.supports('selector(:focus-visible)');
      
      setIsScreenReaderActive(hasReducedMotion || hasHighContrast || hasScreenReaderUA || !supportsFocusVisible);
    };

    checkScreenReader();
    
    // Listen for media query changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    motionQuery.addListener(checkScreenReader);
    contrastQuery.addListener(checkScreenReader);
    
    return () => {
      motionQuery.removeListener(checkScreenReader);
      contrastQuery.removeListener(checkScreenReader);
    };
  }, []);

  return isScreenReaderActive;
};

// Hook for keyboard navigation
const useKeyboardNavigation = (items = [], options = {}) => {
  const {
    loop = true,
    orientation = 'vertical', // 'vertical', 'horizontal', 'both'
    onSelect,
    onFocus,
    disabled = false
  } = options;

  const [activeIndex, setActiveIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (disabled || items.length === 0) return;

    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    switch (e.key) {
      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          setActiveIndex(prev => {
            const next = prev + 1;
            return loop ? next % items.length : Math.min(next, items.length - 1);
          });
        }
        break;
        
      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          setActiveIndex(prev => {
            const next = prev - 1;
            return loop ? (next + items.length) % items.length : Math.max(next, 0);
          });
        }
        break;
        
      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault();
          setActiveIndex(prev => {
            const next = prev + 1;
            return loop ? next % items.length : Math.min(next, items.length - 1);
          });
        }
        break;
        
      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault();
          setActiveIndex(prev => {
            const next = prev - 1;
            return loop ? (next + items.length) % items.length : Math.max(next, 0);
          });
        }
        break;
        
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) {
          onSelect(items[activeIndex], activeIndex);
        }
        break;
    }
  }, [items, activeIndex, loop, orientation, onSelect, disabled]);

  useEffect(() => {
    if (onFocus && focused) {
      onFocus(items[activeIndex], activeIndex);
    }
  }, [activeIndex, focused, items, onFocus]);

  return {
    activeIndex,
    setActiveIndex,
    focused,
    setFocused,
    handleKeyDown,
    getItemProps: (index) => ({
      role: 'option',
      'aria-selected': index === activeIndex,
      tabIndex: index === activeIndex ? 0 : -1,
      onFocus: () => {
        setActiveIndex(index);
        setFocused(true);
      },
      onBlur: () => setFocused(false),
      onKeyDown: handleKeyDown
    })
  };
};

// Hook for managing focus trap
const useFocusTrap = (isActive = false) => {
  const containerRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(',');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors));
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0];
    lastFocusableRef.current = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstFocusableRef.current.focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, getFocusableElements]);

  return containerRef;
};

// ARIA attributes generator
const generateAriaAttributes = (options = {}) => {
  const {
    role,
    label,
    labelledby,
    describedby,
    expanded,
    selected,
    checked,
    disabled,
    required,
    invalid,
    hidden,
    live,
    atomic,
    relevant,
    busy,
    controls,
    owns,
    flowto,
    level,
    posinset,
    setsize,
    orientation,
    sort,
    autocomplete,
    multiselectable,
    readonly,
    pressed
  } = options;

  const attributes = {};

  // Basic ARIA attributes
  if (role) attributes.role = role;
  if (label) attributes['aria-label'] = label;
  if (labelledby) attributes['aria-labelledby'] = labelledby;
  if (describedby) attributes['aria-describedby'] = describedby;

  // State attributes
  if (expanded !== undefined) attributes['aria-expanded'] = expanded;
  if (selected !== undefined) attributes['aria-selected'] = selected;
  if (checked !== undefined) attributes['aria-checked'] = checked;
  if (disabled !== undefined) attributes['aria-disabled'] = disabled;
  if (required !== undefined) attributes['aria-required'] = required;
  if (invalid !== undefined) attributes['aria-invalid'] = invalid;
  if (hidden !== undefined) attributes['aria-hidden'] = hidden;
  if (pressed !== undefined) attributes['aria-pressed'] = pressed;

  // Live region attributes
  if (live) attributes['aria-live'] = live;
  if (atomic !== undefined) attributes['aria-atomic'] = atomic;
  if (relevant) attributes['aria-relevant'] = relevant;
  if (busy !== undefined) attributes['aria-busy'] = busy;

  // Relationship attributes
  if (controls) attributes['aria-controls'] = controls;
  if (owns) attributes['aria-owns'] = owns;
  if (flowto) attributes['aria-flowto'] = flowto;

  // Widget attributes
  if (level !== undefined) attributes['aria-level'] = level;
  if (posinset !== undefined) attributes['aria-posinset'] = posinset;
  if (setsize !== undefined) attributes['aria-setsize'] = setsize;
  if (orientation) attributes['aria-orientation'] = orientation;
  if (sort) attributes['aria-sort'] = sort;
  if (autocomplete) attributes['aria-autocomplete'] = autocomplete;
  if (multiselectable !== undefined) attributes['aria-multiselectable'] = multiselectable;
  if (readonly !== undefined) attributes['aria-readonly'] = readonly;

  return attributes;
};

// Accessibility testing utilities
const testAccessibility = {
  // Check if element has proper labeling
  hasProperLabel: (element) => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      (element.tagName === 'INPUT' && element.labels?.length > 0)
    );
  },

  // Check if interactive element is keyboard accessible
  isKeyboardAccessible: (element) => {
    const tabIndex = element.getAttribute('tabindex');
    return tabIndex !== '-1' && (
      ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(element.tagName) ||
      element.getAttribute('role') === 'button' ||
      tabIndex === '0'
    );
  },

  // Check if element has sufficient color contrast
  hasGoodContrast: async (element) => {
    // This would require a color contrast checking library
    // For now, return true as a placeholder
    return true;
  },

  // Check for accessibility violations
  auditElement: (element) => {
    const issues = [];

    if (!testAccessibility.hasProperLabel(element)) {
      issues.push('Element lacks proper labeling');
    }

    if (!testAccessibility.isKeyboardAccessible(element)) {
      issues.push('Element is not keyboard accessible');
    }

    return issues;
  }
};

export {
  AriaProvider,
  useAria,
  useUniqueId,
  useDescribedBy,
  useLabelledBy,
  useAnnouncer,
  useScreenReader,
  useKeyboardNavigation,
  useFocusTrap,
  generateAriaAttributes,
  testAccessibility
};