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
exports.PerformanceResponseDto = exports.PerformanceMetricsDto = exports.CoreWebVitalsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
let CoreWebVitalsDto = (() => {
    var _a;
    let _lcp_decorators;
    let _lcp_initializers = [];
    let _lcp_extraInitializers = [];
    let _fid_decorators;
    let _fid_initializers = [];
    let _fid_extraInitializers = [];
    let _cls_decorators;
    let _cls_initializers = [];
    let _cls_extraInitializers = [];
    let _fcp_decorators;
    let _fcp_initializers = [];
    let _fcp_extraInitializers = [];
    let _tti_decorators;
    let _tti_initializers = [];
    let _tti_extraInitializers = [];
    return _a = class CoreWebVitalsDto {
            constructor() {
                this.lcp = __runInitializers(this, _lcp_initializers, void 0);
                this.fid = (__runInitializers(this, _lcp_extraInitializers), __runInitializers(this, _fid_initializers, void 0));
                this.cls = (__runInitializers(this, _fid_extraInitializers), __runInitializers(this, _cls_initializers, void 0));
                this.fcp = (__runInitializers(this, _cls_extraInitializers), __runInitializers(this, _fcp_initializers, void 0));
                this.tti = (__runInitializers(this, _fcp_extraInitializers), __runInitializers(this, _tti_initializers, void 0));
                __runInitializers(this, _tti_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _lcp_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Largest Contentful Paint in milliseconds',
                    example: 2500,
                }), (0, class_validator_1.IsNumber)()];
            _fid_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'First Input Delay in milliseconds',
                    example: 100,
                }), (0, class_validator_1.IsNumber)()];
            _cls_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Cumulative Layout Shift score',
                    example: 0.1,
                }), (0, class_validator_1.IsNumber)()];
            _fcp_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'First Contentful Paint in milliseconds',
                    example: 1800,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            _tti_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Time to Interactive in milliseconds',
                    example: 3200,
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)()];
            __esDecorate(null, null, _lcp_decorators, { kind: "field", name: "lcp", static: false, private: false, access: { has: obj => "lcp" in obj, get: obj => obj.lcp, set: (obj, value) => { obj.lcp = value; } }, metadata: _metadata }, _lcp_initializers, _lcp_extraInitializers);
            __esDecorate(null, null, _fid_decorators, { kind: "field", name: "fid", static: false, private: false, access: { has: obj => "fid" in obj, get: obj => obj.fid, set: (obj, value) => { obj.fid = value; } }, metadata: _metadata }, _fid_initializers, _fid_extraInitializers);
            __esDecorate(null, null, _cls_decorators, { kind: "field", name: "cls", static: false, private: false, access: { has: obj => "cls" in obj, get: obj => obj.cls, set: (obj, value) => { obj.cls = value; } }, metadata: _metadata }, _cls_initializers, _cls_extraInitializers);
            __esDecorate(null, null, _fcp_decorators, { kind: "field", name: "fcp", static: false, private: false, access: { has: obj => "fcp" in obj, get: obj => obj.fcp, set: (obj, value) => { obj.fcp = value; } }, metadata: _metadata }, _fcp_initializers, _fcp_extraInitializers);
            __esDecorate(null, null, _tti_decorators, { kind: "field", name: "tti", static: false, private: false, access: { has: obj => "tti" in obj, get: obj => obj.tti, set: (obj, value) => { obj.tti = value; } }, metadata: _metadata }, _tti_initializers, _tti_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CoreWebVitalsDto = CoreWebVitalsDto;
let PerformanceMetricsDto = (() => {
    var _a;
    let _metrics_decorators;
    let _metrics_initializers = [];
    let _metrics_extraInitializers = [];
    let _timestamp_decorators;
    let _timestamp_initializers = [];
    let _timestamp_extraInitializers = [];
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _sessionId_decorators;
    let _sessionId_initializers = [];
    let _sessionId_extraInitializers = [];
    let _url_decorators;
    let _url_initializers = [];
    let _url_extraInitializers = [];
    let _userAgent_decorators;
    let _userAgent_initializers = [];
    let _userAgent_extraInitializers = [];
    let _metadata_decorators;
    let _metadata_initializers = [];
    let _metadata_extraInitializers = [];
    return _a = class PerformanceMetricsDto {
            constructor() {
                this.metrics = __runInitializers(this, _metrics_initializers, void 0);
                this.timestamp = (__runInitializers(this, _metrics_extraInitializers), __runInitializers(this, _timestamp_initializers, void 0));
                this.userId = (__runInitializers(this, _timestamp_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
                this.sessionId = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _sessionId_initializers, void 0));
                this.url = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _url_initializers, void 0));
                this.userAgent = (__runInitializers(this, _url_extraInitializers), __runInitializers(this, _userAgent_initializers, void 0));
                this.metadata = (__runInitializers(this, _userAgent_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
                __runInitializers(this, _metadata_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _metrics_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Core Web Vitals metrics',
                    type: CoreWebVitalsDto,
                }), (0, class_validator_1.ValidateNested)(), (0, class_transformer_1.Type)(() => CoreWebVitalsDto)];
            _timestamp_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Timestamp when metrics were collected',
                    example: '2024-01-20T15:30:00.000Z',
                }), (0, class_validator_1.IsString)()];
            _userId_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'User ID if available',
                    example: 'user_123',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _sessionId_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Session ID for grouping metrics',
                    example: 'session_abc123',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _url_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Page URL where metrics were collected',
                    example: '/dashboard',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _userAgent_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'User agent information',
                    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _metadata_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Additional metadata',
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)()];
            __esDecorate(null, null, _metrics_decorators, { kind: "field", name: "metrics", static: false, private: false, access: { has: obj => "metrics" in obj, get: obj => obj.metrics, set: (obj, value) => { obj.metrics = value; } }, metadata: _metadata }, _metrics_initializers, _metrics_extraInitializers);
            __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: obj => "timestamp" in obj, get: obj => obj.timestamp, set: (obj, value) => { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: obj => "sessionId" in obj, get: obj => obj.sessionId, set: (obj, value) => { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
            __esDecorate(null, null, _url_decorators, { kind: "field", name: "url", static: false, private: false, access: { has: obj => "url" in obj, get: obj => obj.url, set: (obj, value) => { obj.url = value; } }, metadata: _metadata }, _url_initializers, _url_extraInitializers);
            __esDecorate(null, null, _userAgent_decorators, { kind: "field", name: "userAgent", static: false, private: false, access: { has: obj => "userAgent" in obj, get: obj => obj.userAgent, set: (obj, value) => { obj.userAgent = value; } }, metadata: _metadata }, _userAgent_initializers, _userAgent_extraInitializers);
            __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: obj => "metadata" in obj, get: obj => obj.metadata, set: (obj, value) => { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.PerformanceMetricsDto = PerformanceMetricsDto;
let PerformanceResponseDto = (() => {
    var _a;
    let _success_decorators;
    let _success_initializers = [];
    let _success_extraInitializers = [];
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    let _timestamp_decorators;
    let _timestamp_initializers = [];
    let _timestamp_extraInitializers = [];
    let _metricsId_decorators;
    let _metricsId_initializers = [];
    let _metricsId_extraInitializers = [];
    return _a = class PerformanceResponseDto {
            constructor() {
                this.success = __runInitializers(this, _success_initializers, void 0);
                this.message = (__runInitializers(this, _success_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.timestamp = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _timestamp_initializers, void 0));
                this.metricsId = (__runInitializers(this, _timestamp_extraInitializers), __runInitializers(this, _metricsId_initializers, void 0));
                __runInitializers(this, _metricsId_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _success_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Whether the operation was successful',
                    example: true,
                })];
            _message_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Response message',
                    example: 'Performance metrics recorded successfully',
                })];
            _timestamp_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Timestamp of the response',
                    example: '2024-01-20T15:30:00.000Z',
                })];
            _metricsId_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: 'Unique ID for the recorded metrics',
                    example: 'metrics_1705756200000_abc123def',
                }), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _success_decorators, { kind: "field", name: "success", static: false, private: false, access: { has: obj => "success" in obj, get: obj => obj.success, set: (obj, value) => { obj.success = value; } }, metadata: _metadata }, _success_initializers, _success_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: obj => "timestamp" in obj, get: obj => obj.timestamp, set: (obj, value) => { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            __esDecorate(null, null, _metricsId_decorators, { kind: "field", name: "metricsId", static: false, private: false, access: { has: obj => "metricsId" in obj, get: obj => obj.metricsId, set: (obj, value) => { obj.metricsId = value; } }, metadata: _metadata }, _metricsId_initializers, _metricsId_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.PerformanceResponseDto = PerformanceResponseDto;
