// ProductCard Test Suite
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ProductCard, { ProductCardVariants, RecommendationTypes, ProductStatus } from '../ProductCard';
import { lightTheme } from '../../../styles/theme';

// Mock the hooks
jest.mock('../../../hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key) => key
  })
}));

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      {component}
    </ThemeProvider>
  );
};

const mockProduct = {
  id: 'product-1',
  name: 'Test Product',
  description: 'This is a test product description',
  price: 29.99,
  originalPrice: 39.99,
  category: 'Electronics',
  brand: 'TestBrand',
  stockLevel: 25,
  rating: 4.5,
  reviewCount: 128,
  image: 'test-product.jpg'
};

const mockRecommendations = [
  { type: RecommendationTypes.BESTSELLER },
  { type: RecommendationTypes.PERSONALIZED }
];

describe('ProductCard', () => {
  it('renders product with basic information', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  it('displays discount information when original price is higher', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} />
    );

    expect(screen.getByText('$39.99')).toBeInTheDocument(); // Original price
    expect(screen.getByText('-25%')).toBeInTheDocument(); // Discount badge
  });

  it('shows rating and review count', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} />
    );

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(128)')).toBeInTheDocument();
  });

  it('renders AI recommendations', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} recommendations={mockRecommendations} />
    );

    expect(screen.getByText('product.aiRecommendations')).toBeInTheDocument();
    expect(screen.getByText('product.recommendations.bestseller')).toBeInTheDocument();
    expect(screen.getByText('product.recommendations.personalized')).toBeInTheDocument();
  });

  it('handles different product card variants', () => {
    const { rerender, container } = renderWithTheme(
      <ProductCard {...mockProduct} variant={ProductCardVariants.COMPACT} />
    );

    expect(container.firstChild).toHaveClass('product-card-compact');

    rerender(
      <ThemeProvider theme={lightTheme}>
        <ProductCard {...mockProduct} variant={ProductCardVariants.GRID} />
      </ThemeProvider>
    );

    expect(container.firstChild).toHaveClass('product-card-grid');
  });

  it('displays stock status correctly', () => {
    // Test low stock
    const { rerender } = renderWithTheme(
      <ProductCard {...mockProduct} stockLevel={5} />
    );

    expect(screen.getByText('product.status.lowStock')).toBeInTheDocument();

    // Test out of stock
    rerender(
      <ThemeProvider theme={lightTheme}>
        <ProductCard {...mockProduct} stockLevel={0} />
      </ThemeProvider>
    );

    expect(screen.getByText('product.status.outOfStock')).toBeInTheDocument();
  });

  it('handles favorite functionality', () => {
    const mockOnFavorite = jest.fn();

    renderWithTheme(
      <ProductCard {...mockProduct} onFavorite={mockOnFavorite} />
    );

    const favoriteButton = screen.getByLabelText('product.addFavorite');
    fireEvent.click(favoriteButton);

    expect(mockOnFavorite).toHaveBeenCalledWith(mockProduct.id, true);
  });

  it('handles add to cart functionality', () => {
    const mockOnAddToCart = jest.fn();

    renderWithTheme(
      <ProductCard {...mockProduct} onAddToCart={mockOnAddToCart} />
    );

    const addToCartButton = screen.getByText('product.addToCart');
    fireEvent.click(addToCartButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct.id, 1);
  });

  it('handles quick view functionality', () => {
    const mockOnQuickView = jest.fn();

    renderWithTheme(
      <ProductCard {...mockProduct} onQuickView={mockOnQuickView} />
    );

    const quickViewButton = screen.getByText('product.quickView');
    fireEvent.click(quickViewButton);

    expect(mockOnQuickView).toHaveBeenCalledWith(mockProduct.id);
  });

  it('handles product selection', () => {
    const mockOnSelect = jest.fn();

    renderWithTheme(
      <ProductCard {...mockProduct} onSelect={mockOnSelect} />
    );

    fireEvent.click(screen.getByText('Test Product'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockProduct.id, true, expect.any(Object));
  });

  it('displays featured badge for featured products', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} featured={true} />
    );

    expect(screen.getByText('product.featured')).toBeInTheDocument();
  });

  it('shows AI insight when provided', () => {
    const aiInsight = 'This product is trending among similar customers';

    renderWithTheme(
      <ProductCard {...mockProduct} aiInsight={aiInsight} />
    );

    expect(screen.getByText('AI Insight')).toBeInTheDocument();
    expect(screen.getByText(aiInsight)).toBeInTheDocument();
  });

  it('renders custom actions', () => {
    const customActions = [
      {
        id: 'compare',
        label: 'Compare',
        icon: 'GitCompare',
        onClick: jest.fn()
      },
      {
        id: 'share',
        label: 'Share',
        icon: 'Share2',
        onClick: jest.fn()
      }
    ];

    renderWithTheme(
      <ProductCard {...mockProduct} actions={customActions} />
    );

    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('disables actions when out of stock', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} stockLevel={0} />
    );

    const addToCartButton = screen.getByText('product.addToCart');
    expect(addToCartButton).toBeDisabled();
  });

  it('shows placeholder when no image is provided', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} image={null} />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Icon placeholder
  });

  it('handles compact variant correctly', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} variant={ProductCardVariants.COMPACT} />
    );

    // In compact mode, description shouldn't be shown
    expect(screen.queryByText('This is a test product description')).not.toBeInTheDocument();
    
    // Buttons should show icons only
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = renderWithTheme(
      <ProductCard
        {...mockProduct}
        variant={ProductCardVariants.GRID}
        className="custom-class"
        featured={true}
      />
    );

    const productElement = container.firstChild;
    expect(productElement).toHaveClass('product-card');
    expect(productElement).toHaveClass('product-card-grid');
    expect(productElement).toHaveClass('custom-class');
  });

  it('prevents click propagation for action buttons', () => {
    const mockOnClick = jest.fn();
    const mockOnAddToCart = jest.fn();

    renderWithTheme(
      <ProductCard
        {...mockProduct}
        onClick={mockOnClick}
        onAddToCart={mockOnAddToCart}
      />
    );

    // Click on add to cart button shouldn't trigger card click
    const addToCartButton = screen.getByText('product.addToCart');
    fireEvent.click(addToCartButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct.id, 1);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('shows stock level information', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} stockLevel={25} />
    );

    expect(screen.getByText('25 product.inStock')).toBeInTheDocument();
  });

  it('hides metrics when showMetrics is false', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} showMetrics={false} />
    );

    expect(screen.queryByText('4.5')).not.toBeInTheDocument();
    expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
  });

  it('hides actions when showActions is false', () => {
    renderWithTheme(
      <ProductCard {...mockProduct} showActions={false} />
    );

    expect(screen.queryByText('product.addToCart')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('product.addFavorite')).not.toBeInTheDocument();
  });
});