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
exports.InventoryOverview = exports.InventoryItem = exports.InventoryHistory = exports.StockAdjustmentDto = exports.AdjustmentReason = exports.AdjustmentType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var AdjustmentType;
(function (AdjustmentType) {
    AdjustmentType["INCREASE"] = "increase";
    AdjustmentType["DECREASE"] = "decrease";
    AdjustmentType["SET"] = "set";
})(AdjustmentType || (exports.AdjustmentType = AdjustmentType = {}));
var AdjustmentReason;
(function (AdjustmentReason) {
    AdjustmentReason["RECEIVED_SHIPMENT"] = "received_shipment";
    AdjustmentReason["SOLD"] = "sold";
    AdjustmentReason["DAMAGED"] = "damaged";
    AdjustmentReason["EXPIRED"] = "expired";
    AdjustmentReason["THEFT"] = "theft";
    AdjustmentReason["INVENTORY_COUNT"] = "inventory_count";
    AdjustmentReason["MANUAL_ADJUSTMENT"] = "manual_adjustment";
    AdjustmentReason["TRANSFER"] = "transfer";
})(AdjustmentReason || (exports.AdjustmentReason = AdjustmentReason = {}));
let StockAdjustmentDto = (() => {
    var _a;
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    return _a = class StockAdjustmentDto {
            constructor() {
                this.quantity = __runInitializers(this, _quantity_initializers, void 0);
                this.type = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.reason = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
                this.notes = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                __runInitializers(this, _notes_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _quantity_decorators = [(0, swagger_1.ApiProperty)({ example: 50, description: 'Quantity to adjust' }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _type_decorators = [(0, swagger_1.ApiProperty)({ enum: AdjustmentType, example: AdjustmentType.INCREASE }), (0, class_validator_1.IsEnum)(AdjustmentType)];
            _reason_decorators = [(0, swagger_1.ApiProperty)({ enum: AdjustmentReason, example: AdjustmentReason.RECEIVED_SHIPMENT }), (0, class_validator_1.IsEnum)(AdjustmentReason)];
            _notes_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: 'Received new shipment from supplier' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.StockAdjustmentDto = StockAdjustmentDto;
let InventoryHistory = (() => {
    var _a;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _productName_decorators;
    let _productName_initializers = [];
    let _productName_extraInitializers = [];
    let _previousQuantity_decorators;
    let _previousQuantity_initializers = [];
    let _previousQuantity_extraInitializers = [];
    let _newQuantity_decorators;
    let _newQuantity_initializers = [];
    let _newQuantity_extraInitializers = [];
    let _adjustmentQuantity_decorators;
    let _adjustmentQuantity_initializers = [];
    let _adjustmentQuantity_extraInitializers = [];
    let _adjustmentType_decorators;
    let _adjustmentType_initializers = [];
    let _adjustmentType_extraInitializers = [];
    let _reason_decorators;
    let _reason_initializers = [];
    let _reason_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _adjustedBy_decorators;
    let _adjustedBy_initializers = [];
    let _adjustedBy_extraInitializers = [];
    let _adjustedAt_decorators;
    let _adjustedAt_initializers = [];
    let _adjustedAt_extraInitializers = [];
    return _a = class InventoryHistory {
            constructor() {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.productId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _productId_initializers, void 0));
                this.productName = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _productName_initializers, void 0));
                this.previousQuantity = (__runInitializers(this, _productName_extraInitializers), __runInitializers(this, _previousQuantity_initializers, void 0));
                this.newQuantity = (__runInitializers(this, _previousQuantity_extraInitializers), __runInitializers(this, _newQuantity_initializers, void 0));
                this.adjustmentQuantity = (__runInitializers(this, _newQuantity_extraInitializers), __runInitializers(this, _adjustmentQuantity_initializers, void 0));
                this.adjustmentType = (__runInitializers(this, _adjustmentQuantity_extraInitializers), __runInitializers(this, _adjustmentType_initializers, void 0));
                this.reason = (__runInitializers(this, _adjustmentType_extraInitializers), __runInitializers(this, _reason_initializers, void 0));
                this.notes = (__runInitializers(this, _reason_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                this.adjustedBy = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _adjustedBy_initializers, void 0)); // User ID who made the adjustment
                this.adjustedAt = (__runInitializers(this, _adjustedBy_extraInitializers), __runInitializers(this, _adjustedAt_initializers, void 0));
                __runInitializers(this, _adjustedAt_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, swagger_1.ApiProperty)()];
            _productId_decorators = [(0, swagger_1.ApiProperty)()];
            _productName_decorators = [(0, swagger_1.ApiProperty)()];
            _previousQuantity_decorators = [(0, swagger_1.ApiProperty)()];
            _newQuantity_decorators = [(0, swagger_1.ApiProperty)()];
            _adjustmentQuantity_decorators = [(0, swagger_1.ApiProperty)()];
            _adjustmentType_decorators = [(0, swagger_1.ApiProperty)({ enum: AdjustmentType })];
            _reason_decorators = [(0, swagger_1.ApiProperty)({ enum: AdjustmentReason })];
            _notes_decorators = [(0, swagger_1.ApiProperty)()];
            _adjustedBy_decorators = [(0, swagger_1.ApiProperty)()];
            _adjustedAt_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _productName_decorators, { kind: "field", name: "productName", static: false, private: false, access: { has: obj => "productName" in obj, get: obj => obj.productName, set: (obj, value) => { obj.productName = value; } }, metadata: _metadata }, _productName_initializers, _productName_extraInitializers);
            __esDecorate(null, null, _previousQuantity_decorators, { kind: "field", name: "previousQuantity", static: false, private: false, access: { has: obj => "previousQuantity" in obj, get: obj => obj.previousQuantity, set: (obj, value) => { obj.previousQuantity = value; } }, metadata: _metadata }, _previousQuantity_initializers, _previousQuantity_extraInitializers);
            __esDecorate(null, null, _newQuantity_decorators, { kind: "field", name: "newQuantity", static: false, private: false, access: { has: obj => "newQuantity" in obj, get: obj => obj.newQuantity, set: (obj, value) => { obj.newQuantity = value; } }, metadata: _metadata }, _newQuantity_initializers, _newQuantity_extraInitializers);
            __esDecorate(null, null, _adjustmentQuantity_decorators, { kind: "field", name: "adjustmentQuantity", static: false, private: false, access: { has: obj => "adjustmentQuantity" in obj, get: obj => obj.adjustmentQuantity, set: (obj, value) => { obj.adjustmentQuantity = value; } }, metadata: _metadata }, _adjustmentQuantity_initializers, _adjustmentQuantity_extraInitializers);
            __esDecorate(null, null, _adjustmentType_decorators, { kind: "field", name: "adjustmentType", static: false, private: false, access: { has: obj => "adjustmentType" in obj, get: obj => obj.adjustmentType, set: (obj, value) => { obj.adjustmentType = value; } }, metadata: _metadata }, _adjustmentType_initializers, _adjustmentType_extraInitializers);
            __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: obj => "reason" in obj, get: obj => obj.reason, set: (obj, value) => { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _adjustedBy_decorators, { kind: "field", name: "adjustedBy", static: false, private: false, access: { has: obj => "adjustedBy" in obj, get: obj => obj.adjustedBy, set: (obj, value) => { obj.adjustedBy = value; } }, metadata: _metadata }, _adjustedBy_initializers, _adjustedBy_extraInitializers);
            __esDecorate(null, null, _adjustedAt_decorators, { kind: "field", name: "adjustedAt", static: false, private: false, access: { has: obj => "adjustedAt" in obj, get: obj => obj.adjustedAt, set: (obj, value) => { obj.adjustedAt = value; } }, metadata: _metadata }, _adjustedAt_initializers, _adjustedAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.InventoryHistory = InventoryHistory;
let InventoryItem = (() => {
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
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _currentStock_decorators;
    let _currentStock_initializers = [];
    let _currentStock_extraInitializers = [];
    let _minThreshold_decorators;
    let _minThreshold_initializers = [];
    let _minThreshold_extraInitializers = [];
    let _maxCapacity_decorators;
    let _maxCapacity_initializers = [];
    let _maxCapacity_extraInitializers = [];
    let _reservedStock_decorators;
    let _reservedStock_initializers = [];
    let _reservedStock_extraInitializers = [];
    let _availableStock_decorators;
    let _availableStock_initializers = [];
    let _availableStock_extraInitializers = [];
    let _stockValue_decorators;
    let _stockValue_initializers = [];
    let _stockValue_extraInitializers = [];
    let _lastMovement_decorators;
    let _lastMovement_initializers = [];
    let _lastMovement_extraInitializers = [];
    let _stockStatus_decorators;
    let _stockStatus_initializers = [];
    let _stockStatus_extraInitializers = [];
    let _location_decorators;
    let _location_initializers = [];
    let _location_extraInitializers = [];
    let _supplier_decorators;
    let _supplier_initializers = [];
    let _supplier_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    return _a = class InventoryItem {
            constructor() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.productName = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _productName_initializers, void 0));
                this.sku = (__runInitializers(this, _productName_extraInitializers), __runInitializers(this, _sku_initializers, void 0));
                this.category = (__runInitializers(this, _sku_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.currentStock = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _currentStock_initializers, void 0));
                this.minThreshold = (__runInitializers(this, _currentStock_extraInitializers), __runInitializers(this, _minThreshold_initializers, void 0));
                this.maxCapacity = (__runInitializers(this, _minThreshold_extraInitializers), __runInitializers(this, _maxCapacity_initializers, void 0));
                this.reservedStock = (__runInitializers(this, _maxCapacity_extraInitializers), __runInitializers(this, _reservedStock_initializers, void 0));
                this.availableStock = (__runInitializers(this, _reservedStock_extraInitializers), __runInitializers(this, _availableStock_initializers, void 0));
                this.stockValue = (__runInitializers(this, _availableStock_extraInitializers), __runInitializers(this, _stockValue_initializers, void 0));
                this.lastMovement = (__runInitializers(this, _stockValue_extraInitializers), __runInitializers(this, _lastMovement_initializers, void 0));
                this.stockStatus = (__runInitializers(this, _lastMovement_extraInitializers), __runInitializers(this, _stockStatus_initializers, void 0));
                this.location = (__runInitializers(this, _stockStatus_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.supplier = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _supplier_initializers, void 0));
                this.updatedAt = (__runInitializers(this, _supplier_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
                __runInitializers(this, _updatedAt_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, swagger_1.ApiProperty)()];
            _productName_decorators = [(0, swagger_1.ApiProperty)()];
            _sku_decorators = [(0, swagger_1.ApiProperty)()];
            _category_decorators = [(0, swagger_1.ApiProperty)()];
            _currentStock_decorators = [(0, swagger_1.ApiProperty)()];
            _minThreshold_decorators = [(0, swagger_1.ApiProperty)()];
            _maxCapacity_decorators = [(0, swagger_1.ApiProperty)()];
            _reservedStock_decorators = [(0, swagger_1.ApiProperty)()];
            _availableStock_decorators = [(0, swagger_1.ApiProperty)()];
            _stockValue_decorators = [(0, swagger_1.ApiProperty)()];
            _lastMovement_decorators = [(0, swagger_1.ApiProperty)()];
            _stockStatus_decorators = [(0, swagger_1.ApiProperty)()];
            _location_decorators = [(0, swagger_1.ApiProperty)()];
            _supplier_decorators = [(0, swagger_1.ApiProperty)()];
            _updatedAt_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _productName_decorators, { kind: "field", name: "productName", static: false, private: false, access: { has: obj => "productName" in obj, get: obj => obj.productName, set: (obj, value) => { obj.productName = value; } }, metadata: _metadata }, _productName_initializers, _productName_extraInitializers);
            __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: obj => "sku" in obj, get: obj => obj.sku, set: (obj, value) => { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _currentStock_decorators, { kind: "field", name: "currentStock", static: false, private: false, access: { has: obj => "currentStock" in obj, get: obj => obj.currentStock, set: (obj, value) => { obj.currentStock = value; } }, metadata: _metadata }, _currentStock_initializers, _currentStock_extraInitializers);
            __esDecorate(null, null, _minThreshold_decorators, { kind: "field", name: "minThreshold", static: false, private: false, access: { has: obj => "minThreshold" in obj, get: obj => obj.minThreshold, set: (obj, value) => { obj.minThreshold = value; } }, metadata: _metadata }, _minThreshold_initializers, _minThreshold_extraInitializers);
            __esDecorate(null, null, _maxCapacity_decorators, { kind: "field", name: "maxCapacity", static: false, private: false, access: { has: obj => "maxCapacity" in obj, get: obj => obj.maxCapacity, set: (obj, value) => { obj.maxCapacity = value; } }, metadata: _metadata }, _maxCapacity_initializers, _maxCapacity_extraInitializers);
            __esDecorate(null, null, _reservedStock_decorators, { kind: "field", name: "reservedStock", static: false, private: false, access: { has: obj => "reservedStock" in obj, get: obj => obj.reservedStock, set: (obj, value) => { obj.reservedStock = value; } }, metadata: _metadata }, _reservedStock_initializers, _reservedStock_extraInitializers);
            __esDecorate(null, null, _availableStock_decorators, { kind: "field", name: "availableStock", static: false, private: false, access: { has: obj => "availableStock" in obj, get: obj => obj.availableStock, set: (obj, value) => { obj.availableStock = value; } }, metadata: _metadata }, _availableStock_initializers, _availableStock_extraInitializers);
            __esDecorate(null, null, _stockValue_decorators, { kind: "field", name: "stockValue", static: false, private: false, access: { has: obj => "stockValue" in obj, get: obj => obj.stockValue, set: (obj, value) => { obj.stockValue = value; } }, metadata: _metadata }, _stockValue_initializers, _stockValue_extraInitializers);
            __esDecorate(null, null, _lastMovement_decorators, { kind: "field", name: "lastMovement", static: false, private: false, access: { has: obj => "lastMovement" in obj, get: obj => obj.lastMovement, set: (obj, value) => { obj.lastMovement = value; } }, metadata: _metadata }, _lastMovement_initializers, _lastMovement_extraInitializers);
            __esDecorate(null, null, _stockStatus_decorators, { kind: "field", name: "stockStatus", static: false, private: false, access: { has: obj => "stockStatus" in obj, get: obj => obj.stockStatus, set: (obj, value) => { obj.stockStatus = value; } }, metadata: _metadata }, _stockStatus_initializers, _stockStatus_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: obj => "location" in obj, get: obj => obj.location, set: (obj, value) => { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _supplier_decorators, { kind: "field", name: "supplier", static: false, private: false, access: { has: obj => "supplier" in obj, get: obj => obj.supplier, set: (obj, value) => { obj.supplier = value; } }, metadata: _metadata }, _supplier_initializers, _supplier_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.InventoryItem = InventoryItem;
let InventoryOverview = (() => {
    var _a;
    let _totalProducts_decorators;
    let _totalProducts_initializers = [];
    let _totalProducts_extraInitializers = [];
    let _totalStockValue_decorators;
    let _totalStockValue_initializers = [];
    let _totalStockValue_extraInitializers = [];
    let _lowStockProducts_decorators;
    let _lowStockProducts_initializers = [];
    let _lowStockProducts_extraInitializers = [];
    let _outOfStockProducts_decorators;
    let _outOfStockProducts_initializers = [];
    let _outOfStockProducts_extraInitializers = [];
    let _overstockedProducts_decorators;
    let _overstockedProducts_initializers = [];
    let _overstockedProducts_extraInitializers = [];
    let _recentMovements_decorators;
    let _recentMovements_initializers = [];
    let _recentMovements_extraInitializers = [];
    let _categoryBreakdown_decorators;
    let _categoryBreakdown_initializers = [];
    let _categoryBreakdown_extraInitializers = [];
    let _locationBreakdown_decorators;
    let _locationBreakdown_initializers = [];
    let _locationBreakdown_extraInitializers = [];
    return _a = class InventoryOverview {
            constructor() {
                this.totalProducts = __runInitializers(this, _totalProducts_initializers, void 0);
                this.totalStockValue = (__runInitializers(this, _totalProducts_extraInitializers), __runInitializers(this, _totalStockValue_initializers, void 0));
                this.lowStockProducts = (__runInitializers(this, _totalStockValue_extraInitializers), __runInitializers(this, _lowStockProducts_initializers, void 0));
                this.outOfStockProducts = (__runInitializers(this, _lowStockProducts_extraInitializers), __runInitializers(this, _outOfStockProducts_initializers, void 0));
                this.overstockedProducts = (__runInitializers(this, _outOfStockProducts_extraInitializers), __runInitializers(this, _overstockedProducts_initializers, void 0));
                this.recentMovements = (__runInitializers(this, _overstockedProducts_extraInitializers), __runInitializers(this, _recentMovements_initializers, void 0));
                this.categoryBreakdown = (__runInitializers(this, _recentMovements_extraInitializers), __runInitializers(this, _categoryBreakdown_initializers, void 0));
                this.locationBreakdown = (__runInitializers(this, _categoryBreakdown_extraInitializers), __runInitializers(this, _locationBreakdown_initializers, void 0));
                __runInitializers(this, _locationBreakdown_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _totalProducts_decorators = [(0, swagger_1.ApiProperty)()];
            _totalStockValue_decorators = [(0, swagger_1.ApiProperty)()];
            _lowStockProducts_decorators = [(0, swagger_1.ApiProperty)()];
            _outOfStockProducts_decorators = [(0, swagger_1.ApiProperty)()];
            _overstockedProducts_decorators = [(0, swagger_1.ApiProperty)()];
            _recentMovements_decorators = [(0, swagger_1.ApiProperty)()];
            _categoryBreakdown_decorators = [(0, swagger_1.ApiProperty)()];
            _locationBreakdown_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _totalProducts_decorators, { kind: "field", name: "totalProducts", static: false, private: false, access: { has: obj => "totalProducts" in obj, get: obj => obj.totalProducts, set: (obj, value) => { obj.totalProducts = value; } }, metadata: _metadata }, _totalProducts_initializers, _totalProducts_extraInitializers);
            __esDecorate(null, null, _totalStockValue_decorators, { kind: "field", name: "totalStockValue", static: false, private: false, access: { has: obj => "totalStockValue" in obj, get: obj => obj.totalStockValue, set: (obj, value) => { obj.totalStockValue = value; } }, metadata: _metadata }, _totalStockValue_initializers, _totalStockValue_extraInitializers);
            __esDecorate(null, null, _lowStockProducts_decorators, { kind: "field", name: "lowStockProducts", static: false, private: false, access: { has: obj => "lowStockProducts" in obj, get: obj => obj.lowStockProducts, set: (obj, value) => { obj.lowStockProducts = value; } }, metadata: _metadata }, _lowStockProducts_initializers, _lowStockProducts_extraInitializers);
            __esDecorate(null, null, _outOfStockProducts_decorators, { kind: "field", name: "outOfStockProducts", static: false, private: false, access: { has: obj => "outOfStockProducts" in obj, get: obj => obj.outOfStockProducts, set: (obj, value) => { obj.outOfStockProducts = value; } }, metadata: _metadata }, _outOfStockProducts_initializers, _outOfStockProducts_extraInitializers);
            __esDecorate(null, null, _overstockedProducts_decorators, { kind: "field", name: "overstockedProducts", static: false, private: false, access: { has: obj => "overstockedProducts" in obj, get: obj => obj.overstockedProducts, set: (obj, value) => { obj.overstockedProducts = value; } }, metadata: _metadata }, _overstockedProducts_initializers, _overstockedProducts_extraInitializers);
            __esDecorate(null, null, _recentMovements_decorators, { kind: "field", name: "recentMovements", static: false, private: false, access: { has: obj => "recentMovements" in obj, get: obj => obj.recentMovements, set: (obj, value) => { obj.recentMovements = value; } }, metadata: _metadata }, _recentMovements_initializers, _recentMovements_extraInitializers);
            __esDecorate(null, null, _categoryBreakdown_decorators, { kind: "field", name: "categoryBreakdown", static: false, private: false, access: { has: obj => "categoryBreakdown" in obj, get: obj => obj.categoryBreakdown, set: (obj, value) => { obj.categoryBreakdown = value; } }, metadata: _metadata }, _categoryBreakdown_initializers, _categoryBreakdown_extraInitializers);
            __esDecorate(null, null, _locationBreakdown_decorators, { kind: "field", name: "locationBreakdown", static: false, private: false, access: { has: obj => "locationBreakdown" in obj, get: obj => obj.locationBreakdown, set: (obj, value) => { obj.locationBreakdown = value; } }, metadata: _metadata }, _locationBreakdown_initializers, _locationBreakdown_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.InventoryOverview = InventoryOverview;
