import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, ScatterChart, Scatter, Area, AreaChart, RadialBarChart, RadialBar, FunnelChart, Funnel, LabelList } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity, Target, Users, Zap, Brain, Award, AlertTriangle, CheckCircle, Clock, DollarSign, Percent, Eye, MousePointer, ShoppingCart, UserCheck } from 'lucide-react';

const ReportingContainer = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadows.medium};
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 32px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 8px;
  padding: 4px;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.secondary};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.background.hover};
    color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  }
`;

const ControlsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 6px;
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
  }
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 6px;
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
  }
`;

const ExportButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.theme.colors.success.main};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.success.dark};
    transform: translateY(-2px);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const MetricCard = styled(motion.div)`
  padding: 20px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.positive ? props.theme.colors.success.main : props.theme.colors.error.main};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const ChartCard = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InsightsSection = styled.div`
  margin-top: 32px;
`;

const InsightCard = styled(motion.div)`
  padding: 20px;
  background: ${props => {
    switch(props.type) {
      case 'success': return props.theme.colors.success.main + '10';
      case 'warning': return props.theme.colors.warning.main + '10';
      case 'info': return props.theme.colors.primary.main + '10';
      default: return props.theme.colors.background.secondary;
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.type) {
      case 'success': return props.theme.colors.success.main;
      case 'warning': return props.theme.colors.warning.main;
      case 'info': return props.theme.colors.primary.main;
      default: return props.theme.colors.border.light;
    }
  }};
  border-radius: 8px;
  margin-bottom: 16px;
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const InsightTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const InsightDescription = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const ABTestAdvancedReporting = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    dateRange: '30',
    testStatus: 'all',
    segment: 'all',
    metric: 'conversion'
  });

  const tabs = [
    { id: 'overview', label: 'Performance Overview', icon: Activity },
    { id: 'trends', label: 'Trends Analysis', icon: TrendingUp },
    { id: 'segments', label: 'Segment Analysis', icon: Users },
    { id: 'funnel', label: 'Conversion Funnel', icon: Target },
    { id: 'revenue', label: 'Revenue Impact', icon: DollarSign },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ];

  // Mock data for demonstrations
  const performanceMetrics = useMemo(() => [
    { name: 'Total Tests', value: 47, change: '+12%', positive: true, icon: BarChart3 },
    { name: 'Active Tests', value: 8, change: '+3', positive: true, icon: Activity },
    { name: 'Success Rate', value: '73.2%', change: '+5.4%', positive: true, icon: CheckCircle },
    { name: 'Avg Lift', value: '12.8%', change: '+2.1%', positive: true, icon: TrendingUp },
    { name: 'Revenue Impact', value: '$24.5K', change: '+18.2%', positive: true, icon: DollarSign },
    { name: 'ROI', value: '340%', change: '+45%', positive: true, icon: Percent }
  ], []);

  const trendsData = useMemo(() => [
    { date: '2025-01-01', tests: 12, conversions: 8.4, revenue: 4200 },
    { date: '2025-01-08', tests: 15, conversions: 9.1, revenue: 5300 },
    { date: '2025-01-15', tests: 18, conversions: 10.8, revenue: 6800 },
    { date: '2025-01-22', tests: 14, conversions: 9.6, revenue: 5900 },
    { date: '2025-01-29', tests: 21, conversions: 12.3, revenue: 8100 },
    { date: '2025-02-05', tests: 19, conversions: 11.7, revenue: 7400 },
    { date: '2025-02-12', tests: 23, conversions: 13.9, revenue: 9600 }
  ], []);

  const segmentData = useMemo(() => [
    { name: 'New Users', tests: 12, lift: 15.4, confidence: 94, color: '#8884d8' },
    { name: 'Returning Users', tests: 18, lift: 8.7, confidence: 87, color: '#82ca9d' },
    { name: 'VIP Customers', tests: 8, lift: 22.1, confidence: 98, color: '#ffc658' },
    { name: 'Mobile Users', tests: 15, lift: 11.2, confidence: 91, color: '#ff7c7c' },
    { name: 'Desktop Users', tests: 9, lift: 9.8, confidence: 85, color: '#8dd1e1' }
  ], []);

  const funnelData = useMemo(() => [
    { name: 'Page Views', value: 10000, percentage: 100, color: '#8884d8' },
    { name: 'Product Views', value: 7500, percentage: 75, color: '#82ca9d' },
    { name: 'Add to Cart', value: 3200, percentage: 32, color: '#ffc658' },
    { name: 'Checkout Start', value: 1800, percentage: 18, color: '#ff7c7c' },
    { name: 'Purchase', value: 1240, percentage: 12.4, color: '#8dd1e1' }
  ], []);

  const revenueImpactData = useMemo(() => [
    { test: 'Homepage CTA', baseline: 12400, variant: 15800, lift: 27.4, revenue: 3400 },
    { test: 'Product Page Layout', baseline: 8200, variant: 9100, lift: 11.0, revenue: 900 },
    { test: 'Checkout Flow', baseline: 15600, variant: 18900, lift: 21.2, revenue: 3300 },
    { test: 'Email Campaign', baseline: 5400, variant: 6800, lift: 25.9, revenue: 1400 },
    { test: 'Mobile Nav', baseline: 9800, variant: 11200, lift: 14.3, revenue: 1400 }
  ], []);

  const aiInsights = useMemo(() => [
    {
      type: 'success',
      icon: Award,
      title: 'High-Performing Test Identified',
      description: 'The "Homepage CTA Color" test shows exceptional performance with 27.4% lift and 98% confidence. Consider implementing immediately across all traffic.'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Segment Performance Gap',
      description: 'Mobile users show 40% lower conversion rates in current tests. Consider mobile-specific optimization strategies.'
    },
    {
      type: 'info',
      icon: Brain,
      title: 'Seasonal Pattern Detected',
      description: 'Tests show 23% higher performance during weekdays vs weekends. Schedule future tests accordingly.'
    },
    {
      type: 'info',
      icon: Target,
      title: 'Optimization Opportunity',
      description: 'Cart abandonment tests indicate 18% improvement potential. Recommend testing simplified checkout flow.'
    }
  ], []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleExport = useCallback(() => {
    // Simulate export functionality
    const data = {
      metrics: performanceMetrics,
      trends: trendsData,
      segments: segmentData,
      generated: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [performanceMetrics, trendsData, segmentData]);

  const renderOverviewTab = () => (
    <>
      <MetricsGrid>
        {performanceMetrics.map((metric, index) => (
          <MetricCard
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricHeader>
              <MetricTitle>
                <metric.icon size={16} />
                {metric.name}
              </MetricTitle>
            </MetricHeader>
            <MetricValue>{metric.value}</MetricValue>
            <MetricChange positive={metric.positive}>
              {metric.positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {metric.change}
            </MetricChange>
          </MetricCard>
        ))}
      </MetricsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>
            <BarChart3 size={20} />
            Test Performance Distribution
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="lift" fill="#8884d8" name="Lift %" />
              <Bar dataKey="confidence" fill="#82ca9d" name="Confidence %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <PieChartIcon size={20} />
            Test Status Distribution
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Running', value: 8, color: '#8884d8' },
                  { name: 'Completed', value: 32, color: '#82ca9d' },
                  { name: 'Paused', value: 3, color: '#ffc658' },
                  { name: 'Failed', value: 4, color: '#ff7c7c' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Running', value: 8, color: '#8884d8' },
                  { name: 'Completed', value: 32, color: '#82ca9d' },
                  { name: 'Paused', value: 3, color: '#ffc658' },
                  { name: 'Failed', value: 4, color: '#ff7c7c' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>
    </>
  );

  const renderTrendsTab = () => (
    <ChartsGrid>
      <ChartCard style={{ gridColumn: '1 / -1' }}>
        <ChartTitle>
          <TrendingUp size={20} />
          Performance Trends Over Time
        </ChartTitle>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="tests" stroke="#8884d8" strokeWidth={3} name="Tests Count" />
            <Line yAxisId="left" type="monotone" dataKey="conversions" stroke="#82ca9d" strokeWidth={3} name="Conversion Rate %" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ffc658" strokeWidth={3} name="Revenue ($)" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </ChartsGrid>
  );

  const renderSegmentsTab = () => (
    <ChartsGrid>
      <ChartCard>
        <ChartTitle>
          <Users size={20} />
          Segment Performance Comparison
        </ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={segmentData}>
            <RadialBar dataKey="lift" cornerRadius={10} fill="#8884d8" />
            <Legend />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard>
        <ChartTitle>
          <Target size={20} />
          Confidence Levels by Segment
        </ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={segmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="confidence" fill="#82ca9d" name="Confidence %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </ChartsGrid>
  );

  const renderFunnelTab = () => (
    <ChartCard style={{ maxWidth: '600px', margin: '0 auto' }}>
      <ChartTitle>
        <Target size={20} />
        Conversion Funnel Analysis
      </ChartTitle>
      <ResponsiveContainer width="100%" height={400}>
        <FunnelChart>
          <Tooltip />
          <Funnel
            dataKey="value"
            data={funnelData}
            isAnimationActive
          >
            <LabelList position="center" fill="#fff" stroke="none" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  const renderRevenueTab = () => (
    <ChartCard>
      <ChartTitle>
        <DollarSign size={20} />
        Revenue Impact by Test
      </ChartTitle>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={revenueImpactData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="test" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="baseline" fill="#8884d8" name="Baseline Revenue" />
          <Bar dataKey="variant" fill="#82ca9d" name="Variant Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  const renderInsightsTab = () => (
    <InsightsSection>
      {aiInsights.map((insight, index) => (
        <InsightCard
          key={index}
          type={insight.type}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <InsightHeader>
            <insight.icon size={20} />
            <InsightTitle>{insight.title}</InsightTitle>
          </InsightHeader>
          <InsightDescription>{insight.description}</InsightDescription>
        </InsightCard>
      ))}
    </InsightsSection>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'trends':
        return renderTrendsTab();
      case 'segments':
        return renderSegmentsTab();
      case 'funnel':
        return renderFunnelTab();
      case 'revenue':
        return renderRevenueTab();
      case 'insights':
        return renderInsightsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <ReportingContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Advanced A/B Test Analytics</h2>
        <ExportButton onClick={handleExport}>
          <Download size={16} />
          Export Report
        </ExportButton>
      </div>

      <ControlsSection>
        <FilterGroup>
          <FilterLabel>Date Range</FilterLabel>
          <Select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Test Status</FilterLabel>
          <Select
            value={filters.testStatus}
            onChange={(e) => handleFilterChange('testStatus', e.target.value)}
          >
            <option value="all">All Tests</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>User Segment</FilterLabel>
          <Select
            value={filters.segment}
            onChange={(e) => handleFilterChange('segment', e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="new">New Users</option>
            <option value="returning">Returning Users</option>
            <option value="vip">VIP Customers</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Primary Metric</FilterLabel>
          <Select
            value={filters.metric}
            onChange={(e) => handleFilterChange('metric', e.target.value)}
          >
            <option value="conversion">Conversion Rate</option>
            <option value="revenue">Revenue</option>
            <option value="engagement">Engagement</option>
            <option value="retention">Retention</option>
          </Select>
        </FilterGroup>
      </ControlsSection>

      <TabsContainer>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </ReportingContainer>
  );
};

export default ABTestAdvancedReporting;