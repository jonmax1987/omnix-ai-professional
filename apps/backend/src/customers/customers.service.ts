import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DynamoDBService } from '../services/dynamodb.service';
import { v4 as uuidv4 } from 'uuid';
import { 
  CustomerProfileDto, 
  CreateCustomerProfileDto, 
  UpdateCustomerProfileDto,
  CustomerPreferencesDto,
  PurchaseHistoryDto,
  ProductInteractionDto,
  CreatePurchaseHistoryDto,
  CreateProductInteractionDto
} from '../common/dto/customer.dto';

@Injectable()
export class CustomersService {
  private readonly profilesTable = 'customer-profiles';
  private readonly purchaseHistoryTable = 'purchase-history';
  private readonly productInteractionsTable = 'product-interactions';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async createCustomerProfile(createDto: CreateCustomerProfileDto): Promise<CustomerProfileDto> {
    const customerId = createDto.customerId || uuidv4();
    const now = new Date().toISOString();

    const profile: CustomerProfileDto = {
      customerId,
      demographics: createDto.demographics || {},
      preferences: createDto.preferences || {
        dietaryRestrictions: [],
        favoriteCategories: [],
        budgetRange: { min: 0, max: 10000 },
        brandPreferences: [],
      },
      shoppingPatterns: createDto.shoppingPatterns || {
        preferredShoppingTimes: [],
        averageOrderValue: 0,
        shoppingFrequency: 'weekly',
        seasonalPatterns: {},
      },
      createdAt: now,
      updatedAt: now,
    };

    await this.dynamoDBService.put(this.profilesTable, profile);

    return profile;
  }

  async getCustomerProfile(customerId: string): Promise<CustomerProfileDto> {
    const result = await this.dynamoDBService.get(this.profilesTable, { customerId });

    if (!result) {
      throw new NotFoundException(`Customer profile not found for ID: ${customerId}`);
    }

    return result as CustomerProfileDto;
  }

