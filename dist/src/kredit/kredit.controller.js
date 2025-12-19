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
exports.KreditController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = __importStar(require("fs-extra"));
const sharp_1 = __importDefault(require("sharp"));
const kredit_service_1 = require("./kredit.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const UPLOAD_DIR = './uploads/collateral';
fs.ensureDirSync(UPLOAD_DIR);
const fileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return callback(new common_1.BadRequestException('Only image or PDF files are allowed!'), false);
    }
    callback(null, true);
};
let KreditController = class KreditController {
    kreditService;
    constructor(kreditService) {
        this.kreditService = kreditService;
    }
    createApplication(user, data) {
        return this.kreditService.createApplication(data, user.id);
    }
    findAll(page = '1', limit = '10', status) {
        return this.kreditService.findAll(+page, +limit, status);
    }
    findOne(id) {
        return this.kreditService.findOne(+id);
    }
    async addCollateral(id, user, data, files) {
        try {
            console.log('=== COLLATERAL UPLOAD DEBUG ===');
            console.log('Payload:', JSON.stringify(data));
            console.log('Files object:', files);
            console.log('Files.photos:', files?.photos);
            console.log('Photos count:', files?.photos?.length || 0);
            if (files?.photos && files.photos.length > 0) {
                console.log('First file details:', {
                    originalname: files.photos[0].originalname,
                    mimetype: files.photos[0].mimetype,
                    size: files.photos[0].size
                });
            }
            else {
                console.warn('⚠️ NO FILES RECEIVED - Check frontend FormData field name must be "photos"');
            }
            let creditCode = `CREDIT_${id}`;
            try {
                const credit = await this.kreditService.findOne(+id);
                creditCode = credit.nomorKredit || credit.noPermohonan || `REQ_${id}`;
                creditCode = creditCode.replace(/[^a-zA-Z0-9]/g, '_');
            }
            catch (e) {
                console.warn('Could not fetch credit for naming, using ID');
            }
            const photoPaths = [];
            if (files?.photos) {
                const absoluteUploadDir = (0, path_1.join)(process.cwd(), 'uploads', 'collateral');
                await fs.ensureDir(absoluteUploadDir);
                console.log(`Upload directory: ${absoluteUploadDir}`);
                for (const [index, file] of files.photos.entries()) {
                    try {
                        const ext = (0, path_1.extname)(file.originalname).toLowerCase();
                        const timestamp = new Date().getTime();
                        const filename = `${creditCode}_col_${timestamp}_${index}${ext}`;
                        const filePath = (0, path_1.join)(absoluteUploadDir, filename);
                        console.log(`Saving file: ${filePath}`);
                        if (file.mimetype === 'application/pdf') {
                            await fs.writeFile(filePath, file.buffer);
                            console.log(`PDF saved successfully`);
                        }
                        else {
                            try {
                                const pipeline = (0, sharp_1.default)(file.buffer).resize({ width: 1024, withoutEnlargement: true });
                                if (file.mimetype === 'image/png') {
                                    await pipeline.png({ quality: 80 }).toFile(filePath);
                                }
                                else {
                                    await pipeline.jpeg({ quality: 75 }).toFile(filePath);
                                }
                                console.log(`Image processed and saved`);
                            }
                            catch (sharpError) {
                                console.warn(`Sharp failed, using raw write:`, sharpError.message);
                                await fs.writeFile(filePath, file.buffer);
                                console.log(`Raw file saved`);
                            }
                        }
                        const exists = await fs.pathExists(filePath);
                        console.log(`File exists: ${exists}`);
                        photoPaths.push(`/uploads/collateral/${filename}`);
                    }
                    catch (error) {
                        console.error(`Failed to process photo [${file.originalname}]:`, error);
                    }
                }
            }
            const nasabahId = parseInt(data.nasabahId);
            if (isNaN(nasabahId))
                throw new common_1.BadRequestException('Invalid Nasabah ID');
            const marketValue = data.marketValue ? data.marketValue.toString() : '0';
            const assessedValue = data.assessedValue ? data.assessedValue.toString() : '0';
            const payload = {
                ...data,
                nasabahId: nasabahId,
                marketValue: marketValue,
                assessedValue: assessedValue,
                details: data.details ? JSON.parse(data.details) : undefined,
                photos: JSON.stringify(photoPaths)
            };
            return await this.kreditService.addCollateral(+id, payload, user.id);
        }
        catch (error) {
            console.error('Add Collateral Error:', error);
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException(`Internal Error: ${error.message}`);
        }
    }
    submitAnalysis(id, user, data) {
        return this.kreditService.submitAnalysis(+id, data, user.id);
    }
    approve(id, user, decision) {
        return this.kreditService.approveCredit(+id, decision, user.id);
    }
    activate(id, user, data) {
        return this.kreditService.activateCredit(+id, data, user.id);
    }
    payInstallment(id, user, data) {
        return this.kreditService.payInstallment(+id, data, user.id);
    }
};
exports.KreditController = KreditController;
__decorate([
    (0, common_1.Post)('permohonan'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KreditController.prototype, "createApplication", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], KreditController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KreditController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/collateral'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'photos', maxCount: 1 },
    ], {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: fileFilter,
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], KreditController.prototype, "addCollateral", null);
__decorate([
    (0, common_1.Post)(':id/analysis'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], KreditController.prototype, "submitAnalysis", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], KreditController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], KreditController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], KreditController.prototype, "payInstallment", null);
exports.KreditController = KreditController = __decorate([
    (0, common_1.Controller)('api/kredit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [kredit_service_1.KreditService])
], KreditController);
//# sourceMappingURL=kredit.controller.js.map