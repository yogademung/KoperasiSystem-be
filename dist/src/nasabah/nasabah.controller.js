"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NasabahController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = __importStar(require("fs-extra"));
const sharp_1 = __importDefault(require("sharp"));
const nasabah_service_1 = require("./nasabah.service");
const create_nasabah_dto_1 = require("./dto/create-nasabah.dto");
const update_nasabah_dto_1 = require("./dto/update-nasabah.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const UPLOAD_DIR = './uploads/nasabah';
fs.ensureDirSync(UPLOAD_DIR);
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
    async processAndSaveFile(file, timestamp) {
        if (!file)
            return null;
        console.log('Processing file:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            timestamp
        });
        const ext = (0, path_1.extname)(file.originalname).toLowerCase();
        const filename = `${file.fieldname}_${timestamp}${ext}`;
        const filePath = (0, path_1.join)(UPLOAD_DIR, filename);
        try {
            if (file.mimetype === 'application/pdf') {
                console.log('Saving PDF file directly without compression');
                await fs.writeFile(filePath, file.buffer);
                return `/uploads/nasabah/${filename}`;
            }
            console.log('Compressing image with sharp, preserving format');
            const isPng = file.mimetype === 'image/png';
            const sharpInstance = (0, sharp_1.default)(file.buffer)
                .resize({ width: 1024, withoutEnlargement: true });
            if (isPng) {
                await sharpInstance
                    .png({ quality: 80, compressionLevel: 8 })
                    .toFile(filePath);
            }
            else {
                await sharpInstance
                    .jpeg({ quality: 80 })
                    .toFile(filePath);
            }
            const stats = await fs.stat(filePath);
            console.log(`File saved successfully: ${filename}, format: ${isPng ? 'PNG' : 'JPEG'}, size: ${stats.size} bytes`);
            return `/uploads/nasabah/${filename}`;
        }
        catch (error) {
            console.error('File processing error:', {
                filename: file.originalname,
                mimetype: file.mimetype,
                error: error.message,
                stack: error.stack
            });
            throw new common_1.BadRequestException(`Gagal memproses file: ${error.message}`);
        }
    }
    async create(files, createNasabahDto) {
        console.log('Received Create Payload:', createNasabahDto);
        console.log('Received Files:', files);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
        const fileKtpPath = files?.fileKtp?.[0] ? await this.processAndSaveFile(files.fileKtp[0], timestamp) : null;
        const fileKkPath = files?.fileKk?.[0] ? await this.processAndSaveFile(files.fileKk[0], timestamp) : null;
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
    getPortfolio(id) {
        return this.nasabahService.getPortfolio(+id);
    }
    async update(id, updateNasabahDto, files) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
        const fileKtpPath = files?.fileKtp?.[0] ? await this.processAndSaveFile(files.fileKtp[0], timestamp) : undefined;
        const fileKkPath = files?.fileKk?.[0] ? await this.processAndSaveFile(files.fileKk[0], timestamp) : undefined;
        const updateData = { ...updateNasabahDto };
        if (fileKtpPath)
            updateData.fileKtp = fileKtpPath;
        if (fileKkPath)
            updateData.fileKk = fileKkPath;
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === 'null' || updateData[key] === 'undefined' || updateData[key] === '') {
                updateData[key] = null;
            }
        });
        if (updateData.tanggalLahir) {
            updateData.tanggalLahir = new Date(updateData.tanggalLahir);
        }
        return this.nasabahService.update(+id, updateData);
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
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: fileFilter,
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_nasabah_dto_1.CreateNasabahDto]),
    __metadata("design:returntype", Promise)
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
    (0, common_1.Get)(':id/portfolio'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NasabahController.prototype, "getPortfolio", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'fileKtp', maxCount: 1 },
        { name: 'fileKk', maxCount: 1 },
    ], {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: fileFilter,
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_nasabah_dto_1.UpdateNasabahDto, Object]),
    __metadata("design:returntype", Promise)
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