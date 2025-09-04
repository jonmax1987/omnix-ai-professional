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
exports.SystemMetrics = exports.SystemStatus = exports.HealthCheck = void 0;
const swagger_1 = require("@nestjs/swagger");
let HealthCheck = (() => {
    var _a;
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _timestamp_decorators;
    let _timestamp_initializers = [];
    let _timestamp_extraInitializers = [];
    let _checks_decorators;
    let _checks_initializers = [];
    let _checks_extraInitializers = [];
    let _uptime_decorators;
    let _uptime_initializers = [];
    let _uptime_extraInitializers = [];
    let _version_decorators;
    let _version_initializers = [];
    let _version_extraInitializers = [];
    let _environment_decorators;
    let _environment_initializers = [];
    let _environment_extraInitializers = [];
    return _a = class HealthCheck {
            constructor() {
                this.status = __runInitializers(this, _status_initializers, void 0);
                this.timestamp = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _timestamp_initializers, void 0));
                this.checks = (__runInitializers(this, _timestamp_extraInitializers), __runInitializers(this, _checks_initializers, void 0));
                this.uptime = (__runInitializers(this, _checks_extraInitializers), __runInitializers(this, _uptime_initializers, void 0)); // seconds
                this.version = (__runInitializers(this, _uptime_extraInitializers), __runInitializers(this, _version_initializers, void 0));
                this.environment = (__runInitializers(this, _version_extraInitializers), __runInitializers(this, _environment_initializers, void 0));
                __runInitializers(this, _environment_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, swagger_1.ApiProperty)({ example: 'healthy' })];
            _timestamp_decorators = [(0, swagger_1.ApiProperty)()];
            _checks_decorators = [(0, swagger_1.ApiProperty)()];
            _uptime_decorators = [(0, swagger_1.ApiProperty)()];
            _version_decorators = [(0, swagger_1.ApiProperty)()];
            _environment_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: obj => "timestamp" in obj, get: obj => obj.timestamp, set: (obj, value) => { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            __esDecorate(null, null, _checks_decorators, { kind: "field", name: "checks", static: false, private: false, access: { has: obj => "checks" in obj, get: obj => obj.checks, set: (obj, value) => { obj.checks = value; } }, metadata: _metadata }, _checks_initializers, _checks_extraInitializers);
            __esDecorate(null, null, _uptime_decorators, { kind: "field", name: "uptime", static: false, private: false, access: { has: obj => "uptime" in obj, get: obj => obj.uptime, set: (obj, value) => { obj.uptime = value; } }, metadata: _metadata }, _uptime_initializers, _uptime_extraInitializers);
            __esDecorate(null, null, _version_decorators, { kind: "field", name: "version", static: false, private: false, access: { has: obj => "version" in obj, get: obj => obj.version, set: (obj, value) => { obj.version = value; } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
            __esDecorate(null, null, _environment_decorators, { kind: "field", name: "environment", static: false, private: false, access: { has: obj => "environment" in obj, get: obj => obj.environment, set: (obj, value) => { obj.environment = value; } }, metadata: _metadata }, _environment_initializers, _environment_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.HealthCheck = HealthCheck;
let SystemStatus = (() => {
    var _a;
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _timestamp_decorators;
    let _timestamp_initializers = [];
    let _timestamp_extraInitializers = [];
    let _services_decorators;
    let _services_initializers = [];
    let _services_extraInitializers = [];
    let _performance_decorators;
    let _performance_initializers = [];
    let _performance_extraInitializers = [];
    let _incidents_decorators;
    let _incidents_initializers = [];
    let _incidents_extraInitializers = [];
    return _a = class SystemStatus {
            constructor() {
                this.status = __runInitializers(this, _status_initializers, void 0);
                this.timestamp = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _timestamp_initializers, void 0));
                this.services = (__runInitializers(this, _timestamp_extraInitializers), __runInitializers(this, _services_initializers, void 0));
                this.performance = (__runInitializers(this, _services_extraInitializers), __runInitializers(this, _performance_initializers, void 0));
                this.incidents = (__runInitializers(this, _performance_extraInitializers), __runInitializers(this, _incidents_initializers, void 0));
                __runInitializers(this, _incidents_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _status_decorators = [(0, swagger_1.ApiProperty)()];
            _timestamp_decorators = [(0, swagger_1.ApiProperty)()];
            _services_decorators = [(0, swagger_1.ApiProperty)()];
            _performance_decorators = [(0, swagger_1.ApiProperty)()];
            _incidents_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: obj => "timestamp" in obj, get: obj => obj.timestamp, set: (obj, value) => { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            __esDecorate(null, null, _services_decorators, { kind: "field", name: "services", static: false, private: false, access: { has: obj => "services" in obj, get: obj => obj.services, set: (obj, value) => { obj.services = value; } }, metadata: _metadata }, _services_initializers, _services_extraInitializers);
            __esDecorate(null, null, _performance_decorators, { kind: "field", name: "performance", static: false, private: false, access: { has: obj => "performance" in obj, get: obj => obj.performance, set: (obj, value) => { obj.performance = value; } }, metadata: _metadata }, _performance_initializers, _performance_extraInitializers);
            __esDecorate(null, null, _incidents_decorators, { kind: "field", name: "incidents", static: false, private: false, access: { has: obj => "incidents" in obj, get: obj => obj.incidents, set: (obj, value) => { obj.incidents = value; } }, metadata: _metadata }, _incidents_initializers, _incidents_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.SystemStatus = SystemStatus;
let SystemMetrics = (() => {
    var _a;
    let _timestamp_decorators;
    let _timestamp_initializers = [];
    let _timestamp_extraInitializers = [];
    let _api_decorators;
    let _api_initializers = [];
    let _api_extraInitializers = [];
    let _database_decorators;
    let _database_initializers = [];
    let _database_extraInitializers = [];
    let _system_decorators;
    let _system_initializers = [];
    let _system_extraInitializers = [];
    let _application_decorators;
    let _application_initializers = [];
    let _application_extraInitializers = [];
    return _a = class SystemMetrics {
            constructor() {
                this.timestamp = __runInitializers(this, _timestamp_initializers, void 0);
                this.api = (__runInitializers(this, _timestamp_extraInitializers), __runInitializers(this, _api_initializers, void 0));
                this.database = (__runInitializers(this, _api_extraInitializers), __runInitializers(this, _database_initializers, void 0));
                this.system = (__runInitializers(this, _database_extraInitializers), __runInitializers(this, _system_initializers, void 0));
                this.application = (__runInitializers(this, _system_extraInitializers), __runInitializers(this, _application_initializers, void 0));
                __runInitializers(this, _application_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _timestamp_decorators = [(0, swagger_1.ApiProperty)()];
            _api_decorators = [(0, swagger_1.ApiProperty)()];
            _database_decorators = [(0, swagger_1.ApiProperty)()];
            _system_decorators = [(0, swagger_1.ApiProperty)()];
            _application_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: obj => "timestamp" in obj, get: obj => obj.timestamp, set: (obj, value) => { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            __esDecorate(null, null, _api_decorators, { kind: "field", name: "api", static: false, private: false, access: { has: obj => "api" in obj, get: obj => obj.api, set: (obj, value) => { obj.api = value; } }, metadata: _metadata }, _api_initializers, _api_extraInitializers);
            __esDecorate(null, null, _database_decorators, { kind: "field", name: "database", static: false, private: false, access: { has: obj => "database" in obj, get: obj => obj.database, set: (obj, value) => { obj.database = value; } }, metadata: _metadata }, _database_initializers, _database_extraInitializers);
            __esDecorate(null, null, _system_decorators, { kind: "field", name: "system", static: false, private: false, access: { has: obj => "system" in obj, get: obj => obj.system, set: (obj, value) => { obj.system = value; } }, metadata: _metadata }, _system_initializers, _system_extraInitializers);
            __esDecorate(null, null, _application_decorators, { kind: "field", name: "application", static: false, private: false, access: { has: obj => "application" in obj, get: obj => obj.application, set: (obj, value) => { obj.application = value; } }, metadata: _metadata }, _application_initializers, _application_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.SystemMetrics = SystemMetrics;
