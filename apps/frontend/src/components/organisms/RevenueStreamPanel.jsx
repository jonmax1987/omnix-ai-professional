/**
 * OMNIX AI - Real-Time Revenue Stream Panel
 * MGR-023: Live manager revenue updates
 * Displays real-time revenue transactions and metrics with WebSocket updates
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Activity, Target, Clock, AlertCircle } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import useWebSocketStore from '../../store/websocketStore';
import { formatCurrency, formatTime, formatNumber } from '../../utils/formatters';

const PanelContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors.gradients.primary};
    opacity: ${({ isConnected }) => (isConnected ? 1 : 0.3)};
    transition: opacity 0.3s ease;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LiveIndicator = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ isLive }) => (isLive ? '#10b98120' : '#ef444420')};
  color: ${({ isLive }) => (isLive ? '#10b981' : '#ef4444')};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const Dot = styled(motion.span)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MetricCard = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const MetricLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MetricValue = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MetricChange = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ isPositive }) => (isPositive ? '#10b981' : '#ef4444')};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const ProgressContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ theme }) => theme.colors.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const TransactionList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing.sm};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.default};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.medium};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

const TransactionItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const TransactionTime = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TransactionAmount = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.success.main};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RevenueStreamPanel = () => {
  const { 
    realtimeData, 
    metrics, 
    updateRevenueStream,
    updateHourlyRevenue,
    setDailyTarget 
  } = useDashboardStore();
  
  const { 
    isConnected, 
    subscribeToStream, 
    unsubscribeFromStream 
  } = useWebSocketStore();
  
  const [isLive, setIsLive] = useState(false);
  const [revenueRate, setRevenueRate] = useState(0);
  const revenueHistory = useRef([]);
  
  // Subscribe to revenue stream WebSocket events
  useEffect(() => {
    if (!isConnected) return;
    
    // Subscribe to revenue stream
    const handleRevenueUpdate = (data) => {
      if (data.type === 'revenue_update' || data.type === 'transaction') {
        updateRevenueStream(data.payload);
        setIsLive(true);
        
        // Calculate revenue rate (per minute)
        revenueHistory.current.push({
          amount: data.payload.amount,
          timestamp: Date.now()
        });
        
        // Keep only last 60 seconds of history
        const cutoff = Date.now() - 60000;
        revenueHistory.current = revenueHistory.current.filter(
          item => item.timestamp > cutoff
        );
        
        // Calculate rate
        const totalInLastMinute = revenueHistory.current.reduce(
          (sum, item) => sum + item.amount, 
          0
        );
        setRevenueRate(totalInLastMinute);
      }
      
      if (data.type === 'hourly_revenue') {
        updateHourlyRevenue(data.payload);
      }
      
      if (data.type === 'daily_target') {
        setDailyTarget(data.payload.target);
      }
    };
    
    const unsubscribe = subscribeToStream('revenue_stream', handleRevenueUpdate);
    
    // Set live indicator timeout
    const liveTimeout = setInterval(() => {
      const lastUpdate = realtimeData.revenueStream.lastTransaction?.timestamp;
      if (lastUpdate) {
        const timeSinceUpdate = Date.now() - new Date(lastUpdate).getTime();
        setIsLive(timeSinceUpdate < 5000); // Consider live if update within 5 seconds
      }
    }, 1000);
    
    return () => {
      unsubscribe();
      unsubscribeFromStream('revenue_stream', handleRevenueUpdate);
      clearInterval(liveTimeout);
    };
  }, [isConnected, updateRevenueStream, updateHourlyRevenue, setDailyTarget]);
  
  const { revenueStream } = realtimeData;
  const progressPercentage = Math.min(revenueStream.dailyProgress, 100);
  
  return (
    <PanelContainer
      isConnected={isConnected}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <Title>
          <Activity size={24} />
          Real-Time Revenue Stream
        </Title>
        <LiveIndicator isLive={isLive}>
          <Dot
            animate={{ scale: isLive ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          {isLive ? 'LIVE' : 'OFFLINE'}
        </LiveIndicator>
      </Header>
      
      <MetricsGrid>
        <MetricCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <MetricLabel>
            <DollarSign size={16} />
            Today's Revenue
          </MetricLabel>
          <MetricValue>
            {formatCurrency(revenueStream.current)}
            {revenueRate > 0 && (
              <MetricChange isPositive={true}>
                +{formatCurrency(revenueRate)}/min
              </MetricChange>
            )}
          </MetricValue>
        </MetricCard>
        
        <MetricCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <MetricLabel>
            <TrendingUp size={16} />
            Total Transactions
          </MetricLabel>
          <MetricValue>
            {formatNumber(revenueStream.transactions.length)}
          </MetricValue>
        </MetricCard>
        
        <MetricCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <MetricLabel>
            <Target size={16} />
            Average Transaction
          </MetricLabel>
          <MetricValue>
            {revenueStream.transactions.length > 0
              ? formatCurrency(
                  revenueStream.current / revenueStream.transactions.length
                )
              : formatCurrency(0)}
          </MetricValue>
        </MetricCard>
      </MetricsGrid>
      
      <ProgressContainer>
        <ProgressHeader>
          <span>Daily Target Progress</span>
          <span>
            {formatCurrency(revenueStream.current)} / {formatCurrency(revenueStream.dailyTarget)}
          </span>
        </ProgressHeader>
        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </ProgressBar>
      </ProgressContainer>
      
      <Title style={{ fontSize: '1rem', marginBottom: '1rem' }}>
        <Clock size={18} />
        Recent Transactions
      </Title>
      
      {revenueStream.transactions.length > 0 ? (
        <TransactionList>
          <AnimatePresence mode="popLayout">
            {revenueStream.transactions.slice(0, 10).map((transaction, index) => (
              <TransactionItem
                key={transaction.id || `${transaction.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TransactionInfo>
                  <TransactionTitle>
                    {transaction.description || `Order #${transaction.orderId || 'N/A'}`}
                  </TransactionTitle>
                  <TransactionTime>
                    {formatTime(transaction.timestamp)}
                  </TransactionTime>
                </TransactionInfo>
                <TransactionAmount>
                  +{formatCurrency(transaction.amount)}
                </TransactionAmount>
              </TransactionItem>
            ))}
          </AnimatePresence>
        </TransactionList>
      ) : (
        <EmptyState>
          <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
          <div>No transactions yet</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {isConnected 
              ? 'Waiting for live revenue updates...' 
              : 'Connect to WebSocket to see live updates'}
          </div>
        </EmptyState>
      )}
    </PanelContainer>
  );
};

export default RevenueStreamPanel;