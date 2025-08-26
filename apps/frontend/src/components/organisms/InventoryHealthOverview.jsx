import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import Button from '../atoms/Button';
import { useI18n } from '../../hooks/useI18n';

const OverviewContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing[4]};
  height: 100%;
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr;
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

const HealthCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'health'
})`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => getHealthGradient(props.health, props.theme)};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const HealthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const HealthTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const HealthScore = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ScoreValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'score'
})`
  font-size: ${props => props.theme.typography?.h1?.fontSize || '2.25rem'};
  font-weight: ${props => props.theme.typography?.fontWeight?.bold || 700};
  color: ${props => getHealthColor(props.score, props.theme)};
  line-height: 1;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const CategoryCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.border.strong};
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const CategoryTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const CategoryMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'type'
})`
  font-size: ${props => props.theme.typography?.h4?.fontSize || '1.25rem'};
  font-weight: ${props => props.theme.typography?.fontWeight?.semibold || 600};
  color: ${props => getMetricColor(props.type, props.theme)};
  line-height: 1.2;
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography?.body2?.fontSize || '0.875rem'};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing[1]};
`;

const ProgressSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const IssuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const IssueItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'severity'
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => getSeverityBackground(props.severity, props.theme)};
  border: 1px solid ${props => getSeverityBorder(props.severity, props.theme)};
  border-radius: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography?.body2?.fontSize || '0.875rem'};
`;

const AlertsPanel = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  height: fit-content;
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  max-height: 300px;
  overflow-y: auto;
`;

const AlertItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'severity'
})`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  border-left: 4px solid ${props => getSeverityColor(props.severity, props.theme)};
`;

const AlertContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AlertTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing[1]};
  color: ${props => props.theme.colors.text.primary};
`;

const AlertDescription = styled.div`
  font-size: ${props => props.theme.typography?.body2?.fontSize || '0.875rem'};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const AlertTime = styled.div`
  font-size: ${props => props.theme.typography?.caption?.fontSize || '0.75rem'};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing[1]};
`;

const InsightsPanel = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  height: fit-content;
`;

const InsightItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.primary[50]};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AIIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.primary[600]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`;

const getHealthGradient = (health, theme = {}) => {
  if (health >= 80) return `linear-gradient(90deg, ${theme.colors?.green?.[500] || '#22C55E'}, ${theme.colors?.green?.[400] || '#4ADE80'})`;
  if (health >= 60) return `linear-gradient(90deg, ${theme.colors?.yellow?.[500] || '#EAB308'}, ${theme.colors?.yellow?.[400] || '#FACC15'})`;
  if (health >= 40) return `linear-gradient(90deg, ${theme.colors?.orange?.[500] || '#F97316'}, ${theme.colors?.orange?.[400] || '#FB923C'})`;
  return `linear-gradient(90deg, ${theme.colors?.red?.[500] || '#EF4444'}, ${theme.colors?.red?.[400] || '#F87171'})`;
};

const getHealthColor = (score, theme = {}) => {
  if (score >= 80) return theme.colors?.green?.[600] || '#16A34A';
  if (score >= 60) return theme.colors?.yellow?.[600] || '#CA8A04';
  if (score >= 40) return theme.colors?.orange?.[600] || '#EA580C';
  return theme.colors?.red?.[600] || '#DC2626';
};

const getMetricColor = (type, theme = {}) => {
  const colors = {
    stock: theme.colors?.blue?.[600] || '#2563EB',
    turnover: theme.colors?.green?.[600] || '#16A34A',
    expired: theme.colors?.red?.[600] || '#DC2626',
    lowStock: theme.colors?.yellow?.[600] || '#CA8A04'
  };
  return colors[type] || theme.colors?.text?.primary || '#374151';
};

const getSeverityColor = (severity, theme = {}) => {
  // Provide fallback colors if theme is not available
  const fallbackColors = {
    critical: '#EF4444',
    high: '#F97316',
    medium: '#EAB308',
    low: '#3B82F6'
  };
  
  if (!theme.colors) {
    return fallbackColors[severity] || '#6B7280';
  }
  
  const colors = {
    critical: theme.colors.red?.[500] || fallbackColors.critical,
    high: theme.colors.orange?.[500] || fallbackColors.high,
    medium: theme.colors.yellow?.[500] || fallbackColors.medium,
    low: theme.colors.blue?.[500] || fallbackColors.low
  };
  return colors[severity] || theme.colors.gray?.[400] || '#6B7280';
};

const getSeverityBackground = (severity, theme = {}) => {
  // Provide fallback background colors if theme is not available
  const fallbackBackgrounds = {
    critical: '#FEF2F2',
    high: '#FFF7ED',
    medium: '#FEFCE8',
    low: '#EFF6FF'
  };
  
  if (!theme.colors) {
    return fallbackBackgrounds[severity] || '#F9FAFB';
  }
  
  const backgrounds = {
    critical: theme.colors.red?.[50] || fallbackBackgrounds.critical,
    high: theme.colors.orange?.[50] || fallbackBackgrounds.high,
    medium: theme.colors.yellow?.[50] || fallbackBackgrounds.medium,
    low: theme.colors.blue?.[50] || fallbackBackgrounds.low
  };
  return backgrounds[severity] || theme.colors.gray?.[50] || '#F9FAFB';
};

