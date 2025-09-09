// Enhanced Authentication Service
// Implementation of API-002: Authentication service integration
import httpService, { ApiError } from './httpClient';

/**
 * Enhanced Authentication Service
 * Integrates with httpClient for comprehensive auth management
 */
class AuthService {
  constructor() {
    this.tokenRefreshPromise = null;
    this.isRefreshing = false;
    this.refreshListeners = [];
    
    // Auth event listeners
    this.eventListeners = {
      login: [],
      logout: [],
      tokenRefresh: [],
      sessionExpired: []
    };
  }

  /**
   * Authenticate user with email/password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {boolean} credentials.rememberMe - Remember user session
   * @returns {Promise<Object>} Authentication response
   */
  async login(credentials) {
    try {
      const response = await httpService.post('/v1/auth/login', {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      });

      if (response.data) {
        // Store tokens and user data
        const authData = {
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
          tokenType: response.data.tokenType || 'Bearer'
        };

        // Calculate token expiry
        const expiresAt = Date.now() + (authData.expiresIn * 1000);
        
        // Emit login event
        this.emitEvent('login', { user: authData.user, timestamp: Date.now() });

        return {
          success: true,
          data: {
            ...authData,
            expiresAt
          }
        };
      }

      throw new ApiError('Invalid response format', 500, 'INVALID_RESPONSE');
    } catch (error) {
      // Handle specific auth errors
      if (error.status === 401) {
        throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      } else if (error.status === 429) {
        throw new ApiError('Too many login attempts. Please try again later.', 429, 'RATE_LIMITED');
      } else if (error.status === 423) {
        throw new ApiError('Account is temporarily locked', 423, 'ACCOUNT_LOCKED');
      }
      
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await httpService.post('/v1/auth/register', userData);
      
      return {
        success: true,
        data: response.data,
        message: 'Registration successful. Please check your email for verification.'
      };
    } catch (error) {
      if (error.status === 409) {
        throw new ApiError('Email already exists', 409, 'EMAIL_EXISTS');
      } else if (error.status === 422) {
        throw new ApiError('Invalid registration data', 422, 'VALIDATION_ERROR', error.data);
      }
      
      throw error;
    }
  }

