import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { createContext, useContext } from 'react';

// Keyboard navigation context
const KeyboardNavigationContext = createContext({
  registerNavigableArea: () => {},
  unregisterNavigableArea: () => {},
  currentArea: null,
  switchArea: () => {}
});

// Provider for keyboard navigation context
const KeyboardNavigationProvider = ({ children }) => {
  const [navigableAreas, setNavigableAreas] = useState(new Map());
  const [currentArea, setCurrentArea] = useState(null);

  const registerNavigableArea = useCallback((id, config) => {
    setNavigableAreas(prev => new Map(prev.set(id, config)));
    if (!currentArea) {
      setCurrentArea(id);
    }
  }, [currentArea]);

  const unregisterNavigableArea = useCallback((id) => {
    setNavigableAreas(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    if (currentArea === id) {
      const remaining = Array.from(navigableAreas.keys()).filter(key => key !== id);
      setCurrentArea(remaining[0] || null);
    }
  }, [currentArea, navigableAreas]);

  const switchArea = useCallback((id) => {
    if (navigableAreas.has(id)) {
      setCurrentArea(id);
    }
  }, [navigableAreas]);

  const contextValue = {
    registerNavigableArea,
    unregisterNavigableArea,
    currentArea,
    switchArea,
    navigableAreas
  };

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
};

// Hook to use keyboard navigation context
const useKeyboardNavigationContext = () => {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigationContext must be used within a KeyboardNavigationProvider');
  }
  return context;
};

