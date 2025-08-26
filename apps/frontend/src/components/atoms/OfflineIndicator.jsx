import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useOffline, useServiceWorkerUpdate } from '../../hooks/useOffline';
import Button from './Button';
import { useI18n } from '../../hooks/useI18n.jsx';

const slideDown = keyframes`
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
`;

const OfflineBar = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: 500;
  text-align: center;
  animation: ${slideDown} 0.3s ease-out;
  
  ${props => props.isOffline && css`
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
    color: white;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  `}
  
  ${props => props.showUpdate && css`
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
    color: white;
    box-shadow: 0 2px 8px rgba(78, 205, 196, 0.3);
  `}
`;

const OfflineContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  max-width: 1200px;
  margin: 0 auto;
`;

const OfflineIcon = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.8;
  flex-shrink: 0;
`;

const UpdateButton = styled(Button)`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fontSizes.xs};
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const OfflineIndicator = () => {
  const { isOffline } = useOffline();
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();
  
  let t;
  try {
    const i18n = useI18n();
    t = i18n.t;
  } catch {
    t = (key, defaultValue) => defaultValue || key.split('.').pop();
  }

  return (
    <AnimatePresence>
      {(isOffline || updateAvailable) && (
        <OfflineBar
          key="offline-bar"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          isOffline={isOffline}
          showUpdate={updateAvailable && !isOffline}
        >
          <OfflineContent>
            {isOffline ? (
              <>
                <OfflineIcon />
                <span>{t('offline.message', 'You are currently offline. Some features may be limited.')}</span>
              </>
            ) : updateAvailable ? (
              <>
                <OfflineIcon />
                <span>{t('update.available', 'A new version is available.')}</span>
                <UpdateButton onClick={applyUpdate} size="small">
                  {t('update.apply', 'Update')}
                </UpdateButton>
              </>
            ) : null}
          </OfflineContent>
        </OfflineBar>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;