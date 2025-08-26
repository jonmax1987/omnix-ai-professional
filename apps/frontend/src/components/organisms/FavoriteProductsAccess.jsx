import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Plus, 
  ShoppingCart, 
  Star, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Package,
  Filter,
  Grid,
  List,
  Search,
  MoreHorizontal
} from 'lucide-react';

const Container = styled(motion.div)`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px 12px 8px 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  width: 180px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: 8px 12px;
  border: none;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'white'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.gray[50]};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: white;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 12px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const ProductsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin: -8px;
  padding: 8px;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ view }) => 
    view === 'grid' ? 'repeat(auto-fill, minmax(160px, 1fr))' : '1fr'};
  gap: ${({ view }) => view === 'grid' ? '16px' : '12px'};
`;

const ProductCard = styled(motion.div)`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 12px;
  padding: ${({ view }) => view === 'grid' ? '16px' : '12px'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: ${({ view }) => view === 'list' ? 'flex' : 'block'};
  align-items: ${({ view }) => view === 'list' ? 'center' : 'stretch'};
  gap: ${({ view }) => view === 'list' ? '12px' : '0'};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.div`
  width: ${({ view }) => view === 'grid' ? '100%' : '60px'};
  height: ${({ view }) => view === 'grid' ? '120px' : '60px'};
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ view }) => view === 'grid' ? '12px' : '0'};
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: ${({ view }) => view === 'grid' ? '14px' : '16px'};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
  line-height: 1.2;
`;

const ProductBrand = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: ${({ view }) => view === 'grid' ? '12px' : '8px'};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 2px 6px;
  border-radius: 4px;
`;

const ProductPrice = styled.div`
  font-size: ${({ view }) => view === 'grid' ? '16px' : '18px'};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ view }) => view === 'grid' ? '12px' : '0'};
`;

const ProductActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: ${({ view }) => view === 'grid' ? 'space-between' : 'flex-end'};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: ${({ primary }) => primary ? '8px 12px' : '6px'};
  border: 1px solid ${({ primary, theme }) => primary ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  background: ${({ primary, theme }) => primary ? theme.colors.primary : 'white'};
  color: ${({ primary, theme }) => primary ? 'white' : theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ primary, theme }) => 
      primary ? theme.colors.primary : theme.colors.gray[50]};
  }
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.error};
    background: ${({ theme }) => theme.colors.error};
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const FavoriteProductsAccess = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const favoriteProducts = [
    {
      id: 1,
      name: 'Organic Greek Yogurt',
      brand: 'Fresh Valley',
      price: 5.99,
      rating: 4.8,
      lastBought: '3 days ago',
      frequency: 'Weekly',
      inStock: true,
      discount: 15
    },
    {
      id: 2,
      name: 'Whole Grain Bread',
      brand: 'Artisan Bakery',
      price: 4.50,
      rating: 4.6,
      lastBought: '1 week ago',
      frequency: 'Bi-weekly',
      inStock: true,
      discount: null
    },
    {
      id: 3,
      name: 'Free Range Eggs',
      brand: 'Happy Farms',
      price: 6.75,
      rating: 4.9,
      lastBought: '5 days ago',
      frequency: 'Weekly',
      inStock: false,
      discount: null
    },
    {
      id: 4,
      name: 'Almond Butter',
      brand: 'Natural Choice',
      price: 12.99,
      rating: 4.7,
      lastBought: '2 weeks ago',
      frequency: 'Monthly',
      inStock: true,
      discount: 20
    },
    {
      id: 5,
      name: 'Olive Oil Extra Virgin',
      brand: 'Mediterranean Gold',
      price: 18.50,
      rating: 4.8,
      lastBought: '1 month ago',
      frequency: 'Quarterly',
      inStock: true,
      discount: null
    },
    {
      id: 6,
      name: 'Organic Spinach',
      brand: 'Green Fields',
      price: 3.25,
      rating: 4.5,
      lastBought: '4 days ago',
      frequency: 'Twice weekly',
      inStock: true,
      discount: 10
    }
  ];

  const filteredProducts = favoriteProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: favoriteProducts.length,
    inStock: favoriteProducts.filter(p => p.inStock).length,
    onSale: favoriteProducts.filter(p => p.discount).length,
    avgRating: (favoriteProducts.reduce((sum, p) => sum + p.rating, 0) / favoriteProducts.length).toFixed(1)
  };

  const removeFavorite = (productId) => {
    // Handle remove favorite logic
    console.log('Remove favorite:', productId);
  };

  const addToCart = (productId) => {
    // Handle add to cart logic
    console.log('Add to cart:', productId);
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Heart size={20} />
          Favorite Products
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon size={16} />
            <SearchInput
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <ViewToggle>
            <ViewButton 
              active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </ViewButton>
            <ViewButton 
              active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </ViewButton>
          </ViewToggle>
          <FilterButton>
            <Filter size={16} />
            Filter
          </FilterButton>
        </Controls>
      </Header>

      <QuickStats>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Favorites</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.inStock}</StatValue>
          <StatLabel>In Stock</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.onSale}</StatValue>
          <StatLabel>On Sale</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.avgRating}</StatValue>
          <StatLabel>Avg Rating</StatLabel>
        </StatCard>
      </QuickStats>

      <ProductsContainer>
        {filteredProducts.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Heart size={24} />
            </EmptyIcon>
            <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
              No favorites found
            </div>
            <div style={{ fontSize: '14px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Start adding products to your favorites'}
            </div>
          </EmptyState>
        ) : (
          <ProductsGrid view={viewMode}>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                view={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FavoriteButton onClick={() => removeFavorite(product.id)}>
                  <Heart size={14} fill="currentColor" />
                </FavoriteButton>

                <ProductImage view={viewMode}>
                  <Package size={viewMode === 'grid' ? 32 : 24} color="#9ca3af" />
                </ProductImage>

                <ProductInfo>
                  <ProductName view={viewMode}>{product.name}</ProductName>
                  <ProductBrand>{product.brand}</ProductBrand>
                  
                  <ProductMeta view={viewMode}>
                    <MetaItem>
                      <Star size={10} fill="currentColor" />
                      {product.rating}
                    </MetaItem>
                    <MetaItem>
                      <Clock size={10} />
                      {product.lastBought}
                    </MetaItem>
                    <MetaItem>
                      <TrendingUp size={10} />
                      {product.frequency}
                    </MetaItem>
                    {!product.inStock && (
                      <MetaItem style={{ background: '#fee2e2', color: '#dc2626' }}>
                        Out of Stock
                      </MetaItem>
                    )}
                    {product.discount && (
                      <MetaItem style={{ background: '#dcfce7', color: '#16a34a' }}>
                        {product.discount}% OFF
                      </MetaItem>
                    )}
                  </ProductMeta>

                  <ProductPrice view={viewMode}>
                    ${product.price.toFixed(2)}
                    {product.discount && (
                      <span style={{ 
                        fontSize: '12px', 
                        textDecoration: 'line-through', 
                        color: '#9ca3af',
                        marginLeft: '8px'
                      }}>
                        ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                      </span>
                    )}
                  </ProductPrice>
                </ProductInfo>

                <ProductActions view={viewMode}>
                  <ActionButton
                    primary
                    disabled={!product.inStock}
                    onClick={() => addToCart(product.id)}
                  >
                    <Plus size={12} />
                    {viewMode === 'grid' ? 'Add' : 'Add to Cart'}
                  </ActionButton>
                  <ActionButton>
                    <MoreHorizontal size={12} />
                  </ActionButton>
                </ProductActions>
              </ProductCard>
            ))}
          </ProductsGrid>
        )}
      </ProductsContainer>
    </Container>
  );
};

export default FavoriteProductsAccess;