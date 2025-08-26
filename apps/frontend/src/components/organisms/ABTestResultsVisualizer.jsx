// A/B Test Results Visualizer Component for OMNIX AI
// Implementation of ORG-013: ABTestResultsVisualizer with comparison
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import MetricCard from '../molecules/MetricCard';
import LoadingAnimations from '../atoms/LoadingAnimations';
import { useABTest } from '../../hooks/useABTesting';

const VisualizerContainer = styled.div`
  background: ${props => props.theme.colors.background.card};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border.subtle};
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
  flex-wrap: wrap;
`;

const TestInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const TestTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const TestMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const ModelSection = styled.div`
  background: ${props => {
    if (props.$isWinner) return props.theme.colors.status.success + '10';
    if (props.$isLoser) return props.theme.colors.status.error + '10';
    return props.theme.colors.background.subtle;
  }};
  border: 2px solid ${props => {
    if (props.$isWinner) return props.theme.colors.status.success;
    if (props.$isLoser) return props.theme.colors.status.error;
    return props.theme.colors.border.subtle;
  }};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
`;

const ModelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ModelName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const WinnerBadge = styled(motion.div)`
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 10;
`;

const VSIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const VSText = styled.div`
  background: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrast};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.full};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  box-shadow: ${props => props.theme.shadows.md};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const StatisticalSection = styled.div`
  background: ${props => props.theme.colors.background.subtle};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const StatTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[3]} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing[3]};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => {
    if (props.$significance) {
      return props.$significance >= 0.95 ? props.theme.colors.status.success : 
             props.$significance >= 0.85 ? props.theme.colors.status.warning :
             props.theme.colors.status.error;
    }
    return props.theme.colors.text.primary;
  }};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const InsightsSection = styled.div`
  background: ${props => props.theme.colors.background.subtle};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
`;

const InsightsTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[3]} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const InsightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InsightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.card};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 3px solid ${props => {
    switch (props.$type) {
      case 'success': return props.theme.colors.status.success;
      case 'warning': return props.theme.colors.status.warning;
      case 'error': return props.theme.colors.status.error;
      default: return props.theme.colors.primary.main;
    }
  }};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.text.secondary};
