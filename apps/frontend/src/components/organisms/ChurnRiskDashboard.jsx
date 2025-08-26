import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Progress from '../atoms/Progress';
import { useI18n } from '../../hooks/useI18n';

const riskPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
  }
`;

const warningBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const DashboardContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const DashboardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.red[50]}, ${props => props.theme.colors.orange[50]});
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const ChurnIcon = styled(motion.div)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.red[500]}, ${props => props.theme.colors.orange[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: ${riskPulse} 3s ease-in-out infinite;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const RiskLevelSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const RiskOption = styled(motion.button)`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: none;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.active ? getRiskColor(props.risk, props.theme) : 'transparent'};
  color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  
  &:hover {
    color: ${props => props.active ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  }
`;

const AlertBanner = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.red[100]};
  border-bottom: 1px solid ${props => props.theme.colors.red[200]};
  color: ${props => props.theme.colors.red[800]};
  
  ${props => props.critical && css`
    animation: ${warningBlink} 2s ease-in-out infinite;
  `}
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  }
`;

const RiskOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
    grid-template-columns: repeat(2, 1fr);
  }
`;

const RiskCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => getRiskBorder(props.risk, props.theme)};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  text-align: center;
  position: relative;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => getRiskColor(props.risk, props.theme)};
  }
  
  ${props => props.risk === 'critical' && css`
    animation: ${riskPulse} 3s ease-in-out infinite;
  `}
`;

const RiskValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getRiskColor(props.risk, props.theme)};
  line-height: 1;
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const RiskLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const RiskTrend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => getTrendColor(props.trend, props.theme)};
`;

const DashboardContent = styled.div`
  flex: 1;
  display: flex;
  gap: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  overflow: hidden;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    flex-direction: column;
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const MainPanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const SidePanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const Section = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const SectionTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const CustomerList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[2]} 0;
`;

const CustomerItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  position: relative;
  
  &:hover {
    background: ${props => getRiskBackground(props.risk, props.theme)};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.risk === 'critical' && css`
    border-left: 4px solid ${props.theme.colors.red[500]};
  `}
  
  ${props => props.risk === 'high' && css`
    border-left: 4px solid ${props.theme.colors.orange[500]};
  `}
`;

const RiskIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => getRiskColor(props.risk, props.theme)};
  flex-shrink: 0;
  
  ${props => props.risk === 'critical' && css`
    animation: ${riskPulse} 2s ease-in-out infinite;
  `}
`;

const CustomerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CustomerName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const CustomerMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const RiskScore = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const ScoreValue = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getRiskColor(props.risk, props.theme)};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const ScoreLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const RiskFactors = styled.div`
  padding: ${props => props.theme.spacing[4]};
`;

const FactorItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FactorLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const FactorWeight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const WeightBar = styled.div`
  width: 60px;
  height: 4px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.weight}%;
    background: ${props => getFactorColor(props.weight, props.theme)};
    border-radius: 2px;
  }
`;

const PredictiveChart = styled.div`
  padding: ${props => props.theme.spacing[4]};
  height: 200px;
  position: relative;
`;

const ChartArea = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: space-around;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  border-left: 1px solid ${props => props.theme.colors.border.subtle};
`;

const ChurnBar = styled(motion.div)`
  width: 20px;
  background: linear-gradient(180deg, ${props => getRiskColor(props.risk, props.theme)}, ${props => getRiskColor(props.risk, props.theme)}80);
  border-radius: 2px 2px 0 0;
  position: relative;
  
  &::after {
    content: '${props => props.value}%';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: ${props => props.theme.typography.fontSize.xs};
    color: ${props => props.theme.colors.text.primary};
    white-space: nowrap;
  }
`;

const ChartLabel = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const ActionPanel = styled.div`
  padding: ${props => props.theme.spacing[4]};
`;

const ActionItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
  background: ${props => getActionBackground(props.action, props.theme)};
  border: 1px solid ${props => getActionBorder(props.action, props.theme)};
  border-radius: ${props => props.theme.spacing[2]};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => getActionHoverBackground(props.action, props.theme)};
    transform: translateX(4px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => getActionColor(props.action, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const ActionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActionTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const ActionDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

// Helper functions
const getRiskColor = (risk, theme) => {
  const colors = {
    critical: theme.colors.red[600],
    high: theme.colors.orange[600],
    medium: theme.colors.yellow[600],
    low: theme.colors.green[600]
  };
  return colors[risk] || theme.colors.gray[600];
};

const getRiskBorder = (risk, theme) => {
  const borders = {
    critical: theme.colors.red[300],
    high: theme.colors.orange[300],
    medium: theme.colors.yellow[300],
    low: theme.colors.green[300]
  };
  return borders[risk] || theme.colors.border.default;
};

const getRiskBackground = (risk, theme) => {
  const backgrounds = {
    critical: theme.colors.red[50],
    high: theme.colors.orange[50],
    medium: theme.colors.yellow[50],
    low: theme.colors.green[50]
  };
  return backgrounds[risk] || theme.colors.background.secondary;
};

const getTrendColor = (trend, theme) => {
  if (trend > 0) return theme.colors.red[600];
  if (trend < 0) return theme.colors.green[600];
  return theme.colors.gray[500];
};

const getFactorColor = (weight, theme) => {
  if (weight >= 80) return theme.colors.red[500];
  if (weight >= 60) return theme.colors.orange[500];
  if (weight >= 40) return theme.colors.yellow[500];
  return theme.colors.green[500];
};

const getActionColor = (action, theme) => {
  const colors = {
    email: theme.colors.blue[500],
    offer: theme.colors.green[500],
    call: theme.colors.purple[500],
    survey: theme.colors.orange[500]
  };
  return colors[action] || theme.colors.gray[500];
};

const getActionBackground = (action, theme) => {
  const backgrounds = {
    email: theme.colors.blue[50],
    offer: theme.colors.green[50],
    call: theme.colors.purple[50],
    survey: theme.colors.orange[50]
  };
  return backgrounds[action] || theme.colors.gray[50];
};

const getActionBorder = (action, theme) => {
  const borders = {
    email: theme.colors.blue[200],
    offer: theme.colors.green[200],
    call: theme.colors.purple[200],
    survey: theme.colors.orange[200]
  };
  return borders[action] || theme.colors.gray[200];
};

const getActionHoverBackground = (action, theme) => {
  const hovers = {
    email: theme.colors.blue[100],
    offer: theme.colors.green[100],
    call: theme.colors.purple[100],
    survey: theme.colors.orange[100]
  };
  return hovers[action] || theme.colors.gray[100];
};

const ChurnRiskDashboard = ({
  riskData = {},
  selectedRiskLevel = 'all',
  onRiskLevelChange,
  onCustomerClick,
  onActionClick,
  loading = false,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [selectedRisk, setSelectedRisk] = useState(selectedRiskLevel);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Default risk data
  const defaultData = {
    totalAtRisk: 1247,
    criticalRisk: 156,
    highRisk: 342,
    mediumRisk: 549,
    lowRisk: 200,
    customers: [
      {
        id: 'cust-1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        riskScore: 94,
        risk: 'critical',
        lastPurchase: '45 days ago',
        totalSpent: 2456,
        segment: 'Champions',
        factors: ['Decreased frequency', 'Low engagement', 'Support tickets']
      },
      {
        id: 'cust-2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        riskScore: 87,
        risk: 'critical',
        lastPurchase: '38 days ago',
        totalSpent: 1834,
        segment: 'Loyal Customers',
        factors: ['Extended time since purchase', 'No email opens']
      },
      {
        id: 'cust-3',
        name: 'Emma Davis',
        email: 'emma.davis@email.com',
        riskScore: 73,
        risk: 'high',
        lastPurchase: '28 days ago',
        totalSpent: 987,
        segment: 'Potential Loyalists',
        factors: ['Declining order value', 'Reduced website visits']
      },
      {
        id: 'cust-4',
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        riskScore: 68,
        risk: 'high',
        lastPurchase: '21 days ago',
        totalSpent: 1245,
        segment: 'At Risk',
        factors: ['Multiple cart abandonments', 'Price sensitivity']
      },
      {
        id: 'cust-5',
        name: 'Lisa Rodriguez',
        email: 'lisa.rodriguez@email.com',
        riskScore: 45,
        risk: 'medium',
        lastPurchase: '14 days ago',
        totalSpent: 567,
        segment: 'New Customers',
        factors: ['Single purchase only', 'Low engagement']
      }
    ]
  };

  const currentData = { ...defaultData, ...riskData };

  const riskOptions = [
    { id: 'all', label: 'All Risks', risk: 'medium' },
    { id: 'critical', label: 'Critical', risk: 'critical' },
    { id: 'high', label: 'High', risk: 'high' },
    { id: 'medium', label: 'Medium', risk: 'medium' },
    { id: 'low', label: 'Low', risk: 'low' }
  ];

  const riskFactors = [
    { id: 'recency', label: 'Purchase Recency', weight: 85, icon: 'clock' },
    { id: 'frequency', label: 'Purchase Frequency', weight: 72, icon: 'repeat' },
    { id: 'engagement', label: 'Email Engagement', weight: 68, icon: 'mail' },
    { id: 'support', label: 'Support Interactions', weight: 45, icon: 'helpCircle' },
    { id: 'website', label: 'Website Activity', weight: 38, icon: 'globe' }
  ];

  const predictiveData = [
    { period: 'Week 1', risk: 'critical', value: 12 },
    { period: 'Week 2', risk: 'high', value: 18 },
    { period: 'Week 3', risk: 'medium', value: 25 },
    { period: 'Week 4', risk: 'high', value: 32 }
  ];

  const recommendedActions = [
    {
      id: 'email',
      action: 'email',
      title: 'Send Retention Email',
      description: 'Personalized email with special offer for high-risk customers',
      impact: '15% retention improvement'
    },
    {
      id: 'offer',
      action: 'offer',
      title: 'Exclusive Discount',
      description: 'Time-limited offer to re-engage at-risk customers',
      impact: '23% conversion rate'
    },
    {
      id: 'call',
      action: 'call',
      title: 'Personal Outreach',
      description: 'Direct call from customer success team',
      impact: '45% retention for critical risk'
    },
    {
      id: 'survey',
      action: 'survey',
      title: 'Feedback Survey',
      description: 'Understand why customers are disengaging',
      impact: 'Valuable insights for improvement'
    }
  ];

  const filteredCustomers = useMemo(() => {
    if (selectedRisk === 'all') {
      return currentData.customers;
    }
    return currentData.customers.filter(customer => customer.risk === selectedRisk);
  }, [currentData.customers, selectedRisk]);

  const criticalAlerts = currentData.criticalRisk;
  const showCriticalBanner = criticalAlerts > 0;

  const handleRiskLevelChange = (riskLevel) => {
    setSelectedRisk(riskLevel);
    onRiskLevelChange?.(riskLevel);
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    onCustomerClick?.(customer);
  };

  return (
    <DashboardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      <DashboardHeader>
        <HeaderLeft>
          <ChurnIcon>
            <Icon name="alert-triangle" size={18} />
          </ChurnIcon>
          <div>
            <Typography variant="h5" weight="semibold">
              Churn Risk Dashboard
            </Typography>
            <Typography variant="caption" color="secondary">
              AI-powered churn prediction and prevention
            </Typography>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <RiskLevelSelector>
            {riskOptions.map(option => (
              <RiskOption
                key={option.id}
                risk={option.risk}
                active={selectedRisk === option.id}
                onClick={() => handleRiskLevelChange(option.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name="alert-triangle" size={10} />
                {option.label}
              </RiskOption>
            ))}
          </RiskLevelSelector>
          
          <Button variant="ghost" size="sm">
            <Icon name="refresh" size={16} />
          </Button>
        </HeaderRight>
      </DashboardHeader>

      <AnimatePresence>
        {showCriticalBanner && (
          <AlertBanner
            critical={criticalAlerts > 100}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Icon name="alert-triangle" size={20} />
            <Typography variant="body2" weight="medium">
              <strong>{criticalAlerts}</strong> customers at critical churn risk require immediate attention!
            </Typography>
            <Button variant="danger" size="sm" style={{ marginLeft: 'auto' }}>
              Take Action
            </Button>
          </AlertBanner>
        )}
      </AnimatePresence>

      <RiskOverview>
        <RiskCard risk="critical" whileHover={{ scale: 1.02 }}>
          <RiskValue risk="critical">{currentData.criticalRisk}</RiskValue>
          <RiskLabel>Critical Risk</RiskLabel>
          <RiskTrend trend={12}>
            <Icon name="trending-up" size={10} />
            +12%
          </RiskTrend>
        </RiskCard>

        <RiskCard risk="high" whileHover={{ scale: 1.02 }}>
          <RiskValue risk="high">{currentData.highRisk}</RiskValue>
          <RiskLabel>High Risk</RiskLabel>
          <RiskTrend trend={5}>
            <Icon name="trending-up" size={10} />
            +5%
          </RiskTrend>
        </RiskCard>

        <RiskCard risk="medium" whileHover={{ scale: 1.02 }}>
          <RiskValue risk="medium">{currentData.mediumRisk}</RiskValue>
          <RiskLabel>Medium Risk</RiskLabel>
          <RiskTrend trend={-3}>
            <Icon name="trendingDown" size={10} />
            -3%
          </RiskTrend>
        </RiskCard>

        <RiskCard risk="low" whileHover={{ scale: 1.02 }}>
          <RiskValue risk="low">{currentData.lowRisk}</RiskValue>
          <RiskLabel>Low Risk</RiskLabel>
          <RiskTrend trend={-8}>
            <Icon name="trendingDown" size={10} />
            -8%
          </RiskTrend>
        </RiskCard>

        <RiskCard whileHover={{ scale: 1.02 }}>
          <RiskValue>{currentData.totalAtRisk}</RiskValue>
          <RiskLabel>Total At Risk</RiskLabel>
          <RiskTrend trend={2}>
            <Icon name="trending-up" size={10} />
            +2%
          </RiskTrend>
        </RiskCard>
      </RiskOverview>

      <DashboardContent>
        <MainPanel>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <Icon name="users" size={20} />
                At-Risk Customers ({filteredCustomers.length})
              </SectionTitle>
            </SectionHeader>
            <CustomerList>
              {filteredCustomers.map((customer, index) => (
                <CustomerItem
                  key={customer.id}
                  risk={customer.risk}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  onClick={() => handleCustomerClick(customer)}
                >
                  <RiskIndicator risk={customer.risk} />
                  
                  <CustomerInfo>
                    <CustomerName>{customer.name}</CustomerName>
                    <CustomerMeta>
                      <span>{customer.segment}</span>
                      <span>•</span>
                      <span>{customer.lastPurchase}</span>
                      <span>•</span>
                      <span>${customer.totalSpent.toLocaleString()} spent</span>
                    </CustomerMeta>
                  </CustomerInfo>
                  
                  <RiskScore>
                    <ScoreValue risk={customer.risk}>{customer.riskScore}%</ScoreValue>
                    <ScoreLabel>Risk Score</ScoreLabel>
                  </RiskScore>
                </CustomerItem>
              ))}
            </CustomerList>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <Icon name="trending-up" size={20} />
                Churn Prediction (Next 4 Weeks)
              </SectionTitle>
            </SectionHeader>
            <PredictiveChart>
              <ChartArea>
                {predictiveData.map((data, index) => (
                  <div key={data.period} style={{ position: 'relative' }}>
                    <ChurnBar
                      risk={data.risk}
                      value={data.value}
                      initial={{ height: 0 }}
                      animate={{ height: `${data.value * 4}px` }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                    />
                    <ChartLabel>{data.period}</ChartLabel>
                  </div>
                ))}
              </ChartArea>
            </PredictiveChart>
          </Section>
        </MainPanel>

        <SidePanel>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <Icon name="target" size={20} />
                Risk Factors
              </SectionTitle>
            </SectionHeader>
            <RiskFactors>
              {riskFactors.map((factor, index) => (
                <FactorItem
                  key={factor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <FactorLabel>
                    <Icon name={factor.icon} size={16} />
                    {factor.label}
                  </FactorLabel>
                  <FactorWeight>
                    <WeightBar weight={factor.weight} />
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {factor.weight}%
                    </span>
                  </FactorWeight>
                </FactorItem>
              ))}
            </RiskFactors>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <Icon name="zap" size={20} />
                Recommended Actions
              </SectionTitle>
            </SectionHeader>
            <ActionPanel>
              {recommendedActions.map((action, index) => (
                <ActionItem
                  key={action.id}
                  action={action.action}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onActionClick?.(action)}
                >
                  <ActionIcon action={action.action}>
                    <Icon 
                      name={
                        action.action === 'email' ? 'mail' :
                        action.action === 'offer' ? 'tag' :
                        action.action === 'call' ? 'phone' : 'messageSquare'
                      } 
                      size={16} 
                    />
                  </ActionIcon>
                  <ActionContent>
                    <ActionTitle>{action.title}</ActionTitle>
                    <ActionDescription>{action.description}</ActionDescription>
                    <div style={{ marginTop: '0.5rem' }}>
                      <Badge variant="success" size="sm">
                        {action.impact}
                      </Badge>
                    </div>
                  </ActionContent>
                </ActionItem>
              ))}
            </ActionPanel>
          </Section>
        </SidePanel>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default ChurnRiskDashboard;