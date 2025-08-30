/**
 * OMNIX AI - Revenue Stream Debug Component
 * Debug controls for testing real-time revenue stream functionality
 * MGR-023: Live manager revenue updates
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Play, Pause, DollarSign, Settings, BarChart3, Zap } from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Badge from '../atoms/Badge';
import { mockRevenueGenerator } from '../../services/mockRevenueGenerator';
import useDashboardStore from '../../store/dashboardStore';
import useWebSocketStore from '../../store/websocketStore';

const DebugContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.large};
  min-width: 320px;
  max-width: 400px;
  border: 2px solid ${({ theme }) => theme.colors?.border?.default || theme.colors?.border?.strong || '#e2e8f0'};
  z-index: 1000;
`;

const DebugHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  h4 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const DebugSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatusItem = styled.div`
  text-align: center;
  
  .label {
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 4px;
  }
  
  .value {
    font-size: ${({ theme }) => theme.typography.sizes.md};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ManualTransactionForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RevenueStreamDebug = ({ onClose }) => {
  const [isGeneratorRunning, setIsGeneratorRunning] = useState(false);
  const [generatorStatus, setGeneratorStatus] = useState({});
  const [manualAmount, setManualAmount] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  
  const { realtimeData } = useDashboardStore();
  const { isConnected, connectionState } = useWebSocketStore();

  // Update generator status
  useEffect(() => {
    const updateStatus = () => {
      setGeneratorStatus(mockRevenueGenerator.getStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to revenue generator events
  useEffect(() => {
    const unsubscribe = mockRevenueGenerator.subscribe((event) => {
      console.log('[RevenueStreamDebug] Revenue Event:', event);
    });
    
    return unsubscribe;
  }, []);

  const handleStartGenerator = () => {
    mockRevenueGenerator.start(2000); // Generate every 2 seconds for testing
    setIsGeneratorRunning(true);
  };

  const handleStopGenerator = () => {
    mockRevenueGenerator.stop();
    setIsGeneratorRunning(false);
  };

  const handleManualTransaction = () => {
    if (!manualAmount || isNaN(manualAmount)) return;
    
    const amount = parseFloat(manualAmount);
    const description = manualDescription || 'Manual Test Transaction';
    
    mockRevenueGenerator.generateSpecificTransaction(amount, description);
    setManualAmount('');
    setManualDescription('');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  return (
    <DebugContainer
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <DebugHeader>
        <h4>
          <BarChart3 size={18} />
          Revenue Stream Debug
        </h4>
        <Badge variant={isGeneratorRunning ? 'success' : 'neutral'}>
          {isGeneratorRunning ? 'ACTIVE' : 'STOPPED'}
        </Badge>
      </DebugHeader>

      {/* WebSocket Status */}
      <DebugSection>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem' }}>
          Connection Status
        </h5>
        <StatusGrid>
          <StatusItem>
            <div className="label">WebSocket</div>
            <div className="value">
              <Badge variant={isConnected ? 'success' : 'danger'}>
                {connectionState.toUpperCase()}
              </Badge>
            </div>
          </StatusItem>
          <StatusItem>
            <div className="label">Generator</div>
            <div className="value">
              <Badge variant={isGeneratorRunning ? 'success' : 'neutral'}>
                {isGeneratorRunning ? 'RUNNING' : 'STOPPED'}
              </Badge>
            </div>
          </StatusItem>
        </StatusGrid>
      </DebugSection>

      {/* Revenue Statistics */}
      <DebugSection>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem' }}>
          Revenue Statistics
        </h5>
        <StatusGrid>
          <StatusItem>
            <div className="label">Daily Revenue</div>
            <div className="value">{formatCurrency(generatorStatus.totalDailyRevenue)}</div>
          </StatusItem>
          <StatusItem>
            <div className="label">Progress</div>
            <div className="value">{(generatorStatus.dailyProgress || 0).toFixed(1)}%</div>
          </StatusItem>
          <StatusItem>
            <div className="label">Transactions</div>
            <div className="value">{generatorStatus.transactionCount || 0}</div>
          </StatusItem>
          <StatusItem>
            <div className="label">In Stream</div>
            <div className="value">{realtimeData?.revenueStream?.transactions?.length || 0}</div>
          </StatusItem>
        </StatusGrid>
      </DebugSection>

      {/* Generator Controls */}
      <DebugSection>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem' }}>
          Generator Controls
        </h5>
        <ButtonGroup>
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartGenerator}
            disabled={isGeneratorRunning}
            style={{ flex: 1 }}
          >
            <Play size={14} />
            Start
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStopGenerator}
            disabled={!isGeneratorRunning}
            style={{ flex: 1 }}
          >
            <Pause size={14} />
            Stop
          </Button>
        </ButtonGroup>
      </DebugSection>

      {/* Manual Transaction */}
      <DebugSection>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem' }}>
          Manual Transaction
        </h5>
        <ManualTransactionForm>
          <Input
            type="number"
            placeholder="Amount ($)"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <Input
            type="text"
            placeholder="Description (optional)"
            value={manualDescription}
            onChange={(e) => setManualDescription(e.target.value)}
          />
          <Button
            variant="success"
            size="sm"
            onClick={handleManualTransaction}
            disabled={!manualAmount}
            style={{ width: '100%' }}
          >
            <Zap size={14} />
            Generate Transaction
          </Button>
        </ManualTransactionForm>
      </DebugSection>

      {/* Close Button */}
      {onClose && (
        <Button
          variant="tertiary"
          size="sm"
          onClick={onClose}
          style={{ width: '100%', marginTop: '8px' }}
        >
          Close Debug Panel
        </Button>
      )}
    </DebugContainer>
  );
};

export default RevenueStreamDebug;