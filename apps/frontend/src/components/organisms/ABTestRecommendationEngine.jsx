import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import MetricCard from '../molecules/MetricCard';
import { useI18n } from '../../hooks/useI18n';

const EngineContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const EngineHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.emerald[25]} 0%, 
    ${props => props.theme.colors.emerald[50]} 100%);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.spacing[3]};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.emerald[500]} 0%, 
    ${props => props.theme.colors.emerald[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
  overflow-x: auto;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  color: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.primary[500]};
    background: ${props => props.theme.colors.primary[25]};
  }
`;

const ContentArea = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const RecommendationCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['priority', 'category'].includes(prop)
})`
  background: ${props => {
    switch (props.priority) {
      case 'high':
        return `linear-gradient(135deg, ${props.theme.colors.red[25]} 0%, ${props.theme.colors.red[50]} 100%)`;
      case 'medium':
        return `linear-gradient(135deg, ${props.theme.colors.yellow[25]} 0%, ${props.theme.colors.yellow[50]} 100%)`;
      case 'low':
        return `linear-gradient(135deg, ${props.theme.colors.green[25]} 0%, ${props.theme.colors.green[50]} 100%)`;
      default:
        return props.theme.colors.background.secondary;
    }
  }};
  border: 2px solid ${props => {
    switch (props.priority) {
      case 'high':
        return props.theme.colors.red[200];
      case 'medium':
        return props.theme.colors.yellow[200];
      case 'low':
        return props.theme.colors.green[200];
      default:
        return props.theme.colors.border.subtle;
    }
  }};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  position: relative;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.priority) {
        case 'high':
          return props.theme.colors.red[500];
        case 'medium':
          return props.theme.colors.yellow[500];
        case 'low':
          return props.theme.colors.green[500];
        default:
          return props.theme.colors.gray[500];
      }
    }};
    border-radius: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]} 0 0;
  }
`;

const RecommendationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const RecommendationTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
`;

const RecommendationIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'category'
})`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getCategoryColor(props.category, props.theme)}20;
  color: ${props => getCategoryColor(props.category, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const RecommendationDetails = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const RecommendationMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin: ${props => props.theme.spacing[3]} 0;
`;

const MetricItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[2]};
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'trend'
})`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => 
    props.trend === 'positive' ? props.theme.colors.green[600] :
    props.trend === 'negative' ? props.theme.colors.red[600] :
    props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const RecommendationActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const ActionButton = styled(Button)`
  flex: 1;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[6]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[3]};
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const FilterButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[3]};
  background: ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.active ? props.theme.colors.primary[500] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.primary[50]};
    border-color: ${props => props.theme.colors.primary[500]};
  }
`;

const InsightCard = styled(motion.div)`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.blue[25]} 0%, 
    ${props => props.theme.colors.blue[50]} 100%);
  border: 1px solid ${props => props.theme.colors.blue[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ExecutionPlan = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const PlanStep = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'completed'
})`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  &:last-child {
    border-bottom: none;
  }
`;

const StepNumber = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'completed'
})`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.completed ? props.theme.colors.green[500] : props.theme.colors.gray[300]};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const ImpactScore = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'score'
})`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => {
    if (props.score >= 90) return props.theme.colors.green[100];
    if (props.score >= 70) return props.theme.colors.yellow[100];
    return props.theme.colors.red[100];
  }};
  color: ${props => {
    if (props.score >= 90) return props.theme.colors.green[700];
    if (props.score >= 70) return props.theme.colors.yellow[700];
    return props.theme.colors.red[700];
  }};
  border-radius: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

// Utility functions
const getCategoryColor = (category, theme) => {
  const colors = {
    optimization: theme.colors?.blue?.[500] || '#3B82F6',
    new_feature: theme.colors?.green?.[500] || '#10B981',
    bug_fix: theme.colors?.red?.[500] || '#EF4444',
    performance: theme.colors?.purple?.[500] || '#8B5CF6',
    ux: theme.colors?.pink?.[500] || '#EC4899',
    analytics: theme.colors?.indigo?.[500] || '#6366F1'
  };
  return colors[category] || colors.optimization;
};

