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
exports.ImportPurchaseHistoryDto = exports.CreateProductInteractionDto = exports.ProductInteractionDto = exports.CreatePurchaseHistoryDto = exports.PurchaseHistoryDto = exports.UpdateCustomerProfileDto = exports.CreateCustomerProfileDto = exports.CustomerProfileDto = exports.ShoppingPatternsDto = exports.CustomerPreferencesDto = exports.BudgetRangeDto = exports.CustomerDemographicsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
let CustomerDemographicsDto = (() => {
    var _a;
    let _age_decorators;
    let _age_initializers = [];
    let _age_extraInitializers = [];
    let _gender_decorators;
    let _gender_initializers = [];
    let _gender_extraInitializers = [];
    let _location_decorators;
    let _location_initializers = [];
    let _location_extraInitializers = [];
    let _familySize_decorators;
    let _familySize_initializers = [];
    let _familySize_extraInitializers = [];
    return _a = class CustomerDemographicsDto {
            constructor() {
                this.age = __runInitializers(this, _age_initializers, void 0);
                this.gender = (__runInitializers(this, _age_extraInitializers), __runInitializers(this, _gender_initializers, void 0));
                this.location = (__runInitializers(this, _gender_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.familySize = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _familySize_initializers, void 0));
                __runInitializers(this, _familySize_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _age_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(18), (0, class_validator_1.Max)(120)];
            _gender_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _location_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _familySize_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(20)];
            __esDecorate(null, null, _age_decorators, { kind: "field", name: "age", static: false, private: false, access: { has: obj => "age" in obj, get: obj => obj.age, set: (obj, value) => { obj.age = value; } }, metadata: _metadata }, _age_initializers, _age_extraInitializers);
            __esDecorate(null, null, _gender_decorators, { kind: "field", name: "gender", static: false, private: false, access: { has: obj => "gender" in obj, get: obj => obj.gender, set: (obj, value) => { obj.gender = value; } }, metadata: _metadata }, _gender_initializers, _gender_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: obj => "location" in obj, get: obj => obj.location, set: (obj, value) => { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _familySize_decorators, { kind: "field", name: "familySize", static: false, private: false, access: { has: obj => "familySize" in obj, get: obj => obj.familySize, set: (obj, value) => { obj.familySize = value; } }, metadata: _metadata }, _familySize_initializers, _familySize_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CustomerDemographicsDto = CustomerDemographicsDto;
let BudgetRangeDto = (() => {
    var _a;
    let _min_decorators;
    let _min_initializers = [];
    let _min_extraInitializers = [];
    let _max_decorators;
    let _max_initializers = [];
    let _max_extraInitializers = [];
    return _a = class BudgetRangeDto {
            constructor() {
                this.min = __runInitializers(this, _min_initializers, void 0);
                this.max = (__runInitializers(this, _min_extraInitializers), __runInitializers(this, _max_initializers, void 0));
                __runInitializers(this, _max_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _min_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _max_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _min_decorators, { kind: "field", name: "min", static: false, private: false, access: { has: obj => "min" in obj, get: obj => obj.min, set: (obj, value) => { obj.min = value; } }, metadata: _metadata }, _min_initializers, _min_extraInitializers);
            __esDecorate(null, null, _max_decorators, { kind: "field", name: "max", static: false, private: false, access: { has: obj => "max" in obj, get: obj => obj.max, set: (obj, value) => { obj.max = value; } }, metadata: _metadata }, _max_initializers, _max_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.BudgetRangeDto = BudgetRangeDto;
let CustomerPreferencesDto = (() => {
    var _a;
    let _dietaryRestrictions_decorators;
    let _dietaryRestrictions_initializers = [];
    let _dietaryRestrictions_extraInitializers = [];
    let _favoriteCategories_decorators;
    let _favoriteCategories_initializers = [];
    let _favoriteCategories_extraInitializers = [];
    let _budgetRange_decorators;
    let _budgetRange_initializers = [];
    let _budgetRange_extraInitializers = [];
    let _brandPreferences_decorators;
    let _brandPreferences_initializers = [];
    let _brandPreferences_extraInitializers = [];
    return _a = class CustomerPreferencesDto {
            constructor() {
                this.dietaryRestrictions = __runInitializers(this, _dietaryRestrictions_initializers, void 0);
                this.favoriteCategories = (__runInitializers(this, _dietaryRestrictions_extraInitializers), __runInitializers(this, _favoriteCategories_initializers, void 0));
                this.budgetRange = (__runInitializers(this, _favoriteCategories_extraInitializers), __runInitializers(this, _budgetRange_initializers, void 0));
                this.brandPreferences = (__runInitializers(this, _budgetRange_extraInitializers), __runInitializers(this, _brandPreferences_initializers, void 0));
                __runInitializers(this, _brandPreferences_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _dietaryRestrictions_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _favoriteCategories_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _budgetRange_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => BudgetRangeDto)];
            _brandPreferences_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _dietaryRestrictions_decorators, { kind: "field", name: "dietaryRestrictions", static: false, private: false, access: { has: obj => "dietaryRestrictions" in obj, get: obj => obj.dietaryRestrictions, set: (obj, value) => { obj.dietaryRestrictions = value; } }, metadata: _metadata }, _dietaryRestrictions_initializers, _dietaryRestrictions_extraInitializers);
            __esDecorate(null, null, _favoriteCategories_decorators, { kind: "field", name: "favoriteCategories", static: false, private: false, access: { has: obj => "favoriteCategories" in obj, get: obj => obj.favoriteCategories, set: (obj, value) => { obj.favoriteCategories = value; } }, metadata: _metadata }, _favoriteCategories_initializers, _favoriteCategories_extraInitializers);
            __esDecorate(null, null, _budgetRange_decorators, { kind: "field", name: "budgetRange", static: false, private: false, access: { has: obj => "budgetRange" in obj, get: obj => obj.budgetRange, set: (obj, value) => { obj.budgetRange = value; } }, metadata: _metadata }, _budgetRange_initializers, _budgetRange_extraInitializers);
            __esDecorate(null, null, _brandPreferences_decorators, { kind: "field", name: "brandPreferences", static: false, private: false, access: { has: obj => "brandPreferences" in obj, get: obj => obj.brandPreferences, set: (obj, value) => { obj.brandPreferences = value; } }, metadata: _metadata }, _brandPreferences_initializers, _brandPreferences_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CustomerPreferencesDto = CustomerPreferencesDto;
let ShoppingPatternsDto = (() => {
    var _a;
    let _preferredShoppingTimes_decorators;
    let _preferredShoppingTimes_initializers = [];
    let _preferredShoppingTimes_extraInitializers = [];
    let _averageOrderValue_decorators;
    let _averageOrderValue_initializers = [];
    let _averageOrderValue_extraInitializers = [];
    let _shoppingFrequency_decorators;
    let _shoppingFrequency_initializers = [];
    let _shoppingFrequency_extraInitializers = [];
    let _seasonalPatterns_decorators;
    let _seasonalPatterns_initializers = [];
    let _seasonalPatterns_extraInitializers = [];
    return _a = class ShoppingPatternsDto {
            constructor() {
                this.preferredShoppingTimes = __runInitializers(this, _preferredShoppingTimes_initializers, void 0);
                this.averageOrderValue = (__runInitializers(this, _preferredShoppingTimes_extraInitializers), __runInitializers(this, _averageOrderValue_initializers, void 0));
                this.shoppingFrequency = (__runInitializers(this, _averageOrderValue_extraInitializers), __runInitializers(this, _shoppingFrequency_initializers, void 0));
                this.seasonalPatterns = (__runInitializers(this, _shoppingFrequency_extraInitializers), __runInitializers(this, _seasonalPatterns_initializers, void 0));
                __runInitializers(this, _seasonalPatterns_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _preferredShoppingTimes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _averageOrderValue_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _shoppingFrequency_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsEnum)(['daily', 'weekly', 'biweekly', 'monthly', 'occasional'])];
            _seasonalPatterns_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _preferredShoppingTimes_decorators, { kind: "field", name: "preferredShoppingTimes", static: false, private: false, access: { has: obj => "preferredShoppingTimes" in obj, get: obj => obj.preferredShoppingTimes, set: (obj, value) => { obj.preferredShoppingTimes = value; } }, metadata: _metadata }, _preferredShoppingTimes_initializers, _preferredShoppingTimes_extraInitializers);
            __esDecorate(null, null, _averageOrderValue_decorators, { kind: "field", name: "averageOrderValue", static: false, private: false, access: { has: obj => "averageOrderValue" in obj, get: obj => obj.averageOrderValue, set: (obj, value) => { obj.averageOrderValue = value; } }, metadata: _metadata }, _averageOrderValue_initializers, _averageOrderValue_extraInitializers);
            __esDecorate(null, null, _shoppingFrequency_decorators, { kind: "field", name: "shoppingFrequency", static: false, private: false, access: { has: obj => "shoppingFrequency" in obj, get: obj => obj.shoppingFrequency, set: (obj, value) => { obj.shoppingFrequency = value; } }, metadata: _metadata }, _shoppingFrequency_initializers, _shoppingFrequency_extraInitializers);
            __esDecorate(null, null, _seasonalPatterns_decorators, { kind: "field", name: "seasonalPatterns", static: false, private: false, access: { has: obj => "seasonalPatterns" in obj, get: obj => obj.seasonalPatterns, set: (obj, value) => { obj.seasonalPatterns = value; } }, metadata: _metadata }, _seasonalPatterns_initializers, _seasonalPatterns_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.ShoppingPatternsDto = ShoppingPatternsDto;
let CustomerProfileDto = (() => {
    var _a;
    let _customerId_decorators;
    let _customerId_initializers = [];
    let _customerId_extraInitializers = [];
    let _demographics_decorators;
    let _demographics_initializers = [];
    let _demographics_extraInitializers = [];
    let _preferences_decorators;
    let _preferences_initializers = [];
    let _preferences_extraInitializers = [];
    let _shoppingPatterns_decorators;
    let _shoppingPatterns_initializers = [];
    let _shoppingPatterns_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    return _a = class CustomerProfileDto {
            constructor() {
                this.customerId = __runInitializers(this, _customerId_initializers, void 0);
                this.demographics = (__runInitializers(this, _customerId_extraInitializers), __runInitializers(this, _demographics_initializers, void 0));
                this.preferences = (__runInitializers(this, _demographics_extraInitializers), __runInitializers(this, _preferences_initializers, void 0));
                this.shoppingPatterns = (__runInitializers(this, _preferences_extraInitializers), __runInitializers(this, _shoppingPatterns_initializers, void 0));
                this.createdAt = (__runInitializers(this, _shoppingPatterns_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
                this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
                __runInitializers(this, _updatedAt_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _customerId_decorators = [(0, class_validator_1.IsString)()];
            _demographics_decorators = [(0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => CustomerDemographicsDto)];
            _preferences_decorators = [(0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => CustomerPreferencesDto)];
            _shoppingPatterns_decorators = [(0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => ShoppingPatternsDto)];
            _createdAt_decorators = [(0, class_validator_1.IsString)()];
            _updatedAt_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _customerId_decorators, { kind: "field", name: "customerId", static: false, private: false, access: { has: obj => "customerId" in obj, get: obj => obj.customerId, set: (obj, value) => { obj.customerId = value; } }, metadata: _metadata }, _customerId_initializers, _customerId_extraInitializers);
            __esDecorate(null, null, _demographics_decorators, { kind: "field", name: "demographics", static: false, private: false, access: { has: obj => "demographics" in obj, get: obj => obj.demographics, set: (obj, value) => { obj.demographics = value; } }, metadata: _metadata }, _demographics_initializers, _demographics_extraInitializers);
            __esDecorate(null, null, _preferences_decorators, { kind: "field", name: "preferences", static: false, private: false, access: { has: obj => "preferences" in obj, get: obj => obj.preferences, set: (obj, value) => { obj.preferences = value; } }, metadata: _metadata }, _preferences_initializers, _preferences_extraInitializers);
            __esDecorate(null, null, _shoppingPatterns_decorators, { kind: "field", name: "shoppingPatterns", static: false, private: false, access: { has: obj => "shoppingPatterns" in obj, get: obj => obj.shoppingPatterns, set: (obj, value) => { obj.shoppingPatterns = value; } }, metadata: _metadata }, _shoppingPatterns_initializers, _shoppingPatterns_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CustomerProfileDto = CustomerProfileDto;
let CreateCustomerProfileDto = (() => {
    var _a;
    let _customerId_decorators;
    let _customerId_initializers = [];
    let _customerId_extraInitializers = [];
    let _demographics_decorators;
    let _demographics_initializers = [];
    let _demographics_extraInitializers = [];
    let _preferences_decorators;
    let _preferences_initializers = [];
    let _preferences_extraInitializers = [];
    let _shoppingPatterns_decorators;
    let _shoppingPatterns_initializers = [];
    let _shoppingPatterns_extraInitializers = [];
    return _a = class CreateCustomerProfileDto {
            constructor() {
                this.customerId = __runInitializers(this, _customerId_initializers, void 0);
                this.demographics = (__runInitializers(this, _customerId_extraInitializers), __runInitializers(this, _demographics_initializers, void 0));
                this.preferences = (__runInitializers(this, _demographics_extraInitializers), __runInitializers(this, _preferences_initializers, void 0));
                this.shoppingPatterns = (__runInitializers(this, _preferences_extraInitializers), __runInitializers(this, _shoppingPatterns_initializers, void 0));
                __runInitializers(this, _shoppingPatterns_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _customerId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _demographics_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => CustomerDemographicsDto)];
            _preferences_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => CustomerPreferencesDto)];
            _shoppingPatterns_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => ShoppingPatternsDto)];
            __esDecorate(null, null, _customerId_decorators, { kind: "field", name: "customerId", static: false, private: false, access: { has: obj => "customerId" in obj, get: obj => obj.customerId, set: (obj, value) => { obj.customerId = value; } }, metadata: _metadata }, _customerId_initializers, _customerId_extraInitializers);
            __esDecorate(null, null, _demographics_decorators, { kind: "field", name: "demographics", static: false, private: false, access: { has: obj => "demographics" in obj, get: obj => obj.demographics, set: (obj, value) => { obj.demographics = value; } }, metadata: _metadata }, _demographics_initializers, _demographics_extraInitializers);
            __esDecorate(null, null, _preferences_decorators, { kind: "field", name: "preferences", static: false, private: false, access: { has: obj => "preferences" in obj, get: obj => obj.preferences, set: (obj, value) => { obj.preferences = value; } }, metadata: _metadata }, _preferences_initializers, _preferences_extraInitializers);
            __esDecorate(null, null, _shoppingPatterns_decorators, { kind: "field", name: "shoppingPatterns", static: false, private: false, access: { has: obj => "shoppingPatterns" in obj, get: obj => obj.shoppingPatterns, set: (obj, value) => { obj.shoppingPatterns = value; } }, metadata: _metadata }, _shoppingPatterns_initializers, _shoppingPatterns_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateCustomerProfileDto = CreateCustomerProfileDto;
let UpdateCustomerProfileDto = (() => {
    var _a;
    let _demographics_decorators;
    let _demographics_initializers = [];
    let _demographics_extraInitializers = [];
    let _preferences_decorators;
    let _preferences_initializers = [];
    let _preferences_extraInitializers = [];
    let _shoppingPatterns_decorators;
    let _shoppingPatterns_initializers = [];
    let _shoppingPatterns_extraInitializers = [];
    return _a = class UpdateCustomerProfileDto {
            constructor() {
                this.demographics = __runInitializers(this, _demographics_initializers, void 0);
                this.preferences = (__runInitializers(this, _demographics_extraInitializers), __runInitializers(this, _preferences_initializers, void 0));
                this.shoppingPatterns = (__runInitializers(this, _preferences_extraInitializers), __runInitializers(this, _shoppingPatterns_initializers, void 0));
                __runInitializers(this, _shoppingPatterns_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _demographics_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => CustomerDemographicsDto)];
            _preferences_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => CustomerPreferencesDto)];
            _shoppingPatterns_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => ShoppingPatternsDto)];
            __esDecorate(null, null, _demographics_decorators, { kind: "field", name: "demographics", static: false, private: false, access: { has: obj => "demographics" in obj, get: obj => obj.demographics, set: (obj, value) => { obj.demographics = value; } }, metadata: _metadata }, _demographics_initializers, _demographics_extraInitializers);
            __esDecorate(null, null, _preferences_decorators, { kind: "field", name: "preferences", static: false, private: false, access: { has: obj => "preferences" in obj, get: obj => obj.preferences, set: (obj, value) => { obj.preferences = value; } }, metadata: _metadata }, _preferences_initializers, _preferences_extraInitializers);
            __esDecorate(null, null, _shoppingPatterns_decorators, { kind: "field", name: "shoppingPatterns", static: false, private: false, access: { has: obj => "shoppingPatterns" in obj, get: obj => obj.shoppingPatterns, set: (obj, value) => { obj.shoppingPatterns = value; } }, metadata: _metadata }, _shoppingPatterns_initializers, _shoppingPatterns_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.UpdateCustomerProfileDto = UpdateCustomerProfileDto;
let PurchaseHistoryDto = (() => {
    var _a;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _customerId_decorators;
    let _customerId_initializers = [];
    let _customerId_extraInitializers = [];
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _quantity_decorators;
    let _quantity_initializers = [];
    let _quantity_extraInitializers = [];
    let _unitPrice_decorators;
    let _unitPrice_initializers = [];
    let _unitPrice_extraInitializers = [];
    let _totalPrice_decorators;
    let _totalPrice_initializers = [];
    let _totalPrice_extraInitializers = [];
    let _purchaseDate_decorators;
    let _purchaseDate_initializers = [];
    let _purchaseDate_extraInitializers = [];
    let _storeLocation_decorators;
    let _storeLocation_initializers = [];
    let _storeLocation_extraInitializers = [];
    let _promotionUsed_decorators;
    let _promotionUsed_initializers = [];
    let _promotionUsed_extraInitializers = [];
    let _rating_decorators;
    let _rating_initializers = [];
    let _rating_extraInitializers = [];
    let _review_decorators;
    let _review_initializers = [];
    let _review_extraInitializers = [];
    return _a = class PurchaseHistoryDto {
            constructor() {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.customerId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _customerId_initializers, void 0));
                this.productId = (__runInitializers(this, _customerId_extraInitializers), __runInitializers(this, _productId_initializers, void 0));
                this.quantity = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.unitPrice = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
                this.totalPrice = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _totalPrice_initializers, void 0));
                this.purchaseDate = (__runInitializers(this, _totalPrice_extraInitializers), __runInitializers(this, _purchaseDate_initializers, void 0));
                this.storeLocation = (__runInitializers(this, _purchaseDate_extraInitializers), __runInitializers(this, _storeLocation_initializers, void 0));
                this.promotionUsed = (__runInitializers(this, _storeLocation_extraInitializers), __runInitializers(this, _promotionUsed_initializers, void 0));
                this.rating = (__runInitializers(this, _promotionUsed_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
                this.review = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _review_initializers, void 0));
                __runInitializers(this, _review_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, class_validator_1.IsString)()];
            _customerId_decorators = [(0, class_validator_1.IsString)()];
            _productId_decorators = [(0, class_validator_1.IsString)()];
            _quantity_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _unitPrice_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _totalPrice_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _purchaseDate_decorators = [(0, class_validator_1.IsString)()];
            _storeLocation_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _promotionUsed_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _rating_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(5)];
            _review_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _customerId_decorators, { kind: "field", name: "customerId", static: false, private: false, access: { has: obj => "customerId" in obj, get: obj => obj.customerId, set: (obj, value) => { obj.customerId = value; } }, metadata: _metadata }, _customerId_initializers, _customerId_extraInitializers);
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
            __esDecorate(null, null, _totalPrice_decorators, { kind: "field", name: "totalPrice", static: false, private: false, access: { has: obj => "totalPrice" in obj, get: obj => obj.totalPrice, set: (obj, value) => { obj.totalPrice = value; } }, metadata: _metadata }, _totalPrice_initializers, _totalPrice_extraInitializers);
            __esDecorate(null, null, _purchaseDate_decorators, { kind: "field", name: "purchaseDate", static: false, private: false, access: { has: obj => "purchaseDate" in obj, get: obj => obj.purchaseDate, set: (obj, value) => { obj.purchaseDate = value; } }, metadata: _metadata }, _purchaseDate_initializers, _purchaseDate_extraInitializers);
            __esDecorate(null, null, _storeLocation_decorators, { kind: "field", name: "storeLocation", static: false, private: false, access: { has: obj => "storeLocation" in obj, get: obj => obj.storeLocation, set: (obj, value) => { obj.storeLocation = value; } }, metadata: _metadata }, _storeLocation_initializers, _storeLocation_extraInitializers);
            __esDecorate(null, null, _promotionUsed_decorators, { kind: "field", name: "promotionUsed", static: false, private: false, access: { has: obj => "promotionUsed" in obj, get: obj => obj.promotionUsed, set: (obj, value) => { obj.promotionUsed = value; } }, metadata: _metadata }, _promotionUsed_initializers, _promotionUsed_extraInitializers);
            __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: obj => "rating" in obj, get: obj => obj.rating, set: (obj, value) => { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
            __esDecorate(null, null, _review_decorators, { kind: "field", name: "review", static: false, private: false, access: { has: obj => "review" in obj, get: obj => obj.review, set: (obj, value) => { obj.review = value; } }, metadata: _metadata }, _review_initializers, _review_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.PurchaseHistoryDto = PurchaseHistoryDto;
let CreatePurchaseHistoryDto = (() => {
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
    let _totalPrice_decorators;
    let _totalPrice_initializers = [];
    let _totalPrice_extraInitializers = [];
    let _storeLocation_decorators;
    let _storeLocation_initializers = [];
    let _storeLocation_extraInitializers = [];
    let _promotionUsed_decorators;
    let _promotionUsed_initializers = [];
    let _promotionUsed_extraInitializers = [];
    let _rating_decorators;
    let _rating_initializers = [];
    let _rating_extraInitializers = [];
    let _review_decorators;
    let _review_initializers = [];
    let _review_extraInitializers = [];
    return _a = class CreatePurchaseHistoryDto {
            constructor() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.quantity = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.unitPrice = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unitPrice_initializers, void 0));
                this.totalPrice = (__runInitializers(this, _unitPrice_extraInitializers), __runInitializers(this, _totalPrice_initializers, void 0));
                this.storeLocation = (__runInitializers(this, _totalPrice_extraInitializers), __runInitializers(this, _storeLocation_initializers, void 0));
                this.promotionUsed = (__runInitializers(this, _storeLocation_extraInitializers), __runInitializers(this, _promotionUsed_initializers, void 0));
                this.rating = (__runInitializers(this, _promotionUsed_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
                this.review = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _review_initializers, void 0));
                __runInitializers(this, _review_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, class_validator_1.IsString)()];
            _quantity_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _unitPrice_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _totalPrice_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _storeLocation_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _promotionUsed_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _rating_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(5)];
            _review_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: obj => "quantity" in obj, get: obj => obj.quantity, set: (obj, value) => { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: obj => "unitPrice" in obj, get: obj => obj.unitPrice, set: (obj, value) => { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
            __esDecorate(null, null, _totalPrice_decorators, { kind: "field", name: "totalPrice", static: false, private: false, access: { has: obj => "totalPrice" in obj, get: obj => obj.totalPrice, set: (obj, value) => { obj.totalPrice = value; } }, metadata: _metadata }, _totalPrice_initializers, _totalPrice_extraInitializers);
            __esDecorate(null, null, _storeLocation_decorators, { kind: "field", name: "storeLocation", static: false, private: false, access: { has: obj => "storeLocation" in obj, get: obj => obj.storeLocation, set: (obj, value) => { obj.storeLocation = value; } }, metadata: _metadata }, _storeLocation_initializers, _storeLocation_extraInitializers);
            __esDecorate(null, null, _promotionUsed_decorators, { kind: "field", name: "promotionUsed", static: false, private: false, access: { has: obj => "promotionUsed" in obj, get: obj => obj.promotionUsed, set: (obj, value) => { obj.promotionUsed = value; } }, metadata: _metadata }, _promotionUsed_initializers, _promotionUsed_extraInitializers);
            __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: obj => "rating" in obj, get: obj => obj.rating, set: (obj, value) => { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
            __esDecorate(null, null, _review_decorators, { kind: "field", name: "review", static: false, private: false, access: { has: obj => "review" in obj, get: obj => obj.review, set: (obj, value) => { obj.review = value; } }, metadata: _metadata }, _review_initializers, _review_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreatePurchaseHistoryDto = CreatePurchaseHistoryDto;
let ProductInteractionDto = (() => {
    var _a;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _customerId_decorators;
    let _customerId_initializers = [];
    let _customerId_extraInitializers = [];
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _interactionType_decorators;
    let _interactionType_initializers = [];
    let _interactionType_extraInitializers = [];
    let _timestamp_decorators;
    let _timestamp_initializers = [];
    let _timestamp_extraInitializers = [];
    let _sessionId_decorators;
    let _sessionId_initializers = [];
    let _sessionId_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    return _a = class ProductInteractionDto {
            constructor() {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.customerId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _customerId_initializers, void 0));
                this.productId = (__runInitializers(this, _customerId_extraInitializers), __runInitializers(this, _productId_initializers, void 0));
                this.interactionType = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _interactionType_initializers, void 0));
                this.timestamp = (__runInitializers(this, _interactionType_extraInitializers), __runInitializers(this, _timestamp_initializers, void 0));
                this.sessionId = (__runInitializers(this, _timestamp_extraInitializers), __runInitializers(this, _sessionId_initializers, void 0));
                this.metadata = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
                __runInitializers(this, _metadata_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, class_validator_1.IsString)()];
            _customerId_decorators = [(0, class_validator_1.IsString)()];
            _productId_decorators = [(0, class_validator_1.IsString)()];
            _interactionType_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsEnum)(['view', 'add_to_cart', 'remove_from_cart', 'wishlist', 'search'])];
            _timestamp_decorators = [(0, class_validator_1.IsString)()];
            _sessionId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _metadata_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _customerId_decorators, { kind: "field", name: "customerId", static: false, private: false, access: { has: obj => "customerId" in obj, get: obj => obj.customerId, set: (obj, value) => { obj.customerId = value; } }, metadata: _metadata }, _customerId_initializers, _customerId_extraInitializers);
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _interactionType_decorators, { kind: "field", name: "interactionType", static: false, private: false, access: { has: obj => "interactionType" in obj, get: obj => obj.interactionType, set: (obj, value) => { obj.interactionType = value; } }, metadata: _metadata }, _interactionType_initializers, _interactionType_extraInitializers);
            __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: obj => "timestamp" in obj, get: obj => obj.timestamp, set: (obj, value) => { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: obj => "sessionId" in obj, get: obj => obj.sessionId, set: (obj, value) => { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
            __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.ProductInteractionDto = ProductInteractionDto;
let CreateProductInteractionDto = (() => {
    var _a;
    let _productId_decorators;
    let _productId_initializers = [];
    let _productId_extraInitializers = [];
    let _interactionType_decorators;
    let _interactionType_initializers = [];
    let _interactionType_extraInitializers = [];
    let _sessionId_decorators;
    let _sessionId_initializers = [];
    let _sessionId_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    return _a = class CreateProductInteractionDto {
            constructor() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.interactionType = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _interactionType_initializers, void 0));
                this.sessionId = (__runInitializers(this, _interactionType_extraInitializers), __runInitializers(this, _sessionId_initializers, void 0));
                this.metadata = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
                __runInitializers(this, _metadata_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, class_validator_1.IsString)()];
            _interactionType_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsEnum)(['view', 'add_to_cart', 'remove_from_cart', 'wishlist', 'search'])];
            _sessionId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _metadata_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: obj => "productId" in obj, get: obj => obj.productId, set: (obj, value) => { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _interactionType_decorators, { kind: "field", name: "interactionType", static: false, private: false, access: { has: obj => "interactionType" in obj, get: obj => obj.interactionType, set: (obj, value) => { obj.interactionType = value; } }, metadata: _metadata }, _interactionType_initializers, _interactionType_extraInitializers);
            __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: obj => "sessionId" in obj, get: obj => obj.sessionId, set: (obj, value) => { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
            __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateProductInteractionDto = CreateProductInteractionDto;
let ImportPurchaseHistoryDto = (() => {
    var _a;
    let _purchases_decorators;
    let _purchases_initializers = [];
    let _purchases_extraInitializers = [];
    return _a = class ImportPurchaseHistoryDto {
            constructor() {
                this.purchases = __runInitializers(this, _purchases_initializers, void 0);
                __runInitializers(this, _purchases_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _purchases_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(() => CreatePurchaseHistoryDto)];
            __esDecorate(null, null, _purchases_decorators, { kind: "field", name: "purchases", static: false, private: false, access: { has: obj => "purchases" in obj, get: obj => obj.purchases, set: (obj, value) => { obj.purchases = value; } }, metadata: _metadata }, _purchases_initializers, _purchases_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.ImportPurchaseHistoryDto = ImportPurchaseHistoryDto;
