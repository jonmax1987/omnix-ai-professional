import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import useUserStore from '../../store/userStore';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const SetupContainer = styled(motion.div)`
  max-width: 500px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const SetupHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const Step = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.active) return props.theme.colors.primary[500];
    if (props.completed) return props.theme.colors.green[500];
    return props.theme.colors.gray[200];
  }};
  color: ${props => props.active || props.completed ? 'white' : props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: all ${props => props.theme.animation.duration.normal};
`;

const StepContent = styled(motion.div)`
  min-height: 400px;
`;

const QRCodeContainer = styled.div`
  text-align: center;
  margin: ${props => props.theme.spacing[6]} 0;
`;

const QRCodeImage = styled.img`
  max-width: 200px;
  width: 100%;
  height: auto;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  background: white;
  padding: ${props => props.theme.spacing[2]};
`;

const QRCodeSkeleton = styled.div`
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${props => props.theme.spacing[2]};
`;

const SecretKey = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[3]};
  margin: ${props => props.theme.spacing[4]} 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: ${props => props.theme.typography.fontSize.sm};
  word-break: break-all;
  position: relative;
`;

const CopyButton = styled(Button)`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
`;

const BackupCodes = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[4]};
  margin: ${props => props.theme.spacing[4]} 0;
`;

const BackupCodeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[3]};
`;

const BackupCode = styled.div`
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[2]};
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const VerificationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  margin-top: ${props => props.theme.spacing[4]};
`;

const CodeInputContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  margin: ${props => props.theme.spacing[4]} 0;
`;

const CodeInput = styled(Input)`
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
`;

const ErrorMessage = styled(motion.div)`
  background: ${props => props.theme.colors.red[50]};
  color: ${props => props.theme.colors.red[700]};
  border: 1px solid ${props => props.theme.colors.red[200]};
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[3]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const SuccessMessage = styled(motion.div)`
  background: ${props => props.theme.colors.green[50]};
  color: ${props => props.theme.colors.green[700]};
  border: 1px solid ${props => props.theme.colors.green[200]};
  border-radius: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[3]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
  text-align: center;
`;

const StepActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing[6]};
  gap: ${props => props.theme.spacing[3]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column-reverse;
    
    > * {
      width: 100%;
    }
  }
`;

