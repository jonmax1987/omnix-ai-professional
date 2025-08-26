import { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({});

  const openModal = useCallback((id, modalProps = {}) => {
    setModals(prev => ({
      ...prev,
      [id]: {
        isOpen: true,
        ...modalProps
      }
    }));
  }, []);

  const closeModal = useCallback((id) => {
    setModals(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false
      }
    }));
  }, []);

  const updateModal = useCallback((id, modalProps) => {
    setModals(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...modalProps
      }
    }));
  }, []);

  const isModalOpen = useCallback((id) => {
    return modals[id]?.isOpen || false;
  }, [modals]);

  const getModalProps = useCallback((id) => {
    return modals[id] || {};
  }, [modals]);

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      const newModals = {};
      Object.keys(prev).forEach(id => {
        newModals[id] = {
          ...prev[id],
          isOpen: false
        };
      });
      return newModals;
    });
  }, []);

  const value = {
    openModal,
    closeModal,
    updateModal,
    isModalOpen,
    getModalProps,
    closeAllModals,
    modals
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContext;