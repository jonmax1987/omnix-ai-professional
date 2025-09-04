export declare class CustomerDemographicsDto {
    age?: number;
    gender?: string;
    location?: string;
    familySize?: number;
}
export declare class BudgetRangeDto {
    min: number;
    max: number;
}
export declare class CustomerPreferencesDto {
    dietaryRestrictions?: string[];
    favoriteCategories?: string[];
    budgetRange?: BudgetRangeDto;
    brandPreferences?: string[];
}
export declare class ShoppingPatternsDto {
    preferredShoppingTimes?: string[];
    averageOrderValue?: number;
    shoppingFrequency?: string;
    seasonalPatterns?: Record<string, any>;
}
export declare class CustomerProfileDto {
    customerId: string;
    demographics: CustomerDemographicsDto;
    preferences: CustomerPreferencesDto;
    shoppingPatterns: ShoppingPatternsDto;
    createdAt: string;
    updatedAt: string;
}
export declare class CreateCustomerProfileDto {
    customerId?: string;
    demographics?: CustomerDemographicsDto;
    preferences?: CustomerPreferencesDto;
    shoppingPatterns?: ShoppingPatternsDto;
}
export declare class UpdateCustomerProfileDto {
    demographics?: CustomerDemographicsDto;
    preferences?: CustomerPreferencesDto;
    shoppingPatterns?: ShoppingPatternsDto;
}
export declare class PurchaseHistoryDto {
    id: string;
    customerId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    purchaseDate: string;
    storeLocation?: string;
    promotionUsed?: boolean;
    rating?: number;
    review?: string;
}
export declare class CreatePurchaseHistoryDto {
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    storeLocation?: string;
    promotionUsed?: boolean;
    rating?: number;
    review?: string;
}
export declare class ProductInteractionDto {
    id: string;
    customerId: string;
    productId: string;
    interactionType: string;
    timestamp: string;
    sessionId?: string;
    metadata?: Record<string, any>;
}
export declare class CreateProductInteractionDto {
    productId: string;
    interactionType: string;
    sessionId?: string;
    metadata?: Record<string, any>;
}
export declare class ImportPurchaseHistoryDto {
    purchases: CreatePurchaseHistoryDto[];
}
