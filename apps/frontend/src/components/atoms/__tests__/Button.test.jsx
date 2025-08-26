import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../../test/setup';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    renderWithTheme(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('applies the correct variant classes', () => {
    renderWithTheme(<Button variant="primary">Primary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('applies the correct size classes', () => {
    renderWithTheme(<Button size="lg">Large Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button onClick={handleClick}>Clickable</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon when provided', () => {
    renderWithTheme(
      <Button icon="plus">
        Add Item
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Add Item');
  });

  it('shows loading state correctly', () => {
    renderWithTheme(<Button loading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    renderWithTheme(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders as full width when fullWidth is true', () => {
    renderWithTheme(<Button fullWidth>Full Width Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('supports custom className', () => {
    renderWithTheme(<Button className="custom-class">Custom Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders without crashing', () => {
    const { container } = renderWithTheme(<Button>Test Button</Button>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders different variants correctly', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
    
    variants.forEach(variant => {
      const { unmount } = renderWithTheme(
        <Button variant={variant}>{variant} Button</Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      unmount();
    });
  });

  it('renders different sizes correctly', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'];
    
    sizes.forEach(size => {
      const { unmount } = renderWithTheme(
        <Button size={size}>{size} Button</Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      unmount();
    });
  });

  it('prevents click when loading', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <Button onClick={handleClick} loading>
        Loading Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('prevents click when disabled', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});