import styled from 'styled-components';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

const DialogContent = styled.div`
  text-align: center;
  max-width: 400px;
`;

const DialogIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.theme.spacing[12]};
  height: ${props => props.theme.spacing[12]};
  margin: 0 auto ${props => props.theme.spacing[4]};
  border-radius: 50%;
  background: ${props => getIconBackground(props.variant, props.theme)};
  color: ${props => getIconColor(props.variant, props.theme)};
`;

const DialogTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing[3]};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.25;
`;

const DialogDescription = styled.p`
  margin: 0 0 ${props => props.theme.spacing[6]};
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
`;

const DialogActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: row;
    justify-content: center;
  }
`;

const getIconBackground = (variant, theme) => {
  switch (variant) {
    case 'success':
      return theme.colors.status?.success?.background || theme.colors.green[50];
    case 'warning':
      return theme.colors.status?.warning?.background || theme.colors.yellow[50];
    case 'error':
      return theme.colors.status?.error?.background || theme.colors.red[50];
    case 'info':
      return theme.colors.status?.info?.background || theme.colors.blue[50];
    default:
      return theme.colors.background.secondary;
  }
};

const getIconColor = (variant, theme) => {
  switch (variant) {
    case 'success':
      return theme.colors.status?.success?.text || theme.colors.green[600];
    case 'warning':
      return theme.colors.status?.warning?.text || theme.colors.yellow[600];
    case 'error':
      return theme.colors.status?.error?.text || theme.colors.red[600];
    case 'info':
      return theme.colors.status?.info?.text || theme.colors.blue[600];
    default:
      return theme.colors.text.secondary;
  }
};

const getIconName = (variant) => {
  switch (variant) {
    case 'success':
      return 'check-circle';
    case 'warning':
      return 'alert-triangle';
    case 'error':
      return 'x-circle';
    case 'info':
      return 'info';
    default:
      return 'help-circle';
  }
};

const Dialog = ({
  isOpen,
  onClose,
  title,
  description,
  variant = 'info',
  primaryAction,
  secondaryAction,
  showIcon = true,
  ...props
}) => {
  const footer = (
    <DialogActions>
      {secondaryAction && (
        <Button
          variant="outline"
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
          {...secondaryAction.props}
        >
          {secondaryAction.label}
        </Button>
      )}
      {primaryAction && (
        <Button
          variant={primaryAction.variant || 'primary'}
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          {...primaryAction.props}
        >
          {primaryAction.label}
        </Button>
      )}
    </DialogActions>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={footer}
      showCloseButton={false}
      {...props}
    >
      <DialogContent>
        {showIcon && (
          <DialogIcon variant={variant}>
            <Icon name={getIconName(variant)} size={24} />
          </DialogIcon>
        )}
        
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogContent>
    </Modal>
  );
};

export default Dialog;