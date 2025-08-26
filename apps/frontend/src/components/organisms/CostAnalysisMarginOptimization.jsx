import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import inventoryService from '../../services/inventoryService';
import { useI18n } from '../../hooks/useI18n';

const AnalysisContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const AnalysisTypeTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.secondary};
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
  overflow-x: auto;
`;

const AnalysisTab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border: none;
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.background.elevated};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const MainPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const CostBreakdownPanel = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
`;

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const CostCategory = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['category', 'trend'].includes(prop)
})`
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border-left: 4px solid ${props => getCategoryColor(props.category, props.theme)};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const CategoryTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const CategoryIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'category'
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => getCategoryGradient(props.category, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const CostAmount = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'trend'
})`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getTrendColor(props.trend, props.theme)};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const CostPercentage = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const MarginMetrics = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'trend'
})`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => getTrendColor(props.trend, props.theme)};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const OptimizationPanel = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  height: fit-content;
`;

const OptimizationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const OptimizationItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['impact', 'priority'].includes(prop)
})`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border-left: 4px solid ${props => getImpactColor(props.impact, props.theme)};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    transform: translateX(4px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const OptimizationIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'impact'
})`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => getImpactGradient(props.impact, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const OptimizationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const OptimizationTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const OptimizationDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const OptimizationMetrics = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  align-items: center;
`;

const ProfitabilityPanel = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
`;

const ProfitabilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const ProfitabilityCard = styled.div`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  text-align: center;
`;

const ProfitValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'trend'
})`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getTrendColor(prop => prop.trend, props.theme)};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const ProfitLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const AIOptimizationBadge = styled(Badge)`
  background: linear-gradient(135deg, ${props => props.theme.colors.green[500]}, ${props => props.theme.colors.green[600]});
  color: white;
  border: none;
  
  &::before {
    content: '💰';
    margin-right: ${props => props.theme.spacing[1]};
  }
