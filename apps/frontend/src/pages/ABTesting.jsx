import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import Modal from '../components/atoms/Modal';
import DataTable from '../components/organisms/DataTable';
import ABTestCreationWizard from '../components/organisms/ABTestCreationWizard';
import ABTestConfiguration from '../components/organisms/ABTestConfiguration';
import ABTestResultsVisualization from '../components/organisms/ABTestResultsVisualization';
import ABTestStatisticalCalculator from '../components/organisms/ABTestStatisticalCalculator';
import ABTestModelComparison from '../components/organisms/ABTestModelComparison';
import ABTestRecommendationEngine from '../components/organisms/ABTestRecommendationEngine';
import ABTestHistoricalArchive from '../components/organisms/ABTestHistoricalArchive';
import ABTestDeployment from '../components/organisms/ABTestDeployment';
import ABTestPerformanceMonitoring from '../components/organisms/ABTestPerformanceMonitoring';
import ABTestCostAnalysis from '../components/organisms/ABTestCostAnalysis';
import MultiVariantTesting from '../components/organisms/MultiVariantTesting';
import ExperimentSegmentation from '../components/organisms/ExperimentSegmentation';
import ABTestAdvancedReporting from '../components/organisms/ABTestAdvancedReporting';
import ABTestRecommendationAlgorithms from '../components/organisms/ABTestRecommendationAlgorithms';
import ABTestResultsPrediction from '../components/organisms/ABTestResultsPrediction';
import ABTestAutomatedOptimization from '../components/organisms/ABTestAutomatedOptimization';
import ABTestModelBenchmarking from '../components/organisms/ABTestModelBenchmarking';
import ABTestEnvironmentManagement from '../components/organisms/ABTestEnvironmentManagement';
import ABTestRiskAssessment from '../components/organisms/ABTestRiskAssessment';
import ABTestAdvancedStatistics from '../components/organisms/ABTestAdvancedStatistics';
import ABTestDataGovernance from '../components/organisms/ABTestDataGovernance';
import ABTestDocumentation from '../components/organisms/ABTestDocumentation';
import { useI18n } from '../hooks/useI18n';
import { useModal } from '../contexts/ModalContext';

const ABTestingContainer = styled(motion.div)`
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

const ABTestingHeader = styled.div`
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

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const StatCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const TestStatusBadge = styled(Badge).withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  ${props => {
    switch (props.status) {
      case 'running':
        return `
          background-color: ${props.theme?.colors?.green?.[100] || '#dcfce7'};
          color: ${props.theme?.colors?.green?.[700] || '#15803d'};
        `;
      case 'draft':
        return `
          background-color: ${props.theme?.colors?.gray?.[100] || '#f3f4f6'};
          color: ${props.theme?.colors?.gray?.[700] || '#374151'};
        `;
      case 'completed':
        return `
          background-color: ${props.theme?.colors?.blue?.[100] || '#dbeafe'};
          color: ${props.theme?.colors?.blue?.[700] || '#1d4ed8'};
        `;
      case 'paused':
        return `
          background-color: ${props.theme?.colors?.yellow?.[100] || '#fef3c7'};
          color: ${props.theme?.colors?.yellow?.[700] || '#a16207'};
        `;
      case 'cancelled':
        return `
          background-color: ${props.theme?.colors?.red?.[100] || '#fee2e2'};
          color: ${props.theme?.colors?.red?.[700] || '#b91c1c'};
        `;
      default:
        return '';
    }
  }}
