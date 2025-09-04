import { DynamoDBService } from '../services/dynamodb.service';
import { CustomerProfileDto, CreateCustomerProfileDto, UpdateCustomerProfileDto, CustomerPreferencesDto, PurchaseHistoryDto, ProductInteractionDto, CreatePurchaseHistoryDto, CreateProductInteractionDto } from '../common/dto/customer.dto';
export declare class CustomersService {
    private readonly dynamoDBService;
    private readonly profilesTable;
    private readonly purchaseHistoryTable;
    private readonly productInteractionsTable;
    constructor(dynamoDBService: DynamoDBService);
    createCustomerProfile(createDto: CreateCustomerProfileDto): Promise<CustomerProfileDto>;
    getCustomerProfile(customerId: string): Promise<CustomerProfileDto>;
    updateCustomerProfile(customerId: string, updateDto: UpdateCustomerProfileDto): Promise<CustomerProfileDto>;
    updateCustomerPreferences(customerId: string, preferences: CustomerPreferencesDto): Promise<CustomerProfileDto>;
    addPurchaseHistory(customerId: string, purchaseDto: CreatePurchaseHistoryDto): Promise<PurchaseHistoryDto>;
    getCustomerPurchases(customerId: string, limit?: number): Promise<PurchaseHistoryDto[]>;
    trackProductInteraction(customerId: string, interactionDto: CreateProductInteractionDto): Promise<ProductInteractionDto>;
    getCustomerInteractions(customerId: string, limit?: number): Promise<ProductInteractionDto[]>;
    getProductInteractions(productId: string, limit?: number): Promise<ProductInteractionDto[]>;
    importPurchaseHistory(customerId: string, purchases: CreatePurchaseHistoryDto[]): Promise<{
        imported: number;
        failed: number;
    }>;
    private updateShoppingPatterns;
    private calculateShoppingFrequency;
    getCustomersBySegment(segment: string): Promise<CustomerProfileDto[]>;
    getAllCustomers(limit?: number): Promise<CustomerProfileDto[]>;
}
