import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useProductsStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Products data
        products: [],
        selectedProduct: null,
        
        // Filtering and search
        filters: {
          search: '',
          category: '',
          supplier: '',
          status: 'all', // all, active, inactive, discontinued (client-side filtering)
          stockLevel: 'all', // all, low, out, healthy (client-side filtering)
          location: '',
          tags: []
        },
        
        // Sorting
        sortBy: 'name',
        sortOrder: 'asc', // asc, desc
        
        // Pagination
        currentPage: 1,
        itemsPerPage: 25,
        totalItems: 0,
        
        // UI state
        viewMode: 'table', // table, grid, list
        selectedProducts: [],
        showFilters: false,
        
        // Loading states
        loading: false,
        loadingProduct: false,
        creating: false,
        updating: false,
        deleting: false,
        
        // Error handling
        error: null,
        
        // Async Actions
        fetchProducts: async (params = {}) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const { productsAPI } = await import('../services/api.js');
            
            // Combine filters from store with any additional params
            const currentFilters = get().filters;
            const apiParams = {
              page: get().currentPage,
              limit: get().itemsPerPage,
              sortBy: get().sortBy,
              sortOrder: get().sortOrder,
              // Map frontend filters to backend parameters (only include supported params)
              search: currentFilters.search || undefined,
              category: currentFilters.category || undefined,
              supplier: currentFilters.supplier || undefined,
              location: currentFilters.location || undefined,
              // Note: status, stockLevel, and tags are not supported by backend API
              // These will be filtered client-side after fetching
              ...params // Allow override with explicit params
            };
            
            // Remove undefined values to clean up the request
            Object.keys(apiParams).forEach(key => {
              if (apiParams[key] === undefined || apiParams[key] === '') {
                delete apiParams[key];
              }
            });
            
            const response = await productsAPI.getProducts(apiParams);
            
            // Apply client-side filtering for unsupported backend parameters
            let filteredProducts = response.products || response.data || [];
            
            // Filter by status if specified
            if (currentFilters.status && currentFilters.status !== 'all') {
              filteredProducts = filteredProducts.filter(product => {
                // Since backend doesn't have status field, assume all products are 'active'
                // In production, this would be based on actual product status logic
                return currentFilters.status === 'active';
              });
            }
            
            // Filter by stock level if specified
            if (currentFilters.stockLevel && currentFilters.stockLevel !== 'all') {
              filteredProducts = filteredProducts.filter(product => {
                const stockRatio = product.quantity / (product.minThreshold || 1);
                switch (currentFilters.stockLevel) {
                  case 'low':
                    return stockRatio <= 1.2; // Low stock: 120% or less of minimum
                  case 'out':
                    return product.quantity === 0;
                  case 'healthy':
                    return stockRatio > 1.2;
                  default:
                    return true;
                }
              });
            }
            
            // Filter by tags if specified (client-side since backend doesn't support)
            if (currentFilters.tags && currentFilters.tags.length > 0) {
              filteredProducts = filteredProducts.filter(product => {
                // Since backend products don't have tags, this would need to be added
                // For now, we'll skip tag filtering until backend supports it
                return true;
              });
            }
            
            // Create modified response with filtered products
            const filteredResponse = {
              ...response,
              products: filteredProducts,
              data: filteredProducts // Support both formats
            };
            
            get().setProducts(filteredResponse);
            
            // Update pagination if provided
            if (response.pagination) {
              set((state) => {
                state.totalItems = response.pagination.total || 0;
              });
            }
          } catch (error) {
            console.error('Failed to fetch products:', error);
            set((state) => {
              state.error = error.message || 'Failed to fetch products';
            });
            
            // Fallback to mock data in development when API is unavailable
            if (process.env.NODE_ENV === 'development') {
              console.log('Using mock products data for development');
              const mockProducts = {
                products: [
                  {
                    id: 'mock-1',
                    name: 'Sample Coffee Beans',
                    sku: 'COFFEE-001',
                    category: 'food',
                    quantity: 150,
                    minThreshold: 20,
                    price: 24.99,
                    cost: 18.50,
                    supplier: 'Global Coffee Co.',
                    barcode: '1234567890123',
                    unit: 'kg',
                    expirationDate: '2024-12-31',
                    location: 'Warehouse A',
                    description: 'Premium arabica coffee beans',
                    tags: ['premium', 'organic'],
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                ],
                pagination: { page: 1, limit: 25, total: 1, pages: 1, hasNext: false, hasPrev: false }
              };
              get().setProducts(mockProducts);
            }
          } finally {
            set((state) => {
              state.loading = false;
            });
          }
        },

        createProduct: async (productData) => {
          set((state) => {
            state.creating = true;
            state.error = null;
          });

          try {
            const { productsAPI } = await import('../services/api.js');
            const newProduct = await productsAPI.createProduct(productData);
            
            get().addProduct(newProduct);
            return newProduct;
          } catch (error) {
            console.error('Failed to create product:', error);
            set((state) => {
              state.error = error.message || 'Failed to create product';
            });
            throw error;
          } finally {
            set((state) => {
              state.creating = false;
            });
          }
        },

        updateProductAsync: async (id, updates) => {
          set((state) => {
            state.updating = true;
            state.error = null;
          });

          try {
            const { productsAPI } = await import('../services/api.js');
            const updatedProduct = await productsAPI.updateProduct(id, updates);
            
            get().updateProduct(id, updatedProduct);
            return updatedProduct;
          } catch (error) {
            console.error('Failed to update product:', error);
            set((state) => {
              state.error = error.message || 'Failed to update product';
            });
            throw error;
          } finally {
            set((state) => {
              state.updating = false;
            });
          }
        },

        deleteProductAsync: async (id) => {
          set((state) => {
            state.deleting = true;
            state.error = null;
          });

          try {
            const { productsAPI } = await import('../services/api.js');
            await productsAPI.deleteProduct(id);
            
            get().deleteProduct(id);
          } catch (error) {
            console.error('Failed to delete product:', error);
            set((state) => {
              state.error = error.message || 'Failed to delete product';
            });
            throw error;
          } finally {
            set((state) => {
              state.deleting = false;
            });
          }
        },
        
        // Actions
        setProducts: (productsData) => 
          set((state) => {
            // Handle both direct array and backend response format
            if (Array.isArray(productsData)) {
              state.products = productsData;
              state.totalItems = productsData.length;
            } else if (productsData && productsData.products) {
              // Backend response format: {products: [...], pagination: {...}}
              state.products = productsData.products;
              state.totalItems = productsData.pagination?.total || productsData.products.length;
            } else {
              state.products = [];
              state.totalItems = 0;
            }
          }),
          
        addProduct: (product) => 
          set((state) => {
            state.products.unshift({
              ...product,
              id: product.id || `PRD-${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            state.totalItems = state.products.length;
          }),
          
        updateProduct: (id, updates) => 
          set((state) => {
            const index = state.products.findIndex(p => p.id === id);
            if (index !== -1) {
              state.products[index] = {
                ...state.products[index],
                ...updates,
                updatedAt: new Date().toISOString()
              };
            }
            if (state.selectedProduct?.id === id) {
              state.selectedProduct = { ...state.selectedProduct, ...updates };
            }
          }),
          
        deleteProduct: (id) => 
          set((state) => {
            state.products = state.products.filter(p => p.id !== id);
            state.totalItems = state.products.length;
            if (state.selectedProduct?.id === id) {
              state.selectedProduct = null;
            }
            state.selectedProducts = state.selectedProducts.filter(pid => pid !== id);
          }),
          
        deleteProducts: (ids) => 
          set((state) => {
            state.products = state.products.filter(p => !ids.includes(p.id));
            state.totalItems = state.products.length;
            if (state.selectedProduct && ids.includes(state.selectedProduct.id)) {
              state.selectedProduct = null;
            }
            state.selectedProducts = state.selectedProducts.filter(pid => !ids.includes(pid));
          }),
          
        setSelectedProduct: (product) => 
          set((state) => {
            state.selectedProduct = product;
          }),
          
        // Filtering actions
        setFilter: (key, value) => {
          set((state) => {
            state.filters[key] = value;
            state.currentPage = 1; // Reset to first page when filtering
          });
          // Automatically refetch with new filters
          get().fetchProducts();
        },
          
        setFilters: (filters) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
            state.currentPage = 1;
          });
          // Automatically refetch with new filters
          get().fetchProducts();
        },

        applyFilters: () => {
          // Force refetch with current filters
          get().fetchProducts();
        },
          
        clearFilters: () => 
          set((state) => {
            state.filters = {
              search: '',
              category: '',
              supplier: '',
              status: 'active',
              stockLevel: 'all',
              location: '',
              tags: []
            };
            state.currentPage = 1;
          }),
          
        // Sorting actions
        setSorting: (sortBy, sortOrder) => 
          set((state) => {
            state.sortBy = sortBy;
            state.sortOrder = sortOrder;
          }),
          
        toggleSortOrder: () => 
          set((state) => {
            state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
          }),
          
        // Pagination actions
        setCurrentPage: (page) => 
          set((state) => {
            state.currentPage = page;
          }),
          
        setItemsPerPage: (items) => 
          set((state) => {
            state.itemsPerPage = items;
            state.currentPage = 1; // Reset to first page
          }),
          
        // Selection actions
        setSelectedProducts: (productIds) => 
          set((state) => {
            state.selectedProducts = productIds;
          }),
          
        toggleProductSelection: (productId) => 
          set((state) => {
            const index = state.selectedProducts.indexOf(productId);
            if (index === -1) {
              state.selectedProducts.push(productId);
            } else {
              state.selectedProducts.splice(index, 1);
            }
          }),
          
        selectAllProducts: () => 
          set((state) => {
            const visibleProducts = get().getFilteredProducts();
            state.selectedProducts = visibleProducts.map(p => p.id);
          }),
          
        clearSelection: () => 
          set((state) => {
            state.selectedProducts = [];
          }),
          
        // UI actions
        setViewMode: (mode) => 
          set((state) => {
            state.viewMode = mode;
          }),
          
        toggleFilters: () => 
          set((state) => {
            state.showFilters = !state.showFilters;
          }),
          
        // Loading actions
        setLoading: (loading) => 
          set((state) => {
            state.loading = loading;
          }),
          
        setLoadingProduct: (loading) => 
          set((state) => {
            state.loadingProduct = loading;
          }),
          
        setCreating: (creating) => 
          set((state) => {
            state.creating = creating;
          }),
          
        setUpdating: (updating) => 
          set((state) => {
            state.updating = updating;
          }),
          
        setDeleting: (deleting) => 
          set((state) => {
            state.deleting = deleting;
          }),
          
        // Error handling
        setError: (error) => 
          set((state) => {
            state.error = error;
          }),
          
        clearError: () => 
          set((state) => {
            state.error = null;
          }),
          
        // Computed getters
        getFilteredProducts: () => {
          const { products, filters } = get();
          
          return products.filter(product => {
            // Search filter
            if (filters.search) {
              const searchTerm = filters.search.toLowerCase();
              const searchableFields = [
                product.name,
                product.sku,
                product.description,
                product.supplier,
                product.category
              ].filter(Boolean);
              
              if (!searchableFields.some(field => 
                field.toLowerCase().includes(searchTerm)
              )) {
                return false;
              }
            }
            
            // Category filter
            if (filters.category && product.category !== filters.category) {
              return false;
            }
            
            // Supplier filter
            if (filters.supplier && product.supplier !== filters.supplier) {
              return false;
            }
            
            // Status filter
            if (filters.status && product.status !== filters.status) {
              return false;
            }
            
            // Stock level filter
            if (filters.stockLevel !== 'all') {
              const stock = product.currentStock || 0;
              const minStock = product.minStock || 0;
              
              switch (filters.stockLevel) {
                case 'out':
                  if (stock > 0) return false;
                  break;
                case 'low':
                  if (stock === 0 || stock > minStock) return false;
                  break;
                case 'healthy':
                  if (stock <= minStock) return false;
                  break;
              }
            }
            
            // Location filter
            if (filters.location && product.location !== filters.location) {
              return false;
            }
            
            // Tags filter
            if (filters.tags.length > 0) {
              const productTags = product.tags || [];
              if (!filters.tags.some(tag => productTags.includes(tag))) {
                return false;
              }
            }
            
            return true;
          });
        },
        
        getSortedProducts: () => {
          const filteredProducts = get().getFilteredProducts();
          const { sortBy, sortOrder } = get();
          
          return [...filteredProducts].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // Handle different data types
            if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (typeof aValue === 'number') {
              return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            if (sortOrder === 'asc') {
              return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
              return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
          });
        },
        
        getPaginatedProducts: () => {
          const sortedProducts = get().getSortedProducts();
          const { currentPage, itemsPerPage } = get();
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          
          return sortedProducts.slice(startIndex, endIndex);
        },
        
        getTotalPages: () => {
          const filteredProducts = get().getFilteredProducts();
          const { itemsPerPage } = get();
          return Math.ceil(filteredProducts.length / itemsPerPage);
        },
        
        getProductById: (id) => {
          const { products } = get();
          return products.find(product => product.id === id) || null;
        },
        
        getSelectedProductsData: () => {
          const { products, selectedProducts } = get();
          return products.filter(product => selectedProducts.includes(product.id));
        },
        
        // Statistics
        getProductStats: () => {
          const { products } = get();
          
          const stats = {
            total: products.length,
            active: products.filter(p => p.status === 'active').length,
            inactive: products.filter(p => p.status === 'inactive').length,
            outOfStock: products.filter(p => (p.currentStock || 0) === 0).length,
            lowStock: products.filter(p => {
              const stock = p.currentStock || 0;
              const minStock = p.minStock || 0;
              return stock > 0 && stock <= minStock;
            }).length,
            categories: [...new Set(products.map(p => p.category))].filter(Boolean).length,
            suppliers: [...new Set(products.map(p => p.supplier))].filter(Boolean).length,
            totalValue: products.reduce((sum, p) => sum + ((p.currentStock || 0) * (p.price || 0)), 0)
          };
          
          return stats;
        }
      }))
    ),
    { name: 'products-store' }
  )
);

export default useProductsStore;