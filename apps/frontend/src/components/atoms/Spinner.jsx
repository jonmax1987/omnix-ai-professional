import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: inline-block;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

const SpinnerCircle = styled.div`
  width: 100%;
  height: 100%;
  border: 2px solid ${props => props.theme?.colors?.border?.default || '#e2e8f0'};
  border-top: 2px solid ${props => props.color || props.theme?.colors?.primary?.[600] || '#2563eb'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Spinner = ({ 
  size = 24, 
  color,
  className 
}) => {
  return (
    <SpinnerContainer size={size} className={className}>
      <SpinnerCircle color={color} />
    </SpinnerContainer>
  );
};

export default Spinner;