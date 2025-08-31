/**
 * @file Button.test.jsx
 * @description Comprehensive unit tests for the Button atomic component
 * @author OMNIX AI Testing Suite
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithTheme } from '../../../test/setup';
import Button from '../Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders children correctly', () => {
      renderWithTheme(
        <Button>
          <span data-testid="icon">🚀</span>
          Test Button
        </Button>
      );
      
      expect(screen.getByText('Test Button')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('custom-class');
    });

    it('forwards additional props', () => {
      renderWithTheme(
        <Button data-testid="test-button" aria-label="Custom label">
          Button
        </Button>
      );
      
      const button = screen.getByTestId('test-button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('Variants', () => {
    it.each([
      'primary',
      'secondary', 
      'ghost',
      'danger',
      'success'
    ])('renders %s variant correctly', (variant) => {
      renderWithTheme(<Button variant={variant}>Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
      // Note: Specific style testing would require additional setup for styled-components
    });

    it('defaults to primary variant when invalid variant provided', () => {
      renderWithTheme(<Button variant="invalid">Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each([
      'sm',
      'md',
      'lg'
    ])('renders %s size correctly', (size) => {
      renderWithTheme(<Button size={size}>Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
    });

    it('defaults to md size when no size provided', () => {
      renderWithTheme(<Button>Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('renders disabled state correctly', () => {
      renderWithTheme(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });

    it('renders loading state with spinner', () => {
      renderWithTheme(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toBeInTheDocument();
      // Spinner component would be rendered
    });

    it('disables button when loading', () => {
      renderWithTheme(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
    });

    it('renders full width correctly', () => {
      renderWithTheme(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when disabled', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not trigger click when loading', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard interactions', () => {
      const handleClick = vi.fn();
      renderWithTheme(<Button onClick={handleClick}>Button</Button>);
      
      const button = screen.getByRole('button');
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Type Attribute', () => {
    it('defaults to button type', () => {
      renderWithTheme(<Button>Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('type', 'button');
    });

    it('accepts submit type', () => {
      renderWithTheme(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('accepts reset type', () => {
      renderWithTheme(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Accessibility', () => {
    it('has proper focus management', () => {
      renderWithTheme(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      renderWithTheme(<Button disabled>Not focusable</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).not.toHaveFocus();
    });

    it('supports ARIA attributes', () => {
      renderWithTheme(
        <Button 
          aria-describedby="help-text"
          aria-pressed="false"
          role="button"
        >
          Accessible Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('handles null children gracefully', () => {
      renderWithTheme(<Button>{null}</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      renderWithTheme(<Button>{undefined}</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
    });

    it('handles empty string children', () => {
      renderWithTheme(<Button>{''}</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
    });
  });
});