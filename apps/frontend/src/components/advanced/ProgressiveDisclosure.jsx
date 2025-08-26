import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Badge from '../atoms/Badge';

const DisclosureContainer = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
`;

const DisclosureHeader = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.expanded ? props.theme.colors.background.hover : 'transparent'};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
  
  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 2px ${props => props.theme.colors.primary[500]};
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex: 1;
`;

const HeaderIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const ExpandIcon = styled(motion.div)`
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
`;

const DisclosureContent = styled(motion.div)`
  border-top: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.primary};
`;

const ContentSection = styled.div`
  padding: ${props => props.theme.spacing[4]};
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
`;

const Step = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.active ? props.theme.colors.primary[300] : props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
  transition: border-color 0.2s ease;
`;

const StepHeader = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.active ? props.theme.colors.primary[50] : 'transparent'};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  text-align: left;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.completed ? props.theme.colors.success[500] : 
                       props.active ? props.theme.colors.primary[500] : 
                       props.theme.colors.gray[300]};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.caption.fontSize};
  font-weight: 600;
  flex-shrink: 0;
`;

const StepContent = styled(motion.div)`
  padding: ${props => props.theme.spacing[3]};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.hover};
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: none;
  background: ${props => props.active ? props.theme.colors.background.primary : 'transparent'};
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  &:hover {
    background: ${props => props.theme.colors.background.primary};
  }
`;

const TabPanel = styled(motion.div)`
  padding: ${props => props.theme.spacing[4]};
`;

const AccordionContainer = styled.div`
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
`;

const AccordionItem = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border.default};
  }
`;

const AccordionHeader = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => props.expanded ? props.theme.colors.background.hover : 'transparent'};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
`;

const LoadingState = styled.div`
  padding: ${props => props.theme.spacing[6]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.text.secondary};
`;

// Main Progressive Disclosure Component
const ProgressiveDisclosure = ({
  title,
  description,
  icon,
  color = '#3B82F6',
  badge,
  expanded: controlledExpanded,
  onExpandedChange,
  loading = false,
  disabled = false,
  children,
  className,
  headerActions,
  expandIcon = 'chevron-down',
  animationDuration = 0.3
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const contentRef = useRef(null);
  
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (disabled) return;
    
    const newExpanded = !expanded;
    
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    
    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    }
  };

  return (
    <DisclosureContainer className={className}>
      <DisclosureHeader
        expanded={expanded}
        onClick={handleToggle}
        disabled={disabled}
      >
        <HeaderContent>
          {icon && (
            <HeaderIcon color={color}>
              <Icon name={icon} size={16} color={color} />
            </HeaderIcon>
          )}
          
          <HeaderText>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <Typography variant="body1" weight="semibold">
                {title}
              </Typography>
              {badge && (
                <Badge variant={badge.variant || 'info'} size="xs">
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <Typography variant="caption" color="secondary">
                {description}
              </Typography>
            )}
          </HeaderText>
        </HeaderContent>
        
        <HeaderActions>
          {headerActions}
          <ExpandIcon
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: animationDuration }}
          >
            <Icon name={expandIcon} size={16} />
          </ExpandIcon>
        </HeaderActions>
      </DisclosureHeader>
      
      <AnimatePresence>
        {expanded && (
          <DisclosureContent
            ref={contentRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: animationDuration }}
          >
            {loading ? (
              <LoadingState>
                <Icon name="refresh" size={16} />
                <Typography variant="body2">Loading...</Typography>
              </LoadingState>
            ) : (
              children
            )}
          </DisclosureContent>
        )}
      </AnimatePresence>
    </DisclosureContainer>
  );
};

