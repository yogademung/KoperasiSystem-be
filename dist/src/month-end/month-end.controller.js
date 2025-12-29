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
exports.MonthEndController = void 0;
const common_1 = require("@nestjs/common");
const period_lock_service_1 = require("./period-lock.service");
const depreciation_service_1 = require("./depreciation.service");
const balance_sheet_service_1 = require("./balance-sheet.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const lov_value_service_1 = require("./lov-value.service");
let MonthEndController = class MonthEndController {
    periodLockService;
    depreciationService;
    balanceSheetService;
    lovValueService;
    constructor(periodLockService, depreciationService, balanceSheetService, lovValueService) {
        this.periodLockService = periodLockService;
        this.depreciationService = depreciationService;
        this.balanceSheetService = balanceSheetService;
        this.lovValueService = lovValueService;
    }
    async checkLockStatus(period) {
        const isLocked = await this.periodLockService.isPeriodLocked(period);
        return { period, isLocked };
    }
    async closePeriod(body, req) {
        const userId = 1;
        return this.periodLockService.closePeriod(body.period, userId);
    }
    async requestUnlock(body, req) {
        const userId = 1;
        return this.periodLockService.requestUnlock(body.period, userId, body.reason);
    }
    async approveUnlock(body, req) {
        const managerId = 1;
        return this.periodLockService.approveUnlock(body.requestId, managerId, body.notes);
    }
    async adminForceUnlock(body, req) {
        const adminId = 1;
        return this.periodLockService.adminForceUnlock(body.period, adminId, body.reason);
    }
    async previewDepreciation(period) {
        return this.depreciationService.calculateMonthlyDepreciation(period);
    }
    async postDepreciation(body, req) {
        const userId = 1;
        return this.depreciationService.postMonthlyDepreciation(body.period, userId);
    }
    async validateBalance(period) {
        return this.balanceSheetService.validateBalance(period);
    }
    async getLastClosedPeriod() {
        const period = await this.lovValueService.getLastClosingMonth();
        return { period };
    }
};
exports.MonthEndController = MonthEndController;
__decorate([
    (0, common_1.Get)('lock/:period'),
    __param(0, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonthEndController.prototype, "checkLockStatus", null);
__decorate([
    (0, common_1.Post)('close'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MonthEndController.prototype, "closePeriod", null);
__decorate([
    (0, common_1.Post)('unlock-request'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MonthEndController.prototype, "requestUnlock", null);
__decorate([
    (0, common_1.Post)('approve-unlock'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MonthEndController.prototype, "approveUnlock", null);
__decorate([
    (0, common_1.Post)('admin/force-unlock'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MonthEndController.prototype, "adminForceUnlock", null);
__decorate([
    (0, common_1.Get)('depreciation/preview/:period'),
    __param(0, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonthEndController.prototype, "previewDepreciation", null);
__decorate([
    (0, common_1.Post)('depreciation/post'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MonthEndController.prototype, "postDepreciation", null);
__decorate([
    (0, common_1.Get)('validate-balance/:period'),
    __param(0, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonthEndController.prototype, "validateBalance", null);
__decorate([
    (0, common_1.Get)('last-closed-period'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonthEndController.prototype, "getLastClosedPeriod", null);
exports.MonthEndController = MonthEndController = __decorate([
    (0, common_1.Controller)('month-end'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [period_lock_service_1.PeriodLockService,
        depreciation_service_1.DepreciationService,
        balance_sheet_service_1.BalanceSheetService,
        lov_value_service_1.LovValueService])
], MonthEndController);
//# sourceMappingURL=month-end.controller.js.map