`;

const ABTestResultsVisualizer = ({ 
  testId, 
  onExport,
  onRefresh,
  className 
}) => {
  const [showRawData, setShowRawData] = useState(false);
  const { test, results, loading, error, refresh } = useABTest(testId, {
    autoRefresh: true,
    includeResults: true,
    includeAnalytics: false
  });

  // Handle refresh
  const handleRefresh = async () => {
    await refresh();
    onRefresh?.();
  };

  // Handle export
  const handleExport = (format) => {
    onExport?.(testId, format);
  };

  // Loading state
  if (loading && !results) {
    return (
      <VisualizerContainer className={className}>
        <LoadingAnimations.Skeleton height="400px" />
      </VisualizerContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <VisualizerContainer className={className}>
        <ErrorState>
          <Icon name="alert-circle" size={48} />
          <h3>Failed to Load Test Results</h3>
          <p>{error}</p>
          <Button onClick={handleRefresh} variant="primary">
            Try Again
          </Button>
        </ErrorState>
      </VisualizerContainer>
    );
  }

  // No results state
  if (!results?.data) {
    return (
      <VisualizerContainer className={className}>
        <ErrorState>
          <Icon name="bar-chart" size={48} />
          <h3>No Results Available</h3>
          <p>Test results are not yet available or the test hasn't started.</p>
          <Button onClick={handleRefresh} variant="outline">
            Refresh
          </Button>
        </ErrorState>
      </VisualizerContainer>
    );
  }

  const { data: testData, summary } = results;
  const { modelAResults, modelBResults, winner, confidence, significance } = testData;

  // Determine winner styling
  const modelAWinner = winner === 'A';
  const modelBWinner = winner === 'B';

  return (
    <VisualizerContainer className={className}>
      <Header>
        <TestInfo>
          <TestTitle>{test?.testName || 'A/B Test Results'}</TestTitle>
          <TestMeta>
            <Badge 
              variant={
                test?.status === 'running' ? 'success' :
                test?.status === 'completed' ? 'info' :
                test?.status === 'paused' ? 'warning' : 'secondary'
              }
            >
              {test?.status || 'Unknown'}
            </Badge>
            <span>{test?.analysisType || 'Analysis'}</span>
            {test?.durationDays && (
              <span>{test.durationDays} day{test.durationDays !== 1 ? 's' : ''}</span>
            )}
          </TestMeta>
        </TestInfo>
        
        <Actions>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <Icon name="refresh-cw" size={16} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Icon name="download" size={16} />
            Export CSV
          </Button>
          <Button
            variant="outline" 
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <Icon name="file-text" size={16} />
            Export PDF
          </Button>
        </Actions>
      </Header>

      <ComparisonGrid>
        {/* Model A */}
        <ModelSection $isWinner={modelAWinner} $isLoser={modelBWinner}>
          <AnimatePresence>
            {modelAWinner && (
              <WinnerBadge
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
              >
                <Badge variant="success">
                  <Icon name="trophy" size={14} />
                  Winner
                </Badge>
              </WinnerBadge>
            )}
          </AnimatePresence>
          
          <ModelHeader>
            <ModelName>Model A</ModelName>
            <Badge variant="outline">
              {modelAResults?.model || test?.modelA || 'Claude Haiku'}
            </Badge>
          </ModelHeader>
          
          <MetricsGrid>
            <MetricCard
              title="Performance Score"
              value={modelAResults?.performanceScore || 0}
              suffix="%"
              trend={modelAResults?.trend}
              size="sm"
            />
            <MetricCard
              title="Accuracy"
              value={modelAResults?.accuracy || 0}
              suffix="%"
              size="sm"
            />
            <MetricCard
              title="Response Time"
              value={modelAResults?.responseTime || 0}
              suffix="ms"
              size="sm"
            />
            <MetricCard
              title="Sample Size"
              value={modelAResults?.sampleSize || 0}
              size="sm"
            />
          </MetricsGrid>
        </ModelSection>

        {/* VS Indicator */}
        <VSIndicator>
          <VSText>VS</VSText>
        </VSIndicator>

        {/* Model B */}
        <ModelSection $isWinner={modelBWinner} $isLoser={modelAWinner}>
          <AnimatePresence>
            {modelBWinner && (
              <WinnerBadge
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
              >
                <Badge variant="success">
                  <Icon name="trophy" size={14} />
                  Winner
                </Badge>
              </WinnerBadge>
            )}
          </AnimatePresence>
          
          <ModelHeader>
            <ModelName>Model B</ModelName>
            <Badge variant="outline">
              {modelBResults?.model || test?.modelB || 'Claude Sonnet'}
            </Badge>
          </ModelHeader>
          
          <MetricsGrid>
            <MetricCard
              title="Performance Score"
              value={modelBResults?.performanceScore || 0}
              suffix="%"
              trend={modelBResults?.trend}
              size="sm"
            />
            <MetricCard
              title="Accuracy"
              value={modelBResults?.accuracy || 0}
              suffix="%"
              size="sm"
            />
            <MetricCard
              title="Response Time"
              value={modelBResults?.responseTime || 0}
              suffix="ms"
              size="sm"
            />
            <MetricCard
              title="Sample Size"
              value={modelBResults?.sampleSize || 0}
              size="sm"
            />
          </MetricsGrid>
        </ModelSection>
      </ComparisonGrid>

      {/* Statistical Analysis */}
      <StatisticalSection>
        <StatTitle>
          <Icon name="trending-up" size={20} />
          Statistical Analysis
        </StatTitle>
        <StatGrid>
          <StatItem>
            <StatValue $significance={confidence}>
              {(confidence * 100).toFixed(1)}%
            </StatValue>
            <StatLabel>Confidence Level</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue $significance={significance}>
              {(significance * 100).toFixed(1)}%
            </StatValue>
            <StatLabel>Statistical Significance</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              {testData.sampleSize || 0}
            </StatValue>
            <StatLabel>Total Sample Size</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              {winner ? `Model ${winner}` : 'Inconclusive'}
            </StatValue>
            <StatLabel>Recommended Winner</StatLabel>
          </StatItem>
        </StatGrid>
      </StatisticalSection>

      {/* Insights */}
      {summary?.insights && (
        <InsightsSection>
          <InsightsTitle>
            <Icon name="lightbulb" size={20} />
            Key Insights
          </InsightsTitle>
          <InsightsList>
            {summary.insights.map((insight, index) => (
              <InsightItem key={index} $type={insight.type}>
                <Icon 
                  name={
                    insight.type === 'success' ? 'check-circle' :
                    insight.type === 'warning' ? 'alert-triangle' :
                    insight.type === 'error' ? 'x-circle' : 'info'
                  } 
                  size={16} 
                />
                <span>{insight.message}</span>
              </InsightItem>
            ))}
          </InsightsList>
        </InsightsSection>
      )}
    </VisualizerContainer>
  );
};

export default ABTestResultsVisualizer;