import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { baseShouldForwardProp } from '../../utils/styledUtils';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';
import TableRow from '../molecules/TableRow';
import SearchBar from '../molecules/SearchBar';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { useI18n } from '../../hooks/useI18n.jsx';

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
  border-radius: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  overflow: hidden;
  
  &.data-table {
    /* Print-specific styles are handled in global CSS */
  }
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  gap: ${props => props.theme?.spacing?.[4] || '1rem'};
  padding: ${props => props.theme?.spacing?.[4] || '1rem'} ${props => props.theme?.spacing?.[6] || '1.5rem'};
  border-bottom: 1px solid ${props => props.theme?.colors?.border?.subtle || '#f1f5f9'};
  flex-wrap: wrap;
  
  &.table-header {
    /* Print-specific styles are handled in global CSS */
  }
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    padding: ${props => props.theme?.spacing?.[3] || '0.75rem'} ${props => props.theme?.spacing?.[4] || '1rem'};
    gap: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[4] || '1rem'};
  flex: 1;
  min-width: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  flex-shrink: 0;
`;

const TableTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 300px;
  min-width: 200px;
`;

const FiltersContainer = styled(motion.div).withConfig({
  shouldForwardProp: baseShouldForwardProp
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  padding: ${props => props.theme?.spacing?.[3] || '0.75rem'} ${props => props.theme?.spacing?.[6] || '1.5rem'};
  background: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
  border-bottom: 1px solid ${props => props.theme?.colors?.border?.subtle || '#f1f5f9'};
  overflow-x: auto;
  
  &.filters {
    /* Print-specific styles are handled in global CSS */
  }
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    padding: ${props => props.theme?.spacing?.[3] || '0.75rem'} ${props => props.theme?.spacing?.[4] || '1rem'};
  }
`;

const FilterChip = styled(motion.button).withConfig({
  shouldForwardProp: baseShouldForwardProp
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  padding: ${props => props.theme?.spacing?.[1] || '0.25rem'} ${props => props.theme?.spacing?.[2] || '0.5rem'};
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
  border-radius: ${props => props.theme?.spacing?.[4] || '1rem'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '0.875rem'};
  cursor: pointer;
  white-space: nowrap;
  transition: all ${props => props.theme?.animation?.duration?.fast || '150ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
  
  &:hover {
    border-color: ${props => props.theme?.colors?.border?.strong || '#d1d5db'};
    background: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
  }
`;

const BulkActionsBar = styled(motion.div).withConfig({
  shouldForwardProp: baseShouldForwardProp
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme?.spacing?.[3] || '0.75rem'} ${props => props.theme?.spacing?.[6] || '1.5rem'};
  background: ${props => props.theme?.colors?.primary?.[50] || '#f0f9ff'};
  border-bottom: 1px solid ${props => props.theme?.colors?.border?.subtle || '#f1f5f9'};
  
  &.bulk-actions {
    /* Print-specific styles are handled in global CSS */
  }
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    padding: ${props => props.theme?.spacing?.[3] || '0.75rem'} ${props => props.theme?.spacing?.[4] || '1rem'};
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  }
`;

const BulkActionsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[3] || '0.75rem'};
`;

const BulkActionsRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  flex: 1;
`;

const Table = styled.table.withConfig({
  shouldForwardProp: (prop) => !['density'].includes(prop),
})`
  width: 100%;
  border-collapse: collapse;
  
  ${props => props.density === 'compact' && css`
    th, td {
      padding: ${props.theme?.spacing?.[2] || '0.5rem'} ${props.theme?.spacing?.[3] || '0.75rem'};
    }
  `}
  
  ${props => props.density === 'comfortable' && css`
    th, td {
      padding: ${props.theme?.spacing?.[4] || '1rem'} ${props.theme?.spacing?.[4] || '1rem'};
    }
  `}
`;

const TableHead = styled.thead`
  background: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
  border-bottom: 1px solid ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
`;

const TableHeaderCell = styled.th.withConfig({
  shouldForwardProp: (prop) => !['sortable', 'width', 'align'].includes(prop),
})`
  padding: ${props => props.theme?.spacing?.[3] || '0.75rem'} ${props => props.theme?.spacing?.[4] || '1rem'};
  text-align: left;
  font-weight: ${props => props.theme?.typography?.fontWeight?.medium || '500'};
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '0.875rem'};
  white-space: nowrap;
  user-select: none;
  
  ${props => props.sortable && css`
    cursor: pointer;
    
    &:hover {
      background: ${props.theme?.colors?.background?.primary || '#ffffff'};
    }
  `}
  
  ${props => props.width && css`
    width: ${props.width};
  `}
  
  ${props => props.align && css`
    text-align: ${props.align};
  `}
