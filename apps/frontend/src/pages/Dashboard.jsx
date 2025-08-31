import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import DashboardGrid, { GridItem, DASHBOARD_LAYOUTS } from '../components/organisms/DashboardGrid';
import MetricCard from '../components/molecules/MetricCard';
import AlertCard from '../components/molecules/AlertCard';
import ChartContainer from '../components/organisms/ChartContainer';
import PredictiveInventoryPanel from '../components/organisms/PredictiveInventoryPanel';
import InventoryHealthOverview from '../components/organisms/InventoryHealthOverview';
import InventoryOptimizationRecommendations from '../components/organisms/InventoryOptimizationRecommendations';
import SeasonalDemandForecasting from '../components/organisms/SeasonalDemandForecasting';
import CostAnalysisMarginOptimization from '../components/organisms/CostAnalysisMarginOptimization';
import ProductCatalogManagement from '../components/organisms/ProductCatalogManagement';
import CategoryTagManager from '../components/organisms/CategoryTagManager';
import PriceHistoryOptimization from '../components/organisms/PriceHistoryOptimization';
import ProductPerformanceAnalytics from '../components/organisms/ProductPerformanceAnalytics';
import StockDepletionTimeline from '../components/organisms/StockDepletionTimeline';
import AutomatedOrderSuggestions from '../components/organisms/AutomatedOrderSuggestions';
import SupplierIntegrationHub from '../components/organisms/SupplierIntegrationHub';
import BulkOrderGenerationInterface from '../components/organisms/BulkOrderGenerationInterface';
import RevenueStreamPanel from '../components/organisms/RevenueStreamPanel';
import LiveCustomerActivityFeed from '../components/organisms/LiveCustomerActivityFeed';
import LiveInventoryTracker from '../components/organisms/LiveInventoryTracker';
import RealTimeAlertNotifications from '../components/organisms/RealTimeAlertNotifications';
import LiveABTestResults from '../components/organisms/LiveABTestResults';
import DashboardRefreshControls from '../components/organisms/DashboardRefreshControls';
import RevenueStreamDebug from '../components/debug/RevenueStreamDebug';
import CustomerActivityDebug from '../components/debug/CustomerActivityDebug';
import InventoryChangeDebug from '../components/debug/InventoryChangeDebug';
import AlertNotificationDebug from '../components/debug/AlertNotificationDebug';
import ABTestResultsDebug from '../components/debug/ABTestResultsDebug';
import DashboardRefreshDebug from '../components/debug/DashboardRefreshDebug';
import RealTimeTeamActivity from '../components/organisms/RealTimeTeamActivity';
import TeamActivityDebug from '../components/debug/TeamActivityDebug';
import RealTimeCustomerBehavior from '../components/organisms/RealTimeCustomerBehavior';
import CustomerBehaviorDebug from '../components/debug/CustomerBehaviorDebug';
import LiveDashboardPerformanceMetrics from '../components/organisms/LiveDashboardPerformanceMetrics';
import PullToRefresh from '../components/molecules/PullToRefresh';
import MobileCarousel from '../components/molecules/MobileCarousel';
import { exportDashboardReport } from '../utils/exportUtils';
import { isTouchDevice } from '../utils/mobileGestures';
import { useI18n } from '../hooks/useI18n';
import useDashboardStore from '../store/dashboardStore';
import { useRealtimeDashboard } from '../hooks/useWebSocket';
import { useTeamActivity } from '../hooks/useTeamActivity';
import { useDynamicRefresh, useDynamicRefreshService } from '../hooks/useDynamicRefresh';
import inventoryService from '../services/inventoryService';
import customerBehaviorAnalytics from '../services/customerBehaviorAnalytics';
import useWebSocketStore from '../store/websocketStore';
import useCustomerBehaviorStore from '../store/customerBehaviorStore';
import { webSocketManager } from '../services/websocket';
import DynamicDashboardRefresh from '../components/organisms/DynamicDashboardRefresh';

const DashboardContainer = styled(motion.div)`
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

const DashboardHeader = styled.div`
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
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
    
    & > * {
      flex: 1;
    }
  }
`;

const AlertsSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const AlertsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  max-height: 400px;
  overflow-y: auto;
`;

