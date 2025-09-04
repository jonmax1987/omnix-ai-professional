import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { dashboardAPIManager } from '../utils/apiRequestManager';
import { queryOptimizer, DatabasePatterns } from '../utils/queryOptimization.js';

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
          },
          inventoryChanges: {
            changes: [],
            stats: {
              critical: 0,
              low: 0,
              normal: 0,
              totalItems: 0
            },
            lastChange: null,
            activeAlerts: []
          },
          customerActivity: {
            activities: [],
            stats: {
              totalToday: 0,
              browsing: 0,
              shopping: 0,
              activeUsers: 0
            },
            lastActivity: null
          },
          abTestResults: {
            tests: [],
            stats: {
              total: 0,
              running: 0,
              completed: 0,
              totalParticipants: 0
            },
            lastUpdate: null
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
          widgetLayout: 'default',
          lastRefreshTime: null,
          refreshStats: {
            successful: 0,
            failed: 0,
            total: 0,
            timestamp: null
          }
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
          realtimeData: null,
          refresh: null
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

        // Real-time inventory change actions
        addInventoryChange: (change) =>
          set((state) => {
            const inventory = state.realtimeData.inventoryChanges;
            
            // Add change to stream
            inventory.changes.unshift({
              ...change,
              timestamp: change.timestamp || new Date().toISOString()
            });
            
            // Keep only last 100 changes
            if (inventory.changes.length > 100) {
              inventory.changes = inventory.changes.slice(0, 100);
            }
            
            // Update last change
            inventory.lastChange = change;
            
            // Update alerts for critical/low stock items
            if (change.urgent || change.reorderStatus === 'critical') {
              const existingAlert = inventory.activeAlerts.find(a => a.productId === change.productId);
              if (!existingAlert) {
                inventory.activeAlerts.push({
                  id: `alert-${Date.now()}-${change.productId}`,
                  productId: change.productId,
                  productName: change.productName,
                  type: change.reorderStatus,
                  message: `${change.productName} is ${change.reorderStatus === 'critical' ? 'critically low' : 'running low'} (${change.newStock} units remaining)`,
                  timestamp: new Date().toISOString(),
                  urgent: change.reorderStatus === 'critical'
                });
                
                // Keep only last 20 alerts
                if (inventory.activeAlerts.length > 20) {
                  inventory.activeAlerts = inventory.activeAlerts.slice(0, 20);
                }
              }
            }
            
            // Update lastUpdate timestamp
            state.realtimeData.lastUpdate = new Date().toISOString();
          }),

        updateInventoryStats: (stats) =>
          set((state) => {
            state.realtimeData.inventoryChanges.stats = { ...stats };
            
            // Update main inventory metrics
            state.metrics.inventory.lowStockItems = stats.low + stats.critical;
            state.metrics.inventory.totalItems = stats.totalItems;
          }),

        clearInventoryAlert: (alertId) =>
          set((state) => {
            state.realtimeData.inventoryChanges.activeAlerts = 
              state.realtimeData.inventoryChanges.activeAlerts.filter(alert => alert.id !== alertId);
          }),

        clearAllInventoryAlerts: () =>
          set((state) => {
            state.realtimeData.inventoryChanges.activeAlerts = [];
          }),

        // Real-time customer activity actions
        addCustomerActivity: (activity) =>
          set((state) => {
            const customerActivity = state.realtimeData.customerActivity;
            
            // Add activity to stream
            customerActivity.activities.unshift({
              ...activity,
              timestamp: activity.timestamp || new Date().toISOString()
            });
            
            // Keep only last 50 activities
            if (customerActivity.activities.length > 50) {
              customerActivity.activities = customerActivity.activities.slice(0, 50);
            }
            
            // Update last activity
            customerActivity.lastActivity = activity;
            
            // Update lastUpdate timestamp
            state.realtimeData.lastUpdate = new Date().toISOString();
          }),

        updateCustomerActivityStats: (stats) =>
          set((state) => {
            state.realtimeData.customerActivity.stats = { ...stats };
          }),

        // Real-time alert notification actions
        addAlertNotification: (alert) =>
          set((state) => {
            if (!state.realtimeData.alertNotifications) {
              state.realtimeData.alertNotifications = {
                alerts: [],
                stats: { total: 0, critical: 0, warning: 0, info: 0, success: 0 },
                lastAlert: null
              };
            }
            
            const notifications = state.realtimeData.alertNotifications;
            
            // Add alert to stream
            notifications.alerts.unshift({
              ...alert,
              timestamp: alert.timestamp || new Date().toISOString()
            });
            
            // Keep only last 50 alerts
            if (notifications.alerts.length > 50) {
              notifications.alerts = notifications.alerts.slice(0, 50);
            }
            
            // Update last alert
            notifications.lastAlert = alert;
            
            // Update stats
            notifications.stats.total += 1;
            if (alert.alertType && notifications.stats[alert.alertType] !== undefined) {
              notifications.stats[alert.alertType] += 1;
            }
            
            // Update lastUpdate timestamp
            state.realtimeData.lastUpdate = new Date().toISOString();
          }),

        updateAlertStats: (stats) =>
          set((state) => {
            if (!state.realtimeData.alertNotifications) {
              state.realtimeData.alertNotifications = {
                alerts: [],
                stats: { total: 0, critical: 0, warning: 0, info: 0, success: 0 },
                lastAlert: null
              };
            }
            state.realtimeData.alertNotifications.stats = { ...stats };
          }),

        clearAlert: (alertId) =>
          set((state) => {
            if (state.realtimeData.alertNotifications) {
              state.realtimeData.alertNotifications.alerts = 
                state.realtimeData.alertNotifications.alerts.filter(alert => alert.id !== alertId);
            }
          }),

        clearAllAlerts: () =>
          set((state) => {
            if (state.realtimeData.alertNotifications) {
              state.realtimeData.alertNotifications.alerts = [];
              state.realtimeData.alertNotifications.stats = { total: 0, critical: 0, warning: 0, info: 0, success: 0 };
            }
          }),

        // Real-time A/B test result actions
        addABTestUpdate: (update) =>
          set((state) => {
            const abTests = state.realtimeData.abTestResults;
            
            // Add or update test in the list
            const existingIndex = abTests.tests.findIndex(test => test.testId === update.testId);
            if (existingIndex >= 0) {
              // Update existing test
              abTests.tests[existingIndex] = {
                ...abTests.tests[existingIndex],
                ...update,
                lastUpdate: update.timestamp || new Date().toISOString()
              };
            } else {
              // Add new test
              abTests.tests.unshift({
                ...update,
                lastUpdate: update.timestamp || new Date().toISOString()
              });
              
              // Keep only last 50 tests
              if (abTests.tests.length > 50) {
                abTests.tests = abTests.tests.slice(0, 50);
              }
            }
            
            // Update last update timestamp
            abTests.lastUpdate = new Date().toISOString();
            state.realtimeData.lastUpdate = new Date().toISOString();
          }),

        updateABTestStats: (stats) =>
          set((state) => {
            state.realtimeData.abTestResults.stats = { ...stats };
          }),

        setABTests: (tests) =>
          set((state) => {
            state.realtimeData.abTestResults.tests = tests;
            
            // Update stats
            state.realtimeData.abTestResults.stats = {
              total: tests.length,
              running: tests.filter(t => t.status === 'running').length,
              completed: tests.filter(t => t.status === 'completed').length,
              totalParticipants: tests.reduce((sum, t) => sum + (t.participants || 0), 0)
            };
          }),

        clearABTestResults: () =>
          set((state) => {
            state.realtimeData.abTestResults.tests = [];
            state.realtimeData.abTestResults.stats = {
              total: 0,
              running: 0,
              completed: 0,
              totalParticipants: 0
            };
          }),

        // Dynamic widget refresh actions
        addWidgetRefresh: (refreshData) =>
          set((state) => {
            if (!state.realtimeData.widgetRefreshes) {
              state.realtimeData.widgetRefreshes = {
                refreshHistory: [],
                widgetStatuses: {},
                globalStats: {
                  totalRefreshes: 0,
                  successfulRefreshes: 0,
                  failedRefreshes: 0,
                  averageRefreshTime: 0
                }
              };
            }

            const widgetRefreshes = state.realtimeData.widgetRefreshes;
            
            // Add refresh to history
            widgetRefreshes.refreshHistory.unshift({
              ...refreshData,
              id: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: refreshData.timestamp || new Date().toISOString()
            });
            
            // Keep only last 100 refreshes
            if (widgetRefreshes.refreshHistory.length > 100) {
              widgetRefreshes.refreshHistory = widgetRefreshes.refreshHistory.slice(0, 100);
            }
            
            // Update global stats
            widgetRefreshes.globalStats.totalRefreshes += 1;
            if (refreshData.success) {
              widgetRefreshes.globalStats.successfulRefreshes += 1;
            } else {
              widgetRefreshes.globalStats.failedRefreshes += 1;
            }
            
            // Update lastUpdate timestamp
            state.realtimeData.lastUpdate = new Date().toISOString();
          }),

        updateWidgetStatus: (widgetId, status, metadata = {}) =>
          set((state) => {
            if (!state.realtimeData.widgetRefreshes) {
              state.realtimeData.widgetRefreshes = {
                refreshHistory: [],
                widgetStatuses: {},
                globalStats: {
                  totalRefreshes: 0,
                  successfulRefreshes: 0,
                  failedRefreshes: 0,
                  averageRefreshTime: 0
                }
              };
            }

            state.realtimeData.widgetRefreshes.widgetStatuses[widgetId] = {
              status,
              lastUpdate: Date.now(),
              ...metadata
            };
          }),

        setWidgetRefreshSettings: (settings) =>
          set((state) => {
            if (!state.realtimeData.widgetRefreshes) {
              state.realtimeData.widgetRefreshes = {
                refreshHistory: [],
                widgetStatuses: {},
                globalStats: {
                  totalRefreshes: 0,
                  successfulRefreshes: 0,
                  failedRefreshes: 0,
                  averageRefreshTime: 0
                }
              };
            }

            state.realtimeData.widgetRefreshes.settings = { ...settings };
          }),

        clearWidgetRefreshHistory: () =>
          set((state) => {
            if (state.realtimeData.widgetRefreshes) {
              state.realtimeData.widgetRefreshes.refreshHistory = [];
              state.realtimeData.widgetRefreshes.globalStats = {
                totalRefreshes: 0,
                successfulRefreshes: 0,
                failedRefreshes: 0,
                averageRefreshTime: 0
              };
            }
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
                  current: response.data.totalOrders || 0,
                  previous: response.data.previousOrders || 0,
                  change: response.data.ordersChange || 0,
                  trend: (response.data.ordersChange || 0) >= 0 ? 'up' : 'down'
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
            
            // Log error but use real data only - no mock fallback
            if (import.meta.env?.DEV) {
              console.error('⚠️ Dashboard metrics API error:', error);
              console.warn('Please check database connection and API endpoints');
              // Set empty state to show loading/error UI
              get().setMetrics({
                revenue: { current: 0, previous: 0, change: 0, trend: 'neutral' },
                orders: { current: 0, previous: 0, change: 0, trend: 'neutral' },
                inventory: { totalValue: 0, totalItems: 0, lowStockItems: 0, outOfStockItems: 0 },
                alerts: { critical: 0, warning: 0, info: 0, total: 0 }
              });
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
                  // Set empty array instead of mock data
                  chartData = [];
                }
                break;
              case 'inventory':
                // Try to fetch inventory graph from backend
                try {
                  const data = await analyticsAPI.getInventoryGraph({ timeRange });
                  chartData = data || [];
                } catch {
                  // Set empty array instead of mock data
                  chartData = [];
                }
                break;
              case 'topProducts':
                // Try to get top products from analytics
                try {
                  const data = await analyticsAPI.getTopProducts({ timeRange });
                  chartData = data || [];
                } catch {
                  // Set empty array instead of mock data
                  chartData = [];
                }
                break;
              case 'categoryBreakdown':
                // Try to get category breakdown from dashboard summary
                try {
                  const summaryData = await analyticsAPI.getDashboardMetrics();
                  chartData = summaryData.categoryBreakdown || [];
                } catch {
                  // Set empty array instead of mock data
                  chartData = [];
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
          const startTime = performance.now();
          
          set((state) => {
            state.ui.refreshing = true;
            state.errors.metrics = null;
            state.errors.charts = null;
          });

          try {
            // Use optimized API manager for concurrent requests with proper cancellation
            const refreshResult = await dashboardAPIManager.refreshDashboard([
              () => fetchMetrics(),
              () => fetchChartData('revenue'),
              () => fetchChartData('inventory'), 
              () => fetchChartData('topProducts'),
              () => fetchChartData('categoryBreakdown')
            ]);

            // Update refresh statistics
            const refreshTime = performance.now() - startTime;
            
            set((state) => {
              state.ui.lastRefreshTime = refreshTime;
              state.ui.refreshStats = {
                successful: refreshResult.successful,
                failed: refreshResult.failed,
                total: refreshResult.total,
                timestamp: new Date().toISOString()
              };
              
              if (refreshResult.failed > 0) {
                state.errors.refresh = `${refreshResult.failed}/${refreshResult.total} requests failed`;
                console.warn('Dashboard refresh partial failure:', refreshResult.errors);
              }
            });

          } catch (error) {
            console.error('Dashboard refresh error:', error);
            set((state) => {
              state.errors.refresh = error.message || 'Dashboard refresh failed';
            });
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
        },

        /**
         * Get API request statistics
         */
        getAPIStats: () => {
          return dashboardAPIManager.getStats();
        },

        /**
         * Cancel all pending API requests
         */
        cancelAllRequests: () => {
          dashboardAPIManager.cancelDashboardRequests();
        },

        /**
         * Cleanup dashboard resources
         */
        cleanup: () => {
          // Cancel any pending requests
          dashboardAPIManager.cancelDashboardRequests();
          
          // Clear any intervals or timeouts
          set((state) => {
            state.ui.refreshing = false;
            state.errors = {
              metrics: null,
              charts: null,
              realtimeData: null,
              refresh: null
            };
          });
        }
      }))
    ),
    { name: 'dashboard-store' }
  )
);

export default useDashboardStore;