`;

// Utility functions
const getCategoryColor = (category, theme = {}) => {
  const colors = {
    procurement: theme.colors?.blue?.[500] || '#3B82F6',
    operations: theme.colors?.green?.[500] || '#10B981',
    overhead: theme.colors?.orange?.[500] || '#F97316',
    shipping: theme.colors?.purple?.[500] || '#8B5CF6',
    storage: theme.colors?.yellow?.[500] || '#F59E0B'
  };
  return colors[category] || theme.colors?.gray?.[400] || '#6B7280';
};

const getCategoryGradient = (category, theme = {}) => {
  const gradients = {
    procurement: `linear-gradient(135deg, ${theme.colors?.blue?.[500] || '#3B82F6'}, ${theme.colors?.blue?.[600] || '#2563EB'})`,
    operations: `linear-gradient(135deg, ${theme.colors?.green?.[500] || '#10B981'}, ${theme.colors?.green?.[600] || '#059669'})`,
    overhead: `linear-gradient(135deg, ${theme.colors?.orange?.[500] || '#F97316'}, ${theme.colors?.orange?.[600] || '#EA580C'})`,
    shipping: `linear-gradient(135deg, ${theme.colors?.purple?.[500] || '#8B5CF6'}, ${theme.colors?.purple?.[600] || '#7C3AED'})`,
    storage: `linear-gradient(135deg, ${theme.colors?.yellow?.[500] || '#F59E0B'}, ${theme.colors?.yellow?.[600] || '#D97706'})`
  };
  return gradients[category] || gradients.procurement;
};

const getCategoryIcon = (category) => {
  const icons = {
    procurement: 'shopping-cart',
    operations: 'settings',
    overhead: 'home',
    shipping: 'truck',
    storage: 'package'
  };
  return icons[category] || 'dollar-sign';
};

const getImpactColor = (impact, theme = {}) => {
  const colors = {
    high: theme.colors?.green?.[500] || '#10B981',
    medium: theme.colors?.yellow?.[500] || '#F59E0B',
    low: theme.colors?.blue?.[500] || '#3B82F6'
  };
  return colors[impact] || colors.medium;
};

const getImpactGradient = (impact, theme = {}) => {
  const gradients = {
    high: `linear-gradient(135deg, ${theme.colors?.green?.[500] || '#10B981'}, ${theme.colors?.green?.[600] || '#059669'})`,
    medium: `linear-gradient(135deg, ${theme.colors?.yellow?.[500] || '#F59E0B'}, ${theme.colors?.yellow?.[600] || '#D97706'})`,
    low: `linear-gradient(135deg, ${theme.colors?.blue?.[500] || '#3B82F6'}, ${theme.colors?.blue?.[600] || '#2563EB'})`
  };
  return gradients[impact] || gradients.medium;
};

const getImpactIcon = (impact) => {
  const icons = {
    high: 'trending-up',
    medium: 'bar-chart',
    low: 'target'
  };
  return icons[impact] || 'dollar-sign';
};

const getTrendColor = (trend, theme = {}) => {
  if (trend > 0) return theme.colors?.green?.[600] || '#16A34A';
  if (trend < 0) return theme.colors?.red?.[600] || '#DC2626';
  return theme.colors?.text?.primary || '#374151';
};

const CostAnalysisMarginOptimization = ({
  onOptimizationApply,
  onCostAnalyze,
  onExportReport,
  autoRefresh = true,
  refreshInterval = 15 * 60 * 1000, // 15 minutes
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [costData, setCostData] = useState(null);
  const [optimizations, setOptimizations] = useState([]);
  const [profitabilityData, setProfitabilityData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Analysis type options
  const analysisTypes = [
    { key: 'overview', label: 'Cost Overview', icon: 'pie-chart' },
    { key: 'categories', label: 'Category Analysis', icon: 'bar-chart' },
    { key: 'trends', label: 'Cost Trends', icon: 'trending-up' },
    { key: 'optimization', label: 'Optimization', icon: 'target' },
    { key: 'profitability', label: 'Profitability', icon: 'dollar-sign' }
  ];

  // Fetch cost analysis data
  const fetchCostData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock cost analysis data
      const mockData = {
        costBreakdown: [
          {
            id: 'procurement',
            category: 'procurement',
            name: 'Procurement Costs',
            amount: 285600,
            percentage: 42.5,
            trend: -2.3,
            margin: 28.5,
            details: {
              supplier_costs: 245000,
              bulk_discounts: -15400,
              quality_premiums: 12000,
              rush_orders: 4000
            }
          },
          {
            id: 'operations',
            category: 'operations',
            name: 'Operations',
            amount: 156800,
            percentage: 23.3,
            trend: 1.8,
            margin: 35.2,
            details: {
              labor_costs: 98000,
              equipment_maintenance: 34000,
              utilities: 16800,
              process_optimization: 8000
            }
          },
          {
            id: 'overhead',
            category: 'overhead',
            name: 'Overhead',
            amount: 98400,
            percentage: 14.6,
            trend: -0.5,
            margin: 18.7,
            details: {
              facility_rent: 45000,
              insurance: 18000,
              administrative: 22000,
              technology: 13400
            }
          },
          {
            id: 'shipping',
            category: 'shipping',
            name: 'Shipping & Logistics',
            amount: 78200,
            percentage: 11.6,
            trend: 3.2,
            margin: 22.1,
            details: {
              transport_costs: 45000,
              packaging: 15200,
              expedited_shipping: 12000,
              returns_processing: 6000
            }
          },
          {
            id: 'storage',
            category: 'storage',
            name: 'Storage & Handling',
            amount: 54000,
            percentage: 8.0,
            trend: -1.2,
            margin: 31.8,
            details: {
              warehouse_costs: 32000,
              handling_equipment: 12000,
              climate_control: 7000,
              security: 3000
            }
          }
        ],
        optimizations: [
          {
            id: 'bulk-discount',
            title: 'Negotiate Better Bulk Discounts',
            description: 'Consolidate orders with top 3 suppliers to achieve tier-3 pricing discounts of 8-12%',
            impact: 'high',
            priority: 'high',
            estimatedSavings: 34500,
            implementation: 'Medium complexity',
            timeframe: '2-3 months',
            confidence: 92,
            category: 'procurement',
            actions: [
              'Analyze current order patterns',
              'Negotiate volume commitments',
              'Implement consolidated ordering'
            ]
          },
          {
            id: 'shipping-optimization',
            title: 'Optimize Shipping Routes',
            description: 'Implement zone skipping and route optimization to reduce shipping costs by 15-20%',
            impact: 'high',
            priority: 'medium',
            estimatedSavings: 15600,
            implementation: 'Low complexity',
            timeframe: '1 month',
            confidence: 88,
            category: 'shipping',
            actions: [
              'Deploy route optimization software',
              'Consolidate shipments by region',
              'Partner with zone-skipping carriers'
            ]
          },
          {
            id: 'inventory-reduction',
            title: 'Reduce Dead Stock Carrying Costs',
            description: 'Identify and liquidate slow-moving inventory to reduce storage costs and free up capital',
            impact: 'medium',
            priority: 'high',
            estimatedSavings: 27300,
            implementation: 'Low complexity',
            timeframe: '2 weeks',
            confidence: 95,
            category: 'storage',
            actions: [
              'Identify slow-moving SKUs',
              'Create clearance pricing strategy',
              'Liquidate through discount channels'
            ]
          },
          {
            id: 'supplier-consolidation',
            title: 'Consolidate Supplier Base',
            description: 'Reduce from 47 to 25 suppliers to improve negotiating power and reduce administrative overhead',
            impact: 'medium',
            priority: 'medium',
            estimatedSavings: 18700,
            implementation: 'High complexity',
            timeframe: '4-6 months',
            confidence: 79,
            category: 'procurement',
            actions: [
              'Audit current supplier performance',
              'Identify consolidation opportunities',
              'Negotiate new agreements'
            ]
          },
          {
            id: 'process-automation',
            title: 'Automate Manual Processes',
            description: 'Implement RPA for order processing and inventory updates to reduce labor costs by 12%',
            impact: 'medium',
            priority: 'low',
            estimatedSavings: 11800,
            implementation: 'High complexity',
            timeframe: '3-4 months',
            confidence: 85,
            category: 'operations',
            actions: [
              'Map current manual processes',
              'Deploy RPA solutions',
              'Train staff on new workflows'
            ]
          }
        ],
        profitability: {
          grossMargin: 32.8,
          netMargin: 18.5,
          contribution: 45.2,
          breakEven: 156780,
          roi: 24.3,
          trends: {
            grossMargin: 2.1,
            netMargin: 1.8,
            contribution: 0.9
          }
        },
        summary: {
          totalCosts: 673000,
          potentialSavings: 107900,
          optimizationOpportunities: 5,
          averageMargin: 27.3,
          costEfficiencyScore: 78
        }
      };
      
      setCostData(mockData.costBreakdown);
      setOptimizations(mockData.optimizations);
      setProfitabilityData(mockData.profitability);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch cost analysis data:', err);
      setError(err.message || 'Failed to load cost analysis data');
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh
  useEffect(() => {
    fetchCostData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchCostData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [activeTab, autoRefresh, refreshInterval]);

  // Handle optimization application
  const handleOptimizationApply = (optimization) => {
    console.log('Applying cost optimization:', optimization);
    onOptimizationApply?.(optimization);
  };

  // Handle cost analysis
  const handleCostAnalyze = (category) => {
    console.log('Analyzing cost category:', category);
    onCostAnalyze?.(category);
  };

  // Loading state
  if (loading && !costData) {
    return (
      <AnalysisContainer className={className} {...props}>
        <LoadingState>
          <Icon name="loader" size={48} className="animate-spin" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Analyzing cost structure...
          </Typography>
          <Typography variant="body2" color="secondary">
            Processing financial data and optimization opportunities
          </Typography>
        </LoadingState>
      </AnalysisContainer>
    );
  }

  // Error state
  if (error && !costData) {
    return (
      <AnalysisContainer className={className} {...props}>
        <EmptyState>
          <Icon name="alert-triangle" size={48} color="error" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Failed to load cost analysis
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '1rem' }}>
            {error}
          </Typography>
          <Button onClick={fetchCostData}>
            <Icon name="refresh" size={16} />
            Try Again
          </Button>
        </EmptyState>
      </AnalysisContainer>
    );
  }

  return (
    <AnalysisContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <HeaderSection>
        <HeaderContent>
          <Icon name="dollar-sign" size={32} />
          <div>
            <Typography variant="h4" weight="bold">
              Cost Analysis & Margin Optimization
            </Typography>
            <Typography variant="body2" color="secondary">
              {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </Typography>
          </div>
        </HeaderContent>
        <HeaderActions>
          <AIOptimizationBadge size="lg">
            $107.9K Savings Potential
          </AIOptimizationBadge>
          <Button variant="outline" onClick={fetchCostData} disabled={loading}>
            <Icon name={loading ? 'loader' : 'refresh'} size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => onExportReport?.(costData)}>
            <Icon name="download" size={16} />
            Export Report
          </Button>
        </HeaderActions>
      </HeaderSection>

      <AnalysisTypeTabs>
        {analysisTypes.map(type => (
          <AnalysisTab
            key={type.key}
            active={activeTab === type.key}
            onClick={() => setActiveTab(type.key)}
          >
            <Icon name={type.icon} size={16} style={{ marginRight: '0.5rem' }} />
            {type.label}
          </AnalysisTab>
        ))}
      </AnalysisTypeTabs>

      <ContentGrid>
        <MainPanel>
          <CostBreakdownPanel
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Typography variant="h6" weight="semibold" style={{ marginBottom: '1rem' }}>
              Cost Structure Analysis
            </Typography>
            
            <BreakdownGrid>
              <AnimatePresence>
                {costData?.map((category, index) => (
                  <CostCategory
                    key={category.id}
                    category={category.category}
                    trend={category.trend}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <CategoryHeader>
                      <CategoryTitle>
                        <CategoryIcon category={category.category}>
                          <Icon name={getCategoryIcon(category.category)} size={18} />
                        </CategoryIcon>
                        {category.name}
                      </CategoryTitle>
                      <Badge 
                        variant={category.trend > 0 ? 'error' : category.trend < 0 ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {category.trend > 0 ? '+' : ''}{category.trend}%
                      </Badge>
                    </CategoryHeader>
                    
                    <CostAmount trend={category.trend}>
                      ${category.amount.toLocaleString()}
                    </CostAmount>
                    
                    <CostPercentage>
                      {category.percentage}% of total costs
                    </CostPercentage>
                    
                    <MarginMetrics>
                      <MetricItem>
                        <MetricValue trend={category.margin}>
                          {category.margin}%
                        </MetricValue>
                        <MetricLabel>Margin</MetricLabel>
                      </MetricItem>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCostAnalyze(category)}
                      >
                        <Icon name="eye" size={14} />
                        Analyze
                      </Button>
                    </MarginMetrics>
                  </CostCategory>
                ))}
              </AnimatePresence>
            </BreakdownGrid>
          </CostBreakdownPanel>
        </MainPanel>

        <SidePanel>
          <OptimizationPanel
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Typography variant="h6" weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="target" size={20} />
              Cost Optimizations
            </Typography>
            
            <OptimizationList>
              <AnimatePresence>
                {optimizations.slice(0, 4).map((optimization, index) => (
                  <OptimizationItem
                    key={optimization.id}
                    impact={optimization.impact}
                    priority={optimization.priority}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <OptimizationIcon impact={optimization.impact}>
                      <Icon name={getImpactIcon(optimization.impact)} size={20} />
                    </OptimizationIcon>
                    <OptimizationContent>
                      <OptimizationTitle>
                        {optimization.title}
                      </OptimizationTitle>
                      <OptimizationDescription>
                        {optimization.description}
                      </OptimizationDescription>
                      <OptimizationMetrics>
                        <Badge variant="success" size="sm">
                          ${optimization.estimatedSavings.toLocaleString()} savings
                        </Badge>
                        <Badge variant="info" size="sm">
                          {optimization.confidence}% confidence
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOptimizationApply(optimization)}
                        >
                          <Icon name="play" size={12} />
                          Apply
                        </Button>
                      </OptimizationMetrics>
                    </OptimizationContent>
                  </OptimizationItem>
                ))}
              </AnimatePresence>
            </OptimizationList>
          </OptimizationPanel>

          <ProfitabilityPanel
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Typography variant="h6" weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="pie-chart" size={20} />
              Profitability Metrics
            </Typography>
            
            <ProfitabilityGrid>
              <ProfitabilityCard>
                <ProfitValue trend={profitabilityData?.grossMargin}>
                  {profitabilityData?.grossMargin}%
                </ProfitValue>
                <ProfitLabel>Gross Margin</ProfitLabel>
              </ProfitabilityCard>
              <ProfitabilityCard>
                <ProfitValue trend={profitabilityData?.netMargin}>
                  {profitabilityData?.netMargin}%
                </ProfitValue>
                <ProfitLabel>Net Margin</ProfitLabel>
              </ProfitabilityCard>
              <ProfitabilityCard>
                <ProfitValue trend={profitabilityData?.roi}>
                  {profitabilityData?.roi}%
                </ProfitValue>
                <ProfitLabel>ROI</ProfitLabel>
              </ProfitabilityCard>
            </ProfitabilityGrid>
          </ProfitabilityPanel>
        </SidePanel>
      </ContentGrid>
    </AnalysisContainer>
  );
};

export default CostAnalysisMarginOptimization;