`;

const SortButton = styled.div.withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  
  ${props => props.active && css`
    color: ${props.theme?.colors?.primary?.[600] || '#2563eb'};
  `}
`;

const TableBody = styled.tbody``;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  padding: ${props => props.theme?.spacing?.[8] || '2rem'} ${props => props.theme?.spacing?.[4] || '1rem'};
  text-align: center;
  color: ${props => props.theme?.colors?.text?.tertiary || '#9ca3af'};
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme?.spacing?.[8] || '2rem'};
`;

const TableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme?.spacing?.[4] || '1rem'} ${props => props.theme?.spacing?.[6] || '1.5rem'};
  border-top: 1px solid ${props => props.theme?.colors?.border?.subtle || '#f1f5f9'};
  background: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
  
  &.table-footer {
    /* Print-specific styles are handled in global CSS */
  }
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    padding: ${props => props.theme?.spacing?.[3] || '0.75rem'} ${props => props.theme?.spacing?.[4] || '1rem'};
    flex-direction: column;
    gap: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  }
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  color: ${props => props.theme?.colors?.text?.secondary || '#6b7280'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '0.875rem'};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  
  &.pagination-controls {
    /* Print-specific styles are handled in global CSS */
  }
`;

const PageSizeSelect = styled.select`
  padding: ${props => props.theme?.spacing?.[1] || '0.25rem'} ${props => props.theme?.spacing?.[2] || '0.5rem'};
  border: 1px solid ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
  border-radius: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '0.875rem'};
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ExportDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const ExportButton = styled(Button)`
  &.export-button {
    /* Print-specific styles are handled in global CSS */
  }
