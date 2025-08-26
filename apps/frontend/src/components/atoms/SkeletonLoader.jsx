import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonBase = styled.div`
  display: inline-block;
  height: ${props => props.height || '1rem'};
  width: ${props => props.width || '100%'};
  background: linear-gradient(90deg, 
    ${props => props.theme.colors.background.secondary} 25%, 
    ${props => props.theme.colors.border.default} 37%, 
    ${props => props.theme.colors.background.secondary} 63%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
  border-radius: ${props => props.rounded ? '50%' : '4px'};
`;

const SkeletonText = styled(SkeletonBase)`
  height: 1em;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SkeletonCard = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 8px;
  padding: 1rem;
  
  > * {
    margin-bottom: 0.75rem;
  }
  
  > *:last-child {
    margin-bottom: 0;
  }
`;

export const Skeleton = ({ 
  width, 
  height, 
  rounded = false, 
  className 
}) => (
  <SkeletonBase 
    width={width} 
    height={height} 
    rounded={rounded} 
    className={className} 
  />
);

export const SkeletonLoader = {
  Text: SkeletonText,
  Card: SkeletonCard,
  Base: SkeletonBase
};

export default SkeletonLoader;