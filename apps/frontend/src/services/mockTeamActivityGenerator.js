/**
 * OMNIX AI - Mock Team Activity Generator
 * Generates realistic team member activities and presence data for development/testing
 * MGR-029: Real-time team activity indicators
 */

class MockTeamActivityGenerator {
  constructor() {
    this.isGenerating = false;
    this.generateInterval = null;
    this.activityCount = 0;
    
    // Mock team members
    this.teamMembers = [
      {
        id: 'user-001',
        name: 'Sarah Chen',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@omnix.ai',
        avatar: null,
        role: 'manager',
        department: 'Operations',
        title: 'Store Manager',
        timezone: 'America/New_York'
      },
      {
        id: 'user-002',
        name: 'Mike Rodriguez',
        firstName: 'Mike',
        lastName: 'Rodriguez',
        email: 'mike.rodriguez@omnix.ai',
        avatar: null,
        role: 'analyst',
        department: 'Analytics',
        title: 'Data Analyst',
        timezone: 'America/Los_Angeles'
      },
      {
        id: 'user-003',
        name: 'Emily Johnson',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@omnix.ai',
        avatar: null,
        role: 'inventory_manager',
        department: 'Inventory',
        title: 'Inventory Manager',
        timezone: 'America/Chicago'
      },
      {
        id: 'user-004',
        name: 'Alex Kim',
        firstName: 'Alex',
        lastName: 'Kim',
        email: 'alex.kim@omnix.ai',
        avatar: null,
        role: 'coordinator',
        department: 'Coordination',
        title: 'Store Coordinator',
        timezone: 'America/Denver'
      },
      {
        id: 'user-005',
        name: 'Lisa Thompson',
        firstName: 'Lisa',
        lastName: 'Thompson',
        email: 'lisa.thompson@omnix.ai',
        avatar: null,
        role: 'admin',
        department: 'Administration',
        title: 'System Administrator',
        timezone: 'UTC'
      }
    ];
    
    // Activity templates with weights for realistic distribution
    this.activityTemplates = [
      // Dashboard activities (30% of activities)
      {
        type: 'dashboard_view',
        category: 'dashboard',
        weight: 30,
        actions: [
          'Opened main dashboard',
          'Viewed revenue overview',
          'Checked daily metrics',
          'Reviewed performance indicators',
          'Examined widget data',
          'Accessed dashboard controls'
        ],
        details: [
          'Revenue widget updated',
          'Inventory levels checked',
          'Customer metrics reviewed',
          'Alert notifications viewed',
          'Real-time data refreshed'
        ]
      },
      
      // Inventory activities (25% of activities)
      {
        type: 'inventory_update',
        category: 'inventory',
        weight: 25,
        actions: [
          'Updated stock levels',
          'Adjusted inventory counts',
          'Processed stock transfer',
          'Created reorder alert',
          'Updated product information',
          'Reviewed supplier data'
        ],
        details: [
          'Milk products restocked',
          'Low stock alert resolved',
          'Supplier delivery confirmed',
          'Emergency reorder placed',
          'Waste reduction implemented',
          'Seasonal items prepared'
        ]
      },
      
      // Analytics activities (20% of activities)
      {
        type: 'analytics_view',
        category: 'analytics',
        weight: 20,
        actions: [
          'Generated analytics report',
          'Exported customer data',
          'Analyzed sales trends',
          'Reviewed A/B test results',
          'Created performance summary',
          'Updated forecast models'
        ],
        details: [
          'Weekly revenue report generated',
          'Customer segmentation updated',
          'Sales performance analyzed',
          'Predictive models refined',
          'ROI calculations completed',
          'Market trends identified'
        ]
      },
      
      // Collaboration activities (15% of activities)
      {
        type: 'collaboration',
        category: 'teamwork',
        weight: 15,
        actions: [
          'Started collaboration session',
          'Shared dashboard insights',
          'Joined team discussion',
          'Provided feedback on reports',
          'Coordinated with team member',
          'Reviewed shared analysis'
        ],
        details: [
          'Cross-department meeting initiated',
          'Knowledge sharing session',
          'Problem-solving collaboration',
          'Strategy planning discussion',
          'Best practices exchange',
          'Process improvement workshop'
        ]
      },
      
      // System activities (10% of activities)
      {
        type: 'settings_change',
        category: 'system',
        weight: 10,
        actions: [
          'Updated user preferences',
          'Modified dashboard layout',
          'Changed notification settings',
          'Updated profile information',
          'Adjusted system configuration',
          'Modified access permissions'
        ],
        details: [
          'Theme preferences updated',
          'Alert thresholds adjusted',
          'Widget layout customized',
          'Language settings changed',
          'Security settings updated',
          'Integration configured'
        ]
      }
    ];
    
    // Presence status transitions with realistic probabilities
    this.presenceStates = {
      online: { 
        transitions: { away: 0.15, busy: 0.10, offline: 0.05 },
        statusMessages: [
          '', 'Working on reports', 'Available for questions', 'Monitoring inventory'
        ]
      },
      away: { 
        transitions: { online: 0.40, busy: 0.15, offline: 0.10 },
        statusMessages: [
          'In a meeting', 'On break', 'Away from desk', 'Lunch break'
        ]
      },
      busy: { 
        transitions: { online: 0.30, away: 0.20, offline: 0.05 },
        statusMessages: [
          'In important meeting', 'Focus time', 'Do not disturb', 'Deep work session'
        ]
      },
      offline: { 
        transitions: { online: 0.20, away: 0.05, busy: 0.02 },
        statusMessages: ['']
      }
    };
    
    // Current presence state for each team member
    this.currentPresence = new Map();
    
    // Initialize team members with random presence
    this.teamMembers.forEach(member => {
      const statuses = ['online', 'online', 'online', 'away', 'busy']; // Bias toward online
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      this.currentPresence.set(member.id, {
        status: randomStatus,
        statusMessage: this.getRandomStatusMessage(randomStatus),
        lastActivity: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
        currentPage: '/',
        idleTime: Math.floor(Math.random() * 15 * 60) // 0-15 minutes idle
      });
    });
  }
  
