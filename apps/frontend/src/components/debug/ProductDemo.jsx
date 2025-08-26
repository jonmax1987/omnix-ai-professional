// Product Demo Component
// Demonstrates ProductCard functionality with various examples
import React, { useState } from 'react';
import styled from 'styled-components';
import ProductCard, { ProductCardVariants, RecommendationTypes, ProductStatus } from '../molecules/ProductCard';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';

const DemoContainer = styled.div`
  position: fixed;
  top: 160px;
  left: 20px;
  width: 450px;
  max-height: 65vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  ${({ theme }) => theme.breakpoints.mobile} {
    width: calc(100vw - 40px);
    left: 20px;
    right: 20px;
  }
`;

const ProductGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
`;

const VariantSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ControlsSection = styled.div`
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ProductDemo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(ProductCardVariants.DEFAULT);

  const sampleProducts = [
    {
      id: 'product-1',
      name: 'AI-Optimized Coffee Beans',
      description: 'Premium coffee beans selected by our AI algorithm based on customer preferences and seasonal trends.',
      price: 24.99,
      originalPrice: 29.99,
      category: 'Beverages',
      brand: 'SmartBrew',
      stockLevel: 45,
      rating: 4.8,
      reviewCount: 234,
      image: null, // Will show placeholder
      recommendations: [
        { type: RecommendationTypes.BESTSELLER },
        { type: RecommendationTypes.PERSONALIZED }
      ],
      aiInsight: 'Customers who bought similar items increased their purchase frequency by 30%',
      featured: true,
      status: ProductStatus.ACTIVE
    },
    {
      id: 'product-2',
      name: 'Organic Quinoa Bowl Mix',
      description: 'Nutrient-rich quinoa blend perfect for healthy meals.',
      price: 12.49,
      originalPrice: null,
      category: 'Health Foods',
      brand: 'GreenEarth',
      stockLevel: 8,
      rating: 4.3,
      reviewCount: 89,
      image: null,
      recommendations: [
        { type: RecommendationTypes.TRENDING },
        { type: RecommendationTypes.LOW_STOCK }
      ],
      aiInsight: 'High demand detected - consider reordering soon',
      featured: false,
      status: ProductStatus.LOW_STOCK
    },
    {
      id: 'product-3',
      name: 'Smart Water Bottle',
      description: 'IoT-enabled water bottle that tracks hydration levels.',
      price: 89.99,
      originalPrice: 119.99,
      category: 'Electronics',
      brand: 'TechFlow',
      stockLevel: 0,
      rating: 4.6,
      reviewCount: 156,
      image: null,
      recommendations: [
        { type: RecommendationTypes.PRICE_DROP },
        { type: RecommendationTypes.NEW_ARRIVAL }
      ],
      aiInsight: null,
      featured: false,
      status: ProductStatus.OUT_OF_STOCK
    },
    {
      id: 'product-4',
      name: 'Seasonal Pumpkin Spice Latte',
      description: 'Limited edition autumn flavor - available while supplies last.',
      price: 5.99,
      originalPrice: null,
      category: 'Beverages',
      brand: 'CafePlus',
      stockLevel: 120,
      rating: 4.2,
      reviewCount: 78,
      image: null,
      recommendations: [
        { type: RecommendationTypes.SEASONAL },
        { type: RecommendationTypes.FREQUENTLY_BOUGHT }
      ],
      aiInsight: 'Peak season product - sales expected to increase 200% in next 2 weeks',
      featured: false,
      status: ProductStatus.ACTIVE
    }
  ];

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '160px',
          left: '20px',
          zIndex: 9998,
          padding: '8px 12px',
          fontSize: '12px'
        }}
      >
        Show Products Demo
      </Button>
    );
  }

  const handleProductSelect = (id, selected) => {
    console.log('Product selected:', { id, selected });
  };

  const handleProductFavorite = (id, favorite) => {
    console.log('Product favorite:', { id, favorite });
  };

  const handleAddToCart = (id, quantity) => {
    console.log('Add to cart:', { id, quantity });
  };

  const handleQuickView = (id) => {
    console.log('Quick view:', { id });
  };

  return (
    <DemoContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant="h6">Product Cards Demo</Typography>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="small"
        >
          ×
        </Button>
      </div>

      {/* Variant Selector */}
      <ControlsSection style={{ marginBottom: '20px', paddingTop: '0', borderTop: 'none' }}>
        <Typography variant="subtitle2" style={{ width: '100%', marginBottom: '8px' }}>
          Variant:
        </Typography>
        {Object.values(ProductCardVariants).map(variant => (
          <Button
            key={variant}
            onClick={() => setSelectedVariant(variant)}
            variant={selectedVariant === variant ? 'filled' : 'outline'}
            size="small"
          >
            {variant}
          </Button>
        ))}
      </ControlsSection>

      {/* Product Examples */}
      <ProductGrid>
        {sampleProducts.map((product) => (
          <VariantSection key={product.id}>
            <Typography variant="subtitle2" style={{ marginBottom: '12px', textTransform: 'capitalize' }}>
              {product.name} - {product.status}
            </Typography>
            
            <ProductCard
              {...product}
              variant={selectedVariant}
              onSelect={handleProductSelect}
              onFavorite={handleProductFavorite}
              onAddToCart={handleAddToCart}
              onQuickView={handleQuickView}
              actions={[
                {
                  id: 'compare',
                  label: 'Compare',
                  icon: 'GitCompare',
                  variant: 'outline',
                  onClick: () => console.log('Compare', product.id)
                },
                {
                  id: 'share',
                  label: 'Share',
                  icon: 'Share2',
                  variant: 'ghost',
                  onClick: () => console.log('Share', product.id)
                }
              ]}
            />
          </VariantSection>
        ))}

        {/* Interactive Examples */}
        <VariantSection>
          <Typography variant="subtitle2" style={{ marginBottom: '12px' }}>
            Interactive Features Demo
          </Typography>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Compact variant example */}
            <ProductCard
              id="compact-demo"
              name="Compact Layout"
              price={19.99}
              stockLevel={5}
              variant={ProductCardVariants.COMPACT}
              recommendations={[{ type: RecommendationTypes.BESTSELLER }]}
              onAddToCart={handleAddToCart}
              onQuickView={handleQuickView}
            />

            {/* Grid variant example */}
            {selectedVariant === ProductCardVariants.GRID && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <ProductCard
                  id="grid-demo-1"
                  name="Grid Layout Demo"
                  description="This shows how products look in grid layout"
                  price={45.99}
                  originalPrice={55.99}
                  category="Demo"
                  rating={4.7}
                  reviewCount={92}
                  variant={ProductCardVariants.GRID}
                  recommendations={[{ type: RecommendationTypes.PERSONALIZED }]}
                  featured={true}
                  onAddToCart={handleAddToCart}
                />
                <ProductCard
                  id="grid-demo-2"
                  name="Another Grid Item"
                  description="Second item in grid"
                  price={33.50}
                  category="Demo"
                  rating={4.1}
                  reviewCount={45}
                  variant={ProductCardVariants.GRID}
                  onAddToCart={handleAddToCart}
                />
              </div>
            )}

            {/* Detailed variant example */}
            {selectedVariant === ProductCardVariants.DETAILED && (
              <ProductCard
                id="detailed-demo"
                name="Detailed Layout Example"
                description="This is a much longer description that shows how the detailed variant can handle more content. It includes multiple lines of text and provides space for comprehensive product information."
                price={156.99}
                originalPrice={199.99}
                category="Premium"
                brand="DetailedBrand"
                stockLevel={12}
                rating={4.9}
                reviewCount={456}
                variant={ProductCardVariants.DETAILED}
                recommendations={[
                  { type: RecommendationTypes.BESTSELLER },
                  { type: RecommendationTypes.PERSONALIZED },
                  { type: RecommendationTypes.TRENDING }
                ]}
                aiInsight="This product has shown exceptional performance metrics and customer satisfaction scores"
                featured={true}
                actions={[
                  {
                    id: 'wishlist',
                    label: 'Add to Wishlist',
                    icon: 'BookmarkPlus',
                    variant: 'outline',
                    onClick: () => console.log('Add to wishlist')
                  },
                  {
                    id: 'notify',
                    label: 'Notify When Available',
                    icon: 'Bell',
                    variant: 'outline',
                    onClick: () => console.log('Set notification')
                  }
                ]}
                onAddToCart={handleAddToCart}
                onQuickView={handleQuickView}
              />
            )}
          </div>
        </VariantSection>
      </ProductGrid>

      <ControlsSection>
        <Typography variant="caption" color="secondary" style={{ width: '100%' }}>
          Try different variants to see how the cards adapt. All interactions are logged to console.
        </Typography>
      </ControlsSection>
    </DemoContainer>
  );
};

export default ProductDemo;