`;

const ABTesting = () => {
  const { t } = useI18n();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState([]);
  const [configuredTest, setConfiguredTest] = useState(null);
  const [viewedTest, setViewedTest] = useState(null);
  const [calculatedTest, setCalculatedTest] = useState(null);

  // Mock A/B test data
  useEffect(() => {
    const mockTests = [
      {
        id: 'ab-001',
        name: 'Claude Sonnet vs Haiku Recommendation Accuracy',
        description: 'Comparing recommendation accuracy between Claude Sonnet and Haiku models',
        hypothesis: 'Claude Sonnet will improve recommendation accuracy by 15% compared to Haiku',
        status: 'running',
        testType: 'model_comparison',
        modelA: { name: 'Claude 3 Haiku', id: 'claude-haiku-3' },
        modelB: { name: 'Claude 3.5 Sonnet', id: 'claude-sonnet-3.5' },
        targetMetric: 'recommendation_accuracy',
        progress: 68,
        duration: 14,
        daysRemaining: 4,
        participants: 2847,
        conversionRateA: 12.3,
        conversionRateB: 14.7,
        significance: 89,
        confidenceInterval: '±2.1%',
        startDate: '2024-08-06',
        endDate: '2024-08-20',
        createdBy: 'John Doe',
        createdAt: '2024-08-06T10:00:00Z'
      },
      {
        id: 'ab-002',
        name: 'Response Time Optimization Test',
        description: 'Testing different AI model configurations for faster response times',
        hypothesis: 'Optimized model configuration will reduce response time by 30%',
        status: 'completed',
        testType: 'model_comparison',
        modelA: { name: 'GPT-4 Turbo', id: 'gpt-4-turbo' },
        modelB: { name: 'Claude 3 Haiku', id: 'claude-haiku-3' },
        targetMetric: 'response_time',
        progress: 100,
        duration: 21,
        daysRemaining: 0,
        participants: 5421,
        conversionRateA: 2.8,
        conversionRateB: 1.9,
        significance: 97,
        confidenceInterval: '±0.3s',
        startDate: '2024-07-15',
        endDate: '2024-08-05',
        createdBy: 'Sarah Johnson',
        createdAt: '2024-07-15T14:30:00Z'
      },
      {
        id: 'ab-003',
        name: 'Customer Satisfaction Scoring',
        description: 'A/B testing different AI models for customer satisfaction scoring',
        hypothesis: 'New scoring algorithm will improve customer satisfaction by 20%',
        status: 'draft',
        testType: 'feature_toggle',
        modelA: { name: 'Current Algorithm', id: 'current-algo' },
        modelB: { name: 'New ML Algorithm', id: 'new-ml-algo' },
        targetMetric: 'user_satisfaction',
        progress: 0,
        duration: 28,
        daysRemaining: 28,
        participants: 0,
        conversionRateA: 0,
        conversionRateB: 0,
        significance: 0,
        confidenceInterval: 'N/A',
        startDate: '2024-08-25',
        endDate: '2024-09-22',
        createdBy: 'Mike Chen',
        createdAt: '2024-08-15T09:15:00Z'
      },
      {
        id: 'ab-004',
        name: 'Inventory Prediction Model Test',
        description: 'Comparing different ML models for inventory demand prediction',
        hypothesis: 'Advanced neural network will improve prediction accuracy by 25%',
        status: 'paused',
        testType: 'model_comparison',
        modelA: { name: 'Linear Regression', id: 'linear-regression' },
        modelB: { name: 'Neural Network', id: 'neural-network' },
        targetMetric: 'prediction_accuracy',
        progress: 35,
        duration: 35,
        daysRemaining: 23,
        participants: 1205,
        conversionRateA: 78.5,
        conversionRateB: 82.1,
        significance: 34,
        confidenceInterval: '±5.2%',
        startDate: '2024-08-01',
        endDate: '2024-09-05',
        createdBy: 'Emily Rodriguez',
        createdAt: '2024-08-01T11:45:00Z'
      }
    ];

    setTimeout(() => {
      setTests(mockTests);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate statistics
  const stats = {
    totalTests: tests.length,
    runningTests: tests.filter(t => t.status === 'running').length,
    completedTests: tests.filter(t => t.status === 'completed').length,
    avgSignificance: tests.length > 0 ? 
      Math.round(tests.reduce((sum, t) => sum + t.significance, 0) / tests.length) : 0
  };

  // Handle test creation
  const handleCreateTest = useCallback(async (testConfig) => {
    try {
      console.log('Creating A/B test:', testConfig);
      
      // Generate new test ID
      const newTest = {
        ...testConfig,
        id: `ab-${String(tests.length + 1).padStart(3, '0')}`,
        progress: 0,
        participants: 0,
        conversionRateA: 0,
        conversionRateB: 0,
        significance: 0,
        confidenceInterval: 'N/A',
        daysRemaining: testConfig.duration
      };
      
      // Add to tests list
      setTests(prev => [newTest, ...prev]);
      
      // Close wizard
      closeModal('createTest');
      
      // TODO: Show success notification
      console.log('A/B test created successfully:', newTest.name);
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      // TODO: Show error notification
    }
  }, [tests.length, closeModal]);

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Test Name',
      sortable: true,
      render: (value, test) => (
        <div>
          <Typography variant="body2" weight="medium" style={{ marginBottom: '4px' }}>
            {value}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant="caption" color="secondary">
              {test.testType.replace('_', ' ')}
            </Typography>
            <TestStatusBadge status={test.status} size="xs">
              {test.status}
            </TestStatusBadge>
          </div>
        </div>
      )
    },
    {
      key: 'models',
      header: 'Models',
      render: (value, test) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Typography variant="caption" color="secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="user" size={12} />
            {test.modelA.name}
          </Typography>
          <Typography variant="caption" color="secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="users" size={12} />
            {test.modelB.name}
          </Typography>
        </div>
      )
    },
    {
      key: 'progress',
      header: 'Progress',
      sortable: true,
      render: (value, test) => (
        <div style={{ minWidth: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <Typography variant="caption">{value}%</Typography>
            <Typography variant="caption" color="secondary">
              {test.daysRemaining > 0 ? `${test.daysRemaining}d left` : 'Complete'}
            </Typography>
          </div>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '3px', 
            overflow: 'hidden' 
          }}>
            <div
              style={{
                width: `${value}%`,
                height: '100%',
                backgroundColor: test.status === 'running' ? '#10b981' : 
                                test.status === 'completed' ? '#3b82f6' : '#6b7280',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'participants',
      header: 'Participants',
      sortable: true,
      align: 'right',
      render: (value) => (
        <Typography variant="body2" weight="medium">
          {value.toLocaleString()}
        </Typography>
      )
    },
    {
      key: 'significance',
      header: 'Significance',
      sortable: true,
      align: 'right',
      render: (value, test) => (
        <div style={{ textAlign: 'right' }}>
          <Typography 
            variant="body2" 
            weight="medium"
            color={value >= 95 ? 'success' : value >= 80 ? 'warning' : 'secondary'}
          >
            {value}%
          </Typography>
          <Typography variant="caption" color="secondary">
            {test.confidenceInterval}
          </Typography>
        </div>
      )
    },
    {
      key: 'targetMetric',
      header: 'Metric',
      render: (value, test) => (
        <div style={{ textAlign: 'right' }}>
          <Typography variant="body2" weight="medium">
            {test.conversionRateA.toFixed(1)}% / {test.conversionRateB.toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="secondary">
            A / B
          </Typography>
        </div>
      )
    }
  ];

  // Table actions
  const actions = [
    {
      id: 'view',
      icon: 'eye',
      label: 'View Results',
      show: (test) => test.status === 'running' || test.status === 'completed'
    },
    {
      id: 'calculate',
      icon: 'gauge',
      label: 'Calculate Significance',
      show: (test) => test.status === 'running' || test.status === 'completed'
    },
    {
      id: 'configure',
      icon: 'settings',
      label: 'Configure Parameters',
      disabled: (test) => test.status === 'completed'
    },
    {
      id: 'edit',
      icon: 'edit',
      label: 'Edit Test',
      disabled: (test) => test.status === 'running' || test.status === 'completed'
    },
    {
      id: 'pause',
      icon: 'close',
      label: 'Pause Test',
      show: (test) => test.status === 'running'
    },
    {
      id: 'resume',
      icon: 'trending',
      label: 'Resume Test',
      show: (test) => test.status === 'paused'
    },
    {
      id: 'stop',
      icon: 'check',
      label: 'Stop Test',
      variant: 'error',
      show: (test) => test.status === 'running' || test.status === 'paused'
    },
    {
      id: 'duplicate',
      icon: 'copy',
      label: 'Duplicate Test'
    }
  ];

  // Bulk actions
  const bulkActions = [
    {
      id: 'pause',
      icon: 'close',
      label: 'Pause Selected',
      variant: 'warning'
    },
    {
      id: 'stop',
      icon: 'check',
      label: 'Stop Selected',
      variant: 'error'
    },
    {
      id: 'delete',
      icon: 'trash',
      label: 'Delete Selected',
      variant: 'error'
    }
  ];

  // Handle actions
  const handleAction = useCallback((actionId, test) => {
    console.log(`Action ${actionId} on test:`, test.name);
    
    switch (actionId) {
      case 'view':
        setViewedTest(test);
        openModal('viewResults', { size: 'xl' });
        break;
      case 'calculate':
        setCalculatedTest(test);
        openModal('calculateSignificance', { size: 'xl' });
        break;
      case 'configure':
        setConfiguredTest(test);
        openModal('configureTest', { size: 'xl' });
        break;
      case 'edit':
        // TODO: Open edit modal
        break;
      case 'pause':
        setTests(prev => prev.map(t => 
          t.id === test.id ? { ...t, status: 'paused' } : t
        ));
        break;
      case 'resume':
        setTests(prev => prev.map(t => 
          t.id === test.id ? { ...t, status: 'running' } : t
        ));
        break;
      case 'stop':
        setTests(prev => prev.map(t => 
          t.id === test.id ? { ...t, status: 'completed', progress: 100 } : t
        ));
        break;
      case 'duplicate':
        // TODO: Duplicate test logic
        break;
      default:
        break;
    }
  }, []);

  const handleBulkAction = useCallback((actionId, selectedIds) => {
    console.log(`Bulk action ${actionId} on tests:`, selectedIds);
    
    switch (actionId) {
      case 'pause':
        setTests(prev => prev.map(t => 
          selectedIds.includes(t.id) && t.status === 'running' 
            ? { ...t, status: 'paused' } : t
        ));
        break;
      case 'stop':
        setTests(prev => prev.map(t => 
          selectedIds.includes(t.id) && (t.status === 'running' || t.status === 'paused')
            ? { ...t, status: 'completed', progress: 100 } : t
        ));
        break;
      case 'delete':
        setTests(prev => prev.filter(t => !selectedIds.includes(t.id)));
        break;
      default:
        break;
    }
    
    setSelectedTests([]);
  }, []);

  // Handle configuration update
  const handleConfigUpdate = useCallback((config) => {
    console.log('Configuration updated:', config);
    // Configuration is automatically updated in real-time via the callback
  }, []);

  // Handle configuration save
  const handleConfigSave = useCallback(async (config) => {
    try {
      console.log('Saving configuration for test:', configuredTest.id, config);
      
      // Update test configuration
      setTests(prev => prev.map(t => 
        t.id === configuredTest.id 
          ? { ...t, configuration: config }
          : t
      ));
      
      // Close modal
      closeModal('configureTest');
      setConfiguredTest(null);
      
      // TODO: Show success notification
      console.log('Configuration saved successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  }, [configuredTest, closeModal]);

  // Handle calculation update
  const handleCalculationUpdate = useCallback((calculations) => {
    console.log('Statistical calculations updated:', calculations);
    
    // Update test with new statistical data if needed
    if (calculatedTest && calculations.isSignificant !== undefined) {
      setTests(prev => prev.map(t => 
        t.id === calculatedTest.id 
          ? { 
              ...t, 
              significance: calculations.isSignificant ? 95 : Math.max(60, calculations.pValue * 100),
              statisticalAnalysis: calculations
            }
          : t
      ));
    }
  }, [calculatedTest]);

  // Handle model selection
  const handleModelSelect = useCallback((selectedModel) => {
    console.log('Model selected:', selectedModel);
    
    // TODO: Implement model selection logic
    // This could update global settings or create a new test with the selected model
    closeModal('compareModels');
    
    // TODO: Show success notification
  }, [closeModal]);

  // Handle recommendation selection
  const handleRecommendationSelect = useCallback((recommendation) => {
    console.log('Recommendation selected:', recommendation);
    
    // This could auto-fill the test creation wizard with the recommendation details
    closeModal('recommendations');
    setTimeout(() => {
      openModal('createTest', { size: 'xl' });
    }, 300);
  }, [closeModal, openModal]);

  // Handle execution plan
  const handleExecutePlan = useCallback(() => {
    console.log('Executing recommendation plan');
    
    // This would implement the full execution plan
    // TODO: Show success notification and maybe redirect to execution dashboard
  }, []);

  // Handle algorithm selection
  const handleAlgorithmSelect = useCallback((algorithm) => {
    console.log('Algorithm selected:', algorithm);
    
    // Close algorithms modal and optionally open test creation with pre-selected algorithm
    closeModal('algorithms');
    
    // Could auto-configure the test wizard with the selected algorithm
    setTimeout(() => {
      openModal('createTest', { 
        size: 'xl',
        data: { preSelectedAlgorithm: algorithm }
      });
    }, 300);
    
    // TODO: Show success notification
  }, [closeModal, openModal]);

  // Handle prediction updates
  const handlePredictionUpdate = useCallback((predictionData) => {
    console.log('Prediction data updated:', predictionData);
    
    // Update test data with prediction information
    if (predictionData.testId) {
      setTests(prev => prev.map(t => 
        t.id === predictionData.testId 
          ? { 
              ...t, 
              predictions: predictionData.predictions,
              predictedSignificance: predictionData.confidence,
              recommendedAction: predictionData.recommendedAction
            }
          : t
      ));
    }
    
    // TODO: Show success notification with prediction summary
  }, []);

  // Handle optimization updates
  const handleOptimizationUpdate = useCallback((optimizationData) => {
    console.log('Optimization data updated:', optimizationData);
    
    // Update global optimization settings
    // This could affect how tests are run and monitored
    
    // Update test data with optimization information
    setTests(prev => prev.map(t => 
      t.status === 'running' 
        ? { 
            ...t, 
            optimizationEnabled: optimizationData.enabled,
            optimizationStrategy: optimizationData.strategy,
            lastOptimized: optimizationData.lastRun || new Date()
          }
        : t
    ));
    
    // TODO: Show success notification with optimization summary
  }, []);

  // Handle benchmark model selection
  const handleBenchmarkModelSelect = useCallback((modelData) => {
    console.log('Model selected from benchmarking:', modelData);
    
    // Close benchmarking modal and optionally update model preferences
    closeModal('benchmarking');
    
    // Could update global model preferences or start a new test with the selected model
    // TODO: Implement model preference updates
    
    // TODO: Show success notification
  }, [closeModal]);

  // Handle environment updates
  const handleEnvironmentUpdate = useCallback((environmentData) => {
    console.log('Environment data updated:', environmentData);
    
    // Update environment states and configurations
    // This could affect which tests can run in which environments
    
    // Update test data with environment information if needed
    if (environmentData.environmentId) {
      setTests(prev => prev.map(t => 
        t.environment === environmentData.environmentId
          ? { 
              ...t, 
              environmentStatus: environmentData.action,
              lastEnvironmentUpdate: environmentData.timestamp
            }
          : t
      ));
    }
    
    // TODO: Show success notification with environment update summary
  }, []);

  // Handle risk assessment updates
  const handleRiskUpdate = useCallback((riskData) => {
    console.log('Risk assessment data updated:', riskData);
    
    // Update tests with risk assessment data
    if (riskData.testId) {
      setTests(prev => prev.map(t => 
        t.id === riskData.testId
          ? { 
              ...t, 
              riskAssessment: riskData.assessment,
              riskScore: riskData.overallRisk,
              mitigationActions: riskData.activeMitigations,
              lastRiskUpdate: riskData.timestamp
            }
          : t
      ));
    } else {
      // Apply to all running tests
      setTests(prev => prev.map(t => 
        t.status === 'running'
          ? { 
              ...t, 
              globalRiskLevel: riskData.overallRisk,
              riskRecommendations: riskData.recommendations,
              lastGlobalRiskUpdate: riskData.timestamp
            }
          : t
      ));
    }
    
    // TODO: Show success notification with risk assessment summary
  }, []);

  // Handle advanced statistics analysis updates
  const handleAdvancedAnalysisUpdate = useCallback((analysisData) => {
    console.log('Advanced statistical analysis updated:', analysisData);
    
    // Update tests with statistical analysis data
    if (analysisData.testId) {
      setTests(prev => prev.map(t => 
        t.id === analysisData.testId
          ? { 
              ...t, 
              statisticalAnalysis: analysisData.analysis,
              powerAnalysis: analysisData.analysis?.powerAnalysis,
              effectSizeAnalysis: analysisData.analysis?.effectSize,
              confidenceAnalysis: analysisData.analysis?.confidence,
              bayesianAnalysis: analysisData.analysis?.bayesian,
              lastStatisticalUpdate: analysisData.timestamp
            }
          : t
      ));
    } else {
      // Apply global statistical insights
      setTests(prev => prev.map(t => 
        t.status === 'running' || t.status === 'completed'
          ? { 
              ...t, 
              globalStatisticalInsights: analysisData.analysis,
              statisticalRecommendations: analysisData.recommendations,
              lastGlobalStatisticalUpdate: analysisData.timestamp
            }
          : t
      ));
    }
    
    // TODO: Show success notification with statistical analysis summary
  }, []);

  // Handle data governance updates
  const handleGovernanceUpdate = useCallback((governanceData) => {
    console.log('Data governance updated:', governanceData);
    
    // Update tests with governance compliance data
    if (governanceData.type === 'export') {
      // Handle compliance report export
      setTests(prev => prev.map(t => 
        t.status === 'running' || t.status === 'completed'
          ? { 
              ...t, 
              complianceStatus: governanceData.report?.summary,
              lastComplianceCheck: governanceData.timestamp,
              governanceExports: [...(t.governanceExports || []), {
                timestamp: governanceData.timestamp,
                type: 'full_compliance_report'
              }]
            }
          : t
      ));
    } else if (governanceData.type === 'data_deletion') {
      // Handle data deletion events
      setTests(prev => prev.map(t => ({
        ...t, 
        dataRetentionActions: [...(t.dataRetentionActions || []), {
          action: 'data_deletion',
          deletionId: governanceData.deletionId,
          timestamp: governanceData.timestamp
        }],
        lastDataGovernanceUpdate: governanceData.timestamp
      })));
    } else if (governanceData.type === 'access_review') {
      // Handle access review triggers
      setTests(prev => prev.map(t => ({
        ...t, 
        accessReviews: [...(t.accessReviews || []), {
          roleId: governanceData.roleId,
          reviewedAt: governanceData.timestamp,
          status: 'pending'
        }],
        lastAccessReview: governanceData.timestamp
      })));
    }
    
    // TODO: Show success notification with governance update summary
  }, []);

  // Handle documentation updates
  const handleDocumentationUpdate = useCallback((docData) => {
    console.log('Documentation interaction:', docData);
    
    // Track documentation usage for analytics
    if (docData.type === 'download') {
      setTests(prev => prev.map(t => ({
        ...t, 
        documentationExports: [...(t.documentationExports || []), {
          section: docData.section,
          format: docData.format,
          timestamp: docData.timestamp
        }],
        lastDocumentationAccess: docData.timestamp
      })));
    }
    
    // Could track which sections are most accessed for improvement insights
    
    // TODO: Show success notification for documentation actions
  }, []);

  return (
    <ABTestingContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <ABTestingHeader>
        <HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="h3" weight="bold" color="primary">
              A/B Testing
            </Typography>
            <Badge variant="info" size="sm">
              <Icon name="archive" size={12} />
              AI Models
            </Badge>
          </div>
          <Typography variant="body1" color="secondary">
            Create and manage A/B tests for AI model performance comparison
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            {loading ? 'Loading...' : `${tests.length} total tests`}
          </Typography>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('monitoring', { size: 'xl' })}
          >
            <Icon name="activity" size={16} />
            Monitoring
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('costAnalysis', { size: 'xl' })}
          >
            <Icon name="dollar-sign" size={16} />
            Cost Analysis
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('advancedReporting', { size: 'xl' })}
          >
            <Icon name="analytics" size={16} />
            Advanced Analytics
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('segmentation', { size: 'xl' })}
          >
            <Icon name="users" size={16} />
            Segmentation
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('testHistory', { size: 'xl' })}
          >
            <Icon name="archive" size={16} />
            Test History
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('recommendations', { size: 'xl' })}
          >
            <Icon name="zap" size={16} />
            AI Recommendations
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('algorithms', { size: 'xl' })}
          >
            <Icon name="gauge" size={16} />
            AI Algorithms
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('prediction', { size: 'xl' })}
          >
            <Icon name="brain" size={16} />
            Results Prediction
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('optimization', { size: 'xl' })}
          >
            <Icon name="zap" size={16} />
            Auto Optimization
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('deployment', { size: 'xl' })}
          >
            <Icon name="trending-up" size={16} />
            Deploy Tests
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('compareModels', { size: 'xl' })}
          >
            <Icon name="gauge" size={16} />
            Compare Models
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('benchmarking', { size: 'xl' })}
          >
            <Icon name="analytics" size={16} />
            Model Benchmarking
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('environments', { size: 'xl' })}
          >
            <Icon name="package" size={16} />
            Environments
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('riskAssessment', { size: 'xl' })}
          >
            <Icon name="warning" size={16} />
            Risk Assessment
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('advancedStatistics', { size: 'xl' })}
          >
            <Icon name="gauge" size={16} />
            Advanced Statistics
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('dataGovernance', { size: 'xl' })}
          >
            <Icon name="warning" size={16} />
            Data Governance
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('documentation', { size: 'xl' })}
          >
            <Icon name="folder" size={16} />
            Documentation
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal('multiVariant', { size: 'xl' })}
          >
            <Icon name="grid" size={16} />
            Multi-Variant Test
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openModal('createTest', { size: 'xl' })}
          >
            <Icon name="plus" size={16} />
            New A/B Test
          </Button>
        </HeaderRight>
      </ABTestingHeader>

      {/* Quick Stats */}
      <QuickStats>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue>{stats.totalTests}</StatValue>
          <StatLabel>Total Tests</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue>{stats.runningTests}</StatValue>
          <StatLabel>Running Tests</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue>{stats.completedTests}</StatValue>
          <StatLabel>Completed Tests</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue>{stats.avgSignificance}%</StatValue>
          <StatLabel>Avg Significance</StatLabel>
        </StatCard>
      </QuickStats>

      {/* A/B Tests Table */}
      <DataTable
        title="A/B Test Management"
        description="Monitor and manage your A/B tests and experiments"
        data={tests}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search A/B tests..."
        sortable
        selectable
        actions={actions}
        bulkActions={bulkActions}
        pagination
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        emptyStateTitle="No A/B Tests Found"
        emptyStateDescription="Create your first A/B test to start comparing AI model performance"
        emptyStateIcon="archive"
        onAction={handleAction}
        onBulkAction={handleBulkAction}
        onSelect={setSelectedTests}
        selectedIds={selectedTests}
        exportable
        exportFilename="ab-tests"
        exportFormats={['csv', 'xlsx']}
      />

      {/* Create Test Modal */}
      <Modal
        isOpen={isModalOpen('createTest')}
        onClose={() => closeModal('createTest')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestCreationWizard
          onTestCreate={handleCreateTest}
          onClose={() => closeModal('createTest')}
        />
      </Modal>

      {/* Configure Test Modal */}
      {configuredTest && (
        <Modal
          isOpen={isModalOpen('configureTest')}
          onClose={() => {
            closeModal('configureTest');
            setConfiguredTest(null);
          }}
          title=""
          size="xl"
          padding={false}
        >
          <ABTestConfiguration
            testId={configuredTest.id}
            initialConfig={configuredTest.configuration || {}}
            onConfigUpdate={handleConfigUpdate}
            onConfigSave={handleConfigSave}
          />
        </Modal>
      )}

      {/* View Results Modal */}
      {viewedTest && (
        <Modal
          isOpen={isModalOpen('viewResults')}
          onClose={() => {
            closeModal('viewResults');
            setViewedTest(null);
          }}
          title=""
          size="xl"
          padding={false}
        >
          <ABTestResultsVisualization
            testId={viewedTest.id}
            testData={{
              testName: viewedTest.name,
              status: viewedTest.status,
              progress: viewedTest.progress,
              duration: viewedTest.duration,
              daysRemaining: viewedTest.daysRemaining,
              participants: {
                total: viewedTest.participants,
                variantA: Math.floor(viewedTest.participants / 2),
                variantB: Math.ceil(viewedTest.participants / 2)
              },
              conversions: {
                variantA: { 
                  count: Math.floor(viewedTest.participants * viewedTest.conversionRateA / 200),
                  rate: viewedTest.conversionRateA 
                },
                variantB: { 
                  count: Math.floor(viewedTest.participants * viewedTest.conversionRateB / 200),
                  rate: viewedTest.conversionRateB 
                }
              },
              significance: {
                level: viewedTest.significance,
                pValue: viewedTest.significance >= 95 ? 0.03 : 0.11,
                confidenceInterval: viewedTest.confidenceInterval,
                status: viewedTest.significance >= 95 ? 'significant' : 
                        viewedTest.significance >= 80 ? 'approaching' : 'not_significant'
              }
            }}
            realTimeUpdates={viewedTest.status === 'running'}
          />
        </Modal>
      )}

      {/* Calculate Significance Modal */}
      {calculatedTest && (
        <Modal
          isOpen={isModalOpen('calculateSignificance')}
          onClose={() => {
            closeModal('calculateSignificance');
            setCalculatedTest(null);
          }}
          title=""
          size="xl"
          padding={false}
        >
          <ABTestStatisticalCalculator
            testData={{
              participants: {
                variantA: Math.floor(calculatedTest.participants / 2),
                variantB: Math.ceil(calculatedTest.participants / 2)
              },
              conversions: {
                variantA: {
                  count: Math.floor(calculatedTest.participants * calculatedTest.conversionRateA / 200),
                  rate: calculatedTest.conversionRateA
                },
                variantB: {
                  count: Math.floor(calculatedTest.participants * calculatedTest.conversionRateB / 200), 
                  rate: calculatedTest.conversionRateB
                }
              }
            }}
            onCalculationUpdate={handleCalculationUpdate}
          />
        </Modal>
      )}

      {/* Model Comparison Modal */}
      <Modal
        isOpen={isModalOpen('compareModels')}
        onClose={() => closeModal('compareModels')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestModelComparison
          models={[
            { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', type: 'claude-sonnet' },
            { id: 'claude-haiku', name: 'Claude 3 Haiku', type: 'claude-haiku' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', type: 'gpt-4' }
          ]}
          testResults={{
            // Aggregate test results from current tests
            accuracy: stats.avgSignificance,
            totalTests: stats.totalTests,
            runningTests: stats.runningTests
          }}
          onModelSelect={handleModelSelect}
        />
      </Modal>

      {/* Experiment Segmentation Modal */}
      <Modal
        isOpen={isModalOpen('segmentation')}
        onClose={() => closeModal('segmentation')}
        title=""
        size="xl"
        padding={false}
      >
        <ExperimentSegmentation
          testData={tests}
          onSegmentCreate={(segment) => {
            console.log('New segment created:', segment);
            // Handle new segment creation
          }}
          onSegmentUpdate={(segmentId, updates) => {
            console.log('Segment updated:', segmentId, updates);
            // Handle segment configuration updates
          }}
          onSegmentApply={(segmentId, testId) => {
            console.log('Applying segment to test:', segmentId, testId);
            // Handle segment application to test
          }}
        />
      </Modal>

      {/* Multi-Variant Testing Modal */}
      <Modal
        isOpen={isModalOpen('multiVariant')}
        onClose={() => closeModal('multiVariant')}
        title=""
        size="xl"
        padding={false}
      >
        <MultiVariantTesting
          testData={tests}
          onVariantUpdate={(variantId, updates) => {
            console.log('Variant updated:', variantId, updates);
            // Handle variant configuration updates
          }}
          onTrafficUpdate={(variantId, allocation) => {
            console.log('Traffic allocation updated:', variantId, allocation);
            // Handle traffic allocation changes
          }}
          onTestStart={(variants) => {
            console.log('Starting multi-variant test with variants:', variants);
            // Handle multi-variant test start
          }}
        />
      </Modal>

      {/* Cost Analysis Modal */}
      <Modal
        isOpen={isModalOpen('costAnalysis')}
        onClose={() => closeModal('costAnalysis')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestCostAnalysis
          testData={tests}
          onCostConfigUpdate={(configUpdate) => {
            console.log('Cost configuration updated:', configUpdate);
            // Handle cost configuration updates
          }}
          onOptimizationApply={(optimization) => {
            console.log('Applying optimization:', optimization);
            // Handle optimization implementation
          }}
        />
      </Modal>

      {/* Performance Monitoring Modal */}
      <Modal
        isOpen={isModalOpen('monitoring')}
        onClose={() => closeModal('monitoring')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestPerformanceMonitoring
          testId={selectedTests[0]}
          testData={selectedTests.length > 0 ? tests.find(t => t.id === selectedTests[0]) : null}
          onAlertAction={(alertId, action) => {
            console.log(`Alert ${alertId} action: ${action}`);
            // Handle alert acknowledgment or dismissal
          }}
          onThresholdUpdate={(thresholdUpdate) => {
            console.log('Monitoring thresholds updated:', thresholdUpdate);
            // Handle threshold configuration updates
          }}
        />
      </Modal>

      {/* Deployment Modal */}
      <Modal
        isOpen={isModalOpen('deployment')}
        onClose={() => closeModal('deployment')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestDeployment
          testId={selectedTests[0]}
          testData={selectedTests.length > 0 ? tests.find(t => t.id === selectedTests[0]) : null}
          onDeploymentStart={(config) => {
            console.log('Starting deployment with config:', config);
            // Handle deployment start
          }}
          onDeploymentStop={() => {
            console.log('Stopping deployment');
            // Handle deployment stop
          }}
          onConfigUpdate={(configUpdate) => {
            console.log('Deployment config updated:', configUpdate);
            // Handle configuration updates
          }}
        />
      </Modal>

      {/* Test History Modal */}
      <Modal
        isOpen={isModalOpen('testHistory')}
        onClose={() => closeModal('testHistory')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestHistoricalArchive
          onTestSelect={(test) => {
            console.log('Historical test selected:', test);
            // Could open a detailed view or compare with current tests
          }}
          onExportData={(exportData) => {
            console.log('Exporting historical test data:', exportData);
            // Trigger download or send to external system
          }}
        />
      </Modal>

      {/* AI Recommendations Modal */}
      <Modal
        isOpen={isModalOpen('recommendations')}
        onClose={() => closeModal('recommendations')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestRecommendationEngine
          currentTests={tests}
          businessMetrics={{
            avgSignificance: stats.avgSignificance,
            totalTests: stats.totalTests,
            runningTests: stats.runningTests,
            completedTests: stats.completedTests
          }}
          onRecommendationSelect={handleRecommendationSelect}
          onExecutePlan={handleExecutePlan}
        />
      </Modal>

      {/* Advanced Reporting Modal */}
      <Modal
        isOpen={isModalOpen('advancedReporting')}
        onClose={() => closeModal('advancedReporting')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestAdvancedReporting
          testData={tests}
          onClose={() => closeModal('advancedReporting')}
        />
      </Modal>

      {/* AI Algorithms Modal */}
      <Modal
        isOpen={isModalOpen('algorithms')}
        onClose={() => closeModal('algorithms')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestRecommendationAlgorithms
          testData={tests}
          onAlgorithmSelect={handleAlgorithmSelect}
          onClose={() => closeModal('algorithms')}
        />
      </Modal>

      {/* Results Prediction Modal */}
      <Modal
        isOpen={isModalOpen('prediction')}
        onClose={() => closeModal('prediction')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestResultsPrediction
          testData={tests}
          onPredictionUpdate={handlePredictionUpdate}
          onClose={() => closeModal('prediction')}
        />
      </Modal>

      {/* Automated Optimization Modal */}
      <Modal
        isOpen={isModalOpen('optimization')}
        onClose={() => closeModal('optimization')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestAutomatedOptimization
          testData={tests}
          onOptimizationUpdate={handleOptimizationUpdate}
          onClose={() => closeModal('optimization')}
        />
      </Modal>

      {/* Model Benchmarking Modal */}
      <Modal
        isOpen={isModalOpen('benchmarking')}
        onClose={() => closeModal('benchmarking')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestModelBenchmarking
          models={[
            { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', type: 'claude-sonnet' },
            { id: 'claude-haiku', name: 'Claude 3 Haiku', type: 'claude-haiku' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', type: 'gpt-4' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', type: 'gpt-3.5' }
          ]}
          testData={tests}
          onModelSelect={handleBenchmarkModelSelect}
          onClose={() => closeModal('benchmarking')}
        />
      </Modal>

      {/* Environment Management Modal */}
      <Modal
        isOpen={isModalOpen('environments')}
        onClose={() => closeModal('environments')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestEnvironmentManagement
          onEnvironmentUpdate={handleEnvironmentUpdate}
          onClose={() => closeModal('environments')}
        />
      </Modal>

      {/* Risk Assessment Modal */}
      <Modal
        isOpen={isModalOpen('riskAssessment')}
        onClose={() => closeModal('riskAssessment')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestRiskAssessment
          testData={tests}
          onRiskUpdate={handleRiskUpdate}
          onClose={() => closeModal('riskAssessment')}
        />
      </Modal>

      {/* Advanced Statistics Modal */}
      <Modal
        isOpen={isModalOpen('advancedStatistics')}
        onClose={() => closeModal('advancedStatistics')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestAdvancedStatistics
          testData={tests}
          onAnalysisUpdate={handleAdvancedAnalysisUpdate}
          onClose={() => closeModal('advancedStatistics')}
        />
      </Modal>

      {/* Data Governance Modal */}
      <Modal
        isOpen={isModalOpen('dataGovernance')}
        onClose={() => closeModal('dataGovernance')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestDataGovernance
          testData={tests}
          onGovernanceUpdate={handleGovernanceUpdate}
          onClose={() => closeModal('dataGovernance')}
        />
      </Modal>

      {/* Documentation Modal */}
      <Modal
        isOpen={isModalOpen('documentation')}
        onClose={() => closeModal('documentation')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestDocumentation
          onDocumentationUpdate={handleDocumentationUpdate}
          onClose={() => closeModal('documentation')}
        />
      </Modal>
    </ABTestingContainer>
  );
};

export default ABTesting;