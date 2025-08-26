import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import Progress from '../atoms/Progress';
import AlertCard from '../molecules/AlertCard';
import { useI18n } from '../../hooks/useI18n';

const WizardContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;
`;

const WizardHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.purple[25]} 0%, 
    ${props => props.theme.colors.purple[50]} 100%);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
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
    ${props => props.theme.colors.purple[500]} 0%, 
    ${props => props.theme.colors.purple[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const Step = styled.div.withConfig({
  shouldForwardProp: (prop) => !['active', 'completed'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => 
    props.completed ? props.theme.colors.green[100] :
    props.active ? props.theme.colors.purple[100] : 
    props.theme.colors.gray[100]};
  color: ${props => 
    props.completed ? props.theme.colors.green[700] :
    props.active ? props.theme.colors.purple[700] : 
    props.theme.colors.gray[600]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  
  &:not(:last-child)::after {
    content: '';
    width: 24px;
    height: 2px;
    background: ${props => props.theme.colors.border.default};
    margin-left: ${props => props.theme.spacing[3]};
  }
`;

const WizardContent = styled.div`
  padding: ${props => props.theme.spacing[8]};
`;

const StepContainer = styled(motion.div)`
  min-height: 400px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const FormSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ModelCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})`
  padding: ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.selected ? props.theme.colors.purple[300] : props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  background: ${props => props.selected ? props.theme.colors.purple[25] : props.theme.colors.background.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.colors.purple[200]};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  ${props => props.selected && css`
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(135deg, ${props.theme.colors.purple[400]}, ${props.theme.colors.purple[600]});
      border-radius: ${props.theme.spacing[3]};
      z-index: -1;
    }
  `}
`;

const ModelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ModelBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'type'
})`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => getModelBadgeColor(props.type, props.theme)};
  color: white;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.purple[600]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: ${props => props.theme.spacing[1]};
`;

const TestConfigCard = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ConfigRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const WizardFooter = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ValidationMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.red[600]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing[2]};
`;

const SimpleSelect = styled.select`
  width: 100%;
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

const SimpleSwitch = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'checked'
})`
  position: relative;
  width: 48px;
  height: 24px;
  background: ${props => props.checked ? props.theme.colors.primary[500] : props.theme.colors.gray[300]};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 10px;
    transition: all 0.2s ease;
  }
