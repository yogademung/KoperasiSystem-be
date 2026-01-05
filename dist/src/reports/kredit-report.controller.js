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
exports.KreditReportController = void 0;
const common_1 = require("@nestjs/common");
const kredit_report_service_1 = require("./kredit-report.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let KreditReportController = class KreditReportController {
    kreditReportService;
    constructor(kreditReportService) {
        this.kreditReportService = kreditReportService;
    }
    async getKolektibilitas(period) {
        return this.kreditReportService.getKolektibilitas(period);
    }
    async downloadKolektibilitasPDF(period, res) {
        const pdf = await this.kreditReportService.generateKolektibilitasPDF(period);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Kolektibilitas_${period}.pdf`);
        res.send(pdf);
    }
    async getDaftarKredit(status) {
        return this.kreditReportService.getDaftarKredit(status);
    }
    async downloadDaftarKreditExcel(status, res) {
        const excel = await this.kreditReportService.generateDaftarKreditExcel(status);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Daftar_Kredit_${status || 'ALL'}.xlsx`);
        res.send(excel);
    }
    async getTunggakan(asOf) {
        return this.kreditReportService.getTunggakan(asOf);
    }
    async downloadTunggakanPDF(asOf, res) {
        const pdf = await this.kreditReportService.generateTunggakanPDF(asOf);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Tunggakan_${asOf}.pdf`);
        res.send(pdf);
    }
};
exports.KreditReportController = KreditReportController;
__decorate([
    (0, common_1.Get)('kolektibilitas'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KreditReportController.prototype, "getKolektibilitas", null);
__decorate([
    (0, common_1.Get)('kolektibilitas/pdf'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KreditReportController.prototype, "downloadKolektibilitasPDF", null);
__decorate([
    (0, common_1.Get)('daftar'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KreditReportController.prototype, "getDaftarKredit", null);
__decorate([
    (0, common_1.Get)('daftar/excel'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KreditReportController.prototype, "downloadDaftarKreditExcel", null);
__decorate([
    (0, common_1.Get)('tunggakan'),
    __param(0, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KreditReportController.prototype, "getTunggakan", null);
__decorate([
    (0, common_1.Get)('tunggakan/pdf'),
    __param(0, (0, common_1.Query)('asOf')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KreditReportController.prototype, "downloadTunggakanPDF", null);
exports.KreditReportController = KreditReportController = __decorate([
    (0, common_1.Controller)('api/reports/kredit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [kredit_report_service_1.KreditReportService])
], KreditReportController);
//# sourceMappingURL=kredit-report.controller.js.map