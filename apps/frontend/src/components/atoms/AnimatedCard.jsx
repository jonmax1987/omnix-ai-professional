import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.animation.duration.standard} ${props => props.theme.animation.easing.easeInOut};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  
  &:hover {
    ${props => props.clickable && `
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.md};
      border-color: ${props.theme.colors.primary[300]};
    `}
  }
`;

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

const AnimatedCard = ({ 
  children, 
  clickable = false, 
  onClick,
  delay = 0,
  className,
  ...props 
}) => {
  return (
    <CardContainer
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={clickable ? "hover" : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      clickable={clickable}
      onClick={onClick}
      className={className}
      style={{ 
        animationDelay: `${delay}s`,
        animationFillMode: 'both'
      }}
      {...props}
    >
      {children}
    </CardContainer>
  );
};

export default AnimatedCard;