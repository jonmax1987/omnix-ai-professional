"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductDto = exports.CreateProductDto = exports.ProductDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
let ProductDto = (() => {
    var _a;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _sku_decorators;
    let _sku_initializers = [];
    let _sku_extraInitializers = [];
    let _barcode_decorators;
    let _barcode_initializers = [];
    let _barcode_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _minThreshold_decorators;
    let _minThreshold_initializers = [];
    let _minThreshold_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _cost_decorators;
    let _cost_initializers = [];
    let _cost_extraInitializers = [];
    let _supplier_decorators;
    let _supplier_initializers = [];
    let _supplier_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _unit_decorators;
    let _unit_initializers = [];
    let _unit_extraInitializers = [];
    let _expirationDate_decorators;
    let _expirationDate_initializers = [];
    let _expirationDate_extraInitializers = [];
    let _location_decorators;
    let _location_initializers = [];
    let _location_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    let _lastUpdated_decorators;
    let _lastUpdated_initializers = [];
    let _lastUpdated_extraInitializers = [];
    return _a = class ProductDto {
            constructor() {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.sku = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _sku_initializers, void 0));
                this.barcode = (__runInitializers(this, _sku_extraInitializers), __runInitializers(this, _barcode_initializers, void 0));
                this.category = (__runInitializers(this, _barcode_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.quantity = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.minThreshold = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _minThreshold_initializers, void 0));
                this.price = (__runInitializers(this, _minThreshold_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.cost = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _cost_initializers, void 0));
                this.supplier = (__runInitializers(this, _cost_extraInitializers), __runInitializers(this, _supplier_initializers, void 0));
                this.description = (__runInitializers(this, _supplier_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.unit = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _unit_initializers, void 0));
                this.expirationDate = (__runInitializers(this, _unit_extraInitializers), __runInitializers(this, _expirationDate_initializers, void 0));
                this.location = (__runInitializers(this, _expirationDate_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.createdAt = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
                this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
                this.lastUpdated = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _lastUpdated_initializers, void 0));
                __runInitializers(this, _lastUpdated_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product unique identifier',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                }), (0, class_validator_1.IsUUID)()];
            _name_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product name',
                    example: 'Premium Coffee Beans',
                    maxLength: 255,
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(255)];
            _sku_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Stock Keeping Unit',
                    example: 'PCB-001',
                    maxLength: 100,
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(100)];
            _barcode_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product barcode',
                    example: '1234567890123',
                    maxLength: 50,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(50)];
            _category_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product category',
                    example: 'Beverages',
                    maxLength: 100,
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(100)];
            _quantity_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Current stock quantity',
                    example: 150,
                    minimum: 0,
                }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _minThreshold_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Minimum stock threshold for alerts',
                    example: 20,
                    minimum: 0,
                }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _price_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product selling price',
                    example: 24.99,
                    minimum: 0,
                }), (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }), (0, class_validator_1.Min)(0)];
            _cost_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product cost price',
                    example: 18.50,
                    minimum: 0,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }), (0, class_validator_1.Min)(0)];
            _supplier_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product supplier',
                    example: 'Global Coffee Co.',
                    maxLength: 255,
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(255)];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product description',
                    example: 'High-quality arabica coffee beans sourced from Colombia',
                    maxLength: 1000,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(1000)];
            _unit_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Unit of measurement',
                    example: 'kg',
                    maxLength: 20,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(20)];
            _expirationDate_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product expiration date',
                    example: '2024-12-31',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _location_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Storage location',
                    example: 'Warehouse A, Shelf 3',
                    maxLength: 100,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(100)];
            _createdAt_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product creation timestamp',
                    example: '2024-01-15T10:30:00Z',
                }), (0, class_validator_1.IsDateString)()];
            _updatedAt_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product last update timestamp',
                    example: '2024-01-20T14:45:00Z',
                }), (0, class_validator_1.IsDateString)()];
            _lastUpdated_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product last update timestamp (alias)',
                    example: '2024-01-20T14:45:00Z',
                }), (0, class_validator_1.IsDateString)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: obj => "sku" in obj, get: obj => obj.sku, set: (obj, value) => { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
            __esDecorate(null, null, _barcode_decorators, { kind: "field", name: "barcode", static: false, private: false, access: { has: obj => "barcode" in obj, get: obj => obj.barcode, set: (obj, value) => { obj.barcode = value; } }, metadata: _metadata }, _barcode_initializers, _barcode_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _minThreshold_decorators, { kind: "field", name: "minThreshold", static: false, private: false, access: { has: obj => "minThreshold" in obj, get: obj => obj.minThreshold, set: (obj, value) => { obj.minThreshold = value; } }, metadata: _metadata }, _minThreshold_initializers, _minThreshold_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _cost_decorators, { kind: "field", name: "cost", static: false, private: false, access: { has: obj => "cost" in obj, get: obj => obj.cost, set: (obj, value) => { obj.cost = value; } }, metadata: _metadata }, _cost_initializers, _cost_extraInitializers);
            __esDecorate(null, null, _supplier_decorators, { kind: "field", name: "supplier", static: false, private: false, access: { has: obj => "supplier" in obj, get: obj => obj.supplier, set: (obj, value) => { obj.supplier = value; } }, metadata: _metadata }, _supplier_initializers, _supplier_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _unit_decorators, { kind: "field", name: "unit", static: false, private: false, access: { has: obj => "unit" in obj, get: obj => obj.unit, set: (obj, value) => { obj.unit = value; } }, metadata: _metadata }, _unit_initializers, _unit_extraInitializers);
            __esDecorate(null, null, _expirationDate_decorators, { kind: "field", name: "expirationDate", static: false, private: false, access: { has: obj => "expirationDate" in obj, get: obj => obj.expirationDate, set: (obj, value) => { obj.expirationDate = value; } }, metadata: _metadata }, _expirationDate_initializers, _expirationDate_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: obj => "location" in obj, get: obj => obj.location, set: (obj, value) => { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, null, _lastUpdated_decorators, { kind: "field", name: "lastUpdated", static: false, private: false, access: { has: obj => "lastUpdated" in obj, get: obj => obj.lastUpdated, set: (obj, value) => { obj.lastUpdated = value; } }, metadata: _metadata }, _lastUpdated_initializers, _lastUpdated_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.ProductDto = ProductDto;
let CreateProductDto = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _sku_decorators;
    let _sku_initializers = [];
    let _sku_extraInitializers = [];
    let _barcode_decorators;
    let _barcode_initializers = [];
    let _barcode_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _minThreshold_decorators;
    let _minThreshold_initializers = [];
    let _minThreshold_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _cost_decorators;
    let _cost_initializers = [];
    let _cost_extraInitializers = [];
    let _supplier_decorators;
    let _supplier_initializers = [];
    let _supplier_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _unit_decorators;
    let _unit_initializers = [];
    let _unit_extraInitializers = [];
    let _expirationDate_decorators;
    let _expirationDate_initializers = [];
    let _expirationDate_extraInitializers = [];
    let _location_decorators;
    let _location_initializers = [];
    let _location_extraInitializers = [];
    return _a = class CreateProductDto {
            constructor() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.sku = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _sku_initializers, void 0));
                this.barcode = (__runInitializers(this, _sku_extraInitializers), __runInitializers(this, _barcode_initializers, void 0));
                this.category = (__runInitializers(this, _barcode_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.quantity = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.minThreshold = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _minThreshold_initializers, void 0));
                this.price = (__runInitializers(this, _minThreshold_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.cost = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _cost_initializers, void 0));
                this.supplier = (__runInitializers(this, _cost_extraInitializers), __runInitializers(this, _supplier_initializers, void 0));
                this.description = (__runInitializers(this, _supplier_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.unit = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _unit_initializers, void 0));
                this.expirationDate = (__runInitializers(this, _unit_extraInitializers), __runInitializers(this, _expirationDate_initializers, void 0));
                this.location = (__runInitializers(this, _expirationDate_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                __runInitializers(this, _location_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product name',
                    example: 'Premium Coffee Beans',
                    maxLength: 255,
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(255)];
            _sku_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Stock Keeping Unit',
                    example: 'PCB-001',
                    maxLength: 100,
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(100)];
            _barcode_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product barcode',
                    example: '1234567890123',
                    maxLength: 50,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(50)];
            _category_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product category',
                    example: 'Beverages',
                    maxLength: 100,
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(100)];
            _quantity_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Initial stock quantity',
                    example: 150,
                    minimum: 0,
                }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _minThreshold_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Minimum stock threshold for alerts',
                    example: 20,
                    minimum: 0,
                }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _price_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product selling price',
                    example: 24.99,
                    minimum: 0,
                }), (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }), (0, class_validator_1.Min)(0)];
            _cost_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product cost price',
                    example: 18.50,
                    minimum: 0,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }), (0, class_validator_1.Min)(0)];
            _supplier_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product supplier',
                    example: 'Global Coffee Co.',
                    maxLength: 255,
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(255)];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product description',
                    example: 'High-quality arabica coffee beans sourced from Colombia',
                    maxLength: 1000,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(1000)];
            _unit_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Unit of measurement',
                    example: 'kg',
                    maxLength: 20,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(20)];
            _expirationDate_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product expiration date',
                    example: '2024-12-31',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _location_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Storage location',
                    example: 'Warehouse A, Shelf 3',
                    maxLength: 100,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(100)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: obj => "sku" in obj, get: obj => obj.sku, set: (obj, value) => { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
            __esDecorate(null, null, _barcode_decorators, { kind: "field", name: "barcode", static: false, private: false, access: { has: obj => "barcode" in obj, get: obj => obj.barcode, set: (obj, value) => { obj.barcode = value; } }, metadata: _metadata }, _barcode_initializers, _barcode_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _minThreshold_decorators, { kind: "field", name: "minThreshold", static: false, private: false, access: { has: obj => "minThreshold" in obj, get: obj => obj.minThreshold, set: (obj, value) => { obj.minThreshold = value; } }, metadata: _metadata }, _minThreshold_initializers, _minThreshold_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _cost_decorators, { kind: "field", name: "cost", static: false, private: false, access: { has: obj => "cost" in obj, get: obj => obj.cost, set: (obj, value) => { obj.cost = value; } }, metadata: _metadata }, _cost_initializers, _cost_extraInitializers);
            __esDecorate(null, null, _supplier_decorators, { kind: "field", name: "supplier", static: false, private: false, access: { has: obj => "supplier" in obj, get: obj => obj.supplier, set: (obj, value) => { obj.supplier = value; } }, metadata: _metadata }, _supplier_initializers, _supplier_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _unit_decorators, { kind: "field", name: "unit", static: false, private: false, access: { has: obj => "unit" in obj, get: obj => obj.unit, set: (obj, value) => { obj.unit = value; } }, metadata: _metadata }, _unit_initializers, _unit_extraInitializers);
            __esDecorate(null, null, _expirationDate_decorators, { kind: "field", name: "expirationDate", static: false, private: false, access: { has: obj => "expirationDate" in obj, get: obj => obj.expirationDate, set: (obj, value) => { obj.expirationDate = value; } }, metadata: _metadata }, _expirationDate_initializers, _expirationDate_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: obj => "location" in obj, get: obj => obj.location, set: (obj, value) => { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateProductDto = CreateProductDto;
let UpdateProductDto = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _barcode_decorators;
    let _barcode_initializers = [];
    let _barcode_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _minThreshold_decorators;
    let _minThreshold_initializers = [];
    let _minThreshold_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _cost_decorators;
    let _cost_initializers = [];
    let _cost_extraInitializers = [];
    let _supplier_decorators;
    let _supplier_initializers = [];
    let _supplier_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _unit_decorators;
    let _unit_initializers = [];
    let _unit_extraInitializers = [];
    let _expirationDate_decorators;
    let _expirationDate_initializers = [];
    let _expirationDate_extraInitializers = [];
    let _location_decorators;
    let _location_initializers = [];
    let _location_extraInitializers = [];
    return _a = class UpdateProductDto {
            constructor() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.barcode = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _barcode_initializers, void 0));
                this.category = (__runInitializers(this, _barcode_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.quantity = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.minThreshold = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _minThreshold_initializers, void 0));
                this.price = (__runInitializers(this, _minThreshold_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.cost = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _cost_initializers, void 0));
                this.supplier = (__runInitializers(this, _cost_extraInitializers), __runInitializers(this, _supplier_initializers, void 0));
                this.description = (__runInitializers(this, _supplier_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.unit = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _unit_initializers, void 0));
                this.expirationDate = (__runInitializers(this, _unit_extraInitializers), __runInitializers(this, _expirationDate_initializers, void 0));
                this.location = (__runInitializers(this, _expirationDate_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                __runInitializers(this, _location_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product name',
                    example: 'Premium Coffee Beans',
                    maxLength: 255,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(255)];
            _barcode_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product barcode',
                    example: '1234567890123',
                    maxLength: 50,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(50)];
            _category_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product category',
                    example: 'Beverages',
                    maxLength: 100,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(100)];
            _quantity_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Stock quantity',
                    example: 150,
                    minimum: 0,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _minThreshold_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Minimum stock threshold for alerts',
                    example: 20,
                    minimum: 0,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _price_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product selling price',
                    example: 24.99,
                    minimum: 0,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }), (0, class_validator_1.Min)(0)];
            _cost_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product cost price',
                    example: 18.50,
                    minimum: 0,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }), (0, class_validator_1.Min)(0)];
            _supplier_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product supplier',
                    example: 'Global Coffee Co.',
                    maxLength: 255,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(255)];
            _description_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product description',
                    example: 'High-quality arabica coffee beans sourced from Colombia',
                    maxLength: 1000,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(1000)];
            _unit_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Unit of measurement',
                    example: 'kg',
                    maxLength: 20,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(20)];
            _expirationDate_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Product expiration date',
                    example: '2024-12-31',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _location_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Storage location',
                    example: 'Warehouse A, Shelf 3',
                    maxLength: 100,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(100)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _barcode_decorators, { kind: "field", name: "barcode", static: false, private: false, access: { has: obj => "barcode" in obj, get: obj => obj.barcode, set: (obj, value) => { obj.barcode = value; } }, metadata: _metadata }, _barcode_initializers, _barcode_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _minThreshold_decorators, { kind: "field", name: "minThreshold", static: false, private: false, access: { has: obj => "minThreshold" in obj, get: obj => obj.minThreshold, set: (obj, value) => { obj.minThreshold = value; } }, metadata: _metadata }, _minThreshold_initializers, _minThreshold_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _cost_decorators, { kind: "field", name: "cost", static: false, private: false, access: { has: obj => "cost" in obj, get: obj => obj.cost, set: (obj, value) => { obj.cost = value; } }, metadata: _metadata }, _cost_initializers, _cost_extraInitializers);
            __esDecorate(null, null, _supplier_decorators, { kind: "field", name: "supplier", static: false, private: false, access: { has: obj => "supplier" in obj, get: obj => obj.supplier, set: (obj, value) => { obj.supplier = value; } }, metadata: _metadata }, _supplier_initializers, _supplier_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _unit_decorators, { kind: "field", name: "unit", static: false, private: false, access: { has: obj => "unit" in obj, get: obj => obj.unit, set: (obj, value) => { obj.unit = value; } }, metadata: _metadata }, _unit_initializers, _unit_extraInitializers);
            __esDecorate(null, null, _expirationDate_decorators, { kind: "field", name: "expirationDate", static: false, private: false, access: { has: obj => "expirationDate" in obj, get: obj => obj.expirationDate, set: (obj, value) => { obj.expirationDate = value; } }, metadata: _metadata }, _expirationDate_initializers, _expirationDate_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: obj => "location" in obj, get: obj => obj.location, set: (obj, value) => { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpdateProductDto = UpdateProductDto;
