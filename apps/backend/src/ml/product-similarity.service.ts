import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { ProductDto as Product } from '../common/dto/product.dto';

export interface ProductSimilarity {
  productId: string;
  product: Product;
  similarity: number;
  reasons: string[];
}

@Injectable()
export class ProductSimilarityService {
  constructor(private readonly productsService: ProductsService) {}

  calculateProductSimilarity(product1: Product, product2: Product): number {
    if (product1.id === product2.id) return 0;

    let similarityScore = 0;
    const weights = {
      category: 0.35,
      price: 0.25,
      supplier: 0.15,
      location: 0.10,
      tags: 0.15,
    };

    // Category similarity
    if (product1.category === product2.category) {
      similarityScore += weights.category;
    }

    // Price similarity (within 20% range)
    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    const priceRatio = avgPrice > 0 ? 1 - (priceDiff / avgPrice) : 0;
    if (priceRatio > 0.8) {
      similarityScore += weights.price * priceRatio;
    }

    // Supplier similarity
    if (product1.supplier === product2.supplier) {
      similarityScore += weights.supplier;
    }

    // Location similarity
    if (product1.location === product2.location) {
      similarityScore += weights.location;
    }

    // Tags similarity (if available) - currently not implemented in ProductDto
    // Could be added later when product tagging is implemented

    return Math.min(1, similarityScore);
  }

  async findSimilarProducts(
    productId: string,
    limit: number = 10,
    minSimilarity: number = 0.3,
  ): Promise<ProductSimilarity[]> {
    const targetProduct = await this.productsService.findOne(productId);
    if (!targetProduct) {
      throw new Error(`Product ${productId} not found`);
    }

    const allProductsResponse = await this.productsService.findAll({});
    const allProducts = allProductsResponse.data;
    const similarities: ProductSimilarity[] = [];

    for (const product of allProducts) {
      if (product.id === productId) continue;

      const similarity = this.calculateProductSimilarity(targetProduct, product);
      if (similarity >= minSimilarity) {
        const reasons = this.getSimilarityReasons(targetProduct, product, similarity);
        similarities.push({
          productId: product.id,
          product,
          similarity,
          reasons,
        });
      }
    }

    // Sort by similarity score (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, limit);
  }

  async findProductsByCategory(
    category: string,
    excludeProductId?: string,
    limit: number = 10,
  ): Promise<Product[]> {
    const products = await this.productsService.findByCategory(category);
    
    const filtered = excludeProductId 
      ? products.filter(p => p.id !== excludeProductId)
      : products;

    return filtered.slice(0, limit);
  }

  async findProductsInPriceRange(
    minPrice: number,
    maxPrice: number,
    excludeProductId?: string,
    limit: number = 10,
  ): Promise<Product[]> {
    const allProductsResponse = await this.productsService.findAll({});
    const allProducts = allProductsResponse.data;
    
    const filtered = allProducts.filter(p => {
      if (excludeProductId && p.id === excludeProductId) return false;
      return p.price >= minPrice && p.price <= maxPrice;
    });

    // Sort by popularity (using quantity level as proxy)
    filtered.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

    return filtered.slice(0, limit);
  }

  private getSimilarityReasons(
    product1: Product,
    product2: Product,
    similarity: number,
  ): string[] {
    const reasons: string[] = [];

    if (product1.category === product2.category) {
      reasons.push(`Same category: ${product1.category}`);
    }

    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    const priceRatio = avgPrice > 0 ? 1 - (priceDiff / avgPrice) : 0;
    if (priceRatio > 0.8) {
      reasons.push('Similar price range');
    }

    if (product1.supplier === product2.supplier) {
      reasons.push(`Same supplier: ${product1.supplier}`);
    }

    if (product1.location === product2.location) {
      reasons.push(`Same location: ${product1.location}`);
    }

    if (similarity > 0.7) {
      reasons.push('Highly similar product');
    } else if (similarity > 0.5) {
      reasons.push('Related product');
    }

    return reasons;
  }

  async getComplementaryProducts(productId: string): Promise<Product[]> {
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // Define complementary categories based on the product category
    const complementaryMap: Record<string, string[]> = {
      'Fruits': ['Vegetables', 'Dairy', 'Bakery'],
      'Vegetables': ['Fruits', 'Spices', 'Dairy'],
      'Meat': ['Vegetables', 'Spices', 'Sauces'],
      'Dairy': ['Bakery', 'Fruits', 'Cereals'],
      'Bakery': ['Dairy', 'Spreads', 'Beverages'],
      'Beverages': ['Snacks', 'Bakery'],
      'Snacks': ['Beverages', 'Fruits'],
      'Frozen': ['Sauces', 'Vegetables'],
      'Cereals': ['Dairy', 'Fruits'],
      'Spices': ['Meat', 'Vegetables'],
    };

    const complementaryCategories = complementaryMap[product.category] || [];
    const complementaryProducts: Product[] = [];

    for (const category of complementaryCategories) {
      const products = await this.findProductsByCategory(category, undefined, 3);
      complementaryProducts.push(...products);
    }

    return complementaryProducts.slice(0, 10);
  }
}