  async updateCustomerProfile(
    customerId: string,
    updateDto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileDto> {
    const existingProfile = await this.getCustomerProfile(customerId);
    
    const updatedProfile: CustomerProfileDto = {
      ...existingProfile,
      ...updateDto,
      customerId,
      updatedAt: new Date().toISOString(),
    };

    if (updateDto.demographics) {
      updatedProfile.demographics = {
        ...existingProfile.demographics,
        ...updateDto.demographics,
      };
    }

    if (updateDto.preferences) {
      updatedProfile.preferences = {
        ...existingProfile.preferences,
        ...updateDto.preferences,
      };
    }

    if (updateDto.shoppingPatterns) {
      updatedProfile.shoppingPatterns = {
        ...existingProfile.shoppingPatterns,
        ...updateDto.shoppingPatterns,
      };
    }

    await this.dynamoDBService.put(this.profilesTable, updatedProfile);

    return updatedProfile;
  }

  async updateCustomerPreferences(
    customerId: string,
    preferences: CustomerPreferencesDto,
  ): Promise<CustomerProfileDto> {
    const profile = await this.getCustomerProfile(customerId);
    
    profile.preferences = {
      ...profile.preferences,
      ...preferences,
    };
    profile.updatedAt = new Date().toISOString();

    await this.dynamoDBService.put(this.profilesTable, profile);

    return profile;
  }

  async addPurchaseHistory(
    customerId: string,
    purchaseDto: CreatePurchaseHistoryDto,
  ): Promise<PurchaseHistoryDto> {
    const purchaseId = uuidv4();
    const purchaseDate = new Date().toISOString();

    const purchaseHistory: PurchaseHistoryDto = {
      id: purchaseId,
      customerId,
      productId: purchaseDto.productId,
      quantity: purchaseDto.quantity,
      unitPrice: purchaseDto.unitPrice,
      totalPrice: purchaseDto.totalPrice || purchaseDto.quantity * purchaseDto.unitPrice,
      purchaseDate,
      storeLocation: purchaseDto.storeLocation,
      promotionUsed: purchaseDto.promotionUsed || false,
      rating: purchaseDto.rating,
      review: purchaseDto.review,
    };

    await this.dynamoDBService.put(this.purchaseHistoryTable, purchaseHistory);

    await this.updateShoppingPatterns(customerId, purchaseHistory.totalPrice);

    return purchaseHistory;
  }

  async getCustomerPurchases(
    customerId: string,
    limit: number = 50,
  ): Promise<PurchaseHistoryDto[]> {
    const result = await this.dynamoDBService.query(
      this.purchaseHistoryTable,
      'customerId-purchaseDate-index',
      'customerId = :customerId',
      { ':customerId': customerId },
    );

    return (result || []).slice(0, limit) as PurchaseHistoryDto[];
  }

  async trackProductInteraction(
    customerId: string,
    interactionDto: CreateProductInteractionDto,
  ): Promise<ProductInteractionDto> {
    const interactionId = uuidv4();
    const timestamp = new Date().toISOString();

    const interaction: ProductInteractionDto = {
      id: interactionId,
      customerId,
      productId: interactionDto.productId,
      interactionType: interactionDto.interactionType,
      timestamp,
      sessionId: interactionDto.sessionId,
      metadata: interactionDto.metadata || {},
    };

    await this.dynamoDBService.put(this.productInteractionsTable, interaction);

    return interaction;
  }

  async getCustomerInteractions(
    customerId: string,
    limit: number = 100,
  ): Promise<ProductInteractionDto[]> {
    const result = await this.dynamoDBService.query(
      this.productInteractionsTable,
      'customerId-timestamp-index',
      'customerId = :customerId',
      { ':customerId': customerId },
    );

    return (result || []).slice(0, limit) as ProductInteractionDto[];
  }

  async getProductInteractions(
    productId: string,
    limit: number = 100,
  ): Promise<ProductInteractionDto[]> {
    const result = await this.dynamoDBService.query(
      this.productInteractionsTable,
      'productId-timestamp-index',
      'productId = :productId',
      { ':productId': productId },
    );

    return (result || []).slice(0, limit) as ProductInteractionDto[];
  }

  async importPurchaseHistory(
    customerId: string,
    purchases: CreatePurchaseHistoryDto[],
  ): Promise<{ imported: number; failed: number }> {
    let imported = 0;
    let failed = 0;

    for (const purchase of purchases) {
      try {
        await this.addPurchaseHistory(customerId, purchase);
        imported++;
      } catch (error) {
        console.error(`Failed to import purchase:`, error);
        failed++;
      }
    }

    return { imported, failed };
  }

  private async updateShoppingPatterns(customerId: string, orderValue: number): Promise<void> {
    try {
      const profile = await this.getCustomerProfile(customerId);
      const purchases = await this.getCustomerPurchases(customerId, 100);

      const totalValue = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
      const averageOrderValue = purchases.length > 0 ? totalValue / purchases.length : orderValue;

      const frequency = this.calculateShoppingFrequency(purchases);

      profile.shoppingPatterns.averageOrderValue = averageOrderValue;
      profile.shoppingPatterns.shoppingFrequency = frequency;
      profile.updatedAt = new Date().toISOString();

      await this.dynamoDBService.put(this.profilesTable, profile);
    } catch (error) {
      console.error('Error updating shopping patterns:', error);
    }
  }

  private calculateShoppingFrequency(purchases: PurchaseHistoryDto[]): string {
    if (purchases.length < 2) return 'monthly';

    const dates = purchases
      .map(p => new Date(p.purchaseDate).getTime())
      .sort((a, b) => a - b);

    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push(dates[i] - dates[i - 1]);
    }

    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const avgDays = avgInterval / (1000 * 60 * 60 * 24);

    if (avgDays <= 3) return 'daily';
    if (avgDays <= 7) return 'weekly';
    if (avgDays <= 14) return 'biweekly';
    if (avgDays <= 30) return 'monthly';
    return 'occasional';
  }

  async getCustomersBySegment(segment: string): Promise<CustomerProfileDto[]> {
    const result = await this.dynamoDBService.scan(this.profilesTable, {
      FilterExpression: 'shoppingPatterns.shoppingFrequency = :segment',
      ExpressionAttributeValues: {
        ':segment': segment,
      },
    });
    return (result || []) as CustomerProfileDto[];
  }

  async getAllCustomers(limit: number = 100): Promise<CustomerProfileDto[]> {
    const result = await this.dynamoDBService.scan(this.profilesTable, {
      Limit: limit,
    });

    return (result || []).slice(0, limit) as CustomerProfileDto[];
  }
}