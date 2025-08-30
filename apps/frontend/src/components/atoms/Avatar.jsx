import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useState } from 'react';

const AvatarContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['size', 'square', 'clickable', 'bordered'].includes(prop)
})`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => getAvatarSize(props.size)};
  height: ${props => getAvatarSize(props.size)};
  border-radius: ${props => props.square ? props.theme.spacing[2] : '50%'};
  background-color: ${props => props.theme.colors.gray[200]};
  overflow: hidden;
  flex-shrink: 0;
  
  ${props => props.clickable && css`
    cursor: pointer;
    
    &:hover {
      transform: scale(1.05);
    }
  `}
  
  ${props => props.bordered && css`
    border: 2px solid ${props.theme.colors.background.elevated};
    box-shadow: ${props.theme.shadows.sm};
  `}
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
`;

const AvatarFallback = styled.div.withConfig({
  shouldForwardProp: (prop) => !['name', 'size'].includes(prop)
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: ${props => getAvatarBackground(props.name, props.theme)};
  color: ${props => props.theme.colors.text.inverse};
  font-family: ${props => props.theme?.typography?.fontFamily?.sans?.join(', ') || 'Inter, system-ui, sans-serif'};
  font-size: ${props => getAvatarFontSize(props.size, props.theme)};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  user-select: none;
`;

const StatusIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status', 'avatarSize'].includes(prop)
})`
  position: absolute;
  bottom: 0;
  right: 0;
  width: ${props => getStatusSize(props.avatarSize)};
  height: ${props => getStatusSize(props.avatarSize)};
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.background.elevated};
  
  ${props => getStatusColor(props.status, props.theme)}
`;

const NotificationBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => !['avatarSize'].includes(prop)
})`
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: ${props => props.avatarSize === 'xs' ? '12px' : '16px'};
  height: ${props => props.avatarSize === 'xs' ? '12px' : '16px'};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.red[500]};
  color: ${props => props.theme.colors.text.inverse};
  border: 1px solid ${props => props.theme.colors.background.elevated};
  border-radius: 50%;
  font-size: ${props => props.avatarSize === 'xs' ? '8px' : '10px'};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  line-height: 1;
`;

const getAvatarSize = (size) => {
  const sizes = {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
    '2xl': '80px'
  };
  return sizes[size] || sizes.md;
};

const getAvatarFontSize = (size, theme) => {
  const fontSizes = {
    xs: theme.typography.fontSize.xs,
    sm: theme.typography.fontSize.sm,
    md: theme.typography.fontSize.base,
    lg: theme.typography.fontSize.lg,
    xl: theme.typography.fontSize.xl,
    '2xl': theme.typography.fontSize['2xl']
  };
  return fontSizes[size] || fontSizes.md;
};

const getStatusSize = (avatarSize) => {
  const sizes = {
    xs: '8px',
    sm: '10px',
    md: '12px',
    lg: '14px',
    xl: '16px',
    '2xl': '20px'
  };
  return sizes[avatarSize] || sizes.md;
};

const getStatusColor = (status, theme) => {
  switch (status) {
    case 'online':
      return css`background-color: ${theme.colors.green[500]};`;
    case 'away':
      return css`background-color: ${theme.colors.yellow[500]};`;
    case 'busy':
      return css`background-color: ${theme.colors.red[500]};`;
    case 'offline':
      return css`background-color: ${theme.colors.gray[400]};`;
    default:
      return css`display: none;`;
  }
};

const getAvatarBackground = (name, theme) => {
  if (!name) return theme.colors.gray[500];
  
  const colors = [
    theme.colors.primary[500],
    theme.colors.green[500],
    theme.colors.red[500],
    theme.colors.yellow[500],
    theme.colors.primary[600],
    theme.colors.green[600],
    theme.colors.red[600]
  ];
  
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const getInitials = (name) => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
};

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  square = false,
  bordered = false,
  clickable = false,
  status,
  notification,
  className,
  onClick,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const showFallback = !src || imageError;
  const initials = getInitials(name || alt);

  return (
    <AvatarContainer
      size={size}
      square={square}
      bordered={bordered}
      clickable={clickable}
      className={className}
      onClick={onClick}
      whileHover={clickable ? { scale: 1.05 } : undefined}
      whileTap={clickable ? { scale: 0.95 } : undefined}
      {...props}
    >
      {!showFallback && (
        <AvatarImage
          src={src}
          alt={alt || name || 'Avatar'}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ 
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
      )}
      
      {showFallback && (
        <AvatarFallback name={name} size={size}>
          {initials}
        </AvatarFallback>
      )}
      
      {status && (
        <StatusIndicator status={status} avatarSize={size} />
      )}
      
      {notification && (
        <NotificationBadge avatarSize={size}>
          {typeof notification === 'number' && notification > 99 ? '99+' : notification}
        </NotificationBadge>
      )}
    </AvatarContainer>
  );
};

export default Avatar;