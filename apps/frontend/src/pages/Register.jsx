import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
const RegisterContainer = styled.div`
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

const RegisterCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.border.light};
  padding: 3rem;
  width: 100%;
  max-width: 450px;
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

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
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

const SuccessMessage = styled(motion.div)`
  background: ${props => props.theme.colors.status.success.background};
  color: ${props => props.theme.colors.status.success.text};
  border: 1px solid ${props => props.theme.colors.status.success.border};
  border-radius: ${props => props.theme.borderRadius.md};
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.border.light};
  
  a {
    color: ${props => props.theme.colors.primary[600]};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      color: ${props => props.theme.colors.primary[700]};
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
  background: ${props => props.theme.colors.border.light};
  border-radius: 2px;
  transition: background-color 0.3s ease;
  
  &.weak { background: ${props => props.theme.colors.status.error.text}; }
  &.medium { background: ${props => props.theme.colors.status.warning.text}; }
  &.strong { background: ${props => props.theme.colors.status.success.text}; }
`;

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'manager', // Default role
    acceptTerms: false
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

  // Calculate password strength
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };

    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.acceptTerms) return 'Please accept the terms and conditions';
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'manager',
          acceptTerms: false
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Registration error:', err);
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
        title="Register - OMNIX AI"
        description="Create your OMNIX AI account for smart inventory management"
      />
      
      <RegisterContainer>
        <RegisterCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <LogoContainer>
            <Logo>OX</Logo>
            <Typography variant="h2" weight="600" color="primary">
              Join OMNIX AI
            </Typography>
            <Typography variant="body2" color="secondary" style={{ marginTop: '0.5rem' }}>
              Start managing your inventory smartly
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

            <InputRow>
              <InputGroup>
                <Typography variant="label" weight="500">
                  First Name
                </Typography>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                  disabled={isLoading}
                  autoComplete="given-name"
                />
              </InputGroup>
              <InputGroup>
                <Typography variant="label" weight="500">
                  Last Name
                </Typography>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                  autoComplete="family-name"
                />
              </InputGroup>
            </InputRow>

            <InputGroup>
              <Typography variant="label" weight="500">
                Email Address
              </Typography>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@company.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </InputGroup>

            <InputGroup>
              <Typography variant="label" weight="500">
                Role
              </Typography>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
                disabled={isLoading}
              >
                <option value="manager">Store Manager</option>
                <option value="admin">System Administrator</option>
              </select>
            </InputGroup>

            <InputGroup>
              <Typography variant="label" weight="500">
                Password
              </Typography>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
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
                Confirm Password
              </Typography>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </InputGroup>

            <InputGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  style={{ width: '16px', height: '16px' }}
                />
                <Typography variant="body2" color="secondary">
                  I agree to the{' '}
                  <a href="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    Privacy Policy
                  </a>
                </Typography>
              </label>
            </InputGroup>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || !formData.acceptTerms}
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </Form>

          <LoginLink>
            <Typography variant="body2" color="secondary">
              Already have an account?{' '}
              <Link to="/login">Sign in here</Link>
            </Typography>
          </LoginLink>
        </RegisterCard>
      </RegisterContainer>
    </>
  );
}

export default Register;