// Enhanced keyboard navigation hook
const useKeyboardNavigation = (items = [], options = {}) => {
  const {
    id = 'default',
    orientation = 'vertical',
    loop = true,
    disabled = false,
    onNavigate,
    onSelect,
    onEscape,
    homeEndKeys = true,
    pageUpDownKeys = false,
    typeAhead = false,
    initialIndex = 0,
    skipDisabled = true,
    autoFocus = false
  } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [searchQuery, setSearchQuery] = useState('');
  const itemRefs = useRef([]);
  const searchTimeoutRef = useRef();
  const containerRef = useRef();

  const { registerNavigableArea, unregisterNavigableArea, currentArea } = useKeyboardNavigationContext();

  // Filter out disabled items if skipDisabled is true
  const navigableIndices = useMemo(() => {
    return items.map((item, index) => ({
      index,
      disabled: skipDisabled && item.disabled
    })).filter(item => !item.disabled).map(item => item.index);
  }, [items, skipDisabled]);

  // Get next/previous navigable index
  const getNextIndex = useCallback((currentIndex, direction = 1) => {
    const currentPos = navigableIndices.indexOf(currentIndex);
    if (currentPos === -1) return navigableIndices[0] || 0;

    let nextPos = currentPos + direction;
    
    if (loop) {
      nextPos = (nextPos + navigableIndices.length) % navigableIndices.length;
    } else {
      nextPos = Math.max(0, Math.min(nextPos, navigableIndices.length - 1));
    }

    return navigableIndices[nextPos];
  }, [navigableIndices, loop]);

  // Type-ahead search
  const handleTypeAhead = useCallback((char) => {
    if (!typeAhead) return;

    const newQuery = searchQuery + char.toLowerCase();
    setSearchQuery(newQuery);

    // Find matching item
    const matchingIndex = items.findIndex((item, index) => {
      if (index < activeIndex) return false; // Start search from current position
      const text = (item.label || item.name || item.toString()).toLowerCase();
      return text.startsWith(newQuery);
    });

    if (matchingIndex !== -1) {
      setActiveIndex(matchingIndex);
      if (onNavigate) onNavigate(items[matchingIndex], matchingIndex);
    }

    // Clear search after delay
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery('');
    }, 1000);
  }, [typeAhead, searchQuery, items, activeIndex, onNavigate]);

  // Main keyboard event handler
  const handleKeyDown = useCallback((e) => {
    if (disabled || items.length === 0) return;

    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';
    
    switch (e.key) {
      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          const nextIndex = getNextIndex(activeIndex, 1);
          setActiveIndex(nextIndex);
          if (onNavigate) onNavigate(items[nextIndex], nextIndex);
        }
        break;

      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          const prevIndex = getNextIndex(activeIndex, -1);
          setActiveIndex(prevIndex);
          if (onNavigate) onNavigate(items[prevIndex], prevIndex);
        }
        break;

      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault();
          const nextIndex = getNextIndex(activeIndex, 1);
          setActiveIndex(nextIndex);
          if (onNavigate) onNavigate(items[nextIndex], nextIndex);
        }
        break;

      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault();
          const prevIndex = getNextIndex(activeIndex, -1);
          setActiveIndex(prevIndex);
          if (onNavigate) onNavigate(items[prevIndex], prevIndex);
        }
        break;

      case 'Home':
        if (homeEndKeys) {
          e.preventDefault();
          const firstIndex = navigableIndices[0] || 0;
          setActiveIndex(firstIndex);
          if (onNavigate) onNavigate(items[firstIndex], firstIndex);
        }
        break;

      case 'End':
        if (homeEndKeys) {
          e.preventDefault();
          const lastIndex = navigableIndices[navigableIndices.length - 1] || items.length - 1;
          setActiveIndex(lastIndex);
          if (onNavigate) onNavigate(items[lastIndex], lastIndex);
        }
        break;

      case 'PageUp':
        if (pageUpDownKeys) {
          e.preventDefault();
          const pageSize = Math.max(1, Math.floor(items.length / 10));
          const newIndex = Math.max(navigableIndices[0] || 0, activeIndex - pageSize);
          setActiveIndex(newIndex);
          if (onNavigate) onNavigate(items[newIndex], newIndex);
        }
        break;

      case 'PageDown':
        if (pageUpDownKeys) {
          e.preventDefault();
          const pageSize = Math.max(1, Math.floor(items.length / 10));
          const lastNavigable = navigableIndices[navigableIndices.length - 1] || items.length - 1;
          const newIndex = Math.min(lastNavigable, activeIndex + pageSize);
          setActiveIndex(newIndex);
          if (onNavigate) onNavigate(items[newIndex], newIndex);
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) {
          onSelect(items[activeIndex], activeIndex, e);
        }
        break;

      case 'Escape':
        e.preventDefault();
        if (onEscape) {
          onEscape(e);
        }
        break;

      default:
        // Handle type-ahead for alphanumeric keys
        if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
          e.preventDefault();
          handleTypeAhead(e.key);
        }
        break;
    }
  }, [
    disabled, items, orientation, activeIndex, getNextIndex, onNavigate, 
    homeEndKeys, pageUpDownKeys, onSelect, onEscape, handleTypeAhead, navigableIndices
  ]);

  // Register this area with the navigation context
  useEffect(() => {
    registerNavigableArea(id, {
      activeIndex,
      setActiveIndex,
      items,
      handleKeyDown
    });

    return () => {
      unregisterNavigableArea(id);
    };
  }, [id, activeIndex, items, handleKeyDown, registerNavigableArea, unregisterNavigableArea]);

  // Auto focus if enabled
  useEffect(() => {
    if (autoFocus && currentArea === id && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].focus();
    }
  }, [autoFocus, currentArea, id, activeIndex]);

  // Focus management
  const focusItem = useCallback((index) => {
    if (itemRefs.current[index]) {
      itemRefs.current[index].focus();
    }
  }, []);

  // Get props for container
  const getContainerProps = () => ({
    ref: containerRef,
    role: orientation === 'horizontal' ? 'menubar' : 'menu',
    'aria-orientation': orientation === 'both' ? undefined : orientation,
    onKeyDown: handleKeyDown,
    tabIndex: -1
  });

  // Get props for individual items
  const getItemProps = (index) => ({
    ref: (el) => {
      itemRefs.current[index] = el;
    },
    role: 'menuitem',
    tabIndex: index === activeIndex ? 0 : -1,
    'aria-selected': index === activeIndex,
    'aria-setsize': items.length,
    'aria-posinset': index + 1,
    onFocus: () => {
      setActiveIndex(index);
      if (onNavigate) onNavigate(items[index], index);
    },
    onClick: (e) => {
      setActiveIndex(index);
      if (onSelect) onSelect(items[index], index, e);
    },
    onKeyDown: handleKeyDown
  });

  return {
    activeIndex,
    setActiveIndex,
    focusItem,
    searchQuery,
    getContainerProps,
    getItemProps,
    handleKeyDown
  };
};