const getCategoryIcon = (category) => {
  const icons = {
    optimization: 'zap',
    new_feature: 'plus-circle',
    bug_fix: 'tool',
    performance: 'activity',
    ux: 'heart',
    analytics: 'bar-chart'
  };
  return icons[category] || 'lightbulb';
};

const ABTestRecommendationEngine = ({
  currentTests = [],
  businessMetrics = {},
  onRecommendationSelect,
  onExecutePlan,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('recommendations');
  const [selectedFilters, setSelectedFilters] = useState({
    priority: 'all',
    category: 'all',
    impact: 'all'
  });

  // Mock recommendations data
  const [recommendations, setRecommendations] = useState([
    {
      id: 'rec-001',
      title: 'Test AI Model Response Speed Optimization',
      description: 'Current response times are 2.3s average. Test Claude Haiku vs Sonnet for faster recommendations.',
      category: 'performance',
      priority: 'high',
      impactScore: 92,
      confidenceLevel: 85,
      estimatedUplift: 23,
      estimatedDuration: 14,
      requiredSampleSize: 5000,
      metrics: {
        currentPerformance: 2.3,
        expectedImprovement: 40,
        riskLevel: 15
      },
      reasoning: [
        'Response time is 30% slower than industry benchmark',
        'Speed optimization could improve conversion by 15-25%',
        'Low risk test with high potential impact',
        'Claude Haiku shows 85% faster response in similar use cases'
      ],
      suggestedVariants: [
        { name: 'Control', model: 'Claude Sonnet', config: 'current' },
        { name: 'Fast Response', model: 'Claude Haiku', config: 'optimized' }
      ]
    },
    {
      id: 'rec-002',
      title: 'Personalization Algorithm A/B Test',
      description: 'Test new ML-based personalization vs rule-based approach for product recommendations.',
      category: 'new_feature',
      priority: 'high',
      impactScore: 88,
      confidenceLevel: 78,
      estimatedUplift: 18,
      estimatedDuration: 21,
      requiredSampleSize: 8000,
      metrics: {
        currentPerformance: 12.3,
        expectedImprovement: 18,
        riskLevel: 25
      },
      reasoning: [
        'ML personalization shows 20% better CTR in beta testing',
        'User engagement metrics indicate demand for better recommendations',
        'Moderate risk due to algorithm complexity',
        'High potential for long-term customer value increase'
      ],
      suggestedVariants: [
        { name: 'Rule-based', model: 'Current System', config: 'existing' },
        { name: 'ML-based', model: 'Neural Network', config: 'personalized' }
      ]
    },
    {
      id: 'rec-003',
      title: 'Checkout Flow Simplification Test',
      description: 'Test streamlined 2-step vs current 4-step checkout process to reduce abandonment.',
      category: 'ux',
      priority: 'medium',
      impactScore: 75,
      confidenceLevel: 82,
      estimatedUplift: 12,
      estimatedDuration: 10,
      requiredSampleSize: 3000,
      metrics: {
        currentPerformance: 68,
        expectedImprovement: 12,
        riskLevel: 20
      },
      reasoning: [
        'Cart abandonment rate is 32%, above industry average',
        'User feedback indicates checkout complexity',
        'Similar tests show 10-15% conversion improvement',
        'Low technical risk, high UX impact potential'
      ],
      suggestedVariants: [
        { name: 'Current Flow', model: '4-step process', config: 'existing' },
        { name: 'Simplified', model: '2-step process', config: 'streamlined' }
      ]
    },
    {
      id: 'rec-004',
      title: 'AI Confidence Threshold Optimization',
      description: 'Test different confidence thresholds for AI recommendations to balance accuracy vs coverage.',
      category: 'optimization',
      priority: 'medium',
      impactScore: 71,
      confidenceLevel: 73,
      estimatedUplift: 8,
      estimatedDuration: 14,
      requiredSampleSize: 4000,
      metrics: {
        currentPerformance: 85,
        expectedImprovement: 8,
        riskLevel: 10
      },
      reasoning: [
        'Current 85% threshold may be too conservative',
        'Lower thresholds could increase recommendation coverage',
        'Need to balance accuracy vs recommendation frequency',
        'Low risk test with potential for incremental gains'
      ],
      suggestedVariants: [
        { name: 'Conservative', model: '85% threshold', config: 'current' },
        { name: 'Balanced', model: '75% threshold', config: 'optimized' }
      ]
    },
    {
      id: 'rec-005',
      title: 'Mobile vs Desktop UX Comparison',
      description: 'Test mobile-first design elements on desktop to improve cross-platform consistency.',
      category: 'ux',
      priority: 'low',
      impactScore: 65,
      confidenceLevel: 68,
      estimatedUplift: 5,
      estimatedDuration: 18,
      requiredSampleSize: 6000,
      metrics: {
        currentPerformance: 78,
        expectedImprovement: 5,
        riskLevel: 15
      },
      reasoning: [
        'Mobile conversion is 8% higher than desktop',
        'Design inconsistencies may confuse users',
        'Unified experience could improve brand perception',
        'Lower priority due to smaller expected impact'
      ],
      suggestedVariants: [
        { name: 'Current Desktop', model: 'Desktop-first', config: 'existing' },
        { name: 'Mobile-first', model: 'Unified design', config: 'consistent' }
      ]
    }
  ]);

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (selectedFilters.priority !== 'all' && rec.priority !== selectedFilters.priority) return false;
      if (selectedFilters.category !== 'all' && rec.category !== selectedFilters.category) return false;
      if (selectedFilters.impact !== 'all') {
        if (selectedFilters.impact === 'high' && rec.impactScore < 80) return false;
        if (selectedFilters.impact === 'medium' && (rec.impactScore >= 80 || rec.impactScore < 60)) return false;
        if (selectedFilters.impact === 'low' && rec.impactScore >= 60) return false;
      }
      return true;
    });
  }, [recommendations, selectedFilters]);

  // Tabs configuration
  const tabs = [
    { id: 'recommendations', label: 'AI Recommendations', icon: 'lightbulb' },
    { id: 'execution', label: 'Execution Plan', icon: 'play-circle' },
    { id: 'insights', label: 'Strategic Insights', icon: 'brain' }
  ];

  const updateFilter = useCallback((filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleRecommendationSelect = useCallback((recommendation) => {
    console.log('Recommendation selected:', recommendation);
    onRecommendationSelect?.(recommendation);
  }, [onRecommendationSelect]);

  const handleExecuteTest = useCallback((recommendation) => {
    console.log('Executing test for:', recommendation);
    // This would typically create a new A/B test based on the recommendation
  }, []);

  const renderRecommendationsTab = () => (
    <motion.div
      key="recommendations"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Filters */}
      <FilterSection>
        <Icon name="filter" size={20} />
        <Typography variant="body2" weight="medium">
          Filters:
        </Typography>
        
        <FilterGroup>
          <Typography variant="caption" color="secondary">Priority:</Typography>
          {['all', 'high', 'medium', 'low'].map(priority => (
            <FilterButton
              key={priority}
              active={selectedFilters.priority === priority}
              onClick={() => updateFilter('priority', priority)}
            >
              {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
            </FilterButton>
          ))}
        </FilterGroup>

        <FilterGroup>
          <Typography variant="caption" color="secondary">Category:</Typography>
          {['all', 'optimization', 'new_feature', 'ux', 'performance'].map(category => (
            <FilterButton
              key={category}
              active={selectedFilters.category === category}
              onClick={() => updateFilter('category', category)}
            >
              {category === 'all' ? 'All' : category.replace('_', ' ')}
            </FilterButton>
          ))}
        </FilterGroup>

        <FilterGroup>
          <Typography variant="caption" color="secondary">Impact:</Typography>
          {['all', 'high', 'medium', 'low'].map(impact => (
            <FilterButton
              key={impact}
              active={selectedFilters.impact === impact}
              onClick={() => updateFilter('impact', impact)}
            >
              {impact === 'all' ? 'All' : impact.charAt(0).toUpperCase() + impact.slice(1)}
            </FilterButton>
          ))}
        </FilterGroup>
      </FilterSection>

      {/* Recommendations Grid */}
      <RecommendationsGrid>
        {filteredRecommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.id}
            priority={rec.priority}
            category={rec.category}
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => handleRecommendationSelect(rec)}
          >
            <RecommendationHeader>
              <RecommendationTitle>
                <RecommendationIcon category={rec.category}>
                  <Icon name={getCategoryIcon(rec.category)} size={20} />
                </RecommendationIcon>
                <div>
                  <Typography variant="h6" weight="semibold">
                    {rec.title}
                  </Typography>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <Badge variant={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'success'} size="xs">
                      {rec.priority.toUpperCase()}
                    </Badge>
                    <ImpactScore score={rec.impactScore}>
                      <Icon name="zap" size={10} />
                      {rec.impactScore}% Impact
                    </ImpactScore>
                  </div>
                </div>
              </RecommendationTitle>
            </RecommendationHeader>

            <RecommendationDetails>
              <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
                {rec.description}
              </Typography>

              <RecommendationMetrics>
                <MetricItem>
                  <MetricValue trend="positive">+{rec.estimatedUplift}%</MetricValue>
                  <MetricLabel>Est. Uplift</MetricLabel>
                </MetricItem>
                <MetricItem>
                  <MetricValue>{rec.estimatedDuration}d</MetricValue>
                  <MetricLabel>Duration</MetricLabel>
                </MetricItem>
                <MetricItem>
                  <MetricValue>{rec.confidenceLevel}%</MetricValue>
                  <MetricLabel>Confidence</MetricLabel>
                </MetricItem>
              </RecommendationMetrics>

              <div style={{ marginTop: '12px' }}>
                <Typography variant="caption" color="secondary" style={{ marginBottom: '8px', display: 'block' }}>
                  Key Reasoning:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#64748b' }}>
                  {rec.reasoning.slice(0, 2).map((reason, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{reason}</li>
                  ))}
                </ul>
              </div>
            </RecommendationDetails>

            <RecommendationActions>
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('View details for:', rec.id);
                }}
              >
                <Icon name="eye" size={14} />
                Details
              </ActionButton>
              <ActionButton
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExecuteTest(rec);
                }}
              >
                <Icon name="play" size={14} />
                Execute
              </ActionButton>
            </RecommendationActions>
          </RecommendationCard>
        ))}
      </RecommendationsGrid>

      {filteredRecommendations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Icon name="search" size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
          <Typography variant="h6" color="secondary">
            No recommendations match your filters
          </Typography>
          <Typography variant="body2" color="tertiary">
            Try adjusting your filter criteria to see more suggestions
          </Typography>
        </div>
      )}
    </motion.div>
  );

  const renderExecutionPlanTab = () => (
    <motion.div
      key="execution"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ExecutionPlan>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Icon name="play-circle" size={24} />
          <Typography variant="h5" weight="semibold">
            Recommended Execution Sequence
          </Typography>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Typography variant="body2" color="secondary">
            Based on your current performance and business priorities, here's the optimal sequence for implementing A/B tests:
          </Typography>
        </div>

        {filteredRecommendations
          .sort((a, b) => {
            // Sort by priority (high > medium > low) then by impact score
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            return priorityDiff !== 0 ? priorityDiff : b.impactScore - a.impactScore;
          })
          .slice(0, 5)
          .map((rec, index) => (
            <PlanStep
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <StepNumber>{index + 1}</StepNumber>
              <StepContent>
                <Typography variant="body1" weight="medium" style={{ marginBottom: '8px' }}>
                  {rec.title}
                </Typography>
                <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
                  {rec.description}
                </Typography>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="clock" size={14} />
                    <Typography variant="caption">{rec.estimatedDuration} days</Typography>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="users" size={14} />
                    <Typography variant="caption">{rec.requiredSampleSize.toLocaleString()} samples</Typography>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="trending-up" size={14} />
                    <Typography variant="caption">+{rec.estimatedUplift}% uplift</Typography>
                  </div>
                  <Badge variant={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'success'} size="xs">
                    {rec.priority}
                  </Badge>
                </div>
              </StepContent>
            </PlanStep>
          ))
        }

        <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
          <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
            💡 Execution Tips:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px', color: '#64748b' }}>
            <li>Run high-priority tests first to maximize early wins</li>
            <li>Avoid running competing tests that might affect the same metrics</li>
            <li>Allow sufficient time between tests for data collection</li>
            <li>Monitor early signals but wait for statistical significance</li>
          </ul>
        </div>
      </ExecutionPlan>
    </motion.div>
  );

  const renderInsightsTab = () => (
    <motion.div
      key="insights"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <InsightCard whileHover={{ scale: 1.01 }}>
        <InsightHeader>
          <Icon name="brain" size={20} />
          <Typography variant="h6" weight="semibold">
            Strategic Testing Insights
          </Typography>
        </InsightHeader>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <Typography variant="body1" weight="medium" style={{ marginBottom: '8px' }}>
              🎯 Priority Focus Areas
            </Typography>
            <Typography variant="body2" color="secondary">
              Your highest-impact opportunities are in <strong>performance optimization</strong> and <strong>personalization</strong>. 
              These areas show 85%+ confidence for significant improvements.
            </Typography>
          </div>
          
          <div>
            <Typography variant="body1" weight="medium" style={{ marginBottom: '8px' }}>
              📊 Testing Velocity Recommendation
            </Typography>
            <Typography variant="body2" color="secondary">
              Based on your traffic volume, you can safely run <strong>2-3 concurrent tests</strong> without statistical interference. 
              Prioritize high-impact, low-risk tests for faster iteration cycles.
            </Typography>
          </div>
          
          <div>
            <Typography variant="body1" weight="medium" style={{ marginBottom: '8px' }}>
              🔍 Performance Gaps Identified
            </Typography>
            <Typography variant="body2" color="secondary">
              Your AI response time (2.3s avg) and checkout abandonment (32%) are key conversion bottlenecks. 
              Addressing these could yield <strong>15-25% conversion improvement</strong>.
            </Typography>
          </div>
          
          <div>
            <Typography variant="body1" weight="medium" style={{ marginBottom: '8px' }}>
              ⚡ Quick Wins Available
            </Typography>
            <Typography variant="body2" color="secondary">
              Low-risk optimizations like AI confidence threshold tuning can provide <strong>immediate 5-8% gains</strong> 
              while longer tests are running.
            </Typography>
          </div>
        </div>
      </InsightCard>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <MetricCard
          title="Testing ROI Potential"
          value="+$142K"
          icon="dollar-sign"
          trend={{ value: 'Annual projection', label: 'based on recommendations' }}
          color="green"
        />
        <MetricCard
          title="Recommended Test Budget"
          value="$12K/month"
          icon="credit-card"
          trend={{ value: '8.5% of revenue', label: 'industry standard' }}
          color="blue"
        />
        <MetricCard
          title="Expected Win Rate"
          value="67%"
          icon="target"
          trend={{ value: 'Above average', label: 'for your vertical' }}
          color="purple"
        />
        <MetricCard
          title="Time to First Win"
          value="14 days"
          icon="clock"
          trend={{ value: 'High-priority test', label: 'completion time' }}
          color="orange"
        />
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return renderRecommendationsTab();
      case 'execution':
        return renderExecutionPlanTab();
      case 'insights':
        return renderInsightsTab();
      default:
        return null;
    }
  };

  return (
    <EngineContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <EngineHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="lightbulb" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                AI Test Recommendation Engine
              </Typography>
              <Typography variant="body2" color="secondary">
                Intelligent A/B test suggestions based on performance analysis and ML insights
              </Typography>
            </div>
          </HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Badge variant="info" size="sm">
              {filteredRecommendations.length} Recommendations
            </Badge>
            <Button variant="primary" size="sm" onClick={() => onExecutePlan?.()}>
              <Icon name="play" size={16} />
              Execute Plan
            </Button>
          </div>
        </HeaderContent>
      </EngineHeader>

      {/* Tabs */}
      <TabsContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      {/* Content */}
      <ContentArea>
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </ContentArea>
    </EngineContainer>
  );
};

export default ABTestRecommendationEngine;