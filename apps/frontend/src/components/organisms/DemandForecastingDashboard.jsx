import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Target, 
  Filter,
  RefreshCw,
  AlertTriangle,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useWebSocketStore } from '../../store/websocketStore';
import demandForecastingService from '../../services/demandForecastingService';

const DashboardContainer = styled.div`
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterPanel = styled(motion.div)`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  background: ${({ theme }) => theme.colors.surface};
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 2rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.hover};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ $color }) => $color}, ${({ $color }) => $color}80);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatIcon = styled.div`
  padding: 0.5rem;
  border-radius: 8px;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  color: ${({ $trend, theme }) => 
    $trend === 'up' ? theme.colors.success : 
    $trend === 'down' ? theme.colors.error : 
    theme.colors.text.secondary
  };
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ForecastsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ForecastCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;

  ${({ $trend }) => {
    if ($trend > 0.2) return `
      border-color: #10b981;
      background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
    `;
    if ($trend < -0.2) return `
      border-color: #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
    `;
    return '';
  }}
`;

const ForecastHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ItemName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const ItemCategory = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TrendBadge = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${({ $trend }) => {
    if ($trend > 0.2) return `
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    `;
    if ($trend < -0.2) return `
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    `;
    return `
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
    `;
  }}
`;

const ForecastMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Metric = styled.div`
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ForecastChart = styled.div`
  height: 120px;
  margin-bottom: 1rem;
  position: relative;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 1rem;
  overflow: hidden;
`;

const ChartBar = styled(motion.div)`
  position: absolute;
  bottom: 1rem;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary}80 0%, ${({ theme }) => theme.colors.primary} 100%);
  border-radius: 3px 3px 0 0;
  min-height: 8px;
`;

const ChartDay = styled.div`
  position: absolute;
  bottom: 0.25rem;
  font-size: 0.6rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  transform: translateX(-50%);
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ConfidenceProgress = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #ef4444 0%, #f59e0b 30%, #10b981 100%);
  border-radius: 3px;
`;

const RecommendationsPanel = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const RecommendationTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${({ $priority, theme }) => {
    switch ($priority) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fffbeb';
      default: return '#f0f9ff';
    }
  }};
  color: ${({ $priority }) => {
    switch ($priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      default: return '#2563eb';
    }
  }};
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`;

const AlertsPanel = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 2rem;
`;

const AlertsHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const AlertsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
`;

const AlertItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border-left: 4px solid ${({ $priority }) => {
    switch ($priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
`;