// Roving tabindex hook for complex components
const useRovingTabIndex = (items = [], options = {}) => {
  const {
    orientation = 'horizontal',
    loop = true,
    onFocusChange,
    defaultIndex = 0
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(defaultIndex);
  const itemRefs = useRef([]);

  const handleKeyDown = useCallback((e, index) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          newIndex = loop ? (index + 1) % items.length : Math.min(index + 1, items.length - 1);
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          newIndex = loop ? (index - 1 + items.length) % items.length : Math.max(index - 1, 0);
        }
        break;

      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          newIndex = loop ? (index + 1) % items.length : Math.min(index + 1, items.length - 1);
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          newIndex = loop ? (index - 1 + items.length) % items.length : Math.max(index - 1, 0);
        }
        break;

      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== index) {
      setFocusedIndex(newIndex);
      if (itemRefs.current[newIndex]) {
        itemRefs.current[newIndex].focus();
      }
      if (onFocusChange) {
        onFocusChange(newIndex, items[newIndex]);
      }
    }
  }, [items, orientation, loop, onFocusChange]);

  const getItemProps = (index) => ({
    ref: (el) => {
      itemRefs.current[index] = el;
    },
    tabIndex: index === focusedIndex ? 0 : -1,
    onKeyDown: (e) => handleKeyDown(e, index),
    onFocus: () => {
      setFocusedIndex(index);
      if (onFocusChange) {
        onFocusChange(index, items[index]);
      }
    }
  });

  return {
    focusedIndex,
    setFocusedIndex,
    getItemProps
  };
};

// Skip links component for accessibility
const SkipLinks = ({ links = [] }) => {
  const [isVisible, setIsVisible] = useState(false);

  const defaultLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#search', label: 'Skip to search' }
  ];

  const allLinks = links.length > 0 ? links : defaultLinks;

  return (
    <div
      style={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        ...(isVisible && {
          position: 'fixed',
          left: '8px',
          top: '8px',
          width: 'auto',
          height: 'auto',
          overflow: 'visible',
          zIndex: 9999,
          background: '#000',
          color: '#fff',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        })
      }}
    >
      {allLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
          style={{
            color: 'white',
            textDecoration: 'none',
            display: 'block',
            padding: '4px 8px',
            margin: '2px 0'
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

// Keyboard shortcuts display component
const KeyboardShortcutsIndicator = ({ shortcuts = [], visible = false }) => {
  if (!visible || shortcuts.length === 0) return null;

  return (
    <div
      role="tooltip"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        maxWidth: '300px',
        zIndex: 1000
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Keyboard Shortcuts</h3>
      {shortcuts.map((shortcut, index) => (
        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px' }}>
          <span>{shortcut.description}</span>
          <kbd style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontFamily: 'monospace'
          }}>
            {shortcut.keys.join(' + ')}
          </kbd>
        </div>
      ))}
    </div>
  );
};

export {
  KeyboardNavigationProvider,
  useKeyboardNavigationContext,
  useKeyboardNavigation,
  useRovingTabIndex,
  SkipLinks,
  KeyboardShortcutsIndicator
};