  /**
   * Initiate password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset response
   */
  async resetPassword(email) {
    try {
      const response = await httpService.post('/v1/auth/reset-password', { email });
      
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (error) {
      if (error.status === 404) {
        // Don't reveal if email exists for security
        return {
          success: true,
          message: 'If an account with that email exists, password reset instructions have been sent'
        };
      }
      
      throw error;
    }
  }

  /**
   * Confirm password reset with token
   * @param {Object} resetData - Reset data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.newPassword - New password
   * @returns {Promise<Object>} Reset confirmation response
   */
  async confirmPasswordReset(resetData) {
    try {
      const response = await httpService.post('/v1/auth/reset-password/confirm', resetData);
      
      return {
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      };
    } catch (error) {
      if (error.status === 400) {
        throw new ApiError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
      }
      
      throw error;
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Change response
   */
  async changePassword(passwordData) {
    try {
      const response = await httpService.post('/v1/auth/change-password', passwordData);
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      if (error.status === 400) {
        throw new ApiError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
      }
      
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshListeners.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const response = await httpService.post('/v1/auth/refresh', { refreshToken });

      if (response.data) {
        const authData = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
          expiresAt: Date.now() + (response.data.expiresIn * 1000)
        };

        // Emit token refresh event
        this.emitEvent('tokenRefresh', authData);

        // Resolve any pending refresh listeners
        this.refreshListeners.forEach(listener => listener(authData));
        this.refreshListeners = [];

        return {
          success: true,
          data: authData
        };
      }

      throw new ApiError('Invalid refresh response', 500, 'INVALID_REFRESH_RESPONSE');
    } catch (error) {
      // Clear pending listeners on error
      this.refreshListeners.forEach(listener => listener(null));
      this.refreshListeners = [];

      if (error.status === 401) {
        // Refresh token is invalid/expired
        this.emitEvent('sessionExpired');
        throw new ApiError('Session expired. Please login again.', 401, 'SESSION_EXPIRED');
      }

      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Logout user
   * @param {string} refreshToken - Refresh token to invalidate
   * @returns {Promise<Object>} Logout response
   */
  async logout(refreshToken = null) {
    try {
      if (refreshToken) {
        // Invalidate refresh token on server
        await httpService.post('/v1/auth/logout', { refreshToken });
      }

      // Emit logout event
      this.emitEvent('logout', { timestamp: Date.now() });

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      // Even if server logout fails, we should clear local session
      this.emitEvent('logout', { timestamp: Date.now() });
      
      return {
        success: true,
        message: 'Logged out locally'
      };
    }
  }

  /**
   * Verify email address
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Verification response
   */
  async verifyEmail(token) {
    try {
      const response = await httpService.post('/v1/auth/verify-email', { token });
      
      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      if (error.status === 400) {
        throw new ApiError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');
      }
      
      throw error;
    }
  }

  /**
   * Resend email verification
   * @param {string} email - User email
   * @returns {Promise<Object>} Resend response
   */
  async resendVerificationEmail(email) {
    try {
      const response = await httpService.post('/v1/auth/resend-verification', { email });
      
      return {
        success: true,
        message: 'Verification email sent'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Setup two-factor authentication
   * @returns {Promise<Object>} 2FA setup data
   */
  async setupTwoFactor() {
    try {
      const response = await httpService.post('/auth/2fa/setup');
      
      return {
        success: true,
        data: {
          qrCode: response.data.qrCode,
          backupCodes: response.data.backupCodes,
          secret: response.data.secret
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify two-factor authentication setup
   * @param {string} code - 2FA code
   * @returns {Promise<Object>} Verification response
   */
  async verifyTwoFactor(code) {
    try {
      const response = await httpService.post('/auth/2fa/verify', { code });
      
      return {
        success: true,
        message: 'Two-factor authentication enabled'
      };
    } catch (error) {
      if (error.status === 400) {
        throw new ApiError('Invalid authentication code', 400, 'INVALID_2FA_CODE');
      }
      
      throw error;
    }
  }

  /**
   * Disable two-factor authentication
   * @param {string} code - 2FA code or backup code
   * @returns {Promise<Object>} Disable response
   */
  async disableTwoFactor(code) {
    try {
      const response = await httpService.post('/auth/2fa/disable', { code });
      
      return {
        success: true,
        message: 'Two-factor authentication disabled'
      };
    } catch (error) {
      if (error.status === 400) {
        throw new ApiError('Invalid authentication code', 400, 'INVALID_2FA_CODE');
      }
      
      throw error;
    }
  }

  /**
   * Get user permissions
   * @returns {Promise<Object>} User permissions
   */
  async getUserPermissions() {
    try {
      const response = await httpService.get('/user/permissions');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile() {
    try {
      const response = await httpService.get('/user/profile');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Update response
   */
  async updateUserProfile(profileData) {
    try {
      const response = await httpService.patch('/user/profile', profileData);
      
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if token is expired or will expire soon
   * @param {number} expiresAt - Token expiration timestamp
   * @param {number} buffer - Buffer time in milliseconds (default: 5 minutes)
   * @returns {boolean} Is token expired or expiring
   */
  isTokenExpiring(expiresAt, buffer = 5 * 60 * 1000) {
    return Date.now() >= (expiresAt - buffer);
  }

  /**
   * Validate token format
   * @param {string} token - JWT token
   * @returns {boolean} Is token format valid
   */
  isValidTokenFormat(token) {
    if (!token || typeof token !== 'string') return false;
    
    // Basic JWT format check (header.payload.signature)
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Decode JWT payload (without verification)
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded payload
   */
  decodeTokenPayload(token) {
    try {
      if (!this.isValidTokenFormat(token)) return null;
      
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiration date
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date
   */
  getTokenExpiration(token) {
    const payload = this.decodeTokenPayload(token);
    return payload?.exp ? new Date(payload.exp * 1000) : null;
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emitEvent(event, data = null) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in auth event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
const authService = new AuthService();

export default authService;
export { AuthService };