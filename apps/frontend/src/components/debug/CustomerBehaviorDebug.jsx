/**
 * OMNIX AI - Customer Behavior Debug
 * Development testing component for real-time customer behavior tracking
 * STREAM-001: Real-time customer behavior tracking
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Users,
  Activity,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Zap,
  TrendingUp,
  ShoppingCart,
  Eye,
  Search,
  Target,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import mockCustomerBehaviorGenerator from '../../services/mockCustomerBehaviorGenerator';
import useCustomerBehaviorStore from '../../store/customerBehaviorStore';
import useWebSocketStore from '../../store/websocketStore';
import Button from '../atoms/Button';

const DebugContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: 380px;
  width: 400px;
  max-height: 650px;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  font-family: 'SF Mono', monospace;
  font-size: 0.8rem;
  z-index: 10000;
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    bottom: 10px;
    left: 20px;
  }
`;

const DebugHeader = styled.div`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DebugTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DebugContent = styled.div`
  padding: 16px;
  max-height: 550px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const Section = styled.div`
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 0.85rem;
  color: #2196F3;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const ControlButton = styled.button`
  background: ${({ variant }) => {
    switch (variant) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsList = styled.div`
  display: grid;
  gap: 6px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.75rem;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const StatValue = styled.span`
  color: ${({ type }) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      default: return 'white';
    }
  }};
  font-weight: 500;
`;

const BehaviorTypesList = styled.div`
  display: grid;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
`;

const BehaviorTypeItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TypeName = styled.span`
  font-size: 0.75rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TypeCount = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
`;

const CustomerList = styled.div`
  display: grid;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
`;

const CustomerItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 6px 8px;
`;

const CustomerName = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  margin-bottom: 2px;
`;

const CustomerMeta = styled.div`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.6);
`;

const EventLog = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px;
  max-height: 120px;
  overflow-y: auto;
  font-size: 0.7rem;
  line-height: 1.4;
`;

const LogEntry = styled.div`
  color: ${({ type }) => {
    switch (type) {
      case 'behavior': return '#2196F3';
      case 'journey': return '#4CAF50';
      case 'alert': return '#FF9800';
      case 'system': return '#9C27B0';
      default: return 'rgba(255, 255, 255, 0.8)';
    }
  }};
  margin-bottom: 2px;
`;

const CustomerBehaviorDebug = ({ onClose }) => {
  const [generatorStats, setGeneratorStats] = useState({});
  const [eventLog, setEventLog] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { 
    behaviors,
    getMetrics,
    generateInsights,
    trackBehavior,
    reset 
  } = useCustomerBehaviorStore();
  
  const { isConnected, sendMessage } = useWebSocketStore();

  // Update generator stats periodically
  useEffect(() => {
    const updateStats = () => {
      const stats = mockCustomerBehaviorGenerator.getStats();
      setGeneratorStats(stats);
      setIsGenerating(stats.isGenerating);
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor behavior store changes
  useEffect(() => {
    const unsubscribe = useCustomerBehaviorStore.subscribe((state) => {
      if (state.behaviors.length > 0) {
        const latestBehavior = state.behaviors[0];
        addLogEntry(`${latestBehavior.metadata?.customerName}: ${latestBehavior.action}`, 'behavior');
      }
    });

    return unsubscribe;
  }, []);

  const addLogEntry = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [...prev.slice(-19), { message, type, timestamp }]);
  };

  const handleStartGenerator = () => {
    mockCustomerBehaviorGenerator.startGenerating(useCustomerBehaviorStore, {
      behaviorInterval: 1500,  // Generate behavior every 1.5 seconds
      batchSize: 1,
      enableJourneyPatterns: true
    });
    addLogEntry('Customer behavior generator started', 'system');
  };

  const handleStopGenerator = () => {
    mockCustomerBehaviorGenerator.stopGenerating();
    addLogEntry('Customer behavior generator stopped', 'system');
  };

  const handleGenerateBatch = () => {
    mockCustomerBehaviorGenerator.generateBehaviorBatch(useCustomerBehaviorStore, 8);
    addLogEntry('Generated batch of 8 behaviors', 'system');
  };

  const handleGenerateJourney = () => {
    // Manually trigger a journey sequence
    const journeyTypes = ['browser', 'researcher', 'buyer', 'impulse'];
    const randomJourney = journeyTypes[Math.floor(Math.random() * journeyTypes.length)];
    
    addLogEntry(`Generated ${randomJourney} customer journey`, 'journey');
  };

  const handleResetData = () => {
    reset();
    mockCustomerBehaviorGenerator.reset();
    setEventLog([]);
    addLogEntry('Customer behavior data reset', 'system');
  };

  const triggerWebSocketEvent = (eventType) => {
    if (isConnected) {
      sendMessage({
        type: eventType,
        data: {
          timestamp: Date.now(),
          source: 'customer-behavior-debug'
        }
      });
      addLogEntry(`WebSocket event: ${eventType}`, 'system');
    }
  };

  const getBehaviorIcon = (type) => {
    switch (type) {
      case 'page_view': return <Eye size={12} />;
      case 'product_view': return <Target size={12} />;
      case 'purchase': return <ShoppingCart size={12} />;
      case 'search': return <Search size={12} />;
      case 'cart_add': return <ShoppingCart size={12} />;
      default: return <Activity size={12} />;
    }
  };

  // Calculate behavior type statistics
  const behaviorTypeStats = behaviors.reduce((stats, behavior) => {
    stats[behavior.type] = (stats[behavior.type] || 0) + 1;
    return stats;
  }, {});

  const metrics = getMetrics();
  const recentBehaviors = behaviors.slice(0, 10);

  return (
    <DebugContainer
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DebugHeader>
        <DebugTitle>
          <Users size={14} />
          Behavior Debug
        </DebugTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </DebugHeader>

      <DebugContent>
        <Section>
          <SectionTitle>
            <Settings size={14} />
            Generator Controls
          </SectionTitle>
          
          <ControlGrid>
            <ControlButton 
              onClick={handleStartGenerator}
              disabled={isGenerating}
              variant="success"
            >
              <Play size={12} />
              Start Generator
            </ControlButton>
            
            <ControlButton 
              onClick={handleStopGenerator}
              disabled={!isGenerating}
              variant="error"
            >
              <Pause size={12} />
              Stop Generator
            </ControlButton>
            
            <ControlButton 
              onClick={handleGenerateBatch}
              variant="warning"
            >
              <Zap size={12} />
              Generate Batch
            </ControlButton>
            
            <ControlButton 
              onClick={handleGenerateJourney}
              variant="info"
            >
              <Target size={12} />
              Journey
            </ControlButton>
          </ControlGrid>
          
          <ControlButton 
            onClick={handleResetData}
            variant="error"
            style={{ width: '100%', marginTop: '8px' }}
          >
            <RefreshCw size={12} />
            Reset All Data
          </ControlButton>
        </Section>

        <Section>
          <SectionTitle>
            <BarChart3 size={14} />
            Behavior Metrics
          </SectionTitle>
          
          <StatsList>
            <StatItem>
              <StatLabel>Generator Status:</StatLabel>
              <StatValue type={isGenerating ? "success" : "error"}>
                {isGenerating ? "Running" : "Stopped"}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Total Behaviors:</StatLabel>
              <StatValue type="info">{metrics.activeBehaviors || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Unique Customers:</StatLabel>
              <StatValue type="success">{metrics.uniqueCustomersCount || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Active Journeys:</StatLabel>
              <StatValue type="warning">{metrics.activeJourneys || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Conversion Rate:</StatLabel>
              <StatValue type="info">{metrics.conversionRate?.toFixed(1) || 0}%</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Avg Session:</StatLabel>
              <StatValue>{Math.round((metrics.avgTimeOnSite || 0) / 60000)}m</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>WebSocket:</StatLabel>
              <StatValue type={isConnected ? "success" : "error"}>
                {isConnected ? "Connected" : "Disconnected"}
              </StatValue>
            </StatItem>
          </StatsList>
        </Section>

        <Section>
          <SectionTitle>
            <TrendingUp size={14} />
            Behavior Types
          </SectionTitle>
          
          <BehaviorTypesList>
            {Object.entries(behaviorTypeStats)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <BehaviorTypeItem key={type}>
                  <TypeName>
                    {getBehaviorIcon(type)}
                    {type.replace('_', ' ').toUpperCase()}
                  </TypeName>
                  <TypeCount>{count}</TypeCount>
                </BehaviorTypeItem>
              ))}
            
            {Object.keys(behaviorTypeStats).length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: '12px' }}>
                No behavior types recorded
              </div>
            )}
          </BehaviorTypesList>
        </Section>

        <Section>
          <SectionTitle>
            <Activity size={14} />
            Recent Behaviors
          </SectionTitle>
          
          <CustomerList>
            {recentBehaviors.map((behavior) => (
              <CustomerItem key={behavior.id}>
                <CustomerName>
                  {behavior.metadata?.customerName || 'Unknown Customer'}
                </CustomerName>
                <CustomerMeta>
                  {behavior.action} • {behavior.type} • {behavior.device}
                  {behavior.value > 0 && ` • $${behavior.value}`}
                </CustomerMeta>
              </CustomerItem>
            ))}
            
            {recentBehaviors.length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: '12px' }}>
                No recent behaviors
              </div>
            )}
          </CustomerList>
        </Section>

        <Section>
          <SectionTitle>
            <AlertTriangle size={14} />
            Event Log
          </SectionTitle>
          
          <EventLog>
            {eventLog.map((entry, index) => (
              <LogEntry key={index} type={entry.type}>
                [{entry.timestamp}] {entry.message}
              </LogEntry>
            ))}
            
            {eventLog.length === 0 && (
              <div style={{ opacity: 0.5 }}>No events logged</div>
            )}
          </EventLog>
        </Section>
      </DebugContent>
    </DebugContainer>
  );
};

export default CustomerBehaviorDebug;