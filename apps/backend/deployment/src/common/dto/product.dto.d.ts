export declare class ProductDto {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    category: string;
    quantity: number;
    minThreshold: number;
    price: number;
    cost?: number;
    supplier: string;
    description?: string;
    unit?: string;
    expirationDate?: string;
    location?: string;
    createdAt: string;
    updatedAt: string;
    lastUpdated: string;
}
export declare class CreateProductDto {
    name: string;
    sku: string;
    barcode?: string;
    category: string;
    quantity: number;
    minThreshold: number;
    price: number;
    cost?: number;
    supplier: string;
    description?: string;
    unit?: string;
    expirationDate?: string;
    location?: string;
}
export declare class UpdateProductDto {
    name?: string;
    barcode?: string;
    category?: string;
    quantity?: number;
    minThreshold?: number;
    price?: number;
    cost?: number;
    supplier?: string;
    description?: string;
    unit?: string;
    expirationDate?: string;
    location?: string;
}
