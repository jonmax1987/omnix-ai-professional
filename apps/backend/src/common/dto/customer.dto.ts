import { IsString, IsOptional, IsNumber, IsObject, IsArray, IsEnum, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerDemographicsDto {
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  familySize?: number;
}

export class BudgetRangeDto {
  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(0)
  max: number;
}

export class CustomerPreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteCategories?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetRangeDto)
  budgetRange?: BudgetRangeDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandPreferences?: string[];
}

export class ShoppingPatternsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredShoppingTimes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageOrderValue?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['daily', 'weekly', 'biweekly', 'monthly', 'occasional'])
  shoppingFrequency?: string;

  @IsOptional()
  @IsObject()
  seasonalPatterns?: Record<string, any>;
}

export class CustomerProfileDto {
  @IsString()
  customerId: string;

  @ValidateNested()
  @Type(() => CustomerDemographicsDto)
  demographics: CustomerDemographicsDto;

  @ValidateNested()
  @Type(() => CustomerPreferencesDto)
  preferences: CustomerPreferencesDto;

  @ValidateNested()
  @Type(() => ShoppingPatternsDto)
  shoppingPatterns: ShoppingPatternsDto;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}

export class CreateCustomerProfileDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDemographicsDto)
  demographics?: CustomerDemographicsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerPreferencesDto)
  preferences?: CustomerPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShoppingPatternsDto)
  shoppingPatterns?: ShoppingPatternsDto;
}

export class UpdateCustomerProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDemographicsDto)
  demographics?: CustomerDemographicsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerPreferencesDto)
  preferences?: CustomerPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShoppingPatternsDto)
  shoppingPatterns?: ShoppingPatternsDto;
}

export class PurchaseHistoryDto {
  @IsString()
  id: string;

  @IsString()
  customerId: string;

  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString()
  purchaseDate: string;

  @IsOptional()
  @IsString()
  storeLocation?: string;

  @IsOptional()
  @IsBoolean()
  promotionUsed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  review?: string;
}

export class CreatePurchaseHistoryDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsString()
  storeLocation?: string;

  @IsOptional()
  @IsBoolean()
  promotionUsed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  review?: string;
}

export class ProductInteractionDto {
  @IsString()
  id: string;

  @IsString()
  customerId: string;

  @IsString()
  productId: string;

  @IsString()
  @IsEnum(['view', 'add_to_cart', 'remove_from_cart', 'wishlist', 'search'])
  interactionType: string;

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateProductInteractionDto {
  @IsString()
  productId: string;

  @IsString()
  @IsEnum(['view', 'add_to_cart', 'remove_from_cart', 'wishlist', 'search'])
  interactionType: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ImportPurchaseHistoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseHistoryDto)
  purchases: CreatePurchaseHistoryDto[];
}