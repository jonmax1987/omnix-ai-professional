import Dialog from './Dialog';
import { useI18n } from '../../hooks/useI18n';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'warning',
  isLoading = false,
  ...props
}) => {
  const { t } = useI18n();

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  const primaryAction = {
    label: confirmLabel || (variant === 'error' ? t('common.delete', 'Delete') : t('common.save', 'Save')),
    onClick: handleConfirm,
    variant: variant === 'error' ? 'danger' : 'primary',
    disabled: isLoading,
    props: {
      loading: isLoading
    }
  };

  const secondaryAction = {
    label: cancelLabel || t('common.cancel', 'Cancel'),
    onClick: handleCancel,
    disabled: isLoading
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      description={description || 'Are you sure you want to continue?'}
      variant={variant}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      closeOnOverlayClick={!isLoading}
      closeOnEscapeKey={!isLoading}
      {...props}
    />
  );
};

export default ConfirmDialog;