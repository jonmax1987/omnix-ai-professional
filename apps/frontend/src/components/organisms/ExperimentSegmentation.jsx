import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sankey } from 'recharts';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import Progress from '../atoms/Progress';
import MetricCard from '../molecules/MetricCard';
import { useI18n } from '../../hooks/useI18n';

const SegmentationContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const SegmentationHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.indigo[25]} 0%, 
    ${props => props.theme.colors.purple[25]} 100%);
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
    ${props => props.theme.colors.indigo[500]} 0%, 
    ${props => props.theme.colors.purple[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
`;

const SegmentStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: rgba(255, 255, 255, 0.8);
  border-radius: ${props => props.theme.spacing[2]};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.indigo[600]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
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
  color: ${props => props.active ? props.theme.colors.indigo[600] : props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.indigo[500] : 'transparent'};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.indigo[500]};
    background: ${props => props.theme.colors.indigo[25]};
  }
`;

const ContentArea = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const SegmentBuilder = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const RuleGroup = styled(motion.div)`
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.primary};
`;

const RuleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const RuleCondition = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ConditionSelect = styled.select`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.indigo[500]};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.indigo[100]};
  }
`;

const ConditionInput = styled(Input)`
  min-width: 120px;
`;

const SegmentCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['size', 'performance'].includes(prop)
})`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => {
    switch (props.performance) {
      case 'high':
        return props.theme.colors.green[200];
      case 'medium':
        return props.theme.colors.yellow[200];
      case 'low':
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
      switch (props.performance) {
        case 'high':
          return props.theme.colors.green[500];
        case 'medium':
          return props.theme.colors.yellow[500];
        case 'low':
          return props.theme.colors.red[500];
        default:
          return props.theme.colors.gray[500];
      }
    }};
    border-radius: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]} 0 0;
  }
`;

const SegmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const SegmentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const SegmentTitle = styled.div`
  flex: 1;
`;

const SegmentMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

const InsightsSection = styled.div`
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.emerald[25]} 0%, 
    ${props => props.theme.colors.teal[25]} 100%);
  border: 1px solid ${props => props.theme.colors.emerald[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const InsightItem = styled(motion.div).withConfig({
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

const InsightIcon = styled.div.withConfig({
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

const InsightContent = styled.div`
  flex: 1;
