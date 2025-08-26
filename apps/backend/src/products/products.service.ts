import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ProductDto, CreateProductDto, UpdateProductDto } from '@/common/dto/product.dto';
import { ProductQueryDto, PaginatedResponseDto } from '@/common/dto/common.dto';
import { DynamoDBService } from '../services/dynamodb.service';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable()
export class ProductsService {
  private readonly tableName = 'products';

  constructor(
    private readonly dynamoDBService: DynamoDBService,
    private readonly webSocketService: WebSocketService,
  ) {}

  async findAll(query: ProductQueryDto): Promise<PaginatedResponseDto<ProductDto>> {
    try {
      console.log('🔍 Fetching products from DynamoDB...');
      // Get all products from DynamoDB
      let products = await this.dynamoDBService.scan(this.tableName);
      console.log(`📦 Retrieved ${products.length} products from database`);

      // Apply search filter
      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        products = products.filter(
          (product) =>
            product.name?.toLowerCase().includes(searchTerm) ||
            product.sku?.toLowerCase().includes(searchTerm) ||
            product.barcode?.toLowerCase().includes(searchTerm),
        );
      }

      // Apply category filter
      if (query.category) {
        products = products.filter(
          (product) => product.category?.toLowerCase() === query.category.toLowerCase(),
        );
      }

      // Apply supplier filter
      if (query.supplier) {
        products = products.filter(
          (product) => product.supplier?.toLowerCase().includes(query.supplier.toLowerCase()),
        );
      }

      // Apply low stock filter
      if (query.lowStock) {
        products = products.filter(
          (product) => product.quantity <= product.minThreshold,
        );
      }

      // Apply sorting
      products.sort((a, b) => {
        const aValue = a[query.sortBy] || '';
        const bValue = b[query.sortBy] || '';
        
        if (query.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        }
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      });

      // Apply pagination
      const total = products.length;
      const pages = Math.ceil(total / query.limit);
      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      // Calculate metadata
      const totalValue = products.reduce((sum, product) => sum + ((product.price || 0) * (product.quantity || 0)), 0);
      const totalItems = products.reduce((sum, product) => sum + (product.quantity || 0), 0);

      return {
        data: paginatedProducts,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages,
          hasNext: query.page < pages,
          hasPrev: query.page > 1,
        },
        meta: {
          totalValue,
          totalItems,
        },
      };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      console.error('Returning empty product list due to database error');
      // Return empty results if database is not available
      return {
        data: [],
        pagination: {
          page: query.page,
          limit: query.limit,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false,
        },
        meta: {
          totalValue: 0,
          totalItems: 0,
        },
      };
    }
  }

  async findOne(id: string): Promise<ProductDto | null> {
    try {
      const product = await this.dynamoDBService.get(this.tableName, { id });
      return product || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDto> {
    try {
      console.log('🆕 Creating new product with data:', JSON.stringify(createProductDto, null, 2));
      
      // Check if SKU already exists
      console.log('🔍 Checking for existing SKU...');
      const existingProducts = await this.dynamoDBService.scan(this.tableName);
      const existingProduct = existingProducts.find(
        (product) => product.sku?.toLowerCase() === createProductDto.sku.toLowerCase(),
      );
      
      if (existingProduct) {
        console.log(`❌ Product with SKU '${createProductDto.sku}' already exists`);
        throw new Error(`Product with SKU '${createProductDto.sku}' already exists`);
      }

      const now = new Date().toISOString();
      const newProduct: ProductDto = {
        id: uuidv4(),
        ...createProductDto,
        createdAt: now,
        updatedAt: now,
        lastUpdated: now,
      };

      console.log('💾 Attempting to save product to DynamoDB...');
      console.log('💾 Product data:', JSON.stringify(newProduct, null, 2));
      
      await this.dynamoDBService.put(this.tableName, newProduct);
      
      console.log('✅ Product successfully created with ID:', newProduct.id);
      
      // Emit WebSocket event for product creation
      this.webSocketService.emitProductUpdate(newProduct.id, newProduct);
      
      return newProduct;
    } catch (error) {
      console.error('❌ Error creating product:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDto | null> {
    try {
      // Check if product exists
      const existingProduct = await this.findOne(id);
      if (!existingProduct) {
        return null;
      }

      const now = new Date().toISOString();
      const updates = {
        ...updateProductDto,
        updatedAt: now,
        lastUpdated: now,
      };

      const updatedProduct = await this.dynamoDBService.update(
        this.tableName,
        { id },
        updates,
      );

      // Emit WebSocket event for product update
      this.webSocketService.emitProductUpdate(id, updatedProduct);
      
      // Check if stock changed and emit stock change event
      if (updateProductDto.quantity !== undefined && updateProductDto.quantity !== existingProduct.quantity) {
        this.webSocketService.emitStockChanged(
          id,
          updatedProduct.name,
          updatedProduct.quantity,
          updatedProduct.minThreshold || 0
        );
      }

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.dynamoDBService.delete(this.tableName, { id });
      
      if (result) {
        // Emit WebSocket event for product deletion
        this.webSocketService.emitProductDeleted(id);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Helper methods for other services
  async findLowStockProducts(): Promise<ProductDto[]> {
    try {
      const products = await this.dynamoDBService.scan(this.tableName);
      return products.filter((product) => product.quantity <= product.minThreshold);
    } catch (error) {
      console.error('Error finding low stock products:', error);
      return [];
    }
  }

  async findByCategory(category: string): Promise<ProductDto[]> {
    try {
      const products = await this.dynamoDBService.scan(this.tableName);
      return products.filter(
        (product) => product.category?.toLowerCase() === category.toLowerCase(),
      );
    } catch (error) {
      console.error('Error finding products by category:', error);
      return [];
    }
  }

  async getTotalInventoryValue(): Promise<number> {
    try {
      const products = await this.dynamoDBService.scan(this.tableName);
      return products.reduce((sum, product) => sum + ((product.price || 0) * (product.quantity || 0)), 0);
    } catch (error) {
      console.error('Error calculating inventory value:', error);
      return 0;
    }
  }

  async getTotalItemCount(): Promise<number> {
    try {
      const products = await this.dynamoDBService.scan(this.tableName);
      return products.reduce((sum, product) => sum + (product.quantity || 0), 0);
    } catch (error) {
      console.error('Error calculating item count:', error);
      return 0;
    }
  }

  async getCategoryBreakdown(): Promise<Array<{ category: string; itemCount: number; value: number }>> {
    try {
      const products = await this.dynamoDBService.scan(this.tableName);
      const categoryMap = new Map<string, { itemCount: number; value: number }>();
      
      for (const product of products) {
        if (!product.category) continue;
        
        const existing = categoryMap.get(product.category) || { itemCount: 0, value: 0 };
        categoryMap.set(product.category, {
          itemCount: existing.itemCount + (product.quantity || 0),
          value: existing.value + ((product.price || 0) * (product.quantity || 0)),
        });
      }

      return Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        ...stats,
      }));
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      return [];
    }
  }
}