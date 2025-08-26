import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const TagInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.body2.fontSize};
  line-height: ${props => props.theme.typography.body2.lineHeight};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const SuggestionsDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-top: none;
  border-radius: 0 0 ${props => props.theme.spacing[2]} ${props => props.theme.spacing[2]};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['isHighlighted', 'isSelected'].includes(prop)
})`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease;

  ${props => props.isHighlighted && css`
    background: ${props.theme.colors.primary[50]};
  `}

  ${props => props.isSelected && css`
    background: ${props.theme.colors.primary[100]};
    color: ${props.theme.colors.primary[700]};
  `}

  &:hover {
    background: ${props => props.theme.colors.primary[25]};
  }
`;

const SuggestionText = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SuggestionBadge = styled(Badge)`
  font-size: 10px;
`;

const SelectedTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[2]};
  min-height: 32px;
  padding: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.subtle};
`;

const SelectedTag = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.tag.color + '20' || props.theme.colors.primary[100]};
  color: ${props => props.tag.color || props.theme.colors.primary[700]};
  border: 1px solid ${props => (props.tag.color || props.theme.colors.primary[500]) + '40'};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: 12px;
  font-weight: 500;
`;

const RemoveTagButton = styled(Button)`
  min-width: auto;
  width: 16px;
  height: 16px;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  opacity: 0.7;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 12px;
  height: 28px;
`;

const TagSelector = ({
  availableTags = [],
  selectedTags = [],
  onChange,
  placeholder = 'Type to search and add tags...',
  maxTags = null,
  allowCreate = false,
  className,
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Filter suggestions based on input and exclude already selected tags
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    
    const searchTerm = inputValue.toLowerCase();
    const selectedTagIds = selectedTags.map(tag => tag.id || tag);
    
    return availableTags
      .filter(tag => 
        !selectedTagIds.includes(tag.id) &&
        (tag.name.toLowerCase().includes(searchTerm) ||
         tag.description?.toLowerCase().includes(searchTerm))
      )
      .slice(0, 10); // Limit suggestions
  }, [inputValue, availableTags, selectedTags]);

  // Handle input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur
  const handleInputBlur = (e) => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }, 150);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleTagSelect(suggestions[highlightedIndex]);
        } else if (allowCreate && inputValue.trim()) {
          handleCreateTag(inputValue.trim());
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle tag selection
  const handleTagSelect = (tag) => {
    if (maxTags && selectedTags.length >= maxTags) return;
    
    const newSelectedTags = [...selectedTags, tag];
    onChange?.(newSelectedTags);
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle creating new tag
  const handleCreateTag = (tagName) => {
    if (maxTags && selectedTags.length >= maxTags) return;
    
    const newTag = {
      id: `temp_${Date.now()}`,
      name: tagName,
      color: '#10b981',
      icon: 'tag',
      isNew: true
    };
    
    const newSelectedTags = [...selectedTags, newTag];
    onChange?.(newSelectedTags);
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle tag removal
  const handleTagRemove = (tagToRemove) => {
    const newSelectedTags = selectedTags.filter(tag => 
      (tag.id || tag) !== (tagToRemove.id || tagToRemove)
    );
    onChange?.(newSelectedTags);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const canAddMore = !maxTags || selectedTags.length < maxTags;
  const shouldShowCreateOption = allowCreate && inputValue.trim() && 
    !suggestions.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase());

  return (
    <SelectorContainer ref={containerRef} className={className} {...props}>
      {/* Selected Tags Display */}
      <SelectedTagsContainer>
        {selectedTags.length === 0 ? (
          <EmptyState>No tags selected</EmptyState>
        ) : (
          <AnimatePresence>
            {selectedTags.map((tag, index) => (
              <SelectedTag
                key={tag.id || tag.name || index}
                tag={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {tag.icon && <Icon name={tag.icon} size={12} />}
                <span>{tag.name}</span>
                {tag.isNew && (
                  <SuggestionBadge variant="success" size="xs">
                    New
                  </SuggestionBadge>
                )}
                <RemoveTagButton
                  variant="ghost"
                  size="xs"
                  onClick={() => handleTagRemove(tag)}
                  title="Remove tag"
                >
                  <Icon name="x" size={12} />
                </RemoveTagButton>
              </SelectedTag>
            ))}
          </AnimatePresence>
        )}
      </SelectedTagsContainer>

      {/* Tag Input */}
      {canAddMore && (
        <InputContainer>
          <TagInput
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={!canAddMore}
          />

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {isOpen && (suggestions.length > 0 || shouldShowCreateOption) && (
              <SuggestionsDropdown
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {suggestions.map((tag, index) => (
                  <SuggestionItem
                    key={tag.id}
                    isHighlighted={index === highlightedIndex}
                    isSelected={selectedTags.some(selected => 
                      (selected.id || selected) === tag.id
                    )}
                    onClick={() => handleTagSelect(tag)}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <SuggestionText>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {tag.icon && <Icon name={tag.icon} size={12} />}
                        <Typography variant="body2" weight="medium">
                          {tag.name}
                        </Typography>
                        <SuggestionBadge 
                          variant="secondary" 
                          size="xs"
                          style={{ 
                            backgroundColor: tag.color + '20',
                            color: tag.color
                          }}
                        >
                          {tag.productCount || 0}
                        </SuggestionBadge>
                      </div>
                      {tag.description && (
                        <Typography variant="caption" color="secondary">
                          {tag.description}
                        </Typography>
                      )}
                    </SuggestionText>
                  </SuggestionItem>
                ))}

                {/* Create new tag option */}
                {shouldShowCreateOption && (
                  <SuggestionItem
                    isHighlighted={highlightedIndex === suggestions.length}
                    onClick={() => handleCreateTag(inputValue.trim())}
                  >
                    <SuggestionText>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="plus" size={12} />
                        <Typography variant="body2" weight="medium">
                          Create "{inputValue}"
                        </Typography>
                        <SuggestionBadge variant="success" size="xs">
                          New
                        </SuggestionBadge>
                      </div>
                    </SuggestionText>
                  </SuggestionItem>
                )}
              </SuggestionsDropdown>
            )}
          </AnimatePresence>
        </InputContainer>
      )}

      {/* Info text */}
      {maxTags && (
        <Typography variant="caption" color="secondary">
          {selectedTags.length} / {maxTags} tags selected
          {!canAddMore && ' (maximum reached)'}
        </Typography>
      )}
    </SelectorContainer>
  );
};

export default TagSelector;