  /**
   * Initialize team members in the store
   */
  initializeTeamMembers(teamActivityStore) {
    this.teamMembers.forEach(member => {
      const presence = this.currentPresence.get(member.id);
      teamActivityStore.getState().initializeTeamMember({
        ...member,
        presence
      });
    });
    
    console.log('👥 Team Activity Generator: Initialized team members', this.teamMembers.length);
  }
  
  /**
   * Start generating mock team activities
   */
  startGenerating(teamActivityStore, options = {}) {
    if (this.isGenerating) {
      console.warn('Team activity generation already running');
      return;
    }
    
    const {
      activityInterval = 3000,  // Generate activity every 3 seconds
      presenceInterval = 15000, // Update presence every 15 seconds
      batchSize = 1,
      enablePresenceUpdates = true
    } = options;
    
    this.isGenerating = true;
    this.activityCount = 0;
    
    // Initialize team members
    this.initializeTeamMembers(teamActivityStore);
    
    // Generate activities
    this.generateInterval = setInterval(() => {
      for (let i = 0; i < batchSize; i++) {
        this.generateRandomActivity(teamActivityStore);
      }
    }, activityInterval);
    
    // Update presence states
    if (enablePresenceUpdates) {
      this.presenceInterval = setInterval(() => {
        this.updateRandomPresence(teamActivityStore);
      }, presenceInterval);
    }
    
    console.log('🔄 Team Activity Generator: Started generating activities');
  }
  
  /**
   * Stop generating mock activities
   */
  stopGenerating() {
    if (!this.isGenerating) return;
    
    this.isGenerating = false;
    
    if (this.generateInterval) {
      clearInterval(this.generateInterval);
      this.generateInterval = null;
    }
    
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
    
    console.log('⏹️ Team Activity Generator: Stopped generating activities');
  }
  
  /**
   * Generate a random team activity
   */
  generateRandomActivity(teamActivityStore) {
    const member = this.getRandomTeamMember();
    const template = this.getWeightedActivityTemplate();
    const action = this.getRandomArrayItem(template.actions);
    const details = this.getRandomArrayItem(template.details);
    
    // Determine priority based on activity type and randomness
    let priority = 'normal';
    if (template.type === 'inventory_update' && Math.random() < 0.3) {
      priority = 'high';
    } else if (template.type === 'settings_change' && Math.random() < 0.1) {
      priority = 'critical';
    } else if (Math.random() < 0.15) {
      priority = 'high';
    }
    
    const activity = {
      id: `activity-${Date.now()}-${this.activityCount++}`,
      userId: member.id,
      userName: member.name,
      userAvatar: member.avatar,
      type: template.type,
      category: template.category,
      action,
      details,
      priority,
      timestamp: new Date().toISOString(),
      location: this.getRandomLocation(),
      isCollaborative: template.type === 'collaboration' || Math.random() < 0.2,
      metadata: {
        department: member.department,
        role: member.role,
        generatedBy: 'mockTeamActivityGenerator'
      }
    };
    
    teamActivityStore.getState().addActivity(activity);
    
    // Update member's current page occasionally
    if (Math.random() < 0.3) {
      this.updateMemberPresence(teamActivityStore, member.id, {
        currentPage: activity.location,
        lastActivity: activity.timestamp,
        idleTime: 0
      });
    }
    
    return activity;
  }
  
