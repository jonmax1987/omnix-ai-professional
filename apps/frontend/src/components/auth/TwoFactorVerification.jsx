import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const VerificationContainer = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.spacing[3]};
  border: 1px solid ${props => props.theme.colors.border.default};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const VerificationHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const SecurityIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary[500]}, 
    ${props => props.theme.colors.primary[600]}
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing[4]};
  color: white;
  box-shadow: 0 4px 12px ${props => props.theme.colors.primary[500]}30;
`;

const CodeInputContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  margin: ${props => props.theme.spacing[6]} 0;
`;

const CodeInput = styled(Input)`
  width: 45px;
  height: 50px;
  text-align: center;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  border: 2px solid ${props => props.hasError ? props.theme.colors.red[300] : props.theme.colors.border.default};
  
  &:focus {
    border-color: ${props => props.hasError ? props.theme.colors.red[500] : props.theme.colors.primary[500]};
    box-shadow: 0 0 0 2px ${props => props.hasError ? props.theme.colors.red[100] : props.theme.colors.primary[100]};
  }
  
  ${props => props.hasError && `
    animation: ${pulse} 0.5s ease-in-out;
    background: ${props.theme.colors.red[50]};
  `}
`;

const VerificationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
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
  text-align: center;
`;

const HelpSection = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
`;

const HelpButton = styled(Button)`
  margin-top: ${props => props.theme.spacing[2]};
`;

const BackupCodeInput = styled(Input)`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  text-align: center;
  letter-spacing: 2px;
`;

const TwoFactorVerification = ({
  onVerify,
  onCancel,
  isLoading = false,
  error = '',
  userEmail = '',
  className
}) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef([]);

  const maxAttempts = 3;
  const isBlocked = attempts >= maxAttempts;

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !showBackupCode) {
      inputRefs.current[0].focus();
    }
  }, [showBackupCode]);

  // Clear form when switching modes
  useEffect(() => {
    if (showBackupCode) {
      setVerificationCode(['', '', '', '', '', '']);
    } else {
      setBackupCode('');
    }
  }, [showBackupCode]);

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-submit when all 6 digits are entered
      if (newCode.every(digit => digit !== '') && !isLoading) {
        handleSubmit(null, newCode.join(''));
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedText.length > 0) {
      const newCode = pastedText.split('').concat(['', '', '', '', '', '']).slice(0, 6);
      setVerificationCode(newCode);
      
      // Focus the input after the pasted content
      const nextEmptyIndex = newCode.findIndex(digit => digit === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
      inputRefs.current[focusIndex]?.focus();
      
      // Auto-submit if all 6 digits
      if (pastedText.length === 6 && !isLoading) {
        handleSubmit(null, pastedText);
      }
    }
  };

  const handleSubmit = async (e, codeToSubmit = null) => {
    if (e) e.preventDefault();
    
    const code = codeToSubmit || (showBackupCode ? backupCode : verificationCode.join(''));
    
    if ((!showBackupCode && code.length !== 6) || (showBackupCode && !code.trim())) {
      return;
    }

    if (isBlocked) return;

    try {
      await onVerify({
        code: code.trim(),
        isBackupCode: showBackupCode
      });
    } catch (err) {
      setAttempts(prev => prev + 1);
      
      // Clear the form on error
      if (showBackupCode) {
        setBackupCode('');
      } else {
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const clearForm = () => {
    if (showBackupCode) {
      setBackupCode('');
    } else {
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <VerificationContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <VerificationHeader>
        <SecurityIcon>
          <Icon name="shield" size={28} />
        </SecurityIcon>
        
        <Typography variant="h4" weight="semibold" color="primary">
          Two-Factor Authentication
        </Typography>
        
        <Typography variant="body2" color="secondary" style={{ marginTop: '8px' }}>
          {userEmail && `Signing in as ${userEmail}`}
        </Typography>
        
        <Typography variant="body1" color="secondary" style={{ marginTop: '16px' }}>
          {showBackupCode 
            ? 'Enter one of your backup codes'
            : 'Enter the 6-digit code from your authenticator app'
          }
        </Typography>
      </VerificationHeader>

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

      {isBlocked && (
        <ErrorMessage
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Icon name="x-circle" size={16} />
          Too many failed attempts. Please try again later or use a backup code.
        </ErrorMessage>
      )}

      <VerificationForm onSubmit={handleSubmit}>
        {showBackupCode ? (
          <div style={{ textAlign: 'center' }}>
            <BackupCodeInput
              type="text"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              placeholder="BACKUP-CODE-123"
              disabled={isLoading || isBlocked}
              maxLength={16}
              style={{ margin: '24px 0' }}
            />
          </div>
        ) : (
          <CodeInputContainer>
            {verificationCode.map((digit, index) => (
              <CodeInput
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                maxLength={1}
                disabled={isLoading || isBlocked}
                hasError={error && attempts > 0}
                autoComplete="one-time-code"
              />
            ))}
          </CodeInputContainer>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          
          {showBackupCode && (
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !backupCode.trim() || isBlocked}
              style={{ flex: 1 }}
            >
              {isLoading ? (
                <>
                  <Icon name="loader" size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          )}
        </div>
      </VerificationForm>

      <HelpSection>
        {!showBackupCode ? (
          <>
            <Typography variant="body2" color="secondary">
              Don't have access to your authenticator app?
            </Typography>
            <HelpButton
              variant="ghost"
              size="sm"
              onClick={() => setShowBackupCode(true)}
              disabled={isLoading}
            >
              Use a backup code instead
            </HelpButton>
          </>
        ) : (
          <>
            <Typography variant="body2" color="secondary">
              Want to use your authenticator app instead?
            </Typography>
            <HelpButton
              variant="ghost"
              size="sm"
              onClick={() => setShowBackupCode(false)}
              disabled={isLoading}
            >
              Use authenticator code
            </HelpButton>
          </>
        )}
        
        <div style={{ marginTop: '16px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearForm}
            disabled={isLoading}
          >
            <Icon name="refresh-cw" size={14} />
            Clear form
          </Button>
        </div>
      </HelpSection>

      {attempts > 0 && attempts < maxAttempts && (
        <Typography variant="caption" color="warning" align="center" style={{ marginTop: '16px' }}>
          {maxAttempts - attempts} attempt{maxAttempts - attempts !== 1 ? 's' : ''} remaining
        </Typography>
      )}
    </VerificationContainer>
  );
};

export default TwoFactorVerification;