import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  ArrowRight,
  Shield,
  Heart,
  UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary.light}10 0%, 
    ${({ theme }) => theme.colors.secondary.light}10 100%);
`;

const LeftPanel = styled(motion.div)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
    opacity: 0.1;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface.primary};

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
  }
`;

const BrandSection = styled.div`
  position: relative;
  z-index: 1;
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Tagline = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  opacity: 0.9;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  line-height: 1.6;
  opacity: 0.8;
  margin: 0 0 ${({ theme }) => theme.spacing.xl} 0;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  opacity: 0.9;
`;

const FormContainer = styled(motion.div)`
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FormTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const FormSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  margin: 0;
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ProgressStep = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ isActive, isCompleted, theme }) => 
    isCompleted ? theme.colors.success.main :
    isActive ? theme.colors.primary.main :
    theme.colors.neutral.light};
  transition: all 0.3s ease;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  grid-column: ${({ fullWidth }) => fullWidth ? '1 / -1' : 'auto'};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} 48px;
  background: ${({ theme }) => theme.colors.background.main};
  border: 2px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error.main : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.secondary};
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  z-index: 1;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const PasswordStrength = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const StrengthBar = styled.div`
  flex: 1;
  height: 4px;
  background: ${({ isActive, strength, theme }) => {
    if (!isActive) return theme.colors.neutral.light;
    if (strength === 'weak') return theme.colors.error.main;
    if (strength === 'medium') return theme.colors.warning.main;
    return theme.colors.success.main;
  }};
  border-radius: 2px;
  transition: all 0.3s ease;
`;

const CheckboxField = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  line-height: 1.5;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: ${({ theme }) => theme.colors.primary.main};
`;

const CheckboxText = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  &:hover {
    text-decoration: underline;
  }
`;

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    address: '',
    city: '',
    zipCode: '',
    acceptTerms: false,
    acceptMarketing: false
  });

  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'weak';
    if (password.length < 10 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'medium';
    return 'strong';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to customer profile setup
      navigate('/customer-profile-setup');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <RegisterContainer>
      <LeftPanel
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <BrandSection>
          <Logo>OMNIX AI</Logo>
          <Tagline>Your Personal Shopping Assistant</Tagline>
          <Description>
            Join thousands of customers who have revolutionized their shopping experience with AI-powered personalization and smart recommendations.
          </Description>
          
          <FeatureList>
            <FeatureItem>
              <CheckCircle size={20} />
              <span>AI-driven product recommendations</span>
            </FeatureItem>
            <FeatureItem>
              <CheckCircle size={20} />
              <span>Smart shopping list generation</span>
            </FeatureItem>
            <FeatureItem>
              <CheckCircle size={20} />
              <span>Personalized deals and offers</span>
            </FeatureItem>
            <FeatureItem>
              <CheckCircle size={20} />
              <span>Consumption pattern insights</span>
            </FeatureItem>
          </FeatureList>
        </BrandSection>
      </LeftPanel>

      <RightPanel>
        <FormContainer
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <FormHeader>
            <FormTitle>Create Your Account</FormTitle>
            <FormSubtitle>Start your personalized shopping journey</FormSubtitle>
          </FormHeader>

          <ProgressIndicator>
            <ProgressStep isCompleted={step > 1} isActive={step === 1} />
            <ProgressStep isCompleted={false} isActive={step === 2} />
          </ProgressIndicator>

          <Form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FormGrid>
                  <FormField>
                    <Label>First Name</Label>
                    <InputWrapper>
                      <InputIcon><User size={18} /></InputIcon>
                      <Input
                        type="text"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        hasError={errors.firstName}
                      />
                    </InputWrapper>
                    {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
                  </FormField>

                  <FormField>
                    <Label>Last Name</Label>
                    <InputWrapper>
                      <InputIcon><User size={18} /></InputIcon>
                      <Input
                        type="text"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        hasError={errors.lastName}
                      />
                    </InputWrapper>
                    {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
                  </FormField>
                </FormGrid>

                <FormField fullWidth>
                  <Label>Email Address</Label>
                  <InputWrapper>
                    <InputIcon><Mail size={18} /></InputIcon>
                    <Input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      hasError={errors.email}
                    />
                  </InputWrapper>
                  {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </FormField>

                <FormField fullWidth>
                  <Label>Phone Number</Label>
                  <InputWrapper>
                    <InputIcon><Phone size={18} /></InputIcon>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      hasError={errors.phone}
                    />
                  </InputWrapper>
                  {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
                </FormField>

                <FormField fullWidth>
                  <Label>Date of Birth</Label>
                  <InputWrapper>
                    <InputIcon><Calendar size={18} /></InputIcon>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </InputWrapper>
                </FormField>

                <SubmitButton
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                  <ArrowRight size={18} />
                </SubmitButton>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FormField fullWidth>
                  <Label>Password</Label>
                  <InputWrapper>
                    <InputIcon><Lock size={18} /></InputIcon>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      hasError={errors.password}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </PasswordToggle>
                  </InputWrapper>
                  {formData.password && (
                    <PasswordStrength>
                      <StrengthBar isActive strength={passwordStrength} />
                      <StrengthBar isActive={passwordStrength !== 'weak'} strength={passwordStrength} />
                      <StrengthBar isActive={passwordStrength === 'strong'} strength={passwordStrength} />
                    </PasswordStrength>
                  )}
                  {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </FormField>

                <FormField fullWidth>
                  <Label>Confirm Password</Label>
                  <InputWrapper>
                    <InputIcon><Shield size={18} /></InputIcon>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      hasError={errors.confirmPassword}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </PasswordToggle>
                  </InputWrapper>
                  {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
                </FormField>

                <FormGrid>
                  <FormField>
                    <Label>Address</Label>
                    <InputWrapper>
                      <InputIcon><MapPin size={18} /></InputIcon>
                      <Input
                        type="text"
                        name="address"
                        placeholder="123 Main St"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </InputWrapper>
                  </FormField>

                  <FormField>
                    <Label>City</Label>
                    <InputWrapper>
                      <InputIcon><MapPin size={18} /></InputIcon>
                      <Input
                        type="text"
                        name="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </InputWrapper>
                  </FormField>
                </FormGrid>

                <CheckboxField>
                  <Checkbox
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                  />
                  <CheckboxText>
                    I agree to the <StyledLink to="/terms">Terms of Service</StyledLink> and{' '}
                    <StyledLink to="/privacy">Privacy Policy</StyledLink>
                  </CheckboxText>
                </CheckboxField>
                {errors.acceptTerms && <ErrorMessage>{errors.acceptTerms}</ErrorMessage>}

                <CheckboxField>
                  <Checkbox
                    type="checkbox"
                    name="acceptMarketing"
                    checked={formData.acceptMarketing}
                    onChange={handleInputChange}
                  />
                  <CheckboxText>
                    I would like to receive personalized offers and updates via email
                  </CheckboxText>
                </CheckboxField>

                <SubmitButton
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Creating Account...' : (
                    <>
                      <UserPlus size={18} />
                      Create Account
                    </>
                  )}
                </SubmitButton>
              </motion.div>
            )}
          </Form>

          <LoginLink>
            Already have an account?{' '}
            <StyledLink to="/login">Sign in here</StyledLink>
          </LoginLink>
        </FormContainer>
      </RightPanel>
    </RegisterContainer>
  );
};

export default CustomerRegister;