  /**
   * Update random team member presence
   */
  updateRandomPresence(teamActivityStore) {
    const member = this.getRandomTeamMember();
    const currentPresence = this.currentPresence.get(member.id);
    const currentStatus = currentPresence.status;
    
    // Determine if status should change
    const transitions = this.presenceStates[currentStatus].transitions;
    const random = Math.random();
    let cumulativeProbability = 0;
    let newStatus = currentStatus;
    
    for (const [status, probability] of Object.entries(transitions)) {
      cumulativeProbability += probability;
      if (random < cumulativeProbability) {
        newStatus = status;
        break;
      }
    }
    
    // Update presence if status changed
    if (newStatus !== currentStatus) {
      const newPresence = {
        status: newStatus,
        statusMessage: this.getRandomStatusMessage(newStatus),
        lastActivity: new Date().toISOString(),
        currentPage: this.getRandomLocation(),
        idleTime: newStatus === 'online' ? 0 : Math.floor(Math.random() * 30 * 60)
      };
      
      this.currentPresence.set(member.id, newPresence);
      this.updateMemberPresence(teamActivityStore, member.id, newPresence);
      
      console.log(`👤 ${member.name} presence: ${currentStatus} → ${newStatus}`);
    }
  }
  
  /**
   * Update specific member presence
   */
  updateMemberPresence(teamActivityStore, memberId, presenceData) {
    teamActivityStore.getState().updatePresence(memberId, presenceData);
  }
  
  /**
   * Get random team member
   */
  getRandomTeamMember() {
    return this.teamMembers[Math.floor(Math.random() * this.teamMembers.length)];
  }
  
  /**
   * Get weighted activity template
   */
  getWeightedActivityTemplate() {
    const totalWeight = this.activityTemplates.reduce((sum, template) => sum + template.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const template of this.activityTemplates) {
      if (random < template.weight) {
        return template;
      }
      random -= template.weight;
    }
    
    return this.activityTemplates[0];
  }
  
  /**
   * Get random array item
   */
  getRandomArrayItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Get random status message for presence state
   */
  getRandomStatusMessage(status) {
    const messages = this.presenceStates[status]?.statusMessages || [''];
    return this.getRandomArrayItem(messages);
  }
  
  /**
   * Get random dashboard location
   */
  getRandomLocation() {
    const locations = [
      '/dashboard',
      '/inventory',
      '/analytics',
      '/reports',
      '/settings',
      '/products',
      '/orders',
      '/customers',
      '/alerts'
    ];
    return this.getRandomArrayItem(locations);
  }
  
  /**
   * Generate batch of activities at once
   */
  generateActivityBatch(teamActivityStore, count = 10) {
    const activities = [];
    for (let i = 0; i < count; i++) {
      const activity = this.generateRandomActivity(teamActivityStore);
      activities.push(activity);
      // Space out timestamps slightly
      if (i < count - 1) {
        const delay = Math.random() * 2000; // 0-2 seconds
        activity.timestamp = new Date(Date.now() - delay).toISOString();
      }
    }
    
    console.log(`📊 Generated batch of ${count} team activities`);
    return activities;
  }
  
  /**
   * Get current generator statistics
   */
  getStats() {
    return {
      isGenerating: this.isGenerating,
      activityCount: this.activityCount,
      teamMemberCount: this.teamMembers.length,
      onlineMembers: Array.from(this.currentPresence.values()).filter(p => p.status === 'online').length,
      totalActivityTypes: this.activityTemplates.length
    };
  }
  
  /**
   * Reset generator state
   */
  reset() {
    this.stopGenerating();
    this.activityCount = 0;
    
    // Reset presence states to random online/away
    this.teamMembers.forEach(member => {
      const statuses = ['online', 'online', 'away', 'busy'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      this.currentPresence.set(member.id, {
        status: randomStatus,
        statusMessage: this.getRandomStatusMessage(randomStatus),
        lastActivity: new Date().toISOString(),
        currentPage: '/',
        idleTime: 0
      });
    });
    
    console.log('🔄 Team Activity Generator: Reset state');
  }
}

// Export singleton instance
const mockTeamActivityGenerator = new MockTeamActivityGenerator();

export default mockTeamActivityGenerator;