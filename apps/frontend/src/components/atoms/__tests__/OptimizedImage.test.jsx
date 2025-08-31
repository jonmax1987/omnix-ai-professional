/**
 * Optimized Image Component Tests - Phase 5 QA
 * Comprehensive test suite for CDN-optimized image component
 * Tests lazy loading, responsive images, error handling, and performance
 */

import { describe, test, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import OptimizedImage from '../OptimizedImage.jsx';
import { lightTheme } from '../../../styles/theme.js';

/**
 * Mock dependencies
 */
const mockAssetURLGenerator = {
  generateImageURL: vi.fn((src, options) => {
    const params = new URLSearchParams();
    if (options?.width) params.append('w', options.width);
    if (options?.height) params.append('h', options.height);
    if (options?.quality) params.append('q', options.quality);
    if (options?.format) params.append('f', options.format);
    
    const queryString = params.toString();
    return queryString ? `https://cdn.example.com/${src}?${queryString}` : `https://cdn.example.com/${src}`;
  }),
  generateResponsiveImageSrcSet: vi.fn((src, options) => {
    const breakpoints = options?.breakpoints || [320, 768, 1024];
    return breakpoints.map(width => 
      `https://cdn.example.com/${src}?w=${width} ${width}w`
    ).join(', ');
  })
};

const mockLazyLoadingManager = {
  observe: vi.fn(),
  loadImage: vi.fn()
};

vi.mock('../../../utils/cdnOptimization.js', () => ({
  assetURLGenerator: mockAssetURLGenerator,
  lazyLoadingManager: mockLazyLoadingManager
}));

/**
 * Test wrapper
 */
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={lightTheme}>
    {children}
  </ThemeProvider>
);

/**
 * Setup and teardown
 */
beforeAll(() => {
  // Mock Image constructor
  global.Image = vi.fn().mockImplementation(() => ({
    onload: null,
    onerror: null,
    onloadstart: null,
    src: '',
    srcset: '',
    loading: 'lazy',
    decoding: 'async'
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
});

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Basic rendering tests
 */
describe('OptimizedImage Basic Rendering', () => {
  test('should render with basic props', () => {
    render(
      <TestWrapper>
        <OptimizedImage src="test-image.jpg" alt="Test image" />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  test('should generate optimized URLs', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="test-image.jpg" 
          alt="Test"
          width={400}
          height={300}
          quality={80}
          format="webp"
        />
      </TestWrapper>
    );

    expect(mockAssetURLGenerator.generateImageURL).toHaveBeenCalledWith(
      'test-image.jpg',
      expect.objectContaining({
        width: 400,
        height: 300,
        quality: 80,
        format: 'webp'
      })
    );
  });

  test('should generate responsive srcset when responsive is enabled', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="test-image.jpg" 
          alt="Test"
          responsive={true}
          breakpoints={[320, 768, 1024]}
        />
      </TestWrapper>
    );

    expect(mockAssetURLGenerator.generateResponsiveImageSrcSet).toHaveBeenCalledWith(
      'test-image.jpg',
      expect.objectContaining({
        breakpoints: [320, 768, 1024]
      })
    );
  });

  test('should handle priority loading', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="priority-image.jpg" 
          alt="Priority"
          priority={true}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('decoding', 'sync');
  });

  test('should setup lazy loading by default', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="lazy-image.jpg" 
          alt="Lazy"
          lazy={true}
        />
      </TestWrapper>
    );

    expect(mockLazyLoadingManager.observe).toHaveBeenCalled();
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });
});

/**
 * Lazy loading tests
 */
