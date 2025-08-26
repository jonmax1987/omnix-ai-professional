// AIInsightsPanel Organism
// Implementation of ORG-011: AI-powered insights panel with recommendation engine
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Avatar from '../atoms/Avatar';
import { useI18n } from '../../hooks/useI18n';

// Insight types
export const InsightTypes = {
  INVENTORY: 'inventory',
  SALES: 'sales',
  CUSTOMER: 'customer',
  COST: 'cost',
  PERFORMANCE: 'performance',
  PREDICTION: 'prediction',
  ANOMALY: 'anomaly',
  OPTIMIZATION: 'optimization'
};

// Insight priorities
export const InsightPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Insight confidence levels
export const InsightConfidence = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const PanelContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['expanded', 'variant'].includes(prop)
})`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'compact' && css`
    max-height: 400px;
  `}
  
  ${props => props.variant === 'full' && css`
    height: 100%;
  `}
  
  ${props => props.expanded && css`
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  `}
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: linear-gradient(135deg, ${props => props.theme.colors.gradient.ai.from}08, ${props => props.theme.colors.gradient.ai.to}08);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const AIIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${props => props.theme.colors.gradient.ai.from}, ${props => props.theme.colors.gradient.ai.to});
  border-radius: ${props => props.theme.spacing[2]};
  color: white;
`;

const InsightsGrid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['columns'].includes(prop)
})`
  display: grid;
  padding: ${props => props.theme.spacing[4]};
  gap: ${props => props.theme.spacing[3]};
  
  ${props => props.columns === 1 && css`
    grid-template-columns: 1fr;
  `}
  
  ${props => props.columns === 2 && css`
    grid-template-columns: repeat(2, 1fr);
    
    @media (max-width: ${props.theme.breakpoints.md}) {
      grid-template-columns: 1fr;
    }
  `}
  
  ${props => props.columns === 3 && css`
    grid-template-columns: repeat(3, 1fr);
    
    @media (max-width: ${props.theme.breakpoints.lg}) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: ${props.theme.breakpoints.md}) {
      grid-template-columns: 1fr;
    }
  `}
`;

const InsightCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['priority', 'type', 'interactive'].includes(prop)
})`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[2]};
  position: relative;
  transition: all 0.2s ease;
  
  ${props => props.interactive && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: ${props.theme.colors.primary};
    }
  `}
  
  ${props => getInsightCardStyles(props.priority, props.theme)}
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const InsightMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const InsightIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['type'].includes(prop)
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.spacing[1]};
  color: white;
  
  ${props => getInsightTypeStyles(props.type, props.theme)}
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.div`
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const InsightDescription = styled.div`
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const InsightMetrics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const MetricValue = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const MetricLabel = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InsightActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-top: auto;
`;

const ConfidenceBadge = styled(Badge).withConfig({
  shouldForwardProp: (prop) => !['confidence'].includes(prop)
})`
  ${props => getConfidenceBadgeStyles(props.confidence, props.theme)}
