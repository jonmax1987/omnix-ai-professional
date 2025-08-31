/**
 * CDN Performance Debug Component - PERF-007
 * Real-time monitoring dashboard for CDN performance metrics
 * Provides insights into cache efficiency, load times, and optimization recommendations
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { cdnPerformanceMonitor, assetPreloader } from '../../utils/cdnOptimization.js';

/**
 * Styled Components
 */
const DebugContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: ${props => props.theme.colors?.white || 'white'};
  border: 1px solid ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  z-index: 10000;
  overflow: hidden;
`;

const DebugHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.theme.colors?.gray?.[50] || '#f9fafb'};
  border-bottom: 1px solid ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  font-weight: 600;
  color: ${props => props.theme.colors?.gray?.[900] || '#111827'};
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: ${props => props.theme.colors?.gray?.[600] || '#4b5563'};
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors?.gray?.[100] || '#f3f4f6'};
  }
`;

const DebugContent = styled.div`
  max-height: 600px;
  overflow-y: auto;
  padding: 16px;
`;

const MetricSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors?.gray?.[900] || '#111827'};
  border-bottom: 1px solid ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  padding-bottom: 4px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px dotted ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.span`
  color: ${props => props.theme.colors?.gray?.[700] || '#374151'};
`;

const MetricValue = styled.span`
  font-weight: 600;
  color: ${props => {
    if (props.$status === 'excellent') return props.theme.colors?.green?.[600] || '#059669';
    if (props.$status === 'good') return props.theme.colors?.yellow?.[600] || '#d97706';
    if (props.$status === 'poor') return props.theme.colors?.red?.[600] || '#dc2626';
    return props.theme.colors?.gray?.[900] || '#111827';
  }};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.$percentage > 80) return props.theme.colors?.green?.[500] || '#10b981';
    if (props.$percentage > 60) return props.theme.colors?.yellow?.[500] || '#f59e0b';
    return props.theme.colors?.red?.[500] || '#ef4444';
  }};
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const RecommendationList = styled.ul`
  margin: 8px 0 0 0;
  padding-left: 16px;
  color: ${props => props.theme.colors?.gray?.[600] || '#4b5563'};
`;

const RecommendationItem = styled.li`
  margin-bottom: 4px;
  font-size: 11px;
  line-height: 1.4;
`;

const ActionButton = styled.button`
  background: ${props => props.theme.colors?.blue?.[600] || '#2563eb'};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  margin-right: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors?.blue?.[700] || '#1d4ed8'};
  }

  &:disabled {
    background: ${props => props.theme.colors?.gray?.[400] || '#9ca3af'};
    cursor: not-allowed;
  }
`;

const ImageLoadList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
`;

const ImageLoadItem = styled.div`
  padding: 4px 0;
  border-bottom: 1px dotted ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'};
  font-size: 10px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ImageURL = styled.div`
  color: ${props => props.theme.colors?.gray?.[600] || '#4b5563'};
  margin-bottom: 2px;
  word-break: break-all;
`;

const ImageStats = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${props => props.theme.colors?.gray?.[500] || '#6b7280'};
`;

/**
 * CDN Performance Debug Component
 */
