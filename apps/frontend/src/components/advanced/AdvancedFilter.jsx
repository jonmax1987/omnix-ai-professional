import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

const FilterContainer = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.primary};
`;

const FilterTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const FilterActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const FilterContent = styled(motion.div)`
  padding: ${props => props.theme.spacing[4]};
`;

const FilterGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const FilterOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[3]};
`;

const FilterOption = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.body2.fontSize};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[100]};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[2]};
`;

const CheckboxOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.checked ? props.theme.colors.primary[300] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.checked ? props.theme.colors.primary[50] : props.theme.colors.background.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[300]};
    background: ${props => props.theme.colors.primary[50]};
  }
`;

const Checkbox = styled.input`
  width: 14px;
  height: 14px;
  accent-color: ${props => props.theme.colors.primary[500]};
`;

const RangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const RangeInput = styled(Input)`
  flex: 1;
`;

const RangeSeparator = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[1]};
  margin-top: ${props => props.theme.spacing[2]};
`;

const FilterTag = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.primary[100]};
  color: ${props => props.theme.colors.primary[700]};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.caption.fontSize};
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${props => props.theme.colors.primary[600]};
  display: flex;
  align-items: center;
  
  &:hover {
    color: ${props => props.theme.colors.primary[800]};
  }
`;

const PresetFilters = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
  flex-wrap: wrap;
`;

const PresetButton = styled.button`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.active ? props.theme.colors.primary[500] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? props.theme.colors.primary[500] : props.theme.colors.background.primary};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.caption.fontSize};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[500]};
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.primary[50]};
  }
`;

const SavedFilters = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.hover};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const SavedFiltersList = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
  overflow-x: auto;
`;

const SavedFilterItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[300]};
    background: ${props => props.theme.colors.primary[50]};
  }
`;

const ResultsSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.hover};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const DateRangePicker = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  align-items: center;
`;

const DateInput = styled.input`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
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
`;

const AdvancedFilter = ({
  filters = {},
  onFiltersChange,
  onApply,
  onReset,
  onSave,
  savedFilters = [],
  resultCount = 0,
  loading = false,
  isOpen = false,
  onToggle
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [activePreset, setActivePreset] = useState(null);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Sync with external filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Filter presets
  const presets = [
    {
      id: 'low-stock',
      name: 'Low Stock',
      filters: {
        stockLevel: { operator: 'less_than', value: 20 },
        status: ['active']
      }
    },
    {
      id: 'out-of-stock',
      name: 'Out of Stock',
      filters: {
        stockLevel: { operator: 'equals', value: 0 }
      }
    },
    {
      id: 'high-value',
      name: 'High Value',
      filters: {
        price: { min: 500 },
        categories: ['Electronics']
      }
    },
    {
      id: 'recent-orders',
      name: 'Recent Orders',
      filters: {
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        orderStatus: ['pending', 'processing']
      }
    }
  ];

  // Available filter options
  const filterOptions = {
    categories: ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden', 'Sports & Outdoor', 'Books & Media', 'Health & Beauty', 'Automotive'],
    suppliers: ['Apple Inc.', 'Samsung Electronics', 'Nike Corporation', 'Levi Strauss & Co.', 'Sony Corporation'],
    status: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'discontinued', label: 'Discontinued' }
    ],
    orderStatus: [
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    stockLevel: [
      { value: 'in_stock', label: 'In Stock', operator: 'greater_than', operand: 0 },
      { value: 'low_stock', label: 'Low Stock', operator: 'less_than', operand: 20 },
      { value: 'out_of_stock', label: 'Out of Stock', operator: 'equals', operand: 0 }
    ]
  };

  // Generate active filter tags
  const activeFilterTags = useMemo(() => {
    const tags = [];
    
    if (localFilters.categories?.length > 0) {
      localFilters.categories.forEach(category => {
        tags.push({
          key: 'categories',
          value: category,
          label: `Category: ${category}`,
          removable: true
        });
      });
    }
    
    if (localFilters.suppliers?.length > 0) {
      localFilters.suppliers.forEach(supplier => {
        tags.push({
          key: 'suppliers',
          value: supplier,
          label: `Supplier: ${supplier}`,
          removable: true
        });
      });
    }
    
    if (localFilters.price?.min || localFilters.price?.max) {
      const min = localFilters.price.min || 0;
      const max = localFilters.price.max || '∞';
      tags.push({
        key: 'price',
        label: `Price: $${min} - $${max}`,
        removable: true
      });
    }
    
    if (localFilters.stockLevel) {
      const level = filterOptions.stockLevel.find(s => s.value === localFilters.stockLevel);
      tags.push({
        key: 'stockLevel',
        label: `Stock: ${level?.label || localFilters.stockLevel}`,
        removable: true
      });
    }
    
    if (localFilters.dateRange?.start || localFilters.dateRange?.end) {
      const start = localFilters.dateRange.start || 'Start';
      const end = localFilters.dateRange.end || 'End';
      tags.push({
        key: 'dateRange',
        label: `Date: ${start} - ${end}`,
        removable: true
      });
    }
    
    return tags;
  }, [localFilters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleCheckboxChange = (key, value, checked) => {
    const currentValues = localFilters[key] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    handleFilterChange(key, newValues);
  };

  const handleRangeChange = (key, field, value) => {
    const currentRange = localFilters[key] || {};
    const newRange = { ...currentRange, [field]: value };
    handleFilterChange(key, newRange);
  };

  const handlePresetClick = (preset) => {
    setActivePreset(preset.id);
    setLocalFilters(preset.filters);
    if (onFiltersChange) {
      onFiltersChange(preset.filters);
    }
  };

  const handleRemoveTag = (tag) => {
    let newFilters = { ...localFilters };
    
    if (tag.key === 'categories' || tag.key === 'suppliers') {
      const currentValues = newFilters[tag.key] || [];
      newFilters[tag.key] = currentValues.filter(v => v !== tag.value);
      if (newFilters[tag.key].length === 0) {
        delete newFilters[tag.key];
      }
    } else {
      delete newFilters[tag.key];
    }
    
    setLocalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleReset = () => {
    setLocalFilters({});
    setActivePreset(null);
    if (onReset) {
      onReset();
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(localFilters);
    }
  };

  const handleSaveFilter = () => {
    if (saveFilterName && onSave) {
      onSave({
        name: saveFilterName,
        filters: localFilters,
        created: new Date().toISOString()
      });
      setSaveFilterName('');
      setShowSaveInput(false);
    }
  };

  const handleLoadSavedFilter = (savedFilter) => {
    setLocalFilters(savedFilter.filters);
    setActivePreset(null);
    if (onFiltersChange) {
      onFiltersChange(savedFilter.filters);
    }
  };

  const hasActiveFilters = Object.keys(localFilters).length > 0;

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>
          <Icon name="filter" size={18} color="primary" />
          <Typography variant="h6" weight="semibold">
            Advanced Filters
          </Typography>
          {hasActiveFilters && (
            <Badge variant="primary" size="sm">
              {activeFilterTags.length} active
            </Badge>
          )}
        </FilterTitle>
        
        <FilterActions>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasActiveFilters}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            loading={loading}
          >
            Apply Filters
          </Button>
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} />
            </Button>
          )}
        </FilterActions>
      </FilterHeader>

      <AnimatePresence>
        {isOpen && (
          <FilterContent
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Preset Filters */}
            <FilterGroup>
              <GroupHeader>
                <Typography variant="body2" weight="medium">
                  Quick Filters
                </Typography>
              </GroupHeader>
              
              <PresetFilters>
                {presets.map(preset => (
                  <PresetButton
                    key={preset.id}
                    active={activePreset === preset.id}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.name}
                  </PresetButton>
                ))}
              </PresetFilters>
            </FilterGroup>

            {/* Category Filters */}
            <FilterGroup>
              <GroupHeader>
                <Typography variant="body2" weight="medium">
                  Categories
                </Typography>
              </GroupHeader>
              
              <CheckboxGroup>
                {filterOptions.categories.map(category => (
                  <CheckboxOption
                    key={category}
                    checked={localFilters.categories?.includes(category)}
                  >
                    <Checkbox
                      type="checkbox"
                      checked={localFilters.categories?.includes(category) || false}
                      onChange={(e) => handleCheckboxChange('categories', category, e.target.checked)}
                    />
                    <Typography variant="caption">{category}</Typography>
                  </CheckboxOption>
                ))}
              </CheckboxGroup>
            </FilterGroup>

            {/* Price Range */}
            <FilterGroup>
              <GroupHeader>
                <Typography variant="body2" weight="medium">
                  Price Range
                </Typography>
              </GroupHeader>
              
              <RangeInputs>
                <RangeInput
                  type="number"
                  placeholder="Min price"
                  value={localFilters.price?.min || ''}
                  onChange={(e) => handleRangeChange('price', 'min', e.target.value)}
                />
                <RangeSeparator>to</RangeSeparator>
                <RangeInput
                  type="number"
                  placeholder="Max price"
                  value={localFilters.price?.max || ''}
                  onChange={(e) => handleRangeChange('price', 'max', e.target.value)}
                />
              </RangeInputs>
            </FilterGroup>

            {/* Stock Level */}
            <FilterGroup>
              <GroupHeader>
                <Typography variant="body2" weight="medium">
                  Stock Level
                </Typography>
              </GroupHeader>
              
              <FilterOptions>
                <FilterOption>
                  <Select
                    value={localFilters.stockLevel || ''}
                    onChange={(e) => handleFilterChange('stockLevel', e.target.value)}
                  >
                    <option value="">All Stock Levels</option>
                    {filterOptions.stockLevel.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </Select>
                </FilterOption>
              </FilterOptions>
            </FilterGroup>

            {/* Date Range */}
            <FilterGroup>
              <GroupHeader>
                <Typography variant="body2" weight="medium">
                  Date Range
                </Typography>
              </GroupHeader>
              
              <DateRangePicker>
                <DateInput
                  type="date"
                  value={localFilters.dateRange?.start || ''}
                  onChange={(e) => handleRangeChange('dateRange', 'start', e.target.value)}
                />
                <RangeSeparator>to</RangeSeparator>
                <DateInput
                  type="date"
                  value={localFilters.dateRange?.end || ''}
                  onChange={(e) => handleRangeChange('dateRange', 'end', e.target.value)}
                />
              </DateRangePicker>
            </FilterGroup>

            {/* Suppliers */}
            <FilterGroup>
              <GroupHeader>
                <Typography variant="body2" weight="medium">
                  Suppliers
                </Typography>
              </GroupHeader>
              
              <CheckboxGroup>
                {filterOptions.suppliers.map(supplier => (
                  <CheckboxOption
                    key={supplier}
                    checked={localFilters.suppliers?.includes(supplier)}
                  >
                    <Checkbox
                      type="checkbox"
                      checked={localFilters.suppliers?.includes(supplier) || false}
                      onChange={(e) => handleCheckboxChange('suppliers', supplier, e.target.checked)}
                    />
                    <Typography variant="caption">{supplier}</Typography>
                  </CheckboxOption>
                ))}
              </CheckboxGroup>
            </FilterGroup>

            {/* Active Filter Tags */}
            {activeFilterTags.length > 0 && (
              <FilterGroup>
                <GroupHeader>
                  <Typography variant="body2" weight="medium">
                    Active Filters
                  </Typography>
                </GroupHeader>
                
                <TagsContainer>
                  <AnimatePresence>
                    {activeFilterTags.map((tag, index) => (
                      <FilterTag
                        key={`${tag.key}-${tag.value || 'range'}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Typography variant="caption">{tag.label}</Typography>
                        {tag.removable && (
                          <TagRemove onClick={() => handleRemoveTag(tag)}>
                            <Icon name="x" size={12} />
                          </TagRemove>
                        )}
                      </FilterTag>
                    ))}
                  </AnimatePresence>
                </TagsContainer>
              </FilterGroup>
            )}
          </FilterContent>
        )}
      </AnimatePresence>

      {/* Saved Filters */}
      {(savedFilters.length > 0 || showSaveInput) && (
        <SavedFilters>
          <Typography variant="caption" color="secondary" style={{ whiteSpace: 'nowrap' }}>
            Saved:
          </Typography>
          
          <SavedFiltersList>
            {savedFilters.map(savedFilter => (
              <SavedFilterItem
                key={savedFilter.name}
                onClick={() => handleLoadSavedFilter(savedFilter)}
              >
                <Icon name="bookmark" size={12} />
                <Typography variant="caption">{savedFilter.name}</Typography>
              </SavedFilterItem>
            ))}
          </SavedFiltersList>
          
          {showSaveInput ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Input
                size="sm"
                placeholder="Filter name"
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                style={{ width: '120px' }}
              />
              <Button size="sm" variant="primary" onClick={handleSaveFilter}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowSaveInput(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSaveInput(true)}
              >
                <Icon name="bookmark" size={12} />
                Save
              </Button>
            )
          )}
        </SavedFilters>
      )}

      {/* Results Summary */}
      <ResultsSummary>
        <Typography variant="body2" color="secondary">
          {loading ? 'Filtering...' : `${resultCount.toLocaleString()} results found`}
        </Typography>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasActiveFilters && (
            <Typography variant="caption" color="secondary">
              {activeFilterTags.length} filter{activeFilterTags.length !== 1 ? 's' : ''} applied
            </Typography>
          )}
        </div>
      </ResultsSummary>
    </FilterContainer>
  );
};

export default AdvancedFilter;