import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../test/setup';
import Typography from '../Typography';

describe('Typography Component', () => {
  it('renders correctly with default props', () => {
    renderWithTheme(<Typography>Default text</Typography>);
    
    const text = screen.getByText('Default text');
    expect(text).toBeInTheDocument();
  });

  it('renders different variants correctly', () => {
    const variants = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'subtitle1', 'subtitle2',
      'body1', 'body2',
      'caption', 'overline'
    ];
    
    variants.forEach(variant => {
      const { unmount } = renderWithTheme(
        <Typography variant={variant}>{variant} text</Typography>
      );
      
      const text = screen.getByText(`${variant} text`);
      expect(text).toBeInTheDocument();
      
      unmount();
    });
  });

  it('applies weight correctly', () => {
    renderWithTheme(<Typography weight="bold">Bold text</Typography>);
    
    const text = screen.getByText('Bold text');
    expect(text).toBeInTheDocument();
  });

  it('applies color correctly', () => {
    renderWithTheme(<Typography color="primary">Primary text</Typography>);
    
    const text = screen.getByText('Primary text');
    expect(text).toBeInTheDocument();
  });

  it('applies align correctly', () => {
    renderWithTheme(<Typography align="center">Centered text</Typography>);
    
    const text = screen.getByText('Centered text');
    expect(text).toBeInTheDocument();
  });

  it('renders with truncate', () => {
    renderWithTheme(<Typography truncate>Very long text that should be truncated</Typography>);
    
    const text = screen.getByText('Very long text that should be truncated');
    expect(text).toBeInTheDocument();
  });

  it('renders with custom component', () => {
    renderWithTheme(
      <Typography as="span">Span text</Typography>
    );
    
    const text = screen.getByText('Span text');
    expect(text).toBeInTheDocument();
    expect(text.tagName.toLowerCase()).toBe('span');
  });

  it('supports custom className', () => {
    renderWithTheme(
      <Typography className="custom-class">Custom text</Typography>
    );
    
    const text = screen.getByText('Custom text');
    expect(text).toHaveClass('custom-class');
  });

  it('renders with noWrap', () => {
    renderWithTheme(
      <Typography noWrap>Text that should not wrap</Typography>
    );
    
    const text = screen.getByText('Text that should not wrap');
    expect(text).toBeInTheDocument();
  });

  it('renders with gutterBottom', () => {
    renderWithTheme(
      <Typography gutterBottom>Text with bottom margin</Typography>
    );
    
    const text = screen.getByText('Text with bottom margin');
    expect(text).toBeInTheDocument();
  });

  it('handles different color variants', () => {
    const colors = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];
    
    colors.forEach(color => {
      const { unmount } = renderWithTheme(
        <Typography color={color}>{color} text</Typography>
      );
      
      const text = screen.getByText(`${color} text`);
      expect(text).toBeInTheDocument();
      
      unmount();
    });
  });

  it('handles different weight variants', () => {
    const weights = ['light', 'regular', 'medium', 'semibold', 'bold'];
    
    weights.forEach(weight => {
      const { unmount } = renderWithTheme(
        <Typography weight={weight}>{weight} text</Typography>
      );
      
      const text = screen.getByText(`${weight} text`);
      expect(text).toBeInTheDocument();
      
      unmount();
    });
  });

  it('renders correct HTML elements for headings', () => {
    const headings = [
      { variant: 'h1', tag: 'h1' },
      { variant: 'h2', tag: 'h2' },
      { variant: 'h3', tag: 'h3' },
      { variant: 'h4', tag: 'h4' },
      { variant: 'h5', tag: 'h5' },
      { variant: 'h6', tag: 'h6' }
    ];
    
    headings.forEach(({ variant, tag }) => {
      const { unmount } = renderWithTheme(
        <Typography variant={variant}>Heading</Typography>
      );
      
      const element = screen.getByRole('heading');
      expect(element.tagName.toLowerCase()).toBe(tag);
      
      unmount();
    });
  });
});