const CDNPerformanceDebug = ({ 
  visible = true, 
  refreshInterval = 2000,
  showImageDetails = false 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [isPreloading, setIsPreloading] = useState(false);

  /**
   * Fetch performance data
   */
  const fetchPerformanceData = useCallback(() => {
    const report = cdnPerformanceMonitor.getPerformanceReport();
    setPerformanceData(report);
  }, []);

  /**
   * Setup auto-refresh
   */
  useEffect(() => {
    if (!visible) return;

    // Initial fetch
    fetchPerformanceData();

    // Setup interval
    const interval = setInterval(fetchPerformanceData, refreshInterval);

    return () => clearInterval(interval);
  }, [visible, refreshInterval, fetchPerformanceData]);

  /**
   * Handle route preloading
   */
  const handlePreloadRoute = async (routeName) => {
    setIsPreloading(true);
    try {
      await assetPreloader.preloadRouteAssets(routeName);
      console.log(`[CDN Debug] Preloaded assets for route: ${routeName}`);
      fetchPerformanceData(); // Refresh data
    } catch (error) {
      console.error(`[CDN Debug] Failed to preload route assets:`, error);
    } finally {
      setIsPreloading(false);
    }
  };

  /**
   * Clear metrics
   */
  const handleClearMetrics = () => {
    if (window.cdnMetrics) {
      window.cdnMetrics = { imageLoads: [] };
    }
    cdnPerformanceMonitor.metrics = {
      imageLoads: [],
      assetPreloads: [],
      cacheHits: 0,
      cacheMisses: 0,
      totalTransferSize: 0,
      averageLoadTime: 0
    };
    fetchPerformanceData();
  };

  if (!visible) return null;

  return (
    <DebugContainer>
      <DebugHeader>
        <span>CDN Performance Monitor</span>
        <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '▶' : '▼'}
        </ToggleButton>
      </DebugHeader>

      {!isCollapsed && (
        <DebugContent>
          {performanceData && (
            <>
              {/* Summary Metrics */}
              <MetricSection>
                <SectionTitle>Performance Summary</SectionTitle>
                <MetricRow>
                  <MetricLabel>Cache Hit Rate:</MetricLabel>
                  <MetricValue $status={performanceData.summary.efficiency}>
                    {performanceData.summary.cacheHitRate}
                  </MetricValue>
                </MetricRow>
                <ProgressBar>
                  <ProgressFill 
                    $percentage={parseFloat(performanceData.summary.cacheHitRate)} 
                  />
                </ProgressBar>
                
                <MetricRow>
                  <MetricLabel>Average Load Time:</MetricLabel>
                  <MetricValue>{performanceData.summary.averageLoadTime}</MetricValue>
                </MetricRow>
                
                <MetricRow>
                  <MetricLabel>Total Requests:</MetricLabel>
                  <MetricValue>{performanceData.summary.totalRequests}</MetricValue>
                </MetricRow>
                
                <MetricRow>
                  <MetricLabel>Transfer Size:</MetricLabel>
                  <MetricValue>{performanceData.summary.totalTransferSize}</MetricValue>
                </MetricRow>
                
                <MetricRow>
                  <MetricLabel>Efficiency:</MetricLabel>
                  <MetricValue $status={performanceData.summary.efficiency}>
                    {performanceData.summary.efficiency}
                  </MetricValue>
                </MetricRow>
              </MetricSection>

              {/* Detailed Metrics */}
              <MetricSection>
                <SectionTitle>Asset Details</SectionTitle>
                <MetricRow>
                  <MetricLabel>Image Loads:</MetricLabel>
                  <MetricValue>{performanceData.details.imageLoads}</MetricValue>
                </MetricRow>
                
                {performanceData.details.slowestImage && (
                  <MetricRow>
                    <MetricLabel>Slowest Image:</MetricLabel>
                    <MetricValue>
                      {performanceData.details.slowestImage.loadTime.toFixed(0)}ms
                    </MetricValue>
                  </MetricRow>
                )}
              </MetricSection>

              {/* Recommendations */}
              {performanceData.details.recommendations.length > 0 && (
                <MetricSection>
                  <SectionTitle>Recommendations</SectionTitle>
                  <RecommendationList>
                    {performanceData.details.recommendations.map((rec, index) => (
                      <RecommendationItem key={index}>{rec}</RecommendationItem>
                    ))}
                  </RecommendationList>
                </MetricSection>
              )}

              {/* Actions */}
              <MetricSection>
                <SectionTitle>Actions</SectionTitle>
                <ActionButton 
                  onClick={() => handlePreloadRoute('dashboard')}
                  disabled={isPreloading}
                >
                  Preload Dashboard
                </ActionButton>
                <ActionButton 
                  onClick={() => handlePreloadRoute('analytics')}
                  disabled={isPreloading}
                >
                  Preload Analytics
                </ActionButton>
                <ActionButton 
                  onClick={handleClearMetrics}
                >
                  Clear Metrics
                </ActionButton>
              </MetricSection>

              {/* Image Load Details */}
              {showImageDetails && window.cdnMetrics?.imageLoads?.length > 0 && (
                <MetricSection>
                  <SectionTitle>Recent Image Loads</SectionTitle>
                  <ImageLoadList>
                    {window.cdnMetrics.imageLoads.slice(-10).map((load, index) => (
                      <ImageLoadItem key={index}>
                        <ImageURL>
                          {load.url.split('/').pop() || load.url}
                        </ImageURL>
                        <ImageStats>
                          <span>{load.loadTime.toFixed(0)}ms</span>
                          <span>{new Date(load.timestamp).toLocaleTimeString()}</span>
                        </ImageStats>
                      </ImageLoadItem>
                    ))}
                  </ImageLoadList>
                </MetricSection>
              )}
            </>
          )}
        </DebugContent>
      )}
    </DebugContainer>
  );
};

export default CDNPerformanceDebug;