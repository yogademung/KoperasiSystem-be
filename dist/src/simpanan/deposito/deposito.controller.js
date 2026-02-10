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
exports.DepositoController = void 0;
const common_1 = require("@nestjs/common");
const deposito_service_1 = require("./deposito.service");
const create_deposito_dto_1 = require("./dto/create-deposito.dto");
const simpanan_interest_service_1 = require("../simpanan-interest.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let DepositoController = class DepositoController {
    depositoService;
    interestService;
    constructor(depositoService, interestService) {
        this.depositoService = depositoService;
        this.interestService = interestService;
    }
    async testInterest() {
        await this.interestService.forceRunAllInterest();
        return {
            message: 'Interest Scheduler Triggered for ALL Products (Forced)',
        };
    }
    async getSimulation(noJangka) {
        return this.interestService.simulateProcessing(noJangka);
    }
    findAll() {
        return this.depositoService.findAll();
    }
    findOne(noJangka) {
        return this.depositoService.findOne(noJangka);
    }
    create(createDto, req) {
        const userId = req.user?.id || 1;
        return this.depositoService.create(createDto, userId);
    }
    withdraw(noJangka, body, req) {
        const userId = req.user?.id || 1;
        return this.depositoService.withdraw(noJangka, userId, body);
    }
};
exports.DepositoController = DepositoController;
__decorate([
    (0, common_1.Post)('test-interest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DepositoController.prototype, "testInterest", null);
__decorate([
    (0, common_1.Get)(':noJangka/simulation'),
    __param(0, (0, common_1.Param)('noJangka')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepositoController.prototype, "getSimulation", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DepositoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':noJangka'),
    __param(0, (0, common_1.Param)('noJangka')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepositoController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_deposito_dto_1.CreateDepositoDto, Object]),
    __metadata("design:returntype", void 0)
], DepositoController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':noJangka/cair'),
    __param(0, (0, common_1.Param)('noJangka')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DepositoController.prototype, "withdraw", null);
exports.DepositoController = DepositoController = __decorate([
    (0, common_1.Controller)('api/simpanan/deposito'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [deposito_service_1.DepositoService,
        simpanan_interest_service_1.SimpananInterestService])
], DepositoController);
//# sourceMappingURL=deposito.controller.js.map