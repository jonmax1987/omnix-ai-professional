import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, TrendingUp, Target, Users, Zap, Award, ChevronRight, Play, Settings, BarChart3, Lightbulb, Check, AlertCircle, Info, Star, Clock, DollarSign, Percent, Activity, RefreshCw, Filter, Download, Eye } from 'lucide-react';

const AlgorithmsContainer = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.background.primary};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadows.medium};
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 8px 0 0 0;
  line-height: 1.5;
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.border.light};
  background: ${props => props.active ? props.theme.colors.primary.main + '20' : props.theme.colors.background.secondary};
  color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main + '10'};
  }
`;

const RefreshButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.theme.colors.success.main};
  color: white;
  border: none;
  border-radius: 8px;
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

const AlgorithmGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const AlgorithmCard = styled(motion.div)`
  padding: 24px;
  background: ${props => props.theme.colors.background.secondary};
  border: 2px solid ${props => {
    if (props.recommended) return props.theme.colors.success.main;
    if (props.highPerformance) return props.theme.colors.primary.main;
    return props.theme.colors.border.light;
  }};
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.large};
  }
`;

const CardBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  background: ${props => {
    switch(props.type) {
      case 'recommended': return props.theme.colors.success.main;
      case 'trending': return props.theme.colors.primary.main;
      case 'new': return props.theme.colors.warning.main;
      default: return props.theme.colors.gray[500];
    }
  }};
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AlgorithmIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color || props.theme.colors.primary.main}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const AlgorithmTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const AlgorithmDescription = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0 0 16px 0;
`;

const MetricsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const Metric = styled.div`
  flex: 1;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.color || props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background: ${props => props.primary ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.primary ? props.theme.colors.primary.main : props.theme.colors.border.light};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;

  &:hover {
    background: ${props => props.primary ? props.theme.colors.primary.dark : props.theme.colors.background.hover};
    transform: translateY(-1px);
  }
`;

const DetailModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  border-radius: 16px;
  padding: 32px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  
  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ConfigSection = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const ConfigTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 16px 0;
`;

const ConfigOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};

  &:last-child {
    border-bottom: none;
  }
`;

const OptionLabel = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const OptionValue = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-family: monospace;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 8px;
  padding: 4px;
`;

const Tab = styled.button`
  padding: 12px 20px;
  border: none;
  background: ${props => props.active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.secondary};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.background.hover};
    color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  }
