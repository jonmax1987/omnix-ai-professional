/**
 * Optimized Image Component - PERF-007
 * Enhanced image component with CDN optimization, lazy loading, and responsive support
 * Provides automatic format selection, quality optimization, and performance monitoring
 */

import React, { useRef, useEffect, useState, forwardRef } from 'react';
import styled from 'styled-components';
import { assetURLGenerator, lazyLoadingManager } from '../../utils/cdnOptimization.js';

/**
 * Styled Components
 */
const ImageContainer = styled.div`
  position: relative;
  display: ${props => props.$inline ? 'inline-block' : 'block'};
  overflow: hidden;
  
  ${props => props.$aspectRatio && `
    &::before {
      content: '';
      display: block;
      padding-top: ${(1 / props.$aspectRatio) * 100}%;
    }
  `}
`;

const StyledImage = styled.img`
  max-width: 100%;
  height: auto;
  transition: opacity 0.3s ease, filter 0.3s ease;
  
  ${props => props.$aspectRatio && `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: ${props.$objectFit || 'cover'};
  `}
  
  /* Loading state */
  &.loading {
    opacity: 0.7;
    filter: blur(1px);
  }
  
  /* Loaded state */
  &.loaded {
    opacity: 1;
    filter: none;
  }
  
  /* Error state */
  &.error {
    opacity: 0.5;
    filter: grayscale(100%);
  }
  
  /* Focus and hover states */
  &:focus {
    outline: 2px solid ${props => props.theme.colors?.primary || '#2563eb'};
    outline-offset: 2px;
  }
`;

const LoadingPlaceholder = styled.div`
  position: ${props => props.$aspectRatio ? 'absolute' : 'static'};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors?.gray?.[100] || '#f3f4f6'} 0%,
    ${props => props.theme.colors?.gray?.[200] || '#e5e7eb'} 50%,
    ${props => props.theme.colors?.gray?.[100] || '#f3f4f6'} 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors?.gray?.[400] || '#9ca3af'};
  font-size: 0.875rem;
  min-height: ${props => props.$minHeight || '200px'};
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const ErrorPlaceholder = styled(LoadingPlaceholder)`
  background: ${props => props.theme.colors?.red?.[50] || '#fef2f2'};
  color: ${props => props.theme.colors?.red?.[500] || '#ef4444'};
  animation: none;
  
  &::before {
    content: '⚠️';
    margin-right: 0.5rem;
    font-size: 1.2em;
  }
`;

/**
 * Optimized Image Component
 */
const OptimizedImage = forwardRef(({
  src,
  alt = '',
  width,
  height,
  quality,
  format,
  lazy = true,
  responsive = true,
  aspectRatio,
  objectFit = 'cover',
  fallback,
  placeholder,
  className = '',
  inline = false,
  priority = false,
  sizes = '100vw',
  breakpoints,
  onLoad,
  onError,
  onLoadStart,
  ...props
}, ref) => {
  const [loading, setLoading] = useState(lazy);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef();
  const containerRef = useRef();

  /**
   * Generate optimized image URLs
   */
  const generateImageURLs = () => {
    const options = {
      width,
      height,
      quality,
      format,
      resize: 'fit'
    };

    const optimizedSrc = assetURLGenerator.generateImageURL(src, options);
    
    let srcSet = '';
    if (responsive && breakpoints) {
      srcSet = assetURLGenerator.generateResponsiveImageSrcSet(src, {
        ...options,
        breakpoints
      });
    } else if (responsive) {
      srcSet = assetURLGenerator.generateResponsiveImageSrcSet(src, options);
    }

    return { optimizedSrc, srcSet };
  };

  /**
   * Handle image load success
   */
  const handleLoad = (event) => {
    setLoading(false);
    setImageLoaded(true);
    setError(false);
    
    if (onLoad) {
      onLoad(event);
    }
  };

  /**
   * Handle image load error
   */
  const handleError = (event) => {
    setLoading(false);
    setError(true);
    
    if (onError) {
      onError(event);
    }
  };

  /**
   * Handle image load start
   */
  const handleLoadStart = (event) => {
    if (onLoadStart) {
      onLoadStart(event);
    }
  };

  /**
   * Setup lazy loading
   */
  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement || !lazy || priority) return;

    // Set loading class initially
    imageElement.classList.add('loading');

    // Setup lazy loading
    lazyLoadingManager.observe(imageElement);

    return () => {
      // Cleanup is handled by the lazy loading manager
    };
  }, [lazy, priority]);

  /**
   * Handle priority (immediate) loading
   */
  useEffect(() => {
    if (priority && imageRef.current) {
      const imageElement = imageRef.current;
      imageElement.classList.add('loading');
      
      // Load immediately for priority images
      const { optimizedSrc, srcSet } = generateImageURLs();
      
      if (srcSet) imageElement.srcset = srcSet;
      imageElement.src = optimizedSrc;
    }
  }, [priority, src, width, height, quality, format]);

  /**
   * Generate image attributes
   */
  const getImageAttributes = () => {
    const { optimizedSrc, srcSet } = generateImageURLs();
    
    const attributes = {
      ref: (el) => {
        imageRef.current = el;
        if (ref) {
          if (typeof ref === 'function') ref(el);
          else ref.current = el;
        }
      },
      alt,
      className: `optimized-image ${className}`,
      onLoad: handleLoad,
      onError: handleError,
      onLoadStart: handleLoadStart,
      loading: lazy && !priority ? 'lazy' : 'eager',
      decoding: priority ? 'sync' : 'async',
      ...props
    };

    if (lazy && !priority) {
      // For lazy loaded images, use data attributes
      attributes['data-src'] = optimizedSrc;
      if (srcSet) attributes['data-srcset'] = srcSet;
      if (sizes && responsive) attributes['data-sizes'] = sizes;
      if (fallback) attributes['data-fallback'] = fallback;
      
      // Provide a placeholder src to prevent broken image icon
      attributes.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==';
    } else {
      // For immediate loading
      attributes.src = optimizedSrc;
      if (srcSet) attributes.srcset = srcSet;
      if (sizes && responsive) attributes.sizes = sizes;
    }

    return attributes;
  };

  /**
   * Render loading placeholder
   */
  const renderPlaceholder = () => {
    if (placeholder === false) return null;
    
    if (placeholder) {
      return typeof placeholder === 'string' ? (
        <LoadingPlaceholder $aspectRatio={aspectRatio} $minHeight={height}>
          {placeholder}
        </LoadingPlaceholder>
      ) : placeholder;
    }

    return (
      <LoadingPlaceholder $aspectRatio={aspectRatio} $minHeight={height}>
        Loading image...
      </LoadingPlaceholder>
    );
  };

  /**
   * Render error placeholder
   */
  const renderErrorPlaceholder = () => {
    return (
      <ErrorPlaceholder $aspectRatio={aspectRatio} $minHeight={height}>
        Failed to load image
      </ErrorPlaceholder>
    );
  };

  return (
    <ImageContainer
      ref={containerRef}
      $inline={inline}
      $aspectRatio={aspectRatio}
      className={`optimized-image-container ${className}-container`}
    >
      {(loading && !imageLoaded) && renderPlaceholder()}
      {error && renderErrorPlaceholder()}
      
      <StyledImage
        {...getImageAttributes()}
        $aspectRatio={aspectRatio}
        $objectFit={objectFit}
        style={{
          display: (loading && !imageLoaded) || error ? 'none' : 'block'
        }}
      />
    </ImageContainer>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;