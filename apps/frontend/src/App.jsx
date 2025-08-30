import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { lightTheme, darkTheme } from './styles/theme';
import GlobalStyles from './styles/globalStyles';
import SafeThemeProvider from './components/providers/SafeThemeProvider';
import useStore from './store';
import useUserStore from './store/userStore';
import { useWebSocket } from './hooks/useWebSocket';
import QueryProvider from './components/providers/QueryProvider';

// Layout components
import Header from './components/organisms/Header';
import Sidebar from './components/organisms/Sidebar';
import ErrorBoundary from './components/organisms/ErrorBoundary';
import OfflineIndicator from './components/atoms/OfflineIndicator';
import PageTransition from './components/molecules/PageTransition';

// Debug components (development only)
import ApiDebug from './components/debug/ApiDebug';
import WebSocketDebug from './components/debug/WebSocketDebug';
import EnvDebug from './components/debug/EnvDebug';
import QueryDebug from './components/debug/QueryDebug';
import NotificationDemo from './components/debug/NotificationDemo';
import ProductDemo from './components/debug/ProductDemo';
import AIInsightsDemo from './components/debug/AIInsightsDemo';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Alerts from './pages/Alerts';
import Recommendations from './pages/Recommendations';
import Analytics from './pages/Analytics';
import ABTesting from './pages/ABTesting';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthProvider from './components/auth/AuthProvider';

// Context providers
import { ModalProvider } from './contexts/ModalContext';

// Mobile-first utilities
import { createMobileListener } from './utils/viewport';

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

// AppContent component that uses React Router hooks
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore();
  const { preferences, initializeAuth } = useUserStore();
  const { ui = {}, toggleSidebar, setSidebarMobileOpen, setCurrentPage, setIsMobile } = store || {};
  
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
    if (action === 'profile' || action === 'settings') {
      navigate('/settings');
    } else if (action === 'logout') {
      // Logout user and redirect to login
      useUserStore.getState().logout();
      navigate('/login', { replace: true });
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
  };

  const handleNotificationClear = () => {
    console.warn('Clear all notifications');
  };

  const handleSearch = (query) => {
    console.warn('Search query:', query);
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
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
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
                  {import.meta.env.DEV && <WebSocketDebug />} */}
                  
                  <ContentArea>
                    <PageTransition variant="default">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/products" element={
                          <ProtectedRoute requiredResource="products">
                            <Products />
                          </ProtectedRoute>
                        } />
                        <Route path="/products/:id" element={
                          <ProtectedRoute requiredResource="products">
                            <ProductDetail />
                          </ProtectedRoute>
                        } />
                        <Route path="/orders" element={
                          <ProtectedRoute requiredResource="orders">
                            <Orders />
                          </ProtectedRoute>
                        } />
                        <Route path="/orders/:id" element={
                          <ProtectedRoute requiredResource="orders">
                            <OrderDetail />
                          </ProtectedRoute>
                        } />
                        <Route path="/alerts" element={
                          <ProtectedRoute requiredResource="alerts">
                            <Alerts />
                          </ProtectedRoute>
                        } />
                        <Route path="/recommendations" element={
                          <ProtectedRoute requiredResource="analytics">
                            <Recommendations />
                          </ProtectedRoute>
                        } />
                        <Route path="/analytics" element={
                          <ProtectedRoute requiredResource="analytics">
                            <Analytics />
                          </ProtectedRoute>
                        } />
                        <Route path="/ab-testing" element={
                          <ProtectedRoute requiredResource="analytics">
                            <ABTesting />
                          </ProtectedRoute>
                        } />
                        <Route path="/settings" element={
                          <ProtectedRoute requiredResource="settings">
                            <Settings />
                          </ProtectedRoute>
                        } />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </PageTransition>
                  </ContentArea>
                </MainContent>
              </AppContainer>
            </ProtectedRoute>
          } />
        </Routes>
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
