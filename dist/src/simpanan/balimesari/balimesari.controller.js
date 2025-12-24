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
exports.BalimesariController = void 0;
const common_1 = require("@nestjs/common");
const balimesari_service_1 = require("./balimesari.service");
const create_balimesari_dto_1 = require("./dto/create-balimesari.dto");
const transaction_dto_1 = require("./dto/transaction.dto");
let BalimesariController = class BalimesariController {
    balimesariService;
    constructor(balimesariService) {
        this.balimesariService = balimesariService;
    }
    create(createDto) {
        return this.balimesariService.create(createDto);
    }
    findAll() {
        return this.balimesariService.findAll();
    }
    findOne(noBalimesari) {
        return this.balimesariService.findOne(noBalimesari);
    }
    setoran(noBalimesari, dto) {
        return this.balimesariService.setoran(noBalimesari, dto);
    }
    penarikan(noBalimesari, dto) {
        return this.balimesariService.penarikan(noBalimesari, dto);
    }
    getTransactions(noBalimesari, page = '1', limit = '10') {
        return this.balimesariService.getTransactions(noBalimesari, parseInt(page), parseInt(limit));
    }
    close(noBalimesari, body) {
        return this.balimesariService.closeAccount(noBalimesari, body);
    }
};
exports.BalimesariController = BalimesariController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_balimesari_dto_1.CreateBalimesariDto]),
    __metadata("design:returntype", void 0)
], BalimesariController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BalimesariController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':noBalimesari'),
    __param(0, (0, common_1.Param)('noBalimesari')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BalimesariController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':noBalimesari/setoran'),
    __param(0, (0, common_1.Param)('noBalimesari')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.BalimesariTransactionDto]),
    __metadata("design:returntype", void 0)
], BalimesariController.prototype, "setoran", null);
__decorate([
    (0, common_1.Post)(':noBalimesari/penarikan'),
    __param(0, (0, common_1.Param)('noBalimesari')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.BalimesariTransactionDto]),
    __metadata("design:returntype", void 0)
], BalimesariController.prototype, "penarikan", null);
__decorate([
    (0, common_1.Get)(':noBalimesari/transactions'),
    __param(0, (0, common_1.Param)('noBalimesari')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BalimesariController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)(':noBalimesari/tutup'),
    __param(0, (0, common_1.Param)('noBalimesari')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BalimesariController.prototype, "close", null);
exports.BalimesariController = BalimesariController = __decorate([
    (0, common_1.Controller)('api/simpanan/balimesari'),
    __metadata("design:paramtypes", [balimesari_service_1.BalimesariService])
], BalimesariController);
//# sourceMappingURL=balimesari.controller.js.map