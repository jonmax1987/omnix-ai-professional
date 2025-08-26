import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import FilterDropdown from '../molecules/FilterDropdown';
import SearchBar from '../molecules/SearchBar';
import DataTable from './DataTable';
import ChartContainer from './ChartContainer';
import inventoryService from '../../services/inventoryService';

const AnalyticsContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const AnalyticsHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.elevated};
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
`;

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid ${props => props.theme.colors.border.subtle};
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: none;
  border: none;
  font-size: ${props => props.theme.typography?.body1?.fontSize || '1rem'};
  font-weight: ${props => props.theme.typography?.body1?.fontWeight || 400};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  position: relative;

  ${props => props.active && css`
    color: ${props.theme.colors.primary[600]};
    border-bottom-color: ${props.theme.colors.primary[500]};
    font-weight: 600;
  `}

  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.primary[500]};
    background: ${props => props.theme.colors.primary[25]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabContent = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const MetricCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
`;

const MetricValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const PerformanceChart = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const InsightsPanel = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
`;

const InsightItem = styled(motion.div)`
  display: flex;
  align-items: start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
  background: ${props => props.severity === 'critical' ? props.theme.colors.red[25] :
    props.severity === 'warning' ? props.theme.colors.yellow[25] :
    props.severity === 'success' ? props.theme.colors.green[25] :
    props.theme.colors.blue[25]};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: ${props => props.theme.colors.text.tertiary};
