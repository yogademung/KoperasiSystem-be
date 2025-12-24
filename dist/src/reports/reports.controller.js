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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const asset_service_1 = require("../accounting/asset/asset.service");
let ReportsController = class ReportsController {
    reportsService;
    assetService;
    constructor(reportsService, assetService) {
        this.reportsService = reportsService;
        this.assetService = assetService;
    }
    async getBalanceSheet(date) {
        return this.assetService.getBalanceSheet(date ? new Date(date) : new Date());
    }
    async getAssetMutations(startDate, endDate) {
        return this.assetService.getAssetMutations(startDate ? new Date(startDate) : new Date(), endDate ? new Date(endDate) : new Date());
    }
    async getCreditApplication(id) {
        return this.reportsService.getCreditApplicationData(Number(id));
    }
    async getCreditAgreement(id) {
        return this.reportsService.getCreditAgreementData(Number(id));
    }
    async getCreditStatement(id) {
        return this.reportsService.getCreditStatementData(Number(id));
    }
    async getDepositoCertificate(id) {
        return this.reportsService.getDepositoCertificateData(id);
    }
    async getDepositoClosure(id) {
        return this.reportsService.getDepositoClosureData(id);
    }
    async getSavingsPassbook(type, id) {
        return this.reportsService.getSavingsPassbookData(type, id);
    }
    async getAnggotaRegistration(id) {
        return this.reportsService.getAnggotaRegistrationData(id);
    }
    async getAnggotaClosure(id) {
        return this.reportsService.getAnggotaClosureData(id);
    }
    async getTabrelaClosure(id) {
        return this.reportsService.getTabrelaClosureData(id);
    }
    async getBrahmacariClosure(id) {
        return this.reportsService.getBrahmacariClosureData(id);
    }
    async getBalimesariClosure(id) {
        return this.reportsService.getBalimesariClosureData(id);
    }
    async getWanaprastaClosure(id) {
        return this.reportsService.getWanaprastaClosureData(id);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('assets/balance-sheet'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getBalanceSheet", null);
__decorate([
    (0, common_1.Get)('assets/mutations'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAssetMutations", null);
__decorate([
    (0, common_1.Get)('credit/:id/application'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCreditApplication", null);
__decorate([
    (0, common_1.Get)('credit/:id/agreement'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCreditAgreement", null);
__decorate([
    (0, common_1.Get)('credit/:id/statement'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCreditStatement", null);
__decorate([
    (0, common_1.Get)('deposito/:id/certificate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDepositoCertificate", null);
__decorate([
    (0, common_1.Get)('deposito/:id/closure'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDepositoClosure", null);
__decorate([
    (0, common_1.Get)('savings/:type/:id/passbook'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getSavingsPassbook", null);
__decorate([
    (0, common_1.Get)('savings/ANGGOTA/:id/registration'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAnggotaRegistration", null);
__decorate([
    (0, common_1.Get)('savings/ANGGOTA/:id/closure'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAnggotaClosure", null);
__decorate([
    (0, common_1.Get)('savings/TABRELA/:id/closure'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getTabrelaClosure", null);
__decorate([
    (0, common_1.Get)('savings/BRAHMACARI/:id/closure'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getBrahmacariClosure", null);
__decorate([
    (0, common_1.Get)('savings/BALIMESARI/:id/closure'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getBalimesariClosure", null);
__decorate([
    (0, common_1.Get)('savings/WANAPRASTA/:id/closure'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWanaprastaClosure", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('api/reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        asset_service_1.AssetService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map