const AlertIcon = styled.div`
  color: ${({ $priority }) => {
    switch ($priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertMessage = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const AlertTime = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const DemandForecastingDashboard = () => {
  const [forecasts, setForecasts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [forecastPeriod, setForecastPeriod] = useState(7);
  const [refreshing, setRefreshing] = useState(false);

  const { 
    demandForecasts, 
    demandAlerts, 
    inventoryUpdates,
    customerActivity,
    pricingUpdates,
    depletionPredictions,
    realtimeData 
  } = useWebSocketStore();

  useEffect(() => {
    loadInitialData();
  }, [forecastPeriod]);

  // Real-time demand forecast updates
  useEffect(() => {
    if (demandForecasts && demandForecasts.length > 0) {
      setForecasts(prev => {
        const updated = [...prev];
        demandForecasts.forEach(newForecast => {
          const existingIndex = updated.findIndex(f => f.itemId === newForecast.itemId);
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...newForecast,
              realTimeUpdate: true,
              lastUpdated: new Date().toISOString(),
              adjustmentTrigger: 'forecast_recalculation'
            };
          } else {
            updated.push({
              ...newForecast,
              realTimeUpdate: true,
              lastUpdated: new Date().toISOString(),
              adjustmentTrigger: 'initial_forecast'
            });
          }
        });
        
        // Recalculate stats with updated forecasts
        calculateStats(updated);
        return updated;
      });
    }
  }, [demandForecasts]);

  // Real-time demand alerts
  useEffect(() => {
    if (demandAlerts && demandAlerts.length > 0) {
      setAlerts(prev => {
        const newAlerts = demandAlerts.map(alert => ({
          ...alert,
          realTime: true,
          id: `rt-demand-alert-${alert.itemId}-${Date.now()}`,
          timestamp: alert.timestamp || new Date().toISOString()
        }));
        
        return [...newAlerts, ...prev].slice(0, 50);
      });
    }
  }, [demandAlerts]);

  // Real-time inventory updates affecting demand forecasts
  useEffect(() => {
    if (inventoryUpdates && Object.keys(inventoryUpdates).length > 0) {
      setForecasts(prev => {
        const updated = [...prev];
        Object.entries(inventoryUpdates).forEach(([itemId, inventoryData]) => {
          const existingIndex = updated.findIndex(f => f.itemId === itemId);
          if (existingIndex >= 0) {
            // Adjust demand forecast based on current stock levels
            const currentForecast = updated[existingIndex];
            const newStock = inventoryData.currentStock || inventoryData.stockLevel;
            const stockoutRisk = newStock < currentForecast.averageDailyDemand * 3;
            
            updated[existingIndex] = {
              ...currentForecast,
              currentStock: newStock,
              stockoutRisk,
              adjustmentTrigger: 'inventory_update',
              inventoryAdjusted: true,
              lastInventoryUpdate: new Date().toISOString(),
              // Adjust peak demand if stockout risk is high
              peakDemand: stockoutRisk 
                ? currentForecast.peakDemand * 1.2 // 20% increase for stockout scenarios
                : currentForecast.peakDemand,
              confidence: stockoutRisk 
                ? Math.max(0.6, currentForecast.confidence - 0.1) // Slightly lower confidence
                : currentForecast.confidence
            };
          }
        });
        
        calculateStats(updated);
        return updated;
      });
    }
  }, [inventoryUpdates]);

  // Real-time customer activity affecting demand patterns
  useEffect(() => {
    if (customerActivity && customerActivity.length > 0) {
      // Process recent customer activity to adjust demand forecasts
      const recentActivity = customerActivity.slice(0, 10); // Last 10 activities
      const activityByItem = {};
      
      recentActivity.forEach(activity => {
        if (activity.productId && activity.type === 'purchase') {
          if (!activityByItem[activity.productId]) {
            activityByItem[activity.productId] = [];
          }
          activityByItem[activity.productId].push(activity);
        }
      });
      
      if (Object.keys(activityByItem).length > 0) {
        setForecasts(prev => {
          const updated = [...prev];
          Object.entries(activityByItem).forEach(([itemId, activities]) => {
            const existingIndex = updated.findIndex(f => f.itemId === itemId);
            if (existingIndex >= 0) {
              const currentForecast = updated[existingIndex];
              const activityBoost = activities.length * 0.1; // 10% per recent purchase
              
              updated[existingIndex] = {
                ...currentForecast,
                adjustmentTrigger: 'customer_activity',
                activityAdjusted: true,
                lastActivityUpdate: new Date().toISOString(),
                // Increase demand based on recent activity
                averageDailyDemand: currentForecast.averageDailyDemand * (1 + activityBoost),
                peakDemand: currentForecast.peakDemand * (1 + activityBoost * 1.5),
                recentActivityCount: activities.length,
                confidence: Math.min(0.95, currentForecast.confidence + activityBoost * 0.5)
              };
            }
          });
          
          calculateStats(updated);
          return updated;
        });
      }
    }
  }, [customerActivity]);

  // Real-time pricing changes affecting demand
  useEffect(() => {
    if (pricingUpdates && Object.keys(pricingUpdates).length > 0) {
      setForecasts(prev => {
        const updated = [...prev];
        Object.entries(pricingUpdates).forEach(([itemId, pricingData]) => {
          const existingIndex = updated.findIndex(f => f.itemId === itemId);
          if (existingIndex >= 0) {
            const currentForecast = updated[existingIndex];
            const priceChange = pricingData.priceChange || 0;
            const priceElasticity = -1.2; // Typical elasticity: 1% price increase = 1.2% demand decrease
            
            const demandAdjustment = 1 + (priceChange * priceElasticity / 100);
            
            updated[existingIndex] = {
              ...currentForecast,
              adjustmentTrigger: 'pricing_change',
              pricingAdjusted: true,
              lastPricingUpdate: new Date().toISOString(),
              priceChangePercent: priceChange,
              // Adjust demand based on price elasticity
              averageDailyDemand: currentForecast.averageDailyDemand * demandAdjustment,
              peakDemand: currentForecast.peakDemand * demandAdjustment,
              confidence: Math.max(0.5, currentForecast.confidence - Math.abs(priceChange) * 0.01)
            };
          }
        });
        
        calculateStats(updated);
        return updated;
      });
    }
  }, [pricingUpdates]);

  // Cross-reference with depletion predictions for demand validation
  useEffect(() => {
    if (depletionPredictions && depletionPredictions.length > 0) {
      setForecasts(prev => {
        const updated = [...prev];
        depletionPredictions.forEach(prediction => {
          const existingIndex = updated.findIndex(f => f.itemId === prediction.itemId);
          if (existingIndex >= 0) {
            const currentForecast = updated[existingIndex];
            const depletionDays = prediction.predictedDepletion?.daysToDepletion || prediction.daysToDepletion;
            
            // If depletion is faster than forecast suggests, adjust demand upward
            const expectedDepletionFromForecast = currentForecast.currentStock / currentForecast.averageDailyDemand;
            const depletionDiscrepancy = expectedDepletionFromForecast / depletionDays;
            
            if (Math.abs(depletionDiscrepancy - 1) > 0.2) { // 20% discrepancy threshold
              updated[existingIndex] = {
                ...currentForecast,
                adjustmentTrigger: 'depletion_validation',
                depletionValidated: true,
                lastDepletionValidation: new Date().toISOString(),
                depletionDiscrepancy,
                // Adjust demand to match depletion prediction
                averageDailyDemand: currentForecast.currentStock / depletionDays,
                forecastValidationScore: Math.max(0.5, 1 - Math.abs(depletionDiscrepancy - 1))
              };
            }
          }
        });
        
        return updated;
      });
    }
  }, [depletionPredictions]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const mockItems = [
        { id: 'item_1', name: 'Premium Coffee Beans', category: 'Beverages' },
        { id: 'item_2', name: 'Organic Milk', category: 'Dairy' },
        { id: 'item_3', name: 'Artisan Bread', category: 'Bakery' },
        { id: 'item_4', name: 'Fresh Eggs', category: 'Dairy' },
        { id: 'item_5', name: 'Greek Yogurt', category: 'Dairy' },
        { id: 'item_6', name: 'Seasonal Fruits', category: 'Produce' }
      ];

      const forecastPromises = mockItems.map(async item => {
        const forecast = await demandForecastingService.forecastDemand(
          item.id, 
          forecastPeriod,
          { 
            category: item.category,
            weather: 'normal',
            promotions: [],
            economicFactors: { inflationRate: 2.5 },
            competitorActivity: { promotions: false }
          }
        );
        return {
          ...forecast,
          itemName: item.name,
          category: item.category
        };
      });

      const results = await Promise.all(forecastPromises);
      setForecasts(results);
      
      calculateStats(results);
      generateInitialAlerts(results);
      
    } catch (error) {
      console.error('Failed to load demand forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (forecasts) => {
    const highDemand = forecasts.filter(f => f.peakDemand > f.averageDailyDemand * 1.5).length;
    const increasing = forecasts.filter(f => f.trend > 0.1).length;
    const decreasing = forecasts.filter(f => f.trend < -0.1).length;
    const total = forecasts.length;
    const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / total;
    const totalDemand = forecasts.reduce((sum, f) => sum + f.totalDemand, 0);

    setStats({
      highDemand,
      increasing,
      decreasing,
      total,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      totalDemand
    });
  };

  const generateInitialAlerts = (forecasts) => {
    const newAlerts = forecasts
      .filter(f => f.recommendations && f.recommendations.length > 0)
      .flatMap(f => 
        f.recommendations.map(rec => ({
          id: `alert_${f.itemId}_${rec.type}_${Date.now()}`,
          itemName: f.itemName,
          message: rec.message,
          priority: rec.priority,
          type: rec.type,
          action: rec.action,
          timestamp: new Date().toISOString()
        }))
      );
    
    setAlerts(newAlerts);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredForecasts = useMemo(() => {
    if (filter === 'all') return forecasts;
    if (filter === 'high_demand') return forecasts.filter(f => f.peakDemand > f.averageDailyDemand * 1.5);
    if (filter === 'increasing') return forecasts.filter(f => f.trend > 0.1);
    if (filter === 'decreasing') return forecasts.filter(f => f.trend < -0.1);
    return forecasts;
  }, [forecasts, filter]);

  const getTrendIcon = (trend) => {
    if (trend > 0.1) return <ArrowUp size={12} />;
    if (trend < -0.1) return <ArrowDown size={12} />;
    return <Minus size={12} />;
  };

  const getTrendLabel = (trend) => {
    if (trend > 0.2) return 'Strong Growth';
    if (trend > 0.1) return 'Growing';
    if (trend < -0.2) return 'Declining';
    if (trend < -0.1) return 'Decreasing';
    return 'Stable';
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={32} />
        </LoadingSpinner>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>
          <TrendingUp size={28} />
          Demand Forecasting Dashboard
        </Title>
        <FilterButton onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </FilterButton>
      </DashboardHeader>

      <FilterPanel
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Filter size={16} />
        {['all', 'high_demand', 'increasing', 'decreasing'].map(filterType => (
          <FilterButton
            key={filterType}
            $active={filter === filterType}
            onClick={() => setFilter(filterType)}
          >
            {filterType.replace('_', ' ').toUpperCase()}
          </FilterButton>
        ))}
        <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} />
          <select 
            value={forecastPeriod} 
            onChange={(e) => setForecastPeriod(Number(e.target.value))}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '6px', 
              border: '1px solid #e2e8f0',
              background: 'white'
            }}
          >
            <option value={3}>3 Days</option>
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={30}>30 Days</option>
          </select>
        </div>
      </FilterPanel>

      <StatsGrid>
        <StatCard
          $color="#f59e0b"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatHeader>
            <StatTitle>High Demand Items</StatTitle>
            <StatIcon $color="#f59e0b">
              <AlertTriangle size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.highDemand || 0}</StatValue>
          <StatChange $trend="up">Peak > 150% average</StatChange>
        </StatCard>

        <StatCard
          $color="#10b981"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatHeader>
            <StatTitle>Growing Trends</StatTitle>
            <StatIcon $color="#10b981">
              <ArrowUp size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.increasing || 0}</StatValue>
          <StatChange $trend="up">Positive trend items</StatChange>
        </StatCard>

        <StatCard
          $color="#3b82f6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatHeader>
            <StatTitle>Forecast Accuracy</StatTitle>
            <StatIcon $color="#3b82f6">
              <Target size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{Math.round((stats.avgConfidence || 0) * 100)}%</StatValue>
          <StatChange $trend="up">Average confidence</StatChange>
        </StatCard>

        <StatCard
          $color="#8b5cf6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatHeader>
            <StatTitle>Total Demand</StatTitle>
            <StatIcon $color="#8b5cf6">
              <BarChart3 size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.totalDemand || 0}</StatValue>
          <StatChange $trend="neutral">Next {forecastPeriod} days</StatChange>
        </StatCard>
      </StatsGrid>

      <AlertsPanel
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <AlertsHeader>
          <AlertsTitle>
            <Zap size={20} />
            Forecast Insights ({alerts.length})
          </AlertsTitle>
        </AlertsHeader>
        <AlertsList>
          <AnimatePresence>
            {alerts.slice(0, 8).map((alert, index) => (
              <AlertItem
                key={alert.id}
                $priority={alert.priority}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <AlertIcon $priority={alert.priority}>
                  {alert.priority === 'high' ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <Activity size={16} />
                  )}
                </AlertIcon>
                <AlertContent>
                  <AlertMessage>{alert.message}</AlertMessage>
                  <AlertTime>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </AlertTime>
                </AlertContent>
              </AlertItem>
            ))}
          </AnimatePresence>
        </AlertsList>
      </AlertsPanel>

      <ForecastsGrid>
        <AnimatePresence>
          {filteredForecasts.map((forecast, index) => (
            <ForecastCard
              key={forecast.itemId}
              $trend={forecast.trend}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ForecastHeader>
                <div>
                  <ItemName>{forecast.itemName}</ItemName>
                  <ItemCategory>{forecast.category}</ItemCategory>
                </div>
                <TrendBadge $trend={forecast.trend}>
                  {getTrendIcon(forecast.trend)}
                  {getTrendLabel(forecast.trend)}
                </TrendBadge>
              </ForecastHeader>

              <ForecastMetrics>
                <Metric>
                  <MetricLabel>Peak Demand</MetricLabel>
                  <MetricValue>{forecast.peakDemand}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Total Demand</MetricLabel>
                  <MetricValue>{forecast.totalDemand}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Daily Avg</MetricLabel>
                  <MetricValue>{Math.round(forecast.averageDailyDemand)}</MetricValue>
                </Metric>
              </ForecastMetrics>

              <ForecastChart>
                {forecast.dailyForecast.map((demand, day) => {
                  const maxDemand = Math.max(...forecast.dailyForecast);
                  const height = (demand / maxDemand) * 80;
                  const width = 100 / forecast.dailyForecast.length - 2;
                  const left = (day * 100 / forecast.dailyForecast.length) + 1;
                  
                  return (
                    <React.Fragment key={day}>
                      <ChartBar
                        initial={{ height: 0 }}
                        animate={{ height: `${height}px` }}
                        transition={{ duration: 0.5, delay: day * 0.1 }}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`
                        }}
                      />
                      <ChartDay
                        style={{
                          left: `${left + width/2}%`
                        }}
                      >
                        D{day + 1}
                      </ChartDay>
                    </React.Fragment>
                  );
                })}
              </ForecastChart>

              <MetricLabel>Forecast Confidence</MetricLabel>
              <ConfidenceBar>
                <ConfidenceProgress
                  initial={{ width: 0 }}
                  animate={{ width: `${forecast.confidence * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </ConfidenceBar>

              {forecast.recommendations && forecast.recommendations.length > 0 && (
                <RecommendationsPanel>
                  {forecast.recommendations.slice(0, 3).map((rec, recIndex) => (
                    <RecommendationTag key={recIndex} $priority={rec.priority}>
                      {rec.type === 'inventory' && '📦'}
                      {rec.type === 'growth' && '📈'}
                      {rec.type === 'decline' && '📉'}
                      {rec.type === 'planning' && '🎯'}
                      {rec.message.split('.')[0]}
                    </RecommendationTag>
                  ))}
                </RecommendationsPanel>
              )}
            </ForecastCard>
          ))}
        </AnimatePresence>
      </ForecastsGrid>
    </DashboardContainer>
  );
};

export default DemandForecastingDashboard;