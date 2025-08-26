"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const products_service_1 = require("./products.service");
const product_dto_1 = require("../common/dto/product.dto");
const common_dto_1 = require("../common/dto/common.dto");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getProducts(query) {
        try {
            return await this.productsService.findAll(query);
        }
        catch (error) {
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to retrieve products',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createProduct(createProductDto) {
        try {
            const product = await this.productsService.create(createProductDto);
            return {
                data: product,
                message: 'Product created successfully',
            };
        }
        catch (error) {
            if (error.message.includes('SKU already exists')) {
                throw new common_1.HttpException({
                    error: 'Conflict',
                    message: 'Product with this SKU already exists',
                    details: error.message,
                    code: common_1.HttpStatus.CONFLICT,
                    timestamp: new Date().toISOString(),
                }, common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to create product',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProduct(productId) {
        try {
            const product = await this.productsService.findOne(productId);
            if (!product) {
                throw new common_1.HttpException({
                    error: 'Not Found',
                    message: 'Product not found',
                    code: common_1.HttpStatus.NOT_FOUND,
                    timestamp: new Date().toISOString(),
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return { data: product };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.NOT_FOUND) {
                throw error;
            }
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to retrieve product',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateProduct(productId, updateProductDto) {
        try {
            const product = await this.productsService.update(productId, updateProductDto);
            if (!product) {
                throw new common_1.HttpException({
                    error: 'Not Found',
                    message: 'Product not found',
                    code: common_1.HttpStatus.NOT_FOUND,
                    timestamp: new Date().toISOString(),
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                data: product,
                message: 'Product updated successfully',
            };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.NOT_FOUND) {
                throw error;
            }
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to update product',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async patchProduct(productId, updateProductDto) {
        try {
            const product = await this.productsService.update(productId, updateProductDto);
            if (!product) {
                throw new common_1.HttpException({
                    error: 'Not Found',
                    message: 'Product not found',
                    code: common_1.HttpStatus.NOT_FOUND,
                    timestamp: new Date().toISOString(),
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                data: product,
                message: 'Product updated successfully',
            };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.NOT_FOUND) {
                throw error;
            }
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to update product',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteProduct(productId) {
        try {
            const deleted = await this.productsService.remove(productId);
            if (!deleted) {
                throw new common_1.HttpException({
                    error: 'Not Found',
                    message: 'Product not found',
                    code: common_1.HttpStatus.NOT_FOUND,
                    timestamp: new Date().toISOString(),
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'Product deleted successfully' };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.NOT_FOUND) {
                throw error;
            }
            throw new common_1.HttpException({
                error: 'Internal Server Error',
                message: 'Failed to delete product',
                details: error.message,
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all products',
        description: 'Retrieve a paginated list of products with optional filtering and sorting',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Products retrieved successfully',
        type: (common_dto_1.PaginatedResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input parameters',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        type: common_dto_1.ErrorDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_dto_1.ProductQueryDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new product',
        description: 'Add a new product to the inventory',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Product created successfully',
        type: (common_dto_1.SuccessResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input parameters',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Product with this SKU already exists',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        type: common_dto_1.ErrorDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)(':productId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get product by ID',
        description: 'Retrieve a specific product by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'productId',
        description: 'Product unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product retrieved successfully',
        type: (common_dto_1.SuccessResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Not Found - Product not found',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        type: common_dto_1.ErrorDto,
    }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Put)(':productId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update product',
        description: "Update an existing product's information",
    }),
    (0, swagger_1.ApiParam)({
        name: 'productId',
        description: 'Product unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product updated successfully',
        type: (common_dto_1.SuccessResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input parameters',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Not Found - Product not found',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        type: common_dto_1.ErrorDto,
    }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Patch)(':productId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Partially update product',
        description: "Partially update an existing product's information",
    }),
    (0, swagger_1.ApiParam)({
        name: 'productId',
        description: 'Product unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product updated successfully',
        type: (common_dto_1.SuccessResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input parameters',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Not Found - Product not found',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        type: common_dto_1.ErrorDto,
    }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "patchProduct", null);
__decorate([
    (0, common_1.Delete)(':productId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete product',
        description: 'Remove a product from the inventory',
    }),
    (0, swagger_1.ApiParam)({
        name: 'productId',
        description: 'Product unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Product deleted successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Not Found - Product not found',
        type: common_dto_1.ErrorDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        type: common_dto_1.ErrorDto,
    }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "deleteProduct", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, swagger_1.ApiSecurity)('ApiKeyAuth'),
    (0, swagger_1.ApiSecurity)('BearerAuth'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map