/**
 * Service Worker Debug Component - PERF-005: Service worker for caching strategies
 * Debug panel for monitoring service worker performance and cache metrics
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Progress from '../atoms/Progress';
import Button from '../atoms/Button';
import { CacheManager, ServiceWorkerMetrics } from '../../utils/serviceWorker';

const DebugContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  margin: ${props => props.theme.spacing[2]} 0;
`;

const DebugHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const MetricCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]};
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const CacheList = styled.div`
  margin-top: ${props => props.theme.spacing[4]};
`;

const CacheItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[1]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const CacheInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const CacheActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ServiceWorkerDebug = ({ isVisible = true }) => {
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState({
    supported: false,
    registered: false,
    active: false
  });
  const [metrics, setMetrics] = useState({
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    errors: 0,
    cacheEfficiency: 0
  });
  const [caches, setCaches] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Check service worker status
  useEffect(() => {
    const checkStatus = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          setServiceWorkerStatus({
            supported: true,
            registered: !!registration,
            active: !!registration?.active,
            installing: !!registration?.installing,
            waiting: !!registration?.waiting
          });
        } catch (error) {
          setServiceWorkerStatus({ 
            supported: true, 
            registered: false, 
            active: false, 
            error: error.message 
          });
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for service worker messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'SW_METRICS') {
        setMetrics(event.data.data);
        setLastUpdated(new Date());
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  // Get cache sizes
  useEffect(() => {
    const getCacheSizes = async () => {
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          const cacheSizes = {};
          
          for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            cacheSizes[name] = {
              entries: keys.length,
              name: name
            };
          }
          
          setCaches(cacheSizes);
        } catch (error) {
          console.error('Failed to get cache sizes:', error);
        }
      }
    };

    getCacheSizes();
    const interval = setInterval(getCacheSizes, 10000);
    return () => clearInterval(interval);
  }, []);

  // Request metrics from service worker
  const requestMetrics = () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'GET_METRICS'
      });
    }
  };

  // Clear specific cache
  const clearCache = (cacheName = null) => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE',
        cacheName
      });
      
      // Refresh cache list after clearing
      setTimeout(() => {
        const getCacheSizes = async () => {
          const cacheNames = await caches.keys();
          const cacheSizes = {};
          
          for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            cacheSizes[name] = {
              entries: keys.length,
              name: name
            };
          }
          
          setCaches(cacheSizes);
        };
        getCacheSizes();
      }, 1000);
    }
  };

  // Format cache size
  const formatCacheSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isVisible) return null;

  return (
    <DebugContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DebugHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icon name="settings" size={20} color="primary" />
          <Typography variant="h6" weight="semibold">
            Service Worker Debug
          </Typography>
          <Badge variant={serviceWorkerStatus.active ? 'success' : 'error'}>
            {serviceWorkerStatus.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={requestMetrics} size="sm" variant="outline">
            Refresh Metrics
          </Button>
          <Button onClick={() => clearCache()} size="sm" variant="outline">
            Clear All Caches
          </Button>
        </div>
      </DebugHeader>

      {/* Service Worker Status */}
      <StatusIndicator>
        <Typography variant="body2" color="secondary">
          Status:
        </Typography>
        <Badge variant={serviceWorkerStatus.supported ? 'success' : 'error'}>
          {serviceWorkerStatus.supported ? 'Supported' : 'Not Supported'}
        </Badge>
        <Badge variant={serviceWorkerStatus.registered ? 'success' : 'warning'}>
          {serviceWorkerStatus.registered ? 'Registered' : 'Not Registered'}
        </Badge>
        {serviceWorkerStatus.installing && (
          <Badge variant="warning">Installing</Badge>
        )}
        {serviceWorkerStatus.waiting && (
          <Badge variant="info">Update Available</Badge>
        )}
      </StatusIndicator>

      {/* Performance Metrics */}
      <MetricsGrid>
        <MetricCard
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <MetricValue>{metrics.cacheHits}</MetricValue>
          <MetricLabel>Cache Hits</MetricLabel>
        </MetricCard>
        
        <MetricCard
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <MetricValue>{metrics.cacheMisses}</MetricValue>
          <MetricLabel>Cache Misses</MetricLabel>
        </MetricCard>
        
        <MetricCard
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <MetricValue>{metrics.networkRequests}</MetricValue>
          <MetricLabel>Network Requests</MetricLabel>
        </MetricCard>
        
        <MetricCard
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <MetricValue>{metrics.errors}</MetricValue>
          <MetricLabel>Errors</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      {/* Cache Efficiency */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <Typography variant="body2" color="secondary">
            Cache Efficiency
          </Typography>
          <Typography variant="body2" weight="medium">
            {metrics.cacheEfficiency.toFixed(1)}%
          </Typography>
        </div>
        <Progress 
          value={metrics.cacheEfficiency} 
          max={100} 
          variant={metrics.cacheEfficiency > 70 ? 'success' : metrics.cacheEfficiency > 40 ? 'warning' : 'error'}
          animated
        />
      </div>

      {/* Cache List */}
      <CacheList>
        <Typography variant="h6" weight="medium" style={{ marginBottom: '12px' }}>
          Cache Storage ({Object.keys(caches).length} caches)
        </Typography>
        
        {Object.entries(caches).map(([cacheName, cacheData]) => (
          <CacheItem key={cacheName}>
            <CacheInfo>
              <Typography variant="body2" weight="medium">
                {cacheName}
              </Typography>
              <Typography variant="caption" color="secondary">
                {cacheData.entries} entries
              </Typography>
            </CacheInfo>
            
            <CacheActions>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => clearCache(cacheName)}
              >
                Clear
              </Button>
            </CacheActions>
          </CacheItem>
        ))}
      </CacheList>

      {/* Last Updated */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Typography variant="caption" color="secondary">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
      </div>
    </DebugContainer>
  );
};

export default ServiceWorkerDebug;