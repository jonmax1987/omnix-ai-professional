import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import { useI18n } from '../../hooks/useI18n';

const aiGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  }
`;

const PanelContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.primary[600]}, ${props => props.theme.colors.purple[500]});
    animation: ${aiGlow} 3s ease-in-out infinite;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[50]}, ${props => props.theme.colors.purple[50]});
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const AITitleIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.purple[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.purple[500]});
    z-index: -1;
    opacity: 0.3;
    animation: ${aiGlow} 2s ease-in-out infinite;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const StatusBadge = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => getStatusBackground(props.status, props.theme)};
  border: 1px solid ${props => getStatusBorder(props.status, props.theme)};
  border-radius: ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => getStatusColor(props.status, props.theme)};
`;

const ProcessingDot = styled(motion.div)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.theme.colors.green[500]};
`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[2]};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.background.elevated};
  }
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getStatColor(props.type, props.theme)};
  line-height: 1;
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const InsightsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[2]} 0;
`;

const InsightCategory = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  }
`;

const InsightsList = styled.div`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  }
`;

const InsightItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-left: 4px solid ${props => getPriorityColor(props.priority, props.theme)};
  border-radius: ${props => props.theme.spacing[2]};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => getPriorityColor(props.priority, props.theme)};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InsightIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => getPriorityGradient(props.priority, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const InsightTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
  line-height: 1.4;
`;

const InsightDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const InsightMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const ConfidenceBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
`;

const ActionButton = styled(motion.button)`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.secondary};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.background.elevated};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  color: ${props => props.theme.colors.text.tertiary};
`;

const getStatusBackground = (status, theme) => {
  const backgrounds = {
    active: theme.colors.green[50],
    processing: theme.colors.blue[50],
    error: theme.colors.red[50],
    idle: theme.colors.gray[50]
  };
  return backgrounds[status] || theme.colors.gray[50];
};

const getStatusBorder = (status, theme) => {
  const borders = {
    active: theme.colors.green[200],
    processing: theme.colors.blue[200],
    error: theme.colors.red[200],
    idle: theme.colors.gray[200]
  };
  return borders[status] || theme.colors.gray[200];
};

const getStatusColor = (status, theme) => {
  const colors = {
    active: theme.colors.green[700],
    processing: theme.colors.blue[700],
    error: theme.colors.red[700],
    idle: theme.colors.gray[700]
  };
  return colors[status] || theme.colors.gray[700];
};

const getStatColor = (type, theme) => {
  const colors = {
    insights: theme.colors.primary[600],
    recommendations: theme.colors.green[600],
    alerts: theme.colors.red[600],
    accuracy: theme.colors.purple[600]
  };
  return colors[type] || theme.colors.text.primary;
};

const getPriorityColor = (priority, theme) => {
  const colors = {
    critical: theme.colors.red[500],
    high: theme.colors.orange[500],
    medium: theme.colors.yellow[500],
    low: theme.colors.blue[500]
  };
  return colors[priority] || theme.colors.gray[400];
};

const getPriorityGradient = (priority, theme) => {
  const gradients = {
    critical: `linear-gradient(135deg, ${theme.colors.red[500]}, ${theme.colors.red[600]})`,
    high: `linear-gradient(135deg, ${theme.colors.orange[500]}, ${theme.colors.orange[600]})`,
    medium: `linear-gradient(135deg, ${theme.colors.yellow[500]}, ${theme.colors.yellow[600]})`,
    low: `linear-gradient(135deg, ${theme.colors.blue[500]}, ${theme.colors.blue[600]})`
  };
  return gradients[priority] || `linear-gradient(135deg, ${theme.colors.gray[400]}, ${theme.colors.gray[500]})`;
};

const AIInsightsSummary = ({
  insights = [],
  status = 'active',
  onInsightClick,
  onInsightAction,
  onRefresh,
  loading = false,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [expandedCategories, setExpandedCategories] = useState(new Set(['recommendations', 'alerts']));
  
  // Mock data for demonstration
  const defaultInsights = [
    {
      id: 'insight-1',
      category: 'recommendations',
      priority: 'high',
      title: 'Inventory Optimization Opportunity',
      description: 'Samsung Galaxy S24 inventory should be increased by 25% based on recent demand patterns and competitor analysis.',
      confidence: 94,
      impact: 'Revenue increase: ~$48,000/month',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      model: 'Claude Sonnet',
      actions: ['Apply', 'Dismiss', 'Learn More']
    },
    {
      id: 'insight-2',
      category: 'alerts',
      priority: 'critical',
      title: 'Critical Stock Alert',
      description: 'iPhone 15 Pro models are critically low (2 units). High demand expected this weekend.',
      confidence: 99,
      impact: 'Potential lost sales: $12,000',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      model: 'Real-time Analytics',
      actions: ['Reorder', 'Notify', 'Dismiss']
    },
    {
      id: 'insight-3',
      category: 'forecasting',
      priority: 'medium',
      title: 'Seasonal Demand Forecast',
      description: 'Garden tools expected to show 40% increase next month due to spring season approach.',
      confidence: 87,
      impact: 'Preparation recommended',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      model: 'Claude Haiku',
      actions: ['Plan', 'Monitor', 'Dismiss']
    },
    {
      id: 'insight-4',
      category: 'optimization',
      priority: 'low',
      title: 'Price Optimization',
      description: 'Nike Air Jordan pricing can be optimized for better margins based on competitor analysis.',
      confidence: 78,
      impact: 'Margin improvement: 3-5%',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      model: 'Price Intelligence',
      actions: ['Analyze', 'Apply', 'Monitor']
    },
    {
      id: 'insight-5',
      category: 'recommendations',
      priority: 'high',
      title: 'New Product Opportunity',
      description: 'Strong market demand detected for wireless charging stations. Consider adding to inventory.',
      confidence: 91,
      impact: 'New revenue stream potential',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      model: 'Market Intelligence',
      actions: ['Research', 'Add', 'Monitor']
    },
    {
      id: 'insight-6',
      category: 'alerts',
      priority: 'medium',
      title: 'Supplier Performance Issue',
      description: 'Electronics supplier showing 15% delivery delays this month. Consider backup options.',
      confidence: 85,
      impact: 'Supply chain risk',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      model: 'Supply Chain AI',
      actions: ['Contact', 'Plan', 'Monitor']
    }
  ];

  const currentInsights = insights.length > 0 ? insights : defaultInsights;

  const groupedInsights = useMemo(() => {
    const grouped = {};
    currentInsights.forEach(insight => {
      if (!grouped[insight.category]) {
        grouped[insight.category] = [];
      }
      grouped[insight.category].push(insight);
    });
    
    // Sort insights by priority and timestamp
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aPriority = priorityOrder[a.priority] || 4;
        const bPriority = priorityOrder[b.priority] || 4;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    });
    
    return grouped;
  }, [currentInsights]);

  const stats = useMemo(() => {
    const totalInsights = currentInsights.length;
    const recommendations = currentInsights.filter(i => i.category === 'recommendations').length;
    const alerts = currentInsights.filter(i => i.category === 'alerts' || i.priority === 'critical').length;
    const avgConfidence = currentInsights.reduce((sum, i) => sum + i.confidence, 0) / currentInsights.length || 0;
    
    return {
      insights: totalInsights,
      recommendations,
      alerts,
      accuracy: avgConfidence
    };
  }, [currentInsights]);

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categoryLabels = {
    recommendations: 'AI Recommendations',
    alerts: 'Priority Alerts',
    forecasting: 'Demand Forecasting',
    optimization: 'Business Optimization'
  };

  const categoryIcons = {
    recommendations: 'lightbulb',
    alerts: 'alertTriangle',
    forecasting: 'trendingUp',
    optimization: 'settings'
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <PanelContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <PanelHeader>
        <HeaderLeft>
          <AITitleIcon
            animate={{ rotate: status === 'processing' ? 360 : 0 }}
            transition={{ duration: 2, repeat: status === 'processing' ? Infinity : 0, ease: 'linear' }}
          >
            AI
          </AITitleIcon>
          <div>
            <Typography variant="h5" weight="semibold">
              AI Insights Summary
            </Typography>
            <Typography variant="caption" color="secondary">
              Powered by Claude 3 Sonnet & Haiku
            </Typography>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <StatusBadge
            status={status}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ProcessingDot
              animate={status === 'processing' ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 1, repeat: status === 'processing' ? Infinity : 0 }}
            />
            {status === 'active' ? 'Active' : 
             status === 'processing' ? 'Processing' : 
             status === 'error' ? 'Error' : 'Idle'}
          </StatusBadge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </PanelHeader>

      <SummaryStats>
        <StatCard whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <StatValue type="insights">{stats.insights}</StatValue>
          <StatLabel>Active Insights</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <StatValue type="recommendations">{stats.recommendations}</StatValue>
          <StatLabel>Recommendations</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <StatValue type="alerts">{stats.alerts}</StatValue>
          <StatLabel>Priority Alerts</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <StatValue type="accuracy">{Math.round(stats.accuracy)}%</StatValue>
          <StatLabel>Avg Confidence</StatLabel>
        </StatCard>
      </SummaryStats>

      <InsightsContainer>
        {loading ? (
          <EmptyState>
            <Icon name="brain" size={48} />
            <Typography variant="body1" color="secondary">
              AI is analyzing your data...
            </Typography>
          </EmptyState>
        ) : Object.keys(groupedInsights).length === 0 ? (
          <EmptyState>
            <Icon name="brain" size={48} />
            <div>
              <Typography variant="h6" weight="medium">
                No insights available
              </Typography>
              <Typography variant="body2" color="secondary">
                AI is learning from your data patterns
              </Typography>
            </div>
          </EmptyState>
        ) : (
          Object.entries(groupedInsights).map(([category, categoryInsights]) => (
            <InsightCategory key={category}>
              <CategoryHeader 
                onClick={() => toggleCategory(category)}
                style={{ cursor: 'pointer' }}
              >
                <Icon name={categoryIcons[category] || 'brain'} size={16} />
                <Typography variant="body2" weight="medium">
                  {categoryLabels[category] || category}
                </Typography>
                <Badge variant="secondary" size="sm">
                  {categoryInsights.length}
                </Badge>
                <Icon 
                  name={expandedCategories.has(category) ? 'chevronUp' : 'chevronDown'} 
                  size={16} 
                  style={{ marginLeft: 'auto' }}
                />
              </CategoryHeader>

              <AnimatePresence>
                {expandedCategories.has(category) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InsightsList>
                      {categoryInsights.map((insight, index) => (
                        <InsightItem
                          key={insight.id}
                          priority={insight.priority}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                          onClick={() => onInsightClick?.(insight)}
                        >
                          <InsightIcon priority={insight.priority}>
                            {insight.priority === 'critical' ? '!' : 
                             insight.priority === 'high' ? 'H' : 
                             insight.priority === 'medium' ? 'M' : 'L'}
                          </InsightIcon>

                          <InsightContent>
                            <InsightTitle>{insight.title}</InsightTitle>
                            <InsightDescription>{insight.description}</InsightDescription>
                            
                            <InsightMeta>
                              <ConfidenceBar>
                                <Icon name="zap" size={12} />
                                <Progress value={insight.confidence} size="xs" style={{ width: '40px' }} />
                                <span>{insight.confidence}%</span>
                              </ConfidenceBar>
                              
                              <Badge variant="info" size="sm">
                                {insight.model}
                              </Badge>
                              
                              <Typography variant="caption" color="tertiary">
                                {formatTimeAgo(insight.timestamp)}
                              </Typography>
                              
                              <ActionButtons>
                                {insight.actions?.slice(0, 2).map(action => (
                                  <ActionButton
                                    key={action}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onInsightAction?.(insight, action);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {action}
                                  </ActionButton>
                                ))}
                              </ActionButtons>
                            </InsightMeta>
                          </InsightContent>
                        </InsightItem>
                      ))}
                    </InsightsList>
                  </motion.div>
                )}
              </AnimatePresence>
            </InsightCategory>
          ))
        )}
      </InsightsContainer>
    </PanelContainer>
  );
};

export default AIInsightsSummary;