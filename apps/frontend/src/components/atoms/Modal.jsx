import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Icon from './Icon';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme?.colors?.background?.overlay || 'rgba(0, 0, 0, 0.5)'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme?.spacing?.[4] || '1rem'};
`;

const ModalContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['size', 'fullScreen'].includes(prop)
})`
  background: ${props => props.theme?.colors?.background?.elevated || '#f8fafc'};
  border-radius: ${props => props.theme?.spacing?.[3] || '0.75rem'};
  box-shadow: ${props => props.theme.shadows?.modal || '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'};
  position: relative;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  ${props => getModalSize(props.size, props.theme)}
  ${props => props.fullScreen && css`
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  `}
  
  @media (max-width: ${props => props.theme?.breakpoints?.md || '768px'}) {
    width: 100%;
    max-width: calc(100vw - ${props => props.theme?.spacing?.[8] || '2rem'});
    max-height: calc(100vh - ${props => props.theme?.spacing?.[8] || '2rem'});
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.25;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.theme.spacing[8]};
  height: ${props => props.theme.spacing[8]};
  border: none;
  background: transparent;
  border-radius: ${props => props.theme.spacing[2]};
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
    color: ${props => props.theme.colors.text.primary};
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing[6]};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]} ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  flex-shrink: 0;
`;

const getModalSize = (size, theme) => {
  switch (size) {
    case 'sm':
      return css`
        width: 400px;
        max-width: 400px;
      `;
    case 'md':
      return css`
        width: 500px;
        max-width: 500px;
      `;
    case 'lg':
      return css`
        width: 700px;
        max-width: 700px;
      `;
    case 'xl':
      return css`
        width: 900px;
        max-width: 900px;
      `;
    case 'auto':
      return css`
        width: auto;
        max-width: 90vw;
      `;
    default: // md
      return css`
        width: 500px;
        max-width: 500px;
      `;
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  fullScreen = false,
  closeOnOverlayClick = true,
  closeOnEscapeKey = true,
  showCloseButton = true,
  ...props
}) => {
  useEffect(() => {
    if (!closeOnEscapeKey) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscapeKey]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleOverlayClick}
          {...props}
        >
          <ModalContainer
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            size={size}
            fullScreen={fullScreen}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <Header>
                {title && <Title>{title}</Title>}
                {showCloseButton && (
                  <CloseButton onClick={onClose} aria-label="Close modal">
                    <Icon name="x" size={20} />
                  </CloseButton>
                )}
              </Header>
            )}
            
            <Content>
              {children}
            </Content>
            
            {footer && (
              <Footer>
                {footer}
              </Footer>
            )}
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default Modal;