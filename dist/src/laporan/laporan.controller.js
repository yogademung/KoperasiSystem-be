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
exports.LaporanController = void 0;
const common_1 = require("@nestjs/common");
const laporan_service_1 = require("./laporan.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let LaporanController = class LaporanController {
    laporanService;
    constructor(laporanService) {
        this.laporanService = laporanService;
    }
    async simpananRekap(params, res) {
        const buffer = await this.laporanService.generateSimpananRekap({
            ...params,
            startDate: new Date(params.startDate),
            endDate: new Date(params.endDate)
        });
        const filename = `simpanan-rekap-${Date.now()}.${params.format === 'PDF' ? 'pdf' : 'xlsx'}`;
        const contentType = params.format === 'PDF'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length
        });
        res.send(buffer);
    }
    async tabrelaRekap(params, res) {
        await this.handleReport(res, params, 'xlsx', () => this.laporanService.generateTabrelaRekap(this.parseDates(params)));
    }
    async brahmacariRekap(params, res) {
        await this.handleReport(res, params, 'xlsx', () => this.laporanService.generateBrahmacariRekap(this.parseDates(params)));
    }
    async balimesariRekap(params, res) {
        await this.handleReport(res, params, 'xlsx', () => this.laporanService.generateBalimesariRekap(this.parseDates(params)));
    }
    async wanaprastaRekap(params, res) {
        await this.handleReport(res, params, 'xlsx', () => this.laporanService.generateWanaprastaRekap(this.parseDates(params)));
    }
    async depositoRekap(params, res) {
        await this.handleReport(res, params, 'xlsx', () => this.laporanService.generateDepositoRekap(this.parseDates(params)));
    }
    async mutasiSimpanan(params, res) {
        await this.handleReport(res, params, 'xlsx', () => this.laporanService.generateMutasiSimpanan(this.parseDates(params)));
    }
    async daftarRekening(params, res) {
        await this.handleReport(res, params, 'xlsx', () => this.laporanService.generateDaftarRekening(params));
    }
    async neraca(params, res) {
        await this.handleReport(res, params, 'pdf', () => this.laporanService.generateNeraca({
            date: new Date(params.endDate || params.date),
            format: params.format,
            businessUnitId: params.businessUnitId ? Number(params.businessUnitId) : undefined
        }));
    }
    async labaRugi(params, res) {
        await this.handleReport(res, params, 'pdf', () => this.laporanService.generateLabaRugi({
            ...this.parseDates(params),
            businessUnitId: params.businessUnitId ? Number(params.businessUnitId) : undefined
        }));
    }
    parseDates(params) {
        return {
            ...params,
            startDate: new Date(params.startDate),
            endDate: new Date(params.endDate)
        };
    }
    async handleReport(res, params, defaultExt, generator) {
        const buffer = await generator();
        const extension = params.format === 'PDF' ? 'pdf' : defaultExt;
        const filename = `report-${Date.now()}.${extension}`;
        const contentType = params.format === 'PDF'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length
        });
        res.send(buffer);
    }
};
exports.LaporanController = LaporanController;
__decorate([
    (0, common_1.Post)('simpanan/rekap'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "simpananRekap", null);
__decorate([
    (0, common_1.Post)('simpanan/tabrela'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "tabrelaRekap", null);
__decorate([
    (0, common_1.Post)('simpanan/brahmacari'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "brahmacariRekap", null);
__decorate([
    (0, common_1.Post)('simpanan/balimesari'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "balimesariRekap", null);
__decorate([
    (0, common_1.Post)('simpanan/wanaprasta'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "wanaprastaRekap", null);
__decorate([
    (0, common_1.Post)('simpanan/deposito'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "depositoRekap", null);
__decorate([
    (0, common_1.Post)('simpanan/mutasi'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "mutasiSimpanan", null);
__decorate([
    (0, common_1.Post)('simpanan/daftar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "daftarRekening", null);
__decorate([
    (0, common_1.Post)('akuntansi/neraca'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "neraca", null);
__decorate([
    (0, common_1.Post)('akuntansi/labarugi'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaporanController.prototype, "labaRugi", null);
exports.LaporanController = LaporanController = __decorate([
    (0, common_1.Controller)('accounting/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [laporan_service_1.LaporanService])
], LaporanController);
//# sourceMappingURL=laporan.controller.js.map