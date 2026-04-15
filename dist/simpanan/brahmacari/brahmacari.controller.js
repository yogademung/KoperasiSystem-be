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
exports.BrahmacariController = void 0;
const common_1 = require("@nestjs/common");
const brahmacari_service_1 = require("./brahmacari.service");
const create_brahmacari_dto_1 = require("./dto/create-brahmacari.dto");
const transaction_dto_1 = require("./dto/transaction.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let BrahmacariController = class BrahmacariController {
    brahmacariService;
    constructor(brahmacariService) {
        this.brahmacariService = brahmacariService;
    }
    create(createDto, req) {
        const userId = req.user?.id || 1;
        return this.brahmacariService.create(createDto);
    }
    findAll() {
        return this.brahmacariService.findAll();
    }
    findOne(noBrahmacari) {
        return this.brahmacariService.findOne(noBrahmacari);
    }
    setoran(noBrahmacari, dto, req) {
        const userId = req.user?.id || 1;
        return this.brahmacariService.setoran(noBrahmacari, dto, userId);
    }
    penarikan(noBrahmacari, dto, req) {
        const userId = req.user?.id || 1;
        return this.brahmacariService.penarikan(noBrahmacari, dto, userId);
    }
    getTransactions(noBrahmacari, page = '1', limit = '10') {
        return this.brahmacariService.getTransactions(noBrahmacari, parseInt(page), parseInt(limit));
    }
    close(noBrahmacari, body, req) {
        const userId = req.user?.id || 1;
        return this.brahmacariService.closeAccount(noBrahmacari, body, userId);
    }
};
exports.BrahmacariController = BrahmacariController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_brahmacari_dto_1.CreateBrahmacariDto, Object]),
    __metadata("design:returntype", void 0)
], BrahmacariController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BrahmacariController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':noBrahmacari'),
    __param(0, (0, common_1.Param)('noBrahmacari')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrahmacariController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':noBrahmacari/setoran'),
    __param(0, (0, common_1.Param)('noBrahmacari')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.BrahmacariTransactionDto, Object]),
    __metadata("design:returntype", void 0)
], BrahmacariController.prototype, "setoran", null);
__decorate([
    (0, common_1.Post)(':noBrahmacari/penarikan'),
    __param(0, (0, common_1.Param)('noBrahmacari')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.BrahmacariTransactionDto, Object]),
    __metadata("design:returntype", void 0)
], BrahmacariController.prototype, "penarikan", null);
__decorate([
    (0, common_1.Get)(':noBrahmacari/transactions'),
    __param(0, (0, common_1.Param)('noBrahmacari')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BrahmacariController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)(':noBrahmacari/tutup'),
    __param(0, (0, common_1.Param)('noBrahmacari')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], BrahmacariController.prototype, "close", null);
exports.BrahmacariController = BrahmacariController = __decorate([
    (0, common_1.Controller)('api/simpanan/brahmacari'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [brahmacari_service_1.BrahmacariService])
], BrahmacariController);
//# sourceMappingURL=brahmacari.controller.js.map