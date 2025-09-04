import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { baseShouldForwardProp } from '../../utils/styledUtils';
import { useState, useRef, useEffect } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Avatar from '../atoms/Avatar';
import Badge from '../atoms/Badge';
import SearchBar from '../molecules/SearchBar';
import LanguageSwitcher from '../molecules/LanguageSwitcher';
import WebSocketStatus from '../atoms/WebSocketStatus';

const HeaderContainer = styled.header.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop) && baseShouldForwardProp(prop)
})`
  position: sticky;
  top: 0;
  z-index: 30;
  width: 100%;
  background: ${props => props.theme.colors.background.elevated};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  backdrop-filter: blur(8px);
  
  ${props => props.variant === 'transparent' && css`
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
  `}
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  max-width: 1440px;
  margin: 0 auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  flex: 1;
  min-width: 0;
`;

const Logo = styled(motion.div).withConfig({
  shouldForwardProp: baseShouldForwardProp
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
`;

const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[600]}, ${props => props.theme.colors.primary[700]});
  border-radius: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.text.inverse};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const MenuToggle = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: flex;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 400px;
  margin: 0 ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const NotificationButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  position: relative;
  padding: ${props => props.theme.spacing[2]};
  min-width: auto;
  width: 40px;
  height: 40px;
`;

const NotificationBadge = styled(Badge)`
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  font-size: 10px;
  padding: 0;
  pointer-events: none;
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserMenuButton = styled(motion.button).withConfig({
  shouldForwardProp: baseShouldForwardProp
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  background: none;
  border: none;
  border-radius: ${props => props.theme.spacing[2]};
  cursor: pointer;
  transition: background-color ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const DropdownMenu = styled(motion.div).withConfig({
  shouldForwardProp: baseShouldForwardProp
})`
  position: absolute;
  top: calc(100% + ${props => props.theme.spacing[1]});
  right: 0;
  z-index: 10;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing[2]} 0;
  min-width: 200px;
  overflow: hidden;
  
  /* RTL Support */
  [dir="rtl"] & {
    right: auto;
    left: 0;
  }
`;

const DropdownSection = styled.div`
  padding: ${props => props.theme.spacing[2]} 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  }
`;

const DropdownItem = styled(motion.button).withConfig({
  shouldForwardProp: baseShouldForwardProp
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  ${props => props.destructive && css`
    color: ${props.theme.colors.red[600]};
  `}
`;

const DropdownUser = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
`;

const DropdownUserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationDropdown = styled(DropdownMenu)`
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const NotificationItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['unread'].includes(prop),
})`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  cursor: pointer;
  transition: background-color ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  ${props => props.unread && css`
    background-color: ${props.theme.colors.primary[25]};
    
    &:hover {
      background-color: ${props.theme.colors.primary[50]};
    }
  `}
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTime = styled.div`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing[1]};
`;

const EmptyNotifications = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[6]};
  text-align: center;
`;

