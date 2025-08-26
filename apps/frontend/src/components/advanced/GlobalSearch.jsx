import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[12]} ${props => props.theme.spacing[3]} ${props => props.theme.spacing[10]};
  border: 2px solid ${props => props.focused ? props.theme.colors.primary[500] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.body1.fontSize};
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.secondary};
  z-index: 1;
`;

const SearchActions = styled.div`
  position: absolute;
  right: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const ClearButton = styled.button`
  padding: ${props => props.theme.spacing[1]};
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${props => props.theme.spacing[1]};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const KeyboardShortcut = styled.span`
  padding: ${props => props.theme.spacing[0.5]} ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[0.5]};
  font-size: ${props => props.theme.typography.caption.fontSize};
  color: ${props => props.theme.colors.text.secondary};
  font-family: monospace;
`;

const ResultsContainer = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: 50;
  max-height: 400px;
  overflow: hidden;
`;

const ResultsHeader = styled.div`
  padding: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.primary};
`;

const ResultsContent = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const ResultSection = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  }
`;

const SectionHeader = styled.div`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.hover};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const ResultItem = styled(motion.div)`
  padding: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  cursor: pointer;
  background: ${props => props.highlighted ? props.theme.colors.background.hover : 'transparent'};
  transition: background-color 0.1s ease;
  
  &:hover, &:focus {
    background: ${props => props.theme.colors.background.hover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ResultContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const ResultIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ResultDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  margin-bottom: ${props => props.theme.spacing[0.5]};
`;

const ResultMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[1]};
`;

const HighlightedText = styled.span`
  background: ${props => props.theme.colors.primary[100]};
  color: ${props => props.theme.colors.primary[700]};
  padding: 0 2px;
  border-radius: 2px;
`;

const NoResults = styled.div`
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[3]};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const RecentSearches = styled.div`
  padding: ${props => props.theme.spacing[3]};
`;

const RecentItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  cursor: pointer;
  transition: background-color 0.1s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
