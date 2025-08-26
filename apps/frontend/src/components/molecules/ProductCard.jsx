// ProductCard Molecule
// Implementation of MOL-009: ProductCard with AI recommendations
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Badge from '../atoms/Badge';
import Avatar from '../atoms/Avatar';
import { useI18n } from '../../hooks/useI18n';

// Product card variants
export const ProductCardVariants = {
  COMPACT: 'compact',
  DEFAULT: 'default',
  DETAILED: 'detailed',
  GRID: 'grid',
  LIST: 'list'
};

// AI recommendation types
export const RecommendationTypes = {
  BESTSELLER: 'bestseller',
  TRENDING: 'trending',
  PERSONALIZED: 'personalized',
  FREQUENTLY_BOUGHT: 'frequently_bought',
  SEASONAL: 'seasonal',
  PRICE_DROP: 'price_drop',
  LOW_STOCK: 'low_stock',
  NEW_ARRIVAL: 'new_arrival'
};

// Product status types
export const ProductStatus = {
  ACTIVE: 'active',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
  COMING_SOON: 'coming_soon'
};

const ProductContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['variant', 'interactive', 'selected', 'featured'].includes(prop)
})`
  display: flex;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.spacing[2]};
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
  
  ${props => props.interactive && css`
    cursor: pointer;
    
    &:hover {
      border-color: ${props.theme.colors.primary};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `}
  
  ${props => props.selected && css`
    border-color: ${props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props.theme.colors.primary}20;
  `}
  
  ${props => props.featured && css`
    border: 2px solid ${props.theme.colors.gradient.ai.from};
    background: linear-gradient(135deg, ${props.theme.colors.gradient.ai.from}05, ${props.theme.colors.gradient.ai.to}05);
  `}
  
  ${props => getProductCardVariantStyles(props.variant, props.theme)}
`;

const ProductImage = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  position: relative;
  background: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }
  
  ${ProductContainer}:hover & img {
    transform: scale(1.05);
  }
  
  ${props => getImageSizeForVariant(props.variant)}
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.secondary};
`;

const ProductContent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing[3]};
  min-width: 0;
  
  ${props => props.variant === ProductCardVariants.COMPACT && css`
    padding: ${props.theme.spacing[2]};
  `}
  
  ${props => props.variant === ProductCardVariants.DETAILED && css`
    padding: ${props.theme.spacing[4]};
  `}
`;

const ProductHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-shrink: 0;
`;

const ProductTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const ProductDescription = styled.div`
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const ProductMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
  
  ${props => props.theme.breakpoints.mobile} {
    gap: ${props => props.theme.spacing[2]};
  }
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
`;

const Price = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  text-decoration: line-through;
`;

const Discount = styled(Badge)`
  font-size: 12px;
`;

const AIRecommendations = styled.div`
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const RecommendationsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[1]};
  margin-top: ${props => props.theme.spacing[2]};
`;

const RecommendationBadge = styled(Badge).withConfig({
  shouldForwardProp: (prop) => !['recommendationType'].includes(prop)
})`
  ${props => getRecommendationStyles(props.recommendationType, props.theme)}
`;

const ProductActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-top: auto;
  flex-wrap: wrap;
`;

const StockIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: 12px;
  
  ${props => getStockIndicatorStyles(props.status, props.theme)}
`;

const FavoriteButton = styled(Button)`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  background: ${props => props.theme.colors.surface}90;
  backdrop-filter: blur(4px);
`;

const AIInsightBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  left: ${props => props.theme.spacing[2]};
  padding: 4px 8px;
  background: linear-gradient(135deg, ${props => props.theme.colors.gradient.ai.from}, ${props => props.theme.colors.gradient.ai.to});
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: ${props => props.theme.spacing[1]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Styling functions
function getProductCardVariantStyles(variant, theme) {
  const styles = {
    [ProductCardVariants.COMPACT]: css`
      max-height: 120px;
      flex-direction: row;
    `,
    [ProductCardVariants.DEFAULT]: css`
      flex-direction: row;
      min-height: 140px;
    `,
    [ProductCardVariants.DETAILED]: css`
      flex-direction: column;
      min-height: 300px;
    `,
    [ProductCardVariants.GRID]: css`
      flex-direction: column;
      width: 240px;
      height: 320px;
    `,
    [ProductCardVariants.LIST]: css`
      flex-direction: row;
      width: 100%;
    `
  };

  return styles[variant] || styles[ProductCardVariants.DEFAULT];
}

function getImageSizeForVariant(variant) {
  const sizes = {
    [ProductCardVariants.COMPACT]: css`
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    `,
    [ProductCardVariants.DEFAULT]: css`
      width: 120px;
      height: 120px;
      flex-shrink: 0;
    `,
    [ProductCardVariants.DETAILED]: css`
      width: 100%;
      height: 200px;
    `,
    [ProductCardVariants.GRID]: css`
      width: 100%;
      height: 160px;
    `,
    [ProductCardVariants.LIST]: css`
      width: 100px;
      height: 100px;
      flex-shrink: 0;
    `
  };

  return sizes[variant] || sizes[ProductCardVariants.DEFAULT];
}

function getRecommendationStyles(type, theme) {
  const styles = {
    [RecommendationTypes.BESTSELLER]: css`
      background: linear-gradient(135deg, ${theme.colors.success}, ${theme.colors.success}80);
      color: white;
    `,
    [RecommendationTypes.TRENDING]: css`
      background: linear-gradient(135deg, ${theme.colors.warning}, ${theme.colors.warning}80);
      color: white;
    `,
    [RecommendationTypes.PERSONALIZED]: css`
      background: linear-gradient(135deg, ${theme.colors.gradient.ai.from}, ${theme.colors.gradient.ai.to});
      color: white;
    `,
    [RecommendationTypes.PRICE_DROP]: css`
      background: linear-gradient(135deg, ${theme.colors.danger}, ${theme.colors.danger}80);
      color: white;
    `,
    [RecommendationTypes.LOW_STOCK]: css`
      background: ${theme.colors.warning}20;
      color: ${theme.colors.warning};
      border: 1px solid ${theme.colors.warning};
    `
  };

  return styles[type] || css`
    background: ${theme.colors.primary}20;
    color: ${theme.colors.primary};
  `;
}

function getStockIndicatorStyles(status, theme) {
  const styles = {
    [ProductStatus.ACTIVE]: css`
      color: ${theme.colors.success};
    `,
    [ProductStatus.LOW_STOCK]: css`
      color: ${theme.colors.warning};
    `,
    [ProductStatus.OUT_OF_STOCK]: css`
      color: ${theme.colors.danger};
    `,
    [ProductStatus.DISCONTINUED]: css`
      color: ${theme.colors.text.secondary};
    `
  };

  return styles[status] || styles[ProductStatus.ACTIVE];
}

function getRecommendationLabel(type, t) {
  const labels = {
    [RecommendationTypes.BESTSELLER]: t('product.recommendations.bestseller'),
    [RecommendationTypes.TRENDING]: t('product.recommendations.trending'),
    [RecommendationTypes.PERSONALIZED]: t('product.recommendations.personalized'),
    [RecommendationTypes.FREQUENTLY_BOUGHT]: t('product.recommendations.frequentlyBought'),
    [RecommendationTypes.SEASONAL]: t('product.recommendations.seasonal'),
    [RecommendationTypes.PRICE_DROP]: t('product.recommendations.priceDrop'),
    [RecommendationTypes.LOW_STOCK]: t('product.recommendations.lowStock'),
    [RecommendationTypes.NEW_ARRIVAL]: t('product.recommendations.newArrival')
  };

  return labels[type] || type;
}

function getStockStatusLabel(status, t) {
  const labels = {
    [ProductStatus.ACTIVE]: t('product.status.active'),
    [ProductStatus.LOW_STOCK]: t('product.status.lowStock'),
    [ProductStatus.OUT_OF_STOCK]: t('product.status.outOfStock'),
    [ProductStatus.DISCONTINUED]: t('product.status.discontinued'),
    [ProductStatus.COMING_SOON]: t('product.status.comingSoon')
  };

  return labels[status] || status;
}

/**
 * ProductCard Component
 * Advanced product card with AI recommendations and rich functionality
 */
const ProductCard = ({
  id,
  name,
  description,
  image,
  price,
  originalPrice,
  currency = '$',
  category,
  brand,
  status = ProductStatus.ACTIVE,
  stockLevel = 0,
  rating = 0,
  reviewCount = 0,
  recommendations = [],
  aiInsight = null,
  variant = ProductCardVariants.DEFAULT,
  interactive = true,
  selected = false,
  featured = false,
  favorite = false,
  showMetrics = true,
  showActions = true,
  actions = [],
  onSelect = null,
  onFavorite = null,
  onAddToCart = null,
  onQuickView = null,
  onClick = null,
  className = '',
  ...props
}) => {
  const { t } = useI18n();
  const [isFavorite, setIsFavorite] = useState(favorite);
  const [isSelected, setIsSelected] = useState(selected);

  const handleClick = useCallback((e) => {
    if (!interactive) return;
    
    if (onSelect) {
      setIsSelected(!isSelected);
      onSelect(id, !isSelected, e);
    }
    
    if (onClick) {
      onClick(id, e);
    }
  }, [interactive, isSelected, onSelect, onClick, id]);

  const handleFavoriteClick = useCallback((e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    if (onFavorite) {
      onFavorite(id, !isFavorite);
    }
  }, [isFavorite, onFavorite, id]);

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    
    if (onAddToCart) {
      onAddToCart(id, 1); // Default quantity of 1
    }
  }, [onAddToCart, id]);

  const handleQuickView = useCallback((e) => {
    e.stopPropagation();
    
    if (onQuickView) {
      onQuickView(id);
    }
  }, [onQuickView, id]);

  // Calculate discount percentage
  const discountPercentage = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Determine stock status
  const stockStatus = stockLevel === 0 
    ? ProductStatus.OUT_OF_STOCK 
    : stockLevel < 10 
    ? ProductStatus.LOW_STOCK 
    : status;

  return (
    <ProductContainer
      variant={variant}
      interactive={interactive}
      selected={isSelected}
      featured={featured}
      onClick={handleClick}
      className={`product-card product-card-${variant} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={interactive ? { y: -2 } : {}}
      {...props}
    >
      {/* AI Insight Badge */}
      {aiInsight && (
        <AIInsightBadge>
          AI Insight
        </AIInsightBadge>
      )}

      {/* Favorite Button */}
      {showActions && (
        <FavoriteButton
          onClick={handleFavoriteClick}
          variant="ghost"
          aria-label={isFavorite ? t('product.removeFavorite') : t('product.addFavorite')}
        >
          <Icon 
            name={isFavorite ? 'Heart' : 'Heart'} 
            size={16} 
            color={isFavorite ? 'danger' : 'text.secondary'}
            filled={isFavorite}
          />
        </FavoriteButton>
      )}

      {/* Product Image */}
      <ProductImage variant={variant}>
        {image ? (
          <img src={image} alt={name} loading="lazy" />
        ) : (
          <ImagePlaceholder>
            <Icon name="Package" size={32} />
          </ImagePlaceholder>
        )}
      </ProductImage>

      {/* Product Content */}
      <ProductContent variant={variant}>
        <ProductHeader>
          <ProductInfo>
            <ProductTitle>
              <Typography variant="subtitle2" weight="medium" truncate>
                {name}
              </Typography>
              {featured && (
                <Badge variant="filled" color="primary" size="sm">
                  {t('product.featured')}
                </Badge>
              )}
            </ProductTitle>
            
            {brand && (
              <Typography variant="caption" color="secondary">
                {brand}
              </Typography>
            )}
          </ProductInfo>

          <ProductMeta>
            {showMetrics && rating > 0 && (
              <MetricItem>
                <Icon name="Star" size={14} color="warning" filled />
                <span>{rating.toFixed(1)}</span>
                {reviewCount > 0 && (
                  <Typography variant="caption" color="secondary">
                    ({reviewCount})
                  </Typography>
                )}
              </MetricItem>
            )}
          </ProductMeta>
        </ProductHeader>

        {/* Description */}
        {description && variant !== ProductCardVariants.COMPACT && (
          <ProductDescription>
            <Typography variant="body2" color="secondary" truncate={2}>
              {description}
            </Typography>
          </ProductDescription>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <AIRecommendations>
            <Typography variant="caption" color="secondary" weight="medium">
              {t('product.aiRecommendations')}
            </Typography>
            <RecommendationsList>
              {recommendations.map((rec, index) => (
                <RecommendationBadge
                  key={index}
                  recommendationType={rec.type}
                  size="sm"
                  variant="filled"
                >
                  {getRecommendationLabel(rec.type, t)}
                </RecommendationBadge>
              ))}
            </RecommendationsList>
          </AIRecommendations>
        )}

        {/* Metrics */}
        {showMetrics && variant !== ProductCardVariants.COMPACT && (
          <ProductMetrics>
            <MetricItem>
              <Icon name="Tag" size={14} />
              <span>{category}</span>
            </MetricItem>
            
            {stockLevel > 0 && (
              <MetricItem>
                <Icon name="Package" size={14} />
                <span>{stockLevel} {t('product.inStock')}</span>
              </MetricItem>
            )}
          </ProductMetrics>
        )}

        {/* Price Section */}
        <PriceSection>
          <Price>{currency}{price.toFixed(2)}</Price>
          
          {originalPrice && originalPrice > price && (
            <>
              <OriginalPrice>
                {currency}{originalPrice.toFixed(2)}
              </OriginalPrice>
              <Discount variant="filled" color="danger" size="sm">
                -{discountPercentage}%
              </Discount>
            </>
          )}
        </PriceSection>

        {/* Stock Status */}
        <StockIndicator status={stockStatus}>
          <Icon 
            name={stockStatus === ProductStatus.ACTIVE ? 'CheckCircle' : 
                  stockStatus === ProductStatus.LOW_STOCK ? 'AlertTriangle' : 
                  'XCircle'} 
            size={12} 
          />
          <span>{getStockStatusLabel(stockStatus, t)}</span>
        </StockIndicator>

        {/* Actions */}
        {showActions && (
          <ProductActions>
            {actions.map((action, index) => (
              <Button
                key={action.id || index}
                onClick={action.onClick}
                variant={action.variant || 'outline'}
                size="small"
                color={action.color}
                disabled={action.disabled || stockStatus === ProductStatus.OUT_OF_STOCK}
              >
                {action.icon && <Icon name={action.icon} size={14} />}
                {action.label}
              </Button>
            ))}
            
            {/* Default actions */}
            <Button
              onClick={handleAddToCart}
              variant="filled"
              color="primary"
              size="small"
              disabled={stockStatus === ProductStatus.OUT_OF_STOCK}
            >
              <Icon name="shopping-cart" size={14} />
              {variant === ProductCardVariants.COMPACT ? '' : t('product.addToCart')}
            </Button>
            
            <Button
              onClick={handleQuickView}
              variant="outline"
              size="small"
            >
              <Icon name="Eye" size={14} />
              {variant === ProductCardVariants.COMPACT ? '' : t('product.quickView')}
            </Button>
          </ProductActions>
        )}

        {/* AI Insight */}
        {aiInsight && variant !== ProductCardVariants.COMPACT && (
          <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '4px' }}>
            <Typography variant="caption" color="primary" weight="medium">
              {t('product.aiInsight')}: {aiInsight}
            </Typography>
          </div>
        )}
      </ProductContent>
    </ProductContainer>
  );
};

export default ProductCard;