const getSeverityBorder = (severity, theme = {}) => {
  // Provide fallback border colors if theme is not available
  const fallbackBorders = {
    critical: '#FECACA',
    high: '#FED7AA',
    medium: '#FEF08A',
    low: '#BFDBFE'
  };
  
  if (!theme.colors) {
    return fallbackBorders[severity] || '#E5E7EB';
  }
  
  const borders = {
    critical: theme.colors.red?.[200] || fallbackBorders.critical,
    high: theme.colors.orange?.[200] || fallbackBorders.high,
    medium: theme.colors.yellow?.[200] || fallbackBorders.medium,
    low: theme.colors.blue?.[200] || fallbackBorders.low
  };
  return borders[severity] || theme.colors.gray?.[200] || '#E5E7EB';
};

const InventoryHealthOverview = ({
  inventoryData = {},
  alerts = [],
  insights = [],
  onCategoryClick,
  onAlertClick,
  onInsightClick,
  onRefresh,
  loading = false,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  
  // Mock data structure for demonstration
  const defaultData = {
    overallHealth: 78,
    totalProducts: 1247,
    totalValue: 485600,
    categories: [
      {
        id: 'electronics',
        name: 'Electronics',
        icon: 'laptop',
        health: 85,
        stockLevel: 92,
        turnoverRate: 78,
        expiredItems: 2,
        lowStockItems: 8,
        issues: [
          { type: 'low-stock', text: '8 items below reorder point', severity: 'medium' },
          { type: 'expiring', text: '2 items expiring soon', severity: 'low' }
        ]
      },
      {
        id: 'groceries',
        name: 'Groceries',
        icon: 'shopping-cart',
        health: 72,
        stockLevel: 68,
        turnoverRate: 85,
        expiredItems: 15,
        lowStockItems: 23,
        issues: [
          { type: 'expired', text: '15 expired items need removal', severity: 'critical' },
          { type: 'low-stock', text: '23 items critically low', severity: 'high' }
        ]
      },
      {
        id: 'clothing',
        name: 'Clothing',
        icon: 'shirt',
        health: 82,
        stockLevel: 75,
        turnoverRate: 65,
        expiredItems: 0,
        lowStockItems: 12,
        issues: [
          { type: 'seasonal', text: 'Seasonal items need clearance', severity: 'medium' },
          { type: 'slow-moving', text: '12 slow-moving items', severity: 'low' }
        ]
      },
      {
        id: 'home-garden',
        name: 'Home & Garden',
        icon: 'home',
        health: 65,
        stockLevel: 55,
        turnoverRate: 45,
        expiredItems: 8,
        lowStockItems: 31,
        issues: [
          { type: 'overstock', text: 'Significant overstock detected', severity: 'high' },
          { type: 'low-demand', text: 'Poor performance this quarter', severity: 'medium' }
        ]
      }
    ],
    ...inventoryData
  };

  const defaultAlerts = [
    {
      id: 'alert-1',
      title: 'Critical Stock Shortage',
      description: 'iPhone 15 Pro models are critically low (2 units remaining)',
      severity: 'critical',
      time: '5 minutes ago',
      category: 'stock'
    },
    {
      id: 'alert-2', 
      title: 'Expired Products Detected',
      description: '15 dairy products have expired and need immediate removal',
      severity: 'high',
      time: '1 hour ago',
      category: 'expiry'
    },
    {
      id: 'alert-3',
      title: 'Unusual Demand Pattern',
      description: 'Garden tools showing 300% increase in demand this week',
      severity: 'medium',
      time: '2 hours ago',
      category: 'demand'
    },
    ...alerts
  ];

  const defaultInsights = [
    {
      id: 'insight-1',
      text: 'Electronics category showing strong performance. Consider increasing Samsung Galaxy inventory by 15%.',
      confidence: 94,
      type: 'recommendation'
    },
    {
      id: 'insight-2', 
      text: 'Predicted 40% increase in grocery demand next week due to upcoming holiday. Prepare additional stock.',
      confidence: 87,
      type: 'forecast'
    },
    {
      id: 'insight-3',
      text: 'Home & Garden category underperforming. Recommend clearance sale for slow-moving items.',
      confidence: 91,
      type: 'optimization'
    },
    ...insights
  ];

  const currentData = { ...defaultData, ...inventoryData };
  const currentAlerts = alerts.length > 0 ? alerts : defaultAlerts;
  const currentInsights = insights.length > 0 ? insights : defaultInsights;

  return (
    <OverviewContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <MainPanel>
        <HealthCard 
          health={currentData.overallHealth}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <HealthHeader>
            <HealthTitle>
              <Icon name="activity" size={24} />
              <Typography variant="h4" weight="semibold">
                {t('inventory.health.title')}
              </Typography>
            </HealthTitle>
            <HealthScore>
              <ScoreValue score={currentData.overallHealth}>
                {currentData.overallHealth}
              </ScoreValue>
              <Typography variant="body2" color="secondary">
                /100
              </Typography>
              <Badge 
                variant={currentData.overallHealth >= 80 ? 'success' : currentData.overallHealth >= 60 ? 'warning' : 'danger'}
                size="sm"
              >
                {currentData.overallHealth >= 80 ? 'Excellent' : currentData.overallHealth >= 60 ? 'Good' : 'Needs Attention'}
              </Badge>
            </HealthScore>
          </HealthHeader>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <Typography variant="h5" weight="bold">
                {currentData.totalProducts?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="secondary">
                Total Products
              </Typography>
            </div>
            <div>
              <Typography variant="h5" weight="bold">
                ${currentData.totalValue?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="secondary">
                Total Value
              </Typography>
            </div>
          </div>

          <Progress 
            value={currentData.overallHealth} 
            variant="ai-glow"
            animated
            style={{ marginBottom: '1rem' }}
          />
        </HealthCard>

        <CategoryGrid>
          {currentData.categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onCategoryClick?.(category)}
            >
              <CategoryHeader>
                <CategoryTitle>
                  <Icon name={category.icon} size={20} />
                  <Typography variant="h6" weight="medium">
                    {category.name}
                  </Typography>
                </CategoryTitle>
                <Badge 
                  variant={category.health >= 80 ? 'success' : category.health >= 60 ? 'warning' : 'danger'}
                  size="sm"
                >
                  {category.health}%
                </Badge>
              </CategoryHeader>

              <CategoryMetrics>
                <MetricItem>
                  <MetricValue type="stock">{category.stockLevel}%</MetricValue>
                  <MetricLabel>Stock Level</MetricLabel>
                </MetricItem>
                <MetricItem>
                  <MetricValue type="turnover">{category.turnoverRate}%</MetricValue>
                  <MetricLabel>Turnover Rate</MetricLabel>
                </MetricItem>
              </CategoryMetrics>

              <ProgressSection>
                <Progress 
                  value={category.health} 
                  size="sm"
                  variant={category.health >= 80 ? 'success' : category.health >= 60 ? 'warning' : 'danger'}
                />
              </ProgressSection>

              {category.issues && category.issues.length > 0 && (
                <IssuesList>
                  {category.issues.slice(0, 2).map((issue, issueIndex) => (
                    <IssueItem
                      key={`${category.id}-${issue.type}-${issueIndex}`}
                      severity={issue.severity}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: issueIndex * 0.1 }}
                    >
                      <Icon 
                        name={issue.severity === 'critical' ? 'alert-triangle' : 
                              issue.severity === 'high' ? 'warning' : 
                              issue.severity === 'medium' ? 'info' : 'bell'} 
                        size={14} 
                        color={getSeverityColor(issue.severity, {})}
                      />
                      <Typography variant="caption">
                        {issue.text}
                      </Typography>
                    </IssueItem>
                  ))}
                </IssuesList>
              )}
            </CategoryCard>
          ))}
        </CategoryGrid>
      </MainPanel>

      <SidePanel>
        <AlertsPanel
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AlertHeader>
            <Typography variant="h6" weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="bell" size={20} />
              Recent Alerts
              <Badge variant="error" size="sm">
                {currentAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
              </Badge>
            </Typography>
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <Icon name="refresh" size={16} />
            </Button>
          </AlertHeader>
          
          <AlertsList>
            {currentAlerts.slice(0, 5).map((alert, index) => (
              <AlertItem
                key={alert.id}
                severity={alert.severity}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => onAlertClick?.(alert)}
              >
                <Icon 
                  name={alert.severity === 'critical' ? 'alert-triangle' : 
                        alert.severity === 'high' ? 'warning' : 'info'} 
                  size={16}
                  color={getSeverityColor(alert.severity, {})}
                />
                <AlertContent>
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                  <AlertTime>{alert.time}</AlertTime>
                </AlertContent>
              </AlertItem>
            ))}
          </AlertsList>
        </AlertsPanel>

        <InsightsPanel
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Typography variant="h6" weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Icon name="brain" size={20} />
            AI Insights
          </Typography>
          
          {currentInsights.slice(0, 3).map((insight, index) => (
            <InsightItem
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onInsightClick?.(insight)}
            >
              <AIIcon>AI</AIIcon>
              <div style={{ flex: 1 }}>
                <Typography variant="body2" style={{ lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  {insight.text}
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant="info" size="sm">
                    {insight.confidence}% confidence
                  </Badge>
                  <Typography variant="caption" color="secondary">
                    {insight.type}
                  </Typography>
                </div>
              </div>
            </InsightItem>
          ))}
        </InsightsPanel>
      </SidePanel>
    </OverviewContainer>
  );
};

export default InventoryHealthOverview;