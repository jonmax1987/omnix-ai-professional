import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import authService from '../services/authService';

const useUserStore = create()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // User authentication state
          isAuthenticated: false,
          user: null,
          token: null,
          refreshToken: null,
          tokenExpiry: null,
          
          // User profile data
          profile: {
            id: null,
            email: '',
            firstName: '',
            lastName: '',
            avatar: null,
            phone: '',
            company: '',
            role: '',
            department: '',
            title: '',
            timezone: 'UTC',
            language: 'en',
            dateJoined: null,
            lastLogin: null,
            isEmailVerified: false,
            isPhoneVerified: false
          },
          
          // User preferences
          preferences: {
            theme: 'light', // light, dark, auto
            language: 'en',
            timezone: 'UTC',
            currency: 'USD',
            dateFormat: 'MM/dd/yyyy',
            timeFormat: '12h',
            numberFormat: 'US',
            defaultView: 'dashboard',
            sidebarCollapsed: false,
            
            // Notification preferences
            notifications: {
              email: true,
              push: true,
              sms: false,
              desktop: true,
              sound: true,
              
              // Notification types
              alerts: {
                critical: true,
                warning: true,
                info: false
              },
              inventory: {
                lowStock: true,
                outOfStock: true,
                reorderPoint: true
              },
              orders: {
                newOrder: true,
                orderUpdates: false,
                orderCancellation: true
              },
              system: {
                maintenance: true,
                updates: false,
                backups: false
              }
            },
            
            // Dashboard preferences
            dashboard: {
              autoRefresh: true,
              refreshInterval: 30000,
              defaultTimeRange: '7d',
              compactView: false,
              showRecentActivity: true,
              widgetLayout: 'default'
            },
            
            // Table preferences
            tables: {
              itemsPerPage: 25,
              showDensity: 'comfortable', // comfortable, compact, spacious
              defaultSort: 'updatedAt',
              defaultSortOrder: 'desc'
            }
          },
          
          // User permissions and roles
          permissions: {
            products: {
              view: false,
              create: false,
              edit: false,
              delete: false,
              export: false
            },
            inventory: {
              view: false,
              adjust: false,
              transfer: false,
              audit: false
            },
            orders: {
              view: false,
              create: false,
              edit: false,
              cancel: false,
              fulfill: false
            },
            analytics: {
              view: false,
              export: false,
              advanced: false
            },
            alerts: {
              view: false,
              acknowledge: false,
              resolve: false,
              manage: false
            },
            settings: {
              view: false,
              edit: false,
              admin: false
            },
            users: {
              view: false,
              create: false,
              edit: false,
              delete: false
            }
          },
          
          // Session management
          session: {
            startTime: null,
            lastActivity: null,
            sessionTimeout: 3600000, // 1 hour in ms
            warningTime: 300000, // 5 minutes before timeout
            isSessionWarningShown: false
          },
          
          // Security settings
          security: {
            twoFactorEnabled: false,
            lastPasswordChange: null,
            passwordExpiryDays: 90,
            sessionHistory: [],
            trustedDevices: [],
            loginAttempts: 0,
            lockedUntil: null
          },
          
          // Loading states
          loading: {
            auth: true, // Start with loading = true to prevent immediate redirects
            profile: false,
            preferences: false,
            permissions: false
          },
          
          // Error handling
          errors: {
            auth: null,
            profile: null,
            preferences: null,
            permissions: null
          },
          
          // Actions
          
          // Authentication actions
          login: async (credentials) => {
            set((state) => {
              state.loading.auth = true;
              state.errors.auth = null;
            });
            
            try {
              const result = await authService.login(credentials);
              
              if (result.success && result.data) {
                const { user, accessToken, refreshToken, expiresAt } = result.data;
                
                // Set permissions based on user role
                const permissions = {
                  products: { view: true, create: true, edit: true, delete: user.role === 'admin', export: true },
                  inventory: { view: true, adjust: true, transfer: true, audit: user.role === 'admin' },
                  orders: { view: true, create: true, edit: true, cancel: true, fulfill: true },
                  analytics: { view: true, export: true, advanced: user.role === 'admin' },
                  alerts: { view: true, acknowledge: true, resolve: true, manage: user.role === 'admin' },
                  settings: { view: true, edit: true, admin: user.role === 'admin' },
                  users: { 
                    view: user.role === 'admin', 
                    create: user.role === 'admin', 
                    edit: user.role === 'admin', 
                    delete: user.role === 'admin' 
                  }
                };

                set((state) => {
                  state.isAuthenticated = true;
                  state.token = accessToken;
                  state.refreshToken = refreshToken;
                  state.tokenExpiry = expiresAt;
                  state.user = user;
                  state.permissions = permissions;
                  
                  state.profile = {
                    ...state.profile,
                    id: user.id,
                    email: user.email,
                    firstName: user.name?.split(' ')[0] || '',
                    lastName: user.name?.split(' ').slice(1).join(' ') || '',
                    role: user.role,
                    lastLogin: new Date().toISOString()
                  };
                  
                  state.session.startTime = Date.now();
                  state.session.lastActivity = Date.now();
                  
                  state.loading.auth = false;
                });
                
                return { success: true };
              }
              
              throw new Error('Login failed: Invalid response');
            } catch (error) {
              set((state) => {
                state.errors.auth = error.message || 'Login failed';
                state.loading.auth = false;
              });
              return { success: false, error: error.message };
            }
          },
          
          logout: async () => {
            const { refreshToken } = get();
            
            try {
              await authService.logout(refreshToken);
            } catch (error) {
              console.warn('Logout API call failed:', error.message);
            }
            
            set((state) => {
              state.isAuthenticated = false;
              state.user = null;
              state.token = null;
              state.refreshToken = null;
              state.tokenExpiry = null;
              state.session.startTime = null;
              state.session.lastActivity = null;
              state.session.isSessionWarningShown = false;
            });
          },
            
          refreshSession: async () => {
            const { refreshToken, tokenExpiry } = get();
            
            if (!refreshToken) {
              return false;
            }
            
            if (tokenExpiry && Date.now() >= tokenExpiry) {
              return false;
            }
            
            try {
              const result = await authService.refreshToken(refreshToken);
              
              if (result.success && result.data) {
                const { accessToken, refreshToken: newRefreshToken, expiresAt } = result.data;
                
                set((state) => {
                  state.token = accessToken;
                  state.refreshToken = newRefreshToken;
                  state.tokenExpiry = expiresAt;
                  state.session.lastActivity = Date.now();
                });
                
                return true;
              }
              
              throw new Error('Token refresh failed');
            } catch (error) {
              console.error('Session refresh failed:', error.message);
              return false;
            }
          },
          
          // Initialize authentication state
          initializeAuth: () => {
            const state = get();
            
            // Check if we have a valid session
            if (state.token && state.refreshToken && state.tokenExpiry && Date.now() < state.tokenExpiry) {
              set((draft) => {
                draft.isAuthenticated = true;
                draft.loading.auth = false;
              });
            } else {
              set((draft) => {
                draft.isAuthenticated = false;
                draft.loading.auth = false;
              });
            }
          },
          
          // Profile management
          updateProfile: async (updates) => {
            set((state) => {
              state.loading.profile = true;
              state.errors.profile = null;
            });
            
            try {
              const result = await authService.updateUserProfile(updates);
              
              if (result.success) {
                set((state) => {
                  state.profile = { ...state.profile, ...updates };
                  if (state.user) {
                    // Update name field for consistency
                    if (updates.firstName || updates.lastName) {
                      state.user.name = `${updates.firstName || state.profile.firstName} ${updates.lastName || state.profile.lastName}`.trim();
                    }
                    state.user = { ...state.user, ...updates };
                  }
                  state.loading.profile = false;
                });
                
                return { success: true };
              } else {
                throw new Error('Profile update failed');
              }
            } catch (error) {
              set((state) => {
                state.errors.profile = error.message || 'Profile update failed';
                state.loading.profile = false;
              });
              throw error;
            }
          },
          
          uploadAvatar: async (file) => {
            set((state) => {
              state.loading.profile = true;
              state.errors.profile = null;
            });
            
            try {
              // Simulate file upload - replace with actual upload logic
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              const avatarUrl = URL.createObjectURL(file); // Mock avatar URL
              
              set((state) => {
                state.profile.avatar = avatarUrl;
                if (state.user) {
                  state.user.avatar = avatarUrl;
                }
                state.loading.profile = false;
              });
              
              return { success: true, url: avatarUrl };
            } catch (error) {
              set((state) => {
                state.errors.profile = error.message || 'Avatar upload failed';
                state.loading.profile = false;
              });
              return { success: false, error: error.message };
            }
          },
          
          // Preferences management
          updatePreferences: async (section, updates) => {
            set((state) => {
              state.loading.preferences = true;
              state.errors.preferences = null;
            });
            
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 500));
              
              set((state) => {
                if (section) {
                  state.preferences[section] = { ...state.preferences[section], ...updates };
                } else {
                  state.preferences = { ...state.preferences, ...updates };
                }
                state.loading.preferences = false;
              });
              
              return { success: true };
            } catch (error) {
              set((state) => {
                state.errors.preferences = error.message || 'Preferences update failed';
                state.loading.preferences = false;
              });
              return { success: false, error: error.message };
            }
          },
          
          setTheme: (theme) =>
            set((state) => {
              state.preferences.theme = theme;
            }),
            
          setLanguage: (language) =>
            set((state) => {
              state.preferences.language = language;
              state.profile.language = language;
            }),
            
          setSidebarCollapsed: (collapsed) =>
            set((state) => {
              state.preferences.sidebarCollapsed = collapsed;
            }),
            
          // Session management
          updateLastActivity: () =>
            set((state) => {
              state.session.lastActivity = Date.now();
              state.session.isSessionWarningShown = false;
            }),
            
          showSessionWarning: () =>
            set((state) => {
              state.session.isSessionWarningShown = true;
            }),
            
          extendSession: async () => {
            const success = await get().refreshSession();
            if (success) {
              set((state) => {
                state.session.isSessionWarningShown = false;
              });
            }
            return success;
          },
          
          // Security management
          changePassword: async (currentPassword, newPassword) => {
            set((state) => {
              state.loading.auth = true;
              state.errors.auth = null;
            });
            
            try {
              const result = await authService.changePassword({
                currentPassword,
                newPassword
              });
              
              if (result.success) {
                set((state) => {
                  state.security.lastPasswordChange = new Date().toISOString();
                  state.security.loginAttempts = 0;
                  state.loading.auth = false;
                });
                
                return { success: true, message: result.message };
              }
              
              throw new Error('Password change failed');
            } catch (error) {
              set((state) => {
                state.errors.auth = error.message || 'Password change failed';
                state.loading.auth = false;
              });
              return { success: false, error: error.message };
            }
          },

          updatePassword: async (currentPassword, newPassword) => {
            // Delegate to changePassword for consistency
            return get().changePassword(currentPassword, newPassword);
          },
          
          enableTwoFactor: async () => {
            set((state) => {
              state.loading.auth = true;
              state.errors.auth = null;
            });
            
            try {
              const result = await authService.setupTwoFactor();
              
              if (result.success) {
                set((state) => {
                  state.loading.auth = false;
                });
                
                return { 
                  success: true, 
                  data: result.data // Contains QR code, backup codes, etc.
                };
              }
              
              throw new Error('Two-factor setup failed');
            } catch (error) {
              set((state) => {
                state.errors.auth = error.message || 'Two-factor setup failed';
                state.loading.auth = false;
              });
              return { success: false, error: error.message };
            }
          },

          verifyTwoFactor: async (code) => {
            set((state) => {
              state.loading.auth = true;
              state.errors.auth = null;
            });
            
            try {
              const result = await authService.verifyTwoFactor(code);
              
              if (result.success) {
                set((state) => {
                  state.security.twoFactorEnabled = true;
                  state.loading.auth = false;
                });
                
                return { success: true, message: result.message };
              }
              
              throw new Error('Two-factor verification failed');
            } catch (error) {
              set((state) => {
                state.errors.auth = error.message || 'Two-factor verification failed';
                state.loading.auth = false;
              });
              return { success: false, error: error.message };
            }
          },
          
          disableTwoFactor: async (code) => {
            set((state) => {
              state.loading.auth = true;
              state.errors.auth = null;
            });
            
            try {
              const result = await authService.disableTwoFactor(code);
              
              if (result.success) {
                set((state) => {
                  state.security.twoFactorEnabled = false;
                  state.loading.auth = false;
                });
                
                return { success: true, message: result.message };
              }
              
              throw new Error('Two-factor disable failed');
            } catch (error) {
              set((state) => {
                state.errors.auth = error.message || 'Two-factor disable failed';
                state.loading.auth = false;
              });
              return { success: false, error: error.message };
            }
          },
          
          // Permission checks
          hasPermission: (resource, action) => {
            const { permissions } = get();
            return permissions[resource]?.[action] || false;
          },
          
          canAccess: (resource) => {
            const { permissions } = get();
            return Object.values(permissions[resource] || {}).some(permission => permission === true);
          },
          
          // Error handling
          setError: (section, error) =>
            set((state) => {
              state.errors[section] = error;
            }),
            
          clearError: (section) =>
            set((state) => {
              state.errors[section] = null;
            }),
            
          clearAllErrors: () =>
            set((state) => {
              Object.keys(state.errors).forEach(key => {
                state.errors[key] = null;
              });
            }),
            
          // Computed getters
          getFullName: () => {
            const { profile } = get();
            return `${profile.firstName} ${profile.lastName}`.trim() || profile.email;
          },
          
          getInitials: () => {
            const { profile } = get();
            const firstName = profile.firstName || '';
            const lastName = profile.lastName || '';
            if (firstName && lastName) {
              return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
            }
            return profile.email ? profile.email.charAt(0).toUpperCase() : '?';
          },
          
          isSessionExpiring: () => {
            const { session } = get();
            if (!session.lastActivity) return false;
            
            const timeSinceActivity = Date.now() - session.lastActivity;
            const timeUntilWarning = session.sessionTimeout - session.warningTime;
            
            return timeSinceActivity >= timeUntilWarning;
          },
          
          isSessionExpired: () => {
            const { session, isAuthenticated } = get();
            // If user is authenticated but no lastActivity yet, session is not expired
            if (isAuthenticated && !session.lastActivity) return false;
            if (!session.lastActivity) return true;
            
            const timeSinceActivity = Date.now() - session.lastActivity;
            return timeSinceActivity >= session.sessionTimeout;
          },
          
          getSessionTimeRemaining: () => {
            const { session } = get();
            if (!session.lastActivity) return 0;
            
            const timeSinceActivity = Date.now() - session.lastActivity;
            const timeRemaining = session.sessionTimeout - timeSinceActivity;
            
            return Math.max(0, timeRemaining);
          },
          
          isPasswordExpired: () => {
            const { security } = get();
            if (!security.lastPasswordChange) return false;
            
            const daysSinceChange = (Date.now() - new Date(security.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceChange >= security.passwordExpiryDays;
          },
          
          getUserRole: () => {
            const { profile, user } = get();
            return user?.role || profile?.role || 'user';
          }
        }))
      ),
      {
        name: 'user-store',
        partialize: (state) => ({
          // Persist only essential data
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          refreshToken: state.refreshToken,
          tokenExpiry: state.tokenExpiry,
          user: state.user,
          profile: state.profile,
          preferences: state.preferences,
          permissions: state.permissions
        })
      }
    ),
    { name: 'user-store' }
  )
);

export default useUserStore;