/**
 * OMNIX AI - Inventory Change Debug Component
 * Development debug panel for testing inventory level changes
 * MGR-025: Instant inventory level changes
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import mockInventoryChangeGenerator from '../../services/mockInventoryChangeGenerator';
import useWebSocketStore from '../../store/websocketStore';

const DebugPanel = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  z-index: 10000;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
    bottom: 20px;
  }
`;

const DebugHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
`;

const DebugTitle = styled.h4`
  margin: 0;
  color: #ff6b35;
  font-size: 14px;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  
  &:hover {
    color: #ff6b35;
  }
`;

const DebugSection = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h5`
  margin: 0 0 8px 0;
  color: #4CAF50;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ControlRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
`;

const DebugButton = styled.button`
  background: ${props => {
    if (props.variant === 'danger') return '#f44336';
    if (props.variant === 'success') return '#4CAF50';
    if (props.variant === 'warning') return '#ff9800';
    return '#2196F3';
  }};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
`;

const StatusDot = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop)
})`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'connected') return '#4CAF50';
    if (props.status === 'connecting') return '#ff9800';
    return '#f44336';
  }};
  animation: ${props => props.status === 'connecting' ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const StatusText = styled.span`
  font-size: 11px;
  color: #ccc;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const StatItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 6px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${props => {
    if (props.type === 'critical') return '#f44336';
    if (props.type === 'low') return '#ff9800';
    if (props.type === 'normal') return '#4CAF50';
    return '#2196F3';
  }};
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #888;
  margin-top: 2px;
`;

const Select = styled.select`
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  flex: 1;
  
  option {
    background: #333;
    color: white;
  }
`;

const Input = styled.input`
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  width: 60px;
`;

const RecentChanges = styled.div`
  max-height: 120px;
  overflow-y: auto;
  margin-top: 8px;
`;

const ChangeItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 10px;
  border-left: 3px solid ${props => {
    if (props.type === 'sale') return '#2196F3';
    if (props.type === 'restock') return '#4CAF50';
    if (props.type === 'damage') return '#f44336';
    return '#ff9800';
  }};
`;

const InventoryChangeDebug = ({ onClose }) => {
  const [generatorActive, setGeneratorActive] = useState(false);
  const [stats, setStats] = useState({});
  const [recentChanges, setRecentChanges] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [changeType, setChangeType] = useState('sale');
  const [changeAmount, setChangeAmount] = useState(-5);
  const { connectionStatus } = useWebSocketStore();
  
  const inventory = mockInventoryChangeGenerator.getCurrentInventory();
  
  useEffect(() => {
    // Subscribe to inventory changes
    const unsubscribe = mockInventoryChangeGenerator.subscribe((change) => {
      setRecentChanges(prev => [change, ...prev.slice(0, 9)]); // Keep last 10
    });
    
    // Update stats periodically
    const updateStats = () => {
      setStats(mockInventoryChangeGenerator.getInventoryStats());
    };
    
    updateStats();
    const statsInterval = setInterval(updateStats, 2000);
    
    return () => {
      unsubscribe();
      clearInterval(statsInterval);
    };
  }, []);
  
  const handleStart = () => {
    mockInventoryChangeGenerator.start();
    setGeneratorActive(true);
  };
  
  const handleStop = () => {
    mockInventoryChangeGenerator.stop();
    setGeneratorActive(false);
  };
  
  const handleBurst = () => {
    mockInventoryChangeGenerator.generateBurst(5);
  };
  
  const handleSpecificChange = () => {
    if (selectedProduct && changeAmount) {
      mockInventoryChangeGenerator.generateSpecificChange(
        selectedProduct,
        changeType,
        parseInt(changeAmount)
      );
    }
  };
  
  return (
    <DebugPanel
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
    >
      <DebugHeader>
        <DebugTitle>📦 Inventory Debug</DebugTitle>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </DebugHeader>
      
      <DebugSection>
        <SectionTitle>WebSocket Connection</SectionTitle>
        <StatusIndicator>
          <StatusDot status={connectionStatus} />
          <StatusText>Status: {connectionStatus}</StatusText>
        </StatusIndicator>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Inventory Stats</SectionTitle>
        <StatsGrid>
          <StatItem>
            <StatValue type="critical">{stats.critical || 0}</StatValue>
            <StatLabel>Critical</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="low">{stats.low || 0}</StatValue>
            <StatLabel>Low Stock</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue type="normal">{stats.normal || 0}</StatValue>
            <StatLabel>Normal</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.totalUnits || 0}</StatValue>
            <StatLabel>Total Units</StatLabel>
          </StatItem>
        </StatsGrid>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Generator Controls</SectionTitle>
        <ControlRow>
          <DebugButton
            variant="success"
            onClick={handleStart}
            disabled={generatorActive}
          >
            Start Auto
          </DebugButton>
          <DebugButton
            variant="danger"
            onClick={handleStop}
            disabled={!generatorActive}
          >
            Stop Auto
          </DebugButton>
          <DebugButton
            variant="warning"
            onClick={handleBurst}
          >
            Burst (5x)
          </DebugButton>
        </ControlRow>
      </DebugSection>
      
      <DebugSection>
        <SectionTitle>Manual Changes</SectionTitle>
        <ControlRow>
          <Select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Select Product...</option>
            {inventory.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </ControlRow>
        <ControlRow>
          <Select
            value={changeType}
            onChange={(e) => setChangeType(e.target.value)}
          >
            <option value="sale">Sale</option>
            <option value="restock">Restock</option>
            <option value="return">Return</option>
            <option value="damage">Damage</option>
            <option value="adjustment">Adjustment</option>
          </Select>
          <Input
            type="number"
            value={changeAmount}
            onChange={(e) => setChangeAmount(e.target.value)}
            placeholder="Amount"
          />
          <DebugButton onClick={handleSpecificChange}>
            Apply
          </DebugButton>
        </ControlRow>
      </DebugSection>
      
      {recentChanges.length > 0 && (
        <DebugSection>
          <SectionTitle>Recent Changes</SectionTitle>
          <RecentChanges>
            {recentChanges.map(change => (
              <ChangeItem key={change.id} type={change.changeType}>
                <div>
                  <strong>{change.productName}</strong>
                </div>
                <div>
                  {change.changeType}: {change.changeAmount > 0 ? '+' : ''}{change.changeAmount} units
                </div>
                <div style={{ color: '#888' }}>
                  {change.timestamp.toLocaleTimeString()}
                </div>
              </ChangeItem>
            ))}
          </RecentChanges>
        </DebugSection>
      )}
    </DebugPanel>
  );
};

export default InventoryChangeDebug;