`;

// Custom tooltip for segmentation charts
const SegmentationTooltip = ({ active, payload, label }) => {
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
              {entry.unit && ` ${entry.unit}`}
            </Typography>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ExperimentSegmentation = ({
  testData,
  onSegmentCreate,
  onSegmentUpdate,
  onSegmentApply,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedSegment, setSelectedSegment] = useState(null);
  
  // Segmentation rules state
  const [segmentRules, setSegmentRules] = useState([
    {
      id: 'rule-1',
      field: 'user_type',
      operator: 'equals',
      value: 'premium',
      connector: 'and'
    }
  ]);

  // Mock segment data
  const [segments, setSegments] = useState([
    {
      id: 'segment-1',
      name: 'Premium Customers',
      description: 'Users with premium subscriptions and high engagement',
      size: 15420,
      percentage: 23.4,
      performance: 'high',
      conversionRate: 18.7,
      avgOrderValue: 156.80,
      ltv: 892.50,
      rules: [
        { field: 'subscription', operator: 'equals', value: 'premium' },
        { field: 'engagement_score', operator: 'greater_than', value: '75' }
      ],
      testResults: {
        participationRate: 87.3,
        significance: 96.8,
        uplift: 24.7
      }
    },
    {
      id: 'segment-2',
      name: 'Mobile-First Users',
      description: 'Users who primarily access from mobile devices',
      size: 28460,
      percentage: 43.2,
      performance: 'medium',
      conversionRate: 12.4,
      avgOrderValue: 89.30,
      ltv: 345.70,
      rules: [
        { field: 'device_type', operator: 'equals', value: 'mobile' },
        { field: 'session_count', operator: 'greater_than', value: '10' }
      ],
      testResults: {
        participationRate: 76.5,
        significance: 89.2,
        uplift: 15.3
      }
    },
    {
      id: 'segment-3',
      name: 'High-Value Prospects',
      description: 'New users with high predicted lifetime value',
      size: 8930,
      percentage: 13.6,
      performance: 'high',
      conversionRate: 22.1,
      avgOrderValue: 245.60,
      ltv: 1250.00,
      rules: [
        { field: 'predicted_ltv', operator: 'greater_than', value: '1000' },
        { field: 'days_since_signup', operator: 'less_than', value: '30' }
      ],
      testResults: {
        participationRate: 92.7,
        significance: 98.5,
        uplift: 35.2
      }
    },
    {
      id: 'segment-4',
      name: 'At-Risk Users',
      description: 'Users showing signs of churn with declining engagement',
      size: 12890,
      percentage: 19.6,
      performance: 'low',
      conversionRate: 6.8,
      avgOrderValue: 45.20,
      ltv: 123.40,
      rules: [
        { field: 'last_activity', operator: 'greater_than', value: '14' },
        { field: 'engagement_trend', operator: 'equals', value: 'declining' }
      ],
      testResults: {
        participationRate: 45.8,
        significance: 67.3,
        uplift: -8.9
      }
    }
  ]);

  const [segmentationInsights, setSegmentationInsights] = useState([
    {
      id: 'insight-1',
      title: 'Premium Segment Outperforms',
      description: 'Premium customers show 35% higher test engagement and 24% better conversion rates',
      impact: 'high',
      recommendation: 'Allocate 40% of test traffic to premium segment for faster significance',
      icon: 'trending-up'
    },
    {
      id: 'insight-2',
      title: 'Mobile Optimization Opportunity',
      description: 'Mobile-first users represent 43% of traffic but underperform by 15% vs desktop',
      impact: 'medium',
      recommendation: 'Create mobile-specific test variants for better performance',
      icon: 'smartphone'
    },
    {
      id: 'insight-3',
      title: 'At-Risk Segment Needs Attention',
      description: 'Declining users show poor test engagement and negative conversion trends',
      impact: 'high',
      recommendation: 'Design retention-focused experiments for this segment',
      icon: 'alert-triangle'
    },
    {
      id: 'insight-4',
      title: 'High-Value Prospects Convert Best',
      description: 'New high-LTV users show 92% test participation and 35% uplift rates',
      impact: 'medium',
      recommendation: 'Fast-track experiments for this segment with reduced sample sizes',
      icon: 'target'
    }
  ]);

  // Performance data for segments
  const [performanceData, setPerformanceData] = useState([
    { segment: 'Premium', conversion: 18.7, participation: 87.3, satisfaction: 94.2 },
    { segment: 'Mobile-First', conversion: 12.4, participation: 76.5, satisfaction: 78.6 },
    { segment: 'High-Value', conversion: 22.1, participation: 92.7, satisfaction: 96.8 },
    { segment: 'At-Risk', conversion: 6.8, participation: 45.8, satisfaction: 52.3 }
  ]);

  const tabs = [
    { id: 'builder', label: 'Segment Builder', icon: 'settings' },
    { id: 'segments', label: 'Active Segments', icon: 'users' },
    { id: 'performance', label: 'Segment Performance', icon: 'bar-chart' },
    { id: 'insights', label: 'Segmentation Insights', icon: 'lightbulb' }
  ];

  const availableFields = [
    { value: 'user_type', label: 'User Type' },
    { value: 'subscription', label: 'Subscription Tier' },
    { value: 'device_type', label: 'Device Type' },
    { value: 'engagement_score', label: 'Engagement Score' },
    { value: 'ltv', label: 'Lifetime Value' },
    { value: 'predicted_ltv', label: 'Predicted LTV' },
    { value: 'days_since_signup', label: 'Days Since Signup' },
    { value: 'last_activity', label: 'Days Since Last Activity' },
    { value: 'session_count', label: 'Total Sessions' },
    { value: 'engagement_trend', label: 'Engagement Trend' },
    { value: 'geo_location', label: 'Geographic Location' },
    { value: 'referral_source', label: 'Referral Source' }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_equal', label: 'Greater or Equal' },
    { value: 'less_equal', label: 'Less or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'in', label: 'In List' },
    { value: 'not_in', label: 'Not In List' }
  ];

  const addRule = useCallback(() => {
    setSegmentRules(prev => [
      ...prev,
      {
        id: `rule-${Date.now()}`,
        field: 'user_type',
        operator: 'equals',
        value: '',
        connector: 'and'
      }
    ]);
  }, []);

  const removeRule = useCallback((ruleId) => {
    setSegmentRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, []);

  const updateRule = useCallback((ruleId, updates) => {
    setSegmentRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  }, []);

  const handleCreateSegment = useCallback(() => {
    const newSegment = {
      id: `segment-${Date.now()}`,
      name: 'New Segment',
      description: 'Custom segment created from rules',
      rules: segmentRules,
      size: Math.floor(Math.random() * 20000) + 5000,
      percentage: Math.random() * 30 + 10,
      performance: 'medium',
      conversionRate: Math.random() * 10 + 8,
      avgOrderValue: Math.random() * 100 + 50,
      ltv: Math.random() * 500 + 200
    };
    
    setSegments(prev => [...prev, newSegment]);
    onSegmentCreate?.(newSegment);
  }, [segmentRules, onSegmentCreate]);

  const totalSegmentSize = useMemo(() => {
    return segments.reduce((sum, segment) => sum + segment.size, 0);
  }, [segments]);

  const renderBuilderTab = () => (
    <motion.div
      key="builder"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Typography variant="h5" weight="semibold">
          Segment Rule Builder
        </Typography>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" size="sm" onClick={addRule}>
            <Icon name="plus" size={16} />
            Add Rule
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleCreateSegment}
            disabled={segmentRules.length === 0}
          >
            <Icon name="save" size={16} />
            Create Segment
          </Button>
        </div>
      </div>

      <SegmentBuilder>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
          Define Segmentation Rules
        </Typography>
        
        {segmentRules.map((rule, index) => (
          <RuleGroup
            key={rule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <RuleHeader>
              <Typography variant="body1" weight="medium">
                Rule {index + 1}
              </Typography>
              <Button 
                size="xs" 
                variant="ghost" 
                onClick={() => removeRule(rule.id)}
                disabled={segmentRules.length === 1}
              >
                <Icon name="trash" size={14} />
              </Button>
            </RuleHeader>
            
            <RuleCondition>
              {index > 0 && (
                <>
                  <ConditionSelect
                    value={rule.connector}
                    onChange={(e) => updateRule(rule.id, { connector: e.target.value })}
                  >
                    <option value="and">AND</option>
                    <option value="or">OR</option>
                  </ConditionSelect>
                  <Typography variant="body2" color="secondary">where</Typography>
                </>
              )}
              
              <ConditionSelect
                value={rule.field}
                onChange={(e) => updateRule(rule.id, { field: e.target.value })}
              >
                {availableFields.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </ConditionSelect>
              
              <ConditionSelect
                value={rule.operator}
                onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
              >
                {operators.map(op => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </ConditionSelect>
              
              <ConditionInput
                value={rule.value}
                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                placeholder="Value"
              />
            </RuleCondition>
          </RuleGroup>
        ))}
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Typography variant="body2" color="secondary">
            Estimated segment size: ~{Math.floor(Math.random() * 15000 + 5000).toLocaleString()} users ({(Math.random() * 20 + 10).toFixed(1)}% of total)
          </Typography>
        </div>
      </SegmentBuilder>

      {/* Quick Segment Templates */}
      <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
        Quick Segment Templates
      </Typography>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {[
          { name: 'High-Value Users', desc: 'LTV > $500 + Premium subscription', rules: 2 },
          { name: 'Mobile Power Users', desc: 'Mobile device + High engagement', rules: 2 },
          { name: 'New User Onboarding', desc: 'Signed up < 7 days ago', rules: 1 },
          { name: 'Churn Risk', desc: 'Declining engagement + No recent activity', rules: 2 }
        ].map((template, index) => (
          <motion.div
            key={template.name}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
            onClick={() => {
              // Apply template logic here
              console.log('Applying template:', template.name);
            }}
          >
            <Typography variant="body1" weight="medium" style={{ marginBottom: '4px' }}>
              {template.name}
            </Typography>
            <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
              {template.desc}
            </Typography>
            <Badge variant="info" size="xs">
              {template.rules} rule{template.rules > 1 ? 's' : ''}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderSegmentsTab = () => (
    <motion.div
      key="segments"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Typography variant="h5" weight="semibold">
          Active User Segments
        </Typography>
        <Typography variant="body2" color="secondary">
          Total users segmented: {totalSegmentSize.toLocaleString()}
        </Typography>
      </div>

      {/* Segments Grid */}
      <SegmentGrid>
        {segments.map((segment, index) => (
          <SegmentCard
            key={segment.id}
            performance={segment.performance}
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <SegmentHeader>
              <SegmentTitle>
                <Typography variant="h6" weight="semibold" style={{ marginBottom: '4px' }}>
                  {segment.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {segment.description}
                </Typography>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Badge 
                    variant={
                      segment.performance === 'high' ? 'success' : 
                      segment.performance === 'medium' ? 'warning' : 'error'
                    } 
                    size="xs"
                  >
                    {segment.performance.toUpperCase()} PERFORMANCE
                  </Badge>
                  <Badge variant="info" size="xs">
                    {segment.size.toLocaleString()} users
                  </Badge>
                </div>
              </SegmentTitle>
              <div style={{ textAlign: 'right' }}>
                <Typography variant="h5" weight="bold" color="primary">
                  {segment.percentage.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="secondary">
                  of total users
                </Typography>
              </div>
            </SegmentHeader>

            <SegmentMetrics>
              <MetricItem>
                <MetricValue trend={segment.conversionRate > 15 ? 'positive' : 'neutral'}>
                  {segment.conversionRate}%
                </MetricValue>
                <MetricLabel>Conversion Rate</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue>${segment.avgOrderValue}</MetricValue>
                <MetricLabel>Avg Order Value</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue>${segment.ltv}</MetricValue>
                <MetricLabel>Lifetime Value</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue trend={segment.testResults?.uplift > 0 ? 'positive' : 'negative'}>
                  {segment.testResults?.uplift > 0 ? '+' : ''}{segment.testResults?.uplift}%
                </MetricValue>
                <MetricLabel>Test Uplift</MetricLabel>
              </MetricItem>
            </SegmentMetrics>

            <div style={{ marginTop: '12px' }}>
              <Typography variant="caption" weight="medium" style={{ marginBottom: '8px' }}>
                Segment Rules:
              </Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {segment.rules.map((rule, ruleIndex) => (
                  <Typography key={ruleIndex} variant="caption" color="secondary" style={{ 
                    padding: '2px 8px',
                    background: '#f1f5f9',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    {availableFields.find(f => f.value === rule.field)?.label} {operators.find(o => o.value === rule.operator)?.label} {rule.value}
                  </Typography>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <Button size="xs" variant="secondary" style={{ flex: 1 }}>
                <Icon name="edit" size={12} />
                Edit
              </Button>
              <Button size="xs" variant="primary" style={{ flex: 1 }}>
                <Icon name="play" size={12} />
                Run Test
              </Button>
            </div>
          </SegmentCard>
        ))}
      </SegmentGrid>

      {/* Segment Distribution Chart */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="pie-chart" size={20} />
            <Typography variant="h6" weight="semibold">
              User Distribution by Segment
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={segments.map(s => ({ name: s.name, value: s.size, percentage: s.percentage }))}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            >
              {segments.map((segment, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    segment.performance === 'high' ? '#10b981' :
                    segment.performance === 'medium' ? '#f59e0b' : '#ef4444'
                  } 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [value.toLocaleString(), 'Users']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderPerformanceTab = () => (
    <motion.div
      key="performance"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Segment Performance Analysis
      </Typography>

      {/* Performance Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        <MetricCard
          title="Best Performing Segment"
          value="High-Value Prospects"
          icon="trophy"
          trend={{ value: '22.1% conversion', label: 'rate achieved' }}
          color="green"
        />
        <MetricCard
          title="Largest Segment"
          value="Mobile-First Users"
          icon="users"
          trend={{ value: '43.2% of users', label: 'total coverage' }}
          color="blue"
        />
        <MetricCard
          title="Highest LTV"
          value="$1,250"
          icon="dollar-sign"
          trend={{ value: 'High-Value Prospects', label: 'segment average' }}
          color="purple"
        />
        <MetricCard
          title="Test Participation"
          value="76.8%"
          icon="activity"
          trend={{ value: 'Average across', label: 'all segments' }}
          color="orange"
        />
      </div>

      {/* Segment Comparison Chart */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="bar-chart" size={20} />
            <Typography variant="h6" weight="semibold">
              Segment Performance Comparison
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="segment" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<SegmentationTooltip />} />
            <Legend />
            <Bar dataKey="conversion" fill="#3b82f6" name="Conversion Rate (%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="participation" fill="#10b981" name="Test Participation (%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="satisfaction" fill="#8b5cf6" name="User Satisfaction (%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Segment Performance Timeline */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="trending-up" size={20} />
            <Typography variant="h6" weight="semibold">
              Performance Trends Over Time
            </Typography>
          </ChartTitle>
        </ChartHeader>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { month: 'Jan', premium: 16.2, mobile: 10.8, highValue: 19.5, atRisk: 8.2 },
            { month: 'Feb', premium: 17.1, mobile: 11.3, highValue: 20.8, atRisk: 7.9 },
            { month: 'Mar', premium: 17.8, mobile: 11.9, highValue: 21.2, atRisk: 7.4 },
            { month: 'Apr', premium: 18.2, mobile: 12.1, highValue: 21.8, atRisk: 7.1 },
            { month: 'May', premium: 18.7, mobile: 12.4, highValue: 22.1, atRisk: 6.8 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip content={<SegmentationTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="premium" stroke="#10b981" strokeWidth={2} name="Premium" />
            <Line type="monotone" dataKey="mobile" stroke="#3b82f6" strokeWidth={2} name="Mobile-First" />
            <Line type="monotone" dataKey="highValue" stroke="#8b5cf6" strokeWidth={2} name="High-Value" />
            <Line type="monotone" dataKey="atRisk" stroke="#ef4444" strokeWidth={2} name="At-Risk" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );

  const renderInsightsTab = () => (
    <motion.div
      key="insights"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '20px' }}>
        Segmentation Insights & Recommendations
      </Typography>

      {/* AI-Powered Insights */}
      <InsightsSection>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Icon name="lightbulb" size={24} />
          <Typography variant="h6" weight="semibold">
            AI-Powered Segmentation Insights
          </Typography>
        </div>
        
        {segmentationInsights.map((insight, index) => (
          <InsightItem 
            key={insight.id} 
            impact={insight.impact}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <InsightIcon impact={insight.impact}>
              <Icon name={insight.icon} size={16} />
            </InsightIcon>
            <InsightContent>
              <Typography variant="body1" weight="medium" style={{ marginBottom: '4px' }}>
                {insight.title}
              </Typography>
              <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
                {insight.description}
              </Typography>
              <Typography variant="body2" weight="medium" style={{ 
                padding: '4px 8px',
                background: insight.impact === 'high' ? '#dcfce7' : insight.impact === 'medium' ? '#fef3c7' : '#dbeafe',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                💡 {insight.recommendation}
              </Typography>
            </InsightContent>
            <Badge 
              variant={insight.impact === 'high' ? 'success' : insight.impact === 'medium' ? 'warning' : 'info'} 
              size="xs"
            >
              {insight.impact.toUpperCase()} IMPACT
            </Badge>
          </InsightItem>
        ))}
      </InsightsSection>

      {/* Optimization Opportunities */}
      <ChartContainer whileHover={{ scale: 1.005 }}>
        <ChartHeader>
          <ChartTitle>
            <Icon name="target" size={20} />
            <Typography variant="h6" weight="semibold">
              Segment Optimization Opportunities
            </Typography>
          </ChartTitle>
        </ChartHeader>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {segments.map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Typography variant="body1" weight="medium">
                  {segment.name}
                </Typography>
                <Badge 
                  variant={segment.performance === 'high' ? 'success' : segment.performance === 'medium' ? 'warning' : 'error'} 
                  size="xs"
                >
                  {segment.performance} performance
                </Badge>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div>
                  <Typography variant="caption" color="secondary">Current Performance</Typography>
                  <Typography variant="body2" weight="medium">{segment.conversionRate}% conversion</Typography>
                </div>
                <div>
                  <Typography variant="caption" color="secondary">Optimization Potential</Typography>
                  <Typography variant="body2" weight="medium" color="success">
                    +{(Math.random() * 5 + 2).toFixed(1)}% potential uplift
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="secondary">Recommended Action</Typography>
                  <Typography variant="body2" weight="medium">
                    {segment.performance === 'high' ? 'Scale allocation' :
                     segment.performance === 'medium' ? 'Optimize experience' :
                     'Retention focus'}
                  </Typography>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ChartContainer>

      {/* Actionable Recommendations */}
      <div style={{ marginTop: '30px' }}>
        <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
          Next Steps & Action Items
        </Typography>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981' }}>
            <Typography variant="body2" weight="medium" style={{ marginBottom: '4px' }}>
              🎯 Immediate Action: Focus on High-Value Prospects
            </Typography>
            <Typography variant="body2" color="secondary">
              This segment shows 92.7% participation and 35.2% uplift. Allocate 40% of future test traffic here for faster results.
            </Typography>
          </div>
          
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
            <Typography variant="body2" weight="medium" style={{ marginBottom: '4px' }}>
              📱 Medium Priority: Mobile Experience Optimization
            </Typography>
            <Typography variant="body2" color="secondary">
              Create mobile-specific test variants for the 43% mobile-first user base to improve their 12.4% conversion rate.
            </Typography>
          </div>

          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #ef4444' }}>
            <Typography variant="body2" weight="medium" style={{ marginBottom: '4px' }}>
              🚨 Critical: Address At-Risk Segment
            </Typography>
            <Typography variant="body2" color="secondary">
              Design retention-focused experiments for the 19.6% at-risk segment showing declining engagement and -8.9% uplift.
            </Typography>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'builder':
        return renderBuilderTab();
      case 'segments':
        return renderSegmentsTab();
      case 'performance':
        return renderPerformanceTab();
      case 'insights':
        return renderInsightsTab();
      default:
        return null;
    }
  };

  return (
    <SegmentationContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <SegmentationHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="users" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                Experiment Segmentation
              </Typography>
              <Typography variant="body2" color="secondary">
                Advanced user segmentation for targeted A/B testing with AI-powered insights
              </Typography>
            </div>
          </HeaderLeft>
          <SegmentStats>
            <StatItem>
              <StatValue>{segments.length}</StatValue>
              <StatLabel>Active Segments</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{totalSegmentSize.toLocaleString()}</StatValue>
              <StatLabel>Total Users</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>76.8%</StatValue>
              <StatLabel>Avg Participation</StatLabel>
            </StatItem>
          </SegmentStats>
        </HeaderContent>
      </SegmentationHeader>

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
    </SegmentationContainer>
  );
};

export default ExperimentSegmentation;