// Step-by-step disclosure component
const StepDisclosure = ({
  steps = [],
  currentStep = 0,
  onStepChange,
  allowSkipping = true,
  showProgress = true,
  className
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);

  const handleStepClick = (stepIndex) => {
    if (!allowSkipping && stepIndex > activeStep + 1) return;
    
    setActiveStep(stepIndex);
    if (onStepChange) {
      onStepChange(stepIndex);
    }
  };

  return (
    <ProgressiveDisclosure
      title="Step-by-step Guide"
      icon="list"
      expanded={true}
      className={className}
      badge={showProgress ? { text: `${activeStep + 1} / ${steps.length}`, variant: 'info' } : null}
    >
      <ContentSection>
        <StepContainer>
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isAccessible = allowSkipping || index <= activeStep + 1;
            
            return (
              <Step
                key={index}
                active={isActive}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <StepHeader
                  active={isActive}
                  onClick={() => isAccessible && handleStepClick(index)}
                  disabled={!isAccessible}
                >
                  <StepNumber
                    completed={isCompleted}
                    active={isActive}
                  >
                    {isCompleted ? (
                      <Icon name="check" size={12} />
                    ) : (
                      index + 1
                    )}
                  </StepNumber>
                  
                  <div style={{ flex: 1 }}>
                    <Typography variant="body2" weight="semibold">
                      {step.title}
                    </Typography>
                    {step.description && (
                      <Typography variant="caption" color="secondary">
                        {step.description}
                      </Typography>
                    )}
                  </div>
                  
                  {step.badge && (
                    <Badge variant={step.badge.variant} size="xs">
                      {step.badge.text}
                    </Badge>
                  )}
                </StepHeader>
                
                <AnimatePresence>
                  {isActive && (
                    <StepContent
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.content}
                    </StepContent>
                  )}
                </AnimatePresence>
              </Step>
            );
          })}
        </StepContainer>
      </ContentSection>
    </ProgressiveDisclosure>
  );
};

// Tabbed disclosure component
const TabbedDisclosure = ({
  tabs = [],
  activeTab = 0,
  onTabChange,
  className
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabClick = (tabIndex) => {
    setCurrentTab(tabIndex);
    if (onTabChange) {
      onTabChange(tabIndex);
    }
  };

  return (
    <ProgressiveDisclosure
      title="Advanced Options"
      icon="settings"
      expanded={true}
      className={className}
    >
      <TabContainer>
        <TabList>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              active={index === currentTab}
              onClick={() => handleTabClick(index)}
            >
              {tab.icon && <Icon name={tab.icon} size={14} />}
              <Typography variant="body2" weight="medium">
                {tab.title}
              </Typography>
              {tab.badge && (
                <Badge variant={tab.badge.variant} size="xs">
                  {tab.badge.text}
                </Badge>
              )}
            </Tab>
          ))}
        </TabList>
        
        <AnimatePresence mode="wait">
          <TabPanel
            key={currentTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {tabs[currentTab]?.content}
          </TabPanel>
        </AnimatePresence>
      </TabContainer>
    </ProgressiveDisclosure>
  );
};

// Accordion disclosure component
const AccordionDisclosure = ({
  items = [],
  allowMultiple = false,
  defaultExpanded = [],
  className
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set(defaultExpanded));

  const handleItemToggle = (index) => {
    const newExpanded = new Set(expandedItems);
    
    if (expandedItems.has(index)) {
      newExpanded.delete(index);
    } else {
      if (!allowMultiple) {
        newExpanded.clear();
      }
      newExpanded.add(index);
    }
    
    setExpandedItems(newExpanded);
  };

  return (
    <ProgressiveDisclosure
      title="FAQ & Details"
      icon="help-circle"
      expanded={true}
      className={className}
    >
      <ContentSection>
        <AccordionContainer>
          {items.map((item, index) => {
            const isExpanded = expandedItems.has(index);
            
            return (
              <AccordionItem key={index}>
                <AccordionHeader
                  expanded={isExpanded}
                  onClick={() => handleItemToggle(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon && <Icon name={item.icon} size={16} />}
                    <Typography variant="body2" weight="semibold">
                      {item.title}
                    </Typography>
                    {item.badge && (
                      <Badge variant={item.badge.variant} size="xs">
                        {item.badge.text}
                      </Badge>
                    )}
                  </div>
                  
                  <Icon 
                    name="chevron-down" 
                    size={16} 
                    style={{ 
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </AccordionHeader>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '16px' }}>
                        {item.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </AccordionItem>
            );
          })}
        </AccordionContainer>
      </ContentSection>
    </ProgressiveDisclosure>
  );
};

// Export all components
export { StepDisclosure, TabbedDisclosure, AccordionDisclosure };
export default ProgressiveDisclosure;