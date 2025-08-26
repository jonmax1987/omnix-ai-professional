import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect, useMemo } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Input from '../atoms/Input';
import Progress from '../atoms/Progress';
import AlertCard from '../molecules/AlertCard';
import { useI18n } from '../../hooks/useI18n';

const ConfigurationContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ConfigurationHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.blue[25]} 0%, 
    ${props => props.theme.colors.blue[50]} 100%);
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
    ${props => props.theme.colors.blue[500]} 0%, 
    ${props => props.theme.colors.blue[600]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  background: ${props => props.theme.colors.background.secondary};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.default};
    border-radius: 1px;
  }
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

const ConfigContent = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const ConfigSection = styled(motion.div)`
  margin-bottom: ${props => props.theme.spacing[8]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[5]};
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[5]};
`;

const ConfigCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[5]};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[200]};
    box-shadow: ${props => props.theme.shadows.sm};
  }
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

const ConfigGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ParameterCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['variant', 'active'].includes(prop)
})`
  padding: ${props => props.theme.spacing[4]};
  border: 2px solid ${props => 
    props.active ? props.theme.colors.primary[300] :
    props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  background: ${props => 
    props.active ? props.theme.colors.primary[25] :
    props.theme.colors.background.elevated};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[200]};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  ${props => props.variant === 'premium' && css`
    &::before {
      content: 'PRO';
      position: absolute;
      top: -8px;
      right: 8px;
      background: linear-gradient(135deg, ${props.theme.colors.yellow[400]}, ${props.theme.colors.yellow[500]});
      color: white;
      font-size: ${props.theme.typography.fontSize.xs};
      font-weight: ${props.theme.typography.fontWeight.bold};
      padding: 2px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `}
`;

const ParameterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ParameterIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant'
})`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => getParameterColor(props.variant, props.theme)}20;
  color: ${props => getParameterColor(props.variant, props.theme)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ParameterMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[3]};
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant'
})`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => getParameterColor(props.variant, props.theme)};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const SliderContainer = styled.div`
  margin: ${props => props.theme.spacing[3]} 0;
`;

const SliderTrack = styled.div`
  width: 100%;
  height: 6px;
  background: ${props => props.theme.colors.gray[200]};
  border-radius: 3px;
  position: relative;
  margin: ${props => props.theme.spacing[2]} 0;
`;

const SliderThumb = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'position'
})`
  width: 20px;
  height: 20px;
  background: ${props => props.theme.colors.primary[500]};
  border: 3px solid white;
  border-radius: 50%;
  position: absolute;
  top: -7px;
  left: ${props => props.position}%;
  transform: translateX(-50%);
  cursor: pointer;
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(-50%) scale(1.1);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[4]};
`;

const TemplateCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})`
  padding: ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.selected ? props.theme.colors.primary[300] : props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  background: ${props => props.selected ? props.theme.colors.primary[25] : props.theme.colors.background.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary[200]};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const ValidationSummary = styled.div`
  background: ${props => props.theme.colors.blue[25]};
  border: 1px solid ${props => props.theme.colors.blue[200]};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  margin-top: ${props => props.theme.spacing[6]};
`;

const ValidationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const ValidationItem = styled.div`
  text-align: center;
