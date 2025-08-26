import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';

const ShortcutsOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: ${props => props.theme.spacing[4]};
`;

const ShortcutsModal = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[3]};
  box-shadow: ${props => props.theme.shadows.xl};
  max-width: 800px;
  max-height: 80vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ModalContent = styled.div`
  padding: ${props => props.theme.spacing[6]};
  overflow-y: auto;
  flex: 1;
`;

const ShortcutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing[6]};
`;

const ShortcutSection = styled.div`
  &:not(:last-child) {
    margin-bottom: ${props => props.theme.spacing[4]};
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  padding-bottom: ${props => props.theme.spacing[2]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const ShortcutsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const ShortcutItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[1]};
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
`;

const ShortcutDescription = styled.div`
  flex: 1;
`;

const ShortcutKeys = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const KeyBadge = styled.span`
  padding: ${props => props.theme.spacing[0.5]} ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[0.5]};
  font-size: ${props => props.theme.typography.caption.fontSize};
  font-family: monospace;
  color: ${props => props.theme.colors.text.secondary};
  min-width: 24px;
  text-align: center;
`;

const KeySeparator = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.caption.fontSize};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.body2.fontSize};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const ShortcutHint = styled(motion.div)`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 50;
  max-width: 300px;
`;

const KeyboardShortcuts = ({
  shortcuts = [],
  isVisible = false,
  onClose,
  onAction,
  showHints = true,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHint, setActiveHint] = useState(null);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  
  const searchInputRef = useRef(null);

  // Default shortcuts if none provided
  const defaultShortcuts = [
    // Navigation
    {
      category: 'Navigation',
      icon: 'navigation',
      shortcuts: [
        { keys: ['?'], description: 'Show keyboard shortcuts', action: 'show-shortcuts' },
        { keys: ['g', 'd'], description: 'Go to Dashboard', action: 'navigate-dashboard' },
        { keys: ['g', 'p'], description: 'Go to Products', action: 'navigate-products' },
        { keys: ['g', 'o'], description: 'Go to Orders', action: 'navigate-orders' },
        { keys: ['g', 'c'], description: 'Go to Customers', action: 'navigate-customers' },
        { keys: ['g', 'a'], description: 'Go to Analytics', action: 'navigate-analytics' },
        { keys: ['g', 's'], description: 'Go to Settings', action: 'navigate-settings' }
      ]
    },
    // Search & Filter
    {
      category: 'Search & Filter',
      icon: 'search',
      shortcuts: [
        { keys: ['/', 'Ctrl', 'k'], description: 'Open global search', action: 'open-search' },
        { keys: ['f'], description: 'Focus search field', action: 'focus-search' },
        { keys: ['Ctrl', 'f'], description: 'Open advanced filters', action: 'open-filters' },
        { keys: ['Escape'], description: 'Clear search/filters', action: 'clear-search' },
        { keys: ['Enter'], description: 'Apply search/filters', action: 'apply-search' }
      ]
    },
    // Selection & Actions
    {
      category: 'Selection & Actions',
      icon: 'check-square',
      shortcuts: [
        { keys: ['Ctrl', 'a'], description: 'Select all items', action: 'select-all' },
        { keys: ['Ctrl', 'Shift', 'a'], description: 'Deselect all items', action: 'deselect-all' },
        { keys: ['j'], description: 'Select next item', action: 'select-next' },
        { keys: ['k'], description: 'Select previous item', action: 'select-previous' },
        { keys: ['x'], description: 'Toggle item selection', action: 'toggle-selection' },
        { keys: ['Delete'], description: 'Delete selected items', action: 'delete-selected' },
        { keys: ['Ctrl', 'c'], description: 'Copy selected items', action: 'copy-selected' },
        { keys: ['Ctrl', 'v'], description: 'Paste items', action: 'paste-items' }
      ]
    },
    // Data Management
    {
      category: 'Data Management',
      icon: 'database',
      shortcuts: [
        { keys: ['n'], description: 'Create new item', action: 'create-new' },
        { keys: ['e'], description: 'Edit selected item', action: 'edit-item' },
        { keys: ['d'], description: 'Duplicate selected item', action: 'duplicate-item' },
        { keys: ['r'], description: 'Refresh data', action: 'refresh' },
        { keys: ['Ctrl', 's'], description: 'Save changes', action: 'save' },
        { keys: ['Ctrl', 'z'], description: 'Undo last action', action: 'undo' },
        { keys: ['Ctrl', 'y'], description: 'Redo last action', action: 'redo' }
      ]
    },
    // View & Display
    {
      category: 'View & Display',
      icon: 'eye',
      shortcuts: [
        { keys: ['v', '1'], description: 'List view', action: 'view-list' },
        { keys: ['v', '2'], description: 'Grid view', action: 'view-grid' },
        { keys: ['v', '3'], description: 'Card view', action: 'view-card' },
        { keys: ['t'], description: 'Toggle sidebar', action: 'toggle-sidebar' },
        { keys: ['Ctrl', '+'], description: 'Zoom in', action: 'zoom-in' },
        { keys: ['Ctrl', '-'], description: 'Zoom out', action: 'zoom-out' },
        { keys: ['Ctrl', '0'], description: 'Reset zoom', action: 'zoom-reset' }
      ]
    },
    // Quick Actions
    {
      category: 'Quick Actions',
      icon: 'zap',
      shortcuts: [
        { keys: ['Ctrl', 'e'], description: 'Export data', action: 'export' },
        { keys: ['Ctrl', 'i'], description: 'Import data', action: 'import' },
        { keys: ['Ctrl', 'p'], description: 'Print', action: 'print' },
        { keys: ['Ctrl', 'Shift', 'p'], description: 'Quick print', action: 'quick-print' },
        { keys: ['h'], description: 'Show help', action: 'show-help' },
        { keys: ['Ctrl', ','], description: 'Open preferences', action: 'open-preferences' }
      ]
    }
  ];

  const allShortcuts = shortcuts.length > 0 ? shortcuts : defaultShortcuts;

  // Filter shortcuts based on search
  const filteredShortcuts = allShortcuts.map(section => ({
    ...section,
    shortcuts: section.shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(section => section.shortcuts.length > 0);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      const newPressedKeys = new Set(pressedKeys);
      
      // Add modifiers
      if (e.ctrlKey || e.metaKey) newPressedKeys.add('Ctrl');
      if (e.shiftKey) newPressedKeys.add('Shift');
      if (e.altKey) newPressedKeys.add('Alt');
      
      // Add the main key
      newPressedKeys.add(key);
      setPressedKeys(newPressedKeys);

      // Check for shortcut matches
      const keysCombination = Array.from(newPressedKeys);
      const matchedShortcut = findMatchingShortcut(keysCombination);
      
      if (matchedShortcut) {
        e.preventDefault();
        if (onAction) {
          onAction(matchedShortcut.action, matchedShortcut);
        }
        
        // Show hint for the executed action
        if (showHints) {
          setActiveHint({
            description: matchedShortcut.description,
            keys: matchedShortcut.keys
          });
          setTimeout(() => setActiveHint(null), 2000);
        }
      }

      // Special case for showing shortcuts help
      if (key === '?' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        if (onAction) {
          onAction('show-shortcuts');
        }
      }
    };

    const handleKeyUp = () => {
      setPressedKeys(new Set());
    };

    if (!isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys, isVisible, onAction, showHints]);

  // Auto-focus search when modal opens
  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isVisible]);

  const findMatchingShortcut = (pressedKeysCombination) => {
    for (const section of allShortcuts) {
      for (const shortcut of section.shortcuts) {
        if (keysMatch(shortcut.keys, pressedKeysCombination)) {
          return shortcut;
        }
      }
    }
    return null;
  };

  const keysMatch = (shortcutKeys, pressedKeys) => {
    if (shortcutKeys.length !== pressedKeys.length) return false;
    
    return shortcutKeys.every(key => {
      if (key === 'Ctrl' || key === 'Cmd') {
        return pressedKeys.includes('Ctrl');
      }
      return pressedKeys.includes(key);
    });
  };

  const formatKeyDisplay = (key) => {
    const keyMap = {
      'Ctrl': '⌘',
      'Cmd': '⌘',
      'Shift': '⇧',
      'Alt': '⌥',
      'Option': '⌥',
      'Meta': '⌘',
      'Enter': '↵',
      'Escape': 'Esc',
      'Delete': '⌫',
      'Backspace': '⌫',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Tab': '⇥',
      'Space': '␣'
    };
    
    return keyMap[key] || key.toUpperCase();
  };

  const renderShortcutKeys = (keys) => {
    return (
      <ShortcutKeys>
        {keys.map((key, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {index > 0 && <KeySeparator>+</KeySeparator>}
            <KeyBadge>{formatKeyDisplay(key)}</KeyBadge>
          </div>
        ))}
      </ShortcutKeys>
    );
  };

  return (
    <>
      {/* Shortcuts Modal */}
      <AnimatePresence>
        {isVisible && (
          <ShortcutsOverlay
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <ShortcutsModal
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>
                  <Icon name="keyboard" size={24} color="primary" />
                  <Typography variant="h5" weight="semibold">
                    Keyboard Shortcuts
                  </Typography>
                  <Badge variant="info" size="sm">
                    {filteredShortcuts.reduce((sum, section) => sum + section.shortcuts.length, 0)} shortcuts
                  </Badge>
                </ModalTitle>
                
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <Icon name="x" size={20} />
                </Button>
              </ModalHeader>
              
              <ModalContent>
                <SearchInput
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <ShortcutsGrid>
                  {filteredShortcuts.map((section, sectionIndex) => (
                    <ShortcutSection key={section.category}>
                      <SectionTitle>
                        <Icon name={section.icon} size={18} color="primary" />
                        <Typography variant="h6" weight="semibold">
                          {section.category}
                        </Typography>
                        <Badge variant="outline" size="xs">
                          {section.shortcuts.length}
                        </Badge>
                      </SectionTitle>
                      
                      <ShortcutsList>
                        {section.shortcuts.map((shortcut, index) => (
                          <motion.div
                            key={shortcut.action}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: (sectionIndex * 0.1) + (index * 0.05) }}
                          >
                            <ShortcutItem>
                              <ShortcutDescription>
                                <Typography variant="body2">
                                  {shortcut.description}
                                </Typography>
                              </ShortcutDescription>
                              {renderShortcutKeys(shortcut.keys)}
                            </ShortcutItem>
                          </motion.div>
                        ))}
                      </ShortcutsList>
                    </ShortcutSection>
                  ))}
                </ShortcutsGrid>
                
                {filteredShortcuts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Icon name="search" size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <Typography variant="body2" color="secondary">
                      No shortcuts found for "{searchQuery}"
                    </Typography>
                  </div>
                )}
              </ModalContent>
            </ShortcutsModal>
          </ShortcutsOverlay>
        )}
      </AnimatePresence>

      {/* Shortcut Hint */}
      <AnimatePresence>
        {activeHint && showHints && (
          <ShortcutHint
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon name="zap" size={14} color="success" />
              <Typography variant="caption" weight="medium">
                Action Executed
              </Typography>
            </div>
            
            <Typography variant="body2" style={{ marginBottom: '8px' }}>
              {activeHint.description}
            </Typography>
            
            {renderShortcutKeys(activeHint.keys)}
          </ShortcutHint>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardShortcuts;