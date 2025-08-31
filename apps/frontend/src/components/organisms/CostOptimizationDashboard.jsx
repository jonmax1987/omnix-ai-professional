import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Calculator,
  TrendingUp,
  Filter,
  RefreshCw,
  Lightbulb,
  Award,
  Activity
} from 'lucide-react';
import { useWebSocketStore } from '../../store/websocketStore';
import costOptimizationService from '../../services/costOptimizationService';

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

const OptimizationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OptimizationCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;

  ${({ $priority }) => {
    if ($priority === 'critical') return `
      border-color: #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    `;
    if ($priority === 'high') return `
      border-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    `;
    if ($priority === 'medium') return `
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

const OptimizationHeader = styled.div`
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
    if ($priority === 'high') return `
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fed7aa;
    `;
    if ($priority === 'medium') return `
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

const SavingsAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OptimizationMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Metric = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const MetricLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RecommendationsList = styled.div`
  margin-bottom: 1rem;
`;

const RecommendationItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border-left: 4px solid ${({ $complexity }) => {
    switch ($complexity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const RecommendationIcon = styled.div`
  padding: 0.5rem;
  border-radius: 6px;
  background: ${({ $complexity }) => {
    switch ($complexity) {
      case 'low': return '#dcfce7';
      case 'medium': return '#fef3c7';
      case 'high': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $complexity }) => {
    switch ($complexity) {
      case 'low': return '#166534';
      case 'medium': return '#92400e';
      case 'high': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const RecommendationContent = styled.div`
  flex: 1;
`;

const RecommendationTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const RecommendationDescription = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RecommendationSavings = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success};
`;

const ImplementationPlan = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const PlanTitle = styled.h5`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PlanPhases = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

const Phase = styled.div`
  text-align: center;
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const PhaseLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
`;

const PhaseCount = styled.div`
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

const CostOptimizationDashboard = () => {
  const [optimizations, setOptimizations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    inventoryUpdates,
    reorderCalculations,
    demandForecasts,
    realtimeData,
    isConnected
  } = useWebSocketStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  // Real-time inventory updates affecting cost optimizations
  useEffect(() => {
    if (inventoryUpdates && Object.keys(inventoryUpdates).length > 0) {
      setOptimizations(prev => {
        const updated = [...prev];
        Object.entries(inventoryUpdates).forEach(([itemId, inventoryData]) => {
          const existingIndex = updated.findIndex(opt => opt.itemId === itemId);
          if (existingIndex >= 0) {
            const currentOpt = updated[existingIndex];
            const newStock = inventoryData.currentStock || inventoryData.stockLevel;
            
            // Recalculate potential savings based on new stock levels
            const stockAdjustmentFactor = newStock / (currentOpt.currentCosts?.holdingCost || 100);
            const adjustedSavings = currentOpt.totalPotentialSavings * Math.max(0.5, stockAdjustmentFactor);
            
            updated[existingIndex] = {
              ...currentOpt,
              totalPotentialSavings: adjustedSavings,
              inventoryAdjusted: true,
              lastInventoryUpdate: new Date().toISOString(),
              realTimeUpdate: true
            };
          }
        });
        
        calculateStats(updated);
        return updated;
      });
    }
  }, [inventoryUpdates]);

  // Real-time reorder calculations affecting optimization priorities
  useEffect(() => {
    if (reorderCalculations && reorderCalculations.length > 0) {
      setOptimizations(prev => {
        const updated = [...prev];
        reorderCalculations.forEach(calc => {
          const existingIndex = updated.findIndex(opt => opt.itemId === calc.itemId);
          if (existingIndex >= 0) {
            const currentOpt = updated[existingIndex];
            
            // Adjust priority based on reorder urgency
            let newPriority = currentOpt.priority;
            if (calc.urgency === 'critical') {
              newPriority = 'critical';
            } else if (calc.urgency === 'high' && currentOpt.priority !== 'critical') {
              newPriority = 'high';
            }
            
            updated[existingIndex] = {
              ...currentOpt,
              priority: newPriority,
              reorderCalculation: calc,
              reorderAdjusted: true,
              lastReorderUpdate: new Date().toISOString(),
              realTimeUpdate: true
            };
          }
        });
        
        // Resort by priority and savings
        updated.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return b.totalPotentialSavings - a.totalPotentialSavings;
        });
        
        calculateStats(updated);
        return updated;
      });
    }
  }, [reorderCalculations]);

  // Real-time demand forecasts affecting cost optimization models
  useEffect(() => {
    if (demandForecasts && demandForecasts.length > 0) {
      setOptimizations(prev => {
        const updated = [...prev];
        demandForecasts.forEach(forecast => {
          const existingIndex = updated.findIndex(opt => opt.itemId === forecast.itemId);
          if (existingIndex >= 0) {
            const currentOpt = updated[existingIndex];
            
            // Adjust savings based on demand forecast changes
            const demandAdjustmentFactor = forecast.peakDemand / forecast.averageDailyDemand;
            const adjustedSavings = currentOpt.totalPotentialSavings * Math.min(1.5, demandAdjustmentFactor);
            
            updated[existingIndex] = {
              ...currentOpt,
              totalPotentialSavings: adjustedSavings,
              demandForecast: forecast,
              forecastAdjusted: true,
              lastForecastUpdate: new Date().toISOString(),
              realTimeUpdate: true
            };
          }
        });
        
        calculateStats(updated);
        return updated;
      });
    }
  }, [demandForecasts]);

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

      const itemIds = mockItems.map(item => item.id);
      const optimizationResults = await costOptimizationService.generateLiveCostOptimizations(
        itemIds, 
        { items: mockItems }
      );

      const processedOptimizations = optimizationResults.optimizations.map(opt => ({
        ...opt,
        itemName: mockItems.find(item => item.id === opt.itemId)?.name || opt.itemName,
        category: mockItems.find(item => item.id === opt.itemId)?.category || opt.category
      }));

      setOptimizations(processedOptimizations);
      calculateStats(processedOptimizations);
      
    } catch (error) {
      console.error('Failed to load cost optimizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (optimizationData) => {
    const critical = optimizationData.filter(opt => opt.priority === 'critical').length;
    const high = optimizationData.filter(opt => opt.priority === 'high').length;
    const totalSavings = optimizationData.reduce((sum, opt) => sum + opt.totalPotentialSavings, 0);
    const avgConfidence = optimizationData.reduce((sum, opt) => sum + (opt.confidence * 100), 0) / optimizationData.length;
    const quickWins = optimizationData.reduce((sum, opt) => sum + (opt.implementationPlan?.quickWins || 0), 0);

    setStats({
      critical,
      high,
      totalSavings,
      avgConfidence: Math.round(avgConfidence),
      quickWins,
      totalOptimizations: optimizationData.length
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredOptimizations = useMemo(() => {
    if (filter === 'all') return optimizations;
    if (filter === 'critical') return optimizations.filter(opt => opt.priority === 'critical');
    if (filter === 'high') return optimizations.filter(opt => opt.priority === 'high');
    if (filter === 'medium') return optimizations.filter(opt => opt.priority === 'medium');
    if (filter === 'quick-wins') return optimizations.filter(opt => opt.complexity === 'low');
    return optimizations;
  }, [optimizations, filter]);

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
          Cost Optimization Dashboard
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
        {['all', 'critical', 'high', 'medium', 'quick-wins'].map(filterType => (
          <FilterButton
            key={filterType}
            $active={filter === filterType}
            onClick={() => setFilter(filterType)}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('-', ' ')}
          </FilterButton>
        ))}
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusDot $isRealTime={isConnected} />
          <span style={{ fontSize: '0.875rem', color: isConnected ? '#10b981' : '#6b7280' }}>
            {isConnected ? 'Live Updates' : 'Disconnected'}
          </span>
        </div>
      </FilterPanel>

      <StatsGrid>
        <StatCard
          $color="#ef4444"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatHeader>
            <StatTitle>Critical Priority</StatTitle>
            <StatIcon $color="#ef4444">
              <AlertTriangle size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.critical || 0}</StatValue>
          <StatChange>Requires immediate attention</StatChange>
        </StatCard>

        <StatCard
          $color="#10b981"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatHeader>
            <StatTitle>Total Savings</StatTitle>
            <StatIcon $color="#10b981">
              <DollarSign size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>${(stats.totalSavings || 0).toLocaleString()}</StatValue>
          <StatChange $trend="up">
            <TrendingUp size={16} />
            Potential annual savings
          </StatChange>
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
          <StatChange>Recommendation accuracy</StatChange>
        </StatCard>

        <StatCard
          $color="#f59e0b"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatHeader>
            <StatTitle>Quick Wins</StatTitle>
            <StatIcon $color="#f59e0b">
              <Zap size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.quickWins || 0}</StatValue>
          <StatChange>Low-effort opportunities</StatChange>
        </StatCard>
      </StatsGrid>

      <OptimizationGrid>
        <AnimatePresence>
          {filteredOptimizations.map((optimization, index) => {
            const isRealTimeUpdate = optimization.realTimeUpdate || optimization.inventoryAdjusted || 
                                   optimization.forecastAdjusted || optimization.reorderAdjusted;
            
            return (
              <OptimizationCard
                key={optimization.itemId}
                $priority={optimization.priority}
                $realTimeUpdate={isRealTimeUpdate}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <OptimizationHeader>
                  <div>
                    <ItemName>{optimization.itemName}</ItemName>
                    <ItemCategory>{optimization.category}</ItemCategory>
                  </div>
                  <PriorityBadge $priority={optimization.priority}>
                    {optimization.priority}
                  </PriorityBadge>
                </OptimizationHeader>

                <SavingsAmount>
                  <DollarSign size={24} />
                  {optimization.totalPotentialSavings.toLocaleString()} / year
                </SavingsAmount>

                <OptimizationMetrics>
                  <Metric>
                    <MetricLabel>Confidence</MetricLabel>
                    <MetricValue>{Math.round(optimization.confidence * 100)}%</MetricValue>
                  </Metric>
                  <Metric>
                    <MetricLabel>Complexity</MetricLabel>
                    <MetricValue>{optimization.complexity}</MetricValue>
                  </Metric>
                  <Metric>
                    <MetricLabel>Payback</MetricLabel>
                    <MetricValue>{Math.round(optimization.paybackPeriod || 0)}d</MetricValue>
                  </Metric>
                </OptimizationMetrics>

                <RecommendationsList>
                  {optimization.recommendations?.slice(0, 3).map((rec, recIndex) => (
                    <RecommendationItem
                      key={recIndex}
                      $complexity={rec.complexity}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: recIndex * 0.1 }}
                    >
                      <RecommendationIcon $complexity={rec.complexity}>
                        <Lightbulb size={14} />
                      </RecommendationIcon>
                      <RecommendationContent>
                        <RecommendationTitle>{rec.action}</RecommendationTitle>
                        <RecommendationDescription>{rec.description}</RecommendationDescription>
                      </RecommendationContent>
                      <RecommendationSavings>
                        ${rec.savings?.toLocaleString() || '0'}
                      </RecommendationSavings>
                    </RecommendationItem>
                  ))}
                </RecommendationsList>

                {optimization.implementationPlan && (
                  <ImplementationPlan>
                    <PlanHeader>
                      <PlanTitle>Implementation Phases</PlanTitle>
                      <Award size={16} style={{ color: '#f59e0b' }} />
                    </PlanHeader>
                    <PlanPhases>
                      <Phase>
                        <PhaseLabel>Immediate</PhaseLabel>
                        <PhaseCount>{optimization.implementationPlan.phases?.immediate?.length || 0}</PhaseCount>
                      </Phase>
                      <Phase>
                        <PhaseLabel>Short Term</PhaseLabel>
                        <PhaseCount>{optimization.implementationPlan.phases?.short_term?.length || 0}</PhaseCount>
                      </Phase>
                      <Phase>
                        <PhaseLabel>Medium Term</PhaseLabel>
                        <PhaseCount>{optimization.implementationPlan.phases?.medium_term?.length || 0}</PhaseCount>
                      </Phase>
                    </PlanPhases>
                  </ImplementationPlan>
                )}

                <RealTimeIndicator $isRealTime={isRealTimeUpdate}>
                  <StatusDot $isRealTime={isRealTimeUpdate} />
                  <div>
                    <StatusText $isRealTime={isRealTimeUpdate}>
                      {isRealTimeUpdate ? 'Live Data Active' : 'Static Analysis'}
                    </StatusText>
                    {(optimization.lastInventoryUpdate || optimization.lastReorderUpdate || 
                      optimization.lastForecastUpdate) && (
                      <UpdateTimestamp>
                        Updated: {new Date(
                          optimization.lastInventoryUpdate || 
                          optimization.lastReorderUpdate || 
                          optimization.lastForecastUpdate
                        ).toLocaleTimeString()}
                      </UpdateTimestamp>
                    )}
                  </div>
                </RealTimeIndicator>
              </OptimizationCard>
            );
          })}
        </AnimatePresence>
      </OptimizationGrid>
    </DashboardContainer>
  );
};

export default CostOptimizationDashboard;