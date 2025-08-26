import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import useUserStore from '../store/userStore';
import { authAPI } from '../services/api';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import Typography from '../components/atoms/Typography';
import SEOHead from '../components/atoms/SEOHead';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary[50]} 0%, 
    ${props => props.theme.colors.secondary[50]} 100%
  );
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${props => props.theme.colors.primary[100].slice(1)}' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E") repeat;
    opacity: 0.5;
  }
`;

const LoginCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.border.light};
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem;
    margin: 1rem;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  animation: ${float} 3s ease-in-out infinite;
`;

const Logo = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary[500]}, 
    ${props => props.theme.colors.secondary[500]}
  );
  border-radius: ${props => props.theme.borderRadius.xl};
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ErrorMessage = styled(motion.div)`
  background: ${props => props.theme.colors.status.error.background};
  color: ${props => props.theme.colors.status.error.text};
  border: 1px solid ${props => props.theme.colors.status.error.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '⚠';
    font-size: 1rem;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const TestCredentials = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: ${props => props.theme.colors.info.background};
  border: 1px solid ${props => props.theme.colors.info.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: ${props => props.theme.colors.info.text};
    font-weight: 600;
  }
  
  .credential-item {
    margin: 0.25rem 0;
    color: ${props => props.theme.colors.text.secondary};
    font-family: monospace;
    cursor: pointer;
    
    &:hover {
      color: ${props => props.theme.colors.primary[600]};
    }
  }
`;

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useUserStore();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use the API service layer with correct endpoint configuration
      const data = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      if (data && data.data) {
        // Update user store with real backend data
        useUserStore.setState({
          isAuthenticated: true,
          token: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          user: data.data.user,
          profile: {
            ...useUserStore.getState().profile,
            id: data.data.user.id,
            email: data.data.user.email,
            firstName: data.data.user.name?.split(' ')[0] || '',
            lastName: data.data.user.name?.split(' ').slice(1).join(' ') || '',
            role: data.data.user.role,
            lastLogin: new Date().toISOString()
          },
          permissions: {
            products: { view: true, create: true, edit: true, delete: true, export: true },
            inventory: { view: true, adjust: true, transfer: true, audit: true },
            orders: { view: true, create: true, edit: true, cancel: true, fulfill: true },
            analytics: { view: true, export: true, advanced: true },
            alerts: { view: true, acknowledge: true, resolve: true, manage: true },
            settings: { view: true, edit: true, admin: data.data.user.role === 'admin' },
            users: { 
              view: data.data.user.role === 'admin', 
              create: data.data.user.role === 'admin', 
              edit: data.data.user.role === 'admin', 
              delete: data.data.user.role === 'admin' 
            }
          },
          loading: { auth: false },
          errors: { auth: null }
        });

        // Navigate to intended destination
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCredentialClick = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <>
      <SEOHead 
        title="Login - OMNIX AI"
        description="Sign in to OMNIX AI smart inventory management system"
      />
      
      <LoginContainer>
        <LoginCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <LogoContainer>
            <Logo>OX</Logo>
            <Typography variant="h2" weight="600" color="primary">
              OMNIX AI
            </Typography>
            <Typography variant="body2" color="secondary" style={{ marginTop: '0.5rem' }}>
              Smart Inventory Management
            </Typography>
          </LogoContainer>

          <Form onSubmit={handleSubmit}>
            {error && (
              <ErrorMessage
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </ErrorMessage>
            )}

            <InputGroup>
              <Typography variant="label" weight="500">
                Email Address
              </Typography>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </InputGroup>

            <InputGroup>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="label" weight="500">
                  Password
                </Typography>
                <Link to="/forgot-password" style={{ color: 'inherit', fontSize: '0.875rem', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </InputGroup>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || !formData.email || !formData.password}
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </Form>

          <TestCredentials>
            <h4>🧪 Test Credentials:</h4>
            <div 
              className="credential-item"
              onClick={() => handleTestCredentialClick('admin@omnix.ai', 'admin123')}
            >
              👤 Admin: admin@omnix.ai / admin123
            </div>
            <div 
              className="credential-item"
              onClick={() => handleTestCredentialClick('manager@omnix.ai', 'manager123')}
            >
              👨‍💼 Manager: manager@omnix.ai / manager123
            </div>
            <Typography variant="caption" color="secondary" style={{ marginTop: '0.5rem', display: 'block' }}>
              Click to auto-fill credentials
            </Typography>
          </TestCredentials>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <Typography variant="body2" color="secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'inherit', fontWeight: '500', textDecoration: 'underline' }}>
                Sign up here
              </Link>
            </Typography>
          </div>
        </LoginCard>
      </LoginContainer>
    </>
  );
}

export default Login;