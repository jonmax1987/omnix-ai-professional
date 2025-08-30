import { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Icon from '../atoms/Icon';

const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  overflow: hidden;
  border-radius: ${props => props.borderRadius || 0};
  background: ${props => props.theme.colors.background.hover};
`;

const Image = styled(motion.img).withConfig({
  shouldForwardProp: (prop) => !['hoverEffect', 'objectFit'].includes(prop)
})`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.objectFit || 'cover'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.hoverEffect === 'zoom' ? 'scale(1.05)' : 
                         props.hoverEffect === 'brightness' ? 'brightness(1.1)' : 'none'};
  }
`;

const PlaceholderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background.hover};
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
`;

const ErrorPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  padding: ${props => props.theme.spacing[4]};
`;

const BlurredImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px);
  transform: scale(1.1);
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const ProgressiveContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

// Utility functions for image optimization
const generateSrcSet = (src, sizes = [480, 768, 1024, 1280, 1600]) => {
  if (!src) return '';
  
  const baseName = src.split('.').slice(0, -1).join('.');
  const extension = src.split('.').pop();
  
  return sizes
    .map(size => `${baseName}_${size}w.${extension} ${size}w`)
    .join(', ');
};

const generateSizes = (breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 }) => {
  return [
    `(max-width: ${breakpoints.sm}px) 100vw`,
    `(max-width: ${breakpoints.md}px) 50vw`,
    `(max-width: ${breakpoints.lg}px) 33vw`,
    '25vw'
  ].join(', ');
};

const getWebPSource = (src) => {
  if (!src) return '';
  return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = src;
  });
};

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (threshold = 0.1, rootMargin = '50px') => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return [setRef, isVisible];
};

// Progressive image loading with blur effect
const ProgressiveImage = ({
  src,
  lowQualitySrc,
  alt,
  className,
  style,
  objectFit = 'cover',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLowQualityLoaded, setIsLowQualityLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLowQualityLoad = () => {
    setIsLowQualityLoaded(true);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <ErrorPlaceholder className={className} style={style}>
        <Icon name="image-off" size={24} />
        <span>Failed to load image</span>
      </ErrorPlaceholder>
    );
  }

  return (
    <ProgressiveContainer className={className} style={style}>
      {lowQualitySrc && (
        <BlurredImage
          src={lowQualitySrc}
          alt={alt}
          visible={isLowQualityLoaded && !isLoaded}
          onLoad={handleLowQualityLoad}
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        objectFit={objectFit}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      />
    </ProgressiveContainer>
  );
};

// Main optimized image component
const OptimizedImage = ({
  src,
  alt = '',
  width,
  height,
  sizes,
  srcSet,
  placeholder = 'blur', // 'blur', 'shimmer', 'color', 'none'
  placeholderColor = '#f0f0f0',
  lowQualitySrc,
  lazy = true,
  threshold = 0.1,
  rootMargin = '50px',
  objectFit = 'cover',
  hoverEffect, // 'zoom', 'brightness'
  borderRadius,
  loading = 'lazy',
  priority = false,
  quality = 75,
  format = 'auto', // 'auto', 'webp', 'jpg', 'png'
  progressive = false,
  onLoad,
  onError,
  className,
  style,
  ...props
}) => {
  const [ref, isVisible] = useIntersectionObserver(threshold, rootMargin);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const imageRef = useRef(null);
  const shouldLoad = !lazy || isVisible || priority;

  // Generate optimized sources
  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    
    let optimizedUrl = src;
    
    // Add quality parameter if supported
    if (src.includes('?')) {
      optimizedUrl += `&q=${quality}`;
    } else {
      optimizedUrl += `?q=${quality}`;
    }
    
    // Add format parameter
    if (format !== 'auto') {
      optimizedUrl += `&format=${format}`;
    }
    
    return optimizedUrl;
  }, [src, quality, format]);

  const webpSrc = useMemo(() => {
    if (!src || format === 'jpg' || format === 'png') return '';
    return getWebPSource(optimizedSrc);
  }, [optimizedSrc, format]);

  const generatedSrcSet = useMemo(() => {
    if (srcSet) return srcSet;
    if (!src) return '';
    return generateSrcSet(optimizedSrc);
  }, [srcSet, optimizedSrc]);

  const generatedSizes = useMemo(() => {
    if (sizes) return sizes;
    return generateSizes();
  }, [sizes]);

  // Load image dimensions for aspect ratio
  useEffect(() => {
    if (src && !width && !height) {
      getImageDimensions(src)
        .then(setImageDimensions)
        .catch(() => {
          // Ignore dimension loading errors
        });
    }
  }, [src, width, height]);

  const handleImageLoad = (e) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  // Calculate container aspect ratio
  const aspectRatio = useMemo(() => {
    if (width && height) {
      return (height / width) * 100;
    }
    if (imageDimensions.width && imageDimensions.height) {
      return (imageDimensions.height / imageDimensions.width) * 100;
    }
    return null;
  }, [width, height, imageDimensions]);

  // Render placeholder
  const renderPlaceholder = () => {
    if (placeholder === 'none') return null;
    
    if (placeholder === 'color') {
      return (
        <PlaceholderContainer style={{ backgroundColor: placeholderColor }}>
          <Icon name="image" size={24} />
        </PlaceholderContainer>
      );
    }
    
    if (placeholder === 'shimmer') {
      return (
        <PlaceholderContainer>
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, 
                ${placeholderColor} 0%, 
                rgba(255,255,255,0.2) 50%, 
                ${placeholderColor} 100%)`,
              backgroundSize: '200% 100%'
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </PlaceholderContainer>
      );
    }
    
    // Default blur placeholder
    return (
      <PlaceholderContainer>
        <Icon name="image" size={24} />
      </PlaceholderContainer>
    );
  };

  // Handle progressive loading
  if (progressive && lowQualitySrc) {
    return (
      <ImageContainer
        ref={ref}
        className={className}
        style={{
          ...style,
          paddingBottom: aspectRatio ? `${aspectRatio}%` : undefined,
          height: aspectRatio ? 0 : height
        }}
        borderRadius={borderRadius}
      >
        {shouldLoad ? (
          <ProgressiveImage
            src={optimizedSrc}
            lowQualitySrc={lowQualitySrc}
            alt={alt}
            objectFit={objectFit}
            hoverEffect={hoverEffect}
            {...props}
          />
        ) : (
          renderPlaceholder()
        )}
      </ImageContainer>
    );
  }

  return (
    <ImageContainer
      ref={ref}
      className={className}
      style={{
        ...style,
        paddingBottom: aspectRatio ? `${aspectRatio}%` : undefined,
        height: aspectRatio ? 0 : height
      }}
      borderRadius={borderRadius}
    >
      {shouldLoad ? (
        <>
          {/* Modern browsers with WebP support */}
          <picture>
            {webpSrc && (
              <source
                srcSet={webpSrc}
                sizes={generatedSizes}
                type="image/webp"
              />
            )}
            <Image
              ref={imageRef}
              src={optimizedSrc}
              srcSet={generatedSrcSet}
              sizes={generatedSizes}
              alt={alt}
              width={width}
              height={height}
              loading={priority ? 'eager' : loading}
              objectFit={objectFit}
              hoverEffect={hoverEffect}
              onLoad={handleImageLoad}
              onError={handleImageError}
              initial={{ opacity: 0 }}
              animate={{ opacity: hasError ? 0 : 1 }}
              transition={{ duration: 0.3 }}
              {...props}
            />
          </picture>
          
          {/* Loading indicator */}
          {isLoading && !hasError && (
            <LoadingSpinner
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Icon name="refresh" size={20} />
              </motion.div>
            </LoadingSpinner>
          )}
          
          {/* Error state */}
          {hasError && (
            <ErrorPlaceholder>
              <Icon name="image-off" size={24} />
              <span style={{ fontSize: '12px' }}>Failed to load</span>
            </ErrorPlaceholder>
          )}
        </>
      ) : (
        renderPlaceholder()
      )}
    </ImageContainer>
  );
};

