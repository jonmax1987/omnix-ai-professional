import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useAlertsStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Alerts data
        alerts: [],
        
        // Filtering and search
        filters: {
          search: '',
          severity: 'all', // all, critical, warning, info
          status: 'all', // all, active, acknowledged, resolved
          category: 'all', // all, stock, price, system, order
          timeRange: 'all', // all, today, week, month
          assignedTo: 'all'
        },
        
        // Sorting
        sortBy: 'timestamp',
        sortOrder: 'desc', // asc, desc
        
        // Pagination
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0,
        
        // Selection
        selectedAlerts: [],
        selectAll: false,
        
        // UI state
        showFilters: false,
        viewMode: 'list', // list, grid, compact
        autoRefresh: true,
        refreshInterval: 30000, // 30 seconds
        
        // Loading states
        loading: false,
        acknowledging: false,
        resolving: false,
        creating: false,
        
        // Error handling
        error: null,
        
        // Notification settings
        notificationSettings: {
          sound: true,
          desktop: true,
          email: true,
          sms: false,
          severity: ['critical', 'warning'] // Which severities trigger notifications
        },
        
        // Statistics
        stats: {
          total: 0,
          active: 0,
          acknowledged: 0,
          resolved: 0,
          critical: 0,
          warning: 0,
          info: 0,
          todayCount: 0,
          avgResolutionTime: 0
        },
        
        // Actions
        setAlerts: (alerts) =>
          set((state) => {
            state.alerts = alerts.map(alert => ({
              ...alert,
              id: alert.id || `alert-${Date.now()}-${Math.random()}`,
              timestamp: alert.timestamp || new Date().toISOString(),
              status: alert.status || 'active'
            }));
            state.totalItems = alerts.length;
            get().updateStats();
          }),

        // API Actions
        fetchAlerts: async (params = {}) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const { alertsAPI } = await import('../services/api.js');
            const response = await alertsAPI.getAlerts(params);
            
            // Use setAlerts to properly set the response
            get().setAlerts(response.data || response.alerts || []);
            
            // Update pagination if provided
            if (response.pagination) {
              set((state) => {
                state.totalItems = response.pagination.total || 0;
              });
            }
          } catch (error) {
            console.error('Failed to fetch alerts:', error);
            set((state) => {
              state.error = error.message || 'Failed to fetch alerts';
            });
            
            // Log warning in development but don't use mock data - always use real database
            if (import.meta.env.DEV) {
              console.warn('⚠️ No alerts data received from API. Please check database connection.');
              // Set empty array instead of mock data to ensure UI reflects real state
              get().setAlerts([]);
            }
          } finally {
            set((state) => {
              state.loading = false;
            });
          }
        },
          
        addAlert: (alert) =>
          set((state) => {
            const newAlert = {
              ...alert,
              id: alert.id || `alert-${Date.now()}-${Math.random()}`,
              timestamp: alert.timestamp || new Date().toISOString(),
              status: alert.status || 'active',
              acknowledgedAt: null,
              resolvedAt: null,
              assignedTo: alert.assignedTo || null,
              notes: alert.notes || [],
              // Backend fields
              dismissedAt: alert.dismissedAt || null,
              dismissedBy: alert.dismissedBy || null,
              expiresAt: alert.expiresAt || null,
              // Client-side fields (preserve existing)
              acknowledged: alert.acknowledged || false,
              title: alert.title || alert.message || 'Alert'
            };
            
            state.alerts.unshift(newAlert);
            state.totalItems = state.alerts.length;
            
            // Trigger notification if enabled
            if (get().shouldNotify(newAlert)) {
              get().triggerNotification(newAlert);
            }
            
            get().updateStats();
          }),
          
        updateAlert: (id, updates) =>
          set((state) => {
            const index = state.alerts.findIndex(alert => alert.id === id);
            if (index !== -1) {
              state.alerts[index] = {
                ...state.alerts[index],
                ...updates,
                updatedAt: new Date().toISOString()
              };
              get().updateStats();
            }
          }),
          
        deleteAlert: (id) =>
          set((state) => {
            state.alerts = state.alerts.filter(alert => alert.id !== id);
            state.totalItems = state.alerts.length;
            state.selectedAlerts = state.selectedAlerts.filter(alertId => alertId !== id);
            get().updateStats();
          }),
          
        deleteAlerts: (ids) =>
          set((state) => {
            state.alerts = state.alerts.filter(alert => !ids.includes(alert.id));
            state.totalItems = state.alerts.length;
            state.selectedAlerts = state.selectedAlerts.filter(alertId => !ids.includes(alertId));
            get().updateStats();
          }),
          
        acknowledgeAlert: (id, userId = 'current-user') =>
          set((state) => {
            const index = state.alerts.findIndex(alert => alert.id === id);
            if (index !== -1 && state.alerts[index].status === 'active') {
              state.alerts[index].status = 'acknowledged';
              state.alerts[index].acknowledgedAt = new Date().toISOString();
              state.alerts[index].acknowledgedBy = userId;
              state.alerts[index].acknowledged = true; // Client-side field
              get().updateStats();
            }
          }),
          
        dismissAlert: (id, userId = 'current-user') =>
          set((state) => {
            const index = state.alerts.findIndex(alert => alert.id === id);
            if (index !== -1) {
              // Map to backend dismiss functionality
              state.alerts[index].dismissedAt = new Date().toISOString();
              state.alerts[index].dismissedBy = userId;
              // Also update client-side fields for compatibility
              state.alerts[index].status = 'acknowledged';
              state.alerts[index].acknowledged = true;
              state.alerts[index].acknowledgedAt = state.alerts[index].acknowledgedAt || new Date().toISOString();
              state.alerts[index].acknowledgedBy = state.alerts[index].acknowledgedBy || userId;
              get().updateStats();
            }
          }),
          
        resolveAlert: (id, resolution = '', userId = 'current-user') =>
          set((state) => {
            const index = state.alerts.findIndex(alert => alert.id === id);
            if (index !== -1) {
              state.alerts[index].status = 'resolved';
              state.alerts[index].resolvedAt = new Date().toISOString();
              state.alerts[index].resolvedBy = userId;
              state.alerts[index].resolution = resolution;
              get().updateStats();
            }
          }),
          
        bulkAcknowledge: (ids, userId = 'current-user') =>
          set((state) => {
            state.acknowledging = true;
            ids.forEach(id => {
              const index = state.alerts.findIndex(alert => alert.id === id);
              if (index !== -1 && state.alerts[index].status === 'active') {
                state.alerts[index].status = 'acknowledged';
                state.alerts[index].acknowledgedAt = new Date().toISOString();
                state.alerts[index].acknowledgedBy = userId;
              }
            });
            state.acknowledging = false;
            get().updateStats();
          }),
          
        bulkResolve: (ids, resolution = '', userId = 'current-user') =>
          set((state) => {
            state.resolving = true;
            ids.forEach(id => {
              const index = state.alerts.findIndex(alert => alert.id === id);
              if (index !== -1) {
                state.alerts[index].status = 'resolved';
                state.alerts[index].resolvedAt = new Date().toISOString();
                state.alerts[index].resolvedBy = userId;
                state.alerts[index].resolution = resolution;
              }
            });
            state.resolving = false;
            get().updateStats();
          }),
          
        addNote: (alertId, note, userId = 'current-user') =>
          set((state) => {
            const index = state.alerts.findIndex(alert => alert.id === alertId);
            if (index !== -1) {
              const newNote = {
                id: `note-${Date.now()}`,
                text: note,
                userId,
                timestamp: new Date().toISOString()
              };
              state.alerts[index].notes = state.alerts[index].notes || [];
              state.alerts[index].notes.push(newNote);
            }
          }),
          
        assignAlert: (alertId, userId) =>
          set((state) => {
            const index = state.alerts.findIndex(alert => alert.id === alertId);
            if (index !== -1) {
              state.alerts[index].assignedTo = userId;
              state.alerts[index].assignedAt = new Date().toISOString();
            }
          }),
          
        // Filtering actions
        setFilter: (key, value) =>
          set((state) => {
            state.filters[key] = value;
            state.currentPage = 1;
          }),
          
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters };
            state.currentPage = 1;
          }),
          
        clearFilters: () =>
          set((state) => {
            state.filters = {
              search: '',
              severity: 'all',
              status: 'all',
              category: 'all',
              timeRange: 'all',
              assignedTo: 'all'
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
            state.currentPage = 1;
          }),
          
        // Selection actions
        setSelectedAlerts: (alertIds) =>
          set((state) => {
            state.selectedAlerts = alertIds;
          }),
          
        toggleAlertSelection: (alertId) =>
          set((state) => {
            const index = state.selectedAlerts.indexOf(alertId);
            if (index === -1) {
              state.selectedAlerts.push(alertId);
            } else {
              state.selectedAlerts.splice(index, 1);
            }
          }),
          
        selectAllVisible: () =>
          set((state) => {
            const visibleAlerts = get().getFilteredAlerts();
            state.selectedAlerts = visibleAlerts.map(alert => alert.id);
            state.selectAll = true;
          }),
          
        clearSelection: () =>
          set((state) => {
            state.selectedAlerts = [];
            state.selectAll = false;
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
          
        setAutoRefresh: (enabled) =>
          set((state) => {
            state.autoRefresh = enabled;
          }),
          
        // Loading actions
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
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
          
        // Notification settings
        updateNotificationSettings: (settings) =>
          set((state) => {
            state.notificationSettings = { ...state.notificationSettings, ...settings };
          }),
          
        // Statistics update
        updateStats: () =>
          set((state) => {
            const { alerts } = state;
            const today = new Date().toDateString();
            
            state.stats = {
              total: alerts.length,
              active: alerts.filter(a => a.status === 'active').length,
              acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
              resolved: alerts.filter(a => a.status === 'resolved').length,
              critical: alerts.filter(a => a.severity === 'critical').length,
              warning: alerts.filter(a => a.severity === 'warning').length,
              info: alerts.filter(a => a.severity === 'info').length,
              todayCount: alerts.filter(a => new Date(a.timestamp).toDateString() === today).length,
              avgResolutionTime: get().calculateAvgResolutionTime()
            };
          }),
          
        // Helper methods
        shouldNotify: (alert) => {
          const { notificationSettings } = get();
          return notificationSettings.severity.includes(alert.severity);
        },
        
        triggerNotification: (alert) => {
          const { notificationSettings } = get();
          
          if (notificationSettings.desktop && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification(`OMNIX Alert: ${alert.title}`, {
                body: alert.message,
                icon: '/favicon.ico',
                tag: alert.id
              });
            }
          }
          
          if (notificationSettings.sound) {
            // Trigger sound notification
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(e => console.log('Could not play notification sound:', e));
          }
        },
        
        calculateAvgResolutionTime: () => {
          const { alerts } = get();
          const resolvedAlerts = alerts.filter(a => a.status === 'resolved' && a.resolvedAt && a.timestamp);
          
          if (resolvedAlerts.length === 0) return 0;
          
          const totalTime = resolvedAlerts.reduce((sum, alert) => {
            const created = new Date(alert.timestamp).getTime();
            const resolved = new Date(alert.resolvedAt).getTime();
            return sum + (resolved - created);
          }, 0);
          
          return Math.round(totalTime / resolvedAlerts.length / (1000 * 60 * 60)); // Convert to hours
        },
        
        // Computed getters
        getFilteredAlerts: () => {
          const { alerts, filters } = get();
          
          return alerts.filter(alert => {
            // Search filter
            if (filters.search) {
              const searchTerm = filters.search.toLowerCase();
              const searchableFields = [
                alert.title,
                alert.message,
                alert.category,
                alert.source
              ].filter(Boolean);
              
              if (!searchableFields.some(field => 
                field.toLowerCase().includes(searchTerm)
              )) {
                return false;
              }
            }
            
            // Severity filter
            if (filters.severity !== 'all' && alert.severity !== filters.severity) {
              return false;
            }
            
            // Status filter
            if (filters.status !== 'all' && alert.status !== filters.status) {
              return false;
            }
            
            // Category filter
            if (filters.category !== 'all' && alert.category !== filters.category) {
              return false;
            }
            
            // Time range filter
            if (filters.timeRange !== 'all') {
              const now = new Date();
              const alertDate = new Date(alert.timestamp);
              
              switch (filters.timeRange) {
                case 'today':
                  if (alertDate.toDateString() !== now.toDateString()) return false;
                  break;
                case 'week':
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  if (alertDate < weekAgo) return false;
                  break;
                case 'month':
                  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                  if (alertDate < monthAgo) return false;
                  break;
              }
            }
            
            // Assigned to filter
            if (filters.assignedTo !== 'all') {
              if (filters.assignedTo === 'unassigned' && alert.assignedTo) return false;
              if (filters.assignedTo !== 'unassigned' && alert.assignedTo !== filters.assignedTo) return false;
            }
            
            return true;
          });
        },
        
        getSortedAlerts: () => {
          const filteredAlerts = get().getFilteredAlerts();
          const { sortBy, sortOrder } = get();
          
          return [...filteredAlerts].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // Handle different data types
            if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (sortBy === 'timestamp' || sortBy === 'acknowledgedAt' || sortBy === 'resolvedAt') {
              aValue = new Date(aValue || 0).getTime();
              bValue = new Date(bValue || 0).getTime();
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
        
        getPaginatedAlerts: () => {
          const sortedAlerts = get().getSortedAlerts();
          const { currentPage, itemsPerPage } = get();
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          
          return sortedAlerts.slice(startIndex, endIndex);
        },
        
        getTotalPages: () => {
          const filteredAlerts = get().getFilteredAlerts();
          const { itemsPerPage } = get();
          return Math.ceil(filteredAlerts.length / itemsPerPage);
        },
        
        getAlertById: (id) => {
          const { alerts } = get();
          return alerts.find(alert => alert.id === id) || null;
        },
        
        getSelectedAlertsData: () => {
          const { alerts, selectedAlerts } = get();
          return alerts.filter(alert => selectedAlerts.includes(alert.id));
        },
        
        getAlertsByCategory: () => {
          const { alerts } = get();
          const categories = {};
          
          alerts.forEach(alert => {
            const category = alert.category || 'uncategorized';
            if (!categories[category]) {
              categories[category] = {
                total: 0,
                active: 0,
                critical: 0,
                warning: 0,
                info: 0
              };
            }
            
            categories[category].total++;
            if (alert.status === 'active') categories[category].active++;
            categories[category][alert.severity]++;
          });
          
          return categories;
        },
        
        getRecentAlerts: (limit = 10) => {
          const { alerts } = get();
          return alerts
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
        }
      }))
    ),
    { name: 'alerts-store' }
  )
);

export default useAlertsStore;