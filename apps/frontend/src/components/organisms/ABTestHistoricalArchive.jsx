import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import Progress from '../atoms/Progress';
import MetricCard from '../molecules/MetricCard';
import DataTable from './DataTable';
import { useI18n } from '../../hooks/useI18n';

const ArchiveContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ArchiveHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.slate[25]} 0%, 
    ${props => props.theme.colors.slate[50]} 100%);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
  }
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
    ${props => props.theme.colors.slate[500]} 0%, 
    ${props => props.theme.colors.slate[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(100, 116, 139, 0.3);
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

const FiltersSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
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

const FilterSelect = styled.select`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary[100]};
  }
`;

const DateRangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const TestCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['outcome', 'priority'].includes(prop)
})`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => {
    switch (props.outcome) {
      case 'winner':
        return props.theme.colors.green[200];
      case 'inconclusive':
        return props.theme.colors.yellow[200];
      case 'negative':
        return props.theme.colors.red[200];
      default:
        return props.theme.colors.border.subtle;
    }
  }};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
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
      switch (props.outcome) {
        case 'winner':
          return props.theme.colors.green[500];
        case 'inconclusive':
          return props.theme.colors.yellow[500];
        case 'negative':
          return props.theme.colors.red[500];
        default:
          return props.theme.colors.gray[500];
      }
    }};
    border-radius: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]} 0 0;
  }
`;

const TestCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const TestCardTitle = styled.div`
  flex: 1;
`;

