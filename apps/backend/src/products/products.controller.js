"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_dto_1 = require("@/common/dto/common.dto");
let ProductsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Products'), (0, swagger_1.ApiSecurity)('ApiKeyAuth'), (0, swagger_1.ApiSecurity)('BearerAuth'), (0, common_1.Controller)('products')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getProducts_decorators;
    let _createProduct_decorators;
    let _getProduct_decorators;
    let _updateProduct_decorators;
    let _patchProduct_decorators;
    let _deleteProduct_decorators;
    var ProductsController = _classThis = class {
        constructor(productsService) {
            this.productsService = (__runInitializers(this, _instanceExtraInitializers), productsService);
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
    __setFunctionName(_classThis, "ProductsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getProducts_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({
                summary: 'Get all products',
                description: 'Retrieve a paginated list of products with optional filtering and sorting',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Products retrieved successfully',
                type: (common_dto_1.PaginatedResponseDto),
            }), (0, swagger_1.ApiResponse)({
                status: 400,
                description: 'Bad Request - Invalid input parameters',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 401,
                description: 'Unauthorized - Authentication required',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 500,
                description: 'Internal Server Error',
                type: common_dto_1.ErrorDto,
            })];
        _createProduct_decorators = [(0, common_1.Post)(), (0, swagger_1.ApiOperation)({
                summary: 'Create a new product',
                description: 'Add a new product to the inventory',
            }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: 'Product created successfully',
                type: (common_dto_1.SuccessResponseDto),
            }), (0, swagger_1.ApiResponse)({
                status: 400,
                description: 'Bad Request - Invalid input parameters',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 401,
                description: 'Unauthorized - Authentication required',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 409,
                description: 'Conflict - Product with this SKU already exists',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 500,
                description: 'Internal Server Error',
                type: common_dto_1.ErrorDto,
            })];
        _getProduct_decorators = [(0, common_1.Get)(':productId'), (0, swagger_1.ApiOperation)({
                summary: 'Get product by ID',
                description: 'Retrieve a specific product by its ID',
            }), (0, swagger_1.ApiParam)({
                name: 'productId',
                description: 'Product unique identifier',
                example: '123e4567-e89b-12d3-a456-426614174000',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Product retrieved successfully',
                type: (common_dto_1.SuccessResponseDto),
            }), (0, swagger_1.ApiResponse)({
                status: 401,
                description: 'Unauthorized - Authentication required',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 404,
                description: 'Not Found - Product not found',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 500,
                description: 'Internal Server Error',
                type: common_dto_1.ErrorDto,
            })];
        _updateProduct_decorators = [(0, common_1.Put)(':productId'), (0, swagger_1.ApiOperation)({
                summary: 'Update product',
                description: "Update an existing product's information",
            }), (0, swagger_1.ApiParam)({
                name: 'productId',
                description: 'Product unique identifier',
                example: '123e4567-e89b-12d3-a456-426614174000',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Product updated successfully',
                type: (common_dto_1.SuccessResponseDto),
            }), (0, swagger_1.ApiResponse)({
                status: 400,
                description: 'Bad Request - Invalid input parameters',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 401,
                description: 'Unauthorized - Authentication required',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 404,
                description: 'Not Found - Product not found',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 500,
                description: 'Internal Server Error',
                type: common_dto_1.ErrorDto,
            })];
        _patchProduct_decorators = [(0, common_1.Patch)(':productId'), (0, swagger_1.ApiOperation)({
                summary: 'Partially update product',
                description: "Partially update an existing product's information",
            }), (0, swagger_1.ApiParam)({
                name: 'productId',
                description: 'Product unique identifier',
                example: '123e4567-e89b-12d3-a456-426614174000',
            }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Product updated successfully',
                type: (common_dto_1.SuccessResponseDto),
            }), (0, swagger_1.ApiResponse)({
                status: 400,
                description: 'Bad Request - Invalid input parameters',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 401,
                description: 'Unauthorized - Authentication required',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 404,
                description: 'Not Found - Product not found',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 500,
                description: 'Internal Server Error',
                type: common_dto_1.ErrorDto,
            })];
        _deleteProduct_decorators = [(0, common_1.Delete)(':productId'), (0, swagger_1.ApiOperation)({
                summary: 'Delete product',
                description: 'Remove a product from the inventory',
            }), (0, swagger_1.ApiParam)({
                name: 'productId',
                description: 'Product unique identifier',
                example: '123e4567-e89b-12d3-a456-426614174000',
            }), (0, swagger_1.ApiResponse)({
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
            }), (0, swagger_1.ApiResponse)({
                status: 401,
                description: 'Unauthorized - Authentication required',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 404,
                description: 'Not Found - Product not found',
                type: common_dto_1.ErrorDto,
            }), (0, swagger_1.ApiResponse)({
                status: 500,
                description: 'Internal Server Error',
                type: common_dto_1.ErrorDto,
            })];
        __esDecorate(_classThis, null, _getProducts_decorators, { kind: "method", name: "getProducts", static: false, private: false, access: { has: obj => "getProducts" in obj, get: obj => obj.getProducts }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createProduct_decorators, { kind: "method", name: "createProduct", static: false, private: false, access: { has: obj => "createProduct" in obj, get: obj => obj.createProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProduct_decorators, { kind: "method", name: "getProduct", static: false, private: false, access: { has: obj => "getProduct" in obj, get: obj => obj.getProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProduct_decorators, { kind: "method", name: "updateProduct", static: false, private: false, access: { has: obj => "updateProduct" in obj, get: obj => obj.updateProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _patchProduct_decorators, { kind: "method", name: "patchProduct", static: false, private: false, access: { has: obj => "patchProduct" in obj, get: obj => obj.patchProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteProduct_decorators, { kind: "method", name: "deleteProduct", static: false, private: false, access: { has: obj => "deleteProduct" in obj, get: obj => obj.deleteProduct }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductsController = _classThis;
})();
exports.ProductsController = ProductsController;
