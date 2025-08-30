/**
 * OMNIX AI - Customer Activity Debug Component
 * Debug controls for testing real-time customer activity functionality
 * MGR-024: Live customer activity feed
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Play, Pause, Users, Settings, Eye, ShoppingCart, Zap, BarChart3 } from 'lucide-react';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';
import { mockCustomerActivityGenerator } from '../../services/mockCustomerActivityGenerator';
import useWebSocketStore from '../../store/websocketStore';

const DebugContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.large};
  min-width: 320px;
  max-width: 400px;
  border: 2px solid ${({ theme }) => theme.colors.border.medium};
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

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CustomerActivityDebug = ({ onClose }) => {
  const [isGeneratorRunning, setIsGeneratorRunning] = useState(false);
  const [generatorStatus, setGeneratorStatus] = useState({});
  
  const { isConnected, connectionState, realtimeData } = useWebSocketStore();

  // Update generator status
  useEffect(() => {
    const updateStatus = () => {
      setGeneratorStatus(mockCustomerActivityGenerator.getStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to customer activity generator events
  useEffect(() => {
    const unsubscribe = mockCustomerActivityGenerator.subscribe((event) => {
      console.log('[CustomerActivityDebug] Customer Activity Event:', event);
    });
    
    return unsubscribe;
  }, []);

  const handleStartGenerator = () => {
    mockCustomerActivityGenerator.start(3000); // Generate every 3 seconds for testing
    setIsGeneratorRunning(true);
  };

  const handleStopGenerator = () => {
    mockCustomerActivityGenerator.stop();
    setIsGeneratorRunning(false);
  };

  const handleGenerateBurst = () => {
    mockCustomerActivityGenerator.generateBurst(8, 300); // 8 activities with 300ms delay
  };

  const handleGenerateSpecificActivity = (activityType) => {
    const customer = mockCustomerActivityGenerator.getRandomCustomer();
    const product = mockCustomerActivityGenerator.getRandomProduct();
    
    mockCustomerActivityGenerator.generateSpecificActivity(customer.id, activityType, {
      productId: product.id,
      productName: product.name,
      category: product.category,
      value: activityType.includes('purchase') ? product.price : null
    });
  };

  const customerActivityCount = realtimeData?.customerActivity?.length || 0;

  return (
    <DebugContainer
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <DebugHeader>
        <h4>
          <Users size={18} />
          Customer Activity Debug
        </h4>
        <Badge variant={isGeneratorRunning ? 'success' : 'neutral'}>
          {isGeneratorRunning ? 'ACTIVE' : 'STOPPED'}
        </Badge>
      </DebugHeader>

      {/* Connection Status */}
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

      {/* Activity Statistics */}
      <DebugSection>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem' }}>
          Activity Statistics
        </h5>
        <StatusGrid>
          <StatusItem>
            <div className="label">Active Users</div>
            <div className="value">{generatorStatus.activeUsers || 0}</div>
          </StatusItem>
          <StatusItem>
            <div className="label">Generated</div>
            <div className="value">{generatorStatus.generatedActivities || 0}</div>
          </StatusItem>
          <StatusItem>
            <div className="label">In Feed</div>
            <div className="value">{customerActivityCount}</div>
          </StatusItem>
          <StatusItem>
            <div className="label">Customers</div>
            <div className="value">{generatorStatus.totalCustomers || 0}</div>
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
        
        <Button
          variant="tertiary"
          size="sm"
          onClick={handleGenerateBurst}
          style={{ width: '100%', marginBottom: '8px' }}
        >
          <BarChart3 size={14} />
          Generate Burst (8x)
        </Button>
      </DebugSection>

      {/* Quick Activity Generation */}
      <DebugSection>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem' }}>
          Generate Specific Activity
        </h5>
        <QuickActions>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => handleGenerateSpecificActivity('product_view')}
          >
            <Eye size={14} />
            View
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => handleGenerateSpecificActivity('add_to_cart')}
          >
            <ShoppingCart size={14} />
            Add Cart
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => handleGenerateSpecificActivity('purchase')}
          >
            <Zap size={14} />
            Purchase
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => handleGenerateSpecificActivity('search')}
          >
            <Settings size={14} />
            Search
          </Button>
        </QuickActions>
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

export default CustomerActivityDebug;