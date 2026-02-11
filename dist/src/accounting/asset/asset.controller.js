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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const common_1 = require("@nestjs/common");
const asset_service_1 = require("./asset.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AssetController = class AssetController {
    assetService;
    constructor(assetService) {
        this.assetService = assetService;
    }
    create(user, createAssetDto) {
        return this.assetService.create(createAssetDto, user.id);
    }
    generateCode(date) {
        if (!date) {
            throw new common_1.BadRequestException('Date is required');
        }
        return this.assetService.generateAssetCode(date);
    }
    findAll(page = 1, limit = 10) {
        return this.assetService.findAll(+page, +limit);
    }
    findOne(id) {
        return this.assetService.findOne(+id);
    }
    update(id, updateAssetDto) {
        return this.assetService.update(+id, updateAssetDto);
    }
    remove(id) {
        return this.assetService.remove(+id);
    }
    runDepreciation(user, dateStr) {
        const userId = user.id;
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.assetService.runDepreciationProcess(userId, date);
    }
    calculateDepreciation(id, dateStr) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.assetService.calculateMonthlyDepreciation(+id, date);
    }
    payAssetPurchase(id, user, body) {
        return this.assetService.payAssetPurchase({
            assetId: +id,
            paymentAccountId: body.paymentAccountId,
            amount: body.amount,
            date: body.date ? new Date(body.date) : undefined,
            userId: user.id,
        });
    }
    disposeAsset(id, user, body) {
        return this.assetService.disposeAsset({
            assetId: +id,
            saleAmount: body.saleAmount,
            paymentAccountId: body.paymentAccountId,
            gainLossAccountId: body.gainLossAccountId,
            date: body.date ? new Date(body.date) : undefined,
            userId: user.id,
        });
    }
};
exports.AssetController = AssetController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('generate-code'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "generateCode", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('run-depreciation'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "runDepreciation", null);
__decorate([
    (0, common_1.Get)(':id/calculate-depreciation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "calculateDepreciation", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "payAssetPurchase", null);
__decorate([
    (0, common_1.Post)(':id/dispose'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AssetController.prototype, "disposeAsset", null);
exports.AssetController = AssetController = __decorate([
    (0, common_1.Controller)('api/accounting/assets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [asset_service_1.AssetService])
], AssetController);
//# sourceMappingURL=asset.controller.js.map