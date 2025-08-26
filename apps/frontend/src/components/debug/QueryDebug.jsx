// Query Debug Component
// Shows React Query cache status and provides debugging tools
import React, { useState } from 'react';
import styled from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import queryClientService from '../../services/queryClientService';
import {
  useDashboardSummary,
  useRealTimeAnalytics,
  useCostOverview,
  useCacheManagement
} from '../../hooks/useQueries';

const DebugContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  width: 400px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  ${({ theme }) => theme.breakpoints.mobile} {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
`;

const Section = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const QueryItem = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusBadge = styled.span`
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  
  &.loading {
    background: ${({ theme }) => theme.colors.warning};
    color: ${({ theme }) => theme.colors.background};
  }
  
  &.success {
    background: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.background};
  }
  
  &.error {
    background: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.background};
  }
  
  &.stale {
    background: ${({ theme }) => theme.colors.text}50;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const QueryDebug = () => {
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient();
  const { clearCache, invalidateAll } = useCacheManagement();
  
  // Test some queries
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardSummary({}, { enabled: isVisible });
  const { data: realtimeData, isLoading: realtimeLoading, error: realtimeError } = useRealTimeAnalytics({}, { enabled: isVisible });
  const { data: costData, isLoading: costLoading, error: costError } = useCostOverview({}, { enabled: isVisible });
  
  // Get cache stats
  const cacheStats = queryClientService.getCacheStats();
  
  // Get all queries from cache
  const allQueries = queryClient.getQueryCache().getAll();
  const recentQueries = allQueries.slice(-10); // Show last 10 queries
  
  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 9998,
          padding: '8px 12px',
          fontSize: '12px'
        }}
      >
        Show Query Debug
      </Button>
    );
  }

  const formatQueryKey = (queryKey) => {
    if (Array.isArray(queryKey)) {
      return queryKey.join(' → ');
    }
    return String(queryKey);
  };

  const getStatusBadge = (query) => {
    if (query.state.status === 'loading') {
      return <StatusBadge className="loading">Loading</StatusBadge>;
    } else if (query.state.status === 'error') {
      return <StatusBadge className="error">Error</StatusBadge>;
    } else if (query.state.status === 'success' && query.isStale()) {
      return <StatusBadge className="stale">Stale</StatusBadge>;
    } else if (query.state.status === 'success') {
      return <StatusBadge className="success">Fresh</StatusBadge>;
    }
    return null;
  };

  return (
    <DebugContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant="h6">Query Debug</Typography>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="small"
        >
          ×
        </Button>
      </div>

      <Section>
        <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>Cache Statistics</Typography>
        <StatItem>
          <span>Total Queries:</span>
          <strong>{cacheStats.totalQueries}</strong>
        </StatItem>
        <StatItem>
          <span>Active Queries:</span>
          <strong>{cacheStats.activeQueries}</strong>
        </StatItem>
        <StatItem>
          <span>Stale Queries:</span>
          <strong>{cacheStats.staleQueries}</strong>
        </StatItem>
        <StatItem>
          <span>Error Queries:</span>
          <strong>{cacheStats.errorQueries}</strong>
        </StatItem>
        <StatItem>
          <span>Cache Size:</span>
          <strong>{cacheStats.cacheSize} KB</strong>
        </StatItem>
      </Section>

      <Section>
        <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>Test Queries</Typography>
        
        <QueryItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Dashboard Summary</span>
            {dashboardLoading && <StatusBadge className="loading">Loading</StatusBadge>}
            {dashboardError && <StatusBadge className="error">Error</StatusBadge>}
            {dashboardData && <StatusBadge className="success">Success</StatusBadge>}
          </div>
          {dashboardError && (
            <div style={{ color: '#ff4444', fontSize: '10px', marginTop: '4px' }}>
              {dashboardError.message}
            </div>
          )}
        </QueryItem>

        <QueryItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Real-time Analytics</span>
            {realtimeLoading && <StatusBadge className="loading">Loading</StatusBadge>}
            {realtimeError && <StatusBadge className="error">Error</StatusBadge>}
            {realtimeData && <StatusBadge className="success">Success</StatusBadge>}
          </div>
        </QueryItem>

        <QueryItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Cost Overview</span>
            {costLoading && <StatusBadge className="loading">Loading</StatusBadge>}
            {costError && <StatusBadge className="error">Error</StatusBadge>}
            {costData && <StatusBadge className="success">Success</StatusBadge>}
          </div>
        </QueryItem>
      </Section>

      <Section>
        <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>Recent Queries</Typography>
        {recentQueries.length === 0 ? (
          <div style={{ fontSize: '12px', opacity: 0.7 }}>No queries yet</div>
        ) : (
          recentQueries.map((query, index) => (
            <QueryItem key={query.queryHash || index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: '500' }}>{formatQueryKey(query.queryKey)}</span>
                {getStatusBadge(query)}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                Observers: {query.getObserversCount()} | 
                Updated: {new Date(query.state.dataUpdatedAt).toLocaleTimeString()}
              </div>
            </QueryItem>
          ))
        )}
      </Section>

      <Section>
        <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>Cache Actions</Typography>
        <ButtonGroup>
          <Button
            onClick={() => queryClientService.warmCache()}
            size="small"
            variant="outline"
          >
            Warm Cache
          </Button>
          <Button
            onClick={invalidateAll}
            size="small"
            variant="outline"
          >
            Invalidate All
          </Button>
          <Button
            onClick={clearCache}
            size="small"
            variant="outline"
          >
            Clear Cache
          </Button>
          <Button
            onClick={() => queryClientService.cleanupCache()}
            size="small"
            variant="outline"
          >
            Cleanup
          </Button>
        </ButtonGroup>
      </Section>
    </DebugContainer>
  );
};

export default QueryDebug;