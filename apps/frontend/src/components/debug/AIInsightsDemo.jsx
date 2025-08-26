// AIInsightsDemo Component
// Demonstrates AIInsightsPanel functionality with various examples
import React, { useState } from 'react';
import styled from 'styled-components';
import AIInsightsPanel, { InsightTypes, InsightPriority, InsightConfidence } from '../organisms/AIInsightsPanel';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';

const DemoContainer = styled.div`
  position: fixed;
  top: 210px;
  left: 20px;
  width: 500px;
  max-height: 70vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  ${({ theme }) => theme.breakpoints.mobile} {
    width: calc(100vw - 40px);
    left: 20px;
    right: 20px;
  }
`;

const ControlsSection = styled.div`
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const AIInsightsDemo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState('full');
  const [columns, setColumns] = useState(1);

  const sampleInsights = [
    {
      id: 'insight-1',
      title: 'Critical Stock Alert',
      description: 'iPhone 14 Pro inventory will be depleted in 2 days based on current sales velocity. Immediate reordering recommended.',
      type: InsightTypes.INVENTORY,
      priority: InsightPriority.CRITICAL,
      confidence: InsightConfidence.HIGH,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      metrics: [
        { label: 'Days Left', value: '2', color: '#EF4444' },
        { label: 'Current Stock', value: '8', color: '#F97316' },
        { label: 'Daily Sales', value: '4.2', color: '#3B82F6' }
      ],
      recommendation: 'Order 50 units immediately to avoid stockout',
      actions: [
        {
          id: 'reorder',
          label: 'Quick Reorder',
          icon: 'shopping-cart',
          variant: 'filled',
          color: 'primary',
          onClick: () => console.log('Quick reorder triggered')
        },
        {
          id: 'adjust-forecast',
          label: 'Adjust Forecast',
          icon: 'TrendingUp',
          variant: 'outline',
          onClick: () => console.log('Adjust forecast triggered')
        }
      ]
    },
    {
      id: 'insight-2',
      title: 'Revenue Optimization Opportunity',
      description: 'Customers purchasing coffee beans show 85% likelihood to buy milk within 3 days. Cross-selling campaign could increase revenue by 12%.',
      type: InsightTypes.SALES,
      priority: InsightPriority.HIGH,
      confidence: InsightConfidence.HIGH,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metrics: [
        { label: 'Revenue Lift', value: '12%', color: '#10B981' },
        { label: 'Confidence', value: '85%', color: '#3B82F6' },
        { label: 'Potential', value: '$2.4K', color: '#059669' }
      ],
      recommendation: 'Create targeted bundle offer for coffee + milk products',
      actions: [
        {
          id: 'create-campaign',
          label: 'Create Campaign',
          icon: 'Target',
          variant: 'filled',
          color: 'success',
          onClick: () => console.log('Create campaign triggered')
        }
      ]
    },
    {
      id: 'insight-3',
      title: 'Customer Behavior Pattern',
      description: 'Premium customers (top 20%) have shifted purchasing patterns. 40% decrease in electronics, 60% increase in home goods over last month.',
      type: InsightTypes.CUSTOMER,
      priority: InsightPriority.MEDIUM,
      confidence: InsightConfidence.MEDIUM,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      metrics: [
        { label: 'Electronics', value: '-40%', color: '#EF4444' },
        { label: 'Home Goods', value: '+60%', color: '#10B981' },
        { label: 'Affected', value: '128', color: '#3B82F6' }
      ],
      recommendation: 'Adjust inventory allocation based on shifting demand patterns',
      actions: [
        {
          id: 'view-trends',
          label: 'View Trends',
          icon: 'BarChart',
          variant: 'outline',
          onClick: () => console.log('View trends triggered')
        },
        {
          id: 'adjust-inventory',
          label: 'Adjust Inventory',
          icon: 'Package',
          variant: 'outline',
          onClick: () => console.log('Adjust inventory triggered')
        }
      ]
    },
    {
      id: 'insight-4',
      title: 'Cost Optimization Alert',
      description: 'Supplier A pricing increased 15% for electronics category. Alternative Supplier B offers same products 8% cheaper with comparable quality.',
      type: InsightTypes.COST,
      priority: InsightPriority.HIGH,
      confidence: InsightConfidence.MEDIUM,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      metrics: [
        { label: 'Cost Increase', value: '15%', color: '#EF4444' },
        { label: 'Alternative', value: '-8%', color: '#10B981' },
        { label: 'Savings', value: '$5.2K', color: '#059669' }
      ],
      recommendation: 'Switch to Supplier B for electronics category to reduce costs',
      actions: [
        {
          id: 'compare-suppliers',
          label: 'Compare',
          icon: 'GitCompare',
          variant: 'outline',
          onClick: () => console.log('Compare suppliers triggered')
        },
        {
          id: 'initiate-switch',
          label: 'Switch Supplier',
          icon: 'RefreshCw',
          variant: 'filled',
          color: 'warning',
          onClick: () => console.log('Switch supplier triggered')
        }
      ]
    },
    {
      id: 'insight-5',
      title: 'AI Model Performance Update',
      description: 'Demand prediction accuracy improved to 94.2% after incorporating seasonal patterns. Model confidence increased across all categories.',
      type: InsightTypes.PERFORMANCE,
      priority: InsightPriority.LOW,
      confidence: InsightConfidence.HIGH,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      metrics: [
        { label: 'Accuracy', value: '94.2%', color: '#10B981' },
        { label: 'Improvement', value: '+3.8%', color: '#059669' },
        { label: 'Categories', value: '12', color: '#3B82F6' }
      ],
      recommendation: 'Update forecasting parameters to leverage improved model performance',
      actions: [
        {
          id: 'view-model',
          label: 'View Details',
          icon: 'Eye',
          variant: 'outline',
          onClick: () => console.log('View model details triggered')
        }
      ]
    },
    {
      id: 'insight-6',
      title: 'Seasonal Demand Prediction',
      description: 'Holiday season approaching: Toys category expected to see 300% increase, Electronics 150% increase. Stock preparation window is 3 weeks.',
      type: InsightTypes.PREDICTION,
      priority: InsightPriority.HIGH,
      confidence: InsightConfidence.HIGH,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      metrics: [
        { label: 'Toys Increase', value: '300%', color: '#8B5CF6' },
        { label: 'Electronics', value: '150%', color: '#3B82F6' },
        { label: 'Prep Time', value: '3w', color: '#F59E0B' }
      ],
      recommendation: 'Begin seasonal inventory buildup for high-demand categories',
      actions: [
        {
          id: 'seasonal-plan',
          label: 'Create Plan',
          icon: 'Calendar',
          variant: 'filled',
          color: 'primary',
          onClick: () => console.log('Create seasonal plan triggered')
        },
        {
          id: 'forecast-details',
          label: 'Forecast Details',
          icon: 'TrendingUp',
          variant: 'outline',
          onClick: () => console.log('Forecast details triggered')
        }
      ]
    }
  ];

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '210px',
          left: '20px',
          zIndex: 9998,
          padding: '8px 12px',
          fontSize: '12px'
        }}
      >
        Show AI Insights Demo
      </Button>
    );
  }

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleInsightClick = (insight, event) => {
    console.log('Insight clicked:', insight.title, event);
  };

  const handleActionClick = (action, insight, event) => {
    console.log('Action clicked:', action.label, 'for insight:', insight.title, event);
    if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <DemoContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant="h6">AI Insights Panel Demo</Typography>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="small"
        >
          ×
        </Button>
      </div>

      {/* Controls */}
      <ControlsSection>
        <Typography variant="subtitle2" style={{ width: '100%', marginBottom: '8px' }}>
          Controls:
        </Typography>
        
        <Button
          onClick={() => setVariant(variant === 'full' ? 'compact' : 'full')}
          variant={variant === 'full' ? 'filled' : 'outline'}
          size="small"
        >
          {variant === 'full' ? 'Full' : 'Compact'}
        </Button>
        
        <Button
          onClick={() => setColumns(columns === 1 ? 2 : 1)}
          variant="outline"
          size="small"
        >
          {columns} Column{columns > 1 ? 's' : ''}
        </Button>
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="small"
          loading={loading}
        >
          Refresh
        </Button>
      </ControlsSection>

      {/* AI Insights Panel */}
      <div style={{ width: '100%', minHeight: '400px' }}>
        <AIInsightsPanel
          insights={sampleInsights}
          loading={loading}
          variant={variant}
          columns={columns}
          expanded={true}
          interactive={true}
          showControls={true}
          showMetrics={true}
          sortBy="priority"
          onInsightClick={handleInsightClick}
          onActionClick={handleActionClick}
          onRefresh={handleRefresh}
        />
      </div>

      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px' }}>
        <Typography variant="caption" color="primary">
          💡 This demo showcases AI-powered insights with different types, priorities, and confidence levels. 
          All interactions are logged to console. Try clicking insights and action buttons!
        </Typography>
      </div>
    </DemoContainer>
  );
};

export default AIInsightsDemo;