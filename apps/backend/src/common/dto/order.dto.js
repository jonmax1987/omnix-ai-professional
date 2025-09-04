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
exports.OrderSummary = exports.Order = exports.OrderItem = exports.UpdateOrderDto = exports.CreateOrderDto = exports.OrderItemDto = exports.OrderPriority = exports.OrderStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["APPROVED"] = "approved";
    OrderStatus["ORDERED"] = "ordered";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["RECEIVED"] = "received";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderPriority;
(function (OrderPriority) {
    OrderPriority["LOW"] = "low";
    OrderPriority["MEDIUM"] = "medium";
    OrderPriority["HIGH"] = "high";
    OrderPriority["URGENT"] = "urgent";
})(OrderPriority || (exports.OrderPriority = OrderPriority = {}));
let OrderItemDto = (() => {
    var _a;
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    let _unitPrice_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return _a = class OrderItemDto {
            constructor() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.quantity = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.unitPrice = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
                this.notes = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000' }), (0, class_validator_1.IsUUID)()];
            _quantity_decorators = [(0, swagger_1.ApiProperty)({ example: 100 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _unitPrice_decorators = [(0, swagger_1.ApiProperty)({ example: 24.99 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: 'Requested by store manager' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.OrderItemDto = OrderItemDto;
let CreateOrderDto = (() => {
    var _a;
    let _supplier_decorators;
    let _supplier_initializers = [];
    let _supplier_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    let _expectedDeliveryDate_decorators;
    let _expectedDeliveryDate_initializers = [];
    let _expectedDeliveryDate_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return _a = class CreateOrderDto {
            constructor() {
                this.supplier = __runInitializers(this, _supplier_initializers, void 0);
                this.items = (__runInitializers(this, _supplier_extraInitializers), __runInitializers(this, _items_initializers, void 0));
                this.priority = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
                this.expectedDeliveryDate = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _expectedDeliveryDate_initializers, void 0));
                this.notes = (__runInitializers(this, _expectedDeliveryDate_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _supplier_decorators = [(0, swagger_1.ApiProperty)({ example: 'Global Coffee Co.' }), (0, class_validator_1.IsString)()];
            _items_decorators = [(0, swagger_1.ApiProperty)({ type: [OrderItemDto] }), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => OrderItemDto)];
            _priority_decorators = [(0, swagger_1.ApiProperty)({ enum: OrderPriority, example: OrderPriority.MEDIUM }), (0, class_validator_1.IsEnum)(OrderPriority)];
            _expectedDeliveryDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: '2024-02-01' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: 'Monthly restock order' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _supplier_decorators, { kind: "field", name: "supplier", static: false, private: false, access: { has: obj => "supplier" in obj, get: obj => obj.supplier, set: (obj, value) => { obj.supplier = value; } }, metadata: _metadata }, _supplier_initializers, _supplier_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _expectedDeliveryDate_decorators, { kind: "field", name: "expectedDeliveryDate", static: false, private: false, access: { has: obj => "expectedDeliveryDate" in obj, get: obj => obj.expectedDeliveryDate, set: (obj, value) => { obj.expectedDeliveryDate = value; } }, metadata: _metadata }, _expectedDeliveryDate_initializers, _expectedDeliveryDate_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateOrderDto = CreateOrderDto;
let UpdateOrderDto = (() => {
    var _a;
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    let _expectedDeliveryDate_decorators;
    let _expectedDeliveryDate_initializers = [];
    let _expectedDeliveryDate_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _trackingNumber_decorators;
    let _trackingNumber_initializers = [];
    let _trackingNumber_extraInitializers = [];
    return _a = class UpdateOrderDto {
            constructor() {
                this.status = __runInitializers(this, _status_initializers, void 0);
                this.priority = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
                this.expectedDeliveryDate = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _expectedDeliveryDate_initializers, void 0));
                this.notes = (__runInitializers(this, _expectedDeliveryDate_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                this.trackingNumber = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _trackingNumber_initializers, void 0));
                __runInitializers(this, _trackingNumber_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, swagger_1.ApiPropertyOptional)({ enum: OrderStatus }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(OrderStatus)];
            _priority_decorators = [(0, swagger_1.ApiPropertyOptional)({ enum: OrderPriority }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(OrderPriority)];
            _expectedDeliveryDate_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: '2024-02-01' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: 'Updated delivery date' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _trackingNumber_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: 'TRACK123456' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _expectedDeliveryDate_decorators, { kind: "field", name: "expectedDeliveryDate", static: false, private: false, access: { has: obj => "expectedDeliveryDate" in obj, get: obj => obj.expectedDeliveryDate, set: (obj, value) => { obj.expectedDeliveryDate = value; } }, metadata: _metadata }, _expectedDeliveryDate_initializers, _expectedDeliveryDate_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _trackingNumber_decorators, { kind: "field", name: "trackingNumber", static: false, private: false, access: { has: obj => "trackingNumber" in obj, get: obj => obj.trackingNumber, set: (obj, value) => { obj.trackingNumber = value; } }, metadata: _metadata }, _trackingNumber_initializers, _trackingNumber_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpdateOrderDto = UpdateOrderDto;
let OrderItem = (() => {
    var _a;
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _productName_decorators;
    let _productName_initializers = [];
    let _productName_extraInitializers = [];
    let _sku_decorators;
    let _sku_initializers = [];
    let _sku_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    let _unitPrice_extraInitializers = [];
    let _totalPrice_decorators;
    let _totalPrice_initializers = [];
    let _totalPrice_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return _a = class OrderItem {
            constructor() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.productName = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _productName_initializers, void 0));
                this.sku = (__runInitializers(this, _productName_extraInitializers), __runInitializers(this, _sku_initializers, void 0));
                this.quantity = (__runInitializers(this, _sku_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.unitPrice = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
                this.totalPrice = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _totalPrice_initializers, void 0));
                this.notes = (__runInitializers(this, _totalPrice_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, swagger_1.ApiProperty)()];
            _productName_decorators = [(0, swagger_1.ApiProperty)()];
            _sku_decorators = [(0, swagger_1.ApiProperty)()];
            _quantity_decorators = [(0, swagger_1.ApiProperty)()];
            _unitPrice_decorators = [(0, swagger_1.ApiProperty)()];
            _totalPrice_decorators = [(0, swagger_1.ApiProperty)()];
            _notes_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _productName_decorators, { kind: "field", name: "productName", static: false, private: false, access: { has: obj => "productName" in obj, get: obj => obj.productName, set: (obj, value) => { obj.productName = value; } }, metadata: _metadata }, _productName_initializers, _productName_extraInitializers);
            __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: obj => "sku" in obj, get: obj => obj.sku, set: (obj, value) => { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
            __esDecorate(null, null, _totalPrice_decorators, { kind: "field", name: "totalPrice", static: false, private: false, access: { has: obj => "totalPrice" in obj, get: obj => obj.totalPrice, set: (obj, value) => { obj.totalPrice = value; } }, metadata: _metadata }, _totalPrice_initializers, _totalPrice_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.OrderItem = OrderItem;
let Order = (() => {
    var _a;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _orderNumber_decorators;
    let _orderNumber_initializers = [];
    let _orderNumber_extraInitializers = [];
    let _supplier_decorators;
    let _supplier_initializers = [];
    let _supplier_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    let _totalItems_decorators;
    let _totalItems_initializers = [];
    let _totalItems_extraInitializers = [];
    let _totalAmount_decorators;
    let _totalAmount_initializers = [];
    let _totalAmount_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _priority_decorators;
    let _priority_initializers = [];
    let _priority_extraInitializers = [];
    let _createdBy_decorators;
    let _createdBy_initializers = [];
    let _createdBy_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    let _expectedDeliveryDate_decorators;
    let _expectedDeliveryDate_initializers = [];
    let _expectedDeliveryDate_extraInitializers = [];
    let _actualDeliveryDate_decorators;
    let _actualDeliveryDate_initializers = [];
    let _actualDeliveryDate_extraInitializers = [];
    let _trackingNumber_decorators;
    let _trackingNumber_initializers = [];
    let _trackingNumber_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _approvedBy_decorators;
    let _approvedBy_initializers = [];
    let _approvedBy_extraInitializers = [];
    let _approvedAt_decorators;
    let _approvedAt_initializers = [];
    let _approvedAt_extraInitializers = [];
    return _a = class Order {
            constructor() {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.orderNumber = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _orderNumber_initializers, void 0));
                this.supplier = (__runInitializers(this, _orderNumber_extraInitializers), __runInitializers(this, _supplier_initializers, void 0));
                this.items = (__runInitializers(this, _supplier_extraInitializers), __runInitializers(this, _items_initializers, void 0));
                this.totalItems = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _totalItems_initializers, void 0));
                this.totalAmount = (__runInitializers(this, _totalItems_extraInitializers), __runInitializers(this, _totalAmount_initializers, void 0));
                this.status = (__runInitializers(this, _totalAmount_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.priority = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
                this.createdBy = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
                this.createdAt = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
                this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
                this.expectedDeliveryDate = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _expectedDeliveryDate_initializers, void 0));
                this.actualDeliveryDate = (__runInitializers(this, _expectedDeliveryDate_extraInitializers), __runInitializers(this, _actualDeliveryDate_initializers, void 0));
                this.trackingNumber = (__runInitializers(this, _actualDeliveryDate_extraInitializers), __runInitializers(this, _trackingNumber_initializers, void 0));
                this.notes = (__runInitializers(this, _trackingNumber_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                this.approvedBy = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _approvedBy_initializers, void 0));
                this.approvedAt = (__runInitializers(this, _approvedBy_extraInitializers), __runInitializers(this, _approvedAt_initializers, void 0));
                __runInitializers(this, _approvedAt_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, swagger_1.ApiProperty)()];
            _orderNumber_decorators = [(0, swagger_1.ApiProperty)()];
            _supplier_decorators = [(0, swagger_1.ApiProperty)()];
            _items_decorators = [(0, swagger_1.ApiProperty)({ type: [OrderItem] })];
            _totalItems_decorators = [(0, swagger_1.ApiProperty)()];
            _totalAmount_decorators = [(0, swagger_1.ApiProperty)()];
            _status_decorators = [(0, swagger_1.ApiProperty)({ enum: OrderStatus })];
            _priority_decorators = [(0, swagger_1.ApiProperty)({ enum: OrderPriority })];
            _createdBy_decorators = [(0, swagger_1.ApiProperty)()];
            _createdAt_decorators = [(0, swagger_1.ApiProperty)()];
            _updatedAt_decorators = [(0, swagger_1.ApiProperty)()];
            _expectedDeliveryDate_decorators = [(0, swagger_1.ApiProperty)()];
            _actualDeliveryDate_decorators = [(0, swagger_1.ApiProperty)()];
            _trackingNumber_decorators = [(0, swagger_1.ApiProperty)()];
            _notes_decorators = [(0, swagger_1.ApiProperty)()];
            _approvedBy_decorators = [(0, swagger_1.ApiProperty)()];
            _approvedAt_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _orderNumber_decorators, { kind: "field", name: "orderNumber", static: false, private: false, access: { has: obj => "orderNumber" in obj, get: obj => obj.orderNumber, set: (obj, value) => { obj.orderNumber = value; } }, metadata: _metadata }, _orderNumber_initializers, _orderNumber_extraInitializers);
            __esDecorate(null, null, _supplier_decorators, { kind: "field", name: "supplier", static: false, private: false, access: { has: obj => "supplier" in obj, get: obj => obj.supplier, set: (obj, value) => { obj.supplier = value; } }, metadata: _metadata }, _supplier_initializers, _supplier_extraInitializers);
            __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
            __esDecorate(null, null, _totalItems_decorators, { kind: "field", name: "totalItems", static: false, private: false, access: { has: obj => "totalItems" in obj, get: obj => obj.totalItems, set: (obj, value) => { obj.totalItems = value; } }, metadata: _metadata }, _totalItems_initializers, _totalItems_extraInitializers);
            __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: obj => "totalAmount" in obj, get: obj => obj.totalAmount, set: (obj, value) => { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _totalAmount_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: obj => "priority" in obj, get: obj => obj.priority, set: (obj, value) => { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: obj => "createdBy" in obj, get: obj => obj.createdBy, set: (obj, value) => { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, null, _expectedDeliveryDate_decorators, { kind: "field", name: "expectedDeliveryDate", static: false, private: false, access: { has: obj => "expectedDeliveryDate" in obj, get: obj => obj.expectedDeliveryDate, set: (obj, value) => { obj.expectedDeliveryDate = value; } }, metadata: _metadata }, _expectedDeliveryDate_initializers, _expectedDeliveryDate_extraInitializers);
            __esDecorate(null, null, _actualDeliveryDate_decorators, { kind: "field", name: "actualDeliveryDate", static: false, private: false, access: { has: obj => "actualDeliveryDate" in obj, get: obj => obj.actualDeliveryDate, set: (obj, value) => { obj.actualDeliveryDate = value; } }, metadata: _metadata }, _actualDeliveryDate_initializers, _actualDeliveryDate_extraInitializers);
            __esDecorate(null, null, _trackingNumber_decorators, { kind: "field", name: "trackingNumber", static: false, private: false, access: { has: obj => "trackingNumber" in obj, get: obj => obj.trackingNumber, set: (obj, value) => { obj.trackingNumber = value; } }, metadata: _metadata }, _trackingNumber_initializers, _trackingNumber_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _approvedBy_decorators, { kind: "field", name: "approvedBy", static: false, private: false, access: { has: obj => "approvedBy" in obj, get: obj => obj.approvedBy, set: (obj, value) => { obj.approvedBy = value; } }, metadata: _metadata }, _approvedBy_initializers, _approvedBy_extraInitializers);
            __esDecorate(null, null, _approvedAt_decorators, { kind: "field", name: "approvedAt", static: false, private: false, access: { has: obj => "approvedAt" in obj, get: obj => obj.approvedAt, set: (obj, value) => { obj.approvedAt = value; } }, metadata: _metadata }, _approvedAt_initializers, _approvedAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.Order = Order;
let OrderSummary = (() => {
    var _a;
    let _totalOrders_decorators;
    let _totalOrders_initializers = [];
    let _totalOrders_extraInitializers = [];
    let _pendingOrders_decorators;
    let _pendingOrders_initializers = [];
    let _pendingOrders_extraInitializers = [];
    let _approvedOrders_decorators;
    let _approvedOrders_initializers = [];
    let _approvedOrders_extraInitializers = [];
    let _shippedOrders_decorators;
    let _shippedOrders_initializers = [];
    let _shippedOrders_extraInitializers = [];
    let _receivedOrders_decorators;
    let _receivedOrders_initializers = [];
    let _receivedOrders_extraInitializers = [];
    let _totalOrderValue_decorators;
    let _totalOrderValue_initializers = [];
    let _totalOrderValue_extraInitializers = [];
    let _averageOrderValue_decorators;
    let _averageOrderValue_initializers = [];
    let _averageOrderValue_extraInitializers = [];
    let _ordersByPriority_decorators;
    let _ordersByPriority_initializers = [];
    let _ordersByPriority_extraInitializers = [];
    let _recentOrders_decorators;
    let _recentOrders_initializers = [];
    let _recentOrders_extraInitializers = [];
    return _a = class OrderSummary {
            constructor() {
                this.totalOrders = __runInitializers(this, _totalOrders_initializers, void 0);
                this.pendingOrders = (__runInitializers(this, _totalOrders_extraInitializers), __runInitializers(this, _pendingOrders_initializers, void 0));
                this.approvedOrders = (__runInitializers(this, _pendingOrders_extraInitializers), __runInitializers(this, _approvedOrders_initializers, void 0));
                this.shippedOrders = (__runInitializers(this, _approvedOrders_extraInitializers), __runInitializers(this, _shippedOrders_initializers, void 0));
                this.receivedOrders = (__runInitializers(this, _shippedOrders_extraInitializers), __runInitializers(this, _receivedOrders_initializers, void 0));
                this.totalOrderValue = (__runInitializers(this, _receivedOrders_extraInitializers), __runInitializers(this, _totalOrderValue_initializers, void 0));
                this.averageOrderValue = (__runInitializers(this, _totalOrderValue_extraInitializers), __runInitializers(this, _averageOrderValue_initializers, void 0));
                this.ordersByPriority = (__runInitializers(this, _averageOrderValue_extraInitializers), __runInitializers(this, _ordersByPriority_initializers, void 0));
                this.recentOrders = (__runInitializers(this, _ordersByPriority_extraInitializers), __runInitializers(this, _recentOrders_initializers, void 0));
                __runInitializers(this, _recentOrders_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _totalOrders_decorators = [(0, swagger_1.ApiProperty)()];
            _pendingOrders_decorators = [(0, swagger_1.ApiProperty)()];
            _approvedOrders_decorators = [(0, swagger_1.ApiProperty)()];
            _shippedOrders_decorators = [(0, swagger_1.ApiProperty)()];
            _receivedOrders_decorators = [(0, swagger_1.ApiProperty)()];
            _totalOrderValue_decorators = [(0, swagger_1.ApiProperty)()];
            _averageOrderValue_decorators = [(0, swagger_1.ApiProperty)()];
            _ordersByPriority_decorators = [(0, swagger_1.ApiProperty)()];
            _recentOrders_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _totalOrders_decorators, { kind: "field", name: "totalOrders", static: false, private: false, access: { has: obj => "totalOrders" in obj, get: obj => obj.totalOrders, set: (obj, value) => { obj.totalOrders = value; } }, metadata: _metadata }, _totalOrders_initializers, _totalOrders_extraInitializers);
            __esDecorate(null, null, _pendingOrders_decorators, { kind: "field", name: "pendingOrders", static: false, private: false, access: { has: obj => "pendingOrders" in obj, get: obj => obj.pendingOrders, set: (obj, value) => { obj.pendingOrders = value; } }, metadata: _metadata }, _pendingOrders_initializers, _pendingOrders_extraInitializers);
            __esDecorate(null, null, _approvedOrders_decorators, { kind: "field", name: "approvedOrders", static: false, private: false, access: { has: obj => "approvedOrders" in obj, get: obj => obj.approvedOrders, set: (obj, value) => { obj.approvedOrders = value; } }, metadata: _metadata }, _approvedOrders_initializers, _approvedOrders_extraInitializers);
            __esDecorate(null, null, _shippedOrders_decorators, { kind: "field", name: "shippedOrders", static: false, private: false, access: { has: obj => "shippedOrders" in obj, get: obj => obj.shippedOrders, set: (obj, value) => { obj.shippedOrders = value; } }, metadata: _metadata }, _shippedOrders_initializers, _shippedOrders_extraInitializers);
            __esDecorate(null, null, _receivedOrders_decorators, { kind: "field", name: "receivedOrders", static: false, private: false, access: { has: obj => "receivedOrders" in obj, get: obj => obj.receivedOrders, set: (obj, value) => { obj.receivedOrders = value; } }, metadata: _metadata }, _receivedOrders_initializers, _receivedOrders_extraInitializers);
            __esDecorate(null, null, _totalOrderValue_decorators, { kind: "field", name: "totalOrderValue", static: false, private: false, access: { has: obj => "totalOrderValue" in obj, get: obj => obj.totalOrderValue, set: (obj, value) => { obj.totalOrderValue = value; } }, metadata: _metadata }, _totalOrderValue_initializers, _totalOrderValue_extraInitializers);
            __esDecorate(null, null, _averageOrderValue_decorators, { kind: "field", name: "averageOrderValue", static: false, private: false, access: { has: obj => "averageOrderValue" in obj, get: obj => obj.averageOrderValue, set: (obj, value) => { obj.averageOrderValue = value; } }, metadata: _metadata }, _averageOrderValue_initializers, _averageOrderValue_extraInitializers);
            __esDecorate(null, null, _ordersByPriority_decorators, { kind: "field", name: "ordersByPriority", static: false, private: false, access: { has: obj => "ordersByPriority" in obj, get: obj => obj.ordersByPriority, set: (obj, value) => { obj.ordersByPriority = value; } }, metadata: _metadata }, _ordersByPriority_initializers, _ordersByPriority_extraInitializers);
            __esDecorate(null, null, _recentOrders_decorators, { kind: "field", name: "recentOrders", static: false, private: false, access: { has: obj => "recentOrders" in obj, get: obj => obj.recentOrders, set: (obj, value) => { obj.recentOrders = value; } }, metadata: _metadata }, _recentOrders_initializers, _recentOrders_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.OrderSummary = OrderSummary;
