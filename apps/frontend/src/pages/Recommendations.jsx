import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import DashboardGrid, { GridItem } from '../components/organisms/DashboardGrid';
import MetricCard from '../components/molecules/MetricCard';
import ChartContainer from '../components/organisms/ChartContainer';
import DataTable from '../components/organisms/DataTable';
import { useI18n } from '../hooks/useI18n';
import useRecommendationsStore from '../store/recommendationsStore';

const RecommendationsContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  min-height: 100vh;
  background: ${props => props.theme.colors.background.primary};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[4]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]};
  }
`;

const RecommendationsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[4]};
    margin-bottom: ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const RecommendationCard = styled(motion.div)`
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
    background: ${props => getRecommendationColor(props.priority, props.theme)};
  }
`;

const RecommendationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const RecommendationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.spacing[3]};
  background: ${props => getRecommendationBackground(props.type, props.theme)};
  color: ${props => getRecommendationIconColor(props.type, props.theme)};
  margin-right: ${props => props.theme.spacing[4]};
  flex-shrink: 0;
`;

const RecommendationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const RecommendationActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const MockChart = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, ${props => props.color}20, ${props => props.color}40);
  border-radius: ${props => props.theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      ${props => props.color}10 10px,
      ${props => props.color}10 20px
    );
  }
