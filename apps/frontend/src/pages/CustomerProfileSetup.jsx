import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Camera,
  MapPin,
  Heart,
  ShoppingCart,
  Users,
  Clock,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Upload,
  X,
  Plus
} from 'lucide-react';

const SetupContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary.light}05 0%, 
    ${({ theme }) => theme.colors.secondary.light}05 100%);
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin: 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.neutral.light};
  border-radius: 4px;
  margin: ${({ theme }) => theme.spacing.xl} 0;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, 
    ${({ theme }) => theme.colors.primary.main}, 
    ${({ theme }) => theme.colors.secondary.main});
  border-radius: 4px;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StepCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ isActive, isCompleted, theme }) => 
    isCompleted ? theme.colors.success.main :
    isActive ? theme.colors.primary.main :
    theme.colors.neutral.light};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
`;

const StepLabel = styled.span`
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ isActive, theme }) => 
    isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
`;

const CardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ theme, hasImage }) => 
    hasImage ? 'transparent' : `linear-gradient(135deg, ${theme.colors.primary.light}, ${theme.colors.secondary.light})`};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 4px solid ${({ theme }) => theme.colors.surface.primary};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarUpload = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: scale(1.1);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const TagSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Tag = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ isSelected, theme }) => 
    isSelected ? theme.colors.primary.main : theme.colors.background.main};
  color: ${({ isSelected, theme }) => 
    isSelected ? 'white' : theme.colors.text.secondary};
  border: 2px solid ${({ isSelected, theme }) => 
    isSelected ? theme.colors.primary.main : theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ isSelected, theme }) => 
      isSelected ? theme.colors.primary.dark : theme.colors.primary.light}10;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main :
    variant === 'secondary' ? theme.colors.surface.secondary :
    'transparent'};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? 'white' :
    variant === 'secondary' ? theme.colors.text.primary :
    theme.colors.text.secondary};
  border: 2px solid ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main :
    variant === 'secondary' ? theme.colors.neutral.border :
    'transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ variant, theme }) => 
      variant === 'primary' ? theme.colors.primary.dark :
      variant === 'secondary' ? theme.colors.neutral.hover :
      theme.colors.neutral.hover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CustomerProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarImage, setAvatarImage] = useState(null);
  
  const [profileData, setProfileData] = useState({
    // Personal Info
    displayName: '',
    bio: '',
    occupation: '',
    interests: [],
    
    // Shopping Preferences
    preferredCategories: [],
    budgetRange: '',
    shoppingFrequency: '',
    preferredBrands: [],
    
    // Lifestyle
    familySize: '1',
    hasChildren: false,
    dietaryRestrictions: [],
    healthGoals: [],
    lifestyle: '',
    
    // Communication
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacyLevel: 'balanced'
  });

  const steps = [
    { id: 1, label: 'Personal Info', icon: User },
    { id: 2, label: 'Preferences', icon: Heart },
    { id: 3, label: 'Lifestyle', icon: Users },
    { id: 4, label: 'Finish', icon: CheckCircle }
  ];

  const interests = [
    'Technology', 'Fitness', 'Cooking', 'Travel', 'Reading', 'Music',
    'Sports', 'Art', 'Fashion', 'Gaming', 'Gardening', 'Photography'
  ];

  const categories = [
    'Electronics', 'Groceries', 'Clothing', 'Home & Garden', 
    'Health & Beauty', 'Sports & Outdoors', 'Books', 'Toys'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Keto', 'Paleo', 'Low-Sodium', 'Organic'
  ];

  const healthGoals = [
    'Weight Loss', 'Muscle Gain', 'Heart Health', 'Energy Boost',
    'Better Sleep', 'Stress Relief', 'Immunity', 'Digestive Health'
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, item) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    console.log('Profile setup completed:', profileData);
    navigate('/customer-dashboard');
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <SetupContainer>
      <ContentWrapper>
        <Header>
          <Title>Complete Your Profile</Title>
          <Subtitle>Help us personalize your shopping experience</Subtitle>
        </Header>

        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </ProgressBar>

        <StepIndicator>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <StepItem key={step.id}>
                <StepCircle 
                  isActive={currentStep === step.id}
                  isCompleted={currentStep > step.id}
                >
                  <Icon size={20} />
                </StepCircle>
                <StepLabel isActive={currentStep === step.id}>
                  {step.label}
                </StepLabel>
              </StepItem>
            );
          })}
        </StepIndicator>

        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <CardContainer
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle>
                <User size={24} />
                Personal Information
              </SectionTitle>

              <AvatarSection>
                <AvatarContainer>
                  <Avatar hasImage={!!avatarImage}>
                    {avatarImage ? (
                      <AvatarImage src={avatarImage} alt="Profile" />
                    ) : (
                      <User size={48} color="white" />
                    )}
                  </Avatar>
                  <AvatarUpload htmlFor="avatar-upload">
                    <Camera size={18} />
                  </AvatarUpload>
                  <HiddenInput
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </AvatarContainer>
              </AvatarSection>

              <FormGrid>
                <FormField>
                  <Label>Display Name</Label>
                  <Input
                    type="text"
                    placeholder="How should we call you?"
                    value={profileData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                  />
                </FormField>

                <FormField>
                  <Label>Occupation</Label>
                  <Input
                    type="text"
                    placeholder="Software Developer"
                    value={profileData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                  />
                </FormField>
              </FormGrid>

              <FormField>
                <Label>Bio</Label>
                <TextArea
                  placeholder="Tell us a bit about yourself..."
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              </FormField>

              <TagSection>
                <Label>Interests</Label>
                <TagGrid>
                  {interests.map((interest) => (
                    <Tag
                      key={interest}
                      isSelected={profileData.interests.includes(interest)}
                      onClick={() => handleArrayToggle('interests', interest)}
                      type="button"
                    >
                      {interest}
                    </Tag>
                  ))}
                </TagGrid>
              </TagSection>
            </CardContainer>
          )}

          {/* Step 2: Shopping Preferences */}
          {currentStep === 2 && (
            <CardContainer
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle>
                <Heart size={24} />
                Shopping Preferences
              </SectionTitle>

              <FormGrid>
                <FormField>
                  <Label>Budget Range (Monthly)</Label>
                  <Select
                    value={profileData.budgetRange}
                    onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                  >
                    <option value="">Select range</option>
                    <option value="under-500">Under $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2000">$1,000 - $2,000</option>
                    <option value="over-2000">Over $2,000</option>
                  </Select>
                </FormField>

                <FormField>
                  <Label>Shopping Frequency</Label>
                  <Select
                    value={profileData.shoppingFrequency}
                    onChange={(e) => handleInputChange('shoppingFrequency', e.target.value)}
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </FormField>
              </FormGrid>

              <TagSection>
                <Label>Preferred Categories</Label>
                <TagGrid>
                  {categories.map((category) => (
                    <Tag
                      key={category}
                      isSelected={profileData.preferredCategories.includes(category)}
                      onClick={() => handleArrayToggle('preferredCategories', category)}
                      type="button"
                    >
                      {category}
                    </Tag>
                  ))}
                </TagGrid>
              </TagSection>
            </CardContainer>
          )}

          {/* Step 3: Lifestyle */}
          {currentStep === 3 && (
            <CardContainer
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle>
                <Users size={24} />
                Lifestyle & Health
              </SectionTitle>

              <FormGrid>
                <FormField>
                  <Label>Family Size</Label>
                  <Select
                    value={profileData.familySize}
                    onChange={(e) => handleInputChange('familySize', e.target.value)}
                  >
                    <option value="1">Just me</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4">4 people</option>
                    <option value="5+">5+ people</option>
                  </Select>
                </FormField>

                <FormField>
                  <Label>Lifestyle</Label>
                  <Select
                    value={profileData.lifestyle}
                    onChange={(e) => handleInputChange('lifestyle', e.target.value)}
                  >
                    <option value="">Select lifestyle</option>
                    <option value="active">Very Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="busy">Always Busy</option>
                  </Select>
                </FormField>
              </FormGrid>

              <TagSection>
                <Label>Dietary Restrictions</Label>
                <TagGrid>
                  {dietaryOptions.map((option) => (
                    <Tag
                      key={option}
                      isSelected={profileData.dietaryRestrictions.includes(option)}
                      onClick={() => handleArrayToggle('dietaryRestrictions', option)}
                      type="button"
                    >
                      {option}
                    </Tag>
                  ))}
                </TagGrid>
              </TagSection>

              <TagSection>
                <Label>Health Goals</Label>
                <TagGrid>
                  {healthGoals.map((goal) => (
                    <Tag
                      key={goal}
                      isSelected={profileData.healthGoals.includes(goal)}
                      onClick={() => handleArrayToggle('healthGoals', goal)}
                      type="button"
                    >
                      {goal}
                    </Tag>
                  ))}
                </TagGrid>
              </TagSection>
            </CardContainer>
          )}

          {/* Step 4: Finish */}
          {currentStep === 4 && (
            <CardContainer
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle>
                <CheckCircle size={24} />
                All Set!
              </SectionTitle>

              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={64} color="#10B981" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
                  Profile Setup Complete!
                </h3>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
                  We're now ready to personalize your shopping experience with AI-powered recommendations.
                </p>
              </div>
            </CardContainer>
          )}
        </AnimatePresence>

        <NavigationButtons>
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              variant="primary"
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next
              <ArrowRight size={18} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleFinish}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
              <CheckCircle size={18} />
            </Button>
          )}
        </NavigationButtons>
      </ContentWrapper>
    </SetupContainer>
  );
};

export default CustomerProfileSetup;