// Gallery component with optimized loading
const ImageGallery = ({
  images = [],
  columns = 3,
  gap = 16,
  aspectRatio = 1,
  className,
  onImageClick,
  lazy = true
}) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  
  const handleImageLoad = (index) => {
    setLoadedImages(prev => new Set([...prev, index]));
  };

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        width: '100%'
      }}
    >
      {images.map((image, index) => (
        <div
          key={image.id || index}
          style={{
            position: 'relative',
            paddingBottom: `${aspectRatio * 100}%`,
            cursor: onImageClick ? 'pointer' : 'default'
          }}
          onClick={() => onImageClick?.(image, index)}
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt || `Image ${index + 1}`}
            lazy={lazy}
            placeholder="shimmer"
            objectFit="cover"
            hoverEffect={onImageClick ? 'zoom' : undefined}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
            onLoad={() => handleImageLoad(index)}
            priority={index < 3} // Prioritize first 3 images
          />
        </div>
      ))}
    </div>
  );
};

// Avatar component with optimized images
const OptimizedAvatar = ({
  src,
  alt,
  size = 40,
  fallback,
  className,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  
  const sizeStyle = {
    width: size,
    height: size,
    borderRadius: '50%'
  };

  if (hasError || !src) {
    return (
      <div
        className={className}
        style={{
          ...sizeStyle,
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999'
        }}
      >
        {fallback || <Icon name="user" size={size * 0.6} />}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={sizeStyle}
      objectFit="cover"
      placeholder="color"
      placeholderColor="#e0e0e0"
      onError={() => setHasError(true)}
      {...props}
    />
  );
};

export {
  ProgressiveImage,
  ImageGallery,
  OptimizedAvatar,
  generateSrcSet,
  generateSizes,
  getWebPSource,
  getImageDimensions
};

export default OptimizedImage;