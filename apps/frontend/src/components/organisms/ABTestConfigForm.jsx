// A/B Test Configuration Form Component for OMNIX AI
// Comprehensive form for creating and configuring A/B tests
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';
import FormField from '../molecules/FormField';
import FilterDropdown from '../molecules/FilterDropdown';
import AlertCard from '../molecules/AlertCard';
import LoadingAnimations from '../atoms/LoadingAnimations';
import { useABTesting } from '../../hooks/useABTesting';

const FormContainer = styled.div`
  background: ${props => props.theme.colors.background.card};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const FormSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.subtle};
  border-radius: ${props => props.theme.borderRadius.lg};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ModelSelector = styled.div`
  border: 2px solid ${props => 
    props.$selected ? props.theme.colors.primary.main : props.theme.colors.border.subtle
  };
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => 
    props.$selected ? props.theme.colors.primary.main + '10' : 'transparent'
  };
  
  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main + '05'};
  }
`;

const ModelName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const ModelDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const ModelCapabilities = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[1]};
`;

const CapabilityBadge = styled(Badge)`
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const TrafficSlider = styled.div`
  margin: ${props => props.theme.spacing[4]} 0;
`;

const SliderContainer = styled.div`
  position: relative;
  margin: ${props => props.theme.spacing[3]} 0;
`;

const SliderTrack = styled.div`
  height: 8px;
  background: ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.borderRadius.full};
  position: relative;
`;

const SliderFill = styled.div`
  height: 100%;
  background: linear-gradient(
    90deg, 
    ${props => props.theme.colors.primary.main} 0%, 
    ${props => props.theme.colors.secondary.main} 100%
  );
  border-radius: ${props => props.theme.borderRadius.full};
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const SliderThumb = styled.div`
  position: absolute;
  top: -6px;
  left: ${props => props.$percentage}%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: ${props => props.theme.colors.primary.main};
  border: 3px solid ${props => props.theme.colors.background.card};
  border-radius: 50%;
  cursor: pointer;
  box-shadow: ${props => props.theme.shadows.md};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(-50%) scale(1.1);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const SliderInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const TrafficLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ValidationMessages = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  justify-content: center;
  margin-top: ${props => props.theme.spacing[6]};
  flex-wrap: wrap;
`;