`;

const PriorityIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['priority'].includes(prop)
})`
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-top: 16px solid ${props => getPriorityColor(props.priority, props.theme)};
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

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
`;

// Styling functions
function getInsightCardStyles(priority, theme) {
  const styles = {
    [InsightPriority.CRITICAL]: css`
      border-left: 4px solid ${theme.colors.danger};
      background: linear-gradient(90deg, ${theme.colors.danger}08, transparent);
    `,
    [InsightPriority.HIGH]: css`
      border-left: 4px solid ${theme.colors.warning};
      background: linear-gradient(90deg, ${theme.colors.warning}08, transparent);
    `,
    [InsightPriority.MEDIUM]: css`
      border-left: 4px solid ${theme.colors.primary};
      background: linear-gradient(90deg, ${theme.colors.primary}08, transparent);
    `,
    [InsightPriority.LOW]: css`
      border-left: 4px solid ${theme.colors.success};
      background: linear-gradient(90deg, ${theme.colors.success}08, transparent);
    `
  };
  
  return styles[priority] || styles[InsightPriority.MEDIUM];
}

function getInsightTypeStyles(type, theme) {
  const styles = {
    [InsightTypes.INVENTORY]: css`
      background: linear-gradient(135deg, #8B5CF6, #A855F7);
    `,
    [InsightTypes.SALES]: css`
      background: linear-gradient(135deg, #10B981, #059669);
    `,
    [InsightTypes.CUSTOMER]: css`
      background: linear-gradient(135deg, #3B82F6, #2563EB);
    `,
    [InsightTypes.COST]: css`
      background: linear-gradient(135deg, #F59E0B, #D97706);
    `,
    [InsightTypes.PERFORMANCE]: css`
      background: linear-gradient(135deg, #EF4444, #DC2626);
    `,
    [InsightTypes.PREDICTION]: css`
      background: linear-gradient(135deg, ${theme.colors.gradient.ai.from}, ${theme.colors.gradient.ai.to});
    `,
    [InsightTypes.ANOMALY]: css`
      background: linear-gradient(135deg, #F97316, #EA580C);
    `,
    [InsightTypes.OPTIMIZATION]: css`
      background: linear-gradient(135deg, #06B6D4, #0891B2);
    `
  };
  
  return styles[type] || styles[InsightTypes.PERFORMANCE];
}

function getConfidenceBadgeStyles(confidence, theme) {
  const styles = {
    [InsightConfidence.HIGH]: css`
      background: ${theme.colors.success};
      color: white;
    `,
    [InsightConfidence.MEDIUM]: css`
      background: ${theme.colors.warning};
      color: white;
    `,
    [InsightConfidence.LOW]: css`
      background: ${theme.colors.danger};
      color: white;
    `
  };
  
  return styles[confidence] || styles[InsightConfidence.MEDIUM];
}

function getPriorityColor(priority, theme) {
  const colors = {
    [InsightPriority.CRITICAL]: theme.colors.danger,
    [InsightPriority.HIGH]: theme.colors.warning,
    [InsightPriority.MEDIUM]: theme.colors.primary,
    [InsightPriority.LOW]: theme.colors.success
  };
  
  return colors[priority] || colors[InsightPriority.MEDIUM];
}

function getInsightTypeIcon(type) {
  const icons = {
    [InsightTypes.INVENTORY]: 'Package',
    [InsightTypes.SALES]: 'TrendingUp',
    [InsightTypes.CUSTOMER]: 'Users',
    [InsightTypes.COST]: 'DollarSign',
    [InsightTypes.PERFORMANCE]: 'Activity',
    [InsightTypes.PREDICTION]: 'Eye',
    [InsightTypes.ANOMALY]: 'AlertTriangle',
    [InsightTypes.OPTIMIZATION]: 'Zap'
  };
  
  return icons[type] || 'BarChart';
}

/**
 * AIInsightsPanel Component
 * Advanced AI-powered insights panel with recommendation engine
 */
const AIInsightsPanel = ({
  insights = [],
  loading = false,
  variant = 'full',
  columns = 2,
  expanded = false,
  interactive = true,
  showControls = true,
  showMetrics = true,
  filterByType = null,
  filterByPriority = null,
  sortBy = 'priority',
  onInsightClick = null,
  onActionClick = null,
  onRefresh = null,
  className = '',
  ...props
}) => {
  const { t } = useI18n();
  const [localExpanded, setLocalExpanded] = useState(expanded);
  const [selectedFilters, setSelectedFilters] = useState({
    type: filterByType,
    priority: filterByPriority
  });

  // Filter and sort insights
  const processedInsights = useMemo(() => {
    let filtered = [...insights];
    
    // Apply filters
    if (selectedFilters.type) {
      filtered = filtered.filter(insight => insight.type === selectedFilters.type);
    }
    
    if (selectedFilters.priority) {
      filtered = filtered.filter(insight => insight.priority === selectedFilters.priority);
    }
    
    // Apply sorting
    const priorityOrder = {
      [InsightPriority.CRITICAL]: 0,
      [InsightPriority.HIGH]: 1,
      [InsightPriority.MEDIUM]: 2,
      [InsightPriority.LOW]: 3
    };
    
    if (sortBy === 'priority') {
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === 'confidence') {
      const confidenceOrder = {
        [InsightConfidence.HIGH]: 0,
        [InsightConfidence.MEDIUM]: 1,
        [InsightConfidence.LOW]: 2
      };
      filtered.sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence]);
    } else if (sortBy === 'timestamp') {
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    return filtered;
  }, [insights, selectedFilters, sortBy]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = processedInsights.length;
    const critical = processedInsights.filter(i => i.priority === InsightPriority.CRITICAL).length;
    const highConfidence = processedInsights.filter(i => i.confidence === InsightConfidence.HIGH).length;
    const actionable = processedInsights.filter(i => i.actions && i.actions.length > 0).length;
    
    return { total, critical, highConfidence, actionable };
  }, [processedInsights]);

  const handleInsightClick = (insight, event) => {
    if (!interactive) return;
    
    if (onInsightClick) {
      onInsightClick(insight, event);
    }
  };

  const handleActionClick = (action, insight, event) => {
    event.stopPropagation();
    
    if (onActionClick) {
      onActionClick(action, insight, event);
    }
  };

  const handleToggleExpanded = () => {
    setLocalExpanded(!localExpanded);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value === selectedFilters[filterType] ? null : value
    }));
  };

  const renderInsightCard = (insight) => (
    <InsightCard
      key={insight.id}
      priority={insight.priority}
      type={insight.type}
      interactive={interactive}
      onClick={(e) => handleInsightClick(insight, e)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={interactive ? { y: -2 } : {}}
    >
      <PriorityIndicator priority={insight.priority} />
      
      <InsightHeader>
        <InsightMeta>
          <InsightIcon type={insight.type}>
            <Icon name={getInsightTypeIcon(insight.type)} size={16} />
          </InsightIcon>
          
          <div>
            <Typography variant="caption" color="secondary" weight="medium">
              {t(`insights.types.${insight.type}`)}
            </Typography>
            {insight.timestamp && (
              <Typography variant="caption" color="tertiary">
                {new Date(insight.timestamp).toLocaleDateString()}
              </Typography>
            )}
          </div>
        </InsightMeta>
        
        <ConfidenceBadge 
          confidence={insight.confidence}
          size="sm"
          variant="filled"
        >
          {t(`insights.confidence.${insight.confidence}`)}
        </ConfidenceBadge>
      </InsightHeader>
      
      <InsightContent>
        <InsightTitle>
          <Typography variant="subtitle2" weight="medium">
            {insight.title}
          </Typography>
        </InsightTitle>
        
        <InsightDescription>
          <Typography variant="body2" color="secondary">
            {insight.description}
          </Typography>
        </InsightDescription>
        
        {showMetrics && insight.metrics && (
          <InsightMetrics>
            {insight.metrics.map((metric, index) => (
              <MetricItem key={index}>
                <MetricValue style={{ color: metric.color }}>
                  {metric.value}
                </MetricValue>
                <MetricLabel>{metric.label}</MetricLabel>
              </MetricItem>
            ))}
          </InsightMetrics>
        )}
        
        {insight.recommendation && (
          <div style={{ 
            padding: `${props.theme?.spacing?.[3] || '12px'}`, 
            background: 'rgba(99, 102, 241, 0.1)', 
            borderRadius: '4px', 
            marginBottom: `${props.theme?.spacing?.[3] || '12px'}` 
          }}>
            <Typography variant="caption" weight="medium" style={{ 
              color: props.theme?.colors?.primary || '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Icon name="Lightbulb" size={12} />
              {t('insights.recommendation')}: {insight.recommendation}
            </Typography>
          </div>
        )}
        
        {insight.actions && insight.actions.length > 0 && (
          <InsightActions>
            {insight.actions.map((action, index) => (
              <Button
                key={action.id || index}
                onClick={(e) => handleActionClick(action, insight, e)}
                variant={action.variant || 'outline'}
                size="small"
                color={action.color}
                disabled={action.disabled}
              >
                {action.icon && <Icon name={action.icon} size={14} />}
                {action.label}
              </Button>
            ))}
          </InsightActions>
        )}
      </InsightContent>
    </InsightCard>
  );

  return (
    <PanelContainer
      variant={variant}
      expanded={localExpanded}
      className={`ai-insights-panel ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <PanelHeader>
        <HeaderLeft>
          <AIIcon>
            <Icon name="Brain" size={20} />
          </AIIcon>
          
          <div>
            <Typography variant="h6" weight="semibold">
              {t('insights.title')}
            </Typography>
            {showMetrics && (
              <Typography variant="caption" color="secondary">
                {t('insights.summary', { 
                  total: summaryMetrics.total,
                  critical: summaryMetrics.critical,
                  actionable: summaryMetrics.actionable
                })}
              </Typography>
            )}
          </div>
        </HeaderLeft>
        
        <HeaderRight>
          {showControls && (
            <>
              {/* Type Filter */}
              <Button
                variant="ghost"
                size="small"
                onClick={() => {
                  // Cycle through insight types
                  const types = Object.values(InsightTypes);
                  const currentIndex = types.indexOf(selectedFilters.type);
                  const nextIndex = (currentIndex + 1) % (types.length + 1);
                  handleFilterChange('type', nextIndex === types.length ? null : types[nextIndex]);
                }}
              >
                <Icon name="Filter" size={14} />
                {selectedFilters.type ? t(`insights.types.${selectedFilters.type}`) : t('insights.allTypes')}
              </Button>
              
              {/* Priority Filter */}
              <Button
                variant="ghost"
                size="small"
                onClick={() => {
                  const priorities = Object.values(InsightPriority);
                  const currentIndex = priorities.indexOf(selectedFilters.priority);
                  const nextIndex = (currentIndex + 1) % (priorities.length + 1);
                  handleFilterChange('priority', nextIndex === priorities.length ? null : priorities[nextIndex]);
                }}
              >
                <Icon name="Flag" size={14} />
                {selectedFilters.priority ? t(`insights.priority.${selectedFilters.priority}`) : t('insights.allPriorities')}
              </Button>
              
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={onRefresh}
                  loading={loading}
                >
                  <Icon name="RefreshCw" size={14} />
                </Button>
              )}
              
              {variant === 'compact' && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleToggleExpanded}
                >
                  <Icon name={localExpanded ? "ChevronUp" : "ChevronDown"} size={14} />
                </Button>
              )}
            </>
          )}
        </HeaderRight>
      </PanelHeader>
      
      {loading ? (
        <LoadingContainer>
          <Icon name="Loader" size={24} color="primary" />
          <Typography variant="body2" color="secondary" style={{ marginLeft: '12px' }}>
            {t('insights.loading')}
          </Typography>
        </LoadingContainer>
      ) : processedInsights.length === 0 ? (
        <EmptyState>
          <Icon name="BarChart" size={48} color="secondary" />
          <Typography variant="h6" color="secondary" style={{ marginTop: '16px' }}>
            {t('insights.empty.title')}
          </Typography>
          <Typography variant="body2" color="tertiary" style={{ marginTop: '8px' }}>
            {t('insights.empty.description')}
          </Typography>
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              style={{ marginTop: '16px' }}
            >
              <Icon name="RefreshCw" size={14} />
              {t('insights.refresh')}
            </Button>
          )}
        </EmptyState>
      ) : (
        <AnimatePresence mode="wait">
          <InsightsGrid columns={columns}>
            {processedInsights.map(renderInsightCard)}
          </InsightsGrid>
        </AnimatePresence>
      )}
    </PanelContainer>
  );
};

export default AIInsightsPanel;