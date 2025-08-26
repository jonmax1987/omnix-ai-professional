import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: -20,
    scale: 0.98
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

const slideVariants = {
  initial: {
    x: 300,
    opacity: 0
  },
  in: {
    x: 0,
    opacity: 1
  },
  out: {
    x: -300,
    opacity: 0
  }
};

const fadeVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -10
  }
};

const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0
  },
  out: {
    opacity: 0,
    scale: 1.05,
    y: -20
  }
};

const PageTransition = ({ children, variant = 'default' }) => {
  const location = useLocation();
  
  const getVariants = () => {
    switch (variant) {
      case 'slide':
        return slideVariants;
      case 'fade':
        return fadeVariants;
      case 'scale':
        return scaleVariants;
      case 'default':
      default:
        return pageVariants;
    }
  };

  const getTransition = () => {
    switch (variant) {
      case 'slide':
        return {
          type: 'tween',
          ease: 'easeInOut',
          duration: 0.4
        };
      case 'fade':
        return {
          type: 'tween',
          ease: 'easeOut',
          duration: 0.2
        };
      case 'scale':
        return {
          type: 'spring',
          damping: 25,
          stiffness: 200,
          duration: 0.5
        };
      case 'default':
      default:
        return pageTransition;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={getVariants()}
        transition={getTransition()}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;