const QuickTestTemplates = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const TemplateCard = styled.div`
  padding: ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const TemplateTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const TemplateDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const ABTestConfigForm = ({ 
  isQuickTest = false,
  initialConfig = {},
  onSubmit,
  onCancel,
  loading = false,
  className 
}) => {
  const { availableModels, createTest, createQuickTest } = useABTesting();

  // Form state
  const [config, setConfig] = useState({
    testName: '',
    analysisType: 'consumption_prediction',
    modelA: '',
    modelB: '',
    trafficSplit: 50,
    durationDays: 7,
    targetingCriteria: {},
    metrics: ['accuracy', 'response_time', 'performance_score'],
    ...initialConfig
  });

  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });
  const [submitting, setSubmitting] = useState(false);

  // Analysis type options
  const analysisTypes = [
    { value: 'consumption_prediction', label: 'Consumption Prediction' },
    { value: 'customer_profiling', label: 'Customer Profiling' },
    { value: 'recommendation_generation', label: 'Recommendation Generation' },
    { value: 'inventory_forecasting', label: 'Inventory Forecasting' },
    { value: 'demand_analysis', label: 'Demand Analysis' }
  ];

  // Quick test templates
  const quickTestTemplates = [
    {
      name: 'Smart Recommendations',
      analysisType: 'recommendation_generation',
      description: 'Compare AI models for product recommendation accuracy'
    },
    {
      name: 'Consumption Insights',
      analysisType: 'consumption_prediction',
      description: 'Test which model better predicts customer consumption patterns'
    },
    {
      name: 'Customer Profiling',
      analysisType: 'customer_profiling',
      description: 'Evaluate customer segmentation and profiling accuracy'
    },
    {
      name: 'Inventory Intelligence',
      analysisType: 'inventory_forecasting',
      description: 'Compare inventory forecasting and optimization models'
    }
  ];

  // Update form field
  const updateConfig = useCallback((field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Validate configuration
  const validateConfig = useCallback(() => {
    const errors = [];
    const warnings = [];

    if (!config.testName.trim()) {
      errors.push('Test name is required');
    }

    if (!config.analysisType) {
      errors.push('Analysis type is required');
    }

    if (!isQuickTest) {
      if (!config.modelA || !config.modelB) {
        errors.push('Both Model A and Model B must be selected');
      }

      if (config.modelA === config.modelB) {
        errors.push('Model A and Model B must be different');
      }
    }

    if (config.trafficSplit < 10 || config.trafficSplit > 90) {
      warnings.push('Traffic split should be between 10% and 90% for meaningful results');
    }

    if (config.durationDays < 1) {
      errors.push('Test duration must be at least 1 day');
    } else if (config.durationDays < 7) {
      warnings.push('Tests shorter than 7 days may not have enough data for statistical significance');
    }

    const validation = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    setValidation(validation);
    return validation;
  }, [config, isQuickTest]);

  // Handle form submission
  const handleSubmit = async () => {
    const validationResult = validateConfig();
    if (!validationResult.isValid) return;

    setSubmitting(true);
    
    try {
      let result;
      
      if (isQuickTest) {
        result = await createQuickTest({
          testName: config.testName,
          analysisType: config.analysisType,
          durationDays: config.durationDays,
          trafficSplit: config.trafficSplit
        });
      } else {
        result = await createTest(config);
      }
      
      onSubmit?.(result);
    } catch (error) {
      console.error('Failed to create A/B test:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Apply quick test template
  const applyTemplate = (template) => {
    setConfig(prev => ({
      ...prev,
      testName: prev.testName || `${template.name} Test`,
      analysisType: template.analysisType
    }));
  };

  // Validate on config changes
  useEffect(() => {
    validateConfig();
  }, [validateConfig]);

  return (
    <FormContainer className={className}>
      <Header>
        <Title>
          {isQuickTest ? 'Create Quick A/B Test' : 'Create Custom A/B Test'}
        </Title>
        <Subtitle>
          {isQuickTest 
            ? 'Set up a quick test with predefined model configurations'
            : 'Configure a comprehensive A/B test with custom settings'
          }
        </Subtitle>
      </Header>

      {/* Quick Test Templates */}
      {isQuickTest && (
        <FormSection>
          <SectionTitle>
            <Icon name="zap" size={20} />
            Quick Test Templates
          </SectionTitle>
          <QuickTestTemplates>
            {quickTestTemplates.map((template) => (
              <TemplateCard
                key={template.analysisType}
                onClick={() => applyTemplate(template)}
              >
                <TemplateTitle>{template.name}</TemplateTitle>
                <TemplateDescription>{template.description}</TemplateDescription>
              </TemplateCard>
            ))}
          </QuickTestTemplates>
        </FormSection>
      )}

      {/* Basic Configuration */}
      <FormSection>
        <SectionTitle>
          <Icon name="settings" size={20} />
          Basic Configuration
        </SectionTitle>
        
        <FormGrid>
          <FormField
            label="Test Name"
            required
            error={validation.errors.find(e => e.includes('Test name'))}
          >
            <Input
              value={config.testName}
              onChange={(e) => updateConfig('testName', e.target.value)}
              placeholder="Enter test name"
            />
          </FormField>
          
          <FormField
            label="Analysis Type"
            required
            error={validation.errors.find(e => e.includes('Analysis type'))}
          >
            <FilterDropdown
              options={analysisTypes}
              value={config.analysisType}
              onChange={(value) => updateConfig('analysisType', value)}
              placeholder="Select analysis type"
            />
          </FormField>
          
          <FormField
            label="Test Duration (Days)"
            error={validation.errors.find(e => e.includes('duration'))}
          >
            <Input
              type="number"
              min="1"
              max="30"
              value={config.durationDays}
              onChange={(e) => updateConfig('durationDays', parseInt(e.target.value))}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* Model Selection (Custom tests only) */}
      {!isQuickTest && (
        <FormSection>
          <SectionTitle>
            <Icon name="cpu" size={20} />
            Model Selection
          </SectionTitle>
          
          <FormGrid>
            <div>
              <FormField
                label="Model A"
                required
                error={validation.errors.find(e => e.includes('Model A'))}
              >
                <div style={{ display: 'grid', gap: '12px' }}>
                  {availableModels.map((model) => (
                    <ModelSelector
                      key={model.id}
                      $selected={config.modelA === model.id}
                      onClick={() => updateConfig('modelA', model.id)}
                    >
                      <ModelName>{model.name}</ModelName>
                      <ModelDescription>{model.description}</ModelDescription>
                      <ModelCapabilities>
                        {model.capabilities?.map((capability, index) => (
                          <CapabilityBadge key={index} variant="outline" size="sm">
                            {capability}
                          </CapabilityBadge>
                        ))}
                      </ModelCapabilities>
                    </ModelSelector>
                  ))}
                </div>
              </FormField>
            </div>
            
            <div>
              <FormField
                label="Model B"
                required
                error={validation.errors.find(e => e.includes('Model B'))}
              >
                <div style={{ display: 'grid', gap: '12px' }}>
                  {availableModels.map((model) => (
                    <ModelSelector
                      key={model.id}
                      $selected={config.modelB === model.id}
                      onClick={() => updateConfig('modelB', model.id)}
                    >
                      <ModelName>{model.name}</ModelName>
                      <ModelDescription>{model.description}</ModelDescription>
                      <ModelCapabilities>
                        {model.capabilities?.map((capability, index) => (
                          <CapabilityBadge key={index} variant="outline" size="sm">
                            {capability}
                          </CapabilityBadge>
                        ))}
                      </ModelCapabilities>
                    </ModelSelector>
                  ))}
                </div>
              </FormField>
            </div>
          </FormGrid>
        </FormSection>
      )}

      {/* Traffic Split */}
      <FormSection>
        <SectionTitle>
          <Icon name="shuffle" size={20} />
          Traffic Split
        </SectionTitle>
        
        <TrafficSlider>
          <SliderContainer>
            <SliderTrack>
              <SliderFill $percentage={config.trafficSplit} />
              <SliderThumb $percentage={config.trafficSplit} />
              <SliderInput
                type="range"
                min="10"
                max="90"
                value={config.trafficSplit}
                onChange={(e) => updateConfig('trafficSplit', parseInt(e.target.value))}
              />
            </SliderTrack>
          </SliderContainer>
          
          <TrafficLabels>
            <div>Model A: {config.trafficSplit}%</div>
            <div>Model B: {100 - config.trafficSplit}%</div>
          </TrafficLabels>
        </TrafficSlider>
      </FormSection>

      {/* Validation Messages */}
      <ValidationMessages>
        <AnimatePresence>
          {validation.errors.map((error, index) => (
            <motion.div
              key={`error-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCard
                type="error"
                message={error}
                style={{ marginBottom: '8px' }}
              />
            </motion.div>
          ))}
          
          {validation.warnings.map((warning, index) => (
            <motion.div
              key={`warning-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCard
                type="warning"
                message={warning}
                style={{ marginBottom: '8px' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </ValidationMessages>

      {/* Actions */}
      <ActionsContainer>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!validation.isValid || submitting}
          loading={submitting}
        >
          {submitting ? (
            <>
              <LoadingAnimations.Spinner size="sm" />
              Creating Test...
            </>
          ) : (
            <>
              <Icon name="play" size={16} />
              Create A/B Test
            </>
          )}
        </Button>
      </ActionsContainer>
    </FormContainer>
  );
};

export default ABTestConfigForm;