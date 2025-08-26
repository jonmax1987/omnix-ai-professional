import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipe } from '../../hooks/useMobileGestures';
import { SWIPE_DIRECTIONS, isTouchDevice } from '../../utils/mobileGestures';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.elevated};
  touch-action: pan-y;
`;

const CarouselTrack = styled(motion.div)`
  display: flex;
  width: 100%;
  height: 100%;
  will-change: transform;
`;

const CarouselSlide = styled(motion.div)`
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
  
  &.active {
    z-index: 2;
  }
`;

const CarouselControls = styled.div`
  position: absolute;
  bottom: ${props => props.theme.spacing[4]};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.background.elevated};
  backdrop-filter: blur(10px);
  border-radius: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 10;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    bottom: ${props => props.theme.spacing[2]};
    padding: ${props => props.theme.spacing[1]};
  }
`;

const CarouselIndicator = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => 
    props.active 
      ? props.theme.colors.primary[500] 
      : props.theme.colors.border.default
  };
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => 
      props.active 
        ? props.theme.colors.primary[600] 
        : props.theme.colors.border.hover
    };
  }

  &:active {
    transform: scale(0.9);
  }
`;

const NavigationButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm'
})`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: ${props => props.theme.colors.background.elevated};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.colors.border.default};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: ${props => props.theme.shadows.md};
  
  ${props => props.direction === 'prev' ? 'left: 16px;' : 'right: 16px;'}
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const SwipeHint = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography?.caption?.fontSize || '14px'};
  z-index: 5;
  pointer-events: none;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const SlideCounter = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.elevated};
  backdrop-filter: blur(10px);
  border-radius: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  box-shadow: ${props => props.theme.shadows.sm};
  z-index: 10;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    top: ${props => props.theme.spacing[2]};
    right: ${props => props.theme.spacing[2]};
  }
`;

const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const SWIPE_POWER = 0.2;

const MobileCarousel = ({
  children,
  initialSlide = 0,
  showIndicators = true,
  showNavigation = true,
  showCounter = true,
  showSwipeHint = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  onSlideChange,
  className,
  ...props
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [showHint, setShowHint] = useState(showSwipeHint && isTouchDevice());
  
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);
  const slides = Array.isArray(children) ? children : [children];
  const slideCount = slides.length;

  // Calculate drag constraints based on slide count and container width
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const trackWidth = containerWidth * slideCount;
      
      setDragConstraints({
        left: -(trackWidth - containerWidth),
        right: 0
      });
    }
  }, [slideCount]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && slideCount > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slideCount);
      }, autoPlayInterval);

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [autoPlay, autoPlayInterval, slideCount]);

  // Hide swipe hint after initial display
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  const goToSlide = (index) => {
    const clampedIndex = Math.max(0, Math.min(index, slideCount - 1));
    setCurrentSlide(clampedIndex);
    
    if (onSlideChange) {
      onSlideChange(clampedIndex);
    }

    // Reset auto-play timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      if (autoPlay) {
        autoPlayRef.current = setInterval(() => {
          setCurrentSlide(prev => (prev + 1) % slideCount);
        }, autoPlayInterval);
      }
    }
  };

  const nextSlide = () => {
    goToSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    goToSlide(currentSlide - 1);
  };

  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
      nextSlide();
    } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
      prevSlide();
    }
  };

  // Mobile swipe handling
  const swipeRef = useSwipe({
    onSwipe: (direction) => {
      if (direction === SWIPE_DIRECTIONS.LEFT) {
        nextSlide();
      } else if (direction === SWIPE_DIRECTIONS.RIGHT) {
        prevSlide();
      }
    }
  });

  useEffect(() => {
    if (containerRef.current && isTouchDevice()) {
      swipeRef.current = containerRef.current;
    }
  }, []);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <CarouselContainer ref={containerRef} className={className} {...props}>
      {/* Slides */}
      <CarouselTrack
        animate={{ x: `-${currentSlide * 100}%` }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {slides.map((slide, index) => (
          <CarouselSlide
            key={index}
            className={index === currentSlide ? 'active' : ''}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            {slide}
          </CarouselSlide>
        ))}
      </CarouselTrack>

      {/* Navigation Buttons */}
      {showNavigation && slideCount > 1 && (
        <>
          <NavigationButton
            direction="prev"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            title="Previous slide"
          >
            <Icon name="chevron-left" size={20} />
          </NavigationButton>
          
          <NavigationButton
            direction="next"
            onClick={nextSlide}
            disabled={currentSlide === slideCount - 1}
            title="Next slide"
          >
            <Icon name="chevron-right" size={20} />
          </NavigationButton>
        </>
      )}

      {/* Slide Counter */}
      {showCounter && slideCount > 1 && (
        <SlideCounter>
          <Typography variant="caption" weight="medium">
            {currentSlide + 1} / {slideCount}
          </Typography>
        </SlideCounter>
      )}

      {/* Indicators */}
      {showIndicators && slideCount > 1 && (
        <CarouselControls>
          {slides.map((_, index) => (
            <CarouselIndicator
              key={index}
              active={index === currentSlide}
              onClick={() => goToSlide(index)}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </CarouselControls>
      )}

      {/* Swipe Hint */}
      <AnimatePresence>
        {showHint && slideCount > 1 && (
          <SwipeHint
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Icon name="chevron-left" size={16} />
            <Typography variant="caption">Swipe to navigate</Typography>
            <Icon name="chevron-right" size={16} />
          </SwipeHint>
        )}
      </AnimatePresence>
    </CarouselContainer>
  );
};

export default MobileCarousel;