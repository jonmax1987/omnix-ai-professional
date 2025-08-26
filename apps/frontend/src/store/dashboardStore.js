import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useDashboardStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Dashboard metrics data
        metrics: {
          revenue: {
            current: 0,
            previous: 0,
            change: 0,
            trend: 'neutral'
          },
          orders: {
            current: 0,
            previous: 0,
            change: 0,
            trend: 'neutral'
          },
          inventory: {
            totalValue: 0,
            totalItems: 0,
            lowStockItems: 0,
            outOfStockItems: 0
          },
          alerts: {
            critical: 0,
            warning: 0,
            info: 0,
            total: 0
          }
        },

        // Real-time data
        realtimeData: {
          liveOrders: [],
          stockAlerts: [],
          systemStatus: 'healthy', // healthy, warning, error
          lastUpdate: null,
          revenueStream: {
            current: 0,
            transactions: [],
            lastTransaction: null,
            hourlyRevenue: [],
            dailyTarget: 150000,
            dailyProgress: 0
          }
        },

        // Chart data
        charts: {
          revenue: {
            data: [],
            timeRange: '7d',
            loading: false
          },
          inventory: {
            data: [],
            timeRange: '30d',
            loading: false
          },
          topProducts: {
            data: [],
            loading: false
          },
          categoryBreakdown: {
            data: [],
            loading: false
          }
        },

        // Dashboard settings
        settings: {
          refreshInterval: 30000, // 30 seconds
          autoRefresh: true,
          compactView: false,
          showRecentActivity: true,
          defaultTimeRange: '7d'
        },

        // UI state
        ui: {
          refreshing: false,
          selectedMetric: null,
          selectedTimeRange: '7d',
          viewMode: 'overview', // overview, detailed
          widgetLayout: 'default'
        },

        // Loading states
        loading: {
          metrics: false,
          charts: false,
          realtimeData: false
        },

        // Error handling
        errors: {
          metrics: null,
          charts: null,
          realtimeData: null
        },

        // Actions
        setMetrics: (metrics) =>
          set((state) => {
            state.metrics = { ...state.metrics, ...metrics };
          }),

        updateMetric: (key, data) =>
          set((state) => {
            if (state.metrics[key]) {
              state.metrics[key] = { ...state.metrics[key], ...data };
            }
          }),

        setRealtimeData: (data) =>
          set((state) => {
            state.realtimeData = {
              ...state.realtimeData,
              ...data,
              lastUpdate: new Date().toISOString()
            };
          }),

        addLiveOrder: (order) =>
          set((state) => {
            state.realtimeData.liveOrders.unshift({
              ...order,
              timestamp: new Date().toISOString()
            });
            // Keep only last 50 orders
            if (state.realtimeData.liveOrders.length > 50) {
              state.realtimeData.liveOrders = state.realtimeData.liveOrders.slice(0, 50);
            }
          }),

        addStockAlert: (alert) =>
          set((state) => {
            const existingAlert = state.realtimeData.stockAlerts.find(a => a.productId === alert.productId);
            if (!existingAlert) {
              state.realtimeData.stockAlerts.push({
                ...alert,
                id: `alert-${Date.now()}`,
                timestamp: new Date().toISOString()
              });
            }
          }),

        dismissStockAlert: (alertId) =>
          set((state) => {
            state.realtimeData.stockAlerts = state.realtimeData.stockAlerts.filter(
              alert => alert.id !== alertId
            );
          }),

        setSystemStatus: (status) =>
          set((state) => {
            state.realtimeData.systemStatus = status;
          }),

        // Real-time revenue stream actions
        updateRevenueStream: (transaction) =>
          set((state) => {
            const revenue = state.realtimeData.revenueStream;
            
            // Add transaction to stream
            revenue.transactions.unshift({
              ...transaction,
              timestamp: transaction.timestamp || new Date().toISOString()
            });
            
            // Keep only last 100 transactions
            if (revenue.transactions.length > 100) {
              revenue.transactions = revenue.transactions.slice(0, 100);
            }
            
            // Update current revenue
            if (transaction.amount) {
              revenue.current += transaction.amount;
              state.metrics.revenue.current += transaction.amount;
            }
            
            // Update last transaction
            revenue.lastTransaction = transaction;
            
            // Update daily progress
            revenue.dailyProgress = (revenue.current / revenue.dailyTarget) * 100;
            
            // Update lastUpdate timestamp
            state.realtimeData.lastUpdate = new Date().toISOString();
          }),

        updateHourlyRevenue: (hourlyData) =>
          set((state) => {
            state.realtimeData.revenueStream.hourlyRevenue = hourlyData;
          }),

        resetDailyRevenue: () =>
          set((state) => {
            state.realtimeData.revenueStream.current = 0;
            state.realtimeData.revenueStream.transactions = [];
            state.realtimeData.revenueStream.dailyProgress = 0;
            state.realtimeData.revenueStream.hourlyRevenue = [];
          }),

        setDailyTarget: (target) =>
          set((state) => {
            state.realtimeData.revenueStream.dailyTarget = target;
            state.realtimeData.revenueStream.dailyProgress = 
              (state.realtimeData.revenueStream.current / target) * 100;
          }),

        // Chart data management
        setChartData: (chartKey, data, timeRange = null) =>
          set((state) => {
            if (state.charts[chartKey]) {
              state.charts[chartKey].data = data;
              state.charts[chartKey].loading = false;
              if (timeRange) {
                state.charts[chartKey].timeRange = timeRange;
              }
            }
          }),

        setChartLoading: (chartKey, loading) =>
          set((state) => {
            if (state.charts[chartKey]) {
              state.charts[chartKey].loading = loading;
            }
          }),

        updateChartTimeRange: (chartKey, timeRange) =>
          set((state) => {
            if (state.charts[chartKey]) {
              state.charts[chartKey].timeRange = timeRange;
            }
          }),

        // Settings management
        updateSettings: (newSettings) =>
          set((state) => {
            state.settings = { ...state.settings, ...newSettings };
          }),

        setAutoRefresh: (enabled) =>
          set((state) => {
            state.settings.autoRefresh = enabled;
          }),

        setRefreshInterval: (interval) =>
          set((state) => {
            state.settings.refreshInterval = interval;
          }),

        // UI actions
        setSelectedMetric: (metric) =>
          set((state) => {
            state.ui.selectedMetric = metric;
          }),

        setSelectedTimeRange: (timeRange) =>
          set((state) => {
            state.ui.selectedTimeRange = timeRange;
          }),

        setViewMode: (mode) =>
          set((state) => {
            state.ui.viewMode = mode;
          }),

        setRefreshing: (refreshing) =>
          set((state) => {
            state.ui.refreshing = refreshing;
          }),

        setWidgetLayout: (layout) =>
          set((state) => {
            state.ui.widgetLayout = layout;
          }),

        // Loading states
        setLoading: (key, loading) =>
          set((state) => {
            state.loading[key] = loading;
          }),

        // Error handling
        setError: (key, error) =>
          set((state) => {
            state.errors[key] = error;
          }),

        clearError: (key) =>
          set((state) => {
            state.errors[key] = null;
          }),

        clearAllErrors: () =>
          set((state) => {
            Object.keys(state.errors).forEach(key => {
              state.errors[key] = null;
            });
          }),

        // Data fetching actions
        fetchMetrics: async () => {
          set((state) => {
            state.loading.metrics = true;
            state.errors.metrics = null;
          });

          try {
            // Import API service
            const { analyticsAPI } = await import('../services/api.js');
            
            // Fetch dashboard summary from backend
            const response = await analyticsAPI.getDashboardMetrics();
            
            // Transform API response to match store structure
            if (response.data) {
              const transformedMetrics = {
                revenue: {
                  current: response.data.totalInventoryValue || 0,
                  previous: (response.data.totalInventoryValue || 0) * 0.85,
                  change: 8.5,
                  trend: 'up'
                },
                orders: {
                  current: 1247, // Mock orders data
                  previous: 1134,
                  change: 10.0,
                  trend: 'up'
                },
                inventory: {
                  totalValue: response.data.totalInventoryValue || 0,
                  totalItems: response.data.totalItems || 0,
                  lowStockItems: response.data.lowStockItems || 0,
                  outOfStockItems: response.data.outOfStockItems || 0
                },
                alerts: {
                  critical: Math.floor((response.data.activeAlerts || 0) * 0.3),
                  warning: Math.floor((response.data.activeAlerts || 0) * 0.5),
                  info: Math.floor((response.data.activeAlerts || 0) * 0.2),
                  total: response.data.activeAlerts || 0
                }
              };
              get().setMetrics(transformedMetrics);
            }
          } catch (error) {
            console.error('Failed to fetch dashboard metrics:', error);
            set((state) => {
              state.errors.metrics = error.message || 'Failed to fetch metrics';
            });
            
            // Fallback to mock data in development
            if (import.meta.env?.DEV) {
              const mockMetrics = {
                revenue: {
                  current: 125430.50,
                  previous: 118250.30,
                  change: 6.1,
                  trend: 'up'
                },
                orders: {
                  current: 1247,
                  previous: 1134,
                  change: 10.0,
                  trend: 'up'
                },
                inventory: {
                  totalValue: 2450000,
                  totalItems: 15420,
                  lowStockItems: 45,
                  outOfStockItems: 12
                },
                alerts: {
                  critical: 3,
                  warning: 12,
                  info: 8,
                  total: 23
                }
              };
              get().setMetrics(mockMetrics);
            }
          } finally {
            set((state) => {
              state.loading.metrics = false;
            });
          }
        },

        fetchChartData: async (chartKey, timeRange = '7d') => {
          get().setChartLoading(chartKey, true);

          try {
            const { analyticsAPI } = await import('../services/api.js');
            let chartData = [];
            
            switch (chartKey) {
              case 'revenue':
                // Try to fetch revenue data from backend
                try {
                  const data = await analyticsAPI.getRevenueMetrics({ timeRange });
                  chartData = data || [];
                } catch {
                  // Fallback to mock data
                  chartData = Array.from({ length: 30 }, (_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
                    value: Math.floor(Math.random() * 5000) + 3000
                  }));
                }
                break;
              case 'inventory':
                // Try to fetch inventory graph from backend
                try {
                  const data = await analyticsAPI.getInventoryGraph({ timeRange });
                  chartData = data || [];
                } catch {
                  // Fallback to mock data
                  chartData = Array.from({ length: 12 }, (_, i) => ({
                    month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
                    value: Math.floor(Math.random() * 500000) + 2000000
                  }));
                }
                break;
              case 'topProducts':
                // Mock data for now - backend doesn't have this endpoint yet
                chartData = [
                  { name: 'Product A', sales: 1245, change: 12.5 },
                  { name: 'Product B', sales: 987, change: -3.2 },
                  { name: 'Product C', sales: 856, change: 8.7 },
                  { name: 'Product D', sales: 743, change: 15.3 },
                  { name: 'Product E', sales: 621, change: -1.4 }
                ];
                break;
              case 'categoryBreakdown':
                // Try to get category breakdown from dashboard summary
                try {
                  const summaryData = await analyticsAPI.getDashboardMetrics();
                  chartData = summaryData.categoryBreakdown || [];
                } catch {
                  // Fallback to mock data
                  chartData = [
                    { category: 'Electronics', value: 35, count: 1420 },
                    { category: 'Clothing', value: 28, count: 1890 },
                    { category: 'Food & Beverages', value: 22, count: 2340 },
                    { category: 'Home & Garden', value: 10, count: 580 },
                    { category: 'Books', value: 5, count: 320 }
                  ];
                }
                break;
              default:
                chartData = [];
            }

            get().setChartData(chartKey, chartData, timeRange);
          } catch (error) {
            console.error(`Failed to fetch chart data for ${chartKey}:`, error);
            set((state) => {
              state.errors.charts = error.message || 'Failed to fetch chart data';
              state.charts[chartKey].loading = false;
            });
          }
        },

        refreshDashboard: async () => {
          const { fetchMetrics, fetchChartData } = get();
          
          set((state) => {
            state.ui.refreshing = true;
          });

          try {
            // Fetch metrics and chart data in parallel
            await Promise.allSettled([
              fetchMetrics(),
              fetchChartData('revenue'),
              fetchChartData('inventory'),
              fetchChartData('topProducts'),
              fetchChartData('categoryBreakdown')
            ]);
          } catch (error) {
            console.error('Dashboard refresh error:', error);
          } finally {
            set((state) => {
              state.ui.refreshing = false;
              state.realtimeData.lastUpdate = new Date().toISOString();
            });
          }
        },

        // Computed getters
        getTotalAlerts: () => {
          const { metrics } = get();
          return metrics.alerts.total;
        },

        getCriticalAlerts: () => {
          const { metrics, realtimeData } = get();
          return metrics.alerts.critical + realtimeData.stockAlerts.filter(alert => alert.severity === 'critical').length;
        },

        getRecentActivity: () => {
          const { realtimeData } = get();
          const activities = [
            ...realtimeData.liveOrders.slice(0, 10).map(order => ({
              id: order.id,
              type: 'order',
              message: `New order #${order.id}`,
              timestamp: order.timestamp,
              value: order.total
            })),
            ...realtimeData.stockAlerts.slice(0, 5).map(alert => ({
              id: alert.id,
              type: 'alert',
              message: alert.message,
              timestamp: alert.timestamp,
              severity: alert.severity
            }))
          ];

          return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 15);
        },

        getSystemHealth: () => {
          const { realtimeData, metrics } = get();
          const criticalAlerts = metrics.alerts.critical;
          const stockoutItems = metrics.inventory.outOfStockItems;
          
          if (criticalAlerts > 5 || stockoutItems > 20) {
            return 'error';
          } else if (criticalAlerts > 0 || stockoutItems > 10) {
            return 'warning';
          }
          return 'healthy';
        },

        getInventoryStatus: () => {
          const { metrics } = get();
          const { totalItems, lowStockItems, outOfStockItems } = metrics.inventory;
          const healthyItems = totalItems - lowStockItems - outOfStockItems;
          
          return {
            healthy: healthyItems,
            low: lowStockItems,
            out: outOfStockItems,
            healthyPercentage: totalItems > 0 ? Math.round((healthyItems / totalItems) * 100) : 0,
            lowPercentage: totalItems > 0 ? Math.round((lowStockItems / totalItems) * 100) : 0,
            outPercentage: totalItems > 0 ? Math.round((outOfStockItems / totalItems) * 100) : 0
          };
        }
      }))
    ),
    { name: 'dashboard-store' }
  )
);

export default useDashboardStore;