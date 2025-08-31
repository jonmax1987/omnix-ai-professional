/**
 * LazyImage Component - PERF-002: Image optimization and lazy loading
 * Advanced lazy loading image component with optimization features
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.$borderRadius || props.theme.borderRadius.md};
  width: ${props => props.$width || 'auto'};
  height: ${props => props.$height || 'auto'};
`;

const Image = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  object-position: ${props => props.$objectPosition || 'center'};
  display: block;
`;

const PlaceholderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background.secondary};
  color: ${props => props.theme.colors.text.secondary};
`;

const SkeletonPlaceholder = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.background.secondary} 25%,
    ${props => props.theme.colors.background.tertiary} 50%,
    ${props => props.theme.colors.background.secondary} 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const ErrorContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background.secondary};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  gap: ${props => props.theme.spacing[2]};
`;

const RetryButton = styled.button`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background: ${props => props.theme.colors.primary[500]};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primary[600]};
  }
`;

const ProgressBar = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: ${props => props.theme.colors.primary[500]};
  transform-origin: left;
`;

// Hook for intersection observer
function useIntersectionObserver(elementRef, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options, hasIntersected]);

  return isIntersecting;
}

// Generate responsive image sources
function generateSrcSet(src, sizes = [400, 800, 1200, 1600]) {
  if (!src || typeof src !== 'string') return '';
  
  const extension = src.split('.').pop();
  const baseName = src.replace(`.${extension}`, '');
  
  return sizes
    .map(size => `${baseName}_${size}w.${extension} ${size}w`)
    .join(', ');
}

// Generate WebP sources for modern browsers
function generateWebPSources(src, sizes = [400, 800, 1200, 1600]) {
  if (!src || typeof src !== 'string') return '';
  
  const extension = src.split('.').pop();
  const baseName = src.replace(`.${extension}`, '');
  
  return sizes
    .map(size => `${baseName}_${size}w.webp ${size}w`)
    .join(', ');
}

const LazyImage = ({
  src,
  alt,
  width,
  height,
  className,
  objectFit = 'cover',
  objectPosition = 'center',
  borderRadius,
  placeholder = 'skeleton', // 'skeleton', 'icon', 'color', 'blur'
  placeholderColor,
  blurDataURL,
  sizes = '100vw',
  quality = 80,
  priority = false,
  onLoad,
  onError,
  retry = true,
  showProgress = false,
  fadeInDuration = 0.3,
  responsive = true,
  webpSupport = true,
  ...props
}) => {
  const [imageState, setImageState] = useState('loading');
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [hasWebPSupport, setHasWebPSupport] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  
  // Check if image should load (intersection observer)
  const shouldLoad = useIntersectionObserver(
    containerRef,
    priority ? { threshold: 0 } : { threshold: 0.1, rootMargin: '50px' }
  );

  // Check WebP support
  useEffect(() => {
    if (!webpSupport) return;
    
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = function() {
      setHasWebPSupport(webpTest.height === 2);
    };
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }, [webpSupport]);

  // Load image when visible or priority
  useEffect(() => {
    if (!src || (!shouldLoad && !priority) || imageState === 'loaded') return;

    const img = new Image();
    const finalSrc = hasWebPSupport && webpSupport ? 
      src.replace(/\.(jpg|jpeg|png)$/i, '.webp') : src;

    setImageState('loading');
    setProgress(0);

    // Simulate progress for better UX (in real scenario, this would come from actual loading progress)
    let progressInterval;
    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 200);
    }

    img.onload = () => {
      if (progressInterval) clearInterval(progressInterval);
      setProgress(100);
      setImageState('loaded');
      
      // Update the actual image element
      if (imageRef.current) {
        imageRef.current.src = finalSrc;
      }
      
      onLoad?.();
    };

    img.onerror = () => {
      if (progressInterval) clearInterval(progressInterval);
      setProgress(0);
      setImageState('error');
      onError?.();
    };

    img.src = finalSrc;

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [src, shouldLoad, priority, hasWebPSupport, webpSupport, imageState, onLoad, onError, showProgress]);

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setImageState('loading');
    }
  };

  const renderPlaceholder = () => {
    switch (placeholder) {
      case 'skeleton':
        return <SkeletonPlaceholder />;
      
      case 'icon':
        return (
          <PlaceholderContainer>
            <Icon name="image" size={Math.min(48, Math.min(parseInt(width) || 48, parseInt(height) || 48) * 0.3)} />
          </PlaceholderContainer>
        );
      
      case 'color':
        return (
          <PlaceholderContainer 
            style={{ background: placeholderColor || 'currentColor' }} 
          />
        );
      
      case 'blur':
        return blurDataURL ? (
          <PlaceholderContainer>
            <img
              src={blurDataURL}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: objectFit,
                filter: 'blur(5px)',
                transform: 'scale(1.05)',
              }}
            />
          </PlaceholderContainer>
        ) : (
          <SkeletonPlaceholder />
        );
      
      default:
        return <SkeletonPlaceholder />;
    }
  };

  const renderError = () => (
    <ErrorContainer>
      <Icon name="image-off" size={24} />
      <span>Failed to load image</span>
      {retry && retryCount < 3 && (
        <RetryButton onClick={handleRetry}>
          Retry ({3 - retryCount} left)
        </RetryButton>
      )}
    </ErrorContainer>
  );

  // Generate sources for responsive images
  const srcSet = responsive ? generateSrcSet(src) : undefined;
  const webpSrcSet = responsive && webpSupport ? generateWebPSources(src) : undefined;

  return (
    <ImageContainer
      ref={containerRef}
      className={className}
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
      {...props}
    >
      <AnimatePresence mode="wait">
        {imageState === 'loading' && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeInDuration }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
            {renderPlaceholder()}
            {showProgress && progress > 0 && (
              <ProgressBar
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
        )}

        {imageState === 'loaded' && (
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: fadeInDuration }}
          >
            {responsive && (hasWebPSupport && webpSupport) ? (
              <picture>
                <source
                  srcSet={webpSrcSet}
                  sizes={sizes}
                  type="image/webp"
                />
                <Image
                  ref={imageRef}
                  src={src}
                  srcSet={srcSet}
                  sizes={sizes}
                  alt={alt}
                  $objectFit={objectFit}
                  $objectPosition={objectPosition}
                  loading={priority ? 'eager' : 'lazy'}
                />
              </picture>
            ) : (
              <Image
                ref={imageRef}
                src={src}
                srcSet={responsive ? srcSet : undefined}
                sizes={responsive ? sizes : undefined}
                alt={alt}
                $objectFit={objectFit}
                $objectPosition={objectPosition}
                loading={priority ? 'eager' : 'lazy'}
              />
            )}
          </motion.div>
        )}

        {imageState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: fadeInDuration }}
          >
            {renderError()}
          </motion.div>
        )}
      </AnimatePresence>
    </ImageContainer>
  );
};

export default LazyImage;