`;

// Utility functions
const getModelBadgeColor = (type, theme) => {
  const colors = {
    'claude-sonnet': theme.colors?.blue?.[500] || '#3B82F6',
    'claude-haiku': theme.colors?.green?.[500] || '#10B981',
    'gpt-4': theme.colors?.purple?.[500] || '#8B5CF6',
    'gemini': theme.colors?.orange?.[500] || '#F97316'
  };
  return colors[type] || colors['claude-sonnet'];
};

const ABTestCreationWizard = ({
  onTestCreate,
  onClose,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [testData, setTestData] = useState({
    // Basic Information
    name: '',
    description: '',
    hypothesis: '',
    testType: 'model_comparison',
    
    // Models Configuration
    modelA: null,
    modelB: null,
    
    // Target Configuration
    targetMetric: 'conversion_rate',
    minimumDetectableEffect: 5,
    statisticalPower: 80,
    significanceLevel: 95,
    
    // Traffic Configuration
    trafficAllocation: 50,
    targetAudience: 'all_users',
    customerSegment: '',
    
    // Duration Configuration
    duration: 14,
    startDate: new Date().toISOString().split('T')[0],
    autoEnd: true,
    maxDuration: 30,
    
    // Advanced Settings
    enableEarlyStop: true,
    minimumSampleSize: 1000,
    weekendTraffic: true,
    excludeReturningUsers: false
  });
  
  const [validation, setValidation] = useState({});
  const [creating, setCreating] = useState(false);

  // Available models for A/B testing
  const availableModels = [
    {
      id: 'claude-sonnet-3.5',
      name: 'Claude 3.5 Sonnet',
      type: 'claude-sonnet',
      description: 'Advanced reasoning and complex task handling',
      metrics: {
        accuracy: '94%',
        speed: '2.3s',
        cost: '$0.08'
      },
      capabilities: ['Complex reasoning', 'Long context', 'Code analysis'],
      recommended: true
    },
    {
      id: 'claude-haiku-3',
      name: 'Claude 3 Haiku',
      type: 'claude-haiku',
      description: 'Fast and efficient for simple tasks',
      metrics: {
        accuracy: '89%',
        speed: '0.8s',
        cost: '$0.02'
      },
      capabilities: ['Fast responses', 'Cost effective', 'Simple tasks'],
      recommended: false
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      type: 'gpt-4',
      description: 'Balanced performance and capabilities',
      metrics: {
        accuracy: '91%',
        speed: '1.8s',
        cost: '$0.06'
      },
      capabilities: ['Balanced performance', 'Good reasoning', 'Multimodal'],
      recommended: false
    }
  ];

  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Test name, description, and hypothesis',
      icon: 'info'
    },
    {
      id: 'models',
      title: 'Model Selection',
      description: 'Choose AI models to compare',
      icon: 'brain'
    },
    {
      id: 'configuration',
      title: 'Test Configuration',
      description: 'Metrics, traffic, and duration settings',
      icon: 'settings'
    },
    {
      id: 'review',
      title: 'Review & Launch',
      description: 'Review settings and launch test',
      icon: 'check-circle'
    }
  ];

  // Validation functions
  const validateBasicInfo = useCallback(() => {
    const errors = {};
    
    if (!testData.name.trim()) {
      errors.name = 'Test name is required';
    }
    
    if (!testData.description.trim()) {
      errors.description = 'Test description is required';
    }
    
    if (!testData.hypothesis.trim()) {
      errors.hypothesis = 'Test hypothesis is required';
    }
    
    return errors;
  }, [testData]);

  const validateModels = useCallback(() => {
    const errors = {};
    
    if (!testData.modelA) {
      errors.modelA = 'Please select Model A';
    }
    
    if (!testData.modelB) {
      errors.modelB = 'Please select Model B';
    }
    
    if (testData.modelA && testData.modelB && testData.modelA.id === testData.modelB.id) {
      errors.models = 'Please select different models for comparison';
    }
    
    return errors;
  }, [testData]);

  const validateConfiguration = useCallback(() => {
    const errors = {};
    
    if (testData.minimumDetectableEffect < 1 || testData.minimumDetectableEffect > 50) {
      errors.minimumDetectableEffect = 'Minimum detectable effect must be between 1% and 50%';
    }
    
    if (testData.duration < 7 || testData.duration > 90) {
      errors.duration = 'Test duration must be between 7 and 90 days';
    }
    
    if (testData.minimumSampleSize < 100) {
      errors.minimumSampleSize = 'Minimum sample size must be at least 100';
    }
    
    return errors;
  }, [testData]);

  // Step navigation
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0:
        return Object.keys(validateBasicInfo()).length === 0;
      case 1:
        return Object.keys(validateModels()).length === 0;
      case 2:
        return Object.keys(validateConfiguration()).length === 0;
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, validateBasicInfo, validateModels, validateConfiguration]);

  const nextStep = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Update validation when step changes
  useEffect(() => {
    switch (currentStep) {
      case 0:
        setValidation(validateBasicInfo());
        break;
      case 1:
        setValidation(validateModels());
        break;
      case 2:
        setValidation(validateConfiguration());
        break;
      default:
        setValidation({});
    }
  }, [currentStep, validateBasicInfo, validateModels, validateConfiguration]);

  // Handle form updates
  const updateTestData = useCallback((field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle model selection
  const selectModel = useCallback((model, slot) => {
    setTestData(prev => ({
      ...prev,
      [slot]: model
    }));
  }, []);

  // Handle test creation
  const handleCreateTest = useCallback(async () => {
    setCreating(true);
    
    try {
      // Calculate estimated sample size
      const estimatedSampleSize = Math.max(
        testData.minimumSampleSize,
        Math.ceil((16 * Math.pow(testData.minimumDetectableEffect / 100, -2)) * 
        (testData.statisticalPower / 100) * (testData.significanceLevel / 100))
      );
      
      const testConfig = {
        ...testData,
        estimatedSampleSize,
        status: 'draft',
        createdAt: new Date().toISOString(),
        createdBy: 'current-user', // TODO: Get from auth context
      };
      
      await onTestCreate(testConfig);
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      // TODO: Show error notification
    } finally {
      setCreating(false);
    }
  }, [testData, onTestCreate]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderModelSelectionStep();
      case 2:
        return renderConfigurationStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderBasicInfoStep = () => (
    <StepContainer
      key="basic"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '24px' }}>
        Basic Test Information
      </Typography>

      <FormGrid>
        <div>
          <Input
            label="Test Name"
            placeholder="Enter a descriptive name for your A/B test"
            value={testData.name}
            onChange={(e) => updateTestData('name', e.target.value)}
            error={validation.name}
            required
          />
        </div>
        <div>
          <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
            Test Type <span style={{ color: 'red' }}>*</span>
          </Typography>
          <SimpleSelect
            value={testData.testType}
            onChange={(e) => updateTestData('testType', e.target.value)}
          >
            <option value="model_comparison">AI Model Comparison</option>
            <option value="prompt_optimization">Prompt Optimization</option>
            <option value="feature_toggle">Feature Toggle</option>
            <option value="ui_experiment">UI/UX Experiment</option>
          </SimpleSelect>
        </div>
      </FormGrid>

      <div style={{ marginBottom: '24px' }}>
        <Input
          label="Test Description"
          placeholder="Describe what this test aims to achieve and its business context"
          value={testData.description}
          onChange={(e) => updateTestData('description', e.target.value)}
          error={validation.description}
          multiline
          rows={3}
          required
        />
      </div>

      <div>
        <Input
          label="Test Hypothesis"
          placeholder="State your hypothesis (e.g., 'Claude Sonnet will improve recommendation accuracy by 15%')"
          value={testData.hypothesis}
          onChange={(e) => updateTestData('hypothesis', e.target.value)}
          error={validation.hypothesis}
          multiline
          rows={2}
          required
        />
      </div>

      {Object.keys(validation).length > 0 && (
        <AlertCard
          variant="error"
          title="Please fix the following issues:"
          description={Object.values(validation).join(', ')}
          style={{ marginTop: '24px' }}
        />
      )}
    </StepContainer>
  );

  const renderModelSelectionStep = () => (
    <StepContainer
      key="models"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '24px' }}>
        Select AI Models to Compare
      </Typography>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <SectionTitle>
            <Icon name="a-circle" size={20} />
            <Typography variant="h6" weight="semibold">Model A (Control)</Typography>
          </SectionTitle>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {availableModels.map(model => (
              <ModelCard
                key={`a-${model.id}`}
                selected={testData.modelA?.id === model.id}
                onClick={() => selectModel(model, 'modelA')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ModelHeader>
                  <Typography variant="body1" weight="semibold">
                    {model.name}
                  </Typography>
                  <ModelBadge type={model.type}>
                    {model.type.replace('-', ' ')}
                  </ModelBadge>
                </ModelHeader>
                
                <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
                  {model.description}
                </Typography>
                
                <MetricGrid>
                  {Object.entries(model.metrics).map(([key, value]) => (
                    <MetricItem key={key}>
                      <MetricValue>{value}</MetricValue>
                      <MetricLabel>{key}</MetricLabel>
                    </MetricItem>
                  ))}
                </MetricGrid>
                
                {model.recommended && (
                  <Badge variant="success" size="sm" style={{ marginTop: '12px' }}>
                    Recommended
                  </Badge>
                )}
              </ModelCard>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>
            <Icon name="b-circle" size={20} />
            <Typography variant="h6" weight="semibold">Model B (Variant)</Typography>
          </SectionTitle>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {availableModels.map(model => (
              <ModelCard
                key={`b-${model.id}`}
                selected={testData.modelB?.id === model.id}
                onClick={() => selectModel(model, 'modelB')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ModelHeader>
                  <Typography variant="body1" weight="semibold">
                    {model.name}
                  </Typography>
                  <ModelBadge type={model.type}>
                    {model.type.replace('-', ' ')}
                  </ModelBadge>
                </ModelHeader>
                
                <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
                  {model.description}
                </Typography>
                
                <MetricGrid>
                  {Object.entries(model.metrics).map(([key, value]) => (
                    <MetricItem key={key}>
                      <MetricValue>{value}</MetricValue>
                      <MetricLabel>{key}</MetricLabel>
                    </MetricItem>
                  ))}
                </MetricGrid>
                
                {model.recommended && (
                  <Badge variant="success" size="sm" style={{ marginTop: '12px' }}>
                    Recommended
                  </Badge>
                )}
              </ModelCard>
            ))}
          </div>
        </div>
      </div>

      {validation.models && (
        <AlertCard
          variant="error"
          title="Model Selection Error"
          description={validation.models}
        />
      )}
    </StepContainer>
  );

  const renderConfigurationStep = () => (
    <StepContainer
      key="configuration"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '24px' }}>
        Test Configuration
      </Typography>

      <FormSection>
        <SectionTitle>
          <Icon name="target" size={20} />
          <Typography variant="h6" weight="semibold">Success Metrics</Typography>
        </SectionTitle>
        
        <TestConfigCard>
          <FormGrid>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Primary Metric <span style={{ color: 'red' }}>*</span>
              </Typography>
              <SimpleSelect
                value={testData.targetMetric}
                onChange={(e) => updateTestData('targetMetric', e.target.value)}
              >
                <option value="conversion_rate">Conversion Rate</option>
                <option value="recommendation_accuracy">Recommendation Accuracy</option>
                <option value="user_satisfaction">User Satisfaction Score</option>
                <option value="response_time">Response Time</option>
                <option value="error_rate">Error Rate</option>
                <option value="revenue_per_user">Revenue per User</option>
              </SimpleSelect>
            </div>
            <Input
              label="Minimum Detectable Effect (%)"
              type="number"
              min="1"
              max="50"
              value={testData.minimumDetectableEffect}
              onChange={(e) => updateTestData('minimumDetectableEffect', parseInt(e.target.value))}
              error={validation.minimumDetectableEffect}
            />
          </FormGrid>
          
          <FormGrid>
            <Input
              label="Statistical Power (%)"
              type="number"
              min="70"
              max="95"
              value={testData.statisticalPower}
              onChange={(e) => updateTestData('statisticalPower', parseInt(e.target.value))}
            />
            <Input
              label="Significance Level (%)"
              type="number"
              min="90"
              max="99"
              value={testData.significanceLevel}
              onChange={(e) => updateTestData('significanceLevel', parseInt(e.target.value))}
            />
          </FormGrid>
        </TestConfigCard>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Icon name="users" size={20} />
          <Typography variant="h6" weight="semibold">Traffic & Audience</Typography>
        </SectionTitle>
        
        <TestConfigCard>
          <ConfigRow>
            <div>
              <Typography variant="body1" weight="medium">Traffic Split</Typography>
              <Typography variant="body2" color="secondary">
                Percentage of traffic allocated to each variant
              </Typography>
            </div>
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography variant="body2">A: {testData.trafficAllocation}%</Typography>
                <Typography variant="body2">B: {100 - testData.trafficAllocation}%</Typography>
              </div>
              <Input
                type="range"
                min="10"
                max="90"
                step="5"
                value={testData.trafficAllocation}
                onChange={(e) => updateTestData('trafficAllocation', parseInt(e.target.value))}
                style={{ marginTop: '8px' }}
              />
            </div>
          </ConfigRow>
          
          <ConfigRow>
            <div>
              <Typography variant="body1" weight="medium">Target Audience</Typography>
              <Typography variant="body2" color="secondary">
                Which users should be included in the test
              </Typography>
            </div>
            <SimpleSelect
              value={testData.targetAudience}
              onChange={(e) => updateTestData('targetAudience', e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="all_users">All Users</option>
              <option value="new_users">New Users Only</option>
              <option value="returning_users">Returning Users Only</option>
              <option value="premium_users">Premium Users</option>
              <option value="custom_segment">Custom Segment</option>
            </SimpleSelect>
          </ConfigRow>
        </TestConfigCard>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Icon name="calendar" size={20} />
          <Typography variant="h6" weight="semibold">Duration & Schedule</Typography>
        </SectionTitle>
        
        <TestConfigCard>
          <FormGrid>
            <Input
              label="Test Duration (days)"
              type="number"
              min="7"
              max="90"
              value={testData.duration}
              onChange={(e) => updateTestData('duration', parseInt(e.target.value))}
              error={validation.duration}
            />
            <Input
              label="Start Date"
              type="date"
              value={testData.startDate}
              onChange={(e) => updateTestData('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </FormGrid>
          
          <ConfigRow>
            <div>
              <Typography variant="body1" weight="medium">Auto-end Test</Typography>
              <Typography variant="body2" color="secondary">
                Automatically end test when statistical significance is reached
              </Typography>
            </div>
            <SimpleSwitch
              checked={testData.autoEnd}
              onClick={() => updateTestData('autoEnd', !testData.autoEnd)}
            />
          </ConfigRow>
          
          <ConfigRow>
            <div>
              <Typography variant="body1" weight="medium">Include Weekend Traffic</Typography>
              <Typography variant="body2" color="secondary">
                Include weekend traffic in test analysis
              </Typography>
            </div>
            <SimpleSwitch
              checked={testData.weekendTraffic}
              onClick={() => updateTestData('weekendTraffic', !testData.weekendTraffic)}
            />
          </ConfigRow>
        </TestConfigCard>
      </FormSection>
    </StepContainer>
  );

  const renderReviewStep = () => (
    <StepContainer
      key="review"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h5" weight="semibold" style={{ marginBottom: '24px' }}>
        Review & Launch Test
      </Typography>

      <div style={{ display: 'grid', gap: '24px' }}>
        <TestConfigCard>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Test Overview
          </Typography>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="secondary">Test Name:</Typography>
              <Typography variant="body2" weight="medium">{testData.name}</Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="secondary">Test Type:</Typography>
              <Typography variant="body2" weight="medium">{testData.testType.replace('_', ' ')}</Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="secondary">Duration:</Typography>
              <Typography variant="body2" weight="medium">{testData.duration} days</Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="secondary">Start Date:</Typography>
              <Typography variant="body2" weight="medium">{testData.startDate}</Typography>
            </div>
          </div>
        </TestConfigCard>

        <TestConfigCard>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Model Comparison
          </Typography>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {testData.modelA && (
              <div>
                <Typography variant="body1" weight="semibold" style={{ marginBottom: '8px' }}>
                  Model A (Control)
                </Typography>
                <Typography variant="body2">{testData.modelA.name}</Typography>
                <Typography variant="body2" color="secondary">{testData.modelA.description}</Typography>
              </div>
            )}
            {testData.modelB && (
              <div>
                <Typography variant="body1" weight="semibold" style={{ marginBottom: '8px' }}>
                  Model B (Variant)
                </Typography>
                <Typography variant="body2">{testData.modelB.name}</Typography>
                <Typography variant="body2" color="secondary">{testData.modelB.description}</Typography>
              </div>
            )}
          </div>
        </TestConfigCard>

        <TestConfigCard>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Test Configuration
          </Typography>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Typography variant="body2" color="secondary">Primary Metric:</Typography>
              <Typography variant="body2" weight="medium">{testData.targetMetric.replace('_', ' ')}</Typography>
            </div>
            <div>
              <Typography variant="body2" color="secondary">Minimum Effect:</Typography>
              <Typography variant="body2" weight="medium">{testData.minimumDetectableEffect}%</Typography>
            </div>
            <div>
              <Typography variant="body2" color="secondary">Traffic Split:</Typography>
              <Typography variant="body2" weight="medium">
                {testData.trafficAllocation}% / {100 - testData.trafficAllocation}%
              </Typography>
            </div>
            <div>
              <Typography variant="body2" color="secondary">Significance Level:</Typography>
              <Typography variant="body2" weight="medium">{testData.significanceLevel}%</Typography>
            </div>
          </div>
        </TestConfigCard>

        <AlertCard
          variant="info"
          title="Ready to Launch"
          description="Your A/B test is configured and ready to launch. Once started, the test will run automatically and collect data for analysis."
        />
      </div>
    </StepContainer>
  );

  return (
    <WizardContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <WizardHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="flask" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                A/B Test Creation Wizard
              </Typography>
              <Typography variant="body2" color="secondary">
                Create and configure AI model comparison tests
              </Typography>
            </div>
          </HeaderLeft>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="x" size={16} />
          </Button>
        </HeaderContent>

        {/* Step Indicator */}
        <StepIndicator>
          {steps.map((step, index) => (
            <Step
              key={step.id}
              active={index === currentStep}
              completed={index < currentStep}
            >
              <Icon name={step.icon} size={16} />
              <span>{step.title}</span>
            </Step>
          ))}
        </StepIndicator>
        
        <div style={{ marginTop: '16px' }}>
          <Progress 
            value={((currentStep + 1) / steps.length) * 100} 
            variant="primary" 
            size="sm" 
          />
        </div>
      </WizardHeader>

      {/* Content */}
      <WizardContent>
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </WizardContent>

      {/* Footer */}
      <WizardFooter>
        <FooterLeft>
          {Object.keys(validation).length > 0 && (
            <ValidationMessage>
              <Icon name="alert-circle" size={16} />
              <span>Please fix validation errors to continue</span>
            </ValidationMessage>
          )}
        </FooterLeft>
        
        <FooterRight>
          {currentStep > 0 && (
            <Button variant="outline" onClick={prevStep}>
              <Icon name="arrow-left" size={16} />
              Previous
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button
              variant="primary"
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next
              <Icon name="arrow-right" size={16} />
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleCreateTest}
              disabled={!canProceed()}
              loading={creating}
            >
              <Icon name="rocket" size={16} />
              Launch Test
            </Button>
          )}
        </FooterRight>
      </WizardFooter>
    </WizardContainer>
  );
};

export default ABTestCreationWizard;