`;

const ExportMenu = styled(motion.div).withConfig({
  shouldForwardProp: baseShouldForwardProp
})`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  background: ${props => props.theme?.colors?.background?.elevated || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
  border-radius: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  box-shadow: ${props => props.theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'};
  margin-top: ${props => props.theme?.spacing?.[1] || '0.25rem'};
  min-width: 120px;
  overflow: hidden;
  
  /* RTL Support */
  [dir="rtl"] & {
    right: auto;
    left: 0;
  }
`;

const ExportMenuItem = styled(motion.button).withConfig({
  shouldForwardProp: baseShouldForwardProp
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.[2] || '0.5rem'};
  width: 100%;
  padding: ${props => props.theme?.spacing?.[2] || '0.5rem'} ${props => props.theme?.spacing?.[3] || '0.75rem'};
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${props => props.theme?.colors?.text?.primary || '#1f2937'};
  transition: background-color ${props => props.theme?.animation?.duration?.fast || '150ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
  
  &:hover {
    background-color: ${props => props.theme?.colors?.background?.secondary || '#f8fafc'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const DataTable = ({
  title,
  description,
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  sortable = true,
  selectable = false,
  selectedItems = [],
  filterable = false,
  filters = [],
  actions = [],
  bulkActions = [],
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  density = 'default',
  emptyStateTitle = 'No data found',
  emptyStateDescription = 'There are no items to display.',
  emptyStateIcon = 'search',
  exportable = false,
  exportFilename,
  exportFormats = ['csv', 'pdf'],
  onSearch,
  onSort,
  onSelect,
  onSelectAll,
  onRowClick,
  onAction,
  onBulkAction,
  onFilter,
  onExport,
  className,
  sortField,
  sortDirection,
  emptyMessage,
  ...props
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: sortField || null, direction: sortDirection || 'asc' });
  const [internalSelectedRows, setInternalSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Use external selectedItems if provided, otherwise use internal state
  const selectedRows = useMemo(() => {
    if (selectable && selectedItems && selectedItems.length >= 0) {
      return new Set(selectedItems.map(item => item.id || item.key || JSON.stringify(item)));
    }
    return internalSelectedRows;
  }, [selectedItems, internalSelectedRows, selectable]);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [activeFilters, setActiveFilters] = useState(new Map());
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportDropdownRef = useRef(null);

  // Handle clicking outside export dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery && searchable) {
      result = result.filter(row => 
        columns.some(col => {
          const value = col.accessor ? row[col.accessor] : row[col.key];
          return String(value || '').toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply filters
    activeFilters.forEach((filterValue, filterKey) => {
      if (filterValue) {
        result = result.filter(row => {
          const value = row[filterKey];
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    return result;
  }, [data, searchQuery, columns, searchable, activeFilters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const totalItems = sortedData.length;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    onSearch?.(query);
  }, [onSearch]);

  const handleSort = useCallback((columnKey) => {
    const direction = sortConfig.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { key: columnKey, direction };
    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  }, [sortConfig, onSort]);

  const handleSelectRow = useCallback((rowData, checked) => {
    if (selectable && selectedItems && selectedItems.length >= 0) {
      // External state management - just call the callback
      onSelect?.(rowData, checked);
    } else {
      // Internal state management
      const newSelection = new Set(selectedRows);
      const rowId = rowData.id || rowData.key || JSON.stringify(rowData);
      
      if (checked) {
        newSelection.add(rowId);
      } else {
        newSelection.delete(rowId);
      }
      
      setInternalSelectedRows(newSelection);
      onSelect?.(Array.from(newSelection));
    }
  }, [selectedRows, onSelect, selectable, selectedItems]);

  const handleSelectAll = useCallback((checked) => {
    if (selectable && selectedItems && selectedItems.length >= 0) {
      // External state management - just call the callback
      if (checked) {
        onSelectAll?.(paginatedData);
      } else {
        onSelectAll?.([]);
      }
    } else {
      // Internal state management
      if (checked) {
        const allIds = paginatedData.map(row => row.id || row.key || JSON.stringify(row));
        setInternalSelectedRows(new Set(allIds));
        onSelectAll?.(allIds);
      } else {
        setInternalSelectedRows(new Set());
        onSelectAll?.([]);
      }
    }
  }, [paginatedData, onSelectAll, selectable, selectedItems]);

  const handleFilter = useCallback((filterKey, value) => {
    const newFilters = new Map(activeFilters);
    if (value) {
      newFilters.set(filterKey, value);
    } else {
      newFilters.delete(filterKey);
    }
    setActiveFilters(newFilters);
    setCurrentPage(1);
    onFilter?.(Object.fromEntries(newFilters));
  }, [activeFilters, onFilter]);

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => {
    const rowId = row.id || row.key || JSON.stringify(row);
    return selectedRows.has(rowId);
  });

  const isIndeterminate = selectedRows.size > 0 && !isAllSelected;

  const clearFilters = () => {
    setActiveFilters(new Map());
    setShowFilters(false);
  };

  const handleExport = useCallback((format) => {
    const dataToExport = sortedData; // Export all filtered/sorted data, not just current page
    const baseFilename = exportFilename || title || 'table-export';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${baseFilename}-${timestamp}`;

    switch (format) {
      case 'csv':
        exportToCSV(dataToExport, columns, `${filename}.csv`);
        break;
      case 'pdf':
        exportToPDF(dataToExport, columns, `${filename}.pdf`, {
          title: title || 'Table Export',
          subtitle: description,
          showTimestamp: true
        });
        break;
      default:
        console.warn(`Unsupported export format: ${format}`);
    }

    // Call custom export handler if provided
    onExport?.(dataToExport, columns, format);
  }, [sortedData, columns, exportFilename, title, description, onExport]);

  const handleExportMenuClick = (format) => {
    handleExport(format);
    setShowExportMenu(false);
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'csv':
        return 'fileText';
      case 'pdf':
        return 'download';
      default:
        return 'download';
    }
  };

  const getFormatLabel = (format) => {
    switch (format) {
      case 'csv':
        return 'Export CSV';
      case 'pdf':
        return 'Export PDF';
      default:
        return `Export ${format.toUpperCase()}`;
    }
  };

  // Extract DOM-safe props only
  const { error, selectedIds, ...domSafeProps } = props;

  return (
    <TableContainer className={`data-table ${className || ''}`} {...domSafeProps}>
      <TableHeader className="table-header">
        <HeaderLeft>
          <TableTitle>
            {title && (
              <Typography variant="h6" weight="semibold">
                {title}
              </Typography>
            )}
            {totalItems > 0 && (
              <Badge variant="secondary" size="sm">
                {totalItems}
              </Badge>
            )}
          </TableTitle>
          
          {description && (
            <Typography variant="body2" color="secondary">
              {description}
            </Typography>
          )}
        </HeaderLeft>

        <HeaderRight>
          {searchable && (
            <SearchContainer>
              <SearchBar
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                maxWidth="100%"
              />
            </SearchContainer>
          )}

          {filterable && filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Icon name="filter" size={16} />
              {t('common.filters')}
              {activeFilters.size > 0 && (
                <Badge variant="primary" size="sm">
                  {activeFilters.size}
                </Badge>
              )}
            </Button>
          )}

          {exportable && exportFormats.length > 0 && (
            <ExportDropdown ref={exportDropdownRef}>
              <ExportButton
                variant="secondary"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="export-button"
              >
                <Icon name="download" size={16} />
                {t('common.export')}
                <Icon name="chevronDown" size={14} />
              </ExportButton>

              <AnimatePresence>
                {showExportMenu && (
                  <ExportMenu
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {exportFormats.map((format) => (
                      <ExportMenuItem
                        key={format}
                        onClick={() => handleExportMenuClick(format)}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                      >
                        <Icon name={getFormatIcon(format)} size={16} />
                        <Typography variant="body2">
                          {getFormatLabel(format)}
                        </Typography>
                      </ExportMenuItem>
                    ))}
                  </ExportMenu>
                )}
              </AnimatePresence>
            </ExportDropdown>
          )}

          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'primary'}
              size="sm"
              onClick={action.onClick}
            >
              {action.icon && <Icon name={action.icon} size={16} />}
              {action.label}
            </Button>
          ))}
        </HeaderRight>
      </TableHeader>

      <AnimatePresence>
        {showFilters && filters.length > 0 && (
          <FiltersContainer
            className="filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filters.map((filter) => (
              <Input
                key={filter.key}
                placeholder={filter.label}
                value={activeFilters.get(filter.key) || ''}
                onChange={(e) => handleFilter(filter.key, e.target.value)}
                size="sm"
              />
            ))}
            {activeFilters.size > 0 && (
              <FilterChip onClick={clearFilters}>
                <Icon name="close" size={14} />
                {t('common.clearAll')}
              </FilterChip>
            )}
          </FiltersContainer>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRows.size > 0 && bulkActions.length > 0 && (
          <BulkActionsBar
            className="bulk-actions"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BulkActionsLeft>
              <Typography variant="body2" weight="medium" color="primary">
                {selectedRows.size} item{selectedRows.size === 1 ? '' : 's'} selected
              </Typography>
            </BulkActionsLeft>
            <BulkActionsRight>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={() => onBulkAction?.(action.id, Array.from(selectedRows))}
                >
                  {action.icon && <Icon name={action.icon} size={16} />}
                  {action.label}
                </Button>
              ))}
            </BulkActionsRight>
          </BulkActionsBar>
        )}
      </AnimatePresence>

      <TableWrapper>
        <Table density={density}>
          <TableHead>
            <tr>
              {selectable && (
                <TableHeaderCell width="48px">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHeaderCell>
              )}
              {columns.map((column) => (
                <TableHeaderCell
                  key={column.key || column.accessor}
                  sortable={sortable && column.sortable !== false}
                  width={column.width}
                  align={column.align}
                  onClick={() => 
                    sortable && column.sortable !== false && 
                    handleSort(column.accessor || column.key)
                  }
                >
                  <SortButton 
                    active={sortConfig.key === (column.accessor || column.key)}
                  >
                    <Typography variant="body2" weight="medium">
                      {column.header || column.label}
                    </Typography>
                    {sortable && column.sortable !== false && (
                      <Icon
                        name={
                          sortConfig.key === (column.accessor || column.key)
                            ? sortConfig.direction === 'asc' ? 'arrowUp' : 'arrowDown'
                            : 'sort'
                        }
                        size={14}
                      />
                    )}
                  </SortButton>
                </TableHeaderCell>
              ))}
              {actions.length > 0 && (
                <TableHeaderCell width="120px" align="right">
                  Actions
                </TableHeaderCell>
              )}
            </tr>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                  <LoadingState>
                    <Icon name="clock" size={24} />
                    <Typography variant="body2" color="secondary">
                      Loading...
                    </Typography>
                  </LoadingState>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                  <EmptyState>
                    <Icon name={emptyStateIcon} size={48} />
                    <div>
                      <Typography variant="subtitle1" weight="medium">
                        {emptyStateTitle}
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {emptyMessage || emptyStateDescription}
                      </Typography>
                    </div>
                  </EmptyState>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = row.id || row.key || JSON.stringify(row);
                const isSelected = selectedRows.has(rowId);
                
                return (
                  <TableRow
                    key={rowId}
                    data={row}
                    columns={columns}
                    selected={isSelected}
                    selectable={selectable}
                    clickable={!!onRowClick}
                    actions={actions}
                    onSelect={handleSelectRow}
                    onClick={onRowClick}
                    onAction={onAction}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </TableWrapper>

      {pagination && totalItems > 0 && (
        <TableFooter className="table-footer">
          <PaginationInfo>
            <span>{t('common.pagination.showing')} {startItem}-{endItem} {t('common.pagination.of')} {totalItems} {t('common.pagination.items')}</span>
            <PageSizeSelect
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size} {t('common.pagination.perPage')}</option>
              ))}
            </PageSizeSelect>
          </PaginationInfo>

          <PaginationControls className="pagination-controls">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              {t('common.first')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <Icon name="chevronLeft" size={16} />
            </Button>
            <Typography variant="body2" color="secondary">
              {t('common.pagination.page')} {currentPage} {t('common.pagination.of')} {totalPages}
            </Typography>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <Icon name="chevronRight" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              {t('common.last')}
            </Button>
          </PaginationControls>
        </TableFooter>
      )}
    </TableContainer>
  );
};

export default DataTable;