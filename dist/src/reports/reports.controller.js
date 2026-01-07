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
    async getCollectorKPI(startDate, endDate) {
        return this.reportsService.getCollectorKPI(startDate ? new Date(startDate) : new Date(), endDate ? new Date(endDate) : new Date());
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
    async getAnggotaReceipt(id) {
        return this.reportsService.getAnggotaReceiptData(id);
    }
    async getTabrelaReceipt(id) {
        return this.reportsService.getTabrelaReceiptData(id);
    }
    async getBrahmacariReceipt(id) {
        return this.reportsService.getBrahmacariReceiptData(id);
    }
    async getBalimesariReceipt(id) {
        return this.reportsService.getBalimesariReceiptData(id);
    }
    async getWanasprastaReceipt(id) {
        return this.reportsService.getWanasprastaReceiptData(id);
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
    async getBukuBesar(accountCode, toAccount, startDate, endDate) {
        return this.reportsService.getBukuBesar(accountCode, toAccount, startDate, endDate);
    }
    async getBukuBesarPDF(accountCode, toAccount, startDate, endDate) {
        return this.reportsService.generateBukuBesarPDF(accountCode, toAccount, startDate, endDate);
    }
    async getAccountsList() {
        return this.reportsService.getAccountsList();
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('collector/kpi'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCollectorKPI", null);
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
    (0, common_1.Get)('savings/ANGGOTA/:id/receipt'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAnggotaReceipt", null);
__decorate([
    (0, common_1.Get)('savings/TABRELA/:id/receipt'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getTabrelaReceipt", null);
__decorate([
    (0, common_1.Get)('savings/BRAHMACARI/:id/receipt'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getBrahmacariReceipt", null);
__decorate([
    (0, common_1.Get)('savings/BALIMESARI/:id/receipt'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getBalimesariReceipt", null);
__decorate([
    (0, common_1.Get)('savings/WANAPRASTA/:id/receipt'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWanasprastaReceipt", null);
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
__decorate([
    (0, common_1.Get)('accounting/buku-besar'),
    __param(0, (0, common_1.Query)('accountCode')),
    __param(1, (0, common_1.Query)('toAccount')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getBukuBesar", null);
__decorate([
    (0, common_1.Get)('accounting/buku-besar/pdf'),
    __param(0, (0, common_1.Query)('accountCode')),
    __param(1, (0, common_1.Query)('toAccount')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getBukuBesarPDF", null);
__decorate([
    (0, common_1.Get)('accounting/accounts-list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAccountsList", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('api/reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        asset_service_1.AssetService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map