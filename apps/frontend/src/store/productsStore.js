import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { queryOptimizer, DatabasePatterns, createOptimizedStore } from '../utils/queryOptimization.js';
import { storeOptimizations } from '../services/optimizedDataService.js';

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
        
        // Optimized query function
        optimizedFetchProducts: null, // Will be set during initialization
        
        // Async Actions
        fetchProducts: async (params = {}) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            // Use optimized query function if available, fallback to original logic
            if (get().optimizedFetchProducts) {
              const currentFilters = get().filters;
              const queryParams = {
                page: get().currentPage,
                limit: get().itemsPerPage,
                sortBy: get().sortBy,
                sortOrder: get().sortOrder,
                search: currentFilters.search || undefined,
                category: currentFilters.category || undefined,
                supplier: currentFilters.supplier || undefined,
                location: currentFilters.location || undefined,
                ...params
              };
              
              const response = await get().optimizedFetchProducts(queryParams, {
                forceFresh: params.forceFresh || false
              });
              
              // Apply client-side optimizations
              const optimizedResponse = get().applyClientSideOptimizations(response, currentFilters);
              get().setProducts(optimizedResponse);
              
              if (response.pagination) {
                set((state) => {
                  state.totalItems = response.pagination.total || 0;
                });
              }
              return;
            }
            
            // Fallback to original implementation
            const { productsAPI } = await import('../services/api.js');
            
            const currentFilters = get().filters;
            const apiParams = {
              page: get().currentPage,
              limit: get().itemsPerPage,
              sortBy: get().sortBy,
              sortOrder: get().sortOrder,
              search: currentFilters.search || undefined,
              category: currentFilters.category || undefined,
              supplier: currentFilters.supplier || undefined,
              location: currentFilters.location || undefined,
              ...params
            };
            
            Object.keys(apiParams).forEach(key => {
              if (apiParams[key] === undefined || apiParams[key] === '') {
                delete apiParams[key];
              }
            });
            
            const response = await productsAPI.getProducts(apiParams);
            
            // Apply client-side optimizations
            const optimizedResponse = get().applyClientSideOptimizations(response, currentFilters);
            get().setProducts(optimizedResponse);
            
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
          
        // Client-side optimization utilities
        searchIndex: null,
        
        // Initialize search index for faster searching
        initializeSearchIndex: () => {
          const { products } = get();
          const searchFields = ['name', 'sku', 'description', 'supplier', 'category'];
          
          set((state) => {
            state.searchIndex = DatabasePatterns.createSearchIndex(products, searchFields);
          });
        },
        
        // Apply client-side optimizations to API response
        applyClientSideOptimizations: (response, filters) => {
          let products = response.products || response.data || [];
          
          // Apply client-side filtering for unsupported backend parameters
          const clientFilters = {
            status: filters.status,
            stockLevel: filters.stockLevel,
            tags: filters.tags
          };
          
          products = DatabasePatterns.createFilterPipeline(products, clientFilters);
          
          return {
            ...response,
            products,
            data: products
          };
        },
        
        // Computed getters with optimization
        getFilteredProducts: () => {
          const { products, filters, searchIndex } = get();
          
          // Use optimized search if search term is provided and index exists
          if (filters.search && searchIndex) {
            const searchResults = DatabasePatterns.searchWithIndex(products, searchIndex, filters.search);
            
            // Apply other filters to search results
            const otherFilters = { ...filters };
            delete otherFilters.search;
            
            return DatabasePatterns.createFilterPipeline(searchResults, otherFilters);
          }
          
          // Fallback to regular filtering
          return DatabasePatterns.createFilterPipeline(products, filters);
        },
        
        getSortedProducts: () => {
          const filteredProducts = get().getFilteredProducts();
          const { sortBy, sortOrder } = get();
          
          return DatabasePatterns.createSortPipeline(filteredProducts, sortBy, sortOrder);
        },
        
        getPaginatedProducts: () => {
          const sortedProducts = get().getSortedProducts();
          const { currentPage, itemsPerPage } = get();
          
          return DatabasePatterns.createCursorPagination(
            sortedProducts, 
            null, // cursor-based navigation (can be enhanced later)
            itemsPerPage
          ).items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
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
        
        // Optimized statistics using aggregation patterns
        getProductStats: () => {
          const { products } = get();
          
          // Use DatabasePatterns for efficient aggregation
          const aggregations = {
            totalValue: { field: 'price', operation: 'sum' },
            avgPrice: { field: 'price', operation: 'avg' },
            maxStock: { field: 'currentStock', operation: 'max' },
            minStock: { field: 'currentStock', operation: 'min' },
            categoryStats: { field: 'price', operation: 'sum', groupBy: 'category' },
            supplierStats: { field: 'currentStock', operation: 'sum', groupBy: 'supplier' }
          };
          
          const aggregated = DatabasePatterns.createAggregationPipeline(products, aggregations);
          
          // Manual stats that don't fit aggregation pattern
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
            ...aggregated
          };
          
          return stats;
        },
        
        // Initialize optimization features using centralized service
        initializeOptimizations: async () => {
          try {
            const enhancer = storeOptimizations.createProductsStoreEnhancer();
            const optimizations = await enhancer.initializeOptimizations();
            
            set((state) => {
              state.optimizedFetchProducts = optimizations.optimizedFetchProducts;
              state.searchProducts = optimizations.searchProducts;
              state.filterProducts = optimizations.filterProducts;
              state.sortProducts = optimizations.sortProducts;
            });
            
            // Initialize search index with current products
            const { products } = get();
            if (products.length > 0) {
              enhancer.initializeSearchIndex(products);
            }
            
            console.log('[ProductsStore] Optimizations initialized successfully');
          } catch (error) {
            console.error('[ProductsStore] Failed to initialize optimizations:', error);
            // Fallback to basic functionality
            get().initializeBasicOptimizations();
          }
        },

        // Fallback optimization initialization
        initializeBasicOptimizations: () => {
          // Initialize search index only
          get().initializeSearchIndex();
          console.log('[ProductsStore] Basic optimizations initialized as fallback');
        }
      }))
    ),
    { name: 'products-store' }
  )
);

export default useProductsStore;