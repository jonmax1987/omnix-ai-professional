import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { lightTheme, darkTheme } from './styles/theme';
import GlobalStyles from './styles/globalStyles';
import SafeThemeProvider from './components/providers/SafeThemeProvider';
import useStore from './store';
import useUserStore from './store/userStore';
import { useWebSocket } from './hooks/useWebSocket';
import QueryProvider from './components/providers/QueryProvider';
import { initializeApplication } from './utils/appInitializer.js';
import Spinner from './components/atoms/Spinner';

// Layout components
import Header from './components/organisms/Header';
import Sidebar from './components/organisms/Sidebar';
import ErrorBoundary from './components/organisms/ErrorBoundary';
import OfflineIndicator from './components/atoms/OfflineIndicator';
import PageTransition from './components/molecules/PageTransition';
import CacheUpdateNotification from './components/molecules/CacheUpdateNotification';

// Debug components (development only) - Lazy loaded
const ApiDebug = import.meta.env.DEV ? lazy(() => import('./components/debug/ApiDebug')) : null;
const WebSocketDebug = import.meta.env.DEV ? lazy(() => import('./components/debug/WebSocketDebug')) : null;
const EnvDebug = import.meta.env.DEV ? lazy(() => import('./components/debug/EnvDebug')) : null;
const QueryDebug = import.meta.env.DEV ? lazy(() => import('./components/debug/QueryDebug')) : null;
const NotificationDemo = import.meta.env.DEV ? lazy(() => import('./components/debug/NotificationDemo')) : null;
const ProductDemo = import.meta.env.DEV ? lazy(() => import('./components/debug/ProductDemo')) : null;
const AIInsightsDemo = import.meta.env.DEV ? lazy(() => import('./components/debug/AIInsightsDemo')) : null;
const CDNPerformanceDebug = import.meta.env.DEV ? lazy(() => import('./components/debug/CDNPerformanceDebug')) : null;