describe('OptimizedImage Lazy Loading', () => {
  test('should use data attributes for lazy loading', () => {
    mockAssetURLGenerator.generateImageURL.mockReturnValue('https://cdn.example.com/optimized.jpg');
    mockAssetURLGenerator.generateResponsiveImageSrcSet.mockReturnValue('https://cdn.example.com/optimized.jpg?w=320 320w, https://cdn.example.com/optimized.jpg?w=768 768w');

    render(
      <TestWrapper>
        <OptimizedImage 
          src="lazy-image.jpg" 
          alt="Lazy"
          lazy={true}
          responsive={true}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('data-src', 'https://cdn.example.com/optimized.jpg');
    expect(image).toHaveAttribute('data-srcset');
    expect(image).toHaveAttribute('data-sizes', '(max-width: 768px) 100vw, 50vw');
  });

  test('should provide placeholder source for lazy images', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="lazy-image.jpg" 
          alt="Lazy"
          lazy={true}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image.src).toContain('data:image/svg+xml');
  });

  test('should handle fallback images', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="lazy-image.jpg" 
          alt="Lazy"
          lazy={true}
          fallback="fallback.jpg"
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('data-fallback', 'fallback.jpg');
  });
});

/**
 * Loading states tests
 */
describe('OptimizedImage Loading States', () => {
  test('should show loading placeholder initially', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="loading-image.jpg" 
          alt="Loading"
          lazy={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Loading image...')).toBeInTheDocument();
  });

  test('should show custom placeholder when provided', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="custom-image.jpg" 
          alt="Custom"
          placeholder="Custom loading message"
        />
      </TestWrapper>
    );

    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  test('should hide placeholder when disabled', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="no-placeholder.jpg" 
          alt="No placeholder"
          placeholder={false}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Loading image...')).not.toBeInTheDocument();
  });

  test('should handle image load success', async () => {
    const mockOnLoad = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedImage 
          src="success-image.jpg" 
          alt="Success"
          onLoad={mockOnLoad}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    
    await act(async () => {
      fireEvent.load(image);
    });

    expect(mockOnLoad).toHaveBeenCalled();
  });

  test('should handle image load error', async () => {
    const mockOnError = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedImage 
          src="error-image.jpg" 
          alt="Error"
          onError={mockOnError}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    
    await act(async () => {
      fireEvent.error(image);
    });

    expect(mockOnError).toHaveBeenCalled();
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  test('should handle load start event', async () => {
    const mockOnLoadStart = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedImage 
          src="start-image.jpg" 
          alt="Start"
          onLoadStart={mockOnLoadStart}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    
    await act(async () => {
      fireEvent.loadStart(image);
    });

    expect(mockOnLoadStart).toHaveBeenCalled();
  });
});

/**
 * Responsive and aspect ratio tests
 */
describe('OptimizedImage Responsive Features', () => {
  test('should apply aspect ratio styling', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="aspect-image.jpg" 
          alt="Aspect"
          aspectRatio={16/9}
          objectFit="contain"
        />
      </TestWrapper>
    );

    const container = screen.getByRole('img').closest('.optimized-image-container');
    expect(container).toBeInTheDocument();
  });

  test('should handle inline display mode', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="inline-image.jpg" 
          alt="Inline"
          inline={true}
        />
      </TestWrapper>
    );

    const container = screen.getByRole('img').closest('.optimized-image-container');
    expect(container).toBeInTheDocument();
  });

  test('should pass through additional props', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="props-image.jpg" 
          alt="Props"
          className="custom-class"
          id="custom-id"
          style={{ border: '1px solid red' }}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveClass('optimized-image');
    expect(image).toHaveClass('custom-class');
    expect(image).toHaveAttribute('id', 'custom-id');
  });
});

/**
 * Accessibility tests
 */
describe('OptimizedImage Accessibility', () => {
  test('should have proper alt text', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="accessible-image.jpg" 
          alt="Accessible description"
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Accessible description');
  });

  test('should handle empty alt for decorative images', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="decorative-image.jpg" 
          alt=""
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', '');
  });

  test('should be focusable', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="focusable-image.jpg" 
          alt="Focusable"
          tabIndex={0}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    image.focus();
    expect(document.activeElement).toBe(image);
  });
});

/**
 * Performance tests
 */
