import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { getInitialIsMobile } from '../utils/viewport';

// Enable MapSet plugin for Immer to handle Map and Set in state
enableMapSet();

// Create root store with middleware
const useStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Global loading states
        loading: {
          global: false,
          products: false,
          dashboard: false,
          alerts: false,
          analytics: false
        },

        // Error handling
        errors: {
          global: null,
          products: null,
          dashboard: null,
          alerts: null,
          analytics: null
        },

        // UI state - Mobile First initialization
        ui: {
          sidebarCollapsed: false,
          sidebarMobileOpen: false,
          isMobile: getInitialIsMobile(),
          theme: 'light',
          currentPage: 'dashboard',
          notifications: []
        },

        // Actions
        setLoading: (key, loading) => 
          set((state) => {
            state.loading[key] = loading;
          }),

        setError: (key, error) => 
          set((state) => {
            state.errors[key] = error;
          }),

        clearError: (key) => 
          set((state) => {
            state.errors[key] = null;
          }),

        clearAllErrors: () => 
          set((state) => {
            Object.keys(state.errors).forEach(key => {
              state.errors[key] = null;
            });
          }),

        // UI actions
        toggleSidebar: () => 
          set((state) => {
            state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
          }),

        setSidebarMobileOpen: (open) => 
          set((state) => {
            state.ui.sidebarMobileOpen = open;
          }),

        setIsMobile: (isMobile) => 
          set((state) => {
            state.ui.isMobile = isMobile;
          }),

        setTheme: (theme) => 
          set((state) => {
            state.ui.theme = theme;
          }),

        setCurrentPage: (page) => 
          set((state) => {
            state.ui.currentPage = page;
          }),

        addNotification: (notification) => 
          set((state) => {
            state.ui.notifications.push({
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              ...notification
            });
          }),

        removeNotification: (id) => 
          set((state) => {
            state.ui.notifications = state.ui.notifications.filter(n => n.id !== id);
          }),

        clearNotifications: () => 
          set((state) => {
            state.ui.notifications = [];
          })
      }))
    ),
    { name: 'omnix-store' }
  )
);

export default useStore;