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
exports.MobileController = void 0;
const common_1 = require("@nestjs/common");
const mobile_service_1 = require("./mobile.service");
const mobile_jwt_auth_guard_1 = require("../mobile-auth/guards/mobile-jwt-auth.guard");
let MobileController = class MobileController {
    mobileService;
    constructor(mobileService) {
        this.mobileService = mobileService;
    }
    getProfile(req) {
        return this.mobileService.getProfileAndBalance(req.user.nasabahId);
    }
    getWithdrawals(req) {
        return this.mobileService.getWithdrawals(req.user.nasabahId);
    }
    createWithdrawal(req, body) {
        return this.mobileService.createWithdrawal(req.user.nasabahId, body);
    }
    getWithdrawal(req, id) {
        return this.mobileService.getWithdrawal(req.user.nasabahId, +id);
    }
    getTransactions(req) {
        return this.mobileService.getTransactions(req.user.nasabahId);
    }
};
exports.MobileController = MobileController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('withdrawals'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "getWithdrawals", null);
__decorate([
    (0, common_1.Post)('withdrawals'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "createWithdrawal", null);
__decorate([
    (0, common_1.Get)('withdrawals/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "getWithdrawal", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MobileController.prototype, "getTransactions", null);
exports.MobileController = MobileController = __decorate([
    (0, common_1.UseGuards)(mobile_jwt_auth_guard_1.MobileJwtAuthGuard),
    (0, common_1.Controller)('api/mobile'),
    __metadata("design:paramtypes", [mobile_service_1.MobileService])
], MobileController);
//# sourceMappingURL=mobile.controller.js.map