import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ordersAPI } from '../services/api';

const useOrdersStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Orders data
        orders: [],
        order: null,
        orderHistory: [],
        statistics: null,
        
        // Filters and pagination
        filters: {
          status: 'all', // all, pending, processing, fulfilled, cancelled
          supplier: '',
          dateRange: { from: null, to: null },
          search: '',
          minAmount: '',
          maxAmount: '',
          priority: 'all' // all, high, medium, low
        },
        
        pagination: {
          page: 1,
          limit: 25,
          total: 0,
          totalPages: 0
        },
        
        // Sorting
        sort: {
          field: 'createdAt',
          direction: 'desc'
        },
        
        // UI state
        selectedOrders: new Set(),
        view: 'list', // list, grid, kanban
        
        // Loading states
        loading: {
          orders: false,
          order: false,
          create: false,
          update: false,
          delete: false,
          export: false,
          statistics: false
        },
        
        // Error handling
        errors: {
          orders: null,
          order: null,
          create: null,
          update: null,
          delete: null,
          export: null,
          statistics: null
        },
        
        // Actions
        
        // Fetch orders with filters and pagination
        fetchOrders: async (params = {}) => {
          set((state) => {
            state.loading.orders = true;
            state.errors.orders = null;
          });
          
          try {
            const { filters, pagination, sort } = get();
            const queryParams = {
              page: pagination.page,
              limit: pagination.limit,
              sort: sort.field,
              order: sort.direction,
              ...filters,
              ...params
            };
            
            // Filter out empty values
            Object.keys(queryParams).forEach(key => {
              if (queryParams[key] === '' || queryParams[key] === 'all' || queryParams[key] === null) {
                delete queryParams[key];
              }
            });
            
            const response = await ordersAPI.getOrders(queryParams);
            
            set((state) => {
              state.orders = response.data || [];
              state.pagination = {
                ...state.pagination,
                total: response.total || 0,
                totalPages: Math.ceil((response.total || 0) / state.pagination.limit)
              };
              state.loading.orders = false;
            });
            
            return response.data || [];
          } catch (error) {
            set((state) => {
              state.errors.orders = error.message || 'Failed to fetch orders';
              state.loading.orders = false;
            });
            throw error;
          }
        },
        
        // Fetch single order
        fetchOrder: async (id) => {
          set((state) => {
            state.loading.order = true;
            state.errors.order = null;
          });
          
          try {
            const response = await ordersAPI.getOrder(id);
            
            set((state) => {
              state.order = response.data || response;
              state.loading.order = false;
            });
            
            return response.data || response;
          } catch (error) {
            set((state) => {
              state.errors.order = error.message || 'Failed to fetch order';
              state.loading.order = false;
            });
            throw error;
          }
        },
        
        // Create order
        createOrder: async (orderData) => {
          set((state) => {
            state.loading.create = true;
            state.errors.create = null;
          });
          
          try {
            const response = await ordersAPI.createOrder(orderData);
            const newOrder = response.data || response;
            
            set((state) => {
              state.orders.unshift(newOrder);
              state.pagination.total += 1;
              state.loading.create = false;
            });
            
            return newOrder;
          } catch (error) {
            set((state) => {
              state.errors.create = error.message || 'Failed to create order';
              state.loading.create = false;
            });
            throw error;
          }
        },
        
        // Update order
        updateOrder: async (id, updates) => {
          set((state) => {
            state.loading.update = true;
            state.errors.update = null;
          });
          
          try {
            const response = await ordersAPI.updateOrder(id, updates);
            const updatedOrder = response.data || response;
            
            set((state) => {
              const index = state.orders.findIndex(order => order.id === id);
              if (index !== -1) {
                state.orders[index] = { ...state.orders[index], ...updatedOrder };
              }
              
              if (state.order && state.order.id === id) {
                state.order = { ...state.order, ...updatedOrder };
              }
              
              state.loading.update = false;
            });
            
            return updatedOrder;
          } catch (error) {
            set((state) => {
              state.errors.update = error.message || 'Failed to update order';
              state.loading.update = false;
            });
            throw error;
          }
        },
        
        // Cancel order
        cancelOrder: async (id, reason = '') => {
          set((state) => {
            state.loading.update = true;
            state.errors.update = null;
          });
          
          try {
            const response = await ordersAPI.cancelOrder(id, reason);
            const updatedOrder = response.data || response;
            
            set((state) => {
              const index = state.orders.findIndex(order => order.id === id);
              if (index !== -1) {
                state.orders[index] = { ...state.orders[index], status: 'cancelled', ...updatedOrder };
              }
              
              if (state.order && state.order.id === id) {
                state.order = { ...state.order, status: 'cancelled', ...updatedOrder };
              }
              
              state.loading.update = false;
            });
            
            return updatedOrder;
          } catch (error) {
            set((state) => {
              state.errors.update = error.message || 'Failed to cancel order';
              state.loading.update = false;
            });
            throw error;
          }
        },
        
        // Fulfill order
        fulfillOrder: async (id, fulfillmentData) => {
          set((state) => {
            state.loading.update = true;
            state.errors.update = null;
          });
          
          try {
            const response = await ordersAPI.fulfillOrder(id, fulfillmentData);
            const updatedOrder = response.data || response;
            
            set((state) => {
              const index = state.orders.findIndex(order => order.id === id);
              if (index !== -1) {
                state.orders[index] = { ...state.orders[index], status: 'fulfilled', ...updatedOrder };
              }
              
              if (state.order && state.order.id === id) {
                state.order = { ...state.order, status: 'fulfilled', ...updatedOrder };
              }
              
              state.loading.update = false;
            });
            
            return updatedOrder;
          } catch (error) {
            set((state) => {
              state.errors.update = error.message || 'Failed to fulfill order';
              state.loading.update = false;
            });
            throw error;
          }
        },
        
        // Fetch order history
        fetchOrderHistory: async (id) => {
          try {
            const response = await ordersAPI.getOrderHistory(id);
            
            set((state) => {
              state.orderHistory = response.data || response;
            });
            
            return response.data || response;
          } catch (error) {
            console.error('Failed to fetch order history:', error);
            return [];
          }
        },
        
        // Fetch order statistics
        fetchStatistics: async (params = {}) => {
          set((state) => {
            state.loading.statistics = true;
            state.errors.statistics = null;
          });
          
          try {
            const response = await ordersAPI.getOrderStatistics(params);
            
            set((state) => {
              state.statistics = response.data || response;
              state.loading.statistics = false;
            });
            
            return response.data || response;
          } catch (error) {
            // Handle the known backend routing issue gracefully
            if (error.response?.status === 404 && error.config?.url?.includes('/orders/statistics')) {
              console.warn('Orders statistics endpoint not available - backend routing issue detected');
              
              // Set default statistics to prevent UI errors
              set((state) => {
                state.statistics = {
                  totalOrders: 0,
                  pendingOrders: 0,
                  completedOrders: 0,
                  cancelledOrders: 0,
                  totalRevenue: 0,
                  averageOrderValue: 0,
                  todayOrders: 0,
                  weekOrders: 0,
                  monthOrders: 0
                };
                state.loading.statistics = false;
                state.errors.statistics = null; // Don't show error for known issue
              });
              
              return get().statistics;
            }
            
            set((state) => {
              state.errors.statistics = error.message || 'Failed to fetch statistics';
              state.loading.statistics = false;
            });
            throw error;
          }
        },
        
        // Export orders
        exportOrders: async (format = 'csv', params = {}) => {
          set((state) => {
            state.loading.export = true;
            state.errors.export = null;
          });
          
          try {
            const { filters } = get();
            const queryParams = { ...filters, format, ...params };
            
            const response = await ordersAPI.exportOrders(queryParams);
            
            set((state) => {
              state.loading.export = false;
            });
            
            return response;
          } catch (error) {
            set((state) => {
              state.errors.export = error.message || 'Failed to export orders';
              state.loading.export = false;
            });
            throw error;
          }
        },
        
        // Bulk operations
        bulkDeleteOrders: async (orderIds) => {
          set((state) => {
            state.loading.delete = true;
            state.errors.delete = null;
          });
          
          try {
            // Note: This would need a bulk delete API endpoint
            await Promise.all(orderIds.map(id => ordersAPI.cancelOrder(id, 'Bulk cancellation')));
            
            set((state) => {
              state.orders = state.orders.filter(order => !orderIds.includes(order.id));
              state.selectedOrders.clear();
              state.pagination.total -= orderIds.length;
              state.loading.delete = false;
            });
            
          } catch (error) {
            set((state) => {
              state.errors.delete = error.message || 'Failed to delete orders';
              state.loading.delete = false;
            });
            throw error;
          }
        },
        
        // Filters and search
        setFilters: (newFilters) =>
          set((state) => {
            state.filters = { ...state.filters, ...newFilters };
            state.pagination.page = 1; // Reset to first page when filters change
          }),
          
        clearFilters: () =>
          set((state) => {
            state.filters = {
              status: 'all',
              supplier: '',
              dateRange: { from: null, to: null },
              search: '',
              minAmount: '',
              maxAmount: '',
              priority: 'all'
            };
            state.pagination.page = 1;
          }),
          
        setSearch: (search) =>
          set((state) => {
            state.filters.search = search;
            state.pagination.page = 1;
          }),
          
        // Pagination
        setPage: (page) =>
          set((state) => {
            state.pagination.page = page;
          }),
          
        setLimit: (limit) =>
          set((state) => {
            state.pagination.limit = limit;
            state.pagination.page = 1; // Reset to first page
          }),
          
        // Sorting
        setSort: (field, direction = 'asc') =>
          set((state) => {
            state.sort.field = field;
            state.sort.direction = direction;
            state.pagination.page = 1; // Reset to first page
          }),
          
        toggleSort: (field) =>
          set((state) => {
            if (state.sort.field === field) {
              state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
            } else {
              state.sort.field = field;
              state.sort.direction = 'asc';
            }
            state.pagination.page = 1;
          }),
          
        // Selection
        selectOrder: (orderId) =>
          set((state) => {
            state.selectedOrders.add(orderId);
          }),
          
        deselectOrder: (orderId) =>
          set((state) => {
            state.selectedOrders.delete(orderId);
          }),
          
        toggleOrderSelection: (orderId) =>
          set((state) => {
            if (state.selectedOrders.has(orderId)) {
              state.selectedOrders.delete(orderId);
            } else {
              state.selectedOrders.add(orderId);
            }
          }),
          
        selectAllOrders: () =>
          set((state) => {
            state.orders.forEach(order => {
              state.selectedOrders.add(order.id);
            });
          }),
          
        deselectAllOrders: () =>
          set((state) => {
            state.selectedOrders.clear();
          }),
          
        // View management
        setView: (view) =>
          set((state) => {
            state.view = view;
          }),
          
        // Error handling
        setError: (section, error) =>
          set((state) => {
            state.errors[section] = error;
          }),
          
        clearError: (section) =>
          set((state) => {
            state.errors[section] = null;
          }),
          
        clearAllErrors: () =>
          set((state) => {
            Object.keys(state.errors).forEach(key => {
              state.errors[key] = null;
            });
          }),
          
        // Computed getters
        getSelectedOrdersCount: () => {
          const { selectedOrders } = get();
          return selectedOrders.size;
        },
        
        getSelectedOrders: () => {
          const { orders, selectedOrders } = get();
          return orders.filter(order => selectedOrders.has(order.id));
        },
        
        getTotalOrderValue: () => {
          const { orders } = get();
          return orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
        },
        
        getOrdersByStatus: (status) => {
          const { orders } = get();
          return orders.filter(order => order.status === status);
        },
        
        hasActiveFilters: () => {
          const { filters } = get();
          return Object.entries(filters).some(([key, value]) => {
            if (key === 'dateRange') {
              return value.from !== null || value.to !== null;
            }
            return value !== '' && value !== 'all' && value !== null;
          });
        }
      }))
    ),
    { name: 'orders-store' }
  )
);

export default useOrdersStore;