`;

const GlobalSearch = ({
  placeholder = "Search products, orders, customers...",
  onResultClick,
  onClose,
  autoFocus = false,
  showShortcut = true,
  className
}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Mock search results
  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return {};
    
    const highlightQuery = (text, query) => {
      if (!query) return text;
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, `<highlight>$1</highlight>`);
    };

    // Mock data for different categories
    const allResults = {
      products: [
        { id: 'p1', name: 'iPhone 14 Pro', sku: 'AAPL-IP14P-128', category: 'Electronics', stock: 45, price: 999 },
        { id: 'p2', name: 'Samsung Galaxy S23', sku: 'SAMS-GS23-256', category: 'Electronics', stock: 12, price: 899 },
        { id: 'p3', name: 'MacBook Pro 16"', sku: 'AAPL-MBP16-1TB', category: 'Electronics', stock: 8, price: 2499 },
        { id: 'p4', name: 'Nike Air Max 90', sku: 'NIKE-AM90-WHT', category: 'Footwear', stock: 0, price: 120 },
        { id: 'p5', name: 'Levi\'s 501 Jeans', sku: 'LEVI-501-32X32', category: 'Clothing', stock: 78, price: 80 }
      ],
      orders: [
        { id: 'o1', orderNumber: 'ORD-2024-001', customer: 'John Smith', total: 1299, status: 'pending', date: '2024-01-15' },
        { id: 'o2', orderNumber: 'ORD-2024-002', customer: 'Sarah Johnson', total: 899, status: 'shipped', date: '2024-01-14' },
        { id: 'o3', orderNumber: 'ORD-2024-003', customer: 'Mike Wilson', total: 199, status: 'delivered', date: '2024-01-13' }
      ],
      customers: [
        { id: 'c1', name: 'John Smith', email: 'john@example.com', orders: 12, totalSpent: 15680 },
        { id: 'c2', name: 'Sarah Johnson', email: 'sarah@example.com', orders: 8, totalSpent: 9420 },
        { id: 'c3', name: 'Mike Wilson', email: 'mike@example.com', orders: 5, totalSpent: 3200 }
      ],
      suppliers: [
        { id: 's1', name: 'Apple Inc.', contact: 'supplies@apple.com', products: 45, status: 'active' },
        { id: 's2', name: 'Samsung Electronics', contact: 'b2b@samsung.com', products: 23, status: 'active' },
        { id: 's3', name: 'Nike Corporation', contact: 'wholesale@nike.com', products: 156, status: 'active' }
      ]
    };

    const filteredResults = {};
    const searchTerm = debouncedQuery.toLowerCase();

    // Filter products
    filteredResults.products = allResults.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    ).slice(0, 5).map(product => ({
      ...product,
      highlightedName: highlightQuery(product.name, debouncedQuery),
      highlightedSku: highlightQuery(product.sku, debouncedQuery)
    }));

    // Filter orders
    filteredResults.orders = allResults.orders.filter(order => 
      order.orderNumber.toLowerCase().includes(searchTerm) ||
      order.customer.toLowerCase().includes(searchTerm)
    ).slice(0, 3).map(order => ({
      ...order,
      highlightedOrderNumber: highlightQuery(order.orderNumber, debouncedQuery),
      highlightedCustomer: highlightQuery(order.customer, debouncedQuery)
    }));

    // Filter customers
    filteredResults.customers = allResults.customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm)
    ).slice(0, 3).map(customer => ({
      ...customer,
      highlightedName: highlightQuery(customer.name, debouncedQuery),
      highlightedEmail: highlightQuery(customer.email, debouncedQuery)
    }));

    // Filter suppliers
    filteredResults.suppliers = allResults.suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(searchTerm) ||
      supplier.contact.toLowerCase().includes(searchTerm)
    ).slice(0, 3).map(supplier => ({
      ...supplier,
      highlightedName: highlightQuery(supplier.name, debouncedQuery),
      highlightedContact: highlightQuery(supplier.contact, debouncedQuery)
    }));

    return filteredResults;
  }, [debouncedQuery]);

  // Calculate total results
  const totalResults = Object.values(searchResults).reduce((sum, results) => sum + results.length, 0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < totalResults - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            // Handle selecting highlighted result
            handleResultSelect(getResultByIndex(highlightedIndex));
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, totalResults]);

  // Global keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus, isOpen]);

  // Get result by index for keyboard navigation
  const getResultByIndex = (index) => {
    let currentIndex = 0;
    for (const [category, results] of Object.entries(searchResults)) {
      if (index >= currentIndex && index < currentIndex + results.length) {
        return { category, result: results[index - currentIndex] };
      }
      currentIndex += results.length;
    }
    return null;
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setFocused(true);
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setFocused(false);
    // Delay closing to allow for result clicks
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleResultSelect = (item) => {
    if (item && onResultClick) {
      onResultClick(item);
    }
    
    // Add to recent searches
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
    if (onClose) onClose();
  };

  const handleClear = () => {
    setQuery('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleRecentSearchClick = (search) => {
    setQuery(search);
    inputRef.current?.focus();
  };

  const renderHighlightedText = (text) => {
    if (!text) return '';
    return text.replace(/<highlight>/g, '').replace(/<\/highlight>/g, '');
  };

  const getSectionIcon = (category) => {
    switch (category) {
      case 'products': return 'package';
      case 'orders': return 'shopping-cart';
      case 'customers': return 'users';
      case 'suppliers': return 'truck';
      default: return 'search';
    }
  };

  const getSectionColor = (category) => {
    switch (category) {
      case 'products': return '#3B82F6';
      case 'orders': return '#10B981';
      case 'customers': return '#F59E0B';
      case 'suppliers': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (!isOpen) {
    return (
      <SearchContainer className={className}>
        <SearchInput
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          focused={focused}
        />
        <SearchIcon>
          <Icon name="search" size={18} />
        </SearchIcon>
        {showShortcut && !query && (
          <SearchActions>
            <KeyboardShortcut>⌘K</KeyboardShortcut>
          </SearchActions>
        )}
        {query && (
          <SearchActions>
            <ClearButton onClick={handleClear}>
              <Icon name="x" size={16} />
            </ClearButton>
          </SearchActions>
        )}
      </SearchContainer>
    );
  }

  return (
    <>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />
      
      <SearchContainer className={className} style={{ zIndex: 50 }}>
        <SearchInput
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          focused={focused}
        />
        <SearchIcon>
          <Icon name="search" size={18} />
        </SearchIcon>
        {query && (
          <SearchActions>
            <ClearButton onClick={handleClear}>
              <Icon name="x" size={16} />
            </ClearButton>
          </SearchActions>
        )}

        <AnimatePresence>
          {isOpen && (
            <ResultsContainer
              ref={resultsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {query && debouncedQuery.length >= 2 ? (
                <>
                  <ResultsHeader>
                    <Typography variant="body2" color="secondary">
                      {totalResults > 0 ? `${totalResults} results found` : 'No results found'}
                    </Typography>
                  </ResultsHeader>
                  
                  {totalResults > 0 ? (
                    <ResultsContent>
                      {Object.entries(searchResults).map(([category, results]) => {
                        if (results.length === 0) return null;
                        
                        return (
                          <ResultSection key={category}>
                            <SectionHeader>
                              <Typography variant="caption" weight="medium" style={{ textTransform: 'capitalize' }}>
                                {category}
                              </Typography>
                            </SectionHeader>
                            
                            {results.map((result, index) => {
                              const globalIndex = Object.entries(searchResults)
                                .slice(0, Object.keys(searchResults).indexOf(category))
                                .reduce((sum, [, res]) => sum + res.length, 0) + index;
                              
                              return (
                                <ResultItem
                                  key={result.id}
                                  highlighted={highlightedIndex === globalIndex}
                                  onClick={() => handleResultSelect({ category, result })}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.1, delay: index * 0.05 }}
                                >
                                  <ResultContent>
                                    <ResultIcon color={getSectionColor(category)}>
                                      <Icon name={getSectionIcon(category)} size={16} color={getSectionColor(category)} />
                                    </ResultIcon>
                                    
                                    <ResultDetails>
                                      <ResultTitle>
                                        <Typography variant="body2" weight="medium">
                                          {category === 'products' ? renderHighlightedText(result.highlightedName) :
                                           category === 'orders' ? renderHighlightedText(result.highlightedOrderNumber) :
                                           category === 'customers' ? renderHighlightedText(result.highlightedName) :
                                           renderHighlightedText(result.highlightedName)}
                                        </Typography>
                                        
                                        {category === 'products' && result.stock === 0 && (
                                          <Badge variant="error" size="xs">Out of Stock</Badge>
                                        )}
                                        {category === 'products' && result.stock > 0 && result.stock < 20 && (
                                          <Badge variant="warning" size="xs">Low Stock</Badge>
                                        )}
                                      </ResultTitle>
                                      
                                      <Typography variant="caption" color="secondary">
                                        {category === 'products' && `SKU: ${renderHighlightedText(result.highlightedSku)} • ${formatCurrency(result.price)}`}
                                        {category === 'orders' && `${renderHighlightedText(result.highlightedCustomer)} • ${formatCurrency(result.total)}`}
                                        {category === 'customers' && `${renderHighlightedText(result.highlightedEmail)} • ${result.orders} orders`}
                                        {category === 'suppliers' && `${renderHighlightedText(result.highlightedContact)} • ${result.products} products`}
                                      </Typography>
                                      
                                      {category === 'products' && (
                                        <ResultMeta>
                                          <Typography variant="caption" color="secondary">
                                            Stock: {result.stock}
                                          </Typography>
                                          <Typography variant="caption" color="secondary">
                                            Category: {result.category}
                                          </Typography>
                                        </ResultMeta>
                                      )}
                                      
                                      {category === 'orders' && (
                                        <ResultMeta>
                                          <Badge 
                                            variant={result.status === 'delivered' ? 'success' : 
                                                   result.status === 'shipped' ? 'info' : 'warning'} 
                                            size="xs"
                                          >
                                            {result.status}
                                          </Badge>
                                          <Typography variant="caption" color="secondary">
                                            {result.date}
                                          </Typography>
                                        </ResultMeta>
                                      )}
                                    </ResultDetails>
                                  </ResultContent>
                                </ResultItem>
                              );
                            })}
                          </ResultSection>
                        );
                      })}
                    </ResultsContent>
                  ) : (
                    <NoResults>
                      <Icon name="search" size={24} style={{ marginBottom: '8px' }} />
                      <Typography variant="body2" color="secondary">
                        No results found for "{query}"
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        Try searching for products, orders, customers, or suppliers
                      </Typography>
                    </NoResults>
                  )}
                </>
              ) : (
                <RecentSearches>
                  <Typography variant="caption" weight="medium" color="secondary" style={{ display: 'block', marginBottom: '12px' }}>
                    Recent Searches
                  </Typography>
                  
                  {recentSearches.length > 0 ? (
                    recentSearches.map((search, index) => (
                      <RecentItem key={index} onClick={() => handleRecentSearchClick(search)}>
                        <Icon name="clock" size={14} />
                        <Typography variant="body2">{search}</Typography>
                      </RecentItem>
                    ))
                  ) : (
                    <Typography variant="caption" color="secondary">
                      Start typing to search across all data...
                    </Typography>
                  )}
                </RecentSearches>
              )}
            </ResultsContainer>
          )}
        </AnimatePresence>
      </SearchContainer>
    </>
  );
};

export default GlobalSearch;