// Immediate loads for critical paths
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Lazy load non-critical pages
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ABTesting = lazy(() => import('./pages/ABTesting'));
const Settings = lazy(() => import('./pages/Settings'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthProvider from './components/auth/AuthProvider';

// Context providers
import { ModalProvider } from './contexts/ModalContext';

// Mobile-first utilities
import { createMobileListener } from './utils/viewport';
import { preloadManager } from './utils/preloadManager';

// Styled components
import styled, { StyleSheetManager } from 'styled-components';
import { shouldForwardProp } from './utils/styledUtils';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background?.primary || '#f8fafc'};
`;

const MainContent = styled.main.withConfig({
  shouldForwardProp: (prop) => !['sidebarCollapsed'].includes(prop),
})`
  /* Mobile First: Default to full width with no margins */
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  margin-right: 0;
  
  /* Desktop Enhancement: Add sidebar margins for large screens only */
  @media (min-width: ${props => props.theme?.breakpoints?.lg || '1024px'}) {
    margin-left: ${props => props.sidebarCollapsed ? '72px' : '280px'};
    transition: margin-left ${props => props.theme?.animation?.duration?.standard || '300ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
    
    /* RTL Support */
    [dir="rtl"] & {
      margin-left: 0;
      margin-right: ${props => props.sidebarCollapsed ? '72px' : '280px'};
      transition: margin-right ${props => props.theme?.animation?.duration?.standard || '300ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
    }
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-x: hidden;
`;

// Loading wrapper for lazy components
const LazyWrapper = ({ children }) => (
  <Suspense fallback={
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      <Spinner size="lg" />
    </div>
  }>
    {children}
  </Suspense>
);

// Role-based Dashboard Router Component
function DashboardRouter() {
  const user = useUserStore((state) => state.user);
  
  // If customer role, show customer dashboard without sidebar/header
  if (user?.role === 'customer') {
    return (
      <LazyWrapper>
        <CustomerDashboard />
      </LazyWrapper>
    );
  }
  
  // Otherwise show admin/manager dashboard
  return <Dashboard />;
}

// AppContent component that uses React Router hooks
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore();
  const preferences = useUserStore((state) => state.preferences);
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const user = useUserStore((state) => state.user);
  const { ui = {}, toggleSidebar, setSidebarMobileOpen, setCurrentPage, setIsMobile } = store || {};
  const [_appInitialized, setAppInitialized] = useState(false);
  const [_initError, setInitError] = useState(null);
  
  // Initialize application performance optimizations
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      try {
        console.warn('[App] Initializing performance optimizations...');
        const report = await initializeApplication();
        
        if (mounted) {
          setAppInitialized(true);
          if (import.meta.env.DEV) {
            console.warn('[App] Performance optimizations initialized:', report);
          }
        }
      } catch (error) {
        console.error('[App] Failed to initialize performance optimizations:', error);
        if (mounted) {
          setInitError(error);
          setAppInitialized(true); // Continue with degraded performance
        }
      }
    };
    
    initializeApp();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  // Initialize authentication state on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  // System theme detection
  useEffect(() => {
    if (preferences.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateTheme = () => {
        // Don't change the user preference, just detect the system theme
        // The theme selection logic will handle 'auto' mode
      };
      
      mediaQuery.addEventListener('change', updateTheme);
      updateTheme();
      
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [preferences.theme]);
  
  // Update store when route changes
  useEffect(() => {
    const path = location.pathname.slice(1) || 'dashboard';
    setCurrentPage?.(path);
  }, [location.pathname, setCurrentPage]);

  // Monitor mobile state globally - Mobile First approach
  useEffect(() => {
    // Use the mobile-first utility for consistent detection
    const cleanup = createMobileListener((isMobile) => {
      setIsMobile?.(isMobile);
    });
    
    return cleanup;
  }, [setIsMobile]);

  // Initialize WebSocket connection
  useWebSocket();
  
  // Initialize preload manager
  useEffect(() => {
    if (user) {
      const currentRoute = location.pathname.slice(1) || 'dashboard';
      preloadManager.initialize(user.role, currentRoute);
    }
  }, [user, location.pathname]);
  
  // Ensure we always have a valid store
  if (!store) {
    return <div>Loading...</div>;
  }

  
  // Mock notifications for demo
  const notifications = [
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'iPhone 14 Pro has only 2 units remaining',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
      icon: 'warning',
      color: '#F59E0B'
    },
    {
      id: '2',
      title: 'New Order',
      message: 'Order #1234 has been placed',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      icon: 'package',
      color: '#10B981'
    },
    {
      id: '3',
      title: 'System Update',
      message: 'OMNIX AI has been updated to v2.1.0',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      icon: 'info',
      color: '#3B82F6'
    }
  ];

  // Theme selection logic
  const getTheme = () => {
    if (preferences.theme === 'dark') return darkTheme;
    if (preferences.theme === 'light') return lightTheme;
    if (preferences.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? darkTheme : lightTheme;
    }
    return lightTheme;
  };

  const currentTheme = getTheme();

  const handleMenuToggle = () => {
    if (ui.isMobile) {
      setSidebarMobileOpen?.(!ui.sidebarMobileOpen);
    } else {
      toggleSidebar?.();
    }
  };

  const handleUserMenuAction = (action) => {
    console.warn('User menu action:', action);
    switch (action) {
      case 'profile':
        navigate('/settings'); // For now, navigate to settings until profile page is built
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'help':
        // Open help documentation or support page
        console.warn('Opening help & support');
        // window.open('/help', '_blank');
        break;
      case 'logout':
        useUserStore.getState().logout();
        navigate('/login', { replace: true });
        break;
      default:
        console.warn('Unknown user menu action:', action);
        break;
    }
  };

  const handleNavigate = (page) => {
    navigate(`/${page}`);
    // Close sidebar on mobile after navigation
    if (ui.isMobile) {
      setSidebarMobileOpen?.(false);
    }
  };

  const handleNotificationClick = (notification) => {
    console.warn('Notification clicked:', notification);
    
    // Handle different notification types
    switch (notification.type || notification.category) {
      case 'Low Stock Alert':
      case 'inventory':
        navigate('/products');
        break;
      case 'New Order':
      case 'order':
        navigate('/orders');
        break;
      case 'System Update':
      case 'system':
        // Show system info or navigate to settings
        console.warn('System notification clicked');
        break;
      default:
        console.warn('General notification clicked');
        break;
    }
  };

  const handleNotificationClear = () => {
    console.warn('Clearing all notifications');
    // In a real implementation, this would call an API to mark notifications as read
    // notificationService.markAllAsRead();
  };

  const handleSearch = async (query) => {
    if (!query || query.length < 2) return;
    
    console.warn('Search query:', query);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real implementation, this would:
      // 1. Call search API
      // 2. Navigate to search results page
      // 3. Update search history
      
      // For now, navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Note: Login page check removed as it was unused

  return (
    <AuthProvider 
      enableSessionManagement={true}
      showSessionIndicator={import.meta.env.DEV}
    >
      <ModalProvider>
        <SafeThemeProvider theme={currentTheme}>
          <StyleSheetManager shouldForwardProp={shouldForwardProp}>
            <GlobalStyles />
          {/* <ErrorBoundary showError={true}> */}
          <OfflineIndicator />
        
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<LazyWrapper><Register /></LazyWrapper>} />
          <Route path="/reset-password" element={<LazyWrapper><ResetPassword /></LazyWrapper>} />
          <Route path="/forgot-password" element={<LazyWrapper><ResetPassword /></LazyWrapper>} />
          <Route path="/unauthorized" element={<LazyWrapper><Unauthorized /></LazyWrapper>} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              {user?.role === 'customer' ? (
                // Customer gets dedicated dashboard without admin UI
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<LazyWrapper><CustomerDashboard /></LazyWrapper>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              ) : (
                // Admin/Manager gets full admin interface
                <AppContainer>
                  <Sidebar
                    collapsed={ui?.sidebarCollapsed || false}
                    mobileOpen={ui?.sidebarMobileOpen || false}
                    onClose={() => setSidebarMobileOpen?.(false)}
                    onCollapse={toggleSidebar}
                    currentPage={ui?.currentPage || 'dashboard'}
                    onNavigate={handleNavigate}
                  />
                  
                  <MainContent sidebarCollapsed={ui?.sidebarCollapsed || false}>
                    <Header
                      notifications={notifications}
                      onMenuToggle={handleMenuToggle}
                      onUserMenuAction={handleUserMenuAction}
                      onNotificationClick={handleNotificationClick}
                      onNotificationClear={handleNotificationClear}
                      onSearch={handleSearch}
                    />
                    
                    {/* Debug panels for development */}
                    {/* {import.meta.env.DEV && <EnvDebug />}
                    {import.meta.env.DEV && <ApiDebug />}
                    {import.meta.env.DEV && <QueryDebug />}
                    {import.meta.env.DEV && <NotificationDemo />}
                    {import.meta.env.DEV && <ProductDemo />}
                    {import.meta.env.DEV && <AIInsightsDemo />}
                    {import.meta.env.DEV && <WebSocketDebug />}
                    {import.meta.env.DEV && CDNPerformanceDebug && appInitialized && (
                      <Suspense fallback={null}>
                        <CDNPerformanceDebug visible={true} />
                      </Suspense>
                    )} */}
                    
                    <ContentArea>
                      <PageTransition variant="default">
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/products" element={
                            <ProtectedRoute requiredResource="products">
                              <LazyWrapper><Products /></LazyWrapper>
                            </ProtectedRoute>
                          } />
                          <Route path="/products/:id" element={
                            <ProtectedRoute requiredResource="products">
                              <LazyWrapper><ProductDetail /></LazyWrapper>
                            </ProtectedRoute>
                          } />
                          <Route path="/orders" element={
                            <ProtectedRoute requiredResource="orders">
                              <LazyWrapper><Orders /></LazyWrapper>
                            </ProtectedRoute>
                          } />
                          <Route path="/orders/:id" element={
                            <ProtectedRoute requiredResource="orders">
                              <LazyWrapper><OrderDetail /></LazyWrapper>
                            </ProtectedRoute>
                          } />
                          <Route path="/alerts" element={
                            <ProtectedRoute requiredResource="alerts">
                              <LazyWrapper><Alerts /></LazyWrapper>
                            </ProtectedRoute>
                          } />
                          <Route path="/recommendations" element={
                            <ProtectedRoute requiredResource="analytics">
                              <LazyWrapper><Recommendations /></LazyWrapper>
                            </ProtectedRoute>
                          } />
                          <Route path="/analytics" element={
                            <ProtectedRoute requiredResource="analytics">
                              <LazyWrapper><Analytics /></LazyWrapper>
                            </ProtectedRoute>
                          } />
                          <Route path="/ab-testing" element={
                            <ProtectedRoute requiredResource="analytics">
                              <LazyWrapper><ABTesting /></LazyWrapper>
                            </ProtectedRoute>
                          } />
                          <Route path="/settings" element={
                            <ProtectedRoute requiredResource="settings">
                              <LazyWrapper><Settings /></LazyWrapper>
                            </ProtectedRoute>
                          } />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </PageTransition>
                    </ContentArea>
                  </MainContent>
                </AppContainer>
              )}
            </ProtectedRoute>
          } />
        </Routes>
        
        {/* Cache update notification for users with old cached bundles */}
        <CacheUpdateNotification />
        
      {/* </ErrorBoundary> */}
          </StyleSheetManager>
      </SafeThemeProvider>
    </ModalProvider>
    </AuthProvider>
  );
}

// Main App component
function App() {
  return (
    <QueryProvider>
      <Router>
        <AppContent />
      </Router>
    </QueryProvider>
  );
}

export default App;
