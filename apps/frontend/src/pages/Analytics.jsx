import styled from 'styled-components';
import { motion } from 'framer-motion';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import Modal from '../components/atoms/Modal';
import RevenueAnalyticsDashboard from '../components/organisms/RevenueAnalyticsDashboard';
import CustomerAnalyticsDashboard from '../components/organisms/CustomerAnalyticsDashboard';
import ProductPerformanceAnalytics from '../components/organisms/ProductPerformanceAnalytics';
import { useI18n } from '../hooks/useI18n';
import { useModal } from '../contexts/ModalContext';

const AnalyticsContainer = styled(motion.div)`
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

const AnalyticsHeader = styled.div`
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

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[6]};
`;

const AnalyticsCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.theme.colors.primary[200]};
  }
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.primary[100]};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const CardTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const CardDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const CardFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CardFeature = styled.li`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]} 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &::before {
    content: '•';
    color: ${props => props.theme.colors.primary[500]};
    font-weight: bold;
  }
`;

const Analytics = () => {
  const { t } = useI18n();
  const { isModalOpen, openModal, closeModal } = useModal();

  const analyticsModules = [
    {
      id: 'revenue',
      title: 'Revenue Analytics',
      description: 'Comprehensive revenue tracking and insights with real-time monitoring, trend analysis, and AI-powered recommendations.',
      icon: 'dollar-sign',
      features: [
        'Real-time revenue tracking',
        'KPI monitoring and alerts',
        'Trend analysis and forecasting',
        'Category performance insights',
        'AI-generated recommendations'
      ],
      status: 'available'
    },
    {
      id: 'customer',
      title: 'Customer Analytics',
      description: 'Deep customer behavior analysis, segmentation, and lifetime value tracking with predictive insights.',
      icon: 'users',
      features: [
        'Customer segmentation analysis',
        'Lifetime value calculation',
        'Behavior pattern recognition',
        'Churn prediction and prevention',
        'Customer journey mapping'
      ],
      status: 'available'
    },
    {
      id: 'product',
      title: 'Product Performance',
      description: 'Comprehensive product analytics including sales performance, inventory optimization, and demand forecasting.',
      icon: 'package',
      features: [
        'Product sales performance',
        'Inventory turnover analysis',
        'Demand forecasting',
        'Cross-sell opportunities',
        'Product lifecycle tracking'
      ],
      status: 'available'
    },
    {
      id: 'marketing',
      title: 'Marketing Analytics',
      description: 'Marketing campaign performance, customer acquisition costs, and ROI analysis with multi-channel attribution.',
      icon: 'megaphone',
      features: [
        'Campaign performance tracking',
        'Customer acquisition analysis',
        'Multi-channel attribution',
        'ROI optimization',
        'A/B test integration'
      ],
      status: 'coming-soon'
    },
    {
      id: 'operational',
      title: 'Operational Insights',
      description: 'Operational efficiency metrics, cost analysis, and process optimization with real-time monitoring.',
      icon: 'settings',
      features: [
        'Operational efficiency metrics',
        'Cost center analysis',
        'Process optimization',
        'Resource utilization',
        'Performance benchmarking'
      ],
      status: 'coming-soon'
    },
    {
      id: 'predictive',
      title: 'Predictive Analytics',
      description: 'AI-powered predictive models for sales forecasting, demand planning, and business intelligence.',
      icon: 'brain',
      features: [
        'Sales forecasting models',
        'Demand prediction',
        'Risk assessment',
        'Scenario planning',
        'Business intelligence'
      ],
      status: 'coming-soon'
    }
  ];

  const handleCardClick = (moduleId) => {
    if (moduleId === 'revenue') {
      openModal('revenueAnalytics', { size: 'xl' });
    } else if (moduleId === 'customer') {
      openModal('customerAnalytics', { size: 'xl' });
    } else if (moduleId === 'product') {
      openModal('productAnalytics', { size: 'xl' });
    }
    // Other modules will be implemented in future tasks
  };

  const handleAnalyticsUpdate = (updateData) => {
    console.log('Analytics update:', updateData);
    // Handle analytics updates - could show notifications, update state, etc.
  };

  return (
    <AnalyticsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AnalyticsHeader>
        <HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="h3" weight="bold" color="primary">
              Advanced Analytics
            </Typography>
            <Badge variant="info" size="sm">
              <Icon name="zap" size={12} />
              AI Powered
            </Badge>
          </div>
          <Typography variant="body1" color="secondary">
            Comprehensive business intelligence and analytics suite powered by AI insights
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            3 of 6 modules available
          </Typography>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('productAnalytics', { size: 'xl' })}
          >
            <Icon name="package" size={16} />
            Product Analytics
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('customerAnalytics', { size: 'xl' })}
          >
            <Icon name="users" size={16} />
            Customer Dashboard
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('revenueAnalytics', { size: 'xl' })}
          >
            <Icon name="dollar-sign" size={16} />
            Revenue Dashboard
          </Button>
        </HeaderRight>
      </AnalyticsHeader>

      <AnalyticsGrid>
        {analyticsModules.map((module) => (
          <AnalyticsCard
            key={module.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick(module.id)}
            style={{ 
              opacity: module.status === 'coming-soon' ? 0.7 : 1,
              cursor: module.status === 'coming-soon' ? 'not-allowed' : 'pointer'
            }}
          >
            <CardIcon>
              <Icon name={module.icon} size={28} />
            </CardIcon>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CardTitle>{module.title}</CardTitle>
              {module.status === 'coming-soon' && (
                <Badge variant="secondary" size="xs">
                  Coming Soon
                </Badge>
              )}
              {module.status === 'available' && (
                <Badge variant="success" size="xs">
                  <Icon name="check" size={10} />
                  Available
                </Badge>
              )}
            </div>
            
            <CardDescription>{module.description}</CardDescription>
            
            <CardFeatures>
              {module.features.map((feature, index) => (
                <CardFeature key={index}>
                  {feature}
                </CardFeature>
              ))}
            </CardFeatures>
          </AnalyticsCard>
        ))}
      </AnalyticsGrid>

      {/* Revenue Analytics Modal */}
      <Modal
        isOpen={isModalOpen('revenueAnalytics')}
        onClose={() => closeModal('revenueAnalytics')}
        title=""
        size="xl"
        padding={false}
      >
        <RevenueAnalyticsDashboard
          onAnalyticsUpdate={handleAnalyticsUpdate}
          onClose={() => closeModal('revenueAnalytics')}
        />
      </Modal>

      {/* Customer Analytics Modal */}
      <Modal
        isOpen={isModalOpen('customerAnalytics')}
        onClose={() => closeModal('customerAnalytics')}
        title=""
        size="xl"
        padding={false}
      >
        <CustomerAnalyticsDashboard
          onAnalyticsUpdate={handleAnalyticsUpdate}
          onClose={() => closeModal('customerAnalytics')}
        />
      </Modal>

      {/* Product Analytics Modal */}
      <Modal
        isOpen={isModalOpen('productAnalytics')}
        onClose={() => closeModal('productAnalytics')}
        title=""
        size="xl"
        padding={false}
      >
        <ProductPerformanceAnalytics
          onExportReport={handleAnalyticsUpdate}
          onOptimizationRequest={handleAnalyticsUpdate}
          onProductSelect={(product) => console.log('Selected product:', product)}
        />
      </Modal>
    </AnalyticsContainer>
  );
};

export default Analytics;