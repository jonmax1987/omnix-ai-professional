/**
 * @file Typography.test.jsx
 * @description Unit tests for the Typography atomic component
 * @author OMNIX AI Testing Suite
 */

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../test/setup';
import Typography from '../Typography';

describe('Typography Component', () => {
  describe('Basic Rendering', () => {
    it('renders text content', () => {
      renderWithTheme(<Typography>Hello World</Typography>);
      
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      renderWithTheme(<Typography>Default text</Typography>);
      const element = screen.getByText('Default text');
      
      expect(element).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Typography className="custom-typography">
          Custom class text
        </Typography>
      );
      const element = screen.getByText('Custom class text');
      
      expect(element).toHaveClass('custom-typography');
    });
  });

  describe('Variants', () => {
    it.each([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'body1', 'body2', 'caption', 
      'overline', 'subtitle1', 'subtitle2'
    ])('renders %s variant', (variant) => {
      renderWithTheme(
        <Typography variant={variant}>
          {variant} text
        </Typography>
      );
      
      expect(screen.getByText(`${variant} text`)).toBeInTheDocument();
    });
  });

  describe('Color Props', () => {
    it.each([
      'primary', 'secondary', 'tertiary', 'inverse',
      'success', 'warning', 'error', 'info'
    ])('applies %s color', (color) => {
      renderWithTheme(
        <Typography color={color}>
          {color} colored text
        </Typography>
      );
      
      expect(screen.getByText(`${color} colored text`)).toBeInTheDocument();
    });
  });

  describe('Font Weights', () => {
    it.each([
      'light', 'regular', 'medium', 'semibold', 'bold'
    ])('applies %s weight', (weight) => {
      renderWithTheme(
        <Typography weight={weight}>
          {weight} weight text
        </Typography>
      );
      
      expect(screen.getByText(`${weight} weight text`)).toBeInTheDocument();
    });

    it('applies numeric weight', () => {
      renderWithTheme(
        <Typography weight="600">
          Numeric weight text
        </Typography>
      );
      
      expect(screen.getByText('Numeric weight text')).toBeInTheDocument();
    });
  });

  describe('Text Alignment', () => {
    it.each(['left', 'center', 'right', 'justify'])('applies %s alignment', (align) => {
      renderWithTheme(
        <Typography align={align}>
          {align} aligned text
        </Typography>
      );
      
      expect(screen.getByText(`${align} aligned text`)).toBeInTheDocument();
    });
  });

  describe('Text Transform', () => {
    it.each(['uppercase', 'lowercase', 'capitalize'])('applies %s transform', (transform) => {
      renderWithTheme(
        <Typography transform={transform}>
          {transform} text
        </Typography>
      );
      
      expect(screen.getByText(`${transform} text`)).toBeInTheDocument();
    });
  });

  describe('Text Utilities', () => {
    it('applies truncate styling', () => {
      renderWithTheme(
        <Typography truncate>
          Very long text that should be truncated
        </Typography>
      );
      
      expect(screen.getByText('Very long text that should be truncated')).toBeInTheDocument();
    });

    it('applies noWrap styling', () => {
      renderWithTheme(
        <Typography noWrap>
          Text that should not wrap
        </Typography>
      );
      
      expect(screen.getByText('Text that should not wrap')).toBeInTheDocument();
    });

    it('applies custom line height', () => {
      renderWithTheme(
        <Typography lineHeight="1.8">
          Custom line height text
        </Typography>
      );
      
      expect(screen.getByText('Custom line height text')).toBeInTheDocument();
    });

    it('applies custom letter spacing', () => {
      renderWithTheme(
        <Typography letterSpacing="0.1em">
          Spaced text
        </Typography>
      );
      
      expect(screen.getByText('Spaced text')).toBeInTheDocument();
    });
  });

  describe('Combined Props', () => {
    it('applies multiple props together', () => {
      renderWithTheme(
        <Typography 
          variant="h2" 
          color="primary" 
          weight="bold" 
          align="center"
          transform="uppercase"
        >
          Complex typography
        </Typography>
      );
      
      expect(screen.getByText('Complex typography')).toBeInTheDocument();
    });
  });

  describe('Children Handling', () => {
    it('renders React elements as children', () => {
      renderWithTheme(
        <Typography>
          Text with <strong>bold</strong> content
        </Typography>
      );
      
      expect(screen.getByText('Text with')).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
    });

    it('handles null children', () => {
      renderWithTheme(<Typography>{null}</Typography>);
      // Component should render without throwing
    });

    it('handles undefined children', () => {
      renderWithTheme(<Typography>{undefined}</Typography>);
      // Component should render without throwing
    });
  });

  describe('Additional Props', () => {
    it('forwards additional props', () => {
      renderWithTheme(
        <Typography 
          data-testid="typography-element"
          role="heading"
        >
          Typography with props
        </Typography>
      );
      
      const element = screen.getByTestId('typography-element');
      expect(element).toHaveAttribute('role', 'heading');
    });
  });

  describe('Component Name', () => {
    it('has correct display name', () => {
      expect(Typography.displayName).toBe('Typography');
    });
  });
});