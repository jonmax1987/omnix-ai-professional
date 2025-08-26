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
import { useI18n } from '../../hooks/useI18n';

const CostAnalysisContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const CostAnalysisHeader = styled.div`
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
    ${props => props.theme.colors.emerald[500]} 0%, 
    ${props => props.theme.colors.emerald[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
`;

const CostSummary = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'trend'
})`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => 
    props.trend === 'positive' ? props.theme.colors.green[600] :
    props.trend === 'negative' ? props.theme.colors.red[600] :
    props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SummaryLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
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
  color: ${props => props.active ? props.theme.colors.emerald[600] : props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.emerald[500] : 'transparent'};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.emerald[500]};
    background: ${props => props.theme.colors.emerald[25]};
  }
`;

const ContentArea = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const ChartControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const CostBreakdownCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['efficiency', 'priority'].includes(prop)
})`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => {
    switch (props.efficiency) {
      case 'excellent':
        return props.theme.colors.green[200];
      case 'good':
        return props.theme.colors.blue[200];
      case 'poor':
        return props.theme.colors.yellow[200];
      case 'critical':
        return props.theme.colors.red[200];
      default:
        return props.theme.colors.border.subtle;
    }
  }};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.efficiency) {
        case 'excellent':
          return props.theme.colors.green[500];
        case 'good':
          return props.theme.colors.blue[500];
        case 'poor':
          return props.theme.colors.yellow[500];
        case 'critical':
          return props.theme.colors.red[500];
        default:
          return props.theme.colors.gray[500];
      }
    }};
    border-radius: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]} 0 0;
  }
`;

const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const OptimizationSection = styled.div`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.blue[25]} 0%, 
    ${props => props.theme.colors.indigo[25]} 100%);
  border: 1px solid ${props => props.theme.colors.blue[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const OptimizationItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'impact'
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid ${props => {
    switch (props.impact) {
      case 'high':
        return props.theme.colors.green[300];
      case 'medium':
        return props.theme.colors.yellow[300];
      case 'low':
        return props.theme.colors.blue[300];
      default:
        return props.theme.colors.gray[300];
    }
  }};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const OptimizationIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'impact'
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    switch (props.impact) {
      case 'high':
        return props.theme.colors.green[500];
      case 'medium':
        return props.theme.colors.yellow[500];
      case 'low':
        return props.theme.colors.blue[500];
      default:
        return props.theme.colors.gray[500];
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const OptimizationContent = styled.div`
  flex: 1;
`;

const SavingsEstimate = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const CostConfigSection = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[4]};
`;

const ConfigGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const ConfigLabel = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const ConfigInput = styled(Input)`
  width: 100%;
`;

const ROICard = styled.div`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.green[100]} 0%, 
    ${props => props.theme.colors.emerald[100]} 100%);
  border: 2px solid ${props => props.theme.colors.green[300]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[5]};
`;

const ROIValue = styled.div`
  font-size: 3rem;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.green[600]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const ROILabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.green[700]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const CostTable = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.gray[100]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  align-items: center;
  
  &:hover {
    background: ${props => props.theme.colors.gray[50]};
  }
`;

