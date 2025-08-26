import { useRef, useEffect, useState, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

// Focus management context
const FocusContext = createContext({
  pushFocusScope: () => {},
  popFocusScope: () => {},
  restoreFocus: () => {},
  trapFocus: () => {},
  releaseFocus: () => {}
});

// Focus management provider
const FocusProvider = ({ children }) => {
  const focusStackRef = useRef([]);
  const trappedElementsRef = useRef(new Set());

  const pushFocusScope = useCallback((element, restoreElement) => {
    if (document.activeElement && document.activeElement !== document.body) {
      focusStackRef.current.push({
        element: restoreElement || document.activeElement,
        timestamp: Date.now()
      });
    }
    
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }, []);

  const popFocusScope = useCallback(() => {
    const lastFocus = focusStackRef.current.pop();
    if (lastFocus && lastFocus.element && typeof lastFocus.element.focus === 'function') {
      // Small delay to ensure the element is still in the DOM
      setTimeout(() => {
        if (document.contains(lastFocus.element)) {
          lastFocus.element.focus();
        }
      }, 0);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (focusStackRef.current.length > 0) {
      popFocusScope();
    }
  }, [popFocusScope]);

  const trapFocus = useCallback((element) => {
    if (element) {
      trappedElementsRef.current.add(element);
    }
  }, []);

  const releaseFocus = useCallback((element) => {
    if (element) {
      trappedElementsRef.current.delete(element);
    }
  }, []);

  const contextValue = {
    pushFocusScope,
    popFocusScope,
    restoreFocus,
    trapFocus,
    releaseFocus
  };

  return (
    <FocusContext.Provider value={contextValue}>
      {children}
    </FocusContext.Provider>
  );
};

// Hook to use focus context
const useFocusContext = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocusContext must be used within a FocusProvider');
  }
  return context;
};

// Enhanced focus trap hook
const useFocusTrap = (isActive = false, options = {}) => {
  const {
    initialFocus,
    finalFocus,
    restoreFocus = true,
    includeContainer = true,
    escapeDeactivates = true,
    clickOutsideDeactivates = false,
    onActivate,
    onDeactivate
  } = options;

  const containerRef = useRef(null);
  const sentinelStartRef = useRef(null);
  const sentinelEndRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const isActiveRef = useRef(isActive);

  const { pushFocusScope, popFocusScope } = useFocusContext();

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]:not([tabindex="-1"])',
      'area[href]:not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'iframe:not([tabindex="-1"])',
      'object:not([tabindex="-1"])',
      'embed:not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]:not([tabindex="-1"])'
    ];

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelectors.join(','))
    ).filter(element => {
      // Additional checks for visibility and accessibility
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('aria-hidden') &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    });

    // Include container if specified and it's focusable
    if (includeContainer && containerRef.current.tabIndex >= 0) {
      elements.unshift(containerRef.current);
    }

    return elements;
  }, [includeContainer]);

  // Focus the first element
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    
    if (initialFocus) {
      if (typeof initialFocus === 'function') {
        const elementToFocus = initialFocus();
        if (elementToFocus) {
          elementToFocus.focus();
          return;
        }
      } else if (initialFocus.current) {
        initialFocus.current.focus();
        return;
      }
    }

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [initialFocus, getFocusableElements]);

  // Focus the last element
  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  // Handle tab key navigation
  const handleKeyDown = useCallback((e) => {
    if (!isActiveRef.current || e.key !== 'Tab') {
      if (e.key === 'Escape' && escapeDeactivates) {
        e.preventDefault();
        e.stopPropagation();
        // Deactivate focus trap
        isActiveRef.current = false;
        if (onDeactivate) onDeactivate();
      }
      return;
    }

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstElement || document.activeElement === sentinelStartRef.current) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastElement || document.activeElement === sentinelEndRef.current) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements, escapeDeactivates, onDeactivate]);

  // Handle click outside
  const handleClickOutside = useCallback((e) => {
    if (
      clickOutsideDeactivates &&
      isActiveRef.current &&
      containerRef.current &&
      !containerRef.current.contains(e.target)
    ) {
      isActiveRef.current = false;
      if (onDeactivate) onDeactivate();
    }
  }, [clickOutsideDeactivates, onDeactivate]);

  // Activate focus trap
  useEffect(() => {
    if (isActive && !isActiveRef.current) {
      isActiveRef.current = true;
      
      // Store previously focused element
      if (document.activeElement && document.activeElement !== document.body) {
        previouslyFocusedElementRef.current = document.activeElement;
      }

      // Focus first element
      setTimeout(focusFirstElement, 0);

      // Add event listeners
      document.addEventListener('keydown', handleKeyDown, true);
      if (clickOutsideDeactivates) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }

      if (onActivate) onActivate();
    } else if (!isActive && isActiveRef.current) {
      isActiveRef.current = false;

      // Restore focus
      if (restoreFocus && previouslyFocusedElementRef.current) {
        const elementToFocus = finalFocus || previouslyFocusedElementRef.current;
        if (elementToFocus && typeof elementToFocus.focus === 'function') {
          setTimeout(() => {
            if (document.contains(elementToFocus)) {
              elementToFocus.focus();
            }
          }, 0);
        }
      }

      // Remove event listeners
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);

      if (onDeactivate) onDeactivate();
    }

    return () => {
      if (isActiveRef.current) {
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      }
    };
  }, [
    isActive,
    handleKeyDown,
    handleClickOutside,
    focusFirstElement,
    restoreFocus,
    finalFocus,
    clickOutsideDeactivates,
    onActivate,
    onDeactivate
  ]);

  return {
    containerRef,
    sentinelStartRef,
    sentinelEndRef,
    focusFirstElement,
    focusLastElement
  };
};