const TestCardMetrics = styled.div`
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

const TestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ChartContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[5]};
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ChartTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ExportSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.blue[25]};
  border: 1px solid ${props => props.theme.colors.blue[200]};
  border-radius: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const LearningsCard = styled(motion.div)`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.purple[25]} 0%, 
    ${props => props.theme.colors.purple[50]} 100%);
  border: 1px solid ${props => props.theme.colors.purple[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const LearningItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: rgba(255, 255, 255, 0.5);
  border-radius: ${props => props.theme.spacing[2]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LearningIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'type'
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    switch (props.type) {
      case 'success':
        return props.theme.colors.green[500];
      case 'insight':
        return props.theme.colors.blue[500];
      case 'warning':
        return props.theme.colors.yellow[500];
      default:
        return props.theme.colors.purple[500];
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)'
      }}>
        <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: entry.color,
              borderRadius: '2px'
            }} />
            <Typography variant="caption" color="secondary">
              {entry.name}: {entry.value}
            </Typography>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ABTestHistoricalArchive = ({
  onTestSelect,
  onExportData,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    outcome: 'all',
    model: 'all',
    metric: 'all'
  });
  const [selectedTests, setSelectedTests] = useState([]);

  // Mock historical test data
  const [historicalData, setHistoricalData] = useState({
    tests: [
      {
        id: 'hist-001',
        name: 'Claude Sonnet vs Haiku Speed Test',
        description: 'Testing response time optimization',
        outcome: 'winner',
        startDate: '2024-07-15',
        endDate: '2024-07-29',
        duration: 14,
        participants: 5421,
        modelA: 'Claude Haiku',
        modelB: 'Claude Sonnet',
        targetMetric: 'response_time',
        results: {
          uplift: 32.5,
          significance: 97.2,
          conversionRateA: 2.8,
          conversionRateB: 1.9,
          confidenceInterval: '±0.3s'
        },
        learnings: [
          'Claude Haiku significantly outperformed Sonnet in speed',
          'User satisfaction increased by 18% with faster responses',
          'No significant impact on accuracy metrics'
        ],
        tags: ['performance', 'speed', 'ai-models']
      },
      {
        id: 'hist-002',
        name: 'Personalization Algorithm Enhancement',
        description: 'ML-based vs rule-based personalization',
        outcome: 'winner',
        startDate: '2024-06-20',
        endDate: '2024-07-11',
        duration: 21,
        participants: 3847,
        modelA: 'Rule-based System',
        modelB: 'ML Personalization',
        targetMetric: 'conversion_rate',
        results: {
          uplift: 24.8,
          significance: 95.4,
          conversionRateA: 12.3,
          conversionRateB: 15.4,
          confidenceInterval: '±1.2%'
        },
        learnings: [
          'ML personalization showed 25% improvement in conversions',
          'Higher engagement with personalized recommendations',
          'Increased customer lifetime value by 15%'
        ],
        tags: ['personalization', 'ml', 'conversion']
      },
      {
        id: 'hist-003',
        name: 'Checkout Flow Optimization',
        description: '2-step vs 4-step checkout process',
        outcome: 'inconclusive',
        startDate: '2024-05-10',
        endDate: '2024-05-24',
        duration: 14,
        participants: 2156,
        modelA: '4-step Checkout',
        modelB: '2-step Checkout',
        targetMetric: 'cart_abandonment',
        results: {
          uplift: 3.2,
          significance: 67.8,
          conversionRateA: 68.2,
          conversionRateB: 70.4,
          confidenceInterval: '±4.1%'
        },
        learnings: [
          'Insufficient sample size for statistical significance',
          'Mobile users showed preference for 2-step process',
          'Need longer test duration for conclusive results'
        ],
        tags: ['ux', 'checkout', 'conversion']
      },
      {
        id: 'hist-004',
        name: 'Price Display Strategy Test',
        description: 'Dynamic vs fixed pricing display',
        outcome: 'negative',
        startDate: '2024-04-05',
        endDate: '2024-04-19',
        duration: 14,
        participants: 4321,
        modelA: 'Fixed Pricing',
        modelB: 'Dynamic Pricing',
        targetMetric: 'revenue_per_visitor',
        results: {
          uplift: -8.7,
          significance: 94.1,
          conversionRateA: 156.30,
          conversionRateB: 142.70,
          confidenceInterval: '±$5.20'
        },
        learnings: [
          'Dynamic pricing reduced customer trust',
          'Users preferred transparent, fixed pricing',
          'Revenue per visitor decreased significantly'
        ],
        tags: ['pricing', 'revenue', 'trust']
      },
      {
        id: 'hist-005',
        name: 'AI Confidence Threshold Test',
        description: 'Testing optimal confidence levels for recommendations',
        outcome: 'winner',
        startDate: '2024-03-12',
        endDate: '2024-03-26',
        duration: 14,
        participants: 3654,
        modelA: '85% Threshold',
        modelB: '75% Threshold',
        targetMetric: 'recommendation_coverage',
        results: {
          uplift: 15.6,
          significance: 92.8,
          conversionRateA: 85.2,
          conversionRateB: 98.5,
          confidenceInterval: '±2.8%'
        },
        learnings: [
          'Lower threshold increased recommendation coverage',
          'Minimal impact on accuracy with better coverage',
          'User engagement improved with more recommendations'
        ],
        tags: ['ai', 'thresholds', 'recommendations']
      }
    ],
    timeline: [
      { month: '2024-03', tests: 2, winners: 1, revenue_impact: 45000 },
      { month: '2024-04', tests: 1, winners: 0, revenue_impact: -12000 },
      { month: '2024-05', tests: 1, winners: 0, revenue_impact: 0 },
      { month: '2024-06', tests: 1, winners: 1, revenue_impact: 78000 },
      { month: '2024-07', tests: 2, winners: 1, revenue_impact: 92000 },
      { month: '2024-08', tests: 1, winners: 1, revenue_impact: 156000 }
    ]
  });

  // Filter historical tests
  const filteredTests = useMemo(() => {
    return historicalData.tests.filter(test => {
      if (filters.outcome !== 'all' && test.outcome !== filters.outcome) return false;
      if (filters.model !== 'all') {
        const hasModel = test.modelA.toLowerCase().includes(filters.model.toLowerCase()) ||
                        test.modelB.toLowerCase().includes(filters.model.toLowerCase());
        if (!hasModel) return false;
      }
      if (filters.dateRange !== 'all') {
        const testDate = new Date(test.startDate);
        const now = new Date();
        const months = parseInt(filters.dateRange);
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
        if (testDate < cutoffDate) return false;
      }
      return true;
    });
  }, [historicalData.tests, filters]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalTests = filteredTests.length;
    const winners = filteredTests.filter(t => t.outcome === 'winner').length;
    const avgUplift = filteredTests.length > 0 
      ? filteredTests.reduce((sum, t) => sum + t.results.uplift, 0) / filteredTests.length
      : 0;
    const totalParticipants = filteredTests.reduce((sum, t) => sum + t.participants, 0);
    const avgSignificance = filteredTests.length > 0
      ? filteredTests.reduce((sum, t) => sum + t.results.significance, 0) / filteredTests.length
      : 0;

    return {
      totalTests,
      winRate: totalTests > 0 ? (winners / totalTests * 100) : 0,
      avgUplift: Math.abs(avgUplift),
      totalParticipants,
      avgSignificance
    };
  }, [filteredTests]);

  // Extract key learnings
  const keyLearnings = useMemo(() => {
    const learnings = [];
    
    // Success patterns
    const winners = filteredTests.filter(t => t.outcome === 'winner');
    if (winners.length > 0) {
      learnings.push({
        type: 'success',
        title: 'Winning Patterns Identified',
        description: `${winners.length} successful tests show AI model optimization and personalization drive the highest impact`,
        icon: 'trophy'
      });
    }
    
    // Speed optimization insight
    const speedTests = filteredTests.filter(t => t.tags?.includes('speed'));
    if (speedTests.length > 0) {
      learnings.push({
        type: 'insight',
        title: 'Performance is Critical',
        description: 'Response time optimization consistently delivers 20%+ improvement in user satisfaction',
        icon: 'zap'
      });
    }
    
    // Sample size warning
    const inconclusiveTests = filteredTests.filter(t => t.outcome === 'inconclusive');
    if (inconclusiveTests.length > 0) {
      learnings.push({
        type: 'warning',
        title: 'Sample Size Matters',
        description: `${inconclusiveTests.length} tests were inconclusive due to insufficient sample size. Aim for 5000+ participants`,
        icon: 'alert-triangle'
      });
    }
    
    // Personalization wins
    const personalizations = filteredTests.filter(t => t.tags?.includes('personalization'));
    if (personalizations.length > 0) {
      learnings.push({
        type: 'insight',
        title: 'Personalization Pays Off',
        description: 'ML-based personalization shows consistent 15-25% conversion improvements',
        icon: 'user'
      });
    }
    
    return learnings;
  }, [filteredTests]);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'bar-chart' },
    { id: 'tests', label: 'Test Archive', icon: 'archive' },
    { id: 'analytics', label: 'Historical Analytics', icon: 'trending-up' },
    { id: 'learnings', label: 'Key Learnings', icon: 'book' }
  ];

  const updateFilter = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleExportTests = useCallback(() => {
    const exportData = {
      tests: selectedTests.length > 0 ? 
        filteredTests.filter(t => selectedTests.includes(t.id)) : 
        filteredTests,
      summary: summaryStats,
      exportDate: new Date().toISOString()
    };
    
    console.log('Exporting historical test data:', exportData);
    onExportData?.(exportData);
  }, [filteredTests, selectedTests, summaryStats, onExportData]);

  const renderOverviewTab = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Summary Statistics */}
      <StatsSummary>
        <MetricCard
          title="Total Historical Tests"
          value={summaryStats.totalTests}
          icon="flask"
          trend={{ value: 'All time', label: 'completed tests' }}
          color="blue"
        />
        <MetricCard
          title="Test Win Rate"
          value={`${summaryStats.winRate.toFixed(1)}%`}
          icon="target"
          trend={{ value: 'Success rate', label: 'of all tests' }}
          color="green"
        />
        <MetricCard
          title="Average Uplift"
          value={`${summaryStats.avgUplift.toFixed(1)}%`}
          icon="trending-up"
          trend={{ value: 'Performance gain', label: 'from winners' }}
          color="purple"
        />
        <MetricCard
          title="Total Participants"
          value={summaryStats.totalParticipants.toLocaleString()}
          icon="users"
          trend={{ value: 'Across all tests', label: 'data points' }}
          color="orange"
        />
      </StatsSummary>

      {/* Historical Timeline Chart */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="calendar" size={20} />
            <Typography variant="h6" weight="semibold">
              Testing Activity Timeline
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={historicalData.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="tests"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f630"
              name="Total Tests"
            />
            <Area
              type="monotone"
              dataKey="winners"
              stackId="2"
              stroke="#10b981"
              fill="#10b98130"
              name="Winning Tests"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Revenue Impact Chart */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="dollar-sign" size={20} />
            <Typography variant="h6" weight="semibold">
              Monthly Revenue Impact
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={historicalData.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
            />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue Impact']}
            />
            <Bar 
              dataKey="revenue_impact" 
              fill="#8b5cf6" 
              name="Revenue Impact"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Test Outcomes Distribution */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="pie-chart" size={20} />
            <Typography variant="h6" weight="semibold">
              Test Outcomes Distribution
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Winners', value: filteredTests.filter(t => t.outcome === 'winner').length, fill: '#10b981' },
                { name: 'Inconclusive', value: filteredTests.filter(t => t.outcome === 'inconclusive').length, fill: '#f59e0b' },
                { name: 'Negative', value: filteredTests.filter(t => t.outcome === 'negative').length, fill: '#ef4444' }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
            >
              {filteredTests.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderTestsTab = () => (
    <motion.div
      key="tests"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Filters */}
      <FiltersSection>
        <Icon name="filter" size={20} />
        <Typography variant="body2" weight="medium">
          Filters:
        </Typography>
        
        <FilterGroup>
          <Typography variant="caption" color="secondary">Date Range:</Typography>
          <FilterSelect
            value={filters.dateRange}
            onChange={(e) => updateFilter('dateRange', e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="12">Last 12 Months</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <Typography variant="caption" color="secondary">Outcome:</Typography>
          <FilterSelect
            value={filters.outcome}
            onChange={(e) => updateFilter('outcome', e.target.value)}
          >
            <option value="all">All Outcomes</option>
            <option value="winner">Winners Only</option>
            <option value="inconclusive">Inconclusive</option>
            <option value="negative">Negative Results</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <Typography variant="caption" color="secondary">Model:</Typography>
          <FilterSelect
            value={filters.model}
            onChange={(e) => updateFilter('model', e.target.value)}
          >
            <option value="all">All Models</option>
            <option value="claude">Claude Models</option>
            <option value="gpt">GPT Models</option>
            <option value="custom">Custom Models</option>
          </FilterSelect>
        </FilterGroup>
      </FiltersSection>

      {/* Tests Grid */}
      <TestsGrid>
        {filteredTests.map((test, index) => (
          <TestCard
            key={test.id}
            outcome={test.outcome}
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onTestSelect?.(test)}
          >
            <TestCardHeader>
              <TestCardTitle>
                <Typography variant="h6" weight="semibold" style={{ marginBottom: '4px' }}>
                  {test.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {test.startDate} - {test.endDate} ({test.duration} days)
                </Typography>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Badge 
                    variant={test.outcome === 'winner' ? 'success' : 
                            test.outcome === 'inconclusive' ? 'warning' : 'error'} 
                    size="xs"
                  >
                    {test.outcome.toUpperCase()}
                  </Badge>
                  <Badge variant="info" size="xs">
                    {test.targetMetric.replace('_', ' ')}
                  </Badge>
                </div>
              </TestCardTitle>
            </TestCardHeader>

            <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
              {test.description}
            </Typography>

            <div style={{ marginBottom: '12px' }}>
              <Typography variant="caption" weight="medium">
                {test.modelA} vs {test.modelB}
              </Typography>
            </div>

            <TestCardMetrics>
              <MetricItem>
                <MetricValue trend={test.results.uplift > 0 ? 'positive' : 'negative'}>
                  {test.results.uplift > 0 ? '+' : ''}{test.results.uplift.toFixed(1)}%
                </MetricValue>
                <MetricLabel>Uplift</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue>{test.results.significance.toFixed(1)}%</MetricValue>
                <MetricLabel>Significance</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue>{test.participants.toLocaleString()}</MetricValue>
                <MetricLabel>Participants</MetricLabel>
              </MetricItem>
            </TestCardMetrics>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {test.tags?.map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '2px 6px',
                    background: '#f1f5f9',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#64748b'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </TestCard>
        ))}
      </TestsGrid>

      {filteredTests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Icon name="archive" size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
          <Typography variant="h6" color="secondary">
            No historical tests match your filters
          </Typography>
          <Typography variant="body2" color="tertiary">
            Try adjusting your filter criteria to see more tests
          </Typography>
        </div>
      )}
    </motion.div>
  );

  const renderAnalyticsTab = () => (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="trending-up" size={20} />
            <Typography variant="h6" weight="semibold">
              Test Performance Over Time
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="tests" 
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Tests Run"
            />
            <Line 
              type="monotone" 
              dataKey="winners" 
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Winning Tests"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <MetricCard
          title="Best Performing Test"
          value="Speed Optimization"
          icon="zap"
          trend={{ value: '+32.5% uplift', label: 'highest impact' }}
          color="green"
        />
        <MetricCard
          title="Most Tested Category"
          value="AI Models"
          icon="cpu"
          trend={{ value: '60% of tests', label: 'focus area' }}
          color="blue"
        />
        <MetricCard
          title="Average Test Duration"
          value="16.8 days"
          icon="clock"
          trend={{ value: 'Optimal length', label: 'for significance' }}
          color="purple"
        />
        <MetricCard
          title="Cumulative Revenue Impact"
          value="$359K"
          icon="dollar-sign"
          trend={{ value: 'YTD total', label: 'from winning tests' }}
          color="orange"
        />
      </div>
    </motion.div>
  );

  const renderLearningsTab = () => (
    <motion.div
      key="learnings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LearningsCard whileHover={{ scale: 1.01 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Icon name="book" size={24} />
          <Typography variant="h5" weight="semibold">
            Key Learnings from Historical Tests
          </Typography>
        </div>
        
        {keyLearnings.map((learning, index) => (
          <LearningItem key={index}>
            <LearningIcon type={learning.type}>
              <Icon name={learning.icon} size={16} />
            </LearningIcon>
            <div>
              <Typography variant="body1" weight="medium" style={{ marginBottom: '4px' }}>
                {learning.title}
              </Typography>
              <Typography variant="body2" color="secondary">
                {learning.description}
              </Typography>
            </div>
          </LearningItem>
        ))}
      </LearningsCard>

      {/* Detailed insights from specific tests */}
      <div style={{ display: 'grid', gap: '16px' }}>
        <ChartContainer whileHover={{ scale: 1.005 }}>
          <ChartHeader>
            <ChartTitle>
              <Icon name="target" size={20} />
              <Typography variant="h6" weight="semibold">
                Success Factors Analysis
              </Typography>
            </ChartTitle>
          </ChartHeader>
          <div style={{ padding: '20px' }}>
            <Typography variant="body2" style={{ marginBottom: '16px' }}>
              Analysis of factors contributing to successful A/B tests:
            </Typography>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="check-circle" size={16} style={{ color: '#10b981' }} />
                <Typography variant="body2">
                  <strong>Sample Size:</strong> Tests with 3000+ participants had 85% success rate
                </Typography>
              </li>
              <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="check-circle" size={16} style={{ color: '#10b981' }} />
                <Typography variant="body2">
                  <strong>Test Duration:</strong> 14-21 day tests show optimal balance of speed and reliability
                </Typography>
              </li>
              <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="check-circle" size={16} style={{ color: '#10b981' }} />
                <Typography variant="body2">
                  <strong>Focus Areas:</strong> Performance and personalization tests deliver highest impact
                </Typography>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="check-circle" size={16} style={{ color: '#10b981' }} />
                <Typography variant="body2">
                  <strong>Hypothesis Quality:</strong> Specific, measurable hypotheses increase success rate by 40%
                </Typography>
              </li>
            </ul>
          </div>
        </ChartContainer>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'tests':
        return renderTestsTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'learnings':
        return renderLearningsTab();
      default:
        return null;
    }
  };

  return (
    <ArchiveContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <ArchiveHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="archive" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                Historical Test Results Archive
              </Typography>
              <Typography variant="body2" color="secondary">
                Complete archive of past A/B tests with insights, learnings, and performance analytics
              </Typography>
            </div>
          </HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Badge variant="info" size="sm">
              {filteredTests.length} Tests Found
            </Badge>
          </div>
        </HeaderContent>
      </ArchiveHeader>

      {/* Export Section */}
      <div style={{ padding: '20px' }}>
        <ExportSection>
          <Icon name="download" size={20} />
          <div style={{ flex: 1 }}>
            <Typography variant="body2" weight="medium">
              Export Historical Data
            </Typography>
            <Typography variant="caption" color="secondary">
              Download test results, analytics, and insights for external analysis
            </Typography>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportTests}>
            <Icon name="download" size={16} />
            Export Data
          </Button>
        </ExportSection>
      </div>

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
    </ArchiveContainer>
  );
};

export default ABTestHistoricalArchive;