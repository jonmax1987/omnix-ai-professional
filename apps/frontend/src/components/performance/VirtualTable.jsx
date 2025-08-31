/**
 * VirtualTable Component - PERF-003: Virtual scrolling for large datasets
 * High-performance virtual table for rendering large datasets efficiently
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Icon from '../atoms/Icon';

const VirtualTableContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.height || '400px'};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.card};
  overflow: hidden;
`;

const VirtualTableHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${props => props.theme.colors.background.elevated};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  width: 100%;
  min-width: ${props => props.totalWidth}px;
`;

const VirtualTableHeaderCell = styled.div`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  border-right: 1px solid ${props => props.theme.colors.border.subtle};
  width: ${props => props.width}px;
  min-width: ${props => props.minWidth}px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  user-select: none;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background: ${props => props.sortable ? props.theme.colors.background.hover : 'transparent'};
  }
`;

const VirtualTableBody = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 60px);
  overflow: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.default};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme.colors.border.strong};
    }
  }
`;

const VirtualTableContent = styled.div`
  position: relative;
  width: ${props => props.totalWidth}px;
  height: ${props => props.totalHeight}px;
`;

const VirtualTableViewport = styled.div`
  position: absolute;
  top: ${props => props.offsetY}px;
  left: 0;
  width: 100%;
`;

const VirtualTableRow = styled(motion.div)`
  display: flex;
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.isSelected ? props.theme.colors.primary[50] : 'transparent'};
  
  &:hover {
    background: ${props => props.isSelected ? props.theme.colors.primary[100] : props.theme.colors.background.hover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const VirtualTableCell = styled.div`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  border-right: 1px solid ${props => props.theme.colors.border.subtle};
  width: ${props => props.width}px;
  min-width: ${props => props.minWidth}px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:last-child {
    border-right: none;
  }
`;

const SortIcon = styled(Icon)`
  opacity: ${props => props.$active ? 1 : 0.5};
  transform: ${props => props.$direction === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: all 0.2s ease;
`;

const LoadingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  gap: ${props => props.theme.spacing[2]};
`;

/**
 * Hook for virtual table functionality
 */
