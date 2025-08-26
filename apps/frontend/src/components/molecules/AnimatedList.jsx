import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

const slideItemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

const fadeItemVariants = {
  hidden: { 
    opacity: 0,
    y: 10
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

const scaleItemVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    rotate: -5
  },
  visible: { 
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      ease: 'backOut'
    }
  }
};

const AnimatedList = ({ 
  children, 
  variant = 'default',
  staggerDelay = 0.1,
  delayChildren = 0.2,
  className,
  style,
  ...props 
}) => {
  const getItemVariants = () => {
    switch (variant) {
      case 'slide':
        return slideItemVariants;
      case 'fade':
        return fadeItemVariants;
      case 'scale':
        return scaleItemVariants;
      case 'default':
      default:
        return itemVariants;
    }
  };

  const customContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren
      }
    }
  };

  return (
    <motion.div
      variants={customContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={style}
      {...props}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div
              key={child.key || index}
              variants={getItemVariants()}
            >
              {child}
            </motion.div>
          ))
        : (
            <motion.div variants={getItemVariants()}>
              {children}
            </motion.div>
          )
      }
    </motion.div>
  );
};

export const AnimatedListItem = ({ children, className, ...props }) => {
  return (
    <motion.div
      variants={itemVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedList;