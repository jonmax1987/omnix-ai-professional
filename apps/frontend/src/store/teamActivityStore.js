/**
 * OMNIX AI - Team Activity Store
 * Real-time team member activity and presence tracking
 * MGR-029: Real-time team activity indicators
 */

import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useTeamActivityStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Team members data
        teamMembers: new Map(),
        
        // Activity feed
        activities: [],
        maxActivities: 100,
        
        // Presence tracking
        presenceMap: new Map(),
        
        // Team collaboration data
        activeCollaborations: new Map(),
        sharedSessions: new Map(),
        
        // Activity statistics
        stats: {
          totalMembers: 0,
          onlineMembers: 0,
          activeMembers: 0,
          totalActivities: 0,
          activitiesLast24h: 0,
          mostActiveUser: null,
          activityTrends: []
        },
        
        // Loading and error states
        loading: false,
        error: null,
        lastUpdate: null,

        // Actions
        
        /**
         * Initialize team member
         */
        initializeTeamMember: (memberData) =>
          set((state) => {
            const member = {
              id: memberData.id,
              name: memberData.name || `${memberData.firstName} ${memberData.lastName}`.trim(),
              email: memberData.email,
              avatar: memberData.avatar,
              role: memberData.role,
              department: memberData.department,
              title: memberData.title,
              timezone: memberData.timezone || 'UTC',
              
              // Activity tracking
              lastSeen: new Date().toISOString(),
              isOnline: true,
              currentActivity: null,
              totalActivities: 0,
              activitiesLast24h: 0,
              
              // Presence data
              presence: {
                status: 'online', // online, away, busy, offline
                statusMessage: '',
                lastActivity: new Date().toISOString(),
                currentPage: window.location.pathname,
                idleTime: 0
              },
              
              // Collaboration data
              activeCollaborations: [],
              sharedDashboards: [],
              recentActions: []
            };
            
            state.teamMembers.set(memberData.id, member);
            state.presenceMap.set(memberData.id, member.presence);
            get().updateStats();
          }),

        /**
         * Update team member presence
         */
        updatePresence: (memberId, presenceData) =>
          set((state) => {
            const member = state.teamMembers.get(memberId);
            if (member) {
              member.presence = { ...member.presence, ...presenceData };
              member.lastSeen = new Date().toISOString();
              member.isOnline = presenceData.status !== 'offline';
              
              state.presenceMap.set(memberId, member.presence);
            }
            get().updateStats();
          }),

        /**
         * Add team activity
         */
        addActivity: (activity) =>
          set((state) => {
            const newActivity = {
              id: activity.id || `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              userId: activity.userId,
              userName: activity.userName,
              userAvatar: activity.userAvatar,
              type: activity.type,
              action: activity.action,
              details: activity.details,
              metadata: activity.metadata || {},
              timestamp: activity.timestamp || new Date().toISOString(),
              location: activity.location || window.location.pathname,
              
              // Activity categorization
              category: activity.category || 'general', // dashboard, inventory, analytics, etc.
              priority: activity.priority || 'normal', // low, normal, high, critical
              isCollaborative: activity.isCollaborative || false
            };

            // Add to activities array (keep newest first)
            state.activities.unshift(newActivity);
            
            // Limit activities array size
            if (state.activities.length > state.maxActivities) {
              state.activities = state.activities.slice(0, state.maxActivities);
            }

            // Update member activity count
            const member = state.teamMembers.get(activity.userId);
            if (member) {
              member.totalActivities += 1;
              member.currentActivity = newActivity;
              member.recentActions.unshift(newActivity);
              
              // Keep only last 10 recent actions per member
              if (member.recentActions.length > 10) {
                member.recentActions = member.recentActions.slice(0, 10);
              }
              
              // Count activities in last 24 hours
              const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
              member.activitiesLast24h = member.recentActions.filter(
                action => new Date(action.timestamp) > twentyFourHoursAgo
              ).length;
            }
            
            get().updateStats();
          }),

        /**
         * Start collaboration session
         */
        startCollaboration: (sessionData) =>
          set((state) => {
            const collaboration = {
              id: sessionData.id || `collab-${Date.now()}`,
              type: sessionData.type, // dashboard_view, report_editing, data_analysis
              title: sessionData.title,
              description: sessionData.description,
              initiator: sessionData.initiator,
              participants: sessionData.participants || [],
              startTime: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
              status: 'active',
              metadata: sessionData.metadata || {}
            };

            state.activeCollaborations.set(collaboration.id, collaboration);
            
            // Update participants
            collaboration.participants.forEach(userId => {
              const member = state.teamMembers.get(userId);
              if (member) {
                member.activeCollaborations.push(collaboration.id);
              }
            });
          }),

        /**
         * End collaboration session
         */
        endCollaboration: (collaborationId, endData = {}) =>
          set((state) => {
            const collaboration = state.activeCollaborations.get(collaborationId);
            if (collaboration) {
              collaboration.status = 'completed';
              collaboration.endTime = new Date().toISOString();
              collaboration.duration = new Date() - new Date(collaboration.startTime);
              collaboration.summary = endData.summary || '';
              
              // Remove from participants' active collaborations
              collaboration.participants.forEach(userId => {
                const member = state.teamMembers.get(userId);
                if (member) {
                  member.activeCollaborations = member.activeCollaborations.filter(
                    id => id !== collaborationId
                  );
                }
              });
              
              // Move to shared sessions for history
              state.sharedSessions.set(collaborationId, collaboration);
              state.activeCollaborations.delete(collaborationId);
            }
          }),

        /**
         * Update activity statistics
         */
        updateStats: () =>
          set((state) => {
            const members = Array.from(state.teamMembers.values());
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            // Calculate basic stats
            state.stats.totalMembers = members.length;
            state.stats.onlineMembers = members.filter(m => m.isOnline).length;
            state.stats.activeMembers = members.filter(m => 
              m.presence.status === 'online' && 
              new Date(m.lastSeen) > new Date(Date.now() - 15 * 60 * 1000) // Active in last 15 min
            ).length;
            
            state.stats.totalActivities = state.activities.length;
            state.stats.activitiesLast24h = state.activities.filter(
              activity => new Date(activity.timestamp) > twentyFourHoursAgo
            ).length;
            
            // Find most active user
            const mostActive = members.reduce((prev, current) => 
              (prev.activitiesLast24h > current.activitiesLast24h) ? prev : current
            , members[0]);
            state.stats.mostActiveUser = mostActive || null;
            
            // Calculate activity trends (last 24 hours, hourly buckets)
            const trends = [];
            for (let i = 23; i >= 0; i--) {
              const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
              const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
              
              const activitiesInHour = state.activities.filter(activity => {
                const activityTime = new Date(activity.timestamp);
                return activityTime >= hourStart && activityTime < hourEnd;
              }).length;
              
              trends.push({
                hour: hourStart.toISOString(),
                count: activitiesInHour,
                members: new Set(state.activities.filter(activity => {
                  const activityTime = new Date(activity.timestamp);
                  return activityTime >= hourStart && activityTime < hourEnd;
                }).map(a => a.userId)).size
              });
            }
            state.stats.activityTrends = trends;
            
            state.lastUpdate = new Date().toISOString();
          }),

        /**
         * Get team member by ID
         */
        getTeamMember: (memberId) => {
          return get().teamMembers.get(memberId) || null;
        },

        /**
         * Get online team members
         */
        getOnlineMembers: () => {
          return Array.from(get().teamMembers.values()).filter(member => member.isOnline);
        },

        /**
         * Get recent activities by type
         */
        getRecentActivities: (type = null, limit = 20) => {
          const activities = get().activities;
          if (type) {
            return activities.filter(activity => activity.type === type).slice(0, limit);
          }
          return activities.slice(0, limit);
        },

        /**
         * Get activities by user
         */
        getActivitiesByUser: (userId, limit = 10) => {
          return get().activities
            .filter(activity => activity.userId === userId)
            .slice(0, limit);
        },

        /**
         * Clear old activities (older than specified days)
         */
        clearOldActivities: (days = 7) =>
          set((state) => {
            const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            state.activities = state.activities.filter(
              activity => new Date(activity.timestamp) > cutoffDate
            );
            get().updateStats();
          }),

        /**
         * Reset team activity store
         */
        reset: () =>
          set((state) => {
            state.teamMembers.clear();
            state.activities = [];
            state.presenceMap.clear();
            state.activeCollaborations.clear();
            state.sharedSessions.clear();
            state.stats = {
              totalMembers: 0,
              onlineMembers: 0,
              activeMembers: 0,
              totalActivities: 0,
              activitiesLast24h: 0,
              mostActiveUser: null,
              activityTrends: []
            };
            state.loading = false;
            state.error = null;
            state.lastUpdate = null;
          }),

        /**
         * Set loading state
         */
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
          }),

        /**
         * Set error state
         */
        setError: (error) =>
          set((state) => {
            state.error = error;
            state.loading = false;
          })
      })),
      {
        name: 'omnix-team-activity-store'
      }
    ),
    {
      name: 'TeamActivityStore'
    }
  )
);

export default useTeamActivityStore;