function useVirtualTable({
  data = [],
  columns = [],
  rowHeight = 48,
  containerHeight = 400,
  overscan = 5
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  const scrollTimeoutRef = useRef(null);

  // Calculate total table width
  const totalWidth = useMemo(() => {
    return columns.reduce((total, column) => total + (column.width || 150), 0);
  }, [columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [data, sortConfig]);

  // Calculate visible range
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    if (!sortedData.length) {
      return { startIndex: 0, endIndex: 0, offsetY: 0 };
    }

    const visibleRowCount = Math.ceil(containerHeight / rowHeight);
    const startIdx = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIdx = Math.min(
      sortedData.length - 1,
      startIdx + visibleRowCount + overscan * 2
    );

    return {
      startIndex: startIdx,
      endIndex: endIdx,
      offsetY: startIdx * rowHeight
    };
  }, [scrollTop, sortedData.length, rowHeight, containerHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback((event) => {
    const { scrollTop: newScrollTop, scrollLeft: newScrollLeft } = event.target;
    setScrollTop(newScrollTop);
    setScrollLeft(newScrollLeft);
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Handle sort
  const handleSort = useCallback((columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback((rowIndex, isSelected) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(rowIndex);
      } else {
        newSet.delete(rowIndex);
      }
      return newSet;
    });
  }, []);

  // Select all rows
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedRows(new Set(sortedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  }, [sortedData]);

  const totalHeight = sortedData.length * rowHeight;
  const visibleRows = sortedData.slice(startIndex, endIndex + 1);

  return {
    sortedData,
    visibleRows,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    totalWidth,
    isScrolling,
    sortConfig,
    selectedRows,
    scrollLeft,
    handleScroll,
    handleSort,
    handleRowSelect,
    handleSelectAll
  };
}

/**
 * Virtual Table Component
 */
const VirtualTable = ({
  data = [],
  columns = [],
  height = '400px',
  rowHeight = 48,
  overscan = 5,
  loading = false,
  selectable = false,
  sortable = true,
  onRowClick,
  onRowSelect,
  onSort,
  emptyMessage = 'No data available',
  className,
  ...props
}) => {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(400);

  // Parse height
  const numericHeight = useMemo(() => {
    if (typeof height === 'number') return height;
    if (typeof height === 'string') {
      return parseInt(height.replace('px', ''), 10) || 400;
    }
    return 400;
  }, [height]);

  // Update container height
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setContainerHeight(entry.contentRect.height - 60); // Account for header
        }
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const {
    sortedData,
    visibleRows,
    startIndex,
    offsetY,
    totalHeight,
    totalWidth,
    isScrolling,
    sortConfig,
    selectedRows,
    scrollLeft,
    handleScroll,
    handleSort,
    handleRowSelect,
    handleSelectAll
  } = useVirtualTable({
    data,
    columns,
    rowHeight,
    containerHeight: numericHeight - 60,
    overscan
  });

  // Enhanced sort handler
  const enhancedHandleSort = useCallback((columnKey) => {
    if (!sortable) return;
    handleSort(columnKey);
    onSort?.(columnKey, sortConfig.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc');
  }, [sortable, handleSort, onSort, sortConfig]);

  // Enhanced row select handler
  const enhancedHandleRowSelect = useCallback((rowIndex, isSelected) => {
    handleRowSelect(rowIndex, isSelected);
    onRowSelect?.(selectedRows, rowIndex, isSelected);
  }, [handleRowSelect, onRowSelect, selectedRows]);

  // Enhanced row click handler
  const enhancedHandleRowClick = useCallback((row, rowIndex, event) => {
    onRowClick?.(row, rowIndex, event);
  }, [onRowClick]);

  // Render empty state
  if (!loading && data.length === 0) {
    return (
      <VirtualTableContainer height={height} className={className} {...props}>
        <EmptyState>
          <Icon name="table" size={32} />
          <span>{emptyMessage}</span>
        </EmptyState>
      </VirtualTableContainer>
    );
  }

  return (
    <VirtualTableContainer
      ref={containerRef}
      height={height}
      className={className}
      {...props}
    >
      {/* Table Header */}
      <VirtualTableHeader totalWidth={totalWidth} style={{ transform: `translateX(-${scrollLeft}px)` }}>
        {selectable && (
          <VirtualTableHeaderCell
            width={48}
            minWidth={48}
          >
            <input
              type="checkbox"
              checked={selectedRows.size === sortedData.length && sortedData.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </VirtualTableHeaderCell>
        )}
        {columns.map((column) => (
          <VirtualTableHeaderCell
            key={column.key}
            width={column.width || 150}
            minWidth={column.minWidth || 100}
            sortable={sortable && column.sortable !== false}
            onClick={() => enhancedHandleSort(column.key)}
          >
            <span>{column.title}</span>
            {sortable && column.sortable !== false && (
              <SortIcon
                name="chevron-up"
                size={14}
                $active={sortConfig.key === column.key}
                $direction={sortConfig.key === column.key ? sortConfig.direction : 'asc'}
              />
            )}
          </VirtualTableHeaderCell>
        ))}
      </VirtualTableHeader>

      {/* Table Body */}
      <VirtualTableBody onScroll={handleScroll}>
        {loading && data.length === 0 ? (
          <LoadingIndicator>
            <Icon name="loader" size={16} />
            <span>Loading data...</span>
          </LoadingIndicator>
        ) : (
          <VirtualTableContent totalWidth={totalWidth} totalHeight={totalHeight}>
            <VirtualTableViewport offsetY={offsetY}>
              {visibleRows.map((row, index) => {
                const actualIndex = startIndex + index;
                const isSelected = selectedRows.has(actualIndex);
                
                return (
                  <VirtualTableRow
                    key={row.id || actualIndex}
                    style={{ height: rowHeight }}
                    isSelected={isSelected}
                    onClick={(e) => enhancedHandleRowClick(row, actualIndex, e)}
                    initial={isScrolling ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {selectable && (
                      <VirtualTableCell width={48} minWidth={48}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            enhancedHandleRowSelect(actualIndex, e.target.checked);
                          }}
                        />
                      </VirtualTableCell>
                    )}
                    {columns.map((column) => (
                      <VirtualTableCell
                        key={column.key}
                        width={column.width || 150}
                        minWidth={column.minWidth || 100}
                      >
                        {column.render ? column.render(row[column.key], row, actualIndex) : row[column.key]}
                      </VirtualTableCell>
                    ))}
                  </VirtualTableRow>
                );
              })}
            </VirtualTableViewport>
          </VirtualTableContent>
        )}
      </VirtualTableBody>
    </VirtualTableContainer>
  );
};

export default VirtualTable;
export { useVirtualTable };