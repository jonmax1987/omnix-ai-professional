export declare class PaginationDto {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
}
export declare class ProductQueryDto extends PaginationQueryDto {
    search?: string;
    category?: string;
    supplier?: string;
    sortBy?: string;
    sortOrder?: string;
    lowStock?: boolean;
}
export declare class ErrorDto {
    error: string;
    message: string;
    details?: string;
    code: number;
    timestamp: string;
}
export declare class SuccessResponseDto<T> {
    data: T;
    message?: string;
}
export declare class PaginatedResponseDto<T> {
    data: T[];
    pagination: PaginationDto;
    meta?: any;
}