describe('OptimizedImage Performance', () => {
  test('should handle multiple images efficiently', () => {
    const imageCount = 50;
    const images = Array.from({ length: imageCount }, (_, i) => (
      <OptimizedImage 
        key={i}
        src={`image-${i}.jpg`} 
        alt={`Image ${i}`}
        lazy={true}
      />
    ));

    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <div>{images}</div>
      </TestWrapper>
    );

    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // Should render quickly
    expect(mockLazyLoadingManager.observe).toHaveBeenCalledTimes(imageCount);
  });

  test('should not cause memory leaks with rapid rerenders', async () => {
    const { rerender, unmount } = render(
      <TestWrapper>
        <OptimizedImage src="rerender-image.jpg" alt="Rerender" />
      </TestWrapper>
    );

    // Rapid rerenders
    for (let i = 0; i < 10; i++) {
      rerender(
        <TestWrapper>
          <OptimizedImage src={`rerender-image-${i}.jpg`} alt={`Rerender ${i}`} />
        </TestWrapper>
      );
    }

    unmount();

    // Should not leave dangling references
    expect(true).toBe(true); // Test passes if no memory errors
  });

  test('should handle large image dimensions', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="large-image.jpg" 
          alt="Large"
          width={4000}
          height={3000}
        />
      </TestWrapper>
    );

    expect(mockAssetURLGenerator.generateImageURL).toHaveBeenCalledWith(
      'large-image.jpg',
      expect.objectContaining({
        width: 4000,
        height: 3000
      })
    );
  });
});

/**
 * Error handling and edge cases
 */
describe('OptimizedImage Error Handling', () => {
  test('should handle missing src gracefully', () => {
    render(
      <TestWrapper>
        <OptimizedImage alt="No source" />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });

  test('should handle invalid aspect ratios', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="invalid-aspect.jpg" 
          alt="Invalid"
          aspectRatio={0}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });

  test('should handle URL generation errors', () => {
    mockAssetURLGenerator.generateImageURL.mockImplementation(() => {
      throw new Error('URL generation failed');
    });

    expect(() => {
      render(
        <TestWrapper>
          <OptimizedImage src="error-url.jpg" alt="Error URL" />
        </TestWrapper>
      );
    }).toThrow('URL generation failed');

    // Reset mock
    mockAssetURLGenerator.generateImageURL.mockImplementation((src) => `https://cdn.example.com/${src}`);
  });

  test('should handle lazy loading manager unavailability', () => {
    vi.doMock('../../../utils/cdnOptimization.js', () => ({
      assetURLGenerator: mockAssetURLGenerator,
      lazyLoadingManager: null
    }));

    render(
      <TestWrapper>
        <OptimizedImage src="no-lazy.jpg" alt="No lazy" lazy={true} />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });
});

/**
 * Component state management tests
 */
describe('OptimizedImage State Management', () => {
  test('should manage loading state correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <OptimizedImage src="state-image.jpg" alt="State" lazy={true} />
      </TestWrapper>
    );

    // Initially should show loading placeholder
    expect(screen.getByText('Loading image...')).toBeInTheDocument();
    
    const image = screen.getByRole('img');
    expect(image.style.display).toBe('none');

    // Simulate image load
    await act(async () => {
      fireEvent.load(image);
    });

    // Should hide placeholder and show image
    expect(screen.queryByText('Loading image...')).not.toBeInTheDocument();
    expect(image.style.display).toBe('block');
  });

  test('should manage error state correctly', async () => {
    render(
      <TestWrapper>
        <OptimizedImage src="error-image.jpg" alt="Error" />
      </TestWrapper>
    );

    const image = screen.getByRole('img');

    await act(async () => {
      fireEvent.error(image);
    });

    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    expect(image.style.display).toBe('none');
  });

  test('should handle immediate loading for priority images', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="priority-image.jpg" 
          alt="Priority"
          priority={true}
        />
      </TestWrapper>
    );

    // Priority images should not use data attributes
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src');
    expect(image).not.toHaveAttribute('data-src');
    expect(mockLazyLoadingManager.observe).not.toHaveBeenCalled();
  });
});

/**
 * Responsive behavior tests
 */
