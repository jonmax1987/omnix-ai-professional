import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useRecommendationsStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Recommendations data
        recommendations: [],
        selectedRecommendation: null,
        
        // Filtering and search
        filters: {
          search: '',
          type: 'all', // all, reorder, pricing, marketing, inventory
          priority: 'all', // all, high, medium, low
          status: 'all', // all, pending, accepted, dismissed, implemented
          confidence: 0, // minimum confidence level (0-100)
          category: 'all'
        },
        
        // Sorting
        sortBy: 'priority',
        sortOrder: 'desc', // asc, desc
        
        // Pagination
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0,
        
        // Selection
        selectedRecommendations: [],
        
        // UI state
        showFilters: false,
        viewMode: 'cards', // cards, list, table
        autoRefresh: true,
        refreshInterval: 300000, // 5 minutes
        
        // Loading states
        loading: false,
        accepting: false,
        dismissing: false,
        
        // Error handling
        error: null,
        
        // Statistics
        stats: {
          total: 0,
          pending: 0,
          accepted: 0,
          dismissed: 0,
          implemented: 0,
          highPriority: 0,
          mediumPriority: 0,
          lowPriority: 0,
          totalEstimatedValue: 0,
          avgConfidence: 0
        },
        
        // Actions
        setRecommendations: (recommendations) =>
          set((state) => {
            state.recommendations = recommendations.map(rec => ({
              ...rec,
              id: rec.id || `rec-${Date.now()}-${Math.random()}`,
              createdAt: rec.createdAt || new Date().toISOString(),
              status: rec.status || 'pending'
            }));
            state.totalItems = recommendations.length;
            get().updateStats();
          }),

        updateStats: () =>
          set((state) => {
            const { recommendations } = state;
            state.stats = {
              total: recommendations.length,
              pending: recommendations.filter(r => r.status === 'pending').length,
              accepted: recommendations.filter(r => r.status === 'accepted').length,
              dismissed: recommendations.filter(r => r.status === 'dismissed').length,
              implemented: recommendations.filter(r => r.status === 'implemented').length,
              highPriority: recommendations.filter(r => r.priority === 'high').length,
              mediumPriority: recommendations.filter(r => r.priority === 'medium').length,
              lowPriority: recommendations.filter(r => r.priority === 'low').length,
              totalEstimatedValue: recommendations.reduce((sum, r) => sum + (r.estimatedValue || 0), 0),
              avgConfidence: recommendations.length > 0
                ? recommendations.reduce((sum, r) => sum + (r.confidence || 0), 0) / recommendations.length
                : 0
            };
          }),

        // API Actions
        fetchRecommendations: async (params = {}) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const { recommendationsAPI } = await import('../services/api.js');
            
            // Try to fetch order recommendations from backend (mapped from general recommendations)
            const response = await recommendationsAPI.getOrderRecommendations(params);
            
            // Transform backend recommendations to match frontend expectations
            const transformedRecommendations = (response.data || response.recommendations || []).map(rec => ({
              id: rec.id,
              type: 'reorder', // Backend provides order recommendations
              priority: rec.urgency === 'high' ? 'high' : rec.urgency === 'medium' ? 'medium' : 'low',
              title: `Reorder ${rec.productName}`,
              description: rec.explanation || rec.reason,
              impact: `Prevent stockout and maintain sales`,
              confidence: Math.round(rec.confidence * 100),
              products: [rec.productName],
              action: `Reorder ${rec.recommendedQuantity} units`,
              estimatedValue: rec.estimatedCost,
              urgency: rec.urgency,
              productId: rec.productId,
              currentStock: rec.currentStock,
              recommendedQuantity: rec.recommendedQuantity,
              supplier: rec.supplier,
              leadTime: rec.leadTime,
              createdAt: rec.createdAt,
              status: 'pending'
            }));
            
            get().setRecommendations(transformedRecommendations);
            
            // Update pagination if provided
            if (response.pagination) {
              set((state) => {
                state.totalItems = response.pagination.total || 0;
              });
            }
          } catch (error) {
            console.error('Failed to fetch recommendations:', error);
            set((state) => {
              state.error = error.message || 'Failed to fetch recommendations';
            });
            
            // Log error and set empty state
            if (import.meta.env.DEV) {
              console.warn('⚠️ No recommendations data received from API. Please check database connection.');
              get().setRecommendations([]);
            }
          } finally {
            set((state) => {
              state.loading = false;
            });
          }
        },

        acceptRecommendation: async (recommendationId) => {
          set((state) => {
            state.accepting = true;
          });

          try {
            const { recommendationsAPI } = await import('../services/api.js');
            await recommendationsAPI.acceptRecommendation(recommendationId);
            
            // Update local state
            set((state) => {
              const recommendation = state.recommendations.find(r => r.id === recommendationId);
              if (recommendation) {
                recommendation.status = 'accepted';
                recommendation.acceptedAt = new Date().toISOString();
              }
            });
            
            get().updateStats();
          } catch (error) {
            console.error('Failed to accept recommendation:', error);
            set((state) => {
              state.error = error.message || 'Failed to accept recommendation';
            });
          } finally {
            set((state) => {
              state.accepting = false;
            });
          }
        },

        dismissRecommendation: async (recommendationId) => {
          set((state) => {
            state.dismissing = true;
          });

          try {
            const { recommendationsAPI } = await import('../services/api.js');
            await recommendationsAPI.dismissRecommendation(recommendationId);
            
            // Update local state
            set((state) => {
              const recommendation = state.recommendations.find(r => r.id === recommendationId);
              if (recommendation) {
                recommendation.status = 'dismissed';
                recommendation.dismissedAt = new Date().toISOString();
              }
            });
            
            get().updateStats();
          } catch (error) {
            console.error('Failed to dismiss recommendation:', error);
            set((state) => {
              state.error = error.message || 'Failed to dismiss recommendation';
            });
          } finally {
            set((state) => {
              state.dismissing = false;
            });
          }
        },

        // Selection actions
        selectRecommendation: (id) =>
          set((state) => {
            const index = state.selectedRecommendations.indexOf(id);
            if (index > -1) {
              state.selectedRecommendations.splice(index, 1);
            } else {
              state.selectedRecommendations.push(id);
            }
          }),

        selectAllRecommendations: () =>
          set((state) => {
            const visibleIds = get().getFilteredRecommendations().map(r => r.id);
            state.selectedRecommendations = visibleIds;
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedRecommendations = [];
          }),

        // Filter actions
        setFilter: (key, value) =>
          set((state) => {
            state.filters[key] = value;
            state.currentPage = 1; // Reset to first page when filtering
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = {
              search: '',
              type: 'all',
              priority: 'all',
              status: 'all',
              confidence: 0,
              category: 'all'
            };
            state.currentPage = 1;
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

        setSorting: (sortBy, sortOrder) =>
          set((state) => {
            state.sortBy = sortBy;
            state.sortOrder = sortOrder;
          }),

        setPage: (page) =>
          set((state) => {
            state.currentPage = page;
          }),

        // Error handling
        clearError: () =>
          set((state) => {
            state.error = null;
          }),

        // Computed getters
        getFilteredRecommendations: () => {
          const state = get();
          let filtered = [...state.recommendations];

          // Apply filters
          if (state.filters.search) {
            const search = state.filters.search.toLowerCase();
            filtered = filtered.filter(rec =>
              rec.title.toLowerCase().includes(search) ||
              rec.description.toLowerCase().includes(search) ||
              rec.products.some(product => product.toLowerCase().includes(search))
            );
          }

          if (state.filters.type !== 'all') {
            filtered = filtered.filter(rec => rec.type === state.filters.type);
          }

          if (state.filters.priority !== 'all') {
            filtered = filtered.filter(rec => rec.priority === state.filters.priority);
          }

          if (state.filters.status !== 'all') {
            filtered = filtered.filter(rec => rec.status === state.filters.status);
          }

          if (state.filters.confidence > 0) {
            filtered = filtered.filter(rec => rec.confidence >= state.filters.confidence);
          }

          // Apply sorting
          filtered.sort((a, b) => {
            let aVal = a[state.sortBy];
            let bVal = b[state.sortBy];

            if (state.sortBy === 'priority') {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              aVal = priorityOrder[aVal] || 0;
              bVal = priorityOrder[bVal] || 0;
            }

            if (typeof aVal === 'string') {
              aVal = aVal.toLowerCase();
              bVal = bVal.toLowerCase();
            }

            if (state.sortOrder === 'desc') {
              return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
          });

          return filtered;
        },

        getPaginatedRecommendations: () => {
          const filtered = get().getFilteredRecommendations();
          const start = (get().currentPage - 1) * get().itemsPerPage;
          const end = start + get().itemsPerPage;
          return filtered.slice(start, end);
        },

        getTotalPages: () => {
          const filtered = get().getFilteredRecommendations();
          return Math.ceil(filtered.length / get().itemsPerPage);
        },

        getHighPriorityCount: () => {
          return get().recommendations.filter(r => 
            r.priority === 'high' && r.status === 'pending'
          ).length;
        },

        getTotalEstimatedValue: () => {
          return get().recommendations
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + (r.estimatedValue || 0), 0);
        }
      }))
    ),
    { name: 'recommendations-store' }
  )
);

export default useRecommendationsStore;