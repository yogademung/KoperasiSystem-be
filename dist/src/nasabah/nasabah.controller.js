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
exports.NasabahController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const nasabah_service_1 = require("./nasabah.service");
const create_nasabah_dto_1 = require("./dto/create-nasabah.dto");
const update_nasabah_dto_1 = require("./dto/update-nasabah.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const fileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return callback(new common_1.BadRequestException('Only image or PDF files are allowed!'), false);
    }
    callback(null, true);
};
let NasabahController = class NasabahController {
    nasabahService;
    constructor(nasabahService) {
        this.nasabahService = nasabahService;
    }
    create(files, createNasabahDto) {
        console.log('Received Create Payload:', createNasabahDto);
        console.log('Received Files:', files);
        const fileKtpPath = files?.fileKtp?.[0]?.path;
        const fileKkPath = files?.fileKk?.[0]?.path;
        const nasabahData = { ...createNasabahDto };
        Object.keys(nasabahData).forEach(key => {
            if (nasabahData[key] === 'null' || nasabahData[key] === 'undefined' || nasabahData[key] === '') {
                nasabahData[key] = null;
            }
        });
        if (nasabahData.tanggalLahir) {
            nasabahData.tanggalLahir = new Date(nasabahData.tanggalLahir);
        }
        return this.nasabahService.create({
            ...nasabahData,
            fileKtp: fileKtpPath,
            fileKk: fileKkPath
        }).catch(err => {
            console.error('Error creating nasabah:', err);
            if (err.code === 'P2002') {
                throw new common_1.BadRequestException('NIK already exists (Data duplikat)');
            }
            throw new common_1.BadRequestException(err.message || 'Gagal menyimpan data nasabah');
        });
    }
    findAll() {
        return this.nasabahService.findAll();
    }
    findOne(id) {
        return this.nasabahService.findOne(+id);
    }
    update(id, updateNasabahDto) {
        return this.nasabahService.update(+id, updateNasabahDto);
    }
    remove(id) {
        return this.nasabahService.remove(+id);
    }
};
exports.NasabahController = NasabahController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'fileKtp', maxCount: 1 },
        { name: 'fileKk', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/nasabah',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: fileFilter,
        limits: { fileSize: 2000000 },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_nasabah_dto_1.CreateNasabahDto]),
    __metadata("design:returntype", void 0)
], NasabahController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NasabahController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NasabahController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_nasabah_dto_1.UpdateNasabahDto]),
    __metadata("design:returntype", void 0)
], NasabahController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'kepala_koperasi'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NasabahController.prototype, "remove", null);
exports.NasabahController = NasabahController = __decorate([
    (0, common_1.Controller)('api/nasabah'),
    __metadata("design:paramtypes", [nasabah_service_1.NasabahService])
], NasabahController);
//# sourceMappingURL=nasabah.controller.js.map