// Custom tooltip component for cost charts
const CostTooltip = ({ active, payload, label }) => {
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
              {entry.name}: ${entry.value?.toLocaleString() || 0}
            </Typography>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ABTestCostAnalysis = ({
  testData,
  onCostConfigUpdate,
  onOptimizationApply,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  
  // Cost configuration state
  const [costConfig, setCostConfig] = useState({
    computeCostPerHour: 0.15,
    storageCostPerGB: 0.023,
    networkCostPerGB: 0.09,
    apiCallCost: 0.002,
    engineerHourlyRate: 75,
    overheadMultiplier: 1.2
  });

  // Mock cost data
  const [costData, setCostData] = useState({
    totalCost: 2847.50,
    totalRevenue: 12450.00,
    roi: 337.2,
    breakdown: {
      compute: 1245.30,
      storage: 156.80,
      network: 234.70,
      apiCalls: 892.40,
      engineering: 318.30
    },
    timeline: [
      { date: '2024-07-20', compute: 45.2, storage: 5.1, network: 8.3, apiCalls: 32.1, engineering: 12.0, total: 102.7 },
      { date: '2024-07-27', compute: 52.8, storage: 5.8, network: 9.1, apiCalls: 38.5, engineering: 15.0, total: 121.2 },
      { date: '2024-08-03', compute: 48.9, storage: 6.2, network: 8.7, apiCalls: 35.2, engineering: 18.0, total: 117.0 },
      { date: '2024-08-10', compute: 55.1, storage: 6.8, network: 10.2, apiCalls: 41.3, engineering: 20.0, total: 133.4 },
      { date: '2024-08-17', compute: 59.3, storage: 7.1, network: 11.5, apiCalls: 44.8, engineering: 22.5, total: 145.2 }
    ]
  });

  const [testCosts, setTestCosts] = useState([
    {
      id: 'ab-001',
      name: 'Claude Sonnet vs Haiku Speed Test',
      totalCost: 847.50,
      efficiency: 'excellent',
      roi: 425.7,
      participants: 2847,
      costPerParticipant: 0.298,
      breakdown: {
        compute: 345.20,
        storage: 42.30,
        network: 78.90,
        apiCalls: 289.60,
        engineering: 91.50
      },
      projectedSavings: 156.80
    },
    {
      id: 'ab-002',
      name: 'Personalization Algorithm Test',
      totalCost: 1245.80,
      efficiency: 'good',
      roi: 287.3,
      participants: 1256,
      costPerParticipant: 0.992,
      breakdown: {
        compute: 456.70,
        storage: 67.20,
        network: 89.40,
        apiCalls: 478.90,
        engineering: 153.60
      },
      projectedSavings: 89.40
    },
    {
      id: 'ab-003',
      name: 'Checkout Flow Optimization',
      totalCost: 754.20,
      efficiency: 'poor',
      roi: 145.8,
      participants: 3421,
      costPerParticipant: 0.220,
      breakdown: {
        compute: 287.40,
        storage: 46.50,
        network: 66.30,
        apiCalls: 234.50,
        engineering: 119.50
      },
      projectedSavings: 234.70
    }
  ]);

  const [optimizations, setOptimizations] = useState([
    {
      id: 'opt-001',
      title: 'Reduce API Call Frequency',
      description: 'Implement intelligent caching to reduce redundant API calls by 35%',
      impact: 'high',
      estimatedSavings: 312.34,
      implementationCost: 45.00,
      category: 'apiCalls',
      difficulty: 'medium'
    },
    {
      id: 'opt-002',
      title: 'Optimize Compute Resource Allocation',
      description: 'Right-size compute instances based on actual usage patterns',
      impact: 'high',
      estimatedSavings: 278.65,
      implementationCost: 120.00,
      category: 'compute',
      difficulty: 'low'
    },
    {
      id: 'opt-003',
      title: 'Implement Data Compression',
      description: 'Enable data compression to reduce storage and network costs',
      impact: 'medium',
      estimatedSavings: 89.20,
      implementationCost: 30.00,
      category: 'storage',
      difficulty: 'low'
    },
    {
      id: 'opt-004',
      title: 'Streamline Engineering Processes',
      description: 'Automate repetitive tasks to reduce engineering time requirements',
      impact: 'medium',
      estimatedSavings: 156.78,
      implementationCost: 200.00,
      category: 'engineering',
      difficulty: 'high'
    }
  ]);

  const tabs = [
    { id: 'overview', label: 'Cost Overview', icon: 'dollar-sign' },
    { id: 'breakdown', label: 'Cost Breakdown', icon: 'pie-chart' },
    { id: 'optimization', label: 'Cost Optimization', icon: 'trending-down' },
    { id: 'settings', label: 'Cost Settings', icon: 'settings' }
  ];

  const costColors = {
    compute: '#3b82f6',
    storage: '#10b981',
    network: '#f59e0b',
    apiCalls: '#8b5cf6',
    engineering: '#ef4444'
  };

  const handleConfigChange = useCallback((field, value) => {
    setCostConfig(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
    onCostConfigUpdate?.({ [field]: parseFloat(value) || 0 });
  }, [onCostConfigUpdate]);

  const handleOptimizationApply = useCallback((optimizationId) => {
    const optimization = optimizations.find(opt => opt.id === optimizationId);
    if (optimization) {
      console.log('Applying optimization:', optimization.title);
      onOptimizationApply?.(optimization);
    }
  }, [optimizations, onOptimizationApply]);

  const totalOptimizationSavings = useMemo(() => {
    return optimizations.reduce((total, opt) => total + opt.estimatedSavings - opt.implementationCost, 0);
  }, [optimizations]);

  const renderOverviewTab = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ROI Card */}
      <ROICard>
        <ROIValue>{costData.roi}%</ROIValue>
        <ROILabel>Return on Investment</ROILabel>
        <Typography variant="body2" color="secondary" style={{ marginTop: '8px' }}>
          Revenue: ${costData.totalRevenue.toLocaleString()} • Cost: ${costData.totalCost.toLocaleString()}
        </Typography>
      </ROICard>

      {/* Key Metrics */}
      <MetricsGrid>
        <MetricCard
          title="Total Test Cost"
          value={`$${costData.totalCost.toLocaleString()}`}
          icon="dollar-sign"
          trend={{ 
            value: '+12.5%', 
            label: 'vs last month' 
          }}
          color="red"
        />
        <MetricCard
          title="Revenue Generated"
          value={`$${costData.totalRevenue.toLocaleString()}`}
          icon="trending-up"
          trend={{ 
            value: '+45.3%', 
            label: 'from optimizations' 
          }}
          color="green"
        />
        <MetricCard
          title="Cost Per Participant"
          value="$0.83"
          icon="users"
          trend={{ 
            value: '-8.2%', 
            label: 'efficiency gain' 
          }}
          color="blue"
        />
        <MetricCard
          title="Potential Savings"
          value={`$${totalOptimizationSavings.toLocaleString()}`}
          icon="trending-down"
          trend={{ 
            value: `${optimizations.length} optimizations`, 
            label: 'identified' 
          }}
          color="purple"
        />
      </MetricsGrid>

      {/* Cost Timeline */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="trending-up" size={20} />
            <Typography variant="h6" weight="semibold">
              Cost Trends Over Time
            </Typography>
          </ChartTitle>
          <ChartControls>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </ChartControls>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={costData.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CostTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="compute"
              stackId="1"
              stroke={costColors.compute}
              fill={`${costColors.compute}30`}
              name="Compute"
            />
            <Area
              type="monotone"
              dataKey="apiCalls"
              stackId="1"
              stroke={costColors.apiCalls}
              fill={`${costColors.apiCalls}30`}
              name="API Calls"
            />
            <Area
              type="monotone"
              dataKey="engineering"
              stackId="1"
              stroke={costColors.engineering}
              fill={`${costColors.engineering}30`}
              name="Engineering"
            />
            <Area
              type="monotone"
              dataKey="network"
              stackId="1"
              stroke={costColors.network}
              fill={`${costColors.network}30`}
              name="Network"
            />
            <Area
              type="monotone"
              dataKey="storage"
              stackId="1"
              stroke={costColors.storage}
              fill={`${costColors.storage}30`}
              name="Storage"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Test Cost Comparison */}
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Test Cost Analysis
      </Typography>
      
      <TestGrid>
        {testCosts.map((test, index) => (
          <CostBreakdownCard
            key={test.id}
            efficiency={test.efficiency}
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <Typography variant="h6" weight="semibold" style={{ marginBottom: '4px' }}>
                  {test.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Test ID: {test.id}
                </Typography>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Badge 
                    variant={
                      test.efficiency === 'excellent' ? 'success' : 
                      test.efficiency === 'good' ? 'info' :
                      test.efficiency === 'poor' ? 'warning' : 'error'
                    } 
                    size="xs"
                  >
                    {test.efficiency.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" size="xs">
                    ${test.costPerParticipant.toFixed(3)}/participant
                  </Badge>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Typography variant="h6" weight="bold" color="primary">
                  ${test.totalCost.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Total Cost
                </Typography>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                <Typography variant="body2" weight="bold" color="success">
                  {test.roi}%
                </Typography>
                <Typography variant="caption" color="secondary">
                  ROI
                </Typography>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '6px' }}>
                <Typography variant="body2" weight="bold">
                  {test.participants.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Participants
                </Typography>
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '6px' }}>
              <Typography variant="caption" weight="medium" style={{ marginBottom: '8px' }}>
                Cost Breakdown:
              </Typography>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', fontSize: '11px' }}>
                <div>Compute: ${test.breakdown.compute}</div>
                <div>API: ${test.breakdown.apiCalls}</div>
                <div>Storage: ${test.breakdown.storage}</div>
                <div>Engineering: ${test.breakdown.engineering}</div>
              </div>
              {test.projectedSavings > 0 && (
                <div style={{ marginTop: '8px', padding: '4px 8px', background: '#dcfce7', borderRadius: '4px' }}>
                  <Typography variant="caption" color="success" weight="medium">
                    💡 Potential savings: ${test.projectedSavings}
                  </Typography>
                </div>
              )}
            </div>
          </CostBreakdownCard>
        ))}
      </TestGrid>
    </motion.div>
  );

  const renderBreakdownTab = () => (
    <motion.div
      key="breakdown"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cost Breakdown Pie Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <ChartContainer whileHover={{ scale: 1.005 }}>
          <ChartHeader>
            <ChartTitle>
              <Icon name="pie-chart" size={20} />
              <Typography variant="h6" weight="semibold">
                Cost Distribution
              </Typography>
            </ChartTitle>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Compute', value: costData.breakdown.compute, fill: costColors.compute },
                  { name: 'API Calls', value: costData.breakdown.apiCalls, fill: costColors.apiCalls },
                  { name: 'Engineering', value: costData.breakdown.engineering, fill: costColors.engineering },
                  { name: 'Network', value: costData.breakdown.network, fill: costColors.network },
                  { name: 'Storage', value: costData.breakdown.storage, fill: costColors.storage }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer whileHover={{ scale: 1.005 }}>
          <ChartHeader>
            <ChartTitle>
              <Icon name="bar-chart" size={20} />
              <Typography variant="h6" weight="semibold">
                Cost by Test
              </Typography>
            </ChartTitle>
          </ChartHeader>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                content={<CostTooltip />}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Total Cost']}
              />
              <Bar 
                dataKey="totalCost" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Detailed Cost Table */}
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Detailed Cost Breakdown
      </Typography>
      
      <CostTable>
        <TableHeader>
          <div>Test Name</div>
          <div>Total Cost</div>
          <div>Cost/Participant</div>
          <div>ROI</div>
          <div>Efficiency</div>
        </TableHeader>
        {testCosts.map((test) => (
          <TableRow key={test.id}>
            <div>
              <Typography variant="body2" weight="medium">
                {test.name}
              </Typography>
              <Typography variant="caption" color="secondary">
                {test.participants.toLocaleString()} participants
              </Typography>
            </div>
            <div>
              <Typography variant="body2" weight="semibold">
                ${test.totalCost.toLocaleString()}
              </Typography>
            </div>
            <div>
              <Typography variant="body2">
                ${test.costPerParticipant.toFixed(3)}
              </Typography>
            </div>
            <div>
              <Typography variant="body2" color={test.roi > 200 ? 'success' : 'secondary'}>
                {test.roi}%
              </Typography>
            </div>
            <div>
              <Badge 
                variant={
                  test.efficiency === 'excellent' ? 'success' : 
                  test.efficiency === 'good' ? 'info' :
                  test.efficiency === 'poor' ? 'warning' : 'error'
                } 
                size="xs"
              >
                {test.efficiency}
              </Badge>
            </div>
          </TableRow>
        ))}
      </CostTable>

      {/* Cost Breakdown by Category Chart */}
      <ChartContainer whileHover={{ scale: 1.005 }} style={{ marginTop: '20px' }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="layers" size={20} />
            <Typography variant="h6" weight="semibold">
              Cost Categories Comparison
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={testCosts.map(test => ({
              name: test.name.split(' ').slice(0, 3).join(' '), // Shorten names
              ...test.breakdown
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<CostTooltip />} />
            <Legend />
            <Bar dataKey="compute" stackId="a" fill={costColors.compute} name="Compute" />
            <Bar dataKey="apiCalls" stackId="a" fill={costColors.apiCalls} name="API Calls" />
            <Bar dataKey="engineering" stackId="a" fill={costColors.engineering} name="Engineering" />
            <Bar dataKey="network" stackId="a" fill={costColors.network} name="Network" />
            <Bar dataKey="storage" stackId="a" fill={costColors.storage} name="Storage" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderOptimizationTab = () => (
    <motion.div
      key="optimization"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Typography variant="h5" weight="semibold">
          Cost Optimization Opportunities
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Typography variant="body2" color="success" weight="semibold">
            Total Potential Savings: ${totalOptimizationSavings.toLocaleString()}
          </Typography>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <OptimizationSection>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Icon name="lightbulb" size={24} />
          <Typography variant="h6" weight="semibold">
            Recommended Optimizations
          </Typography>
        </div>
        
        {optimizations.map((optimization, index) => (
          <OptimizationItem 
            key={optimization.id} 
            impact={optimization.impact}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <OptimizationIcon impact={optimization.impact}>
              <Icon name={
                optimization.impact === 'high' ? 'trending-down' :
                optimization.impact === 'medium' ? 'minus-circle' :
                'info'
              } size={16} />
            </OptimizationIcon>
            <OptimizationContent>
              <Typography variant="body1" weight="medium" style={{ marginBottom: '4px' }}>
                {optimization.title}
              </Typography>
              <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
                {optimization.description}
              </Typography>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SavingsEstimate>
                  <Icon name="trending-down" size={14} />
                  <Typography variant="caption" weight="medium" color="success">
                    ${optimization.estimatedSavings.toLocaleString()} savings
                  </Typography>
                </SavingsEstimate>
                <Typography variant="caption" color="secondary">
                  Implementation cost: ${optimization.implementationCost.toLocaleString()}
                </Typography>
                <Badge 
                  variant={optimization.difficulty === 'low' ? 'success' : 
                          optimization.difficulty === 'medium' ? 'warning' : 'error'} 
                  size="xs"
                >
                  {optimization.difficulty} effort
                </Badge>
              </div>
            </OptimizationContent>
            <div>
              <Button 
                size="sm" 
                variant="primary"
                onClick={() => handleOptimizationApply(optimization.id)}
              >
                Apply
              </Button>
            </div>
          </OptimizationItem>
        ))}
      </OptimizationSection>

      {/* Optimization Impact Chart */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="trending-down" size={20} />
            <Typography variant="h6" weight="semibold">
              Optimization Impact Analysis
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={optimizations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="title" 
              stroke="#64748b"
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              content={<CostTooltip />}
              formatter={(value) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Bar 
              dataKey="estimatedSavings" 
              fill="#10b981"
              name="Estimated Savings"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="implementationCost" 
              fill="#ef4444"
              name="Implementation Cost"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderSettingsTab = () => (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Cost Configuration Settings
      </Typography>

      <CostConfigSection>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
          Pricing Configuration
        </Typography>
        <ConfigGrid>
          <ConfigGroup>
            <ConfigLabel>Compute Cost ($/hour)</ConfigLabel>
            <ConfigInput
              type="number"
              step="0.001"
              value={costConfig.computeCostPerHour}
              onChange={(e) => handleConfigChange('computeCostPerHour', e.target.value)}
            />
          </ConfigGroup>

          <ConfigGroup>
            <ConfigLabel>Storage Cost ($/GB/month)</ConfigLabel>
            <ConfigInput
              type="number"
              step="0.001"
              value={costConfig.storageCostPerGB}
              onChange={(e) => handleConfigChange('storageCostPerGB', e.target.value)}
            />
          </ConfigGroup>

          <ConfigGroup>
            <ConfigLabel>Network Cost ($/GB)</ConfigLabel>
            <ConfigInput
              type="number"
              step="0.001"
              value={costConfig.networkCostPerGB}
              onChange={(e) => handleConfigChange('networkCostPerGB', e.target.value)}
            />
          </ConfigGroup>

          <ConfigGroup>
            <ConfigLabel>API Call Cost ($)</ConfigLabel>
            <ConfigInput
              type="number"
              step="0.0001"
              value={costConfig.apiCallCost}
              onChange={(e) => handleConfigChange('apiCallCost', e.target.value)}
            />
          </ConfigGroup>

          <ConfigGroup>
            <ConfigLabel>Engineer Hourly Rate ($)</ConfigLabel>
            <ConfigInput
              type="number"
              value={costConfig.engineerHourlyRate}
              onChange={(e) => handleConfigChange('engineerHourlyRate', e.target.value)}
            />
          </ConfigGroup>

          <ConfigGroup>
            <ConfigLabel>Overhead Multiplier</ConfigLabel>
            <ConfigInput
              type="number"
              step="0.1"
              value={costConfig.overheadMultiplier}
              onChange={(e) => handleConfigChange('overheadMultiplier', e.target.value)}
            />
          </ConfigGroup>
        </ConfigGrid>
      </CostConfigSection>

      <CostConfigSection>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
          Cost Tracking Settings
        </Typography>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Typography variant="body1" weight="medium">
                Enable Real-time Cost Tracking
              </Typography>
              <Typography variant="body2" color="secondary">
                Track costs in real-time as tests run
              </Typography>
            </div>
            <Button variant="secondary" size="sm">
              Enabled
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Typography variant="body1" weight="medium">
                Cost Alert Thresholds
              </Typography>
              <Typography variant="body2" color="secondary">
                Get notified when costs exceed limits
              </Typography>
            </div>
            <Button variant="secondary" size="sm">
              Configure
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Typography variant="body1" weight="medium">
                Export Cost Reports
              </Typography>
              <Typography variant="body2" color="secondary">
                Generate detailed cost analysis reports
              </Typography>
            </div>
            <Button variant="secondary" size="sm">
              <Icon name="download" size={16} />
              Export
            </Button>
          </div>
        </div>
      </CostConfigSection>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'breakdown':
        return renderBreakdownTab();
      case 'optimization':
        return renderOptimizationTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return null;
    }
  };

  return (
    <CostAnalysisContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <CostAnalysisHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="dollar-sign" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                A/B Test Cost Analysis & Optimization
              </Typography>
              <Typography variant="body2" color="secondary">
                Comprehensive cost tracking, analysis, and optimization for maximum ROI
              </Typography>
            </div>
          </HeaderLeft>
          <CostSummary>
            <SummaryItem>
              <SummaryValue trend="negative">
                ${costData.totalCost.toLocaleString()}
              </SummaryValue>
              <SummaryLabel>Total Cost</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue trend="positive">
                {costData.roi}%
              </SummaryValue>
              <SummaryLabel>ROI</SummaryLabel>
            </SummaryItem>
            <SummaryItem>
              <SummaryValue trend="positive">
                ${totalOptimizationSavings.toLocaleString()}
              </SummaryValue>
              <SummaryLabel>Potential Savings</SummaryLabel>
            </SummaryItem>
          </CostSummary>
        </HeaderContent>
      </CostAnalysisHeader>

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
    </CostAnalysisContainer>
  );
};

export default ABTestCostAnalysis;