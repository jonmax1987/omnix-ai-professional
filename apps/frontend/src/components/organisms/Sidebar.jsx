import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import useStore from '../../store';
import Badge from '../atoms/Badge';
import NavItem from '../molecules/NavItem';

const SidebarContainer = styled(motion.aside).withConfig({
  shouldForwardProp: (prop) => !['collapsed', 'mobileOpen'].includes(prop),
})`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  height: 100vh;
  background: ${props => props.theme.colors.background.elevated};
  border-right: 1px solid ${props => props.theme.colors.border.default};
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeInOut};
  
  /* RTL Support */
  [dir="rtl"] & {
    left: auto;
    right: 0;
    border-right: none;
    border-left: 1px solid ${props => props.theme.colors.border.default};
  }
  
  ${props => props.collapsed ? css`
    width: 72px;
  ` : css`
    width: 280px;
  `}
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    width: 280px; /* Always full width on mobile */
    transform: ${props => props.mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${props => props.mobileOpen ? props.theme.shadows.xl : 'none'};
    
    /* RTL mobile support */
    [dir="rtl"] & {
      transform: ${props => props.mobileOpen ? 'translateX(0)' : 'translateX(100%)'};
    }
  }
`;

const SidebarOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const SidebarHeader = styled.div.withConfig({
  shouldForwardProp: (prop) => !['collapsed'].includes(prop),
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  flex-shrink: 0;
  
  ${props => props.collapsed && css`
    justify-content: center;
    padding: ${props.theme.spacing[4]} ${props.theme.spacing[2]};
  `}
`;

const Logo = styled.div.withConfig({
  shouldForwardProp: (prop) => !['collapsed'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  ${props => props.collapsed && css`
    justify-content: center;
  `}
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
  flex-shrink: 0;
`;

const LogoText = styled(motion.div)`
  overflow: hidden;
  white-space: nowrap;
`;

const CollapseButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  padding: ${props => props.theme.spacing[1]};
  min-width: auto;
  width: 32px;
  height: 32px;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const CloseButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  padding: ${props => props.theme.spacing[1]};
  min-width: auto;
  width: 32px;
  height: 32px;
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: flex;
  }
`;

const SidebarBody = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${props => props.theme.spacing[2]} 0;
`;

const NavSection = styled.div`
  padding: 0 ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled(motion.div)`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[1]};
  overflow: hidden;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const SidebarFooter = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  flex-shrink: 0;
`;

const UserSection = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.secondary};
  overflow: hidden;
`;

const UserInfo = styled(motion.div)`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  left: calc(100% + ${props => props.theme.spacing[2]});
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.colors.gray[800]};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;
  z-index: 60;
  pointer-events: none;
`;

const TooltipNavItem = styled.div`
  position: relative;
`;

const Sidebar = ({
  collapsed = false,
  mobileOpen = false,
  navigation = [],
  user,
  logo = 'OMNIX',
  currentPage,
  onCollapse,
  onClose,
  onNavigate,
  showTooltips = true,
  className,
  children,
  ...props
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const { ui } = useStore();
  const { isMobile } = ui;
  const { t } = useI18n();


  const defaultNavigation = [
    {
      section: 'Main',
      items: [
        { id: 'dashboard', label: t('navigation.dashboard'), icon: 'dashboard' },
        { id: 'products', label: t('navigation.products'), icon: 'products', badge: '1.2K' },
        { id: 'orders', label: 'Orders', icon: 'package', badge: '23' },
        { id: 'analytics', label: t('navigation.analytics'), icon: 'analytics' },
        { id: 'alerts', label: t('navigation.alerts'), icon: 'alerts', badge: { variant: 'error', content: '5' } }
      ]
    },
    {
      section: 'Management',
      items: [
        { id: 'recommendations', label: t('navigation.recommendations'), icon: 'trending' },
        { id: 'ab-testing', label: 'A/B Testing', icon: 'flask' },
        { id: 'reports', label: 'Reports', icon: 'analytics' },
        { id: 'settings', label: t('navigation.settings'), icon: 'settings' }
      ]
    }
  ];

  const currentNavigation = navigation.length > 0 ? navigation : defaultNavigation;
  const currentUser = user || { name: 'John Doe', role: 'Manager' };

  const renderNavItem = (item) => {
    const navItemContent = (
      <NavItem
        key={item.id}
        icon={item.icon}
        label={collapsed ? '' : item.label}
        badge={collapsed ? null : item.badge}
        active={currentPage === item.id}
        disabled={item.disabled}
        showActiveIndicator
        onClick={() => onNavigate?.(item.id)}
        onMouseEnter={() => collapsed && showTooltips && setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      />
    );

    if (collapsed && showTooltips) {
      return (
        <TooltipNavItem key={item.id}>
          {navItemContent}
          <AnimatePresence>
            {hoveredItem === item.id && (
              <Tooltip
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {item.label}
              </Tooltip>
            )}
          </AnimatePresence>
        </TooltipNavItem>
      );
    }

    return navItemContent;
  };

  return (
    <>
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <SidebarOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <SidebarContainer
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        className={className}
        initial={false}
        animate={{
          width: collapsed ? 72 : 280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        {...props}
      >
        <SidebarContent>
          <SidebarHeader collapsed={collapsed}>
            <Logo collapsed={collapsed}>
              <LogoIcon>
                <Typography variant="button" color="inverse" weight="bold">
                  O
                </Typography>
              </LogoIcon>
              <AnimatePresence>
                {!collapsed && (
                  <LogoText
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Typography variant="h5" weight="bold" color="primary">
                      {logo}
                    </Typography>
                  </LogoText>
                )}
              </AnimatePresence>
            </Logo>

            {!isMobile && (
              <CollapseButton onClick={onCollapse}>
                <Icon 
                  name={collapsed ? 'chevronRight' : 'chevronLeft'} 
                  size={16} 
                />
              </CollapseButton>
            )}

            {isMobile && (
              <CloseButton onClick={onClose}>
                <Icon name="close" size={16} />
              </CloseButton>
            )}
          </SidebarHeader>

          <SidebarBody>
            {children || (
              <>
                {currentNavigation.map((section) => (
                  <NavSection key={section.section}>
                    <AnimatePresence>
                      {!collapsed && section.section && (
                        <SectionHeader
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Typography variant="caption" color="tertiary" weight="medium">
                            {section.section.toUpperCase()}
                          </Typography>
                        </SectionHeader>
                      )}
                    </AnimatePresence>

                    <NavList>
                      {section.items.map(renderNavItem)}
                    </NavList>
                  </NavSection>
                ))}
              </>
            )}
          </SidebarBody>

          <SidebarFooter>
            <UserSection
              initial={false}
              animate={{
                justifyContent: collapsed ? 'center' : 'flex-start'
              }}
            >
              <Icon name="user" size={20} />
              <AnimatePresence>
                {!collapsed && (
                  <UserInfo
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Typography variant="body2" weight="medium" truncate>
                      {currentUser.name}
                    </Typography>
                    <Typography variant="caption" color="secondary" truncate>
                      {currentUser.role}
                    </Typography>
                  </UserInfo>
                )}
              </AnimatePresence>
            </UserSection>
          </SidebarFooter>
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;