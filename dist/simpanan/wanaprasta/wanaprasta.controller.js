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
exports.WanaprastaController = void 0;
const common_1 = require("@nestjs/common");
const wanaprasta_service_1 = require("./wanaprasta.service");
const create_wanaprasta_dto_1 = require("./dto/create-wanaprasta.dto");
const transaction_dto_1 = require("./dto/transaction.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let WanaprastaController = class WanaprastaController {
    wanaprastaService;
    constructor(wanaprastaService) {
        this.wanaprastaService = wanaprastaService;
    }
    create(createDto, req) {
        const userId = req.user?.id || 1;
        return this.wanaprastaService.create(createDto);
    }
    findAll() {
        return this.wanaprastaService.findAll();
    }
    findOne(noWanaprasta) {
        return this.wanaprastaService.findOne(noWanaprasta);
    }
    setoran(noWanaprasta, dto, req) {
        const userId = req.user?.id || 1;
        return this.wanaprastaService.setoran(noWanaprasta, dto, userId);
    }
    penarikan(noWanaprasta, dto, req) {
        const userId = req.user?.id || 1;
        return this.wanaprastaService.penarikan(noWanaprasta, dto, userId);
    }
    getTransactions(noWanaprasta, page = '1', limit = '10') {
        return this.wanaprastaService.getTransactions(noWanaprasta, parseInt(page), parseInt(limit));
    }
    close(noWanaprasta, body, req) {
        const userId = req.user?.id || 1;
        return this.wanaprastaService.closeAccount(noWanaprasta, body, userId);
    }
};
exports.WanaprastaController = WanaprastaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wanaprasta_dto_1.CreateWanaprastaDto, Object]),
    __metadata("design:returntype", void 0)
], WanaprastaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WanaprastaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':noWanaprasta'),
    __param(0, (0, common_1.Param)('noWanaprasta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WanaprastaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':noWanaprasta/setoran'),
    __param(0, (0, common_1.Param)('noWanaprasta')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.WanaprastaTransactionDto, Object]),
    __metadata("design:returntype", void 0)
], WanaprastaController.prototype, "setoran", null);
__decorate([
    (0, common_1.Post)(':noWanaprasta/penarikan'),
    __param(0, (0, common_1.Param)('noWanaprasta')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.WanaprastaTransactionDto, Object]),
    __metadata("design:returntype", void 0)
], WanaprastaController.prototype, "penarikan", null);
__decorate([
    (0, common_1.Get)(':noWanaprasta/transactions'),
    __param(0, (0, common_1.Param)('noWanaprasta')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WanaprastaController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)(':noWanaprasta/tutup'),
    __param(0, (0, common_1.Param)('noWanaprasta')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WanaprastaController.prototype, "close", null);
exports.WanaprastaController = WanaprastaController = __decorate([
    (0, common_1.Controller)('api/simpanan/wanaprasta'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [wanaprasta_service_1.WanaprastaService])
], WanaprastaController);
//# sourceMappingURL=wanaprasta.controller.js.map