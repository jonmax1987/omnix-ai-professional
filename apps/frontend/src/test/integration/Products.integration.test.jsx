import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithTheme } from '../setup';
import Products from '../../pages/Products';

// Mock products data
const mockProducts = [
  {
    id: '1',
    name: 'Laptop Computer',
    category: 'Electronics',
    price: 999.99,
    stock: 25,
    minStock: 10,
    status: 'in_stock',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'T-Shirt Blue',
    category: 'Clothing',
    price: 29.99,
    stock: 5,
    minStock: 20,
    status: 'low_stock',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Coffee Beans',
    category: 'Food',
    price: 15.99,
    stock: 0,
    minStock: 50,
    status: 'out_of_stock',
    lastUpdated: new Date().toISOString()
  }
];

const mockStore = {
  products: {
    items: mockProducts,
    filteredItems: mockProducts,
    searchTerm: '',
    selectedCategory: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    isLoading: false,
    error: null,
    pagination: {
      current: 1,
      total: 1,
      pageSize: 20
    }
  }
};

vi.mock('../../stores/productsStore', () => ({
  useProductsStore: () => ({
    ...mockStore.products,
    setSearchTerm: vi.fn(),
    setSelectedCategory: vi.fn(),
    setSortBy: vi.fn(),
    setSortOrder: vi.fn(),
    loadProducts: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn()
  })
}));

describe('Products Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render products list with all products', async () => {
    renderWithTheme(<Products />);

    // Check if all products are displayed
    await waitFor(() => {
      expect(screen.getByText('Laptop Computer')).toBeInTheDocument();
      expect(screen.getByText('T-Shirt Blue')).toBeInTheDocument();
      expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
    });

    // Check status indicators
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('should handle search functionality', async () => {
    const mockSetSearchTerm = vi.fn();
    
    vi.mocked(require('../../stores/productsStore').useProductsStore).mockReturnValueOnce({
      ...mockStore.products,
      setSearchTerm: mockSetSearchTerm
    });

    renderWithTheme(<Products />);

    // Find and interact with search input
    const searchInput = screen.getByPlaceholderText('Search products...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Laptop' } });
    
    await waitFor(() => {
      expect(mockSetSearchTerm).toHaveBeenCalledWith('Laptop');
    });
  });

  it('should handle category filtering', async () => {
    const mockSetSelectedCategory = vi.fn();
    
    vi.mocked(require('../../stores/productsStore').useProductsStore).mockReturnValueOnce({
      ...mockStore.products,
      setSelectedCategory: mockSetSelectedCategory
    });

    renderWithTheme(<Products />);

    // Find and interact with category filter
    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    
    await waitFor(() => {
      expect(mockSetSelectedCategory).toHaveBeenCalledWith('Electronics');
    });
  });

  it('should handle sorting functionality', async () => {
    const mockSetSortBy = vi.fn();
    const mockSetSortOrder = vi.fn();
    
    vi.mocked(require('../../stores/productsStore').useProductsStore).mockReturnValueOnce({
      ...mockStore.products,
      setSortBy: mockSetSortBy,
      setSortOrder: mockSetSortOrder
    });

    renderWithTheme(<Products />);

    // Test sorting by clicking column headers
    const nameHeader = screen.getByText('Product Name');
    fireEvent.click(nameHeader);
    
    await waitFor(() => {
      expect(mockSetSortBy).toHaveBeenCalledWith('name');
    });
  });

  it('should handle product actions (edit, delete)', async () => {
    const mockUpdateProduct = vi.fn();
    const mockDeleteProduct = vi.fn();
    
    vi.mocked(require('../../stores/productsStore').useProductsStore).mockReturnValueOnce({
      ...mockStore.products,
      updateProduct: mockUpdateProduct,
      deleteProduct: mockDeleteProduct
    });

    renderWithTheme(<Products />);

    // Find action buttons for first product
    const productRows = screen.getAllByTestId('product-row');
    expect(productRows).toHaveLength(3);

    const firstRow = productRows[0];
    
    // Test edit action
    const editButton = within(firstRow).getByLabelText('Edit product');
    fireEvent.click(editButton);
    
    // Should open edit modal or navigate to edit page
    await waitFor(() => {
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
    });
  });

  it('should handle bulk operations', async () => {
    renderWithTheme(<Products />);

    // Select multiple products
    const checkboxes = screen.getAllByRole('checkbox');
    
    fireEvent.click(checkboxes[1]); // First product checkbox
    fireEvent.click(checkboxes[2]); // Second product checkbox

    // Bulk actions should become available
    await waitFor(() => {
      expect(screen.getByText('2 items selected')).toBeInTheDocument();
      expect(screen.getByText('Bulk Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    });
  });

  it('should handle loading states', async () => {
    const loadingMockStore = {
      ...mockStore,
      products: {
        ...mockStore.products,
        isLoading: true
      }
    };

    vi.mocked(require('../../stores/productsStore').useProductsStore).mockReturnValueOnce(
      loadingMockStore.products
    );

    renderWithTheme(<Products />);

    // Should show loading indicators
    expect(screen.getByTestId('products-loading')).toBeInTheDocument();
  });

  it('should handle empty state', async () => {
    const emptyMockStore = {
      ...mockStore,
      products: {
        ...mockStore.products,
        items: [],
        filteredItems: []
      }
    };

    vi.mocked(require('../../stores/productsStore').useProductsStore).mockReturnValueOnce(
      emptyMockStore.products
    );

    renderWithTheme(<Products />);

    // Should show empty state
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    const paginatedMockStore = {
      ...mockStore,
      products: {
        ...mockStore.products,
        pagination: {
          current: 1,
          total: 3,
          pageSize: 1
        }
      }
    };

    vi.mocked(require('../../stores/productsStore').useProductsStore).mockReturnValueOnce(
      paginatedMockStore.products
    );

    renderWithTheme(<Products />);

    // Should show pagination controls
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    });
  });

  it('should handle export functionality', async () => {
    renderWithTheme(<Products />);

    // Find export button
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    // Should show export options
    await waitFor(() => {
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    });
  });
});