const Header = ({
  logo = 'OMNIX',
  showSearch = true,
  searchPlaceholder = 'Search...',
  onSearch,
  notifications = [],
  user,
  onMenuToggle,
  onUserMenuAction,
  onNotificationClick,
  onNotificationClear,
  className,
  children,
  ...props
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultUser = {
    name: 'John Doe',
    email: 'john.doe@omnix.ai',
    avatar: null,
    role: 'Manager'
  };

  const currentUser = user || defaultUser;

  const userMenuItems = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'help', label: 'Help & Support', icon: 'info' },
    { id: 'logout', label: 'Sign out', icon: 'logout', destructive: true }
  ];

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return notificationTime.toLocaleDateString();
  };

  return (
    <HeaderContainer className={className} {...props}>
      <HeaderContent>
        <LeftSection>
          <MenuToggle onClick={onMenuToggle}>
            <Icon name="menu" size={20} />
          </MenuToggle>
          
          <Logo
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogoIcon>
              <Typography variant="button" color="inverse" weight="bold">
                O
              </Typography>
            </LogoIcon>
            <Typography variant="h5" weight="bold" color="primary">
              {logo}
            </Typography>
          </Logo>

          {showSearch && (
            <SearchContainer>
              <SearchBar
                placeholder={searchPlaceholder}
                onSearch={onSearch}
                maxWidth="100%"
                debounceMs={300}
                showClearButton
                showSearchIcon
              />
            </SearchContainer>
          )}
        </LeftSection>

        <RightSection>
          {children}

          <WebSocketStatus showText={false} />
          
          <LanguageSwitcher />

          <div ref={notificationRef} style={{ position: 'relative' }}>
            <NotificationButton
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Icon name="bell" size={20} />
              {unreadCount > 0 && (
                <NotificationBadge variant="count">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </NotificationBadge>
              )}
            </NotificationButton>

            <AnimatePresence>
              {showNotifications && (
                <NotificationDropdown
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <NotificationHeader>
                    <Typography variant="subtitle2" weight="medium">
                      Notifications
                    </Typography>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onNotificationClear}
                      >
                        Clear all
                      </Button>
                    )}
                  </NotificationHeader>

                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        unread={!notification.read}
                        onClick={() => onNotificationClick?.(notification)}
                        whileHover={{ x: 2 }}
                      >
                        <div style={{ color: notification.color || '#6B7280', paddingTop: '2px' }}>
                          <Icon name={notification.icon || 'info'} size={16} />
                        </div>
                        <NotificationContent>
                          <Typography variant="body2" weight="medium" truncate>
                            {notification.title}
                          </Typography>
                          <Typography variant="body2" color="secondary" truncate>
                            {notification.message}
                          </Typography>
                          <NotificationTime>
                            {formatNotificationTime(notification.timestamp)}
                          </NotificationTime>
                        </NotificationContent>
                        {!notification.read && (
                          <div style={{ width: '6px', height: '6px', background: '#3B82F6', borderRadius: '50%', marginTop: '6px' }} />
                        )}
                      </NotificationItem>
                    ))
                  ) : (
                    <EmptyNotifications>
                      <Icon name="bell" size={32} color="#9CA3AF" />
                      <Typography variant="body2" color="tertiary">
                        No notifications yet
                      </Typography>
                    </EmptyNotifications>
                  )}
                </NotificationDropdown>
              )}
            </AnimatePresence>
          </div>

          <UserMenuContainer ref={userMenuRef}>
            <UserMenuButton
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Avatar
                src={currentUser.avatar}
                name={currentUser.name}
                size="sm"
              />
              <UserInfo>
                <Typography variant="body2" weight="medium" truncate>
                  {currentUser.name}
                </Typography>
                <Typography variant="caption" color="secondary" truncate>
                  {currentUser.role}
                </Typography>
              </UserInfo>
              <Icon name="chevronDown" size={16} />
            </UserMenuButton>

            <AnimatePresence>
              {showUserMenu && (
                <DropdownMenu
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownSection>
                    <DropdownUser>
                      <Avatar
                        src={currentUser.avatar}
                        name={currentUser.name}
                        size="md"
                      />
                      <DropdownUserInfo>
                        <Typography variant="subtitle2" weight="medium" truncate>
                          {currentUser.name}
                        </Typography>
                        <Typography variant="caption" color="secondary" truncate>
                          {currentUser.email}
                        </Typography>
                      </DropdownUserInfo>
                    </DropdownUser>
                  </DropdownSection>

                  <DropdownSection>
                    {userMenuItems.map((item) => (
                      <DropdownItem
                        key={item.id}
                        destructive={item.destructive}
                        onClick={() => {
                          onUserMenuAction?.(item.id);
                          setShowUserMenu(false);
                        }}
                        whileHover={{ x: 2 }}
                      >
                        <Icon name={item.icon} size={16} />
                        <Typography variant="body2">
                          {item.label}
                        </Typography>
                      </DropdownItem>
                    ))}
                  </DropdownSection>
                </DropdownMenu>
              )}
            </AnimatePresence>
          </UserMenuContainer>
        </RightSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;