`;

const getRecommendationColor = (priority, theme) => {
  if (!theme || !theme.colors) {
    return '#0ea5e9'; // fallback primary-500
  }
  
  switch (priority) {
    case 'high': return theme.colors.red?.[500] || '#ef4444';
    case 'medium': return theme.colors.yellow?.[500] || '#eab308';
    default: return theme.colors.primary?.[500] || '#0ea5e9';
  }
};

const getRecommendationBackground = (type, theme) => {
  if (!theme || !theme.colors) {
    return '#f1f5f9'; // fallback gray-100
  }
  
  const backgrounds = {
    reorder: theme.colors.red?.[100] || '#fee2e2',
    pricing: theme.colors.green?.[100] || '#dcfce7',
    inventory: theme.colors.yellow?.[100] || '#fef3c7',
    demand: theme.colors.primary?.[100] || '#e0f2fe',
    supplier: (theme.colors.purple && theme.colors.purple[100]) || theme.colors.primary?.[100] || '#e0f2fe'
  };
  return backgrounds[type] || theme.colors.gray?.[100] || '#f1f5f9';
};

const getRecommendationIconColor = (type, theme) => {
  if (!theme || !theme.colors) {
    return '#475569'; // fallback gray-600
  }
  
  const colors = {
    reorder: theme.colors.red?.[600] || '#dc2626',
    pricing: theme.colors.green?.[600] || '#16a34a',
    inventory: theme.colors.yellow?.[600] || '#d97706',
    demand: theme.colors.primary?.[600] || '#0284c7',
    supplier: (theme.colors.purple && theme.colors.purple[600]) || theme.colors.primary?.[600] || '#0284c7'
  };
  return colors[type] || theme.colors.gray?.[600] || '#475569';
};

const getRecommendationIcon = (type) => {
  const icons = {
    reorder: 'warning',
    pricing: 'trending',
    inventory: 'products',
    demand: 'analytics',
    supplier: 'user'
  };
  return icons[type] || 'info';
};

const Recommendations = () => {
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState('30d');

  // Connect to recommendations store
  const {
    recommendations,
    loading,
    error,
    stats,
    fetchRecommendations,
    acceptRecommendation,
    dismissRecommendation,
    clearError
  } = useRecommendationsStore();

  // Fetch recommendations on component mount
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Use store data instead of mock data
  const mockRecommendations = [
    {
      id: 'REC-001',
      type: 'reorder',
      priority: 'high',
      title: t('recommendations.mockData.immediateReorderRequired'),
      description: t('recommendations.mockData.immediateReorderDesc'),
      impact: t('recommendations.mockData.preventLostSales'),
      confidence: 95,
      products: ['iPhone 14 Pro'],
      action: t('recommendations.mockData.reorderUnits'),
      estimatedValue: 25000,
      urgency: t('recommendations.mockData.within24Hours')
    },
    {
      id: 'REC-002',
      type: 'pricing',
      priority: 'medium',
      title: t('recommendations.mockData.priceOptimization'),
      description: t('recommendations.mockData.priceOptimizationDesc'),
      impact: t('recommendations.mockData.increaseProfitMargin'),
      confidence: 87,
      products: ['Samsung Galaxy S23'],
      action: t('recommendations.mockData.increasePrice'),
      estimatedValue: 8400,
      urgency: t('recommendations.mockData.within7Days')
    },
    {
      id: 'REC-003',
      type: 'inventory',
      priority: 'low',
      title: t('recommendations.mockData.inventoryRebalancing'),
      description: t('recommendations.mockData.inventoryRebalancingDesc'),
      impact: t('recommendations.mockData.optimizeStorageCosts'),
      confidence: 78,
      products: ['Nike Air Max 90'],
      action: t('recommendations.mockData.transferUnits'),
      estimatedValue: 1200,
      urgency: t('recommendations.mockData.within14Days')
    },
    {
      id: 'REC-004',
      type: 'demand',
      priority: 'medium',
      title: t('recommendations.mockData.seasonalDemandPreparation'),
      description: t('recommendations.mockData.seasonalDemandDesc'),
      impact: t('recommendations.mockData.captureSeasonalDemand'),
      confidence: 92,
      products: ['MacBook Air M2'],
      action: t('recommendations.mockData.stockUpUnits'),
      estimatedValue: 15000,
      urgency: t('recommendations.mockData.within10Days')
    },
    {
      id: 'REC-005',
      type: 'supplier',
      priority: 'low',
      title: t('recommendations.mockData.supplierDiversification'),
      description: t('recommendations.mockData.supplierDiversificationDesc'),
      impact: t('recommendations.mockData.reduceSupplyRisk'),
      confidence: 73,
      products: ['Sony WH-1000XM4'],
      action: t('recommendations.mockData.contactSuppliers'),
      estimatedValue: 5000,
      urgency: t('recommendations.mockData.within30Days')
    }
  ];

  // Metrics from store
  const metrics = [
    {
      title: t('recommendations.metrics.totalRecommendations'),
      value: stats.total,
      icon: 'trending',
      iconColor: 'primary',
      variant: 'compact'
    },
    {
      title: t('recommendations.metrics.highPriority'),
      value: stats.highPriority,
      icon: 'warning',
      iconColor: 'error',
      variant: 'compact'
    },
    {
      title: t('recommendations.metrics.potentialSavings'),
      value: stats.totalEstimatedValue,
      valueFormat: 'currency',
      icon: 'trending',
      iconColor: 'success',
      variant: 'compact'
    },
    {
      title: t('recommendations.metrics.avgConfidence'),
      value: Math.round(stats.avgConfidence),
      valueFormat: 'percentage',
      icon: 'checkCircle',
      iconColor: 'info',
      variant: 'compact'
    }
  ];

  const tableColumns = [
    {
      key: 'type',
      header: t('recommendations.columns.type'),
      width: '120px',
      render: (_, recommendation) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name={getRecommendationIcon(recommendation.type)} size={16} />
          <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
            {t(`recommendations.types.${recommendation.type}`)}
          </Typography>
        </div>
      )
    },
    {
      key: 'title',
      header: t('recommendations.columns.recommendation'),
      render: (_, recommendation) => (
        <div>
          <Typography variant="body2" weight="medium">
            {recommendation.title}
          </Typography>
          <Typography variant="caption" color="secondary">
            {recommendation.products.join(', ')}
          </Typography>
        </div>
      )
    },
    {
      key: 'priority',
      header: t('recommendations.columns.priority'),
      width: '100px',
      render: (_, recommendation) => (
        <Badge 
          variant={
            recommendation.priority === 'high' ? 'error' :
            recommendation.priority === 'medium' ? 'warning' : 'secondary'
          }
          size="sm"
        >
          {t(`recommendations.priority.${recommendation.priority}`)}
        </Badge>
      )
    },
    {
      key: 'confidence',
      header: t('recommendations.columns.confidence'),
      width: '100px',
      align: 'right',
      render: (_, recommendation) => (
        <Typography variant="body2" weight="medium">
          {recommendation.confidence}%
        </Typography>
      )
    },
    {
      key: 'impact',
      header: t('recommendations.columns.estValue'),
      width: '120px',
      align: 'right',
      render: (_, recommendation) => (
        <Typography variant="body2" weight="medium" color="success">
          ${recommendation.estimatedValue.toLocaleString()}
        </Typography>
      )
    },
    {
      key: 'urgency',
      header: t('recommendations.columns.urgency'),
      width: '120px',
      render: (_, recommendation) => (
        <Typography variant="caption" color="secondary">
          {recommendation.urgency}
        </Typography>
      )
    }
  ];

  const handleApplyRecommendation = async (recommendation) => {
    try {
      await acceptRecommendation(recommendation.id);
      // Show success notification in production
      console.log('Recommendation accepted:', recommendation.title);
    } catch (error) {
      console.error('Failed to accept recommendation:', error);
    }
  };

  const handleDismissRecommendation = async (recommendation) => {
    try {
      await dismissRecommendation(recommendation.id);
      // Show success notification in production
      console.log('Recommendation dismissed:', recommendation.title);
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchRecommendations();
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    }
  };

  const handleSettings = () => {
    console.log('Open AI settings');
  };

  return (
    <RecommendationsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <RecommendationsHeader>
        <HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="h3" weight="bold" color="primary">
              {t('recommendations.title')}
            </Typography>
            <Badge variant="info" size="sm">
              <Icon name="trending" size={12} />
              {t('recommendations.aiPowered')}
            </Badge>
          </div>
          <Typography variant="body1" color="secondary">
            {t('recommendations.description')}
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Button variant="secondary" size="sm" onClick={handleSettings}>
            <Icon name="settings" size={16} />
            {t('recommendations.aiSettings')}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRefresh} loading={loading}>
            <Icon name="refresh" size={16} />
            {t('recommendations.refresh')}
          </Button>
        </HeaderRight>
      </RecommendationsHeader>

      {/* Key Metrics */}
      <DashboardGrid columns={{ xs: 2, sm: 2, md: 4 }} spacing="lg" style={{ marginBottom: '48px' }}>
        {metrics.map((metric) => (
          <GridItem key={metric.title}>
            <MetricCard {...metric} />
          </GridItem>
        ))}
      </DashboardGrid>

      {/* High Priority Recommendations */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Typography variant="h5" weight="semibold">
            {t('recommendations.priorityRecommendations')}
          </Typography>
          <Badge variant="error" size="sm">
            {recommendations.filter(r => r.priority === 'high').length} {t('recommendations.urgent')}
          </Badge>
        </div>

        <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
          {recommendations.filter(r => r.priority === 'high').map((recommendation) => (
            <GridItem key={recommendation.id}>
              <RecommendationCard
                priority={recommendation.priority}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <RecommendationHeader>
                  <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                    <RecommendationIcon type={recommendation.type}>
                      <Icon name={getRecommendationIcon(recommendation.type)} size={24} />
                    </RecommendationIcon>
                    <RecommendationContent>
                      <Typography variant="h6" weight="semibold" style={{ marginBottom: '8px' }}>
                        {recommendation.title}
                      </Typography>
                      <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
                        {recommendation.description}
                      </Typography>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Typography variant="caption" color="tertiary">{t('recommendations.impact')}:</Typography>
                          <Typography variant="caption" weight="medium" color="success">
                            {recommendation.impact}
                          </Typography>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Typography variant="caption" color="tertiary">{t('recommendations.confidence')}:</Typography>
                          <Typography variant="caption" weight="medium">
                            {recommendation.confidence}%
                          </Typography>
                        </div>
                      </div>
                    </RecommendationContent>
                  </div>
                  <Badge variant={recommendation.priority === 'high' ? 'error' : 'warning'} size="sm">
                    {t(`recommendations.priority.${recommendation.priority}`)}
                  </Badge>
                </RecommendationHeader>
                
                <RecommendationActions>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApplyRecommendation(recommendation)}
                  >
                    <Icon name="checkCircle" size={16} />
                    {t('recommendations.apply')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDismissRecommendation(recommendation)}
                  >
                    {t('recommendations.dismiss')}
                  </Button>
                </RecommendationActions>
              </RecommendationCard>
            </GridItem>
          ))}
        </DashboardGrid>
      </div>

      {/* All Recommendations Table */}
      <div style={{ marginBottom: '48px' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '24px' }}>
          {t('recommendations.allRecommendations')}
        </Typography>
        
        <DataTable
          title={t('recommendations.tableTitle')}
          description={t('recommendations.tableDescription')}
          data={recommendations}
          columns={tableColumns}
          loading={loading}
          searchable
          searchPlaceholder={t('recommendations.searchPlaceholder')}
          sortable
          pagination
          pageSize={10}
          emptyStateTitle={t('recommendations.emptyStateTitle')}
          emptyStateDescription={t('recommendations.emptyStateDescription')}
          emptyStateIcon="trending"
          actions={[
            {
              id: 'apply',
              icon: 'checkCircle',
              label: t('recommendations.apply')
            },
            {
              id: 'dismiss',
              icon: 'close',
              label: t('recommendations.dismiss')
            },
            {
              id: 'details',
              icon: 'eye',
              label: t('recommendations.viewDetails')
            }
          ]}
          onAction={(actionId, recommendation) => {
            if (actionId === 'apply') {
              handleApplyRecommendation(recommendation);
            } else if (actionId === 'dismiss') {
              handleDismissRecommendation(recommendation);
            }
          }}
        />
      </div>

      {/* AI Performance Chart */}
      <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
        <GridItem>
          <ChartContainer
            title={t('recommendations.charts.recommendationAccuracy')}
            description={t('recommendations.charts.recommendationAccuracyDesc')}
            type="line"
            showTimeRange
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            refreshable
            onRefresh={handleRefresh}
            exportable
            badge="AI"
            showLegend
            legend={[
              { id: 'accuracy', label: t('recommendations.charts.accuracy'), color: '#3B82F6' },
              { id: 'target', label: t('recommendations.charts.target'), color: '#22C55E' }
            ]}
          >
            <MockChart color="#3B82F6">
              <Typography variant="h6" color="primary">
                {t('recommendations.charts.accuracyTrend')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>
        
        <GridItem>
          <ChartContainer
            title={t('recommendations.charts.savingsImpact')}
            description={t('recommendations.charts.savingsImpactDesc')}
            type="bar"
            refreshable
            onRefresh={handleRefresh}
            exportable
          >
            <MockChart color="#22C55E">
              <Typography variant="h6" color="success">
                {t('recommendations.charts.savingsByCategory')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>
      </DashboardGrid>
    </RecommendationsContainer>
  );
};

export default Recommendations;