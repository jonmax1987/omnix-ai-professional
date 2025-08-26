import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import Typography from './Typography';

// AI-themed glow animation
const aiGlowKeyframes = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(14, 165, 233, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(14, 165, 233, 0.6), 0 0 30px rgba(14, 165, 233, 0.3);
  }
`;

// Data pulse animation for AI processing
const dataPulseKeyframes = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressTrack = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'variant'].includes(prop)
})`
  width: 100%;
  height: ${props => getProgressHeight(props.size)};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  overflow: hidden;
  position: relative;
  
  ${props => props.variant === 'ai' && css`
    background: linear-gradient(90deg,
      ${props.theme.colors.gray[100]} 0%,
      ${props.theme.colors.gray[50]} 50%,
      ${props.theme.colors.gray[100]} 100%
    );
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  `}
`;

const ProgressFill = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['variant', 'status', 'animated', 'value'].includes(prop)
})`
  height: 100%;
  border-radius: ${props => props.theme.spacing[1]};
  position: relative;
  overflow: hidden;
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeOut};
  
  ${props => getProgressVariantStyles(props.variant, props.theme, props.status)}
  
  ${props => props.animated && props.variant === 'ai' && css`
    animation: ${aiGlowKeyframes} 2s ease-in-out infinite;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 100%
      );
      background-size: 200px 100%;
      animation: ${dataPulseKeyframes} 2s infinite linear;
    }
  `}
  
  ${props => props.status === 'processing' && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.3) 30%,
        rgba(255, 255, 255, 0.5) 50%,
        rgba(255, 255, 255, 0.3) 70%,
        transparent 100%
      );
      background-size: 100px 100%;
      animation: ${dataPulseKeyframes} 1.5s infinite linear;
    }
  `}
`;

const ProgressLabel = styled(Typography)`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ProgressValue = styled(Typography)`
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const AIIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  color: ${props => props.theme.colors.primary[600]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const AIIcon = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary[500]};
`;

const getProgressHeight = (size) => {
  switch (size) {
    case 'sm':
      return '4px';
    case 'lg':
      return '12px';
    default: // md
      return '8px';
  }
};

const getProgressVariantStyles = (variant, theme, status) => {
  const baseStyles = css`
    background: ${theme.colors.primary[500]};
  `;
  
  switch (variant) {
    case 'success':
      return css`
        background: linear-gradient(90deg,
          ${theme.colors.green[400]} 0%,
          ${theme.colors.green[500]} 100%
        );
      `;
      
    case 'warning':
      return css`
        background: linear-gradient(90deg,
          ${theme.colors.yellow[400]} 0%,
          ${theme.colors.yellow[500]} 100%
        );
      `;
      
    case 'error':
      return css`
        background: linear-gradient(90deg,
          ${theme.colors.red[400]} 0%,
          ${theme.colors.red[500]} 100%
        );
      `;
      
    case 'ai':
      return css`
        background: linear-gradient(90deg,
          ${theme.colors.primary[400]} 0%,
          ${theme.colors.primary[500]} 50%,
          ${theme.colors.primary[600]} 100%
        );
        box-shadow: 0 0 10px rgba(14, 165, 233, 0.3);
        
        ${status === 'processing' && css`
          background: linear-gradient(90deg,
            ${theme.colors.primary[500]} 0%,
            ${theme.colors.primary[600]} 25%,
            ${theme.colors.primary[700]} 50%,
            ${theme.colors.primary[600]} 75%,
            ${theme.colors.primary[500]} 100%
          );
          background-size: 200% 100%;
          animation: ${dataPulseKeyframes} 2s infinite linear;
        `}
      `;
      
    case 'gradient':
      return css`
        background: linear-gradient(90deg,
          ${theme.colors.primary[500]} 0%,
          ${theme.colors.primary[600]} 25%,
          ${theme.colors.secondary[500]} 75%,
          ${theme.colors.secondary[600]} 100%
        );
      `;
      
    default:
      return baseStyles;
  }
};

const aiIconVariants = {
  idle: {
    scale: 1,
    opacity: 0.7,
  },
  processing: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const Progress = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  status = 'idle',
  label,
  showValue = true,
  showPercentage = true,
  animated = true,
  aiMode = false,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isProcessing = status === 'processing';
  const displayVariant = aiMode ? 'ai' : variant;
  
  return (
    <ProgressContainer className={className} {...props}>
      {(label || showValue) && (
        <ProgressInfo>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {label && <ProgressLabel>{label}</ProgressLabel>}
            {aiMode && (
              <AIIndicator>
                <AIIcon
                  variants={aiIconVariants}
                  animate={isProcessing ? 'processing' : 'idle'}
                />
                AI {isProcessing ? 'Processing' : 'Ready'}
              </AIIndicator>
            )}
          </div>
          {showValue && (
            <ProgressValue>
              {showPercentage ? `${Math.round(percentage)}%` : `${value}/${max}`}
            </ProgressValue>
          )}
        </ProgressInfo>
      )}
      
      <ProgressTrack size={size} variant={displayVariant}>
        <ProgressFill
          variant={displayVariant}
          status={status}
          animated={animated}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={
            animated
              ? {
                  duration: 0.8,
                  ease: 'easeOut',
                  type: 'spring',
                  damping: 20,
                  stiffness: 100,
                }
              : { duration: 0 }
          }
        />
      </ProgressTrack>
    </ProgressContainer>
  );
};

export default Progress;