`;

const ValidationValue = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => 
    props.status === 'good' ? props.theme.colors.green[600] :
    props.status === 'warning' ? props.theme.colors.yellow[600] :
    props.status === 'error' ? props.theme.colors.red[600] :
    props.theme.colors.blue[600]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

// Utility functions
const getParameterColor = (variant, theme) => {
  const colors = {
    statistical: theme.colors?.blue?.[500] || '#3B82F6',
    sampling: theme.colors?.green?.[500] || '#10B981', 
    traffic: theme.colors?.purple?.[500] || '#8B5CF6',
    advanced: theme.colors?.orange?.[500] || '#F97316',
    automation: theme.colors?.pink?.[500] || '#EC4899'
  };
  return colors[variant] || colors.statistical;
};

const ABTestConfiguration = ({
  testId,
  initialConfig = {},
  onConfigUpdate,
  onConfigSave,
  className,
  ...props
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('parameters');
  const [config, setConfig] = useState({
    // Statistical Parameters
    significanceLevel: 95,
    statisticalPower: 80,
    minimumDetectableEffect: 5,
    baselineConversionRate: 10,
    
    // Sampling Configuration
    minimumSampleSize: 1000,
    maximumSampleSize: 50000,
    samplingMethod: 'random',
    stratificationEnabled: false,
    
    // Traffic Management
    trafficAllocation: 50,
    rampUpSpeed: 'gradual',
    maxTrafficPercentage: 100,
    geographicRestrictions: [],
    
    // Advanced Settings
    earlyStoppingEnabled: true,
    peeking: false,
    interimAnalyses: 3,
    bayesianAnalysis: false,
    
    // Automation Rules
    autoStart: false,
    autoStop: true,
    alertThresholds: {
      significanceReached: true,
      conversionDrop: 15,
      errorRateIncrease: 5
    },
    
    // Custom Parameters
    customMetrics: [],
    segmentationRules: [],
    excludionCriteria: [],
    
    ...initialConfig
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [validation, setValidation] = useState({});

  // Configuration templates
  const configTemplates = [
    {
      id: 'standard',
      name: 'Standard A/B Test',
      description: 'Balanced configuration for most experiments',
      icon: 'trending-up',
      variant: 'statistical',
      config: {
        significanceLevel: 95,
        statisticalPower: 80,
        minimumDetectableEffect: 5,
        minimumSampleSize: 1000,
        trafficAllocation: 50,
        earlyStoppingEnabled: true
      },
      metrics: {
        duration: '14 days',
        accuracy: '95%',
        sensitivity: 'Medium'
      }
    },
    {
      id: 'high-traffic',
      name: 'High-Traffic Optimized',
      description: 'For high-volume tests with quick results',
      icon: 'zap',
      variant: 'traffic',
      config: {
        significanceLevel: 90,
        statisticalPower: 80,
        minimumDetectableEffect: 3,
        minimumSampleSize: 5000,
        trafficAllocation: 30,
        rampUpSpeed: 'aggressive'
      },
      metrics: {
        duration: '7 days',
        accuracy: '90%',
        sensitivity: 'High'
      }
    },
    {
      id: 'conservative',
      name: 'Conservative Testing',
      description: 'High accuracy with minimal risk',
      icon: 'shield',
      variant: 'advanced',
      config: {
        significanceLevel: 99,
        statisticalPower: 90,
        minimumDetectableEffect: 10,
        minimumSampleSize: 2000,
        trafficAllocation: 10,
        rampUpSpeed: 'gradual'
      },
      metrics: {
        duration: '21 days',
        accuracy: '99%',
        sensitivity: 'Low'
      }
    },
    {
      id: 'bayesian',
      name: 'Bayesian Analysis',
      description: 'Advanced statistical modeling',
      icon: 'brain',
      variant: 'premium',
      config: {
        bayesianAnalysis: true,
        interimAnalyses: 5,
        peeking: true,
        minimumSampleSize: 1500,
        trafficAllocation: 50
      },
      metrics: {
        duration: '10-28 days',
        accuracy: 'Adaptive',
        sensitivity: 'Dynamic'
      }
    }
  ];

  // Tabs configuration
  const tabs = [
    { id: 'parameters', label: 'Statistical Parameters', icon: 'bar-chart' },
    { id: 'sampling', label: 'Sampling Config', icon: 'users' },
    { id: 'traffic', label: 'Traffic Management', icon: 'activity' },
    { id: 'advanced', label: 'Advanced Settings', icon: 'settings' },
    { id: 'automation', label: 'Automation Rules', icon: 'zap' },
    { id: 'templates', label: 'Configuration Templates', icon: 'layout' }
  ];

  // Update configuration
  const updateConfig = useCallback((field, value) => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      onConfigUpdate?.(updated);
      return updated;
    });
  }, [onConfigUpdate]);

  // Update nested configuration
  const updateNestedConfig = useCallback((path, value) => {
    setConfig(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      onConfigUpdate?.(updated);
      return updated;
    });
  }, [onConfigUpdate]);

  // Apply template
  const applyTemplate = useCallback((template) => {
    setConfig(prev => {
      const updated = { ...prev, ...template.config };
      setSelectedTemplate(template.id);
      onConfigUpdate?.(updated);
      return updated;
    });
  }, [onConfigUpdate]);

  // Calculate validation metrics
  const validationMetrics = useMemo(() => {
    const sampleSizePerVariant = Math.ceil(config.minimumSampleSize / 2);
    const effectSize = config.minimumDetectableEffect / 100;
    const power = config.statisticalPower / 100;
    const alpha = (100 - config.significanceLevel) / 100;
    
    // Simplified power analysis calculations
    const zAlpha = 1.96; // For 95% confidence
    const zBeta = 0.84;  // For 80% power
    const baseRate = (config.baselineConversionRate || 10) / 100;
    
    const calculatedSampleSize = Math.ceil(
      (2 * Math.pow(zAlpha + zBeta, 2) * baseRate * (1 - baseRate)) / 
      Math.pow(effectSize, 2)
    );
    
    const estimatedDuration = Math.ceil(sampleSizePerVariant / (1000 * (config.trafficAllocation / 100)));
    
    const riskLevel = 
      config.significanceLevel >= 99 ? 'low' :
      config.significanceLevel >= 95 ? 'medium' :
      'high';
      
    const sensitivityLevel =
      config.minimumDetectableEffect <= 3 ? 'high' :
      config.minimumDetectableEffect <= 7 ? 'medium' :
      'low';

    return {
      recommendedSampleSize: calculatedSampleSize,
      actualSampleSize: config.minimumSampleSize,
      estimatedDuration,
      riskLevel,
      sensitivityLevel,
      powerAnalysis: {
        current: power * 100,
        recommended: Math.min(90, power * 100 + 10)
      }
    };
  }, [config]);

  // Validation status
  const getValidationStatus = (value, good, warning) => {
    if (value >= good) return 'good';
    if (value >= warning) return 'warning';
    return 'error';
  };

  // Save configuration
  const handleSave = useCallback(async () => {
    try {
      await onConfigSave?.(config);
      // TODO: Show success notification
    } catch (error) {
      console.error('Failed to save configuration:', error);
      // TODO: Show error notification
    }
  }, [config, onConfigSave]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'parameters':
        return renderStatisticalParameters();
      case 'sampling':
        return renderSamplingConfig();
      case 'traffic':
        return renderTrafficManagement();
      case 'advanced':
        return renderAdvancedSettings();
      case 'automation':
        return renderAutomationRules();
      case 'templates':
        return renderConfigurationTemplates();
      default:
        return null;
    }
  };

  const renderStatisticalParameters = () => (
    <ConfigSection
      key="parameters"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionHeader>
        <SectionTitle>
          <Icon name="bar-chart" size={24} />
          <Typography variant="h5" weight="semibold">Statistical Parameters</Typography>
        </SectionTitle>
      </SectionHeader>

      <ConfigGrid>
        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Power Analysis
          </Typography>
          
          <ConfigGroup>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Significance Level (%)
              </Typography>
              <Input
                type="number"
                min="90"
                max="99.9"
                step="0.1"
                value={config.significanceLevel}
                onChange={(e) => updateConfig('significanceLevel', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Statistical Power (%)
              </Typography>
              <Input
                type="number"
                min="70"
                max="95"
                value={config.statisticalPower}
                onChange={(e) => updateConfig('statisticalPower', parseInt(e.target.value))}
              />
            </div>
          </ConfigGroup>

          <ConfigGroup>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Minimum Detectable Effect (%)
              </Typography>
              <Input
                type="number"
                min="1"
                max="50"
                step="0.5"
                value={config.minimumDetectableEffect}
                onChange={(e) => updateConfig('minimumDetectableEffect', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Baseline Conversion Rate (%)
              </Typography>
              <Input
                type="number"
                min="0.1"
                max="50"
                step="0.1"
                value={config.baselineConversionRate}
                onChange={(e) => updateConfig('baselineConversionRate', parseFloat(e.target.value))}
              />
            </div>
          </ConfigGroup>
        </ConfigCard>

        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Sample Size Configuration
          </Typography>
          
          <ConfigGroup>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Minimum Sample Size
              </Typography>
              <Input
                type="number"
                min="100"
                max="100000"
                step="100"
                value={config.minimumSampleSize}
                onChange={(e) => updateConfig('minimumSampleSize', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Maximum Sample Size
              </Typography>
              <Input
                type="number"
                min={config.minimumSampleSize}
                max="1000000"
                step="1000"
                value={config.maximumSampleSize}
                onChange={(e) => updateConfig('maximumSampleSize', parseInt(e.target.value))}
              />
            </div>
          </ConfigGroup>

          <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
            <Typography variant="body2" color="secondary">
              Recommended sample size: {validationMetrics.recommendedSampleSize.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="tertiary">
              Based on your statistical parameters
            </Typography>
          </div>
        </ConfigCard>
      </ConfigGrid>
    </ConfigSection>
  );

  const renderSamplingConfig = () => (
    <ConfigSection
      key="sampling"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionHeader>
        <SectionTitle>
          <Icon name="users" size={24} />
          <Typography variant="h5" weight="semibold">Sampling Configuration</Typography>
        </SectionTitle>
      </SectionHeader>

      <ConfigGrid>
        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Sampling Method
          </Typography>
          
          <div style={{ marginBottom: '16px' }}>
            <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
              Method
            </Typography>
            <SimpleSelect
              value={config.samplingMethod}
              onChange={(e) => updateConfig('samplingMethod', e.target.value)}
            >
              <option value="random">Simple Random Sampling</option>
              <option value="systematic">Systematic Sampling</option>
              <option value="stratified">Stratified Sampling</option>
              <option value="cluster">Cluster Sampling</option>
            </SimpleSelect>
          </div>

          <ConfigRow>
            <div>
              <Typography variant="body2" weight="medium">Enable Stratification</Typography>
              <Typography variant="caption" color="secondary">
                Ensure balanced representation across user segments
              </Typography>
            </div>
            <SimpleSwitch
              checked={config.stratificationEnabled}
              onClick={() => updateConfig('stratificationEnabled', !config.stratificationEnabled)}
            />
          </ConfigRow>
        </ConfigCard>

        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Quality Controls
          </Typography>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Minimum User Session Duration (minutes)
              </Typography>
              <Input
                type="number"
                min="1"
                max="60"
                defaultValue="2"
                placeholder="Minimum session duration"
              />
            </div>
            
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Exclude Bot Traffic
              </Typography>
              <SimpleSwitch defaultChecked />
            </div>
            
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Geographic Restrictions
              </Typography>
              <SimpleSelect>
                <option value="">No restrictions</option>
                <option value="exclude-bots">Exclude known bot IPs</option>
                <option value="geo-filter">Geographic filtering</option>
              </SimpleSelect>
            </div>
          </div>
        </ConfigCard>
      </ConfigGrid>
    </ConfigSection>
  );

  const renderTrafficManagement = () => (
    <ConfigSection
      key="traffic"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionHeader>
        <SectionTitle>
          <Icon name="activity" size={24} />
          <Typography variant="h5" weight="semibold">Traffic Management</Typography>
        </SectionTitle>
      </SectionHeader>

      <ConfigGrid>
        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Traffic Allocation
          </Typography>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Typography variant="body2" weight="medium">Control Group A</Typography>
              <Typography variant="body2" weight="medium">{config.trafficAllocation}%</Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Typography variant="body2" weight="medium">Variant Group B</Typography>
              <Typography variant="body2" weight="medium">{100 - config.trafficAllocation}%</Typography>
            </div>
            
            <SliderContainer>
              <SliderTrack>
                <SliderThumb position={config.trafficAllocation} />
              </SliderTrack>
              <Input
                type="range"
                min="10"
                max="90"
                value={config.trafficAllocation}
                onChange={(e) => updateConfig('trafficAllocation', parseInt(e.target.value))}
                style={{ width: '100%', opacity: 0, position: 'absolute' }}
              />
            </SliderContainer>
          </div>

          <div>
            <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
              Ramp-up Speed
            </Typography>
            <SimpleSelect
              value={config.rampUpSpeed}
              onChange={(e) => updateConfig('rampUpSpeed', e.target.value)}
            >
              <option value="immediate">Immediate (Full Traffic)</option>
              <option value="gradual">Gradual (5% per hour)</option>
              <option value="aggressive">Aggressive (25% per hour)</option>
              <option value="custom">Custom Schedule</option>
            </SimpleSelect>
          </div>
        </ConfigCard>

        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Traffic Limits & Safety
          </Typography>
          
          <ConfigGroup>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Maximum Traffic (%)
              </Typography>
              <Input
                type="number"
                min="1"
                max="100"
                value={config.maxTrafficPercentage}
                onChange={(e) => updateConfig('maxTrafficPercentage', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Daily Traffic Cap
              </Typography>
              <Input
                type="number"
                min="100"
                step="100"
                placeholder="e.g., 10000"
              />
            </div>
          </ConfigGroup>

          <div style={{ marginTop: '16px' }}>
            <ConfigRow>
              <div>
                <Typography variant="body2" weight="medium">Weekend Traffic</Typography>
                <Typography variant="caption" color="secondary">
                  Include weekend traffic in analysis
                </Typography>
              </div>
              <SimpleSwitch defaultChecked />
            </ConfigRow>
          </div>
        </ConfigCard>
      </ConfigGrid>
    </ConfigSection>
  );

  const renderAdvancedSettings = () => (
    <ConfigSection
      key="advanced"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionHeader>
        <SectionTitle>
          <Icon name="settings" size={24} />
          <Typography variant="h5" weight="semibold">Advanced Settings</Typography>
        </SectionTitle>
      </SectionHeader>

      <ConfigGrid>
        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Statistical Analysis
          </Typography>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <ConfigRow>
              <div>
                <Typography variant="body2" weight="medium">Bayesian Analysis</Typography>
                <Typography variant="caption" color="secondary">
                  Use Bayesian methods for continuous monitoring
                </Typography>
              </div>
              <SimpleSwitch
                checked={config.bayesianAnalysis}
                onClick={() => updateConfig('bayesianAnalysis', !config.bayesianAnalysis)}
              />
            </ConfigRow>
            
            <ConfigRow>
              <div>
                <Typography variant="body2" weight="medium">Allow Peeking</Typography>
                <Typography variant="caption" color="secondary">
                  Allow intermediate result checking
                </Typography>
              </div>
              <SimpleSwitch
                checked={config.peeking}
                onClick={() => updateConfig('peeking', !config.peeking)}
              />
            </ConfigRow>
            
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Interim Analyses Count
              </Typography>
              <Input
                type="number"
                min="1"
                max="10"
                value={config.interimAnalyses}
                onChange={(e) => updateConfig('interimAnalyses', parseInt(e.target.value))}
              />
            </div>
          </div>
        </ConfigCard>

        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Early Stopping Rules
          </Typography>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <ConfigRow>
              <div>
                <Typography variant="body2" weight="medium">Early Stopping Enabled</Typography>
                <Typography variant="caption" color="secondary">
                  Stop test when significance is reached
                </Typography>
              </div>
              <SimpleSwitch
                checked={config.earlyStoppingEnabled}
                onClick={() => updateConfig('earlyStoppingEnabled', !config.earlyStoppingEnabled)}
              />
            </ConfigRow>
            
            {config.earlyStoppingEnabled && (
              <>
                <div>
                  <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                    Minimum Runtime (days)
                  </Typography>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    defaultValue="7"
                    placeholder="Minimum days before early stop"
                  />
                </div>
                
                <div>
                  <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                    Confidence Threshold for Early Stop
                  </Typography>
                  <Input
                    type="number"
                    min="90"
                    max="99.9"
                    step="0.1"
                    defaultValue="99"
                    placeholder="Early stop confidence level"
                  />
                </div>
              </>
            )}
          </div>
        </ConfigCard>
      </ConfigGrid>
    </ConfigSection>
  );

  const renderAutomationRules = () => (
    <ConfigSection
      key="automation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionHeader>
        <SectionTitle>
          <Icon name="zap" size={24} />
          <Typography variant="h5" weight="semibold">Automation Rules</Typography>
        </SectionTitle>
      </SectionHeader>

      <ConfigGrid>
        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Test Lifecycle Automation
          </Typography>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <ConfigRow>
              <div>
                <Typography variant="body2" weight="medium">Auto-start Test</Typography>
                <Typography variant="caption" color="secondary">
                  Automatically start test at scheduled time
                </Typography>
              </div>
              <SimpleSwitch
                checked={config.autoStart}
                onClick={() => updateConfig('autoStart', !config.autoStart)}
              />
            </ConfigRow>
            
            <ConfigRow>
              <div>
                <Typography variant="body2" weight="medium">Auto-stop Test</Typography>
                <Typography variant="caption" color="secondary">
                  Automatically stop when objectives are met
                </Typography>
              </div>
              <SimpleSwitch
                checked={config.autoStop}
                onClick={() => updateConfig('autoStop', !config.autoStop)}
              />
            </ConfigRow>
          </div>
        </ConfigCard>

        <ConfigCard whileHover={{ scale: 1.01 }}>
          <Typography variant="h6" weight="semibold" style={{ marginBottom: '16px' }}>
            Alert Thresholds
          </Typography>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <ConfigRow>
              <div>
                <Typography variant="body2" weight="medium">Significance Reached Alert</Typography>
                <Typography variant="caption" color="secondary">
                  Notify when statistical significance is achieved
                </Typography>
              </div>
              <SimpleSwitch
                checked={config.alertThresholds.significanceReached}
                onClick={() => updateNestedConfig('alertThresholds.significanceReached', !config.alertThresholds.significanceReached)}
              />
            </ConfigRow>
            
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Conversion Drop Alert (%)
              </Typography>
              <Input
                type="number"
                min="5"
                max="50"
                value={config.alertThresholds.conversionDrop}
                onChange={(e) => updateNestedConfig('alertThresholds.conversionDrop', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Typography variant="body2" weight="medium" style={{ marginBottom: '8px' }}>
                Error Rate Increase Alert (%)
              </Typography>
              <Input
                type="number"
                min="1"
                max="20"
                value={config.alertThresholds.errorRateIncrease}
                onChange={(e) => updateNestedConfig('alertThresholds.errorRateIncrease', parseInt(e.target.value))}
              />
            </div>
          </div>
        </ConfigCard>
      </ConfigGrid>
    </ConfigSection>
  );

  const renderConfigurationTemplates = () => (
    <ConfigSection
      key="templates"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionHeader>
        <SectionTitle>
          <Icon name="layout" size={24} />
          <Typography variant="h5" weight="semibold">Configuration Templates</Typography>
        </SectionTitle>
        <Typography variant="body2" color="secondary">
          Quick-start with optimized configurations for common scenarios
        </Typography>
      </SectionHeader>

      <TemplateGrid>
        {configTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            selected={selectedTemplate === template.id}
            onClick={() => applyTemplate(template)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <ParameterIcon variant={template.variant}>
                <Icon name={template.icon} size={20} />
              </ParameterIcon>
              {template.variant === 'premium' && (
                <Badge variant="warning" size="xs">PRO</Badge>
              )}
            </div>
            
            <Typography variant="h6" weight="semibold" style={{ marginBottom: '8px' }}>
              {template.name}
            </Typography>
            <Typography variant="body2" color="secondary" style={{ marginBottom: '16px' }}>
              {template.description}
            </Typography>
            
            <ParameterMetrics>
              {Object.entries(template.metrics).map(([key, value]) => (
                <MetricItem key={key}>
                  <MetricValue variant={template.variant}>{value}</MetricValue>
                  <MetricLabel>{key}</MetricLabel>
                </MetricItem>
              ))}
            </ParameterMetrics>
            
            {selectedTemplate === template.id && (
              <div style={{ marginTop: '12px' }}>
                <Badge variant="success" size="sm">
                  <Icon name="check" size={12} />
                  Applied
                </Badge>
              </div>
            )}
          </TemplateCard>
        ))}
      </TemplateGrid>
    </ConfigSection>
  );

  return (
    <ConfigurationContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      {...props}
    >
      {/* Header */}
      <ConfigurationHeader>
        <HeaderContent>
          <HeaderLeft>
            <HeaderIcon>
              <Icon name="sliders" size={28} />
            </HeaderIcon>
            <div>
              <Typography variant="h4" weight="bold">
                A/B Test Configuration
              </Typography>
              <Typography variant="body2" color="secondary">
                Advanced parameter configuration and optimization settings
              </Typography>
            </div>
          </HeaderLeft>
          <Button variant="primary" onClick={handleSave}>
            <Icon name="save" size={16} />
            Save Configuration
          </Button>
        </HeaderContent>
      </ConfigurationHeader>

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
      <ConfigContent>
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>

        {/* Validation Summary */}
        {activeTab !== 'templates' && (
          <ValidationSummary>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Icon name="check-circle" size={20} color={theme => theme.colors.blue[500]} />
              <Typography variant="h6" weight="semibold">
                Configuration Validation
              </Typography>
            </div>
            
            <ValidationGrid>
              <ValidationItem>
                <ValidationValue status={getValidationStatus(validationMetrics.actualSampleSize, validationMetrics.recommendedSampleSize * 0.8, validationMetrics.recommendedSampleSize * 0.5)}>
                  {validationMetrics.actualSampleSize.toLocaleString()}
                </ValidationValue>
                <MetricLabel>Sample Size</MetricLabel>
              </ValidationItem>
              
              <ValidationItem>
                <ValidationValue status={getValidationStatus(validationMetrics.estimatedDuration, 30, 14)}>
                  {validationMetrics.estimatedDuration} days
                </ValidationValue>
                <MetricLabel>Est. Duration</MetricLabel>
              </ValidationItem>
              
              <ValidationItem>
                <ValidationValue status={validationMetrics.riskLevel === 'low' ? 'good' : validationMetrics.riskLevel === 'medium' ? 'warning' : 'error'}>
                  {config.significanceLevel}%
                </ValidationValue>
                <MetricLabel>Confidence</MetricLabel>
              </ValidationItem>
              
              <ValidationItem>
                <ValidationValue status={validationMetrics.sensitivityLevel === 'high' ? 'good' : validationMetrics.sensitivityLevel === 'medium' ? 'warning' : 'info'}>
                  {config.minimumDetectableEffect}%
                </ValidationValue>
                <MetricLabel>Sensitivity</MetricLabel>
              </ValidationItem>
            </ValidationGrid>
            
            <div style={{ marginTop: '16px' }}>
              <Typography variant="body2" color="secondary">
                Your configuration is {validationMetrics.riskLevel === 'low' ? 'conservative and reliable' : 
                validationMetrics.riskLevel === 'medium' ? 'well-balanced' : 'aggressive but faster'} 
                {' '}with {validationMetrics.sensitivityLevel} sensitivity to detect changes.
              </Typography>
            </div>
          </ValidationSummary>
        )}
      </ConfigContent>
    </ConfigurationContainer>
  );
};

export default ABTestConfiguration;