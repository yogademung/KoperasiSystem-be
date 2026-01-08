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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductConfigController = void 0;
const common_1 = require("@nestjs/common");
const product_config_service_1 = require("./product-config.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
let ProductConfigController = class ProductConfigController {
    productConfigService;
    constructor(productConfigService) {
        this.productConfigService = productConfigService;
    }
    getAllProducts() {
        return this.productConfigService.getAllProducts();
    }
    getEnabledProducts() {
        return this.productConfigService.getEnabledProducts();
    }
    getProductByCode(code) {
        return this.productConfigService.getProductByCode(code);
    }
    hasExistingAccounts(code) {
        return this.productConfigService.hasExistingAccounts(code);
    }
    toggleProduct(code) {
        return this.productConfigService.toggleProduct(code);
    }
    updateProduct(code, data) {
        return this.productConfigService.updateProduct(code, data);
    }
    reorderProducts(body) {
        return this.productConfigService.reorderProducts(body.order);
    }
};
exports.ProductConfigController = ProductConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductConfigController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.Get)('enabled'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductConfigController.prototype, "getEnabledProducts", null);
__decorate([
    (0, common_1.Get)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductConfigController.prototype, "getProductByCode", null);
__decorate([
    (0, common_1.Get)(':code/accounts'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductConfigController.prototype, "hasExistingAccounts", null);
__decorate([
    (0, common_1.Patch)(':code/toggle'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductConfigController.prototype, "toggleProduct", null);
__decorate([
    (0, common_1.Put)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof client_1.Prisma !== "undefined" && client_1.Prisma.ProductConfigUpdateInput) === "function" ? _a : Object]),
    __metadata("design:returntype", void 0)
], ProductConfigController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Post)('reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductConfigController.prototype, "reorderProducts", null);
exports.ProductConfigController = ProductConfigController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/settings/products'),
    __metadata("design:paramtypes", [product_config_service_1.ProductConfigService])
], ProductConfigController);
//# sourceMappingURL=product-config.controller.js.map