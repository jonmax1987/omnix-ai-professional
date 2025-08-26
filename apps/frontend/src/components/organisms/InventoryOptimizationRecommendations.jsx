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

const RecommendationsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  height: 100%;
  max-width: 1200px;
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

const FilterTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.secondary};
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const FilterTab = styled.button.withConfig({
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
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.background.elevated};
  }
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${props => props.theme.spacing[4]};
`;

const RecommendationCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['priority', 'impact'].includes(prop)
})`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  position: relative;
  overflow: hidden;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => getPriorityGradient(props.priority, props.theme)};
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
    border-color: ${props => props.theme.colors.border.strong};
  }
`;

const RecommendationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const RecommendationIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'type'
})`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getTypeGradient(props.type, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const RecommendationContent = styled.div`
  flex: 1;
  margin-left: ${props => props.theme.spacing[3]};
`;

const RecommendationTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[2]};
  line-height: 1.3;
`;

const RecommendationDescription = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  text-align: center;
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'positive'
})`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.positive ? props.theme.colors.green[600] : props.theme.colors.red[600]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const ImpactProgress = styled.div`
  margin: ${props => props.theme.spacing[4]} 0;
`;

const ImpactLabel = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const AIBadge = styled(Badge)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.primary[600]});
  color: white;
  border: none;
  position: absolute;
  top: ${props => props.theme.spacing[3]};
  right: ${props => props.theme.spacing[3]};
  
  &::before {
    content: '🤖';
    margin-right: ${props => props.theme.spacing[1]};
  }
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

// Utility functions
const getPriorityGradient = (priority, theme = {}) => {
  const gradients = {
    critical: `linear-gradient(90deg, ${theme.colors?.red?.[500] || '#EF4444'}, ${theme.colors?.red?.[400] || '#F87171'})`,
    high: `linear-gradient(90deg, ${theme.colors?.orange?.[500] || '#F97316'}, ${theme.colors?.orange?.[400] || '#FB923C'})`,
    medium: `linear-gradient(90deg, ${theme.colors?.yellow?.[500] || '#EAB308'}, ${theme.colors?.yellow?.[400] || '#FACC15'})`,
    low: `linear-gradient(90deg, ${theme.colors?.blue?.[500] || '#3B82F6'}, ${theme.colors?.blue?.[400] || '#60A5FA'})`
  };
  return gradients[priority] || gradients.medium;
};

const getTypeGradient = (type, theme = {}) => {
  const gradients = {
    stock_levels: `linear-gradient(135deg, ${theme.colors?.blue?.[500] || '#3B82F6'}, ${theme.colors?.blue?.[600] || '#2563EB'})`,
    reorder_points: `linear-gradient(135deg, ${theme.colors?.green?.[500] || '#10B981'}, ${theme.colors?.green?.[600] || '#059669'})`,
    safety_stock: `linear-gradient(135deg, ${theme.colors?.yellow?.[500] || '#F59E0B'}, ${theme.colors?.yellow?.[600] || '#D97706'})`,
    cost: `linear-gradient(135deg, ${theme.colors?.purple?.[500] || '#8B5CF6'}, ${theme.colors?.purple?.[600] || '#7C3AED'})`,
    demand_forecasting: `linear-gradient(135deg, ${theme.colors?.pink?.[500] || '#EC4899'}, ${theme.colors?.pink?.[600] || '#DB2777'})`,
    supplier_optimization: `linear-gradient(135deg, ${theme.colors?.indigo?.[500] || '#6366F1'}, ${theme.colors?.indigo?.[600] || '#4F46E5'})`
  };
  return gradients[type] || gradients.stock_levels;
};

const getTypeIcon = (type) => {
  const icons = {
    stock_levels: 'package',
    reorder_points: 'refresh-cw',
    safety_stock: 'shield',
    cost: 'dollar-sign',
    demand_forecasting: 'trending-up',
    supplier_optimization: 'truck'
  };
  return icons[type] || 'lightbulb';
};

