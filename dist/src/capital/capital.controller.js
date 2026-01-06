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
exports.CapitalController = void 0;
const common_1 = require("@nestjs/common");
const capital_service_1 = require("./capital.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_modal_dto_1 = require("./dto/create-modal.dto");
const trans_modal_dto_1 = require("./dto/trans-modal.dto");
const create_loan_dto_1 = require("./dto/create-loan.dto");
const repay_loan_dto_1 = require("./dto/repay-loan.dto");
let CapitalController = class CapitalController {
    capitalService;
    constructor(capitalService) {
        this.capitalService = capitalService;
    }
    createModal(dto, req) {
        return this.capitalService.createNasabahModal(dto, req.user.userId || req.user.id);
    }
    findAllModal() {
        return this.capitalService.findAllNasabahModal();
    }
    findOneModal(id) {
        return this.capitalService.findOneNasabahModal(id);
    }
    addTransaction(id, dto, req) {
        return this.capitalService.addModalTransaction(id, dto, req.user.userId || req.user.id);
    }
    createLoan(dto, req) {
        return this.capitalService.createExternalLoan(dto, req.user.userId || req.user.id);
    }
    findAllLoans() {
        return this.capitalService.findAllExternalLoans();
    }
    findOneLoan(id) {
        return this.capitalService.findOneExternalLoan(+id);
    }
    repayLoan(id, dto, req) {
        return this.capitalService.repayExternalLoan(+id, dto, req.user.userId || req.user.id);
    }
};
exports.CapitalController = CapitalController;
__decorate([
    (0, common_1.Post)('members'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_modal_dto_1.CreateModalDto, Object]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "createModal", null);
__decorate([
    (0, common_1.Get)('members'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "findAllModal", null);
__decorate([
    (0, common_1.Get)('members/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "findOneModal", null);
__decorate([
    (0, common_1.Post)('members/:id/transaction'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, trans_modal_dto_1.TransModalDto, Object]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "addTransaction", null);
__decorate([
    (0, common_1.Post)('loans'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_loan_dto_1.CreateExternalLoanDto, Object]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "createLoan", null);
__decorate([
    (0, common_1.Get)('loans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "findAllLoans", null);
__decorate([
    (0, common_1.Get)('loans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "findOneLoan", null);
__decorate([
    (0, common_1.Post)('loans/:id/repayment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, repay_loan_dto_1.RepayExternalLoanDto, Object]),
    __metadata("design:returntype", void 0)
], CapitalController.prototype, "repayLoan", null);
exports.CapitalController = CapitalController = __decorate([
    (0, common_1.Controller)('api/capital'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [capital_service_1.CapitalService])
], CapitalController);
//# sourceMappingURL=capital.controller.js.map