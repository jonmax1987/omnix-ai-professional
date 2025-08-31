import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  Filter,
  RefreshCw,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { useWebSocketStore } from '../../store/websocketStore';
import depletionPredictionService from '../../services/depletionPredictionService';

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
    color: ${({ theme }) => theme.colors.secondary};
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

const PredictionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const PredictionCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;

  ${({ $priority }) => {
    if ($priority === 'critical') return `
      border-color: #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
    `;
    if ($priority === 'warning') return `
      border-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
    `;
    if ($priority === 'info') return `
      border-color: #3b82f6;
      background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
    `;
    return '';
  }}

  ${({ $realTimeUpdate }) => $realTimeUpdate && `
    &::after {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }

    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  `}
`;

const PredictionHeader = styled.div`
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

const PriorityBadge = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${({ $priority }) => {
    if ($priority === 'critical') return `
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    `;
    if ($priority === 'warning') return `
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fed7aa;
    `;
    if ($priority === 'info') return `
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    `;
    return `
      background: #f0f9ff;
      color: #0369a1;
      border: 1px solid #bae6fd;
    `;
  }}
`;

const PredictionMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Metric = styled.div`
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ConfidenceProgress = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%);
  border-radius: 4px;
`;

const ModelsBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ModelChip = styled.div`
  padding: 0.25rem 0.5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 6px;
  font-size: 0.7rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const RealTimeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 6px;
  border: 1px solid ${({ $isRealTime, theme }) => 
    $isRealTime ? '#10b981' : theme.colors.border};
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $isRealTime }) => $isRealTime ? '#10b981' : '#6b7280'};
  animation: ${({ $isRealTime }) => $isRealTime ? 'pulse 2s infinite' : 'none'};
`;

const StatusText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme, $isRealTime }) => 
    $isRealTime ? '#10b981' : theme.colors.text.secondary};
  font-weight: ${({ $isRealTime }) => $isRealTime ? '600' : '400'};
`;

