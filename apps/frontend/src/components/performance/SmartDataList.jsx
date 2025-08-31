/**
 * SmartDataList Component - PERF-003: Virtual scrolling for large datasets
 * Intelligent data list component that automatically optimizes rendering based on dataset size
 */

import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import VirtualScrollList from './VirtualScrollList';
import { useInfiniteScrollWithSearch } from '../hooks/useInfiniteScroll';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

const SmartDataListContainer = styled.div`
  width: 100%;
  height: ${props => props.height || '400px'};
  background: ${props => props.theme.colors.background.card};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ListHeader = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.elevated};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[3]};
  flex-shrink: 0;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
  max-width: 400px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const ListContent = styled.div`
  flex: 1;
  position: relative;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.text.secondary};
  gap: ${props => props.theme.spacing[3]};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.error[600]};
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.colors.background.card}aa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
`;

const RetryButton = styled(Button)`
  margin-top: ${props => props.theme.spacing[2]};
`;

/**
 * Smart Data List Component
 * Automatically switches between virtual scrolling and regular rendering based on dataset size
 */
const SmartDataList = ({
  // Data props
  data = [],
  fetchMore,
  
  // Rendering props
  renderItem,
  itemHeight = 60,
  keyExtractor = (item, index) => item.id || index,
  
  // Layout props
  height = '400px',
  className,
  
  // Search & Filter props
  searchable = false,
  searchPlaceholder = 'Search items...',
  onSearch,
  filterable = false,
  filters = [],
  onFilter,
  
  // Virtualization props
  virtualizeThreshold = 100, // Switch to virtual scrolling above this count
  overscan = 5,
  
  // Infinite scroll props
  infiniteScroll = false,
  hasMore = false,
  pageSize = 50,
  
  // State props
  loading = false,
  error = null,
  emptyMessage = 'No items found',
  
  // Event handlers
  onItemClick,
  onSelectionChange,
  selectable = false,
  
  // Performance monitoring
  onPerformanceMetric,
  
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Determine if we should use virtual scrolling
  const shouldVirtualize = useMemo(() => {
    return data.length > virtualizeThreshold;
  }, [data.length, virtualizeThreshold]);

  // Infinite scroll hook (if enabled)
  const infiniteScrollData = useInfiniteScrollWithSearch({
    fetchMore: infiniteScroll ? fetchMore : null,
    searchQuery,
    filters: selectedFilters,
    hasMore,
    pageSize,
    enabled: infiniteScroll
  });

  // Use either infinite scroll data or provided data
  const listData = infiniteScroll ? infiniteScrollData.items : data;
  const isLoading = infiniteScroll ? infiniteScrollData.loading : loading;
  const listError = infiniteScroll ? infiniteScrollData.error : error;

  // Filter and search data (if not using infinite scroll)
  const filteredData = useMemo(() => {
    if (infiniteScroll) return listData;

    let filtered = [...listData];

    // Apply search
    if (searchQuery && searchable) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        // Default search implementation - searches all string values
        return Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    if (filterable && Object.keys(selectedFilters).length > 0) {
      filtered = filtered.filter(item => {
        return Object.entries(selectedFilters).every(([key, value]) => {
          if (!value) return true;
          return item[key] === value;
        });
      });
    }

    return filtered;
  }, [listData, searchQuery, selectedFilters, searchable, filterable, infiniteScroll]);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    onSearch?.(query);
  }, [onSearch]);

  // Handle filter change
  const handleFilterChange = useCallback((filterKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    onFilter?.(filterKey, value);
  }, [onFilter]);

  // Handle item selection
  const handleItemSelect = useCallback((item, index, selected) => {
    const key = keyExtractor(item, index);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      onSelectionChange?.(Array.from(newSet), newSet);
      return newSet;
    });
  }, [keyExtractor, onSelectionChange]);

  // Enhanced render item with selection support
  const enhancedRenderItem = useCallback((item, index) => {
    const key = keyExtractor(item, index);
    const isSelected = selectedItems.has(key);
    
    return renderItem(item, index, {
      selected: isSelected,
      onSelect: selectable ? (selected) => handleItemSelect(item, index, selected) : undefined,
      onClick: onItemClick ? (event) => onItemClick(item, index, event) : undefined
    });
  }, [renderItem, keyExtractor, selectedItems, selectable, handleItemSelect, onItemClick]);

  // Retry handler
  const handleRetry = useCallback(() => {
    if (infiniteScroll) {
      infiniteScrollData.reset();
    }
  }, [infiniteScroll, infiniteScrollData]);

  // Performance monitoring
  const handlePerformanceMetric = useCallback((metric) => {
    onPerformanceMetric?.({
      ...metric,
      dataSize: filteredData.length,
      virtualized: shouldVirtualize,
      infiniteScroll
    });
  }, [onPerformanceMetric, filteredData.length, shouldVirtualize, infiniteScroll]);

  // Render error state
  if (listError && filteredData.length === 0) {
    return (
      <SmartDataListContainer height={height} className={className} {...props}>
        <ErrorState>
          <Icon name="alert-circle" size={48} />
          <div>
            <div>Failed to load data</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {listError.message || 'An unexpected error occurred'}
            </div>
          </div>
          <RetryButton onClick={handleRetry} variant="outline" size="sm">
            Try Again
          </RetryButton>
        </ErrorState>
      </SmartDataListContainer>
    );
  }

  // Render empty state
  if (!isLoading && filteredData.length === 0) {
    return (
      <SmartDataListContainer height={height} className={className} {...props}>
        {(searchable || filterable) && (
          <ListHeader>
            {searchable && (
              <SearchContainer>
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  leftIcon="search"
                />
              </SearchContainer>
            )}
            {filterable && (
              <FilterContainer>
                {filters.map(filter => (
                  <select
                    key={filter.key}
                    value={selectedFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  >
                    <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ))}
              </FilterContainer>
            )}
          </ListHeader>
        )}
        
        <EmptyState>
          <Icon name="inbox" size={48} />
          <div>{emptyMessage}</div>
          {searchQuery && (
            <Button onClick={() => handleSearch('')} variant="outline" size="sm">
              Clear Search
            </Button>
          )}
        </EmptyState>
      </SmartDataListContainer>
    );
  }

  return (
    <SmartDataListContainer height={height} className={className} {...props}>
      {/* Header with search and filters */}
      {(searchable || filterable) && (
        <ListHeader>
          {searchable && (
            <SearchContainer>
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                leftIcon="search"
              />
            </SearchContainer>
          )}
          
          {filterable && (
            <FilterContainer>
              {filters.map(filter => (
                <select
                  key={filter.key}
                  value={selectedFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </FilterContainer>
          )}
          
          <StatsContainer>
            <span>{filteredData.length} items</span>
            {shouldVirtualize && <span>• Virtualized</span>}
            {infiniteScroll && <span>• Infinite Scroll</span>}
            {selectedItems.size > 0 && <span>• {selectedItems.size} selected</span>}
          </StatsContainer>
        </ListHeader>
      )}

      {/* List content */}
      <ListContent>
        {shouldVirtualize ? (
          <VirtualScrollList
            items={filteredData}
            itemHeight={itemHeight}
            height="100%"
            renderItem={enhancedRenderItem}
            overscan={overscan}
            loading={isLoading}
            onScrollEnd={infiniteScroll ? infiniteScrollData.loadMore : undefined}
            itemKey={keyExtractor}
          />
        ) : (
          <div style={{ height: '100%', overflow: 'auto', padding: '8px' }}>
            {filteredData.map((item, index) => (
              <div key={keyExtractor(item, index)} style={{ marginBottom: '4px' }}>
                {enhancedRenderItem(item, index)}
              </div>
            ))}
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && filteredData.length === 0 && (
          <LoadingOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon name="loader" size={24} />
              <span>Loading items...</span>
            </div>
          </LoadingOverlay>
        )}
      </ListContent>
    </SmartDataListContainer>
  );
};

export default SmartDataList;