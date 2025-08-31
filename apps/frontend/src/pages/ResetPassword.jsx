import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import useUserStore from '../store/userStore';
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
const ResetContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${props => props.theme?.colors?.primary?.[50] || '#eff6ff'} 0%, 
    ${props => props.theme?.colors?.secondary?.[50] || '#f5f3ff'} 100%
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
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${(props.theme?.colors?.primary?.[100] || '#dbeafe').slice(1)}' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E") repeat;
    opacity: 0.5;
  }
`;

const ResetCard = styled(motion.div)`
  background: ${props => props.theme?.colors?.background?.primary || '#ffffff'};
  border-radius: ${props => props.theme?.borderRadius?.xl || '0.75rem'};
  box-shadow: ${props => props.theme?.shadows?.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e2e8f0'};
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: ${props => props.theme?.breakpoints?.sm || '640px'}) {
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
    ${props => props.theme?.colors?.primary?.[500] || '#3b82f6'}, 
    ${props => props.theme?.colors?.secondary?.[500] || '#8b5cf6'}
  );
  border-radius: ${props => props.theme?.borderRadius?.xl || '0.75rem'};
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
  background: ${props => props.theme?.colors?.status?.error?.background || '#fef2f2'};
  color: ${props => props.theme?.colors?.status?.error?.text || '#b91c1c'};
  border: 1px solid ${props => props.theme?.colors?.status?.error?.border || '#fecaca'};
  border-radius: ${props => props.theme?.borderRadius?.md || '0.375rem'};
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

const SuccessMessage = styled(motion.div)`
  background: ${props => props.theme?.colors?.status?.success?.background || '#f0fdf4'};
  color: ${props => props.theme?.colors?.status?.success?.text || '#15803d'};
  border: 1px solid ${props => props.theme?.colors?.status?.success?.border || '#bbf7d0'};
  border-radius: ${props => props.theme?.borderRadius?.md || '0.375rem'};
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '✓';
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

const BackLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme?.colors?.border?.light || '#e2e8f0'};
  
  a {
    color: ${props => props.theme?.colors?.primary?.[600] || '#2563eb'};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      color: ${props => props.theme?.colors?.primary?.[700] || '#1d4ed8'};
      text-decoration: underline;
    }
  }
`;

const PasswordStrength = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const StrengthBar = styled.div`
  flex: 1;
  height: 4px;
  background: ${props => props.theme?.colors?.border?.light || '#e2e8f0'};
  border-radius: 2px;
  transition: background-color 0.3s ease;
  
  &.weak { background: ${props => props.theme?.colors?.status?.error?.text || '#b91c1c'}; }
  &.medium { background: ${props => props.theme?.colors?.status?.warning?.text || '#d97706'}; }
  &.strong { background: ${props => props.theme?.colors?.status?.success?.text || '#15803d'}; }
`;

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isTokenReset = !!token;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    token: token || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Calculate password strength (only for token reset)
  useEffect(() => {
    if (!isTokenReset) return;

    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password, isTokenReset]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (isTokenReset) {
      // Token-based password reset validation
      if (formData.password.length < 8) return 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
      if (!formData.token) return 'Invalid reset token';
    } else {
      // Email-based forgot password validation
      if (!formData.email.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const endpoint = isTokenReset ? '/api/auth/reset-password' : '/api/auth/forgot-password';
      const payload = isTokenReset 
        ? {
            token: formData.token,
            newPassword: formData.password
          }
        : {
            email: formData.email.trim().toLowerCase()
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isTokenReset) {
          setSuccess('Password reset successful! You can now sign in with your new password.');
          // Clear form
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            token: ''
          });
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setSuccess('Password reset instructions have been sent to your email address.');
          // Clear email field
          setFormData(prev => ({ ...prev, email: '' }));
        }
      } else {
        setError(data.message || `${isTokenReset ? 'Password reset' : 'Request'} failed. Please try again.`);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthLabel = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
      case 3:
        return 'Medium';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getStrengthClass = (strength) => {
    if (strength <= 1) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  return (
    <>
      <SEOHead 
        title={`${isTokenReset ? 'Reset' : 'Forgot'} Password - OMNIX AI`}
        description={`${isTokenReset ? 'Reset your' : 'Recover your'} OMNIX AI account password`}
      />
      
      <ResetContainer>
        <ResetCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <LogoContainer>
            <Logo>OX</Logo>
            <Typography variant="h2" weight="600" color="primary">
              {isTokenReset ? 'Reset Password' : 'Forgot Password'}
            </Typography>
            <Typography variant="body2" color="secondary" style={{ marginTop: '0.5rem' }}>
              {isTokenReset 
                ? 'Enter your new password below'
                : 'Enter your email to receive reset instructions'
              }
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

            {success && (
              <SuccessMessage
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {success}
              </SuccessMessage>
            )}

            {isTokenReset ? (
              // Token-based password reset form
              <>
                <InputGroup>
                  <Typography variant="label" weight="500">
                    New Password
                  </Typography>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your new password"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  {formData.password && (
                    <>
                      <PasswordStrength>
                        {[1, 2, 3, 4].map(level => (
                          <StrengthBar
                            key={level}
                            className={passwordStrength >= level ? getStrengthClass(passwordStrength) : ''}
                          />
                        ))}
                      </PasswordStrength>
                      <Typography variant="caption" color="secondary">
                        Password Strength: {getStrengthLabel(passwordStrength)}
                      </Typography>
                    </>
                  )}
                </InputGroup>

                <InputGroup>
                  <Typography variant="label" weight="500">
                    Confirm New Password
                  </Typography>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </InputGroup>
              </>
            ) : (
              // Email-based forgot password form
              <InputGroup>
                <Typography variant="label" weight="500">
                  Email Address
                </Typography>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </InputGroup>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || (isTokenReset && (!formData.password || !formData.confirmPassword)) || (!isTokenReset && !formData.email)}
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  {isTokenReset ? 'Resetting...' : 'Sending...'}
                </>
              ) : (
                isTokenReset ? 'Reset Password' : 'Send Reset Instructions'
              )}
            </Button>
          </Form>

          <BackLink>
            <Typography variant="body2" color="secondary">
              Remember your password?{' '}
              <Link to="/login">Back to Sign In</Link>
            </Typography>
            {!isTokenReset && (
              <Typography variant="body2" color="secondary" style={{ marginTop: '0.5rem' }}>
                Don't have an account?{' '}
                <Link to="/register">Sign up here</Link>
              </Typography>
            )}
          </BackLink>
        </ResetCard>
      </ResetContainer>
    </>
  );
}

export default ResetPassword;