const EmptyAlerts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
`;

// Mock chart component for demonstration
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

const Dashboard = () => {
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState('24h');
  
  // Dashboard store
  const { 
    metrics, 
    loading, 
    errors,
    realtimeData,
    fetchMetrics,
    refreshDashboard 
  } = useDashboardStore();
  
  // WebSocket real-time connection
  const {
    isConnected: wsConnected,
    isAuthenticated: wsAuthenticated,
    realtimeData: wsData
  } = useWebSocketStore();
  
  // Customer behavior analytics
  const {
    insights: customerInsights,
    segmentMigrations,
    consumptionPatterns,
    behaviorAlerts: churnAlerts,
    patterns: storeBehaviorPatterns
  } = useCustomerBehaviorStore();
  
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  
  // Inventory-specific state
  const [inventoryData, setInventoryData] = useState(null);
  const [inventoryForecasting, setInventoryForecasting] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  
  // Advanced analytics state
  const [aiInsights, setAiInsights] = useState([]);
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState(null);
  const [predictionAccuracy, setPredictionAccuracy] = useState(0.94);
  
  // Debug state
  const [showRevenueDebug, setShowRevenueDebug] = useState(import.meta.env.DEV);
  const [showInventoryDebug, setShowInventoryDebug] = useState(import.meta.env.DEV);
  const [showAlertDebug, setShowAlertDebug] = useState(import.meta.env.DEV);
  const [showABTestDebug, setShowABTestDebug] = useState(import.meta.env.DEV);
  const [showRefreshDebug, setShowRefreshDebug] = useState(import.meta.env.DEV);
  const [showTeamActivityDebug, setShowTeamActivityDebug] = useState(import.meta.env.DEV);
  const [showCustomerBehaviorDebug, setShowCustomerBehaviorDebug] = useState(import.meta.env.DEV);

  // Enable real-time dashboard updates
  useRealtimeDashboard();
  
  // Enable team activity tracking
  const { trackActivity } = useTeamActivity();

  // Dynamic refresh service integration
  const refreshService = useDynamicRefreshService();

  // Register main dashboard refresh
  const mainDashboardRefresh = useDynamicRefresh({
    widgetId: 'main-dashboard',
    widgetName: 'Main Dashboard Metrics',
    priority: 'high_priority',
    refreshCallback: async () => {
      await Promise.all([
        fetchMetrics(),
        fetchInventoryData(),
        fetchAdvancedAnalytics()
      ]);
    },
    autoStart: true
  });

  // Register inventory panel refresh  
  const inventoryRefresh = useDynamicRefresh({
    widgetId: 'inventory-panel',
    widgetName: 'Inventory Health Panel',
    priority: 'high_priority',
    refreshCallback: async () => {
      await fetchInventoryData();
    },
    dependencies: ['main-dashboard'],
    autoStart: true
  });

  // Register analytics refresh
  const analyticsRefresh = useDynamicRefresh({
    widgetId: 'analytics-panel',
    widgetName: 'AI Analytics Panel',
    priority: 'medium_priority',
    refreshCallback: async () => {
      await fetchAdvancedAnalytics();
    },
    customInterval: 45000, // 45 seconds for analytics
    autoStart: true
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchMetrics();
    fetchInventoryData();
    fetchAdvancedAnalytics();
  }, [fetchMetrics]);
  
  // Connect WebSocket and request real-time data
  useEffect(() => {
    if (wsConnected && wsAuthenticated) {
      webSocketManager.requestDashboardMetrics();
      webSocketManager.subscribeToAlerts();
    }
  }, [wsConnected, wsAuthenticated]);
  
  // Process real-time WebSocket data
  useEffect(() => {
    if (wsData?.notifications?.length > 0) {
      setRealtimeAlerts(prevAlerts => [
        ...wsData.notifications.slice(0, 10),
        ...prevAlerts.slice(0, 20)
      ]);
    }
  }, [wsData]);

  // Fetch inventory data and forecasting
  const fetchInventoryData = async () => {
    try {
      setInventoryLoading(true);
      const [overview, forecasting] = await Promise.all([
        inventoryService.getInventoryOverview({ 
          timeRange: '30d',
          includeMetrics: true,
          includeAlerts: true,
          includeAIInsights: true
        }),
        inventoryService.getInventoryForecasting({
          timeHorizon: '60d',
          includeReorderPoints: true,
          includeSeasonality: true,
          includeAIPredictions: true
        })
      ]);
      
      setInventoryData(overview);
      setInventoryForecasting(forecasting?.forecasting?.products || []);
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setInventoryLoading(false);
    }
  };
  
  // Fetch advanced AI analytics
  const fetchAdvancedAnalytics = async () => {
    try {
      const [insights, patterns] = await Promise.all([
        customerBehaviorAnalytics.getRealtimeInsights({ limit: 20 }),
        customerBehaviorAnalytics.getBehaviorPatterns({ timeRange: '7d' })
      ]);
      
      setAiInsights(insights?.insights || []);
      setBehaviorPatterns(patterns?.patterns || null);
    } catch (error) {
      console.error('Failed to fetch advanced analytics:', error);
    }
  };

  // Transform real dashboard data with AI insights for display
  const displayMetrics = useMemo(() => {
    if (!metrics.inventory) return [];
    
    const revenueValue = metrics.revenue?.current || metrics.inventory?.totalValue || 0;
    const aiRevenueInsight = aiInsights.find(insight => insight.type === 'revenue_optimization');
    
    return [
      {
        title: t('dashboard.totalRevenue'),
        value: revenueValue,
        valueFormat: 'currency',
        change: metrics.revenue?.change || 0,
        trend: metrics.revenue?.trend || 'neutral',
        icon: 'trending',
        iconColor: 'success',
        target: 250000,
        progress: (revenueValue / 250000) * 100,
        aiInsight: aiRevenueInsight?.insight || null,
        confidence: aiRevenueInsight?.confidence || null
      },
      {
        title: t('dashboard.totalItems'),
        value: metrics.inventory?.totalItems || 0,
        change: wsData?.inventoryUpdates ? Object.keys(wsData.inventoryUpdates).length : 0,
        trend: 'up',
        icon: 'products',
        iconColor: 'primary',
        badge: t('dashboard.badges.live'),
        realtime: true
      },
      {
        title: t('dashboard.lowStock'),
        value: metrics.inventory?.lowStockItems || 0,
        change: realtimeAlerts.filter(a => a.type === 'low_stock').length,
        trend: metrics.inventory?.lowStockItems > 10 ? 'up' : 'down',
        icon: 'warning',
        iconColor: 'warning',
        variant: 'compact',
        urgent: metrics.inventory?.lowStockItems > 15
      },
      {
        title: t('dashboard.totalOrders'),
        value: metrics.orders?.current || 0,
        change: metrics.orders?.change || 0,
        trend: metrics.orders?.trend || 'neutral',
        icon: 'checkCircle',
        iconColor: 'success',
        variant: 'compact',
        aiPrediction: behaviorPatterns?.orderPrediction || null
      }
    ];
  }, [metrics, t]);

  // Combine real-time alerts with AI insights
  const recentAlerts = useMemo(() => {
    const alerts = [];
    
    // Add real-time WebSocket alerts
    realtimeAlerts.forEach(alert => {
      alerts.push({
        id: alert.id || `rt-${Date.now()}`,
        severity: alert.priority === 'critical' ? 'error' : alert.priority === 'high' ? 'warning' : 'info',
        title: alert.title || alert.type,
        message: alert.message || alert.insight,
        category: alert.category || 'Real-time',
        timestamp: new Date(alert.timestamp),
        read: false,
        source: 'websocket',
        aiGenerated: true
      });
    });
    
    // Add customer behavior insights as alerts
    if (customerInsights?.anomalies && Array.isArray(customerInsights.anomalies)) {
      customerInsights.anomalies.slice(0, 3).forEach(insight => {
        alerts.push({
          id: insight.id || `anomaly-${Date.now()}-${Math.random()}`,
          severity: insight.severity || 'warning',
          title: `Customer Anomaly: ${insight.type || 'Behavior Pattern'}`,
          message: insight.description || insight.message || 'Unusual behavior detected',
          category: 'Customer Behavior',
          timestamp: new Date(insight.timestamp || Date.now()),
          read: false,
          source: 'ai',
          aiGenerated: true,
          customerId: insight.customerId
        });
      });
    }
    
    // Add trending insights
    if (customerInsights?.trends && Array.isArray(customerInsights.trends)) {
      customerInsights.trends.slice(0, 2).forEach(trend => {
        alerts.push({
          id: `trend-${Date.now()}-${Math.random()}`,
          severity: trend.direction === 'down' ? 'warning' : 'info',
          title: `Customer Trend: ${trend.metric}`,
          message: trend.description || `${trend.metric} trend detected`,
          category: 'Customer Analytics',
          timestamp: new Date(),
          read: false,
          source: 'ai',
          aiGenerated: true
        });
      });
    }
    
    // Add churn risk alerts
    churnAlerts.slice(0, 3).forEach(alert => {
      alerts.push({
        id: alert.id,
        severity: alert.riskLevel === 'critical' ? 'error' : 'warning',
        title: `Churn Risk Alert`,
        message: `Customer ${alert.customerId} at ${alert.riskLevel} risk (${(alert.riskScore * 100).toFixed(1)}%)`,
        category: 'Customer Retention',
        timestamp: new Date(alert.timestamp),
        read: false,
        source: 'ai',
        aiGenerated: true,
        customerId: alert.customerId
      });
    });
    
    // Sort by timestamp (newest first) and take top 10
    return alerts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, [realtimeAlerts, customerInsights, churnAlerts]);

  const handleRefresh = async () => {
    setLoading(true);
    
    // Track dashboard refresh activity
    trackActivity('dashboard_view', {
      action: 'Manually refreshed dashboard',
      details: 'User initiated dashboard refresh',
      category: 'dashboard',
      priority: 'normal'
    });
    
    await Promise.all([
      refreshDashboard(),
      fetchInventoryData()
    ]);
    setLoading(false);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    handleRefresh();
  };

  const handleExport = () => {
    const dashboardData = {
      metrics: metrics,
      alerts: recentAlerts,
      timestamp: new Date().toISOString()
    };
    
    exportDashboardReport(dashboardData, `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`, {
      title: t('common.dashboardReportTitle'),
      includeMetrics: true,
      includeAlerts: true,
      includeTimestamp: true
    });
  };

  const handleAlertClick = (alert) => {
    console.log('Alert clicked:', alert);
  };

  // Inventory panel handlers
  const handleInventoryOrderGenerate = async (product) => {
    try {
      console.log('Generating order for:', product);
      // Integration with order management system would go here
      // For now, just show success feedback
    } catch (error) {
      console.error('Failed to generate order:', error);
    }
  };

  const handleInventoryBulkAction = async (action, products) => {
    try {
      console.log('Bulk action:', action, products);
      // Integration with inventory service for bulk actions
      if (action === 'generate_orders') {
        // Bulk order generation logic
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const handleInventoryCategoryClick = (category) => {
    console.log('Inventory category clicked:', category);
    // Navigate to category details or show category-specific view
  };

  const handleInventoryInsightClick = (insight) => {
    console.log('Inventory insight clicked:', insight);
    // Show detailed insight or navigate to relevant section
  };

  // Optimization recommendations handlers
  const handleOptimizationImplement = async (recommendation) => {
    try {
      console.log('Implementing optimization recommendation:', recommendation);
      // In a real implementation, this would:
      // 1. Create implementation tasks
      // 2. Update inventory policies
      // 3. Trigger automated processes
      // 4. Create audit trail
      // Show success notification
    } catch (error) {
      console.error('Failed to implement optimization:', error);
      // Show error notification
    }
  };

  const handleOptimizationDismiss = (recommendation) => {
    console.log('Dismissing optimization recommendation:', recommendation);
    // In a real implementation, this would:
    // 1. Mark recommendation as dismissed
    // 2. Update AI model feedback
    // 3. Create audit entry
  };

  const handleOptimizationDetails = (recommendation) => {
    console.log('Viewing optimization recommendation details:', recommendation);
    // In a real implementation, this would:
    // 1. Navigate to detailed recommendation view
    // 2. Show impact analysis
    // 3. Display implementation plan
    // 4. Show historical data and reasoning
  };

  // Seasonal forecasting handlers
  const handleSeasonalAdjust = async (pattern) => {
    try {
      console.log('Applying seasonal adjustment:', pattern);
      // In a real implementation, this would:
      // 1. Apply seasonal multipliers to inventory levels
      // 2. Update reorder points based on seasonal patterns
      // 3. Adjust safety stock for peak periods
      // 4. Create seasonal ordering schedules
      // 5. Update supplier lead time expectations
    } catch (error) {
      console.error('Failed to apply seasonal adjustment:', error);
    }
  };

  const handlePatternUpdate = (pattern) => {
    console.log('Updating seasonal pattern:', pattern);
    // In a real implementation, this would:
    // 1. Update machine learning models with new pattern data
    // 2. Recalculate forecasting accuracy
    // 3. Adjust future predictions
    // 4. Create audit trail of pattern changes
  };

  const handleExportForecast = (forecastData) => {
    console.log('Exporting forecast data:', forecastData);
    // In a real implementation, this would:
    // 1. Generate comprehensive forecast report
    // 2. Include seasonal patterns and recommendations
    // 3. Export to Excel/PDF format
    // 4. Schedule automated forecast reports
  };

  // Cost analysis handlers
  const handleCostOptimizationApply = async (optimization) => {
    try {
      console.log('Applying cost optimization:', optimization);
      // In a real implementation, this would:
      // 1. Create implementation plan for cost optimization
      // 2. Schedule optimization activities
      // 3. Track ROI and savings progress
      // 4. Update cost models and projections
      // 5. Create audit trail of optimization decisions
    } catch (error) {
      console.error('Failed to apply cost optimization:', error);
    }
  };

  const handleCostAnalyze = (category) => {
    console.log('Analyzing cost category:', category);
    // In a real implementation, this would:
    // 1. Navigate to detailed cost breakdown view
    // 2. Show historical cost trends
    // 3. Display cost drivers and factors
    // 4. Present optimization opportunities
    // 5. Generate category-specific recommendations
  };

  const handleCostReportExport = (costData) => {
    console.log('Exporting cost analysis report:', costData);
    // In a real implementation, this would:
    // 1. Generate comprehensive cost analysis report
    // 2. Include margin analysis and optimization recommendations
    // 3. Export to Excel/PDF with charts and tables
    // 4. Schedule automated cost reports
    // 5. Send to stakeholders and finance team
  };

  // Product catalog handlers
  const handleProductCreate = () => {
    console.log('Creating new product');
    // In a real implementation, this would:
    // 1. Open product creation modal/form
    // 2. Validate product data
    // 3. Submit to inventory service
    // 4. Refresh product list
    // 5. Show success notification
  };

  const handleProductEdit = (product) => {
    console.log('Editing product:', product);
    // In a real implementation, this would:
    // 1. Open product edit modal/form with pre-filled data
    // 2. Allow modifications to product details
    // 3. Validate and submit changes
    // 4. Update product in catalog
    // 5. Refresh product list
  };

  const handleProductDelete = (product) => {
    console.log('Deleting product:', product);
    // In a real implementation, this would:
    // 1. Show confirmation dialog
    // 2. Delete product from inventory
    // 3. Update related orders and forecasts
    // 4. Remove from catalog
    // 5. Show success notification
  };

  const handleProductView = (product) => {
    console.log('Viewing product details:', product);
    // In a real implementation, this would:
    // 1. Navigate to product detail page
    // 2. Show detailed product information
    // 3. Display inventory levels and history
    // 4. Show sales analytics and performance
    // 5. Present related products and recommendations
  };

  const handleProductBulkAction = (action, products) => {
    console.log('Bulk action:', action, 'on products:', products);
    // In a real implementation, this would:
    // 1. Process bulk operations (delete, export, update status)
    // 2. Show progress indicator for large operations
    // 3. Validate permissions for bulk actions
    // 4. Update all affected products
    // 5. Generate bulk operation report
  };

  // Category management handlers
  const handleCategoryCreate = (category) => {
    console.log('Creating new category:', category);
    // In a real implementation, this would:
    // 1. Validate category data and hierarchy
    // 2. Submit to inventory service
    // 3. Update category tree structure
    // 4. Refresh product categorization
    // 5. Show success notification
  };

  const handleCategoryEdit = (category) => {
    console.log('Editing category:', category);
    // In a real implementation, this would:
    // 1. Update category details and metadata
    // 2. Maintain parent-child relationships
    // 3. Update all associated products
    // 4. Refresh category tree
    // 5. Show success notification
  };

  const handleCategoryDelete = (category) => {
    console.log('Deleting category:', category);
    // In a real implementation, this would:
    // 1. Check for associated products and subcategories
    // 2. Handle category migration or orphaned items
    // 3. Remove from category hierarchy
    // 4. Update product associations
    // 5. Show success notification and impact summary
  };

  // Tag management handlers
  const handleTagCreate = (tag) => {
    console.log('Creating new tag:', tag);
    // In a real implementation, this would:
    // 1. Validate tag uniqueness and format
    // 2. Submit to inventory service
    // 3. Add to tag suggestions for products
    // 4. Update tag analytics
    // 5. Show success notification
  };

  const handleTagEdit = (tag) => {
    console.log('Editing tag:', tag);
    // In a real implementation, this would:
    // 1. Update tag metadata and appearance
    // 2. Maintain tag associations with products
    // 3. Update tag analytics and usage stats
    // 4. Refresh tag suggestions
    // 5. Show success notification
  };

  const handleTagDelete = (tag) => {
    console.log('Deleting tag:', tag);
    // In a real implementation, this would:
    // 1. Remove tag from all associated products
    // 2. Update product search indices
    // 3. Clean up tag analytics data
    // 4. Remove from tag suggestions
    // 5. Show success notification and impact summary
  };

  // Price history and optimization handlers
  const handlePriceUpdate = (priceUpdate) => {
    console.log('Updating product price:', priceUpdate);
    // In a real implementation, this would:
    // 1. Validate price change and business rules
    // 2. Submit price update to inventory service
    // 3. Record price change in history with reason
    // 4. Analyze impact on margins and forecasts
    // 5. Send notifications to stakeholders if needed
    // 6. Update price optimization recommendations
  };

  const handleOptimizationApply = (optimization) => {
    console.log('Applying price optimization:', optimization);
    // In a real implementation, this would:
    // 1. Validate optimization recommendation
    // 2. Apply price changes with scheduling if needed
    // 3. Set up monitoring for impact measurement
    // 4. Update forecasting models with new prices
    // 5. Track optimization effectiveness
    // 6. Generate optimization report
  };

  const handleAnalysisRequest = (analysisParams) => {
    console.log('Requesting price analysis:', analysisParams);
    // In a real implementation, this would:
    // 1. Submit analysis request with parameters
    // 2. Trigger AI-powered price analysis
    // 3. Generate competitive positioning report
    // 4. Update optimization recommendations
    // 5. Refresh price history and trends
    // 6. Show analysis results in dashboard
  };

  // Product performance analytics handlers
  const handleProductSelect = (product) => {
    console.log('Selecting product for detailed analysis:', product);
    // In a real implementation, this would:
    // 1. Navigate to detailed product analytics page
    // 2. Load comprehensive product performance data
    // 3. Show historical trends and forecasts
    // 4. Display customer feedback and ratings
    // 5. Generate personalized improvement recommendations
    // 6. Enable direct product management actions
  };

  const handleAnalyticsExport = (exportData) => {
    console.log('Exporting analytics report:', exportData);
    // In a real implementation, this would:
    // 1. Generate comprehensive analytics report
    // 2. Include charts, tables, and insights
    // 3. Apply user-selected filters and timeframes
    // 4. Format data for Excel/PDF export
    // 5. Include executive summary and recommendations
    // 6. Download file or send via email
  };

  const handleAnalyticsOptimization = (optimizationRequest) => {
    console.log('Requesting analytics-based optimization:', optimizationRequest);
    // In a real implementation, this would:
    // 1. Trigger AI analysis of performance patterns
    // 2. Generate optimization recommendations
    // 3. Identify underperforming products for action
    // 4. Suggest inventory adjustments and pricing changes
    // 5. Create implementation roadmap with priorities
    // 6. Schedule follow-up performance monitoring
  };

  const allComponents = [
    <InventoryHealthOverview
      key="inventory-health"
      inventoryData={inventoryData?.overview}
      alerts={inventoryData?.alerts?.alerts || []}
      insights={inventoryData?.insights || []}
      onCategoryClick={handleInventoryCategoryClick}
      onAlertClick={handleAlertClick}
      onInsightClick={handleInventoryInsightClick}
      onRefresh={fetchInventoryData}
      loading={inventoryLoading}
    />,
    <PredictiveInventoryPanel
      key="predictive-inventory"
      data={inventoryForecasting}
      onOrderGenerate={handleInventoryOrderGenerate}
      onBulkAction={handleInventoryBulkAction}
      loading={inventoryLoading}
    />,
    <ChartContainer
      key="inventory-trend"
      title={t('dashboard.charts.inventoryValueTrend')}
      description={t('dashboard.charts.inventoryValueTrendDesc')}
      type="line"
      badge={t('dashboard.badges.live')}
      showTimeRange
      timeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      refreshable
      onRefresh={handleRefresh}
      exportable
      loading={loading}
      lastUpdated={lastUpdated}
    >
      <MockChart color="#3B82F6">
        <Typography variant="h6" color="primary">
          {t('dashboard.charts.lineChartPlaceholder')}
        </Typography>
      </MockChart>
    </ChartContainer>,
    
    <ChartContainer
      key="category-breakdown"
      title={t('dashboard.charts.categoryBreakdown')}
      description={t('dashboard.charts.categoryBreakdownDesc')}
      type="pie"
      refreshable
      onRefresh={handleRefresh}
      showLegend
      legend={[
        { id: 'electronics', label: t('dashboard.categories.electronics'), color: '#3B82F6' },
        { id: 'clothing', label: t('dashboard.categories.clothing'), color: '#10B981' },
        { id: 'food', label: t('dashboard.categories.food'), color: '#F59E0B' },
        { id: 'books', label: t('dashboard.categories.books'), color: '#EF4444' }
      ]}
      exportable
    >
      <MockChart color="#10B981">
        <Typography variant="h6" color="success">
          {t('dashboard.charts.pieChartPlaceholder')}
        </Typography>
      </MockChart>
    </ChartContainer>,
    
    <ChartContainer
      key="stock-levels"
      title={t('dashboard.charts.stockLevelsByLocation')}
      description={t('dashboard.charts.stockLevelsByLocationDesc')}
      type="bar"
      refreshable
      onRefresh={handleRefresh}
      exportable
      loading={loading}
    >
      <MockChart color="#F59E0B">
        <Typography variant="h6" color="warning">
          {t('dashboard.charts.barChartPlaceholder')}
        </Typography>
      </MockChart>
    </ChartContainer>,
    
    <ChartContainer
      key="demand-forecast"
      title={t('dashboard.charts.demandForecast')}
      description={t('dashboard.charts.demandForecastDesc')}
      type="area"
      badge={t('dashboard.badges.ai')}
      showTimeRange
      timeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      refreshable
      onRefresh={handleRefresh}
      exportable
      showLegend
      legend={[
        { id: 'actual', label: t('dashboard.chartLegends.actualDemand'), color: '#8B5CF6' },
        { id: 'forecast', label: t('dashboard.chartLegends.forecasted'), color: '#06B6D4' },
        { id: 'confidence', label: t('dashboard.chartLegends.confidenceRange'), color: '#84CC16' }
      ]}
    >
      <MockChart color="#8B5CF6">
        <Typography variant="h6" color="brand">
          {t('dashboard.charts.areaChartPlaceholder')}
        </Typography>
      </MockChart>
    </ChartContainer>
  ];

  const dashboardContent = (
    <DashboardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <DashboardHeader>
        <HeaderLeft>
          <Typography variant="h3" weight="bold" color="primary">
            {t('dashboard.title')}
          </Typography>
          <Typography variant="body1" color="secondary">
            {t('dashboard.welcomeMessage')}
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            {t('common.lastUpdated')}: {lastUpdated}
          </Typography>
          
          <QuickActions>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              loading={loading}
            >
              <Icon name="refresh" size={16} />
              {t('common.refresh')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
            >
              <Icon name="download" size={16} />
              {t('common.export')}
            </Button>
          </QuickActions>
        </HeaderRight>
      </DashboardHeader>

      {/* Enhanced Metrics with AI Insights */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Typography variant="h5" weight="semibold">
            {t('dashboard.sections.keyMetrics')}
          </Typography>
          <Badge variant="success" size="sm" style={{ marginLeft: '0.5rem' }}>
            AI-Enhanced
          </Badge>
          {wsConnected && (
            <Badge variant="info" size="sm" style={{ marginLeft: '0.5rem' }}>
              Live
            </Badge>
          )}
          <Badge variant="secondary" size="sm" style={{ marginLeft: '0.5rem' }}>
            {(predictionAccuracy * 100).toFixed(1)}% Accuracy
          </Badge>
        </div>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          {displayMetrics.map((metric, index) => (
            <GridItem
              key={metric.title}
              span={index < 2 ? 2 : 1}
            >
              <MetricCard
                {...metric}
                clickable
                onClick={() => console.log('AI-enhanced metric clicked:', metric.title)}
                lastUpdated={wsConnected ? `Live` : `2 ${t('dashboard.minutesAgo')}`}
                showAIInsights={!!metric.aiInsight}
                enhanced={true}
              />
            </GridItem>
          ))}
        </DashboardGrid>
      </div>

      {/* Dynamic Dashboard Refresh Control Panel */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Typography variant="h5" weight="semibold">
            Dynamic Refresh Control
          </Typography>
          <Badge variant="success" size="sm" style={{ marginLeft: '0.5rem' }}>
            Live System
          </Badge>
          <Badge variant="secondary" size="sm" style={{ marginLeft: '0.5rem' }}>
            {refreshService.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <DynamicDashboardRefresh />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* AI-Enhanced Real-Time Analytics */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Typography variant="h5" weight="semibold">
            Real-Time Business Intelligence
          </Typography>
          <Badge variant="info" size="sm" style={{ marginLeft: '0.5rem' }}>
            AWS Bedrock
          </Badge>
          {mainDashboardRefresh.isRefreshing && (
            <Badge variant="warning" size="sm" style={{ marginLeft: '0.5rem' }}>
              Refreshing...
            </Badge>
          )}
        </div>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <RevenueStreamPanel 
              showAIPredictions={true}
              showConfidenceScores={true}
              aiInsights={aiInsights.filter(i => i.type === 'revenue_optimization')}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Live Customer Activity Feed */}
      <div style={{ marginBottom: '2rem' }}>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <LiveCustomerActivityFeed 
              maxItems={20}
              showStats={true}
              showFilters={true}
              onActivityClick={(activity) => console.log('Activity clicked:', activity)}
            />
          </GridItem>
          <GridItem span={4}>
            <LiveInventoryTracker 
              maxItems={50}
              showStats={true}
              showFilters={true}
              autoRefresh={true}
              onItemClick={(item) => console.log('Inventory item clicked:', item)}
            />
          </GridItem>
          <GridItem span={4}>
            <LiveABTestResults 
              maxTests={6}
              autoRefresh={true}
              showSummary={true}
              onTestClick={(test) => console.log('A/B test clicked:', test)}
            />
          </GridItem>
          <GridItem span={4}>
            <RealTimeTeamActivity 
              height={400}
              showPresence={true}
              showFilters={true}
              maxActivities={30}
            />
          </GridItem>
          <GridItem span={4}>
            <RealTimeCustomerBehavior 
              height={400}
              showInsights={true}
              showPatterns={true}
              maxBehaviors={50}
              autoRefresh={true}
            />
          </GridItem>
          <GridItem span={4}>
            <LiveDashboardPerformanceMetrics 
              height={400}
              showChart={false}
              showSuggestions={true}
              autoRefresh={true}
              refreshInterval={10000}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* AI-Powered Real-time Alerts */}
      <AlertsSection>
        <AlertsHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Typography variant="h5" weight="semibold">
              {t('alerts.title')}
            </Typography>
            <Badge variant="info" size="sm">AI-Powered</Badge>
            {wsConnected && <Badge variant="success" size="sm">Live</Badge>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="error" size="sm">
              {recentAlerts.filter(a => !a.read).length} {t('dashboard.newBadge')}
            </Badge>
            <Badge variant="secondary" size="sm">
              {recentAlerts.filter(a => a.aiGenerated).length} AI Generated
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('View all AI alerts')}
            >
              {t('common.viewAll')}
              <Icon name="chevronRight" size={14} />
            </Button>
          </div>
        </AlertsHeader>

        {recentAlerts.length > 0 ? (
          <AlertsList>
            {recentAlerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AlertCard
                  {...alert}
                  dismissible={!alert.read}
                  onClick={() => handleAlertClick(alert)}
                  onDismiss={() => console.log('Dismiss AI alert:', alert.id)}
                  showAIBadge={alert.aiGenerated}
                  showSource={true}
                  enhanced={true}
                  realtime={alert.source === 'websocket'}
                />
              </motion.div>
            ))}
          </AlertsList>
        ) : (
          <EmptyAlerts>
            <Icon name="brain" size={48} color="#3B82F6" />
            <div>
              <Typography variant="h6" weight="medium">
                AI Monitoring Active
              </Typography>
              <Typography variant="body2" color="secondary">
                No alerts detected. AI is continuously monitoring for anomalies.
              </Typography>
            </div>
          </EmptyAlerts>
        )}
      </AlertsSection>

      {/* Inventory Management Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem' }}>
          {t('dashboard.sections.inventoryManagement')}
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={2}>
            <InventoryHealthOverview
              inventoryData={inventoryData?.overview}
              alerts={inventoryData?.alerts?.alerts || []}
              insights={inventoryData?.insights || []}
              onCategoryClick={handleInventoryCategoryClick}
              onAlertClick={handleAlertClick}
              onInsightClick={handleInventoryInsightClick}
              onRefresh={fetchInventoryData}
              loading={inventoryLoading}
            />
          </GridItem>
          <GridItem span={2}>
            <PredictiveInventoryPanel
              data={inventoryForecasting}
              onOrderGenerate={handleInventoryOrderGenerate}
              onBulkAction={handleInventoryBulkAction}
              loading={inventoryLoading}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Stock Depletion Timeline Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem' }}>
          Stock Depletion Timeline
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <StockDepletionTimeline
              data={inventoryForecasting?.products || []}
              timeRange={30}
              onProductSelect={handleInventoryOrderGenerate}
              showFilters={true}
              showConfidence={true}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Automated Order Suggestions Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem' }}>
          AI-Powered Order Suggestions
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <AutomatedOrderSuggestions
              data={inventoryForecasting?.products || []}
              onOrderCreate={handleInventoryOrderGenerate}
              onBulkOrder={handleInventoryBulkAction}
              onIgnoreSuggestion={(suggestion) => console.log('Ignored suggestion:', suggestion)}
              refreshInterval={300000}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Supplier Integration Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem' }}>
          Supplier Integration & Lead Times
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <SupplierIntegrationHub
              onSupplierSelect={(supplier) => console.log('Selected supplier:', supplier)}
              onContactSupplier={(supplier) => console.log('Contacting supplier:', supplier)}
              onCreateOrder={handleInventoryOrderGenerate}
              refreshInterval={300000}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Bulk Order Generation Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem' }}>
          Bulk Order Generation
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <BulkOrderGenerationInterface />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* AI Inventory Optimization Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="brain" size={24} />
          AI Inventory Optimization
          <Badge variant="info" size="sm">AI-Powered</Badge>
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <InventoryOptimizationRecommendations
              onImplement={handleOptimizationImplement}
              onDismiss={handleOptimizationDismiss}
              onViewDetails={handleOptimizationDetails}
              autoRefresh={true}
              refreshInterval={300000}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Seasonal Demand Forecasting Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="calendar" size={24} />
          Seasonal Demand Forecasting
          <Badge variant="success" size="sm">89% Accuracy</Badge>
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <SeasonalDemandForecasting
              onSeasonalAdjust={handleSeasonalAdjust}
              onPatternUpdate={handlePatternUpdate}
              onExportForecast={handleExportForecast}
              autoRefresh={true}
              refreshInterval={600000}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Cost Analysis & Margin Optimization Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="dollar-sign" size={24} />
          Cost Analysis & Margin Optimization
          <Badge variant="warning" size="sm">$107.9K Savings</Badge>
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <CostAnalysisMarginOptimization
              onOptimizationApply={handleCostOptimizationApply}
              onCostAnalyze={handleCostAnalyze}
              onExportReport={handleCostReportExport}
              autoRefresh={true}
              refreshInterval={900000}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Product Catalog Management Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="package" size={24} />
          Product Catalog Management
          <Badge variant="secondary" size="sm">6 Products</Badge>
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <ProductCatalogManagement
              onProductCreate={handleProductCreate}
              onProductEdit={handleProductEdit}
              onProductDelete={handleProductDelete}
              onProductView={handleProductView}
              onBulkAction={handleProductBulkAction}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Category & Tag Management Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="folder-tree" size={24} />
          Category & Tag Management
          <Badge variant="primary" size="sm">8 Categories</Badge>
          <Badge variant="success" size="sm">8 Tags</Badge>
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <CategoryTagManager
              onCategoryCreate={handleCategoryCreate}
              onCategoryEdit={handleCategoryEdit}
              onCategoryDelete={handleCategoryDelete}
              onTagCreate={handleTagCreate}
              onTagEdit={handleTagEdit}
              onTagDelete={handleTagDelete}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Price History & Optimization Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="trending-up" size={24} />
          Price History & Optimization
          <Badge variant="warning" size="sm">3 Alerts</Badge>
          <Badge variant="info" size="sm">AI Insights</Badge>
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <PriceHistoryOptimization
              onPriceUpdate={handlePriceUpdate}
              onOptimizationApply={handleOptimizationApply}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Product Performance Analytics Section */}
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="bar-chart-3" size={24} />
          Product Performance Analytics
          <Badge variant="success" size="sm">Live Data</Badge>
          <Badge variant="primary" size="sm">AI Insights</Badge>
        </Typography>
        <DashboardGrid
          {...DASHBOARD_LAYOUTS.default}
          spacing="lg"
        >
          <GridItem span={4}>
            <ProductPerformanceAnalytics
              onProductSelect={handleProductSelect}
              onExportReport={handleAnalyticsExport}
              onOptimizationRequest={handleAnalyticsOptimization}
            />
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Charts Section */}
      <DashboardGrid
        {...DASHBOARD_LAYOUTS.default}
        spacing="lg"
      >
        <GridItem span={3}>
          <ChartContainer
            title={t('dashboard.charts.inventoryValueOverTime')}
            description={t('dashboard.charts.inventoryValueOverTimeDesc')}
            type="line"
            showTimeRange
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            refreshable
            onRefresh={handleRefresh}
            exportable
            fullScreenable
            showLegend
            legend={[
              { id: 'current', label: t('dashboard.chartLegends.currentValue'), color: '#3B82F6' },
              { id: 'projected', label: t('dashboard.chartLegends.projected'), color: '#10B981' }
            ]}
            lastUpdated={lastUpdated}
            loading={loading}
          >
            <MockChart color="#3B82F6">
              <Typography variant="h6" color="primary">
                {t('dashboard.charts.lineChartPlaceholder')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>

        <GridItem span={1}>
          <ChartContainer
            title={t('dashboard.charts.categoryBreakdown')}
            type="pie"
            showLegend
            legend={[
              { id: 'electronics', label: t('dashboard.categories.electronics'), color: '#3B82F6' },
              { id: 'clothing', label: t('dashboard.categories.clothing'), color: '#10B981' },
              { id: 'food', label: t('dashboard.categories.food'), color: '#F59E0B' },
              { id: 'books', label: t('dashboard.categories.books'), color: '#EF4444' }
            ]}
            exportable
          >
            <MockChart color="#10B981">
              <Typography variant="h6" color="success">
                {t('dashboard.charts.pieChartPlaceholder')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>

        <GridItem span={2}>
          <ChartContainer
            title={t('dashboard.charts.stockLevelsByLocation')}
            description={t('dashboard.charts.stockLevelsByLocationDesc')}
            type="bar"
            refreshable
            onRefresh={handleRefresh}
            exportable
            loading={loading}
          >
            <MockChart color="#F59E0B">
              <Typography variant="h6" color="warning">
                {t('dashboard.charts.barChartPlaceholder')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>

        <GridItem span={2}>
          <ChartContainer
            title={t('dashboard.charts.demandForecast')}
            description={t('dashboard.charts.demandForecastDesc')}
            type="area"
            badge={t('dashboard.badges.ai')}
            showTimeRange
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            refreshable
            onRefresh={handleRefresh}
            exportable
            showLegend
            legend={[
              { id: 'actual', label: t('dashboard.chartLegends.actualDemand'), color: '#8B5CF6' },
              { id: 'forecast', label: t('dashboard.chartLegends.forecasted'), color: '#06B6D4' },
              { id: 'confidence', label: t('dashboard.chartLegends.confidenceRange'), color: '#84CC16' }
            ]}
          >
            <MockChart color="#8B5CF6">
              <Typography variant="h6" color="brand">
                {t('dashboard.charts.areaChartPlaceholder')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>
      </DashboardGrid>
      
      {/* Revenue Stream Debug Panel (Development Only) */}
      {/* {showRevenueDebug && <RevenueStreamDebug />} */}
      
      {/* Customer Activity Debug Panel (Development Only) */}
      {/* {showRevenueDebug && <CustomerActivityDebug />} */}
      
      {/* Inventory Change Debug Panel (Development Only) */}
      {/* {showInventoryDebug && <InventoryChangeDebug onClose={() => setShowInventoryDebug(false)} />} */}
      
      {/* Alert Notification Debug Panel (Development Only) */}
      {/* {showAlertDebug && <AlertNotificationDebug onClose={() => setShowAlertDebug(false)} />} */}
      
      {/* A/B Test Results Debug Panel (Development Only) */}
      {/* {showABTestDebug && <ABTestResultsDebug onClose={() => setShowABTestDebug(false)} />} */}
      
      {/* Dashboard Refresh Debug Panel (Development Only) */}
      {/* {showRefreshDebug && <DashboardRefreshDebug onClose={() => setShowRefreshDebug(false)} />} */}
      
      {/* Team Activity Debug Panel (Development Only) */}
      {/* {showTeamActivityDebug && <TeamActivityDebug onClose={() => setShowTeamActivityDebug(false)} />} */}
      
      {/* Customer Behavior Debug Panel (Development Only) */}
      {/* {showCustomerBehaviorDebug && <CustomerBehaviorDebug onClose={() => setShowCustomerBehaviorDebug(false)} />} */}
      
      {/* Real-time Alert Notifications (Always Active) */}
      {/* <RealTimeAlertNotifications 
        maxNotifications={5}
        autoHideDelay={8000}
        soundEnabled={true}
        showControls={import.meta.env.DEV}
      /> */}
    </DashboardContainer>
  );

  // For mobile, show charts in a carousel
  if (isTouchDevice()) {
    return (
      <PullToRefresh
        onRefresh={handleRefresh}
        refreshing={loading}
        pullingText={t('dashboard.pullToRefresh')}
        refreshingText={t('dashboard.refreshingData')}
      >
        {dashboardContent}
        
        {/* Mobile Chart Carousel */}
        <div style={{ 
          marginTop: '32px', 
          height: '400px',
          display: window.innerWidth <= 768 ? 'block' : 'none'
        }}>
          <Typography variant="h5" weight="semibold" style={{ marginBottom: '16px' }}>
            {t('dashboard.chartsSection')}
          </Typography>
          <MobileCarousel
            showIndicators
            showNavigation
            showCounter
            showSwipeHint
            onSlideChange={(index) => console.log('Component slide changed:', index)}
          >
            {allComponents}
          </MobileCarousel>
        </div>
      </PullToRefresh>
    );
  }

  // Desktop version with pull-to-refresh
  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      refreshing={loading}
      pullingText={t('dashboard.pullToRefresh')}
      refreshingText={t('dashboard.refreshingData')}
    >
      {dashboardContent}
    </PullToRefresh>
  );
};

export default Dashboard;