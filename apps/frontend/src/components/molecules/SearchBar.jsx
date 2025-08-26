import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Input from '../atoms/Input';
import Typography from '../atoms/Typography';

const SearchContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['maxWidth'].includes(prop),
})`
  position: relative;
  width: 100%;
  max-width: ${props => props.maxWidth || '400px'};
  
  &.search-bar {
    /* Print-specific styles are handled in global CSS */
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled(Input).withConfig({
  shouldForwardProp: (prop) => prop !== 'hasValue'
})`
  padding-left: ${props => props.theme.spacing[10]};
  padding-right: ${props => props.hasValue ? props.theme.spacing[10] : props.theme.spacing[4]};
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.tertiary};
  z-index: 1;
  pointer-events: none;
`;

const ClearButton = styled(motion.button)`
  position: absolute;
  right: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[1]};
  color: ${props => props.theme.colors.text.tertiary};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    color: ${props => props.theme.colors.text.secondary};
    background-color: ${props => props.theme.colors.gray[100]};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const SuggestionsContainer = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.lg};
  margin-top: ${props => props.theme.spacing[1]};
  max-height: 300px;
  overflow-y: auto;
`;

const SuggestionItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  transition: background-color ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.highlighted && css`
    background-color: ${props.theme.colors.primary[50]};
  `}
`;

const SuggestionIcon = styled.div`
  color: ${props => props.theme.colors.text.tertiary};
  flex-shrink: 0;
`;

const SuggestionText = styled.div`
  flex: 1;
  min-width: 0;
`;

const SuggestionCategory = styled.div`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  background-color: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const NoResults = styled.div`
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.text.tertiary};
`;

const RecentSearches = styled.div`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  background-color: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ClearRecentButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary[600]};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:hover {
    color: ${props => props.theme.colors.primary[700]};
  }
`;

const SearchBar = ({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  onClear,
  suggestions = [],
  showSuggestions = true,
  loading = false,
  disabled = false,
  recentSearches = [],
  onRecentSearch,
  onClearRecent,
  maxWidth,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  
  const searchValue = value !== undefined ? value : internalValue;
  const hasValue = searchValue.length > 0;
  const showRecent = !hasValue && recentSearches.length > 0 && isFocused;
  const showSuggestionsList = showSuggestions && (suggestions.length > 0 || showRecent) && showDropdown;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(e);
    setHighlightedIndex(-1);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding dropdown to allow suggestion clicks
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleClear = () => {
    const event = { target: { value: '' } };
    
    if (value === undefined) {
      setInternalValue('');
    }
    
    onChange?.(event);
    onClear?.();
    inputRef.current?.focus();
    setShowDropdown(false);
  };

  const handleSuggestionClick = (suggestion) => {
    const event = { target: { value: suggestion.value || suggestion } };
    
    if (value === undefined) {
      setInternalValue(suggestion.value || suggestion);
    }
    
    onChange?.(event);
    onSearch?.(suggestion.value || suggestion);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestionsList) return;
    
    const items = showRecent ? recentSearches : suggestions;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const item = items[highlightedIndex];
          handleSuggestionClick(item);
        } else {
          onSearch?.(searchValue);
          setShowDropdown(false);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    const category = suggestion.category || 'Results';
    if (!acc[category]) acc[category] = [];
    acc[category].push(suggestion);
    return acc;
  }, {});

  return (
    <SearchContainer ref={containerRef} maxWidth={maxWidth} className={`search-bar ${className || ''}`}>
      <SearchInputContainer>
        <SearchIcon>
          <Icon name="search" size={20} />
        </SearchIcon>
        
        <SearchInput
          ref={inputRef}
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          hasValue={hasValue}
          {...props}
        />
        
        <AnimatePresence>
          {hasValue && (
            <ClearButton
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Icon name="close" size={16} />
            </ClearButton>
          )}
        </AnimatePresence>
      </SearchInputContainer>

      <AnimatePresence>
        {showSuggestionsList && (
          <SuggestionsContainer
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {showRecent && (
              <>
                <RecentSearches>
                  <Typography variant="caption" color="secondary">
                    Recent searches
                  </Typography>
                  {onClearRecent && (
                    <ClearRecentButton onClick={onClearRecent}>
                      Clear
                    </ClearRecentButton>
                  )}
                </RecentSearches>
                {recentSearches.map((item, index) => (
                  <SuggestionItem
                    key={`recent-${index}`}
                    onClick={() => handleSuggestionClick(item)}
                    highlighted={index === highlightedIndex}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  >
                    <SuggestionIcon>
                      <Icon name="clock" size={16} />
                    </SuggestionIcon>
                    <SuggestionText>
                      <Typography variant="body2">
                        {item.label || item}
                      </Typography>
                    </SuggestionText>
                  </SuggestionItem>
                ))}
              </>
            )}

            {!showRecent && suggestions.length > 0 && (
              <>
                {Object.entries(groupedSuggestions).map(([category, items]) => (
                  <div key={category}>
                    {Object.keys(groupedSuggestions).length > 1 && (
                      <SuggestionCategory>
                        <Typography variant="caption" color="secondary">
                          {category}
                        </Typography>
                      </SuggestionCategory>
                    )}
                    {items.map((suggestion, index) => {
                      const globalIndex = suggestions.indexOf(suggestion);
                      return (
                        <SuggestionItem
                          key={`${category}-${index}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          highlighted={globalIndex === highlightedIndex}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        >
                          {suggestion.icon && (
                            <SuggestionIcon>
                              <Icon name={suggestion.icon} size={16} />
                            </SuggestionIcon>
                          )}
                          <SuggestionText>
                            <Typography variant="body2">
                              {suggestion.label || suggestion}
                            </Typography>
                            {suggestion.description && (
                              <Typography variant="caption" color="tertiary">
                                {suggestion.description}
                              </Typography>
                            )}
                          </SuggestionText>
                        </SuggestionItem>
                      );
                    })}
                  </div>
                ))}
              </>
            )}

            {!showRecent && suggestions.length === 0 && hasValue && (
              <NoResults>
                <Typography variant="body2" color="tertiary">
                  No results found
                </Typography>
              </NoResults>
            )}
          </SuggestionsContainer>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

export default SearchBar;