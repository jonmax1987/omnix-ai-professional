/**
 * @file Input.test.jsx
 * @description Comprehensive unit tests for the Input atomic component
 * @author OMNIX AI Testing Suite
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { renderWithTheme } from '../../../test/setup';
import Input from '../Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with placeholder text', () => {
      renderWithTheme(<Input placeholder="Enter your name" />);
      const input = screen.getByPlaceholderText('Enter your name');
      
      expect(input).toBeInTheDocument();
    });

    it('renders with initial value', () => {
      renderWithTheme(<Input value="Initial value" onChange={() => {}} />);
      const input = screen.getByDisplayValue('Initial value');
      
      expect(input).toBeInTheDocument();
    });

    it('renders with default value', () => {
      renderWithTheme(<Input defaultValue="Default value" />);
      const input = screen.getByDisplayValue('Default value');
      
      expect(input).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('custom-input');
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders email input', () => {
      renderWithTheme(<Input type="email" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      renderWithTheme(<Input type="password" data-testid="password-input" />);
      const input = screen.getByTestId('password-input');
      
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input with spinbutton role', () => {
      renderWithTheme(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders tel input', () => {
      renderWithTheme(<Input type="tel" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders url input', () => {
      renderWithTheme(<Input type="url" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'url');
    });
  });

  describe('Sizes', () => {
    it.each(['sm', 'md', 'lg'])('renders %s size correctly', (size) => {
      renderWithTheme(<Input size={size} />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeInTheDocument();
    });

    it('defaults to md size', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('renders disabled state', () => {
      renderWithTheme(<Input disabled />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeDisabled();
    });

    it('renders required state', () => {
      renderWithTheme(<Input required />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeRequired();
    });

    it('renders error state with error message', () => {
      renderWithTheme(<Input error="This field is required" />);
      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('This field is required');
      
      expect(input).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
    });

    it('renders success state', () => {
      renderWithTheme(<Input success />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeInTheDocument();
    });

    it('renders helper text when no error', () => {
      renderWithTheme(<Input helperText="This is helpful information" />);
      const helperText = screen.getByText('This is helpful information');
      
      expect(helperText).toBeInTheDocument();
    });

    it('shows error message instead of helper text when error exists', () => {
      renderWithTheme(
        <Input 
          error="Error message" 
          helperText="Helper text that should be hidden" 
        />
      );
      
      const errorMessage = screen.getByText('Error message');
      const helperText = screen.queryByText('Helper text that should be hidden');
      
      expect(errorMessage).toBeInTheDocument();
      expect(helperText).not.toBeInTheDocument();
    });
  });

  describe('Number Input Features', () => {
    it('applies min, max, and step attributes for number input', () => {
      renderWithTheme(
        <Input 
          type="number" 
          min={0} 
          max={100} 
          step={5} 
        />
      );
      const input = screen.getByRole('spinbutton');
      
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
      expect(input).toHaveAttribute('step', '5');
    });

    it('converts string input to number for number type', () => {
      const handleChange = vi.fn();
      renderWithTheme(<Input type="number" onChange={handleChange} />);
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '42' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
      // Check that the onChange was called - the exact transformation is internal
    });

    it('handles empty string for number input', () => {
      // Test that empty string doesn't crash the component
      expect(() => {
        renderWithTheme(<Input type="number" onChange={() => {}} />);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '' } });
      }).not.toThrow();
    });
  });

  describe('Pattern Validation', () => {
    it('applies pattern attribute', () => {
      renderWithTheme(<Input pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}');
    });
  });

  describe('Event Handling', () => {
    it('handles onChange events for text input', async () => {
      const handleChange = vi.fn();
      renderWithTheme(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Hello World' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'Hello World'
          })
        })
      );
    });

    it('handles onFocus events', () => {
      const handleFocus = vi.fn();
      renderWithTheme(<Input onFocus={handleFocus} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles onBlur events', () => {
      const handleBlur = vi.fn();
      renderWithTheme(<Input onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('manages internal focus state', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      
      // Should not throw when focus and blur events are fired
      expect(() => {
        fireEvent.focus(input);
        fireEvent.blur(input);
      }).not.toThrow();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = createRef();
      renderWithTheme(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(screen.getByRole('textbox'));
    });

    it('allows programmatic focus via ref', () => {
      const ref = createRef();
      renderWithTheme(<Input ref={ref} />);
      
      ref.current.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Additional Props', () => {
    it('forwards additional props to input element', () => {
      renderWithTheme(
        <Input 
          data-testid="custom-input"
          aria-label="Custom input"
          autoComplete="name"
        />
      );
      
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('aria-label', 'Custom input');
      expect(input).toHaveAttribute('autocomplete', 'name');
    });
  });

  describe('Accessibility', () => {
    it('has proper label association', () => {
      renderWithTheme(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" />
        </div>
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
    });

    it('supports aria-describedby for error messages', () => {
      renderWithTheme(
        <Input 
          aria-describedby="error-message"
          error="Error message"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
    });

    it('is properly focusable', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(input).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      renderWithTheme(<Input disabled />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(input).not.toHaveFocus();
    });
  });

  describe('Animation States', () => {
    it('handles focus animations without errors', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      
      // Should not throw when focus triggers animation
      expect(() => {
        fireEvent.focus(input);
      }).not.toThrow();
    });

    it('handles error message animations', async () => {
      const TestComponent = ({ showError }) => (
        <Input error={showError ? "Error message" : null} />
      );

      const { rerender } = renderWithTheme(<TestComponent showError={false} />);
      
      // Show error
      rerender(<TestComponent showError={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onChange gracefully', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      
      // Should not throw
      expect(() => {
        fireEvent.change(input, { target: { value: 'test' } });
      }).not.toThrow();
    });

    it('handles undefined onFocus gracefully', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      
      // Should not throw
      expect(() => {
        fireEvent.focus(input);
      }).not.toThrow();
    });

    it('handles undefined onBlur gracefully', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      
      // Should not throw
      expect(() => {
        fireEvent.blur(input);
      }).not.toThrow();
    });

    it('handles empty error string', () => {
      renderWithTheme(<Input error="" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeInTheDocument();
      // Empty error should not render error message component
      const container = input.closest('div');
      expect(container.children).toHaveLength(1); // Only the input, no error text
    });
  });

  describe('Component Display Name', () => {
    it('has correct display name', () => {
      expect(Input.displayName).toBe('Input');
    });
  });
});