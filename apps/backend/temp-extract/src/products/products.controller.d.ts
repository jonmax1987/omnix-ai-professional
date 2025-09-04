import { ProductsService } from './products.service';
import { ProductDto, CreateProductDto, UpdateProductDto } from '@/common/dto/product.dto';
import { ProductQueryDto, PaginatedResponseDto } from '@/common/dto/common.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getProducts(query: ProductQueryDto): Promise<PaginatedResponseDto<ProductDto>>;
    createProduct(createProductDto: CreateProductDto): Promise<{
        data: ProductDto;
        message: string;
    }>;
    getProduct(productId: string): Promise<{
        data: ProductDto;
    }>;
    updateProduct(productId: string, updateProductDto: UpdateProductDto): Promise<{
        data: ProductDto;
        message: string;
    }>;
    patchProduct(productId: string, updateProductDto: UpdateProductDto): Promise<{
        data: ProductDto;
        message: string;
    }>;
    deleteProduct(productId: string): Promise<{
        message: string;
    }>;
}