const UpdateTimestamp = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.25rem;
  font-style: italic;
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
  border-left: 4px solid ${({ $severity }) => {
    switch ($severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
`;

const AlertIcon = styled.div`
  color: ${({ $severity }) => {
    switch ($severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
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

const DepletionPredictionDashboard = () => {
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    depletionPredictions, 
    depletionAlerts,
    demandForecasts,
    demandAlerts,
    reorderCalculations,
    reorderAlerts,
    inventoryUpdates,
    realtimeData
  } = useWebSocketStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  // Real-time depletion prediction updates
  useEffect(() => {
    if (depletionPredictions && depletionPredictions.length > 0) {
      setPredictions(prev => {
        const updated = [...prev];
        depletionPredictions.forEach(newPrediction => {
          const existingIndex = updated.findIndex(p => p.itemId === newPrediction.itemId);
          if (existingIndex >= 0) {
            // Merge with existing prediction, preserving UI state
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...newPrediction,
              realTimeUpdate: true,
              lastUpdated: new Date().toISOString()
            };
          } else {
            updated.push({
              ...newPrediction,
              realTimeUpdate: true,
              lastUpdated: new Date().toISOString()
            });
          }
        });
        
        // Recalculate stats with updated predictions
        calculateStats(updated);
        return updated;
      });
    }
  }, [depletionPredictions]);

  // Real-time alert handling
  useEffect(() => {
    if (depletionAlerts && depletionAlerts.length > 0) {
      setAlerts(prev => {
        const newAlerts = depletionAlerts.map(alert => ({
          ...alert,
          realTime: true,
          id: `rt-alert-${alert.itemId}-${Date.now()}`,
          timestamp: alert.timestamp || new Date().toISOString()
        }));
        
        return [...newAlerts, ...prev].slice(0, 50);
      });
    }
  }, [depletionAlerts]);

  // Real-time demand forecast integration
  useEffect(() => {
    if (demandForecasts && demandForecasts.length > 0) {
      // Update predictions with demand forecast data
      setPredictions(prev => {
        const updated = [...prev];
        demandForecasts.forEach(forecast => {
          const existingIndex = updated.findIndex(p => p.itemId === forecast.itemId);
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              demandForecast: forecast,
              forecastAdjusted: true,
              lastDemandUpdate: new Date().toISOString()
            };
          }
        });
        return updated;
      });
    }
  }, [demandForecasts]);

  // Real-time demand alerts
  useEffect(() => {
    if (demandAlerts && demandAlerts.length > 0) {
      setAlerts(prev => {
        const demandBasedAlerts = demandAlerts.map(alert => ({
          ...alert,
          type: 'demand_forecast',
          severity: alert.urgency || 'warning',
          message: alert.message || `Demand forecast alert for ${alert.itemName}`,
          realTime: true,
          id: `demand-alert-${alert.itemId}-${Date.now()}`,
          timestamp: alert.timestamp || new Date().toISOString()
        }));
        
        return [...demandBasedAlerts, ...prev].slice(0, 50);
      });
    }
  }, [demandAlerts]);

  // Real-time reorder calculations integration
  useEffect(() => {
    if (reorderCalculations && reorderCalculations.length > 0) {
      // Update predictions with reorder point calculations
      setPredictions(prev => {
        const updated = [...prev];
        reorderCalculations.forEach(calc => {
          const existingIndex = updated.findIndex(p => p.itemId === calc.itemId);
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              reorderCalculation: calc,
              reorderAdjusted: true,
              lastReorderUpdate: new Date().toISOString()
            };
          }
        });
        return updated;
      });
    }
  }, [reorderCalculations]);

  // Real-time reorder alerts
  useEffect(() => {
    if (reorderAlerts && reorderAlerts.length > 0) {
      setAlerts(prev => {
        const reorderBasedAlerts = reorderAlerts.map(alert => ({
          ...alert,
          type: 'reorder_point',
          severity: alert.urgency || 'high',
          message: alert.message || `Reorder point triggered for ${alert.itemName}`,
          realTime: true,
          id: `reorder-alert-${alert.itemId}-${Date.now()}`,
          timestamp: alert.timestamp || new Date().toISOString()
        }));
        
        return [...reorderBasedAlerts, ...prev].slice(0, 50);
      });
    }
  }, [reorderAlerts]);

  // Real-time inventory updates affecting depletion
  useEffect(() => {
    if (inventoryUpdates && Object.keys(inventoryUpdates).length > 0) {
      // Update predictions when inventory changes
      setPredictions(prev => {
        const updated = [...prev];
        Object.entries(inventoryUpdates).forEach(([itemId, inventoryData]) => {
          const existingIndex = updated.findIndex(p => p.itemId === itemId);
          if (existingIndex >= 0) {
            // Recalculate depletion based on new stock level
            const currentPrediction = updated[existingIndex];
            const newStock = inventoryData.currentStock || inventoryData.stockLevel;
            
            if (newStock !== undefined && newStock !== currentPrediction.currentStock) {
              // Trigger instant recalculation
              const adjustedDays = currentPrediction.predictedDepletion.daysToDepletion * 
                                 (newStock / currentPrediction.currentStock);
              
              updated[existingIndex] = {
                ...currentPrediction,
                currentStock: newStock,
                predictedDepletion: {
                  ...currentPrediction.predictedDepletion,
                  daysToDepletion: adjustedDays,
                  urgency: getPriorityLevel(adjustedDays) === 'critical' ? 'critical' : 
                          getPriorityLevel(adjustedDays) === 'warning' ? 'urgent' : 'normal'
                },
                inventoryAdjusted: true,
                lastInventoryUpdate: new Date().toISOString()
              };
            }
          }
        });
        
        // Recalculate stats after inventory updates
        calculateStats(updated);
        return updated;
      });
    }
  }, [inventoryUpdates]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const mockItems = [
        { id: 'item_1', name: 'Premium Coffee Beans', category: 'Beverages', currentStock: 15 },
        { id: 'item_2', name: 'Organic Milk', category: 'Dairy', currentStock: 8 },
        { id: 'item_3', name: 'Artisan Bread', category: 'Bakery', currentStock: 25 },
        { id: 'item_4', name: 'Fresh Eggs', category: 'Dairy', currentStock: 12 },
        { id: 'item_5', name: 'Greek Yogurt', category: 'Dairy', currentStock: 6 }
      ];

      const predictionPromises = mockItems.map(async item => {
        const prediction = await depletionPredictionService.predictItemDepletion(
          item.id, 
          item.currentStock,
          { 
            category: item.category,
            seasonality: 'normal',
            promotions: [],
            weatherImpact: 'neutral'
          }
        );
        return {
          ...prediction,
          itemName: item.name,
          category: item.category,
          currentStock: item.currentStock
        };
      });

      const results = await Promise.all(predictionPromises);
      setPredictions(results);
      
      calculateStats(results);
      generateInitialAlerts(results);
      
    } catch (error) {
      console.error('Failed to load depletion predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (predictions) => {
    const critical = predictions.filter(p => p.daysToDepletion <= 2).length;
    const warning = predictions.filter(p => p.daysToDepletion <= 7 && p.daysToDepletion > 2).length;
    const total = predictions.length;
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / total;
    const avgDaysToDepletion = predictions.reduce((sum, p) => sum + p.daysToDepletion, 0) / total;

    setStats({
      critical,
      warning,
      total,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      avgDaysToDepletion: Math.round(avgDaysToDepletion * 100) / 100
    });
  };

  const generateInitialAlerts = (predictions) => {
    const newAlerts = predictions
      .filter(p => p.daysToDepletion <= 7)
      .map(p => ({
        id: `alert_${p.itemId}_${Date.now()}`,
        itemName: p.itemName,
        message: p.daysToDepletion <= 2 
          ? `Critical: ${p.itemName} will run out in ${p.daysToDepletion.toFixed(1)} days`
          : `Warning: ${p.itemName} will run out in ${p.daysToDepletion.toFixed(1)} days`,
        severity: p.daysToDepletion <= 2 ? 'critical' : 'warning',
        timestamp: new Date().toISOString()
      }));
    
    setAlerts(newAlerts);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredPredictions = useMemo(() => {
    if (filter === 'all') return predictions;
    if (filter === 'critical') return predictions.filter(p => p.daysToDepletion <= 2);
    if (filter === 'warning') return predictions.filter(p => p.daysToDepletion <= 7 && p.daysToDepletion > 2);
    if (filter === 'normal') return predictions.filter(p => p.daysToDepletion > 7);
    return predictions;
  }, [predictions, filter]);

  const getPriorityLevel = (daysToDepletion) => {
    if (daysToDepletion <= 2) return 'critical';
    if (daysToDepletion <= 7) return 'warning';
    return 'info';
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
          <TrendingDown size={28} />
          Depletion Prediction Dashboard
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
        {['all', 'critical', 'warning', 'normal'].map(filterType => (
          <FilterButton
            key={filterType}
            $active={filter === filterType}
            onClick={() => setFilter(filterType)}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </FilterButton>
        ))}
      </FilterPanel>

      <StatsGrid>
        <StatCard
          $color="#ef4444"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatHeader>
            <StatTitle>Critical Items</StatTitle>
            <StatIcon $color="#ef4444">
              <AlertTriangle size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.critical || 0}</StatValue>
          <StatChange $trend="down">≤ 2 days to depletion</StatChange>
        </StatCard>

        <StatCard
          $color="#f59e0b"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatHeader>
            <StatTitle>Warning Items</StatTitle>
            <StatIcon $color="#f59e0b">
              <Clock size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.warning || 0}</StatValue>
          <StatChange $trend="neutral">3-7 days to depletion</StatChange>
        </StatCard>

        <StatCard
          $color="#3b82f6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatHeader>
            <StatTitle>Avg Confidence</StatTitle>
            <StatIcon $color="#3b82f6">
              <Target size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.avgConfidence || 0}%</StatValue>
          <StatChange $trend="up">Prediction accuracy</StatChange>
        </StatCard>

        <StatCard
          $color="#10b981"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatHeader>
            <StatTitle>Avg Days Left</StatTitle>
            <StatIcon $color="#10b981">
              <BarChart3 size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.avgDaysToDepletion || 0}</StatValue>
          <StatChange $trend="neutral">Across all items</StatChange>
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
            Recent Alerts ({alerts.length})
          </AlertsTitle>
        </AlertsHeader>
        <AlertsList>
          <AnimatePresence>
            {alerts.slice(0, 10).map((alert, index) => (
              <AlertItem
                key={alert.id}
                $severity={alert.severity}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <AlertIcon $severity={alert.severity}>
                  {alert.severity === 'critical' ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <Clock size={16} />
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

      <PredictionsGrid>
        <AnimatePresence>
          {filteredPredictions.map((prediction, index) => {
            const isRealTimeUpdate = prediction.realTimeUpdate || prediction.inventoryAdjusted || 
                                   prediction.forecastAdjusted || prediction.reorderAdjusted;
            const priorityLevel = getPriorityLevel(prediction.predictedDepletion?.daysToDepletion || prediction.daysToDepletion);
            const daysLeft = prediction.predictedDepletion?.daysToDepletion || prediction.daysToDepletion;
            const confidence = prediction.predictedDepletion?.confidence || prediction.confidence;
            
            return (
              <PredictionCard
                key={prediction.itemId}
                $priority={priorityLevel}
                $realTimeUpdate={isRealTimeUpdate}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <PredictionHeader>
                  <div>
                    <ItemName>{prediction.itemName}</ItemName>
                    <ItemCategory>{prediction.category}</ItemCategory>
                  </div>
                  <PriorityBadge $priority={priorityLevel}>
                    {priorityLevel}
                  </PriorityBadge>
                </PredictionHeader>

                <PredictionMetrics>
                  <Metric>
                    <MetricLabel>Days Left</MetricLabel>
                    <MetricValue>{daysLeft ? daysLeft.toFixed(1) : 'N/A'}</MetricValue>
                  </Metric>
                  <Metric>
                    <MetricLabel>Current Stock</MetricLabel>
                    <MetricValue>{prediction.currentStock}</MetricValue>
                  </Metric>
                </PredictionMetrics>

                <MetricLabel>Confidence Level</MetricLabel>
                <ConfidenceBar>
                  <ConfidenceProgress
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence ? confidence : 0}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </ConfidenceBar>

                <ModelsBreakdown>
                  {prediction.modelContributions && Object.entries(prediction.modelContributions).map(([model, weight]) => (
                    <ModelChip key={model}>
                      {model}: {(weight * 100).toFixed(0)}%
                    </ModelChip>
                  ))}
                </ModelsBreakdown>

                <RealTimeIndicator $isRealTime={isRealTimeUpdate}>
                  <StatusDot $isRealTime={isRealTimeUpdate} />
                  <div>
                    <StatusText $isRealTime={isRealTimeUpdate}>
                      {isRealTimeUpdate ? 'Live Data' : 'Static Data'}
                    </StatusText>
                    {(prediction.lastUpdated || prediction.lastInventoryUpdate || 
                      prediction.lastDemandUpdate || prediction.lastReorderUpdate) && (
                      <UpdateTimestamp>
                        Updated: {new Date(
                          prediction.lastUpdated || 
                          prediction.lastInventoryUpdate || 
                          prediction.lastDemandUpdate || 
                          prediction.lastReorderUpdate
                        ).toLocaleTimeString()}
                      </UpdateTimestamp>
                    )}
                  </div>
                </RealTimeIndicator>

                {/* Additional indicators for different data sources */}
                {prediction.demandForecast && (
                  <RealTimeIndicator $isRealTime={true}>
                    <StatusDot $isRealTime={true} />
                    <StatusText $isRealTime={true}>
                      Demand Forecast: {prediction.demandForecast.peakDemand?.toFixed(1)} peak
                    </StatusText>
                  </RealTimeIndicator>
                )}

                {prediction.reorderCalculation && (
                  <RealTimeIndicator $isRealTime={true}>
                    <StatusDot $isRealTime={true} />
                    <StatusText $isRealTime={true}>
                      Reorder Point: {prediction.reorderCalculation.optimalOrderQuantity} units
                    </StatusText>
                  </RealTimeIndicator>
                )}
              </PredictionCard>
            );
          })}
        </AnimatePresence>
      </PredictionsGrid>
    </DashboardContainer>
  );
};

export default DepletionPredictionDashboard;