// Focus trap component
const FocusTrap = ({ children, isActive = false, ...options }) => {
  const { containerRef, sentinelStartRef, sentinelEndRef } = useFocusTrap(isActive, options);

  return (
    <>
      <div ref={sentinelStartRef} tabIndex={0} style={{ position: 'absolute', left: '-10000px' }} />
      <div ref={containerRef} style={{ outline: 'none' }} tabIndex={-1}>
        {children}
      </div>
      <div ref={sentinelEndRef} tabIndex={0} style={{ position: 'absolute', left: '-10000px' }} />
    </>
  );
};

// Auto focus hook
const useAutoFocus = (shouldFocus = true, delay = 0) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      const focusElement = () => {
        if (elementRef.current && typeof elementRef.current.focus === 'function') {
          elementRef.current.focus();
        }
      };

      if (delay > 0) {
        const timeoutId = setTimeout(focusElement, delay);
        return () => clearTimeout(timeoutId);
      } else {
        focusElement();
      }
    }
  }, [shouldFocus, delay]);

  return elementRef;
};

// Focus visible hook for better focus indicators
const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const elementRef = useRef(null);
  const hadKeyboardEventRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Meta' || e.key === 'Alt' || e.key === 'Control') {
        hadKeyboardEventRef.current = true;
      }
    };

    const handlePointerDown = () => {
      hadKeyboardEventRef.current = false;
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, []);

  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    setIsFocusVisible(hadKeyboardEventRef.current);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsFocusVisible(false);
  }, []);

  return {
    ref: elementRef,
    isFocusVisible,
    isFocused,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur
    }
  };
};

// Focus ring component
const FocusRing = ({ children, visible, offset = 2, ...props }) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
      {...props}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            top: -offset,
            left: -offset,
            right: -offset,
            bottom: -offset,
            border: '2px solid #0066cc',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}
    </div>
  );
};

// Skip to content component
const SkipToContent = ({ targetId = 'main-content', children = 'Skip to main content' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return createPortal(
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      style={{
        position: 'absolute',
        left: isVisible ? '8px' : '-10000px',
        top: '8px',
        zIndex: 9999,
        background: '#000',
        color: '#fff',
        padding: '8px 12px',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'left 0.1s ease'
      }}
    >
      {children}
    </a>,
    document.body
  );
};

// Focus debugging utility (development only)
const FocusDebugger = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  useEffect(() => {
    if (!enabled) return;

    let currentFocus = null;

    const handleFocusIn = (e) => {
      currentFocus = e.target;
      console.log('Focus IN:', {
        element: e.target,
        tagName: e.target.tagName,
        id: e.target.id,
        className: e.target.className,
        tabIndex: e.target.tabIndex,
        role: e.target.getAttribute('role'),
        ariaLabel: e.target.getAttribute('aria-label')
      });
    };

    const handleFocusOut = (e) => {
      console.log('Focus OUT:', {
        element: e.target,
        tagName: e.target.tagName,
        id: e.target.id
      });
    };

    const handleKeyDown = (e) => {
      if (e.key === 'F8' && e.ctrlKey && e.shiftKey) {
        console.log('Current focus:', currentFocus);
        console.log('Active element:', document.activeElement);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  return null;
};

// Custom hook for managing focus within a component
const useFocusWithin = (onFocusWithin, onFocusWithinChange) => {
  const elementRef = useRef(null);
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleFocusIn = (e) => {
      if (!isFocusWithin && element.contains(e.target)) {
        setIsFocusWithin(true);
        if (onFocusWithin) onFocusWithin(e);
        if (onFocusWithinChange) onFocusWithinChange(true);
      }
    };

    const handleFocusOut = (e) => {
      if (isFocusWithin && !element.contains(e.relatedTarget)) {
        setIsFocusWithin(false);
        if (onFocusWithinChange) onFocusWithinChange(false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isFocusWithin, onFocusWithin, onFocusWithinChange]);

  return { ref: elementRef, isFocusWithin };
};

export {
  FocusProvider,
  useFocusContext,
  useFocusTrap,
  FocusTrap,
  useAutoFocus,
  useFocusVisible,
  FocusRing,
  SkipToContent,
  FocusDebugger,
  useFocusWithin
};