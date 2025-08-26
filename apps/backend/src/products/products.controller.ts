import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
} from '@/common/dto/product.dto';
import {
  ProductQueryDto,
  SuccessResponseDto,
  PaginatedResponseDto,
  ErrorDto,
} from '@/common/dto/common.dto';

@ApiTags('Products')
@ApiSecurity('ApiKeyAuth')
@ApiSecurity('BearerAuth')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description:
      'Retrieve a paginated list of products with optional filtering and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: PaginatedResponseDto<ProductDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input parameters',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorDto,
  })
  async getProducts(@Query() query: ProductQueryDto) {
    try {
      return await this.productsService.findAll(query);
    } catch (error) {
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to retrieve products',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Add a new product to the inventory',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: SuccessResponseDto<ProductDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input parameters',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Product with this SKU already exists',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorDto,
  })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productsService.create(createProductDto);
      return {
        data: product,
        message: 'Product created successfully',
      };
    } catch (error) {
      if (error.message.includes('SKU already exists')) {
        throw new HttpException(
          {
            error: 'Conflict',
            message: 'Product with this SKU already exists',
            details: error.message,
            code: HttpStatus.CONFLICT,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to create product',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':productId')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve a specific product by its ID',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: SuccessResponseDto<ProductDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Product not found',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorDto,
  })
  async getProduct(@Param('productId') productId: string) {
    try {
      const product = await this.productsService.findOne(productId);
      if (!product) {
        throw new HttpException(
          {
            error: 'Not Found',
            message: 'Product not found',
            code: HttpStatus.NOT_FOUND,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return { data: product };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to retrieve product',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':productId')
  @ApiOperation({
    summary: 'Update product',
    description: "Update an existing product's information",
  })
  @ApiParam({
    name: 'productId',
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: SuccessResponseDto<ProductDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input parameters',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Product not found',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorDto,
  })
  async updateProduct(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const product = await this.productsService.update(productId, updateProductDto);
      if (!product) {
        throw new HttpException(
          {
            error: 'Not Found',
            message: 'Product not found',
            code: HttpStatus.NOT_FOUND,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        data: product,
        message: 'Product updated successfully',
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to update product',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':productId')
  @ApiOperation({
    summary: 'Partially update product',
    description: "Partially update an existing product's information",
  })
  @ApiParam({
    name: 'productId',
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: SuccessResponseDto<ProductDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input parameters',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Product not found',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorDto,
  })
  async patchProduct(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const product = await this.productsService.update(productId, updateProductDto);
      if (!product) {
        throw new HttpException(
          {
            error: 'Not Found',
            message: 'Product not found',
            code: HttpStatus.NOT_FOUND,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        data: product,
        message: 'Product updated successfully',
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to update product',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':productId')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Remove a product from the inventory',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Product not found',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorDto,
  })
  async deleteProduct(@Param('productId') productId: string) {
    try {
      const deleted = await this.productsService.remove(productId);
      if (!deleted) {
        throw new HttpException(
          {
            error: 'Not Found',
            message: 'Product not found',
            code: HttpStatus.NOT_FOUND,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return { message: 'Product deleted successfully' };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        {
          error: 'Internal Server Error',
          message: 'Failed to delete product',
          details: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}