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
exports.MigrationController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const migration_service_1 = require("./migration.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let MigrationController = class MigrationController {
    migrationService;
    constructor(migrationService) {
        this.migrationService = migrationService;
    }
    async downloadJournalTemplate(res) {
        const buffer = await this.migrationService.generateJournalTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_jurnal.xlsx');
        res.send(buffer);
    }
    async uploadJournal(file, journalDate, req) {
        if (!file) {
            throw new common_1.HttpException('File is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!journalDate) {
            throw new common_1.HttpException('Journal date is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.HttpException('User ID not found in request', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.migrationService.uploadJournal(file.buffer, journalDate, userId);
    }
    async previewJournal(file, journalDate, redenominate) {
        if (!file) {
            throw new common_1.HttpException('File is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!journalDate) {
            throw new common_1.HttpException('Journal date is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.previewJournal(file.buffer, journalDate, redenominate === 'true');
    }
    async confirmJournal(body, req) {
        if (!body.data || body.data.length === 0) {
            throw new common_1.HttpException('No data provided', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!body.journalDate) {
            throw new common_1.HttpException('Journal date is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.HttpException('User ID not found in request', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.migrationService.confirmJournal(body.data, body.journalDate, userId);
    }
    async downloadNasabahTemplate(res) {
        const buffer = await this.migrationService.generateNasabahTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_nasabah.xlsx');
        res.send(buffer);
    }
    async previewNasabah(file) {
        if (!file) {
            throw new common_1.HttpException('File is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.previewNasabah(file.buffer);
    }
    async confirmNasabah(body) {
        if (!body.data || body.data.length === 0) {
            throw new common_1.HttpException('No data provided', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.confirmNasabah(body.data);
    }
    async uploadNasabah(file) {
        console.log('📥 Controller received file:', {
            fieldname: file?.fieldname,
            originalname: file?.originalname,
            mimetype: file?.mimetype,
            size: file?.size,
            bufferType: typeof file?.buffer,
            hasBuffer: !!file?.buffer
        });
        if (!file) {
            throw new common_1.HttpException('File is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.uploadNasabah(file.buffer);
    }
    async downloadAnggotaTransactionTemplate(res) {
        const buffer = await this.migrationService.generateAnggotaTransactionTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_transaksi_anggota.xlsx');
        res.send(buffer);
    }
    async uploadAnggotaTransaction(file) {
        if (!file) {
            throw new common_1.HttpException('File is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.uploadAnggotaTransaction(file.buffer);
    }
    async previewAnggota(file, redenominate) {
        if (!file) {
            throw new common_1.HttpException('File is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.previewAnggota(file.buffer, redenominate === 'true');
    }
    async confirmAnggota(body) {
        if (!body.data || body.data.length === 0) {
            throw new common_1.HttpException('No data provided', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.confirmAnggota(body.data);
    }
    async downloadCoaTemplate(res) {
        const buffer = await this.migrationService.generateCoaTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_coa.xlsx');
        res.send(buffer);
    }
    async previewCoa(file, sheetMode) {
        if (!file) {
            throw new common_1.HttpException('File is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.previewCoa(file.buffer, sheetMode);
    }
    async confirmCoa(body) {
        if (!body.data || body.data.length === 0) {
            throw new common_1.HttpException('No data provided', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.migrationService.confirmCoa(body.data);
    }
};
exports.MigrationController = MigrationController;
__decorate([
    (0, common_1.Get)('journal-template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "downloadJournalTemplate", null);
__decorate([
    (0, common_1.Post)('upload-journal'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('journalDate')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "uploadJournal", null);
__decorate([
    (0, common_1.Post)('preview-journal'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('journalDate')),
    __param(2, (0, common_1.Body)('redenominate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "previewJournal", null);
__decorate([
    (0, common_1.Post)('confirm-journal'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "confirmJournal", null);
__decorate([
    (0, common_1.Get)('nasabah-template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "downloadNasabahTemplate", null);
__decorate([
    (0, common_1.Post)('preview-nasabah'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "previewNasabah", null);
__decorate([
    (0, common_1.Post)('confirm-nasabah'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "confirmNasabah", null);
__decorate([
    (0, common_1.Post)('upload-nasabah'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "uploadNasabah", null);
__decorate([
    (0, common_1.Get)('anggota-transaction-template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "downloadAnggotaTransactionTemplate", null);
__decorate([
    (0, common_1.Post)('upload-anggota-transaction'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "uploadAnggotaTransaction", null);
__decorate([
    (0, common_1.Post)('preview-anggota'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('redenominate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "previewAnggota", null);
__decorate([
    (0, common_1.Post)('confirm-anggota'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "confirmAnggota", null);
__decorate([
    (0, common_1.Get)('coa-template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "downloadCoaTemplate", null);
__decorate([
    (0, common_1.Post)('preview-coa'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('sheetMode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "previewCoa", null);
__decorate([
    (0, common_1.Post)('confirm-coa'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "confirmCoa", null);
exports.MigrationController = MigrationController = __decorate([
    (0, common_1.Controller)('migration'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [migration_service_1.MigrationService])
], MigrationController);
//# sourceMappingURL=migration.controller.js.map