const TwoFactorSetup = ({ 
  isOpen,
  onClose,
  onComplete,
  className 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  const { enableTwoFactor, verifyTwoFactor, loading, errors } = useUserStore();

  // Initialize 2FA setup
  useEffect(() => {
    if (isOpen && currentStep === 1 && !setupData) {
      initializeSetup();
    }
  }, [isOpen, currentStep, setupData]);

  const initializeSetup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await enableTwoFactor();
      if (result.success) {
        setSetupData(result.data);
      } else {
        setError(result.error || 'Failed to initialize 2FA setup');
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else if (type === 'backup') {
        setCopiedBackupCodes(true);
        setTimeout(() => setCopiedBackupCodes(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyTwoFactor(code);
      if (result.success) {
        setIsSetupComplete(true);
        setTimeout(() => {
          onComplete?.();
          onClose?.();
        }, 2000);
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepContent
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Typography variant="h5" weight="semibold" align="center" color="primary">
              Set up Authenticator App
            </Typography>
            
            <Typography variant="body1" color="secondary" align="center" style={{ margin: '16px 0 24px' }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </Typography>

            <QRCodeContainer>
              {isLoading || !setupData?.qrCode ? (
                <QRCodeSkeleton />
              ) : (
                <QRCodeImage src={setupData.qrCode} alt="2FA QR Code" />
              )}
            </QRCodeContainer>

            {setupData?.secret && (
              <>
                <Typography variant="body2" color="secondary" align="center">
                  Can't scan? Enter this code manually:
                </Typography>
                
                <SecretKey>
                  {setupData.secret}
                  <CopyButton
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(setupData.secret, 'secret')}
                  >
                    <Icon name={copiedSecret ? 'check' : 'copy'} size={14} />
                  </CopyButton>
                </SecretKey>
              </>
            )}

            <StepActions>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={nextStep}
                disabled={isLoading || !setupData}
              >
                I've Added the Account
              </Button>
            </StepActions>
          </StepContent>
        );

      case 2:
        return (
          <StepContent
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Typography variant="h5" weight="semibold" align="center" color="primary">
              Verify Your Setup
            </Typography>
            
            <Typography variant="body1" color="secondary" align="center" style={{ margin: '16px 0 24px' }}>
              Enter the 6-digit code from your authenticator app to verify the setup
            </Typography>

            {error && (
              <ErrorMessage
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Icon name="alert-circle" size={16} />
                {error}
              </ErrorMessage>
            )}

            {isSetupComplete && (
              <SuccessMessage
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Icon name="check-circle" size={16} />
                Two-factor authentication has been successfully enabled!
              </SuccessMessage>
            )}

            <VerificationForm onSubmit={handleVerification}>
              <CodeInputContainer>
                {verificationCode.map((digit, index) => (
                  <CodeInput
                    key={index}
                    data-index={index}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength={1}
                    disabled={isLoading || isSetupComplete}
                  />
                ))}
              </CodeInputContainer>

              <StepActions>
                <Button variant="outline" onClick={prevStep} disabled={isLoading || isSetupComplete}>
                  Back
                </Button>
                <Button 
                  type="submit"
                  variant="primary"
                  disabled={isLoading || verificationCode.join('').length !== 6 || isSetupComplete}
                >
                  {isLoading ? (
                    <>
                      <Icon name="loader" size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Enable 2FA'
                  )}
                </Button>
              </StepActions>
            </VerificationForm>
          </StepContent>
        );

      case 3:
        return (
          <StepContent
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Typography variant="h5" weight="semibold" align="center" color="primary">
              Save Backup Codes
            </Typography>
            
            <Typography variant="body1" color="secondary" align="center" style={{ margin: '16px 0 24px' }}>
              Save these backup codes in a safe place. You can use them to access your account if you lose your device.
            </Typography>

            <BackupCodes>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Typography variant="subtitle2" weight="semibold">
                  Backup Codes
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(setupData?.backupCodes?.join('\n'), 'backup')}
                >
                  <Icon name={copiedBackupCodes ? 'check' : 'copy'} size={14} />
                  {copiedBackupCodes ? 'Copied!' : 'Copy All'}
                </Button>
              </div>
              
              <BackupCodeGrid>
                {setupData?.backupCodes?.map((code, index) => (
                  <BackupCode key={index}>
                    {code}
                  </BackupCode>
                ))}
              </BackupCodeGrid>
            </BackupCodes>

            <div style={{ 
              background: '#fef3c7', 
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              gap: '12px'
            }}>
              <Icon name="alert-triangle" size={20} color="#f59e0b" />
              <div>
                <Typography variant="subtitle2" weight="semibold" color="#92400e">
                  Important Security Notice
                </Typography>
                <Typography variant="body2" color="#92400e" style={{ marginTop: '4px' }}>
                  Keep these codes secure and private. Each code can only be used once and provides full account access.
                </Typography>
              </div>
            </div>

            <StepActions>
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  onComplete?.();
                  onClose?.();
                }}
              >
                I've Saved My Codes
              </Button>
            </StepActions>
          </StepContent>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <SetupContainer
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <SetupHeader>
        <StepIndicator>
          {[1, 2, 3].map(step => (
            <Step
              key={step}
              active={step === currentStep}
              completed={step < currentStep || isSetupComplete}
            >
              {step < currentStep || isSetupComplete ? (
                <Icon name="check" size={16} />
              ) : (
                step
              )}
            </Step>
          ))}
        </StepIndicator>
        
        <Typography variant="caption" color="secondary" align="center">
          Step {currentStep} of 3
        </Typography>
      </SetupHeader>

      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>
    </SetupContainer>
  );
};

export default TwoFactorSetup;