const InventoryOptimizationRecommendations = ({
  onImplement,
  onDismiss,
  onViewDetails,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [impactAnalysis, setImpactAnalysis] = useState(null);
  const [implementationPlan, setImplementationPlan] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All Recommendations', count: recommendations.length },
    { key: 'stock_levels', label: 'Stock Levels', count: recommendations.filter(r => r.type === 'stock_levels').length },
    { key: 'reorder_points', label: 'Reorder Points', count: recommendations.filter(r => r.type === 'reorder_points').length },
    { key: 'safety_stock', label: 'Safety Stock', count: recommendations.filter(r => r.type === 'safety_stock').length },
    { key: 'cost', label: 'Cost Optimization', count: recommendations.filter(r => r.type === 'cost').length }
  ];

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        type: activeFilter === 'all' ? 'all' : activeFilter,
        priority: 'high',
        includeImpactAnalysis: true,
        includeImplementationPlan: true
      };
      
      const response = await inventoryService.getOptimizationRecommendations(params);
      
      // Mock data structure for demonstration
      const mockRecommendations = [
        {
          id: 'rec-1',
          type: 'stock_levels',
          priority: 'critical',
          title: 'Optimize Stock Levels for Electronics',
          description: 'Current stock levels for smartphones and tablets are suboptimal. AI analysis suggests adjusting inventory levels to reduce holding costs while maintaining service levels.',
          impact: {
            costSavings: '$24,500',
            inventoryReduction: '15%',
            serviceLevel: '97%',
            paybackPeriod: '2.3 months'
          },
          confidence: 94,
          affectedProducts: 23,
          estimatedSavings: 24500,
          implementationEffort: 'Medium',
          currentValue: 156000,
          optimizedValue: 132600,
          actions: [
            'Reduce iPhone 15 stock by 20 units',
            'Increase Samsung Galaxy stock by 12 units',
            'Implement dynamic reorder points'
          ]
        },
        {
          id: 'rec-2',
          type: 'reorder_points',
          priority: 'high',
          title: 'Adjust Reorder Points for Seasonal Items',
          description: 'Historical demand patterns indicate reorder points for seasonal items should be adjusted to prevent stockouts during peak periods.',
          impact: {
            stockoutReduction: '78%',
            serviceImprovement: '12%',
            customerSatisfaction: '+8.5%',
            revenueIncrease: '$18,200'
          },
          confidence: 89,
          affectedProducts: 45,
          estimatedSavings: 18200,
          implementationEffort: 'Low',
          currentServiceLevel: 92,
          targetServiceLevel: 98,
          actions: [
            'Increase winter clothing reorder points by 30%',
            'Implement seasonal multipliers',
            'Set up automated alerts'
          ]
        },
        {
          id: 'rec-3',
          type: 'safety_stock',
          priority: 'medium',
          title: 'Optimize Safety Stock Calculations',
          description: 'Current safety stock calculations are based on static formulas. Dynamic safety stock based on demand variability will improve efficiency.',
          impact: {
            inventoryReduction: '$31,800',
            spaceUtilization: '+22%',
            carryingCosts: '-18%',
            fillRate: '99.2%'
          },
          confidence: 87,
          affectedProducts: 89,
          estimatedSavings: 31800,
          implementationEffort: 'High',
          currentUtilization: 78,
          targetUtilization: 95,
          actions: [
            'Implement variable safety stock formula',
            'Reduce safety stock for fast-moving items',
            'Increase safety stock for critical items'
          ]
        },
        {
          id: 'rec-4',
          type: 'cost',
          priority: 'high',
          title: 'Supplier Contract Renegotiation',
          description: 'Analysis reveals opportunities to reduce procurement costs through supplier consolidation and bulk purchasing agreements.',
          impact: {
            costReduction: '$42,300',
            leadTimeImprovement: '2.5 days',
            qualityScore: '+15%',
            supplierRating: '4.8/5'
          },
          confidence: 92,
          affectedProducts: 156,
          estimatedSavings: 42300,
          implementationEffort: 'Medium',
          currentCosts: 340000,
          optimizedCosts: 297700,
          actions: [
            'Consolidate suppliers from 12 to 8',
            'Negotiate volume discounts',
            'Implement preferred vendor agreements'
          ]
        },
        {
          id: 'rec-5',
          type: 'demand_forecasting',
          priority: 'medium',
          title: 'Enhance Demand Forecasting Accuracy',
          description: 'Current forecasting accuracy is 76%. Implementing advanced ML models can improve accuracy to 89%, reducing both stockouts and overstock.',
          impact: {
            forecastAccuracy: '+13%',
            stockoutReduction: '45%',
            overstockReduction: '32%',
            totalSavings: '$28,900'
          },
          confidence: 83,
          affectedProducts: 234,
          estimatedSavings: 28900,
          implementationEffort: 'High',
          currentAccuracy: 76,
          targetAccuracy: 89,
          actions: [
            'Deploy advanced ML forecasting models',
            'Integrate external data sources',
            'Implement real-time forecast updates'
          ]
        },
        {
          id: 'rec-6',
          type: 'supplier_optimization',
          priority: 'low',
          title: 'Optimize Supplier Lead Times',
          description: 'Analysis of supplier performance data reveals opportunities to reduce lead times through strategic partnerships and improved communication.',
          impact: {
            leadTimeReduction: '3.2 days',
            inventoryReduction: '$15,600',
            serviceLevel: '+5%',
            supplierEfficiency: '+25%'
          },
          confidence: 78,
          affectedProducts: 67,
          estimatedSavings: 15600,
          implementationEffort: 'Medium',
          currentLeadTime: 12.5,
          targetLeadTime: 9.3,
          actions: [
            'Establish weekly supplier check-ins',
            'Implement EDI integration',
            'Create supplier performance dashboards'
          ]
        }
      ];
      
      setRecommendations(mockRecommendations);
      setImpactAnalysis(response?.impactAnalysis);
      setImplementationPlan(response?.implementationPlan);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch optimization recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    if (activeFilter === 'all') return recommendations;
    return recommendations.filter(rec => rec.type === activeFilter);
  }, [recommendations, activeFilter]);

  // Auto refresh
  useEffect(() => {
    fetchRecommendations();
    
    if (autoRefresh) {
      const interval = setInterval(fetchRecommendations, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [activeFilter, autoRefresh, refreshInterval]);

  // Handle implementation
  const handleImplement = (recommendation) => {
    onImplement?.(recommendation);
  };

  // Handle dismiss
  const handleDismiss = (recommendation) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
    onDismiss?.(recommendation);
  };

  // Loading state
  if (loading && recommendations.length === 0) {
    return (
      <RecommendationsContainer className={className} {...props}>
        <LoadingState>
          <Icon name="loader" size={48} className="animate-spin" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Analyzing inventory data...
          </Typography>
          <Typography variant="body2" color="secondary">
            Generating AI-powered optimization recommendations
          </Typography>
        </LoadingState>
      </RecommendationsContainer>
    );
  }

  // Error state
  if (error && recommendations.length === 0) {
    return (
      <RecommendationsContainer className={className} {...props}>
        <EmptyState>
          <Icon name="alert-triangle" size={48} color="error" />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            Failed to load recommendations
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '1rem' }}>
            {error}
          </Typography>
          <Button onClick={fetchRecommendations}>
            <Icon name="refresh" size={16} />
            Try Again
          </Button>
        </EmptyState>
      </RecommendationsContainer>
    );
  }

  return (
    <RecommendationsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <HeaderSection>
        <HeaderContent>
          <Icon name="brain" size={32} />
          <div>
            <Typography variant="h4" weight="bold">
              AI Inventory Optimization
            </Typography>
            <Typography variant="body2" color="secondary">
              {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </Typography>
          </div>
        </HeaderContent>
        <HeaderActions>
          <Badge variant="info" size="lg">
            {filteredRecommendations.length} recommendations
          </Badge>
          <Button variant="outline" onClick={fetchRecommendations} disabled={loading}>
            <Icon name={loading ? 'loader' : 'refresh'} size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </HeaderActions>
      </HeaderSection>

      <FilterTabs>
        {filterOptions.map(option => (
          <FilterTab
            key={option.key}
            active={activeFilter === option.key}
            onClick={() => setActiveFilter(option.key)}
          >
            {option.label} {option.count > 0 && `(${option.count})`}
          </FilterTab>
        ))}
      </FilterTabs>

      {filteredRecommendations.length === 0 ? (
        <EmptyState>
          <Icon name="lightbulb" size={48} />
          <Typography variant="h6" style={{ marginTop: '1rem' }}>
            No recommendations available
          </Typography>
          <Typography variant="body2" color="secondary">
            {activeFilter === 'all' 
              ? 'Your inventory is already well-optimized!'
              : `No ${activeFilter.replace('_', ' ')} recommendations at this time.`
            }
          </Typography>
        </EmptyState>
      ) : (
        <RecommendationsGrid>
          <AnimatePresence>
            {filteredRecommendations.map((recommendation, index) => (
              <RecommendationCard
                key={recommendation.id}
                priority={recommendation.priority}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <AIBadge size="sm">
                  {recommendation.confidence}%
                </AIBadge>
                
                <RecommendationHeader>
                  <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                    <RecommendationIcon type={recommendation.type}>
                      <Icon name={getTypeIcon(recommendation.type)} size={24} />
                    </RecommendationIcon>
                    <RecommendationContent>
                      <RecommendationTitle>
                        {recommendation.title}
                      </RecommendationTitle>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Badge 
                          variant={recommendation.priority === 'critical' ? 'error' : 
                                  recommendation.priority === 'high' ? 'warning' : 
                                  recommendation.priority === 'medium' ? 'info' : 'secondary'}
                          size="sm"
                        >
                          {recommendation.priority} priority
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {recommendation.affectedProducts} products
                        </Badge>
                      </div>
                    </RecommendationContent>
                  </div>
                </RecommendationHeader>

                <RecommendationDescription>
                  {recommendation.description}
                </RecommendationDescription>

                <MetricsGrid>
                  {Object.entries(recommendation.impact).slice(0, 4).map(([key, value]) => (
                    <MetricItem key={key}>
                      <MetricValue positive={value.toString().includes('+') || value.toString().includes('$')}>
                        {value}
                      </MetricValue>
                      <MetricLabel>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </MetricLabel>
                    </MetricItem>
                  ))}
                </MetricsGrid>

                <ImpactProgress>
                  <ImpactLabel>
                    <Typography variant="body2" weight="medium">
                      Implementation Effort
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {recommendation.implementationEffort}
                    </Typography>
                  </ImpactLabel>
                  <Progress 
                    value={recommendation.implementationEffort === 'Low' ? 25 : 
                           recommendation.implementationEffort === 'Medium' ? 50 : 75}
                    variant={recommendation.implementationEffort === 'Low' ? 'success' : 
                             recommendation.implementationEffort === 'Medium' ? 'warning' : 'info'}
                    size="sm"
                  />
                </ImpactProgress>

                <ActionButtons>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleImplement(recommendation)}
                  >
                    <Icon name="play" size={14} />
                    Implement
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails?.(recommendation)}
                  >
                    <Icon name="eye" size={14} />
                    Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(recommendation)}
                  >
                    <Icon name="x" size={14} />
                    Dismiss
                  </Button>
                </ActionButtons>
              </RecommendationCard>
            ))}
          </AnimatePresence>
        </RecommendationsGrid>
      )}
    </RecommendationsContainer>
  );
};

export default InventoryOptimizationRecommendations;