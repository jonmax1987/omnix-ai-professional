import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Target,
  Calculator,
  DollarSign,
  Package,
  Truck,
  Activity,
  RefreshCw,
  Filter,
  Zap,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useWebSocketStore } from '../../store/websocketStore';
import dynamicReorderService from '../../services/dynamicReorderService';

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

const ReorderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ReorderCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;

  ${({ $urgency }) => {
    if ($urgency === 'critical') return `
      border-color: #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    `;
    if ($urgency === 'high') return `
      border-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    `;
    if ($urgency === 'medium') return `
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
  `}
`;

const ReorderHeader = styled.div`
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

const UrgencyBadge = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${({ $urgency }) => {
    if ($urgency === 'critical') return `
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    `;
    if ($urgency === 'high') return `
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fed7aa;
    `;
    if ($urgency === 'medium') return `
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

const ReorderMetrics = styled.div`
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

const ReorderRecommendation = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1rem;
`;

const RecommendationHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const RecommendationTitle = styled.h5`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RecommendationQuantity = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const RecommendationDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const RecommendationDetail = styled.div`
  text-align: center;
`;

const DetailLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RealTimeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
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

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const DynamicReorderDashboard = () => {
  const [reorderCalculations, setReorderCalculations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    reorderCalculations: wsReorderCalculations,
    reorderAlerts: wsReorderAlerts,
    inventoryUpdates,
    demandForecasts,
    depletionPredictions,
    realtimeData
  } = useWebSocketStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  // Real-time reorder calculation updates
  useEffect(() => {
    if (wsReorderCalculations && wsReorderCalculations.length > 0) {
      setReorderCalculations(prev => {
        const updated = [...prev];
        wsReorderCalculations.forEach(newCalculation => {
          const existingIndex = updated.findIndex(r => r.itemId === newCalculation.itemId);
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...newCalculation,
              realTimeUpdate: true,
              lastUpdated: new Date().toISOString(),
              adjustmentTrigger: 'real_time_calculation'
            };
          } else {
            updated.push({
              ...newCalculation,
              realTimeUpdate: true,
              lastUpdated: new Date().toISOString(),
              adjustmentTrigger: 'initial_calculation'
            });
          }
        });
        
        calculateStats(updated);
        return updated;
      });
    }
  }, [wsReorderCalculations]);

  // Real-time reorder alerts
  useEffect(() => {
    if (wsReorderAlerts && wsReorderAlerts.length > 0) {
      setAlerts(prev => {
        const newAlerts = wsReorderAlerts.map(alert => ({
          ...alert,
          realTime: true,
          id: `rt-reorder-alert-${alert.itemId}-${Date.now()}`,
          timestamp: alert.timestamp || new Date().toISOString()
        }));
        
        return [...newAlerts, ...prev].slice(0, 50);
      });
    }
  }, [wsReorderAlerts]);

  // Real-time inventory updates affecting reorder points
  useEffect(() => {
    if (inventoryUpdates && Object.keys(inventoryUpdates).length > 0) {
      setReorderCalculations(prev => {
        const updated = [...prev];
        Object.entries(inventoryUpdates).forEach(([itemId, inventoryData]) => {
          const existingIndex = updated.findIndex(r => r.itemId === itemId);
          if (existingIndex >= 0) {
            const currentCalculation = updated[existingIndex];
            const newStock = inventoryData.currentStock || inventoryData.stockLevel;
            
            // Recalculate urgency based on new stock level
            const stockRatio = newStock / currentCalculation.reorderPoint;
            const newUrgency = stockRatio <= 0.5 ? 'critical' : 
                             stockRatio <= 0.8 ? 'high' : 
                             stockRatio <= 1.0 ? 'medium' : 'low';
            
            updated[existingIndex] = {
              ...currentCalculation,
              currentStock: newStock,
              urgency: newUrgency,
              stockRatio,
              adjustmentTrigger: 'inventory_update',
              inventoryAdjusted: true,
              lastInventoryUpdate: new Date().toISOString()
            };
          }
        });
        
        calculateStats(updated);
        return updated;
      });
    }
  }, [inventoryUpdates]);

  // Real-time demand forecast integration for reorder adjustments
  useEffect(() => {
    if (demandForecasts && demandForecasts.length > 0) {
      setReorderCalculations(prev => {
        const updated = [...prev];
        demandForecasts.forEach(forecast => {
          const existingIndex = updated.findIndex(r => r.itemId === forecast.itemId);
          if (existingIndex >= 0) {
            const currentCalculation = updated[existingIndex];
            
            // Adjust reorder point based on demand forecast
            const demandAdjustment = forecast.peakDemand / forecast.averageDailyDemand;
            const adjustedReorderPoint = currentCalculation.reorderPoint * Math.min(2, demandAdjustment);
            const adjustedOrderQuantity = currentCalculation.optimalOrderQuantity * Math.min(1.5, demandAdjustment);
            
            updated[existingIndex] = {
              ...currentCalculation,
              reorderPoint: adjustedReorderPoint,
              optimalOrderQuantity: adjustedOrderQuantity,
              demandForecast: forecast,
              adjustmentTrigger: 'demand_forecast',
              forecastAdjusted: true,
              lastForecastUpdate: new Date().toISOString(),
              demandAdjustmentFactor: demandAdjustment
            };
          }
        });
        
        calculateStats(updated);
        return updated;
      });
    }
  }, [demandForecasts]);

  // Cross-reference with depletion predictions for reorder timing
  useEffect(() => {
    if (depletionPredictions && depletionPredictions.length > 0) {
      setReorderCalculations(prev => {
        const updated = [...prev];
        depletionPredictions.forEach(prediction => {
          const existingIndex = updated.findIndex(r => r.itemId === prediction.itemId);
          if (existingIndex >= 0) {
            const currentCalculation = updated[existingIndex];
            const depletionDays = prediction.predictedDepletion?.daysToDepletion || prediction.daysToDepletion;
            const leadTime = currentCalculation.leadTime || 7;
            
            // If depletion is faster than lead time, increase urgency
            const timeToReorder = depletionDays - leadTime;
            const newUrgency = timeToReorder <= 1 ? 'critical' :
                             timeToReorder <= 3 ? 'high' :
                             timeToReorder <= 7 ? 'medium' : 'low';
            
            updated[existingIndex] = {
              ...currentCalculation,
              depletionPrediction: prediction,
              urgency: newUrgency,
              timeToReorder,
              adjustmentTrigger: 'depletion_analysis',
              depletionValidated: true,
              lastDepletionUpdate: new Date().toISOString()
            };
          }
        });
        
        calculateStats(updated);
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
        { id: 'item_5', name: 'Greek Yogurt', category: 'Dairy' }
      ];

      const calculationPromises = mockItems.map(async item => {
        const calculation = await dynamicReorderService.calculateDynamicReorderPoint(item.id);
        return {
          ...calculation,
          itemName: item.name,
          category: item.category
        };
      });

      const results = await Promise.all(calculationPromises);
      setReorderCalculations(results);
      
      calculateStats(results);
      generateInitialAlerts(results);
      
    } catch (error) {
      console.error('Failed to load reorder calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (calculations) => {
    const critical = calculations.filter(c => c.urgency === 'critical').length;
    const high = calculations.filter(c => c.urgency === 'high').length;
    const total = calculations.length;
    const totalOrderValue = calculations.reduce((sum, c) => sum + (c.optimalOrderQuantity * c.unitCost), 0);
    const avgAccuracy = calculations.reduce((sum, c) => sum + (c.confidence || 0.85), 0) / total;

    setStats({
      critical,
      high,
      total,
      totalOrderValue,
      avgAccuracy: Math.round(avgAccuracy * 100)
    });
  };

  const generateInitialAlerts = (calculations) => {
    const criticalAlerts = calculations
      .filter(c => c.urgency === 'critical' || c.urgency === 'high')
      .map(c => ({
        id: `alert_${c.itemId}_${Date.now()}`,
        itemName: c.itemName,
        message: `${c.urgency.toUpperCase()}: Reorder ${c.itemName} - ${c.optimalOrderQuantity} units`,
        severity: c.urgency,
        timestamp: new Date().toISOString(),
        reorderQuantity: c.optimalOrderQuantity,
        estimatedCost: c.optimalOrderQuantity * c.unitCost
      }));
    
    setAlerts(criticalAlerts);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredCalculations = useMemo(() => {
    if (filter === 'all') return reorderCalculations;
    if (filter === 'critical') return reorderCalculations.filter(c => c.urgency === 'critical');
    if (filter === 'high') return reorderCalculations.filter(c => c.urgency === 'high');
    if (filter === 'medium') return reorderCalculations.filter(c => c.urgency === 'medium');
    return reorderCalculations;
  }, [reorderCalculations, filter]);

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
          <Calculator size={28} />
          Dynamic Reorder Dashboard
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
        {['all', 'critical', 'high', 'medium'].map(filterType => (
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
            <StatTitle>Critical Reorders</StatTitle>
            <StatIcon $color="#ef4444">
              <AlertTriangle size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.critical || 0}</StatValue>
          <StatChange>Immediate action required</StatChange>
        </StatCard>

        <StatCard
          $color="#f59e0b"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatHeader>
            <StatTitle>High Priority</StatTitle>
            <StatIcon $color="#f59e0b">
              <Clock size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.high || 0}</StatValue>
          <StatChange>Order within 3 days</StatChange>
        </StatCard>

        <StatCard
          $color="#3b82f6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatHeader>
            <StatTitle>Order Value</StatTitle>
            <StatIcon $color="#3b82f6">
              <DollarSign size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>${(stats.totalOrderValue || 0).toLocaleString()}</StatValue>
          <StatChange>Total recommended orders</StatChange>
        </StatCard>

        <StatCard
          $color="#10b981"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatHeader>
            <StatTitle>Accuracy</StatTitle>
            <StatIcon $color="#10b981">
              <Target size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.avgAccuracy || 0}%</StatValue>
          <StatChange>Calculation confidence</StatChange>
        </StatCard>
      </StatsGrid>

      <ReorderGrid>
        <AnimatePresence>
          {filteredCalculations.map((calculation, index) => {
            const isRealTimeUpdate = calculation.realTimeUpdate || calculation.inventoryAdjusted || 
                                   calculation.forecastAdjusted || calculation.depletionValidated;
            
            return (
              <ReorderCard
                key={calculation.itemId}
                $urgency={calculation.urgency}
                $realTimeUpdate={isRealTimeUpdate}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ReorderHeader>
                  <div>
                    <ItemName>{calculation.itemName}</ItemName>
                    <ItemCategory>{calculation.category}</ItemCategory>
                  </div>
                  <UrgencyBadge $urgency={calculation.urgency}>
                    {calculation.urgency}
                  </UrgencyBadge>
                </ReorderHeader>

                <ReorderMetrics>
                  <Metric>
                    <MetricLabel>Current Stock</MetricLabel>
                    <MetricValue>{calculation.currentStock || 0}</MetricValue>
                  </Metric>
                  <Metric>
                    <MetricLabel>Reorder Point</MetricLabel>
                    <MetricValue>{Math.round(calculation.reorderPoint || 0)}</MetricValue>
                  </Metric>
                </ReorderMetrics>

                <ReorderRecommendation>
                  <RecommendationHeader>
                    <RecommendationTitle>Recommended Order</RecommendationTitle>
                    <RecommendationQuantity>
                      {Math.round(calculation.optimalOrderQuantity || 0)}
                    </RecommendationQuantity>
                  </RecommendationHeader>
                  
                  <RecommendationDetails>
                    <RecommendationDetail>
                      <DetailLabel>Total Cost</DetailLabel>
                      <DetailValue>
                        ${((calculation.optimalOrderQuantity || 0) * (calculation.unitCost || 0)).toFixed(2)}
                      </DetailValue>
                    </RecommendationDetail>
                    <RecommendationDetail>
                      <DetailLabel>Lead Time</DetailLabel>
                      <DetailValue>{calculation.leadTime || 0} days</DetailValue>
                    </RecommendationDetail>
                    <RecommendationDetail>
                      <DetailLabel>Safety Stock</DetailLabel>
                      <DetailValue>{Math.round(calculation.safetyStock || 0)}</DetailValue>
                    </RecommendationDetail>
                  </RecommendationDetails>
                </ReorderRecommendation>

                <RealTimeIndicator $isRealTime={isRealTimeUpdate}>
                  <StatusDot $isRealTime={isRealTimeUpdate} />
                  <div>
                    <StatusText $isRealTime={isRealTimeUpdate}>
                      {isRealTimeUpdate ? 'Live Updates' : 'Static Data'}
                    </StatusText>
                    {(calculation.lastUpdated || calculation.lastInventoryUpdate || 
                      calculation.lastForecastUpdate || calculation.lastDepletionUpdate) && (
                      <UpdateTimestamp>
                        Updated: {new Date(
                          calculation.lastUpdated || 
                          calculation.lastInventoryUpdate || 
                          calculation.lastForecastUpdate || 
                          calculation.lastDepletionUpdate
                        ).toLocaleTimeString()}
                      </UpdateTimestamp>
                    )}
                  </div>
                </RealTimeIndicator>

                {/* Additional real-time indicators */}
                {calculation.demandForecast && (
                  <RealTimeIndicator $isRealTime={true}>
                    <StatusDot $isRealTime={true} />
                    <StatusText $isRealTime={true}>
                      Demand Adjusted: {calculation.demandAdjustmentFactor?.toFixed(2)}x
                    </StatusText>
                  </RealTimeIndicator>
                )}

                {calculation.depletionPrediction && (
                  <RealTimeIndicator $isRealTime={true}>
                    <StatusDot $isRealTime={true} />
                    <StatusText $isRealTime={true}>
                      Depletion Sync: {calculation.timeToReorder} days to reorder
                    </StatusText>
                  </RealTimeIndicator>
                )}
              </ReorderCard>
            );
          })}
        </AnimatePresence>
      </ReorderGrid>
    </DashboardContainer>
  );
};

export default DynamicReorderDashboard;