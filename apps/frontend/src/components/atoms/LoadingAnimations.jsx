import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

// Pulse animation for loading states
const pulseKeyframes = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
`;

const PulseLoader = styled.div`
  animation: ${pulseKeyframes} 1.5s ease-in-out infinite;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[1]};
  height: ${props => props.height || '20px'};
  width: ${props => props.width || '100%'};
`;

// Skeleton loader with shimmer effect
const shimmerKeyframes = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonLoader = styled.div`
  background: linear-gradient(90deg, 
    ${props => props.theme.colors.background.secondary} 0px, 
    ${props => props.theme.colors.border.subtle} 50px, 
    ${props => props.theme.colors.background.secondary} 100px
  );
  background-size: 200px 100%;
  animation: ${shimmerKeyframes} 1.5s infinite linear;
  border-radius: ${props => props.theme.spacing[1]};
  height: ${props => props.height || '20px'};
  width: ${props => props.width || '100%'};
`;

// Bouncing dots loader
const DotsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  align-items: center;
  justify-content: center;
`;

const Dot = styled(motion.div)`
  width: 8px;
  height: 8px;
  background: ${props => props.theme.colors.primary[500]};
  border-radius: 50%;
`;

const dotVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 0, -10],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const DotsLoader = ({ size = 8, color }) => {
  return (
    <DotsContainer>
      {[0, 1, 2].map((index) => (
        <Dot
          key={index}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            animationDelay: `${index * 0.2}s`
          }}
        />
      ))}
    </DotsContainer>
  );
};

// Spinning loader
const SpinContainer = styled(motion.div)`
  display: inline-block;
  width: ${props => props.size || 20}px;
  height: ${props => props.size || 20}px;
  border: 2px solid ${props => props.theme.colors.border.subtle};
  border-top: 2px solid ${props => props.theme.colors.primary[500]};
  border-radius: 50%;
`;

const spinVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const SpinLoader = ({ size = 20, className }) => {
  return (
    <SpinContainer
      size={size}
      variants={spinVariants}
      animate="animate"
      className={className}
    />
  );
};

// Wave loader
const WaveContainer = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
  justify-content: center;
`;

const WaveBar = styled(motion.div)`
  width: 4px;
  height: ${props => props.height || 20}px;
  background: ${props => props.theme.colors.primary[500]};
  border-radius: 2px;
`;

const waveVariants = {
  initial: { scaleY: 1 },
  animate: {
    scaleY: [1, 2, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const WaveLoader = ({ bars = 5, height = 20 }) => {
  return (
    <WaveContainer>
      {Array.from({ length: bars }).map((_, index) => (
        <WaveBar
          key={index}
          height={height}
          variants={waveVariants}
          initial="initial"
          animate="animate"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </WaveContainer>
  );
};

// Progress bar animation
const ProgressContainer = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: ${props => props.theme.colors.primary[500]};
  border-radius: 2px;
`;

export const ProgressLoader = ({ progress = 0, animated = true }) => {
  return (
    <ProgressContainer>
      <ProgressBar
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={animated ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
      />
    </ProgressContainer>
  );
};

// Fade in animation component
const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

export const FadeInAnimation = ({ children, delay = 0, className, ...props }) => {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: 'both'
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Scale in animation component
const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'backOut'
    }
  }
};

export const ScaleInAnimation = ({ children, delay = 0, className, ...props }) => {
  return (
    <motion.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: 'both'
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export { PulseLoader, SkeletonLoader };