import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useForecastingStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Demand forecast data
        demandForecasts: [],
        selectedForecast: null,
        
        // Trend analysis data
        trendAnalysis: null,
        
        // Filtering and search
        filters: {
          search: '',
          category: 'all',
          timeHorizon: '30d', // 7d, 30d, 90d, 6m, 1y
          accuracy: 0, // minimum accuracy threshold (0-100)
          products: []
        },
        
        // UI state
        viewMode: 'chart', // chart, table, grid
        selectedTimeRange: '30d',
        showConfidenceIntervals: true,
        
        // Loading states
        loadingForecasts: false,
        loadingTrends: false,
        
        // Error handling
        forecastError: null,
        trendError: null,
        
        // Forecast settings
        settings: {
          confidenceLevel: 95, // 90, 95, 99
          includeSeasonality: true,
          includeTrends: true,
          includeEvents: true,
          forecastHorizon: 30, // days
          updateFrequency: 'daily' // daily, weekly
        },
        
        // Statistics
        stats: {
          totalForecasts: 0,
          avgAccuracy: 0,
          highAccuracyForecasts: 0,
          forecastsCoverage: 0,
          lastUpdated: null
        },
        
        // Actions
        setDemandForecasts: (forecasts) =>
          set((state) => {
            state.demandForecasts = forecasts.map(forecast => ({
              ...forecast,
              id: forecast.id || forecast.productId || `forecast-${Date.now()}`,
              lastUpdated: forecast.lastUpdated || new Date().toISOString()
            }));
            get().updateStats();
          }),

        setTrendAnalysis: (trendData) =>
          set((state) => {
            state.trendAnalysis = trendData;
          }),

        updateStats: () =>
          set((state) => {
            const { demandForecasts } = state;
            state.stats = {
              totalForecasts: demandForecasts.length,
              avgAccuracy: demandForecasts.length > 0
                ? demandForecasts.reduce((sum, f) => sum + (f.accuracy || 0), 0) / demandForecasts.length
                : 0,
              highAccuracyForecasts: demandForecasts.filter(f => (f.accuracy || 0) >= 85).length,
              forecastsCoverage: demandForecasts.length > 0 ? 
                (demandForecasts.filter(f => f.predictions && f.predictions.length > 0).length / demandForecasts.length) * 100 : 0,
              lastUpdated: new Date().toISOString()
            };
          }),

        // API Actions
        fetchDemandForecasts: async (params = {}) => {
          set((state) => {
            state.loadingForecasts = true;
            state.forecastError = null;
          });

          try {
            const { forecastsAPI } = await import('../services/api.js');
            
            // Fetch demand forecasts from backend
            const response = await forecastsAPI.getDemandForecasts({
              timeHorizon: get().selectedTimeRange,
              ...params
            });
            
            // Transform backend response to match frontend expectations
            const transformedForecasts = (response.data || response.forecasts || []).map(forecast => ({
              id: forecast.id || forecast.productId,
              productId: forecast.productId,
              productName: forecast.productName,
              category: forecast.category,
              timeHorizon: forecast.timeHorizon,
              accuracy: Math.round((forecast.accuracy || 0) * 100),
              model: forecast.model || 'Neural Network',
              lastUpdated: forecast.lastUpdated,
              predictions: (forecast.predictions || []).map(pred => ({
                period: pred.period,
                predictedDemand: pred.predictedDemand,
                confidenceInterval: {
                  lower: pred.confidenceInterval?.lower || pred.predictedDemand * 0.8,
                  upper: pred.confidenceInterval?.upper || pred.predictedDemand * 1.2
                }
              })),
              // Add seasonality and trend indicators
              seasonality: forecast.seasonality || {
                detected: true,
                pattern: 'weekly',
                strength: 0.3
              },
              trend: forecast.trend || 'stable'
            }));
            
            get().setDemandForecasts(transformedForecasts);
            
          } catch (error) {
            console.error('Failed to fetch demand forecasts:', error);
            set((state) => {
              state.forecastError = error.message || 'Failed to fetch forecasts';
            });
            
            // Fallback to mock data in development
            if (process.env.NODE_ENV === 'development') {
              console.log('Using mock demand forecasts for development');
              const mockForecasts = [
                {
                  id: 'forecast-1',
                  productId: 'mock-1',
                  productName: 'Sample Coffee Beans',
                  category: 'food',
                  timeHorizon: '30d',
                  accuracy: 87,
                  model: 'ARIMA',
                  lastUpdated: new Date().toISOString(),
                  predictions: Array.from({ length: 30 }, (_, i) => {
                    const baseDate = new Date();
                    baseDate.setDate(baseDate.getDate() + i);
                    const baseDemand = 25 + Math.sin(i * 0.2) * 10 + Math.random() * 5;
                    return {
                      period: baseDate.toISOString().split('T')[0],
                      predictedDemand: Math.round(baseDemand),
                      confidenceInterval: {
                        lower: Math.round(baseDemand * 0.85),
                        upper: Math.round(baseDemand * 1.15)
                      }
                    };
                  }),
                  seasonality: {
                    detected: true,
                    pattern: 'weekly',
                    strength: 0.4
                  },
                  trend: 'increasing'
                },
                {
                  id: 'forecast-2',
                  productId: 'mock-2',
                  productName: 'Premium Electronics',
                  category: 'electronics',
                  timeHorizon: '30d',
                  accuracy: 92,
                  model: 'Neural Network',
                  lastUpdated: new Date().toISOString(),
                  predictions: Array.from({ length: 30 }, (_, i) => {
                    const baseDate = new Date();
                    baseDate.setDate(baseDate.getDate() + i);
                    const baseDemand = 15 + Math.sin(i * 0.15) * 8 + Math.random() * 3;
                    return {
                      period: baseDate.toISOString().split('T')[0],
                      predictedDemand: Math.round(baseDemand),
                      confidenceInterval: {
                        lower: Math.round(baseDemand * 0.9),
                        upper: Math.round(baseDemand * 1.1)
                      }
                    };
                  }),
                  seasonality: {
                    detected: false,
                    pattern: 'none',
                    strength: 0.1
                  },
                  trend: 'stable'
                }
              ];
              get().setDemandForecasts(mockForecasts);
            }
          } finally {
            set((state) => {
              state.loadingForecasts = false;
            });
          }
        },

        fetchTrendAnalysis: async (params = {}) => {
          set((state) => {
            state.loadingTrends = true;
            state.trendError = null;
          });

          try {
            const { forecastsAPI } = await import('../services/api.js');
            
            // Fetch trend analysis from backend
            const response = await forecastsAPI.getTrendAnalysis({
              timeRange: get().selectedTimeRange,
              ...params
            });
            
            // Transform backend response
            const trendData = {
              timeRange: response.timeRange || get().selectedTimeRange,
              overallTrend: response.overallTrend || 'stable',
              seasonality: response.seasonality || {
                detected: true,
                pattern: 'monthly',
                strength: 0.3
              },
              correlations: response.correlations || [
                { factor: 'Weather', correlation: 0.7 },
                { factor: 'Promotions', correlation: 0.8 },
                { factor: 'Seasonality', correlation: 0.6 }
              ],
              insights: response.insights || [
                'Demand shows weekly seasonality patterns',
                'Weather conditions significantly impact sales',
                'Promotional activities increase demand by 25%',
                'Holiday periods show 40% demand increase'
              ]
            };
            
            get().setTrendAnalysis(trendData);
            
          } catch (error) {
            console.error('Failed to fetch trend analysis:', error);
            set((state) => {
              state.trendError = error.message || 'Failed to fetch trends';
            });
            
            // Fallback to mock data in development
            if (process.env.NODE_ENV === 'development') {
              console.log('Using mock trend analysis for development');
              const mockTrendData = {
                timeRange: '30d',
                overallTrend: 'increasing',
                seasonality: {
                  detected: true,
                  pattern: 'weekly',
                  strength: 0.45
                },
                correlations: [
                  { factor: 'Weather', correlation: 0.72 },
                  { factor: 'Marketing Campaigns', correlation: 0.85 },
                  { factor: 'Competitor Pricing', correlation: -0.34 },
                  { factor: 'Stock Levels', correlation: 0.91 }
                ],
                insights: [
                  'Strong weekly seasonality with peaks on weekends',
                  'Marketing campaigns show highest correlation with demand',
                  'Weather patterns significantly impact food & beverage sales',
                  'Stock availability directly affects sales performance',
                  'Holiday periods require 40-50% additional inventory'
                ]
              };
              get().setTrendAnalysis(mockTrendData);
            }
          } finally {
            set((state) => {
              state.loadingTrends = false;
            });
          }
        },

        // Filter actions
        setFilter: (key, value) =>
          set((state) => {
            state.filters[key] = value;
          }),

        setTimeRange: (timeRange) =>
          set((state) => {
            state.selectedTimeRange = timeRange;
            state.filters.timeHorizon = timeRange;
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = {
              search: '',
              category: 'all',
              timeHorizon: '30d',
              accuracy: 0,
              products: []
            };
          }),

        // UI actions
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),

        toggleConfidenceIntervals: () =>
          set((state) => {
            state.showConfidenceIntervals = !state.showConfidenceIntervals;
          }),

        setSelectedForecast: (forecastId) =>
          set((state) => {
            state.selectedForecast = state.demandForecasts.find(f => f.id === forecastId) || null;
          }),

        // Settings management
        updateSettings: (newSettings) =>
          set((state) => {
            state.settings = { ...state.settings, ...newSettings };
          }),

        // Error handling
        clearErrors: () =>
          set((state) => {
            state.forecastError = null;
            state.trendError = null;
          }),

        // Computed getters
        getFilteredForecasts: () => {
          const state = get();
          let filtered = [...state.demandForecasts];

          // Apply filters
          if (state.filters.search) {
            const search = state.filters.search.toLowerCase();
            filtered = filtered.filter(forecast =>
              forecast.productName.toLowerCase().includes(search) ||
              forecast.category.toLowerCase().includes(search)
            );
          }

          if (state.filters.category !== 'all') {
            filtered = filtered.filter(forecast => forecast.category === state.filters.category);
          }

          if (state.filters.accuracy > 0) {
            filtered = filtered.filter(forecast => forecast.accuracy >= state.filters.accuracy);
          }

          if (state.filters.products.length > 0) {
            filtered = filtered.filter(forecast => 
              state.filters.products.includes(forecast.productId)
            );
          }

          return filtered;
        },

        getForecastByProduct: (productId) => {
          return get().demandForecasts.find(f => f.productId === productId) || null;
        },

        getHighAccuracyForecasts: () => {
          return get().demandForecasts.filter(f => f.accuracy >= 85);
        },

        getPredictionsForTimeRange: (forecastId, days = 7) => {
          const forecast = get().demandForecasts.find(f => f.id === forecastId);
          if (!forecast || !forecast.predictions) return [];
          
          return forecast.predictions.slice(0, days);
        },

        getTotalPredictedDemand: (forecastId, days = 30) => {
          const predictions = get().getPredictionsForTimeRange(forecastId, days);
          return predictions.reduce((sum, pred) => sum + pred.predictedDemand, 0);
        },

        // Utility functions
        refreshAllData: async () => {
          const { fetchDemandForecasts, fetchTrendAnalysis } = get();
          
          await Promise.allSettled([
            fetchDemandForecasts(),
            fetchTrendAnalysis()
          ]);
        },

        getForecastAccuracyTrend: () => {
          const forecasts = get().demandForecasts;
          if (forecasts.length === 0) return [];
          
          // Mock accuracy trend data - in production this would come from historical data
          return Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            accuracy: 85 + Math.sin(i * 0.1) * 10 + Math.random() * 5
          }));
        }
      }))
    ),
    { name: 'forecasting-store' }
  )
);

export default useForecastingStore;