`;

const ProductPerformanceAnalytics = ({
  onProductSelect,
  onExportReport,
  onOptimizationRequest,
  className,
  ...props
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'revenue', direction: 'desc' });

  const tabs = [
    { id: 'overview', label: 'Performance Overview', icon: 'bar-chart-3' },
    { id: 'products', label: 'Product Analysis', icon: 'package' },
    { id: 'trends', label: 'Trends & Patterns', icon: 'trending-up' },
    { id: 'insights', label: 'AI Insights', icon: 'brain' }
  ];

  const timeframeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'coffee', label: 'Coffee & Beverages' },
    { value: 'fresh', label: 'Fresh Produce' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'frozen', label: 'Frozen Foods' },
    { value: 'snacks', label: 'Snacks & Confectionery' }
  ];

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getProductPerformanceAnalytics({
        timeframe: selectedTimeframe,
        category: selectedCategory,
        includeInsights: true,
        includeTrends: true
      });
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe, selectedCategory]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Filter and sort products for table
  const processedProducts = useMemo(() => {
    if (!analyticsData?.products) return [];
    
    let filtered = analyticsData.products;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [analyticsData?.products, searchQuery, sortConfig]);

  // Table columns configuration
  const tableColumns = [
    {
      key: 'name',
      title: 'Product',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src={row.image || '/placeholder-product.jpg'} 
            alt={value}
            style={{ width: 40, height: 40, borderRadius: '4px', objectFit: 'cover' }}
          />
          <div>
            <Typography variant="body2" weight="medium">{value}</Typography>
            <Typography variant="caption" color="secondary">{row.sku}</Typography>
          </div>
        </div>
      )
    },
    {
      key: 'revenue',
      title: 'Revenue',
      sortable: true,
      render: (value) => (
        <Typography variant="body2" weight="medium">
          ₪{value?.toLocaleString()}
        </Typography>
      )
    },
    {
      key: 'units_sold',
      title: 'Units Sold',
      sortable: true,
      render: (value) => (
        <Typography variant="body2">{value?.toLocaleString()}</Typography>
      )
    },
    {
      key: 'growth_rate',
      title: 'Growth',
      sortable: true,
      render: (value) => (
        <Badge 
          variant={value > 0 ? 'success' : value < 0 ? 'danger' : 'neutral'}
          size="sm"
        >
          {value > 0 ? '+' : ''}{value}%
        </Badge>
      )
    },
    {
      key: 'performance_score',
      title: 'Performance',
      sortable: true,
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: 60, 
              height: 8, 
              backgroundColor: '#f1f5f9', 
              borderRadius: 4, 
              overflow: 'hidden' 
            }}
          >
            <div
              style={{
                width: `${value}%`,
                height: '100%',
                backgroundColor: value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <Typography variant="caption">{value}</Typography>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onProductSelect?.(row)}
        >
          <Icon name="external-link" size={16} />
        </Button>
      )
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleExportReport = () => {
    onExportReport?.({
      timeframe: selectedTimeframe,
      category: selectedCategory,
      products: processedProducts,
      analytics: analyticsData
    });
  };

  const handleOptimizationRequest = () => {
    onOptimizationRequest?.({
      timeframe: selectedTimeframe,
      category: selectedCategory,
      insights: analyticsData?.insights
    });
  };

  const renderOverviewTab = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Key Metrics */}
      <MetricsGrid>
        <MetricCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MetricValue>
            <Icon name="dollar-sign" size={20} color="#10b981" />
            <Typography variant="h4" weight="bold">
              ₪{analyticsData?.overview?.totalRevenue?.toLocaleString() || '0'}
            </Typography>
          </MetricValue>
          <Typography variant="body2" color="secondary">Total Revenue</Typography>
          <Badge variant="success" size="xs" style={{ marginTop: '8px' }}>
            +{analyticsData?.overview?.revenueGrowth || '0'}% vs last period
          </Badge>
        </MetricCard>

        <MetricCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MetricValue>
            <Icon name="package" size={20} color="#3b82f6" />
            <Typography variant="h4" weight="bold">
              {analyticsData?.overview?.totalUnitsSold?.toLocaleString() || '0'}
            </Typography>
          </MetricValue>
          <Typography variant="body2" color="secondary">Units Sold</Typography>
          <Badge variant="info" size="xs" style={{ marginTop: '8px' }}>
            +{analyticsData?.overview?.unitsSoldGrowth || '0'}% vs last period
          </Badge>
        </MetricCard>

        <MetricCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MetricValue>
            <Icon name="star" size={20} color="#f59e0b" />
            <Typography variant="h4" weight="bold">
              {analyticsData?.overview?.averageRating || '0.0'}
            </Typography>
          </MetricValue>
          <Typography variant="body2" color="secondary">Average Rating</Typography>
          <Badge variant="warning" size="xs" style={{ marginTop: '8px' }}>
            {analyticsData?.overview?.ratingCount || '0'} reviews
          </Badge>
        </MetricCard>

        <MetricCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MetricValue>
            <Icon name="target" size={20} color="#8b5cf6" />
            <Typography variant="h4" weight="bold">
              {analyticsData?.overview?.conversionRate || '0.0'}%
            </Typography>
          </MetricValue>
          <Typography variant="body2" color="secondary">Conversion Rate</Typography>
          <Badge variant="primary" size="xs" style={{ marginTop: '8px' }}>
            +{analyticsData?.overview?.conversionGrowth || '0'}% improvement
          </Badge>
        </MetricCard>
      </MetricsGrid>

      {/* Performance Charts */}
      <PerformanceChart>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
          Revenue Trends
        </Typography>
        <ChartContainer
          type="line"
          data={analyticsData?.charts?.revenueTrend || []}
          height={300}
          showGrid
          showTooltip
        />
      </PerformanceChart>
    </TabContent>
  );

  const renderProductsTab = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ marginBottom: '24px' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products by name or SKU..."
          style={{ marginBottom: '16px' }}
        />
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Typography variant="body2" color="secondary">
            Showing {processedProducts.length} products
          </Typography>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
          >
            <Icon name="download" size={16} />
            Export Report
          </Button>
        </div>
      </div>

      <DataTable
        data={processedProducts}
        columns={tableColumns}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        pagination
        pageSize={10}
        loading={loading}
      />
    </TabContent>
  );

  const renderTrendsTab = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ display: 'grid', gap: '24px' }}>
        <PerformanceChart>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Sales Trends by Category
          </Typography>
          <ChartContainer
            type="bar"
            data={analyticsData?.charts?.categoryTrends || []}
            height={300}
            showGrid
            showTooltip
          />
        </PerformanceChart>

        <PerformanceChart>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Seasonal Performance Patterns
          </Typography>
          <ChartContainer
            type="area"
            data={analyticsData?.charts?.seasonalPatterns || []}
            height={300}
            showGrid
            showTooltip
          />
        </PerformanceChart>
      </div>
    </TabContent>
  );

  const renderInsightsTab = () => (
    <TabContent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <InsightsPanel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Typography variant="h6" weight="semibold">AI-Powered Insights</Typography>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOptimizationRequest}
          >
            <Icon name="zap" size={16} />
            Generate New Insights
          </Button>
        </div>

        {analyticsData?.insights?.map((insight, index) => (
          <InsightItem
            key={index}
            severity={insight.severity}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Icon 
              name={insight.severity === 'critical' ? 'alert-circle' : 
                   insight.severity === 'warning' ? 'alert-triangle' :
                   insight.severity === 'success' ? 'check-circle' : 'info'}
              size={20}
              color={insight.severity === 'critical' ? '#ef4444' :
                     insight.severity === 'warning' ? '#f59e0b' :
                     insight.severity === 'success' ? '#10b981' : '#3b82f6'}
            />
            <div style={{ flex: 1 }}>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '4px' }}>
                {insight.title}
              </Typography>
              <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
                {insight.description}
              </Typography>
              {insight.impact && (
                <Badge variant="secondary" size="xs">
                  Impact: {insight.impact}
                </Badge>
              )}
              {insight.actions && insight.actions.length > 0 && (
                <ActionButtons>
                  {insight.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="outline"
                      size="xs"
                      onClick={() => console.log('Action:', action)}
                    >
                      {action}
                    </Button>
                  ))}
                </ActionButtons>
              )}
            </div>
          </InsightItem>
        ))}
      </InsightsPanel>
    </TabContent>
  );

  if (loading) {
    return (
      <AnalyticsContainer className={className} {...props}>
        <LoadingState>
          <div style={{ textAlign: 'center' }}>
            <Icon name="loader" size={32} />
            <Typography variant="body1" style={{ marginTop: '16px' }}>
              Loading performance analytics...
            </Typography>
          </div>
        </LoadingState>
      </AnalyticsContainer>
    );
  }

  return (
    <AnalyticsContainer
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <AnalyticsHeader>
        <HeaderTop>
          <div style={{ flex: 1 }}>
            <Typography variant="h5" weight="semibold" style={{ marginBottom: '8px' }}>
              Product Performance Analytics
            </Typography>
            <Typography variant="body2" color="secondary">
              Comprehensive analysis of product performance, trends, and optimization opportunities
            </Typography>
          </div>
          <HeaderActions>
            <Badge variant="info" size="sm">
              {analyticsData?.products?.length || 0} Products
            </Badge>
            <Badge variant="success" size="sm">
              Live Data
            </Badge>
          </HeaderActions>
        </HeaderTop>

        <FiltersRow>
          <FilterDropdown
            options={timeframeOptions}
            value={selectedTimeframe}
            onChange={handleTimeframeChange}
            placeholder="Select timeframe"
          />
          <FilterDropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="Select category"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            <Icon name="refresh-cw" size={16} />
            Refresh
          </Button>
        </FiltersRow>

        <TabsContainer>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            >
              <Icon name={tab.icon} size={16} style={{ marginRight: '8px' }} />
              {tab.label}
            </Tab>
          ))}
        </TabsContainer>
      </AnalyticsHeader>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </AnimatePresence>
    </AnalyticsContainer>
  );
};

export default ProductPerformanceAnalytics;