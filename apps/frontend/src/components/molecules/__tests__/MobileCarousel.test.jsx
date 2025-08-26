import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../../test/setup';
import MobileCarousel from '../MobileCarousel';

// Mock the mobile gesture hooks
vi.mock('../../../hooks/useMobileGestures', () => ({
  useSwipe: vi.fn(() => ({ current: null })),
}));

vi.mock('../../../utils/mobileGestures', () => ({
  SWIPE_DIRECTIONS: {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
  },
  isTouchDevice: vi.fn(() => false) // Default to desktop for testing
}));

describe('MobileCarousel Component', () => {
  const mockSlides = [
    <div key="slide1">Slide 1 Content</div>,
    <div key="slide2">Slide 2 Content</div>,
    <div key="slide3">Slide 3 Content</div>
  ];

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders all slides', () => {
    renderWithTheme(
      <MobileCarousel>
        {mockSlides}
      </MobileCarousel>
    );

    expect(screen.getByText('Slide 1 Content')).toBeInTheDocument();
    expect(screen.getByText('Slide 2 Content')).toBeInTheDocument();
    expect(screen.getByText('Slide 3 Content')).toBeInTheDocument();
  });

  it('shows indicators when enabled', () => {
    renderWithTheme(
      <MobileCarousel showIndicators={true}>
        {mockSlides}
      </MobileCarousel>
    );

    // Should show 3 indicators for 3 slides
    const indicators = screen.getAllByRole('button');
    const indicatorButtons = indicators.filter(button => 
      button.getAttribute('title')?.includes('Go to slide')
    );
    expect(indicatorButtons).toHaveLength(3);
  });

  it('shows navigation buttons when enabled', () => {
    renderWithTheme(
      <MobileCarousel showNavigation={true}>
        {mockSlides}
      </MobileCarousel>
    );

    expect(screen.getByTitle('Previous slide')).toBeInTheDocument();
    expect(screen.getByTitle('Next slide')).toBeInTheDocument();
  });

  it('shows slide counter when enabled', () => {
    renderWithTheme(
      <MobileCarousel showCounter={true}>
        {mockSlides}
      </MobileCarousel>
    );

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates to next slide when next button is clicked', () => {
    renderWithTheme(
      <MobileCarousel showNavigation={true} showCounter={true}>
        {mockSlides}
      </MobileCarousel>
    );

    const nextButton = screen.getByTitle('Next slide');
    fireEvent.click(nextButton);

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates to previous slide when prev button is clicked', () => {
    renderWithTheme(
      <MobileCarousel showNavigation={true} showCounter={true} initialSlide={1}>
        {mockSlides}
      </MobileCarousel>
    );

    const prevButton = screen.getByTitle('Previous slide');
    fireEvent.click(prevButton);

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates to specific slide when indicator is clicked', () => {
    renderWithTheme(
      <MobileCarousel showIndicators={true} showCounter={true}>
        {mockSlides}
      </MobileCarousel>
    );

    const indicators = screen.getAllByRole('button');
    const thirdIndicator = indicators.find(button => 
      button.getAttribute('title') === 'Go to slide 3'
    );
    
    if (thirdIndicator) {
      fireEvent.click(thirdIndicator);
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    }
  });

  it('disables prev button on first slide', () => {
    renderWithTheme(
      <MobileCarousel showNavigation={true}>
        {mockSlides}
      </MobileCarousel>
    );

    const prevButton = screen.getByTitle('Previous slide');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last slide', () => {
    renderWithTheme(
      <MobileCarousel showNavigation={true} initialSlide={2}>
        {mockSlides}
      </MobileCarousel>
    );

    const nextButton = screen.getByTitle('Next slide');
    expect(nextButton).toBeDisabled();
  });

  it('calls onSlideChange when slide changes', () => {
    const handleSlideChange = vi.fn();
    renderWithTheme(
      <MobileCarousel 
        showNavigation={true}
        onSlideChange={handleSlideChange}
      >
        {mockSlides}
      </MobileCarousel>
    );

    const nextButton = screen.getByTitle('Next slide');
    fireEvent.click(nextButton);

    expect(handleSlideChange).toHaveBeenCalledWith(1);
  });

  it('handles single slide correctly', () => {
    renderWithTheme(
      <MobileCarousel showNavigation={true} showIndicators={true}>
        <div>Single slide</div>
      </MobileCarousel>
    );

    expect(screen.getByText('Single slide')).toBeInTheDocument();
    
    // Should not show navigation for single slide
    expect(screen.queryByTitle('Previous slide')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Next slide')).not.toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    renderWithTheme(
      <MobileCarousel>
        {[]}
      </MobileCarousel>
    );

    // Should not crash with empty children
    const carousel = document.querySelector('[data-testid="carousel"]') || 
                    screen.getByRole('region', { hidden: true });
    // Component should render without errors
  });

  it('applies custom className', () => {
    renderWithTheme(
      <MobileCarousel className="custom-carousel">
        {mockSlides}
      </MobileCarousel>
    );

    const carousel = screen.getByText('Slide 1 Content').closest('.custom-carousel') ||
                    screen.getByText('Slide 1 Content').parentElement;
    
    expect(carousel).toHaveClass('custom-carousel');
  });

  it('starts at specified initial slide', () => {
    renderWithTheme(
      <MobileCarousel initialSlide={1} showCounter={true}>
        {mockSlides}
      </MobileCarousel>
    );

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('handles initialSlide beyond slide count', () => {
    renderWithTheme(
      <MobileCarousel initialSlide={10} showCounter={true}>
        {mockSlides}
      </MobileCarousel>
    );

    // Should clamp to last slide
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('handles negative initialSlide', () => {
    renderWithTheme(
      <MobileCarousel initialSlide={-1} showCounter={true}>
        {mockSlides}
      </MobileCarousel>
    );

    // Should clamp to first slide
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});