`;

const ABTestRecommendationAlgorithms = ({ onClose, onAlgorithmSelect, testData = [] }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: 'all', label: 'All Algorithms', icon: Cpu },
    { id: 'recommended', label: 'Recommended', icon: Star },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'performance', label: 'High Performance', icon: Award },
    { id: 'speed', label: 'Fast Execution', icon: Zap }
  ];

  const algorithms = useMemo(() => [
    {
      id: 'bayesian-optimization',
      name: 'Bayesian Optimization',
      description: 'Smart parameter optimization using Bayesian inference for faster convergence and better results.',
      icon: Brain,
      color: '#8B5CF6',
      category: 'optimization',
      recommended: true,
      highPerformance: true,
      metrics: {
        accuracy: '94.2%',
        speed: '3.2x',
        confidence: '97%',
        efficiency: '88%'
      },
      tags: ['recommended', 'ai-powered'],
      useCases: ['Complex parameter spaces', 'Limited data scenarios', 'Cost-sensitive testing'],
      configuration: {
        acquisitionFunction: 'Expected Improvement',
        kernelType: 'Matern 5/2',
        explorationWeight: 0.1,
        iterations: 50
      },
      performance: {
        avgImprovement: 24.3,
        timeToSignificance: 18,
        successRate: 87.5,
        costReduction: 32.1
      }
    },
    {
      id: 'multi-armed-bandit',
      name: 'Multi-Armed Bandit',
      description: 'Dynamic traffic allocation that learns and adapts in real-time for optimal revenue generation.',
      icon: Target,
      color: '#10B981',
      category: 'allocation',
      trending: true,
      metrics: {
        accuracy: '91.8%',
        speed: '5.1x',
        confidence: '94%',
        efficiency: '92%'
      },
      tags: ['trending', 'real-time'],
      useCases: ['Revenue optimization', 'Content personalization', 'Dynamic pricing'],
      configuration: {
        strategy: 'Thompson Sampling',
        explorationDecay: 0.95,
        updateFrequency: 'Real-time',
        confidenceThreshold: 0.9
      },
      performance: {
        avgImprovement: 31.7,
        timeToSignificance: 12,
        successRate: 92.3,
        costReduction: 28.4
      }
    },
    {
      id: 'sequential-testing',
      name: 'Sequential Testing',
      description: 'Advanced statistical methods that reduce test duration while maintaining statistical rigor.',
      icon: BarChart3,
      color: '#F59E0B',
      category: 'statistical',
      highPerformance: true,
      metrics: {
        accuracy: '96.1%',
        speed: '2.8x',
        confidence: '98%',
        efficiency: '85%'
      },
      tags: ['statistical', 'fast'],
      useCases: ['Large traffic volumes', 'Quick decisions needed', 'Cost-sensitive tests'],
      configuration: {
        alpha: 0.05,
        beta: 0.2,
        minSampleSize: 1000,
        lookbackPeriods: 7
      },
      performance: {
        avgImprovement: 19.8,
        timeToSignificance: 14,
        successRate: 89.7,
        costReduction: 41.2
      }
    },
    {
      id: 'contextual-bandits',
      name: 'Contextual Bandits',
      description: 'AI-driven personalization that adapts recommendations based on user context and behavior.',
      icon: Users,
      color: '#EF4444',
      category: 'personalization',
      new: true,
      metrics: {
        accuracy: '93.4%',
        speed: '4.3x',
        confidence: '95%',
        efficiency: '90%'
      },
      tags: ['new', 'ai-powered'],
      useCases: ['User personalization', 'Product recommendations', 'Content optimization'],
      configuration: {
        contextFeatures: ['user_segment', 'time_of_day', 'device_type'],
        modelType: 'Linear UCB',
        updateInterval: '1 hour',
        featureSelection: 'Auto'
      },
      performance: {
        avgImprovement: 38.2,
        timeToSignificance: 16,
        successRate: 91.8,
        costReduction: 25.7
      }
    },
    {
      id: 'gradient-bandits',
      name: 'Gradient Bandits',
      description: 'Gradient-based optimization for continuous improvement in multi-variant testing scenarios.',
      icon: Activity,
      color: '#8B5CF6',
      category: 'optimization',
      metrics: {
        accuracy: '89.7%',
        speed: '3.8x',
        confidence: '92%',
        efficiency: '87%'
      },
      tags: ['optimization', 'multi-variant'],
      useCases: ['Multi-variant testing', 'Continuous optimization', 'Feature selection'],
      configuration: {
        learningRate: 0.1,
        baseline: 'Average reward',
        stepSize: 'Adaptive',
        regularization: 'L2'
      },
      performance: {
        avgImprovement: 22.9,
        timeToSignificance: 20,
        successRate: 85.4,
        costReduction: 35.8
      }
    },
    {
      id: 'causal-inference',
      name: 'Causal Inference',
      description: 'Advanced causal modeling to understand true impact and avoid confounding variables.',
      icon: Lightbulb,
      color: '#06B6D4',
      category: 'analysis',
      highPerformance: true,
      metrics: {
        accuracy: '97.3%',
        speed: '2.1x',
        confidence: '99%',
        efficiency: '83%'
      },
      tags: ['advanced', 'causal'],
      useCases: ['Complex business metrics', 'Long-term impact', 'Network effects'],
      configuration: {
        method: 'Difference-in-Differences',
        instrumentalVariables: 'Auto-detect',
        confoundingAdjustment: 'Propensity Score',
        sensitivityAnalysis: 'Enabled'
      },
      performance: {
        avgImprovement: 27.6,
        timeToSignificance: 25,
        successRate: 94.2,
        costReduction: 18.3
      }
    }
  ], []);

  const filteredAlgorithms = useMemo(() => {
    switch (activeFilter) {
      case 'recommended':
        return algorithms.filter(alg => alg.recommended);
      case 'trending':
        return algorithms.filter(alg => alg.trending);
      case 'performance':
        return algorithms.filter(alg => alg.highPerformance);
      case 'speed':
        return algorithms.filter(alg => parseFloat(alg.metrics.speed) >= 3.0);
      default:
        return algorithms;
    }
  }, [algorithms, activeFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate algorithm refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const handleAlgorithmSelect = useCallback((algorithm) => {
    if (onAlgorithmSelect) {
      onAlgorithmSelect(algorithm);
    }
  }, [onAlgorithmSelect]);

  const getBadgeType = (algorithm) => {
    if (algorithm.recommended) return 'recommended';
    if (algorithm.trending) return 'trending';
    if (algorithm.new) return 'new';
    return null;
  };

  const getBadgeLabel = (algorithm) => {
    if (algorithm.recommended) return 'Recommended';
    if (algorithm.trending) return 'Trending';
    if (algorithm.new) return 'New';
    return '';
  };

  const renderAlgorithmDetail = (algorithm) => (
    <DetailModal
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelectedAlgorithm(null)}
    >
      <ModalContent
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <div>
            <ModalTitle>{algorithm.name}</ModalTitle>
            <Subtitle>{algorithm.description}</Subtitle>
          </div>
          <CloseButton onClick={() => setSelectedAlgorithm(null)}>
            ×
          </CloseButton>
        </ModalHeader>

        <TabsContainer>
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            <Eye size={16} />
            Overview
          </Tab>
          <Tab active={activeTab === 'config'} onClick={() => setActiveTab('config')}>
            <Settings size={16} />
            Configuration
          </Tab>
          <Tab active={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>
            <BarChart3 size={16} />
            Performance
          </Tab>
        </TabsContainer>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ConfigSection>
                <ConfigTitle>Use Cases</ConfigTitle>
                {algorithm.useCases.map((useCase, index) => (
                  <ConfigOption key={index}>
                    <OptionLabel>{useCase}</OptionLabel>
                    <Check size={16} color="#10B981" />
                  </ConfigOption>
                ))}
              </ConfigSection>

              <ConfigSection>
                <ConfigTitle>Key Metrics</ConfigTitle>
                <MetricsRow style={{ marginBottom: 0 }}>
                  <Metric>
                    <MetricValue color="#10B981">{algorithm.metrics.accuracy}</MetricValue>
                    <MetricLabel>Accuracy</MetricLabel>
                  </Metric>
                  <Metric>
                    <MetricValue color="#8B5CF6">{algorithm.metrics.speed}</MetricValue>
                    <MetricLabel>Speed</MetricLabel>
                  </Metric>
                  <Metric>
                    <MetricValue color="#F59E0B">{algorithm.metrics.confidence}</MetricValue>
                    <MetricLabel>Confidence</MetricLabel>
                  </Metric>
                  <Metric>
                    <MetricValue color="#06B6D4">{algorithm.metrics.efficiency}</MetricValue>
                    <MetricLabel>Efficiency</MetricLabel>
                  </Metric>
                </MetricsRow>
              </ConfigSection>
            </motion.div>
          )}

          {activeTab === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ConfigSection>
                <ConfigTitle>Algorithm Configuration</ConfigTitle>
                {Object.entries(algorithm.configuration).map(([key, value]) => (
                  <ConfigOption key={key}>
                    <OptionLabel>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</OptionLabel>
                    <OptionValue>{value}</OptionValue>
                  </ConfigOption>
                ))}
              </ConfigSection>
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ConfigSection>
                <ConfigTitle>Performance Statistics</ConfigTitle>
                <ConfigOption>
                  <OptionLabel>Average Improvement</OptionLabel>
                  <OptionValue>{algorithm.performance.avgImprovement}%</OptionValue>
                </ConfigOption>
                <ConfigOption>
                  <OptionLabel>Time to Significance</OptionLabel>
                  <OptionValue>{algorithm.performance.timeToSignificance} days</OptionValue>
                </ConfigOption>
                <ConfigOption>
                  <OptionLabel>Success Rate</OptionLabel>
                  <OptionValue>{algorithm.performance.successRate}%</OptionValue>
                </ConfigOption>
                <ConfigOption>
                  <OptionLabel>Cost Reduction</OptionLabel>
                  <OptionValue>{algorithm.performance.costReduction}%</OptionValue>
                </ConfigOption>
              </ConfigSection>

              <ActionButtons>
                <ActionButton primary onClick={() => handleAlgorithmSelect(algorithm)}>
                  <Play size={16} />
                  Use This Algorithm
                </ActionButton>
                <ActionButton>
                  <Download size={16} />
                  Export Config
                </ActionButton>
              </ActionButtons>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalContent>
    </DetailModal>
  );

  return (
    <AlgorithmsContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <div>
          <Title>
            <Cpu size={32} />
            AI Test Recommendation Algorithms
          </Title>
          <Subtitle>
            Choose the optimal algorithm for your A/B testing scenarios. Our AI recommends the best approach based on your data and goals.
          </Subtitle>
        </div>
      </Header>

      <ControlsSection>
        {filters.map(filter => (
          <FilterButton
            key={filter.id}
            active={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)}
          >
            <filter.icon size={16} />
            {filter.label}
          </FilterButton>
        ))}
        <RefreshButton onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Recommendations'}
        </RefreshButton>
      </ControlsSection>

      <AlgorithmGrid>
        {filteredAlgorithms.map((algorithm, index) => (
          <AlgorithmCard
            key={algorithm.id}
            recommended={algorithm.recommended}
            highPerformance={algorithm.highPerformance}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedAlgorithm(algorithm)}
          >
            {getBadgeType(algorithm) && (
              <CardBadge type={getBadgeType(algorithm)}>
                <Star size={12} />
                {getBadgeLabel(algorithm)}
              </CardBadge>
            )}

            <AlgorithmIcon color={algorithm.color}>
              <algorithm.icon size={24} color={algorithm.color} />
            </AlgorithmIcon>

            <AlgorithmTitle>{algorithm.name}</AlgorithmTitle>
            <AlgorithmDescription>{algorithm.description}</AlgorithmDescription>

            <MetricsRow>
              <Metric>
                <MetricValue color="#10B981">{algorithm.metrics.accuracy}</MetricValue>
                <MetricLabel>Accuracy</MetricLabel>
              </Metric>
              <Metric>
                <MetricValue color="#8B5CF6">{algorithm.metrics.speed}</MetricValue>
                <MetricLabel>Speed</MetricLabel>
              </Metric>
              <Metric>
                <MetricValue color="#F59E0B">{algorithm.metrics.confidence}</MetricValue>
                <MetricLabel>Confidence</MetricLabel>
              </Metric>
            </MetricsRow>

            <ActionButtons>
              <ActionButton>
                <Eye size={16} />
                Details
              </ActionButton>
              <ActionButton primary onClick={(e) => {
                e.stopPropagation();
                handleAlgorithmSelect(algorithm);
              }}>
                <Play size={16} />
                Use Algorithm
              </ActionButton>
            </ActionButtons>
          </AlgorithmCard>
        ))}
      </AlgorithmGrid>

      <AnimatePresence>
        {selectedAlgorithm && renderAlgorithmDetail(selectedAlgorithm)}
      </AnimatePresence>

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AlgorithmsContainer>
  );
};

export default ABTestRecommendationAlgorithms;