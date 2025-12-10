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
exports.AnggotaController = void 0;
const common_1 = require("@nestjs/common");
const anggota_service_1 = require("./anggota.service");
const create_anggota_dto_1 = require("./dto/create-anggota.dto");
const setoran_dto_1 = require("./dto/setoran.dto");
let AnggotaController = class AnggotaController {
    anggotaService;
    constructor(anggotaService) {
        this.anggotaService = anggotaService;
    }
    async create(dto, req) {
        const userId = req.user?.id || 1;
        return this.anggotaService.create(dto, userId);
    }
    async findAll() {
        return this.anggotaService.findAll();
    }
    async findOne(accountNumber) {
        return this.anggotaService.findOne(accountNumber);
    }
    async setoran(accountNumber, dto, req) {
        const userId = req.user?.id || 1;
        return this.anggotaService.setoran(accountNumber, dto, userId);
    }
    async penarikan(accountNumber, dto, req) {
        const userId = req.user?.id || 1;
        return this.anggotaService.penarikan(accountNumber, dto, userId);
    }
    async getTransactions(accountNumber, page = 1, limit = 10) {
        return this.anggotaService.getTransactions(accountNumber, page, limit);
    }
};
exports.AnggotaController = AnggotaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_anggota_dto_1.CreateAnggotaDto, Object]),
    __metadata("design:returntype", Promise)
], AnggotaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnggotaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':accountNumber'),
    __param(0, (0, common_1.Param)('accountNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnggotaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':accountNumber/setoran'),
    __param(0, (0, common_1.Param)('accountNumber')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, setoran_dto_1.SetoranDto, Object]),
    __metadata("design:returntype", Promise)
], AnggotaController.prototype, "setoran", null);
__decorate([
    (0, common_1.Post)(':accountNumber/penarikan'),
    __param(0, (0, common_1.Param)('accountNumber')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, setoran_dto_1.SetoranDto, Object]),
    __metadata("design:returntype", Promise)
], AnggotaController.prototype, "penarikan", null);
__decorate([
    (0, common_1.Get)(':accountNumber/transactions'),
    __param(0, (0, common_1.Param)('accountNumber')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AnggotaController.prototype, "getTransactions", null);
exports.AnggotaController = AnggotaController = __decorate([
    (0, common_1.Controller)('api/simpanan/anggota'),
    __metadata("design:paramtypes", [anggota_service_1.AnggotaService])
], AnggotaController);
//# sourceMappingURL=anggota.controller.js.map