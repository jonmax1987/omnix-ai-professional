/**
 * OMNIX AI - Team Activity Hook
 * React hook for team activity tracking and presence management
 * MGR-029: Real-time team activity indicators
 */

import { useEffect, useCallback, useRef } from 'react';
import useTeamActivityStore from '../store/teamActivityStore';
import useUserStore from '../store/userStore';
import useWebSocketStore from '../store/websocketStore';

export const useTeamActivity = () => {
  const activityTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const currentPageRef = useRef(window.location.pathname);
  
  const { 
    initializeTeamMember,
    updatePresence,
    addActivity,
    startCollaboration,
    endCollaboration
  } = useTeamActivityStore();
  
  const { user, isAuthenticated } = useUserStore();
  const { isConnected, sendMessage } = useWebSocketStore();

  // Track user activity and update presence
  const trackActivity = useCallback((activityType, activityData) => {
    if (!isAuthenticated || !user) return;

    const activity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: user.name || `${user.firstName} ${user.lastName}`.trim(),
      userAvatar: user.avatar,
      type: activityType,
      action: activityData.action,
      details: activityData.details,
      category: activityData.category || 'dashboard',
      priority: activityData.priority || 'normal',
      timestamp: new Date().toISOString(),
      location: window.location.pathname,
      isCollaborative: activityData.isCollaborative || false,
      metadata: {
        department: user.department || 'Unknown',
        role: user.role || 'user',
        sessionId: activityData.sessionId,
        ...activityData.metadata
      }
    };

    // Add to local store
    addActivity(activity);

    // Send to WebSocket if connected
    if (isConnected) {
      sendMessage({
        type: 'team_activity',
        data: activity
      });
    }

    // Update last activity timestamp
    lastActivityRef.current = Date.now();
    
    // Update presence if user was away/idle
    updateUserPresence('online');
  }, [isAuthenticated, user, isConnected, sendMessage, addActivity]);

  // Update user presence
  const updateUserPresence = useCallback((status, statusMessage = '') => {
    if (!isAuthenticated || !user) return;

    const presence = {
      status,
      statusMessage,
      lastActivity: new Date().toISOString(),
      currentPage: window.location.pathname,
      idleTime: Math.floor((Date.now() - lastActivityRef.current) / 1000)
    };

    // Update local store
    updatePresence(user.id, presence);

    // Send to WebSocket if connected
    if (isConnected) {
      sendMessage({
        type: 'user_presence',
        data: {
          userId: user.id,
          presence
        }
      });
    }
  }, [isAuthenticated, user, isConnected, sendMessage, updatePresence]);

  // Initialize team member on login
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeTeamMember({
        id: user.id,
        name: user.name || `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        title: user.title,
        timezone: user.timezone
      });

      // Set initial presence as online
      updateUserPresence('online', 'Just logged in');
    }
  }, [isAuthenticated, user, initializeTeamMember, updateUserPresence]);

  // Track page navigation
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== currentPageRef.current) {
      currentPageRef.current = currentPath;
      
      trackActivity('dashboard_view', {
        action: 'Navigated to page',
        details: `Opened ${currentPath}`,
        category: 'navigation'
      });
    }
  }, [window.location.pathname, trackActivity]);

  // Track user activity (mouse, keyboard)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Only update if it's been more than 30 seconds since last activity
      if (timeSinceLastActivity > 30000) {
        updateUserPresence('online');
        lastActivityRef.current = now;
      }
    };

    const handleBeforeUnload = () => {
      updateUserPresence('offline');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateUserPresence('online');
      } else {
        updateUserPresence('away', 'Tab not active');
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set up idle timer
    const idleTimer = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceLastActivity > 5 * 60 * 1000) { // 5 minutes idle
        updateUserPresence('away', 'Idle');
      } else if (timeSinceLastActivity > 15 * 60 * 1000) { // 15 minutes idle
        updateUserPresence('away', 'Extended idle');
      }
    }, 60000); // Check every minute

    return () => {
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(idleTimer);
    };
  }, [isAuthenticated, updateUserPresence]);

  // Collaboration helpers
  const startTeamCollaboration = useCallback((collaborationData) => {
    if (!isAuthenticated || !user) return null;

    const collaboration = {
      id: `collab-${Date.now()}-${user.id}`,
      type: collaborationData.type,
      title: collaborationData.title,
      description: collaborationData.description,
      initiator: user.id,
      participants: [user.id, ...(collaborationData.participants || [])],
      metadata: collaborationData.metadata
    };

    startCollaboration(collaboration);

    // Send to WebSocket
    if (isConnected) {
      sendMessage({
        type: 'collaboration_start',
        data: collaboration
      });
    }

    // Track activity
    trackActivity('collaboration', {
      action: 'Started collaboration',
      details: collaboration.title,
      category: 'teamwork',
      isCollaborative: true,
      metadata: { collaborationId: collaboration.id }
    });

    return collaboration.id;
  }, [isAuthenticated, user, isConnected, sendMessage, startCollaboration, trackActivity]);

  const endTeamCollaboration = useCallback((collaborationId, summary = '') => {
    if (!isAuthenticated || !user) return;

    const endData = {
      summary,
      endedBy: user.id
    };

    endCollaboration(collaborationId, endData);

    // Send to WebSocket
    if (isConnected) {
      sendMessage({
        type: 'collaboration_end',
        data: {
          collaborationId,
          ...endData
        }
      });
    }

    // Track activity
    trackActivity('collaboration', {
      action: 'Ended collaboration',
      details: summary || 'Collaboration session completed',
      category: 'teamwork',
      isCollaborative: true,
      metadata: { collaborationId }
    });
  }, [isAuthenticated, user, isConnected, sendMessage, endCollaboration, trackActivity]);

  return {
    // Activity tracking
    trackActivity,
    
    // Presence management
    updateUserPresence,
    
    // Collaboration helpers
    startTeamCollaboration,
    endTeamCollaboration
  };
};

export default useTeamActivity;