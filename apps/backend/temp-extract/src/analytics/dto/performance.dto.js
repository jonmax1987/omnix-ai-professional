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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceResponseDto = exports.PerformanceMetricsDto = exports.CoreWebVitalsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CoreWebVitalsDto {
}
exports.CoreWebVitalsDto = CoreWebVitalsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Largest Contentful Paint in milliseconds',
        example: 2500,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoreWebVitalsDto.prototype, "lcp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'First Input Delay in milliseconds',
        example: 100,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoreWebVitalsDto.prototype, "fid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cumulative Layout Shift score',
        example: 0.1,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoreWebVitalsDto.prototype, "cls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'First Contentful Paint in milliseconds',
        example: 1800,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoreWebVitalsDto.prototype, "fcp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Time to Interactive in milliseconds',
        example: 3200,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoreWebVitalsDto.prototype, "tti", void 0);
class PerformanceMetricsDto {
}
exports.PerformanceMetricsDto = PerformanceMetricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Core Web Vitals metrics',
        type: CoreWebVitalsDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CoreWebVitalsDto),
    __metadata("design:type", CoreWebVitalsDto)
], PerformanceMetricsDto.prototype, "metrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when metrics were collected',
        example: '2024-01-20T15:30:00.000Z',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceMetricsDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User ID if available',
        example: 'user_123',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceMetricsDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Session ID for grouping metrics',
        example: 'session_abc123',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceMetricsDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page URL where metrics were collected',
        example: '/dashboard',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceMetricsDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User agent information',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceMetricsDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PerformanceMetricsDto.prototype, "metadata", void 0);
class PerformanceResponseDto {
}
exports.PerformanceResponseDto = PerformanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the operation was successful',
        example: true,
    }),
    __metadata("design:type", Boolean)
], PerformanceResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'Performance metrics recorded successfully',
    }),
    __metadata("design:type", String)
], PerformanceResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp of the response',
        example: '2024-01-20T15:30:00.000Z',
    }),
    __metadata("design:type", String)
], PerformanceResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Unique ID for the recorded metrics',
        example: 'metrics_1705756200000_abc123def',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PerformanceResponseDto.prototype, "metricsId", void 0);
//# sourceMappingURL=performance.dto.js.map