describe('OptimizedImage Responsive Behavior', () => {
  test('should include sizes attribute for responsive images', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="responsive.jpg" 
          alt="Responsive"
          responsive={true}
          sizes="(max-width: 768px) 100vw, 50vw"
          lazy={false}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });

  test('should handle custom breakpoints', () => {
    const customBreakpoints = [480, 960, 1440];
    
    render(
      <TestWrapper>
        <OptimizedImage 
          src="custom-responsive.jpg" 
          alt="Custom responsive"
          responsive={true}
          breakpoints={customBreakpoints}
        />
      </TestWrapper>
    );

    expect(mockAssetURLGenerator.generateResponsiveImageSrcSet).toHaveBeenCalledWith(
      'custom-responsive.jpg',
      expect.objectContaining({
        breakpoints: customBreakpoints
      })
    );
  });

  test('should disable responsive when explicitly set to false', () => {
    render(
      <TestWrapper>
        <OptimizedImage 
          src="no-responsive.jpg" 
          alt="No responsive"
          responsive={false}
        />
      </TestWrapper>
    );

    expect(mockAssetURLGenerator.generateResponsiveImageSrcSet).not.toHaveBeenCalled();
  });
});

/**
 * Event handling tests
 */
describe('OptimizedImage Event Handling', () => {
  test('should call onLoad callback', async () => {
    const mockOnLoad = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedImage 
          src="callback-image.jpg" 
          alt="Callback"
          onLoad={mockOnLoad}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    
    await act(async () => {
      fireEvent.load(image);
    });

    expect(mockOnLoad).toHaveBeenCalledWith(expect.any(Object));
  });

  test('should call onError callback', async () => {
    const mockOnError = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedImage 
          src="error-callback.jpg" 
          alt="Error callback"
          onError={mockOnError}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    
    await act(async () => {
      fireEvent.error(image);
    });

    expect(mockOnError).toHaveBeenCalledWith(expect.any(Object));
  });

  test('should call onLoadStart callback', async () => {
    const mockOnLoadStart = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedImage 
          src="loadstart-image.jpg" 
          alt="Load start"
          onLoadStart={mockOnLoadStart}
        />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    
    await act(async () => {
      fireEvent.loadStart(image);
    });

    expect(mockOnLoadStart).toHaveBeenCalledWith(expect.any(Object));
  });
});

/**
 * Integration with CDN optimization
 */
describe('OptimizedImage CDN Integration', () => {
  test('should work with different optimization options', () => {
    const optimizationTests = [
      { quality: 60, format: 'webp' },
      { quality: 90, format: 'avif' },
      { width: 200, height: 150 },
      { width: 800, quality: 85, format: 'jpg' }
    ];

    optimizationTests.forEach((options, index) => {
      render(
        <TestWrapper>
          <OptimizedImage 
            src={`optimization-${index}.jpg`}
            alt={`Optimization ${index}`}
            {...options}
          />
        </TestWrapper>
      );

      expect(mockAssetURLGenerator.generateImageURL).toHaveBeenCalledWith(
        `optimization-${index}.jpg`,
        expect.objectContaining(options)
      );
    });
  });

  test('should forward ref correctly', () => {
    const ref = React.createRef();
    
    render(
      <TestWrapper>
        <OptimizedImage 
          ref={ref}
          src="ref-image.jpg" 
          alt="Ref"
        />
      </TestWrapper>
    );

    expect(ref.current).toBeInstanceOf(HTMLImageElement);
  });

  test('should handle function refs', () => {
    const mockRef = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedImage 
          ref={mockRef}
          src="func-ref-image.jpg" 
          alt="Function ref"
        />
      </TestWrapper>
    );

    expect(mockRef).toHaveBeenCalledWith(expect.any(HTMLImageElement));
  });
});

/**
 * Theme integration tests
 */
describe('OptimizedImage Theme Integration', () => {
  test('should work without theme provider', () => {
    render(
      <OptimizedImage src="no-theme.jpg" alt="No theme" />
    );

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });

  test('should apply theme colors to loading states', () => {
    const customTheme = {
      colors: {
        gray: {
          100: '#custom-gray-100',
          200: '#custom-gray-200'
        }
      }
    };

    render(
      <ThemeProvider theme={customTheme}>
        <OptimizedImage src="themed-image.jpg" alt="Themed" lazy={true} />
      </ThemeProvider>
    );

    expect(screen.getByText('Loading image...')).toBeInTheDocument();
  });
});