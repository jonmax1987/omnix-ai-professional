/**
 * OMNIX AI - Team Activity Debug
 * Development testing component for real-time team activity indicators
 * MGR-029: Real-time team activity indicators
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
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  MessageCircle,
  Monitor
} from 'lucide-react';
import mockTeamActivityGenerator from '../../services/mockTeamActivityGenerator';
import useTeamActivityStore from '../../store/teamActivityStore';
import useWebSocketStore from '../../store/websocketStore';
import Button from '../atoms/Button';

const DebugContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 450px;
  max-height: 700px;
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
    right: 20px;
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
  max-height: 600px;
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
  color: #4CAF50;
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
      default: return 'white';
    }
  }};
  font-weight: 500;
`;

const TeamMembersList = styled.div`
  display: grid;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const TeamMemberItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px 12px;
  border-left: 3px solid ${({ status }) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'away': return '#FF9800';
      case 'busy': return '#F44336';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
`;

const MemberHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const MemberName = styled.span`
  font-weight: 500;
  font-size: 0.8rem;
`;

const MemberStatus = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActivityLog = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px;
  max-height: 150px;
  overflow-y: auto;
  font-size: 0.7rem;
  line-height: 1.4;
`;

const LogEntry = styled.div`
  color: ${({ type }) => {
    switch (type) {
      case 'activity': return '#4CAF50';
      case 'presence': return '#2196F3';
      case 'system': return '#FF9800';
      default: return 'rgba(255, 255, 255, 0.8)';
    }
  }};
  margin-bottom: 2px;
`;

const TeamActivityDebug = ({ onClose }) => {
  const [generatorStats, setGeneratorStats] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { 
    teamMembers, 
    activities, 
    stats, 
    getOnlineMembers,
    addActivity,
    reset 
  } = useTeamActivityStore();
  
  const { isConnected, sendMessage } = useWebSocketStore();

  // Update generator stats periodically
  useEffect(() => {
    const updateStats = () => {
      const stats = mockTeamActivityGenerator.getStats();
      setGeneratorStats(stats);
      setIsGenerating(stats.isGenerating);
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor team activity store changes
  useEffect(() => {
    const unsubscribe = useTeamActivityStore.subscribe((state) => {
      if (state.activities.length > 0) {
        const latestActivity = state.activities[0];
        addLogEntry(`Activity: ${latestActivity.userName} - ${latestActivity.action}`, 'activity');
      }
    });

    return unsubscribe;
  }, []);

  const addLogEntry = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [...prev.slice(-19), { message, type, timestamp }]);
  };

  const handleStartGenerator = () => {
    mockTeamActivityGenerator.startGenerating(useTeamActivityStore, {
      activityInterval: 2000,  // Generate activity every 2 seconds
      presenceInterval: 10000, // Update presence every 10 seconds
      batchSize: 1
    });
    addLogEntry('Team activity generator started', 'system');
  };

  const handleStopGenerator = () => {
    mockTeamActivityGenerator.stopGenerating();
    addLogEntry('Team activity generator stopped', 'system');
  };

  const handleGenerateBatch = () => {
    mockTeamActivityGenerator.generateActivityBatch(useTeamActivityStore, 5);
    addLogEntry('Generated batch of 5 activities', 'system');
  };

  const handleResetData = () => {
    reset();
    mockTeamActivityGenerator.reset();
    setActivityLog([]);
    addLogEntry('Team activity data reset', 'system');
  };

  const triggerWebSocketEvent = (eventType) => {
    if (isConnected) {
      sendMessage({
        type: eventType,
        data: {
          timestamp: Date.now(),
          source: 'team-activity-debug',
          teamMember: 'debug-user'
        }
      });
      addLogEntry(`WebSocket event: ${eventType}`, 'system');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <UserCheck size={12} />;
      case 'away': return <Clock size={12} />;
      case 'busy': return <UserX size={12} />;
      default: return <Monitor size={12} />;
    }
  };

  const teamMembersArray = Array.from(teamMembers.values());
  const onlineMembers = getOnlineMembers();

  return (
    <DebugContainer
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DebugHeader>
        <DebugTitle>
          <Users size={14} />
          Team Activity Debug
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
              onClick={handleResetData}
              variant="error"
            >
              <RefreshCw size={12} />
              Reset Data
            </ControlButton>
          </ControlGrid>
        </Section>

        <Section>
          <SectionTitle>
            <TrendingUp size={14} />
            Statistics
          </SectionTitle>
          
          <StatsList>
            <StatItem>
              <StatLabel>Generator Status:</StatLabel>
              <StatValue type={isGenerating ? "success" : "error"}>
                {isGenerating ? "Running" : "Stopped"}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Total Activities:</StatLabel>
              <StatValue>{generatorStats.activityCount || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Team Members:</StatLabel>
              <StatValue>{stats.totalMembers || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Online Members:</StatLabel>
              <StatValue type="success">{stats.onlineMembers || 0}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Activities (24h):</StatLabel>
              <StatValue type="warning">{stats.activitiesLast24h || 0}</StatValue>
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
            <Zap size={14} />
            WebSocket Triggers
          </SectionTitle>
          
          <ControlGrid>
            <ControlButton 
              onClick={() => triggerWebSocketEvent('team_activity')}
              disabled={!isConnected}
              variant="success"
            >
              Team Activity
            </ControlButton>
            
            <ControlButton 
              onClick={() => triggerWebSocketEvent('user_presence')}
              disabled={!isConnected}
              variant="success"
            >
              User Presence
            </ControlButton>
            
            <ControlButton 
              onClick={() => triggerWebSocketEvent('collaboration_start')}
              disabled={!isConnected}
              variant="success"
            >
              Collaboration
            </ControlButton>
            
            <ControlButton 
              onClick={() => triggerWebSocketEvent('dashboard_view')}
              disabled={!isConnected}
              variant="success"
            >
              Dashboard View
            </ControlButton>
          </ControlGrid>
        </Section>

        <Section>
          <SectionTitle>
            <Users size={14} />
            Team Members ({teamMembersArray.length})
          </SectionTitle>
          
          <TeamMembersList>
            {teamMembersArray.map(member => (
              <TeamMemberItem key={member.id} status={member.presence?.status}>
                <MemberHeader>
                  <MemberName>{member.name}</MemberName>
                  <MemberStatus>
                    {getStatusIcon(member.presence?.status)}
                    {member.presence?.status || 'offline'}
                  </MemberStatus>
                </MemberHeader>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>
                  {member.title} • {member.department}
                  <br />
                  Activities: {member.totalActivities || 0} • Last 24h: {member.activitiesLast24h || 0}
                </div>
              </TeamMemberItem>
            ))}
            
            {teamMembersArray.length === 0 && (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: '12px' }}>
                No team members initialized
              </div>
            )}
          </TeamMembersList>
        </Section>

        <Section>
          <SectionTitle>
            <Activity size={14} />
            Activity Log
          </SectionTitle>
          
          <ActivityLog>
            {activityLog.map((entry, index) => (
              <LogEntry key={index} type={entry.type}>
                [{entry.timestamp}] {entry.message}
              </LogEntry>
            ))}
            
            {activityLog.length === 0 && (
              <div style={{ opacity: 0.5 }}>No events logged</div>
            )}
          </ActivityLog>
        </Section>
      </DebugContent>
    </DebugContainer>
  );
};

export default TeamActivityDebug;