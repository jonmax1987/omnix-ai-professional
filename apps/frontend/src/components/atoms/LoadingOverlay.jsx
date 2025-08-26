import styled from 'styled-components';
import Spinner from './Spinner';

const Overlay = styled.div`
  position: ${props => props.absolute ? 'absolute' : 'fixed'};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.colors.background.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const LoadingContainer = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  padding: 2rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: ${props => props.theme.shadows.lg};
`;

const LoadingText = styled.p`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const LoadingOverlay = ({ 
  message = 'Loading...', 
  absolute = false,
  className 
}) => {
  return (
    <Overlay absolute={absolute} className={className}>
      <LoadingContainer>
        <Spinner size={32} />
        <LoadingText>{message}</LoadingText>
      </LoadingContainer>
    </Overlay>
  );
};

export default LoadingOverlay;